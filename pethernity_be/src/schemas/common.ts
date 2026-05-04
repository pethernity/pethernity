export const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    issues: {
      type: 'object',
      additionalProperties: { type: 'array', items: { type: 'string' } },
      nullable: true,
    },
  },
  required: ['message'],
} as const;

export const userPublicSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'email', 'createdAt'],
} as const;

export const ownerSummarySchema = {
  type: 'object',
  nullable: true,
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
  required: ['id', 'email'],
} as const;

export const petSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    species: { type: 'string', nullable: true },
    imageGzipBase64: { type: 'string', nullable: true },
    imageMime: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'name', 'createdAt'],
} as const;

export const headstoneSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    epitaph: { type: 'string', nullable: true },
    x: { type: 'integer' },
    y: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    ownerId: { type: 'string', nullable: true },
    petId: { type: 'string' },
    pet: petSchema,
    owner: ownerSummarySchema,
  },
  required: ['id', 'x', 'y', 'createdAt', 'updatedAt', 'petId', 'pet'],
} as const;

export const messageSchema = {
  type: 'object',
  properties: { message: { type: 'string' } },
  required: ['message'],
} as const;

export const checkoutResponseSchema = {
  type: 'object',
  properties: {
    pendingId: { type: 'string' },
    checkoutUrl: { type: 'string', format: 'uri' },
  },
  required: ['pendingId', 'checkoutUrl'],
} as const;

export const checkoutBodySchema = {
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
} as const;

