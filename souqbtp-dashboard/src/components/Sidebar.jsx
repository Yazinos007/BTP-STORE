import { useState } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Wallet, 
  Settings, Receipt, Users, FileText, Briefcase, Landmark,
  ChevronDown, ChevronRight, CreditCard, Globe, Calculator,
  Truck, Store, MessageCircle, Video, Image, UserCircle, Home, Zap
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore';

const translations = {
  ar: {
    // ترجمات التاجر والمورد
    overview: 'نظرة عامة', pos: 'نقطة البيع (POS)', products: 'المنتجات', clients: 'العملاء والديون',
    orders: 'الطلبات', invoices: 'إصدار الفواتير', expenses: 'المصاريف والربح', wallet: 'المحفظة', settings: 'الإعدادات',
    dashboard: 'لوحة القيادة', gestionVentes: 'إدارة المبيعات', gestionProduits: 'إدارة المنتجات',
    gestionAchats: 'الموردون والمشتريات', fournisseurs: 'الموردون', achats: 'مشتريات (Stock In)',
    gestionFactures: 'إدارة الفواتير', factures: 'الفواتير', devis: 'عروض الأسعار',
    bc: 'أوامر الشراء', fe: 'قسائم الشحن', bl: 'سندات التسليم', avoir: 'المرتجعات (Avoir)', facturesAchat: 'فواتير الشراء',
    gestionCaisses: 'الصناديق والحسابات', caisses: 'الصناديق البنكية', rh: 'الموارد البشرية', gestionEmployes: 'إدارة الموظفين',
    fiscal: 'النظام الجبائي', decTva: 'إقرارات TVA', chargesEnt: 'المصاريف والرسوم', gestionCharges: 'إدارة المصاريف',
    accounting: 'المحاسبة العامة', profileSettings: 'الملف الشخصي', upgrade: 'ترقية الحساب (Pro)',
    manageSub: 'إدارة الاشتراك', owner: 'المالك', employee: 'موظف', foundingPartner: 'شريك مؤسس', changeLangTitle: 'تغيير لغة النظام',
    
    // ترجمات الأقسام المشتركة
    marketplace: 'سوق مواد البناء', messages: 'صندوق الرسائل',

    // ترجمات المقاول
    contractorDash: 'إدارة الأوراش', costCalc: 'حاسبة التكاليف',

    // ترجمات المهندس
    archOverview: 'مكتب الدراسات', archProfile: 'الهوية الهندسية', archProjects: 'الرقابة والمصادقات', 
    archLive: 'محاكي العمليات (Live)', archSub: 'الباقة والاشتراك',

    // ترجمات الحرفي
    artisanHome: 'لوحة التحكم', artisanProfile: 'بيانات الحرفي', artisanPortfolio: 'معرض المشاريع', artisanLive: 'إرسال تقرير مصور'
  },
  fr: {
    // (تم اختصار الترجمات الفرنسية والإنجليزية هنا للحفاظ على مساحة الكود، يمكنك إضافتها بنفس النسق)
    marketplace: 'Marketplace BTP', messages: 'Messagerie', contractorDash: 'Gestion des Chantiers', costCalc: 'Calculateur des Coûts',
    archOverview: 'Bureau d\'études', archProfile: 'Profil Architecte', archProjects: 'Projets & Validations', archLive: 'Salle Visio (Live)', archSub: 'Abonnement',
    artisanHome: 'Tableau de bord', artisanProfile: 'Profil Artisan', artisanPortfolio: 'Portfolio', artisanLive: 'Rapport Vidéo'
  },
  en: {
    marketplace: 'BTP Marketplace', messages: 'Inbox', contractorDash: 'Site Management', costCalc: 'Cost Calculator',
    archOverview: 'Firm Overview', archProfile: 'Architect Profile', archProjects: 'Projects & Approvals', archLive: 'Live Room', archSub: 'Subscription',
    artisanHome: 'Dashboard', artisanProfile: 'Provider Profile', artisanPortfolio: 'Portfolio', artisanLive: 'Live Report'
  }
};

