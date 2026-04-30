import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import { env } from './env.js';
import authPlugin from './plugins/auth.js';
import { authRoutes } from './routes/auth.js';
import { headstoneRoutes } from './routes/headstones.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cookie);
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(jwt, { secret: env.jwtSecret });
  await app.register(swagger, {
    openapi: {
      info: { title: 'Pet Cemetery API', version: '1.0.0' },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: env.cookieName,
          },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  await app.register(authPlugin);
  await app.register(authRoutes);
  await app.register(headstoneRoutes);

  app.get('/openapi.json', async () => app.swagger());
  app.get('/health', async () => ({ ok: true }));

  return app;
}
