import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { 
  Menu, X, Package, Truck, FileSignature, BarChart3, LogOut, Layers, FileText, Calculator, Users, Receipt, 
  Sparkles, LayoutDashboard, Settings, Zap, Radar, Wallet, Landmark, Globe, ShoppingCart, Factory, ShoppingBag, 
  ChevronDown, Store, Briefcase, ArrowRightLeft, Lock, MessageCircle, Trophy, PlusCircle, Loader2, ShieldCheck, Moon, Sun
} from 'lucide-react';

import RawMaterialSuppliers from './pages/RawMaterialSuppliers';
import RawMaterialPurchases from './pages/RawMaterialPurchases';
import SupplierStock from './pages/SupplierStock';
import SupplierInvoices from './pages/SupplierInvoices';
import SupplierAccounting from './pages/SupplierAccounting';
import SupplierExpenses from './pages/SupplierExpenses';
import SupplierHR from './pages/SupplierHR';
import SmartAdvisor from './pages/SmartAdvisor'; 
import SupplierOverview from './pages/SupplierOverview';
import SupplierClients from './pages/SupplierClients';
import SupplierOrders from './pages/SupplierOrders';
import Fleet from './pages/Fleet';
import Contracts from './pages/Contracts';
import AnalyticsB2B from './pages/AnalyticsB2B'; 
import SupplierSettings from './pages/SupplierSettings';
import SupplierSubscription from './pages/SupplierSubscription';
import RetailerSettings from './pages/Settings'; 
import RetailerSubscription from './pages/RetailerSubscription';
import TenderRadar from './pages/TenderRadar';
import Marketplace from './pages/Marketplace';
import Overview from './pages/Overview';
import Products from './pages/Products';
import Orders from './pages/Orders';
import RetailerWallet from './pages/Wallet';
import POS from './pages/POS';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import HR from './pages/HR';
import Fiscal from './pages/Fiscal';
import Caisses from './pages/Caisses';
import Devis from './pages/Devis';
import BC from './pages/BC';
import BL from './pages/BL';
import Avoir from './pages/Avoir';
import Expeditions from './pages/Expeditions';
import FacturesAchat from './pages/FacturesAchat';
import Clients from './pages/Clients';
import Accounting from './pages/Accounting';
import ExternalSuppliers from './pages/ExternalSuppliers';
import Purchases from './pages/Purchases';
import SupplierPOS from './pages/SupplierPOS';
import SupplierTeam from './pages/SupplierTeam';
import SupplierProduction from './pages/SupplierProduction';
import MarketplaceOrders from './pages/MarketplaceOrders';
import FleetManagement from './pages/FleetManagement';
import LogisticsBourse from './pages/LogisticsBourse';

import UnifiedMessages from './pages/v2/shared/UnifiedMessages';

import V2Router from './pages/v2/V2Router';
import BTPHub from './pages/v2/BTPHub';
import AIAudit from './pages/v2/AIAudit';
import AffiliateDashboard from './pages/v2/AffiliateDashboard';
import SystemNotificationBanner from './components/v2/SystemNotificationBanner';
import GlobalVoiceCopilot from './components/v2/GlobalVoiceCopilot';

import Sidebar from './components/Sidebar';
import TrialBanner from './components/TrialBanner'; 
import RetailTrialBanner from './components/RetailTrialBanner'; 

import useSupplierStore from './store/useSupplierStore';
import useSettingsStore from './store/useSettingsStore';

import EmpireLanding from './landing-pages/EmpireLanding';
import RetailLanding from './landing-pages/RetailLanding';
import ContractorLanding from './landing-pages/ContractorLanding';
import CostCalculatorLanding from './landing-pages/CostCalculatorLanding'; 
import ClientPortal from './landing-pages/ClientPortal';

