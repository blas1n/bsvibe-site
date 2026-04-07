export const prerender = false;

import type { APIRoute } from 'astro';
import { validateSession } from '@/lib/auth.server';
import { getSubscription, cancelSubscription } from '@/lib/payment.server';

// GET: Get current subscription
export const GET: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user } = await validateSession(cookieHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const subscription = await getSubscription(user.id);
  return new Response(JSON.stringify({ subscription }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// DELETE: Cancel subscription
export const DELETE: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user } = await validateSession(cookieHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { subscriptionId } = body;

  if (!subscriptionId) {
    return new Response(JSON.stringify({ error: 'Missing subscriptionId' }), { status: 400 });
  }

  try {
    await cancelSubscription(subscriptionId);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cancellation failed';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
