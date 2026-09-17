// ═══════════════════════════════════════════════════════════
// 🦟 PLANTTRACK V2 — components/TabPlagas.tsx
// Pestaña "Plagas y enfermedades" de la Academia: buscador,
// filtro plaga/enfermedad y fichas expandibles con síntomas,
// tratamientos y prevención. Botón al diagnóstico IA por foto.
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, ShieldCheck, Sparkles, Home } from 'lucide-react';
import { buscarPlagas, ETIQUETA_GRAVEDAD } from '../data/plagas';
import type { PlagaEnciclopedia } from '../types';

type Filtro = 'todas' | 'plaga' | 'enfermedad';

export function TabPlagas({ onDiagnosticar }: { onDiagnosticar: () => void }) {
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [abierto, setAbierto] = useState<string | null>(null);

  const filtradas = useMemo(() => buscarPlagas(q, filtro), [q, filtro]);

  return (
    <motion.div
      key="plagas"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="space-y-3"
    >
      {/* CTA: diagnóstico por foto */}
      <button
        onClick={onDiagnosticar}
        className="w-full rounded-2xl p-4 bg-gradient-to-br from-rose-950/50 to-slate-900 border border-rose-900/50 flex items-center gap-3 text-left active:scale-[0.98] transition"
      >
        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-700 flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/40">
          <Sparkles className="w-5 h-5 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-rose-200">¿Tu planta tiene algo raro?</p>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
            Sácate la duda: tómale una foto y la IA diagnostica qué tiene, su gravedad y el plan para salvarla.
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-rose-400 shrink-0" />
      </button>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por plaga o síntoma… (ej: algodón, puntos amarillos)"
          aria-label="Buscar en la enciclopedia de plagas"
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm placeholder:text-slate-500 focus:outline-none focus:border-rose-600/60 focus:ring-2 focus:ring-rose-600/20"
        />
      </div>

      {/* Filtro tipo */}
      <div className="flex gap-2">
        {([['todas', 'Todas', '📋'], ['plaga', 'Plagas', '🦟'], ['enfermedad', 'Enfermedades', '🍄']] as const).map(([id, texto, emoji]) => (
          <button
            key={id}
            onClick={() => setFiltro(id)}
            className={`flex-1 text-[11px] font-black py-2 rounded-xl border transition active:scale-95 ${
              filtro === id
                ? 'bg-rose-500/15 border-rose-600/60 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {emoji} {texto}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-500 font-bold px-1">
        {filtradas.length} ficha{filtradas.length === 1 ? '' : 's'} de diagnóstico
      </p>

      {/* Lista */}
      <div className="space-y-2">
        {filtradas.map(p => (
          <FichaPlaga
            key={p.id}
            plaga={p}
            expandida={abierto === p.id}
            onToggle={() => setAbierto(abierto === p.id ? null : p.id)}
          />
        ))}
      </div>

      {filtradas.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-6">
          Nada con esa búsqueda… pero puedes <button onClick={onDiagnosticar} className="text-rose-400 font-bold underline underline-offset-2">diagnosticarlo con una foto</button> 🔍
        </p>
      )}
    </motion.div>
  );
}

function FichaPlaga({
  plaga, expandida, onToggle,
}: { plaga: PlagaEnciclopedia; expandida: boolean; onToggle: () => void }) {
  const gravedad = ETIQUETA_GRAVEDAD[plaga.gravedad];
  return (
    <div className={`rounded-2xl bg-slate-900 border p-3.5 transition ${
      expandida ? 'border-rose-800/60' : 'border-slate-800'
    }`}>
      <button onClick={onToggle} className="w-full flex items-center gap-2.5 text-left">
        <span className="text-lg shrink-0">{plaga.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate">{plaga.nombre}</p>
          <p className="text-[11px] text-slate-500 truncate">
            {plaga.tipo === 'plaga' ? '🦟 Plaga' : '🍄 Enfermedad'} · {plaga.sintomas[0]}
          </p>
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-full shrink-0 ${gravedad.clase}`}>
          {gravedad.texto}
        </span>
        <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform shrink-0 ${expandida ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expandida && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              <Bloque titulo="Qué se ve" emoji="👁️" items={plaga.sintomas} />
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1">🌡️ Qué la favorece</p>
                <p className="text-xs text-slate-300 leading-relaxed">{plaga.condiciones}</p>
              </div>
              <div className="rounded-xl bg-sky-950/40 border border-sky-900/50 p-3">
                <p className="text-[10px] font-black text-sky-400 uppercase tracking-wide mb-1">🧪 Tratamiento con producto</p>
                <p className="text-xs text-slate-300 leading-relaxed">{plaga.tratamiento}</p>
              </div>
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-900/50 p-3">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wide mb-1">🏠 Tratamiento casero</p>
                <p className="text-xs text-slate-300 leading-relaxed">{plaga.tratamientoCasero}</p>
              </div>
              <Bloque titulo="Prevención" emoji="🛡️" items={plaga.prevencion} />
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3 flex gap-2.5">
                <Home className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <b className="text-slate-300">Dónde suele aparecer:</b> {plaga.plantasFrecuentes}
                </p>
              </div>
              {plaga.id === 'virus-mosaico' && (
                <div className="rounded-xl bg-red-950/40 border border-red-900/50 p-3 flex gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-200 leading-relaxed">
                    Los virus NO tienen cura: si la confirmas, aísla o elimina la planta para proteger al resto del jardín.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bloque({ titulo, emoji, items }: { titulo: string; emoji: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5">{emoji} {titulo}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-300 leading-relaxed flex gap-2">
            <span className="text-slate-600 shrink-0">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

