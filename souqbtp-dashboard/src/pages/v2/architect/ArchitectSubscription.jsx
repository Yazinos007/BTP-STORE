import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../../../lib/supabase';
import useArchitectStore from '../../../store/useArchitectStore';
import useSettingsStore from '../../../store/useSettingsStore';

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
    upgradeNow: "اختر الباقة",
    upgradePro: "اشترك كـ محترف",
    upgradeVip: "انضم للنخبة الآن",
    activePlan: "✅ الباقة مفعلة الآن",
    checkoutTitle: "تأكيد الاشتراك",
    payWithCard: "💳 البطاقة (Utajir) - قريباً",
    payBank: "🏦 تحويل بنكي",
    processing: "⏳ جاري التفعيل السحري...",
    confirmPayment: "✅ تأكيد ودفع الاشتراك",
    close: "✖",

    // Tooltips
    proAiTooltip: "أبهر عملاءك بصور واقعية لغرفهم من خلال رفع مخططاتهم!",
    vipAiTooltipTitle: "بلا قيود!",
    vipAiTooltipDesc: "أنشئ تصاميم لا نهائية من الاقتراحات الواقعية لعملائك.",

    // Whitelabel
    whitelabelTitle: "وثّق عملك بعلامتك التجارية الخاصة 🏢",
    whitelabelDesc: "حصرياً في باقة النخبة (Elite): لن يرى عميلك شعار منصة SouqBTP بعد الآن. ستصدر جميع التقارير الهندسية، محاضر الزيارات، وإثباتات الـ GPS حاملة لـ شعار مكتبك الهندسي واسمك كعلامة مائية (Whitelabel). اجعل تقاريرك تبدو مصممة بأنظمة مكتبك الداخلية وكلف بمشاريعك باحترافية مطلقة.",
    yourLogo: "Your Logo",
    wlImagePlaceholder: "[صورة الورشة مع المطابقة]",
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
    feat8: "مدير حساب شخصي ومستشار ذكي",
    val3Month: "3 شهرياً",
    valLimit: "محدود (5 مرات)",
    valUnlimitAI: "✔ لا محدود",
    valUnlimit: "غير محدود",

    // FAQ
    faqTitle: "الأسئلة الشائعة حول الاشتراكات",
    faqs: [
      { q: 'هل يمكنني إلغاء الاشتراك أو تغيير الباقة لاحقاً؟', a: 'بالتأكيد! المنصة لا تلزمك بعقود احتكارية. يمكنك الترقية، التخفيض، أو إيقاف اشتراكك في أي وقت مباشرة من إعدادات حسابك. عند الإلغاء، ستستمر في الاستفادة من الميزات حتى نهاية دورتك المدفوعة.' },
      { q: 'كيف تعمل ميزة "المصادقة القانونية بختم GPS"؟', a: 'في باقات (Pro و Elite)، يقوم التطبيق بتسجيل إحداثيات الموقع الدقيقة (Latitude/Longitude) وتوقيت الزيارة، ويقوم بتشفيرها وطباعتها على التقرير الهندسي (PDF) المدمج مع اللقطة الحية، مما يمنح التقرير حجية وإثباتاً لزيارة الموقع.' },
      { q: 'ما هو الـ AI Render وكيف سيفيدني كمهندس؟', a: 'هي أداة مدمجة بالغرفة الحية. تخيل أن تصور صالوناً غير مكتمل بالآجور، وتقوم المنصة في ثوانٍ بتحويله لصورة واقعية (3D Render) تظهر للعميل كيف سيبدو بعد التبليط والصباغة والفرش، مما يسهل إقناع العميل بقراراتك الهندسية!' },
      { q: 'ماذا يقدم لي "المستشار الهندسي الذكي" في باقة VIP؟', a: 'هو شريك استراتيجي خاص بمكتبك يعمل بالذكاء الاصطناعي؛ يحلل ورشاتك النشطة، يصيغ لك الإنذارات والمحاضر القانونية بضغطة زر، ويقدم لك استشارات فورية في ضوابط التعمير، حساب الكميات، وتقسيم أتعاب العقود.' },
      { q: 'هل بيانات وتصاميم عملائي آمنة على المنصة؟', a: 'نعم، نستخدم تشفيراً سحابياً متقدماً لحماية جميع المخططات الهندسية والتقارير المرفوعة، ولا يمكن لأي طرف خارجي الاطلاع عليها.' }
    ],

    // VIP AI Co-Pilot
    chatHeader: "👑 الشريك الهندسي الذكي (VIP)",
    chatSubHeader: "متصل ببيانات مكتبك مباشرة",
    chatPlaceholder: "استشر شريكك (مثال: صغ إنذاراً للمقاول، احسب أتعاب فيلا...)",
    chatSend: "إرسال",
    copyBtn: "📋 نسخ النص",
    copiedBtn: "✅ تم النسخ!",
    chatQuick1: "⚖️ صياغة إنذار تقني لمقاول بسبب مخالفة",
    chatQuick2: "📊 تحليل وضعية ورشاتي النشطة وتوصيات اليوم",
    chatQuick3: "💼 هيكلة دفعات أتعاب المكتب لحماية حقوقي",
    chatQuick4: "📐 المعايير القياسية لخلطة الخرسانة والحديد",

    // Checkout
    checkoutTotal: "المبلغ الإجمالي للاقتطاع:",
    perMonth: "شهر",
    perYear: "سنة",
    periodMonthly: "شهرياً",
    periodAnnual: "سنوياً",
    agencyNameLabel: "اسم المكتب الهندسي / الشركة",
    agencyNamePlace: "مثال: Bureau d'Architecture Al Omran",
    iceLabel: "رقم التعريف الموحد ICE (للفوترة - اختياري)",
    icePlace: "000000000000000",
    secureData: "🔒 بياناتك مشفرة ومحمية بالكامل."
  },

  fr: {
    pageTitle: "Transformez votre cabinet en puissance technologique 📐",
    pageSubtitle: "Investissez dans votre image professionnelle. Rejoignez l'élite des architectes au Maroc utilisant la réalité augmentée.",
    badgeNew: "Édition Ingénierie v2.0 🚀",
    socialProof: "Plus de 200 bureaux d'études font confiance à notre plateforme.",
    monthly: "Paiement mensuel",
    annual: "Paiement annuel",
    saveBadge: "🎁 Économisez 30% en annuel + 2 mois offerts",
    currentPlan: "Plan Actuel",
    upgradeNow: "Choisir ce plan",
    upgradePro: "Devenir Pro",
    upgradeVip: "Rejoindre l'Élite VIP",
    activePlan: "✅ Plan Actif",
    checkoutTitle: "Confirmer l'Abonnement",
    payWithCard: "💳 Carte (Utajir) - Bientôt",
    payBank: "🏦 Virement Bancaire",
    processing: "⏳ Activation en cours...",
    confirmPayment: "✅ Confirmer et Payer",
    close: "✖",

    proAiTooltip: "Impressionnez vos clients avec des rendus réalistes à partir de leurs plans !",
    vipAiTooltipTitle: "Sans limites !",
    vipAiTooltipDesc: "Créez une infinité de propositions réalistes pour vos clients.",

    whitelabelTitle: "Documentez avec votre propre marque 🏢",
    whitelabelDesc: "Exclusivement dans le pack Élite (VIP) : Vos clients ne verront plus le logo SouqBTP. Tous les rapports, PV de chantier et preuves GPS porteront le logo et le nom de votre cabinet en filigrane (Whitelabel).",
    yourLogo: "Votre Logo",
    wlImagePlaceholder: "[Photo du chantier avec superposition]",
    engineerSeal: "Sceau de l'architecte : ✔️",

    comparisonTitle: "Comparaison Détaillée des Fonctionnalités",
    featColumn: "Fonctionnalité",
    feat1: "Gestion des chantiers",
    feat2: "Salle Live (AR)",
    feat3: "Outil Règle & Mesures",
    feat4: "Rapports PDF (Sceau GPS)",
    feat5: "Intelligence Artificielle (AI)",
    feat6: "Enregistrement vidéo (MP4)",
    feat7: "Marque Blanche (Whitelabel)",
    feat8: "Partenaire IA & Gestionnaire dédié",
    val3Month: "3 / mois",
    valLimit: "Limité (5 fois)",
    valUnlimitAI: "✔ Illimité",
    valUnlimit: "Illimité",

    faqTitle: "Questions Fréquentes sur les Abonnements",
    faqs: [
      { q: 'Puis-je annuler ou modifier mon abonnement plus tard ?', a: 'Absolument ! Aucun contrat abusif. Vous pouvez évoluer, réduire ou arrêter votre abonnement à tout moment depuis vos paramètres.' },
      { q: 'Comment fonctionne la "Certification Légale GPS" ?', a: 'Dans les packs Pro et Elite, l\'application enregistre les coordonnées exactes (Lat/Long) et l\'heure, puis les imprime sur le PV PDF avec la capture en direct.' },
      { q: 'Qu\'est-ce que l\'AI Render et comment m\'aide-t-il ?', a: 'C\'est un outil intégré à la salle live. Photographiez une pièce brute en briques et transformez-la en quelques secondes en rendu 3D réaliste.' },
      { q: 'Que m\'apporte le "Partenaire IA VIP" ?', a: 'Un copilote stratégique exclusif : il analyse vos chantiers actifs, rédige vos mises en demeure et réserves techniques en un clic, et structure vos contrats d\'honoraires.' },
      { q: 'Les données et plans de mes clients sont-ils sécurisés ?', a: 'Oui, toutes vos données et plans sont cryptés sur des serveurs cloud hautement sécurisés.' }
    ],

    chatHeader: "👑 Co-Pilote Architectural (VIP)",
    chatSubHeader: "Connecté aux données de votre cabinet",
    chatPlaceholder: "Consultez votre partenaire (ex: Rédiger une mise en demeure...)",
    chatSend: "Envoyer",
    copyBtn: "📋 Copier",
    copiedBtn: "✅ Copié !",
    chatQuick1: "⚖️ Rédiger une mise en demeure technique (PV)",
    chatQuick2: "📊 Bilan de mes chantiers actifs & priorités",
    chatQuick3: "💼 Structurer mes tranches d'honoraires",
    chatQuick4: "📐 Dosages béton & ratios d'armatures standards",

    checkoutTotal: "Montant total à régler :",
    perMonth: "mois",
    perYear: "an",
    periodMonthly: "mensuellement",
    periodAnnual: "annuellement",
    agencyNameLabel: "Nom du cabinet d'études / Société",
    agencyNamePlace: "Ex: Bureau d'Architecture Al Omran",
    iceLabel: "Identifiant Commun de l'Entreprise ICE (Optionnel)",
    icePlace: "000000000000000",
    secureData: "🔒 Vos données sont entièrement cryptées et protégées."
  },

  en: {
    pageTitle: "Turn your firm into a technological powerhouse 📐",
    pageSubtitle: "Invest in your professional interface. Join the elite architects in Morocco using AR to elevate projects and save time.",
    badgeNew: "Engineering Edition v2.0 🚀",
    socialProof: "Over 200 engineering firms trust our platform today.",
    monthly: "Monthly billing",
    annual: "Annual billing",
    saveBadge: "🎁 Save 30% with Annual Billing + 2 months free",
    currentPlan: "Current Plan",
    upgradeNow: "Select Plan",
    upgradePro: "Subscribe as Pro",
    upgradeVip: "Join Elite VIP Now",
    activePlan: "✅ Plan Active Now",
    checkoutTitle: "Confirm Subscription",
    payWithCard: "💳 Card (Utajir) - Soon",
    payBank: "🏦 Bank Transfer",
    processing: "⏳ Magic Activation...",
    confirmPayment: "✅ Confirm & Pay",
    close: "✖",

    proAiTooltip: "Impress clients with realistic room renders by uploading their plans!",
    vipAiTooltipTitle: "Unlimited!",
    vipAiTooltipDesc: "Generate endless realistic design proposals for your clients.",

    whitelabelTitle: "Document your work with your own brand 🏢",
    whitelabelDesc: "Exclusively in the Elite (VIP) tier: Your clients will never see the SouqBTP logo. All engineering reports, site PVs, and GPS proofs will carry your firm's logo and name as a watermark (Whitelabel).",
    yourLogo: "Your Logo",
    wlImagePlaceholder: "[Site photo with AR overlay]",
    engineerSeal: "Architect Seal: ✔️",

    comparisonTitle: "Detailed Feature Comparison",
    featColumn: "Engineering Feature",
    feat1: "Workshops Management",
    feat2: "Field Live Room (AR)",
    feat3: "Smart Ruler & Measurement",
    feat4: "PDF Reports with GPS Seal",
    feat5: "Artificial Intelligence (AI)",
    feat6: "Session Recording (MP4 Video)",
    feat7: "Custom Branding (Whitelabel)",
    feat8: "Personal AI Partner & Account Manager",
    val3Month: "3 / month",
    valLimit: "Limited (5 times)",
    valUnlimitAI: "✔ Unlimited",
    valUnlimit: "Unlimited",

    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: 'Can I cancel or change my plan later?', a: 'Absolutely! No lock-in contracts. You can upgrade, downgrade, or cancel anytime directly from your account settings.' },
      { q: 'How does the "GPS Legal Seal" work?', a: 'In Pro and Elite plans, the app records exact coordinates and timestamps, encrypting and printing them onto the PDF report alongside the live capture.' },
      { q: 'What is AI Render and how does it help me?', a: 'Built into the live room, it transforms unfinished brick rooms into realistic 3D renders in seconds, helping clients visualize your decisions.' },
      { q: 'What does the "VIP AI Partner" do for my office?', a: 'An exclusive strategic co-pilot: it analyzes your active workshops, drafts legal technical notices in one click, and advises on structural ratios and fee contracts.' },
      { q: 'Are my clients\' designs and data secure?', a: 'Yes, we use advanced cloud encryption to protect all uploaded blueprints and reports.' }
    ],

    chatHeader: "👑 VIP Architectural Co-Pilot",
    chatSubHeader: "Synced with your firm's live data",
    chatPlaceholder: "Ask your partner (e.g., Draft contractor notice, fee stages...)",
    chatSend: "Send",
    copyBtn: "📋 Copy Text",
    copiedBtn: "✅ Copied!",
    chatQuick1: "⚖️ Draft formal technical notice for contractor",
    chatQuick2: "📊 Analyze my active workshops & priorities",
    chatQuick3: "💼 Structure architectural fee milestones",
    chatQuick4: "📐 Standard concrete & steel reinforcement ratios",

    checkoutTotal: "Total amount due:",
    perMonth: "month",
    perYear: "year",
    periodMonthly: "monthly",
    periodAnnual: "annually",
    agencyNameLabel: "Engineering Firm / Company Name",
    agencyNamePlace: "E.g.: Bureau d'Architecture Al Omran",
    iceLabel: "ICE Tax ID (Optional)",
    icePlace: "000000000000000",
    secureData: "🔒 Your data is fully encrypted and protected."
  }
};

