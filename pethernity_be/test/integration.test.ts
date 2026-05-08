import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: () => [],
  cert: vi.fn(() => ({})),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    verifyIdToken: async (token: string) => {
      if (!token.startsWith('fb:')) throw new Error('Not a firebase token');
      const [, uid, email] = token.split(':');
      return { uid, email };
    },
  }),
}));

vi.mock('stripe', () => {
  class MockStripe {
    webhooks = {
      constructEvent: (rawBody: any, sig: string, secret: string) => {
        if (sig !== 'valid-sig' || secret !== 'whsec_test') {
          throw new Error('Invalid signature');
        }
        return JSON.parse(rawBody.toString());
      },
    };
  }
  return { default: MockStripe };
});

process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@firebase.test';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';
process.env.STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_4gMcN52yndwc3JFak8aVa04';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

const { buildApp } = await import('../src/app.js');
const { prisma } = await import('../src/prisma.js');

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
  await app.listen({ port: 0, host: '127.0.0.1' });
});

beforeEach(async () => {
  await prisma.pendingHeadstone.deleteMany();
  await prisma.headstone.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

// Helper: simula il flusso paid completo (checkout + webhook firmato).
// È l'unico modo per far nascere una Headstone, dato che il POST diretto
// è stato rimosso intenzionalmente per impedire la creazione gratuita.
async function payAndCreate(opts: {
  idToken?: string;
  cookie?: string | string[];
  body: { x: number; y: number; epitaph?: string; pet: any };
}) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  let req = request(app.server).post('/payments/checkout').send(opts.body);
  if (opts.idToken) req = req.set('Authorization', `Bearer ${opts.idToken}`);
  if (opts.cookie) req = req.set('Cookie', opts.cookie);
  const checkoutRes = await req.expect(200);
  const pendingId = checkoutRes.body.pendingId as string;

  const event = {
    id: 'evt_helper_' + pendingId,
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_' + pendingId, client_reference_id: pendingId } },
  };
  await request(app.server)
    .post('/webhooks/stripe')
    .set('stripe-signature', 'valid-sig')
    .set('content-type', 'application/json')
    .send(JSON.stringify(event))
    .expect(200);

  const pending = await prisma.pendingHeadstone.findUnique({ where: { id: pendingId } });
  if (!pending?.headstoneId) throw new Error('Webhook did not create the headstone');
  return prisma.headstone.findUniqueOrThrow({
    where: { id: pending.headstoneId },
    include: { pet: true, owner: { select: { id: true, email: true } } },
  });
}

describe('integration', () => {
  it('register + login + auth/me via cookie', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({ email: 'user@test.com', password: '123456' })
      .expect(201);

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({ email: 'user@test.com', password: '123456' })
      .expect(200);

    const cookie = loginRes.headers['set-cookie'];
    expect(cookie).toBeDefined();

    const meRes = await request(app.server)
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(200);

    expect(meRes.body.email).toBe('user@test.com');
  });

  it('paid create + update + delete headstone with pet', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({ email: 'owner@test.com', password: '123456' })
      .expect(201);

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({ email: 'owner@test.com', password: '123456' })
      .expect(200);

    const cookie = loginRes.headers['set-cookie'];

    const created = await payAndCreate({
      cookie,
      body: { x: 10, y: 20, epitaph: 'Best dog', pet: { name: 'Fido', species: 'dog' } },
    });
    expect(created.pet.name).toBe('Fido');

    const updated = await request(app.server)
      .put(`/headstones/${created.id}`)
      .set('Cookie', cookie)
      .send({ epitaph: 'Forever loved', pet: { name: 'Fido II' } })
      .expect(200);

    expect(updated.body.epitaph).toBe('Forever loved');
    expect(updated.body.pet.name).toBe('Fido II');

    await request(app.server)
      .delete(`/headstones/${created.id}`)
      .set('Cookie', cookie)
      .expect(204);
  });

  it('POST /headstones is intentionally NOT exposed (creation only via paid webhook)', async () => {
    const idToken = 'fb:firebase-uid-bypass:bypass@test.com';
    // Direct creation must be unreachable: no public POST handler.
    await request(app.server)
      .post('/headstones')
      .set('Authorization', `Bearer ${idToken}`)
      .send({ x: 999, y: 999, pet: { name: 'Freebie' } })
      .expect(404);

    expect(await prisma.headstone.count()).toBe(0);
  });

  it('POST /auth/session upserts user from Firebase ID token', async () => {
    const idToken = 'fb:firebase-uid-1:firebase@test.com';

    const sessionRes = await request(app.server)
      .post('/auth/session')
      .set('Authorization', `Bearer ${idToken}`)
      .expect(200);

    expect(sessionRes.body.email).toBe('firebase@test.com');

    const dbUser = await prisma.user.findUnique({ where: { firebaseUid: 'firebase-uid-1' } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.email).toBe('firebase@test.com');
  });

  it('POST /auth/session rejects missing/invalid Bearer token', async () => {
    await request(app.server).post('/auth/session').expect(401);
    await request(app.server)
      .post('/auth/session')
      .set('Authorization', 'Bearer not-a-firebase-token')
      .expect(401);
  });

  it('Firebase Bearer token authorizes /payments/checkout (paid creation path)', async () => {
    const idToken = 'fb:firebase-uid-2:owner2@test.com';
    const created = await payAndCreate({
      idToken,
      body: { x: 30, y: 40, pet: { name: 'Rex' } },
    });
    expect(created.owner?.email).toBe('owner2@test.com');
  });

  it('POST /payments/checkout creates a pending headstone and returns the Payment Link URL', async () => {
    const idToken = 'fb:firebase-uid-pay:payer@test.com';

    const res = await request(app.server)
      .post('/payments/checkout')
      .set('Authorization', `Bearer ${idToken}`)
      .send({ x: 50, y: 60, epitaph: 'Goodbye', pet: { name: 'Kitty' } })
      .expect(200);

    expect(res.body.checkoutUrl).toContain('buy.stripe.com');
    expect(res.body.checkoutUrl).toContain(`client_reference_id=${res.body.pendingId}`);
    expect(res.body.checkoutUrl).toContain('prefilled_email=payer%40test.com');
    expect(res.body.pendingId).toBeTruthy();

    const pending = await prisma.pendingHeadstone.findUnique({ where: { id: res.body.pendingId } });
    expect(pending?.status).toBe('pending');

    // No real headstone yet — appears only after Stripe webhook
    const headstones = await prisma.headstone.count();
    expect(headstones).toBe(0);
  });

  it('POST /payments/checkout rejects coordinates already occupied', async () => {
    const idToken = 'fb:firebase-uid-collide:collider@test.com';
    await payAndCreate({
      idToken,
      body: { x: 70, y: 80, pet: { name: 'First' } },
    });

    await request(app.server)
      .post('/payments/checkout')
      .set('Authorization', `Bearer ${idToken}`)
      .send({ x: 70, y: 80, pet: { name: 'Second' } })
      .expect(409);
  });

  it('POST /webhooks/stripe with valid signature creates the headstone', async () => {
    const idToken = 'fb:firebase-uid-wh:wh@test.com';

    const checkoutRes = await request(app.server)
      .post('/payments/checkout')
      .set('Authorization', `Bearer ${idToken}`)
      .send({ x: 100, y: 110, epitaph: 'RIP', pet: { name: 'Buddy' } })
      .expect(200);

    const pendingId = checkoutRes.body.pendingId;

    const event = {
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_webhook',
          client_reference_id: pendingId,
        },
      },
    };

    await request(app.server)
      .post('/webhooks/stripe')
      .set('stripe-signature', 'valid-sig')
      .set('content-type', 'application/json')
      .send(JSON.stringify(event))
      .expect(200);

    const headstones = await prisma.headstone.findMany({ include: { pet: true } });
    expect(headstones).toHaveLength(1);
    expect(headstones[0].x).toBe(100);
    expect(headstones[0].pet.name).toBe('Buddy');

    const pending = await prisma.pendingHeadstone.findUnique({ where: { id: pendingId } });
    expect(pending?.status).toBe('completed');
    expect(pending?.headstoneId).toBe(headstones[0].id);
  });

  it('POST /webhooks/stripe rejects invalid signature', async () => {
    const event = { id: 'evt_x', type: 'checkout.session.completed', data: { object: {} } };
    await request(app.server)
      .post('/webhooks/stripe')
      .set('stripe-signature', 'wrong-sig')
      .set('content-type', 'application/json')
      .send(JSON.stringify(event))
      .expect(400);
  });

  it('GET /headstones/stream pushes SSE events on create', async () => {
    const idToken = 'fb:firebase-uid-sse:sse@test.com';
    const address = app.server.address();
    if (!address || typeof address === 'string') throw new Error('Server not listening');
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const controller = new AbortController();
    const streamPromise = fetch(`${baseUrl}/headstones/stream`, { signal: controller.signal });
    const stream = await streamPromise;
    const reader = stream.body!.getReader();
    const decoder = new TextDecoder();

    const readUntil = async (matcher: (chunk: string) => boolean, timeoutMs = 3000) => {
      let buffer = '';
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value);
        if (matcher(buffer)) return buffer;
      }
      throw new Error(`Timeout waiting for SSE chunk. Got: ${buffer}`);
    };

    await readUntil((b) => b.includes('event: hello'));

    // L'evento 'headstone.created' viene emesso dal webhook quando il
    // PendingHeadstone diventa una Headstone reale.
    await payAndCreate({ idToken, body: { x: 300, y: 310, pet: { name: 'Streamer' } } });

    const buf = await readUntil((b) => b.includes('event: headstone.created'));
    expect(buf).toContain('"name":"Streamer"');

    controller.abort();
    try {
      await reader.cancel();
    } catch {}
  });

  it('POST /webhooks/stripe is idempotent on retries', async () => {
    const idToken = 'fb:firebase-uid-idem:idem@test.com';
    const checkoutRes = await request(app.server)
      .post('/payments/checkout')
      .set('Authorization', `Bearer ${idToken}`)
      .send({ x: 200, y: 210, pet: { name: 'Solo' } })
      .expect(200);

    const pendingId = checkoutRes.body.pendingId;
    const event = {
      id: 'evt_idem',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_idem', client_reference_id: pendingId } },
    };

    await request(app.server)
      .post('/webhooks/stripe')
      .set('stripe-signature', 'valid-sig')
      .set('content-type', 'application/json')
      .send(JSON.stringify(event))
      .expect(200);

    await request(app.server)
      .post('/webhooks/stripe')
      .set('stripe-signature', 'valid-sig')
      .set('content-type', 'application/json')
      .send(JSON.stringify(event))
      .expect(200);

    const count = await prisma.headstone.count();
    expect(count).toBe(1);
  });
});
