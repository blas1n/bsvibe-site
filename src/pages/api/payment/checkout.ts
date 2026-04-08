export const prerender = false;

import type { APIRoute } from 'astro';
import { validateSession } from '@/lib/auth.server';
import { createCheckout, getProvider } from '@/lib/payment.server';
import { getSupabaseAnon } from '@/lib/supabase.server';

export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user } = await validateSession(cookieHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body: { priceId?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { priceId, locale = 'ko' } = body;
  if (!priceId) {
    return new Response(JSON.stringify({ error: 'Missing priceId' }), { status: 400 });
  }

  // Look up the price to get stripe_price_id
  const supabase = getSupabaseAnon();
  const { data: price, error } = await supabase
    .from('prices')
    .select('id, stripe_price_id, is_contact_only')
    .eq('id', priceId)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !price) {
    return new Response(JSON.stringify({ error: 'Price not found' }), { status: 404 });
  }

  if (price.is_contact_only) {
    return new Response(JSON.stringify({ error: 'This plan requires contacting sales' }), { status: 400 });
  }

  try {
    const session = await createCheckout({
      provider: getProvider(locale),
      stripePriceId: price.stripe_price_id,
      priceId: price.id,
      userId: user.id,
      userEmail: user.email,
      successUrl: `https://bsvibe.dev${locale === 'en' ? '/en' : ''}/account/billing?success=true`,
      cancelUrl: `https://bsvibe.dev${locale === 'en' ? '/en' : ''}/account/billing?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
