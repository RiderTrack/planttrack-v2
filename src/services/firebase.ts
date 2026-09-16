// ═══════════════════════════════════════════════════════════
// 🔥 PLANTTRACK V2 — services/firebase.ts
// Inicialización DEFENSIVA de Firebase.
//
// El proyecto Firebase de PlantTrack es NUEVO (plan Spark, gratis)
// y separado de RiderTrack. Cuando exista, se pegan los valores
// del google-services.json aquí abajo y FIREBASE_LISTO pasa a true.
//
// Hasta entonces la app funciona 100% en modo local (localStorage),
// exactamente igual que siempre — ninguna otra parte del código
// puede romperse por esto.
// ═══════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────
// PASO 1 AL CREAR EL PROYECTO: pegar aquí los valores del
// archivo google-services.json que descargues de Firebase Console
// (mismo patrón que RiderTrack v2 — firebase.ts).
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Client ID OAuth web/default (oauth_client client_type 3 del
// google-services.json). Referencia: el APK lo recibe por strings.xml
// (lo inyecta el CI), la web no lo necesita. Se pega solo como doc.
export const SERVER_CLIENT_ID = '';

/** true cuando los valores ya fueron pegados → se activa Auth + Sync.
 *  (En la APK el server_client_id llega vía strings.xml del CI.) */
export function firebaseListo(): boolean {
  return (
    firebaseConfig.apiKey.length > 10 &&
    firebaseConfig.projectId.length > 3
  );
}

// ── Singleton defensivo: solo se inicializa si hay config válida ──
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (firebaseListo()) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    // Nunca debe tirar la app por un problema de Firebase
    console.warn('[PlantTrack] Firebase no pudo inicializar:', e);
    app = null; auth = null; db = null;
  }
}

export const firebaseApp = app;
export { auth, db, GoogleAuthProvider };
