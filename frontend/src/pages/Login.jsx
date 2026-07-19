import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      nav('/', { replace: true });
    }
  };

  const inp = (extra = {}) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    padding: '12px 15px',
    color: '#E0E7FF',
    fontSize: 13.5,
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
    boxSizing: 'border-box',
    ...extra,
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: '#080C18',
    }}>
      {/* Background blobs */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 20% 20%, rgba(99,102,241,0.20) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(139,92,246,0.14) 0%, transparent 55%), radial-gradient(ellipse 40% 40% at 70% 10%, rgba(16,185,129,0.08) 0%, transparent 50%)' }} />

      {/* Grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize:'44px 44px', pointerEvents:'none' }} />

      {/* Stats bar — top */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:44, borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', gap:40, fontSize:10.5, color:'#334155', fontFamily:'var(--mono)' }}>
        {[
          { label:'Transactions Monitored', val:'2.4M' },
          { label:'Fraud Prevented Today',  val:'$1.8M' },
          { label:'Compliance Score',       val:'99.2%' },
          { label:'Models Active',          val:'14' },
        ].map(({label,val}) => (
          <span key={label}>
            <span style={{ color:'#818CF8', fontWeight:600 }}>{val}</span>
            <span style={{ marginLeft:6 }}>{label}</span>
          </span>
        ))}
      </div>

      {/* Card */}
      <div style={{
        position:'relative', width:440,
        background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.09)',
        borderRadius:22,
        overflow:'hidden',
        boxShadow:'0 0 0 1px rgba(99,102,241,0.10), 0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.08)',
        animation:'fade-in 0.4s cubic-bezier(0.4,0,0.2,1) forwards',
      }}>
        {/* Top accent */}
        <div style={{ height:2, background:'linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4)' }} />

        <div style={{ padding:'36px 40px 32px' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
            <div style={{
              width:44, height:44, flexShrink:0,
              background:'linear-gradient(140deg, #6366F1, #8B5CF6)',
              borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 6px 24px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}>
              <Zap size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:24, letterSpacing:'-0.7px', color:'#E0E7FF', lineHeight:1 }}>
                Fin<span style={{ background:'linear-gradient(135deg,#818CF8,#A78BFA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>tel</span>
              </div>
              <div style={{ fontSize:8.5, color:'#1E293B', letterSpacing:'1.4px', marginTop:5, fontWeight:700, textTransform:'uppercase' }}>AI Banking Intelligence</div>
            </div>
          </div>

          <div style={{ marginBottom:26 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, letterSpacing:'-0.5px', color:'#E0E7FF', marginBottom:6 }}>
              Welcome back
            </div>
            <div style={{ fontSize:13, color:'#334155', lineHeight:1.55 }}>Sign in to your intelligence platform</div>
          </div>

          {/* Demo pills */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:9.5, fontWeight:700, color:'#1E293B', letterSpacing:'0.9px', textAlign:'center', marginBottom:10, textTransform:'uppercase' }}>
              Quick Demo Access
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {[
                { role:'Analyst', email:'analyst@fintel.demo', pw:'demo1234' },
                { role:'Manager', email:'manager@fintel.demo', pw:'demo1234' },
                { role:'Auditor', email:'auditor@fintel.demo', pw:'demo1234' },
              ].map(d => (
                <button key={d.role} type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pw); setError(''); }}
                  style={{
                    flex:1, padding:'9px 6px',
                    border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
                    background:'rgba(255,255,255,0.04)', cursor:'pointer', textAlign:'center',
                    transition:'all 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.40)'; e.currentTarget.style.background='rgba(99,102,241,0.12)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.transform='none'; }}
                >
                  <div style={{ fontSize:12, fontWeight:700, color:'#C7D2FE', fontFamily:'var(--font-display)', letterSpacing:'-0.1px' }}>{d.role}</div>
                  <div style={{ fontSize:9.5, color:'#334155', marginTop:2, fontFamily:'var(--mono)' }}>{d.email.split('@')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} noValidate>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:10, fontWeight:700, color:'#334155', letterSpacing:'0.9px', textTransform:'uppercase', display:'block', marginBottom:8 }}>
                Email address
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@bank.com" autoComplete="email"
                style={inp()}
                onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.55)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.14)'; e.target.style.background='rgba(255,255,255,0.07)'; }}
                onBlur={e =>  { e.target.style.borderColor='rgba(255,255,255,0.10)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.05)'; }}
              />
            </div>

            <div style={{ marginBottom:22 }}>
              <label style={{ fontSize:10, fontWeight:700, color:'#334155', letterSpacing:'0.9px', textTransform:'uppercase', display:'block', marginBottom:8 }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••" autoComplete="current-password"
                  style={inp({ paddingRight:46 })}
                  onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.55)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.14)'; e.target.style.background='rgba(255,255,255,0.07)'; }}
                  onBlur={e =>  { e.target.style.borderColor='rgba(255,255,255,0.10)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.05)'; }}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{
                  position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'#334155', cursor:'pointer', padding:0,
                }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom:14, padding:'11px 14px', background:'rgba(248,113,113,0.09)', border:'1px solid rgba(248,113,113,0.22)', borderRadius:10, fontSize:12.5, color:'#F87171' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px',
              background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              border: loading ? '1px solid rgba(255,255,255,0.09)' : 'none',
              borderRadius:12,
              color: loading ? '#334155' : '#fff',
              fontWeight:700, fontSize:14.5,
              cursor: loading ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              fontFamily:'var(--font-display)', letterSpacing:'-0.2px',
              boxShadow: loading ? 'none' : '0 6px 28px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.20)',
              transition:'all 0.2s ease',
            }}
              onMouseEnter={e => { if(!loading){ e.currentTarget.style.boxShadow='0 10px 36px rgba(99,102,241,0.60), inset 0 1px 0 rgba(255,255,255,0.20)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
              onMouseLeave={e => { if(!loading){ e.currentTarget.style.boxShadow='0 6px 28px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.20)'; e.currentTarget.style.transform='none'; }}}
            >
              {loading
                ? <><span style={{ animation:'pulse-dot 1s infinite' }}>●</span> Signing in...</>
                : <>Sign in <ArrowRight size={16}/></>
              }
            </button>
          </form>

          <div style={{ marginTop:20, padding:'11px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, display:'flex', alignItems:'center', gap:9 }}>
            <Lock size={13} color="#334155" />
            <span style={{ fontSize:11.5, color:'#1E293B', lineHeight:1.5 }}>
              256-bit AES encryption · SOC 2 Type II · FFIEC compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
