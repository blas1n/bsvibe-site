export const prerender = false;

import type { APIRoute } from 'astro';
import { handleStripeWebhook, handleTossWebhook } from '@/lib/payment.server';

/**
 * Payment webhook endpoint.
 *
 * Configure in:
 *   - Stripe Dashboard → Developers → Webhooks → Add endpoint
 *     URL: https://bsvibe.dev/api/payment/webhook
 *     Events: checkout.session.completed, invoice.paid, invoice.payment_failed,
 *             customer.subscription.updated, customer.subscription.deleted
 *   - Toss 개발자센터 → 웹훅 설정
 *     URL: https://bsvibe.dev/api/payment/webhook
 *     Events: PAYMENT.DONE, PAYMENT_STATUS_CHANGED
 */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const stripeSignature = request.headers.get('stripe-signature');
  const tossSignature = request.headers.get('toss-signature');

  try {
    if (stripeSignature) {
      await handleStripeWebhook(body, stripeSignature);
    } else if (tossSignature) {
      await handleTossWebhook(body, tossSignature);
    } else {
      return new Response(JSON.stringify({ error: 'Missing signature header' }), { status: 400 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    console.error('webhook error', message);
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
};
