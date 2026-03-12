'use client';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    color: '#6B7280',
    bg: '#F9FAFB',
    features: [
      '3 AI queries per day',
      'Browse 70 design library',
      'View 15 floor plans',
      'Basic Vastu checker',
      'Community support',
    ],
    missing: ['Save & download plans', 'PDF Vastu reports', 'Unlimited AI queries', 'Custom planning sessions'],
    cta: 'Get Started Free',
    href: '/auth',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: 'per month',
    color: '#C9A84C',
    bg: 'linear-gradient(135deg,#1a0a00,#3d1f00)',
    features: [
      'Unlimited AI Advisor queries',
      'Unlimited Vastu Checker',
      'Unlimited Home Planning',
      'Save & download floor plans',
      'Personalised Vastu PDF reports',
      'Ad-free experience',
      'Priority email support',
    ],
    missing: [],
    cta: 'Start Pro — ₹299/month',
    href: '/auth',
    highlight: true,
  },
  {
    name: 'Expert',
    price: '₹699',
    period: 'per month',
    color: '#8B5CF6',
    bg: '#FAF5FF',
    features: [
      'Everything in Pro',
      '2 custom room planning sessions/month',
      'Dedicated Vastu consultant',
      'Priority response (< 2 hours)',
      'Home visit consultation (virtual)',
      'Detailed home audit report',
    ],
    missing: [],
    cta: 'Start Expert — ₹699/month',
    href: '/auth',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ color: '#C9A84C', fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Simple Pricing</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: '#2C1810', margin: '0 0 12px' }}>Choose Your Plan</h1>
        <p style={{ color: '#6B4C3B', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Start free, upgrade when you need more. Cancel anytime.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
        {PLANS.map(plan => (
          <div key={plan.name} style={{ background: plan.highlight ? plan.bg : 'white', borderRadius: 20, padding: '2rem', border: plan.highlight ? 'none' : '1px solid rgba(201,168,76,0.2)', boxShadow: plan.highlight ? '0 20px 60px rgba(44,24,16,0.3)' : '0 4px 20px rgba(44,24,16,0.06)', position: 'relative', transform: plan.highlight ? 'scale(1.03)' : 'none' }}>
            {plan.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#C9A84C,#8B6914)', color: '#1a0a00', padding: '4px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>⭐ MOST POPULAR</div>}

            <div style={{ color: plan.highlight ? '#D4AF6A' : plan.color, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{plan.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 700, color: plan.highlight ? '#F5D78E' : '#2C1810' }}>{plan.price}</span>
              <span style={{ color: plan.highlight ? '#D4AF6A' : '#8B6914', fontSize: 13 }}>/{plan.period}</span>
            </div>
            <div style={{ height: 1, background: plan.highlight ? 'rgba(201,168,76,0.3)' : '#F3F4F6', margin: '16px 0' }} />

            <div style={{ marginBottom: 20 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, padding: '5px 0', color: plan.highlight ? '#D4AF6A' : '#4A2C1A', fontSize: 13 }}>
                  <span style={{ color: plan.highlight ? '#C9A84C' : '#228B22' }}>✓</span>{f}
                </div>
              ))}
              {plan.missing.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, padding: '5px 0', color: '#9CA3AF', fontSize: 13 }}>
                  <span>✗</span>{f}
                </div>
              ))}
            </div>

            <Link href={plan.href} style={{ display: 'block', textAlign: 'center', background: plan.highlight ? 'linear-gradient(135deg,#C9A84C,#8B6914)' : 'transparent', color: plan.highlight ? '#1a0a00' : plan.color, border: plan.highlight ? 'none' : `2px solid ${plan.color}`, padding: '12px', borderRadius: 25, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, color: '#8B6914', fontSize: 13 }}>
        🔒 Secure payments via Razorpay &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; 7-day money-back guarantee
      </div>
    </main>
  );
}
