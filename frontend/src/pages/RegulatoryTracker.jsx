import { useState } from 'react';
import { BookOpen, Zap, Send, CheckCircle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { trackRegulatory } from '../services/api';

const impactColor = i => i === 'HIGH' ? 'var(--red)' : i === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
const impactBg    = i => i === 'HIGH' ? 'var(--red-dim)' : i === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';
const statusColor = s => s === 'ACTIVE' ? 'var(--green)' : s === 'PROPOSED' ? 'var(--amber)' : 'var(--cyan)';

const QUICK_QUERIES = [
  'What Basel III changes take effect in 2024–2025?',
  'Latest CFPB guidance on small business lending',
  'DORA requirements for EU banks — what applies to US subsidiaries?',
  'OCC CRA modernization rule key requirements',
  'FinCEN beneficial ownership reporting obligations',
  'FRB stress testing requirements for regional banks',
];

export default function RegulatoryTracker() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const submit = async (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true); setResult(null);
    try { setResult(await trackRegulatory({ query: text })); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <PageLayout title="Regulatory Tracker" subtitle="Live regulatory intelligence · CFPB · OCC · FinCEN · Fed · FDIC">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, maxWidth: 1100 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Ask Regulatory AI</span>
            </div>
            <div style={{ padding: 14 }}>
              <textarea
                rows={4}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
                placeholder="Ask about any banking regulation, compliance requirement, or recent regulatory change..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '9px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', minHeight: 100 }}
              />
              <button onClick={() => submit()} disabled={loading || !query.trim()} style={{
                width: '100%', padding: 10, marginTop: 8,
                background: loading || !query.trim() ? 'var(--bg4)' : 'var(--cyan)',
                color: loading || !query.trim() ? 'var(--text3)' : '#000',
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontFamily: 'var(--font-display)',
              }}>
                {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Researching...</> : <><Send size={13} /> Query</>}
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12 }}>Quick Topics</span>
            </div>
            <div style={{ padding: 8 }}>
              {QUICK_QUERIES.map(q => (
                <button key={q} onClick={() => { setQuery(q); submit(q); }} style={{
                  width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6,
                  border: 'none', cursor: 'pointer', marginBottom: 2, background: 'transparent',
                  color: '#94A3B8', fontSize: 11.5, lineHeight: 1.4, transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--cyan)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
                >{q}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Regulatory Intelligence</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <BookOpen size={36} strokeWidth={1} />
                <div style={{ fontSize: 12, textAlign: 'center' }}>Ask about any banking regulation or click a quick topic</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Scanning regulatory database...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                {/* Deadline */}
                {result.compliance_deadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)' }}>⏱ Compliance deadline: {result.compliance_deadline}</span>
                  </div>
                )}

                {/* Regulations */}
                {result.regulations?.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 10 }}>Regulations</div>
                    {result.regulations.map((r, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{r.name}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: impactBg(r.impact), color: impactColor(r.impact) }}>{r.impact}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(99,102,241,0.10)', color: statusColor(r.status) }}>{r.status}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)' }}>{r.agency}</span>
                          {r.effective_date && <span style={{ fontSize: 10, color: '#475569' }}>· Effective: {r.effective_date}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{r.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action items */}
                {result.action_items?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Required Actions</div>
                    {result.action_items.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <CheckCircle size={12} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result.affected_departments?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Affected Departments</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.affected_departments.map(d => (
                        <span key={d} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.answer && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Detailed Analysis</div>
                    <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result.answer}</div>
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
