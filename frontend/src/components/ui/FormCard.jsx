import { useState } from "react";

export const card = {
  background: 'var(--bg-card)',
  borderRadius: 20,
  padding: '28px',
  border: '1px solid var(--border-dim)',
  backgroundImage: 'var(--shine)',
  boxShadow: 'var(--card-shadow)',
  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
};

export function Field({ label: lbl, hint, children }) {
  return (
    <div className="group mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {lbl}
        </label>
        {hint && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Input({ icon: Icon, suffix, ...props }) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value);

  return (
    <div className="relative group">
      {/* Glow ring on focus */}
      <div className="absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none"
        style={{
          opacity: focused ? 1 : 0,
          boxShadow: '0 0 0 3px var(--accent-bg)',
          borderRadius: 12,
        }} />

      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
          style={{ color: focused ? 'var(--accent)' : 'var(--text-muted)' }}>
          <Icon size={13} strokeWidth={2} />
        </div>
      )}

      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); setHasValue(!!e.target.value); props.onBlur?.(e); }}
        onChange={e => { setHasValue(!!e.target.value); props.onChange?.(e); }}
        className="w-full text-sm font-medium rounded-xl transition-all duration-200 outline-none"
        style={{
          padding: Icon ? '10px 14px 10px 34px' : '10px 14px',
          paddingRight: suffix ? 40 : 14,
          background: focused ? 'var(--bg-input-focus)' : 'var(--bg-input)',
          border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-mid)'}`,
          color: 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          caretColor: 'var(--accent)',
          transform: focused ? 'translateY(-1px)' : 'none',
          boxShadow: focused ? 'var(--input-shadow-focus)' : 'none',
        }}
      />

      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold pointer-events-none"
          style={{ color: 'var(--text-muted)' }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Select({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none"
        style={{ opacity: focused ? 1 : 0, boxShadow: '0 0 0 3px var(--accent-bg)', borderRadius: 12 }} />
      <select
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className="w-full text-sm font-medium rounded-xl outline-none appearance-none cursor-pointer transition-all duration-200"
        style={{
          padding: '10px 36px 10px 14px',
          background: focused ? 'var(--bg-input-focus)' : 'var(--bg-input)',
          border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-mid)'}`,
          color: 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          transform: focused ? 'translateY(-1px)' : 'none',
          boxShadow: focused ? 'var(--input-shadow-focus)' : 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
      >
        {children}
      </select>
    </div>
  );
}

export function Button({ children, loading, onClick, fullWidth = true, variant = 'primary', ...props }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="relative overflow-hidden rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '11px 20px',
        marginTop: 10,
        background: loading
          ? 'var(--accent-bg)'
          : 'var(--accent)',
        color: loading ? 'var(--accent)' : '#fff',
        border: loading ? '1px solid var(--accent-border)' : '1px solid transparent',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        boxShadow: loading ? 'none' : '0 2px 16px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.15)',
        opacity: loading ? 0.8 : 1,
      }}
      {...props}
    >
      {/* Shine overlay */}
      {!loading && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)' }} />
      )}
      {children}
    </button>
  );
}

export function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center fade-in"
      style={{ minHeight: 260 }}>
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-mid)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
          <Icon size={22} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
        </div>
        {/* Corner dots for visual interest */}
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
          style={{ background: 'var(--border-mid)' }} />
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--border-dim)' }} />
      </div>
      <p className="text-xs font-medium leading-relaxed max-w-[180px]"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
        {text}
      </p>
    </div>
  );
}

export function SectionTitle({ children, badge }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <p className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
        {children}
      </p>
      {badge && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)', letterSpacing: '0.03em' }}>
          {badge}
        </span>
      )}
    </div>
  );
}

export function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-dim)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        {label}
      </p>
      <p className="text-sm font-bold tracking-tight"
        style={{ color: accent || 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </p>
    </div>
  );
}

export function InfoBox({ children, title }) {
  return (
    <div className="rounded-xl p-4 mt-1"
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-dim)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}>
      {title && (
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {title}
        </p>
      )}
      {children}
    </div>
  );
}