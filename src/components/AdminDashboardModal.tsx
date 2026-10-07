import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, Package, ShoppingBag, MessageSquare, Plus, Trash2, Edit3, Save, CheckCircle, RefreshCw, Image, Layout, Layers } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
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

  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'orders' | 'inquiries'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([
    {
      id: 'banner-1',
      title: 'Visiting Cards & Letterhead Printing',
      subtitle: 'Ready in 5 Minutes · Velvet Touch & Spot UV',
      badge: '⚡ 5-Minute Express Pickup',
      image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'banner-2',
      title: 'Flex Banner, Standees & 3D ACP Sign Boards',
      subtitle: 'Outdoor Advertising · Waterproof Star Flex & Glow Sign',
      badge: '⚡ Same-Day Delhi NCR Delivery',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'banner-3',
      title: 'Scroll Wedding Cards & Shadi Invitations',
      subtitle: 'Royal Velvet Farman Scrolls & Gold Foil Monogram Boxes',
      badge: 'Royal Collection',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState<any | null>(null);

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
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const inquiriesSnap = await getDocs(collection(db, 'inquiries'));
      setInquiries(inquiriesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const bannersSnap = await getDocs(collection(db, 'banners'));
      if (!bannersSnap.empty) {
        setBanners(bannersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
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
      alert('Product updated & saved to Firestore cloud successfully!');
    } catch (e) {
      console.error('Error saving product:', e);
      alert('Failed to save to cloud database.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct || !newProduct.title) return;
    try {
      const id = 'custom-' + Date.now();
      const productObj: ProductItem = {
        id,
        slug: id,
        title: newProduct.title,
        subtitle: newProduct.subtitle || 'Custom Printed Product',
        featureBadge: 'New Arrival',
        category: newProduct.category || 'paper-documents',
        categoryLabel: newProduct.category === 'cards-invitations' ? 'Cards & Invitations' : newProduct.category === 'signage-vinyl' ? 'Signage & Vinyl' : 'Paper & Document Printing',
        shortDescription: newProduct.subtitle || 'High definition custom printing',
        detailedDescription: newProduct.subtitle || 'Professional commercial printing from Mahavir Enclave, Delhi NCR.',
        rating: 5.0,
        reviewCount: 1,
        dispatchTag: '⚡ Express Store Pickup',
        badge: 'New Item',
        images: [
          {
            url: newProduct.imageUrl || 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80',
            alt: newProduct.title,
            caption: newProduct.title
          }
        ],
        specs: [
          { label: 'Turnaround Time', value: 'Express Counter Pickup' }
        ],
        config: {
          sizes: [{ id: 'standard', name: 'Standard Size', priceMultiplier: 1.0 }],
          materials: [{ id: 'standard', name: 'Standard Material', priceMultiplier: 1.0 }],
          finishes: [{ id: 'standard', name: 'Standard Finish', priceMultiplier: 1.0 }],
          sides: [{ id: 'single', name: 'Single Sided', priceMultiplier: 1.0 }],
          quantities: [{ qty: 100, popular: true }]
        }
      };

      const updated = [productObj, ...products];
      onUpdateProducts(updated);
      localStorage.setItem('shivanigraphics_custom_products', JSON.stringify(updated));
      await setDoc(doc(db, 'products', id), productObj);

      setNewProduct(null);
      alert('New product successfully created & saved to Firestore cloud!');
    } catch (e) {
      console.error('Error creating product:', e);
      alert('Failed to create product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const updated = products.filter(p => p.id !== id);
      onUpdateProducts(updated);
      localStorage.setItem('shivanigraphics_custom_products', JSON.stringify(updated));
      await deleteDoc(doc(db, 'products', id));
      alert('Product deleted successfully.');
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };

  const handleSaveBanner = async (b: any) => {
    try {
      const updated = banners.map(item => item.id === b.id ? b : item);
      setBanners(updated);
      await setDoc(doc(db, 'banners', b.id), b);
      setEditingBanner(null);
      alert('Banner updated & saved to Firestore cloud successfully!');
    } catch (e) {
      console.error('Error saving banner:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-[#50007c] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Shivani Graphics Master Control Panel</h2>
              <p className="text-xs text-purple-200">
                {userEmail ? `Admin: ${userEmail}` : 'Full Control over Products, Banners, Images & Cloud Data'}
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
              <h3 className="text-xl font-black text-slate-900">Master Admin Login</h3>
              <p className="text-xs text-slate-500">
                Enter your secure passcode or Firebase admin credentials to manage banners, products, and website images.
              </p>
            </div>

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
                  Access Master Panel
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
                  Sign In ⚡
                </button>
              </form>
            )}

          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* Tabs */}
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'products' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  📦 Products Gallery ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('banners')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'banners' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🖼️ Hero Banners & Images ({banners.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('orders'); fetchCloudData(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'orders' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🛒 Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('inquiries'); fetchCloudData(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'inquiries' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  💬 Inquiries ({inquiries.length})
                </button>
              </div>

              <button
                type="button"
                onClick={fetchCloudData}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              
              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Manage Products Gallery & Images</h3>
                      <p className="text-xs text-slate-500">Add new products, edit image URLs, or update prices instantly.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewProduct({ title: '', subtitle: '', category: 'paper-documents', imageUrl: '' })}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {products.map((p) => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-3.5">
                          <img src={p.images[0]?.url} alt={p.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{p.title}</h4>
                            <p className="text-[11px] text-slate-500">{p.categoryLabel} · {p.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Banners Tab */}
              {activeTab === 'banners' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Manage Homepage Hero Banners & Images</h3>
                      <p className="text-xs text-slate-500">Change top banner titles, subtitles, and background image URLs.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {banners.map((b) => (
                      <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <img src={b.image} alt={b.title} className="w-24 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-black rounded-md">{b.badge}</span>
                            <h4 className="text-xs font-black text-slate-900">{b.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{b.subtitle}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingBanner(b)}
                          className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Banner & Image</span>
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
                      No cloud orders found yet.
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
                <label className="font-bold text-slate-700 block mb-1">Product Image URL</label>
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {newProduct && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateProduct} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Add New Product to Gallery</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g. Custom Corporate Diary"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={newProduct.subtitle}
                  onChange={(e) => setNewProduct({ ...newProduct, subtitle: e.target.value })}
                  placeholder="e.g. Hardcover 200 Pages"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                >
                  <option value="paper-documents">Paper & Documents</option>
                  <option value="cards-invitations">Cards & Invitations</option>
                  <option value="custom-promotional">Custom & Promotional</option>
                  <option value="signage-vinyl">Signage & Vinyl</option>
                  <option value="finishing-binding">Finishing & Binding</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setNewProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl cursor-pointer shadow-md"
              >
                Create Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Edit Hero Banner</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Banner Title</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Banner Subtitle</label>
                <input
                  type="text"
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={editingBanner.badge}
                  onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Banner Background Image URL</label>
                <input
                  type="text"
                  value={editingBanner.image}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveBanner(editingBanner)}
                className="px-5 py-2 bg-[#50007c] hover:bg-purple-900 text-white font-black rounded-xl cursor-pointer shadow-md"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
