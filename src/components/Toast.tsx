// ═══════════════════════════════════════════════════════════
// 🍞 PLANTTRACK V2 — components/Toast.tsx
// Toasts flotantes (patrón RiderTrack) + helper avisar().
// ═══════════════════════════════════════════════════════════

import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import type { AvisoToast } from '../types';

export function ToastContainer({
  toasts,
  onCerrar,
}: {
  toasts: AvisoToast[];
  onCerrar: (id: string) => void;
}) {
  return (
    <div className="fixed top-3 left-0 right-0 z-[90] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className={`pointer-events-auto flex items-center gap-2.5 max-w-sm w-full px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur text-sm font-semibold ${
              t.tipo === 'exito' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
              : t.tipo === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-100'
              : 'bg-slate-900/95 border-slate-700 text-slate-100'
            }`}
            role="status"
          >
            {t.tipo === 'exito' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />}
            {t.tipo === 'error' && <XCircle className="w-5 h-5 shrink-0 text-red-400" />}
            {t.tipo === 'info' && <Info className="w-5 h-5 shrink-0 text-sky-400" />}
            <span className="flex-1 leading-snug">{t.texto}</span>
            <button onClick={() => onCerrar(t.id)} aria-label="Cerrar aviso" className="p-1 -m-1 rounded-full hover:bg-white/10">
              <X className="w-4 h-4 opacity-60" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Placeholder referenciado por App — mantiene compat de imports. */
export function avisar(tipo: AvisoToast['tipo'], texto: string): string {
  return texto ? `${tipo}:${texto}` : '';
}
