import { useState, useEffect } from "react";

type Locale = "ko" | "en";

const t = {
  ko: {
    nav: { products: "제품", docs: "문서", getStarted: "시작하기", login: "로그인" },
    menu: "메뉴",
    hero: {
      badge: "AI, 새로운 감각",
      h1: "만들고, 지키고, 기억한다.",
      h1Gradient: "나머지는 알아서.",
      subtitle: "따로 써도 충분하고, 같이 쓰면 놀랍습니다.",
      cta: "둘러보기",
      ctaSecondary: "계정 만들기",
    },
    productsHeading: "서로 다른 제품. 하나의 경험.",
    vision: "하나의 계정, 하나의 경험. 경계 없이, 자연스럽게.",
    footer: { docs: "문서", privacy: "개인정보처리방침", terms: "이용약관" },
    products: {
      BSGateway: { desc: "어떤 모델이 좋을지, 고민하지 않아도 됩니다.", detail: "스마트 라우팅" },
      BSNexus: { desc: "아이디어만 던지면, 알아서 만들어집니다.", detail: "프로젝트 매니저" },
      BSupervisor: { desc: "잠든 사이에도, 묵묵히 지켜보고 있습니다.", detail: "안전 모니터링" },
      BSage: { desc: "정리하지 않아도, 기억하고 연결해 줍니다.", detail: "당신보다 당신을 잘 아는 비서" },
    },
  },
  en: {
    nav: { products: "Products", docs: "Docs", getStarted: "Get Started", login: "Log in" },
    menu: "Menu",
    hero: {
      badge: "AI, a new sense",
      h1: "Build. Guard. Remember.",
      h1Gradient: "The rest is automatic.",
      subtitle: "Great on their own. Remarkable together.",
      cta: "Explore",
      ctaSecondary: "Create Account",
    },
    productsHeading: "Different products. One experience.",
    vision: "One account, one experience. No boundaries, just flow.",
    footer: { docs: "Docs", privacy: "Privacy Policy", terms: "Terms of Service" },
    products: {
      BSGateway: { desc: "Stop choosing models. The right one is picked for you.", detail: "Smart Routing" },
      BSNexus: { desc: "Throw an idea in, and it builds itself.", detail: "Project Manager" },
      BSupervisor: { desc: "Watching quietly, even while you sleep.", detail: "Safety Monitoring" },
      BSage: { desc: "Remembers and connects — no organizing needed.", detail: "The assistant that knows you better than you" },
    },
  },
} as const;

function BSLogo({ size = 24 }: { size?: number; color?: string }) {
  return (
    <img src="/images/bsvibe-logo.png" alt="BSVibe" width={size} height={size} style={{ borderRadius: size > 20 ? 4 : 2 }} />
  );
}

const productsMeta = [
  {
    name: "BSGateway" as const,
    accent: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.15)",
    status: "MVP",
    href: "https://gateway.bsvibe.dev",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h4l3-9 3 18 3-9h4"/>
      </svg>
    ),
  },
  {
    name: "BSNexus" as const,
    accent: "#3b82f6",
    accentGlow: "rgba(59,130,246,0.15)",
    status: "Coming Soon",
    href: "https://nexus.bsvibe.dev",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        <path d="M10 6.5h4M10 17.5h4M6.5 10v4M17.5 10v4"/>
      </svg>
    ),
  },
  {
    name: "BSupervisor" as const,
    accent: "#f43f5e",
    accentGlow: "rgba(244,63,94,0.15)",
    status: "Coming Soon",
    href: "https://supervisor.bsvibe.dev",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    name: "BSage" as const,
    accent: "#10b981",
    accentGlow: "rgba(16,185,129,0.15)",
    status: "Coming Later",
    href: "https://sage.bsvibe.dev",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 2 20 2s-1.7 5.3-4 9.5C14 15 11 20 11 20z"/>
        <path d="M6.7 17.3s2.1-3.1 5.3-7.3"/>
      </svg>
    ),
  },
];

