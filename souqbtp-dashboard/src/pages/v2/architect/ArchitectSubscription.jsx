import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../../../lib/supabase';
import useArchitectStore from '../../../store/useArchitectStore';
import useSettingsStore from '../../../store/useSettingsStore';

const translations = {
  ar: {
    pageTitle: "خطط الاشتراكات والترقية",
    pageSubtitle: "اختر الخطة المناسبة لتطوير أعمالك المعمارية وتمكين أدوات الذكاء الاصطناعي",
    monthly: "شهري",
    annual: "سنوي",
    saveBadge: "وفّر 30% مع خطة الدفع السنوي + شهرين مجانا",
    currentPlan: "خطتك الحالية",
    upgradeNow: "ترقية الآن",
    activePlan: "✅ الباقة مفعلة الآن",
    checkoutTitle: "تأكيد الاشتراك والترقية",
    payWithCard: "الدفع بواسطة البطاقة البنكية",
    processing: "جاري التفعيل السحري...",
    confirmPayment: "✅ تأكيد ودفع الاشتراك",
    close: "إغلاق",
    
    // Whitelabel
    whitelabelAddon: "الإصدار الهندسي v2.0 🚀",
    whitelabelTitle: "وثّق عملك بعلامتك التجارية الخاصة 🏢",
    whitelabelDesc: "حصرياً في باقة النخبة (Elite): لن يرى عميلك شعار منصة SouqBTP بعد الآن. ستصدر جميع التقارير الهندسية، محاضر الزيارات، وإثباتات الـ GPS حاملة لـ شعار مكتبك الهندسي واسمك كعلامة مائية (Whitelabel). اجعل تقاريرك تبدو مصممة بأنظمة مكتبك الداخلية وكلف بمشاريعك باحترافية مطلقة.",
    yourLogo: "Your Logo",
    engineerSeal: "ختم المهندس: ✔️",
    
    // Comparison Table
    comparisonTitle: "مقارنة الميزات بالتفصيل",
    featColumn: "الميزة الهندسية",
    feat1: "إدارة الورشات",
    feat2: "الغرفة الميدانية (AR)",
    feat3: "أداة المسطرة والقياس",
    feat4: "تقارير PDF بختم (GPS)",
    feat5: "الذكاء الاصطناعي (AI)",
    feat6: "تسجيل الجلسة (فيديو MP4)",
    feat7: "العلامة التجارية (Whitelabel)",
    feat8: "مدير حساب شخصي للدعم",
    valLimit: "محدود (5 مرات)",
    valUnlimitAI: "✔ لا محدود",
    
    // FAQ
    faqTitle: "الأسئلة الشائعة حول الاشتراكات",
    faqs: [
      { q: 'هل يمكنني إلغاء الاشتراك أو تغيير الباقة لاحقاً؟', a: 'بالتأكيد! المنصة لا تلزمك بعقود احتكارية. يمكنك الترقية، التخفيض، أو إيقاف اشتراكك في أي وقت مباشرة من إعدادات حسابك. عند الإلغاء، ستستمر في الاستفادة من الميزات حتى نهاية دورتك المدفوعة.' },
      { q: 'كيف تعمل ميزة "المصادقة القانونية بختم GPS"؟', a: 'في باقات (Pro و Elite)، يقوم التطبيق بتسجيل إحداثيات الموقع الدقيقة وتوقيت الزيارة، ويقوم بتشفيرها وطباعتها على التقرير الهندسي، مما يمنح التقرير حجية وإثباتاً لزيارة الموقع.' },
      { q: 'ما هو الـ AI Render وكيف سيفيدني كمهندس؟', a: 'هي أداة مدمجة بالغرفة الحية. تقوم المنصة في ثوانٍ بتحويل غرفة غير مكتملة بالآجور لصورة واقعية (3D Render) تظهر للعميل كيف سيبدو بعد التبليط والصباغة والفرش.' },
      { q: 'هل بيانات وتصاميم عملائي آمنة؟', a: 'نعم، نستخدم تشفيراً من الدرجة العسكرية (AES-256) لحماية جميع المخططات والتقارير المرفوعة على خوادم سحابية مؤمنة بالكامل.' },
      { q: 'ما هي وسائل الدفع المدعومة في المغرب؟', a: 'ندعم الدفع عبر التحويل البنكي المباشر، وقريباً سيتم توفير الدفع عبر البطاقات البنكية المحلية والدولية (CMI).' }
    ],

    // Chat
    chatHeader: "مدير الحسابات الذكي",
    chatPlaceholder: "اكتب استفسارك هنا...",
    chatSend: "إرسال",
    chatWelcome: "أهلاً بك يا مهندس! أنا مساعدك الذكي من منصة SouqBTP. كيف يمكنني مساعدتك اليوم لاختيار الباقة الأنسب لمكتبك؟",
    chatQuick1: "❓ هل تقارير الـ GPS معترف بها قانونياً؟",
    chatQuick2: "❓ كيف تتم الترقية وتفعيل الميزات؟",
    chatQuick3: "❓ هل أستطيع الإلغاء متى شئت؟",
    
    successMsg: "تم ترقية اشتراكك بنجاح! استمتع بكافة الميزات الجديدة.",
    errorMsg: "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقاً."
  },
  
  fr: {
    pageTitle: "Plans d'abonnement & Mises à niveau",
    pageSubtitle: "Choisissez le plan idéal pour développer votre cabinet d'architecture",
    monthly: "Mensuel",
    annual: "Annuel",
    saveBadge: "Économisez 30% en annuel + 2 mois offerts",
    currentPlan: "Plan Actuel",
    upgradeNow: "Mettre à niveau",
    activePlan: "✅ Plan Actif",
    checkoutTitle: "Confirmer l'Abonnement",
    payWithCard: "Payer par Carte",
    processing: "Activation magique en cours...",
    confirmPayment: "✅ Confirmer et Payer",
    close: "Fermer",
    
    whitelabelAddon: "Édition Architecture v2.0 🚀",
    whitelabelTitle: "Marque Blanche Personnalisée 🏢",
    whitelabelDesc: "Exclusivement dans l'abonnement Elite : Vos clients ne verront plus le logo SouqBTP. Tous les rapports d'ingénierie et preuves GPS porteront le logo de votre cabinet en filigrane (Whitelabel).",
    yourLogo: "Votre Logo",
    engineerSeal: "Sceau de l'ingénieur : ✔️",
    
    comparisonTitle: "Comparaison Détaillée",
    featColumn: "Fonctionnalité",
    feat1: "Gestion des chantiers",
    feat2: "Salle Live (AR)",
    feat3: "Règle & Mesures",
    feat4: "Rapports PDF (Sceau GPS)",
    feat5: "Intelligence Artificielle (IA)",
    feat6: "Enregistrement vidéo (MP4)",
    feat7: "Marque Blanche (Whitelabel)",
    feat8: "Gestionnaire de compte dédié",
    valLimit: "Limité (5 fois)",
    valUnlimitAI: "✔ Illimité",
    
    faqTitle: "Foire Aux Questions",
    faqs: [
      { q: 'Puis-je annuler ou modifier mon abonnement ?', a: 'Absolument ! Aucun engagement à long terme. Vous pouvez annuler ou modifier votre plan à tout moment depuis vos paramètres.' },
      { q: 'Comment fonctionne le "Sceau Légal GPS" ?', a: 'L\'application enregistre les coordonnées exactes et l\'heure de la visite, puis les crypte sur le rapport PDF pour fournir une preuve irréfutable.' },
      { q: 'Qu\'est-ce que l\'AI Render ?', a: 'Une fois dans la salle live, l\'IA transforme un salon en briques brutes en un rendu 3D réaliste en quelques secondes.' },
      { q: 'Mes données sont-elles sécurisées ?', a: 'Oui, nous utilisons un cryptage de niveau militaire (AES-256) pour protéger tous vos plans et rapports sur le cloud.' },
      { q: 'Quels sont les moyens de paiement ?', a: 'Nous acceptons les virements bancaires et déploierons bientôt le paiement par carte (CMI).' }
    ],

    chatHeader: "Assistant IA Abonnements",
    chatPlaceholder: "Posez votre question...",
    chatSend: "Envoyer",
    chatWelcome: "Bonjour ! Je suis l'assistant intelligent SouqBTP. Comment puis-je vous aider à choisir le bon plan aujourd'hui ?",
    chatQuick1: "❓ Les rapports GPS sont-ils légaux ?",
    chatQuick2: "❓ Comment se passe l'activation ?",
    chatQuick3: "❓ Puis-je annuler à tout moment ?",
    
    successMsg: "Abonnement mis à niveau avec succès!",
    errorMsg: "Une erreur est survenue lors du traitement."
  },

  en: {
    pageTitle: "Subscription Plans & Upgrades",
    pageSubtitle: "Select the ideal tier to empower your architectural practice",
    monthly: "Monthly",
    annual: "Annual",
    saveBadge: "Save 30% Annually + 2 months free",
    currentPlan: "Current Plan",
    upgradeNow: "Upgrade Now",
    activePlan: "✅ Currently Active",
    checkoutTitle: "Confirm Subscription",
    payWithCard: "Pay via Credit Card",
    processing: "Magic Activation in progress...",
    confirmPayment: "✅ Confirm & Pay",
    close: "Close",
    
    whitelabelAddon: "Architecture Edition v2.0 🚀",
    whitelabelTitle: "Custom Whitelabel Solution 🏢",
    whitelabelDesc: "Exclusive to Elite tier: Your clients will no longer see the SouqBTP logo. All engineering reports and GPS proofs will bear your firm's logo as a watermark (Whitelabel).",
    yourLogo: "Your Logo",
    engineerSeal: "Engineer Seal: ✔️",
    
    comparisonTitle: "Detailed Feature Comparison",
    featColumn: "Feature",
    feat1: "Workshops Management",
    feat2: "Live Room (AR)",
    feat3: "Ruler & Measurements",
    feat4: "PDF Reports (GPS Seal)",
    feat5: "Artificial Intelligence (AI)",
    feat6: "Session Recording (MP4)",
    feat7: "Whitelabel Branding",
    feat8: "Dedicated Account Manager",
    valLimit: "Limited (5 times)",
    valUnlimitAI: "✔ Unlimited",
    
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: 'Can I cancel or switch my plan later?', a: 'Absolutely! No long-term contracts. Cancel, upgrade, or downgrade anytime from your dashboard.' },
      { q: 'How does the "GPS Legal Seal" work?', a: 'The app records exact coordinates and time, encrypting them into the PDF report to provide undeniable proof of your site visit.' },
      { q: 'What is AI Render?', a: 'Inside the live room, the AI transforms an unfinished brick room into a realistic 3D render in seconds.' },
      { q: 'Are my clients data secure?', a: 'Yes, we use military-grade encryption (AES-256) to protect all plans and reports on secure cloud servers.' },
      { q: 'What payment methods are supported?', a: 'We support direct bank transfers, and will soon enable local and international credit card payments.' }
    ],

    chatHeader: "Subscription AI Assistant",
    chatPlaceholder: "Type your query here...",
    chatSend: "Send",
    chatWelcome: "Hello! I am your SouqBTP smart assistant. How can I help you choose the right plan today?",
    chatQuick1: "❓ Are GPS reports legally recognized?",
    chatQuick2: "❓ How does activation work?",
    chatQuick3: "❓ Can I cancel anytime?",
    
    successMsg: "Subscription upgraded successfully! Enjoy your new features.",
    errorMsg: "An error occurred while processing your request."
  }
};

