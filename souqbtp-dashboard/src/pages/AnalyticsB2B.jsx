import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { BarChart3, TrendingUp, Users, Package, ArrowUpRight, ArrowDownRight, Loader2, DollarSign } from 'lucide-react';

export default function AnalyticsB2B() {
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    merchantsCount: 0,
    topProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useSettingsStore();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // 1. جلب كل الطلبات المكتملة والموقعة للتحليل
      const { data: orders, error: ordersError } = await supabase
        .from('supply_requests')
        .select('*')
        .in('status', ['signed', 'shipped', 'delivered', 'completed']);

      if (ordersError) throw ordersError;

      // 2. جلب عدد التجار النشطين
      const { count: merchantsCount } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true });

      // 3. تحليل البيانات
      let total = 0;
      const productMap = {};

      orders?.forEach(order => {
        total += Number(order.total_amount || 0);
        
        // تحليل المنتجات الأكثر طلباً من داخل الـ JSON
        order.items?.forEach(item => {
          productMap[item.name] = (productMap[item.name] || 0) + Number(item.quantity);
        });
      });

      // ترتيب أفضل 5 منتجات
      const sortedProducts = Object.entries(productMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      setStats({
        totalSales: total,
        ordersCount: orders?.length || 0,
        merchantsCount: merchantsCount || 0,
        topProducts: sortedProducts
      });

    } catch (err) {
      console.error('Analytics Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    { 
      title: language === 'fr' ? 'Chiffre d\'Affaires' : 'إجمالي المبيعات', 
      value: `${stats.totalSales.toLocaleString()} DH`, 
      icon: <DollarSign size={24}/>, 
      color: 'bg-emerald-500',
      trend: '+12%' 
    },
    { 
      title: language === 'fr' ? 'Commandes B2B' : 'عدد الطلبات', 
      value: stats.ordersCount, 
      icon: <Package size={24}/>, 
      color: 'bg-blue-500',
      trend: '+5%' 
    },
    { 
      title: language === 'fr' ? 'Clients Actifs' : 'التجار النشطون', 
      value: stats.merchantsCount, 
      icon: <Users size={24}/>, 
      color: 'bg-purple-500',
      trend: 'Stable' 
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <BarChart3 className="text-blue-500" size={32} />
          {language === 'fr' ? 'Analytiques B2B' : 'التحليلات والذكاء التجاري'}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">
          {language === 'fr' ? 'Suivez vos performances و vos ventes en temps réel.' : 'تتبع أداء مبيعاتك ونمو نشاطك التجاري لحظة بلحظة.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-blue-500" /></div>
      ) : (
        <>
          {/* بطاقات الإحصائيات العلوية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden group hover:border-slate-500 transition-all">
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 font-bold text-sm mb-1">{card.title}</p>
                    <h3 className="text-3xl font-black">{card.value}</h3>
                  </div>
                  <div className={`${card.color} p-3 rounded-2xl shadow-lg shadow-black/20`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 relative z-10">
                  <span className="text-emerald-400 text-xs font-black flex items-center gap-0.5 bg-emerald-400/10 px-2 py-1 rounded-full">
                    <ArrowUpRight size={14}/> {card.trend}
                  </span>
                  <span className="text-slate-500 text-xs font-bold">{language === 'fr' ? 'vs mois dernier' : 'مقارنة بالشهر الماضي'}</span>
                </div>
                {/* تأثير خلفية خفيف */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${card.color} opacity-5 blur-3xl rounded-full`}></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* المنتجات الأكثر طلباً */}
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-400" size={24}/>
                {language === 'fr' ? 'Produits les Plus Demandés' : 'المنتجات الأكثر طلباً'}
              </h3>
              <div className="space-y-6">
                {stats.topProducts.map((prod, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-300">{prod.name}</span>
                      <span className="text-white">{prod.qty} {language === 'fr' ? 'Unités' : 'وحدة'}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(prod.qty / stats.topProducts[0].qty) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* نصيحة الذكاء الاصطناعي (AI Insight) */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-xl shadow-indigo-500/10 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 backdrop-blur-md">
                  <TrendingUp className="text-white" size={28}/>
                </div>
                <h3 className="text-2xl font-black text-white mb-4">
                  {language === 'fr' ? 'Conseil Stratégique (IA)' : 'نصيحة استراتيجية (ذكاء اصطناعي)'}
                </h3>
                <p className="text-indigo-100 font-medium leading-relaxed mb-6">
                  {language === 'fr' 
                    ? `Basé sur vos ${stats.ordersCount} dernières commandes, nous remarquons une forte demande sur "${stats.topProducts[0]?.name || '...' }". Prévoyez une augmentation de stock de 15% pour la semaine prochaine.` 
                    : `بناءً على آخر ${stats.ordersCount} طلبية، نلاحظ طلباً متزايداً على "${stats.topProducts[0]?.name || '...' }". ننصح بزيادة المخزون بنسبة 15% لتلبية احتياجات السوق الأسبوع القادم.`}
                </p>
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black hover:bg-indigo-50 transition-all">
                  {language === 'fr' ? 'Voir le rapport complet' : 'عرض التقرير الكامل'}
                </button>
              </div>
              {/* أيقونات ديكورية في الخلفية */}
              <div className="absolute top-10 right-10 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                <BarChart3 size={150} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}