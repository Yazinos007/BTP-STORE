import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';
import { supabase } from '../../lib/supabase';

// === استيرادات المقاول العام (Contractor) ===
import ContractorDashboard from './ContractorDashboard';
import CostCalculator from './CostCalculator'; 
import ProjectPath from './ProjectPath'; 
import ContractorHR from './ContractorHR'; 
import BTPHub from "./BTPHub";
import VendorStoreManager from './VendorStoreManager';       
import ContractorCamera from './ContractorCamera';
import TenderRadar from './TenderRadar';
import AccountsManager from './AccountsManager'; 
import FreightExchange from './FreightExchange';
import B2bInvoices from './B2bInvoices';
import LiveOrders from './LiveOrders';
import ContractorExpenses from './ContractorExpenses';
import Taxes from './Taxes';
import ContractorAccounting from './ContractorAccounting';
import AIAudit from './AIAudit';
import ContractorProfile from './ContractorProfile';
import ContractorSubscription from './ContractorSubscription';
import ForemanDashboard from './ForemanDashboard';

// === استيرادات المهندس المعماري (Architect) ===
import ArchitectSubscription from './architect/ArchitectSubscription';
import ArchitectDashboard from './architect/ArchitectDashboard';
import ArchitectProfile from './architect/ArchitectProfile';
import ArchitectProjects from './architect/ArchitectProjects';
import ArchitectArchive from './architect/ArchitectArchive';
import ArchitectRegister from './architect/ArchitectRegister';

// === استيرادات الحرفي والمقاول الصغير (Provider) ===
import ProviderAuth from './provider/ProviderAuth';
import ProviderDashboard from './provider/ProviderDashboard';
import ProviderProfile from './provider/ProviderProfile';
import ProviderPortfolio from './provider/ProviderPortfolio';

// === الاستيرادات المشتركة (Shared) ===
import UnifiedMessages from './shared/UnifiedMessages';
import LiveRoom from './shared/LiveRoom';
import AuthGateway from './auth/AuthGateway';

// === استيراد صفحات الهبوط ===
import EmpireLanding from '../../landing-pages/EmpireLanding';
import RetailLanding from '../../landing-pages/RetailLanding';
import ContractorLanding from '../../landing-pages/ContractorLanding';

