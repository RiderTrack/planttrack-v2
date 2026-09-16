// ═══════════════════════════════════════════════════════════
// 🌱 PLANTTRACK V2 — components/JardinView.tsx
// Grid de plantas guardadas + buscador + detalle con riego,
// notas, frecuencia ajustable y compartir.
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { Search, Flower2, Camera, X, Droplets, Minus, Plus, Trash2, Share2, StickyNote, Clock3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { PlantaGuardada } from '../types';
import type { useJardin } from '../hooks/useJardin';
import { estadoRiego, textoRiego, formatoCorto } from '../utils/riego';
import { FichaPlantaCard } from './FichaPlanta';
import { guardarNotas, leerNotas } from '../services/jardin';
import { esNativo } from '../services/plataforma';

type RetornoJardin = ReturnType<typeof useJardin>;

export function JardinView({
  jardin,
  onToast,
}: {
  jardin: RetornoJardin;
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return jardin.plantas;
    return jardin.plantas.filter(p =>
      p.ficha.nombreComun?.toLowerCase().includes(q) ||
      p.ficha.nombreCientifico?.toLowerCase().includes(q)
    );
  }, [jardin.plantas, busqueda]);

  const detalle = detalleId ? jardin.plantas.find(p => p.id === detalleId) : null;

  if (jardin.cargando) {
    return <div className="py-16 text-center text-sm text-slate-500">Cargando jardín…</div>;
  }

  // ── Estado vacío ──
  if (jardin.plantas.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center">
        <span className="inline-flex w-20 h-20 rounded-3xl bg-emerald-950/60 items-center justify-center mb-4">
          <Flower2 className="w-10 h-10 text-emerald-500" />
        </span>
        <p className="text-base font-black">Tu jardín está vacío</p>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
          Identifica tu primera planta con la cámara y guárdala aquí para llevar su riego y cuidados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre…"
          aria-label="Buscar plantas"
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-600/60 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      <p className="text-[11px] text-slate-500 font-bold px-1">
        {filtradas.length} planta{filtradas.length === 1 ? '' : 's'}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtradas.map(p => {
          const est = estadoRiego(p);
          return (
            <button
              key={p.id}
              onClick={() => setDetalleId(p.id)}
              className="group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-left active:scale-[0.97] transition"
            >
              <div className="relative aspect-square">
                <img src={p.fotoDataUrl} alt={p.ficha.nombreComun} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent" />
                <span className={`absolute top-2 left-2 text-[9px] font-black px-2 py-1 rounded-full backdrop-blur ${
                  est === 'vencido' ? 'bg-red-500/80 text-white'
                  : est === 'hoy' ? 'bg-amber-500/85 text-white'
                  : est === 'proximo' ? 'bg-sky-500/80 text-white'
                  : 'bg-emerald-500/80 text-white'
                }`}>
                  {textoRiego(p)}
                </span>
              </div>
              <div className="p-2.5">
                <p className="text-sm font-bold truncate">{p.ficha.nombreComun}</p>
                <p className="text-[10px] text-slate-500 italic truncate">{p.ficha.nombreCientifico}</p>
              </div>
            </button>
          );
        })}
      </div>

      {filtradas.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-6">Sin resultados para “{busqueda}” 🤷</p>
      )}

      {/* ── Detalle en pantalla completa ── */}
      <AnimatePresence>
        {detalle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 h-14 flex items-center gap-3">
              <button
                onClick={() => setDetalleId(null)}
                aria-label="Cerrar detalle"
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 active:scale-95 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <p className="flex-1 text-sm font-black truncate">{detalle.ficha.nombreComun}</p>
              <button
                onClick={() => compartirPlanta(detalle, onToast)}
                aria-label="Compartir ficha"
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 active:scale-95 transition"
              >
                <Share2 className="w-5 h-5 text-emerald-400" />
              </button>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4 pb-10 space-y-4">
              {/* Panel de riego */}
              <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock3 className="w-4 h-4 text-sky-400" />
                  <p className="text-sm font-black">Riego</p>
                  <span className="ml-auto text-[11px] text-slate-500">
                    última: {formatoCorto(detalle.ultimoRiego)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    jardin.regar(detalle.id);
                    onToast('exito', '💧 Riego registrado — próxima fecha recalculada');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 text-white font-black text-sm shadow-lg shadow-sky-900/40 active:scale-[0.98] transition"
                >
                  <Droplets className="w-5 h-5" /> La regué hoy
                </button>

                {/* Ajuste de frecuencia */}
                <div className="flex items-center justify-between mt-3 rounded-2xl bg-slate-800/60 p-2 px-3">
                  <span className="text-xs font-bold text-slate-400">Frecuencia</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => jardin.ajustar(detalle.id, detalle.ficha.cuidados.riego.frecuenciaDias - 1)}
                      aria-label="Un día menos entre riegos"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-90 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-black w-16 text-center">
                      {detalle.ficha.cuidados.riego.frecuenciaDias} días
                    </span>
                    <button
                      onClick={() => jardin.ajustar(detalle.id, detalle.ficha.cuidados.riego.frecuenciaDias + 1)}
                      aria-label="Un día más entre riegos"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-90 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  Próximo riego: <b className="text-slate-300">{textoRiego(detalle)}</b> ({formatoCorto(detalle.proximoRiego)})
                </p>
              </section>

              {/* Notas */}
              <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
                <p className="text-sm font-black flex items-center gap-2 mb-2.5">
                  <StickyNote className="w-4 h-4 text-amber-400" /> Mis notas
                </p>
                <NotaPlanta id={detalle.id} onGuardar={() => onToast('exito', '📝 Nota guardada')} />
              </section>

              {/* Ficha completa */}
              <FichaPlantaCard ficha={detalle.ficha} foto={detalle.fotoDataUrl} modoDemo={detalle.modoDemo} />

              {/* Eliminar */}
              <button
                onClick={() => {
                  jardin.quitar(detalle.id);
                  setDetalleId(null);
                  onToast('info', '🌱 Planta eliminada del jardín');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-950/40 border border-red-900/50 text-red-400 font-bold text-sm active:scale-[0.98] transition"
              >
                <Trash2 className="w-5 h-5" /> Eliminar del jardín
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Textarea de notas con autoguardado al salir. */
function NotaPlanta({ id, onGuardar }: { id: string; onGuardar: () => void }) {
  const [texto, setTexto] = useState(() => leerNotas(id));
  return (
    <textarea
      value={texto}
      onChange={e => setTexto(e.target.value)}
      onBlur={() => { guardarNotas(id, texto); onGuardar(); }}
      rows={3}
      placeholder="Ej: la puse cerca de la ventana del salón, creció mucho en marzo…"
      aria-label="Notas de la planta"
      className="w-full p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-600/60 resize-none"
    />
  );
}

/** Comparte la ficha como texto (nativo) o al portapapeles (web). */
async function compartirPlanta(p: PlantaGuardada, onToast: (t: 'exito' | 'error' | 'info', x: string) => void) {
  const f = p.ficha;
  const texto =
    `🌿 ${f.nombreComun} (${f.nombreCientifico})\n\n` +
    `💧 Riego: ${f.cuidados.riego.frecuenciaTexto} — ${f.cuidados.riego.cantidad}\n` +
    `☀️ Luz: ${f.cuidados.luz}\n` +
    `🌡️ ${f.cuidados.temperatura?.ideal || ''}\n` +
    `🧪 Abono: ${f.abono.tipo} — ${f.abono.dosis} cada ${f.abono.frecuencia}\n\n` +
    `— Comparte con PlantTrack V2 🌱`;
  try {
    if (esNativo()) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: f.nombreComun, text: texto, dialogTitle: 'Compartir ficha' });
    } else {
      await navigator.clipboard.writeText(texto);
      onToast('exito', '📋 Ficha copiada al portapapeles');
    }
  } catch {
    onToast('info', 'No se pudo compartir en este dispositivo');
  }
}
