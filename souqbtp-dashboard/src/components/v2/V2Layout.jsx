import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Sun, Moon, Globe, Layers, ChevronDown, Trophy, PlusCircle, Sparkles, Loader2 } from 'lucide-react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import SmartSidebar from './SmartSidebar';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function V2Layout({ accountType, storeName, storeInitial }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSpaceOpen, setIsSpaceOpen] = useState(false);
  const [showAddSpaces, setShowAddSpaces] = useState(false);
  const [ownedSpaceIds, setOwnedSpaceIds] = useState([]);
  const [activatingSpace, setActivatingSpace] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { language = 'ar', setLanguage } = useSettingsStore();

  // تحديد الفضاء الحالي بدقة لاستثنائه من قائمة التبديل
  const currentSpaceId = (() => {
    const path = location.pathname;
    if (accountType === 'architect' || path.includes('/architect')) return 'architect';
    if (accountType === 'provider' || path.includes('/provider-')) return 'provider';
    return 'contractor';
  })();

  // تحديد مسار شركاء النجاح المناسب للفضاء الحالي
  const affiliatePath = 
    currentSpaceId === 'architect' ? '/v2/architect-affiliates' :
    currentSpaceId === 'provider' ? '/v2/provider-affiliates' :
    '/v2/affiliates';

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
      affiliatesBtn: 'شركاء النجاح',
      switcherTitle: 'تبديل الفضاء',
      addSpaceBtn: 'فتح فضاء آخر',
      yourSpacesHeader: 'فضاءاتك المفعلة (انتقال فوري)',
      expandHeader: 'أضف فضاءً مهنياً آخر بنفس حسابك:',
      expandHint: 'يمكنك تفعيل حساب إضافي من الفضاءات الأربع المتبقية بنفس بريدك الحالي والتنقل بينها بضغطة زر:',
      addAnotherLink: '+ تفعيل فضاء مهني إضافي',
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
      affiliatesBtn: 'Partenaires',
      switcherTitle: 'Changer d\'Espace',
      addSpaceBtn: 'Ajouter un Espace',
      yourSpacesHeader: 'Vos espaces actifs',
      expandHeader: 'Activer un autre espace sur ce compte :',
      expandHint: 'Vous pouvez ouvrir un autre espace professionnel avec votre compte actuel et basculer en un clic :',
      addAnotherLink: '+ Activer un nouvel espace',
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
      affiliatesBtn: 'Affiliates',
      switcherTitle: 'Switch Space',
      addSpaceBtn: 'Add Space',
      yourSpacesHeader: 'Your Active Spaces',
      expandHeader: 'Activate another space on this account:',
      expandHint: 'You can activate an additional professional space under your current account and switch anytime:',
      addAnotherLink: '+ Activate another space',
      contractor: 'Contractor Hub',
      architect: 'Architect Office',
      provider: 'Artisan Space',
      retail: 'Retailer Store',
      wholesale: 'Wholesaler B2B'
    }
  }[language] || {};

  const isRtl = language === 'ar';

  const allSpaces = [
    { id: 'contractor', label: t.contractor, icon: '🏗️', path: '/v2/contractor-dashboard', badge: 'V2' },
    { id: 'architect', label: t.architect, icon: '📐', path: '/v2/architect-dashboard', badge: 'VIP' },
    { id: 'provider', label: t.provider, icon: '👷‍♂️', path: '/v2/provider-dashboard', badge: 'PRO' },
    { id: 'retail', label: t.retail, icon: '🏪', path: '/?preview=retail', badge: 'POS' },
    { id: 'wholesale', label: t.wholesale, icon: '🏭', path: '/?preview=wholesale', badge: 'B2B' }
  ];

  // فحص الفضاءات التي يملكها المستخدم فعلياً في قاعدة البيانات
  useEffect(() => {
    let mounted = true;
    const fetchOwnedSpaces = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.email === 'admin@souqbtp.ma') {
        if (mounted) setOwnedSpaceIds(['contractor', 'architect', 'provider', 'retail', 'wholesale']);
        return;
      }

      const owned = new Set(user.user_metadata?.enabled_spaces || []);
      owned.add(currentSpaceId);

      const metaRole = user.user_metadata?.role || user.user_metadata?.account_type;
      if (metaRole === 'contractor' || metaRole === 'client') owned.add('contractor');
      if (metaRole === 'architect') owned.add('architect');
      if (metaRole === 'provider') owned.add('provider');

      const [archRes, provRes, supRes] = await Promise.all([
        supabase.from('architects').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('providers').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('suppliers').select('id, supplier_type').eq('user_id', user.id)
      ]);

      if (archRes.data) owned.add('architect');
      if (provRes.data) owned.add('provider');
      if (supRes.data && supRes.data.length > 0) {
        supRes.data.forEach(s => {
          if (s.supplier_type === 'wholesale') owned.add('wholesale');
          else owned.add('retail');
        });
      }

      if (mounted) setOwnedSpaceIds(Array.from(owned));
    };

    fetchOwnedSpaces();
    return () => { mounted = false; };
  }, [currentSpaceId, location.pathname]);

  // الفضاءات المفعلة الأخرى (باستثناء الفضاء الحالي)
  const otherOwnedSpaces = allSpaces.filter(sp => ownedSpaceIds.includes(sp.id) && sp.id !== currentSpaceId);
  // الفضاءات غير المفعلة بعد
  const uncreatedSpaces = allSpaces.filter(sp => !ownedSpaceIds.includes(sp.id) && sp.id !== currentSpaceId);

  const handleSpaceSwitch = (path) => {
    setIsSpaceOpen(false);
    if (path.startsWith('/?preview=')) {
      window.location.href = path;
    } else {
      navigate(path);
    }
  };

  // تفعيل وإنشاء فضاء إضافي بنفس حساب المستخدم الحالي
  const handleActivateNewSpace = async (space) => {
    try {
      setActivatingSpace(space.id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedSpaces = Array.from(new Set([...ownedSpaceIds, currentSpaceId, space.id]));
      await supabase.auth.updateUser({
        data: { enabled_spaces: updatedSpaces }
      });

      const defaultName = storeName || user.user_metadata?.full_name || 'SasBTP Pro';
      const defaultPhone = user.user_metadata?.phone || '';

      if (space.id === 'architect') {
        const { data: existing } = await supabase.from('architects').select('id').eq('user_id', user.id).maybeSingle();
        if (!existing) {
          await supabase.from('architects').insert([{
            user_id: user.id,
            full_name: defaultName,
            email: user.email,
            phone: defaultPhone,
            agency_name: defaultName,
            specialty: 'Architect',
            subscription_plan: 'basic'
          }]);
        }
      } else if (space.id === 'provider') {
        const { data: existing } = await supabase.from('providers').select('id').eq('user_id', user.id).maybeSingle();
        if (!existing) {
          await supabase.from('providers').insert([{
            user_id: user.id,
            full_name: defaultName,
            phone: defaultPhone || `06${Math.floor(10000000 + Math.random() * 90000000)}`,
            account_type: 'marketplace'
          }]);
        }
      } else if (space.id === 'retail' || space.id === 'wholesale') {
        const { data: existing } = await supabase.from('suppliers').select('id').eq('user_id', user.id).eq('supplier_type', space.id).maybeSingle();
        if (!existing) {
          await supabase.from('suppliers').insert([{
            user_id: user.id,
            store_name: defaultName,
            email: user.email,
            phone: defaultPhone,
            supplier_type: space.id
          }]);
        }
      }

      setOwnedSpaceIds(updatedSpaces);
      setIsSpaceOpen(false);
      setShowAddSpaces(false);
      handleSpaceSwitch(space.path);
    } catch (err) {
      console.error('Error activating space:', err);
    } finally {
      setActivatingSpace(null);
    }
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
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-blue-400' : 'bg-white/60 text-slate-700 hover:text-blue-600'}`}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h2 className={`font-black hidden sm:block tracking-wide ${isDarkMode ? 'text-white' : 'text-[#0f3b25]'}`}>
                {t.welcome} <span className="text-blue-600">{storeName}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              
              {/* 🏆 زر شركاء النجاح الموحد في الشريط العلوي */}
              <Link
                to={affiliatePath}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-3 md:px-4 py-2 rounded-full font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 whitespace-nowrap"
              >
                <Trophy size={16} className="text-slate-950 shrink-0" />
                <span className="hidden sm:inline">{t.affiliatesBtn}</span>
              </Link>

              {/* 🚀 مبدّل الفضاءات الذكي (يعرض فقط الحسابات المنشأة مع استثناء الحساب الحالي) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsSpaceOpen(!isSpaceOpen);
                    setShowAddSpaces(otherOwnedSpaces.length === 0);
                  }}
                  className={`px-3 md:px-4 py-2 rounded-full font-black text-xs md:text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer whitespace-nowrap ${
                    otherOwnedSpaces.length > 0
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/30'
                      : isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'
                      : 'bg-white hover:bg-purple-50 text-purple-800 border border-purple-300'
                  }`}
                >
                  {otherOwnedSpaces.length > 0 ? <Layers size={16} /> : <PlusCircle size={16} className="text-purple-500" />}
                  <span className="hidden sm:inline">{otherOwnedSpaces.length > 0 ? t.switcherTitle : t.addSpaceBtn}</span>
                  <ChevronDown size={15} className={`transition-transform duration-300 ${isSpaceOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSpaceOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSpaceOpen(false)}></div>
                    <div className={`absolute top-full mt-3 ${isRtl ? 'left-0' : 'right-0'} w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-fade-in p-2 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      
                      {/* 1. قائمة الفضاءات التي أنشأها المستخدم فعلياً (بدون الفضاء الحالي) */}
                      {otherOwnedSpaces.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-1.5 text-[11px] font-black text-purple-500 uppercase tracking-wider">
                            {t.yourSpacesHeader}
                          </div>
                          {otherOwnedSpaces.map(sp => (
                            <button
                              key={sp.id}
                              onClick={() => handleSpaceSwitch(sp.path)}
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all mb-1 last:mb-0 cursor-pointer ${
                                isDarkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
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
                          ))}
                        </div>
                      )}

                      {/* 2. زر أو قسم تفعيل فضاء مهني إضافي بنفس الحساب */}
                      {uncreatedSpaces.length > 0 && (
                        <div className={otherOwnedSpaces.length > 0 ? 'border-t border-slate-700/30 pt-2 mt-1' : ''}>
                          {!showAddSpaces && otherOwnedSpaces.length > 0 ? (
                            <button
                              onClick={() => setShowAddSpaces(true)}
                              className="w-full py-2 px-3 rounded-xl text-xs font-black text-cyan-500 hover:bg-cyan-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles size={14} />
                              <span>{t.addAnotherLink}</span>
                            </button>
                          ) : (
                            <div className="p-1.5 space-y-2">
                              <div className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <p className="text-[11px] font-bold leading-relaxed text-purple-400">
                                  {t.expandHint}
                                </p>
                              </div>
                              <div className="space-y-1">
                                {uncreatedSpaces.map(sp => (
                                  <button
                                    key={sp.id}
                                    disabled={activatingSpace === sp.id}
                                    onClick={() => handleActivateNewSpace(sp)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-dashed ${
                                      isDarkMode 
                                        ? 'border-slate-700 hover:border-purple-500 hover:bg-slate-800/70 text-slate-300' 
                                        : 'border-slate-300 hover:border-purple-500 hover:bg-purple-50/60 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{sp.icon}</span>
                                      <span>{sp.label}</span>
                                    </div>
                                    {activatingSpace === sp.id ? (
                                      <Loader2 size={14} className="animate-spin text-purple-500" />
                                    ) : (
                                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                        + تفعيل
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </>
                )}
              </div>

              {/* 🌐 زر اللغة */}
              <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-bold transition-all shadow-md hover:scale-105 border cursor-pointer ${
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
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
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
                className={`flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full font-bold transition-all shadow-md hover:scale-105 cursor-pointer ${
                  isDarkMode ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-[#0f3b25] text-white border border-[#0f3b25]'
                }`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className={`hidden lg:inline text-sm ${isRtl ? 'mr-2' : 'ml-2'}`}>{isDarkMode ? t.lightMode : t.darkMode}</span>
              </button>

              {/* 🚪 زر الخروج */}
              <button onClick={handleLogout} className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer">
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