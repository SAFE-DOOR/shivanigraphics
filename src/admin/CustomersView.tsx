import React, { useState } from 'react';
import { Users, ShoppingBag, DollarSign, Phone, Mail, MapPin, Search, Award } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const CustomersView: React.FC = () => {
  const { orders } = useAdmin();
  const [search, setSearch] = useState('');

  // Group orders by phone/email to build customer profiles
  const customerMap = new Map<string, {
    name: string;
    phone: string;
    email: string;
    address: string;
    ordersCount: number;
    totalSpend: number;
    lastOrderDate: string;
    ordersList: any[];
  }>();

  orders.forEach(ord => {
    const key = ord.phone || ord.customerName;
    if (!key) return;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: ord.customerName || 'Valued Customer',
        phone: ord.phone || 'N/A',
        email: ord.email || 'customer@shivanigraphics.com',
        address: ord.address || 'Delhi NCR',
        ordersCount: 0,
        totalSpend: 0,
        lastOrderDate: ord.date,
        ordersList: []
      });
    }
    const cust = customerMap.get(key)!;
    cust.ordersCount += 1;
    cust.totalSpend += Number(ord.totalAmount || 0);
    cust.ordersList.push(ord);
    if (ord.date > cust.lastOrderDate) {
      cust.lastOrderDate = ord.date;
    }
  });

  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  const totalCustomerCount = customers.length;
  const totalRevenueAll = customers.reduce((acc, c) => acc + c.totalSpend, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Customer Database & History ({totalCustomerCount})</h2>
          <p className="text-xs text-slate-500">All customers stored in Firestore, with comprehensive order history and lifetime spend calculation.</p>
        </div>
        <div className="bg-purple-100 text-[#50007c] px-4 py-2 rounded-2xl font-black text-xs">
          Total Customer Lifetime Spend: ₹{totalRevenueAll.toLocaleString()}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name or phone number..."
          className="w-full text-xs focus:outline-none font-medium"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((cust, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#50007c] font-black text-xs flex items-center justify-center shrink-0">
                  {cust.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{cust.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-purple-600" /> {cust.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-purple-600" /> {cust.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Spend</span>
                  <p className="text-base font-black text-emerald-600">₹{cust.totalSpend.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Orders</span>
                  <p className="text-base font-black text-[#50007c]">{cust.ordersCount}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order History</span>
              <div className="space-y-2">
                {cust.ordersList.map((ord, oIdx) => (
                  <div key={oIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded mr-2">{ord.id}</span>
                      <span className="font-bold text-slate-900">{ord.productTitle}</span>
                      <span className="text-slate-500 ml-2">(Qty: {ord.quantity})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">{ord.status}</span>
                      <span className="font-black text-slate-900">₹{ord.totalAmount}</span>
                      <span className="text-slate-400 text-[11px]">{ord.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
