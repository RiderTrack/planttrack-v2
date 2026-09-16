// ═══════════════════════════════════════════════════════════
// 🌱 PLANTTRACK V2 — services/jardin.ts
// CRUD de Mi Jardín sobre localStorage. Firebase queda para la
// v2.1 (sync en la nube) — la interfaz ya está pensada igual.
// ═══════════════════════════════════════════════════════════

import type { PlantaGuardada } from '../types';

const LS_JARDIN = 'planttrack.jardin';
const LS_NOTAS = 'planttrack.notas'; // id -> notas libres

function leerTodo(): PlantaGuardada[] {
  try {
    const crudo = localStorage.getItem(LS_JARDIN);
    if (crudo) return JSON.parse(crudo) as PlantaGuardada[];
  } catch { /* corrupto → jardín vacío */ }
  return [];
}

function escribirTodo(plantas: PlantaGuardada[]): void {
  localStorage.setItem(LS_JARDIN, JSON.stringify(plantas));
}

export function listarPlantas(): PlantaGuardada[] {
  return leerTodo().sort((a, b) => a.fechaRegistro < b.fechaRegistro ? 1 : -1);
}

export function obtenerPlanta(id: string): PlantaGuardada | undefined {
  return leerTodo().find(p => p.id === id);
}

export function guardarPlanta(planta: PlantaGuardada): void {
  const todas = leerTodo().filter(p => p.id !== planta.id);
  todas.push(planta);
  escribirTodo(todas);
}

export function eliminarPlanta(id: string): void {
  escribirTodo(leerTodo().filter(p => p.id !== id));
}

/** Registra un riego HOY y recalcula el próximo. */
export function registrarRiego(id: string): PlantaGuardada | undefined {
  const todas = leerTodo();
  const p = todas.find(x => x.id === id);
  if (!p) return undefined;
  const ahora = new Date().toISOString();
  p.ultimoRiego = ahora;
  p.historialRiego = [...(p.historialRiego || []), ahora].slice(-60);
  p.proximoRiego = new Date(Date.now() + (p.ficha.cuidados.riego.frecuenciaDias || 7) * 86400000).toISOString();
  escribirTodo(todas);
  return p;
}

/** Ajusta la frecuencia de riego desde la ficha de detalle. */
export function ajustarFrecuencia(id: string, dias: number): PlantaGuardada | undefined {
  const todas = leerTodo();
  const p = todas.find(x => x.id === id);
  if (!p) return undefined;
  p.ficha.cuidados.riego.frecuenciaDias = Math.max(1, Math.min(90, dias));
  p.proximoRiego = new Date(new Date(p.ultimoRiego).getTime() + p.ficha.cuidados.riego.frecuenciaDias * 86400000).toISOString();
  escribirTodo(todas);
  return p;
}

export function guardarNotas(id: string, notas: string): void {
  const m: Record<string, string> = {};
  try { Object.assign(m, JSON.parse(localStorage.getItem(LS_NOTAS) || '{}')); } catch { /* ok */ }
  m[id] = notas;
  localStorage.setItem(LS_NOTAS, JSON.stringify(m));
}

export function leerNotas(id: string): string {
  try {
    const m = JSON.parse(localStorage.getItem(LS_NOTAS) || '{}');
    return m[id] || '';
  } catch { return ''; }
}

/** Exporta todo el jardín para respaldo (Ajustes). */
export function exportarJardin(): string {
  return JSON.stringify({
    version: 1,
    fecha: new Date().toISOString(),
    plantas: leerTodo(),
    notas: JSON.parse(localStorage.getItem(LS_NOTAS) || '{}'),
  }, null, 2);
}

/** Importa un respaldo (merge por id). */
export function importarJardin(json: string): { ok: boolean; mensaje: string } {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data?.plantas)) return { ok: false, mensaje: 'El archivo no tiene el formato de PlantTrack.' };
    const actuales = leerTodo();
    const ids = new Set(actuales.map(p => p.id));
    const nuevas = data.plantas.filter((p: any) => p?.id && p?.ficha && !ids.has(p.id));
    escribirTodo([...actuales, ...nuevas]);
    if (data.notas && typeof data.notas === 'object') {
      const m: Record<string, string> = {};
      try { Object.assign(m, JSON.parse(localStorage.getItem(LS_NOTAS) || '{}')); } catch { /* ok */ }
      Object.assign(m, data.notas);
      localStorage.setItem(LS_NOTAS, JSON.stringify(m));
    }
    return { ok: true, mensaje: `Importadas ${nuevas.length} plantas nuevas.` };
  } catch {
    return { ok: false, mensaje: 'JSON inválido — no se pudo importar.' };
  }
}
