export const prerender = false;

import type { APIRoute } from 'astro';
import { validateSession } from '@/lib/auth.server';
import { getActiveSubscription, upsertSubscription } from '@/lib/subscription.repository';
import { cancelStripeSubscription, cancelTossSubscription } from '@/lib/payment.server';

export const GET: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user } = await validateSession(cookieHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const subscription = await getActiveSubscription(user.id);
  return new Response(JSON.stringify({ subscription }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user } = await validateSession(cookieHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const subscription = await getActiveSubscription(user.id);
  if (!subscription) {
    return new Response(JSON.stringify({ error: 'No active subscription' }), { status: 404 });
  }

  if (!subscription.providerSubscriptionId) {
    return new Response(JSON.stringify({ error: 'Subscription has no provider id' }), { status: 400 });
  }

  try {
    if (subscription.provider === 'stripe') {
      await cancelStripeSubscription(subscription.providerSubscriptionId);
    } else {
      await cancelTossSubscription(subscription.providerSubscriptionId);
    }

    await upsertSubscription({
      ...subscription,
      cancelAtPeriodEnd: true,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cancellation failed';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
