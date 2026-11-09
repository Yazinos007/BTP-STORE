import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../store/useSettingsStore';
import { supabase } from '../../lib/supabase';
import SupplierProfile from '../../components/v2/SupplierProfile';
import ProjectCart from '../../components/v2/ProjectCart';
import { 
  Search, Mic, MicOff, Volume2, Camera, FileText, MapPin, CheckCircle, Clock, Star, 
  ShieldCheck, ShoppingCart, Filter, Package, Zap, Droplet, PaintRoller, 
  Hammer, ArrowRight, Plus, CheckCircle2, TrendingUp, TrendingDown, Briefcase,
  Coins, Globe, Bitcoin, X, Building2, Timer, Loader2,
  HardHat, LayoutGrid, Flame, Component, AppWindow, Wind, ArrowUpDown, Cctv, Umbrella, 
  Sparkles, Trees, Siren, PenTool, Compass, Calculator, Sofa, Mountain, Layers, Factory, Waves,
  Tractor, Wrench, Truck, Trash, FileCheck, Shield, Award, MoreHorizontal
} from 'lucide-react';

const getCurrencySymbol = (curr) => {
  const symbols = { MAD: 'MAD', USD: '$', EUR: '€', SAR: 'SAR', AED: 'AED', KWD: 'KWD', CNY: '¥', INR: '₹', CHF: 'CHF', USDT: '₮', BTC: '₿', ETH: '⟠', SOL: '◎', ICX: '🌐', OM: '🏢', BST: '🧱', ALGO: '⚙️', BRICS: '🤝' };
  return symbols[curr] || curr;
};

const getCurrencyIcon = (curr) => {
  if(['BTC', 'ETH', 'SOL', 'ICX', 'OM', 'BST', 'ALGO'].includes(curr)) return <Bitcoin size={16} className="text-amber-500"/>;
  if(['USDT', 'USDC'].includes(curr)) return <Coins size={16} className="text-emerald-500"/>;
  if(curr === 'BRICS') return <Globe size={16} className="text-blue-500"/>;
  if(curr === 'USD') return <span className="font-black text-xs">🇺🇸</span>;
  if(curr === 'EUR') return <span className="font-black text-xs">🇪🇺</span>;
  if(curr === 'SAR') return <span className="font-black text-xs">🇸🇦</span>;
  if(curr === 'AED') return <span className="font-black text-xs">🇦🇪</span>;
  if(curr === 'KWD') return <span className="font-black text-xs">🇰🇼</span>;
  if(curr === 'CNY') return <span className="font-black text-xs">🇨🇳</span>;
  if(curr === 'INR') return <span className="font-black text-xs">🇮🇳</span>;
  if(curr === 'CHF') return <span className="font-black text-xs">🇨🇭</span>;
  return <span className="font-black text-xs">🇲🇦</span>;
};

// 🔢 تحويل الأرقام المنطوقة بالدارجة المغربية والعربية والفرنسية إلى أرقام
const parseDarijaSpokenDigits = (rawText) => {
  if (!rawText) return '';
  let str = rawText.toLowerCase();
  const eastern = '٠١٢٣٤٥٦٧٨٩';
  str = str.replace(/[٠-٩]/g, (d) => eastern.indexOf(d));

  const compounds = [
    [/عشرة\s*آلاف|عشر\s*آلاف/g, '10000'],
    [/خمسة\s*آلاف|خمس\s*آلاف/g, '5000'],
    [/ألفين|الفين/g, '2000'],
    [/ألف|الف/g, '1000'],
    [/خمسمائة|خمسمية|خمسميه/g, '500'],
    [/أربعمائة|ربعمية/g, '400'],
    [/ثلاثمائة|تلاتمية|تلاتميه/g, '300'],
    [/مائتين|ميتين|مياتين/g, '200'],
    [/مائة\s*وخمسين|مية\s*وخمسين/g, '150'],
    [/مائة|مية|ميه/g, '100'],
    [/خمسين/g, '50']
  ];
  compounds.forEach(([pat, val]) => {
    str = str.replace(pat, ` ${val} `);
  });

  const words = {
    'صفر': '0', 'زيرو': '0', 'واحد': '1', 'جوج': '2', 'زوج': '2', 'اثنان': '2',
    'ثلاثة': '3', 'تلاتة': '3', 'أربعة': '4', 'ربعة': '4', 'خمسة': '5',
    'ستة': '6', 'سبعة': '7', 'ثمانية': '8', 'تمنية': '8', 'تسعة': '9', 'تسعود': '9', 'عشرة': '10'
  };
  Object.keys(words).forEach((w) => {
    const regex = new RegExp(`(^|\\s)${w}(?=\\s|$)`, 'g');
    str = str.replace(regex, ` ${words[w]} `);
  });
  return str;
};

// 🧠 قاموس الربط الذكي بين الدارجة المغربية / العربية / الفرنسية / الإنجليزية للسلع والفئات
const SMART_BTP_SYNONYMS = {
  Cement: ['إسمنت', 'اسمنت', 'سيما', 'خنشة', 'جبس', 'ياجور', 'بريك', 'رمل', 'كياس', 'حصى', 'خرسانة', 'بيطون', 'ciment', 'cpj', 'brique', 'sable', 'beton', 'béton', 'cement', 'concrete', 'mortar'],
  Steel: ['حديد', 'قطبان', 'تورساد', 'سلك', 'شبكة', 'تسليح', 'فولاذ', 'fer', 'acier', 'armature', 'rond', 'steel', 'rebar', 'iron'],
  Masonry: ['بناي', 'بناء', 'ضالة', 'مرطوب', 'حائط', 'حيط', 'maçon', 'macon', 'maçonnerie', 'masonry', 'bricklayer'],
  Tiling: ['زليج', 'زلايجي', 'رخام', 'سيراميك', 'فايونص', 'بورسلين', 'أرضيات', 'carrelage', 'carreleur', 'marbre', 'zellige', 'faience', 'tiling', 'marble', 'tiles'],
  Plumbing: ['بلومبي', 'سباك', 'سباكة', 'رصاص', 'قوادس', 'قادوس', 'ماء', 'روبيني', 'شوفو', 'حمام', 'سانيتير', 'plombier', 'plomberie', 'tuyau', 'sanitaire', 'plumbing', 'plumber', 'pipe'],
  Electrical: ['تريسيان', 'كهرباء', 'كهربائي', 'ضو', 'الضو', 'ضوء', 'كابل', 'خيوط', 'بولات', 'إنارة', 'طابلو', 'électricien', 'electricien', 'électricité', 'cable', 'éclairage', 'electrical', 'electrician', 'lighting'],
  Paint: ['صباغ', 'صباغة', 'صباغه', 'دهان', 'خيال', 'ستيكو', 'أندوي', 'عزل', 'peintre', 'peinture', 'enduit', 'paint', 'painter'],
  Wood: ['نجار', 'نجارة', 'خشب', 'عود', 'بيبان', 'أبواب', 'بلاكار', 'كوزينة', 'menuisier', 'menuiserie', 'bois', 'porte', 'wood', 'carpenter'],
  Welding: ['حداد', 'سودور', 'تلحيم', 'شباك', 'باب حديد', 'ريدو', 'سدة', 'soudeur', 'soudure', 'ferronnier', 'welder', 'welding'],
  Plaster: ['جباس', 'جبس', 'قبص', 'بلافو', 'فو بلافو', 'ديكور جبس', 'plâtrier', 'platrier', 'plâtre', 'faux plafond', 'plaster'],
  Aluminum: ['ألمنيوم', 'المنيوم', 'زجاج', 'جاج', 'شراجم', 'نوافذ', 'فيترين', 'aluminium', 'verre', 'vitre', 'fenêtre', 'aluminum', 'glass'],
  HVAC: ['كليما', 'تكييف', 'تبريد', 'تهوية', 'شوفاج', 'climatisation', 'clim', 'hvac', 'ventilation'],
  Elevators: ['مصعد', 'مصاعد', 'سانسور', 'ascenseur', 'elevator'],
  Security: ['كاميرا', 'كاميرات', 'مراقبة', 'إنذار', 'أمان', 'caméra', 'sécurité', 'alarme', 'security', 'cctv'],
  Waterproofing: ['إيتانشيتي', 'ايتانشيتي', 'عزل مائي', 'قطرة', 'تسرب', 'زفت', 'سطح', 'étanchéité', 'etancheite', 'fuite', 'waterproofing'],
  Cleaning: ['نظافة', 'تنظيف', 'نهاية الورش', 'سيق', 'nettoyage', 'cleaning'],
  Gardens: ['مسبح', 'مسابح', 'جردة', 'حديقة', 'حدائق', 'عشب', 'piscine', 'jardin', 'pool', 'garden'],
  SOS: ['طوارئ', 'مستعجل', 'إصلاح سريع', 'ديباناج', 'sos', 'urgence', 'dépannage', 'emergency'],
  Architect: ['مهندس معماري', 'أرشيتيكت', 'ارشيتيكت', 'بلان', 'تصميم', 'architecte', 'architecture', 'plan'],
  Topographer: ['طوبوغراف', 'طوبوغرافيا', 'مسح', 'حدود الأرض', 'topographe', 'topographie', 'surveyor'],
  Studies: ['مكتب دراسات', 'دراسة تقنية', 'بيطون أرمي', 'bureau d\'études', 'études', 'engineering'],
  Control: ['مراقبة الجودة', 'مختبر', 'كونترول', 'bureau de contrôle', 'contrôle', 'quality control'],
  Interior: ['تصميم داخلي', 'ديزاين', 'ديكور داخلي', 'design d\'intérieur', 'interior design'],
  Earthworks: ['حفر', 'تراسمون', 'تهيئة الأرض', 'terrassement', 'excavation', 'earthworks'],
  Concrete: ['أساسات', 'خرسانة مسلحة', 'توبنة', 'fondation', 'béton armé', 'foundations'],
  Industrial: ['بناء صناعي', 'هنكار', 'مصنع', 'مستودع', 'industriel', 'hangar', 'industrial'],
  Demolition: ['هدم', 'تخريب', 'إزالة البناء', 'démolition', 'demolition'],
  Sanitation: ['واد حار', 'صرف صحي', 'قنوات', 'assainissement', 'sanitation'],
  HeavyMachinery: ['تراكس', 'طراكس', 'بوكلان', 'حفارة', 'جرافة', 'رافعة', 'آليات ثقيلة', 'excavatrice', 'tractopelle', 'engin', 'grue', 'machinery'],
  Tools: ['معدات خفيفة', 'دوزان', 'شنيول', 'مولينيكس', 'سقالة', 'بروطونة', 'outillage', 'outil', 'échafaudage', 'tools'],
  GoodsTransport: ['نقل السلع', 'كميون', 'شاحنة', 'رموك', 'بيكوب', 'ترانسبور', 'camion', 'semi-remorque', 'transport', 'truck'],
  DebrisRemoval: ['إزالة الردم', 'روبل', 'تراب', 'نفايات الورش', 'gravats', 'évacuation', 'debris']
};

// ترجمة أسماء السلع الشائعة والوحدات تلقائياً حسب لغة الواجهة
const localizeCommonProductText = (text, lang) => {
  if (!text) return '';
  const map = [
    { match: /ciment portland cpj 45/i, ar: 'إسمنت بورتلاند CPJ 45', fr: 'Ciment Portland CPJ 45', en: 'Portland Cement CPJ 45' },
    { match: /fer à béton.*12mm/i, ar: 'حديد التسليح (قطر 12 ملم)', fr: 'Fer à béton (Ø 12mm)', en: 'Steel Rebar (Ø 12mm)' },
    { match: /sac 50kg/i, ar: 'كيس 50 كغ', fr: 'Sac 50kg', en: '50kg Bag' },
    { match: /^kg$/i, ar: 'كغ', fr: 'Kg', en: 'Kg' },
    { match: /tonne/i, ar: 'طن', fr: 'Tonne', en: 'Ton' }
  ];
  for (const item of map) {
    if (item.match.test(text)) {
      return lang === 'ar' ? item.ar : lang === 'fr' ? item.fr : item.en;
    }
  }
  return text;
};

// --- مكون العداد التنازلي لعروض الـ Flash Deals ---
const FlashDealTimer = ({ expiresAt, language = 'ar' }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(expiresAt) - +new Date();
      if (difference > 0) {
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const m = Math.floor((difference / 1000 / 60) % 60);
        const s = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('EXPIRED');
      }
    };
    
    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft === 'EXPIRED') return null;

  return (
    <div className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-black animate-pulse border border-red-200 w-fit mt-2">
      <Timer size={14} /> 
      <span>
        {language === 'ar' ? 'ينتهي خلال:' : language === 'fr' ? 'Expire dans :' : 'Ends in:'}{' '}
        <span dir="ltr">{timeLeft}</span>
      </span>
    </div>
  );
};

