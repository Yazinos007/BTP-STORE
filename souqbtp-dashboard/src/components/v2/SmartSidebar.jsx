import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, MessageCircle, FileSignature, AlertTriangle, 
  Settings, UserCircle, Briefcase, Camera, LogOut, Search, PieChart, Users, Zap, 
  Globe, Moon, Sun, Receipt, ShieldCheck, ChevronDown, Trophy, 
  Store, Calculator, Star, HardHat, Radar, Image
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

// 🎨 منظومة الألوان المتوهجة (Neon Themes) - مطابقة للفضاءات
const SIDEBAR_THEMES = {
  contractor: {
    dashboard: { 
      headerText: 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      dot: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]',
      activeBtn: 'bg-blue-600/20 text-blue-300 border border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.45)] animate-pulse',
      activeIcon: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.9)]',
      hoverBtn: 'hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30'
    },
    projects: { 
      headerText: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      dot: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
      activeBtn: 'bg-amber-500/20 text-amber-300 border border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.45)] animate-pulse',
      activeIcon: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]',
      hoverBtn: 'hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30'
    },
    communication: {
      headerText: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      dot: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
      activeBtn: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse',
      activeIcon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]',
      hoverBtn: 'hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30'
    },
    finance: {
      headerText: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
      dot: 'bg-purple-400 shadow-[0_0_10px_#c084fc]',
      activeBtn: 'bg-purple-600/20 text-purple-300 border border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.45)] animate-pulse',
      activeIcon: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]',
      hoverBtn: 'hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30'
    },
    settings: {
      headerText: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]',
      dot: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
      activeBtn: 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/70 shadow-[0_0_20px_rgba(34,211,238,0.45)] animate-pulse',
      activeIcon: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]',
      hoverBtn: 'hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30'
    }
  },
  architect: {
    dashboard: { 
      headerText: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]',
      dot: 'bg-indigo-400 shadow-[0_0_10px_#818cf8]',
      activeBtn: 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/70 shadow-[0_0_20px_rgba(99,102,241,0.45)] animate-pulse',
      activeIcon: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.9)]',
      hoverBtn: 'hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30'
    },
    tools: {
      headerText: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]',
      dot: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
      activeBtn: 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/70 shadow-[0_0_20px_rgba(34,211,238,0.45)] animate-pulse',
      activeIcon: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]',
      hoverBtn: 'hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30'
    },
    market: {
      headerText: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      dot: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
      activeBtn: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse',
      activeIcon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]',
      hoverBtn: 'hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30'
    },
    finance: {
      headerText: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      dot: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
      activeBtn: 'bg-amber-500/20 text-amber-300 border border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.45)] animate-pulse',
      activeIcon: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]',
      hoverBtn: 'hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30'
    },
    settings: {
      headerText: 'text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.6)]',
      dot: 'bg-slate-400 shadow-[0_0_10px_#cbd5e1]',
      activeBtn: 'bg-slate-600/20 text-slate-300 border border-slate-500/70 shadow-[0_0_20px_rgba(148,163,184,0.45)] animate-pulse',
      activeIcon: 'text-slate-400 drop-shadow-[0_0_8px_rgba(203,213,225,0.9)]',
      hoverBtn: 'hover:bg-slate-500/10 hover:text-slate-300 hover:border-slate-500/30'
    }
  },
  provider: {
    dashboard: { 
      headerText: 'text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]',
      dot: 'bg-orange-400 shadow-[0_0_10px_#fb923c]',
      activeBtn: 'bg-orange-600/20 text-orange-300 border border-orange-500/70 shadow-[0_0_20px_rgba(249,115,22,0.45)] animate-pulse',
      activeIcon: 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.9)]',
      hoverBtn: 'hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/30'
    },
    tools: {
      headerText: 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      dot: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]',
      activeBtn: 'bg-blue-600/20 text-blue-300 border border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.45)] animate-pulse',
      activeIcon: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.9)]',
      hoverBtn: 'hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30'
    },
    market: {
      headerText: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      dot: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
      activeBtn: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse',
      activeIcon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]',
      hoverBtn: 'hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30'
    },
    account: {
      headerText: 'text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.6)]',
      dot: 'bg-slate-400 shadow-[0_0_10px_#cbd5e1]',
      activeBtn: 'bg-slate-600/20 text-slate-300 border border-slate-500/70 shadow-[0_0_20px_rgba(148,163,184,0.45)] animate-pulse',
      activeIcon: 'text-slate-400 drop-shadow-[0_0_8px_rgba(203,213,225,0.9)]',
      hoverBtn: 'hover:bg-slate-500/10 hover:text-slate-300 hover:border-slate-500/30'
    }
  },
  admin: { // 🆕 ثيم لوحة القيادة المركزية (الأدمن)
    dashboard: { 
      headerText: 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      dot: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]',
      activeBtn: 'bg-blue-600/20 text-blue-300 border border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.45)] animate-pulse',
      activeIcon: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.9)]',
      hoverBtn: 'hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30'
    },
    finance: { 
      headerText: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      dot: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
      activeBtn: 'bg-amber-500/20 text-amber-300 border border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.45)] animate-pulse',
      activeIcon: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]',
      hoverBtn: 'hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30'
    },
    users: {
      headerText: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      dot: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
      activeBtn: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse',
      activeIcon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]',
      hoverBtn: 'hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30'
    },
    system: {
      headerText: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
      dot: 'bg-purple-400 shadow-[0_0_10px_#c084fc]',
      activeBtn: 'bg-purple-600/20 text-purple-300 border border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.45)] animate-pulse',
      activeIcon: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]',
      hoverBtn: 'hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30'
    }
  }
};

