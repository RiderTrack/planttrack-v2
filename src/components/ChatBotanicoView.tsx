// ═══════════════════════════════════════════════════════════
// 💬 PLANTTRACK V2 — components/ChatBotanicoView.tsx
// Conversación con el botánico IA. Contexto: tus plantas
// guardadas. Historial en localStorage (última charla).
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { Send, Sprout, User, TriangleAlert, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { MensajeChat, PlantaGuardada } from '../types';
import { chatearBotanica } from '../services/claude';

const LS_CHAT = 'planttrack.chat';

function cargarHistorial(): MensajeChat[] {
  try { return JSON.parse(localStorage.getItem(LS_CHAT) || '[]'); } catch { return []; }
}

export function ChatBotanicoView({
  plantas,
  onToast,
  onIrAjustes,
}: {
  plantas: PlantaGuardada[];
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void;
  onIrAjustes: () => void;
}) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>(cargarHistorial);
  const [entrada, setEntrada] = useState('');
  const [pensando, setPensando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(LS_CHAT, JSON.stringify(mensajes.slice(-40))); } catch { /* lleno */ }
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, pensando]);

  const enviar = async (textoPregunta?: string) => {
    const pregunta = (textoPregunta ?? entrada).trim();
    if (!pregunta || pensando) return;
    setEntrada('');
    const mios: MensajeChat[] = [...mensajes, { id: crypto.randomUUID(), rol: 'user', texto: pregunta, fecha: new Date().toISOString() }];
    setMensajes(mios);
    setPensando(true);

    // Contexto del jardín para respuestas personalizadas
    const contexto = plantas.length > 0
      ? `[Mis plantas guardadas: ${plantas.map(p => {
          const nombre = p.apodo ? `${p.apodo} (${p.ficha.nombreComun})` : p.ficha.nombreComun;
          const local = p.ficha.nombreLocal && p.ficha.nombreLocal !== p.ficha.nombreComun ? `, aquí le decimos ${p.ficha.nombreLocal}` : '';
          return `${nombre} (riego cada ${p.ficha.cuidados.riego.frecuenciaDias} días${local})`;
        }).join('; ')}]`
      : '';

    const r = await chatearBotanica(pregunta, mios.slice(0, -1), contexto);
    setPensando(false);

    if (r.ok) {
      setMensajes(ms => [...ms, { id: crypto.randomUUID(), rol: 'assistant', texto: r.texto, fecha: new Date().toISOString() }]);
    } else if (r.error === 'MODO DEMO') {
      setMensajes(ms => [...ms, {
        id: crypto.randomUUID(), rol: 'assistant',
        texto: 'Todavía no tengo token de Claude configurado 😅\n\nAndá a **Ajustes → IA de Claude**, pegá tu token y volvé — mientras tanto podés identificar plantas en modo demo desde la cámara 📸',
        fecha: new Date().toISOString(),
      }]);
    } else {
      onToast('error', r.error || 'Error al responder');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-15rem)] min-h-[420px]">
      {/* Barra superior del chat */}
      <div className="flex items-center gap-2.5 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 mb-3">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shrink-0">
          <Sprout className="w-5 h-5 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black leading-none">Botánico IA</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {plantas.length > 0 ? `Conoce tus ${plantas.length} plantas 🪴` : 'Preguntá lo que quieras 🌿'}
          </p>
        </div>
        {mensajes.length > 0 && (
          <button
            onClick={() => { setMensajes([]); onToast('info', '🧹 Conversación limpiada'); }}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg transition"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1" role="log" aria-label="Conversación con el botánico">
        {mensajes.length === 0 && !pensando && (
          <div className="pt-8 text-center space-y-4">
            <Sprout className="w-12 h-12 text-emerald-800 mx-auto" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
              Preguntame sobre tus plantas: riego, abono, plagas, hojas amarillas…<br />
              <span className="text-slate-600">Conozco las especies que guardaste en tu jardín y sus nombres regionales 🌎</span>
            </p>
            {/* Chips de sugerencias */}
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              {[
                '¿Por qué se ponen amarillas las hojas?',
                '¿Cómo hago esquejes en agua?',
                '¿Qué le pasa a mi planta si la riego demasiado?',
                '¿Qué es el ají charapita?',
                '¿Cuándo debo trasplantar?',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="text-[11px] font-bold px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:scale-95 transition hover:border-emerald-700/60"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map(m => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${m.rol === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              m.rol === 'user' ? 'bg-slate-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
            }`}>
              {m.rol === 'user' ? <User className="w-4 h-4 text-slate-200" /> : <Sprout className="w-4 h-4 text-white" />}
            </span>
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.rol === 'user'
                ? 'bg-emerald-600 text-white rounded-tr-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
            }`}>
              {m.texto.split('**').map((parte, i) => i % 2 ? <b key={i}>{parte}</b> : parte)}
            </div>
          </motion.div>
        ))}

        {pensando && (
          <div className="flex gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4 text-white animar-respirar" />
            </span>
            <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 px-4 py-3 flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={finRef} />
      </div>

      {/* Aviso sin token */}
      {mensajes.some(m => m.texto.includes('Todavía no tengo token')) && (
        <button
          onClick={onIrAjustes}
          className="mt-2 flex items-center gap-2 rounded-2xl bg-amber-950/40 border border-amber-900/50 px-4 py-2.5 text-xs font-bold text-amber-300"
        >
          <Settings2 className="w-4 h-4" /> Configurar token de Claude
        </button>
      )}

      {/* Entrada */}
      <div className="mt-3 flex gap-2">
        <input
          value={entrada}
          onChange={e => setEntrada(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder="¿Por qué se ponen amarillas las hojas?"
          aria-label="Escribí tu pregunta"
          disabled={pensando}
          className="flex-1 pl-4 pr-3 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-600/60 focus:ring-2 focus:ring-emerald-600/20 disabled:opacity-50"
        />
        <button
          onClick={() => enviar()}
          disabled={!entrada.trim() || pensando}
          aria-label="Enviar pregunta"
          className="w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 active:scale-95 transition disabled:opacity-40 disabled:shadow-none"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
