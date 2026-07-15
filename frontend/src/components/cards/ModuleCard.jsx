import { ShieldCheck, CreditCard, FileCheck, Activity } from "lucide-react";

const icons = { shield: ShieldCheck, "credit-card": CreditCard, "file-check": FileCheck, activity: Activity };

const status = {
  active:   { dot: '#22c55e', text: '#4ade80', label: 'Active',  bg: 'rgba(34,197,94,0.1)',  glow: 'rgba(34,197,94,0.4)' },
  warning:  { dot: '#f59e0b', text: '#fbbf24', label: 'Warning', bg: 'rgba(245,158,11,0.1)', glow: 'rgba(245,158,11,0.4)' },
  inactive: { dot: '#6b7280', text: 'var(--text-muted)', label: 'Offline', bg: 'var(--bg-input)', glow: 'transparent' },
};

const barColor = (a) => a > 85 ? '#22c55e' : a > 70 ? '#f59e0b' : '#ef4444';
const barGlow  = (a) => a > 85 ? 'rgba(34,197,94,0.5)' : a > 70 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)';

export default function ModuleCard({ module: m }) {
  const Icon = icons[m.icon] || Activity;
  const s = status[m.status] || status.inactive;
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 14,
      padding: '18px',
      border: '1px solid var(--border-dim)',
      backgroundImage: 'var(--shine)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-dim)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color="var(--accent)" strokeWidth={2} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', borderRadius: 99, background: s.bg,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: s.dot, boxShadow: `0 0 5px ${s.glow}`,
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: s.text }}>{s.label}</span>
        </div>
      </div>

      {/* Name + stat */}
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{m.name}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>{m.stat}</p>

      {/* Accuracy bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Accuracy</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{m.accuracy}%</span>
      </div>
      <div style={{ width: '100%', height: 4, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${m.accuracy}%`, height: '100%',
          background: barColor(m.accuracy),
          boxShadow: `0 0 6px ${barGlow(m.accuracy)}`,
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  );
}