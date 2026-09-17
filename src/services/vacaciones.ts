// ═══════════════════════════════════════════════════════════
// 🧳 PLANTTRACK V2 — services/vacaciones.ts
// Modo vacaciones: cuando viajas, alguien más cuida tus
// plantas. Genera la "guía del cuidador" (texto compartible
// por WhatsApp) con las instrucciones de cada planta.
// ═══════════════════════════════════════════════════════════

import type { ConfigVacaciones, PlantaGuardada } from '../types';
import { estadoRiego } from '../utils/riego';

const LS_VAC = 'planttrack.vacaciones';

const DEFAULT: ConfigVacaciones = { activa: false, cuidador: '' };

export function leerVacaciones(): ConfigVacaciones {
  try {
    const crudo = localStorage.getItem(LS_VAC);
    if (crudo) return { ...DEFAULT, ...JSON.parse(crudo) };
  } catch { /* ok */ }
  return { ...DEFAULT };
}

export function guardarVacaciones(cfg: ConfigVacaciones): void {
  localStorage.setItem(LS_VAC, JSON.stringify(cfg));
}

/** La guía del cuidador: instrucción por planta, lista para mandar. */
export function generarGuiaCuidador(plantas: PlantaGuardada[]): string {
  const cfg = leerVacaciones();
  const saludo = cfg.cuidador.trim()
    ? `Hola ${cfg.cuidador.trim()} 🤗`
    : 'Hola 🤗';

  if (plantas.length === 0) {
    return `${saludo}\n\nGracias por mirar mi casa. Todavía no tengo plantas que cuidar, así que ¡suerte con las tuyas!\n\n— Guía hecha con PlantTrack V2 🌱`;
  }

  const porPlanta = plantas.map(p => {
    const nombre = p.apodo || p.ficha.nombreComun || 'Una planta';
    const freq = p.ficha.cuidados.riego.frecuenciaDias || 7;
    const cantidad = p.ficha.cuidados.riego.cantidad || 'hasta que escurra un poco';
    const luz = p.ubicacion || p.ficha.cuidados.luz || '';
    const nota = p.notas?.trim() ? `\n   ⚠️ Nota: ${p.notas.trim()}` : '';
    const urgente = estadoRiego(p) === 'vencido' || estadoRiego(p) === 'hoy' ? ' ¡ESTÁ POR REGAR HOY!' : '';
    return `🌿 ${nombre}${urgente}\n   💧 Riego: cada ${freq} días — ${cantidad}\n   ☀️ Dónde: ${luz}${nota}`;
  }).join('\n\n');

  const reglasOro =
    '📐 Las 3 reglas de oro:\n' +
    '   1. Antes de regar, mete el dedo 2 cm en la tierra: si sale húmedo, NO riegues.\n' +
    '   2. Si una hoja amarillea no es drama — recíbela con calma y avísame.\n' +
    '   3. Nada de "un chorrito extra por si acaso": el exceso de agua mata más que la sed.';

  return `${saludo}\n\nGracias por cuidar mis ${plantas.length} planta${plantas.length === 1 ? '' : 's'} mientras viajo 🧳\nEstas son sus instrucciones:\n\n${porPlanta}\n\n${reglasOro}\n\nCon cariño — guía hecha con PlantTrack V2 🌱`;
}
