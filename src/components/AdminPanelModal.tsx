import React, { useState } from 'react';
import { X, Save, RotateCcw, Image, FileText, CheckCircle2, Lock, Unlock, Settings, Trash2 } from 'lucide-react';
import { ProductItem } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onUpdateProducts: (updated: ProductItem[]) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default owner PIN
    if (passcode === '7860' || passcode === '1234' || passcode === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect passcode! Try PIN: 7860 or 1234');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedList = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    onUpdateProducts(updatedList);
    
    // Save to localStorage
    localStorage.setItem('shivanigraphics_custom_products', JSON.stringify(updatedList));

    setSuccessMessage(`Successfully updated "${editingProduct.title}"!`);
    setEditingProduct(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center font-black text-white shadow-md">
              SG
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Shivani Graphics Owner Admin Panel
              </h2>
              <p className="text-xs text-purple-200">
                Manage product images, descriptions, and storefront banners instantly
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-8 sm:p-16 flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 text-[#50007c] flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Store Owner Authentication</h3>
              <p className="text-xs text-slate-500">
                Enter your 4-digit owner passcode to access product and image management. (Hint: Try <strong className="text-[#50007c]">7860</strong>)
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Passcode (e.g. 7860)"
                maxLength={10}
                className="w-full px-4 py-3 text-center text-lg font-black tracking-widest rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-[#50007c] bg-slate-50"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3.5 bg-[#50007c] hover:bg-purple-900 text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                Access Admin Dashboard 🔓
              </button>
            </form>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2 shrink-0 flex flex-row md:flex-col justify-between">
              <div className="space-y-1 w-full flex md:flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'products' ? 'bg-[#50007c] text-white shadow-md' : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Products & Images ({products.length})</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 hidden md:block pt-4 border-t border-slate-200">
                Shivani Graphics CMS v2.4 · Mahavir Enclave, New Delhi
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50">
              
              {successMessage && (
                <div className="p-4 bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-4">
                  
                  {/* Search Bar */}
                  <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products by title or department..."
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent focus:outline-none font-medium text-slate-800"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap font-bold">
                      {filteredProducts.length} items
                    </span>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((p) => (
                      <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                          <img
                            src={p.images[0]?.url}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                            {p.categoryLabel}
                          </span>
                        </div>

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1">
                              {p.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {p.shortDescription}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                              {p.dispatchTag}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingProduct(p)}
                              className="px-3 py-1.5 bg-[#50007c] hover:bg-purple-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                            >
                              Edit Image & Details ✏️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* Edit Product Modal / Drawer */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Edit Product Details & Image URL
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Product Title:</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Subtitle / Tagline:</label>
                  <input
                    type="text"
                    value={editingProduct.subtitle || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Product Image URL (Unsplash or Direct Image Link):</label>
                  <input
                    type="url"
                    value={editingProduct.images[0]?.url || ''}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        images: [{ ...editingProduct.images[0], url: newUrl }]
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white font-mono text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-500">
                    Tip: Paste any high-resolution image URL or Unsplash link to instantly update the product photo.
                  </p>
                </div>

                {editingProduct.images[0]?.url && (
                  <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-slate-300 bg-slate-100">
                    <img src={editingProduct.images[0].url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Short Description:</label>
                  <textarea
                    rows={3}
                    value={editingProduct.shortDescription}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white resize-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#50007c] hover:bg-purple-900 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
