// ═══════════════════════════════════════════════════════════
// 🌱 PLANTTRACK V2 — services/esquejes.ts
// "Mis Esquejes": seguimiento de la propagación (agua, tierra,
// perlita, aire) con estados y tarjeta compartible para el
// intercambio con vecinos. CRUD localStorage, patrón botiquín.
// ═══════════════════════════════════════════════════════════

import type { Esqueje, EstadoEsqueje, MedioEsqueje, PlantaGuardada } from '../types';
import { registrarActividad } from './logros';

const LS_ESQUEJES = 'planttrack.esquejes';

function leerTodo(): Esqueje[] {
  try {
    const crudo = localStorage.getItem(LS_ESQUEJES);
    if (crudo) return JSON.parse(crudo) as Esqueje[];
  } catch { /* corrupto → vacío */ }
  return [];
}

function escribirTodo(lista: Esqueje[]): void {
  localStorage.setItem(LS_ESQUEJES, JSON.stringify(lista));
}

export function listarEsquejes(): Esqueje[] {
  return leerTodo().sort((a, b) => a.fechaInicio < b.fechaInicio ? 1 : -1);
}

export function crearEsqueje(
  datos: { nombre: string; especie: string; plantaId?: string; medio: MedioEsqueje; nota?: string },
): Esqueje {
  const ahora = new Date().toISOString();
  const esqueje: Esqueje = {
    id: crypto.randomUUID(),
    nombre: datos.nombre.trim() || datos.especie || 'Esqueje',
    plantaId: datos.plantaId,
    especie: datos.especie,
    medio: datos.medio,
    fechaInicio: ahora,
    estado: 'enraizando',
    fechaEstado: ahora,
    nota: datos.nota?.trim() || undefined,
  };
  escribirTodo([esqueje, ...leerTodo()]);
  registrarActividad(6); // 🏆 XP por propagar
  return esqueje;
}

/** Orden natural del proceso: enraizando → enraizado → plantado/regalado. */
const SIGUIENTE: Record<EstadoEsqueje, EstadoEsqueje[]> = {
  enraizando: ['enraizado', 'fallido'],
  enraizado: ['plantado', 'regalado', 'fallido'],
  plantado: [],
  regalado: [],
  fallido: ['enraizando'],
};

export function avanzarEsqueje(id: string, estado: EstadoEsqueje): Esqueje | undefined {
  const lista = leerTodo();
  const e = lista.find(x => x.id === id);
  if (!e) return undefined;
  if (!SIGUIENTE[e.estado].includes(estado)) return e;
  e.estado = estado;
  e.fechaEstado = new Date().toISOString();
  escribirTodo(lista);
  if (estado === 'enraizado' || estado === 'plantado') registrarActividad(15); // 🏆 logro de propagador
  if (estado === 'regalado') registrarActividad(10); // 🏆 intercambio
  return e;
}

export function eliminarEsqueje(id: string): void {
  escribirTodo(leerTodo().filter(e => e.id !== id));
}

/** Importa esquejes de un respaldo (merge por id). */
export function importarEsquejes(lista: Esqueje[]): number {
  const actuales = leerTodo();
  const ids = new Set(actuales.map(e => e.id));
  const nuevos = (lista || []).filter(e => e?.id && e?.especie && !ids.has(e.id));
  if (nuevos.length > 0) escribirTodo([...actuales, ...nuevos]);
  return nuevos.length;
}

/** Lee los esquejes crudos (para el respaldo/export de Ajustes). */
export function exportarEsquejes(): Esqueje[] {
  return leerTodo();
}

/** Días desde que empezó a enraizar. */
export function diasEnraizando(e: Esqueje): number {
  return Math.max(0, Math.floor((Date.now() - new Date(e.fechaInicio).getTime()) / 86400000));
}

export const ETIQUETA_MEDIO: Record<MedioEsqueje, { texto: string; emoji: string; tip: string }> = {
  agua: { texto: 'Agua', emoji: '💧', tip: 'Cambia el agua cada 3 días y opaque el frasco: las raíces odian la luz.' },
  tierra: { texto: 'Tierra', emoji: '🪴', tip: 'Sustrato suelto + bolsa transparente encima = mini invernadero húmedo.' },
  perlita: { texto: 'Perlita', emoji: '🪨', tip: 'La reina del enraizado: lava la perlita y manténla siempre húmeda.' },
  aire: { texto: 'Acodo aéreo', emoji: '🌬️', tip: 'Musgo + plástico alrededor de una rama: enraíza sin cortar de la madre.' },
};

export const ETIQUETA_ESTADO: Record<EstadoEsqueje, { texto: string; clase: string; emoji: string }> = {
  enraizando: { texto: 'Enraizando', clase: 'bg-sky-500/15 text-sky-400', emoji: '🤞' },
  enraizado: { texto: '¡Enraizado!', clase: 'bg-emerald-500/15 text-emerald-400', emoji: '🎊' },
  plantado: { texto: 'Plantado', clase: 'bg-lime-500/15 text-lime-400', emoji: '🪴' },
  regalado: { texto: 'Regalado', clase: 'bg-violet-500/15 text-violet-400', emoji: '🎁' },
  fallido: { texto: 'No logró', clase: 'bg-slate-500/15 text-slate-400', emoji: '😔' },
};

/** Tarjeta compartible para el intercambio de esquejes. */
export function textoIntercambio(esquejes: Esqueje[]): string | null {
  const disponibles = esquejes.filter(e => e.estado === 'enraizado' || e.estado === 'enraizando');
  if (disponibles.length === 0) return null;
  const lista = disponibles.slice(0, 6).map(e => `• ${e.nombre}${e.estado === 'enraizado' ? ' ✅ listo para llevar' : ' (en proceso)'}`).join('\n');
  return '🌱 Intercambio de esquejes PlantTrack\n\nTengo estas plantas disponibles:\n' + lista + '\n\n¿Alguien quiere uno? Yo cambio por otros esquejes 🌿\n\n— Enviado con PlantTrack V2';
}

/** Sugerencia de especies de esqueje fáciles para el jardín del usuario. */
export function especiesSugeridas(plantas: PlantaGuardada[]): string[] {
  const propias = plantas.map(p => p.apodo || p.ficha.nombreComun || '').filter(Boolean);
  const clasicas = ['Potus', 'Menta', 'Albahaca', 'Suculenta (hoja)', 'Rosa', 'Geranio', 'Hiedra', 'Sansevieria'];
  return [...propias, ...clasicas.filter(c => !propias.includes(c))].slice(0, 12);
}
