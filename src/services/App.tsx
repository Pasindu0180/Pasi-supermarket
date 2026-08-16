import React, { useState, useEffect } from 'react';

import { Header } from './components/Header';
import { RfidSimulator } from './components/RfidSimulator';
import { SimpleShoppingView } from './components/SimpleShoppingView';
import { ShoppingCart } from './components/ShoppingCart';
import { ProductManagement } from './components/ProductManagement';
import { TransactionHistory } from './components/TransactionHistory';
import { RfidLogAndHardware } from './components/RfidLogAndHardware';
import { CheckoutModal } from './components/CheckoutModal';

import { AppState, Transaction } from './types';

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

import {
  fetchAppState,
  scanRfid,
  updateQuantity,
  removeCartItem,
  clearCart,
  applyCoupon,
  toggleReaderStatus,
  updateSettings,
  createProduct,
  updateProduct,
  deleteProduct,
  checkout,
  connectSSE
} from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('simple');
  const [state, setState] = useState<AppState | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testFirebase = async () => {
    try {
      const productRef = doc(db, "products", "A5:48:0D:01");
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const product = productSnap.data();

        console.log("Firebase product:", product);

        alert(
          "Firebase connected!\n\n" +
          "Product: " + product.name +
          "\nPrice: " + product.price
        );
      } else {
        console.log("Product not found");
        alert("Firebase connected, but product was not found.");
      }

    } catch (error) {
      console.error("Firebase error:", error);
      alert("Firebase error. Open browser Console.");
    }
  };

  const loadState = async () => {
  try {
    const data = await fetchAppState();
    setState(data);
    setError(null);
  } catch (err: any) {
    setError(
      'Failed to connect to backend server. Make sure node server.js is running.'
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  // Load website/cart when the page first opens
  loadState();

  // Listen for real-time RFID events from server.js
  const disconnectSSE = connectSSE(() => {
    console.log("RFID update received from backend");

    // Reload cart automatically
    loadState();
  });

  // Disconnect when website closes
  return () => {
    disconnectSSE();
  };
}, []);

if (loading) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-300">
          Loading Pasi Supermarket RFID Smart Cart System...
        </p>
      </div>
    </div>
  );
}

if (error || !state) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md p-6 text-center space-y-4 shadow-2xl">
        <div className="text-rose-400 font-bold text-lg">
          Connection Error
        </div>

        <p className="text-xs text-slate-400">
          {error}
        </p>

        <button
          onClick={loadState}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-emerald-500 transition-all"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}

  const handleScanRfid = async (rfid_tag_id: string, force: boolean = false) => {
    await scanRfid(rfid_tag_id, force);
    await loadState();
  };

  const handleUpdateQty = async (product_id: string, delta: number) => {
    await updateQuantity(product_id, delta);
    await loadState();
  };

  const handleRemoveItem = async (product_id: string) => {
    await removeCartItem(product_id);
    await loadState();
  };

  const handleClearCart = async () => {
    await clearCart();
    await loadState();
  };

  const handleApplyCoupon = async (code: string) => {
    await applyCoupon(code);
    await loadState();
  };

  const handleToggleReader = async (connected: boolean) => {
    await toggleReaderStatus(connected);
    await loadState();
  };

  const handleUpdateSettings = async (debounce: number) => {
    await updateSettings(debounce);
    await loadState();
  };

  const handleCreateProduct = async (prod: any) => {
    await createProduct(prod);
    await loadState();
  };

  const handleUpdateProduct = async (id: string, prod: any) => {
    await updateProduct(id, prod);
    await loadState();
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    await loadState();
  };

  const handleCheckoutComplete = async (customerName: string, paymentMethod: string): Promise<Transaction> => {
    const res = await checkout(customerName, paymentMethod);
    await loadState();
    return res.transaction;
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <button
  onClick={testFirebase}
  className="m-4 p-3 bg-blue-600 text-white rounded"
>
  Test Firebase
</button>
      
      {/* Supermarket Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartId={state.cart_meta.cart_id}
        itemCount={state.cart.reduce((a, b) => a + b.quantity, 0)}
        readerStatus={state.reader_status}
        onToggleReader={handleToggleReader}
      />

      {/* Global RFID Hardware Simulator (Available for quick IoT demo across views) */}
      <RfidSimulator
        products={state.products}
        onScan={handleScanRfid}
        readerConnected={state.reader_status.connected}
        onToggleReader={handleToggleReader}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simple' && (
          <SimpleShoppingView
            products={state.products}
            cart={state.cart}
            cartMeta={state.cart_meta}
            readerStatus={state.reader_status}
            onScan={handleScanRfid}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProceedToCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

        {activeTab === 'cart' && (
          <ShoppingCart
            cart={state.cart}
            cartMeta={state.cart_meta}
            readerStatus={state.reader_status}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onApplyCoupon={handleApplyCoupon}
            onProceedToCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

        {activeTab === 'products' && (
          <ProductManagement
            products={state.products}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistory
            transactions={state.transactions}
          />
        )}

        {activeTab === 'hardware' && (
          <RfidLogAndHardware
            logs={state.rfid_logs}
            readerStatus={state.reader_status}
            settings={state.settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          cart={state.cart}
          cartMeta={state.cart_meta}
          onCheckoutComplete={handleCheckoutComplete}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* Supermarket Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 <strong className="text-slate-300">Pasi Supermarket</strong> — RFID Smart Shopping Cart System
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>University IoT & Mechatronics Demonstration</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">ESP32 REST API v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
