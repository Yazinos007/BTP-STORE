import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../../../lib/supabase';
import useArchitectStore from '../../../store/useArchitectStore';
import useSettingsStore from '../../../store/useSettingsStore';

// Translations dictionary for UI localization
const translations = {
  ar: {
    pageTitle: "حوّل مكتبك الهندسي إلى قوة تكنولوجية 📐",
    pageSubtitle: "استثمر في واجهتك المهنية. انضم إلى نخبة المعماريين في المغرب الذين يستخدمون الواقع المعزز لرفع قيمة مشاريعهم وتوفير وقتهم.",
    badgeNew: "الإصدار الهندسي v2.0 🚀",
    socialProof: "أكثر من 200 مكتب دراسات يثقون في منصتنا اليوم.",
    monthly: "دفع شهري",
    annual: "دفع سنوي",
    saveBadge: "🎁 وفّر 30% مع خطة الدفع السنوي + شهرين مجانا",
    currentPlan: "خطتك الحالية",
    upgradeNow: "ترقية",
    activePlan: "✅ الباقة مفعلة الآن",
    checkoutTitle: "تأكيد الاشتراك",
    payWithCard: "💳 البطاقة (قريباً)",
    payBank: "🏦 تحويل بنكي",
    processing: "⏳ جاري التفعيل السحري...",
    confirmPayment: "✅ تأكيد ودفع الاشتراك",
    close: "✖",
    
    // Whitelabel
    whitelabelTitle: "وثّق عملك بعلامتك التجارية الخاصة 🏢",
    whitelabelDesc: "حصرياً في باقة النخبة (Elite): لن يرى عميلك شعار منصة SouqBTP بعد الآن. ستصدر جميع التقارير الهندسية، محاضر الزيارات، وإثباتات الـ GPS حاملة لـ شعار مكتبك الهندسي واسمك كعلامة مائية (Whitelabel). اجعل تقاريرك تبدو مصممة بأنظمة مكتبك الداخلية وكلف بمشاريعك باحترافية مطلقة.",
    yourLogo: "Your Logo",
    engineerSeal: "ختم المهندس: ✔️",
    
    // Comparison
    comparisonTitle: "مقارنة الميزات بالتفصيل",
    featColumn: "الميزة الهندسية",
    feat1: "إدارة الورشات",
    feat2: "الغرفة الميدانية (AR)",
    feat3: "أداة المسطرة والقياس",
    feat4: "تقارير PDF بختم (GPS)",
    feat5: "الذكاء الاصطناعي (AI)",
    feat6: "تسجيل الجلسة (فيديو MP4)",
    feat7: "العلامة التجارية الشخصية (Whitelabel)",
    feat8: "مدير حساب شخصي للدعم",
    valLimit: "محدود (5 مرات)",
    valUnlimitAI: "✔ لا محدود",
    valMonthly: "شهرياً",
    valUnlimit: "غير محدود",
    
    // FAQ
    faqTitle: "الأسئلة الشائعة حول الاشتراكات",
    faqs: [
      { q: 'هل يمكنني إلغاء الاشتراك أو تغيير الباقة لاحقاً؟', a: 'بالتأكيد! المنصة لا تلزمك بعقود احتكارية. يمكنك الترقية، التخفيض، أو إيقاف اشتراكك في أي وقت مباشرة من إعدادات حسابك. عند الإلغاء، ستستمر في الاستفادة من الميزات حتى نهاية دورتك المدفوعة.' },
      { q: 'كيف تعمل ميزة "المصادقة القانونية بختم GPS"؟', a: 'في باقات (Pro و Elite)، يقوم التطبيق بتسجيل إحداثيات الموقع الدقيقة (Latitude/Longitude) وتوقيت الزيارة، ويقوم بتشفيرها وطباعتها على التقرير الهندسي (PDF) المدمج مع اللقطة الحية، مما يمنح التقرير حجية وإثباتاً لزيارة الموقع.' },
      { q: 'ما هو الـ AI Render وكيف سيفيدني كمهندس؟', a: 'هي أداة مدمجة بالغرفة الحية. تخيل أن تصور صالوناً غير مكتمل بالآجور، وتقوم المنصة في ثوانٍ بتحويله لصورة واقعية (3D Render) تظهر للعميل كيف سيبدو بعد التبليط والصباغة والفرش!' },
      { q: 'هل بيانات وتصاميم عملائي آمنة على المنصة؟', a: 'نعم، نستخدم تشفيراً من الدرجة العسكرية (AES-256) لحماية جميع المخططات والتقارير المرفوعة على خوادم سحابية مؤمنة بالكامل لا يمكن لأحد الوصول إليها سواك.' },
      { q: 'ما هي وسائل الدفع المدعومة في الوقت الحالي؟', a: 'ندعم حالياً الدفع عبر التحويل البنكي المباشر الآمن، وقريباً جداً سيتم توفير الدفع عبر البطاقات البنكية المحلية والدولية (CMI).' }
    ],

    // Chat
    chatHeader: "🤖 المساعد الذكي",
    chatPlaceholder: "اكتب استفسارك هنا...",
    chatSend: "إرسال",
    chatWelcome: "أهلاً بك يا مهندس! أنا مساعدك الذكي من منصة SouqBTP. كيف يمكنني مساعدتك اليوم لاختيار الباقة الأنسب لمكتبك؟",
    chatQuick1: "❓ هل تقارير الـ GPS معترف بها قانونياً؟",
    chatQuick2: "❓ كيف تتم الترقية وتفعيل الميزات؟",
    chatQuick3: "❓ هل أستطيع الإلغاء متى شئت؟",
    
    // Checkout
    checkoutTotal: "المبلغ الإجمالي للاقتطاع:",
    perMonth: "شهرياً",
    perYear: "سنوياً",
    agencyNameLabel: "اسم المكتب الهندسي / الشركة",
    agencyNamePlace: "مثال: Bureau d'Architecture Al Omran",
    iceLabel: "رقم التعريف الموحد ICE (للفوترة - اختياري)",
    icePlace: "000000000000000",
    secureData: "🔒 بياناتك مشفرة ومحمية بالكامل.",
    
    successMsg: "تم ترقية اشتراكك بنجاح! استمتع بكافة الميزات الجديدة.",
    errorMsg: "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقاً."
  },

  fr: {
    pageTitle: "Transformez votre cabinet en puissance technologique 📐",
    pageSubtitle: "Investissez dans votre interface professionnelle. Rejoignez l'élite des architectes utilisant la réalité augmentée.",
    badgeNew: "Édition Ingénierie v2.0 🚀",
    socialProof: "Plus de 200 bureaux d'études font confiance à notre plateforme.",
    monthly: "Mensuel",
    annual: "Annuel",
    saveBadge: "🎁 Économisez 30% en annuel + 2 mois offerts",
    currentPlan: "Plan Actuel",
    upgradeNow: "S'abonner",
    activePlan: "✅ Plan Actif",
    checkoutTitle: "Confirmer l'Abonnement",
    payWithCard: "💳 Carte (Bientôt)",
    payBank: "🏦 Virement Bancaire",
    processing: "⏳ Activation en cours...",
    confirmPayment: "✅ Confirmer et Payer",
    close: "✖",
    
    whitelabelTitle: "Documentez avec votre propre marque 🏢",
    whitelabelDesc: "Exclusivement en Elite : Vos clients ne verront plus le logo SouqBTP. Tous vos rapports d'ingénierie et preuves GPS porteront le logo de votre cabinet en filigrane (Whitelabel).",
    yourLogo: "Votre Logo",
    engineerSeal: "Sceau Ingénieur: ✔️",
    
    comparisonTitle: "Comparaison Détaillée",
    featColumn: "Fonctionnalité",
    feat1: "Gestion des chantiers",
    feat2: "Salle Live (AR)",
    feat3: "Règle & Mesures",
    feat4: "Rapports PDF (Sceau GPS)",
    feat5: "Intelligence Artificielle (AI)",
    feat6: "Enregistrement vidéo (MP4)",
    feat7: "Marque Blanche (Whitelabel)",
    feat8: "Gestionnaire de compte dédié",
    valLimit: "Limité (5/mois)",
    valUnlimitAI: "✔ Illimité",
    valMonthly: "/mois",
    valUnlimit: "Illimité",
    
    faqTitle: "Foire Aux Questions",
    faqs: [
      { q: 'Puis-je annuler ou modifier mon abonnement ?', a: 'Absolument ! Aucun engagement à long terme. Vous pouvez annuler ou modifier votre plan à tout moment.' },
      { q: 'Comment fonctionne le "Sceau Légal GPS" ?', a: 'L\'application enregistre les coordonnées exactes et les crypte sur le rapport PDF pour fournir une preuve irréfutable.' },
      { q: 'Qu\'est-ce que l\'AI Render ?', a: 'L\'IA transforme un salon brut en un rendu 3D réaliste en quelques secondes pour convaincre vos clients.' },
      { q: 'Mes données sont-elles sécurisées ?', a: 'Oui, nous utilisons un cryptage (AES-256) pour protéger tous vos plans et rapports sur le cloud.' },
      { q: 'Quels sont les moyens de paiement ?', a: 'Nous acceptons les virements bancaires, et bientôt le paiement par carte (CMI).' }
    ],

    chatHeader: "🤖 Assistant IA",
    chatPlaceholder: "Posez votre question...",
    chatSend: "Envoyer",
    chatWelcome: "Bonjour ! Je suis l'assistant intelligent. Comment puis-je vous aider à choisir le bon plan ?",
    chatQuick1: "❓ Les rapports GPS sont-ils légaux ?",
    chatQuick2: "❓ Comment se passe l'activation ?",
    chatQuick3: "❓ Puis-je annuler à tout moment ?",
    
    checkoutTotal: "Montant total :",
    perMonth: "Mensuel",
    perYear: "Annuel",
    agencyNameLabel: "Nom du cabinet d'études / Agence",
    agencyNamePlace: "Ex: Bureau d'Architecture Al Omran",
    iceLabel: "Numéro ICE (Optionnel)",
    icePlace: "000000000000000",
    secureData: "🔒 Vos données sont entièrement cryptées.",
    
    successMsg: "Abonnement mis à niveau avec succès!",
    errorMsg: "Une erreur est survenue lors du traitement."
  },

  en: {
    pageTitle: "Turn your firm into a technological powerhouse 📐",
    pageSubtitle: "Invest in your professional interface. Join the elite architects using AR.",
    badgeNew: "Engineering Edition v2.0 🚀",
    socialProof: "Over 200 engineering firms trust our platform today.",
    monthly: "Monthly",
    annual: "Annually",
    saveBadge: "🎁 Save 30% Annually + 2 months free",
    currentPlan: "Current Plan",
    upgradeNow: "Upgrade",
    activePlan: "✅ Currently Active",
    checkoutTitle: "Confirm Subscription",
    payWithCard: "💳 Card (Soon)",
    payBank: "🏦 Bank Transfer",
    processing: "⏳ Magic Activation...",
    confirmPayment: "✅ Confirm & Pay",
    close: "✖",
    
    whitelabelTitle: "Document with your own brand 🏢",
    whitelabelDesc: "Exclusive to Elite: Your clients won't see the SouqBTP logo. Reports & GPS proofs will carry your own logo as a watermark (Whitelabel).",
    yourLogo: "Your Logo",
    engineerSeal: "Engineer Seal: ✔️",
    
    comparisonTitle: "Detailed Comparison",
    featColumn: "Feature",
    feat1: "Workshops Management",
    feat2: "Live Room (AR)",
    feat3: "Ruler & Measurements",
    feat4: "PDF Reports (GPS Seal)",
    feat5: "AI Render",
    feat6: "Session Recording (MP4)",
    feat7: "Whitelabel Branding",
    feat8: "Dedicated Account Manager",
    valLimit: "Limited (5/mo)",
    valUnlimitAI: "✔ Unlimited",
    valMonthly: "/month",
    valUnlimit: "Unlimited",
    
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: 'Can I cancel or switch my plan later?', a: 'Absolutely! No long-term contracts. Cancel, upgrade, or downgrade anytime from your dashboard.' },
      { q: 'How does the "GPS Legal Seal" work?', a: 'The app records exact coordinates and time, encrypting them into the PDF report to provide undeniable proof.' },
      { q: 'What is AI Render?', a: 'The AI transforms an unfinished brick room into a realistic 3D render in seconds.' },
      { q: 'Are my clients data secure?', a: 'Yes, we use military-grade encryption (AES-256) to protect all files on secure cloud servers.' },
      { q: 'What payment methods are supported?', a: 'We currently support direct bank transfers, and will soon enable credit cards.' }
    ],

    chatHeader: "🤖 Smart Assistant",
    chatPlaceholder: "Type your query...",
    chatSend: "Send",
    chatWelcome: "Hello! I am your SouqBTP smart assistant. How can I help you choose the right plan today?",
    chatQuick1: "❓ Are GPS reports legally recognized?",
    chatQuick2: "❓ How does activation work?",
    chatQuick3: "❓ Can I cancel anytime?",
    
    checkoutTotal: "Total Amount:",
    perMonth: "Monthly",
    perYear: "Annually",
    agencyNameLabel: "Engineering Firm / Company Name",
    agencyNamePlace: "E.g.: Bureau d'Architecture Al Omran",
    iceLabel: "ICE ID Number (Optional)",
    icePlace: "000000000000000",
    secureData: "🔒 Your data is fully encrypted and protected.",
    
    successMsg: "Subscription upgraded successfully!",
    errorMsg: "An error occurred while processing."
  }
};

