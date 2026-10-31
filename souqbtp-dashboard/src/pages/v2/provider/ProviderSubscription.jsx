import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Trophy, ArrowLeft, ArrowRight, Sparkles, Lock,
  ShieldCheck, Building2, Wallet, CreditCard, UploadCloud, X, Copy, Check, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';

const BANK_INFO = {
  beneficiary: "BACHIR YASSINE",
  cin: "IA83571",
  phone: "07 00 71 53 99",
  ice: "003460220000095",
  rib: "225 104 0447028246010126 97",
  bank: "CREDIT AGRICOLE DU MAROC",
  whatsappPhone: "212700715399"
};

const translations = {
  ar: {
    topBadge: 'استثمر في حرفتك وضاعف مداخيلك',
    title: 'باقة بحجم فنجان قهوة.. تفتح لك أوراشاً بآلاف الدراهم!',
    subtitle: 'لا تنتظر الزبون بالصدفة. فعّل أدوات المعلم الذكي، التقط الأوراش القريبة منك فوراً، وادخل نادي الشركاء المعتمدين.',
    monthly: 'اشتراك شهري',
    yearly: 'اشتراك سنوي',
    twoMonthsFree: 'شهران مجاناً',
    discountBadge: 'وفر 20%', // إضافة نسبة الخصم
    activePlanBadge: '✅ باقتك مفعلة حالياً',
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
    bannerBtn: 'اكتشف لوحة الأرباح',

    // Checkout Modal
    checkoutTitle: 'إتمام عملية الدفع',
    selectedPlanLabel: 'الباقة المختارة',
    totalToPayLabel: 'الإجمالي للدفع',
    paymentMethodLabel: 'طريقة الدفع :',
    payBank: 'تحويل بنكي',
    payCash: 'Cash Plus / Wafacash',
    payWithCard: 'بطاقة بنكية',
    soonBadge: 'قريباً',
    bankTransferInst: 'يرجى إجراء تحويل بنكي إلى الحساب التالي :',
    cashTransferInst: 'يرجى إرسال المبلغ عبر Cash Plus أو Wafacash باسم المستفيد التالي :',
    beneficiaryLabel: 'المستفيد (Bénéficiaire)',
    iceCompanyLabel: 'ICE',
    ribLabel: 'RIB',
    bankNameLabel: 'البنك: CREDIT AGRICOLE DU MAROC',
    providerNameLabel: 'الاسم الكامل / اسم الورشة',
    providerNamePlace: 'مثال: المعلم محمد للصباغة والديكور',
    providerPhoneLabel: 'رقم الهاتف (واتساب للتفعيل السريع)',
    providerPhonePlace: '0600000000',
    uploadReceiptTitle: 'تحميل وصل الدفع (صورة أو PDF)',
    uploadReceiptSub: 'اضغط هنا لاختيار صورة الوصل لتأكيد اشتراكك',
    receiptSelected: 'تم إرفاق الوصل:',
    processing: '⏳ جاري تأكيد الاشتراك ورفع الوصل...',
    confirmPayment: '✅ تأكيد وإرسال وصل الدفع',
    whatsappSupport: 'تحتاج مساعدة؟ تواصل معنا عبر واتساب',
    secureData: '🔒 بياناتك مشفرة ومحمية بالكامل.',
    cancelBtn: 'إلغاء' // تمت إضافة زر الإلغاء
  },
  fr: {
    topBadge: 'Investissez dans votre métier et doublez vos revenus',
    title: 'Un abonnement au prix d\'un café.. qui vous ouvre des chantiers à milliers de dirhams !',
    subtitle: 'N\'attendez plus les clients par hasard. Activez les outils de l\'Artisan Intelligent, captez les chantiers proches de vous et rejoignez le club des partenaires certifiés.',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    twoMonthsFree: '2 mois offerts',
    discountBadge: 'Économisez 20%', // إضافة نسبة الخصم
    activePlanBadge: '✅ Plan Actif',
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
    bannerBtn: 'Découvrir mes gains',

    // Checkout Modal
    checkoutTitle: 'Finaliser le paiement',
    selectedPlanLabel: 'PLAN SÉLECTIONNÉ',
    totalToPayLabel: 'TOTAL À PAYER',
    paymentMethodLabel: 'Méthode de paiement :',
    payBank: 'Virement Bancaire',
    payCash: 'Cash Plus / Wafacash',
    payWithCard: 'Carte Bancaire',
    soonBadge: 'BIENTÔT',
    bankTransferInst: 'Veuillez effectuer un virement vers le compte suivant :',
    cashTransferInst: 'Veuillez effectuer le transfert via Cash Plus ou Wafacash au nom du bénéficiaire suivant :',
    beneficiaryLabel: 'Bénéficiaire',
    iceCompanyLabel: 'ICE',
    ribLabel: 'RIB',
    bankNameLabel: 'Banque: CREDIT AGRICOLE DU MAROC',
    providerNameLabel: 'Nom complet / Nom de l\'atelier',
    providerNamePlace: 'Ex: Maâlem Mohammed Peinture',
    providerPhoneLabel: 'Téléphone (WhatsApp pour activation rapide)',
    providerPhonePlace: '0600000000',
    uploadReceiptTitle: 'Télécharger le reçu',
    uploadReceiptSub: 'Cliquez pour joindre la photo ou le PDF du reçu',
    receiptSelected: 'Reçu joint :',
    processing: '⏳ Activation en cours...',
    confirmPayment: '✅ Confirmer et envoyer le reçu',
    whatsappSupport: 'Besoin d\'aide ? Contactez-nous sur WhatsApp',
    secureData: '🔒 Vos données sont entièrement cryptées et protégées.',
    cancelBtn: 'Annuler' // تمت إضافة زر الإلغاء
  },
  en: {
    topBadge: 'Invest in your craft & multiply your income',
    title: 'A plan for the price of a coffee.. unlocking projects worth thousands of dirhams!',
    subtitle: 'Stop waiting for clients by chance. Activate Smart Artisan tools, catch nearby projects instantly, and join the certified partners club.',
    monthly: 'Monthly Billing',
    yearly: 'Yearly Billing',
    twoMonthsFree: '2 Months Free',
    discountBadge: 'Save 20%', // إضافة نسبة الخصم
    activePlanBadge: '✅ Active Plan',
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
    bannerBtn: 'Explore Affiliate Dashboard',

    // Checkout Modal
    checkoutTitle: 'Finalize Payment',
    selectedPlanLabel: 'SELECTED PLAN',
    totalToPayLabel: 'TOTAL TO PAY',
    paymentMethodLabel: 'Payment Method:',
    payBank: 'Bank Transfer',
    payCash: 'Cash Plus / Wafacash',
    payWithCard: 'Bank Card',
    soonBadge: 'SOON',
    bankTransferInst: 'Please make a bank transfer to the following account:',
    cashTransferInst: 'Please send the amount via Cash Plus or Wafacash to the following beneficiary:',
    beneficiaryLabel: 'Beneficiary',
    iceCompanyLabel: 'ICE',
    ribLabel: 'RIB',
    bankNameLabel: 'Bank: CREDIT AGRICOLE DU MAROC',
    providerNameLabel: 'Full Name / Workshop Name',
    providerNamePlace: 'E.g.: Maalem Mohammed Painting',
    providerPhoneLabel: 'Phone Number (WhatsApp)',
    providerPhonePlace: '0600000000',
    uploadReceiptTitle: 'Upload Receipt',
    uploadReceiptSub: 'Click to attach receipt image or PDF',
    receiptSelected: 'Attached receipt:',
    processing: '⏳ Activating Subscription...',
    confirmPayment: '✅ Confirm & Submit Receipt',
    whatsappSupport: 'Need help? Contact us on WhatsApp',
    secureData: '🔒 Your data is fully encrypted and protected.',
    cancelBtn: 'Cancel' // تمت إضافة زر الإلغاء
  }
};

