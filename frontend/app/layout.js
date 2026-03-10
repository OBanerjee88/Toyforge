import Nav from '../components/Nav';
export const metadata={title:'VastuForge — Vastu Compliant Interior Designs',description:'Discover 70 Vastu-compliant interior designs for every room. AI-powered Vastu advisor for Indian homes.'};
export default function RootLayout({children}){
  return(
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      </head>
      <body style={{margin:0,background:'#FDF6EC',color:'#2C1810',fontFamily:"'DM Sans',sans-serif",minHeight:'100vh'}}>
        <Nav/>
        {children}
        <footer style={{background:'linear-gradient(135deg,#1a0a00,#2d1400)',color:'#8B6914',textAlign:'center',padding:'2rem',fontSize:13,borderTop:'1px solid rgba(201,168,76,0.3)',marginTop:'4rem'}}>
          <div style={{marginBottom:8,fontSize:22}}>🪔 🏛️ 🌿</div>
          <div style={{color:'#D4AF6A',fontFamily:'Georgia,serif',fontSize:16,marginBottom:4}}>VastuForge</div>
          <div>Vastu-compliant designs for harmonious Indian homes</div>
          <div style={{marginTop:8,opacity:0.6,fontSize:12}}>© 2025 VastuForge · All designs follow classical Vastu Shastra principles</div>
        </footer>
      </body>
    </html>
  );
}
