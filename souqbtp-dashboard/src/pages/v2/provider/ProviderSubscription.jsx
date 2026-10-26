import React, { useState } from 'react';
import { 
  CheckCircle2, Trophy, ArrowLeft, ArrowRight, Sparkles, Lock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../../../store/useSettingsStore';

const translations = {
  ar: {
    topBadge: 'استثمر في حرفتك وضاعف مداخيلك',
    title: 'باقة بحجم فنجان قهوة.. تفتح لك أوراشاً بآلاف الدراهم!',
    subtitle: 'لا تنتظر الزبون بالصدفة. فعّل أدوات المعلم الذكي، التقط الأوراش القريبة منك فوراً، وادخل نادي الشركاء المعتمدين.',
    monthly: 'اشتراك شهري',
    yearly: 'اشتراك سنوي',
    twoMonthsFree: 'شهران مجاناً',
    freePlan: {
      name: 'حساب حرفي عادي',
      period: 'مجاناً للأبد',
      desc: 'للتواجد البسيط في المنصة واستكشاف السوق',
      btn: 'باقتك الحالية',
      f1: 'إنشاء ملف شخصي بسيط ومعرض صور أولي',
      f2: 'تصفح سوق BTP العام',
      f3: 'عمولة إحالة أساسية (15% على الاشتراكات المدفوعة فقط)',
      f4: 'رادار الأوراش القريبة منك (Geo-Radar) على واتساب',
      f5: 'الغرفة الذكية للقياسات وإصدار Devis PDF باسمك',
      f6: 'شارة "معلم معتمد وموثوق ✔️" وتصدر نتائج البحث'
    },
    proPlan: {
      name: 'المعلم المحترف (Maâlem PRO) 🔥',
      periodMonthly: 'درهم / شهرياً',
      periodYearly: 'درهم / سنوياً (وفر شهرين!)',
      desc: 'ورشة واحدة تحصل عليها من الرادار تغطي اشتراك 5 سنوات كاملة!',
      badge: 'الأكثر طلباً للحرفيين 🏆',
      btn: 'رقِّ حسابك الآن وافتح الفرص ⚡',
      f1: 'رادار الأوراش اللحظي: تنبيه فوري على واتساب لكل طلب عمل في مدينتك',
      f2: 'غرفة القياسات الذكية: احسب السلعة وأخرج Devis PDF احترافي في 30 ثانية',
      f3: 'شارة "حرفي معتمد ✔️" مع أولوية الظهور للمقاولين والمهندسين',
      f4: 'تواصل مباشر ومفتوح مع أصحاب المشاريع والمقاولين بدون قيود',
      f5: 'تفعيل رتبة "شريك برو": عمولة حتى 30% نقداً عن كل مشترك مدفوع تجلبه!',
      f6: 'دعم فني وأولوية في الترشيح للمشاريع الكبرى'
    },
    bannerBadge: 'ميزة حصرية للمشتركين في الباقة الاحترافية',
    bannerTitle: 'كيف تسترجع ثمن اشتراكك وتحوله إلى دخل شهري إضافي؟',
    bannerDesc: 'بمجرد ترقية حسابك إلى Maâlem PRO، ترتفع عمولتك في برنامج شركاء النجاح تلقائياً! كل مقاول، مهندس أو حرفي ينضم ويفعّل باقته المدفوعة عبر رابطك يمنحك عمولة نقدية مباشرة (حتى 30%) تُضاف إلى محفظتك فوراً.',
    bannerBtn: 'اكتشف لوحة الأرباح'
  },
  fr: {
    topBadge: 'Investissez dans votre métier et doublez vos revenus',
    title: 'Un abonnement au prix d\'un café.. qui vous ouvre des chantiers à milliers de dirhams !',
    subtitle: 'N\'attendez plus les clients par hasard. Activez les outils de l\'Artisan Intelligent, captez les chantiers proches de vous et rejoignez le club des partenaires certifiés.',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    twoMonthsFree: '2 mois offerts',
    freePlan: {
      name: 'Compte Artisan Standard',
      period: 'Gratuit à vie',
      desc: 'Pour une présence simple sur la plateforme et découvrir le marché',
      btn: 'Votre plan actuel',
      f1: 'Profil simple et galerie photo de base',
      f2: 'Accès au Marché BTP général',
      f3: 'Commission de parrainage de base (15% sur abonnements payés)',
      f4: 'Radar des chantiers proches (Geo-Radar) sur WhatsApp',
      f5: 'Salle de mesure intelligente & génération de Devis PDF à votre nom',
      f6: 'Badge "Artisan Certifié ✔️" et priorité dans les recherches'
    },
    proPlan: {
      name: 'Artisan Professionnel (Maâlem PRO) 🔥',
      periodMonthly: 'MAD / mois',
      periodYearly: 'MAD / an (2 mois gratuits !)',
      desc: 'Un seul chantier obtenu via le radar couvre 5 ans d\'abonnement !',
      badge: 'Le plus populaire 🏆',
      btn: 'Passer au PRO & débloquer les chantiers ⚡',
      f1: 'Radar Chantiers Live : Alerte WhatsApp instantanée pour chaque projet dans votre ville',
      f2: 'Calculateur & Devis PDF Pro : Calculez les matériaux et créez un devis en 30 secondes',
      f3: 'Badge "Artisan Certifié ✔️" avec visibilité prioritaire auprès des architectes et entrepreneurs',
      f4: 'Messagerie directe et illimitée avec les maîtres d\'ouvrage et entrepreneurs',
      f5: 'Statut "Partenaire PRO" : Jusqu\'à 30% de commission cash sur chaque abonné payant invité !',
      f6: 'Support prioritaire et recommandation pour les grands projets'
    },
    bannerBadge: 'Avantage exclusif pour les abonnés Maâlem PRO',
    bannerTitle: 'Comment rentabiliser votre abonnement et créer un revenu mensuel supplémentaire ?',
    bannerDesc: 'Dès votre passage à Maâlem PRO, votre commission dans le Programme Partenaires augmente automatiquement ! Chaque entrepreneur, architecte ou artisan qui souscrit un plan payant via votre lien vous rapporte jusqu\'à 30% de commission directe.',
    bannerBtn: 'Découvrir mes gains'
  },
  en: {
    topBadge: 'Invest in your craft & multiply your income',
    title: 'A plan for the price of a coffee.. unlocking projects worth thousands of dirhams!',
    subtitle: 'Stop waiting for clients by chance. Activate Smart Artisan tools, catch nearby projects instantly, and join the certified partners club.',
    monthly: 'Monthly Billing',
    yearly: 'Yearly Billing',
    twoMonthsFree: '2 Months Free',
    freePlan: {
      name: 'Standard Artisan Account',
      period: 'Free Forever',
      desc: 'For basic presence on the platform and exploring the market',
      btn: 'Your Current Plan',
      f1: 'Basic profile and initial portfolio gallery',
      f2: 'Browse the general BTP Marketplace',
      f3: 'Basic referral commission (15% on paid subscriptions only)',
      f4: 'Nearby Projects Radar (Geo-Radar) alerts on WhatsApp',
      f5: 'Smart Measurement Room & instant PDF Quote generator',
      f6: '"Certified Artisan ✔️" badge & top search ranking'
    },
    proPlan: {
      name: 'Professional Artisan (Maâlem PRO) 🔥',
      periodMonthly: 'MAD / month',
      periodYearly: 'MAD / year (Save 2 months!)',
      desc: 'Just one project from the radar covers 5 full years of subscription!',
      badge: 'Most Popular 🏆',
      btn: 'Upgrade Now & Unlock Projects ⚡',
      f1: 'Live Project Radar: Instant WhatsApp alerts for every job request in your city',
      f2: 'Smart Quote Room: Calculate materials & export a branded PDF Devis in 30 seconds',
      f3: '"Certified Artisan ✔️" badge with priority visibility to contractors & architects',
      f4: 'Unlimited direct messaging with project owners and general contractors',
      f5: 'Unlock "PRO Partner" rank: Earn up to 30% cash commission per paid referral!',
      f6: 'Priority support and nomination for major construction projects'
    },
    bannerBadge: 'Exclusive benefit for Maâlem PRO subscribers',
    bannerTitle: 'How to recover your subscription cost and turn it into extra monthly income?',
    bannerDesc: 'Once you upgrade to Maâlem PRO, your affiliate commission rate automatically jumps! Every contractor, architect, or artisan who upgrades via your link earns you up to 30% direct cash commission.',
    bannerBtn: 'Explore Affiliate Dashboard'
  }
};

export default function ProviderSubscription() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const plans = [
    {
      id: 'free',
      name: t.freePlan.name,
      price: '0',
      period: t.freePlan.period,
      description: t.freePlan.desc,
      badge: null,
      buttonText: t.freePlan.btn,
      buttonStyle: 'bg-slate-800 text-slate-400 cursor-default',
      features: [
        { text: t.freePlan.f1, included: true },
        { text: t.freePlan.f2, included: true },
        { text: t.freePlan.f3, included: true },
        { text: t.freePlan.f4, included: false },
        { text: t.freePlan.f5, included: false },
        { text: t.freePlan.f6, included: false },
      ]
    },
    {
      id: 'pro',
      name: t.proPlan.name,
      price: billingCycle === 'monthly' ? '69' : '590',
      period: billingCycle === 'monthly' ? t.proPlan.periodMonthly : t.proPlan.periodYearly,
      description: t.proPlan.desc,
      badge: t.proPlan.badge,
      buttonText: t.proPlan.btn,
      buttonStyle: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-xl shadow-orange-500/25 cursor-pointer',
      features: [
        { text: t.proPlan.f1, included: true },
        { text: t.proPlan.f2, included: true },
        { text: t.proPlan.f3, included: true },
        { text: t.proPlan.f4, included: true },
        { text: t.proPlan.f5, included: true },
        { text: t.proPlan.f6, included: true },
      ]
    }
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto py-6 px-4 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة - داخل بطاقة داكنة أنيقة لتكون واضحة في الوضع النهاري والليلي */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-xl">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black">
          <Sparkles size={14} /> {t.topBadge}
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-white">
          {t.title}
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>

        {/* محول الدفع الشهري / السنوي */}
        <div className="inline-flex items-center bg-slate-950 border border-slate-800 p-1.5 rounded-2xl mt-4">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              billingCycle === 'monthly' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.monthly}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'yearly' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.yearly} <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md text-[10px]">{t.twoMonthsFree}</span>
          </button>
        </div>
      </div>

      {/* بطاقات الباقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all shadow-2xl ${
              plan.id === 'pro'
                ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-orange-950 border-2 border-orange-500'
                : 'bg-slate-900 border border-slate-800'
            }`}
          >
            {plan.badge && (
              <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} bg-orange-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg`}>
                {plan.badge}
              </div>
            )}

            <div>
              <h3 className="text-xl font-black text-white mb-2 mt-2">{plan.name}</h3>
              <p className="text-xs text-slate-300 mb-6">{plan.description}</p>

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
                      <Lock size={18} className="text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <span className={feat.included ? 'text-slate-100 font-bold' : 'text-slate-400 line-through'}>
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

      {/* بانر المعادلة الذكية */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-black uppercase">
            <Trophy size={16} /> {t.bannerBadge}
          </div>
          <h4 className="text-xl font-black text-white">
            {t.bannerTitle}
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
            {t.bannerDesc}
          </p>
        </div>
        <button
          onClick={() => navigate('/v2/provider-affiliates')}
          className="shrink-0 px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer"
        >
          {t.bannerBtn} <ArrowIcon size={16} />
        </button>
      </div>

    </div>
  );
}