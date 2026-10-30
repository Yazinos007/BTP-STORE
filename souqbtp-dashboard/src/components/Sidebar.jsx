import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Wallet, 
  Settings, Receipt, Users, FileText, Briefcase, Landmark,
  ChevronDown, CreditCard, Globe, Calculator,
  Truck, Zap, MessageCircle, Store, FileCheck, FilePlus, ArrowLeftRight
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore';

const translations = {
  ar: {
    dashboard: 'لوحة القيادة',
    pos: 'نقطة البيع السريعة (POS)',
    products: 'إدارة المخزون والسلع',
    clients: 'العملاء والديون (الكريدي)',
    orders: 'طلبات المتجر',
    fournisseurs: 'الموردون الخارجيون',
    achats: 'المشتريات (Stock In)',
    factures: 'فواتير العملاء',
    devis: 'عروض الأسعار (Devis)',
    bc: 'أوامر الشراء (BC)',
    bl: 'سندات التسليم (BL)',
    fe: 'قسائم الشحن (Expédition)',
    avoir: 'المرتجعات (Avoir)',
    facturesAchat: 'فواتير الشراء',
    caisses: 'الصناديق والحسابات (Multi-Caisses)',
    wallet: 'المحفظة والأرباح',
    gestionCharges: 'المصاريف والأعباء اليومية',
    gestionEmployes: 'الموارد البشرية والسلفيات (HR)',
    decTva: 'النظام الجبائي وإقرارات TVA',
    accounting: 'المحاسبة العامة والتصدير',
    inbox: 'صندوق الرسائل',
    btpMarket: 'سوق BTP العام',
    profileSettings: 'إعدادات المتجر والملف',
    upgrade: 'ترقية إلى Pro Retailer',
    manageSub: 'إدارة الاشتراك',
    owner: 'المالك',
    employee: 'موظف',
    foundingPartner: 'شريك مؤسس',
    changeLangTitle: 'تغيير لغة النظام',
    sections: {
      direction: 'القيادة ونقطة البيع',
      comm: 'التواصل والسوق',
      commercial: 'التجارة، المخزون والفوترة',
      finance: 'المالية، المحاسبة والموارد البشرية',
      params: 'الإعدادات'
    },
    groups: {
      achats: 'الموردون والمشتريات',
      ventes: 'المبيعات والعملاء (CRM)',
      factures: 'الفواتير والوثائق التجارية'
    }
  },
  fr: {
    dashboard: 'Tableau de bord',
    pos: 'Point de Vente (POS)',
    products: 'Gestion du Stock & Produits',
    clients: 'Clients & Crédits (CRM)',
    orders: 'Commandes Clients',
    fournisseurs: 'Fournisseurs',
    achats: 'Achats (Stock In)',
    factures: 'Factures Clients',
    devis: 'Devis',
    bc: 'Bons de Commande (BC)',
    bl: 'Bons de Livraison (BL)',
    fe: 'Fiches d\'Expédition',
    avoir: 'Factures d\'Avoir',
    facturesAchat: 'Factures d\'Achat',
    caisses: 'Caisses & Comptes (Multi-Caisses)',
    wallet: 'Portefeuille & Retraits',
    gestionCharges: 'Dépenses & Frais',
    gestionEmployes: 'Ressources Humaines (RH)',
    decTva: 'Système Fiscal (TVA)',
    accounting: 'Comptabilité & Export',
    inbox: 'Boîte de Réception',
    btpMarket: 'Marché BTP',
    profileSettings: 'Profil du Magasin',
    upgrade: 'Passer à Pro Retailer',
    manageSub: 'Gérer l\'Abonnement',
    owner: 'Propriétaire',
    employee: 'Employé',
    foundingPartner: 'Partenaire Fondateur',
    changeLangTitle: 'Changer la langue',
    sections: {
      direction: 'DIRECTION & CAISSE',
      comm: 'COMMUNICATION & MARCHÉ',
      commercial: 'COMMERCE, STOCK & FACTURATION',
      finance: 'FINANCE, RH & COMPTABILITÉ',
      params: 'PARAMÈTRES'
    },
    groups: {
      achats: 'Achats & Fournisseurs',
      ventes: 'Ventes & Clients (CRM)',
      factures: 'Devis, BL & Factures'
    }
  },
  en: {
    dashboard: 'Dashboard',
    pos: 'Point of Sale (POS)',
    products: 'Inventory & Products',
    clients: 'Clients & Credits (CRM)',
    orders: 'Customer Orders',
    fournisseurs: 'Suppliers',
    achats: 'Purchases (Stock In)',
    factures: 'Client Invoices',
    devis: 'Quotations (Devis)',
    bc: 'Purchase Orders (BC)',
    bl: 'Delivery Notes (BL)',
    fe: 'Shipping Slips',
    avoir: 'Credit Notes (Avoir)',
    facturesAchat: 'Purchase Invoices',
    caisses: 'Multi-Caisses & Banks',
    wallet: 'Wallet & Withdrawals',
    gestionCharges: 'Daily Expenses',
    gestionEmployes: 'Human Resources (HR)',
    decTva: 'Tax System & VAT',
    accounting: 'General Accounting',
    inbox: 'Inbox Messages',
    btpMarket: 'BTP Marketplace',
    profileSettings: 'Store Settings',
    upgrade: 'Upgrade to Pro Retailer',
    manageSub: 'Manage Subscription',
    owner: 'Owner',
    employee: 'Employee',
    foundingPartner: 'Founding Partner',
    changeLangTitle: 'Change Language',
    sections: {
      direction: 'MANAGEMENT & POS',
      comm: 'COMMUNICATION & MARKET',
      commercial: 'TRADE, STOCK & INVOICING',
      finance: 'FINANCE, HR & ACCOUNTING',
      params: 'SETTINGS'
    },
    groups: {
      achats: 'Purchases & Suppliers',
      ventes: 'Sales & Clients (CRM)',
      factures: 'Quotes, Notes & Invoices'
    }
  }
};

