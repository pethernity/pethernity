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

let cachedAuth: Auth | null = null;
let currentUser: User | null = null;
const listeners = new Set<(user: User | null) => void>();

export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyC5p224UMGY3q225-P44Fpp4npzEHPIpBE',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'pixelmeadow-9cf1a.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'pixelmeadow-9cf1a',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:447283321975:web:d57be095f123dc72a33a72',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '447283321975',
  };

  const app: FirebaseApp = getApps()[0] ?? initializeApp(config);
  cachedAuth = getAuth(app);

  onAuthStateChanged(cachedAuth, (user) => {
    currentUser = user;
    listeners.forEach((cb) => cb(user));
  });

  return cachedAuth;
}

export async function getCurrentIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
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
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return result.user;
}

export async function signOutCurrentUser(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}
