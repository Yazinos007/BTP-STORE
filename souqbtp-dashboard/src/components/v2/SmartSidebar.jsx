import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calculator, Briefcase, UserCircle, Video, 
  Home, Image, MessageCircle, Store
} from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore';

export default function SmartSidebar({ accountType, storeName, logoUrl }) {
  const { language } = useSettingsStore();

  const roleMenus = {
    contractor: [
      { name: 'إدارة الأوراش', icon: LayoutDashboard, path: '/v2/contractor-dashboard' },
      { name: 'حاسبة التكاليف', icon: Calculator, path: '/v2/cost-calculator' },
    ],
    architect: [
      { name: 'مكتب الدراسات', icon: LayoutDashboard, path: '/v2/architect-overview' },
      { name: 'متابعة المشاريع', icon: Briefcase, path: '/v2/architect-projects' },
      { name: 'الغرفة الميدانية', icon: Video, path: '/v2/architect-live' },
    ],
    artisan: [
      { name: 'لوحة التحكم', icon: Home, path: '/v2/artisan-home' },
      { name: 'ملفي المهني', icon: UserCircle, path: '/v2/artisan-profile' },
      { name: 'معرض الأعمال', icon: Image, path: '/v2/artisan-portfolio' },
    ]
  };

  const sharedMenu = [
    { name: 'صندوق الرسائل', icon: MessageCircle, path: '/v2/messages' },
    { name: 'سوق BTP', icon: Store, path: '/v2/marketplace' }
  ];

  const currentMenu = [...(roleMenus[accountType] || roleMenus['contractor']), ...sharedMenu];

  return (
    <div className="flex flex-col h-full bg-[#1e293b] text-slate-300 border-l border-slate-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
          {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full rounded-xl object-cover" /> : storeName?.charAt(0) || 'S'}
        </div>
        <div className="flex flex-col truncate">
          <h2 className="text-white font-bold text-lg truncate leading-tight">SouqBTP V2</h2>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{accountType}</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {currentMenu.map((item, idx) => (
            <NavLink 
              key={idx} 
              to={item.path} 
              className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${isActive ? 'text-white font-bold bg-blue-600/20 border-r-4 border-blue-500' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon size={20} className="shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}