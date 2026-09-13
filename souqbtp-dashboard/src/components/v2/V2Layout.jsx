import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import SmartSidebar from './SmartSidebar';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function V2Layout({ accountType, storeName, storeInitial }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const { language } = useSettingsStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = 'https://souqbtp.ma/app/auth.html';
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex h-full w-full overflow-hidden relative">
        <aside className={`shrink-0 h-full transition-all duration-300 z-30 absolute md:relative ${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 opacity-0 overflow-hidden'}`}>
          <SmartSidebar accountType={accountType} storeName={storeName} />
        </aside>
        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:text-blue-600 transition-colors">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="font-bold text-slate-800 hidden sm:block">
                مرحباً بك، <span className="text-blue-600">{storeName}</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">
                <LogOut size={16} /> <span className="hidden sm:inline">خروج</span>
              </button>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-md">
                {storeInitial}
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}