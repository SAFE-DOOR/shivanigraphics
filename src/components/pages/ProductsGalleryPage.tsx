import React, { useState } from 'react';
import { ArrowLeft, Search, ShoppingBag, MessageCircle, Star, Filter, Sparkles } from 'lucide-react';
import { ProductItem } from '../../types';
import { CATEGORIES } from '../../data/products';
import { WHATSAPP_PRIMARY } from '../../utils/whatsapp';

interface ProductsGalleryPageProps {
  products: ProductItem[];
  onBackToHome: () => void;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem, qty: number) => void;
}

export const ProductsGalleryPage: React.FC<ProductsGalleryPageProps> = ({
  products,
  onBackToHome,
  onSelectProduct,
  onAddToCart
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filtered = products.filter(p => {
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
                          p.categoryLabel.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleQuickWhatsApp = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Hello Shivani Graphics! I am looking at your Products Gallery and want to order "${product.title}" in Delhi NCR. Please share price quotes and digital proof.`
    );
    window.open(`https://wa.me/${WHATSAPP_PRIMARY}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          ✨ Dedicated Products Gallery ({filtered.length} Items)
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-[#50007c] rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
        <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider">
          Shivani Graphics Catalog
        </span>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Complete Print & Signage Products Gallery
        </h1>
        <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
          Explore our entire collection of commercial printing, visiting cards, flex banners, wedding scrolls, stamps, and custom promotional merchandise.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or category..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium rounded-2xl border border-slate-200 focus:outline-none focus:border-[#50007c] focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === 'all' ? 'bg-[#50007c] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Products
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  selectedCat === cat.id ? 'bg-[#50007c] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <p className="text-sm font-black text-slate-800">No print products found matching your search.</p>
          <button
            type="button"
            onClick={() => { setSearch(''); setSelectedCat('all'); }}
            className="px-4 py-2 bg-[#50007c] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden cursor-pointer hover:shadow-xl hover:border-[#50007c]/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={p.images[0]?.url}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {p.featureBadge && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-orange-600 text-white text-[10px] font-black rounded-md shadow-xs">
                      {p.featureBadge}
                    </span>
                  )}
                  {p.badge && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-purple-900 text-white text-[10px] font-bold rounded-md shadow-xs">
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {p.categoryLabel}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-[#50007c] line-clamp-1">
                    {p.title}
                  </h3>
                  {p.subtitle && (
                    <p className="text-[11px] text-orange-600 font-medium line-clamp-1">
                      {p.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                  {p.dispatchTag || '⚡ Express Ready'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleQuickWhatsApp(p, e)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                    title="Quick WhatsApp Order"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black text-[#50007c] group-hover:translate-x-0.5 transition-transform">
                    View →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
