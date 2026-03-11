'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://toyforge.onrender.com';
const DIRECTIONS = ['North','East','South','West','North-East','North-West','South-East','South-West'];
const HOME_TYPES = ['1BHK Apartment','2BHK Apartment','3BHK Apartment','3BHK Villa','4BHK Villa','Studio Apartment','2BHK Row House','3BHK Bungalow','Duplex','Penthouse'];
const SCORE_COLOR = s => s>=95?'#228B22':s>=90?'#2E7D32':s>=80?'#C9A84C':'#8B6914';

export default function Planner(){
  const [form,setForm]=useState({entrance_direction:'North',home_type:'2BHK Apartment',num_rooms:3,special_requirements:''});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  const generate=async()=>{
    setLoading(true); setResult(null); setError(null);
    try{
      const r=await fetch(`${API}/generate-plan`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
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
            <label style={{color:'#4A2C1A',fontWeight:600,fontSize:14,display:'block',marginBottom:8}}>🏡 Home Type</label>
            <select value={form.home_type} onChange={e=>setForm({...form,home_type:e.target.value})} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid rgba(201,168,76,0.3)',background:'#FDF6EC',color:'#4A2C1A',fontSize:14}}>
              {HOME_TYPES.map(h=><option key={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{color:'#4A2C1A',fontWeight:600,fontSize:14,display:'block',marginBottom:8}}>🛏️ Number of Rooms: {form.num_rooms}</label>
          <input type="range" min={1} max={8} value={form.num_rooms} onChange={e=>setForm({...form,num_rooms:parseInt(e.target.value)})} style={{width:'100%',accentColor:'#C9A84C'}}/>
          <div style={{display:'flex',justifyContent:'space-between',color:'#8B6914',fontSize:12}}><span>1</span><span>8</span></div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{color:'#4A2C1A',fontWeight:600,fontSize:14,display:'block',marginBottom:8}}>📝 Special Requirements (optional)</label>
          <textarea value={form.special_requirements} onChange={e=>setForm({...form,special_requirements:e.target.value})} placeholder="e.g. Need a Pooja room, home office, gym, ground floor bedroom for elderly..." rows={3} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid rgba(201,168,76,0.3)',background:'#FDF6EC',color:'#4A2C1A',fontSize:14,resize:'vertical',outline:'none',boxSizing:'border-box'}}/>
        </div>
        <button onClick={generate} disabled={loading} style={{width:'100%',background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#1a0a00',border:'none',borderRadius:25,padding:'14px',fontWeight:700,fontSize:16,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}>
          {loading?'🔍 Generating... (up to 30 sec)':'Generate My Vastu Plan 🏠'}
        </button>
        {error&&<div style={{marginTop:12,background:'#FFF0F0',border:'1px solid #ffcccc',borderRadius:10,padding:'12px',color:'#cc0000',fontSize:13}}>❌ {error}</div>}
      </div>

      {result&&!result.error&&(
        <div>
          {/* Score */}
          <div style={{background:'linear-gradient(135deg,#1a0a00,#3d1f00)',borderRadius:20,padding:'2rem',marginBottom:20,textAlign:'center'}}>
            <div style={{color:'#D4AF6A',fontSize:13,textTransform:'uppercase',letterSpacing:3,marginBottom:8}}>Your Vastu Score</div>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:72,fontWeight:700,color:SCORE_COLOR(result.vastu_score),lineHeight:1}}>{result.vastu_score}%</div>
            <p style={{color:'#D4AF6A',fontSize:14,maxWidth:500,margin:'12px auto 0',lineHeight:1.6}}>{result.summary}</p>
          </div>

          {/* Room placement */}
          <div style={{background:'white',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.2)',marginBottom:16,boxShadow:'0 2px 8px rgba(44,24,16,0.06)'}}>
            <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'#2C1810',margin:'0 0 14px'}}>📐 Recommended Room Placement</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
              {Object.entries(result.rooms||{}).map(([room,dir])=>(
                <div key={room} style={{background:'linear-gradient(135deg,#FDF0D5,#FDE8C0)',borderRadius:10,padding:'10px 14px',border:'1px solid rgba(201,168,76,0.3)'}}>
                  <div style={{color:'#8B6914',fontSize:11,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{room.replace(/_/g,' ')}</div>
                  <div style={{color:'#2C1810',fontWeight:700,fontSize:15}}>🧭 {dir}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            {/* Key Principles */}
            <div style={{background:'white',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 2px 8px rgba(44,24,16,0.06)'}}>
              <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'#228B22',margin:'0 0 12px'}}>✅ Key Principles</h3>
              {(result.key_principles||[]).map((p,i)=><div key={i} style={{color:'#4A2C1A',fontSize:13,padding:'5px 0',borderBottom:i<result.key_principles.length-1?'1px solid #F1F8E9':'none',display:'flex',gap:8}}><span style={{color:'#228B22'}}>✓</span>{p}</div>)}
            </div>
            {/* Warnings + Remedies */}
            <div style={{background:'white',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 2px 8px rgba(44,24,16,0.06)'}}>
              <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'#C9A84C',margin:'0 0 12px'}}>🪔 Remedies & Notes</h3>
              {(result.warnings||[]).map((w,i)=><div key={i} style={{color:'#8B6914',fontSize:13,padding:'4px 0',display:'flex',gap:8}}><span>⚠️</span>{w}</div>)}
              {(result.remedies||[]).map((r,i)=><div key={i} style={{color:'#4A2C1A',fontSize:13,padding:'4px 0',display:'flex',gap:8}}><span style={{color:'#C9A84C'}}>💡</span>{r}</div>)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
