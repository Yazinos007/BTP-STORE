import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { 
  Menu, X, Package, Truck, FileSignature, BarChart3, Layers, FileText, Calculator, Users, Receipt, Sparkles, LayoutDashboard, 
  Settings, Zap, Radar, Wallet, Landmark, Globe, ShoppingCart, Factory, ShoppingBag, ChevronDown, Store, Briefcase, ArrowRightLeft, Lock, MessageCircle, Trophy, PlusCircle, Loader2
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
import UnifiedMessages from './pages/v2/shared/UnifiedMessages';
import BTPHub from './pages/v2/BTPHub';

import AffiliateDashboard from './pages/v2/AffiliateDashboard';

import TrialBanner from './components/TrialBanner'; 
import RetailTrialBanner from './components/RetailTrialBanner'; 
import useSupplierStore from './store/useSupplierStore';
import useSettingsStore from './store/useSettingsStore';
import V2Router from './pages/v2/V2Router';

import EmpireLanding from './landing-pages/EmpireLanding';
import RetailLanding from './landing-pages/RetailLanding';
import ContractorLanding from './landing-pages/ContractorLanding';
import CostCalculatorLanding from './landing-pages/CostCalculatorLanding'; 
import ClientPortal from './landing-pages/ClientPortal';

// 🧲 رادار التقاط كود الإحالة تلقائياً من الرابط في جميع الصفحات
function ReferralTracker() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    
    if (refCode && refCode.startsWith('SAS-')) {
      localStorage.setItem('sasbtp_referral_code', refCode.trim().toUpperCase());
      localStorage.setItem('sasbtp_referral_date', new Date().toISOString());
    }
  }, [location]);

  return null;
}

