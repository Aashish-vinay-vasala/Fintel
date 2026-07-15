import { useState } from 'react';
import { Users, Zap, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { profileCustomer } from '../services/api';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

const riskColor = r => r === 'HIGH' ? 'var(--red)' : r === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
const riskBg    = r => r === 'HIGH' ? 'var(--red-dim)' : r === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';

export default function CustomerProfile() {
  const [form, setForm] = useState({ customer_id: '', full_name: '', account_type: '', country: '', occupation: '', monthly_income: '', account_age_years: '', existing_products: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await profileCustomer(form)); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const fields = [
    { k: 'customer_id',       l: 'Customer ID',        ph: 'CIF-00123456' },
    { k: 'full_name',         l: 'Full Name',           ph: 'John A. Doe' },
    { k: 'account_type',      l: 'Primary Account',     ph: 'Business Checking' },
    { k: 'country',           l: 'Country of Residence',ph: 'United States' },
    { k: 'occupation',        l: 'Occupation / Industry',ph: 'Real Estate Investor' },
    { k: 'monthly_income',    l: 'Monthly Income ($)',  ph: '18000' },
    { k: 'account_age_years', l: 'Account Age (yrs)',   ph: '4' },
    { k: 'existing_products', l: 'Known Products',      ph: 'Checking, Mortgage, Business Loan' },
  ];

  return (
    <PageLayout title="Customer 360" subtitle="Unified risk profile · KYC status · behavioral intelligence">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, maxWidth: 1100 }}>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Customer Lookup</span>
          </div>
          <div style={{ padding: 14 }}>
            {fields.map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <label style={lbl}>{f.l}</label>
                <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
              </div>
            ))}
            <button onClick={submit} disabled={loading} style={{
              width: '100%', padding: 10, marginTop: 4,
              background: loading ? 'var(--bg4)' : 'var(--cyan)',
              color: loading ? 'var(--text3)' : '#000',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'var(--font-display)',
            }}>
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Profiling...</> : <><Zap size={14} /> Build Profile</>}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>360° Profile</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <Users size={36} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Enter customer details to generate a unified risk profile</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Building customer profile...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                {/* Risk header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
                  {[
                    { l: 'Risk Level',   v: result.risk_level || '—',         c: riskColor(result.risk_level), bg: riskBg(result.risk_level) },
                    { l: 'Risk Score',   v: `${result.risk_score ?? '—'}/100`, c: riskColor(result.risk_level), bg: 'var(--bg3)' },
                    { l: 'Credit Grade', v: result.credit_grade || '—',        c: 'var(--cyan)',                bg: 'var(--bg3)' },
                    { l: 'Lifetime Value', v: result.lifetime_value ? `$${result.lifetime_value}K` : '—', c: 'var(--text)', bg: 'var(--bg3)' },
                  ].map(({ l, v, c, bg }) => (
                    <div key={l} style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* KYC checks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
                  {[
                    { l: 'KYC Status',       ok: result.kyc_status === 'VERIFIED', v: result.kyc_status || '—' },
                    { l: 'PEP Match',        ok: !result.pep_match,                v: result.pep_match ? 'MATCH' : 'CLEAR' },
                    { l: 'Sanctions Match',  ok: !result.sanctions_match,           v: result.sanctions_match ? 'MATCH' : 'CLEAR' },
                  ].map(({ l, ok, v }) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px' }}>
                      {ok ? <CheckCircle size={13} color="var(--green)" /> : <XCircle size={13} color="var(--red)" />}
                      <div>
                        <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{l}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: ok ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }}>{v}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Products */}
                {result.product_holdings?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Product Holdings</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.product_holdings.map(p => (
                        <span key={p} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(37,99,235,0.15)' }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flags */}
                {result.behavioral_flags?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Behavioral Flags</div>
                    {result.behavioral_flags.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <AlertTriangle size={11} color="var(--amber)" />
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Due diligence & summary */}
                {result.recommended_due_diligence && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 6 }}>Recommended Due Diligence</div>
                    <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{result.recommended_due_diligence}</div>
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
