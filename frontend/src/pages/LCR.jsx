import { useState } from 'react';
import { Droplets, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { analyzeLCR } from '../services/api';

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

const statusMeta = {
  COMPLIANT:     { color: 'var(--green)', bg: 'var(--green-dim)', icon: CheckCircle },
  AT_RISK:       { color: 'var(--amber)', bg: 'var(--amber-dim)', icon: AlertTriangle },
  NON_COMPLIANT: { color: 'var(--red)',   bg: 'var(--red-dim)',   icon: XCircle },
};

export default function LCR() {
  const [form, setForm] = useState({
    level1_hqla: '', level2a_hqla: '', level2b_hqla: '',
    retail_outflows: '', wholesale_outflows: '', secured_outflows: '',
    retail_inflows: '', wholesale_inflows: '', institution_size: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setResult(null);
    try { setResult(await analyzeLCR(form)); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const meta = statusMeta[result?.status] || statusMeta.AT_RISK;
  const StatusIcon = meta.icon;

  return (
    <PageLayout title="LCR Dashboard" subtitle="Basel III Liquidity Coverage Ratio · HQLA tracking · 30-day stress outflows">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, maxWidth: 1100 }}>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Liquidity Inputs ($M)</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>HQLA</div>
            {[
              { k: 'level1_hqla',  l: 'Level 1 (0% haircut)',  ph: '1200' },
              { k: 'level2a_hqla', l: 'Level 2A (15% haircut)',ph: '400' },
              { k: 'level2b_hqla', l: 'Level 2B (25-50%)',     ph: '180' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 9 }}>
                <label style={lbl}>{f.l}</label>
                <input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
              </div>
            ))}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8, marginTop: 12 }}>30-Day Outflows</div>
            {[
              { k: 'retail_outflows',    l: 'Retail Deposit Outflows',  ph: '320' },
              { k: 'wholesale_outflows', l: 'Wholesale Outflows',        ph: '580' },
              { k: 'secured_outflows',   l: 'Secured Funding Outflows',  ph: '140' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 9 }}>
                <label style={lbl}>{f.l}</label>
                <input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
              </div>
            ))}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8, marginTop: 12 }}>30-Day Inflows</div>
            {[
              { k: 'retail_inflows',    l: 'Retail Inflows',    ph: '85' },
              { k: 'wholesale_inflows', l: 'Wholesale Inflows', ph: '120' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 9 }}>
                <label style={lbl}>{f.l}</label>
                <input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inp} />
              </div>
            ))}
            <button onClick={submit} disabled={loading} style={{
              width: '100%', padding: 10, marginTop: 8,
              background: loading ? 'var(--bg4)' : 'var(--cyan)',
              color: loading ? 'var(--text3)' : '#000',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'var(--font-display)',
            }}>
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Calculating...</> : <><Zap size={14} /> Calculate LCR</>}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Liquidity Analysis</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {!result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}>
                <Droplets size={36} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Enter HQLA and outflow data to calculate Basel III LCR</div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Computing liquidity ratios...</div>
              </div>
            )}
            {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
            {result && !result.error && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                {/* Status banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: meta.bg, border: `1px solid ${meta.color}30`, borderRadius: 10, marginBottom: 18 }}>
                  <StatusIcon size={24} color={meta.color} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: meta.color, fontFamily: 'var(--mono)' }}>{result.lcr_ratio != null ? `${result.lcr_ratio}%` : '—'}</div>
                    <div style={{ fontSize: 11, color: meta.color, fontWeight: 600, marginTop: 1 }}>{result.status?.replace(/_/g, ' ')} · Minimum required: 100%</div>
                  </div>
                  {result.stress_lcr != null && (
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Stress LCR</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{result.stress_lcr}%</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                  {[
                    { l: 'Total HQLA',       v: result.hqla_total != null ? `$${result.hqla_total}M` : '—',   c: 'var(--green)' },
                    { l: 'Net Outflows 30d', v: result.net_outflows_30d != null ? `$${result.net_outflows_30d}M` : '—', c: 'var(--red)' },
                    { l: 'Buffer Surplus',   v: result.buffer_surplus != null ? `$${result.buffer_surplus}M` : '—', c: result.buffer_surplus >= 0 ? 'var(--green)' : 'var(--red)' },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {result.breakdown?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Component Breakdown</div>
                    {result.breakdown.map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 600, background: b.type === 'hqla' ? 'var(--green-dim)' : b.type === 'inflow' ? 'var(--cyan-dim)' : 'var(--red-dim)', color: b.type === 'hqla' ? 'var(--green)' : b.type === 'inflow' ? 'var(--cyan)' : 'var(--red)' }}>{b.type?.toUpperCase()}</span>
                        <span style={{ flex: 1, fontSize: 12, color: '#94A3B8' }}>{b.component}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>${b.amount}M</span>
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
