import { useState } from 'react';
import { 
  LayoutDashboard, MonitorPlay, Package, ShoppingCart, Wallet, 
  Settings, LogOut, Receipt, Users, FileText, Briefcase, Landmark,
  ChevronDown, ChevronRight, CreditCard, Globe, Calculator,
  Truck, ShoppingBag // 👈 الأيقونات الجديدة التي أضفناها
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore';

export default function Sidebar() {
  const { supplier, isLoading } = useSupplierStore();
  const { language, toggleLanguage } = useSettingsStore();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  if (isLoading) return <div className={`w-[280px] h-screen bg-[#2d2252] shrink-0 ${language === 'fr' ? 'border-r' : 'border-l'} border-white/10 animate-pulse`} />;
  if (!supplier) return null;

  const tier = supplier.tier || 'starter';
  const role = supplier.role || 'admin';
  const userPermissions = supplier.permissions || {
    sales: true, products: true, invoices: true, accounting: true, hr: true
  };

  const toggleMenu = (menuName) => setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  const isEnterprise = tier === 'enterprise';

  // 👈 تمت إضافة ترجمات الموردين والمشتريات هنا
  const t = {
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
      accounting: 'المحاسبة العامة', logout: 'تسجيل الخروج'
    },
    fr: {
      overview: 'Vue d\'ensemble', pos: 'Point de Vente (POS)', products: 'Produits',
      clients: 'Gestion des Clients',
      orders: 'Commandes', invoices: 'Éditer Factures', expenses: 'Charges et Résultat', wallet: 'Portefeuille', settings: 'Paramètres',
      dashboard: 'Tableau de bord', gestionVentes: 'GESTION DES VENTES', gestionProduits: 'GESTION DES PRODUITS',
      gestionAchats: 'ACHATS & FOURNISSEURS', fournisseurs: 'Fournisseurs', achats: 'Achats (Stock In)',
      gestionFactures: 'GESTION DES FACTURES', factures: 'Factures', devis: 'Devis',
      bc: 'Bons de Commande', fe: 'Fiches d\'Expédition', bl: 'Bons de Livraison', avoir: 'Avoir', facturesAchat: 'Factures d\'Achat',
      gestionCaisses: 'GESTION DES CAISSES', caisses: 'Caisses & Banques',
      rh: 'RESSOURCES HUMAINES', gestionEmployes: 'Gestion des Employés',
      fiscal: 'SYSTÈME FISCAL', decTva: 'Déclarations TVA', chargesEnt: 'CHARGES ENTREPRISE', gestionCharges: 'Gestion des Charges',
      accounting: 'Comptabilité & Bilan', logout: 'Déconnexion'
    }
  }[language];

  // 👈 تمت إضافة قسم "gestionAchats" في المصفوفة الخاصة بنسخة Enterprise
  const enterpriseMenu = [
    { name: t.dashboard, icon: LayoutDashboard, path: '/', alwaysShow: true },
    {
      group: t.gestionVentes, icon: ShoppingCart, requiredPermission: 'sales',
      subItems: [
        { name: t.pos, path: '/pos' },
        { name: t.orders, path: '/orders' },
        { name: t.clients, path: '/clients' }
      ]
    },
    {
      group: t.gestionProduits, icon: Package, requiredPermission: 'products',
      subItems: [
        { name: t.products, path: '/products' }
      ]
    },
    {
      group: t.gestionAchats, icon: Truck, requiredPermission: 'products',
      subItems: [
        { name: t.fournisseurs, path: '/suppliers' },
        { name: t.achats, path: '/purchases' }
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
      group: t.gestionCaisses, icon: Wallet, requiredPermission: 'accounting',
      subItems: [{ name: t.caisses, path: '/caisses' }]
    },
    {
      group: t.rh, icon: Briefcase, requiredPermission: 'hr',
      subItems: [{ name: t.gestionEmployes, path: '/hr' }]
    },
    {
      group: t.fiscal, icon: Landmark, requiredPermission: 'accounting',
      subItems: [{ name: t.decTva, path: '/fiscal' }]
    },
    {
      group: t.chargesEnt, icon: CreditCard, requiredPermission: 'accounting',
      subItems: [{ name: t.gestionCharges, path: '/expenses' }]
    },
    {
      group: t.accounting, icon: Calculator, requiredPermission: 'accounting',
      subItems: [{ name: t.accounting, path: '/accounting' }]
    },
    { name: t.settings, icon: Settings, path: '/settings', adminOnly: true }
  ];

  const filteredEnterpriseMenu = enterpriseMenu.filter(item => {
    if (role === 'admin') return true;
    if (item.adminOnly) return false;
    if (item.alwaysShow) return true;
    if (item.requiredPermission) return userPermissions[item.requiredPermission];
    return false;
  });

  // 👈 تمت إضافة الروابط أيضاً في المصفوفة الخاصة بالنسخة العادية (Starter)
  const normalMenuItems = [
    { name: t.overview, icon: LayoutDashboard, path: '/', minTier: 'starter' },
    { name: t.pos, icon: MonitorPlay, path: '/pos', minTier: 'starter' },
    { name: t.orders, icon: ShoppingCart, path: '/orders', minTier: 'starter' },
    { name: t.clients, icon: Users, path: '/clients', minTier: 'starter' },
    { name: t.products, icon: Package, path: '/products', minTier: 'starter' },
    { name: t.fournisseurs, icon: Truck, path: '/suppliers', minTier: 'starter' },
    { name: t.achats, icon: ShoppingBag, path: '/purchases', minTier: 'starter' },
    { name: t.invoices, icon: FileText, path: '/invoices', minTier: 'pro' },
    { name: t.expenses, icon: Receipt, path: '/expenses', minTier: 'pro' },
    { name: t.wallet, icon: Wallet, path: '/wallet', minTier: 'pro' },
    { name: t.settings, icon: Settings, path: '/settings', minTier: 'starter' },
  ].filter(item => tier === 'pro' ? true : item.minTier === 'starter');

  return (
    <div className={`w-[280px] h-screen bg-[#2d2252] text-gray-200 flex flex-col ${language === 'fr' ? 'border-r border-white/10' : 'border-l border-white/10'}`} dir={language === 'fr' ? 'ltr' : 'rtl'}>
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">SouqBTP</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${isEnterprise ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>{tier}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${role === 'admin' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-300'}`}>
              {role === 'admin' ? 'Propriétaire' : 'Employé'}
            </span>
          </div>
        </div>
        <button onClick={toggleLanguage} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white flex flex-col items-center justify-center" title="تغيير لغة النظام">
          <Globe size={18} />
          <span className="text-[10px] font-bold mt-1">{language === 'fr' ? 'AR' : 'FR'}</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {isEnterprise ? (
          <div className="space-y-1">
            {filteredEnterpriseMenu.map((item, idx) => {
              if (!item.group) {
                return (
                  <NavLink key={idx} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${isActive ? 'text-green-400 font-bold border-l-4 border-green-400 bg-white/5' : 'hover:bg-white/5 hover:text-white'}`}>
                    <item.icon size={18} /><span>{item.name}</span>
                  </NavLink>
                );
              }
              const isOpen = openMenus[item.group];
              const isActiveGroup = item.subItems.some(sub => location.pathname === sub.path);
              return (
                <div key={idx} className="mb-2">
                  <button onClick={() => toggleMenu(item.group)} className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors outline-none ${isActiveGroup ? 'text-green-400 font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                    <div className="flex items-center gap-3"><item.icon size={18} /><span className="uppercase text-[11px] tracking-wider font-bold">{item.group}</span></div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {isOpen && (
                    <div className="pl-12 pr-4 py-1 space-y-1">
                      {item.subItems.map((sub, subIdx) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <NavLink key={subIdx} to={sub.path} className={`flex items-center gap-3 py-2 text-sm transition-colors ${isSubActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-green-400' : 'border border-gray-400'}`} />{sub.name}
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
                  <Icon size={20} /><span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 px-6 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
          <LogOut size={18} /><span className="text-sm font-medium">{t.logout}</span>
        </button>
      </div>
    </div>
  );
}