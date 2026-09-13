import { Routes, Route, Navigate } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';

export default function V2Router({ session, supplier }) {
  const accountType = session?.user?.user_metadata?.account_type || supplier?.supplier_type || 'contractor';
  const storeName = session?.user?.user_metadata?.company_name || session?.user?.user_metadata?.full_name || 'مستخدم V2';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : '?';

  return (
    <Routes>
      <Route element={<V2Layout accountType={accountType} storeName={storeName} storeInitial={storeInitial} />}>
        <Route path="contractor-dashboard" element={<div className="p-8 text-center font-bold text-2xl">✅ واجهة المقاول الجديدة جاهزة للبرمجة</div>} />
        <Route path="*" element={<Navigate to="contractor-dashboard" replace />} />
      </Route>
    </Routes>
  );
}