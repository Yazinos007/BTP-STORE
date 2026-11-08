import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import {
  HardHat, Plus, Trash2, Users,
  Receipt, Star, MessageCircle, Loader2,
  Mic, MicOff, Volume2, Sparkles
} from 'lucide-react';

// =========================================================================
// 🏙️ قاموس المدن المغربية والمصطلحات الميدانية للترجمة الفورية (AR / FR / EN)
// =========================================================================
const MOROCCAN_CITIES_DICT = [
  { ar: 'الدار البيضاء', fr: 'Casablanca', en: 'Casablanca', keys: ['الدار البيضاء', 'كازا', 'casablanca', 'casa'] },
  { ar: 'الرباط', fr: 'Rabat', en: 'Rabat', keys: ['الرباط', 'رباط', 'rabat'] },
  { ar: 'مراكش', fr: 'Marrakech', en: 'Marrakech', keys: ['مراكش', 'marrakech'] },
  { ar: 'طنجة', fr: 'Tanger', en: 'Tangier', keys: ['طنجة', 'طنجه', 'tanger', 'tangier'] },
  { ar: 'فاس', fr: 'Fès', en: 'Fes', keys: ['فاس', 'fes', 'fès'] },
  { ar: 'أكادير', fr: 'Agadir', en: 'Agadir', keys: ['أكادير', 'اكادير', 'agadir'] },
  { ar: 'مكناس', fr: 'Meknès', en: 'Meknes', keys: ['مكناس', 'meknes', 'meknès'] },
  { ar: 'وجدة', fr: 'Oujda', en: 'Oujda', keys: ['وجدة', 'وجده', 'oujda'] },
  { ar: 'القنيطرة', fr: 'Kénitra', en: 'Kenitra', keys: ['القنيطرة', 'قنيطرة', 'kenitra', 'kénitra'] },
  { ar: 'تطوان', fr: 'Tétouan', en: 'Tetouan', keys: ['تطوان', 'tetouan', 'tétouan'] },
  { ar: 'بني ملال', fr: 'Béni Mellal', en: 'Beni Mellal', keys: ['بني ملال', 'بنيملال', 'beni mellal', 'béni mellal'] },
  { ar: 'قصبة تادلة', fr: 'Kasbah Tadla', en: 'Kasbah Tadla', keys: ['قصبة تادلة', 'تادلة', 'تادلا', 'kasbah tadla', 'tadla'] },
  { ar: 'خنيفرة', fr: 'Khénifra', en: 'Khenifra', keys: ['خنيفرة', 'خنيفره', 'khenifra', 'khénifra'] },
  { ar: 'خريبكة', fr: 'Khouribga', en: 'Khouribga', keys: ['خريبكة', 'خريبكه', 'khouribga'] },
  { ar: 'المحمدية', fr: 'Mohammedia', en: 'Mohammedia', keys: ['المحمدية', 'محمدية', 'mohammedia'] },
  { ar: 'الجديدة', fr: 'El Jadida', en: 'El Jadida', keys: ['الجديدة', 'جديدة', 'el jadida', 'jadida'] },
  { ar: 'آسفي', fr: 'Safi', en: 'Safi', keys: ['آسفي', 'اسفي', 'safi'] },
  { ar: 'الناظور', fr: 'Nador', en: 'Nador', keys: ['الناظور', 'ناظور', 'nador'] },
  { ar: 'ورزازات', fr: 'Ouarzazate', en: 'Ouarzazate', keys: ['ورزازات', 'ouarzazate'] },
  { ar: 'العيون', fr: 'Laâyoune', en: 'Laayoune', keys: ['العيون', 'laayoune', 'laâyoune'] }
];

const PROJECT_TEMPLATES = [
  { id: 'macon', icon: '🧱', ar: 'أشغال بناء وضالة', fr: 'Travaux Maçonnerie & Dalle', en: 'Masonry & Concrete Works', keys: ['بناء', 'بناي', 'ضالة', 'ياجور', 'مرطوب', 'maçonnerie', 'dalle', 'masonry'] },
  { id: 'plombier', icon: '🚰', ar: 'ترصيص وسباكة حمامات', fr: 'Plomberie & Sanitaire', en: 'Plumbing & Sanitary', keys: ['بلومبي', 'سباكة', 'ترصيص', 'ماء', 'قوادس', 'حمام', 'plomberie', 'sanitaire', 'plumbing'] },
  { id: 'electricien', icon: '⚡', ar: 'تمديدات كهربائية وإنارة', fr: 'Installation Électrique', en: 'Electrical Installation', keys: ['تريسيان', 'كهرباء', 'ضو', 'الضو', 'إنارة', 'كابلات', 'électricité', 'électrique', 'electrical'] },
  { id: 'peintre', icon: '🎨', ar: 'صباغة وديكور واجهات', fr: 'Peinture & Décoration', en: 'Painting & Facade Decor', keys: ['صباغة', 'صباغ', 'دهان', 'خيال', 'فاصاد', 'peinture', 'décoration', 'painting'] },
  { id: 'carreleur', icon: '⬜', ar: 'تركيب زليج ورخام', fr: 'Pose Carrelage & Marbre', en: 'Tiling & Marble Work', keys: ['زليج', 'زلايجي', 'رخام', 'سيراميك', 'فايونص', 'carrelage', 'marbre', 'tiling'] },
  { id: 'platrier', icon: '🏛️', ar: 'جبس وأسقف معلقة', fr: 'Plâtre & Faux Plafond', en: 'Plaster & False Ceiling', keys: ['جبس', 'جباس', 'قبص', 'بلافو', 'plâtre', 'plafond', 'plaster'] },
  { id: 'menuisier', icon: '🪵', ar: 'نجارة خشب وألمنيوم', fr: 'Menuiserie Bois & Alu', en: 'Wood & Alu Carpentry', keys: ['نجارة', 'نجار', 'خشب', 'ألمنيوم', 'المنيوم', 'بيبان', 'شراجم', 'menuiserie', 'aluminium'] },
  { id: 'etancheite', icon: '🛡️', ar: 'عزل مائي وإيتانشيتي', fr: 'Étanchéité & Isolation', en: 'Waterproofing & Insulation', keys: ['عزل', 'ايتانشيتي', 'إيتانشيتي', 'سطح', 'زفت', 'étanchéité', 'isolation'] }
];

const EXPENSE_CATEGORIES = [
  { id: 'journalier', icon: '👷‍♂️', ar: 'أجرة عامل يومي (خدام)', fr: 'Ouvrier Journalier', en: 'Daily Worker Wage', keys: ['خدام', 'عامل', 'معلم', 'نهار', 'يومية', 'خلصت', 'عطيت', 'أجرة', 'ouvrier', 'journalier', 'salaire'] },
  { id: 'transport', icon: '⛽', ar: 'تنقل وكازوال', fr: 'Transport & Gasoil', en: 'Transport & Fuel', keys: ['كازوال', 'مازوط', 'ليساند', 'طاكسي', 'تنقل', 'ديبلاصما', 'مركوب', 'ترانسبور', 'transport', 'gasoil', 'carburant'] },
  { id: 'outillage', icon: '🛠️', ar: 'شراء أدوات وسلعة', fr: 'Outillage & Matériaux', en: 'Tools & Materials', keys: ['سلعة', 'أدوات', 'دوزان', 'شريت', 'معدات', 'سيما', 'صباغة', 'قوادس', 'outillage', 'matériaux', 'achat'] },
  { id: 'other', icon: '➕', ar: 'مصروف آخر', fr: 'Autre Dépense', en: 'Other Expense', keys: ['فطور', 'غداء', 'قهوة', 'تليفون', 'تعبئة', 'أخرى', 'autre'] }
];

