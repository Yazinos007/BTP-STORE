import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Calculator, UserCircle, MessageCircle, Store, Map, Users, Wallet, 
  Receipt, Landmark, BarChart3, Radar, Camera
} from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore';

export default function SmartSidebar({ accountType, storeName, logoUrl }) {
  const { language } = useSettingsStore();

  // 🚀 خريطة الألوان المحدثة مع النبض (Pulse) والوميض (Shimmer)
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
      { category: 'القيادة والميدان', color: 'orange', items: [
        { name: 'الرئيسية', icon: LayoutDashboard, path: '/v2/contractor-dashboard' },
        { name: 'مسار الورش', icon: Map, path: '/v2/project-path' },
        { name: 'الحاسبة الذكية', icon: Calculator, path: '/v2/cost-calculator' },
        { name: 'كاميرا الميدان', icon: Camera, path: '/v2/site-reports' },
      ]},
      { category: 'التواصل والمشتريات', color: 'emerald', items: [
        { name: 'صندوق الرسائل', icon: MessageCircle, path: '/v2/messages' },
        { name: 'إدارة الموارد البشرية', icon: Users, path: '/v2/hr' },
        { name: 'سوق BTP', icon: Store, path: '/v2/marketplace' },
        { name: 'رادار المناقصات', icon: Radar, path: '/v2/tenders' },
      ]},
      { category: 'المالية والمحاسبة', color: 'blue', items: [
        { name: 'الصناديق والحسابات', icon: Wallet, path: '/v2/accounts' },
        { name: 'المصاريف والرسوم', icon: Receipt, path: '/v2/expenses' },
        { name: 'النظام الجبائي', icon: Landmark, path: '/v2/taxes' },
        { name: 'المحاسبة العامة', icon: BarChart3, path: '/v2/accounting' },
      ]},
      { category: 'الإعدادات', color: 'purple', items: [
        { name: 'الملف الشخصي', icon: UserCircle, path: '/v2/profile' },
      ]}
    ]
  };

  const currentMenu = roleMenus[accountType] || roleMenus['contractor'];

  return (
    <>
      {/* 🌟 أكواد CSS المدمجة للتأثيرات السحرية والنبض 🌟 */}
      <style>
        {`
          /* تأثير الوميض السحري الذي يمر على العناوين */
          @keyframes shimmer-sweep {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          .text-shimmer {
            background-size: 200% auto;
            animation: shimmer-sweep 5s linear infinite;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          /* تأثير النبض الاحترافي للأزرار النشطة (كما في V1) */
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

      <div className="flex flex-col h-full bg-[#0f172a] text-slate-300 border-l border-slate-800 shadow-2xl relative z-40" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        
        {/* رأس السايدبار (اللوغو) */}
        <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-white/10 shrink-0">
            {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full rounded-2xl object-cover" /> : storeName?.charAt(0) || 'S'}
          </div>
          <div className="flex flex-col truncate">
            <h2 className="text-white font-black text-lg tracking-wide truncate">SouqBTP V2</h2>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full w-max mt-1 border border-emerald-500/20">مكتب المقاول</span>
          </div>
        </div>

        {/* أقسام السايدبار الملونة */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {currentMenu.map((group, groupIdx) => {
            const theme = colorMap[group.color]; // 🎨 سحب لون الفئة
            return (
              <div key={groupIdx} className="mb-6">
                
                {/* 🚀 عنوان الفئة مع تأثير الوميض السحري */}
                <h3 className={`px-6 text-[12px] font-black uppercase tracking-widest mb-3 ${theme.header}`}>
                  {group.category}
                </h3>
                
                <div className="space-y-1">
                  {group.items.map((item, idx) => (
                    <NavLink 
                      key={idx} 
                      to={item.path} 
                      className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm transition-all duration-300 border-r-4 ${
                        isActive 
                          ? `${theme.active} font-black ${theme.border} my-1 mx-2 rounded-l-lg` // إضافة margin صغير عند التفعيل ليبرز النبض
                          : `border-transparent font-bold text-slate-400 ${theme.hover} hover:translate-x-1`
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