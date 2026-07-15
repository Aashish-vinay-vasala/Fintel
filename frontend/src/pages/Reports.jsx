import { useState } from 'react';
import { FileText, Copy, CheckCircle, Zap, FileBarChart2 } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { generateReport } from '../services/api';

const REPORT_TYPES = [
  { id: 'sar', label: 'SAR — Suspicious Activity Report', desc: 'FinCEN filing within 30 days of detection',
    fields: [
      { key: 'subject_name', label: 'Subject Name', ph: 'John Doe' },
      { key: 'account_number', label: 'Account Number', ph: 'ACC-123456' },
      { key: 'suspicious_amount', label: 'Suspicious Amount (USD)', ph: '185000', type: 'number' },
      { key: 'activity_dates', label: 'Activity Date Range', ph: '2024-01-01 to 2024-01-31' },
      { key: 'activity_description', label: 'Suspicious Activity Description', ph: 'Multiple structured deposits below $10,000 threshold...', multi: true },
    ]
  },
  { id: 'ctr', label: 'CTR — Currency Transaction Report', desc: 'Required for cash transactions over $10,000',
    fields: [
      { key: 'customer_name', label: 'Customer Name', ph: 'Jane Smith' },
      { key: 'transaction_amount', label: 'Transaction Amount (USD)', ph: '12500', type: 'number' },
      { key: 'transaction_date', label: 'Transaction Date', ph: '2024-01-15' },
      { key: 'transaction_type', label: 'Transaction Type', ph: 'Cash Deposit' },
      { key: 'branch_location', label: 'Branch Location', ph: 'New York, NY' },
    ]
  },
  { id: 'risk_assessment', label: 'Risk Assessment Report', desc: 'Quarterly portfolio risk for regulators',
    fields: [
      { key: 'institution_name', label: 'Institution Name', ph: 'First National Bank' },
      { key: 'report_period', label: 'Report Period', ph: 'Q4 2024' },
      { key: 'total_assets', label: 'Total Assets ($M)', ph: '5200', type: 'number' },
      { key: 'npa_ratio', label: 'NPA Ratio (%)', ph: '2.1', type: 'number' },
      { key: 'capital_ratio', label: 'Capital Adequacy Ratio (%)', ph: '14.5', type: 'number' },
      { key: 'key_risks', label: 'Key Risk Areas', ph: 'Credit concentration, rising rates...', multi: true },
    ]
  },
  { id: 'credit_portfolio', label: 'Credit Portfolio Summary', desc: 'Loan book health for credit committee',
    fields: [
      { key: 'portfolio_size', label: 'Portfolio Size ($M)', ph: '2800', type: 'number' },
      { key: 'num_loans', label: 'Active Loans', ph: '12400', type: 'number' },
      { key: 'avg_credit_score', label: 'Avg Credit Score', ph: '720', type: 'number' },
      { key: 'delinquency_rate', label: 'Delinquency Rate (%)', ph: '1.8', type: 'number' },
      { key: 'top_segments', label: 'Top Loan Segments', ph: 'Mortgage 45%, Auto 25%...' },
      { key: 'concerns', label: 'Concerns / Highlights', ph: 'Rising delinquency in auto...', multi: true },
    ]
  },
  { id: 'compliance_audit', label: 'Compliance Audit Report', desc: 'Internal compliance review findings',
    fields: [
      { key: 'audit_period', label: 'Audit Period', ph: 'Jan–Jun 2024' },
      { key: 'departments_reviewed', label: 'Departments Reviewed', ph: 'Retail, Wealth, Trade Finance' },
      { key: 'findings_count', label: 'Total Findings', ph: '14', type: 'number' },
      { key: 'regulations_covered', label: 'Regulations Covered', ph: 'BSA, AML, KYC, OFAC, GLBA' },
      { key: 'critical_findings', label: 'Critical Findings', ph: 'Incomplete KYC in 3 accounts...', multi: true },
    ]
  },
  { id: 'board_summary', label: 'Board Executive Summary', desc: 'C-suite performance briefing',
    fields: [
      { key: 'quarter', label: 'Quarter / Period', ph: 'Q1 2025' },
      { key: 'net_income', label: 'Net Income ($M)', ph: '142', type: 'number' },
      { key: 'roe', label: 'Return on Equity (%)', ph: '12.4', type: 'number' },
      { key: 'loan_growth', label: 'Loan Growth (%)', ph: '8.2', type: 'number' },
      { key: 'highlights', label: 'Key Highlights', ph: 'Record mortgage originations...', multi: true },
      { key: 'challenges', label: 'Key Challenges', ph: 'NIM compression, AML scrutiny...', multi: true },
    ]
  },
];

const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' };
const lbl = { fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 5 };

export default function Reports() {
  const [sel, setSel] = useState(REPORT_TYPES[0]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pick = (type) => { setSel(type); setForm({}); setReport(null); };

  const submit = async () => {
    setLoading(true); setReport(null);
    try {
      const data = await generateReport({ report_type: sel.id, context: form });
      setReport(data);
    } catch (e) { setReport({ error: e.message }); }
    finally { setLoading(false); }
  };

  const copy = () => {
    if (report?.content) {
      navigator.clipboard.writeText(report.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageLayout title="Report Studio" subtitle="AI-generated regulatory filings · compliance reports · board summaries">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, maxWidth: 1200 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Type selector */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Report Type</span>
            </div>
            <div style={{ padding: 6 }}>
              {REPORT_TYPES.map(t => (
                <button key={t.id} onClick={() => pick(t)} style={{
                  width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 7,
                  border: 'none', cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s',
                  background: sel.id === t.id ? 'var(--cyan-dim)' : 'transparent',
                  color: sel.id === t.id ? 'var(--cyan)' : 'var(--text2)',
                  borderLeft: `2px solid ${sel.id === t.id ? 'var(--cyan)' : 'transparent'}`,
                }}>
                  <div style={{ fontSize: 11.5, fontWeight: sel.id === t.id ? 500 : 400 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Parameters</span>
            </div>
            <div style={{ padding: 14 }}>
              {sel.fields.map(f => (
                <div key={f.key} style={{ marginBottom: 11 }}>
                  <label style={lbl}>{f.label}</label>
                  {f.multi
                    ? <textarea rows={3} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} style={{ ...inp, minHeight: 66 }} />
                    : <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} style={inp} />
                  }
                </div>
              ))}
              <button onClick={submit} disabled={loading} style={{
                width: '100%', padding: '10px', marginTop: 4,
                background: loading ? 'var(--bg4)' : 'var(--cyan)',
                color: loading ? 'var(--text3)' : '#000',
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontFamily: 'var(--font-display)',
              }}>
                {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Generating...</> : <><Zap size={14} /> Generate Report</>}
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileBarChart2 size={14} color="var(--text3)" strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Generated Report</span>
            {report?.content && (
              <button onClick={copy} style={{ marginLeft: 'auto', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, background: 'transparent', color: copied ? 'var(--green)' : 'var(--text3)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                {copied ? <><CheckCircle size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
              </button>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
            {!report && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#475569' }}>
                <FileText size={36} strokeWidth={1} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8', marginBottom: 4 }}>No report generated yet</div>
                  <div style={{ fontSize: 12 }}>Select a report type, fill parameters, and click Generate</div>
                </div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Drafting report with AI...</div>
              </div>
            )}
            {report?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{report.error}</div>}
            {report?.content && (
              <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(34,211,238,0.2)', padding: '2px 8px', borderRadius: 4 }}>
                    {sel.id.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)' }}>Generated {new Date().toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{report.content}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
