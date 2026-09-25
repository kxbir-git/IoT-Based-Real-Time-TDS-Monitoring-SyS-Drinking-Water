import { NavLink } from 'react-router-dom';

const SLOTS = [
  { path: '/',          icon: '🟩', label: 'Overworld',    key: '1' },
  { path: '/analytics', icon: '📜', label: 'Advancements', key: '2' },
  { path: '/alerts',    icon: '🔴', label: 'Redstone',     key: '3' },
  { path: '/devices',   icon: '📦', label: 'Blocks',       key: '4' },
  { path: '/predict',   icon: '📘', label: 'Enchant',      key: '5' },
  { path: '/world',     icon: '🗺️', label: 'Map',          key: '6' },
  { path: '/chest',     icon: '🧰', label: 'Chest',        key: '7' },
  { path: '/options',   icon: '⚙️', label: 'Options',      key: '8' },
  { path: '/pause',     icon: '☰',  label: 'Pause',        key: '9', action: true },
];

export default function Hotbar({ onPause }) {
  return (
    <div className="hotbar" role="navigation" aria-label="Hotbar">
      {SLOTS.map((slot) => (
        slot.action ? (
          <button
            key={slot.key}
            className="hotbar-slot"
            title={`${slot.label} (${slot.key})`}
            onClick={onPause}
          >
            <span className="hotbar-icon">{slot.icon}</span>
            <span className="hotbar-key">{slot.key}</span>
          </button>
        ) : (
          <NavLink
            key={slot.path}
            to={slot.path}
            end={slot.path === '/'}
            className={({ isActive }) => `hotbar-slot ${isActive ? 'selected' : ''}`}
            title={`${slot.label} (${slot.key})`}
          >
            <span className="hotbar-icon">{slot.icon}</span>
            <span className="hotbar-key">{slot.key}</span>
          </NavLink>
        )
      ))}
    </div>
  );
}
