import fp from 'fastify-plugin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { env } from '../env.js';

declare module 'fastify' {
  interface FastifyInstance {
    firebaseAuth: Auth | null;
  }
}

export default fp(async (fastify) => {
  const { projectId, clientEmail, privateKey } = env.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    fastify.log.warn(
      'Firebase Admin not configured (FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY missing). Bearer ID-token auth disabled.'
    );
    fastify.decorate('firebaseAuth', null);
    return;
  }

  const adminApp =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

  fastify.decorate('firebaseAuth', getAuth(adminApp));
});
