import { defineMiddleware } from 'astro:middleware';
import { validateSession } from '@/lib/auth.server';

const PROTECTED_PATHS = ['/account', '/en/account'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Only check auth for protected routes
  if (!isProtectedPath(pathname)) {
    return next();
  }

  const cookieHeader = context.request.headers.get('cookie');
  const { user, newCookie } = await validateSession(cookieHeader);

  if (!user) {
    const locale = pathname.startsWith('/en/') ? 'en' : 'ko';
    const returnUrl = encodeURIComponent(context.url.href);
    const loginUrl = `https://auth.bsvibe.dev/login?redirect_uri=${encodeURIComponent(`https://bsvibe.dev/auth/callback`)}&state=${returnUrl}`;
    return context.redirect(loginUrl, 302);
  }

  // Inject user into locals for Astro pages
  context.locals.user = user;

  const response = await next();

  // Rotate session cookie if needed
  if (newCookie) {
    response.headers.append('Set-Cookie', newCookie);
  }

  return response;
});