export default function ProviderSubscription() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;
  const navigate = useNavigate();

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentPlan, setCurrentPlan] = useState('free');
  const [providerName, setProviderName] = useState('');
  const [providerPhone, setProviderPhone] = useState('');

  // Checkout Modal States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' | 'cash'
  const [receiptFile, setReceiptFile] = useState(null);
  const [copiedRib, setCopiedRib] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // جلب بيانات الحرفي الحالية من Supabase
  useEffect(() => {
    const fetchProviderInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setProviderName(user.user_metadata?.full_name || '');
        setProviderPhone(user.user_metadata?.phone || '');

        const { data: provData } = await supabase
          .from('providers')
          .select('full_name, phone, subscription_plan')
          .eq('user_id', user.id)
          .maybeSingle();

        if (provData) {
          if (provData.full_name) setProviderName(provData.full_name);
          if (provData.phone) setProviderPhone(provData.phone);
          if (provData.subscription_plan) {
            setCurrentPlan(provData.subscription_plan.toLowerCase());
          }
        }
      } catch (err) {
        console.error('Error loading provider subscription:', err);
      }
    };
    fetchProviderInfo();
  }, []);

  const openCheckout = (plan) => {
    if (plan.id === 'free' || currentPlan === plan.id) return;
    setSelectedPlan({
      code: plan.id,
      name: plan.name,
      price: Number(plan.price)
    });
    setReceiptFile(null);
    setIsCheckoutOpen(true);
  };

  const handleCopyRib = () => {
    navigator.clipboard.writeText(BANK_INFO.rib);
    setCopiedRib(true);
    setTimeout(() => setCopiedRib(false), 2000);
  };

  const handleWhatsAppHelp = () => {
    const msg = encodeURIComponent(
      `السلام عليكم، أنا الحرفي (${providerName || 'مشترك'})، أود تفعيل باقة (${selectedPlan?.name}) بقيمة ${selectedPlan?.price} درهم.`
    );
    window.open(`https://wa.me/${BANK_INFO.whatsappPhone}?text=${msg}`, '_blank');
  };

  const processInstantUpgrade = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let receiptUrl = null;

      // 1. رفع إيصال الدفع إلى سحابة Supabase إن وجد
      if (receiptFile && user) {
        const fileExt = receiptFile.name.split('.').pop();
        const filePath = `providers/${user.id}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
          receiptUrl = publicUrlData?.publicUrl || filePath;
        }
      }

      if (user) {
        // 2. تحديث باقة الحرفي في جدول providers
        const updates = {
          subscription_plan: selectedPlan.code,
          updated_at: new Date().toISOString()
        };
        if (providerName) updates.full_name = providerName;
        if (providerPhone) updates.phone = providerPhone;

        await supabase.from('providers').update(updates).eq('user_id', user.id);

        // 3. تسجيل الطلب في جدول طلبات الاشتراك (للوحة الفوترة AdminBilling)
        try {
          await supabase.from('subscription_requests').insert([{
            user_id: user.id,
            user_role: 'provider',
            user_name: providerName || user.email,
            plan_code: selectedPlan.code,
            plan_name: selectedPlan.name,
            amount: selectedPlan.price,
            billing_cycle: billingCycle,
            payment_method: paymentMethod,
            receipt_url: receiptUrl,
            status: 'pending'
          }]);
        } catch (_) {}

        // 4. توثيق العملية في الصندوق الأسود للإدارة
        try {
          await supabase.from('audit_logs').insert([{
            user_name: providerName || user.email || 'حرفي (Maâlem)',
            user_role: 'provider',
            action_type: 'SUBSCRIPTION_UPGRADE',
            details: `طلب ترقية حساب حرفي إلى باقة (${selectedPlan.name}) بقيمة ${selectedPlan.price} MAD عبر (${paymentMethod === 'bank' ? 'تحويل بنكي' : 'Cash Plus / Wafacash'})`
          }]);
        } catch (_) {}
      }

      setIsCheckoutOpen(false);
      setCurrentPlan(selectedPlan.code);

      // احتفالية الترقية
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#f97316', '#fbbf24'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f97316', '#fbbf24'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());

    } catch (error) {
      console.error('Upgrade Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: t.freePlan.name,
      price: '0',
      period: t.freePlan.period,
      description: t.freePlan.desc,
      badge: null,
      buttonText: currentPlan === 'free' ? t.freePlan.btn : t.freePlan.name,
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
      buttonText: currentPlan === 'pro' ? t.activePlanBadge : t.proPlan.btn,
      buttonStyle: currentPlan === 'pro'
        ? 'bg-emerald-600 text-white cursor-default'
        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-xl shadow-orange-500/25 cursor-pointer',
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
      
      {/* الترويسة */}
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

        {/* محول الدفع الشهري / السنوي مع إضافة الشارة */}
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
            {t.yearly} <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md text-[10px]">{t.twoMonthsFree} {t.discountBadge}</span>
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

            <button
              onClick={() => openCheckout(plan)}
              disabled={plan.id === 'free' || currentPlan === plan.id}
              className={`w-full py-4 rounded-xl font-black text-sm transition-all ${plan.buttonStyle}`}
            >
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

      {/* =========================================================
          💳 نافذة إتمام الدفع الموحدة (Finaliser le paiement)
      ========================================================= */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl w-full max-w-xl my-auto max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 text-slate-800">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-blue-600" size={24} />
                <h3 className="text-xl font-black text-slate-900">{t.checkoutTitle}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Plan Summary Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.selectedPlanLabel}
                  </span>
                  <h4 className="text-lg font-black text-slate-900">{selectedPlan.name}</h4>
                </div>
                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.totalToPayLabel}
                  </span>
                  <div className="text-2xl font-black text-emerald-600">
                    {selectedPlan.price.toLocaleString()} <span className="text-sm font-bold">MAD</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3">
                  {t.paymentMethodLabel}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Virement Bancaire */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'bank'
                        ? 'border-blue-600 bg-blue-50/40 text-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Building2 size={24} />
                    <span className="text-xs font-black text-center">{t.payBank}</span>
                  </button>

                  {/* Cash Plus / Wafacash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50/40 text-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Wallet size={24} />
                    <span className="text-xs font-black text-center">{t.payCash}</span>
                  </button>

                  {/* Carte Bancaire (Soon) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 flex flex-col items-center justify-center gap-2 relative cursor-not-allowed opacity-75">
                    <span className="absolute top-2 right-2 bg-slate-200 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded-md">
                      {t.soonBadge}
                    </span>
                    <CreditCard size={24} />
                    <span className="text-xs font-bold text-center">{t.payWithCard}</span>
                  </div>
                </div>
              </div>

              {/* Bank / Cash Details Box */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold text-slate-500">
                  {paymentMethod === 'bank' ? t.bankTransferInst : t.cashTransferInst}
                </p>

                {paymentMethod === 'bank' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1">{t.beneficiaryLabel}</span>
                        <span className="text-sm font-black text-slate-900">{BANK_INFO.beneficiary}</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1">{t.iceCompanyLabel}</span>
                        <span className="text-sm font-black text-slate-900 font-mono">{BANK_INFO.ice}</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-400">{t.ribLabel}</span>
                        <button
                          type="button"
                          onClick={handleCopyRib}
                          className="text-xs font-bold text-blue-600 hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedRib ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedRib ? (isRtl ? 'تم النسخ' : 'Copié') : (isRtl ? 'نسخ' : 'Copier')}</span>
                        </button>
                      </div>
                      <p className="text-base sm:text-lg font-black text-blue-600 font-mono tracking-wider block" dir="ltr">
                        {BANK_INFO.rib}
                      </p>
                      <span className="text-[11px] font-bold text-slate-500 block mt-1">
                        {t.bankNameLabel}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1">{isRtl ? 'الاسم الكامل' : 'Nom Complet'}</span>
                        <span className="text-sm font-black text-slate-900">{BANK_INFO.beneficiary}</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1">{isRtl ? 'رقم البطاقة الوطنية (N° CIN)' : 'N° CIN'}</span>
                        <span className="text-sm font-black text-slate-900 font-mono tracking-widest">{BANK_INFO.cin}</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">{isRtl ? 'رقم الهاتف' : 'Téléphone'}</span>
                      <p className="text-base sm:text-lg font-black text-amber-600 font-mono tracking-widest" dir="ltr">
                        {BANK_INFO.phone}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Provider Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.providerNameLabel}</label>
                  <input 
                    type="text" 
                    placeholder={t.providerNamePlace} 
                    value={providerName} 
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.providerPhoneLabel}</label>
                  <input 
                    type="text" 
                    placeholder={t.providerPhonePlace} 
                    value={providerPhone} 
                    onChange={(e) => setProviderPhone(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Upload Receipt Box */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    receiptFile
                      ? 'border-emerald-400 bg-emerald-50/50'
                      : 'border-blue-200 hover:border-blue-400 bg-blue-50/20'
                  }`}
                >
                  <UploadCloud
                    size={36}
                    className={`mx-auto mb-2 ${receiptFile ? 'text-emerald-600' : 'text-blue-600'}`}
                  />
                  {receiptFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-black text-emerald-700 flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={16} />
                        <span>{t.receiptSelected}</span>
                      </p>
                      <p className="text-xs font-bold text-slate-600">{receiptFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-black text-slate-800">{t.uploadReceiptTitle}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{t.uploadReceiptSub}</p>
                    </>
                  )}
                </div>
              </div>

              {/* أزرار الإجراء في الأسفل (تأكيد + إلغاء) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                 <button
                   type="button"
                   onClick={() => setIsCheckoutOpen(false)}
                   className="w-full sm:w-1/3 py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all cursor-pointer text-center"
                 >
                   {t.cancelBtn}
                 </button>
                 <button
                   type="button"
                   disabled={!receiptFile || isProcessing}
                   onClick={processInstantUpgrade}
                   className="w-full sm:w-2/3 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-600/25 transition-all cursor-pointer text-center"
                 >
                   {isProcessing ? t.processing : t.confirmPayment}
                 </button>
              </div>

              {/* WhatsApp Support Link */}
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleWhatsAppHelp}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>{t.whatsappSupport}</span>
                </button>
                <p className="text-xs font-bold text-slate-400">
                  {t.secureData}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}