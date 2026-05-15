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
      // 🎯 الشرط الذكي الصحيح 100% (نفس الذي استخدمناه عند التاجر ونجح)
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      const { data: invoices } = await supabase
        .from('documents')
        .select('total_amount')
        .eq('owner_id', targetId)
        .eq('type', 'Facture');
      
      const revenue = (invoices || []).reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

      const { data: requests } = await supabase
        .from('supply_requests')
        .select('merchant_id, items')
        .eq('supplier_id', targetId);

      const ordersCount = requests?.length || 0;
      
      const uniqueClients = new Set((requests || []).map(req => req.merchant_id).filter(id => id));
      const clientsCount = uniqueClients.size;

      const productCounter = {};
      (requests || []).forEach(req => {
        (req.items || []).forEach(item => {
          productCounter[item.name] = (productCounter[item.name] || 0) + Number(item.quantity);
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
          {language === 'fr' ? 'Suivez vos performances et vos ventes en temps réel.' : 'تتبع أداءك ومبيعاتك في الوقت الفعلي.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-emerald-500/20 p-3 rounded-full"><DollarSign className="text-emerald-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? "Chiffre d'Affaires" : 'رقم المعاملات'}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.revenue.toLocaleString()} <span className="text-sm">DH</span></h3>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-blue-500/20 p-3 rounded-full"><Package className="text-blue-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? 'Commandes B2B' : 'طلبات التزويد'}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.ordersCount}</h3>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-6 top-6 bg-purple-500/20 p-3 rounded-full"><Users className="text-purple-400"/></div>
          <p className="text-slate-400 font-bold text-sm mb-1">{language === 'fr' ? 'Clients Actifs' : 'العملاء النشطون'}</p>
          <h3 className="text-3xl font-black text-white mb-3">{stats.clientsCount}</h3>
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
          <div className="bg-white/20 w-fit p-3 rounded-xl mb-6 backdrop-blur-md"><Sparkles className="text-white" size={24} /></div>
          <h3 className="text-2xl font-black text-white mb-4">{language === 'fr' ? 'Conseil Stratégique' : 'نصيحة استراتيجية'}</h3>
          <p className="text-indigo-100 font-medium leading-relaxed mb-8 text-sm">
            {language === 'fr' 
              ? topProducts.length > 0 
                ? `Forte demande sur "${topProducts[0].name}". Prévoyez le stock.` : "Attente de commandes..."
              : topProducts.length > 0
                ? `إقبال كبير على "${topProducts[0].name}". ننصحك بزيادة المخزون.` : "في انتظار استقبال الطلبات..."}
          </p>
        </div>
      </div>
    </div>
  );
}