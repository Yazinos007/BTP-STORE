import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Sun, Moon, Globe, Layers, ChevronDown, Trophy, PlusCircle, Sparkles, Loader2, Clock, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import SmartSidebar from './SmartSidebar';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import SystemNotificationBanner from './SystemNotificationBanner';

export default function V2Layout({ accountType, storeName, storeInitial }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSpaceOpen, setIsSpaceOpen] = useState(false);
  const [showAddSpaces, setShowAddSpaces] = useState(false);
  const [ownedSpaceIds, setOwnedSpaceIds] = useState([]);
  const [spacePlans, setSpacePlans] = useState({});
  const [activatingSpace, setActivatingSpace] = useState(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [isCurrentSpacePaid, setIsCurrentSpacePaid] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { language = 'ar', setLanguage } = useSettingsStore();
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // تحديد الفضاء الحالي بدقة من المسار
  const currentSpaceId = (() => {
    const path = location.pathname;
    if (path.includes('/architect')) return 'architect';
    if (path.includes('/provider-')) return 'provider';
    return 'contractor';
  })();

  // مسار الشركاء ومسار الاشتراك حسب الفضاء الحالي
  const affiliatePath = 
    currentSpaceId === 'architect' ? '/v2/architect-affiliates' :
    currentSpaceId === 'provider' ? '/v2/provider-affiliates' :
    '/v2/affiliates';

  const subscriptionPath = 
    currentSpaceId === 'architect' ? '/v2/architect-subscription' :
    currentSpaceId === 'provider' ? '/v2/provider-subscription' :
    '/v2/subscription';

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
      expandHint: 'يمكنك تفعيل حساب إضافي من الفضاءات الأربع المتبقية بنفس بريدك الحالي والتنقل بينها بضغطة زر:',
      addAnotherLink: '+ تفعيل فضاء مهني إضافي',
      activateBadge: '+ تفعيل',
      basicBadge: 'أساسي',
      contractor: 'فضاء المقاول العام',
      architect: 'مكتب المهندس المعماري',
      provider: 'فضاء الحرفي المعتمد',
      retail: 'فضاء تاجر التجزئة',
      wholesale: 'فضاء مورد الجملة',
      trialActive: (days, planName) => `فترة تجريبية: يتبقى لك ${days} أيام على باقة ${planName}`,
      trialExpired: 'انتهت الفترة التجريبية! رقِّ حسابك الآن للاحتفاظ بكامل الصلاحيات.',
      subscribeNow: 'اشترك للاحتفاظ بالصلاحيات'
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
      expandHint: 'Vous pouvez ouvrir un autre espace professionnel avec votre compte actuel et basculer en un clic :',
      addAnotherLink: '+ Activer un nouvel espace',
      activateBadge: '+ Activer',
      basicBadge: 'Basic',
      contractor: 'Espace Entrepreneur',
      architect: 'Bureau d\'Architecte',
      provider: 'Espace Artisan Pro',
      retail: 'Espace Détaillant',
      wholesale: 'Espace Grossiste B2B',
      trialActive: (days, planName) => `Période d'essai : Il vous reste ${days} jours sur le plan ${planName}`,
      trialExpired: 'La période d\'essai a expiré ! Mettez à niveau votre compte pour conserver vos accès.',
      subscribeNow: 'Abonnez-vous pour conserver l\'accès'
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
      expandHint: 'You can activate an additional professional space under your current account and switch anytime:',
      addAnotherLink: '+ Activate another space',
      activateBadge: '+ Activate',
      basicBadge: 'Basic',
      contractor: 'Contractor Hub',
      architect: 'Architect Office',
      provider: 'Artisan Space',
      retail: 'Retailer Store',
      wholesale: 'Wholesaler B2B',
      trialActive: (days, planName) => `Trial period: You have ${days} days left on the ${planName} plan`,
      trialExpired: 'Trial period expired! Upgrade now to keep full access.',
      subscribeNow: 'Subscribe to keep access'
    }
  }[language] || {};

  const currentTrialPlanName = 
    currentSpaceId === 'architect' ? 'Architecte Élite VIP' :
    currentSpaceId === 'provider' ? 'Maâlem PRO' :
    'Pro ERP';

  const allSpaces = [
    { id: 'contractor', label: t.contractor, icon: '🏗️', path: '/v2/contractor-dashboard', badge: spacePlans.contractor || t.basicBadge },
    { id: 'architect', label: t.architect, icon: '📐', path: '/v2/architect-dashboard', badge: spacePlans.architect || t.basicBadge },
    { id: 'provider', label: t.provider, icon: '👷‍♂️', path: '/v2/provider-dashboard', badge: spacePlans.provider || t.basicBadge },
    { id: 'retail', label: t.retail, icon: '🏪', path: '/?preview=retail', badge: spacePlans.retail || t.basicBadge },
    { id: 'wholesale', label: t.wholesale, icon: '🏭', path: '/?preview=wholesale', badge: spacePlans.wholesale || t.basicBadge }
  ];

  // فحص الفضاءات المفعلة والباقة الحقيقية وحساب أيام التجربة بدقة من قاعدة البيانات
  useEffect(() => {
    let mounted = true;
    const fetchOwnedSpacesAndTrial = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.email === 'admin@souqbtp.ma' || user.user_metadata?.role === 'admin') {
        if (mounted) {
          setOwnedSpaceIds(['contractor', 'architect', 'provider', 'retail', 'wholesale']);
          setSpacePlans({ contractor: 'VIP', architect: 'VIP', provider: 'PRO', retail: 'PRO', wholesale: 'B2B' });
          setIsCurrentSpacePaid(true);
          setTrialDaysLeft(14);
        }
        return;
      }

      const owned = new Set(user.user_metadata?.enabled_spaces || []);
      owned.add(currentSpaceId);

      const metaRole = user.user_metadata?.role || user.user_metadata?.account_type;
      if (metaRole === 'contractor' || metaRole === 'client') owned.add('contractor');
      if (metaRole === 'architect') owned.add('architect');
      if (metaRole === 'provider') owned.add('provider');

      const [profRes, archRes, provRes, supRes] = await Promise.all([
        supabase.from('profiles').select('id, subscription_plan, trial_ends_at').eq('id', user.id).maybeSingle(),
        supabase.from('architects').select('id, subscription_plan, trial_ends_at').eq('user_id', user.id).limit(1),
        supabase.from('providers').select('id, subscription_plan, trial_ends_at').eq('user_id', user.id).limit(1),
        supabase.from('suppliers').select('id, supplier_type, subscription_plan, trial_ends_at').eq('user_id', user.id)
      ]);

      const contractorPlan = profRes.data?.subscription_plan || user.user_metadata?.subscription_plan || 'starter';
      const plans = {
        contractor: ['pro', 'enterprise', 'vip'].includes(contractorPlan.toLowerCase()) ? contractorPlan.toUpperCase() : (t.basicBadge || 'Basic'),
        architect: t.basicBadge || 'Basic',
        provider: t.basicBadge || 'Basic',
        retail: t.basicBadge || 'Basic',
        wholesale: t.basicBadge || 'Basic'
      };

      let spacePaid = false;

      if (currentSpaceId === 'contractor') {
        spacePaid = ['pro', 'enterprise', 'vip'].includes(contractorPlan.toLowerCase());
      }

      if (archRes.data && archRes.data.length > 0) {
        owned.add('architect');
        const p = (archRes.data[0].subscription_plan || 'basic').toLowerCase();
        plans.architect = (p && p !== 'basic') ? p.toUpperCase() : (t.basicBadge || 'Basic');
        if (currentSpaceId === 'architect') {
          spacePaid = ['pro', 'vip', 'elite'].includes(p);
        }
      }

      if (provRes.data && provRes.data.length > 0) {
        owned.add('provider');
        const p = (provRes.data[0].subscription_plan || 'free').toLowerCase();
        plans.provider = (p && p !== 'free' && p !== 'basic') ? p.toUpperCase() : (t.basicBadge || 'Basic');
        if (currentSpaceId === 'provider') {
          spacePaid = ['pro', 'maalem pro'].includes(p);
        }
      }

      if (supRes.data && supRes.data.length > 0) {
        supRes.data.forEach(s => {
          const p = (s.subscription_plan && s.subscription_plan !== 'basic' && s.subscription_plan !== 'starter')
            ? s.subscription_plan.toUpperCase()
            : (t.basicBadge || 'Basic');
          if (s.supplier_type === 'wholesale') {
            owned.add('wholesale');
            plans.wholesale = p;
          } else {
            owned.add('retail');
            plans.retail = p;
          }
        });
      }

      // حساب موحد ومستقر للفترة التجريبية بناءً على تاريخ إنشاء الحساب الأصلي (14 يوماً)
      // مع أخذ أي تمديد إداري (God Mode) في الحسبان
      const accountCreatedAt = user.created_at ? new Date(user.created_at) : new Date();
      const defaultTrialEnd = new Date(accountCreatedAt.getTime() + 14 * 24 * 60 * 60 * 1000);

      const candidateDates = [
        defaultTrialEnd,
        profRes.data?.trial_ends_at ? new Date(profRes.data.trial_ends_at) : null,
        archRes.data?.[0]?.trial_ends_at ? new Date(archRes.data[0].trial_ends_at) : null,
        provRes.data?.[0]?.trial_ends_at ? new Date(provRes.data[0].trial_ends_at) : null,
        ...(supRes.data || []).map(s => s.trial_ends_at ? new Date(s.trial_ends_at) : null)
      ].filter(Boolean);

      const effectiveTrialEnd = new Date(Math.max(...candidateDates.map(d => d.getTime())));
      const calculatedRemaining = Math.max(
        0,
        Math.ceil((effectiveTrialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );

      if (mounted) {
        setTrialDaysLeft(calculatedRemaining);
        setIsCurrentSpacePaid(spacePaid);
        setOwnedSpaceIds(Array.from(owned));
        setSpacePlans(plans);
      }
    };

    fetchOwnedSpacesAndTrial();
    return () => { mounted = false; };
  }, [currentSpaceId, location.pathname, language, t.basicBadge]);

  const otherOwnedSpaces = allSpaces.filter(sp => ownedSpaceIds.includes(sp.id) && sp.id !== currentSpaceId);
  const uncreatedSpaces = allSpaces.filter(sp => !ownedSpaceIds.includes(sp.id) && sp.id !== currentSpaceId);

  const handleSpaceSwitch = (path) => {
    setIsSpaceOpen(false);
    if (path.includes('preview=retail')) {
      sessionStorage.setItem('souqbtp_preview_mode', 'retail');
    } else if (path.includes('preview=wholesale')) {
      sessionStorage.setItem('souqbtp_preview_mode', 'wholesale');
    } else {
      sessionStorage.removeItem('souqbtp_preview_mode');
    }
    navigate(path);
  };

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
        const { data: existing } = await supabase.from('architects').select('id').eq('user_id', user.id).limit(1);
        if (!existing || existing.length === 0) {
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
        const { data: existing } = await supabase.from('providers').select('id').eq('user_id', user.id).limit(1);
        if (!existing || existing.length === 0) {
          await supabase.from('providers').insert([{
            user_id: user.id,
            full_name: defaultName,
            phone: defaultPhone || `06${Math.floor(10000000 + Math.random() * 90000000)}`,
            account_type: 'marketplace'
          }]);
        }
      } else if (space.id === 'retail' || space.id === 'wholesale') {
        const { data: existing } = await supabase.from('suppliers').select('id').eq('user_id', user.id).eq('supplier_type', space.id).limit(1);
        if (!existing || existing.length === 0) {
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

  // إخفاء شريط التجربة إذا كنا داخل صفحة الاشتراكات نفسها أو إذا كان الحساب مدفوعاً بالفعل
  const isSubscriptionPage = location.pathname.includes('subscription');

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-all duration-700 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#a3e6cd]'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🔔 1. شريط الإشعارات الذكي (هدايا التمديد، تفعيل الباقات، وتنبيهات الإدارة) */}
      <SystemNotificationBanner />

      {/* ⏳ 2. شريط الفترة التجريبية الموحد (يظهر فقط بعد استقرار القراءة وللحسابات غير المدفوعة) */}
      {!isSubscriptionPage && !isCurrentSpacePaid && trialDaysLeft !== null && (
        <div className={`w-full py-2 px-4 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-bold z-50 shrink-0 shadow-sm ${
          trialDaysLeft > 0 
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <Clock size={16} className="animate-pulse shrink-0" />
            <span>
              {trialDaysLeft > 0 ? t.trialActive(trialDaysLeft, currentTrialPlanName) : t.trialExpired}
            </span>
          </div>
          <Link
            to={subscriptionPath}
            className="bg-white text-indigo-900 hover:bg-amber-400 hover:text-slate-950 px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 shadow-sm"
          >
            <Zap size={13} className="fill-current" />
            <span>{t.subscribeNow}</span>
            <ArrowIcon size={13} />
          </Link>
        </div>
      )}

      <div className="flex flex-1 w-full overflow-hidden relative">
        
        <aside className={`shrink-0 h-full transition-all duration-300 z-30 absolute md:relative ${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 opacity-0 overflow-hidden'}`}>
          <SmartSidebar accountType={accountType} storeName={storeName} />
        </aside>

        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          
          <header className={`h-20 border-b flex items-center justify-between px-4 md:px-6 shrink-0 z-40 shadow-sm transition-colors duration-700 ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white/40 border-white/50 backdrop-blur-md'}`}>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-blue-400' : 'bg-white/60 text-slate-700 hover:text-blue-600'}`}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h2 className={`font-black hidden sm:block tracking-wide ${isDarkMode ? 'text-white' : 'text-[#0f3b25]'}`}>
                {t.welcome} <span className="text-blue-600">{storeName}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              
              {/* 🏆 زر شركاء النجاح الموحد */}
              <Link
                to={affiliatePath}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-3 md:px-4 py-2 rounded-full font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 whitespace-nowrap"
              >
                <Trophy size={16} className="text-slate-950 shrink-0" />
                <span className="hidden sm:inline">{t.affiliatesBtn}</span>
              </Link>

              {/* 🚀 مبدّل الفضاءات الذكي */}
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
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                {sp.badge}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

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
                                        {t.activateBadge}
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