const PLANS = [
  {
    id: 'basic',
    name: { ar: 'الباقة الأساسية', fr: 'Basse (Basic)', en: 'Basic' },
    priceMonthly: 139,
    priceAnnual: 1390,
    icon: '🌱',
    badge: null,
    features: {
      ar: ['3 ورشات عمل نشطة شهرياً', 'الغرفة التفاعلية الميدانية (AR)', 'رفع مخطط واحد لكل ورشة', 'دعم عبر البريد الإلكتروني'],
      fr: ['3 chantiers actifs/mois', 'Salle interactive (AR)', '1 plan par chantier', 'Support par e-mail'],
      en: ['3 active projects/month', 'Interactive Live Room (AR)', '1 plan per project', 'Email Support']
    }
  },
  {
    id: 'pro',
    name: { ar: 'باقة المحترفين (Pro)', fr: 'Professionnel (Pro)', en: 'Pro' },
    priceMonthly: 349,
    priceAnnual: 3490,
    icon: '🔥',
    badge: { ar: 'الأكثر طلباً 🔥', fr: 'Populaire 🔥', en: 'Most Popular 🔥' },
    features: {
      ar: ['ورشات عمل غير محدودة', 'ميزة الطبقات الشفافة (Layers)', 'تفعيل المسطرة والقياس الدقيق', 'تقارير PDF بختم GPS الرسمي', '5 رندر ذكاء اصطناعي/شهر', '5 جيجابايت تخزين سحابي'],
      fr: ['Chantiers illimités', 'Fonction calques (Layers)', 'Règle et mesures précises', 'Rapports PDF (Sceau GPS)', '5 Rendu IA/mois', '5 Go Stockage Cloud'],
      en: ['Unlimited Projects', 'Transparent Layers', 'Accurate Ruler Tool', 'PDF Reports with GPS', '5 AI Renders/month', '5GB Cloud Storage']
    }
  },
  {
    id: 'vip',
    name: { ar: 'النخبة (Elite VIP)', fr: 'Élite (VIP)', en: 'Elite VIP' },
    priceMonthly: 699,
    priceAnnual: 6990,
    icon: '👑',
    badge: { ar: '👑 VIP حصري', fr: '👑 VIP Exclusif', en: '👑 VIP Exclusive' },
    features: {
      ar: ['كل مميزات باقة المحترفين', 'ذكاء اصطناعي (لا محدود)', 'تسجيل الجلسات (فيديو MP4)', 'شعار مكتبك على التقارير (Whitelabel)', 'مدير حساب شخصي للدعم'],
      fr: ['Toutes les fonctionnalités Pro', 'IA illimitée', 'Enregistrement de sessions (MP4)', 'Marque Blanche (Whitelabel)', 'Gestionnaire de compte dédié'],
      en: ['All Pro Features', 'Unlimited AI Renders', 'Session Recording (MP4)', 'Whitelabel Reports', 'Dedicated Account Manager']
    }
  }
];

