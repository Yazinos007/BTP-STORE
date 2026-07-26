import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  DollarSign, ShoppingCart, Package, Users, 
  Wallet, CreditCard, Receipt, Landmark, 
  Activity, ShieldAlert, Truck, Loader2, Sparkles, ChevronRight
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
    tanger: 'طنجة', casablanca: 'الدار البيضاء'
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
    tanger: 'Tanger', casablanca: 'Casablanca'
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
    tanger: 'Tangier', casablanca: 'Casablanca'
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

  useEffect(() => {
    if (supplier?.id) fetchDashboardData();
  }, [supplier]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const targetId = supplier.id;

      // 1. المبيعات (من فواتير B2B + الماركت بليس)
      let totalSales = 0;
      const { data: docs } = await supabase.from('documents').select('total_amount').eq('owner_id', targetId).eq('type', 'Facture');
      const { data: marketOrders } = await supabase.from('marketplace_orders').select('total_amount').eq('supplier_id', targetId).in('order_status', ['delivered', 'shipped']);
      if (docs) docs.forEach(d => totalSales += Number(d.total_amount || 0));
      if (marketOrders) marketOrders.forEach(o => totalSales += Number(o.total_amount || 0));

      // 2. الطلبات المعلقة (من B2B + الماركت بليس)
      let pendingOrders = 0;
      const { data: b2bReq } = await supabase.from('supply_requests').select('id').eq('supplier_id', targetId).eq('status', 'pending');
      const { data: mOrders } = await supabase.from('marketplace_orders').select('id').eq('supplier_id', targetId).eq('order_status', 'pending');
      if (b2bReq) pendingOrders += b2bReq.length;
      if (mOrders) pendingOrders += mOrders.length;

      // 3. المنتجات والمخزون
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

      // 4. الموظفين
      let employeesCount = 0;
      let payroll = 0;
      const { data: emps } = await supabase.from('employees').select('salary, base_salary').eq('supplier_id', targetId);
      if (emps) {
        employeesCount = emps.length;
        emps.forEach(e => payroll += Number(e.salary || e.base_salary || 0));
      }

      // 5. الرصيد النقدي (الصناديق)
      let cash = 0;
      const { data: caisses } = await supabase.from('caisses').select('balance').eq('supplier_id', targetId);
      if (caisses) caisses.forEach(c => cash += Number(c.balance || 0));

      // 6. ديون العملاء
      let debts = 0;
      const { data: clients } = await supabase.from('clients').select('total_debt').eq('supplier_id', targetId);
      if (clients) clients.forEach(c => debts += Number(c.total_debt || 0));

      // 7. إجمالي المصاريف
      let expenses = 0;
      const { data: exps } = await supabase.from('expenses').select('amount').eq('supplier_id', targetId);
      if (exps) exps.forEach(e => expenses += Number(e.amount || 0));

      // 8. حسابات الضريبة والربح الصافي
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