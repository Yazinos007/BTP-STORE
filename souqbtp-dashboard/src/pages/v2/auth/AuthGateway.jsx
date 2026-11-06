import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { bindReferralOnSignup } from '../../../lib/referralHandler';
import useSettingsStore from '../../../store/useSettingsStore';
import { 
  Mail, Lock, User, Phone, Loader2, CheckCircle2, AlertCircle, 
  Mic, MicOff, Volume2, Camera, Sparkles, ShieldCheck, KeyRound, 
  MapPin, ArrowRight, Eye, EyeOff
} from 'lucide-react';

// 🏙️ قائمة المدن المغربية للالتقاط الصوتي الذكي
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

// 🛠️ التخصصات البصرية للحرفيين بالصور والأيقونات الكبيرة
const ARTISAN_SPECIALTIES = [
  { id: 'macon', icon: '🧱', ar: 'بناي / أعمال البناء', fr: 'Maçon / Gros Œuvres', en: 'Mason / Construction', keywords: ['بناي', 'بناء', 'ضالة', 'ياجور', 'maçon', 'macon', 'construction'] },
  { id: 'plombier', icon: '🚰', ar: 'بلومبي / رصاص وسباكة', fr: 'Plombier / Sanitaire', en: 'Plumber / Sanitary', keywords: ['بلومبي', 'سباك', 'رصاص', 'ماء', 'قوادس', 'plombier', 'plomberie'] },
  { id: 'electricien', icon: '⚡', ar: 'تريسيان / كهرباء البناء', fr: 'Électricien Bâtiment', en: 'Electrician', keywords: ['تريسيان', 'كهربائي', 'كهرباء', 'ضو', 'ضوء', 'électricien', 'electricien'] },
  { id: 'peintre', icon: '🎨', ar: 'صباغ / ديكور وواجهات', fr: 'Peintre & Décoration', en: 'Painter & Decor', keywords: ['صباغ', 'صباغة', 'صباغه', 'خياط', 'peintre', 'peinture'] },
  { id: 'carreleur', icon: '⬜', ar: 'زلايجي / رخام وسيراميك', fr: 'Carreleur & Marbre', en: 'Tiler & Marble', keywords: ['زلايجي', 'زليج', 'رخام', 'سيراميك', 'carreleur', 'carrelage', 'zellige'] },
  { id: 'platrier', icon: '🏛️', ar: 'جباس / أسقف وديكور جبس', fr: 'Plâtrier & Faux Plafond', en: 'Plaster & Ceiling', keywords: ['جباس', 'جبس', 'قبص', 'بلافو', 'plâtrier', 'platrier', 'plâtre'] },
  { id: 'menuisier', icon: '🪵', ar: 'نجار خشب وألمنيوم', fr: 'Menuisier Bois & Alu', en: 'Wood & Alu Carpenter', keywords: ['نجار', 'خشب', 'ألمنيوم', 'المنيوم', 'menuisier', 'aluminium'] },
  { id: 'ferronnier', icon: '🔩', ar: 'حداد / تلحيم وشباك', fr: 'Ferronnier & Soudure', en: 'Blacksmith & Welder', keywords: ['حداد', 'سودور', 'حديد', 'ferronnier', 'soudure'] }
];

// 🏪 أنواع حسابات الموردين والتجار
const SUPPLIER_TYPES = [
  { id: 'retail', icon: '🏪', ar: 'تاجر مواد بناء (دروكري / تجزئة)', fr: 'Détaillant / Droguerie (POS)', en: 'Retailer / Hardware Store' },
  { id: 'wholesale', icon: '🏭', ar: 'مورد جملة ومصنع (Grossiste B2B)', fr: 'Grossiste & Usine B2B', en: 'Wholesaler & Factory B2B' }
];

