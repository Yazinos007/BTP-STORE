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
import expenses from './Expenses';

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
      <Route element={<V2Layout accountType={accountType} storeName={storeName} storeInitial={storeInitial} />}>
        
        {/* الرئيسية */}
        <Route path="contractor-dashboard" element={<ContractorDashboard />} />
        
        {/* القيادة والميدان */}
        <Route path="project-path" element={<ProjectPath />} />
        <Route path="cost-calculator" element={<CostCalculator />} />
        <Route path="field-camera" element={<ContractorCamera />} />
        
        {/* التواصل والمشتريات */}
        <Route path="messages" element={<ChatRoom />} />
        <Route path="hr" element={<ContractorHR />} /> 
        
        {/* 🚀 السوق المتعدد الأطراف */}
        <Route path="marketplace" element={<ContractorMarketplace />} />  {/* 🛒 واجهة التسوق للمقاول */}
        <Route path="store-manager" element={<VendorStoreManager />} /> {/* 📦 إدارة المتجر للتاجر */}
        <Route path="tenders" element={<TenderRadar />} />
        
        {/* 🚀 المالية والمحاسبة */}
        <Route path="accounts" element={<AccountsManager />} /> {/* 🚀 تم التفعيل */}
        
        {/* 🚀 مسارات جديدة تمت إضافتها */}
        <Route path="b2b-invoices" element={<B2bInvoices />} />
        <Route path="freight-exchange" element={<FreightExchange />} />
        <Route path="live-orders" element={<LiveOrders />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="taxes" element={<UnderConstruction title="النظام الجبائي (TVA)" icon="⚖️" />} />
        <Route path="accounting" element={<UnderConstruction title="المحاسبة العامة والـ CPC" icon="📊" />} />
        
        {/* الإعدادات */}
        <Route path="profile" element={<UnderConstruction title="إعدادات الملف الشخصي" icon="⚙️" />} />

        {/* 🚨 التوجيه التلقائي */}
        <Route path="*" element={<Navigate to="contractor-dashboard" replace />} />
      </Route>
    </Routes>
  );
}