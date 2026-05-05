import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore'; // استيراد مدير اللغات

// 🌐 قاموس الترجمة الذكي للمكون وتخصصات قاعدة البيانات
const translations = {
  ar: {
    title: 'المساعد الذكي SouqBTP',
    premiumBadge: 'PREMIUM',
    specialtyPrefix: 'تحليلات مخصصة لقطاع:',
    lockedTitle: 'ميزة حصرية للمشتركين',
    lockedDesc: 'رقي حسابك لفتح تحليلات الذكاء الاصطناعي وتوقعات الأسعار الخاصة بمنتجاتك.',
    upgradeBtn: 'ترقية الحساب الآن',
    alert: 'تنبيه',
    opportunity: 'فرصة',
    emptyState: 'لا توجد تحليلات جديدة لتخصصك اليوم..',
    categories: {
      gros_oeuvre: 'الحديد والإسمنت (البناء الأساسي)',
      plomberie: 'السباكة والأنابيب',
      electricite: 'الكهرباء والأسلاك',
      general: 'متعدد التخصصات'
    }
  },
  fr: {
    title: 'Assistant Intelligent SouqBTP',
    premiumBadge: 'PREMIUM',
    specialtyPrefix: 'Analyses pour le secteur :',
    lockedTitle: 'Fonctionnalité Premium',
    lockedDesc: 'Mettez à niveau votre compte pour débloquer l\'IA et les prévisions de prix de vos produits.',
    upgradeBtn: 'Mettre à niveau',
    alert: 'Alerte',
    opportunity: 'Opportunité',
    emptyState: 'Aucune nouvelle analyse pour votre secteur aujourd\'hui..',
    categories: {
      gros_oeuvre: 'Gros Œuvre (Fer & Ciment)',
      plomberie: 'Plomberie',
      electricite: 'Électricité',
      general: 'Général'
    }
  }
};

export default function SmartAIAssistant() {
  const { supplier } = useSupplierStore();
  const { language } = useSettingsStore(); // جلب اللغة الحالية
  const t = translations[language]; // تحديد القاموس بناءً على اللغة

  const [specialty, setSpecialty] = useState('gros_oeuvre');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = supplier?.tier === 'pro' || supplier?.tier === 'enterprise';

  useEffect(() => {
    const analyzeAndFetch = async () => {
      if (!supplier) return;
      
      try {
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
        } else {
          setSpecialty('general'); // إذا لم يكن لديه منتجات
        }

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

  const filteredTrends = trends.filter(t => t.category === specialty || t.category === 'general');

  // جلب اسم التخصص المترجم (أو عرض الكلمة الأصلية إذا لم تكن في القاموس)
  const displaySpecialty = t.categories[specialty] || specialty;

  if (loading) return <div className="h-48 animate-pulse bg-[#1e293b] rounded-2xl mb-8 border border-white/5"></div>;

  return (
    <div className="relative overflow-hidden bg-[#1e293b] border border-white/5 rounded-2xl p-6 mb-8 shadow-2xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className={`absolute top-0 ${language === 'ar' ? 'right-0' : 'left-0'} w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none`}></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Sparkles className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              {t.title}
              {!hasAccess && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">{t.premiumBadge}</span>}
            </h3>
            <p className="text-xs text-gray-400">{t.specialtyPrefix} <span className="text-blue-300 font-bold">{displaySpecialty}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        
        {!hasAccess && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-[#1e293b]/40 rounded-xl flex flex-col items-center justify-center p-6 text-center border border-white/10">
            <div className="p-3 bg-amber-500/20 rounded-full mb-3 text-amber-500">
                <Lock size={24} />
            </div>
            <h4 className="text-white font-bold mb-1">{t.lockedTitle}</h4>
            <p className="text-[11px] text-gray-300 mb-4 max-w-[250px]">{t.lockedDesc}</p>
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-500/20">
              {t.upgradeBtn}
            </button>
          </div>
        )}

        {filteredTrends.length > 0 ? (
          filteredTrends.map((trend) => (
            <div key={trend.id} className={`p-4 rounded-xl border bg-[#0f172a]/40 transition-all ${!hasAccess ? 'filter blur-[3px] opacity-20' : 'hover:border-white/10'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-1.5 rounded-lg ${trend.type === 'alert' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {trend.type === 'alert' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${trend.type === 'alert' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {trend.type === 'alert' ? t.alert : t.opportunity}
                </span>
              </div>
              {/* ملاحظة: العناوين والوصف هنا تأتي من قاعدة البيانات مباشرة */}
              <h4 className="text-white font-bold text-sm mb-1">{trend.title}</h4>
              <p className="text-gray-400 text-[11px] mb-4 leading-relaxed">{trend.description}</p>
              <button className={`w-full py-2 rounded-lg text-[10px] font-black transition-all ${trend.type === 'alert' ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                {trend.action_text}
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-10 text-center border border-dashed border-white/10 rounded-xl">
             <p className="text-gray-500 text-xs italic">{t.emptyState}</p>
          </div>
        )}
      </div>
    </div>
  );
}