// ═══════════════════════════════════════════════════════════
// 🏆 PLANTTRACK V2 — services/logros.ts
// Gamificación: XP, niveles, logros y racha de cuidado.
// Persistencia en localStorage (clave única 'planttrack.progreso').
// ═══════════════════════════════════════════════════════════

import type { PlantaGuardada, ProgresoJardinero, Logro, ContextoLogros } from '../types';
import { TOTAL_LECCIONES } from '../data/lecciones';

const LS_PROGRESO = 'planttrack.progreso';

function hoy(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function vacio(): ProgresoJardinero {
  return {
    xp: 0,
    riegosTotales: 0,
    fechasActividad: [],
    leccionesCompletadas: [],
    logrosDesbloqueados: [],
    recordRacha: 0,
  };
}

export function leerProgreso(): ProgresoJardinero {
  try {
    const crudo = localStorage.getItem(LS_PROGRESO);
    if (crudo) return { ...vacio(), ...JSON.parse(crudo) };
  } catch { /* corrupto → vacío */ }
  return vacio();
}

export function escribirProgreso(p: ProgresoJardinero): void {
  try { localStorage.setItem(LS_PROGRESO, JSON.stringify(p)); } catch { /* lleno */ }
}

// ── Actividad y racha ────────────────────────────────────────

/** Registra una acción de cuidado HOY (riego, abono, foto…).
 *  Suma XP y actualiza la racha. Devuelve XP ganado. */
export function registrarActividad(xp = 10): void {
  const p = leerProgreso();
  p.xp += xp;
  const f = hoy();
  if (!p.fechasActividad.includes(f)) {
    p.fechasActividad.push(f);
    // podar a 120 días para no crecer infinito
    p.fechasActividad = p.fechasActividad.slice(-120);
  }
  escribirProgreso(p);
}

/** Registra que se completó un riego (para contador + logros). */
export function registrarRiegoCompletado(): void {
  const p = leerProgreso();
  p.riegosTotales += 1;
  p.xp += 10;
  const f = hoy();
  if (!p.fechasActividad.includes(f)) p.fechasActividad.push(f);
  escribirProgreso(p);
}

/** Racha actual: días consecutivos con actividad (hoy o ayer cuenta). */
export function calcularRacha(): number {
  const p = leerProgreso();
  if (p.fechasActividad.length === 0) return 0;
  const fechas = new Set(p.fechasActividad);
  const dia = 86400000;
  const aMidnight = (f: string) => new Date(f + 'T00:00:00').getTime();

  // si hoy no hay actividad, la racha puede seguir viva si hubo ayer
  let inicio = aMidnight(hoy());
  if (!fechas.has(hoy())) {
    const ayer = new Date(Date.now() - dia).toISOString().slice(0, 10);
    if (!fechas.has(ayer)) return 0;
    inicio = aMidnight(ayer);
  }

  let racha = 0;
  let cursor = inicio;
  while (fechas.has(new Date(cursor).toISOString().slice(0, 10))) {
    racha += 1;
    cursor -= dia;
  }
  return racha;
}

// ── Nivel de jardinero ───────────────────────────────────────

export interface Nivel {
  nombre: string;
  emoji: string;
  minXP: number;
  descripcion: string;
}

export const NIVELES: Nivel[] = [
  { nombre: 'Semilla', emoji: '🌰', minXP: 0, descripcion: 'Todos empezamos en la tierra' },
  { nombre: 'Brote', emoji: '🌱', minXP: 50, descripcion: 'Ya te animás a más' },
  { nombre: 'Jardinero Novato', emoji: '🌿', minXP: 150, descripcion: 'La mano verde se asoma' },
  { nombre: 'Podador Oficial', emoji: '✂️', minXP: 350, descripcion: 'Tijeras propias merecés' },
  { nombre: 'Mano Verde', emoji: '🤲', minXP: 700, descripcion: 'Las plantas te buscan' },
  { nombre: 'Maestro Botánico', emoji: '🎓', minXP: 1200, descripcion: 'Tu jardín es un ecosistema' },
  { nombre: 'Leyenda del Jardín', emoji: '🏆', minXP: 2000, descripcion: 'Nivel máximo: las plantas te cuentan chistes' },
];

export function nivelActual(xp: number): { actual: Nivel; siguiente: Nivel | null; progresoPct: number } {
  let idx = 0;
  for (let i = 0; i < NIVELES.length; i++) {
    if (xp >= NIVELES[i].minXP) idx = i;
  }
  const actual = NIVELES[idx];
  const siguiente = idx + 1 < NIVELES.length ? NIVELES[idx + 1] : null;
  const progresoPct = siguiente
    ? Math.min(100, Math.round(((xp - actual.minXP) / (siguiente.minXP - actual.minXP)) * 100))
    : 100;
  return { actual, siguiente, progresoPct };
}

// ── Logros ───────────────────────────────────────────────────

const LOGROS: Logro[] = [
  { id: 'primera-planta', icono: '🌱', titulo: 'Primer amor', descripcion: 'Guarda tu primera planta en Mi Jardín', progreso: c => Math.min(1, c.plantas / 1) },
  { id: 'coleccionista-5', icono: '🌸', titulo: 'Coleccionista', descripcion: 'Ten 5 plantas guardadas', progreso: c => Math.min(1, c.plantas / 5) },
  { id: 'coleccionista-10', icono: '🌳', titulo: 'Curador', descripcion: 'Ten 10 plantas guardadas', progreso: c => Math.min(1, c.plantas / 10) },
  { id: 'biodiversidad', icono: '🦋', titulo: 'Biodiversidad', descripcion: '5 especies distintas en tu jardín', progreso: c => Math.min(1, c.especies / 5) },
  { id: 'primer-riego', icono: '💧', titulo: 'Bautismo de agua', descripcion: 'Registra tu primer riego', progreso: c => Math.min(1, c.riegosTotales / 1) },
  { id: 'riego-25', icono: '🚿', titulo: 'Bombero vegetal', descripcion: '25 riegos registrados', progreso: c => Math.min(1, c.riegosTotales / 25) },
  { id: 'riego-100', icono: '🌊', titulo: 'Guardián del agua', descripcion: '100 riegos registrados', progreso: c => Math.min(1, c.riegosTotales / 100) },
  { id: 'racha-3', icono: '🔥', titulo: 'Tres días seguidos', descripcion: 'Racha de cuidado de 3 días', progreso: c => Math.min(1, c.rachaDias / 3) },
  { id: 'racha-7', icono: '⚡', titulo: 'Semana perfecta', descripcion: 'Racha de cuidado de 7 días', progreso: c => Math.min(1, c.rachaDias / 7) },
  { id: 'racha-30', icono: '🌟', titulo: 'Mes inquebrantable', descripcion: 'Racha de 30 días cuidando', progreso: c => Math.min(1, c.rachaDias / 30) },
  { id: 'estudiante-1', icono: '📖', titulo: 'Alumno aplicado', descripcion: 'Completa tu primera lección de la Academia', progreso: c => Math.min(1, c.leccionesCompletadas / 1) },
  { id: 'estudiante-mitad', icono: '🎒', titulo: 'Medio curso', descripcion: 'Completa la mitad de las lecciones', progreso: c => Math.min(1, c.leccionesCompletadas / Math.ceil(TOTAL_LECCIONES / 2)) },
  { id: 'graduado', icono: '🎓', titulo: 'Graduado con honores', descripcion: 'Completa TODAS las lecciones de la Academia', progreso: c => Math.min(1, c.leccionesCompletadas / TOTAL_LECCIONES) },
  { id: 'fotografo', icono: '📸', titulo: 'Fotógrafo botánico', descripcion: 'Agrega 10 fotos a tus plantas', progreso: c => Math.min(1, c.fotosTotales / 10) },
  { id: 'superviviente', icono: '🛡️', titulo: 'Nada me mata', descripcion: 'Una planta contigo 90+ días', progreso: c => Math.min(1, c.plantasVivas / 90) },
  { id: 'explorador-regional', icono: '🌶️', titulo: 'Raíces locales', descripcion: 'Confirma un nombre regional de una planta (¡ají charapita!)', progreso: c => Math.min(1, (c as any).regionales / 1) },
  { id: 'propagador', icono: '🌱', titulo: 'Propagador', descripcion: 'Enraiza tu primer esqueje en Mis Esquejes', progreso: c => Math.min(1, (c as any).esquejesEnraizados / 1) },
  { id: 'generoso', icono: '🎁', titulo: 'Jardinero generoso', descripcion: 'Regala un esqueje enraizado a alguien', progreso: c => Math.min(1, (c as any).esquejesRegalados / 1) },
];

/** Contexto calculado desde el jardín + progreso. */
export function contextoActual(plantas: PlantaGuardada[]): ContextoLogros & { regionales: number; esquejesEnraizados: number; esquejesRegalados: number } {
  const progreso = leerProgreso();
  const especies = new Set(plantas.map(p => p.ficha.nombreCientifico?.toLowerCase() || p.ficha.nombreComun)).size;
  const fotosTotales = plantas.reduce((n, p) => n + (p.fotos?.length || 0), 0);
  const plantasVivas = plantas.length > 0
    ? Math.max(...plantas.map(p => Math.floor((Date.now() - new Date(p.fechaAdopcion || p.fechaRegistro).getTime()) / 86400000)))
    : 0;
  const regionales = plantas.filter(p => p.ficha.nombreLocal).length;
  // esquejes: lectura directa de localStorage (evita import circular con esquejes.ts)
  let esquejesEnraizados = 0;
  let esquejesRegalados = 0;
  try {
    const crudos = localStorage.getItem('planttrack.esquejes');
    if (crudos) {
      const lista = JSON.parse(crudos) as { estado?: string }[];
      esquejesEnraizados = lista.filter(e => e.estado === 'enraizado' || e.estado === 'plantado').length;
      esquejesRegalados = lista.filter(e => e.estado === 'regalado').length;
    }
  } catch { /* ok */ }
  return {
    plantas: plantas.length,
    especies,
    riegosTotales: progreso.riegosTotales,
    rachaDias: calcularRacha(),
    leccionesCompletadas: progreso.leccionesCompletadas.length,
    fotosTotales,
    plantasVivas,
    regionales,
    esquejesEnraizados,
    esquejesRegalados,
  };
}

export interface LogroConEstado {
  logro: Logro;
  completado: boolean;
  pct: number;
  nuevo: boolean; // se desbloqueó en esta evaluación
}

/** Evalúa todos los logros: marca nuevos y actualiza el registro.
 *  Devuelve la lista (para UI) y los recién desbloqueados (para toast). */
export function evaluarLogros(plantas: PlantaGuardada[]): { lista: LogroConEstado[]; nuevos: Logro[] } {
  const p = leerProgreso();
  const ctx = contextoActual(plantas);
  const nuevos: Logro[] = [];

  const lista = LOGROS.map(logro => {
    const pct = Math.max(0, Math.min(1, logro.progreso(ctx)));
    const completado = pct >= 1;
    const yaEstaba = p.logrosDesbloqueados.includes(logro.id);
    if (completado && !yaEstaba) {
      p.logrosDesbloqueados.push(logro.id);
      nuevos.push(logro);
    }
    return { logro, completado, pct, nuevo: completado && !yaEstaba };
  });

  if (nuevos.length > 0) {
    // XP de premio por logro
    p.xp += nuevos.length * 25;
    const racha = calcularRacha();
    if (racha > p.recordRacha) p.recordRacha = racha;
    escribirProgreso(p);
  }
  return { lista, nuevos };
}

/** Green Score del jardín (0-100): qué tan bien cuidado está. */
export function greenScore(plantas: PlantaGuardada[]): number {
  if (plantas.length === 0) return 0;
  let puntos = 0;
  for (const p of plantas) {
    const prox = new Date(p.proximoRiego).getTime();
    const dias = Math.ceil((prox - Date.now()) / 86400000);
    if (dias >= 0) puntos += 1;           // al día
    else if (dias >= -3) puntos += 0.6;   // leve retraso
    else if (dias >= -7) puntos += 0.3;   // atrasada
    // muy atrasada: 0
  }
  return Math.round((puntos / plantas.length) * 100);
}
