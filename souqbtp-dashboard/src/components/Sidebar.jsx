import { useState } from 'react';
import { 
  LayoutDashboard, MonitorPlay, Package, ShoppingCart, Wallet, 
  Settings, LogOut, Receipt, Users, FileText, Briefcase, Landmark,
  ChevronDown, ChevronRight, CreditCard, Globe, Calculator,
  Truck, ShoppingBag, Zap 
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore';

const translations = {
  ar: {
    overview: 'نظرة عامة', pos: 'نقطة البيع (POS)', products: 'المنتجات',
    clients: 'إدارة العملاء',
    orders: 'الطلبات', invoices: 'إصدار الفواتير', expenses: 'المصاريف والربح', wallet: 'المحفظة', settings: 'الإعدادات',
    dashboard: 'لوحة القيادة', gestionVentes: 'إدارة المبيعات', gestionProduits: 'إدارة المنتجات',
    gestionAchats: 'إدارة المشتريات', fournisseurs: 'الموردون', achats: 'مشتريات (Stock In)',
    gestionFactures: 'إدارة الفواتير', factures: 'الفواتير', devis: 'عروض الأسعار',
    bc: 'أوامر الشراء', fe: 'قسائم الشحن', bl: 'سندات التسليم', avoir: 'المرتجعات (Avoir)', facturesAchat: 'فواتير الشراء',
    gestionCaisses: 'إدارة الصناديق', caisses: 'الصناديق والحسابات',
    rh: 'الموارد البشرية', gestionEmployes: 'إدارة الموظفين',
    fiscal: 'النظام الجبائي', decTva: 'إقرارات TVA', chargesEnt: 'مصاريف الشركة', gestionCharges: 'إدارة المصاريف',
    accounting: 'المحاسبة العامة', logout: 'تسجيل الخروج',
    profileSettings: 'الملف الشخصي للمتجر',
    upgrade: 'ارتقِ إلى Enterprise',
    manageSub: 'إدارة الاشتراك',
    owner: 'المالك', employee: 'موظف', foundingPartner: 'شريك مؤسس',
    changeLangTitle: 'تغيير لغة النظام'
  },
  fr: {
    overview: 'Aperçu', pos: 'Point de Vente (POS)', products: 'Produits',
    clients: 'Gestion des Clients',
    orders: 'Commandes', invoices: 'Éditer Factures', expenses: 'Charges et Résultat', wallet: 'Portefeuille', settings: 'Paramètres',
    dashboard: 'Tableau de bord', gestionVentes: 'GESTION DES VENTES', gestionProduits: 'GESTION DES PRODUITS',
    gestionAchats: 'ACHATS & FOURNISSEURS', fournisseurs: 'Fournisseurs', achats: 'Achats (Stock In)',
    gestionFactures: 'GESTION DES FACTURES', factures: 'Factures', devis: 'Devis',
    bc: 'Bons de Commande', fe: 'Fiches d\'Expédition', bl: 'Bons de Livraison', avoir: 'Avoir', facturesAchat: 'Factures d\'Achat',
    gestionCaisses: 'GESTION DES CAISSES', caisses: 'Caisses & Banques',
    rh: 'RESSOURCES HUMAINES', gestionEmployes: 'Gestion des Employés',
    fiscal: 'SYSTÈME FISCAL', decTva: 'Déclarations TVA', chargesEnt: 'CHARGES ENTREPRISE', gestionCharges: 'Gestion des Charges',
    accounting: 'Comptabilité & Bilan', logout: 'Déconnexion',
    profileSettings: 'Profil du Magasin', 
    upgrade: "Passer à l'Enterprise",
    manageSub: "Gérer l'Abonnement",
    owner: 'Propriétaire', employee: 'Employé', foundingPartner: 'Partenaire Fondateur',
    changeLangTitle: 'Changer la langue'
  },
  en: {
    overview: 'Overview', pos: 'Point of Sale (POS)', products: 'Products',
    clients: 'Client Management',
    orders: 'Orders', invoices: 'Issue Invoices', expenses: 'Expenses & Profit', wallet: 'Wallet', settings: 'Settings',
    dashboard: 'Dashboard', gestionVentes: 'SALES MANAGEMENT', gestionProduits: 'PRODUCT MANAGEMENT',
    gestionAchats: 'PURCHASES & SUPPLIERS', fournisseurs: 'Suppliers', achats: 'Purchases (Stock In)',
    gestionFactures: 'INVOICE MANAGEMENT', factures: 'Invoices', devis: 'Quotations',
    bc: 'Purchase Orders', fe: 'Shipping Slips', bl: 'Delivery Notes', avoir: 'Returns (Avoir)', facturesAchat: 'Purchase Invoices',
    gestionCaisses: 'CASHIER MANAGEMENT', caisses: 'Registers & Accounts',
    rh: 'HUMAN RESOURCES', gestionEmployes: 'Employee Management',
    fiscal: 'TAX SYSTEM', decTva: 'VAT Returns', chargesEnt: 'COMPANY EXPENSES', gestionCharges: 'Expense Management',
    accounting: 'General Accounting', logout: 'Logout',
    profileSettings: 'Store Profile',
    upgrade: 'Upgrade to Enterprise',
    manageSub: 'Manage Subscription',
    owner: 'Owner', employee: 'Employee', foundingPartner: 'Founding Partner',
    changeLangTitle: 'Change System Language'
  }
};

export default function Sidebar() {
  const { supplier, isLoading } = useSupplierStore();
  const { language, setLanguage } = useSettingsStore();
  const handleLanguageChange = () => {
  if (language === 'fr') setLanguage('ar');
  else if (language === 'ar') setLanguage('en');
  else setLanguage('fr');
};
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  // 🛡️ الترياق السحري للترجمة
  const t = translations[language] || translations['fr'];

  if (isLoading) return <div className={`w-[280px] h-screen bg-[#2d2252] shrink-0 ${language === 'fr' || language === 'en' ? 'border-r' : 'border-l'} border-white/10 animate-pulse`} />;
  
  const safeSupplier = supplier || { 
    store_name: 'Mon Magasin', 
    tier: 'starter', 
    role: 'admin',
    permissions: { sales: true, products: true, invoices: true, accounting: true, hr: true }
  };

  const tier = safeSupplier.tier || 'starter';
  const role = safeSupplier.role || 'admin';
  const userPermissions = safeSupplier.permissions || {
    sales: true, products: true, invoices: true, accounting: true, hr: true
  };

  const toggleMenu = (menuName) => setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  const isEnterprise = tier === 'enterprise';

  const enterpriseMenu = [
    { name: t.dashboard, icon: LayoutDashboard, path: '/', alwaysShow: true },
    {
      group: t.gestionAchats, icon: Truck, requiredPermission: 'products',
      subItems: [
        { name: t.fournisseurs, path: '/suppliers' },
        { name: t.achats, path: '/purchases' }
      ]
    },
    {
      group: t.gestionProduits, icon: Package, requiredPermission: 'products',
      subItems: [
        { name: t.products, path: '/products' }
      ]
    },
    {
      group: t.gestionVentes, icon: ShoppingCart, requiredPermission: 'sales',
      subItems: [
        { name: t.pos, path: '/pos' },
        { name: t.orders, path: '/orders' },
        { name: t.clients, path: '/clients' }
      ]
    },
    {
      group: t.gestionFactures, icon: FileText, requiredPermission: 'invoices',
      subItems: [
        { name: t.factures, path: '/invoices' }, 
        { name: t.devis, path: '/devis' },
        { name: t.bc, path: '/bc' }, 
        { name: t.fe, path: '/fiches-expedition' }, 
        { name: t.bl, path: '/bl' },
        { name: t.avoir, path: '/avoir' },
        { name: t.facturesAchat, path: '/factures-achat' },
      ]
    },
    {
      group: t.rh, icon: Briefcase, requiredPermission: 'hr',
      subItems: [{ name: t.gestionEmployes, path: '/hr' }]
    },
    {
      group: t.gestionCaisses, icon: Wallet, requiredPermission: 'accounting',
      subItems: [{ name: t.caisses, path: '/caisses' }]
    },
    {
      group: t.chargesEnt, icon: CreditCard, requiredPermission: 'accounting',
      subItems: [{ name: t.gestionCharges, path: '/expenses' }]
    },
    {
      group: t.fiscal, icon: Landmark, requiredPermission: 'accounting',
      subItems: [{ name: t.decTva, path: '/fiscal' }]
    },
    {
      group: t.accounting, icon: Calculator, requiredPermission: 'accounting',
      subItems: [{ name: t.accounting, path: '/accounting' }]
    },
    { name: t.profileSettings, icon: Settings, path: '/settings', adminOnly: true }
  ];

  const filteredEnterpriseMenu = enterpriseMenu.filter(item => {
    if (role === 'admin') return true;
    if (item.adminOnly) return false;
    if (item.alwaysShow) return true;
    if (item.requiredPermission) return userPermissions[item.requiredPermission];
    return false;
  });

  const normalMenuItems = [
    { name: t.overview, icon: LayoutDashboard, path: '/', minTier: 'starter' },
    { name: t.fournisseurs, icon: Truck, path: '/suppliers', minTier: 'starter' }, 
    { name: t.achats, icon: ShoppingBag, path: '/purchases', minTier: 'starter' },
    { name: t.products, icon: Package, path: '/products', minTier: 'starter' }, 
    { name: t.pos, icon: MonitorPlay, path: '/pos', minTier: 'starter' },
    { name: t.orders, icon: ShoppingCart, path: '/orders', minTier: 'starter' },
    { name: t.clients, icon: Users, path: '/clients', minTier: 'starter' },
    { name: t.invoices, icon: FileText, path: '/invoices', minTier: 'pro' },
    { name: t.expenses, icon: Receipt, path: '/expenses', minTier: 'pro' },
    { name: t.wallet, icon: Wallet, path: '/wallet', minTier: 'pro' },
    { name: t.profileSettings, icon: Settings, path: '/settings', minTier: 'starter' }
  ].filter(item => tier === 'pro' ? true : item.minTier === 'starter');

  return (
    <div className={`w-[280px] h-screen bg-[#2d2252] text-gray-200 flex flex-col ${language === 'ar' ? 'border-l border-white/10' : 'border-r border-white/10'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-6 border-b border-white/10 flex flex-col gap-5">
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 min-w-[64px] rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-3xl shadow-xl border-2 border-white/10 overflow-hidden shrink-0">
              {supplier?.logo_url ? (
                <img src={supplier.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                safeSupplier.store_name?.charAt(0)?.toUpperCase() || 'S'
              )}
            </div>
            
            <div className="flex flex-col overflow-hidden justify-center h-16 text-start">
              <h2 className="text-white font-black text-xl leading-tight truncate w-[140px] mb-1.5" title={safeSupplier.store_name}>
                {safeSupplier.store_name || 'SouqBTP'}
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-md uppercase font-black tracking-wide ${supplier?.tier === 'enterprise' || isEnterprise ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-600 text-white'}`}>
                  {supplier?.tier || tier}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-md uppercase font-black tracking-wide ${supplier?.role === 'admin' || role === 'admin' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 text-gray-300'}`}>
                  {supplier?.role === 'admin' || role === 'admin' ? t.owner : t.employee}
                </span>
              </div>
            </div>
          </div>

          <button 
        onClick={handleLanguageChange}
        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white flex flex-col items-center justify-center min-w-[48px] cursor-pointer"
        title={language === 'ar' ? 'تغيير لغة النظام' : language === 'en' ? 'Change System Language' : 'Changer la langue'}
        >
        <Globe size={20} />
        <span className="text-[11px] font-bold mt-1 uppercase">{language}</span>
          </button>
            </div>

        {supplier?.is_founding_partner && (
          <div className="flex items-center justify-center gap-3 px-4 py-3 mt-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-orange-500/10 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden group w-full">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 uppercase tracking-widest z-10 drop-shadow-md">
              {t.foundingPartner}
            </span>
            <span className="text-amber-400 text-lg z-10 drop-shadow-md">🏆</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar text-start">
        
        {(role === 'admin' || supplier?.role === 'admin') && (
          <div className="px-4 mb-6">
            <button 
              onClick={() => navigate('/subscription')}
              className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer ${
                !isEnterprise 
                  ? 'bg-[#eab308] hover:bg-[#ca8a04] text-slate-900 shadow-yellow-500/20' 
                  : 'bg-white/10 hover:bg-white/20 text-white' 
              }`}
            >
              <Zap size={18} className={!isEnterprise ? "fill-slate-900" : "text-amber-400"} />
              {!isEnterprise ? t.upgrade : t.manageSub}
            </button>
          </div>
        )}

        {isEnterprise ? (
          <div className="space-y-1">
            {filteredEnterpriseMenu.map((item, idx) => {
              if (!item.group) {
                return (
                  <NavLink key={idx} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${isActive ? `text-green-400 font-bold ${language === 'ar' ? 'border-r-4' : 'border-l-4'} border-green-400 bg-white/5` : 'hover:bg-white/5 hover:text-white'}`}>
                    <item.icon size={18} className="shrink-0" /><span>{item.name}</span>
                  </NavLink>
                );
              }
              const isOpen = openMenus[item.group];
              const isActiveGroup = item.subItems.some(sub => location.pathname === sub.path);
              return (
                <div key={idx} className="mb-2">
                  <button onClick={() => toggleMenu(item.group)} className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors outline-none cursor-pointer ${isActiveGroup ? 'text-green-400 font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                    <div className="flex items-center gap-3"><item.icon size={18} className="shrink-0" /><span className="uppercase text-[11px] tracking-wider font-bold">{item.group}</span></div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {isOpen && (
                    <div className={`py-1 space-y-1 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}>
                      {item.subItems.map((sub, subIdx) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <NavLink key={subIdx} to={sub.path} className={`flex items-center gap-3 py-2 text-sm transition-colors ${isSubActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-green-400' : 'border border-gray-400'}`} /><span>{sub.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1 px-3">
            {normalMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.name} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                  <Icon size={20} className="shrink-0" /><span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
}