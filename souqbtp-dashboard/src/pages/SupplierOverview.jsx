import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  DollarSign, ShoppingCart, Package, Users, 
  Wallet, CreditCard, Receipt, Landmark, 
  Activity, ShieldAlert, Truck, Loader2, Sparkles, ChevronRight,
  TrendingUp, AlertTriangle, Hammer, Factory
} from 'lucide-react';

const translations = {
  ar: {
    totalSales: 'إجمالي المبيعات', pendingOrders: 'الطلبات المعلقة',
    activeProducts: 'المنتجات النشطة', activeEmployees: 'الموظفون النشطون',
    cashBalance: 'الرصيد النقدي', customerDebts: 'ديون العملاء',
    totalExpenses: 'إجمالي المصاريف', taxSystem: 'النظام الجبائي (TVA)',
    netProfit: 'صافي ربح الشركة',
    aiAdvisor: 'المستشار الاستراتيجي الذكي',
    priceRadar: 'رادار الأسعار', logisticsOpt: 'مُحسّن اللوجستيك',
    inventoryValue: 'قيمة المخزون:', payroll: 'إجمالي الرواتب:',
    pendingVat: 'الضريبة واجبة الأداء', orders: 'طلبات', products: 'منتج', employees: 'موظف',
    currency: 'MAD',
    priceRadarDesc: 'تنبيه: زيادة وشيكة بنسبة 5.4٪ في أسعار الحديد. ستقوم المصانع الوطنية بتعديل الأسعار الأسبوع المقبل. ننصح بتأمين طلبياتك الآن لتوفير هامش الربح.',
    logisticsDesc: 'اقتراح ذكي: لديك 3 شحنات متجهة إلى مدينة طنجة. دمجها في شاحنة واحدة كبيرة سيوفر لك 1,200 درهم من تكاليف النقل الإجمالية اليوم.',
    executiveDashboard: 'لوحة القيادة التنفيذية',
    salesTrend: 'تطور الأداء المالي (6 أشهر)',
    revenue: 'الإيرادات', costs: 'التكاليف', margin: 'الهامش',
    smartAlerts: 'تنبيهات المخزون الذكية',
    runRateAlert: 'تنبيه نفاد وشيك', daysLeft: 'أيام متبقية',
    rawMaterialAlert: 'نقص المادة الخام', productionRisk: 'خطر توقف الإنتاج',
    actionOrder: 'إرسال طلب شراء', actionProduce: 'أمر إنتاج (OF)',
    cementDesc: 'سرعة مبيعات عالية. نفاذ المخزون متوقع يوم الجمعة.',
    sandDesc: 'نقص في المادة الخام لإنتاج "طوب خرساني 20x20".',
    orderSuccess: '✅ تم إرسال طلب الشراء للمورد بنجاح!',
    prodSuccess: '✅ تم إطلاق أمر الإنتاج وإرساله للورشة!'
  },
  fr: {
    totalSales: 'TOTAL VENTES', pendingOrders: 'COMMANDES EN ATTENTE',
    activeProducts: 'PRODUITS ACTIFS', activeEmployees: 'EMPLOYÉS ACTIFS',
    cashBalance: 'SOLDE DE TRÉSORERIE', customerDebts: 'DETTES CLIENTS',
    totalExpenses: 'DÉPENSES TOTALES', taxSystem: 'SYSTÈME FISCAL (TVA)',
    netProfit: 'BÉNÉFICE NET DE L\'ENTREPRISE',
    aiAdvisor: 'Conseiller Stratégique IA',
    priceRadar: 'Radar de Prix', logisticsOpt: 'Optimiseur Logistique',
    inventoryValue: 'Valeur du stock:', payroll: 'Masse salariale:',
    pendingVat: 'TVA due en attente', orders: 'Commandes', products: 'Produits', employees: 'Employés',
    currency: 'MAD',
    priceRadarDesc: 'Alerte : Hausse imminente de +5.4% sur l\'Acier. Les usines nationales vont ajuster les prix la semaine prochaine. Conseillons de sécuriser les commandes maintenant.',
    logisticsDesc: 'Suggestion Intelligente : Vous avez 3 expéditions vers Tanger. Les regrouper dans un seul camion vous fera économiser 1 200 MAD aujourd\'hui.',
    executiveDashboard: 'Tableau de Bord Exécutif',
    salesTrend: 'Évolution des Performances (6 Mois)',
    revenue: 'Revenus', costs: 'Coûts', margin: 'Marge',
    smartAlerts: 'Alertes de Stock Intelligentes',
    runRateAlert: 'Rupture Imminente', daysLeft: 'Jours restants',
    rawMaterialAlert: 'Manque Matière 1ère', productionRisk: 'Risque d\'arrêt de production',
    actionOrder: 'Commander l\'usine', actionProduce: 'Ordre de Fab. (OF)',
    cementDesc: 'Vitesse de vente élevée. Stock estimé à zéro ce Vendredi.',
    sandDesc: 'Manque de matière 1ère pour produire "Bloc Béton 20x20".',
    orderSuccess: '✅ Commande envoyée au fournisseur avec succès !',
    prodSuccess: '✅ Ordre de fabrication envoyé à l\'atelier !'
  },
  en: {
    totalSales: 'TOTAL SALES', pendingOrders: 'PENDING ORDERS',
    activeProducts: 'ACTIVE PRODUCTS', activeEmployees: 'ACTIVE EMPLOYEES',
    cashBalance: 'CASH BALANCE', customerDebts: 'CUSTOMER DEBTS',
    totalExpenses: 'TOTAL EXPENSES', taxSystem: 'TAX SYSTEM (VAT)',
    netProfit: 'COMPANY NET PROFIT',
    aiAdvisor: 'Strategic AI Advisor',
    priceRadar: 'Price Radar', logisticsOpt: 'Logistics Optimizer',
    inventoryValue: 'Inventory Value:', payroll: 'Payroll:',
    pendingVat: 'Pending VAT due', orders: 'Orders', products: 'Products', employees: 'Employees',
    currency: 'MAD',
    priceRadarDesc: 'Alert: Imminent +5.4% increase on Steel. National factories will adjust prices next week. Advise securing orders now to lock in margins.',
    logisticsDesc: 'Smart Suggestion: You have 3 shipments heading to Tangier. Consolidating them into one large truck will save you 1,200 MAD in overall transit costs today.',
    executiveDashboard: 'Executive Dashboard',
    salesTrend: 'Financial Performance Trend (6 Months)',
    revenue: 'Revenue', costs: 'Costs', margin: 'Margin',
    smartAlerts: 'Smart Stock Alerts',
    runRateAlert: 'Imminent Stockout', daysLeft: 'Days left',
    rawMaterialAlert: 'Raw Material Shortage', productionRisk: 'Production halt risk',
    actionOrder: 'Send Purchase Order', actionProduce: 'Production Order (PO)',
    cementDesc: 'High sales velocity. Stock estimated zero by Friday.',
    sandDesc: 'Raw material shortage to produce "Concrete Block 20x20".',
    orderSuccess: '✅ Purchase order sent to supplier successfully!',
    prodSuccess: '✅ Production order sent to workshop successfully!'
  }
};

