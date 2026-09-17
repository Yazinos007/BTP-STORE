import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Calculator, UserCircle, MessageCircle, Store, Map, Users, Wallet, 
  Receipt, Landmark, BarChart3, Radar, Camera, Truck, Package, ShieldCheck
} from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore';

export default function SmartSidebar({ accountType, storeName, logoUrl }) {
  const { language = 'ar' } = useSettingsStore();

  const isRtl = language === 'ar';
  
  const t = {
    ar: {
      roleTitle: "مكتب المقاول",
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
      audit: "التدقيق الذكي (Audit)",
      b2bInvoices: 'فواتير B2B',
      freight: 'بورصة الشحن',
      liveOrders: 'الطلبات اللحظية', 
      prof: "الملف الشخصي"
    },
    fr: {
      roleTitle: "Bureau d'Entrepreneur",
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
      audit: "Audit IA",
      b2bInvoices: 'Factures B2B',
      freight: 'Bourse de Fret',
      liveOrders: 'Commandes Live', // 🚀 تمت إضافته هنا
      prof: "Profil"
    },
    en: {
      roleTitle: "Contractor Office",
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
      audit: "Smart Audit",
      b2bInvoices: 'B2B Invoices',
      freight: 'Freight Exchange',
      liveOrders: 'Live Orders', 
      prof: "Profile"
    }
  }[language] || {};

  const colorMap = {
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

  const roleMenus = {
    contractor: [
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

  const currentMenu = roleMenus[accountType] || roleMenus['contractor'];

  return (
    <>
      <style>
        {`
          @keyframes shimmer-sweep { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
          .text-shimmer { background-size: 200% auto; animation: shimmer-sweep 5s linear infinite; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
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
            <h2 className="text-white font-black text-lg tracking-wide truncate">SouqBTP V2</h2>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full w-max mt-1 border border-emerald-500/20">{t.roleTitle}</span>
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
                      className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm transition-all duration-300 ${isRtl ? 'border-r-4' : 'border-l-4'} ${
                        isActive 
                          ? `${theme.active} font-black ${theme.border} my-1 mx-2${isRtl ? 'rounded-l-lg' : 'rounded-r-lg'}` 
                          : `border-transparent font-bold text-slate-400 ${theme.hover}${isRtl ? 'hover:-translate-x-1' : 'hover:translate-x-1'}`
                      }`}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon size={20} className={`transition-all duration-300 shrink-0 ${isActive ? theme.icon : "opacity-70"}`} />
                          <span>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </>
  );
}