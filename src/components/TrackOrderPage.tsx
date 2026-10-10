import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Package, 
  Printer, 
  MessageCircle, 
  ArrowLeft,
  AlertCircle,
  Hash,
  ShieldCheck
} from 'lucide-react';
import { WHATSAPP_PRIMARY } from '../utils/whatsapp';
import { useAdmin, AdminOrder } from '../context/AdminContext';

interface TrackOrderPageProps {
  onBackToHome: () => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ onBackToHome }) => {
  const { orders } = useAdmin();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<AdminOrder | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setMatchedOrder(null);
      return;
    }

    const found = orders.find(o => 
      o.id.toLowerCase().includes(trimmed) || 
      o.phone.toLowerCase().includes(trimmed) || 
      o.customerName.toLowerCase().includes(trimmed)
    );
    setMatchedOrder(found || null);
  };

  const handleWhatsAppStatus = () => {
    const text = encodeURIComponent(
      `Hello Shivani Graphics! I would like to get live production status for my order / phone number: ${query || 'recent order'}.`
    );
    window.open(`https://wa.me/${WHATSAPP_PRIMARY}?text=${text}`, '_blank');
  };

  // Helper to determine active step based on order status
  const getStepNumber = (status: AdminOrder['status']) => {
    switch (status) {
      case 'New':
      case 'Confirmed': return 1;
      case 'Design Pending': return 2;
      case 'Designing': return 2;
      case 'Printing': return 3;
      case 'Quality Check': return 4;
      case 'Ready':
      case 'Ready for Pickup':
      case 'Out for Delivery':
      case 'Delivered': return 5;
      default: return 1;
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-[75vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={onBackToHome} className="hover:text-[#50007c] font-medium flex items-center gap-1 cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span>/</span>
          <span className="font-bold text-slate-900">Track Real Orders</span>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#50007c] flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Live Order Tracking System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Directly connected to our Master Admin database in Mahavir Enclave. Enter your Order ID or Phone number for real-time production updates.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Mobile No. (e.g. 9266944315) or Order ID"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 outline-hidden focus:border-[#50007c] focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="py-3 px-6 bg-[#50007c] hover:bg-[#400063] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Check Live Status</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            Connected to real-time database. Any changes in Admin Panel reflect here instantly.
          </p>
        </div>

        {/* Search Results */}
        {searched && matchedOrder ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Order Details</p>
                <p className="text-base sm:text-lg font-black text-slate-900">{matchedOrder.productTitle} (Qty: {matchedOrder.quantity})</p>
                <p className="text-xs text-slate-500">Customer: <strong className="text-slate-800">{matchedOrder.customerName}</strong> ({matchedOrder.phone})</p>
              </div>
              <span className="px-3.5 py-1.5 bg-orange-50 text-orange-800 text-xs font-black rounded-xl border border-orange-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span>Status: {matchedOrder.status}</span>
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              
              {/* Step 1 */}
              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] ${getStepNumber(matchedOrder.status) >= 1 ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  {getStepNumber(matchedOrder.status) > 1 ? '✓' : '1'}
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900">Order Received & Specs Verified</p>
                <p className="text-[11px] text-slate-500">Order reference #{matchedOrder.id} successfully recorded in system.</p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] ${getStepNumber(matchedOrder.status) >= 2 ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  {getStepNumber(matchedOrder.status) > 2 ? '✓' : '2'}
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900">Design & Prepress Processing</p>
                <p className="text-[11px] text-slate-500">Bleed and color calibration proof verified.</p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] ${getStepNumber(matchedOrder.status) >= 3 ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  {getStepNumber(matchedOrder.status) > 3 ? '✓' : '3'}
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900">High-Speed Digital Press Production</p>
                <p className="text-[11px] text-slate-500">Printing in progress on our production engine in Mahavir Enclave.</p>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] ${getStepNumber(matchedOrder.status) >= 4 ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  {getStepNumber(matchedOrder.status) > 4 ? '✓' : '4'}
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900">Lamination, Precision Trimming & Quality Check</p>
                <p className="text-[11px] text-slate-500">Thermal sealing and micro edge cutter finishing.</p>
              </div>

              {/* Step 5 */}
              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] ${getStepNumber(matchedOrder.status) >= 5 ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  {getStepNumber(matchedOrder.status) >= 5 ? '✓' : '5'}
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900">Dispatched / Ready for Store Pickup</p>
                <p className="text-[11px] text-slate-500">Ready for collection at D3/50, Mahavir Enclave or courier dispatch.</p>
              </div>

            </div>

            {/* Action Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-600 text-center sm:text-left">
                Need urgent assistance regarding Order #{matchedOrder.id}?
              </p>
              <button
                type="button"
                onClick={handleWhatsAppStatus}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Ask on WhatsApp</span>
              </button>
            </div>
          </div>
        ) : searched && !matchedOrder ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">No Order Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active order matches "<strong className="text-slate-800">{query}</strong>". Please verify your Order ID or Phone number, or contact our print desk.
              </p>
            </div>
            <button
              type="button"
              onClick={handleWhatsAppStatus}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contact Print Desk on WhatsApp</span>
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );
};
