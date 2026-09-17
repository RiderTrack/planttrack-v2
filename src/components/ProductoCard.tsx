// ═══════════════════════════════════════════════════════════
// 🧪 PLANTTRACK V2 — components/ProductoCard.tsx
// El resultado del Consejero de Productos: veredicto grande,
// dosis destacada, precauciones, plantas del jardín en riesgo,
// la recomendación "de tu jardinero" y alternativas caseras.
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Check, TriangleAlert, X, Droplets, Repeat, SprayCan,
  ShieldAlert, Bug, Home, UserRound, ChevronDown, ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AnalisisProducto, VeredictoProducto, PlantaGuardada, ProductoGuardado } from '../types';
import { formatoCorto } from '../utils/riego';

const VEREDICTO: Record<VeredictoProducto, { icono: typeof Check; texto: string; clase: string; chip: string }> = {
  apto: {
    icono: Check,
    texto: 'Sí, úsalo con confianza',
    clase: 'bg-emerald-950/50 border-emerald-700/60',
    chip: 'bg-emerald-500/15 border-emerald-600/50 text-emerald-300',
  },
  cuidado: {
    icono: TriangleAlert,
    texto: 'Funciona, pero con cuidado',
    clase: 'bg-amber-950/50 border-amber-700/60',
    chip: 'bg-amber-500/15 border-amber-600/50 text-amber-300',
  },
  no_recomendado: {
    icono: X,
    texto: 'No te lo recomiendo',
    clase: 'bg-red-950/50 border-red-800/60',
    chip: 'bg-red-500/15 border-red-700/50 text-red-300',
  },
};

