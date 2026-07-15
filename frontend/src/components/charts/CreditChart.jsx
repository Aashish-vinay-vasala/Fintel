import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Approved", value: 60 },
  { name: "Rejected", value: 20 },
  { name: "Review",   value: 20 },
];

const LIGHT_COLORS = ["#34d399", "#f87171", "#fbbf24"];
const DARK_COLORS  = ["#4ade80", "#f87171", "#fbbf24"];

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const dark = isDark();
  return (
    <div style={{
      background: dark ? '#1c2333' : '#ffffff',
      border: `1px solid ${dark ? 'rgba(148,163,184,0.15)' : '#f1f5f9'}`,
      borderRadius: 10, padding: '8px 12px',
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: dark ? '#e2e8f0' : '#374151', marginBottom: 2 }}>{payload[0].name}</p>
      <p style={{ fontSize: 12, fontWeight: 700, color: payload[0].payload.fill }}>{payload[0].value}%</p>
    </div>
  );
};

export default function CreditChart() {
  const dark = isDark();
  const colors = dark ? DARK_COLORS : LIGHT_COLORS;
  const legendColor = dark ? '#4b5563' : '#9ca3af';

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="45%"
          innerRadius={52} outerRadius={76}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={colors[i]}
              style={{ filter: dark ? `drop-shadow(0 0 6px ${colors[i]}60)` : 'none' }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: '11px', color: legendColor }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}