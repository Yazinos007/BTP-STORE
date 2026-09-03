import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { 
  Menu, X, Package, Truck, FileSignature, BarChart3, LogOut, Bell, Layers, FileText, Calculator, Users, Receipt, Sparkles, LayoutDashboard, 
  Settings, Zap, Radar, Wallet, Landmark, CreditCard, Globe, ShoppingCart, Factory, ShoppingBag, ChevronDown, Store, Briefcase, ArrowRightLeft, Lock
} from 'lucide-react';

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
import SupplierProduction from './pages/SupplierProduction';
import MarketplaceOrders from './pages/MarketplaceOrders';
import FleetManagement from './pages/FleetManagement';
import LogisticsBourse from './pages/LogisticsBourse';

// 🚀 شريط الفترة التجريبية
import TrialBanner from './components/TrialBanner';

import useSupplierStore from './store/useSupplierStore';
import useSettingsStore from './store/useSettingsStore';

// 🛑 الحارس الإلكتروني (الجدار الزجاجي) للأقسام المدفوعة
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
        <h2 className="text-3xl md:text-4xl font-black text-white">
          {language === 'ar' ? 'عذراً، انتهت الفترة التجريبية!' : 'Période d\'essai expirée !'}
        </h2>
        <p className="text-slate-400 max-w-lg text-lg font-medium leading-relaxed">
          {language === 'ar' 
            ? 'لقد انتهت صلاحية استخدامك المجاني لهذه الميزة الحصرية. قم بالترقية الآن لباقة Pro ERP لاستعادة الوصول فوراً ومضاعفة أرباحك.' 
            : 'Votre accès gratuit à cette fonctionnalité a expiré. Mettez à niveau vers Pro ERP pour y accéder à nouveau et sécuriser vos marges.'}
        </p>
        <button 
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-4 rounded-xl font-black text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20 mt-4"
        >
          <Zap size={24} className="fill-black" />
          {language === 'ar' ? 'ترقية الحساب الآن' : 'Mettre à niveau maintenant'}
        </button>
      </div>
    );
  }
  return children;
};

