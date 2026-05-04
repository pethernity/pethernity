import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { prisma } from '../prisma.js';
import { env } from '../env.js';
import { getStripe } from '../lib/stripe.js';
import { errorSchema } from '../schemas/common.js';
import { emitHeadstoneEvent } from '../lib/events.js';

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string | Buffer;
  }
}

type CheckoutPayload = {
  x: number;
  y: number;
  epitaph?: string;
  pet: {
    name: string;
    species?: string;
    imageGzipBase64?: string;
    imageMime?: string;
  };
};

export async function webhookRoutes(app: FastifyInstance) {
  app.post(
    '/webhooks/stripe',
    {
      config: { rawBody: true },
      schema: {
        tags: ['webhooks'],
        response: {
          200: { type: 'object', properties: { received: { type: 'boolean' } }, required: ['received'] },
          400: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (!env.stripe.webhookSecret) {
        return reply.code(400).send({ message: 'Stripe webhook not configured' });
      }

      const sig = request.headers['stripe-signature'];
      if (!sig || Array.isArray(sig)) {
        return reply.code(400).send({ message: 'Missing signature' });
      }

      const rawBody = request.rawBody;
      if (!rawBody) {
        return reply.code(400).send({ message: 'Missing raw body' });
      }

      let event: Stripe.Event;
      try {
        event = getStripe().webhooks.constructEvent(rawBody, sig, env.stripe.webhookSecret);
      } catch (err) {
        request.log.warn({ err }, 'Stripe webhook signature verification failed');
        return reply.code(400).send({ message: 'Invalid signature' });
      }

      if (event.type !== 'checkout.session.completed') {
        return reply.send({ received: true });
      }

      const session = event.data.object as Stripe.Checkout.Session;
      const pendingId = session.client_reference_id;
      if (!pendingId) {
        request.log.warn({ sessionId: session.id }, 'Webhook missing client_reference_id');
        return reply.send({ received: true });
      }

      const pending = await prisma.pendingHeadstone.findUnique({ where: { id: pendingId } });
      if (!pending) {
        request.log.warn({ pendingId }, 'Pending headstone not found for completed session');
        return reply.send({ received: true });
      }

      if (pending.status === 'completed' && pending.headstoneId) {
        return reply.send({ received: true });
      }

      const payload = pending.payload as unknown as CheckoutPayload;

      try {
        const headstone = await prisma.$transaction(async (tx) => {
          const created = await tx.headstone.create({
            data: {
              x: payload.x,
              y: payload.y,
              epitaph: payload.epitaph,
              owner: { connect: { id: pending.ownerId } },
              pet: {
                create: {
                  name: payload.pet.name,
                  species: payload.pet.species,
                  imageGzipBase64: payload.pet.imageGzipBase64,
                  imageMime: payload.pet.imageMime,
                },
              },
            },
            include: { pet: true, owner: { select: { id: true, email: true } } },
          });
          await tx.pendingHeadstone.update({
            where: { id: pending.id },
            data: {
              status: 'completed',
              completedAt: new Date(),
              headstoneId: created.id,
            },
          });
          return created;
        });

        emitHeadstoneEvent({ type: 'headstone.created', payload: headstone });
        request.log.info({ pendingId, headstoneId: headstone.id }, 'Headstone created from Stripe checkout');
      } catch (err: any) {
        if (err?.code === 'P2002') {
          await prisma.pendingHeadstone.update({
            where: { id: pending.id },
            data: { status: 'failed', completedAt: new Date() },
          });
          request.log.warn(
            { pendingId, x: payload.x, y: payload.y },
            'Coordinates already occupied — payment marked failed'
          );
          return reply.send({ received: true });
        }
        throw err;
      }

      return reply.send({ received: true });
    }
  );
}