export default function ArchitectSubscription() {
  const { architectProfile: profile, fetchArchitectData } = useArchitectStore();
  const { language = 'ar' } = useSettingsStore();
  
  const isRtl = language === 'ar'; 
  const t = translations[language] || translations.en;

  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [agencyName, setAgencyName] = useState('');
  const [agencyICE, setAgencyICE] = useState('');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [chatInput, setChatInput] = useState('');

  const [priceBasic, setPriceBasic] = useState(139);
  const [pricePro, setPricePro] = useState(349);
  const [priceVip, setPriceVip] = useState(699);
  const [openFaq, setOpenFaq] = useState(null);

  const [currentPlanId, setCurrentPlanId] = useState('basic');

  useEffect(() => {
    setMessages([{ sender: 'bot', text: t.chatWelcome }]);
  }, [language]);

  useEffect(() => {
    const fetchDirectPlan = async () => {
      if (profile?.id) {
        const { data } = await supabase.from('architects').select('subscription_plan').eq('user_id', profile.id).single();
        if (data) setCurrentPlanId(data.subscription_plan?.toLowerCase() || 'basic');
      } else {
         const { data: { user } } = await supabase.auth.getUser();
         if(user) {
            const { data } = await supabase.from('architects').select('subscription_plan').eq('user_id', user.id).single();
            if (data) setCurrentPlanId(data.subscription_plan?.toLowerCase() || 'basic');
         }
      }
    };
    fetchDirectPlan();
  }, [profile]);

  useEffect(() => {
    if (messagesEndRef.current && isChatOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const animateValue = (setter, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setter(Math.floor(progress * (end - start) + start));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  const handleToggleBilling = (checked) => {
    setIsAnnual(checked);
    const targets = checked ? { basic: 139, pro: 349, vip: 699 } : { basic: 199, pro: 499, vip: 999 };
    animateValue(setPriceBasic, priceBasic, targets.basic, 300);
    animateValue(setPricePro, pricePro, targets.pro, 300);
    animateValue(setPriceVip, priceVip, targets.vip, 300);
  };

  const openCheckout = (planCode, planName, basePrice) => {
    setSelectedPlan({
      code: planCode,
      name: planName,
      price: isAnnual ? basePrice * 12 : basePrice
    });
    setIsCheckoutOpen(true);
  };

  const processInstantUpgrade = () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsCheckoutOpen(false);

      const duration = 3 * 1000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#fbbf24', '#38bdf8'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#fbbf24', '#38bdf8'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());

      setCurrentPlanId(selectedPlan.code);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const updates = { subscription_plan: selectedPlan.code };
          if (agencyName) updates.agency_name = agencyName;
          await supabase.from('architects').update(updates).eq('user_id', user.id);
          if (fetchArchitectData) await fetchArchitectData(user.id);
        }
      } catch (error) {
        console.error("DB Update Error", error);
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  const sendAiQuestion = (qText) => {
    setMessages(prev => [...prev, { sender: 'user', text: qText }]);
    setMessages(prev => [...prev, { sender: 'bot', text: '...', isTyping: true }]);

    setTimeout(() => {
      let answer = isRtl ? "سأقوم بتوصيلك بفريق الدعم التقني لمزيد من التفاصيل 📞" : "I will connect you with our tech support for more details 📞";
      
      if(qText.includes('GPS') || qText.includes('légal')) answer = isRtl ? "نعم بكل تأكيد! ⚖️ تقارير الـ GPS في منصتنا تقوم بتشفير (خط العرض، الطول، والتاريخ) كعلامة مائية لا يمكن تزويرها." : "Yes! GPS reports encrypt coordinates and timestamps providing undeniable legal proof.";
      if(qText.includes('تفعيل') || qText.includes('activation')) answer = isRtl ? "الأمر يحدث في لمح البصر ⚡! بمجرد تأكيد الدفع يفتح النظام الميزات الجديدة فوراً." : "Instant activation ⚡! The system unlocks new features immediately upon payment confirmation.";
      if(qText.includes('إلغاء') || qText.includes('cancel') || qText.includes('annuler')) answer = isRtl ? "راحتك هي أولويتنا 🤝. نعم، يمكنك إيقاف التجديد متى شئت من إعدادات حسابك." : "Your comfort is our priority 🤝. You can cancel renewal anytime from your settings.";

      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, { sender: 'bot', text: answer }]);
    }, 1200);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendAiQuestion(chatInput);
    setChatInput('');
  };

  return (
    <div className="blueprint-theme-wrapper" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        .blueprint-theme-wrapper {
            --navy-bg: #0f172a;
            --navy-card: rgba(30, 41, 59, 0.7);
            --orange-glow: rgba(245, 158, 11, 0.15);
            --blue-glow: rgba(56, 189, 248, 0.15);
            --blueprint-line: rgba(56, 189, 248, 0.07);
            --gold: #fbbf24;
            --glass-border: rgba(255, 255, 255, 0.1);
            --success: #10b981;
            --danger: #ef4444;

            font-family: 'Cairo', sans-serif;
            background-color: var(--navy-bg);
            background-image: 
                radial-gradient(circle at 80% -20%, var(--orange-glow) 0%, transparent 50%),
                radial-gradient(circle at 20% 120%, var(--blue-glow) 0%, transparent 50%),
                linear-gradient(var(--blueprint-line) 1px, transparent 1px),
                linear-gradient(90deg, var(--blueprint-line) 1px, transparent 1px);
            background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
            color: #f8fafc;
            min-height: 100vh;
            padding-bottom: 50px;
        }

        .subscription-container { max-width: 1250px; margin: 0 auto; padding: 60px 20px; position: relative; z-index: 10; }

        .sub-header { text-align: center; margin-bottom: 40px; }
        .badge-new { display: inline-block; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid #38bdf8; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; margin-bottom: 15px; box-shadow: 0 0 15px rgba(56,189,248,0.2); }
        .sub-header h1 { font-size: 2.8rem; color: #ffffff; font-weight: 900; margin-bottom: 15px; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .sub-header p { color: #94a3b8; font-size: 1.15rem; max-width: 700px; margin: 0 auto; line-height: 1.6; }

        .social-proof { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 25px; font-size: 0.9rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 10px 20px; border-radius: 30px; width: fit-content; margin-left: auto; margin-right: auto; border: 1px solid var(--glass-border); backdrop-filter: blur(5px); }
        .pulse-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #10b981; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.8; } }

        .billing-toggle-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 60px; }
        .save-badge { background: linear-gradient(90deg, #f59e0b, #d97706); color: white; padding: 6px 20px; border-radius: 30px; font-weight: bold; font-size: 0.9rem; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); border: 1px solid #fbbf24; }
        .toggle-wrapper { display: flex; align-items: center; gap: 20px; background: rgba(15, 23, 42, 0.8); padding: 10px 25px; border-radius: 50px; border: 1px solid var(--glass-border); box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .toggle-label { font-weight: bold; color: #64748b; transition: 0.3s; cursor: pointer; }
        .toggle-label.active { color: #38bdf8; text-shadow: 0 0 10px rgba(56,189,248,0.5); }
        
        .switch { position: relative; display: inline-block; width: 60px; height: 30px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 30px; }
        .slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        .switch input:checked + .slider { background-color: #38bdf8; box-shadow: 0 0 10px #38bdf8; }
        .switch input:checked + .slider:before { transform: translateX(30px); }

        .pricing-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; margin-bottom: 80px; align-items: stretch; }
        .card { background: var(--navy-card); backdrop-filter: blur(15px); border-radius: 24px; padding: 40px 30px; border: 1px solid var(--glass-border); transition: all 0.4s ease; position: relative; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .card:hover { transform: translateY(-15px); border-color: rgba(255,255,255,0.3); }

        .tier-icon { font-size: 3rem; margin-bottom: 5px; line-height: 1; text-align: center; }
        .icon-basic { text-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
        .icon-pro { text-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
        .icon-vip { text-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }

        .card-header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid var(--glass-border); padding-bottom: 20px; }
        .card-header h3 { font-size: 1.5rem; color: #f8fafc; margin: 0 0 15px 0; }
        .price { display: flex; justify-content: center; align-items: baseline; gap: 5px; color: #fff; }
        .price .amount { font-size: 4rem; font-weight: 900; transition: 0.3s; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .price .currency, .price .period { font-size: 1.1rem; color: #94a3b8; font-weight: bold; }

        .features-list { list-style: none; padding: 0; margin: 0 0 30px 0; text-align: ${isRtl ? 'right' : 'left'}; flex-grow: 1; }
        .features-list li { margin-bottom: 16px; color: #cbd5e1; font-size: 0.95rem; display: flex; align-items: center; gap: 12px; position: relative; }
        .features-list li b { color: #fff; }
        .features-list li.disabled { color: #475569; text-decoration: line-through; }
        
        .sub-btn { width: 100%; padding: 15px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; cursor: pointer; border: none; transition: 0.3s; font-family: 'Cairo'; text-align: center; }

        .has-tooltip { cursor: help; border-bottom: 1px dashed rgba(255,255,255,0.3); display: inline-flex !important; }
        .tooltip-box { visibility: hidden; opacity: 0; position: absolute; bottom: 120%; right: 0; background: #000; border: 1px solid #38bdf8; border-radius: 12px; padding: 10px; width: 220px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 100; transition: 0.3s; text-align: center; }
        .has-tooltip:hover .tooltip-box { visibility: visible; opacity: 1; transform: translateY(-5px); }
        .tooltip-box img { width: 100%; border-radius: 8px; margin-bottom: 8px; }
        .tooltip-box span { display: block; font-size: 0.8rem; color: #cbd5e1; }

        .basic-card { border-top: 4px solid #10b981; }
        .basic-btn { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
        .basic-btn:hover { background: rgba(255,255,255,0.2); }

        .pro-card { border: 2px solid #38bdf8; border-top: 4px solid #38bdf8; transform: scale(1.05); background: rgba(15, 23, 42, 0.8); box-shadow: 0 0 40px rgba(56, 189, 248, 0.15); z-index: 5; }
        .popular-ribbon { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: #000; padding: 5px 25px; border-radius: 50px; font-weight: 900; font-size: 0.9rem; box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4); }
        .pro-btn { background: #38bdf8; color: #0f172a; box-shadow: 0 10px 25px rgba(56, 189, 248, 0.3); }
        .pro-btn:hover { background: #0ea5e9; color: white; }

        .vip-card { border: 2px solid var(--gold); border-top: 4px solid var(--gold); background: linear-gradient(180deg, rgba(30,41,59,0.9), rgba(0,0,0,0.9)); box-shadow: 0 0 40px rgba(251, 191, 36, 0.1); }
        .vip-card .card-header h3 { color: var(--gold); }
        .vip-btn { background: transparent; color: var(--gold); border: 2px solid var(--gold); }
        .vip-btn:hover { background: var(--gold); color: #000; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3); }

        .whitelabel-section { display: flex; flex-wrap: wrap; gap: 30px; background: var(--navy-card); border: 1px solid var(--glass-border); padding: 40px; border-radius: 24px; margin-bottom: 60px; align-items: center; backdrop-filter: blur(10px); }
        .wl-text { flex: 1; min-width: 300px; }
        .wl-text h2 { color: var(--gold); font-size: 2rem; margin-top: 0; }
        .wl-text p { color: #cbd5e1; line-height: 1.8; font-size: 1.05rem; }
        .wl-image { flex: 1; min-width: 300px; text-align: center; position: relative; }
        .wl-image img { max-width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); transform: rotate(2deg); transition: 0.3s; }
        .wl-image img:hover { transform: rotate(0deg) scale(1.05); }

        .comparison-section { background: var(--navy-card); padding: 50px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid var(--glass-border); backdrop-filter: blur(15px); margin-bottom: 60px; }
        .comparison-section h2 { text-align: center; margin-bottom: 40px; font-weight: 900; color: #fff; font-size: 2rem; }
        .table-responsive { overflow-x: auto; }
        .comparison-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .comparison-table th, .comparison-table td { padding: 20px; text-align: center; border-bottom: 1px solid var(--glass-border); }
        .comparison-table th { background: rgba(0,0,0,0.4); color: #38bdf8; font-weight: bold; font-size: 1.1rem; }
        .comparison-table th:first-child { text-align: ${isRtl ? 'right' : 'left'}; border-radius: ${isRtl ? '0 15px 0 0' : '15px 0 0 0'}; color: #cbd5e1; }
        .comparison-table th:last-child { border-radius: ${isRtl ? '15px 0 0 0' : '0 15px 0 0'}; color: var(--gold); }
        .comparison-table td:first-child { text-align: ${isRtl ? 'right' : 'left'}; font-weight: bold; color: #f8fafc; }
        .check { color: var(--success); font-weight: bold; font-size: 1.2rem; }
        .cross { color: var(--danger); opacity: 0.5; font-weight: bold; font-size: 1.2rem; }

        .faq-section { margin-bottom: 60px; }
        .faq-section h2 { text-align: center; color: #fff; font-size: 2rem; margin-bottom: 40px; }
        .faq-item { background: var(--navy-card); border: 1px solid var(--glass-border); margin-bottom: 15px; border-radius: 15px; overflow: hidden; backdrop-filter: blur(10px); }
        .faq-item details { padding: 20px; }
        .faq-item summary { font-weight: bold; color: #38bdf8; font-size: 1.1rem; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; color: #64748b; font-size: 1.5rem; transition: 0.3s; }
        .faq-item details[open] summary::after { content: '-'; color: var(--gold); transform: rotate(180deg); }
        .faq-item p { margin: 15px 0 0 0; color: #cbd5e1; line-height: 1.7; font-size: 0.95rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: center; align-items: center; }
        .checkout-modal { background: #0f172a; width: 90%; max-width: 450px; border-radius: 24px; border: 1px solid #38bdf8; box-shadow: 0 20px 50px rgba(0,0,0,0.8); padding: 30px; position: relative; animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .checkout-modal h2 { color: #fff; margin-top: 0; text-align: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 15px; }
        .form-group { margin-bottom: 20px; text-align: ${isRtl ? 'right' : 'left'}; }
        .form-group label { display: block; color: #94a3b8; font-size: 0.9rem; margin-bottom: 8px; font-weight: bold; }
        .form-group input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white; font-family: 'Cairo'; outline: none; box-sizing: border-box; text-align: ${isRtl ? 'right' : 'left'}; }
        .form-group input:focus { border-color: #38bdf8; background: rgba(255,255,255,0.1); }
        
        .payment-methods { display: flex; gap: 10px; margin-bottom: 25px; }
        .pay-method { flex: 1; padding: 15px 10px; text-align: center; border-radius: 12px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s; font-weight: bold; color: #cbd5e1; }
        .pay-method.active { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; color: #38bdf8; }
        .pay-method.disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-confirm { width: 100%; padding: 15px; background: linear-gradient(90deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: bold; cursor: pointer; font-family: 'Cairo'; transition: 0.3s; box-shadow: 0 10px 20px rgba(16,185,129,0.3); }
        .btn-confirm:hover { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(16,185,129,0.5); }
        .close-modal { position: absolute; top: 15px; right: 20px; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }

        .ai-widget-btn { position: fixed; bottom: 30px; ${isRtl ? 'left: 30px;' : 'right: 30px;'} width: 60px; height: 60px; background: linear-gradient(135deg, #38bdf8, #8b5cf6); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.8rem; cursor: pointer; box-shadow: 0 10px 25px rgba(56,189,248,0.5); z-index: 1000; animation: floatBot 3s ease-in-out infinite; border: 2px solid rgba(255,255,255,0.2); }
        @keyframes floatBot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        
        .ai-chat-window { display: none; position: fixed; bottom: 100px; ${isRtl ? 'left: 30px;' : 'right: 30px;'} width: 320px; background: var(--navy-card); border: 1px solid #38bdf8; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); z-index: 1000; backdrop-filter: blur(15px); overflow: hidden; animation: slideUp 0.3s ease-out; }
        .ai-header { background: rgba(56, 189, 248, 0.1); padding: 15px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; }
        .ai-header h4 { margin: 0; color: #38bdf8; font-size: 1rem; display: flex; align-items: center; gap: 8px; }
        .ai-messages { padding: 15px; height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth; }
        .msg-bot { background: rgba(255,255,255,0.05); padding: 10px 15px; border-radius: 15px 15px 0 15px; color: #e2e8f0; font-size: 0.9rem; align-self: flex-start; max-width: 85%; border: 1px solid var(--glass-border); }
        .msg-user { background: rgba(56, 189, 248, 0.2); padding: 10px 15px; border-radius: 15px 15px 15px 0; color: #fff; font-size: 0.9rem; align-self: flex-end; max-width: 85%; border: 1px solid #38bdf8; }
        
        .ai-options { padding: 10px 15px 15px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--glass-border); }
        .ai-option-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: #38bdf8; padding: 8px; border-radius: 8px; font-family: 'Cairo'; cursor: pointer; transition: 0.2s; font-size: 0.85rem; text-align: ${isRtl ? 'right' : 'left'}; }
        .ai-option-btn:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; }
      `}</style>

      <div className="subscription-container">
        <div className="sub-header">
          <div className="badge-new">{t.badgeNew}</div>
          <h1>{t.pageTitle}</h1>
          <p>{t.pageSubtitle}</p>
          
          <div className="social-proof">
            <span><span className="pulse-dot"></span> <b>{t.socialProof}</b></span>
          </div>
        </div>

        <div className="billing-toggle-container">
          <div className="save-badge">{t.saveBadge}</div>
          <div className="toggle-wrapper">
            <span className={`toggle-label ${!isAnnual ? 'active' : ''}`} onClick={() => handleToggleBilling(false)}>{t.monthly}</span>
            <label className="switch">
              <input type="checkbox" checked={isAnnual} onChange={(e) => handleToggleBilling(e.target.checked)} />
              <span className="slider"></span>
            </label>
            <span className={`toggle-label ${isAnnual ? 'active' : ''}`} onClick={() => handleToggleBilling(true)}>{t.annual}</span>
          </div>
        </div>

        <div className="pricing-cards">
          {PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const price = plan.id === 'basic' ? priceBasic : plan.id === 'pro' ? pricePro : priceVip;
            
            return (
              <div key={plan.id} className={`card ${plan.id}-card`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-sm font-black px-6 py-1.5 rounded-full">
                    {plan.badge[language] || plan.badge.en}
                  </div>
                )}
                <div className="card-header">
                  <div className="tier-icon">{plan.icon}</div>
                  <h3 style={plan.id === 'vip' ? { color: 'var(--gold)' } : {}}>{plan.name[language] || plan.name.en}</h3>
                  <div className="price">
                    <span className="currency">د.م</span>
                    <span className="amount">{price}</span>
                    <span className="period">/ {isAnnual ? t.perYear : t.perMonth}</span>
                  </div>
                </div>

                <ul className="features-list">
                  {(plan.features[language] || plan.features.en).map((feat, idx) => (
                    <li key={idx}>
                      <span className="check shrink-0 text-lg">✔️</span> {feat}
                    </li>
                  ))}
                  
                  {/* Dynamic Disabled Features for Lower Tiers */}
                  {plan.id === 'basic' && (
                    <>
                      <li className="disabled">🔒 {t.feat3}</li>
                      <li className="disabled">🔒 {t.feat4}</li>
                      <li className="disabled">🔒 {t.feat5}</li>
                    </>
                  )}
                  {plan.id === 'pro' && (
                    <li className="disabled">🔒 {t.feat7}</li>
                  )}
                </ul>

                <button 
                  disabled={isCurrent}
                  onClick={() => openCheckout(plan.id, plan.name[language] || plan.name.en, plan.id === 'basic' ? 139 : plan.id === 'pro' ? 349 : 699)}
                  className={`sub-btn ${plan.id}-btn`}
                  style={isCurrent ? { background: '#10b981', color: '#fff', border: 'none', cursor: 'not-allowed' } : {}}
                >
                  {isCurrent ? t.activePlan : t.upgradeNow}
                </button>
              </div>
            );
          })}
        </div>

        <div className="whitelabel-section">
          <div className="wl-text">
            <h2>{t.whitelabelTitle}</h2>
            <p>{t.whitelabelDesc}</p>
          </div>
          <div className="wl-image">
            <div style={{background: 'white', padding: '20px', borderRadius: '8px', textAlign: isRtl ? 'right' : 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transform: 'rotate(3deg)'}}>
              <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #1e293b', paddingBottom:'10px', marginBottom:'10px'}}>
                <div style={{width: '50px', height: '50px', background: '#cbd5e1', borderRadius: '5px', display: 'flex', alignItems:'center', justifyContent:'center', color:'#0f172a', fontWeight:'bold', fontSize:'0.7rem'}}>{t.yourLogo}</div>
              </div>
              <div style={{width:'100%', height:'150px', background:'#f1f5f9', border:'1px dashed #cbd5e1', marginBottom:'10px'}} />
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div style={{width:'40%', height:'10px', background:'#e2e8f0'}}></div>
                <div style={{fontWeight:'bold', color:'#1e293b', fontSize:'0.8rem'}}>{t.engineerSeal}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="comparison-section">
          <h2>{t.comparisonTitle}</h2>
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>{t.featColumn}</th>
                  <th>{PLANS[0].name[language] || PLANS[0].name.en} 🌱</th>
                  <th>{PLANS[1].name[language] || PLANS[1].name.en} 🔥</th>
                  <th>{PLANS[2].name[language] || PLANS[2].name.en} 👑</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t.feat1}</td>
                  <td>3</td>
                  <td>{t.valUnlimit}</td>
                  <td>{t.valUnlimit}</td>
                </tr>
                <tr>
                  <td>{t.feat2}</td>
                  <td><span className="check">✔</span></td>
                  <td><span className="check">✔</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>{t.feat3}</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>{t.feat4}</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>{t.feat5}</td>
                  <td><span className="cross">✖</span></td>
                  <td>{t.valLimit}</td>
                  <td><span className="check">{t.valUnlimitAI}</span></td>
                </tr>
                <tr>
                  <td>{t.feat6}</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>{t.feat7}</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>{t.feat8}</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="faq-section">
          <h2>{t.faqTitle}</h2>
          {t.faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{width:'100%', padding:'20px', background:'none', border:'none', color:'#38bdf8', fontWeight:'bold', fontSize:'1.1rem', textAlign: isRtl ? 'right' : 'left', display:'flex', justifyContent:'space-between', cursor:'pointer'}}
              >
                <span>{faq.q}</span>
                <span>{openFaq === idx ? '-' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div style={{padding:'0 20px 20px', color:'#cbd5e1', lineHeight:'1.7', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'15px'}}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isCheckoutOpen && selectedPlan && (
        <div className="modal-overlay">
          <div className="checkout-modal">
            <button className="close-modal" onClick={() => setIsCheckoutOpen(false)}>✖</button>
            <h2>{t.checkoutTitle}</h2>
            
            <p style={{color:'#94a3b8', textAlign:'center', fontSize:'0.9rem', marginBottom:'25px'}}>
              {t.checkoutTotal} <b style={{color:'#38bdf8', fontSize:'1.2rem'}}>{selectedPlan.price}</b> د.م / <span>{isAnnual ? t.perYear : t.perMonth}</span>
            </p>

            <div className="payment-methods">
              <div className="pay-method active">{t.payBank}</div>
              <div className="pay-method disabled">{t.payWithCard}</div>
            </div>

            <div className="form-group">
              <label>{t.agencyNameLabel}</label>
              <input type="text" placeholder={t.agencyNamePlace} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>{t.iceLabel}</label>
              <input type="text" placeholder={t.icePlace} value={agencyICE} onChange={(e) => setAgencyICE(e.target.value)} />
            </div>

            <button className="btn-confirm" disabled={isProcessing} onClick={processInstantUpgrade}>
              {isProcessing ? t.processing : t.confirmPayment}
            </button>
            <p style={{textAlign:'center', fontSize:'0.8rem', color:'#64748b', marginTop:'15px'}}>{t.secureData}</p>
          </div>
        </div>
      )}

      <div className="ai-widget-btn" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>

      {isChatOpen && (
        <div className="ai-chat-window" style={{display: 'flex'}}>
          <div className="ai-header">
            <h4>{t.chatHeader}</h4>
            <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer'}}>✖</button>
          </div>
          <div className="ai-messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === 'bot' ? 'msg-bot' : 'msg-user'}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="ai-options" style={{opacity: messages.some(m => m.isTyping) ? 0.5 : 1, pointerEvents: messages.some(m => m.isTyping) ? 'none' : 'auto'}}>
            <button className="ai-option-btn" onClick={() => sendAiQuestion(1, t.chatQuick1)}>{t.chatQuick1}</button>
            <button className="ai-option-btn" onClick={() => sendAiQuestion(2, t.chatQuick2)}>{t.chatQuick2}</button>
            <button className="ai-option-btn" onClick={() => sendAiQuestion(3, t.chatQuick3)}>{t.chatQuick3}</button>
          </div>
        </div>
      )}
    </div>
  );
}