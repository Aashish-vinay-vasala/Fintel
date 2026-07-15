import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { name: "Wire",  value: 38 },
  { name: "Card",  value: 28 },
  { name: "ACH",   value: 18 },
  { name: "Check", value: 10 },
  { name: "Zelle", value: 6  },
];

const LIGHT_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];
const DARK_COLORS  = ["#818cf8", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const dark = isDark();
  return (
    <div style={{
      background: dark ? '#1c2333' : '#ffffff',
      border: `1px solid ${dark ? 'rgba(148,163,184,0.15)' : '#f1f5f9'}`,
      borderRadius: 10, padding: '8px 12px',
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: dark ? '#e2e8f0' : '#374151', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 700, color: dark ? '#818cf8' : '#6366f1' }}>{payload[0].value}% of fraud</p>
    </div>
  );
};

export default function FraudChart() {
  const dark = isDark();
  const colors = dark ? DARK_COLORS : LIGHT_COLORS;
  const gridColor  = dark ? 'rgba(148,163,184,0.08)' : '#f3f4f6';
  const tickColor  = dark ? '#4b5563' : '#9ca3af';
  const cursorFill = dark ? 'rgba(255,255,255,0.04)' : '#f5f5f7';

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
        <Bar dataKey="value" radius={[5, 5, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}