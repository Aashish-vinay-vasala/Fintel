import { useState } from 'react';
import { BarChart2, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { benchmarkBank } from '../services/api';
import { MOCK_BENCHMARK_FORM, MOCK_BENCHMARK_RESULT } from '../data/mockBank';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

const rankMeta = {
  TOP_QUARTILE:    { label: 'Top Quartile',    color: 'var(--green)', bg: 'var(--green-dim)', pct: '75–100th' },
  SECOND_QUARTILE: { label: 'Second Quartile', color: 'var(--cyan)',  bg: 'var(--cyan-dim)',  pct: '50–75th' },
  THIRD_QUARTILE:  { label: 'Third Quartile',  color: 'var(--amber)', bg: 'var(--amber-dim)', pct: '25–50th' },
  BOTTOM_QUARTILE: { label: 'Bottom Quartile', color: 'var(--red)',   bg: 'var(--red-dim)',   pct: '0–25th' },
};

const statusIcon = s => s === 'ABOVE' ? <TrendingUp size={12} color="var(--green)" /> : s === 'BELOW' ? <TrendingDown size={12} color="var(--red)" /> : <Minus size={12} color="var(--amber)" />;
const statusColor = s => s === 'ABOVE' ? 'var(--green)' : s === 'BELOW' ? 'var(--red)' : 'var(--amber)';

export default function Benchmarking() {
  const [form, setForm] = useState({
    institution_name: MOCK_BENCHMARK_FORM.bank_name,
    total_assets_b: MOCK_BENCHMARK_FORM.total_assets,
    roe: MOCK_BENCHMARK_FORM.roe, roa: MOCK_BENCHMARK_FORM.roa, nim: MOCK_BENCHMARK_FORM.nim,
    efficiency_ratio: MOCK_BENCHMARK_FORM.efficiency_ratio,
    tier1_capital_ratio: MOCK_BENCHMARK_FORM.tier1_ratio,
    npa_ratio: MOCK_BENCHMARK_FORM.npl_ratio,
    loan_to_deposit: '', cost_of_funds: '', peer_region: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_BENCHMARK_RESULT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await benchmarkBank(form)); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const meta = rankMeta[result?.overall_rank] || rankMeta.SECOND_QUARTILE;

  return (
    <PageLayout title="Peer Benchmarking" subtitle="FDIC call report comparison · performance quartiles · competitive positioning">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, maxWidth: 1200 }}>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Your Bank Metrics</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {[
                { k: 'institution_name',   l: 'Institution',       ph: 'First National Bank', full: true },
                { k: 'total_assets_b',     l: 'Total Assets ($B)', ph: '5.2' },
                { k: 'peer_region',        l: 'Peer Region',       ph: 'Southeast US' },
                { k: 'roe',               l: 'ROE (%)',           ph: '12.4' },
                { k: 'roa',               l: 'ROA (%)',           ph: '1.1' },
                { k: 'nim',               l: 'NIM (%)',           ph: '3.2' },
                { k: 'efficiency_ratio',   l: 'Efficiency Ratio (%)' ,ph: '58' },
                { k: 'tier1_capital_ratio',l: 'Tier 1 Capital (%)', ph: '13.4' },
                { k: 'npa_ratio',         l: 'NPA Ratio (%)',     ph: '1.8' },
                { k: 'loan_to_deposit',   l: 'Loan-to-Deposit (%)', ph: '82' },
                { k: 'cost_of_funds',     l: 'Cost of Funds (%)', ph: '2.1' },
              ].map(f => (
                <div key={f.k} style={f.full ? { gridColumn: '1 / -1' } : {}}>
                  <label style={lbl}>{f.l}</label>
                  <input type={f.k === 'institution_name' || f.k === 'peer_region' ? 'text' : 'number'} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
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
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Benchmarking...</> : <><Zap size={14} /> Run Benchmark</>}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Peer Comparison</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <BarChart2 size={36} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Enter your bank's metrics to compare against peer institutions</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Running peer comparison...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: meta.bg, border: `1px solid ${meta.color}30`, borderRadius: 10, marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: meta.color, fontFamily: 'var(--font-display)' }}>{meta.label}</div>
                    <div style={{ fontSize: 11, color: meta.color, marginTop: 2 }}>{meta.pct} percentile among peers</div>
                  </div>
                  {result.peer_group && (
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 2 }}>Peer Group</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{result.peer_group}</div>
                    </div>
                  )}
                </div>

                {result.metrics?.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 60px', gap: 0, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px 8px 0 0', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Metric', 'Your Bank', 'Peer Median', 'Top Quartile', ''].map(h => (
                        <div key={h} style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{h}</div>
                      ))}
                    </div>
                    {result.metrics.map((m, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 60px', gap: 0, padding: '9px 12px', background: i % 2 === 0 ? '#fff' : 'var(--bg3)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid rgba(255,255,255,0.07)', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text)' }}>{m.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: statusColor(m.status), fontFamily: 'var(--mono)' }}>{m.bank_value}{m.unit}</span>
                        <span style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>{m.peer_median}{m.unit}</span>
                        <span style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--mono)' }}>{m.top_quartile}{m.unit}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{statusIcon(m.status)}<span style={{ fontSize: 10, color: statusColor(m.status), fontWeight: 600 }}>{m.status}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  {result.strengths?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Strengths</div>
                      {result.strengths.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          <TrendingUp size={11} color="var(--green)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 11.5, color: '#94A3B8' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.weaknesses?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Areas to Improve</div>
                      {result.weaknesses.map((w, i) => (
                        <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          <TrendingDown size={11} color="var(--red)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 11.5, color: '#94A3B8' }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
