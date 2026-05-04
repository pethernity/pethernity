import createClient, { Middleware } from 'openapi-fetch';
import type { paths } from './schema';
import { getCurrentIdToken } from '../auth/firebase';

const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3030').replace(/\/$/, '');

const bearerMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await getCurrentIdToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
};

export const api = createClient<paths>({ baseUrl });
api.use(bearerMiddleware);

export const apiBaseUrl = baseUrl;

export type HeadstoneDTO = NonNullable<
  paths['/headstones']['get']['responses']['200']['content']['application/json']
>[number];

export type CheckoutResponse = NonNullable<
  paths['/payments/checkout']['post']['responses']['200']['content']['application/json']
>;
