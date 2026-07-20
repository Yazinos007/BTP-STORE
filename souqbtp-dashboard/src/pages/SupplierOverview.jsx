import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  Users, Package, DollarSign, Sparkles, AlertTriangle, 
  ShieldAlert, ShieldCheck, Truck, ChevronRight, ArrowRightLeft, 
  Loader2, Briefcase, Receipt, CreditCard, ShoppingCart, Activity, Landmark, Wallet
} from 'lucide-react';

const translations = {
  ar: {
    revenue: 'إجمالي المبيعات',
    activeOrders: 'طلبات قيد المعالجة',
    activeProducts: 'المنتجات النشطة',
    stockValue: 'قيمة المخزون',
    activeEmployees: 'الموظفون النشطون',
    payroll: 'كتلة الأجور',
    cashBalance: 'رصيد الصناديق',
    debts: 'ديون العملاء',
    totalExpenses: 'إجمالي المصاريف',
    fiscalSystem: 'النظام الجبائي (TVA)',
    tvaPending: 'TVA واجبة الأداء قيد الانتظار',
    netProfitTitle: 'النتيجة الصافية لأداء الشركة',
    advisorTitle: 'المستشار الاستراتيجي الذكي',
    priceRadar: 'رادار الأسعار',
    priceRadarDesc: 'تنبيه : ارتفاع وشيك بنسبة +5.4% في أسعار الحديد. المصانع الوطنية ستحدث الأسعار خلال 48 ساعة.',
    expectedSavings: 'توفير متوقع',
    freezePrices: 'تجميد الأسعار',
    logisticsOpt: 'محسن اللوجستيك',
    tanger: 'طنجة',
    casablanca: 'الدار البيضاء',
    logisticsDesc: 'فرصة : شاحنتك تعود فارغة من طنجة. شريك لديه شحنة جاهزة لنفس خط العودة.',
    confirmShare: 'تأكيد مشاركة الشحنة',
    currency: 'درهم',
    cmdUnit: 'طلب',
    prodUnit: 'منتج',
    empUnit: 'موظف'
  },
  fr: {
    revenue: "Chiffre d'Affaires",
    activeOrders: 'Commandes en cours',
    activeProducts: 'Produits Actifs',
    stockValue: 'Valeur Stock',
    activeEmployees: 'Employés Actifs',
    payroll: 'Masse Salariale',
    cashBalance: 'Solde des Caisses',
    debts: 'Créances Clients',
    totalExpenses: 'Total des Charges',
    fiscalSystem: 'Système Fiscal (TVA)',
    tvaPending: 'TVA due en attente',
    netProfitTitle: "RÉSULTAT NET DE L'ENTREPRISE",
    advisorTitle: 'Conseiller Stratégique (IA)',
    priceRadar: 'Radar des Prix',
    priceRadarDesc: 'Alerte : Hausse imminente de +5.4% sur l\'Acier. Les usines nationales vont ajuster les prix sous 48h.',
    expectedSavings: 'Économie Prévue',
    freezePrices: 'Geler les prix',
    logisticsOpt: 'Optimiseur Logistique',
    tanger: 'Tanger',
    casablanca: 'Casablanca',
    logisticsDesc: 'Opportunité : Votre camion rentre à vide de Tanger. Un partenaire a une charge pour le retour.',
    confirmShare: 'Confirmer le Partage',
    currency: 'MAD',
    cmdUnit: 'Cmds',
    prodUnit: 'Prods',
    empUnit: 'Emp'
  },
  en: {
    revenue: 'Total Sales',
    activeOrders: 'Pending Orders',
    activeProducts: 'Active Products',
    stockValue: 'Inventory Value',
    activeEmployees: 'Active Employees',
    payroll: 'Payroll',
    cashBalance: 'Cash Balance',
    debts: 'Customer Debts',
    totalExpenses: 'Total Expenses',
    fiscalSystem: 'Tax System (VAT)',
    tvaPending: 'Pending VAT due',
    netProfitTitle: 'COMPANY NET PROFIT',
    advisorTitle: 'Strategic AI Advisor',
    priceRadar: 'Price Radar',
    priceRadarDesc: 'Alert: Imminent +5.4% increase on Steel. National factories will adjust prices within 48 hours.',
    expectedSavings: 'Expected Savings',
    freezePrices: 'Freeze Prices',
    logisticsOpt: 'Logistics Optimizer',
    tanger: 'Tangier',
    casablanca: 'Casablanca',
    logisticsDesc: 'Opportunity: Your truck is returning empty from Tangier. A partner has a load for the return trip.',
    confirmShare: 'Confirm Sharing',
    currency: 'MAD',
    cmdUnit: 'Orders',
    prodUnit: 'Products',
    empUnit: 'Employees'
  }
};

