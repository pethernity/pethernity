import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { fetchPublicConfig } from '../api/config';

let cachedAuth: Auth | null = null;
let initPromise: Promise<Auth> | null = null;
let currentUser: User | null = null;
const listeners = new Set<(user: User | null) => void>();

// Inizializza Firebase Web fetchando la config dal backend (GET /config).
// Idempotente: chiamate concorrenti condividono la stessa Promise.
export function initAuth(): Promise<Auth> {
  if (cachedAuth) return Promise.resolve(cachedAuth);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { firebase: cfg } = await fetchPublicConfig();
    const app: FirebaseApp = getApps()[0] ?? initializeApp(cfg);
    cachedAuth = getAuth(app);

    onAuthStateChanged(cachedAuth, (user) => {
      currentUser = user;
      listeners.forEach((cb) => cb(user));
    });

    return cachedAuth;
  })();

  return initPromise;
}

// Token corrente (null se Firebase non ancora inizializzato o utente non loggato).
// L'init parte all'avvio dell'app (vedi main.ts), quindi in pratica è raro
// che ritorni null per non-aver-inizializzato; è la situazione "utente anonimo".
export async function getCurrentIdToken(): Promise<string | null> {
  if (!cachedAuth) return null;
  const user = cachedAuth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function onUserChange(cb: (user: User | null) => void): () => void {
  listeners.add(cb);
  cb(currentUser);
  return () => listeners.delete(cb);
}

export async function signInWithGoogle(): Promise<User> {
  const auth = await initAuth();
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return result.user;
}

export async function signOutCurrentUser(): Promise<void> {
  if (!cachedAuth) return;
  await signOut(cachedAuth);
}
