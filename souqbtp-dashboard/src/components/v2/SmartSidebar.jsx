import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calculator, UserCircle, MessageCircle, Store, Map, Users, Wallet, 
  Receipt, Landmark, BarChart3, Radar, Camera, Truck, Package, ShieldCheck, Zap, 
  ImageIcon, Compass, FileCheck2, Archive, Award, HardHat
} from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore';

export default function SmartSidebar({ accountType, storeName, logoUrl }) {
  const { language = 'ar' } = useSettingsStore();
  const location = useLocation();

  const isRtl = language === 'ar';

  // 🧠 تحديد الرتبة الفعالة بذكاء (من الـ Props أو من الرابط الحالي لمنع أي اختلاط)
  const effectiveRole = (() => {
    const path = location.pathname;
    if (accountType === 'architect' || path.includes('/architect')) return 'architect';
    if (accountType === 'provider' || path.includes('/provider-')) return 'provider';
    return accountType || 'contractor';
  })();

  const t = {
    ar: {
      // ألقاب الحسابات
      roleContractor: "مكتب المقاول",
      roleArchitect: "مكتب الدراسات الهندسية",
      roleProvider: "فضاء الحرفي المعتمد",

      // تصنيفات وأزرار المقاول العام
      premium: "الترقية والـ VIP 👑",
      sub: "الترقية للإمبراطورية ⚡",
      cat1: "القيادة والميدان",
      cat2: "التواصل والمشتريات",
      cat3: "المالية والمحاسبة",
      cat4: "الإعدادات",
      dash: "الرئيسية",
      path: "مسار الورش",
      calc: "الحاسبة الذكية",
      cam: "كاميرا الميدان",
      msg: "صندوق الرسائل",
      hr: "إدارة الموارد البشرية",
      market: "سوق BTP",
      radar: "رادار المناقصات",
      acc: "الصناديق والحسابات",
      exp: "المصاريف والرسوم",
      tax: "النظام الجبائي",
      cpc: "المحاسبة العامة",
      b2bInvoices: "فواتير B2B",
      freight: "بورصة الشحن",
      liveOrders: "الطلبات اللحظية",
      audit: "التدقيق الذكي (Audit)",
      prof: "الملف الشخصي",

      // تصنيفات وأزرار المهندس المعماري
      archSub: "باقات النخبة (VIP) 👑",
      archCat1: "الإشراف الهندسي",
      archCat2: "التواصل والسوق",
      archDash: "مكتب الدراسات (الرئيسية)",
      archProjects: "الرقابة والمصادقات",
      archArchive: "الأرشيف والتقارير",
      archProfile: "الهوية الهندسية (البرستيج)",

      // تصنيفات وأزرار الحرفي
      provCat1: "إدارة أعمالي",
      provDash: "لوحة الحرفي (الرئيسية)",
      provProfile: "بيانات الحرفي",
      provPortfolio: "معرض المشاريع (Portfolio)"
    },
    fr: {
      roleContractor: "Bureau d'Entrepreneur",
      roleArchitect: "Bureau d'Architecture",
      roleProvider: "Espace Artisan Pro",

      premium: "Abonnement VIP 👑",
      sub: "Passer à l'Enterprise ⚡",
      cat1: "Direction & Terrain",
      cat2: "Communication & Achats",
      cat3: "Finance & Comptabilité",
      cat4: "Paramètres",
      dash: "Tableau de Bord",
      path: "Parcours Projet",
      calc: "Calculateur Intelligent",
      cam: "Caméra du Chantier",
      msg: "Boîte de Réception",
      hr: "Ressources Humaines",
      market: "Marché BTP",
      radar: "Radar Appels d'offres",
      acc: "Caisses & Comptes",
      exp: "Dépenses & Frais",
      tax: "Système Fiscal",
      cpc: "Comptabilité Générale",
      b2bInvoices: "Factures B2B",
      freight: "Bourse de Fret",
      liveOrders: "Commandes Live",
      audit: "Audit IA",
      prof: "Profil",

      archSub: "Plans Élite (VIP) 👑",
      archCat1: "Direction Architecturale",
      archCat2: "Communication & Marché",
      archDash: "Bureau d'Études (Accueil)",
      archProjects: "Contrôle & Approbations",
      archArchive: "Archives & Rapports",
      archProfile: "Identité & Prestige",

      provCat1: "Gestion Artisan",
      provDash: "Tableau Artisan (Accueil)",
      provProfile: "Mes Informations",
      provPortfolio: "Mon Portfolio"
    },
    en: {
      roleContractor: "Contractor Office",
      roleArchitect: "Architectural Firm",
      roleProvider: "Certified Artisan Hub",

      premium: "Upgrade & VIP 👑",
      sub: "Upgrade to Enterprise ⚡",
      cat1: "Leadership & Field",
      cat2: "Communication & Purchases",
      cat3: "Finance & Accounting",
      cat4: "Settings",
      dash: "Dashboard",
      path: "Project Path",
      calc: "Smart Calculator",
      cam: "Site Camera",
      msg: "Inbox",
      hr: "Human Resources",
      market: "BTP Marketplace",
      radar: "Tenders Radar",
      acc: "Accounts & Funds",
      exp: "Expenses & Fees",
      tax: "Tax System",
      cpc: "General Accounting",
      b2bInvoices: "B2B Invoices",
      freight: "Freight Exchange",
      liveOrders: "Live Orders",
      audit: "Smart Audit",
      prof: "Profile",

      archSub: "Elite VIP Plans 👑",
      archCat1: "Architectural Supervision",
      archCat2: "Communication & Market",
      archDash: "Engineering Office (Home)",
      archProjects: "Supervision & Approvals",
      archArchive: "Archive & Reports",
      archProfile: "Architectural Identity",

      provCat1: "My Practice",
      provDash: "Artisan Dashboard",
      provProfile: "Artisan Profile",
      provPortfolio: "Project Portfolio"
    }
  }[language] || {};

  const colorMap = {
    vip: {
      active: 'bg-orange-500/20 border-orange-500 text-orange-400 active-pulse-vip',
      icon: 'text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.9)] animate-pulse',
      hover: 'hover:bg-orange-500/10 hover:text-orange-300',
      border: 'border-orange-500',
      header: 'text-orange-400 font-black tracking-widest drop-shadow-[0_0_5px_rgba(249,115,22,0.6)]'
    },
    orange: {
      active: 'bg-orange-500/20 border-orange-500 text-white active-pulse-orange',
      icon: 'text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]',
      hover: 'hover:bg-orange-500/10 hover:text-orange-300',
      border: 'border-orange-500',
      header: 'bg-gradient-to-r from-orange-500 via-white to-orange-500 text-shimmer'
    },
    emerald: {
      active: 'bg-emerald-500/20 border-emerald-500 text-white active-pulse-emerald',
      icon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      hover: 'hover:bg-emerald-500/10 hover:text-emerald-300',
      border: 'border-emerald-500',
      header: 'bg-gradient-to-r from-emerald-500 via-white to-emerald-500 text-shimmer'
    },
    blue: {
      active: 'bg-blue-600/20 border-blue-500 text-white active-pulse-blue',
      icon: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]',
      hover: 'hover:bg-blue-500/10 hover:text-blue-300',
      border: 'border-blue-500',
      header: 'bg-gradient-to-r from-blue-500 via-white to-blue-500 text-shimmer'
    },
    purple: {
      active: 'bg-purple-500/20 border-purple-500 text-white active-pulse-purple',
      icon: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
      hover: 'hover:bg-purple-500/10 hover:text-purple-300',
      border: 'border-purple-500',
      header: 'bg-gradient-to-r from-purple-500 via-white to-purple-500 text-shimmer'
    }
  };

  // 🚦 قوائم كل رتبة مفصولة بدقة تامة
  const roleMenus = {
    // 1. قائمة المهندس المعماري (Architect)
    architect: [
      { category: t.premium, color: 'vip', items: [
        { name: t.archSub, icon: Zap, path: '/v2/architect-subscription', isVIP: true },
      ]},
      { category: t.archCat1, color: 'purple', items: [
        { name: t.archDash, icon: Compass, path: '/v2/architect-dashboard' },
        { name: t.archProjects, icon: FileCheck2, path: '/v2/architect-projects' },
        { name: t.archArchive, icon: Archive, path: '/v2/architect-archive' },
      ]},
      { category: t.archCat2, color: 'emerald', items: [
        { name: t.msg, icon: MessageCircle, path: '/v2/architect-messages' }, 
        { name: t.market, icon: Store, path: '/v2/architect-marketplace' }, 
      ]},
      { category: t.cat4, color: 'blue', items: [
        { name: t.archProfile, icon: Award, path: '/v2/architect-profile' },
      ]}
    ],

    // 2. قائمة الحرفي / المعلم (Provider)
    provider: [
      { category: t.provCat1, color: 'orange', items: [
        { name: t.provDash, icon: HardHat, path: '/v2/provider-dashboard' },
        { name: t.provPortfolio, icon: ImageIcon, path: '/v2/provider-portfolio' },
      ]},
      { category: t.cat2, color: 'emerald', items: [
        { name: t.msg, icon: MessageCircle, path: '/v2/provider-messages' }, 
        { name: t.market, icon: Store, path: '/v2/provider-marketplace' }, 
      ]},
      { category: t.cat4, color: 'purple', items: [
        { name: t.provProfile, icon: UserCircle, path: '/v2/provider-profile' },
      ]}
    ],

    // 3. قائمة المقاول العام (Contractor)
    contractor: [
      { category: t.premium, color: 'vip', items: [
        { name: t.sub, icon: Zap, path: '/v2/subscription', isVIP: true },
      ]},
      { category: t.cat1, color: 'orange', items: [
        { name: t.dash, icon: LayoutDashboard, path: '/v2/contractor-dashboard' },
        { name: t.path, icon: Map, path: '/v2/project-path' },
        { name: t.calc, icon: Calculator, path: '/v2/cost-calculator' },
        { name: t.cam, icon: Camera, path: '/v2/field-camera' },
      ]},
      { category: t.cat2, color: 'emerald', items: [
        { name: t.msg, icon: MessageCircle, path: '/v2/messages' },
        { name: t.market, icon: Store, path: '/v2/marketplace' },
        { name: t.radar, icon: Radar, path: '/v2/tenders' },
        { name: t.freight, icon: Truck, path: '/v2/freight-exchange' },
        { name: t.liveOrders, icon: Package, path: '/v2/live-orders' },
      ]},
      { category: t.cat3, color: 'blue', items: [
        { name: t.hr, icon: Users, path: '/v2/hr' },
        { name: t.b2bInvoices, icon: Receipt, path: '/v2/b2b-invoices' },
        { name: t.acc, icon: Wallet, path: '/v2/accounts' },
        { name: t.exp, icon: Receipt, path: '/v2/expenses' },
        { name: t.tax, icon: Landmark, path: '/v2/taxes' },
        { name: t.cpc, icon: BarChart3, path: '/v2/accounting' },
        { name: t.audit, icon: ShieldCheck, path: '/v2/audit' },
      ]},
      { category: t.cat4, color: 'purple', items: [
        { name: t.prof, icon: UserCircle, path: '/v2/profile' },
      ]}
    ]
  };

  const currentMenu = roleMenus[effectiveRole] || roleMenus.contractor;

  const currentRoleLabel =
    effectiveRole === 'architect'
      ? t.roleArchitect
      : effectiveRole === 'provider'
      ? t.roleProvider
      : t.roleContractor;

  const badgeColors =
    effectiveRole === 'architect'
      ? 'text-purple-300 bg-purple-500/15 border-purple-500/30'
      : effectiveRole === 'provider'
      ? 'text-orange-300 bg-orange-500/15 border-orange-500/30'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <>
      <style>
        {`
          @keyframes shimmer-sweep { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
          .text-shimmer { background-size: 200% auto; animation: shimmer-sweep 5s linear infinite; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          
          @keyframes pulse-border-vip { 
            0% { box-shadow: 0 0 0 0 rgba(249,115,22,0.6); background-color: rgba(249,115,22,0.1); } 
            70% { box-shadow: 0 0 0 10px rgba(249,115,22,0); background-color: rgba(249,115,22,0.2); } 
            100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); background-color: rgba(249,115,22,0.1); } 
          }
          .active-pulse-vip { animation: pulse-border-vip 2s infinite; }
          .vip-btn-glow { 
            background: linear-gradient(90deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%);
            border-left-color: #f97316;
            animation: pulse-border-vip 3s infinite;
          }
          .vip-text-glow {
            text-shadow: 0 0 8px rgba(249,115,22,0.8);
            color: #fb923c !important;
          }
          
          @keyframes pulse-border-orange { 0% { box-shadow: 0 0 0 0 rgba(249,115,22,0.5); } 70% { box-shadow: 0 0 0 8px rgba(249,115,22,0); } 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); } }
          @keyframes pulse-border-emerald { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
          @keyframes pulse-border-blue { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); } 70% { box-shadow: 0 0 0 8px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }
          @keyframes pulse-border-purple { 0% { box-shadow: 0 0 0 0 rgba(168,85,247,0.5); } 70% { box-shadow: 0 0 0 8px rgba(168,85,247,0); } 100% { box-shadow: 0 0 0 0 rgba(168,85,247,0); } }
          
          .active-pulse-orange { animation: pulse-border-orange 2s infinite; }
          .active-pulse-emerald { animation: pulse-border-emerald 2s infinite; }
          .active-pulse-blue { animation: pulse-border-blue 2s infinite; }
          .active-pulse-purple { animation: pulse-border-purple 2s infinite; }
        `}
      </style>

      <div className="flex flex-col h-full bg-[#0f172a] text-slate-300 border-l border-slate-800 shadow-2xl relative z-40" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-white/10 shrink-0">
            {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full rounded-2xl object-cover" /> : storeName?.charAt(0) || 'S'}
          </div>
          <div className="flex flex-col truncate">
            <h2 className="text-white font-black text-lg tracking-wide truncate">SasBTP V2</h2>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full w-max mt-1 border ${badgeColors}`}>
              {currentRoleLabel}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {currentMenu.map((group, groupIdx) => {
            const theme = colorMap[group.color];
            return (
              <div key={groupIdx} className="mb-6">
                <h3 className={`px-6 text-[12px] font-black uppercase tracking-widest mb-3 ${theme.header}`}>{group.category}</h3>
                <div className="space-y-1">
                  {group.items.map((item, idx) => (
                    <NavLink 
                      key={idx} 
                      to={item.path} 
                      className={({ isActive }) => `flex items-center gap-3 px-6 py-3.5 text-sm transition-all duration-300 ${isRtl ? 'border-r-4' : 'border-l-4'} ${
                        isActive 
                          ? `${theme.active} font-black ${theme.border} my-1 mx-2${isRtl ? 'rounded-l-lg' : 'rounded-r-lg'}` 
                          : `font-bold text-slate-400 border-transparent ${theme.hover} ${isRtl ? 'hover:-translate-x-1' : 'hover:translate-x-1'} ${item.isVIP ? 'vip-btn-glow' : ''}`
                      }`}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon size={20} className={`transition-all duration-300 shrink-0 ${isActive ? theme.icon : item.isVIP ? 'text-orange-500 animate-pulse' : 'opacity-70'}`} />
                          <span className={item.isVIP && !isActive ? 'vip-text-glow' : ''}>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}