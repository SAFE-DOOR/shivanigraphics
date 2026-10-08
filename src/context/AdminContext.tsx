import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { ProductItem } from '../types';
import { db } from '../firebase';
import { 
  collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc, onSnapshot 
} from 'firebase/firestore';

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
  addPublicReview: (review: { name: string; rating: number; review: string }) => Promise<void>;
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
  const [websiteImages, setWebsiteImages] = useState<WebsiteImage[]>([
    { id: 'img-1', title: 'Homepage Hero Main', section: 'Hero', url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80', alt: 'Visiting Cards', enabled: true, sortOrder: 1 },
    { id: 'img-2', title: 'Outdoor Flex Banner', section: 'Hero', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80', alt: 'Flex Banners', enabled: true, sortOrder: 2 }
  ]);
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
  const [reviews, setReviews] = useState<ReviewItem[]>([
    { id: 'rev-1', name: 'Rohan Sharma', rating: 5, review: 'Amazing quality visiting cards ready in just 5 minutes at Mahavir Enclave store!', date: '2026-10-06', approved: true },
    { id: 'rev-2', name: 'Neha Gupta', rating: 5, review: 'Best flex banner printing in Delhi NCR. Very prompt service.', date: '2026-10-07', approved: true }
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', admin: 'Ranjan Roy', action: 'Master Admin Studio Initialized', date: '2026-10-07', time: '19:10' }
  ]);

  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Firestore Real-Time onSnapshot Listeners & Auto-Seeding All 31+ Products
  useEffect(() => {
    async function seedAndListen() {
      try {
        // Auto-seed all 31+ products from PRODUCTS into Firestore
        const prodSnap = await getDocs(collection(db, 'products'));
        if (prodSnap.empty || prodSnap.docs.length < PRODUCTS.length) {
          for (const p of PRODUCTS) {
            await setDoc(doc(db, 'products', p.id), p);
          }
        }

        // Auto-seed reviews if empty
        const revSnap = await getDocs(collection(db, 'reviews'));
        if (revSnap.empty) {
          for (const r of reviews) {
            await setDoc(doc(db, 'reviews', r.id), r);
          }
        }

        // Auto-seed website images if empty
        const imgSnap = await getDocs(collection(db, 'website_images'));
        if (imgSnap.empty) {
          for (const img of websiteImages) {
            await setDoc(doc(db, 'website_images', img.id), img);
          }
        }

        // Auto-seed website content if empty
        const contentRef = doc(db, 'system_settings', 'website_content');
        const contentSnap = await getDoc(contentRef);
        if (!contentSnap.exists()) {
          await setDoc(contentRef, websiteContent);
        }

      } catch (e) {
        console.warn('Firestore seeding notice:', e);
      }
    }

    seedAndListen();

    // Attach real-time onSnapshot listeners
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as ProductItem);
      if (items.length > 0) setProducts(items);
      setIsFirebaseLoading(false);
    }, (err) => console.warn('Products snapshot error:', err));

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as AdminOrder);
      setOrders(items);
    }, (err) => console.warn('Orders snapshot error:', err));

    const unsubQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as AdminQuote);
      setQuotes(items);
    }, (err) => console.warn('Quotes snapshot error:', err));

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as ReviewItem);
      if (items.length > 0) setReviews(items);
    }, (err) => console.warn('Reviews snapshot error:', err));

    const unsubImages = onSnapshot(collection(db, 'website_images'), (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as WebsiteImage);
      if (items.length > 0) setWebsiteImages(items);
    }, (err) => console.warn('Images snapshot error:', err));

    const unsubContent = onSnapshot(doc(db, 'system_settings', 'website_content'), (docSnap) => {
      if (docSnap.exists()) {
        setWebsiteContent(docSnap.data() as any);
      }
    }, (err) => console.warn('Content snapshot error:', err));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubQuotes();
      unsubReviews();
      unsubImages();
      unsubContent();
    };
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
      await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
      logAction(`Updated product: ${updatedProd.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const addProduct = async (newProd: ProductItem) => {
    try {
      await setDoc(doc(db, 'products', newProd.id), newProd);
      logAction(`Added new product: ${newProd.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    const p = products.find(x => x.id === id);
    try {
      await deleteDoc(doc(db, 'products', id));
      logAction(`Deleted product: ${p?.title || id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const updateOrderStatus = async (id: string, status: AdminOrder['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      logAction(`Updated order ${id} status to ${status}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const updateQuoteStatus = async (id: string, status: AdminQuote['status'], price?: number) => {
    try {
      await updateDoc(doc(db, 'quotes', id), { status, quotedPrice: price });
      logAction(`Updated quote ${id} status to ${status}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const updateWebsiteImage = async (img: WebsiteImage) => {
    try {
      await setDoc(doc(db, 'website_images', img.id), img);
      logAction(`Updated website image: ${img.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const addWebsiteImage = async (img: WebsiteImage) => {
    try {
      await setDoc(doc(db, 'website_images', img.id), img);
      logAction(`Added website image: ${img.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const deleteWebsiteImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'website_images', id));
      logAction(`Deleted website image ID: ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const updateWebsiteContent = async (content: any) => {
    try {
      await setDoc(doc(db, 'system_settings', 'website_content'), content);
      logAction(`Updated website CMS content`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
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
    const updated = reviews.map(r => r.id === id ? { ...r, approved: newStatus } : r);
    setReviews(updated);
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: newStatus });
      logAction(`Toggled review approval for ID ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  };

  const addPublicReview = async (review: { name: string; rating: number; review: string }) => {
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: review.name,
      rating: review.rating,
      review: review.review,
      date: new Date().toISOString().split('T')[0],
      approved: true // instant public visibility
    };
    try {
      await setDoc(doc(db, 'reviews', newRev.id), newRev);
    } catch (e) {
      console.error('Error adding public review to Firestore:', e);
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
