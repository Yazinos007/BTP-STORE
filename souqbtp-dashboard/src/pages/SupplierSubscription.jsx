import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../store/useSettingsStore';
import { 
  ShieldCheck, CheckCircle2, Zap, Star, ArrowRight, Minus, Loader2,
  X, Building2, CreditCard, Wallet, UploadCloud 
} from 'lucide-react';

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
    successMsg: '🌟 تم تفعيل الباقة وتحديث صلاحيات النظام بنجاح!',
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
        badge: 'SouqBTP موثق 🛡️',
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
    },
    modal: {
      vipTitle: 'خدمة كبار العملاء VIP', vipWelcome: 'مرحباً بك في نادي النخبة', vipDesc: 'لأنك اخترت الباقة الأقوى، خصصنا لك مدير حسابات شخصي.',
      waBtn: 'تحدث معنا عبر WhatsApp', payDirectBtn: 'أفضل الدفع مباشرة', paymentTitle: 'إتمام عملية الدفع',
      plan: 'الباقة المحددة', total: 'المبلغ الإجمالي', chooseMethod: 'اختر وسيلة الدفع:',
      bank: 'تحويل بنكي', cash: 'كاش بلوس / وفاكاش', card: 'البطاقة البنكية', soon: 'قريباً',
      bankMsg: 'يرجى إجراء تحويل بنكي للحساب المهني التالي:', ben: 'المستفيد (المقاول الذاتي)', ice: 'رقم التعريف ICE',
      cashMsg: 'يرجى إجراء تحويل عبر كاش بلوس للمستفيد التالي:', name: 'الاسم الكامل', cin: 'رقم البطاقة الوطنية', phone: 'رقم الهاتف',
      uploadTitle: 'ارفع وصل الدفع (Reçu)', uploadDesc: 'صورة أو ملف (JPG, PNG, PDF)', chooseFile: 'اختر الملف',
      confirmBtn: 'تأكيد وإرسال الوصل', successTitle: 'تم إرسال الوصل بنجاح!', successDesc: 'جاري التحقق من التحويل. سيتم تفعيل حسابك قريباً.'
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
    successMsg: '🌟 Plan mis à jour avec succès et permissions activées !',
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
        badge: 'SouqBTP Vérifié 🛡️',
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
    },
    modal: {
      vipTitle: 'Service Client VIP', vipWelcome: 'Bienvenue dans le club d\'élite', vipDesc: 'Un manager de compte dédié est prêt à répondre à vos questions.',
      waBtn: 'Contactez-nous sur WhatsApp', payDirectBtn: 'Je préfère payer directement', paymentTitle: 'Finaliser le paiement',
      plan: 'Plan sélectionné', total: 'Total à payer', chooseMethod: 'Choisissez votre méthode de paiement :',
      bank: 'Virement Bancaire', cash: 'Cash Plus / Wafacash', card: 'Carte Bancaire', soon: 'Bientôt',
      bankMsg: 'Veuillez effectuer un virement vers le compte professionnel suivant :', ben: 'Bénéficiaire', ice: 'ICE',
      cashMsg: 'Veuillez effectuer un transfert via Cash Plus ou Wafacash à :', name: 'Nom Complet', cin: 'N° CIN', phone: 'Téléphone',
      uploadTitle: 'Télécharger le reçu', uploadDesc: 'Photo ou scan du reçu (JPG, PNG, PDF)', chooseFile: 'Choisir un fichier',
      confirmBtn: 'Confirmer et envoyer', successTitle: 'Reçu envoyé avec succès !', successDesc: 'Vérification en cours. Votre compte sera activé sous peu.'
    }
  },
  en: {
    title: 'Empire B2B Subscriptions',
    subtitle: 'Invest in the system that multiplies your sales and protects your margins. Choose excellence.',
    monthly: 'Monthly',
    annual: 'Annual',
    save20: 'Save 20%',
    currency: 'MAD',
    mo: '/ month',
    yr: '/ year',
    currentPlan: 'Your current plan',
    upgradeBtn: 'Upgrade Now',
    contactSales: 'Contact Sales',
    successMsg: '🌟 Plan successfully updated and permissions enabled!',
    plans: {
      starter: {
        name: 'Starter B2B',
        desc: 'Ideal for starting, organizing inventory, and issuing legal invoices.',
        features: [
          'Centralized inventory management',
          'Unlimited B2B invoicing',
          'Up to 50 clients in the system',
          'Simple analytics dashboard',
        ],
        missing: ['Advanced Accounting & CPC', 'Smart Client CRM', 'Live Tenders Radar']
      },
      pro: {
        name: 'Pro ERP',
        desc: 'Complete system to manage major trade, accounting, CRM, and contracts.',
        badge: 'Most Popular',
        features: [
          'Everything in Starter',
          'Automated accounting & CPC system',
          'Smart CRM (Segmentation)',
          'WhatsApp reminders for collection',
          'Shared Logistics Optimizer',
          'Unlimited clients and documents'
        ],
        missing: ['SouqBTP Verified Gold Badge', 'Live Tenders Radar']
      },
      enterprise: {
        name: 'Enterprise (Verified)',
        desc: 'AI power and geographic tender capture for major suppliers.',
        badge: 'SouqBTP Verified 🛡️',
        features: [
          'Everything in Pro ERP',
          'Gold "Certified Supplier" badge',
          'Live Geo-localized Tenders Radar',
          'Proactive Price Prediction Radar',
          'Dedicated Account Manager & Accountant',
          'Absolute priority visibility for merchants'
        ],
        missing: []
      }
    },
    modal: {
      vipTitle: 'VIP Client Service', vipWelcome: 'Welcome to the Elite Club', vipDesc: 'A dedicated account manager is ready to assist you.',
      waBtn: 'Chat with us on WhatsApp', payDirectBtn: 'I prefer to pay directly', paymentTitle: 'Finalize Payment',
      plan: 'Selected Plan', total: 'Total to pay', chooseMethod: 'Choose payment method:',
      bank: 'Bank Transfer', cash: 'Cash Plus / Wafacash', card: 'Credit Card', soon: 'Soon',
      bankMsg: 'Please make a bank transfer to the following professional account:', ben: 'Beneficiary', ice: 'ICE',
      cashMsg: 'Please make a transfer via Cash Plus or Wafacash to:', name: 'Full Name', cin: 'ID Number', phone: 'Phone',
      uploadTitle: 'Upload Payment Receipt', uploadDesc: 'Photo or scan (JPG, PNG, PDF)', chooseFile: 'Choose file',
      confirmBtn: 'Confirm and Send', successTitle: 'Receipt sent successfully!', successDesc: 'Verification in progress. Your account will be activated shortly.'
    }
  }
};

