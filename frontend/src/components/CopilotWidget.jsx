import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X, Send, FileText, Check, CheckCircle, XCircle } from 'lucide-react';
import { copilotChat } from '../services/api';

const ICON_SIZE = 56;
const PANEL_W = 380;
const PANEL_H = 520;
const POS_KEY = 'fintel_copilot_pos';

const PAGE_INFO = {
  '/':               { title: 'Dashboard',            description: 'High-level overview of fraud, credit, risk, and compliance metrics across the bank.' },
  '/fraud':          { title: 'Fraud Detection',       description: 'Real-time transaction fraud scoring and analysis.' },
  '/credit-suite':   { title: 'Credit Suite',          description: 'Credit risk scoring and loan underwriting decisions.' },
  '/risk':           { title: 'Risk Management',       description: 'Portfolio risk ratios, capital adequacy, and regulatory risk metrics.' },
  '/loans':          { title: 'Loan Monitor',          description: 'Loan portfolio health, early warning indicators, and watchlist loans.' },
  '/treasury':       { title: 'Treasury',              description: 'Treasury and liquidity management tools.' },
  '/compliance-hub': { title: 'Compliance Hub',        description: 'Regulatory Q&A, transaction screening, and regulatory change tracking.' },
  '/aml':            { title: 'AML',                   description: 'Anti-money-laundering narrative analysis and customer screening.' },
  '/model-risk':     { title: 'Model Risk',            description: 'Model risk management and validation.' },
  '/customer-intel': { title: 'Customer Intelligence', description: 'Customer 360 profiles and behavioral risk insights.' },
  '/benchmarking':   { title: 'Peer Benchmarking',     description: 'Bank performance versus industry peer benchmarks.' },
  '/risk-assets':    { title: 'Risk Assets',           description: 'Risk-weighted asset analysis.' },
  '/reports':        { title: 'Reports',               description: 'Generating regulatory and executive reports (SAR, CTR, board summaries).' },
  '/documents':      { title: 'Documents',             description: 'Document upload, summarization, and Q&A.' },
  '/settings':       { title: 'Settings',              description: 'Platform and account settings.' },
};

function pageInfoFor(pathname) {
  if (PAGE_INFO[pathname]) return PAGE_INFO[pathname];
  const slug = pathname.replace(/^\//, '').replace(/-/g, ' ') || 'Fintel';
  const title = slug.replace(/\b\w/g, c => c.toUpperCase());
  return { title, description: '' };
}

function defaultPos() {
  return { left: window.innerWidth - ICON_SIZE - 24, top: window.innerHeight - ICON_SIZE - 24 };
}

function loadPos() {
  try {
    const saved = JSON.parse(localStorage.getItem(POS_KEY));
    if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
      return {
        left: Math.min(Math.max(saved.left, 0), window.innerWidth - ICON_SIZE),
        top:  Math.min(Math.max(saved.top, 0), window.innerHeight - ICON_SIZE),
      };
    }
  } catch { /* ignore, fall through to default */ }
  return defaultPos();
}

// ─── Result-card building blocks ────────────────────────────────────────
function badgeColor(value) {
  const v = String(value).toUpperCase();
  if (['APPROVE', 'APPROVED', 'LOW', 'COMPLIANT', 'EXCELLENT', 'GOOD', 'CLEAR', 'PASS'].some(x => v.includes(x))) return 'green';
  if (['REVIEW', 'MEDIUM', 'FAIR', 'WATCH', 'MONITOR'].some(x => v.includes(x))) return 'amber';
  if (['BLOCK', 'REJECTED', 'HIGH', 'CRITICAL', 'POOR', 'REQUIRES_ACTION', 'RESTRUCTURE', 'WRITE-OFF', 'NOT_FOUND'].some(x => v.includes(x))) return 'red';
  return 'neutral';
}

const BADGE_COLORS = {
  green:   ['var(--green-dim)', 'var(--green)'],
  amber:   ['var(--amber-dim)', 'var(--amber)'],
  red:     ['var(--red-dim)', 'var(--red)'],
  neutral: ['rgba(255,255,255,0.06)', 'var(--text2)'],
};

function Badge({ text, color }) {
  const [bg, fg] = BADGE_COLORS[color] || BADGE_COLORS.neutral;
  return <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: bg, color: fg, whiteSpace: 'nowrap' }}>{String(text)}</span>;
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0' }}>
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</span>
    </div>
  );
}

function Bullets({ items }) {
  if (!items?.length) return null;
  return (
    <ul style={{ margin: '4px 0 0 0', paddingLeft: 15 }}>
      {items.map((it, i) => <li key={i} style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2, lineHeight: 1.5 }}>{typeof it === 'string' ? it : (it.action || it.indicator || JSON.stringify(it))}</li>)}
    </ul>
  );
}

