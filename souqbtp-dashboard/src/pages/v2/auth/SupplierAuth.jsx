import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { 
  Store, Factory, Mail, Lock, Phone, Building2, Loader2, 
  CheckCircle2, AlertCircle, Mic, MicOff, Volume2, Camera, 
  MapPin, KeyRound, Eye, EyeOff, Sparkles, ShieldCheck 
} from 'lucide-react';
import { bindReferralOnSignup } from '../../../lib/referralHandler';

// 🏙️ خريطة المدن المغربية للالتقاط الصوتي الذكي
const MOROCCAN_CITIES_MAP = [
  { keywords: ['الدار البيضاء', 'كازا', 'casablanca', 'casa'], label: 'الدار البيضاء - Casablanca' },
  { keywords: ['الرباط', 'رباط', 'rabat'], label: 'الرباط - Rabat' },
  { keywords: ['مراكش', 'marrakech', 'marrakesh'], label: 'مراكش - Marrakech' },
  { keywords: ['طنجة', 'طنجه', 'tanger', 'tangier'], label: 'طنجة - Tanger' },
  { keywords: ['فاس', 'fes', 'fès'], label: 'فاس - Fès' },
  { keywords: ['أكادير', 'اكادير', 'agadir'], label: 'أكادير - Agadir' },
  { keywords: ['مكناس', 'meknes', 'meknès'], label: 'مكناس - Meknès' },
  { keywords: ['وجدة', 'وجده', 'oujda'], label: 'وجدة - Oujda' },
  { keywords: ['بني ملال', 'بنيملال', 'beni mellal', 'béni mellal'], label: 'بني ملال - Béni Mellal' },
  { keywords: ['قصبة تادلة', 'تادلة', 'تادلا', 'kasbah tadla', 'tadla'], label: 'قصبة تادلة - Kasbah Tadla' },
  { keywords: ['خنيفرة', 'خنيفره', 'khenifra', 'khénifra'], label: 'خنيفرة - Khénifra' },
  { keywords: ['خريبكة', 'خريبكه', 'khouribga'], label: 'خريبكة - Khouribga' },
  { keywords: ['القنيطرة', 'قنيطرة', 'kenitra', 'kénitra'], label: 'القنيطرة - Kénitra' },
  { keywords: ['تطوان', 'tetouan', 'tétouan'], label: 'تطوان - Tétouan' },
  { keywords: ['الجديدة', 'جديدة', 'el jadida', 'jadida'], label: 'الجديدة - El Jadida' },
  { keywords: ['آسفي', 'اسفي', 'safi'], label: 'آسفي - Safi' },
  { keywords: ['الناظور', 'ناظور', 'nador'], label: 'الناظور - Nador' },
  { keywords: ['المحمدية', 'محمدية', 'mohammedia'], label: 'المحمدية - Mohammedia' },
  { keywords: ['ورزازات', 'ouarzazate'], label: 'ورزازات - Ouarzazate' },
  { keywords: ['العيون', 'laayoune', 'laâyoune'], label: 'العيون - Laâyoune' }
];

// 📦 تصنيفات المواد والسلع بالصور والأيقونات الكبيرة (للتجار والموردين)
const STORE_CATEGORIES = [
  { id: 'gros_materiaux', icon: '🧱', ar: 'إسمنت، حديد وياجور', fr: 'Ciment, Fer & Briques', en: 'Cement, Iron & Bricks', keywords: ['إسمنت', 'اسمنت', 'سيما', 'حديد', 'ياجور', 'رمل', 'بريك', 'خرسانة', 'ciment', 'fer', 'brique', 'béton'] },
  { id: 'quincaillerie', icon: '🛠️', ar: 'دروكري وعقاقير عامة', fr: 'Droguerie & Outillage', en: 'Hardware & Tools', keywords: ['دروكري', 'عقاقير', 'معدات', 'دوزان', 'droguerie', 'quincaillerie', 'outillage'] },
  { id: 'sanitaire', icon: '🚰', ar: 'سباكة وتجهيز حمامات', fr: 'Plomberie & Sanitaire', en: 'Plumbing & Sanitary', keywords: ['سباكة', 'بلومبي', 'قوادس', 'سانيتير', 'حمامات', 'plomberie', 'sanitaire'] },
  { id: 'elec_eclairage', icon: '⚡', ar: 'كهرباء وإنارة', fr: 'Électricité & Éclairage', en: 'Electrical & Lighting', keywords: ['كهرباء', 'ضو', 'ضوء', 'كابلات', 'إنارة', 'انارة', 'électricité', 'éclairage'] },
  { id: 'peinture_deco', icon: '🎨', ar: 'صباغة، عزل وديكور', fr: 'Peinture & Étanchéité', en: 'Paint & Waterproofing', keywords: ['صباغة', 'صباغه', 'دهان', 'عزل', 'peinture', 'étanchéité'] },
  { id: 'carrelage_bois', icon: '⬜', ar: 'زليج، رخام وخشب', fr: 'Carrelage, Marbre & Bois', en: 'Tiles, Marble & Wood', keywords: ['زليج', 'رخام', 'سيراميك', 'خشب', 'ألمنيوم', 'carrelage', 'marbre', 'bois'] }
];

