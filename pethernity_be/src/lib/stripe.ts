import Stripe from 'stripe';

let cached: Stripe | null = null;

// Istanza usata SOLO per stripe.webhooks.constructEvent (verifica HMAC del webhook).
// constructEvent non chiama l'API Stripe, fa solo signature check locale, quindi
// l'API key passata al constructor non viene mai validata: usiamo un placeholder.
// Se in futuro serve creare risorse via API, sostituisci con env.stripe.secretKey.
export function getStripe(): Stripe {
  if (cached) return cached;
  cached = new Stripe('sk_placeholder', { apiVersion: '2024-12-18.acacia' as any });
  return cached;
}

export function resetStripeForTests(instance: Stripe | null) {
  cached = instance;
}
