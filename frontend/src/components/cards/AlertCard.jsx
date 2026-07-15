const cfg = {
  critical: { bar: '#ef4444', bg: 'rgba(239,68,68,0.1)',  text: '#f87171', label: 'Critical' },
  warning:  { bar: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', label: 'Warning' },
  info:     { bar: 'var(--accent)', bg: 'var(--accent-bg)', text: 'var(--accent)', label: 'Info' },
};

export default function AlertCard({ alert }) {
  const c = cfg[alert.level] || cfg.info;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '10px 12px', borderRadius: 10, transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 99, background: c.bar, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.title}</p>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 99, background: c.bg, color: c.text, letterSpacing: '0.3px',
          }}>{c.label}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{alert.desc}</p>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>{alert.time}</span>
    </div>
  );
}