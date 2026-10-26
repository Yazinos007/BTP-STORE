import React, { useState } from 'react';
import { 
  Zap, CheckCircle2, Radar, FileSpreadsheet, ShieldCheck, 
  Trophy, ArrowLeft, Sparkles, Lock, MessageSquare 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../../../store/useSettingsStore';

export default function ProviderSubscription() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  const plans = [
    {
      id: 'free',
      name: 'حساب حرفي عادي',
      price: '0',
      period: 'مجاناً للأبد',
      description: 'للتواجد البسيط في المنصة واستكشاف السوق',
      badge: null,
      buttonText: 'باقتك الحالية',
      buttonStyle: 'bg-slate-800 text-slate-400 cursor-default',
      features: [
        { text: 'إنشاء ملف شخصي بسيط ومعرض صور أولي', included: true },
        { text: 'تصفح سوق BTP العام', included: true },
        { text: 'عمولة إحالة أساسية (15% على الاشتراكات المدفوعة فقط)', included: true },
        { text: 'رادار الأوراش القريبة منك (Geo-Radar) على واتساب', included: false },
        { text: 'الغرفة الذكية للقياسات وإصدار Devis PDF باسمك', included: false },
        { text: 'شارة "معلم معتمد وموثوق ✔️" وتصدر نتائج البحث', included: false },
      ]
    },
    {
      id: 'pro',
      name: 'المعلم المحترف (Maâlem PRO) 🔥',
      price: billingCycle === 'monthly' ? '69' : '590',
      period: billingCycle === 'monthly' ? 'درهم / شهرياً' : 'درهم / سنوياً (وفر شهرين!)',
      description: 'ورشة واحدة تحصل عليها من الرادار تغطي اشتراك 5 سنوات كاملة!',
      badge: 'الأكثر طلباً للحرفيين 🏆',
      buttonText: 'رقِّ حسابك الآن وافتح الفرص ⚡',
      buttonStyle: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-xl shadow-orange-500/25',
      features: [
        { text: 'رادار الأوراش اللحظي: تنبيه فوري على واتساب لكل طلب عمل في مدينتك', included: true },
        { text: 'غرفة القياسات الذكية: احسب السلعة وأخرج Devis PDF احترافي في 30 ثانية', included: true },
        { text: 'شارة "حرفي معتمد ✔️" مع أولوية الظهور للمقاولين والمهندسين', included: true },
        { text: 'تواصل مباشر ومفتوح مع أصحاب المشاريع والمقاولين بدون قيود', included: true },
        { text: 'تفعيل رتبة "شريك برو": عمولة حتى 30% نقداً عن كل مشترك مدفوع تجلبه!', included: true },
        { text: 'دعم فني وأولوية في الترشيح للمشاريع الكبرى', included: true },
      ]
    }
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto py-6 px-4 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة */}
      <div className="text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black">
          <Sparkles size={14} /> استثمر في حرفتك وضاعف مداخيلك
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          باقة بحجم فنجان قهوة.. تفتح لك أوراشاً بآلاف الدراهم!
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          لا تنتظر الزبون بالصدفة. فعّل أدوات المعلم الذكي، التقط الأوراش القريبة منك فوراً، وادخل نادي الشركاء المعتمدين.
        </p>

        {/* محول الدفع الشهري / السنوي */}
        <div className="inline-flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl mt-4">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              billingCycle === 'monthly' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            اشتراك شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            اشتراك سنوي <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md text-[10px]">شهران مجاناً</span>
          </button>
        </div>
      </div>

      {/* بطاقات الباقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all ${
              plan.id === 'pro'
                ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-orange-950/30 border-2 border-orange-500 shadow-2xl'
                : 'bg-slate-900/60 border border-slate-800'
            }`}
          >
            {plan.badge && (
              <div className="absolute top-4 left-4 bg-orange-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg">
                {plan.badge}
              </div>
            )}

            <div>
              <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-6">{plan.description}</p>

              <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-slate-800">
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className="text-sm font-bold text-orange-400">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {feat.included ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Lock size={18} className="text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span className={feat.included ? 'text-slate-200 font-bold' : 'text-slate-600 line-through'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button className={`w-full py-4 rounded-xl font-black text-sm transition-all ${plan.buttonStyle}`}>
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* بانر المعادلة الذكية (الترقية أولاً ثم مضاعفة الأرباح) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-black uppercase">
            <Trophy size={16} /> ميزة حصرية للمشتركين في الباقة الاحترافية
          </div>
          <h4 className="text-xl font-black text-white">
            كيف تسترجع ثمن اشتراكك وتحوله إلى دخل شهري إضافي؟
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            بمجرد ترقية حسابك إلى <strong>Maâlem PRO</strong>، ترتفع عمولتك في برنامج شركاء النجاح تلقائياً! كل مقاول، مهندس أو حرفي ينضم ويفعّل باقته المدفوعة عبر رابطك يمنحك <strong>عمولة نقدية مباشرة (حتى 30%)</strong> تُضاف إلى محفظتك فوراً.
          </p>
        </div>
        <button
          onClick={() => navigate('/v2/provider-affiliates')}
          className="shrink-0 px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20"
        >
          اكتشف لوحة الأرباح <ArrowLeft size={16} />
        </button>
      </div>

    </div>
  );
}