// ═══════════════════════════════════════════════════════════
// ☁️ PLANTTRACK V2 — services/sync.ts
// Sincronización del jardín localStorage ↔ Firestore.
//
// FILOSOFÍA LOCAL-FIRST (la app NUNCA depende de la nube):
//  • localStorage es la fuente de verdad inmediata → la app
//    funciona igual sin sesión, sin internet y sin Firebase.
//  • Firestore guarda una copia por planta para recuperar el
//    jardín en otro dispositivo o tras reinstalar.
//  • Las FOTOS (fotoDataUrl) NO se suben: quedan locales como
//    caché. Firestore guarda la ficha botánica completa.
//    Plan Spark gratis: sin Storage, sin costos.
//
// MECÁNICA (mismo patrón de sondeo probado con el token v1.0.2):
//  • Poll cada 2s del localStorage → si cambió y hay sesión,
//    push con debounce 2.5s (setDoc por planta + borrar caídas).
//  • Al iniciar sesión: pull + merge por planta (_mod gana).
//  • Escrituras propias del sync no re-disparan el push (flag).
// ═══════════════════════════════════════════════════════════

import type { PlantaGuardada } from '../types';
import { db, firebaseListo } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

export type EstadoSync = 'desconectado' | 'sincronizado' | 'sincronizando' | 'error';

const LS_JARDIN = 'planttrack.jardin';
const LS_NOTAS = 'planttrack.notas';
const INTERVALO_POLL = 2000;
const DEBOUNCE_PUSH = 2500;

// ── Estado interno del módulo ──
let uid: string | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let hashUltimoPush = '';
let escribiendoDesdeSync = false;
let estado: EstadoSync = 'desconectado';
let avisarUI: ((e: EstadoSync) => void) | null = null;

function ponerEstado(nuevo: EstadoSync): void {
  estado = nuevo;
  avisarUI?.(nuevo);
}

function leerJardinLocal(): PlantaGuardada[] {
  try {
    const crudo = localStorage.getItem(LS_JARDIN);
    if (crudo) return JSON.parse(crudo) as PlantaGuardada[];
  } catch { /* ok */ }
  return [];
}

function escribirJardinLocal(plantas: PlantaGuardada[]): void {
  escribiendoDesdeSync = true; // el poll debe ignorar esta escritura
  try {
    localStorage.setItem(LS_JARDIN, JSON.stringify(plantas));
  } finally {
    // se restaura en el siguiente tick para que el poll lo vea listo
    setTimeout(() => { escribiendoDesdeSync = false; }, 100);
  }
}

function hashJardin(plantas: PlantaGuardada[]): string {
  // fotoDataUrl excluida del hash: es caché local, no dato de sync
  const ligero = plantas.map(p => ({ id: p.id, mod: p._mod || '', r: (p.historialRiego || []).length, pr: p.proximoRiego }));
  return JSON.stringify(ligero);
}

// ── PULL + MERGE ─────────────────────────────────────────────
async function tirarYFusionar(): Promise<void> {
  if (!db || !uid) return;
  ponerEstado('sincronizando');
  try {
    const remota = await getDocs(collection(db, 'usuarios', uid, 'plantas'));
    const mapaRemoto = new Map<string, PlantaGuardada>();
    remota.forEach(d => { const p = d.data() as PlantaGuardada; if (p?.id) mapaRemoto.set(p.id, p); });

    const local = leerJardinLocal();
    const mapaLocal = new Map(local.map(p => [p.id, p]));
    const fusionadas: PlantaGuardada[] = [...local];
    let cambio = false;

    for (const [id, planta] of mapaRemoto) {
      const enLocal = mapaLocal.get(id);
      if (!enLocal) {
        // planta nueva que vino de la nube → conservar foto local no existe, dejar sin foto
        fusionadas.push(planta);
        cambio = true;
      } else if ((planta._mod || '') > (enLocal._mod || '')) {
        // la remota es más reciente → gana, pero conserva la foto local (cache)
        const fusion = { ...planta, fotoDataUrl: enLocal.fotoDataUrl || '' };
        const idx = fusionadas.findIndex(p => p.id === id);
        if (idx >= 0) fusionadas[idx] = fusion;
        cambio = true;
      }
    }

    if (cambio) escribirJardinLocal(fusionadas);
    hashUltimoPush = hashJardin(leerJardinLocal());
    ponerEstado('sincronizado');
  } catch (e) {
    console.warn('[PlantTrack] pull falló (offline?):', e);
    ponerEstado('error');
  }
}

// ── PUSH ─────────────────────────────────────────────────────
async function empujar(): Promise<void> {
  if (!db || !uid) return;
  ponerEstado('sincronizando');
  try {
    const local = leerJardinLocal();
    const ahora = new Date().toISOString();
    // sello _mod a lo que cambia (lo demás mantiene el suyo)
    const sellado = local.map(p => ({ ...p, _mod: p._mod || ahora }));
    const ids = new Set(sellado.map(p => p.id));

    const batch = writeBatch(db);
    for (const planta of sellado) {
      const { fotoDataUrl: _fuera, ...sinFoto } = planta;
      batch.set(doc(db, 'usuarios', uid, 'plantas', planta.id), sinFoto, { merge: true });
    }
    await batch.commit();

    // borrar en la nube las que ya no están localmente
    const remota = await getDocs(collection(db, 'usuarios', uid, 'plantas'));
    const borrar: Promise<void>[] = [];
    remota.forEach(d => { if (!ids.has(d.id)) borrar.push(deleteDoc(d.ref)); });
    if (borrar.length) await Promise.all(borrar);

    // notas: un solo doc por usuario (texto liviano)
    const notas = localStorage.getItem(LS_NOTAS) || '{}';
    await setDoc(doc(db, 'usuarios', uid, 'estado', 'notas'), { mapa: JSON.parse(notas) });

    escribirJardinLocal(sellado); // persiste el _mod asignado
    hashUltimoPush = hashJardin(sellado);
    ponerEstado('sincronizado');
  } catch (e) {
    console.warn('[PlantTrack] push falló (offline?):', e);
    ponerEstado('error');
  }
}

// ── API pública ──────────────────────────────────────────────

/** Activa la sincronización para una sesión. Hace pull inicial. */
export function iniciarSincronizacion(idUsuario: string): void {
  if (!firebaseListo() || !db) return;
  detenerSincronizacion();
  uid = idUsuario;
  hashUltimoPush = hashJardin(leerJardinLocal());

  void tirarYFusionar();

  timer = setInterval(() => {
    if (!uid || escribiendoDesdeSync) return;
    const actual = hashJardin(leerJardinLocal());
    if (actual !== hashUltimoPush) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => { debounceTimer = null; void empujar(); }, DEBOUNCE_PUSH);
    }
  }, INTERVALO_POLL);
}

/** Detiene la sincronización (al cerrar sesión o desmontar). */
export function detenerSincronizacion(): void {
  if (timer) { clearInterval(timer); timer = null; }
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
  uid = null;
  hashUltimoPush = '';
  ponerEstado('desconectado');
}

/** Estado actual del sync (para indicadores en UI). */
export function estadoSync(): EstadoSync {
  return estado;
}

/** Suscribe la UI a cambios de estado. Devuelve unsubscribe. */
export function observarSync(callback: (e: EstadoSync) => void): () => void {
  avisarUI = callback;
  callback(estado);
  return () => { avisarUI = null; };
}

/** Fuerza un push inmediato (ej. al cerrar la app). */
export function forzarPush(): void {
  if (uid) void empujar();
}
