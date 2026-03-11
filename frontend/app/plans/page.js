'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://toyforge.onrender.com';
const DIRS = ['All','North','East','South','West','North-East','North-West','South-East','South-West'];
const SCORE_COLOR = s => s>=95?'#228B22':s>=90?'#2E7D32':s>=80?'#C9A84C':'#8B6914';
const SCORE_BG = s => s>=95?'#E8F5E9':s>=90?'#F1F8E9':s>=80?'#FFF8DC':'#FDF0D5';

function PlanCard({plan}){
  const [open,setOpen]=useState(false);
  const score=plan.vastu_score;
  return(
    <div style={{background:'white',borderRadius:16,border:'1px solid rgba(201,168,76,0.2)',overflow:'hidden',boxShadow:'0 2px 8px rgba(44,24,16,0.06)'}}>
      {/* Score bar */}
      <div style={{height:6,background:'#F0EDE8'}}><div style={{height:'100%',width:`${score}%`,background:`linear-gradient(90deg,${SCORE_COLOR(score)},${SCORE_COLOR(score)}88)`}}/></div>
      <div style={{padding:'1.2rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
          <div>
            <span style={{background:'#FDF0D5',color:'#8B6914',fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:8,textTransform:'uppercase',letterSpacing:1}}>{plan.home_type}</span>
          </div>
          <span style={{background:SCORE_BG(score),color:SCORE_COLOR(score),fontSize:13,fontWeight:700,padding:'3px 12px',borderRadius:12}}>{score}% Vastu</span>
        </div>
        <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'#2C1810',margin:'8px 0 4px'}}>
          {plan.entrance_direction}-Facing {plan.home_type}
        </h3>
        <p style={{color:'#6B4C3B',fontSize:13,margin:'0 0 12px',lineHeight:1.5}}>{plan.notes}</p>

        {/* Room grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
          {Object.entries(plan.rooms).slice(0,6).map(([room,dir])=>(
            <div key={room} style={{background:'#FDF6EC',borderRadius:8,padding:'5px 8px',display:'flex',justifyContent:'space-between',fontSize:12}}>
              <span style={{color:'#6B4C3B',textTransform:'capitalize'}}>{room.replace(/_/g,' ')}</span>
              <span style={{color:'#C9A84C',fontWeight:600}}>{dir}</span>
            </div>
          ))}
        </div>

        {plan.warnings.length>0&&(
          <div style={{background:'#FFF8DC',borderRadius:8,padding:'6px 10px',marginBottom:10}}>
            {plan.warnings.map((w,i)=><div key={i} style={{color:'#8B6914',fontSize:12}}>⚠️ {w}</div>)}
          </div>
        )}

        <button onClick={()=>setOpen(!open)} style={{width:'100%',background:open?'#FDF0D5':'linear-gradient(135deg,#C9A84C,#8B6914)',color:open?'#8B6914':'#1a0a00',border:open?'1px solid rgba(201,168,76,0.3)':'none',borderRadius:20,padding:'7px',fontSize:13,fontWeight:600,cursor:'pointer'}}>
          {open?'Hide Details':'View Full Plan'}
        </button>

        {open&&(
          <div style={{marginTop:12,borderTop:'1px solid #FDF0D5',paddingTop:12}}>
            <div style={{marginBottom:10}}>
              <div style={{color:'#8B6914',fontSize:11,textTransform:'uppercase',letterSpacing:2,marginBottom:6}}>All Rooms</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                {Object.entries(plan.rooms).map(([room,dir])=>(
                  <div key={room} style={{background:'#FDF6EC',borderRadius:8,padding:'5px 8px',display:'flex',justifyContent:'space-between',fontSize:12}}>
                    <span style={{color:'#6B4C3B',textTransform:'capitalize'}}>{room.replace(/_/g,' ')}</span>
                    <span style={{color:'#C9A84C',fontWeight:600}}>{dir}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{color:'#228B22',fontSize:11,textTransform:'uppercase',letterSpacing:2,marginBottom:6}}>✓ Vastu Highlights</div>
              {plan.highlights.map((h,i)=><div key={i} style={{color:'#4A2C1A',fontSize:13,padding:'3px 0',display:'flex',gap:6}}><span style={{color:'#228B22'}}>✓</span>{h}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Plans(){
  const [plans,setPlans]=useState([]);
  const [loading,setLoading]=useState(true);
  const [dir,setDir]=useState('All');
  const [sort,setSort]=useState('score');

  useEffect(()=>{
    fetch(`${API}/floor-plans`).then(r=>r.json()).then(d=>{setPlans(d);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  const filtered=plans.filter(p=>dir==='All'||p.entrance_direction===dir)
    .sort((a,b)=>sort==='score'?b.vastu_score-a.vastu_score:a.home_type.localeCompare(b.home_type));

  return(
    <main style={{maxWidth:1200,margin:'0 auto',padding:'3rem 2rem'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{color:'#C9A84C',fontSize:12,letterSpacing:4,textTransform:'uppercase',marginBottom:8}}>Vastu-Compliant Layouts</div>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(32px,5vw,52px)',fontWeight:700,color:'#2C1810',margin:'0 0 12px'}}>Floor Plan Library</h1>
        <p style={{color:'#6B4C3B',fontSize:16,maxWidth:540,margin:'0 auto 24px'}}>Vastu-scored floor plans for every home type. Find layouts matching your entrance direction.</p>
        <Link href="/planner" style={{textDecoration:'none',display:'inline-block',background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#1a0a00',padding:'12px 28px',borderRadius:25,fontWeight:700,fontSize:15}}>🏠 Generate Custom Plan →</Link>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:16}}>
        {DIRS.map(d=>(
          <button key={d} onClick={()=>setDir(d)} style={{padding:'6px 14px',borderRadius:20,border:'1px solid rgba(201,168,76,0.3)',background:dir===d?'linear-gradient(135deg,#C9A84C,#8B6914)':'white',color:dir===d?'#1a0a00':'#6B4C3B',fontWeight:dir===d?700:400,fontSize:13,cursor:'pointer'}}>{d}</button>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:20}}>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:'6px 12px',borderRadius:8,border:'1px solid rgba(201,168,76,0.3)',background:'white',color:'#6B4C3B',fontSize:13}}>
          <option value="score">Highest Score</option>
          <option value="name">Home Type A-Z</option>
        </select>
      </div>

      {loading?<div style={{textAlign:'center',padding:'4rem',color:'#C9A84C'}}>🪔 Loading floor plans...</div>:(
        <>
          <div style={{color:'#8B6914',fontSize:14,marginBottom:16}}>{filtered.length} plans{dir!=='All'?` with ${dir} entrance`:''}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:20}}>{filtered.map((p,i)=><PlanCard key={i} plan={p}/>)}</div>
        </>
      )}
    </main>
  );
}
