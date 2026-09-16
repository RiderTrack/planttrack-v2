// ═══════════════════════════════════════════════════════════
// 💧 PLANTTRACK V2 — utils/riego.ts
// Cálculos del calendario de riego para Dashboard y detalles.
// ═══════════════════════════════════════════════════════════

import type { PlantaGuardada } from '../types';

export type EstadoRiego = 'vencido' | 'hoy' | 'proximo' | 'ok';

export function diasHasta(fechaISO: string): number {
  const ms = new Date(fechaISO).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function estadoRiego(p: PlantaGuardada): EstadoRiego {
  const d = diasHasta(p.proximoRiego);
  if (d < 0) return 'vencido';
  if (d === 0) return 'hoy';
  if (d <= 2) return 'proximo';
  return 'ok';
}

export function textoRiego(p: PlantaGuardada): string {
  const d = diasHasta(p.proximoRiego);
  if (d < 0) return `Vencido hace ${Math.abs(d)} día${Math.abs(d) === 1 ? '' : 's'}`;
  if (d === 0) return '¡Régala HOY!';
  if (d === 1) return 'Régala mañana';
  return `En ${d} días`;
}

/** Plantas ordenadas por urgencia de riego. */
export function pendientesDeRiego(plantas: PlantaGuardada[]): PlantaGuardada[] {
  return [...plantas].sort((a, b) => diasHasta(a.proximoRiego) - diasHasta(b.proximoRiego));
}

export function formatoCorto(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}
