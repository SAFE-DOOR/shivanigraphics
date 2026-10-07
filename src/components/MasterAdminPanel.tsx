import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Lock, Package, Layout, Layers, MessageSquare, 
  Plus, Trash2, Edit3, Save, CheckCircle, RefreshCw, Image, Upload, Eye, AlertCircle 
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { ProductItem } from '../types';
import { uploadProductImage, deleteProductImage } from '../utils/firebaseStorage';

interface MasterAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onUpdateProducts: (products: ProductItem[]) => void;
}

export const MasterAdminPanel: React.FC<MasterAdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  products, 
  onUpdateProducts 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'passcode' | 'firebase'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'quick_icons' | 'inquiries'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([
    {
      id: 'banner-1',
      title: 'Visiting Cards & Letterhead Printing',
      subtitle: 'Ready in 5 Minutes · Velvet Touch & Spot UV',
      badge: '⚡ 5-Minute Store Pickup',
      image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80',
      isActive: true
    },
    {
      id: 'banner-2',
      title: 'Flex Banner, Standees & 3D ACP Sign Boards',
      subtitle: 'Outdoor Advertising · Waterproof Star Flex & Glow Sign',
      badge: '⚡ Same-Day Delhi NCR Delivery',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
      isActive: true
    }
  ]);
  const [quickIcons, setQuickIcons] = useState<any[]>([
    { id: 'icon-1', label: 'Visiting Cards', imageURL: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=200&q=80' },
    { id: 'icon-2', label: 'Flex Banners', imageURL: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=200&q=80' },
    { id: 'icon-3', label: 'Wedding Scrolls', imageURL: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&q=80' },
    { id: 'icon-4', label: 'Spiral Binding', imageURL: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState<any | null>(null);

  const ADMIN_WHITELIST = ['raimanish200822@gmail.com', 'admin@shivanigraphics.com'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        if (ADMIN_WHITELIST.includes(user.email.toLowerCase()) || user.email.includes('admin')) {
          setIsAuthenticated(true);
          setUserEmail(user.email);
          fetchAllCloudData();
        } else {
          setAuthError('Access denied: Unauthorized email.');
          signOut(auth);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '7860') {
      setIsAuthenticated(true);
      setUserEmail('raimanish200822@gmail.com (Master Passcode)');
      fetchAllCloudData();
    } else {
      alert('Incorrect Master Passcode! Default is 7860');
    }
  };

  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (userCred.user.email) {
        setIsAuthenticated(true);
        setUserEmail(userCred.user.email);
        fetchAllCloudData();
      }
    } catch (err: any) {
      try {
        const newUserCred = await createUserWithEmailAndPassword(auth, email, password);
        setIsAuthenticated(true);
        setUserEmail(newUserCred.user.email);
        fetchAllCloudData();
      } catch (regErr: any) {
        setAuthError(regErr.message || 'Authentication failed.');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  const fetchAllCloudData = async () => {
    setIsLoading(true);
    try {
      const inquiriesSnap = await getDocs(collection(db, 'inquiries'));
      setInquiries(inquiriesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const bannersSnap = await getDocs(collection(db, 'banners'));
      if (!bannersSnap.empty) {
        setBanners(bannersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      const iconsSnap = await getDocs(collection(db, 'quick_icons'));
      if (!iconsSnap.empty) {
        setQuickIcons(iconsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      console.error('Error fetching cloud data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Upload Handler for Product / Banners
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file, 'shivanigraphics_uploads');
      callback(url);
      alert('Image uploaded successfully to Firebase Storage!');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (prod: ProductItem) => {
    try {
      const updated = products.map(p => p.id === prod.id ? prod : p);
      onUpdateProducts(updated);
      await setDoc(doc(db, 'products', prod.id), prod);
      setEditingProduct(null);
      alert('Product updated successfully in Firestore cloud!');
    } catch (e) {
      console.error('Error saving product:', e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const updated = products.filter(p => p.id !== id);
      onUpdateProducts(updated);
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
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-[#50007c] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Shivani Graphics Master Admin Studio</h2>
              <p className="text-xs text-purple-200">
                {userEmail ? `Connected as: ${userEmail}` : 'Full Control over Banners, Products & Images'}
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
            <h3 className="text-xl font-black text-slate-900">Master Admin Authentication</h3>
            
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('passcode')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authMode === 'passcode' ? 'bg-[#50007c] text-white shadow-sm' : 'text-slate-600'}`}
              >
                Master PIN (7860)
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
                  Access Master Panel ⚡
                </button>
              </form>
            ) : (
              <form onSubmit={handleFirebaseLogin} className="space-y-3 text-left">
                {authError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{authError}</div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 mt-1"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#50007c] hover:bg-purple-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all cursor-pointer mt-2"
                >
                  Sign In with Firebase Auth
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
                  📦 Products Catalog ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('banners')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'banners' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🖼️ Hero Banners ({banners.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quick_icons')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'quick_icons' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ⭐ Quick Icons
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('inquiries'); fetchAllCloudData(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'inquiries' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  💬 Inquiries ({inquiries.length})
                </button>
              </div>

              <button
                type="button"
                onClick={fetchAllCloudData}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
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
                    <h3 className="text-sm font-black text-slate-900">Manage Product Gallery & Images</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {products.map((p) => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-3.5">
                          <img src={p.images[0]?.url} alt={p.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{p.title}</h4>
                            <p className="text-[11px] text-slate-500">{p.categoryLabel} · {p.dispatchTag}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Product & Images</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
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
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Manage 6 Homepage Hero Banners</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {banners.map((b) => (
                      <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
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

              {/* Quick Icons Tab */}
              {activeTab === 'quick_icons' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Quick Access Circular Icons</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {quickIcons.map((icon) => (
                      <div key={icon.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
                        <img src={icon.imageURL} alt={icon.label} className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-purple-200 shadow-sm" />
                        <p className="text-xs font-bold text-slate-900">{icon.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inquiries Tab */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Customer Inquiries & WhatsApp Logs</h3>
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

      {/* Edit Product Modal with Firebase Storage Image Uploader */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900">Edit Product & Images</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingProduct.subtitle || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL (or upload below)</label>
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

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                <label className="font-black text-purple-900 block flex items-center gap-1.5">
                  <Upload className="w-4 h-4" /> Upload Image to Firebase Storage
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, (url) => {
                    const newImages = [...editingProduct.images];
                    if (newImages[0]) newImages[0].url = url;
                    else newImages.push({ url, alt: editingProduct.title, caption: '' });
                    setEditingProduct({ ...editingProduct, images: newImages });
                  })}
                  className="text-xs"
                />
                {uploadingImage && <p className="text-amber-600 font-bold">Uploading to Firebase Storage...</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct(editingProduct)}
                className="px-5 py-2 bg-[#50007c] text-white font-black rounded-xl cursor-pointer shadow-md"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Edit Hero Banner</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingBanner.image}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                <label className="font-black text-purple-900 block flex items-center gap-1.5">
                  <Upload className="w-4 h-4" /> Upload Banner Image to Firebase Storage
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, (url) => {
                    setEditingBanner({ ...editingBanner, image: url });
                  })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveBanner(editingBanner)}
                className="px-5 py-2 bg-[#50007c] text-white font-black rounded-xl cursor-pointer shadow-md"
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
