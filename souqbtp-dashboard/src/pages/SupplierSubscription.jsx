import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../store/useSettingsStore';
import { ShieldCheck, CheckCircle2, Zap, Star, ArrowRight, Minus, Loader2, Gavel } from 'lucide-react';

const translations = {
  ar: {
    title: 'ترقية باقة الإمبراطورية (B2B)',
    subtitle: 'استثمر في النظام الذي يضاعف مبيعاتك ويحمي أرباحك. اختر الباقة التي تناسب حجم طموحك.',
    monthly: 'دفع شهري',
    annual: 'دفع سنوي',
    save20: 'وفر 20%',
    currency: 'درهم',
    mo: '/ شهر',
    yr: '/ سنة',
    currentPlan: 'باقتك الحالية',
    upgradeBtn: 'الترقية الآن',
    contactSales: 'تواصل مع المبيعات',
    plans: {
      starter: {
        name: 'Starter B2B',
        desc: 'مثالية للموردين الجدد لتنظيم المخزون وإصدار الفواتير القانونية السريعة.',
        features: [
          'إدارة المخزون المركزي الأساسية',
          'إصدار فواتير B2B غير محدودة',
          'حد أقصى 50 عميل في النظام',
          'لوحة تحكم إحصائيات بسيطة',
        ],
        missing: ['المحاسبة المتقدمة والـ CPC', 'الـ CRM الذكي للعملاء', 'رادار المناقصات الحية']
      },
      pro: {
        name: 'Pro ERP',
        desc: 'نظام متكامل لإدارة التجارة الكبرى، المحاسبة، وعلاقات العملاء وعقودهم.',
        badge: 'الأكثر شعبية',
        features: [
          'كل ما في باقة Starter',
          'نظام المحاسبة والـ CPC التلقائي',
          'الـ CRM الذكي (تصنيف العملاء)',
          'إرسال رسائل واتساب للتحصيل المباشر',
          'نظام "الرجوع عامر" التشاركي (لوجستيك)',
          'عدد عملاء وثائق غير محدود'
        ],
        missing: ['شارة SouqBTP Verified الذهبية', 'رادار المناقصات الحية']
      },
      enterprise: {
        name: 'Enterprise (Verified)',
        desc: 'قوة الذكاء الاصطناعي واقتناص المناقصات الجغرافية لكبار الموردين.',
        badge: 'SouqBTP Verified 🛡️',
        features: [
          'كل ما في باقة Pro ERP',
          'شارة "مورد معتمد" الذهبية للماركت بليس',
          'رادار المناقصات الحية (الفرص المحلية القريبة)',
          'رادار التنبؤ وتقلبات الأسعار الاستباقي',
          'مدير حساب شخصي ومحاسب مخصص لك',
          'أولوية الظهور المطلقة للتجار والمقاولين'
        ],
        missing: []
      }
    }
  },
  fr: {
    title: 'Abonnements Empire (B2B)',
    subtitle: 'Investissez dans le système qui multiplie vos ventes et protège vos marges. Choisissez l\'excellence.',
    monthly: 'Mensuel',
    annual: 'Annuel',
    save20: 'Économisez 20%',
    currency: 'MAD',
    mo: '/ mois',
    yr: '/ an',
    currentPlan: 'Votre plan actuel',
    upgradeBtn: 'Mettre à niveau',
    contactSales: 'Contacter les ventes',
    plans: {
      starter: {
        name: 'Starter B2B',
        desc: 'Idéal pour démarrer, organiser le stock et facturer légalement.',
        features: [
          'Gestion centralisée du stock',
          'Facturation B2B illimitée',
          'Jusqu\'à 50 clients',
          'Tableau de bord basique',
        ],
        missing: ['Comptabilité avancée & CPC', 'CRM Intelligent', 'Radar d\'Appels d\'Offres']
      },
      pro: {
        name: 'Pro ERP',
        desc: 'Le système complet pour gérer le commerce, la compta B2B et le CRM.',
        badge: 'Le plus populaire',
        features: [
          'Tout de l\'offre Starter',
          'Comptabilité & Bilan CPC automatisé',
          'CRM Intelligent (Segmentation)',
          'Relance client via WhatsApp',
          'Optimiseur Logistique (Retour Chargé)',
          'Clients et documents illimités'
        ],
        missing: ['Badge SouqBTP Verified', 'Radar d\'Appels d\'Offres Live']
      },
      enterprise: {
        name: 'Enterprise (Verified)',
        desc: 'La puissance de l\'IA et la capture d\'appels d\'offres pour les leaders du marché.',
        badge: 'SouqBTP Verified 🛡️',
        features: [
          'Tout de l\'offre Pro ERP',
          'Badge d\'Or "Fournisseur Certifié"',
          'Radar d\'Appels d\'Offres Live Géo-localisé',
          'Radar de Prédiction des Prix',
          'Account Manager Dédié',
          'Priorité absolue dans le Marketplace'
        ],
        missing: []
      }
    }
  }
};

