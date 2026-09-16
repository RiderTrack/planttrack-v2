// ═══════════════════════════════════════════════════════════
// 🌿 PLANTTRACK V2 — App.tsx
// Orquestador principal: pestañas + toasts + arranque nativo.
// Estructura heredada de RiderTrack V2 (una vista por módulo).
// ═══════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { NavigationTab, AvisoToast } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { IdentificarView } from './components/IdentificarView';
import { JardinView } from './components/JardinView';
import { ChatBotanicoView } from './components/ChatBotanicoView';
import { AjustesView } from './components/AjustesView';
import { esNativo } from './services/plataforma';
import { useJardin } from './hooks/useJardin';

export default function App() {
  const [tab, setTab] = useState<NavigationTab>('inicio');
  const [toasts, setToasts] = useState<AvisoToast[]>([]);
  const jardin = useJardin();

  // Toast global (mismo patrón que RiderTrack)
  const lanzarToast = useCallback((tipo: AvisoToast['tipo'], texto: string) => {
    const id = crypto.randomUUID();
    setToasts(ts => [...ts, { id, tipo, texto }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3400);
  }, []);

  // Arranque en APK: ocultar splash + botón "atrás" inteligente
  useEffect(() => {
    (async () => {
      if (!esNativo()) return;
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch { /* ok */ }
      try {
        const { App: CapApp } = await import('@capacitor/app');
        CapApp.addListener('backButton', () => {
          if (tab !== 'inicio') setTab('inicio');
          else CapApp.exitApp();
        });
      } catch { /* ok */ }
    })();
  }, [tab]);

  // Identificar desde Dashboard: sube a la pestaña de cámara
  const irAIdentificar = useCallback(() => setTab('identificar'), []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header tab={tab} onCambiarTab={setTab} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'inicio' && (
              <DashboardView plantas={jardin.plantas} onIdentificar={irAIdentificar} onAbrirJardin={() => setTab('jardin')} />
            )}
            {tab === 'identificar' && (
              <IdentificarView onGuardar={jardin.agregar} onToast={lanzarToast} />
            )}
            {tab === 'jardin' && (
              <JardinView jardin={jardin} onToast={lanzarToast} />
            )}
            {tab === 'chat' && (
              <ChatBotanicoView plantas={jardin.plantas} onToast={lanzarToast} onIrAjustes={() => setTab('ajustes')} />
            )}
            {tab === 'ajustes' && (
              <AjustesView onToast={lanzarToast} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav tab={tab} onCambiarTab={setTab} />
      <ToastContainer toasts={toasts} onCerrar={id => setToasts(ts => ts.filter(t => t.id !== id))} />
    </div>
  );
}
