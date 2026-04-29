import { useEffect, useState } from 'react';
import useOrderStore from '../store/useOrderStore';
import useExpenseStore from '../store/useExpenseStore';
import useHRStore from '../store/useHRStore';
import useSettingsStore from '../store/useSettingsStore';
import { Calculator, FileSpreadsheet, TrendingUp, TrendingDown, Scale, Download, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const translations = {
  ar: {
    title: 'المحاسبة والبيانات المالية', subtitle: 'المركز المالي للشركة وحساب النتيجة (CPC) مجمع تلقائياً.',
    revenue: 'رقم المعاملات (المداخيل)', expenses: 'إجمالي المصاريف', payroll: 'كتلة الأجور الشهرية', netResult: 'النتيجة الصافية (الربح/الخسارة)',
    cpcTitle: 'حساب العائدات والتكاليف (CPC)', exportBtn: 'تصدير للمحاسب (Excel)', currency: 'درهم',
    chartTitle: 'مقارنة المداخيل والمصاريف', revLabel: 'المداخيل', expLabel: 'المصاريف والرواتب',
    rubrique: 'البيان (Rubrique)', montant: 'المبلغ', details: 'تفاصيل العمليات'
  },
  fr: {
    title: 'Comptabilité & Bilan', subtitle: 'Situation financière et CPC générés automatiquement.',
    revenue: 'Chiffre d\'Affaires', expenses: 'Charges Opérationnelles', payroll: 'Masse Salariale (Mois)', netResult: 'Résultat Net',
    cpcTitle: 'Compte de Produits et Charges (CPC)', exportBtn: 'Export Fiduciaire (CSV)', currency: 'MAD',
    chartTitle: 'Comparaison Revenus vs Charges', revLabel: 'Revenus', expLabel: 'Charges & Salaires',
    rubrique: 'Rubrique', montant: 'Montant', details: 'Détails des opérations'
  }
};

export default function Accounting() {
  const { orders, fetchOrders } = useOrderStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { employees, fetchEmployees } = useHRStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  useEffect(() => {
    fetchOrders(); fetchExpenses(); fetchEmployees();
  }, [fetchOrders, fetchExpenses, fetchEmployees]);

  // 🧠 المعالجة الذكية للبيانات (تجميع من كل الأقسام)
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const totalRevenue = safeOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalExpenses = safeExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  // حساب رواتب الموظفين النشطين (أساسي + منح - اقتطاعات)
  const totalPayroll = safeEmployees.filter(emp => emp.status === 'Actif' || emp.status === 'active').reduce((sum, emp) => {
    return sum + Number(emp.base_salary || 0) + Number(emp.primes_avances || 0) - Number(emp.retenues || 0);
  }, 0);

  const totalCharges = totalExpenses + totalPayroll;
  const netResult = totalRevenue - totalCharges;

  // 📊 بيانات المخطط
  const chartData = [
    { name: t.revLabel, value: totalRevenue, fill: '#10B981' },
    { name: t.expLabel, value: totalCharges, fill: '#EF4444' }
  ];

  // 📥 دالة تصدير التقرير المفصل للمحاسب (Grand Livre)
  const exportDetailedCSV = () => {
    // 1. إعداد رأس الملف (الأعمدة)
    let csvContent = "Date,Type d'operation,Description / Categorie,Montant (MAD)\n";

    // 2. جلب المبيعات (المداخيل)
    const safeOrders = Array.isArray(orders) ? orders : [];
    safeOrders.filter(o => o.status === 'delivered').forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('fr-FR');
      // نضيف علامة زائد (+) قبل المبيعات
      csvContent += `${date},Vente / Revenu,Commande #${order.id.substring(0, 8)},+${order.total_amount}\n`;
    });

    // 3. جلب المصاريف (الخسائر)
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    safeExpenses.forEach(expense => {
      const date = new Date(expense.created_at).toLocaleDateString('fr-FR');
      // نضيف علامة ناقص (-) قبل المصاريف
      csvContent += `${date},Charge / Depense,${expense.category} - ${expense.description},-${expense.amount}\n`;
    });

    // 4. تحميل الملف
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF لدعم الحروف العربية إن وجدت
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Fiduciaire_${new Date().toLocaleDateString('fr-FR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div><p className="text-sm font-medium text-white/80 mb-1">{title}</p><h4 className="text-2xl font-black tracking-tight">{value.toLocaleString()} <span className="text-sm font-normal text-white/70">{t.currency}</span></h4></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3"><Calculator className="text-blue-600" /> {t.title}</h2>
          <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
        </div>
        <button onClick={exportDetailedCSV} className="bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg font-bold">
          <FileSpreadsheet size={20} /> {t.exportBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t.revenue} value={totalRevenue} icon={TrendingUp} bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-400" />
        <StatCard title={t.expenses} value={totalExpenses} icon={TrendingDown} bgGradient="bg-gradient-to-br from-orange-500 to-orange-400" />
        <StatCard title={t.payroll} value={totalPayroll} icon={Scale} bgGradient="bg-gradient-to-br from-purple-600 to-purple-400" />
        <StatCard title={t.netResult} value={netResult} icon={Calculator} bgGradient={netResult >= 0 ? "bg-gradient-to-br from-blue-800 to-blue-500" : "bg-gradient-to-br from-red-700 to-red-500"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* 📊 المخطط المالي */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">{t.chartTitle}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📑 تقرير الـ CPC */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Scale size={20} className="text-blue-600"/> {t.cpcTitle}</h3>
          </div>
          <div className="p-6 flex-1">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b-2 border-gray-800 text-gray-700">
                  <th className="py-3 text-start font-black text-base">{t.rubrique}</th>
                  <th className="py-3 text-end font-black text-base">{t.montant}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* المداخيل */}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 font-bold text-gray-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Produits d'Exploitation (Ventes)</td>
                  <td className="py-4 text-end font-bold text-emerald-600 font-mono text-lg">{totalRevenue.toLocaleString()}</td>
                </tr>
                {/* المصاريف */}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 font-bold text-gray-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Charges d'Exploitation (Dépenses)</td>
                  <td className="py-4 text-end font-bold text-orange-600 font-mono text-lg">-{totalExpenses.toLocaleString()}</td>
                </tr>
                {/* الرواتب */}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 font-bold text-gray-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Frais de Personnel (Salaires)</td>
                  <td className="py-4 text-end font-bold text-purple-600 font-mono text-lg">-{totalPayroll.toLocaleString()}</td>
                </tr>
                {/* النتيجة الصافية */}
                <tr className="bg-gray-50">
                  <td className="py-5 font-black text-gray-900 text-lg flex items-center gap-2"><ArrowRight size={20} className={netResult >= 0 ? "text-blue-600" : "text-red-600"}/> RÉSULTAT NET</td>
                  <td className={`py-5 text-end font-black text-2xl font-mono ${netResult >= 0 ? "text-blue-700" : "text-red-600"}`}>
                    {netResult.toLocaleString()} <span className="text-sm">{t.currency}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}