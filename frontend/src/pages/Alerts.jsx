import { useEffect, useState } from 'react';
import { alertsAPI } from '../api/client';
import { FiAlertTriangle, FiCheckCircle, FiShield } from 'react-icons/fi';

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alertsAPI.list(100)
      .then((res) => setAlerts(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Safety Alerts</h1>
        <p className="page-subtitle">Readings that exceeded safe WHO thresholds</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiShield style={{ color: 'var(--accent-blue)' }} /> WHO Safe Water Thresholds
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'pH', range: '6.5 – 8.5', icon: '🧪' },
            { label: 'TDS', range: '≤ 500 mg/L', icon: '💧' },
            { label: 'Turbidity', range: '≤ 4.0 NTU', icon: '🌫️' },
            { label: 'Temperature', range: '10 – 35 °C', icon: '🌡️' },
          ].map((t) => (
            <div key={t.label} className="info-slot" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--accent-green)', fontWeight: 700 }}>{t.range}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className={`quality-badge ${alerts.length > 0 ? 'unsafe' : 'safe'}`}>
          {alerts.length > 0 ? `${alerts.length} Active Alerts` : 'All Clear'}
        </span>
        {alerts.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>All sensor readings are within safe limits.</span>}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : alerts.length === 0 ? (
        <div className="empty-state card">
          <FiCheckCircle size={48} style={{ color: 'var(--accent-green)' }} />
          <h3 style={{ color: 'var(--accent-green)' }}>Water is Safe</h3>
          <p>No threshold violations detected. Water quality is within WHO safe limits.</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((a, i) => (
            <div key={i} className="alert-item" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="alert-icon"><FiAlertTriangle size={24} style={{ color: 'var(--accent-red)' }} /></div>
              <div className="alert-content">
                <div className="alert-device">{a.device_id} · {a.location || 'Main Tank'}</div>
                <div className="alert-messages">
                  {(a.alerts || []).map((msg, j) => (
                    <div key={j} className="alert-msg">⚠ {msg}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'pH', value: a.ph?.toFixed(2) },
                    { label: 'TDS', value: `${a.tds?.toFixed(1)} mg/L` },
                    { label: 'Turbidity', value: `${a.turbidity?.toFixed(2)} NTU` },
                    { label: 'Temp', value: `${a.temperature?.toFixed(1)}°C` },
                  ].map((s) => (
                    <span key={s.label} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{s.label}:</span> {s.value}
                    </span>
                  ))}
                </div>
                <div className="alert-time">{formatTime(a.timestamp)}</div>
              </div>
              <div>
                <span className={`quality-badge ${a.quality}`}>{a.quality}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
