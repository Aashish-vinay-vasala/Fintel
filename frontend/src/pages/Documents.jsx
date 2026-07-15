import { useState, useRef } from 'react';
import { FileText, Upload, Send, Loader, BookOpen, MessageSquare } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import { summarizeDocument, askDocument, askCompliance } from '../services/api';

function buildDocPrompt(summary, question) {
  return `Ignore any compliance officer framing. You are a helpful document assistant. Answer the question below in clear, simple, conversational English — no jargon, no bullet-point regulations, no "Required action" sections. Just answer what the user asked based on the document.

DOCUMENT CONTENT:
${summary}

USER QUESTION: ${question}

Answer directly and naturally, as if explaining to a smart colleague who hasn't read the document.`;
}

export default function Documents() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState(null);       // stored after upload
  const [summary, setSummary] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setDocId(null);
    setSummary(null);
    setMessages([]);
    setLoading(true);
    try {
      const res = await summarizeDocument(f);
      setDocId(res.doc_id);
      setSummary(res.summary);
    } catch (e) {
      setSummary(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const ask = async () => {
    if (!question.trim() || !docId) return;
    const q = question.trim();
    setQuestion('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setQaLoading(true);
    try {
      const res = await askDocument(docId, q);
      // res.error means the backend lost the in-memory doc (stateless Cloud Run)
      // fall back to compliance endpoint with the summary we already have
      if (res.error || !res.answer) {
        const fallback = await askCompliance(buildDocPrompt(summary, q));
        setMessages(m => [...m, { role: 'ai', text: fallback.answer }]);
      } else {
        setMessages(m => [...m, { role: 'ai', text: res.answer }]);
      }
    } catch {
      try {
        const fallback = await askCompliance(buildDocPrompt(summary, q));
        setMessages(m => [...m, { role: 'ai', text: fallback.answer }]);
      } catch (e2) {
        setMessages(m => [...m, { role: 'error', text: e2.message }]);
      }
    } finally {
      setQaLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const dropZoneStyle = {
    border: `2px dashed ${drag ? 'var(--cyan)' : file ? 'rgba(0,229,195,0.3)' : 'var(--border2)'}`,
    borderRadius: 'var(--radius-xl)',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: drag ? 'var(--cyan-dim)' : file ? 'rgba(0,229,195,0.04)' : 'var(--bg2)',
    marginBottom: 16,
  };

  return (
    <PageLayout title="Document Intelligence" subtitle="Upload any banking document · AI summary + Q&A in plain English">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 1100 }}>

        {/* Upload + Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={dropZoneStyle}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
            <div style={{
              width: 48, height: 48,
              background: file ? 'var(--cyan-dim)' : 'var(--bg3)',
              border: `1px solid ${file ? 'rgba(0,229,195,0.3)' : 'var(--border)'}`,
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
              color: file ? 'var(--cyan)' : 'var(--text3)',
            }}>
              {file ? <FileText size={22} strokeWidth={1.5} /> : <Upload size={22} strokeWidth={1.5} />}
            </div>
            {file ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>
                  {(file.size / 1024).toFixed(0)} KB · Click to replace
                </div>
                {docId && (
                  <div style={{ fontSize: 10, color: 'var(--cyan)', marginTop: 6, fontFamily: 'var(--mono)' }}>
                    doc_id: {docId.slice(0, 8)}...
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Drop your document here</div>
                <div style={{ fontSize: 12, color: '#475569' }}>PDF, DOCX, TXT · Contracts, loan docs, compliance files</div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={14} color="var(--cyan)" strokeWidth={2} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Instant Summary</span>
            </div>
            <div style={{ padding: 18, minHeight: 200 }}>
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 0' }}>
                  <Loader size={24} color="var(--cyan)" style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>Analyzing document...</div>
                </div>
              )}
              {!loading && !summary && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
                  <FileText size={28} strokeWidth={1} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 12 }}>Upload a document to get an AI summary</div>
                </div>
              )}
              {!loading && summary && (
                <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, whiteSpace: 'pre-wrap', animation: 'fade-in 0.4s ease forwards' }}>
                  {summary}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Q&A Chat */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={14} color="var(--indigo)" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Ask Anything</span>
            {docId && (
              <div style={{
                marginLeft: 'auto', fontSize: 10, color: 'var(--cyan)',
                background: 'var(--cyan-dim)', border: '1px solid rgba(0,229,195,0.2)',
                padding: '2px 8px', borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <FileText size={9} />{file?.name}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && !docId && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#475569', padding: '40px 0', textAlign: 'center' }}>
                <MessageSquare size={28} strokeWidth={1} />
                <div style={{ fontSize: 12 }}>Upload a document first, then ask specific questions</div>
              </div>
            )}
            {messages.length === 0 && docId && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                <div style={{ fontSize: 12, color: '#475569', width: '100%', marginBottom: 4 }}>Try asking:</div>
                {['What are the key terms?', 'Summarize the risk factors', 'What are the payment obligations?', 'Any compliance requirements?'].map(q => (
                  <button key={q} onClick={() => { setQuestion(q); }}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 12px', fontSize: 11.5, color: '#94A3B8', cursor: 'pointer' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 8, animation: 'fade-in 0.25s ease forwards' }}>
                {m.role !== 'user' && (
                  <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: 'var(--indigo-dim)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)', marginTop: 2 }}>
                    <FileText size={12} />
                  </div>
                )}
                <div style={{
                  maxWidth: '85%',
                  background: m.role === 'user' ? 'var(--indigo-dim)' : 'var(--bg3)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(129,140,248,0.2)' : 'var(--border)'}`,
                  borderRadius: m.role === 'user' ? '10px 10px 4px 10px' : '4px 10px 10px 10px',
                  padding: '9px 12px', fontSize: 12.5,
                  color: m.role === 'error' ? 'var(--red)' : 'var(--text)',
                  lineHeight: 1.6, whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {qaLoading && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--indigo-dim)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)' }}>
                  <FileText size={12} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 10px 10px 10px', padding: '10px 14px', display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--indigo)', animation: `pulse-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask()}
              placeholder={docId ? 'Ask a question about the document...' : 'Upload a document first...'}
              disabled={!docId}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '9px 13px', color: 'var(--text)',
                fontSize: 13, outline: 'none', opacity: docId ? 1 : 0.5,
              }}
            />
            <button onClick={ask} disabled={!docId || !question.trim() || qaLoading}
              style={{
                width: 38, height: 38,
                background: docId && question.trim() ? 'var(--indigo)' : 'var(--bg4)',
                border: 'none', borderRadius: 8, color: '#fff',
                cursor: docId && question.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  );
}