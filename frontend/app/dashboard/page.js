'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);

      // Fetch profile with usage data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f0] flex items-center justify-center">
        <p className="text-[#8b5e3c]">Loading...</p>
      </div>
    );
  }

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
    { name: 'PDF Reports', desc: isPro ? 'Generate report' : 'Pro feature', icon: '📄', href: isPro ? '/reports' : '/pricing' },
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-[#8b5e3c] uppercase tracking-widest mb-1">Welcome Back</p>
            <h1 className="text-3xl font-bold text-[#2c1810] flex items-center gap-2">
              🪔 {profile?.full_name || user?.user_metadata?.full_name || 'User'}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-[#8b5e3c] border border-[#d4a96a] px-4 py-2 rounded-full hover:bg-[#f5e6d0] transition"
          >
            Sign Out
          </button>
        </div>

        {/* Plan + Usage Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-[#e8d5b0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPro ? 'bg-[#d4a96a] text-white' : 'bg-[#2c1810] text-white'}`}>
                {isPro ? '⭐ PRO PLAN' : 'FREE PLAN'}
              </span>
            </div>
            {!isPro && (
              <button
                onClick={() => router.push('/pricing')}
                className="bg-[#d4a96a] hover:bg-[#c49555] text-white text-sm font-semibold px-4 py-2 rounded-full transition"
              >
                Upgrade to Pro ✨
              </button>
            )}
          </div>

          {/* Query usage bar */}
          {!isPro && (
            <div>
              <div className="flex justify-between text-sm text-[#8b5e3c] mb-2">
                <span>AI Queries Today</span>
                <span className={queriesUsed >= queryLimit ? 'text-red-500 font-semibold' : 'font-semibold'}>
                  {queriesUsed}/{queryLimit}
                </span>
              </div>
              <div className="w-full bg-[#f0e4d0] rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${queriesUsed >= queryLimit ? 'bg-red-400' : 'bg-[#8b5e3c]'}`}
                  style={{ width: `${queryPercent}%` }}
                />
              </div>
              {queriesUsed >= queryLimit && (
                <p className="text-xs text-red-500 mt-2">
                  Daily limit reached — resets at midnight or <a href="/pricing" className="underline font-semibold">upgrade to Pro</a>
                </p>
              )}
            </div>
          )}
          {isPro && (
            <p className="text-sm text-[#8b5e3c]">✨ Unlimited AI queries — enjoy Pro access!</p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'AI Queries Today', value: isPro ? '∞' : `${queriesUsed}/${queryLimit}`, icon: '🤖' },
            { label: 'Plans Saved', value: profile?.saved_plans_count || 0, icon: '📐' },
            { label: 'Reports Generated', value: profile?.reports_count || 0, icon: '📄' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 text-center border border-[#e8d5b0] shadow-sm">
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#d4a96a]">{stat.value}</div>
              <div className="text-xs text-[#8b5e3c] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tools Grid */}
        <h2 className="text-lg font-semibold text-[#2c1810] mb-4">Your Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              className="bg-white rounded-2xl p-5 border border-[#e8d5b0] shadow-sm hover:shadow-md hover:border-[#d4a96a] transition-all group"
            >
              <div className="text-3xl mb-2">{tool.icon}</div>
              <div className="font-semibold text-[#2c1810] group-hover:text-[#8b5e3c] transition">{tool.name}</div>
              <div className="text-xs text-[#8b5e3c] mt-1">{tool.desc}</div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
