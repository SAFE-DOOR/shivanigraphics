import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { AdminOrder } from '../context/AdminContext';

interface InvoiceModalProps {
  order: AdminOrder;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#50007c] text-white flex items-center justify-center font-black">
              SG
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Shivani Graphics Tax Invoice</h3>
              <p className="text-xs text-slate-500 font-mono">GSTIN: 07AGJPR4456J1ZW</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700">
          <div className="flex justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900">Billed To:</p>
              <p>{order.customerName}</p>
              <p>{order.address}</p>
              <p>Phone: {order.phone}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">Invoice Details:</p>
              <p><strong className="text-purple-800">Order ID:</strong> {order.id}</p>
              <p><strong className="text-purple-800">Date:</strong> {order.date}</p>
              <p><strong className="text-purple-800">Status:</strong> {order.paymentStatus}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3 font-semibold text-slate-900">
                  {order.productTitle}
                  <div className="text-[11px] text-slate-500 font-normal">Options: {order.options}</div>
                </td>
                <td className="py-3 text-center">{order.quantity}</td>
                <td className="py-3 text-right font-black">₹{order.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{(order.totalAmount / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18% ITC):</span>
                <span>₹{(order.totalAmount - (order.totalAmount / 1.18)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-purple-900">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 text-center">
            <p className="font-bold text-slate-700">Shivani Graphics · Mahavir Enclave, New Delhi 110045</p>
            <p>Thank you for your business! For queries contact +91-9810157695 / shivanidigitalprints@gmail.com</p>
          </div>
        </div>

      </div>
    </div>
  );
};
