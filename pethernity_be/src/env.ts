import 'dotenv/config';
import { z } from 'zod';

// Treat empty strings as missing so .env.example placeholders don't fail validation
const optionalString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().optional()
);
const optionalEmail = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().email().optional()
);

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  COOKIE_NAME: z.string().min(1).default('petcem_auth'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),

  FIREBASE_PROJECT_ID: optionalString,
  FIREBASE_CLIENT_EMAIL: optionalEmail,
  FIREBASE_PRIVATE_KEY: optionalString,

  // Public Firebase Web SDK config — served to the frontend via GET /config.
  // Pubblici per design (apiKey è ristretta per dominio in Firebase Console).
  WEB_FIREBASE_API_KEY: optionalString,
  WEB_FIREBASE_AUTH_DOMAIN: optionalString,
  WEB_FIREBASE_APP_ID: optionalString,
  WEB_FIREBASE_MESSAGING_SENDER_ID: optionalString,

  // Payment Link Stripe (URL pubblico tipo https://buy.stripe.com/...).
  // Era hardcoded nel frontend originale; ora vive solo qui.
  STRIPE_PAYMENT_LINK: optionalString,
  // Webhook signing secret (whsec_...): NUOVO requisito di sicurezza.
  // Lo ottieni da `stripe listen` in locale o dal Webhook endpoint creato
  // sul Dashboard Stripe in produzione. Senza questo il backend non accetta
  // webhook (per evitare che un attaccante falsifichi pagamenti).
  STRIPE_WEBHOOK_SECRET: optionalString,
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  port: raw.PORT,
  databaseUrl: raw.DATABASE_URL,
  jwtSecret: raw.JWT_SECRET,
  cookieName: raw.COOKIE_NAME,
  nodeEnv: raw.NODE_ENV,
  frontendOrigin: raw.FRONTEND_ORIGIN,
  firebase: {
    projectId: raw.FIREBASE_PROJECT_ID,
    clientEmail: raw.FIREBASE_CLIENT_EMAIL,
    privateKey: raw.FIREBASE_PRIVATE_KEY,
  },
  webFirebase: {
    apiKey: raw.WEB_FIREBASE_API_KEY,
    authDomain: raw.WEB_FIREBASE_AUTH_DOMAIN,
    projectId: raw.FIREBASE_PROJECT_ID, // condiviso con admin
    appId: raw.WEB_FIREBASE_APP_ID,
    messagingSenderId: raw.WEB_FIREBASE_MESSAGING_SENDER_ID,
  },
  stripe: {
    paymentLink: raw.STRIPE_PAYMENT_LINK,
    webhookSecret: raw.STRIPE_WEBHOOK_SECRET,
  },
};