// 🎨 محرك التصميم الموحد للوضع الفاتح + ألوان الباستيل الخافتة + بروز 3D الديناميكي للبطاقات
const UNIFIED_LIGHT_AND_3D_STYLES = `
  @keyframes b2bHeaderShimmer {
    0% { filter: brightness(0.95); }
    50% { filter: brightness(1.4); }
    100% { filter: brightness(0.95); }
  }
  .b2b-shimmer-title {
    animation: b2bHeaderShimmer 2.4s infinite ease-in-out;
  }

  /* =========================================================================
     🚀 1. تأثير الـ 3D الديناميكي لجميع البطاقات (في الوضعين الفاتح والداكن)
     ========================================================================= */
  .wholesale-light-scope .rounded-2xl,
  .wholesale-light-scope .rounded-3xl,
  .wholesale-light-scope .rounded-\\[2rem\\],
  .wholesale-light-scope .rounded-\\[2\\.5rem\\],
  .wholesale-dark-scope .rounded-2xl,
  .wholesale-dark-scope .rounded-3xl,
  .wholesale-dark-scope .rounded-\\[2rem\\],
  .wholesale-dark-scope .rounded-\\[2\\.5rem\\] {
    transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.24s ease,
                border-color 0.24s ease,
                background-color 0.24s ease !important;
    will-change: transform, box-shadow;
  }

  .wholesale-light-scope .rounded-2xl:hover,
  .wholesale-light-scope .rounded-3xl:hover,
  .wholesale-light-scope .rounded-\\[2rem\\]:hover,
  .wholesale-light-scope .rounded-\\[2\\.5rem\\]:hover {
    transform: translateY(-5px) scale(1.006);
    box-shadow: 0 18px 35px -8px rgba(37, 99, 235, 0.14),
                0 8px 16px -6px rgba(16, 185, 129, 0.1) !important;
    border-color: #93c5fd !important;
  }

  .wholesale-dark-scope .rounded-2xl:hover,
  .wholesale-dark-scope .rounded-3xl:hover,
  .wholesale-dark-scope .rounded-\\[2rem\\]:hover,
  .wholesale-dark-scope .rounded-\\[2\\.5rem\\]:hover {
    transform: translateY(-5px) scale(1.006);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6),
                0 0 20px -2px rgba(59, 130, 246, 0.22) !important;
  }

  .wholesale-light-scope .rounded-2xl:active,
  .wholesale-light-scope .rounded-3xl:active,
  .wholesale-dark-scope .rounded-2xl:active,
  .wholesale-dark-scope .rounded-3xl:active {
    transform: translateY(-1px) scale(0.996) !important;
    transition-duration: 0.08s !important;
  }

  /* =========================================================================
     ☀️ 2. معالجة الحاويات الداكنة فقط (دون المساس ببطاقات الداشبورد الملونة!)
     ========================================================================= */
  .wholesale-light-scope {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eff6ff 100%) !important;
    color: #0f172a !important;
  }

  /* استهداف الألوان الكحلية الداكنة حصرياً واستثناء أي بطاقة تحتوي على تدرج لوني */
  .wholesale-light-scope .bg-slate-950:not([class*="bg-gradient-"]),
  .wholesale-light-scope .bg-slate-900:not([class*="bg-gradient-"]),
  .wholesale-light-scope .bg-slate-800:not([class*="bg-gradient-"]),
  .wholesale-light-scope .bg-gray-900:not([class*="bg-gradient-"]),
  .wholesale-light-scope .bg-gray-800:not([class*="bg-gradient-"]),
  .wholesale-light-scope [class*="bg-slate-900/"],
  .wholesale-light-scope [class*="bg-slate-800/"],
  .wholesale-light-scope [class*="bg-slate-950/"],
  .wholesale-light-scope .bg-\\[\\#0f172a\\],
  .wholesale-light-scope .bg-\\[\\#1e293b\\],
  .wholesale-light-scope .bg-\\[\\#12141c\\],
  .wholesale-light-scope .bg-\\[\\#0b1120\\],
  .wholesale-light-scope [class*="from-slate-9"],
  .wholesale-light-scope [class*="from-slate-8"] {
    background-color: #ffffff !important;
    background-image: none !important;
    border: 1.5px solid #cbd5e1 !important;
    color: #0f172a !important;
    box-shadow: 0 6px 20px -4px rgba(15, 23, 42, 0.06),
                0 2px 6px -1px rgba(15, 23, 42, 0.04) !important;
  }

  .wholesale-light-scope thead,
  .wholesale-light-scope thead tr {
    background-color: #f1f5f9 !important;
    border-color: #cbd5e1 !important;
    color: #0f172a !important;
  }

  /* =========================================================================
     ✒️ 3. وضوح النصوص والأرقام العامة في الواجهة الفاتحة
     ========================================================================= */
  .wholesale-light-scope .text-white,
  .wholesale-light-scope .text-slate-100,
  .wholesale-light-scope .text-slate-200,
  .wholesale-light-scope .text-slate-300 {
    color: #0f172a !important;
  }

  .wholesale-light-scope .text-slate-400,
  .wholesale-light-scope .text-slate-500 {
    color: #334155 !important;
    font-weight: 600 !important;
  }

  .wholesale-light-scope .text-emerald-400,
  .wholesale-light-scope .text-emerald-300,
  .wholesale-light-scope .text-green-400 { color: #047857 !important; }
  .wholesale-light-scope .text-blue-400,
  .wholesale-light-scope .text-blue-300 { color: #1d4ed8 !important; }
  .wholesale-light-scope .text-indigo-400,
  .wholesale-light-scope .text-indigo-300 { color: #4338ca !important; }
  .wholesale-light-scope .text-amber-400,
  .wholesale-light-scope .text-orange-400 { color: #b45309 !important; }
  .wholesale-light-scope .text-red-400,
  .wholesale-light-scope .text-rose-400 { color: #b91c1c !important; }
  .wholesale-light-scope .text-purple-400 { color: #6d28d9 !important; }
  .wholesale-light-scope .text-cyan-400 { color: #0f766e !important; }

  /* =========================================================================
     🎨 4. الصناديق الشفافة (/10, /15, /20, /30) تتحول إلى ألوان باستيل خافتة وواضحة
     ========================================================================= */
  .wholesale-light-scope [class*="bg-blue-"][class*="/"],
  .wholesale-light-scope [class*="from-blue-"][class*="/"] {
    background-color: #eff6ff !important;
    background-image: none !important;
    border: 1.5px solid #93c5fd !important;
    color: #1e3a8a !important;
  }
  .wholesale-light-scope [class*="bg-blue-"][class*="/"] *,
  .wholesale-light-scope [class*="from-blue-"][class*="/"] * { color: #1e3a8a !important; }

  .wholesale-light-scope [class*="bg-indigo-"][class*="/"],
  .wholesale-light-scope [class*="from-indigo-"][class*="/"] {
    background-color: #eef2ff !important;
    background-image: none !important;
    border: 1.5px solid #a5b4fc !important;
    color: #312e81 !important;
  }
  .wholesale-light-scope [class*="bg-indigo-"][class*="/"] *,
  .wholesale-light-scope [class*="from-indigo-"][class*="/"] * { color: #312e81 !important; }

  .wholesale-light-scope [class*="bg-emerald-"][class*="/"],
  .wholesale-light-scope [class*="bg-green-"][class*="/"],
  .wholesale-light-scope [class*="from-emerald-"][class*="/"] {
    background-color: #ecfdf5 !important;
    background-image: none !important;
    border: 1.5px solid #6ee7b7 !important;
    color: #065f46 !important;
  }
  .wholesale-light-scope [class*="bg-emerald-"][class*="/"] *,
  .wholesale-light-scope [class*="bg-green-"][class*="/"] *,
  .wholesale-light-scope [class*="from-emerald-"][class*="/"] * { color: #065f46 !important; }

  .wholesale-light-scope [class*="bg-amber-"][class*="/"],
  .wholesale-light-scope [class*="bg-orange-"][class*="/"],
  .wholesale-light-scope [class*="bg-yellow-"][class*="/"],
  .wholesale-light-scope [class*="from-amber-"][class*="/"],
  .wholesale-light-scope [class*="from-orange-"][class*="/"] {
    background-color: #fff7ed !important;
    background-image: none !important;
    border: 1.5px solid #fdba74 !important;
    color: #9a3412 !important;
  }
  .wholesale-light-scope [class*="bg-amber-"][class*="/"] *,
  .wholesale-light-scope [class*="bg-orange-"][class*="/"] *,
  .wholesale-light-scope [class*="bg-yellow-"][class*="/"] *,
  .wholesale-light-scope [class*="from-amber-"][class*="/"] *,
  .wholesale-light-scope [class*="from-orange-"][class*="/"] * { color: #9a3412 !important; }

  .wholesale-light-scope [class*="bg-red-"][class*="/"],
  .wholesale-light-scope [class*="bg-rose-"][class*="/"],
  .wholesale-light-scope [class*="from-red-"][class*="/"] {
    background-color: #fef2f2 !important;
    background-image: none !important;
    border: 1.5px solid #fca5a5 !important;
    color: #991b1b !important;
  }
  .wholesale-light-scope [class*="bg-red-"][class*="/"] *,
  .wholesale-light-scope [class*="bg-rose-"][class*="/"] *,
  .wholesale-light-scope [class*="from-red-"][class*="/"] * { color: #991b1b !important; }

  /* =========================================================================
     💎 5. حماية جميع بطاقات الداشبورد الملونة والرمادية ونصوصها البيضاء الناصعة
     ========================================================================= */
  .wholesale-light-scope [class*="from-blue-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-indigo-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-emerald-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-teal-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-cyan-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-sky-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-green-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-orange-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-amber-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-pink-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-fuchsia-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-purple-"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-slate-7"]:not([class*="/"]),
  .wholesale-light-scope [class*="from-slate-6"]:not([class*="/"]),
  .wholesale-light-scope .bg-blue-600,
  .wholesale-light-scope .bg-blue-500,
  .wholesale-light-scope .bg-indigo-600,
  .wholesale-light-scope .bg-indigo-500,
  .wholesale-light-scope .bg-emerald-600,
  .wholesale-light-scope .bg-emerald-500,
  .wholesale-light-scope .bg-teal-600,
  .wholesale-light-scope .bg-teal-500,
  .wholesale-light-scope .bg-cyan-600,
  .wholesale-light-scope .bg-cyan-500,
  .wholesale-light-scope .bg-green-600,
  .wholesale-light-scope .bg-green-500,
  .wholesale-light-scope .bg-orange-600,
  .wholesale-light-scope .bg-orange-500,
  .wholesale-light-scope .bg-amber-600,
  .wholesale-light-scope .bg-amber-500,
  .wholesale-light-scope .bg-purple-600,
  .wholesale-light-scope .bg-purple-500,
  .wholesale-light-scope .bg-fuchsia-600,
  .wholesale-light-scope .bg-fuchsia-500,
  .wholesale-light-scope .bg-pink-600,
  .wholesale-light-scope .bg-pink-500,
  .wholesale-light-scope .bg-red-600,
  .wholesale-light-scope .bg-red-500,
  .wholesale-light-scope .bg-slate-700,
  .wholesale-light-scope .bg-slate-600,
  .wholesale-light-scope [class*="bg-[#10b981"],
  .wholesale-light-scope [class*="bg-[#059669"],
  .wholesale-light-scope [class*="bg-[#06b6d4"],
  .wholesale-light-scope [class*="bg-[#0ea5e9"],
  .wholesale-light-scope [class*="bg-[#0284c7"],
  .wholesale-light-scope [class*="bg-[#4f46e5"],
  .wholesale-light-scope [class*="bg-[#6366f1"],
  .wholesale-light-scope [class*="bg-[#d946ef"],
  .wholesale-light-scope [class*="bg-[#ec4899"],
  .wholesale-light-scope [class*="bg-[#f97316"],
  .wholesale-light-scope [class*="bg-[#3b82f6"],
  .wholesale-light-scope [class*="bg-[#334155"],
  .wholesale-light-scope [class*="bg-[#475569"],
  .wholesale-light-scope [class*="bg-[#64748b"] {
    color: #ffffff !important;
  }

  .wholesale-light-scope [class*="from-blue-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-indigo-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-emerald-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-teal-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-cyan-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-sky-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-green-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-orange-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-amber-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-pink-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-fuchsia-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-purple-"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-slate-7"]:not([class*="/"]) *,
  .wholesale-light-scope [class*="from-slate-6"]:not([class*="/"]) *,
  .wholesale-light-scope .bg-blue-600 *,
  .wholesale-light-scope .bg-blue-500 *,
  .wholesale-light-scope .bg-indigo-600 *,
  .wholesale-light-scope .bg-indigo-500 *,
  .wholesale-light-scope .bg-emerald-600 *,
  .wholesale-light-scope .bg-emerald-500 *,
  .wholesale-light-scope .bg-teal-600 *,
  .wholesale-light-scope .bg-teal-500 *,
  .wholesale-light-scope .bg-cyan-600 *,
  .wholesale-light-scope .bg-cyan-500 *,
  .wholesale-light-scope .bg-green-600 *,
  .wholesale-light-scope .bg-green-500 *,
  .wholesale-light-scope .bg-orange-600 *,
  .wholesale-light-scope .bg-orange-500 *,
  .wholesale-light-scope .bg-amber-600 *,
  .wholesale-light-scope .bg-amber-500 *,
  .wholesale-light-scope .bg-purple-600 *,
  .wholesale-light-scope .bg-purple-500 *,
  .wholesale-light-scope .bg-fuchsia-600 *,
  .wholesale-light-scope .bg-fuchsia-500 *,
  .wholesale-light-scope .bg-pink-600 *,
  .wholesale-light-scope .bg-pink-500 *,
  .wholesale-light-scope .bg-red-600 *,
  .wholesale-light-scope .bg-red-500 *,
  .wholesale-light-scope .bg-slate-700 *,
  .wholesale-light-scope .bg-slate-600 *,
  .wholesale-light-scope [class*="bg-[#10b981"] *,
  .wholesale-light-scope [class*="bg-[#059669"] *,
  .wholesale-light-scope [class*="bg-[#06b6d4"] *,
  .wholesale-light-scope [class*="bg-[#0ea5e9"] *,
  .wholesale-light-scope [class*="bg-[#0284c7"] *,
  .wholesale-light-scope [class*="bg-[#4f46e5"] *,
  .wholesale-light-scope [class*="bg-[#6366f1"] *,
  .wholesale-light-scope [class*="bg-[#d946ef"] *,
  .wholesale-light-scope [class*="bg-[#ec4899"] *,
  .wholesale-light-scope [class*="bg-[#f97316"] *,
  .wholesale-light-scope [class*="bg-[#3b82f6"] *,
  .wholesale-light-scope [class*="bg-[#334155"] *,
  .wholesale-light-scope [class*="bg-[#475569"] *,
  .wholesale-light-scope [class*="bg-[#64748b"] * {
    color: #ffffff !important;
  }

  /* =========================================================================
     🔘 6. حماية الأزرار البيضاء التفاعلية فقط (أزرار وحقول وليس الأيقونات)
     ========================================================================= */
  
  /* استهداف الأزرار والروابط التي تحمل الكلاس bg-white بشكل مباشر */
  .wholesale-light-scope button.bg-white,
  .wholesale-light-scope a.bg-white,
  .wholesale-light-scope label.bg-white {
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #cbd5e1 !important;
  }
  
  /* فرض لون داكن فقط على النصوص داخل الأزرار والروابط البيضاء */
  .wholesale-light-scope button.bg-white *,
  .wholesale-light-scope a.bg-white *,
  .wholesale-light-scope label.bg-white * {
    color: #0f172a !important;
  }
  
  /* تأثير التمرير للأزرار */
  .wholesale-light-scope button.bg-white:hover,
  .wholesale-light-scope a.bg-white:hover,
  .wholesale-light-scope label.bg-white:hover {
    background-color: #eff6ff !important;
    border-color: #3b82f6 !important;
    color: #1d4ed8 !important;
  }
  .wholesale-light-scope button.bg-white:hover *,
  .wholesale-light-scope a.bg-white:hover *,
  .wholesale-light-scope label.bg-white:hover * {
    color: #1d4ed8 !important;
  }

  /* حقول الإدخال والبحث */
  .wholesale-light-scope input,
  .wholesale-light-scope select,
  .wholesale-light-scope textarea {
    background-color: #ffffff !important;
    border: 1.5px solid #cbd5e1 !important;
    color: #0f172a !important;
  }
  .wholesale-light-scope input::placeholder,
  .wholesale-light-scope textarea::placeholder {
    color: #64748b !important;
  }
`;

// 🔄 دالة مزامنة تاريخ بداية الفترة التجريبية الموحد لجميع الفضاءات
function syncUserTrialDate(user) {
  if (!user) return;
  try {
    const baseDate = user.created_at || new Date().toISOString();
    const keys = [
      `sasbtp_trial_wholesale_${user.id}`,
      `sasbtp_trial_retail_${user.id}`,
      `sasbtp_trial_contractor_${user.id}`,
      `sasbtp_trial_architect_${user.id}`,
      `sasbtp_trial_provider_${user.id}`,
      'sasbtp_trial_wholesale_v2',
      'sasbtp_trial_retail_v2'
    ];
    keys.forEach((k) => {
      localStorage.setItem(k, baseDate);
    });
  } catch (err) {
    console.error('Trial sync warning:', err);
  }
}

// 🧲 رادار التقاط كود الإحالة تلقائياً من الرابط في جميع الصفحات
function ReferralTracker() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    
    if (refCode && refCode.startsWith('SAS-')) {
      localStorage.setItem('sasbtp_referral_code', refCode.trim().toUpperCase());
      localStorage.setItem('sasbtp_referral_date', new Date().toISOString());
    }
  }, [location]);

  return null;
}