// 🔢 محرك تحويل الأرقام والمبالغ المالية المنطوقة بالدارجة المغربية والعربية والفرنسية إلى أرقام
function parseSpokenDarijaNumbers(rawText) {
  if (!rawText) return '';
  let str = rawText.toLowerCase();

  // تحويل الأرقام الشرقية (٠-٩) إلى غربية
  const eastern = '٠١٢٣٤٥٦٧٨٩';
  str = str.replace(/[٠-٩]/g, (d) => eastern.indexOf(d));

  // تحويل العبارات المالية المركبة بالدارجة المغربية
  const compoundAmounts = [
    [/عشرين\s*ألف|عشرين\s*الف/g, '20000'],
    [/خمسطاش\s*ألف|خمسة\s*عشر\s*ألف/g, '15000'],
    [/طنعش\s*ألف|اثنا\s*عشر\s*ألف/g, '12000'],
    [/عشرة\s*آلاف|عشر\s*آلاف|عشرة\s*الاف|عشرالاف/g, '10000'],
    [/تسعة\s*آلاف|تسع\s*آلاف/g, '9000'],
    [/تمنية\s*آلاف|ثمانية\s*آلاف/g, '8000'],
    [/سبعة\s*آلاف|سبع\s*آلاف/g, '7000'],
    [/ستة\s*آلاف|ست\s*آلاف/g, '6000'],
    [/خمسة\s*آلاف|خمس\s*آلاف|خمسالاف/g, '5000'],
    [/أربعة\s*آلاف|ربعة\s*آلاف|اربع\s*الاف/g, '4000'],
    [/ثلاثة\s*آلاف|تلاتة\s*آلاف|تلات\s*الاف/g, '3000'],
    [/ألفين|الفين|جوج\s*آلاف/g, '2000'],
    [/ألف\s*وخمسمائة|ألف\s*وخمسمية|الف\s*وخمسميه/g, '1500'],
    [/ألف|الف/g, '1000'],
    [/تسعمائة|تسعمية|تسعميه/g, '900'],
    [/ثمانمائة|تمنمية|تمنميه/g, '800'],
    [/سبعمائة|سبعمية|سبعميه/g, '700'],
    [/ستمائة|ستمية|ستميه/g, '600'],
    [/خمسمائة|خمسمية|خمسميه/g, '500'],
    [/أربعمائة|ربعمية|اربعميه/g, '400'],
    [/ثلاثمائة|تلاتمية|تلاتميه/g, '300'],
    [/مائتين|ميتين|مياتين/g, '200'],
    [/مائة\s*وخمسين|مية\s*وخمسين|ميه\s*وخمسين/g, '150'],
    [/مائة|مية|ميه|مليون/g, '100']
  ];

  compoundAmounts.forEach(([pattern, val]) => {
    str = str.replace(pattern, ` ${val} `);
  });

  const singleDigits = {
    'صفر': '0', 'زيرو': '0', 'zero': '0', 'zéro': '0',
    'واحد': '1', 'واحدة': '1', 'un': '1', 'one': '1',
    'اثنان': '2', 'إثنان': '2', 'جوج': '2', 'زوج': '2', 'deux': '2', 'two': '2',
    'ثلاثة': '3', 'تلاتة': '3', 'تلاته': '3', 'trois': '3', 'three': '3',
    'أربعة': '4', 'اربعة': '4', 'ربعة': '4', 'quatre': '4', 'four': '4',
    'خمسة': '5', 'خمسه': '5', 'cinq': '5', 'five': '5',
    'ستة': '6', 'سته': '6', 'ست': '6', 'six': '6',
    'سبعة': '7', 'سبعه': '7', 'sept': '7', 'seven': '7',
    'ثمانية': '8', 'تمنية': '8', 'huit': '8', 'eight': '8',
    'تسعة': '9', 'تسعود': '9', 'neuf': '9', 'nine': '9',
    'عشرة': '10', 'عشره': '10', 'عشرين': '20', 'تلاتين': '30', 'ثلاثين': '30',
    'أربعين': '40', 'ربعين': '40', 'خمسين': '50', 'ستين': '60', 'سبعين': '70', 'ثمانين': '80', 'تمنين': '80', 'تسعين': '90'
  };

  Object.keys(singleDigits).forEach((w) => {
    const regex = new RegExp(`(^|\\s)${w}(?=\\s|$)`, 'g');
    str = str.replace(regex, ` ${singleDigits[w]} `);
  });

  return str;
}

// 🌐 ترجمة أسماء المدن، الأوراش، والمصاريف تلقائياً حسب اللغة الحالية
function localizeCityName(rawCity, lang) {
  if (!rawCity || rawCity === '-') return '-';
  const lower = rawCity.toLowerCase();
  for (const c of MOROCCAN_CITIES_DICT) {
    if (c.keys.some((k) => lower.includes(k)) || lower.includes(c.ar.toLowerCase()) || lower.includes(c.fr.toLowerCase())) {
      return lang === 'ar' ? c.ar : lang === 'fr' ? c.fr : c.en;
    }
  }
  return rawCity;
}

function localizeProjectTitle(rawTitle, lang) {
  if (!rawTitle) return '';
  const lower = rawTitle.toLowerCase();
  for (const tpl of PROJECT_TEMPLATES) {
    if (
      tpl.keys.some((k) => lower.includes(k)) ||
      lower.includes(tpl.ar.toLowerCase()) ||
      lower.includes(tpl.fr.toLowerCase()) ||
      lower.includes(tpl.en.toLowerCase())
    ) {
      return lang === 'ar' ? tpl.ar : lang === 'fr' ? tpl.fr : tpl.en;
    }
  }
  return rawTitle;
}

function localizeExpenseCategory(catId, lang) {
  const found = EXPENSE_CATEGORIES.find((c) => c.id === catId) || EXPENSE_CATEGORIES[0];
  return lang === 'ar' ? found.ar : lang === 'fr' ? found.fr : found.en;
}

function localizeExpenseLabel(rawLabel, categoryId, lang) {
  if (!rawLabel) return '';
  const lower = rawLabel.toLowerCase();
  // إذا كان يحتوي على اسم عامل مع يومية، نترجم البادئة مع الحفاظ على اسم العامل
  const workerMatch = rawLabel.match(/(?:يومية|أجرة|خلصت|المعلم|الخدام|journée|ouvrier|daily wage)\s+([أ-يa-zA-Z]+)/i);
  if (workerMatch && workerMatch[1]) {
    const workerName = workerMatch[1];
    return lang === 'ar'
      ? `يومية العامل ${workerName}`
      : lang === 'fr'
      ? `Journée ouvrier ${workerName}`
      : `Daily wage: ${workerName}`;
  }

  for (const cat of EXPENSE_CATEGORIES) {
    if (
      lower === cat.ar.toLowerCase() ||
      lower === cat.fr.toLowerCase() ||
      lower === cat.en.toLowerCase()
    ) {
      return lang === 'ar' ? cat.ar : lang === 'fr' ? cat.fr : cat.en;
    }
  }
  return rawLabel;
}