export default function ArchitectSubscription() {
  const { architectProfile: profile, fetchArchitectData } = useArchitectStore();
  const { language = 'ar' } = useSettingsStore();

  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [agencyName, setAgencyName] = useState('');
  const [agencyICE, setAgencyICE] = useState('');

  // VIP AI Partner State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [officeStats, setOfficeStats] = useState({ activeCount: 0, projectNames: [] });
  const messagesEndRef = useRef(null);

  // Animated Prices State
  const [priceBasic, setPriceBasic] = useState(139);
  const [pricePro, setPricePro] = useState(349);
  const [priceVip, setPriceVip] = useState(699);

  const [currentPlanId, setCurrentPlanId] = useState('basic');

  // جلب الباقة الحقيقية + إحصائيات المكتب الحية للمستشار الذكي
  useEffect(() => {
    const loadArchitectContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = profile?.user_id || user?.id;

      if (targetUserId) {
        const { data: archData } = await supabase
          .from('architects')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (archData) {
          setCurrentPlanId(archData.subscription_plan?.toLowerCase() || 'basic');
          setAgencyName(archData.agency_name || '');
        }

        const archId = archData?.id || profile?.id || targetUserId;
        const { data: convs } = await supabase
          .from('conversations')
          .select('project_name, status')
          .eq('architect_id', archId);

        if (convs) {
          const active = convs.filter(c => c.project_name && c.project_name.trim() !== '');
          setOfficeStats({
            activeCount: active.length,
            projectNames: active.slice(0, 3).map(c => c.project_name)
          });
        }
      }
    };
    loadArchitectContext();
  }, [profile]);

  // رسالة الترحيب الذكية المخصصة باسم المهندس ومكتبه
  useEffect(() => {
    const engName = profile?.full_name || (isRtl ? 'يا باشمهندس' : 'Architecte');
    const firm = profile?.agency_name || agencyName || (isRtl ? 'مكتبكم الهندسي' : 'votre cabinet');

    let welcomeText = '';
    if (language === 'ar') {
      welcomeText = `أهلاً بك يا ${engName} 👑! أنا شريكك الاستراتيجي ومستشارك الهندسي الخاص بـ (${firm}). لدي وصول مباشر لبيانات مكتبك (${officeStats.activeCount} ورشات نشطة). كيف نرفع إنتاجية المكتب اليوم؟`;
    } else if (language === 'fr') {
      welcomeText = `Bienvenue ${engName} 👑 ! Je suis votre copilote stratégique dédié au cabinet (${firm}). Vous avez actuellement ${officeStats.activeCount} chantiers actifs. Que préparons-nous aujourd'hui ?`;
    } else {
      welcomeText = `Welcome ${engName} 👑! I am your strategic AI co-pilot for (${firm}). You currently have ${officeStats.activeCount} active workshops. How can I assist your practice today?`;
    }

    setMessages([{ sender: 'bot', text: welcomeText }]);
  }, [language, profile, agencyName, officeStats.activeCount, isRtl]);

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
          const updates = {
            subscription_plan: selectedPlan.code,
            updated_at: new Date().toISOString()
          };
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

  // 🧠 المحرك العبقري للمستشار الهندسي (VIP Co-Pilot Engine)
  const generateSmartPartnerReply = (typeOrQuery) => {
    const firm = profile?.agency_name || agencyName || 'المكتب الهندسي';
    const eng = profile?.full_name || 'المهندس المشرف';
    const today = new Date().toLocaleDateString(isRtl ? 'ar-MA' : 'fr-MA');

    if (typeOrQuery === 1 || String(typeOrQuery).includes('إنذار') || String(typeOrQuery).includes('مقاول') || String(typeOrQuery).includes('mise en demeure')) {
      if (language === 'fr') {
        return {
          text: `Voici un modèle de réserve technique officielle prêt à être inséré dans votre PV ou envoyé à l'entreprise :`,
          copyable: `📌 AVIS TECHNIQUE & MISE EN DEMEURE\nDate : ${today}\nCabinet : ${firm} (${eng})\n\nSuite à notre inspection visuelle et vérification par superposition AR, nous constatons une non-conformité par rapport aux plans d'exécution validés.\n⚠️ Il est demandé à l'entreprise d'arrêter immédiatement le coulage sur la zone concernée et de procéder aux rectifications sous 48h avant nouvelle réception.\n\n[Sceau Officiel - ${firm}]`
        };
      }
      return {
        text: `إليك صياغة قانونية وتقنية شديدة اللهجة وجاهزة للنسخ لإرسالها للمقاول أو إدراجها في محضر الورش (PV) لحماية مسؤوليتك العشرية:`,
        copyable: `📌 إشعار تقني وإنذار بعدم المطابقة\nالتاريخ: ${today}\nصادر عن: ${firm} - إشراف: ${eng}\n\nبناءً على المعاينة الميدانية والمطابقة الرقمية للمخططات المرخصة، سجلنا مخالفة صريحة للضوابط التقنية في الأشغال الجارية.\n⚠️ يُطلب من المقاول التوقف الفوري عن إتمام هذه المرحلة وتصحيح الوضعية وفق المخطط التنفيذي في أجل أقصاه 48 ساعة، مع إخلاء مسؤولية مكتب الدراسات عن أي تجاوز غير مصادق عليه.\n\n[ختم ومصادقة: ${firm}]`
      };
    }

    if (typeOrQuery === 2 || String(typeOrQuery).includes('ورشات') || String(typeOrQuery).includes('تحليل') || String(typeOrQuery).includes('chantiers')) {
      const listStr = officeStats.projectNames.length > 0 ? officeStats.projectNames.join('، ') : (isRtl ? 'لا توجد ورشات مسماة بعد' : 'Aucun chantier nommé');
      if (language === 'fr') {
        return {
          text: `📊 Bilan en temps réel pour (${firm}) :\n• Chantiers actifs supervisés : ${officeStats.activeCount}\n• Projets récents : ${listStr}\n\n💡 Conseil du partenaire : Planifiez une session Live AR de 10 minutes avec vos clients actifs avant chaque coulage de dalle pour générer un PV horodaté GPS. Cela réduit les litiges de 85%.`
        };
      }
      return {
        text: `📊 تقرير النبض الحي لـ (${firm}):\n• عدد الورشات النشطة حالياً: ${officeStats.activeCount} ورشات.\n• أبرز الملفات المفتوحة: (${listStr}).\n\n💡 توصية شريكك الذكي اليوم:\nقبل صب أي سقف (Dalle) هذا الأسبوع، اطلب من العميل فتح الغرفة الحية (Live AR) لمدة 5 دقائق، وفعّل المخطط الشفاف للتحقق من أماكن الأعمدة، ثم اضغط "ختم GPS". هذا الإجراء يوثق أتعابك ويحميك قانونياً 100%!`
      };
    }

    if (typeOrQuery === 3 || String(typeOrQuery).includes('أتعاب') || String(typeOrQuery).includes('عقد') || String(typeOrQuery).includes('honoraires')) {
      if (language === 'fr') {
        return {
          text: `💼 Répartition optimale des honoraires recommandée pour protéger votre trésorerie :`,
          copyable: `📋 ÉCHÉANCIER DES HONORAIRES (${firm}) :\n1. Signature & Esquisse (APS) : 20%\n2. Dépôt Autorisation de Construire (APD) : 30%\n3. Obtention du Permis & Plans d'exécution : 20%\n4. Suivi de chantier (fondations à gros œuvres) : 20%\n5. Réception provisoire & Permis d'habiter : 10%`
        };
      }
      return {
        text: `💼 كشريكك الإداري، أنصحك باعتماد هذه الهيكلة الذكية للأتعاب في عقودك الجديدة لضمان السيولة وعدم تأخر العملاء في الأداء:`,
        copyable: `📋 جدول استحقاق الأتعاب الهندسية (${firm}):\n1️⃣ الدفعة الأولى (20%): عند فتح الملف والمصادقة على التصميم الأولي (Esquisse).\n2️⃣ الدفعة الثانية (30%): عند إيداع ملف رخصة البناء بالمنصة.\n3️⃣ الدفعة الثالثة (20%): فور استصدار رخصة البناء وتسليم المخططات التنفيذية.\n4️⃣ الدفعة الرابعة (20%): مقسمة على زيارات تتبع الأشغال الكبرى (الأساسات والخرسانة).\n5️⃣ الدفعة الأخيرة (10%): عند التسليم النهائي وشهادة المطابقة (Permis d'habiter).`
      };
    }

    if (typeOrQuery === 4 || String(typeOrQuery).includes('خرسانة') || String(typeOrQuery).includes('حديد') || String(typeOrQuery).includes('béton')) {
      return {
        text: isRtl
          ? `📐 المرجع السريع للمعايير القياسية في الورش:\n• خرسانة المسلحة (Béton Armé B25): 350 كغ إسمنت CPJ45 لكل متر مكعب + 800 لتر حصى (Gravier) + 400 لتر رمل + ~175 لتر ماء.\n• خرسانة النظافة (Béton de propreté): 250 كغ إسمنت/م³ بسمك 10 سم.\n• نسبة الحديد التقديرية: الألواح (Dalles) 80-100 كغ/م³ | الأعمدة (Poteaux) 120-150 كغ/م³.\n• الارتداد القانوني للأبنية السكنية: لا يقل الفناء (Patio/Cour) عن 3x3 متر أو حسب ضابط التعمير المحلي.`
          : `📐 Mémo Technique Chantier :\n• Béton Armé (B25) : Dosage 350 kg/m³ (CPJ45), 800L gravier, 400L sable.\n• Béton de propreté : 250 kg/m³ (épaisseur 10cm).\n• Ratios d'acier moyens : Dalles 80-100 kg/m³ | Poteaux 120-150 kg/m³ | Semelles 90-110 kg/m³.`
      };
    }

    // استجابة ذكية لأي سؤال حر يكتبه المهندس
    return {
      text: isRtl
        ? `🧠 تحليل الشريك الهندسي لطلبك ("${typeOrQuery}"):\nبصفتك عضواً في نخبة VIP (${firm})، أنصحك بتوثيق هذه النقطة فوراً عبر الغرفة الميدانية (AR) وإرفاقها بختم الإحداثيات (GPS). هل ترغب في أن أصيغ لك بنداً قانونياً مخصصاً حول "${typeOrQuery}" لإدراجه في محضر الورشة؟`
        : `🧠 Analyse du Co-Pilote pour ("${typeOrQuery}") :\nEn tant que membre VIP (${firm}), je vous recommande de documenter ce point via la Salle Live AR avec sceau GPS.`
    };
  };

  const triggerPartnerAction = (actionKey, displayQuestion) => {
    setMessages(prev => [...prev, { sender: 'user', text: displayQuestion }]);
    setMessages(prev => [...prev, { sender: 'bot', text: '⏳ ...', isTyping: true }]);

    setTimeout(() => {
      const replyObj = generateSmartPartnerReply(actionKey);
      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, { sender: 'bot', text: replyObj.text, copyable: replyObj.copyable }]);
    }, 900);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput;
    setChatInput('');
    triggerPartnerAction(q, q);
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
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
        .pulse-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #10b981; animation: pulse 1.5s infinite; margin: 0 6px; }
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
        .popular-ribbon { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: #000; padding: 5px 25px; border-radius: 50px; font-weight: 900; font-size: 0.9rem; box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4); white-space: nowrap; }
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

        /* 🤖 المساعد الذكي الحصري للنخبة VIP */
        .ai-widget-btn { position: fixed; bottom: 30px; ${isRtl ? 'left: 30px;' : 'right: 30px;'} width: 65px; height: 65px; background: linear-gradient(135deg, #fbbf24, #d97706); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 2rem; cursor: pointer; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.5); z-index: 1000; animation: floatBot 3s ease-in-out infinite; border: 2px solid #fff; }
        @keyframes floatBot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        
        .ai-chat-window { position: fixed; bottom: 110px; ${isRtl ? 'left: 30px;' : 'right: 30px;'} width: 370px; max-width: 92vw; background: rgba(15, 23, 42, 0.96); border: 2px solid var(--gold); border-radius: 22px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); z-index: 1000; backdrop-filter: blur(20px); overflow: hidden; animation: slideUp 0.3s ease-out; display: flex; flex-direction: column; }
        .ai-header { background: linear-gradient(90deg, rgba(251, 191, 36, 0.15), rgba(56, 189, 248, 0.1)); padding: 14px 18px; border-bottom: 1px solid rgba(251, 191, 36, 0.3); display: flex; justify-content: space-between; align-items: center; }
        .ai-header h4 { margin: 0; color: var(--gold); font-size: 1rem; font-weight: 900; }
        .ai-messages { padding: 15px; height: 270px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
        .msg-bot { background: rgba(255,255,255,0.06); padding: 12px 15px; border-radius: 15px 15px 0 15px; color: #e2e8f0; font-size: 0.88rem; align-self: flex-start; max-width: 90%; border: 1px solid var(--glass-border); line-height: 1.6; white-space: pre-line; }
        .msg-user { background: rgba(251, 191, 36, 0.2); padding: 10px 15px; border-radius: 15px 15px 15px 0; color: #fff; font-size: 0.88rem; align-self: flex-end; max-width: 85%; border: 1px solid var(--gold); }
        
        .copy-box { background: rgba(2, 6, 23, 0.85); border: 1px dashed var(--gold); border-radius: 10px; padding: 10px; margin-top: 8px; font-size: 0.8rem; color: #cbd5e1; white-space: pre-line; }
        .copy-btn { margin-top: 8px; width: 100%; background: rgba(251, 191, 36, 0.2); color: var(--gold); border: 1px solid var(--gold); border-radius: 8px; padding: 6px; font-family: 'Cairo'; font-weight: bold; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
        .copy-btn:hover { background: var(--gold); color: #000; }

        .ai-options { padding: 10px 15px; display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--glass-border); max-height: 145px; overflow-y: auto; }
        .ai-option-btn { background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); color: #38bdf8; padding: 7px 10px; border-radius: 8px; font-family: 'Cairo'; cursor: pointer; transition: 0.2s; font-size: 0.8rem; text-align: ${isRtl ? 'right' : 'left'}; font-weight: bold; }
        .ai-option-btn:hover { background: rgba(251, 191, 36, 0.15); border-color: var(--gold); color: var(--gold); }

        @media (max-width: 900px) {
            .pricing-cards { grid-template-columns: 1fr; }
            .pro-card { transform: none; }
            .sub-header h1 { font-size: 2rem; }
        }
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
          {/* Basic Card */}
          <div className="card basic-card">
            <div className="card-header">
              <div className="tier-icon icon-basic">🌱</div>
              <h3>{ language === 'ar' ? 'الباقة الأساسية' : language === 'fr' ? 'Pack Basique (Basic)' : 'Basic Plan' }</h3>
              <div className="price">
                <span className="currency">د.م</span>
                <span className="amount">{priceBasic}</span>
                <span className="period">/ {t.perMonth}</span>
              </div>
            </div>
            <ul className="features-list">
              <li>✔️ { language === 'ar' ? '3 ورشات عمل نشطة شهرياً' : language === 'fr' ? '3 chantiers actifs / mois' : '3 active workshops / month' }</li>
              <li>✔️ { language === 'ar' ? 'الغرفة التفاعلية الميدانية (AR)' : language === 'fr' ? 'Salle interactive terrain (AR)' : 'Interactive Field Room (AR)' }</li>
              <li>✔️ { language === 'ar' ? 'رفع مخطط واحد لكل ورشة' : language === 'fr' ? '1 plan par chantier' : '1 blueprint per workshop' }</li>
              <li className="disabled">🔒 {t.feat3}</li>
              <li className="disabled">🔒 {t.feat4}</li>
              <li className="disabled">🔒 {t.feat5}</li>
              <li className="disabled">🔒 {t.feat8}</li>
            </ul>
            <button 
              className="sub-btn basic-btn" 
              disabled={currentPlanId === 'basic'}
              onClick={() => openCheckout('basic', 'Basic 🌱', 139)}
              style={currentPlanId === 'basic' ? { background: '#10b981', color: '#fff', border: 'none', cursor: 'default' } : {}}
            >
              {currentPlanId === 'basic' ? t.activePlan : t.upgradeNow}
            </button>
          </div>

          {/* Pro Card */}
          <div className="card pro-card">
            <div className="popular-ribbon">{ language === 'ar' ? 'الأكثر طلباً 🔥' : language === 'fr' ? 'Le plus demandé 🔥' : 'Most Popular 🔥' }</div>
            <div className="card-header">
              <div className="tier-icon icon-pro">🔥</div>
              <h3>{ language === 'ar' ? 'باقة المحترفين (Pro)' : language === 'fr' ? 'Pack Professionnel (Pro)' : 'Pro Plan' }</h3>
              <div className="price">
                <span className="currency">د.م</span>
                <span className="amount">{pricePro}</span>
                <span className="period">/ {t.perMonth}</span>
              </div>
            </div>
            <ul className="features-list">
              <li>✔️ { language === 'ar' ? <>ورشات عمل <b>غير محدودة</b></> : language === 'fr' ? <>Chantiers <b>illimités</b></> : <><b>Unlimited</b> workshops</> }</li>
              <li>✔️ { language === 'ar' ? 'ميزة الطبقات الشفافة (Layers)' : language === 'fr' ? 'Calques transparents (Layers)' : 'Transparent Layers' }</li>
              <li>✔️ <b>{t.feat3}</b></li>
              <li>✔️ <b>{t.feat4}</b></li>
              <li className="has-tooltip">🧠 <b>{ language === 'ar' ? '5 رندر ذكاء اصطناعي/شهر' : language === 'fr' ? '5 Rendus IA / mois' : '5 AI Renders / month' }</b>
                <div className="tooltip-box">
                  <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="AI Preview" />
                  <span>{t.proAiTooltip}</span>
                </div>
              </li>
              <li>✔️ { language === 'ar' ? '5 جيجابايت تخزين سحابي' : '5 GB Cloud Storage' }</li>
              <li className="disabled">🔒 {t.feat7}</li>
              <li className="disabled">🔒 {t.feat8}</li>
            </ul>
            <button 
              className="sub-btn pro-btn" 
              disabled={currentPlanId === 'pro'}
              onClick={() => openCheckout('pro', 'Pro 🔥', 349)}
              style={currentPlanId === 'pro' ? { background: '#10b981', color: '#fff', border: 'none', boxShadow: 'none', cursor: 'default' } : {}}
            >
              {currentPlanId === 'pro' ? t.activePlan : t.upgradePro}
            </button>
          </div>

          {/* VIP Card */}
          <div className="card vip-card">
            <div className="card-header">
              <div className="tier-icon icon-vip">👑</div>
              <h3>{ language === 'ar' ? 'النخبة (Elite VIP)' : 'Élite (VIP)' }</h3>
              <div className="price">
                <span className="currency">د.م</span>
                <span className="amount">{priceVip}</span>
                <span className="period">/ {t.perMonth}</span>
              </div>
            </div>
            <ul className="features-list">
              <li>✔️ { language === 'ar' ? 'كل مميزات باقة المحترفين' : language === 'fr' ? 'Tout le pack Professionnel' : 'All Pro features included' }</li>
              <li className="has-tooltip">✨ <b style={{color:'var(--gold)'}}>{ language === 'ar' ? 'ذكاء اصطناعي (لا محدود)' : language === 'fr' ? 'IA Render (Illimité)' : 'Unlimited AI Render' }</b>
                <div className="tooltip-box" style={{borderColor:'var(--gold)'}}>
                  <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="VIP AI" style={{border:'1px solid var(--gold)'}} />
                  <span style={{color:'var(--gold)', fontWeight:'bold', display:'block', marginBottom:'5px'}}>{t.vipAiTooltipTitle}</span>
                  <span>{t.vipAiTooltipDesc}</span>
                </div>
              </li>
              <li>✨ <b>{t.feat6}</b></li>
              <li>✨ <b style={{color:'var(--gold)'}}>{t.feat7}</b></li>
              <li>✨ <b style={{color:'#38bdf8'}}>{t.feat8}</b></li>
            </ul>
            <button 
              className="sub-btn vip-btn" 
              disabled={currentPlanId === 'vip'}
              onClick={() => openCheckout('vip', 'Elite VIP 👑', 699)}
              style={currentPlanId === 'vip' ? { background: '#10b981', color: '#fff', border: 'none', cursor: 'default' } : {}}
            >
              {currentPlanId === 'vip' ? t.activePlan : t.upgradeVip}
            </button>
          </div>
        </div>

        {/* Whitelabel Preview */}
        <div className="whitelabel-section">
          <div className="wl-text">
            <h2>{t.whitelabelTitle}</h2>
            <p>{t.whitelabelDesc}</p>
          </div>
          <div className="wl-image">
            <div style={{background: 'white', padding: '20px', borderRadius: '8px', textAlign: isRtl ? 'right' : 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transform: 'rotate(3deg)'}}>
              <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #1e293b', paddingBottom:'10px', marginBottom:'10px'}}>
                <div style={{width: '50px', height: '50px', background: '#cbd5e1', borderRadius: '5px', display: 'flex', alignItems:'center', justifyContent:'center', color:'#0f172a', fontWeight:'bold', fontSize:'0.7rem'}}>{t.yourLogo}</div>
                <div style={{textAlign:'left'}}>
                  <div style={{width:'100px', height:'10px', background:'#e2e8f0', marginBottom:'5px'}}></div>
                  <div style={{width:'60px', height:'10px', background:'#e2e8f0'}}></div>
                </div>
              </div>
              <div style={{width:'100%', height:'150px', background:'#f1f5f9', border:'1px dashed #cbd5e1', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>{t.wlImagePlaceholder}</div>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div style={{width:'40%', height:'10px', background:'#e2e8f0'}}></div>
                <div style={{fontWeight:'bold', color:'#1e293b', fontSize:'0.8rem'}}>{t.engineerSeal}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="comparison-section">
          <h2>{t.comparisonTitle}</h2>
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>{t.featColumn}</th>
                  <th>Basic 🌱</th>
                  <th>Pro 🔥</th>
                  <th>VIP 👑</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t.feat1}</td>
                  <td>{t.val3Month}</td>
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

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>{t.faqTitle}</h2>
          {t.faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <details>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedPlan && (
        <div className="modal-overlay">
          <div className="checkout-modal">
            <button className="close-modal" onClick={() => setIsCheckoutOpen(false)}>✖</button>
            <h2>{t.checkoutTitle} ({selectedPlan.name})</h2>
            
            <p style={{color:'#94a3b8', textAlign:'center', fontSize:'0.9rem', marginBottom:'25px'}}>
              {t.checkoutTotal} <b style={{color:'#38bdf8', fontSize:'1.2rem'}}>{selectedPlan.price}</b> د.م / <span>{isAnnual ? t.periodAnnual : t.periodMonthly}</span>
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

      {/* 👑 الشريك الهندسي الذكي - يظهر حصرياً لأصحاب باقة VIP فقط! */}
      {currentPlanId === 'vip' && (
        <>
          <div className="ai-widget-btn" onClick={() => setIsChatOpen(!isChatOpen)} title={t.chatHeader}>
            🤖
          </div>

          {isChatOpen && (
            <div className="ai-chat-window">
              <div className="ai-header">
                <div>
                  <h4>{t.chatHeader}</h4>
                  <span style={{fontSize:'0.72rem', color:'#10b981', display:'block'}}>● {t.chatSubHeader}</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'#94a3b8', fontSize:'1.2rem', cursor:'pointer'}}>✖</button>
              </div>

              <div className="ai-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={msg.sender === 'bot' ? 'msg-bot' : 'msg-user'}>
                    <div>{msg.text}</div>
                    {msg.copyable && (
                      <div className="copy-box">
                        <div>{msg.copyable}</div>
                        <button className="copy-btn" onClick={() => handleCopyText(msg.copyable, index)}>
                          {copiedIndex === index ? t.copiedBtn : t.copyBtn}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="ai-options">
                <button className="ai-option-btn" onClick={() => triggerPartnerAction(1, t.chatQuick1)}>{t.chatQuick1}</button>
                <button className="ai-option-btn" onClick={() => triggerPartnerAction(2, t.chatQuick2)}>{t.chatQuick2}</button>
                <button className="ai-option-btn" onClick={() => triggerPartnerAction(3, t.chatQuick3)}>{t.chatQuick3}</button>
                <button className="ai-option-btn" onClick={() => triggerPartnerAction(4, t.chatQuick4)}>{t.chatQuick4}</button>
              </div>

              <form onSubmit={handleSendMessage} style={{display:'flex', padding:'10px', background:'#020617', borderTop:'1px solid rgba(255,255,255,0.1)', gap:'8px'}}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  style={{flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', padding:'8px 12px', color:'#fff', outline:'none', fontFamily:'Cairo', fontSize:'0.85rem'}}
                />
                <button type="submit" style={{background:'var(--gold)', color:'#000', fontWeight:'900', border:'none', borderRadius:'10px', padding:'8px 14px', fontFamily:'Cairo', cursor:'pointer', fontSize:'0.85rem'}}>
                  {t.chatSend}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}