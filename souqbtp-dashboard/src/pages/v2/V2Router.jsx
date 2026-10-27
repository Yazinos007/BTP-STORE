import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useOutletContext, useLocation } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';
import { supabase } from '../../lib/supabase';

// === استيرادات المقاول العام (Contractor) ===
import ContractorDashboard from './ContractorDashboard';
import CostCalculator from './CostCalculator'; 
import ProjectPath from './ProjectPath'; 
import ContractorHR from './ContractorHR'; 
import BTPHub from './BTPHub';
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
import ProviderSubscription from './provider/ProviderSubscription';

import SupplierAuth from './auth/SupplierAuth';

// === الاستيرادات المشتركة والشركاء (Shared & Affiliates) ===
import UnifiedMessages from './shared/UnifiedMessages';
import LiveRoom from './shared/LiveRoom';
import AuthGateway from './auth/AuthGateway';
import AffiliateDashboard from './AffiliateDashboard';

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
  const location = useLocation();

  // 🧠 تحديد الرتبة مباشرة من المسار الحالي أولاً لمنع انقلاب القائمة الجانبية بعد التحميل
  const getRoleFromPath = (pathname) => {
    if (pathname.includes('/architect')) return 'architect';
    if (pathname.includes('/provider-')) return 'provider';
    if (pathname.includes('/supplier')) return 'supplier';
    return 'contractor';
  };

  const [resolvedRole, setResolvedRole] = useState(() => getRoleFromPath(location.pathname));
  const [resolvedName, setResolvedName] = useState(
    session?.user?.user_metadata?.company_name ||
    session?.user?.user_metadata?.full_name ||
    supplier?.store_name ||
    'SasBTP'
  );

  // تحديث الرتبة فوراً عند تغير الرابط
  useEffect(() => {
    setResolvedRole(getRoleFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    const verifyUserIdentity = async () => {
      try {
        const currentUser = session?.user || (await supabase.auth.getUser()).data?.user;
        if (!currentUser || !isMounted) return;

        const metaName =
          currentUser.user_metadata?.company_name ||
          currentUser.user_metadata?.full_name ||
          supplier?.store_name ||
          'SasBTP';

        setResolvedName(metaName);
      } catch (err) {
        console.error('Identity resolution error:', err);
      }
    };

    verifyUserIdentity();

    return () => {
      isMounted = false;
    };
  }, [session, supplier]);

  const storeInitial = resolvedName ? resolvedName.charAt(0).toUpperCase() : 'S';

  const getDefaultDashboard = () => {
    const metaRole = session?.user?.user_metadata?.role || session?.user?.user_metadata?.account_type;
    if (metaRole === 'architect') return 'architect-dashboard';
    if (metaRole === 'provider') return 'provider-dashboard';
    return 'contractor-dashboard';
  };

  return (
    <Routes>
      {/* 🚀 فخ التوجيه: خارج الـ Layout تماماً */}
      <Route path="empire" element={<Navigate to="/empire" replace />} />
      <Route path="pro" element={<Navigate to="/pro" replace />} />
      <Route path="contractor" element={<Navigate to="/contractor" replace />} />

      {/* 🚀 الغرفة الحية الموحدة */}
      <Route path="live-room/:cid" element={<LiveRoom />} />
      <Route path="architect/live-room/:cid" element={<LiveRoom />} />

      {/* 🔐 صفحات التسجيل والدخول المستقلة (خارج الـ Layout تماماً) */}
      <Route path="auth" element={<AuthGateway />} />
      <Route path="architect-register" element={<ArchitectRegister />} />
      <Route path="provider-auth" element={<ProviderAuth />} />
      <Route path="supplier-register" element={<SupplierAuth />} />

      {/* 🛡️ مسارات النظام الداخلي (Dashboard) - داخل الـ V2Layout */}
      <Route element={<V2Layout accountType={resolvedRole} storeName={resolvedName} storeInitial={storeInitial} />}>

        {/* 🏆 المسارات الموحدة لبرنامج شركاء النجاح */}
        <Route path="affiliates" element={<AffiliateDashboard />} />
        <Route path="architect-affiliates" element={<AffiliateDashboard />} />
        <Route path="provider-affiliates" element={<AffiliateDashboard />} />
        <Route path="supplier-affiliates" element={<AffiliateDashboard />} />

        {/* 💬 المسارات الموحدة للرسائل والماركت بليس */}
        <Route path="messages" element={<UnifiedMessages />} />
        <Route path="architect-messages" element={<UnifiedMessages />} />
        <Route path="provider-messages" element={<UnifiedMessages />} />
        
        <Route path="marketplace" element={<BTPHub />} />
        <Route path="architect-marketplace" element={<BTPHub />} />
        <Route path="provider-marketplace" element={<BTPHub />} />
        
        {/* === 🏗️ سكاشن المقاول العام (Contractor) === */}
        <Route path="contractor-dashboard" element={<ContractorDashboard />} />
        <Route path="project-path" element={<ProjectPath />} />
        <Route path="cost-calculator" element={<CostCalculator />} />
        <Route path="field-camera" element={<ContractorCamera />} />
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
        <Route path="provider-subscription" element={<ProviderSubscription />} />
        <Route path="provider-dashboard" element={<ProviderDashboard />} />
        <Route path="provider-profile" element={<ProviderProfile />} />
        <Route path="provider-portfolio" element={<ProviderPortfolio />} />

        {/* 🚦 الموزع الذكي عند الدخول إلى /v2 مباشرة */}
        <Route index element={<Navigate to={getDefaultDashboard()} replace />} />
        <Route path="*" element={<Navigate to={getDefaultDashboard()} replace />} />
      </Route>
      
      <Route path="foreman-dashboard" element={<ForemanDashboard />} />
    </Routes>
  );
}