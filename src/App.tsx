// ═══════════════════════════════════════════════════════════
// 🌿 PLANTTRACK V2 — App.tsx
// Orquestador principal: pestañas + toasts + arranque nativo.
// Estructura heredada de RiderTrack V2 (una vista por módulo).
// ═══════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { hayToken } from './services/claude';
import { useJardin } from './hooks/useJardin';
import type { CuentaUsuario } from './services/cuenta';
import { observarSesion } from './services/cuenta';
import { iniciarSincronizacion, detenerSincronizacion, observarSync } from './services/sync';

export default function App() {
  const [tab, setTab] = useState<NavigationTab>('inicio');
  const [toasts, setToasts] = useState<AvisoToast[]>([]);
  // ¿Hay token de IA? Se relee cuando Ajustes lo cambia. IMPORTANTE:
  // refrescarIA es ESTABLE (useCallback sin deps) — si fuera una función
  // inline se recrearía en cada render y el auto-guardado de Ajustes
  // entraría en un bucle infinito de re-renderizados (bug de la 1.0.0:
  // en Android el teclado perdía el token pegado por esa pelea).
  const [iaConectada, setIaConectada] = useState(hayToken());
  const refrescarIA = useCallback(() => setIaConectada(hayToken()), []);
  const jardin = useJardin();
  // ☁️ Sesión de nube (opcional): el observer vive a nivel raíz para
  // que el sync corra en background sin importar la pestaña activa.
  // Si Firebase no está configurado → siempre null y no pasa nada.
  const [cuenta, setCuenta] = useState<CuentaUsuario | null>(() => null);
  useEffect(() => {
    const parar = observarSesion(c => {
      setCuenta(c);
      if (c) iniciarSincronizacion(c.uid);
      else detenerSincronizacion();
    });
    return parar;
  }, []);
  // Cuando el sync termina un ciclo (pull o push) → refrescar el
  // jardín en pantalla (el pull inicial puede traer plantas nuevas).
  useEffect(() => {
    const parar = observarSync(estado => {
      if (estado === 'sincronizado') jardin.refrescar();
    });
    return parar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast global (mismo patrón que RiderTrack)
  const lanzarToast = useCallback((tipo: AvisoToast['tipo'], texto: string) => {
    const id = crypto.randomUUID();
    setToasts(ts => [...ts, { id, tipo, texto }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3400);
  }, []);

  // Arranque en APK: ocultar splash + botón "atrás" inteligente.
  // El listener se registra UNA sola vez (antes se acumulaba uno por
  // cada cambio de pestaña) y lee la pestaña actual vía ref.
  const tabRef = useRef(tab);
  useEffect(() => { tabRef.current = tab; }, [tab]);
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
          if (tabRef.current !== 'inicio') setTab('inicio');
          else CapApp.exitApp();
        });
      } catch { /* ok */ }
    })();
  }, []);

  // Identificar desde Dashboard: sube a la pestaña de cámara
  const irAIdentificar = useCallback(() => setTab('identificar'), []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header tab={tab} conectado={iaConectada} onCambiarTab={setTab} />

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
              <IdentificarView onGuardar={jardin.agregar} onToast={lanzarToast} demo={!iaConectada} onIrAjustes={() => setTab('ajustes')} />
            )}
            {tab === 'jardin' && (
              <JardinView jardin={jardin} onToast={lanzarToast} />
            )}
            {tab === 'chat' && (
              <ChatBotanicoView plantas={jardin.plantas} onToast={lanzarToast} onIrAjustes={() => setTab('ajustes')} />
            )}
            {tab === 'ajustes' && (
              <AjustesView onToast={lanzarToast} onCambioIA={refrescarIA} cuenta={cuenta} onCambioCuenta={setCuenta} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav tab={tab} onCambiarTab={setTab} />
      <ToastContainer toasts={toasts} onCerrar={id => setToasts(ts => ts.filter(t => t.id !== id))} />
    </div>
  );
}
