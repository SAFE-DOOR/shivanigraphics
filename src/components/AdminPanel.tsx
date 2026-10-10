import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  ArrowLeft, 
  Trash2, 
  ShieldCheck,
  Printer,
  ExternalLink,
  User,
  Phone,
  MapPin,
  Cloud,
  Database
} from 'lucide-react';
import { OrderRecord, OrderStatus } from '../types';
import { WHATSAPP_PRIMARY, STORE_ADDRESS } from '../utils/whatsapp';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface AdminPanelProps {
  onBackToHome: () => void;
}

const STORAGE_KEY = 'sg_admin_orders_v1';

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'SG-842910',
    customerName: 'Rahul Sharma',
    customerPhone: '9810157695',
    customerCity: 'New Delhi',
    productTitle: 'Visiting Cards & Letterhead Printing',
    quantity: 500,
    specsSummary: '350 GSM Art Card + Velvet Matt',
    status: 'In High-Speed Production',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Urgent store pickup requested'
  },
  {
    id: 'SG-902144',
    customerName: 'Priya Verma',
    customerPhone: '9266944315',
    customerCity: 'Gurgaon',
    productTitle: 'Scroll Wedding Cards',
    quantity: 150,
    specsSummary: 'Royal Velvet Scroll + Gold Foil',
    status: 'Digital Proof Approved',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: 'Approved via WhatsApp proof'
  },
  {
    id: 'SG-771829',
    customerName: 'Amit Gupta',
    customerPhone: '9871234567',
    customerCity: 'Noida',
    productTitle: 'Flex Printing & Flex/Banner Boards',
    quantity: 1,
    specsSummary: '8 ft x 4 ft Star Flex + Metal Frame',
    status: 'Dispatched / Ready for Pickup',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    notes: 'Bike courier dispatch assigned'
  }
];

