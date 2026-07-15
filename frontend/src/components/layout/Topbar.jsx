import { useState, useEffect } from 'react';
import { Bell, Activity, Wifi } from 'lucide-react';

export default function Topbar({ title, subtitle }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const hhmm = t => t.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
  const date  = time.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

  return (
    <div style={{
      height:58, flexShrink:0, position:'sticky', top:0, zIndex:50,
      background:'rgba(8,12,24,0.92)',
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(255,255,255,0.06)',
      boxShadow:'0 4px 24px rgba(0,0,0,0.30)',
      display:'flex', alignItems:'center', padding:'0 26px', gap:16,
    }}>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, letterSpacing:'-0.4px', color:'#E0E7FF', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize:10, color:'#334155', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{subtitle}</div>}
      </div>

      {/* Live indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', background:'rgba(16,185,129,0.10)', border:'1px solid rgba(16,185,129,0.22)', borderRadius:20, fontSize:10, fontWeight:700, color:'#10B981', letterSpacing:'0.9px' }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:'#10B981', animation:'pulse-dot 2s ease-in-out infinite', display:'inline-block', boxShadow:'0 0 8px #10B981' }} />
        LIVE
      </div>

      {/* Clock */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:500, color:'#818CF8', letterSpacing:'0.5px', lineHeight:1.1 }}>{hhmm(time)}</div>
        <div style={{ fontSize:9.5, color:'#334155', marginTop:1, letterSpacing:'0.3px' }}>{date}</div>
      </div>

      <div style={{ width:1, height:22, background:'rgba(255,255,255,0.07)' }} />

      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, fontWeight:600, color:'#10B981', letterSpacing:'0.2px' }}>
        <Wifi size={11} strokeWidth={2} />
        All systems operational
      </div>

      <button style={{
        position:'relative', width:34, height:34,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)',
        borderRadius:10, color:'#64748B', cursor:'pointer',
        transition:'all 0.17s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; e.currentTarget.style.color='#818CF8'; }}
        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#64748B'; }}
      >
        <Bell size={14} strokeWidth={1.75} />
        <span style={{ position:'absolute', top:-3, right:-3, width:15, height:15, background:'#F87171', borderRadius:'50%', fontSize:8, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #080C18', boxShadow:'0 0 10px rgba(248,113,113,0.5)' }}>3</span>
      </button>
    </div>
  );
}
