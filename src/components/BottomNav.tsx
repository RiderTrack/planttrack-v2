// ═══════════════════════════════════════════════════════════
// 📱 PLANTTRACK V2 — components/BottomNav.tsx
// Navegación inferior mobile-first con botón central de cámara
// elevado (estilo apps de foto). Safe-area iOS respetada.
// ═══════════════════════════════════════════════════════════

import { Home, Camera, Flower2, MessageCircle, Settings } from 'lucide-react';
import type { NavigationTab } from '../types';

const ITEMS: { id: NavigationTab; icono: typeof Home; etiqueta: string }[] = [
  { id: 'inicio', icono: Home, etiqueta: 'Inicio' },
  { id: 'jardin', icono: Flower2, etiqueta: 'Jardín' },
  { id: 'identificar', icono: Camera, etiqueta: 'Identificar' },
  { id: 'chat', icono: MessageCircle, etiqueta: 'Chat' },
  { id: 'ajustes', icono: Settings, etiqueta: 'Ajustes' },
];

export function BottomNav({
  tab,
  onCambiarTab,
}: {
  tab: NavigationTab;
  onCambiarTab: (t: NavigationTab) => void;
}) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/92 backdrop-blur-md border-t border-slate-800/80 pb-safe"
    >
      <div className="max-w-2xl mx-auto grid grid-cols-5 h-16">
        {ITEMS.map(({ id, icono: Icono, etiqueta }) => {
          const activo = tab === id;
          const esCamara = id === 'identificar';

          // Botón central: FAB de cámara elevado
          if (esCamara) {
            return (
              <button
                key={id}
                onClick={() => onCambiarTab(id)}
                aria-label="Identificar planta con la cámara"
                aria-current={activo ? 'page' : undefined}
                className="relative flex items-center justify-center"
              >
                <span
                  className={`absolute -top-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90 ${
                    activo
                      ? 'bg-gradient-to-br from-emerald-300 to-emerald-600 shadow-emerald-500/30 rotate-3'
                      : 'bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-emerald-900/50'
                  }`}
                >
                  <Icono className="w-7 h-7 text-white" strokeWidth={2.2} />
                </span>
                <span className={`absolute bottom-2 text-[10px] font-bold ${activo ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {etiqueta}
                </span>
              </button>
            );
          }

          return (
            <button
              key={id}
              onClick={() => onCambiarTab(id)}
              aria-label={etiqueta}
              aria-current={activo ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1 active:scale-95 transition"
            >
              <Icono className={`w-5 h-5 ${activo ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className={`text-[10px] font-bold ${activo ? 'text-emerald-400' : 'text-slate-500'}`}>
                {etiqueta}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
