import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { 
  Menu, X, Package, LogOut, Zap, Lock 
} from 'lucide-react';

// استيراد الصفحات
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
import EmpireLanding from './pages/EmpireLanding';
import RetailLanding from './pages/RetailLanding'; 
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
import SupplierProduction from './pages/SupplierProduction';
import MarketplaceOrders from './pages/MarketplaceOrders';
import FleetManagement from './pages/FleetManagement';
import LogisticsBourse from './pages/LogisticsBourse';

// 🚀 أشرطة الفترة التجريبية والمكونات الهيكلية
import TrialBanner from './components/TrialBanner'; 
import RetailTrialBanner from './components/RetailTrialBanner';
import Sidebar from './components/Sidebar';
import HostingerBridge from './components/HostingerBridge'; // الجسر السري الذي أنشأناه

import useSupplierStore from './store/useSupplierStore';
import useSettingsStore from './store/useSettingsStore';

// 🛑 الحارس الإلكتروني (الجدار الزجاجي) للأقسام المدفوعة (لم نفقده!)
const PremiumGuard = ({ children }) => {
  const { language } = useSettingsStore();
  const navigate = useNavigate();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const trialStartDate = localStorage.getItem('trial_start_date');
    if (trialStartDate) {
      const start = new Date(trialStartDate);
      const now = new Date();
      const diffDays = Math.floor(Math.abs(now - start) / (1000 * 60 * 60 * 24));
      if (7 - diffDays <= 0) {
        setIsExpired(true);
      }
    }
  }, []);

  const t = {
    ar: { title: 'عذراً، انتهت الفترة التجريبية!', desc: 'لقد انتهت صلاحية استخدامك المجاني لهذه الميزة الحصرية. قم بالترقية الآن لباقة Pro ERP لاستعادة الوصول فوراً ومضاعفة أرباحك.', btn: 'ترقية الحساب الآن' },
    fr: { title: 'Période d\'essai expirée !', desc: 'Votre accès gratuit à cette fonctionnalité a expiré. Mettez à niveau vers Pro ERP pour y accéder à nouveau et sécuriser vos marges.', btn: 'Mettre à niveau maintenant' },
    en: { title: 'Sorry, Trial Expired!', desc: 'Your free access to this premium feature has expired. Upgrade to Pro ERP now to restore access and multiply your margins.', btn: 'Upgrade Account Now' }
  }[language] || { title: 'Période d\'essai expirée !', desc: 'Votre accès gratuit à cette fonctionnalité a expiré. Mettez à niveau vers Pro ERP pour y accéder à nouveau et sécuriser vos marges.', btn: 'Mettre à niveau maintenant' };

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock size={48} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white">{t.title}</h2>
        <p className="text-slate-400 max-w-lg text-lg font-medium leading-relaxed">{t.desc}</p>
        <button 
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-4 rounded-xl font-black text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20 mt-4"
        >
          <Zap size={24} className="fill-black" />
          {t.btn}
        </button>
      </div>
    );
  }
  return children;
};

