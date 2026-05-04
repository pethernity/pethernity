import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from '../env.js';
import { errorSchema, messageSchema, userPublicSchema } from '../schemas/common.js';

const authBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authBodyJsonSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
} as const;

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/auth/register',
    {
      schema: {
        tags: ['auth'],
        body: authBodyJsonSchema,
        response: {
          201: userPublicSchema,
          400: errorSchema,
          409: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const parsed = authBodySchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: 'Invalid payload' });

      const { email, password } = parsed.data;
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return reply.code(409).send({ message: 'Email already in use' });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, passwordHash } });

      return reply.code(201).send({ id: user.id, email: user.email, createdAt: user.createdAt });
    }
  );

  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['auth'],
        body: authBodyJsonSchema,
        response: {
          200: messageSchema,
          400: errorSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const parsed = authBodySchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: 'Invalid payload' });

      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) return reply.code(401).send({ message: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return reply.code(401).send({ message: 'Invalid credentials' });

      const token = await reply.jwtSign({ sub: user.id, email: user.email }, { expiresIn: '7d' });

      reply.setCookie(env.cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.nodeEnv === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return reply.send({ message: 'Logged in' });
    }
  );

  app.post(
    '/auth/logout',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['auth'],
        security: [{ cookieAuth: [] }],
        response: { 200: messageSchema, 401: errorSchema },
      },
    },
    async (_request, reply) => {
      reply.clearCookie(env.cookieName, { path: '/' });
      return reply.send({ message: 'Logged out' });
    }
  );

  app.get(
    '/auth/me',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['auth'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        response: { 200: userPublicSchema, 401: errorSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const userId = (request.user as { sub: string }).sub;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, createdAt: true },
      });
      if (!user) return reply.code(404).send({ message: 'User not found' });
      return reply.send(user);
    }
  );

  // Firebase-only: client posts an ID token (via Authorization: Bearer),
  // app.authenticate has already verified + upserted the User.
  // This endpoint just returns the resulting profile so the frontend
  // can confirm session and warm the user record.
  app.post(
    '/auth/session',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: { 200: userPublicSchema, 401: errorSchema },
      },
    },
    async (request, reply) => {
      const userId = (request.user as { sub: string }).sub;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, createdAt: true },
      });
      if (!user) return reply.code(401).send({ message: 'Unauthorized' });
      return reply.send(user);
    }
  );
}
