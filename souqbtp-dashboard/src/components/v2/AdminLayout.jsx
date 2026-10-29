import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, Settings, 
  Database, HardHat, Map, BarChart3, LogOut, CreditCard 
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const adminLinks = [
    { path: '/v2/admin-dashboard', label: 'غرفة القيادة', icon: LayoutDashboard },
    { path: '/v2/admin-billing', label: 'الاشتراكات والفوترة 💳', icon: CreditCard },
    { path: '/v2/admin-crm', label: 'CRM & الحرفيين', icon: Users },
    { path: '/v2/admin-workshops', label: 'الورش (God Mode)', icon: Map },
    { path: '/v2/admin-services', label: 'الخدمات', icon: Briefcase },
    { path: '/v2/admin-cost-items', label: 'الأسعار', icon: HardHat },
    { path: '/v2/admin-analytics', label: 'التحليلات', icon: BarChart3 },
    { path: '/v2/admin-global-settings', label: 'الإعدادات', icon: Settings },
    { path: '/v2/admin-audit', label: 'الصندوق الأسود', icon: Database },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-cairo" dir="rtl">
      {/* الشريط الجانبي المخصص للأدمن */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 shrink-0 h-full overflow-y-auto hidden md:flex">
        <div className="p-6 border-b border-slate-800 shrink-0">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-blue-500">SasBTP</span> Admin
          </h2>
          <span className="text-slate-400 text-sm font-bold mt-1 block">Super Administrator</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {adminLinks.map((link) => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={() => {/* إضافة دالة تسجيل الخروج هنا لاحقاً */}}
            className="flex items-center gap-3 px-4 py-3 w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all font-bold"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* منطقة المحتوى الرئيسية */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* شريط علوي للهواتف (يظهر فقط على الشاشات الصغيرة) */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 shadow-md z-20">
          <h2 className="text-xl font-black">SasBTP Admin</h2>
          {/* يمكن إضافة زر همبرغر هنا لفتح قائمة منسدلة في المستقبل */}
        </header>
        
        {/* محتوى الصفحة (يتغير حسب المسار) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}