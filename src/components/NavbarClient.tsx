import { useState, useEffect, useCallback } from 'react';
import type { Locale } from '@/i18n';
import { getTranslations, getLocalePrefix } from '@/i18n';

interface UserInfo {
  email: string;
}

const locales: { code: Locale; label: string; path: string }[] = [
  { code: 'ko', label: 'KO', path: '/' },
  { code: 'en', label: 'EN', path: '/en/' },
];

export default function NavbarClient({ locale = 'ko' }: { locale?: Locale }) {
  const l = getTranslations(locale);
  const prefix = getLocalePrefix(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser({ email: data.user.email });
      }
    } catch {
      // Not authenticated
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setUser(null);
    window.location.href = '/';
  }, []);

  return (
    <>
      <nav className={loaded ? 'fade-in' : ''} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(10,11,15,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(42,45,66,0.5)',
      }}>
        <a href={prefix || '/'} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/images/bsvibe-logo.png" alt="BSVibe" width={22} height={22} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f2f3f7', letterSpacing: '-0.02em' }}>BSVibe</span>
        </a>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#products" className="nav-link" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{l.nav.products}</a>
          <a href={`${prefix}/bsgateway/getting-started`} className="nav-link" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{l.nav.docs}</a>
          <a href={`${prefix}/blog`} className="nav-link" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{l.nav.blog}</a>
          <a href={`${prefix}/pricing`} className="nav-link" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{l.nav.pricing}</a>

          {/* Language switcher */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setLangOpen(!langOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 6, border: '1px solid #2a2d42',
              background: 'none', color: '#8187a8', fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer',
            }}>
              {locales.find(loc => loc.code === locale)?.label}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 4L5 6.5L7.5 4" /></svg>
            </button>
            {langOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                borderRadius: 8, border: '1px solid #2a2d42', backgroundColor: '#111218',
                padding: 4, minWidth: 80, zIndex: 100,
              }}>
                {locales.filter(loc => loc.code !== locale).map(loc => (
                  <a key={loc.code} href={loc.path} style={{
                    display: 'block', padding: '6px 12px', borderRadius: 4,
                    fontSize: '0.75rem', fontWeight: 600, color: '#8187a8', textDecoration: 'none',
                  }}>{loc.label}</a>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {user ? (
            <>
              <a href={`${prefix}/account`} style={{ fontSize: '0.8125rem', color: '#818cf8', fontWeight: 500, textDecoration: 'none' }}>{user.email}</a>
              <button onClick={handleLogout} className="nav-link" style={{ fontSize: '0.8125rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: '#8187a8' }}>
                {l.nav.logout}
              </button>
            </>
          ) : (
            <>
              <a href="https://auth.bsvibe.dev/signup" style={{
                padding: '6px 16px', borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.10)',
                color: '#818cf8', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none',
              }}>{l.nav.getStarted}</a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: '#8187a8', cursor: 'pointer', padding: 8 }}
          aria-label={l.menu}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 49,
          backgroundColor: 'rgba(10,11,15,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #2a2d42', padding: '16px 32px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <a href="#products" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.875rem' }}>{l.nav.products}</a>
          <a href={`${prefix}/bsgateway/getting-started`} className="nav-link" style={{ fontSize: '0.875rem' }}>{l.nav.docs}</a>
          <a href={`${prefix}/blog`} className="nav-link" style={{ fontSize: '0.875rem' }}>{l.nav.blog}</a>
          <a href={`${prefix}/pricing`} className="nav-link" style={{ fontSize: '0.875rem' }}>{l.nav.pricing}</a>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#5a5f7d' }}>{locales.find(loc => loc.code === locale)?.label}</span>
            {locales.filter(loc => loc.code !== locale).map(loc => (
              <a key={loc.code} href={loc.path} className="nav-link" style={{ fontSize: '0.875rem' }}>{loc.label}</a>
            ))}
          </div>
          {user ? (
            <a href={`${prefix}/account`} style={{ fontSize: '0.875rem', color: '#818cf8', textDecoration: 'none' }}>{user.email}</a>
          ) : (
            <a href="https://auth.bsvibe.dev/signup" className="nav-link" style={{ fontSize: '0.875rem' }}>{l.nav.getStarted}</a>
          )}
        </div>
      )}

      <style>{`
        .mobile-menu { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu { display: block; }
        }
      `}</style>
    </>
  );
}