// 🚀 مكون مبدل الفضاءات الموحد والذكي (يعرض الفضاءات المفعلة ويستثني الفضاء الحالي)
const GlobalSpaceSwitcher = ({ language, dark = false, currentSpace = 'retail' }) => {
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [ownedIds, setOwnedIds] = useState([]);
  const [activating, setActivating] = useState(null);
  const isRtl = language === 'ar';

  const labels = {
    ar: {
      btn: 'تبديل الفضاء',
      addBtn: 'فتح فضاء آخر',
      activeHeader: 'فضاءاتك المفعلة (انتقال فوري)',
      expandHint: 'يمكنك تفعيل حساب إضافي بنفس بريدك الحالي والتنقل بينها بضغطة زر:',
      addLink: '+ تفعيل فضاء مهني إضافي',
      contractor: '🏗️ فضاء المقاول العام',
      architect: '📐 مكتب المهندس المعماري',
      provider: '👷‍♂️ فضاء الحرفي المعتمد',
      retail: '🏪 فضاء تاجر التجزئة',
      wholesale: '🏭 فضاء مورد الجملة'
    },
    fr: {
      btn: 'Changer d\'Espace',
      addBtn: 'Ajouter un Espace',
      activeHeader: 'Vos espaces actifs',
      expandHint: 'Vous pouvez ouvrir un autre espace professionnel avec votre compte actuel :',
      addLink: '+ Activer un nouvel espace',
      contractor: '🏗️ Espace Entrepreneur',
      architect: '📐 Bureau d\'Architecte',
      provider: '👷‍♂️ Espace Artisan Pro',
      retail: '🏪 Espace Détaillant',
      wholesale: '🏭 Espace Grossiste B2B'
    },
    en: {
      btn: 'Switch Space',
      addBtn: 'Add Space',
      activeHeader: 'Your Active Spaces',
      expandHint: 'You can activate another professional space under your current account:',
      addLink: '+ Activate another space',
      contractor: '🏗️ Contractor Hub',
      architect: '📐 Architect Office',
      provider: '👷‍♂️ Artisan Space',
      retail: '🏪 Retailer Store',
      wholesale: '🏭 Wholesaler B2B'
    }
  }[language] || {};

  const allSpaces = [
    { id: 'contractor', label: labels.contractor, path: '/v2/contractor-dashboard', badge: 'V2' },
    { id: 'architect', label: labels.architect, path: '/v2/architect-dashboard', badge: 'VIP' },
    { id: 'provider', label: labels.provider, path: '/v2/provider-dashboard', badge: 'PRO' },
    { id: 'retail', label: labels.retail, path: '/?preview=retail', badge: 'POS' },
    { id: 'wholesale', label: labels.wholesale, path: '/?preview=wholesale', badge: 'B2B' }
  ];

  useEffect(() => {
    const fetchUserSpaces = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.email === 'admin@souqbtp.ma') {
        setOwnedIds(['contractor', 'architect', 'provider', 'retail', 'wholesale']);
        return;
      }

      const owned = new Set(user.user_metadata?.enabled_spaces || []);
      owned.add(currentSpace);

      const metaRole = user.user_metadata?.role || user.user_metadata?.account_type;
      if (metaRole === 'contractor' || metaRole === 'client') owned.add('contractor');
      if (metaRole === 'architect') owned.add('architect');
      if (metaRole === 'provider') owned.add('provider');

      // استخدام استعلامات آمنة لا تفشل عند وجود أكثر من سجل
      const [archRes, provRes, supRes] = await Promise.all([
        supabase.from('architects').select('id').eq('user_id', user.id).limit(1),
        supabase.from('providers').select('id').eq('user_id', user.id).limit(1),
        supabase.from('suppliers').select('id, supplier_type').eq('user_id', user.id)
      ]);

      if (archRes.data && archRes.data.length > 0) owned.add('architect');
      if (provRes.data && provRes.data.length > 0) owned.add('provider');
      if (supRes.data && supRes.data.length > 0) {
        supRes.data.forEach(s => {
          if (s.supplier_type === 'wholesale') owned.add('wholesale');
          else owned.add('retail');
        });
      }

      setOwnedIds(Array.from(owned));
    };

    fetchUserSpaces();
  }, [currentSpace, language]);

  const otherOwned = allSpaces.filter(sp => ownedIds.includes(sp.id) && sp.id !== currentSpace);
  const uncreated = allSpaces.filter(sp => !ownedIds.includes(sp.id) && sp.id !== currentSpace);

  const handleSwitch = (path) => {
    setOpen(false);
    window.location.href = path;
  };

  const handleActivate = async (sp) => {
    try {
      setActivating(sp.id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updated = Array.from(new Set([...ownedIds, currentSpace, sp.id]));
      await supabase.auth.updateUser({ data: { enabled_spaces: updated } });

      const defaultName = user.user_metadata?.company_name || user.user_metadata?.full_name || 'SasBTP Pro';
      const defaultPhone = user.user_metadata?.phone || '';

      if (sp.id === 'architect') {
        const { data: ex } = await supabase.from('architects').select('id').eq('user_id', user.id).limit(1);
        if (!ex || ex.length === 0) {
          await supabase.from('architects').insert([{ user_id: user.id, full_name: defaultName, email: user.email, phone: defaultPhone, agency_name: defaultName, specialty: 'Architect', subscription_plan: 'basic' }]);
        }
      } else if (sp.id === 'provider') {
        const { data: ex } = await supabase.from('providers').select('id').eq('user_id', user.id).limit(1);
        if (!ex || ex.length === 0) {
          await supabase.from('providers').insert([{ user_id: user.id, full_name: defaultName, phone: defaultPhone || `06${Math.floor(10000000 + Math.random() * 90000000)}`, account_type: 'marketplace' }]);
        }
      } else if (sp.id === 'retail' || sp.id === 'wholesale') {
        const { data: ex } = await supabase.from('suppliers').select('id').eq('user_id', user.id).eq('supplier_type', sp.id).limit(1);
        if (!ex || ex.length === 0) {
          await supabase.from('suppliers').insert([{ user_id: user.id, store_name: defaultName, email: user.email, phone: defaultPhone, supplier_type: sp.id }]);
        }
      }

      setOwnedIds(updated);
      handleSwitch(sp.path);
    } catch (e) {
      console.error(e);
    } finally {
      setActivating(null);
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => { setOpen(!open); setShowAdd(otherOwned.length === 0); }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-2 md:px-4 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all whitespace-nowrap cursor-pointer"
      >
        {otherOwned.length > 0 ? <Layers size={16} /> : <PlusCircle size={16} />}
        <span>{otherOwned.length > 0 ? labels.btn : labels.addBtn}</span>
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-72 rounded-2xl shadow-2xl border p-2 z-50 ${
            dark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'
          }`}>
            {otherOwned.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-[11px] font-black text-purple-500 uppercase tracking-wider">{labels.activeHeader}</div>
                {otherOwned.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => handleSwitch(it.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all mb-1 last:mb-0 cursor-pointer ${
                      dark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-purple-50 hover:text-purple-700 text-slate-700'
                    }`}
                  >
                    <span>{it.label}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      {it.badge}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {uncreated.length > 0 && (
              <div className={otherOwned.length > 0 ? 'border-t border-slate-700/20 pt-2 mt-1' : ''}>
                {!showAdd && otherOwned.length > 0 ? (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-black text-cyan-500 hover:bg-cyan-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>{labels.addLink}</span>
                  </button>
                ) : (
                  <div className="space-y-1.5 p-1">
                    <div className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-[11px] font-bold text-purple-400 leading-relaxed">{labels.expandHint}</p>
                    </div>
                    {uncreated.map((sp) => (
                      <button
                        key={sp.id}
                        disabled={activating === sp.id}
                        onClick={() => handleActivate(sp)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border border-dashed transition-all cursor-pointer ${
                          dark ? 'border-slate-700 hover:border-purple-500 hover:bg-slate-800 text-slate-300' : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50 text-slate-700'
                        }`}
                      >
                        <span>{sp.label}</span>
                        {activating === sp.id ? (
                          <Loader2 size={14} className="animate-spin text-purple-500" />
                        ) : (
                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            + تفعيل
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// 🛑 الحارس الإلكتروني للأقسام المدفوعة
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
  }[language] || { title: 'Sorry, Trial Expired!', desc: 'Upgrade to Pro ERP now to restore access.', btn: 'Upgrade Account Now' };

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

// 🛡️ لوحة المورد الكبير المحصنة
const WholesalerDashboard = ({ supplier, storeName, storeInitial, children }) => {
  const { language, setLanguage } = useSettingsStore();
  const location = useLocation();
  
  const isMinimal = window.location.href.includes('minimal=true') || window.location.search.includes('minimal=true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const [openMenus, setOpenMenus] = useState({
    comm_market: false,
    achats: false,
    marketplace: false,
    ventes: false
  });

  useEffect(() => {
    const p = location.pathname;
    if (['/messages', '/marketplace'].includes(p)) setOpenMenus(prev => ({...prev, comm_market: true}));
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
      upgrade: "Passer à l'Enterprise", affiliates: "Partenaires", logout: "Déconnexion", portal: "Espace Fournisseur B2B", online: "Système en ligne", wholesaler: "Grossiste", 
      groups: { comm: "Communication & Marché", achats: "Achats & Fournisseurs", marketplace: "Gestion Marketplace", ventes: "Gestion des Ventes" },
      items: { overview: "Tableau de bord", inbox: "Boîte de Réception", btpMarket: "Marché BTP", rawSuppliers: "Fournisseurs & Prestataires", rawPurchases: "Achats & Approvisionnement", stock: "Stock Central", production: "Production", marketOrders: "Commandes Marketplace", fleetMarket: "Suivi des Commandes", clients: "Clients & Dettes", posB2B: "Ventes Directes (POS)", orders: "Commandes Reçues (B2B)", fleetB2B: "Suivi des Commandes (B2B)", contracts: "Contrats & Signatures", invoices: "Factures B2B", hr: "Ressources Humaines", caisses: "Caisses & Banques", expenses: "Gestion des Charges", fiscal: "Système Fiscal", accounting: "Comptabilité & Bilan", analytics: "Analytiques B2B", ai: "Conseiller Stratégique (IA)", radar: "Radar d'Appels d'Offres", logisticsBourse: "Bourse de Fret", team: "Utilisateurs & Permissions", settings: "Paramètres & Confiance" } 
    },
    ar: { 
      upgrade: "ترقية للباقة الذهبية", affiliates: "شركاء النجاح", logout: "تسجيل الخروج", portal: "بوابة المورد الكبير", online: "النظام متصل", wholesaler: "مورد جملة", 
      groups: { comm: "التواصل والسوق", achats: "المشتريات والموردون", marketplace: "إدارة الماركت بليس", ventes: "إدارة المبيعات" },
      items: { overview: "لوحة القيادة", inbox: "صندوق الرسائل", btpMarket: "سوق BTP", rawSuppliers: "الموردون والشركاء", rawPurchases: "المشتريات والتوريد", stock: "المخزون المركزي", production: "الإنتاج (المعمل)", marketOrders: "طلبات الماركت بليس", fleetMarket: "تتبع شحنات المتجر", clients: "العملاء والديون (CRM)", posB2B: "المبيعات المباشرة (POS)", orders: "طلبات التزويد (B2B)", fleetB2B: "تتبع شحنات التزويد", contracts: "العقود والتوقيعات", invoices: "الفواتير الكبرى", hr: "الموارد البشرية", caisses: "الصناديق والحسابات", expenses: "إدارة المصاريف", fiscal: "النظام الجبائي (TVA)", accounting: "المحاسبة والـ CPC", analytics: "التحليلات الكبرى", ai: "المستشار الذكي (IA)", radar: "رادار المناقصات", logisticsBourse: "بورصة اللوجستيك", team: "المستخدمون والصلاحيات", settings: "الإعدادات والتوثيق" } 
    },
    en: { 
      upgrade: "Upgrade to Enterprise", affiliates: "Affiliates", logout: "Logout", portal: "Wholesale B2B Portal", online: "System Online", wholesaler: "Wholesaler", 
      groups: { comm: "Communication & Market", achats: "Purchases & Suppliers", marketplace: "Marketplace Management", ventes: "Sales Management" },
      items: { overview: "Dashboard", inbox: "Inbox", btpMarket: "BTP Marketplace", rawSuppliers: "Suppliers & Partners", rawPurchases: "Purchases & Procurement", stock: "Central Stock", production: "Production", marketOrders: "Marketplace Orders", fleetMarket: "Order Tracking", clients: "Clients & Debts", posB2B: "Direct Sales (POS)", orders: "Received Orders (B2B)", fleetB2B: "B2B Tracking", contracts: "Contracts & Signatures", invoices: "B2B Invoices", hr: "Human Resources", caisses: "Banks & Registers", expenses: "Expenses Management", fiscal: "Tax System (VAT)", accounting: "Accounting & CPC", analytics: "B2B Analytics", ai: "AI Strategic Advisor", radar: "Tender Radar", logisticsBourse: "Freight Exchange", team: "Users & Permissions", settings: "Settings & Trust" } 
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
      id: 'comm_market', icon: MessageCircle, label: t.groups.comm,
      children: [
        { path: '/messages', icon: MessageCircle, label: t.items.inbox },
        { path: '/marketplace', icon: Store, label: t.items.btpMarket },
      ]
    },
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
    if (['/messages', '/marketplace'].includes(path)) 
      return "bg-emerald-600/20 text-emerald-400 border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-pulse";
    return "bg-indigo-600/20 text-indigo-400 border border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.35)]";
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
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg border border-white/10">
                {storeInitial}
              </div>
              <div className="flex flex-col text-start">
                <h1 className="text-xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent leading-tight">SasBTP</h1>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal</span>
              </div>
            </div>
            <button onClick={handleLanguageChange} className="flex flex-col items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all text-slate-300 hover:text-white group cursor-pointer">
              <Globe size={18} />
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
                    <button onClick={() => toggleMenu(item.id)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all hover:bg-slate-800 text-slate-300">
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className="text-slate-400 shrink-0" />
                        <span className="text-sm uppercase tracking-wider">{item.label}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className={`py-1 space-y-1 border-slate-800 ${language === 'ar' ? 'mr-6 border-r-2 pr-4' : 'ml-6 border-l-2 pl-4'}`}>
                        {item.children.map(child => (
                          <Link key={child.path} to={child.path} onClick={() => { if(window.innerWidth <= 768) setIsSidebarOpen(false); }} className={`flex items-center justify-between px-4 py-2.5 rounded-lg font-bold transition-all text-sm group ${getActiveStyle(child.path)}`}>
                            <div className="flex items-center gap-3">
                              <child.icon size={18} className="text-slate-500 group-hover:text-blue-400 shrink-0" />
                              <span>{child.label}</span>
                            </div>
                            {child.badge > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{child.badge}</span>}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <Link key={item.path} to={item.path} onClick={() => { if(window.innerWidth <= 768) setIsSidebarOpen(false); }} className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all group ${getActiveStyle(item.path)}`}>
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-slate-400 group-hover:text-blue-400 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 w-full max-w-full">
        {/* 📌 رفع الـ z-index إلى z-50 لمنع الشريط الأحمر من تغطية القائمة المنسدلة */}
        <header className="h-20 shrink-0 w-full border-b border-slate-800/60 bg-slate-900/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer">
              {isSidebarOpen ? <X size={22} className="text-red-400" /> : <Menu size={22} className="text-blue-400" />}
            </button>
            <div className="truncate pr-1 text-start">
              <h2 className="text-lg md:text-xl font-bold text-white truncate">{t.portal}</h2>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                {t.online}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link to="/affiliates" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-3 py-2 md:px-4 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap text-xs md:text-sm">
              <Trophy size={16} /> <span className="hidden sm:inline">{t.affiliates}</span>
            </Link>

            <GlobalSpaceSwitcher language={language} dark={true} currentSpace="wholesale" />

            <div className={`flex items-center gap-3 ${language === 'ar' ? 'pr-3 md:pr-6 border-r' : 'pl-3 md:pl-6 border-l'} border-slate-700`}>
              <div className="text-end hidden sm:block">
                <p className="text-sm font-bold text-white">{storeName}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{t.wholesaler}</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                {storeInitial}
              </div>
            </div>
          </div>
        </header>
        <div className="relative z-10">
          <TrialBanner />
        </div>
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10 w-full max-w-full relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

// 💎 مكون التاجر الداعم لمبدل الفضاءات الشامل
const RetailerLayout = ({ storeName, storeInitial, language, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const isMinimal = window.location.search.includes('minimal=true') || window.location.href.includes('minimal=true');

  if (isMinimal) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50 text-gray-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <RetailTrialBanner />
      <div className="flex h-screen w-full max-w-full bg-gray-50 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`shrink-0 h-full transition-all duration-300 ${isSidebarOpen ? (language === 'ar' ? 'w-64 border-l' : 'w-64 border-r') : 'w-0 overflow-hidden border-none'} bg-white z-20`}>
          <div className="w-64 h-full"><Sidebar /></div>
        </div>
        
        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full max-w-full relative">
          <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0 w-full z-50">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="flex items-center gap-2 p-2 bg-gray-100 hover:bg-blue-50 border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 transition-all cursor-pointer">
                {isSidebarOpen ? <X size={22} className="text-red-500" /> : <Menu size={22} className="text-blue-500" />}
              </button>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate text-start">
                {language === 'fr' ? 'Bienvenue, ' : language === 'en' ? 'Welcome, ' : 'مرحباً بك، '} <span className="text-blue-600 truncate">{storeName}</span>
              </h2>
            </div>

            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <Link to="/affiliates" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-3 py-2 md:px-4 rounded-xl font-black flex items-center gap-2 shadow-md transition-all whitespace-nowrap text-xs md:text-sm">
                <Trophy size={16} /> <span className="hidden sm:inline">{language === 'fr' ? 'Partenaires' : language === 'en' ? 'Affiliates' : 'شركاء النجاح'}</span>
              </Link>

              <GlobalSpaceSwitcher language={language} dark={false} currentSpace="retail" />

              <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all whitespace-nowrap text-xs md:text-sm">
                 <Package size={18} /> <span className="hidden sm:inline">{language === 'fr' ? 'Gérer le Magasin' : language === 'en' ? 'Manage Store' : 'إدارة سلع المتجر'}</span>
              </Link>
              
              <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                {storeInitial}
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 w-full max-w-full relative z-10">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 min-h-[400px] w-full max-w-full overflow-x-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [userPrimaryRole, setUserPrimaryRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { language } = useSettingsStore();
  const { supplier, fetchSupplierProfile } = useSupplierStore();

  const isStorePage = window.location.pathname.startsWith('/store') || window.location.search.includes('vendor');

  useEffect(() => {
    let mounted = true;

    const detectPrimaryRole = async (user) => {
      if (!user) return;
      const metaRole = user.user_metadata?.role || user.user_metadata?.account_type;
      if (metaRole === 'architect' || metaRole === 'provider' || metaRole === 'contractor') {
        if (mounted) setUserPrimaryRole(metaRole);
        return;
      }
      const { data: arch } = await supabase.from('architects').select('id').eq('user_id', user.id).limit(1);
      if (arch && arch.length > 0 && mounted) { setUserPrimaryRole('architect'); return; }

      const { data: prov } = await supabase.from('providers').select('id').eq('user_id', user.id).limit(1);
      if (prov && prov.length > 0 && mounted) { setUserPrimaryRole('provider'); return; }

      if (mounted) setUserPrimaryRole('supplier');
    };

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
              await detectPrimaryRole(userData.user);
              window.history.replaceState(null, '', window.location.pathname + window.location.search); 
              setLoading(false);
              return; 
            }
          }
        }

        const { data: { session: curSession } } = await supabase.auth.getSession();
        if (mounted) {
          if (curSession?.user) {
            setSession(curSession);
            fetchSupplierProfile(curSession.user.id);
            await detectPrimaryRole(curSession.user);
          } else {
            setSession(null);
          }
          setLoading(false);
        }
      } catch (err) {
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
          setUserPrimaryRole(null);
        } else if (currentSession?.user) {
          setSession(currentSession);
          detectPrimaryRole(currentSession.user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchSupplierProfile]);
  
  if (isStorePage) {
    return (
      <BrowserRouter>
        <ReferralTracker />
        <Routes>
          <Route path="/store" element={<Marketplace />} />
          <Route path="*" element={<Marketplace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const previewMode = searchParams.get('preview');

  if (previewMode === 'retail' || previewMode === 'wholesale') {
    sessionStorage.setItem('souqbtp_preview_mode', previewMode);
  }
  const activePreview = previewMode || sessionStorage.getItem('souqbtp_preview_mode');

  const isV2Path = pathname.startsWith('/v2');
  const isLandingPage = pathname.startsWith('/empire') || pathname.startsWith('/pro') || pathname.startsWith('/contractor') || pathname.startsWith('/devis-gratuit') || pathname.startsWith('/client-portal');
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/auth');

  if (loading) {
    return <div className="h-screen w-full bg-[#0f172a]"></div>; 
  }

  if (!session && !isV2Path && !isLandingPage && !isAuthPage && !isStorePage) {
    return <BrowserRouter><ReferralTracker /><Navigate to="/v2/auth" replace /></BrowserRouter>;
  }

  const isWholesaler = activePreview === 'wholesale' 
    ? true 
    : activePreview === 'retail' 
    ? false 
    : (session?.user?.user_metadata?.supplier_type === 'wholesale' || supplier?.supplier_type === 'wholesale');

  // 🎯 توحيد اسم الحساب في جميع الواجهات
  const storeName = session?.user?.user_metadata?.company_name || session?.user?.user_metadata?.full_name || supplier?.store_name || 'SasBTP';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : 'S';

  return (
    <BrowserRouter>
      <ReferralTracker />
      <Routes>
        <Route path="/empire" element={<EmpireLanding />} />
        <Route path="/pro" element={<RetailLanding />} />
        <Route path="/contractor" element={<ContractorLanding />} />
        <Route path="/devis-gratuit" element={<CostCalculatorLanding />} />
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/affiliate-dashboard" element={<AffiliateDashboard />} />

        {/* مسارات فضاء V2 (المقاول، المهندس، الحرفي) */}
        <Route path="/v2/*" element={<V2Router session={session} supplier={supplier} />} />

        {!activePreview && userPrimaryRole === 'architect' && (
          <Route path="/" element={<Navigate to="/v2/architect-dashboard" replace />} />
        )}
        {!activePreview && userPrimaryRole === 'provider' && (
          <Route path="/" element={<Navigate to="/v2/provider-dashboard" replace />} />
        )}
        {!activePreview && userPrimaryRole === 'contractor' && (
          <Route path="/" element={<Navigate to="/v2/contractor-dashboard" replace />} />
        )}

        <Route path="/*" element={
          isWholesaler ? (
            <WholesalerDashboard supplier={supplier} storeName={storeName} storeInitial={storeInitial}>
              <Routes>
                <Route path="/" element={<SupplierOverview />} />
                <Route path="/affiliates" element={<AffiliateDashboard />} />
                <Route path="/stock" element={<SupplierStock isWholesaler={true} />} />
                <Route path="/invoices" element={<SupplierInvoices />} />
                <Route path="/raw-suppliers" element={<RawMaterialSuppliers />} />
                <Route path="/raw-purchases" element={<RawMaterialPurchases />} />
                <Route path="/pos-b2b" element={<SupplierPOS />} />
                <Route path="/orders" element={<SupplierOrders />} />
                <Route path="/settings" element={<SupplierSettings />} />
                <Route path="/subscription" element={<SupplierSubscription />} />

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

                <Route path="/analytics" element={<PremiumGuard><AnalyticsB2B /></PremiumGuard>} />
                <Route path="/ai-advisor" element={<PremiumGuard><AISmartAdvisor /></PremiumGuard>} />
                <Route path="/tender-radar" element={<PremiumGuard><TenderRadar /></PremiumGuard>} />
                <Route path="/logistics-bourse" element={<PremiumGuard><LogisticsBourse /></PremiumGuard>} />
                <Route path="/fleet-market" element={<PremiumGuard><FleetManagement /></PremiumGuard>} /> 
                <Route path="/market-orders" element={<PremiumGuard><MarketplaceOrders /></PremiumGuard>} />
                <Route path="/messages" element={<PremiumGuard><UnifiedMessages /></PremiumGuard>} />
                <Route path="/marketplace" element={<PremiumGuard><BTPHub /></PremiumGuard>} />
              </Routes>
            </WholesalerDashboard>
          ) : (
            <RetailerLayout storeName={storeName} storeInitial={storeInitial} language={language}>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/affiliates" element={<AffiliateDashboard />} />
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
                <Route path="/messages" element={<UnifiedMessages />} />
                <Route path="/marketplace" element={<BTPHub />} />
              </Routes>
            </RetailerLayout>
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;