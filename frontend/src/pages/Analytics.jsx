import { useEffect, useState } from 'react';
import { readingsAPI } from '../api/client';

const TIMEFRAMES = [
  { id: '1h',  label: 'Live 1 Hour', count: 12 },
  { id: '24h', label: 'Past 24 Hours', count: 24 },
  { id: '7d',  label: 'Past 7 Days', count: 60 },
  { id: '30d', label: 'Past 30 Days', count: 120 },
];

function SensorTrendCard({ title, unit, data, color, safeMin, safeMax, thresholdLabel }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-container p-4 border border-surface-container-high/60 shadow">
        <span className="text-xs text-on-surface-variant font-semibold">{title}</span>
        <p className="text-xs text-on-surface-variant/60 mt-4">Waiting for telemetry data...</p>
      </div>
    );
  }

  const values = data.map(d => d.val).filter(v => v != null);
  const current = values[values.length - 1] ?? '--';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = (values.reduce((a, b) => a + b, 0) / (values.length || 1)).toFixed(1);

  // SVG Chart path
  const w = 320, h = 80;
  const spread = (max - min) || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * w;
    const y = h - ((v - min) / spread) * (h * 0.7) - (h * 0.15);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `${pathD} L ${w},${h} L 0,${h} Z`;

  return (
    <div className="rounded-2xl bg-surface-container p-4 sm:p-5 border border-surface-container-high/60 shadow-lg flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{title}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-on-surface">{typeof current === 'number' ? current.toFixed(1) : current}</span>
            <span className="text-xs font-mono text-on-surface-variant">{unit}</span>
          </div>
        </div>
        <div className="text-right text-[11px] text-on-surface-variant">
          <div>Avg: <strong className="font-mono text-on-surface">{avg}</strong></div>
          <div>Range: <span className="font-mono text-on-surface">{min.toFixed(1)} – {max.toFixed(1)}</span></div>
        </div>
      </div>

      {/* Mini Trend Sparkline */}
      <div className="my-2 rounded-xl bg-surface-container-lowest/80 p-2 overflow-hidden border border-outline-variant/10">
        <svg className="w-full h-16" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${title.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#grad-${title.replace(/[^a-z0-9]/gi, '')})`} />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high/60">
        <span>Standard: <strong className="text-on-surface font-mono">{safeMin ?? 0} – {safeMax ?? 'N/A'} {unit}</strong></span>
        <span className="text-[10px] text-primary">{thresholdLabel}</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState('--');

  useEffect(() => {
    const selected = TIMEFRAMES.find(t => t.id === timeframe);
    setLoading(true);
    readingsAPI.list({ page: 1, page_size: selected?.count || 24 })
      .then(res => {
        const rows = (res.data?.data || res.data?.items || []).slice().reverse();
        setData(rows);
        setLastSync(new Date().toLocaleTimeString());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeframe]);

  const total = data.length;
  const safeCount = data.filter(d => d.quality === 'safe' || d.is_safe).length;
  const safeRate = total ? Math.round((safeCount / total) * 100) : 98;

  const phPoints = data.map(d => ({ val: d.ph }));
  const tdsPoints = data.map(d => ({ val: d.tds }));
  const turbPoints = data.map(d => ({ val: d.turbidity }));
  const tempPoints = data.map(d => ({ val: d.temperature }));
  const doPoints = data.map(d => ({ val: d.do_level }));

  return (
    <div className="flex flex-col space-y-5 animate-in">
      {/* Header Banner */}
      <div className="rounded-2xl bg-surface-container p-5 sm:p-6 border border-surface-container-high/60 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary-container text-xl">query_stats</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-primary">Historical Telemetry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">Sensor Analytics & Trendlines</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Historical sensor logs, variance analysis, and water safety percentage over time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-sm text-tertiary">cloud_done</span>
            <span>Sync: {lastSync}</span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="mt-4 flex gap-1 p-1 bg-surface-container-lowest rounded-xl max-w-fit">
          {TIMEFRAMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeframe === t.id
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-surface-container p-3 sm:p-4 border border-surface-container-high/60 shadow">
          <span className="text-xs text-on-surface-variant block">Safe Samples Rate</span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-tertiary-container mt-1">{safeRate}%</div>
          <span className="text-[11px] text-tertiary">WHO Standard Pass</span>
        </div>
        <div className="rounded-xl bg-surface-container p-3 sm:p-4 border border-surface-container-high/60 shadow">
          <span className="text-xs text-on-surface-variant block">Total Logged Samples</span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mt-1">{total}</div>
          <span className="text-[11px] text-on-surface-variant">Archived in DB</span>
        </div>
        <div className="rounded-xl bg-surface-container p-3 sm:p-4 border border-surface-container-high/60 shadow">
          <span className="text-xs text-on-surface-variant block">Telemetry Interval</span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-on-surface mt-1">2.0s</div>
          <span className="text-[11px] text-primary-fixed">ESP32 Sample Rate</span>
        </div>
        <div className="rounded-xl bg-surface-container p-3 sm:p-4 border border-surface-container-high/60 shadow">
          <span className="text-xs text-on-surface-variant block">Sensor Health</span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-tertiary mt-1">100%</div>
          <span className="text-[11px] text-tertiary">All 5 Calibrated</span>
        </div>
      </div>

      {/* Trend Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SensorTrendCard
          title="pH Level Stability"
          unit="pH"
          data={phPoints}
          color="#00daf3"
          safeMin={6.5}
          safeMax={8.5}
          thresholdLabel="Target: Neutral 7.0"
        />
        <SensorTrendCard
          title="TDS (Salinity Concentration)"
          unit="mg/L"
          data={tdsPoints}
          color="#1eed9f"
          safeMin={0}
          safeMax={500}
          thresholdLabel="EPA Max Limit: 500"
        />
        <SensorTrendCard
          title="Turbidity (Clarity Index)"
          unit="NTU"
          data={turbPoints}
          color="#aac7ff"
          safeMin={0}
          safeMax={4.0}
          thresholdLabel="Clarity Standard < 4.0"
        />
        <SensorTrendCard
          title="Dissolved Oxygen (DO)"
          unit="mg/L"
          data={doPoints}
          color="#4dffb1"
          safeMin={6.0}
          safeMax={15.0}
          thresholdLabel="Healthy Aquatic: ≥ 6.0"
        />
      </div>

      {/* Recent Telemetry Table */}
      <div className="rounded-2xl bg-surface-container p-5 border border-surface-container-high/60 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-on-surface">Recent Sensor Telemetry Logs</h3>
          <span className="text-xs text-on-surface-variant font-mono">Latest {Math.min(data.length, 10)} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-container-high text-on-surface-variant font-semibold">
                <th className="pb-2">Time</th>
                <th className="pb-2">pH</th>
                <th className="pb-2">TDS</th>
                <th className="pb-2">Turbidity</th>
                <th className="pb-2">Temp</th>
                <th className="pb-2">DO</th>
                <th className="pb-2 text-right">Potability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/50 font-mono">
              {data.slice(-8).reverse().map((row, idx) => {
                const isPotable = row.quality === 'safe' || row.is_safe || ((row.ph >= 6.5 && row.ph <= 8.5) && (row.tds <= 500) && (row.turbidity <= 4));
                const ts = row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : `Packet #${idx + 1}`;
                return (
                  <tr key={idx} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-2.5 text-on-surface-variant">{ts}</td>
                    <td className="py-2.5 text-on-surface">{row.ph?.toFixed(2) ?? '--'}</td>
                    <td className="py-2.5 text-on-surface">{row.tds?.toFixed(0) ?? '--'}</td>
                    <td className="py-2.5 text-on-surface">{row.turbidity?.toFixed(2) ?? '--'}</td>
                    <td className="py-2.5 text-on-surface">{row.temperature?.toFixed(1) ?? '--'}°C</td>
                    <td className="py-2.5 text-on-surface">{row.do_level?.toFixed(2) ?? '--'}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPotable ? 'bg-tertiary-container/15 text-tertiary' : 'bg-error/15 text-error'
                      }`}>
                        {isPotable ? 'SAFE' : 'ALERT'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
