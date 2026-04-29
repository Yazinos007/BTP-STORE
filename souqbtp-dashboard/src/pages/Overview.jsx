import { useEffect, useState, useMemo } from 'react';
import useSupplierStore from '../store/useSupplierStore';
import useProductStore from '../store/useProductStore';
import useOrderStore from '../store/useOrderStore';
import useClientStore from '../store/useClientStore';
import useExpenseStore from '../store/useExpenseStore';
import useHRStore from '../store/useHRStore';
import useSettingsStore from '../store/useSettingsStore';
import { Package, ShoppingCart, Wallet, TrendingUp, TrendingDown, AlertTriangle, CreditCard, Receipt, Briefcase, Sparkles, BrainCircuit, ArrowRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const translations = {
  ar: {
    title: 'نظرة عامة والذكاء الاصطناعي', subtitle: 'تحليلات، تنبؤات ذكية، وملخص لأداء متجرك.',
    activeProds: 'المنتجات النشطة', prodUnit: 'منتج', inventory: 'قيمة المخزون', currency: 'درهم',
    activeOrders: 'طلبات قيد المعالجة', orderUnit: 'طلب', revenue: 'إجمالي المبيعات',
    debts: 'ديون العملاء', expenses: 'إجمالي المصاريف', hr: 'الموظفين النشطين', empUnit: 'موظف',
    chartTitle: 'تطور المبيعات (الـ 6 أشهر الأخيرة)', stockAlerts: 'تنبيهات المخزون', outOfStock: 'نفد تماماً',
    lowStock: 'باقي', perfectStock: 'مخزونك في حالة ممتازة!',
    aiTitle: 'مساعد SouqBTP الذكي', aiDesc: 'تنبؤات مبنية على تحليل أسعار السوق الحالية.',
    buyNow: 'تجهيز أمر شراء الآن', ignore: 'تجاهل'
  },
  fr: {
    title: 'Vue d\'ensemble & IA', subtitle: 'Analyses, prévisions intelligentes et performances.',
    activeProds: 'Produits Actifs', prodUnit: 'Produits', inventory: 'Valeur du Stock', currency: 'MAD',
    activeOrders: 'Commandes en cours', orderUnit: 'Commandes', revenue: 'Chiffre d\'Affaires',
    debts: 'Créances Clients', expenses: 'Total des Charges', hr: 'Employés Actifs', empUnit: 'Employés',
    chartTitle: 'Évolution des Ventes (6 derniers mois)', stockAlerts: 'Alertes de Stock', outOfStock: 'Rupture',
    lowStock: 'Reste', perfectStock: 'Votre stock est en parfait état !',
    aiTitle: 'Assistant Intelligent SouqBTP', aiDesc: 'Prévisions basées sur l\'analyse du marché en temps réel.',
    buyNow: 'Générer Bon de Commande', ignore: 'Ignorer'
  }
};

const mockAiInsights = [
  {
    id: 1, type: 'warning', icon: TrendingUp,
    titleAr: 'تنبيه: ارتفاع وشيك في أسعار الحديد', titleFr: 'Alerte : Hausse imminente du prix du Fer',
    messageAr: 'تحليلات بورصة المعادن تشير إلى ارتفاع مرتقب بنسبة 4% في سعر "الحديد 12mm" الأسبوع القادم.',
    messageFr: 'Les analyses du marché indiquent une hausse de 4% du prix du Fer 12mm la semaine prochaine.',
    actionAr: 'شراء كمية استباقية', actionFr: 'Acheter maintenant'
  },
  {
    id: 2, type: 'success', icon: TrendingDown,
    titleAr: 'فرصة: انخفاض سعر الإسمنت', titleFr: 'Opportunité : Baisse du prix du Ciment',
    messageAr: 'سعر تسليم المصنع لـ "إسمنت CPJ 45" انخفض اليوم بـ 1.5 درهم للكيس. فرصة ممتازة لرفع هامش الربح.',
    messageFr: 'Le prix usine du Ciment CPJ 45 a baissé de 1.5 MAD/Sac aujourd\'hui. Excellente opportunité.',
    actionAr: 'استغلال الفرصة والتسوق', actionFr: 'Contacter le fournisseur'
  }
];

export default function Overview() {
  const { supplier } = useSupplierStore();
  const { products, fetchProducts, isLoading: isProductsLoading } = useProductStore();
  const { orders, fetchOrders } = useOrderStore();
  const { clients, fetchClients } = useClientStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { employees, fetchEmployees } = useHRStore();
  const { language } = useSettingsStore();
  const t = translations[language];
  const navigate = useNavigate();

  const [activeInsights, setActiveInsights] = useState(mockAiInsights);
  const [stats, setStats] = useState({ totalProducts: 0, inventoryValue: 0, activeOrders: 0, totalRevenue: 0, totalDebts: 0, totalExpenses: 0, activeEmployees: 0 });

  // 🛡️ استخراج دور وصلاحيات المستخدم الحالي بأمان
  const role = supplier?.role || 'admin';
  const perms = supplier?.permissions || { sales: true, products: true, invoices: true, accounting: true, hr: true };
  const canView = (permission) => role === 'admin' || perms[permission];

  // 🛑 إصلاح الحلقة اللانهائية (Infinite Loop) هنا!
  useEffect(() => {
    if (!supplier) return; // انتظر حتى يتم تحميل بيانات الشركة

    if (canView('products')) fetchProducts();
    if (canView('sales')) { fetchOrders(); fetchClients(); }
    if (canView('accounting')) fetchExpenses();
    if (canView('hr')) fetchEmployees();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier?.id]); // نعتمد فقط على ID الشركة لمنع إعادة التحميل الجنوني

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

  const dismissInsight = (id) => setActiveInsights(activeInsights.filter(insight => insight.id !== id));
  const handleSmartAction = () => navigate('/purchases');

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

      {canView('products') && activeInsights.length > 0 && (
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-1 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[23px] p-6 sm:p-8 relative z-10 border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <BrainCircuit size={28} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  {t.aiTitle} <Sparkles size={18} className="text-yellow-400" />
                </h3>
                <p className="text-blue-200/60 font-medium text-sm mt-1">{t.aiDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activeInsights.map(insight => {
                const Icon = insight.icon;
                const isWarning = insight.type === 'warning';
                return (
                  <div key={insight.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${isWarning ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          <Icon size={20} />
                        </div>
                        <span className="flex h-3 w-3 relative">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWarning ? 'bg-orange-400' : 'bg-emerald-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${isWarning ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-lg mb-2">{language === 'ar' ? insight.titleAr : insight.titleFr}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {language === 'ar' ? insight.messageAr : insight.messageFr}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <button onClick={handleSmartAction} className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isWarning ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/20' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'}`}>
                        {language === 'ar' ? insight.actionAr : insight.actionFr} <ArrowRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                      </button>
                      <button onClick={() => dismissInsight(insight.id)} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl transition-colors">
                        {t.ignore}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        {canView('sales') && (
          <div className={`${canView('products') ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col`}>
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-blue-600"/> {t.chartTitle}</h3>
            <div className="flex-1 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
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