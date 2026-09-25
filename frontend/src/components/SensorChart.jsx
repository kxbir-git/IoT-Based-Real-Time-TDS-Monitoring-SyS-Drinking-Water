import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(26, 29, 45, 0.95)',
      border: '1px solid rgba(45, 98, 255, 0.3)',
      borderRadius: 12,
      padding: '0.75rem 1rem',
      fontSize: '0.82rem',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontSize: '0.78rem' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700, marginBottom: 2 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function SensorChart({ data = [], metrics = [], title }) {
  const COLORS = ['#2d62ff', '#10b981', '#f59e0b', '#ef4444'];

  const formatted = data.map((d) => ({
    ...d,
    time: d.timestamp
      ? (() => { try { return format(new Date(d.timestamp), 'HH:mm'); } catch { return ''; } })()
      : '',
  }));

  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}
          />
          {metrics.map((m, i) => (
            <Line
              key={m.key}
              type="monotone"
              dataKey={m.key}
              name={m.label}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
