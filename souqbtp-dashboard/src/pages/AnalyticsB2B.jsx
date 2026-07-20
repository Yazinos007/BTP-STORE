import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { DollarSign, Package, Users, TrendingUp, Sparkles, Loader2 } from 'lucide-react';

const translations = {
  ar: {
    title: 'التحليلات الكبرى B2B',
    subtitle: 'تتبع أداءك ومبيعاتك في الوقت الفعلي بناءً على بياناتك الحقيقية.',
    revenue: 'رقم المعاملات',
    live: 'مباشر 🟢',
    orders: 'طلبات التزويد',
    totalProcessed: 'الإجمالي المعالج',
    clients: 'العملاء النشطون',
    merchants: 'تجار',
    topProducts: 'المنتجات الأكثر طلباً',
    noData: 'لا توجد بيانات كافية بعد',
    units: 'وحدة',
    aiAdvice: 'نصيحة استراتيجية (الذكاء الاصطناعي)',
    aiPart1: 'بناءً على طلباتك الأخيرة',
    aiPart2: 'نلاحظ إقبالاً كبيراً على',
    aiPart3: 'ننصحك بزيادة مخزون هذا المنتج للأسبوع القادم.',
    aiStart: 'ابدأ في استقبال الطلبات لكي يحلل الذكاء الاصطناعي أداءك.',
    fullReport: 'عرض التقرير المفصل',
    currency: 'DH'
  },
  fr: {
    title: 'Analytiques B2B',
    subtitle: 'Suivez vos performances et vos ventes en temps réel.',
    revenue: "Chiffre d'Affaires",
    live: 'En direct 🟢',
    orders: 'Commandes B2B',
    totalProcessed: 'Total traité',
    clients: 'Clients Actifs',
    merchants: 'Commerçants',
    topProducts: 'Produits les Plus Demandés',
    noData: 'Pas assez de données',
    units: 'Unités',
    aiAdvice: 'Conseil Stratégique (IA)',
    aiPart1: 'Basé sur vos',
    aiPart2: 'dernières commandes, nous remarquons une forte demande sur',
    aiPart3: 'Prévoyez une augmentation de stock pour ce produit.',
    aiStart: "Commencez à recevoir des commandes pour obtenir des conseils de l'IA.",
    fullReport: 'Voir le rapport complet',
    currency: 'MAD'
  },
  en: {
    title: 'B2B Analytics',
    subtitle: 'Track your performance and sales in real time based on actual data.',
    revenue: 'Total Revenue',
    live: 'Live 🟢',
    orders: 'B2B Orders',
    totalProcessed: 'Total processed',
    clients: 'Active Clients',
    merchants: 'Merchants',
    topProducts: 'Top Requested Products',
    noData: 'Not enough data yet',
    units: 'Units',
    aiAdvice: 'Strategic Advice (AI)',
    aiPart1: 'Based on your',
    aiPart2: 'recent orders, we notice high demand for',
    aiPart3: 'Consider increasing stock for this product next week.',
    aiStart: 'Start receiving orders for the AI to analyze your performance.',
    fullReport: 'View full report',
    currency: 'MAD'
  }
};

export default function AnalyticsB2B() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  // 🛡️ الترياق السحري
  const t = translations[language] || translations['fr'];
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, clientsCount: 0 });
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    if (supplier?.id) fetchAnalytics();
  }, [supplier]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      // 🎯 1. جلب أسماء المنتجات التي يملكها المورد وتنظيفها لمطابقتها في الفواتير
      const { data: myProducts } = await supabase.from('products').select('name').eq('supplier_id', targetId);
      const myProductNames = new Set(myProducts?.map(p => p.name.replace(/\s+/g, '').toLowerCase()) || []);

      // 🎯 2. جلب كل الفواتير والطلبات بدون تحديد المالك لتفادي مشكلة الـ ID
      const { data: allInvoices } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
      const { data: allRequests } = await supabase.from('supply_requests').select('merchant_id, items');

      // 🎯 3. الفلترة الذكية عن طريق "اسم المنتج" رداً على اختلاف الـ ID
      const myInvoices = (allInvoices || []).filter(inv => 
        (inv.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );
      
      const myRequests = (allRequests || []).filter(req => 
        (req.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );

      // 🎯 4. الحسابات الإجمالية للوحة التحكم بناءً على الفواتير المفلترة
      const revenue = myInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
      const ordersCount = myRequests.length;
      
      const uniqueClients = new Set(myRequests.map(req => req.merchant_id).filter(id => id));
      const clientsCount = uniqueClients.size;

      const productCounter = {};
      myRequests.forEach(req => {
        (req.items || []).forEach(item => {
          const cleanName = (item.name || '').replace(/\s+/g, '').toLowerCase();
          if (myProductNames.has(cleanName)) { // نحسب بضاعتنا فقط
             productCounter[item.name] = (productCounter[item.name] || 0) + Number(item.quantity);
          }
        });
      });

      const sortedProducts = Object.entries(productCounter)
        .map(([name, qty]) => ({ name, quantity: qty }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); 

      setStats({ revenue, ordersCount, clientsCount });
      setTopProducts(sortedProducts);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 size={40} className="animate-spin text-blue-500" /></div>;
  }

  const maxProductQty = topProducts.length > 0 ? topProducts[0].quantity : 1;

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <TrendingUp className="text-blue-500" size={32} />
          {t.title}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-emerald-500/20 p-3 rounded-full"><DollarSign className="text-emerald-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{t.revenue}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.revenue.toLocaleString()} <span className="text-sm">{t.currency}</span></h3>
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-bold">{t.live}</span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-blue-500/20 p-3 rounded-full"><Package className="text-blue-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{t.orders}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.ordersCount}</h3>
          <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold">{t.totalProcessed}</span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-purple-500/20 p-3 rounded-full"><Users className="text-purple-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{t.clients}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.clientsCount}</h3>
          <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs font-bold">{t.merchants}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20}/> 
            {t.topProducts}
          </h3>
          <div className="space-y-5">
            {topProducts.length === 0 ? (
              <p className="text-slate-500 italic text-center py-10">{t.noData}</p>
            ) : (
              topProducts.map((prod, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-200">{prod.name}</span>
                    <span className="text-slate-400">{prod.quantity} {t.units}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-blue-500' : 'bg-slate-500'}`} 
                      style={{ width: `${(prod.quantity / maxProductQty) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <TrendingUp size={200} />
          </div>
          <div className="bg-white/20 w-fit p-3 rounded-xl mb-6 backdrop-blur-md">
            <Sparkles className="text-white" size={24} />
          </div>
          <h3 className="text-2xl font-black text-white mb-4">
            {t.aiAdvice}
          </h3>
          <p className="text-indigo-100 font-medium leading-relaxed mb-8 text-sm">
            {topProducts.length > 0 
              ? `${t.aiPart1} ${language === 'ar' ? `(${stats.ordersCount})،` : stats.ordersCount} ${t.aiPart2} "${topProducts[0].name}". ${t.aiPart3}`
              : t.aiStart}
          </p>
          <button className="bg-white text-indigo-700 font-black py-3 px-6 rounded-xl hover:bg-indigo-50 transition-colors w-fit shadow-lg">
            {t.fullReport}
          </button>
        </div>
      </div>
    </div>
  );
}