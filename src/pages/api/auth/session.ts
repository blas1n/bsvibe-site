export const prerender = false;

import type { APIRoute } from 'astro';
import { validateSession, createSessionCookie, clearSessionCookie } from '@/lib/auth.server';

// GET: Check current session status (for Navbar auth state)
export const GET: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const { user, newCookie } = await validateSession(cookieHeader);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (newCookie) {
    headers['Set-Cookie'] = newCookie;
  }

  if (!user) {
    return new Response(JSON.stringify({ user: null }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ user }), { status: 200, headers });
};

// POST: Set session cookie from refresh token
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const refreshToken = body.refresh_token;

  if (!refreshToken || typeof refreshToken !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing refresh_token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': createSessionCookie(refreshToken),
    },
  });
};

// DELETE: Clear session cookie (logout)
export const DELETE: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  });
};