export function ProductoCard({
  analisis,
  foto,
  modoDemo,
  plantas,
  onAplicar,
}: {
  analisis: AnalisisProducto;
  foto?: string;
  modoDemo?: boolean;
  /** Jardín del usuario — para el picker de "aplicar a…". */
  plantas: PlantaGuardada[];
  /** (plantaId, productoYaGuardado?) — registra la aplicación. */
  onAplicar?: (plantaId: string) => void;
}) {
  const v = VEREDICTO[analisis.veredicto] || VEREDICTO.cuidado;
  const IconoVeredicto = v.icono;
  const [abiertas, setAbiertas] = useState({ dosis: true, precauciones: true, jardinero: true });
  const [aplicando, setAplicando] = useState(false);

  const toggle = (k: keyof typeof abiertas) => setAbiertas(a => ({ ...a, [k]: !a[k] }));

  return (
    <div className="space-y-4">
      {/* ── Cabecera: foto + nombre + tipo ── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="flex gap-3.5 p-4">
          {foto && (
            <img src={foto} alt={analisis.nombre} className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 flex-wrap">
              <h2 className="text-lg font-black leading-tight">{analisis.nombre}</h2>
              {modoDemo && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-600/50 text-amber-300 shrink-0">DEMO</span>
              )}
            </div>
            {analisis.marca && <p className="text-xs text-slate-400 mt-0.5">{analisis.marca}</p>}
            {analisis.tipo && (
              <span className={`inline-block mt-2 text-[10px] font-black px-2.5 py-1 rounded-full border ${v.chip}`}>
                🧪 {analisis.tipo}
              </span>
            )}
          </div>
        </div>
        {analisis.ingredienteActivo && (
          <div className="px-4 pb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Ingrediente activo</p>
            <p className="text-xs font-mono text-sky-300 bg-sky-950/40 border border-sky-900/50 rounded-xl px-3 py-2">
              {analisis.ingredienteActivo}
            </p>
          </div>
        )}
      </section>

      {/* ── Veredicto ── */}
      <section className={`rounded-3xl border p-4 flex items-center gap-3 ${v.clase}`}>
        <span className="w-11 h-11 rounded-2xl bg-slate-950/40 flex items-center justify-center shrink-0">
          <IconoVeredicto className="w-6 h-6 text-white" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black">{v.texto}</p>
          {analisis.paraQueSirve && (
            <p className="text-xs text-slate-300/90 leading-relaxed mt-1">{analisis.paraQueSirve}</p>
          )}
        </div>
      </section>

      {/* ── Dosis / frecuencia / aplicación ── */}
      {(analisis.dosis || analisis.frecuencia || analisis.formaAplicacion) && (
        <section className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
          <button onClick={() => toggle('dosis')} className="w-full flex items-center gap-2 p-4 pb-3">
            <Droplets className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-black">Cómo usarlo</span>
            {abiertas.dosis
              ? <ChevronUp className="w-4 h-4 text-slate-500 ml-auto" />
              : <ChevronDown className="w-4 h-4 text-slate-500 ml-auto" />}
          </button>
          <AnimatePresence initial={false}>
            {abiertas.dosis && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 space-y-2.5">
                  {analisis.dosis && (
                    <div className="rounded-2xl bg-sky-950/40 border border-sky-900/50 p-3.5">
                      <p className="text-[10px] font-black text-sky-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5" /> Dosis
                      </p>
                      <p className="text-sm font-bold leading-relaxed">{analisis.dosis}</p>
                    </div>
                  )}
                  {analisis.frecuencia && (
                    <div className="flex gap-2.5 items-start rounded-2xl bg-slate-800/50 border border-slate-700/60 p-3.5">
                      <Repeat className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed"><b className="text-slate-200">Frecuencia:</b> {analisis.frecuencia}</p>
                    </div>
                  )}
                  {analisis.formaAplicacion && (
                    <div className="flex gap-2.5 items-start rounded-2xl bg-slate-800/50 border border-slate-700/60 p-3.5">
                      <SprayCan className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed"><b className="text-slate-200">Forma de aplicarlo:</b> {analisis.formaAplicacion}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ── Plantas de tu jardín en riesgo ── */}
      {analisis.plantasSensibles.length > 0 && (
        <section className="rounded-3xl bg-amber-950/40 border border-amber-800/60 p-4">
          <p className="text-sm font-black flex items-center gap-2 mb-2">
            <Bug className="w-4 h-4 text-amber-400" /> Ojo con estas plantas tuyas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analisis.plantasSensibles.map((nombre, i) => (
              <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-700/50 text-amber-200">
                🌱 {nombre}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-amber-200/70 leading-relaxed mt-2.5">
            La IA detectó que este producto puede dañarlas. Revisa las precauciones antes de aplicar.
          </p>
        </section>
      )}

      {/* ── Precauciones ── */}
      {analisis.precauciones.length > 0 && (
        <section className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
          <button onClick={() => toggle('precauciones')} className="w-full flex items-center gap-2 p-4 pb-3">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-sm font-black">Precauciones</span>
            <span className="text-[10px] font-bold text-slate-500 ml-1">({analisis.precauciones.length})</span>
            {abiertas.precauciones
              ? <ChevronUp className="w-4 h-4 text-slate-500 ml-auto" />
              : <ChevronDown className="w-4 h-4 text-slate-500 ml-auto" />}
          </button>
          <AnimatePresence initial={false}>
            {abiertas.precauciones && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <ul className="px-4 pb-4 space-y-2">
                  {analisis.precauciones.map((p, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ── La recomendación de tu jardinero ── */}
      {analisis.recomendacionJardinero && (
        <section className="rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-900/50 p-4">
          <button onClick={() => toggle('jardinero')} className="w-full flex items-center gap-2">
            <UserRound className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-black">Lo que te dice tu jardinero</span>
            {abiertas.jardinero
              ? <ChevronUp className="w-4 h-4 text-slate-500 ml-auto" />
              : <ChevronDown className="w-4 h-4 text-slate-500 ml-auto" />}
          </button>
          <AnimatePresence initial={false}>
            {abiertas.jardinero && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="text-xs text-emerald-50/90 leading-relaxed mt-2.5 italic">
                  “{analisis.recomendacionJardinero}”
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ── Alternativas caseras ── */}
      {analisis.alternativasCaseras.length > 0 && (
        <section className="rounded-3xl bg-lime-950/25 border border-lime-900/40 p-4">
          <p className="text-sm font-black flex items-center gap-2 mb-2.5">
            <Home className="w-4 h-4 text-lime-400" /> Alternativas caseras
          </p>
          <ul className="space-y-2">
            {analisis.alternativasCaseras.map((a, i) => (
              <li key={i} className="flex gap-2.5 items-start text-xs text-lime-50/85 leading-relaxed">
                <span className="text-lime-400 shrink-0">🌿</span>
                {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Aplicar a una planta (picker inline) ── */}
      {onAplicar && plantas.length > 0 && analisis.esProducto && (
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
          {!aplicando ? (
            <button
              onClick={() => setAplicando(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500/15 border border-sky-600/50 text-sky-300 font-black text-xs active:scale-[0.98] transition"
            >
              <SprayCan className="w-4 h-4" /> Registrar aplicación a una planta
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-200">¿A cuál planta se lo aplicaste?</p>
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {plantas.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onAplicar(p.id); setAplicando(false); }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 active:scale-[0.98] transition text-left"
                  >
                    <img src={p.fotoDataUrl} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{p.apodo || p.ficha.nombreComun}</p>
                      <p className="text-[10px] text-slate-500 truncate italic">{p.ficha.nombreCientifico}</p>
                    </div>
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                  </button>
                ))}
              </div>
              <button onClick={() => setAplicando(false)} className="w-full py-2 text-[11px] font-bold text-slate-500">
                Cancelar
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/** Tarjeta compacta para la lista de Mi Botiquín (JardinView). */
export function ProductoBotiquinCard({
  producto,
  onEliminar,
  onAbrir,
}: {
  producto: ProductoGuardado;
  onEliminar: () => void;
  onAbrir: () => void;
}) {
  const a = producto.analisis;
  const v = VEREDICTO[a.veredicto] || VEREDICTO.cuidado;
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 flex gap-3 items-center">
      {producto.fotoDataUrl && (
        <img src={producto.fotoDataUrl} alt={a.nombre} className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0" />
      )}
      <button onClick={onAbrir} className="min-w-0 flex-1 text-left">
        <p className="text-xs font-black truncate">{a.nombre}</p>
        <p className="text-[10px] text-slate-500 truncate">{a.tipo}{a.marca ? ` · ${a.marca}` : ''}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${v.chip}`}>{a.veredicto === 'apto' ? '✅' : a.veredicto === 'cuidado' ? '⚠️' : '❌'} {a.veredicto === 'apto' ? 'Apto' : a.veredicto === 'cuidado' ? 'Con cuidado' : 'No recomendado'}</span>
          <span className="text-[9px] text-slate-600">{formatoCorto(producto.fechaRegistro)}</span>
        </div>
      </button>
      <button onClick={onEliminar} aria-label="Eliminar producto" className="w-9 h-9 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-center shrink-0 active:scale-95 transition">
        <Trash2Icon />
      </button>
    </div>
  );
}

function Trash2Icon() {
  return (
    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
