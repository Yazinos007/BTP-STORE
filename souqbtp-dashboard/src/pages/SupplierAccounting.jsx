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
      // 🎯 المعرف الذكي 
      const targetId = supplier.supplier_id || supplier.id;

      // 1. جلب المداخيل الحقيقية من الفواتير
      const { data: invoices, error: invError } = await supabase
        .from('documents')
        .select('total_amount')
        .eq('owner_id', targetId)
        .eq('type', 'Facture');

      if (invError) throw invError;
      
      // 🎯 حماية ضد الـ Null
      const totalRevenue = (invoices || []).reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0);
      setRevenue(totalRevenue);

      // 2. جلب المصاريف الحقيقية
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
          <p className="text-slate-400 mt-1 font-medium">
            {language === 'fr' ? 'Situation financière et CPC générés automatiquement.' : 'الوضعية المالية وحساب النتيجة (CPC) المولد تلقائياً.'}
          </p>
        </div>
        
        <button className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
          <Download size={18}/> {language === 'fr' ? 'Export Fiduciaire (CSV)' : 'تصدير للمحاسب (CSV)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={100}/></div>
          <p className="text-emerald-400 font-bold text-sm mb-1">{language === 'fr' ? "Chiffre d'Affaires" : 'رقم المعاملات (المداخيل)'}</p>
          <h3 className="text-3xl font-black text-white">{revenue.toLocaleString()} <span className="text-sm">MAD</span></h3>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingDown size={100}/></div>
          <p className="text-orange-400 font-bold text-sm mb-1">{language === 'fr' ? 'Charges Opérationnelles' : 'مصاريف التشغيل'}</p>
          <h3 className="text-3xl font-black text-white">{operatingCosts.toLocaleString()} <span className="text-sm">MAD</span></h3>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform"><Scale size={100}/></div>
          <p className="text-purple-400 font-bold text-sm mb-1">{language === 'fr' ? 'Masse Salariale' : 'كتلة الأجور'}</p>
          <h3 className="text-3xl font-black text-white">{salaries.toLocaleString()} <span className="text-sm">MAD</span></h3>
        </div>

        <div className={`${isProfitable ? 'bg-blue-600' : 'bg-red-600'} p-6 rounded-3xl relative overflow-hidden shadow-xl group`}>
          <div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform"><Calculator size={100}/></div>
          <p className="text-white/80 font-bold text-sm mb-1">{language === 'fr' ? 'Résultat Net' : 'الربح الصافي'}</p>
          <h3 className="text-3xl font-black text-white">{netResult.toLocaleString()} <span className="text-sm">MAD</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col">
          <h3 className="text-lg font-black text-white mb-8">{language === 'fr' ? 'Comparaison Revenus vs Charges' : 'مقارنة المداخيل والمصاريف'}</h3>
          <div className="flex-1 flex items-end justify-center gap-12 h-64 border-b border-slate-700 pb-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="border-t border-slate-500 w-full"></div>
              <div className="border-t border-slate-500 w-full"></div>
              <div className="border-t border-slate-500 w-full"></div>
              <div className="border-t border-slate-500 w-full"></div>
            </div>
            <div className="w-24 bg-emerald-500 rounded-t-xl relative group flex justify-center transition-all duration-1000 ease-out" style={{ height: revenueHeight, minHeight: '10%' }}>
              <span className="absolute -top-8 text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{revenue.toLocaleString()}</span>
            </div>
            <div className="w-24 bg-orange-500 rounded-t-xl relative group flex justify-center transition-all duration-1000 ease-out" style={{ height: expensesHeight, minHeight: '10%' }}>
              <span className="absolute -top-8 text-orange-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{(operatingCosts + salaries).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-center gap-12 mt-4 text-sm font-bold">
            <span className="text-emerald-400 w-24 text-center">{language === 'fr' ? 'Revenus' : 'المداخيل'}</span>
            <span className="text-orange-400 w-24 text-center">{language === 'fr' ? 'Charges' : 'المصاريف'}</span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <Scale className="text-blue-500" size={20}/> 
            {language === 'fr' ? 'Compte de Produits et Charges (CPC)' : 'حساب العائدات والتكاليف (CPC)'}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{language === 'fr' ? "Produits d'Exploitation" : 'عائدات الاستغلال'}</span>
              <span className="font-black text-emerald-400">{revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span>{language === 'fr' ? "Charges d'Exploitation" : 'تكاليف الاستغلال'}</span>
              <span className="font-black text-orange-400">-{operatingCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span>{language === 'fr' ? "Frais de Personnel" : 'تكاليف الموظفين'}</span>
              <span className="font-black text-purple-400">-{salaries.toLocaleString()}</span>
            </div>
            <div className={`flex justify-between items-center p-5 rounded-xl border mt-6 ${isProfitable ? 'bg-blue-600/20 border-blue-500/30' : 'bg-red-600/20 border-red-500/30'}`}>
              <span className="font-black text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={20} className={isProfitable ? 'text-blue-400' : 'text-red-400'}/>
                {language === 'fr' ? "RÉSULTAT NET" : 'النتيجة الصافية'}
              </span>
              <span className={`text-2xl font-black ${isProfitable ? 'text-blue-400' : 'text-red-400'}`}>
                {netResult.toLocaleString()} <span className="text-sm">MAD</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}