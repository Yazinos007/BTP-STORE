import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { 
  User, Eye, Save, Star, MapPin, Phone, CheckCircle2, AlertCircle, 
  Info, Briefcase, FileText, Clock, X, ShieldCheck, HardHat, Image,
  MessageCircle, Award, Check, Sparkles, Mic, MicOff, Volume2, Camera, Wand2
} from 'lucide-react';

const MOROCCAN_CITIES = [
  "الدار البيضاء - Casablanca",
  "الرباط - Rabat",
  "مراكش - Marrakech",
  "طنجة - Tanger",
  "فاس - Fès",
  "أكادير - Agadir",
  "مكناس - Meknès",
  "وجدة - Oujda",
  "القنيطرة - Kénitra",
  "تطوان - Tétouan",
  "بني ملال - Béni Mellal",
  "قصبة تادلة - Kasbah Tadla",
  "خنيفرة - Khénifra",
  "خريبكة - Khouribga",
  "المحمدية - Mohammedia",
  "الجديدة - El Jadida",
  "آسفي - Safi",
  "الناظور - Nador",
  "العيون - Laâyoune",
  "ورزازات - Ouarzazate"
];

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

// 🛠️ التخصصات البصرية السريعة للحرفي
const VISUAL_TRADES = [
  { id: 'macon', icon: '🧱', ar: 'بناي / أعمال البناء', fr: 'Maçon / Gros Œuvres', en: 'Mason / Construction', keywords: ['بناي', 'بناء', 'ضالة', 'ياجور', 'maçon', 'macon', 'construction'] },
  { id: 'plombier', icon: '🚰', ar: 'بلومبي / سباكة وترصيص', fr: 'Plombier / Sanitaire', en: 'Plumber / Sanitary', keywords: ['بلومبي', 'سباك', 'سباكة', 'رصاص', 'ماء', 'قوادس', 'plombier', 'plomberie'] },
  { id: 'electricien', icon: '⚡', ar: 'تريسيان / كهرباء البناء', fr: 'Électricien Bâtiment', en: 'Electrician', keywords: ['تريسيان', 'كهربائي', 'كهرباء', 'ضو', 'ضوء', 'électricien', 'electricien'] },
  { id: 'peintre', icon: '🎨', ar: 'صباغ / ديكور وواجهات', fr: 'Peintre & Décoration', en: 'Painter & Decor', keywords: ['صباغ', 'صباغة', 'صباغه', 'دهان', 'peintre', 'peinture'] },
  { id: 'carreleur', icon: '⬜', ar: 'زلايجي / رخام وسيراميك', fr: 'Carreleur & Marbre', en: 'Tiler & Marble', keywords: ['زلايجي', 'زليج', 'رخام', 'سيراميك', 'carreleur', 'carrelage', 'zellige'] },
  { id: 'platrier', icon: '🏛️', ar: 'جباس / أسقف وديكور جبس', fr: 'Plâtrier & Faux Plafond', en: 'Plaster & Ceiling', keywords: ['جباس', 'جبس', 'قبص', 'بلافو', 'plâtrier', 'platrier', 'plâtre'] },
  { id: 'menuisier', icon: '🪵', ar: 'نجار خشب وألمنيوم', fr: 'Menuisier Bois & Alu', en: 'Wood & Alu Carpenter', keywords: ['نجار', 'خشب', 'ألمنيوم', 'المنيوم', 'menuisier', 'aluminium'] },
  { id: 'etancheite', icon: '🛡️', ar: 'عزل وإيتانشيتي', fr: 'Étanchéité & Isolation', en: 'Waterproofing', keywords: ['عزل', 'ايتانشيتي', 'إيتانشيتي', 'étanchéité', 'isolation'] }
];

// ⚡ أزرار جاهزة للشروط والمعلومات السريعة بلمسة واحدة
const QUICK_CHIPS = {
  terms: [
    { icon: '📋', ar: 'معاينة الورش وتقديم Devis مجاني داخل المدينة.', fr: 'Visite de chantier et devis gratuit en ville.', en: 'Free site visit and quote within the city.' },
    { icon: '💳', ar: 'الدفع على 3 دفعات حسب تقدم الأشغال في الورش.', fr: 'Paiement en 3 tranches selon l\'avancement des travaux.', en: 'Payment in 3 stages according to work progress.' },
    { icon: '🛡️', ar: 'ضمان شامل على جودة العمل واحترام تام للمواعيد المتفق عليها.', fr: 'Garantie sur la qualité des travaux et respect strict des délais.', en: 'Full quality guarantee and strict adherence to deadlines.' },
    { icon: '🧱', ar: 'إمكانية العمل بالسلعة واليد أو باليد العاملة فقط حسب رغبة الزبون.', fr: 'Possibilité de travailler avec fourniture et pose ou main-d\'œuvre seule.', en: 'Available for material + labor or labor only.' }
  ],
  quick: [
    { icon: '⏰', ar: 'متاح للعمل طيلة أيام الأسبوع من 8:00 صباحاً إلى 18:00 مساءً.', fr: 'Disponible toute la semaine de 8h00 à 18h00.', en: 'Available all week from 8:00 AM to 6:00 PM.' },
    { icon: '🚗', ar: 'أتنقل لجميع الأحياء والمدن المجاورة لإنجاز الأوراش.', fr: 'Déplacement dans tous les quartiers et villes voisines.', en: 'Available to travel to all neighborhoods and nearby cities.' },
    { icon: '💰', ar: 'أقبل الدفع نقداً (كاش)، تحويل بنكي، أو شيك.', fr: 'Paiement accepté : Espèces, virement bancaire ou chèque.', en: 'Accepts cash, bank transfer, or check.' }
  ]
};

