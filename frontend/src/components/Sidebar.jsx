import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiPieChart, FiAlertCircle, 
  FiCpu, FiActivity, FiSettings, FiLogOut 
} from 'react-icons/fi';
import { TbWaveSine } from 'react-icons/tb';

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('aquasense_token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/analytics', label: 'Analytics', icon: FiPieChart },
    { path: '/alerts', label: 'Alerts', icon: FiAlertCircle },
    { path: '/devices', label: 'Devices', icon: FiCpu },
    { path: '/predict', label: 'Predict', icon: FiActivity },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <TbWaveSine color="#2d62ff" size={32} />
        </div>
        AquaSense
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="icon"><item.icon /></div>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-link" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }}>
          <div className="icon"><FiSettings /></div>
          Settings
        </button>
        <button className="nav-link" onClick={handleLogout} style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }}>
          <div className="icon"><FiLogOut /></div>
          Log out
        </button>
      </div>
    </aside>
  );
}