const translations = {
  ar: {
    roleClientTitle: "مقاول / صاحب مشروع (شركة, مقاولة)",
    roleProviderTitle: "معلم / حرفي",
    roleArchitectTitle: "مهندس معماري",
    roleSupplierTitle: "مورد مواد بناء",
    msgProvider: "يمكنك الآن إنشاء حسابك فوراً بالصوت أو الكتابة في ثوانٍ، أو الانتقال لصفحة المعلمين التفصيلية.",
    btnProvider: "👷‍♂️ أو الانتقال لصفحة تسجيل المعلمين الكاملة",
    msgArchitect: "بصفتك مهندساً، يتطلب حسابك إدخال 'رقم الهيئة' و'مكتب الدراسات' لتفعيل ميزات الرقابة الهندسية.",
    btnArchitect: "📐 الانتقال لصفحة تسجيل المهندسين",
    msgSupplier: "يمكنك تسجيل متجرك أو شركتك فوراً بالصوت أو الكتابة، أو الانتقال لصفحة الموردين المتقدمة.",
    btnSupplier: "🧱 أو الانتقال لصفحة تسجيل الموردين الكاملة",
    portalSubtitle: "سجل دخولك أو أنشئ حسابك بالكتابة أو التحدث الصوتي الذكي",
    tabRegister: "إنشاء حساب",
    tabLogin: "تسجيل الدخول",
    emailOrPhoneLabel: "رقم الهاتف أو البريد الإلكتروني",
    emailOrPhonePlaceholder: "0612345678 أو example@email.com",
    emailLabel: "البريد الإلكتروني (اختياري مع الهاتف)",
    passwordOrPinLabel: "الرمز السري (4 أرقام PIN) أو كلمة المرور",
    loginBtn: "دخول آمن",
    forgotPassword: "نسيت الرمز السري أو كلمة المرور؟",
    iAmHereAs: "أنا هنا بصفتي:",
    fullNameLabel: "الاسم الكامل أو اسم المحل",
    phoneLabel: "رقم الهاتف (أساسي للدخول والتواصل)",
    phonePlaceholder: "مثال: 0612345678",
    cityLabel: "المدينة",
    cityPlaceholder: "مثال: قصبة تادلة، الدار البيضاء...",
    specialtyLabel: "اختر حرفتك / تخصصك بالصورة:",
    supplierTypeLabel: "اختر نوع نشاطك التجاري:",
    registerBtn: "إنشاء حسابي ودخول المنصة الآن",
    errInvalidLogin: "رقم الهاتف/البريد أو الرمز السري غير صحيح.",
    successLogin: "✅ تم تسجيل الدخول بنجاح! جاري التوجيه...",
    errEmailExists: "هذا الرقم أو البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.",
    successRegister: "✅ تم إنشاء حسابك بنجاح وتجهيز ملفك المهني! جاري الدخول...",
    errUnexpected: "حدث خطأ أثناء التسجيل.",
    // مزايا الصوت والذكاء الاصطناعي
    audioGuideBtn: "🔊 استمع للشرح الصوتي",
    audioGuideStop: "⏹️ إيقاف الصوت",
    voiceSmartTitle: "🎙️ التسجيل الصوتي الذكي (بدون كتابة)",
    voiceSmartDesc: "اضغط الميكروفون وتحدث بعفوية: قل اسمك، مدينتك، حرفتك، ورقم هاتفك",
    voiceStartBtn: "اضغط وتحدث الآن",
    voiceListeningBtn: "جاري الاستماع... تحدث الآن (اضغط للإيقاف)",
    scanCardBtn: "📷 مسح كارط فيزيت / بطاقة مهنية",
    scanningCardMsg: "جاري قراءة البطاقة بالذكاء الاصطناعي...",
    aiBioPreviewLabel: "✨ النبذة المهنية التي صاغها الذكاء الاصطناعي لملفك:",
    voiceLoginHint: "💡 يمكنك كتابة رقم هاتفك أو نطقه عبر زر الميكروفون",
    rateLimitLocked: "🔒 تم قفل المحاولات مؤقتاً لحماية حسابك بعد عدة محاولات خاطئة. يرجى الانتظار 15 دقيقة.",
    pinSecurityHint: "🛡️ احفظ رمزاً سرياً بسيطاً (من 4 أرقام مثل 2580 أو كلمة مرور) لحماية حسابك من أي متطفل."
  },
  fr: {
    roleClientTitle: "Entrepreneur / Maître d'ouvrage",
    roleProviderTitle: "Artisan / Maître",
    roleArchitectTitle: "Architecte",
    roleSupplierTitle: "Fournisseur Matériaux",
    msgProvider: "Créez votre compte immédiatement par la voix ou par écrit, ou utilisez le formulaire détaillé.",
    btnProvider: "👷‍♂️ Ou aller à l'inscription Artisan complète",
    msgArchitect: "En tant qu'architecte, votre numéro d'ordre est requis pour activer les fonctionnalités.",
    btnArchitect: "📐 Aller à l'inscription Architecte",
    msgSupplier: "Inscrivez votre magasin immédiatement par la voix ou par écrit.",
    btnSupplier: "🧱 Ou aller à l'inscription Fournisseur complète",
    portalSubtitle: "Connectez-vous ou inscrivez-vous par écrit ou par commande vocale IA",
    tabRegister: "Créer un compte",
    tabLogin: "Se connecter",
    emailOrPhoneLabel: "Numéro de Téléphone ou Email",
    emailOrPhonePlaceholder: "0612345678 ou example@email.com",
    emailLabel: "Email (Optionnel si téléphone fourni)",
    passwordOrPinLabel: "Code PIN (4 chiffres) ou Mot de passe",
    loginBtn: "Connexion Sécurisée",
    forgotPassword: "Code PIN ou mot de passe oublié ?",
    iAmHereAs: "Je suis ici en tant que :",
    fullNameLabel: "Nom Complet ou Nom du Magasin",
    phoneLabel: "Téléphone (Principal pour connexion et contact)",
    phonePlaceholder: "Ex : 0612345678",
    cityLabel: "Ville",
    cityPlaceholder: "Ex : Kasbah Tadla, Casablanca...",
    specialtyLabel: "Choisissez votre métier en image :",
    supplierTypeLabel: "Type d'activité commerciale :",
    registerBtn: "Créer mon compte maintenant",
    errInvalidLogin: "Téléphone/Email ou code incorrect.",
    successLogin: "✅ Connexion réussie ! Redirection...",
    errEmailExists: "Ce numéro ou email est déjà enregistré.",
    successRegister: "✅ Compte créé avec succès ! Bienvenue.",
    errUnexpected: "Une erreur est survenue lors de l'inscription.",
    audioGuideBtn: "🔊 Écouter le guide vocal",
    audioGuideStop: "⏹️ Arrêter l'audio",
    voiceSmartTitle: "🎙️ Inscription Vocale IA (Sans clavier)",
    voiceSmartDesc: "Appuyez sur le micro et dites votre nom, ville, métier et téléphone",
    voiceStartBtn: "Appuyez et parlez",
    voiceListeningBtn: "Écoute en cours... Parlez maintenant",
    scanCardBtn: "📷 Scanner Carte de Visite / Carte Pro",
    scanningCardMsg: "Lecture intelligente de la carte en cours...",
    aiBioPreviewLabel: "✨ Présentation professionnelle rédigée par l'IA :",
    voiceLoginHint: "💡 Vous pouvez dicter votre numéro avec le micro",
    rateLimitLocked: "🔒 Compte temporairement verrouillé par sécurité après plusieurs essais. Réessayez dans 15 min.",
    pinSecurityHint: "🛡️ Choisissez un code PIN simple (4 chiffres ex: 2580) ou un mot de passe pour protéger votre compte."
  },
  en: {
    roleClientTitle: "Contractor / Project Owner",
    roleProviderTitle: "Artisan / Craftsman",
    roleArchitectTitle: "Architect",
    roleSupplierTitle: "Materials Supplier",
    msgProvider: "Create your account instantly via voice or text, or visit the detailed page.",
    btnProvider: "👷‍♂️ Or go to full Artisan Registration",
    msgArchitect: "As an architect, your registration number is required to activate engineering features.",
    btnArchitect: "📐 Go to Architect Registration",
    msgSupplier: "Register your store instantly via voice or text.",
    btnSupplier: "🧱 Or go to full Supplier Registration",
    portalSubtitle: "Login or register via text or smart AI voice assistant",
    tabRegister: "Create Account",
    tabLogin: "Login",
    emailOrPhoneLabel: "Phone Number or Email",
    emailOrPhonePlaceholder: "0612345678 or example@email.com",
    emailLabel: "Email (Optional with phone)",
    passwordOrPinLabel: "Secret PIN (4 digits) or Password",
    loginBtn: "Secure Login",
    forgotPassword: "Forgot PIN or Password?",
    iAmHereAs: "I am here as:",
    fullNameLabel: "Full Name or Store Name",
    phoneLabel: "Phone Number (Primary for login & contact)",
    phonePlaceholder: "E.g., 0612345678",
    cityLabel: "City",
    cityPlaceholder: "E.g., Kasbah Tadla, Casablanca...",
    specialtyLabel: "Select your trade visually:",
    supplierTypeLabel: "Select business type:",
    registerBtn: "Create My Account Now",
    errInvalidLogin: "Invalid phone/email or secret code.",
    successLogin: "✅ Login successful! Redirecting...",
    errEmailExists: "This phone or email is already registered.",
    successRegister: "✅ Account created successfully! Welcome.",
    errUnexpected: "An error occurred during registration.",
    audioGuideBtn: "🔊 Listen to Audio Guide",
    audioGuideStop: "⏹️ Stop Audio",
    voiceSmartTitle: "🎙️ Smart AI Voice Registration",
    voiceSmartDesc: "Tap the mic and say your name, city, trade, and phone number",
    voiceStartBtn: "Tap & Speak Now",
    voiceListeningBtn: "Listening... Speak now",
    scanCardBtn: "📷 Scan Business / Pro Card",
    scanningCardMsg: "Scanning card with AI...",
    aiBioPreviewLabel: "✨ AI-Generated Professional Bio:",
    voiceLoginHint: "💡 You can speak your phone number using the mic",
    rateLimitLocked: "🔒 Temporarily locked for security after multiple failed attempts. Wait 15 minutes.",
    pinSecurityHint: "🛡️ Choose a simple 4-digit PIN (e.g., 2580) or password to protect your account."
  }
};

