import { useState } from 'react';
import { Users, Share2, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import TabBar from '../components/ui/TabBar';
import { profileCustomer, analyzeNetwork } from '../services/api';
import { MOCK_CUSTOMER_FORM, MOCK_CUSTOMER_RESULT, MOCK_NETWORK_FORM, MOCK_NETWORK_RESULT } from '../data/mockBank';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
const riskColor = r => r === 'HIGH' ? 'var(--red)' : r === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
const riskBg    = r => r === 'HIGH' ? 'var(--red-dim)' : r === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';


// ─── Customer 360 ─────────────────────────────────────────────────────────────
function Customer360() {
  const [form, setForm] = useState(MOCK_CUSTOMER_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_CUSTOMER_RESULT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => { setLoading(true); setResult(null); try { setResult(await profileCustomer(form)); } catch (e) { setResult({ error: e.message }); } finally { setLoading(false); } };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, maxWidth: 1100 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={14} color="var(--cyan)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Customer Lookup</span>
        </div>
        <div style={{ padding: 14 }}>
          {[
            { k: 'customer_id',       l: 'Customer ID',          ph: 'CIF-00123456' },
            { k: 'full_name',         l: 'Full Name',            ph: 'John A. Doe' },
            { k: 'account_type',      l: 'Primary Account',      ph: 'Business Checking' },
            { k: 'country',           l: 'Country',              ph: 'United States' },
            { k: 'occupation',        l: 'Occupation',           ph: 'Real Estate Investor' },
            { k: 'monthly_income',    l: 'Monthly Income ($)',   ph: '18000' },
            { k: 'account_age_years', l: 'Account Age (yrs)',    ph: '4' },
            { k: 'existing_products', l: 'Known Products',       ph: 'Checking, Mortgage' },
          ].map(f => <div key={f.k} style={{ marginBottom: 9 }}><label style={lbl}>{f.l}</label><input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} /></div>)}
          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: 10, marginTop: 4, background: loading ? 'var(--bg4)' : 'var(--cyan)', color: loading ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
            {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Profiling...</> : <><Zap size={14} /> Build Profile</>}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>360° Profile</span>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><Users size={36} strokeWidth={1} /><div style={{ fontSize: 12 }}>Enter customer details to generate a unified risk profile</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Building customer profile...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { l: 'Risk Level',   v: result.risk_level || '—',         c: riskColor(result.risk_level), bg: riskBg(result.risk_level) },
                  { l: 'Risk Score',   v: `${result.risk_score ?? '—'}/100`, c: riskColor(result.risk_level), bg: 'var(--bg3)' },
                  { l: 'Credit Grade', v: result.credit_grade || '—',        c: 'var(--cyan)',                bg: 'var(--bg3)' },
                  { l: 'LTV Est.',     v: result.lifetime_value ? `$${result.lifetime_value}K` : '—', c: 'var(--text)', bg: 'var(--bg3)' },
                ].map(({ l, v, c, bg }) => (
                  <div key={l} style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { l: 'KYC Status',      ok: result.kyc_status === 'VERIFIED', v: result.kyc_status || '—' },
                  { l: 'PEP Match',       ok: !result.pep_match,                v: result.pep_match ? 'MATCH' : 'CLEAR' },
                  { l: 'Sanctions',       ok: !result.sanctions_match,           v: result.sanctions_match ? 'MATCH' : 'CLEAR' },
                ].map(({ l, ok, v }) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px' }}>
                    {ok ? <CheckCircle size={13} color="var(--green)" /> : <XCircle size={13} color="var(--red)" />}
                    <div><div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{l}</div><div style={{ fontSize: 12, fontWeight: 600, color: ok ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }}>{v}</div></div>
                  </div>
                ))}
              </div>
              {result.product_holdings?.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Products</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{result.product_holdings.map(p => <span key={p} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(37,99,235,0.15)' }}>{p}</span>)}</div></div>}
              {result.behavioral_flags?.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Behavioral Flags</div>{result.behavioral_flags.map((f, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><AlertTriangle size={11} color="var(--amber)" /><span style={{ fontSize: 12, color: '#94A3B8' }}>{f}</span></div>)}</div>}
              {result.summary && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>AI Assessment</div><div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{result.summary}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Network Graph ─────────────────────────────────────────────────────────────
const NODE_COLOR  = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };
const NODE_BG     = { HIGH: 'rgba(239,68,68,0.1)', MEDIUM: 'rgba(245,158,11,0.1)', LOW: 'rgba(16,185,129,0.1)' };
const TYPE_ICON   = { account: '🏦', shell: '⚠️', merchant: '🏪', individual: '👤' };

function GraphSVG({ nodes, edges }) {
  if (!nodes?.length) return null;
  const W = 540, H = 320, cx = W / 2, cy = H / 2, r = 120;
  const center = nodes[0];
  const others  = nodes.slice(1);
  const positions = { [center.id]: { x: cx, y: cy } };
  others.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / others.length - Math.PI / 2;
    positions[n.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="rgba(100,116,139,0.5)" /></marker></defs>
      {edges?.map((e, i) => { const f = positions[e.from], t = positions[e.to]; if (!f || !t) return null; return <line key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={e.suspicious ? 'rgba(239,68,68,0.45)' : 'rgba(100,116,139,0.25)'} strokeWidth={e.suspicious ? 2 : 1.5} strokeDasharray={e.suspicious ? '5,3' : 'none'} markerEnd="url(#arr)" />; })}
      {nodes.map(n => { const pos = positions[n.id]; if (!pos) return null; const isCenter = n.id === center.id; const rad = isCenter ? 26 : 20;
        return (<g key={n.id}><circle cx={pos.x} cy={pos.y} r={rad + 6} fill={NODE_BG[n.risk] || 'rgba(37,99,235,0.07)'} stroke={NODE_COLOR[n.risk] || '#2563EB'} strokeWidth={isCenter ? 2 : 1} opacity={0.65} /><circle cx={pos.x} cy={pos.y} r={rad} fill={isCenter ? '#2563EB' : '#fff'} stroke={NODE_COLOR[n.risk] || '#2563EB'} strokeWidth={isCenter ? 0 : 1.5} /><text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={isCenter ? 12 : 10}>{TYPE_ICON[n.type] || '🏦'}</text><text x={pos.x} y={pos.y + rad + 15} textAnchor="middle" fontSize="8.5" fill="var(--text2)" fontWeight="600">{n.label?.length > 10 ? n.label.slice(0, 10) + '…' : n.label}</text></g>); })}
    </svg>
  );
}

function NetworkGraphContent() {
  const [form, setForm] = useState(MOCK_NETWORK_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_NETWORK_RESULT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => { setLoading(true); setResult(null); try { setResult(await analyzeNetwork(form)); } catch (e) { setResult({ error: e.message }); } finally { setLoading(false); } };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 14, maxWidth: 1100 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Share2 size={14} color="var(--cyan)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Account Details</span>
        </div>
        <div style={{ padding: 14 }}>
          {[
            { k: 'account_id',  l: 'Account ID',       ph: 'ACC-00198234' },
            { k: 'description', l: 'Notes',             ph: 'High-frequency offshore wires', multi: true },
            { k: 'tx_count',    l: 'Transaction Count', ph: '240' },
            { k: 'period',      l: 'Review Period',     ph: 'Last 90 days' },
          ].map(f => <div key={f.k} style={{ marginBottom: 9 }}><label style={lbl}>{f.l}</label>{f.multi ? <textarea rows={3} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={{ ...inp, resize: 'vertical', minHeight: 60 }} /> : <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />}</div>)}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>Node Types</div>
            {Object.entries(TYPE_ICON).map(([type, icon]) => <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}><span style={{ fontSize: 12 }}>{icon}</span><span style={{ fontSize: 11, color: '#94A3B8', textTransform: 'capitalize' }}>{type}</span></div>)}
          </div>
          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: 10, background: loading ? 'var(--bg4)' : 'var(--cyan)', color: loading ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
            {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Mapping...</> : <><Zap size={14} /> Map Network</>}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Share2 size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Transaction Network</span>
          {result && !result.error && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 4, background: (result.risk_score || 0) >= 70 ? 'var(--red-dim)' : 'var(--amber-dim)', color: (result.risk_score || 0) >= 70 ? 'var(--red)' : 'var(--amber)' }}>RISK {result.risk_score}/100</span>}
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><Share2 size={36} strokeWidth={1} /><div style={{ fontSize: 12 }}>Enter an account ID to visualize its transaction network</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Mapping transaction network...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraphSVG nodes={result.nodes} edges={result.edges} /></div>
              {result.flags?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Detected Typologies</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{result.flags.map(f => <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.2)' }}><AlertTriangle size={9} />{f}</span>)}</div></div>}
              {result.summary && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>AI Assessment</div><div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{result.summary}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerIntel() {
  const [tab, setTab] = useState('customer');
  const TABS = [
    { id: 'customer', label: 'Customer 360',  icon: Users  },
    { id: 'network',  label: 'Network Graph', icon: Share2 },
  ];
  return (
    <PageLayout title="Customer Intel" subtitle="Unified customer profile · KYC · transaction network mapping">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'customer' && <Customer360 />}
      {tab === 'network'  && <NetworkGraphContent />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
