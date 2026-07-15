import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Activity, ArrowUpRight, Clock, Zap } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { supabase } from '../lib/supabase';

/* ── Card shell ─────────────────────────────────────── */
const card = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
};

/* ── KPI Card ────────────────────────────────────────── */
function KPI({ label, value, sub, trend, trendUp, gradA, gradB, icon: Icon }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      ...card,
      padding: '22px 22px 20px',
      position: 'relative', overflow: 'hidden',
      animation: 'fade-in 0.35s ease forwards',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      transform: hov ? 'translateY(-3px)' : 'none',
      borderColor: hov ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)',
      boxShadow: hov
        ? `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.20), inset 0 1px 0 rgba(255,255,255,0.07)`
        : card.boxShadow,
    }}>
      {/* Gradient top strip */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${gradA},${gradB},transparent)` }} />
      {/* Corner glow */}
      <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, background:`radial-gradient(circle,${gradA}20 0%,transparent 70%)`, pointerEvents:'none' }} />

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
        <span style={{ fontSize:9.5, fontWeight:700, color:'#334155', letterSpacing:'1.1px', textTransform:'uppercase', fontFamily:'var(--font)', marginTop:2 }}>{label}</span>
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:`linear-gradient(145deg,${gradA},${gradB})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 6px 18px ${gradA}50, inset 0 1px 0 rgba(255,255,255,0.20)` }}>
          <Icon size={15} color="#fff" strokeWidth={2} />
        </div>
      </div>

      <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:32, color:'#E0E7FF', letterSpacing:'-1.2px', lineHeight:1, marginBottom:14 }}>{value}</div>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10.5, fontWeight:600,
          color: trendUp ? '#10B981' : '#F87171',
          background: trendUp ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)',
          padding:'3px 9px', borderRadius:20 }}>
          {trendUp ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
          {trend}
        </span>
        <span style={{ fontSize:11.5, color:'#334155' }}>{sub}</span>
      </div>
    </div>
  );
}

/* ── Sparkline ───────────────────────────────────────── */
function Spark({ data, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.offsetWidth, H = c.offsetHeight;
    c.width = W * devicePixelRatio; c.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const mn = Math.min(...data), mx = Math.max(...data);
    const xs = W / (data.length - 1);
    const pts = data.map((v,i) => [i*xs, H-((v-mn)/(mx-mn||1))*(H-8)-4]);
    const gr = ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0, color+'50'); gr.addColorStop(1, color+'00');
    ctx.beginPath();
    pts.forEach(([x,y],i) => i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y));
    ctx.strokeStyle=color; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.stroke();
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fillStyle=gr; ctx.fill();
    const [lx,ly]=pts[pts.length-1];
    ctx.beginPath(); ctx.arc(lx,ly,3.5,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
    ctx.beginPath(); ctx.arc(lx,ly,7,0,Math.PI*2); ctx.fillStyle=color+'30'; ctx.fill();
  },[data,color]);
  return <canvas ref={ref} style={{ width:'100%', height:'100%', display:'block' }}/>;
}

/* ── Alert row ───────────────────────────────────────── */
function AlertRow({ level, title, desc, time }) {
  const C = { critical:'#F87171', warning:'#F59E0B', info:'#818CF8' };
  const B = { critical:'rgba(248,113,113,0.10)', warning:'rgba(245,158,11,0.10)', info:'rgba(129,140,248,0.10)' };
  return (
    <div style={{ display:'flex', gap:14, padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', animation:'slide-in 0.25s ease forwards' }}>
      <div style={{ width:3, borderRadius:4, flexShrink:0, alignSelf:'stretch', background:C[level], boxShadow:`0 0 12px ${C[level]}80` }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <span style={{ fontWeight:600, fontSize:12.5, color:'#C7D2FE', flex:1, letterSpacing:'-0.1px', fontFamily:'var(--font-display)' }}>{title}</span>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.7px', padding:'2px 8px', borderRadius:5, background:B[level], color:C[level], textTransform:'uppercase' }}>{level}</span>
        </div>
        <div style={{ fontSize:11.5, color:'#334155', lineHeight:1.55 }}>{desc}</div>
      </div>
      <div style={{ fontSize:10, color:'#1E293B', display:'flex', alignItems:'flex-start', gap:3, flexShrink:0, paddingTop:2, fontFamily:'var(--mono)' }}>
        <Clock size={9} style={{ marginTop:1 }}/>{time}
      </div>
    </div>
  );
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function fmtUSD(n) {
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}

const STATIC_CATS = [
  { label:'Wire Transfer', pct:38, val:'$912K', a:'#F87171', b:'#EF4444' },
  { label:'Card Skimming', pct:27, val:'$648K', a:'#FB923C', b:'#EA580C' },
  { label:'ACH Fraud',     pct:19, val:'$456K', a:'#FBBF24', b:'#D97706' },
  { label:'Check Kiting',  pct:10, val:'$240K', a:'#A78BFA', b:'#7C3AED' },
  { label:'Zelle / P2P',   pct:6,  val:'$144K', a:'#64748B', b:'#475569' },
];
const STATIC_ALERTS = [
  { level:'warning',  title:'AML pattern — 3 accounts linked',          desc:'Circular transactions matching typology T-12 · Review required', time:'14m ago' },
  { level:'warning',  title:'CTR threshold approaching — Acct #YY9203', desc:'$9,400 cash deposit · $600 below reporting threshold',           time:'31m ago' },
  { level:'info',     title:'Sanctions list updated',                    desc:'OFAC SDN list refreshed · 12 new entries screened',              time:'1h ago'  },
];
const fData=[12,19,14,28,22,35,31,40,38,52,48,61];
const cData=[88,85,91,87,93,89,95,92,96,90,94,97];
const rData=[5.8,6.1,5.9,6.4,6.2,6.8,6.5,6.2,6.7,6.3,6.5,6.2];

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    fraudBlocked:'$0', fraudTrend:'0 flagged',
    creditApprovals:'0', creditTrend:'0 total',
    complianceFlags:'0', complianceTrend:'0 today',
    portfolioRisk:'—', riskTrend:'no data',
  });
  const [liveAlerts, setLiveAlerts] = useState(STATIC_ALERTS);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayISO = today.toISOString();
    const [
      { data: fraudRows },
      { count: creditCount },
      { count: compCount },
      { data: riskRows },
      { data: alertRows },
    ] = await Promise.all([
      supabase.from('fraud_analyses').select('amount,is_fraud').eq('is_fraud',true).gte('created_at',todayISO),
      supabase.from('credit_applications').select('*',{count:'exact',head:true}).ilike('decision','%APPROVED%'),
      supabase.from('compliance_queries').select('*',{count:'exact',head:true}).gte('created_at',todayISO),
      supabase.from('risk_analyses').select('risk_score').order('created_at',{ascending:false}).limit(1),
      supabase.from('alerts').select('*').order('created_at',{ascending:false}).limit(8),
    ]);
    const fraudSum = (fraudRows||[]).reduce((s,r)=>s+Number(r.amount||0),0);
    const fraudCnt = (fraudRows||[]).length;
    setKpis({
      fraudBlocked:    fraudSum>0 ? fmtUSD(fraudSum) : '$0',
      fraudTrend:      `${fraudCnt} flagged`,
      creditApprovals: creditCount ? String(creditCount) : '0',
      creditTrend:     creditCount ? `${creditCount} approved` : '0 total',
      complianceFlags: compCount ? String(compCount) : '0',
      complianceTrend: `${compCount||0} today`,
      portfolioRisk:   riskRows?.[0]?.risk_score != null ? `${riskRows[0].risk_score}/100` : '—',
      riskTrend:       riskRows?.length ? 'latest score' : 'no data yet',
    });
    if (alertRows?.length) {
      setLiveAlerts(alertRows.map(a=>({ level:a.level, title:a.title, desc:a.description, time:timeAgo(a.created_at) })));
    }
  }

  return (
    <PageLayout title="Command Center" subtitle="Real-time AI intelligence · Supabase live">

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:16 }}>
        <KPI label="Fraud Blocked"    value={kpis.fraudBlocked}    trend={kpis.fraudTrend}      trendUp={false} sub="today"        gradA="#F87171" gradB="#EF4444" icon={ShieldCheck}/>
        <KPI label="Credit Approvals" value={kpis.creditApprovals} trend={kpis.creditTrend}     trendUp        sub="all time"     gradA="#10B981" gradB="#059669" icon={TrendingUp}/>
        <KPI label="Compliance Flags" value={kpis.complianceFlags} trend={kpis.complianceTrend} trendUp={false} sub="need review" gradA="#F59E0B" gradB="#D97706" icon={AlertTriangle}/>
        <KPI label="Portfolio Risk"   value={kpis.portfolioRisk}   trend={kpis.riskTrend}       trendUp={false} sub="risk score"  gradA="#A78BFA" gradB="#7C3AED" icon={Activity}/>
      </div>

      {/* Mid row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>

        {/* Fraud by Category */}
        <div style={{ ...card, padding:'22px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'#C7D2FE', letterSpacing:'-0.3px' }}>Fraud by Category</span>
            <span style={{ fontSize:10, color:'#334155', fontFamily:'var(--mono)', background:'rgba(99,102,241,0.10)', border:'1px solid rgba(99,102,241,0.18)', padding:'3px 10px', borderRadius:7 }}>YTD · {kpis.fraudBlocked}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {STATIC_CATS.map(({ label,pct,val,a,b }) => (
              <div key={label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <span style={{ fontSize:12.5, color:'#94A3B8', fontWeight:500 }}>{label}</span>
                  <div style={{ display:'flex', gap:12 }}>
                    <span style={{ fontSize:12.5, color:'#C7D2FE', fontFamily:'var(--mono)', fontWeight:600 }}>{val}</span>
                    <span style={{ fontSize:11, color:'#334155', fontFamily:'var(--mono)', minWidth:28, textAlign:'right' }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:6, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, borderRadius:6, background:`linear-gradient(90deg,${a},${b})`, boxShadow:`0 0 10px ${a}60`, transition:'width 1s cubic-bezier(.4,0,.2,1)' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sparklines */}
        <div style={{ ...card, padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'#C7D2FE', letterSpacing:'-0.3px' }}>Trend Lines · 12-week</span>
          {[
            { label:'Fraud Volume',         data:fData, color:'#F87171', unit:'cases/wk' },
            { label:'Credit Approval Rate', data:cData, color:'#10B981', unit:'%' },
            { label:'Portfolio Risk Score',  data:rData, color:'#A78BFA', unit:'/10' },
          ].map(({ label,data,color,unit }) => (
            <div key={label} style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ fontSize:11.5, color:'#475569' }}>{label}</span>
                <span style={{ fontSize:11, fontFamily:'var(--mono)', fontWeight:600, color, background:`${color}15`, border:`1px solid ${color}30`, padding:'2px 8px', borderRadius:8 }}>
                  {data[data.length-1]}{unit}
                </span>
              </div>
              <div style={{ height:44 }}><Spark data={data} color={color}/></div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Alerts */}
      <div style={{ ...card, padding:'22px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'#C7D2FE', letterSpacing:'-0.3px' }}>Live Alerts</span>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.8px', background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.22)', color:'#F87171', padding:'2px 9px', borderRadius:5, display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#F87171', animation:'pulse-dot 1.4s ease-in-out infinite', display:'inline-block', boxShadow:'0 0 8px #F87171' }}/>
              LIVE
            </span>
          </div>
          <button style={{ fontSize:11.5, color:'#818CF8', background:'rgba(99,102,241,0.10)', border:'1px solid rgba(99,102,241,0.20)', borderRadius:9, padding:'5px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontWeight:600, transition:'all 0.16s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.20)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(99,102,241,0.10)'}
          >
            View all <ArrowUpRight size={12}/>
          </button>
        </div>
        {liveAlerts.map((a,i) => <AlertRow key={i} {...a}/>)}
      </div>

    </PageLayout>
  );
}
