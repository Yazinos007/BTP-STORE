import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';
import ContractorDashboard from './ContractorDashboard';
import CostCalculator from './CostCalculator'; // 🚀 استدعاء الحاسبة
import ProjectPath from './ProjectPath'; // 🚀 استدعاء مسار الورش

// صفحة قيد الإنشاء ذكية تتجاوب مع لون الغلاف
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
        
        {/* 🚀 القيادة والميدان (تم ربط الملفات هنا) */}
        <Route path="project-path" element={<ProjectPath />} />
        <Route path="cost-calculator" element={<CostCalculator />} />
        <Route path="site-reports" element={<UnderConstruction title="كاميرا الميدان والتقارير" icon="📸" />} />
        
        {/* التواصل والمشتريات */}
        <Route path="messages" element={<UnderConstruction title="صندوق الرسائل الشامل" icon="💬" />} />
        <Route path="hr" element={<UnderConstruction title="إدارة الموارد البشرية" icon="👥" />} />
        <Route path="marketplace" element={<UnderConstruction title="سوق BTP للمواد الأولية" icon="🛒" />} />
        <Route path="tenders" element={<UnderConstruction title="رادار المناقصات (Appels d'offres)" icon="📡" />} />
        
        {/* المالية والمحاسبة */}
        <Route path="accounts" element={<UnderConstruction title="الصناديق والحسابات" icon="🏦" />} />
        <Route path="expenses" element={<UnderConstruction title="المصاريف والرسوم" icon="🧾" />} />
        <Route path="taxes" element={<UnderConstruction title="النظام الجبائي (TVA)" icon="⚖️" />} />
        <Route path="accounting" element={<UnderConstruction title="المحاسبة العامة والـ CPC" icon="📊" />} />
        
        {/* الإعدادات */}
        <Route path="profile" element={<UnderConstruction title="إعدادات الملف الشخصي" icon="⚙️" />} />

        {/* توجيه المجهول */}
        <Route path="*" element={<Navigate to="contractor-dashboard" replace />} />
      </Route>
    </Routes>
  );
}