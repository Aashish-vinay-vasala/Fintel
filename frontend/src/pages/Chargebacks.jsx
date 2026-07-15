import { useState } from 'react';
import { RotateCcw, Zap, CheckCircle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { analyzeChargeback } from '../services/api';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

const actionColor = a => a === 'DISPUTE' ? 'var(--cyan)' : a === 'ESCALATE' ? 'var(--amber)' : 'var(--green)';
const actionBg    = a => a === 'DISPUTE' ? 'var(--cyan-dim)' : a === 'ESCALATE' ? 'var(--amber-dim)' : 'var(--green-dim)';

export default function Chargebacks() {
  const [form, setForm] = useState({
    merchant_name: '', transaction_amount: '', transaction_date: '', dispute_reason: '',
    card_type: '', customer_claim: '', merchant_response: '', days_since_transaction: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await analyzeChargeback(form)); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <PageLayout title="Chargeback Intel" subtitle="Dispute classification · win probability · evidence requirements · Reg E">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, maxWidth: 1100 }}>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Dispute Details</span>
          </div>
          <div style={{ padding: 14 }}>
            {[
              { k: 'merchant_name',         l: 'Merchant Name',           ph: 'TechStore Online' },
              { k: 'transaction_amount',     l: 'Transaction Amount ($)',  ph: '349.99' },
              { k: 'transaction_date',       l: 'Transaction Date',        ph: '2024-11-15' },
              { k: 'days_since_transaction', l: 'Days Since Transaction',  ph: '42' },
              { k: 'card_type',             l: 'Card Type',               ph: 'Visa Debit' },
              { k: 'dispute_reason',        l: 'Dispute Reason Code',     ph: 'Item not received' },
              { k: 'customer_claim',        l: 'Customer Statement',      ph: 'Item never arrived despite tracking showing delivered', multi: true },
              { k: 'merchant_response',     l: 'Merchant Response',       ph: 'Delivery confirmed by carrier', multi: true },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 9 }}>
                <label style={lbl}>{f.l}</label>
                {f.multi
                  ? <textarea rows={2} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={{ ...inp, resize: 'vertical', minHeight: 52 }} />
                  : <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
                }
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
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</> : <><Zap size={14} /> Analyze Dispute</>}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <RotateCcw size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Dispute Intelligence</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <RotateCcw size={36} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Enter dispute details to get AI-powered chargeback analysis</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Analyzing dispute...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                  <div style={{ background: actionBg(result.recommended_action), border: `1px solid ${actionColor(result.recommended_action)}30`, borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>Recommendation</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: actionColor(result.recommended_action), fontFamily: 'var(--mono)' }}>{result.recommended_action || '—'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>Win Probability</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: (result.win_probability || 0) >= 60 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--mono)' }}>{result.win_probability ?? '—'}%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>Timeline</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{result.timeline_days ?? '—'} days</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    { l: 'Category',      v: result.category?.replace(/_/g, ' ') || '—' },
                    { l: 'Reason Code',   v: result.reason_code || '—' },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {result.reg_e_applicable != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: result.reg_e_applicable ? 'var(--amber-dim)' : 'var(--bg3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: result.reg_e_applicable ? 'var(--amber)' : 'var(--text3)' }}>
                      {result.reg_e_applicable ? '⚠️ Reg E Applicable — strict timelines apply' : '✓ Reg E not applicable'}
                    </span>
                  </div>
                )}

                {result.required_evidence?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Required Evidence</div>
                    {result.required_evidence.map((e, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <CheckCircle size={12} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{e}</span>
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
