// ═══════════════════════════════════════════════════════════
// 🎨 PLANTTRACK V2 — theme/useTema.ts
// Hook público de acceso al tema. Lanza error claro si se usa
// fuera del provider (patrón RiderTrack).
// ═══════════════════════════════════════════════════════════

import { useContext } from 'react';
import { TemaCtx, type ContextoTema } from './TemaProvider';

export type { ModoTema } from './TemaProvider';

export function useTema(): ContextoTema {
  const ctx = useContext(TemaCtx);
  if (!ctx) {
    throw new Error('useTema() debe usarse dentro de <TemaProvider> (montalo en main.tsx)');
  }
  return ctx;
}
