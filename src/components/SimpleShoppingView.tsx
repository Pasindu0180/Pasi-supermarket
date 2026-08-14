import React, { useState } from 'react';
import { Product, CartItem, CartMeta, ReaderStatus } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, Tag, ArrowRight, Zap, CheckCircle2, Search, HelpCircle, ShieldCheck } from 'lucide-react';

interface SimpleShoppingViewProps {
  products: Product[];
  cart: CartItem[];
  cartMeta: CartMeta;
  readerStatus: ReaderStatus;
  onScan: (rfid_tag_id: string) => Promise<void>;
  onUpdateQty: (product_id: string, delta: number) => Promise<void>;
  onRemoveItem: (product_id: string) => Promise<void>;
  onClearCart: () => Promise<void>;
  onProceedToCheckout: () => void;
}

export const SimpleShoppingView: React.FC<SimpleShoppingViewProps> = ({
  products,
  cart,
  cartMeta,
  readerStatus,
  onScan,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  const [customTagInput, setCustomTagInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  const formatRs = (num: number) => `Rs. ${num.toLocaleString('en-LK')}`;
  const totalItemsCount = cart.reduce((a, b) => a + b.quantity, 0);

  const handleTapItemScan = async (tagId: string, name: string) => {
    try {
      await onScan(tagId);
      setScanNotice(`✅ Added '${name}' to cart!`);
      setTimeout(() => setScanNotice(null), 3000);
    } catch (err: any) {
      setScanNotice(`❌ ${err.message || 'Scan error'}`);
      setTimeout(() => setScanNotice(null), 4000);
    }
  };

  const handleCustomTagScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    const tag = customTagInput.trim().toUpperCase();
    handleTapItemScan(tag, `Tag ${tag}`);
    setCustomTagInput('');
  };

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rfid_tag_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* 3-Step Simple Guide for New Users */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
              🛒
            </div>
            <div>
              <h2 className="text-lg font-black text-white">How to Use Pasi Smart Shopping Cart</h2>
              <p className="text-xs text-slate-300">Simple 3-step automated RFID supermarket checkout</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold w-full md:w-auto">
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-emerald-400 flex items-center space-x-1 justify-center">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center text-[10px]">1</span>
              <span>Tap / Scan Item</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-teal-400 flex items-center space-x-1 justify-center">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-black flex items-center justify-center text-[10px]">2</span>
              <span>Review Cart</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-indigo-400 flex items-center space-x-1 justify-center">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-black flex items-center justify-center text-[10px]">3</span>
              <span>Pay & Get Bill</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Scan Alert Toast */}
      {scanNotice && (
        <div className="p-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm text-center shadow-lg shadow-emerald-500/20 animate-bounce">
          {scanNotice}
        </div>
      )}

      {/* Main Split Layout: Product Scanner (Left) & Active Bill (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Easy Product Scanner (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Tap Item to Scan into Cart
                </h3>
                <p className="text-xs text-slate-400">Click any product to simulate putting it into your smart RFID cart</p>
              </div>

              {/* Quick Tag Entry */}
              <form onSubmit={handleCustomTagScan} className="flex space-x-1.5">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  placeholder="RFID Tag (e.g. RFID001)"
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono w-36 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Scan
                </button>
              </form>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items (Rice, Milk, Sugar, Biscuits)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Large Touch-Friendly Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.product_id}
                  onClick={() => handleTapItemScan(prod.rfid_tag_id, prod.product_name)}
                  className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-2 group shadow-md"
                >
                  <div className="relative h-24 rounded-xl overflow-hidden bg-slate-950">
                    <img src={prod.image} alt={prod.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[10px] font-bold">
                      {prod.rfid_tag_id}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs leading-snug line-clamp-2">{prod.product_name}</h4>
                    <div className="text-emerald-400 font-extrabold text-sm mt-1">{formatRs(prod.price)}</div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-1.5 bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white font-bold text-xs rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Scan Item</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Shopping Cart & Total Bill (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="glass-panel-glow p-6 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-black text-white">Your Bill ({totalItemsCount} items)</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <div className="text-3xl">🛒</div>
                <p className="text-sm font-bold text-slate-300">Your Cart is Empty</p>
                <p className="text-xs text-slate-400">Tap any supermarket product on the left to scan it!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product_id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 flex-1 pr-2">
                      <div className="font-bold text-white text-sm line-clamp-1">{item.product_name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">{item.rfid_tag_id}</span> • {formatRs(item.price)} each
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => onUpdateQty(item.product_id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-extrabold text-white text-xs">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.product_id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    {/* Total & Remove */}
                    <div className="text-right pl-3">
                      <div className="font-black text-white text-sm">{formatRs(item.total_price)}</div>
                      <button
                        onClick={() => onRemoveItem(item.product_id)}
                        className="text-[10px] text-rose-400 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Bill Box & Checkout Button */}
            {cart.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-1">
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Subtotal:</span>
                    <span className="font-bold text-white">{formatRs(cartMeta.subtotal)}</span>
                  </div>
                  {cartMeta.discount > 0 && (
                    <div className="flex justify-between text-emerald-400 text-xs">
                      <span>Discount:</span>
                      <span className="font-bold">- {formatRs(cartMeta.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 uppercase">Final Total Bill</span>
                    <span className="text-2xl font-black text-emerald-400">{formatRs(cartMeta.total)}</span>
                  </div>
                </div>

                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-base rounded-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Pay & Get Printed Receipt</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
