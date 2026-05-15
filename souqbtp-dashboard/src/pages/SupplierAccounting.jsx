import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Calculator, TrendingUp, TrendingDown, Scale, Loader2 } from 'lucide-react';

export default function SupplierAccounting() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [operatingCosts, setOperatingCosts] = useState(0);
  const [salaries, setSalaries] = useState(0);

  useEffect(() => {
    if (supplier?.id) fetchFinancials();
  }, [supplier]);

  const fetchFinancials = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      // 1. البحث بالبضاعة لحساب المداخيل بدقة
      const { data: myProducts } = await supabase.from('products').select('id').eq('supplier_id', targetId);
      const myProductIds = new Set(myProducts?.map(p => p.id) || []);

      const { data: allInvoices } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
      const myInvoices = (allInvoices || []).filter(inv => (inv.items || []).some(item => myProductIds.has(item.id)));
      
      const totalRevenue = myInvoices.reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0);
      setRevenue(totalRevenue);

      // 2. مصاريف المورد (هذه تسجل بشكل صحيح ومباشر)
      const { data: expenses } = await supabase.from('expenses').select('amount, category').eq('supplier_id', targetId);

      let opsCosts = 0;
      let salCosts = 0;

      (expenses || []).forEach(exp => {
        if (exp.category === 'salaires' || exp.category === 'hr') salCosts += Number(exp.amount || 0);
        else opsCosts += Number(exp.amount || 0);
      });

      setOperatingCosts(opsCosts);
      setSalaries(salCosts);
      
    } catch (err) {
      console.error('Error fetching financials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const netResult = revenue - operatingCosts - salaries;
  const isProfitable = netResult >= 0;

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 size={40} className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 mb-8">
        <Calculator className="text-blue-500" size={32} />
        {language === 'fr' ? 'Comptabilité & Bilan' : 'المحاسبة والبيانات المالية'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl shadow-xl">
          <p className="text-emerald-400 font-bold text-sm mb-1">{language === 'fr' ? "Chiffre d'Affaires" : 'المداخيل'}</p>
          <h3 className="text-3xl font-black text-white">{revenue.toLocaleString()} MAD</h3>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl shadow-xl">
          <p className="text-orange-400 font-bold text-sm mb-1">{language === 'fr' ? 'Charges' : 'المصاريف'}</p>
          <h3 className="text-3xl font-black text-white">{operatingCosts.toLocaleString()} MAD</h3>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl shadow-xl">
          <p className="text-purple-400 font-bold text-sm mb-1">{language === 'fr' ? 'Masse Salariale' : 'كتلة الأجور'}</p>
          <h3 className="text-3xl font-black text-white">{salaries.toLocaleString()} MAD</h3>
        </div>

        <div className={`${isProfitable ? 'bg-blue-600' : 'bg-red-600'} p-6 rounded-3xl shadow-xl`}>
          <p className="text-white/80 font-bold text-sm mb-1">{language === 'fr' ? 'Résultat Net' : 'الربح الصافي'}</p>
          <h3 className="text-3xl font-black text-white">{netResult.toLocaleString()} MAD</h3>
        </div>
      </div>
    </div>
  );
}