// =========================================================================
// 🔊 مشغل المرشد الصوتي النسائي الموحد (عربية + فرنسية سحابية + إنجليزية)
// =========================================================================
function useSmartAudioAndMic(language) {
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [listeningField, setListeningField] = useState(null);
  const [spokenPreview, setSpokenPreview] = useState('');

  const cloudAudioRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (cloudAudioRef.current) {
        cloudAudioRef.current.onended = null;
        cloudAudioRef.current.onerror = null;
        cloudAudioRef.current.pause();
        cloudAudioRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // إيقاف الصوت تلقائياً عند تغيير اللغة
  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.onended = null;
      cloudAudioRef.current.onerror = null;
      cloudAudioRef.current.pause();
      cloudAudioRef.current = null;
    }
    setIsSpeakingGuide(false);
  }, [language]);

  const toggleAudioGuide = (arSegments, frSegments, enText) => {
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

    // 1. الإنجليزية (Samantha Female Voice)
    if (language === 'en' && 'speechSynthesis' in window) {
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

    // 2. درع no-referrer لمنع حظر الصوت السحابي
    let metaReferrer = document.querySelector('meta[name="referrer"]');
    if (!metaReferrer) {
      metaReferrer = document.createElement('meta');
      metaReferrer.name = 'referrer';
      document.head.appendChild(metaReferrer);
    }
    metaReferrer.content = 'no-referrer';

    // 3. العربية والفرنسية عبر الصوت النسائي السحابي الشجي
    const segments = language === 'ar' ? arSegments : frSegments;
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

  const triggerVoiceInput = (fieldKey, onTranscriptCallback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'ar' ? 'يرجى استخدام متصفح Chrome أو Safari لتشغيل الميكروفون الصوتي.' : 'Veuillez utiliser Chrome ou Safari pour le micro.');
      return;
    }

    if (listeningField === fieldKey && recognitionRef.current) {
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

        recognition.onstart = () => setListeningField(fieldKey);

        recognition.onresult = (event) => {
          let fullText = '';
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript;
          }
          const clean = fullText.trim();
          if (!clean) return;
          setSpokenPreview(clean);
          onTranscriptCallback(clean);
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

  return {
    isSpeakingGuide,
    listeningField,
    spokenPreview,
    toggleAudioGuide,
    triggerVoiceInput
  };
}

// دالة موحدة لجلب وحفظ بيانات الحرفي الميدانية في سحابة Supabase
async function loadArtisanCloudData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, store: { projects: [], clients: [], expenses: [], reviews: [] } };

  const metaStore = user.user_metadata?.artisan_workspace || {};
  return {
    user,
    store: {
      projects: Array.isArray(metaStore.projects) ? metaStore.projects : [],
      clients: Array.isArray(metaStore.clients) ? metaStore.clients : [],
      expenses: Array.isArray(metaStore.expenses) ? metaStore.expenses : [],
      reviews: Array.isArray(metaStore.reviews) ? metaStore.reviews : []
    }
  };
}

async function saveArtisanCloudData(newStore) {
  await supabase.auth.updateUser({
    data: { artisan_workspace: newStore }
  });
}

