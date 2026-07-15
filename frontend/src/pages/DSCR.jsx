import { useState } from 'react';
import { Calculator, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { calculateDSCR } from '../services/api';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

const dscrRatingMeta = {
  STRONG:       { color: 'var(--green)', bg: 'var(--green-dim)' },
  ADEQUATE:     { color: 'var(--cyan)',  bg: 'var(--cyan-dim)'  },
  MARGINAL:     { color: 'var(--amber)', bg: 'var(--amber-dim)' },
  INSUFFICIENT: { color: 'var(--red)',   bg: 'var(--red-dim)'   },
};

const recMeta = {
  APPROVE:     { color: 'var(--green)', bg: 'var(--green-dim)', icon: CheckCircle },
  CONDITIONAL: { color: 'var(--amber)', bg: 'var(--amber-dim)', icon: AlertTriangle },
  DECLINE:     { color: 'var(--red)',   bg: 'var(--red-dim)',   icon: XCircle },
};

export default function DSCR() {
  const [form, setForm] = useState({
    property_type: '', property_value: '', loan_amount: '', loan_term_years: '',
    interest_rate: '', gross_rental_income: '', vacancy_rate: '', operating_expenses: '',
    borrower_name: '', loan_purpose: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await calculateDSCR(form)); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const rMeta = dscrRatingMeta[result?.dscr_rating] || dscrRatingMeta.MARGINAL;
  const recM  = recMeta[result?.recommendation] || recMeta.CONDITIONAL;
  const RecIcon = recM.icon;

  return (
    <PageLayout title="DSCR Calculator" subtitle="Commercial loan underwriting · debt service coverage · LTV · yield analysis">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, maxWidth: 1100 }}>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Loan & Property Data</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {[
                { k: 'borrower_name',       l: 'Borrower',           ph: 'Apex RE Holdings', full: true },
                { k: 'property_type',       l: 'Property Type',      ph: 'Office / Retail / Multifamily' },
                { k: 'loan_purpose',        l: 'Loan Purpose',       ph: 'Acquisition' },
                { k: 'property_value',      l: 'Property Value ($M)',ph: '12.5' },
                { k: 'loan_amount',         l: 'Loan Amount ($M)',   ph: '8.75' },
                { k: 'interest_rate',       l: 'Interest Rate (%)',  ph: '7.25' },
                { k: 'loan_term_years',     l: 'Loan Term (yrs)',    ph: '10' },
                { k: 'gross_rental_income', l: 'Gross Income ($M/yr)',ph: '1.4' },
                { k: 'vacancy_rate',        l: 'Vacancy Rate (%)',   ph: '8' },
                { k: 'operating_expenses',  l: 'Operating Exp ($M/yr)',ph: '0.42' },
              ].map(f => (
                <div key={f.k} style={f.full ? { gridColumn: '1 / -1' } : {}}>
                  <label style={lbl}>{f.l}</label>
                  <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
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
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Underwriting...</> : <><Zap size={14} /> Calculate DSCR</>}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Underwriting Output</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <Calculator size={36} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Enter loan and property data for commercial underwriting analysis</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Running underwriting model...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                {/* Decision */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: recM.bg, border: `1px solid ${recM.color}30`, borderRadius: 10, marginBottom: 18 }}>
                  <RecIcon size={24} color={recM.color} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: recM.color, fontFamily: 'var(--mono)' }}>{result.recommendation || '—'}</div>
                    <div style={{ fontSize: 11, color: recM.color, fontWeight: 600, marginTop: 1 }}>
                      Max loan: {result.max_loan_amount ? `$${result.max_loan_amount}M` : '—'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 2 }}>DSCR Rating</div>
                    <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: rMeta.bg, color: rMeta.color }}>{result.dscr_rating || '—'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
                  {[
                    { l: 'DSCR',          v: result.dscr != null ? result.dscr.toFixed(2) + 'x' : '—', c: (result.dscr || 0) >= 1.25 ? 'var(--green)' : 'var(--red)' },
                    { l: 'LTV',           v: result.ltv != null ? `${result.ltv}%` : '—',              c: (result.ltv || 100) <= 75 ? 'var(--green)' : 'var(--amber)' },
                    { l: 'Debt Yield',    v: result.debt_yield != null ? `${result.debt_yield}%` : '—', c: 'var(--cyan)' },
                    { l: 'Loan Constant', v: result.loan_constant != null ? `${result.loan_constant}%` : '—', c: 'var(--text)' },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {result.conditions?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Conditions</div>
                    {result.conditions.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <AlertTriangle size={12} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result.risks?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Key Risks</div>
                    {result.risks.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <XCircle size={12} color="var(--red)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result.summary && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>Underwriter Notes</div>
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
