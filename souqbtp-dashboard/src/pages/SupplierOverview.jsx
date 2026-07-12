import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  TrendingUp, Users, Package, DollarSign, Sparkles, AlertTriangle, 
  ShieldAlert, ShieldCheck, Truck, ChevronRight, ArrowRightLeft, 
  Loader2, Briefcase, Receipt, Wallet, CreditCard, ShoppingCart, Activity 
} from 'lucide-react';

export default function SupplierOverview() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ 
    revenue: 0, activeOrders: 0, clientsCount: 0, stockValue: 0, 
    totalProducts: 0, totalExpenses: 0, activeEmployees: 0, payroll: 0,
    debts: 0, netProfit: 0, cashBalance: 0
  });

  useEffect(() => {
    if (supplier?.id) fetchDashboardData();
  }, [supplier]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      // 1. المنتجات والمخزون
      const { data: myProducts } = await supabase.from('products').select('*').eq('supplier_id', targetId);
      const myProductNames = new Set(myProducts?.map(p => (p.name || '').replace(/\s+/g, '').toLowerCase()) || []);
      const stockVal = (myProducts || []).reduce((sum, p) => sum + (Number(p.price || p.sale_price || 0) * Number(p.stock_quantity || 0)), 0);

      // 2. المداخيل (تتبع بالاسم لضمان الدقة للمورد)
      const { data: allInvoices } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
      const myInvoices = (allInvoices || []).filter(inv => 
        (inv.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );
      const totalRevenue = myInvoices.reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0);

      // 3. الطلبات قيد المعالجة (طلبات الجملة B2B)
      const { data: allRequests } = await supabase.from('supply_requests').select('merchant_id, items, status');
      const myRequests = (allRequests || []).filter(req => 
        (req.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );
      const activeOrders = myRequests.filter(req => req.status !== 'completed' && req.status !== 'cancelled').length;
      const uniqueClients = new Set(myRequests.map(req => req.merchant_id).filter(id => id));

      // 4. الموارد البشرية وكتلة الأجور
      const { data: employees } = await supabase.from('employees').select('base_salary, primes_avances, retenues, status').eq('supplier_id', targetId);
      const activeEmps = (employees || []).filter(e => e.status === 'Actif' || e.status === 'active');
      const totalPayroll = activeEmps.reduce((sum, e) => sum + (Number(e.base_salary || 0) + Number(e.primes_avances || 0) - Number(e.retenues || 0)), 0);

      // 5. المصاريف
      const { data: expenses } = await supabase.from('expenses').select('amount').eq('supplier_id', targetId);
      const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
      
      // 6. الديون
      const { data: clients } = await supabase.from('clients').select('total_debt').eq('supplier_id', targetId);
      const totalDebts = (clients || []).reduce((sum, c) => sum + Number(c.total_debt || 0), 0);

      const calculatedNetProfit = totalRevenue - totalExpenses - totalPayroll;
      const calculatedCash = (totalRevenue - totalExpenses) > 0 ? (totalRevenue - totalExpenses) : 0;

      setStats({
        revenue: totalRevenue, activeOrders, clientsCount: uniqueClients.size, stockValue: stockVal,
        totalProducts: myProducts?.length || 0, totalExpenses, activeEmployees: activeEmps.length,
        payroll: totalPayroll, debts: totalDebts, netProfit: calculatedNetProfit, cashBalance: calculatedCash
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
      
      {/* 🚀 الصف الأول: البطاقات العلوية المدمجة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={language === 'fr' ? "Chiffre d'Affaires" : 'إجمالي المداخيل'} 
          value={stats.revenue.toLocaleString()} 
          icon={DollarSign} color="blue" suffix="MAD"
        />
        <StatCard 
          title={language === 'fr' ? "Commandes en cours" : 'طلبات قيد المعالجة'} 
          value={stats.activeOrders} 
          icon={ShoppingCart} color="emerald" suffix={language === 'fr' ? "Cmds" : "طلب"}
        />
        <StatCard 
          title={language === 'fr' ? "Produits Actifs" : 'المنتجات النشطة'} 
          value={stats.totalProducts} 
          subValue={`${language === 'fr' ? "Valeur Stock" : "قيمة المخزون"}: ${stats.stockValue.toLocaleString()} MAD`} 
          icon={Package} color="teal" suffix={language === 'fr' ? "Prods" : "منتج"}
        />
        <StatCard 
          title={language === 'fr' ? "Employés Actifs" : 'الموظفون النشطون'} 
          value={stats.activeEmployees} 
          subValue={`${language === 'fr' ? "Masse Salariale" : "كتلة الأجور"}: ${stats.payroll.toLocaleString()} MAD`} 
          icon={Briefcase} color="purple" suffix={language === 'fr' ? "Emp" : "موظف"}
        />
      </div>

      {/* 🚀 الصف الثاني: البطاقات المالية والنتيجة الصافية النابضة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={language === 'fr' ? "Solde des Caisses" : 'رصيد الصناديق'} 
          value={stats.cashBalance.toLocaleString()} 
          icon={Wallet} color="slate" suffix="MAD"
        />
        <StatCard 
          title={language === 'fr' ? "Créances Clients" : 'ديون العملاء'} 
          value={stats.debts.toLocaleString()} 
          icon={CreditCard} color="orange" suffix="MAD"
        />
        <StatCard 
          title={language === 'fr' ? "Total des Charges" : 'إجمالي المصاريف'} 
          value={stats.totalExpenses.toLocaleString()} 
          icon={Receipt} color="gray" suffix="MAD"
        />
        
        {/* 🚨 بطاقة النتيجة الصافية (النبض الذكي) */}
        <div className={`relative overflow-hidden p-6 rounded-3xl border-2 text-white flex flex-col justify-between
          ${stats.netProfit < 0 
            ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400 shadow-[0_0_25px_rgba(220,38,38,0.6)] animate-[pulse_1.5s_ease-in-out_infinite]' 
            : 'bg-gradient-to-br from-emerald-500 to-green-700 border-green-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-[pulse_3s_ease-in-out_infinite]' 
          } transition-all duration-300`}
        >
          <div className="absolute -right-6 -top-6 opacity-20 pointer-events-none">
            {stats.netProfit < 0 ? <ShieldAlert size={120} /> : <ShieldCheck size={120} />}
          </div>
          <div className="relative z-10 flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10">
              <Activity size={24} className="text-white" />
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-white/90">
              {language === 'fr' ? "Résultat Net" : 'النتيجة الصافية'}
            </p>
          </div>
          <div className="relative z-10">
            <h4 className="text-3xl font-black tracking-tight">{stats.netProfit.toLocaleString()} <span className="text-sm font-bold text-white/80">MAD</span></h4>
          </div>
        </div>
      </div>

      {/* 🔮 القسم الأوسط: المستشار الاستراتيجي الخارق (IA Advisor) - لم يتم المساس به */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Sparkles className="text-blue-400 animate-pulse" size={28} />
          <h3 className="text-2xl font-black text-white">
            {language === 'fr' ? 'Conseiller Stratégique (IA)' : 'المستشار الاستراتيجي الذكي'}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* كرت التحوط السعري */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl group transition-all hover:border-red-500/30">
            <div className="absolute -right-4 -top-4 opacity-10 text-red-500"><ShieldAlert size={120} /></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20"><AlertTriangle size={24} /></div>
              <h4 className="text-xl font-bold text-white">{language === 'fr' ? 'Radar des Prix' : 'رادار الأسعار'}</h4>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed mb-6">
              {language === 'fr' 
                ? 'Alerte : Hausse imminente de +5.4% sur l\'Acier. Les usines nationales vont ajuster les prix sous 48h.' 
                : 'تنبيه : ارتفاع وشيك بنسبة +5.4% في أسعار الحديد. المصانع الوطنية ستحدث الأسعار خلال 48 ساعة.'}
            </p>
            <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl mb-6">
              <div>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{language === 'fr' ? 'Économie Prévue' : 'توفير متوقع'}</p>
                <p className="text-2xl font-black text-emerald-400">85,000 MAD</p>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all">
                {language === 'fr' ? 'Geler les Prix' : 'تجميد الأسعار'}
              </button>
            </div>
          </div>

          {/* كرت اللوجستيك التشاركي */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl group transition-all hover:border-emerald-500/30">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Truck size={120} /></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><Truck size={24} /></div>
              <h4 className="text-xl font-bold text-white">{language === 'fr' ? 'Optimiseur Logistique' : 'محسن اللوجستيك'}</h4>
            </div>
            <div className="flex items-center gap-3 mb-4 font-black text-white text-sm bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 w-fit">
               <span>{language === 'fr' ? 'Tanger' : 'طنجة'}</span> <ArrowRightLeft size={16} className="text-blue-400" /> <span>{language === 'fr' ? 'Casablanca' : 'الدار البيضاء'}</span>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed mb-6">
              {language === 'fr' 
                ? 'Opportunité : Votre camion rentre à vide de Tanger. Un partenaire a une charge pour le retour.' 
                : 'فرصة : شاحنتك تعود فارغة من طنجة. شريك لديه شحنة جاهزة لنفس خط العودة.'}
            </p>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
              {language === 'fr' ? 'Confirmer le Partage' : 'تأكيد مشاركة الشحنة'} <ChevronRight size={18} className={language === 'ar' ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون البطاقة الإحصائية الفرعي المعدل لدعم البيانات الفرعية (subValue)
function StatCard({ title, value, subValue, icon: Icon, color, suffix }) {
  const colors = {
    blue: "from-blue-600 to-indigo-700 shadow-blue-500/20",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
    teal: "from-teal-500 to-cyan-600 shadow-teal-500/20",
    indigo: "from-indigo-500 to-blue-600 shadow-indigo-500/20",
    purple: "from-purple-600 to-fuchsia-600 shadow-purple-500/20",
    orange: "from-orange-500 to-amber-600 shadow-orange-500/20",
    slate: "from-slate-700 to-slate-900 shadow-slate-800/20",
    gray: "from-gray-500 to-gray-700 shadow-gray-500/20"
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-3xl shadow-xl relative overflow-hidden group transition-all hover:-translate-y-1 flex flex-col justify-between`}>
      <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform">
        <Icon size={130} />
      </div>
      <div className="relative z-10 flex items-center gap-4 mb-3">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <p className="text-white/90 text-sm font-black uppercase tracking-wider">{title}</p>
      </div>
      <div className="relative z-10">
        <h4 className="text-3xl font-black text-white">{value} <span className="text-sm font-bold text-white/70">{suffix}</span></h4>
        {subValue && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs font-bold text-white/90">{subValue}</p>
          </div>
        )}
      </div>
    </div>
  );
}