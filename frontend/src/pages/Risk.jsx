import { useState } from 'react';
import { Activity, Zap, TrendingDown, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { analyzeRisk } from '../services/api';
import { MOCK_RISK_FORM, MOCK_RISK_RESULT } from '../data/mockBank';

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 11 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase' }}>{label}</label>
      {hint && <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const inputStyle = (focused) => ({
  width: '100%',
  background: focused ? 'var(--bg3)' : 'var(--bg)',
  border: `1px solid ${focused ? 'var(--orange)' : 'var(--border)'}`,
  borderRadius: 7, padding: '8px 12px',
  color: 'var(--text)', fontSize: 13,
  fontFamily: 'var(--mono)', outline: 'none', transition: 'all 0.15s',
});

const fmtPct = v => v != null ? `${Number(v).toFixed(2)}%` : 'N/A';
const fmtScore = v => v != null ? Number(v).toFixed(1) : 'N/A';

// Scenario key from backend stress_results array → display name
const SCENARIO_META = [
  { key: 'mild_recession',       label: 'Mild Recession',         color: 'var(--amber)' },
  { key: 'severe_recession',     label: 'Severe Recession',       color: 'var(--red)' },
  { key: 'interest_rate_shock',  label: 'Rate Shock (+300bps)',   color: 'var(--orange)' },
  { key: 'cyber_attack',         label: 'Cyber Attack',           color: 'var(--indigo)' },
];

const FIELDS = [
  { key: 'total_assets',          label: 'Total Assets',          placeholder: '5000000000' },
  { key: 'loan_portfolio',        label: 'Loan Portfolio',        placeholder: '3000000000' },
  { key: 'npa_amount',            label: 'Non-Performing Assets', placeholder: '210000000' },
  { key: 'tier1_capital',         label: 'Tier 1 Capital',        placeholder: '400000000' },
  { key: 'total_capital',         label: 'Total Capital',         placeholder: '500000000' },
  { key: 'cash_reserves',         label: 'Cash Reserves',         placeholder: '300000000' },
  { key: 'investment_securities', label: 'Investment Securities', placeholder: '800000000' },
  { key: 'total_deposits',        label: 'Total Deposits',        placeholder: '4000000000' },
];

const RatioRow = ({ label, value, threshold, higherBad }) => {
  const num = parseFloat(value);
  const bad = higherBad ? num > threshold : num < threshold;
  const color = isNaN(num) ? 'var(--text3)' : bad ? 'var(--red)' : 'var(--green)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <span style={{ fontSize: 12, color: '#94A3B8' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 500, color }}>{fmtPct(value)}</span>
        {!isNaN(num) && (
          bad
            ? <AlertTriangle size={11} color="var(--red)" />
            : <CheckCircle size={11} color="var(--green)" />
        )}
      </div>
    </div>
  );
};

const StressCard = ({ data, index }) => {
  const meta = SCENARIO_META[index] || { label: 'Scenario', color: '#475569' };
  // backend returns { scenario, description, stressed_metrics:{}, regulatory_breaches:[], passed }
  const breaches = data?.regulatory_breaches || [];
  const pass = data?.passed ?? breaches.length === 0;
  const metrics = data?.stressed_metrics || {};
  return (
    <div style={{
      background: 'var(--bg2)', border: `1px solid ${pass ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)'}`,
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', animation: 'fade-in 0.35s ease forwards',
    }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8, background: `${meta.color}10` }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--text)', flex: 1 }}>{meta.label}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', padding: '2px 7px', borderRadius: 4,
          background: pass ? 'var(--green-dim)' : 'var(--red-dim)',
          color: pass ? 'var(--green)' : 'var(--red)',
          border: `1px solid ${pass ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
        }}>{pass ? 'PASS' : 'FAIL'}</span>
      </div>
      <div style={{ padding: '10px 14px' }}>
        {/* stressed_metrics: npa_ratio, tier1_capital_ratio, liquidity_ratio */}
        {Object.entries(metrics).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ color: '#475569' }}>{k.replace(/_/g, ' ')}</span>
            <span style={{ fontFamily: 'var(--mono)', color: '#94A3B8' }}>{Number(v).toFixed(2)}%</span>
          </div>
        ))}
        {data?.description && (
          <div style={{ fontSize: 10.5, color: '#475569', marginTop: 6, lineHeight: 1.5 }}>{data.description}</div>
        )}
        {breaches.length > 0 && (
          <div style={{ marginTop: 7, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
            {breaches.map((b, i) => (
              <div key={i} style={{ fontSize: 10.5, color: 'var(--red)', padding: '2px 0', display: 'flex', gap: 5, lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0 }}>⚠</span><span>{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Risk() {
  const [form, setForm] = useState({ ...Object.fromEntries(FIELDS.map(f => [f.key, ''])), ...MOCK_RISK_FORM });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(MOCK_RISK_RESULT);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Map frontend keys → Portfolio fields backend expects
      const payload = {
        total_assets:          parseFloat(form.total_assets) || 0,
        loan_portfolio:        parseFloat(form.loan_portfolio) || 0,
        npa_amount:            parseFloat(form.npa_amount) || 0,
        tier1_capital:         parseFloat(form.tier1_capital) || 0,
        total_capital:         parseFloat(form.total_capital) || 0,
        cash_reserves:         parseFloat(form.cash_reserves) || 0,
        investment_securities: parseFloat(form.investment_securities) || 0,
        total_deposits:        parseFloat(form.total_deposits) || 0,
      };
      const data = await analyzeRisk(payload);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result?.risk_score?.rating === 'Low' ? 'var(--green)'
    : result?.risk_score?.rating === 'Medium' ? 'var(--amber)'
    : result?.risk_score?.rating === 'High' ? 'var(--orange)'
    : 'var(--red)';

  return (
    <PageLayout title="Risk Management" subtitle="Portfolio stress testing · 4 AI scenarios · LangGraph agent">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, maxWidth: 1200 }}>

        {/* Input */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="var(--orange)" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Portfolio Data</span>
          </div>
          <div style={{ padding: 16 }}>
            {FIELDS.map(({ key, label, placeholder }) => (
              <Field key={key} label={label} hint="$">
                <input
                  type="number"
                  value={form[key]}
                  placeholder={placeholder}
                  onChange={e => set(key, e.target.value)}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                  style={inputStyle(focused === key)}
                />
              </Field>
            ))}
            <button onClick={submit} disabled={loading} style={{
              width: '100%', padding: '11px',
              background: loading ? 'var(--bg4)' : 'var(--orange)',
              color: loading ? 'var(--text3)' : '#000',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'var(--font-display)', transition: 'all 0.15s', marginTop: 6,
            }}>
              {loading
                ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Running scenarios...</>
                : <><Zap size={14} /> Run 4 Stress Scenarios</>
              }
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!result && !loading && !error && (
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#475569', minHeight: 280, justifyContent: 'center' }}>
              <Activity size={36} strokeWidth={1} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8', marginBottom: 4 }}>Enter portfolio data to run stress tests</div>
                <div style={{ fontSize: 12 }}>Mild recession · Severe recession · Rate shock · Cyber attack</div>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 280 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--orange)', animation: 'spin 0.9s linear infinite' }} />
              <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Simulating 4 stress scenarios...</div>
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-xl)', padding: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <XCircle size={18} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 4 }}>Risk analysis failed</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{error}</div>
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Top row: risk score + ratios */}
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12 }}>

                {/* Risk score */}
                <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase' }}>Risk Score</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, color: riskColor, lineHeight: 1 }}>
                    {fmtScore(result.risk_score?.score)}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569' }}>/100</div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '1px', padding: '3px 12px', borderRadius: 20,
                    background: `${riskColor}18`, color: riskColor, border: `1px solid ${riskColor}30`,
                  }}>
                    {result.risk_score?.rating?.toUpperCase() || 'N/A'} RISK
                  </div>
                </div>

                {/* Ratios */}
                <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>Portfolio Ratios</div>
                  {result.ratios && <>
                    <RatioRow label="NPA Ratio"           value={result.ratios.npa_ratio}           threshold={5}  higherBad />
                    <RatioRow label="Tier 1 Capital"      value={result.ratios.tier1_capital_ratio} threshold={8}  higherBad={false} />
                    <RatioRow label="Total Capital Ratio" value={result.ratios.total_capital_ratio} threshold={10} higherBad={false} />
                    <RatioRow label="Liquidity Ratio"     value={result.ratios.liquidity_ratio}     threshold={20} higherBad={false} />
                    <RatioRow label="Loan/Deposit Ratio"  value={result.ratios.loan_to_deposit_ratio} threshold={85} higherBad />
                  </>}
                </div>
              </div>

              {/* Stress scenarios 2x2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(result.stress_tests || []).map((s, i) => (
                  <StressCard key={i} data={s} index={i} />
                ))}
              </div>

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '14px 18px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 10 }}>Recommendations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {result.recommendations.map((r, i) => {
                      const pcolor = r.priority === 'High' ? 'var(--red)' : r.priority === 'Medium' ? 'var(--amber)' : 'var(--green)';
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 7, borderLeft: `3px solid ${pcolor}` }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: pcolor, letterSpacing: '0.6px', minWidth: 40 }}>{r.priority?.toUpperCase()}</span>
                          <span style={{ fontSize: 12.5, color: '#94A3B8' }}>{r.action}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Explanation */}
              {result.explanation && (
                <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '14px 18px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>AI Risk Analysis</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.explanation}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}