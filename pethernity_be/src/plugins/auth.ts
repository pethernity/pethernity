import fp from 'fastify-plugin';
import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../env.js';
import { prisma } from '../prisma.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    appUser?: { id: string; email: string; firebaseUid?: string };
  }
}

export default fp(async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    if (!request.headers.authorization) {
      const cookieToken = request.cookies[env.cookieName];
      if (cookieToken) {
        request.headers.authorization = `Bearer ${cookieToken}`;
      }
    }
  });

  fastify.decorate('authenticate', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) return reply.code(401).send({ message: 'Unauthorized' });

    if (fastify.firebaseAuth) {
      try {
        const decoded = await fastify.firebaseAuth.verifyIdToken(token);
        if (!decoded.email) return reply.code(401).send({ message: 'Token missing email' });

        const user = await prisma.user.upsert({
          where: { firebaseUid: decoded.uid },
          update: { email: decoded.email },
          create: { firebaseUid: decoded.uid, email: decoded.email },
        });

        (request as any).user = { sub: user.id, email: user.email };
        request.appUser = { id: user.id, email: user.email, firebaseUid: decoded.uid };
        return;
      } catch {
        // Not a Firebase token (or invalid). Fall through to legacy JWT.
      }
    }

    try {
      await request.jwtVerify();
      const decoded = (request as any).user as { sub: string; email: string };
      request.appUser = { id: decoded.sub, email: decoded.email };
    } catch {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
  });
});
