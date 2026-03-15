'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://toyforge.onrender.com';
const DIRECTIONS = ['North','East','South','West','North-East','North-West','South-East','South-West'];
const HOME_TYPES = ['1BHK Apartment','2BHK Apartment','3BHK Apartment','3BHK Villa','4BHK Villa','Studio Apartment','2BHK Row House','3BHK Bungalow','Duplex','Penthouse'];
const SCORE_COLOR = s => s>=95?'#228B22':s>=90?'#2E7D32':s>=80?'#C9A84C':'#8B6914';

export default function Planner(){
  const [form,setForm]=useState({entrance_direction:'North',home_type:'2BHK Apartment',num_rooms:3,special_requirements:''});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [userId,setUserId]=useState(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session) setUserId(session.user.id);
    });
  },[]);

  const generate=async()=>{
    setLoading(true); setResult(null); setError(null);
    try{
      const r=await fetch(`${API}/generate-plan`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,user_id:userId})});
      if(r.status===429){
        setError('daily_limit_reached');
        setLoading(false);
        return;
      }
      if(!r.ok){setError(`Server error: ${r.status}`);setLoading(false);return;}
      const data=await r.json();
      if(data.error){setError(data.error);}else{setResult(data);}
    }catch(e){setError('Could not connect to server. Please wake up the backend at toyforge.onrender.com/health first.');}
    setLoading(false);
  };

  return(
    <main style={{maxWidth:800,margin:'0 auto',padding:'2rem'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:48,marginBottom:8}}>🏠</div>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,4vw,44px)',fontWeight:700,color:'#2C1810',margin:'0 0 8px'}}>Home Planning Assistant</h1>
        <p style={{color:'#6B4C3B',fontSize:15}}>Enter your home details — AI generates a complete Vastu-compliant room placement plan</p>
      </div>
      <div style={{background:'white',borderRadius:20,padding:'2rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 4px 20px rgba(44,24,16,0.08)',marginBottom:24}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          <div>
            <label style={{color:'#4A2C1A',fontWeight:600,fontSize:14,display:'block',marginBottom:8}}>🧭 Entrance Direction</label>
            <select value={form.entrance_direction} onChange={e=>setForm({...form,entrance_direction:e.target.value})} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid rgba(201,168,76,0.3)',background:'#FDF6EC',color:'#4A2C1A',fontSize:14}}>
              {DIRECTIONS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{color:'#4A2C1A',fontWeight:600,fontSize:14,display:'block',marginBottom:8}}>🏠 Home Type</label>
            <select value={form.home_type} onChange={e=>setForm({...form,home_type:e.target.value})} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid rgba(201,168,76,0.3)',background:'#FDF6EC',color:'#4A2C1A',fontSize:14}}>
              {HOME_TYPES.map(h=><option key={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{color:'#4A2C1A',fontWeight:600,fontSize:14,display:'block',marginBottom:8}}>🛏️ Number of Rooms: {form.num_rooms}</label>
          <input type="range" min={1} max={8} value={form.num_rooms} onChange={e=>setForm({...form,num_rooms:parseInt(e.target.value)})} style={{width:'100%',accentColor:'#C9A84C'}}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{color:'#4A2C1A',fontWeight:600,fontSize:14,display:'block',marginBottom:8}}>📝 Special Requirements (optional)</label>
          <input value={form.special_requirements} onChange={e=>setForm({...form,special_requirements:e.target.value})} placeholder="e.g. Need a pooja room, home office, elderly parent's room..." style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid rgba(201,168,76,0.3)',background:'#FDF6EC',color:'#4A2C1A',fontSize:14,boxSizing:'border-box'}}/>
        </div>
        <button onClick={generate} disabled={loading} style={{width:'100%',background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'white',border:'none',borderRadius:12,padding:'14px',fontSize:15,fontWeight:600,cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1}}>
          {loading?'Generating your Vastu plan...':'Generate Vastu Plan 🏠'}
        </button>
      </div>

      {error==='daily_limit_reached'&&(
        <div style={{background:'#fff8f0',border:'1px solid #e8d5b0',borderRadius:16,padding:24,textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:8}}>✨</div>
          <h3 style={{color:'#2c1810',marginBottom:8}}>Daily Limit Reached</h3>
          <p style={{color:'#8b5e3c',marginBottom:16}}>You've used all 10 free AI queries for today.</p>
          <a href="/pricing" style={{background:'#d4a96a',color:'white',padding:'10px 24px',borderRadius:20,textDecoration:'none',fontWeight:'bold'}}>Upgrade to Pro ✨</a>
        </div>
      )}

      {error&&error!=='daily_limit_reached'&&(
        <div style={{background:'#fff0f0',border:'1px solid #ffcccc',borderRadius:12,padding:16,color:'#8B0000',fontSize:14}}>⚠️ {error}</div>
      )}

      {result&&(
        <div style={{background:'white',borderRadius:20,padding:'2rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 4px 20px rgba(44,24,16,0.08)'}}>
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{fontSize:64,fontWeight:700,color:SCORE_COLOR(result.vastu_score)}}>{result.vastu_score}</div>
            <div style={{fontSize:16,color:'#6B4C3B'}}>Vastu Score</div>
            <p style={{color:'#6B4C3B',marginTop:8}}>{result.summary}</p>
          </div>
          {result.rooms&&(
            <div style={{marginBottom:20}}>
              <h3 style={{color:'#2C1810',marginBottom:12}}>Room Placement</h3>
              {Object.entries(result.rooms).map(([room,direction])=>(
                <div key={room} style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',background:'#FDF6EC',borderRadius:10,marginBottom:8,border:'1px solid rgba(201,168,76,0.2)'}}>
                  <span style={{fontWeight:600,color:'#2C1810',textTransform:'capitalize'}}>{room.replace(/_/g,' ')}</span>
                  <span style={{color:'#8B6914',fontWeight:500}}>{direction}</span>
                </div>
              ))}
            </div>
          )}
          {result.key_principles?.length>0&&(
            <div style={{marginBottom:20}}>
              <h3 style={{color:'#2C1810',marginBottom:12}}>Key Principles</h3>
              {result.key_principles.map((p,i)=>(
                <div key={i} style={{padding:'8px 14px',background:'#f0faf0',borderRadius:10,marginBottom:6,fontSize:14,color:'#2C1810',border:'1px solid #c3e6c3'}}>✅ {p}</div>
              ))}
            </div>
          )}
          {result.warnings?.length>0&&(
            <div style={{marginBottom:20}}>
              <h3 style={{color:'#8B0000',marginBottom:12}}>Warnings</h3>
              {result.warnings.map((w,i)=>(
                <div key={i} style={{padding:'8px 14px',background:'#fff0f0',borderRadius:10,marginBottom:6,fontSize:14,color:'#8B0000',border:'1px solid #ffcccc'}}>⚠️ {w}</div>
              ))}
            </div>
          )}
          {result.remedies?.length>0&&(
            <div>
              <h3 style={{color:'#2C1810',marginBottom:12}}>Remedies</h3>
              {result.remedies.map((r,i)=>(
                <div key={i} style={{padding:'8px 14px',background:'#FDF6EC',borderRadius:10,marginBottom:6,fontSize:14,color:'#2C1810',border:'1px solid rgba(201,168,76,0.2)'}}>🌿 {r}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
