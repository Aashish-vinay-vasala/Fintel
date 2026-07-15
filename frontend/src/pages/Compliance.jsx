import { useState, useRef, useEffect } from 'react';
import { Scale, Send, CheckCircle, AlertTriangle, ChevronRight, XCircle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { askCompliance, checkCompliance } from '../services/api';

const QUICK = [
  'What are the SAR filing requirements?',
  'When must a CTR be filed?',
  'Explain OFAC screening obligations',
  'What is KYC under CIP?',
  'AML red flags for wire transfers',
  'BSA record retention requirements',
];

const selectStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 7,
  padding: '9px 12px',
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--mono)',
  width: '100%',
};

function extractText(res) {
  if (!res) return 'No response received.';
  if (typeof res === 'string') return res;
  // backend returns { question, answer, status }
  if (res.answer) return res.answer;
  if (res.response) return res.response;
  if (res.result) return res.result;
  if (res.message) return res.message;
  return JSON.stringify(res, null, 2);
}

export default function Compliance() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [txForm, setTxForm] = useState({ amount: '', type: 'wire', foreign: 'false' });
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
    try {
      const res = await askCompliance(text);
      setMessages(m => [...m, { role: 'ai', text: extractText(res) }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'error', text: e.message }]);
    } finally {
      setLoading(false);
    }
  };

  const checkTx = async () => {
    if (!txForm.amount) return;
    setTxLoading(true);
    setTxResult(null);
    try {
      const res = await checkCompliance({
        amount: parseFloat(txForm.amount),
        transaction_type: txForm.type,
        is_foreign: txForm.foreign === 'true',
      });
      setTxResult(res);
    } catch (e) {
      setTxResult({ error: e.message });
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <PageLayout title="Compliance Intelligence" subtitle="Regulatory Q&A · AML screening · BSA/OFAC · LangChain + ChromaDB">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 14, height: 'calc(100vh - 110px)' }}>

        {/* Chat Panel */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scale size={14} color="var(--indigo)" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Regulatory Assistant</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', background: 'var(--indigo-dim)', color: 'var(--indigo)', border: '1px solid rgba(129,140,248,0.2)', padding: '1px 7px', borderRadius: 4 }}>RAG · Groq LLM</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 6 }}>
                  Ask any question about US banking regulations — BSA, AML, KYC, SAR, CTR, OFAC:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {QUICK.map(q => (
                    <button key={q} onClick={() => ask(q)} style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 20, padding: '5px 12px',
                      fontSize: 11.5, color: '#94A3B8', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                    >
                      <ChevronRight size={10} />{q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                gap: 10, animation: 'fade-in 0.25s ease forwards',
              }}>
                {m.role !== 'user' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: m.role === 'error' ? 'var(--red-dim)' : 'var(--indigo-dim)',
                    border: `1px solid ${m.role === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(129,140,248,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: m.role === 'error' ? 'var(--red)' : 'var(--indigo)', marginTop: 2,
                  }}>
                    <Scale size={13} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? 'var(--indigo-dim)' : 'var(--bg3)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(129,140,248,0.2)' : 'var(--border)'}`,
                  borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '4px 12px 12px 12px',
                  padding: '10px 13px',
                  fontSize: 12.5,
                  color: m.role === 'error' ? 'var(--red)' : 'var(--text)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 10, animation: 'fade-in 0.25s ease forwards' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--indigo-dim)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)' }}>
                  <Scale size={13} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--indigo)', display: 'inline-block', animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask()}
              placeholder="Ask a compliance or regulatory question..."
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '9px 13px', color: 'var(--text)',
                fontSize: 13, outline: 'none',
              }}
            />
            <button onClick={() => ask()} disabled={loading || !input.trim()} style={{
              width: 38, height: 38,
              background: input.trim() ? 'var(--indigo)' : 'var(--bg4)',
              border: 'none', borderRadius: 8, color: '#fff',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}>
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Transaction Checker */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} color="var(--green)" strokeWidth={2} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Screen Transaction</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 5 }}>Amount ($)</div>
                <input
                  type="number"
                  value={txForm.amount}
                  onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="e.g. 15000"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 5 }}>Type</div>
                  <select value={txForm.type} onChange={e => setTxForm(f => ({ ...f, type: e.target.value }))} style={selectStyle}>
                    <option value="wire">Wire</option>
                    <option value="cash">Cash</option>
                    <option value="ach">ACH</option>
                    <option value="check">Check</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 5 }}>Foreign</div>
                  <select value={txForm.foreign} onChange={e => setTxForm(f => ({ ...f, foreign: e.target.value }))} style={selectStyle}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              <button onClick={checkTx} disabled={txLoading || !txForm.amount} style={{
                width: '100%', padding: '9px',
                background: txForm.amount ? 'var(--green)' : 'var(--bg4)',
                color: txForm.amount ? '#000' : 'var(--text3)',
                border: 'none', borderRadius: 7,
                fontWeight: 600, fontSize: 12.5,
                cursor: txForm.amount ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-display)', transition: 'all 0.15s',
              }}>
                {txLoading ? 'Checking...' : 'Screen Transaction'}
              </button>

              {txResult && (
                <div style={{ marginTop: 12, animation: 'fade-in 0.3s ease forwards' }}>
                  {txResult.error ? (
                    <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <XCircle size={13} color="var(--red)" />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--red)' }}>Error</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#94A3B8' }}>{txResult.error}</div>
                    </div>
                  ) : (
                    <>
                      {/* Status banner */}
                      <div style={{
                        background: txResult.status === 'compliant' ? 'var(--green-dim)' : 'var(--amber-dim)',
                        border: `1px solid ${txResult.status === 'compliant' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                        borderRadius: 8, padding: '9px 12px',
                        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8,
                      }}>
                        {txResult.status === 'compliant'
                          ? <CheckCircle size={13} color="var(--green)" />
                          : <AlertTriangle size={13} color="var(--amber)" />}
                        <span style={{ fontSize: 12, fontWeight: 600, color: txResult.status === 'compliant' ? 'var(--green)' : 'var(--amber)' }}>
                          {txResult.status === 'compliant' ? 'Compliant' : txResult.status === 'requires_action' ? 'Action Required' : 'Review Required'}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--mono)', color: '#475569' }}>
                          ${Number(txResult.transaction?.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Flags */}
                      {txResult.flags?.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {txResult.flags.map((f, i) => (
                            <div key={i} style={{
                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                              borderLeft: `3px solid ${f.severity === 'high' ? 'var(--red)' : f.severity === 'medium' ? 'var(--amber)' : 'var(--cyan)'}`,
                              borderRadius: 6, padding: '8px 10px', marginBottom: 5,
                            }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{f.rule}</div>
                              <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{f.detail}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Guidance */}
                      {txResult.compliance_guidance && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '9px 11px' }}>
                          <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 5 }}>AI Guidance</div>
                          <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.6 }}>
                            {txResult.compliance_guidance.length > 300
                              ? txResult.compliance_guidance.slice(0, 300) + '…'
                              : txResult.compliance_guidance}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Regulatory Thresholds */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 10 }}>Regulatory Thresholds</div>
            {[
              { label: 'CTR Filing',     value: '$10,000', note: 'Cash transactions' },
              { label: 'SAR Required',   value: '$5,000',  note: 'Suspicious activity' },
              { label: 'FBAR Threshold', value: '$10,000', note: 'Foreign accounts' },
              { label: 'Wire Record',    value: '$3,000',  note: 'BSA retention' },
            ].map(({ label, value, note }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{note}</div>
                </div>
                <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--amber)', fontWeight: 500, alignSelf: 'center' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}