import Stripe from 'stripe';
import { env } from '../env.js';

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  if (!env.stripe.secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  cached = new Stripe(env.stripe.secretKey, { apiVersion: '2024-12-18.acacia' as any });
  return cached;
}

export function resetStripeForTests(instance: Stripe | null) {
  cached = instance;
}
