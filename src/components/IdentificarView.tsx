// ═══════════════════════════════════════════════════════════
// 📸 PLANTTRACK V2 — components/IdentificarView.tsx
// El corazón de la app: foto → IA de Claude → ficha completa.
// Estados: sin foto → con foto → analizando → resultado.
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { Camera, ImagePlus, ScanSearch, RefreshCcw, Sprout, TriangleAlert, Save, Sparkles, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { FichaPlanta, PlantaGuardada } from '../types';
import { tomarFoto, elegirDeGaleria, type FotoPlanta } from '../services/camara';
import { identificarPlanta, parsearFicha } from '../services/claude';
import { hayToken } from '../services/claude';
import { FichaPlantaCard } from './FichaPlanta';

type Fase = 'lista' | 'listaConFoto' | 'analizando' | 'resultado';

export function IdentificarView({
  onGuardar,
  onToast,
  onIrAjustes,
}: {
  onGuardar: (p: PlantaGuardada) => void;
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void;
  /** Salta a Ajustes desde el aviso de modo demo. */
  onIrAjustes?: () => void;
}) {
  const [fase, setFase] = useState<Fase>('lista');
  const [foto, setFoto] = useState<FotoPlanta | null>(null);
  const [ficha, setFicha] = useState<FichaPlanta | null>(null);
  const [modoDemo, setModoDemo] = useState(false);
  const [error, setError] = useState('');
  const demo = !hayToken();

  const elegirFoto = async (deCamara: boolean) => {
    const f = deCamara ? await tomarFoto() : await elegirDeGaleria();
    if (!f) return;
    setFoto(f);
    setFicha(null);
    setError('');
    setFase('listaConFoto');
  };

  const analizar = async () => {
    if (!foto) return;
    setFase('analizando');
    setError('');
    const r = await identificarPlanta(foto.base64, foto.mediaType);
    if (!r.ok) {
      setError(r.error || 'No se pudo analizar la foto.');
      setFase('listaConFoto');
      onToast('error', r.error || 'No se pudo analizar la foto.');
      return;
    }
    const f = parsearFicha(r.texto);
    setFicha(f);
    setModoDemo(!!r.modoDemo);
    setFase('resultado');
  };

  const guardarEnJardin = () => {
    if (!foto || !ficha || !ficha.esPlanta) return;
    const ahora = new Date().toISOString();
    const dias = ficha.cuidados.riego.frecuenciaDias || 7;
    onGuardar({
      id: crypto.randomUUID(),
      ficha,
      fotoDataUrl: foto.dataUrl,
      fechaRegistro: ahora,
      ultimoRiego: ahora,
      proximoRiego: new Date(Date.now() + dias * 86400000).toISOString(),
      notas: '',
      historialRiego: [],
      modoDemo,
    });
    onToast('exito', `🌱 ${ficha.nombreComun} guardada en Mi Jardín`);
    reiniciar();
  };

  const reiniciar = () => {
    setFoto(null);
    setFicha(null);
    setFase('lista');
  };

  return (
    <div className="space-y-4">
      {/* Aviso modo demo */}
      {demo && fase !== 'resultado' && (
        <div className="rounded-2xl p-3.5 bg-amber-950/40 border border-amber-900/50 flex gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <b>Modo demo activo:</b> sin token de Claude los resultados son de ejemplo.
            </p>
            {onIrAjustes && (
              <button
                onClick={onIrAjustes}
                className="mt-2.5 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-600/40 text-[11px] font-black text-amber-300 active:scale-[0.97] transition"
              >
                <Settings2 className="w-3.5 h-3.5" /> Configurar token de IA
              </button>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Fase: elegir foto ── */}
        {fase === 'lista' && (
          <motion.div key="lista" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <button
              onClick={() => elegirFoto(true)}
              className="w-full rounded-3xl border-2 border-dashed border-emerald-700/60 bg-emerald-950/20 p-8 flex flex-col items-center gap-4 active:scale-[0.98] transition"
            >
              <span className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-xl shadow-emerald-900/40">
                <Camera className="w-10 h-10 text-white" />
              </span>
              <div>
                <p className="text-base font-black text-center">Tomar foto de la planta</p>
                <p className="text-xs text-slate-400 text-center mt-1">Hoja, flor o planta completa — bien enfocada 🌿</p>
              </div>
            </button>
            <button
              onClick={() => elegirFoto(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-bold text-slate-200 active:scale-[0.98] transition"
            >
              <ImagePlus className="w-5 h-5 text-emerald-400" />
              Subir desde la galería
            </button>
          </motion.div>
        )}

        {/* ── Fase: foto lista para analizar ── */}
        {fase === 'listaConFoto' && foto && (
          <motion.div key="conFoto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-3xl overflow-hidden border border-slate-700 bg-slate-900">
              <img src={foto.dataUrl} alt="Foto de la planta a analizar" className="w-full max-h-[420px] object-contain" />
            </div>
            {error && (
              <div className="rounded-2xl p-3.5 bg-red-950/40 border border-red-900/50 flex items-start gap-2.5">
                <TriangleAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 leading-relaxed">{error}</p>
              </div>
            )}
            <button
              onClick={analizar}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-900/40 active:scale-[0.98] transition"
            >
              <ScanSearch className="w-5 h-5" />
              Analizar con IA
            </button>
            <button
              onClick={reiniciar}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCcw className="w-4 h-4" /> Elegir otra foto
            </button>
          </motion.div>
        )}

        {/* ── Fase: analizando ── */}
        {fase === 'analizando' && foto && (
          <motion.div key="analizando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 pt-6 flex flex-col items-center text-center">
            <div className="relative">
              <img src={foto.dataUrl} alt="" className="w-40 h-40 rounded-3xl object-cover opacity-40 blur-[2px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sprout className="w-16 h-16 text-emerald-400 animar-respirar drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
              </div>
            </div>
            <div>
              <p className="text-base font-black">La IA está analizando tu planta…</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Reconociendo especie, cuidados, abonos y plagas 🧪<br/>Puede tomar unos segundos.
              </p>
            </div>
            <div className="w-40 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                style={{ width: '100%' }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Fase: resultado ── */}
        {fase === 'resultado' && foto && ficha && (
          <motion.div key="resultado" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {ficha.esPlanta ? (
              <>
                <FichaPlantaCard ficha={ficha} foto={foto.dataUrl} modoDemo={modoDemo} />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={guardarEnJardin}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-900/40 active:scale-[0.97] transition"
                  >
                    <Save className="w-5 h-5" /> Mi Jardín
                  </button>
                  <button
                    onClick={reiniciar}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm font-bold active:scale-[0.97] transition"
                  >
                    <Camera className="w-5 h-5 text-emerald-400" /> Otra planta
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 text-center">
                <span className="inline-flex w-16 h-16 rounded-2xl bg-amber-950/50 items-center justify-center mb-3">
                  <TriangleAlert className="w-8 h-8 text-amber-400" />
                </span>
                <p className="text-base font-black">Eso no parece una planta 🤔</p>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{ficha.descripcion || 'Intenta con una foto más cercana de una hoja, flor o planta completa.'}</p>
                <button
                  onClick={reiniciar}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm active:scale-[0.98] transition"
                >
                  <Camera className="w-5 h-5" /> Probar otra foto
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
