import { useEffect, useState } from 'react';
import InventoryPanel from '../components/InventoryPanel';
import { readingsAPI } from '../api/client';

export default function Chest() {
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState({ data: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    readingsAPI.list({ page, page_size: 20 })
      .then((res) => setPayload(res.data || { data: [], total: 0 }))
      .catch(() => setPayload({ data: [], total: 0, page, page_size: 20 }))
      .finally(() => setLoading(false));
  }, [page]);

  const pages = Math.max(1, Math.ceil((payload.total || 0) / 20));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Double Chest</h1>
        <p className="page-subtitle">Every water sample stored in this world</p>
      </div>

      <InventoryPanel title="Chest Inventory" subtitle={`${payload.total || 0} stacked readings`}>
        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            <div className="chest-grid">
              {(payload.data || []).map((r) => (
                <div key={r.id} className={`chest-slot ${r.quality}`}>
                  <span className="chest-item">{r.quality === 'safe' ? '💧' : '☠️'}</span>
                  <span className="chest-count">{r.ph?.toFixed(1)}</span>
                  <div className="chest-tip">
                    <div>{r.device_id}</div>
                    <div>pH {r.ph} · TDS {r.tds}</div>
                    <div>{r.quality}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="chest-pager">
              <button className="mc-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <span className="mc-btn-label">Prev</span>
              </button>
              <span className="chest-page">Page {page} / {pages}</span>
              <button className="mc-btn" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                <span className="mc-btn-label">Next</span>
              </button>
            </div>
          </>
        )}
      </InventoryPanel>
    </div>
  );
}
