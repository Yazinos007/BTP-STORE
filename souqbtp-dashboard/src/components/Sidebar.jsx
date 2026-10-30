import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Wallet, 
  Settings, Receipt, Users, FileText, Briefcase, Landmark,
  ChevronDown, CreditCard, Globe, Calculator,
  Truck, Zap, MessageCircle, Store
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
      finance: 'FINANCE & COMPTABILITÉ',
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
      finance: 'FINANCE & ACCOUNTING',
      params: 'SETTINGS'
    },
    groups: {
      achats: 'Purchases & Suppliers',
      ventes: 'Sales & Clients (CRM)',
      factures: 'Quotes, Notes & Invoices'
    }
  }
};

// 🎨 منظومة الألوان المتوهجة والنابضة لكل قسم (Neon Theme Config)
const SECTION_THEMES = {
  direction: {
    headerText: 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]',
    dot: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]',
    activeBtn: 'bg-blue-600/20 text-blue-300 border border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.45)] animate-pulse',
    activeIcon: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]',
    hoverBtn: 'hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30'
  },
  comm: {
    headerText: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    dot: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
    activeBtn: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse',
    activeIcon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    hoverBtn: 'hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30'
  },
  commercial: {
    headerText: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    dot: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
    activeBtn: 'bg-amber-500/20 text-amber-300 border border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.45)] animate-pulse',
    activeIcon: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    hoverBtn: 'hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30'
  },
  finance: {
    headerText: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]',
    dot: 'bg-purple-400 shadow-[0_0_10px_#c084fc]',
    activeBtn: 'bg-purple-600/20 text-purple-300 border border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.45)] animate-pulse',
    activeIcon: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]',
    hoverBtn: 'hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30'
  },
  params: {
    headerText: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]',
    dot: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
    activeBtn: 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/70 shadow-[0_0_20px_rgba(34,211,238,0.45)] animate-pulse',
    activeIcon: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    hoverBtn: 'hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30'
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

  // دالة ذكية لتلوين الزر النشط بنفس لون قسمه مع نبض مستمر
  const getLinkStyle = (path, themeKey) => {
    const active = location.pathname === path;
    const theme = SECTION_THEMES[themeKey] || SECTION_THEMES.direction;
    return `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border ${
      active
        ? theme.activeBtn
        : `text-slate-400 border-transparent ${theme.hoverBtn}`
    }`;
  };

  const getIconStyle = (path, themeKey) => {
    const active = location.pathname === path;
    const theme = SECTION_THEMES[themeKey] || SECTION_THEMES.direction;
    return active ? theme.activeIcon : 'text-slate-400 transition-colors';
  };

  // مكون عنوان القسم البراق (Glowing & Shimmering Section Header)
  const SectionHeader = ({ title, themeKey }) => {
    const theme = SECTION_THEMES[themeKey];
    return (
      <div className="px-3 pb-1.5 pt-1 flex items-center gap-2 relative overflow-hidden">
        <span className={`w-2 h-2 rounded-full animate-ping absolute opacity-75 ${theme.dot}`} />
        <span className={`w-2 h-2 rounded-full relative ${theme.dot}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest shimmer-title ${theme.headerText}`}>
          {title}
        </span>
      </div>
    );
  };

  const isGroupActive = (paths) => paths.includes(location.pathname);

  return (
    <aside className={`w-[270px] h-screen bg-[#0f172a] text-slate-300 flex flex-col select-none ${isRtl ? 'border-l border-slate-800' : 'border-r border-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* تأثير البريق المستمر (Shimmer CSS) */}
      <style>{`
        @keyframes sidebarShimmer {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.35); }
          100% { filter: brightness(1); }
        }
        .shimmer-title {
          animation: sidebarShimmer 2.5s infinite ease-in-out;
        }
      `}</style>

      {/* 1. Header & Store Identity */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/10 shrink-0 overflow-hidden">
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
                  isProOnly ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : isPremiumPlus ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
                }`}>
                  {isProOnly ? 'PRO RETAILER' : isPremiumPlus ? 'PREMIUM SHOP' : 'BASIC POS'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                  isOwner ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]' : 'bg-slate-800 text-slate-400'
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

        {/* زر ترقية الحساب البارز مع نبض ذهبي */}
        {isOwner && (
          <button 
            onClick={() => navigate('/subscription')}
            className="mt-4 w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 cursor-pointer hover:scale-[1.02]"
          >
            <Zap size={16} className="fill-slate-950 animate-bounce" />
            <span>{!isProOnly ? t.upgrade : t.manageSub}</span>
          </button>
        )}
      </div>

      {/* 2. Smart Glowing Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar text-start pb-24">
        
        {/* === 🔵 القسم 1: القيادة ونقطة البيع (Blue Neon) === */}
        <div className="space-y-1.5">
          <SectionHeader title={t.sections.direction} themeKey="direction" />

          <NavLink to="/" className={getLinkStyle('/', 'direction')}>
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} className={getIconStyle('/', 'direction')} />
              <span>{t.dashboard}</span>
            </div>
          </NavLink>

          <NavLink to="/pos" className={getLinkStyle('/pos', 'direction')}>
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} className={getIconStyle('/pos', 'direction')} />
              <span>{t.pos}</span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              LIVE
            </span>
          </NavLink>

          <NavLink to="/products" className={getLinkStyle('/products', 'direction')}>
            <div className="flex items-center gap-3">
              <Package size={18} className={getIconStyle('/products', 'direction')} />
              <span>{t.products}</span>
            </div>
          </NavLink>
        </div>

        {/* === 🟢 القسم 2: التواصل والسوق (Emerald Neon) === */}
        <div className="space-y-1.5">
          <SectionHeader title={t.sections.comm} themeKey="comm" />

          <NavLink to="/messages" className={getLinkStyle('/messages', 'comm')}>
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className={getIconStyle('/messages', 'comm')} />
              <span>{t.inbox}</span>
            </div>
          </NavLink>

          <NavLink to="/marketplace" className={getLinkStyle('/marketplace', 'comm')}>
            <div className="flex items-center gap-3">
              <Store size={18} className={getIconStyle('/marketplace', 'comm')} />
              <span>{t.btpMarket}</span>
            </div>
          </NavLink>
        </div>

        {/* === 🟠 القسم 3: التجارة، العملاء والفوترة (Amber/Gold Neon) === */}
        <div className="space-y-1.5">
          <SectionHeader title={t.sections.commercial} themeKey="commercial" />

          {/* مجموعة المبيعات والعملاء */}
          <div>
            <button
              onClick={() => toggleMenu('ventes')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                isGroupActive(['/clients', '/orders'])
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'text-slate-300 border-transparent hover:bg-amber-500/10 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={18} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                <span>{t.groups.ventes}</span>
              </div>
              <ChevronDown size={15} className={`transition-transform ${openMenus.ventes ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            {openMenus.ventes && (
              <div className={`mt-1.5 space-y-1 ${isRtl ? 'pr-3 border-r-2 border-amber-500/30 mr-4' : 'pl-3 border-l-2 border-amber-500/30 ml-4'}`}>
                <NavLink to="/clients" className={getLinkStyle('/clients', 'commercial')}>
                  <span>{t.clients}</span>
                </NavLink>
                <NavLink to="/orders" className={getLinkStyle('/orders', 'commercial')}>
                  <span>{t.orders}</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* مجموعة الموردين والمشتريات */}
          <div>
            <button
              onClick={() => toggleMenu('achats')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                isGroupActive(['/suppliers', '/purchases'])
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'text-slate-300 border-transparent hover:bg-amber-500/10 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                <span>{t.groups.achats}</span>
              </div>
              <ChevronDown size={15} className={`transition-transform ${openMenus.achats ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            {openMenus.achats && (
              <div className={`mt-1.5 space-y-1 ${isRtl ? 'pr-3 border-r-2 border-amber-500/30 mr-4' : 'pl-3 border-l-2 border-amber-500/30 ml-4'}`}>
                <NavLink to="/suppliers" className={getLinkStyle('/suppliers', 'commercial')}>
                  <span>{t.fournisseurs}</span>
                </NavLink>
                <NavLink to="/purchases" className={getLinkStyle('/purchases', 'commercial')}>
                  <span>{t.achats}</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* مجموعة الفواتير والوثائق التجارية */}
          <div>
            <button
              onClick={() => toggleMenu('factures')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                isGroupActive(['/invoices', '/devis', '/bc', '/bl', '/fiches-expedition', '/avoir', '/factures-achat'])
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'text-slate-300 border-transparent hover:bg-amber-500/10 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                <span>{t.groups.factures}</span>
              </div>
              <ChevronDown size={15} className={`transition-transform ${openMenus.factures ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            {openMenus.factures && (
              <div className={`mt-1.5 space-y-1 ${isRtl ? 'pr-3 border-r-2 border-amber-500/30 mr-4' : 'pl-3 border-l-2 border-amber-500/30 ml-4'}`}>
                <NavLink to="/invoices" className={getLinkStyle('/invoices', 'commercial')}>
                  <span>{t.factures}</span>
                </NavLink>
                <NavLink to="/devis" className={getLinkStyle('/devis', 'commercial')}>
                  <span>{t.devis}</span>
                </NavLink>
                <NavLink to="/bc" className={getLinkStyle('/bc', 'commercial')}>
                  <span>{t.bc}</span>
                </NavLink>
                <NavLink to="/bl" className={getLinkStyle('/bl', 'commercial')}>
                  <span>{t.bl}</span>
                </NavLink>
                <NavLink to="/fiches-expedition" className={getLinkStyle('/fiches-expedition', 'commercial')}>
                  <span>{t.fe}</span>
                </NavLink>
                <NavLink to="/avoir" className={getLinkStyle('/avoir', 'commercial')}>
                  <span>{t.avoir}</span>
                </NavLink>
                <NavLink to="/factures-achat" className={getLinkStyle('/factures-achat', 'commercial')}>
                  <span>{t.facturesAchat}</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* === 🟣 القسم 4: المالية، المحاسبة والموارد البشرية (Purple Neon) === */}
        <div className="space-y-1.5">
          <SectionHeader title={t.sections.finance} themeKey="finance" />

          <NavLink to="/caisses" className={getLinkStyle('/caisses', 'finance')}>
            <div className="flex items-center gap-3">
              <Wallet size={18} className={getIconStyle('/caisses', 'finance')} />
              <span>{t.caisses}</span>
            </div>
          </NavLink>

          <NavLink to="/expenses" className={getLinkStyle('/expenses', 'finance')}>
            <div className="flex items-center gap-3">
              <CreditCard size={18} className={getIconStyle('/expenses', 'finance')} />
              <span>{t.gestionCharges}</span>
            </div>
          </NavLink>

          <NavLink to="/hr" className={getLinkStyle('/hr', 'finance')}>
            <div className="flex items-center gap-3">
              <Briefcase size={18} className={getIconStyle('/hr', 'finance')} />
              <span>{t.gestionEmployes}</span>
            </div>
          </NavLink>

          <NavLink to="/fiscal" className={getLinkStyle('/fiscal', 'finance')}>
            <div className="flex items-center gap-3">
              <Landmark size={18} className={getIconStyle('/fiscal', 'finance')} />
              <span>{t.decTva}</span>
            </div>
          </NavLink>

          <NavLink to="/accounting" className={getLinkStyle('/accounting', 'finance')}>
            <div className="flex items-center gap-3">
              <Calculator size={18} className={getIconStyle('/accounting', 'finance')} />
              <span>{t.accounting}</span>
            </div>
          </NavLink>

          <NavLink to="/wallet" className={getLinkStyle('/wallet', 'finance')}>
            <div className="flex items-center gap-3">
              <Receipt size={18} className={getIconStyle('/wallet', 'finance')} />
              <span>{t.wallet}</span>
            </div>
          </NavLink>
        </div>

        {/* === 🩵 القسم 5: الإعدادات (Cyan Neon) === */}
        {isOwner && (
          <div className="space-y-1.5">
            <SectionHeader title={t.sections.params} themeKey="params" />
            <NavLink to="/settings" className={getLinkStyle('/settings', 'params')}>
              <div className="flex items-center gap-3">
                <Settings size={18} className={getIconStyle('/settings', 'params')} />
                <span>{t.profileSettings}</span>
              </div>
            </NavLink>
          </div>
        )}

      </nav>
    </aside>
  );
}