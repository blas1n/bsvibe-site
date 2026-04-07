export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyWebhook } from '@/lib/payment.server';

/**
 * Payment webhook endpoint.
 * Receives events from Toss Payments and Stripe.
 *
 * TODO: After configuring payment providers:
 * 1. Register this URL as webhook endpoint:
 *    - Toss: https://bsvibe.dev/api/payment/webhook
 *    - Stripe: https://bsvibe.dev/api/payment/webhook
 * 2. Set webhook secrets in .env:
 *    - TOSS_WEBHOOK_SECRET
 *    - STRIPE_WEBHOOK_SECRET
 * 3. Implement event handlers for:
 *    - payment.confirmed / invoice.paid → activate subscription
 *    - payment.failed / invoice.payment_failed → notify user
 *    - subscription.canceled → deactivate subscription
 */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('toss-signature')
    || request.headers.get('stripe-signature')
    || '';

  // Detect provider from headers
  const provider = request.headers.get('stripe-signature') ? 'stripe' : 'toss';

  try {
    const valid = await verifyWebhook(provider, body, signature);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
    }

    // TODO: Parse event and handle accordingly
    // const event = JSON.parse(body);
    // switch (event.type) { ... }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
