import { FastifyInstance } from 'fastify';
import { env } from '../env.js';

const firebaseConfigSchema = {
  type: 'object',
  properties: {
    apiKey: { type: 'string', nullable: true },
    authDomain: { type: 'string', nullable: true },
    projectId: { type: 'string', nullable: true },
    appId: { type: 'string', nullable: true },
    messagingSenderId: { type: 'string', nullable: true },
  },
} as const;

const configResponseSchema = {
  type: 'object',
  properties: {
    firebase: firebaseConfigSchema,
  },
  required: ['firebase'],
} as const;

// GET /config — public, no auth.
// Serve al frontend i valori che storicamente erano hardcoded in index.html
// (apiKey, authDomain, ecc.). Non sono segreti: sono già visibili nel bundle
// del browser comunque, ma centralizzandoli sul backend evitiamo:
//  - di committare valori "demo" nel repo del FE,
//  - di rebuildare il container del FE quando cambiano (es. swap progetto Firebase).
export async function configRoutes(app: FastifyInstance) {
  app.get(
    '/config',
    {
      schema: {
        tags: ['system'],
        response: { 200: configResponseSchema },
      },
    },
    async () => ({
      firebase: {
        apiKey: env.webFirebase.apiKey ?? null,
        authDomain: env.webFirebase.authDomain ?? null,
        projectId: env.webFirebase.projectId ?? null,
        appId: env.webFirebase.appId ?? null,
        messagingSenderId: env.webFirebase.messagingSenderId ?? null,
      },
    })
  );
}
