import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from '../env.js';

const authBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', {
    schema: {
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request, reply) => {
    const parsed = authBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: 'Invalid payload' });

    const { email, password } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return reply.code(409).send({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    return reply.code(201).send({ id: user.id, email: user.email, createdAt: user.createdAt });
  });

  app.post('/auth/login', {
    schema: {
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request, reply) => {
    const parsed = authBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: 'Invalid payload' });

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.code(401).send({ message: 'Invalid credentials' });

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
  });

  app.post('/auth/logout', { preHandler: [app.authenticate] }, async (_request, reply) => {
    reply.clearCookie(env.cookieName, { path: '/' });
    return reply.send({ message: 'Logged out' });
  });

  app.get('/auth/me', { preHandler: [app.authenticate], schema: { tags: ['auth'] } }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, createdAt: true } });
    if (!user) return reply.code(404).send({ message: 'User not found' });
    return reply.send(user);
  });
}
