import { Routes, Route, Navigate } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';
import ContractorDashboard from './ContractorDashboard';

// صفحة قيد الإنشاء لباقي الأقسام
const UnderConstruction = ({ title, icon }) => (
  <div className="flex flex-col items-center justify-center h-[75vh] text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-700 m-4">
    <div className="text-6xl mb-6 drop-shadow-lg">{icon || '🚧'}</div>
    <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-3">{title}</h1>
    <p className="text-slate-500 dark:text-slate-400 font-bold">سيتم برمجة هذا القسم قريباً في بيئة V2...</p>
  </div>
);

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
        <Route path="project-path" element={<UnderConstruction title="مسار الورش التفصيلي" icon="🗺️" />} />
        <Route path="cost-calculator" element={<UnderConstruction title="الحاسبة الذكية لتكاليف الورش" icon="🧮" />} />
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