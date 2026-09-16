// ═══════════════════════════════════════════════════════════
// 🎓 PLANTTRACK V2 — services/academia.ts
// Progreso de la Academia: lecciones completadas + XP.
// (El registro vive en logros.ts → 'planttrack.progreso',
//  este módulo solo expone las operaciones de lecciones.)
// ═══════════════════════════════════════════════════════════

import { leerProgreso, escribirProgreso, registrarActividad } from './logros';

/** Marca una lección como completada (idempotente). Da +30 XP. */
export function completarLeccion(idLeccion: string): { yaEstaba: boolean } {
  const p = leerProgreso();
  if (p.leccionesCompletadas.includes(idLeccion)) return { yaEstaba: true };
  p.leccionesCompletadas.push(idLeccion);
  p.xp += 30;
  escribirProgreso(p);
  registrarActividad(0); // cuenta como actividad del día (sin XP extra)
  return { yaEstaba: false };
}

export function leccionesCompletadas(): string[] {
  return leerProgreso().leccionesCompletadas;
}

export function estaCompleta(idLeccion: string): boolean {
  return leerProgreso().leccionesCompletadas.includes(idLeccion);
}
