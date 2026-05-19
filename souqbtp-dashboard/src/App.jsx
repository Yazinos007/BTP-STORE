import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Package, Truck, FileSignature, BarChart3, LogOut, Bell, Layers, FileText, Calculator, Users, Receipt, Sparkles, LayoutDashboard, Settings, Zap } from 'lucide-react';

import SupplierStock from './pages/SupplierStock';
import SupplierInvoices from './pages/SupplierInvoices';
import SupplierAccounting from './pages/SupplierAccounting';
import SupplierExpenses from './pages/SupplierExpenses';
import SupplierHR from './pages/SupplierHR';
import AISmartAdvisor from './pages/AISmartAdvisor'; 
import SupplierOverview from './pages/SupplierOverview';
import SupplierClients from './pages/SupplierClients'; 
import SupplierSettings from './pages/SupplierSettings';
import SupplierSubscription from './pages/SupplierSubscription';
import RetailerSettings from './pages/Settings'; 
import RetailerSubscription from './pages/RetailerSubscription';

// === صفحات التاجر (Retailer) ===
import Overview from './pages/Overview';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import POS from './pages/POS';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import HR from './pages/HR';
import Fiscal from './pages/Fiscal';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Caisses from './pages/Caisses';
import Devis from './pages/Devis';
import BC from './pages/BC';
import BL from './pages/BL';
import Avoir from './pages/Avoir';
import Expeditions from './pages/Expeditions';
import FacturesAchat from './pages/FacturesAchat';
import Clients from './pages/Clients';
import Accounting from './pages/Accounting';
import ExternalSuppliers from './pages/ExternalSuppliers';
import Purchases from './pages/Purchases';

import useSupplierStore from './store/useSupplierStore';
import useSettingsStore from './store/useSettingsStore';

const WholesalerDashboard = ({ supplier }) => {
  const { language } = useSettingsStore();
  
  // 🎯 القائمة الأساسية للمورد
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: language === 'fr' ? 'Vue d\'ensemble' : 'نظرة عامة' },
    { path: '/stock', icon: Layers, label: language === 'fr' ? 'Stock Central' : 'المخزون المركزي' },
    { path: '/clients', icon: Users, label: language === 'fr' ? 'Clients B2B' : 'إدارة العملاء (CRM)' }, 
    { path: '/orders', icon: Package, label: language === 'fr' ? 'Commandes Reçues' : 'الطلبات الواردة' },
    { path: '/fleet', icon: Truck, label: language === 'fr' ? 'Flotte & Livraisons' : 'أسطول التوصيل' },
    { path: '/contracts', icon: FileSignature, label: language === 'fr' ? 'Contrats & Signatures' : 'المصافحة الرقمية' },
    { path: '/invoices', icon: FileText, label: language === 'fr' ? 'Factures B2B' : 'الفواتير الكبرى' },
    { path: '/hr', icon: Users, label: language === 'fr' ? 'Ressources Humaines' : 'الموارد البشرية' },
    { path: '/expenses', icon: Receipt, label: language === 'fr' ? 'Gestion des Charges' : 'إدارة المصاريف' },
    { path: '/accounting', icon: Calculator, label: language === 'fr' ? 'Comptabilité & Bilan' : 'المحاسبة والـ CPC' },
    { path: '/ai-advisor', icon: Sparkles, label: language === 'fr' ? 'Conseiller Stratégique (IA)' : 'المستشار الذكي (IA)' },
    { path: '/analytics', icon: BarChart3, label: language === 'fr' ? 'Analytiques B2B' : 'التحليلات الكبرى' },
    { path: '/settings', icon: Settings, label: language === 'fr' ? 'Paramètres & Confiance' : 'الإعدادات والتوثيق' }
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-blue-500/30" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl relative z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-800 bg-slate-950/50">
          <h1 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            SouqBTP <span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Portal</span>
          </h1>
        </div>

        {/* 🌟 الزر الذهبي للترقية - بارز ومستقل في أعلى القائمة! 🌟 */}
        <div className="px-5 pt-6 pb-2">
          <Link to="/subscription" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-105 transition-all">
            <Zap size={20} className="fill-black" />
            {language === 'fr' ? 'Passer à l\'Enterprise' : 'ترقية للباقة الذهبية'}
          </Link>
        </div>
        
        <nav className="flex-1 py-4 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800/80 group">
              <item.icon size={20} className="group-hover:text-blue-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all">
            <LogOut size={20} /> {language === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <header className="h-20 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {language === 'fr' ? 'Espace Fournisseur B2B' : 'بوابة المورد الكبير'}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {language === 'fr' ? 'Système en ligne' : 'النظام متصل'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{supplier?.store_name}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{language === 'fr' ? 'Grossiste' : 'مورد جملة'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 border border-white/10">
                {supplier?.store_name?.charAt(0).toUpperCase() || 'W'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10 custom-scrollbar z-10">
          <Routes>
            <Route path="/" element={<SupplierOverview />} />
            <Route path="/stock" element={<SupplierStock />} />
            <Route path="/clients" element={<SupplierClients />} />
            <Route path="/orders" element={<SupplierOrders />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/invoices" element={<SupplierInvoices />} />
            <Route path="/hr" element={<SupplierHR />} />
            <Route path="/expenses" element={<SupplierExpenses />} />
            <Route path="/accounting" element={<SupplierAccounting />} />
            <Route path="/ai-advisor" element={<AISmartAdvisor />} />
            <Route path="/analytics" element={<AnalyticsB2B />} />
            <Route path="/settings" element={<SupplierSettings />} />
            <Route path="/subscription" element={<SupplierSubscription />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { language } = useSettingsStore();
  const { supplier, fetchSupplierProfile } = useSupplierStore();

  const t = {
    ar: { loading: 'جاري التحميل...', welcome: 'مرحباً بك، ' },
    fr: { loading: 'Chargement en cours...', welcome: 'Bienvenue, ' }
  }[language];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchSupplierProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchSupplierProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [fetchSupplierProfile]);

  if (loading || (session && !supplier)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-gray-500 animate-pulse">{t.loading}</p>
      </div>
    );
  }

  if (!session) return <Login />;

  const isWholesaler = supplier?.role === 'wholesaler';
  const storeName = supplier?.store_name || t.loading;
  const storeInitial = supplier?.store_name ? supplier.store_name.charAt(0).toUpperCase() : (language === 'fr' ? '?' : '؟');

  if (isWholesaler) {
    return (
      <BrowserRouter>
        <WholesalerDashboard supplier={supplier} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
       <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {t.welcome} <span className="text-blue-600">{storeName}</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                {storeInitial}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[400px]">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/settings" element={<RetailerSettings />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/fiscal" element={<Fiscal />} />
                <Route path="/caisses" element={<Caisses />} />
                <Route path="/devis" element={<Devis />} />
                <Route path="/bc" element={<BC />} />
                <Route path="/bl" element={<BL />} />
                <Route path="/avoir" element={<Avoir />} />
                <Route path="/fiches-expedition" element={<Expeditions />} />
                <Route path="/factures-achat" element={<FacturesAchat />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/suppliers" element={<ExternalSuppliers />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/subscription" element={<RetailerSubscription />} />
              </Routes>
            </div>
          </div>
        </main>
      </div> 
    </BrowserRouter>
  );
}
export default App;