// 🚀 إضافة prop لمعرفة نوع الحساب (accountType)
export default function Sidebar({ accountType = 'retailer' }) {
  const { supplier, isLoading } = useSupplierStore();
  const { language, setLanguage } = useSettingsStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  const handleLanguageChange = () => {
    if (language === 'fr') setLanguage('ar');
    else if (language === 'ar') setLanguage('en');
    else setLanguage('fr');
  };

  const t = translations[language] || translations['ar'];

  if (isLoading) return <div className={`w-[280px] h-screen bg-[#2d2252] shrink-0 border-white/10 animate-pulse`} />;
  
  const safeSupplier = supplier || { store_name: 'SouqBTP User', tier: 'starter', role: 'admin' };
  const tier = safeSupplier.tier || 'starter';
  const role = safeSupplier.role || 'admin';
  const isProOnly = ['pro', 'enterprise'].includes(tier); 
  const isPremiumPlus = ['premium', 'pro', 'enterprise'].includes(tier); 

  const toggleMenu = (menuName) => setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));

  // 1. القائمة المشتركة للجميع (تظهر في الأسفل دائماً)
  const sharedMenu = [
    { name: t.messages, icon: MessageCircle, path: '/messages' },
    { name: t.marketplace, icon: Store, path: '/marketplace' }
  ];

  // 2. القوائم المخصصة حسب نوع الحساب
  const roleMenus = {
    // 🛠️ قائمة المقاول (Contractor)
    contractor: [
      { name: t.contractorDash, icon: LayoutDashboard, path: '/contractor-dashboard' },
      { name: t.costCalc, icon: Calculator, path: '/cost-calculator' },
    ],
    
    // 📐 قائمة المهندس (Architect)
    architect: [
      { name: t.archOverview, icon: LayoutDashboard, path: '/architect-overview' },
      { name: t.archProfile, icon: UserCircle, path: '/architect-profile' },
      { name: t.archProjects, icon: Briefcase, path: '/architect-projects' },
      { name: t.archLive, icon: Video, path: '/architect-live-room' },
      { name: t.archSub, icon: CreditCard, path: '/architect-subscription' },
    ],

    // 👷 قائمة المعلم/الحرفي (Artisan)
    artisan: [
      { name: t.artisanHome, icon: Home, path: '/artisan-home' },
      { name: t.artisanProfile, icon: UserCircle, path: '/artisan-profile' },
      { name: t.artisanPortfolio, icon: Image, path: '/artisan-portfolio' },
      { name: t.artisanLive, icon: Video, path: '/artisan-live-room' },
    ],

    // 🏪 قائمة تاجر التجزئة والمورد (Retailer & Wholesale) - وهي القائمة القديمة
    retailer: [
      { name: t.dashboard, icon: LayoutDashboard, path: '/' },
      { group: t.gestionAchats, icon: Truck, subItems: [{ name: t.fournisseurs, path: '/suppliers' }, { name: t.achats, path: '/purchases' }] },
      { group: t.gestionProduits, icon: Package, subItems: [{ name: t.products, path: '/products' }] },
      { group: t.gestionVentes, icon: ShoppingCart, subItems: [{ name: t.pos, path: '/pos' }, { name: t.orders, path: '/orders' }, { name: t.clients, path: '/clients' }] },
      { group: t.gestionFactures, icon: FileText, subItems: [
          { name: t.factures, path: '/invoices' }, 
          ...(isPremiumPlus ? [{ name: t.devis, path: '/devis' }, { name: t.bc, path: '/bc' }, { name: t.fe, path: '/fiches-expedition' }, { name: t.bl, path: '/bl' }, { name: t.avoir, path: '/avoir' }, { name: t.facturesAchat, path: '/factures-achat' }] : [])
        ]
      },
      ...(isProOnly ? [{ group: t.rh, icon: Briefcase, subItems: [{ name: t.gestionEmployes, path: '/hr' }] }] : []),
      ...(isProOnly ? [{ group: t.gestionCaisses, icon: Wallet, subItems: [{ name: t.caisses, path: '/caisses' }] }] : []),
      ...(isPremiumPlus ? [{ group: t.chargesEnt, icon: CreditCard, subItems: [{ name: t.gestionCharges, path: '/expenses' }] }] : []),
      ...(isProOnly ? [{ group: t.fiscal, icon: Landmark, subItems: [{ name: t.decTva, path: '/fiscal' }] }] : []),
      ...(isProOnly ? [{ group: t.accounting, icon: Calculator, subItems: [{ name: t.accounting, path: '/accounting' }] }] : []),
      { name: t.profileSettings, icon: Settings, path: '/settings', adminOnly: true }
    ],
    // يمكن نسخ مسارات Retailer إلى Wholesale إذا كانا يتشاركان نفس الواجهة في تطبيق React حالياً
    wholesale: [] 
  };

  // دمج القائمة المخصصة مع القائمة المشتركة
  const activeRoleMenu = roleMenus[accountType] || roleMenus['retailer'];
  if (accountType === 'wholesale' && activeRoleMenu.length === 0) {
      activeRoleMenu.push(...roleMenus['retailer']); // مؤقتاً حتى تفصل المورد إن أردت
  }
  
  const currentMenu = [...activeRoleMenu, ...sharedMenu];

  return (
    <div className={`w-[280px] h-screen bg-[#2d2252] text-gray-200 flex flex-col ${language === 'ar' ? 'border-l border-white/10' : 'border-r border-white/10'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-6 border-b border-white/10 flex flex-col gap-5 shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 min-w-[64px] rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-3xl shadow-xl border-2 border-white/10 overflow-hidden shrink-0">
              {supplier?.logo_url ? <img src={supplier.logo_url} alt="Logo" className="w-full h-full object-cover" /> : safeSupplier.store_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="flex flex-col overflow-hidden justify-center h-16 text-start">
              <h2 className="text-white font-black text-xl leading-tight truncate w-[140px] mb-1.5" title={safeSupplier.store_name}>
                {safeSupplier.store_name || 'SouqBTP'}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-wide bg-white/20 text-white`}>
                  {accountType}
                </span>
              </div>
            </div>
          </div>
          <button onClick={handleLanguageChange} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white flex flex-col items-center justify-center min-w-[48px] cursor-pointer" title={t.changeLangTitle}>
            <Globe size={20} />
            <span className="text-[11px] font-bold mt-1 uppercase">{language}</span>
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar text-start pb-24">
        <div className="space-y-1">
          {currentMenu.map((item, idx) => {
            if (item.adminOnly && role !== 'admin') return null;

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
                          <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'border border-gray-400'}`} /><span>{sub.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}