/**
 * MetricCard — inventory-slot style sensor reading
 */
export default function MetricCard({ label, value, unit, status = 'safe', icon }) {
  const statusLabel = {
    safe: 'Normal',
    warn: 'Warning',
    danger: 'Alert',
  }[status] || 'Normal';

  const accent = {
    safe: 'repeating-linear-gradient(90deg, #47d45a 0 8px, #2ea043 8px 16px)',
    warn: 'repeating-linear-gradient(90deg, #fce950 0 8px, #c9b12a 8px 16px)',
    danger: 'repeating-linear-gradient(90deg, #ff4a4a 0 8px, #b01c1c 8px 16px)',
  }[status];

  return (
    <div className="metric-card" style={{ '--card-accent': accent }}>
      <div
        className={`metric-status ${status}`}
        title={statusLabel}
      />

      <div style={{ fontSize: '1.6rem', marginBottom: '0.45rem', filter: 'contrast(1.1)' }}>{icon}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value !== null && value !== undefined ? value : '--'}
      </div>
      <div className="metric-unit">{unit}</div>
    </div>
  );
}