// 🛡️ لوحة المورد الكبير المحصنة
const WholesalerDashboard = ({ supplier, children }) => {
  const { language, setLanguage } = useSettingsStore();
  const location = useLocation();
  
  const isMinimal = window.location.href.includes('minimal=true');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const [openMenus, setOpenMenus] = useState({
    achats: false,
    marketplace: false,
    ventes: false
  });

  useEffect(() => {
    const p = location.pathname;
    if (['/raw-suppliers', '/raw-purchases'].includes(p)) setOpenMenus(prev => ({...prev, achats: true}));
    if (['/market-orders', '/fleet-market'].includes(p)) setOpenMenus(prev => ({...prev, marketplace: true}));
    if (['/clients', '/pos-b2b', '/orders', '/fleet-b2b', '/contracts'].includes(p)) setOpenMenus(prev => ({...prev, ventes: true}));
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMinimal) {
    return (
      <div className="flex h-screen w-full bg-[#0f172a] text-slate-300 font-sans overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 w-full">
          {children}
        </main>
      </div>
    );
  }

  const handleLanguageChange = () => {
    if (language === 'fr') setLanguage('ar');
    else if (language === 'ar') setLanguage('en');
    else setLanguage('fr');
  };

  const tLayout = {
    fr: { 
      upgrade: "Passer à l'Enterprise", logout: "Déconnexion", portal: "Espace Fournisseur B2B", online: "Système en ligne", wholesaler: "Grossiste", 
      groups: { achats: "Achats & Fournisseurs", marketplace: "Gestion Marketplace", ventes: "Gestion des Ventes" },
      items: { overview: "Tableau de bord", rawSuppliers: "Fournisseurs & Prestataires", rawPurchases: "Achats & Approvisionnement", stock: "Stock Central", production: "Production", marketOrders: "Commandes Marketplace", fleetMarket: "Suivi des Commandes", clients: "Clients & Dettes", posB2B: "Ventes Directes (POS)", orders: "Commandes Reçues (B2B)", fleetB2B: "Suivi des Commandes (B2B)", contracts: "Contrats & Signatures", invoices: "Factures B2B", hr: "Ressources Humaines", caisses: "Caisses & Banques", expenses: "Gestion des Charges", fiscal: "Système Fiscal", accounting: "Comptabilité & Bilan", analytics: "Analytiques B2B", ai: "Conseiller Stratégique (IA)", radar: "Radar d'Appels d'Offres", logisticsBourse: "Bourse de Fret", team: "Utilisateurs & Permissions", settings: "Paramètres & Confiance" } 
    },
    ar: { 
      upgrade: "ترقية للباقة الذهبية", logout: "تسجيل الخروج", portal: "بوابة المورد الكبير", online: "النظام متصل", wholesaler: "مورد جملة", 
      groups: { achats: "المشتريات والموردون", marketplace: "إدارة الماركت بليس", ventes: "إدارة المبيعات" },
      items: { overview: "لوحة القيادة", rawSuppliers: "الموردون والشركاء", rawPurchases: "المشتريات والتوريد", stock: "المخزون المركزي", production: "الإنتاج (المعمل)", marketOrders: "طلبات الماركت بليس", fleetMarket: "تتبع شحنات المتجر", clients: "العملاء والديون (CRM)", posB2B: "المبيعات المباشرة (POS)", orders: "طلبات التزويد (B2B)", fleetB2B: "تتبع شحنات التزويد", contracts: "العقود والتوقيعات", invoices: "الفواتير الكبرى", hr: "الموارد البشرية", caisses: "الصناديق والحسابات", expenses: "إدارة المصاريف", fiscal: "النظام الجبائي (TVA)", accounting: "المحاسبة والـ CPC", analytics: "التحليلات الكبرى", ai: "المستشار الذكي (IA)", radar: "رادار المناقصات", logisticsBourse: "بورصة اللوجستيك", team: "المستخدمون والصلاحيات", settings: "الإعدادات والتوثيق" } 
    },
    en: { 
      upgrade: "Upgrade to Enterprise", logout: "Logout", portal: "Wholesale B2B Portal", online: "System Online", wholesaler: "Wholesaler", 
      groups: { achats: "Purchases & Suppliers", marketplace: "Marketplace Management", ventes: "Sales Management" },
      items: { overview: "Dashboard", rawSuppliers: "Suppliers & Partners", rawPurchases: "Purchases & Procurement", stock: "Central Stock", production: "Production", marketOrders: "Marketplace Orders", fleetMarket: "Order Tracking", clients: "Clients & Debts", posB2B: "Direct Sales (POS)", orders: "Received Orders (B2B)", fleetB2B: "B2B Tracking", contracts: "Contracts & Signatures", invoices: "B2B Invoices", hr: "Human Resources", caisses: "Banks & Registers", expenses: "Expenses Management", fiscal: "Tax System (VAT)", accounting: "Accounting & CPC", analytics: "B2B Analytics", ai: "AI Strategic Advisor", radar: "Tender Radar", logisticsBourse: "Freight Exchange",team: "Users & Permissions", settings: "Settings & Trust" } 
    }
  };
  const t = tLayout[language] || tLayout['fr'];
  
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [readyToShipCount, setReadyToShipCount] = useState(0);

  useEffect(() => {
    if (!supplier?.id) return;
    const syncSmartData = async () => {
      const { data: orders } = await supabase.from('supply_requests').select('status, merchant_id').eq('supplier_id', supplier.id);
      if (orders) {
        setPendingOrdersCount(orders.filter(o => o.status === 'pending').length);
        setReadyToShipCount(orders.filter(o => o.status === 'signed').length);
      }
    };
    syncSmartData();
    const channel = supabase.channel('wholesaler-smart-radar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supply_requests', filter: `supplier_id=eq.${supplier.id}` }, () => {
        syncSmartData();
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [supplier]);
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t.items.overview },
    {
      id: 'achats', icon: ShoppingBag, label: t.groups.achats,
      children: [
        { path: '/raw-suppliers', icon: Users, label: t.items.rawSuppliers },
        { path: '/raw-purchases', icon: Receipt, label: t.items.rawPurchases },
      ]
    },
    { path: '/stock', icon: Layers, label: t.items.stock },
    { path: '/production', icon: Factory, label: t.items.production }, 
    {
      id: 'marketplace', icon: Store, label: t.groups.marketplace,
      children: [
        { path: '/market-orders', icon: ShoppingBag, label: t.items.marketOrders },
        { path: '/fleet-market', icon: Truck, label: t.items.fleetMarket }, 
      ]
    },
    {
      id: 'ventes', icon: Briefcase, label: t.groups.ventes,
      children: [
        { path: '/clients', icon: Users, label: t.items.clients },
        { path: '/pos-b2b', icon: ShoppingCart, label: t.items.posB2B }, 
        { path: '/orders', icon: Package, label: t.items.orders, badge: pendingOrdersCount },
        { path: '/fleet-b2b', icon: Truck, label: t.items.fleetB2B, badge: readyToShipCount },  
        { path: '/contracts', icon: FileSignature, label: t.items.contracts },
      ]
    },
    { path: '/invoices', icon: FileText, label: t.items.invoices },
    { path: '/hr', icon: Users, label: t.items.hr },
    { path: '/caisses', icon: Wallet, label: t.items.caisses },
    { path: '/expenses', icon: Receipt, label: t.items.expenses },
    { path: '/fiscal', icon: Landmark, label: t.items.fiscal },
    { path: '/accounting', icon: Calculator, label: t.items.accounting },
    { path: '/analytics', icon: BarChart3, label: t.items.analytics },
    { path: '/ai-advisor', icon: Sparkles, label: t.items.ai },
    { path: '/tender-radar', icon: Radar, label: t.items.radar },
    { path: '/logistics-bourse', icon: ArrowRightLeft, label: t.items.logisticsBourse },
    { path: '/team', icon: Users, label: t.items.team },
    { path: '/settings', icon: Settings, label: t.items.settings }
  ];

  const getActiveStyle = (path) => {
    const isActive = location.pathname === path;
    if (!isActive) return "text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent";
    
    if (['/clients', '/pos-b2b', '/orders', '/fleet-b2b', '/contracts'].includes(path)) 
      return "bg-blue-600/20 text-blue-400 border border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.35)] animate-pulse";
    
    if (['/market-orders', '/fleet-market'].includes(path)) 
      return "bg-purple-600/20 text-purple-400 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-pulse";
    
    if (['/raw-suppliers', '/raw-purchases', '/stock', '/production'].includes(path)) 
      return "bg-emerald-600/20 text-emerald-400 border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-pulse";

    if (['/invoices', '/caisses', '/expenses', '/fiscal', '/accounting'].includes(path)) 
      return "bg-orange-600/20 text-orange-400 border border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.35)] animate-pulse";

    if (['/hr', '/team'].includes(path)) 
      return "bg-pink-600/20 text-pink-400 border border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.35)] animate-pulse";

    if (['/analytics', '/ai-advisor', '/tender-radar', '/logistics-bourse'].includes(path)) 
      return "bg-cyan-600/20 text-cyan-400 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.35)] animate-pulse";

    if (path === '/settings') 
      return "bg-slate-700/50 text-slate-300 border border-slate-500/60 shadow-[0_0_20px_rgba(148,163,184,0.35)] animate-pulse";
    
    return "bg-indigo-600/20 text-indigo-400 border border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.35)] animate-pulse";
  };

  const toggleMenu = (id) => {
    setOpenMenus(prev => ({...prev, [id]: !prev[id]}));
  };

  return (
    <div className="flex h-screen w-full max-w-full bg-[#0f172a] text-slate-300 font-sans overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <aside className={`shrink-0 h-full bg-slate-900 flex flex-col shadow-2xl transition-all duration-300 ease-in-out absolute md:relative z-30 ${isSidebarOpen ? 'w-72 border-r border-slate-800 opacity-100 translate-x-0' : 'w-0 border-r-0 opacity-0 overflow-hidden'}`}>
        <div className="w-72 h-full flex flex-col">
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
                <h1 className="text-xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent leading-tight">SouqBTP</h1>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal</span>
              </div>
            </div>
            <button onClick={handleLanguageChange} className="flex flex-col items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all text-slate-300 hover:text-white group cursor-pointer">
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
          
          <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-24">
            {menuItems.map((item) => {
              if (item.children) {
                const isOpen = openMenus[item.id];
                return (
                  <div key={item.id} className="space-y-1 pt-1">
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all hover:bg-slate-800 text-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className="text-slate-400 shrink-0" />
                        <span className="text-sm uppercase tracking-wider">{item.label}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className={`py-1 space-y-1 border-slate-800 ${language === 'ar' ? 'mr-6 border-r-2 pr-4' : 'ml-6 border-l-2 pl-4'}`}>
                        {item.children.map(child => {
                          const isChildActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => { if(window.innerWidth <= 768) setIsSidebarOpen(false); }}
                              className={`flex items-center justify-between px-4 py-2.5 rounded-lg font-bold transition-all text-sm group ${getActiveStyle(child.path)}`}
                            >
                               <div className="flex items-center gap-3">
                                <child.icon size={18} className={`${isChildActive ? 'text-current' : 'text-slate-500 group-hover:text-blue-400'} transition-transform shrink-0`} />
                                <span>{child.label}</span>
                               </div>
                               {child.badge > 0 && (
                                 <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]">{child.badge}</span>
                               )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => { if(window.innerWidth <= 768) setIsSidebarOpen(false); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all group ${getActiveStyle(item.path)}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={`${isActive ? 'text-current scale-110' : 'text-slate-400 group-hover:text-blue-400'} transition-transform shrink-0`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {isSidebarOpen && window.innerWidth <= 768 && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 w-full max-w-full">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <header className="h-20 shrink-0 w-full border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all shadow-sm group"
            >
              {isSidebarOpen ? <X size={22} className="text-red-400 group-hover:text-red-300 transition-colors" /> : <Menu size={22} className="text-blue-400 group-hover:text-blue-300 transition-colors" />}
              
              <span className="hidden sm:block text-[11px] font-black tracking-wide">
                {isSidebarOpen 
                  ? (language === 'ar' ? 'إخفاء' : language === 'en' ? 'Close' : 'Fermer') 
                  : (language === 'ar' ? 'القائمة' : language === 'en' ? 'Menu' : 'Menu')
                }
              </span>
            </button>
            <div className="truncate pr-1 text-start">
              <h2 className="text-lg md:text-xl font-bold text-white truncate">{t.portal}</h2>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                {t.online}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className={`flex items-center gap-3 ${language === 'ar' ? 'pr-3 md:pr-6 border-r' : 'pl-3 md:pl-6 border-l'} border-slate-700`}>
              <div className="text-end hidden sm:block">
                <p className="text-sm font-bold text-white">{supplier?.store_name}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{t.wholesaler}</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 border border-white/10">
                {supplier?.store_name?.charAt(0).toUpperCase() || 'W'}
              </div>
            </div>
          </div>
        </header>
        
        {/* ⏳ شريط الفترة التجريبية */}
        <TrialBanner />
        
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10 w-full max-w-full relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  const [isMinimal] = useState(() => window.location.search.includes('minimal=true') || window.location.href.includes('minimal=true'));
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { language, setLanguage } = useSettingsStore();
  const { supplier, fetchSupplierProfile } = useSupplierStore();

  const isStorePage = window.location.pathname.startsWith('/store') || window.location.search.includes('vendor');

  useEffect(() => {
    let mounted = true;

    const forgeSession = async () => {
      try {
        const hash = window.location.hash;
        
        if (hash && hash.includes('access_token') && hash.includes('refresh_token')) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            }).catch(() => {});

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
        console.error("❌ فشل:", err);
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

  // 🚀 استثناء صفحة الهبوط لتكون عامة وتظهر للجميع القادمين من الإعلانات
  const isEmpireLanding = window.location.pathname === '/empire';

  if (isEmpireLanding) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/empire" element={<EmpireLanding />} />
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

  if (isMinimal) {
    return (
      <BrowserRouter>
        <div className={`w-full min-h-screen overflow-x-hidden overflow-y-auto p-4 md:p-6 ${isWholesaler ? 'bg-[#0f172a] text-slate-300' : 'bg-gray-50 text-gray-800'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <Routes>
            <Route path="/" element={isWholesaler ? <SupplierOverview /> : <Overview />} />
            <Route path="/settings" element={isWholesaler ? <SupplierSettings /> : <RetailerSettings />} />
            <Route path="*" element={isWholesaler ? <SupplierOverview /> : <Overview />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      {isWholesaler ? (
        <WholesalerDashboard supplier={supplier}>
          <Routes>
            {/* ✅ أقسام باقة Starter (مجانية ودائمة) */}
            <Route path="/" element={<SupplierOverview />} />
            <Route path="/stock" element={<SupplierStock isWholesaler={true} />} />
            <Route path="/invoices" element={<SupplierInvoices />} />
            <Route path="/raw-suppliers" element={<RawMaterialSuppliers />} />
            <Route path="/raw-purchases" element={<RawMaterialPurchases />} />
            <Route path="/pos-b2b" element={<SupplierPOS />} />
            <Route path="/orders" element={<SupplierOrders />} />
            <Route path="/settings" element={<SupplierSettings />} />
            <Route path="/subscription" element={<SupplierSubscription />} />
            <Route path="/empire" element={<EmpireLanding />} />

            {/* 🔒 أقسام باقة Pro ERP (تُقفل بعد 7 أيام) */}
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

            {/* 🛑 أقسام باقة Enterprise (تُقفل بعد 7 أيام) */}
            <Route path="/analytics" element={<PremiumGuard><AnalyticsB2B /></PremiumGuard>} />
            <Route path="/ai-advisor" element={<PremiumGuard><AISmartAdvisor /></PremiumGuard>} />
            <Route path="/tender-radar" element={<PremiumGuard><TenderRadar /></PremiumGuard>} />
            <Route path="/logistics-bourse" element={<PremiumGuard><LogisticsBourse /></PremiumGuard>} />
            <Route path="/fleet-market" element={<PremiumGuard><FleetManagement /></PremiumGuard>} /> 
            <Route path="/market-orders" element={<PremiumGuard><MarketplaceOrders /></PremiumGuard>} />
          </Routes>
        </WholesalerDashboard>
      ) : (
        <RetailerLayout storeName={storeName} storeInitial={storeInitial} language={language}>
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
        </RetailerLayout>
      )}
    </BrowserRouter>
  );
}

// 💎 مكون التاجر الداعم لإخفاء السيدبار السلس
const RetailerLayout = ({ storeName, storeInitial, language, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full max-w-full bg-gray-50 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`shrink-0 h-full transition-all duration-300 ${isSidebarOpen ? (language === 'ar' ? 'w-64 border-l' : 'w-64 border-r') : 'w-0 overflow-hidden border-none'} bg-white z-20`}>
        <div className="w-64 h-full">
            <Sidebar />
        </div>
      </div>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full max-w-full relative">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0 w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="flex items-center gap-2 p-2 bg-gray-100 hover:bg-blue-50 border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 transition-all shadow-sm group"
            >
              {isSidebarOpen ? <X size={22} className="text-red-500 group-hover:text-red-600 transition-colors" /> : <Menu size={22} className="text-blue-500 group-hover:text-blue-600 transition-colors" />}
              
              <span className="hidden sm:block text-[11px] font-black tracking-wide">
                {isSidebarOpen 
                  ? (language === 'ar' ? 'إخفاء' : language === 'en' ? 'Close' : 'Fermer') 
                  : (language === 'ar' ? 'القائمة' : language === 'en' ? 'Menu' : 'Menu')
                }
              </span>
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate text-start">
              {language === 'fr' ? 'Bienvenue, ' : language === 'en' ? 'Welcome, ' : 'مرحباً بك، '} <span className="text-blue-600 truncate">{storeName}</span>
            </h2>
          </div>
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
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
export default App;