import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const cfg = {
  success: { badge: 'rgba(34,197,94,0.1)',  text: '#4ade80', dot: '#22c55e', glow: 'rgba(34,197,94,0.3)',  TrendIcon: TrendingUp   },
  danger:  { badge: 'rgba(239,68,68,0.1)',   text: '#f87171', dot: '#ef4444', glow: 'rgba(239,68,68,0.3)',  TrendIcon: TrendingUp   },
  warning: { badge: 'rgba(245,158,11,0.1)',  text: '#fbbf24', dot: '#f59e0b', glow: 'rgba(245,158,11,0.3)', TrendIcon: Minus        },
  info:    { badge: 'rgba(129,140,248,0.1)', text: 'var(--accent)', dot: 'var(--accent)', glow: 'var(--accent-glow)', TrendIcon: TrendingUp },
};

export default function MetricCard({ label, value, change, changeType }) {
  const c = cfg[changeType] || cfg.info;
  const { TrendIcon } = c;
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`viq-card${visible ? ' fade-up' : ''}`}
      style={{ padding: '20px 20px 18px', cursor: 'default' }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>{label}</p>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: c.badge,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendIcon size={12} color={c.text} strokeWidth={2.5} />
        </div>
      </div>

      {/* Value */}
      <p style={{
        fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
        letterSpacing: '-1px', lineHeight: 1, marginBottom: 14,
        animation: visible ? 'countUp 0.4s cubic-bezier(0.22,1,0.36,1) both' : 'none',
        animationDelay: '0.1s',
      }}>{value}</p>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 99, background: c.badge,
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: c.dot, boxShadow: `0 0 6px ${c.glow}`,
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{change}</span>
      </div>
    </div>
  );
}