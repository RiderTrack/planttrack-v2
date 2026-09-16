// ═══════════════════════════════════════════════════════════
// 🔔 PLANTTRACK V2 — services/notificaciones.ts
// Recordatorios locales (@capacitor/local-notifications):
//  • Solo en APK (nativo). En web → no-op silencioso.
//  • Al abrir la app / cambiar el jardín: reprograma los
//    próximos 14 días agregando plantas por día.
//  • Config: hora del día (default 9:00) en Ajustes.
// ═══════════════════════════════════════════════════════════

import type { PlantaGuardada } from '../types';
import { esNativo } from './plataforma';

const LS_NOTIF = 'planttrack.notificaciones';

export interface ConfigNotificaciones {
  activadas: boolean;
  hora: number; // 0-23
}

const DEFAULT: ConfigNotificaciones = { activadas: true, hora: 9 };

export function leerConfigNotif(): ConfigNotificaciones {
  try {
    const crudo = localStorage.getItem(LS_NOTIF);
    if (crudo) return { ...DEFAULT, ...JSON.parse(crudo) };
  } catch { /* ok */ }
  return { ...DEFAULT };
}

export function guardarConfigNotif(cfg: ConfigNotificaciones): void {
  localStorage.setItem(LS_NOTIF, JSON.stringify(cfg));
}

const DIAS_PROGRAMADOS = 14;
const MAX_NOTIF = 30; // margen seguro de Android (límite ~500)

/** Indica si las notificaciones son soportadas aquí. */
export function notificacionesDisponibles(): boolean {
  return esNativo();
}

/** Reprograma las notificaciones con el estado actual del jardín.
 *  Llamar: al abrir la app, al regar, al agregar/quitar plantas. */
export async function reprogramarNotificaciones(plantas: PlantaGuardada[]): Promise<void> {
  if (!esNativo()) return;
  const cfg = leerConfigNotif();
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // permiso (Android 13+ lo pide en runtime)
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    // limpiar todo lo programado antes de escribir lo nuevo
    const pendientes = await LocalNotifications.getPending();
    if (pendientes.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pendientes.notifications.map(n => ({ id: n.id })),
      });
    }

    if (!cfg.activadas) return;

    // Agrupar por día: qué plantas vencen cada uno de los próximos días
    const HOY = new Date();
    const porDia = new Map<string, string[]>();
    for (const p of plantas) {
      const nombre = p.apodo || p.ficha.nombreLocal || p.ficha.nombreComun || 'Una planta';
      const prox = new Date(p.proximoRiego);
      // solo si vence dentro de la ventana
      const dias = Math.ceil((prox.getTime() - HOY.getTime()) / 86400000);
      if (dias > DIAS_PROGRAMADOS) continue;
      const clave = prox.toISOString().slice(0, 10);
      const lista = porDia.get(clave) || [];
      lista.push(nombre);
      porDia.set(clave, lista);
    }

    const aProgramar: { id: number; title: string; body: string; schedule: { at: Date } }[] = [];
    let idSeq = 100; // ids estables bajos
    for (const [dia, nombres] of porDia) {
      if (aProgramar.length >= MAX_NOTIF) break;
      const [y, m, d] = dia.split('-').map(Number);
      const cuando = new Date(y, m - 1, d, cfg.hora, 0, 0);
      if (cuando.getTime() <= Date.now()) continue; // ya pasó
      aProgramar.push({
        id: idSeq++,
        title: nombres.length === 1 ? '💧 Tu planta tiene sed' : `💧 ${nombres.length} plantas tienen sed`,
        body: nombres.length === 1
          ? `${nombres[0]} te espera para su riego de hoy 🌱`
          : `${nombres.slice(0, 3).join(', ')}${nombres.length > 3 ? ` y ${nombres.length - 3} más` : ''} necesitan agua hoy 🌱`,
        schedule: { at: cuando },
      });
    }

    // Si el jardín está al día por 14 días → 1 recordatorio semanal de "pasa a saludar"
    if (aProgramar.length === 0 && plantas.length > 0) {
      const cuando = new Date(HOY.getFullYear(), HOY.getMonth(), HOY.getDate() + 7, cfg.hora, 0, 0);
      aProgramar.push({
        id: idSeq++,
        title: '🌿 Tu jardín está feliz',
        body: 'Todo al día por ahora. Pasa a saludar a tus plantas — ellas notan tu presencia.',
        schedule: { at: cuando },
      });
    }

    if (aProgramar.length > 0) {
      await LocalNotifications.schedule({ notifications: aProgramar });
    }
  } catch (e) {
    console.warn('[PlantTrack] notificaciones:', e);
  }
}
