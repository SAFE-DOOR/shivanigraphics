import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { ProductItem } from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

export interface AdminUser {
  email: string;
  name: string;
  role: 'Super Admin' | 'Manager' | 'Staff' | 'Designer';
}

export interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  productTitle: string;
  quantity: number;
  options: string;
  totalAmount: number;
  status: 'New' | 'Confirmed' | 'Designing' | 'Printing' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  files?: string[];
}

export interface AdminQuote {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  service: string;
  quantity: number;
  specifications: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  quotedPrice?: number;
  date: string;
}

export interface WebsiteImage {
  id: string;
  title: string;
  section: string;
  url: string;
  alt: string;
  desktopUrl?: string;
  mobileUrl?: string;
  enabled: boolean;
  sortOrder: number;
}

export interface CouponItem {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  active: boolean;
}

export interface InventoryItem {
  id: string;
  item: string;
  sku: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
  photo?: string;
}

export interface AuditLog {
  id: string;
  admin: string;
  action: string;
  date: string;
  time: string;
}

interface AdminContextType {
  isAdminLoggedIn: boolean;
  currentAdminUser: AdminUser | null;
  login: (user: AdminUser) => void;
  logout: () => void;
  products: ProductItem[];
  updateProduct: (product: ProductItem) => Promise<void>;
  addProduct: (product: ProductItem) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  orders: AdminOrder[];
  updateOrderStatus: (id: string, status: AdminOrder['status']) => Promise<void>;
  quotes: AdminQuote[];
  updateQuoteStatus: (id: string, status: AdminQuote['status'], price?: number) => Promise<void>;
  websiteImages: WebsiteImage[];
  updateWebsiteImage: (image: WebsiteImage) => Promise<void>;
  addWebsiteImage: (image: WebsiteImage) => Promise<void>;
  deleteWebsiteImage: (id: string) => Promise<void>;
  websiteContent: {
    heroHeading: string;
    heroSubtitle: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    businessName: string;
  };
  updateWebsiteContent: (content: any) => Promise<void>;
  coupons: CouponItem[];
  addCoupon: (coupon: CouponItem) => Promise<void>;
  inventory: InventoryItem[];
  updateInventory: (id: string, qty: number) => Promise<void>;
  reviews: ReviewItem[];
  toggleReviewApproval: (id: string) => Promise<void>;
  auditLogs: AuditLog[];
  logAction: (action: string, adminName: string) => void;
  isFirebaseLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('sg_admin_logged') === 'true';
  });

  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sg_admin_user');
    return saved ? JSON.parse(saved) : { email: 'raimanish200822@gmail.com', name: 'Ranjan Roy', role: 'Super Admin' };
  });

  // LocalStorage initializers with fallback
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('sg_admin_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const [orders, setOrders] = useState<AdminOrder[]>(() => {
    const saved = localStorage.getItem('sg_admin_orders');
    return saved ? JSON.parse(saved) : [
      { id: 'ORD-1001', customerName: 'Rajesh Sharma', phone: '+91 9810157695', email: 'rajesh@gmail.com', address: 'Mahavir Enclave, Delhi', productTitle: 'Visiting Cards (500 pcs)', quantity: 500, options: '350 GSM Matte', totalAmount: 750, status: 'Printing', paymentStatus: 'Paid', date: '2026-10-07' },
      { id: 'ORD-1002', customerName: 'Priya Verma', phone: '+91 9266944315', email: 'priya@gmail.com', address: 'Dwarka Sector 7, Delhi', productTitle: 'Star Flex Banner (6x3 ft)', quantity: 1, options: '340 GSM Star Flex', totalAmount: 1200, status: 'Ready', paymentStatus: 'Paid', date: '2026-10-07' }
    ];
  });

  const [quotes, setQuotes] = useState<AdminQuote[]>(() => {
    const saved = localStorage.getItem('sg_admin_quotes');
    return saved ? JSON.parse(saved) : [
      { id: 'QTE-501', customerName: 'Amit Kumar', phone: '+91 9810000000', email: 'amit@corp.com', service: 'Corporate Catalogs', quantity: 1000, specifications: 'Glossy art paper, 16 pages', status: 'Pending', date: '2026-10-07' }
    ];
  });

  const [websiteImages, setWebsiteImages] = useState<WebsiteImage[]>(() => {
    const saved = localStorage.getItem('sg_admin_images');
    return saved ? JSON.parse(saved) : [
      { id: 'img-1', title: 'Homepage Hero Main', section: 'Hero', url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80', alt: 'Visiting Cards', enabled: true, sortOrder: 1 },
      { id: 'img-2', title: 'Outdoor Flex Banner', section: 'Hero', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80', alt: 'Flex Banners', enabled: true, sortOrder: 2 }
    ];
  });

  const [websiteContent, setWebsiteContent] = useState(() => {
    const saved = localStorage.getItem('sg_admin_content');
    return saved ? JSON.parse(saved) : {
      heroHeading: 'Shivani Graphics · Printo-Style Commercial Printing',
      heroSubtitle: 'Premium digital printing, visiting cards, flex banners, 3D acrylic LED boards & corporate merch in Delhi NCR.',
      phone: '+91-9266944315',
      whatsapp: '919266944315',
      email: 'shivanidigitalprints@gmail.com',
      address: 'D3/50, Gali No. 8A, Mahavir Enclave, New Delhi, Delhi 110045',
      businessName: 'Shivani Graphics'
    };
  });

  const [coupons, setCoupons] = useState<CouponItem[]>(() => {
    const saved = localStorage.getItem('sg_admin_coupons');
    return saved ? JSON.parse(saved) : [
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrder: 500, active: true },
      { code: 'DELHI200', discountType: 'fixed', discountValue: 200, minOrder: 2000, active: true }
    ];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('sg_admin_inventory');
    return saved ? JSON.parse(saved) : [
      { id: 'inv-1', item: '350 GSM Art Card Reams', sku: 'PAPER-350GSM', currentStock: 45, minStock: 10, unit: 'Reams' },
      { id: 'inv-2', item: 'Star Flex Vinyl Roll 340 GSM', sku: 'FLEX-340GSM', currentStock: 12, minStock: 3, unit: 'Rolls' },
      { id: 'inv-3', item: 'Matte Lamination Roll', sku: 'LAM-MATTE', currentStock: 8, minStock: 2, unit: 'Rolls' }
    ];
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('sg_admin_reviews');
    return saved ? JSON.parse(saved) : [
      { id: 'rev-1', name: 'Rohan Sharma', rating: 5, review: 'Amazing quality visiting cards ready in just 5 minutes at Mahavir Enclave store!', date: '2026-10-06', approved: true },
      { id: 'rev-2', name: 'Neha Gupta', rating: 5, review: 'Best flex banner printing in Delhi NCR. Very prompt service.', date: '2026-10-07', approved: true }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', admin: 'Ranjan Roy', action: 'Logged in to Master Admin Studio', date: '2026-10-07', time: '19:10' }
  ]);

  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Sync with Firestore on mount and save to LocalStorage simultaneously
  useEffect(() => {
    async function initFirestoreSync() {
      try {
        // 1. Products
        const prodSnap = await getDocs(collection(db, 'products'));
        if (!prodSnap.empty) {
          const cloudProds = prodSnap.docs.map(d => d.data() as ProductItem);
          setProducts(cloudProds);
          localStorage.setItem('sg_admin_products', JSON.stringify(cloudProds));
        } else {
          for (const p of PRODUCTS) {
            await setDoc(doc(db, 'products', p.id), p);
          }
        }

        // 2. Orders
        const ordSnap = await getDocs(collection(db, 'orders'));
        if (!ordSnap.empty) {
          const cloudOrds = ordSnap.docs.map(d => d.data() as AdminOrder);
          setOrders(cloudOrds);
          localStorage.setItem('sg_admin_orders', JSON.stringify(cloudOrds));
        } else {
          for (const o of orders) {
            await setDoc(doc(db, 'orders', o.id), o);
          }
        }

        // 3. Quotes
        const qteSnap = await getDocs(collection(db, 'quotes'));
        if (!qteSnap.empty) {
          const cloudQtes = qteSnap.docs.map(d => d.data() as AdminQuote);
          setQuotes(cloudQtes);
          localStorage.setItem('sg_admin_quotes', JSON.stringify(cloudQtes));
        } else {
          for (const q of quotes) {
            await setDoc(doc(db, 'quotes', q.id), q);
          }
        }

        // 4. Website Images
        const imgSnap = await getDocs(collection(db, 'website_images'));
        if (!imgSnap.empty) {
          const cloudImgs = imgSnap.docs.map(d => d.data() as WebsiteImage);
          setWebsiteImages(cloudImgs);
          localStorage.setItem('sg_admin_images', JSON.stringify(cloudImgs));
        } else {
          for (const img of websiteImages) {
            await setDoc(doc(db, 'website_images', img.id), img);
          }
        }

        // 5. Website Content
        const contentRef = doc(db, 'system_settings', 'website_content');
        const contentSnap = await getDoc(contentRef);
        if (contentSnap.exists()) {
          const cloudContent = contentSnap.data();
          setWebsiteContent(cloudContent as any);
          localStorage.setItem('sg_admin_content', JSON.stringify(cloudContent));
        } else {
          await setDoc(contentRef, websiteContent);
        }

      } catch (e) {
        console.warn('Firestore sync fallback to LocalStorage active:', e);
      } finally {
        setIsFirebaseLoading(false);
      }
    }
    initFirestoreSync();
  }, []);

  useEffect(() => {
    localStorage.setItem('sg_admin_logged', String(isAdminLoggedIn));
    if (currentAdminUser) localStorage.setItem('sg_admin_user', JSON.stringify(currentAdminUser));
    localStorage.setItem('sg_admin_products', JSON.stringify(products));
    localStorage.setItem('sg_admin_orders', JSON.stringify(orders));
    localStorage.setItem('sg_admin_quotes', JSON.stringify(quotes));
    localStorage.setItem('sg_admin_images', JSON.stringify(websiteImages));
    localStorage.setItem('sg_admin_content', JSON.stringify(websiteContent));
    localStorage.setItem('sg_admin_coupons', JSON.stringify(coupons));
    localStorage.setItem('sg_admin_inventory', JSON.stringify(inventory));
    localStorage.setItem('sg_admin_reviews', JSON.stringify(reviews));
  }, [isAdminLoggedIn, currentAdminUser, products, orders, quotes, websiteImages, websiteContent, coupons, inventory, reviews]);

  const login = (user: AdminUser) => {
    setIsAdminLoggedIn(true);
    setCurrentAdminUser(user);
    logAction(`Logged in as ${user.role} (${user.email})`, user.name);
  };

  const logout = () => {
    if (currentAdminUser) logAction(`Logged out`, currentAdminUser.name);
    setIsAdminLoggedIn(false);
  };

  const logAction = (action: string, adminName: string) => {
    const now = new Date();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      admin: adminName,
      action,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateProduct = async (updatedProd: ProductItem) => {
    const updated = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(updated);
    localStorage.setItem('sg_admin_products', JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Updated product: ${updatedProd.title}`, currentAdminUser?.name || 'Admin');
  };

  const addProduct = async (newProd: ProductItem) => {
    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem('sg_admin_products', JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'products', newProd.id), newProd);
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Added new product: ${newProd.title}`, currentAdminUser?.name || 'Admin');
  };

  const deleteProduct = async (id: string) => {
    const p = products.find(x => x.id === id);
    const updated = products.filter(x => x.id !== id);
    setProducts(updated);
    localStorage.setItem('sg_admin_products', JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Deleted product: ${p?.title || id}`, currentAdminUser?.name || 'Admin');
  };

  const updateOrderStatus = async (id: string, status: AdminOrder['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('sg_admin_orders', JSON.stringify(updated));
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Updated order ${id} status to ${status}`, currentAdminUser?.name || 'Admin');
  };

  const updateQuoteStatus = async (id: string, status: AdminQuote['status'], price?: number) => {
    const updated = quotes.map(q => q.id === id ? { ...q, status, quotedPrice: price ?? q.quotedPrice } : q);
    setQuotes(updated);
    localStorage.setItem('sg_admin_quotes', JSON.stringify(updated));
    try {
      await updateDoc(doc(db, 'quotes', id), { status, quotedPrice: price });
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Updated quote ${id} status to ${status}`, currentAdminUser?.name || 'Admin');
  };

  const updateWebsiteImage = async (img: WebsiteImage) => {
    const updated = websiteImages.map(i => i.id === img.id ? img : i);
    setWebsiteImages(updated);
    localStorage.setItem('sg_admin_images', JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'website_images', img.id), img);
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Updated website image: ${img.title}`, currentAdminUser?.name || 'Admin');
  };

  const addWebsiteImage = async (img: WebsiteImage) => {
    const updated = [img, ...websiteImages];
    setWebsiteImages(updated);
    localStorage.setItem('sg_admin_images', JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'website_images', img.id), img);
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Added website image: ${img.title}`, currentAdminUser?.name || 'Admin');
  };

  const deleteWebsiteImage = async (id: string) => {
    const updated = websiteImages.filter(i => i.id !== id);
    setWebsiteImages(updated);
    localStorage.setItem('sg_admin_images', JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'website_images', id));
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Deleted website image ID: ${id}`, currentAdminUser?.name || 'Admin');
  };

  const updateWebsiteContent = async (content: any) => {
    setWebsiteContent(content);
    localStorage.setItem('sg_admin_content', JSON.stringify(content));
    try {
      await setDoc(doc(db, 'system_settings', 'website_content'), content);
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
    logAction(`Updated website CMS content`, currentAdminUser?.name || 'Admin');
  };

  const addCoupon = async (c: CouponItem) => {
    const updated = [c, ...coupons];
    setCoupons(updated);
    localStorage.setItem('sg_admin_coupons', JSON.stringify(updated));
    logAction(`Created coupon: ${c.code}`, currentAdminUser?.name || 'Admin');
  };

  const updateInventory = async (id: string, qty: number) => {
    const updated = inventory.map(i => i.id === id ? { ...i, currentStock: qty } : i);
    setInventory(updated);
    localStorage.setItem('sg_admin_inventory', JSON.stringify(updated));
    logAction(`Updated inventory stock for item ID ${id}`, currentAdminUser?.name || 'Admin');
  };

  const toggleReviewApproval = async (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: !r.approved } : r);
    setReviews(updated);
    localStorage.setItem('sg_admin_reviews', JSON.stringify(updated));
    logAction(`Toggled review approval for ID ${id}`, currentAdminUser?.name || 'Admin');
  };

  return (
    <AdminContext.Provider value={{
      isAdminLoggedIn,
      currentAdminUser,
      login,
      logout,
      products,
      updateProduct,
      addProduct,
      deleteProduct,
      orders,
      updateOrderStatus,
      quotes,
      updateQuoteStatus,
      websiteImages,
      updateWebsiteImage,
      addWebsiteImage,
      deleteWebsiteImage,
      websiteContent,
      updateWebsiteContent,
      coupons,
      addCoupon,
      inventory,
      updateInventory,
      reviews,
      toggleReviewApproval,
      auditLogs,
      logAction,
      isFirebaseLoading
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
