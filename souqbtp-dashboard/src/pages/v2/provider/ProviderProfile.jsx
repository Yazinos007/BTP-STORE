import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { 
  User, Eye, Save, Star, MapPin, Phone, CheckCircle2, AlertCircle, 
  Info, Briefcase, FileText, Clock, X, ShieldCheck, HardHat, Image,
  MessageCircle, Award, Check, Sparkles, Mic, MicOff, Volume2, Camera, Wand2, PlusCircle
} from 'lucide-react';

// 🏙️ خريطة المدن المغربية متعددة اللغات للترجمة التلقائية والالتقاط بالدارجة
const MOROCCAN_CITIES_DATA = [
  { id: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca', en: 'Casablanca', keywords: ['الدار البيضاء', 'كازا', 'دار البيضاء', 'casablanca', 'casa'] },
  { id: 'rabat', ar: 'الرباط', fr: 'Rabat', en: 'Rabat', keywords: ['الرباط', 'رباط', 'rabat'] },
  { id: 'marrakech', ar: 'مراكش', fr: 'Marrakech', en: 'Marrakech', keywords: ['مراكش', 'مراكش الحمراء', 'marrakech', 'marrakesh'] },
  { id: 'tanger', ar: 'طنجة', fr: 'Tanger', en: 'Tangier', keywords: ['طنجة', 'طنجه', 'tanger', 'tangier'] },
  { id: 'fes', ar: 'فاس', fr: 'Fès', en: 'Fes', keywords: ['فاس', 'fes', 'fès'] },
  { id: 'agadir', ar: 'أكادير', fr: 'Agadir', en: 'Agadir', keywords: ['أكادير', 'اكادير', 'agadir'] },
  { id: 'meknes', ar: 'مكناس', fr: 'Meknès', en: 'Meknes', keywords: ['مكناس', 'meknes', 'meknès'] },
  { id: 'oujda', ar: 'وجدة', fr: 'Oujda', en: 'Oujda', keywords: ['وجدة', 'وجده', 'oujda'] },
  { id: 'kenitra', ar: 'القنيطرة', fr: 'Kénitra', en: 'Kenitra', keywords: ['القنيطرة', 'قنيطرة', 'قنيطره', 'kenitra', 'kénitra'] },
  { id: 'tetouan', ar: 'تطوان', fr: 'Tétouan', en: 'Tetouan', keywords: ['تطوان', 'تطوان', 'tetouan', 'tétouan'] },
  { id: 'beni_mellal', ar: 'بني ملال', fr: 'Béni Mellal', en: 'Beni Mellal', keywords: ['بني ملال', 'بنيملال', 'beni mellal', 'béni mellal'] },
  { id: 'kasbah_tadla', ar: 'قصبة تادلة', fr: 'Kasbah Tadla', en: 'Kasbah Tadla', keywords: ['قصبة تادلة', 'تادلة', 'تادلا', 'قصبه تادله', 'kasbah tadla', 'tadla'] },
  { id: 'khenifra', ar: 'خنيفرة', fr: 'Khénifra', en: 'Khenifra', keywords: ['خنيفرة', 'خنيفره', 'khenifra', 'khénifra'] },
  { id: 'khouribga', ar: 'خريبكة', fr: 'Khouribga', en: 'Khouribga', keywords: ['خريبكة', 'خريبكه', 'khouribga'] },
  { id: 'mohammedia', ar: 'المحمدية', fr: 'Mohammedia', en: 'Mohammedia', keywords: ['المحمدية', 'محمدية', 'mohammedia'] },
  { id: 'el_jadida', ar: 'الجديدة', fr: 'El Jadida', en: 'El Jadida', keywords: ['الجديدة', 'جديدة', 'مازاغان', 'el jadida', 'jadida'] },
  { id: 'safi', ar: 'آسفي', fr: 'Safi', en: 'Safi', keywords: ['آسفي', 'اسفي', 'safi'] },
  { id: 'nador', ar: 'الناظور', fr: 'Nador', en: 'Nador', keywords: ['الناظور', 'ناظور', 'nador'] },
  { id: 'laayoune', ar: 'العيون', fr: 'Laâyoune', en: 'Laayoune', keywords: ['العيون', 'العيون', 'laayoune', 'laâyoune'] },
  { id: 'ouarzazate', ar: 'ورزازات', fr: 'Ouarzazate', en: 'Ouarzazate', keywords: ['ورزازات', 'وارزازات', 'ouarzazate'] }
];

// 🛠️ موسوعة الحرف والتخصصات (مع كلمات الدارجة المغربية) + خيار "حرفة أخرى"
const VISUAL_TRADES = [
  { id: 'macon', icon: '🧱', ar: 'بناي / أعمال البناء الكبرى', fr: 'Maçon / Gros Œuvres', en: 'Mason / General Construction', keywords: ['بناي', 'بناء', 'ضالة', 'ياجور', 'طوب', 'حفر', 'اساسات', 'أساسات', 'مرطوب', 'بيطون', 'bennay', 'maçon', 'macon', 'construction', 'dalla'] },
  { id: 'plombier', icon: '🚰', ar: 'بلومبي / سباكة وترصيص', fr: 'Plombier / Sanitaire', en: 'Plumber / Sanitary Installations', keywords: ['بلومبي', 'بلومبيي', 'سباك', 'سباكة', 'رصاص', 'ماء', 'قوادس', 'سانيتير', 'حمامات', 'شوفو', 'plombier', 'plomberie', 'sanitaire', 'plumber'] },
  { id: 'electricien', icon: '⚡', ar: 'تريسيان / كهرباء البناء', fr: 'Électricien Bâtiment', en: 'Building Electrician', keywords: ['تريسيان', 'تريسيان', 'كهربائي', 'كهرباء', 'ضو', 'الضو', 'ضوء', 'كابلات', 'إنارة', 'طابلو', 'tricien', 'électricien', 'electricien', 'electrician'] },
  { id: 'peintre', icon: '🎨', ar: 'صباغ / ديكور وواجهات', fr: 'Peintre & Décoration', en: 'Painter & Interior Decor', keywords: ['صباغ', 'صباغة', 'صباغه', 'دهان', 'خيال', 'ستيكو', 'عنبره', 'فاصاد', 'sebbagh', 'peintre', 'peinture', 'painter'] },
  { id: 'carreleur', icon: '⬜', ar: 'زلايجي / رخام وسيراميك', fr: 'Carreleur & Marbre', en: 'Tiler & Marble Specialist', keywords: ['زلايجي', 'زليج', 'رخام', 'سيراميك', 'فايونص', 'بورسلين', 'درج', 'zlayji', 'carreleur', 'carrelage', 'zellige', 'marbre'] },
  { id: 'platrier', icon: '🏛️', ar: 'جباس / أسقف وديكور جبس', fr: 'Plâtrier & Faux Plafond', en: 'Plaster & False Ceiling', keywords: ['جباس', 'جبس', 'قبص', 'بلافو', 'فو بلافو', 'باكيت', 'نقش', 'gebbas', 'plâtrier', 'platrier', 'plâtre', 'plafond'] },
  { id: 'menuisier', icon: '🪵', ar: 'نجار خشب وألمنيوم', fr: 'Menuisier Bois & Aluminium', en: 'Wood & Aluminum Carpenter', keywords: ['نجار', 'نجارة', 'خشب', 'ألمنيوم', 'المنيوم', 'بيبان', 'شراجم', 'كوزينة', 'ريدو', 'neggar', 'menuisier', 'aluminium', 'bois'] },
  { id: 'ferronnier', icon: '🔩', ar: 'حداد / تلحيم وهياكل حديدية', fr: 'Ferronnier & Soudure', en: 'Blacksmith & Metal Welder', keywords: ['حداد', 'سودور', 'تلحيم', 'حديد', 'شباك', 'كراجات', 'سدة', 'soudeur', 'ferronnier', 'soudure', 'welder'] },
  { id: 'etancheite', icon: '🛡️', ar: 'عزل مائي وحراري (إيتانشيتي)', fr: 'Étanchéité & Isolation', en: 'Waterproofing & Insulation', keywords: ['عزل', 'ايتانشيتي', 'إيتانشيتي', 'زفت', 'سطح', 'قطرة', 'برودة', 'étanchéité', 'etancheite', 'isolation'] },
  { id: 'clim_solaire', icon: '☀️', ar: 'تكييف، تبريد وطاقة شمسية', fr: 'Climatisation & Énergie Solaire', en: 'HVAC & Solar Energy', keywords: ['كليما', 'تكييف', 'تبريد', 'طاقة شمسية', 'بانو', 'شمسية', 'climatisation', 'solaire', 'clim'] },
  { id: 'verrier_deco', icon: '🪟', ar: 'زجاج، مرايا وواجهات زجاجية', fr: 'Vitrerie & Façades Vitrées', en: 'Glass & Facade Glazing', keywords: ['زجاج', 'جاج', 'مرايا', 'فيترين', 'سيكوريت', 'vitrier', 'verre', 'miroir', 'glass'] },
  { id: 'other', icon: '➕', ar: 'حرفة أخرى (حدد حرفتك)', fr: 'Autre Métier (Préciser)', en: 'Other Trade (Specify)', keywords: [] }
];

// ⚡ جمل جاهزة متعددة اللغات للشروط والمعلومات السريعة (تترجم تلقائياً عند تغيير اللغة)
const QUICK_CHIPS = {
  terms: [
    { id: 'term_1', icon: '📋', keywords: ['فابور', 'مجاني', 'مجانية', 'دوفي', 'معاينة', 'devis gratuit', 'visite'], ar: 'معاينة الورش وتقديم عرض السعر (Devis) مجاني داخل المدينة.', fr: 'Visite de chantier et devis gratuit en ville.', en: 'Free site visit and price quote within the city.' },
    { id: 'term_2', icon: '💳', keywords: ['دفعات', 'مراحل', 'تلاتة', 'ثلاث', 'شوية بشوية', 'أقساط', 'tranches'], ar: 'الدفع على 3 دفعات مرحلية حسب تقدم الأشغال في الورش.', fr: 'Paiement en 3 tranches selon l\'avancement des travaux.', en: 'Payment in 3 stages according to work progress.' },
    { id: 'term_3', icon: '🛡️', keywords: ['ضمان', 'معقول', 'اتقان', 'إتقان', 'الوقت', 'مواعيد', 'garantie', 'délais'], ar: 'ضمان شامل على جودة العمل واحترام تام للمواعيد المتفق عليها.', fr: 'Garantie sur la qualité des travaux et respect strict des délais.', en: 'Full quality guarantee and strict adherence to deadlines.' },
    { id: 'term_4', icon: '🧱', keywords: ['سلعة واليد', 'بالسلعة', 'اليد بوحدها', 'يد عاملة', 'fourniture', 'pose'], ar: 'إمكانية العمل بالسلعة واليد أو باليد العاملة فقط حسب رغبة الزبون.', fr: 'Possibilité de travailler avec fourniture et pose ou main-d\'œuvre seule.', en: 'Available for material + labor or labor only.' }
  ],
  quick: [
    { id: 'quick_1', icon: '⏰', keywords: ['تمنية', 'ثمانية', 'صباح', 'عشية', 'مساء', 'أوقات', 'طيلة الأسبوع', '8h', '18h'], ar: 'متاح للعمل طيلة أيام الأسبوع من 8:00 صباحاً إلى 18:00 مساءً.', fr: 'Disponible toute la semaine de 8h00 à 18h00.', en: 'Available all week from 8:00 AM to 6:00 PM.' },
    { id: 'quick_2', icon: '🚗', keywords: ['ديبلاصما', 'تنقل', 'جميع المدن', 'نواحي', 'كنمشي', 'déplacement', 'villes'], ar: 'أتنقل لجميع الأحياء والمدن المجاورة لإنجاز الأوراش.', fr: 'Déplacement dans tous les quartiers et villes voisines.', en: 'Available to travel to all neighborhoods and nearby cities.' },
    { id: 'quick_3', icon: '💰', keywords: ['كاش', 'نقدا', 'شيك', 'تحويل', 'بنكي', 'فيرما', 'espèces', 'virement', 'chèque'], ar: 'أقبل الدفع نقداً (كاش)، تحويل بنكي، أو شيك.', fr: 'Paiement accepté : Espèces, virement bancaire ou chèque.', en: 'Accepts cash, bank transfer, or check.' }
  ]
};

const translations = {
  ar: {
    pageTitle: "ملفي الشخصي وإعدادات العرض",
    previewBtn: "معاينة صفحة الزبون (Vitrine)",
    basicInfoTitle: "معلومات الحساب الأساسية (قابلة للتعديل)",
    fullName: "الاسم الكامل أو اسم الورشة",
    fullNamePlace: "مثال: المعلم محمد / ورشة الأطلس...",
    city: "المدينة",
    cityPlace: "اختر أو انطق اسم مدينتك...",
    phone: "رقم الهاتف / واتساب",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "التقييم العام",
    ratingNote: "(يُحتسب تلقائياً من آراء الزبناء)",
    readonlyNote: "* يمكنك تعديل اسمك، مدينتك، ورقم هاتفك بالدارجة أو الكتابة في أي وقت ثم الضغط على حفظ.",
    publicSettingsTitle: "تفاصيل العرض للزبناء (تترجم تلقائياً)",
    bioLabel: "1. نبذة عنك وعن خدماتك",
    bioPlace: "تحدث بالدارجة أو بالعربية عن حرفتك وما يميز عملك...",
    expLabel: "2. الخبرة والمجالات الدقيقة",
    expPlace: "مثال: خبرة 12 سنة، تنفيذ الفيلات والشقق والمحلات...",
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
    aboutSectionTitle: "نبذة تعريفية عن الحرفي",
    expSectionTitle: "الخبرة والتخصصات الميدانية",
    termsSectionTitle: "شروط العمل والضمانات",
    quickSectionTitle: "التوافر ومعلومات التواصل",
    emptySection: "لم يقم الحرفي بإضافة تفاصيل في هذا القسم بعد.",
    callBtn: "اتصال مباشر",
    whatsappBtn: "مراسلة واتساب",
    managePortfolioBtn: "إدارة معرض أعمالي (Portfolio)",
    closePreviewBtn: "إغلاق المعاينة",
    audioGuideBtn: "🔊 استمع للشرح الصوتي",
    audioGuideStop: "⏹️ إيقاف الصوت",
    voiceBannerTitle: "🎙️ المساعد الصوتي الذكي (تحدث بالدارجة المغربية أو العربية)",
    voiceBannerDesc: "اضغط على الميكروفون وتكلم بعفوية بالدارجة (مثلاً: أنا المعلم أحمد من قصبة تادلة، بلومبي عندي 10 سنين د الحرفة وكاندير الدوفي فابور) وسيقوم الذكاء الاصطناعي بتحويلها إلى لغة سليمة وملء الخانات!",
    voiceStartAllBtn: "اضغط وتحدث بالدارجة أو العربية",
    voiceListeningBtn: "جاري الاستماع الآن... تكلم بعفوية (اضغط للإيقاف)",
    scanCardBtn: "📷 تصوير كارط فيزيت",
    scanningCardMsg: "جاري القراءة...",
    aiPolishBtn: "✨ صياغة وترجمة احترافية بالذكاء الاصطناعي",
    aiPolishSuccess: "✨ تمت صياغة وترجمة ملفك المهني بلغة سليمة وجذابة للزبناء!",
    visualTradeTitle: "⚡ اختر حرفتك بالصورة (أو اضغط + لإضافة حرفة أخرى غير موجودة):",
    customTradeLabel: "اكتب أو انطق اسم حرفتك أو تخصصك الخاص:",
    customTradePlaceholder: "مثال: تركيب المصاعد، حفر الآبار، تغليف الواجهات، كراء المعدات...",
    applyCustomTradeBtn: "اعتماد الحرفة وتوليد الملف",
    quickTapHint: "➕ اضغط لإضافة جملة جاهزة:",
    micFieldLabel: "تحدث",
    micListeningNow: "يتلقى الصوت..."
  },
  fr: {
    pageTitle: "Mon Profil et Paramètres d'Affichage",
    previewBtn: "Aperçu Vitrine Client",
    basicInfoTitle: "Informations de Base (Modifiables)",
    fullName: "Nom Complet / Nom d'Atelier",
    fullNamePlace: "Ex : Maâlem Mohammed / Atelier Atlas...",
    city: "Ville d'activité",
    cityPlace: "Sélectionnez ou dictez votre ville...",
    phone: "Numéro de Téléphone / WhatsApp",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "Évaluation Globale",
    ratingNote: "(Calculée automatiquement selon les avis)",
    readonlyNote: "* Vous pouvez modifier votre nom, votre ville et votre téléphone à tout moment par écrit ou par la voix.",
    publicSettingsTitle: "Détails de Présentation Publique (Traduction Auto)",
    bioLabel: "1. À propos de vous et de vos services",
    bioPlace: "Parlez de vous, quand avez-vous commencé, qu'est-ce qui vous distingue...",
    expLabel: "2. Expérience et Spécialités",
    expPlace: "Ex : 10 ans d'expérience, spécialiste des villas et appartements...",
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
    voiceBannerTitle: "🎙️ Assistant Vocal IA (Comprend le Darija Marocain & le Français)",
    voiceBannerDesc: "Appuyez sur le micro et parlez en Darija ou en Français : dites votre nom, ville, métier et années d'expérience. L'IA traduit et rédige votre profil !",
    voiceStartAllBtn: "Appuyez et parlez (Darija / FR)",
    voiceListeningBtn: "Écoute en direct... Parlez maintenant",
    scanCardBtn: "📷 Scanner Carte de Visite",
    scanningCardMsg: "Lecture...",
    aiPolishBtn: "✨ Reformuler & Traduire avec l'IA",
    aiPolishSuccess: "✨ Votre profil a été traduit et rédigé professionnellement !",
    visualTradeTitle: "⚡ Touchez votre métier en image (ou + pour ajouter un autre métier) :",
    customTradeLabel: "Écrivez ou dictez votre métier spécifique :",
    customTradePlaceholder: "Ex : Ascensoriste, Forage de puits, Bardage façade, Location matériel...",
    applyCustomTradeBtn: "Valider ce métier & Générer",
    quickTapHint: "➕ Touchez pour ajouter :",
    micFieldLabel: "Dicter",
    micListeningNow: "Écoute..."
  },
  en: {
    pageTitle: "My Profile and Display Settings",
    previewBtn: "Client Showcase Preview",
    basicInfoTitle: "Basic Account Info (Editable)",
    fullName: "Full Name / Workshop Name",
    fullNamePlace: "E.g., Maalem Mohammed / Atlas Workshop...",
    city: "City",
    cityPlace: "Select or speak your city...",
    phone: "Phone / WhatsApp Number",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "Overall Rating",
    ratingNote: "(Automatically linked to client reviews)",
    readonlyNote: "* You can update your name, city, and phone number anytime via voice or text and click save.",
    publicSettingsTitle: "Public Showcase Details (Auto-Translated)",
    bioLabel: "1. About you and your services",
    bioPlace: "Talk about yourself, when you started, what makes you unique...",
    expLabel: "2. Experience and Specialties",
    expPlace: "E.g., 10 years experience, specializing in villas and apartments...",
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
    voiceBannerTitle: "🎙️ Smart AI Voice Assistant (Understands Moroccan Darija, AR & EN)",
    voiceBannerDesc: "Tap the mic and speak in Moroccan Darija, Arabic, or English. AI will translate and format your entire profile automatically!",
    voiceStartAllBtn: "Tap & Speak Now",
    voiceListeningBtn: "Listening live... Speak now",
    scanCardBtn: "📷 Scan Business Card",
    scanningCardMsg: "Scanning...",
    aiPolishBtn: "✨ Translate & Polish with AI",
    aiPolishSuccess: "✨ Your profile has been translated and formatted professionally!",
    visualTradeTitle: "⚡ Tap your trade visually (or tap + to specify another trade):",
    customTradeLabel: "Type or speak your specific trade:",
    customTradePlaceholder: "E.g., Elevator technician, Well drilling, Facade cladding, Equipment rental...",
    applyCustomTradeBtn: "Apply Trade & Generate Bio",
    quickTapHint: "➕ Tap to insert:",
    micFieldLabel: "Speak",
    micListeningNow: "Listening..."
  }
};

// 🔢 تحويل الأرقام المنطوقة بالدارجة المغربية أو العربية أو الفرنسية إلى أرقام
const convertSpokenWordsToDigits = (text) => {
  if (!text) return '';
  let str = text.toLowerCase();
  const wordMap = {
    'صفر': '0', 'زيرو': '0', 'zero': '0', 'zéro': '0',
    'واحد': '1', 'واحدة': '1', 'وحده': '1', 'un': '1', 'one': '1',
    'اثنان': '2', 'إثنان': '2', 'جوج': '2', 'زوج': '2', 'ثنتين': '2', 'deux': '2', 'two': '2',
    'ثلاثة': '3', 'تلاتة': '3', 'تلاته': '3', 'ثلاثه': '3', 'trois': '3', 'three': '3',
    'أربعة': '4', 'اربعة': '4', 'ربعة': '4', 'ربعه': '4', 'quatre': '4', 'four': '4',
    'خمسة': '5', 'خمسه': '5', 'cinq': '5', 'five': '5',
    'ستة': '6', 'سته': '6', 'ست': '6', 'six': '6',
    'سبعة': '7', 'سبعه': '7', 'sept': '7', 'seven': '7',
    'ثمانية': '8', 'تمنية': '8', 'ثمانيه': '8', 'تمنيه': '8', 'huit': '8', 'eight': '8',
    'تسعة': '9', 'تسعود': '9', 'تسعه': '9', 'neuf': '9', 'nine': '9',
    'عشرة': '10', 'عشره': '10', 'عشر': '10', 'dix': '10', 'ten': '10',
    'طنعش': '12', 'اثنا عشر': '12', 'خمسطاش': '15', 'خمسة عشر': '15', 'عشرين': '20', 'تلاتين': '30'
  };
  Object.keys(wordMap).forEach((w) => {
    const regex = new RegExp(`(^|\\s)${w}(?=\\s|$)`, 'g');
    str = str.replace(regex, ` ${wordMap[w]} `);
  });
  const easternDigits = '٠١٢٣٤٥٦٧٨٩';
  str = str.replace(/[٠-٩]/g, (d) => easternDigits.indexOf(d));
  return str;
};

// 🏙️ دالة العثور على المدينة وترجمتها للغة المختارة
const matchAndFormatCity = (rawInput, lang) => {
  if (!rawInput) return { cityObj: null, formatted: '' };
  const lower = rawInput.toLowerCase().trim();
  for (const c of MOROCCAN_CITIES_DATA) {
    if (
      c.keywords.some((k) => lower.includes(k)) ||
      lower.includes(c.ar.toLowerCase()) ||
      lower.includes(c.fr.toLowerCase())
    ) {
      const formatted = lang === 'ar' ? `${c.ar} - ${c.fr}` : lang === 'fr' ? `${c.fr} (${c.ar})` : `${c.en} (${c.ar})`;
      return { cityObj: c, formatted };
    }
  }
  return { cityObj: null, formatted: rawInput.trim() };
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

  // 🧠 ذاكرة مهيكلة لبيانات الحرفي تسمح بالترجمة التلقائية الفورية عند تبديل اللغة (ar <-> fr <-> en)
  const [structuredMeta, setStructuredMeta] = useState({
    tradeId: 'macon',
    customTradeName: '',
    yearsExp: '',
    cityId: '',
    selectedTermIds: ['term_1', 'term_2', 'term_3'],
    selectedQuickIds: ['quick_1', 'quick_2', 'quick_3']
  });

  const [selectedVisualTrade, setSelectedVisualTrade] = useState(null);
  const [showCustomTradeInput, setShowCustomTradeInput] = useState(false);
  const [customTradeText, setCustomTradeText] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ show: false, type: '', text: '' });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // حالات الصوت والمسح البصري
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [listeningField, setListeningField] = useState(null);
  const [spokenPreview, setSpokenPreview] = useState('');
  const [isScanningCard, setIsScanningCard] = useState(false);

  const recognitionRef = useRef(null);
  const cloudAudioRef = useRef(null);
  const cardInputRef = useRef(null);
  const prevLangRef = useRef(language);

  // تحميل أصوات المتصفح مسبقاً
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
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
  }, []);

  // ==========================================
  // 🌐 محرك صياغة وترجمة الحقول الأربعة تلقائياً بأي لغة (ar / fr / en)
  // ==========================================
  const buildLocalizedProfileTexts = (targetLang, metaState, currentBasicInfo) => {
    const tradeObj = VISUAL_TRADES.find((vt) => vt.id === metaState.tradeId) || VISUAL_TRADES[0];
    const tradeLabel =
      metaState.tradeId === 'other' && metaState.customTradeName
        ? metaState.customTradeName
        : targetLang === 'ar'
        ? tradeObj.ar
        : targetLang === 'fr'
        ? tradeObj.fr
        : tradeObj.en;

    const { cityObj, formatted: formattedCity } = matchAndFormatCity(currentBasicInfo.city, targetLang);
    const cityShort = cityObj
      ? targetLang === 'ar'
        ? cityObj.ar
        : targetLang === 'fr'
        ? cityObj.fr
        : cityObj.en
      : currentBasicInfo.city.split(' - ')[0] || '';

    const artisanName =
      currentBasicInfo.full_name ||
      (targetLang === 'ar' ? 'المعلم' : targetLang === 'fr' ? 'Artisan Pro' : 'Master Craftsman');

    const years = metaState.yearsExp;

    // 1. صياغة النبذة
    const bio_text =
      targetLang === 'ar'
        ? `${artisanName}، حرفي ومهني معتمد في منصة SasBTP متخصص في (${tradeLabel})${cityShort ? ` بمدينة ${cityShort} والنواحي` : ''}. أحرص على تقديم خدمات عالية الجودة، إتقان تام في الأشغال والتشطيب، ومواكبة الزبون من بداية الورش حتى التسليم النهائي.`
        : targetLang === 'fr'
        ? `${artisanName}, artisan professionnel vérifié sur SasBTP spécialisé en (${tradeLabel})${cityShort ? ` à ${cityShort} et régions` : ''}. Travail soigné, finitions irréprochables et accompagnement complet de votre chantier jusqu'à la livraison.`
        : `${artisanName}, verified professional craftsman on SasBTP specializing in (${tradeLabel})${cityShort ? ` in ${cityShort} and surrounding areas` : ''}. Committed to top-quality workmanship, precision finishing, and full project support from start to handover.`;

    // 2. صياغة الخبرة
    const experience_text =
      targetLang === 'ar'
        ? `خبرة ميدانية واسعة${years ? ` تزيد عن ${years} سنة` : ''} في مجال (${tradeLabel}). تنفيذ أشغال السكن، الفيلات، الشقق، والمحلات التجارية وفق أعلى المعايير المهنية والفنية.`
        : targetLang === 'fr'
        ? `Solide expérience terrain${years ? ` de plus de ${years} ans` : ''} dans le domaine de (${tradeLabel}). Réalisation de projets résidentiels, villas, appartements et locaux commerciaux selon les normes professionnelles.`
        : `Extensive field experience${years ? ` of over ${years} years` : ''} in (${tradeLabel}). Executing residential projects, villas, apartments, and commercial spaces to the highest industry standards.`;

    // 3. صياغة الشروط
    const activeTerms = (metaState.selectedTermIds || ['term_1', 'term_2', 'term_3'])
      .map((id) => QUICK_CHIPS.terms.find((c) => c.id === id))
      .filter(Boolean)
      .map((c) => `• ${targetLang === 'ar' ? c.ar : targetLang === 'fr' ? c.fr : c.en}`);
    const terms_text = activeTerms.join('\n');

    // 4. صياغة المعلومات السريعة
    const activeQuick = (metaState.selectedQuickIds || ['quick_1', 'quick_2', 'quick_3'])
      .map((id) => QUICK_CHIPS.quick.find((c) => c.id === id))
      .filter(Boolean)
      .map((c) => `• ${targetLang === 'ar' ? c.ar : targetLang === 'fr' ? c.fr : c.en}`);
    const quick_info = activeQuick.join('\n');

    return {
      bio_text,
      experience_text,
      terms_text,
      quick_info,
      formattedCity: formattedCity || currentBasicInfo.city
    };
  };

  // استنتاج التخصص وسنوات الخبرة من أي نص موجود مسبقاً (سواء كان بالعربية أو الفرنسية أو الإنجليزية)
  const inferStructuredMetaFromExistingText = (bio, exp, terms, quick, cityStr) => {
    const combined = convertSpokenWordsToDigits(`${bio} ${exp} ${terms} ${quick}`).toLowerCase();
    let detectedTradeId = 'macon';
    for (const vt of VISUAL_TRADES) {
      if (vt.id === 'other') continue;
      if (
        vt.keywords.some((k) => combined.includes(k.toLowerCase())) ||
        combined.includes(vt.ar.toLowerCase()) ||
        combined.includes(vt.fr.toLowerCase()) ||
        combined.includes(vt.en.toLowerCase())
      ) {
        detectedTradeId = vt.id;
        break;
      }
    }

    const expMatch = combined.match(/(\d{1,2})\s*(?:سنة|سنه|سنين|سنوات|عام|أعوام|ans|an|years)/i);
    const yearsExp = expMatch ? expMatch[1] : '';

    const matchedTermIds = QUICK_CHIPS.terms
      .filter((c) => c.keywords.some((k) => combined.includes(k.toLowerCase())))
      .map((c) => c.id);

    const matchedQuickIds = QUICK_CHIPS.quick
      .filter((c) => c.keywords.some((k) => combined.includes(k.toLowerCase())))
      .map((c) => c.id);

    const { cityObj } = matchAndFormatCity(cityStr, language);

    return {
      tradeId: detectedTradeId,
      customTradeName: '',
      yearsExp,
      cityId: cityObj?.id || '',
      selectedTermIds: matchedTermIds.length > 0 ? matchedTermIds : ['term_1', 'term_2', 'term_3'],
      selectedQuickIds: matchedQuickIds.length > 0 ? matchedQuickIds : ['quick_1', 'quick_2', 'quick_3']
    };
  };

  // جلب البيانات من قاعدة البيانات عند التحميل
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

      const rawCity = data?.city || metaProfile.city || user.user_metadata?.city || localProfile.city || '';
      const cleanCity = rawCity === 'غير محددة' ? '' : rawCity;
      const { formatted: localizedCity } = matchAndFormatCity(cleanCity, language);

      const loadedBasic = {
        full_name: data?.full_name || metaProfile.full_name || user.user_metadata?.full_name || localProfile.full_name || '',
        city: localizedCity || cleanCity,
        phone: data?.phone || metaProfile.phone || user.user_metadata?.phone || localProfile.phone || '',
        rating: data?.rating ?? metaProfile.rating ?? 0
      };

      const loadedForm = {
        bio_text: data?.bio_text || metaProfile.bio_text || localProfile.bio_text || '',
        experience_text: data?.experience_text || metaProfile.experience_text || localProfile.experience_text || '',
        terms_text: data?.terms_text || metaProfile.terms_text || localProfile.terms_text || '',
        quick_info: data?.quick_info || metaProfile.quick_info || localProfile.quick_info || ''
      };

      if (data) {
        setProviderId(data.id);
        setDbColumns(Object.keys(data));
      }

      setBasicInfo(loadedBasic);

      const inferred = inferStructuredMetaFromExistingText(
        loadedForm.bio_text,
        loadedForm.experience_text,
        loadedForm.terms_text,
        loadedForm.quick_info,
        loadedBasic.city
      );
      if (localProfile.structuredMeta) {
        setStructuredMeta({ ...inferred, ...localProfile.structuredMeta });
        setSelectedVisualTrade(localProfile.structuredMeta.tradeId || inferred.tradeId);
      } else {
        setStructuredMeta(inferred);
        setSelectedVisualTrade(inferred.tradeId);
      }

      // إذا كانت هناك نصوص مدخلة بلغة أخرى، نترجمها فوراً للغة الواجهة الحالية
      if (loadedForm.bio_text || loadedForm.experience_text) {
        const hasArabicChars = /[\u0600-\u06FF]/.test(loadedForm.bio_text);
        if ((language !== 'ar' && hasArabicChars) || (language === 'ar' && !hasArabicChars)) {
          const translated = buildLocalizedProfileTexts(language, localProfile.structuredMeta || inferred, loadedBasic);
          setFormData({
            bio_text: translated.bio_text,
            experience_text: translated.experience_text,
            terms_text: translated.terms_text,
            quick_info: translated.quick_info
          });
        } else {
          setFormData(loadedForm);
        }
      }
    };

    fetchProviderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 الترجمة الفورية التلقائية لجميع الحقول والمدينة عند تبديل المستخدم للغة (العربية <-> الفرنسية <-> الإنجليزية)
  useEffect(() => {
    if (prevLangRef.current === language) return;
    prevLangRef.current = language;

    // إيقاف أي صوت جاري عند تبديل اللغة
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
      cloudAudioRef.current = null;
    }
    setIsSpeakingGuide(false);

    // ترجمة المدينة والحقول الأربعة فوراً إلى اللغة الجديدة
    setBasicInfo((prevBasic) => {
      const { formatted: newCity } = matchAndFormatCity(prevBasic.city, language);
      const updatedBasic = { ...prevBasic, city: newCity || prevBasic.city };

      setFormData((prevForm) => {
        if (!prevForm.bio_text && !prevForm.experience_text && !prevForm.terms_text && !prevForm.quick_info) {
          return prevForm;
        }
        const currentMeta = inferStructuredMetaFromExistingText(
          prevForm.bio_text,
          prevForm.experience_text,
          prevForm.terms_text,
          prevForm.quick_info,
          updatedBasic.city
        );
        const mergedMeta = {
          ...currentMeta,
          tradeId: selectedVisualTrade || currentMeta.tradeId,
          customTradeName: customTradeText || structuredMeta.customTradeName
        };
        setStructuredMeta(mergedMeta);
        const localized = buildLocalizedProfileTexts(language, mergedMeta, updatedBasic);
        return {
          bio_text: localized.bio_text,
          experience_text: localized.experience_text,
          terms_text: localized.terms_text,
          quick_info: localized.quick_info
        };
      });

      return updatedBasic;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // 🔊 1. المرشد الصوتي الطبيعي السليم في اللغات الثلاث (العربية، الفرنسية، الإنجليزية)
  // ==========================================
  const toggleAudioGuide = () => {
    // إيقاف الصوت إذا كان يعمل
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

    const speechText =
      language === 'ar'
        ? 'مرحباً بك يا معلم في ملفك المهني بمنصة ساس بي تي بي. اضغط على الزر البرتقالي وتحدث بالدارجة المغربية أو العربية عن اسمك، مدينتك، وحرفتك، وسنقوم بملء جميع الخانات تلقائياً.'
        : language === 'fr'
        ? 'Bienvenue sur votre profil professionnel SasBTP. Appuyez sur le bouton orange et parlez en Darija ou en Français de votre métier, votre ville et votre expérience.'
        : 'Welcome to your professional profile on SasBTP. Tap the orange button and speak your name, city, trade, and experience, and our AI will complete your profile automatically.';

    const voices = ('speechSynthesis' in window) ? window.speechSynthesis.getVoices() : [];
    const blockedRoboticNames = ['fred', 'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'good news', 'hysterical', 'pipe organ', 'trinoids', 'whisper', 'zarvox', 'junior', 'kathy', 'ralph'];

    let chosenVoice = null;
    if (language === 'ar') {
      chosenVoice = voices.find(
        (v) => (v.lang.toLowerCase().startsWith('ar') || v.name.includes('Majed') || v.name.includes('Tarik') || v.name.includes('Maged') || v.name.includes('العربية')) &&
               !blockedRoboticNames.some((b) => v.name.toLowerCase().includes(b))
      );
    } else if (language === 'fr') {
      chosenVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('fr') && (v.name.includes('Thomas') || v.name.includes('Amelie') || v.name.includes('Audrey') || v.name.includes('Google') || v.name.includes('Paul') || v.name.includes('Julie'))) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('fr') && !blockedRoboticNames.some((b) => v.name.toLowerCase().includes(b)));
    } else {
      chosenVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google US') || v.name.includes('Daniel') || v.name.includes('Karen') || v.name.includes('Ava') || v.name.includes('Alex') || v.name.includes('Moira'))) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en') && !blockedRoboticNames.some((b) => v.name.toLowerCase().includes(b)));
    }

    // إذا كان الصوت المحلي للعربية غير مثبت في الجهاز (وهو ما كان يسبب صوت "فوان فوان")، نشغل الصوت السحابي الطبيعي مباشرة
    if (!chosenVoice && language === 'ar') {
      try {
        const encoded = encodeURIComponent(speechText);
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
      const utterance = new SpeechSynthesisUtterance(speechText);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
      }
      utterance.rate = language === 'en' ? 0.96 : 0.94;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeakingGuide(false);
      utterance.onerror = () => setIsSpeakingGuide(false);

      setIsSpeakingGuide(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // ==========================================
  // 🧠 2. محرك فهم الدارجة المغربية وتحويلها للغة فصحى سليمة (أو لغة الواجهة)
  // ==========================================
  const parseDarijaAndFillProfile = (rawSpeech) => {
    if (!rawSpeech || !rawSpeech.trim()) return;
    const normalized = convertSpokenWordsToDigits(rawSpeech);
    const lower = normalized.toLowerCase();

    // أ) استخراج الهاتف المغربي إن نطقه
    const compactDigits = normalized.replace(/[\s\-./]/g, '');
    const phoneMatch = compactDigits.match(/(?:00212|\+212|212|0)([567]\d{8})/);
    const detectedPhone = phoneMatch ? `0${phoneMatch[1]}` : '';

    // ب) استخراج المدينة المغربية بالدارجة أو الفرنسية
    const { cityObj, formatted: detectedCityFormatted } = matchAndFormatCity(normalized, language);

    // ج) استخراج الحرفة بالدارجة المغربية
    let detectedTradeId = selectedVisualTrade || structuredMeta.tradeId || 'macon';
    for (const vt of VISUAL_TRADES) {
      if (vt.id === 'other') continue;
      if (vt.keywords.some((k) => lower.includes(k.toLowerCase()))) {
        detectedTradeId = vt.id;
        break;
      }
    }

    // د) استخراج سنوات الخبرة بالدارجة ("عندي عشرة سنين", "15 عام ديال الحرفة")
    const expMatch = normalized.match(/(\d{1,2})\s*(?:سنة|سنه|سنين|سنوات|عام|أعوام|ans|an|years)/i);
    const detectedYears = expMatch ? expMatch[1] : structuredMeta.yearsExp;

    // هـ) استخراج اسم المعلم من الدارجة ("أنا المعلم محمد", "سميتي ادريس", "معكم الحاج علي")
    let detectedName = '';
    const namePatterns = [
      /(?:أنا|انا|اسمي|إسمي|سميتي|معكم|انا هو)\s+(?:المعلم\s+|الشاف\s+|الحاج\s+|سي\s+)?([أ-يa-zA-Z]+(?:\s+[أ-يa-zA-Z]+){0,2})/i,
      /(?:المعلم|الشاف)\s+([أ-يa-zA-Z]+(?:\s+[أ-يa-zA-Z]+){0,1})/i,
      /(?:je suis|je m'appelle|moi c'est|maalem)\s+([a-zA-ZÀ-ÿ]+(?:\s+[a-zA-ZÀ-ÿ]+){0,2})/i
    ];
    for (const pat of namePatterns) {
      const m = rawSpeech.match(pat);
      if (m && m[1]) {
        detectedName = m[1]
          .replace(/\b(من|في|ف|مدينة|مدينه|معلم|بلومبي|تريسيان|بناي|صباغ|نجار|زلايجي|جباس|حداد|عزل|عندي|خدام|كاندير|كنخدم|de|à)\b.*/i, '')
          .trim();
        break;
      }
    }

    // و) التقاط الشروط والمعلومات السريعة من الدارجة
    const matchedTermIds = QUICK_CHIPS.terms
      .filter((c) => c.keywords.some((k) => lower.includes(k.toLowerCase())))
      .map((c) => c.id);

    const matchedQuickIds = QUICK_CHIPS.quick
      .filter((c) => c.keywords.some((k) => lower.includes(k.toLowerCase())))
      .map((c) => c.id);

    const updatedMeta = {
      tradeId: detectedTradeId,
      customTradeName: detectedTradeId === 'other' ? customTradeText : '',
      yearsExp: detectedYears,
      cityId: cityObj?.id || structuredMeta.cityId,
      selectedTermIds: matchedTermIds.length > 0 ? matchedTermIds : structuredMeta.selectedTermIds,
      selectedQuickIds: matchedQuickIds.length > 0 ? matchedQuickIds : structuredMeta.selectedQuickIds
    };

    const updatedBasic = {
      ...basicInfo,
      full_name: detectedName ? (detectedName.startsWith('المعلم') || language !== 'ar' ? detectedName : `المعلم ${detectedName}`) : basicInfo.full_name,
      city: cityObj ? detectedCityFormatted : basicInfo.city,
      phone: detectedPhone || basicInfo.phone
    };

    setSelectedVisualTrade(detectedTradeId);
    setStructuredMeta(updatedMeta);
    setBasicInfo(updatedBasic);

    const localizedTexts = buildLocalizedProfileTexts(language, updatedMeta, updatedBasic);
    setFormData({
      bio_text: localizedTexts.bio_text,
      experience_text: localizedTexts.experience_text,
      terms_text: localizedTexts.terms_text,
      quick_info: localizedTexts.quick_info
    });
  };

  // ==========================================
  // ⚡ 3. اختيار الحرفة بالصورة (أو إضافة حرفة أخرى مخصصة)
  // ==========================================
  const handleSelectVisualTrade = (tradeObj) => {
    setSelectedVisualTrade(tradeObj.id);
    if (tradeObj.id === 'other') {
      setShowCustomTradeInput(true);
      return;
    }
    setShowCustomTradeInput(false);

    const updatedMeta = {
      ...structuredMeta,
      tradeId: tradeObj.id,
      customTradeName: ''
    };
    setStructuredMeta(updatedMeta);

    const localized = buildLocalizedProfileTexts(language, updatedMeta, basicInfo);
    setFormData({
      bio_text: localized.bio_text,
      experience_text: localized.experience_text,
      terms_text: localized.terms_text,
      quick_info: localized.quick_info
    });
  };

  const handleApplyCustomTrade = () => {
    if (!customTradeText.trim()) return;
    const updatedMeta = {
      ...structuredMeta,
      tradeId: 'other',
      customTradeName: customTradeText.trim()
    };
    setStructuredMeta(updatedMeta);
    setSelectedVisualTrade('other');

    const localized = buildLocalizedProfileTexts(language, updatedMeta, basicInfo);
    setFormData({
      bio_text: localized.bio_text,
      experience_text: localized.experience_text,
      terms_text: localized.terms_text,
      quick_info: localized.quick_info
    });
    setAlertMsg({ show: true, type: 'success', text: t.aiPolishSuccess });
    setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 4000);
  };

  const handleAiPolishAll = () => {
    const localized = buildLocalizedProfileTexts(language, structuredMeta, basicInfo);
    setFormData({
      bio_text: localized.bio_text,
      experience_text: localized.experience_text,
      terms_text: localized.terms_text,
      quick_info: localized.quick_info
    });
    setBasicInfo((prev) => ({
      ...prev,
      city: localized.formattedCity || prev.city
    }));
    setAlertMsg({ show: true, type: 'success', text: t.aiPolishSuccess });
    setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 4500);
  };

  const appendQuickChip = (field, chipObj) => {
    const textValue = language === 'ar' ? chipObj.ar : language === 'fr' ? chipObj.fr : chipObj.en;
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
  // 🎙️ 4. الميكروفون الفوري الموثوق 100% (يدعم الدارجة المغربية ويكتب لحظياً)
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

    // إذا كان نفس الميكروفون يعمل، نوقفه فوراً
    if (listeningField === target && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setListeningField(null);
      return;
    }

    // إغلاق أي جلسة ميكروفون سابقة بشكل نظيف لمنع التعليق
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }

    setTimeout(() => {
      try {
        const recognition = new SpeechRecognition();
        // الاستماع بالدارجة المغربية (ar-MA) دائماً للحرفي حتى لو نطق اسمه أو مدينته أو حرفته بالدارجة
        recognition.lang = 'ar-MA';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setListeningField(target);
        };

        recognition.onresult = (event) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          const cleanTranscript = fullTranscript.trim();
          if (!cleanTranscript) return;

          setSpokenPreview(cleanTranscript);

          if (target === 'smartAll') {
            parseDarijaAndFillProfile(cleanTranscript);
          } else if (target === 'customTrade') {
            setCustomTradeText(cleanTranscript);
          } else if (target === 'full_name') {
            const cleanName = cleanTranscript.replace(/^(أنا|انا|اسمي|سميتي)\s+/i, '').trim();
            setBasicInfo((prev) => ({ ...prev, full_name: cleanName }));
          } else if (target === 'city') {
            const { formatted } = matchAndFormatCity(cleanTranscript, language);
            setBasicInfo((prev) => ({ ...prev, city: formatted || cleanTranscript }));
          } else if (target === 'phone') {
            const digits = convertSpokenWordsToDigits(cleanTranscript).replace(/\D/g, '');
            setBasicInfo((prev) => ({ ...prev, phone: digits || cleanTranscript }));
          } else if (['bio_text', 'experience_text', 'terms_text', 'quick_info'].includes(target)) {
            // إذا كان يتحدث بالدارجة، نحول الدارجة إلى صياغة سليمة أو ندرج النص المباشر
            const isFinal = event.results[event.results.length - 1].isFinal;
            if (isFinal) {
              setFormData((prev) => ({
                ...prev,
                [target]: cleanTranscript
              }));
            }
          }
        };

        recognition.onerror = () => {
          setListeningField(null);
        };

        recognition.onend = () => {
          setListeningField(null);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        setListeningField(null);
      }
    }, 120);
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
        parseDarijaAndFillProfile(detectedText);
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
  // 💾 6. حفظ جميع التعديلات في Supabase
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
      // 1. حفظ النسخة المهيكلة محلياً لدعم الترجمة التلقائية الفورية
      localStorage.setItem(
        `sasbtp_provider_profile_${userId}`,
        JSON.stringify({ ...fullPayload, structuredMeta })
      );

      // 2. حفظ سحابي مضمون في Supabase Auth Metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullPayload.full_name,
          phone: fullPayload.phone,
          city: fullPayload.city,
          provider_profile: { ...fullPayload, structuredMeta }
        }
      });

      // 3. تحديث جدول providers بالأعمدة الموجودة فعلياً
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

      {/* 🎙️ شريط المساعد الصوتي الذكي (يفهم الدارجة المغربية ويحولها للغة السليمة) */}
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
          <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>🗣️ &ldquo;{spokenPreview}&rdquo;</span>
            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ✓ تم التحليل والترجمة
            </span>
          </div>
        )}

        {/* اختيار التخصص بالصور والأيقونات + زر إضافة حرفة أخرى غير موجودة */}
        <div className="pt-2 border-t border-orange-200/70">
          <p className="text-xs font-black text-orange-950 mb-2.5">{t.visualTradeTitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {VISUAL_TRADES.map((vt) => {
              const active = selectedVisualTrade === vt.id;
              return (
                <button
                  key={vt.id}
                  type="button"
                  onClick={() => handleSelectVisualTrade(vt)}
                  className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    active
                      ? 'border-orange-600 bg-orange-100 text-orange-950 shadow-sm scale-[1.02]'
                      : vt.id === 'other'
                      ? 'border-dashed border-indigo-400 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900'
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

          {/* ➕ حقل إدخال حرفة مخصصة أخرى (بالصوت أو الكتابة) لمن لا يجد حرفته في الأيقونات */}
          {showCustomTradeInput && (
            <div className="mt-3 p-4 bg-white rounded-xl border-2 border-indigo-300 shadow-sm animate-fade-in">
              <label className="block text-xs font-black text-indigo-950 mb-2">
                {t.customTradeLabel}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={customTradeText}
                    onChange={(e) => setCustomTradeText(e.target.value)}
                    placeholder={t.customTradePlaceholder}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('customTrade')}
                    className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-2 rounded-lg cursor-pointer ${
                      listeningField === 'customTrade' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomTrade}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  {t.applyCustomTradeBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ⚠️ تنبيهات الحفظ */}
      {alertMsg.show && (
        <div className={`p-5 rounded-xl mb-6 flex items-start gap-3 border animate-fade-in ${alertMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />}
          <div>
            <strong className="block text-base mb-1">{alertMsg.type === 'success' ? '✅ ' + t.successMsg.split('!')[0] + '!' : '❌ خطأ'}</strong>
            <span className="text-sm opacity-90">{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* 📦 نموذج موحد يحفظ البطاقتين معاً */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* 📌 البطاقة الأولى: إعدادات الملف العام (مع ميكروفون فوري لكل قسم) */}
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
                {listeningField === 'bio_text' ? t.micListeningNow : t.micFieldLabel}
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
                {listeningField === 'experience_text' ? t.micListeningNow : t.micFieldLabel}
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

          {/* 3. الشروط وطريقة العمل */}
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
                {listeningField === 'terms_text' ? t.micListeningNow : t.micFieldLabel}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] font-bold text-slate-400">{t.quickTapHint}</span>
              {QUICK_CHIPS.terms.map((chip) => {
                const textVal = language === 'ar' ? chip.ar : language === 'fr' ? chip.fr : chip.en;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => appendQuickChip('terms_text', chip)}
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

          {/* 4. أوقات العمل ومعلومات سريعة */}
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
                {listeningField === 'quick_info' ? t.micListeningNow : t.micFieldLabel}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] font-bold text-slate-400">{t.quickTapHint}</span>
              {QUICK_CHIPS.quick.map((chip) => {
                const textVal = language === 'ar' ? chip.ar : language === 'fr' ? chip.fr : chip.en;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => appendQuickChip('quick_info', chip)}
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
        {/* 🔓 البطاقة الثانية: معلومات الحساب الأساسية (مع ميكروفون فوري لكل حقل) */}
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
                  className={`w-full py-3.5 ${isRtl ? 'pr-10 pl-12' : 'pl-10 pr-12'} bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput('full_name')}
                  title={t.micFieldLabel}
                  className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-2 rounded-lg cursor-pointer transition-all ${
                    listeningField === 'full_name' ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {listeningField === 'full_name' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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
                  className={`w-full py-3.5 ${isRtl ? 'pr-10 pl-12' : 'pl-10 pr-12'} bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput('city')}
                  title={t.micFieldLabel}
                  className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-2 rounded-lg cursor-pointer transition-all ${
                    listeningField === 'city' ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {listeningField === 'city' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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
                  className="w-full py-3.5 pl-10 pr-12 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-right focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => toggleVoiceInput('phone')}
                  title={t.micFieldLabel}
                  className={`absolute right-2 p-2 rounded-lg cursor-pointer transition-all ${
                    listeningField === 'phone' ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {listeningField === 'phone' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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