import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useSupplierStore from '../store/useSupplierStore';

export default function SmartAIAssistant() {
  const { supplier } = useSupplierStore();
  const [specialty, setSpecialty] = useState('gros_oeuvre');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. فحص الباقة (الوصول متاح فقط للـ pro والـ enterprise)
  const hasAccess = supplier?.tier === 'pro' || supplier?.tier === 'enterprise';

  useEffect(() => {
    const analyzeAndFetch = async () => {
      if (!supplier) return;
      
      try {
        // 🚀 تحليل التخصص تلقائياً من المنتجات
        const { data: products } = await supabase
          .from('products')
          .select('category')
          .eq('supplier_id', supplier.id);

        if (products && products.length > 0) {
          const counts = products.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          }, {});
          const topCat = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
          setSpecialty(topCat);
        }

        // 📈 جلب التوجهات من القاعدة
        const { data: trendData } = await supabase
          .from('market_trends')
          .select('*')
          .order('created_at', { ascending: false });

        setTrends(trendData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    analyzeAndFetch();
  }, [supplier]);

  // تصفية التنبيهات لتناسب التخصص فقط
  const filteredTrends = trends.filter(t => t.category === specialty);

  if (loading) return <div className="h-48 animate-pulse bg-white/5 rounded-2xl"></div>;

  return (
    <div className="relative overflow-hidden bg-[#1e293b] border border-white/5 rounded-2xl p-6 mb-8 shadow-2xl">
      
      {/* خلفية جمالية */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>

      {/* الرأس */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Sparkles className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              المساعد الذكي SouqBTP
              {!hasAccess && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">PREMIUM</span>}
            </h3>
            <p className="text-xs text-gray-400">تحليلات مخصصة لقطاع: <span className="text-blue-300 font-bold">{specialty}</span></p>
          </div>
        </div>
      </div>

      {/* محتوى التحليلات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        
        {/* نظام الحجب للباقات العادية */}
        {!hasAccess && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-[#1e293b]/40 rounded-xl flex flex-col items-center justify-center p-6 text-center border border-white/10">
            <div className="p-3 bg-amber-500/20 rounded-full mb-3 text-amber-500">
                <Lock size={24} />
            </div>
            <h4 className="text-white font-bold mb-1">ميزة حصرية للمشتركين</h4>
            <p className="text-[11px] text-gray-300 mb-4 max-w-[250px]">رقي حسابك لفتح تحليلات الذكاء الاصطناعي وتوقعات الأسعار الخاصة بمنتجاتك.</p>
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-500/20">
              ترقية الحساب الآن
            </button>
          </div>
        )}

        {/* عرض التنبيهات */}
        {filteredTrends.length > 0 ? (
          filteredTrends.map((trend) => (
            <div key={trend.id} className={`p-4 rounded-xl border bg-[#0f172a]/40 transition-all ${!hasAccess ? 'filter blur-[3px] opacity-20' : 'hover:border-white/10'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-1.5 rounded-lg ${trend.type === 'alert' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {trend.type === 'alert' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${trend.type === 'alert' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {trend.type === 'alert' ? 'تنبيه' : 'فرصة'}
                </span>
              </div>
              <h4 className="text-white font-bold text-sm mb-1">{trend.title}</h4>
              <p className="text-gray-400 text-[11px] mb-4 leading-relaxed">{trend.description}</p>
              <button className={`w-full py-2 rounded-lg text-[10px] font-black transition-all ${trend.type === 'alert' ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                {trend.action_text}
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-10 text-center border border-dashed border-white/10 rounded-xl">
             <p className="text-gray-500 text-xs italic">لا توجد تحليلات جديدة لتخصصك اليوم..</p>
          </div>
        )}
      </div>
    </div>
  );
}