'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, signOut } from '../../lib/supabase';

const PLAN_COLORS = { free: '#6B4C3B', pro: '#C9A84C', expert: '#228B22' };
const PLAN_BG = { free: '#FDF6EC', pro: '#FFF8DC', expert: '#E8F5E9' };

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF6EC' }}>
      <div style={{ textAlign: 'center', color: '#C9A84C', fontSize: 48 }}>🪔</div>
    </main>
  );

  const plan = profile?.plan || 'free';
  const queriesUsed = profile?.queries_today || 0;
  const queryLimit = plan === 'free' ? 3 : 999;
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ color: '#C9A84C', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Welcome back</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#2C1810', margin: 0 }}>🪔 {name}</h1>
        </div>
        <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '8px 18px', color: '#6B4C3B', cursor: 'pointer', fontSize: 13 }}>Sign Out</button>
      </div>

      {/* Plan Badge */}
      <div style={{ background: PLAN_BG[plan], border: `1px solid ${PLAN_COLORS[plan]}40`, borderRadius: 16, padding: '1.2rem 1.5rem', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ background: PLAN_COLORS[plan], color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1 }}>{plan} plan</span>
          <p style={{ color: '#4A2C1A', fontSize: 14, margin: '8px 0 0' }}>
            {plan === 'free' ? `${queriesUsed}/3 AI queries used today` : '✨ Unlimited AI queries'}
          </p>
        </div>
        {plan === 'free' && (
          <Link href="/pricing" style={{ background: 'linear-gradient(135deg,#C9A84C,#8B6914)', color: '#1a0a00', textDecoration: 'none', padding: '10px 20px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>Upgrade to Pro ✨</Link>
        )}
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '🤖', label: 'AI Queries Today', value: `${queriesUsed}/${plan === 'free' ? 3 : '∞'}` },
          { icon: '📐', label: 'Plans Saved', value: profile?.saved_plans || 0 },
          { icon: '📄', label: 'Reports Generated', value: profile?.reports_generated || 0 },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: 14, padding: '1.2rem', border: '1px solid rgba(201,168,76,0.2)', textAlign: 'center', boxShadow: '0 2px 8px rgba(44,24,16,0.05)' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, color: '#C9A84C' }}>{stat.value}</div>
            <div style={{ color: '#6B4C3B', fontSize: 12 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#2C1810', marginBottom: 16 }}>Your Tools</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { icon: '🤖', title: 'AI Advisor', desc: 'Ask Vastu questions', href: '/advisor', free: true },
          { icon: '🧭', title: 'Vastu Checker', desc: 'Check your home', href: '/checker', free: true },
          { icon: '🏠', title: 'Plan My Home', desc: 'AI room placement', href: '/planner', free: true },
          { icon: '📚', title: 'Design Library', desc: '70 Vastu designs', href: '/library', free: true },
          { icon: '📐', title: 'Floor Plans', desc: '15 curated layouts', href: '/plans', free: true },
          { icon: '📄', title: 'PDF Reports', desc: 'Download your report', href: '/report', free: false },
        ].map(tool => (
          <Link key={tool.title} href={tool.free || plan !== 'free' ? tool.href : '/pricing'} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 14, padding: '1.2rem', border: `1px solid rgba(201,168,76,${!tool.free && plan === 'free' ? 0.1 : 0.2})`, opacity: !tool.free && plan === 'free' ? 0.6 : 1, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(44,24,16,0.05)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{tool.icon}</div>
              <div style={{ fontWeight: 700, color: '#2C1810', fontSize: 14, marginBottom: 4 }}>{tool.title}</div>
              <div style={{ color: '#6B4C3B', fontSize: 12 }}>{tool.desc}</div>
              {!tool.free && plan === 'free' && <div style={{ color: '#C9A84C', fontSize: 11, marginTop: 6, fontWeight: 600 }}>🔒 Pro only</div>}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
