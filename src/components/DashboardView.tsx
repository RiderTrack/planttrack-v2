// ═══════════════════════════════════════════════════════════
// 🏠 PLANTTRACK V2 — components/DashboardView.tsx
// Resumen del jardín v1.2: saludo + CTA, stats, nivel de
// jardinero (XP + racha), Green Score, Tip del Día con
// "dame otro", próximos riegos, acceso a la Academia,
// logros y mini estadísticas.
// ═══════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from 'react';
import {
  Camera, Droplets, Flower2, Bug, Lightbulb, ChevronRight, Leaf,
  CalendarClock, GraduationCap, Flame, Trophy, RefreshCcw, TrendingUp, Sparkles,
  Plane, Share2, CloudSun, MapPin,
} from 'lucide-react';
import type { InfoClima, PlantaGuardada } from '../types';
import { pendientesDeRiego, estadoRiego, textoRiego, formatoCorto } from '../utils/riego';
import { tipDelDia, ETIQUETA_CATEGORIA } from '../data/tips';
import { TOTAL_LECCIONES } from '../data/lecciones';
import {
  leerProgreso, nivelActual, calcularRacha, evaluarLogros, greenScore,
} from '../services/logros';
import { leccionesCompletadas } from '../services/academia';
import { obtenerClima, consejoDeRiego, describirCodigo, type ErrorClima } from '../services/clima';
import { leerVacaciones, generarGuiaCuidador } from '../services/vacaciones';
import { esNativo } from '../services/plataforma';

function saludo(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches 🌙';
  if (h < 13) return 'Buenos días ☀️';
  if (h < 20) return 'Buenas tardes 🌤️';
  return 'Buenas noches 🌙';
}

