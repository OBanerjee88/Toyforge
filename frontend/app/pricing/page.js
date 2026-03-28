'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Script from 'next/script';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://toyforge.onrender.com';
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY;

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    // Check if Razorpay key is configured
    if (!RAZORPAY_KEY) {
      console.error('NEXT_PUBLIC_RAZORPAY_KEY is not configured');
      setConfigError(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchPlan(session.user.id);
      }
    });
  }, []);

  const fetchPlan = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();
      if (data?.plan) setPlan(data.plan);
    } catch (e) {
      console.log('Could not fetch plan');
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      alert('Please login first');
      window.location.href = '/auth/login';
      return;
    }

    // SECURITY: Fail explicitly if Razorpay not configured
    if (!RAZORPAY_KEY) {
      alert('Payment system is not configured. Please contact support.');
      return;
    }

    setLoading(true);

    try {
      const orderRes = await fetch(`${API}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      if (!orderRes.ok) {
        throw new Error('Could not create payment order');
      }

      const order = await orderRes.json();

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: 'VastuForge',
        description: 'Pro Plan - Monthly',
        order_id: order.id,
        handler: async function (response) {
          try {
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

            if (verifyRes.ok && result.success) {
              alert('🎉 Welcome to Pro! Redirecting to dashboard...');
              window.location.href = '/dashboard';
            } else {
              alert(result.detail || 'Payment verification failed. Please contact support.');
            }
          } catch (e) {
            alert('Payment verification error. Please contact support if amount was deducted.');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#C9A84C'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (e) {
      alert('Could not create payment order. Please try again.');
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: '#2C1810',
            marginBottom: 8
          }}>
            Choose Your Plan
          </h1>
          <p style={{ color: '#6B4C3B', fontSize: 16 }}>
            Unlock the full power of Vastu guidance
          </p>
        </div>

        {/* Config Error Warning */}
        {configError && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #EF4444',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            textAlign: 'center'
          }}>
            <p style={{ color: '#DC2626', margin: 0, fontSize: 14 }}>
              ⚠️ Payment system is currently unavailable. Please try again later or contact support.
            </p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24
        }}>
          {/* Free Plan */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e0d5c7',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2C1810', marginBottom: 4 }}>Free</h2>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#4A2C1A', marginBottom: 16 }}>
              ₹0 <span style={{ fontSize: 14, fontWeight: 400, color: '#8b5e3c' }}>forever</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
              {[
                '10 AI queries per day',
                'Basic Vastu advice',
                'Design library access',
                'Floor plan generator',
                'Ad-supported'
              ].map(f => (
                <li key={f} style={{ padding: '8px 0', color: '#4A2C1A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#C9A84C' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 10,
                border: '1px solid #d0c4b4',
                background: '#f5f0e8',
                color: '#8b7355',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'not-allowed'
              }}
            >
              {plan === 'free' ? 'Current Plan' : 'Free Plan'}
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{
            background: 'linear-gradient(135deg, #2C1810 0%, #4A2C1A 100%)',
            borderRadius: 16,
            padding: 24,
            border: '2px solid #C9A84C',
            boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: -12,
              right: 16,
              background: 'linear-gradient(135deg, #C9A84C, #8B6914)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600
            }}>
              POPULAR
            </div>
            
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5E6D3', marginBottom: 4 }}>Pro</h2>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#C9A84C', marginBottom: 16 }}>
              ₹199 <span style={{ fontSize: 14, fontWeight: 400, color: '#d4c4a8' }}>per month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
              {[
                'Unlimited AI queries',
                'Priority response time',
                'PDF Vastu reports',
                'Save unlimited plans',
                'Ad-free experience',
                'Priority support'
              ].map(f => (
                <li key={f} style={{ padding: '8px 0', color: '#F5E6D3', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#C9A84C' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            
            {plan === 'pro' ? (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#5a4a3a',
                  color: '#C9A84C',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'not-allowed'
                }}
              >
                ✓ You're on Pro
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading || configError}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #C9A84C, #8B6914)',
                  color: '#1a0a00',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: (loading || configError) ? 'not-allowed' : 'pointer',
                  opacity: (loading || configError) ? 0.7 : 1
                }}
              >
                {loading ? 'Processing...' : 'Upgrade to Pro ✨'}
              </button>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: 48 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: '#2C1810', marginBottom: 16 }}>
            Frequently Asked Questions
          </h3>
          
          {[
            { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription anytime. You\'ll retain Pro access until the end of your billing period.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, and net banking through Razorpay.' },
            { q: 'Is my payment secure?', a: 'Absolutely. All payments are processed securely through Razorpay with bank-level encryption.' }
          ].map((faq, i) => (
            <div key={i} style={{ marginBottom: 16, padding: 16, background: '#faf7f2', borderRadius: 10 }}>
              <div style={{ fontWeight: 600, color: '#2C1810', marginBottom: 4 }}>{faq.q}</div>
              <div style={{ color: '#6B4C3B', fontSize: 14 }}>{faq.a}</div>
            </div>
          ))}
        </div>

        {!user && (
          <p style={{ textAlign: 'center', marginTop: 32, color: '#8b5e3c' }}>
            <a href="/auth/login" style={{ color: '#8B6914', fontWeight: 600 }}>Login</a> to upgrade to Pro
          </p>
        )}
      </main>
    </>
  );
}
