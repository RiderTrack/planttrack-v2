// ═══════════════════════════════════════════════════════════
// 🔝 PLANTTRACK V2 — components/Header.tsx
// Barra superior: logo, indicador de IA (verde=token, ámbar=demo)
// y toggle rápido de tema.
// ═══════════════════════════════════════════════════════════

import { Sprout, Sun, Moon, Sparkles } from 'lucide-react';
import type { NavigationTab } from '../types';
import { useTema } from '../theme/useTema';
import { hayToken } from '../services/claude';

const TITULOS: Record<NavigationTab, string> = {
  inicio: 'Mi jardín digital',
  identificar: 'Identificar planta',
  jardin: 'Mi Jardín',
  chat: 'Chat botánico',
  ajustes: 'Ajustes',
};

export function Header({ tab }: { tab: NavigationTab; onCambiarTab: (t: NavigationTab) => void }) {
  const { esClaro, actualizarModo } = useTema();
  const conectado = hayToken();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black leading-none tracking-tight">
            Plant<span className="text-emerald-400">Track</span>
            <span className="ml-1.5 text-[10px] font-bold text-slate-500 align-top">V2</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{TITULOS[tab]}</p>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold ${
            conectado
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
          }`}
          title={conectado ? 'Claude conectado' : 'Modo demo — configura tu token en Ajustes'}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">{conectado ? 'IA' : 'DEMO'}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${conectado ? 'bg-emerald-400 animar-latido' : 'bg-amber-400'}`} />
        </div>

        <button
          onClick={() => actualizarModo(esClaro ? 'dark' : 'light')}
          aria-label={esClaro ? 'Activar modo oscuro' : 'Activar modo claro'}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-800 active:scale-95 transition"
        >
          {esClaro ? <Moon className="w-5 h-5 text-slate-300" /> : <Sun className="w-5 h-5 text-amber-300" />}
        </button>
      </div>
    </header>
  );
}
