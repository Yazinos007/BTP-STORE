import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { 
  Package, Truck, FileSignature, BarChart3, LogOut, Bell, Layers, 
  FileText, Calculator, Users, Receipt, Sparkles, LayoutDashboard, 
  Settings, Zap, Radar, Wallet, Landmark, CreditCard 
} from 'lucide-react';

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

import Overview from './pages/Overview';
import Products from './pages/Products';
import Orders from './pages/Orders';
import RetailerWallet from './pages/Wallet';
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
import RawMaterialSuppliers from './مسار/الملف/RawMaterialSuppliers';

// 🛡️ لوحة المورد الكبير المحصنة مع المستشعرات الذكية
const WholesalerDashboard = ({ supplier, children }) => {
  const { language } = useSettingsStore();
  
  // 🌟 حالات نبض الإشعارات
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [readyToShipCount, setReadyToShipCount] = useState(0);

  // 🌟 المستشعر الذكي (يقرأ الطلبات، يحدّث النبض، ويسجل العملاء تلقائياً في الـ CRM)
  useEffect(() => {
    if (!supplier?.id) return;

    const syncSmartData = async () => {
      // 1. جلب الطلبات الواردة
      const { data: orders } = await supabase
        .from('supply_requests')
        .select('status, merchant_id')
        .eq('supplier_id', supplier.id);

      if (orders) {
        // تحديث أرقام النبض
        setPendingOrdersCount(orders.filter(o => o.status === 'pending').length);
        setReadyToShipCount(orders.filter(o => o.status === 'signed').length);

        // 2. 🤖 المزامنة التلقائية مع الـ CRM
        const uniqueMerchantIds = [...new Set(orders.map(o => o.merchant_id).filter(Boolean))];
        if (uniqueMerchantIds.length > 0) {
          // جلب أسماء العملاء المسجلين حالياً لتفادي التكرار
          const { data: currentClients } = await supabase.from('clients').select('full_name').eq('supplier_id', supplier.id);
          const clientNamesSet = new Set(currentClients?.map(c => c.full_name) || []);

          // جلب بيانات التجار الذين أرسلوا الطلبات
          const { data: merchants } = await supabase.from('suppliers').select('id, store_name, phone').in('id', uniqueMerchantIds);

          if (merchants) {
            for (const merchant of merchants) {
              const name = merchant.store_name || 'Client B2B';
              // إذا لم يكن العميل مسجلاً في الـ CRM، قم بتسجيله فوراً
              if (!clientNamesSet.has(name)) {
                await supabase.from('clients').insert({
                  supplier_id: supplier.id,
                  full_name: name,
                  phone: merchant.phone || '',
                  total_debt: 0 // يبدأ الدين من صفر حتى تكتمل الفاتورة
                });
                clientNamesSet.add(name); // إضافته للمجموعة المؤقتة لمنع تكراره في نفس اللفة
              }
            }
          }
        }
      }
    };

    syncSmartData();

    // تشغيل الرادار اللحظي (يتحدث النبض فور إرسال أي طلب أو إمضائه)
    const channel = supabase.channel('wholesaler-smart-radar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supply_requests', filter: `supplier_id=eq.${supplier.id}` }, () => {
        syncSmartData();
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, [supplier]);
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: language === 'fr' ? 'Overview' : 'نظرة عامة' },
    { path: '/stock', icon: Layers, label: language === 'fr' ? 'Stock Central' : 'المخزون المركزي' },
    { path: '/clients', icon: Users, label: language === 'fr' ? 'Clients & Dettes' : 'العملاء والديون (CRM)' }, 
    { path: '/orders', icon: Package, label: language === 'fr' ? 'Commandes Reçues' : 'الطلبات الواردة', badge: pendingOrdersCount },
    { path: '/fleet', icon: Truck, label: language === 'fr' ? 'Flotte & Livraisons' : 'أسطول التوصيل', badge: readyToShipCount },  
    { path: '/contracts', icon: FileSignature, label: language === 'fr' ? 'Contrats & Signatures' : 'المصافحة الرقمية' },
    { path: '/invoices', icon: FileText, label: language === 'fr' ? 'Factures B2B' : 'الفواتير الكبرى' },
    { path: '/hr', icon: Users, label: language === 'fr' ? 'Ressources Humaines' : 'الموارد البشرية' },
    { path: '/caisses', icon: Wallet, label: language === 'fr' ? 'Caisses & Banques' : 'الصناديق والحسابات' },
    { path: '/expenses', icon: Receipt, label: language === 'fr' ? 'Gestion des Charges' : 'إدارة المصاريف' },
    { path: '/fiscal', icon: Landmark, label: language === 'fr' ? 'Système Fiscal' : 'النظام الجبائي (TVA)' },
    { path: '/accounting', icon: Calculator, label: language === 'fr' ? 'Comptabilité & Bilan' : 'المحاسبة والـ CPC' },
    { path: '/analytics', icon: BarChart3, label: language === 'fr' ? 'Analytiques B2B' : 'التحليلات الكبرى' },
    { path: '/ai-advisor', icon: Sparkles, label: language === 'fr' ? 'Conseiller Stratégique (IA)' : 'المستشار الذكي (IA)' },
    { path: '/tender-radar', icon: Radar, label: language === 'fr' ? 'Radar d\'Appels d\'Offres' : 'رادار المناقصات' },
    { path: '/settings', icon: Settings, label: language === 'fr' ? 'Paramètres & Confiance' : 'الإعدادات والتوثيق' }
  ];

  return (
    <div className="flex h-screen w-full max-w-full bg-[#0f172a] text-slate-300 font-sans overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <aside className="w-72 shrink-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl relative z-20">
        <div className="h-20 shrink-0 flex items-center px-8 border-b border-slate-800 bg-slate-950/50">
          <h1 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            SouqBTP <span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Portal</span>
          </h1>
        </div>
        <div className="px-5 pt-6 pb-2 shrink-0">
          <Link to="/subscription" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-105 transition-all">
            <Zap size={20} className="fill-black" />
            {language === 'fr' ? 'Passer à l\'Enterprise' : 'ترقية للباقة الذهبية'}
          </Link>
          
          <Link to="/raw-material-suppliers">الموردين (المواد الخام)</Link>
        </div>
        <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800/80 group">
              <div className="flex items-center gap-3">
                <item.icon size={20} className="group-hover:text-blue-400 transition-colors" />
                {item.label}
              </div>
              {/* 🌟 شارة النبض الحمراء */}
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all">
            <LogOut size={20} /> {language === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 w-full max-w-full">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <header className="h-20 shrink-0 w-full border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="truncate pr-4">
            <h2 className="text-xl font-bold text-white truncate">{language === 'fr' ? 'Espace Fournisseur B2B' : 'بوابة المورد الكبير'}</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              {language === 'fr' ? 'Système en ligne' : 'النظام متصل'}
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{supplier?.store_name}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{language === 'fr' ? 'Grossiste' : 'مورد جملة'}</p>
              </div>
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 border border-white/10">
                {supplier?.store_name?.charAt(0).toUpperCase() || 'W'}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-10 w-full max-w-full relative z-10">
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

  const isStorePage = window.location.pathname.startsWith('/store') || window.location.search.includes('vendor');

  useEffect(() => {
    const initializeApp = async () => {
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

  if (isStorePage) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/store" element={<Marketplace />} />
          <Route path="*" element={<Marketplace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-400">{language === 'fr' ? 'Chargement...' : 'جاري التحميل...'}</p>
      </div>
    );
  }

  const isWholesaler = session?.user?.user_metadata?.supplier_type === 'wholesale' || supplier?.supplier_type === 'wholesale';
  const storeName = session?.user?.user_metadata?.company_name || supplier?.store_name || '';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : '?';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={
          !session ? (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="text-5xl mb-4">⛔</div>
              <h2 className="text-2xl font-bold text-red-500 mb-2">{language === 'fr' ? 'Accès Non Autorisé' : 'الدخول غير مصرح'}</h2>
              <p className="text-slate-400 mb-6">{language === 'fr' ? 'Veuillez vous connecter via le portail principal.' : 'يرجى تسجيل الدخول عبر البوابة الرئيسية.'}</p>
              <button onClick={() => window.parent.location.href = 'https://souqbtp.ma/app/auth.html'} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all">
                {language === 'fr' ? 'Retour au portail' : 'العودة للمنصة الرئيسية'}
              </button>
            </div>
          ) : isWholesaler ? (
            <WholesalerDashboard supplier={supplier}>
              <Routes>
                <Route path="/" element={<SupplierOverview />} />
                <Route path="/stock" element={<SupplierStock />} />
                <Route path="/clients" element={<Clients />} /> 
                <Route path="/caisses" element={<Caisses />} /> 
                <Route path="/fiscal" element={<Fiscal />} />   
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
                <Route path="raw-material-suppliers" element={<RawMaterialSuppliers />} />
              </Routes>
            </WholesalerDashboard>
          ) : (
            <div className="flex h-screen w-full max-w-full bg-gray-50 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="shrink-0 flex h-full">
                <Sidebar />
              </div>
              <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full max-w-full">
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0 w-full">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate pr-4">
                    {language === 'fr' ? 'Bienvenue, ' : 'مرحباً بك، '} <span className="text-blue-600 truncate">{storeName}</span>
                  </h2>
                  <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all whitespace-nowrap">
                       <Package size={18} /> <span className="hidden sm:inline">{language === 'fr' ? 'Gérer le Magasin' : 'إدارة سلع المتجر'}</span>
                    </Link>
                    <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                      {storeInitial}
                    </div>
                  </div>
                </header>
                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 w-full max-w-full">
                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 min-h-[400px] w-full max-w-full overflow-x-auto">
                    <Routes>
                      <Route path="/" element={<Overview />} />
                      <Route path="/products" element={<SupplierStock />} />                     
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/wallet" element={<RetailerWallet />} />
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
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}
export default App;