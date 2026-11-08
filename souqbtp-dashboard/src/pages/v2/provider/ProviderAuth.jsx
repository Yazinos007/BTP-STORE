import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { 
  HardHat, Mail, User, Phone, MapPin, 
  ArrowRight, Loader2, CheckCircle2, AlertCircle, Mic, MicOff, 
  Volume2, Camera, KeyRound, Eye, EyeOff, ShieldCheck, Sparkles, Globe 
} from 'lucide-react';
import { bindReferralOnSignup } from '../../../lib/referralHandler';

// 🏙️ خريطة المدن المغربية للالتقاط الصوتي بالدارجة والترجمة التلقائية بين اللغات
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

// 🛠️ التخصصات البصرية المرتبطة بـ service_id في قاعدة البيانات + تخصصات إضافية + خيار "حرفة أخرى"
const SERVICE_SPECIALTIES = [
  { id: '37', dbServiceId: 37, icon: '🧱', ar: 'بناي / أعمال البناء', fr: 'Maçon / Gros Œuvres', en: 'Mason / Construction', keywords: ['بناي', 'بناء', 'ضالة', 'ياجور', 'طوب', 'حفر', 'مرطوب', 'gros oeuvres', 'maçon', 'macon', 'construction'] },
  { id: '38', dbServiceId: 38, icon: '⚡', ar: 'تريسيان / كهرباء', fr: 'Électricien Bâtiment', en: 'Electrician', keywords: ['تريسيان', 'كهربائي', 'كهرباء', 'ضو', 'الضو', 'ضوء', 'خيوط', 'كابلات', 'électricité', 'electricite', 'électricien'] },
  { id: '39', dbServiceId: 39, icon: '🚰', ar: 'بلومبي / سباكة', fr: 'Plombier / Sanitaire', en: 'Plumber / Sanitary', keywords: ['بلومبي', 'سباك', 'سباكة', 'رصاص', 'ماء', 'قوادس', 'سانيتير', 'حمامات', 'plomberie', 'plombier', 'sanitaire'] },
  { id: '40', dbServiceId: 40, icon: '🛡️', ar: 'عزل وإيتانشيتي', fr: 'Étanchéité & Isolation', en: 'Waterproofing', keywords: ['عزل', 'إيتانشيتي', 'ايتانشيتي', 'قطرة', 'سطح', 'زفت', 'étanchéité', 'etancheite', 'isolation'] },
  { id: '53', dbServiceId: 53, icon: '🏛️', ar: 'زلايجي وجباس', fr: 'Carrelage, Marbre & Plâtre', en: 'Tiling, Marble & Plaster', keywords: ['زلايجي', 'زليج', 'جباس', 'جبس', 'قبص', 'سيراميك', 'رخام', 'فايونص', 'بلافو', 'carrelage', 'plâtre', 'zellige'] },
  { id: '54', dbServiceId: 54, icon: '🎨', ar: 'صباغ وديكور', fr: 'Peinture & Décoration', en: 'Painting & Decor', keywords: ['صباغ', 'صباغة', 'صباغه', 'دهان', 'خيال', 'ستيكو', 'فاصاد', 'peinture', 'peintre'] },
  { id: '43', dbServiceId: 43, icon: '🪵', ar: 'نجار خشب وألمنيوم', fr: 'Menuiserie Bois & Alu', en: 'Wood & Alu Carpentry', keywords: ['نجار', 'نجارة', 'خشب', 'ألمنيوم', 'المنيوم', 'أبواب', 'نوافذ', 'شراجم', 'menuiserie', 'aluminium', 'bois'] },
  { id: 'ferronnier', dbServiceId: 37, icon: '🔩', ar: 'حداد وتلحيم (سودور)', fr: 'Ferronnerie & Soudure', en: 'Blacksmith & Welding', keywords: ['حداد', 'سودور', 'تلحيم', 'حديد', 'شباك', 'ferronnier', 'soudure'] },
  { id: 'clim_solaire', dbServiceId: 38, icon: '☀️', ar: 'تكييف وطاقة شمسية', fr: 'Climatisation & Solaire', en: 'HVAC & Solar Energy', keywords: ['تكييف', 'كليما', 'تبريد', 'طاقة شمسية', 'شمسية', 'climatisation', 'solaire'] },
  { id: 'verrier', dbServiceId: 43, icon: '🪟', ar: 'زجاج ومرايا وواجهات', fr: 'Vitrerie & Façades', en: 'Glass & Glazing', keywords: ['زجاج', 'جاج', 'مرايا', 'سيكوريت', 'vitrerie', 'verre'] },
  { id: 'other', dbServiceId: 37, icon: '➕', ar: 'حرفة أخرى (حددها)', fr: 'Autre Métier (Préciser)', en: 'Other Trade (Specify)', keywords: [] }
];

