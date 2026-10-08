import React from 'react';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const QuotesView: React.FC = () => {
  const { quotes, updateQuoteStatus } = useAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900">Custom Quote Requests ({quotes.length})</h2>
        <p className="text-xs text-slate-500">Manage custom corporate quote requests, assign prices, and convert to orders.</p>
      </div>

      <div className="space-y-3">
        {quotes.map((q) => (
          <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">{q.id}</span>
                <span className="text-xs font-black text-slate-900">{q.customerName}</span>
                <span className="text-[11px] text-slate-500">({q.phone})</span>
              </div>
              <p className="text-xs text-slate-700 font-semibold">Service: {q.service} · Qty: {q.quantity}</p>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">Specs: {q.specifications}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-black rounded-lg ${
                q.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : q.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {q.status}
              </span>
              {q.status === 'Pending' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuoteStatus(q.id, 'Approved', 1500)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Approve (₹1500)
                  </button>
                  <button
                    onClick={() => updateQuoteStatus(q.id, 'Rejected')}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-black text-xs rounded-xl cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
