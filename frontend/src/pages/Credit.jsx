import { useState } from 'react';
import { CreditCard, Zap, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { scoreCredit } from '../services/api';

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

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase' }}>{label}</label>
      {hint && <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const ScoreBand = ({ score, max = 850 }) => {
  const pct = (score / max) * 100;
  const color = score >= 750 ? 'var(--green)' : score >= 650 ? 'var(--amber)' : score >= 550 ? 'var(--orange)' : 'var(--red)';
  const band = score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : score >= 550 ? 'Fair' : 'Poor';
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Credit score · {band}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#475569' }}>Range</div>
          <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: '#94A3B8' }}>300 – 850</div>
        </div>
      </div>
      <div style={{
        height: 6, background: 'linear-gradient(90deg, var(--red) 0%, var(--orange) 33%, var(--amber) 55%, var(--green) 80%)',
        borderRadius: 10, position: 'relative', overflow: 'visible',
      }}>
        <div style={{
          position: 'absolute',
          left: `${((score - 300) / 550) * 100}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 14, height: 14,
          background: color,
          borderRadius: '50%',
          border: '2px solid var(--bg)',
          boxShadow: `0 0 0 3px ${color}40`,
          transition: 'all 0.6s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: '#475569', fontFamily: 'var(--mono)' }}>300</span>
        <span style={{ fontSize: 9, color: '#475569', fontFamily: 'var(--mono)' }}>850</span>
      </div>
    </div>
  );
};

export default function Credit() {
  const [form, setForm] = useState({
    age: '', income: '', loanAmount: '', creditScore: '',
    employmentYears: '', existingLoans: '', missedPayments: '', dti: '',
  });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inp = (key, type = 'number') => ({
    type,
    value: form[key],
    onChange: e => set(key, e.target.value),
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(null),
    style: inputStyle(focused === key),
  });

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await scoreCredit({
        age: parseInt(form.age),
        annual_income: parseFloat(form.income),
        loan_amount: parseFloat(form.loanAmount),
        credit_score: parseInt(form.creditScore),
        employment_years: parseFloat(form.employmentYears),
        existing_loans: parseInt(form.existingLoans),
        missed_payments: parseInt(form.missedPayments),
        debt_to_income: parseFloat(form.dti),
      });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const approved = result?.decision === 'APPROVED' || result?.approved === true;

  return (
    <PageLayout title="Credit Scoring" subtitle="AI-powered loan underwriting · LangGraph decision agent">
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 14, maxWidth: 1100 }}>

        {/* Form */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={14} color="var(--green)" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Loan Application</span>
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Age"><input {...inp('age')} placeholder="35" /></Field>
              <Field label="Employment Yrs"><input {...inp('employmentYears')} placeholder="5" /></Field>
            </div>
            <Field label="Annual Income" hint="$"><input {...inp('income')} placeholder="75000" /></Field>
            <Field label="Loan Amount Requested" hint="$"><input {...inp('loanAmount')} placeholder="250000" /></Field>
            <Field label="Credit Score"><input {...inp('creditScore')} placeholder="720" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Existing Loans"><input {...inp('existingLoans')} placeholder="1" /></Field>
              <Field label="Missed Payments"><input {...inp('missedPayments')} placeholder="0" /></Field>
            </div>
            <Field label="Debt-to-Income Ratio" hint="0–1"><input {...inp('dti')} placeholder="0.28" /></Field>

            <button
              onClick={submit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: loading ? 'var(--bg4)' : 'var(--green)',
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
                transition: 'all 0.15s',
                marginTop: 4,
              }}
            >
              {loading ? '● Evaluating...' : <><Zap size={14} /> Evaluate Application</>}
            </button>
          </div>
        </div>

        {/* Result */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>AI Credit Decision</span>
          </div>

          {!result && !loading && !error && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40, color: '#475569' }}>
              <CreditCard size={36} strokeWidth={1} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8', marginBottom: 4 }}>Submit a loan application</div>
                <div style={{ fontSize: 12 }}>The AI agent will evaluate creditworthiness across 8 financial dimensions</div>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--green)', animation: 'spin 0.9s linear infinite' }} />
              <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Running underwriting model...</div>
            </div>
          )}

          {error && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32, color: 'var(--red)' }}>
              <XCircle size={32} strokeWidth={1.5} />
              <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>{error}</div>
            </div>
          )}

          {result && !loading && (
            <div style={{ padding: 20, animation: 'fade-in 0.4s ease forwards' }}>
              {/* Decision banner */}
              <div style={{
                background: approved ? 'var(--green-dim)' : 'var(--red-dim)',
                border: `1px solid ${approved ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
                {approved
                  ? <CheckCircle size={24} color="var(--green)" strokeWidth={1.75} />
                  : <XCircle size={24} color="var(--red)" strokeWidth={1.75} />
                }
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 18,
                    color: approved ? 'var(--green)' : 'var(--red)',
                    letterSpacing: '-0.3px',
                  }}>
                    {result.decision || (approved ? 'APPROVED' : 'DECLINED')}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#475569', marginTop: 2 }}>
                    {result.reason || (approved ? 'Application meets all underwriting criteria' : 'Does not meet minimum lending standards')}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#475569' }}>Confidence</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                    {((result.approval_score ?? 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Credit score */}
              {result.credit_score && <ScoreBand score={result.credit_score} />}

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Max Loan', value: result.suggested_limit ? `$${Number(result.suggested_limit).toLocaleString()}` : 'N/A', color: 'var(--green)' },
                  { label: 'Suggested Rate', value: result.interest_rate ? `${result.interest_rate}%` : 'N/A', color: 'var(--cyan)' },
                  { label: 'Risk Band', value: result.risk_band || 'N/A', color: 'var(--amber)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color, fontFamily: 'var(--mono)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Analysis */}
              {result.explanation && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>AI Analysis</div>
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