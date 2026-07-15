import { useState } from 'react';
import { TrendingUp, Droplets, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import TabBar from '../components/ui/TabBar';
import { analyzeInterestRate, analyzeLCR } from '../services/api';
import { MOCK_IRR_FORM, MOCK_IRR_RESULT, MOCK_LCR_FORM, MOCK_LCR_RESULT } from '../data/mockBank';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
const riskColor = r => r === 'HIGH' ? 'var(--red)' : r === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
const riskBg    = r => r === 'HIGH' ? 'var(--red-dim)' : r === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';


function IRRContent() {
  const [form, setForm] = useState(MOCK_IRR_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_IRR_RESULT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => { setLoading(true); setResult(null); try { setResult(await analyzeInterestRate(form)); } catch (e) { setResult({ error: e.message }); } finally { setLoading(false); } };

  const fields = [
    ['total_assets', 'Total Assets ($M)', '5200'], ['rate_sensitive_assets', 'Rate-Sensitive Assets ($M)', '2800'],
    ['rate_sensitive_liabilities', 'Rate-Sensitive Liabilities ($M)', '3100'], ['current_nim', 'Current NIM (%)', '3.2'],
    ['fixed_rate_loans_pct', 'Fixed Rate Loans (%)', '55'], ['variable_rate_loans_pct', 'Variable Rate Loans (%)', '45'],
    ['avg_asset_duration', 'Asset Duration (yrs)', '4.2'], ['avg_liability_duration', 'Liability Duration (yrs)', '2.8'],
    ['current_fed_rate', 'Fed Funds Rate (%)', '5.25'],
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, maxWidth: 1100 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={14} color="var(--cyan)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>ALM Inputs</span>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {fields.map(([k, l, ph]) => (
              <div key={k}><label style={lbl}>{l}</label><input type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} style={inp} /></div>
            ))}
          </div>
          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '10px', marginTop: 12, background: loading ? 'var(--bg4)' : 'var(--cyan)', color: loading ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
            {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</> : <><Zap size={14} /> Run ALM Analysis</>}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Rate Risk Analysis</span>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><TrendingUp size={36} strokeWidth={1} /><div style={{ fontSize: 12 }}>Enter ALM data to analyze interest rate risk</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Running ALM analysis...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { l: 'Repricing Risk', v: result.repricing_risk || '—', c: riskColor(result.repricing_risk), bg: riskBg(result.repricing_risk) },
                  { l: 'NIM Current',    v: result.nim_current != null ? `${result.nim_current}%` : '—',   c: 'var(--cyan)', bg: 'var(--bg3)' },
                  { l: 'NIM Stressed',   v: result.nim_stressed != null ? `${result.nim_stressed}%` : '—', c: 'var(--amber)', bg: 'var(--bg3)' },
                  { l: 'Duration Gap',   v: result.duration_gap != null ? `${result.duration_gap}y` : '—',  c: 'var(--text)', bg: 'var(--bg3)' },
                ].map(({ l, v, c, bg }) => (
                  <div key={l} style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { l: 'Earnings at Risk', v: result.earnings_at_risk != null ? `$${result.earnings_at_risk}M` : '—' },
                  { l: 'EVE at Risk',      v: result.economic_value_at_risk != null ? `$${result.economic_value_at_risk}M` : '—' },
                ].map(({ l, v }) => (
                  <div key={l} style={{ background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
              {result.scenarios?.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Rate Shock Scenarios</div>{result.scenarios.map((s, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cyan)', fontFamily: 'var(--mono)', minWidth: 80 }}>{s.shock}</span><span style={{ fontSize: 11, fontWeight: 700, color: s.nim_impact < 0 ? 'var(--red)' : 'var(--green)', fontFamily: 'var(--mono)', minWidth: 55 }}>{s.nim_impact > 0 ? '+' : ''}{s.nim_impact}bps</span><span style={{ fontSize: 11.5, color: '#94A3B8', flex: 1 }}>{s.commentary}</span></div>)}</div>}
              {result.recommendations?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Recommendations</div>{result.recommendations.map((r, i) => <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><CheckCircle size={11} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{r}</span></div>)}</div>}
              {result.summary && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>AI Assessment</div><div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{result.summary}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LCRContent() {
  const [form, setForm] = useState({ level1_hqla: MOCK_LCR_FORM.hqla_l1, level2a_hqla: MOCK_LCR_FORM.hqla_l2a, level2b_hqla: MOCK_LCR_FORM.hqla_l2b, retail_outflows: MOCK_LCR_FORM.retail_outflows, wholesale_outflows: MOCK_LCR_FORM.wholesale_outflows, secured_outflows: MOCK_LCR_FORM.secured_outflows, retail_inflows: MOCK_LCR_FORM.retail_inflows, wholesale_inflows: MOCK_LCR_FORM.wholesale_inflows });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_LCR_RESULT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => { setLoading(true); setResult(null); try { setResult(await analyzeLCR(form)); } catch (e) { setResult({ error: e.message }); } finally { setLoading(false); } };

  const statusMeta = { COMPLIANT: { color: 'var(--green)', bg: 'var(--green-dim)', icon: CheckCircle }, AT_RISK: { color: 'var(--amber)', bg: 'var(--amber-dim)', icon: AlertTriangle }, NON_COMPLIANT: { color: 'var(--red)', bg: 'var(--red-dim)', icon: XCircle } };
  const meta = statusMeta[result?.status] || statusMeta.AT_RISK;
  const StatusIcon = meta.icon;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, maxWidth: 1100 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Droplets size={14} color="var(--cyan)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Liquidity Inputs ($M)</span>
        </div>
        <div style={{ padding: 14 }}>
          {[['HQLA', 'var(--green)'], ['30-Day Outflows', 'var(--red)'], ['30-Day Inflows', 'var(--green)']].map(([title, color], si) => {
            const sections = [
              [['level1_hqla', 'Level 1 (0% haircut)', '1200'], ['level2a_hqla', 'Level 2A (15%)', '400'], ['level2b_hqla', 'Level 2B (25-50%)', '180']],
              [['retail_outflows', 'Retail Deposits', '320'], ['wholesale_outflows', 'Wholesale', '580'], ['secured_outflows', 'Secured Funding', '140']],
              [['retail_inflows', 'Retail Inflows', '85'], ['wholesale_inflows', 'Wholesale Inflows', '120']],
            ];
            return (
              <div key={title}>
                <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7, marginTop: si > 0 ? 14 : 0 }}>{title}</div>
                {sections[si].map(([k, l, ph]) => <div key={k} style={{ marginBottom: 8 }}><label style={lbl}>{l}</label><input type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} style={inp} /></div>)}
              </div>
            );
          })}
          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '10px', marginTop: 10, background: loading ? 'var(--bg4)' : 'var(--cyan)', color: loading ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
            {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Calculating...</> : <><Zap size={14} /> Calculate LCR</>}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Droplets size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Liquidity Analysis</span>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><Droplets size={36} strokeWidth={1} /><div style={{ fontSize: 12 }}>Enter HQLA and outflow data to calculate Basel III LCR</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Computing liquidity ratios...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: meta.bg, border: `1px solid ${meta.color}30`, borderRadius: 10, marginBottom: 16 }}>
                <StatusIcon size={24} color={meta.color} />
                <div><div style={{ fontSize: 18, fontWeight: 700, color: meta.color, fontFamily: 'var(--mono)' }}>{result.lcr_ratio != null ? `${result.lcr_ratio}%` : '—'}</div><div style={{ fontSize: 11, color: meta.color, fontWeight: 600, marginTop: 1 }}>{result.status?.replace(/_/g, ' ')} · Min: 100%</div></div>
                {result.stress_lcr != null && <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Stress LCR</div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{result.stress_lcr}%</div></div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { l: 'Total HQLA',       v: result.hqla_total != null ? `$${result.hqla_total}M` : '—',           c: 'var(--green)' },
                  { l: 'Net Outflows 30d', v: result.net_outflows_30d != null ? `$${result.net_outflows_30d}M` : '—', c: 'var(--red)'   },
                  { l: 'Buffer Surplus',   v: result.buffer_surplus != null ? `$${result.buffer_surplus}M` : '—',    c: (result.buffer_surplus || 0) >= 0 ? 'var(--green)' : 'var(--red)' },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
              {result.recommendations?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Recommendations</div>{result.recommendations.map((r, i) => <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><CheckCircle size={11} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{r}</span></div>)}</div>}
              {result.summary && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>AI Assessment</div><div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{result.summary}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Treasury() {
  const [tab, setTab] = useState('irr');
  const TABS = [
    { id: 'irr', label: 'Interest Rate Risk', icon: TrendingUp },
    { id: 'lcr', label: 'LCR Dashboard',      icon: Droplets  },
  ];
  return (
    <PageLayout title="Treasury" subtitle="ALM · interest rate risk · Basel III liquidity coverage ratio">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'irr' && <IRRContent />}
      {tab === 'lcr' && <LCRContent />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
