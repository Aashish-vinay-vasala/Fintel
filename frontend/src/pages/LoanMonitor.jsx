import { useState } from 'react';
import { TrendingDown, AlertTriangle, CheckCircle, Zap, Plus, Trash2 } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { monitorLoans } from '../services/api';
import { MOCK_LOANS_PORTFOLIO, MOCK_LOANS, MOCK_LOANS_RESULT } from '../data/mockBank';

const LOAN_TYPES = ['Mortgage', 'Auto', 'Personal', 'SME', 'Commercial Real Estate', 'Trade Finance'];

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

const BLANK_LOAN = { borrower: '', loan_type: 'Mortgage', outstanding: '', days_past_due: '', collateral_value: '' };

export default function LoanMonitor() {
  const [portfolio, setPortfolio] = useState(MOCK_LOANS_PORTFOLIO);
  const [loans, setLoans] = useState(MOCK_LOANS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(MOCK_LOANS_RESULT);

  const setPort = (k, v) => setPortfolio(p => ({ ...p, [k]: v }));
  const setLoan = (i, k, v) => setLoans(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  const addLoan = () => setLoans(ls => [...ls, { ...BLANK_LOAN }]);
  const removeLoan = i => setLoans(ls => ls.filter((_, idx) => idx !== i));

  const submit = async () => {
    setLoading(true); setResult(null);
    try {
      const data = await monitorLoans({ portfolio, loans: loans.filter(l => l.borrower.trim()) });
      setResult(data);
    } catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const actionColor = (a) => a === 'RESTRUCTURE' || a === 'WRITE-OFF' ? 'var(--red)' : a === 'WATCH' ? 'var(--amber)' : 'var(--green)';
  const actionBg   = (a) => a === 'RESTRUCTURE' || a === 'WRITE-OFF' ? 'var(--red-dim)' : a === 'WATCH' ? 'var(--amber-dim)' : 'var(--green-dim)';

  return (
    <PageLayout title="Loan Monitor" subtitle="Real-time portfolio health · early warning indicators · AI decisioning">
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 14, maxWidth: 1200 }}>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Portfolio metrics */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Portfolio Metrics</span>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {[
                  { k: 'total_outstanding', l: 'Outstanding ($M)', ph: '2800' },
                  { k: 'num_active_loans',  l: 'Active Loans',     ph: '12400' },
                  { k: 'avg_days_past_due', l: 'Avg Days Past Due', ph: '8' },
                  { k: 'npl_ratio',         l: 'NPL Ratio (%)',    ph: '2.1' },
                  { k: 'provision_coverage',l: 'Provision Cov. (%)' ,ph: '120' },
                  { k: 'sector_concentration', l: 'Top Sector (%)', ph: '45' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={lbl}>{f.l}</label>
                    <input type="number" value={portfolio[f.k]} onChange={e => setPort(f.k, e.target.value)} placeholder={f.ph} style={inp} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual loans */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, flex: 1 }}>Watch List Loans</span>
              <button onClick={addLoan} style={{ fontSize: 11, color: 'var(--cyan)', background: 'transparent', border: '1px solid var(--cyan)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={10} /> Add
              </button>
            </div>
            <div style={{ padding: 12, maxHeight: 340, overflowY: 'auto' }}>
              {loans.map((loan, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 11, marginBottom: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)' }}>Loan #{i + 1}</span>
                    {loans.length > 1 && (
                      <button onClick={() => removeLoan(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 2 }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lbl}>Borrower Name</label>
                      <input value={loan.borrower} onChange={e => setLoan(i, 'borrower', e.target.value)} placeholder="ABC Corp / Jane Doe" style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>Type</label>
                      <select value={loan.loan_type} onChange={e => setLoan(i, 'loan_type', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                        {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Outstanding ($K)</label>
                      <input type="number" value={loan.outstanding} onChange={e => setLoan(i, 'outstanding', e.target.value)} placeholder="450" style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>Days Past Due</label>
                      <input type="number" value={loan.days_past_due} onChange={e => setLoan(i, 'days_past_due', e.target.value)} placeholder="0" style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>Collateral ($K)</label>
                      <input type="number" value={loan.collateral_value} onChange={e => setLoan(i, 'collateral_value', e.target.value)} placeholder="600" style={inp} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 12px 12px' }}>
              <button onClick={submit} disabled={loading} style={{
                width: '100%', padding: '10px',
                background: loading ? 'var(--bg4)' : 'var(--cyan)',
                color: loading ? 'var(--text3)' : '#000',
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontFamily: 'var(--font-display)',
              }}>
                {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</> : <><Zap size={14} /> Run Portfolio Analysis</>}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Portfolio Health Report</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <TrendingDown size={36} strokeWidth={1} />
                <div style={{ fontSize: 12, textAlign: 'center' }}>Enter portfolio metrics and loan data, then run analysis</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Analyzing loan portfolio...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && !loading && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                {/* Scores */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                  {[
                    { label: 'Health Score', value: `${result.health_score ?? '—'}/100`, color: result.health_score >= 70 ? 'var(--green)' : result.health_score >= 45 ? 'var(--amber)' : 'var(--red)' },
                    { label: 'Portfolio Rating', value: result.rating || '—', color: 'var(--text)' },
                    { label: 'EWI Signals', value: result.ewi_count ?? '—', color: (result.ewi_count || 0) > 3 ? 'var(--red)' : (result.ewi_count || 0) > 1 ? 'var(--amber)' : 'var(--green)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color, fontFamily: 'var(--mono)' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* EWI */}
                {result.early_warnings?.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Early Warning Indicators</div>
                    {result.early_warnings.map((w, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <AlertTriangle size={11} color={w.severity === 'HIGH' ? 'var(--red)' : 'var(--amber)'} />
                        <span style={{ flex: 1, fontSize: 12, color: '#94A3B8' }}>{w.indicator}</span>
                        <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: w.severity === 'HIGH' ? 'var(--red)' : 'var(--amber)' }}>{w.severity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Loan decisions */}
                {result.loan_analysis?.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Loan-Level Decisions</div>
                    {result.loan_analysis.map((l, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{l.borrower}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: actionBg(l.action), color: actionColor(l.action) }}>{l.action}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#475569' }}>{l.note}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>AI Recommendations</div>
                    {result.recommendations.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <CheckCircle size={12} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{r}</span>
                      </div>
                    ))}
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
