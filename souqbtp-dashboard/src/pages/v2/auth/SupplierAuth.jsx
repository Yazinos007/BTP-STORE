import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { 
  Store, Factory, Mail, Phone, Building2, Loader2, 
  CheckCircle2, AlertCircle, Mic, MicOff, Volume2, Camera, 
  MapPin, KeyRound, Eye, EyeOff, Sparkles, ShieldCheck, Globe 
} from 'lucide-react';
import { bindReferralOnSignup } from '../../../lib/referralHandler';

// 🏙️ خريطة المدن المغربية للالتقاط بالدارجة والترجمة التلقائية
const MOROCCAN_CITIES_DATA = [
  { id: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca', en: 'Casablanca', keywords: ['الدار البيضاء', 'كازا', 'دار البيضاء', 'casablanca', 'casa'] },
  { id: 'rabat', ar: 'الرباط', fr: 'Rabat', en: 'Rabat', keywords: ['الرباط', 'رباط', 'rabat'] },
  { id: 'marrakech', ar: 'مراكش', fr: 'Marrakech', en: 'Marrakech', keywords: ['مراكش', 'marrakech', 'marrakesh'] },
  { id: 'tanger', ar: 'طنجة', fr: 'Tanger', en: 'Tangier', keywords: ['طنجة', 'طنجه', 'tanger', 'tangier'] },
  { id: 'fes', ar: 'فاس', fr: 'Fès', en: 'Fes', keywords: ['فاس', 'fes', 'fès'] },
  { id: 'agadir', ar: 'أكادير', fr: 'Agadir', en: 'Agadir', keywords: ['أكادير', 'اكادير', 'agadir'] },
  { id: 'meknes', ar: 'مكناس', fr: 'Meknès', en: 'Meknes', keywords: ['مكناس', 'meknes', 'meknès'] },
  { id: 'oujda', ar: 'وجدة', fr: 'Oujda', en: 'Oujda', keywords: ['وجدة', 'وجده', 'oujda'] },
  { id: 'beni_mellal', ar: 'بني ملال', fr: 'Béni Mellal', en: 'Beni Mellal', keywords: ['بني ملال', 'بنيملال', 'beni mellal', 'béni mellal'] },
  { id: 'kasbah_tadla', ar: 'قصبة تادلة', fr: 'Kasbah Tadla', en: 'Kasbah Tadla', keywords: ['قصبة تادلة', 'تادلة', 'تادلا', 'kasbah tadla', 'tadla'] },
  { id: 'khenifra', ar: 'خنيفرة', fr: 'Khénifra', en: 'Khenifra', keywords: ['خنيفرة', 'خنيفره', 'khenifra', 'khénifra'] },
  { id: 'khouribga', ar: 'خريبكة', fr: 'Khouribga', en: 'Khouribga', keywords: ['خريبكة', 'خريبكه', 'khouribga'] },
  { id: 'kenitra', ar: 'القنيطرة', fr: 'Kénitra', en: 'Kenitra', keywords: ['القنيطرة', 'قنيطرة', 'kenitra', 'kénitra'] },
  { id: 'tetouan', ar: 'تطوان', fr: 'Tétouan', en: 'Tetouan', keywords: ['تطوان', 'tetouan', 'tétouan'] },
  { id: 'el_jadida', ar: 'الجديدة', fr: 'El Jadida', en: 'El Jadida', keywords: ['الجديدة', 'جديدة', 'el jadida', 'jadida'] },
  { id: 'safi', ar: 'آسفي', fr: 'Safi', en: 'Safi', keywords: ['آسفي', 'اسفي', 'safi'] },
  { id: 'nador', ar: 'الناظور', fr: 'Nador', en: 'Nador', keywords: ['الناظور', 'ناظور', 'nador'] },
  { id: 'mohammedia', ar: 'المحمدية', fr: 'Mohammedia', en: 'Mohammedia', keywords: ['المحمدية', 'محمدية', 'mohammedia'] },
  { id: 'ouarzazate', ar: 'ورزازات', fr: 'Ouarzazate', en: 'Ouarzazate', keywords: ['ورزازات', 'ouarzazate'] },
  { id: 'laayoune', ar: 'العيون', fr: 'Laâyoune', en: 'Laayoune', keywords: ['العيون', 'laayoune', 'laâyoune'] }
];

// 📦 تصنيفات المتاجر والموردين بالصور + خيار "قطاع آخر / سلعة أخرى"
const STORE_CATEGORIES = [
  { id: 'gros_materiaux', icon: '🧱', ar: 'إسمنت، حديد وياجور', fr: 'Ciment, Fer & Briques', en: 'Cement, Iron & Bricks', keywords: ['إسمنت', 'اسمنت', 'سيما', 'حديد', 'ياجور', 'رمل', 'بريك', 'خرسانة', 'بيطون', 'ciment', 'fer', 'brique', 'béton'] },
  { id: 'quincaillerie', icon: '🛠️', ar: 'دروكري وعقاقير عامة', fr: 'Droguerie & Outillage', en: 'Hardware & Tools', keywords: ['دروكري', 'عقاقير', 'معدات', 'دوزان', 'براغي', 'droguerie', 'quincaillerie', 'outillage'] },
  { id: 'sanitaire', icon: '🚰', ar: 'سباكة وتجهيز حمامات', fr: 'Plomberie & Sanitaire', en: 'Plumbing & Sanitary', keywords: ['سباكة', 'بلومبي', 'قوادس', 'سانيتير', 'حمامات', 'روبيني', 'plomberie', 'sanitaire'] },
  { id: 'elec_eclairage', icon: '⚡', ar: 'كهرباء وإنارة وكابلات', fr: 'Électricité & Éclairage', en: 'Electrical & Lighting', keywords: ['كهرباء', 'ضو', 'ضوء', 'كابلات', 'إنارة', 'انارة', 'بولات', 'électricité', 'éclairage'] },
  { id: 'peinture_deco', icon: '🎨', ar: 'صباغة، عزل وديكور', fr: 'Peinture & Étanchéité', en: 'Paint & Waterproofing', keywords: ['صباغة', 'صباغه', 'دهان', 'عزل', 'زفت', 'peinture', 'étanchéité'] },
  { id: 'carrelage_bois', icon: '⬜', ar: 'زليج، رخام وخشب', fr: 'Carrelage, Marbre & Bois', en: 'Tiles, Marble & Wood', keywords: ['زليج', 'رخام', 'سيراميك', 'خشب', 'ألمنيوم', 'فايونص', 'carrelage', 'marbre', 'bois'] },
  { id: 'engins_loc', icon: '🚜', ar: 'كراء معدات وآليات البناء', fr: 'Location Engins & Matériel', en: 'Equipment & Machinery Rental', keywords: ['كراء', 'آليات', 'تراكس', 'سقالة', 'معدات', 'location', 'engins'] },
  { id: 'other', icon: '➕', ar: 'قطاع آخر (حدده)', fr: 'Autre Secteur (Préciser)', en: 'Other Sector (Specify)', keywords: [] }
];

const translations = {
  ar: {
    portalSubtitle: "بوابة التجار وموردي مواد البناء (تسجيل صوتي بالدارجة المغربية أو العربية)",
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
    categoryLabel: "اختر تخصص متجرك بالصورة (أو اضغط + لقطاع آخر):",
    customCategoryPlace: "اكتب أو انطق تخصص متجرك أو شركتك هنا...",
    storeBioLabel: "✨ بطاقة تعريف المتجر (تُصاغ وتُترجم تلقائياً بالذكاء الاصطناعي):",
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
    audioGuideBtn: "🔊 استمع للشرح الصوتي",
    audioGuideStop: "⏹️ إيقاف الصوت",
    voiceBoxTitle: "🎙️ افتح متجرك بالصوت (يفهم الدارجة المغربية والعربية)",
    voiceBoxDesc: "اضغط الميكروفون وتكلم بالدارجة: قل اسم المحل أو الشركة، المدينة، نوع السلعة، ورقم الهاتف!",
    voiceStartBtn: "اضغط وتكلم بالدارجة أو العربية",
    voiceStopBtn: "جاري الاستماع... تكلم الآن",
    scanCardBtn: "📷 تصوير الكارط فيزيت",
    scanningMsg: "جاري القراءة...",
    pinSecurityHint: "🛡️ احفظ هذا الرمز السري (4 أرقام مثل 2580) لتدخل به دائماً مع رقم هاتفك."
  },
  fr: {
    portalSubtitle: "Portail Détaillants & Grossistes BTP (Inscription Vocale Darija & FR)",
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
    categoryLabel: "Spécialité de votre magasin (ou + pour un autre secteur) :",
    customCategoryPlace: "Écrivez ou dictez votre secteur d'activité...",
    storeBioLabel: "✨ Présentation du magasin (Rédigée et traduite par l'IA) :",
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
    voiceBoxTitle: "🎙️ Créez votre boutique par la voix (Comprend Darija & Français)",
    voiceBoxDesc: "Appuyez sur le micro et dites le nom du magasin, la ville, vos produits et votre téléphone !",
    voiceStartBtn: "Appuyez et parlez (Darija / FR)",
    voiceStopBtn: "Écoute en direct...",
    scanCardBtn: "📷 Scanner Carte de Visite",
    scanningMsg: "Lecture...",
    pinSecurityHint: "🛡️ Gardez ce code PIN (4 chiffres ex: 2580) pour vous connecter avec votre téléphone."
  },
  en: {
    portalSubtitle: "Retailers & Wholesalers Smart Portal (Darija, AR & EN Voice Onboarding)",
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
    categoryLabel: "Select your store specialty (or tap + for another sector):",
    customCategoryPlace: "Type or speak your specific business sector...",
    storeBioLabel: "✨ AI-Generated Store Description (Auto-Translated):",
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
    voiceBoxTitle: "🎙️ Voice Store Registration (Understands Darija, AR & EN)",
    voiceBoxDesc: "Tap the mic and say your store name, city, products, and phone number!",
    voiceStartBtn: "Tap & Speak Now",
    voiceStopBtn: "Listening live...",
    scanCardBtn: "📷 Scan Business Card",
    scanningMsg: "Scanning...",
    pinSecurityHint: "🛡️ Keep this 4-digit PIN (e.g., 2580) to log in anytime with your phone."
  }
};

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

const resolveSupplierEmail = (emailInput, phoneInput) => {
  const rawEmail = (emailInput || '').trim();
  if (rawEmail.includes('@')) return rawEmail.toLowerCase();

  const rawSource = rawEmail || (phoneInput || '').trim();
  let digits = convertSpokenWordsToDigits(rawSource).replace(/\D/g, '');
  if (digits.startsWith('212') && digits.length >= 11) digits = '0' + digits.slice(3);
  if (digits.startsWith('00212') && digits.length >= 13) digits = '0' + digits.slice(5);
  return digits ? `${digits}@sasbtp.ma` : '';
};

const wrapSecretPin = (secret) => {
  const clean = (secret || '').trim();
  if (clean.length > 0 && clean.length < 6) return `SAS#PIN#${clean}#BTP`;
  return clean;
};

const matchCityInLang = (rawInput, lang) => {
  if (!rawInput) return null;
  const lower = rawInput.toLowerCase().trim();
  for (const c of MOROCCAN_CITIES_DATA) {
    if (
      c.keywords.some((k) => lower.includes(k)) ||
      lower.includes(c.ar.toLowerCase()) ||
      lower.includes(c.fr.toLowerCase())
    ) {
      return lang === 'ar' ? c.ar : lang === 'fr' ? c.fr : c.en;
    }
  }
  return null;
};

export default function SupplierAuth() {
  const { language, setLanguage } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [supplierType, setSupplierType] = useState('retail');
  const [selectedCategory, setSelectedCategory] = useState('quincaillerie');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [listeningField, setListeningField] = useState(null);
  const [spokenPreview, setSpokenPreview] = useState('');
  const [isScanningCard, setIsScanningCard] = useState(false);

  const recognitionRef = useRef(null);
  const cloudAudioRef = useRef(null);
  const cardInputRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: '',
    phone: '',
    city: '',
    storeBio: ''
  });

  // 🇲🇦 جعل العربية هي اللغة الافتراضية في أول مصافحة للتاجر والمورد
  useEffect(() => {
    const hasPickedLang = sessionStorage.getItem('sasbtp_auth_lang_picked');
    if (!hasPickedLang && language !== 'ar') {
      setLanguage('ar');
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (cloudAudioRef.current) {
        cloudAudioRef.current.pause();
        cloudAudioRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildLocalizedStoreBio = (targetLang, supType, catId, customCat, companyVal, cityVal) => {
    const catObj = STORE_CATEGORIES.find((c) => c.id === catId) || STORE_CATEGORIES[1];
    const catName =
      catId === 'other' && customCat
        ? customCat
        : targetLang === 'ar'
        ? catObj.ar
        : targetLang === 'fr'
        ? catObj.fr
        : catObj.en;

    const localizedCity = matchCityInLang(cityVal, targetLang) || cityVal;

    if (targetLang === 'ar') {
      const typeAr = supType === 'wholesale' ? 'مورد جملة وشركة معتمدة' : 'متجر وموزع معتمد';
      return `${companyVal || typeAr} في منصة SasBTP، متخصص في توفير (${catName})${localizedCity ? ` بمدينة ${localizedCity} والنواحي` : ''}. نوفر سلعاً عالية الجودة، أسعاراً تنافسية للمقاولين والحرفيين، وخدمة سريعة.`;
    }
    if (targetLang === 'fr') {
      const typeFr = supType === 'wholesale' ? 'Fournisseur Grossiste B2B' : 'Magasin & Détaillant BTP';
      return `${companyVal || typeFr} vérifié sur SasBTP, spécialisé en (${catName})${localizedCity ? ` à ${localizedCity}` : ''}. Produits certifiés, tarifs compétitifs et disponibilité immédiate.`;
    }
    const typeEn = supType === 'wholesale' ? 'Verified B2B Wholesaler' : 'Verified BTP Retailer';
    return `${companyVal || typeEn} on SasBTP, specializing in (${catName})${localizedCity ? ` in ${localizedCity}` : ''}. Certified materials, competitive pricing, and fast delivery.`;
  };

  // 🔄 ترجمة تلقائية للمدينة ووصف المتجر عند تبديل اللغة في الشريط العلوي
  const handleSelectLanguage = (newLang) => {
    sessionStorage.setItem('sasbtp_auth_lang_picked', 'true');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
      cloudAudioRef.current = null;
    }
    setIsSpeakingGuide(false);
    setLanguage(newLang);

    setFormData((prev) => {
      const newCity = matchCityInLang(prev.city, newLang) || prev.city;
      const newBio = prev.storeBio
        ? buildLocalizedStoreBio(newLang, supplierType, selectedCategory, customCategoryText, prev.company, newCity)
        : '';
      return {
        ...prev,
        city: newCity,
        storeBio: newBio
      };
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 6500);
  };

  // ==========================================
  // 🔊 1. المرشد الصوتي الطبيعي السليم في اللغات الثلاث
  // ==========================================
  const toggleAudioGuide = () => {
    if (isSpeakingGuide) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (cloudAudioRef.current) {
        cloudAudioRef.current.pause();
        cloudAudioRef.current = null;
      }
      setIsSpeakingGuide(false);
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
      cloudAudioRef.current = null;
    }

    const guideText =
      language === 'ar'
        ? 'مرحباً بك في بوابة التجار والموردين بمنصة ساس بي تي بي. لإنشاء حساب متجرك أو شركتك بدون كتابة، اضغط على الزر البرتقالي، وتكلم بالدارجة المغربية أو العربية: قل اسم المحل أو الشركة، المدينة، نوع السلعة، ورقم هاتفك.'
        : language === 'fr'
        ? 'Bienvenue sur le portail Fournisseurs et Détaillants SasBTP. Appuyez sur le bouton orange et dites le nom de votre boutique ou société, votre ville et votre numéro de téléphone.'
        : 'Welcome to the SasBTP Suppliers Portal. Tap the orange microphone and speak your store or company name, city, and phone number.';

    const voices = ('speechSynthesis' in window) ? window.speechSynthesis.getVoices() : [];
    const blockedRobotic = ['fred', 'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'good news', 'hysterical', 'pipe organ', 'trinoids', 'whisper', 'zarvox'];

    let chosenVoice = null;
    if (language === 'ar') {
      chosenVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ar') && !blockedRobotic.some((b) => v.name.toLowerCase().includes(b)));
    } else if (language === 'fr') {
      chosenVoice = voices.find((v) => v.lang.toLowerCase().startsWith('fr') && !blockedRobotic.some((b) => v.name.toLowerCase().includes(b)));
    } else {
      chosenVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google US') || v.name.includes('Daniel') || v.name.includes('Karen') || v.name.includes('Alex'))) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en') && !blockedRobotic.some((b) => v.name.toLowerCase().includes(b)));
    }

    if (!chosenVoice && language === 'ar') {
      try {
        const encoded = encodeURIComponent(guideText);
        const audio = new Audio(`https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encoded}`);
        cloudAudioRef.current = audio;
        setIsSpeakingGuide(true);
        audio.onended = () => setIsSpeakingGuide(false);
        audio.onerror = () => setIsSpeakingGuide(false);
        audio.play().catch(() => setIsSpeakingGuide(false));
        return;
      } catch (e) {}
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(guideText);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
      }
      utterance.rate = 0.94;
      utterance.onend = () => setIsSpeakingGuide(false);
      utterance.onerror = () => setIsSpeakingGuide(false);

      setIsSpeakingGuide(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // ==========================================
  // 🧠 2. فهم الدارجة المغربية للتاجر/المورد وصياغة بطاقة المتجر
  // ==========================================
  const parseSupplierSpeech = (rawSpeech) => {
    const normalized = convertSpokenWordsToDigits(rawSpeech);
    const lower = normalized.toLowerCase();

    let detectedType = supplierType;
    if (/(جملة|شركة|شركه|مصنع|معمل|ديبو|توريد|grossiste|usine|société|societe|b2b)/i.test(lower)) {
      detectedType = 'wholesale';
      setSupplierType('wholesale');
    } else if (/(دروكري|محل|متجر|تقسيط|تجزئة|عقاقير|حانوت|droguerie|boutique|magasin|détaillant)/i.test(lower)) {
      detectedType = 'retail';
      setSupplierType('retail');
    }

    const compactDigits = normalized.replace(/[\s\-./]/g, '');
    const phoneMatch = compactDigits.match(/(?:00212|\+212|212|0)([567]\d{8})/);
    const detectedPhone = phoneMatch ? `0${phoneMatch[1]}` : '';

    const detectedCity = matchCityInLang(normalized, language) || '';

    let matchedCatId = selectedCategory;
    for (const cat of STORE_CATEGORIES) {
      if (cat.id === 'other') continue;
      if (cat.keywords.some((k) => lower.includes(k))) {
        matchedCatId = cat.id;
        setSelectedCategory(cat.id);
        break;
      }
    }

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
          .replace(/\b(في|من|ف|بمدينة|مدينة|لبيع|متخصص|رقم|هاتف|تليفون|de|à|sur)\b.*/i, '')
          .trim();
        break;
      }
    }

    const finalCompany = detectedCompany || formData.company;
    const finalCity = detectedCity || formData.city;
    const composedStoreBio = buildLocalizedStoreBio(language, detectedType, matchedCatId, customCategoryText, finalCompany, finalCity);

    setFormData((prev) => ({
      ...prev,
      company: finalCompany,
      phone: detectedPhone || prev.phone,
      city: finalCity,
      storeBio: composedStoreBio
    }));
  };

  // ==========================================
  // 🎙️ 3. الميكروفون الفوري الموثوق (يدعم الدارجة المغربية ويكتب لحظياً)
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
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }

    setTimeout(() => {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-MA';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setListeningField(target);

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          const clean = transcript.trim();
          if (!clean) return;

          setSpokenPreview(clean);

          if (target === 'smartAll') {
            parseSupplierSpeech(clean);
          } else if (target === 'customCategory') {
            setCustomCategoryText(clean);
            setFormData((prev) => ({
              ...prev,
              storeBio: buildLocalizedStoreBio(language, supplierType, 'other', clean, prev.company, prev.city)
            }));
          } else if (target === 'phone') {
            const digits = convertSpokenWordsToDigits(clean).replace(/\D/g, '');
            setFormData((prev) => ({ ...prev, phone: digits || clean }));
          } else if (target === 'password') {
            const digits = convertSpokenWordsToDigits(clean).replace(/\s+/g, '');
            setFormData((prev) => ({ ...prev, password: digits }));
          } else if (target === 'company') {
            setFormData((prev) => ({
              ...prev,
              company: clean,
              storeBio: buildLocalizedStoreBio(language, supplierType, selectedCategory, customCategoryText, clean, prev.city)
            }));
          } else if (target === 'city') {
            const matched = matchCityInLang(clean, language) || clean;
            setFormData((prev) => ({
              ...prev,
              city: matched,
              storeBio: buildLocalizedStoreBio(language, supplierType, selectedCategory, customCategoryText, prev.company, matched)
            }));
          }
        };

        recognition.onerror = () => setListeningField(null);
        recognition.onend = () => setListeningField(null);

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        setListeningField(null);
      }
    }, 120);
  };

  // ==========================================
  // 📷 4. مسح الكارط فيزيت بالكاميرا
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
        const autoBio = buildLocalizedStoreBio(language, supplierType, selectedCategory, customCategoryText, formData.company, formData.city);
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
      const catLabel =
        selectedCategory === 'other' && customCategoryText.trim()
          ? customCategoryText.trim()
          : language === 'ar'
          ? catObj.ar
          : catObj.fr;

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

      if (authData?.user?.id) {
        await bindReferralOnSignup(authData.user.id);
      }

      showAlert('success', t.successRegister);

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
        
        {/* 🌐 شريط اختيار اللغة البارز في أعلى واجهة التاجر والمورد */}
        <div className="bg-slate-950/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/15 flex items-center justify-between mb-5 shadow-lg">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-200">
            <Globe className="w-4 h-4 text-amber-400" />
            {language === 'ar' ? 'اختر اللغة:' : language === 'fr' ? 'Langue :' : 'Language:'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectLanguage('ar')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                language === 'ar' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🇲🇦 العربية
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage('fr')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                language === 'fr' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                language === 'en' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>

        {/* الترويسة + المرشد الصوتي */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between max-w-md mx-auto mb-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-300 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Darija & Voice AI
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

            {/* 2. صندوق التسجيل الصوتي الذكي بالدارجة ومسح الكارط فيزيت */}
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

            {/* 3. اختيار تخصص السلع بالصور + خيار قطاع آخر */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2">{t.categoryLabel}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STORE_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        if (cat.id !== 'other') {
                          setFormData((prev) => ({
                            ...prev,
                            storeBio: buildLocalizedStoreBio(language, supplierType, cat.id, customCategoryText, prev.company, prev.city)
                          }));
                        }
                      }}
                      className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        active
                          ? isWholesaler
                            ? 'border-slate-800 bg-slate-100 text-slate-950 shadow-sm scale-[1.02]'
                            : 'border-blue-600 bg-blue-50 text-blue-950 shadow-sm scale-[1.02]'
                          : cat.id === 'other'
                          ? 'border-dashed border-indigo-400 bg-indigo-50/60 text-indigo-900'
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

              {selectedCategory === 'other' && (
                <div className="mt-2.5 relative flex items-center animate-fade-in">
                  <input
                    type="text"
                    value={customCategoryText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomCategoryText(val);
                      setFormData((prev) => ({
                        ...prev,
                        storeBio: buildLocalizedStoreBio(language, supplierType, 'other', val, prev.company, prev.city)
                      }));
                    }}
                    placeholder={t.customCategoryPlace}
                    className="w-full p-3 bg-indigo-50/50 border-2 border-indigo-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('customCategory')}
                    className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-1.5 rounded-lg cursor-pointer ${
                      listeningField === 'customCategory' ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 4. استمارة البيانات */}
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
                      listeningField === 'company' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
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
                        listeningField === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
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
                        listeningField === 'city' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

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
                        listeningField === 'password' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-gray-500 mt-1">{t.pinSecurityHint}</p>
              </div>

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
                    placeholder="name@company.com"
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