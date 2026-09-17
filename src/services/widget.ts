// ═══════════════════════════════════════════════════════════
// 📱 PLANTTRACK V2 — services/widget.ts
// Puente al widget nativo de Android (android-widget/): la app
// empuja el total de plantas + próximo riego al widget del
// escritorio cada vez que cambia el jardín. En web no hace
// nada (silencioso). El plugin nativo "WidgetBridge" lo inyecta
// el CI al generar el APK.
// ═══════════════════════════════════════════════════════════

import { registerPlugin } from '@capacitor/core';
import type { PlantaGuardada } from '../types';
import { diasHasta, pendientesDeRiego } from '../utils/riego';
import { leerVacaciones } from './vacaciones';

interface WidgetBridgePlugin {
  actualizar(opts: { plantas: number; proximo: string; estado?: string }): Promise<{ ok: boolean }>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

let ultimoEnvio = '';

/** Refresca el widget del escritorio con el estado del jardín. */
export function actualizarWidget(plantas: PlantaGuardada[]): void {
  try {
    const proximo = pendientesDeRiego(plantas)[0];
    let linea2 = '';
    if (plantas.length === 0) {
      linea2 = 'Guarda tu primera planta 🌱';
    } else if (proximo) {
      const d = diasHasta(proximo.proximoRiego);
      const nombre = proximo.apodo || proximo.ficha.nombreComun || 'Una planta';
      if (d < 0) linea2 = `${nombre} — ¡ya tenía sed!`;
      else if (d === 0) linea2 = `${nombre} — hoy`;
      else if (d === 1) linea2 = `${nombre} — mañana`;
      else linea2 = `${nombre} — en ${d} días`;
    }
    const vacaciones = leerVacaciones();

    // dedupe: no repetir el mismo push (ahorra batería)
    const firma = `${plantas.length}|${linea2}|${vacaciones.activa}`;
    if (firma === ultimoEnvio) return;
    ultimoEnvio = firma;

    void WidgetBridge.actualizar({
      plantas: plantas.length,
      proximo: linea2,
      estado: vacaciones.activa ? '🧳 Modo vacaciones activo' : '',
    }).catch(() => { /* web o plugin ausente */ });
  } catch {
    /* registerPlugin falló (web vieja) — ignorar */
  }
}