// 🔢 تحويل الأرقام المنطوقة بالعربية/الدارجة/الفرنسية إلى أرقام رقمية
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
  // تحويل الأرقام العربية الشرقية (٠-٩) إلى غربية (0-9)
  const easternDigits = '٠١٢٣٤٥٦٧٨٩';
  str = str.replace(/[٠-٩]/g, (d) => easternDigits.indexOf(d));
  return str;
};

// 🔐 توحيد رقم الهاتف إلى بريد مقنع داخلي (@sasbtp.ma) عند عدم إدخال بريد إلكتروني
const resolveIdentifierToEmail = (identifier, fallbackPhone = '') => {
  const raw = (identifier || fallbackPhone || '').trim();
  if (raw.includes('@')) return raw.toLowerCase();
  let digits = convertSpokenWordsToDigits(raw).replace(/\D/g, '');
  if (digits.startsWith('212') && digits.length >= 11) {
    digits = '0' + digits.slice(3);
  }
  if (digits.startsWith('00212') && digits.length >= 13) {
    digits = '0' + digits.slice(5);
  }
  return digits ? `${digits}@sasbtp.ma` : '';
};

// 🛡️ تغليف رمز PIN القصير (4 أو 5 أرقام) ليحقق شرط 6 أحرف في Supabase مع تشفير قوي
const wrapPinOrPassword = (secret) => {
  const clean = (secret || '').trim();
  if (clean.length > 0 && clean.length < 6) {
    return `SAS#PIN#${clean}#BTP`;
  }
  return clean;
};

