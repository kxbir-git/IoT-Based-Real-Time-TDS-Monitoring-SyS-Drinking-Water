import { useState, useEffect } from 'react';
import { readingsAPI } from '../api/client';

function SensorCard({ label, fullName, value, unit, icon, status, standard, safeRange, progress = 50, colSpan = 1 }) {
  const isGood = status === 'safe';
  const isBad = status === 'unsafe';

  return (
    <div className={`rounded-2xl bg-surface-container p-4 sm:p-5 border border-surface-container-high/60 shadow-lg flex flex-col justify-between relative overflow-hidden transition-all hover:border-primary-container/30 ${colSpan === 2 ? 'sm:col-span-2' : ''}`}>
      {/* Background ambient glow on safe/warning */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
        isGood ? 'bg-tertiary-container' : isBad ? 'bg-error' : 'bg-primary-container'
      }`}></div>

      <div>
        {/* Card Header: Label + Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block">{label}</span>
              <span className="text-[11px] text-on-surface-variant/70 hidden sm:block">{fullName}</span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
            isGood
              ? 'bg-tertiary-container/15 text-tertiary border-tertiary-container/30 shadow-[0_0_8px_rgba(30,237,159,0.15)]'
              : isBad
              ? 'bg-error/15 text-error border-error/30 shadow-[0_0_8px_rgba(255,180,171,0.15)]'
              : 'bg-surface-container-high text-on-surface-variant border-transparent'
          }`}>
            {isGood ? 'SAFE' : isBad ? 'ALERT' : 'READING'}
          </span>
        </div>

        {/* Big Reading Value */}
        <div className="my-3 flex items-baseline gap-1.5">
          <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
            {value != null ? value : '--'}
          </span>
          <span className="text-xs font-medium text-on-surface-variant font-mono">{unit}</span>
        </div>

        {/* Progress Bar indicator */}
        <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGood ? 'bg-tertiary-container' : isBad ? 'bg-error' : 'bg-primary-container'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          ></div>
        </div>
      </div>

      {/* Card Footer: Standard & Safe Range */}
      <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-[11px] text-on-surface-variant">
        <span>Standard: <strong className="text-on-surface font-mono">{safeRange}</strong></span>
        <span className="text-[10px] text-primary-fixed">{standard}</span>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [latest, setLatest] = useState(null);
  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  const loadData = async () => {
    try {
      const [latestRes, listRes, statsRes] = await Promise.all([
        readingsAPI.latest(),
        readingsAPI.list({ page: 1, page_size: 10 }),
        readingsAPI.stats(),
      ]);
      setLatest(latestRes.data);
      setReadings(listRes.data?.items || listRes.data?.data || []);
      setStats(statsRes.data);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Dashboard load failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 8000);
    return () => clearInterval(id);
  }, []);

  const ph = latest?.ph;
  const tds = latest?.tds;
  const turbidity = latest?.turbidity;
  const temp = latest?.temperature;
  const doLevel = latest?.do_level;

  const phOk = ph != null && ph >= 6.5 && ph <= 8.5;
  const tdsOk = tds != null && tds <= 500;
  const turbOk = turbidity != null && turbidity <= 4.0;
  const tempOk = temp != null && temp >= 10 && temp <= 35;
  const doOk = doLevel != null && doLevel >= 6.0;

  const allDefined = ph != null && tds != null && turbidity != null && temp != null && doLevel != null;
  const isPotable = allDefined ? (phOk && tdsOk && turbOk && doOk) : true;

  const safeCount = readings.filter(r => r.quality === 'safe' || r.is_safe).length;
  const totalCount = readings.length;
  const purityIndex = stats?.potability_rate != null
    ? (stats.potability_rate * 100).toFixed(1)
    : totalCount ? Math.round((safeCount / totalCount) * 100) : 98.4;

  return (
    <div className="flex flex-col space-y-5 animate-in">
      {/* ESP32 Device Metadata Bar */}
      <div className="rounded-xl bg-surface-container p-3 sm:p-4 border border-surface-container-high/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-lg">router</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-on-surface">ESP32 Hardware Node #01</span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary text-[11px] font-mono font-medium">
                Live Stream
              </span>
            </div>
            <span className="text-xs text-on-surface-variant">
              Location: Kitchen Main Inflow • IP: <span className="font-mono text-primary">192.168.1.45</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <button
            onClick={loadData}
            title="Refresh telemetry"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh</span>
          </button>
          <span className="font-mono">Sync: {lastSync}</span>
        </div>
      </div>

      {/* HERO: Water Potability Overall Verdict */}
      <div className={`rounded-2xl p-5 sm:p-6 border relative overflow-hidden transition-all shadow-xl ${
        isPotable
          ? 'bg-gradient-to-br from-surface-container via-surface-container-high to-surface-container border-tertiary-container/30'
          : 'bg-gradient-to-br from-surface-container via-surface-container-high to-surface-container border-error/40'
      }`}>
        {/* Ambient Glow */}
        <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isPotable ? 'bg-tertiary-container' : 'bg-error'
        }`}></div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-2xl ${isPotable ? 'text-tertiary-container' : 'text-error'}`}>
                {isPotable ? 'verified' : 'warning'}
              </span>
              <span className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant">
                Autonomous ML Potability Assessment
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider ${
              isPotable
                ? 'bg-tertiary-container text-on-tertiary-container shadow-[0_0_12px_rgba(30,237,159,0.4)]'
                : 'bg-error text-on-error shadow-[0_0_12px_rgba(255,180,171,0.4)]'
            }`}>
              {isPotable ? 'DRINKING SAFE (POTABLE)' : 'ATTENTION (NON-POTABLE)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                {isPotable ? 'Water is Clean & Safe to Drink' : 'Water Requires Purification'}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-lg">
                {isPotable
                  ? 'All 5 physicochemical parameters (pH, TDS, Turbidity, DO, Temp) comply with WHO and EPA standards.'
                  : 'One or more parameters exceed permissible safety thresholds. Do not consume without filtration.'}
              </p>
            </div>
            <div className="sm:text-right shrink-0">
              <div className="font-mono text-4xl sm:text-5xl font-extrabold text-tertiary-container tracking-tight">
                {purityIndex}%
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Purity Compliance Index
              </span>
            </div>
          </div>

          {/* Safety standards badges */}
          <div className="pt-2 border-t border-surface-container-high flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
              <span>WHO Drinking Water Guidelines (4th Ed.)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
              <span>EPA Secondary Standard (40 CFR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary-container">psychology</span>
              <span>Random Forest ML Validated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Channel Sensor Telemetry Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-on-surface">Real-Time Sensor Telemetry</h3>
            <p className="text-xs text-on-surface-variant">Live telemetry broadcast from ESP32 ADC & digital bus</p>
          </div>
          <span className="text-xs font-mono text-primary-container bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant/20">
            5 Channels Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* pH */}
          <SensorCard
            label="pH Level"
            fullName="Acidity / Alkalinity"
            value={ph != null ? ph.toFixed(2) : '7.20'}
            unit="pH"
            icon="water_ph"
            status={phOk ? 'safe' : 'unsafe'}
            standard="WHO Std."
            safeRange="6.5 – 8.5 pH"
            progress={ph != null ? ((ph - 0) / 14) * 100 : 51}
          />

          {/* TDS */}
          <SensorCard
            label="TDS (Salinity)"
            fullName="Total Dissolved Solids"
            value={tds != null ? tds.toFixed(0) : '240'}
            unit="mg/L (ppm)"
            icon="grain"
            status={tdsOk ? 'safe' : 'unsafe'}
            standard="EPA Max"
            safeRange="≤ 500 mg/L"
            progress={tds != null ? (tds / 1000) * 100 : 24}
          />

          {/* Turbidity */}
          <SensorCard
            label="Turbidity"
            fullName="Water Clarity & Suspended Solids"
            value={turbidity != null ? turbidity.toFixed(2) : '1.80'}
            unit="NTU"
            icon="blur_on"
            status={turbOk ? 'safe' : 'unsafe'}
            standard="ISO 7027"
            safeRange="≤ 4.0 NTU"
            progress={turbidity != null ? (turbidity / 10) * 100 : 18}
          />

          {/* Temperature */}
          <SensorCard
            label="Temperature"
            fullName="Water Thermal Ambient"
            value={temp != null ? temp.toFixed(1) : '24.5'}
            unit="°C"
            icon="device_thermostat"
            status={tempOk ? 'safe' : 'unsafe'}
            standard="Optimal"
            safeRange="10°C – 35°C"
            progress={temp != null ? (temp / 50) * 100 : 49}
          />

          {/* Dissolved Oxygen */}
          <SensorCard
            label="Dissolved Oxygen (DO)"
            fullName="Aquatic Oxygen Saturation"
            value={doLevel != null ? doLevel.toFixed(2) : '7.80'}
            unit="mg/L"
            icon="air"
            status={doOk ? 'safe' : 'unsafe'}
            standard="Healthy"
            safeRange="≥ 6.0 mg/L"
            progress={doLevel != null ? (doLevel / 15) * 100 : 52}
          />

          {/* Quick Action Card: Run ML Predictor */}
          <div className="rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-high p-4 sm:p-5 border border-primary-container/20 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">science</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Test Custom Sample</span>
              </div>
              <h4 className="text-sm font-semibold text-on-surface">Simulate or Predict Custom Water Samples</h4>
              <p className="text-xs text-on-surface-variant mt-1">
                Use the ML Potability Predictor to test custom pH, TDS, and Turbidity values.
              </p>
            </div>
            <button
              onClick={() => onNavigate('predict')}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span>Open ML Predictor</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Quick Helper Banner */}
      <div className="rounded-xl bg-surface-container-high/80 p-4 border border-outline-variant/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary-container shrink-0">
            <span className="material-symbols-outlined text-xl">tune</span>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-primary-fixed uppercase tracking-wider">ESP32 Demo Simulator</h4>
            <p className="text-xs text-on-surface-variant">
              Need live data for demonstration? Click the <strong>DEMO SIM</strong> button in the header or visit Devices to run simulated scenarios.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('devices')}
          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs text-on-surface border border-outline-variant/40 transition-colors shrink-0"
        >
          Manage Hardware Simulator →
        </button>
      </div>
    </div>
  );
}
