'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://toyforge.onrender.com';

const SUGGESTIONS = [
  "Is my North-West kitchen okay?",
  "Best colour for my bedroom?",
  "My toilet is in North-East, any remedy?",
  "Which direction should I sleep?",
  "How to improve Vastu for study room?",
  "Good plants for my living room?"
];

export default function Advisor() {
  const [msgs, setMsgs] = useState([{
    role: 'ai',
    content: 'Namaste! 🙏 I am VastuAI, your personal Vastu Shastra expert. Tell me about your home — its facing direction, room positions, or any Vastu concerns you have. I\'m here to guide you towards harmony and prosperity. 🪔'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [homeContext, setHomeContext] = useState(null);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  const send = async (msg) => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput('');

    const newMsgs = [...msgs, { role: 'user', content: text }];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      // Send FULL history, backend handles truncation/summarization
      const history = newMsgs.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      const r = await fetch(`${API}/vastu-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.slice(0, -1),
          user_id: userId
        })
      });

      if (r.status === 429) {
        setMsgs(m => [...m, {
          role: 'ai',
          content: '⚠️ You\'ve used all 10 free AI queries for today. Upgrade to Pro for unlimited access! Visit /pricing to upgrade. 🙏'
        }]);
        setLoading(false);
        return;
      }

      const d = await r.json();
      
      // Track context if returned
      if (d.context_used) {
        setHomeContext(d.context_used);
      }

      setMsgs(m => [...m, { role: 'ai', content: d.reply }]);
    } catch {
      setMsgs(m => [...m, {
        role: 'ai',
        content: 'I apologise, I could not connect to the Vastu server. Please try again. 🙏'
      }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMsgs([{
      role: 'ai',
      content: 'Namaste! 🙏 Let\'s start fresh. Tell me about your home and I\'ll help you with Vastu guidance. 🪔'
    }]);
    setHomeContext(null);
  };

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🤖</div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 700,
          color: '#2C1810',
          margin: '0 0 8px'
        }}>
          AI Vastu Advisor
        </h1>
        <p style={{ color: '#6B4C3B', fontSize: 15 }}>
          Ask anything about Vastu Shastra for your home
        </p>
      </div>

      {/* Context indicator - shows what AI remembers */}
      {homeContext && Object.keys(homeContext).length > 0 && (
        <div style={{
          background: '#F5F0E6',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(201,168,76,0.2)'
        }}>
          <div>
            <span style={{ fontWeight: 600, color: '#5C4A3D' }}>🧠 AI remembers: </span>
            <span style={{ color: '#6B4C3B' }}>
              {homeContext.home_type && `${homeContext.home_type}`}
              {homeContext.entrance_direction && ` • ${homeContext.entrance_direction} entrance`}
              {homeContext.city && ` • ${homeContext.city}`}
            </span>
          </div>
          <button
            onClick={clearChat}
            style={{
              background: 'none',
              border: 'none',
              color: '#8B6914',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Start fresh
          </button>
        </div>
      )}

      {/* Suggestions - only show at start */}
      {msgs.length <= 1 && (
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 20,
          justifyContent: 'center'
        }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                background: '#FDF0D5',
                color: '#8B6914',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat Container */}
      <div style={{
        background: 'white',
        borderRadius: 20,
        border: '1px solid rgba(201,168,76,0.2)',
        boxShadow: '0 4px 20px rgba(44,24,16,0.08)',
        overflow: 'hidden'
      }}>
        {/* Messages */}
        <div style={{
          height: 450,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {m.role === 'ai' && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C9A84C, #8B6914)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  marginRight: 10,
                  flexShrink: 0
                }}>
                  🪔
                </div>
              )}
              <div style={{
                background: m.role === 'user'
                  ? 'linear-gradient(135deg, #C9A84C, #8B6914)'
                  : '#FDF6EC',
                color: m.role === 'user' ? '#1a0a00' : '#4A2C1A',
                padding: '12px 16px',
                borderRadius: m.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                fontSize: 14,
                maxWidth: '80%',
                lineHeight: 1.6,
                border: m.role === 'ai' ? '1px solid rgba(201,168,76,0.2)' : 'none',
                whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9A84C, #8B6914)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}>
                🪔
              </div>
              <div style={{
                background: '#FDF6EC',
                padding: '12px 16px',
                borderRadius: '18px 18px 18px 4px',
                border: '1px solid rgba(201,168,76,0.2)'
              }}>
                <span>Consulting Vastu wisdom</span>
                <span style={{ animation: 'pulse 1s infinite' }}>...</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div style={{
          borderTop: '1px solid rgba(201,168,76,0.2)',
          padding: '1rem',
          display: 'flex',
          gap: 10
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your home's Vastu..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid rgba(201,168,76,0.3)',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #8B6914)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || !input.trim() ? 0.6 : 1
            }}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Message count indicator */}
      {msgs.length > 5 && (
        <p style={{
          textAlign: 'center',
          marginTop: 12,
          fontSize: 12,
          color: '#8b5e3c'
        }}>
          💬 {msgs.length} messages in this conversation
          {msgs.length > 12 && ' • AI is summarizing earlier context'}
        </p>
      )}

      {/* Login prompt */}
      {!userId && (
        <p style={{
          textAlign: 'center',
          marginTop: 16,
          fontSize: 13,
          color: '#8b5e3c'
        }}>
          <a href="/auth/login" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>
            Login
          </a> to track your daily queries and unlock Pro features.
        </p>
      )}
    </main>
  );
}