const translations = {
  ar: {
    portalSubtitle: "بوابة التجار وموردي مواد البناء (تسجيل صوتي وبصري ذكي)",
    tabRegister: "إنشاء حساب متجر / شركة",
    emailOptionalLabel: "البريد الإلكتروني (اختياري - يكفي رقم الهاتف)",
    passwordOrPinLabel: "الرمز السري (4 أرقام PIN) أو كلمة المرور *",
    pinPlaceholder: "مثال: 2580",
    companyLabel: "اسم المحل / الشركة *",
    companyPlaceholder: "مثال: دروكري الأمانة / شركة أطلس للبناء",
    phoneLabel: "رقم الهاتف (أساسي للدخول والتواصل) *",
    phonePlaceholder: "06XXXXXXXX / 05XXXXXXXX",
    cityLabel: "المدينة",
    cityPlaceholder: "مثال: قصبة تادلة، الدار البيضاء...",
    categoryLabel: "اختر تخصص متجرك / شركتك بالصورة:",
    storeBioLabel: "✨ بطاقة تعريف المتجر (صاغها الذكاء الاصطناعي لزبنائك):",
    registerBtn: "إنشاء الحساب وفتح لوحة القيادة الآن",
    retailBtn: "🏪 تاجر تجزئة (دروكري / محل)",
    wholesaleBtn: "🏭 مورد جملة (شركة / مصنع)",
    haveAccount: "لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول بالهاتف أو البريد",
    errEmailExists: "هذا الرقم أو البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.",
    errPhoneRequired: "يرجى إدخال رقم الهاتف أو البريد الإلكتروني.",
    errPinShort: "يرجى اختيار رمز سري مكون من 4 أرقام على الأقل.",
    errUnexpected: "حدث خطأ أثناء إنشاء الحساب.",
    successRegister: "✅ تم إنشاء حساب متجرك بنجاح! جاري فتح لوحة القيادة...",
    // مزايا الصوت والمسح الذكي
    audioGuideBtn: "🔊 استمع للشرح الصوتي",
    audioGuideStop: "⏹️ إيقاف الصوت",
    voiceBoxTitle: "🎙️ افتح متجرك بالصوت فقط (بدون كتابة)",
    voiceBoxDesc: "اضغط الميكروفون وقل: اسم المحل أو الشركة، المدينة، نوع السلعة، ورقم الهاتف!",
    voiceStartBtn: "اضغط وتحدث الآن",
    voiceStopBtn: "جاري الاستماع... تحدث الآن",
    scanCardBtn: "📷 تصوير الكارط فيزيت",
    scanningMsg: "جاري القراءة...",
    pinSecurityHint: "🛡️ احفظ هذا الرمز السري (4 أرقام مثل 2580) لتدخل به دائماً مع رقم هاتفك."
  },
  fr: {
    portalSubtitle: "Portail Détaillants & Grossistes BTP (Inscription Vocale & IA)",
    tabRegister: "Créer un compte Magasin / Société",
    emailOptionalLabel: "Email (Optionnel - Le téléphone suffit)",
    passwordOrPinLabel: "Code PIN (4 chiffres) ou Mot de passe *",
    pinPlaceholder: "Ex : 2580",
    companyLabel: "Nom de l'Entreprise / Boutique *",
    companyPlaceholder: "Ex : Droguerie Al Amana / Atlas BTP",
    phoneLabel: "Téléphone (Principal pour connexion) *",
    phonePlaceholder: "06XXXXXXXX / 05XXXXXXXX",
    cityLabel: "Ville",
    cityPlaceholder: "Ex : Kasbah Tadla, Casablanca...",
    categoryLabel: "Spécialité de votre magasin en image :",
    storeBioLabel: "✨ Présentation du magasin rédigée par l'IA :",
    registerBtn: "Créer le compte et ouvrir le tableau de bord",
    retailBtn: "🏪 Détaillant (Boutique / POS)",
    wholesaleBtn: "🏭 Grossiste (Société / Usine)",
    haveAccount: "Vous avez déjà un compte ?",
    loginLink: "Se connecter",
    errEmailExists: "Ce numéro ou email est déjà enregistré.",
    errPhoneRequired: "Veuillez entrer un numéro de téléphone ou un email.",
    errPinShort: "Veuillez choisir un code PIN d'au moins 4 chiffres.",
    errUnexpected: "Une erreur est survenue lors de l'inscription.",
    successRegister: "✅ Compte créé avec succès ! Ouverture du tableau de bord...",
    audioGuideBtn: "🔊 Écouter le guide vocal",
    audioGuideStop: "⏹️ Arrêter l'audio",
    voiceBoxTitle: "🎙️ Créez votre boutique par la voix (Sans clavier)",
    voiceBoxDesc: "Appuyez sur le micro et dites le nom du magasin, la ville, vos produits et votre téléphone !",
    voiceStartBtn: "Appuyez et parlez",
    voiceStopBtn: "Écoute en cours...",
    scanCardBtn: "📷 Scanner Carte de Visite",
    scanningMsg: "Lecture...",
    pinSecurityHint: "🛡️ Gardez ce code PIN (4 chiffres ex: 2580) pour vous connecter avec votre téléphone."
  },
  en: {
    portalSubtitle: "Retailers & Wholesalers Smart Portal (Voice & AI Onboarding)",
    tabRegister: "Create Store / Company Account",
    emailOptionalLabel: "Email (Optional - Phone is enough)",
    passwordOrPinLabel: "Secret PIN (4 digits) or Password *",
    pinPlaceholder: "E.g., 2580",
    companyLabel: "Company / Store Name *",
    companyPlaceholder: "E.g., Al Amana Hardware / Atlas BTP",
    phoneLabel: "Phone Number (Primary for login) *",
    phonePlaceholder: "06XXXXXXXX / 05XXXXXXXX",
    cityLabel: "City",
    cityPlaceholder: "E.g., Kasbah Tadla, Casablanca...",
    categoryLabel: "Select your store specialty visually:",
    storeBioLabel: "✨ AI-Generated Store Description:",
    registerBtn: "Create Account & Open Dashboard",
    retailBtn: "🏪 Retailer (Store / POS)",
    wholesaleBtn: "🏭 Wholesaler (Company / Factory)",
    haveAccount: "Already have an account?",
    loginLink: "Login",
    errEmailExists: "This phone or email is already registered.",
    errPhoneRequired: "Please enter a phone number or email.",
    errPinShort: "Please choose a PIN of at least 4 digits.",
    errUnexpected: "An error occurred during registration.",
    successRegister: "✅ Account created successfully! Opening dashboard...",
    audioGuideBtn: "🔊 Listen to Audio Guide",
    audioGuideStop: "⏹️ Stop Audio",
    voiceBoxTitle: "🎙️ Voice Store Registration (No typing)",
    voiceBoxDesc: "Tap the mic and say your store name, city, products, and phone number!",
    voiceStartBtn: "Tap & Speak Now",
    voiceStopBtn: "Listening...",
    scanCardBtn: "📷 Scan Business Card",
    scanningMsg: "Scanning...",
    pinSecurityHint: "🛡️ Keep this 4-digit PIN (e.g., 2580) to log in anytime with your phone."
  }
};

