'use client';
import { useState, useRef, useEffect } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://toyforge.onrender.com';
const SUGGESTIONS = ["Is my North-West kitchen okay?","Best colour for my bedroom?","My toilet is in North-East, any remedy?","Which direction should I sleep?","How to improve Vastu for study room?","Good plants for my living room?"];

export default function Advisor(){
  const [msgs,setMsgs]=useState([{role:'ai',content:'Namaste! 🙏 I am VastuAI, your personal Vastu Shastra expert. Tell me about your home — its facing direction, room positions, or any Vastu concerns you have. I\'m here to guide you towards harmony and prosperity. 🪔'}]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),[msgs]);

  const send=async(msg)=>{
    const text=msg||input.trim();
    if(!text||loading) return;
    setInput('');
    const newMsgs=[...msgs,{role:'user',content:text}];
    setMsgs(newMsgs);
    setLoading(true);
    try{
      const history=newMsgs.slice(-8).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.content}));
      const r=await fetch(`${API}/vastu-chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:history.slice(0,-1)})});
      const d=await r.json();
      setMsgs(m=>[...m,{role:'ai',content:d.reply}]);
    }catch{
      setMsgs(m=>[...m,{role:'ai',content:'I apologise, I could not connect to the Vastu server. Please try again. 🙏'}]);
    }
    setLoading(false);
  };

  return(
    <main style={{maxWidth:800,margin:'0 auto',padding:'2rem'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:48,marginBottom:8}}>🤖</div>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,4vw,44px)',fontWeight:700,color:'#2C1810',margin:'0 0 8px'}}>AI Vastu Advisor</h1>
        <p style={{color:'#6B4C3B',fontSize:15}}>Ask anything about Vastu Shastra for your home</p>
      </div>

      {/* Suggestions */}
      {msgs.length<=1&&(
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20,justifyContent:'center'}}>
          {SUGGESTIONS.map(s=>(
            <button key={s} onClick={()=>send(s)} style={{background:'#FDF0D5',color:'#8B6914',border:'1px solid rgba(201,168,76,0.3)',borderRadius:20,padding:'6px 14px',fontSize:13,cursor:'pointer'}}>{s}</button>
          ))}
        </div>
      )}

      {/* Chat */}
      <div style={{background:'white',borderRadius:20,border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 4px 20px rgba(44,24,16,0.08)',overflow:'hidden'}}>
        <div style={{height:450,overflowY:'auto',padding:'1.5rem',display:'flex',flexDirection:'column',gap:12}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
              {m.role==='ai'&&<div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#C9A84C,#8B6914)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,marginRight:10,flexShrink:0}}>🪔</div>}
              <div style={{background:m.role==='user'?'linear-gradient(135deg,#C9A84C,#8B6914)':'#FDF6EC',color:m.role==='user'?'#1a0a00':'#4A2C1A',padding:'12px 16px',borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',fontSize:14,maxWidth:'80%',lineHeight:1.6,border:m.role==='ai'?'1px solid rgba(201,168,76,0.2)':'none',whiteSpace:'pre-wrap'}}>{m.content}</div>
            </div>
          ))}
          {loading&&(
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#C9A84C,#8B6914)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🪔</div>
              <div style={{background:'#FDF6EC',padding:'12px 16px',borderRadius:'18px 18px 18px 4px',border:'1px solid rgba(201,168,76,0.2)'}}>
                <div style={{display:'flex',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:'#C9A84C',animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>
        <div style={{padding:'1rem',borderTop:'1px solid rgba(201,168,76,0.2)',display:'flex',gap:10}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about your home's Vastu..." style={{flex:1,padding:'10px 16px',borderRadius:25,border:'1px solid rgba(201,168,76,0.3)',background:'#FDF6EC',fontSize:14,outline:'none',color:'#4A2C1A'}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading} style={{background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#1a0a00',border:'none',borderRadius:25,padding:'10px 20px',fontWeight:700,fontSize:14,cursor:'pointer',opacity:!input.trim()||loading?0.5:1}}>Send 🙏</button>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </main>
  );
}