const STATUS_LIST: OrderStatus[] = [
  'Received & Verified',
  'Digital Proof Approved',
  'In High-Speed Production',
  'Lamination & Quality Check',
  'Dispatched / Ready for Pickup'
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToHome }) => {
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  
  // New Order Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newProductTitle, setNewProductTitle] = useState('Visiting Cards & Letterhead Printing');
  const [newQuantity, setNewQuantity] = useState('250');
  const [newSpecs, setNewSpecs] = useState('350 GSM Matte');
  const [newNotes, setNewNotes] = useState('');

  // Firestore Real-time Sync
  useEffect(() => {
    try {
      const colRef = collection(db, 'orders');
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const cloudOrders: OrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          cloudOrders.push(docSnap.data() as OrderRecord);
        });
        if (cloudOrders.length > 0) {
          setOrders(cloudOrders);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudOrders));
          setIsCloudSynced(true);
        } else {
          // If Firestore is empty, seed initial orders to Firestore
          INITIAL_ORDERS.forEach(async (order) => {
            await setDoc(doc(db, 'orders', order.id), order);
          });
          setIsCloudSynced(true);
        }
      }, (error) => {
        console.warn('Firestore sync fallback:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore offline fallback:', e);
    }
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      const target = updated.find(o => o.id === orderId);
      if (target) {
        await setDoc(doc(db, 'orders', orderId), target);
      }
    } catch (e) {
      console.error('Cloud update error:', e);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (e) {
        console.error('Cloud delete error:', e);
      }
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      alert('Please enter customer name and phone number.');
      return;
    }

    const randomId = 'SG-' + Math.floor(100000 + Math.random() * 900000);
    const newRecord: OrderRecord = {
      id: randomId,
      customerName: newCustomerName.trim(),
      customerPhone: newCustomerPhone.trim(),
      customerCity: 'Delhi NCR',
      productTitle: newProductTitle,
      quantity: parseInt(newQuantity) || 100,
      specsSummary: newSpecs,
      status: 'Received & Verified',
      createdAt: new Date().toISOString(),
      notes: newNotes.trim()
    };

    const updated = [newRecord, ...orders];
    setOrders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setIsAdding(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewNotes('');

    try {
      await setDoc(doc(db, 'orders', randomId), newRecord);
    } catch (e) {
      console.error('Cloud create error:', e);
    }
  };

  // Send WhatsApp message to customer regarding their order status
  const handleSendWhatsAppUpdate = (order: OrderRecord) => {
    const text = encodeURIComponent(
      `Hello ${order.customerName}! 🖨️ *Shivani Graphics Order Update*:\n\n` +
      `*Order ID:* #${order.id}\n` +
      `*Product:* ${order.productTitle} (${order.quantity} pcs)\n` +
      `*Current Status:* ${order.status}\n` +
      `*Specifications:* ${order.specsSummary}\n\n` +
      `You can track anytime or reach us at ${STORE_ADDRESS}. Thank you for printing with Shivani Graphics!`
    );
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : (cleanPhone || WHATSAPP_PRIMARY);
    window.open(`https://wa.me/${phoneParam}?text=${text}`, '_blank');
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.productTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="py-8 sm:py-12 bg-slate-100 min-h-[85vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <button onClick={onBackToHome} className="hover:text-[#50007c] font-medium flex items-center gap-1 cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Store</span>
              </button>
              <span>/</span>
              <span className="font-bold text-slate-900">Firebase Cloud Admin Panel</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Printer className="w-6 h-6 text-[#50007c]" />
              <span>Print Shop Admin & Order Tracking Manager</span>
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>Manage production statuses, track customer orders, and instantly broadcast live updates via WhatsApp.</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Firestore Cloud Active</span>
              </span>
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="py-2.5 px-5 bg-[#50007c] hover:bg-[#400063] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Create New Order'}</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">In Production</p>
            <p className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
              {orders.filter(o => o.status === 'In High-Speed Production' || o.status === 'Received & Verified' || o.status === 'Digital Proof Approved').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Quality Check</p>
            <p className="text-xl sm:text-2xl font-black text-purple-700 mt-1">
              {orders.filter(o => o.status === 'Lamination & Quality Check').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Ready / Dispatched</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              {orders.filter(o => o.status === 'Dispatched / Ready for Pickup').length}
            </p>
          </div>
        </div>

        {/* Create Order Modal / Drawer Form */}
        {isAdding && (
          <form onSubmit={handleCreateOrder} className="bg-white p-6 rounded-3xl border border-purple-200 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">Add New Print Order & Assign Tracking ID</h3>
              <span className="text-[10px] bg-purple-100 text-[#50007c] font-bold px-2 py-0.5 rounded-full">Auto generates ID</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Mukesh Kumar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp Phone No. *</label>
                <input
                  type="text"
                  required
                  value={newCustomerPhone}
                  onChange={e => setNewCustomerPhone(e.target.value)}
                  placeholder="e.g. 9810157695"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Title</label>
                <select
                  value={newProductTitle}
                  onChange={e => setNewProductTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#50007c] bg-white cursor-pointer"
                >
                  <option value="Visiting Cards & Letterhead Printing">Visiting Cards & Letterhead Printing</option>
                  <option value="Flex Printing & Flex/Banner Boards">Flex Printing & Flex/Banner Boards</option>
                  <option value="Scroll Wedding Cards">Scroll Wedding Cards</option>
                  <option value="Bill Books & Office File Printing">Bill Books & Office File Printing</option>
                  <option value="Custom Notebook and Spiral Notebook">Custom Notebook and Spiral Notebook</option>
                  <option value="Acrylic & Branch Sign Boards">Acrylic & Branch Sign Boards</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newQuantity}
                  onChange={e => setNewQuantity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Specifications Summary</label>
                <input
                  type="text"
                  value={newSpecs}
                  onChange={e => setNewSpecs(e.target.value)}
                  placeholder="e.g. 300 GSM Matte Art Card"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Special Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. Urgent pickup by evening"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-6 bg-[#50007c] hover:bg-[#400063] text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Save & Sync to Firestore Cloud
              </button>
            </div>
          </form>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Mobile No. or Product..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-slate-900 text-xs font-medium rounded-xl border border-slate-200 outline-hidden focus:border-[#50007c] focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#50007c] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {STATUS_LIST.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Tracking ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product & Specs</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions / WhatsApp Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 align-top">
                        <span className="font-mono font-black text-[#55007c] text-sm bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block w-max">
                          {order.id}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-4 px-4 align-top space-y-0.5">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-slate-600 font-mono text-[11px]">{order.customerPhone}</p>
                        <p className="text-[10px] text-slate-400">{order.customerCity || 'Delhi NCR'}</p>
                      </td>

                      <td className="py-4 px-4 align-top space-y-1">
                        <p className="font-black text-slate-900">{order.productTitle}</p>
                        <p className="text-[11px] text-slate-600">Qty: <strong className="text-slate-900">{order.quantity} pcs</strong></p>
                        <p className="text-[11px] text-slate-500 italic">{order.specsSummary}</p>
                        {order.notes && (
                          <p className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 mt-1">
                            Note: {order.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top">
                        <select
                          value={order.status}
                          onChange={e => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className={`p-2 rounded-xl text-xs font-bold border outline-hidden cursor-pointer ${
                            order.status === 'Dispatched / Ready for Pickup'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === 'In High-Speed Production'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-purple-50 text-[#50007c] border-purple-300'
                          }`}
                        >
                          {STATUS_LIST.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-4 px-4 align-top text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendWhatsAppUpdate(order)}
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            title="Send status update to customer via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp Update</span>
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-xl transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
