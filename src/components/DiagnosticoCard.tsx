// ═══════════════════════════════════════════════════════════
// 🩺 PLANTTRACK V2 — components/DiagnosticoCard.tsx
// Tarjeta de resultado del diagnóstico IA de plagas: problema,
// gravedad, síntomas detectados, plan paso a paso, alternativas
// y el toque de maestro (el porqué).
// ═══════════════════════════════════════════════════════════

import { GraduationCap, ListChecks, TriangleAlert, Sparkles, Store, Home, ShieldCheck, Users } from 'lucide-react';
import type { DiagnosticoPlaga } from '../types';

const CLASE_GRAVEDAD: Record<string, { texto: string; clase: string }> = {
  leve: { texto: 'Leve', clase: 'bg-emerald-500/15 text-emerald-400 border-emerald-800/60' },
  moderada: { texto: 'Moderada', clase: 'bg-amber-500/15 text-amber-400 border-amber-800/60' },
  grave: { texto: 'Grave', clase: 'bg-red-500/15 text-red-400 border-red-800/60' },
};

export function DiagnosticoCard({
  diagnostico,
  modoDemo,
  onAbrirEnciclopedia,
}: {
  diagnostico: DiagnosticoPlaga;
  modoDemo: boolean;
  onAbrirEnciclopedia?: () => void;
}) {
  const d = diagnostico;
  const gravedad = CLASE_GRAVEDAD[d.gravedad] || CLASE_GRAVEDAD.leve;

  return (
    <div className="space-y-4">
      {/* ── Cabecera ── */}
      <div className="rounded-3xl bg-slate-900 border border-rose-900/50 overflow-hidden">
        <div className="p-5 pb-4 bg-gradient-to-br from-rose-950/40 to-slate-900">
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0">{d.problemaDetectado ? '🩺' : '🎉'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-wide">
                {d.problemaDetectado ? 'Diagnóstico de la IA' : 'Buenas noticias'}
              </p>
              <h3 className="text-lg font-black leading-tight mt-0.5">
                {d.problemaDetectado ? d.plagaProbable : 'Tu planta se ve saludable'}
              </h3>
              {d.problemaDetectado && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${gravedad.clase}`}>
                    {gravedad.texto}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    confianza {d.confianza}%
                  </span>
                  {modoDemo && (
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-amber-500/15 text-amber-300">
                      demo
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Síntomas detectados */}
        {d.sintomasDetectados.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <TriangleAlert className="w-3.5 h-3.5 text-rose-400" /> Lo que la IA ve en tu foto
            </p>
            <div className="flex flex-wrap gap-1.5">
              {d.sintomasDetectados.map((s, i) => (
                <span key={i} className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-900/50 text-rose-200 leading-snug">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Plantas en riesgo */}
        {d.afectaA.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-800 bg-amber-950/20">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Revisa también (riesgo de contagio)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {d.afectaA.map((a, i) => (
                <span key={i} className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-800/60 text-amber-200">
                  🌿 {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Plan de acción ── */}
      {d.plan.length > 0 && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
          <p className="text-sm font-black flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-emerald-400" /> Tu plan de hoy
          </p>
          <ol className="space-y-2.5">
            {d.plan.map((paso, i) => (
              <li key={i} className="text-sm text-slate-200 leading-relaxed flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-black flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {paso}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Tratamientos ── */}
      {(d.productoSugerido || d.alternativaCasera) && (
        <div className="grid gap-3">
          {d.productoSugerido && (
            <div className="rounded-2xl p-4 bg-sky-950/40 border border-sky-900/50">
              <p className="text-[10px] font-black text-sky-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" /> Si necesitas producto
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{d.productoSugerido}</p>
              <p className="text-[10px] text-slate-500 mt-1.5">
                💡 En <b className="text-slate-400">Identificar → 🧪 Producto</b> le tomas foto al envase y la IA te dice la dosis exacta.
              </p>
            </div>
          )}
          {d.alternativaCasera && (
            <div className="rounded-2xl p-4 bg-emerald-950/40 border border-emerald-900/50">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Solución casera
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{d.alternativaCasera}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Prevención + explicación maestra ── */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        {d.prevencion && (
          <div className="flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <b className="text-slate-200">Para que no vuelva a pasar:</b> {d.prevencion}
            </p>
          </div>
        )}
        {d.explicacion && (
          <div className="rounded-2xl bg-indigo-950/30 border border-indigo-900/50 p-3.5">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> El porqué (modo maestro)
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{d.explicacion}</p>
          </div>
        )}
        {onAbrirEnciclopedia && (
          <button
            onClick={onAbrirEnciclopedia}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-black text-rose-300 active:scale-[0.98] transition"
          >
            <Sparkles className="w-4 h-4" /> Ver enciclopedia de plagas y enfermedades
          </button>
        )}
      </div>
    </div>
  );
}