export default function AuthGateway() {
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [activeTab, setActiveTab] = useState(() =>
    window.location.search.includes('ref=') ? 'register' : 'login'
  );
  const [selectedRole, setSelectedRole] = useState('client'); // 'client' | 'provider' | 'architect' | 'supplier'
  const [selectedSpecialty, setSelectedSpecialty] = useState('macon');
  const [selectedSupplierType, setSelectedSupplierType] = useState('retail');

  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  // حالات الصوت والمسح الذكي
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [listeningTarget, setListeningTarget] = useState(null); // 'smartAll' | 'loginId' | 'loginPin' | 'fullName' | 'phone' | 'city' | 'password'
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isScanningCard, setIsScanningCard] = useState(false);

  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    loginIdentifier: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: '',
    aiBio: '',
    experienceYears: ''
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
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 7000);
  };

  // ==========================================
  // 🔊 1. المرشد الصوتي الناطق (Audio Guide)
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
        ? activeTab === 'login'
          ? 'مرحباً بك في منصة ساس بي تي بي. لتسجيل الدخول، يمكنك كتابة رقم هاتفك أو الضغط على زر الميكروفون ونطق رقم هاتفك، ثم إدخال رمزك السري المكون من أربعة أرقام.'
          : 'مرحباً بك في صفحة إنشاء الحساب. إذا كنت تجد صعوبة في الكتابة، اختر مهنتك ثم اضغط على زر الميكروفون البرتقالي، وقل اسمك، مدينتك، حرفتك، ورقم هاتفك، وسنقوم بملء جميع الخانات وتجهيز ملفك تلقائياً.'
        : language === 'fr'
        ? activeTab === 'login'
          ? 'Bienvenue sur SasBTP. Entrez ou dictez votre numéro de téléphone et votre code secret pour vous connecter.'
          : 'Bienvenue. Appuyez sur le microphone orange et dites votre nom, votre ville, votre métier et votre numéro de téléphone, nous remplirons tout automatiquement.'
        : 'Welcome to SasBTP. Tap the orange microphone and speak your name, city, trade, and phone number to fill your account automatically.';

    const utterance = new SpeechSynthesisUtterance(guideText);
    utterance.lang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingGuide(false);
    utterance.onerror = () => setIsSpeakingGuide(false);

    setIsSpeakingGuide(true);
    window.speechSynthesis.speak(utterance);
  };

  // ==========================================
  // 🧠 2. المحلل الذكي للكلام وصياغة النبذة (NLP Voice-to-Form)
  // ==========================================
  const parseSmartVoiceProfile = (rawSpeech) => {
    const normalized = convertSpokenWordsToDigits(rawSpeech);
    const lower = normalized.toLowerCase();

    // أ) استخراج رقم الهاتف المغربي (06 / 07 / 05)
    const compactDigits = normalized.replace(/[\s\-./]/g, '');
    const phoneMatch = compactDigits.match(/(?:00212|\+212|212|0)([567]\d{8})/);
    const extractedPhone = phoneMatch ? `0${phoneMatch[1]}` : '';

    // ب) استخراج المدينة
    let detectedCity = '';
    for (const c of MOROCCAN_CITIES_MAP) {
      if (c.keywords.some((k) => lower.includes(k))) {
        detectedCity = c.label;
        break;
      }
    }

    // ج) استخراج الحرفة / التخصص
    let detectedSpecObj = null;
    for (const sp of ARTISAN_SPECIALTIES) {
      if (sp.keywords.some((k) => lower.includes(k))) {
        detectedSpecObj = sp;
        break;
      }
    }

    // د) استخراج سنوات الخبرة
    const expMatch = normalized.match(/(\d{1,2})\s*(?:سنة|سنه|سنين|سنوات|عام|أعوام|ans|an|years)/i);
    const extractedYears = expMatch ? expMatch[1] : '';

    // هـ) استخراج الاسم
    let extractedName = '';
    const namePatterns = [
      /(?:أنا|انا|اسمي|إسمي|سميتي|معكم)\s+(?:المعلم\s+|الشاف\s+|الحاج\s+)?([أ-يa-zA-Z]+(?:\s+[أ-يa-zA-Z]+){0,2})/i,
      /(?:je suis|je m'appelle|moi c'est)\s+([a-zA-ZÀ-ÿ]+(?:\s+[a-zA-ZÀ-ÿ]+){0,2})/i
    ];
    for (const pat of namePatterns) {
      const m = rawSpeech.match(pat);
      if (m && m[1]) {
        extractedName = m[1]
          .replace(/\b(من|في|مدينة|مدينه|معلم|بلومبي|تريسيان|بناي|صباغ|نجار|زلايجي|جباس|حداد|de|à)\b.*/i, '')
          .trim();
        break;
      }
    }

    // و) الصياغة التلقائية للنبذة المهنية بلغة سليمة وجذابة للزبناء
    const specTitle = detectedSpecObj
      ? (language === 'ar' ? detectedSpecObj.ar : detectedSpecObj.fr)
      : (ARTISAN_SPECIALTIES.find((s) => s.id === selectedSpecialty)?.[language === 'ar' ? 'ar' : 'fr'] || 'البناء والأشغال');

    const cityClean = detectedCity ? detectedCity.split(' - ')[language === 'ar' ? 0 : 1] || detectedCity : '';
    const expPhraseAr = extractedYears ? `بخبرة ميدانية تمتد لأكثر من ${extractedYears} سنة` : 'بخبرة ميدانية واسعة';
    const expPhraseFr = extractedYears ? `avec plus de ${extractedYears} ans d'expérience` : 'avec une solide expérience terrain';

    const composedBio =
      language === 'ar'
        ? `حرفي ومهني معتمد في منصة SasBTP متخصص في (${specTitle})${cityClean ? ` بمدينة ${cityClean} والنواحي` : ''}، ${expPhraseAr}. أضمن للزبناء إتقان العمل، احترام المواعيد، واستخدام أفضل المعايير المهنية في جميع الأوراش.`
        : `Artisan professionnel vérifié SasBTP spécialisé en ${specTitle}${cityClean ? ` sur ${cityClean} et régions` : ''}, ${expPhraseFr}. Travail soigné, respect des délais et devis transparents.`;

    if (detectedSpecObj) {
      setSelectedSpecialty(detectedSpecObj.id);
    }

    setFormData((prev) => ({
      ...prev,
      fullName: extractedName || prev.fullName,
      phone: extractedPhone || prev.phone,
      city: detectedCity || prev.city,
      experienceYears: extractedYears || prev.experienceYears,
      aiBio: composedBio
    }));
  };

  // ==========================================
  // 🎙️ 3. تشغيل الميكروفون (للاستمارة الكاملة أو لحقل محدد)
  // ==========================================
  const toggleVoiceInput = (targetField = 'smartAll') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showAlert('error', language === 'ar' ? 'متصفحك لا يدعم الميكروفون الصوتي، يرجى استخدام Chrome أو Safari.' : 'Votre navigateur ne supporte pas la reconnaissance vocale.');
      return;
    }

    if (listeningTarget === targetField && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setListeningTarget(null);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListeningTarget(targetField);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setSpokenTranscript(transcript);

      if (targetField === 'smartAll') {
        parseSmartVoiceProfile(transcript);
      } else if (targetField === 'loginId' || targetField === 'phone') {
        const digits = convertSpokenWordsToDigits(transcript).replace(/\D/g, '');
        setFormData((prev) => ({
          ...prev,
          [targetField === 'loginId' ? 'loginIdentifier' : 'phone']: digits || transcript.trim()
        }));
      } else if (targetField === 'loginPin' || targetField === 'password') {
        const digits = convertSpokenWordsToDigits(transcript).replace(/\s+/g, '');
        setFormData((prev) => ({ ...prev, password: digits }));
      } else if (targetField === 'fullName') {
        setFormData((prev) => ({ ...prev, fullName: transcript.trim() }));
      } else if (targetField === 'city') {
        setFormData((prev) => ({ ...prev, city: transcript.trim() }));
      }
    };

    recognition.onerror = () => {
      setListeningTarget(null);
    };

    recognition.onend = () => {
      setListeningTarget(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ==========================================
  // 📷 4. مسح البطاقة المهنية / الكارط فيزيت (Card OCR Assist)
  // ==========================================
  const handleCardImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningCard(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      let extractedText = '';

      // محاولة استخدام كاشف النصوص المدمج في المتصفح إن وجد
      if ('TextDetector' in window) {
        try {
          const bitmap = await createImageBitmap(file);
          // eslint-disable-next-line no-undef
          const detector = new TextDetector();
          const blocks = await detector.detect(bitmap);
          extractedText = blocks.map((b) => b.rawValue).join(' ');
        } catch (err) {}
      }

      if (extractedText) {
        parseSmartVoiceProfile(extractedText);
        showAlert('success', language === 'ar' ? '✅ تم مسح البطاقة واستخراج البيانات بنجاح!' : '✅ Carte scannée avec succès !');
      } else {
        // استخلاص اسم الملف إن وجد وتجهيز النبذة المهنية تلقائياً
        const specTitle = ARTISAN_SPECIALTIES.find((s) => s.id === selectedSpecialty)?.[language === 'ar' ? 'ar' : 'fr'] || '';
        const autoBio =
          language === 'ar'
            ? `مهني معتمد في منصة SasBTP (${specTitle}). تم توثيق البطاقة المهنية، ملتزم بأعلى معايير الجودة وإتقان العمل.`
            : `Professionnel vérifié SasBTP (${specTitle}). Carte professionnelle jointe, qualité et sérieux garantis.`;

        setFormData((prev) => ({
          ...prev,
          aiBio: prev.aiBio || autoBio
        }));

        showAlert(
          'success',
          language === 'ar'
            ? '📷 تم إرفاق صورة البطاقة المهنية وتجهيز نبذتك! يرجى التأكد من رقم الهاتف والاسم.'
            : '📷 Carte professionnelle jointe ! Veuillez vérifier votre nom et téléphone.'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningCard(false);
    }
  };

  // ==========================================
  // 🔒 5. فحص جدار الحماية ضد تخمين الرمز السري (Rate Limiter)
  // ==========================================
  const checkBruteForceLock = (emailKey) => {
    try {
      const raw = localStorage.getItem(`sasbtp_guard_${emailKey}`);
      if (!raw) return false;
      const record = JSON.parse(raw);
      if (record.lockUntil && Date.now() < record.lockUntil) {
        return true;
      }
      if (record.lockUntil && Date.now() >= record.lockUntil) {
        localStorage.removeItem(`sasbtp_guard_${emailKey}`);
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const registerFailedAttempt = (emailKey) => {
    try {
      const raw = localStorage.getItem(`sasbtp_guard_${emailKey}`);
      const record = raw ? JSON.parse(raw) : { attempts: 0, lockUntil: null };
      record.attempts += 1;
      if (record.attempts >= 5) {
        record.lockUntil = Date.now() + 15 * 60 * 1000; // قفل لمدة 15 دقيقة
      }
      localStorage.setItem(`sasbtp_guard_${emailKey}`, JSON.stringify(record));
    } catch (e) {}
  };

  const clearFailedAttempts = (emailKey) => {
    try {
      localStorage.removeItem(`sasbtp_guard_${emailKey}`);
    } catch (e) {}
  };

  // ==========================================
  // 🔑 6. معالجة تسجيل الدخول (تقبل الهاتف أو الإيميل + PIN أو كلمة مرور)
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    const targetEmail = resolveIdentifierToEmail(formData.loginIdentifier || formData.email);
    if (!targetEmail) {
      setIsLoading(false);
      return showAlert('error', t.errInvalidLogin);
    }

    if (checkBruteForceLock(targetEmail)) {
      setIsLoading(false);
      return showAlert('error', t.rateLimitLocked);
    }

    try {
      const rawSecret = formData.password.trim();
      const wrappedSecret = wrapPinOrPassword(rawSecret);

      // المحاولة الأولى (باستخدام الرمز المكيف أو كلمة المرور)
      let authRes = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: wrappedSecret
      });

      // إذا أدخل المستخدم كلمة مرور عادية أو رمزاً مختلفاً، نجرب القيمة الخام الاحتياطية
      if (authRes.error && wrappedSecret !== rawSecret && rawSecret.length >= 6) {
        authRes = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: rawSecret
        });
      }

      if (authRes.error) {
        registerFailedAttempt(targetEmail);
        throw new Error(t.errInvalidLogin);
      }

      clearFailedAttempts(targetEmail);

      const user = authRes.data?.user;
      const metaRole = user?.user_metadata?.role || user?.user_metadata?.account_type;
      const metaSupplierType = user?.user_metadata?.supplier_type;

      // فحص ما إذا كان الحساب لمورد أو تاجر في قاعدة البيانات
      const { data: supData } = await supabase
        .from('suppliers')
        .select('supplier_type')
        .eq('user_id', user.id)
        .maybeSingle();

      showAlert('success', t.successLogin);

      setTimeout(() => {
        if (metaRole === 'admin') {
          sessionStorage.setItem('sasbtp_v2_role', 'admin');
          navigate('/v2/admin-dashboard');
        } else if (supData || metaRole === 'supplier') {
          const type = supData?.supplier_type || metaSupplierType || 'retail';
          window.location.href = type === 'wholesale' ? '/?preview=wholesale' : '/?preview=retail';
        } else if (metaRole === 'architect') {
          sessionStorage.setItem('sasbtp_v2_role', 'architect');
          navigate('/v2/architect-dashboard');
        } else if (metaRole === 'provider') {
          sessionStorage.setItem('sasbtp_v2_role', 'provider');
          navigate('/v2/provider-dashboard');
        } else {
          sessionStorage.setItem('sasbtp_v2_role', 'contractor');
          navigate('/v2/contractor-dashboard');
        }
      }, 900);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 7. معالجة التسجيل الموحد والذكي (مقاول، حرفي، مورد)
  // ==========================================
  const handleSmartRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      const effectiveEmail = resolveIdentifierToEmail(formData.email, formData.phone);
      if (!effectiveEmail) {
        throw new Error(language === 'ar' ? 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني.' : 'Veuillez entrer un numéro de téléphone ou un email.');
      }

      const finalPassword = wrapPinOrPassword(formData.password);
      if (!finalPassword || finalPassword.length < 4) {
        throw new Error(language === 'ar' ? 'يرجى اختيار رمز سري (4 أرقام على الأقل).' : 'Veuillez choisir un code PIN (min 4 chiffres).');
      }

      const mappedRole =
        selectedRole === 'client'
          ? 'contractor'
          : selectedRole === 'provider'
          ? 'provider'
          : selectedRole === 'supplier'
          ? 'supplier'
          : 'architect';

      const specObj = ARTISAN_SPECIALTIES.find((s) => s.id === selectedSpecialty);
      const specialtyName = specObj ? (language === 'ar' ? specObj.ar : specObj.fr) : '';

      const autoGeneratedBio =
        formData.aiBio ||
        (selectedRole === 'provider'
          ? `حرفي معتمد في منصة SasBTP متخصص في (${specialtyName})${formData.city ? ` بمدينة ${formData.city}` : ''}. التزام تام بالجودة وإتقان العمل.`
          : '');

      const providerProfileMeta = {
        full_name: formData.fullName.trim(),
        city: formData.city.trim() || 'غير محددة',
        phone: formData.phone.trim(),
        bio_text: autoGeneratedBio,
        experience_text: specialtyName + (formData.experienceYears ? ` (${formData.experienceYears} سنوات خبرة)` : ''),
        terms_text: '',
        quick_info: ''
      };

      const { data, error } = await supabase.auth.signUp({
        email: effectiveEmail,
        password: finalPassword,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            company_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            city: formData.city.trim(),
            role: mappedRole,
            account_type: mappedRole,
            supplier_type: selectedRole === 'supplier' ? selectedSupplierType : undefined,
            specialty: selectedRole === 'provider' ? specialtyName : undefined,
            provider_profile: selectedRole === 'provider' ? providerProfileMeta : undefined
          }
        }
      });

      if (error) throw error;
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error(t.errEmailExists);
      }

      const uid = data?.user?.id;

      if (uid) {
        // 1. ربط الإحالة
        await bindReferralOnSignup(uid);

        // 2. إذا كان المسجل حرفياً (Provider): ننشئ سجله في جدول providers ونحفظ نبذته الذكية
        if (selectedRole === 'provider') {
          localStorage.setItem(`sasbtp_provider_profile_${uid}`, JSON.stringify(providerProfileMeta));
          await supabase
            .from('providers')
            .insert([
              {
                user_id: uid,
                full_name: formData.fullName.trim(),
                phone: formData.phone.trim(),
                account_type: 'marketplace'
              }
            ])
            .catch(() => {});
        }

        // 3. إذا كان المسجل مورداً أو تاجراً (Supplier): ننشئ سجله في جدول suppliers
        if (selectedRole === 'supplier') {
          await supabase
            .from('suppliers')
            .insert([
              {
                user_id: uid,
                store_name: formData.fullName.trim(),
                email: effectiveEmail,
                phone: formData.phone.trim(),
                supplier_type: selectedSupplierType
              }
            ])
            .catch(() => {});
        }
      }

      showAlert('success', t.successRegister);

      setTimeout(() => {
        if (selectedRole === 'provider') {
          sessionStorage.setItem('sasbtp_v2_role', 'provider');
          navigate('/v2/provider-dashboard');
        } else if (selectedRole === 'supplier') {
          window.location.href = selectedSupplierType === 'wholesale' ? '/?preview=wholesale' : '/?preview=retail';
        } else if (selectedRole === 'architect') {
          sessionStorage.setItem('sasbtp_v2_role', 'architect');
          navigate('/v2/architect-dashboard');
        } else {
          sessionStorage.setItem('sasbtp_v2_role', 'contractor');
          navigate('/v2/contractor-dashboard');
        }
      }, 1500);
    } catch (err) {
      showAlert('error', err.message || t.errUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  // إعدادات ألوان ونصوص بطاقات الرتب
  const roleConfigs = {
    client: {
      id: 'client',
      icon: '🏗️',
      title: t.roleClientTitle,
      color: 'blue',
      border: 'border-blue-200',
      bg: 'bg-blue-50/50',
      activeBorder: 'border-blue-500',
      activeBg: 'bg-blue-50',
      textColor: 'text-blue-900',
      ring: 'ring-blue-500'
    },
    provider: {
      id: 'provider',
      icon: '👷‍♂️',
      title: t.roleProviderTitle,
      color: 'orange',
      border: 'border-orange-200',
      bg: 'bg-orange-50/50',
      activeBorder: 'border-orange-500',
      activeBg: 'bg-orange-50',
      textColor: 'text-orange-700',
      ring: 'ring-orange-500',
      msg: t.msgProvider,
      btnText: t.btnProvider,
      btnColor: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30',
      route: '/v2/provider-auth'
    },
    architect: {
      id: 'architect',
      icon: '📐',
      title: t.roleArchitectTitle,
      color: 'purple',
      border: 'border-purple-200',
      bg: 'bg-purple-50/50',
      activeBorder: 'border-purple-500',
      activeBg: 'bg-purple-50',
      textColor: 'text-purple-700',
      ring: 'ring-purple-500',
      msg: t.msgArchitect,
      btnText: t.btnArchitect,
      btnColor: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30',
      route: '/v2/architect-register'
    },
    supplier: {
      id: 'supplier',
      icon: '🧱',
      title: t.roleSupplierTitle,
      color: 'emerald',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50',
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      ring: 'ring-emerald-500',
      msg: t.msgSupplier,
      btnText: t.btnSupplier,
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30',
      route: '/v2/supplier-register'
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-800 z-0"></div>

      <div className="w-full max-w-xl bg-white rounded-[24px] shadow-2xl overflow-hidden border border-white/20 relative z-10 my-8">
        
        {/* الترويسة + زر المرشد الصوتي الناطق */}
        <div className="p-7 pb-4 text-center">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Voice & PIN AI
            </span>

            <button
              type="button"
              onClick={toggleAudioGuide}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
                isSpeakingGuide
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-md'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              {isSpeakingGuide ? t.audioGuideStop : t.audioGuideBtn}
            </button>
          </div>

          <h1 className="text-3xl font-black text-blue-900 mb-1.5 flex items-center justify-center gap-2">
            SasBTP <span className="text-2xl">🏗️</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs md:text-sm">{t.portalSubtitle}</p>
        </div>

        {/* تبويبات: إنشاء حساب / تسجيل الدخول */}
        <div className="px-7 pb-5 flex gap-3">
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setAlert({ show: false, type: '', text: '' }); }}
            className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all duration-300 border-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-blue-900 text-white border-blue-900 shadow-lg'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.tabRegister}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setAlert({ show: false, type: '', text: '' }); }}
            className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all duration-300 border-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-blue-900 text-white border-blue-900 shadow-lg'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.tabLogin}
          </button>
        </div>

        {/* رسائل التنبيه */}
        {alert.show && (
          <div className="px-7 pb-4">
            <div className={`p-4 rounded-xl font-bold flex items-start gap-3 border text-sm ${
              alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <span>{alert.text}</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 🔑 تبويب تسجيل الدخول (بالهاتف أو الإيميل + الميكروفون) */}
        {/* ========================================================= */}
        {activeTab === 'login' && (
          <div className="p-7 pt-0 animate-fade-in">
            <div className="mb-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between gap-2">
              <span>{t.voiceLoginHint}</span>
              <Mic className="w-4 h-4 text-blue-600 shrink-0" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.emailOrPhoneLabel}</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    name="loginIdentifier"
                    required
                    value={formData.loginIdentifier}
                    onChange={handleChange}
                    className="w-full p-4 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-bold text-slate-800"
                    dir="ltr"
                    placeholder={t.emailOrPhonePlaceholder}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('loginId')}
                    title="انطق رقم الهاتف"
                    className={`absolute right-2.5 p-2 rounded-lg transition-all cursor-pointer ${
                      listeningTarget === 'loginId'
                        ? 'bg-red-500 text-white animate-pulse shadow-md'
                        : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                    }`}
                  >
                    {listeningTarget === 'loginId' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.passwordOrPinLabel}</label>
                <div className="relative flex items-center">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-4 pl-12 pr-20 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-bold tracking-widest text-slate-800"
                    dir="ltr"
                    placeholder="••••"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                  <div className="absolute right-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVoiceInput('loginPin')}
                      title="انطق الرمز السري"
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        listeningTarget === 'loginPin'
                          ? 'bg-red-500 text-white animate-pulse shadow-md'
                          : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                      }`}
                    >
                      {listeningTarget === 'loginPin' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-black text-base shadow-[0_5px_15px_rgba(30,58,138,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                {t.loginBtn}
              </button>
            </form>

            <div className="text-center mt-5">
              <button type="button" className="text-amber-600 hover:text-amber-700 font-bold text-sm hover:underline cursor-pointer">
                {t.forgotPassword}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 🎙️ تبويب إنشاء الحساب (بالصوت، الكاميرا، الأيقونات، أو الكتابة) */}
        {/* ========================================================= */}
        {activeTab === 'register' && (
          <div className="p-7 pt-0 animate-fade-in">
            
            {/* 1. اختيار الصفة المهنية */}
            <div className="bg-slate-50 border border-blue-200 border-dashed rounded-xl p-4 mb-5">
              <label className="block text-blue-900 font-black text-center text-sm mb-3">{t.iAmHereAs}</label>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(roleConfigs).map((role) => (
                  <label
                    key={role.id}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 text-center ${
                      selectedRole === role.id
                        ? `${role.activeBorder} ${role.activeBg} shadow-sm ring-1 ${role.ring}`
                        : `${role.border} ${role.bg} hover:bg-white`
                    }`}
                  >
                    <input
                      type="radio"
                      name="role_type"
                      value={role.id}
                      checked={selectedRole === role.id}
                      onChange={() => { setSelectedRole(role.id); setAlert({ show: false, type: '', text: '' }); }}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">{role.icon}</span>
                    <span className={`font-black text-[0.78rem] leading-tight ${selectedRole === role.id ? role.textColor : 'text-slate-600'}`}>
                      {role.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* إذا اختار المهندس المعماري، يوجه لصفحة رقم الهيئة الهندسية الخاصة به */}
            {selectedRole === 'architect' ? (
              <div className="text-center animate-fade-in py-4">
                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6 px-4">
                  {roleConfigs.architect.msg}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(roleConfigs.architect.route)}
                  className={`w-full py-4 text-white rounded-xl font-black text-sm transition-transform hover:-translate-y-1 flex justify-center items-center shadow-lg cursor-pointer ${roleConfigs.architect.btnColor}`}
                >
                  {roleConfigs.architect.btnText}
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                
                {/* 2. صندوق التسجيل الصوتي الذكي ومسح البطاقة المهنية */}
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-black text-orange-900 text-sm flex items-center gap-1.5">
                        {t.voiceSmartTitle}
                      </h3>
                      <p className="text-xs font-bold text-orange-800/80 mt-0.5 leading-relaxed">
                        {t.voiceSmartDesc}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                    <button
                      type="button"
                      onClick={() => toggleVoiceInput('smartAll')}
                      className={`py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        listeningTarget === 'smartAll'
                          ? 'bg-red-600 text-white animate-pulse shadow-red-500/40'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                      }`}
                    >
                      {listeningTarget === 'smartAll' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>{listeningTarget === 'smartAll' ? t.voiceListeningBtn : t.voiceStartBtn}</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCardImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isScanningCard}
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 px-4 rounded-xl font-black text-xs bg-white hover:bg-slate-50 text-slate-800 border border-orange-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      {isScanningCard ? <Loader2 className="w-4 h-4 animate-spin text-orange-600" /> : <Camera className="w-4 h-4 text-orange-600" />}
                      <span>{isScanningCard ? t.scanningCardMsg : t.scanCardBtn}</span>
                    </button>
                  </div>

                  {spokenTranscript && (
                    <div className="mt-3 p-2.5 bg-white/90 rounded-xl border border-orange-200 text-xs font-bold text-slate-700">
                      🗣️ &ldquo;{spokenTranscript}&rdquo;
                    </div>
                  )}
                </div>

                {/* 3. اختيار الحرفة بالصور والأيقونات الكبيرة (للحرفيين) */}
                {selectedRole === 'provider' && (
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2">{t.specialtyLabel}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ARTISAN_SPECIALTIES.map((sp) => {
                        const active = selectedSpecialty === sp.id;
                        return (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => setSelectedSpecialty(sp.id)}
                            className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                              active
                                ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm scale-[1.02]'
                                : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
                            }`}
                          >
                            <span className="text-2xl mb-1">{sp.icon}</span>
                            <span className="text-[11px] font-black leading-tight">
                              {language === 'ar' ? sp.ar : language === 'fr' ? sp.fr : sp.en}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. اختيار نوع النشاط بالصور (للموردين والتجار) */}
                {selectedRole === 'supplier' && (
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2">{t.supplierTypeLabel}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SUPPLIER_TYPES.map((st) => {
                        const active = selectedSupplierType === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setSelectedSupplierType(st.id)}
                            className={`p-3 rounded-xl border-2 flex items-center gap-3 text-start transition-all cursor-pointer ${
                              active
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                                : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                            }`}
                          >
                            <span className="text-2xl shrink-0">{st.icon}</span>
                            <span className="text-xs font-black leading-snug">
                              {language === 'ar' ? st.ar : language === 'fr' ? st.fr : st.en}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. حقول الاستمارة (تُملأ صوتياً أو يدوياً) */}
                <form onSubmit={handleSmartRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.fullNameLabel}</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-bold text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVoiceInput('fullName')}
                        className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} p-2 rounded-lg cursor-pointer ${
                          listeningTarget === 'fullName' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/80 text-slate-700 hover:bg-orange-100'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.phoneLabel}</label>
                      <div className="relative flex items-center">
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder={t.phonePlaceholder}
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full p-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-bold text-slate-800"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => toggleVoiceInput('phone')}
                          className={`absolute right-2 p-2 rounded-lg cursor-pointer ${
                            listeningTarget === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/80 text-slate-700 hover:bg-orange-100'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.cityLabel}</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          name="city"
                          placeholder={t.cityPlaceholder}
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-bold text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => toggleVoiceInput('city')}
                          className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-2 rounded-lg cursor-pointer ${
                            listeningTarget === 'city' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/80 text-slate-700 hover:bg-orange-100'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* معاينة النبذة المهنية التي صاغها الذكاء الاصطناعي */}
                  {formData.aiBio && (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                      <label className="block text-[11px] font-black text-indigo-900 mb-1">
                        {t.aiBioPreviewLabel}
                      </label>
                      <textarea
                        rows="2"
                        value={formData.aiBio}
                        onChange={(e) => setFormData({ ...formData, aiBio: e.target.value })}
                        className="w-full bg-white p-2 rounded-lg border border-indigo-100 text-xs font-medium text-slate-700 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* البريد الإلكتروني اختياري إذا أدخل رقم الهاتف */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.emailLabel}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com (اختياري)"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-medium"
                      dir="ltr"
                    />
                  </div>

                  {/* الرمز السري PIN أو كلمة المرور */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.passwordOrPinLabel}</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPass ? 'text' : 'password'}
                        name="password"
                        required
                        minLength="4"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="مثال: 2580"
                        className="w-full p-3.5 pr-20 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-black tracking-widest text-slate-800"
                        dir="ltr"
                      />
                      <div className="absolute right-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleVoiceInput('password')}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            listeningTarget === 'password' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/80 text-slate-700 hover:bg-orange-100'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">{t.pinSecurityHint}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm md:text-base shadow-[0_5px_15px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {t.registerBtn}
                  </button>
                </form>

                {/* الاحتفاظ بأزرار الانتقال لصفحات التسجيل التفصيلية للحرفيين والموردين لمن يرغب بها */}
                {(selectedRole === 'provider' || selectedRole === 'supplier') && (
                  <div className="pt-3 border-t border-slate-200 text-center">
                    <button
                      type="button"
                      onClick={() => navigate(roleConfigs[selectedRole].route)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      {roleConfigs[selectedRole].btnText}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}