// ═══════════════════════════════════════════════════════════
// ⚙️ PLANTTRACK V2 — components/AjustesView.tsx
// IA (token Claude + modelo + test), tema, respaldo del jardín
// y acerca de. Firebase queda para la v2.1.
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Moon, Sun, MonitorSmartphone, Download, Upload, Info, Check, Loader2, CloudOff, KeyRound, ChevronDown } from 'lucide-react';
import { useTema, type ModoTema } from '../theme/useTema';
import {
  MODELOS_CLAUDE, leerConfigIA, guardarConfigIA, probarConexion,
} from '../services/claude';
import { exportarJardin, importarJardin, listarPlantas } from '../services/jardin';
import { useJardin } from '../hooks/useJardin';

export function AjustesView({
  onToast,
  onCambioIA,
}: {
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void;
  /** Avisa a App que la config de IA cambió para refrescar el badge del header. */
  onCambioIA?: () => void;
}) {
  const cfgInicial = leerConfigIA();
  const [token, setToken] = useState(cfgInicial.token);
  const [modelo, setModelo] = useState(cfgInicial.modelo);
  const [probando, setProbando] = useState(false);
  const [tokenVisible, setTokenVisible] = useState(false);
  const { modo, actualizarModo } = useTema();
  const { refrescar } = useJardin();

  // 🔴 FIX v1.0.2 — "el DOM es la fuente de verdad":
  // En Android el teclado/autollenado/gestor de contraseñas puede
  // escribir el token en el campo SIN disparar onChange (bug real
  // reportado: el texto quedaba visible pero React nunca se enteraba
  // → "Sin token — modo demo" con el token pegado). Solución:
  //  1) poll que lee el <input> del DOM cada 400ms
  //  2) los botones Probar/Guardar leen el DOM directamente
  //  3) sincronía extra al volver del teclado (focus/visibility)
  const inputTokenRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef(cfgInicial.token); // último valor REAL del campo
  const modeloRef = useRef(cfgInicial.modelo);
  useEffect(() => { modeloRef.current = modelo; }, [modelo]);
  const onCambioIARef = useRef(onCambioIA);
  useEffect(() => { onCambioIARef.current = onCambioIA; });
  const guardadoPendiente = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /** Escribe la config en localStorage y avisa a App. Usa solo refs
   *  → siempre lee valores frescos aunque la llame el closure del
   *  poll del mount. */
  const persistirAhora = () => {
    clearTimeout(guardadoPendiente.current);
    guardarConfigIA({ token: tokenRef.current.trim(), modelo: modeloRef.current });
    onCambioIARef.current?.();
  };

  /** Lee el valor REAL del <input> (aunque Android lo haya llenado
   *  sin eventos) y sincroniza estado + guardado con debounce. */
  const sincronizarToken = (inmediato = false) => {
    const dom = inputTokenRef.current?.value ?? '';
    if (dom === tokenRef.current) return; // sin cambios reales
    tokenRef.current = dom;
    setToken(dom);
    clearTimeout(guardadoPendiente.current);
    guardadoPendiente.current = setTimeout(persistirAhora, inmediato ? 0 : 400);
  };
  const sincronizarRef = useRef(sincronizarToken);
  useEffect(() => { sincronizarRef.current = sincronizarToken; });

  // Poll a prueba de autollenado + sincronía al volver del teclado
  useEffect(() => {
    const id = setInterval(() => sincronizarRef.current(), 400);
    const alVolver = () => sincronizarRef.current();
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', alVolver);
    window.addEventListener('pageshow', alVolver);
    return () => {
      clearInterval(id);
      clearTimeout(guardadoPendiente.current);
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', alVolver);
      window.removeEventListener('pageshow', alVolver);
    };
  }, []);

  // Cambio de modelo → persistir al toque
  const primerRender = useRef(true);
  useEffect(() => {
    if (primerRender.current) { primerRender.current = false; return; }
    persistirAhora();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo]);

  // Ambos botones leen el DOM directamente: nunca fallan aunque el
  // texto haya llegado sin eventos (caso autollenado de Android).
  const guardarIA = () => {
    const dom = inputTokenRef.current?.value ?? '';
    tokenRef.current = dom;
    setToken(dom);
    persistirAhora();
    onToast('exito', dom.trim() ? '🤖 Token guardado — IA activa' : '🤖 Token vacío — modo demo');
  };

  const probar = async () => {
    const dom = (inputTokenRef.current?.value ?? '').trim();
    if (!dom) {
      onToast('error', 'Pega tu token primero.');
      return;
    }
    tokenRef.current = inputTokenRef.current?.value ?? '';
    setToken(tokenRef.current);
    persistirAhora();
    setProbando(true);
    const r = await probarConexion({ token: dom, modelo: modeloRef.current });
    onToast(r.ok ? 'exito' : 'error', r.mensaje);
    setProbando(false);
  };

  const exportar = () => {
    const datos = exportarJardin();
    const blob = new Blob([datos], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planttrack-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('exito', '💾 Respaldo descargado');
  };

  const importarArchivo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const lector = new FileReader();
      lector.onload = () => {
        const r = importarJardin(String(lector.result));
        onToast(r.ok ? 'exito' : 'error', r.mensaje);
        if (r.ok) refrescar();
      };
      lector.readAsText(f);
    };
    input.click();
  };

  const OPCIONES_TEMA: { id: ModoTema; icono: typeof Moon; texto: string }[] = [
    { id: 'dark', icono: Moon, texto: 'Oscuro' },
    { id: 'light', icono: Sun, texto: 'Claro' },
    { id: 'auto', icono: MonitorSmartphone, texto: 'Auto' },
  ];

  return (
    <div className="space-y-4">
      {/* ── IA de Claude ── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3.5">
        <h3 className="text-sm font-black flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> IA de Claude
          <span className="ml-auto text-[10px] font-bold text-slate-500">uso personal</span>
        </h3>

        <div>
          <label htmlFor="token-ia" className="text-[11px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Token de API (Anthropic)
          </label>
          <div className="relative">
            <input
              id="token-ia"
              ref={inputTokenRef}
              type={tokenVisible ? 'text' : 'password'}
              defaultValue={token}
              onChange={() => sincronizarRef.current()}
              onBlur={() => sincronizarRef.current()}
              onPaste={() => setTimeout(() => sincronizarRef.current(true), 0)}
              placeholder="sk-ant-api03-…"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-3.5 pr-16 py-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-600/60"
            />
            <button
              onClick={() => setTokenVisible(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
            >
              {tokenVisible ? 'OCULTAR' : 'VER'}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
            Se guarda SOLO en tu dispositivo y se respalda automáticamente al pegarlo. ⚠️ El token configurado en la versión web NO aplica en la APK (y viceversa): configúralo dentro de la app que uses. Consíguelo en console.anthropic.com → API Keys.
          </p>
          <div className={`mt-2 flex items-center gap-2 text-[11px] font-bold ${token.trim().length > 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
            <span className={`w-2 h-2 rounded-full ${token.trim().length > 10 ? 'bg-emerald-400 animar-latido' : 'bg-amber-400'}`} />
            {token.trim().length > 10
              ? `Token detectado (${token.trim().length} caracteres) — IA activa en esta app`
              : 'Sin token — modo demo activo'}
          </div>
        </div>

        <div>
          <label htmlFor="modelo-ia" className="text-[11px] font-black text-slate-400 uppercase tracking-wide mb-1.5 block">Modelo</label>
          <div className="relative">
            <select
              id="modelo-ia"
              value={modelo}
              onChange={e => setModelo(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-sm font-semibold focus:outline-none focus:border-emerald-600/60"
            >
              {MODELOS_CLAUDE.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={probar}
            disabled={probando}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold active:scale-[0.97] transition disabled:opacity-50"
          >
            {probando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-emerald-400" />}
            Probar
          </button>
          <button
            onClick={guardarIA}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-sm font-black active:scale-[0.97] transition shadow-lg shadow-emerald-900/40"
          >
            Guardar
          </button>
        </div>
      </section>

      {/* ── Apariencia ── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
        <h3 className="text-sm font-black mb-3">Apariencia</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {OPCIONES_TEMA.map(({ id, icono: Icono, texto }) => (
            <button
              key={id}
              onClick={() => actualizarModo(id)}
              aria-pressed={modo === id}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition ${
                modo === id
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <Icono className="w-5 h-5" />
              {texto}
            </button>
          ))}
        </div>
      </section>

      {/* ── Respaldo del jardín ── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <h3 className="text-sm font-black">Respaldo del jardín</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {listarPlantas().length} planta(s) guardada(s) en este dispositivo. Exportá un JSON para no perderlas si cambiás de celular.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={exportar} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold active:scale-[0.97] transition">
            <Download className="w-4 h-4 text-emerald-400" /> Exportar
          </button>
          <button onClick={importarArchivo} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold active:scale-[0.97] transition">
            <Upload className="w-4 h-4 text-sky-400" /> Importar
          </button>
        </div>
      </section>

      {/* ── Sync en la nube (próximamente) ── */}
      <section className="rounded-3xl bg-slate-900/60 border border-dashed border-slate-700 p-4 flex gap-3 opacity-70">
        <CloudOff className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-slate-300">Sincronización en la nube</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Firebase Auth + Firestore llegarán en la v2.1 para acceder a tu jardín desde cualquier dispositivo. 🔜
          </p>
        </div>
      </section>

      {/* ── Acerca de ── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 flex gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed space-y-1">
          <p className="text-sm font-black text-slate-300">PlantTrack V2 · 1.0.3</p>
          <p>React 19 + Vite 6 + TypeScript + Tailwind 4 + Capacitor 6.</p>
          <p>Identificación botánica, cuidados, abonos y plagas potenciados por Claude (Anthropic).</p>
          <p>Hecho con 🌿 para riders de plantas — de la familia Track.</p>
        </div>
      </section>
    </div>
  );
}
