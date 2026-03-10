'use client';
import { useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vastuforge.onrender.com';
const EXAMPLES = [
  "My 2BHK flat has a North-East entrance. Living room is in East, kitchen in South-East, master bedroom in South-West, second bedroom in West, bathroom in North-West.",
  "My house faces East. Kitchen is in North-West, bedroom in South-West, living room in North-East."
];

export default function Checker(){
  const [desc,setDesc]=useState('');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  const check=async()=>{
    if(!desc.trim()) return;
    setLoading(true); setResult(null);
    try{
      const r=await fetch(`${API}/vastu-check`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:desc})});
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
          <span style={{color:'#8B6914',fontSize:13,alignSelf:'center'}}>Try example:</span>
          {EXAMPLES.map((e,i)=><button key={i} onClick={()=>setDesc(e)} style={{background:'#FDF0D5',color:'#8B6914',border:'1px solid rgba(201,168,76,0.3)',borderRadius:12,padding:'5px 12px',fontSize:12,cursor:'pointer'}}>Example {i+1}</button>)}
        </div>
        <button onClick={check} disabled={!desc.trim()||loading} style={{marginTop:16,background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#1a0a00',border:'none',borderRadius:25,padding:'12px 28px',fontWeight:700,fontSize:15,cursor:'pointer',width:'100%',opacity:!desc.trim()||loading?0.6:1}}>
          {loading?'🔍 Analysing your home...':'Check Vastu Compliance →'}
        </button>
      </div>

      {result&&(
        <div>
          {/* Overall Score */}
          <div style={{background:'linear-gradient(135deg,#1a0a00,#3d1f00)',borderRadius:20,padding:'2rem',marginBottom:20,textAlign:'center'}}>
            <div style={{color:'#D4AF6A',fontSize:13,textTransform:'uppercase',letterSpacing:3,marginBottom:8}}>Overall Vastu Score</div>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:72,fontWeight:700,color:scoreColor(result.overall_score),lineHeight:1}}>{result.overall_score}%</div>
            <div style={{color:'#F5D78E',fontSize:20,fontFamily:'Cormorant Garamond,serif',margin:'8px 0'}}>{scoreLabel(result.overall_score)}</div>
            <p style={{color:'#D4AF6A',fontSize:14,maxWidth:500,margin:'0 auto',lineHeight:1.6}}>{result.summary}</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            {/* Issues */}
            <div style={{background:'white',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 2px 8px rgba(44,24,16,0.06)'}}>
              <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'#8B0000',margin:'0 0 14px'}}>⚠️ Areas to Improve</h3>
              <ul style={{margin:0,padding:0,listStyle:'none'}}>
                {(result.top_issues||[]).map((issue,i)=>(
                  <li key={i} style={{padding:'6px 0',borderBottom:i<result.top_issues.length-1?'1px solid #FDF0D5':'none',color:'#4A2C1A',fontSize:14,display:'flex',gap:8}}>
                    <span style={{color:'#8B0000'}}>•</span>{issue}
                  </li>
                ))}
              </ul>
            </div>
            {/* Positives */}
            <div style={{background:'white',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 2px 8px rgba(44,24,16,0.06)'}}>
              <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'#228B22',margin:'0 0 14px'}}>✨ Positive Aspects</h3>
              <ul style={{margin:0,padding:0,listStyle:'none'}}>
                {(result.positive_aspects||[]).map((p,i)=>(
                  <li key={i} style={{padding:'6px 0',borderBottom:i<result.positive_aspects.length-1?'1px solid #F1F8E9':'none',color:'#4A2C1A',fontSize:14,display:'flex',gap:8}}>
                    <span style={{color:'#228B22'}}>✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Remedies */}
          <div style={{background:'linear-gradient(135deg,#FDF0D5,#FDE8C0)',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.3)'}}>
            <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'#2C1810',margin:'0 0 14px'}}>🪔 Vastu Remedies</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
              {(result.remedies||[]).map((r,i)=>(
                <div key={i} style={{background:'white',padding:'10px 14px',borderRadius:12,border:'1px solid rgba(201,168,76,0.2)',color:'#4A2C1A',fontSize:13,lineHeight:1.4}}>
                  <span style={{color:'#C9A84C',fontWeight:700,marginRight:6}}>{i+1}.</span>{r}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
