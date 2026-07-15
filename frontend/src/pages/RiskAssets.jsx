import { useState } from 'react';
import { RotateCcw, Package, Zap, CheckCircle, AlertTriangle, XCircle, Plus, Trash2 } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import TabBar from '../components/ui/TabBar';
import { analyzeChargeback, analyzeCollateral } from '../services/api';
import { MOCK_CHARGEBACK_FORM, MOCK_CHARGEBACK_RESULT, MOCK_COLLATERAL_ASSETS, MOCK_COLLATERAL_RESULT } from '../data/mockBank';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };


// ─── Chargeback Intelligence ──────────────────────────────────────────────────
const actionColor = a => a === 'DISPUTE' ? 'var(--cyan)' : a === 'ESCALATE' ? 'var(--amber)' : 'var(--green)';
const actionBg    = a => a === 'DISPUTE' ? 'var(--cyan-dim)' : a === 'ESCALATE' ? 'var(--amber-dim)' : 'var(--green-dim)';

function ChargebackContent() {
  const [form, setForm] = useState(MOCK_CHARGEBACK_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_CHARGEBACK_RESULT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => { setLoading(true); setResult(null); try { setResult(await analyzeChargeback(form)); } catch (e) { setResult({ error: e.message }); } finally { setLoading(false); } };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, maxWidth: 1100 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <RotateCcw size={14} color="var(--cyan)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Dispute Details</span>
        </div>
        <div style={{ padding: 14 }}>
          {[
            { k: 'merchant_name',         l: 'Merchant',            ph: 'TechStore Online' },
            { k: 'transaction_amount',     l: 'Amount ($)',          ph: '349.99' },
            { k: 'transaction_date',       l: 'Transaction Date',    ph: '2024-11-15' },
            { k: 'days_since_transaction', l: 'Days Since Tx',       ph: '42' },
            { k: 'card_type',             l: 'Card Type',           ph: 'Visa Debit' },
            { k: 'dispute_reason',        l: 'Reason',              ph: 'Item not received' },
            { k: 'customer_claim',        l: 'Customer Statement',  ph: 'Item never arrived...', multi: true },
            { k: 'merchant_response',     l: 'Merchant Response',   ph: 'Delivery confirmed...', multi: true },
          ].map(f => <div key={f.k} style={{ marginBottom: 9 }}><label style={lbl}>{f.l}</label>{f.multi ? <textarea rows={2} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={{ ...inp, resize: 'vertical', minHeight: 52 }} /> : <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />}</div>)}
          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: 10, marginTop: 4, background: loading ? 'var(--bg4)' : 'var(--cyan)', color: loading ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
            {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</> : <><Zap size={14} /> Analyze Dispute</>}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <RotateCcw size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Dispute Intelligence</span>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><RotateCcw size={36} strokeWidth={1} /><div style={{ fontSize: 12 }}>Enter dispute details for AI-powered chargeback analysis</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Analyzing dispute...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                <div style={{ background: actionBg(result.recommended_action), border: `1px solid ${actionColor(result.recommended_action)}30`, borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>Recommendation</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: actionColor(result.recommended_action), fontFamily: 'var(--mono)' }}>{result.recommended_action || '—'}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>Win Probability</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: (result.win_probability || 0) >= 60 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--mono)' }}>{result.win_probability ?? '—'}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>Timeline</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{result.timeline_days ?? '—'} days</div>
                </div>
              </div>
              {result.reg_e_applicable != null && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: result.reg_e_applicable ? 'var(--amber-dim)' : 'var(--bg3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: 14, fontSize: 11, fontWeight: 600, color: result.reg_e_applicable ? 'var(--amber)' : 'var(--text3)' }}>{result.reg_e_applicable ? '⚠️ Reg E applicable — strict timelines apply' : '✓ Reg E not applicable'}</div>}
              {result.required_evidence?.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Required Evidence</div>{result.required_evidence.map((e, i) => <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><CheckCircle size={11} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 12, color: '#94A3B8' }}>{e}</span></div>)}</div>}
              {result.summary && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>AI Assessment</div><div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{result.summary}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Collateral Management ────────────────────────────────────────────────────
const ASSET_TYPES = ['US Treasuries', 'Agency MBS', 'Corporate Bonds', 'CRE — Office', 'CRE — Retail', 'Multifamily', 'Single Family Residential', 'Equipment', 'Auto Fleet', 'Accounts Receivable'];
const BLANK = { type: 'US Treasuries', value: '', haircut: '', ltv: '' };
const statusColor = s => s === 'ADEQUATE' ? 'var(--green)' : s === 'AT_RISK' ? 'var(--amber)' : 'var(--red)';
const statusBg    = s => s === 'ADEQUATE' ? 'var(--green-dim)' : s === 'AT_RISK' ? 'var(--amber-dim)' : 'var(--red-dim)';
const riskColor   = r => r === 'HIGH' ? 'var(--red)' : r === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
const riskBg      = r => r === 'HIGH' ? 'var(--red-dim)' : r === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';

function CollateralContent() {
  const [portfolio, setPortfolio] = useState({ total_loans: '', loan_portfolio_value: String(MOCK_COLLATERAL_RESULT.total_collateral_value), concentration_limit: '' });
  const [assets, setAssets] = useState(MOCK_COLLATERAL_ASSETS);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_COLLATERAL_RESULT);

  const setPort  = (k, v) => setPortfolio(p => ({ ...p, [k]: v }));
  const setAsset = (i, k, v) => setAssets(as => as.map((a, idx) => idx === i ? { ...a, [k]: v } : a));
  const submit = async () => { setLoading(true); setResult(null); try { setResult(await analyzeCollateral({ assets: assets.filter(a => a.value), portfolio })); } catch (e) { setResult({ error: e.message }); } finally { setLoading(false); } };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 14, maxWidth: 1200 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Portfolio</span></div>
          <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            {[['total_loans', 'Total Loans', '4200'], ['loan_portfolio_value', 'Portfolio ($M)', '2800'], ['concentration_limit', 'Conc. Limit (%)', '25']].map(([k, l, ph]) => <div key={k}><label style={lbl}>{l}</label><input type="number" value={portfolio[k]} onChange={e => setPort(k, e.target.value)} placeholder={ph} style={inp} /></div>)}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, flex: 1 }}>Collateral Assets</span>
            <button onClick={() => setAssets(as => [...as, { ...BLANK }])} style={{ fontSize: 11, color: 'var(--cyan)', background: 'transparent', border: '1px solid var(--cyan)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={10} /> Add</button>
          </div>
          <div style={{ padding: 12, maxHeight: 300, overflowY: 'auto' }}>
            {assets.map((asset, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 11, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)' }}>Asset #{i+1}</span>
                  {assets.length > 1 && <button onClick={() => setAssets(as => as.filter((_, idx) => idx !== i))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 2 }}><Trash2 size={11} /></button>}
                </div>
                <div style={{ marginBottom: 7 }}><label style={lbl}>Asset Type</label><select value={asset.type} onChange={e => setAsset(i, 'type', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{ASSET_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                  {[['value', 'Value ($M)', '25'], ['haircut', 'Haircut (%)', '15'], ['ltv', 'LTV (%)', '70']].map(([k, l, ph]) => <div key={k}><label style={lbl}>{l}</label><input type="number" value={asset[k]} onChange={e => setAsset(i, k, e.target.value)} placeholder={ph} style={inp} /></div>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 12px 12px' }}>
            <button onClick={submit} disabled={loading} style={{ width: '100%', padding: 10, background: loading ? 'var(--bg4)' : 'var(--cyan)', color: loading ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</> : <><Zap size={14} /> Analyze Collateral</>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Collateral Analysis</span>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><Package size={36} strokeWidth={1} /><div style={{ fontSize: 12 }}>Enter assets to analyze coverage and margin call risk</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Analyzing collateral portfolio...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { l: 'Margin Call Risk',  v: result.margin_call_risk || '—', c: riskColor(result.margin_call_risk), bg: riskBg(result.margin_call_risk) },
                  { l: 'Market Value',      v: result.total_collateral_value != null ? `$${result.total_collateral_value}M` : '—', c: 'var(--text)', bg: 'var(--bg3)' },
                  { l: 'Eligible',          v: result.eligible_collateral != null ? `$${result.eligible_collateral}M` : '—',       c: 'var(--cyan)', bg: 'var(--bg3)' },
                  { l: 'Coverage',          v: result.coverage_ratio != null ? `${result.coverage_ratio}%` : '—',                  c: (result.coverage_ratio || 0) >= 120 ? 'var(--green)' : 'var(--amber)', bg: 'var(--bg3)' },
                ].map(({ l, v, c, bg }) => (
                  <div key={l} style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
              {result.assets?.length > 0 && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Asset-Level Status</div>{result.assets.map((a, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: 6 }}><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{a.type}</div><div style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)', marginTop: 2 }}>Market: ${a.market_value}M · Eligible: ${a.haircut_value}M · LTV: {a.ltv}%</div></div><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: statusBg(a.status), color: statusColor(a.status) }}>{a.status?.replace(/_/g, ' ')}</span></div>)}</div>}
              {result.recommendations?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Recommendations</div>{result.recommendations.map((r, i) => <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><CheckCircle size={11} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{r}</span></div>)}</div>}
              {result.summary && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>AI Assessment</div><div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{result.summary}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiskAssets() {
  const [tab, setTab] = useState('chargebacks');
  const TABS = [
    { id: 'chargebacks', label: 'Chargeback Intel',      icon: RotateCcw },
    { id: 'collateral',  label: 'Collateral Management', icon: Package   },
  ];
  return (
    <PageLayout title="Risk Assets" subtitle="Chargeback dispute intelligence · collateral coverage · margin call monitoring">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'chargebacks' && <ChargebackContent />}
      {tab === 'collateral'  && <CollateralContent />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
