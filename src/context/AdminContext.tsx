import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { ProductItem } from '../types';

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
  authorId?: string;
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
  addPublicReview: (review: { name: string; rating: number; review: string; photo?: string }) => Promise<void>;
  auditLogs: AuditLog[];
  logAction: (action: string, adminName: string) => void;
  isFirebaseLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);

  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [websiteImages, setWebsiteImages] = useState<WebsiteImage[]>([]);
  const [websiteContent, setWebsiteContent] = useState({
    heroHeading: 'Shivani Graphics · Printo-Style Commercial Printing',
    heroSubtitle: 'Premium digital printing, visiting cards, flex banners, 3D acrylic LED boards & corporate merch in Delhi NCR.',
    phone: '+91-9266944315',
    whatsapp: '919266944315',
    email: 'shivanidigitalprints@gmail.com',
    address: 'D3/50, Gali No. 8A, Mahavir Enclave, New Delhi, Delhi 110045',
    businessName: 'Shivani Graphics'
  });
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'inv-1', item: '350 GSM Art Card Reams', sku: 'PAPER-350GSM', currentStock: 45, minStock: 10, unit: 'Reams' },
    { id: 'inv-2', item: 'Star Flex Vinyl Roll 340 GSM', sku: 'FLEX-340GSM', currentStock: 12, minStock: 3, unit: 'Rolls' },
    { id: 'inv-3', item: 'Matte Lamination Roll', sku: 'LAM-MATTE', currentStock: 8, minStock: 2, unit: 'Rolls' }
  ]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', admin: 'Ranjan Roy', action: 'Master Admin Studio Initialized (Local Express DB)', date: '2026-10-07', time: '19:10' }
  ]);

  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Fetch initial data from local Express DB API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) setProducts(data.products);
          if (data.orders) setOrders(data.orders);
          if (data.quotes) setQuotes(data.quotes);
          if (data.reviews) setReviews(data.reviews);
          if (data.images) setWebsiteImages(data.images);
          if (data.content) setWebsiteContent(data.content);
        }
      } catch (e) {
        console.warn('Error loading local DB:', e);
      } finally {
        setIsFirebaseLoading(false);
      }
    }
    loadData();

    // Poll for updates every 3 seconds for seamless cross-tab sync
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const login = (user: AdminUser) => {
    setIsAdminLoggedIn(true);
    setCurrentAdminUser(user);
    logAction(`Logged in as ${user.role} (${user.email})`, user.name);
  };

  const logout = () => {
    if (currentAdminUser) logAction(`Logged out`, currentAdminUser.name);
    setIsAdminLoggedIn(false);
    setCurrentAdminUser(null);
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
    try {
      await fetch(`/api/products/${updatedProd.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProd)
      });
      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      logAction(`Updated product: ${updatedProd.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const addProduct = async (newProd: ProductItem) => {
    try {
      await fetch(`/api/products/${newProd.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      setProducts(prev => [newProd, ...prev]);
      logAction(`Added new product: ${newProd.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    const p = products.find(x => x.id === id);
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      setProducts(prev => prev.filter(x => x.id !== id));
      logAction(`Deleted product: ${p?.title || id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const updateOrderStatus = async (id: string, status: AdminOrder['status']) => {
    try {
      const order = orders.find(o => o.id === id);
      if (order) {
        const updated = { ...order, status };
        await fetch(`/api/orders/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        setOrders(prev => prev.map(o => o.id === id ? updated : o));
      }
      logAction(`Updated order ${id} status to ${status}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const updateQuoteStatus = async (id: string, status: AdminQuote['status'], price?: number) => {
    try {
      const quote = quotes.find(q => q.id === id);
      if (quote) {
        const updated = { ...quote, status, quotedPrice: price };
        await fetch(`/api/quotes/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        setQuotes(prev => prev.map(q => q.id === id ? updated : q));
      }
      logAction(`Updated quote ${id} status to ${status}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const updateWebsiteImage = async (img: WebsiteImage) => {
    try {
      await fetch(`/api/images/${img.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(img)
      });
      setWebsiteImages(prev => prev.map(i => i.id === img.id ? img : i));
      logAction(`Updated website image: ${img.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const addWebsiteImage = async (img: WebsiteImage) => {
    try {
      await fetch(`/api/images/${img.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(img)
      });
      setWebsiteImages(prev => [...prev, img]);
      logAction(`Added website image: ${img.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const deleteWebsiteImage = async (id: string) => {
    try {
      await fetch(`/api/images/${id}`, {
        method: 'DELETE'
      });
      setWebsiteImages(prev => prev.filter(i => i.id !== id));
      logAction(`Deleted website image ID: ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const updateWebsiteContent = async (content: any) => {
    try {
      await fetch(`/api/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      setWebsiteContent(content);
      logAction(`Updated website CMS content`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const addCoupon = async (c: CouponItem) => {
    const updated = [c, ...coupons];
    setCoupons(updated);
    logAction(`Created coupon: ${c.code}`, currentAdminUser?.name || 'Admin');
  };

  const updateInventory = async (id: string, qty: number) => {
    const updated = inventory.map(i => i.id === id ? { ...i, currentStock: qty } : i);
    setInventory(updated);
    logAction(`Updated inventory stock for item ID ${id}`, currentAdminUser?.name || 'Admin');
  };

  const toggleReviewApproval = async (id: string) => {
    const rev = reviews.find(r => r.id === id);
    if (!rev) return;
    const newStatus = !rev.approved;
    const updatedReviews = reviews.map(r => r.id === id ? { ...r, approved: newStatus } : r);
    setReviews(updatedReviews);
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rev, approved: newStatus })
      });
      logAction(`Toggled review approval for ID ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('API sync error:', e);
    }
  };

  const addPublicReview = async (review: { name: string; rating: number; review: string; photo?: string }) => {
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: review.name,
      rating: review.rating,
      review: review.review,
      date: new Date().toISOString().split('T')[0],
      approved: true,
      photo: review.photo
    };
    try {
      await fetch(`/api/reviews/${newRev.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRev)
      });
      setReviews(prev => [newRev, ...prev]);
    } catch (e) {
      console.error('Error adding public review:', e);
    }
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
      addPublicReview,
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
