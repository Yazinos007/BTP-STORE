import { Routes, Route, Navigate } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';
import ContractorDashboard from './ContractorDashboard';

// صفحة قيد الإنشاء لباقي الأقسام
const UnderConstruction = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center">
    <div className="text-6xl mb-4">🚧</div>
    <h1 className="text-2xl font-bold text-slate-700 mb-2">{title}</h1>
    <p className="text-slate-500">سيتم برمجة هذا القسم قريباً في بيئة V2...</p>
  </div>
);

export default function V2Router({ session, supplier }) {
  const accountType = session?.user?.user_metadata?.account_type || supplier?.supplier_type || 'contractor';
  const storeName = session?.user?.user_metadata?.company_name || session?.user?.user_metadata?.full_name || 'مستخدم V2';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : '?';

  return (
    <Routes>
      <Route element={<V2Layout accountType={accountType} storeName={storeName} storeInitial={storeInitial} />}>
        
        {/* مسار المقاول الرئيسي (يعمل الآن!) */}
        <Route path="contractor-dashboard" element={<ContractorDashboard />} />
        
        {/* مسارات مؤقتة لتفادي رجوع الأزرار لنفس الصفحة */}
        <Route path="cost-calculator" element={<UnderConstruction title="الحاسبة الذكية للتكاليف" />} />
        <Route path="reviews" element={<UnderConstruction title="نظام تقييم الحرفيين" />} />
        <Route path="messages" element={<UnderConstruction title="صندوق الرسائل الشامل" />} />
        <Route path="marketplace" element={<UnderConstruction title="سوق BTP" />} />
        
        {/* مسارات المهندس والحرفي */}
        <Route path="architect-overview" element={<UnderConstruction title="لوحة المهندس" />} />
        <Route path="artisan-home" element={<UnderConstruction title="لوحة الحرفي" />} />

        {/* مسار محادثة فردي */}
        <Route path="chat/:token" element={<UnderConstruction title="واجهة المحادثة المباشرة" />} />

        <Route path="*" element={<Navigate to="contractor-dashboard" replace />} />
      </Route>
    </Routes>
  );
}