import { useState } from 'react';
import { CreditCard, Calculator, Zap, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import TabBar from '../components/ui/TabBar';
import { scoreCredit, calculateDSCR } from '../services/api';
import { MOCK_CREDIT_FORM, MOCK_CREDIT_RESULT, MOCK_DSCR_FORM, MOCK_DSCR_RESULT } from '../data/mockBank';

// ─── shared styles ──────────────────────────────────────────────────────────
const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--mono)' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4, fontFamily: 'var(--font)' };


// ─── Credit Underwriting ─────────────────────────────────────────────────────
const ScoreBand = ({ score }) => {
  const color = score >= 750 ? 'var(--green)' : score >= 650 ? 'var(--amber)' : 'var(--red)';
  const band  = score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : 'Poor';
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Credit Score · {band}</div>
        </div>
      </div>
      <div style={{ height: 6, background: 'linear-gradient(90deg, #DC2626 0%, #D97706 40%, #059669 80%)', borderRadius: 10, position: 'relative' }}>
        <div style={{ position: 'absolute', left: `${((score - 300) / 550) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 13, height: 13, background: color, borderRadius: '50%', border: '2px solid #fff', boxShadow: `0 0 0 3px ${color}40`, transition: 'left 0.6s ease' }} />
      </div>
    </div>
  );
};

function CreditContent() {
  const [form, setForm] = useState(MOCK_CREDIT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_CREDIT_RESULT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try {
      setResult(await scoreCredit({
        age: +form.age, annual_income: +form.income, loan_amount: +form.loanAmount,
        credit_score: +form.creditScore, employment_years: +form.employmentYears,
        existing_loans: +form.existingLoans, missed_payments: +form.missedPayments,
        debt_to_income: +form.dti,
      }));
    } catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const approved = result?.decision === 'APPROVED' || result?.approved === true;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 14, maxWidth: 1100 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={14} color="var(--green)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Loan Application</span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { k: 'age',             l: 'Age',              ph: '35' },
              { k: 'employmentYears', l: 'Employment Yrs',   ph: '5' },
            ].map(f => (
              <div key={f.k}><label style={lbl}>{f.l}</label><input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} /></div>
            ))}
          </div>
          {[
            { k: 'income',        l: 'Annual Income ($)',        ph: '75000' },
            { k: 'loanAmount',    l: 'Loan Amount ($)',          ph: '250000' },
            { k: 'creditScore',   l: 'Credit Score',            ph: '720' },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 10 }}><label style={lbl}>{f.l}</label><input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} /></div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { k: 'existingLoans',  l: 'Existing Loans',  ph: '1'    },
              { k: 'missedPayments', l: 'Missed Payments', ph: '0'    },
            ].map(f => (
              <div key={f.k}><label style={lbl}>{f.l}</label><input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} /></div>
            ))}
          </div>
          <div style={{ marginBottom: 10, marginTop: 10 }}><label style={lbl}>Debt-to-Income (0–1)</label><input type="number" value={form.dti} onChange={e => set('dti', e.target.value)} placeholder="0.28" style={inp} /></div>
          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '10px', marginTop: 4, background: loading ? 'var(--bg4)' : 'var(--green)', color: loading ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
            {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Evaluating...</> : <><Zap size={14} /> Evaluate Application</>}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>AI Credit Decision</span>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><CreditCard size={36} strokeWidth={1} /><div style={{ fontSize: 12 }}>Fill out the application to get an AI credit decision</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--green)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Running underwriting model...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: approved ? 'var(--green-dim)' : 'var(--red-dim)', border: `1px solid ${approved ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`, borderRadius: 10, marginBottom: 18 }}>
                {approved ? <CheckCircle size={24} color="var(--green)" /> : <XCircle size={24} color="var(--red)" />}
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: approved ? 'var(--green)' : 'var(--red)' }}>{result.decision || (approved ? 'APPROVED' : 'DECLINED')}</div>
                  <div style={{ fontSize: 11.5, color: '#475569', marginTop: 2 }}>{result.reason || ''}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#475569' }}>Confidence</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{((result.approval_score ?? 0) * 100).toFixed(1)}%</div>
                </div>
              </div>
              {result.credit_score && <ScoreBand score={result.credit_score} />}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { l: 'Max Loan',       v: result.suggested_limit ? `$${Number(result.suggested_limit).toLocaleString()}` : 'N/A', c: 'var(--green)' },
                  { l: 'Interest Rate',  v: result.interest_rate ? `${result.interest_rate}%` : 'N/A',                              c: 'var(--cyan)'  },
                  { l: 'Risk Band',      v: result.risk_band || 'N/A',                                                              c: 'var(--amber)' },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
              {result.explanation && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>AI Analysis</div><div style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.7 }}>{result.explanation}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DSCR Calculator ─────────────────────────────────────────────────────────
const recMeta = { APPROVE: { c: 'var(--green)', bg: 'var(--green-dim)', icon: CheckCircle }, CONDITIONAL: { c: 'var(--amber)', bg: 'var(--amber-dim)', icon: AlertTriangle }, DECLINE: { c: 'var(--red)', bg: 'var(--red-dim)', icon: XCircle } };

function DSCRContent() {
  const [form, setForm] = useState({ borrower_name: '', property_type: MOCK_DSCR_FORM.property_type, loan_purpose: '', property_value: MOCK_DSCR_FORM.property_value, loan_amount: MOCK_DSCR_FORM.loan_amount, interest_rate: MOCK_DSCR_FORM.interest_rate, loan_term_years: MOCK_DSCR_FORM.loan_term, gross_rental_income: '', vacancy_rate: MOCK_DSCR_FORM.occupancy_rate, operating_expenses: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_DSCR_RESULT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await calculateDSCR(form)); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const rm = recMeta[result?.recommendation] || recMeta.CONDITIONAL;
  const RecIcon = rm.icon;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, maxWidth: 1100 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calculator size={14} color="var(--cyan)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Loan & Property Data</span>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {[
              { k: 'borrower_name',       l: 'Borrower',           ph: 'Apex Holdings',    full: true },
              { k: 'property_type',       l: 'Property Type',      ph: 'Office' },
              { k: 'loan_purpose',        l: 'Purpose',            ph: 'Acquisition' },
              { k: 'property_value',      l: 'Value ($M)',         ph: '12.5' },
              { k: 'loan_amount',         l: 'Loan ($M)',          ph: '8.75' },
              { k: 'interest_rate',       l: 'Rate (%)',           ph: '7.25' },
              { k: 'loan_term_years',     l: 'Term (yrs)',         ph: '10' },
              { k: 'gross_rental_income', l: 'Gross Income ($M/yr)',ph: '1.4' },
              { k: 'vacancy_rate',        l: 'Vacancy (%)',        ph: '8' },
              { k: 'operating_expenses',  l: 'Opex ($M/yr)',       ph: '0.42' },
            ].map(f => (
              <div key={f.k} style={f.full ? { gridColumn: '1 / -1' } : {}}>
                <label style={lbl}>{f.l}</label>
                <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
              </div>
            ))}
          </div>
          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '10px', marginTop: 12, background: loading ? 'var(--bg4)' : 'var(--cyan)', color: loading ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
            {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Underwriting...</> : <><Zap size={14} /> Calculate DSCR</>}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calculator size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Underwriting Output</span>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><Calculator size={36} strokeWidth={1} /><div style={{ fontSize: 12 }}>Enter loan data for commercial underwriting analysis</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Running underwriting model...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: rm.bg, border: `1px solid ${rm.c}30`, borderRadius: 10, marginBottom: 16 }}>
                <RecIcon size={22} color={rm.c} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: rm.c, fontFamily: 'var(--font-display)' }}>{result.recommendation}</div>
                  <div style={{ fontSize: 11, color: rm.c, marginTop: 1 }}>Max loan: {result.max_loan_amount ? `$${result.max_loan_amount}M` : '—'}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px' }}>DSCR Rating</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: rm.c, fontFamily: 'var(--mono)' }}>{result.dscr_rating}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { l: 'DSCR',         v: result.dscr != null ? result.dscr.toFixed(2) + 'x' : '—', c: (result.dscr || 0) >= 1.25 ? 'var(--green)' : 'var(--red)' },
                  { l: 'LTV',          v: result.ltv != null ? `${result.ltv}%` : '—',               c: (result.ltv || 100) <= 75 ? 'var(--green)' : 'var(--amber)' },
                  { l: 'Debt Yield',   v: result.debt_yield != null ? `${result.debt_yield}%` : '—',  c: 'var(--cyan)' },
                  { l: 'Loan Constant',v: result.loan_constant != null ? `${result.loan_constant}%` : '—', c: 'var(--text)' },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
              {result.conditions?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>Conditions</div>{result.conditions.map((c, i) => <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: '#94A3B8' }}><AlertTriangle size={11} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />{c}</div>)}</div>}
              {result.summary && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>Underwriter Notes</div><div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{result.summary}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreditSuite() {
  const [tab, setTab] = useState('credit');
  const TABS = [
    { id: 'credit', label: 'Credit Underwriting', icon: CreditCard },
    { id: 'dscr',   label: 'DSCR Calculator',     icon: Calculator  },
  ];
  return (
    <PageLayout title="Credit Suite" subtitle="AI loan underwriting · commercial DSCR · risk-based pricing">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'credit' && <CreditContent />}
      {tab === 'dscr'   && <DSCRContent />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
