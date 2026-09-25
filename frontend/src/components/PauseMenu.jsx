import { useNavigate } from 'react-router-dom';
import McButton from './McButton';

export default function PauseMenu({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  const quit = () => {
    localStorage.removeItem('aquasense_token');
    localStorage.removeItem('aquasense_user');
    navigate('/login');
  };

  return (
    <div className="pause-overlay" onClick={onClose}>
      <div className="pause-menu" onClick={(e) => e.stopPropagation()}>
        <h2 className="pause-title">Game Menu</h2>
        <div className="pause-stack">
          <McButton wide onClick={onClose}>Back to Game</McButton>
          <McButton wide onClick={() => { onClose(); navigate('/options'); }}>Options...</McButton>
          <McButton wide onClick={() => { onClose(); navigate('/world'); }}>Open to LAN / Map</McButton>
          <McButton wide variant="dirt" onClick={quit}>Save and Quit to Title</McButton>
        </div>
        <p className="pause-hint">Press ESC to resume</p>
      </div>
    </div>
  );
}