// صفحة قيد الإنشاء ذكية
const UnderConstruction = ({ title, icon }) => {
  const { isDarkMode } = useOutletContext(); 
  return (
    <div className={`flex flex-col items-center justify-center h-[75vh] text-center backdrop-blur-md rounded-3xl border-2 m-4 shadow-xl transition-colors duration-700 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-white'}`}>
      <div className="text-7xl mb-6 drop-shadow-xl hover:scale-110 transition-transform cursor-pointer">{icon || '🚧'}</div>
      <h1 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h1>
      <p className={`font-bold text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>سيتم برمجة هذا القسم قريباً في بيئة V2...</p>
    </div>
  );
};

export default function V2Router({ session, supplier }) {
  // 🧠 حالة الهوية الذكية لمنع تداخل الحسابات
  const [resolvedRole, setResolvedRole] = useState(
    session?.user?.user_metadata?.role ||
    session?.user?.user_metadata?.account_type ||
    supplier?.supplier_type ||
    'contractor'
  );
  const [resolvedName, setResolvedName] = useState(
    session?.user?.user_metadata?.company_name ||
    session?.user?.user_metadata?.full_name ||
    'مستخدم V2'
  );
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyUserIdentity = async () => {
      try {
        const currentUser = session?.user || (await supabase.auth.getUser()).data?.user;
        if (!currentUser) {
          if (isMounted) setIsCheckingRole(false);
          return;
        }

        const metaRole = currentUser.user_metadata?.role || currentUser.user_metadata?.account_type;
        const metaName = currentUser.user_metadata?.company_name || currentUser.user_metadata?.full_name;

        // 1. فحص جدول المهندسين المعماريين
        const { data: archData } = await supabase
          .from('architects')
          .select('id, full_name, agency_name')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (archData && (metaRole === 'architect' || !metaRole || window.location.pathname.includes('architect'))) {
          if (isMounted) {
            setResolvedRole('architect');
            setResolvedName(archData.agency_name || archData.full_name || metaName || 'المكتب الهندسي');
            setIsCheckingRole(false);
          }
          return;
        }

        // 2. فحص جدول الحرفيين (Providers)
        const { data: provData } = await supabase
          .from('providers')
          .select('id, full_name, account_type')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (provData && (metaRole === 'provider' || provData.account_type === 'marketplace' || window.location.pathname.includes('provider'))) {
          if (isMounted) {
            setResolvedRole('provider');
            setResolvedName(provData.full_name || metaName || 'حرفي معتمد');
            setIsCheckingRole(false);
          }
          return;
        }

        // 3. في حال كان مهندساً في القاعدة حتى بدون تلميح في الرابط
        if (archData) {
          if (isMounted) {
            setResolvedRole('architect');
            setResolvedName(archData.agency_name || archData.full_name || metaName || 'المكتب الهندسي');
            setIsCheckingRole(false);
          }
          return;
        }

        // 4. الافتراضي: مقاول عام أو حسب الميتا داتا
        if (isMounted) {
          setResolvedRole(metaRole || supplier?.supplier_type || 'contractor');
          setResolvedName(metaName || 'مستخدم V2');
          setIsCheckingRole(false);
        }
      } catch (err) {
        console.error('Role resolution error:', err);
        if (isMounted) setIsCheckingRole(false);
      }
    };

    verifyUserIdentity();

    return () => {
      isMounted = false;
    };
  }, [session, supplier]);

  const storeInitial = resolvedName ? resolvedName.charAt(0).toUpperCase() : '?';

  // تحديد لوحة التحكم الافتراضية بناءً على الرتبة الحقيقية
  const getDefaultDashboard = () => {
    if (resolvedRole === 'architect') return 'architect-dashboard';
    if (resolvedRole === 'provider') return 'provider-dashboard';
    return 'contractor-dashboard';
  };

  return (
    <Routes>
      {/* 🚀 فخ التوجيه: خارج الـ Layout تماماً لمنع رسم أي واجهة بالخطأ */}
      <Route path="empire" element={<Navigate to="/empire" replace />} />
      <Route path="pro" element={<Navigate to="/pro" replace />} />
      <Route path="contractor" element={<Navigate to="/contractor" replace />} />

      {/* 🚀 الغرفة الحية الموحدة (شاشة كاملة خارج الـ Layout للمهندس والحرفي والعميل) */}
      <Route path="live-room/:cid" element={<LiveRoom />} />
      <Route path="architect/live-room/:cid" element={<LiveRoom />} />

      {/* 🔐 صفحات التسجيل والدخول المستقلة (خارج الـ Layout) */}
      <Route path="architect-register" element={<ArchitectRegister />} />
      <Route path="provider-auth" element={<ProviderAuth />} />

      {/* 🛡️ مسارات النظام الداخلي (Dashboard) - داخل الـ V2Layout */}
      <Route element={<V2Layout accountType={resolvedRole} storeName={resolvedName} storeInitial={storeInitial} />}>

        {/* 💬 المسار الموحد للرسائل والرادار وغرف العمليات */}
        <Route path="messages" element={<UnifiedMessages />} />
        <Route path="architect-messages" element={<UnifiedMessages />} />
        <Route path="auth" element={<AuthGateway />} />
        
        {/* === 🏗️ سكاشن المقاول العام (Contractor) === */}
        <Route path="contractor-dashboard" element={<ContractorDashboard />} />
        <Route path="project-path" element={<ProjectPath />} />
        <Route path="cost-calculator" element={<CostCalculator />} />
        <Route path="field-camera" element={<ContractorCamera />} />
        <Route path="marketplace" element={<BTPHub />} />
        <Route path="store-manager" element={<VendorStoreManager />} /> 
        <Route path="tenders" element={<TenderRadar />} />
        <Route path="freight-exchange" element={<FreightExchange />} />
        <Route path="live-orders" element={<LiveOrders />} />
        <Route path="hr" element={<ContractorHR />} /> 
        <Route path="b2b-invoices" element={<B2bInvoices />} />
        <Route path="accounts" element={<AccountsManager />} /> 
        <Route path="expenses" element={<ContractorExpenses />} />
        <Route path="taxes" element={<Taxes />} />
        <Route path="accounting" element={<ContractorAccounting />} />
        <Route path="audit" element={<AIAudit />} />
        <Route path="profile" element={<ContractorProfile />} />
        <Route path="subscription" element={<ContractorSubscription />} />

        {/* === 🏛️ سكاشن المهندس المعماري (Architect) === */}
        <Route path="architect-subscription" element={<ArchitectSubscription />} />
        <Route path="architect/subscription" element={<ArchitectSubscription />} />
        <Route path="architect-dashboard" element={<ArchitectDashboard />} />
        <Route path="architect-profile" element={<ArchitectProfile />} />
        <Route path="architect-projects" element={<ArchitectProjects />} />
        <Route path="architect-archive" element={<ArchitectArchive />} />

        {/* === 🛠️ سكاشن الحرفي / المقاول الصغير (Provider) === */}
        <Route path="provider-dashboard" element={<ProviderDashboard />} />
        <Route path="provider-profile" element={<ProviderProfile />} />
        <Route path="provider-portfolio" element={<ProviderPortfolio />} />

        {/* 🚦 الموزع الذكي عند الدخول إلى /v2 مباشرة أو مسار غير معروف */}
        <Route index element={<Navigate to={getDefaultDashboard()} replace />} />
        <Route path="*" element={<Navigate to={getDefaultDashboard()} replace />} />
      </Route>
      
      <Route path="foreman-dashboard" element={<ForemanDashboard />} />
    </Routes>
  );
}