// =========================================================================
// 1. قسم أوراشي الجارية (Chantiers en Cours) - مزود بالمساعد الصوتي والدارجة
// =========================================================================
export function ProviderProjectsPage() {
  const { isDarkMode = true } = useOutletContext() || {};
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState({ projects: [], clients: [], expenses: [], reviews: [] });
  const [form, setForm] = useState({ title: '', client: '', city: '', budget: '', progress: 20 });

  const { isSpeakingGuide, listeningField, spokenPreview, toggleAudioGuide, triggerVoiceInput } = useSmartAudioAndMic(language);

  useEffect(() => {
    loadArtisanCloudData().then(({ store: s }) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  // ترجمة عنوان الورش والمدينة في خانات الإدخال عند تبديل اللغة
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      title: prev.title ? localizeProjectTitle(prev.title, language) : '',
      city: prev.city ? localizeCityName(prev.city, language) : ''
    }));
  }, [language]);

  // تحليل جملة صوتية كاملة بالدارجة لإضافة ورش جديد
  const parseVoiceToProject = (speech) => {
    const normalized = parseSpokenDarijaNumbers(speech);
    const lower = normalized.toLowerCase();

    // 1. التقاط نوع الورش
    let detectedTitle = '';
    for (const tpl of PROJECT_TEMPLATES) {
      if (tpl.keys.some((k) => lower.includes(k))) {
        detectedTitle = language === 'ar' ? tpl.ar : language === 'fr' ? tpl.fr : tpl.en;
        break;
      }
    }

    // 2. التقاط المدينة
    let detectedCity = '';
    for (const c of MOROCCAN_CITIES_DICT) {
      if (c.keys.some((k) => lower.includes(k))) {
        detectedCity = language === 'ar' ? c.ar : language === 'fr' ? c.fr : c.en;
        break;
      }
    }

    // 3. التقاط المبلغ المالي
    const numbers = normalized.match(/\d{3,7}/g);
    const detectedBudget = numbers && numbers.length > 0 ? numbers[numbers.length - 1] : '';

    // 4. التقاط اسم الزبون
    let detectedClient = '';
    const clientMatch = speech.match(/(?:مع|عند|للزبون|الزبون|سي|الحاج|مدام|client|chez)\s+([أ-يa-zA-Z]+(?:\s+[أ-يa-zA-Z]+)?)/i);
    if (clientMatch && clientMatch[1]) {
      detectedClient = clientMatch[1].replace(/\b(في|ف|بمدينة|ب|درهم)\b.*/i, '').trim();
    }

    setForm((prev) => ({
      ...prev,
      title: detectedTitle || prev.title || speech.trim(),
      client: detectedClient || prev.client,
      city: detectedCity || prev.city,
      budget: detectedBudget || prev.budget
    }));
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const newProj = {
      id: Date.now().toString(),
      title: form.title.trim(),
      client: form.client.trim() || '-',
      city: form.city.trim() || '-',
      budget: Number(form.budget) || 0,
      progress: Number(form.progress) || 0,
      status: Number(form.progress) >= 100 ? 'completed' : 'active',
      created_at: new Date().toLocaleDateString('fr-FR')
    };
    const updated = { ...store, projects: [newProj, ...store.projects] };
    setStore(updated);
    await saveArtisanCloudData(updated);
    setForm({ title: '', client: '', city: '', budget: '', progress: 20 });
    setSaving(false);
  };

  const handleUpdateProgress = async (id, newProg) => {
    const updatedProjects = store.projects.map(p =>
      p.id === id ? { ...p, progress: newProg, status: newProg >= 100 ? 'completed' : 'active' } : p
    );
    const updated = { ...store, projects: updatedProjects };
    setStore(updated);
    await saveArtisanCloudData(updated);
  };

  const handleDelete = async (id) => {
    const updated = { ...store, projects: store.projects.filter(p => p.id !== id) };
    setStore(updated);
    await saveArtisanCloudData(updated);
  };

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const inputStyle = isDarkMode
    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

  const activeCount = store.projects.filter(p => p.status !== 'completed').length;
  const completedCount = store.projects.filter(p => p.status === 'completed').length;
  const totalValue = store.projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة + المرشد الصوتي الناطق */}
      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <HardHat className="text-orange-500" size={28} />
            {language === 'ar' ? 'أوراشي الجارية (مرتبط بالسحابة)' : language === 'fr' ? 'Mes Chantiers en Cours' : 'My Active Workshops'}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {language === 'ar'
              ? 'تتبع تقدم أوراشك الحقيقية وميزانياتها بالصوت أو الكتابة لحظة بلحظة.'
              : language === 'fr'
              ? 'Suivez l\'avancement réel de vos chantiers par la voix ou par écrit.'
              : 'Track your real-time workshops and budgets via voice or text.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            toggleAudioGuide(
              [
                'مرحباً بك في قسم أوراشك الجارية بمنصة ساس بي تي بي',
                'اضغط على الزر البرتقالي وقل مثلاً: ورش صباغة مع الزبون أحمد في قصبة تادلة بعشرة آلاف درهم',
                'وسنقوم بملء خانات الورش لك تلقائياً'
              ],
              [
                'Bienvenue dans la gestion de vos chantiers en cours.',
                'Appuyez sur le microphone orange et dictez le nom du chantier, le client, la ville et le montant convenu.'
              ],
              'Welcome to your active workshops. Tap the orange microphone and speak the workshop title, client name, city, and agreed budget.'
            )
          }
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer border shrink-0 ${
            isSpeakingGuide
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-md'
              : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
          }`}
        >
          <Volume2 size={16} />
          {isSpeakingGuide
            ? (language === 'ar' ? '⏹️ إيقاف الصوت' : language === 'fr' ? '⏹️ Arrêter l\'audio' : '⏹️ Stop Audio')
            : (language === 'ar' ? '🔊 استمع للشرح الصوتي' : language === 'fr' ? '🔊 Écouter le guide vocal' : '🔊 Listen to Audio Guide')}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'الأوراش النشطة' : language === 'fr' ? 'Chantiers Actifs' : 'Active Workshops'}
          </span>
          <p className="text-3xl font-black text-orange-500 mt-1">{activeCount}</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'الأوراش المكتملة' : language === 'fr' ? 'Chantiers Terminés' : 'Completed Workshops'}
          </span>
          <p className="text-3xl font-black text-emerald-500 mt-1">{completedCount}</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'القيمة الإجمالية للأوراش' : language === 'fr' ? 'Valeur Totale des Chantiers' : 'Total Workshops Value'}
          </span>
          <p className="text-3xl font-black text-blue-500 mt-1" dir="ltr">{totalValue.toLocaleString()} MAD</p>
        </div>
      </div>

      {/* 🎙️ شريط الإدخال الصوتي الذكي للأوراش + القوالب البصرية السريعة */}
      <div className={`${cardBg} border-2 border-orange-500/40 rounded-3xl p-5 space-y-4 shadow-lg`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm md:text-base font-black text-orange-400 flex items-center gap-2">
              <Sparkles size={18} />
              {language === 'ar'
                ? '🎙️ أضف ورشاً جديداً بالصوت (بالدارجة المغربية أو العربية)'
                : language === 'fr'
                ? '🎙️ Ajoutez un chantier par la voix (Comprend Darija & Français)'
                : '🎙️ Add a Workshop by Voice (Understands Darija, AR & EN)'}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {language === 'ar'
                ? 'اضغط الميكروفون وقل مثلاً: "ورش زليج مع السي كريم في قصبة تادلة بـ 12000 درهم" أو اختر نوع الورش بالصورة:'
                : language === 'fr'
                ? 'Appuyez sur le micro et dites ex : "Chantier peinture avec M. Karim à Kasbah Tadla pour 12000 DH"'
                : 'Tap the mic and say e.g.: "Tiling project with Mr. Karim in Kasbah Tadla for 12000 MAD"'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerVoiceInput('smartProject', parseVoiceToProject)}
            className={`px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 shadow-md ${
              listeningField === 'smartProject'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950'
            }`}
          >
            {listeningField === 'smartProject' ? <MicOff size={16} /> : <Mic size={16} />}
            {listeningField === 'smartProject'
              ? (language === 'ar' ? 'جاري الاستماع... تكلم الآن' : language === 'fr' ? 'Écoute en cours...' : 'Listening...')
              : (language === 'ar' ? 'اضغط وتحدث لإضافة الورش' : language === 'fr' ? 'Appuyez et dictez le chantier' : 'Tap & Speak Workshop')}
          </button>
        </div>

        {spokenPreview && (
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs font-bold text-orange-300">
            🗣️ &ldquo;{spokenPreview}&rdquo;
          </div>
        )}

        {/* أيقونات اختيار سريع لنوع الورش */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {PROJECT_TEMPLATES.map((tpl) => {
            const label = language === 'ar' ? tpl.ar : language === 'fr' ? tpl.fr : tpl.en;
            const active = form.title === label;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setForm({ ...form, title: label })}
                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  active
                    ? 'border-orange-500 bg-orange-500/20 text-orange-300 scale-[1.03]'
                    : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span className="text-xl mb-1">{tpl.icon}</span>
                <span className="text-[10px] font-black leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* استمارة إضافة ورش جديد مع ميكروفون في كل خانة */}
      <form onSubmit={handleAddProject} className={`${cardBg} border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end`}>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'اسم الورش / الخدمة' : language === 'fr' ? 'Nom du chantier' : 'Workshop Title'}
          </label>
          <div className="relative flex items-center">
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder={language === 'ar' ? 'مثال: صباغة فيلا...' : language === 'fr' ? 'Ex: Peinture Villa...' : 'E.g., Villa Painting...'}
              className={`w-full px-3 py-2.5 ${isRtl ? 'pl-9' : 'pr-9'} rounded-xl border text-sm font-bold ${inputStyle}`}
              required
            />
            <button
              type="button"
              onClick={() => triggerVoiceInput('projTitle', (txt) => setForm((p) => ({ ...p, title: localizeProjectTitle(txt, language) })))}
              className={`absolute ${isRtl ? 'left-1.5' : 'right-1.5'} p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'projTitle' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'اسم الزبون' : language === 'fr' ? 'Client' : 'Client Name'}
          </label>
          <div className="relative flex items-center">
            <input
              value={form.client}
              onChange={e => setForm({ ...form, client: e.target.value })}
              placeholder={language === 'ar' ? 'اسم صاحب المشروع' : language === 'fr' ? 'Nom du client' : 'Client name'}
              className={`w-full px-3 py-2.5 ${isRtl ? 'pl-9' : 'pr-9'} rounded-xl border text-sm font-bold ${inputStyle}`}
            />
            <button
              type="button"
              onClick={() => triggerVoiceInput('projClient', (txt) => setForm((p) => ({ ...p, client: txt })))}
              className={`absolute ${isRtl ? 'left-1.5' : 'right-1.5'} p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'projClient' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'المدينة / الحي' : language === 'fr' ? 'Ville / Quartier' : 'City / Area'}
          </label>
          <div className="relative flex items-center">
            <input
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              placeholder={language === 'ar' ? 'قصبة تادلة، الدار البيضاء...' : 'Kasbah Tadla, Casa...'}
              className={`w-full px-3 py-2.5 ${isRtl ? 'pl-9' : 'pr-9'} rounded-xl border text-sm font-bold ${inputStyle}`}
            />
            <button
              type="button"
              onClick={() => triggerVoiceInput('projCity', (txt) => setForm((p) => ({ ...p, city: localizeCityName(txt, language) })))}
              className={`absolute ${isRtl ? 'left-1.5' : 'right-1.5'} p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'projCity' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'المبلغ المتفق عليه (MAD)' : language === 'fr' ? 'Montant convenu (MAD)' : 'Agreed Budget (MAD)'}
          </label>
          <div className="relative flex items-center" dir="ltr">
            <input
              type="number"
              value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })}
              placeholder="0"
              className={`w-full px-3 py-2.5 pr-9 rounded-xl border text-sm font-bold ${inputStyle}`}
            />
            <button
              type="button"
              onClick={() =>
                triggerVoiceInput('projBudget', (txt) => {
                  const num = parseSpokenDarijaNumbers(txt).replace(/\D/g, '');
                  if (num) setForm((p) => ({ ...p, budget: num }));
                })
              }
              className={`absolute right-1.5 p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'projBudget' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <button type="submit" disabled={saving} className="py-2.5 px-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Plus size={18} /> {saving ? '...' : (language === 'ar' ? 'إضافة الورش' : language === 'fr' ? 'Ajouter' : 'Add Workshop')}
        </button>
      </form>

      {/* قائمة الأوراش مع ترجمة تلقائية للعنوان والمدينة */}
      <div className="space-y-3">
        {store.projects.length === 0 ? (
          <div className={`${cardBg} border rounded-3xl p-12 text-center text-slate-400 font-bold`}>
            {language === 'ar'
              ? 'لا توجد أوراش مسجلة حالياً (0). أضف أول ورش لك بالصوت أو الكتابة من الأعلى!'
              : language === 'fr'
              ? 'Aucun chantier enregistré (0). Ajoutez votre premier chantier ci-dessus !'
              : 'No workshops registered yet (0). Add your first workshop above!'}
          </div>
        ) : (
          store.projects.map(p => (
            <div key={p.id} className={`${cardBg} border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg">{localizeProjectTitle(p.title, language)}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${p.progress >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {p.progress}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold flex items-center gap-3">
                  <span>👤 {p.client}</span>
                  <span>📍 {localizeCityName(p.city, language)}</span>
                  <span>📅 {p.created_at}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={p.progress}
                  onChange={e => handleUpdateProgress(p.id, Number(e.target.value))}
                  className="w-32 accent-orange-500 cursor-pointer"
                />
                <span className="font-black text-emerald-400 font-mono" dir="ltr">{Number(p.budget).toLocaleString()} MAD</span>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 2. قسم الزبناء والتسبيقات (Clients & Avances) - مزود بالمساعد الصوتي والدارجة
// =========================================================================
export function ProviderClientsPage() {
  const { isDarkMode = true } = useOutletContext() || {};
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState({ projects: [], clients: [], expenses: [], reviews: [] });
  const [form, setForm] = useState({ name: '', phone: '', total: '', avance: '' });

  const { isSpeakingGuide, listeningField, spokenPreview, toggleAudioGuide, triggerVoiceInput } = useSmartAudioAndMic(language);

  useEffect(() => {
    loadArtisanCloudData().then(({ store: s }) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  // تحليل جملة صوتية بالدارجة لإضافة زبون وتسبيقه
  const parseVoiceToClient = (speech) => {
    const normalized = parseSpokenDarijaNumbers(speech);

    // 1. استخراج رقم الهاتف المغربي إن ذكره
    const compact = normalized.replace(/[\s\-./]/g, '');
    const phoneMatch = compact.match(/(?:00212|\+212|212|0)([567]\d{8})/);
    const detectedPhone = phoneMatch ? `0${phoneMatch[1]}` : '';

    // 2. استخراج المبالغ المالية (الإجمالي والتسبيق)
    const withoutPhone = detectedPhone ? normalized.replace(phoneMatch[0], ' ') : normalized;
    const amounts = withoutPhone.match(/\b\d{2,7}\b/g) || [];
    let detectedTotal = '';
    let detectedAvance = '';
    if (amounts.length >= 2) {
      const n1 = Number(amounts[0]);
      const n2 = Number(amounts[1]);
      detectedTotal = String(Math.max(n1, n2));
      detectedAvance = String(Math.min(n1, n2));
    } else if (amounts.length === 1) {
      detectedTotal = amounts[0];
    }

    // 3. استخراج اسم الزبون
    let detectedName = '';
    const nameMatch = speech.match(/(?:الزبون|مع|سي|الحاج|مدام|اسمو|سميتو|client)\s+([أ-يa-zA-Z]+(?:\s+[أ-يa-zA-Z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      detectedName = nameMatch[1].replace(/\b(رقمو|هاتف|المجموع|عطاني|تسبيق)\b.*/i, '').trim();
    } else {
      const firstWords = speech.replace(/[0-9٠-٩]/g, '').trim().split(/\s+/).slice(0, 2).join(' ');
      if (firstWords) detectedName = firstWords;
    }

    setForm((prev) => ({
      ...prev,
      name: detectedName || prev.name,
      phone: detectedPhone || prev.phone,
      total: detectedTotal || prev.total,
      avance: detectedAvance || prev.avance
    }));
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const total = Number(form.total) || 0;
    const avance = Number(form.avance) || 0;
    const newClient = {
      id: Date.now().toString(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      total,
      avance,
      reste: Math.max(0, total - avance),
      date: new Date().toLocaleDateString('fr-FR')
    };
    const updated = { ...store, clients: [newClient, ...store.clients] };
    setStore(updated);
    await saveArtisanCloudData(updated);
    setForm({ name: '', phone: '', total: '', avance: '' });
  };

  const handleDelete = async (id) => {
    const updated = { ...store, clients: store.clients.filter(c => c.id !== id) };
    setStore(updated);
    await saveArtisanCloudData(updated);
  };

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const inputStyle = isDarkMode
    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  const totalAgreed = store.clients.reduce((s, c) => s + (Number(c.total) || 0), 0);
  const totalAvances = store.clients.reduce((s, c) => s + (Number(c.avance) || 0), 0);
  const totalReste = store.clients.reduce((s, c) => s + (Number(c.reste) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة + المرشد الصوتي */}
      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Users className="text-blue-500" size={28} />
            {language === 'ar' ? 'دفتر الزبناء والتسبيقات (Clients & Avances)' : language === 'fr' ? 'Carnet Clients & Avances' : 'Clients & Advances Ledger'}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {language === 'ar'
              ? 'سجّل تسبيقات الزبناء بالصوت أو الكتابة والباقي في ذمتهم مع تذكير مباشر عبر واتساب.'
              : language === 'fr'
              ? 'Gérez les avances reçues et le reste à payer de vos clients par la voix ou par écrit.'
              : 'Manage client advances and remaining balances via voice or text with WhatsApp reminders.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            toggleAudioGuide(
              [
                'مرحباً بك في دفتر الزبناء والتسبيقات بمنصة ساس بي تي بي',
                'اضغط على الزر البرتقالي وقل مثلاً: الزبون كريم المجموع عشرة آلاف درهم وعطاني تسبيق أربعة آلاف درهم',
                'وسنقوم بحساب الباقي وتسجيل الزبون تلقائياً'
              ],
              [
                'Bienvenue dans votre carnet clients et avances.',
                'Appuyez sur le microphone orange et dictez le nom du client, son téléphone, le montant total et l\'avance reçue.'
              ],
              'Welcome to your clients and advances ledger. Tap the orange microphone and speak the client name, phone number, total amount, and advance received.'
            )
          }
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer border shrink-0 ${
            isSpeakingGuide
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-md'
              : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
          }`}
        >
          <Volume2 size={16} />
          {isSpeakingGuide
            ? (language === 'ar' ? '⏹️ إيقاف الصوت' : language === 'fr' ? '⏹️ Arrêter l\'audio' : '⏹️ Stop Audio')
            : (language === 'ar' ? '🔊 استمع للشرح الصوتي' : language === 'fr' ? '🔊 Écouter le guide vocal' : '🔊 Listen to Audio Guide')}
        </button>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'إجمالي المتفق عليه' : language === 'fr' ? 'Total Convenu' : 'Total Agreed'}
          </span>
          <p className="text-3xl font-black text-blue-400 mt-1" dir="ltr">{totalAgreed.toLocaleString()} MAD</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'مجموع التسبيقات المقبوضة' : language === 'fr' ? 'Avances Encaissées' : 'Advances Received'}
          </span>
          <p className="text-3xl font-black text-emerald-400 mt-1" dir="ltr">{totalAvances.toLocaleString()} MAD</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'الباقي لدى الزبناء (الكريدي)' : language === 'fr' ? 'Reste à Encaisser (Crédit)' : 'Remaining Balance (Credit)'}
          </span>
          <p className="text-3xl font-black text-amber-400 mt-1" dir="ltr">{totalReste.toLocaleString()} MAD</p>
        </div>
      </div>

      {/* 🎙️ شريط تسجيل الزبون والتسبيق بالصوت بالدارجة */}
      <div className={`${cardBg} border-2 border-blue-500/40 rounded-3xl p-5 space-y-3 shadow-lg`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm md:text-base font-black text-blue-400 flex items-center gap-2">
              <Sparkles size={18} />
              {language === 'ar'
                ? '🎙️ سجّل الزبون وتسبيقه بالصوت (يفهم الدارجة المغربية)'
                : language === 'fr'
                ? '🎙️ Enregistrez un client et son avance par la voix'
                : '🎙️ Record Client & Advance by Voice'}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {language === 'ar'
                ? 'اضغط الميكروفون وقل مثلاً: "الزبون الحاج محمد رقمو 0661234567 المجموع 10000 درهم وعطاني تسبيق 4000 درهم"'
                : language === 'fr'
                ? 'Appuyez sur le micro et dites le nom du client, téléphone, montant total et avance reçue'
                : 'Tap the mic and say client name, phone, total agreed, and advance received'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerVoiceInput('smartClient', parseVoiceToClient)}
            className={`px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 shadow-md ${
              listeningField === 'smartClient'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950'
            }`}
          >
            {listeningField === 'smartClient' ? <MicOff size={16} /> : <Mic size={16} />}
            {listeningField === 'smartClient'
              ? (language === 'ar' ? 'جاري الاستماع... تكلم الآن' : 'Écoute en cours...')
              : (language === 'ar' ? 'اضغط وتحدث لتسجيل الزبون' : language === 'fr' ? 'Appuyez et dictez' : 'Tap & Speak Client')}
          </button>
        </div>

        {spokenPreview && (
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-300">
            🗣️ &ldquo;{spokenPreview}&rdquo;
          </div>
        )}
      </div>

      {/* نموذج إضافة زبون وتسبيق مع ميكروفون لكل حقل */}
      <form onSubmit={handleAddClient} className={`${cardBg} border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end`}>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'اسم الزبون' : language === 'fr' ? 'Nom du client' : 'Client Name'}
          </label>
          <div className="relative flex items-center">
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={language === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
              className={`w-full px-3 py-2.5 ${isRtl ? 'pl-9' : 'pr-9'} rounded-xl border text-sm font-bold ${inputStyle}`}
              required
            />
            <button
              type="button"
              onClick={() => triggerVoiceInput('cliName', (txt) => setForm((p) => ({ ...p, name: txt })))}
              className={`absolute ${isRtl ? 'left-1.5' : 'right-1.5'} p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'cliName' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'رقم الهاتف (واتساب)' : language === 'fr' ? 'Téléphone' : 'Phone (WhatsApp)'}
          </label>
          <div className="relative flex items-center" dir="ltr">
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="06..."
              className={`w-full px-3 py-2.5 pr-9 rounded-xl border text-sm font-bold ${inputStyle}`}
            />
            <button
              type="button"
              onClick={() =>
                triggerVoiceInput('cliPhone', (txt) => {
                  const digits = parseSpokenDarijaNumbers(txt).replace(/\D/g, '');
                  setForm((p) => ({ ...p, phone: digits || txt }));
                })
              }
              className={`absolute right-1.5 p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'cliPhone' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'المبلغ الإجمالي (MAD)' : language === 'fr' ? 'Total (MAD)' : 'Total Amount (MAD)'}
          </label>
          <div className="relative flex items-center" dir="ltr">
            <input
              type="number"
              value={form.total}
              onChange={e => setForm({ ...form, total: e.target.value })}
              placeholder="0"
              className={`w-full px-3 py-2.5 pr-9 rounded-xl border text-sm font-bold ${inputStyle}`}
              required
            />
            <button
              type="button"
              onClick={() =>
                triggerVoiceInput('cliTotal', (txt) => {
                  const num = parseSpokenDarijaNumbers(txt).replace(/\D/g, '');
                  if (num) setForm((p) => ({ ...p, total: num }));
                })
              }
              className={`absolute right-1.5 p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'cliTotal' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'التسبيق المقبوض (Avance)' : language === 'fr' ? 'Avance reçue (MAD)' : 'Advance Paid (MAD)'}
          </label>
          <div className="relative flex items-center" dir="ltr">
            <input
              type="number"
              value={form.avance}
              onChange={e => setForm({ ...form, avance: e.target.value })}
              placeholder="0"
              className={`w-full px-3 py-2.5 pr-9 rounded-xl border text-sm font-bold ${inputStyle}`}
            />
            <button
              type="button"
              onClick={() =>
                triggerVoiceInput('cliAvance', (txt) => {
                  const num = parseSpokenDarijaNumbers(txt).replace(/\D/g, '');
                  if (num) setForm((p) => ({ ...p, avance: num }));
                })
              }
              className={`absolute right-1.5 p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'cliAvance' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <button type="submit" className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Plus size={18} /> {language === 'ar' ? 'حفظ الزبون' : language === 'fr' ? 'Enregistrer' : 'Save Client'}
        </button>
      </form>

      {/* جدول الزبناء */}
      <div className="space-y-3">
        {store.clients.length === 0 ? (
          <div className={`${cardBg} border rounded-3xl p-12 text-center text-slate-400 font-bold`}>
            {language === 'ar' ? 'لا يوجد زبناء مسجلون بعد (0 MAD).' : language === 'fr' ? 'Aucun client enregistré pour le moment (0 MAD).' : 'No clients registered yet (0 MAD).'}
          </div>
        ) : (
          store.clients.map(c => (
            <div key={c.id} className={`${cardBg} border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
              <div>
                <h4 className="font-black text-base">{c.name}</h4>
                <p className="text-xs text-slate-400 font-bold">{c.phone || '-'} • {c.date}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs font-bold text-slate-400">
                  Total: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{c.total.toLocaleString()} MAD</strong>
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  Avance: <strong>{c.avance.toLocaleString()} MAD</strong>
                </span>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400">
                  {language === 'ar' ? 'الباقي:' : language === 'fr' ? 'Reste:' : 'Balance:'} {c.reste.toLocaleString()} MAD
                </span>
                {c.phone && c.reste > 0 && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/^0/, '212')}?text=${encodeURIComponent(
                      language === 'ar'
                        ? `السلام عليكم ${c.name}، تذكير ودي بخصوص المبلغ المتبقي (${c.reste} درهم). شكراً لكم.`
                        : language === 'fr'
                        ? `Bonjour ${c.name}, rappel amical concernant le solde restant (${c.reste} MAD). Merci.`
                        : `Hello ${c.name}, friendly reminder regarding the remaining balance (${c.reste} MAD). Thank you.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
                <button onClick={() => handleDelete(c.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 3. قسم أجور الخدامة والمصاريف (Journaliers & Frais) - مزود بالصوت والدارجة
// =========================================================================
export function ProviderExpensesPage() {
  const { isDarkMode = true } = useOutletContext() || {};
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState({ projects: [], clients: [], expenses: [], reviews: [] });
  const [form, setForm] = useState({ label: '', category: 'journalier', amount: '' });

  const { isSpeakingGuide, listeningField, spokenPreview, toggleAudioGuide, triggerVoiceInput } = useSmartAudioAndMic(language);

  useEffect(() => {
    loadArtisanCloudData().then(({ store: s }) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  // ترجمة بيان المصروف تلقائياً عند تغيير اللغة
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      label: prev.label ? localizeExpenseLabel(prev.label, prev.category, language) : ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // تحليل جملة صوتية بالدارجة لتسجيل مصروف أو أجرة عامل يومي
  const parseVoiceToExpense = (speech) => {
    const normalized = parseSpokenDarijaNumbers(speech);
    const lower = normalized.toLowerCase();

    // 1. تحديد تصنيف المصروف بالدارجة
    let detectedCat = 'journalier';
    for (const cat of EXPENSE_CATEGORIES) {
      if (cat.keys.some((k) => lower.includes(k))) {
        detectedCat = cat.id;
        break;
      }
    }

    // 2. استخراج المبلغ المالي بالدرهم
    const amounts = normalized.match(/\b\d{2,6}\b/g);
    const detectedAmount = amounts && amounts.length > 0 ? amounts[amounts.length - 1] : '';

    // 3. صياغة بيان المصروف بشكل نظيف
    let cleanLabel = speech
      .replace(/\b(ب|درهم|دريال|ألف|الف|مية|ميتين|درهما|dh|mad)\b/gi, '')
      .replace(/[0-9٠-٩]+/g, '')
      .trim();

    if (!cleanLabel) {
      cleanLabel = localizeExpenseCategory(detectedCat, language);
    } else {
      cleanLabel = localizeExpenseLabel(cleanLabel, detectedCat, language);
    }

    setForm({
      label: cleanLabel,
      category: detectedCat,
      amount: detectedAmount || form.amount
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.amount) return;
    const newExp = {
      id: Date.now().toString(),
      label: form.label.trim(),
      category: form.category,
      amount: Number(form.amount) || 0,
      date: new Date().toLocaleDateString('fr-FR')
    };
    const updated = { ...store, expenses: [newExp, ...store.expenses] };
    setStore(updated);
    await saveArtisanCloudData(updated);
    setForm({ label: '', category: 'journalier', amount: '' });
  };

  const handleDelete = async (id) => {
    const updated = { ...store, expenses: store.expenses.filter(x => x.id !== id) };
    setStore(updated);
    await saveArtisanCloudData(updated);
  };

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const inputStyle = isDarkMode
    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  const totalEncaisse = store.clients.reduce((s, c) => s + (Number(c.avance) || 0), 0);
  const totalExpenses = store.expenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const netProfit = totalEncaisse - totalExpenses;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة + المرشد الصوتي */}
      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Receipt className="text-emerald-500" size={28} />
            {language === 'ar' ? 'أجور الخدامة والمصاريف اليومية' : language === 'fr' ? 'Journaliers & Frais de Chantier' : 'Daily Wages & Site Expenses'}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {language === 'ar'
              ? 'سجّل يوميات العمال ومصاريف الكازوال والسلعة بالصوت أو الكتابة لمعرفة ربحك الصافي الحقيقي.'
              : language === 'fr'
              ? 'Suivez les salaires journaliers et vos frais par la voix ou par écrit pour connaître votre bénéfice net.'
              : 'Track daily worker wages and site expenses via voice or text to know your real net profit.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            toggleAudioGuide(
              [
                'مرحباً بك في قسم أجور الخدامة والمصاريف اليومية',
                'اضغط على الزر البرتقالي وقل مثلاً: خلصت المعلم رضوان مائتين درهم، أو كازوال وتنقل مائة وخمسين درهم',
                'وسنقوم بتصنيف المصروف وحساب ربحك الصافي تلقائياً'
              ],
              [
                'Bienvenue dans la gestion des ouvriers journaliers et frais de chantier.',
                'Appuyez sur le microphone orange et dictez votre dépense et son montant.'
              ],
              'Welcome to daily wages and site expenses. Tap the orange microphone and speak the worker wage or expense and the amount.'
            )
          }
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer border shrink-0 ${
            isSpeakingGuide
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-md'
              : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
          }`}
        >
          <Volume2 size={16} />
          {isSpeakingGuide
            ? (language === 'ar' ? '⏹️ إيقاف الصوت' : language === 'fr' ? '⏹️ Arrêter l\'audio' : '⏹️ Stop Audio')
            : (language === 'ar' ? '🔊 استمع للشرح الصوتي' : language === 'fr' ? '🔊 Écouter le guide vocal' : '🔊 Listen to Audio Guide')}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'المقبوضات الفعلية (التسبيقات)' : language === 'fr' ? 'Total Encaissé' : 'Total Collected'}
          </span>
          <p className="text-3xl font-black text-emerald-400 mt-1" dir="ltr">{totalEncaisse.toLocaleString()} MAD</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'مجموع المصاريف وأجور الخدامة' : language === 'fr' ? 'Total Charges & Journaliers' : 'Total Wages & Expenses'}
          </span>
          <p className="text-3xl font-black text-red-400 mt-1" dir="ltr">{totalExpenses.toLocaleString()} MAD</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">
            {language === 'ar' ? 'الربح الصافي الحقيقي' : language === 'fr' ? 'Bénéfice Net Réel' : 'Real Net Profit'}
          </span>
          <p className={`text-3xl font-black mt-1 ${netProfit >= 0 ? 'text-blue-400' : 'text-red-500'}`} dir="ltr">
            {netProfit.toLocaleString()} MAD
          </p>
        </div>
      </div>

      {/* 🎙️ شريط تسجيل المصروف أو أجرة الخدام بالصوت بالدارجة + الأيقونات البصرية */}
      <div className={`${cardBg} border-2 border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-lg`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm md:text-base font-black text-emerald-400 flex items-center gap-2">
              <Sparkles size={18} />
              {language === 'ar'
                ? '🎙️ سجّل أجرة خدام أو مصروف بالصوت (بالدارجة المغربية)'
                : language === 'fr'
                ? '🎙️ Enregistrez un journalier ou frais par la voix'
                : '🎙️ Record Daily Wage or Expense by Voice'}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {language === 'ar'
                ? 'اضغط الميكروفون وقل مثلاً: "خلصت المعلم رضوان 200 درهم" أو "كازوال وتنقل 150 درهم" أو اختر بالصورة:'
                : language === 'fr'
                ? 'Appuyez sur le micro et dites ex : "Journée ouvrier Redouane 200 DH" ou "Transport gasoil 150 DH"'
                : 'Tap the mic and say e.g.: "Worker Redouane 200 MAD" or "Fuel and transport 150 MAD"'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerVoiceInput('smartExpense', parseVoiceToExpense)}
            className={`px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 shadow-md ${
              listeningField === 'smartExpense'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950'
            }`}
          >
            {listeningField === 'smartExpense' ? <MicOff size={16} /> : <Mic size={16} />}
            {listeningField === 'smartExpense'
              ? (language === 'ar' ? 'جاري الاستماع... تكلم الآن' : 'Écoute en cours...')
              : (language === 'ar' ? 'اضغط وتحدث لتسجيل المصروف' : language === 'fr' ? 'Appuyez et dictez' : 'Tap & Speak Expense')}
          </button>
        </div>

        {spokenPreview && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
            🗣️ &ldquo;{spokenPreview}&rdquo;
          </div>
        )}

        {/* بطاقات التصنيف البصرية السريعة */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {EXPENSE_CATEGORIES.map((cat) => {
            const label = language === 'ar' ? cat.ar : language === 'fr' ? cat.fr : cat.en;
            const active = form.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm((p) => ({ ...p, category: cat.id, label: p.label || label }))}
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  active
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                    : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-black text-start leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* استمارة إضافة مصروف مع ميكروفون في كل حقل */}
      <form onSubmit={handleAddExpense} className={`${cardBg} border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end`}>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'بيان المصروف / اسم العامل' : language === 'fr' ? 'Désignation / Ouvrier' : 'Description / Worker'}
          </label>
          <div className="relative flex items-center">
            <input
              value={form.label}
              onChange={e => setForm({ ...form, label: e.target.value })}
              placeholder={language === 'ar' ? 'مثال: يومية المعلم رضوان' : language === 'fr' ? 'Ex: Journée ouvrier Redouane' : 'E.g., Worker Redouane'}
              className={`w-full px-3 py-2.5 ${isRtl ? 'pl-9' : 'pr-9'} rounded-xl border text-sm font-bold ${inputStyle}`}
              required
            />
            <button
              type="button"
              onClick={() => triggerVoiceInput('expLabel', (txt) => setForm((p) => ({ ...p, label: localizeExpenseLabel(txt, p.category, language) })))}
              className={`absolute ${isRtl ? 'left-1.5' : 'right-1.5'} p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'expLabel' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'النوع' : language === 'fr' ? 'Catégorie' : 'Category'}
          </label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm font-bold ${inputStyle}`}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                {language === 'ar' ? cat.ar : language === 'fr' ? cat.fr : cat.en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            {language === 'ar' ? 'المبلغ (MAD)' : language === 'fr' ? 'Montant (MAD)' : 'Amount (MAD)'}
          </label>
          <div className="relative flex items-center" dir="ltr">
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
              className={`w-full px-3 py-2.5 pr-9 rounded-xl border text-sm font-bold ${inputStyle}`}
              required
            />
            <button
              type="button"
              onClick={() =>
                triggerVoiceInput('expAmount', (txt) => {
                  const num = parseSpokenDarijaNumbers(txt).replace(/\D/g, '');
                  if (num) setForm((p) => ({ ...p, amount: num }));
                })
              }
              className={`absolute right-1.5 p-1.5 rounded-lg cursor-pointer ${
                listeningField === 'expAmount' ? 'bg-red-500 text-white animate-pulse' : 'text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        <button type="submit" className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Plus size={18} /> {language === 'ar' ? 'تسجيل المصروف' : language === 'fr' ? 'Ajouter' : 'Add Expense'}
        </button>
      </form>

      {/* قائمة المصاريف مع الترجمة الفورية */}
      <div className="space-y-3">
        {store.expenses.length === 0 ? (
          <div className={`${cardBg} border rounded-3xl p-12 text-center text-slate-400 font-bold`}>
            {language === 'ar' ? 'لا توجد مصاريف مسجلة بعد (0 MAD).' : language === 'fr' ? 'Aucune dépense enregistrée (0 MAD).' : 'No expenses recorded yet (0 MAD).'}
          </div>
        ) : (
          store.expenses.map(x => (
            <div key={x.id} className={`${cardBg} border rounded-2xl p-4 flex items-center justify-between`}>
              <div>
                <p className="font-black text-sm">{localizeExpenseLabel(x.label, x.category, language)}</p>
                <span className="text-xs text-slate-400 font-bold">
                  {localizeExpenseCategory(x.category, language)} • {x.date}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-red-400 font-mono" dir="ltr">-{Number(x.amount).toLocaleString()} MAD</span>
                <button onClick={() => handleDelete(x.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 4. قسم آراء الزبناء والتوصيات (Avis & Recommandations)
// =========================================================================
export function ProviderReviewsPage() {
  const { isDarkMode = true } = useOutletContext() || {};
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState({ projects: [], clients: [], expenses: [], reviews: [] });

  const { isSpeakingGuide, toggleAudioGuide } = useSmartAudioAndMic(language);

  useEffect(() => {
    loadArtisanCloudData().then(({ store: s }) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Star className="text-amber-400 fill-amber-400" size={28} />
            {language === 'ar' ? 'تقييمات الزبناء وسمعة الورشة' : language === 'fr' ? 'Avis & Recommandations Clients' : 'Client Reviews & Workshop Reputation'}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {language === 'ar'
              ? 'التقييمات الموثقة ترفع ترتيبك في رادار المقاولين والمهندسين.'
              : language === 'fr'
              ? 'Les avis vérifiés augmentent votre visibilité auprès des entrepreneurs et architectes.'
              : 'Verified reviews boost your ranking on the contractors and architects radar.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              toggleAudioGuide(
                [
                  'مرحباً بك في قسم تقييمات الزبناء وسمعة الورشة',
                  'بمجرد إنهاء أوراشك مع المقاولين والمهندسين في المنصة، ستظهر تقييماتهم وتوصياتهم هنا لرفع ترتيبك'
                ],
                [
                  'Bienvenue dans vos avis et recommandations clients.',
                  'Vos évaluations vérifiées augmentent votre visibilité sur la plateforme.'
                ],
                'Welcome to your client reviews and recommendations. Verified reviews boost your visibility on the platform.'
              )
            }
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer border ${
              isSpeakingGuide
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-md'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
            }`}
          >
            <Volume2 size={16} />
            {isSpeakingGuide
              ? (language === 'ar' ? '⏹️ إيقاف الصوت' : language === 'fr' ? '⏹️ Arrêter' : '⏹️ Stop')
              : (language === 'ar' ? '🔊 استمع للشرح الصوتي' : language === 'fr' ? '🔊 Guide vocal' : '🔊 Audio Guide')}
          </button>

          <div className="text-center px-5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-2xl font-black text-amber-400">{store.reviews.length}</span>
            <p className="text-[10px] font-black text-slate-400 uppercase">
              {language === 'ar' ? 'تقييم موثق' : language === 'fr' ? 'Avis vérifiés' : 'Verified'}
            </p>
          </div>
        </div>
      </div>

      {store.reviews.length === 0 && (
        <div className={`${cardBg} border rounded-3xl p-12 text-center space-y-3`}>
          <Star size={40} className="mx-auto text-amber-400 opacity-50" />
          <p className="font-black text-base">
            {language === 'ar' ? 'لا توجد تقييمات مسجلة بعد (0)' : language === 'fr' ? 'Aucun avis client pour le moment (0)' : 'No client reviews yet (0)'}
          </p>
          <p className="text-xs text-slate-400 font-bold max-w-md mx-auto">
            {language === 'ar'
              ? 'بمجرد إنهاء أوراشك مع المقاولين والمهندسين على المنصة، ستظهر تقييماتهم وتوصياتهم هنا تلقائياً.'
              : language === 'fr'
              ? 'Dès que vous terminez un chantier sur la plateforme, les évaluations de vos clients apparaîtront ici automatiquement.'
              : 'Once you complete workshops on the platform, client ratings and recommendations will appear here automatically.'}
          </p>
        </div>
      )}
    </div>
  );
}