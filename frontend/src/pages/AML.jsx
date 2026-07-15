import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, Eye, User, Zap } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { analyzeNarrative, screenCustomer } from '../services/api';
import { MOCK_AML_NARRATIVE, MOCK_AML_RESULT } from '../data/mockBank';

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '8px 16px', border: 'none', cursor: 'pointer',
    background: 'transparent',
    color: active ? 'var(--cyan)' : 'var(--text3)',
    borderBottom: `2px solid ${active ? 'var(--cyan)' : 'transparent'}`,
    fontSize: 12.5, fontWeight: active ? 600 : 400, transition: 'all 0.15s',
  }}>{label}</button>
);

const RiskBadge = ({ level }) => {
  const c = level === 'HIGH' ? 'var(--red)' : level === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
  const bg = level === 'HIGH' ? 'var(--red-dim)' : level === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', background: bg, color: c, border: `1px solid ${c}30`, padding: '2px 8px', borderRadius: 4 }}>
      {level} RISK
    </span>
  );
};

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 5 };

export default function AML() {
  const [tab, setTab] = useState('narrative');

  const [narrative, setNarrative] = useState(MOCK_AML_NARRATIVE);
  const [nResult, setNResult] = useState(MOCK_AML_RESULT);
  const [nLoading, setNLoading] = useState(false);

  const [cust, setCust] = useState({ name: '', dob: '', country: '', occupation: '', account_age_months: '' });
  const [cResult, setCResult] = useState(null);
  const [cLoading, setCLoading] = useState(false);

  const runNarrative = async () => {
    setNLoading(true); setNResult(null);
    try { setNResult(await analyzeNarrative({ narrative })); }
    catch (e) { setNResult({ error: e.message }); }
    finally { setNLoading(false); }
  };

  const runCustomer = async () => {
    setCLoading(true); setCResult(null);
    try { setCResult(await screenCustomer(cust)); }
    catch (e) { setCResult({ error: e.message }); }
    finally { setCLoading(false); }
  };

  const Spinner = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
      <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Running analysis...</div>
    </div>
  );

  return (
    <PageLayout title="AML Intelligence" subtitle="NLP transaction narrative analysis · customer risk screening · pattern detection">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Tab label="Narrative NLP Analysis" active={tab === 'narrative'} onClick={() => setTab('narrative')} />
          <Tab label="Customer Screening (KYC)" active={tab === 'customer'} onClick={() => setTab('customer')} />
        </div>

        {/* ── Narrative Tab ── */}
        {tab === 'narrative' && (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 14 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Transaction Narrative</span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>Paste transaction description or memo</div>
                <textarea
                  rows={10}
                  value={narrative}
                  onChange={e => setNarrative(e.target.value)}
                  placeholder="Transfer to offshore account for consulting services. Multiple structured deposits below $10,000 threshold over 3 days. Beneficiary is a shell company registered in BVI..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '10px 12px', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: 180, boxSizing: 'border-box' }}
                />
                <button onClick={runNarrative} disabled={nLoading || !narrative.trim()} style={{
                  width: '100%', marginTop: 12, padding: '10px',
                  background: nLoading || !narrative.trim() ? 'var(--bg4)' : 'var(--cyan)',
                  color: nLoading || !narrative.trim() ? 'var(--text3)' : '#000',
                  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                  cursor: nLoading || !narrative.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  fontFamily: 'var(--font-display)',
                }}>
                  {nLoading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</> : <><Eye size={14} /> Analyze Narrative</>}
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} color="var(--text3)" strokeWidth={1.75} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>NLP Analysis Result</span>
              </div>
              <div style={{ flex: 1, padding: 18, overflowY: 'auto' }}>
                {!nResult && !nLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', color: '#475569', gap: 10 }}>
                    <Search size={32} strokeWidth={1} />
                    <div style={{ fontSize: 12 }}>Paste a transaction narrative and run analysis</div>
                  </div>
                )}
                {nLoading && <Spinner />}
                {nResult?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{nResult.error}</div>}
                {nResult && !nResult.error && !nLoading && (
                  <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <RiskBadge level={nResult.risk_level || 'MEDIUM'} />
                      <span style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>
                        Score: <span style={{ color: 'var(--text)' }}>{nResult.risk_score ?? '—'}</span>/100
                      </span>
                    </div>

                    {nResult.entities?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Extracted Entities</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {nResult.entities.map((e, i) => (
                            <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontFamily: 'var(--mono)' }}>
                              <span style={{ color: '#475569', marginRight: 4 }}>{e.type}:</span>{e.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {nResult.red_flags?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Red Flags</div>
                        {nResult.red_flags.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <AlertTriangle size={11} color="var(--red)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: '#94A3B8' }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {nResult.patterns?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>AML Typologies Detected</div>
                        {nResult.patterns.map((p, i) => (
                          <div key={i} style={{ fontSize: 12, color: '#94A3B8', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <span style={{ color: 'var(--amber)', marginRight: 8 }}>◆</span>{p}
                          </div>
                        ))}
                      </div>
                    )}

                    {nResult.recommendation && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>Recommended Action</div>
                        <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{nResult.recommendation}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Customer Tab ── */}
        {tab === 'customer' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 14 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Customer Due Diligence</span>
              </div>
              <div style={{ padding: 16 }}>
                {[
                  { key: 'name', label: 'Full Name', ph: 'John Michael Doe' },
                  { key: 'dob', label: 'Date of Birth', ph: '1975-08-22' },
                  { key: 'country', label: 'Country of Residence', ph: 'United States' },
                  { key: 'occupation', label: 'Occupation / Business', ph: 'Import/Export Business' },
                  { key: 'account_age_months', label: 'Account Age (months)', ph: '24' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={lbl}>{f.label}</label>
                    <input value={cust[f.key] || ''} onChange={e => setCust(c => ({ ...c, [f.key]: e.target.value }))} placeholder={f.ph} style={inp} />
                  </div>
                ))}
                <button onClick={runCustomer} disabled={cLoading || !cust.name.trim()} style={{
                  width: '100%', marginTop: 4, padding: '10px',
                  background: cLoading || !cust.name.trim() ? 'var(--bg4)' : 'var(--cyan)',
                  color: cLoading || !cust.name.trim() ? 'var(--text3)' : '#000',
                  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                  cursor: cLoading || !cust.name.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  fontFamily: 'var(--font-display)',
                }}>
                  {cLoading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Screening...</> : <><Search size={14} /> Screen Customer</>}
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={14} color="var(--text3)" strokeWidth={1.75} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Screening Result</span>
              </div>
              <div style={{ flex: 1, padding: 18, overflowY: 'auto' }}>
                {!cResult && !cLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', color: '#475569', gap: 10 }}>
                    <User size={32} strokeWidth={1} />
                    <div style={{ fontSize: 12 }}>Enter customer details to run KYC/AML screening</div>
                  </div>
                )}
                {cLoading && <Spinner />}
                {cResult?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{cResult.error}</div>}
                {cResult && !cResult.error && !cLoading && (
                  <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <RiskBadge level={cResult.risk_level || 'LOW'} />
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{cust.name}</span>
                    </div>

                    {cResult.checks?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>KYC / Watchlist Checks</div>
                        {cResult.checks.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            {c.passed ? <CheckCircle size={13} color="var(--green)" /> : <XCircle size={13} color="var(--red)" />}
                            <span style={{ flex: 1, fontSize: 12, color: '#94A3B8' }}>{c.name}</span>
                            <span style={{ fontSize: 11, color: c.passed ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }}>{c.passed ? 'CLEAR' : 'FLAGGED'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {cResult.risk_factors?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Risk Factors</div>
                        {cResult.risk_factors.map((f, i) => (
                          <div key={i} style={{ fontSize: 12, color: '#94A3B8', padding: '5px 0', display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <span style={{ color: 'var(--amber)' }}>▸</span>{f}
                          </div>
                        ))}
                      </div>
                    )}

                    {cResult.recommendation && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>Due Diligence Action</div>
                        <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{cResult.recommendation}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
