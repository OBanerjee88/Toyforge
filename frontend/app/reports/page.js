'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Reports() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.plan !== 'pro') {
        router.push('/pricing');
        return;
      }
      
      setPlan(profile.plan);
      setLoading(false);
    };
    
    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#fdf8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p style={{ color: '#8b5e3c' }}>Loading...</p>
      </div>
    );
  }

  return (
    <main style={{ 
      maxWidth: 800, 
      margin: '0 auto', 
      padding: '2rem',
      minHeight: '100vh',
      background: '#fdf8f0'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 700,
          color: '#2C1810',
          margin: '0 0 8px'
        }}>
          PDF Reports
        </h1>
        <span style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #C9A84C, #8B6914)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600
        }}>
          PRO FEATURE
        </span>
      </div>

      {/* Coming Soon Card */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 32,
        border: '1px solid rgba(201,168,76,0.2)',
        boxShadow: '0 4px 20px rgba(44,24,16,0.08)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚧</div>
        <h2 style={{ 
          color: '#2C1810', 
          fontSize: 24, 
          marginBottom: 12 
        }}>
          Coming Soon!
        </h2>
        <p style={{ 
          color: '#6B4C3B', 
          fontSize: 15, 
          lineHeight: 1.6,
          maxWidth: 500,
          margin: '0 auto 24px'
        }}>
          We're building beautiful, comprehensive PDF Vastu reports that you can 
          download and share. As a Pro member, you'll get unlimited access when it launches.
        </p>
        
        <div style={{
          background: '#FDF6EC',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24
        }}>
          <h3 style={{ color: '#2C1810', fontSize: 16, marginBottom: 12 }}>
            What's included:
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            display: 'grid',
            gap: 8
          }}>
            {[
              'Complete Vastu analysis of your home',
              'Room-by-room recommendations',
              'Direction-specific remedies',
              'Printable action checklist',
              'Share with family or consultants'
            ].map((item, i) => (
              <li key={i} style={{ 
                color: '#4A2C1A', 
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ color: '#C9A84C' }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'linear-gradient(135deg, #C9A84C, #8B6914)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Notify Me */}
      <p style={{ 
        textAlign: 'center', 
        marginTop: 24, 
        color: '#8b5e3c',
        fontSize: 13
      }}>
        We'll notify you at <strong>{user?.email}</strong> when reports are ready!
      </p>
    </main>
  );
}
