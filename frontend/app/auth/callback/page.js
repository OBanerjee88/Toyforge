'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      router.push(session ? '/dashboard' : '/auth/login');
    });

    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      router.push(session ? '/dashboard' : '/auth/login');
    });

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fdf8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16
    }}>
      <div style={{ fontSize: 48 }}>🪔</div>
      <p style={{ color: '#8b5e3c', fontSize: 14 }}>Completing sign in...</p>
    </div>
  );
}
