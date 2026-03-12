'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase, signOut } from '../lib/supabase';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => { await signOut(); router.push('/'); };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/library', label: 'Designs' },
    { href: '/plans', label: 'Floor Plans' },
    { href: '/planner', label: 'Plan My Home' },
    { href: '/advisor', label: 'AI Advisor' },
    { href: '/checker', label: 'Vastu Checker' },
  ];

  return (
    <nav style={{ background: 'linear-gradient(135deg,#1a0a00 0%,#2d1400 50%,#1a0a00 100%)', borderBottom: '1px solid rgba(201,168,76,0.4)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(139,105,20,0.3)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🪔</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,#F5D78E,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VastuForge</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: 'none', padding: '6px 12px', borderRadius: 20, border: '1px solid transparent', background: pathname === l.href ? 'linear-gradient(135deg,#C9A84C,#8B6914)' : 'transparent', color: pathname === l.href ? '#1a0a00' : '#D4AF6A', fontWeight: pathname === l.href ? 700 : 400, fontSize: 13, borderColor: pathname !== l.href ? 'rgba(201,168,76,0.15)' : 'transparent' }}>{l.label}</Link>
          ))}
          <div style={{ width: 1, height: 20, background: 'rgba(201,168,76,0.3)', margin: '0 6px' }} />
          {user ? (
            <>
              <Link href="/dashboard" style={{ textDecoration: 'none', padding: '6px 14px', borderRadius: 20, background: pathname === '/dashboard' ? 'linear-gradient(135deg,#C9A84C,#8B6914)' : 'rgba(201,168,76,0.1)', color: '#F5D78E', fontSize: 13, fontWeight: 600, border: '1px solid rgba(201,168,76,0.3)' }}>Dashboard</Link>
              <button onClick={handleSignOut} style={{ padding: '6px 14px', borderRadius: 20, background: 'transparent', color: '#D4AF6A', border: '1px solid rgba(201,168,76,0.2)', fontSize: 13, cursor: 'pointer' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ textDecoration: 'none', padding: '6px 14px', borderRadius: 20, color: '#D4AF6A', fontSize: 13, border: '1px solid rgba(201,168,76,0.2)' }}>Login</Link>
              <Link href="/auth/signup" style={{ textDecoration: 'none', padding: '6px 14px', borderRadius: 20, background: 'linear-gradient(135deg,#C9A84C,#8B6914)', color: '#1a0a00', fontSize: 13, fontWeight: 700 }}>Sign Up Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
