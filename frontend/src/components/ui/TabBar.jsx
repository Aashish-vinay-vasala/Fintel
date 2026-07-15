export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="viq-tabs">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`viq-tab${active === t.id ? ' active' : ''}`}
        >
          <t.icon size={14} strokeWidth={1.85} style={{ flexShrink: 0 }} />
          {t.label}
        </button>
      ))}
    </div>
  );
}
