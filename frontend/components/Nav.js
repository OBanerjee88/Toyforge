'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase, signOut } from '../lib/supabase';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    router.push('/');
  };

  const links = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/library', label: 'Designs', icon: '🎨' },
    { href: '/plans', label: 'Floor Plans', icon: '📐' },
    { href: '/planner', label: 'Plan My Home', icon: '🏡' },
    { href: '/advisor', label: 'AI Advisor', icon: '🤖' },
    { href: '/checker', label: 'Vastu Checker', icon: '🧭' },
    { href: '/pricing', label: 'Pricing', icon: '💎' },
  ];

  return (
    <>
      <nav style={{
        background: 'linear-gradient(135deg,#1a0a00 0%,#2d1400 50%,#1a0a00 100%)',
        borderBottom: '1px solid rgba(201,168,76,0.4)',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(139,105,20,0.3)'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🪔</span>
            <span style={{
              fontFamily: 'Georgia,serif',
              fontSize: 20,
              fontWeight: 700,
              background: 'linear-gradient(135deg,#F5D78E,#C9A84C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>VastuForge</span>
          </Link>

          {/* Right side: Auth buttons + Burger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Quick auth buttons (visible on desktop) */}
            <div className="auth-quick" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user ? (
                <Link href="/dashboard" style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: pathname === '/dashboard' ? 'linear-gradient(135deg,#C9A84C,#8B6914)' : 'rgba(201,168,76,0.1)',
                  color: '#F5D78E',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid rgba(201,168,76,0.3)'
                }}>Dashboard</Link>
              ) : (
                <Link href="/auth/signup" style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'linear-gradient(135deg,#C9A84C,#8B6914)',
                  color: '#1a0a00',
                  fontSize: 13,
                  fontWeight: 700
                }}>Sign Up Free</Link>
              )}
            </div>

            {/* Burger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              style={{
                background: menuOpen ? 'rgba(201,168,76,0.2)' : 'none',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 8,
                cursor: 'pointer',
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                transition: 'background 0.2s'
              }}
            >
              <span style={{
                display: 'block',
                width: 22,
                height: 2,
                background: '#C9A84C',
                borderRadius: 2,
                transition: 'all 0.3s',
                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
              }} />
              <span style={{
                display: 'block',
                width: 22,
                height: 2,
                background: '#C9A84C',
                borderRadius: 2,
                transition: 'all 0.3s',
                opacity: menuOpen ? 0 : 1
              }} />
              <span style={{
                display: 'block',
                width: 22,
                height: 2,
                background: '#C9A84C',
                borderRadius: 2,
                transition: 'all 0.3s',
                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
              }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 98,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide Menu */}
      <div
        style={{
          position: 'fixed',
          top: 64,
          right: 0,
          width: '320px',
          maxWidth: '85vw',
          height: 'calc(100vh - 64px)',
          background: 'linear-gradient(180deg, #1a0a00 0%, #2d1400 100%)',
          borderLeft: '1px solid rgba(201,168,76,0.3)',
          zIndex: 99,
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
          boxShadow: menuOpen ? '-10px 0 30px rgba(0,0,0,0.3)' : 'none'
        }}
      >
        <div style={{ padding: '24px 20px' }}>
          {/* User greeting (if logged in) */}
          {user && (
            <div style={{
              padding: '16px',
              background: 'rgba(201,168,76,0.1)',
              borderRadius: 12,
              marginBottom: 20,
              border: '1px solid rgba(201,168,76,0.2)'
            }}>
              <p style={{ color: '#8b7355', fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
                Welcome back
              </p>
              <p style={{ color: '#F5D78E', fontSize: 16, margin: 0, fontWeight: 600 }}>
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </p>
            </div>
          )}

          {/* Section: Navigate */}
          <p style={{ color: '#8b7355', fontSize: 11, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 2, paddingLeft: 4 }}>
            Navigate
          </p>

          {/* Nav Links */}
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                padding: '14px 16px',
                borderRadius: 10,
                marginBottom: 4,
                background: pathname === l.href ? 'linear-gradient(135deg,#C9A84C,#8B6914)' : 'transparent',
                color: pathname === l.href ? '#1a0a00' : '#D4AF6A',
                fontWeight: pathname === l.href ? 700 : 400,
                fontSize: 15,
                border: pathname !== l.href ? '1px solid rgba(201,168,76,0.08)' : 'none',
                transition: 'background 0.2s'
              }}
            >
              <span style={{ fontSize: 18 }}>{l.icon}</span>
              {l.label}
            </Link>
          ))}

          {/* Divider */}
          <div style={{
            height: 1,
            background: 'rgba(201,168,76,0.2)',
            margin: '20px 0'
          }} />

          {/* Section: Account */}
          <p style={{ color: '#8b7355', fontSize: 11, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 2, paddingLeft: 4 }}>
            Account
          </p>

          {/* Auth Section */}
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textDecoration: 'none',
                  padding: '14px 16px',
                  borderRadius: 10,
                  marginBottom: 8,
                  background: pathname === '/dashboard' ? 'linear-gradient(135deg,#C9A84C,#8B6914)' : 'rgba(201,168,76,0.1)',
                  color: pathname === '/dashboard' ? '#1a0a00' : '#F5D78E',
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1px solid rgba(201,168,76,0.3)'
                }}
              >
                <span style={{ fontSize: 18 }}>📊</span>
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: 'transparent',
                  color: '#D4AF6A',
                  border: '1px solid rgba(201,168,76,0.2)',
                  fontSize: 15,
                  cursor: 'pointer'
                }}
              >
                <span>🚪</span>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  padding: '14px 16px',
                  borderRadius: 10,
                  marginBottom: 8,
                  color: '#D4AF6A',
                  fontSize: 15,
                  border: '1px solid rgba(201,168,76,0.2)'
                }}
              >
                <span>🔑</span>
                Login
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#C9A84C,#8B6914)',
                  color: '#1a0a00',
                  fontSize: 15,
                  fontWeight: 700
                }}
              >
                <span>✨</span>
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Hide quick auth on mobile */}
      <style jsx global>{`
        @media (max-width: 600px) {
          .auth-quick {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
