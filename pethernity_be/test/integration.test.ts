import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/prisma.js';

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

beforeEach(async () => {
  await prisma.headstone.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

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

  it('create + update + delete headstone with pet', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({ email: 'owner@test.com', password: '123456' })
      .expect(201);

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({ email: 'owner@test.com', password: '123456' })
      .expect(200);

    const cookie = loginRes.headers['set-cookie'];

    const created = await request(app.server)
      .post('/headstones')
      .set('Cookie', cookie)
      .send({ x: 10, y: 20, epitaph: 'Best dog', pet: { name: 'Fido', species: 'dog' } })
      .expect(201);

    expect(created.body.pet.name).toBe('Fido');

    const updated = await request(app.server)
      .put(`/headstones/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ epitaph: 'Forever loved', pet: { name: 'Fido II' } })
      .expect(200);

    expect(updated.body.epitaph).toBe('Forever loved');
    expect(updated.body.pet.name).toBe('Fido II');

    await request(app.server)
      .delete(`/headstones/${created.body.id}`)
      .set('Cookie', cookie)
      .expect(204);
  });
});