const translations = {
  ar: {
    portalSubtitle: "بوابة الحرفيين والمقاولين (تسجيل صوتي بالدارجة المغربية أو العربية)",
    tabRegister: "إنشاء حساب جديد",
    tabLogin: "تسجيل الدخول",
    phoneOrEmailLabel: "رقم الهاتف أو البريد الإلكتروني *",
    phoneOrEmailPlace: "0612345678 أو artisan@email.com",
    emailOptionalLabel: "البريد الإلكتروني (اختياري - يكفي رقم الهاتف)",
    passwordOrPinLabel: "الرمز السري (4 أرقام PIN) أو كلمة المرور *",
    pinPlaceholder: "مثال: 2580",
    loginBtn: "تسجيل الدخول الآمن",
    fullNameLabel: "الاسم الكامل أو اسم الورشة *",
    phoneLabel: "رقم الهاتف *",
    cityLabel: "المدينة",
    specialtyLabel: "اختر حرفتك بالصورة (أو اضغط + لإضافة حرفة أخرى) *",
    customSpecialtyPlace: "اكتب أو انطق اسم حرفتك الخاصة (مثال: حفر الآبار، مصاعد، حدائق...)",
    notesLabel: "نبذة عن خبرتك (تُصاغ وتُترجم تلقائياً بالذكاء الاصطناعي)",
    notesPlace: "تعريف قصير بخبرتك ومجال عملك...",
    registerBtn: "إنشاء الحساب والانطلاق فوراً",

    audioGuideBtn: "🔊 استمع للشرح الصوتي",
    audioGuideStop: "⏹️ إيقاف الصوت",
    voiceBoxTitle: "🎙️ التسجيل الصوتي الذكي للمعلم (يفهم الدارجة المغربية والعربية)",
    voiceBoxDesc: "اضغط الميكروفون وتكلم بالدارجة: قل اسمك، مدينتك، حرفتك، ورقم هاتفك، وسنملأ الخانات بلغة سليمة تلقائياً!",
    voiceStartBtn: "اضغط وتكلم بالدارجة أو العربية",
    voiceStopBtn: "جاري الاستماع... تكلم الآن",
    scanCardBtn: "📷 تصوير كارط فيزيت / بطاقة مهنية",
    scanningMsg: "جاري القراءة...",
    voiceLoginHint: "💡 يمكنك كتابة رقم هاتفك أو نطقه عبر الميكروفون، ثم إدخال رمزك السري",
    pinSecurityNote: "🛡️ احفظ هذا الرمز السري (4 أرقام مثل 2580) لتدخل به دائماً مع رقم هاتفك.",
    rateLimitLocked: "🔒 تم قفل الدخول مؤقتاً لحماية حسابك بعد عدة محاولات خاطئة. يرجى المحاولة بعد 15 دقيقة.",

    errPhoneExists: "رقم الهاتف هذا مسجل مسبقاً. يمكنك تسجيل الدخول به مباشرة.",
    errEmailExists: "هذا الحساب مسجل مسبقاً. يرجى تسجيل الدخول.",
    errSelectSpecialty: "يرجى اختيار تخصصك المهني أو كتابة حرفتك.",
    errUnexpected: "حدث خطأ غير متوقع.",
    errInvalidLogin: "رقم الهاتف أو الرمز السري غير صحيح.",
    errNotProvider: "هذا الحساب ليس مسجلاً كحرفي.",
    successRegister: "✅ تم إنشاء حسابك المهني بنجاح! جاري تحويلك للوحة القيادة...",
    successLogin: "✅ تم تسجيل الدخول بنجاح! جاري تحويلك..."
  },
  fr: {
    portalSubtitle: "Portail des Artisans (Inscription Vocale en Darija ou Français)",
    tabRegister: "Créer un compte",
    tabLogin: "Se connecter",
    phoneOrEmailLabel: "Numéro de Téléphone ou Email *",
    phoneOrEmailPlace: "0612345678 ou artisan@email.com",
    emailOptionalLabel: "Email (Optionnel - Le téléphone suffit)",
    passwordOrPinLabel: "Code PIN (4 chiffres) ou Mot de passe *",
    pinPlaceholder: "Ex : 2580",
    loginBtn: "Connexion Sécurisée",
    fullNameLabel: "Nom Complet ou Atelier *",
    phoneLabel: "Téléphone *",
    cityLabel: "Ville",
    specialtyLabel: "Choisissez votre métier (ou + pour un autre métier) *",
    customSpecialtyPlace: "Écrivez ou dictez votre métier spécifique (ex: Forage, Ascenseur...)",
    notesLabel: "Présentation & Expérience (Rédigée et traduite par l'IA)",
    notesPlace: "Courte description de votre savoir-faire...",
    registerBtn: "Créer mon compte maintenant",

    audioGuideBtn: "🔊 Écouter le guide vocal",
    audioGuideStop: "⏹️ Arrêter l'audio",
    voiceBoxTitle: "🎙️ Inscription Vocale IA (Comprend le Darija Marocain & Français)",
    voiceBoxDesc: "Appuyez sur le micro et dites votre nom, ville, métier et téléphone en Darija ou Français !",
    voiceStartBtn: "Appuyez et parlez (Darija / FR)",
    voiceStopBtn: "Écoute en direct... Parlez",
    scanCardBtn: "📷 Scanner Carte de Visite / Pro",
    scanningMsg: "Lecture...",
    voiceLoginHint: "💡 Dictez ou tapez votre numéro de téléphone puis votre code PIN",
    pinSecurityNote: "🛡️ Gardez ce code PIN (4 chiffres ex: 2580) pour vous connecter avec votre téléphone.",
    rateLimitLocked: "🔒 Compte verrouillé temporairement par sécurité. Réessayez dans 15 min.",

    errPhoneExists: "Ce numéro de téléphone est déjà enregistré. Connectez-vous directement.",
    errEmailExists: "Ce compte est déjà utilisé.",
    errSelectSpecialty: "Veuillez sélectionner ou préciser votre spécialité.",
    errUnexpected: "Une erreur est survenue.",
    errInvalidLogin: "Téléphone/Email ou code secret incorrect.",
    errNotProvider: "Ce compte n'est pas un compte artisan.",
    successRegister: "✅ Compte artisan créé avec succès ! Redirection...",
    successLogin: "✅ Connexion réussie ! Redirection..."
  },
  en: {
    portalSubtitle: "Artisans Portal (Smart Darija, Arabic & English Voice Onboarding)",
    tabRegister: "Create New Account",
    tabLogin: "Login",
    phoneOrEmailLabel: "Phone Number or Email *",
    phoneOrEmailPlace: "0612345678 or artisan@email.com",
    emailOptionalLabel: "Email Address (Optional - Phone is enough)",
    passwordOrPinLabel: "Secret PIN (4 digits) or Password *",
    pinPlaceholder: "E.g., 2580",
    loginBtn: "Secure Login",
    fullNameLabel: "Full Name or Workshop *",
    phoneLabel: "Phone Number *",
    cityLabel: "City",
    specialtyLabel: "Select your trade visually (or tap + for another trade) *",
    customSpecialtyPlace: "Type or speak your specific trade (e.g., Well drilling, Elevators...)",
    notesLabel: "Bio & Experience (Auto-generated & translated by AI)",
    notesPlace: "Brief description of your expertise...",
    registerBtn: "Create Account & Start",

    audioGuideBtn: "🔊 Listen to Audio Guide",
    audioGuideStop: "⏹️ Stop Audio",
    voiceBoxTitle: "🎙️ Smart Voice Registration (Understands Moroccan Darija, AR & EN)",
    voiceBoxDesc: "Tap the mic and say your name, city, trade, and phone number. AI translates and fills the rest!",
    voiceStartBtn: "Tap & Speak Now",
    voiceStopBtn: "Listening live... Speak now",
    scanCardBtn: "📷 Scan Business / Pro Card",
    scanningMsg: "Scanning...",
    voiceLoginHint: "💡 Speak or type your phone number and secret PIN",
    pinSecurityNote: "🛡️ Remember this 4-digit PIN (e.g., 2580) to log in anytime with your phone.",
    rateLimitLocked: "🔒 Temporarily locked for security. Wait 15 minutes.",

    errPhoneExists: "This phone number is already registered. Please login.",
    errEmailExists: "This account is already in use.",
    errSelectSpecialty: "Please select or specify your main specialty.",
    errUnexpected: "An unexpected error occurred.",
    errInvalidLogin: "Invalid phone/email or secret PIN.",
    errNotProvider: "This account is not registered as an artisan.",
    successRegister: "✅ Account created successfully! Redirecting...",
    successLogin: "✅ Login successful! Redirecting..."
  }
};