export default function SmartSidebar({ storeName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';
  const [currentUser, setCurrentUser] = useState(null);
  
  // تحديد الفضاء بدقة لتطبيق الثيم المناسب
  let safeAccountType = 'contractor';
  if (location.pathname.includes('/architect')) safeAccountType = 'architect';
  if (location.pathname.includes('/provider-')) safeAccountType = 'provider';
  if (location.pathname.includes('/admin-')) safeAccountType = 'admin'; // 🆕 دعم فضاء الأدمن المركزي

  const [providerPlan, setProviderPlan] = useState('free');
  const [architectPlan, setArchitectPlan] = useState('basic');
  const [contractorPlan, setContractorPlan] = useState('starter');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user);
        const [profRes, archRes, provRes] = await Promise.all([
          supabase.from('profiles').select('subscription_plan').eq('id', data.user.id).maybeSingle(),
          supabase.from('architects').select('subscription_plan').eq('user_id', data.user.id).maybeSingle(),
          supabase.from('providers').select('subscription_plan').eq('user_id', data.user.id).maybeSingle()
        ]);
        if (profRes.data?.subscription_plan) setContractorPlan(profRes.data.subscription_plan.toLowerCase());
        if (archRes.data?.subscription_plan) setArchitectPlan(archRes.data.subscription_plan.toLowerCase());
        if (provRes.data?.subscription_plan) setProviderPlan(provRes.data.subscription_plan.toLowerCase());
      }
    });
  }, []);

  const themeConfig = SIDEBAR_THEMES[safeAccountType] || SIDEBAR_THEMES.contractor;

  const getLinkStyle = (path, themeKey) => {
    const active = location.pathname === path;
    const theme = themeConfig[themeKey] || themeConfig.dashboard;
    return `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border ${
      active
        ? theme.activeBtn
        : `text-slate-400 border-transparent ${theme.hoverBtn}`
    }`;
  };

  const getIconStyle = (path, themeKey) => {
    const active = location.pathname === path;
    const theme = themeConfig[themeKey] || themeConfig.dashboard;
    return active ? theme.activeIcon : 'text-slate-400 transition-colors';
  };

  const SectionHeader = ({ title, themeKey }) => {
    const theme = themeConfig[themeKey] || themeConfig.dashboard;
    return (
      <div className="px-3 pb-1.5 pt-2 flex items-center gap-2.5 relative overflow-hidden">
        <span className={`w-2 h-2 rounded-full animate-ping absolute opacity-75 ${theme.dot}`} />
        <span className={`w-2 h-2 rounded-full relative shrink-0 ${theme.dot}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest shimmer-title ${theme.headerText}`}>
          {title}
        </span>
      </div>
    );
  };

  // 1. هيكلة أقسام المقاول (Contractor)
  const contractorMenuSections = [
    {
      key: 'dashboard',
      title: language === 'ar' ? 'القيادة والتوثيق' : 'DIRECTION & TERRAIN',
      items: [
        { path: '/v2/contractor-dashboard', icon: LayoutDashboard, label: language === 'ar' ? 'لوحة القيادة' : 'Tableau de bord' },
        { path: '/v2/contractor-projects', icon: FolderKanban, label: language === 'ar' ? 'أوراشي المفتوحة' : 'Parcours Projet', tag: 'AR' },
        { path: '/v2/contractor-calculator', icon: Calculator, label: language === 'ar' ? 'حاسبة التكلفة الذكية' : 'Calculateur Intelligent' },
        { path: '/v2/contractor-camera', icon: Camera, label: language === 'ar' ? 'توثيق الورش (GPS)' : 'Caméra de Chantier' }
      ]
    },
    {
      key: 'projects',
      title: language === 'ar' ? 'السوق والمناقصات' : 'MARCHÉ & APPELS',
      items: [
        { path: '/v2/contractor-marketplace', icon: Store, label: language === 'ar' ? 'سوق BTP العام' : 'Marché BTP' },
        { path: '/v2/contractor-radar', icon: Radar, label: language === 'ar' ? 'رادار المناقصات (Live)' : "Radar Appels d'offres", tag: 'PRO' }
      ]
    },
    {
      key: 'communication',
      title: language === 'ar' ? 'التواصل واللوجستيك' : 'COMMUNICATION & LOGISTIQUE',
      items: [
        { path: '/v2/contractor-messages', icon: MessageCircle, label: language === 'ar' ? 'صندوق الرسائل' : 'Boîte de Réception' },
        { path: '/v2/contractor-freight', icon: Truck, label: language === 'ar' ? 'بورصة اللوجستيك' : 'Bourse de Fret' },
        { path: '/v2/contractor-live-orders', icon: Package, label: language === 'ar' ? 'تتبع طلبيات السلعة' : 'Commandes Live' }
      ]
    },
    {
      key: 'finance',
      title: language === 'ar' ? 'المالية والمحاسبة' : 'FINANCE & COMPTABILITÉ',
      items: [
        { path: '/v2/contractor-hr', icon: Users, label: language === 'ar' ? 'الموارد البشرية' : 'Ressources Humaines' },
        { path: '/v2/contractor-b2b-invoices', icon: Receipt, label: language === 'ar' ? 'فواتير B2B' : 'Factures B2B' },
        { path: '/v2/contractor-caisses', icon: Wallet, label: language === 'ar' ? 'الصناديق والحسابات' : 'Caisses & Comptes' },
        { path: '/v2/contractor-expenses', icon: CreditCard, label: language === 'ar' ? 'المصاريف والأعباء' : 'Dépenses & Frais' },
        { path: '/v2/contractor-fiscal', icon: Landmark, label: language === 'ar' ? 'النظام الجبائي' : 'Système Fiscal' },
        { path: '/v2/contractor-accounting', icon: PieChart, label: language === 'ar' ? 'المحاسبة العامة' : 'Comptabilité Générale' },
        { path: '/v2/audit', icon: ShieldCheck, label: language === 'ar' ? 'التدقيق الذكي' : 'Audit IA', tag: 'VIP' }
      ]
    },
    {
      key: 'settings',
      title: language === 'ar' ? 'الإعدادات' : 'PARAMÈTRES',
      items: [
        { path: '/v2/contractor-settings', icon: Settings, label: language === 'ar' ? 'إعدادات المتجر' : 'Profil' }
      ]
    }
  ];

  // 2. هيكلة أقسام المهندس (Architect)
  const architectMenuSections = [
    {
      key: 'dashboard',
      title: language === 'ar' ? 'القيادة الهندسية' : 'BUREAU D\'ÉTUDES',
      items: [
        { path: '/v2/architect-dashboard', icon: LayoutDashboard, label: language === 'ar' ? 'مكتبي (نظرة عامة)' : 'Bureau (Aperçu)' },
        { path: '/v2/architect-simulator', icon: Zap, label: language === 'ar' ? 'محاكي التصاميم' : 'Simulateur d\'Opérations' }
      ]
    },
    {
      key: 'tools',
      title: language === 'ar' ? 'الأدوات המيدانية (AR)' : 'OUTILS TERRAIN (AR)',
      items: [
        { path: '/v2/architect-live-room', icon: Camera, label: language === 'ar' ? 'الغرفة الحية (AR)' : 'Salle Interactive' },
        { path: '/v2/architect-ruler', icon: Calculator, label: language === 'ar' ? 'مسطرة القياس الذكية' : 'Règle & Mesures' },
        { path: '/v2/architect-reports', icon: FileSignature, label: language === 'ar' ? 'محاضر بختم GPS' : 'Rapports scellés GPS' }
      ]
    },
    {
      key: 'market',
      title: language === 'ar' ? 'التواصل والسوق' : 'COMMUNICATION & MARCHÉ',
      items: [
        { path: '/v2/architect-messages', icon: MessageCircle, label: language === 'ar' ? 'صندوق الرسائل' : 'Boîte de Réception' },
        { path: '/v2/architect-marketplace', icon: Store, label: language === 'ar' ? 'سوق BTP' : 'Marché BTP' },
        { path: '/v2/architect-radar', icon: Radar, label: language === 'ar' ? 'رادار المناقصات' : 'Radar d\'Appels d\'offres', tag: 'PRO' }
      ]
    },
    {
      key: 'finance',
      title: language === 'ar' ? 'المالية، الجبايات والموارد' : 'FINANCE, FISCALITÉ & RH',
      items: [
        { path: '/v2/architect-caisses', icon: Wallet, label: language === 'ar' ? 'الصناديق والحسابات' : 'Caisses & Comptes' },
        { path: '/v2/architect-expenses', icon: Receipt, label: language === 'ar' ? 'إدارة المصاريف' : 'Dépenses & Frais' },
        { path: '/v2/architect-hr', icon: Users, label: language === 'ar' ? 'الموارد البشرية' : 'Ressources Humaines' },
        { path: '/v2/architect-fiscal', icon: Landmark, label: language === 'ar' ? 'النظام الجبائي' : 'Système Fiscal' },
        { path: '/v2/architect-accounting', icon: PieChart, label: language === 'ar' ? 'المحاسبة العامة' : 'Comptabilité Générale' },
        { path: '/v2/audit', icon: ShieldCheck, label: language === 'ar' ? 'التدقيق الذكي' : 'Audit IA', tag: 'VIP' }
      ]
    },
    {
      key: 'settings',
      title: language === 'ar' ? 'الإعدادات والملف' : 'PARAMÈTRES',
      items: [
        { path: '/v2/architect-settings', icon: Settings, label: language === 'ar' ? 'إعدادات المكتب' : 'Profil' }
      ]
    }
  ];

  // 3. هيكلة أقسام الحرفي (Provider) - 🆕 تم تطويرها بذكاء مع فصل الرادار
  const providerMenuSections = [
    {
      key: 'dashboard',
      title: language === 'ar' ? 'الأوراش والتشغيل' : language === 'fr' ? 'CHANTIERS & RADAR' : 'WORKSHOPS & RADAR',
      items: [
        { path: '/v2/provider-dashboard', icon: LayoutDashboard, label: language === 'ar' ? 'لوحة القيادة' : 'Tableau de bord' },
        { path: '/v2/provider-radar', icon: Radar, label: language === 'ar' ? 'رادار الأوراش الحية' : 'Radar Chantiers Live', tag: 'LIVE' },
        { path: '/v2/provider-projects', icon: HardHat, label: language === 'ar' ? 'أوراشي الجارية' : 'Chantiers en Cours' },
        { path: '/v2/provider-portfolio', icon: Image, label: language === 'ar' ? 'معرض أعمالي (Portfolio)' : 'Mon Portfolio' }
      ]
    },
    {
      key: 'tools',
      title: language === 'ar' ? 'أدوات المعلم الذكي' : language === 'fr' ? 'OUTILS DU MAÂLEM PRO' : 'SMART PRO TOOLS',
      items: [
        { path: '/v2/provider-calculator', icon: Calculator, label: language === 'ar' ? 'حاسبة السلعة & Devis' : 'Calculateur & Devis', tag: 'PRO' },
        { path: '/v2/provider-clients', icon: Users, label: language === 'ar' ? 'الزبناء والتسبيقات' : 'Clients & Avances' },
        { path: '/v2/provider-expenses', icon: Receipt, label: language === 'ar' ? 'أجور الخدامة والمصاريف' : 'Journaliers & Frais' }
      ]
    },
    {
      key: 'market',
      title: language === 'ar' ? 'التواصل والسلعة' : language === 'fr' ? 'RÉSEAU & MATÉRIAUX' : 'NETWORK & SUPPLIES',
      items: [
        { path: '/v2/provider-messages', icon: MessageCircle, label: language === 'ar' ? 'صندوق الرسائل' : 'Boîte de Réception' },
        { path: '/v2/provider-materials', icon: Store, label: language === 'ar' ? 'شراء السلعة (BTP)' : 'Achat Matériaux' },
        { path: '/v2/provider-affiliates', icon: Trophy, label: language === 'ar' ? 'أرباح الشركاء والعمولات' : 'Mes Gains Partenaire' }
      ]
    },
    {
      key: 'account',
      title: language === 'ar' ? 'التوثيق والإعدادات' : language === 'fr' ? 'CONFIANCE & PROFIL' : 'TRUST & PROFILE',
      items: [
        { path: '/v2/provider-reviews', icon: Star, label: language === 'ar' ? 'آراء الزبناء' : 'Avis & Recommandations' },
        { path: '/v2/provider-settings', icon: Settings, label: language === 'ar' ? 'إعدادات الحساب' : 'Profil & Métier' }
      ]
    }
  ];

  // 4. هيكلة لوحة التحكم المركزية للأدمن (Admin Dashboard) 🆕
  const adminMenuSections = [
    {
      key: 'dashboard',
      title: language === 'ar' ? 'غرفة القيادة المركزية' : 'SALLE DE CONTRÔLE',
      items: [
        { path: '/v2/admin-dashboard', icon: LayoutDashboard, label: language === 'ar' ? 'نظرة عامة (Overview)' : 'Aperçu Général' },
        { path: '/v2/admin-analytics', icon: PieChart, label: language === 'ar' ? 'التحليلات والإحصائيات' : 'Analytiques' }
      ]
    },
    {
      key: 'finance',
      title: language === 'ar' ? 'المالية والاشتراكات' : 'FINANCE & ABONNEMENTS',
      items: [
        { path: '/v2/admin-billing', icon: CreditCard, label: language === 'ar' ? 'الاشتراكات والفوترة' : 'Abonnements & Facturation', tag: 'GOD MODE' },
        { path: '/v2/admin-cost-items', icon: Calculator, label: language === 'ar' ? 'أسعار المواد التقديرية' : 'Prix Estimés des Matériaux' }
      ]
    },
    {
      key: 'users',
      title: language === 'ar' ? 'المستخدمون والأوراش' : 'UTILISATEURS & CHANTIERS',
      items: [
        { path: '/v2/admin-crm', icon: Users, label: language === 'ar' ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs' },
        { path: '/v2/admin-workshops', icon: HardHat, label: language === 'ar' ? 'الورش المفتوحة (Live)' : 'Chantiers Actifs' },
        { path: '/v2/admin-services', icon: Briefcase, label: language === 'ar' ? 'طلبات الخدمات' : 'Demandes de Services' }
      ]
    },
    {
      key: 'system',
      title: language === 'ar' ? 'النظام والصندوق الأسود' : 'SYSTÈME & BOÎTE NOIRE',
      items: [
        { path: '/v2/admin-audit', icon: ShieldCheck, label: language === 'ar' ? 'سجل العمليات (Audit)' : 'Journal d\'Audit' },
        { path: '/v2/admin-global-settings', icon: Settings, label: language === 'ar' ? 'إعدادات المنصة' : 'Paramètres Globaux' }
      ]
    }
  ];

  let currentMenuSections = contractorMenuSections;
  if (safeAccountType === 'architect') currentMenuSections = architectMenuSections;
  if (safeAccountType === 'provider') currentMenuSections = providerMenuSections;
  if (safeAccountType === 'admin') currentMenuSections = adminMenuSections; // تطبيق مسارات الأدمن

  const badgeText = 
    safeAccountType === 'contractor' ? (['pro', 'enterprise', 'vip'].includes(contractorPlan) ? 'BUREAU D\'ENTREPRENEUR' : 'BUREAU D\'ENTREPRENEUR') :
    safeAccountType === 'architect' ? (['pro', 'vip', 'elite'].includes(architectPlan) ? 'BUREAU VIP 👑' : 'BUREAU D\'ARCHITECTURE') :
    safeAccountType === 'admin' ? 'ADMINISTRATION CENTRALE' :
    (['pro', 'maalem pro'].includes(providerPlan) ? 'MAÂLEM PRO 🔥' : 'ESPACE ARTISAN PRO');
  
  const headerGradient = 
    safeAccountType === 'contractor' ? 'from-blue-600 to-indigo-700' :
    safeAccountType === 'architect' ? 'from-indigo-600 to-purple-700' :
    safeAccountType === 'admin' ? 'from-emerald-600 to-teal-700' :
    'from-orange-600 to-amber-700';
    
  const upgradePath = 
    safeAccountType === 'architect' ? '/v2/architect-subscription' : 
    safeAccountType === 'provider' ? '/v2/provider-subscription' :
    '/v2/subscription';

  return (
    <aside className={`w-[280px] h-screen bg-[#0f172a] text-slate-300 flex flex-col select-none ${isRtl ? 'border-l border-slate-800' : 'border-r border-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes sidebarShimmer {
          0% { filter: brightness(0.9); }
          50% { filter: brightness(1.3); }
          100% { filter: brightness(0.9); }
        }
        .shimmer-title {
          animation: sidebarShimmer 2s infinite ease-in-out;
        }
      `}</style>
      
      {/* 1. Header & Identity */}
      <div className="p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${headerGradient} flex items-center justify-center text-white font-black text-2xl shadow-xl border-2 border-white/10 shrink-0`}>
              {storeName ? storeName.charAt(0).toUpperCase() : (safeAccountType === 'admin' ? '🛡️' : 'S')}
            </div>
            <div className="min-w-0 text-start">
              <h2 className="text-white font-black text-lg truncate">SasBTP V2</h2>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                safeAccountType === 'contractor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                safeAccountType === 'architect' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                safeAccountType === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              }`}>
                {badgeText}
              </span>
            </div>
          </div>
        </div>

        {/* زر الترقية (مخفي في لوحة الأدمن) */}
        {safeAccountType !== 'admin' && (
          <button 
            onClick={() => navigate(upgradePath)}
            className={`mt-5 w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer text-slate-900 ${
              safeAccountType === 'contractor' ? 'bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-300 hover:to-indigo-300 shadow-blue-500/20' :
              safeAccountType === 'architect' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-amber-500/20' :
              'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 shadow-orange-500/20'
            }`}
          >
            <Zap size={16} className="fill-slate-900 animate-bounce" />
            <span>{language === 'ar' ? 'ترقية الحساب (PRO)' : 'Passer à PRO'}</span>
          </button>
        )}
      </div>

      {/* 2. Categorized Smart Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 custom-scrollbar text-start pb-24">
        {currentMenuSections.map((section) => (
          <div key={section.key} className="space-y-1.5">
            <SectionHeader title={section.title} themeKey={section.key} />
            {section.items.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className={getLinkStyle(item.path, section.key)}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={`shrink-0 ${getIconStyle(item.path, section.key)}`} />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                    item.tag === 'LIVE' || item.tag === 'RADAR' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' :
                    item.tag === 'VIP' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    item.tag === 'PRO' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    item.tag === '30%' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    'bg-slate-700/50 text-slate-300 border-slate-600'
                  }`}>
                    {item.tag}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}