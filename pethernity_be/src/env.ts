import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  cookieName: process.env.COOKIE_NAME ?? 'petcem_auth',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
