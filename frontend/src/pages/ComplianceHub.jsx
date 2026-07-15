import { useState, useRef, useEffect } from 'react';
import { Scale, BookOpen, Send, CheckCircle, AlertTriangle, ChevronRight, XCircle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import TabBar from '../components/ui/TabBar';
import { askCompliance, checkCompliance, trackRegulatory } from '../services/api';
import { MOCK_COMPLIANCE_MESSAGES, MOCK_REGULATORY_RESULT } from '../data/mockBank';


const QUICK = ['What are the SAR filing requirements?', 'When must a CTR be filed?', 'Explain OFAC screening obligations', 'What is KYC under CIP?', 'AML red flags for wire transfers', 'BSA record retention requirements'];
const sel = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', width: '100%' };

function extractText(res) {
  if (!res) return 'No response received.';
  if (typeof res === 'string') return res;
  const raw = res.answer || res.response || res.result || res.message;
  if (!raw) return JSON.stringify(res, null, 2);

  // `answer` is itself an LLM-produced JSON envelope (possibly fenced in ```json):
  // { answer: string, status: string, citations: string[] }. Pull out the human-
  // readable answer and append citations rather than showing raw JSON.
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const parsed = JSON.parse(m[0]);
      if (parsed.answer) {
        const citations = parsed.citations?.length ? `\n\nCitations: ${parsed.citations.join(', ')}` : '';
        return parsed.answer + citations;
      }
    } catch { /* fall through to raw text */ }
  }
  return raw;
}

