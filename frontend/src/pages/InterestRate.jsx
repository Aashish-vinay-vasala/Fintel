import { useState } from 'react';
import { TrendingUp, Zap, CheckCircle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { analyzeInterestRate } from '../services/api';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
const riskColor = r => r === 'HIGH' ? 'var(--red)' : r === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
const riskBg    = r => r === 'HIGH' ? 'var(--red-dim)' : r === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';

export default function InterestRate() {
  const [form, setForm] = useState({
    total_assets: '', rate_sensitive_assets: '', rate_sensitive_liabilities: '',
    current_nim: '', fixed_rate_loans_pct: '', variable_rate_loans_pct: '',
    avg_asset_duration: '', avg_liability_duration: '', current_fed_rate: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await analyzeInterestRate(form)); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const fields = [
    { k: 'total_assets',                l: 'Total Assets ($M)',            ph: '5200' },
    { k: 'rate_sensitive_assets',        l: 'Rate-Sensitive Assets ($M)',   ph: '2800' },
    { k: 'rate_sensitive_liabilities',   l: 'Rate-Sensitive Liabilities ($M)',ph: '3100' },
    { k: 'current_nim',                 l: 'Current NIM (%)',              ph: '3.2' },
    { k: 'fixed_rate_loans_pct',        l: 'Fixed Rate Loans (%)',         ph: '55' },
    { k: 'variable_rate_loans_pct',     l: 'Variable Rate Loans (%)',      ph: '45' },
    { k: 'avg_asset_duration',          l: 'Avg Asset Duration (yrs)',     ph: '4.2' },
    { k: 'avg_liability_duration',      l: 'Avg Liability Duration (yrs)', ph: '2.8' },
    { k: 'current_fed_rate',            l: 'Current Fed Funds Rate (%)',   ph: '5.25' },
  ];

  return (
    <PageLayout title="Interest Rate Risk" subtitle="NIM analysis · duration gap · earnings at risk · rate shock scenarios">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, maxWidth: 1100 }}>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>ALM Inputs</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {fields.map(f => (
                <div key={f.k}>
                  <label style={lbl}>{f.l}</label>
                  <input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
                </div>
              ))}
            </div>
            <button onClick={submit} disabled={loading} style={{
              width: '100%', padding: 10, marginTop: 12,
              background: loading ? 'var(--bg4)' : 'var(--cyan)',
              color: loading ? 'var(--text3)' : '#000',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'var(--font-display)',
            }}>
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</> : <><Zap size={14} /> Run Analysis</>}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Rate Risk Analysis</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <TrendingUp size={36} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Enter ALM data to analyze interest rate risk exposure</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Running ALM analysis...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
                  {[
                    { l: 'Repricing Risk',  v: result.repricing_risk || '—', c: riskColor(result.repricing_risk), bg: riskBg(result.repricing_risk) },
                    { l: 'NIM Current',     v: result.nim_current != null ? `${result.nim_current}%` : '—', c: 'var(--cyan)', bg: 'var(--bg3)' },
                    { l: 'NIM (Stressed)',  v: result.nim_stressed != null ? `${result.nim_stressed}%` : '—', c: 'var(--amber)', bg: 'var(--bg3)' },
                    { l: 'Duration Gap',    v: result.duration_gap != null ? `${result.duration_gap}y` : '—', c: 'var(--text)', bg: 'var(--bg3)' },
                  ].map(({ l, v, c, bg }) => (
                    <div key={l} style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    { l: 'Earnings at Risk', v: result.earnings_at_risk != null ? `$${result.earnings_at_risk}M` : '—' },
                    { l: 'EVE at Risk',      v: result.economic_value_at_risk != null ? `$${result.economic_value_at_risk}M` : '—' },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--mono)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {result.scenarios?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Rate Shock Scenarios</div>
                    {result.scenarios.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cyan)', fontFamily: 'var(--mono)', minWidth: 80 }}>{s.shock}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.nim_impact < 0 ? 'var(--red)' : 'var(--green)', fontFamily: 'var(--mono)', minWidth: 60 }}>{s.nim_impact > 0 ? '+' : ''}{s.nim_impact}bps</span>
                        <span style={{ fontSize: 11.5, color: '#94A3B8', flex: 1 }}>{s.commentary}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result.recommendations?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Recommendations</div>
                    {result.recommendations.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
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