export default function BTPHub() {
  const { language: settingsLanguage = 'fr' } = useSettingsStore();
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || false;
  const language = context.language || settingsLanguage || 'fr';
  const isRtl = language === 'ar';

  const getLocalizedText = (field, currentLang) => {
    if (!field) return '';
    let parsedField = field;
    if (typeof field === 'string' && field.trim().startsWith('{')) {
      try { parsedField = JSON.parse(field); } catch (e) { return field; }
    }
    if (typeof parsedField === 'object' && parsedField !== null) {
      return parsedField[currentLang] || parsedField['fr'] || parsedField['ar'] || '';
    }
    return String(field); 
  };

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState('materiaux');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedItem, setAddedItem] = useState(null);
  const [requestedQty, setRequestedQty] = useState(300);

  const [artisans, setArtisans] = useState([]);

  // حالات الصوت والكاميرا والذكاء الاصطناعي في الماركت بليس
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [listeningTarget, setListeningTarget] = useState(null);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [isScanningCamera, setIsScanningCamera] = useState(false);

  const cloudAudioRef = useRef(null);
  const recognitionRef = useRef(null);
  const cameraSearchInputRef = useRef(null);
  const skipCatResetRef = useRef(false);

  useEffect(() => {
    if (skipCatResetRef.current) {
      skipCatResetRef.current = false;
      return;
    }
    setActiveCategory('All');
  }, [activeMode]);

  useEffect(() => {
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
  }, []);

  // إيقاف الصوت عند تغيير اللغة
  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
      cloudAudioRef.current = null;
    }
    setIsSpeakingGuide(false);
  }, [language]);

  const [surplusDeals, setSurplusDeals] = useState([]);
  const [isSurplusModalOpen, setIsSurplusModalOpen] = useState(false);
  const [isSubmittingSurplus, setIsSubmittingSurplus] = useState(false);
  const [newSurplus, setNewSurplus] = useState({
    contractor_name: '',
    item_name: '',
    qty_left: '',
    original_price: '',
    burn_price: '',
    duration_hours: '24', 
    latitude: null,
    longitude: null,
    image_file: null,
    image_preview: null
  });

  // --- حالات الشراء الجماعي (Achat Groupé) ---
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupOrder, setSelectedGroupOrder] = useState(null);
  const [joinQty, setJoinQty] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isCreatingGroupOrder, setIsCreatingGroupOrder] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [newGroupOrder, setNewGroupOrder] = useState({
    service_id: '', target_qty: '', target_price: ''
  });

  // --- حالات طلب عروض الأسعار المخصصة (RFQ) ---
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);
  const [rfqForm, setRfqForm] = useState({
    title: '', category: '', details: '', deadline: ''
  });

  // =========================================================================
  // 🔊 1. المرشد الصوتي النسائي الموحد للماركت بليس (عربية + فرنسية سحابية + إنجليزية)
  // =========================================================================
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

    if (language === 'en' && 'speechSynthesis' in window) {
      const enText =
        'Welcome to the SasBTP Smart Marketplace. Tap the microphone in the search bar and speak what you need in Darija, Arabic, or English, or tap the camera to scan any material list or business card.';
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

    let metaReferrer = document.querySelector('meta[name="referrer"]');
    if (!metaReferrer) {
      metaReferrer = document.createElement('meta');
      metaReferrer.name = 'referrer';
      document.head.appendChild(metaReferrer);
    }
    metaReferrer.content = 'no-referrer';

    const segments =
      language === 'ar'
        ? [
            'مرحباً بك في سوق البناء الموحد بمنصة ساس بي تي بي',
            'اضغط على زر الميكروفون في شريط البحث، وتكلم بالدارجة المغربية أو العربية',
            'قل مثلاً: خاصني معلم بلومبي، أو إسمنت وحديد، أو كراء تراكس، وسنفتح لك القسم المطلوب تلقائياً'
          ]
        : [
            'Bienvenue sur le Marché BTP intelligent SasBTP.',
            'Appuyez sur le microphone dans la barre de recherche et dites ce dont vous avez besoin en Darija ou en Français, ou utilisez la caméra pour scanner votre liste de matériaux.'
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

  // =========================================================================
  // 🧠 2. المحلل الذكي للأوامر الصوتية والكاميرا في الماركت بليس (Darija / AR / FR / EN)
  // =========================================================================
  const analyzeAndRouteMarketplaceQuery = (rawSpeech) => {
    if (!rawSpeech || !rawSpeech.trim()) return;
    const normalized = parseDarijaSpokenDigits(rawSpeech);
    const lower = normalized.toLowerCase();

    // أ) استخراج الكمية إن نطقها المستخدم (مثلاً: "بغيت 500 خنشة ديال السيما")
    const qtyMatch = normalized.match(/\b(\d{2,5})\b/);
    if (qtyMatch && Number(qtyMatch[1]) > 0) {
      setRequestedQty(Number(qtyMatch[1]));
    }

    // ب) فحص ما إذا كان يطلب الشراء الجماعي أو فائض الأوراش
    if (/(شراء جماعي|طلب جماعي|مجموعة|achat groupé|group buying)/i.test(lower)) {
      setActiveMode('groupe');
      setSearchTerm('');
      return;
    }
    if (/(فائض|شياطة|باقي الورش|سعر محروق|همزة|surplus)/i.test(lower)) {
      setActiveMode('surplus');
      setSearchTerm('');
      return;
    }

    // ج) تحديد الفئة الفرعية (activeCategory) والقسم الرئيسي (activeMode) من قاموس الدارجة
    let matchedCat = null;
    for (const [catKey, synonyms] of Object.entries(SMART_BTP_SYNONYMS)) {
      if (synonyms.some((syn) => lower.includes(syn.toLowerCase()))) {
        matchedCat = catKey;
        break;
      }
    }

    // د) تحديد القسم الرئيسي بناءً على سياق الكلام أو الفئة المكتشفة
    let targetMode = activeMode;
    const mentionsArtisan = /(معلم|حرفي|صنايعي|خدام|بلومبي|تريسيان|بناي|صباغ|زلايجي|جباس|نجار|حداد|سودور|artisan|maalem)/i.test(lower);
    const mentionsMaterial = /(سلعة|مواد|سيما|إسمنت|اسمنت|حديد|ياجور|بريك|رمل|فورنيرسور|مورد|خنشة|طون|طن|fournisseur|ciment|fer|matériaux)/i.test(lower);

    if (mentionsArtisan) {
      targetMode = 'services';
    } else if (mentionsMaterial) {
      targetMode = 'materiaux';
    } else if (matchedCat) {
      if (['Cement', 'Steel'].includes(matchedCat)) targetMode = 'materiaux';
      else if (['Masonry', 'Welding', 'Plaster', 'Aluminum'].includes(matchedCat)) targetMode = 'services';
      else if (['HVAC', 'Elevators', 'Security', 'Waterproofing', 'Cleaning', 'Gardens', 'SOS'].includes(matchedCat)) targetMode = 'maintenance';
      else if (['Architect', 'Topographer', 'Studies', 'Control', 'Interior'].includes(matchedCat)) targetMode = 'experts';
      else if (['Earthworks', 'Concrete', 'Industrial', 'Demolition', 'Sanitation'].includes(matchedCat)) targetMode = 'grosOeuvre';
      else if (['HeavyMachinery', 'Tools'].includes(matchedCat)) targetMode = 'machines';
      else if (['GoodsTransport', 'DebrisRemoval'].includes(matchedCat)) targetMode = 'transport';
      else if (['Permits', 'Insurance'].includes(matchedCat)) targetMode = 'documents';
    }

    if (matchedCat) {
      skipCatResetRef.current = true;
      setActiveMode(targetMode);
      setActiveCategory(matchedCat);
      // نفرغ نص البحث الحرفي إذا تم التعرف على الفئة بنجاح حتى تظهر جميع عروض الفئة دون إخفاء بسبب اختلاف اللغة
      setSearchTerm('');
    } else {
      // إذا نطق اسم شركة أو مورد أو سلعة خاصة، نضعه في شريط البحث
      const cleanQuery = rawSpeech
        .replace(/^(بغيت|خاصني|كنقلب على|أريد|ابحث عن|شوف ليا|je cherche|je veux)\s+/i, '')
        .trim();
      setSearchTerm(cleanQuery);
    }
  };

  // =========================================================================
  // 🎙️ 3. تشغيل الميكروفون الفوري (للبحث الرئيسي أو داخل نوافذ البيع والطلبات)
  // =========================================================================
  const triggerVoiceInput = (targetKey, customCallback = null) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'ar' ? 'يرجى استخدام متصفح Chrome أو Safari لتشغيل البحث الصوتي.' : 'Veuillez utiliser Chrome ou Safari pour la recherche vocale.');
      return;
    }

    if (listeningTarget === targetKey && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setListeningTarget(null);
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

        recognition.onstart = () => setListeningTarget(targetKey);

        recognition.onresult = (event) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          const clean = fullTranscript.trim();
          if (!clean) return;

          setVoiceFeedback(clean);

          if (customCallback) {
            customCallback(clean);
          } else if (targetKey === 'mainSearch') {
            analyzeAndRouteMarketplaceQuery(clean);
          }
        };

        recognition.onerror = () => setListeningTarget(null);
        recognition.onend = () => setListeningTarget(null);

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        setListeningTarget(null);
      }
    }, 120);
  };

  // =========================================================================
  // 📷 4. البحث الذكي بالكاميرا (مسح لائحة سلعة / فاتورة / كارط فيزيت / صورة مادة)
  // =========================================================================
  const handleSmartCameraSearch = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningCamera(true);
    try {
      let extractedText = '';
      if ('TextDetector' in window) {
        try {
          const bitmap = await createImageBitmap(file);
          // eslint-disable-next-line no-undef
          const detector = new TextDetector();
          const blocks = await detector.detect(bitmap);
          extractedText = blocks.map((b) => b.rawValue).join(' ');
        } catch (err) {}
      }

      const fileNameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const combinedQuery = (extractedText || fileNameClean).trim();

      if (combinedQuery) {
        setVoiceFeedback(`📷 ${combinedQuery}`);
        analyzeAndRouteMarketplaceQuery(combinedQuery);
      } else {
        setVoiceFeedback(
          language === 'ar'
            ? '📷 تم مسح الصورة بنجاح! اختر الفئة المطابقة أو انطق اسم السلعة.'
            : '📷 Image analysée avec succès !'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningCamera(false);
    }
  };

  // فتح نافذة الإنشاء وجلب الخدمات المتاحة
  const openCreateGroupModal = async () => {
    setIsCreateGroupModalOpen(true);
    try {
      const { data } = await supabase
        .from('provider_services')
        .select('id, service_name, starting_price, suppliers(store_name)');
      if (data) setAvailableServices(data);
    } catch (err) { console.error(err); }
  };

  const handleCreateGroupOrder = async (e) => {
    e.preventDefault();
    if (!newGroupOrder.service_id || !newGroupOrder.target_qty || !newGroupOrder.target_price) {
      alert(t.groupe.createModal.alertFill); return;
    }
    
    setIsCreatingGroupOrder(true);
    try {
      const expiresAt = new Date(Date.now() + 48 * 3600000).toISOString(); 
      
      const { data, error } = await supabase.from('grouped_orders').insert({
        service_id: newGroupOrder.service_id,
        target_qty: Number(newGroupOrder.target_qty),
        current_qty: 0,
        target_price: Number(newGroupOrder.target_price),
        expires_at: expiresAt,
        status: 'active'
      }).select('*, provider_services(service_name, starting_price, suppliers(store_name, logo_url))').single();

      if (!error && data) {
        setGroupedOrders([data, ...groupedOrders]);
        setIsCreateGroupModalOpen(false);
        setNewGroupOrder({ service_id: '', target_qty: '', target_price: '' });
        alert(t.groupe.createModal.alertSuccess);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingGroupOrder(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchGroupedOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('grouped_orders')
          .select('*, provider_services(service_name, starting_price, suppliers(store_name, logo_url))')
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (!error && data && isMounted) {
          setGroupedOrders(data);
        }
      } catch (err) {
        console.error("Error fetching grouped orders:", err);
      }
    };
    fetchGroupedOrders();
    return () => { isMounted = false; };
  }, []);

  const handleJoinGroupOrder = async (e) => {
    e.preventDefault();
    if (!joinQty || isNaN(joinQty) || Number(joinQty) <= 0) return;
    
    setIsJoining(true);
    const qty = Number(joinQty);
    
    try {
      const { error: participantError } = await supabase.from('grouped_order_participants').insert({
        grouped_order_id: selectedGroupOrder.id,
        user_name: 'المقاول الحالي',
        requested_qty: qty
      });

      if (!participantError) {
        const newTotal = selectedGroupOrder.current_qty + qty;
        const newStatus = newTotal >= selectedGroupOrder.target_qty ? 'completed' : 'active';
        
        await supabase.from('grouped_orders')
          .update({ current_qty: newTotal, status: newStatus })
          .eq('id', selectedGroupOrder.id);

        setGroupedOrders(prev => prev.map(order => 
          order.id === selectedGroupOrder.id 
            ? { ...order, current_qty: newTotal, status: newStatus } 
            : order
        ).filter(order => order.status === 'active'));

        setIsGroupModalOpen(false);
        setJoinQty('');
        setSelectedGroupOrder(null);
        alert(language === 'ar' ? 'تمت مساهمتك بنجاح!' : 'Participation confirmée !');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  // 🔄 جلب الحرفيين والموردين المشتركين من جدولي suppliers و providers ليظهروا في جميع الحسابات الخمسة
  useEffect(() => {
    const fetchArtisansAndProviders = async () => {
      try {
        let combinedList = [];

        const { data: supData, error: supErr } = await supabase
          .from('suppliers')
          .select('*, provider_services(*, service_pricing_tiers(*))');
          
        if (supErr) {
          const fallback = await supabase.from('suppliers').select('*, provider_services(*)');
          if (fallback.data) combinedList = [...fallback.data];
        } else if (supData) {
          combinedList = [...supData];
        }

        // دمج الحرفيين المسجلين في جدول providers أيضاً حتى يظهروا في تبويب لْمْعْلّْم لجميع الحسابات
        const { data: provData } = await supabase.from('providers').select('*');
        if (provData && provData.length > 0) {
          constexistingIds = new Set(combinedList.map((s) => String(s.id)));
          provData.forEach((p) => {
            if (!constexistingIds.has(String(p.id))) {
              combinedList.push({
                id: p.id,
                store_name: p.full_name || 'SasBTP Artisan',
                city: p.city || 'المغرب',
                phone: p.phone || '',
                logo_url: null,
                provider_services: [
                  {
                    service_name: p.experience_text || p.bio_text || 'خدمات وحرف البناء',
                    starting_price: 150,
                    category: p.experience_text || 'Masonry'
                  }
                ]
              });
            }
          });
        }

        setArtisans(combinedList);
      } catch (err) {
        console.error("Error fetching artisans:", err);
      }
    };
    fetchArtisansAndProviders();
  }, []);

  const handleSubmitRfq = async (e) => {
    e.preventDefault();
    setIsSubmittingRfq(true);
    try {
      const { error } = await supabase.from('rfq_requests').insert({
        title: rfqForm.title,
        category: rfqForm.category,
        details: rfqForm.details,
        deadline: rfqForm.deadline,
        status: 'open'
      });
      if (!error) {
        setIsRfqModalOpen(false);
        setRfqForm({ title: '', category: '', details: '', deadline: '' });
        alert(t.rfq?.modal?.success || "Succès !");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  const translations = {
    ar: {
      searchPlaceholder: "تكلم بالدارجة أو اكتب: إسمنت، حديد، معلم بلومبي، تراكس...",
      audioGuideBtn: "🔊 استمع للشرح الصوتي",
      audioGuideStop: "⏹️ إيقاف الصوت",
      voiceListening: "جاري الاستماع... تكلم بالدارجة أو العربية",
      categoriesTitle: "التصنيفات",
      all: "الكل", cement: "مواد البناء والأسمنت", steel: "الحديد والتسليح", wood: "الخشب والنجارة",
      plumbing: "السباكة والأنابيب", electrical: "الكهرباء والإنارة", paint: "الصباغة والعزل",
      masonry: "البناء", tiling: "الزليج والرخام", welding: "الحدادة والتلحيم", plaster: "الجبس والديكور", 
      aluminum: "الألمنيوم والزجاج", hvac: "التكييف والتهوية", elevators: "صيانة المصاعد", security: "الأمان والمراقبة", 
      waterproofing: "العزل وتسرب المياه", cleaning: "النظافة ونهاية الورش", gardens: "المسابح والحدائق", sos: "طوارئ (SOS)",
      architect: "هندسة معمارية", topographer: "طوبوغرافيا", studies: "مكاتب الدراسات", control: "مراقبة الجودة", interior: "تصميم داخلي",
      earthworks: "الحفر والتهيئة", concrete: "الأساسات والخرسانة", industrial: "البناء الصناعي", demolition: "الهدم وإزالة الركام", sanitation: "الصرف الصحي",
      heavyMachinery: "آليات ثقيلة", tools: "معدات خفيفة", goodsTransport: "نقل السلع", debrisRemoval: "إزالة الردم", permits: "رخص إدارية", insurance: "تأمين الأوراش", verifiedSuppliers: "موردون معتمدون", majorContractors: "مقاولات كبرى", other: "أخرى (بحث)",
      addToCart: "أضف للمشروع", retail: "تقسيط:", wholesale: "جملة:",
      supplier: "المورد:", cartEmpty: "مشروعك فارغ", itemsInCart: "عناصر",
      checkout: "إتمام الطلب", emptySearch: "لم نجد ما يطابق بحثك.",
      popular: "الأكثر طلباً", addedSuccess: "تمت الإضافة!", openStore: "فتح متجري",
      multiCartDesc: "سلة مشروع متعددة الموردين", cartTitle: "سلة المشروع",
      qty: "الكمية:", total: "المجموع:", orderFrom: "طلب وعروض أسعار",
      wholesaleActivated: "🎉 تم تفعيل سعر الجملة",
      modes: { 
        experts: "الخبراء",
        materiaux: "مورد المواد",
        grosOeuvre: "الأشغال الكبرى",
        services: "لْمْعْلّْم (Lm3alam)",
        machines: "المعدات",
        maintenance: "صيانة",
        transport: "نقل",
        documents: "وثائق",
        companies: "شركات"
      },
      services: {
        interventions: "التدخلات", completed: "مكتملة",
        response: "الاستجابة", responseTime: "< 15 دقيقة",
        basePrice: "السعر الأساسي", startingFrom: "ابتداءً من",
        viewProfile: "عرض الملف", requestQuote: "طلب عرض سعر",
        specialty: "كهرباء المباني"
      },
      experts: {
        experience: "12 سنة من الخبرة",
        skill1: "تصميم ورخص", skill2: "تتبع الورش",
        book: "أخذ موعد", badge: "مهندس معماري"
      },
      machines: {
        available: "متاح:", details: "مع مشغل • نقل (18كم)",
        day: "يوم", week: "أسبوع", book: "حجز"
      },
      transport: { capacity: "الحمولة:", route: "المسار المتاح:", book: "طلب شاحنة", price: "درهم / كم" },
      maintenance: { type: "نوع الصيانة:", response: "الاستجابة:", book: "طلب فريق صيانة" },
      documents: { time: "مدة الإنجاز:", type: "الخدمة:", request: "طلب الوثيقة" },
      companies: { projects: "مشروع منجز", verify: "شركة معتمدة", contact: "التواصل مع الشركة" },
      surplus: {
        title: "فرص الأوراش المجاورة (استلام فوري)",
        desc: "سلع متبقية من مشاريع مقاولين آخرين بأسعار محروقة. الشرط الوحيد:",
        descBold: "النقل على حسابك من الورش مباشرة!",
        addBtn: "عرض سلعة للبيع",
        discount: "تخفيض",
        qtyLeft: "متبقي:",
        distance: "تبعد",
        km: "كم",
        burnPrice: "السعر المحروق للوحدة",
        bookBtn: "حجز للاستلام الفوري",
        empty: "لا توجد فرص فائض أوراش متاحة حالياً.",
        modal: {
          title: "بيع فائض الورش (بالصوت أو الكتابة)",
          desc: "أدخل أو انطق تفاصيل السلعة المتبقية ليأتي مقاول آخر لحملها.",
          photo: "التقط صورة للسلعة في الورش",
          contractor: "اسم المقاول / الورش",
          contractorPlh: "مثال: ورش فيلا بنعلي",
          item: "السلعة المتبقية",
          itemPlh: "مثال: 50 كيس إسمنت",
          priceNormal: "السعر العادي (للمقارنة)",
          priceBurn: "السعر المحروق!",
          qty: "الكمية",
          qtyPlh: "مثال: 50",
          duration: "مدة العرض",
          hours: "ساعة",
          gpsLocated: "تم التحديد",
          gpsBtn: "GPS",
          publishing: "جاري النشر...",
          publishBtn: "نشر العرض فوراً",
          alertGpsSuccess: "تم التقاط الإحداثيات بنجاح!",
          alertGpsError: "يرجى تفعيل الـ GPS في جهازك.",
          alertFillRequired: "يرجى ملء الحقول الأساسية وتحديد الموقع (GPS)",
          alertSuccess: "تم نشر عرضك بنجاح!"
        }
      },
      groupe: {
        title: "الشراء الجماعي للمقاولين (Achat Groupé)",
        desc: "انضم لمقاولين آخرين للوصول إلى الكمية المطلوبة وتفعيل سعر الجملة للجميع!",
        createBtn: "فتح طلب جماعي جديد",
        targetQty: "الهدف:",
        collected: "تم جمع:",
        missing: "متبقي:",
        targetPrice: "السعر المخفض المستهدف",
        joinBtn: "المساهمة في الطلب",
        completedBtn: "اكتمل الطلب!",
        empty: "لا توجد طلبات شراء جماعي مفتوحة حالياً.",
        modal: {
          title: "المساهمة في الطلب الجماعي",
          desc: "حدد الكمية التي تريد حجزها من هذا الطلب.",
          qty: "الكمية المطلوبة",
          qtyPlh: "مثال: 50",
          submitBtn: "تأكيد المساهمة",
          submitting: "جاري التأكيد..."
        },
        createModal: {
          title: "فتح طلب شراء جماعي",
          desc: "اختر السلعة وحدد الكمية الإجمالية المستهدفة لتفعيل السعر المخفض.",
          service: "السلعة / الخدمة المطلوبة",
          servicePlh: "اختر من قائمة العروض",
          targetQty: "الكمية الهدف (الإجمالية)",
          targetQtyPlh: "مثال: 500",
          targetPrice: "السعر المخفض المستهدف",
          targetPricePlh: "مثال: 67",
          submitBtn: "إطلاق الطلب الجماعي (48 ساعة)",
          submitting: "جاري الإطلاق...",
          alertFill: "يرجى تعبئة جميع الحقول بشكل صحيح.",
          alertSuccess: "تم إطلاق الطلب الجماعي بنجاح! العداد بدأ الآن."
        }
      },
      rfq: {
        title: "لم أجد ما أبحث عنه",
        desc: "صف احتياجك بدقة بالصوت أو الكتابة وتلقى عروضاً من موردينا المعتمدين.",
        btn: "صف احتياجك",
        modal: {
          title: "نشر طلب مخصص (Appel d'offres)",
          desc: "حدد أو انطق تفاصيل مشروعك وسيقوم الموردون المعتمدون بتقديم عروض أسعارهم.",
          reqTitle: "عنوان الطلب",
          reqTitlePlh: "مثال: مطلوب توريد وتركيب 50 نافذة ألمنيوم",
          category: "التصنيف",
          catSelect: "اختر التصنيف المناسب",
          details: "التفاصيل الفنية (المقاسات، الجودة، مكان الورش)",
          detailsPlh: "اكتب أو انطق جميع التفاصيل التي تهم المورد هنا...",
          deadline: "آخر أجل لتلقي العروض",
          submitBtn: "نشر الطلب للموردين",
          submitting: "جاري النشر...",
          success: "تم نشر طلبك بنجاح! ستتلقى العروض قريباً."
        }
      }
    },
    fr: {
      searchPlaceholder: "Parlez en Darija/FR ou écrivez : ciment, fer, plombier...", 
      audioGuideBtn: "🔊 Guide vocal",
      audioGuideStop: "⏹️ Arrêter l'audio",
      voiceListening: "Écoute en direct... Parlez en Darija ou Français",
      categoriesTitle: "Catégories",
      all: "Tout", cement: "Gros œuvre & Ciment", steel: "Acier & Armature", wood: "Bois & Menuiserie",
      plumbing: "Plomberie & Tuyauterie", electrical: "Électricité & Éclairage", paint: "Peinture & Isolation",
      masonry: "Maçonnerie", tiling: "Carrelage & Marbre", welding: "Soudure & Ferronnerie", plaster: "Plâtre & Déco", 
      aluminum: "Aluminium & Verre", hvac: "Climatisation & HVAC", elevators: "Ascenseurs", security: "Sécurité & Caméras", 
      waterproofing: "Étanchéité & Fuites", cleaning: "Nettoyage Fin Chantier", gardens: "Piscines & Jardins", sos: "SOS Dépannage",
      architect: "Architecture", topographer: "Topographie", studies: "Bureau d'études", control: "Bureau de contrôle", interior: "Design d'intérieur",
      earthworks: "Terrassement", concrete: "Fondations & Béton", industrial: "Bâtiment Industriel", demolition: "Démolition", sanitation: "Assainissement",
      heavyMachinery: "Engins Lourds", tools: "Outillage", goodsTransport: "Transport Marchandises", debrisRemoval: "Évacuation Gravats", permits: "Permis & Admin", insurance: "Assurance", verifiedSuppliers: "Fournisseurs Vérifiés", majorContractors: "Grandes Entreprises", other: "Autre (Recherche)",
      addToCart: "Ajouter au projet", retail: "Détail :", wholesale: "Gros :",
      supplier: "Fournisseur :", cartEmpty: "Projet vide", itemsInCart: "éléments",
      checkout: "Voir le Projet", emptySearch: "Aucun résultat trouvé.",
      popular: "Populaire", addedSuccess: "Ajouté !", openStore: "Mon Magasin",
      multiCartDesc: "Panier de projet multi-fournisseurs", cartTitle: "Panier du Projet",
      qty: "Qté :", total: "Total :", orderFrom: "Demander devis & Commander",
      wholesaleActivated: "🎉 Prix de gros activé",
      modes: { 
        experts: "experts",
        materiaux: "Fournisseur",
        grosOeuvre: "gros oeuvres",
        services: "Lmعalam (لْمْعْلّْم)",
        machines: "machines",
        maintenance: "maintenance",
        transport: "Transport",
        documents: "Documents",
        companies: "Entreprises"
      },
      services: {
        interventions: "Interventions", completed: "complétées",
        response: "Réponse", responseTime: "< 15 mins",
        basePrice: "Tarif de base", startingFrom: "À partir de",
        viewProfile: "Voir profil", requestQuote: "Demander devis",
        specialty: "Électricité bâtiment"
      },
      experts: {
        experience: "12 ans d'expérience",
        skill1: "Conception & Permis", skill2: "Suivi de chantier",
        book: "Prendre rendez-vous", badge: "Architecte DPLG"
      },
      machines: {
        available: "Dispo:", details: "Avec opérateur • Transport (18km)",
        day: "Jour", week: "Semaine", book: "Réserver"
      },
      transport: { capacity: "Capacité :", route: "Trajet :", book: "Commander Camion", price: "MAD / km" },
      maintenance: { type: "Type :", response: "Intervention :", book: "Demander Équipe" },
      documents: { time: "Délai :", type: "Service :", request: "Demander Document" },
      companies: { projects: "Projets livrés", verify: "Entreprise Vérifiée", contact: "Contacter l'Entreprise" },
      surplus: {
        title: "Opportunités Chantiers Voisins (Retrait Immédiat)",
        desc: "Matériaux restants d'autres chantiers à prix cassés. Seule condition :",
        descBold: "Transport à votre charge depuis le chantier !",
        addBtn: "Vendre un surplus",
        discount: "Réduction",
        qtyLeft: "Reste :",
        distance: "À",
        km: "km",
        burnPrice: "Prix cassé unitaire",
        bookBtn: "Réserver pour retrait immédiat",
        empty: "Aucune opportunité de surplus de chantier disponible actuellement.",
        modal: {
          title: "Vendre un surplus",
          desc: "Saisissez ou dictez les détails pour qu'un autre entrepreneur vienne récupérer la marchandise.",
          photo: "Prendre une photo sur le chantier",
          contractor: "Nom de l'entreprise",
          contractorPlh: "Ex : Chantier Villa Benali",
          item: "Marchandise restante",
          itemPlh: "Ex : 50 sacs de ciment",
          priceNormal: "Prix Normal",
          priceBurn: "Prix Cassé !",
          qty: "Quantité",
          qtyPlh: "Ex : 50",
          duration: "Durée",
          hours: "Heures",
          gpsLocated: "Localisé",
          gpsBtn: "GPS",
          publishing: "Publication...",
          publishBtn: "Publier l'offre",
          alertGpsSuccess: "Coordonnées GPS capturées !",
          alertGpsError: "Veuillez activer le GPS.",
          alertFillRequired: "Veuillez remplir les champs requis et le GPS.",
          alertSuccess: "Votre offre a été publiée !"
        }
      },
      groupe: {
        title: "Achats Groupés BTP (Achat Groupé)",
        desc: "Rejoignez d'autres entrepreneurs pour atteindre la quantité requise et débloquer le prix de gros !",
        createBtn: "Créer une commande groupée",
        targetQty: "Objectif :",
        collected: "Collecté :",
        missing: "Manquant :",
        targetPrice: "Prix Cible",
        joinBtn: "Participer à la commande",
        completedBtn: "Commande Complétée !",
        empty: "Aucune commande groupée ouverte pour le moment.",
        modal: {
          title: "Participer à la commande",
          desc: "Indiquez la quantité que vous souhaitez réserver.",
          qty: "Quantité souhaitée",
          qtyPlh: "Ex : 50",
          submitBtn: "Confirmer la participation",
          submitting: "Confirmation..."
        },
        createModal: {
          title: "Créer une commande groupée",
          desc: "Choisissez le produit et définissez la quantité cible pour activer le prix de gros.",
          service: "Produit / Service souhaité",
          servicePlh: "Sélectionnez dans la liste",
          targetQty: "Quantité Cible Globale",
          targetQtyPlh: "Ex : 500",
          targetPrice: "Prix Cible",
          targetPricePlh: "Ex : 67",
          submitBtn: "Lancer la commande (48h)",
          submitting: "Lancement...",
          alertFill: "Veuillez remplir tous les champs correctement.",
          alertSuccess: "Commande groupée lancée avec succès ! Le compte à rebours a commencé."
        }
      },
      rfq: {
        title: "Je ne trouve pas ce que je cherche",
        desc: "Décrivez votre besoin exact et recevez des offres de nos fournisseurs vérifiés.",
        btn: "Décrivez votre besoin",
        modal: {
          title: "Publier un Appel d'offres",
          desc: "Précisez ou dictez les détails de votre projet pour recevoir les devis des fournisseurs.",
          reqTitle: "Titre de la demande",
          reqTitlePlh: "Ex: Fourniture et pose de 50 fenêtres en aluminium",
          category: "Catégorie",
          catSelect: "Sélectionnez une catégorie",
          details: "Détails Techniques (Dimensions, Qualité, Lieu)",
          detailsPlh: "Décrivez toutes les spécifications ici...",
          deadline: "Date limite de réponse",
          submitBtn: "Publier la demande",
          submitting: "Publication...",
          success: "Votre demande a été publiée avec succès !"
        }
      }
    },
    en: {
      searchPlaceholder: "Speak in Darija/EN or type: cement, steel, plumber...",
      audioGuideBtn: "🔊 Audio Guide",
      audioGuideStop: "⏹️ Stop Audio",
      voiceListening: "Listening live... Speak now",
      categoriesTitle: "Categories",
      all: "All", cement: "Masonry & Cement", steel: "Steel & Rebar", wood: "Wood & Carpentry",
      plumbing: "Plumbing & Piping", electrical: "Electrical & Lighting", paint: "Paint & Insulation",
      masonry: "Masonry", tiling: "Tiling & Marble", welding: "Welding & Ironwork", plaster: "Plaster & Decor", 
      aluminum: "Aluminum & Glass", hvac: "HVAC & AC", elevators: "Elevators", security: "Security & Cameras", 
      waterproofing: "Waterproofing & Leaks", cleaning: "Post-Construction Cleaning", gardens: "Pools & Gardens", sos: "SOS Emergency",
      architect: "Architecture", topographer: "Topography", studies: "Engineering Studies", control: "Quality Control", interior: "Interior Design",
      earthworks: "Earthworks", concrete: "Foundations & Concrete", industrial: "Industrial Building", demolition: "Demolition", sanitation: "Sanitation",
      heavyMachinery: "Heavy Machinery", tools: "Tools", goodsTransport: "Goods Transport", debrisRemoval: "Debris Removal", permits: "Admin Permits", insurance: "Insurance", verifiedSuppliers: "Verified Suppliers", majorContractors: "Major Contractors", other: "Other (Search)",
      addToCart: "Add to Project", retail: "Retail:", wholesale: "Wholesale:",
      supplier: "Supplier:", cartEmpty: "Project is empty", itemsInCart: "items",
      checkout: "View Project", emptySearch: "No results found.",
      popular: "Popular", addedSuccess: "Added!", openStore: "My Store",
      multiCartDesc: "Multi-supplier project cart", cartTitle: "Project Cart",
      qty: "Qty:", total: "Total:", orderFrom: "Request Quote & Order",
      wholesaleActivated: "🎉 Wholesale price activated",
      modes: { 
        experts: "experts",
        materiaux: "Supplier",
        grosOeuvre: "structural works",
        services: "Lmعalam (لْمْعْلّْم)",
        machines: "machines",
        maintenance: "maintenance",
        transport: "Transport",
        documents: "Documents",
        companies: "Companies"
      },
      services: {
        interventions: "Jobs", completed: "completed",
        response: "Response time", responseTime: "< 15 mins",
        basePrice: "Base rate", startingFrom: "Starting from",
        viewProfile: "View Profile", requestQuote: "Request Quote",
        specialty: "Building Electricity"
      },
      experts: {
        experience: "12 years of experience",
        skill1: "Design & Permits", skill2: "Site Supervision",
        book: "Book Appointment", badge: "Certified Architect"
      },
      machines: {
        available: "Available:", details: "With operator • Transport (18km)",
        day: "Day", week: "Week", book: "Book"
      },
      transport: { capacity: "Capacity:", route: "Route:", book: "Request Truck", price: "MAD / km" },
      maintenance: { type: "Type:", response: "Response:", book: "Request Team" },
      documents: { time: "Timeframe:", type: "Service:", request: "Request Document" },
      companies: { projects: "Completed Projects", verify: "Verified Company", contact: "Contact Company" },
      surplus: {
        title: "Nearby Site Opportunities (Immediate Pickup)",
        desc: "Remaining materials from other sites at rock-bottom prices. Only condition:",
        descBold: "Transport is on you directly from the site!",
        addBtn: "Sell Surplus",
        discount: "Discount",
        qtyLeft: "Left:",
        distance: "Away",
        km: "km",
        burnPrice: "Rock-bottom Unit Price",
        bookBtn: "Book for Immediate Pickup",
        empty: "No site surplus opportunities available at the moment.",
        modal: {
          title: "Sell Surplus",
          desc: "Enter or speak the details so another contractor can pick up the remaining items.",
          photo: "Take a photo on site",
          contractor: "Contractor / Site Name",
          contractorPlh: "E.g., Villa Benali Site",
          item: "Remaining Item",
          itemPlh: "E.g., 50 cement bags",
          priceNormal: "Normal Price",
          priceBurn: "Burn Price!",
          qty: "Quantity",
          qtyPlh: "E.g., 50",
          duration: "Duration",
          hours: "Hours",
          gpsLocated: "Located",
          gpsBtn: "GPS",
          publishing: "Publishing...",
          publishBtn: "Publish Offer Now",
          alertGpsSuccess: "GPS coordinates captured!",
          alertGpsError: "Please enable GPS on your device.",
          alertFillRequired: "Please fill the required fields and capture GPS location.",
          alertSuccess: "Your offer has been published!"
        }
      },
      groupe: {
        title: "Contractors Group Buying",
        desc: "Join other contractors to hit the target quantity and unlock wholesale pricing for everyone!",
        createBtn: "Start New Group Order",
        targetQty: "Target:",
        collected: "Collected:",
        missing: "Missing:",
        targetPrice: "Target Discount Price",
        joinBtn: "Join Order",
        completedBtn: "Order Completed!",
        empty: "No open group orders at the moment.",
        modal: {
          title: "Join Group Order",
          desc: "Specify the quantity you want to reserve from this order.",
          qty: "Requested Quantity",
          qtyPlh: "E.g., 50",
          submitBtn: "Confirm Participation",
          submitting: "Confirming..."
        },
        createModal: {
          title: "Create Group Order",
          desc: "Choose the product and set the target quantity to unlock the wholesale price.",
          service: "Desired Product / Service",
          servicePlh: "Select from the list",
          targetQty: "Total Target Quantity",
          targetQtyPlh: "E.g., 500",
          targetPrice: "Target Discount Price",
          targetPricePlh: "E.g., 67",
          submitBtn: "Launch Group Order (48h)",
          submitting: "Launching...",
          alertFill: "Please fill all fields correctly.",
          alertSuccess: "Group order launched successfully! The countdown has started."
        }
      },
      rfq: {
        title: "I can't find what I'm looking for",
        desc: "Describe your exact need and receive offers from our verified suppliers.",
        btn: "Describe your need",
        modal: {
          title: "Post a Custom Request (RFQ)",
          desc: "Specify your project details to receive quotes from verified suppliers.",
          reqTitle: "Request Title",
          reqTitlePlh: "E.g., Supply and installation of 50 aluminum windows",
          category: "Category",
          catSelect: "Select Category",
          details: "Technical Details (Dimensions, Quality, Location)",
          detailsPlh: "Write all specifications here...",
          deadline: "Submission Deadline",
          submitBtn: "Post Request",
          submitting: "Posting...",
          success: "Your request has been posted successfully!"
        }
      } 
    }
  };

  const t = translations[language] || translations.fr;
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100';

  const modes = [
    { id: 'services', icon: '👷', label: t.modes.services },
    { id: 'materiaux', icon: '🧱', label: t.modes.materiaux },
    { id: 'maintenance', icon: '🔧', label: t.modes.maintenance },
    { id: 'experts', icon: '📐', label: t.modes.experts },
    { id: 'grosOeuvre', icon: '🏗️', label: t.modes.grosOeuvre || "الأشغال الكبرى" },
    { id: 'machines', icon: '🚜', label: t.modes.machines },
    { id: 'transport', icon: '🚚', label: t.modes.transport },
    { id: 'documents', icon: '📄', label: t.modes.documents },
    { id: 'companies', icon: '🏢', label: t.modes.companies },
  ];

  const categories = [
    { id: 'All', label: t.all, icon: Filter },
    { id: 'Cement', label: t.cement, icon: Package }, 
    { id: 'Steel', label: t.steel, icon: Hammer },    
    { id: 'Masonry', label: t.masonry, icon: HardHat },
    { id: 'Tiling', label: t.tiling, icon: LayoutGrid },
    { id: 'Plumbing', label: t.plumbing, icon: Droplet },
    { id: 'Electrical', label: t.electrical, icon: Zap },
    { id: 'Paint', label: t.paint, icon: PaintRoller },
    { id: 'Wood', label: t.wood, icon: TrendingUp },
    { id: 'Welding', label: t.welding, icon: Flame },
    { id: 'Plaster', label: t.plaster, icon: Component },
    { id: 'Aluminum', label: t.aluminum, icon: AppWindow },
    { id: 'HVAC', label: t.hvac, icon: Wind },
    { id: 'Elevators', label: t.elevators, icon: ArrowUpDown },
    { id: 'Security', label: t.security, icon: Cctv },
    { id: 'Waterproofing', label: t.waterproofing, icon: Umbrella },
    { id: 'Cleaning', label: t.cleaning, icon: Sparkles },
    { id: 'Gardens', label: t.gardens, icon: Trees },
    { id: 'SOS', label: t.sos, icon: Siren },
    { id: 'Architect', label: t.architect, icon: PenTool },
    { id: 'Topographer', label: t.topographer, icon: Compass },
    { id: 'Studies', label: t.studies, icon: Calculator },
    { id: 'Control', label: t.control, icon: ShieldCheck },
    { id: 'Interior', label: t.interior, icon: Sofa },
    { id: 'Earthworks', label: t.earthworks, icon: Mountain },
    { id: 'Concrete', label: t.concrete, icon: Layers },
    { id: 'Industrial', label: t.industrial, icon: Factory },
    { id: 'Demolition', label: t.demolition, icon: Hammer },
    { id: 'Sanitation', label: t.sanitation, icon: Waves },
    { id: 'HeavyMachinery', label: t.heavyMachinery, icon: Tractor },
    { id: 'Tools', label: t.tools, icon: Wrench },
    { id: 'GoodsTransport', label: t.goodsTransport, icon: Truck },
    { id: 'DebrisRemoval', label: t.debrisRemoval, icon: Trash },
    { id: 'Permits', label: t.permits, icon: FileCheck },
    { id: 'Insurance', label: t.insurance, icon: Shield },
    { id: 'VerifiedSuppliers', label: t.verifiedSuppliers, icon: Award },
    { id: 'MajorContractors', label: t.majorContractors, icon: Building2 },
    { id: 'Other', label: t.other || 'Other', icon: MoreHorizontal },
  ];

  // 🔄 جلب منتجات السوق الموحد من جدولي marketplace_products و products ليظهر كل ما يضيفه التجار والموردون في جميع الحسابات الخمسة
  useEffect(() => {
    let isMounted = true;
    const loadMarketplace = async () => {
      setLoading(true);
      try {
        const [mpRes, prodRes] = await Promise.all([
          supabase.from('marketplace_products').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('*, suppliers(store_name)').order('created_at', { ascending: false }).limit(50)
        ]);

        let mergedProducts = [];
        if (mpRes.data && mpRes.data.length > 0) {
          mergedProducts = [...mpRes.data];
        }

        if (prodRes.data && prodRes.data.length > 0) {
          const existingIds = new Set(mergedProducts.map((p) => String(p.id)));
          prodRes.data.forEach((p) => {
            if (!existingIds.has(String(p.id))) {
              mergedProducts.push({
                id: p.id,
                name: p.name,
                category: p.category === 'gros-oeuvre' ? 'Cement' : p.category === 'electricite' ? 'Electrical' : p.category === 'plomberie' ? 'Plumbing' : 'Cement',
                price_retail: Number(p.price) || 0,
                price_wholesale: Math.round((Number(p.price) || 0) * 0.92),
                min_wholesale_qty: 50,
                unit: p.unit || 'Unité',
                currency: 'MAD',
                supplier: p.suppliers?.store_name || 'Fournisseur SasBTP',
                rating: 4.8,
                isPopular: true,
                image_url: p.image_url || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500&auto=format&fit=crop'
              });
            }
          });
        }

        if (mergedProducts.length > 0) {
          if (isMounted) setProducts(mergedProducts);
        } else {
          if (isMounted) setProducts([
            { id: 1, name: "Ciment Portland CPJ 45", category: "Cement", price_retail: 75, price_wholesale: 70, min_wholesale_qty: 100, unit: "Sac 50kg", currency: "MAD", supplier: "LafargeHolcim", rating: 4.8, isPopular: true, image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500&auto=format&fit=crop" },
            { id: 2, name: "Fer à béton (Ø 12mm)", category: "Steel", price_retail: 9.5, price_wholesale: 8.8, min_wholesale_qty: 500, unit: "Kg", currency: "MAD", supplier: "Sonasid", rating: 4.9, isPopular: true, image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop" }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadMarketplace();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadSurplusDeals = async () => {
      try {
        const { data, error } = await supabase
          .from('chantier_surplus')
          .select('*')
          .gte('expires_at', new Date().toISOString()); 
        if (!error && data) {
          if (isMounted) setSurplusDeals(data.reverse());
        }
      } catch (err) {
        console.error("Error fetching surplus:", err);
      }
    };
    loadSurplusDeals();

    return () => { isMounted = false; };
  }, []);

  // 🔍 فلترة ذكية عابرة للغات (حتى لو بحث المستخدم بالدارجة أو العربية والمنتج مسجل بالفرنسية)
  const matchesCrossLanguageSearch = (itemText, categoryKey, query) => {
    if (!query || !query.trim()) return true;
    const q = query.toLowerCase().trim();
    const target = (itemText || '').toLowerCase();
    const localizedTarget = localizeCommonProductText(itemText, language).toLowerCase();
    if (target.includes(q) || localizedTarget.includes(q)) return true;

    const catSynonyms = SMART_BTP_SYNONYMS[categoryKey] || [];
    if (catSynonyms.some((s) => s.toLowerCase().includes(q) || q.includes(s.toLowerCase()))) {
      return true;
    }
    return false;
  };

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = matchesCrossLanguageSearch(`${p.name} ${p.supplier || ''}`, p.category, searchTerm);
    return matchCat && matchSearch;
  });

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: (parseInt(item.qty) || 0) + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const updateQuantity = (productId, newQty) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const chantierLocation = { lat: 32.5977, lng: -6.2658 };
  const requiredQuantity = 300;
  const truckCapacity = 30;
  const costPerKm = 30;
  const numberOfTrips = Math.ceil(requiredQuantity / truckCapacity);

  const handleGetSurplusLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewSurplus(prev => ({ ...prev, latitude: position.coords.latitude, longitude: position.coords.longitude }));
          alert(t.surplus.modal.alertGpsSuccess);
        },
        () => {
          alert(t.surplus.modal.alertGpsError);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSubmitSurplus = async (e) => {
    e.preventDefault();
    if (!newSurplus.item_name || !newSurplus.burn_price || !newSurplus.latitude) {
      alert(t.surplus.modal.alertFillRequired);
      return;
    }

    setIsSubmittingSurplus(true);
    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500';
      if (newSurplus.image_file) {
        const fileExt = newSurplus.image_file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('surplus-images').upload(`public/${fileName}`, newSurplus.image_file);
        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('surplus-images').getPublicUrl(uploadData.path);
          finalImageUrl = publicUrlData.publicUrl;
        }
      }

      const expiresAt = new Date(Date.now() + parseInt(newSurplus.duration_hours) * 3600000).toISOString();
      const { data, error } = await supabase.from('chantier_surplus').insert({
        contractor_name: newSurplus.contractor_name || 'مقاول مستقل',
        item_name: newSurplus.item_name,
        qty_left: newSurplus.qty_left,
        original_price: Number(newSurplus.original_price) || 0,
        burn_price: Number(newSurplus.burn_price),
        latitude: newSurplus.latitude,
        longitude: newSurplus.longitude,
        expires_at: expiresAt,
        image_url: finalImageUrl
      }).select().single();

      if (!error && data) {
        setSurplusDeals([data, ...surplusDeals]);
        setIsSurplusModalOpen(false);
        setNewSurplus({ contractor_name: '', item_name: '', qty_left: '', original_price: '', burn_price: '', duration_hours: '24', latitude: null, longitude: null, image_file: null, image_preview: null });
        alert(t.surplus.modal.alertSuccess);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSurplus(false);
    }
  };

  return (
    <div className="animate-fade-in pb-32 max-w-7xl mx-auto w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🌟 Top Header & Smart Voice / Camera Search */}
      <div className={`${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-100'} backdrop-blur-md p-5 md:p-6 rounded-3xl border shadow-sm mb-4 mt-4 space-y-3`}>
        
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 px-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
            <Sparkles size={15} />
            {language === 'ar'
              ? 'سوق البناء الموحد (يفهم الدارجة المغربية بالصوت والكاميرا)'
              : language === 'fr'
              ? 'Marché BTP Unifié (Recherche Vocale Darija/FR & Caméra IA)'
              : 'Unified BTP Marketplace (Smart Voice & Camera AI)'}
          </span>

          <button
            type="button"
            onClick={toggleAudioGuide}
            className={`px-3.5 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
              isSpeakingGuide
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-md'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            <Volume2 size={15} />
            {isSpeakingGuide ? t.audioGuideStop : t.audioGuideBtn}
          </button>
        </div>

        <div className="max-w-4xl mx-auto flex items-center bg-gray-100 dark:bg-slate-800 rounded-full p-2 border-2 border-transparent focus-within:border-emerald-500 transition-colors shadow-inner">
          <Search className={`w-6 h-6 text-gray-400 ${isRtl ? 'mr-3 ml-2' : 'ml-3 mr-2'}`} />
          <input 
            type="text" 
            placeholder={listeningTarget === 'mainSearch' ? t.voiceListening : t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400 font-bold text-sm md:text-base"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
          <div className={`flex items-center gap-2 ${isRtl ? 'ml-2' : 'mr-2'}`}>
            {/* 🎙️ زر البحث الصوتي الذكي بالدارجة المغربية والعربية والفرنسية */}
            <button 
              type="button"
              onClick={() => triggerVoiceInput('mainSearch')} 
              title={language === 'ar' ? 'ابحث بالصوت (بالدارجة أو العربية)' : 'Recherche vocale IA'}
              className={`p-2.5 rounded-full transition-all relative cursor-pointer ${
                listeningTarget === 'mainSearch'
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/40'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              {listeningTarget === 'mainSearch' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {listeningTarget !== 'mainSearch' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              )}
            </button>

            {/* 📷 زر البحث الذكي بالكاميرا */}
            <input
              ref={cameraSearchInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleSmartCameraSearch}
              className="hidden"
            />
            <button 
              type="button"
              disabled={isScanningCamera}
              onClick={() => cameraSearchInputRef.current?.click()}
              title={language === 'ar' ? 'ابحث بتصوير السلعة أو الفاتورة' : 'Recherche par caméra'}
              className="p-2.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-full transition-all relative cursor-pointer"
            >
              {isScanningCamera ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>
            </button>
          </div>
        </div>

        {/* شريط تغذية راجعة لما فهمه الذكاء الاصطناعي من الصوت أو الكاميرا */}
        {voiceFeedback && (
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl text-xs font-black text-emerald-600 dark:text-emerald-300">
            <span>🗣️ &ldquo;{voiceFeedback}&rdquo;</span>
            <button
              type="button"
              onClick={() => { setVoiceFeedback(''); setSearchTerm(''); setActiveCategory('All'); }}
              className="text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 🚀 Floating Action Buttons (الشراء الجماعي و فائض الأوراش) */}
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setActiveMode('groupe')}
          className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg cursor-pointer
            ${activeMode === 'groupe' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/40 ring-4 ring-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'}`}
        >
          <span className="text-xl">🤝</span> {language === 'ar' ? 'شراء جماعي' : (language === 'fr' ? 'Achat Groupé' : 'Group Buying')}
        </button>

        <button 
          onClick={() => setActiveMode('surplus')}
          className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg cursor-pointer
            ${activeMode === 'surplus' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/20' : 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}`}
        >
          <span className="text-xl">♻</span> {language === 'ar' ? 'فائض الأوراش' : (language === 'fr' ? 'Surplus Chantier' : 'Site Surplus')}
        </button>
      </div>

      {/* Master Marketplace Switcher */}
      <div className="flex gap-4 mb-8 overflow-x-auto custom-scrollbar pb-2 snap-x">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`snap-start shrink-0 flex items-center px-6 py-4 rounded-2xl text-lg font-bold transition-all border-2 cursor-pointer ${
              activeMode === mode.id 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 transform -translate-y-1' 
                : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-white text-slate-600'} hover:border-emerald-400 hover:shadow-md`
            }`}
          >
            <span className={`text-2xl ${isRtl ? 'ml-3' : 'mr-3'}`}>{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>

      {/* 1. MATÉRIAUX MODE */}
      {activeMode === 'materiaux' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              const materiauxCats = ['All', 'Cement', 'Steel', 'Wood', 'Tiling', 'Plumbing', 'Electrical', 'Paint', 'Other'];
              if (!materiauxCats.includes(cat.id)) return null;
              
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' 
                      : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> {cat.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div></div>
          ) : filteredProducts.length === 0 ? (
            <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="font-black text-xl mb-2">{t.emptySearch}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden ${bgCard} shadow-sm hover:shadow-lg`}>
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={product.image_url || product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    {product.isPopular && <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1`}><TrendingUp size={12}/> {t.popular}</span>}
                    <span className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} text-white font-bold text-sm drop-shadow-md bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm`}>{localizeCommonProductText(product.unit, language)}</span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className={`font-black text-lg leading-tight mb-2 ${textTitle}`}>{localizeCommonProductText(product.name, language)}</h3>
                    <div className="flex items-center gap-1 mb-4">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className={`text-xs font-bold ${textMuted}`}>{product.rating || '4.5'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <p className={`text-[10px] font-bold ${textMuted}`}>{t.retail}</p>
                        <p className="font-black text-blue-500" dir="ltr">{product.price_retail} {getCurrencySymbol(product.currency || 'MAD')}</p>
                      </div>
                      <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                        <p className="text-[10px] font-bold text-emerald-600">{t.wholesale} <span className="opacity-70">(+{product.min_wholesale_qty})</span></p>
                        <p className="font-black text-emerald-600" dir="ltr">{product.price_wholesale} {getCurrencySymbol(product.currency || 'MAD')}</p>
                      </div>
                    </div>
                    <div className={`mt-auto pt-4 border-t border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <p className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${textMuted}`}>
                        <Briefcase size={14} className="text-emerald-500"/> {t.supplier} <span className={textTitle}>{product.supplier || 'Vendeur Indépendant'}</span>
                      </p>
                      <button onClick={() => handleAddToCart(product)} className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${addedItem === product.id ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}>
                        {addedItem === product.id ? <><CheckCircle2 size={16}/> {t.addedSuccess}</> : <><Plus size={16}/> {t.addToCart}</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. SERVICES MODE (لْمْعْلّْم) */}
      {activeMode === 'services' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              const servicesCats = ['All', 'Masonry', 'Tiling', 'Plumbing', 'Electrical', 'Paint', 'Wood', 'Welding', 'Plaster', 'Aluminum', 'Other'];
              if (!servicesCats.includes(cat.id)) return null; 
              
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' 
                      : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> 
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans
              .filter(artisan => {
                const srvName = getLocalizedText(artisan.provider_services?.[0]?.service_name, language);
                const serviceCat = String(artisan.provider_services?.[0]?.category || '');
                const matchesCat =
                  activeCategory === 'All' ||
                  serviceCat.includes(activeCategory) ||
                  matchesCrossLanguageSearch(`${srvName} ${serviceCat}`, activeCategory, activeCategory);
                const matchesQuery = matchesCrossLanguageSearch(
                  `${artisan.store_name || ''} ${srvName} ${artisan.city || ''}`,
                  activeCategory,
                  searchTerm
                );
                return matchesCat && matchesQuery;
              })
              .map((artisan) => {
                const mainService = artisan.provider_services && artisan.provider_services.length > 0 
                  ? artisan.provider_services[0] 
                  : { 
                      service_name: language === 'ar' ? 'خدمات وحرف البناء' : (language === 'fr' ? 'Services BTP' : 'BTP Services'),
                      starting_price: 0
                    };

                let basePrice = Number(mainService.starting_price) || 0;
                let finalPrice = basePrice;
                let priceType = 'standard'; 

                const isFlashDealActive = mainService.flash_discount_price && mainService.flash_expires_at && (new Date(mainService.flash_expires_at) > new Date());
                
                if (isFlashDealActive) {
                  finalPrice = Number(mainService.flash_discount_price);
                  priceType = 'flash';
                } else if (mainService.service_pricing_tiers && mainService.service_pricing_tiers.length > 0) {
                  const activeTier = mainService.service_pricing_tiers.find(
                    tier => requestedQty >= tier.min_qty && requestedQty <= tier.max_qty
                  );
                  if (activeTier) {
                    finalPrice = Number(activeTier.price);
                    priceType = 'tier';
                  }
                }

                const distanceKm = calculateDistance(chantierLocation.lat, chantierLocation.lng, artisan.latitude, artisan.longitude);
                const transportCost = distanceKm !== null ? (distanceKm * costPerKm * numberOfTrips) : 0;
                const goodsCost = finalPrice * requestedQty;
                const totalCost = goodsCost > 0 ? (goodsCost + transportCost) : 0;
                
                const isSmartChoice = distanceKm !== null && distanceKm <= 25 && finalPrice > 0;

                const tCard = {
                  ar: {
                    basePrice: "السعر الأساسي", startingFrom: "ابتداءً من", unavailable: "حسب الاتفاق",
                    viewProfile: "عرض التفاصيل", requestQuote: "إضافة للسلة", unspecified: "فئة غير محددة",
                    distanceToChantier: "المسافة والتوصيل:", deliveryTime: "مدة التوصيل:",
                    totalCostLabel: "التكلفة النهائية للورش:", smartChoice: "💡 الأقرب للورش",
                    goodsPriceLabel: "السعر للوحدة:", km: "كم", notSpecified: artisan.city || "متاح", later: "يحدد لاحقاً",
                    goodsPlusTransport: "(شاملة السلعة + النقل)", artisanName: "اسم المعلم / المورد",
                    qtyRequested: "الكمية المطلوبة", tierApplied: "تم تطبيق خصم الكمية الجملة!",
                    priceTierLabel: "Prix Chantier", priceNormalLabel: "السعر", confirmOrder: "تأكيد طلب الشراء"
                  },
                  fr: {
                    basePrice: "Tarif de base", startingFrom: "À partir de", unavailable: "Sur devis",
                    viewProfile: "Voir Détails", requestQuote: "Ajouter", unspecified: "Catégorie non définie",
                    distanceToChantier: "Distance & Livraison :", deliveryTime: "Délai de livraison :",
                    totalCostLabel: "Coût Final Rendu Chantier :", smartChoice: "💡 Le plus proche",
                    goodsPriceLabel: "Prix Unitaire :", km: "km", notSpecified: artisan.city || "Disponible", later: "À définir",
                    goodsPlusTransport: "(Produit + Transport inclus)", artisanName: "Nom de l'artisan",
                    qtyRequested: "Quantité Demandée", tierApplied: "Prix de gros appliqué !",
                    priceTierLabel: "Prix Chantier", priceNormalLabel: "Prix", confirmOrder: "Confirmer la commande"
                  },
                  en: {
                    basePrice: "Base Price", startingFrom: "Starting from", unavailable: "On quote",
                    viewProfile: "View Details", requestQuote: "Add to Cart", unspecified: "Unspecified category",
                    distanceToChantier: "Distance & Delivery:", deliveryTime: "Delivery time:",
                    totalCostLabel: "Final Delivered Cost:", smartChoice: "💡 Closest to site",
                    goodsPriceLabel: "Unit Price:", km: "km", notSpecified: artisan.city || "Available", later: "TBD",
                    goodsPlusTransport: "(Goods + Transport incl.)", artisanName: "Artisan Name",
                    qtyRequested: "Requested Qty", tierApplied: "Wholesale discount applied!",
                    priceTierLabel: "Tier Price", priceNormalLabel: "Price", confirmOrder: "Confirm Order"
                  }
                }[language] || {
                  unavailable: "Sur devis", viewProfile: "Voir Détails", requestQuote: "Ajouter",
                  distanceToChantier: "Distance :", goodsPriceLabel: "Prix :", km: "km", notSpecified: "Disponible",
                  qtyRequested: "Qté", priceTierLabel: "Prix Chantier", priceNormalLabel: "Prix"
                };

                return (
                  <div key={artisan.id} className={`rounded-3xl border ${priceType === 'flash' ? 'border-red-500 shadow-red-500/10' : 'border-slate-200 dark:border-slate-800'} p-6 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} shadow-sm hover:shadow-xl transition-all relative overflow-hidden`} dir={isRtl ? 'rtl' : 'ltr'}>
                    
                    {priceType === 'flash' && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-xl flex items-center gap-1 z-10">
                        <Zap size={14} className="fill-current" /> BTP Flash Deal
                      </div>
                    )}
                    {priceType !== 'flash' && isSmartChoice && (
                      <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} bg-emerald-500 text-white text-xs font-black px-4 py-1.5 ${isRtl ? 'rounded-bl-xl' : 'rounded-br-xl'} flex items-center gap-1 z-10`}>
                         {tCard.smartChoice}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-4 mb-5">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border">
                        <img src={artisan.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.store_name || 'A')}&background=10b981&color=fff`} alt="logo" className="w-full h-full object-cover"/>
                      </div>
                      <div>
                        <h3 className={`font-black text-lg leading-tight ${textTitle}`}>{artisan.store_name || tCard.artisanName}</h3>
                        <p className="text-sm text-emerald-600 font-bold line-clamp-1">{getLocalizedText(mainService.service_name, language)}</p>
                      </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'} p-4 rounded-2xl border space-y-4`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-xs font-bold block mb-1 ${textMuted}`}>{tCard.goodsPriceLabel} ({priceType === 'tier' ? tCard.priceTierLabel : tCard.priceNormalLabel})</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-black text-2xl ${priceType === 'flash' ? 'text-red-500' : textTitle}`}>
                                {finalPrice > 0 ? finalPrice : tCard.unavailable} {finalPrice > 0 && <span className="text-sm">MAD</span>}
                              </span>
                              {(priceType === 'flash' || priceType === 'tier') && basePrice > 0 && (
                                <span className="text-slate-400 text-sm font-bold line-through">
                                  {basePrice} MAD
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className={isRtl ? 'text-left' : 'text-right'}>
                            <span className={`text-xs font-bold block mb-1 ${textMuted}`}>{tCard.qtyRequested}</span>
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg text-sm font-black flex items-center justify-center gap-1">
                              <Package size={14}/> {requestedQty}
                            </span>
                          </div>
                        </div>

                        {priceType === 'flash' && <FlashDealTimer expiresAt={mainService.flash_expires_at} language={language} />}

                        {priceType === 'tier' && (
                          <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg w-fit">
                            <TrendingDown size={12}/> {tCard.tierApplied}
                          </div>
                        )}
                      </div>

                      <div className={`border-t my-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}></div>

                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-bold ${textMuted}`}>{tCard.distanceToChantier}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">📍 {distanceKm !== null ? `${distanceKm} ${tCard.km}` : tCard.notSpecified}</span>
                      </div>
                      
                      {totalCost > 0 && (
                        <div className="flex justify-between items-center bg-emerald-500 text-white p-3 rounded-xl shadow-inner mt-2">
                          <span className="font-bold text-sm">{tCard.totalCostLabel}</span>
                          <div className={isRtl ? 'text-left' : 'text-right'}>
                            <span className="font-black text-xl block">{totalCost.toLocaleString()} MAD</span>
                            <span className="text-[10px] opacity-80 block">{tCard.goodsPlusTransport}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setSelectedSupplier(artisan)} className={`flex-1 border py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
                        {tCard.viewProfile}
                      </button>
                      <button onClick={() => handleAddToCart({ id: artisan.id, name: getLocalizedText(mainService.service_name, language), supplier: artisan.store_name, price: finalPrice, type: 'service' })} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm font-black shadow-lg cursor-pointer">
                        {tCard.requestQuote}
                      </button>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* 3. EXPERTS MODE */}
      {activeMode === 'experts' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              const expertCats = ['All', 'Architect', 'Topographer', 'Studies', 'Control', 'Interior', 'Other'];
              if (!expertCats.includes(cat.id)) return null; 
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' 
                      : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> 
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 p-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-4">{t.experts.badge}</span>
              <h3 className="font-black text-xl mb-1">Cabinet Yassine Archi</h3>
              <p className="text-slate-400 text-sm mb-4">{t.experts.experience}</p>
              <div className="space-y-3 mb-6">
                <p className="text-sm flex items-center text-slate-300"><CheckCircle className={`w-4 h-4 text-emerald-400 ${isRtl ? 'ml-2' : 'mr-2'}`} /> {t.experts.skill1}</p>
                <p className="text-sm flex items-center text-slate-300"><CheckCircle className={`w-4 h-4 text-emerald-400 ${isRtl ? 'ml-2' : 'mr-2'}`} /> {t.experts.skill2}</p>
              </div>
              <button 
                onClick={() => handleAddToCart({ id: 'e1', name: 'Consultation Architecte', supplier: 'Cabinet Yassine Archi', type: 'expert', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150' })}
                className="w-full bg-emerald-500 text-white py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {t.experts.book}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3.5 GROS OEUVRE MODE */}
      {activeMode === 'grosOeuvre' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              const grosOeuvreCats = ['All', 'Earthworks', 'Concrete', 'Industrial', 'Demolition', 'Sanitation', 'Other'];
              if (!grosOeuvreCats.includes(cat.id)) return null; 
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' 
                      : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> 
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl border overflow-hidden ${bgCard} shadow-sm hover:shadow-lg transition-all`}>
              <div className="h-48 relative bg-slate-200">
                <img src="https://images.unsplash.com/photo-1541888087525-2bf7cd7e4df4?w=500" alt="Gros Oeuvre" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-orange-500 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                  <ShieldCheck size={12}/> {t.companies.verify}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className={`font-black text-lg leading-tight mb-2 ${textTitle}`}>Bâtisseurs Atlas SARL</h3>
                <p className="text-sm text-emerald-600 font-bold mb-4">{t.concrete}</p>
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className={`p-2 rounded-xl text-center border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-xs ${textMuted}`}>{t.transport.capacity}</p>
                    <p className={`font-bold ${textTitle}`}>Équipement complet</p>
                  </div>
                  <div className={`p-2 rounded-xl text-center border ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100'}`}>
                    <p className="text-xs text-emerald-600">{language === 'ar' ? 'التوفر' : 'Dispo'}</p>
                    <p className="font-bold text-emerald-600">{language === 'ar' ? 'فوري' : 'Immédiat'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleAddToCart({ id: 'go1', name: 'Travaux de Fondations', supplier: 'Bâtisseurs Atlas SARL', type: 'service', image_url: 'https://images.unsplash.com/photo-1541888087525-2bf7cd7e4df4?w=150' })}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm font-black shadow-lg mt-auto cursor-pointer"
                >
                  {t.services.requestQuote}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MACHINES MODE */}
      {activeMode === 'machines' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              if (!['All', 'HeavyMachinery', 'Tools', 'Other'].includes(cat.id)) return null; 
              const isActive = activeCategory === cat.id; const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${isActive ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`}`}>
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> {cat.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl border overflow-hidden ${bgCard} shadow-sm hover:shadow-lg transition-all`}>
              <div className="h-48 bg-slate-200 relative">
                <img src="https://images.unsplash.com/photo-1579762699924-a74087cb8916?w=500" alt="Excavatrice" className="w-full h-full object-cover"/>
                <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg`}><Clock className="w-3 h-3 mr-1" /> {t.machines.available} 24h</span>
              </div>
              <div className="p-5">
                <h3 className={`font-black text-lg mb-1 ${textTitle}`}>CAT 320 Excavatrice</h3>
                <p className={`text-sm mb-4 ${textMuted}`}>{t.machines.details}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className={`p-2 rounded-xl text-center border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}><p className={`text-xs ${textMuted}`}>{t.machines.day}</p><p className={`font-bold ${textTitle}`}>1,800 MAD</p></div>
                  <div className={`p-2 rounded-xl text-center border ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100'}`}><p className="text-xs text-emerald-600">{t.machines.week}</p><p className="font-bold text-emerald-600">9,500 MAD</p></div>
                </div>
                <button onClick={() => handleAddToCart({ id: 'm1', name: 'CAT 320 Excavatrice', supplier: 'Atlas Engins', type: 'rental', price: 1800 })} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl hover:opacity-90 font-bold cursor-pointer">{t.machines.book}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MAINTENANCE MODE */}
      {activeMode === 'maintenance' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              const maintenanceCats = ['All', 'HVAC', 'Elevators', 'Security', 'Waterproofing', 'Cleaning', 'Gardens', 'SOS', 'Other'];
              if (!maintenanceCats.includes(cat.id)) return null; 
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' 
                      : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> 
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl border p-5 ${bgCard} shadow-sm hover:shadow-lg transition-shadow`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150" alt="Maintenance" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h3 className={`font-bold text-lg leading-tight ${textTitle}`}>Equipe Atlas Réparation</h3>
                  <p className="text-sm text-emerald-600 font-bold">Mécanique Engins & Climatisation</p>
                </div>
              </div>
              <div className="space-y-2 mb-6 text-sm">
                <div className={`flex justify-between ${textMuted}`}><span>{t.maintenance.type}</span><span className={`font-semibold ${textTitle}`}>Sur chantier</span></div>
                <div className={`flex justify-between ${textMuted}`}><span>{t.maintenance.response}</span><span className="font-semibold text-emerald-600">Sous 2h</span></div>
              </div>
              <button 
                onClick={() => handleAddToCart({ id: 'maint1', name: 'Intervention Rapide', supplier: 'Equipe Atlas', type: 'service', image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150' })}
                className="w-full bg-emerald-500 text-white py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-bold shadow-sm cursor-pointer"
              >
                {t.maintenance.book}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TRANSPORT MODE */}
      {activeMode === 'transport' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              if (!['All', 'GoodsTransport', 'DebrisRemoval', 'Other'].includes(cat.id)) return null; 
              const isActive = activeCategory === cat.id; const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${isActive ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`}`}>
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> {cat.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl border overflow-hidden ${bgCard} shadow-sm hover:shadow-lg transition-shadow`}>
              <div className="h-40 bg-slate-200 relative"><img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500" alt="Camion" className="w-full h-full object-cover"/></div>
              <div className="p-5">
                <h3 className={`font-black text-lg mb-2 ${textTitle}`}>Semi-remorque Plateau</h3>
                <div className="space-y-2 mb-4 text-sm">
                  <div className={`flex justify-between ${textMuted}`}><span>{t.transport.capacity}</span><span className={`font-semibold ${textTitle}`}>24 Tonnes</span></div>
                  <div className={`flex justify-between ${textMuted}`}><span>{t.transport.route}</span><span className={`font-semibold ${textTitle}`}>National</span></div>
                </div>
                <div className={`p-3 rounded-xl text-center border mb-4 ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100'}`}><p className="font-black text-emerald-600">12 {t.transport.price}</p></div>
                <button onClick={() => handleAddToCart({ id: 'trans1', name: 'Semi-remorque', supplier: 'Transporteurs Express', type: 'rental' })} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl hover:opacity-90 font-bold cursor-pointer">{t.transport.book}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DOCUMENTS MODE */}
      {activeMode === 'documents' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              if (!['All', 'Permits', 'Insurance', 'Other'].includes(cat.id)) return null; 
              const isActive = activeCategory === cat.id; const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${isActive ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`}`}>
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl border p-5 ${bgCard} shadow-sm hover:shadow-lg transition-shadow`}>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className={`font-bold text-lg mb-1 ${textTitle}`}>Permis de Construire</h3>
              <p className={`text-sm mb-4 line-clamp-2 ${textMuted}`}>Assistance complète pour l'obtention du permis de construire auprès des autorités locales.</p>
              <div className="space-y-2 mb-6 text-sm">
                <div className={`flex justify-between ${textMuted}`}><span>{t.documents.time}</span><span className={`font-semibold ${textTitle}`}>15-30 Jours</span></div>
                <div className={`flex justify-between ${textMuted}`}><span>{t.documents.type}</span><span className="font-semibold text-blue-500">Administratif</span></div>
              </div>
              <button 
                onClick={() => handleAddToCart({ id: 'doc1', name: 'Permis de Construire', supplier: 'Cabinet Administratif', type: 'service' })}
                className="w-full border-2 border-blue-500 text-blue-500 py-2 rounded-xl hover:bg-blue-50 transition-colors font-bold cursor-pointer"
              >
                {t.documents.request}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. COMPANIES MODE */}
      {activeMode === 'companies' && (
        <div className="animate-fade-in">
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              if (!['All', 'VerifiedSuppliers', 'MajorContractors', 'Other'].includes(cat.id)) return null; 
              const isActive = activeCategory === cat.id; const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${isActive ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 shadow-md' : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`}`}>
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg border border-slate-700 p-6 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner">
                  <Building2 size={32} className="text-slate-800" />
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1 flex items-center gap-2">
                    BTP Maroc SA <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </h3>
                  <p className="text-emerald-400 text-xs font-bold">{t.companies.verify}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                  <p className="text-2xl font-black text-white">45+</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.companies.projects}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                  <p className="text-2xl font-black text-white">ISO</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">9001:2015</p>
                </div>
              </div>
              <button 
                onClick={() => handleAddToCart({ id: 'comp1', name: 'Partenariat Global', supplier: 'BTP Maroc SA', type: 'service' })}
                className="w-full bg-white text-slate-900 py-3 rounded-xl hover:bg-gray-100 transition-colors font-black relative z-10 shadow-lg cursor-pointer"
              >
                {t.companies.contact}
              </button>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
            </div>
          </div>
        </div>
      )}

      {/* 9. SURPLUS MODE */}
      {activeMode === 'surplus' && (
        <div className="animate-fade-in">
          <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 p-4 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2">
                <Zap className="fill-current" /> {t.surplus.title}
              </h2>
              <p className="text-sm text-amber-800 dark:text-amber-500 font-medium mt-1">
                {t.surplus.desc} <span className="font-bold underline">{t.surplus.descBold}</span>
              </p>
            </div>
            <button onClick={() => setIsSurplusModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-bold shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer">
              <Plus size={18} /> {t.surplus.addBtn}
            </button>
          </div>

          {surplusDeals.length === 0 ? (
            <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
              <Zap size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="font-black text-xl mb-2">{t.surplus.empty}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surplusDeals.map((deal) => {
                const distanceKm = calculateDistance(chantierLocation.lat, chantierLocation.lng, deal.latitude, deal.longitude);
                const original = Number(deal.original_price);
                const burn = Number(deal.burn_price);
                const discountPercentage = original > 0 ? Math.round(((original - burn) / original) * 100) : 0;
                
                return (
                  <div key={deal.id} className="rounded-3xl border-2 border-amber-400 p-1 relative overflow-hidden bg-amber-400 shadow-xl hover:-translate-y-1 transition-transform" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className={`absolute top-4 ${isRtl ? 'right-0 rounded-l-xl' : 'left-0 rounded-r-xl'} bg-red-600 text-white font-black text-sm px-4 py-1.5 shadow-lg z-10 flex items-center gap-1`}>
                      {t.surplus.discount} -{discountPercentage}%
                    </div>

                    <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl h-full flex flex-col relative`}>
                      <div className="h-48 relative rounded-t-2xl overflow-hidden">
                        <img src={deal.image_url} alt={deal.item_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                        <div className="absolute bottom-3 right-3 left-3 flex justify-between items-end">
                          <span className="bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20">
                            {t.surplus.qtyLeft} {deal.qty_left}
                          </span>
                          <span className="text-white text-xs font-bold flex items-center gap-1 bg-blue-600/80 backdrop-blur px-3 py-1.5 rounded-lg">
                            <MapPin size={14} /> {t.surplus.distance} {distanceKm !== null ? distanceKm : '?'} {t.surplus.km}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{deal.contractor_name}</p>
                        <h3 className={`font-black text-lg leading-tight mb-4 ${textTitle}`}>{deal.item_name}</h3>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/50">
                            <p className="text-[10px] text-amber-700 dark:text-amber-500 font-bold mb-1">{t.surplus.burnPrice}</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-amber-600">{deal.burn_price}</span>
                              <span className="text-sm font-bold text-amber-600/70">MAD</span>
                              <span className="text-xs text-slate-400 line-through ml-auto">{deal.original_price} MAD</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto space-y-3">
                          <div className="flex justify-center w-full">
                            <FlashDealTimer expiresAt={deal.expires_at} language={language} />
                          </div>
                          <button 
                            onClick={() => handleAddToCart({ id: `surplus_${deal.id}`, name: deal.item_name, supplier: deal.contractor_name, price: Number(deal.burn_price), price_retail: Number(deal.burn_price), type: 'surplus', image_url: deal.image_url })} 
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
                          >
                            <ShoppingCart size={18} /> {t.surplus.bookBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 10. GROUP BUYING MODE */}
      {activeMode === 'groupe' && (
        <div className="animate-fade-in">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-6 rounded-3xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-blue-900 dark:text-blue-400 flex items-center gap-2 mb-2">
                <Globe className="text-blue-500" /> {t.groupe.title}
              </h2>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium max-w-2xl">
                {t.groupe.desc}
              </p>
            </div>
            <button onClick={openCreateGroupModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer">
              <Plus size={18} /> {t.groupe.createBtn}
            </button>
          </div>

          {groupedOrders.length === 0 ? (
            <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
              <Globe size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="font-black text-xl mb-2">{t.groupe.empty}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groupedOrders.map((order) => {
                const progress = Math.min((order.current_qty / order.target_qty) * 100, 100);
                const isCompleted = order.status === 'completed' || progress >= 100;
                const serviceInfo = order.provider_services || {};
                const supplierInfo = serviceInfo.suppliers || {};

                return (
                  <div key={order.id} className={`rounded-3xl border-2 ${isCompleted ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-blue-200 dark:border-blue-800'} p-6 relative overflow-hidden ${bgCard} shadow-lg hover:shadow-xl transition-all`} dir={isRtl ? 'rtl' : 'ltr'}>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border">
                          <img src={supplierInfo.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(supplierInfo.store_name || 'S')}&background=3b82f6&color=fff`} alt="logo" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold mb-1">{supplierInfo.store_name}</p>
                          <h3 className={`font-black text-xl leading-tight ${textTitle}`}>{serviceInfo.service_name || 'سلعة غير محددة'}</h3>
                        </div>
                      </div>
                      <FlashDealTimer expiresAt={order.expires_at} language={language} />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.groupe.targetPrice}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-blue-600">{order.target_price}</span>
                            <span className="text-sm font-bold text-blue-600/70">MAD</span>
                            <span className="text-xs text-slate-400 line-through ml-2">{serviceInfo.starting_price} MAD</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-emerald-600">{t.groupe.collected} {order.current_qty}</span>
                          <span className={textTitle}>{t.groupe.targetQty} {order.target_qty}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 font-bold mt-2">
                          {isCompleted ? 'الكمية مكتملة!' : `${t.groupe.missing} ${order.target_qty - order.current_qty}`}
                        </p>
                      </div>
                    </div>

                    <button 
                      disabled={isCompleted}
                      onClick={() => { setSelectedGroupOrder(order); setIsGroupModalOpen(true); }} 
                      className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                        isCompleted 
                          ? 'bg-emerald-500 text-white cursor-not-allowed' 
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                      }`}
                    >
                      {isCompleted ? <><CheckCircle2 size={20}/> {t.groupe.completedBtn}</> : <><ShoppingCart size={20}/> {t.groupe.joinBtn}</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RFQ CTA Section */}
      <div className="mt-12 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-emerald-400 mb-2">{t.rfq.title}</h2>
          <p className="text-slate-600 dark:text-slate-300">{t.rfq.desc}</p>
        </div>
        
        <button 
          onClick={() => setIsRfqModalOpen(true)} 
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
        <FileText className="w-5 h-5" />
          {t.rfq.btn}
        </button>
      </div>

      {/* Floating Project Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-40 animate-slide-up`}>
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsCartOpen(true)}>
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
                <ShoppingCart size={24} className="text-white" />
              </div>
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-lg">
                {cart.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0)}
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-slate-300">{cart.length} {t.itemsInCart}</p>
              <p className="font-black text-sm text-emerald-400">{t.multiCartDesc}</p>
            </div>
            <button className={`ml-4 px-5 py-2.5 bg-white text-slate-900 hover:bg-emerald-50 rounded-xl font-black text-sm transition-colors flex items-center gap-2`}>
              {t.checkout} <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      )}

      {/* 🚀 استدعاء سلة المشروع الذكية */}
      {isCartOpen && (
        <ProjectCart 
          isDarkMode={isDarkMode} 
          language={language} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          onRemove={removeFromCart} 
          onUpdateQuantity={updateQuantity}
          onNegotiate={() => {
            setIsCartOpen(false);
            const totalAmount = cart.reduce((sum, item) => {
              const p = item.product;
              const activePrice = item.qty >= (p.min_wholesale_qty || 999999) ? (p.price_wholesale || p.price) : (p.price_retail || p.price);
              return sum + (activePrice * item.qty);
            }, 0);

            const orderPayload = {
              items: cart,
              total: totalAmount
            };

            const supplier = cart[0]?.product?.supplier || "المورد";

            navigate('/v2/messages', {
              state: {
                cartOrder: orderPayload,
                supplierName: supplier
              }
            });
          }}
          onCheckout={() => {
            alert(language === 'ar' ? "✅ تم تأكيد وإرسال طلبيتك بنجاح!" : "✅ Validation des commandes déclenchée !");
            setIsCartOpen(false);
          }}
        />
      )}

      {selectedSupplier && (
        <SupplierProfile 
          artisanId={selectedSupplier.id} 
          language={language}      
          isDarkMode={isDarkMode}   
          onClose={() => setSelectedSupplier(null)} 
        />
      )}

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        @keyframes slide-in { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; }
      `}</style>

      {/* ============================================================== */}
      {/* 1. 🤝 نافذة المساهمة في الطلب الجماعي (مع ميكروفون صوتي) */}
      {/* ============================================================== */}
      {isGroupModalOpen && selectedGroupOrder && (
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4" onClick={() => setIsGroupModalOpen(false)}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'} w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border animate-slide-up`} onClick={e => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
            <button onClick={() => setIsGroupModalOpen(false)} className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer`}>
              <X size={20} />
            </button>
            <h2 className={`text-xl font-black mb-2 ${textTitle}`}>{t.groupe?.modal?.title || 'Participer à la commande'}</h2>
            <p className={`text-sm mb-6 ${textMuted}`}>{t.groupe?.modal?.desc || 'Indiquez la quantité que vous souhaitez réserver.'}</p>
            <form onSubmit={handleJoinGroupOrder}>
              <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.groupe?.modal?.qty || 'Quantité souhaitée'}</label>
              <div className="relative flex items-center mb-4">
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedGroupOrder.target_qty - selectedGroupOrder.current_qty}
                  value={joinQty}
                  onChange={e => setJoinQty(e.target.value)}
                  className={`w-full p-4 rounded-xl border outline-none focus:border-blue-500 text-lg font-black text-center ${bgCard} ${textTitle}`}
                  placeholder={t.groupe?.modal?.qtyPlh || 'Ex: 50'}
                />
                <button
                  type="button"
                  onClick={() =>
                    triggerVoiceInput('joinQtyMic', (txt) => {
                      const num = parseDarijaSpokenDigits(txt).replace(/\D/g, '');
                      if (num) setJoinQty(num);
                    })
                  }
                  className={`absolute ${isRtl ? 'left-3' : 'right-3'} p-2 rounded-lg cursor-pointer ${
                    listeningTarget === 'joinQtyMic' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500/15 text-blue-500'
                  }`}
                >
                  <Mic size={16} />
                </button>
              </div>
              <button type="submit" disabled={isJoining} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-4 rounded-xl font-black text-lg shadow-lg flex justify-center items-center gap-2 cursor-pointer">
                {isJoining ? (t.groupe?.modal?.submitting || 'Confirmation...') : (t.groupe?.modal?.submitBtn || 'Confirmer la participation')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. 🌍 نافذة إنشاء طلب جماعي جديد (مع ميكروفون صوتي) */}
      {/* ============================================================== */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4" onClick={() => setIsCreateGroupModalOpen(false)}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'} w-full max-w-md rounded-3xl p-6 shadow-2xl relative border animate-slide-up`} onClick={e => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
            <button onClick={() => setIsCreateGroupModalOpen(false)} className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer`}>
              <X size={20} />
            </button>
            <h2 className={`text-xl font-black mb-1 flex items-center gap-2 ${textTitle}`}>
              <Globe className="text-blue-500" /> {t.groupe?.createModal?.title || 'Créer une commande groupée'}
            </h2>
            <p className={`text-sm mb-6 ${textMuted}`}>{t.groupe?.createModal?.desc || 'Choisissez le produit et définissez la quantité cible.'}</p>
            
            <form onSubmit={handleCreateGroupOrder} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.groupe?.createModal?.service || 'Produit / Service'}</label>
                <select 
                  required 
                  value={newGroupOrder.service_id} 
                  onChange={e => setNewGroupOrder({...newGroupOrder, service_id: e.target.value})} 
                  className={`w-full p-3 rounded-xl border outline-none focus:border-blue-500 text-sm font-bold ${bgCard} ${textTitle}`}
                >
                  <option value="">-- {t.groupe?.createModal?.servicePlh || 'Sélectionnez un produit'} --</option>
                  {availableServices?.map(srv => (
                    <option key={srv.id} value={srv.id}>
                      {srv.service_name} ({srv.suppliers?.store_name || 'Vendeur'}) - {srv.starting_price} MAD
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.groupe?.createModal?.targetQty || 'Quantité Cible'}</label>
                  <div className="relative flex items-center" dir="ltr">
                    <input type="number" required min="1" value={newGroupOrder.target_qty} onChange={e => setNewGroupOrder({...newGroupOrder, target_qty: e.target.value})} className={`w-full p-3 pr-9 rounded-xl border outline-none focus:border-blue-500 text-sm font-bold ${bgCard} ${textTitle}`} placeholder={t.groupe?.createModal?.targetQtyPlh || 'Ex: 500'} />
                    <button
                      type="button"
                      onClick={() =>
                        triggerVoiceInput('grpTargetQty', (txt) => {
                          const num = parseDarijaSpokenDigits(txt).replace(/\D/g, '');
                          if (num) setNewGroupOrder((p) => ({ ...p, target_qty: num }));
                        })
                      }
                      className="absolute right-2 p-1 text-blue-500 cursor-pointer"
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 text-blue-600`}>{t.groupe?.createModal?.targetPrice || 'Prix Cible'}</label>
                  <div className="relative flex items-center" dir="ltr">
                    <input type="number" required min="0" value={newGroupOrder.target_price} onChange={e => setNewGroupOrder({...newGroupOrder, target_price: e.target.value})} className={`w-full p-3 pr-9 rounded-xl border-2 border-blue-200 outline-none focus:border-blue-500 text-sm font-black bg-blue-50 dark:bg-blue-900/20 text-blue-600`} placeholder={t.groupe?.createModal?.targetPricePlh || 'Ex: 67'} />
                    <button
                      type="button"
                      onClick={() =>
                        triggerVoiceInput('grpTargetPrice', (txt) => {
                          const num = parseDarijaSpokenDigits(txt).replace(/\D/g, '');
                          if (num) setNewGroupOrder((p) => ({ ...p, target_price: num }));
                        })
                      }
                      className="absolute right-2 p-1 text-blue-600 cursor-pointer"
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isCreatingGroupOrder} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-4 rounded-xl font-black text-lg shadow-lg flex justify-center items-center gap-2 transition-colors cursor-pointer">
                {isCreatingGroupOrder ? (t.groupe?.createModal?.submitting || 'Lancement...') : (t.groupe?.createModal?.submitBtn || 'Lancer la commande (48h)')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. 🚀 نافذة إضافة فائض الأوراش (مزودة بالميكروفون الصوتي لكل حقل) */}
      {/* ============================================================== */}
      {isSurplusModalOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto" onClick={() => setIsSurplusModalOpen(false)}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'} w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border animate-slide-up my-8`} onClick={e => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
            
            <button onClick={() => setIsSurplusModalOpen(false)} className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-colors cursor-pointer`}>
              <X size={20} />
            </button>

            <h2 className={`text-2xl font-black mb-1 flex items-center gap-2 ${textTitle}`}>
              <Zap className="text-amber-500 fill-current" /> {t.surplus?.modal?.title || 'Vendre un surplus'}
            </h2>
            <p className={`text-sm mb-6 ${textMuted}`}>
              {t.surplus?.modal?.desc || 'Saisissez les détails pour qu\'un autre entrepreneur vienne récupérer la marchandise.'}
            </p>

            <form onSubmit={handleSubmitSurplus} className="space-y-4">
              <label className={`block w-full border-2 border-dashed ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'} rounded-2xl p-6 text-center cursor-pointer transition-colors relative overflow-hidden`}>
                {newSurplus.image_preview ? (
                  <img src={newSurplus.image_preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : (
                  <Camera size={32} className={`mx-auto mb-2 ${textMuted}`} />
                )}
                <span className={`relative z-10 font-bold ${textTitle} drop-shadow-md`}>
                  {t.surplus?.modal?.photo || 'Prendre une photo'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) setNewSurplus({...newSurplus, image_file: file, image_preview: URL.createObjectURL(file)});
                }} />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.surplus?.modal?.contractor || 'Nom de l\'entreprise'}</label>
                  <div className="relative flex items-center">
                    <input type="text" required value={newSurplus.contractor_name} onChange={e => setNewSurplus({...newSurplus, contractor_name: e.target.value})} className={`w-full p-3 ${isRtl ? 'pl-9' : 'pr-9'} rounded-xl border outline-none focus:border-amber-500 text-sm font-bold ${bgCard} ${textTitle}`} placeholder={t.surplus?.modal?.contractorPlh || 'Ex: Chantier Alpha'} />
                    <button
                      type="button"
                      onClick={() => triggerVoiceInput('surpContractor', (txt) => setNewSurplus((p) => ({ ...p, contractor_name: txt })))}
                      className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-1.5 rounded-lg text-amber-500 cursor-pointer`}
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.surplus?.modal?.item || 'Marchandise'}</label>
                  <div className="relative flex items-center">
                    <input type="text" required value={newSurplus.item_name} onChange={e => setNewSurplus({...newSurplus, item_name: e.target.value})} className={`w-full p-3 ${isRtl ? 'pl-9' : 'pr-9'} rounded-xl border outline-none focus:border-amber-500 text-sm font-bold ${bgCard} ${textTitle}`} placeholder={t.surplus?.modal?.itemPlh || 'Ex: Ciment'} />
                    <button
                      type="button"
                      onClick={() => triggerVoiceInput('surpItem', (txt) => setNewSurplus((p) => ({ ...p, item_name: txt })))}
                      className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-1.5 rounded-lg text-amber-500 cursor-pointer`}
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.surplus?.modal?.priceNormal || 'Prix Normal'}</label>
                  <div className="relative flex items-center" dir="ltr">
                    <input type="number" required value={newSurplus.original_price} onChange={e => setNewSurplus({...newSurplus, original_price: e.target.value})} className={`w-full p-3 pr-9 rounded-xl border outline-none focus:border-amber-500 text-sm font-bold ${bgCard} ${textTitle}`} placeholder="MAD" />
                    <button
                      type="button"
                      onClick={() =>
                        triggerVoiceInput('surpOrigPrice', (txt) => {
                          const num = parseDarijaSpokenDigits(txt).replace(/\D/g, '');
                          if (num) setNewSurplus((p) => ({ ...p, original_price: num }));
                        })
                      }
                      className="absolute right-2 p-1.5 text-amber-500 cursor-pointer"
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 text-red-500`}>{t.surplus?.modal?.priceBurn || 'Prix Cassé'}</label>
                  <div className="relative flex items-center" dir="ltr">
                    <input type="number" required value={newSurplus.burn_price} onChange={e => setNewSurplus({...newSurplus, burn_price: e.target.value})} className={`w-full p-3 pr-9 rounded-xl border-2 border-red-200 outline-none focus:border-red-500 text-sm font-black bg-red-50 dark:bg-red-900/20 text-red-600`} placeholder="MAD" />
                    <button
                      type="button"
                      onClick={() =>
                        triggerVoiceInput('surpBurnPrice', (txt) => {
                          const num = parseDarijaSpokenDigits(txt).replace(/\D/g, '');
                          if (num) setNewSurplus((p) => ({ ...p, burn_price: num }));
                        })
                      }
                      className="absolute right-2 p-1.5 text-red-500 cursor-pointer"
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.surplus?.modal?.qty || 'Quantité'}</label>
                  <div className="relative flex items-center">
                    <input type="text" required value={newSurplus.qty_left} onChange={e => setNewSurplus({...newSurplus, qty_left: e.target.value})} className={`w-full p-3 ${isRtl ? 'pl-8' : 'pr-8'} rounded-xl border outline-none focus:border-amber-500 text-sm font-bold ${bgCard} ${textTitle}`} placeholder={t.surplus?.modal?.qtyPlh || '50'} />
                    <button
                      type="button"
                      onClick={() =>
                        triggerVoiceInput('surpQty', (txt) => {
                          const clean = parseDarijaSpokenDigits(txt);
                          setNewSurplus((p) => ({ ...p, qty_left: clean }));
                        })
                      }
                      className={`absolute ${isRtl ? 'left-1.5' : 'right-1.5'} p-1 text-amber-500 cursor-pointer`}
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.surplus?.modal?.duration || 'Durée'}</label>
                  <select value={newSurplus.duration_hours} onChange={e => setNewSurplus({...newSurplus, duration_hours: e.target.value})} className={`w-full p-3 rounded-xl border outline-none focus:border-amber-500 text-sm font-bold ${bgCard} ${textTitle}`}>
                    <option value="12">12 {t.surplus?.modal?.hours || 'H'}</option>
                    <option value="24">24 {t.surplus?.modal?.hours || 'H'}</option>
                    <option value="48">48 {t.surplus?.modal?.hours || 'H'}</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <button type="button" onClick={handleGetSurplusLocation} className={`w-full p-3 rounded-xl border-2 text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${newSurplus.latitude ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-slate-100 border-blue-500 text-blue-600 hover:bg-blue-50'}`}>
                    {newSurplus.latitude ? <CheckCircle2 size={16}/> : <MapPin size={16}/>}
                    {newSurplus.latitude ? (t.surplus?.modal?.gpsLocated || 'Localisé') : (t.surplus?.modal?.gpsBtn || 'GPS')}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSubmittingSurplus} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white p-4 rounded-xl font-black text-lg shadow-lg flex justify-center items-center gap-2 transition-colors cursor-pointer">
                {isSubmittingSurplus ? (t.surplus?.modal?.publishing || 'Publication...') : (t.surplus?.modal?.publishBtn || 'Publier l\'offre')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. 📣 نافذة نشر طلب مخصص (Appel d'offres / RFQ) مع ميكروفون صوتي */}
      {/* ============================================================== */}
      {isRfqModalOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto" onClick={() => setIsRfqModalOpen(false)}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'} w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border animate-slide-up my-8`} onClick={e => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
            <button onClick={() => setIsRfqModalOpen(false)} className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer`}>
              <X size={20} />
            </button>
            <h2 className={`text-xl font-black mb-1 flex items-center gap-2 ${textTitle}`}>
              <FileText className="text-emerald-500" /> {t.rfq?.modal?.title || "Publier un Appel d'offres"}
            </h2>
            <p className={`text-sm mb-6 ${textMuted}`}>{t.rfq?.modal?.desc || "Précisez les détails de votre projet."}</p>
            
            <form onSubmit={handleSubmitRfq} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.rfq?.modal?.reqTitle || "Titre de la demande"}</label>
                <div className="relative flex items-center">
                  <input type="text" required value={rfqForm.title} onChange={e => setRfqForm({...rfqForm, title: e.target.value})} className={`w-full p-3 ${isRtl ? 'pl-10' : 'pr-10'} rounded-xl border outline-none focus:border-emerald-500 text-sm font-bold ${bgCard} ${textTitle}`} placeholder={t.rfq?.modal?.reqTitlePlh || "Ex: Fourniture et pose..."} />
                  <button
                    type="button"
                    onClick={() => triggerVoiceInput('rfqTitleMic', (txt) => setRfqForm((p) => ({ ...p, title: txt })))}
                    className={`absolute ${isRtl ? 'left-2' : 'right-2'} p-1.5 rounded-lg text-emerald-500 cursor-pointer`}
                  >
                    <Mic size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.rfq?.modal?.category || "Catégorie"}</label>
                  <select required value={rfqForm.category} onChange={e => setRfqForm({...rfqForm, category: e.target.value})} className={`w-full p-3 rounded-xl border outline-none focus:border-emerald-500 text-sm font-bold ${bgCard} ${textTitle}`}>
                    <option value="">-- {t.rfq?.modal?.catSelect || "Sélectionnez"} --</option>
                    {categories.filter(c => c.id !== 'All').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                    <option value="other">أخرى / Autres</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.rfq?.modal?.deadline || "Date limite"}</label>
                  <input type="date" required value={rfqForm.deadline} onChange={e => setRfqForm({...rfqForm, deadline: e.target.value})} className={`w-full p-3 rounded-xl border outline-none focus:border-emerald-500 text-sm font-bold ${bgCard} ${textTitle} text-slate-500`} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-bold ${textMuted}`}>{t.rfq?.modal?.details || "Détails Techniques"}</label>
                  <button
                    type="button"
                    onClick={() => triggerVoiceInput('rfqDetailsMic', (txt) => setRfqForm((p) => ({ ...p, details: p.details ? `${p.details} ${txt}` : txt })))}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                      listeningTarget === 'rfqDetailsMic' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/15 text-emerald-500'
                    }`}
                  >
                    <Mic size={13} /> {language === 'ar' ? 'انطق التفاصيل بالدارجة' : 'Dicter'}
                  </button>
                </div>
                <textarea required rows="4" value={rfqForm.details} onChange={e => setRfqForm({...rfqForm, details: e.target.value})} className={`w-full p-3 rounded-xl border outline-none focus:border-emerald-500 text-sm font-medium ${bgCard} ${textTitle}`} placeholder={t.rfq?.modal?.detailsPlh || "Décrivez toutes les spécifications..."}></textarea>
              </div>

              <button type="submit" disabled={isSubmittingRfq} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-4 rounded-xl font-black text-lg shadow-lg flex justify-center items-center gap-2 transition-colors cursor-pointer">
                {isSubmittingRfq ? (t.rfq?.modal?.submitting || "Publication...") : (t.rfq?.modal?.submitBtn || "Publier la demande")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}