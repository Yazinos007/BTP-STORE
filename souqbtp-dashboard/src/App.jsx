import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Package, Truck, FileSignature, BarChart3, LogOut, Bell, Layers, FileText, Calculator, Users, Receipt, Sparkles, LayoutDashboard, Settings, Zap, Radar } from 'lucide-react';

import SupplierStock from './pages/SupplierStock';
import SupplierInvoices from './pages/SupplierInvoices';
import SupplierAccounting from './pages/SupplierAccounting';
import SupplierExpenses from './pages/SupplierExpenses';
import SupplierHR from './pages/SupplierHR';
import AISmartAdvisor from './pages/AISmartAdvisor'; 
import SupplierOverview from './pages/SupplierOverview';
import SupplierClients from './pages/SupplierClients';
import SupplierOrders from './pages/SupplierOrders';
import Fleet from './pages/Fleet';
import Contracts from './pages/Contracts';
import AnalyticsB2B from './pages/AnalyticsB2B'; 
import SupplierSettings from './pages/SupplierSettings';
import SupplierSubscription from './pages/SupplierSubscription';
import RetailerSettings from './pages/Settings'; 
import RetailerSubscription from './pages/RetailerSubscription';
import TenderRadar from './pages/TenderRadar';
import Marketplace from './pages/Marketplace';

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

// لوحة المورد (بدون BrowserRouter داخلي لأنه أصبح مغلفاً من الخارج)
const WholesalerDashboard = ({ supplier, children }) => {
  const { language } = useSettingsStore();
  
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
    { path: '/analytics', icon: BarChart3, label: language === 'fr' ? 'Analytiques B2B' : 'التحليلات الكبرى' },
    { path: '/ai-advisor', icon: Sparkles, label: language === 'fr' ? 'Conseiller Stratégique (IA)' : 'المستشار الذكي (IA)' },
    { path: '/tender-radar', icon: Radar, label: language === 'fr' ? 'Radar d\'Appels d\'Offres' : 'رادار المناقصات' },
    { path: '/settings', icon: Settings, label: language === 'fr' ? 'Paramètres & Confiance' : 'الإعدادات والتوثيق' }
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <aside class="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl relative z-20">
        <div class="h-20 flex items-center px-8 border-b border-slate-800 bg-slate-950/50">
          <h1 class="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            SouqBTP <span class="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Portal</span>
          </h1>
        </div>
        <div class="px-5 pt-6 pb-2">
          <Link to="/subscription" class="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-105 transition-all">
            <Zap size={20} class="fill-black" />
            {language === 'fr' ? 'Passer à l\'Enterprise' : 'ترقية للباقة الذهبية'}
          </Link>
        </div>
        <nav class="flex-1 py-4 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800/80 group">
              <item.icon size={20} class="group-hover:text-blue-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div class="p-4 border-t border-slate-800">
          <button onClick={() => supabase.auth.signOut()} class="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all">
            <LogOut size={20} /> {language === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}
          </button>
        </div>
      </aside>
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <header class="h-20 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-10">
          <div>
            <h2 class="text-xl font-bold text-white">{language === 'fr' ? 'Espace Fournisseur B2B' : 'بوابة المورد الكبير'}</h2>
            <p class="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {language === 'fr' ? 'Système en ligne' : 'النظام متصل'}
            </p>
          </div>
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-3 pl-6 border-l border-slate-700">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold text-white">{supplier?.store_name}</p>
                <p class="text-xs text-slate-400 uppercase tracking-wider">{language === 'fr' ? 'Grossiste' : 'مورد جملة'}</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 border border-white/10">
                {supplier?.store_name?.charAt(0).toUpperCase() || 'W'}
              </div>
            </div>
          </div>
        </header>
        <div class="flex-1 overflow-auto p-10 custom-scrollbar z-10">
          {children}
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

  useEffect(() => {
    const initializeApp = async () => {
      // 1. استقبال الدخول التلقائي (SSO) من PHP بدون العبث بروابط المتصفح الأب
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');

      if (accessToken) {
        const { data } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: accessToken
        });
        if (data?.session) {
          setSession(data.session);
          await fetchSupplierProfile(data.session.user.id);
        }
      } else {
        // 2. الفحص العادي
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          await fetchSupplierProfile(currentSession.user.id);
        }
      }
      setLoading(false);
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) fetchSupplierProfile(currentSession.user.id);
    });

    return () => subscription.unsubscribe();
  }, [fetchSupplierProfile]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-400">{language === 'fr' ? 'Chargement...' : 'جاري التحميل...'}</p>
      </div>
    );
  }

  const isWholesaler = session?.user?.user_metadata?.supplier_type === 'wholesale' || session?.user?.user_metadata?.role === 'supplier';
  const storeName = session?.user?.user_metadata?.company_name || supplier?.store_name || '';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : '?';

  return (
    <BrowserRouter>
      <Routes>
        {/* 🛒 المسار العام (المتجر): متاح للجميع بدون شروط وبدون تداخل */}
        <Route path="/store" element={<Marketplace />} />

        {/* 🔒 المسارات المحمية (لوحات التحكم) */}
        <Route path="*" element={
          !session ? (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="text-5xl mb-4">⛔</div>
              <h2 className="text-2xl font-bold text-red-500 mb-2">{language === 'fr' ? 'Accès Non Autorisé' : 'الدخول غير مصرح'}</h2>
              <p className="text-slate-400 mb-6">{language === 'fr' ? 'Veuillez vous connecter via le portail principal.' : 'يرجى تسجيل الدخول عبر البوابة الرئيسية.'}</p>
              {/* كسر الإطار عند العودة لتسجيل الدخول */}
              <button onClick={() => window.parent.location.href = 'https://souqbtp.ma/app/auth.html'} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all">
                {language === 'fr' ? 'Retour au portail' : 'العودة للمنصة الرئيسية'}
              </button>
            </div>
          ) : isWholesaler ? (
            <WholesalerDashboard supplier={supplier}>
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
                <Route path="/analytics" element={<AnalyticsB2B />} />
                <Route path="/ai-advisor" element={<AISmartAdvisor />} />
                <Route path="/tender-radar" element={<TenderRadar />} />
                <Route path="/settings" element={<SupplierSettings />} />
                <Route path="/subscription" element={<SupplierSubscription />} />
              </Routes>
            </WholesalerDashboard>
          ) : (
            <div className="flex h-screen bg-gray-50 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <Sidebar />
              <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {language === 'fr' ? 'Bienvenue, ' : 'مرحباً بك، '} <span className="text-blue-600">{storeName}</span>
                  </h2>
                </header>
                <div className="flex-1 overflow-auto p-6">
                  {/* ... روابط التاجر (Retailer Routes) ... */}
                  <Routes>
                     <Route path="/" element={<Overview />} />
                     <Route path="/pos" element={<POS />} />
                     <Route path="/settings" element={<RetailerSettings />} />
                  </Routes>
                </div>
              </main>
            </div>
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}export default App;