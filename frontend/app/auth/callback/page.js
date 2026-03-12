'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push('/dashboard');
      else router.push('/auth/login');
    });
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1a0a00,#2d1400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#D4AF6A' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🪔</div>
        <p style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, serif' }}>Signing you in...</p>
      </div>
    </main>
  );
}
