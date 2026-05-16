import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { DollarSign, Package, Users, TrendingUp, Sparkles, Loader2 } from 'lucide-react';

export default function AnalyticsB2B() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
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
          {language === 'fr' ? 'Analytiques B2B' : 'التحليلات الكبرى B2B'}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">
          {language === 'fr' ? 'Suivez vos performances et vos ventes en temps réel.' : 'تتبع أداءك ومبيعاتك في الوقت الفعلي بناءً على بياناتك الحقيقية.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-emerald-500/20 p-3 rounded-full"><DollarSign className="text-emerald-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? "Chiffre d'Affaires" : 'رقم المعاملات'}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.revenue.toLocaleString()} <span className="text-sm">DH</span></h3>
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-bold">En direct 🟢</span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-blue-500/20 p-3 rounded-full"><Package className="text-blue-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? 'Commandes B2B' : 'طلبات التزويد'}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.ordersCount}</h3>
          <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold">Total traité</span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-purple-500/20 p-3 rounded-full"><Users className="text-purple-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? 'Clients Actifs' : 'العملاء النشطون'}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.clientsCount}</h3>
          <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs font-bold">Commerçants</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20}/> 
            {language === 'fr' ? 'Produits les Plus Demandés' : 'المنتجات الأكثر طلباً'}
          </h3>
          <div className="space-y-5">
            {topProducts.length === 0 ? (
              <p className="text-slate-500 italic text-center py-10">{language === 'fr' ? 'Pas assez de données' : 'لا توجد بيانات كافية بعد'}</p>
            ) : (
              topProducts.map((prod, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-200">{prod.name}</span>
                    <span className="text-slate-400">{prod.quantity} {language === 'fr' ? 'Unités' : 'وحدة'}</span>
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
            {language === 'fr' ? 'Conseil Stratégique (IA)' : 'نصيحة استراتيجية (الذكاء الاصطناعي)'}
          </h3>
          <p className="text-indigo-100 font-medium leading-relaxed mb-8 text-sm">
            {language === 'fr' 
              ? topProducts.length > 0 
                ? `Basé sur vos ${stats.ordersCount} dernières commandes, nous remarquons une forte demande sur "${topProducts[0].name}". Prévoyez une augmentation de stock pour ce produit.` 
                : "Commencez à recevoir des commandes pour obtenir des conseils de l'IA."
              : topProducts.length > 0
                ? `بناءً على طلباتك الأخيرة (${stats.ordersCount})، نلاحظ إقبالاً كبيراً على "${topProducts[0].name}". ننصحك بزيادة مخزون هذا المنتج للأسبوع القادم.`
                : "ابدأ في استقبال الطلبات لكي يحلل الذكاء الاصطناعي أداءك."}
          </p>
          <button className="bg-white text-indigo-700 font-black py-3 px-6 rounded-xl hover:bg-indigo-50 transition-colors w-fit shadow-lg">
            {language === 'fr' ? 'Voir le rapport complet' : 'عرض التقرير المفصل'}
          </button>
        </div>
      </div>
    </div>
  );
}