export default function SupplierOverview() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];
  const isArabic = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    sales: 0, orders: 0, productsCount: 0, inventoryValue: 0,
    employeesCount: 0, payroll: 0, cash: 0, debts: 0, expenses: 0, vat: 0, netProfit: 0
  });

  // Action Buttons States
  const [ordering, setOrdering] = useState(false);
  const [producing, setProducing] = useState(false);

  useEffect(() => {
    if (supplier?.id) fetchDashboardData();
  }, [supplier]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const targetId = supplier.id;

      let totalSales = 0;
      const { data: docs } = await supabase.from('documents').select('total_amount').eq('owner_id', targetId).eq('type', 'Facture');
      const { data: marketOrders } = await supabase.from('marketplace_orders').select('total_amount').eq('supplier_id', targetId).in('order_status', ['delivered', 'shipped']);
      if (docs) docs.forEach(d => totalSales += Number(d.total_amount || 0));
      if (marketOrders) marketOrders.forEach(o => totalSales += Number(o.total_amount || 0));

      let pendingOrders = 0;
      const { data: b2bReq } = await supabase.from('supply_requests').select('id').eq('supplier_id', targetId).eq('status', 'pending');
      const { data: mOrders } = await supabase.from('marketplace_orders').select('id').eq('supplier_id', targetId).eq('order_status', 'pending');
      if (b2bReq) pendingOrders += b2bReq.length;
      if (mOrders) pendingOrders += mOrders.length;

      let productsCount = 0;
      let inventoryValue = 0;
      const { data: prods } = await supabase.from('products').select('stock_quantity, price').eq('supplier_id', targetId);
      if (prods) {
        prods.forEach(p => {
          if (p.stock_quantity > 0) {
            productsCount++;
            inventoryValue += (p.stock_quantity * p.price);
          }
        });
      }

      let employeesCount = 0;
      let payroll = 0;
      const { data: emps } = await supabase.from('employees').select('base_salary, primes_avances, retenues, status').eq('supplier_id', targetId);
      if (emps) {
        const activeEmps = emps.filter(e => e.status === 'Actif' || e.status === 'active');
        employeesCount = activeEmps.length;
        activeEmps.forEach(e => {
          payroll += (Number(e.base_salary || 0) + Number(e.primes_avances || 0) - Number(e.retenues || 0));
        });
      }

      let cash = 0;
      const { data: caisses } = await supabase.from('caisses').select('balance').eq('supplier_id', targetId);
      if (caisses) caisses.forEach(c => cash += Number(c.balance || 0));

      let debts = 0;
      const { data: clients } = await supabase.from('clients').select('total_debt').eq('supplier_id', targetId);
      if (clients) clients.forEach(c => debts += Number(c.total_debt || 0));

      let expenses = 0;
      const { data: exps } = await supabase.from('expenses').select('amount').eq('supplier_id', targetId);
      if (exps) exps.forEach(e => expenses += Number(e.amount || 0));

      const estimatedVat = (totalSales * 0.20) - (expenses * 0.20); 
      const netProfit = totalSales - expenses - payroll;

      setMetrics({
        sales: totalSales, orders: pendingOrders, productsCount, inventoryValue,
        employeesCount, payroll, cash, debts, expenses, vat: estimatedVat > 0 ? estimatedVat : 0, netProfit
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulated Action Handlers
  const handleOrder = () => {
    setOrdering(true);
    setTimeout(() => {
      setOrdering(false);
      alert(t.orderSuccess);
    }, 1500);
  };

  const handleProduce = () => {
    setProducing(true);
    setTimeout(() => {
      setProducing(false);
      alert(t.prodSuccess);
    }, 1500);
  };

  // Dynamic Chart Data with Translated Months
  const chartData = [
    { month: isArabic ? 'فبراير' : 'Fév', sales: 45000, costs: 30000 },
    { month: isArabic ? 'مارس' : 'Mar', sales: 52000, costs: 32000 },
    { month: isArabic ? 'أبريل' : 'Avr', sales: 48000, costs: 29000 },
    { month: isArabic ? 'ماي' : 'Mai', sales: 61000, costs: 35000 },
    { month: isArabic ? 'يونيو' : 'Juin', sales: 75000, costs: 40000 },
    { month: isArabic ? 'يوليوز' : 'Juil', sales: metrics.sales > 0 ? metrics.sales : 82000, costs: metrics.expenses > 0 ? metrics.expenses : 45000 },
  ];
  const maxChartValue = Math.max(...chartData.map(d => Math.max(d.sales, d.costs))) * 1.1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-blue-500" size={64} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans text-start" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* 📊 شبكة البطاقات العلوية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* المبيعات */}
        <div className="bg-[#4f46e5] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <DollarSign className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform" size={140} />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm text-white"><DollarSign size={24}/></div>
            <h3 className="text-white font-black tracking-widest text-sm">{t.totalSales}</h3>
          </div>
          <div className="relative z-10" dir="ltr">
            <span className="text-4xl font-black text-white">{metrics.sales.toLocaleString()}</span>
            <span className="text-sm text-blue-200 ml-2 font-bold">{t.currency}</span>
          </div>
        </div>

        {/* الطلبات المعلقة */}
        <div className="bg-[#10b981] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <ShoppingCart className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform" size={140} />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm text-white"><ShoppingCart size={24}/></div>
            <h3 className="text-white font-black tracking-widest text-sm">{t.pendingOrders}</h3>
          </div>
          <div className="relative z-10" dir="ltr">
            <span className="text-4xl font-black text-white">{metrics.orders.toLocaleString()}</span>
            <span className="text-sm text-emerald-100 ml-2 font-bold uppercase">{t.orders}</span>
          </div>
        </div>

        {/* المنتجات النشطة */}
        <div className="bg-[#06b6d4] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <Package className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform" size={140} />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm text-white"><Package size={24}/></div>
            <h3 className="text-white font-black tracking-widest text-sm">{t.activeProducts}</h3>
          </div>
          <div className="relative z-10 flex flex-col" dir="ltr">
            <div>
              <span className="text-4xl font-black text-white">{metrics.productsCount.toLocaleString()}</span>
              <span className="text-sm text-cyan-100 ml-2 font-bold uppercase">{t.products}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 text-xs font-bold text-cyan-50">
              {t.inventoryValue} {metrics.inventoryValue.toLocaleString()} {t.currency}
            </div>
          </div>
        </div>

        {/* الموظفين */}
        <div className="bg-[#d946ef] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <Users className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform" size={140} />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm text-white"><Users size={24}/></div>
            <h3 className="text-white font-black tracking-widest text-sm">{t.activeEmployees}</h3>
          </div>
          <div className="relative z-10 flex flex-col" dir="ltr">
            <div>
              <span className="text-4xl font-black text-white">{metrics.employeesCount.toLocaleString()}</span>
              <span className="text-sm text-purple-200 ml-2 font-bold uppercase">{t.employees}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 text-xs font-bold text-purple-50">
              {t.payroll} {metrics.payroll.toLocaleString()} {t.currency}
            </div>
          </div>
        </div>

        {/* الرصيد النقدي */}
        <div className="bg-[#334155] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <Wallet className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform" size={140} />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm text-slate-300"><Wallet size={24}/></div>
            <h3 className="text-slate-300 font-black tracking-widest text-sm">{t.cashBalance}</h3>
          </div>
          <div className="relative z-10" dir="ltr">
            <span className="text-4xl font-black text-white">{metrics.cash.toLocaleString()}</span>
            <span className="text-sm text-slate-400 ml-2 font-bold uppercase">{t.currency}</span>
          </div>
        </div>

        {/* ديون العملاء */}
        <div className="bg-[#f97316] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <CreditCard className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform" size={140} />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm text-white"><CreditCard size={24}/></div>
            <h3 className="text-white font-black tracking-widest text-sm">{t.customerDebts}</h3>
          </div>
          <div className="relative z-10" dir="ltr">
            <span className="text-4xl font-black text-white">{metrics.debts.toLocaleString()}</span>
            <span className="text-sm text-orange-200 ml-2 font-bold uppercase">{t.currency}</span>
          </div>
        </div>

        {/* إجمالي المصاريف */}
        <div className="bg-[#64748b] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <Receipt className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform" size={140} />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm text-gray-300"><Receipt size={24}/></div>
            <h3 className="text-gray-300 font-black tracking-widest text-sm">{t.totalExpenses}</h3>
          </div>
          <div className="relative z-10" dir="ltr">
            <span className="text-4xl font-black text-white">{metrics.expenses.toLocaleString()}</span>
            <span className="text-sm text-gray-400 ml-2 font-bold uppercase">{t.currency}</span>
          </div>
        </div>

        {/* النظام الضريبي */}
        <div className="bg-[#3b82f6] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <Landmark className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform" size={140} />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm text-white"><Landmark size={24}/></div>
            <h3 className="text-white font-black tracking-widest text-sm">{t.taxSystem}</h3>
          </div>
          <div className="relative z-10 flex flex-col" dir="ltr">
            <div>
              <span className="text-4xl font-black text-white">{metrics.vat.toLocaleString()}</span>
              <span className="text-sm text-blue-200 ml-2 font-bold uppercase">{t.currency}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 text-xs font-bold text-blue-100">
              {t.pendingVat}
            </div>
          </div>
        </div>
      </div>

      {/* 📉 صافي الربح الكبير */}
      <div className="w-full">
        <div className={`relative overflow-hidden p-8 rounded-3xl border-2 text-white flex flex-col justify-between shadow-2xl transition-all duration-300
          ${metrics.netProfit < 0 
            ? 'bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-[pulse_1.5s_ease-in-out_infinite]' 
            : 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 border-green-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-[pulse_3s_ease-in-out_infinite]' 
          }`}
        >
          <div className={`absolute ${isArabic ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 opacity-15 pointer-events-none`}>
            {metrics.netProfit < 0 ? <ShieldAlert size={160} /> : <Activity size={160} />}
          </div>
          
          <div className="relative z-10 flex items-center gap-5 mb-2">
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/10">
              <Activity size={36} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-white/80 mb-1">
                {t.netProfit}
              </p>
              <div className="flex items-baseline gap-3" dir="ltr">
                <h3 className="text-5xl md:text-7xl font-black tracking-tight text-white">
                  {metrics.netProfit.toLocaleString()}
                </h3>
                <span className="text-xl font-bold opacity-90 uppercase">
                  {t.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📈 Executive Widget (Sales Trend & Smart Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📉 Smart Sales Area Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="text-blue-500"/> {t.salesTrend}
            </h3>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-400"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> {t.revenue}</span>
              <span className="flex items-center gap-1.5 text-red-400"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div> {t.costs}</span>
            </div>
          </div>
          
          {/* CSS-based Area Chart (Ultra-fast, no libraries) */}
          <div className="h-64 flex items-end justify-between gap-2 relative border-b border-slate-800 pb-2">
            {chartData.map((data, index) => {
              const salesHeight = (data.sales / maxChartValue) * 100;
              const costsHeight = (data.costs / maxChartValue) * 100;
              const margin = data.sales - data.costs;
              return (
                <div key={index} className="relative w-full flex flex-col items-center justify-end h-full group">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 p-2 rounded-xl text-xs font-bold shadow-xl z-20 pointer-events-none whitespace-nowrap">
                    <span className="text-emerald-400">{t.margin}: +{margin.toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full flex justify-center items-end relative h-full">
                    <div className="w-full max-w-[40px] bg-gradient-to-t from-blue-900 to-blue-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity absolute bottom-0" style={{ height: `${salesHeight}%` }}></div>
                    <div className="w-full max-w-[40px] bg-gradient-to-t from-red-900/80 to-red-500/80 rounded-t-lg absolute bottom-0 z-10" style={{ height: `${costsHeight}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 mt-3 uppercase">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ⚠️ Smart Stock Alerts */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
            <AlertTriangle className="text-orange-500"/> {t.smartAlerts}
          </h3>
          
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {/* Run-rate Alert (Buy) */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 group transition-colors hover:bg-orange-500/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <h4 className="font-bold text-orange-400 text-sm">{t.runRateAlert}</h4>
                </div>
                <span className="text-xs font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md">4 {t.daysLeft}</span>
              </div>
              <p className="text-white font-black mb-3">Ciment Portland CPJ 45</p>
              <p className="text-xs text-slate-400 mb-4 font-medium">{t.cementDesc}</p>
              <button onClick={handleOrder} disabled={ordering} className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.3)] disabled:opacity-70">
                {ordering ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14}/>}
                {t.actionOrder}
              </button>
            </div>

            {/* Raw Material Alert (Produce) */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 group transition-colors hover:bg-red-500/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <h4 className="font-bold text-red-400 text-sm">{t.rawMaterialAlert}</h4>
                </div>
                <span className="text-xs font-black text-red-500 bg-red-500/10 px-2 py-1 rounded-md">{t.productionRisk}</span>
              </div>
              <p className="text-white font-black mb-3">Sable de concassage</p>
              <p className="text-xs text-slate-400 mb-4 font-medium">{t.sandDesc}</p>
              <button onClick={handleProduce} disabled={producing} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-70">
                {producing ? <Loader2 size={14} className="animate-spin" /> : <Factory size={14}/>}
                {t.actionProduce}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 🤖 قسم المستشار الذكي المصغر */}
      <div>
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-blue-400"/> {t.aiAdvisor}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-slate-900 border border-red-500/20 rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <ShieldAlert className={`absolute ${isArabic ? 'left-[-20px]' : 'right-[-20px]'} bottom-[-20px] text-red-500/5`} size={150}/>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/10 p-2.5 rounded-xl text-red-400"><ShieldAlert size={20}/></div>
              <h4 className="font-bold text-white">{t.priceRadar}</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed relative z-10">
              {t.priceRadarDesc}
            </p>
          </div>

          <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <Truck className={`absolute ${isArabic ? 'left-[-20px]' : 'right-[-20px]'} bottom-[-20px] text-emerald-500/5`} size={150}/>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><Truck size={20}/></div>
              <h4 className="font-bold text-white">{t.logisticsOpt}</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed relative z-10">
              {t.logisticsDesc}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}