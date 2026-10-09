import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Package, Tag, Star, Users, FileText, ShieldCheck, Activity, Database, ExternalLink, Download, RefreshCw, Key, CheckCircle, AlertCircle, Copy, Server } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, getSupabaseConfig, getSupabaseClient } from '../lib/supabase';

export const DatabaseView: React.FC = () => {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState('');
  const [sqlCopied, setSqlCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'supabase'>('supabase');

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.key);
    if (config.url && config.key) {
      testSupabaseConnection(config.url, config.key);
    }
  }, []);

  const fetchDb = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const json = await res.json();
        setDbData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDb();
  }, []);

  const handleCopy = () => {
    if (dbData) {
      navigator.clipboard.writeText(JSON.stringify(dbData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (dbData) {
      const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'db.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('supabase_url', supabaseUrl.trim());
    localStorage.setItem('supabase_anon_key', supabaseKey.trim());
    testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
  };

  const testSupabaseConnection = async (url: string, key: string) => {
    if (!url || !key) {
      setSupabaseStatus('idle');
      return;
    }
    setSupabaseStatus('testing');
    setSupabaseErrorMsg('');
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Could not create Supabase client.');
      // Test query on products table
      const { data, error } = await client.from('products').select('id').limit(1);
      if (error) {
        // If table doesn't exist yet, client connected successfully but table needs creation
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setSupabaseStatus('connected');
        } else {
          throw error;
        }
      } else {
        setSupabaseStatus('connected');
      }
    } catch (err: any) {
      console.error(err);
      setSupabaseStatus('error');
      setSupabaseErrorMsg(err.message || 'Connection failed. Check URL & Anon Key.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#50007c] p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Server className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-black">Supabase & Database Backend Setup</h2>
          </div>
          <p className="text-xs text-purple-200">
            Configure Supabase as your primary backend for <strong>User Profiles</strong>, <strong>Order Tracking</strong>, and <strong>Product Catalogs</strong> (Replacing Firebase).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'supabase' ? 'bg-emerald-500 text-white shadow-md' : 'text-purple-200 hover:text-white'}`}
          >
            Supabase Backend
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'json' ? 'bg-white text-slate-900 shadow-md' : 'text-purple-200 hover:text-white'}`}
          >
            Local JSON / API
          </button>
        </div>
      </div>

      {activeTab === 'supabase' ? (
        <div className="space-y-6">
          {/* Connection Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#50007c]" />
                  Supabase Project Credentials
                </h3>
                <p className="text-xs text-slate-500">Enter your Supabase URL and Anon/Public Key from your Supabase project settings.</p>
              </div>
              <div>
                {supabaseStatus === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl">
                    <CheckCircle className="w-3.5 h-3.5" /> Connected to Supabase
                  </span>
                )}
                {supabaseStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 text-xs font-black rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5" /> Connection Error
                  </span>
                )}
                {supabaseStatus === 'testing' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-xl animate-pulse">
                    Testing Connection...
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Project URL</label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Anon / Public Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#50007c]"
                  />
                </div>
              </div>
              {supabaseErrorMsg && (
                <p className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">{supabaseErrorMsg}</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#50007c] hover:bg-purple-900 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save & Connect Supabase
                </button>
              </div>
            </form>
          </div>

          {/* SQL Schema Migration Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">Supabase SQL Migration Schema</h3>
                <p className="text-xs text-slate-500">Run this SQL script in your Supabase Dashboard SQL Editor to create tables for Products, User Profiles, Orders, and Reviews.</p>
              </div>
              <button
                onClick={handleCopySql}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{sqlCopied ? 'Copied SQL Script!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[400px] border border-slate-800">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-black text-sm text-slate-900">Live JSON Database Endpoint</h3>
              <p className="text-xs text-slate-500">All app records are served via <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-purple-700">/api/db</code>.</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/db"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open API Endpoint</span>
              </a>
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 bg-[#50007c] hover:bg-purple-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800">
            {loading && !dbData ? (
              <div className="text-center py-12 text-slate-400">Loading database records...</div>
            ) : (
              <pre>{dbData ? JSON.stringify(dbData, null, 2) : 'No data available'}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export const InventoryView: React.FC = () => {
  const { inventory, updateInventory } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Inventory & Raw Material Control</h2>
      <div className="space-y-3">
        {inventory.map((i) => (
          <div key={i.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded">{i.sku}</span>
              <h4 className="text-xs font-bold text-slate-900 pt-1">{i.item}</h4>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black px-3 py-1 rounded-lg ${i.currentStock <= i.minStock ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                Stock: {i.currentStock} {i.unit}
              </span>
              <button
                onClick={() => updateInventory(i.id, i.currentStock + 20)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl cursor-pointer"
              >
                + Restock (20)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MarketingView: React.FC = () => {
  const { coupons, addCoupon } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Coupons & Promotional Offers</h2>
      <div className="space-y-3">
        {coupons.map((c, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-xs font-mono font-black text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg">{c.code}</span>
              <p className="text-xs text-slate-600 pt-1">Discount: {c.discountValue}{c.discountType === 'percentage' ? '%' : ' INR'} · Min Order: ₹{c.minOrder}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReviewsView: React.FC = () => {
  const { reviews, toggleReviewApproval } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Customer Reviews Moderation</h2>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">{r.name}</span>
                <span className="text-xs text-amber-500 font-bold">★ {r.rating}.0</span>
              </div>
              <p className="text-xs text-slate-600 pt-1">"{r.review}"</p>
            </div>
            <button
              onClick={() => toggleReviewApproval(r.id)}
              className={`px-3 py-1.5 font-black text-xs rounded-xl cursor-pointer ${r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}
            >
              {r.approved ? 'Approved (Public)' : 'Hidden'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UsersView: React.FC = () => {
  const { currentAdminUser } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Admin Users & Role Permissions</h2>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div>
            <p className="font-black text-purple-900">{currentAdminUser?.name || 'Ranjan Roy'} ({currentAdminUser?.email})</p>
            <p className="text-purple-700 text-[11px]">Role: <strong className="text-purple-900">{currentAdminUser?.role || 'Super Admin'}</strong></p>
          </div>
          <span className="px-3 py-1 bg-[#50007c] text-white font-bold rounded-lg">Active Session</span>
        </div>
      </div>
    </div>
  );
};

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Activity & Audit Logs</h2>
      <div className="space-y-2">
        {auditLogs.map((log) => (
          <div key={log.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
            <div>
              <span className="font-bold text-slate-900">{log.admin}:</span> <span className="text-slate-700">{log.action}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{log.date} at {log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