function CardWrap({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{children}</div>;
}

function ResultCard({ tool, result }) {
  if (!result) return null;

  if (tool === 'fraud_check') {
    return (
      <CardWrap>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge text={result.recommendation} color={badgeColor(result.recommendation)} />
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{(result.fraud_score * 100).toFixed(1)}% fraud score</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6 }}>{result.explanation}</div>
      </CardWrap>
    );
  }

  if (tool === 'credit_evaluate') {
    return (
      <CardWrap>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge text={result.decision} color={badgeColor(result.decision)} />
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{(result.approval_score * 100).toFixed(0)}% approval score</span>
        </div>
        <Row label="Suggested Limit" value={`$${Number(result.suggested_limit).toLocaleString()}`} />
        <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6 }}>{result.explanation}</div>
      </CardWrap>
    );
  }

  if (tool === 'risk_analyze') {
    const r = result.ratios || {};
    return (
      <CardWrap>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge text={result.risk_score?.rating} color={badgeColor(result.risk_score?.rating)} />
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{result.risk_score?.score}/100</span>
        </div>
        <Row label="NPA Ratio" value={`${r.npa_ratio}%`} />
        <Row label="Tier 1 Capital Ratio" value={`${r.tier1_capital_ratio}%`} />
        <Row label="Liquidity Ratio" value={`${r.liquidity_ratio}%`} />
        <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6 }}>{result.explanation}</div>
        <Bullets items={result.recommendations} />
      </CardWrap>
    );
  }

  if (tool === 'compliance_check_transaction') {
    return (
      <CardWrap>
        <Badge text={result.status} color={badgeColor(result.status)} />
        {(result.flags || []).map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <Badge text={f.severity} color={badgeColor(f.severity === 'high' ? 'HIGH' : f.severity === 'medium' ? 'MEDIUM' : 'LOW')} />
            <span style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}><strong style={{ color: 'var(--text)' }}>{f.rule}:</strong> {f.detail}</span>
          </div>
        ))}
      </CardWrap>
    );
  }

  if (tool === 'aml_analyze_narrative') {
    return (
      <CardWrap>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge text={result.risk_level} color={badgeColor(result.risk_level)} />
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{result.risk_score}/100</span>
        </div>
        <Bullets items={result.red_flags} />
        <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6 }}>{result.recommendation}</div>
      </CardWrap>
    );
  }

  if (tool === 'aml_screen_customer') {
    return (
      <CardWrap>
        <Badge text={result.risk_level} color={badgeColor(result.risk_level)} />
        {(result.checks || []).map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
            {c.passed ? <CheckCircle size={11} color="var(--green)" /> : <XCircle size={11} color="var(--red)" />}
            <span style={{ color: 'var(--text2)' }}>{c.name}</span>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6 }}>{result.recommendation}</div>
      </CardWrap>
    );
  }

  if (tool === 'loans_monitor') {
    return (
      <CardWrap>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge text={result.rating} color={badgeColor(result.rating)} />
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{result.health_score}/100 · {result.ewi_count} warnings</span>
        </div>
        {(result.loan_analysis || []).map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
            <Badge text={l.action} color={badgeColor(l.action)} />
            <span style={{ color: 'var(--text2)' }}>{l.borrower} — {l.note}</span>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6 }}>{result.summary}</div>
        <Bullets items={result.recommendations} />
      </CardWrap>
    );
  }

  if (tool === 'reports_generate') {
    return (
      <CardWrap>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{result.label}</div>
        <div style={{ maxHeight: 220, overflowY: 'auto', fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 6, padding: 8 }}>
          {result.content}
        </div>
      </CardWrap>
    );
  }

  return <div style={{ fontSize: 11, color: 'var(--text2)' }}>{JSON.stringify(result)}</div>;
}

