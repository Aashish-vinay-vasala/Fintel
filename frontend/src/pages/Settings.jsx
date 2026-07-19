import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, Globe, LogOut, ChevronRight,
  CheckCircle, Zap, Lock, Activity, Server
} from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';

function getAuth() {
  try { return JSON.parse(localStorage.getItem('fintel_auth') || '{}'); } catch { return {}; }
}

function initials(email) {
  if (!email) return 'U';
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
}

const Section = ({ title, children }) => (
  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 14 }}>
    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{title}</span>
    </div>
    <div>{children}</div>
  </div>
);

const Row = ({ icon: Icon, label, sublabel, right, danger, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background 0.15s',
  }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = danger ? 'var(--red-dim)' : 'var(--bg3)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
  >
    <div style={{
      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
      background: danger ? 'var(--red-dim)' : 'var(--cyan-dim)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: danger ? 'var(--red)' : 'var(--cyan)',
    }}>
      <Icon size={15} strokeWidth={1.9} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: danger ? 'var(--red)' : 'var(--text)' }}>{label}</div>
      {sublabel && <div style={{ fontSize: 11.5, color: '#475569', marginTop: 2 }}>{sublabel}</div>}
    </div>
    {right && <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--mono)' }}>{right}</div>}
    {onClick && <ChevronRight size={14} color="var(--text3)" />}
  </div>
);

const Toggle = ({ label, sublabel, icon: Icon, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', flexShrink: 0 }}>
      <Icon size={15} strokeWidth={1.9} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
      {sublabel && <div style={{ fontSize: 11.5, color: '#475569', marginTop: 2 }}>{sublabel}</div>}
    </div>
    <button onClick={() => onChange(!value)} style={{
      width: 42, height: 24, borderRadius: 12, border: 'none',
      background: value ? 'var(--cyan)' : 'var(--bg4)',
      cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: value ? 20 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      }} />
    </button>
  </div>
);

export default function Settings() {
  const navigate  = useNavigate();
  const auth      = getAuth();
  const email     = auth.email || 'user@bank.com';
  const loggedAt  = auth.loggedAt ? new Date(auth.loggedAt).toLocaleString() : '—';

  const [notifAlerts,  setNotifAlerts]  = useState(true);
  const [notifReports, setNotifReports] = useState(false);
  const [autoAnalyze,  setAutoAnalyze]  = useState(true);

  const logout = () => {
    localStorage.removeItem('fintel_auth');
    navigate('/login', { replace: true });
  };

  return (
    <PageLayout title="Settings" subtitle="Account, preferences, and system configuration">
      <div style={{ maxWidth: 680 }}>

        {/* Profile card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)',
          padding: '24px 24px 20px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          {/* Avatar */}
          <div style={{
            width: 60, height: 60, borderRadius: 18, flexShrink: 0,
            background: 'linear-gradient(140deg, #3B82F6, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
            color: '#fff', letterSpacing: '-0.5px',
            boxShadow: '0 4px 14px rgba(37,99,235,0.28)',
          }}>
            {initials(email)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              {email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            <div style={{ fontSize: 12.5, color: '#475569', marginTop: 3 }}>{email}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', padding: '3px 9px', borderRadius: 20, background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(37,99,235,0.18)' }}>
                ANALYST
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', padding: '3px 9px', borderRadius: 20, background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(5,150,105,0.18)' }}>
                ● ACTIVE SESSION
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Last sign in</div>
            <div style={{ fontSize: 11.5, color: '#94A3B8', fontFamily: 'var(--mono)' }}>{loggedAt}</div>
          </div>
        </div>

        {/* Account */}
        <Section title="Account">
          <Row icon={User}   label="Display name"  sublabel={email.split('@')[0]} right="Edit soon" />
          <Row icon={Globe}  label="Institution"   sublabel="Not set · add after Firebase setup" />
          <Row icon={Lock}   label="Password"      sublabel="Firebase authentication coming soon" />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Toggle icon={Bell}     label="Fraud alerts"         sublabel="Get notified on high-risk transactions"   value={notifAlerts}  onChange={setNotifAlerts} />
          <Toggle icon={Activity} label="Report generation"    sublabel="Alert when a report finishes generating"  value={notifReports} onChange={setNotifReports} />
          <Toggle icon={Zap}      label="Auto-analyze on upload" sublabel="Run AI summary immediately after document upload" value={autoAnalyze}  onChange={setAutoAnalyze} />
        </Section>

        {/* System */}
        <Section title="System">
          <Row icon={Server} label="AI Service"      sublabel="Groq · llama-3.3-70b-versatile"          right="Connected" />
          <Row icon={Shield}   label="Compliance data" sublabel="BSA · AML · KYC · OFAC · GLBA · FCRA"    right="Live" />
          <Row icon={CheckCircle} label="Platform version" sublabel="Fintel AI Banking OS"               right="v1.0.0" />
        </Section>

        {/* Danger zone */}
        <Section title="Session">
          <Row
            icon={LogOut} label="Sign out" danger
            sublabel="You will be returned to the login screen"
            onClick={logout}
          />
        </Section>

      </div>
    </PageLayout>
  );
}