export default function BSVibeLanding({ locale = "ko" }: { locale?: Locale }) {
  const l = t[locale];
  const docsBase = locale === "en" ? "/en" : "";
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ overflow: "hidden" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .fade-up {
          opacity: 0;
          animation: fadeUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .product-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .product-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99,102,241,0.3);
        }
        .cta-primary {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          text-decoration: none;
        }
        .cta-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 32px rgba(99,102,241,0.35);
        }
        .cta-secondary {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          text-decoration: none;
        }
        .cta-secondary:hover {
          border-color: #8187a8;
          color: #f2f3f7;
        }
        .nav-link {
          transition: color 0.15s ease;
          cursor: pointer;
          text-decoration: none;
          color: #8187a8;
        }
        .nav-link:hover {
          color: #f2f3f7;
        }
        .mobile-menu {
          display: none;
        }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu { display: block; }
        }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav className={loaded ? "fade-in" : ""} style={{
        animationDelay: "0s",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(10,11,15,0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(42,45,66,0.5)",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <BSLogo size={22} color="#6366f1" />
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#f2f3f7", letterSpacing: "-0.02em" }}>
            BSVibe
          </span>
        </a>

        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#products" className="nav-link" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{l.nav.products}</a>
          <a href={`${docsBase}/bsgateway/getting-started`} className="nav-link" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{l.nav.docs}</a>
          <a href="https://auth.bsvibe.dev/signup?redirect_uri=https%3A%2F%2Fbsvibe.dev" style={{
            padding: "6px 16px",
            borderRadius: 8,
            backgroundColor: "rgba(99,102,241,0.10)",
            color: "#818cf8",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textDecoration: "none",
          }}>
            {l.nav.getStarted}
          </a>
          <a href="https://auth.bsvibe.dev/login?redirect_uri=https%3A%2F%2Fbsvibe.dev" className="nav-link" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{l.nav.login}</a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#8187a8",
            cursor: "pointer",
            padding: 8,
          }}
          aria-label={l.menu}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <path d="M6 6l12 12M6 18L18 6" />
              : <path d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: 64,
          left: 0,
          right: 0,
          zIndex: 49,
          backgroundColor: "rgba(10,11,15,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #2a2d42",
          padding: "16px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <a href="#products" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: "0.875rem" }}>{l.nav.products}</a>
          <a href={`${docsBase}/bsgateway/getting-started`} className="nav-link" style={{ fontSize: "0.875rem" }}>{l.nav.docs}</a>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          animation: "pulseGlow 6s ease-in-out infinite",
        }} />

        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(42,45,66,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(42,45,66,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>
          <div className={loaded ? "fade-up" : ""} style={{ animationDelay: "0.1s", marginBottom: 24 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 9999,
              backgroundColor: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.15)",
              color: "#818cf8",
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}>
              <BSLogo size={14} color="#818cf8" />
              {l.hero.badge}
            </span>
          </div>

          <h1 className={loaded ? "fade-up" : ""} style={{
            animationDelay: "0.2s",
            fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
            fontWeight: 800,
            color: "#f2f3f7",
            lineHeight: 1.15,
            letterSpacing: "-0.035em",
            margin: "0 0 20px",
          }}>
            {l.hero.h1}{" "}
            <br />
            <span style={{
              background: "linear-gradient(135deg, #818cf8, #6366f1, #4f46e5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {l.hero.h1Gradient}
            </span>
          </h1>

          <p className={loaded ? "fade-up" : ""} style={{
            animationDelay: "0.35s",
            fontSize: "clamp(1rem, 2vw, 1.1875rem)",
            color: "#8187a8",
            lineHeight: 1.7,
            margin: "0 auto 36px",
            maxWidth: 520,
            letterSpacing: "-0.01em",
          }}>
            {l.hero.subtitle}
          </p>

          <div className={loaded ? "fade-up" : ""} style={{
            animationDelay: "0.5s",
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            <a href="#products" className="cta-primary" style={{
              display: "inline-block",
              padding: "13px 28px",
              borderRadius: 10,
              backgroundColor: "#6366f1",
              color: "#fff",
              fontSize: "0.9375rem",
              fontWeight: 700,
              boxShadow: "0 0 20px rgba(99,102,241,0.25)",
              letterSpacing: "-0.01em",
            }}>
              {l.hero.cta}
            </a>
            <a href="https://auth.bsvibe.dev/signup?redirect_uri=https%3A%2F%2Fbsvibe.dev" className="cta-secondary" style={{
              display: "inline-block",
              padding: "13px 28px",
              borderRadius: 10,
              border: "1.5px solid #2a2d42",
              color: "#8187a8",
              fontSize: "0.9375rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}>
              {l.hero.ctaSecondary}
            </a>
          </div>
        </div>

        <div className={loaded ? "fade-in" : ""} style={{
          animationDelay: "1s",
          position: "absolute",
          bottom: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{ fontSize: "0.6875rem", color: "#5a5f7d", letterSpacing: "0.05em" }}>
            SCROLL
          </span>
          <div style={{
            width: 1,
            height: 24,
            background: "linear-gradient(to bottom, #5a5f7d, transparent)",
          }} />
        </div>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section id="products" style={{
        padding: "0 24px 120px",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <div className={loaded ? "fade-up" : ""} style={{
          animationDelay: "0.7s",
          textAlign: "center",
          marginBottom: 48,
        }}>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#f2f3f7",
            margin: "0 0 10px",
            letterSpacing: "-0.025em",
          }}>
            {l.productsHeading}
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
          maxWidth: 800,
          margin: "0 auto",
        }}>
          {productsMeta.map((p, i) => {
            const pt = l.products[p.name];
            return (
            <a
              key={p.name}
              href={p.href}
              className={`product-card ${loaded ? "fade-up" : ""}`}
              style={{
                animationDelay: `${0.8 + i * 0.12}s`,
                borderRadius: 14,
                border: "1px solid #2a2d42",
                backgroundColor: "#111218",
                padding: 28,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 200,
                height: 80,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${p.accentGlow}, transparent 70%)`,
                pointerEvents: "none",
              }} />

              <div style={{ position: "relative" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: `${p.accent}12`,
                    border: `1px solid ${p.accent}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: p.accent,
                  }}>
                    {p.icon}
                  </div>
                  <span style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#5a5f7d",
                    padding: "3px 10px",
                    borderRadius: 9999,
                    backgroundColor: "#181926",
                    border: "1px solid #2a2d42",
                  }}>
                    {p.status}
                  </span>
                </div>

                <h3 style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#f2f3f7",
                  margin: "0 0 6px",
                  letterSpacing: "-0.02em",
                }}>
                  {p.name}
                </h3>

                <div style={{
                  fontSize: "0.75rem",
                  color: p.accent,
                  fontWeight: 500,
                  marginBottom: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "-0.01em",
                }}>
                  {pt.detail}
                </div>

                <p style={{
                  fontSize: "0.9375rem",
                  color: "#8187a8",
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  {pt.desc}
                </p>
              </div>
            </a>
            );
          })}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginTop: 32,
          color: "#3d4160",
          fontSize: "0.75rem",
        }}>
          <div style={{ height: 1, flex: 1, maxWidth: 80, backgroundColor: "#2a2d42" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>
            unified by bsvibe
          </span>
          <div style={{ height: 1, flex: 1, maxWidth: 80, backgroundColor: "#2a2d42" }} />
        </div>
      </section>

      {/* ═══ VISION ═══ */}
      <section style={{
        padding: "80px 24px",
        maxWidth: 640,
        margin: "0 auto",
        textAlign: "center",
      }}>
        <div className={loaded ? "fade-up" : ""} style={{ animationDelay: "1.2s" }}>
          <blockquote style={{
            fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
            fontWeight: 500,
            color: "#a8adc6",
            lineHeight: 1.8,
            margin: 0,
            fontStyle: "normal",
            letterSpacing: "-0.01em",
          }}>
            <span style={{ color: "#6366f1", fontSize: "1.5em", lineHeight: 0, verticalAlign: "middle" }}>"</span>
            {" "}{l.vision}{" "}
            <span style={{ color: "#6366f1", fontSize: "1.5em", lineHeight: 0, verticalAlign: "middle" }}>"</span>
          </blockquote>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        borderTop: "1px solid #1e2033",
        padding: "40px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: 960,
        margin: "0 auto",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <BSLogo size={16} color="#5a5f7d" />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#5a5f7d" }}>
            BSVibe
          </span>
          <span style={{ fontSize: "0.75rem", color: "#3d4160", marginLeft: 4 }}>
            &copy; 2026
          </span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <a href={`${docsBase}/bsgateway/getting-started`} className="nav-link" style={{ fontSize: "0.8125rem" }}>{l.footer.docs}</a>
          <a href="/privacy" className="nav-link" style={{ fontSize: "0.8125rem" }}>{l.footer.privacy}</a>
          <a href="/terms" className="nav-link" style={{ fontSize: "0.8125rem" }}>{l.footer.terms}</a>
          <a href="https://github.com/BSVibe" className="nav-link" style={{ fontSize: "0.8125rem" }} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:contact@bsvibe.dev" className="nav-link" style={{ fontSize: "0.8125rem" }}>contact@bsvibe.dev</a>
        </div>
      </footer>
    </div>
  );
}
