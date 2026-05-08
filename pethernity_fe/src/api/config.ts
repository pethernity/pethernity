// Unica VITE_* che serve al frontend: l'URL del backend.
export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3030').replace(/\/$/, '');

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId: string;
};

export type PublicConfig = {
  firebase: FirebaseWebConfig;
};

let cached: PublicConfig | null = null;
let inflight: Promise<PublicConfig> | null = null;

export async function fetchPublicConfig(): Promise<PublicConfig> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const res = await fetch(`${apiBaseUrl}/config`, { credentials: 'omit' });
    if (!res.ok) throw new Error(`GET /config returned ${res.status}`);
    const data = (await res.json()) as PublicConfig;
    if (!data?.firebase?.apiKey) {
      throw new Error('Backend did not return firebase.apiKey — check WEB_FIREBASE_* env vars on the server');
    }
    cached = data;
    return data;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