export default function SupplierOverview() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  // 🛡️ الترياق السحري للترجمة
  const t = translations[language] || translations['fr'];
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ 
    revenue: 0, activeOrders: 0, clientsCount: 0, stockValue: 0, 
    totalProducts: 0, totalExpenses: 0, activeEmployees: 0, payroll: 0,
    debts: 0, netProfit: 0, cashBalance: 0, tvaDue: 0
  });

  useEffect(() => {
    if (supplier?.id) fetchDashboardData();
  }, [supplier]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      const { data: myProducts } = await supabase.from('products').select('*').eq('supplier_id', targetId);
      const myProductNames = new Set(myProducts?.map(p => (p.name || '').replace(/\s+/g, '').toLowerCase()) || []);
      const stockVal = (myProducts || []).reduce((sum, p) => sum + (Number(p.price || p.sale_price || 0) * Number(p.stock_quantity || 0)), 0);

      const { data: allInvoices } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
      const myInvoices = (allInvoices || []).filter(inv => 
        (inv.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );
      const totalRevenue = myInvoices.reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0);

      const { data: allRequests } = await supabase.from('supply_requests').select('merchant_id, items, status');
      const myRequests = (allRequests || []).filter(req => 
        (req.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );
      const activeOrders = myRequests.filter(req => req.status !== 'completed' && req.status !== 'cancelled').length;
      const uniqueClients = new Set(myRequests.map(req => req.merchant_id).filter(id => id));

      const { data: employees } = await supabase.from('employees').select('base_salary, primes_avances, retenues, status').eq('supplier_id', targetId);
      const activeEmps = (employees || []).filter(e => e.status === 'Actif' || e.status === 'active');
      const totalPayroll = activeEmps.reduce((sum, e) => sum + (Number(e.base_salary || 0) + Number(e.primes_avances || 0) - Number(e.retenues || 0)), 0);

      const { data: expenses } = await supabase.from('expenses').select('amount').eq('supplier_id', targetId);
      const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
      
      const { data: clients } = await supabase.from('clients').select('total_debt').eq('supplier_id', targetId);
      const totalDebts = (clients || []).reduce((sum, c) => sum + Number(c.total_debt || 0), 0);

      const { data: declarations } = await supabase.from('declarations').select('tva_due, status');
      const totalTvaDue = (declarations || []).filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.tva_due || 0), 0);

      const calculatedNetProfit = totalRevenue - totalExpenses - totalPayroll - totalTvaDue;
      const calculatedCash = (totalRevenue - totalExpenses) > 0 ? (totalRevenue - totalExpenses) : 0;

      setStats({
        revenue: totalRevenue, activeOrders, clientsCount: uniqueClients.size, stockValue: stockVal,
        totalProducts: myProducts?.length || 0, totalExpenses, activeEmployees: activeEmps.length,
        payroll: totalPayroll, debts: totalDebts, tvaDue: totalTvaDue, 
        netProfit: calculatedNetProfit, cashBalance: calculatedCash
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a]">
      <Loader2 size={40} className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 💼 الصف الأول */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t.revenue} 
          value={stats.revenue.toLocaleString()} 
          icon={DollarSign} color="blue" suffix={t.currency}
        />
        <StatCard 
          title={t.activeOrders} 
          value={stats.activeOrders} 
          icon={ShoppingCart} color="emerald" suffix={t.cmdUnit}
        />
        <StatCard 
          title={t.activeProducts} 
          value={stats.totalProducts} 
          subValue={`${t.stockValue}: ${stats.stockValue.toLocaleString()} ${t.currency}`} 
          icon={Package} color="teal" suffix={t.prodUnit}
        />
        <StatCard 
          title={t.activeEmployees} 
          value={stats.activeEmployees} 
          subValue={`${t.payroll}: ${stats.payroll.toLocaleString()} ${t.currency}`} 
          icon={Briefcase} color="purple" suffix={t.empUnit}
        />
      </div>

      {/* 🪙 الصف الثاني */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t.cashBalance} 
          value={stats.cashBalance.toLocaleString()} 
          icon={Wallet} color="slate" suffix={t.currency}
        />
        <StatCard 
          title={t.debts} 
          value={stats.debts.toLocaleString()} 
          icon={CreditCard} color="orange" suffix={t.currency}
        />
        <StatCard 
          title={t.totalExpenses} 
          value={stats.totalExpenses.toLocaleString()} 
          icon={Receipt} color="gray" suffix={t.currency}
        />
        <StatCard 
          title={t.fiscalSystem} 
          value={stats.tvaDue.toLocaleString()} 
          subValue={t.tvaPending}
          icon={Landmark} color="indigo" suffix={t.currency}
        />
      </div>

      {/* 🚨 الصف الثالث: بطاقة النتيجة الصافية */}
      <div className="w-full">
        <div className={`relative overflow-hidden p-8 rounded-3xl border-2 text-white flex flex-col justify-between shadow-2xl transition-all duration-300
          ${stats.netProfit < 0 
            ? 'bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-[pulse_1.5s_ease-in-out_infinite]' 
            : 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 border-green-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-[pulse_3s_ease-in-out_infinite]' 
          }`}
        >
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            {stats.netProfit < 0 ? <ShieldAlert size={160} /> : <ShieldCheck size={160} />}
          </div>
          <div className="relative z-10 flex items-center gap-4 mb-3">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/10">
              <Activity size={32} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/80">
                {t.netProfitTitle}
              </p>
              <h3 className="text-4xl font-black mt-1 tracking-tight" dir="ltr">
                {stats.netProfit.toLocaleString()} <span className="text-xl font-bold opacity-80 uppercase">{t.currency}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 🔮 القسم الأوسط: المستشار الاستراتيجي الخارق (IA Advisor) */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Sparkles className="text-blue-400 animate-pulse" size={28} />
          <h3 className="text-2xl font-black text-white">
            {t.advisorTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl group transition-all hover:border-red-500/30 text-start">
            <div className="absolute right-4 top-4 opacity-10 text-red-500"><ShieldAlert size={120} /></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20"><AlertTriangle size={24} /></div>
              <h4 className="text-xl font-bold text-white">{t.priceRadar}</h4>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed mb-6">
              {t.priceRadarDesc}
            </p>
            <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl mb-6">
              <div>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{t.expectedSavings}</p>
                <p className="text-2xl font-black text-emerald-400" dir="ltr">85,000 MAD</p>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg">
                {t.freezePrices}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl group transition-all hover:border-emerald-500/30 text-start">
            <div className="absolute right-4 top-4 opacity-10 text-emerald-500"><Truck size={120} /></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><Truck size={24} /></div>
              <h4 className="text-xl font-bold text-white">{t.logisticsOpt}</h4>
            </div>
            <div className="flex items-center gap-3 mb-4 font-black text-white text-sm bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 w-fit">
               <span>{t.tanger}</span> <ArrowRightLeft size={16} className="text-blue-400" /> <span>{t.casablanca}</span>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed mb-6">
              {t.logisticsDesc}
            </p>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg">
              {t.confirmShare} <ChevronRight size={18} className={language === 'ar' ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon: Icon, color, suffix }) {
  const colors = {
    blue: "from-blue-600 to-indigo-700 shadow-blue-500/20",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
    teal: "from-teal-500 to-cyan-600 shadow-teal-500/20",
    purple: "from-purple-600 to-fuchsia-600 shadow-purple-500/20",
    orange: "from-orange-500 to-amber-600 shadow-orange-500/20",
    slate: "from-slate-700 to-slate-900 shadow-slate-800/20",
    indigo: "from-indigo-600 to-blue-800 shadow-indigo-600/20",
    gray: "from-gray-500 to-gray-700 shadow-gray-500/20"
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-3xl shadow-xl relative overflow-hidden group transition-all hover:-translate-y-1 flex flex-col justify-between text-start`}>
      <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform">
        <Icon size={130} />
      </div>
      <div className="relative z-10 flex items-center gap-4 mb-3">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <p className="text-white/90 text-sm font-black uppercase tracking-wider">{title}</p>
      </div>
      <div className="relative z-10">
        <h4 className="text-2xl font-black text-white" dir="ltr">{value} <span className="text-xs font-bold text-white/70 uppercase">{suffix}</span></h4>
        {subValue && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <p className="text-[11px] font-bold text-white/90">{subValue}</p>
          </div>
        )}
      </div>
    </div>
  );
}