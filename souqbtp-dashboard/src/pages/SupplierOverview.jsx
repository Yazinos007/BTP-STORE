import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  TrendingUp, Users, Package, DollarSign, Sparkles, AlertTriangle, 
  ShieldAlert, Truck, ChevronRight, ArrowRightLeft, RefreshCw, Loader2 
} from 'lucide-react';

export default function SupplierOverview() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, clientsCount: 0, stockValue: 0 });

  useEffect(() => {
    if (supplier?.id) fetchDashboardData();
  }, [supplier]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      // 1. جلب منتجات المورد (نجلب كل الأعمدة لضمان التقاط السعر سواء كان price أو sale_price)
      const { data: myProducts } = await supabase.from('products').select('*').eq('supplier_id', targetId);
      const myProductNames = new Set(myProducts?.map(p => (p.name || '').replace(/\s+/g, '').toLowerCase()) || []);
      
      // 2. حساب قيمة المخزون (الكمية × السعر)
      const totalStockValue = (myProducts || []).reduce((sum, p) => {
        const price = Number(p.price || p.sale_price || 0);
        const qty = Number(p.stock_quantity || 0);
        return sum + (price * qty);
      }, 0);

      // 3. جلب الفواتير لحساب المداخيل (تتبع بالاسم)
      const { data: allInvoices } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
      const myInvoices = (allInvoices || []).filter(inv => 
        (inv.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );
      const totalRevenue = myInvoices.reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0);

      // 4. جلب الطلبات والعملاء (تتبع بالاسم لضمان الدقة)
      const { data: allRequests } = await supabase.from('supply_requests').select('merchant_id, items');
      const myRequests = (allRequests || []).filter(req => 
        (req.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );

      const uniqueClients = new Set(myRequests.map(req => req.merchant_id).filter(id => id));

      setStats({
        revenue: totalRevenue,
        ordersCount: myRequests.length,
        clientsCount: uniqueClients.size,
        stockValue: totalStockValue
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
    <div className="space-y-10 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🚀 القسم العلوي: بطاقات الإحصائيات الحقيقية الفخمة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={language === 'fr' ? "Chiffre d'Affaires" : 'إجمالي المداخيل'} 
          value={stats.revenue.toLocaleString()} 
          icon={DollarSign} 
          color="blue"
        />
        <StatCard 
          title={language === 'fr' ? "Valeur du Stock" : 'قيمة المخزون'} 
          value={stats.stockValue.toLocaleString()} 
          icon={Package} 
          color="emerald"
        />
        <StatCard 
          title={language === 'fr' ? "Commandes B2B" : 'طلبات الجملة'} 
          value={stats.ordersCount} 
          icon={TrendingUp} 
          color="indigo"
        />
        <StatCard 
          title={language === 'fr' ? "Clients Actifs" : 'العملاء النشطون'} 
          value={stats.clientsCount} 
          icon={Users} 
          color="purple"
        />
      </div>

      {/* 🔮 القسم الأوسط: المستشار الاستراتيجي الخارق (IA Advisor) */}
      <div className="space-y-6">
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
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">توفير متوقع</p>
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
               <span>طنجة</span> <ArrowRightLeft size={16} className="text-blue-400" /> <span>الدار البيضاء</span>
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

// مكون البطاقة الإحصائية الفرعي
function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "from-blue-600 to-indigo-700 shadow-blue-500/20",
    emerald: "from-emerald-600 to-teal-700 shadow-emerald-500/20",
    indigo: "from-indigo-600 to-purple-700 shadow-indigo-500/20",
    purple: "from-purple-600 to-pink-700 shadow-purple-500/20"
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-3xl shadow-xl relative overflow-hidden group transition-all hover:-translate-y-1`}>
      <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform">
        <Icon size={140} />
      </div>
      <div className="relative z-10">
        <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-white">{value}</h4>
      </div>
    </div>
  );
}