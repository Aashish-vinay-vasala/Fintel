import { useState, useEffect } from 'react';
import { Cpu, CheckCircle, AlertTriangle, BarChart2, Activity, Shield, FlaskConical } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { supabase } from '../lib/supabase';

const MODELS = [
  { name: 'Fraud XGBoost v2.1',  type: 'ML — XGBoost',     status: 'ACTIVE',  accuracy: 94.2, drift: 0.8,  last_validated: '2024-10-15', decisions_30d: 14820, overrides: 12, risk: 'LOW'    },
  { name: 'Credit XGBoost v1.8', type: 'ML — XGBoost',     status: 'ACTIVE',  accuracy: 91.7, drift: 1.4,  last_validated: '2024-09-28', decisions_30d: 3240,  overrides: 28, risk: 'LOW'    },
  { name: 'LangGraph AML Agent', type: 'LLM — LangGraph',  status: 'ACTIVE',  accuracy: null, drift: null, last_validated: '2024-11-01', decisions_30d: 8910,  overrides: 45, risk: 'MEDIUM' },
  { name: 'RAG Compliance v3',   type: 'LLM — RAG',        status: 'ACTIVE',  accuracy: null, drift: null, last_validated: '2024-10-22', decisions_30d: 5680,  overrides: 8,  risk: 'LOW'    },
  { name: 'Fraud XGBoost v1.9',  type: 'ML — XGBoost',     status: 'RETIRED', accuracy: 88.4, drift: 6.2,  last_validated: '2024-06-10', decisions_30d: 0,     overrides: 0,  risk: 'HIGH'   },
];
const AUDIT_LOG = [
  { ts: '2024-11-20 14:32', model: 'Fraud XGBoost v2.1',  action: 'BLOCK',   input: 'Amount: $4,800 · Foreign: Y · Freq: 12/24h',      score: 91, outcome: 'Confirmed Fraud',  override: false },
  { ts: '2024-11-20 11:18', model: 'Credit XGBoost v1.8', action: 'APPROVE', input: 'Score: 724 · DTI: 28% · Income: $96K',             score: 78, outcome: 'Loan Disbursed',   override: false },
  { ts: '2024-11-20 09:45', model: 'Fraud XGBoost v2.1',  action: 'REVIEW',  input: 'Amount: $9,200 · Same City: N · Freq: 3/24h',      score: 62, outcome: 'Analyst Cleared', override: true  },
  { ts: '2024-11-19 16:21', model: 'LangGraph AML Agent', action: 'FLAG',    input: 'Structuring · 14 txns · $9,800 avg',               score: 88, outcome: 'SAR Filed',       override: false },
  { ts: '2024-11-19 13:05', model: 'Credit XGBoost v1.8', action: 'DECLINE', input: 'Score: 591 · Missed: 3 · DTI: 52%',               score: 24, outcome: 'Declined',         override: false },
  { ts: '2024-11-19 10:44', model: 'Fraud XGBoost v2.1',  action: 'BLOCK',   input: 'Amount: $18,500 · Foreign: Y · Dist: 2,400mi',    score: 97, outcome: 'True Positive',    override: false },
];

const ROUTES = [
  { label: 'Fraud',       route: '/api/fraud/analyze',       color: '#F87171' },
  { label: 'Credit',      route: '/api/credit/evaluate',     color: '#10B981' },
  { label: 'Risk',        route: '/api/risk/analyze',        color: '#A78BFA' },
  { label: 'Compliance',  route: '/api/compliance/query',    color: '#F59E0B' },
  { label: 'AML',         route: '/api/aml/analyze-narrative', color: '#22D3EE' },
];

const card = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14 };
const statusColor = s => s==='ACTIVE'?'#10B981':s==='RETIRED'?'#475569':'#F59E0B';
const statusBg    = s => s==='ACTIVE'?'rgba(16,185,129,0.12)':s==='RETIRED'?'rgba(255,255,255,0.04)':'rgba(245,158,11,0.12)';
const riskColor   = r => r==='HIGH'?'#F87171':r==='MEDIUM'?'#F59E0B':'#10B981';
const actionColor = a => ['BLOCK','DECLINE','FLAG'].includes(a)?'#F87171':a==='REVIEW'?'#F59E0B':'#10B981';
const actionBg    = a => ['BLOCK','DECLINE','FLAG'].includes(a)?'rgba(248,113,113,0.12)':a==='REVIEW'?'rgba(245,158,11,0.12)':'rgba(16,185,129,0.12)';

