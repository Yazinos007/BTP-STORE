import { useState } from 'react';
import { Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import SmartSidebar from './SmartSidebar';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function V2Layout({ accountType, storeName, storeInitial }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isDarkMode, setIsDarkMode] = useState(false); // 🚀 مفتاح الإضاءة أصبح عاماً لكل المنصة
  const { language } = useSettingsStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = 'https://souqbtp.ma/app/auth.html';
  };

  return (
    // 🎨 تطبيق الخلفية المريحة على كامل الشاشة
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#a3e6cd]'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex h-full w-full overflow-hidden relative">
        
        <aside className={`shrink-0 h-full transition-all duration-300 z-30 absolute md:relative ${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 opacity-0 overflow-hidden'}`}>
          <SmartSidebar accountType={accountType} storeName={storeName} />
        </aside>

        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          {/* 🚀 الشريط العلوي الموحد (يحتوي على زر الإضاءة الجديد) */}
          <header className={`h-20 border-b flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm transition-colors duration-700 ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white/40 border-white/50 backdrop-blur-md'}`}>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-blue-400' : 'bg-white/60 text-slate-700 hover:text-blue-600'}`}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h2 className={`font-black hidden sm:block tracking-wide ${isDarkMode ? 'text-white' : 'text-[#0f3b25]'}`}>
                مرحباً بك، <span className="text-blue-600">{storeName}</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* 💡 زر تبديل الإضاءة */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-md hover:scale-105 ${
                  isDarkMode ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-[#0f3b25] text-white border border-[#0f3b25]'
                }`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className="hidden md:inline text-sm">{isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
              </button>

              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors">
                <LogOut size={18} /> <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </header>

          {/* مساحة العمل (تُمرر حالة الإضاءة لجميع الصفحات) */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 md:p-8">
            <Outlet context={{ isDarkMode }} />
          </div>
        </main>
      </div>
    </div>
  );
}