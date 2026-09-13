import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calculator, Briefcase, UserCircle, Video, 
  Home, Image, MessageCircle, Store, Map, Users, Wallet, 
  Receipt, Landmark, BarChart3, Radar, Camera
} from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore';

export default function SmartSidebar({ accountType, storeName, logoUrl }) {
  const { language } = useSettingsStore();

  // 🚀 الهيكلة الجديدة المأخوذة من مسودتك + الإضافات المبهرة
  const roleMenus = {
    contractor: [
      { category: 'القيادة والميدان', items: [
        { name: 'الرئيسية', icon: LayoutDashboard, path: '/v2/contractor-dashboard' },
        { name: 'مسار الورش', icon: Map, path: '/v2/project-path' },
        { name: 'الحاسبة الذكية', icon: Calculator, path: '/v2/cost-calculator' },
        { name: 'كاميرا الميدان', icon: Camera, path: '/v2/site-reports' },
      ]},
      { category: 'التواصل والمشتريات', items: [
        { name: 'صندوق الرسائل', icon: MessageCircle, path: '/v2/messages' },
        { name: 'إدارة الموارد البشرية', icon: Users, path: '/v2/hr' },
        { name: 'سوق BTP', icon: Store, path: '/v2/marketplace' },
        { name: 'رادار المناقصات', icon: Radar, path: '/v2/tenders' },
      ]},
      { category: 'المالية والمحاسبة', items: [
        { name: 'الصناديق والحسابات', icon: Wallet, path: '/v2/accounts' },
        { name: 'المصاريف والرسوم', icon: Receipt, path: '/v2/expenses' },
        { name: 'النظام الجبائي', icon: Landmark, path: '/v2/taxes' },
        { name: 'المحاسبة العامة', icon: BarChart3, path: '/v2/accounting' },
      ]},
      { category: 'الإعدادات', items: [
        { name: 'الملف الشخصي', icon: UserCircle, path: '/v2/profile' },
      ]}
    ]
  };

  const currentMenu = roleMenus[accountType] || roleMenus['contractor'];

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-300 border-l border-slate-800 shadow-2xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* رأس السايدبار */}
      <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-white/10">
          {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full rounded-2xl object-cover" /> : storeName?.charAt(0) || 'S'}
        </div>
        <div className="flex flex-col truncate">
          <h2 className="text-white font-black text-lg tracking-wide truncate">SouqBTP V2</h2>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full w-max mt-1 border border-emerald-500/20">مكتب المقاول</span>
        </div>
      </div>

      {/* الروابط المقسمة */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {currentMenu.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">{group.category}</h3>
            <div className="space-y-1">
              {group.items.map((item, idx) => (
                <NavLink 
                  key={idx} 
                  to={item.path} 
                  className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm transition-all duration-300 ${isActive ? 'text-white font-black bg-blue-600/20 border-r-4 border-blue-500 shadow-inner' : 'font-bold text-slate-400 hover:bg-slate-800/80 hover:text-white hover:translate-x-1'}`}
                >
                  <item.icon size={20} className={({ isActive }) => isActive ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" : "opacity-70"} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}