const PLANS = [
  {
    id: 'basic',
    name: { ar: 'الأساسية', fr: 'Basic', en: 'Basic' },
    priceMonthly: 139,
    priceAnnual: 1390,
    borderClass: 'border-[#10b981] hover:border-[#059669]',
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    badge: null,
    features: {
      ar: ['3 ورشات عمل نشطة شهرياً', 'الغرفة التفاعلية الميدانية (AR)', 'رفع مخطط واحد لكل ورشة'],
      fr: ['3 chantiers actifs/mois', 'Salle interactive (AR)', '1 plan par chantier'],
      en: ['3 active projects/month', 'Interactive Live Room (AR)', '1 plan per project']
    }
  },
  {
    id: 'pro',
    name: { ar: 'باقة المحترفين', fr: 'Professionnel', en: 'Pro' },
    priceMonthly: 349,
    priceAnnual: 3490,
    borderClass: 'border-[#38bdf8] hover:border-[#0ea5e9]',
    glowClass: 'shadow-[0_0_40px_rgba(56,189,248,0.15)]',
    badge: { ar: 'الأكثر طلباً 🔥', fr: 'Populaire 🔥', en: 'Popular 🔥' },
    features: {
      ar: ['ورشات عمل غير محدودة', 'ميزة الطبقات الشفافة (Layers)', 'تفعيل المسطرة والقياس الدقيق', 'تقارير PDF بختم GPS الرسمي', '5 رندر ذكاء اصطناعي/شهر', '5 جيجابايت تخزين سحابي'],
      fr: ['Chantiers illimités', 'Fonction calques (Layers)', 'Règle et mesures précises', 'Rapports PDF (Sceau GPS)', '5 Rendu IA/mois', '5 Go Stockage Cloud'],
      en: ['Unlimited Projects', 'Transparent Layers', 'Accurate Ruler Tool', 'PDF Reports with GPS', '5 AI Renders/month', '5GB Cloud Storage']
    }
  },
  {
    id: 'vip',
    name: { ar: 'النخبة (VIP)', fr: 'Élite (VIP)', en: 'Elite VIP' },
    priceMonthly: 699,
    priceAnnual: 6990,
    borderClass: 'border-[#fbbf24] hover:border-[#d97706]',
    glowClass: 'shadow-[0_0_40px_rgba(251,191,36,0.1)]',
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
      
      if(qText.includes('GPS') || qText.includes('لانون')) answer = isRtl ? "نعم بكل تأكيد! ⚖️ تقارير الـ GPS في منصتنا تقوم بتشفير (خط العرض، الطول، والتاريخ) على الصورة كعلامة مائية لا يمكن تزويرها." : "Yes! GPS reports encrypt coordinates and timestamps on the image, providing undeniable legal proof.";
      if(qText.includes('تفعيل') || qText.includes('activation')) answer = isRtl ? "الأمر يحدث في لمح البصر ⚡! بمجرد تأكيد الدفع يفتح النظام الميزات الجديدة فوراً." : "Instant activation ⚡! The system unlocks new features immediately upon payment confirmation.";
      if(qText.includes('إلغاء') || qText.includes('cancel')) answer = isRtl ? "راحتك هي أولويتنا 🤝. نعم، يمكنك إيقاف التجديد متى شئت من إعدادات حسابك." : "Your comfort is our priority 🤝. You can cancel renewal anytime from settings.";

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

        .card-header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid var(--glass-border); padding-bottom: 20px; }
        .card-header h3 { font-size: 1.5rem; color: #f8fafc; margin: 0 0 15px 0; }
        .price { display: flex; justify-content: center; align-items: baseline; gap: 5px; color: #fff; }
        .price .amount { font-size: 4rem; font-weight: 900; transition: 0.3s; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .price .currency, .price .period { font-size: 1.1rem; color: #94a3b8; font-weight: bold; }

        .features-list { list-style: none; padding: 0; margin: 0 0 30px 0; text-align: ${isRtl ? 'right' : 'left'}; flex-grow: 1; }
        .features-list li { margin-bottom: 16px; color: #cbd5e1; font-size: 0.95rem; display: flex; align-items: center; gap: 12px; }
        .features-list li.disabled { color: #475569; text-decoration: line-through; }
        
        .sub-btn { width: 100%; padding: 15px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; cursor: pointer; border: none; transition: 0.3s; font-family: 'Cairo'; text-align: center; }

        .basic-card { border-top: 4px solid #10b981; }
        .pro-card { border: 2px solid #38bdf8; border-top: 4px solid #38bdf8; transform: scale(1.05); background: rgba(15, 23, 42, 0.8); box-shadow: 0 0 40px rgba(56, 189, 248, 0.15); z-index: 5; }
        .vip-card { border: 2px solid var(--gold); border-top: 4px solid var(--gold); background: linear-gradient(180deg, rgba(30,41,59,0.9), rgba(0,0,0,0.9)); box-shadow: 0 0 40px rgba(251, 191, 36, 0.1); }

        .whitelabel-section { display: flex; flex-wrap: wrap; gap: 30px; background: var(--navy-card); border: 1px solid var(--glass-border); padding: 40px; border-radius: 24px; margin-bottom: 60px; align-items: center; backdrop-filter: blur(10px); }
        .comparison-section { background: var(--navy-card); padding: 50px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid var(--glass-border); backdrop-filter: blur(15px); margin-bottom: 60px; }
        .comparison-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .comparison-table th, .comparison-table td { padding: 20px; text-align: center; border-bottom: 1px solid var(--glass-border); }
        .comparison-table th { background: rgba(0,0,0,0.4); color: #38bdf8; font-weight: bold; font-size: 1.1rem; }
        .comparison-table td:first-child { text-align: ${isRtl ? 'right' : 'left'}; font-weight: bold; color: #f8fafc; }
        .check { color: #10b981; font-weight: bold; font-size: 1.2rem; }
        .cross { color: #ef4444; opacity: 0.5; font-weight: bold; font-size: 1.2rem; }

        .faq-section { margin-bottom: 60px; }
        .faq-item { background: var(--navy-card); border: 1px solid var(--glass-border); margin-bottom: 15px; border-radius: 15px; overflow: hidden; backdrop-filter: blur(10px); }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: center; align-items: center; }
        .checkout-modal { background: #0f172a; width: 90%; max-width: 450px; border-radius: 24px; border: 1px solid #38bdf8; padding: 30px; position: relative; animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .ai-widget-btn { position: fixed; bottom: 30px; ${isRtl ? 'left: 30px;' : 'right: 30px;'} width: 60px; height: 60px; background: linear-gradient(135deg, #38bdf8, #8b5cf6); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.8rem; cursor: pointer; z-index: 1000; }
        .ai-chat-window { position: fixed; bottom: 100px; ${isRtl ? 'left: 30px;' : 'right: 30px;'} width: 320px; background: var(--navy-card); border: 1px solid #38bdf8; border-radius: 20px; z-index: 1000; backdrop-filter: blur(15px); display: flex; flex-direction: column; overflow: hidden;}
      `}</style>

      <div className="subscription-container">
        <div className="sub-header">
          <div className="badge-new">{t.whitelabelAddon}</div>
          <h1>{t.pageTitle}</h1>
          <p>{t.pageSubtitle}</p>
        </div>

        <div className="billing-toggle-container">
          <div className="save-badge">🎁 {t.saveBadge}</div>
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
                  <div className="tier-icon">{plan.id === 'basic' ? '🌱' : plan.id === 'pro' ? '🔥' : '👑'}</div>
                  <h3 style={plan.id==='vip'?{color:'var(--gold)'}:{}}>{plan.name[language] || plan.name.en}</h3>
                  <div className="price">
                    <span className="currency">د.م</span>
                    <span className="amount">{price}</span>
                    <span className="period">/ {isAnnual ? 'سنة' : 'شهر'}</span>
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
                      <li className="disabled">🔒 أداة المسطرة والقياس</li>
                      <li className="disabled">🔒 تقارير PDF بختم GPS</li>
                      <li className="disabled">🔒 الذكاء الاصطناعي (AI Render)</li>
                    </>
                  )}
                  {plan.id === 'pro' && (
                    <li className="disabled">🔒 {t.feat7}</li>
                  )}
                </ul>

                <button 
                  disabled={isCurrent}
                  onClick={() => openCheckout(plan.id, plan.name[language] || plan.name.en, plan.id==='basic'?139 : plan.id==='pro'?349 : 699)}
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
            <div style={{background: 'white', padding: '20px', borderRadius: '8px', textAlign: isRtl?'right':'left', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transform: 'rotate(3deg)'}}>
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
                  <td>✔</td>
                  <td>✔</td>
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
                style={{width:'100%', padding:'20px', background:'none', border:'none', color:'#38bdf8', fontWeight:'bold', fontSize:'1.1rem', textAlign: isRtl?'right':'left', display:'flex', justifyContent:'space-between', cursor:'pointer'}}
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
            <p style={{color:'#94a3b8', textAlign:'center', marginBottom:'25px'}}>
              <b style={{color:'#38bdf8', fontSize:'1.2rem'}}>{selectedPlan.price}</b> د.م / {isAnnual ? t.annual : t.monthly}
            </p>
            <div className="payment-methods">
              <div className="pay-method active">🏦 {isRtl?'تحويل بنكي':'Bank Transfer'}</div>
              <div className="pay-method disabled">💳 {t.payWithCard}</div>
            </div>
            <button className="btn-confirm" disabled={isProcessing} onClick={processInstantUpgrade}>
              {isProcessing ? t.processing : t.confirmPayment}
            </button>
          </div>
        </div>
      )}

      <div className="ai-widget-btn" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>

      {isChatOpen && (
        <div className="ai-chat-window">
          <div className="ai-header" style={{padding:'15px', background:'rgba(56, 189, 248, 0.1)', borderBottom:'1px solid rgba(255, 255, 255, 0.1)', display:'flex', justifyContent:'space-between'}}>
            <h4 style={{margin:0, color:'#38bdf8', fontWeight:'bold'}}>🤖 {t.chatHeader}</h4>
            <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer'}}>✖</button>
          </div>
          <div className="ai-messages" style={{flex:1, padding:'15px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px'}}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                background: msg.sender === 'bot' ? 'rgba(255,255,255,0.05)' : 'rgba(56, 189, 248, 0.2)',
                padding: '10px 15px',
                borderRadius: msg.sender === 'bot' ? (isRtl?'15px 0 15px 15px':'0 15px 15px 15px') : (isRtl?'15px 15px 0 15px':'15px 15px 15px 0'),
                color: '#fff', fontSize: '0.9rem', alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                maxWidth: '85%', border: `1px solid ${msg.sender === 'bot' ? 'rgba(255, 255, 255, 0.1)' : '#38bdf8'}`
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{padding:'10px', display:'flex', flexDirection:'column', gap:'8px', borderTop:'1px solid rgba(255, 255, 255, 0.1)'}}>
            <button onClick={() => sendAiQuestion(1, t.chatQuick1)} style={{background:'rgba(255,255,255,0.05)', color:'#38bdf8', border:'1px solid rgba(255,255,255,0.1)', padding:'8px', borderRadius:'8px', cursor:'pointer', textAlign:isRtl?'right':'left', fontSize:'0.85rem'}}>{t.chatQuick1}</button>
            <button onClick={() => sendAiQuestion(2, t.chatQuick2)} style={{background:'rgba(255,255,255,0.05)', color:'#38bdf8', border:'1px solid rgba(255,255,255,0.1)', padding:'8px', borderRadius:'8px', cursor:'pointer', textAlign:isRtl?'right':'left', fontSize:'0.85rem'}}>{t.chatQuick2}</button>
            <button onClick={() => sendAiQuestion(3, t.chatQuick3)} style={{background:'rgba(255,255,255,0.05)', color:'#38bdf8', border:'1px solid rgba(255,255,255,0.1)', padding:'8px', borderRadius:'8px', cursor:'pointer', textAlign:isRtl?'right':'left', fontSize:'0.85rem'}}>{t.chatQuick3}</button>
          </div>
          <form onSubmit={handleSendMessage} style={{display:'flex', padding:'10px', background:'#0f172a', borderTop:'1px solid rgba(255,255,255,0.1)'}}>
            <input type="text" value={chatInput} onChange={(e)=>setChatInput(e.target.value)} placeholder={t.chatPlaceholder} style={{flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#fff', outline:'none', fontSize:'0.9rem'}} />
            <button type="submit" style={{background:'#38bdf8', color:'#0f172a', fontWeight:'bold', border:'none', borderRadius:'8px', padding:'8px 15px', marginLeft:isRtl?'0':'10px', marginRight:isRtl?'10px':'0', cursor:'pointer'}}>{t.chatSend}</button>
          </form>
        </div>
      )}
    </div>
  );
}