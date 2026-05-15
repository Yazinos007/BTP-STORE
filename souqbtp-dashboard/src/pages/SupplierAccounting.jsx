import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Calculator, TrendingUp, TrendingDown, Scale, Download, Loader2 } from 'lucide-react';

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
      // 🎯 الشرط الذكي الصحيح
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      const { data: invoices, error: invError } = await supabase
        .from('documents')
        .select('total_amount')
        .eq('owner_id', targetId)
        .eq('type', 'Facture');

      if (invError) throw invError;
      
      const totalRevenue = (invoices || []).reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0);
      setRevenue(totalRevenue);

      const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('supplier_id', targetId);

      if (expError) throw expError;

      let opsCosts = 0;
      let salCosts = 0;

      (expenses || []).forEach(exp => {
        if (exp.category === 'salaires' || exp.category === 'hr') {
          salCosts += Number(exp.amount || 0);
        } else {
          opsCosts += Number(exp.amount || 0);
        }
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

  const maxChartValue = Math.max(revenue, operatingCosts + salaries) || 1;
  const revenueHeight = `${(revenue / maxChartValue) * 100}%`;
  const expensesHeight = `${((operatingCosts + salaries) / maxChartValue) * 100}%`;

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 size={40} className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Calculator className="text-blue-500" size={32} />
            {language === 'fr' ? 'Comptabilité & Bilan' : 'المحاسبة والبيانات المالية'}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-emerald-400 font-bold text-sm mb-1">{language === 'fr' ? "Chiffre d'Affaires" : 'المداخيل'}</p>
          <h3 className="text-3xl font-black text-white">{revenue.toLocaleString()} <span className="text-sm">MAD</span></h3>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-orange-400 font-bold text-sm mb-1">{language === 'fr' ? 'Charges Opérationnelles' : 'مصاريف التشغيل'}</p>
          <h3 className="text-3xl font-black text-white">{operatingCosts.toLocaleString()} <span className="text-sm">MAD</span></h3>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-purple-400 font-bold text-sm mb-1">{language === 'fr' ? 'Masse Salariale' : 'كتلة الأجور'}</p>
          <h3 className="text-3xl font-black text-white">{salaries.toLocaleString()} <span className="text-sm">MAD</span></h3>
        </div>

        <div className={`${isProfitable ? 'bg-blue-600' : 'bg-red-600'} p-6 rounded-3xl relative overflow-hidden shadow-xl group`}>
          <p className="text-white/80 font-bold text-sm mb-1">{language === 'fr' ? 'Résultat Net' : 'الربح الصافي'}</p>
          <h3 className="text-3xl font-black text-white">{netResult.toLocaleString()} <span className="text-sm">MAD</span></h3>
        </div>
      </div>
    </div>
  );
}