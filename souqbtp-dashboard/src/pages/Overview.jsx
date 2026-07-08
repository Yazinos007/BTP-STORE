import { useEffect, useState, useMemo } from 'react';
import useSupplierStore from '../store/useSupplierStore';
import useProductStore from '../store/useProductStore';
import useOrderStore from '../store/useOrderStore';
import useClientStore from '../store/useClientStore';
import useExpenseStore from '../store/useExpenseStore';
import useHRStore from '../store/useHRStore';
import useSettingsStore from '../store/useSettingsStore';
import { Package, ShoppingCart, Wallet, TrendingUp, AlertTriangle, CreditCard, Receipt, Briefcase, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SmartAIAssistant from '../components/SmartAIAssistant';

const translations = {
  ar: {
    title: 'نظرة عامة والذكاء الاصطناعي', subtitle: 'تحليلات، تنبؤات ذكية، وملخص لأداء متجرك.',
    activeProds: 'المنتجات النشطة', prodUnit: 'منتج', inventory: 'قيمة المخزون', currency: 'درهم',
    activeOrders: 'طلبات قيد المعالجة', orderUnit: 'طلب', revenue: 'إجمالي المبيعات',
    debts: 'ديون العملاء', expenses: 'إجمالي المصاريف', hr: 'الموظفين النشطين', empUnit: 'موظف',
    chartTitle: 'تطور المبيعات (الـ 6 أشهر الأخيرة)', stockAlerts: 'تنبيهات المخزون', outOfStock: 'نفد تماماً',
    lowStock: 'باقي', perfectStock: 'مخزونك في حالة ممتازة!',
  },
  fr: {
    title: 'Vue d\'ensemble & IA', subtitle: 'Analyses, prévisions intelligentes et performances.',
    activeProds: 'Produits Actifs', prodUnit: 'Produits', inventory: 'Valeur du Stock', currency: 'MAD',
    activeOrders: 'Commandes en cours', orderUnit: 'Commandes', revenue: 'Chiffre d\'Affaires',
    debts: 'Créances Clients', expenses: 'Total des Charges', hr: 'Employés Actifs', empUnit: 'Employés',
    chartTitle: 'Évolution des Ventes (6 derniers mois)', stockAlerts: 'Alertes de Stock', outOfStock: 'Rupture',
    lowStock: 'Reste', perfectStock: 'Votre stock est en parfait état !',
  }
};

export default function Overview() {
  const { supplier } = useSupplierStore();
  const { products, fetchProducts, isLoading: isProductsLoading } = useProductStore();
  const { orders, fetchOrders } = useOrderStore();
  const { clients, fetchClients } = useClientStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { employees, fetchEmployees } = useHRStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [stats, setStats] = useState({ totalProducts: 0, inventoryValue: 0, activeOrders: 0, totalRevenue: 0, totalDebts: 0, totalExpenses: 0, activeEmployees: 0 });

  // 🛡️ استخراج دور وصلاحيات المستخدم الحالي بأمان
  const role = supplier?.role || 'admin';
  const perms = supplier?.permissions || { sales: true, products: true, invoices: true, accounting: true, hr: true };
  const canView = (permission) => role === 'admin' || perms[permission];

  useEffect(() => {
    if (!supplier) return; 

    if (canView('products')) fetchProducts();
    if (canView('sales')) { fetchOrders(); fetchClients(); }
    if (canView('accounting')) fetchExpenses();
    if (canView('hr')) fetchEmployees();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier?.id]); 

  useEffect(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeClients = Array.isArray(clients) ? clients : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const safeEmployees = Array.isArray(employees) ? employees : [];

    const totalVal = safeProducts.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock_quantity)), 0);
    const activeOrds = safeOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const revenue = safeOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount), 0);
    const debts = safeClients.reduce((sum, c) => sum + Number(c.total_debt || 0), 0);
    const totalExp = safeExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const activeEmp = safeEmployees.filter(e => e.status === 'Actif' || e.status === 'active').length;

    setStats({ 
      totalProducts: safeProducts.length, inventoryValue: totalVal, 
      activeOrders: activeOrds, totalRevenue: revenue,
      totalDebts: debts, totalExpenses: totalExp, activeEmployees: activeEmp
    });
  }, [products, orders, clients, expenses, employees]);

  const dynamicChartData = useMemo(() => {
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
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
        مبيعات: monthRevenue,
      });
    }
    return data;
  }, [orders]);

  const safeProducts = Array.isArray(products) ? products : [];
  const criticalStock = safeProducts.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0);
  const outOfStock = safeProducts.filter(p => p.stock_quantity === 0);

  const StatCard = ({ title, value, icon: Icon, bgGradient, suffix = '' }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-6 -top-6 opacity-20 pointer-events-none"><Icon size={120} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={28} className="text-white" /></div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <h4 className="text-3xl font-black tracking-tight">{value} <span className="text-sm font-normal text-white/70">{suffix}</span></h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          <Activity className="text-blue-600" size={32} /> {t.title}
        </h2>
        <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
      </div>

      {/* 🚀 المساعد الذكي الجديد (يظهر فقط لمن لديه صلاحية المنتجات) */}
      {canView('products') && (
        <SmartAIAssistant />
      )}

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
        {canView('products') && (
          <>
            <StatCard title={t.activeProds} value={isProductsLoading ? '...' : stats.totalProducts} icon={Package} bgGradient="bg-gradient-to-br from-blue-700 to-blue-500" suffix={t.prodUnit} />
            <StatCard title={t.inventory} value={isProductsLoading ? '...' : stats.inventoryValue.toLocaleString()} icon={Wallet} bgGradient="bg-gradient-to-br from-orange-600 to-orange-400" suffix={t.currency} />
          </>
        )}
        {canView('sales') && (
          <>
            <StatCard title={t.activeOrders} value={stats.activeOrders} icon={ShoppingCart} bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-400" suffix={t.orderUnit} />
            <StatCard title={t.revenue} value={stats.totalRevenue.toLocaleString()} icon={TrendingUp} bgGradient="bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500" suffix={t.currency} />
            <StatCard title={t.debts} value={stats.totalDebts.toLocaleString()} icon={CreditCard} bgGradient="bg-gradient-to-br from-red-600 to-rose-400" suffix={t.currency} />
          </>
        )}
        {canView('accounting') && (
          <StatCard title={t.expenses} value={stats.totalExpenses.toLocaleString()} icon={Receipt} bgGradient="bg-gradient-to-br from-gray-700 to-gray-500" suffix={t.currency} />
        )}
        {canView('hr') && (
          <StatCard title={t.hr} value={stats.activeEmployees} icon={Briefcase} bgGradient="bg-gradient-to-br from-purple-700 to-purple-500" suffix={t.empUnit} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* رسم بياني للمبيعات */}
        {canView('sales') && (
          <div className={`${canView('products') ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col`}>
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-blue-600"/> {t.chartTitle}</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey={language === 'ar' ? 'nameAr' : 'nameFr'} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="مبيعات" fill="url(#colorUv)" radius={[6, 6, 0, 0]} barSize={45} />
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

        {/* تنبيهات المخزون */}
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