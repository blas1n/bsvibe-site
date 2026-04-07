export const prerender = false;

import type { APIRoute } from 'astro';
import { validateSession } from '@/lib/auth.server';
import { createCheckout, getProvider } from '@/lib/payment.server';

export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user } = await validateSession(cookieHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { priceId, locale = 'ko' } = body;

  if (!priceId) {
    return new Response(JSON.stringify({ error: 'Missing priceId' }), { status: 400 });
  }

  try {
    const session = await createCheckout({
      provider: getProvider(locale),
      priceId,
      userId: user.id,
      successUrl: `https://bsvibe.dev/account/billing?success=true`,
      cancelUrl: `https://bsvibe.dev/account/billing?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
