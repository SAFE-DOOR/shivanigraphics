import { createClient } from '@supabase/supabase-js';

// Helper to get Supabase credentials from localStorage or env
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const localKey = localStorage.getItem('supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url: localUrl, key: localKey };
};

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
};

// ==========================================
// SUPABASE DATABASE OPERATIONS
// ==========================================

export const dbOperations = {
  // Products Catalog
  async getProducts() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await (client.from('products') as any).select('*');
    if (error) {
      console.error('Error fetching products from Supabase:', error);
      throw error;
    }
    return data;
  },

  async upsertProduct(product: any) {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await (client.from('products') as any).upsert(product);
    if (error) {
      console.error('Error upserting product to Supabase:', error);
      throw error;
    }
    return data;
  },

  // Orders & Tracking
  async getOrders(userEmail?: string) {
    const client = getSupabaseClient();
    if (!client) return null;
    let query = (client.from('orders') as any).select('*');
    if (userEmail) {
      query = query.eq('user_email', userEmail);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      throw error;
    }
    return data;
  },

  async createOrder(order: any) {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await (client.from('orders') as any).insert([order]);
    if (error) {
      console.error('Error creating order in Supabase:', error);
      throw error;
    }
    return data;
  },

  async updateOrderStatus(orderId: string, status: string, trackingHistory?: any[]) {
    const client = getSupabaseClient();
    if (!client) return null;
    const updatePayload: any = { status };
    if (trackingHistory) {
      updatePayload.tracking_history = trackingHistory;
    }
    const { data, error } = await (client.from('orders') as any).update(updatePayload).eq('id', orderId);
    if (error) {
      console.error('Error updating order status in Supabase:', error);
      throw error;
    }
    return data;
  },

  // User Profiles
  async getUserProfile(userId: string) {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await (client.from('user_profiles') as any).select('*').eq('id', userId).single();
    if (error) {
      console.error('Error fetching user profile from Supabase:', error);
      return null;
    }
    return data;
  },

  async upsertUserProfile(profile: { id: string; email: string; full_name?: string; phone?: string; address?: string }) {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await (client.from('user_profiles') as any).upsert(profile);
    if (error) {
      console.error('Error upserting user profile in Supabase:', error);
      throw error;
    }
    return data;
  },

  // Reviews
  async getReviews() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await (client.from('reviews') as any).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching reviews from Supabase:', error);
      throw error;
    }
    return data;
  },

  async addReview(review: any) {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await (client.from('reviews') as any).insert([review]);
    if (error) {
      console.error('Error adding review in Supabase:', error);
      throw error;
    }
    return data;
  },

  async deleteReview(reviewId: string) {
    const client = getSupabaseClient();
    if (!client) return null;
    const { error } = await (client.from('reviews') as any).delete().eq('id', reviewId);
    if (error) {
      console.error('Error deleting review in Supabase:', error);
      throw error;
    }
    return true;
  }
};

// SQL Schema script for user profiles, order tracking, and product catalogs
export const SUPABASE_SQL_SCHEMA = `
-- 1. Product Catalogs Table
create table if not exists products (
  id text primary key,
  slug text unique not null,
  title text not null,
  category text not null,
  category_label text,
  short_description text,
  detailed_description text,
  rating numeric default 5.0,
  review_count integer default 0,
  dispatch_tag text,
  badge text,
  subtitle text,
  feature_badge text,
  images jsonb default '[]'::jsonb,
  specs jsonb default '[]'::jsonb,
  config jsonb default '{}'::jsonb,
  base_price numeric default 0,
  min_quantity integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. User Profiles Table
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  address text,
  role text default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Order Tracking Table
create table if not exists orders (
  id text primary key,
  user_email text not null,
  customer_name text,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric not null,
  status text default 'Order Placed',
  shipping_address text,
  payment_method text,
  tracking_history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Reviews Table
create table if not exists reviews (
  id text primary key,
  product_id text references products(id) on delete set null,
  user_name text not null,
  rating integer not null,
  review text not null,
  photo_url text,
  approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;
alter table user_profiles enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;

-- Public read access for products and reviews
create policy "Public products are viewable by everyone" on products for select using (true);
create policy "Public reviews are viewable by everyone" on reviews for select using (true);

-- Allow authenticated users to insert orders & reviews
create policy "Users can insert orders" on orders for insert with check (true);
create policy "Users can insert reviews" on reviews for insert with check (true);
`;