export default function CopilotWidget() {
  const location = useLocation();
  const [pos, setPos] = useState(loadPos);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const dragRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, originLeft: pos.left, originTop: pos.top, moved: false };
    e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
    const left = Math.min(Math.max(d.originLeft + dx, 0), window.innerWidth - ICON_SIZE);
    const top  = Math.min(Math.max(d.originTop + dy, 0), window.innerHeight - ICON_SIZE);
    setPos({ left, top });
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (!d.moved) {
      setOpen(o => !o);
    } else {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    }
  };

  const handleResponse = (res) => {
    if (res.type === 'confirm') {
      setMessages(m => [...m, { role: 'confirm', message: res.message, tool: res.tool, label: res.label, args: res.args }]);
      setPendingAction({ name: res.tool, args: res.args });
    } else if (res.type === 'result') {
      setMessages(m => [...m, { role: 'result', tool: res.tool, label: res.label, result: res.result }]);
      setPendingAction(null);
    } else {
      setMessages(m => [...m, { role: 'ai', text: res.answer || 'No response received.' }]);
    }
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || pendingAction) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const history = messages.filter(m => m.role === 'user' || m.role === 'ai').slice(-6).map(m => ({ role: m.role, text: m.text }));
      const res = await copilotChat({ message: msg, page: pageInfoFor(location.pathname), history });
      handleResponse(res);
    } catch (e) {
      setMessages(m => [...m, { role: 'error', text: e.message }]);
    } finally {
      setLoading(false);
    }
  };

  const confirmYes = async () => {
    if (!pendingAction || loading) return;
    setLoading(true);
    setMessages(m => [...m, { role: 'user', text: 'Yes, proceed.' }]);
    try {
      const res = await copilotChat({ message: 'Yes, proceed.', page: pageInfoFor(location.pathname), history: [], pendingAction, confirm: true });
      handleResponse(res);
    } catch (e) {
      setMessages(m => [...m, { role: 'error', text: e.message }]);
    } finally {
      setLoading(false);
    }
  };

  const confirmNo = () => {
    if (!pendingAction) return;
    setMessages(m => [...m, { role: 'user', text: 'No, cancel.' }, { role: 'ai', text: 'Okay, cancelled — no action was taken.' }]);
    setPendingAction(null);
  };

  const page = pageInfoFor(location.pathname);
  const panelLeft = pos.left < window.innerWidth / 2 ? pos.left : pos.left + ICON_SIZE - PANEL_W;
  const openUp = pos.top > window.innerHeight / 2;
  const panelVertical = openUp
    ? { bottom: window.innerHeight - pos.top + 10 }
    : { top: pos.top + ICON_SIZE + 10 };

  return (
    <>
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title="Fintel Copilot"
        style={{
          position: 'fixed', left: pos.left, top: pos.top, width: ICON_SIZE, height: ICON_SIZE,
          borderRadius: '50%', border: '1px solid rgba(167,139,250,0.35)',
          background: 'linear-gradient(135deg, var(--indigo) 0%, #6D28D9 100%)',
          boxShadow: 'var(--shadow-blue)', color: '#fff', cursor: 'grab',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, touchAction: 'none', userSelect: 'none',
        }}
      >
        <Sparkles size={22} strokeWidth={2} />
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', left: panelLeft, width: PANEL_W, height: PANEL_H, ...panelVertical,
            background: '#12162A', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            zIndex: 9998, animation: 'fade-in 0.2s ease forwards',
          }}
        >
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={14} color="var(--indigo)" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Fintel Copilot</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', background: 'var(--indigo-dim)', color: 'var(--indigo)', border: '1px solid rgba(167,139,250,0.2)', padding: '1px 7px', borderRadius: 4 }}>BETA</span>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}>
              <X size={15} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>
                  I can answer questions, summarize the <strong style={{ color: 'var(--text2)' }}>{page.title}</strong> page, or run a fraud/credit/risk/compliance/AML/loan/report analysis for you.
                </div>
                <button
                  onClick={() => send('Summarize this page for me.')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 12px', fontSize: 11.5, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font)', width: 'fit-content' }}
                >
                  <FileText size={12} /> Summarize this page
                </button>
              </div>
            )}
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              if (m.role === 'confirm') {
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, animation: 'fade-in 0.25s ease forwards' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: 'var(--indigo-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)', marginTop: 2 }}>
                      <Sparkles size={11} />
                    </div>
                    <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '3px 10px 10px 10px', padding: '8px 11px', fontSize: 12, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {m.message}
                      </div>
                      {isLast && pendingAction && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={confirmYes} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 7, padding: '5px 11px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                            <Check size={12} /> Yes, proceed
                          </button>
                          <button onClick={confirmNo} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 11px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              if (m.role === 'result') {
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, animation: 'fade-in 0.25s ease forwards' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: 'var(--indigo-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)', marginTop: 2 }}>
                      <Sparkles size={11} />
                    </div>
                    <div style={{ maxWidth: '88%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '3px 10px 10px 10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>{m.label}</div>
                      <ResultCard tool={m.tool} result={m.result} />
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 8, animation: 'fade-in 0.25s ease forwards' }}>
                  {m.role !== 'user' && (
                    <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: m.role === 'error' ? 'var(--red-dim)' : 'var(--indigo-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.role === 'error' ? 'var(--red)' : 'var(--indigo)', marginTop: 2 }}>
                      <Sparkles size={11} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '82%', background: m.role === 'user' ? 'var(--indigo-dim)' : 'var(--bg3)',
                    border: `1px solid ${m.role === 'user' ? 'rgba(167,139,250,0.2)' : 'var(--border)'}`,
                    borderRadius: m.role === 'user' ? '10px 10px 3px 10px' : '3px 10px 10px 10px',
                    padding: '8px 11px', fontSize: 12, color: m.role === 'error' ? 'var(--red)' : 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--indigo-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)' }}>
                  <Sparkles size={11} />
                </div>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '3px 10px 10px 10px', padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--indigo)', display: 'inline-block', animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={!!pendingAction}
              placeholder={pendingAction ? 'Respond to the pending action above...' : 'Ask the copilot...'}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 12.5, outline: 'none', fontFamily: 'var(--font)' }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim() || !!pendingAction}
              style={{ width: 34, height: 34, background: input.trim() && !pendingAction ? 'var(--indigo)' : 'var(--bg4)', border: 'none', borderRadius: 8, color: '#fff', cursor: input.trim() && !pendingAction ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
