export const prerender = false;

import type { APIRoute } from 'astro';
import { validateSession } from '@/lib/auth.server';
import { createApiKey, revokeApiKey } from '@/lib/bsgateway.server';

export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user } = await validateSession(cookieHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!user.tenantId) {
    return new Response(JSON.stringify({ error: 'No tenant assigned' }), { status: 400 });
  }

  let body: { name?: string; scopes?: string[]; expires_in_days?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body.name || typeof body.name !== 'string') {
    return new Response(JSON.stringify({ error: 'name is required' }), { status: 400 });
  }

  try {
    const created = await createApiKey(user.tenantId, {
      name: body.name,
      scopes: body.scopes,
      expires_in_days: body.expires_in_days,
    });
    return new Response(JSON.stringify(created), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create API key';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user } = await validateSession(cookieHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!user.tenantId) {
    return new Response(JSON.stringify({ error: 'No tenant assigned' }), { status: 400 });
  }

  const url = new URL(request.url);
  const keyId = url.searchParams.get('id');
  if (!keyId) {
    return new Response(JSON.stringify({ error: 'id query param required' }), { status: 400 });
  }

  try {
    await revokeApiKey(user.tenantId, keyId);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to revoke API key';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
