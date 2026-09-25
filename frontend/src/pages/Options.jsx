import { useEffect, useState } from 'react';
import InventoryPanel from '../components/InventoryPanel';
import McButton from '../components/McButton';

const KEY = 'aquasense_options';

const DEFAULTS = {
  music: 70,
  sound: 80,
  fov: 70,
  difficulty: 'normal',
  night: false,
  particles: true,
  subtitles: true,
};

export default function Options() {
  const [opts, setOpts] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch {
      return DEFAULTS;
    }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('mc-night', !!opts.night);
  }, [opts.night]);

  const update = (patch) => {
    setOpts((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Options</h1>
        <p className="page-subtitle">Video, sound, and world difficulty</p>
      </div>

      <div className="options-grid">
        <InventoryPanel title="Music & Sounds">
          <label className="opt-row">
            <span>Music</span>
            <input type="range" min="0" max="100" value={opts.music} onChange={(e) => update({ music: Number(e.target.value) })} />
            <em>{opts.music}%</em>
          </label>
          <label className="opt-row">
            <span>Sound</span>
            <input type="range" min="0" max="100" value={opts.sound} onChange={(e) => update({ sound: Number(e.target.value) })} />
            <em>{opts.sound}%</em>
          </label>
        </InventoryPanel>

        <InventoryPanel title="Video Settings">
          <label className="opt-row">
            <span>FOV</span>
            <input type="range" min="30" max="110" value={opts.fov} onChange={(e) => update({ fov: Number(e.target.value) })} />
            <em>{opts.fov}</em>
          </label>
          <label className="opt-row">
            <span>Night World</span>
            <button className="mc-btn" onClick={() => update({ night: !opts.night })}>
              <span className="mc-btn-label">{opts.night ? 'ON' : 'OFF'}</span>
            </button>
          </label>
          <label className="opt-row">
            <span>Particles</span>
            <button className="mc-btn" onClick={() => update({ particles: !opts.particles })}>
              <span className="mc-btn-label">{opts.particles ? 'All' : 'Minimal'}</span>
            </button>
          </label>
        </InventoryPanel>

        <InventoryPanel title="Difficulty">
          <div className="diff-row">
            {['peaceful', 'easy', 'normal', 'hard'].map((d) => (
              <McButton key={d} variant={opts.difficulty === d ? 'grass' : 'stone'} onClick={() => update({ difficulty: d })}>
                {d}
              </McButton>
            ))}
          </div>
          <p className="opt-note">
            Peaceful hides redstone alerts in your HUD. Hard shows every unsafe tick.
          </p>
        </InventoryPanel>
      </div>

      {saved && <div className="toast-save">Options saved!</div>}
    </div>
  );
}
