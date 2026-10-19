import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../../store/useSettingsStore';
import useArchitectStore from '../../../store/useArchitectStore';
import { supabase } from '../../../lib/supabase';
import { Building, ClipboardCheck, FolderOpen, Crown, Star, ShieldCheck, Zap, Server, ChevronRight, Activity } from 'lucide-react';

const translations = {
  ar: {
    pageTitle: 'مكتب الدراسات (نظرة عامة)',
    welcome: 'مرحباً بك يا',
    subWelcome: 'هنا تدير رقابتك الهندسية بلمسة زر.',
    completedReports: 'المصادقات المنجزة',
    reportsDesc: 'محاضر تم إرسالها للعملاء',
    openRequests: 'طلبات الرقابة المفتوحة',
    browseRequests: 'تصفح الطلبات',
    planAndSub: 'الباقة والاشتراك',
    activeAccount: 'حساب نشط',
    aiUsage: 'استخدام AI Render',
    storageUsage: 'السعة السحابية (5GB)',
    upgradeBtn: 'ترقية الحساب / إدارة الاشتراك',
    simulatorTitle: 'محاكي العمليات الميدانية (Simulator)',
    simulatorDesc: 'بيئة تدريب آمنة 100%. اختبر أدوات الرسم، ارفع مخططاتك (PDF/Image)، جرب المطابقة المعمارية، واستخرج تقارير تجريبية قبل الدخول في جلسة حقيقية مع العميل.',

    openSimulator: 'فتح محاكي التدريب',
    defaultEngineer: 'مهندس',
    planVip: '👑 النخبة (Elite VIP)',
    planPro: '🔥 المحترف (Pro)',
    planBasic: '🌱 الأساسية (Basic)'
  },
  fr: {
    pageTitle: 'Bureau d\'études (Aperçu)',
    welcome: 'Bienvenue,',
    subWelcome: 'Gérez votre supervision architecturale en un clic.',
    completedReports: 'Validations effectuées',
    reportsDesc: 'PVs envoyés aux clients',
    openRequests: 'Demandes de supervision ouvertes',
    browseRequests: 'Parcourir les demandes',
    planAndSub: 'Plan et Abonnement',
    activeAccount: 'Compte Actif',
    aiUsage: 'Utilisation AI Render',
    storageUsage: 'Stockage Cloud (5Go)',
    upgradeBtn: 'Mettre à niveau / Gérer l\'abonnement',
    simulatorTitle: 'Simulateur d\'Opérations (Simulator)',
    simulatorDesc: 'Environnement d\'entraînement 100% sûr. Testez les outils de dessin, téléchargez vos plans, essayez la superposition architecturale et générez des rapports de test avant une vraie session client.',

    openSimulator: 'Ouvrir le Simulateur',
    defaultEngineer: 'Architecte',
    planVip: '👑 Élite (VIP)',
    planPro: '🔥 Professionnel (Pro)',
    planBasic: '🌱 Basique (Basic)'
  },
  en: {
    pageTitle: 'Design Office (Overview)',
    welcome: 'Welcome,',
    subWelcome: 'Manage your architectural supervision with a click.',
    completedReports: 'Completed Validations',
    reportsDesc: 'Reports sent to clients',
    openRequests: 'Open Supervision Requests',
    browseRequests: 'Browse Requests',
    planAndSub: 'Plan & Subscription',
    activeAccount: 'Active Account',
    aiUsage: 'AI Render Usage',
    storageUsage: 'Cloud Storage (5GB)',
    upgradeBtn: 'Upgrade / Manage Subscription',
    simulatorTitle: 'Field Operations Simulator',
    simulatorDesc: '100% safe training environment. Test drawing tools, upload plans, try architectural matching, and generate test reports before a real client session.',

    openSimulator: 'Open Simulator',
    defaultEngineer: 'Architect',
    planVip: '👑 Elite (VIP)',
    planPro: '🔥 Professional (Pro)',
    planBasic: '🌱 Basic'
  }
};

