// ═══════════════════════════════════════════════════════════
// 🌱 PLANTTRACK V2 — components/JardinView.tsx
// Grid de plantas guardadas + buscador + FILTRO POR ETIQUETAS +
// detalle mega-completo: riego, edición, fotos timeline,
// recordatorios custom, altura, supervivencia y compartir.
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import {
  Search, Flower2, X, Droplets, Minus, Plus, Trash2, Share2, StickyNote,
  Clock3, Tag, Camera, Pencil, Ruler, Bell, Heart, Globe2, Check, TrendingUp, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { PlantaGuardada, TipoRecordatorio } from '../types';
import type { useJardin } from '../hooks/useJardin';
import { estadoRiego, textoRiego, formatoCorto } from '../utils/riego';
import { FichaPlantaCard } from './FichaPlanta';
import { guardarNotas, leerNotas, etiquetasDelJardin, ETIQUETA_TIPO } from '../services/jardin';
import { esNativo } from '../services/plataforma';
import { tomarFoto } from '../services/camara';
import { consejoTemporada, diasContigo, estacionDeHoy } from '../data/temporada';

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
  const [etiquetaFiltro, setEtiquetaFiltro] = useState<string | null>(null);

  const etiquetas = useMemo(() => etiquetasDelJardin(), [jardin.plantas]);

  const filtradas = useMemo(() => {
    let lista = jardin.plantas;
    const q = busqueda.trim().toLowerCase();
    if (q) {
      lista = lista.filter(p =>
        p.ficha.nombreComun?.toLowerCase().includes(q) ||
        p.ficha.nombreCientifico?.toLowerCase().includes(q) ||
        p.apodo?.toLowerCase().includes(q) ||
        (p.ficha.nombresRegionales || []).some(r => r.nombre?.toLowerCase().includes(q))
      );
    }
    if (etiquetaFiltro) lista = lista.filter(p => (p.etiquetas || []).includes(etiquetaFiltro));
    return lista;
  }, [jardin.plantas, busqueda, etiquetaFiltro]);

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
          placeholder="Buscar por nombre, apodo o nombre regional…"
          aria-label="Buscar plantas"
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-600/60 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      {/* Filtro por etiquetas */}
      {etiquetas.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          <button
            onClick={() => setEtiquetaFiltro(null)}
            className={`shrink-0 text-[11px] font-black px-3 py-1.5 rounded-full border transition ${
              !etiquetaFiltro ? 'bg-emerald-500/15 border-emerald-600/60 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Todas
          </button>
          {etiquetas.map(et => (
            <button
              key={et}
              onClick={() => setEtiquetaFiltro(etiquetaFiltro === et ? null : et)}
              className={`shrink-0 text-[11px] font-black px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
                etiquetaFiltro === et ? 'bg-emerald-500/15 border-emerald-600/60 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Tag className="w-3 h-3" /> {et}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-500 font-bold px-1">
        {filtradas.length} planta{filtradas.length === 1 ? '' : 's'}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtradas.map(p => {
          const est = estadoRiego(p);
          const nombre = p.apodo || p.ficha.nombreComun;
          return (
            <button
              key={p.id}
              onClick={() => setDetalleId(p.id)}
              className="group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-left active:scale-[0.97] transition"
            >
              <div className="relative aspect-square">
                <img src={p.fotoDataUrl} alt={nombre} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent" />
                <span className={`absolute top-2 left-2 text-[9px] font-black px-2 py-1 rounded-full backdrop-blur ${
                  est === 'vencido' ? 'bg-red-500/80 text-white'
                  : est === 'hoy' ? 'bg-amber-500/85 text-white'
                  : est === 'proximo' ? 'bg-sky-500/80 text-white'
                  : 'bg-emerald-500/80 text-white'
                }`}>
                  {textoRiego(p)}
                </span>
                {(p.etiquetas || []).length > 0 && (
                  <span className="absolute bottom-2 right-2 text-[9px] font-bold px-2 py-1 rounded-full bg-slate-950/70 backdrop-blur text-emerald-300">
                    🏷 {p.etiquetas!.length}
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-sm font-bold truncate">{nombre}</p>
                <p className="text-[10px] text-slate-500 italic truncate">
                  {p.ficha.nombreLocal && p.apodo ? `${p.ficha.nombreLocal} · ` : ''}{p.ficha.nombreCientifico}
                </p>
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
          <DetallePlanta
            key={detalle.id}
            planta={detalle}
            jardin={jardin}
            onCerrar={() => setDetalleId(null)}
            onToast={onToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Detalle completo de una planta
// ═══════════════════════════════════════════════════════════

function DetallePlanta({
  planta,
  jardin,
  onCerrar,
  onToast,
}: {
  planta: PlantaGuardada;
  jardin: RetornoJardin;
  onCerrar: () => void;
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [agregandoFoto, setAgregandoFoto] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  const nombreMostrar = planta.apodo || planta.ficha.nombreComun;
  const estacion = estacionDeHoy();
  const consejo = consejoTemporada(planta);
  const dias = diasContigo(planta);

  const nuevaFoto = async () => {
    setAgregandoFoto(true);
    try {
      const f = await tomarFoto();
      if (f) {
        jardin.conFoto(planta.id, f.dataUrl);
        onToast('exito', '📸 Foto agregada a la línea de tiempo');
      }
    } finally {
      setAgregandoFoto(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto"
    >
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 h-14 flex items-center gap-3">
        <button
          onClick={onCerrar}
          aria-label="Cerrar detalle"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 active:scale-95 transition"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate">{nombreMostrar}</p>
          {planta.apodo && <p className="text-[10px] text-slate-500 truncate">{planta.ficha.nombreComun}</p>}
        </div>
        <button
          onClick={() => compartirPlanta(planta, onToast)}
          aria-label="Compartir ficha"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 active:scale-95 transition"
        >
          <Share2 className="w-5 h-5 text-emerald-400" />
        </button>
        <button
          onClick={() => setEditando(e => !e)}
          aria-label="Editar datos de la planta"
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition active:scale-95 ${editando ? 'bg-emerald-500/20' : 'hover:bg-slate-800'}`}
        >
          <Pencil className={`w-5 h-5 ${editando ? 'text-emerald-400' : 'text-slate-300'}`} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-10 space-y-4">
        {/* ── Banner: supervivencia + temporada ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-900/50 p-3.5 text-center">
            <Heart className="w-5 h-5 text-rose-400 mx-auto" />
            <p className="text-xl font-black mt-1 leading-none">{dias}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wide">días contigo</p>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 text-center">
            <span className="text-xl">{estacion.emoji}</span>
            <p className="text-sm font-black mt-1 leading-none">{estacion.texto}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wide">temporada actual</p>
          </div>
        </div>

        {/* Tip de temporada contextual */}
        {consejo && (
          <div className="rounded-2xl p-3.5 bg-amber-950/30 border border-amber-900/40 flex gap-3">
            <span className="text-lg shrink-0">{estacion.emoji}</span>
            <p className="text-xs text-slate-300 leading-relaxed">{consejo}</p>
          </div>
        )}

        {/* ── Editor de ficha (editable) ── */}
        <AnimatePresence>
          {editando && (
            <EditorFicha
              planta={planta}
              onGuardar={campos => {
                jardin.editar(planta.id, campos);
                onToast('exito', '✏️ Datos actualizados');
              }}
              onEtiqueta={et => jardin.etiqueta(planta.id, et)}
              onCerrar={() => setEditando(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Panel de riego ── */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="w-4 h-4 text-sky-400" />
            <p className="text-sm font-black">Riego</p>
            <span className="ml-auto text-[11px] text-slate-500">
              última: {formatoCorto(planta.ultimoRiego)}
            </span>
          </div>
          <button
            onClick={() => {
              jardin.regar(planta.id);
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
                onClick={() => jardin.ajustar(planta.id, planta.ficha.cuidados.riego.frecuenciaDias - 1)}
                aria-label="Un día menos entre riegos"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-90 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-black w-16 text-center">
                {planta.ficha.cuidados.riego.frecuenciaDias} días
              </span>
              <button
                onClick={() => jardin.ajustar(planta.id, planta.ficha.cuidados.riego.frecuenciaDias + 1)}
                aria-label="Un día más entre riegos"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-90 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Próximo riego: <b className="text-slate-300">{textoRiego(planta)}</b> ({formatoCorto(planta.proximoRiego)})
          </p>
        </section>

        {/* ── Línea de tiempo de fotos ── */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-black">Su historia en fotos</p>
            <span className="ml-auto text-[11px] text-slate-500">{(planta.fotos || []).length}/30</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={nuevaFoto}
              disabled={agregandoFoto}
              className="shrink-0 w-20 h-20 rounded-2xl border-2 border-dashed border-emerald-700/60 bg-emerald-950/20 flex flex-col items-center justify-center gap-1 active:scale-95 transition disabled:opacity-50"
            >
              <Camera className="w-5 h-5 text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-400">Agregar</span>
            </button>
            {(planta.fotos || []).map((f, i) => (
              <button
                key={f.id}
                onClick={() => setFotoAmpliada(f.dataUrl)}
                className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-slate-700 relative active:scale-95 transition"
                aria-label={`Foto ${i + 1}`}
              >
                <img src={f.dataUrl} alt={`Foto del ${formatoCorto(f.fecha)}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-slate-950/75 text-[8px] font-bold text-slate-300 py-0.5">
                  {formatoCorto(f.fecha)}
                </span>
              </button>
            ))}
          </div>
          {(planta.fotos || []).length === 0 && (
            <p className="text-[11px] text-slate-500 mt-1">Toma una foto cada tanto y mira cómo crece 🌱➡️🌳</p>
          )}
        </section>

        {/* ── Altura / crecimiento ── */}
        <PanelAltura planta={planta} onMedir={cm => { jardin.medir(planta.id, cm); onToast('exito', '📏 Altura registrada'); }} />

        {/* ── Recordatorios custom ── */}
        <PanelRecordatorios
          planta={planta}
          onAgregar={(tipo, diasF, nota) => { jardin.nuevoRecordatorio(planta.id, tipo, diasF, nota); onToast('exito', `🔔 Recordatorio de ${ETIQUETA_TIPO[tipo]} creado`); }}
          onCompletar={recId => { jardin.hacerRecordatorio(planta.id, recId); onToast('exito', '✅ Hecho — próximo recalculado'); }}
          onEliminar={recId => jardin.borrarRecordatorio(planta.id, recId)}
        />

        {/* ── Notas ── */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
          <p className="text-sm font-black flex items-center gap-2 mb-2.5">
            <StickyNote className="w-4 h-4 text-amber-400" /> Mis notas
          </p>
          <NotaPlanta id={planta.id} onGuardar={() => onToast('exito', '📝 Nota guardada')} />
        </section>

        {/* ── Ficha completa ── */}
        <FichaPlantaCard ficha={planta.ficha} foto={planta.fotoDataUrl} modoDemo={planta.modoDemo} />

        {/* ── Eliminar ── */}
        <button
          onClick={() => {
            jardin.quitar(planta.id);
            onCerrar();
            onToast('info', '🌱 Planta eliminada del jardín');
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-950/40 border border-red-900/50 text-red-400 font-bold text-sm active:scale-[0.98] transition"
        >
          <Trash2 className="w-5 h-5" /> Eliminar del jardín
        </button>
      </div>

      {/* Foto ampliada a pantalla completa */}
      <AnimatePresence>
        {fotoAmpliada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFotoAmpliada(null)}
            className="fixed inset-0 z-[70] bg-slate-950/95 flex items-center justify-center p-6"
          >
            <img src={fotoAmpliada} alt="Foto ampliada" className="max-w-full max-h-full rounded-2xl" />
            <button
              onClick={() => setFotoAmpliada(null)}
              aria-label="Cerrar foto"
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// Editor de ficha editable
// ═══════════════════════════════════════════════════════════

import type { CamposEditables } from '../services/jardin';

const ETIQUETAS_SUGERIDAS = ['Interior', 'Exterior', 'Terraza', 'Balcón', 'Huerta', 'Regalo', 'Esqueje', 'Comestible', 'Medicinal'];

function EditorFicha({
  planta,
  onGuardar,
  onEtiqueta,
  onCerrar,
}: {
  planta: PlantaGuardada;
  onGuardar: (campos: CamposEditables) => void;
  onEtiqueta: (et: string) => void;
  onCerrar: () => void;
}) {
  const [apodo, setApodo] = useState(planta.apodo || '');
  const [nombreComun, setNombreComun] = useState(planta.ficha.nombreComun || '');
  const [nombreCientifico, setNombreCientifico] = useState(planta.ficha.nombreCientifico || '');
  const [fechaAdopcion, setFechaAdopcion] = useState(planta.fechaAdopcion || '');
  const [maceta, setMaceta] = useState(planta.maceta || '');
  const [sustrato, setSustrato] = useState(planta.sustratoUsado || '');
  const [ubicacion, setUbicacion] = useState(planta.ubicacion || '');
  const [luz, setLuz] = useState(planta.ficha.cuidados.luz || '');
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');

  const guardar = () => {
    onGuardar({ apodo, nombreComun, nombreCientifico, fechaAdopcion, maceta, sustratoUsado: sustrato, ubicacion, luzFavorita: luz });
    onCerrar();
  };

  const campo = (
    etiquetaTexto: string,
    valor: string,
    set: (v: string) => void,
    placeholder: string,
    tipo: string = 'text',
  ) => (
    <div>
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1 block">{etiquetaTexto}</label>
      <input
        type={tipo}
        value={valor}
        onChange={e => set(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-600/60"
      />
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-3xl bg-slate-900 border border-emerald-900/50 p-4 space-y-3.5 overflow-hidden"
    >
      <div className="flex items-center gap-2">
        <Pencil className="w-4 h-4 text-emerald-400" />
        <p className="text-sm font-black">Editar datos</p>
        <span className="ml-auto text-[10px] text-slate-500">incluso lo que dijo la IA ✏️</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {campo('Apodo cariñoso', apodo, setApodo, 'Ej: Geraldito')}
        {campo('Fecha de adopción', fechaAdopcion, setFechaAdopcion, '', 'date')}
        {campo('Nombre común', nombreComun, setNombreComun, 'Como lo llama la IA')}
        {campo('Nombre científico', nombreCientifico, setNombreCientifico, 'Ej: Capsicum annuum')}
        {campo('Maceta', maceta, setMaceta, 'Ej: barro 20cm con drenaje')}
        {campo('Sustrato que uso', sustrato, setSustrato, 'Ej: tierra negra + perlita')}
        {campo('Ubicación', ubicacion, setUbicacion, 'Ej: balcón, junto a la ventana')}
      </div>
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1 block">Luz que recibe</label>
        <textarea
          value={luz}
          onChange={e => setLuz(e.target.value)}
          rows={2}
          placeholder="Ej: sol de la mañana hasta las 11"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-600/60 resize-none"
        />
      </div>

      {/* Etiquetas */}
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Etiquetas
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {ETIQUETAS_SUGERIDAS.map(et => {
            const activa = (planta.etiquetas || []).includes(et);
            return (
              <button
                key={et}
                onClick={() => onEtiqueta(et)}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition active:scale-95 ${
                  activa ? 'bg-emerald-500/15 border-emerald-600/60 text-emerald-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                {activa && <Check className="w-3 h-3 inline -mt-0.5 mr-1" />}{et}
              </button>
            );
          })}
          {(planta.etiquetas || []).filter(et => !ETIQUETAS_SUGERIDAS.includes(et)).map(et => (
            <button
              key={et}
              onClick={() => onEtiqueta(et)}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl border bg-emerald-500/15 border-emerald-600/60 text-emerald-300 transition active:scale-95"
            >
              <Check className="w-3 h-3 inline -mt-0.5 mr-1" />{et}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={nuevaEtiqueta}
            onChange={e => setNuevaEtiqueta(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && nuevaEtiqueta.trim()) { onEtiqueta(nuevaEtiqueta.trim()); setNuevaEtiqueta(''); } }}
            placeholder="Etiqueta personalizada…"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-600/60"
          />
          <button
            onClick={() => { if (nuevaEtiqueta.trim()) { onEtiqueta(nuevaEtiqueta.trim()); setNuevaEtiqueta(''); } }}
            className="px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 active:scale-95 transition"
            aria-label="Agregar etiqueta"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={guardar}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm active:scale-[0.98] transition shadow-lg shadow-emerald-900/40"
      >
        <Check className="w-4 h-4" /> Guardar cambios
      </button>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════
// Panel de altura + gráfica de crecimiento
// ═══════════════════════════════════════════════════════════

function PanelAltura({ planta, onMedir }: { planta: PlantaGuardada; onMedir: (cm: number) => void }) {
  const [altura, setAltura] = useState('');
  const historial = planta.historialAltura || [];

  const medir = () => {
    const cm = parseFloat(altura.replace(',', '.'));
    if (isNaN(cm) || cm < 0) return;
    onMedir(cm);
    setAltura('');
  };

  return (
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="w-4 h-4 text-violet-400" />
        <p className="text-sm font-black">Crecimiento</p>
        {planta.alturaCm != null && (
          <span className="ml-auto text-[11px] font-black text-violet-300 bg-violet-500/15 px-2 py-1 rounded-full">
            {planta.alturaCm} cm
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={altura}
          onChange={e => setAltura(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') medir(); }}
          inputMode="decimal"
          placeholder={planta.alturaCm != null ? `Hoy mide… (antes: ${planta.alturaCm} cm)` : '¿Cuánto mide hoy? (cm)'}
          aria-label="Altura en centímetros"
          className="flex-1 pl-3.5 pr-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-600/60"
        />
        <button
          onClick={medir}
          disabled={!altura}
          className="px-4 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white text-xs font-black active:scale-95 transition disabled:opacity-40"
        >
          Medir
        </button>
      </div>

      {/* Mini gráfica SVG */}
      {historial.length >= 2 && (
        <div className="mt-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 p-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Evolución ({historial.length} mediciones)
          </p>
          <GraficaAltura historial={historial} />
          <p className="text-[10px] text-slate-500 mt-1.5 text-center">
            {(() => {
              const delta = historial[historial.length - 1].cm - historial[0].cm;
              return delta >= 0
                ? `📈 Creció ${delta} cm desde la primera medición`
                : `📉 Perdió ${Math.abs(delta)} cm (¿poda o problema?)`;
            })()}
          </p>
        </div>
      )}
    </section>
  );
}

function GraficaAltura({ historial }: { historial: { fecha: string; cm: number }[] }) {
  const W = 300, H = 90, PAD = 8;
  const cms = historial.map(h => h.cm);
  const max = Math.max(...cms), min = Math.min(...cms);
  const rango = max - min || 1;
  const puntos = historial.map((h, i) => ({
    x: PAD + (i / (historial.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((h.cm - min) / rango) * (H - PAD * 2),
  }));
  const linea = puntos.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfica de crecimiento">
      <defs>
        <linearGradient id="grad-altura" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(167 139 250)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(167 139 250)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {puntos.length > 1 && (
        <polygon points={`${PAD},${H - PAD} ${linea} ${W - PAD},${H - PAD}`} fill="url(#grad-altura)" />
      )}
      <polyline points={linea} fill="none" stroke="rgb(167 139 250)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {puntos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === puntos.length - 1 ? 4 : 2.5} fill={i === puntos.length - 1 ? 'rgb(196 181 253)' : 'rgb(139 92 246)'} />
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// Panel de recordatorios custom
// ═══════════════════════════════════════════════════════════

function PanelRecordatorios({
  planta,
  onAgregar,
  onCompletar,
  onEliminar,
}: {
  planta: PlantaGuardada;
  onAgregar: (tipo: TipoRecordatorio, dias: number, nota?: string) => void;
  onCompletar: (recId: string) => void;
  onEliminar: (recId: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoRecordatorio>('abono');
  const [dias, setDias] = useState('15');
  const [nota, setNota] = useState('');

  const agregar = () => {
    const d = parseInt(dias, 10);
    if (isNaN(d) || d < 1) return;
    onAgregar(tipo, d, nota);
    setAbierto(false);
    setNota('');
  };

  const ICONOS: Record<TipoRecordatorio, string> = {
    riego: '💧', abono: '🧪', trasplante: '🪴', poda: '✂️', revision: '🔍', otro: '📌',
  };

  const vencido = (iso: string) => new Date(iso).getTime() < Date.now();

  return (
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-amber-400" />
        <p className="text-sm font-black">Mis recordatorios</p>
        <button
          onClick={() => setAbierto(a => !a)}
          className="ml-auto w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:scale-90 transition"
          aria-label="Nuevo recordatorio"
        >
          <Plus className={`w-4 h-4 text-amber-400 transition-transform ${abierto ? 'rotate-45' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-3 space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(ETIQUETA_TIPO) as TipoRecordatorio[]).filter(t => t !== 'riego').map(t => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition active:scale-95 ${
                      tipo === t ? 'bg-amber-500/15 border-amber-600/60 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {ICONOS[t]} {ETIQUETA_TIPO[t]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={dias}
                  onChange={e => setDias(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  placeholder="Cada N días"
                  aria-label="Cada cuántos días"
                  className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-amber-600/60"
                />
                <input
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  placeholder="Nota opcional (ej: abono diluido)"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-600/60"
                />
              </div>
              <button
                onClick={agregar}
                disabled={parseInt(dias, 10) < 1}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-black active:scale-[0.98] transition disabled:opacity-40"
              >
                Crear recordatorio cada {dias || '?'} días
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(planta.recordatorios || []).length === 0 && !abierto ? (
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Además del riego, crea recordatorios de abono 🧪, poda ✂️ o trasplante 🪴 — cada uno con su propia frecuencia.
        </p>
      ) : (
        <div className="space-y-2">
          {(planta.recordatorios || []).map(rec => {
            const venc = vencido(rec.proximo);
            const diasRest = Math.ceil((new Date(rec.proximo).getTime() - Date.now()) / 86400000);
            return (
              <div
                key={rec.id}
                className={`rounded-2xl p-3 border flex items-center gap-3 ${
                  venc ? 'bg-amber-950/30 border-amber-800/50' : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <span className="text-lg shrink-0">{ICONOS[rec.tipo]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black">
                    {ETIQUETA_TIPO[rec.tipo]}
                    <span className="text-slate-500 font-medium"> · cada {rec.frecuenciaDias} días</span>
                  </p>
                  {rec.nota && <p className="text-[10px] text-slate-500 truncate">{rec.nota}</p>}
                  <p className={`text-[10px] font-bold mt-0.5 ${venc ? 'text-amber-400' : 'text-slate-400'}`}>
                    {venc
                      ? `¡Toca hacerlo! (venció hace ${Math.abs(diasRest)} día${Math.abs(diasRest) === 1 ? '' : 's'})`
                      : `Próximo: en ${diasRest} días (${formatoCorto(rec.proximo)})`}
                  </p>
                </div>
                <button
                  onClick={() => onCompletar(rec.id)}
                  aria-label="Marcar como hecho"
                  className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-700/60 flex items-center justify-center active:scale-90 transition shrink-0"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={() => onEliminar(rec.id)}
                  aria-label="Eliminar recordatorio"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center active:scale-90 transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
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
  const dias = diasContigo(p);
  const texto =
    `🌿 ${p.apodo ? `${p.apodo} — ` : ''}${f.nombreLocal ? `${f.nombreLocal} (${f.nombreCientifico})` : `${f.nombreComun} (${f.nombreCientifico})`}\n` +
    (f.nombresRegionales?.length ? `🌎 También conocida como: ${f.nombresRegionales.slice(0, 4).map(r => `${r.nombre} (${r.region})`).join(', ')}\n` : '') +
    (dias > 0 ? `❤️ ${dias} días juntos y contando\n` : '') +
    `\n💧 Riego: ${f.cuidados.riego.frecuenciaTexto} — ${f.cuidados.riego.cantidad}\n` +
    `☀️ Luz: ${f.cuidados.luz}\n` +
    `🌡️ ${f.cuidados.temperatura?.ideal || ''}\n` +
    `🧪 Abono: ${f.abono.tipo} — ${f.abono.dosis} cada ${f.abono.frecuencia}\n` +
    (f.erroresComunes?.length ? `\n⚠️ Errores que la matan:\n${f.erroresComunes.map(e => `• ${e}`).join('\n')}\n` : '') +
    `\n— Comparte con PlantTrack V2 🌱`;
  try {
    if (esNativo()) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: p.apodo || f.nombreComun, text: texto, dialogTitle: 'Compartir ficha' });
    } else {
      await navigator.clipboard.writeText(texto);
      onToast('exito', '📋 Ficha copiada al portapapeles');
    }
  } catch {
    onToast('info', 'No se pudo compartir en este dispositivo');
  }
}