function ComplianceContent() {
  const [messages, setMessages] = useState(MOCK_COMPLIANCE_MESSAGES);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [txForm, setTxForm]     = useState({ amount: '', type: 'wire', foreign: 'false' });
  const [txResult, setTxResult] = useState(null);
  const [txLoading, setTxLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const ask = async (q) => {
    const text = (q || input).trim();
    if (!text) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try { const res = await askCompliance(text); setMessages(m => [...m, { role: 'ai', text: extractText(res) }]); }
    catch (e) { setMessages(m => [...m, { role: 'error', text: e.message }]); }
    finally { setLoading(false); }
  };

  const checkTx = async () => {
    if (!txForm.amount) return;
    setTxLoading(true); setTxResult(null);
    try { setTxResult(await checkCompliance({ amount: +txForm.amount, transaction_type: txForm.type, is_foreign: txForm.foreign === 'true' })); }
    catch (e) { setTxResult({ error: e.message }); }
    finally { setTxLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, height: 'calc(100vh - 170px)' }}>
      {/* Chat */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Scale size={14} color="var(--indigo)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Regulatory Q&A</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', background: 'var(--indigo-dim)', color: 'var(--indigo)', border: '1px solid rgba(109,40,217,0.2)', padding: '1px 7px', borderRadius: 4 }}>RAG · Groq</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 4 }}>Ask any US banking compliance question — BSA, AML, KYC, SAR, CTR, OFAC:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK.map(q => (
                  <button key={q} onClick={() => ask(q)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 12px', fontSize: 11.5, color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s', fontFamily: 'var(--font)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                  ><ChevronRight size={10} />{q}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 10, animation: 'fade-in 0.25s ease forwards' }}>
              {m.role !== 'user' && <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: m.role === 'error' ? 'var(--red-dim)' : 'var(--indigo-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.role === 'error' ? 'var(--red)' : 'var(--indigo)', marginTop: 2 }}><Scale size={13} /></div>}
              <div style={{ maxWidth: '80%', background: m.role === 'user' ? 'var(--indigo-dim)' : 'var(--bg3)', border: `1px solid ${m.role === 'user' ? 'rgba(109,40,217,0.2)' : 'var(--border)'}`, borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '4px 12px 12px 12px', padding: '10px 13px', fontSize: 12.5, color: m.role === 'error' ? 'var(--red)' : 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={{ display: 'flex', gap: 10 }}><div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--indigo-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)' }}><Scale size={13} /></div><div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>{[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--indigo)', display: 'inline-block', animation: `pulse-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask()} placeholder="Ask a compliance or regulatory question..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 13px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }} />
          <button onClick={() => ask()} disabled={loading || !input.trim()} style={{ width: 38, height: 38, background: input.trim() ? 'var(--indigo)' : 'var(--bg4)', border: 'none', borderRadius: 8, color: '#fff', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Send size={14} /></button>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={13} color="var(--green)" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Screen Transaction</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ marginBottom: 10 }}><div style={{ fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 5 }}>Amount ($)</div><input type="number" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} placeholder="15000" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div><div style={{ fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 5 }}>Type</div><select value={txForm.type} onChange={e => setTxForm(f => ({ ...f, type: e.target.value }))} style={sel}><option value="wire">Wire</option><option value="cash">Cash</option><option value="ach">ACH</option><option value="check">Check</option></select></div>
              <div><div style={{ fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 5 }}>Foreign</div><select value={txForm.foreign} onChange={e => setTxForm(f => ({ ...f, foreign: e.target.value }))} style={sel}><option value="false">No</option><option value="true">Yes</option></select></div>
            </div>
            <button onClick={checkTx} disabled={txLoading || !txForm.amount} style={{ width: '100%', padding: '9px', background: txForm.amount ? 'var(--green)' : 'var(--bg4)', color: txForm.amount ? '#000' : 'var(--text3)', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 12.5, cursor: txForm.amount ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-display)' }}>{txLoading ? 'Checking…' : 'Screen Transaction'}</button>
            {txResult && !txResult.error && (
              <div style={{ marginTop: 10, padding: '9px 12px', background: txResult.status === 'compliant' ? 'var(--green-dim)' : 'var(--amber-dim)', border: `1px solid ${txResult.status === 'compliant' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)'}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                {txResult.status === 'compliant' ? <CheckCircle size={13} color="var(--green)" /> : <AlertTriangle size={13} color="var(--amber)" />}
                <span style={{ fontSize: 12, fontWeight: 600, color: txResult.status === 'compliant' ? 'var(--green)' : 'var(--amber)' }}>{txResult.status === 'compliant' ? 'Compliant' : 'Action Required'}</span>
              </div>
            )}
            {txResult?.error && <div style={{ marginTop: 10, color: 'var(--red)', fontSize: 12 }}>{txResult.error}</div>}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 10 }}>Regulatory Thresholds</div>
          {[['CTR Filing', '$10,000', 'Cash transactions'], ['SAR Required', '$5,000', 'Suspicious activity'], ['FBAR', '$10,000', 'Foreign accounts'], ['Wire Record', '$3,000', 'BSA retention']].map(([l, v, n]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div><div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 10, color: '#475569' }}>{n}</div></div>
              <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--amber)', fontWeight: 600, alignSelf: 'center' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const QUICK_QUERIES = ['Latest Basel III changes for 2024–2025', 'CFPB guidance on small business lending', 'OCC CRA modernization requirements', 'FinCEN beneficial ownership reporting', 'FRB stress testing for regional banks', 'DORA — what applies to US bank subsidiaries?'];

function RegTracker() {
  const [query, setQuery] = useState('Active regulations for 2025–2026');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(MOCK_REGULATORY_RESULT);

  const submit = async (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true); setResult(null);
    try { setResult(await trackRegulatory({ query: text })); }
    catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  const impactColor = i => i === 'HIGH' ? 'var(--red)' : i === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
  const impactBg    = i => i === 'HIGH' ? 'var(--red-dim)' : i === 'MEDIUM' ? 'var(--amber-dim)' : 'var(--green-dim)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14, maxWidth: 1100 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Query</span></div>
          <div style={{ padding: 14 }}>
            <textarea rows={4} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }} placeholder="Ask about any regulatory change or compliance requirement..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '9px 11px', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', minHeight: 90, fontFamily: 'var(--font)' }} />
            <button onClick={() => submit()} disabled={loading || !query.trim()} style={{ width: '100%', padding: 10, marginTop: 8, background: loading || !query.trim() ? 'var(--bg4)' : 'var(--cyan)', color: loading || !query.trim() ? 'var(--text3)' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-display)' }}>
              {loading ? <><span style={{ animation: 'pulse-dot 1s infinite' }}>●</span> Researching...</> : <><Send size={13} /> Query</>}
            </button>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12 }}>Quick Topics</span></div>
          <div style={{ padding: 8 }}>{QUICK_QUERIES.map(q => <button key={q} onClick={() => { setQuery(q); submit(q); }} style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', marginBottom: 2, background: 'transparent', color: '#94A3B8', fontSize: 11.5, lineHeight: 1.4, transition: 'all 0.12s', fontFamily: 'var(--font)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--cyan)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}>{q}</button>)}</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={14} color="var(--text3)" strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Regulatory Intelligence</span>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {!result && !loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: 10 }}><BookOpen size={36} strokeWidth={1} /><div style={{ fontSize: 12, textAlign: 'center' }}>Ask about any banking regulation or click a quick topic</div></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--cyan)', animation: 'spin 0.9s linear infinite' }} /><div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Scanning regulatory database...</div></div>}
          {result?.error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ animation: 'fade-in 0.4s ease forwards' }}>
              {result.compliance_deadline && <div style={{ padding: '10px 14px', background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 600, color: 'var(--amber)' }}>⏱ Compliance deadline: {result.compliance_deadline}</div>}
              {result.regulations?.length > 0 && <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 10 }}>Regulations</div>
                {result.regulations.map((r, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{r.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: impactBg(r.impact), color: impactColor(r.impact) }}>{r.impact}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, fontFamily: 'var(--mono)' }}>{r.agency} · {r.effective_date}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{r.description}</div>
                  </div>
                ))}
              </div>}
              {result.action_items?.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Required Actions</div>{result.action_items.map((a, i) => <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><CheckCircle size={11} color="var(--cyan)" style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 12, color: '#94A3B8' }}>{a}</span></div>)}</div>}
              {result.answer && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '14px 16px' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8 }}>Detailed Analysis</div><div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result.answer}</div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComplianceHub() {
  const [tab, setTab] = useState('qa');
  const TABS = [
    { id: 'qa',         label: 'Compliance Q&A',    icon: Scale    },
    { id: 'regulatory', label: 'Regulatory Tracker', icon: BookOpen },
  ];
  return (
    <PageLayout title="Compliance Hub" subtitle="Regulatory Q&A · transaction screening · regulatory change tracker">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'qa'         && <ComplianceContent />}
      {tab === 'regulatory' && <RegTracker />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}
