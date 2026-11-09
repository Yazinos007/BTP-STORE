import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, MessageCircle, FileSignature, 
  Settings, Briefcase, Camera, PieChart, Users, Zap, 
  Receipt, ShieldCheck, Trophy, 
  Store, Calculator, Star, HardHat, Radar, Image, Truck,
  Package, Wallet, CreditCard, Landmark, ShoppingCart
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
  admin: {
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
  },
  retailer: {
    dashboard: { 
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
  }
};

export default function SmartSidebar({ storeName, accountType }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language = 'fr' } = useSettingsStore();
  const isRtl = language === 'ar';

  // 🌐 دالة ترجمة ثلاثية فورية (العربية / الفرنسية / الإنجليزية)
  const tr = (ar, fr, en) => (language === 'ar' ? ar : language === 'fr' ? fr : en);
  
  const resolveRole = () => {
    const p = location.pathname;
    if (p.includes('/architect')) {
      sessionStorage.setItem('sasbtp_v2_role', 'architect');
      return 'architect';
    }
    if (p.includes('/provider-')) {
      sessionStorage.setItem('sasbtp_v2_role', 'provider');
      return 'provider';
    }
    if (p.includes('/admin-')) {
      sessionStorage.setItem('sasbtp_v2_role', 'admin');
      return 'admin';
    }
    if (p.includes('/retailer') || p.includes('/pos')) {
      sessionStorage.setItem('sasbtp_v2_role', 'retailer');
      return 'retailer';
    }
    if (p.includes('/contractor-') || p.includes('/project-path') || p.includes('/cost-calculator') || p.includes('/field-camera') || p.includes('/freight-exchange') || p.includes('/live-orders')) {
      sessionStorage.setItem('sasbtp_v2_role', 'contractor');
      return 'contractor';
    }
    return accountType || sessionStorage.getItem('sasbtp_v2_role') || 'contractor';
  };

  const safeAccountType = resolveRole();

  const [providerPlan, setProviderPlan] = useState('free');
  const [architectPlan, setArchitectPlan] = useState('basic');
  const [contractorPlan, setContractorPlan] = useState('starter');
  const [retailerPlan, setRetailerPlan] = useState('basic');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        const [profRes, archRes, provRes] = await Promise.all([
          supabase.from('profiles').select('subscription_plan').eq('id', data.user.id).maybeSingle(),
          supabase.from('architects').select('subscription_plan').eq('user_id', data.user.id).maybeSingle(),
          supabase.from('providers').select('subscription_plan').eq('user_id', data.user.id).maybeSingle()
        ]);
        if (profRes.data?.subscription_plan) {
          setContractorPlan(profRes.data.subscription_plan.toLowerCase());
          setRetailerPlan(profRes.data.subscription_plan.toLowerCase());
        }
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

  // 1. هيكلة أقسام المقاول (Contractor) - مترجمة بالكامل (AR / FR / EN)
  const contractorMenuSections = [
    {
      key: 'dashboard',
      title: tr('القيادة والتوثيق', 'DIRECTION & TERRAIN', 'MANAGEMENT & FIELD'),
      items: [
        { path: '/v2/contractor-dashboard', icon: LayoutDashboard, label: tr('لوحة القيادة', 'Tableau de bord', 'Dashboard') },
        { path: '/v2/contractor-projects', icon: FolderKanban, label: tr('أوراشي المفتوحة', 'Parcours Projet', 'Project Path'), tag: 'AR' },
        { path: '/v2/contractor-calculator', icon: Calculator, label: tr('حاسبة التكلفة الذكية', 'Calculateur Intelligent', 'Smart Calculator') },
        { path: '/v2/contractor-camera', icon: Camera, label: tr('توثيق الورش (GPS)', 'Caméra de Chantier', 'Site Camera (GPS)') }
      ]
    },
    {
      key: 'projects',
      title: tr('السوق والمناقصات', 'MARCHÉ & APPELS', 'MARKET & TENDERS'),
      items: [
        { path: '/v2/contractor-marketplace', icon: Store, label: tr('سوق BTP العام', 'Marché BTP', 'BTP Marketplace') },
        { path: '/v2/contractor-radar', icon: Radar, label: tr('رادار المناقصات (Live)', "Radar Appels d'offres", 'Tender Radar (Live)'), tag: 'PRO' }
      ]
    },
    {
      key: 'communication',
      title: tr('التواصل واللوجستيك', 'COMMUNICATION & LOGISTIQUE', 'COMMUNICATION & LOGISTICS'),
      items: [
        { path: '/v2/contractor-messages', icon: MessageCircle, label: tr('صندوق الرسائل', 'Boîte de Réception', 'Inbox') },
        { path: '/v2/contractor-freight', icon: Truck, label: tr('بورصة اللوجستيك', 'Bourse de Fret', 'Freight Exchange') },
        { path: '/v2/contractor-live-orders', icon: Package, label: tr('تتبع طلبيات السلعة', 'Commandes Live', 'Live Orders') }
      ]
    },
    {
      key: 'finance',
      title: tr('المالية والمحاسبة', 'FINANCE & COMPTABILITÉ', 'FINANCE & ACCOUNTING'),
      items: [
        { path: '/v2/contractor-hr', icon: Users, label: tr('الموارد البشرية', 'Ressources Humaines', 'Human Resources') },
        { path: '/v2/contractor-b2b-invoices', icon: Receipt, label: tr('فواتير B2B', 'Factures B2B', 'B2B Invoices') },
        { path: '/v2/contractor-caisses', icon: Wallet, label: tr('الصناديق والحسابات', 'Caisses & Comptes', 'Accounts & Cash') },
        { path: '/v2/contractor-expenses', icon: CreditCard, label: tr('المصاريف والأعباء', 'Dépenses & Frais', 'Expenses & Costs') },
        { path: '/v2/contractor-fiscal', icon: Landmark, label: tr('النظام الجبائي', 'Système Fiscal', 'Tax System') },
        { path: '/v2/contractor-accounting', icon: PieChart, label: tr('المحاسبة العامة', 'Comptabilité Générale', 'General Accounting') },
        { path: '/v2/contractor-audit', icon: ShieldCheck, label: tr('التدقيق الذكي', 'Audit IA', 'Smart AI Audit'), tag: 'VIP' }
      ]
    },
    {
      key: 'settings',
      title: tr('الإعدادات', 'PARAMÈTRES', 'SETTINGS'),
      items: [
        { path: '/v2/contractor-settings', icon: Settings, label: tr('إعدادات المتجر', 'Profil', 'Profile & Settings') }
      ]
    }
  ];

  // 2. هيكلة أقسام المهندس (Architect) - مترجمة بالكامل (AR / FR / EN)
  const architectMenuSections = [
    {
      key: 'dashboard',
      title: tr('القيادة الهندسية', "BUREAU D'ÉTUDES", 'DESIGN OFFICE'),
      items: [
        { path: '/v2/architect-dashboard', icon: LayoutDashboard, label: tr('مكتبي (نظرة عامة)', 'Bureau (Aperçu)', 'Office (Overview)') },
        { path: '/v2/architect-projects', icon: FolderKanban, label: tr('إدارة المشاريع والرقابة', 'Contrôle & Approbations', 'Control & Approvals') },
        { path: '/v2/architect-archive', icon: FileSignature, label: tr('الأرشيف والوثائق', 'Archives & Plans', 'Archives & Plans') }
      ]
    },
    {
      key: 'tools',
      title: tr('الأدوات الميدانية (AR)', 'OUTILS TERRAIN (AR)', 'FIELD TOOLS (AR)'),
      items: [
        { path: '/v2/architect-ruler', icon: Calculator, label: tr('مسطرة القياس الذكية', 'Règle & Mesures', 'Smart Ruler & Measures') },
        { path: '/v2/architect-reports', icon: Camera, label: tr('محاضر بختم GPS', 'Rapports scellés GPS', 'GPS Sealed Reports') }
      ]
    },
    {
      key: 'market',
      title: tr('التواصل والسوق', 'COMMUNICATION & MARCHÉ', 'COMMUNICATION & MARKET'),
      items: [
        { path: '/v2/architect-messages', icon: MessageCircle, label: tr('صندوق الرسائل', 'Boîte de Réception', 'Inbox') },
        { path: '/v2/architect-marketplace', icon: Store, label: tr('سوق BTP', 'Marché BTP', 'BTP Marketplace') },
        { path: '/v2/architect-radar', icon: Radar, label: tr('رادار المناقصات', "Radar d'Appels d'offres", 'Tender Radar'), tag: 'PRO' }
      ]
    },
    {
      key: 'finance',
      title: tr('المالية، الجبايات والموارد', 'FINANCE, FISCALITÉ & RH', 'FINANCE, TAX & HR'),
      items: [
        { path: '/v2/architect-invoices', icon: Receipt, label: tr('فواتير المكتب B2B', 'Factures B2B', 'B2B Invoices') },
        { path: '/v2/architect-caisses', icon: Wallet, label: tr('الصناديق والحسابات', 'Caisses & Comptes', 'Accounts & Cash') },
        { path: '/v2/architect-expenses', icon: CreditCard, label: tr('إدارة المصاريف', 'Dépenses & Frais', 'Expenses & Costs') },
        { path: '/v2/architect-hr', icon: Users, label: tr('الموارد البشرية', 'Ressources Humaines', 'Human Resources') },
        { path: '/v2/architect-fiscal', icon: Landmark, label: tr('النظام الجبائي', 'Système Fiscal', 'Tax System') },
        { path: '/v2/architect-accounting', icon: PieChart, label: tr('المحاسبة العامة', 'Comptabilité Générale', 'General Accounting') },
        { path: '/v2/architect-audit', icon: ShieldCheck, label: tr('التدقيق الذكي', 'Audit IA', 'Smart AI Audit'), tag: 'VIP' }
      ]
    },
    {
      key: 'settings',
      title: tr('الإعدادات والملف', 'PARAMÈTRES', 'SETTINGS'),
      items: [
        { path: '/v2/architect-settings', icon: Settings, label: tr('إعدادات المكتب', 'Profil', 'Office Profile') }
      ]
    }
  ];

  // 3. هيكلة أقسام الحرفي (Provider) - مترجمة بالكامل (AR / FR / EN)
  const providerMenuSections = [
    {
      key: 'dashboard',
      title: tr('الأوراش والتشغيل', 'CHANTIERS & RADAR', 'WORKSHOPS & RADAR'),
      items: [
        { path: '/v2/provider-dashboard', icon: LayoutDashboard, label: tr('لوحة القيادة', 'Tableau de bord', 'Dashboard') },
        { path: '/v2/provider-radar', icon: Radar, label: tr('رادار الأوراش الحية', 'Radar Chantiers Live', 'Live Jobs Radar'), tag: 'LIVE' },
        { path: '/v2/provider-projects', icon: HardHat, label: tr('أوراشي الجارية', 'Chantiers en Cours', 'Active Workshops') },
        { path: '/v2/provider-portfolio', icon: Image, label: tr('معرض أعمالي (Portfolio)', 'Mon Portfolio', 'My Portfolio') }
      ]
    },
    {
      key: 'tools',
      title: tr('أدوات المعلم الذكي', 'OUTILS DU MAÂLEM PRO', 'SMART PRO TOOLS'),
      items: [
        { path: '/v2/provider-calculator', icon: Calculator, label: tr('حاسبة السلعة & Devis', 'Calculateur & Devis', 'Material & Quote Calculator'), tag: 'PRO' },
        { path: '/v2/provider-clients', icon: Users, label: tr('الزبناء والتسبيقات', 'Clients & Avances', 'Clients & Advances') },
        { path: '/v2/provider-expenses', icon: Receipt, label: tr('أجور الخدامة والمصاريف', 'Journaliers & Frais', 'Daily Wages & Expenses') }
      ]
    },
    {
      key: 'market',
      title: tr('التواصل والسلعة', 'RÉSEAU & MATÉRIAUX', 'NETWORK & SUPPLIES'),
      items: [
        { path: '/v2/provider-messages', icon: MessageCircle, label: tr('صندوق الرسائل', 'Boîte de Réception', 'Inbox') },
        { path: '/v2/provider-materials', icon: Store, label: tr('شراء السلعة (BTP)', 'Achat Matériaux', 'Buy Materials (BTP)') },
        { path: '/v2/provider-affiliates', icon: Trophy, label: tr('أرباح الشركاء والعمولات', 'Mes Gains Partenaire', 'Affiliate Earnings') }
      ]
    },
    {
      key: 'account',
      title: tr('التوثيق والإعدادات', 'CONFIANCE & PROFIL', 'TRUST & PROFILE'),
      items: [
        { path: '/v2/provider-reviews', icon: Star, label: tr('آراء الزبناء', 'Avis & Recommandations', 'Client Reviews') },
        { path: '/v2/provider-settings', icon: Settings, label: tr('إعدادات الحساب', 'Profil & Métier', 'Profile & Trade') }
      ]
    }
  ];

  // 4. هيكلة لوحة التحكم المركزية للأدمن (Admin Dashboard) - مترجمة بالكامل (AR / FR / EN)
  const adminMenuSections = [
    {
      key: 'dashboard',
      title: tr('غرفة القيادة المركزية', 'SALLE DE CONTRÔLE', 'CONTROL ROOM'),
      items: [
        { path: '/v2/admin-dashboard', icon: LayoutDashboard, label: tr('نظرة عامة (Overview)', 'Aperçu Général', 'General Overview') },
        { path: '/v2/admin-analytics', icon: PieChart, label: tr('التحليلات والإحصائيات', 'Analytiques', 'Analytics') }
      ]
    },
    {
      key: 'finance',
      title: tr('المالية والاشتراكات', 'FINANCE & ABONNEMENTS', 'FINANCE & BILLING'),
      items: [
        { path: '/v2/admin-billing', icon: CreditCard, label: tr('الاشتراكات والفوترة', 'Abonnements & Facturation', 'Subscriptions & Billing'), tag: 'GOD MODE' },
        { path: '/v2/admin-cost-items', icon: Calculator, label: tr('أسعار المواد التقديرية', 'Prix Estimés des Matériaux', 'Estimated Material Prices') }
      ]
    },
    {
      key: 'users',
      title: tr('المستخدمون والأوراش', 'UTILISATEURS & CHANTIERS', 'USERS & WORKSHOPS'),
      items: [
        { path: '/v2/admin-crm', icon: Users, label: tr('إدارة المستخدمين', 'Gestion des Utilisateurs', 'User Management (CRM)') },
        { path: '/v2/admin-workshops', icon: HardHat, label: tr('الورش المفتوحة (Live)', 'Chantiers Actifs', 'Active Workshops') },
        { path: '/v2/admin-services', icon: Briefcase, label: tr('طلبات الخدمات', 'Demandes de Services', 'Service Requests') }
      ]
    },
    {
      key: 'system',
      title: tr('النظام والصندوق الأسود', 'SYSTÈME & BOÎTE NOIRE', 'SYSTEM & BLACK BOX'),
      items: [
        { path: '/v2/admin-audit', icon: ShieldCheck, label: tr('سجل العمليات (Audit)', "Journal d'Audit", 'Audit Log') },
        { path: '/v2/admin-global-settings', icon: Settings, label: tr('إعدادات المنصة', 'Paramètres Globaux', 'Global Settings') }
      ]
    }
  ];

  // 5. هيكلة أقسام التاجر (Retailer) - مترجمة بالكامل (AR / FR / EN)
  const retailerMenuSections = [
    {
      key: 'dashboard',
      title: tr('الإدارة والصندوق', 'DIRECTION & CAISSE', 'MANAGEMENT & POS'),
      items: [
        { path: '/v2/retailer-dashboard', icon: LayoutDashboard, label: tr('لوحة القيادة', 'Tableau de bord', 'Dashboard') },
        { path: '/v2/retailer-pos', icon: ShoppingCart, label: tr('نقطة البيع (POS)', 'Point de Vente (POS)', 'Point of Sale (POS)'), tag: 'LIVE' },
        { path: '/v2/retailer-inventory', icon: Package, label: tr('إدارة المخزون والمنتجات', 'Gestion du Stock & Produits', 'Inventory & Products') }
      ]
    },
    {
      key: 'market',
      title: tr('التواصل والسوق', 'COMMUNICATION & MARCHÉ', 'COMMUNICATION & MARKET'),
      items: [
        { path: '/v2/retailer-messages', icon: MessageCircle, label: tr('صندوق الرسائل', 'Boîte de Réception', 'Inbox') },
        { path: '/v2/retailer-marketplace', icon: Store, label: tr('سوق BTP', 'Marché BTP', 'BTP Marketplace') }
      ]
    }
  ];

  let currentMenuSections = contractorMenuSections;
  if (safeAccountType === 'architect') currentMenuSections = architectMenuSections;
  if (safeAccountType === 'provider') currentMenuSections = providerMenuSections;
  if (safeAccountType === 'retailer') currentMenuSections = retailerMenuSections;
  if (safeAccountType === 'admin') currentMenuSections = adminMenuSections;

  const badgeText = 
    safeAccountType === 'contractor'
      ? (['pro', 'enterprise', 'vip'].includes(contractorPlan)
          ? tr('مقاول PRO 🛡️', 'ENTREPRENEUR PRO 🛡️', 'CONTRACTOR PRO 🛡️')
          : tr('مكتب المقاول العام', "BUREAU D'ENTREPRENEUR", 'CONTRACTOR OFFICE'))
      : safeAccountType === 'architect'
      ? (['pro', 'vip', 'elite'].includes(architectPlan)
          ? tr('مكتب هندسي VIP 👑', 'BUREAU VIP 👑', 'VIP ARCHITECT 👑')
          : tr('مكتب المهندس المعماري', "BUREAU D'ARCHITECTE", 'ARCHITECT OFFICE'))
      : safeAccountType === 'admin'
      ? tr('الإدارة المركزية', 'ADMINISTRATION CENTRALE', 'CENTRAL ADMIN')
      : safeAccountType === 'retailer'
      ? (['pro', 'vip', 'enterprise'].includes(retailerPlan)
          ? 'PRO RETAILER ⚡'
          : tr('فضاء التاجر (POS)', 'ESPACE COMMERÇANT (POS)', 'RETAILER SPACE (POS)'))
      : (['pro', 'maalem pro'].includes(providerPlan)
          ? tr('المعلم PRO 🔥', 'MAÂLEM PRO 🔥', 'MASTER PRO 🔥')
          : tr('فضاء الحرفي المعتمد', 'ESPACE ARTISAN PRO', 'ARTISAN PRO SPACE'));
  
  const headerGradient = 
    safeAccountType === 'contractor' ? 'from-blue-600 to-indigo-700' :
    safeAccountType === 'architect' ? 'from-indigo-600 to-purple-700' :
    safeAccountType === 'admin' ? 'from-emerald-600 to-teal-700' :
    safeAccountType === 'retailer' ? 'from-blue-600 to-indigo-700' :
    'from-orange-600 to-amber-700';
    
  const upgradePath = 
    safeAccountType === 'architect' ? '/v2/architect-subscription' : 
    safeAccountType === 'provider' ? '/v2/provider-subscription' :
    safeAccountType === 'retailer' ? '/v2/retailer-subscription' :
    '/v2/subscription';

  return (
    <aside className={`w-[280px] h-screen bg-[#0f172a] text-slate-300 flex flex-col select-none ${isRtl ? 'border-l border-slate-800' : 'border-r border-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes sidebarShimmer {
          0% { filter: brightness(0.95); }
          50% { filter: brightness(1.35); }
          100% { filter: brightness(0.95); }
        }
        .shimmer-title {
          animation: sidebarShimmer 2s infinite ease-in-out;
        }
      `}</style>
      
      {/* 1. Header & Identity - اسم المنصة SasBTP وتحته نوع الحساب */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${headerGradient} flex items-center justify-center text-white font-black text-xl shadow-xl border-2 border-white/10 shrink-0`}>
            {safeAccountType === 'admin' ? '🛡️' : 'S'}
          </div>
          <div className="min-w-0 text-start flex-1">
            <h2 className="text-white font-black text-lg leading-tight truncate tracking-wide">SasBTP</h2>
            <span className={`inline-block whitespace-nowrap mt-1 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
              safeAccountType === 'contractor' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              safeAccountType === 'architect' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
              safeAccountType === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              safeAccountType === 'retailer' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }`}>
              {badgeText}
            </span>
          </div>
        </div>

        {/* 🔥 زر الترقية البرتقالي الذهبي اللامع الموحد */}
        {safeAccountType !== 'admin' && (
          <button 
            onClick={() => navigate(upgradePath)}
            className="mt-4 w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-slate-950 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:shadow-[0_0_28px_rgba(245,158,11,0.7)] hover:scale-[1.02]"
          >
            <Zap size={16} className="fill-slate-950 animate-bounce" />
            <span>
              {safeAccountType === 'provider'
                ? tr('باقة المعلم PRO ⚡', 'Pack Artisan PRO ⚡', 'Artisan PRO Pack ⚡')
                : safeAccountType === 'retailer'
                ? tr('الترقية إلى تاجر PRO ⚡', 'Passer à Pro Retailer ⚡', 'Upgrade to Pro Retailer ⚡')
                : tr('ترقية الحساب (PRO) ⚡', 'Passer à PRO ⚡', 'Upgrade to PRO ⚡')}
            </span>
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