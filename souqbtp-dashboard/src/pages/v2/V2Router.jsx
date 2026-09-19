import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';
import ContractorDashboard from './ContractorDashboard';
import CostCalculator from './CostCalculator'; 
import ProjectPath from './ProjectPath'; 
import ContractorHR from './ContractorHR'; 
import ContractorMarketplace from './ContractorMarketplace'; 
import VendorStoreManager from './VendorStoreManager';       
import ChatRoom from './ChatRoom';
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

// استيراد صفحات الهبوط (المغناطيس)
import EmpireLanding from './landing-pages/EmpireLanding';
import RetailLanding from './landing-pages/RetailLanding';
import ContractorLanding from './landing-pages/ContractorLanding'; 

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
  const accountType = session?.user?.user_metadata?.account_type || supplier?.supplier_type || 'contractor';
  const storeName = session?.user?.user_metadata?.company_name || session?.user?.user_metadata?.full_name || 'مستخدم V2';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : '?';
  
  return (
    <Routes>
      
      {/* 🚀 1. مسارات صفحات الهبوط (Magnet Pages) - خارج الـ Layout لتعمل بكامل الشاشة */}
      <Route path="empire" element={<EmpireLanding />} />
      <Route path="pro" element={<RetailLanding />} />
      <Route path="contractor" element={<ContractorLanding />} />

      {/* 🛡️ 2. مسارات النظام الداخلي (Dashboard) - داخل الـ V2Layout (يحتوي على Sidebar) */}
      <Route element={<V2Layout accountType={accountType} storeName={storeName} storeInitial={storeInitial} />}>
        
        {/* الرئيسية */}
        <Route path="contractor-dashboard" element={<ContractorDashboard />} />
        
        {/* القيادة والميدان */}
        <Route path="project-path" element={<ProjectPath />} />
        <Route path="cost-calculator" element={<CostCalculator />} />
        <Route path="field-camera" element={<ContractorCamera />} />
        
        {/* التواصل والمشتريات */}
        <Route path="messages" element={<ChatRoom />} />
        <Route path="marketplace" element={<ContractorMarketplace />} />
        <Route path="store-manager" element={<VendorStoreManager />} /> 
        <Route path="tenders" element={<TenderRadar />} />
        <Route path="freight-exchange" element={<FreightExchange />} />
        <Route path="live-orders" element={<LiveOrders />} />
            
        {/* 🚀 المالية والمحاسبة */}
        <Route path="hr" element={<ContractorHR />} /> 
        <Route path="b2b-invoices" element={<B2bInvoices />} />
        <Route path="accounts" element={<AccountsManager />} /> 
        <Route path="expenses" element={<ContractorExpenses />} />
        <Route path="taxes" element={<Taxes />} />
        <Route path="accounting" element={<ContractorAccounting />} />
        <Route path="audit" element={<AIAudit />} />
        
        {/* الإعدادات */}
        <Route path="profile" element={<ContractorProfile />} />
        <Route path="subscription" element={<ContractorSubscription />} />

        {/* 🚨 التوجيه التلقائي */}
        <Route path="*" element={<Navigate to="contractor-dashboard" replace />} />
      </Route>
      
    </Routes>
  );
}