import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Predict from './pages/Predict';
import Devices from './pages/Devices';
import { alertsAPI } from './api/client';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'speed', desc: 'Live Telemetry' },
  { id: 'predict',   label: 'ML Predict', icon: 'psychology', desc: 'AI Classifier' },
  { id: 'analytics', label: 'Analytics',  icon: 'query_stats', desc: 'History & Trends' },
  { id: 'devices',   label: 'Devices',    icon: 'memory', desc: 'ESP32 Nodes' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [alertCount, setAlertCount] = useState(0);
  const [simActive, setSimActive] = useState(false);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    alertsAPI.count().then(r => setAlertCount(r.data?.count || 0)).catch(() => {});
    const id = setInterval(() => {
      alertsAPI.count().then(r => setAlertCount(r.data?.count || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const toggleSim = async () => {
    setSimLoading(true);
    try {
      const endpoint = simActive ? '/api/demo/stop' : '/api/demo/start';
      await fetch(`http://localhost:8000${endpoint}`, { method: 'POST' });
      setSimActive(!simActive);
    } catch {
      // fallback toggle for demo UI
      setSimActive(!simActive);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface font-sans selection:bg-primary-container selection:text-on-primary">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/60 shadow-lg">
        <div className="max-w-4xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Logo & Node Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container/20 to-surface-container-highest flex items-center justify-center shrink-0 border border-primary-container/30 shadow-[0_0_12px_rgba(0,229,255,0.15)]">
              <span className="material-symbols-outlined text-primary-container text-2xl">water_drop</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base sm:text-lg text-primary tracking-tight truncate">AquaSense IoT</span>
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-mono font-medium">
                  v2.4
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/30">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse shadow-[0_0_6px_#1eed9f]"></span>
                  <span className="font-mono text-[11px] text-tertiary font-medium tracking-tight">ESP32 Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Simulation Toggle */}
            <button
              onClick={toggleSim}
              disabled={simLoading}
              title="Toggle simulated hardware sensor readings"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all duration-200 border ${
                simActive
                  ? 'bg-tertiary-container/20 border-tertiary-container/50 text-tertiary shadow-[0_0_12px_rgba(30,237,159,0.25)]'
                  : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className={`material-symbols-outlined text-base ${simActive ? 'text-tertiary animate-spin' : 'text-primary-container'}`}>
                {simActive ? 'sync' : 'tune'}
              </span>
              <span className="hidden sm:inline">
                {simLoading ? 'Updating...' : simActive ? 'SIM ACTIVE (2s)' : 'DEMO SIMULATOR'}
              </span>
              <span className="sm:hidden">
                {simActive ? 'SIM ON' : 'SIM'}
              </span>
              <span className={`w-2 h-2 rounded-full ${simActive ? 'bg-tertiary-container shadow-[0_0_8px_#1eed9f]' : 'bg-outline/50'}`}></span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setPage('dashboard')}
              title={`${alertCount} active alerts`}
              className="w-10 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {alertCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary-container ring-2 ring-surface shadow-[0_0_8px_#00e5ff]"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container - Centered and Clean */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-24">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'predict'   && <Predict />}
        {page === 'analytics' && <Analytics />}
        {page === 'devices'   && <Devices simActive={simActive} onSimToggle={toggleSim} />}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl border-t border-surface-container-high/60 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex justify-around items-center h-16 px-2">
          {NAV.map(n => {
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 group relative ${
                  active ? 'text-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                {active && (
                  <span className="absolute -top-1 w-8 h-1 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]"></span>
                )}
                <span className={`material-symbols-outlined text-2xl transition-transform duration-200 ${
                  active ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]' : 'group-hover:scale-105'
                }`}>
                  {n.icon}
                </span>
                <span className="text-[11px] tracking-tight mt-0.5 font-medium">
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
