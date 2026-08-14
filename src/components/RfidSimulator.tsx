import React, { useState } from 'react';
import { Radio, Zap, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Product } from '../types';

interface RfidSimulatorProps {
  products: Product[];
  onScan: (rfid_tag_id: string, force?: boolean) => Promise<void>;
  readerConnected: boolean;
  onToggleReader: (connected: boolean) => void;
}

export const RfidSimulator: React.FC<RfidSimulatorProps> = ({
  products,
  onScan,
  readerConnected,
  onToggleReader,
}) => {
  const [customTag, setCustomTag] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [forceScan, setForceScan] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);

  const handleQuickScan = async (tagId: string) => {
    if (isScanning) return;
    setIsScanning(true);
    setStatusMessage({ type: 'info', text: `Scanning RFID Tag '${tagId}'...` });
    try {
      await onScan(tagId, forceScan);
      setStatusMessage({ type: 'success', text: `RFID Tag '${tagId}' detected and processed!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || `Scan failed for tag '${tagId}'` });
    } finally {
      setIsScanning(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleCustomScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTag.trim()) return;
    handleQuickScan(customTag.trim().toUpperCase());
    setCustomTag('');
  };

  return (
    <div className="bg-slate-900/90 border-b border-emerald-500/20 shadow-2xl relative overflow-hidden">
      {/* Background scan glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Header & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  Hardware Demo Mode — RFID Scanner Simulator
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ESP32 Emulation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Click preset tags below or enter custom RFID to simulate hardware scans to cart
              </p>
            </div>
          </div>

          {/* Preset Buttons & Custom Form */}
          <div className="flex flex-wrap items-center gap-2">
            {products.slice(0, 5).map((prod) => (
              <button
                key={prod.product_id}
                onClick={() => handleQuickScan(prod.rfid_tag_id)}
                disabled={isScanning || !readerConnected}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:border-emerald-500/50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>{prod.rfid_tag_id}</span>
                <span className="text-slate-400 font-normal">({prod.product_name.split(' ')[0]})</span>
              </button>
            ))}

            {/* Custom Tag Form */}
            <form onSubmit={handleCustomScanSubmit} className="flex items-center space-x-1.5">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Custom Tag (e.g. RFID009)"
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-36 uppercase font-mono"
              />
              <button
                type="submit"
                disabled={isScanning || !customTag.trim() || !readerConnected}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-emerald-600/20 disabled:opacity-50 flex items-center space-x-1"
              >
                {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Scan</span>
              </button>
            </form>

            {/* Force Cooldown Bypass Toggle */}
            <button
              onClick={() => setForceScan(!forceScan)}
              title="When active, ignores the 3-second anti-duplicate cooldown"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                forceScan
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bypass Cooldown: {forceScan ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Live Feedback Toast */}
        {statusMessage && (
          <div
            className={`mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center space-x-2 animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                : statusMessage.type === 'warning'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
