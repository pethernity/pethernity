import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { env } from '../env.js';
import { getStripe } from '../lib/stripe.js';
import { checkoutBodySchema, checkoutResponseSchema, errorSchema } from '../schemas/common.js';

const checkoutSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  epitaph: z.string().max(500).optional(),
  pet: z.object({
    name: z.string().min(1),
    species: z.string().optional(),
    imageGzipBase64: z.string().max(2_000_000).optional(),
    imageMime: z.string().max(100).optional(),
  }),
});

export async function paymentRoutes(app: FastifyInstance) {
  app.post(
    '/payments/checkout',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['payments'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        body: checkoutBodySchema,
        response: {
          200: checkoutResponseSchema,
          400: errorSchema,
          401: errorSchema,
          409: errorSchema,
          500: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const parsed = checkoutSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: 'Invalid payload' });

      const userId = request.appUser?.id ?? (request.user as { sub: string }).sub;
      const userEmail = request.appUser?.email ?? (request.user as { email?: string }).email;

      if (!env.stripe.secretKey || !env.stripe.priceId || !env.stripe.webhookSecret) {
        return reply.code(500).send({ message: 'Stripe is not configured' });
      }

      const { x, y } = parsed.data;
      const occupied = await prisma.headstone.findUnique({ where: { x_y: { x, y } } });
      if (occupied) return reply.code(409).send({ message: 'Coordinates already occupied' });

      const ownedCount = await prisma.headstone.count({ where: { ownerId: userId } });
      if (ownedCount >= 10) return reply.code(409).send({ message: 'Maximum 10 headstones per user' });

      const pending = await prisma.pendingHeadstone.create({
        data: {
          ownerId: userId,
          payload: parsed.data as any,
        },
      });

      try {
        const session = await getStripe().checkout.sessions.create({
          mode: 'payment',
          line_items: [{ price: env.stripe.priceId, quantity: 1 }],
          success_url: `${env.frontendOrigin}/?session_id={CHECKOUT_SESSION_ID}&status=success`,
          cancel_url: `${env.frontendOrigin}/?status=canceled`,
          client_reference_id: pending.id,
          customer_email: userEmail,
          metadata: { pendingId: pending.id, ownerId: userId },
        });

        await prisma.pendingHeadstone.update({
          where: { id: pending.id },
          data: { stripeSessionId: session.id },
        });

        if (!session.url) {
          return reply.code(500).send({ message: 'Stripe did not return a checkout URL' });
        }
        return reply.send({ pendingId: pending.id, checkoutUrl: session.url });
      } catch (err) {
        await prisma.pendingHeadstone.update({
          where: { id: pending.id },
          data: { status: 'failed' },
        });
        throw err;
      }
    }
  );
}
