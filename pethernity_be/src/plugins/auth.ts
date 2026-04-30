import fp from 'fastify-plugin';
import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../env.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (fastify) => {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
  });

  fastify.addHook('onRequest', async (request) => {
    const token = request.cookies[env.cookieName];
    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }
  });
});
