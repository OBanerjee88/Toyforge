'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vastuforge.onrender.com';
const CATS = ['All','Living Room','Bedroom','Kitchen','Pooja Room','Study Room','Dining Room','Balcony / Entrance'];

function ScoreBadge({score}){
  const color = score>=95?'#228B22':score>=90?'#2E7D32':'#C9A84C';
  const bg = score>=95?'#E8F5E9':score>=90?'#F1F8E9':'#FFF8DC';
  return <span style={{background:bg,color,fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:12}}>{score}% Vastu</span>;
}

function DesignCard({d}){
  const [hover,setHover]=useState(false);
  return(
    <Link href={`/design/${d.id}`} style={{textDecoration:'none'}}>
      <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
        style={{background:'white',borderRadius:16,overflow:'hidden',border:`1px solid ${hover?'rgba(201,168,76,0.5)':'rgba(201,168,76,0.15)'}`,transition:'all 0.3s',transform:hover?'translateY(-4px)':'none',boxShadow:hover?'0 12px 32px rgba(201,168,76,0.2)':'0 2px 8px rgba(44,24,16,0.06)',cursor:'pointer'}}>
        <div style={{height:8,display:'flex'}}>{d.color_palette.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}</div>
        <div style={{padding:'1.2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
            <span style={{background:'#FDF0D5',color:'#8B6914',fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:8,textTransform:'uppercase',letterSpacing:1}}>{d.style}</span>
            <ScoreBadge score={d.vastu_score}/>
          </div>
          <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,fontWeight:600,color:'#2C1810',margin:'0 0 6px',lineHeight:1.3}}>{d.name}</h3>
          <p style={{color:'#6B4C3B',fontSize:13,lineHeight:1.5,margin:'0 0 12px'}}>{d.description.slice(0,90)}...</p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:12,color:'#8B6914',background:'#FDF6EC',padding:'2px 8px',borderRadius:8}}>🧭 {d.direction}</span>
            <span style={{fontFamily:'Cormorant Garamond,serif',color:'#C9A84C',fontWeight:700,fontSize:16}}>₹{d.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LibraryContent(){
  const searchParams = useSearchParams();
  const [designs,setDesigns]=useState([]);
  const [loading,setLoading]=useState(true);
  const [cat,setCat]=useState('All');
  const [sort,setSort]=useState('score');

  useEffect(()=>{
    const c=searchParams.get('category');
    if(c) setCat(c);
    fetch(`${API}/vastu-library`).then(r=>r.json()).then(d=>{setDesigns(d);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  const filtered=designs.filter(d=>cat==='All'||d.category===cat)
    .sort((a,b)=>sort==='score'?b.vastu_score-a.vastu_score:sort==='price'?a.price-b.price:a.name.localeCompare(b.name));

  return(
    <main style={{maxWidth:1200,margin:'0 auto',padding:'3rem 2rem'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{color:'#C9A84C',fontSize:12,letterSpacing:4,textTransform:'uppercase',marginBottom:8}}>70 Designs · 7 Categories</div>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(32px,5vw,52px)',fontWeight:700,color:'#2C1810',margin:'0 0 12px'}}>Vastu Design Library</h1>
        <p style={{color:'#6B4C3B',fontSize:16,maxWidth:540,margin:'0 auto'}}>Each design is scored for Vastu compliance and follows classical Shastra principles.</p>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:20}}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{padding:'7px 16px',borderRadius:20,border:'1px solid rgba(201,168,76,0.3)',background:cat===c?'linear-gradient(135deg,#C9A84C,#8B6914)':'white',color:cat===c?'#1a0a00':'#6B4C3B',fontWeight:cat===c?700:400,fontSize:13,cursor:'pointer',transition:'all 0.2s'}}>{c}{c!=='All'?` (${designs.filter(d=>d.category===c).length})`:''}</button>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:24}}>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:'6px 12px',borderRadius:8,border:'1px solid rgba(201,168,76,0.3)',background:'white',color:'#6B4C3B',fontSize:13,cursor:'pointer'}}>
          <option value="score">Highest Vastu Score</option>
          <option value="price">Price Low-High</option>
          <option value="name">A-Z</option>
        </select>
      </div>
      {loading?<div style={{textAlign:'center',padding:'4rem',color:'#C9A84C',fontSize:18}}>🪔 Loading sacred designs...</div>:(
        <>
          <div style={{color:'#8B6914',fontSize:14,marginBottom:16}}>{filtered.length} designs{cat!=='All'?` in ${cat}`:''}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>{filtered.map(d=><DesignCard key={d.id} d={d}/>)}</div>
        </>
      )}
    </main>
  );
}

export default function Library(){
  return <Suspense fallback={<div style={{textAlign:'center',padding:'4rem',color:'#C9A84C'}}>Loading...</div>}><LibraryContent/></Suspense>;
}
