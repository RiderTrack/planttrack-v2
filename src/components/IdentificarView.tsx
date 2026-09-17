// ═══════════════════════════════════════════════════════════
// 📸 PLANTTRACK V2 — components/IdentificarView.tsx
// El corazón de la app: foto → IA de Claude → ficha completa.
// Estados: sin foto → con foto → analizando → resultado.
//
// v1.2: tras identificar, el usuario puede decir "acá lo llamamos
// X" → la IA verifica el nombre regional (ají charapita 🌶️) y
// adapta toda la ficha a su nombre local.
//
// v1.3: CONSEJERO DE PRODUCTOS — toggle Planta/Producto: le
// tomas foto al envase del insecticida/abono y la IA dice si
// conviene para TUS plantas, la dosis y cómo aplicarlo.
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { Camera, ImagePlus, ScanSearch, RefreshCcw, Sprout, TriangleAlert, Save, Sparkles, Settings2, Globe2, Loader2, Check, X, FlaskConical, PackageOpen, Bug, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { FichaPlanta, PlantaGuardada, ProductoGuardado, VerificacionRegional, AnalisisProducto, DiagnosticoPlaga } from '../types';
import { tomarFoto, elegirDeGaleria, type FotoPlanta } from '../services/camara';
import { identificarPlanta, parsearFicha, verificarNombreRegional, parsearVerificacionRegional, leerConfigIA, analizarProducto, parsearProducto, diagnosticarPlaga, parsearDiagnostico } from '../services/claude';
import { aplicarRegionalAFicha } from '../services/jardin';
import { FichaPlantaCard } from './FichaPlanta';
import { ProductoCard } from './ProductoCard';
import { DiagnosticoCard } from './DiagnosticoCard';

type Fase = 'lista' | 'listaConFoto' | 'analizando' | 'resultado';
type Modo = 'planta' | 'producto' | 'plaga';

export function IdentificarView({
  onGuardar,
  onToast,
  demo,
  onIrAjustes,
  plantas,
  onGuardarProducto,
  onAplicarProducto,
  onAbrirEnciclopedia,
  modoInicial,
}: {
  onGuardar: (p: PlantaGuardada) => void;
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void;
  /** true si no hay token — llega como prop desde App (siempre fresco). */
  demo: boolean;
  /** Salta a Ajustes desde el aviso de modo demo. */
  onIrAjustes?: () => void;
  /** v1.3: jardín del usuario (contexto para el consejero de productos). */
  plantas: PlantaGuardada[];
  /** v1.3: guarda un producto analizado en Mi Botiquín. */
  onGuardarProducto: (p: ProductoGuardado) => void;
  /** v1.3: registra la aplicación de un producto a una planta. */
  onAplicarProducto: (plantaId: string, producto: ProductoGuardado) => void;
  /** v1.4: abrir la enciclopedia de plagas (Academia). */
  onAbrirEnciclopedia?: () => void;
  /** v1.4: modo de arranque (ej: 'plaga' al venir desde la enciclopedia). */
  modoInicial?: Modo;
}) {
  const [fase, setFase] = useState<Fase>('lista');
  const [modo, setModo] = useState<Modo>(modoInicial || 'planta');
  const [foto, setFoto] = useState<FotoPlanta | null>(null);
  const [ficha, setFicha] = useState<FichaPlanta | null>(null);
  const [producto, setProducto] = useState<AnalisisProducto | null>(null);
  const [productoGuardado, setProductoGuardado] = useState<ProductoGuardado | null>(null);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoPlaga | null>(null);
  const [modoDemo, setModoDemo] = useState(false);
  const [error, setError] = useState('');

  // ── v1.2: nombre regional ──
  const [verificandoNombre, setVerificandoNombre] = useState(false);
  const [nombreLocal, setNombreLocal] = useState('');
  const [verificacion, setVerificacion] = useState<VerificacionRegional | null>(null);
  const [mostrarRegional, setMostrarRegional] = useState(false);

  const pais = leerConfigIA().pais || '';

  const elegirFoto = async (deCamara: boolean) => {
    const f = deCamara ? await tomarFoto() : await elegirDeGaleria();
    if (!f) return;
    setFoto(f);
    setFicha(null);
    setProducto(null);
    setProductoGuardado(null);
    setDiagnostico(null);
    setError('');
    setVerificacion(null);
    setNombreLocal('');
    setMostrarRegional(false);
    setFase('listaConFoto');
  };

  const analizar = async () => {
    if (!foto) return;
    setFase('analizando');
    setError('');

    // ── v1.3: flujo producto (consejero) ──
    if (modo === 'producto') {
      const contextoJardin = plantas.length > 0
        ? plantas.map(p => `${p.apodo || p.ficha.nombreComun} (${p.ficha.nombreCientifico})`).join('; ')
        : '';
      const r = await analizarProducto(
        foto.base64, foto.mediaType, contextoJardin,
        pais ? `El usuario vive en ${pais}.` : '',
      );
      if (!r.ok) {
        setError(r.error || 'No se pudo analizar el producto.');
        setFase('listaConFoto');
        onToast('error', r.error || 'No se pudo analizar el producto.');
        return;
      }
      setProducto(parsearProducto(r.texto));
      setModoDemo(!!r.modoDemo);
      setFase('resultado');
      return;
    }

    // ── v1.4: flujo plaga (diagnóstico) ──
    if (modo === 'plaga') {
      const contextoJardin = plantas.length > 0
        ? plantas.map(p => `${p.apodo || p.ficha.nombreComun} (${p.ficha.nombreCientifico})`).join('; ')
        : '';
      const r = await diagnosticarPlaga(
        foto.base64, foto.mediaType, contextoJardin,
        pais ? `El usuario vive en ${pais}.` : '',
      );
      if (!r.ok) {
        setError(r.error || 'No se pudo diagnosticar.');
        setFase('listaConFoto');
        onToast('error', r.error || 'No se pudo diagnosticar.');
        return;
      }
      setDiagnostico(parsearDiagnostico(r.texto));
      setModoDemo(!!r.modoDemo);
      setFase('resultado');
      return;
    }

    // ── flujo planta (original) ──
    const extra = pais ? `El usuario vive en ${pais}.` : '';
    const r = await identificarPlanta(foto.base64, foto.mediaType, extra);
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

  // ── v1.2: verificar el nombre regional con la IA ──
  const verificarRegional = async () => {
    if (!foto || !ficha || !nombreLocal.trim() || verificandoNombre) return;
    setVerificandoNombre(true);
    const r = await verificarNombreRegional(foto.base64, foto.mediaType, nombreLocal.trim(), pais, ficha);
    setVerificandoNombre(false);
    if (!r.ok) {
      onToast('error', r.error || 'No se pudo verificar el nombre.');
      return;
    }
    const v = parsearVerificacionRegional(r.texto);
    setVerificacion(v);
    if (v.coincide) {
      setFicha(f => f ? aplicarRegionalAFicha(f, v) : f);
      onToast('exito', `🌎 Ficha adaptada: ${nombreLocal.trim()}`);
    } else {
      onToast('info', '🤔 La IA dice que ese nombre es de otra planta — mira su explicación');
    }
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
      // v1.2: la primera foto entra al timeline de la planta
      fotos: [{ id: crypto.randomUUID(), dataUrl: foto.dataUrl, fecha: ahora, nota: 'Primer día 🌱' }],
    });
    onToast('exito', `🌱 ${ficha.nombreComun} guardada en Mi Jardín`);
    reiniciar();
  };

  // ── v1.3: guardar producto en Mi Botiquín ──
  const guardarEnBotiquin = (): ProductoGuardado | null => {
    if (!foto || !producto || !producto.esProducto) return null;
    if (productoGuardado) return productoGuardado; // ya está guardado
    const guardado: ProductoGuardado = {
      id: crypto.randomUUID(),
      analisis: producto,
      fotoDataUrl: foto.dataUrl,
      fechaRegistro: new Date().toISOString(),
      modoDemo,
    };
    onGuardarProducto(guardado);
    setProductoGuardado(guardado);
    onToast('exito', `🧪 ${producto.nombre} guardado en Mi Botiquín`);
    return guardado;
  };

  // ── v1.3: registrar aplicación (auto-guarda si hace falta) ──
  const aplicarA = (plantaId: string) => {
    const prod = productoGuardado || guardarEnBotiquin();
    if (!prod) return;
    onAplicarProducto(plantaId, prod);
    const planta = plantas.find(p => p.id === plantaId);
    onToast('exito', `🧪 Aplicación registrada en ${planta?.apodo || planta?.ficha.nombreComun || 'tu planta'}`);
  };

  const reiniciar = () => {
    setFoto(null);
    setFicha(null);
    setProducto(null);
    setProductoGuardado(null);
    setDiagnostico(null);
    setVerificacion(null);
    setNombreLocal('');
    setMostrarRegional(false);
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

      {/* ── v1.3/v1.4: toggle Planta / Producto / Plaga ── */}
      {fase === 'lista' && (
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          {([['planta', '🌿', 'Planta'], ['producto', '🧪', 'Producto'], ['plaga', '🦠', 'Plaga']] as const).map(([m, emoji, texto]) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 ${
                modo === m
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-slate-400 active:scale-[0.97]'
              }`}
            >
              <span>{emoji}</span> {texto}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Fase: elegir foto ── */}
        {fase === 'lista' && (
          <motion.div key="lista" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {modo === 'planta' ? (
              <>
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

                {/* Tarjeta explicativa del feature regional */}
                <div className="rounded-2xl p-4 bg-sky-950/30 border border-sky-900/40 flex gap-3">
                  <Globe2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-sky-300">¿En tu país le dicen distinto?</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                      Después de identificar, dile a la IA cómo se llama la planta en tu región (ej: <b className="text-slate-300">ají charapita</b> en Perú) y adaptará la ficha con su nombre científico y cuidados locales.
                    </p>
                  </div>
                </div>
              </>
            ) : modo === 'producto' ? (
              <>
                <button
                  onClick={() => elegirFoto(true)}
                  className="w-full rounded-3xl border-2 border-dashed border-sky-700/60 bg-sky-950/20 p-8 flex flex-col items-center gap-4 active:scale-[0.98] transition"
                >
                  <span className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-400 to-sky-700 flex items-center justify-center shadow-xl shadow-sky-900/40">
                    <FlaskConical className="w-10 h-10 text-white" />
                  </span>
                  <div>
                    <p className="text-base font-black text-center">Tomar foto del producto</p>
                    <p className="text-xs text-slate-400 text-center mt-1">El envase con la etiqueta legible: ingredientes y dosis 🧪</p>
                  </div>
                </button>
                <button
                  onClick={() => elegirFoto(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-bold text-slate-200 active:scale-[0.98] transition"
                >
                  <ImagePlus className="w-5 h-5 text-sky-400" />
                  Subir desde la galería
                </button>

                {/* Tarjeta explicativa del consejero */}
                <div className="rounded-2xl p-4 bg-emerald-950/30 border border-emerald-900/40 flex gap-3">
                  <PackageOpen className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-emerald-300">¿Compraste algo para tus plantas?</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                      Insecticida, abono, fungicida… La IA lee la etiqueta, revisa los ingredientes, te dice <b className="text-slate-300">si conviene para tus plantas</b>, cuánto echarle exactamente y qué haría tu jardinero de confianza.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => elegirFoto(true)}
                  className="w-full rounded-3xl border-2 border-dashed border-rose-700/60 bg-rose-950/20 p-8 flex flex-col items-center gap-4 active:scale-[0.98] transition"
                >
                  <span className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-rose-700 flex items-center justify-center shadow-xl shadow-rose-900/40">
                    <Stethoscope className="w-10 h-10 text-white" />
                  </span>
                  <div>
                    <p className="text-base font-black text-center">Tomar foto de la planta enferma</p>
                    <p className="text-xs text-slate-400 text-center mt-1">La hoja o zona rara con buena luz — hasta el más mínimo detalle 🔍</p>
                  </div>
                </button>
                <button
                  onClick={() => elegirFoto(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-bold text-slate-200 active:scale-[0.98] transition"
                >
                  <ImagePlus className="w-5 h-5 text-rose-400" />
                  Subir desde la galería
                </button>

                {/* Tarjeta explicativa del diagnóstico */}
                <div className="rounded-2xl p-4 bg-rose-950/30 border border-rose-900/40 flex gap-3">
                  <Bug className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-rose-300">¿Manchas, bichos o algo raro?</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                      La IA fitopatóloga mira la foto, diagnostica <b className="text-slate-300">qué tiene tu planta</b>, su gravedad y te arma el plan paso a paso: qué cortar, qué aplicar y cómo evitar que se propague al resto del jardín.
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── Fase: foto lista para analizar ── */}
        {fase === 'listaConFoto' && foto && (
          <motion.div key="conFoto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-3xl overflow-hidden border border-slate-700 bg-slate-900">
              <img src={foto.dataUrl} alt={modo === 'producto' ? 'Foto del producto a analizar' : modo === 'plaga' ? 'Foto de la planta enferma' : 'Foto de la planta a analizar'} className="w-full max-h-[420px] object-contain" />
            </div>
            {error && (
              <div className="rounded-2xl p-3.5 bg-red-950/40 border border-red-900/50 flex items-start gap-2.5">
                <TriangleAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 leading-relaxed">{error}</p>
              </div>
            )}
            <button
              onClick={analizar}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-black text-sm shadow-lg active:scale-[0.98] transition ${
                modo === 'producto'
                  ? 'bg-gradient-to-r from-sky-400 to-sky-600 shadow-sky-900/40'
                  : modo === 'plaga'
                    ? 'bg-gradient-to-r from-rose-400 to-rose-600 shadow-rose-900/40'
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-900/40'
              }`}
            >
              <ScanSearch className="w-5 h-5" />
              {modo === 'producto' ? 'Pedir consejo a la IA' : modo === 'plaga' ? 'Diagnosticar con la IA' : 'Analizar con IA'}
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
                {modo === 'producto'
                  ? <FlaskConical className="w-16 h-16 text-sky-400 animar-respirar drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
                  : modo === 'plaga'
                    ? <Stethoscope className="w-16 h-16 text-rose-400 animar-respirar drop-shadow-[0_0_12px_rgba(251,113,133,0.5)]" />
                    : <Sprout className="w-16 h-16 text-emerald-400 animar-respirar drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]" />}
              </div>
            </div>
            <div>
              <p className="text-base font-black">
                {modo === 'producto' ? 'La IA está leyendo la etiqueta…' : modo === 'plaga' ? 'La IA está examinando a tu paciente…' : 'La IA está analizando tu planta…'}
              </p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {modo === 'producto' ? (
                  <>Ingredientes, dosis para tus plantas y recomendación de jardinero 🧪<br />Puede tomar unos segundos.</>
                ) : modo === 'plaga' ? (
                  <>Síntomas, gravedad, plan de tratamiento y prevención 🩺<br />Puede tomar unos segundos.</>
                ) : (
                  <>Reconociendo especie, cuidados, plagas y nombres regionales 🌎<br />Puede tomar unos segundos.</>
                )}
              </p>
            </div>
            <div className={`w-40 h-1.5 rounded-full bg-slate-800 overflow-hidden`}>
              <motion.div
                className={`h-full ${modo === 'producto'
                  ? 'bg-gradient-to-r from-sky-400 to-sky-600'
                  : modo === 'plaga'
                    ? 'bg-gradient-to-r from-rose-400 to-rose-600'
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                style={{ width: '100%' }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Fase: resultado ── */}
        {fase === 'resultado' && foto && (
          <motion.div key="resultado" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {modo === 'plaga' && diagnostico ? (
              diagnostico.esPlanta ? (
                <>
                  <DiagnosticoCard
                    diagnostico={diagnostico}
                    modoDemo={modoDemo}
                    onAbrirEnciclopedia={onAbrirEnciclopedia}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={reiniciar}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 to-rose-600 text-white font-black text-sm shadow-lg shadow-rose-900/40 active:scale-[0.97] transition"
                    >
                      <Camera className="w-5 h-5" /> Otra foto
                    </button>
                    <button
                      onClick={reiniciar}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm font-bold active:scale-[0.97] transition"
                    >
                      <RefreshCcw className="w-5 h-5 text-rose-400" /> Listo
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 text-center">
                  <span className="inline-flex w-16 h-16 rounded-2xl bg-amber-950/50 items-center justify-center mb-3">
                    <TriangleAlert className="w-8 h-8 text-amber-400" />
                  </span>
                  <p className="text-base font-black">Eso no parece una planta 🤔</p>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{diagnostico.descripcionNoPlanta || diagnostico.explicacion || 'Acerca la cámara a la hoja o zona afectada y prueba de nuevo.'}</p>
                  <button
                    onClick={reiniciar}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 to-rose-600 text-white font-black text-sm active:scale-[0.98] transition"
                  >
                    <Camera className="w-5 h-5" /> Probar otra foto
                  </button>
                </div>
              )
            ) : modo === 'producto' && producto ? (
              producto.esProducto ? (
                <>
                  <ProductoCard
                    analisis={producto}
                    foto={foto.dataUrl}
                    modoDemo={modoDemo}
                    plantas={plantas}
                    onAplicar={aplicarA}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { guardarEnBotiquin(); }}
                      disabled={!!productoGuardado}
                      className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm shadow-lg shadow-sky-900/40 active:scale-[0.97] transition ${
                        productoGuardado
                          ? 'bg-slate-800 text-slate-400 shadow-none'
                          : 'bg-gradient-to-r from-sky-400 to-sky-600'
                      }`}
                    >
                      {productoGuardado
                        ? <><Check className="w-5 h-5" /> En tu botiquín</>
                        : <><Save className="w-5 h-5" /> Mi Botiquín</>}
                    </button>
                    <button
                      onClick={reiniciar}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm font-bold active:scale-[0.97] transition"
                    >
                      <Camera className="w-5 h-5 text-sky-400" /> Otro producto
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 text-center">
                  <span className="inline-flex w-16 h-16 rounded-2xl bg-amber-950/50 items-center justify-center mb-3">
                    <TriangleAlert className="w-8 h-8 text-amber-400" />
                  </span>
                  <p className="text-base font-black">Eso no parece un producto de jardín 🤔</p>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{producto.paraQueSirve || producto.descripcionNoProducto || 'Intenta con una foto de la etiqueta del envase: insecticida, abono, fungicida…'}</p>
                  <button
                    onClick={reiniciar}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 text-white font-black text-sm active:scale-[0.98] transition"
                  >
                    <Camera className="w-5 h-5" /> Probar otra foto
                  </button>
                </div>
              )
            ) : ficha ? (
              <>
                {ficha.esPlanta ? (
                  <>
                    <FichaPlantaCard ficha={ficha} foto={foto.dataUrl} modoDemo={modoDemo} />

                    {/* ── Panel: nombre regional ── */}
                    <section className="rounded-3xl bg-slate-900 border border-sky-900/50 p-4">
                      <h3 className="text-sm font-black flex items-center gap-2 mb-2">
                        <Globe2 className="w-4 h-4 text-sky-400" />
                        ¿Y en tu región cómo se llama?
                        {!pais && (
                          <button
                            onClick={onIrAjustes}
                            className="ml-auto text-[10px] font-bold text-slate-500 underline underline-offset-2"
                          >
                            definir mi país
                          </button>
                        )}
                      </h3>

                      {verificacion ? (
                        <div className="space-y-3">
                          <div className={`rounded-2xl p-3 border flex gap-2.5 ${
                            verificacion.coincide
                              ? 'bg-emerald-950/40 border-emerald-800/60'
                              : 'bg-amber-950/40 border-amber-800/60'
                          }`}>
                            {verificacion.coincide
                              ? <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                              : <TriangleAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                            <div className="min-w-0">
                              <p className="text-xs text-slate-200 leading-relaxed">{verificacion.explicacion}</p>
                              {verificacion.coincide && verificacion.nombreCientifico && (
                                <p className="text-[11px] italic text-slate-400 mt-1.5">
                                  Pasaporte científico: <b>{verificacion.nombreCientifico}</b>
                                </p>
                              )}
                              {verificacion.ajustesCuidados && (
                                <p className="text-[11px] text-emerald-300/90 mt-1.5 leading-relaxed">
                                  📍 {verificacion.ajustesCuidados}
                                </p>
                              )}
                            </div>
                          </div>
                          {!verificacion.coincide && (
                            <button
                              onClick={() => { setVerificacion(null); setNombreLocal(''); }}
                              className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 active:scale-[0.98] transition"
                            >
                              Probar con otro nombre
                            </button>
                          )}
                        </div>
                      ) : verificandoNombre ? (
                        <div className="flex items-center gap-2.5 py-3 text-sm text-slate-300">
                          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                          Verificando «{nombreLocal.trim()}» con la IA…
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex gap-2">
                            <input
                              value={nombreLocal}
                              onChange={e => setNombreLocal(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') verificarRegional(); }}
                              placeholder={pais ? `Ej: como le decimos en ${pais}…` : 'Ej: ají charapita…'}
                              aria-label="Nombre regional de la planta"
                              className="flex-1 pl-3.5 pr-3 py-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-600/60"
                            />
                            <button
                              onClick={verificarRegional}
                              disabled={!nombreLocal.trim()}
                              aria-label="Verificar nombre regional"
                              className="w-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-900/40 active:scale-95 transition disabled:opacity-40 disabled:shadow-none"
                            >
                              <Check className="w-5 h-5 text-white" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            La IA confirmará si es la misma planta y traerá su nombre científico + nombres en otros países.
                          </p>
                        </div>
                      )}
                    </section>

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
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
