import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  ShieldCheck, 
  FileCheck, 
  Sparkles, 
  CheckCircle2, 
  Truck, 
  MessageCircle, 
  Mail, 
  ShoppingBag,
  Sliders,
  Share2,
  ThumbsUp
} from 'lucide-react';
import { ProductItem, CartItem } from '../types';
import { ProductGallery } from './ProductGallery';
import { ProductConfigurator } from './ProductConfigurator';
import { WHATSAPP_PRIMARY, SUPPORT_EMAIL } from '../utils/whatsapp';
import { addRecentlyViewedId } from '../utils/recentlyViewed';

interface ProductDetailPageProps {
  product: ProductItem;
  allProducts: ProductItem[];
  onBack: () => void;
  onSelectProduct: (p: ProductItem) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenArtworkGuide: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onAddToCart,
  onOpenArtworkGuide
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'artwork' | 'reviews'>('specs');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (product?.id) {
      addRecentlyViewedId(product.id);
    }
  }, [product?.id]);

  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const sampleReviews = [
    {
      name: 'Rohan Sharma',
      city: 'Dwarka, New Delhi',
      rating: 5,
      date: '3 days ago',
      comment: 'Ordered 500 visiting cards with velvet matte and spot UV. The quality is truly exceptional! Received in just 4 hours via bike courier in Delhi.'
    },
    {
      name: 'Pooja Verma',
      city: 'Noida Sector 62',
      rating: 5,
      date: '1 week ago',
      comment: 'Ordered team polo t-shirts with embroidered company logo. The fabric is pure heavy cotton and embroidery is pin sharp. 100% recommended!'
    },
    {
      name: 'Amitabh Sen',
      city: 'Cyber City, Gurgaon',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Direct WhatsApp ordering is so convenient. No sign up needed, proof was approved within 15 minutes, GST invoice sent on email.'
    },
    {
      name: 'Dr. Neha Malik',
      city: 'Palam, New Delhi',
      rating: 5,
      date: '3 weeks ago',
      comment: 'Self-inking rubber stamp was ready in under an hour. Clean impression with blue banking ink. Very polite staff at Mahavir Enclave store.'
    }
  ];

  return (
    <div className="py-6 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Navigation Bar & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 ml-2">
              <span className="cursor-pointer hover:text-purple-900" onClick={onBack}>Home</span>
              <span>/</span>
              <span className="font-medium text-slate-700">{product.categoryLabel}</span>
              <span>/</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">{product.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Product Configurator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: High-Res Multi-Image Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <ProductGallery product={product} />
          </div>

          {/* Right Column: Customizer Card */}
          <div className="lg:col-span-6">
            <ProductConfigurator
              product={product}
              onAddToCart={onAddToCart}
              onOpenArtworkGuide={onOpenArtworkGuide}
            />
          </div>

        </div>

        {/* Detailed Tabs: Specifications, Artwork File Guide, Customer Reviews */}
        <div className="pt-8 border-t border-slate-200">
          
          {/* Tab Buttons */}
          <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'specs'
                  ? 'border-[#50007c] text-[#50007c]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Product Specifications
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('artwork')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'artwork'
                  ? 'border-[#50007c] text-[#50007c]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Artwork Preparation
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-[#50007c] text-[#50007c]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Verified Reviews</span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full">
                4.9 ★
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            
            {/* Tab 1: Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  {product.detailedDescription}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {product.specs.map((s, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                      <span className="font-semibold text-slate-900 mt-0.5">{s.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center gap-3 text-xs text-[#50007c] font-medium">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span>
                    100% Quality & Fogra-39 Color Matching Guarantee. Every order undergoes double manual quality check before packing.
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Artwork Guide */}
            {activeTab === 'artwork' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <p className="font-bold text-slate-900">Supported Formats</p>
                    <p className="text-xs text-slate-600">Vector PDF, CorelDRAW (CDR), Adobe Illustrator (AI), Photoshop (PSD), TIFF, High-Res JPG.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <p className="font-bold text-slate-900">Bleed & Margins</p>
                    <p className="text-xs text-slate-600">Add 3mm bleed margin on all four sides. Keep critical text and logos at least 4mm inside the trim line.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <p className="font-bold text-slate-900">Resolution & Colors</p>
                    <p className="text-xs text-slate-600">Convert RGB to CMYK. All raster graphics must be 300 DPI at actual print scale.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <p className="font-bold text-slate-900">Convert Fonts to Curves</p>
                    <p className="text-xs text-slate-600">Press Ctrl+Q in CorelDRAW or Ctrl+Shift+O in Illustrator before exporting your file.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-emerald-900">
                    Need our prepress designers to review or create your design?
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent(`Hello Shivani Graphics! Please help me with design proofing for: ${product.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg whitespace-nowrap"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Tab 3: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sampleReviews.map((rev, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {[...Array(rev.rating)].map((_, idx) => (
                            <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                      <p className="text-slate-700 italic leading-relaxed">"{rev.comment}"</p>
                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-900">{rev.name}</span>
                        <span>{rev.city}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Related Products Recommendation */}
        <div className="pt-8 border-t border-slate-200 space-y-4 pb-12 sm:pb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Customers Also Ordered
            </h3>
            <button 
              type="button" 
              onClick={onBack}
              className="text-xs font-bold text-[#50007c] hover:underline cursor-pointer"
            >
              View Full Catalog →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectProduct(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-[#50007c]/40 transition-all group flex flex-col justify-between"
              >
                <div className="aspect-square bg-slate-100 overflow-hidden relative">
                  <img
                    src={item.images[0].url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.badge && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded-xs shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#50007c]">{item.title}</p>
                  <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ⚡ Get Free Quote
                  </span>
                  <p className="text-[10px] text-slate-400 truncate">{item.dispatchTag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