export default function SupplierSubscription() {
  const { language } = useSettingsStore();
  const t = translations[language] || translations['fr'];
  const [isAnnual, setIsAnnual] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // الأسعار الاستراتيجية بعد خصم الـ 20%
  const prices = {
    starter: { monthly: 0, annual: 0 },
    pro: { monthly: 499, annual: 4790 },
    enterprise: { monthly: 1499, annual: 14390 }
  };

  const handleSubscribe = (tier) => {
    setIsSubmitting(true);
    console.log(`تم اختيار الباقة الاستراتيجية: ${tier}`);
    
    // محاكاة الاتصال ببوابة الدفع أو تحديث حالة الاشتراك
    setTimeout(() => {
      setIsSubmitting(false);
      alert(language === 'fr' ? '🌟 Plan mis à jour avec succès !' : '🌟 تم تفعيل الباقة وتحديث صلاحيات النظام بنجاح!');
      navigate('/'); // التوجيه الفوري لمركز القيادة الرئيسي بعد الدفع
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in text-slate-300 pb-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 👑 الهيدر الفخم وزر التبديل الذكي */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight flex justify-center items-center gap-3">
          <Zap className="text-blue-500 animate-pulse" size={40} />
          {t.title}
        </h2>
        <p className="text-lg text-slate-400 font-medium leading-relaxed">{t.subtitle}</p>

        {/* زر التبديل شهري/سنوي السلس */}
        <div className="flex items-center justify-center mt-8">
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl inline-flex items-center relative select-none">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`relative z-10 px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 ${!isAnnual ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.monthly}
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`relative z-10 px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.annual}
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${isAnnual ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {t.save20}
              </span>
            </button>
            {/* المؤشر الميكانيكي */}
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-blue-600 rounded-xl transition-all duration-300 ease-out shadow-lg"
              style={{ left: isAnnual ? 'calc(50% + 3px)' : '6px' }}
            ></div>
          </div>
        </div>
      </div>

      {/* 💳 مصفوفة بطاقات الأسعار الحية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
        
        {/* باقة Starter */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all duration-300 relative shadow-xl">
          <h3 className="text-2xl font-black text-white mb-2">{t.plans.starter.name}</h3>
          <p className="text-sm text-slate-400 font-medium h-12 mb-6 leading-relaxed">{t.plans.starter.desc}</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-white">0</span>
            <span className="text-slate-500 font-bold ml-2">{t.currency} {isAnnual ? t.yr : t.mo}</span>
          </div>
          <button disabled className="w-full py-3.5 bg-slate-800 text-slate-400 font-black rounded-xl cursor-not-allowed border border-slate-700 mb-8 text-sm">
            {t.currentPlan}
          </button>
          <div className="space-y-4">
            {t.plans.starter.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-300">{feat}</span>
              </div>
            ))}
            {t.plans.starter.missing.map((feat, i) => (
              <div key={`m-${i}`} className="flex items-start gap-3 opacity-30">
                <Minus size={18} className="text-slate-600 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-500 line-through">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* باقة Pro ERP */}
        <div className="bg-slate-900 border-2 border-blue-600 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-blue-950/40 transition-all duration-300">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
            {t.plans.pro.badge}
          </div>
          <h3 className="text-2xl font-black text-white mb-2">{t.plans.pro.name}</h3>
          <p className="text-sm text-slate-400 font-medium h-12 mb-6 leading-relaxed">{t.plans.pro.desc}</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-white">
              {isAnnual ? prices.pro.annual.toLocaleString() : prices.pro.monthly.toLocaleString()}
            </span>
            <span className="text-slate-500 font-bold ml-2">{t.currency} {isAnnual ? t.yr : t.mo}</span>
          </div>
          <button 
            onClick={() => handleSubscribe('pro')} 
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/30 mb-8 flex justify-center items-center gap-2 group text-sm"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>{t.upgradeBtn} <ArrowRight size={16} className={`group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} /></>}
          </button>
          <div className="space-y-4">
            {t.plans.pro.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-white">{feat}</span>
              </div>
            ))}
            {t.plans.pro.missing.map((feat, i) => (
              <div key={`m-${i}`} className="flex items-start gap-3 opacity-30">
                <Minus size={18} className="text-slate-600 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-500 line-through">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* باقة Enterprise (Verified 🛡️) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.1)] group hover:border-amber-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/20">
            <ShieldCheck size={14} /> {t.plans.enterprise.badge}
          </div>
          
          <h3 className="text-2xl font-black text-amber-400 mb-2">{t.plans.enterprise.name}</h3>
          <p className="text-sm text-slate-300 font-medium h-12 mb-6 leading-relaxed relative z-10">{t.plans.enterprise.desc}</p>
          <div className="mb-8 relative z-10">
            <span className="text-5xl font-black text-white">
              {isAnnual ? prices.enterprise.annual.toLocaleString() : prices.enterprise.monthly.toLocaleString()}
            </span>
            <span className="text-slate-400 font-bold ml-2">{t.currency} {isAnnual ? t.yr : t.mo}</span>
          </div>
          <button 
            onClick={() => handleSubscribe('enterprise')}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all shadow-lg shadow-amber-500/30 mb-8 relative z-10 flex justify-center items-center gap-2 text-sm"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin text-black" /> : <>{t.contactSales} <Star size={16} className="fill-black" /></>}
          </button>
          <div className="space-y-4 relative z-10">
            {t.plans.enterprise.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-white">{feat}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}