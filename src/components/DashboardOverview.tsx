import React from 'react';
import { AppState } from '../types';
import { ShoppingCart, Package, DollarSign, Radio, ArrowRight, Zap, CheckCircle2, TrendingUp, Clock, History } from 'lucide-react';

interface DashboardOverviewProps {
  state: AppState;
  onScan: (rfid_tag_id: string) => Promise<void>;
  onNavigateTab: (tab: string) => void;
  onProceedToCheckout: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  state,
  onScan,
  onNavigateTab,
  onProceedToCheckout,
}) => {
  const formatRs = (num: number) => `Rs. ${num.toLocaleString('en-LK')}`;

  const cartItemCount = state.cart.reduce((a, b) => a + b.quantity, 0);
  const todayTotalSales = state.transactions.reduce((acc, t) => acc + t.total, 0);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Pasi Supermarket Dashboard
            </span>
            <span className="text-xs text-slate-400 font-mono">Cart: {state.cart_meta.cart_id}</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Smart Cart Overview</h2>
          <p className="text-xs text-slate-400">
            Real-time RFID tag detection, live shopping total, and supermarket inventory analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('cart')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open Shopping Cart ({cartItemCount})</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Cart Total */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cart Total</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatRs(state.cart_meta.total)}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
            <span>{cartItemCount} items scanned</span>
            <button onClick={() => onNavigateTab('cart')} className="text-emerald-400 font-bold hover:underline">View →</button>
          </div>
        </div>

        {/* Card 2: Today's Total Sales */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatRs(todayTotalSales)}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
            <span>{state.transactions.length} transactions</span>
            <button onClick={() => onNavigateTab('history')} className="text-indigo-400 font-bold hover:underline">History →</button>
          </div>
        </div>

        {/* Card 3: Registered Products */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog Inventory</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{state.products.length} Products</div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
            <span>{state.products.filter(p => p.status === 'In Stock').length} In Stock</span>
            <button onClick={() => onNavigateTab('products')} className="text-amber-400 font-bold hover:underline">Manage →</button>
          </div>
        </div>

        {/* Card 4: Reader Status */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RFID Reader</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-lg font-bold text-white flex items-center space-x-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${state.reader_status.connected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span>{state.reader_status.connected ? '🟢 Connected' : '🔴 Offline'}</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
            <span>Cooldown: {state.settings.debounce_seconds}s</span>
            <button onClick={() => onNavigateTab('hardware')} className="text-teal-400 font-bold hover:underline">Logs →</button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout: Cart Summary & Quick Hardware Scan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Cart Live Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Current Cart Items ({cartItemCount})</h3>
              </div>
              <button
                onClick={() => onNavigateTab('cart')}
                className="text-xs text-emerald-400 font-bold hover:underline flex items-center space-x-1"
              >
                <span>View Full Cart & Remove Items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {state.cart.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">
                No items currently in shopping cart. Scan an RFID tag below to add items.
              </div>
            ) : (
              <div className="space-y-3">
                {state.cart.map((item) => (
                  <div key={item.product_id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{item.product_name}</div>
                      <div className="text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-emerald-400 font-bold">{item.rfid_tag_id}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400">Rs. {item.price.toLocaleString()} × {item.quantity}</div>
                      <div className="font-extrabold text-emerald-400 text-sm">Rs. {item.total_price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}

                {/* Subtotal Footer */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Total Bill Amount</div>
                    <div className="text-xl font-black text-emerald-400">{formatRs(state.cart_meta.total)}</div>
                  </div>
                  <button
                    onClick={onProceedToCheckout}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
                  >
                    <span>Checkout Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Quick Hardware Scan & Recent Scans */}
        <div className="space-y-6">
          
          {/* Quick Hardware Scan */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Quick RFID Scan</h3>
            </div>
            <p className="text-xs text-slate-400">
              Click any item tag to simulate an instant RFID detection scan:
            </p>
            <div className="space-y-2">
              {state.products.slice(0, 4).map((prod) => (
                <button
                  key={prod.product_id}
                  onClick={() => onScan(prod.rfid_tag_id)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all flex items-center justify-between text-xs group"
                >
                  <div>
                    <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">{prod.product_name}</div>
                    <div className="font-mono text-emerald-400 font-bold">{prod.rfid_tag_id}</div>
                  </div>
                  <div className="font-extrabold text-slate-300">Rs. {prod.price.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Completed Transactions */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
              </div>
              <button
                onClick={() => onNavigateTab('history')}
                className="text-xs text-indigo-400 font-bold hover:underline"
              >
                All →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {state.transactions.slice(0, 3).map((txn) => (
                <div key={txn.transaction_id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-emerald-400">{txn.bill_number}</div>
                    <div className="text-slate-400 text-[10px]">{txn.date}</div>
                  </div>
                  <div className="text-right font-extrabold text-white">
                    {formatRs(txn.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
