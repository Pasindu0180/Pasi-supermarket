import React, { useState } from 'react';
import { CartItem, CartMeta, Transaction } from '../types';
import { Receipt, Printer, Download, CheckCircle2, ArrowLeft, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CheckoutModalProps {
  cart: CartItem[];
  cartMeta: CartMeta;
  onCheckoutComplete: (customerName: string, paymentMethod: string) => Promise<Transaction>;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  cartMeta,
  onCheckoutComplete,
  onClose,
}) => {
  const [customerName, setCustomerName] = useState('Valued Customer');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  const formatRs = (num: number) => `Rs. ${num.toLocaleString('en-LK')}`;

  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const txn = await onCheckoutComplete(customerName, paymentMethod);
      setCompletedTransaction(txn);
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const txn = completedTransaction || {
      bill_number: 'PS-000123',
      date: new Date().toLocaleString('en-LK'),
      customer_name: customerName,
      payment_method: paymentMethod,
      subtotal: cartMeta.subtotal,
      discount: cartMeta.discount,
      total: cartMeta.total,
      items: cart.map(c => ({
        product_name: c.product_name,
        rfid_tag_id: c.rfid_tag_id,
        unit_price: c.price,
        quantity: c.quantity,
        total_price: c.total_price
      }))
    };

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('PASI SUPERMARKET', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text('RFID SMART SHOPPING CART SYSTEM', 105, 26, { align: 'center' });
    doc.text('Main Branch, Colombo, Sri Lanka', 105, 32, { align: 'center' });
    doc.line(14, 36, 196, 36);

    // Bill Details
    doc.setFontSize(10);
    doc.text(`Bill No: ${txn.bill_number}`, 14, 44);
    doc.text(`Date: ${txn.date}`, 14, 50);
    doc.text(`Customer: ${txn.customer_name}`, 140, 44);
    doc.text(`Payment: ${txn.payment_method}`, 140, 50);

    // Table
    const tableData = txn.items.map(item => [
      item.product_name,
      item.rfid_tag_id,
      `Rs. ${item.unit_price.toLocaleString()}`,
      item.quantity.toString(),
      `Rs. ${item.total_price.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 56,
      head: [['Item Description', 'RFID Tag', 'Unit Price', 'Qty', 'Total Price']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;

    // Summary Totals
    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY + 10);
    doc.text(`Rs. ${txn.subtotal.toLocaleString()}`, 196, finalY + 10, { align: 'right' });

    doc.text(`Discount:`, 140, finalY + 16);
    doc.text(`Rs. ${txn.discount.toLocaleString()}`, 196, finalY + 16, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL BILL:`, 140, finalY + 24);
    doc.text(`Rs. ${txn.total.toLocaleString()}`, 196, finalY + 24, { align: 'right' });

    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for shopping at Pasi Supermarket!', 105, finalY + 38, { align: 'center' });
    doc.text('Powered by RFID Smart Cart Technology', 105, finalY + 44, { align: 'center' });

    doc.save(`Pasi_Supermarket_Bill_${txn.bill_number}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print-container">
        
        {!completedTransaction ? (
          /* Step 1: Checkout Form & Confirmation */
          <form onSubmit={handleConfirmCheckout} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Smart Cart Checkout</h3>
                  <p className="text-xs text-slate-400">Confirm payment and generate customer receipt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Payment Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sampath Perera"
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Cash">💵 Cash Payment</option>
                  <option value="Card">💳 Credit / Debit Card</option>
                  <option value="Mobile / LankaQR">📱 LankaQR / Mobile Pay</option>
                </select>
              </div>
            </div>

            {/* Itemized Preview Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cart Items ({cart.reduce((a, b) => a + b.quantity, 0)})
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-2 divide-y divide-slate-800/60">
                {cart.map((item) => (
                  <div key={item.product_id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{item.product_name}</div>
                      <span className="text-[10px] font-mono text-emerald-400">{item.rfid_tag_id}</span>
                      <span className="text-[10px] text-slate-400"> × {item.quantity}</span>
                    </div>
                    <div className="font-extrabold text-slate-200">{formatRs(item.total_price)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-bold text-white">{formatRs(cartMeta.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span className="font-bold">- {formatRs(cartMeta.discount)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Final Total Bill:</span>
                <span className="text-emerald-400 text-xl">{formatRs(cartMeta.total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-base rounded-xl shadow-xl shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isProcessing ? 'Processing Transaction...' : 'Complete Payment & Issue Bill'}</span>
            </button>
          </form>
        ) : (
          /* Step 2: Final Printable & Downloadable Bill */
          <div className="space-y-6">
            
            {/* Header Success Tag */}
            <div className="text-center space-y-2 no-print">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">Payment Completed!</h3>
              <p className="text-xs text-slate-400">Transaction logged and receipt generated successfully</p>
            </div>

            {/* Receipt Preview Box */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-2xl font-sans space-y-4 print-container text-xs">
              
              {/* Receipt Header */}
              <div className="text-center border-b border-slate-300 pb-3 space-y-0.5">
                <div className="font-black text-lg text-slate-900 tracking-wider">PASI SUPERMARKET</div>
                <div className="font-bold text-[10px] text-slate-600">RFID SMART SHOPPING CART SYSTEM</div>
                <div className="text-[10px] text-slate-500">Main Supermarket Outlet, Colombo</div>
              </div>

              {/* Receipt Info */}
              <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                <div>
                  <div>Bill No: <strong className="text-slate-900">{completedTransaction.bill_number}</strong></div>
                  <div>Date: {completedTransaction.date}</div>
                </div>
                <div className="text-right">
                  <div>Customer: {completedTransaction.customer_name}</div>
                  <div>Payment: {completedTransaction.payment_method}</div>
                </div>
              </div>

              {/* Item List */}
              <table className="w-full border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-extrabold">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {completedTransaction.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1 font-medium">{item.product_name}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">Rs. {item.unit_price.toLocaleString()}</td>
                      <td className="py-1 text-right font-bold">Rs. {item.total_price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Receipt Totals */}
              <div className="border-t border-slate-900 pt-2 space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">Rs. {completedTransaction.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-bold">- Rs. {completedTransaction.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300 text-slate-900">
                  <span>TOTAL BILL:</span>
                  <span>Rs. {completedTransaction.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-500 pt-3 border-t border-dashed border-slate-300">
                Thank you for shopping at Pasi Supermarket!
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 no-print">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Bill</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Bill</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl transition-colors no-print"
            >
              Start New Shopping Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
