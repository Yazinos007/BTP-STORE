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

      // 1. جلب هويات البضاعة التي يملكها المورد
      const { data: myProducts } = await supabase.from('products').select('id').eq('supplier_id', targetId);
      const myProductIds = new Set(myProducts?.map(p => p.id) || []);

      // 2. جلب كل الفواتير والطلبات بدون تحديد المالك
      const { data: allInvoices } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
      const { data: allRequests } = await supabase.from('supply_requests').select('merchant_id, items');

      // 3. الفلترة الذكية: الفاتورة لي إذا كانت تحتوي على بضاعتي!
      const myInvoices = (allInvoices || []).filter(inv => (inv.items || []).some(item => myProductIds.has(item.id)));
      const myRequests = (allRequests || []).filter(req => (req.items || []).some(item => myProductIds.has(item.id)));

      // 4. الحسابات
      const revenue = myInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
      const ordersCount = myRequests.length;
      
      const uniqueClients = new Set(myRequests.map(req => req.merchant_id).filter(id => id));
      const clientsCount = uniqueClients.size;

      const productCounter = {};
      myRequests.forEach(req => {
        (req.items || []).forEach(item => {
          if (myProductIds.has(item.id)) { // نحسب بضاعتنا فقط
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

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 size={40} className="animate-spin text-blue-500" /></div>;

  const maxProductQty = topProducts.length > 0 ? topProducts[0].quantity : 1;

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <TrendingUp className="text-blue-500" size={32} />
          {language === 'fr' ? 'Analytiques B2B' : 'التحليلات الكبرى B2B'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg">
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? "Chiffre d'Affaires" : 'رقم المعاملات'}</p>
          <h3 className="text-3xl font-black text-white">{stats.revenue.toLocaleString()} <span className="text-sm">DH</span></h3>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg">
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? 'Commandes B2B' : 'طلبات التزويد'}</p>
          <h3 className="text-3xl font-black text-white">{stats.ordersCount}</h3>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg">
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? 'Clients Actifs' : 'العملاء النشطون'}</p>
          <h3 className="text-3xl font-black text-white">{stats.clientsCount}</h3>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg">
        <h3 className="text-lg font-black text-white mb-6">{language === 'fr' ? 'Produits les Plus Demandés' : 'المنتجات الأكثر طلباً'}</h3>
        <div className="space-y-5">
          {topProducts.length === 0 ? (
            <p className="text-slate-500 text-center py-10">...</p>
          ) : (
            topProducts.map((prod, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-200">{prod.name}</span>
                  <span className="text-slate-400">{prod.quantity}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${(prod.quantity / maxProductQty) * 100}%` }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}