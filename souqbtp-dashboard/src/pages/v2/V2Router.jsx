import { Routes, Route, Navigate } from 'react-router-dom';
import V2Layout from '../../components/v2/V2Layout';

// 1. استيراد المكون الجديد
import ContractorDashboard from './ContractorDashboard';

export default function V2Router({ session, supplier }) {
  const accountType = session?.user?.user_metadata?.account_type || supplier?.supplier_type || 'contractor';
  const storeName = session?.user?.user_metadata?.company_name || session?.user?.user_metadata?.full_name || 'مستخدم V2';
  const storeInitial = storeName ? storeName.charAt(0).toUpperCase() : '?';

  return (
    <Routes>
      <Route element={<V2Layout accountType={accountType} storeName={storeName} storeInitial={storeInitial} />}>
        
        {/* 2. ربط المسار بالمكون الحقيقي */}
        <Route path="contractor-dashboard" element={<ContractorDashboard />} />
        
        <Route path="*" element={<Navigate to="contractor-dashboard" replace />} />
      </Route>
    </Routes>
  );
}