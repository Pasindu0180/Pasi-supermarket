import React, { useState } from 'react';
import { AppState } from '../types';
import { Radio, Zap, Activity, ShoppingCart, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  state: AppState;
  onScan: (rfid_tag_id: string, force?: boolean) => Promise<void>;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onScan,
  onNavigateTab,
}) => {
  const [customTagInput, setCustomTagInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const formatRs = (num: number) => `Rs. ${num.toLocaleString('en-LK')}`;

  const handleScan = async (tagId: string) => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      await onScan(tagId);
      setScanMessage(`Tag '${tagId}' scanned successfully!`);
    } catch (err: any) {
      setScanMessage(err.message || `Scan error for tag '${tagId}'`);
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanMessage(null), 3000);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    handleScan(customTagInput.trim().toUpperCase());
    setCustomTagInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / System Summary */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">System Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pasi Supermarket – RFID Smart Shopping Cart System Monitoring
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('cart')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Go to Shopping Cart ({state.cart.reduce((a, b) => a + b.quantity, 0)})</span>
          </button>
        </div>
      </div>

      {/* RFID Reader Status & Last Scanned Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Status Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RFID Reader Status</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              state.reader_status.connected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {state.reader_status.connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
          
          <div className="space-y-1 text-xs text-slate-300">
            <div>Last Scanned RFID ID: <span className="font-mono text-emerald-400 font-bold">{state.reader_status.last_scanned_id || 'N/A'}</span></div>
            <div>Last Detected Product: <span className="font-bold text-white">{state.reader_status.last_detected_product || 'N/A'}</span></div>
            <div className="text-slate-400">Scan Time: {state.reader_status.last_scan_time || 'N/A'}</div>
          </div>
        </div>

        {/* Current Cart Overview Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Shopping Cart</div>
          <div className="text-2xl font-black text-emerald-400">{formatRs(state.cart_meta.total)}</div>
          <div className="text-xs text-slate-400">
            Cart ID: <strong className="text-slate-200 font-mono">{state.cart_meta.cart_id}</strong> • {state.cart.length} distinct items
          </div>
        </div>

        {/* Product Catalog Overview Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Products</div>
          <div className="text-2xl font-black text-white">{state.products.length} Products</div>
          <div className="text-xs text-slate-400">
            {state.products.filter(p => p.status === 'In Stock').length} products in stock
          </div>
        </div>
      </div>

      {/* RFID Simulator Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Simulate RFID Scan</h3>
        </div>

        {scanMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            {scanMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-bold text-slate-300">Quick Scan Presets:</div>
          {state.products.slice(0, 4).map((prod) => (
            <button
              key={prod.product_id}
              onClick={() => handleScan(prod.rfid_tag_id)}
              disabled={isScanning || !state.reader_status.connected}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:border-emerald-500/50 disabled:opacity-50"
            >
              Scan {prod.rfid_tag_id} ({prod.product_name})
            </button>
          ))}

          {/* Manual Input */}
          <form onSubmit={handleCustomSubmit} className="flex items-center space-x-2 ml-auto">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              placeholder="Enter RFID ID (e.g. RFID001)"
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono w-48 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isScanning || !customTagInput.trim() || !state.reader_status.connected}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
            >
              Scan Tag
            </button>
          </form>
        </div>
      </div>

      {/* RFID Scan Log Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl space-y-4">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">RFID Activity Log</h3>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 sticky top-0">
              <tr>
                <th className="px-6 py-3">Scan Time</th>
                <th className="px-4 py-3">RFID Tag ID</th>
                <th className="px-4 py-3">Detected Product</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {state.rfid_logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No RFID scan log entries yet.
                  </td>
                </tr>
              ) : (
                state.rfid_logs.map((log) => (
                  <tr key={log.scan_id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-3 font-mono text-slate-400">{log.scan_time}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{log.rfid_tag_id}</td>
                    <td className="px-4 py-3 font-semibold text-white">{log.product_name}</td>
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
