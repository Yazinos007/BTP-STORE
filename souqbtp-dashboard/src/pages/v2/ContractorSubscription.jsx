import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  ShieldCheck, CheckCircle2, Zap, Star, ArrowRight, Minus, Loader2,
  X, Building2, CreditCard, Wallet, UploadCloud, Clock, MessageCircle
} from 'lucide-react';

export default function ContractorSubscription() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [isAnnual, setIsAnnual] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('virement');
  const [receiptFile, setReceiptFile] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [skipVip, setSkipVip] = useState(false);

  const translations = {
    ar: {
      trialMsg: 'فترة تجريبية : يتبقى لك 6 أيام على باقة Pro ERP',
      subscribeBtn: 'اشترك للاحتفاظ بالصلاحيات',
      title: 'باقات اشتراك الإمبراطورية (B2B)',
      subtitle: 'استثمر في النظام الذي يضاعف مبيعاتك ويحمي أرباحك. اختر التميز.',
      monthly: 'دفع شهري', annual: 'دفع سنوي', save20: 'وفر 20%', currency: 'درهم', mo: '/ شهر', yr: '/ سنة',
      currentPlan: 'باقتك الحالية', upgradeBtn: 'الترقية الآن', contactSales: 'تواصل مع المبيعات',
      successMsg: '🌟 تم تفعيل الباقة بنجاح!',
      plans: {
        starter: {
          name: 'Starter B2B',
          desc: 'مثالية للموردين الجدد لتنظيم المخزون وإصدار الفواتير.',
          features: ['إدارة المخزون المركزي الأساسية', 'إصدار فواتير B2B غير محدودة', 'حد أقصى 50 عميل في النظام', 'لوحة تحكم إحصائيات بسيطة'],
          missing: ['المحاسبة المتقدمة والـ CPC', 'الـ CRM الذكي للعملاء', 'رادار المناقصات الحية']
        },
        pro: {
          name: 'Pro ERP',
          desc: 'النظام المتكامل لإدارة التجارة، المحاسبة، والعملاء.',
          badge: 'الأكثر شعبية',
          features: ['كل ما في باقة Starter', 'نظام المحاسبة والـ CPC التلقائي', 'الـ CRM الذكي (تصنيف العملاء)', 'إرسال رسائل واتساب للتحصيل', 'عدد عملاء ووثائق غير محدود'],
          missing: ['شارة SouqBTP Verified الذهبية', 'رادار المناقصات الحية']
        },
        enterprise: {
          name: 'Enterprise (Verified)',
          desc: 'قوة الذكاء الاصطناعي واقتناص المناقصات لكبار الموردين.',
          badge: 'SouqBTP موثق 🛡️',
          features: ['كل ما في باقة Pro ERP', 'شارة "مقاول معتمد" الذهبية', 'رادار المناقصات الحية الجغرافي', 'نظام التدقيق المالي الآلي (AI Audit)', 'مدير حساب شخصي', 'أولوية الظهور المطلقة'],
          missing: []
        }
      },
      modal: {
        vipTitle: 'خدمة كبار العملاء VIP', vipWelcome: 'مرحباً بك في نادي النخبة', vipDesc: 'مدير حسابات شخصي جاهز لخدمتك وللإجابة عن كل استفساراتك.',
        waBtn: 'تواصل معنا عبر WhatsApp', payDirectBtn: 'أفضل الدفع مباشرة', paymentTitle: 'إتمام الدفع',
        plan: 'الباقة المحددة', total: 'المبلغ الإجمالي', chooseMethod: 'وسيلة الدفع:',
        bank: 'تحويل بنكي', cash: 'كاش بلوس / وفاكاش', card: 'البطاقة البنكية', soon: 'قريباً',
        bankMsg: 'يرجى تحويل المبلغ للحساب المهني التالي:', ben: 'المستفيد', ice: 'ICE',
        cashMsg: 'يرجى التحويل عبر كاش بلوس للمستفيد التالي:', name: 'الاسم', cin: 'CIN', phone: 'الهاتف',
        uploadTitle: 'ارفع وصل الدفع', uploadDesc: '(JPG, PNG, PDF)', chooseFile: 'اختر الملف',
        confirmBtn: 'تأكيد وإرسال', successTitle: 'تم الإرسال!', successDesc: 'جاري التحقق. سيتم التفعيل قريباً.'
      }
    },
    fr: {
      trialMsg: "Période d'essai : Il vous reste 6 jours sur le plan Pro ERP",
      subscribeBtn: "Abonnez-vous pour conserver l'accès",
      title: 'Abonnements Empire (B2B)',
      subtitle: 'Investissez dans le système qui multiplie vos ventes et protège vos marges. Choisissez l\'excellence.',
      monthly: 'Mensuel', annual: 'Annuel', save20: 'Économisez 20%', currency: 'MAD', mo: '/ mois', yr: '/ an',
      currentPlan: 'Votre plan actuel', upgradeBtn: 'Mettre à niveau', contactSales: 'Contacter les ventes',
      successMsg: '🌟 Plan mis à jour avec succès !',
      plans: {
        starter: {
          name: 'Starter B2B',
          desc: 'Idéal pour démarrer, organiser le stock et facturer.',
          features: ['Gestion centralisée du stock', 'Facturation B2B illimitée', 'Jusqu\'à 50 clients', 'Tableau de bord basique'],
          missing: ['Comptabilité avancée & CPC', 'CRM Intelligent', 'Radar d\'Appels d\'Offres']
        },
        pro: {
          name: 'Pro ERP',
          desc: 'Le système complet pour gérer le commerce et la compta.',
          badge: 'Le plus populaire',
          features: ['Tout de l\'offre Starter', 'Comptabilité & Bilan CPC automatisé', 'CRM Intelligent (Segmentation)', 'Relance client via WhatsApp', 'Clients et documents illimités'],
          missing: ['Badge SouqBTP Verified', 'Radar d\'Appels d\'Offres Live']
        },
        enterprise: {
          name: 'Enterprise (Verified)',
          desc: 'La puissance de l\'IA et la capture d\'appels d\'offres.',
          badge: 'SouqBTP Vérifié 🛡️',
          features: ['Tout de l\'offre Pro ERP', 'Badge d\'Or "Entrepreneur Certifié"', 'Radar d\'Appels d\'Offres Live', 'Audit Financier IA', 'Account Manager Dédié', 'Priorité absolue'],
          missing: []
        }
      },
      modal: {
        vipTitle: 'Service Client VIP', vipWelcome: 'Bienvenue dans le club d\'élite', vipDesc: 'Un manager de compte dédié est prêt à répondre à vos questions.',
        waBtn: 'Contactez-nous sur WhatsApp', payDirectBtn: 'Je préfère payer directement', paymentTitle: 'Finaliser le paiement',
        plan: 'Plan sélectionné', total: 'Total à payer', chooseMethod: 'Méthode de paiement :',
        bank: 'Virement Bancaire', cash: 'Cash Plus / Wafacash', card: 'Carte Bancaire', soon: 'Bientôt',
        bankMsg: 'Veuillez effectuer un virement vers le compte suivant :', ben: 'Bénéficiaire', ice: 'ICE',
        cashMsg: 'Veuillez effectuer un transfert via Cash Plus à :', name: 'Nom', cin: 'CIN', phone: 'Téléphone',
        uploadTitle: 'Télécharger le reçu', uploadDesc: '(JPG, PNG, PDF)', chooseFile: 'Choisir un fichier',
        confirmBtn: 'Confirmer et envoyer', successTitle: 'Reçu envoyé !', successDesc: 'Vérification en cours. Activation sous peu.'
      }
    },
    en: {
      trialMsg: 'Trial period: You have 6 days left on the Pro ERP plan',
      subscribeBtn: 'Subscribe to keep access',
      title: 'Empire Subscriptions (B2B)',
      subtitle: 'Invest in the system that multiplies your sales and protects your margins.',
      monthly: 'Monthly', annual: 'Annual', save20: 'Save 20%', currency: 'MAD', mo: '/ month', yr: '/ year',
      currentPlan: 'Current plan', upgradeBtn: 'Upgrade Now', contactSales: 'Contact Sales',
      successMsg: '🌟 Plan updated successfully!',
      plans: {
        starter: {
          name: 'Starter B2B',
          desc: 'Ideal for starting, organizing stock and invoicing.',
          features: ['Centralized stock management', 'Unlimited B2B invoicing', 'Up to 50 clients', 'Basic dashboard'],
          missing: ['Advanced Accounting & CPC', 'Smart CRM', 'Live Tenders Radar']
        },
        pro: {
          name: 'Pro ERP',
          desc: 'Complete system to manage trade and accounting.',
          badge: 'Most popular',
          features: ['Everything in Starter', 'Automated Accounting & CPC', 'Smart CRM (Segmentation)', 'WhatsApp client reminders', 'Unlimited clients & docs'],
          missing: ['SouqBTP Verified Badge', 'Live Tenders Radar']
        },
        enterprise: {
          name: 'Enterprise (Verified)',
          desc: 'AI power and tender capture for market leaders.',
          badge: 'SouqBTP Verified 🛡️',
          features: ['Everything in Pro ERP', 'Gold Badge "Certified Contractor"', 'Live Tenders Radar', 'AI Financial Audit', 'Dedicated Account Manager', 'Absolute priority'],
          missing: []
        }
      },
      modal: {
        vipTitle: 'VIP Client Service', vipWelcome: 'Welcome to the elite club', vipDesc: 'A dedicated account manager is ready to assist you.',
        waBtn: 'Contact on WhatsApp', payDirectBtn: 'Pay directly', paymentTitle: 'Finalize payment',
        plan: 'Selected Plan', total: 'Total', chooseMethod: 'Payment method:',
        bank: 'Bank Transfer', cash: 'Cash Plus', card: 'Credit Card', soon: 'Soon',
        bankMsg: 'Please transfer to the following account:', ben: 'Beneficiary', ice: 'ICE',
        cashMsg: 'Please transfer via Cash Plus to:', name: 'Name', cin: 'ID', phone: 'Phone',
        uploadTitle: 'Upload receipt', uploadDesc: '(JPG, PNG, PDF)', chooseFile: 'Choose file',
        confirmBtn: 'Confirm & Send', successTitle: 'Receipt sent!', successDesc: 'Verification in progress. Activation shortly.'
      }
    }
  };

  const t = translations[language] || translations.ar;
  const m = t.modal;

  const prices = {
    starter: { monthly: 0, annual: 0 },
    pro: { monthly: 499, annual: 4790 },
    enterprise: { monthly: 1499, annual: 14390 }
  };

  const handleUpgradeClick = (tierKey) => {
    const planData = t.plans[tierKey];
    const price = isAnnual ? prices[tierKey].annual : prices[tierKey].monthly;
    setSelectedPlan({ id: tierKey, name: planData.name, price: price });
    setSkipVip(false);
    setShowPaymentModal(true);
  };

  const handleReceiptUpload = (e) => {
    if (e.target.files[0]) {
      setReceiptFile(e.target.files[0].name);
    }
  };

  const submitPayment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        setReceiptFile(null);
      }, 4000); 
    }, 2000);
  };

  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="w-full h-full flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 شريط التجربة المجانية (Trial Banner) */}
      <div className="w-full bg-orange-500/10 border-b border-orange-500/20 py-2.5 px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 shadow-md backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
          <Clock size={18} className="animate-pulse" />
          <span>{t.trialMsg}</span>
        </div>
        <button onClick={() => handleUpgradeClick('pro')} className="bg-orange-500 hover:bg-orange-400 text-slate-900 px-4 py-1.5 rounded-lg font-black uppercase text-[10px] tracking-widest transition-colors flex items-center gap-1 shadow-lg shadow-orange-500/20">
          <Zap size={14} /> {t.subscribeBtn} <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24 px-4 w-full">
        {/* 🚀 Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mt-8">
          <h2 className={`text-4xl md:text-5xl font-black ${textMain} tracking-tight flex justify-center items-center gap-3`}>
            <Zap className="text-blue-500 animate-pulse" size={40} />
            {t.title}
          </h2>
          <p className={`text-lg ${textMuted} font-medium leading-relaxed`}>{t.subtitle}</p>

          {/* 🚀 Toggle Billing - تصميم الكبسولة الجديد */}
          <div className="flex items-center justify-center mt-8">
            <div className={`p-1.5 rounded-full inline-flex items-center relative select-none shadow-inner ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100 border border-slate-300'}`}>
              <button onClick={() => setIsAnnual(false)} className={`relative z-10 px-8 py-3 rounded-full font-black text-sm transition-all duration-300 ${!isAnnual ? 'text-white' : textMuted}`}>
                {t.monthly}
              </button>
              <button onClick={() => setIsAnnual(true)} className={`relative z-10 px-8 py-3 rounded-full font-black text-sm transition-all duration-300 flex items-center gap-2 ${isAnnual ? 'text-white' : textMuted}`}>
                {t.annual}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${isAnnual ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-500/20 text-emerald-600'}`}>
                  {t.save20}
                </span>
              </button>
              <div className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-blue-600 rounded-full transition-all duration-500 ease-out shadow-lg" style={{ [isRtl ? 'right' : 'left']: isAnnual ? 'calc(50% + 3px)' : '6px' }}></div>
            </div>
          </div>
        </div>

        {/* 🚀 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-12 pt-6">
          
          {/* Starter Plan */}
          <div className={`${bgMain} border-2 rounded-[2.5rem] p-8 hover:border-blue-500/50 transition-all duration-500 relative shadow-xl text-start flex flex-col`}>
            <h3 className={`text-2xl font-black ${textMain} mb-2`}>{t.plans.starter.name}</h3>
            <p className={`text-sm ${textMuted} font-medium h-12 mb-6 leading-relaxed`}>{t.plans.starter.desc}</p>
            <div className="mb-8">
              <span className={`text-6xl font-black ${textMain}`} dir="ltr">0</span>
              <span className={`font-bold ml-2 ${textMuted}`}>{t.currency} {isAnnual ? t.yr : t.mo}</span>
            </div>
            <button disabled className={`w-full py-4 font-black rounded-2xl cursor-not-allowed border-2 mb-8 text-sm uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
              {t.currentPlan}
            </button>
            <div className="space-y-5 flex-1">
              {t.plans.starter.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                  <span className={`text-sm font-bold ${textMain}`}>{feat}</span>
                </div>
              ))}
              {t.plans.starter.missing.map((feat, i) => (
                <div key={`m-${i}`} className="flex items-start gap-3 opacity-40">
                  <Minus size={20} className="text-slate-500 shrink-0 mt-0.5" />
                  <span className={`text-sm font-bold text-slate-500 line-through`}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan (Popular) */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-blue-600' : 'bg-white border-blue-500'} border-2 rounded-[2.5rem] p-8 relative transform lg:-translate-y-6 shadow-2xl shadow-blue-600/20 transition-all duration-500 text-start flex flex-col`}>
            {/* الشارة البارزة (Cutout effect) */}
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg border-4 ${isDarkMode ? 'border-slate-900' : 'border-white'}`}>
              {t.plans.pro.badge}
            </div>
            <h3 className={`text-2xl font-black ${textMain} mb-2 mt-2`}>{t.plans.pro.name}</h3>
            <p className={`text-sm ${textMuted} font-medium h-12 mb-6 leading-relaxed`}>{t.plans.pro.desc}</p>
            <div className="mb-8">
              <span className={`text-6xl font-black ${textMain} font-mono`} dir="ltr">
                {isAnnual ? prices.pro.annual.toLocaleString() : prices.pro.monthly.toLocaleString()}
              </span>
              <span className={`font-bold ml-2 ${textMuted}`}>{t.currency} {isAnnual ? t.yr : t.mo}</span>
            </div>
            <button onClick={() => handleUpgradeClick('pro')} disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/30 mb-8 flex justify-center items-center gap-2 group text-sm uppercase tracking-widest">
              {t.upgradeBtn} <ArrowRight size={18} className={`group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </button>
            <div className="space-y-5 flex-1">
              {t.plans.pro.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                  <span className={`text-sm font-bold ${textMain}`}>{feat}</span>
                </div>
              ))}
              {t.plans.pro.missing.map((feat, i) => (
                <div key={`m-${i}`} className="flex items-start gap-3 opacity-40">
                  <Minus size={20} className="text-slate-500 shrink-0 mt-0.5" />
                  <span className={`text-sm font-bold text-slate-500 line-through`}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className={`bg-gradient-to-br ${isDarkMode ? 'from-slate-900 to-slate-950 border-amber-500/50' : 'from-amber-50 to-white border-amber-300'} border-2 rounded-[2.5rem] p-8 relative shadow-[0_0_40px_rgba(245,158,11,0.15)] group hover:border-amber-400 transition-all duration-500 text-start flex flex-col overflow-visible`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            {/* الشارة البارزة باللون الذهبي */}
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/30 z-20 border-4 ${isDarkMode ? 'border-slate-900' : 'border-[#fffbeb]'}`}>
              <ShieldCheck size={16} /> {t.plans.enterprise.badge}
            </div>
            
            <h3 className="text-2xl font-black text-amber-500 mb-2 relative z-10 mt-2">{t.plans.enterprise.name}</h3>
            <p className={`text-sm ${textMuted} font-medium h-12 mb-6 leading-relaxed relative z-10`}>{t.plans.enterprise.desc}</p>
            <div className="mb-8 relative z-10">
              <span className={`text-6xl font-black ${textMain} font-mono`} dir="ltr">
                {isAnnual ? prices.enterprise.annual.toLocaleString() : prices.enterprise.monthly.toLocaleString()}
              </span>
              <span className={`font-bold ml-2 ${textMuted}`}>{t.currency} {isAnnual ? t.yr : t.mo}</span>
            </div>
            
            <button 
              onClick={() => handleUpgradeClick('enterprise')}
              disabled={isSubmitting} 
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-900 font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.6)] mb-8 relative z-10 flex justify-center items-center gap-2 text-sm uppercase tracking-widest animate-pulse hover:animate-none"
            >
              {t.contactSales} <Star size={18} className="fill-slate-900" />
            </button>
            
            <div className="space-y-5 relative z-10 flex-1">
              {t.plans.enterprise.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className={`text-sm font-bold ${textMain}`}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 💳 Payment Modal */}
        {showPaymentModal && selectedPlan && m && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={`${bgMain} border-2 rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]`}>
              
              <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'}`}>
                <h3 className={`text-2xl font-black ${textMain} flex items-center gap-3`}>
                  <ShieldCheck className="text-blue-500" size={28}/> 
                  {selectedPlan?.id === 'enterprise' && !skipVip ? m.vipTitle : m.paymentTitle}
                </h3>
                <button onClick={() => setShowPaymentModal(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                  <X size={20} />
                </button>
              </div>

              {selectedPlan?.id === 'enterprise' && !skipVip ? (
                <div className="p-10 text-center flex flex-col items-center justify-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    <Star size={50} className="text-slate-900 fill-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-amber-500 mb-3">{m.vipWelcome}</h4>
                    <p className={`text-lg ${textMuted} font-bold`}>{m.vipDesc}</p>
                  </div>
                  <a href={`https://wa.me/212700715399?text=${encodeURIComponent(isRtl ? 'مرحباً، أود الاستفسار عن باقة Enterprise.' : 'Bonjour, je souhaite me renseigner sur le plan Enterprise.')}`} target="_blank" rel="noopener noreferrer" className="w-full max-w-md py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-lg hover:scale-105 flex justify-center items-center gap-3 text-lg mt-6">
                    <MessageCircle size={24}/> {m.waBtn}
                  </a>
                  <button onClick={() => setSkipVip(true)} className={`font-bold text-sm transition-colors underline underline-offset-4 mt-4 ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                    {m.payDirectBtn}
                  </button>
                </div>
              ) : paymentSuccess ? (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-28 h-28 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={60} />
                  </div>
                  <h4 className={`text-3xl font-black ${textMain} mb-3`}>{m.successTitle}</h4>
                  <p className={`${textMuted} font-bold text-lg`}>{m.successDesc}</p>
                </div>
              ) : (
                <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className={`p-5 rounded-2xl border-2 mb-8 flex justify-between items-center ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <p className={`font-black text-xs uppercase tracking-widest ${textMuted} mb-1`}>{m.plan}</p>
                      <p className={`text-xl font-black ${textMain}`}>{selectedPlan?.name}</p>
                    </div>
                    <div className={isRtl ? 'text-left' : 'text-right'}>
                      <p className={`font-black text-xs uppercase tracking-widest ${textMuted} mb-1`}>{m.total}</p>
                      <p className="text-3xl font-black text-emerald-500 font-mono" dir="ltr">{selectedPlan?.price.toLocaleString()} <span className="text-sm">MAD</span></p>
                    </div>
                  </div>

                  <h4 className={`font-black ${textMain} mb-4`}>{m.chooseMethod}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button onClick={() => setPaymentMethod('virement')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'virement' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : (isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300')}`}>
                      <Building2 size={32} /> <span className="font-bold text-sm">{m.bank}</span>
                    </button>
                    <button onClick={() => setPaymentMethod('cash')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'cash' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : (isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300')}`}>
                      <Wallet size={32} /> <span className="font-bold text-sm">{m.cash}</span>
                    </button>
                    <button disabled className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 cursor-not-allowed relative overflow-hidden ${isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-600' : 'border-slate-200 bg-slate-100 text-slate-400'}`}>
                      <CreditCard size={32} /> <span className="font-bold text-sm">{m.card}</span>
                      <div className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'}`}>{m.soon}</div>
                    </button>
                  </div>

                  <div className={`border-2 p-6 rounded-2xl mb-8 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    {paymentMethod === 'virement' && (
                      <div className="space-y-4">
                        <p className={`text-sm font-bold ${textMuted} mb-4`}>{m.bankMsg}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <span className={`block mb-1 font-bold ${textMuted}`}>{m.ben}</span>
                            <strong className={`font-black ${textMain}`}>BACHIR YASSINE</strong>
                          </div>
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <span className={`block mb-1 font-bold ${textMuted}`}>{m.ice}</span>
                            <strong className={`font-black ${textMain} tracking-widest`} dir="ltr">003460220000095</strong>
                          </div>
                          <div className={`p-4 rounded-xl border md:col-span-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <span className={`block mb-2 font-bold ${textMuted}`}>RIB</span>
                            <strong className="text-blue-500 text-xl tracking-widest font-mono font-black" dir="ltr">225 104 0447028246010126 97</strong>
                            <p className={`text-xs mt-2 font-bold ${textMuted}`}>{language === 'ar' ? 'البنك' : 'Banque'}: CREDIT AGRICOLE DU MAROC</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cash' && (
                      <div className="space-y-4">
                        <p className={`text-sm font-bold ${textMuted} mb-4`}>{m.cashMsg}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <span className={`block mb-1 font-bold ${textMuted}`}>{m.name}</span>
                            <strong className={`font-black ${textMain}`}>BACHIR Yassine</strong>
                          </div>
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <span className={`block mb-1 font-bold ${textMuted}`}>{m.cin}</span>
                            <strong className={`font-black ${textMain} tracking-widest`} dir="ltr">IA83571</strong>
                          </div>
                          <div className={`p-4 rounded-xl border md:col-span-2 flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div>
                              <span className={`block mb-1 font-bold ${textMuted}`}>{m.phone}</span>
                              <strong className="text-amber-500 text-xl tracking-widest font-mono font-black" dir="ltr">07 00 71 53 99</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 🚀 الزر الواضح الذي طلبته لرفع الملفات */}
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${receiptFile ? 'border-emerald-500 bg-emerald-500/10' : (isDarkMode ? 'border-slate-700 bg-slate-900/50 hover:border-blue-500' : 'border-slate-300 bg-slate-50 hover:border-blue-400')}`}>
                    <UploadCloud size={40} className={`mx-auto mb-4 ${receiptFile ? 'text-emerald-500' : textMuted}`} />
                    <p className={`font-black mb-1 ${textMain}`}>{m.uploadTitle}</p>
                    <p className={`text-sm font-bold mb-6 ${textMuted}`}>{m.uploadDesc}</p>
                    
                    <label className="cursor-pointer px-8 py-3.5 rounded-xl font-black transition-all inline-block bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                      {receiptFile ? <span className="flex items-center gap-2" dir="ltr"><CheckCircle2 size={18}/> {receiptFile.slice(0, 15)}...</span> : m.chooseFile}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleReceiptUpload} />
                    </label>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800/50">
                    <button onClick={submitPayment} disabled={!receiptFile || isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3">
                      {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : m.confirmBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}