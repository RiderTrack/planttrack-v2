// ═══════════════════════════════════════════════════════════
// 🎓 PLANTTRACK V2 — components/AcademiaView.tsx
// Academia PlantTrack: mini-lecciones de 1-2 min + glosario
// botánico consultable. Progreso persistido (XP incluido).
// Se abre como overlay desde el Dashboard.
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronLeft, Check, Clock3, Search, BookOpen,
  GraduationCap, Lightbulb, Trophy,
} from 'lucide-react';
import { CURSOS, NIVEL_CURSO, type Leccion } from '../data/lecciones';
import { GLOSARIO } from '../data/glosario';
import { completarLeccion, estaCompleta } from '../services/academia';
import { leccionesCompletadas } from '../services/academia';

type Pestaña = 'lecciones' | 'glosario';

export function AcademiaView({
  onCerrar,
  onToast,
}: {
  onCerrar: () => void;
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void;
}) {
  const [pestanna, setPestanna] = useState<Pestaña>('lecciones');
  const [leccionAbierta, setLeccionAbierta] = useState<{ curso: string; leccion: Leccion } | null>(null);
  const [, forzar] = useState(0);
  const completadas = leccionesCompletadas();

  // ── Lección activa: lectura + marcar completa ──
  if (leccionAbierta) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setLeccionAbierta(null)}
            aria-label="Volver a la academia"
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate">{leccionAbierta.leccion.titulo}</p>
            <p className="text-[10px] text-slate-500">
              {leccionAbierta.leccion.minutos} min de lectura
            </p>
          </div>
          {estaCompleta(leccionAbierta.leccion.id) && (
            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Completa
            </span>
          )}
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 pb-28 space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-900/50 p-5">
            <span className="text-3xl">{leccionAbierta.leccion.emoji}</span>
            <h2 className="text-lg font-black mt-2 leading-tight">{leccionAbierta.leccion.titulo}</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{leccionAbierta.leccion.resumen}</p>
          </div>

          {leccionAbierta.leccion.contenido.map((parrafo, i) => (
            <p key={i} className="text-sm text-slate-300 leading-relaxed px-1">
              {parrafo}
            </p>
          ))}

          <div className="rounded-3xl bg-emerald-950/40 border border-emerald-900/50 p-4">
            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
              <Lightbulb className="w-4 h-4" /> Para llevar contigo
            </p>
            <ul className="space-y-2">
              {leccionAbierta.leccion.puntosClave.map((p, i) => (
                <li key={i} className="text-sm text-slate-200 leading-relaxed flex gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra inferior fija: marcar completa */}
        <div className="fixed bottom-0 inset-x-0 bg-slate-950/92 backdrop-blur border-t border-slate-800 p-4 pb-safe">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                const r = completarLeccion(leccionAbierta.leccion.id);
                if (!r.yaEstaba) {
                  onToast('exito', '🎓 ¡Lección completada! +30 XP');
                  forzar(x => x + 1);
                } else {
                  onToast('info', 'Ya tenías esta lección completada');
                }
              }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm active:scale-[0.98] transition ${
                estaCompleta(leccionAbierta.leccion.id)
                  ? 'bg-slate-800 border border-slate-700 text-slate-400'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              }`}
            >
              <Check className="w-5 h-5" />
              {estaCompleta(leccionAbierta.leccion.id) ? 'Lección completada' : '¡Aprendido! +30 XP'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Vista principal de la academia ──
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
          aria-label="Cerrar academia"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 active:scale-95 transition"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-black flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" /> Academia PlantTrack
          </p>
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-300">
          {completadas.length}/{CURSOS.reduce((n, c) => n + c.lecciones.length, 0)}
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-10 space-y-4">
        {/* Pestañas */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {([
            { id: 'lecciones' as Pestaña, texto: 'Lecciones', icono: BookOpen },
            { id: 'glosario' as Pestaña, texto: 'Glosario', icono: Search },
          ]).map(({ id, texto, icono: Icono }) => (
            <button
              key={id}
              onClick={() => setPestanna(id)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition ${
                pestanna === id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
              }`}
            >
              <Icono className="w-4 h-4" /> {texto}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {pestanna === 'lecciones' ? (
            <motion.div
              key="lecciones"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="space-y-5"
            >
              {CURSOS.map(curso => {
                const hechas = curso.lecciones.filter(l => completadas.includes(l.id)).length;
                const pct = Math.round((hechas / curso.lecciones.length) * 100);
                const nivel = NIVEL_CURSO[curso.nivel];
                return (
                  <section key={curso.id}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="text-xl">{curso.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">{curso.titulo}</p>
                        <p className="text-[11px] text-slate-500 leading-snug">{curso.descripcion}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full shrink-0 ${nivel.clase}`}>
                        {nivel.texto}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="space-y-2">
                      {curso.lecciones.map(leccion => {
                        const completa = completadas.includes(leccion.id);
                        return (
                          <button
                            key={leccion.id}
                            onClick={() => setLeccionAbierta({ curso: curso.id, leccion })}
                            className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition"
                          >
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                              completa ? 'bg-emerald-500/15 border border-emerald-700/50' : 'bg-slate-800 border border-slate-700'
                            }`}>
                              {completa ? <Check className="w-4 h-4 text-emerald-400" /> : leccion.emoji}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{leccion.titulo}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock3 className="w-3 h-3" /> {leccion.minutos} min · {leccion.resumen}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {/* Diploma si todo completo */}
              {completadas.length >= CURSOS.reduce((n, c) => n + c.lecciones.length, 0) && (
                <div className="rounded-3xl p-5 bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-800/50 text-center">
                  <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-base font-black mt-2">¡Academia completa! 🎓</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Ya sabes de riego, luz, sustratos, plagas y multiplicación. Tu jardín está en buenas manos.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <GlosarioTab />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// Pestaña del glosario con buscador
// ═══════════════════════════════════════════════════════════

function GlosarioTab() {
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const texto = q.trim().toLowerCase();
    if (!texto) return GLOSARIO;
    return GLOSARIO.filter(t =>
      t.termino.toLowerCase().includes(texto) || t.definicion.toLowerCase().includes(texto)
    );
  }, [q]);

  return (
    <motion.div
      key="glosario"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="space-y-3"
    >
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar término… (ej: sustrato)"
          aria-label="Buscar en el glosario"
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-600/60 focus:ring-2 focus:ring-indigo-600/20"
        />
      </div>

      <p className="text-[11px] text-slate-500 font-bold px-1">
        {filtrados.length} término{filtrados.length === 1 ? '' : 's'} {q ? 'encontrados' : 'botánicos'}
      </p>

      <div className="space-y-2">
        {filtrados.map(t => {
          const expandir = abierto === t.termino;
          return (
            <button
              key={t.termino}
              onClick={() => setAbierto(expandir ? null : t.termino)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-3.5 text-left active:scale-[0.98] transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg shrink-0">{t.emoji}</span>
                <p className="text-sm font-black flex-1">{t.termino}</p>
                <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${expandir ? 'rotate-90' : ''}`} />
              </div>
              <AnimatePresence>
                {expandir && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-slate-300 leading-relaxed overflow-hidden"
                  >
                    <span className="block pt-2.5">{t.definicion}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {filtrados.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-6">Ese término no está en el glosario… ¡aún! 📖</p>
      )}
    </motion.div>
  );
}