const translations = {
  ar: {
    pageTitle: "ملفي الشخصي وإعدادات العرض",
    previewBtn: "معاينة صفحة الزبون (Vitrine)",
    basicInfoTitle: "معلومات الحساب الأساسية (قابلة للتعديل)",
    fullName: "الاسم الكامل أو اسم الورشة",
    fullNamePlace: "أدخل اسمك الكامل أو اسم ورشتك...",
    city: "المدينة",
    cityPlace: "اختر أو اكتب اسم مدينتك...",
    phone: "رقم الهاتف / واتساب",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "التقييم العام",
    ratingNote: "(يُحتسب تلقائياً من آراء الزبناء)",
    readonlyNote: "* يمكنك تعديل اسمك، مدينتك، ورقم هاتفك في أي وقت بالكتابة أو بالصوت ثم الضغط على زر الحفظ.",
    publicSettingsTitle: "تفاصيل العرض للزبناء",
    bioLabel: "1. نبذة عنك وعن خدماتك",
    bioPlace: "تحدث عن نفسك، متى بدأت، وما الذي يميز عملك...",
    expLabel: "2. الخبرة والمجالات الدقيقة",
    expPlace: "مثال: خبرة 10 سنوات، متخصص في الفيلات الفاخرة...",
    termsLabel: "3. الشروط وطريقة العمل",
    termsPlace: "مثال: الدفع على 3 مراحل، المعاينة مجانية داخل المدينة...",
    quickLabel: "4. أوقات العمل ومعلومات سريعة",
    quickPlace: "مثال: متاح من 8 لـ 6 مساءً، أقبل الدفع كاش أو تحويل...",
    saveBtn: "حفظ جميع التعديلات وتحديث ملفي",
    savingBtn: "جاري الحفظ...",
    successMsg: "تم الحفظ بنجاح! تم تحديث بياناتك الأساسية وملفك العام للزوار.",
    errorMsg: "حدث خطأ أثناء حفظ البيانات.",
    previewModalBadge: "صفحتك التسويقية كما يراها الزبناء في المنصة",
    verifiedArtisan: "حرفي موثق SasBTP",
    unspecifiedCity: "المغرب (مدينة غير محددة)",
    tabOverview: "بطاقة الحرفي والخدمات",
    aboutSectionTitle: "نبذة تعريفية عن الحرفي",
    expSectionTitle: "الخبرة والتخصصات الميدانية",
    termsSectionTitle: "شروط العمل والضمانات",
    quickSectionTitle: "التوافر ومعلومات التواصل",
    emptySection: "لم يقم الحرفي بإضافة تفاصيل في هذا القسم بعد.",
    callBtn: "اتصال مباشر",
    whatsappBtn: "مراسلة واتساب",
    managePortfolioBtn: "إدارة معرض أعمالي (Portfolio)",
    closePreviewBtn: "إغلاق المعاينة",
    // نصوص المساعد الصوتي والبصري الذكي
    audioGuideBtn: "🔊 استمع للشرح الصوتي",
    audioGuideStop: "⏹️ إيقاف الصوت",
    voiceBannerTitle: "🎙️ المساعد الصوتي الذكي لملء الملف بالكامل (بدون كتابة)",
    voiceBannerDesc: "اضغط على الميكروفون وتحدث بعفوية: قل اسمك، مدينتك، حرفتك، سنوات خبرتك، وشروط عملك، وسيقوم الذكاء الاصطناعي بملء الخانات وصياغتها بلغة احترافية!",
    voiceStartAllBtn: "اضغط وتحدث لملء ملفك",
    voiceListeningBtn: "جاري الاستماع... تحدث الآن (اضغط للإيقاف)",
    scanCardBtn: "📷 مسح كارط فيزيت / بطاقة مهنية",
    scanningCardMsg: "جاري القراءة...",
    aiPolishBtn: "✨ تحسين الصياغة بالذكاء الاصطناعي",
    aiPolishSuccess: "✨ تمت صياغة ملفك المهني بلغة احترافية وجذابة للزبناء! اضغط حفظ لاعتمادها.",
    visualTradeTitle: "⚡ أو اختر حرفتك بلمسة واحدة لتوليد نبذتك تلقائياً:",
    quickTapHint: "➕ اضغط لإضافة جملة جاهزة:",
    micFieldLabel: "تحدث"
  },
  fr: {
    pageTitle: "Mon Profil et Paramètres d'Affichage",
    previewBtn: "Aperçu Vitrine Client",
    basicInfoTitle: "Informations de Base (Modifiables)",
    fullName: "Nom Complet / Nom d'Atelier",
    fullNamePlace: "Entrez votre nom complet ou nom d'atelier...",
    city: "Ville d'activité",
    cityPlace: "Sélectionnez ou tapez votre ville...",
    phone: "Numéro de Téléphone / WhatsApp",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "Évaluation Globale",
    ratingNote: "(Calculée automatiquement selon les avis)",
    readonlyNote: "* Vous pouvez modifier votre nom, votre ville et votre téléphone à tout moment par écrit ou par la voix.",
    publicSettingsTitle: "Détails de Présentation Publique",
    bioLabel: "1. À propos de vous et de vos services",
    bioPlace: "Parlez de vous, quand avez-vous commencé, qu'est-ce qui vous distingue...",
    expLabel: "2. Expérience et Spécialités",
    expPlace: "Ex : 10 ans d'expérience, spécialiste des villas de luxe...",
    termsLabel: "3. Conditions et Méthode de travail",
    termsPlace: "Ex : Paiement en 3 tranches, devis gratuit en ville...",
    quickLabel: "4. Horaires et Informations Rapides",
    quickPlace: "Ex : Disponible de 8h à 18h, accepte espèces ou virement...",
    saveBtn: "Enregistrer toutes les modifications",
    savingBtn: "Enregistrement...",
    successMsg: "Enregistré avec succès ! Vos informations de base et votre vitrine publique ont été mises à jour.",
    errorMsg: "Une erreur est survenue lors de l'enregistrement.",
    previewModalBadge: "Votre Vitrine Publique telle que vue par les clients",
    verifiedArtisan: "Artisan Vérifié SasBTP",
    unspecifiedCity: "Maroc (Ville non spécifiée)",
    tabOverview: "Présentation & Compétences",
    aboutSectionTitle: "Présentation de l'Artisan",
    expSectionTitle: "Expérience & Domaines d'Expertise",
    termsSectionTitle: "Conditions d'Intervention & Garanties",
    quickSectionTitle: "Disponibilité & Infos Pratiques",
    emptySection: "Aucune information renseignée dans cette rubrique pour le moment.",
    callBtn: "Appeler",
    whatsappBtn: "WhatsApp",
    managePortfolioBtn: "Gérer Mon Portfolio",
    closePreviewBtn: "Fermer la vitrine",
    audioGuideBtn: "🔊 Écouter le guide vocal",
    audioGuideStop: "⏹️ Arrêter l'audio",
    voiceBannerTitle: "🎙️ Assistant Vocal IA — Remplissez votre profil sans écrire",
    voiceBannerDesc: "Appuyez sur le micro et dites votre nom, ville, métier, années d'expérience et conditions. L'IA rédige votre profil professionnel !",
    voiceStartAllBtn: "Appuyez et parlez maintenant",
    voiceListeningBtn: "Écoute en cours... Parlez",
    scanCardBtn: "📷 Scanner Carte de Visite / Pro",
    scanningCardMsg: "Lecture en cours...",
    aiPolishBtn: "✨ Reformuler professionnellement avec l'IA",
    aiPolishSuccess: "✨ Votre profil a été rédigé de manière professionnelle ! Cliquez sur Enregistrer.",
    visualTradeTitle: "⚡ Ou touchez votre métier en image pour générer votre texte :",
    quickTapHint: "➕ Touchez pour ajouter :",
    micFieldLabel: "Dicter"
  },
  en: {
    pageTitle: "My Profile and Display Settings",
    previewBtn: "Client Showcase Preview",
    basicInfoTitle: "Basic Account Info (Editable)",
    fullName: "Full Name / Workshop Name",
    fullNamePlace: "Enter your full name or workshop name...",
    city: "City",
    cityPlace: "Select or type your city...",
    phone: "Phone / WhatsApp Number",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "Overall Rating",
    ratingNote: "(Automatically linked to client reviews)",
    readonlyNote: "* You can update your name, city, and phone number anytime via voice or text and click save.",
    publicSettingsTitle: "Public Showcase Details",
    bioLabel: "1. About you and your services",
    bioPlace: "Talk about yourself, when you started, what makes you unique...",
    expLabel: "2. Experience and Specialties",
    expPlace: "E.g., 10 years experience, specializing in luxury villas...",
    termsLabel: "3. Terms and Work Method",
    termsPlace: "E.g., Payment in 3 stages, free inspection within the city...",
    quickLabel: "4. Working Hours & Quick Info",
    quickPlace: "E.g., Available 8 AM - 6 PM, accept cash or transfer...",
    saveBtn: "Save All Changes",
    savingBtn: "Saving...",
    successMsg: "Saved successfully! Your basic info and public profile are now updated.",
    errorMsg: "An error occurred while saving.",
    previewModalBadge: "Your Public Showcase as seen by clients",
    verifiedArtisan: "Verified SasBTP Artisan",
    unspecifiedCity: "Morocco (City not specified)",
    tabOverview: "Overview & Skills",
    aboutSectionTitle: "About the Artisan",
    expSectionTitle: "Experience & Core Specialties",
    termsSectionTitle: "Work Terms & Guarantees",
    quickSectionTitle: "Availability & Quick Facts",
    emptySection: "No details added to this section yet.",
    callBtn: "Call Now",
    whatsappBtn: "WhatsApp",
    managePortfolioBtn: "Manage My Portfolio",
    closePreviewBtn: "Close Preview",
    audioGuideBtn: "🔊 Listen to Audio Guide",
    audioGuideStop: "⏹️ Stop Audio",
    voiceBannerTitle: "🎙️ Smart AI Voice Assistant — Fill your profile without typing",
    voiceBannerDesc: "Tap the mic and speak your name, city, trade, years of experience, and work terms. AI will write your profile!",
    voiceStartAllBtn: "Tap & Speak Now",
    voiceListeningBtn: "Listening... Speak now",
    scanCardBtn: "📷 Scan Business / Pro Card",
    scanningCardMsg: "Scanning...",
    aiPolishBtn: "✨ Polish Text with AI",
    aiPolishSuccess: "✨ Your profile has been professionally formatted! Click Save.",
    visualTradeTitle: "⚡ Or tap your trade visually to auto-generate your bio:",
    quickTapHint: "➕ Tap to insert:",
    micFieldLabel: "Speak"
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

export default function ProviderProfile() {
  const { language = 'ar' } = useSettingsStore();
  const navigate = useNavigate();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [userId, setUserId] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [dbColumns, setDbColumns] = useState([]);

  const [basicInfo, setBasicInfo] = useState({ full_name: '', city: '', phone: '', rating: 0 });
  const [formData, setFormData] = useState({ bio_text: '', experience_text: '', terms_text: '', quick_info: '' });
  const [selectedVisualTrade, setSelectedVisualTrade] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ show: false, type: '', text: '' });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // حالات الصوت والمسح البصري
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [listeningField, setListeningField] = useState(null);
  const [spokenPreview, setSpokenPreview] = useState('');
  const [isScanningCard, setIsScanningCard] = useState(false);

  const recognitionRef = useRef(null);
  const cardInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // جلب البيانات من قاعدة البيانات + metadata المستخدم عند التحميل
  useEffect(() => {
    const fetchProviderData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const metaProfile = user.user_metadata?.provider_profile || {};
      let localProfile = {};
      try {
        const savedLocal = localStorage.getItem(`sasbtp_provider_profile_${user.id}`);
        if (savedLocal) localProfile = JSON.parse(savedLocal);
      } catch (e) {}

      const { data } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProviderId(data.id);
        setDbColumns(Object.keys(data));

        const rawCity = data.city || metaProfile.city || user.user_metadata?.city || localProfile.city || '';
        const cleanCity = rawCity === 'غير محددة' ? '' : rawCity;

        setBasicInfo({
          full_name: data.full_name || metaProfile.full_name || user.user_metadata?.full_name || localProfile.full_name || '',
          city: cleanCity,
          phone: data.phone || metaProfile.phone || user.user_metadata?.phone || localProfile.phone || '',
          rating: data.rating ?? metaProfile.rating ?? 0
        });

        setFormData({
          bio_text: data.bio_text || metaProfile.bio_text || localProfile.bio_text || '',
          experience_text: data.experience_text || metaProfile.experience_text || localProfile.experience_text || '',
          terms_text: data.terms_text || metaProfile.terms_text || localProfile.terms_text || '',
          quick_info: data.quick_info || metaProfile.quick_info || localProfile.quick_info || ''
        });
      } else {
        setBasicInfo({
          full_name: metaProfile.full_name || user.user_metadata?.full_name || user.user_metadata?.company_name || localProfile.full_name || '',
          city: metaProfile.city || user.user_metadata?.city || localProfile.city || '',
          phone: metaProfile.phone || user.user_metadata?.phone || localProfile.phone || '',
          rating: 0
        });
        setFormData({
          bio_text: metaProfile.bio_text || localProfile.bio_text || '',
          experience_text: metaProfile.experience_text || localProfile.experience_text || '',
          terms_text: metaProfile.terms_text || localProfile.terms_text || '',
          quick_info: metaProfile.quick_info || localProfile.quick_info || ''
        });
      }
    };

    fetchProviderData();
  }, []);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // 🔊 1. المرشد الصوتي الناطق لصفحة إعدادات الحرفي
  // ==========================================
  const toggleAudioGuide = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingGuide) {
      window.speechSynthesis.cancel();
      setIsSpeakingGuide(false);
      return;
    }

    window.speechSynthesis.cancel();
    const speechText =
      language === 'ar'
        ? 'مرحباً بك يا معلم في صفحة ملفك المهني. يمكنك الضغط على الزر البرتقالي والتحدث بعفوية عن اسمك، مدينتك، حرفتك، وخبرتك، وسنقوم بكتابة وتنسيق جميع الخانات لك تلقائياً، أو يمكنك الضغط على صورة حرفتك بالأسفل.'
        : language === 'fr'
        ? 'Bienvenue sur votre profil professionnel. Appuyez sur le microphone orange et parlez de votre métier, votre ville et votre expérience. Notre intelligence artificielle rédigera votre fiche automatiquement.'
        : 'Welcome to your professional profile. Tap the orange microphone and speak about your trade, city, and experience, and our AI will format your profile automatically.';

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = 0.94;
    utterance.onend = () => setIsSpeakingGuide(false);
    utterance.onerror = () => setIsSpeakingGuide(false);

    setIsSpeakingGuide(true);
    window.speechSynthesis.speak(utterance);
  };

  // ==========================================
  // 🧠 2. التحليل الذكي لكلام الحرفي وتوزيعه على البطاقتين والأقسام الأربعة
  // ==========================================
  const parseSmartProfileSpeech = (rawSpeech) => {
    const normalized = convertSpokenWordsToDigits(rawSpeech);
    const lower = normalized.toLowerCase();

    // أ) التقاط الهاتف إن ذكره
    const compactDigits = normalized.replace(/[\s\-./]/g, '');
    const phoneMatch = compactDigits.match(/(?:00212|\+212|212|0)([567]\d{8})/);
    const detectedPhone = phoneMatch ? `0${phoneMatch[1]}` : '';

    // ب) التقاط المدينة
    let detectedCity = '';
    for (const c of MOROCCAN_CITIES_MAP) {
      if (c.keywords.some((k) => lower.includes(k))) {
        detectedCity = c.label;
        break;
      }
    }

    // ج) التقاط التخصص المهني
    let detectedTrade = VISUAL_TRADES.find((vt) => vt.id === selectedVisualTrade) || null;
    for (const vt of VISUAL_TRADES) {
      if (vt.keywords.some((k) => lower.includes(k))) {
        detectedTrade = vt;
        setSelectedVisualTrade(vt.id);
        break;
      }
    }

    // د) التقاط سنوات الخبرة
    const expMatch = normalized.match(/(\d{1,2})\s*(?:سنة|سنه|سنين|سنوات|عام|أعوام|ans|an|years)/i);
    const detectedYears = expMatch ? expMatch[1] : '';

    // هـ) التقاط الاسم
    let detectedName = '';
    const namePatterns = [
      /(?:أنا|انا|اسمي|إسمي|سميتي|معكم)\s+(?:المعلم\s+|الشاف\s+|الحاج\s+)?([أ-يa-zA-Z]+(?:\s+[أ-يa-zA-Z]+){0,2})/i,
      /(?:je suis|je m'appelle|moi c'est)\s+([a-zA-ZÀ-ÿ]+(?:\s+[a-zA-ZÀ-ÿ]+){0,2})/i
    ];
    for (const pat of namePatterns) {
      const m = rawSpeech.match(pat);
      if (m && m[1]) {
        detectedName = m[1]
          .replace(/\b(من|في|مدينة|مدينه|معلم|بلومبي|تريسيان|بناي|صباغ|نجار|زلايجي|جباس|عزل|de|à)\b.*/i, '')
          .trim();
        break;
      }
    }

    const finalName = detectedName || basicInfo.full_name || (language === 'ar' ? 'المعلم' : 'Artisan Pro');
    const finalCity = detectedCity || basicInfo.city || '';
    const cityClean = finalCity ? finalCity.split(' - ')[language === 'ar' ? 0 : 1] || finalCity : '';
    const tradeLabel = detectedTrade
      ? (language === 'ar' ? detectedTrade.ar : language === 'fr' ? detectedTrade.fr : detectedTrade.en)
      : (language === 'ar' ? 'الأشغال العامة والبناء' : 'Travaux BTP & Rénovation');

    // و) صياغة الأقسام الأربعة بلغة احترافية سليمة
    const composedBio =
      language === 'ar'
        ? `${finalName}، حرفي ومهني معتمد في منصة SasBTP متخصص في (${tradeLabel})${cityClean ? ` بمدينة ${cityClean} والنواحي` : ''}. أحرص على تقديم خدمات عالية الجودة، إتقان تام في التشطيب، ومواكبة الزبون من بداية الورش حتى التسليم النهائي.`
        : `${finalName}, artisan professionnel vérifié sur SasBTP spécialisé en ${tradeLabel}${cityClean ? ` à ${cityClean} et régions` : ''}. Travail soigné, finitions irréprochables et accompagnement complet de votre chantier.`;

    const composedExp =
      language === 'ar'
        ? `خبرة ميدانية واسعة${detectedYears ? ` تزيد عن ${detectedYears} سنة` : ''} في مجال (${tradeLabel}). تنفيذ مشاريع السكن، الفيلات، الشقق، والمحلات التجارية وفق المعايير الفنية المعتمدة.`
        : `Solide expérience terrain${detectedYears ? ` de plus de ${detectedYears} ans` : ''} en ${tradeLabel}. Réalisation de projets résidentiels, villas, appartements et locaux professionnels.`;

    const composedTerms =
      language === 'ar'
        ? `• معاينة الورش وتقديم عرض السعر (Devis) بشفافية تامة.\n• الدفع على دفعات مرحلية حسب تقدم الأشغال في الورش.\n• التزام تام بمواعيد التسليم ونظافة الورش وجودة المواد.`
        : `• Visite de chantier et devis détaillé transparent.\n• Paiement échelonné selon l'avancement des travaux.\n• Respect strict des délais convenus et garantie de qualité.`;

    const composedQuick =
      language === 'ar'
        ? `• متاح للعمل طيلة أيام الأسبوع من 8:00 صباحاً إلى 18:00 مساءً.\n• إمكانية التنقل داخل ${cityClean || 'المدينة'} والمناطق المجاورة.\n• قبول الدفع نقداً (كاش)، تحويل بنكي، أو شيك.`
        : `• Disponible du Lundi au Samedi de 8h00 à 18h00.\n• Intervention sur ${cityClean || 'toute la ville'} et alentours.\n• Paiement accepté : Espèces, virement ou chèque.`;

    setBasicInfo((prev) => ({
      ...prev,
      full_name: detectedName || prev.full_name,
      city: detectedCity || prev.city,
      phone: detectedPhone || prev.phone
    }));

    setFormData({
      bio_text: composedBio,
      experience_text: composedExp,
      terms_text: composedTerms,
      quick_info: composedQuick
    });
  };

  // ==========================================
  // ⚡ 3. التوليد الفوري عند اختيار بطاقة الحرفة بالصورة أو تحسين الصياغة بالذكاء الاصطناعي
  // ==========================================
  const handleSelectVisualTrade = (tradeObj) => {
    setSelectedVisualTrade(tradeObj.id);
    const tradeName = language === 'ar' ? tradeObj.ar : language === 'fr' ? tradeObj.fr : tradeObj.en;
    const cityShort = basicInfo.city ? basicInfo.city.split(' - ')[language === 'ar' ? 0 : 1] || basicInfo.city : '';
    const artisanName = basicInfo.full_name || (language === 'ar' ? 'حرفي معتمد' : 'Artisan Pro');

    setFormData((prev) => ({
      bio_text:
        language === 'ar'
          ? `${artisanName}، متخصص في (${tradeName})${cityShort ? ` بمدينة ${cityShort}` : ''}. نقدم خدمات احترافية متكاملة للأفراد والمقاولات بجودة عالية وإتقان مضمون.`
          : `${artisanName}, spécialiste en ${tradeName}${cityShort ? ` sur ${cityShort}` : ''}. Prestations professionnelles de haute qualité pour particuliers et entreprises.`,
      experience_text:
        language === 'ar'
          ? `خبرة ميدانية متميزة في جميع أشغال (${tradeName})، من التأسيس والتركيب إلى التشطيب النهائي والصيانة.`
          : `Expérience confirmée dans tous les travaux de ${tradeName}, de l'installation aux finitions.`,
      terms_text: prev.terms_text || (language === 'ar' ? QUICK_CHIPS.terms[0].ar + '\n' + QUICK_CHIPS.terms[1].ar : QUICK_CHIPS.terms[0].fr + '\n' + QUICK_CHIPS.terms[1].fr),
      quick_info: prev.quick_info || (language === 'ar' ? QUICK_CHIPS.quick[0].ar + '\n' + QUICK_CHIPS.quick[2].ar : QUICK_CHIPS.quick[0].fr + '\n' + QUICK_CHIPS.quick[2].fr)
    }));
  };

  const handleAiPolishAll = () => {
    const combinedRaw = `${basicInfo.full_name} ${basicInfo.city} ${formData.bio_text} ${formData.experience_text}`;
    parseSmartProfileSpeech(combinedRaw);
    setAlertMsg({ show: true, type: 'success', text: t.aiPolishSuccess });
    setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 5000);
  };

  const appendQuickChip = (field, textValue) => {
    setFormData((prev) => {
      const current = (prev[field] || '').trim();
      if (current.includes(textValue)) return prev;
      return {
        ...prev,
        [field]: current ? `${current}\n• ${textValue}` : `• ${textValue}`
      };
    });
  };

  // ==========================================
  // 🎙️ 4. تشغيل الميكروفون (الشامل أو لحقل محدد)
  // ==========================================
  const toggleVoiceInput = (target = 'smartAll') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAlertMsg({
        show: true,
        type: 'error',
        text: language === 'ar' ? 'يرجى استخدام متصفح Chrome أو Safari لتشغيل الميكروفون الصوتي.' : 'Veuillez utiliser Chrome ou Safari pour la commande vocale.'
      });
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
        parseSmartProfileSpeech(transcript);
      } else if (target === 'full_name') {
        setBasicInfo((prev) => ({ ...prev, full_name: transcript.trim() }));
      } else if (target === 'city') {
        let matchedCity = transcript.trim();
        for (const c of MOROCCAN_CITIES_MAP) {
          if (c.keywords.some((k) => transcript.toLowerCase().includes(k))) {
            matchedCity = c.label;
            break;
          }
        }
        setBasicInfo((prev) => ({ ...prev, city: matchedCity }));
      } else if (target === 'phone') {
        const digits = convertSpokenWordsToDigits(transcript).replace(/\D/g, '');
        setBasicInfo((prev) => ({ ...prev, phone: digits || transcript.trim() }));
      } else if (['bio_text', 'experience_text', 'terms_text', 'quick_info'].includes(target)) {
        setFormData((prev) => ({
          ...prev,
          [target]: prev[target] ? `${prev[target].trim()} ${transcript.trim()}` : transcript.trim()
        }));
      }
    };

    recognition.onerror = () => setListeningField(null);
    recognition.onend = () => setListeningField(null);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ==========================================
  // 📷 5. مسح الكارط فيزيت / البطاقة المهنية بالكاميرا
  // ==========================================
  const handleCardScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningCard(true);
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
        parseSmartProfileSpeech(detectedText);
      } else {
        handleAiPolishAll();
      }
      setAlertMsg({ show: true, type: 'success', text: t.aiPolishSuccess });
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningCard(false);
      setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 5000);
    }
  };

  // ==========================================
  // 💾 6. حفظ جميع التعديلات في Supabase بدون أخطاء 400
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setAlertMsg({ show: false, type: '', text: '' });

    const fullPayload = {
      full_name: basicInfo.full_name.trim(),
      city: basicInfo.city.trim() || 'غير محددة',
      phone: basicInfo.phone.trim(),
      bio_text: formData.bio_text.trim(),
      experience_text: formData.experience_text.trim(),
      terms_text: formData.terms_text.trim(),
      quick_info: formData.quick_info.trim()
    };

    try {
      // 1. حفظ نسخة محلية فورية
      localStorage.setItem(`sasbtp_provider_profile_${userId}`, JSON.stringify(fullPayload));

      // 2. حفظ سحابي مضمون في Supabase Auth Metadata لجميع الحقول
      await supabase.auth.updateUser({
        data: {
          full_name: fullPayload.full_name,
          phone: fullPayload.phone,
          city: fullPayload.city,
          provider_profile: fullPayload
        }
      });

      // 3. تحديث جدول providers بالأعمدة الموجودة فعلياً فقط لتجنب خطأ 400 Bad Request
      if (providerId) {
        const safeTableUpdate = {};
        Object.keys(fullPayload).forEach((key) => {
          if (dbColumns.length === 0 || dbColumns.includes(key)) {
            safeTableUpdate[key] = fullPayload[key];
          }
        });

        if (dbColumns.includes('updated_at')) {
          safeTableUpdate.updated_at = new Date().toISOString();
        }

        if (Object.keys(safeTableUpdate).length > 0) {
          const { error: tableErr } = await supabase
            .from('providers')
            .update(safeTableUpdate)
            .eq('id', providerId);

          if (tableErr) {
            await supabase
              .from('providers')
              .update({
                full_name: fullPayload.full_name,
                phone: fullPayload.phone
              })
              .eq('id', providerId);
          }
        }
      } else {
        const { data: inserted } = await supabase
          .from('providers')
          .insert([{
            user_id: userId,
            full_name: fullPayload.full_name,
            phone: fullPayload.phone,
            account_type: 'marketplace'
          }])
          .select('*')
          .maybeSingle();

        if (inserted) {
          setProviderId(inserted.id);
          setDbColumns(Object.keys(inserted));
        }
      }

      setAlertMsg({ show: true, type: 'success', text: t.successMsg });
    } catch (err) {
      console.error('Save provider profile warning:', err);
      setAlertMsg({ show: true, type: 'error', text: t.errorMsg });
    } finally {
      setIsSaving(false);
      setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 5000);
    }
  };

  const displayCity = basicInfo.city && basicInfo.city !== 'غير محددة' ? basicInfo.city : t.unspecifiedCity;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🌟 الترويسة العلوية + زر المرشد الصوتي الناطق + زر معاينة Vitrine */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
          <User className="text-blue-600 w-7 h-7" />
          {t.pageTitle}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={toggleAudioGuide}
            className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer border ${
              isSpeakingGuide
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-md'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {isSpeakingGuide ? t.audioGuideStop : t.audioGuideBtn}
          </button>

          <button 
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            {t.previewBtn}
          </button>
        </div>
      </div>

      {/* 🎙️ شريط المساعد الصوتي الذكي ومسح البطاقة المهنية واختيار التخصص بالصور */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base md:text-lg font-black text-orange-950 flex items-center gap-2">
              {t.voiceBannerTitle}
            </h2>
            <p className="text-xs md:text-sm font-bold text-orange-900/80 leading-relaxed">
              {t.voiceBannerDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => toggleVoiceInput('smartAll')}
              className={`px-5 py-3 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                listeningField === 'smartAll'
                  ? 'bg-red-600 text-white animate-pulse shadow-red-500/40'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white'
              }`}
            >
              {listeningField === 'smartAll' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{listeningField === 'smartAll' ? t.voiceListeningBtn : t.voiceStartAllBtn}</span>
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
              className="px-4 py-3 rounded-xl font-black text-xs md:text-sm bg-white hover:bg-slate-50 text-slate-800 border border-orange-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Camera className="w-4 h-4 text-orange-600" />
              <span>{isScanningCard ? t.scanningCardMsg : t.scanCardBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleAiPolishAll}
              className="px-4 py-3 rounded-xl font-black text-xs md:text-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Wand2 className="w-4 h-4" />
              <span>{t.aiPolishBtn}</span>
            </button>
          </div>
        </div>

        {spokenPreview && (
          <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs font-bold text-slate-700">
            🗣️ &ldquo;{spokenPreview}&rdquo;
          </div>
        )}

        {/* اختيار التخصص بالصور والأيقونات لتوليد النبذة بلمسة واحدة */}
        <div className="pt-2 border-t border-orange-200/70">
          <p className="text-xs font-black text-orange-950 mb-2.5">{t.visualTradeTitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {VISUAL_TRADES.map((vt) => {
              const active = selectedVisualTrade === vt.id;
              return (
                <button
                  key={vt.id}
                  type="button"
                  onClick={() => handleSelectVisualTrade(vt)}
                  className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    active
                      ? 'border-orange-600 bg-orange-100 text-orange-950 shadow-sm scale-[1.03]'
                      : 'border-white bg-white/90 hover:bg-white text-slate-700 hover:border-orange-300'
                  }`}
                >
                  <span className="text-2xl mb-1">{vt.icon}</span>
                  <span className="text-[11px] font-black leading-tight">
                    {language === 'ar' ? vt.ar : language === 'fr' ? vt.fr : vt.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ⚠️ تنبيهات الحفظ */}
      {alertMsg.show && (
        <div className={`p-5 rounded-xl mb-6 flex items-start gap-3 border animate-fade-in ${alertMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />}
          <div>
            <strong className="block text-base mb-1">{alertMsg.type === 'success' ? '✅ ' + t.successMsg.split('!')[0] + '!' : '❌ خطأ'}</strong>
            <span className="text-sm opacity-90">{alertMsg.type === 'success' ? (alertMsg.text.includes('!') ? alertMsg.text.split('!')[1] || alertMsg.text : alertMsg.text) : alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* 📦 نموذج موحد يحفظ البطاقتين معاً */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* 📌 البطاقة الأولى: إعدادات الملف العام (مع ميكروفون لكل قسم) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 order-2 lg:order-1 space-y-6">
          <h3 className="text-xl font-black text-blue-900 mb-2 border-b-2 border-indigo-100 pb-3 flex items-center gap-2">
            ✍️ {t.publicSettingsTitle}
          </h3>

          {/* 1. نبذة عنك وعن خدماتك */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-orange-500" /> {t.bioLabel}
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('bio_text')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  listeningField === 'bio_text'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                }`}
              >
                {listeningField === 'bio_text' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {t.micFieldLabel}
              </button>
            </div>
            <textarea 
              name="bio_text"
              rows="4" 
              value={formData.bio_text}
              onChange={handleChange}
              placeholder={t.bioPlace}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-y text-sm font-medium text-slate-700"
            />
          </div>

          {/* 2. الخبرة والمجالات الدقيقة */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-orange-500" /> {t.expLabel}
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('experience_text')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  listeningField === 'experience_text'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                }`}
              >
                {listeningField === 'experience_text' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {t.micFieldLabel}
              </button>
            </div>
            <textarea 
              name="experience_text"
              rows="3" 
              value={formData.experience_text}
              onChange={handleChange}
              placeholder={t.expPlace}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-y text-sm font-medium text-slate-700"
            />
          </div>

          {/* 3. الشروط وطريقة العمل + أزرار بصرية جاهزة */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-orange-500" /> {t.termsLabel}
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('terms_text')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  listeningField === 'terms_text'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                }`}
              >
                {listeningField === 'terms_text' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {t.micFieldLabel}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] font-bold text-slate-400">{t.quickTapHint}</span>
              {QUICK_CHIPS.terms.map((chip, idx) => {
                const textVal = language === 'ar' ? chip.ar : language === 'fr' ? chip.fr : chip.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => appendQuickChip('terms_text', textVal)}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-orange-50 hover:text-orange-800 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {chip.icon} {textVal}
                  </button>
                );
              })}
            </div>

            <textarea 
              name="terms_text"
              rows="3" 
              value={formData.terms_text}
              onChange={handleChange}
              placeholder={t.termsPlace}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-y text-sm font-medium text-slate-700"
            />
          </div>

          {/* 4. أوقات العمل ومعلومات سريعة + أزرار بصرية جاهزة */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-500" /> {t.quickLabel}
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('quick_info')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  listeningField === 'quick_info'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                }`}
              >
                {listeningField === 'quick_info' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {t.micFieldLabel}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] font-bold text-slate-400">{t.quickTapHint}</span>
              {QUICK_CHIPS.quick.map((chip, idx) => {
                const textVal = language === 'ar' ? chip.ar : language === 'fr' ? chip.fr : chip.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => appendQuickChip('quick_info', textVal)}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-orange-50 hover:text-orange-800 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {chip.icon} {textVal}
                  </button>
                );
              })}
            </div>

            <textarea 
              name="quick_info"
              rows="3" 
              value={formData.quick_info}
              onChange={handleChange}
              placeholder={t.quickPlace}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-y text-sm font-medium text-slate-700"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-lg shadow-[0_4px_15px_rgba(234,88,12,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            <Save className="w-5 h-5" />
            {isSaving ? t.savingBtn : t.saveBtn}
          </button>
        </div>

        {/* ========================================================= */}
        {/* 🔓 البطاقة الثانية: معلومات الحساب الأساسية (مع ميكروفون لكل حقل) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 order-1 lg:order-2">
          <h3 className="text-lg font-black text-blue-900 mb-6 border-b-2 border-slate-100 pb-3 flex items-center gap-2">
            📌 {t.basicInfoTitle}
          </h3>
          
          <div className="space-y-5">
            {/* تعديل الاسم الكامل بالكتابة أو الصوت */}
            <div>
              <label className="block font-bold text-slate-700 text-sm mb-1.5">{t.fullName}</label>
              <div className="relative flex items-center">
                <User className={`w-4 h-4 text-blue-600 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none`} />
                <input
                  type="text"
                  name="full_name"
                  value={basicInfo.full_name}
                  onChange={handleBasicChange}
                  placeholder={t.fullNamePlace}
                  className={`w-full py-3.5 ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput('full_name')}
                  className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} p-1.5 rounded-lg cursor-pointer ${
                    listeningField === 'full_name' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/80 text-slate-700 hover:bg-orange-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* تعديل أو اختيار المدينة بالكتابة أو الصوت */}
            <div>
              <label className="block font-bold text-slate-700 text-sm mb-1.5">{t.city}</label>
              <div className="relative flex items-center">
                <MapPin className={`w-4 h-4 text-orange-500 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none`} />
                <input
                  type="text"
                  name="city"
                  list="moroccan-cities-list"
                  value={basicInfo.city}
                  onChange={handleBasicChange}
                  placeholder={t.cityPlace}
                  className={`w-full py-3.5 ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput('city')}
                  className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} p-1.5 rounded-lg cursor-pointer ${
                    listeningField === 'city' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/80 text-slate-700 hover:bg-orange-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <datalist id="moroccan-cities-list">
                  {MOROCCAN_CITIES.map((c, idx) => (
                    <option key={idx} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* تعديل رقم الهاتف بالكتابة أو الصوت */}
            <div>
              <label className="block font-bold text-slate-700 text-sm mb-1.5">{t.phone}</label>
              <div className="relative flex items-center" dir="ltr">
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  value={basicInfo.phone}
                  onChange={handleBasicChange}
                  placeholder={t.phonePlace}
                  className="w-full py-3.5 pl-10 pr-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-right focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput('phone')}
                  className={`absolute right-2.5 p-1.5 rounded-lg cursor-pointer ${
                    listeningField === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/80 text-slate-700 hover:bg-orange-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* التقييم العام */}
            <div>
              <label className="block font-bold text-slate-500 text-sm mb-1.5">{t.rating}</label>
              <div className="w-full p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                <Star className="w-6 h-6 text-orange-500 fill-current" />
                <span className="text-xl font-black text-orange-600">{Number(basicInfo.rating).toFixed(1)}</span>
                <span className="text-xs text-orange-800 font-bold">{t.ratingNote}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-md transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isSaving ? t.savingBtn : t.saveBtn}
            </button>
          </div>

          <p className="text-xs text-slate-500 font-semibold mt-4 text-center leading-relaxed">
            {t.readonlyNote}
          </p>
        </div>

      </form>

      {/* ========================================================= */}
      {/* 🌟 واجهة الزبون الحقيقية (Vitrine Client Publique) */}
      {/* ========================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl my-auto animate-fade-in text-white">
            
            {/* غلاف بطاقة الحرفي الاحترافية */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 border-b border-slate-800 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-2 mb-6">
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.previewModalBadge}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-4xl flex items-center justify-center shadow-xl border-2 border-white/20 shrink-0">
                    {basicInfo.full_name ? basicInfo.full_name.charAt(0).toUpperCase() : <HardHat className="w-12 h-12" />}
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        {basicInfo.full_name || 'SasBTP Artisan'}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <ShieldCheck className="w-4 h-4" />
                        {t.verifiedArtisan}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-sm font-bold text-slate-200">
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                        <MapPin className="w-4 h-4 text-orange-400" /> {displayCity}
                      </span>
                      {basicInfo.phone && (
                        <span className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700" dir="ltr">
                          <Phone className="w-4 h-4 text-emerald-400" /> {basicInfo.phone}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/30">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {Number(basicInfo.rating).toFixed(1)} / 5.0
                      </span>
                    </div>
                  </div>
                </div>

                {basicInfo.phone && (
                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href={`tel:${basicInfo.phone}`}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      {t.callBtn}
                    </a>
                    <a
                      href={`https://wa.me/${basicInfo.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t.whatsappBtn}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* محتوى بطاقة الزبون */}
            <div className="p-6 md:p-8 max-h-[55vh] overflow-y-auto bg-slate-900 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
                  <h4 className="font-black text-amber-400 text-sm mb-2.5 flex items-center gap-2">
                    <Award className="w-4 h-4" /> {t.aboutSectionTitle}
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {formData.bio_text ? formData.bio_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                  </p>
                </div>

                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
                  <h4 className="font-black text-blue-400 text-sm mb-2.5 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> {t.expSectionTitle}
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {formData.experience_text ? formData.experience_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
                  <h4 className="font-black text-emerald-400 text-sm mb-2.5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> {t.termsSectionTitle}
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {formData.terms_text ? formData.terms_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                  </p>
                </div>

                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
                  <h4 className="font-black text-purple-400 text-sm mb-2.5 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {t.quickSectionTitle}
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {formData.quick_info ? formData.quick_info : <span className="text-slate-400 italic">{t.emptySection}</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* شريط الأزرار السفلي */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  navigate('/v2/provider-portfolio');
                }}
                className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Image className="w-4 h-4" />
                {t.managePortfolioBtn}
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-black text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                {t.closePreviewBtn}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}