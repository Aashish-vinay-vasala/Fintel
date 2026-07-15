import { useState } from 'react';
import { Package, Zap, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { analyzeCollateral } from '../services/api';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

const ASSET_TYPES = ['CRE — Office', 'CRE — Retail', 'CRE — Industrial', 'Multifamily', 'Single Family Residential', 'US Treasuries', 'Agency MBS', 'Corporate Bonds', 'Equipment', 'Auto Fleet', 'Accounts Receivable', 'Other'];
const BLANK_ASSET = { type: 'US Treasuries', value: '', haircut: '', ltv: '' };

const statusColor = s => s === 'ADEQUATE' ? 'var(--green)' : s === 'AT_RISK' ? 'var(--amber)' : 'var(--red)';
const statusBg    = s => s === 'ADEQUATE' ? 'var(--green-dim)' : s === 'AT_RISK' ? 'var(--amber-dim)' : 'var(--red-dim)';
const riskColor   = r => r === 'HIGH' ? 'var(--red)' : r === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
const riskBg      = r => r === 'HIGH' ? 'var(--red-dim)' : r === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';

export default function Collateral() {
  const [portfolio, setPortfolio] = useState({ total_loans: '', loan_portfolio_value: '', concentration_limit: '' });
  const [assets, setAssets] = useState([{ ...BLANK_ASSET }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const setPort = (k, v) => setPortfolio(p => ({ ...p, [k]: v }));
  const setAsset = (i, k, v) => setAssets(as => as.map((a, idx) => idx === i ? { ...a, [k]: v } : a));
  const addAsset = () => setAssets(as => [...as, { ...BLANK_ASSET }]);
  const removeAsset = i => setAssets(as => as.filter((_, idx) => idx !== i));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await analyzeCollateral({ assets: assets.filter(a => a.value), portfolio })); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <PageLayout title="Collateral Management" subtitle="LTV monitoring · haircut analysis · margin call detection · coverage ratios">
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 14, maxWidth: 1200 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Loan Portfolio</span>
            </div>
            <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
              {[
                { k: 'total_loans',           l: 'Total Loans',      ph: '4200' },
                { k: 'loan_portfolio_value',   l: 'Portfolio ($M)',   ph: '2800' },
                { k: 'concentration_limit',    l: 'Conc. Limit (%)', ph: '25' },
              ].map(f => (
                <div key={f.k}>
                  <label style={lbl}>{f.l}</label>
                  <input type="number" value={portfolio[f.k]} onChange={e => setPort(f.k, e.target.value)} placeholder={f.ph} style={inp} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, flex: 1 }}>Collateral Assets</span>
              <button onClick={addAsset} style={{ fontSize: 11, color: 'var(--cyan)', background: 'transparent', border: '1px solid var(--cyan)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={10} /> Add
              </button>
            </div>
            <div style={{ padding: 12, maxHeight: 340, overflowY: 'auto' }}>
              {assets.map((asset, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 11, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)' }}>Asset #{i + 1}</span>
                    {assets.length > 1 && (
                      <button onClick={() => removeAsset(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 2 }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={lbl}>Asset Type</label>
                    <select value={asset.type} onChange={e => setAsset(i, 'type', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                      {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                    {[
                      { k: 'value',   l: 'Market Value ($M)', ph: '25' },
                      { k: 'haircut', l: 'Haircut (%)',        ph: '15' },
                      { k: 'ltv',     l: 'LTV (%)',            ph: '70' },
                    ].map(f => (
                      <div key={f.k}>
                        <label style={lbl}>{f.l}</label>
                        <input type="number" value={asset[f.k]} onChange={e => setAsset(i, f.k, e.target.value)} placeholder={f.ph} style={inp} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 12px 12px' }}>
              <button onClick={submit} disabled={loading} style={{
                width: '100%', padding: 10,
                background: loading ? 'var(--bg4)' : 'var(--cyan)',
                color: loading ? 'var(--text3)' : '#000',
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontFamily: 'var(--font-display)',
              }}>
                {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Analyzing...</> : <><Zap size={14} /> Analyze Collateral</>}
              </button>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Collateral Analysis</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <Package size={36} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Enter collateral assets to analyze coverage and margin call risk</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Analyzing collateral portfolio...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
                  {[
                    { l: 'Margin Call Risk',    v: result.margin_call_risk || '—',   c: riskColor(result.margin_call_risk), bg: riskBg(result.margin_call_risk) },
                    { l: 'Market Value',        v: result.total_collateral_value != null ? `$${result.total_collateral_value}M` : '—', c: 'var(--text)', bg: 'var(--bg3)' },
                    { l: 'Eligible (w/haircut)',v: result.eligible_collateral != null ? `$${result.eligible_collateral}M` : '—', c: 'var(--cyan)', bg: 'var(--bg3)' },
                    { l: 'Coverage Ratio',      v: result.coverage_ratio != null ? `${result.coverage_ratio}%` : '—', c: (result.coverage_ratio || 0) >= 120 ? 'var(--green)' : 'var(--amber)', bg: 'var(--bg3)' },
                  ].map(({ l, v, c, bg }) => (
                    <div key={l} style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {result.assets?.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Asset-Level Status</div>
                    {result.assets.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: 6 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{a.type}</div>
                          <div style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)', marginTop: 2 }}>
                            Market: ${a.market_value}M · Eligible: ${a.haircut_value}M · LTV: {a.ltv}%
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: statusBg(a.status), color: statusColor(a.status) }}>{a.status?.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result.recommendations?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Recommendations</div>
                    {result.recommendations.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <CheckCircle size={12} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{r}</span>
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
