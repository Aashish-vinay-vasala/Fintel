import { useState } from 'react';
import { Share2, Zap, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { analyzeNetwork } from '../services/api';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

const NODE_COLOR  = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };
const NODE_BG     = { HIGH: 'rgba(239,68,68,0.12)', MEDIUM: 'rgba(245,158,11,0.12)', LOW: 'rgba(16,185,129,0.12)' };
const TYPE_ICON   = { account: '🏦', shell: '⚠️', merchant: '🏪', individual: '👤' };

function GraphSVG({ nodes, edges }) {
  if (!nodes?.length) return null;
  const W = 560, H = 340;
  const cx = W / 2, cy = H / 2, r = 130;

  const center = nodes[0];
  const others  = nodes.slice(1);
  const positions = { [center.id]: { x: cx, y: cy } };
  others.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / others.length - Math.PI / 2;
    positions[n.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(100,116,139,0.6)" />
        </marker>
      </defs>
      {edges?.map((e, i) => {
        const from = positions[e.from], to = positions[e.to];
        if (!from || !to) return null;
        const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2;
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={e.suspicious ? 'rgba(239,68,68,0.5)' : 'rgba(100,116,139,0.3)'}
              strokeWidth={e.suspicious ? 2 : 1.5}
              strokeDasharray={e.suspicious ? '5,3' : 'none'}
              markerEnd="url(#arrow)"
            />
            {e.label && (
              <text x={midX} y={midY - 5} textAnchor="middle" fontSize="9" fill="var(--text3)">{e.label}</text>
            )}
          </g>
        );
      })}
      {nodes.map(n => {
        const pos = positions[n.id];
        if (!pos) return null;
        const isCenter = n.id === center.id;
        const rad = isCenter ? 28 : 22;
        return (
          <g key={n.id}>
            <circle cx={pos.x} cy={pos.y} r={rad + 6}
              fill={NODE_BG[n.risk] || 'rgba(37,99,235,0.08)'}
              stroke={NODE_COLOR[n.risk] || '#2563EB'}
              strokeWidth={isCenter ? 2 : 1}
              opacity={0.7}
            />
            <circle cx={pos.x} cy={pos.y} r={rad}
              fill={isCenter ? '#2563EB' : '#fff'}
              stroke={NODE_COLOR[n.risk] || '#2563EB'}
              strokeWidth={isCenter ? 0 : 1.5}
            />
            <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={isCenter ? 13 : 11} fill={isCenter ? '#fff' : 'var(--text)'}>
              {TYPE_ICON[n.type] || '🏦'}
            </text>
            <text x={pos.x} y={pos.y + rad + 16} textAnchor="middle" fontSize="9" fill="var(--text2)" fontWeight="600">
              {n.label?.length > 10 ? n.label.slice(0, 10) + '…' : n.label}
            </text>
            <text x={pos.x} y={pos.y + rad + 27} textAnchor="middle" fontSize="8" fill={NODE_COLOR[n.risk] || 'var(--text3)'}>
              {n.risk}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function NetworkGraph() {
  const [form, setForm] = useState({ account_id: '', description: '', tx_count: '', period: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await analyzeNetwork(form)); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <PageLayout title="Network Graph" subtitle="Transaction network analysis · entity mapping · AML typology detection">
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14, maxWidth: 1100 }}>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Account Details</span>
          </div>
          <div style={{ padding: 14 }}>
            {[
              { k: 'account_id',  l: 'Account ID',        ph: 'ACC-00198234' },
              { k: 'description', l: 'Description / Notes',ph: 'High-frequency wires to offshore', multi: true },
              { k: 'tx_count',    l: 'Transaction Count',  ph: '240' },
              { k: 'period',      l: 'Review Period',      ph: 'Last 90 days' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <label style={lbl}>{f.l}</label>
                {f.multi
                  ? <textarea rows={3} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={{ ...inp, resize: 'vertical', minHeight: 60 }} />
                  : <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
                }
              </div>
            ))}

            {/* Legend */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>Node Types</div>
              {Object.entries(TYPE_ICON).map(([type, icon]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>{icon}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8', textTransform: 'capitalize' }}>{type}</span>
                </div>
              ))}
            </div>

            <button onClick={submit} disabled={loading} style={{
              width: '100%', padding: 10,
              background: loading ? 'var(--bg4)' : 'var(--cyan)',
              color: loading ? 'var(--text3)' : '#000',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'var(--font-display)',
            }}>
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Mapping...</> : <><Zap size={14} /> Map Network</>}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Transaction Network</span>
            {result && !result.error && (
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 4, background: result.risk_score >= 70 ? 'var(--red-dim)' : result.risk_score >= 40 ? 'var(--amber-dim)' : 'var(--green-dim)', color: result.risk_score >= 70 ? 'var(--red)' : result.risk_score >= 40 ? 'var(--amber)' : 'var(--green)' }}>
                RISK {result.risk_score}/100
              </span>
            )}
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <Share2 size={36} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Enter an account ID to visualize its transaction network</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Mapping transaction network...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraphSVG nodes={result.nodes} edges={result.edges} />
                </div>

                {result.flags?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Detected Typologies</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.flags.map(f => (
                        <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.2)' }}>
                          <AlertTriangle size={9} /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.summary && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>AI Assessment</div>
                    <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{result.summary}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
