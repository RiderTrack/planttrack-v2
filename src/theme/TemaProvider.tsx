// ═══════════════════════════════════════════════════════════
// 🎨 PLANTTRACK V2 — theme/TemaProvider.tsx
// Contexto de tema claro/oscuro (patrón RiderTrack simplificado):
//   • dark (default, jardín nocturno) / light (invernadero) / auto
//   • persistido en localStorage
// ═══════════════════════════════════════════════════════════

import { createContext, useEffect, useState, type ReactNode } from 'react';

export type ModoTema = 'dark' | 'light' | 'auto';

const LS_TEMA = 'planttrack.tema';

interface ContextoTema {
  modo: ModoTema;
  actualizarModo: (m: ModoTema) => void;
  esClaro: boolean;
}

export type { ContextoTema };

export const TemaCtx = createContext<ContextoTema>({
  modo: 'dark',
  actualizarModo: () => {},
  esClaro: false,
});
function modoEfectivo(m: ModoTema): 'dark' | 'light' {
  if (m !== 'auto') return m;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<ModoTema>(() => {
    try { return (localStorage.getItem(LS_TEMA) as ModoTema) || 'dark'; } catch { return 'dark'; }
  });
  const [efectivo, setEfectivo] = useState<'dark' | 'light'>(modoEfectivo(modo));

  useEffect(() => {
    const e = modoEfectivo(modo);
    setEfectivo(e);
    document.documentElement.classList.toggle('light', e === 'light');
    try { localStorage.setItem(LS_TEMA, modo); } catch { /* ok */ }
    // auto: escuchar cambios del sistema
    if (modo === 'auto' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const fn = () => setEfectivo(modoEfectivo('auto'));
      mq.addEventListener?.('change', fn);
      return () => mq.removeEventListener?.('change', fn);
    }
  }, [modo]);

  return (
    <TemaCtx.Provider value={{ modo, actualizarModo: setModo, esClaro: efectivo === 'light' }}>
      {children}
    </TemaCtx.Provider>
  );
}
