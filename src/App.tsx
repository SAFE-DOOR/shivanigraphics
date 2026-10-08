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

// Admin Studio System
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';

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
  | 'gallery'
  | 'admin';

function AdminRouter({ onBackToWebsite }: { onBackToWebsite: () => void }) {
  const { isAdminLoggedIn } = useAdmin();
  if (!isAdminLoggedIn) {
    return <AdminLogin onBackToWebsite={onBackToWebsite} />;
  }
  return <AdminLayout onBackToWebsite={onBackToWebsite} />;
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS);
  const [activeProduct, setActiveProduct] = useState<ProductItem>(PRODUCTS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isHelpCenterModalOpen, setIsHelpCenterModalOpen] = useState(false);

  // Sync view from hash / path on initial load and handle browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === 'admin' || hash.startsWith('admin/')) {
        setCurrentView('admin');
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
        'gallery',
        'admin'
      ];
      if (validViews.includes(hash as AppView)) {
        setCurrentView(hash as AppView);
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
      window.location.hash = '';
    } else {
      window.location.hash = `#/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePolicyNavigate = (policyRoute: PolicyRoute) => {
    navigateTo(policyRoute as AppView);
  };

  if (currentView === 'admin') {
    return (
      <AdminProvider>
        <AdminRouter onBackToWebsite={() => navigateTo('home')} />
      </AdminProvider>
    );
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-purple-600 selection:text-white">
        
        {/* 1. Top Brand Announcement Banner */}
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
          onOpenHelpCenter={() => navigateTo('help')}
          onNavigateHome={() => navigateTo('home')}
          onNavigateTrack={() => navigateTo('track')}
          onNavigateAbout={() => navigateTo('about')}
          onNavigateGallery={() => navigateTo('gallery')}
        />

        {/* Mobile Drawer Menu */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          selectedCategory={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          products={products}
          onSelectProduct={handleSelectProduct}
          onOpenStoreModal={() => navigateTo('contact')}
          onOpenHelpCenter={() => navigateTo('help')}
          onNavigateHome={() => navigateTo('home')}
          onNavigateTrack={() => navigateTo('track')}
          onNavigateAbout={() => navigateTo('about')}
          onNavigatePolicy={handlePolicyNavigate}
        />

        {/* 3. Main Dynamic Content Router */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'home' && (
                <PrintoHomeFeed
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onSelectCategory={handleSelectCategory}
                  onOpenBulkModal={() => setIsBulkModalOpen(true)}
                />
              )}

              {currentView === 'product' && activeProduct && (
                <ProductDetailPage
                  product={activeProduct}
                  allProducts={products}
                  onBack={() => navigateTo('home')}
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={handleAddToCart}
                  onOpenArtworkGuide={() => navigateTo('artwork-guidelines')}
                />
              )}

              {currentView === 'category' && (
                <CategoryPage
                  categoryId={selectedCategoryId}
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onSelectCategory={handleSelectCategory}
                  onBackToHome={() => navigateTo('home')}
                />
              )}

              {currentView === 'terms' && <TermsPage onBackToHome={() => navigateTo('home')} onNavigateContact={() => navigateTo('contact')} />}
              {currentView === 'privacy' && <PrivacyPage onBackToHome={() => navigateTo('home')} />}
              {currentView === 'refund-policy' && <RefundPolicyPage onBackToHome={() => navigateTo('home')} />}
              {currentView === 'artwork-guidelines' && <ArtworkGuidelinesPage onBackToHome={() => navigateTo('home')} />}
              {currentView === 'contact' && <ContactPage onBackToHome={() => navigateTo('home')} />}
              {currentView === 'payment-billing' && <PaymentBillingPage onBackToHome={() => navigateTo('home')} />}
              {currentView === 'about' && <AboutUsPage onBackToHome={() => navigateTo('home')} onExploreCatalog={() => navigateTo('home')} />}
              {currentView === 'track' && <TrackOrderPage onBackToHome={() => navigateTo('home')} />}
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
              {currentView === 'help' && (
                <div className="py-8">
                  <HelpCenter isModal={false} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 5. Printo-Style Footer */}
        <Footer
          onSelectCategory={handleSelectCategory}
          onOpenStoreModal={() => navigateTo('contact')}
          onOpenHelpCenter={() => navigateTo('help')}
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          onNavigateAbout={() => navigateTo('about')}
          onNavigateTrack={() => navigateTo('track')}
          onNavigatePolicy={handlePolicyNavigate}
          onOpenAdminModal={() => navigateTo('admin')}
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

      </div>
    </AdminProvider>
  );
}