// 🔢 تحويل الأرقام المنطوقة بالعربية/الدارجة/الفرنسية إلى أرقام
const convertSpokenWordsToDigits = (text) => {
  if (!text) return '';
  let str = text.toLowerCase();
  const wordMap = {
    'صفر': '0', 'زيرو': '0', 'zero': '0', 'zéro': '0',
    'واحد': '1', 'واحدة': '1', 'un': '1', 'one': '1',
    'اثنان': '2', 'إثنان': '2', 'جوج': '2', 'زوج': '2', 'ثنتين': '2', 'deux': '2', 'two': '2',
    'ثلاثة': '3', 'تلاتة': '3', 'تلاته': '3', 'ثلاثه': '3', 'trois': '3', 'three': '3',
    'أربعة': '4', 'اربعة': '4', 'ربعة': '4', 'ربعه': '4', 'quatre': '4', 'four': '4',
    'خمسة': '5', 'خمسه': '5', 'cinq': '5', 'five': '5',
    'ستة': '6', 'سته': '6', 'ست': '6', 'six': '6',
    'سبعة': '7', 'سبعه': '7', 'sept': '7', 'seven': '7',
    'ثمانية': '8', 'تمنية': '8', 'ثمانيه': '8', 'تمنيه': '8', 'huit': '8', 'eight': '8',
    'تسعة': '9', 'تسعود': '9', 'تسعه': '9', 'neuf': '9', 'nine': '9'
  };
  Object.keys(wordMap).forEach((w) => {
    const regex = new RegExp(`(^|\\s)${w}(?=\\s|$)`, 'g');
    str = str.replace(regex, ` ${wordMap[w]} `);
  });
  const easternDigits = '٠١٢٣٤٥٦٧٨٩';
  str = str.replace(/[٠-٩]/g, (d) => easternDigits.indexOf(d));
  return str;
};

