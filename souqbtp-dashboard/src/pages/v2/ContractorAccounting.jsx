import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import useSupplierStore from '../../store/useSupplierStore';
import { Calculator, TrendingUp, TrendingDown, Scale, Download, Loader2, Target, BarChart3 } from 'lucide-react';

export default function Accounting() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const { supplier } = useSupplierStore();
  
  const translations = {
    ar: {
      title: 'المحاسبة والبيانات المالية', subtitle: 'الوضعية المالية وحساب النتيجة (CPC) المولد تلقائياً.',
      exportBtn: 'تصدير للمحاسب (CSV)', revenue: 'رقم المعاملات (المداخيل)', opsCosts: 'مصاريف التشغيل',
      payroll: 'كتلة الأجور', netResult: 'الربح الصافي', comparison: 'مقارنة المداخيل والمصاريف',
      cpcTitle: 'حساب العائدات والتكاليف (CPC)', prodExploitation: 'عائدات الاستغلال',
      chargesExploitation: 'تكاليف الاستغلال', fraisPersonnel: 'تكاليف الموظفين',
      netTitle: 'النتيجة الصافية', currency: 'درهم', targetTitle: 'الهدف المالي السنوي',
      targetAchieved: 'نسبة التحقيق'
    },
    fr: {
      title: 'Comptabilité & Bilan', subtitle: 'Situation financière et CPC générés automatiquement.',
      exportBtn: 'Export Fiduciaire (CSV)', revenue: "Chiffre d'Affaires", opsCosts: 'Charges Opérationnelles',
      payroll: 'Masse Salariale', netResult: 'Résultat Net', comparison: 'Comparaison Revenus vs Charges',
      cpcTitle: 'Compte de Produits et Charges (CPC)', prodExploitation: "Produits d'Exploitation",
      chargesExploitation: "Charges d'Exploitation", fraisPersonnel: 'Frais de Personnel',
      netTitle: 'RÉSULTAT NET', currency: 'MAD', targetTitle: 'Objectif Financier Annuel',
      targetAchieved: 'Taux de réalisation'
    },
    en: {
      title: 'Accounting & Financials', subtitle: 'Financial position and automatically generated income statement (CPC).',
      exportBtn: 'Export for Accountant (CSV)', revenue: 'Total Revenue', opsCosts: 'Operating Expenses',
      payroll: 'Payroll', netResult: 'Net Profit', comparison: 'Revenue vs Expenses Comparison',
      cpcTitle: 'Income & Cost Statement (CPC)', prodExploitation: 'Operating Revenue',
      chargesExploitation: 'Operating Expenses', fraisPersonnel: 'Personnel Costs',
      netTitle: 'NET RESULT', currency: 'MAD', targetTitle: 'Annual Financial Target',
      targetAchieved: 'Achievement Rate'
    }
  };
  
  const t = translations[language] || translations.ar;
  
  const [isLoading, setIsLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [operatingCosts, setOperatingCosts] = useState(0);
  const [salaries, setSalaries] = useState(0);

  // هدف افتراضي للمبيعات لغرض التحفيز البصري
  const TARGET_REVENUE = 1000000; 

  useEffect(() => {
    fetchFinancials();
  }, [supplier]);

  const fetchFinancials = async () => {
    setIsLoading(true);
    try {
      if(supplier?.id) {
          const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

          // 1. جلب المداخيل بناءً على اسم البضاعة (أو فواتير المقاول)
          const { data: myProducts } = await supabase.from('products').select('name').eq('supplier_id', targetId);
          const myProductNames = new Set(myProducts?.map(p => (p.name || '').replace(/\s+/g, '').toLowerCase()) || []);

          const { data: allInvoices, error: invError } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
          if (!invError && allInvoices) {
            const myInvoices = allInvoices.filter(inv => (inv.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase())));
            setRevenue(myInvoices.reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0));
          }

          // 2. جلب المصاريف التشغيلية
          const { data: expenses, error: expError } = await supabase.from('expenses').select('amount, category').eq('supplier_id', targetId);
          if (!expError && expenses) {
            let opsCosts = 0;
            let manualSalCosts = 0;
            expenses.forEach(exp => {
              if (exp.category === 'salaires' || exp.category === 'hr') manualSalCosts += Number(exp.amount || 0);
              else opsCosts += Number(exp.amount || 0);
            });
            setOperatingCosts(opsCosts);
          }

          // 3. جلب الرواتب من الموارد البشرية
          const { data: employees, error: empError } = await supabase.from('employees').select('base_salary, primes_avances, retenues, status').eq('supplier_id', targetId);
          if (!empError && employees) {
            let hrPayroll = 0;
            employees.forEach(emp => {
              if (emp.status === 'Actif' || emp.status === 'active') {
                hrPayroll += (Number(emp.base_salary || 0) + Number(emp.primes_avances || 0) - Number(emp.retenues || 0));
              }
            });
            setSalaries(hrPayroll); // أو + manualSalCosts
          }
      } else {
          // 🚀 Fallback Data للعرض في حال عدم توفر الداتابيز
          setTimeout(() => {
              setRevenue(850000);
              setOperatingCosts(320000);
              setSalaries(180000);
          }, 800);
      }
    } catch (err) {
      console.error('Error fetching financials:', err);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', `Amount (${t.currency})`],
      [t.revenue, revenue],
      [t.opsCosts, operatingCosts],
      [t.payroll, salaries],
      [t.netResult, revenue - operatingCosts - salaries]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bilan_comptable_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const netResult = revenue - operatingCosts - salaries;
  const isProfitable = netResult >= 0;
  
  // حسابات الرسوم البيانية البصرية
  const maxChartValue = Math.max(revenue, operatingCosts + salaries) || 1;
  const revenueHeight = `${(revenue / maxChartValue) * 100}%`;
  const expensesHeight = `${((operatingCosts + salaries) / maxChartValue) * 100}%`;
  
  const targetPercentage = Math.min(Math.round((revenue / TARGET_REVENUE) * 100), 100);

  // 🎨 تنسيقات الواجهة
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200';

  if (isLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 size={60} className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${bgMain} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
            <BarChart3 className="text-blue-500" size={36} />
            {t.title}
          </h2>
          <p className={`${textMuted} font-bold mt-2`}>{t.subtitle}</p>
        </div>
        
        <button onClick={handleExportCSV} className="relative z-10 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
          <Download size={20}/> {t.exportBtn}
        </button>
      </div>

      {/* 🚀 البطاقات الإحصائية (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-[2rem] relative overflow-hidden group shadow-lg ${isDarkMode ? 'bg-emerald-500/10 border-2 border-emerald-500/20' : 'bg-emerald-50 border-2 border-emerald-200'}`}>
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-emerald-500"><TrendingUp size={120}/></div>
          <p className="text-emerald-500 font-black text-sm mb-2 uppercase tracking-widest">{t.revenue}</p>
          <h3 className={`text-3xl font-black ${textMain} font-mono`} dir="ltr">{revenue.toLocaleString()} <span className="text-xs">{t.currency}</span></h3>
        </div>

        <div className={`p-6 rounded-[2rem] relative overflow-hidden group shadow-lg ${isDarkMode ? 'bg-orange-500/10 border-2 border-orange-500/20' : 'bg-orange-50 border-2 border-orange-200'}`}>
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-orange-500"><TrendingDown size={120}/></div>
          <p className="text-orange-500 font-black text-sm mb-2 uppercase tracking-widest">{t.opsCosts}</p>
          <h3 className={`text-3xl font-black ${textMain} font-mono`} dir="ltr">{operatingCosts.toLocaleString()} <span className="text-xs">{t.currency}</span></h3>
        </div>

        <div className={`p-6 rounded-[2rem] relative overflow-hidden group shadow-lg ${isDarkMode ? 'bg-purple-500/10 border-2 border-purple-500/20' : 'bg-purple-50 border-2 border-purple-200'}`}>
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-purple-500"><Scale size={120}/></div>
          <p className="text-purple-500 font-black text-sm mb-2 uppercase tracking-widest">{t.payroll}</p>
          <h3 className={`text-3xl font-black ${textMain} font-mono`} dir="ltr">{salaries.toLocaleString()} <span className="text-xs">{t.currency}</span></h3>
        </div>

        <div className={`${isProfitable ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-red-600 to-rose-600'} p-6 rounded-[2rem] relative overflow-hidden shadow-xl group text-white`}>
          <div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform duration-500"><Calculator size={120}/></div>
          <p className="font-black text-sm mb-2 uppercase tracking-widest text-white/80">{t.netResult}</p>
          <h3 className="text-4xl font-black font-mono" dir="ltr">{netResult.toLocaleString()} <span className="text-sm">{t.currency}</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        
        {/* 🚀 مقارنة المداخيل والمصاريف + الهدف المالي */}
        <div className={`${bgMain} border-2 rounded-[2rem] p-8 shadow-xl flex flex-col`}>
          <h3 className={`text-xl font-black ${textMain} mb-8 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-4 flex items-center gap-3`}>
            <BarChart3 className="text-blue-500"/> {t.comparison}
          </h3>
          
          <div className={`flex-1 flex items-end justify-center gap-16 h-64 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-300'} pb-4 relative`}>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className={`border-t ${isDarkMode ? 'border-slate-400' : 'border-slate-800'} w-full`}></div>
              <div className={`border-t ${isDarkMode ? 'border-slate-400' : 'border-slate-800'} w-full`}></div>
              <div className={`border-t ${isDarkMode ? 'border-slate-400' : 'border-slate-800'} w-full`}></div>
            </div>
            
            <div className="w-28 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-2xl relative group flex justify-center transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ height: revenueHeight, minHeight: '10%' }}>
              <span className={`absolute -top-10 text-emerald-500 font-black opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20`} dir="ltr">
                {revenue.toLocaleString()}
              </span>
            </div>
            
            <div className="w-28 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-2xl relative group flex justify-center transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.3)]" style={{ height: expensesHeight, minHeight: '10%' }}>
              <span className={`absolute -top-10 text-orange-500 font-black opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20`} dir="ltr">
                {(operatingCosts + salaries).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center gap-16 mt-4 text-sm font-black uppercase tracking-widest">
            <span className="text-emerald-500 w-28 text-center">{t.revenue}</span>
            <span className="text-orange-500 w-28 text-center">{t.opsCosts}</span>
          </div>

          {/* Target Progress Bar */}
          <div className={`mt-10 p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`font-black text-sm flex items-center gap-2 ${textMain}`}><Target size={16} className="text-blue-500"/> {t.targetTitle}</span>
              <span className="font-mono text-sm font-bold text-blue-500" dir="ltr">{TARGET_REVENUE.toLocaleString()} {t.currency}</span>
            </div>
            <div className={`w-full h-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" style={{ width: `${targetPercentage}%` }}></div>
            </div>
            <p className={`text-xs font-bold mt-2 text-end ${textMuted}`}>{t.targetAchieved}: <span className="text-blue-500 font-black">{targetPercentage}%</span></p>
          </div>
        </div>

        {/* 🚀 تقرير CPC المفصل */}
        <div className={`${bgMain} border-2 rounded-[2rem] p-8 shadow-xl flex flex-col`}>
          <h3 className={`text-xl font-black ${textMain} mb-8 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-4 flex items-center gap-3`}>
            <Scale className="text-blue-500"/> {t.cpcTitle}
          </h3>
          
          <div className="space-y-4 flex-1">
            <div className={`flex justify-between items-center p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`font-black ${textMuted} flex items-center gap-3`}><span className="w-3 h-3 rounded-full bg-emerald-500"></span>{t.prodExploitation}</span>
              <span className="font-black text-lg text-emerald-500 font-mono" dir="ltr">{revenue.toLocaleString()}</span>
            </div>
            
            <div className={`flex justify-between items-center p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`font-black ${textMuted} flex items-center gap-3`}><span className="w-3 h-3 rounded-full bg-orange-500"></span>{t.chargesExploitation}</span>
              <span className="font-black text-lg text-orange-500 font-mono" dir="ltr">-{operatingCosts.toLocaleString()}</span>
            </div>
            
            <div className={`flex justify-between items-center p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`font-black ${textMuted} flex items-center gap-3`}><span className="w-3 h-3 rounded-full bg-purple-500"></span>{t.fraisPersonnel}</span>
              <span className="font-black text-lg text-purple-500 font-mono" dir="ltr">-{salaries.toLocaleString()}</span>
            </div>
            
            {/* Net Result Final Box */}
            <div className={`mt-8 p-6 rounded-2xl border-2 flex justify-between items-center ${isProfitable ? (isDarkMode ? 'bg-blue-600/10 border-blue-500/30' : 'bg-blue-50 border-blue-200') : (isDarkMode ? 'bg-red-600/10 border-red-500/30' : 'bg-red-50 border-red-200')}`}>
              <span className={`font-black uppercase tracking-widest flex items-center gap-3 ${isProfitable ? 'text-blue-500' : 'text-red-500'}`}>
                {isProfitable ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                {t.netTitle}
              </span>
              <span className={`text-3xl font-black font-mono ${isProfitable ? 'text-blue-500' : 'text-red-500'}`} dir="ltr">
                {netResult.toLocaleString()} <span className="text-sm font-bold opacity-70 uppercase tracking-widest">{t.currency}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}