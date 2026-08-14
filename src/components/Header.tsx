import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Receipt, History, Radio, Settings, Wifi, WifiOff, Clock } from 'lucide-react';
import { ReaderStatus } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartId: string;
  itemCount: number;
  readerStatus: ReaderStatus;
  onToggleReader: (connected: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartId,
  itemCount,
  readerStatus,
  onToggleReader,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setTime(`${dateStr} ${timeStr}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-slate-800/60 gap-3">
          
          {/* Logo / Brand Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                PASI SUPERMARKET
              </h1>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                <span>RFID Smart Shopping Cart System</span>
                <span>•</span>
                <span>Cart ID: <strong className="text-emerald-400 font-mono">{cartId}</strong></span>
              </p>
            </div>
          </div>

          {/* Reader Connection Status & Clock */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="text-slate-400 font-medium hidden md:block">
              {time}
            </div>

            <button
              onClick={() => onToggleReader(!readerStatus.connected)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-bold transition-all ${
                readerStatus.connected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
              }`}
            >
              {readerStatus.connected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🟢 RFID Reader Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>🔴 RFID Reader Disconnected</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Exact Menu Requested in Prompt: Dashboard | Shopping Cart | Products | Billing | History | Settings */}
        <nav className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Radio },
            { id: 'cart', label: 'Shopping Cart', icon: ShoppingCart, badge: itemCount > 0 ? itemCount : null },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'billing', label: 'Billing', icon: Receipt },
            { id: 'history', label: 'History', icon: History },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="ml-1.5 px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-400 text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
