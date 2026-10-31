import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useOutletContext, useLocation } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';
import AdminLayout from '../../components/v2/AdminLayout';
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
import {
  ProviderProjectsPage,
  ProviderClientsPage,
  ProviderExpensesPage,
  ProviderReviewsPage
} from './provider/ProviderSmartHub';

import SupplierAuth from './auth/SupplierAuth';

// === استيرادات مدير النظام (Admin) ===
import AdminDashboard from './AdminDashboard';
import AdminServicesPanel from './AdminServicesPanel';
import AdminCostItems from './AdminCostItems';
import AdminCRM from './AdminCRM';
import AdminWorkshops from './AdminWorkshops';
import AdminAnalytics from './AdminAnalytics';
import AdminGlobalSettings from './AdminGlobalSettings';
import AdminAudit from './AdminAudit';
import AdminBilling from './AdminBilling';

// === الاستيرادات المشتركة والشركاء (Shared & Affiliates) ===
import UnifiedMessages from './shared/UnifiedMessages';
import LiveRoom from './shared/LiveRoom';
import AuthGateway from './auth/AuthGateway';
import AffiliateDashboard from './AffiliateDashboard';

export default function V2Router({ session, supplier }) {
  const location = useLocation();

  const getRoleFromPath = (pathname) => {
    if (pathname.includes('/architect')) {
      sessionStorage.setItem('sasbtp_v2_role', 'architect');
      return 'architect';
    }
    if (pathname.includes('/provider-')) {
      sessionStorage.setItem('sasbtp_v2_role', 'provider');
      return 'provider';
    }
    if (pathname.includes('/admin-')) {
      sessionStorage.setItem('sasbtp_v2_role', 'admin');
      return 'admin';
    }
    if (pathname.includes('/contractor-')) {
      sessionStorage.setItem('sasbtp_v2_role', 'contractor');
      return 'contractor';
    }
    return sessionStorage.getItem('sasbtp_v2_role') || 'contractor';
  };

  const [resolvedRole, setResolvedRole] = useState(() => getRoleFromPath(location.pathname));
  const [resolvedName, setResolvedName] = useState(
    session?.user?.user_metadata?.company_name ||
    session?.user?.user_metadata?.full_name ||
    supplier?.store_name ||
    'SasBTP'
  );

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
    return () => { isMounted = false; };
  }, [session, supplier]);

  const storeInitial = resolvedName ? resolvedName.charAt(0).toUpperCase() : 'S';

  const getDefaultDashboard = () => {
    const savedRole = sessionStorage.getItem('sasbtp_v2_role');
    if (savedRole === 'architect') return 'architect-dashboard';
    if (savedRole === 'provider') return 'provider-dashboard';
    if (savedRole === 'admin') return 'admin-dashboard';

    const metaRole = session?.user?.user_metadata?.role || session?.user?.user_metadata?.account_type;
    if (metaRole === 'admin') return 'admin-dashboard';
    if (metaRole === 'architect') return 'architect-dashboard';
    if (metaRole === 'provider') return 'provider-dashboard';
    return 'contractor-dashboard';
  };

  return (
    <Routes>
      {/* 🚀 فخ التوجيه */}
      <Route path="empire" element={<Navigate to="/empire" replace />} />
      <Route path="pro" element={<Navigate to="/pro" replace />} />
      <Route path="contractor" element={<Navigate to="/contractor" replace />} />

      {/* 🚀 الغرفة الحية */}
      <Route path="live-room/:cid" element={<LiveRoom />} />
      <Route path="architect/live-room/:cid" element={<LiveRoom />} />

      {/* 🔐 صفحات التسجيل والدخول */}
      <Route path="auth" element={<AuthGateway />} />
      <Route path="architect-register" element={<ArchitectRegister />} />
      <Route path="provider-auth" element={<ProviderAuth />} />
      <Route path="supplier-register" element={<SupplierAuth />} />

      {/* =======================================================
          🔥 مسارات الإدارة العليا (Admin)
      ======================================================= */}
      <Route element={<AdminLayout />}>
        <Route path="admin-dashboard" element={<AdminDashboard />} />
        <Route path="admin-billing" element={<AdminBilling />} />
        <Route path="admin-settings" element={<AdminDashboard />} /> 
        <Route path="admin-services" element={<AdminServicesPanel />} />
        <Route path="admin-cost-items" element={<AdminCostItems />} />
        <Route path="admin-crm" element={<AdminCRM />} />
        <Route path="admin-workshops" element={<AdminWorkshops />} />
        <Route path="admin-analytics" element={<AdminAnalytics />} />
        <Route path="admin-global-settings" element={<AdminGlobalSettings />} />
        <Route path="admin-audit" element={<AdminAudit />} />
      </Route>

      {/* =======================================================
          🛡️ مسارات النظام الداخلي للمستخدمين - داخل الـ V2Layout
      ======================================================= */}
      <Route element={<V2Layout accountType={resolvedRole} storeName={resolvedName} storeInitial={storeInitial} />}>

        {/* 🏆 المسارات الموحدة لبرنامج شركاء النجاح */}
        <Route path="affiliates" element={<AffiliateDashboard />} />
        <Route path="contractor-affiliates" element={<AffiliateDashboard />} />
        <Route path="architect-affiliates" element={<AffiliateDashboard />} />
        <Route path="provider-affiliates" element={<AffiliateDashboard />} />
        <Route path="supplier-affiliates" element={<AffiliateDashboard />} />

        {/* 💬 المسارات الموحدة للرسائل والماركت بليس لجميع الأدوار */}
        <Route path="messages" element={<UnifiedMessages />} />
        <Route path="contractor-messages" element={<UnifiedMessages />} />
        <Route path="architect-messages" element={<UnifiedMessages />} />
        <Route path="provider-messages" element={<UnifiedMessages />} />
        
        <Route path="marketplace" element={<BTPHub />} />
        <Route path="contractor-marketplace" element={<BTPHub />} />
        <Route path="architect-marketplace" element={<BTPHub />} />
        <Route path="provider-marketplace" element={<BTPHub />} />
        
        {/* === 🏗️ سكاشن المقاول العام (Contractor) === */}
        <Route path="contractor-dashboard" element={<ContractorDashboard />} />
        <Route path="project-path" element={<ProjectPath />} />
        <Route path="contractor-projects" element={<ProjectPath />} />
        <Route path="cost-calculator" element={<CostCalculator />} />
        <Route path="contractor-calculator" element={<CostCalculator />} />
        <Route path="field-camera" element={<ContractorCamera />} />
        <Route path="contractor-camera" element={<ContractorCamera />} />
        <Route path="store-manager" element={<VendorStoreManager />} /> 
        <Route path="tenders" element={<TenderRadar />} />
        <Route path="contractor-radar" element={<TenderRadar />} />
        <Route path="freight-exchange" element={<FreightExchange />} />
        <Route path="contractor-freight" element={<FreightExchange />} />
        <Route path="live-orders" element={<LiveOrders />} />
        <Route path="contractor-live-orders" element={<LiveOrders />} />
        <Route path="hr" element={<ContractorHR />} /> 
        <Route path="contractor-hr" element={<ContractorHR />} /> 
        <Route path="b2b-invoices" element={<B2bInvoices />} />
        <Route path="contractor-b2b-invoices" element={<B2bInvoices />} />
        <Route path="accounts" element={<AccountsManager />} /> 
        <Route path="contractor-caisses" element={<AccountsManager />} /> 
        <Route path="expenses" element={<ContractorExpenses />} />
        <Route path="contractor-expenses" element={<ContractorExpenses />} />
        <Route path="taxes" element={<Taxes />} />
        <Route path="contractor-fiscal" element={<Taxes />} />
        <Route path="accounting" element={<ContractorAccounting />} />
        <Route path="contractor-accounting" element={<ContractorAccounting />} />
        <Route path="audit" element={<AIAudit />} />
        <Route path="contractor-audit" element={<AIAudit />} />
        <Route path="profile" element={<ContractorProfile />} />
        <Route path="contractor-settings" element={<ContractorProfile />} />
        <Route path="subscription" element={<ContractorSubscription />} />

        {/* === 🏛️ سكاشن المهندس المعماري (Architect) === */}
        <Route path="architect-subscription" element={<ArchitectSubscription />} />
        <Route path="architect/subscription" element={<ArchitectSubscription />} />
        <Route path="architect-dashboard" element={<ArchitectDashboard />} />
        <Route path="architect-profile" element={<ArchitectProfile />} />
        <Route path="architect-settings" element={<ArchitectProfile />} />
        <Route path="architect-projects" element={<ArchitectProjects />} />
        <Route path="architect-archive" element={<ArchitectArchive />} />
        <Route path="architect-tenders" element={<TenderRadar />} />
        <Route path="architect-radar" element={<TenderRadar />} />
        <Route path="architect-hr" element={<ContractorHR />} />
        <Route path="architect-invoices" element={<B2bInvoices />} />
        <Route path="architect-accounts" element={<AccountsManager />} />
        <Route path="architect-caisses" element={<AccountsManager />} />
        <Route path="architect-expenses" element={<ContractorExpenses />} />
        <Route path="architect-taxes" element={<Taxes />} />
        <Route path="architect-fiscal" element={<Taxes />} />
        <Route path="architect-accounting" element={<ContractorAccounting />} />
        <Route path="architect-audit" element={<AIAudit />} />
        <Route path="architect-ruler" element={<CostCalculator />} />
        <Route path="architect-reports" element={<ContractorCamera />} />

        {/* === 🛠️ سكاشن الحرفي / المعلم (Provider - مربوطة بـ Supabase) === */}
        <Route path="provider-subscription" element={<ProviderSubscription />} />
        <Route path="provider-dashboard" element={<ProviderDashboard />} />
        <Route path="provider-profile" element={<ProviderProfile />} />
        <Route path="provider-settings" element={<ProviderProfile />} />
        <Route path="provider-portfolio" element={<ProviderPortfolio />} />
        <Route path="provider-radar" element={<TenderRadar />} />
        <Route path="provider-projects" element={<ProviderProjectsPage />} />
        <Route path="provider-calculator" element={<CostCalculator />} />
        <Route path="provider-clients" element={<ProviderClientsPage />} />
        <Route path="provider-expenses" element={<ProviderExpensesPage />} />
        <Route path="provider-materials" element={<BTPHub />} />
        <Route path="provider-reviews" element={<ProviderReviewsPage />} />

        {/* 🚦 الموزع الذكي */}
        <Route index element={<Navigate to={getDefaultDashboard()} replace />} />
        <Route path="*" element={<Navigate to={getDefaultDashboard()} replace />} />
      </Route>

      <Route path="foreman-dashboard" element={<ForemanDashboard />} />
    </Routes>
  );
}