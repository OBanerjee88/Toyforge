'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vastuforge.onrender.com';

export default function DesignDetail(){
  const {id} = useParams();
  const [design,setDesign]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    fetch(`${API}/vastu-library/${id}`).then(r=>r.json()).then(d=>{setDesign(d);setLoading(false);}).catch(()=>setLoading(false));
  },[id]);

  if(loading) return <div style={{textAlign:'center',padding:'6rem',color:'#C9A84C',fontSize:20}}>🪔 Loading design...</div>;
  if(!design) return <div style={{textAlign:'center',padding:'6rem',color:'#8B0000'}}>Design not found.</div>;

  const scoreColor = design.vastu_score>=95?'#228B22':design.vastu_score>=90?'#2E7D32':'#C9A84C';

  return(
    <main style={{maxWidth:900,margin:'0 auto',padding:'3rem 2rem'}}>
      <Link href="/library" style={{color:'#C9A84C',textDecoration:'none',fontSize:14,display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to Library</Link>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#1a0a00,#3d1f00)',borderRadius:20,padding:'2.5rem',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,width:200,height:200,borderRadius:'50%',border:'1px solid rgba(201,168,76,0.15)',transform:'translate(60px,-60px)'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div>
            <span style={{background:'rgba(201,168,76,0.2)',color:'#D4AF6A',fontSize:11,fontWeight:600,padding:'4px 12px',borderRadius:8,textTransform:'uppercase',letterSpacing:2,display:'inline-block',marginBottom:12}}>{design.category}</span>
            <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(26px,4vw,42px)',fontWeight:700,color:'#F5D78E',margin:'0 0 8px'}}>{design.name}</h1>
            <p style={{color:'#D4AF6A',fontSize:15,margin:'0 0 16px',lineHeight:1.6,maxWidth:500}}>{design.description}</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <span style={{background:'rgba(201,168,76,0.15)',color:'#D4AF6A',padding:'5px 14px',borderRadius:20,fontSize:13}}>🧭 {design.direction}</span>
              <span style={{background:'rgba(201,168,76,0.15)',color:'#D4AF6A',padding:'5px 14px',borderRadius:20,fontSize:13}}>✨ {design.style}</span>
            </div>
          </div>
          <div style={{textAlign:'center',background:'rgba(201,168,76,0.1)',borderRadius:16,padding:'1.5rem 2rem',border:'1px solid rgba(201,168,76,0.3)'}}>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:52,fontWeight:700,color:scoreColor,lineHeight:1}}>{design.vastu_score}%</div>
            <div style={{color:'#D4AF6A',fontSize:13,marginTop:4}}>Vastu Compliant</div>
            <div style={{marginTop:8}}>{'⭐'.repeat(Math.round(design.vastu_score/20))}</div>
          </div>
        </div>
        {/* Colour palette */}
        <div style={{marginTop:20}}>
          <div style={{color:'#8B6914',fontSize:12,marginBottom:8,textTransform:'uppercase',letterSpacing:2}}>Colour Palette</div>
          <div style={{display:'flex',gap:6}}>
            {design.color_palette.map((c,i)=>(
              <div key={i} style={{width:40,height:40,borderRadius:8,background:c,border:'2px solid rgba(255,255,255,0.2)',title:c}}/>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* Vastu Rules */}
        <div style={{background:'white',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 2px 8px rgba(44,24,16,0.06)'}}>
          <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'#2C1810',margin:'0 0 16px',display:'flex',alignItems:'center',gap:8}}>📐 Vastu Rules Applied</h3>
          <ul style={{margin:0,padding:0,listStyle:'none'}}>
            {design.vastu_rules.map((r,i)=>(
              <li key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'8px 0',borderBottom:i<design.vastu_rules.length-1?'1px solid #FDF0D5':'none'}}>
                <span style={{color:'#228B22',fontWeight:700,marginTop:1}}>✓</span>
                <span style={{color:'#4A2C1A',fontSize:14,lineHeight:1.4}}>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decor Elements */}
        <div style={{background:'white',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.2)',boxShadow:'0 2px 8px rgba(44,24,16,0.06)'}}>
          <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:'#2C1810',margin:'0 0 16px',display:'flex',alignItems:'center',gap:8}}>🏡 Decor Elements</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {design.decor_elements.map((e,i)=>(
              <span key={i} style={{background:'#FDF0D5',color:'#8B6914',fontSize:13,padding:'5px 12px',borderRadius:20,border:'1px solid rgba(201,168,76,0.3)'}}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tags + Purchase */}
      <div style={{background:'linear-gradient(135deg,#FDF0D5,#FDE8C0)',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(201,168,76,0.3)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{color:'#8B6914',fontSize:12,textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Design Tags</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {design.tags.map((t,i)=>(
              <span key={i} style={{background:'white',color:'#6B4C3B',fontSize:12,padding:'3px 10px',borderRadius:10,border:'1px solid rgba(201,168,76,0.3)'}}>#{t}</span>
            ))}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'#8B6914',fontSize:13,marginBottom:4}}>Full Design Pack</div>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,fontWeight:700,color:'#C9A84C',marginBottom:12}}>₹{design.price.toLocaleString()}</div>
          <button style={{background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#1a0a00',border:'none',borderRadius:25,padding:'10px 24px',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 16px rgba(201,168,76,0.3)'}}>Purchase Design Pack →</button>
        </div>
      </div>
    </main>
  );
}
