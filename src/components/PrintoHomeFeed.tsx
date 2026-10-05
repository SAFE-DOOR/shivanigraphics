import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  BookOpen, 
  Shirt, 
  Gift, 
  Package, 
  Sparkles, 
  Coffee, 
  ArrowRight, 
  Plus, 
  Minus,
  CheckCircle2,
  Star,
  MessageCircle,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Megaphone,
  Heart,
  Camera,
  Layers,
  Printer,
  History,
  FileText,
  Stamp,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductItem } from '../types';
import { WHATSAPP_PRIMARY } from '../utils/whatsapp';
import { getRecentlyViewedIds, addRecentlyViewedId } from '../utils/recentlyViewed';
import { CATEGORIES } from '../data/products';

interface PrintoHomeFeedProps {
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onSelectCategory?: (categoryId: string) => void;
  onOpenBulkModal: () => void;
  onOpenStoreModal?: () => void;
  onOpenArtworkGuide?: () => void;
}

export const PrintoHomeFeed: React.FC<PrintoHomeFeedProps> = ({
  products,
  onSelectProduct,
  onSelectCategory,
  onOpenBulkModal
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => getRecentlyViewedIds());

  // Keep recently viewed in sync with localStorage and custom window events
  useEffect(() => {
    const handleUpdate = () => {
      setRecentlyViewedIds(getRecentlyViewedIds());
    };
    window.addEventListener('recently-viewed-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('recently-viewed-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getProduct = (id: string) => products.find(p => p.id === id) || products[0];

  const handleProductClick = (productId: string) => {
    addRecentlyViewedId(productId);
    const item = getProduct(productId);
    onSelectProduct(item);
  };

  const handleCategoryNavigate = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  // Flagship Hero Promo Banners
  const heroBanners = [
    {
      id: 'visiting-cards-hero',
      productId: 'visiting-cards-premium',
      categoryId: 'paper-documents',
      title: 'Visiting Cards & Corporate Stationery',
      featureTag: 'Executive Visiting Cards · Ready in 5 Minutes',
      subtitle: 'Premium 350 GSM Art Board with Velvet Touch, Gold Foil & Raised Spot UV, plus Bond Letterheads',
      badge: '⚡ 5-Minute Store Pickup',
      minQty: 'Min. Qty: 100 cards',
      image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80',
      gradient: 'from-black/90 via-black/60 to-black/35',
      ctaText: 'Explore Visiting Cards'
    },
    {
      id: 'flex-banner-hero',
      productId: 'flex-printing-banner-boards',
      categoryId: 'signage-vinyl',
      title: 'Outdoor Flex Banners & 3D Sign Boards',
      featureTag: 'Heavy 340 GSM Star Flex & Backlit ACP Glow Signs',
      subtitle: 'Heavy-duty Star Flex with folded hemmed borders, brass eyelets & 3D acrylic LED boards',
      badge: '⚡ 2-Hour Express Printing',
      minQty: 'Min. Qty: 1 Board',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
      gradient: 'from-black/90 via-black/60 to-black/35',
      ctaText: 'Explore Outdoor Signage'
    },
    {
      id: 'notebooks-envelopes-hero',
      productId: 'custom-notebooks-spiral',
      categoryId: 'paper-documents',
      title: 'Custom Spiral Notebooks & Envelopes',
      featureTag: 'Corporate Diaries, Spiral Notebooks & Office Envelopes',
      subtitle: 'Hardcover journals, wire-o metal spiral binding, peel & seal envelopes, and GST bill books',
      badge: '⚡ 24-Hour Express Dispatch',
      minQty: 'Min. Qty: 25 books',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      gradient: 'from-black/90 via-black/60 to-black/35',
      ctaText: 'Explore Custom Notebooks'
    },
    {
      id: 'promotional-hero',
      productId: 'mug-print-services',
      categoryId: 'custom-promotional',
      title: 'Custom Merch, Photo Mugs & T-Shirts',
      featureTag: 'Panoramic Ceramic Mugs & DTF Cotton T-Shirts',
      subtitle: 'Sublimation ceramic coffee mugs ready in 10 minutes, bio-washed cotton tees, and rubber stamps',
      badge: '⚡ 10-Minute Express Pickup',
      minQty: 'Min. Qty: 1 piece',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      gradient: 'from-black/90 via-black/60 to-black/35',
      ctaText: 'Explore Mugs & Merch'
    }
  ];

  // Auto-playing seamless timer for Hero
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, heroBanners.length]);

  const activeHero = heroBanners[bannerIndex];

  const handleQuickWhatsApp = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Hello Shivani Graphics! I want to order "${product.title}" in Delhi NCR. Could you share price quotes and digital proof mockup?`
    );
    window.open(`https://wa.me/${WHATSAPP_PRIMARY}?text=${text}`, '_blank');
  };

  // Resolve the 4 Recently Viewed Products from localStorage
  const recentlyViewedProducts = recentlyViewedIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is ProductItem => Boolean(p))
    .slice(0, 4);

  // Products for the "⚡ 5-Minute Instant Express Counter"
  const express5MinProductIds = [
    'visiting-cards-premium',
    'passport-size-photos',
    'photo-frame-with-photo',
    'stamps-rubber-pads',
    'mug-print-services',
    'pvc-aadhaar-smart-card'
  ];
  const express5MinProducts = express5MinProductIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is ProductItem => Boolean(p));

  // The 5 Core Categories with rich portal metadata
  const officialCategoryPortals = [
    {
      id: 'paper-documents',
      title: 'Paper & Document Printing',
      subtitle: 'Envelopes, Notebooks, Visiting Cards, Bill Books, Brochures, Catalogues & Certificates',
      itemCount: products.filter(p => p.category === 'paper-documents').length,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      badge: 'Corporate Essentials',
      tagColor: 'bg-purple-100 text-[#50007c]'
    },
    {
      id: 'cards-invitations',
      title: 'Cards & Invitations',
      subtitle: 'Scroll Wedding Cards, Sticker Invitations, Traditional Shadi Cards & Kundli Bio-Data',
      itemCount: products.filter(p => p.category === 'cards-invitations').length,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      badge: 'Royal Invitations',
      tagColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'custom-promotional',
      title: 'Custom & Promotional Printing',
      subtitle: 'Mug Printing, T-Shirts, Self-Inking Rubber Stamps, Cushions, Keychains & Passport Photos',
      itemCount: products.filter(p => p.category === 'custom-promotional').length,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      badge: 'Personalised & Fast',
      tagColor: 'bg-pink-100 text-pink-800'
    },
    {
      id: 'signage-vinyl',
      title: 'Signage & Large Format / Vinyl Work',
      subtitle: 'Flex Printing, Banner Boards, Plotter Sticker Cutting, 3D Acrylic ACP Sign Boards & Standees',
      itemCount: products.filter(p => p.category === 'signage-vinyl').length,
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
      badge: 'Outdoor Advertising',
      tagColor: 'bg-amber-100 text-amber-900'
    },
    {
      id: 'finishing-binding',
      title: 'Finishing & Binding Services',
      subtitle: 'Spiral & Wiro Binding, Lamination, Creasing, Die Pouching, PVC Smart Cards & 13x40 Prints',
      itemCount: products.filter(p => p.category === 'finishing-binding').length,
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
      badge: 'Post-Press Finishing',
      tagColor: 'bg-teal-100 text-teal-800'
    }
  ];

  const faqs = [
    {
      q: 'What printing services does Shivani Graphics offer?',
      a: 'We offer five core commercial printing verticals: 1) Paper & Document Printing (Document Envelopes, Spiral Notebooks, Visiting Cards, Letterheads, Bill Books, Brochures, Catalogues, Certificates); 2) Cards & Invitations (Royal Scroll Wedding Cards, Sticker Invitations, Shadi Cards, Kundli); 3) Custom & Promotional Printing (Mug Printing, T-Shirts, Self-Inking Rubber Stamps, Cushions, Keychains, Passport Photos); 4) Signage & Large Format / Vinyl Work (Flex Banners, Flex Boards, Plotter Vinyl Cutting, 3D Acrylic ACP Boards, Standees); 5) Finishing & Binding Services (Spiral & Hard Thesis Binding, Lamination, Creasing, Die Pouching, PVC Smart Cards, 13x40 Panoramic Prints).'
    },
    {
      q: 'Which products are ready in 5 minutes at the store counter?',
      a: 'Executive Visiting Cards, 50 Passport Size Photos, Photo Frames with Photo Prints, PVC Smart Cards, Self-Inking Rubber Stamps, and Document Pouch Lamination are completed in 5-15 minutes at our Mahavir Enclave, New Delhi counter.'
    },
    {
      q: 'How can I order and customize through WhatsApp & Email?',
      a: 'Click "Order via WhatsApp" or send your artwork/specifications directly to shivanidigitalprints@gmail.com / WhatsApp (+91-9810157695). Our prepress team shares digital mockups for confirmation before printing.'
    },
    {
      q: 'Do you offer GST Invoices for corporate accounts?',
      a: 'Yes, we provide 18% GST tax invoices with Input Tax Credit (ITC) for business purchases, complete with proper HSN codes and corporate billing challans.'
    },
    {
      q: 'Can I order single-piece prints for personal gifting?',
      a: 'Yes! Our digital presses allow you to print as few as 1 custom T-shirt, 1 photo mug, 1 photo frame, 1 rubber stamp, or 100 visiting cards.'
    },
    {
      q: 'Does Shivani Graphics deliver across Delhi NCR & Pan-India?',
      a: 'Yes, we provide same-day bike courier delivery across Delhi NCR and ship nationwide through Blue Dart and DTDC couriers with live tracking shared on WhatsApp.'
    }
  ];

  // Top Quick Commercial Products & Categories Strip (Above the Hero Banner with Real High-Res Photos)
  const quickProductNavItems = [
    {
      id: 'visiting-cards',
      label: 'Visiting Cards',
      categoryId: 'paper-documents',
      productId: 'visiting-cards-premium',
      imageUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=300&q=80',
      badge: '5 Mins'
    },
    {
      id: 'flex-banners',
      label: 'Flex Banners',
      categoryId: 'signage-vinyl',
      productId: 'flex-printing-banner-boards',
      imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=300&q=80',
      badge: 'Star Flex'
    },
    {
      id: 'wedding-cards',
      label: 'Wedding Cards',
      categoryId: 'cards-invitations',
      productId: 'scroll-wedding-cards',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80',
      badge: 'Royal Farman'
    },
    {
      id: 'notebooks',
      label: 'Notebooks',
      categoryId: 'paper-documents',
      productId: 'custom-notebooks-spiral',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
      badge: 'Spiral'
    },
    {
      id: 'photo-mugs',
      label: 'Photo Mugs',
      categoryId: 'custom-promotional',
      productId: 'mug-print-services',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
      badge: '10 Mins'
    },
    {
      id: 'tshirts',
      label: 'T-Shirts',
      categoryId: 'custom-promotional',
      productId: 'tshirt-printing-custom',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
      badge: 'Cotton DTF'
    },
    {
      id: 'stamps',
      label: 'Rubber Stamps',
      categoryId: 'custom-promotional',
      productId: 'stamps-rubber-pads',
      imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=300&q=80',
      badge: 'Self-Inking'
    },
    {
      id: 'acrylic-signs',
      label: '3D Sign Boards',
      categoryId: 'signage-vinyl',
      productId: 'acrylic-branch-sign-boards',
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=300&q=80',
      badge: '3D LED'
    },
    {
      id: 'envelopes',
      label: 'Envelopes',
      categoryId: 'paper-documents',
      productId: 'document-envelopes',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
      badge: 'Peel & Seal'
    },
    {
      id: 'all-products',
      label: 'All 24 Products',
      categoryId: 'all',
      productId: '',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80',
      badge: '24+ Items',
      isAll: true
    }
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 sm:pb-20">
      
      {/* 1. Featured Commercial Products Quick Navigation Strip (Above the Hero Banner with Real Photos) */}
      <section className="px-4 sm:px-6 pt-2 max-w-7xl mx-auto">
        <div className="flex md:grid md:grid-cols-10 gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1 items-start justify-start md:justify-center">
          {quickProductNavItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                if (item.isAll) {
                  handleCategoryNavigate('all');
                } else if (item.productId) {
                  handleProductClick(item.productId);
                } else {
                  handleCategoryNavigate(item.categoryId);
                }
              }}
              className="flex flex-col items-center group cursor-pointer shrink-0 w-[68px] sm:w-[78px] md:w-auto focus:outline-hidden"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 bg-white border-2 border-slate-200/90 shadow-2xs group-hover:border-[#50007c] group-hover:shadow-md transition-all overflow-hidden flex items-center justify-center ring-2 ring-transparent group-hover:ring-purple-100">
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
                {item.badge && (
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-black text-center py-0.5 uppercase tracking-wider leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1.5 leading-tight group-hover:text-[#50007c] text-center line-clamp-1 w-full transition-colors">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 2. Top Hero Section with Auto-Playing Seamless Fade Animation */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-slate-900 min-h-[380px] sm:min-h-[420px] md:min-h-[450px] flex flex-col justify-between"
        >
          {/* Background Images */}
          {heroBanners.map((banner, index) => {
            const isActive = index === bannerIndex;
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
                  isActive ? 'opacity-100 z-1' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-7000 ease-out"
                />
                <div className={`absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r ${banner.gradient}`} />
              </div>
            );
          })}

          {/* Top Control Bar */}
          <div className="relative z-10 w-full p-4 sm:p-6 flex items-center justify-between pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{activeHero.badge}</span>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20">
              <button
                type="button"
                onClick={() => setBannerIndex(prev => (prev - 1 + heroBanners.length) % heroBanners.length)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setBannerIndex(prev => (prev + 1) % heroBanners.length)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 p-5 sm:p-8 md:p-10 my-auto max-w-2xl text-white pointer-events-auto">
            <div className="space-y-3">
              {activeHero.featureTag && (
                <span className="inline-block px-3 py-1 bg-amber-400/90 text-slate-950 text-xs sm:text-sm font-black rounded-lg shadow-sm">
                  ⚡ {activeHero.featureTag}
                </span>
              )}

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] drop-shadow-md">
                {activeHero.title}
              </h1>

              <p className="text-xs sm:text-base text-slate-100/95 leading-relaxed font-medium drop-shadow-sm max-w-xl">
                {activeHero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleCategoryNavigate(activeHero.categoryId)}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{activeHero.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={(e) => handleQuickWhatsApp(getProduct(activeHero.productId), e)}
                  className="px-4 py-2.5 sm:px-5 sm:py-3 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Inquiry</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="relative z-10 w-full p-4 sm:p-6 flex items-center justify-between pointer-events-auto">
            <span className="text-[11px] text-white/80 font-bold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {activeHero.minQty}
            </span>

            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {heroBanners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === bannerIndex ? 'w-6 bg-orange-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
              <span className="text-[10px] text-white/70 font-semibold pl-1 whitespace-nowrap">
                {isPaused ? '⏸ Paused' : `${bannerIndex + 1}/${heroBanners.length}`}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. RECENTLY VIEWED PRODUCTS (Horizontal 4-Card List from localStorage) */}
      {recentlyViewedProducts.length > 0 && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="bg-slate-50/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#50007c]">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Recently Viewed
                    </h2>
                    <span className="px-2 py-0.5 bg-purple-100 text-[#50007c] text-[10px] font-bold rounded-full">
                      Last {recentlyViewedProducts.length} items
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Quickly revisit products you recently checked out
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCategoryNavigate('all')}
                className="text-xs font-bold text-[#50007c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal list of 4 products */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {recentlyViewedProducts.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -3 }}
                  onClick={() => handleProductClick(p.id)}
                  className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 hover:shadow-md hover:border-[#50007c]/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-square rounded-lg bg-slate-100 overflow-hidden mb-2.5">
                      <img
                        src={p.images[0]?.url}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {p.featureBadge && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-sm shadow-xs">
                          {p.featureBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {p.categoryLabel}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#50007c] line-clamp-1 mt-0.5">
                      {p.title}
                    </h3>
                    {p.subtitle && (
                      <p className="text-[10px] text-orange-700 font-medium line-clamp-1">
                        {p.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      {p.dispatchTag || '⚡ Fast Pickup'}
                    </span>
                    <span className="text-xs font-bold text-[#50007c] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. SIGNATURE 5-MINUTE INSTANT EXPRESS COUNTER (Compact & Clean) */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50 p-5 sm:p-6 rounded-3xl border border-orange-200/90 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200/80 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
                <Clock className="w-3 h-3" />
                <span>Shivani Graphics Express Counter</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <span>⚡ 5-Minute Instant Walk-in Counter</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Instant printing ready while you wait at our Mahavir Enclave, New Delhi studio
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCategoryNavigate('all')}
              className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6 Clean Instant Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {express5MinProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -3 }}
                onClick={() => handleProductClick(p.id)}
                className="bg-white rounded-xl border border-orange-200/90 overflow-hidden cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={p.images[0]?.url}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-sm shadow-xs">
                    {p.featureBadge || '⚡ 5 Mins'}
                  </span>
                </div>

                <div className="p-2.5 space-y-1">
                  <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#50007c]">
                    {p.title}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      ⚡ Ready
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleQuickWhatsApp(p, e)}
                      className="p-1 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Quick WhatsApp Order"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. EXPLORE OFFICIAL CATEGORIES PORTAL (Each Category Has Its Dedicated Separate Page) */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-[#50007c] rounded-full text-[11px] font-black uppercase tracking-wider">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Official Product Categories</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Explore Our Dedicated Department Pages
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Click any department below to open its dedicated page with complete specifications and ordering
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBulkModal}
            className="px-4 py-2 bg-gradient-to-r from-[#50007c] to-purple-800 hover:from-purple-900 hover:to-[#50007c] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Custom Bulk RFQ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Spacious Category Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {officialCategoryPortals.map((portal) => (
            <motion.div
              key={portal.id}
              whileHover={{ y: -4 }}
              onClick={() => handleCategoryNavigate(portal.id)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden cursor-pointer hover:shadow-xl hover:border-[#50007c]/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                <img
                  src={portal.image}
                  alt={portal.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black rounded-lg shadow-xs uppercase tracking-wider ${portal.tagColor}`}>
                  {portal.badge}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-sm group-hover:text-orange-300 transition-colors">
                    {portal.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {portal.subtitle}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {portal.itemCount} Verified Products
                  </span>
                  
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#50007c] group-hover:text-orange-600 transition-colors">
                    <span>Open Category Page</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. TRUST & STORE STRENGTHS (Clean, Non-congested 4-Card Grid) */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">5-Min Counter</h4>
              <p className="text-[10px] sm:text-xs text-slate-500">Walk-in instant prints</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-[#50007c] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Delhi NCR Express</h4>
              <p className="text-[10px] sm:text-xs text-slate-500">Same-day courier delivery</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">18% GST Invoicing</h4>
              <p className="text-[10px] sm:text-xs text-slate-500">Input Tax Credit (ITC)</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Free Mockup Proof</h4>
              <p className="text-[10px] sm:text-xs text-slate-500">WhatsApp pre-check</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Corporate & Custom Bulk Quote Banner */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#50007c] via-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[11px] font-black uppercase tracking-wider">
              Corporate & Volume Deals
            </span>
            <h3 className="text-xl sm:text-3xl font-black tracking-tight">
              Need Bulk Printing for Your Company or Event?
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Special wholesale rates for Corporate Identity kits, Exhibition Banners, Uniform Merch, and Annual Event Stationery with GST Billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenBulkModal}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white hover:bg-slate-100 text-[#50007c] font-black text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer"
            >
              Get Bulk Quote
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent('Hello Shivani Graphics! We have a corporate / bulk printing requirement in Delhi NCR.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions Section */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto pt-2">
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 mb-4">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {faqs.map((faq, index) => (
            <div key={index} className="py-3 sm:py-4">
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-500 ml-2">
                  {openFaqIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              <AnimatePresence>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
