// ═══════════════════════════════════════════════════════════
// 👤 PLANTTRACK V2 — services/cuenta.ts
// Autenticación con Google (opcional).
//  • Android/APK → plugin nativo @codetrix-studio/capacitor-google-auth
//    (usa la cuenta del teléfono, sin fricción).
//  • Web (Pages) → signInWithPopup de Firebase Auth.
//  • Sin Firebase configurado → "modo local": la app completa
//    funciona sin cuenta, igual que la v1.0.x.
// ═══════════════════════════════════════════════════════════

import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import {
  auth,
  firebaseListo,
  GoogleAuthProvider,
} from './firebase';
import {
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

export interface CuentaUsuario {
  uid: string;
  nombre: string;
  email: string;
  fotoUrl: string;
}

/** El plugin nativo se inicializa una sola vez (Android/iOS). */
let pluginNativoListo = false;
function asegurarPluginNativo(): void {
  if (!pluginNativoListo && Capacitor.isNativePlatform()) {
    GoogleAuth.initialize();
    pluginNativoListo = true;
  }
}

function aCuentaUsuario(u: User): CuentaUsuario {
  return {
    uid: u.uid,
    nombre: u.displayName || u.email?.split('@')[0] || 'Jardinero',
    email: u.email || '',
    fotoUrl: u.photoURL || '',
  };
}

/** ¿Hay auth disponible? (Firebase configurado) */
export function authDisponible(): boolean {
  return firebaseListo() && !!auth;
}

/** Traduce errores técnicos de Google Auth a mensajes humanos. */
function traducirError(e: unknown): string {
  const cod = (e as { code?: string })?.code || '';
  const msg = String((e as { message?: string })?.message || e || '');

  // Nativo: code 10 = DEVELOPER_ERROR → casi siempre SHA-1 sin registrar
  if (/\b10\b|DEVELOPER_ERROR/i.test(msg) || cod === '10') {
    return 'Falta registrar la huella SHA-1 de la app en Firebase (Consola → Configuración del proyecto → Tus apps).';
  }
  // Nativo: server_client_id sin configurar en el build
  if (/server_client_id|serverClientId/i.test(msg)) {
    return 'El APK no incluye el client ID de Google — descargá la última versión.';
  }
  // Web: proveedor Google deshabilitado en Authentication
  if (/configuration-not-found|operation-not-allowed/i.test(cod)) {
    return 'Habilitá Google en Firebase → Authentication → Sign-in method.';
  }
  if (/popup-closed-by-user|cancel/i.test(cod)) {
    return 'Cancelaste el inicio de sesión.';
  }
  if (/unauthorized-domain/i.test(cod)) {
    return 'Este dominio no está autorizado en Firebase → Authentication → Settings.';
  }
  if (/network|fetch/i.test(msg)) {
    return 'Sin conexión a internet. Revisá tu red e intentá de nuevo.';
  }
  return 'No se pudo iniciar sesión con Google. Intentá de nuevo.';
}

/** Login con Google — nativo en APK, popup en web. */
export async function iniciarSesionGoogle(): Promise<CuentaUsuario> {
  if (!authDisponible()) {
    throw new Error('Firebase aún no está configurado en esta versión.');
  }
  asegurarPluginNativo();

  if (Capacitor.isNativePlatform()) {
    // Fluyo nativo: el plugin devuelve el idToken de la cuenta del teléfono
    let resultado;
    try {
      resultado = await GoogleAuth.signIn();
    } catch (e) {
      console.warn('[PlantTrack] GoogleAuth.signIn:', e);
      throw new Error(traducirError(e));
    }
    const credencial = GoogleAuthProvider.credential(resultado.authentication.idToken);
    const uc = await signInWithCredential(auth!, credencial);
    return aCuentaUsuario(uc.user);
  }

  // Web: popup clásico
  const proveedor = new GoogleAuthProvider();
  try {
    const uc = await signInWithPopup(auth!, proveedor);
    return aCuentaUsuario(uc.user);
  } catch (e) {
    console.warn('[PlantTrack] signInWithPopup:', e);
    throw new Error(traducirError(e));
  }
}

/** Cierra sesión (local + remota). Nunca lanza. */
export async function cerrarSesion(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform() && pluginNativoListo) {
      await GoogleAuth.signOut();
    }
    if (auth) await firebaseSignOut(auth);
  } catch (e) {
    console.warn('[PlantTrack] signOut:', e);
  }
}

/** Observer de sesión (para reaccionar a login/logout). Devuelve unsubscribe. */
export function observarSesion(callback: (cuenta: CuentaUsuario | null) => void): () => void {
  if (!auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, (u) => callback(u ? aCuentaUsuario(u) : null));
}

/** Sesión actual síncrona (para pintar UI al arrancar). */
export function sesionActual(): CuentaUsuario | null {
  if (!auth) return null;
  const u = auth.currentUser;
  return u ? aCuentaUsuario(u) : null;
}
