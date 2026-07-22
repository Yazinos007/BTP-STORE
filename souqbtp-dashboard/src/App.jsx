import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { 
  Package, Truck, FileSignature, BarChart3, LogOut, Bell, Layers, FileText, Calculator, Users, Receipt, Sparkles, LayoutDashboard, 
  Settings, Zap, Radar, Wallet, Landmark, CreditCard, Globe, ShoppingCart } from 'lucide-react';
import RawMaterialSuppliers from './pages/RawMaterialSuppliers';
import RawMaterialPurchases from './pages/RawMaterialPurchases';
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
import SupplierPOS from './pages/SupplierPOS';
import SupplierTeam from './pages/SupplierTeam';

import useSupplierStore from './store/useSupplierStore';
import useSettingsStore from './store/useSettingsStore';

// 🛡️ لوحة المورد الكبير المحصنة مع إضاءة الأقسام النشطة والنبض الفاخر
const WholesalerDashboard = ({ supplier, children }) => {
  const { language, setLanguage } = useSettingsStore();
  const location = useLocation();

  const handleLanguageChange = () => {
    if (language === 'fr') setLanguage('ar');
    else if (language === 'ar') setLanguage('en');
    else setLanguage('fr');
  };

  const tLayout = {
    fr: {
      upgrade: "Passer à l'Enterprise", logout: "Déconnexion", portal: "Espace Fournisseur B2B", online: "Système en ligne", wholesaler: "Grossiste",
      unauthorizedTitle: "Accès Non Autorisé", unauthorizedDesc: "Veuillez vous connecter via le portail principal.", backPortal: "Retour au portail",
      items: { overview: "Tableau de bord", rawSuppliers: "Fournisseurs Matières", rawPurchases: "Achats Matières", stock: "Stock Central", posB2B: "Ventes Directes (POS)", clients: "Clients & Dettes", orders: "Commandes Reçues", fleet: "Flotte & Livraisons", contracts: "Contrats & Signatures", invoices: "Factures B2B", hr: "Ressources Humaines", caisses: "Caisses & Banques", expenses: "Gestion des Charges", fiscal: "Système Fiscal", accounting: "Comptabilité & Bilan", analytics: "Analytiques B2B", ai: "Conseiller Stratégique (IA)", radar: "Radar d'Appels d'Offres", team: "Utilisateurs & Permissions", settings: "Paramètres & Confiance", }
    },
    ar: {
      upgrade: "ترقية للباقة الذهبية", logout: "تسجيل الخروج", portal: "بوابة المورد الكبير", online: "النظام متصل", wholesaler: "مورد جملة",
      unauthorizedTitle: "الدخول غير مصرح", unauthorizedDesc: "يرجى تسجيل الدخول عبر البوابة الرئيسية.", backPortal: "العودة للمنصة الرئيسية",
      items: { overview: "لوحة القيادة", rawSuppliers: "موردو المواد الخام", rawPurchases: "مشتريات المواد الخام", stock: "المخزون المركزي", posB2B: "المبيعات المباشرة (POS)", clients: "العملاء والديون (CRM)", orders: "الطلبات الواردة", fleet: "أسطول التوصيل", contracts: "المصافحة الرقمية", invoices: "الفواتير الكبرى", hr: "الموارد البشرية", caisses: "الصناديق والحسابات", expenses: "إدارة المصاريف", fiscal: "النظام الجبائي (TVA)", accounting: "المحاسبة والـ CPC", analytics: "التحليلات الكبرى", ai: "المستشار الذكي (IA)", radar: "رادار المناقصات", team: "المستخدمون والصلاحيات", settings: "الإعدادات والتوثيق", }
    },
    en: {
      upgrade: "Upgrade to Enterprise", logout: "Logout", portal: "Wholesale B2B Portal", online: "System Online", wholesaler: "Wholesaler",
      unauthorizedTitle: "Unauthorized Access", unauthorizedDesc: "Please log in via the main portal.", backPortal: "Back to Main Portal",
      items: { overview: "Dashboard", rawSuppliers: "Raw Material Suppliers", rawPurchases: "Raw Material Purchases", stock: "Central Stock", posB2B: "Direct Sales (POS)", clients: "Clients & Debts (CRM)", orders: "Received Orders", fleet: "Fleet & Deliveries", contracts: "Digital Contracts", invoices: "B2B Invoices", hr: "Human Resources", caisses: "Banks & Registers", expenses: "Expenses Management", fiscal: "Tax System (VAT)", accounting: "Accounting & CPC", analytics: "B2B Analytics", ai: "AI Strategic Advisor", radar: "Tender Radar", team: "Users & Permissions", settings: "Settings & Trust", }
    }
  };
  const t = tLayout[language] || tLayout['fr'];
  
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [readyToShipCount, setReadyToShipCount] = useState(0);

 // 🛡️ دالة Auth النووية: تختطف التوكن من الرابط وتجبر المتصفح على فتحه
  useEffect(() => {
    let mounted = true;

    const forgeSession = async () => {
      try {
        // 1. اختطاف التوكن من الرابط مباشرة (لتجاوز حظر الـ iframe)
        const hash = window.location.hash;
        
        if (hash && hash.includes('access_token') && hash.includes('refresh_token')) {
          console.log("✅ تم رصد التوكن في الرابط! جاري تحطيم الجدار...");
          
          // فك تشفير الرابط لاستخراج المفاتيح
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // إجبار Supabase على تسجيل الدخول فوراً بهذا التوكن!
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (data?.session?.user && mounted) {
              setSession(data.session);
              fetchSupplierProfile(data.session.user.id);
              
              // مسح التوكن من الرابط ليبقى المنظر احترافياً ونظيفاً
              window.history.replaceState(null, '', window.location.pathname);
              setLoading(false);
              return; // 🎯 نجاح! نخرج من الدالة ولا نكمل
            }
          }
        }

        // 2. الخطة ب: إذا لم يكن هناك توكن في الرابط، نحاول بالطريقة العادية
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setSession(session);
            fetchSupplierProfile(session.user.id);
          } else {
            setSession(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ خطأ في فك تشفير الجلسة:", err);
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    forgeSession();

    // 3. الاستماع لأي تغير مستقبلي (مثل تسجيل الخروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          window.parent.location.href = 'https://souqbtp.ma/app/auth.html';
        } else if (currentSession?.user && !session) {
          // تحديث الجلسة في الخلفية إذا تم تجديدها
          setSession(currentSession);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t.items.overview },
    { path: '/raw-suppliers', icon: Users, label: t.items.rawSuppliers },
    { path: '/raw-purchases', icon: Receipt, label: t.items.rawPurchases },
    { path: '/stock', icon: Layers, label: t.items.stock }, 
    { path: '/clients', icon: Users, label: t.items.clients },
    { path: '/pos-b2b', icon: ShoppingCart, label: t.items.posB2B }, 
    { path: '/orders', icon: Package, label: t.items.orders, badge: pendingOrdersCount },
    { path: '/fleet', icon: Truck, label: t.items.fleet, badge: readyToShipCount },  
    { path: '/contracts', icon: FileSignature, label: t.items.contracts },
    { path: '/invoices', icon: FileText, label: t.items.invoices },
    { path: '/hr', icon: Users, label: t.items.hr },
    { path: '/caisses', icon: Wallet, label: t.items.caisses },
    { path: '/expenses', icon: Receipt, label: t.items.expenses },
    { path: '/fiscal', icon: Landmark, label: t.items.fiscal },
    { path: '/accounting', icon: Calculator, label: t.items.accounting },
    { path: '/analytics', icon: BarChart3, label: t.items.analytics },
    { path: '/ai-advisor', icon: Sparkles, label: t.items.ai },
    { path: '/tender-radar', icon: Radar, label: t.items.radar },
    { path: '/team', icon: Users, label: t.items.team },
    { path: '/settings', icon: Settings, label: t.items.settings }
  ];

  const getActiveStyle = (path) => {
    const isActive = location.pathname === path;
    if (!isActive) return "text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent";
    
    if (path === '/pos-b2b' || path === '/orders') return "bg-blue-600/20 text-blue-400 border border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.35)] animate-pulse";
    if (path === '/stock') return "bg-emerald-600/20 text-emerald-400 border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-pulse";
    if (path === '/raw-suppliers' || path === '/raw-purchases' || path === '/team') return "bg-purple-600/20 text-purple-400 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-pulse";
    if (path === '/invoices' || path === '/expenses') return "bg-orange-600/20 text-orange-400 border border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.35)] animate-pulse";
    if (path === '/fleet' || path === '/contracts' || path === '/tender-radar') return "bg-cyan-600/20 text-cyan-400 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.35)] animate-pulse";
    
    return "bg-indigo-600/20 text-indigo-400 border border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.35)] animate-pulse";
  };

  return (
    <div className="flex h-screen w-full max-w-full bg-[#0f172a] text-slate-300 font-sans overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <aside className="w-72 shrink-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl relative z-20">
        <div className="h-24 shrink-0 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            {supplier?.logo_url ? (
              <img src={supplier.logo_url} alt="Logo" className="w-11 h-11 shrink-0 rounded-xl object-cover shadow-lg border border-slate-700" />
            ) : (
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg border border-white/10">
                {supplier?.store_name?.charAt(0).toUpperCase() || 'S'}
              </div>
            )}
            <div className="flex flex-col text-start">
              <h1 className="text-xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
                SouqBTP
              </h1>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal</span>
            </div>
          </div>

          <button 
            onClick={handleLanguageChange}
            className="flex flex-col items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all text-slate-300 hover:text-white group shadow-sm hover:shadow-md cursor-pointer"
            title={language === 'ar' ? 'تغيير اللغة' : language === 'en' ? 'Change Language' : 'Changer la langue'}
          >
            <Globe size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[9px] font-black uppercase mt-1 tracking-wider">{language}</span>
          </button>
        </div>
        <div className="px-5 pt-6 pb-2 shrink-0">
          <Link to="/subscription" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-105 transition-all text-sm">
            <Zap size={20} className="fill-black" />
            {t.upgrade}
          </Link>
        </div>
        <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all group ${getActiveStyle(item.path)}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={`${isActive ? 'text-current scale-110' : 'group-hover:text-blue-400'} transition-transform shrink-0`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 w-full max-w-full">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <header className="h-20 shrink-0 w-full border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="truncate pr-4 text-start">
            <h2 className="text-xl font-bold text-white truncate">{t.portal}</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              {t.online}
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className={`flex items-center gap-3 ${language === 'ar' ? 'pr-6 border-r' : 'pl-6 border-l'} border-slate-700`}>
              <div className="text-end hidden sm:block">
                <p className="text-sm font-bold text-white">{supplier?.store_name}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{t.wholesaler}</p>
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
  
  const { language, setLanguage } = useSettingsStore();
  const { supplier, fetchSupplierProfile } = useSupplierStore();

  const isStorePage = window.location.pathname.startsWith('/store') || window.location.search.includes('vendor');

  // 🛡️ دالة Auth النووية: مصممة للعمل داخل الإطارات (Iframes) بدون الحاجة لـ LocalStorage
  useEffect(() => {
    let mounted = true;

    const forgeSession = async () => {
      try {
        const hash = window.location.hash;
        
        // 1. إذا وجدنا التوكن مرسلاً من PHP عبر الرابط
        if (hash && hash.includes('access_token') && hash.includes('refresh_token')) {
          console.log("✅ تم التقاط مفاتيح الدخول! جاري اختراق الجدار...");
          
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // أ) نجبر Supabase على اعتماد التوكن في الذاكرة الحية (حتى لو فشل التخزين المحلي)
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            }).catch(() => {}); // نتجاهل خطأ الحظر من المتصفح

            // ب) نطلب بيانات المستخدم مباشرة من السيرفر كدليل قاطع على الدخول
            const { data: userData } = await supabase.auth.getUser(accessToken);
            
            if (userData?.user && mounted) {
              // نصنع جلسة في الذاكرة ونفتح الأبواب
              setSession({ user: userData.user, access_token: accessToken });
              fetchSupplierProfile(userData.user.id);
              
              window.history.replaceState(null, '', window.location.pathname); // تنظيف الرابط
              setLoading(false);
              return; // 🎯 الدخول تم بنجاح!
            }
          }
        }

        // 2. المحاولة العادية في حال لم يكن هناك توكن في الرابط
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setSession(session);
            fetchSupplierProfile(session.user.id);
          } else {
            setSession(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ فشل في فك التشفير:", err);
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    forgeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          window.parent.location.href = 'https://souqbtp.ma/app/auth.html';
        } else if (currentSession?.user && !session) {
          setSession(currentSession);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);
  
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
        <p className="font-bold text-slate-400">{language === 'fr' ? 'Chargement...' : language === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-5xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold text-red-500 mb-2">
          {language === 'fr' ? 'Accès Non Autorisé' : language === 'en' ? 'Unauthorized Access' : 'الدخول غير مصرح'}
        </h2>
        <p className="text-slate-400 mb-6">
          {language === 'fr' ? 'Veuillez vous connecter via le portail principal.' : language === 'en' ? 'Please log in via the main portal.' : 'يرجى تسجيل الدخول عبر البوابة الرئيسية.'}
        </p>
        <button onClick={() => window.parent.location.href = 'https://souqbtp.ma/app/auth.html'} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all cursor-pointer shadow-lg">
          {language === 'fr' ? 'Retour au portail' : language === 'en' ? 'Back to Main Portal' : 'العودة للمنصة الرئيسية'}
        </button>
      </div>
    );
  }

  const isWholesaler = session?.user?.user_metadata?.supplier_type === 'wholesale' || supplier?.supplier_type === 'wholesale';
  const storeName = session?.user?.user_metadata?.company_name || supplier?.store_name || '';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : '?';

  return (
    <BrowserRouter>
      {isWholesaler ? (
        <WholesalerDashboard supplier={supplier}>
          <Routes>
            <Route path="/" element={<SupplierOverview />} />
            <Route path="/stock" element={<SupplierStock isWholesaler={true} />} />
            <Route path="/clients" element={<Clients isWholesaler={true} />} />
            <Route path="/caisses" element={<Caisses isWholesaler={true} />} />
            <Route path="/fiscal" element={<Fiscal isWholesaler={true} />} />  
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
            <Route path="/raw-suppliers" element={<RawMaterialSuppliers />} />
            <Route path="/raw-purchases" element={<RawMaterialPurchases />} />
            <Route path="/pos-b2b" element={<SupplierPOS />} />
            <Route path="/team" element={<SupplierTeam />} />
          </Routes>
        </WholesalerDashboard>
      ) : (
        <div className="flex h-screen w-full max-w-full bg-gray-50 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="shrink-0 flex h-full">
            <Sidebar />
          </div>
          <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full max-w-full">
            <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0 w-full">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate pr-4 text-start">
                {language === 'fr' ? 'Bienvenue, ' : language === 'en' ? 'Welcome, ' : 'مرحباً بك، '} <span className="text-blue-600 truncate">{storeName}</span>
              </h2>
              <div className="flex items-center gap-3 md:gap-4 shrink-0">
                <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all whitespace-nowrap">
                   <Package size={18} /> <span className="hidden sm:inline">{language === 'fr' ? 'Gérer le Magasin' : language === 'en' ? 'Manage Store' : 'إدارة سلع المتجر'}</span>
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
                  <Route path="/products" element={<Products />} />                     
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
      )}
    </BrowserRouter>
  );
}
export default App;