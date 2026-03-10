'use client';
import Link from 'next/link';

const categories=[
  {name:'Living Room',icon:'🛋️',count:10,desc:'North-East facing lounges & drawing rooms'},
  {name:'Bedroom',icon:'🛏️',count:10,desc:'South-West sanctuaries for restful sleep'},
  {name:'Kitchen',icon:'🍳',count:10,desc:'South-East Agni kitchens for nourishment'},
  {name:'Pooja Room',icon:'🪔',count:10,desc:'North-East sacred spaces for divine energy'},
  {name:'Study Room',icon:'📚',count:10,desc:'North zone wisdom spaces for learning'},
  {name:'Dining Room',icon:'🍽️',count:10,desc:'East & West dining for family harmony'},
  {name:'Balcony / Entrance',icon:'🌿',count:10,desc:'Welcoming thresholds for abundant Prana'},
];

const stats=[
  {n:'70',label:'Vastu Designs'},
  {n:'7',label:'Room Categories'},
  {n:'100%',label:'Vastu Compliant'},
  {n:'AI',label:'Vastu Advisor'},
];

export default function Home(){
  return(
    <main style={{minHeight:'100vh'}}>
      {/* Hero */}
      <section style={{background:'linear-gradient(160deg,#1a0a00 0%,#3d1f00 40%,#5c3010 70%,#3d1f00 100%)',minHeight:'88vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',position:'relative',overflow:'hidden'}}>
        {/* Decorative circles */}
        <div style={{position:'absolute',top:-100,right:-100,width:400,height:400,borderRadius:'50%',border:'1px solid rgba(201,168,76,0.15)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:-50,right:-50,width:250,height:250,borderRadius:'50%',border:'1px solid rgba(201,168,76,0.1)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-150,left:-150,width:500,height:500,borderRadius:'50%',border:'1px solid rgba(201,168,76,0.08)',pointerEvents:'none'}}/>

        <div style={{fontSize:48,marginBottom:16}}>🪔</div>
        <div style={{color:'#C9A84C',fontSize:13,letterSpacing:4,textTransform:'uppercase',marginBottom:16,fontWeight:500}}>Vastu Shastra · Interior Design · AI Advisory</div>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(42px,7vw,80px)',fontWeight:700,color:'#F5D78E',margin:'0 0 8px',lineHeight:1.1}}>Design Your Home</h1>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(42px,7vw,80px)',fontWeight:400,fontStyle:'italic',color:'#C9A84C',margin:'0 0 24px',lineHeight:1.1}}>In Perfect Harmony</h1>
        <p style={{color:'#D4AF6A',fontSize:18,maxWidth:560,lineHeight:1.7,marginBottom:40,opacity:0.9}}>Explore 70 Vastu-compliant interior designs for every room in your home. Each design carries a Vastu compliance score and detailed principles.</p>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
          <Link href="/library" style={{textDecoration:'none',background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#1a0a00',padding:'14px 32px',borderRadius:30,fontWeight:700,fontSize:16,boxShadow:'0 4px 20px rgba(201,168,76,0.4)'}}>Browse 70 Designs</Link>
          <Link href="/advisor" style={{textDecoration:'none',border:'1px solid rgba(201,168,76,0.5)',color:'#D4AF6A',padding:'14px 32px',borderRadius:30,fontWeight:500,fontSize:16}}>Ask AI Advisor 🤖</Link>
        </div>

        {/* Stats */}
        <div style={{display:'flex',gap:40,marginTop:60,flexWrap:'wrap',justifyContent:'center'}}>
          {stats.map(s=>(
            <div key={s.n} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:42,fontWeight:700,color:'#F5D78E',lineHeight:1}}>{s.n}</div>
              <div style={{color:'#8B6914',fontSize:13,marginTop:4,letterSpacing:1,textTransform:'uppercase'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vastu Score Bar */}
      <section style={{background:'linear-gradient(90deg,#8B0000,#C9A84C,#228B22,#C9A84C,#8B0000)',padding:'12px 2rem',textAlign:'center'}}>
        <span style={{color:'white',fontFamily:'Georgia,serif',fontSize:14,letterSpacing:3,textTransform:'uppercase',fontWeight:600,textShadow:'0 1px 3px rgba(0,0,0,0.5)'}}>✦ Designs range from 86% to 100% Vastu Compliant ✦ Classical Shastra Principles ✦ Room-by-Room Guidance ✦</span>
      </section>

      {/* Categories */}
      <section style={{maxWidth:1200,margin:'0 auto',padding:'5rem 2rem'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{color:'#C9A84C',fontSize:12,letterSpacing:4,textTransform:'uppercase',marginBottom:12}}>Explore by Room</div>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(32px,5vw,52px)',fontWeight:700,color:'#2C1810',margin:0}}>7 Sacred Spaces of Your Home</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24}}>
          {categories.map(cat=>(
            <Link key={cat.name} href={`/library?category=${encodeURIComponent(cat.name)}`} style={{textDecoration:'none'}}>
              <div style={{background:'white',borderRadius:16,padding:'2rem',border:'1px solid rgba(201,168,76,0.2)',transition:'all 0.3s',cursor:'pointer',boxShadow:'0 2px 12px rgba(44,24,16,0.06)'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(201,168,76,0.2)';e.currentTarget.style.borderColor='rgba(201,168,76,0.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 12px rgba(44,24,16,0.06)';e.currentTarget.style.borderColor='rgba(201,168,76,0.2)'}}>
                <div style={{fontSize:40,marginBottom:12}}>{cat.icon}</div>
                <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,fontWeight:600,color:'#2C1810',margin:'0 0 8px'}}>{cat.name}</h3>
                <p style={{color:'#6B4C3B',fontSize:14,margin:'0 0 16px',lineHeight:1.5}}>{cat.desc}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{background:'linear-gradient(135deg,#FDF0D5,#F5E4B0)',color:'#8B6914',fontSize:12,fontWeight:600,padding:'4px 12px',borderRadius:12,border:'1px solid rgba(201,168,76,0.3)'}}>{cat.count} designs</span>
                  <span style={{color:'#C9A84C',fontSize:20}}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Features Strip */}
      <section style={{background:'linear-gradient(160deg,#FDF0D5,#FDE8C0)',padding:'5rem 2rem'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
          <div>
            <div style={{color:'#C9A84C',fontSize:12,letterSpacing:4,textTransform:'uppercase',marginBottom:16}}>Powered by AI</div>
            <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,4vw,44px)',fontWeight:700,color:'#2C1810',margin:'0 0 16px'}}>Your Personal Vastu Expert, Available 24/7</h2>
            <p style={{color:'#6B4C3B',lineHeight:1.7,marginBottom:24,fontSize:16}}>Describe your home's layout, directions, and rooms. Our AI Vastu Advisor will analyse your space against classical Vastu Shastra principles and provide personalised remedies.</p>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
              {['🧭 Room direction analysis','🎨 Colour & material recommendations','🌿 Vastu remedy suggestions','📐 Furniture placement guidance'].map(f=>(
                <div key={f} style={{display:'flex',alignItems:'center',gap:10,color:'#4A2C1A',fontSize:15}}><span>{f}</span></div>
              ))}
            </div>
            <Link href="/advisor" style={{textDecoration:'none',display:'inline-block',background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#1a0a00',padding:'12px 28px',borderRadius:25,fontWeight:700,fontSize:15}}>Start Vastu Chat →</Link>
          </div>
          <div style={{background:'white',borderRadius:20,padding:'2rem',boxShadow:'0 8px 40px rgba(44,24,16,0.12)',border:'1px solid rgba(201,168,76,0.3)'}}>
            <div style={{marginBottom:16,color:'#8B6914',fontSize:13,fontWeight:600}}>🤖 VastuAI Chat Preview</div>
            {[{role:'user',msg:"My kitchen is in the North-West. Is that okay?"},{role:'ai',msg:"North-West kitchens are acceptable in Vastu! 🌟 To enhance compliance, ensure you cook facing East and use warm orange or red tones. Place a Vastu pyramid in the South-East corner as a remedy. 💡 Tip: Keep a copper vessel near the stove to strengthen the Agni element."}].map((m,i)=>(
              <div key={i} style={{marginBottom:12,display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                <div style={{background:m.role==='user'?'linear-gradient(135deg,#C9A84C,#8B6914)':'#FDF0D5',color:m.role==='user'?'#1a0a00':'#4A2C1A',padding:'10px 14px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',fontSize:13,maxWidth:'85%',lineHeight:1.5,border:m.role==='ai'?'1px solid rgba(201,168,76,0.3)':'none'}}>{m.msg}</div>
              </div>
            ))}
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <input style={{flex:1,padding:'8px 14px',borderRadius:20,border:'1px solid rgba(201,168,76,0.3)',background:'#FDF6EC',fontSize:13,outline:'none',color:'#4A2C1A'}} placeholder="Ask about your home..."/>
              <button style={{background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#1a0a00',border:'none',borderRadius:20,padding:'8px 16px',fontWeight:600,cursor:'pointer',fontSize:13}}>Ask</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
