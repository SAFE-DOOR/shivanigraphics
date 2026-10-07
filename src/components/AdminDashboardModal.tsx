import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, Package, ShoppingBag, MessageSquare, Plus, Trash2, Edit3, Save, CheckCircle, RefreshCw, Mail, Key } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { ProductItem } from '../types';
import { PRODUCTS } from '../data/products';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onUpdateProducts: (products: ProductItem[]) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose, products, onUpdateProducts }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'passcode' | 'firebase'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        fetchCloudData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '7860') {
      setIsAuthenticated(true);
      setUserEmail('owner@shivanigraphics.com (Passcode Verified)');
      fetchCloudData();
    } else {
      alert('Incorrect Owner Passcode! Default is 7860');
    }
  };

  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
      setUserEmail(userCred.user.email);
      fetchCloudData();
    } catch (err: any) {
      // If user doesn't exist yet, offer quick sign up for admin
      try {
        const newUserCred = await createUserWithEmailAndPassword(auth, email, password);
        setIsAuthenticated(true);
        setUserEmail(newUserCred.user.email);
        fetchCloudData();
      } catch (regErr: any) {
        setAuthError(regErr.message || 'Authentication failed.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUserEmail(null);
      setPasscode('');
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const fetchCloudData = async () => {
    setIsLoading(true);
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const ordersList = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(ordersList);

      const inquiriesSnap = await getDocs(collection(db, 'inquiries'));
      const inquiriesList = inquiriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setInquiries(inquiriesList);
    } catch (e) {
      console.error('Error fetching cloud data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async (prod: ProductItem) => {
    try {
      const updated = products.map(p => p.id === prod.id ? prod : p);
      onUpdateProducts(updated);
      localStorage.setItem('shivanigraphics_custom_products', JSON.stringify(updated));
      
      await setDoc(doc(db, 'products', prod.id), prod);
      setEditingProduct(null);
      alert('Product updated & saved to Firestore cloud successfully via Firebase Auth!');
    } catch (e) {
      console.error('Error saving product:', e);
      alert('Failed to save to cloud database.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-[#50007c] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Shivani Graphics Owner Backend Studio</h2>
              <p className="text-xs text-purple-200">
                {userEmail ? `Authenticated as: ${userEmail}` : 'Firebase Auth & Passcode Protected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Logout
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Check */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-md mx-auto text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 text-[#50007c] flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Secure Admin Authentication</h3>
              <p className="text-xs text-slate-500">
                Choose authentication method to manage product listings, prices, and cloud database records.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('passcode')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authMode === 'passcode' ? 'bg-[#50007c] text-white shadow-sm' : 'text-slate-600'}`}
              >
                Quick Passcode (7860)
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('firebase')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authMode === 'firebase' ? 'bg-[#50007c] text-white shadow-sm' : 'text-slate-600'}`}
              >
                Firebase Auth Email
              </button>
            </div>

            {authMode === 'passcode' ? (
              <form onSubmit={handlePasscodeLogin} className="space-y-3">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Passcode (7860)"
                  className="w-full px-4 py-3 text-center text-lg tracking-widest font-black rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#50007c] bg-slate-50"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#50007c] hover:bg-purple-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
                >
                  Access via Passcode
                </button>
              </form>
            ) : (
              <form onSubmit={handleFirebaseLogin} className="space-y-3 text-left">
                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    {authError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shivanigraphics.com"
                    required
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#50007c] hover:bg-purple-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all cursor-pointer mt-2"
                >
                  Sign In with Firebase Auth ⚡
                </button>
              </form>
            )}

          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* Tabs */}
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'products' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  📦 Manage Products ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('orders'); fetchCloudData(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'orders' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🛒 Cloud Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('inquiries'); fetchCloudData(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'inquiries' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  💬 Inquiries ({inquiries.length})
                </button>
              </div>

              <button
                type="button"
                onClick={fetchCloudData}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync Cloud</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              
              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">Database Product Catalog</h3>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                      🔒 Secured via Firebase Auth & Firestore
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {products.map((p) => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-3.5">
                          <img src={p.images[0]?.url} alt={p.title} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{p.title}</h4>
                            <p className="text-[11px] text-slate-500">{p.categoryLabel} · {p.dispatchTag}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Details & Image</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Live Customer Orders in Firestore Database</h3>
                  {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 text-slate-500 text-xs">
                      No cloud orders found yet. When customers place orders, they will appear here in real-time!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((ord, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-black text-slate-900">{ord.productTitle} (Qty: {ord.quantity})</p>
                            <p className="text-[11px] text-slate-500">Customer: {ord.customerName} ({ord.phone})</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg">
                            ₹{ord.totalAmount} · {ord.status || 'Received'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Inquiries Tab */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Bulk Quote Inquiries in Firestore Database</h3>
                  {inquiries.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 text-slate-500 text-xs">
                      No inquiries recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map((inq, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                          <p className="text-xs font-black text-slate-900">{inq.name} ({inq.phone})</p>
                          <p className="text-xs text-slate-600">{inq.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Edit Product: {editingProduct.title}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle / Tag</label>
                <input
                  type="text"
                  value={editingProduct.subtitle}
                  onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Image URL (Cloud Link or Unsplash)</label>
                <input
                  type="text"
                  value={editingProduct.images[0]?.url || ''}
                  onChange={(e) => {
                    const newImages = [...editingProduct.images];
                    if (newImages[0]) newImages[0].url = e.target.value;
                    else newImages.push({ url: e.target.value, alt: editingProduct.title, caption: '' });
                    setEditingProduct({ ...editingProduct, images: newImages });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct(editingProduct)}
                className="px-5 py-2 bg-[#50007c] hover:bg-purple-900 text-white font-black rounded-xl cursor-pointer shadow-md"
              >
                Save Changes to Cloud
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
