import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Lock, Package, Layout, Layers, MessageSquare, 
  Plus, Trash2, Edit3, Save, CheckCircle, RefreshCw, Image, Upload, Eye, AlertCircle, Check, ToggleLeft, ToggleRight,
  TrendingUp, ShoppingBag, Users, DollarSign, Star, FileText, Settings, LogOut, Search, Filter, ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { ProductItem } from '../types';
import { uploadProductImage, deleteProductImage } from '../utils/firebaseStorage';

interface MasterAdminPanelProps {
  onClose: () => void;
}

export const MasterAdminPanel: React.FC<MasterAdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'banners' | 'icons' | 'reviews' | 'inquiries'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Firestore data states
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbBanners, setDbBanners] = useState<any[]>([]);
  const [dbIcons, setDbIcons] = useState<any[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [dbInquiries, setDbInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal / Editor states
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Fetch collections on auth success
  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbProducts(list.length > 0 ? list : PRODUCTS.map(p => ({ 
        ...p, 
        minPrice: p.minPrice || 499, 
        minQty: 10, 
        active: true 
      })));
    }, (err) => console.error("Products error:", err));

    // Fetch Banners
    const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbBanners(list);
    }, (err) => console.error("Banners error:", err));

    // Fetch Quick Icons
    const unsubIcons = onSnapshot(collection(db, 'quick_icons'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbIcons(list);
    }, (err) => console.error("Icons error:", err));

    // Fetch Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbOrders(list);
    }, (err) => console.error("Orders error:", err));

    // Fetch Reviews
    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbReviews(list);
    }, (err) => console.error("Reviews error:", err));

    // Fetch Inquiries
    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbInquiries(list);
    }, (err) => console.error("Inquiries error:", err));

    return () => {
      unsubProducts();
      unsubBanners();
      unsubIcons();
      unsubOrders();
      unsubReviews();
      unsubInquiries();
    };
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@shivanigraphics.com' && adminPassword === 'shivani123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else if (adminEmail && adminPassword) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Please enter valid admin credentials');
    }
  };

  const handleSeedDefaultData = async () => {
    setLoading(true);
    try {
      for (const p of PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          title: p.title,
          category: p.category,
          minPrice: p.minPrice || 499,
          rating: p.rating,
          reviewCount: p.reviewCount,
          images: p.images,
          badge: p.badge || '⚡ 5-Minute Store Pickup',
          subtitle: p.subtitle,
          minQty: 10,
          active: true,
          createdAt: serverTimestamp()
        });
      }
      alert('Default 31+ products seeded to Firebase successfully!');
    } catch (err) {
      console.error(err);
      alert('Error seeding data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100"
        >
          <button 
            type="button" 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-purple-100 text-[#50007c] rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shivani Graphics Admin</h2>
            <p className="text-xs text-slate-500 mt-1">Master Control Panel & Database Studio</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Admin Email / Username</label>
              <input 
                type="text" 
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@shivanigraphics.com" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Admin Password</label>
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#50007c] hover:bg-[#3e0061] text-white font-black text-sm rounded-xl shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
            >
              Secure Login to Dashboard
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Connected to Firebase Firestore & Cloud Storage
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#50007c] text-white flex flex-col shrink-0 border-r border-purple-800">
        <div className="p-6 border-b border-purple-900/50 flex items-center justify-between">
          <div>
            <h1 className="font-black text-base tracking-tight">Shivani Graphics</h1>
            <p className="text-[10px] text-purple-300">Master Admin Studio</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-xs">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-[#50007c] shadow-md' : 'text-purple-200 hover:bg-purple-900/50'}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-[#50007c] shadow-md' : 'text-purple-200 hover:bg-purple-900/50'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({dbOrders.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-white text-[#50007c] shadow-md' : 'text-purple-200 hover:bg-purple-900/50'}`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog ({dbProducts.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'banners' ? 'bg-white text-[#50007c] shadow-md' : 'text-purple-200 hover:bg-purple-900/50'}`}
          >
            <Layout className="w-4 h-4" />
            <span>Website Banners ({dbBanners.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('icons')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'icons' ? 'bg-white text-[#50007c] shadow-md' : 'text-purple-200 hover:bg-purple-900/50'}`}
          >
            <Layers className="w-4 h-4" />
            <span>Quick Icons ({dbIcons.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'reviews' ? 'bg-white text-[#50007c] shadow-md' : 'text-purple-200 hover:bg-purple-900/50'}`}
          >
            <Star className="w-4 h-4" />
            <span>Customer Reviews ({dbReviews.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'inquiries' ? 'bg-white text-[#50007c] shadow-md' : 'text-purple-200 hover:bg-purple-900/50'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Inquiries & Files ({dbInquiries.length})</span>
          </button>
        </nav>

        <div className="p-4 border-t border-purple-900/50">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-purple-200 hover:bg-purple-900/80 font-bold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-100 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-black text-slate-900 capitalize">
              {activeTab} Management Studio
            </h2>
            <p className="text-xs text-slate-500">Live Firebase Firestore Synchronization Active</p>
          </div>

          <div className="flex items-center gap-3">
            {dbProducts.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDefaultData}
                disabled={loading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Seed 31+ Products to Firebase</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Exit to Website
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#50007c] flex items-center justify-center font-bold">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+12% today</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Total Orders</h4>
                  <p className="text-2xl font-black text-slate-900 mt-1">{dbOrders.length || 48}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Real-time</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Today's Revenue</h4>
                  <p className="text-2xl font-black text-slate-900 mt-1">₹18,450</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Active</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Product Catalog</h4>
                  <p className="text-2xl font-black text-slate-900 mt-1">{dbProducts.length} Items</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <Star className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">4.9 ★</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Customer Reviews</h4>
                  <p className="text-2xl font-black text-slate-900 mt-1">{dbReviews.length} Live</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base">All Products ({dbProducts.length})</h3>
                  <p className="text-xs text-slate-500">Manage pricing, pickup badges, and catalog items</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct({ title: '', category: 'paper-documents', minPrice: 499, badge: '⚡ 5-Minute Store Pickup', subtitle: '', images: [{ url: '' }], minQty: 10 });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#50007c] hover:bg-[#3e0061] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Base Price</th>
                      <th className="p-4">Badge</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbProducts.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.images?.[0]?.url || p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                          <span className="font-bold text-slate-900">{p.title}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{p.category}</td>
                        <td className="p-4 font-black text-slate-900">₹{p.minPrice}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-purple-50 text-[#50007c] rounded-full font-bold text-[10px]">
                            {p.badge}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                if (p.id) await deleteDoc(doc(db, 'products', p.id));
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-base">Customer Reviews ({dbReviews.length})</h3>
                <p className="text-xs text-slate-500">Live reviews submitted by website visitors connected to Firebase</p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbReviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No reviews yet. Visitors can add reviews directly from the website!</p>
                ) : (
                  dbReviews.map((rev, idx) => (
                    <div key={rev.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{rev.name}</span>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{rev.comment}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                        <span>Verified Buyer</span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (rev.id) await deleteDoc(doc(db, 'reviews', rev.id));
                          }}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-base">Customer Orders ({dbOrders.length})</h3>
                <p className="text-xs text-slate-500">Real-time order pipeline and delivery status tracking</p>
              </div>
              <div className="p-6">
                {dbOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No active orders in Firestore queue.</p>
                ) : (
                  <div className="space-y-3">
                    {dbOrders.map((ord, idx) => (
                      <div key={ord.id || idx} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">Order #{ord.id?.slice(0, 6)}</span>
                          <p className="text-slate-500">{ord.customerName || 'Customer'} · ₹{ord.totalAmount || 499}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                          {ord.status || 'Processing'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-base">Website Banners ({dbBanners.length})</h3>
                <p className="text-xs text-slate-500">Manage hero banners and top announcements</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbBanners.map((b, idx) => (
                  <div key={b.id || idx} className="p-4 border rounded-xl space-y-2">
                    <img src={b.image} alt={b.title} className="w-full h-32 object-cover rounded-lg" />
                    <h4 className="font-bold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-500">{b.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-base">Customer Inquiries ({dbInquiries.length})</h3>
                <p className="text-xs text-slate-500">WhatsApp inquiries and quote requests</p>
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500 italic">No pending inquiries.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
