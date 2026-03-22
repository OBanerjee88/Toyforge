'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!user) { window.location.href = '/auth/login'; return; }
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Failed to load payment gateway. Please try again.'); setLoading(false); return; }
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://toyforge.onrender.com';
      const res = await fetch(`${API}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 19900, user_id: user.id })
      });
      const order = await res.json();
      if (!order.id) { alert('Could not create payment order. Please try again.'); setLoading(false); return; }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: 'INR',
        name: 'VastuForge',
        description: 'Pro Plan — ₹199/month',
        order_id: order.id,
        prefill: { email: user.email, name: user.user_metadata?.full_name || '' },
        theme: { color: '#C9A84C' },
        handler: async (response) => {
          const verifyRes = await fetch(`${API}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id
            })
          });
          const result = await verifyRes.json();
          if (result.success) { window.location.href = '/dashboard?upgraded=true'; }
          else { alert('Payment verification failed. Please contact support.'); }
        },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const freeFeatures = ['10 AI queries per day','Browse 70+ Vastu designs','Browse 15 floor plans','1 design alternative','Vastu compliance checker','Plan My Home AI','Ad-supported'];
  const proFeatures = ['Unlimited AI queries','Browse 70+ Vastu designs','Browse 15 floor plans','4 design alternatives','Vastu compliance checker','Plan My Home AI','PDF Vastu reports','Save unlimited plans','Ad-free experience','Priority support'];

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'Georgia, serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: '#2C1810', marginBottom: 12 }}>Simple, Transparent Pricing</h1>
        <p style={{ color: '#6B4C3B', fontSize: 16 }}>Start free. Upgrade when you need more.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
        {/* Free Plan */}
        <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #e8d5b0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2C1810', marginBottom: 4 }}>Free</h2>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#2C1810' }}>₹0</div>
          <div style={{ color: '#8b5e3c', fontSize: 14, marginBottom: 24 }}>forever</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {freeFeatures.map((f, i) => (
              <li key={i} style={{ fontSize: 14, color: '#4A2C1A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#C9A84C', fontWeight: 'bold' }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <div style={{ background: '#f5f0e8', color: '#8b5e3c', textAlign: 'center', padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 600 }}>Current Plan</div>
        </div>

        {/* Pro Plan */}
        <div style={{ background: 'linear-gradient(135deg, #2C1810, #4A2C1A)', borderRadius: 20, padding: 32, border: '2px solid #C9A84C', boxShadow: '0 8px 32px rgba(44,24,16,0.2)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, right: 16, background: '#C9A84C', color: '#2C1810', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>POPULAR</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#FDF6EC', marginBottom: 4 }}>Pro</h2>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#C9A84C' }}>₹199</div>
          <div style={{ color: '#d4a96a', fontSize: 14, marginBottom: 24 }}>per month</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proFeatures.map((f, i) => (
              <li key={i} style={{ fontSize: 14, color: '#FDF6EC', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#C9A84C', fontWeight: 'bold' }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <button onClick={handleUpgrade} disabled={loading} style={{ width: '100%', background: '#C9A84C', color: '#2C1810', border: 'none', borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : 'Upgrade to Pro ✨'}
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #e8d5b0' }}>
        <h3 style={{ color: '#2C1810', marginBottom: 20, fontSize: 18 }}>Frequently Asked Questions</h3>
        {[
          { q: 'Can I cancel anytime?', a: 'Yes — cancel anytime from your dashboard. No questions asked.' },
          { q: 'What payment methods are accepted?', a: 'UPI, credit/debit cards, net banking, and all major wallets via Razorpay.' },
          { q: 'Is my payment secure?', a: 'Yes — all payments are processed by Razorpay, a PCI-DSS compliant payment gateway.' },
          { q: 'Will I get a receipt?', a: 'Yes — a payment receipt is sent to your registered email automatically.' },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < 3 ? '1px solid #f0e4d0' : 'none' }}>
            <div style={{ fontWeight: 600, color: '#2C1810', marginBottom: 4, fontSize: 14 }}>Q: {item.q}</div>
            <div style={{ color: '#6B4C3B', fontSize: 14 }}>{item.a}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
