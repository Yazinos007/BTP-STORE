import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, TrendingUp, TrendingDown, ArrowRight, BrainCircuit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore';

const translations = {
  ar: {
    title: 'مساعد SouqBTP الذكي',
    desc: 'تنبؤات مبنية على تحليل أسعار السوق الحالية لقطاع: ',
    premiumBadge: 'PREMIUM',
    lockedTitle: 'ميزة حصرية للمشتركين',
    lockedDesc: 'رقي حسابك لفتح تحليلات الذكاء الاصطناعي وتوقعات الأسعار الخاصة بمنتجاتك.',
    upgradeBtn: 'ترقية الحساب الآن',
    ignoreBtn: 'تجاهل',
    emptyState: 'لا توجد تحليلات جديدة لتخصصك اليوم..',
    categories: {
      gros_oeuvre: 'الحديد والإسمنت',
      plomberie: 'السباكة والأنابيب',
      electricite: 'الكهرباء والأسلاك',
      general: 'متعدد التخصصات'
    }
  },
  fr: {
    title: 'Assistant Intelligent SouqBTP',
    desc: 'Prévisions basées sur l\'analyse du marché pour le secteur : ',
    premiumBadge: 'PREMIUM',
    lockedTitle: 'Fonctionnalité Premium',
    lockedDesc: 'Mettez à niveau votre compte pour débloquer l\'IA et les prévisions de prix.',
    upgradeBtn: 'Mettre à niveau',
    ignoreBtn: 'Ignorer',
    emptyState: 'Aucune nouvelle analyse pour votre secteur aujourd\'hui..',
    categories: {
      gros_oeuvre: 'Gros Œuvre',
      plomberie: 'Plomberie',
      electricite: 'Électricité',
      general: 'Général'
    }
  }
};

export default function SmartAIAssistant() {
  const { supplier } = useSupplierStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [specialty, setSpecialty] = useState('general');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = supplier?.tier === 'pro' || supplier?.tier === 'enterprise';

  useEffect(() => {
    let isMounted = true;

    const analyzeAndFetch = async () => {
      // إذا لم تكتمل بيانات الحساب بعد، ننهي حالة التحميل بهدوء دون قفل الواجهة
      if (!supplier?.id) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // جلب فئات المنتجات بأمان لمعرفة التخصص
        const { data: products } = await supabase
          .from('products')
          .select('category')
          .eq('supplier_id', supplier.id);

        let currentSpecialty = 'general';
        if (products && products.length > 0) {
          const counts = products.reduce((acc, p) => {
            const cat = p.category || 'general';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {});
          currentSpecialty = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        }

        // جلب بيانات مسارات السوق
        const { data: trendData } = await supabase
          .from('market_trends')
          .select('*')
          .order('created_at', { ascending: false });

        if (isMounted) {
          setSpecialty(currentSpecialty);
          setTrends(trendData || []);
        }
      } catch (err) {
        console.error("AI Assistant Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    analyzeAndFetch();

    return () => {
      isMounted = false;
    };
  }, [supplier?.id]);

  const dismissInsight = (id) => setTrends(trends.filter(insight => insight.id !== id));

  const filteredTrends = trends.filter(t => t.category === specialty || t.category === 'general');
  const displaySpecialty = t.categories[specialty] || specialty;

  // الإبقاء على الحاوية الخارجية (Container) ثابتة ومستقرة دائماً لمنع الوميض واهتزاز الشاشة
  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[23px] p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8 border border-white/5 min-h-[260px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* تأثيرات الإضاءة الخلفية */}
      <div className={`absolute top-0 ${language === 'ar' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none`}></div>
      <div className={`absolute bottom-0 ${language === 'ar' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none`}></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              {t.title} <Sparkles size={18} className="text-yellow-400" />
              {!hasAccess && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-md font-black tracking-wider ml-2">{t.premiumBadge}</span>}
            </h3>
            <p className="text-blue-200/60 font-medium text-sm mt-1">{t.desc} <span className="text-blue-400 font-bold">{displaySpecialty}</span></p>
          </div>
        </div>

        {/* التحميل يحدث الآن بداخل المكون المستقر دون تغيير الأبعاد الخارجية */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 py-6">
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse border border-white/5"></div>
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse border border-white/5"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative">
            
            {/* قفل الباقة العادية */}
            {!hasAccess && (
              <div className="absolute inset-0 z-20 bg-[#0f172a]/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-white/10 shadow-2xl">
                <div className="p-4 bg-amber-500/20 rounded-full mb-4 text-amber-500">
                    <Lock size={32} />
                </div>
                <h4 className="text-white font-black text-xl mb-2">{t.lockedTitle}</h4>
                <p className="text-sm text-gray-300 mb-6 max-w-[300px] leading-relaxed">{t.lockedDesc}</p>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm rounded-xl transition-transform hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  {t.upgradeBtn}
                </button>
              </div>
            )}

            {/* الكروت الذكية */}
            {filteredTrends.length > 0 ? (
              filteredTrends.map((trend) => {
                const isWarning = trend.type === 'alert';
                return (
                  <div key={trend.id} className={`bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col justify-between group ${!hasAccess ? 'filter blur-[2px] opacity-30 pointer-events-none' : ''}`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${isWarning ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {isWarning ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-white text-lg mb-2 leading-snug">{trend.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {trend.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-5 border-t border-white/10 mt-auto">
                      <button className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${isWarning ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}`}>
                        {trend.action_text} <ArrowRight size={18} className={language === 'ar' ? 'rotate-180' : ''} />
                      </button>
                      <button onClick={() => dismissInsight(trend.id)} className="px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm rounded-xl transition-colors">
                        {t.ignoreBtn}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 lg:col-span-2 py-16 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                 <p className="text-gray-400 text-sm font-medium">{t.emptyState}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}