// 🔢 تحويل الأرقام المنطوقة بالدارجة المغربية أو العربية أو الفرنسية إلى أرقام
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
    'تسعة': '9', 'تسعود': '9', 'تسعه': '9', 'neuf': '9', 'nine': '9',
    'عشرة': '10', 'عشره': '10', 'طنعش': '12', 'خمسطاش': '15', 'عشرين': '20'
  };
  Object.keys(wordMap).forEach((w) => {
    const regex = new RegExp(`(^|\\s)${w}(?=\\s|$)`, 'g');
    str = str.replace(regex, ` ${wordMap[w]} `);
  });
  const easternDigits = '٠١٢٣٤٥٦٧٨٩';
  str = str.replace(/[٠-٩]/g, (d) => easternDigits.indexOf(d));
  return str;
};

const resolvePhoneOrEmail = (emailInput, phoneInput = '') => {
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

export default function ProviderAuth() {
  const navigate = useNavigate();
  const { language, setLanguage } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [listeningField, setListeningField] = useState(null);
  const [spokenPreview, setSpokenPreview] = useState('');
  const [isScanningCard, setIsScanningCard] = useState(false);
  const [customSpecialtyText, setCustomSpecialtyText] = useState('');

  const recognitionRef = useRef(null);
  const cloudAudioRef = useRef(null);
  const cardInputRef = useRef(null);

  const [formData, setFormData] = useState({
    loginIdentifier: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: '',
    serviceId: '37',
    notes: '',
    experienceYears: ''
  });

  // 🇲🇦 جعل العربية هي اللغة الافتراضية في أول مصافحة للحرفي
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

  const buildLocalizedNotes = (targetLang, specId, customSpec, cityVal, yearsVal) => {
    const specObj = SERVICE_SPECIALTIES.find((s) => s.id === String(specId)) || SERVICE_SPECIALTIES[0];
    const specLabel =
      specId === 'other' && customSpec
        ? customSpec
        : targetLang === 'ar'
        ? specObj.ar
        : targetLang === 'fr'
        ? specObj.fr
        : specObj.en;

    const localizedCity = matchCityInLang(cityVal, targetLang) || cityVal;

    if (targetLang === 'ar') {
      return `حرفي ومهني معتمد في منصة SasBTP متخصص في (${specLabel})${localizedCity ? ` بمدينة ${localizedCity} والنواحي` : ''}${yearsVal ? `، بخبرة ميدانية تزيد عن ${yearsVal} سنة` : ''}. أضمن للزبناء إتقان العمل، الدقة في المواعيد، وجودة التشطيب.`;
    }
    if (targetLang === 'fr') {
      return `Artisan professionnel vérifié SasBTP spécialisé en (${specLabel})${localizedCity ? ` sur ${localizedCity} et régions` : ''}${yearsVal ? `, avec plus de ${yearsVal} ans d'expérience` : ''}. Travail soigné, respect des délais et garantie de qualité.`;
    }
    return `Verified professional craftsman on SasBTP specializing in (${specLabel})${localizedCity ? ` in ${localizedCity} and surrounding areas` : ''}${yearsVal ? `, with over ${yearsVal} years of experience` : ''}. High-quality workmanship and timely delivery guaranteed.`;
  };

  // 🔄 ترجمة تلقائية للمدينة والنبذة عند تبديل اللغة في الشريط العلوي
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
      const newNotes = prev.notes
        ? buildLocalizedNotes(newLang, prev.serviceId, customSpecialtyText, newCity, prev.experienceYears)
        : '';
      return {
        ...prev,
        city: newCity,
        notes: newNotes
      };
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 6500);
  };

  // ==========================================
  // 🔊 المرشد الصوتي النسائي الموحد لبوابة الحرفيين (عربية + فرنسية سحابية + إنجليزية)
  // ==========================================
  const toggleAudioGuide = () => {
    if (isSpeakingGuide) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (cloudAudioRef.current) {
        cloudAudioRef.current.onended = null;
        cloudAudioRef.current.onerror = null;
        cloudAudioRef.current.pause();
        cloudAudioRef.current.src = '';
        cloudAudioRef.current = null;
      }
      setIsSpeakingGuide(false);
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.onended = null;
      cloudAudioRef.current.onerror = null;
      cloudAudioRef.current.pause();
      cloudAudioRef.current.src = '';
      cloudAudioRef.current = null;
    }

    // 1. الإنجليزية (صوت Samantha النسائي المدمج)
    if (language === 'en' && 'speechSynthesis' in window) {
      const enText = isLogin
        ? 'Welcome to the Artisan Portal. Speak or type your phone number and secret PIN to log in.'
        : 'Welcome to the Artisan Portal. Tap the orange microphone and speak your name, city, trade, and phone number to create your profile automatically.';
      const voices = window.speechSynthesis.getVoices() || [];
      const femaleEnVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('en') &&
            (v.name.includes('Samantha') ||
              v.name.includes('Victoria') ||
              v.name.includes('Karen') ||
              v.name.includes('Ava') ||
              v.name.includes('Moira'))
        ) || voices.find((v) => v.lang.toLowerCase().startsWith('en'));

      const utterance = new SpeechSynthesisUtterance(enText);
      if (femaleEnVoice) {
        utterance.voice = femaleEnVoice;
        utterance.lang = femaleEnVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsSpeakingGuide(false);
      utterance.onerror = () => setIsSpeakingGuide(false);

      setIsSpeakingGuide(true);
      window.speechSynthesis.speak(utterance);
      return;
    }

    // 2. تفعيل درع no-referrer في رأس الصفحة لمنع حظر 403/ORB
    let metaReferrer = document.querySelector('meta[name="referrer"]');
    if (!metaReferrer) {
      metaReferrer = document.createElement('meta');
      metaReferrer.name = 'referrer';
      document.head.appendChild(metaReferrer);
    }
    metaReferrer.content = 'no-referrer';

    // 3. للعربية والفرنسية معاً: تشغيل الصوت النسائي السحابي الشجي مباشرة
    const segments =
      language === 'ar'
        ? isLogin
          ? [
              'مرحباً بك في بوابة الحرفيين بمنصة ساس بي تي بي',
              'للدخول إلى حسابك، اضغط على زر الميكروفون وقل رقم هاتفك',
              'ثم أدخل رمزك السري المكون من أربعة أرقام'
            ]
          : [
              'مرحباً بك في بوابة الحرفيين بمنصة ساس بي تي بي',
              'اضغط على الزر البرتقالي، وتحدث بالدارجة المغربية أو العربية',
              'قل اسمك، ومدينتك، وحرفتك، ورقم هاتفك، وسنملأ حسابك المهني تلقائياً'
            ]
        : isLogin
        ? [
            'Bienvenue sur le portail Artisan SasBTP.',
            'Dictez ou tapez votre numéro de téléphone et votre code PIN pour vous connecter.'
          ]
        : [
            'Bienvenue sur le portail Artisan SasBTP.',
            'Appuyez sur le bouton orange, et dites votre nom, votre ville, votre métier et votre numéro de téléphone.'
          ];

    const targetLang = language === 'ar' ? 'ar' : 'fr';

    const player = new Audio();
    player.preload = 'auto';
    cloudAudioRef.current = player;
    setIsSpeakingGuide(true);

    let currentIdx = 0;
    let isStopped = false;

    const origPause = player.pause.bind(player);
    player.pause = () => {
      isStopped = true;
      origPause();
    };

    const playSegment = () => {
      if (isStopped || currentIdx >= segments.length) {
        setIsSpeakingGuide(false);
        cloudAudioRef.current = null;
        return;
      }

      const textChunk = segments[currentIdx];
      currentIdx += 1;
      const encoded = encodeURIComponent(textChunk);

      const endpoints = [
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${targetLang}&q=${encoded}`,
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encoded}`,
        `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encoded}`
      ];

      let epIdx = 0;

      const tryCurrentEndpoint = () => {
        if (isStopped) return;
        if (epIdx >= endpoints.length) {
          playSegment();
          return;
        }

        const url = endpoints[epIdx];
        epIdx += 1;
        let settled = false;

        player.onended = () => {
          if (settled || isStopped) return;
          settled = true;
          playSegment();
        };

        player.onerror = () => {
          if (settled || isStopped) return;
          settled = true;
          tryCurrentEndpoint();
        };

        player.src = url;
        player.playbackRate = language === 'fr' ? 1.05 : 1.0;

        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (settled || isStopped) return;
            settled = true;
            tryCurrentEndpoint();
          });
        }
      };

      tryCurrentEndpoint();
    };

    playSegment();
  };

  // ==========================================
  // 🧠 2. فهم الدارجة المغربية وتحويلها لبيانات سليمة
  // ==========================================
  const parseArtisanSpeech = (rawSpeech) => {
    const normalized = convertSpokenWordsToDigits(rawSpeech);
    const lower = normalized.toLowerCase();

    const compactDigits = normalized.replace(/[\s\-./]/g, '');
    const phoneMatch = compactDigits.match(/(?:00212|\+212|212|0)([567]\d{8})/);
    const detectedPhone = phoneMatch ? `0${phoneMatch[1]}` : '';

    const detectedCity = matchCityInLang(normalized, language) || '';

    let matchedServiceId = formData.serviceId || '37';
    for (const sp of SERVICE_SPECIALTIES) {
      if (sp.id === 'other') continue;
      if (sp.keywords.some((k) => lower.includes(k))) {
        matchedServiceId = sp.id;
        break;
      }
    }

    const expMatch = normalized.match(/(\d{1,2})\s*(?:سنة|سنه|سنين|سنوات|عام|أعوام|ans|an|years)/i);
    const detectedYears = expMatch ? expMatch[1] : '';

    let detectedName = '';
    const namePatterns = [
      /(?:أنا|انا|اسمي|إسمي|سميتي|معكم)\s+(?:المعلم\s+|الشاف\s+|الحاج\s+)?([أ-يa-zA-Z]+(?:\s+[أ-يa-zA-Z]+){0,2})/i,
      /(?:المعلم|الشاف)\s+([أ-يa-zA-Z]+(?:\s+[أ-يa-zA-Z]+){0,1})/i,
      /(?:je suis|je m'appelle|moi c'est)\s+([a-zA-ZÀ-ÿ]+(?:\s+[a-zA-ZÀ-ÿ]+){0,2})/i
    ];
    for (const pat of namePatterns) {
      const m = rawSpeech.match(pat);
      if (m && m[1]) {
        detectedName = m[1]
          .replace(/\b(من|في|ف|مدينة|مدينه|معلم|بلومبي|تريسيان|بناي|صباغ|نجار|زلايجي|جباس|عزل|حداد|de|à)\b.*/i, '')
          .trim();
        break;
      }
    }

    const finalCity = detectedCity || formData.city;
    const finalYears = detectedYears || formData.experienceYears;
    const autoComposedNotes = buildLocalizedNotes(language, matchedServiceId, customSpecialtyText, finalCity, finalYears);

    setFormData((prev) => ({
      ...prev,
      fullName: detectedName || prev.fullName,
      phone: detectedPhone || prev.phone,
      city: finalCity,
      serviceId: matchedServiceId,
      experienceYears: finalYears,
      notes: autoComposedNotes
    }));
  };

  // ==========================================
  // 🎙️ 3. الميكروفون الفوري الموثوق (يدعم الدارجة المغربية ويكتب لحظياً)
  // ==========================================
  const toggleVoiceInput = (target = 'smartAll') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showAlert('error', language === 'ar' ? 'يرجى فتح المنصة عبر متصفح Chrome أو Safari لتشغيل الميكروفون الصوتي.' : 'Veuillez utiliser Chrome ou Safari pour la commande vocale.');
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
            parseArtisanSpeech(clean);
          } else if (target === 'customSpecialty') {
            setCustomSpecialtyText(clean);
            setFormData((prev) => ({
              ...prev,
              notes: buildLocalizedNotes(language, 'other', clean, prev.city, prev.experienceYears)
            }));
          } else if (target === 'loginIdentifier' || target === 'phone') {
            const digits = convertSpokenWordsToDigits(clean).replace(/\D/g, '');
            setFormData((prev) => ({
              ...prev,
              [target]: digits || clean
            }));
          } else if (target === 'password') {
            const digits = convertSpokenWordsToDigits(clean).replace(/\s+/g, '');
            setFormData((prev) => ({ ...prev, password: digits }));
          } else if (target === 'fullName') {
            setFormData((prev) => ({ ...prev, fullName: clean.replace(/^(أنا|انا|اسمي|سميتي)\s+/i, '') }));
          } else if (target === 'city') {
            const matched = matchCityInLang(clean, language) || clean;
            setFormData((prev) => ({
              ...prev,
              city: matched,
              notes: buildLocalizedNotes(language, prev.serviceId, customSpecialtyText, matched, prev.experienceYears)
            }));
          } else if (target === 'notes') {
            setFormData((prev) => ({ ...prev, notes: clean }));
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
  // 📷 4. مسح البطاقة المهنية أو الكارط فيزيت بالكاميرا
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
        parseArtisanSpeech(detectedText);
        showAlert('success', language === 'ar' ? '✅ تم قراءة البطاقة المهنية وملء الخانات تلقائياً!' : '✅ Carte professionnelle lue avec succès !');
      } else {
        const fallbackBio = buildLocalizedNotes(language, formData.serviceId, customSpecialtyText, formData.city, formData.experienceYears);
        setFormData((prev) => ({
          ...prev,
          notes: prev.notes || fallbackBio
        }));
        showAlert(
          'success',
          language === 'ar'
            ? '📷 تم إرفاق البطاقة وتجهيز نبذتك المهنية! يرجى التأكد من الاسم ورقم الهاتف.'
            : '📷 Carte jointe et présentation préparée ! Vérifiez votre nom et téléphone.'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningCard(false);
    }
  };

  const isAccountLocked = (key) => {
    try {
      const raw = localStorage.getItem(`sasbtp_provider_lock_${key}`);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.until && Date.now() < data.until) return true;
      localStorage.removeItem(`sasbtp_provider_lock_${key}`);
      return false;
    } catch (e) {
      return false;
    }
  };

  const recordFailedLogin = (key) => {
    try {
      const raw = localStorage.getItem(`sasbtp_provider_lock_${key}`);
      const data = raw ? JSON.parse(raw) : { count: 0, until: null };
      data.count += 1;
      if (data.count >= 5) data.until = Date.now() + 15 * 60 * 1000;
      localStorage.setItem(`sasbtp_provider_lock_${key}`, JSON.stringify(data));
    } catch (e) {}
  };

  // ==========================================
  // 🚀 5. معالجة إنشاء حساب الحرفي
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.serviceId || (formData.serviceId === 'other' && !customSpecialtyText.trim())) {
      return showAlert('error', t.errSelectSpecialty);
    }

    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      const cleanPhone = convertSpokenWordsToDigits(formData.phone).replace(/\D/g, '') || formData.phone.trim();

      const { data: existingPhone } = await supabase
        .from('providers')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (existingPhone) throw new Error(t.errPhoneExists);

      const effectiveEmail = resolvePhoneOrEmail(formData.email, cleanPhone);
      const effectivePassword = wrapSecretPin(formData.password);

      const specObj = SERVICE_SPECIALTIES.find((s) => s.id === String(formData.serviceId)) || SERVICE_SPECIALTIES[0];
      const specTitle =
        formData.serviceId === 'other' && customSpecialtyText.trim()
          ? customSpecialtyText.trim()
          : language === 'ar'
          ? specObj.ar
          : language === 'fr'
          ? specObj.fr
          : specObj.en;

      const finalBio =
        formData.notes.trim() ||
        buildLocalizedNotes(language, formData.serviceId, customSpecialtyText, formData.city, formData.experienceYears);

      const providerProfileMeta = {
        full_name: formData.fullName.trim(),
        city: formData.city.trim() || 'غير محددة',
        phone: cleanPhone,
        bio_text: finalBio,
        experience_text: specTitle + (formData.experienceYears ? ` (${formData.experienceYears} سنوات خبرة)` : ''),
        terms_text: '',
        quick_info: ''
      };

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: effectiveEmail,
        password: effectivePassword,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: cleanPhone,
            city: formData.city.trim(),
            role: 'provider',
            account_type: 'provider',
            specialty: specTitle,
            provider_profile: providerProfileMeta
          }
        }
      });

      if (authError) throw authError;
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        throw new Error(t.errEmailExists);
      }

      const uid = authData.user.id;
      localStorage.setItem(`sasbtp_provider_profile_${uid}`, JSON.stringify(providerProfileMeta));

      let newProvider = null;
      const fullInsertRes = await supabase
        .from('providers')
        .insert([{
          user_id: uid,
          full_name: formData.fullName.trim(),
          phone: cleanPhone,
          city: formData.city.trim() || 'غير محددة',
          bio_text: finalBio,
          experience_text: providerProfileMeta.experience_text,
          account_type: 'marketplace'
        }])
        .select()
        .maybeSingle();

      if (fullInsertRes.error) {
        const minimalInsertRes = await supabase
          .from('providers')
          .insert([{
            user_id: uid,
            full_name: formData.fullName.trim(),
            phone: cleanPhone,
            account_type: 'marketplace'
          }])
          .select()
          .single();

        if (minimalInsertRes.error) throw minimalInsertRes.error;
        newProvider = minimalInsertRes.data;
      } else {
        newProvider = fullInsertRes.data;
      }

      if (newProvider?.id && specObj?.dbServiceId) {
        await supabase
          .from('provider_services')
          .insert([{
            provider_id: newProvider.id,
            service_id: specObj.dbServiceId
          }])
          .catch(() => {});
      }

      if (uid) {
        await bindReferralOnSignup(uid);
      }

      sessionStorage.setItem('sasbtp_v2_role', 'provider');
      showAlert('success', t.successRegister);
      setTimeout(() => navigate('/v2/provider-dashboard'), 1500);
    } catch (err) {
      showAlert('error', err.message || t.errUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🔑 6. معالجة تسجيل الدخول
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    const effectiveEmail = resolvePhoneOrEmail(formData.loginIdentifier || formData.email);
    if (!effectiveEmail) {
      setIsLoading(false);
      return showAlert('error', t.errInvalidLogin);
    }

    if (isAccountLocked(effectiveEmail)) {
      setIsLoading(false);
      return showAlert('error', t.rateLimitLocked);
    }

    try {
      const rawSecret = formData.password.trim();
      const wrappedSecret = wrapSecretPin(rawSecret);

      let authRes = await supabase.auth.signInWithPassword({
        email: effectiveEmail,
        password: wrappedSecret
      });

      if (authRes.error && wrappedSecret !== rawSecret && rawSecret.length >= 6) {
        authRes = await supabase.auth.signInWithPassword({
          email: effectiveEmail,
          password: rawSecret
        });
      }

      if (authRes.error) {
        recordFailedLogin(effectiveEmail);
        throw new Error(t.errInvalidLogin);
      }

      localStorage.removeItem(`sasbtp_provider_lock_${effectiveEmail}`);

      const user = authRes.data?.user;
      const role = user?.user_metadata?.role || user?.user_metadata?.account_type;

      if (role !== 'provider') {
        const { data: provRow } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!provRow) {
          await supabase.auth.signOut();
          throw new Error(t.errNotProvider);
        }
      }

      sessionStorage.setItem('sasbtp_v2_role', 'provider');
      showAlert('success', t.successLogin);
      setTimeout(() => navigate('/v2/provider-dashboard'), 1200);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: '#f3f4f6',
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] overflow-hidden border border-slate-200 my-6">
        
        {/* 🌐 شريط تبديل اللغة البارز في أعلى واجهة الحرفي */}
        <div className="bg-slate-950 px-6 py-3 flex items-center justify-between border-b border-slate-800">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-300">
            <Globe className="w-4 h-4 text-orange-400" />
            {language === 'ar' ? 'اختر اللغة:' : language === 'fr' ? 'Langue :' : 'Language:'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectLanguage('ar')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                language === 'ar' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇲🇦 العربية
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage('fr')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                language === 'fr' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                language === 'en' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>

        {/* الترويسة + زر المرشد الصوتي الناطق */}
        <div className="bg-slate-900 p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Darija & Voice AI
              </span>

              <button
                type="button"
                onClick={toggleAudioGuide}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
                  isSpeakingGuide
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                {isSpeakingGuide ? t.audioGuideStop : t.audioGuideBtn}
              </button>
            </div>

            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3 transform rotate-3">
              <HardHat className="w-8 h-8 text-white -rotate-3" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1 tracking-wide">SasBTP PRO</h1>
            <p className="text-slate-300 text-xs md:text-sm font-bold">{t.portalSubtitle}</p>
          </div>
        </div>

        {/* تبويبات: إنشاء حساب / تسجيل الدخول */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setIsLogin(false); setAlert({ show: false, type: '', text: '' }); }}
            className={`flex-1 py-4 text-sm font-black transition-colors cursor-pointer ${
              !isLogin ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t.tabRegister}
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setAlert({ show: false, type: '', text: '' }); }}
            className={`flex-1 py-4 text-sm font-black transition-colors cursor-pointer ${
              isLogin ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t.tabLogin}
          </button>
        </div>

        <div className="p-6 md:p-8">
          {alert.show && (
            <div className={`p-4 rounded-xl mb-6 font-bold flex items-start gap-3 border text-sm ${
              alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <span>{alert.text}</span>
            </div>
          )}

          {isLogin ? (
            /* =================== 🔑 فورم تسجيل الدخول =================== */
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between gap-2">
                <span>{t.voiceLoginHint}</span>
                <Mic className="w-4 h-4 text-blue-600 shrink-0" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.phoneOrEmailLabel}</label>
                <div className="relative flex items-center">
                  <Phone className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="loginIdentifier"
                    required
                    value={formData.loginIdentifier}
                    onChange={handleChange}
                    className="w-full p-3.5 pl-11 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-bold text-slate-800"
                    dir="ltr"
                    placeholder={t.phoneOrEmailPlace}
                  />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('loginIdentifier')}
                    className={`absolute right-2.5 p-2 rounded-lg transition-all cursor-pointer ${
                      listeningField === 'loginIdentifier'
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                    }`}
                  >
                    {listeningField === 'loginIdentifier' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.passwordOrPinLabel}</label>
                <div className="relative flex items-center">
                  <KeyRound className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3.5 pl-11 pr-20 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-black tracking-widest text-slate-800"
                    dir="ltr"
                    placeholder="••••"
                  />
                  <div className="absolute right-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVoiceInput('password')}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        listeningField === 'password'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                      }`}
                    >
                      {listeningField === 'password' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-base shadow-[0_5px_15px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />}
                {t.loginBtn}
              </button>
            </form>
          ) : (
            /* =================== 🎙️ فورم إنشاء حساب حرفي جديد =================== */
            <div className="space-y-5">
              
              {/* 1. صندوق الملء الصوتي الذكي بالدارجة ومسح البطاقة المهنية */}
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 rounded-2xl p-4 shadow-sm">
                <h3 className="font-black text-orange-900 text-sm mb-1">{t.voiceBoxTitle}</h3>
                <p className="text-xs font-bold text-orange-800/85 leading-relaxed mb-3">{t.voiceBoxDesc}</p>

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
                    className="py-3 px-4 rounded-xl font-black text-xs bg-white hover:bg-slate-50 text-slate-800 border border-orange-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    {isScanningCard ? <Loader2 className="w-4 h-4 animate-spin text-orange-600" /> : <Camera className="w-4 h-4 text-orange-600" />}
                    <span>{isScanningCard ? t.scanningMsg : t.scanCardBtn}</span>
                  </button>
                </div>

                {spokenPreview && (
                  <div className="mt-3 p-2.5 bg-white rounded-xl border border-orange-200 text-xs font-bold text-slate-700">
                    🗣️ &ldquo;{spokenPreview}&rdquo;
                  </div>
                )}
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* 2. اختيار التخصص بالصور والأيقونات الكبيرة + خيار حرفة أخرى */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2">{t.specialtyLabel}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {SERVICE_SPECIALTIES.map((sp) => {
                      const active = String(formData.serviceId) === sp.id;
                      const labelText = language === 'ar' ? sp.ar : language === 'fr' ? sp.fr : sp.en;
                      return (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              serviceId: sp.id,
                              notes: sp.id !== 'other' ? buildLocalizedNotes(language, sp.id, customSpecialtyText, prev.city, prev.experienceYears) : prev.notes
                            }));
                          }}
                          className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                            active
                              ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-sm scale-[1.02]'
                              : sp.id === 'other'
                              ? 'border-dashed border-indigo-400 bg-indigo-50/60 text-indigo-900'
                              : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
                          }`}
                        >
                          <span className="text-2xl mb-1">{sp.icon}</span>
                          <span className="text-[11px] font-black leading-tight">{labelText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* حقل إدخال الحرفة المخصصة لمن لم يجد حرفته في الأيقونات */}
                  {formData.serviceId === 'other' && (
                    <div className="mt-2 relative flex items-center animate-fade-in">
                      <input
                        type="text"
                        value={customSpecialtyText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomSpecialtyText(val);
                          setFormData((prev) => ({
                            ...prev,
                            notes: buildLocalizedNotes(language, 'other', val, prev.city, prev.experienceYears)
                          }));
                        }}
                        placeholder={t.customSpecialtyPlace}
                        className="w-full p-3 bg-indigo-50/50 border-2 border-indigo-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVoiceInput('customSpecialty')}
                        className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-1.5 rounded-lg cursor-pointer ${
                          listeningField === 'customSpecialty' ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. الاسم، الهاتف، والمدينة */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.fullNameLabel}</label>
                    <div className="relative flex items-center">
                      <User className={`w-4 h-4 absolute text-slate-400 pointer-events-none ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm font-bold text-slate-800 ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleVoiceInput('fullName')}
                        className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-1.5 rounded-lg cursor-pointer ${
                          listeningField === 'fullName' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.phoneLabel}</label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="06..."
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-3 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm font-bold text-slate-800"
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

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.cityLabel}</label>
                    <div className="relative flex items-center">
                      <MapPin className={`w-4 h-4 absolute text-slate-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`} />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm font-bold text-slate-800 ${isRtl ? 'pr-9 pl-9' : 'pl-9 pr-9'}`}
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

                  {/* 4. الرمز السري PIN (4 أرقام) أو كلمة المرور */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.passwordOrPinLabel}</label>
                    <div className="relative flex items-center">
                      <KeyRound className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        name="password"
                        required
                        minLength="4"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t.pinPlaceholder}
                        className="w-full p-3 pl-10 pr-20 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm font-black tracking-widest text-slate-800"
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
                            listeningField === 'password' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">{t.pinSecurityNote}</p>
                  </div>

                  {/* 5. البريد الإلكتروني (اختياري) */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">{t.emailOptionalLabel}</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="artisan@email.com"
                        className="w-full p-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-medium"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* 6. النبذة والملاحظات المهنية */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" /> {t.notesLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleVoiceInput('notes')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                          listeningField === 'notes' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        <Mic className="w-3 h-3" /> {language === 'ar' ? 'تحدث' : language === 'fr' ? 'Dicter' : 'Speak'}
                      </button>
                    </label>
                    <textarea
                      name="notes"
                      rows="2"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder={t.notesPlace}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-medium text-slate-700 resize-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-base shadow-[0_5px_15px_rgba(234,88,12,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <HardHat className="w-5 h-5" />}
                  {t.registerBtn}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}