export function DashboardView({
  plantas,
  onIdentificar,
  onAbrirJardin,
  onAbrirAcademia,
  onToast,
}: {
  plantas: PlantaGuardada[];
  onIdentificar: () => void;
  onAbrirJardin: () => void;
  onAbrirAcademia: () => void;
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void;
}) {
  // Tip del día con botón "dame otro"
  const [indiceTip, setIndiceTip] = useState(0);
  const tip = useMemo(() => tipDelDia(indiceTip), [indiceTip]);

  // 🛰️ v1.4: clima inteligente
  const [clima, setClima] = useState<InfoClima | null>(null);
  const [errorClima, setErrorClima] = useState<ErrorClima>(null);
  const [cargandoClima, setCargandoClima] = useState(true);
  useEffect(() => {
    let vivo = true;
    void obtenerClima().then(r => {
      if (!vivo) return;
      setClima(r.clima);
      setErrorClima(r.error);
      setCargandoClima(false);
    });
    return () => { vivo = false; };
  }, []);
  const reintentarClima = async () => {
    setCargandoClima(true);
    const r = await obtenerClima(true);
    setClima(r.clima);
    setErrorClima(r.error);
    setCargandoClima(false);
    if (r.error === 'permiso') {
      onToast('info', '📍 Toca «Mientras usas la app» — si ya no pregunta: Ajustes → Apps → PlantTrack → Permisos → Ubicación');
    }
  };

  // 🧳 v1.4: modo vacaciones
  const vacaciones = useMemo(() => leerVacaciones(), []);

  const compartirGuia = async () => {
    const guia = generarGuiaCuidador(plantas);
    try {
      if (esNativo()) {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title: 'Guía del cuidador 🌱', text: guia, dialogTitle: 'Mandar la guía' });
      } else {
        await navigator.clipboard.writeText(guia);
        onToast('exito', '📋 Guía del cuidador copiada — pégala en WhatsApp');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(guia);
        onToast('exito', '📋 Guía copiada al portapapeles');
      } catch { onToast('info', 'No se pudo compartir la guía'); }
    }
  };

  // Gamificación (se recalcula cuando cambia el jardín)
  const [tick, setTick] = useState(0);
  useEffect(() => { setTick(t => t + 1); }, [plantas.length]);

  const { progreso, nivel, racha, score, logrosNuevos, lecciones } = useMemo(() => {
    const prog = leerProgreso();
    const { actual, siguiente, progresoPct } = nivelActual(prog.xp);
    const { lista } = evaluarLogros(plantas);
    return {
      progreso: prog,
      nivel: { actual, siguiente, progresoPct },
      racha: calcularRacha(),
      score: greenScore(plantas),
      logrosNuevos: lista,
      lecciones: leccionesCompletadas().length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantas, tick]);

  // Stats del jardín
  const stats = useMemo(() => {
    const pendientes = pendientesDeRiego(plantas);
    const vencidas = plantas.filter(p => estadoRiego(p) === 'vencido').length;
    const hoy = plantas.filter(p => estadoRiego(p) === 'hoy').length;
    const especies = new Set(plantas.map(p => p.ficha.nombreCientifico?.toLowerCase() || p.ficha.nombreComun)).size;
    const riegos30 = plantas.reduce((n, p) => n + (p.historialRiego || []).filter(f =>
      Date.now() - new Date(f).getTime() < 30 * 86400000).length, 0);
    const fotos = plantas.reduce((n, p) => n + (p.fotos || []).length, 0);
    return { pendientes: pendientes.slice(0, 4), vencidas, hoy, especies, riegos30, fotos };
  }, [plantas]);

  const logrosDesbloqueados = logrosNuevos.filter(l => l.completado).length;

  return (
    <div className="space-y-4">
      {/* Saludo + CTA principal */}
      <section className="rounded-3xl p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-900/50 relative overflow-hidden">
        <Leaf className="absolute -right-4 -top-4 w-28 h-28 text-emerald-800/30 rotate-12" />
        <p className="text-sm text-slate-400 font-semibold">{saludo()}</p>
        <h2 className="text-2xl font-black mt-1 leading-tight">
          {plantas.length === 0 ? (
            <>¿Qué planta es esa?<br /><span className="text-emerald-400">Descúbrelo con una foto</span></>
          ) : (
            <>Tu jardín tiene<br /><span className="text-emerald-400">{plantas.length} planta{plantas.length === 1 ? '' : 's'}</span> 🌱</>
          )}
        </h2>
        <button
          onClick={onIdentificar}
          className="mt-4 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-900/40 active:scale-[0.98] transition"
        >
          <Camera className="w-5 h-5" />
          Identificar planta
        </button>
      </section>

      {/* ── Nivel de jardinero + racha (gamificación) ── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-2xl shadow-lg shadow-emerald-900/40">
            {nivel.actual.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-black truncate">{nivel.actual.nombre}</p>
              <span className="text-[10px] text-slate-500 font-bold shrink-0">{progreso.xp} XP</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-700"
                style={{ width: `${nivel.progresoPct}%` }}
              />
            </div>
            {nivel.siguiente ? (
              <p className="text-[10px] text-slate-500 mt-1">
                {nivel.siguiente.minXP - progreso.xp} XP para {nivel.siguiente.emoji} {nivel.siguiente.nombre}
              </p>
            ) : (
              <p className="text-[10px] text-amber-400/80 mt-1">🏆 Nivel máximo alcanzado</p>
            )}
          </div>
          <div className="text-center shrink-0">
            <p className="flex items-center gap-1 text-lg font-black text-orange-400">
              <Flame className={`w-4 h-4 ${racha > 0 ? 'text-orange-500 animar-latido' : 'text-slate-600'}`} />
              {racha}
            </p>
            <p className="text-[9px] text-slate-500 font-bold uppercase">racha</p>
          </div>
        </div>
      </section>

      {/* ── 🧳 v1.4: banner modo vacaciones ── */}
      {vacaciones.activa && (
        <section className="rounded-2xl p-4 bg-gradient-to-r from-orange-950/60 to-slate-900 border border-orange-800/60 flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-900/40">
            <Plane className="w-5 h-5 text-white" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-orange-200">Modo vacaciones activo</p>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              {vacaciones.cuidador ? `${vacaciones.cuidador} está al mando` : 'Alguien cuida tus plantas'} — manda la guía con las instrucciones.
            </p>
          </div>
          <button
            onClick={compartirGuia}
            aria-label="Compartir guía del cuidador"
            className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-700/60 flex items-center justify-center shrink-0 active:scale-95 transition"
          >
            <Share2 className="w-5 h-5 text-orange-300" />
          </button>
        </section>
      )}

      {/* Stats rápidas */}
      <section className="grid grid-cols-3 gap-3" aria-label="Resumen del jardín">
        {[
          {
            icono: Flower2, valor: plantas.length, texto: 'Plantas', color: 'text-emerald-400',
            detalle: 'en tu jardín', detalleColor: 'text-slate-500',
          },
          {
            icono: Bug, valor: stats.especies, texto: 'Especies', color: 'text-lime-400',
            detalle: 'variedades', detalleColor: 'text-slate-500',
          },
          {
            icono: CalendarClock,
            valor: stats.vencidas + stats.hoy,
            texto: 'Por regar',
            color: (stats.vencidas + stats.hoy) > 0 ? 'text-amber-400' : 'text-emerald-400',
            detalle: stats.vencidas > 0
              ? `${stats.vencidas} vencida${stats.vencidas === 1 ? '' : 's'} · ${stats.hoy} hoy`
              : stats.hoy > 0 ? 'toca hoy' : 'todo al día 🌿',
            detalleColor: stats.vencidas > 0 ? 'text-red-400' : stats.hoy > 0 ? 'text-amber-400' : 'text-emerald-400',
          },
        ].map(({ icono: Icono, valor, texto, color, detalle, detalleColor }) => (
          <div key={texto} className="rounded-2xl p-3.5 bg-slate-900 border border-slate-800 text-center">
            <Icono className={`w-5 h-5 mx-auto ${color}`} />
            <p className="text-xl font-black mt-1.5 leading-none">{valor}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wide">{texto}</p>
            <p className={`text-[9px] font-bold mt-1 leading-tight ${detalleColor}`}>{detalle}</p>
          </div>
        ))}
      </section>

      {/* ── Academia PlantTrack ── */}
      <button
        onClick={onAbrirAcademia}
        className="w-full rounded-3xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-900/50 p-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition relative overflow-hidden"
      >
        <GraduationCap className="absolute -right-3 -bottom-3 w-20 h-20 text-indigo-800/20" />
        <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
          <GraduationCap className="w-6 h-6 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black flex items-center gap-2">
            Academia PlantTrack
            {lecciones < TOTAL_LECCIONES && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300">
                {lecciones}/{TOTAL_LECCIONES}
              </span>
            )}
            {lecciones >= TOTAL_LECCIONES && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/25 text-amber-300">🎓 completa</span>
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {lecciones === 0
              ? 'Mini-lecciones de 1-2 min: riego, luz, plagas…'
              : `¡Vas ${lecciones} de ${TOTAL_LECCIONES}! Sigue aprendiendo 🌿`}
          </p>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
              style={{ width: `${Math.round((lecciones / TOTAL_LECCIONES) * 100)}%` }}
            />
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-indigo-400 shrink-0" />
      </button>

      {/* ── 🛰️ v1.4: clima inteligente ── */}
      {cargandoClima ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-3 animate-pulse">
          <CloudSun className="w-5 h-5 text-sky-400" />
          <p className="text-xs text-slate-500">Mirando el cielo de tu zona…</p>
        </div>
      ) : clima ? (
        (() => {
          const consejo = consejoDeRiego(clima);
          const cielo = describirCodigo(clima.codigo);
          return (
            <section className={`rounded-2xl p-4 border flex items-start gap-3 ${
              consejo?.tono === 'lluvia' ? 'bg-sky-950/40 border-sky-800/60'
              : consejo?.tono === 'calor' ? 'bg-red-950/30 border-red-900/50'
              : consejo?.tono === 'frio' ? 'bg-indigo-950/30 border-indigo-900/50'
              : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-2xl shrink-0">{consejo?.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black">{consejo?.titulo}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{consejo?.texto}</p>
                <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {clima.tempMin}° / {clima.tempMax}°C · {cielo.texto}
                </p>
              </div>
              <button
                onClick={reintentarClima}
                aria-label="Actualizar clima"
                className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center shrink-0 active:scale-95 transition"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </section>
          );
        })()
      ) : (
        <button
          onClick={reintentarClima}
          className="w-full rounded-2xl bg-slate-900 border border-dashed border-slate-700 p-4 flex items-center gap-3 text-left active:scale-[0.98] transition"
        >
          <CloudSun className="w-5 h-5 text-sky-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Clima inteligente</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              {errorClima === 'permiso'
                ? 'Toca Activar y acepta el permiso de ubicación para el pronóstico de tu zona. Si Android ya no pregunta: Ajustes → Apps → PlantTrack → Permisos → Ubicación.'
                : 'Sin datos del clima ahora — reintenta cuando tengas conexión.'}
            </p>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1.5 rounded-xl bg-sky-500/15 text-sky-300 shrink-0">Activar</span>
        </button>
      )}

      {/* Próximos riegos */}
      <section className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-black flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-400" /> Próximos riegos
          </h3>
          {plantas.length > 0 && (
            <button onClick={onAbrirJardin} className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
              Ver todo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {plantas.length === 0 ? (
          <div className="px-4 pb-4 pt-1 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Guarda tu primera planta y aquí verás <b className="text-slate-300">cuándo regar cada una</b>.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/70">
            {stats.pendientes.map(p => {
              const est = estadoRiego(p);
              const nombre = p.apodo || p.ficha.nombreComun;
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <img src={p.fotoDataUrl} alt={nombre} className="w-11 h-11 rounded-xl object-cover border border-slate-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{nombre}</p>
                    <p className="text-[11px] text-slate-500">{formatoCorto(p.ultimoRiego)} → {formatoCorto(p.proximoRiego)}</p>
                  </div>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                    est === 'vencido' ? 'bg-red-500/15 text-red-400'
                    : est === 'hoy' ? 'bg-amber-500/15 text-amber-400'
                    : est === 'proximo' ? 'bg-sky-500/15 text-sky-400'
                    : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {textoRiego(p)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Tip del Día (mejorado) ── */}
      <section className="rounded-2xl p-4 bg-amber-950/30 border border-amber-900/40">
        <div className="flex gap-3">
          <span className="text-2xl shrink-0">{tip.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-black text-amber-400/90 uppercase tracking-wide">Tip del día</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300/80">
                {ETIQUETA_CATEGORIA[tip.categoria]}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mt-1">{tip.texto}</p>
          </div>
        </div>
        <button
          onClick={() => setIndiceTip(i => i + 1)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/10 border border-amber-700/40 text-[11px] font-black text-amber-300 active:scale-[0.98] transition"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Dame otro tip
        </button>
      </section>

      {/* ── Green Score + estadísticas ── */}
      {plantas.length > 0 && (
        <section className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-14 h-14 shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(30 41 59)" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke={score >= 70 ? 'rgb(52 211 153)' : score >= 40 ? 'rgb(251 191 36)' : 'rgb(248 113 113)'}
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 97.4} 97.4`}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{score}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Green Score
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                {score >= 85 ? '¡Jardín impecable! Estás al día con todo 🏆'
                  : score >= 60 ? 'Buen ritmo — un par de riegos pendientes'
                  : score >= 35 ? 'Hay plantas sedientas esperándote 💧'
                  : 'SOS vegetal: varias plantas necesitan atención 🚨'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/70">
            {[
              { icono: Droplets, valor: stats.riegos30, texto: 'riegos / 30 días' },
              { icono: Camera, valor: stats.fotos, texto: 'fotos' },
              { icono: Trophy, valor: logrosDesbloqueados, texto: 'logros' },
            ].map(({ icono: Icono, valor, texto }) => (
              <div key={texto} className="text-center pt-2.5">
                <Icono className="w-4 h-4 mx-auto text-slate-500" />
                <p className="text-base font-black mt-0.5 leading-none">{valor}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-1">{texto}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
