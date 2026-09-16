// ═══════════════════════════════════════════════════════════
// 📱 PLANTTRACK V2 — services/plataforma.ts
// Detección de entorno nativo (APK) vs web. Patrón RiderTrack:
// usar Capacitor.isNativePlatform(), NUNCA window.Capacitor.
// ═══════════════════════════════════════════════════════════

import { Capacitor } from '@capacitor/core';

/** true si corremos dentro de la APK Android (Capacitor). */
export function esNativo(): boolean {
  return Capacitor.isNativePlatform();
}

/** true si corremos en el navegador (dev / GitHub Pages). */
export function esWeb(): boolean {
  return !esNativo();
}