function MetricBar({ label, value, max = 100, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontSize:11, color:'#475569' }}>{label}</span>
        <span style={{ fontSize:11, fontFamily:'var(--mono)', color, fontWeight:600 }}>{value}</span>
      </div>
      <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:4 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${color}80,${color})`, borderRadius:4, transition:'width 0.8s ease', boxShadow:`0 0 8px ${color}50` }}/>
      </div>
    </div>
  );
}

function EvalTab() {
  const [metrics, setMetrics] = useState([]);
  const [violations, setViolations] = useState([]);
  const [abExps, setAbExps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [metricsRes, vioRes, abRes] = await Promise.all([
      Promise.all(ROUTES.map(async ({ label, route, color }) => {
        const { data } = await supabase
          .from('evaluation_metrics')
          .select('latency_ms, quality_score, completeness, relevance, guardrail_passed')
          .eq('route', route)
          .order('created_at', { ascending: false })
          .limit(100);
        if (!data?.length) return { label, route, color, count: 0 };
        const avg = (k) => +(data.reduce((s,r) => s+(r[k]||0),0)/data.length).toFixed(1);
        const passRate = +(data.filter(r=>r.guardrail_passed).length/data.length*100).toFixed(1);
        return { label, route, color, count: data.length, avg_quality: avg('quality_score'), avg_latency: Math.round(data.reduce((s,r)=>s+(r.latency_ms||0),0)/data.length), avg_completeness: +(avg('completeness')*100/100).toFixed(1), guardrail_pass_rate: passRate };
      })),
      supabase.from('guardrail_violations').select('*').order('created_at',{ascending:false}).limit(20),
      supabase.from('ab_experiments').select('*, ab_variants(name,weight,prompt_key)').eq('status','active'),
    ]);
    setMetrics(metricsRes);
    setViolations(vioRes.data || []);
    setAbExps(abRes.data || []);
    setLoading(false);
  }

  const totalCalls    = metrics.reduce((s,m) => s+m.count, 0);
  const avgQuality    = metrics.filter(m=>m.count>0).length ? +(metrics.filter(m=>m.count>0).reduce((s,m)=>s+(m.avg_quality||0),0)/metrics.filter(m=>m.count>0).length).toFixed(1) : null;
  const critViolations = violations.filter(v=>v.severity==='critical').length;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, gap:12 }}>
      <div style={{ width:32, height:32, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.08)', borderTop:'2px solid #818CF8', animation:'spin 0.9s linear infinite' }}/>
      <span style={{ color:'#475569', fontSize:13 }}>Loading evaluation data from Supabase...</span>
    </div>
  );

  return (
    <div style={{ maxWidth:1100 }}>

      {/* Summary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { l:'Total AI Calls',      v: totalCalls || '—',                c:'#818CF8' },
          { l:'Avg Quality Score',   v: avgQuality ? `${avgQuality}/100` : '—', c: avgQuality >= 80 ? '#10B981' : avgQuality >= 60 ? '#F59E0B' : '#F87171' },
          { l:'Guardrail Violations',v: violations.length,               c: violations.length > 0 ? '#F87171' : '#10B981' },
          { l:'Critical Violations', v: critViolations,                  c: critViolations > 0 ? '#F87171' : '#10B981' },
        ].map(({l,v,c}) => (
          <div key={l} style={{...card, padding:'14px 18px'}}>
            <div style={{fontSize:9,color:'#334155',letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:6}}>{l}</div>
            <div style={{fontSize:24,fontWeight:700,color:c,fontFamily:'var(--mono)'}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Per-route metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:16 }}>
        {metrics.map(m => (
          <div key={m.route} style={{...card, padding:'14px 16px'}}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:m.color, boxShadow:`0 0 8px ${m.color}` }}/>
              <span style={{ fontSize:12, fontWeight:700, color:'#C7D2FE', fontFamily:'var(--font-display)' }}>{m.label}</span>
              <span style={{ marginLeft:'auto', fontSize:9, color:'#334155', fontFamily:'var(--mono)' }}>{m.count} calls</span>
            </div>
            {m.count === 0 ? (
              <div style={{ fontSize:11, color:'#334155', textAlign:'center', padding:'12px 0' }}>No data yet</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <MetricBar label="Quality" value={m.avg_quality||0} max={100} color={m.color}/>
                <MetricBar label="Pass Rate %" value={m.guardrail_pass_rate||0} max={100} color="#10B981"/>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span style={{ fontSize:10, color:'#334155' }}>Avg latency</span>
                  <span style={{ fontSize:10, fontFamily:'var(--mono)', color:'#818CF8' }}>{m.avg_latency||0}ms</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* A/B Experiments */}
      <div style={{...card, padding:'18px 20px', marginBottom:14}}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <FlaskConical size={15} color="#818CF8"/>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'#C7D2FE' }}>A/B Experiments</span>
          <span style={{ marginLeft:'auto', fontSize:10, color:'#334155' }}>{abExps.length} active</span>
        </div>
        {abExps.length === 0 ? (
          <div style={{ fontSize:12, color:'#334155', textAlign:'center', padding:'12px 0' }}>No active experiments — run schema_eval.sql to seed experiments</div>
        ) : abExps.map(exp => (
          <div key={exp.id} style={{ padding:'12px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:12.5, fontWeight:600, color:'#C7D2FE' }}>{exp.name}</span>
              <span style={{ fontSize:9, fontWeight:700, color:'#10B981', background:'rgba(16,185,129,0.12)', padding:'2px 8px', borderRadius:5, letterSpacing:'0.5px' }}>ACTIVE</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {(exp.ab_variants||[]).map(v => (
                <div key={v.name} style={{ flex:1, padding:'8px 10px', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.18)', borderRadius:8 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#818CF8', marginBottom:3 }}>{v.name}</div>
                  <div style={{ fontSize:9, color:'#334155' }}>Prompt: <span style={{ color:'#94A3B8' }}>{v.prompt_key||'zero_shot'}</span></div>
                  <div style={{ fontSize:9, color:'#334155' }}>Weight: <span style={{ color:'#94A3B8' }}>{Math.round((v.weight||0.5)*100)}%</span></div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:10, color:'#334155', marginTop:6 }}>Route: <span style={{ color:'#475569', fontFamily:'var(--mono)' }}>{exp.route}</span></div>
          </div>
        ))}
      </div>

      {/* Guardrail Violations */}
      <div style={{...card, padding:'18px 20px'}}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <Shield size={15} color="#F87171"/>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'#C7D2FE' }}>Guardrail Violations</span>
          <span style={{ marginLeft:'auto', fontSize:10, color:'#334155' }}>Last 20 · all time</span>
        </div>
        {violations.length === 0 ? (
          <div style={{ fontSize:12, color:'#10B981', textAlign:'center', padding:'16px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
            <CheckCircle size={14}/> No violations recorded
          </div>
        ) : violations.map((v,i) => {
          const C = { critical:'#F87171', high:'#F87171', medium:'#F59E0B', low:'#818CF8' };
          return (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width:3, borderRadius:2, alignSelf:'stretch', background:C[v.severity]||'#818CF8', flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:2 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:C[v.severity], background:`${C[v.severity]}15`, padding:'1px 7px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.5px' }}>{v.severity}</span>
                  <span style={{ fontSize:10.5, fontWeight:600, color:'#94A3B8' }}>{v.type?.replace(/_/g,' ')}</span>
                  <span style={{ marginLeft:'auto', fontSize:9, color:'#334155', fontFamily:'var(--mono)' }}>{v.route}</span>
                </div>
                <div style={{ fontSize:11, color:'#475569', fontFamily:'var(--mono)' }}>{v.detail?.slice(0,100)}{v.detail?.length>100?'…':''}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ModelRisk() {
  const [tab, setTab] = useState('registry');
  const activeModels   = MODELS.filter(m => m.status === 'ACTIVE');
  const totalDecisions = activeModels.reduce((s,m) => s+m.decisions_30d, 0);
  const totalOverrides = activeModels.reduce((s,m) => s+m.overrides, 0);
  const overrideRate   = totalDecisions ? ((totalOverrides/totalDecisions)*100).toFixed(2) : 0;

  return (
    <PageLayout title="Model Risk" subtitle="SR 11-7 governance · live eval metrics · A/B testing · guardrail monitoring">

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, maxWidth:1100, marginBottom:16 }}>
        {[
          { l:'Active Models',    v:activeModels.length,                          c:'#818CF8' },
          { l:'Decisions (30d)',  v:totalDecisions.toLocaleString(),              c:'#E0E7FF' },
          { l:'Override Rate',    v:`${overrideRate}%`,                           c:overrideRate>1?'#F59E0B':'#10B981' },
          { l:'High-Risk Models', v:MODELS.filter(m=>m.risk==='HIGH').length,     c:'#F87171' },
        ].map(({l,v,c}) => (
          <div key={l} style={{...card, padding:'14px 18px'}}>
            <div style={{fontSize:9,color:'#334155',letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:6}}>{l}</div>
            <div style={{fontSize:22,fontWeight:700,color:c,fontFamily:'var(--mono)'}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:14, maxWidth:1100 }}>
        {[
          { id:'registry', label:'Model Registry',   icon:Cpu      },
          { id:'eval',     label:'Live Eval Metrics', icon:Activity },
          { id:'audit',    label:'Audit Log',         icon:BarChart2 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer',
            fontFamily:'var(--font-display)', fontWeight:600, fontSize:12,
            background: tab===t.id ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'rgba(255,255,255,0.04)',
            color: tab===t.id ? '#fff' : '#475569',
            border: `1px solid ${tab===t.id ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: tab===t.id ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
          }}>
            <t.icon size={12}/>{t.label}
          </button>
        ))}
      </div>

      {tab === 'registry' && (
        <div style={{ maxWidth:1100 }}>
          {MODELS.map((m,i) => (
            <div key={i} style={{...card, padding:'16px 20px', marginBottom:10}}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                <Cpu size={16} color="#475569" strokeWidth={1.75}/>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:14, color:'#C7D2FE', flex:1 }}>{m.name}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, background:statusBg(m.status), color:statusColor(m.status) }}>{m.status}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, background:`${riskColor(m.risk)}15`, color:riskColor(m.risk) }}>RISK: {m.risk}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10 }}>
                {[
                  { l:'Type',            v:m.type },
                  { l:'Accuracy',        v:m.accuracy!=null?`${m.accuracy}%`:'N/A (LLM)' },
                  { l:'Drift Score',     v:m.drift!=null?`${m.drift}%`:'N/A' },
                  { l:'Last Validated',  v:m.last_validated },
                  { l:'Decisions (30d)', v:m.decisions_30d.toLocaleString() },
                  { l:'Overrides',       v:`${m.overrides} (${m.decisions_30d?((m.overrides/m.decisions_30d)*100).toFixed(1):0}%)` },
                ].map(({l,v}) => (
                  <div key={l}>
                    <div style={{ fontSize:9, color:'#334155', letterSpacing:'0.7px', textTransform:'uppercase', marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:11.5, fontWeight:500, color:'#94A3B8', fontFamily:'var(--mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
              {m.drift!=null && m.drift>5 && (
                <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:10, padding:'7px 10px', background:'rgba(248,113,113,0.10)', borderRadius:7, border:'1px solid rgba(248,113,113,0.22)' }}>
                  <AlertTriangle size={11} color="#F87171"/>
                  <span style={{ fontSize:11, color:'#F87171' }}>High drift detected — model revalidation recommended</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'eval' && <EvalTab />}

      {tab === 'audit' && (
        <div style={{ maxWidth:1100 }}>
          <div style={{...card, overflow:'hidden'}}>
            <div style={{ display:'grid', gridTemplateColumns:'130px 180px 80px 1fr 60px 120px 60px', padding:'8px 16px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              {['Timestamp','Model','Action','Input Summary','Score','Outcome','Override'].map(h => (
                <span key={h} style={{ fontSize:9, fontWeight:700, color:'#334155', letterSpacing:'0.8px', textTransform:'uppercase' }}>{h}</span>
              ))}
            </div>
            {AUDIT_LOG.map((l,i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'130px 180px 80px 1fr 60px 120px 60px', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', alignItems:'center', background:i%2===0?'rgba(255,255,255,0.02)':'transparent' }}>
                <span style={{ fontSize:10, color:'#334155', fontFamily:'var(--mono)' }}>{l.ts}</span>
                <span style={{ fontSize:11, color:'#94A3B8' }}>{l.model}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:actionBg(l.action), color:actionColor(l.action), textAlign:'center' }}>{l.action}</span>
                <span style={{ fontSize:10.5, color:'#475569', fontFamily:'var(--mono)' }}>{l.input}</span>
                <span style={{ fontSize:12, fontWeight:700, color:l.score>=70?'#F87171':l.score>=40?'#F59E0B':'#10B981', fontFamily:'var(--mono)', textAlign:'center' }}>{l.score}</span>
                <span style={{ fontSize:11, color:'#94A3B8' }}>{l.outcome}</span>
                <div style={{ textAlign:'center' }}>
                  {l.override ? <CheckCircle size={12} color="#F59E0B"/> : <span style={{ fontSize:10, color:'#334155' }}>—</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, padding:'10px 14px', ...card, fontSize:11.5, color:'#334155' }}>
            Showing last 6 decisions · SR 11-7 compliant audit trail · all decisions logged with input features, scores, and outcomes
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