// 🚀 مكون مبدل الفضاءات الموحد والذكي
const GlobalSpaceSwitcher = ({ language, dark = false, currentSpace = 'retail' }) => {
  const navigate = useNavigate(); 
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [ownedIds, setOwnedIds] = useState([]);
  const [spacePlans, setSpacePlans] = useState({});
  const [activating, setActivating] = useState(null);
  const isRtl = language === 'ar';

  const labels = {
    ar: {
      btn: 'تبديل الفضاء',
      addBtn: 'فتح فضاء آخر',
      activeHeader: 'فضاءاتك المفعلة (انتقال فوري)',
      expandHint: 'يمكنك تفعيل حساب إضافي بنفس بريدك الحالي والتنقل بينها بضغطة زر:',
      addLink: '+ تفعيل فضاء مهني إضافي',
      activateBadge: '+ تفعيل',
      basicBadge: 'أساسي',
      contractor: '🏗️ فضاء المقاول العام',
      architect: '📐 مكتب المهندس المعماري',
      provider: '👷‍♂️ فضاء الحرفي المعتمد',
      retail: '🏪 فضاء تاجر التجزئة',
      wholesale: '🏭 فضاء مورد الجملة'
    },
    fr: {
      btn: 'Changer d\'Espace',
      addBtn: 'Ajouter un Espace',
      activeHeader: 'Vos espaces actifs',
      expandHint: 'Vous pouvez ouvrir un autre espace professionnel avec votre compte actuel :',
      addLink: '+ Activer un nouvel espace',
      activateBadge: '+ Activer',
      basicBadge: 'Basic',
      contractor: '🏗️ Espace Entrepreneur',
      architect: '📐 Bureau d\'Architecte',
      provider: '👷‍♂️ Espace Artisan Pro',
      retail: '🏪 Espace Détaillant',
      wholesale: '🏭 Espace Grossiste B2B'
    },
    en: {
      btn: 'Switch Space',
      addBtn: 'Add Space',
      activeHeader: 'Your Active Spaces',
      expandHint: 'You can activate another professional space under your current account:',
      addLink: '+ Activate another space',
      activateBadge: '+ Activate',
      basicBadge: 'Basic',
      contractor: '🏗️ Contractor Hub',
      architect: '📐 Architect Office',
      provider: '👷‍♂️ Artisan Space',
      retail: '🏪 Retailer Store',
      wholesale: '🏭 Wholesaler B2B'
    }
  }[language] || {};

  const allSpaces = [
    { id: 'contractor', label: labels.contractor, path: '/v2/contractor-dashboard', badge: spacePlans.contractor || labels.basicBadge },
    { id: 'architect', label: labels.architect, path: '/v2/architect-dashboard', badge: spacePlans.architect || labels.basicBadge },
    { id: 'provider', label: labels.provider, path: '/v2/provider-dashboard', badge: spacePlans.provider || labels.basicBadge },
    { id: 'retail', label: labels.retail, path: '/?preview=retail', badge: spacePlans.retail || labels.basicBadge },
    { id: 'wholesale', label: labels.wholesale, path: '/?preview=wholesale', badge: spacePlans.wholesale || labels.basicBadge }
  ];

  useEffect(() => {
    const fetchUserSpaces = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.email === 'admin@souqbtp.ma' || user.user_metadata?.role === 'admin') {
        setOwnedIds(['contractor', 'architect', 'provider', 'retail', 'wholesale']);
        setSpacePlans({ contractor: 'VIP', architect: 'VIP', provider: 'PRO', retail: 'PRO', wholesale: 'B2B' });
        return;
      }

      const owned = new Set(user.user_metadata?.enabled_spaces || []);
      owned.add(currentSpace);

      const metaRole = user.user_metadata?.role || user.user_metadata?.account_type;
      if (metaRole === 'contractor' || metaRole === 'client') owned.add('contractor');
      if (metaRole === 'architect') owned.add('architect');
      if (metaRole === 'provider') owned.add('provider');

      const [archRes, provRes, supRes] = await Promise.all([
        supabase.from('architects').select('id, subscription_plan').eq('user_id', user.id).limit(1),
        supabase.from('providers').select('id, subscription_plan').eq('user_id', user.id).limit(1),
        supabase.from('suppliers').select('id, supplier_type, subscription_plan').eq('user_id', user.id)
      ]);

      const plans = {
        contractor: user.user_metadata?.subscription_plan === 'pro' ? 'PRO' : (labels.basicBadge || 'Basic'),
        architect: labels.basicBadge || 'Basic',
        provider: labels.basicBadge || 'Basic',
        retail: labels.basicBadge || 'Basic',
        wholesale: labels.basicBadge || 'Basic'
      };

      if (archRes.data && archRes.data.length > 0) {
        owned.add('architect');
        const p = archRes.data[0].subscription_plan;
        plans.architect = (p && p !== 'basic') ? p.toUpperCase() : (labels.basicBadge || 'Basic');
      }
      if (provRes.data && provRes.data.length > 0) {
        owned.add('provider');
        const p = provRes.data[0].subscription_plan;
        plans.provider = (p && p !== 'basic' && p !== 'free') ? p.toUpperCase() : (labels.basicBadge || 'Basic');
      }
      if (supRes.data && supRes.data.length > 0) {
        supRes.data.forEach(s => {
          const p = (s.subscription_plan && s.subscription_plan !== 'basic' && s.subscription_plan !== 'starter') ? s.subscription_plan.toUpperCase() : (labels.basicBadge || 'Basic');
          if (s.supplier_type === 'wholesale') {
            owned.add('wholesale');
            plans.wholesale = p;
          } else {
            owned.add('retail');
            plans.retail = p;
          }
        });
      }

      setOwnedIds(Array.from(owned));
      setSpacePlans(plans);
    };

    fetchUserSpaces();
  }, [currentSpace, language, labels.basicBadge]);

  const otherOwned = allSpaces.filter(sp => ownedIds.includes(sp.id) && sp.id !== currentSpace);
  const uncreated = allSpaces.filter(sp => !ownedIds.includes(sp.id) && sp.id !== currentSpace);

  const handleSwitch = (path) => {
    setOpen(false);
    if (path.includes('preview=retail')) {
      sessionStorage.setItem('souqbtp_preview_mode', 'retail');
    } else if (path.includes('preview=wholesale')) {
      sessionStorage.setItem('souqbtp_preview_mode', 'wholesale');
    } else {
      sessionStorage.removeItem('souqbtp_preview_mode');
    }
    navigate(path);
  };

  const handleActivate = async (sp) => {
    try {
      setActivating(sp.id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updated = Array.from(new Set([...ownedIds, currentSpace, sp.id]));
      await supabase.auth.updateUser({ data: { enabled_spaces: updated } });

      const defaultName = user.user_metadata?.company_name || user.user_metadata?.full_name || 'SasBTP Pro';
      const defaultPhone = user.user_metadata?.phone || '';

      if (sp.id === 'architect') {
        const { data: ex } = await supabase.from('architects').select('id').eq('user_id', user.id).limit(1);
        if (!ex || ex.length === 0) {
          await supabase.from('architects').insert([{ user_id: user.id, full_name: defaultName, email: user.email, phone: defaultPhone, agency_name: defaultName, specialty: 'Architect', subscription_plan: 'basic' }]);
        }
      } else if (sp.id === 'provider') {
        const { data: ex } = await supabase.from('providers').select('id').eq('user_id', user.id).limit(1);
        if (!ex || ex.length === 0) {
          await supabase.from('providers').insert([{ user_id: user.id, full_name: defaultName, phone: defaultPhone || `06${Math.floor(10000000 + Math.random() * 90000000)}`, account_type: 'marketplace' }]);
        }
      } else if (sp.id === 'retail' || sp.id === 'wholesale') {
        const { data: ex } = await supabase.from('suppliers').select('id').eq('user_id', user.id).eq('supplier_type', sp.id).limit(1);
        if (!ex || ex.length === 0) {
          await supabase.from('suppliers').insert([{ user_id: user.id, store_name: defaultName, email: user.email, phone: defaultPhone, supplier_type: sp.id }]);
        }
      }

      setOwnedIds(updated);
      handleSwitch(sp.path);
    } catch (e) {
      console.error(e);
    } finally {
      setActivating(null);
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => { setOpen(!open); setShowAdd(otherOwned.length === 0); }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-2 md:px-4 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all whitespace-nowrap cursor-pointer"
      >
        {otherOwned.length > 0 ? <Layers size={16} /> : <PlusCircle size={16} />}
        <span className="hidden sm:inline">{otherOwned.length > 0 ? labels.btn : labels.addBtn}</span>
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-72 rounded-2xl shadow-2xl border p-2 z-50 ${
            dark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'
          }`}>
            {otherOwned.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-[11px] font-black text-purple-500 uppercase tracking-wider">{labels.activeHeader}</div>
                {otherOwned.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => handleSwitch(it.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all mb-1 last:mb-0 cursor-pointer ${
                      dark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-purple-50 hover:text-purple-700 text-slate-700'
                    }`}
                  >
                    <span>{it.label}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-500 border border-slate-500/20">
                      {it.badge}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {uncreated.length > 0 && (
              <div className={otherOwned.length > 0 ? 'border-t border-slate-700/20 pt-2 mt-1' : ''}>
                {!showAdd && otherOwned.length > 0 ? (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-black text-cyan-500 hover:bg-cyan-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>{labels.addLink}</span>
                  </button>
                ) : (
                  <div className="space-y-1.5 p-1">
                    <div className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-[11px] font-bold text-purple-400 leading-relaxed">{labels.expandHint}</p>
                    </div>
                    {uncreated.map((sp) => (
                      <button
                        key={sp.id}
                        disabled={activating === sp.id}
                        onClick={() => handleActivate(sp)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border border-dashed transition-all cursor-pointer ${
                          dark ? 'border-slate-700 hover:border-purple-500 hover:bg-slate-800 text-slate-300' : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50 text-slate-700'
                        }`}
                      >
                        <span>{sp.label}</span>
                        {activating === sp.id ? (
                          <Loader2 size={14} className="animate-spin text-purple-500" />
                        ) : (
                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {labels.activateBadge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// 🛑 الحارس الإلكتروني للأقسام المدفوعة (مربوط بقاعدة البيانات و God Mode)
const PremiumGuard = ({ children }) => {
  const { language } = useSettingsStore();
  const navigate = useNavigate();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkUserTrial = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.email === 'admin@sasbtp.ma' || user.user_metadata?.role === 'admin') {
        setIsExpired(false);
        return;
      }

      const [profRes, supRes] = await Promise.all([
        supabase.from('profiles').select('subscription_plan, trial_ends_at').eq('id', user.id).maybeSingle(),
        supabase.from('suppliers').select('subscription_plan, trial_ends_at').eq('user_id', user.id)
      ]);

      const plans = [
        user.user_metadata?.subscription_plan,
        profRes.data?.subscription_plan,
        ...(supRes.data || []).map(s => s.subscription_plan)
      ].filter(Boolean).map(p => p.toLowerCase());

      if (plans.some(p => ['pro', 'enterprise', 'premium', 'vip'].includes(p))) {
        setIsExpired(false);
        return;
      }

      const createdAt = user.created_at ? new Date(user.created_at) : new Date();
      const defaultTrialEnd = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);

      const candidateDates = [
        defaultTrialEnd,
        profRes.data?.trial_ends_at ? new Date(profRes.data.trial_ends_at) : null,
        ...(supRes.data || []).map(s => s.trial_ends_at ? new Date(s.trial_ends_at) : null)
      ].filter(Boolean);

      const effectiveEnd = new Date(Math.max(...candidateDates.map(d => d.getTime())));
      setIsExpired(effectiveEnd.getTime() < Date.now());
    };
    checkUserTrial();
  }, []);

  const t = {
    ar: { title: 'عذراً، انتهت الفترة التجريبية!', desc: 'لقد انتهت صلاحية استخدامك المجاني لهذه الميزة الحصرية. قم بالترقية الآن لباقة Pro ERP لاستعادة الوصول فوراً ومضاعفة أرباحك.', btn: 'ترقية الحساب الآن' },
    fr: { title: 'Période d\'essai expirée !', desc: 'Votre accès gratuit à cette fonctionnalité a expiré. Mettez à niveau vers Pro ERP pour y accéder à nouveau et sécuriser vos marges.', btn: 'Mettre à niveau maintenant' },
    en: { title: 'Sorry, Trial Expired!', desc: 'Your free access to this premium feature has expired. Upgrade to Pro ERP now to restore access and multiply your margins.', btn: 'Upgrade Account Now' }
  }[language] || { title: 'Sorry, Trial Expired!', desc: 'Upgrade to Pro ERP now to restore access.', btn: 'Upgrade Account Now' };

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock size={48} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white">{t.title}</h2>
        <p className="text-slate-400 max-w-lg text-lg font-medium leading-relaxed">{t.desc}</p>
        <button 
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-4 rounded-xl font-black text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20 mt-4 cursor-pointer"
        >
          <Zap size={24} className="fill-black" />
          {t.btn}
        </button>
      </div>
    );
  }
  return children;
};

// 🎨 منظومة الألوان المتوهجة والنابضة لسيدبار المورد الكبير (B2B Neon Themes)
const WHOLESALE_SECTION_THEMES = {
  direction: {
    gradientText: 'bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    dot: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]',
    activeBtn: 'bg-blue-600/20 text-blue-300 border border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.45)] animate-pulse',
    activeIcon: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.9)]',
    hoverBtn: 'hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30',
    groupActive: 'bg-blue-500/10 text-blue-300 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    subBorder: 'border-blue-500/30'
  },
  comm: {
    gradientText: 'bg-gradient-to-r from-emerald-400 via-teal-200 to-green-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    dot: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
    activeBtn: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse',
    activeIcon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]',
    hoverBtn: 'hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30',
    groupActive: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    subBorder: 'border-emerald-500/30'
  },
  industrial: {
    gradientText: 'bg-gradient-to-r from-amber-400 via-yellow-200 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    dot: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
    activeBtn: 'bg-amber-500/20 text-amber-300 border border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.45)] animate-pulse',
    activeIcon: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]',
    hoverBtn: 'hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30',
    groupActive: 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    subBorder: 'border-amber-500/30'
  },
  finance: {
    gradientText: 'bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
    dot: 'bg-purple-400 shadow-[0_0_10px_#c084fc]',
    activeBtn: 'bg-purple-600/20 text-purple-300 border border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.45)] animate-pulse',
    activeIcon: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]',
    hoverBtn: 'hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30',
    groupActive: 'bg-purple-500/10 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    subBorder: 'border-purple-500/30'
  },
  params: {
    gradientText: 'bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    dot: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
    activeBtn: 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/70 shadow-[0_0_20px_rgba(34,211,238,0.45)] animate-pulse',
    activeIcon: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]',
    hoverBtn: 'hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30',
    groupActive: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
    subBorder: 'border-cyan-500/30'
  }
};

// 🛡️ لوحة المورد الكبير المحصنة (Smart Glowing B2B Sidebar)
const WholesalerDashboard = ({ supplier, storeName, storeInitial, children }) => {
  const { language, setLanguage } = useSettingsStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isMinimal = window.location.href.includes('minimal=true') || window.location.search.includes('minimal=true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sasbtp_theme_mode');
    return saved ? saved === 'dark' : true;
  });

  const toggleThemeMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('sasbtp_theme_mode', next ? 'dark' : 'light');
      return next;
    });
  };

  const [openMenus, setOpenMenus] = useState({
    comm_market: false,
    achats: false,
    marketplace: false,
    ventes: true
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/v2/auth');
  };

  useEffect(() => {
    const p = location.pathname;
    if (['/messages', '/marketplace'].includes(p)) setOpenMenus(prev => ({ ...prev, comm_market: true }));
    if (['/raw-suppliers', '/raw-purchases'].includes(p)) setOpenMenus(prev => ({ ...prev, achats: true }));
    if (['/market-orders', '/fleet-market'].includes(p)) setOpenMenus(prev => ({ ...prev, marketplace: true }));
    if (['/clients', '/pos-b2b', '/orders', '/fleet-b2b', '/contracts'].includes(p)) setOpenMenus(prev => ({ ...prev, ventes: true }));
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMinimal) {
    return (
      <div className="flex h-screen w-full bg-[#0f172a] text-slate-300 font-sans overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 w-full">
          {children}
        </main>
      </div>
    );
  }

  const handleLanguageChange = () => {
    if (language === 'fr') setLanguage('ar');
    else if (language === 'ar') setLanguage('en');
    else setLanguage('fr');
  };

  const tLayout = {
    fr: { 
      upgrade: "Passer à l'Enterprise", affiliates: "Partenaires", logout: "Déconnexion", portal: "Espace Fournisseur B2B", online: "Système en ligne", wholesaler: "Grossiste",
      darkMode: "Mode Sombre", lightMode: "Mode Clair",
      sections: {
        direction: "DIRECTION & INTELLIGENCE",
        comm: "MARCHÉ, RADAR & FRET",
        industrial: "INDUSTRIE, STOCK & VENTES B2B",
        finance: "FINANCE, FISCALITÉ & RH",
        params: "ADMINISTRATION & ÉQUIPE"
      },
      groups: { comm: "Communication & Marché", achats: "Achats & Fournisseurs", marketplace: "Gestion Marketplace", ventes: "Gestion des Ventes" },
      items: { overview: "Tableau de bord", inbox: "Boîte de Réception", btpMarket: "Marché BTP", rawSuppliers: "Fournisseurs & Prestataires", rawPurchases: "Achats & Approvisionnement", stock: "Stock Central", production: "Production", marketOrders: "Commandes Marketplace", fleetMarket: "Suivi des Commandes", clients: "Clients & Dettes", posB2B: "Ventes Directes (POS)", orders: "Commandes Reçues (B2B)", fleetB2B: "Suivi des Commandes (B2B)", contracts: "Contrats & Signatures", invoices: "Factures B2B", hr: "Ressources Humaines", caisses: "Caisses & Banques", expenses: "Gestion des Charges", fiscal: "Système Fiscal", accounting: "Comptabilité & Bilan", analytics: "Analytiques B2B", ai: "Conseiller Stratégique", radar: "Radar d'Appels d'Offres", logisticsBourse: "Bourse de Fret", team: "Utilisateurs & Permissions", settings: "Paramètres & Confiance" } 
    },
    ar: { 
      upgrade: "ترقية للباقة الذهبية", affiliates: "شركاء النجاح", logout: "خروج", portal: "بوابة المورد الكبير", online: "النظام متصل", wholesaler: "مورد جملة",
      darkMode: "الوضع الداكن", lightMode: "الوضع الفاتح",
      sections: {
        direction: "القيادة والذكاء الاستراتيجي",
        comm: "السوق، المناقصات واللوجستيك",
        industrial: "المصنع، المخزون والمبيعات الكبرى",
        finance: "المالية، الجبايات والموارد البشرية",
        params: "الإدارة، الفريق والإعدادات"
      },
      groups: { comm: "التواصل والسوق", achats: "المشتريات والموردون", marketplace: "إدارة الماركت بليس", ventes: "إدارة المبيعات" },
      items: { overview: "لوحة القيادة", inbox: "صندوق الرسائل", btpMarket: "سوق BTP", rawSuppliers: "الموردون والشركاء", rawPurchases: "المشتريات والتوريد", stock: "المخزون المركزي", production: "الإنتاج (المعمل)", marketOrders: "طلبات الماركت بليس", fleetMarket: "تتبع شحنات المتجر", clients: "العملاء والديون (CRM)", posB2B: "المبيعات المباشرة (POS)", orders: "طلبات التزويد (B2B)", fleetB2B: "تتبع شحنات التزويد", contracts: "العقود والتوقيعات", invoices: "الفواتير الكبرى", hr: "الموارد البشرية", caisses: "الصناديق والحسابات", expenses: "إدارة المصاريف", fiscal: "النظام الجبائي (TVA)", accounting: "المحاسبة والـ CPC", analytics: "التحليلات الكبرى", ai: "المستشار الذكي", radar: "رادار المناقصات", logisticsBourse: "بورصة اللوجستيك", team: "المستخدمون والصلاحيات", settings: "الإعدادات والتوثيق" } 
    },
    en: { 
      upgrade: "Upgrade to Enterprise", affiliates: "Affiliates", logout: "Logout", portal: "Wholesale B2B Portal", online: "System Online", wholesaler: "Wholesaler",
      darkMode: "Dark Mode", lightMode: "Light Mode",
      sections: {
        direction: "DIRECTION & AI STRATEGY",
        comm: "MARKET, TENDERS & FREIGHT",
        industrial: "FACTORY, STOCK & B2B SALES",
        finance: "FINANCE, TAX & HR",
        params: "ADMINISTRATION & TEAM"
      },
      groups: { comm: "Communication & Market", achats: "Purchases & Suppliers", marketplace: "Marketplace Management", ventes: "Sales Management" },
      items: { overview: "Dashboard", inbox: "Inbox", btpMarket: "BTP Marketplace", rawSuppliers: "Suppliers & Partners", rawPurchases: "Purchases & Procurement", stock: "Central Stock", production: "Production", marketOrders: "Marketplace Orders", fleetMarket: "Order Tracking", clients: "Clients & Debts", posB2B: "Direct Sales (POS)", orders: "Received Orders (B2B)", fleetB2B: "B2B Tracking", contracts: "Contracts & Signatures", invoices: "B2B Invoices", hr: "Human Resources", caisses: "Banks & Registers", expenses: "Expenses Management", fiscal: "Tax System (VAT)", accounting: "Accounting & CPC", analytics: "B2B Analytics", ai: "Strategic Advisor", radar: "Tender Radar", logisticsBourse: "Freight Exchange", team: "Users & Permissions", settings: "Settings & Trust" } 
    }
  };
  const t = tLayout[language] || tLayout['fr'];
  const isRtl = language === 'ar';
  
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [readyToShipCount, setReadyToShipCount] = useState(0);

  useEffect(() => {
    if (!supplier?.id) return;
    const syncSmartData = async () => {
      const { data: orders } = await supabase.from('supply_requests').select('status, merchant_id').eq('supplier_id', supplier.id);
      if (orders) {
        setPendingOrdersCount(orders.filter(o => o.status === 'pending').length);
        setReadyToShipCount(orders.filter(o => o.status === 'signed').length);
      }
    };
    syncSmartData();
    const channel = supabase.channel('wholesaler-smart-radar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supply_requests', filter: `supplier_id=eq.${supplier.id}` }, () => {
        syncSmartData();
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [supplier]);

  const categorizedSections = [
    {
      key: 'direction',
      title: t.sections.direction,
      items: [
        { path: '/', icon: LayoutDashboard, label: t.items.overview },
        { path: '/analytics', icon: BarChart3, label: t.items.analytics },
        { path: '/ai-advisor', icon: Sparkles, label: t.items.ai, tag: 'IA' },
        { path: '/audit', icon: ShieldCheck, label: language === 'ar' ? 'التدقيق المالي الذكي' : language === 'fr' ? 'Audit Financier IA' : 'Smart AI Audit', tag: 'VIP' }
      ]
    },
    {
      key: 'comm',
      title: t.sections.comm,
      items: [
        {
          id: 'comm_market', icon: MessageCircle, label: t.groups.comm,
          children: [
            { path: '/messages', icon: MessageCircle, label: t.items.inbox },
            { path: '/marketplace', icon: Store, label: t.items.btpMarket },
          ]
        },
        { path: '/tender-radar', icon: Radar, label: t.items.radar, tag: 'LIVE' },
        { path: '/logistics-bourse', icon: ArrowRightLeft, label: t.items.logisticsBourse }
      ]
    },
    {
      key: 'industrial',
      title: t.sections.industrial,
      items: [
        { path: '/stock', icon: Layers, label: t.items.stock },
        { path: '/production', icon: Factory, label: t.items.production },
        {
          id: 'achats', icon: ShoppingBag, label: t.groups.achats,
          children: [
            { path: '/raw-suppliers', icon: Users, label: t.items.rawSuppliers },
            { path: '/raw-purchases', icon: Receipt, label: t.items.rawPurchases },
          ]
        },
        {
          id: 'marketplace', icon: Store, label: t.groups.marketplace,
          children: [
            { path: '/market-orders', icon: ShoppingBag, label: t.items.marketOrders },
            { path: '/fleet-market', icon: Truck, label: t.items.fleetMarket },
          ]
        },
        {
          id: 'ventes', icon: Briefcase, label: t.groups.ventes,
          children: [
            { path: '/clients', icon: Users, label: t.items.clients },
            { path: '/pos-b2b', icon: ShoppingCart, label: t.items.posB2B },
            { path: '/orders', icon: Package, label: t.items.orders, badge: pendingOrdersCount },
            { path: '/fleet-b2b', icon: Truck, label: t.items.fleetB2B, badge: readyToShipCount },
            { path: '/contracts', icon: FileSignature, label: t.items.contracts },
          ]
        },
        { path: '/invoices', icon: FileText, label: t.items.invoices }
      ]
    },
    {
      key: 'finance',
      title: t.sections.finance,
      items: [
        { path: '/caisses', icon: Wallet, label: t.items.caisses },
        { path: '/expenses', icon: Receipt, label: t.items.expenses },
        { path: '/hr', icon: Users, label: t.items.hr },
        { path: '/fiscal', icon: Landmark, label: t.items.fiscal },
        { path: '/accounting', icon: Calculator, label: t.items.accounting }
      ]
    },
    {
      key: 'params',
      title: t.sections.params,
      items: [
        { path: '/team', icon: Users, label: t.items.team },
        { path: '/settings', icon: Settings, label: t.items.settings }
      ]
    }
  ];

  const getThemedLinkStyle = (path, themeKey) => {
    const isActive = location.pathname === path;
    const theme = WHOLESALE_SECTION_THEMES[themeKey] || WHOLESALE_SECTION_THEMES.direction;
    if (isActive) return theme.activeBtn;
    return `text-slate-400 border border-transparent ${theme.hoverBtn}`;
  };

  const getThemedIconStyle = (path, themeKey) => {
    const isActive = location.pathname === path;
    const theme = WHOLESALE_SECTION_THEMES[themeKey] || WHOLESALE_SECTION_THEMES.direction;
    return isActive ? theme.activeIcon : 'text-slate-400 group-hover:text-white transition-colors';
  };

  const toggleMenu = (id) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const SectionHeader = ({ title, themeKey }) => {
    const theme = WHOLESALE_SECTION_THEMES[themeKey] || WHOLESALE_SECTION_THEMES.direction;
    return (
      <div className="px-3 pb-1.5 pt-2 flex items-center gap-2.5 relative overflow-hidden">
        <span className={`w-2 h-2 rounded-full animate-ping absolute opacity-75 ${theme.dot}`} />
        <span className={`w-2 h-2 rounded-full relative shrink-0 ${theme.dot}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest b2b-shimmer-title ${theme.gradientText}`}>
          {title}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`flex h-screen w-full max-w-full font-sans overflow-hidden transition-colors duration-500 ${
        isDarkMode
          ? 'bg-[#0f172a] text-slate-300'
          : 'bg-gradient-to-br from-[#f8fafc] via-[#f2fbf7] to-[#f1f5f9] text-slate-800'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <style>{UNIFIED_LIGHT_AND_3D_STYLES}</style>

      {/* السايدبار يظل داكناً فخماً مع التوهج النيوني */}
      <aside className={`shrink-0 h-full bg-[#0f172a] flex flex-col shadow-2xl transition-all duration-300 ease-in-out absolute md:relative z-30 ${isSidebarOpen ? 'w-72 border-r border-slate-800 opacity-100 translate-x-0' : 'w-0 border-r-0 opacity-0 overflow-hidden'}`}>
        <div className="w-72 h-full flex flex-col">
          <div className="h-24 shrink-0 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/10">
                {storeInitial}
              </div>
              <div className="flex flex-col text-start">
                <h1 className="text-xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
                  SasBTP
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 mt-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                  B2B EMPIRE
                </span>
              </div>
            </div>
            <button onClick={handleLanguageChange} className="flex flex-col items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all text-slate-300 hover:text-white group cursor-pointer">
              <Globe size={18} />
              <span className="text-[9px] font-black uppercase mt-1 tracking-wider">{language}</span>
            </button>
          </div>

          <div className="px-5 pt-5 pb-2 shrink-0">
            <Link to="/subscription" className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all text-xs">
              <Zap size={18} className="fill-black animate-bounce" />
              {t.upgrade}
            </Link>
          </div>
          
          <nav className="flex-1 py-3 px-3.5 space-y-5 overflow-y-auto custom-scrollbar pb-24">
            {categorizedSections.map((section) => {
              const theme = WHOLESALE_SECTION_THEMES[section.key];
              return (
                <div key={section.key} className="space-y-1.5">
                  <SectionHeader title={section.title} themeKey={section.key} />

                  {section.items.map((item) => {
                    if (item.children) {
                      const isOpen = openMenus[item.id];
                      const hasActiveChild = item.children.some(c => location.pathname === c.path);
                      return (
                        <div key={item.id} className="space-y-1">
                          <button
                            onClick={() => toggleMenu(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-black text-xs transition-all border cursor-pointer ${
                              hasActiveChild
                                ? theme.groupActive
                                : `text-slate-300 border-transparent ${theme.hoverBtn}`
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon size={18} className={`${theme.activeIcon} shrink-0`} />
                              <span className="uppercase tracking-wider">{item.label}</span>
                            </div>
                            <ChevronDown size={15} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                          </button>

                          <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className={`py-1 space-y-1 ${isRtl ? `mr-5 border-r-2 pr-3 ${theme.subBorder}` : `ml-5 border-l-2 pl-3 ${theme.subBorder}`}`}>
                              {item.children.map(child => (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => { if (window.innerWidth <= 768) setIsSidebarOpen(false); }}
                                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-black transition-all text-xs group ${getThemedLinkStyle(child.path, section.key)}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <child.icon size={16} className={`shrink-0 ${getThemedIconStyle(child.path, section.key)}`} />
                                    <span>{child.label}</span>
                                  </div>
                                  {child.badge > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                      {child.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => { if (window.innerWidth <= 768) setIsSidebarOpen(false); }}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-black text-xs transition-all group ${getThemedLinkStyle(item.path, section.key)}`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={18} className={`shrink-0 ${getThemedIconStyle(item.path, section.key)}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.tag && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20">
                            {item.tag}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 w-full max-w-full">
        <SystemNotificationBanner />
        <header className={`h-20 shrink-0 w-full border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-slate-800/60 backdrop-blur-xl' : 'bg-white/90 border-slate-200/80 backdrop-blur-md shadow-sm'}`}>
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'}`}>
              {isSidebarOpen ? <X size={20} className="text-red-500" /> : <Menu size={20} className="text-blue-500" />}
            </button>
            <div className="truncate pr-1 text-start">
              <h2 className={`text-lg md:text-xl font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.portal}</h2>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                {t.online}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
            <Link to="/affiliates" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-3 py-2 md:px-4 rounded-full font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap text-xs md:text-sm">
              <Trophy size={15} /> <span className="hidden sm:inline">{t.affiliates}</span>
            </Link>

            <GlobalSpaceSwitcher language={language} dark={isDarkMode} currentSpace="wholesale" />

            <button
              onClick={handleLanguageChange}
              className={`px-3 py-2 rounded-full font-black text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
              }`}
            >
              <Globe size={15} />
              <span className="uppercase">{language}</span>
            </button>

            {/* 🌙☀️ زر الوضع الداكن / الفاتح */}
            <button
              onClick={toggleThemeMode}
              className={`px-3.5 py-2 rounded-full font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                  : 'bg-emerald-950 hover:bg-slate-900 text-white'
              }`}
            >
              {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
              <span className="hidden md:inline">{isDarkMode ? t.lightMode : t.darkMode}</span>
            </button>

            <button onClick={handleLogout} className={`flex items-center justify-center w-10 h-10 md:w-auto md:px-3.5 md:py-2 rounded-full text-xs font-black transition-all cursor-pointer border ${isDarkMode ? 'text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white border-red-500/20' : 'text-red-600 bg-red-50/90 hover:bg-red-500 hover:text-white border-red-200'}`}>
              <LogOut size={16} /> <span className={`hidden sm:inline ${isRtl ? 'mr-1.5' : 'ml-1.5'}`}>{t.logout}</span>
            </button>
          </div>
        </header>
        <div className="relative z-10">
          <TrialBanner />
        </div>
        <div className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10 w-full max-w-full ${isDarkMode ? 'wholesale-dark-scope' : 'wholesale-light-scope'}`}>
          {children}
        </div>
        <GlobalVoiceCopilot />
      </main>
    </div>
  );
};

// 💎 مكون التاجر الداعم لمبدل الفضاءات الشامل وزر الوضع الداكن / الفاتح + تأثير الـ 3D والإطار النابض وتباين النصوص والأيقونات
const RetailerLayout = ({ storeName, storeInitial, language, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { setLanguage } = useSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarWrapperRef = useRef(null);
  const retailContentRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sasbtp_theme_mode');
    return saved ? saved === 'dark' : false;
  });

  const toggleThemeMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('sasbtp_theme_mode', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLanguageChange = () => {
    if (language === 'fr') setLanguage('ar');
    else if (language === 'ar') setLanguage('en');
    else setLanguage('fr');
  };
  
  const isMinimal = window.location.search.includes('minimal=true') || window.location.href.includes('minimal=true');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/v2/auth');
  };

  // 🔥 1. تثبيت اسم المنصة "SasBTP" وحرف "S" ونوع الحساب تحت اسم المنصة مباشرة في أعلى سايدبار التاجر (معالجة ص1)
  useEffect(() => {
    const container = sidebarWrapperRef.current;
    if (!container) return;

    const accountTypeLabel =
      language === 'ar'
        ? 'فضاء تاجر التجزئة'
        : language === 'en'
        ? 'RETAILER SPACE'
        : 'ESPACE COMMERÇANT';

    const enforceSidebarHeaderIdentity = () => {
      const navEl = container.querySelector('nav');
      const allEls = Array.from(container.querySelectorAll('*'));

      // حصر العناصر التي تقع في الترويسة العليا للسيدبار (قبل قائمة التنقل <nav>)
      const headerLeaves = allEls.filter((el) => {
        if (navEl && (navEl === el || navEl.contains(el))) return false;
        if (['STYLE', 'SCRIPT', 'SVG', 'PATH', 'CIRCLE', 'RECT', 'LINE', 'POLYGON', 'POLYLINE'].includes(el.tagName)) return false;
        if (el.closest('svg')) return false;
        if (el.children.length > 0) return false;
        const txt = (el.textContent || '').trim();
        return txt.length > 0;
      });

      // استبعاد أزرار اللغة والترقية من نصوص الهوية
      const identityLeaves = headerLeaves.filter((el) => {
        const txt = (el.textContent || '').trim().toUpperCase();
        if (['FR', 'AR', 'EN'].includes(txt)) return false;
        if (el.closest('button') || el.closest('a')) {
          if (
            txt.includes('PASSER') ||
            txt.includes('PRO RETAILER') ||
            txt.includes('UPGRADE') ||
            txt.includes('ترقية') ||
            txt.includes('باقة') ||
            ['FR', 'AR', 'EN'].includes(txt)
          ) {
            return false;
          }
        }
        return true;
      });

      if (identityLeaves.length === 0) return;

      // أ) تحويل حرف الشعار الدائري/المربع (مثل A) إلى S
      let avatarFixed = false;
      const nonAvatarLeaves = [];

      identityLeaves.forEach((el) => {
        const txt = (el.textContent || '').trim();
        if (!avatarFixed && txt.length === 1) {
          if (el.textContent !== 'S') {
            el.textContent = 'S';
          }
          avatarFixed = true;
        } else {
          nonAvatarLeaves.push(el);
        }
      });

      // ب) السطر الأول: استبدال اسم صاحب الحساب (مثل Almo9awil) باسم المنصة SasBTP
      if (nonAvatarLeaves.length >= 1) {
        const titleEl = nonAvatarLeaves[0];
        if (titleEl.textContent !== 'SasBTP') {
          titleEl.textContent = 'SasBTP';
        }
        titleEl.style.setProperty('color', '#ffffff', 'important');
        titleEl.style.setProperty('font-weight', '900', 'important');
        titleEl.style.setProperty('letter-spacing', '0.02em', 'important');
      }

      // ج) السطر الثاني (تحت SasBTP مباشرة): كتابة نوع الحساب بوضوح
      if (nonAvatarLeaves.length >= 2) {
        const typeBadgeEl = nonAvatarLeaves[1];
        if (typeBadgeEl.textContent !== accountTypeLabel) {
          typeBadgeEl.textContent = accountTypeLabel;
        }
        typeBadgeEl.style.setProperty('color', '#38bdf8', 'important');
        typeBadgeEl.style.setProperty('background-color', 'rgba(56, 189, 248, 0.16)', 'important');
        typeBadgeEl.style.setProperty('border', '1px solid rgba(56, 189, 248, 0.4)', 'important');
        typeBadgeEl.style.setProperty('font-weight', '900', 'important');
        typeBadgeEl.style.setProperty('padding', '2px 8px', 'important');
        typeBadgeEl.style.setProperty('border-radius', '6px', 'important');
        typeBadgeEl.style.setProperty('display', 'inline-block', 'important');
      }

      // د) السطر الثالث (إن وجد مثل PROPRIÉTAIRE): يعرض باقة المتجر BASIC POS بشكل متناسق
      if (nonAvatarLeaves.length >= 3) {
        const planBadgeEl = nonAvatarLeaves[2];
        const currentTxt = (planBadgeEl.textContent || '').trim().toUpperCase();
        if (
          currentTxt.includes('PROPRIÉTAIRE') ||
          currentTxt.includes('PROPRIETAIRE') ||
          currentTxt.includes('OWNER') ||
          currentTxt.includes('مالك')
        ) {
          planBadgeEl.textContent = 'BASIC POS';
        }
      }
    };

    enforceSidebarHeaderIdentity();
    const observer = new MutationObserver(enforceSidebarHeaderIdentity);
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    const intervalId = setInterval(enforceSidebarHeaderIdentity, 350);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [language, storeName]);

  // 🔥 2. معالج التباين الذكي للنصوص فوق البطاقات الداكنة والفاتحة (ص1، ص2، وقسم POS)
  useEffect(() => {
    const contentRoot = retailContentRef.current;
    if (!contentRoot) return;

    const parseRgbValues = (str) => {
      if (!str) return [];
      const matches = [...str.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/g)];
      return matches.map((m) => ({
        r: Number(m[1]),
        g: Number(m[2]),
        b: Number(m[3]),
        a: m[4] !== undefined ? Number(m[4]) : 1
      }));
    };

    const getLuminance = ({ r, g, b }) => 0.299 * r + 0.587 * g + 0.114 * b;

    const hasDarkSurface = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const cs = window.getComputedStyle(el);
      const bgColors = parseRgbValues(cs.backgroundColor).filter((c) => c.a > 0.35);
      if (bgColors.length > 0 && getLuminance(bgColors[0]) < 105) {
        return true;
      }
      const gradColors = parseRgbValues(cs.backgroundImage).filter((c) => c.a > 0.3);
      if (gradColors.length > 0) {
        const avgLum = gradColors.reduce((acc, c) => acc + getLuminance(c), 0) / gradColors.length;
        if (avgLum < 105) return true;
      }
      return false;
    };

    const hasLightSurface = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const cs = window.getComputedStyle(el);
      const bgColors = parseRgbValues(cs.backgroundColor).filter((c) => c.a > 0.45);
      if (bgColors.length > 0 && getLuminance(bgColors[0]) > 175) {
        return true;
      }
      return false;
    };

    const enforceSmartContrast = () => {
      const allContainers = Array.from(contentRoot.querySelectorAll('div, section, article, aside, header, footer'));
      const darkContainers = new Set();

      // أ) رصد الحاويات الداكنة (بطاقة المساعد الذكي وبطاقة السلة Panier)
      allContainers.forEach((el) => {
        if (hasDarkSurface(el)) {
          darkContainers.add(el);
        }
      });

      const allElements = Array.from(contentRoot.querySelectorAll('*'));
      allElements.forEach((el) => {
        const cls = typeof el.className === 'string' ? el.className : '';
        const txt = (el.textContent || '').trim();

        // 1. إصلاح عنوان Point de Vente (POS) وأي عنوان يستخدم bg-clip-text فوق بطاقة بيضاء
        if (
          cls.includes('bg-clip-text') ||
          (el.children.length === 0 && (
            txt.includes('Point de Vente') ||
            txt.includes('نقطة البيع') ||
            txt.includes('Point of Sale')
          ))
        ) {
          const insideDark = Array.from(darkContainers).some((d) => d.contains(el));
          if (!insideDark && !isDarkMode) {
            el.style.setProperty('color', '#0f172a', 'important');
            el.style.setProperty('-webkit-text-fill-color', '#0f172a', 'important');
            el.style.setProperty('background-image', 'none', 'important');
          }
        }

        // 2. التأكيد النصي المباشر لبطاقة المساعد الذكي وترويسة السلة Panier
        if (el.children.length === 0) {
          if (
            txt.includes('Assistant Intelligent') ||
            txt.includes('المساعد الذكي') ||
            txt.includes('Fonctionnalité Premium') ||
            txt.includes('ميزة مدفوعة') ||
            txt.includes('Mettez à niveau votre compte') ||
            txt === 'Panier' ||
            txt === 'سلة' ||
            txt === 'السلة' ||
            txt.includes('Le panier est vide') ||
            txt.includes('السلة فارغة')
          ) {
            el.style.setProperty('color', '#ffffff', 'important');
            if (txt === 'Panier' || txt === 'سلة' || txt === 'السلة') {
              const parentHeader = el.parentElement;
              if (parentHeader) {
                parentHeader.style.setProperty('color', '#ffffff', 'important');
                parentHeader.querySelectorAll('svg').forEach((svg) => {
                  svg.style.setProperty('color', '#60a5fa', 'important');
                  svg.style.setProperty('stroke', '#60a5fa', 'important');
                });
              }
            }
            let curr = el.parentElement;
            while (curr && curr !== contentRoot) {
              if (hasDarkSurface(curr)) {
                darkContainers.add(curr);
              }
              curr = curr.parentElement;
            }
          }
        }
      });

      // ج) معالجة النصوص والأزرار داخل الحاويات الداكنة (مع حماية زر Générer Devis/BC ذي الخلفية الفاتحة)
      darkContainers.forEach((darkBox) => {
        darkBox.style.setProperty('color', '#ffffff', 'important');
        const descendants = darkBox.querySelectorAll('*');
        descendants.forEach((child) => {
          const tag = child.tagName;
          if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;

          // حماية المربعات والأزرار ذات الخلفية الفاتحة داخل البطاقات الداكنة (مثل زر Générer Devis/BC ومربع القفل)
          const lightParent = child.closest('button, a, div, span');
          const childTxt = (child.textContent || '').trim();
          const isDevisBtn =
            childTxt.includes('Générer Devis') ||
            childTxt.includes('Devis/BC') ||
            childTxt.includes('إنشاء عرض') ||
            (lightParent && (
              (lightParent.textContent || '').includes('Générer Devis') ||
              (lightParent.textContent || '').includes('Devis/BC')
            ));

          if (isDevisBtn || (lightParent && lightParent !== darkBox && hasLightSurface(lightParent))) {
            if (isDevisBtn || (lightParent && (lightParent.tagName === 'BUTTON' || lightParent.tagName === 'A'))) {
              child.style.setProperty('color', '#1e3a8a', 'important');
              child.style.setProperty('-webkit-text-fill-color', '#1e3a8a', 'important');
              if (tag === 'SVG' || tag === ' svg') {
                child.style.setProperty('stroke', '#1d4ed8', 'important');
              }
            }
            return;
          }

          const cls = typeof child.className === 'string' ? child.className : '';
          if (
            tag === 'BUTTON' ||
            tag === 'A' ||
            cls.includes('bg-amber-500') ||
            cls.includes('bg-orange-500') ||
            cls.includes('from-amber-') ||
            cls.includes('from-orange-')
          ) {
            child.style.setProperty('color', '#ffffff', 'important');
            return;
          }

          if (cls.includes('text-blue-400') || cls.includes('text-indigo-400') || cls.includes('text-blue-500')) {
            child.style.setProperty('color', '#60a5fa', 'important');
            return;
          }

          if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV', 'STRONG', 'B', 'LABEL'].includes(tag)) {
            child.style.setProperty('color', '#ffffff', 'important');
          }
        });
      });
    };

    enforceSmartContrast();
    const observer = new MutationObserver(enforceSmartContrast);
    observer.observe(contentRoot, { childList: true, subtree: true });
    const timer = setTimeout(enforceSmartContrast, 250);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [location.pathname, isDarkMode, language]);

  if (isMinimal) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50 text-gray-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    );
  }

  const isRtl = language === 'ar';
  const logoutLabel = language === 'fr' ? 'Déconnexion' : language === 'en' ? 'Logout' : 'خروج';
  const darkLabel = language === 'fr' ? 'Mode Sombre' : language === 'en' ? 'Dark Mode' : 'الوضع الداكن';
  const lightLabel = language === 'fr' ? 'Mode Clair' : language === 'en' ? 'Light Mode' : 'الوضع الفاتح';

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <style>{`
        ${UNIFIED_LIGHT_AND_3D_STYLES}

        /* =========================================================================
           🔥 تحسينات خاصة وحصرية بفضاء التاجر (Retailer UI Scope) - ص1، ص2، ص3
           ========================================================================= */

        @keyframes retailPulseBorder {
          0%, 100% {
            box-shadow: 0 8px 22px -6px rgba(15, 23, 42, 0.1),
                        0 0 0 1.5px rgba(59, 130, 246, 0.28);
          }
          50% {
            box-shadow: 0 12px 28px -6px rgba(37, 99, 235, 0.22),
                        0 0 0 2.5px rgba(59, 130, 246, 0.65),
                        0 0 16px rgba(59, 130, 246, 0.25);
          }
        }

        @keyframes retailColoredCardPulse {
          0%, 100% {
            box-shadow: 0 12px 26px -6px rgba(15, 23, 42, 0.22),
                        inset 0 0 0 1.5px rgba(255, 255, 255, 0.35),
                        0 0 0 1.5px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 16px 32px -6px rgba(37, 99, 235, 0.35),
                        inset 0 0 0 2px rgba(255, 255, 255, 0.75),
                        0 0 0 3px rgba(96, 165, 250, 0.75),
                        0 0 22px rgba(59, 130, 246, 0.4);
          }
        }

        /* 1. إطار ينبض في حواف جميع البطائق + صعود 3D للأعلى عند التمرير أو الضغط (ص3 وكافة الأقسام) */
        .retail-ui-scope .rounded-xl:not(input):not(select):not(textarea):not(button):not(a),
        .retail-ui-scope .rounded-2xl:not(input):not(select):not(textarea):not(button):not(a),
        .retail-ui-scope .rounded-3xl:not(.retail-main-wrapper):not(input):not(select):not(textarea):not(button):not(a) {
          transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.28s ease,
                      border-color 0.28s ease !important;
          animation: retailPulseBorder 2.8s infinite ease-in-out;
          will-change: transform, box-shadow;
        }

        .retail-ui-scope [class*="bg-gradient-"].rounded-xl,
        .retail-ui-scope [class*="bg-gradient-"].rounded-2xl,
        .retail-ui-scope [class*="bg-gradient-"].rounded-3xl {
          animation: retailColoredCardPulse 2.4s infinite ease-in-out !important;
        }

        .retail-ui-scope .rounded-xl:not(input):not(select):not(textarea):not(button):not(a):hover,
        .retail-ui-scope .rounded-2xl:not(input):not(select):not(textarea):not(button):not(a):hover,
        .retail-ui-scope .rounded-3xl:not(.retail-main-wrapper):not(input):not(select):not(textarea):not(button):not(a):hover {
          transform: translateY(-8px) scale(1.015) !important;
          box-shadow: 0 24px 44px -10px rgba(37, 99, 235, 0.34),
                      0 12px 22px -6px rgba(15, 23, 42, 0.18),
                      0 0 0 2.5px rgba(59, 130, 246, 0.85),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.5) !important;
          z-index: 10;
        }

        .retail-ui-scope .rounded-xl:not(input):not(select):not(textarea):not(button):not(a):active,
        .retail-ui-scope .rounded-2xl:not(input):not(select):not(textarea):not(button):not(a):active,
        .retail-ui-scope .rounded-3xl:not(.retail-main-wrapper):not(input):not(select):not(textarea):not(button):not(a):active {
          transform: translateY(-4px) scale(1.006) !important;
          box-shadow: 0 16px 30px -8px rgba(37, 99, 235, 0.45),
                      0 0 0 3px rgba(37, 99, 235, 0.95) !important;
          transition-duration: 0.08s !important;
        }

        /* 2. إصلاح البطاقات الملونة (بما فيها الحمراء Rupture de Stock والصفراء والبرتقالية) لتكون الكتابة والأيقونات بيضاء بارزة (ص3) */
        .retail-ui-scope [class*="from-red-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-rose-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-yellow-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-amber-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-orange-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-blue-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-indigo-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-emerald-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-green-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-teal-"]:not([class*="/"]),
        .retail-ui-scope [class*="from-purple-"]:not([class*="/"]),
        .retail-ui-scope .bg-red-500,
        .retail-ui-scope .bg-red-600,
        .retail-ui-scope .bg-rose-500,
        .retail-ui-scope .bg-rose-600,
        .retail-ui-scope .bg-amber-500,
        .retail-ui-scope .bg-amber-600,
        .retail-ui-scope .bg-orange-500,
        .retail-ui-scope .bg-orange-600,
        .retail-ui-scope .bg-emerald-500,
        .retail-ui-scope .bg-emerald-600,
        .retail-ui-scope .bg-blue-500,
        .retail-ui-scope .bg-blue-600 {
          color: #ffffff !important;
        }

        .retail-ui-scope [class*="from-red-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-rose-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-yellow-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-amber-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-orange-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-blue-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-indigo-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-emerald-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-green-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-teal-"]:not([class*="/"]) *,
        .retail-ui-scope [class*="from-purple-"]:not([class*="/"]) *,
        .retail-ui-scope .bg-red-500 *,
        .retail-ui-scope .bg-red-600 *,
        .retail-ui-scope .bg-rose-500 *,
        .retail-ui-scope .bg-rose-600 * {
          color: #ffffff !important;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
        }

        /* إبراز الأيقونات داخل البطائق الملونة لتكون ساطعة وواضحة (ص3) */
        .retail-ui-scope [class*="from-blue-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-indigo-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-emerald-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-green-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-teal-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-amber-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-orange-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-yellow-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-red-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-rose-"]:not([class*="/"]) svg,
        .retail-ui-scope [class*="from-purple-"]:not([class*="/"]) svg {
          color: #ffffff !important;
          stroke: #ffffff !important;
          filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.28));
        }

        /* تجميل مربع الأيقونة الزجاجي داخل البطاقات الملونة */
        .retail-ui-scope [class*="bg-gradient-"] [class*="bg-white/"] {
          background-color: rgba(255, 255, 255, 0.26) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.55) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16) !important;
          backdrop-filter: blur(6px);
        }

        /* 3. إزالة البهتان عن أزرار السلة Panier والأزرار المعطلة لتبدو حية وواضحة دائماً (ص2) */
        .retail-ui-scope button:disabled,
        .retail-ui-scope button[disabled],
        .retail-ui-scope .opacity-50,
        .retail-ui-scope .opacity-40 {
          opacity: 0.94 !important;
          filter: saturate(1.2) contrast(1.08) !important;
        }

        /* إبراز الأيقونات الرمادية الباهتة في الجداول والسلة الفارغة (ص2 وص3) */
        .retail-ui-scope .text-gray-300,
        .retail-ui-scope .text-gray-400,
        .retail-ui-scope .text-slate-300,
        .retail-ui-scope .text-slate-400 {
          color: #475569 !important;
          opacity: 0.95 !important;
        }

        /* تحويل صفحات التاجر تلقائياً عند تفعيل الوضع الداكن */
        .retail-dark-scope .bg-white,
        .retail-dark-scope .bg-gray-50,
        .retail-dark-scope .bg-slate-50 {
          background-color: #0f172a !important;
          border-color: #1e293b !important;
          color: #f1f5f9 !important;
        }
        .retail-dark-scope .bg-gray-100,
        .retail-dark-scope .bg-slate-100 {
          background-color: #1e293b !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }
        .retail-dark-scope .text-gray-800,
        .retail-dark-scope .text-gray-900,
        .retail-dark-scope .text-slate-800,
        .retail-dark-scope .text-slate-900 {
          color: #f8fafc !important;
        }
        .retail-dark-scope .text-gray-600,
        .retail-dark-scope .text-gray-500,
        .retail-dark-scope .text-slate-500,
        .retail-dark-scope .text-slate-600,
        .retail-dark-scope .text-gray-400,
        .retail-dark-scope .text-slate-400 {
          color: #cbd5e1 !important;
        }
        .retail-dark-scope input,
        .retail-dark-scope select,
        .retail-dark-scope textarea {
          background-color: #1e293b !important;
          border-color: #334155 !important;
          color: #ffffff !important;
        }
      `}</style>
      <SystemNotificationBanner />
      <RetailTrialBanner />
      <div className={`flex h-screen w-full max-w-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-gradient-to-br from-[#f8fafc] via-[#f2fbf7] to-[#f1f5f9] text-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div ref={sidebarWrapperRef} className={`shrink-0 h-full transition-all duration-300 ${isSidebarOpen ? (isRtl ? 'w-[270px] border-l border-slate-800' : 'w-[270px] border-r border-slate-800') : 'w-0 overflow-hidden border-none'} bg-[#0f172a] z-20`}>
          <div className="w-[270px] h-full"><Sidebar /></div>
        </div>
        
        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full max-w-full relative">
          <header className={`h-20 border-b flex items-center justify-between px-4 md:px-6 shrink-0 w-full z-20 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-xl' : 'bg-white/90 border-slate-200/80 backdrop-blur-md shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-50 hover:bg-blue-50 border-gray-200 text-gray-700 shadow-sm'}`}>
                {isSidebarOpen ? <X size={20} className="text-red-500" /> : <Menu size={20} className="text-blue-500" />}
              </button>
              <h2 className={`text-lg md:text-xl font-black truncate text-start ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {language === 'fr' ? 'Bienvenue, ' : language === 'en' ? 'Welcome, ' : 'مرحباً بك، '}
                <span className="text-blue-500 truncate">{storeName}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
              <Link to="/affiliates" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-3 py-2 md:px-4 rounded-full font-black flex items-center gap-2 shadow-md transition-all whitespace-nowrap text-xs md:text-sm">
                <Trophy size={15} /> <span className="hidden sm:inline">{language === 'fr' ? 'Partenaires' : language === 'en' ? 'Affiliates' : 'شركاء النجاح'}</span>
              </Link>

              <GlobalSpaceSwitcher language={language} dark={isDarkMode} currentSpace="retail" />

              <button
                onClick={handleLanguageChange}
                className={`px-3 py-2 rounded-full font-black text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                }`}
              >
                <Globe size={15} />
                <span className="uppercase">{language}</span>
              </button>

              {/* 🌙☀️ زر الوضع الداكن / الفاتح للتاجر */}
              <button
                onClick={toggleThemeMode}
                className={`px-3.5 py-2 rounded-full font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                    : 'bg-emerald-950 hover:bg-slate-900 text-white'
                }`}
              >
                {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                <span className="hidden md:inline">{isDarkMode ? lightLabel : darkLabel}</span>
              </button>

              <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-full font-black flex items-center gap-2 shadow-md transition-all whitespace-nowrap text-xs">
                 <Package size={16} /> <span className="hidden xl:inline">{language === 'fr' ? 'Gérer le Magasin' : language === 'en' ? 'Manage Store' : 'إدارة سلع المتجر'}</span>
              </Link>

              <button onClick={handleLogout} className={`flex items-center justify-center w-10 h-10 md:w-auto md:px-3.5 md:py-2 rounded-full text-xs font-black transition-all cursor-pointer border ${isDarkMode ? 'text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white border-red-500/20' : 'text-red-600 bg-red-50/90 hover:bg-red-500 hover:text-white border-red-200'}`}>
                <LogOut size={16} /> <span className={`hidden sm:inline ${isRtl ? 'mr-1.5' : 'ml-1.5'}`}>{logoutLabel}</span>
              </button>
            </div>
          </header>
          <div ref={retailContentRef} className={`retail-ui-scope flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 w-full max-w-full ${isDarkMode ? 'retail-dark-scope wholesale-dark-scope' : 'wholesale-light-scope'}`}>
            <div className={`retail-main-wrapper rounded-3xl shadow-xl p-4 md:p-6 border min-h-[400px] w-full max-w-full overflow-x-auto transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800'}`}>
              {children}
            </div>
          </div>
          <GlobalVoiceCopilot />
        </main>
      </div>
    </div>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [userPrimaryRole, setUserPrimaryRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { language } = useSettingsStore();
  const { supplier, fetchSupplierProfile } = useSupplierStore();

  const isStorePage = window.location.pathname.startsWith('/store') || window.location.search.includes('vendor');

  useEffect(() => {
    let mounted = true;

    const detectPrimaryRole = async (user) => {
      if (!user) return;
      try {
        syncUserTrialDate(user);
        const metaRole = user.user_metadata?.role || user.user_metadata?.account_type;
        if (metaRole === 'admin' || metaRole === 'architect' || metaRole === 'provider' || metaRole === 'contractor') {
          if (mounted) setUserPrimaryRole(metaRole);
          return;
        }
        const { data: arch } = await supabase.from('architects').select('id').eq('user_id', user.id).limit(1);
        if (arch && arch.length > 0 && mounted) { setUserPrimaryRole('architect'); return; }

        const { data: prov } = await supabase.from('providers').select('id').eq('user_id', user.id).limit(1);
        if (prov && prov.length > 0 && mounted) { setUserPrimaryRole('provider'); return; }

        if (mounted) setUserPrimaryRole('supplier');
      } catch (err) {
        console.error('Role detection error:', err);
        if (mounted) setUserPrimaryRole('supplier');
      }
    };

    const forgeSession = async () => {
      try {
        const hash = window.location.hash;
        
        if (hash && hash.includes('access_token') && hash.includes('refresh_token')) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            }).catch(() => {});

            const { data: userData } = await supabase.auth.getUser(accessToken);
            
            if (userData?.user && mounted) {
              setSession({ user: userData.user, access_token: accessToken });
              fetchSupplierProfile(userData.user.id);
              await detectPrimaryRole(userData.user);
              window.history.replaceState(null, '', window.location.pathname + window.location.search); 
              setLoading(false);
              return; 
            }
          }
        }

        const { data: { session: curSession } } = await supabase.auth.getSession();
        if (mounted) {
          if (curSession?.user) {
            setSession(curSession);
            fetchSupplierProfile(curSession.user.id);
            await detectPrimaryRole(curSession.user);
          } else {
            setSession(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    forgeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUserPrimaryRole(null);
        } else if (currentSession?.user) {
          setSession(currentSession);
          detectPrimaryRole(currentSession.user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchSupplierProfile]);
  
  if (isStorePage) {
    return (
      <BrowserRouter>
        <ReferralTracker />
        <Routes>
          <Route path="/store" element={<Marketplace />} />
          <Route path="*" element={<Marketplace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <ReferralTracker />
      <AppContent
        session={session}
        loading={loading}
        userPrimaryRole={userPrimaryRole}
        supplier={supplier}
        language={language}
        isStorePage={isStorePage}
      />
    </BrowserRouter>
  );
}

function AppContent({ session, loading, userPrimaryRole, supplier, language, isStorePage }) {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const previewMode = searchParams.get('preview');

  if (previewMode === 'retail' || previewMode === 'wholesale') {
    sessionStorage.setItem('souqbtp_preview_mode', previewMode);
  } else if (pathname.startsWith('/v2')) {
    sessionStorage.removeItem('souqbtp_preview_mode');
  }
  const activePreview = pathname.startsWith('/v2')
    ? null
    : (previewMode || sessionStorage.getItem('souqbtp_preview_mode'));

  const isV2Path = pathname.startsWith('/v2');
  const isLandingPage =
    pathname.startsWith('/empire') ||
    pathname.startsWith('/pro') ||
    pathname.startsWith('/contractor') ||
    pathname.startsWith('/devis-gratuit') ||
    pathname.startsWith('/client-portal');
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/auth');

  if (loading) {
    return <div className="h-screen w-full bg-[#0f172a]"></div>;
  }

  if (!session && !isV2Path && !isLandingPage && !isAuthPage && !isStorePage) {
    return <Navigate to="/v2/auth" replace />;
  }

  const isWholesaler = activePreview === 'wholesale'
    ? true
    : activePreview === 'retail'
    ? false
    : (session?.user?.user_metadata?.supplier_type === 'wholesale' || supplier?.supplier_type === 'wholesale');

  const storeName =
    session?.user?.user_metadata?.company_name ||
    session?.user?.user_metadata?.full_name ||
    supplier?.store_name ||
    'SasBTP';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : 'S';

  return (
    <Routes>
      <Route path="/empire" element={<EmpireLanding />} />
      <Route path="/pro" element={<RetailLanding />} />
      <Route path="/contractor" element={<ContractorLanding />} />
      <Route path="/devis-gratuit" element={<CostCalculatorLanding />} />
      <Route path="/client-portal" element={<ClientPortal />} />
      <Route path="/affiliate-dashboard" element={<AffiliateDashboard />} />

      {/* مسارات فضاء V2 (الإدارة، المقاول، المهندس، الحرفي) */}
      <Route path="/v2/*" element={<V2Router session={session} supplier={supplier} />} />

      {!activePreview && userPrimaryRole === 'admin' && (
        <Route path="/" element={<Navigate to="/v2/admin-dashboard" replace />} />
      )}
      {!activePreview && userPrimaryRole === 'architect' && (
        <Route path="/" element={<Navigate to="/v2/architect-dashboard" replace />} />
      )}
      {!activePreview && userPrimaryRole === 'provider' && (
        <Route path="/" element={<Navigate to="/v2/provider-dashboard" replace />} />
      )}
      {!activePreview && userPrimaryRole === 'contractor' && (
        <Route path="/" element={<Navigate to="/v2/contractor-dashboard" replace />} />
      )}

      <Route path="/*" element={
        isWholesaler ? (
          <WholesalerDashboard supplier={supplier} storeName={storeName} storeInitial={storeInitial}>
            <Routes>
              <Route path="/" element={<SupplierOverview />} />
              <Route path="/affiliates" element={<AffiliateDashboard />} />
              <Route path="/stock" element={<SupplierStock isWholesaler={true} />} />
              <Route path="/invoices" element={<SupplierInvoices />} />
              <Route path="/raw-suppliers" element={<RawMaterialSuppliers />} />
              <Route path="/raw-purchases" element={<RawMaterialPurchases />} />
              <Route path="/pos-b2b" element={<SupplierPOS />} />
              <Route path="/orders" element={<SupplierOrders />} />
              <Route path="/settings" element={<SupplierSettings />} />
              <Route path="/subscription" element={<SupplierSubscription />} />

              <Route path="/clients" element={<PremiumGuard><Clients isWholesaler={true} /></PremiumGuard>} />
              <Route path="/contracts" element={<PremiumGuard><Contracts /></PremiumGuard>} />
              <Route path="/fleet-b2b" element={<PremiumGuard><Fleet /></PremiumGuard>} />
              <Route path="/hr" element={<PremiumGuard><SupplierHR /></PremiumGuard>} />
              <Route path="/expenses" element={<PremiumGuard><SupplierExpenses /></PremiumGuard>} />
              <Route path="/accounting" element={<PremiumGuard><SupplierAccounting /></PremiumGuard>} />
              <Route path="/fiscal" element={<PremiumGuard><Fiscal isWholesaler={true} /></PremiumGuard>} />
              <Route path="/team" element={<PremiumGuard><SupplierTeam /></PremiumGuard>} />
              <Route path="/caisses" element={<PremiumGuard><Caisses isWholesaler={true} /></PremiumGuard>} />
              <Route path="/production" element={<PremiumGuard><SupplierProduction /></PremiumGuard>} />
              <Route path="/audit" element={<PremiumGuard><AIAudit /></PremiumGuard>} />
              <Route path="/analytics" element={<PremiumGuard><AnalyticsB2B /></PremiumGuard>} />
              <Route path="/ai-advisor" element={<PremiumGuard><SmartAdvisor /></PremiumGuard>} />
              <Route path="/tender-radar" element={<PremiumGuard><TenderRadar /></PremiumGuard>} />
              <Route path="/logistics-bourse" element={<PremiumGuard><LogisticsBourse /></PremiumGuard>} />
              <Route path="/fleet-market" element={<PremiumGuard><FleetManagement /></PremiumGuard>} /> 
              <Route path="/market-orders" element={<PremiumGuard><MarketplaceOrders /></PremiumGuard>} />
              <Route path="/messages" element={<PremiumGuard><UnifiedMessages /></PremiumGuard>} />
              <Route path="/marketplace" element={<PremiumGuard><BTPHub /></PremiumGuard>} />
            </Routes>
          </WholesalerDashboard>
        ) : (
          <RetailerLayout storeName={storeName} storeInitial={storeInitial} language={language}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/affiliates" element={<AffiliateDashboard />} />
              <Route path="/products" element={<Products />} />                     
              <Route path="/orders" element={<Orders />} />
              <Route path="/wallet" element={<RetailerWallet />} />
              <Route path="/settings" element={<RetailerSettings />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/suppliers" element={<ExternalSuppliers />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/subscription" element={<RetailerSubscription />} />
              <Route path="/messages" element={<UnifiedMessages />} />
              <Route path="/marketplace" element={<BTPHub />} />
              {/* 🛡️ أقسام باقات Premium Shop & Pro Retailer (تعمل مجاناً طوال الـ 14 يوماً التجريبية) */}
              <Route path="/clients" element={<PremiumGuard><Clients /></PremiumGuard>} />
              <Route path="/expenses" element={<PremiumGuard><Expenses /></PremiumGuard>} />
              <Route path="/hr" element={<PremiumGuard><HR /></PremiumGuard>} />
              <Route path="/fiscal" element={<PremiumGuard><Fiscal /></PremiumGuard>} />
              <Route path="/caisses" element={<PremiumGuard><Caisses /></PremiumGuard>} />
              <Route path="/devis" element={<PremiumGuard><Devis /></PremiumGuard>} />
              <Route path="/bc" element={<PremiumGuard><BC /></PremiumGuard>} />
              <Route path="/bl" element={<PremiumGuard><BL /></PremiumGuard>} />
              <Route path="/avoir" element={<PremiumGuard><Avoir /></PremiumGuard>} />
              <Route path="/fiches-expedition" element={<PremiumGuard><Expeditions /></PremiumGuard>} />
              <Route path="/factures-achat" element={<PremiumGuard><FacturesAchat /></PremiumGuard>} />
              <Route path="/accounting" element={<PremiumGuard><Accounting /></PremiumGuard>} />
            </Routes>
          </RetailerLayout>
        )
      } />
    </Routes>
  );
}

export default App;