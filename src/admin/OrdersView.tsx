import React, { useState } from 'react';
import { ShoppingBag, Printer, Eye, CheckCircle, Clock, Search } from 'lucide-react';
import { useAdmin, AdminOrder } from '../context/AdminContext';
import { InvoiceModal } from './InvoiceModal';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, saveInvoice } = useAdmin();
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<AdminOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filtered = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

  const statuses: AdminOrder['status'][] = ['New', 'Confirmed', 'Designing', 'Printing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Order Management System (OMS) ({orders.length})</h2>
          <p className="text-xs text-slate-500">Track order lifecycle stages from confirmation to doorstep delivery or store pickup.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'New', 'In Printing', 'Ready', 'Delivered'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st ? 'bg-[#50007c] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((ord) => (
          <div key={ord.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded">{ord.id}</span>
                <span className="text-xs font-black text-slate-900">{ord.customerName}</span>
                <span className="text-[11px] text-slate-500">({ord.phone})</span>
              </div>
              <p className="text-xs text-slate-700 font-semibold">{ord.productTitle} · Qty: {ord.quantity} ({ord.options})</p>
              <p className="text-[11px] text-slate-500">Address: {ord.address} · Date: {ord.date}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Status:</span>
                <select
                  value={ord.status}
                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#50007c]"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">₹{ord.totalAmount}</span>
                <button
                  onClick={() => {
                    saveInvoice(ord);
                    setSelectedOrderForInvoice(ord);
                  }}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  title="Generate Tax Invoice"
                >
                  <Printer className="w-3.5 h-3.5" /> Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

    </div>
  );
};
