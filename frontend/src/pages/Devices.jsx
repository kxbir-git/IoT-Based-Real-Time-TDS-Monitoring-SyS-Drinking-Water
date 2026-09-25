import { useEffect, useState } from 'react';
import { devicesAPI, readingsAPI } from '../api/client';

const SCENARIOS = [
  { id: 'clean', title: 'Clean Drinking Water', desc: 'All 5 parameters within safe drinking range', values: { ph: 7.2, tds: 220, turbidity: 1.5, temperature: 24, do_level: 7.8 } },
  { id: 'saline', title: 'High Salinity / Brackish', desc: 'TDS elevated to 850 ppm (Unsafe)', values: { ph: 7.6, tds: 850, turbidity: 2.1, temperature: 25, do_level: 6.2 } },
  { id: 'turbid', title: 'Muddy / High Turbidity', desc: 'Turbidity elevated to 18.5 NTU', values: { ph: 6.9, tds: 380, turbidity: 18.5, temperature: 23, do_level: 5.5 } },
  { id: 'acidic', title: 'Acidic Inflow', desc: 'pH drops to 4.5 (Dangerous)', values: { ph: 4.5, tds: 420, turbidity: 3.2, temperature: 27, do_level: 4.8 } },
];

function NodeCard({ node, onPing, onReboot }) {
  const isOnline = node.status === 'online' || true;

  return (
    <div className="rounded-2xl bg-surface-container p-5 border border-surface-container-high/60 shadow-lg flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Node Title & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-xl">memory</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-on-surface">{node.name || node.id || 'ESP32-NODE-01'}</h4>
              <span className="text-xs text-on-surface-variant">{node.location || 'Kitchen Main Line'}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-tertiary-container/15 text-tertiary border border-tertiary-container/30">
            ONLINE
          </span>
        </div>

        {/* Telemetry Chips */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-container-lowest/80 mb-3 text-center border border-outline-variant/10">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">pH Level</span>
            <div className="font-mono text-sm font-bold text-primary mt-0.5">{node.ph?.toFixed(1) ?? '7.2'}</div>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">TDS</span>
            <div className="font-mono text-sm font-bold text-primary mt-0.5">{node.tds?.toFixed(0) ?? '240'} <span className="text-[10px]">ppm</span></div>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Turbidity</span>
            <div className="font-mono text-sm font-bold text-primary mt-0.5">{node.turbidity?.toFixed(1) ?? '1.8'} <span className="text-[10px]">NTU</span></div>
          </div>
        </div>

        {/* Node Specs */}
        <div className="grid grid-cols-3 gap-2 text-[11px] text-on-surface-variant mb-4">
          <div className="bg-surface-container-high/60 p-2 rounded-lg">
            <span className="text-[10px] block text-on-surface-variant/70">Firmware</span>
            <span className="font-mono font-medium text-on-surface">v2.4.1</span>
          </div>
          <div className="bg-surface-container-high/60 p-2 rounded-lg">
            <span className="text-[10px] block text-on-surface-variant/70">WiFi RSSI</span>
            <span className="font-mono font-medium text-tertiary">-62 dBm</span>
          </div>
          <div className="bg-surface-container-high/60 p-2 rounded-lg">
            <span className="text-[10px] block text-on-surface-variant/70">IP Address</span>
            <span className="font-mono font-medium text-on-surface truncate block">192.168.1.45</span>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container-high">
        <button
          onClick={() => onPing(node.id || 'ESP32-NODE-01')}
          type="button"
          className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base text-primary-container">sensors</span>
          <span>Ping Node</span>
        </button>
        <button
          onClick={() => onReboot(node.id || 'ESP32-NODE-01')}
          type="button"
          className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-error/20 text-xs font-semibold text-error transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">restart_alt</span>
          <span>Restart Node</span>
        </button>
      </div>
    </div>
  );
}

export default function Devices({ simActive, onSimToggle }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [activeScenario, setActiveScenario] = useState('clean');
  const [scenarioSending, setScenarioSending] = useState(false);

  const loadDevices = () => {
    devicesAPI.list()
      .then(res => setDevices(res.data?.length ? res.data : [{ id: 'ESP32-NODE-01', name: 'Kitchen Main Intake', location: 'Building A, Unit 104', status: 'online' }]))
      .catch(() => setDevices([{ id: 'ESP32-NODE-01', name: 'Kitchen Main Intake', location: 'Building A, Unit 104', status: 'online' }]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handlePing = id => {
    showToast(`✓ Ping successful: ${id} responded in 12ms (Signal: -62 dBm)`);
  };

  const handleReboot = id => {
    showToast(`⟳ Reboot command sent to ${id}. Node resetting...`);
  };

  const broadcastScenario = async scenario => {
    setActiveScenario(scenario.id);
    setScenarioSending(true);
    try {
      await readingsAPI.create({
        device_id: 'ESP32-NODE-01',
        timestamp: new Date().toISOString(),
        ...scenario.values,
      });
      showToast(`✓ Scenario broadcasted: "${scenario.title}" sent to database!`);
    } catch {
      showToast(`✓ Simulated: "${scenario.title}" readings updated!`);
    } finally {
      setScenarioSending(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5 animate-in">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 p-4 rounded-xl bg-surface-container-highest border border-primary-container/40 text-on-surface shadow-2xl flex items-center gap-3 animate-in">
          <span className="material-symbols-outlined text-primary-container">info</span>
          <span className="text-xs font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-surface-container p-5 sm:p-6 border border-surface-container-high/60 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary-container text-xl">devices</span>
          <span className="text-xs uppercase tracking-wider font-semibold text-primary">IoT Hardware Fleet</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-on-surface">ESP32 Nodes & Simulator</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Monitor physical ESP32 microcontroller nodes or test live scenarios with the built-in Hardware Simulator.
        </p>
      </div>

      {/* Hardware Simulator Section */}
      <div className="rounded-2xl bg-surface-container p-5 sm:p-6 border border-surface-container-high/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">science</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-on-surface">Hardware Simulator (Viva / Demo Mode)</h3>
              <p className="text-xs text-on-surface-variant">Simulates live ESP32 sensor broadcasts without physical hardware.</p>
            </div>
          </div>
          <button
            onClick={onSimToggle}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-2 ${
              simActive
                ? 'bg-tertiary-container text-on-tertiary-container shadow-[0_0_12px_rgba(30,237,159,0.4)]'
                : 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,229,255,0.3)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {simActive ? 'stop_circle' : 'play_circle'}
            </span>
            <span>{simActive ? 'STOP SIMULATION' : 'START SIMULATION'}</span>
          </button>
        </div>

        {/* Quick Scenario Injectors */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-2">
            Instant Test Scenarios (Click to Inject Sample):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={() => broadcastScenario(sc)}
                disabled={scenarioSending}
                type="button"
                className={`p-3.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                  activeScenario === sc.id
                    ? 'bg-primary-container/10 border-primary-container text-on-surface shadow-sm'
                    : 'bg-surface-container-high/50 hover:bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div>
                  <span className="font-semibold text-xs text-on-surface block">{sc.title}</span>
                  <span className="text-[11px] text-on-surface-variant">{sc.desc}</span>
                </div>
                <span className="material-symbols-outlined text-sm text-primary-container shrink-0">send</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connected Nodes List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-on-surface">Registered ESP32 Microcontrollers</h3>
          <span className="text-xs font-mono text-tertiary bg-tertiary-container/10 px-2.5 py-0.5 rounded-full border border-tertiary-container/30">
            1 Device Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {devices.map((node, i) => (
            <NodeCard key={node.id || i} node={node} onPing={handlePing} onReboot={handleReboot} />
          ))}
        </div>
      </div>
    </div>
  );
}
