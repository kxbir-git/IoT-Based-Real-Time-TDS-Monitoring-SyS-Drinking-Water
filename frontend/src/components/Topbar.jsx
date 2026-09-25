import { format } from 'date-fns';
import { FiBell, FiDroplet } from 'react-icons/fi';

export default function Topbar({ breadcrumbs }) {
  const now = new Date();
  const timeStr = format(now, 'HH:mm');
  const dateStr = format(now, 'dd MMM yyyy');
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('aquasense_user') || '{}'); } catch { return {}; }
  })();

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <FiDroplet size={14} style={{ color: 'var(--accent-blue)' }} />
        AquaSense
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx}> / <span style={{ color: '#fff' }}>{crumb}</span></span>
        ))}
      </div>

      <div className="topbar-actions">
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.3 }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>{timeStr}</span>
          <span>{dateStr}</span>
        </div>
        <button className="icon-btn" aria-label="Notifications" style={{ position: 'relative' }}>
          <FiBell />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 7, height: 7,
            background: 'var(--accent-red)',
            borderRadius: '50%',
            border: '1px solid var(--bg-main)',
          }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border-light)', borderRadius: 50, padding: '4px 12px 4px 4px' }}>
          <img
            src={`https://i.pravatar.cc/150?u=${user.email || 'aquasense'}`}
            alt="Profile"
            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
