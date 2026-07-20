import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupplierStore from '../store/useSupplierStore';
import useProductStore from '../store/useProductStore';
import useOrderStore from '../store/useOrderStore';
import useClientStore from '../store/useClientStore';
import useExpenseStore from '../store/useExpenseStore';
import useHRStore from '../store/useHRStore';
import useSettingsStore from '../store/useSettingsStore';
import { Package, ShoppingCart, Wallet, TrendingUp, AlertTriangle, CreditCard, Receipt, Briefcase, Activity, Zap, ShieldAlert, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SmartAIAssistant from '../components/SmartAIAssistant';

const translations = {
  ar: {
    title: 'لوحة القيادة', subtitle: 'تحليلات، تنبؤات ذكية، وملخص لأداء متجرك.',
    activeProds: 'المنتجات النشطة', prodUnit: 'منتج', inventory: 'قيمة المخزون', currency: 'درهم',
    activeOrders: 'طلبات قيد المعالجة', orderUnit: 'طلب', revenue: 'إجمالي المبيعات',
    debts: 'ديون العملاء', expenses: 'إجمالي المصاريف', hr: 'الموظفين النشطين', empUnit: 'موظف',
    payroll: 'كتلة الأجور', cashBalance: 'رصيد الصناديق', netProfit: 'النتيجة الصافية',
    chartTitle: 'تطور المبيعات (الـ 6 أشهر الأخيرة)', stockAlerts: 'تنبيهات المخزون', outOfStock: 'نفد تماماً',
    lowStock: 'باقي', perfectStock: 'مخزونك في حالة ممتازة!',
    upgradeTitle: 'ارتقِ بمتجرك إلى مستوى Enterprise 🚀', upgradeDesc: 'افتح جميع الميزات الاحترافية: المحاسبة، إدارة الموارد البشرية، وتعدد الصناديق.', upgradeBtn: 'الترقية الآن',
    salesLabel: 'مبيعات'
  },
  fr: {
    title: 'Tableau de Bord', subtitle: 'Analyses, prévisions intelligentes et performances.',
    activeProds: 'Produits Actifs', prodUnit: 'Produits', inventory: 'Valeur du Stock', currency: 'MAD',
    activeOrders: 'Commandes en cours', orderUnit: 'Commandes', revenue: 'Chiffre d\'Affaires',
    debts: 'Créances Clients', expenses: 'Total des Charges', hr: 'Employés Actifs', empUnit: 'Employés',
    payroll: 'Masse Salariale', cashBalance: 'Solde des Caisses', netProfit: 'Résultat Net',
    chartTitle: 'Évolution des Ventes (6 derniers mois)', stockAlerts: 'Alertes de Stock', outOfStock: 'Rupture',
    lowStock: 'Reste', perfectStock: 'Votre stock est en parfait état !',
    upgradeTitle: 'Passez au niveau Enterprise 🚀', upgradeDesc: 'Débloquez toutes les fonctionnalités : Comptabilité, RH, et Multi-caisses.', upgradeBtn: 'Passer à l\'Enterprise',
    salesLabel: 'Ventes'
  },
  en: {
    title: 'Dashboard', subtitle: 'Analytics, smart forecasts, and store performance summary.',
    activeProds: 'Active Products', prodUnit: 'Products', inventory: 'Inventory Value', currency: 'MAD',
    activeOrders: 'Pending Orders', orderUnit: 'Orders', revenue: 'Total Sales',
    debts: 'Customer Debts', expenses: 'Total Expenses', hr: 'Active Employees', empUnit: 'Employees',
    payroll: 'Payroll', cashBalance: 'Cash Balance', netProfit: 'Net Profit',
    chartTitle: 'Sales Evolution (Last 6 Months)', stockAlerts: 'Stock Alerts', outOfStock: 'Out of stock',
    lowStock: 'Remaining', perfectStock: 'Your stock is in perfect condition!',
    upgradeTitle: 'Upgrade to Enterprise 🚀', upgradeDesc: 'Unlock all pro features: Accounting, HR, and Multi-Cashier.', upgradeBtn: 'Upgrade Now',
    salesLabel: 'Sales'
  }
};

export default function Overview() {
  const navigate = useNavigate();
  const { supplier } = useSupplierStore();
  const { products, fetchProducts, isLoading: isProductsLoading } = useProductStore();
  const { orders, fetchOrders } = useOrderStore();
  const { clients, fetchClients } = useClientStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { employees, fetchEmployees } = useHRStore();
  const { language } = useSettingsStore();
  const t = translations[language] || translations['fr'];

  const [stats, setStats] = useState({ 
    totalProducts: 0, inventoryValue: 0, activeOrders: 0, totalRevenue: 0, 
    totalDebts: 0, totalExpenses: 0, activeEmployees: 0, payroll: 0, 
    netProfit: 0, cashBalance: 0 
  });

  const role = supplier?.role || 'admin';
  const perms = supplier?.permissions || { sales: true, products: true, invoices: true, accounting: true, hr: true };
  const canView = (permission) => role === 'admin' || perms[permission];
  const isBasic = supplier?.tier === 'basic' || supplier?.tier === 'free';

  useEffect(() => {
    if (!supplier) return; 
    if (canView('products')) fetchProducts();
    if (canView('sales')) { fetchOrders(); fetchClients(); }
    if (canView('accounting')) fetchExpenses();
    if (canView('hr')) fetchEmployees();
  }, [supplier?.id]); 

  useEffect(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeClients = Array.isArray(clients) ? clients : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const safeEmployees = Array.isArray(employees) ? employees : [];

    const totalVal = safeProducts.reduce((sum, p) => {
      const price = Number(p.price || p.sale_price || p.prix || p.prix_vente || 0);
      const qty = Number(p.stock_quantity || p.stock || p.quantite || 0);
      return sum + (price * qty);
    }, 0);

    const activeOrds = safeOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const revenue = safeOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount), 0);
    const debts = safeClients.reduce((sum, c) => sum + Number(c.total_debt || c.dette || 0), 0);
    const totalExp = safeExpenses.reduce((sum, e) => sum + Number(e.amount || e.montant || 0), 0);
    
    const activeEmp = safeEmployees.filter(e => e.status === 'Actif' || e.status === 'active');
    
    // 🎯 المعادلة المحاسبية الدقيقة متطابقة 100% مع نظام الموارد البشرية الخاص بك
    const totalPayroll = activeEmp.reduce((sum, e) => {
      const baseSalary = Number(e.base_salary || 0);
      const primesAvances = Number(e.primes_avances || 0);
      const retenues = Number(e.retenues || 0);

      // صافي الأجر = الراتب الأساسي + (المنح/التسبيقات) - الاقتطاعات
      const netSalary = baseSalary + primesAvances - retenues;
      
      return sum + netSalary;
    }, 0);
    
    const calculatedNetProfit = revenue - totalExp - totalPayroll; 
    const calculatedCash = (revenue - totalExp) > 0 ? (revenue - totalExp) : 0;

    setStats({ 
      totalProducts: safeProducts.length, inventoryValue: totalVal, 
      activeOrders: activeOrds, totalRevenue: revenue,
      totalDebts: debts, totalExpenses: totalExp, activeEmployees: activeEmp.length,
      payroll: totalPayroll, netProfit: calculatedNetProfit, cashBalance: calculatedCash
    });
  }, [products, orders, clients, expenses, employees]);

  const dynamicChartData = useMemo(() => {
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // ✅ إضافة أسماء الأشهر بالإنجليزية
    
    const safeOrders = Array.isArray(orders) ? orders : [];
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIndex = d.getMonth();
      const year = d.getFullYear();

      const monthRevenue = safeOrders
        .filter(o => {
          if (!o.created_at || o.status !== 'delivered') return false;
          const od = new Date(o.created_at);
          return od.getMonth() === mIndex && od.getFullYear() === year;
        })
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      data.push({ 
        nameAr: monthsAr[mIndex], 
        nameFr: monthsFr[mIndex], 
        nameEn: monthsEn[mIndex], // ✅ استخدام مصفوفة الإنجليزية
        [t.salesLabel]: monthRevenue 
      });
    }
    return data;
  }, [orders, language]); // ✅ أضفنا language لضمان تحديث الرسم عند تغيير اللغة

  const safeProducts = Array.isArray(products) ? products : [];
  const criticalStock = safeProducts.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0);
  const outOfStock = safeProducts.filter(p => p.stock_quantity === 0);

  const StatCard = ({ title, value, subValue, icon: Icon, bgGradient, suffix = '' }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300 flex flex-col justify-between`}>
      <div className="absolute -right-6 -top-6 opacity-20 pointer-events-none"><Icon size={120} /></div>
      <div className="relative z-10 flex items-center gap-4 mb-3">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <p className="text-sm font-black uppercase tracking-wider text-white/90">{title}</p>
      </div>
      <div className="relative z-10">
        <h4 className="text-3xl font-black tracking-tight">{value} <span className="text-sm font-bold text-white/70">{suffix}</span></h4>
        {subValue && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs font-bold text-white/90">{subValue}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {isBasic && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-amber-400">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none"><Zap size={200} /></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><Zap size={24} className="fill-white"/> {t.upgradeTitle}</h3>
            <p className="text-amber-50 font-medium">{t.upgradeDesc}</p>
          </div>
          <button onClick={() => navigate('/subscription')} className="relative z-10 whitespace-nowrap bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-black shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
            <Zap size={18} className="fill-amber-400 text-amber-400"/> {t.upgradeBtn}
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h2>
      </div>

      {canView('products') && <SmartAIAssistant />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
        {canView('sales') && <StatCard title={t.revenue} value={stats.totalRevenue.toLocaleString()} icon={TrendingUp} bgGradient="bg-gradient-to-br from-blue-600 to-indigo-600" suffix={t.currency} />}
        {canView('sales') && <StatCard title={t.activeOrders} value={stats.activeOrders} icon={ShoppingCart} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" suffix={t.orderUnit} />}
        {canView('products') && <StatCard title={t.activeProds} value={isProductsLoading ? '...' : stats.totalProducts} subValue={`${t.inventory}: ${stats.inventoryValue.toLocaleString()} ${t.currency}`} icon={Package} bgGradient="bg-gradient-to-br from-teal-500 to-emerald-600" suffix={t.prodUnit} />}
        {canView('hr') && <StatCard title={t.hr} value={stats.activeEmployees} subValue={`${t.payroll}: ${stats.payroll.toLocaleString()} ${t.currency}`} icon={Briefcase} bgGradient="bg-gradient-to-br from-purple-600 to-fuchsia-600" suffix={t.empUnit} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {canView('accounting') && <StatCard title={t.cashBalance} value={stats.cashBalance.toLocaleString()} icon={Wallet} bgGradient="bg-gradient-to-br from-slate-700 to-slate-900" suffix={t.currency} />}
        {canView('sales') && <StatCard title={t.debts} value={stats.totalDebts.toLocaleString()} icon={CreditCard} bgGradient="bg-gradient-to-br from-orange-500 to-amber-500" suffix={t.currency} />}
        {canView('accounting') && <StatCard title={t.expenses} value={stats.totalExpenses.toLocaleString()} icon={Receipt} bgGradient="bg-gradient-to-br from-gray-500 to-gray-600" suffix={t.currency} />}
        
        {canView('accounting') && (
          <div className={`relative overflow-hidden p-6 rounded-2xl border-2 text-white flex flex-col justify-between
            ${stats.netProfit < 0 
              ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400 shadow-[0_0_25px_rgba(220,38,38,0.6)] animate-[pulse_1.5s_ease-in-out_infinite]' 
              : 'bg-gradient-to-br from-emerald-400 to-green-600 border-green-300 shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-[pulse_3s_ease-in-out_infinite]' 
            } transition-all duration-300`}
          >
            <div className="absolute -right-6 -top-6 opacity-20 pointer-events-none">
              {stats.netProfit < 0 ? <ShieldAlert size={120} /> : <ShieldCheck size={120} />}
            </div>
            <div className="relative z-10 flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10">
                <Activity size={24} className="text-white" />
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-white/90">{t.netProfit}</p>
            </div>
            <div className="relative z-10">
              <h4 className="text-3xl font-black tracking-tight">{stats.netProfit.toLocaleString()} <span className="text-sm font-bold text-white/80">{t.currency}</span></h4>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {canView('sales') && (
          <div className={`${canView('products') ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col`}>
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-blue-600"/> {t.chartTitle}</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey={language === 'ar' ? 'nameAr' : language === 'en' ? 'nameEn' : 'nameFr'} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} 
                    dy={10} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey={t.salesLabel} fill="url(#colorUv)" radius={[6, 6, 0, 0]} barSize={45} />
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {canView('products') && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><AlertTriangle size={20} className="text-red-500" /> {t.stockAlerts}</h3>
            <div className="flex-1 overflow-auto pr-2 space-y-3 custom-scrollbar">
              {outOfStock.length === 0 && criticalStock.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <div className="p-4 bg-gray-50 rounded-full"><Package size={32} className="text-gray-300"/></div>
                  <span className="font-medium">{t.perfectStock}</span>
                </div>
              ) : (
                <>
                  {outOfStock.map(p => (<div key={p.id} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex justify-between items-center shadow-sm"><span className="font-bold text-gray-800 text-sm truncate pr-2">{p.name}</span><span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-md font-bold uppercase whitespace-nowrap">{t.outOfStock}</span></div>))}
                  {criticalStock.map(p => (<div key={p.id} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-lg flex justify-between items-center shadow-sm"><span className="font-bold text-gray-800 text-sm truncate pr-2">{p.name}</span><span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-md font-bold uppercase whitespace-nowrap">{t.lowStock} {p.stock_quantity}</span></div>))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}