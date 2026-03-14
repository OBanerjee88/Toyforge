'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      setUser(session.user);
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData);
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#fdf8f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#8b5e3c' }}>Loading...</p>
    </div>
  );

  const plan = profile?.plan || 'free';
  const isPro = plan === 'pro';
  const queriesUsed = profile?.daily_queries_used || 0;
  const queryLimit = 10;
  const queryPercent = Math.min((queriesUsed / queryLimit) * 100, 100);

  const tools = [
    { name: 'AI Advisor', desc: 'Ask Vastu questions', icon: '🤖', href: '/advisor' },
    { name: 'Vastu Checker', desc: 'Check your home', icon: '🧭', href: '/checker' },
    { name: 'Plan My Home', desc: 'AI room placement', icon: '🏠', href: '/planner' },
    { name: 'Design Library', desc: '70 Vastu designs', icon: '🎨', href: '/library' },
    { name: 'Floor Plans', desc: '15 floor plans', icon: '📐', href: '/plans' },
    { name: 'PDF Reports', desc: isPro ? 'Generate report' : 'Pro feature 🔒', icon: '📄', href: isPro ? '/reports' : '/pricing' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#fdf8f0', fontFamily:'Georgia, serif' }}>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 20px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px' }}>
          <div>
            <p style={{ fontSize:'12px', color:'#8b5e3c', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'6px' }}>Welcome Back</p>
            <h1 style={{ fontSize:'32px', fontWeight:'bold', color:'#2c1810', margin:0 }}>
              🪔 {profile?.full_name || user?.user_metadata?.full_name || 'User'}
            </h1>
          </div>
          <button onClick={handleSignOut} style={{ fontSize:'13px', color:'#8b5e3c', border:'1px solid #d4a96a', padding:'8px 16px', borderRadius:'20px', background:'white', cursor:'pointer' }}>
            Sign Out
          </button>
        </div>

        {/* Plan Card */}
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', marginBottom:'24px', border:'1px solid #e8d5b0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: !isPro ? '16px' : '0' }}>
            <span style={{ fontSize:'12px', fontWeight:'bold', padding:'4px 12px', borderRadius:'20px', background: isPro ? '#d4a96a' : '#2c1810', color:'white' }}>
              {isPro ? '⭐ PRO PLAN' : 'FREE PLAN'}
            </span>
            {!isPro && (
              <button onClick={() => router.push('/pricing')} style={{ background:'#d4a96a', color:'white', border:'none', padding:'8px 18px', borderRadius:'20px', fontWeight:'bold', fontSize:'13px', cursor:'pointer' }}>
                Upgrade to Pro ✨
              </button>
            )}
          </div>
          {!isPro && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#8b5e3c', marginBottom:'8px' }}>
                <span>AI Queries Today</span>
                <span style={{ fontWeight:'bold', color: queriesUsed >= queryLimit ? '#e53e3e' : '#2c1810' }}>{queriesUsed}/{queryLimit}</span>
              </div>
              <div style={{ background:'#f0e4d0', borderRadius:'99px', height:'8px', overflow:'hidden' }}>
                <div style={{ height:'8px', borderRadius:'99px', background: queriesUsed >= queryLimit ? '#fc8181' : '#8b5e3c', width:`${queryPercent}%`, transition:'width 0.3s' }} />
              </div>
              {queriesUsed >= queryLimit && (
                <p style={{ fontSize:'12px', color:'#e53e3e', marginTop:'8px' }}>
                  Daily limit reached — resets at midnight or <a href="/pricing" style={{ textDecoration:'underline', fontWeight:'bold' }}>upgrade to Pro</a>
                </p>
              )}
            </div>
          )}
          {isPro && <p style={{ fontSize:'13px', color:'#8b5e3c', margin:0 }}>✨ Unlimited AI queries — enjoy Pro access!</p>}
        </div>

        {/* Stats Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px', marginBottom:'32px' }}>
          {[
            { label:'AI Queries Today', value: isPro ? '∞' : `${queriesUsed}/${queryLimit}`, icon:'🤖' },
            { label:'Plans Saved', value: profile?.saved_plans_count || 0, icon:'📐' },
            { label:'Reports Generated', value: profile?.reports_count || 0, icon:'📄' },
          ].map((stat) => (
            <div key={stat.label} style={{ background:'white', borderRadius:'16px', padding:'20px', textAlign:'center', border:'1px solid #e8d5b0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:'28px', marginBottom:'6px' }}>{stat.icon}</div>
              <div style={{ fontSize:'22px', fontWeight:'bold', color:'#d4a96a' }}>{stat.value}</div>
              <div style={{ fontSize:'11px', color:'#8b5e3c', marginTop:'4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tools Grid */}
        <h2 style={{ fontSize:'18px', fontWeight:'600', color:'#2c1810', marginBottom:'16px' }}>Your Tools</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px' }}>
          {tools.map((tool) => (
            <a key={tool.name} href={tool.href} style={{ background:'white', borderRadius:'16px', padding:'20px', border:'1px solid #e8d5b0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textDecoration:'none', display:'block', transition:'box-shadow 0.2s' }}
              onMouseOver={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'}
              onMouseOut={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'}>
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>{tool.icon}</div>
              <div style={{ fontWeight:'600', color:'#2c1810', fontSize:'15px' }}>{tool.name}</div>
              <div style={{ fontSize:'12px', color:'#8b5e3c', marginTop:'4px' }}>{tool.desc}</div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
