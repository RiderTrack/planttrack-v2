// ═══════════════════════════════════════════════════════════
// 🪪 PLANTTRACK V2 — components/FichaPlanta.tsx
// Tarjeta botánica completa: identidad, cuidados, abono y
// plagas. Reutilizada en Identificar y en el detalle del jardín.
// ═══════════════════════════════════════════════════════════

import type { FichaPlanta as Ficha, Dificultad } from '../types';
import {
  Droplets, Sun, Thermometer, Wind, Layers, Scissors, FlaskConical,
  Bug, Sparkles, Leaf, Skull, TriangleAlert, Gauge, BookOpen,
} from 'lucide-react';

const ETIQUETA_DIFICULTAD: Record<Dificultad, { texto: string; clase: string }> = {
  facil: { texto: 'Fácil', clase: 'bg-emerald-500/15 text-emerald-400' },
  media: { texto: 'Media', clase: 'bg-amber-500/15 text-amber-400' },
  dificil: { texto: 'Difícil', clase: 'bg-red-500/15 text-red-400' },
};

function BarraConfianza({ valor }: { valor: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${valor >= 75 ? 'bg-emerald-400' : valor >= 45 ? 'bg-amber-400' : 'bg-red-400'}`}
          style={{ width: `${Math.max(4, Math.min(100, valor))}%` }}
        />
      </div>
      <span className="text-[11px] font-black text-slate-300">{Math.round(valor)}%</span>
    </div>
  );
}

export function FichaPlantaCard({
  ficha,
  foto,
  modoDemo = false,
}: {
  ficha: Ficha;
  foto?: string;
  modoDemo?: boolean;
}) {
  const dif = ETIQUETA_DIFICULTAD[ficha.dificultad] || ETIQUETA_DIFICULTAD.media;

  return (
    <article className="space-y-4">
      {/* ── Identidad ── */}
      <section className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800">
        {foto && (
          <div className="relative">
            <img src={foto} alt={ficha.nombreComun} className="w-full h-44 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
            {modoDemo && (
              <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500/90 text-white uppercase tracking-wide">
                Demo
              </span>
            )}
          </div>
        )}
        <div className="p-4 -mt-8 relative">
          <h2 className="text-xl font-black leading-tight">{ficha.nombreComun || 'Planta'}</h2>
          <p className="text-xs italic text-slate-400 mt-0.5">{ficha.nombreCientifico}</p>
          {ficha.familia && (
            <p className="text-[11px] text-slate-500 mt-0.5">Familia {ficha.familia}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${dif.clase}`}>
              <Gauge className="w-3 h-3 inline -mt-0.5 mr-1" />{dif.texto}
            </span>
            {ficha.toxicidad && !/no tóx|no tox/i.test(ficha.toxicidad) && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400">
                <Skull className="w-3 h-3 inline -mt-0.5 mr-1" />Tóxica
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Confianza de la IA
            </p>
            <BarraConfianza valor={ficha.confianza} />
          </div>
          {ficha.descripcion && (
            <p className="text-sm text-slate-300 leading-relaxed mt-3">{ficha.descripcion}</p>
          )}
        </div>
      </section>

      {/* ── Cuidados esenciales ── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-4">
        <h3 className="text-sm font-black flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-400" /> Cuidados esenciales
        </h3>

        {/* Riego — destacado */}
        <div className="rounded-2xl bg-sky-950/30 border border-sky-900/40 p-3.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-black text-sky-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4" /> Riego
            </p>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300">
              cada {ficha.cuidados.riego.frecuenciaDias || '?'} días
            </span>
          </div>
          <p className="text-sm text-slate-200 font-semibold">{ficha.cuidados.riego.frecuenciaTexto}</p>
          {ficha.cuidados.riego.cantidad && (
            <p className="text-xs text-slate-400 mt-1">💧 {ficha.cuidados.riego.cantidad}</p>
          )}
          {ficha.cuidados.riego.consejos?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {ficha.cuidados.riego.consejos.map((c, i) => (
                <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                  <span className="text-sky-400">•</span> {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Luz / temperatura / humedad / sustrato / poda */}
        <div className="grid gap-2.5">
          {[
            { icono: Sun, titulo: 'Luz', texto: ficha.cuidados.luz, color: 'text-amber-400' },
            { icono: Thermometer, titulo: 'Temperatura', texto: ficha.cuidados.temperatura?.ideal || `${ficha.cuidados.temperatura?.minima}–${ficha.cuidados.temperatura?.maxima}°C`, color: 'text-rose-400' },
            { icono: Wind, titulo: 'Humedad', texto: ficha.cuidados.humedad, color: 'text-cyan-400' },
            { icono: Layers, titulo: 'Sustrato', texto: ficha.cuidados.sustrato, color: 'text-lime-400' },
            { icono: Scissors, titulo: 'Poda', texto: ficha.cuidados.poda, color: 'text-violet-400' },
          ].filter(x => x.texto).map(({ icono: Icono, titulo, texto, color }) => (
            <div key={titulo} className="flex items-start gap-3 rounded-2xl bg-slate-800/50 p-3">
              <Icono className={`w-5 h-5 ${color} shrink-0 mt-0.5`} />
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wide">{titulo}</p>
                <p className="text-sm text-slate-200 leading-snug mt-0.5">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Abono ── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
        <h3 className="text-sm font-black flex items-center gap-2 mb-3">
          <FlaskConical className="w-4 h-4 text-lime-400" /> Abono y fertilización
        </h3>
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          {[
            { k: 'Tipo', v: ficha.abono.tipo },
            { k: 'Dosis', v: ficha.abono.dosis },
            { k: 'Frecuencia', v: ficha.abono.frecuencia },
            { k: 'Época', v: ficha.abono.epoca },
          ].filter(x => x.v).map(({ k, v }) => (
            <div key={k} className="rounded-xl bg-lime-950/25 border border-lime-900/35 p-2.5">
              <p className="text-[10px] font-black text-lime-500/90 uppercase tracking-wide">{k}</p>
              <p className="text-xs text-slate-200 font-semibold mt-0.5 leading-snug">{v}</p>
            </div>
          ))}
        </div>
        {ficha.abono.consejos?.length > 0 && (
          <ul className="space-y-1.5 mt-2">
            {ficha.abono.consejos.map((c, i) => (
              <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                <span className="text-lime-400">•</span> {c}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Plagas y enfermedades ── */}
      {ficha.plagas.length > 0 && (
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
          <h3 className="text-sm font-black flex items-center gap-2 mb-3">
            <Bug className="w-4 h-4 text-rose-400" /> Plagas y enfermedades
          </h3>
          <div className="space-y-2.5">
            {ficha.plagas.map((p, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/50 p-3 border-l-2 border-rose-500/60">
                <p className="text-sm font-bold">{p.nombre}</p>
                {p.sintomas && <p className="text-xs text-slate-400 mt-1">🔎 {p.sintomas}</p>}
                {p.tratamiento && <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">💊 {p.tratamiento}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Toxicidad ── */}
      {ficha.toxicidad && (
        <section className={`rounded-2xl p-3.5 border flex gap-3 ${
          /no tóx|no tox/i.test(ficha.toxicidad)
            ? 'bg-emerald-950/30 border-emerald-900/50'
            : 'bg-rose-950/30 border-rose-900/50'
        }`}>
          {/no tóx|no tox/i.test(ficha.toxicidad)
            ? <Leaf className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            : <TriangleAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Toxicidad</p>
            <p className="text-sm text-slate-200 leading-relaxed mt-0.5">{ficha.toxicidad}</p>
          </div>
        </section>
      )}

      {/* ── Tips de oro ── */}
      {ficha.consejosExtra?.length > 0 && (
        <section className="rounded-3xl p-4 bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-900/40">
          <h3 className="text-sm font-black flex items-center gap-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Tips de oro
          </h3>
          <ul className="space-y-2">
            {ficha.consejosExtra.map((c, i) => (
              <li key={i} className="text-sm text-slate-200 leading-relaxed flex gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {c}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