// 🔐 توحيد رقم الهاتف إلى بريد مقنع (@sasbtp.ma) عند عدم إدخال بريد إلكتروني
const resolveSupplierEmail = (emailInput, phoneInput) => {
  const rawEmail = (emailInput || '').trim();
  if (rawEmail.includes('@')) return rawEmail.toLowerCase();

  const rawSource = rawEmail || (phoneInput || '').trim();
  let digits = convertSpokenWordsToDigits(rawSource).replace(/\D/g, '');
  if (digits.startsWith('212') && digits.length >= 11) {
    digits = '0' + digits.slice(3);
  }
  if (digits.startsWith('00212') && digits.length >= 13) {
    digits = '0' + digits.slice(5);
  }
  return digits ? `${digits}@sasbtp.ma` : '';
};

// 🛡️ تغليف رمز PIN القصير (4 أو 5 أرقام) ليحقق شرط 6 أحرف في Supabase Auth
const wrapSecretPin = (secret) => {
  const clean = (secret || '').trim();
  if (clean.length > 0 && clean.length < 6) {
    return `SAS#PIN#${clean}#BTP`;
  }
  return clean;
};

export default function SupplierAuth() {
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.fr;

  const [supplierType, setSupplierType] = useState('retail'); // 'retail' | 'wholesale'
  const [selectedCategory, setSelectedCategory] = useState('quincaillerie');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  // حالات الصوت والمسح الذكي
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [listeningField, setListeningField] = useState(null);
  const [spokenPreview, setSpokenPreview] = useState('');
  const [isScanningCard, setIsScanningCard] = useState(false);

  const recognitionRef = useRef(null);
  const cardInputRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: '',
    phone: '',
    city: '',
    storeBio: ''
  });

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 6500);
  };

  // ==========================================
  // 🔊 1. المرشد الصوتي الناطق للتاجر والمورد
  // ==========================================
  const toggleAudioGuide = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingGuide) {
      window.speechSynthesis.cancel();
      setIsSpeakingGuide(false);
      return;
    }

    window.speechSynthesis.cancel();
    const guideText =
      language === 'ar'
        ? 'مرحباً بك في بوابة التجار والموردين بمنصة ساس بي تي بي. لإنشاء حساب متجرك أو شركتك بدون كتابة، اضغط على زر الميكروفون البرتقالي، وقل اسم المحل أو الشركة، المدينة، نوع السلعة، ورقم هاتفك، ثم اختر رمزاً سرياً بسيطاً من أربعة أرقام.'
        : language === 'fr'
        ? 'Bienvenue sur le portail Fournisseurs et Détaillants SasBTP. Appuyez sur le microphone orange et dites le nom de votre boutique ou société, votre ville et votre numéro de téléphone.'
        : 'Welcome to the SasBTP Suppliers Portal. Tap the orange microphone and speak your store or company name, city, and phone number.';

    const utterance = new SpeechSynthesisUtterance(guideText);
    utterance.lang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = 0.94;
    utterance.onend = () => setIsSpeakingGuide(false);
    utterance.onerror = () => setIsSpeakingGuide(false);

    setIsSpeakingGuide(true);
    window.speechSynthesis.speak(utterance);
  };

  // ==========================================
  // 🧠 2. التحليل الذكي لكلام التاجر/المورد وصياغة بطاقة المتجر
  // ==========================================
  const parseSupplierSpeech = (rawSpeech) => {
    const normalized = convertSpokenWordsToDigits(rawSpeech);
    const lower = normalized.toLowerCase();

    // أ) تحديد ما إذا كان المتحدث تاجر تجزئة (Retail) أم مورد جملة (Wholesale)
    let detectedType = supplierType;
    if (/(جملة|شركة|شركه|مصنع|معمل|ديبو|توريد|grossiste|usine|société|societe|b2b)/i.test(lower)) {
      detectedType = 'wholesale';
      setSupplierType('wholesale');
    } else if (/(دروكري|محل|متجر|تقسيط|تجزئة|عقاقير|حانوت|droguerie|boutique|magasin|détaillant)/i.test(lower)) {
      detectedType = 'retail';
      setSupplierType('retail');
    }

    // ب) استخراج رقم الهاتف المغربي
    const compactDigits = normalized.replace(/[\s\-./]/g, '');
    const phoneMatch = compactDigits.match(/(?:00212|\+212|212|0)([567]\d{8})/);
    const detectedPhone = phoneMatch ? `0${phoneMatch[1]}` : '';

    // ج) استخراج المدينة
    let detectedCity = '';
    for (const c of MOROCCAN_CITIES_MAP) {
      if (c.keywords.some((k) => lower.includes(k))) {
        detectedCity = c.label;
        break;
      }
    }

    // د) استخراج تصنيف السلع
    let matchedCat = STORE_CATEGORIES.find((c) => c.id === selectedCategory) || STORE_CATEGORIES[1];
    for (const cat of STORE_CATEGORIES) {
      if (cat.keywords.some((k) => lower.includes(k))) {
        matchedCat = cat;
        setSelectedCategory(cat.id);
        break;
      }
    }

    // هـ) استخراج اسم المحل أو الشركة
    let detectedCompany = '';
    const companyPatterns = [
      /(?:دروكري|محل|متجر|شركة|شركه|مؤسسة|مصنع|ديبو|معكم|أنا|انا|اسمي|سميتي)\s+([أ-يa-zA-Z0-9]+(?:\s+[أ-يa-zA-Z0-9]+){0,2})/i,
      /(?:droguerie|société|societe|entreprise|magasin|boutique)\s+([a-zA-Z0-9À-ÿ]+(?:\s+[a-zA-Z0-9À-ÿ]+){0,2})/i
    ];
    for (const pat of companyPatterns) {
      const m = rawSpeech.match(pat);
      if (m && m[0]) {
        detectedCompany = m[0]
          .replace(/^(معكم|أنا|انا|اسمي|سميتي)\s+/i, '')
          .replace(/\b(في|من|بمدينة|مدينة|لبيع|متخصص|رقم|هاتف|تليفون|de|à|sur)\b.*/i, '')
          .trim();
        break;
      }
    }

    // و) الصياغة التلقائية لبطاقة تعريف المتجر/الشركة بلغة سليمة
    const catName = language === 'ar' ? matchedCat.ar : language === 'fr' ? matchedCat.fr : matchedCat.en;
    const cityClean = detectedCity ? detectedCity.split(' - ')[language === 'ar' ? 0 : 1] || detectedCity : '';
    const typeLabelAr = detectedType === 'wholesale' ? 'مورد جملة وشركة معتمدة' : 'متجر وموزع معتمد';
    const typeLabelFr = detectedType === 'wholesale' ? 'Fournisseur Grossiste B2B' : 'Magasin & Détaillant BTP';

    const composedStoreBio =
      language === 'ar'
        ? `${detectedCompany || typeLabelAr} في منصة SasBTP، متخصص في توفير (${catName})${cityClean ? ` بمدينة ${cityClean} والنواحي` : ''}. نوفر سلعاً عالية الجودة، أسعاراً تنافسية للمقاولين والحرفيين، وخدمة سريعة.`
        : `${detectedCompany || typeLabelFr} vérifié sur SasBTP, spécialisé en ${catName}${cityClean ? ` à ${cityClean}` : ''}. Produits certifiés, tarifs compétitifs et disponibilité immédiate.`;

    setFormData((prev) => ({
      ...prev,
      company: detectedCompany || prev.company,
      phone: detectedPhone || prev.phone,
      city: detectedCity || prev.city,
      storeBio: composedStoreBio
    }));
  };

  // ==========================================
  // 🎙️ 3. تشغيل الميكروفون (الشامل أو لكل حقل)
  // ==========================================
  const toggleVoiceInput = (target = 'smartAll') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showAlert('error', language === 'ar' ? 'يرجى استخدام متصفح Chrome أو Safari لتفعيل الميكروفون الصوتي.' : 'Veuillez utiliser Chrome ou Safari pour la commande vocale.');
      return;
    }

    if (listeningField === target && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setListeningField(null);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListeningField(target);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setSpokenPreview(transcript);

      if (target === 'smartAll') {
        parseSupplierSpeech(transcript);
      } else if (target === 'phone') {
        const digits = convertSpokenWordsToDigits(transcript).replace(/\D/g, '');
        setFormData((prev) => ({ ...prev, phone: digits || transcript.trim() }));
      } else if (target === 'password') {
        const digits = convertSpokenWordsToDigits(transcript).replace(/\s+/g, '');
        setFormData((prev) => ({ ...prev, password: digits }));
      } else if (target === 'company' || target === 'city') {
        setFormData((prev) => ({ ...prev, [target]: transcript.trim() }));
      }
    };

    recognition.onerror = () => setListeningField(null);
    recognition.onend = () => setListeningField(null);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ==========================================
  // 📷 4. مسح الكارط فيزيت بالكاميرا (OCR Assist)
  // ==========================================
  const handleCardScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningCard(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      let detectedText = '';
      if ('TextDetector' in window) {
        try {
          const bitmap = await createImageBitmap(file);
          // eslint-disable-next-line no-undef
          const detector = new TextDetector();
          const blocks = await detector.detect(bitmap);
          detectedText = blocks.map((b) => b.rawValue).join(' ');
        } catch (err) {}
      }

      if (detectedText) {
        parseSupplierSpeech(detectedText);
        showAlert('success', language === 'ar' ? '✅ تم مسح بطاقة المتجر وتعبئة البيانات بنجاح!' : '✅ Carte commerciale scannée avec succès !');
      } else {
        const catObj = STORE_CATEGORIES.find((c) => c.id === selectedCategory) || STORE_CATEGORIES[1];
        const catTitle = language === 'ar' ? catObj.ar : catObj.fr;
        const autoBio =
          language === 'ar'
            ? `مؤسسة معتمدة في منصة SasBTP لتوريد وبيع (${catTitle}). تم توثيق البطاقة المهنية للمتجر.`
            : `Entreprise vérifiée SasBTP spécialisée en ${catTitle}. Carte commerciale jointe.`;

        setFormData((prev) => ({
          ...prev,
          storeBio: prev.storeBio || autoBio
        }));

        showAlert(
          'success',
          language === 'ar'
            ? '📷 تم إرفاق الكارط فيزيت وتجهيز وصف المتجر! يرجى التأكد من اسم المحل ورقم الهاتف.'
            : '📷 Carte jointe ! Veuillez vérifier le nom de la boutique et le téléphone.'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningCard(false);
    }
  };

  // ==========================================
  // 🚀 5. معالجة إنشاء حساب التاجر / المورد
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      const cleanPhone = convertSpokenWordsToDigits(formData.phone).replace(/\D/g, '') || formData.phone.trim();
      const effectiveEmail = resolveSupplierEmail(formData.email, cleanPhone);

      if (!effectiveEmail) {
        throw new Error(t.errPhoneRequired);
      }

      const finalPassword = wrapSecretPin(formData.password);
      if (!finalPassword || formData.password.trim().length < 4) {
        throw new Error(t.errPinShort);
      }

      const catObj = STORE_CATEGORIES.find((c) => c.id === selectedCategory) || STORE_CATEGORIES[1];
      const catLabel = language === 'ar' ? catObj.ar : catObj.fr;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: effectiveEmail,
        password: finalPassword,
        options: {
          data: {
            full_name: formData.company.trim(),
            company_name: formData.company.trim(),
            phone: cleanPhone,
            city: formData.city.trim(),
            specialty: catLabel,
            store_bio: formData.storeBio.trim(),
            supplier_type: supplierType,
            role: 'supplier',
            account_type: 'supplier'
          }
        }
      });

      if (authError) throw authError;
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        throw new Error(t.errEmailExists);
      }

      // حفظ بيانات المورد/التاجر في جدول suppliers
      await supabase
        .from('suppliers')
        .insert([
          {
            user_id: authData.user.id,
            store_name: formData.company.trim(),
            email: effectiveEmail,
            phone: cleanPhone,
            supplier_type: supplierType
          }
        ])
        .catch(() => {});

      // ربط كود الإحالة إن وجد
      if (authData?.user?.id) {
        await bindReferralOnSignup(authData.user.id);
      }

      showAlert('success', t.successRegister);

      // 🚀 توجيه مباشر إلى واجهة التاجر أو المورد داخل React
      sessionStorage.setItem('souqbtp_preview_mode', supplierType);
      setTimeout(() => {
        window.location.href = supplierType === 'wholesale' ? '/?preview=wholesale' : '/?preview=retail';
      }, 1200);
    } catch (err) {
      showAlert('error', err.message || t.errUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  const isWholesaler = supplierType === 'wholesale';
  const bgColor = isWholesaler
    ? 'from-slate-900 via-gray-800 to-black'
    : 'from-[#1e1b4b] via-[#2d2252] to-[#4338ca]';

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${bgColor} relative overflow-hidden transition-colors duration-700 font-sans p-4`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-xl z-10 py-6 animate-fade-in">
        
        {/* الترويسة + المرشد الصوتي */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between max-w-md mx-auto mb-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-300 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Voice & PIN AI
            </span>

            <button
              type="button"
              onClick={toggleAudioGuide}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
                isSpeakingGuide
                  ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse shadow-lg'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              {isSpeakingGuide ? t.audioGuideStop : t.audioGuideBtn}
            </button>
          </div>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-4 ring-4 ring-white/5">
            {isWholesaler ? <Factory className="text-white w-10 h-10" /> : <Store className="text-white w-10 h-10" />}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1.5 tracking-tight">{t.tabRegister}</h1>
          <p className="text-gray-300 font-bold text-xs md:text-sm">{t.portalSubtitle}</p>
        </div>

        <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-5">
            
            {/* 1. التبديل البصري بين تاجر التجزئة (Retail) ومورد الجملة (Wholesale) */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setSupplierType('retail')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-black rounded-lg transition-all cursor-pointer ${
                  !isWholesaler
                    ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Store size={16} /> {t.retailBtn}
              </button>
              <button
                type="button"
                onClick={() => setSupplierType('wholesale')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-black rounded-lg transition-all cursor-pointer ${
                  isWholesaler
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Factory size={16} /> {t.wholesaleBtn}
              </button>
            </div>

            {alert.show && (
              <div
                className={`p-4 rounded-xl font-bold flex items-start gap-3 border text-sm ${
                  alert.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {alert.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <span>{alert.text}</span>
              </div>
            )}

            {/* 2. صندوق التسجيل الصوتي الذكي ومسح الكارط فيزيت */}
            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 shadow-sm">
              <h3 className="font-black text-indigo-950 text-sm mb-1">{t.voiceBoxTitle}</h3>
              <p className="text-xs font-bold text-indigo-900/80 leading-relaxed mb-3">{t.voiceBoxDesc}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleVoiceInput('smartAll')}
                  className={`py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    listeningField === 'smartAll'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                  }`}
                >
                  {listeningField === 'smartAll' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{listeningField === 'smartAll' ? t.voiceStopBtn : t.voiceStartBtn}</span>
                </button>

                <input
                  ref={cardInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCardScan}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isScanningCard}
                  onClick={() => cardInputRef.current?.click()}
                  className="py-3 px-4 rounded-xl font-black text-xs bg-white hover:bg-slate-50 text-slate-800 border border-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {isScanningCard ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  ) : (
                    <Camera className="w-4 h-4 text-indigo-600" />
                  )}
                  <span>{isScanningCard ? t.scanningMsg : t.scanCardBtn}</span>
                </button>
              </div>

              {spokenPreview && (
                <div className="mt-3 p-2.5 bg-white rounded-xl border border-indigo-200 text-xs font-bold text-slate-700">
                  🗣️ &ldquo;{spokenPreview}&rdquo;
                </div>
              )}
            </div>

            {/* 3. اختيار تخصص السلع بالصور والأيقونات الكبيرة */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2">{t.categoryLabel}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STORE_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        active
                          ? isWholesaler
                            ? 'border-slate-800 bg-slate-100 text-slate-950 shadow-sm scale-[1.02]'
                            : 'border-blue-600 bg-blue-50 text-blue-950 shadow-sm scale-[1.02]'
                          : 'border-gray-200 bg-gray-50/70 hover:bg-white text-gray-700'
                      }`}
                    >
                      <span className="text-2xl mb-1">{cat.icon}</span>
                      <span className="text-[11px] font-black leading-tight">
                        {language === 'ar' ? cat.ar : language === 'fr' ? cat.fr : cat.en}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. استمارة البيانات (تُملأ صوتياً أو بالكتابة) */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.companyLabel}</label>
                <div className="relative flex items-center">
                  <Building2 className={`w-5 h-5 absolute text-gray-400 pointer-events-none ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="text"
                    name="company"
                    required
                    placeholder={t.companyPlaceholder}
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-bold text-sm ${
                      isRtl ? 'pr-11 pl-10' : 'pl-11 pr-10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('company')}
                    className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-1.5 rounded-lg cursor-pointer ${
                      listeningField === 'company' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.phoneLabel}</label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder={t.phonePlaceholder}
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full py-3 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-bold text-sm"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVoiceInput('phone')}
                      className={`absolute right-2 p-1.5 rounded-lg cursor-pointer ${
                        listeningField === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.cityLabel}</label>
                  <div className="relative flex items-center">
                    <MapPin className={`w-4 h-4 absolute text-gray-400 pointer-events-none ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <input
                      type="text"
                      name="city"
                      placeholder={t.cityPlaceholder}
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-bold text-sm ${
                        isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleVoiceInput('city')}
                      className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-1.5 rounded-lg cursor-pointer ${
                        listeningField === 'city' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* معاينة بطاقة المتجر المصاغة بالذكاء الاصطناعي */}
              {formData.storeBio && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <label className="block text-[11px] font-black text-emerald-900 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {t.storeBioLabel}
                  </label>
                  <textarea
                    rows="2"
                    value={formData.storeBio}
                    onChange={(e) => setFormData({ ...formData, storeBio: e.target.value })}
                    className="w-full bg-white p-2 rounded-lg border border-emerald-100 text-xs font-medium text-slate-700 focus:outline-none"
                  />
                </div>
              )}

              {/* الرمز السري PIN (4 أرقام) أو كلمة المرور */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.passwordOrPinLabel}</label>
                <div className="relative flex items-center">
                  <KeyRound className="w-5 h-5 absolute left-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    required
                    minLength="4"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t.pinPlaceholder}
                    className="w-full py-3 pl-11 pr-20 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-black text-sm tracking-widest"
                    dir="ltr"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVoiceInput('password')}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        listeningField === 'password' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-gray-500 mt-1">{t.pinSecurityHint}</p>
              </div>

              {/* البريد الإلكتروني (اختياري) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">{t.emailOptionalLabel}</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full py-2.5 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-medium text-xs"
                    dir="ltr"
                    placeholder="name@company.com (اختياري)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-2 py-4 px-4 rounded-xl text-sm font-black text-white transition-all flex justify-center items-center gap-2 cursor-pointer ${
                  isWholesaler
                    ? 'bg-gradient-to-r from-slate-800 to-black hover:from-black hover:to-slate-900 shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.registerBtn}
              </button>
            </form>

            {/* 🔗 توجيه لبوابة الدخول الموحدة في React */}
            <div className="mt-5 text-center text-sm font-bold text-gray-600">
              <p>
                {t.haveAccount}{' '}
                <Link
                  to="/v2/auth"
                  className={`transition-colors hover:underline ${isWholesaler ? 'text-slate-800' : 'text-blue-600'}`}
                >
                  {t.loginLink}
                </Link>
              </p>
            </div>

          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400">Tous droits réservés © SasBTP 2026</p>
          </div>
        </div>

      </div>
    </div>
  );
}