export default function Sidebar() {
  const { supplier, isLoading } = useSupplierStore();
  const { language, setLanguage } = useSettingsStore();
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [openMenus, setOpenMenus] = useState({
    achats: false,
    ventes: true,
    factures: false
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
    });
  }, []);

  // فتح القائمة الفرعية تلقائياً إذا كان المستخدم بداخل أحد مساراتها
  useEffect(() => {
    const p = location.pathname;
    if (['/suppliers', '/purchases'].includes(p)) {
      setOpenMenus(prev => ({ ...prev, achats: true }));
    }
    if (['/orders', '/clients'].includes(p)) {
      setOpenMenus(prev => ({ ...prev, ventes: true }));
    }
    if (['/invoices', '/devis', '/bc', '/bl', '/fiches-expedition', '/avoir', '/factures-achat'].includes(p)) {
      setOpenMenus(prev => ({ ...prev, factures: true }));
    }
  }, [location.pathname]);

  const handleLanguageChange = () => {
    if (language === 'fr') setLanguage('ar');
    else if (language === 'ar') setLanguage('en');
    else setLanguage('fr');
  };

  const t = translations[language] || translations['fr'];
  const isRtl = language === 'ar';

  if (isLoading) {
    return <div className={`w-[270px] h-screen bg-[#0f172a] shrink-0 ${isRtl ? 'border-l' : 'border-r'} border-slate-800 animate-pulse`} />;
  }

  const safeSupplier = supplier || { 
    store_name: currentUser?.user_metadata?.company_name || currentUser?.user_metadata?.full_name || 'Almo9awil', 
    subscription_plan: 'basic'
  };

  const tier = (safeSupplier.subscription_plan || safeSupplier.tier || 'basic').toLowerCase();
  const isOwner = currentUser
    ? (currentUser.id === safeSupplier.user_id || currentUser.user_metadata?.role === 'admin' || !currentUser.user_metadata?.is_employee)
    : true;

  const isProOnly = ['pro', 'enterprise', 'vip'].includes(tier);
  const isPremiumPlus = ['premium', 'pro', 'enterprise', 'vip'].includes(tier);

  const toggleMenu = (key) => setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const linkClass = (path) => {
    const active = location.pathname === path;
    return `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
      active
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
        : 'text-slate-400 hover:bg-slate-800/70 hover:text-white border border-transparent'
    }`;
  };

  return (
    <aside className={`w-[270px] h-screen bg-[#0f172a] text-slate-300 flex flex-col select-none ${isRtl ? 'border-l border-slate-800' : 'border-r border-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. Header & Store Identity */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10 shrink-0 overflow-hidden">
              {safeSupplier.logo_url ? (
                <img src={safeSupplier.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                (safeSupplier.store_name || 'A').charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 text-start">
              <h2 className="text-white font-black text-base truncate">
                {safeSupplier.store_name || 'SasBTP'}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                  isProOnly ? 'bg-amber-500 text-slate-950' : isPremiumPlus ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
                }`}>
                  {isProOnly ? 'PRO RETAILER' : isPremiumPlus ? 'PREMIUM SHOP' : 'BASIC POS'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                  isOwner ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isOwner ? t.owner : t.employee}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLanguageChange}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white flex flex-col items-center justify-center shrink-0 cursor-pointer"
            title={t.changeLangTitle}
          >
            <Globe size={16} />
            <span className="text-[9px] font-black mt-0.5 uppercase">{language}</span>
          </button>
        </div>

        {/* زر ترقية الحساب البارز */}
        {isOwner && (
          <button 
            onClick={() => navigate('/subscription')}
            className="mt-4 w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 cursor-pointer"
          >
            <Zap size={16} className="fill-slate-950" />
            <span>{!isProOnly ? t.upgrade : t.manageSub}</span>
          </button>
        )}
      </div>

      {/* 2. Smart Navigation List (جميع الأقسام ظاهرة ومرتبة بذكاء) */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar text-start pb-24">
        
        {/* === القسم 1: القيادة ونقطة البيع === */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {t.sections.direction}
          </div>
          <NavLink to="/" className={linkClass('/')}>
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} />
              <span>{t.dashboard}</span>
            </div>
          </NavLink>
          <NavLink to="/pos" className={linkClass('/pos')}>
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} className="text-emerald-400" />
              <span>{t.pos}</span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">LIVE</span>
          </NavLink>
          <NavLink to="/products" className={linkClass('/products')}>
            <div className="flex items-center gap-3">
              <Package size={18} />
              <span>{t.products}</span>
            </div>
          </NavLink>
        </div>

        {/* === القسم 2: التواصل والسوق === */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {t.sections.comm}
          </div>
          <NavLink to="/messages" className={linkClass('/messages')}>
            <div className="flex items-center gap-3">
              <MessageCircle size={18} />
              <span>{t.inbox}</span>
            </div>
          </NavLink>
          <NavLink to="/marketplace" className={linkClass('/marketplace')}>
            <div className="flex items-center gap-3">
              <Store size={18} />
              <span>{t.btpMarket}</span>
            </div>
          </NavLink>
        </div>

        {/* === القسم 3: التجارة، العملاء والفوترة === */}
        <div className="space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {t.sections.commercial}
          </div>

          {/* مجموعة المبيعات والعملاء (الكريدي + CRM) */}
          <div>
            <button
              onClick={() => toggleMenu('ventes')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/60 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users size={18} className="text-blue-400" />
                <span>{t.groups.ventes}</span>
              </div>
              <ChevronDown size={15} className={`transition-transform ${openMenus.ventes ? 'rotate-180' : ''}`} />
            </button>
            {openMenus.ventes && (
              <div className={`mt-1 space-y-1 ${isRtl ? 'pr-4 border-r border-slate-800 mr-4' : 'pl-4 border-l border-slate-800 ml-4'}`}>
                <NavLink to="/clients" className={linkClass('/clients')}>
                  <span>{t.clients}</span>
                </NavLink>
                <NavLink to="/orders" className={linkClass('/orders')}>
                  <span>{t.orders}</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* مجموعة الموردين والمشتريات */}
          <div>
            <button
              onClick={() => toggleMenu('achats')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/60 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-amber-400" />
                <span>{t.groups.achats}</span>
              </div>
              <ChevronDown size={15} className={`transition-transform ${openMenus.achats ? 'rotate-180' : ''}`} />
            </button>
            {openMenus.achats && (
              <div className={`mt-1 space-y-1 ${isRtl ? 'pr-4 border-r border-slate-800 mr-4' : 'pl-4 border-l border-slate-800 ml-4'}`}>
                <NavLink to="/suppliers" className={linkClass('/suppliers')}>
                  <span>{t.fournisseurs}</span>
                </NavLink>
                <NavLink to="/purchases" className={linkClass('/purchases')}>
                  <span>{t.achats}</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* مجموعة الفواتير والوثائق التجارية الكاملة */}
          <div>
            <button
              onClick={() => toggleMenu('factures')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/60 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-purple-400" />
                <span>{t.groups.factures}</span>
              </div>
              <ChevronDown size={15} className={`transition-transform ${openMenus.factures ? 'rotate-180' : ''}`} />
            </button>
            {openMenus.factures && (
              <div className={`mt-1 space-y-1 ${isRtl ? 'pr-4 border-r border-slate-800 mr-4' : 'pl-4 border-l border-slate-800 ml-4'}`}>
                <NavLink to="/invoices" className={linkClass('/invoices')}>
                  <span>{t.factures}</span>
                </NavLink>
                <NavLink to="/devis" className={linkClass('/devis')}>
                  <span>{t.devis}</span>
                </NavLink>
                <NavLink to="/bc" className={linkClass('/bc')}>
                  <span>{t.bc}</span>
                </NavLink>
                <NavLink to="/bl" className={linkClass('/bl')}>
                  <span>{t.bl}</span>
                </NavLink>
                <NavLink to="/fiches-expedition" className={linkClass('/fiches-expedition')}>
                  <span>{t.fe}</span>
                </NavLink>
                <NavLink to="/avoir" className={linkClass('/avoir')}>
                  <span>{t.avoir}</span>
                </NavLink>
                <NavLink to="/factures-achat" className={linkClass('/factures-achat')}>
                  <span>{t.facturesAchat}</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* === القسم 4: المالية، المحاسبة والموارد البشرية (كانت مخفية سابقاً!) === */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {t.sections.finance}
          </div>

          <NavLink to="/caisses" className={linkClass('/caisses')}>
            <div className="flex items-center gap-3">
              <Wallet size={18} />
              <span>{t.caisses}</span>
            </div>
          </NavLink>

          <NavLink to="/expenses" className={linkClass('/expenses')}>
            <div className="flex items-center gap-3">
              <CreditCard size={18} />
              <span>{t.gestionCharges}</span>
            </div>
          </NavLink>

          <NavLink to="/hr" className={linkClass('/hr')}>
            <div className="flex items-center gap-3">
              <Briefcase size={18} />
              <span>{t.gestionEmployes}</span>
            </div>
          </NavLink>

          <NavLink to="/fiscal" className={linkClass('/fiscal')}>
            <div className="flex items-center gap-3">
              <Landmark size={18} />
              <span>{t.decTva}</span>
            </div>
          </NavLink>

          <NavLink to="/accounting" className={linkClass('/accounting')}>
            <div className="flex items-center gap-3">
              <Calculator size={18} />
              <span>{t.accounting}</span>
            </div>
          </NavLink>

          <NavLink to="/wallet" className={linkClass('/wallet')}>
            <div className="flex items-center gap-3">
              <Receipt size={18} />
              <span>{t.wallet}</span>
            </div>
          </NavLink>
        </div>

        {/* === القسم 5: الإعدادات === */}
        {isOwner && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {t.sections.params}
            </div>
            <NavLink to="/settings" className={linkClass('/settings')}>
              <div className="flex items-center gap-3">
                <Settings size={18} />
                <span>{t.profileSettings}</span>
              </div>
            </NavLink>
          </div>
        )}

      </nav>
    </aside>
  );
}