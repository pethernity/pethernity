import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { z } from 'zod';

const createSchema = z.object({
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

const updateSchema = z.object({
  x: z.number().int().optional(),
  y: z.number().int().optional(),
  epitaph: z.string().max(500).nullable().optional(),
  pet: z.object({
    name: z.string().min(1).optional(),
    species: z.string().nullable().optional(),
    imageGzipBase64: z.string().max(2_000_000).nullable().optional(),
    imageMime: z.string().max(100).nullable().optional(),
  }).optional(),
});

const createBodyJsonSchema = {
  type: 'object',
  required: ['x', 'y', 'pet'],
  properties: {
    x: { type: 'integer' },
    y: { type: 'integer' },
    epitaph: { type: 'string' },
    pet: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        species: { type: 'string' },
        imageGzipBase64: { type: 'string' },
        imageMime: { type: 'string' },
      },
    },
  },
};

const updateBodyJsonSchema = {
  type: 'object',
  properties: {
    x: { type: 'integer' },
    y: { type: 'integer' },
    epitaph: { type: 'string', nullable: true },
    pet: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        species: { type: 'string', nullable: true },
        imageGzipBase64: { type: 'string', nullable: true },
        imageMime: { type: 'string', nullable: true },
      },
    },
  },
};

export async function headstoneRoutes(app: FastifyInstance) {
  app.get('/headstones', { schema: { tags: ['headstones'] } }, async (_request, reply) => {
    const headstones = await prisma.headstone.findMany({
      include: {
        pet: true,
        owner: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send(headstones);
  });

  app.post('/headstones', {
    preHandler: [app.authenticate],
    schema: { tags: ['headstones'], body: createBodyJsonSchema },
  }, async (request, reply) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: 'Invalid payload' });

    const userId = (request.user as { sub: string }).sub;
    const { x, y, epitaph, pet } = parsed.data;

    const ownedCount = await prisma.headstone.count({ where: { ownerId: userId } });
    if (ownedCount >= 10) return reply.code(409).send({ message: 'Maximum 10 headstones per user' });

    try {
      const result = await prisma.headstone.create({
        data: {
          x,
          y,
          epitaph,
          owner: { connect: { id: userId } },
          pet: {
            create: {
              name: pet.name,
              species: pet.species,
              imageGzipBase64: pet.imageGzipBase64,
              imageMime: pet.imageMime,
            },
          },
        },
        include: { pet: true, owner: { select: { id: true, email: true } } },
      });
      return reply.code(201).send(result);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return reply.code(409).send({ message: 'Coordinates already occupied' });
      }
      request.log.error(error);
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });

  app.put('/headstones/:id', {
    preHandler: [app.authenticate],
    schema: { tags: ['headstones'], body: updateBodyJsonSchema },
  }, async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    const body = updateSchema.safeParse(request.body);
    if (!params.success || !body.success) return reply.code(400).send({ message: 'Invalid payload' });

    const userId = (request.user as { sub: string }).sub;
    const { id } = params.data;
    const headstone = await prisma.headstone.findUnique({ where: { id } });
    if (!headstone) return reply.code(404).send({ message: 'Headstone not found' });
    if (headstone.ownerId !== userId) return reply.code(403).send({ message: 'Forbidden' });

    try {
      const updated = await prisma.headstone.update({
        where: { id },
        data: {
          x: body.data.x,
          y: body.data.y,
          epitaph: body.data.epitaph,
          pet: body.data.pet
            ? {
                update: {
                  name: body.data.pet.name,
                  species: body.data.pet.species === null ? undefined : body.data.pet.species,
                  imageGzipBase64:
                    body.data.pet.imageGzipBase64 === null ? undefined : body.data.pet.imageGzipBase64,
                  imageMime: body.data.pet.imageMime === null ? undefined : body.data.pet.imageMime,
                },
              }
            : undefined,
        },
        include: { pet: true, owner: { select: { id: true, email: true } } },
      });
      return reply.send(updated);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return reply.code(409).send({ message: 'Coordinates already occupied' });
      }
      request.log.error(error);
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });

  app.delete('/headstones/:id', { preHandler: [app.authenticate], schema: { tags: ['headstones'] } }, async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.code(400).send({ message: 'Invalid id' });

    const userId = (request.user as { sub: string }).sub;
    const { id } = params.data;
    const headstone = await prisma.headstone.findUnique({ where: { id } });
    if (!headstone) return reply.code(404).send({ message: 'Headstone not found' });
    if (headstone.ownerId !== userId) return reply.code(403).send({ message: 'Forbidden' });

    await prisma.headstone.delete({ where: { id } });
    return reply.code(204).send();
  });

  app.post('/headstones/:id/claim', { preHandler: [app.authenticate], schema: { tags: ['headstones'] } }, async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.code(400).send({ message: 'Invalid id' });

    const userId = (request.user as { sub: string }).sub;
    const { id } = params.data;

    const headstone = await prisma.headstone.findUnique({ where: { id }, include: { pet: true } });
    if (!headstone) return reply.code(404).send({ message: 'Headstone not found' });
    if (headstone.ownerId) return reply.code(409).send({ message: 'Headstone already owned' });

    const claimed = await prisma.headstone.update({
      where: { id },
      data: { owner: { connect: { id: userId } } },
      include: { pet: true, owner: { select: { id: true, email: true } } },
    });
    return reply.send(claimed);
  });
}
