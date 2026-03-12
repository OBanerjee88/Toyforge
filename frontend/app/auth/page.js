'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailAuth = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name } }
        });
        if (error) throw error;
        setSuccess('Account created! Please check your email to verify, then log in.');
        setMode('login');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email);
        if (error) throw error;
        setSuccess('Password reset email sent! Check your inbox.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF6EC 0%, #FDF0D5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🪔</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 700, color: '#2C1810', margin: '0 0 4px' }}>VastuForge</h1>
          <p style={{ color: '#8B6914', fontSize: 14 }}>Design your home in perfect harmony</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 8px 40px rgba(44,24,16,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
          {/* Tabs */}
          {mode !== 'forgot' && (
            <div style={{ display: 'flex', background: '#FDF6EC', borderRadius: 12, padding: 4, marginBottom: 24 }}>
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: mode === m ? 'linear-gradient(135deg,#C9A84C,#8B6914)' : 'transparent', color: mode === m ? '#1a0a00' : '#8B6914', fontWeight: mode === m ? 700 : 400, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          {mode === 'forgot' && (
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: 14 }}>← Back to Sign In</button>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#2C1810', margin: '8px 0 4px' }}>Reset Password</h2>
            </div>
          )}

          {/* Google Button */}
          {mode !== 'forgot' && (
            <>
              <button onClick={handleGoogle} disabled={loading}
                style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                <span style={{ color: '#9CA3AF', fontSize: 12 }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              </div>
            </>
          )}

          {/* Form fields */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#4A2C1A', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: '#FDF6EC', color: '#2C1810', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: '#4A2C1A', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: '#FDF6EC', color: '#2C1810', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {mode !== 'forgot' && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ color: '#4A2C1A', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: '#FDF6EC', color: '#2C1810', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer' }}>Forgot password?</button>
            </div>
          )}

          {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: 8, padding: '8px 12px', color: '#CC0000', fontSize: 13, marginBottom: 14 }}>❌ {error}</div>}
          {success && <div style={{ background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '8px 12px', color: '#166534', fontSize: 13, marginBottom: 14 }}>✅ {success}</div>}

          <button onClick={handleEmailAuth} disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#C9A84C,#8B6914)', color: '#1a0a00', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : mode === 'login' ? 'Sign In 🪔' : mode === 'signup' ? 'Create Account ✨' : 'Send Reset Email'}
          </button>

          {mode === 'signup' && (
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 11, marginTop: 12 }}>
              By signing up you agree to our Terms of Service
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
