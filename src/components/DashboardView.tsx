// ═══════════════════════════════════════════════════════════
// 🏠 PLANTTRACK V2 — components/DashboardView.tsx
// Resumen del jardín: stats, próximos riegos con acción rápida,
// consejo del día y CTA de identificación.
// ═══════════════════════════════════════════════════════════

import { useMemo } from 'react';
import { Camera, Droplets, Flower2, Bug, Lightbulb, ChevronRight, Leaf, CalendarClock } from 'lucide-react';
import type { PlantaGuardada } from '../types';
import { pendientesDeRiego, estadoRiego, textoRiego, formatoCorto } from '../utils/riego';
import { CONSEJOS_JARDIN } from '../data/consejos';

function saludo(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches 🌙';
  if (h < 13) return 'Buenos días ☀️';
  if (h < 20) return 'Buenas tardes 🌤️';
  return 'Buenas noches 🌙';
}

export function DashboardView({
  plantas,
  onIdentificar,
  onAbrirJardin,
}: {
  plantas: PlantaGuardada[];
  onIdentificar: () => void;
  onAbrirJardin: () => void;
}) {
  // Stats del jardín
  const stats = useMemo(() => {
    const pendientes = pendientesDeRiego(plantas);
    const vencidas = plantas.filter(p => estadoRiego(p) === 'vencido').length;
    const hoy = plantas.filter(p => estadoRiego(p) === 'hoy').length;
    const especies = new Set(plantas.map(p => p.ficha.nombreCientifico?.toLowerCase() || p.ficha.nombreComun)).size;
    return { pendientes: pendientes.slice(0, 4), vencidas, hoy, especies };
  }, [plantas]);

  // Consejo del día (rota por fecha)
  const consejo = useMemo(() => {
    const dia = Math.floor(Date.now() / 86400000);
    return CONSEJOS_JARDIN[dia % CONSEJOS_JARDIN.length];
  }, []);

  return (
    <div className="space-y-4">
      {/* Saludo + CTA principal */}
      <section className="rounded-3xl p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-900/50 relative overflow-hidden">
        <Leaf className="absolute -right-4 -top-4 w-28 h-28 text-emerald-800/30 rotate-12" />
        <p className="text-sm text-slate-400 font-semibold">{saludo()}</p>
        <h2 className="text-2xl font-black mt-1 leading-tight">
          {plantas.length === 0 ? (
            <>¿Qué planta es esa?<br /><span className="text-emerald-400">Descúbrelo con una foto</span></>
          ) : (
            <>Tu jardín tiene<br /><span className="text-emerald-400">{plantas.length} planta{plantas.length === 1 ? '' : 's'}</span> 🌱</>
          )}
        </h2>
        <button
          onClick={onIdentificar}
          className="mt-4 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-900/40 active:scale-[0.98] transition"
        >
          <Camera className="w-5 h-5" />
          Identificar planta
        </button>
      </section>

      {/* Stats rápidas */}
      <section className="grid grid-cols-3 gap-3" aria-label="Resumen del jardín">
        {[
          { icono: Flower2, valor: plantas.length, texto: 'Plantas', color: 'text-emerald-400' },
          { icono: Bug, valor: stats.especies, texto: 'Especies', color: 'text-lime-400' },
          { icono: CalendarClock, valor: stats.vencidas + stats.hoy, texto: 'Riegos ya!', color: (stats.vencidas + stats.hoy) > 0 ? 'text-amber-400' : 'text-sky-400' },
        ].map(({ icono: Icono, valor, texto, color }) => (
          <div key={texto} className="rounded-2xl p-3.5 bg-slate-900 border border-slate-800 text-center">
            <Icono className={`w-5 h-5 mx-auto ${color}`} />
            <p className="text-xl font-black mt-1.5 leading-none">{valor}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wide">{texto}</p>
          </div>
        ))}
      </section>

      {/* Próximos riegos */}
      <section className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-black flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-400" /> Próximos riegos
          </h3>
          {plantas.length > 0 && (
            <button onClick={onAbrirJardin} className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
              Ver todo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {plantas.length === 0 ? (
          <div className="px-4 pb-4 pt-1 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Guarda tu primera planta y aquí verás <b className="text-slate-300">cuándo regar cada una</b>.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/70">
            {stats.pendientes.map(p => {
              const est = estadoRiego(p);
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <img src={p.fotoDataUrl} alt={p.ficha.nombreComun} className="w-11 h-11 rounded-xl object-cover border border-slate-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{p.ficha.nombreComun}</p>
                    <p className="text-[11px] text-slate-500">{formatoCorto(p.ultimoRiego)} → {formatoCorto(p.proximoRiego)}</p>
                  </div>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                    est === 'vencido' ? 'bg-red-500/15 text-red-400'
                    : est === 'hoy' ? 'bg-amber-500/15 text-amber-400'
                    : est === 'proximo' ? 'bg-sky-500/15 text-sky-400'
                    : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {textoRiego(p)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Consejo del día */}
      <section className="rounded-2xl p-4 bg-amber-950/30 border border-amber-900/40 flex gap-3">
        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-black text-amber-400/90 uppercase tracking-wide">Consejo del día</p>
          <p className="text-sm text-slate-200 leading-relaxed mt-1">{consejo}</p>
        </div>
      </section>
    </div>
  );
}
