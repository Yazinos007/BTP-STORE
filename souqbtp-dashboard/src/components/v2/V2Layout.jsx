import { useState } from 'react';
import { Menu, X, LogOut, Sun, Moon, Globe, Layers, ChevronDown } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SmartSidebar from './SmartSidebar';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function V2Layout({ accountType, storeName, storeInitial }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSpaceOpen, setIsSpaceOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { language = 'ar', setLanguage } = useSettingsStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/v2/auth');
  };

  const languages = [
    { code: 'ar', label: 'العربية', flag: '🇲🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  const changeLanguage = (code) => {
    if (setLanguage) setLanguage(code);
    localStorage.setItem('language', code);
    setIsLangOpen(false);
  };

  const t = {
    ar: {
      welcome: 'مرحباً بك،',
      lightMode: 'الوضع الفاتح',
      darkMode: 'الوضع الداكن',
      logout: 'خروج',
      switcherTitle: 'تبديل الفضاء',
      contractor: 'فضاء المقاول العام',
      architect: 'مكتب المهندس المعماري',
      provider: 'فضاء الحرفي المعتمد',
      retail: 'فضاء تاجر التجزئة',
      wholesale: 'فضاء مورد الجملة'
    },
    fr: {
      welcome: 'Bienvenue,',
      lightMode: 'Mode Clair',
      darkMode: 'Mode Sombre',
      logout: 'Déconnexion',
      switcherTitle: 'Changer d\'Espace',
      contractor: 'Espace Entrepreneur',
      architect: 'Bureau d\'Architecte',
      provider: 'Espace Artisan Pro',
      retail: 'Espace Détaillant',
      wholesale: 'Espace Grossiste B2B'
    },
    en: {
      welcome: 'Welcome,',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      logout: 'Logout',
      switcherTitle: 'Switch Space',
      contractor: 'Contractor Hub',
      architect: 'Architect Office',
      provider: 'Artisan Space',
      retail: 'Retailer Store',
      wholesale: 'Wholesaler B2B'
    }
  }[language] || {};

  const isRtl = language === 'ar';

  // 🚀 قائمة الفضاءات الخمسة للتنقل السلس
  const spaces = [
    { id: 'contractor', label: t.contractor, icon: '🏗️', path: '/v2/contractor-dashboard', badge: 'V2' },
    { id: 'architect', label: t.architect, icon: '📐', path: '/v2/architect-dashboard', badge: 'VIP' },
    { id: 'provider', label: t.provider, icon: '👷‍♂️', path: '/v2/provider-dashboard', badge: 'PRO' },
    { id: 'retail', label: t.retail, icon: '🏪', path: '/?preview=retail', badge: 'POS' },
    { id: 'wholesale', label: t.wholesale, icon: '🏭', path: '/?preview=wholesale', badge: 'B2B' }
  ];

  const handleSpaceSwitch = (path) => {
    setIsSpaceOpen(false);
    navigate(path);
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-all duration-700 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#a3e6cd]'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex h-full w-full overflow-hidden relative">
        
        <aside className={`shrink-0 h-full transition-all duration-300 z-30 absolute md:relative ${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 opacity-0 overflow-hidden'}`}>
          <SmartSidebar accountType={accountType} storeName={storeName} />
        </aside>

        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          
          <header className={`h-20 border-b flex items-center justify-between px-4 md:px-6 shrink-0 z-20 shadow-sm transition-colors duration-700 ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white/40 border-white/50 backdrop-blur-md'}`}>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-blue-400' : 'bg-white/60 text-slate-700 hover:text-blue-600'}`}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h2 className={`font-black hidden sm:block tracking-wide ${isDarkMode ? 'text-white' : 'text-[#0f3b25]'}`}>
                {t.welcome} <span className="text-blue-600">{storeName}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              
              {/* 🚀 مبدّل الفضاءات الموحد (Space Switcher) */}
              <div className="relative">
                <button
                  onClick={() => setIsSpaceOpen(!isSpaceOpen)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 md:px-4 py-2 rounded-full font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                >
                  <Layers size={16} />
                  <span>{t.switcherTitle}</span>
                  <ChevronDown size={15} className={`transition-transform duration-300 ${isSpaceOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSpaceOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSpaceOpen(false)}></div>
                    <div className={`absolute top-full mt-3 ${isRtl ? 'left-0' : 'right-0'} w-64 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-fade-in p-1.5 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      {spaces.map(sp => {
                        const isCurrent = location.pathname.includes(sp.id);
                        return (
                          <button
                            key={sp.id}
                            onClick={() => handleSpaceSwitch(sp.path)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all mb-1 last:mb-0 ${
                              isCurrent
                                ? 'bg-purple-600/20 text-purple-500 border border-purple-500/40'
                                : isDarkMode
                                ? 'text-slate-200 hover:bg-slate-800'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{sp.icon}</span>
                              <span>{sp.label}</span>
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                              {sp.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* 🌐 زر اللغة */}
              <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-bold transition-all shadow-md hover:scale-105 border ${
                    isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Globe size={18} className="text-blue-500 animate-pulse" />
                  <span className="hidden md:inline text-sm uppercase">{language}</span>
                </button>

                {isLangOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)}></div>
                    <div className={`absolute top-full mt-3 ${isRtl ? 'left-0' : 'right-0'} w-36 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-fade-in origin-top ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      {languages.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${
                            language === lang.code 
                              ? (isDarkMode ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500' : 'bg-blue-50 text-blue-600 border-l-4 border-blue-600') 
                              : (isDarkMode ? 'text-slate-300 hover:bg-slate-700 border-l-4 border-transparent' : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent')
                          }`}
                        >
                          <span>{lang.label}</span>
                          <span>{lang.flag}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 💡 زر الإضاءة */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className={`flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full font-bold transition-all shadow-md hover:scale-105 ${
                  isDarkMode ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-[#0f3b25] text-white border border-[#0f3b25]'
                }`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className={`hidden lg:inline text-sm ${isRtl ? 'mr-2' : 'ml-2'}`}>{isDarkMode ? t.lightMode : t.darkMode}</span>
              </button>

              {/* 🚪 زر الخروج */}
              <button onClick={handleLogout} className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <LogOut size={18} /> <span className={`hidden sm:inline ${isRtl ? 'mr-2' : 'ml-2'}`}>{t.logout}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 md:p-8 relative z-10 custom-scrollbar">
            <Outlet context={{ isDarkMode, language }} />
          </div>
        </main>
      </div>
    </div>
  );
}