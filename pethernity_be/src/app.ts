import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import rawBody from 'fastify-raw-body';
import { ZodError } from 'zod';
import { env } from './env.js';
import firebasePlugin from './plugins/firebase.js';
import authPlugin from './plugins/auth.js';
import { authRoutes } from './routes/auth.js';
import { headstoneRoutes } from './routes/headstones.js';
import { paymentRoutes } from './routes/payments.js';
import { webhookRoutes } from './routes/webhooks.js';
import { configRoutes } from './routes/config.js';

export async function buildApp() {
  const app = Fastify({ logger: env.nodeEnv !== 'test' });

  await app.register(cookie);
  await app.register(cors, {
    origin: env.nodeEnv === 'test' ? true : env.frontendOrigin,
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
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: 'Invalid payload',
        issues: error.flatten().fieldErrors,
      });
    }

    const status = error.statusCode ?? 500;
    if (status >= 500) {
      request.log.error(error);
      return reply.code(status).send({ message: 'Internal server error' });
    }
    return reply.code(status).send({ message: error.message });
  });

  await app.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: false,
    runFirst: true,
  });

  await app.register(firebasePlugin);
  await app.register(authPlugin);
  await app.register(configRoutes);
  await app.register(authRoutes);
  await app.register(headstoneRoutes);
  await app.register(paymentRoutes);
  await app.register(webhookRoutes);

  app.get('/openapi.json', { schema: { hide: true } as any }, async () => app.swagger());
  app.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        response: {
          200: {
            type: 'object',
            properties: { ok: { type: 'boolean' } },
            required: ['ok'],
          },
        },
      },
    },
    async () => ({ ok: true })
  );

  return app;
}
