import React, { useState } from 'react';
import { CartItem, CartMeta, ReaderStatus } from '../types';
import { ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ShoppingCartProps {
  cart: CartItem[];
  cartMeta: CartMeta;
  readerStatus: ReaderStatus;
  onUpdateQty: (product_id: string, delta: number) => Promise<void>;
  onRemoveItem: (product_id: string) => Promise<void>;
  onClearCart: () => Promise<void>;
  onApplyCoupon: (coupon: string) => Promise<void>;
  onProceedToCheckout: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cart,
  cartMeta,
  readerStatus,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onApplyCoupon,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatRs = (num: number) => {
    return `Rs. ${num.toLocaleString('en-LK')}`;
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    try {
      await onApplyCoupon(couponInput);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const confirmDeleteProduct = async () => {
    if (itemToRemove) {
      await onRemoveItem(itemToRemove.product_id);
      setItemToRemove(null);
    }
  };

  const confirmClearAll = async () => {
    await onClearCart();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Active Shopping Banner / Reader Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Live Smart Shopping Cart</h2>
            <p className="text-xs text-slate-400">
              Items placed in cart are automatically detected by RFID tag
            </p>
          </div>
        </div>

        {/* Reader Last Scan Quick Pill */}
        {readerStatus.last_scanned_id && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400">Last Detected:</span>
            <span className="font-mono text-emerald-400 font-bold">{readerStatus.last_scanned_id}</span>
            <span className="text-slate-300 font-medium">({readerStatus.last_detected_product})</span>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="text-center py-16 px-4 rounded-2xl glass-panel border border-dashed border-slate-800 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Your Shopping Cart is Empty</h3>
            <p className="text-sm text-slate-400">
              Place RFID tagged items into the smart shopping cart or use the RFID Simulator panel above to scan products.
            </p>
          </div>
        </div>
      ) : (
        /* Shopping Cart Main Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Item Table Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Scanned Items ({cart.reduce((a, b) => a + b.quantity, 0)})</h3>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Product</th>
                      <th className="px-4 py-3.5">RFID ID</th>
                      <th className="px-4 py-3.5 text-right">Price</th>
                      <th className="px-4 py-3.5 text-center">Qty</th>
                      <th className="px-4 py-3.5 text-right">Total</th>
                      <th className="px-6 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {cart.map((item) => (
                      <tr key={item.product_id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Product Info */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-white">{item.product_name}</div>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                              {item.category}
                            </span>
                          </div>
                        </td>

                        {/* RFID Tag */}
                        <td className="px-4 py-4 font-mono text-emerald-400 text-xs font-bold">
                          {item.rfid_tag_id}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 text-right font-medium text-slate-300">
                          {formatRs(item.price)}
                        </td>

                        {/* Quantity Controls */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => onUpdateQty(item.product_id, -1)}
                              title="Decrease quantity by 1"
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors border border-slate-700 font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-white text-base">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.product_id, 1)}
                              title="Increase quantity by 1"
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors border border-slate-700 font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Item Total */}
                        <td className="px-4 py-4 text-right font-extrabold text-white text-base">
                          {formatRs(item.total_price)}
                        </td>

                        {/* Remove Action */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setItemToRemove(item)}
                            title="Remove product entirely from cart"
                            className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cart Bill Summary Column */}
          <div className="space-y-4">
            
            {/* Bill Summary Card */}
            <div className="glass-panel-glow rounded-2xl p-6 space-y-6 shadow-2xl">
              <h3 className="text-lg font-extrabold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
                <span>Bill Summary</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {cart.length} Products
                </span>
              </h3>

              {/* Coupon Code Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Promo / Discount Coupon</span>
                </label>
                <form onSubmit={handleCouponSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. PASI100"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
                  >
                    Apply
                  </button>
                </form>
                {cartMeta.applied_coupon && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Coupon '{cartMeta.applied_coupon}' applied!</span>
                  </p>
                )}
                {couponError && <p className="text-xs text-rose-400">{couponError}</p>}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-3 pt-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">{formatRs(cartMeta.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-bold">- {formatRs(cartMeta.discount)}</span>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bill</div>
                    <div className="text-xs text-slate-500">Includes all taxes</div>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatRs(cartMeta.total)}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-base rounded-xl shadow-xl shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified RFID Smart Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Single Product Confirmation Modal */}
      {itemToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-7 h-7 flex-shrink-0" />
              <h3 className="text-lg font-bold text-white">Remove Product from Cart?</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to remove <strong className="text-white">{itemToRemove.product_name}</strong> (Qty: {itemToRemove.quantity}) from the active shopping cart?
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setItemToRemove(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-rose-600/20"
              >
                Yes, Remove Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-500">
              <AlertTriangle className="w-7 h-7 flex-shrink-0" />
              <h3 className="text-lg font-bold text-white">Clear Entire Shopping Cart?</h3>
            </div>
            <p className="text-sm text-slate-300">
              This will remove all <strong className="text-white">{cart.length} products</strong> from your bill. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-rose-600/20"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
