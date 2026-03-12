'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle } from '../../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true); setError('');
    const { data, error } = await signInWithEmail(form.email, form.password);
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    const { error } = await signInWithGoogle();
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a00 0%, #2d1400 50%, #1a0a00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#FDF6EC', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🪔</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 700, color: '#2C1810', margin: '0 0 6px' }}>Welcome Back</h1>
          <p style={{ color: '#6B4C3B', fontSize: 14 }}>Sign in to your VastuForge account</p>
        </div>

        {/* Google Login */}
        <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', background: 'white', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, color: '#4A2C1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.3)' }} />
          <span style={{ color: '#8B6914', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.3)' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#4A2C1A', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'white', color: '#2C1810', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 6 }}>
          <label style={{ color: '#4A2C1A', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'white', color: '#2C1810', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {error && <div style={{ background: '#FFF0F0', border: '1px solid #ffcccc', borderRadius: 8, padding: '8px 12px', color: '#cc0000', fontSize: 13, marginBottom: 12 }}>❌ {error}</div>}

        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #C9A84C, #8B6914)', color: '#1a0a00', border: 'none', borderRadius: 25, padding: '13px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : 'Sign In 🪔'}
        </button>

        <p style={{ textAlign: 'center', color: '#6B4C3B', fontSize: 13, marginTop: 20 }}>
          Don't have an account? <Link href="/auth/signup" style={{ color: '#C9A84C', fontWeight: 600 }}>Sign up free</Link>
        </p>
      </div>
    </main>
  );
}
