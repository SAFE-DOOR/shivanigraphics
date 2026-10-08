import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Image, FileText, Users, CreditCard, 
  PackageOpen, Tag, Star, BarChart2, ShieldCheck, Settings, Activity, LogOut, Menu, X, ExternalLink 
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { DashboardView } from './DashboardView';
import { ProductsView } from './ProductsView';
import { BannersImagesView } from './BannersImagesView';
import { OrdersView } from './OrdersView';
import { QuotesView } from './QuotesView';
import { CmsView } from './CmsView';
import { InventoryView, MarketingView, ReviewsView, UsersView, AuditLogsView } from './AdditionalViews';

interface AdminLayoutProps {
  onBackToWebsite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToWebsite }) => {
  const { currentAdminUser, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders OMS', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'products', label: 'Products Catalog', icon: <Package className="w-4 h-4" /> },
    { id: 'banners', label: 'Website Images', icon: <Image className="w-4 h-4" /> },
    { id: 'quotes', label: 'Quote Requests', icon: <FileText className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory Stock', icon: <PackageOpen className="w-4 h-4" /> },
    { id: 'marketing', label: 'Coupons & Offers', icon: <Tag className="w-4 h-4" /> },
    { id: 'reviews', label: 'Customer Reviews', icon: <Star className="w-4 h-4" /> },
    { id: 'cms', label: 'Website CMS Text', icon: <Settings className="w-4 h-4" /> },
    { id: 'users', label: 'Admin Roles', icon: <Users className="w-4 h-4" /> },
    { id: 'audit', label: 'Activity Logs', icon: <Activity className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'orders': return <OrdersView />;
      case 'products': return <ProductsView />;
      case 'banners': return <BannersImagesView />;
      case 'quotes': return <QuotesView />;
      case 'inventory': return <InventoryView />;
      case 'marketing': return <MarketingView />;
      case 'reviews': return <ReviewsView />;
      case 'cms': return <CmsView />;
      case 'users': return <UsersView />;
      case 'audit': return <AuditLogsView />;
      default: return <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900 selection:bg-purple-600 selection:text-white">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#50007c] to-orange-500 flex items-center justify-center text-white font-black shadow-md">
            SG
          </div>
          <div>
            <h3 className="text-white font-black text-sm tracking-tight">Shivani Graphics</h3>
            <p className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Master Admin Studio</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === item.id ? 'bg-[#50007c] text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview Public Website</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Studio</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header & Drawer */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between lg:hidden sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#50007c] text-white font-black text-xs flex items-center justify-center">SG</div>
              <span className="font-black text-sm text-slate-900">Admin Studio</span>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-red-600">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex lg:hidden">
            <div className="w-72 bg-slate-900 text-slate-300 flex flex-col h-full p-4 space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-white font-black text-sm">Navigation Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      activeTab === item.id ? 'bg-[#50007c] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Admin Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

    </div>
  );
};