export default function SupplierSubscription() {
  const { language } = useSettingsStore();
  const t = translations[language] || translations['fr'];
  const m = t.modal;
  
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

  const prices = {
    starter: { monthly: 0, annual: 0 },
    pro: { monthly: 499, annual: 4790 },
    enterprise: { monthly: 1499, annual: 14390 }
  };

  const handleUpgradeClick = (tierKey) => {
    const planData = t.plans[tierKey];
    const price = isAnnual ? prices[tierKey].annual : prices[tierKey].monthly;
    setSelectedPlan({ name: planData.name, price: price });
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

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in text-slate-300 pb-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight flex justify-center items-center gap-3">
          <Zap className="text-blue-500 animate-pulse" size={40} />
          {t.title}
        </h2>
        <p className="text-lg text-slate-400 font-medium leading-relaxed">{t.subtitle}</p>

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
            
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-blue-600 rounded-xl transition-all duration-300 ease-out shadow-lg"
              style={{ [language === 'ar' ? 'right' : 'left']: isAnnual ? 'calc(50% + 3px)' : '6px' }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
        {/* Starter */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all duration-300 relative shadow-xl text-start">
          <h3 className="text-2xl font-black text-white mb-2">{t.plans.starter.name}</h3>
          <p className="text-sm text-slate-400 font-medium h-12 mb-6 leading-relaxed">{t.plans.starter.desc}</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-white" dir="ltr">0</span>
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

        {/* Pro ERP */}
        <div className="bg-slate-900 border-2 border-blue-600 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-blue-950/40 transition-all duration-300 text-start">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
            {t.plans.pro.badge}
          </div>
          <h3 className="text-2xl font-black text-white mb-2">{t.plans.pro.name}</h3>
          <p className="text-sm text-slate-400 font-medium h-12 mb-6 leading-relaxed">{t.plans.pro.desc}</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-white" dir="ltr">
              {isAnnual ? prices.pro.annual.toLocaleString() : prices.pro.monthly.toLocaleString()}
            </span>
            <span className="text-slate-500 font-bold ml-2">{t.currency} {isAnnual ? t.yr : t.mo}</span>
          </div>
          <button 
            onClick={() => handleUpgradeClick('pro')} 
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/30 mb-8 flex justify-center items-center gap-2 group text-sm"
          >
            <>{t.upgradeBtn} <ArrowRight size={16} className={`group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} /></>
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

        {/* Enterprise - تمت إزالة overflow-hidden هنا */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(245,158,11,0.1)] group hover:border-amber-400 transition-all duration-300 text-start">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          {/* إضافة z-20 للشارة لتظهر دائماً فوق كل شيء */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/20 z-20">
            <ShieldCheck size={14} /> {t.plans.enterprise.badge}
          </div>
          
          <h3 className="text-2xl font-black text-amber-400 mb-2">{t.plans.enterprise.name}</h3>
          <p className="text-sm text-slate-300 font-medium h-12 mb-6 leading-relaxed relative z-10">{t.plans.enterprise.desc}</p>
          <div className="mb-8 relative z-10">
            <span className="text-5xl font-black text-white" dir="ltr">
              {isAnnual ? prices.enterprise.annual.toLocaleString() : prices.enterprise.monthly.toLocaleString()}
            </span>
            <span className="text-slate-400 font-bold ml-2">{t.currency} {isAnnual ? t.yr : t.mo}</span>
          </div>
          <button 
            onClick={() => handleUpgradeClick('enterprise')}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all shadow-lg shadow-amber-500/30 mb-8 relative z-10 flex justify-center items-center gap-2 text-sm"
          >
            <>{t.contactSales} <Star size={16} className="fill-black" /></>
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

      {/* 💳 Payment Modal */}
      {showPaymentModal && selectedPlan && m && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" /> 
                {selectedPlan?.name === 'Enterprise (Verified)' && !skipVip ? m.vipTitle : m.paymentTitle}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* 👑 معالجة خاصة لباقة Enterprise */}
            {selectedPlan?.name === 'Enterprise (Verified)' && !skipVip ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  <Star size={40} className="text-black fill-current" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-amber-400 mb-2">{m.vipWelcome}</h4>
                  <p className="text-slate-300">{m.vipDesc}</p>
                </div>
                
                <a 
                  href={`https://wa.me/212700715399?text=${encodeURIComponent(language === 'ar' ? 'مرحباً، أود الاستفسار عن باقة Enterprise السنوية.' : 'Bonjour, je souhaite me renseigner sur le plan Enterprise.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black rounded-xl transition-all shadow-lg hover:scale-105 flex justify-center items-center gap-3 text-lg"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  {m.waBtn}
                </a>
                
                <button onClick={() => setSkipVip(true)} className="text-slate-400 font-bold text-sm hover:text-white transition-colors underline decoration-slate-600 underline-offset-4 mt-2">
                  {m.payDirectBtn}
                </button>
              </div>
            ) : paymentSuccess ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={50} />
                </div>
                <h4 className="text-3xl font-black text-white mb-2">{m.successTitle}</h4>
                <p className="text-slate-400 font-medium text-lg">{m.successDesc}</p>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8 flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 font-bold text-sm">{m.plan}</p>
                    <p className="text-xl font-black text-white">{selectedPlan?.name}</p>
                  </div>
                  <div className={language === 'ar' ? 'text-left' : 'text-right'}>
                    <p className="text-slate-400 font-bold text-sm">{m.total}</p>
                    <p className="text-2xl font-black text-emerald-400" dir="ltr">{selectedPlan?.price} MAD</p>
                  </div>
                </div>

                <h4 className="font-bold text-white mb-4">{m.chooseMethod}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <button onClick={() => setPaymentMethod('virement')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'virement' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'}`}>
                    <Building2 size={28} />
                    <span className="font-bold text-sm">{m.bank}</span>
                  </button>
                  <button onClick={() => setPaymentMethod('cash')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'}`}>
                    <Wallet size={28} />
                    <span className="font-bold text-sm">{m.cash}</span>
                  </button>
                  <button disabled className="p-4 rounded-xl border-2 border-slate-800 bg-slate-900/50 text-slate-600 flex flex-col items-center gap-2 cursor-not-allowed relative overflow-hidden">
                    <CreditCard size={28} />
                    <span className="font-bold text-sm">{m.card}</span>
                    <div className="absolute top-2 right-2 bg-slate-800 text-[10px] font-black px-2 py-0.5 rounded text-slate-400">{m.soon}</div>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl mb-8">
                  {paymentMethod === 'virement' && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-slate-400 mb-4">{m.bankMsg}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block mb-1">{m.ben}</span>
                          <strong className="text-white">BACHIR YASSINE</strong>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block mb-1">{m.ice}</span>
                          <strong className="text-white tracking-widest" dir="ltr">003460220000095</strong>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 md:col-span-2">
                          <span className="text-slate-500 block mb-1">RIB</span>
                          <strong className="text-emerald-400 text-lg tracking-widest font-mono" dir="ltr">225 104 0447028246010126 97</strong>
                          <p className="text-xs mt-1 text-slate-500">{language === 'ar' ? 'البنك' : 'Banque'}: CREDIT AGRICOLE DU MAROC</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-slate-400 mb-4">{m.cashMsg}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block mb-1">{m.name}</span>
                          <strong className="text-white">BACHIR Yassine</strong>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block mb-1">{m.cin}</span>
                          <strong className="text-white tracking-widest" dir="ltr">IA83571</strong>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 md:col-span-2">
                          <span className="text-slate-500 block mb-1">{m.phone}</span>
                          <strong className="text-amber-400 text-lg tracking-widest font-mono" dir="ltr">07 00 71 53 99</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/50 rounded-2xl p-8 text-center transition-colors">
                  <UploadCloud size={40} className="mx-auto text-slate-500 mb-3" />
                  <p className="text-white font-bold mb-1">{m.uploadTitle}</p>
                  <p className="text-sm text-slate-500 mb-4">{m.uploadDesc}</p>
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors inline-block">
                    {receiptFile ? <span className="text-emerald-400 flex items-center gap-2" dir="ltr"><CheckCircle2 size={18}/> {receiptFile}</span> : m.chooseFile}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleReceiptUpload} />
                  </label>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={submitPayment} 
                    disabled={!receiptFile || isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : m.confirmBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}