// 💎 الغلاف الموحد الشامل لجميع الحسابات (بديل RetailerLayout و WholesalerDashboard)
const UniversalLayout = ({ accountType, storeName, storeInitial, language, session, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // تحديد نوع الواجهة لتغيير الألوان (داكن للمورد، فاتح للباقي)
  const isDarkTheme = accountType === 'wholesale';

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkTheme ? 'bg-[#0f172a] text-slate-300' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* 🚀 أشرطة الفترة التجريبية */}
      {accountType === 'wholesale' && <TrialBanner />}
      {accountType === 'retailer' && <RetailTrialBanner />}
      
      <div className="flex h-full w-full max-w-full overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* السايدبار الذكي الموحد */}
        <aside className={`shrink-0 h-full transition-all duration-300 ease-in-out absolute md:relative z-30 ${isDarkTheme ? 'bg-slate-900 shadow-2xl' : 'bg-white shadow-lg z-20'} ${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 opacity-0 overflow-hidden'}`}>
          <Sidebar accountType={accountType} />
        </aside>

        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        
        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full max-w-full relative">
          {/* الشريط العلوي الموحد (Topbar) */}
          <header className={`h-16 border-b flex items-center justify-between px-4 md:px-6 shrink-0 w-full z-10 ${isDarkTheme ? 'bg-slate-900/50 backdrop-blur-xl border-slate-800/60' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className={`flex items-center gap-2 p-2 rounded-xl transition-all shadow-sm ${isDarkTheme ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-gray-100 hover:bg-blue-50 border-gray-200 text-gray-600 hover:text-blue-600'}`}
              >
                {isSidebarOpen ? <X size={20} className="text-red-500" /> : <Menu size={20} className={isDarkTheme ? 'text-blue-400' : 'text-blue-600'} />}
              </button>
              <div className="flex flex-col text-start">
                <h2 className={`text-sm md:text-base font-bold truncate ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                  {language === 'fr' ? 'Bienvenue,' : language === 'en' ? 'Welcome,' : 'مرحباً،'} <span className="text-blue-600">{storeName}</span>
                </h2>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 uppercase tracking-wider mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {accountType} Online
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <button onClick={() => supabase.auth.signOut()} className={`hidden sm:flex items-center gap-2 text-xs font-bold transition-colors ${isDarkTheme ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'}`}>
                <LogOut size={16} /> خروج
              </button>
              <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md border border-white/10">
                {storeInitial}
              </div>
            </div>
          </header>

          {/* مساحة العمل (Canvas) التي تتغير بداخلها الصفحات */}
          <div className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 w-full max-w-full ${isDarkTheme ? '' : 'bg-slate-50/50'}`}>
            {isDarkTheme ? (
              children
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 min-h-[400px] w-full max-w-full overflow-x-auto">
                {children}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { language } = useSettingsStore();
  const { supplier, fetchSupplierProfile } = useSupplierStore();

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  useEffect(() => {
    let mounted = true;

    const forgeSession = async () => {
      try {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).catch(() => {});
            const { data: userData } = await supabase.auth.getUser(accessToken);
            
            if (userData?.user && mounted) {
              setSession({ user: userData.user, access_token: accessToken });
              fetchSupplierProfile(userData.user.id);
              window.history.replaceState(null, '', window.location.pathname + window.location.search); 
              setLoading(false);
              return; 
            }
          }
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          if (currentSession?.user) {
            setSession(currentSession);
            fetchSupplierProfile(currentSession.user.id);
          } else {
            setSession(null);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) { setSession(null); setLoading(false); }
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

    return () => { mounted = false; subscription?.unsubscribe(); };
  }, []);

  // توجيه الزوار للماركت بليس أو الهبوط
  if (pathname.startsWith('/store') || window.location.search.includes('vendor')) {
    return <BrowserRouter><Routes><Route path="*" element={<Marketplace />} /></Routes></BrowserRouter>;
  }
  if (!pathname.includes('/login') && !pathname.includes('/register') && (pathname.includes('/pro') || hostname === 'pro.souqbtp.ma')) {
    return <BrowserRouter><Routes><Route path="*" element={<RetailLanding />} /></Routes></BrowserRouter>;
  }
  if (!pathname.includes('/login') && !pathname.includes('/register') && (pathname.includes('/empire') || hostname === 'empire.souqbtp.ma')) {
    return <BrowserRouter><Routes><Route path="*" element={<EmpireLanding />} /></Routes></BrowserRouter>;
  }

  // شاشة التحميل
  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black text-2xl animate-pulse">SouqBTP...</div>;
  }

  // الجدار الناري
  if (!session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-5xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold text-red-500 mb-2">الدخول غير مصرح</h2>
        <p className="text-slate-400 mb-6">يرجى تسجيل الدخول عبر البوابة الرئيسية.</p>
        <button onClick={() => window.parent.location.href = 'https://souqbtp.ma/app/auth.html'} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all cursor-pointer shadow-lg">العودة للمنصة الرئيسية</button>
      </div>
    );
  }

  // 🎯 استخراج نوع الحساب الحقيقي من البيانات
  const accountType = session?.user?.user_metadata?.account_type 
    || session?.user?.user_metadata?.supplier_type 
    || supplier?.supplier_type 
    || 'retailer'; // افتراضي

  const storeName = session?.user?.user_metadata?.company_name || session?.user?.user_metadata?.full_name || supplier?.store_name || 'مستخدم SouqBTP';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : '?';

  return (
    <BrowserRouter>
      <UniversalLayout accountType={accountType} storeName={storeName} storeInitial={storeInitial} language={language} session={session}>
        <Routes>
          
          {/* =========================================
              🟠 المسارات المشتركة (عبر الجسر Hostinger)
              ========================================= */}
          <Route path="/marketplace" element={<HostingerBridge phpFile="marketplace.php" session={session} />} />
          <Route path="/messages" element={<HostingerBridge phpFile="chat-view.php" session={session} />} />

          {/* =========================================
              👷 مسارات المعلم / الحرفي (Artisan)
              ========================================= */}
          {accountType === 'artisan' && (
            <>
              <Route path="/artisan-home" element={<HostingerBridge phpFile="dashboard.php" session={session} />} />
              <Route path="/artisan-profile" element={<HostingerBridge phpFile="dashboard.php?page=provider-profile" session={session} />} />
              <Route path="/artisan-portfolio" element={<HostingerBridge phpFile="dashboard.php?page=provider-portfolio" session={session} />} />
              <Route path="/artisan-live-room" element={<HostingerBridge phpFile="live_room.php" session={session} />} />
            </>
          )}

          {/* =========================================
              🏗️ مسارات المقاول (Contractor)
              ========================================= */}
          {accountType === 'contractor' && (
            <>
              <Route path="/contractor-dashboard" element={<HostingerBridge phpFile="dashboard.html" session={session} />} />
              <Route path="/cost-calculator" element={<HostingerBridge phpFile="cost-calculator.html" session={session} />} />
            </>
          )}

          {/* =========================================
              📐 مسارات المهندس (Architect)
              ========================================= */}
          {accountType === 'architect' && (
            <>
              <Route path="/architect-overview" element={<HostingerBridge phpFile="dashboard.php?page=architect-overview" session={session} />} />
              <Route path="/architect-profile" element={<HostingerBridge phpFile="dashboard.php?page=architect-profile" session={session} />} />
              <Route path="/architect-projects" element={<HostingerBridge phpFile="dashboard.php?page=architect-projects" session={session} />} />
              <Route path="/architect-live-room" element={<HostingerBridge phpFile="live_room_architect.php" session={session} />} />
              <Route path="/architect-subscription" element={<HostingerBridge phpFile="architect-subscription.php" session={session} />} />
            </>
          )}

          {/* =========================================
              🏪 مسارات التاجر (Retailer)
              ========================================= */}
          {accountType === 'retailer' && (
            <>
              <Route path="/" element={<Overview />} />
              <Route path="/products" element={<Products />} />                     
              <Route path="/orders" element={<Orders />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/fiscal" element={<Fiscal />} />
              <Route path="/caisses" element={<Caisses />} />
              <Route path="/settings" element={<RetailerSettings />} />
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
              <Route path="/wallet" element={<RetailerWallet />} />
            </>
          )}

          {/* =========================================
              🏭 مسارات المورد الكبير (Wholesale)
              ========================================= */}
          {accountType === 'wholesale' && (
            <>
              <Route path="/" element={<SupplierOverview />} />
              <Route path="/stock" element={<SupplierStock isWholesaler={true} />} />
              <Route path="/invoices" element={<SupplierInvoices />} />
              <Route path="/raw-suppliers" element={<RawMaterialSuppliers />} />
              <Route path="/raw-purchases" element={<RawMaterialPurchases />} />
              <Route path="/pos-b2b" element={<SupplierPOS />} />
              <Route path="/orders" element={<SupplierOrders />} />
              <Route path="/settings" element={<SupplierSettings />} />
              <Route path="/subscription" element={<SupplierSubscription />} />

              {/* 🔒 أقسام باقة Pro ERP المحمية */}
              <Route path="/clients" element={<PremiumGuard><Clients isWholesaler={true} /></PremiumGuard>} />
              <Route path="/contracts" element={<PremiumGuard><Contracts /></PremiumGuard>} />
              <Route path="/fleet-b2b" element={<PremiumGuard><Fleet /></PremiumGuard>} />
              <Route path="/hr" element={<PremiumGuard><SupplierHR /></PremiumGuard>} />
              <Route path="/expenses" element={<PremiumGuard><SupplierExpenses /></PremiumGuard>} />
              <Route path="/accounting" element={<PremiumGuard><SupplierAccounting /></PremiumGuard>} />
              <Route path="/fiscal" element={<PremiumGuard><Fiscal isWholesaler={true} /></PremiumGuard>} />
              <Route path="/team" element={<PremiumGuard><SupplierTeam /></PremiumGuard>} />
              <Route path="/caisses" element={<PremiumGuard><Caisses isWholesaler={true} /></PremiumGuard>} />
              <Route path="/production" element={<PremiumGuard><SupplierProduction /></PremiumGuard>} />

              {/* 🛑 أقسام باقة Enterprise المحمية */}
              <Route path="/analytics" element={<PremiumGuard><AnalyticsB2B /></PremiumGuard>} />
              <Route path="/ai-advisor" element={<PremiumGuard><AISmartAdvisor /></PremiumGuard>} />
              <Route path="/tender-radar" element={<PremiumGuard><TenderRadar /></PremiumGuard>} />
              <Route path="/logistics-bourse" element={<PremiumGuard><LogisticsBourse /></PremiumGuard>} />
              <Route path="/fleet-market" element={<PremiumGuard><FleetManagement /></PremiumGuard>} /> 
              <Route path="/market-orders" element={<PremiumGuard><MarketplaceOrders /></PremiumGuard>} />
            </>
          )}

          {/* 🎯 التوجيه التلقائي (Catch-all) */}
          <Route path="*" element={
            accountType === 'contractor' ? <Navigate to="/contractor-dashboard" replace /> :
            accountType === 'architect' ? <Navigate to="/architect-overview" replace /> :
            accountType === 'artisan' ? <Navigate to="/artisan-home" replace /> :
            <Navigate to="/" replace />
          } />

        </Routes>
      </UniversalLayout>
    </BrowserRouter>
  );
}