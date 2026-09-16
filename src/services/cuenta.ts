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

/** Login con Google — nativo en APK, popup en web. */
export async function iniciarSesionGoogle(): Promise<CuentaUsuario> {
  if (!authDisponible()) {
    throw new Error('Firebase aún no está configurado en esta versión.');
  }
  asegurarPluginNativo();

  if (Capacitor.isNativePlatform()) {
    // Fluyo nativo: el plugin devuelve el idToken de la cuenta del teléfono
    const resultado = await GoogleAuth.signIn();
    const credencial = GoogleAuthProvider.credential(resultado.authentication.idToken);
    const uc = await signInWithCredential(auth!, credencial);
    return aCuentaUsuario(uc.user);
  }

  // Web: popup clásico
  const proveedor = new GoogleAuthProvider();
  const uc = await signInWithPopup(auth!, proveedor);
  return aCuentaUsuario(uc.user);
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
