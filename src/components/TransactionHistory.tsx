import React, { useState } from 'react';
import { Transaction } from '../types';
import { History, Search, Eye, Printer, Download, Receipt, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const formatRs = (num: number) => `Rs. ${num.toLocaleString('en-LK')}`;

  const filtered = transactions.filter(t =>
    t.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = (txn: Transaction) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('PASI SUPERMARKET', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text('RFID SMART SHOPPING CART SYSTEM', 105, 26, { align: 'center' });
    doc.line(14, 32, 196, 32);

    doc.setFontSize(10);
    doc.text(`Bill No: ${txn.bill_number}`, 14, 40);
    doc.text(`Date: ${txn.date}`, 14, 46);
    doc.text(`Customer: ${txn.customer_name}`, 140, 40);
    doc.text(`Payment: ${txn.payment_method}`, 140, 46);

    const tableData = txn.items.map(item => [
      item.product_name,
      item.rfid_tag_id,
      `Rs. ${item.unit_price.toLocaleString()}`,
      item.quantity.toString(),
      `Rs. ${item.total_price.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 52,
      head: [['Item Description', 'RFID Tag', 'Unit Price', 'Qty', 'Total Price']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${txn.subtotal.toLocaleString()}`, 140, finalY + 10);
    doc.text(`Discount: Rs. ${txn.discount.toLocaleString()}`, 140, finalY + 16);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL BILL: Rs. ${txn.total.toLocaleString()}`, 140, finalY + 24);

    doc.save(`Pasi_Supermarket_Bill_${txn.bill_number}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" /> Shopping Transaction History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete archive of past smart cart checkouts, invoices, and customer payments
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Bill No or Customer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Bill Number</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5 text-center">Items</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5 text-right">Total Amount</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No matching transaction history found.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn.transaction_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      {txn.bill_number}
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-xs font-medium">
                      {txn.date}
                    </td>
                    <td className="px-4 py-4 font-semibold text-white">
                      {txn.customer_name}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-300">
                      {txn.items.reduce((a, b) => a + b.quantity, 0)} items
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {txn.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-extrabold text-emerald-400 text-base">
                      {formatRs(txn.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Bill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 my-8 print-container">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 no-print">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Bill Details — {selectedTxn.bill_number}</h3>
                  <p className="text-xs text-slate-400">{selectedTxn.date}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Receipt Layout */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-2xl space-y-4 text-xs font-sans">
              <div className="text-center border-b border-slate-300 pb-3 space-y-0.5">
                <div className="font-black text-lg text-slate-900">PASI SUPERMARKET</div>
                <div className="font-bold text-[10px] text-slate-600">RFID SMART SHOPPING CART</div>
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                <div>
                  <div>Bill No: <strong>{selectedTxn.bill_number}</strong></div>
                  <div>Date: {selectedTxn.date}</div>
                </div>
                <div className="text-right">
                  <div>Customer: {selectedTxn.customer_name}</div>
                  <div>Payment: {selectedTxn.payment_method}</div>
                </div>
              </div>

              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-bold">
                    <th className="py-1">Product</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Unit Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedTxn.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 font-medium">{item.product_name}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">Rs. {item.unit_price.toLocaleString()}</td>
                      <td className="py-1 text-right font-bold">Rs. {item.total_price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-slate-900 pt-2 space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">Rs. {selectedTxn.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-bold">- Rs. {selectedTxn.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300 text-slate-900">
                  <span>TOTAL PAID:</span>
                  <span>Rs. {selectedTxn.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex space-x-3 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Copy</span>
              </button>

              <button
                onClick={() => handleDownloadPDF(selectedTxn)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
