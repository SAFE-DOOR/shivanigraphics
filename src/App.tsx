import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, CATEGORIES } from './data/products';
import { ProductItem, CartItem } from './types';
import { TopBanner } from './components/TopBanner';
import { Header } from './components/Header';
import { MobileDrawer } from './components/MobileDrawer';
import { PrintoHomeFeed } from './components/PrintoHomeFeed';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CategoryPage } from './components/CategoryPage';
import { AboutUsPage } from './components/AboutUsPage';
import { TrackOrderPage } from './components/TrackOrderPage';
import { HelpCenter } from './components/HelpCenter';
import { Footer, PolicyRoute } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PrepressAiAdvisorModal } from './components/PrepressAiAdvisorModal';
import { CartModal } from './components/CartModal';
import { BulkQuoteModal } from './components/BulkQuoteModal';
import { playWelcomeVoiceGreeting, hasBeenGreeted, isVoiceMuted } from './utils/voiceGreeting';
import { addRecentlyViewedId } from './utils/recentlyViewed';

// Dedicated Separate Sub-Pages (Replacing Popups/Modals)
import { TermsPage } from './components/pages/TermsPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { RefundPolicyPage } from './components/pages/RefundPolicyPage';
import { ArtworkGuidelinesPage } from './components/pages/ArtworkGuidelinesPage';
import { ContactPage } from './components/pages/ContactPage';
import { PaymentBillingPage } from './components/pages/PaymentBillingPage';
import { ProductsGalleryPage } from './components/pages/ProductsGalleryPage';
import { MasterAdminPanel } from './components/MasterAdminPanel';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export type AppView = 
  | 'home' 
  | 'product' 
  | 'category' 
  | 'about' 
  | 'track' 
  | 'help'
  | 'terms'
  | 'privacy'
  | 'refund-policy'
  | 'artwork-guidelines'
  | 'contact'
  | 'payment-billing'
  | 'gallery';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS);
  const [activeProduct, setActiveProduct] = useState<ProductItem>(PRODUCTS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Fetch live products from Firebase Firestore on load
  useEffect(() => {
    async function loadCloudProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (!querySnapshot.empty) {
          const cloudProducts = querySnapshot.docs.map(doc => doc.data() as ProductItem);
          setProducts(cloudProducts);
          setActiveProduct(cloudProducts[0]);
        } else {
          // Seed Firestore with default PRODUCTS if empty
          for (const p of PRODUCTS) {
            await setDoc(doc(db, 'products', p.id), p);
          }
        }
      } catch (e) {
        console.error('Error loading cloud products:', e);
      }
    }
    loadCloudProducts();
  }, []);

  // Modals state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isHelpCenterModalOpen, setIsHelpCenterModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Sync view from hash / path on initial load and handle browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === 'admin-dashboard') {
        setIsAdminDashboardOpen(true);
        return;
      }
      const validViews: AppView[] = [
        'terms', 
        'privacy', 
        'refund-policy', 
        'artwork-guidelines', 
        'contact', 
        'about', 
        'track', 
        'help',
        'payment-billing',
        'gallery'
      ];
      if (validViews.includes(hash as AppView)) {
        setCurrentView(hash as AppView);
      } else if (!hash) {
        // default view remains if not navigating back to root
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Dynamic SEO Document Title & Meta Description update
  useEffect(() => {
    let pageTitle = 'Shivani Graphics · Printo-Style Commercial Printing & Signage Delhi NCR';
    let pageDesc = 'Premium digital printing, visiting cards, flex banners, 3D acrylic LED boards, wedding cards, stamps, and corporate merch in Mahavir Enclave, Delhi NCR.';

    if (currentView === 'product' && activeProduct) {
      pageTitle = `${activeProduct.title} | Shivani Graphics Delhi NCR`;
      pageDesc = `${activeProduct.shortDescription} · Order online with instant WhatsApp proof & express 4-hr Delhi delivery.`;
    } else if (currentView === 'category') {
      const cat = CATEGORIES.find(c => c.id === selectedCategoryId);
      pageTitle = `${cat ? cat.label : 'Print Catalog'} | Shivani Graphics`;
      pageDesc = `Explore professional commercial printing & signage solutions in Delhi NCR.`;
    } else if (currentView === 'about') {
      pageTitle = 'About Shivani Graphics · Mahavir Enclave Press Delhi';
    } else if (currentView === 'track') {
      pageTitle = 'Track Print Order · Shivani Graphics';
    } else if (currentView === 'help') {
      pageTitle = 'Help & Prepress FAQ · Shivani Graphics';
    }

    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', pageDesc);
    }
  }, [currentView, activeProduct, selectedCategoryId]);

  // Web Speech API Voice Greeting on First User Interaction (autoplay restriction compliant & once per session)
  useEffect(() => {
    const handleFirstInteraction = () => {
      playWelcomeVoiceGreeting(false);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    if (!hasBeenGreeted() && !isVoiceMuted()) {
      window.addEventListener('click', handleFirstInteraction, { passive: true });
      window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    }

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => [item, ...prev]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectProduct = (product: ProductItem) => {
    addRecentlyViewedId(product.id);
    setActiveProduct(product);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (view === 'home') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.history.pushState(null, '', `#/${view}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePolicyNavigate = (route: PolicyRoute) => {
    navigateTo(route as AppView);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#50007c] selection:text-white">
      
      {/* 1. Top Purple Announcement Bar */}
      <TopBanner />

      {/* 2. Main Printo-Style Navigation Header */}
      <Header
        products={products}
        selectedCategoryId={selectedCategoryId}
        onSelectProduct={handleSelectProduct}
        onSelectCategory={handleSelectCategory}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        cartCount={cartItems.length}
        onOpenCartModal={() => setIsCartModalOpen(true)}
        onOpenStoreModal={() => navigateTo('contact')}
        onOpenHelpCenter={() => setIsHelpCenterModalOpen(true)}
        onNavigateHome={() => navigateTo('home')}
        onNavigateTrack={() => navigateTo('track')}
        onNavigateAbout={() => navigateTo('about')}
        onNavigateGallery={() => navigateTo('gallery')}
      />

      {/* 3. Mobile Slide-out Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        selectedCategory={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        products={products}
        onSelectProduct={handleSelectProduct}
        onOpenStoreModal={() => navigateTo('contact')}
        onOpenHelpCenter={() => setIsHelpCenterModalOpen(true)}
        onNavigateHome={() => navigateTo('home')}
        onNavigateTrack={() => navigateTo('track')}
        onNavigateAbout={() => navigateTo('about')}
        onNavigatePolicy={handlePolicyNavigate}
      />

      {/* 4. Active View Rendering with Framer Motion Slide-Up Page Transitions */}
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={
              currentView === 'product'
                ? `product-${activeProduct.id}`
                : currentView === 'category'
                ? `category-${selectedCategoryId}`
                : currentView
            }
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex-1"
          >
            {/* Home Feed */}
            {currentView === 'home' && (
              <PrintoHomeFeed
                products={products}
                onSelectProduct={handleSelectProduct}
                onSelectCategory={handleSelectCategory}
                onOpenBulkModal={() => setIsBulkModalOpen(true)}
                onOpenStoreModal={() => navigateTo('contact')}
                onOpenArtworkGuide={() => navigateTo('artwork-guidelines')}
              />
            )}

            {/* Product Detail Subpage */}
            {currentView === 'product' && (
              <ProductDetailPage
                product={activeProduct}
                allProducts={products}
                onBack={() => navigateTo('home')}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                onOpenArtworkGuide={() => navigateTo('artwork-guidelines')}
              />
            )}

            {/* Category Subpage */}
            {currentView === 'category' && (
              <CategoryPage
                categoryId={selectedCategoryId}
                products={products}
                onSelectProduct={handleSelectProduct}
                onSelectCategory={handleSelectCategory}
                onBackToHome={() => navigateTo('home')}
              />
            )}

            {/* Dedicated Sub-Page 1: Terms of Service & 4-Hour Delivery */}
            {currentView === 'terms' && (
              <TermsPage
                onBackToHome={() => navigateTo('home')}
                onNavigateContact={() => navigateTo('contact')}
              />
            )}

            {/* Dedicated Sub-Page 2: Privacy Policy & Artwork Non-Disclosure */}
            {currentView === 'privacy' && (
              <PrivacyPage
                onBackToHome={() => navigateTo('home')}
              />
            )}

            {/* Dedicated Sub-Page 3: Cancellation & 100% Free Reprint / Refund */}
            {currentView === 'refund-policy' && (
              <RefundPolicyPage
                onBackToHome={() => navigateTo('home')}
              />
            )}

            {/* Dedicated Sub-Page 4: Prepress & Artwork Guidelines */}
            {currentView === 'artwork-guidelines' && (
              <ArtworkGuidelinesPage
                onBackToHome={() => navigateTo('home')}
              />
            )}

            {/* Dedicated Sub-Page 5: Contact Us & Store Facility Location */}
            {currentView === 'contact' && (
              <ContactPage
                onBackToHome={() => navigateTo('home')}
              />
            )}

            {/* Dedicated Sub-Page 6: Payment & Billing (UPI) */}
            {currentView === 'payment-billing' && (
              <PaymentBillingPage
                onBackToHome={() => navigateTo('home')}
              />
            )}

            {/* About Us Page */}
            {currentView === 'about' && (
              <AboutUsPage
                onBackToHome={() => navigateTo('home')}
                onExploreCatalog={() => navigateTo('home')}
              />
            )}

            {/* Track Order Page */}
            {currentView === 'track' && (
              <TrackOrderPage
                onBackToHome={() => navigateTo('home')}
              />
            )}

            {/* Products Gallery Page */}
            {currentView === 'gallery' && (
              <ProductsGalleryPage
                products={products}
                onBackToHome={() => navigateTo('home')}
                onSelectProduct={handleSelectProduct}
                onAddToCart={(product, qty) => {
                  handleAddToCart({
                    id: 'cart-' + Date.now(),
                    productId: product.id,
                    productTitle: product.title,
                    config: {
                      sizeId: product.config.sizes[0]?.id || 'standard',
                      materialId: product.config.materials[0]?.id || 'standard',
                      finishId: product.config.finishes[0]?.id || 'standard',
                      sideId: product.config.sides[0]?.id || 'single',
                      quantity: qty,
                      hasArtwork: false
                    },
                    sizeLabel: product.config.sizes[0]?.name || 'Standard Size',
                    materialLabel: product.config.materials[0]?.name || 'Standard Material',
                    finishLabel: product.config.finishes[0]?.name || 'Standard Finish',
                    sideLabel: product.config.sides[0]?.name || 'Single Sided',
                    imageUrl: product.images[0]?.url || ''
                  });
                }}
              />
            )}

            {/* Help Center Full Page */}
            {currentView === 'help' && (
              <div className="py-8">
                <HelpCenter isModal={false} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 5. Printo-Style Footer with Dedicated Sub-Page Policy Routing */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenStoreModal={() => navigateTo('contact')}
        onOpenHelpCenter={() => navigateTo('help')}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onNavigateAbout={() => navigateTo('about')}
        onNavigateTrack={() => navigateTo('track')}
        onNavigatePolicy={handlePolicyNavigate}
      />

      {/* 6. Round Green Floating WhatsApp Button & Prepress AI Advisor */}
      <FloatingWhatsApp />
      <PrepressAiAdvisorModal />

      {/* 7. Non-Disruptive Functional Utilities */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      <HelpCenter
        isModal={true}
        isOpen={isHelpCenterModalOpen}
        onClose={() => setIsHelpCenterModalOpen(false)}
      />

      <BulkQuoteModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      <MasterAdminPanel
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        products={products}
        onUpdateProducts={(updated) => setProducts(updated)}
      />

    </div>
  );
}
