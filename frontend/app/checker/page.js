'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://toyforge.onrender.com';
const EXAMPLES = [
  "My 2BHK flat has a North-East entrance. Living room is in East, kitchen in South-East, master bedroom in South-West, second bedroom in West, bathroom in North-West.",
  "My house faces East. Kitchen is in North-West, bedroom in South-West, living room in North-East."
];
export default function Checker(){
  const [desc,setDesc]=useState('');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [userId,setUserId]=useState(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session) setUserId(session.user.id);
    });
  },[]);

  const check=async()=>{
    if(!desc.trim()) return;
    setLoading(true); setResult(null);
    try{
      const r=await fetch(`${API}/vastu-check`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:desc,user_id:userId})});
      if(r.status===429){
        setResult({_limit_reached:true});
        setLoading(false);
        return;
      }
      setResult(await r.json());
    }catch{setResult(null);}
    setLoading(false);
  };
  const scoreColor=(s)=>s>=90?'#228B22':s>=75?'#C9A84C':s>=60?'#FF8C00':'#8B0000';
  const scoreLabel=(s)=>s>=90?'Excellent':s>=75?'Good':s>=60?'Fair':'Needs Attention';
  return(
    <main style={{maxWidth:800,margin:'0 auto',padding:'2rem'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:48,marginBottom:8}}>🧭</div>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,4vw,44px)',fontWeight:700,color:'#2C1810',margin:'0 0 8px'}}>Vastu Compliance Checker</h1>
        <p style={{color:'#6B4C3B',fontSize:15}}>Describe your home layout and get an instant Vastu score</p>
      </div>
      <div style={{background:'white',borderRadius:20,padding:'2rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 4px 20px rgba(44,24,16,0.08)',marginBottom:24}}>
        <div style={{marginBottom:12}}>
          <label style={{color:'#4A2C1A',fontWeight:600,fontSize:14}}>Describe your home layout:</label>
        </div>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={5} placeholder="e.g. My 3BHK house faces North. Master bedroom is in South-West, kitchen in South-East, living room in North-East, pooja room in North-East corner..." style={{width:'100%',padding:'12px',borderRadius:12,border:'1px solid rgba(201,168,76,0.3)',background:'#FDF6EC',fontSize:14,resize:'vertical',outline:'none',color:'#4A2C1A',boxSizing:'border-box',lineHeight:1.6}}/>
        <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>setDesc(ex)} style={{background:'#FDF0D5',color:'#8B6914',border:'1px solid rgba(201,168,76,0.3)',borderRadius:20,padding:'6px 14px',fontSize:12,cursor:'pointer'}}>
              Example {i+1}
            </button>
          ))}
        </div>
        <button onClick={check} disabled={loading||!desc.trim()} style={{marginTop:16,width:'100%',background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'white',border:'none',borderRadius:12,padding:'14px',fontSize:15,fontWeight:600,cursor:loading?'not-allowed':'pointer',opacity:loading||!desc.trim()?0.6:1}}>
          {loading?'Analyzing...':'Check Vastu Compliance 🧭'}
        </button>
      </div>

      {result?._limit_reached&&(
        <div style={{background:'#fff8f0',border:'1px solid #e8d5b0',borderRadius:16,padding:24,textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:8}}>✨</div>
          <h3 style={{color:'#2c1810',marginBottom:8}}>Daily Limit Reached</h3>
          <p style={{color:'#8b5e3c',marginBottom:16}}>You've used all 10 free AI queries for today.</p>
          <a href="/pricing" style={{background:'#d4a96a',color:'white',padding:'10px 24px',borderRadius:20,textDecoration:'none',fontWeight:'bold'}}>Upgrade to Pro ✨</a>
        </div>
      )}

      {result&&!result._limit_reached&&(
        <div style={{background:'white',borderRadius:20,padding:'2rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 4px 20px rgba(44,24,16,0.08)'}}>
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{fontSize:64,fontWeight:700,color:scoreColor(result.overall_score)}}>{result.overall_score}</div>
            <div style={{fontSize:20,fontWeight:600,color:scoreColor(result.overall_score)}}>{scoreLabel(result.overall_score)}</div>
            <p style={{color:'#6B4C3B',marginTop:8}}>{result.summary}</p>
          </div>
          {result.rooms?.length>0&&(
            <div style={{marginBottom:20}}>
              <h3 style={{color:'#2C1810',marginBottom:12}}>Room Analysis</h3>
              {result.rooms.map((room,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'#FDF6EC',borderRadius:10,marginBottom:8,border:'1px solid rgba(201,168,76,0.2)'}}>
                  <div>
                    <span style={{fontWeight:600,color:'#2C1810'}}>{room.room}</span>
                    <span style={{color:'#8B6914',fontSize:13,marginLeft:8}}>{room.direction}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span style={{fontWeight:700,color:scoreColor(room.score)}}>{room.score}</span>
                    <span style={{fontSize:12,color:'#8B6914',marginLeft:6}}>{room.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {result.remedies?.length>0&&(
            <div>
              <h3 style={{color:'#2C1810',marginBottom:12}}>Remedies</h3>
              {result.remedies.map((r,i)=>(
                <div key={i} style={{padding:'8px 14px',background:'#f0faf0',borderRadius:10,marginBottom:6,fontSize:14,color:'#2C1810',border:'1px solid #c3e6c3'}}>🌿 {r}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
