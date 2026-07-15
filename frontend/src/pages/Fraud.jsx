import { useState } from 'react';
import { Shield, Zap, AlertTriangle, CheckCircle, XCircle, ChevronRight, BarChart2, Clock, MapPin, Hash } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { analyzeFraud } from '../services/api';
import { MOCK_FRAUD_FORM, MOCK_FRAUD_RESULT } from '../data/mockBank';

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase' }}>
        {label}
      </label>
      {hint && <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const inputStyle = (focused) => ({
  width: '100%',
  background: focused ? 'var(--bg3)' : 'var(--bg)',
  border: `1px solid ${focused ? 'var(--cyan)' : 'var(--border)'}`,
  borderRadius: 7,
  padding: '9px 12px',
  color: 'var(--text)',
  fontSize: 13,
  fontFamily: 'var(--mono)',
  outline: 'none',
  transition: 'all 0.15s',
  boxShadow: focused ? '0 0 0 2px var(--cyan-glow)' : 'none',
});

const selectStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 7,
  padding: '9px 12px',
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--mono)',
};

const RiskMeter = ({ score }) => {
  const color = score >= 75 ? 'var(--red)' : score >= 45 ? 'var(--amber)' : 'var(--green)';
  const label = score >= 75 ? 'HIGH RISK' : score >= 45 ? 'MEDIUM RISK' : 'LOW RISK';
  const sectors = Array.from({ length: 20 }, (_, i) => i * 5);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0 16px' }}>
      <div style={{ position: 'relative', width: 160, height: 80, overflow: 'hidden' }}>
        <svg width="160" height="80" viewBox="0 0 160 80">
          <path d="M10 75 A70 70 0 0 1 150 75" fill="none" stroke="var(--bg4)" strokeWidth="12" strokeLinecap="round" />
          <path
            d="M10 75 A70 70 0 0 1 150 75"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${score * 2.2} 220`}
            style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 30,
            color: color,
            lineHeight: 1,
            transition: 'color 0.5s',
          }}>{score}</div>
          <div style={{ fontSize: 9, color: '#475569', letterSpacing: '1px' }}>/100</div>
        </div>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
        padding: '4px 14px', borderRadius: 20,
        background: `${color}18`, color: color,
        border: `1px solid ${color}30`,
      }}>{label}</div>
    </div>
  );
};

const Factor = ({ label, impact, direction }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  }}>
    <div style={{
      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
      background: direction === 'up' ? 'var(--red)' : 'var(--green)',
    }} />
    <span style={{ flex: 1, fontSize: 12, color: '#94A3B8' }}>{label}</span>
    <span style={{
      fontSize: 11, fontFamily: 'var(--mono)',
      color: direction === 'up' ? 'var(--red)' : 'var(--green)',
    }}>
      {direction === 'up' ? '↑' : '↓'} {impact}
    </span>
  </div>
);

export default function Fraud() {
  const [form, setForm] = useState(MOCK_FRAUD_FORM);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(MOCK_FRAUD_RESULT);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeFraud({
        amount: parseFloat(form.amount),
        hour_of_day: parseInt(form.hour),
        transactions_last_24h: parseInt(form.tx24h),
        avg_amount_last_7d: parseFloat(form.avgAmount),
        distance_from_home_km: parseFloat(form.distance),
        is_foreign: parseInt(form.foreign),
        is_same_city: parseInt(form.sameCity),
      });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Fraud Intelligence" subtitle="Real-time transaction risk scoring · AI velocity & behavior analysis">
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 14, maxWidth: 1100 }}>

        {/* Input Panel */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Shield size={14} color="var(--cyan)" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
              Transaction Analysis
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '0.6px',
              background: 'var(--indigo-dim)', color: 'var(--indigo)',
              border: '1px solid rgba(129,140,248,0.2)', padding: '1px 7px', borderRadius: 4,
            }}>AI MODEL v2.1</span>
          </div>
          <div style={{ padding: 18 }}>
            <Field label="Transaction Amount" hint="USD">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 13 }}>$</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  onFocus={() => setFocused('amount')}
                  onBlur={() => setFocused(null)}
                  style={{ ...inputStyle(focused === 'amount'), paddingLeft: 24 }}
                />
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Hour of Day" hint="0–23">
                <input type="number" min={0} max={23} value={form.hour}
                  onChange={e => set('hour', e.target.value)}
                  onFocus={() => setFocused('hour')} onBlur={() => setFocused(null)}
                  style={inputStyle(focused === 'hour')} />
              </Field>
              <Field label="Tx in 24h">
                <input type="number" value={form.tx24h}
                  onChange={e => set('tx24h', e.target.value)}
                  onFocus={() => setFocused('tx24h')} onBlur={() => setFocused(null)}
                  style={inputStyle(focused === 'tx24h')} />
              </Field>
            </div>

            <Field label="Avg Amount (7d)" hint="USD">
              <input type="number" value={form.avgAmount}
                onChange={e => set('avgAmount', e.target.value)}
                onFocus={() => setFocused('avg')} onBlur={() => setFocused(null)}
                style={inputStyle(focused === 'avg')} />
            </Field>

            <Field label="Distance from Home" hint="km">
              <input type="number" value={form.distance}
                onChange={e => set('distance', e.target.value)}
                onFocus={() => setFocused('dist')} onBlur={() => setFocused(null)}
                style={inputStyle(focused === 'dist')} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Origin">
                <select value={form.foreign} onChange={e => set('foreign', e.target.value)} style={selectStyle}>
                  <option value="0">Domestic</option>
                  <option value="1">Foreign</option>
                </select>
              </Field>
              <Field label="Same City">
                <select value={form.sameCity} onChange={e => set('sameCity', e.target.value)} style={selectStyle}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </Field>
            </div>

            {/* Risk preview */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 14,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              {[
                { icon: Hash,    val: `$${Number(form.amount).toLocaleString()}`, label: 'amount' },
                { icon: Clock,   val: `${form.hour}:00`,   label: 'hour' },
                { icon: MapPin,  val: `${form.distance}km`, label: 'dist' },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon size={10} color="var(--text3)" />
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: '#94A3B8' }}>{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={submit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: loading ? 'var(--bg4)' : 'var(--cyan)',
                color: loading ? 'var(--text3)' : '#000',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.2px',
                transition: 'all 0.15s',
              }}
            >
              {loading ? (
                <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</>
              ) : (
                <><Zap size={14} /> Run Fraud Analysis</>
              )}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>AI Risk Assessment</span>
          </div>

          {!result && !loading && !error && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: 40, color: '#475569',
            }}>
              <Shield size={36} strokeWidth={1} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8', marginBottom: 4 }}>No transaction submitted</div>
                <div style={{ fontSize: 12 }}>Fill in transaction details and run analysis to see the full AI risk report</div>
              </div>
            </div>
          )}

          {loading && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '2px solid var(--border)',
                borderTop: '2px solid var(--cyan)',
                animation: 'spin 0.9s linear infinite',
              }} />
              <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>
                Running behavioral model...
              </div>
            </div>
          )}

          {error && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: 32, color: 'var(--red)',
            }}>
              <XCircle size={32} strokeWidth={1.5} />
              <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>{error}</div>
            </div>
          )}

          {result && !loading && (
            <div style={{ padding: 18, animation: 'fade-in 0.4s ease forwards' }}>
              <RiskMeter score={Math.round((result.fraud_score ?? 0) * 100)} />

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16,
              }}>
                {[
                  { label: 'Decision', value: result.recommendation || (result.is_fraud ? 'BLOCK' : 'APPROVE'), color: result.is_fraud ? 'var(--red)' : 'var(--green)' },
                  { label: 'Confidence', value: `${((result.fraud_score ?? 0) * 100).toFixed(1)}%`, color: 'var(--text)' },
                  { label: 'Model', value: result.model || 'RF v2.1', color: 'var(--indigo)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '10px 12px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color, fontFamily: 'var(--mono)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {result.factors && result.factors.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>
                    Risk Factors
                  </div>
                  {result.factors.map((f, i) => (
                    <Factor key={i} label={f.label || f.name} impact={f.impact} direction={f.direction || (f.weight > 0 ? 'up' : 'down')} />
                  ))}
                </div>
              )}

              {result.explanation && (
                <div style={{
                  marginTop: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>AI Explanation</div>
                  <div style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.6 }}>{result.explanation}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}