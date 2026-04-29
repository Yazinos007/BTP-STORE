import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Overview from './pages/Overview';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import POS from './pages/POS';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import HR from './pages/HR';
import Fiscal from './pages/Fiscal';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Caisses from './pages/Caisses';
import Devis from './pages/Devis';
import BC from './pages/BC';
import BL from './pages/BL';
import Avoir from './pages/Avoir';
import Expeditions from './pages/Expeditions';
import FacturesAchat from './pages/FacturesAchat';
import useSupplierStore from './store/useSupplierStore';
import useSettingsStore from './store/useSettingsStore';
import Clients from './pages/Clients';
import Accounting from './pages/Accounting';
import ExternalSuppliers from './pages/ExternalSuppliers';
import Purchases from './pages/Purchases';

// 1. مكون ذكي للصفحات قيد الإنشاء (يترجم نفسه تلقائياً)
const PlaceholderPage = ({ title }) => {
  const { language } = useSettingsStore();
  return (
    <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center h-full">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-lg">
        {language === 'fr' ? 'En cours de développement...' : 'قيد الإنشاء...'}
      </p>
    </div>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { language } = useSettingsStore();
  const { supplier, fetchSupplierProfile } = useSupplierStore();

  // 2. قاموس ترجمة مصغر خاص بملف App
  const t = {
    ar: {
      loading: 'جاري التحميل...',
      welcome: 'مرحباً بك، ',
    },
    fr: {
      loading: 'Chargement en cours...',
      welcome: 'Bienvenue, ',
    }
  }[language];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchSupplierProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchSupplierProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSupplierProfile]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center font-bold text-gray-500">{t.loading}</div>;
  }

  if (!session) {
    return <Login />;
  }

  const storeName = supplier?.store_name || t.loading;
  const storeInitial = supplier?.store_name ? supplier.store_name.charAt(0).toUpperCase() : (language === 'fr' ? '?' : '؟');

  return (
    <BrowserRouter>
      {/* 3. التحكم باتجاه التطبيق بالكامل بناءً على اللغة */}
      <div className="flex h-screen bg-gray-50 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
       <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* الشريط العلوي المترجم */}
          <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {t.welcome} <span className="text-blue-600">{storeName}</span>
            </h2>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                {storeInitial}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[400px]">
              <Routes>
                {/* الصفحات المكتملة */}
                <Route path="/" element={<Overview />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/fiscal" element={<Fiscal />} />
                <Route path="/caisses" element={<Caisses />} />
                <Route path="/devis" element={<Devis />} />
                <Route path="/bc" element={<BC />} />
                <Route path="/bl" element={<BL />} />
                <Route path="/avoir" element={<Avoir />} />
                <Route path="/fiches-expedition" element={<Expeditions />} />
                <Route path="/factures-achat" element={<FacturesAchat />} />
                <Route path="/caisses" element={<Caisses />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/suppliers" element={<ExternalSuppliers />} />
                <Route path="/purchases" element={<Purchases />} />
              </Routes>
            </div>
          </div>
        </main>
      </div> 
    </BrowserRouter>
  );
}

export default App;