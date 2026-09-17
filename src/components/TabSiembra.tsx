// ═══════════════════════════════════════════════════════════
// 🌱 PLANTTRACK V2 — components/TabSiembra.tsx
// Pestaña "Calendario de siembra" de la Academia: mes a mes
// qué sembrar según tu hemisferio, fase lunar de hoy con su
// consejo, y fichas expandibles de cada cultivo.
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Moon, Sprout, Globe2 } from 'lucide-react';
import { CULTIVOS, MESES, cultivosDelMes, faseLunar, hemisferioDePais, NIVEL_CULTIVO } from '../data/siembra';
import type { CultivoSiembra } from '../types';

export function TabSiembra({ pais }: { pais: string }) {
  const hemiAuto = hemisferioDePais(pais);
  const [hemisferio, setHemisferio] = useState<'sur' | 'norte'>(hemiAuto);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [abierto, setAbierto] = useState<string | null>(null);

  const luna = useMemo(() => faseLunar(), []);
  const delMes = useMemo(() => cultivosDelMes(mes, hemisferio), [mes, hemisferio]);
  const totalSiembra = useMemo(
    () => CULTIVOS.filter(c => (hemisferio === 'sur' ? c.siembraSur : c.siembraNorte).includes(mes)).length,
    [mes, hemisferio],
  );

  return (
    <motion.div
      key="siembra"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="space-y-3"
    >
      {/* Fase lunar de hoy */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-900/50">
        <div className="flex items-center gap-3">
          <span className="text-3xl shrink-0">{luna.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-400" /> {luna.nombre}
            </p>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                style={{ width: `${Math.round(luna.iluminacion * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{Math.round(luna.iluminacion * 100)}% iluminada</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mt-2.5">{luna.consejo}</p>
      </div>

      {/* Selector de mes */}
      <div>
        <p className="text-[11px] text-slate-500 font-bold px-1 mb-1.5">¿Qué se siembra en…?</p>
        <div className="grid grid-cols-6 gap-1.5">
          {MESES.map((m, i) => {
            const n = i + 1;
            const activo = mes === n;
            return (
              <button
                key={m}
                onClick={() => setMes(n)}
                className={`text-[11px] font-black py-2 rounded-xl border transition active:scale-95 ${
                  activo
                    ? 'bg-emerald-500/15 border-emerald-600/60 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hemisferio */}
      <button
        onClick={() => setHemisferio(h => (h === 'sur' ? 'norte' : 'sur'))}
        className="w-full flex items-center gap-2.5 rounded-2xl bg-slate-900 border border-slate-800 p-3 active:scale-[0.98] transition"
      >
        <Globe2 className="w-4 h-4 text-sky-400" />
        <div className="flex-1 text-left">
          <p className="text-xs font-bold">Hemisferio {hemisferio === 'sur' ? 'Sur 🧭' : 'Norte 🧭'}</p>
          <p className="text-[10px] text-slate-500">
            {pais ? `Detectado por tu región (${pais})` : 'Detéctalo en Ajustes → Mi región'} — toca para cambiar
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>

      {/* Lista de cultivos */}
      <p className="text-[11px] text-slate-500 font-bold px-1">
        {totalSiembra} cultivo{totalSiembra === 1 ? '' : 's'} para sembrar en {MESES[mes - 1]}
      </p>

      <div className="space-y-2">
        {delMes.map(c => (
          <FichaCultivo
            key={c.id}
            cultivo={c}
            lunaActiva={luna.nombre.includes('creciente') ? 'creciente' : luna.nombre.includes('menguante') ? 'menguante' : 'indiferente'}
            expandido={abierto === c.id}
            onToggle={() => setAbierto(abierto === c.id ? null : c.id)}
          />
        ))}
      </div>

      {delMes.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-6">
          Mes de descanso y preparación 🌾 — afloja la tierra y haz compost para la próxima temporada.
        </p>
      )}
    </motion.div>
  );
}

function FichaCultivo({
  cultivo, lunaActiva, expandido, onToggle,
}: { cultivo: CultivoSiembra; lunaActiva: 'creciente' | 'menguante' | 'indiferente'; expandido: boolean; onToggle: () => void }) {
  const nivel = NIVEL_CULTIVO[cultivo.nivel];
  const lunaCoincide = cultivo.lunar === lunaActiva;
  return (
    <div className={`rounded-2xl bg-slate-900 border p-3.5 transition ${
      expandido ? 'border-emerald-800/60' : 'border-slate-800'
    }`}>
      <button onClick={onToggle} className="w-full flex items-center gap-2.5 text-left">
        <span className="text-lg shrink-0">{cultivo.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate">{cultivo.nombre}</p>
          <p className="text-[11px] text-slate-500 truncate">{cultivo.familia} · cosecha en {cultivo.diasCosecha}</p>
        </div>
        {lunaCoincide && (
          <span className="text-[9px] font-black px-1.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 shrink-0" title="Coincide con la luna de hoy">
            🌙 hoy
          </span>
        )}
        <span className={`text-[9px] font-black px-2 py-1 rounded-full shrink-0 ${nivel.clase}`}>{nivel.texto}</span>
        <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform shrink-0 ${expandido ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-2.5">
                  <p className="text-[9px] font-black text-slate-500 uppercase">📏 Profundidad</p>
                  <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{cultivo.profundidad}</p>
                </div>
                <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-2.5">
                  <p className="text-[9px] font-black text-slate-500 uppercase">📐 Espaciado</p>
                  <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{cultivo.marco}</p>
                </div>
              </div>
              <div className="rounded-xl bg-indigo-950/40 border border-indigo-900/50 p-2.5">
                <p className="text-[9px] font-black text-indigo-400 uppercase">🌙 Luna ideal</p>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  {cultivo.lunar === 'indiferente' ? 'Cualquier fase lunar' : `Luna ${cultivo.lunar}`} — tradición huertera
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Sprout className="w-3 h-3" /> Tips de oro
                </p>
                <ul className="space-y-1.5">
                  {cultivo.tips.map((t, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed flex gap-2">
                      <span className="text-emerald-500 shrink-0">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
