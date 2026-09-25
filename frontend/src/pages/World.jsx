import { useEffect, useState } from 'react';
import InventoryPanel from '../components/InventoryPanel';
import { devicesAPI } from '../api/client';

export default function World() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    devicesAPI.list()
      .then((res) => setDevices(res.data || []))
      .catch(() => setDevices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">World Map</h1>
        <p className="page-subtitle">Chunk view of every water sensor in this world</p>
      </div>

      <InventoryPanel title="Overworld Chunks" subtitle="Grass biomes · water tanks · ESP32 nodes">
        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="chunk-map">
            {devices.map((d, i) => (
              <div key={d.id} className={`chunk-tile ${d.status === 'online' ? 'lit' : 'dark'}`}>
                <div className="chunk-grass" />
                <div className={`chunk-tank ${d.last_quality === 'unsafe' ? 'bad' : 'good'}`}>
                  <span className="chunk-water" />
                </div>
                <div className="chunk-label">
                  <strong>{d.name || d.id}</strong>
                  <span>{d.location || 'Unknown biome'}</span>
                  <span className={`chunk-status ${d.status}`}>{d.status}</span>
                </div>
                <div className="chunk-coords">X:{i * 16} Z:{8 + i * 4}</div>
              </div>
            ))}
            {devices.length === 0 && (
              <div className="empty-state">
                <div className="icon">🗺️</div>
                <h3>Unexplored world</h3>
                <p>Place a sensor block to generate chunks.</p>
              </div>
            )}
          </div>
        )}
      </InventoryPanel>
    </div>
  );
}
