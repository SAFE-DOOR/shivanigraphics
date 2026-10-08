import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Package, Tag, Star, Users, FileText, ShieldCheck, Activity } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, updateInventory } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Inventory & Raw Material Control</h2>
      <div className="space-y-3">
        {inventory.map((i) => (
          <div key={i.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded">{i.sku}</span>
              <h4 className="text-xs font-bold text-slate-900 pt-1">{i.item}</h4>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black px-3 py-1 rounded-lg ${i.currentStock <= i.minStock ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                Stock: {i.currentStock} {i.unit}
              </span>
              <button
                onClick={() => updateInventory(i.id, i.currentStock + 20)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl cursor-pointer"
              >
                + Restock (20)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MarketingView: React.FC = () => {
  const { coupons, addCoupon } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Coupons & Promotional Offers</h2>
      <div className="space-y-3">
        {coupons.map((c, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-xs font-mono font-black text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg">{c.code}</span>
              <p className="text-xs text-slate-600 pt-1">Discount: {c.discountValue}{c.discountType === 'percentage' ? '%' : ' INR'} · Min Order: ₹{c.minOrder}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReviewsView: React.FC = () => {
  const { reviews, toggleReviewApproval } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Customer Reviews Moderation</h2>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">{r.name}</span>
                <span className="text-xs text-amber-500 font-bold">★ {r.rating}.0</span>
              </div>
              <p className="text-xs text-slate-600 pt-1">"{r.review}"</p>
            </div>
            <button
              onClick={() => toggleReviewApproval(r.id)}
              className={`px-3 py-1.5 font-black text-xs rounded-xl cursor-pointer ${r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}
            >
              {r.approved ? 'Approved (Public)' : 'Hidden'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UsersView: React.FC = () => {
  const { currentAdminUser } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Admin Users & Role Permissions</h2>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div>
            <p className="font-black text-purple-900">{currentAdminUser?.name || 'Ranjan Roy'} ({currentAdminUser?.email})</p>
            <p className="text-purple-700 text-[11px]">Role: <strong className="text-purple-900">{currentAdminUser?.role || 'Super Admin'}</strong></p>
          </div>
          <span className="px-3 py-1 bg-[#50007c] text-white font-bold rounded-lg">Active Session</span>
        </div>
      </div>
    </div>
  );
};

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Activity & Audit Logs</h2>
      <div className="space-y-2">
        {auditLogs.map((log) => (
          <div key={log.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
            <div>
              <span className="font-bold text-slate-900">{log.admin}:</span> <span className="text-slate-700">{log.action}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{log.date} at {log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