export default function ArchitectDashboard() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true;
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const { architectProfile, stats, isLoading, fetchArchitectData } = useArchitectStore();

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isMounted) {
        setCurrentUser(user);
        fetchArchitectData(user.id);
      }
    };
    loadUser();
    return () => { isMounted = false; };
  }, [fetchArchitectData]);


  const userName = architectProfile?.full_name || currentUser?.user_metadata?.full_name || t.defaultEngineer;
  const currentPlan = architectProfile?.subscription_plan || 'basic';

  const planDetails = {

    vip: { name: t.planVip, color: 'from-amber-400 to-amber-600', text: 'text-amber-500' },

    pro: { name: t.planPro, color: 'from-purple-500 to-fuchsia-500', text: 'text-purple-500' },

    basic: { name: t.planBasic, color: 'from-slate-400 to-slate-600', text: 'text-slate-500' }
  };
  const planInfo = planDetails[currentPlan] || planDetails.basic;

  const aiPercent = Math.min((stats.aiUsed / 5) * 100, 100);
  const storageLimit = 5 * 1024 * 1024 * 1024; // 5GB
  const storageMB = (stats.storageUsedBytes / (1024 * 1024)).toFixed(1);
  const storagePercent = Math.min((stats.storageUsedBytes / storageLimit) * 100, 100);

  // Theme Styles
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  if (isLoading && !architectProfile) {
    return (
      <div className={`flex justify-center items-center h-[70vh] ${textMain}`}>
        <Activity className="animate-pulse text-purple-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-6`}>
        <div>
          <h2 className={`text-3xl font-black ${textMain} tracking-tight flex items-center gap-3`}>
            <Building className="text-purple-600" size={32} />
            {t.pageTitle}
          </h2>
          <p className={`${textMuted} mt-2 font-medium`}>{t.welcome} <span className="font-black text-purple-500">{userName}</span>، {t.subWelcome}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`bg-gradient-to-br from-purple-700 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group`}>
           <div className={`absolute -right-6 -bottom-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500`}><ClipboardCheck size={140} /></div>
           <h3 className="text-lg font-bold opacity-90 mb-2">{t.completedReports}</h3>
           <p className="text-6xl font-black mb-2 drop-shadow-md">{stats.completedReports}</p>
           <span className="text-sm font-bold opacity-80">{t.reportsDesc}</span>
        </div>
        <div className={`${bgMain} border-2 rounded-3xl p-6 shadow-lg flex flex-col justify-between group hover:border-purple-500 transition-colors`}>
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${textMuted}`}>{t.openRequests}</h3>
            <p className={`text-6xl font-black ${textMain}`}>{stats.openRequests}</p>
          </div>
          <button 
            onClick={() => navigate('/v2/architect-projects')}
            className={`mt-6 py-3 w-full rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            {t.browseRequests} <FolderOpen size={16} />
          </button>
        </div>
        <div className={`${bgMain} border-2 rounded-3xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden`}>
          {currentPlan === 'vip' && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center rounded-bl-3xl shadow-lg"><Crown className="text-white" size={24} /></div>}
          <div className="mb-4">
             <div className="flex justify-between items-start mb-2">
                 <h3 className={`text-sm font-bold ${textMuted}`}>{t.planAndSub}</h3>
                 <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-black border border-emerald-500/20">{t.activeAccount}</span>
             </div>
             <p className={`text-xl font-black ${planInfo.text}`}>{planInfo.name}</p>
          </div>
          {(currentPlan === 'pro' || currentPlan === 'vip') && (
            <div className="space-y-4 mb-6 flex-1">
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                     <span className={`${textMuted} flex items-center gap-1`}><Zap size={12} className="text-purple-500"/> {t.aiUsage}</span>
                     <span className={textMain}>{currentPlan === 'vip' ? '∞' : `${stats.aiUsed} / 5`}</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                     <div className={`h-full rounded-full bg-gradient-to-r ${currentPlan === 'vip' ? 'from-amber-400 to-amber-600' : 'from-purple-500 to-fuchsia-500'} transition-all duration-1000`} style={{ width: currentPlan === 'vip' ? '100%' : `${aiPercent}%` }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                     <span className={`${textMuted} flex items-center gap-1`}><Server size={12} className="text-emerald-500"/> {t.storageUsage}</span>
                     <span className={textMain}>{storageMB} MB</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                     <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${storagePercent}%` }}></div>
                  </div>
               </div>
            </div>
          )}
          <button 
            onClick={() => window.open('/v2/architect-subscription', '_blank')}
            className={`mt-auto py-3 w-full rounded-xl font-black text-sm transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            {t.upgradeBtn}
          </button>
        </div>
      </div>
      <div className={`mt-8 relative overflow-hidden rounded-[2rem] border-2 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 p-8 lg:p-10 ${isDarkMode ? 'bg-slate-900 border-purple-500/30' : 'bg-white border-purple-200'}`}>
         <div className="absolute -left-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
         <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} bottom-0 opacity-5 pointer-events-none`}><Building size={300} /></div>
         <div className="flex-1 relative z-10">
            <h3 className={`text-2xl font-black mb-3 flex items-center gap-3 ${textMain}`}>
               <div className="p-3 bg-purple-500/20 text-purple-500 rounded-2xl"><ShieldCheck size={28} /></div>
               {t.simulatorTitle}
            </h3>
            <p className={`font-bold leading-relaxed max-w-3xl ${textMuted}`}>
               {t.simulatorDesc}
            </p>
         </div>
         <div className="w-full lg:w-auto relative z-10 shrink-0">
            <button 
              onClick={() => window.open('/v2/architect/live-room/0?mode=simulator', '_blank')}
              className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(147,51,234,0.4)] transition-all hover:-translate-y-1 hover:scale-105 group"
            >
               🚀 {t.openSimulator}
               <ChevronRight size={20} className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
         </div>
      </div>
    </div>
  );
}