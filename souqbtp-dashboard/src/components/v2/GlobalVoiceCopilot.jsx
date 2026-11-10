import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../store/useSettingsStore';
import { Mic, MicOff, Volume2, Compass, X, CheckCircle2 } from 'lucide-react';

// 🔤 دالة توحيد الحروف العربية والفرنسية لضمان التطابق الذكي 100% (توحيد الهمزات والتاء المربوطة والهاء)
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/[\u064B-\u065F]/g, '') // إزالة التشكيل
    .replace(/[.,!?؟،؛:"'()[\]{}-]/g, ' ')
    .replace(/\s+/g, ' ');
};

// 🔢 تحويل الأرقام والمبالغ المالية المنطوقة بالدارجة المغربية أو العربية أو الفرنسية إلى أرقام
const convertDarijaToDigits = (rawText) => {
  if (!rawText) return '';
  let str = rawText.toLowerCase();
  const eastern = '٠١٢٣٤٥٦٧٨٩';
  str = str.replace(/[٠-٩]/g, (d) => eastern.indexOf(d));

  const compounds = [
    [/عشرين\s*ألف|عشرين\s*الف/g, '20000'],
    [/خمسطاش\s*ألف|خمسة\s*عشر\s*ألف/g, '15000'],
    [/عشرة\s*آلاف|عشر\s*آلاف|عشرالاف/g, '10000'],
    [/خمسة\s*آلاف|خمس\s*آلاف/g, '5000'],
    [/أربعة\s*آلاف|ربعة\s*آلاف/g, '4000'],
    [/ثلاثة\s*آلاف|تلاتة\s*آلاف/g, '3000'],
    [/ألفين|الفين/g, '2000'],
    [/ألف\s*وخمسمائة|ألف\s*وخمسمية/g, '1500'],
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

  const singleWords = {
    'صفر': '0', 'زيرو': '0', 'واحد': '1', 'جوج': '2', 'زوج': '2', 'اثنان': '2',
    'ثلاثة': '3', 'تلاتة': '3', 'أربعة': '4', 'ربعة': '4', 'خمسة': '5',
    'ستة': '6', 'سبعة': '7', 'ثمانية': '8', 'تمنية': '8', 'تسعة': '9', 'تسعود': '9', 'عشرة': '10'
  };
  Object.keys(singleWords).forEach((w) => {
    const regex = new RegExp(`(^|\\s)${w}(?=\\s|$)`, 'g');
    str = str.replace(regex, ` ${singleWords[w]} `);
  });

  return str;
};

// ⚡ دالة حقن القيم برمجياً داخل حقول React
const injectValueIntoReactInput = (element, newValue) => {
  if (!element) return false;
  try {
    const prototype =
      element.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(element, newValue);
    } else {
      element.value = newValue;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (e) {
    return false;
  }
};

// 🧭 القاموس الشامل لجميع أقسام المنصة في الحسابات الخمسة (المقاول، المهندس، الحرفي، التاجر، المورد، والأدمن)
const VOICE_NAVIGATION_MAP = [
  {
    keywords: ['لوحه القياده', 'الرئيسيه', 'داشبورد', 'نظره عامه', 'مكتبي', 'tableau de bord', 'dashboard', 'accueil', 'overview', 'apercu', 'bureau'],
    paths: { contractor: '/v2/contractor-dashboard', architect: '/v2/architect-dashboard', provider: '/v2/provider-dashboard', retailer: '/', wholesale: '/', admin: '/v2/admin-dashboard' }
  },
  {
    keywords: ['سوق', 'ماركت', 'مارشي', 'شراء السلعه', 'مواد البناء', 'marche', 'marketplace', 'market', 'achat materiaux'],
    paths: { contractor: '/v2/contractor-marketplace', architect: '/v2/architect-marketplace', provider: '/v2/provider-materials', retailer: '/marketplace', wholesale: '/marketplace', admin: '/v2/marketplace' }
  },
  {
    keywords: ['اوراشي', 'مشاريع', 'مسار المشروع', 'الرقابه', 'الورشات', 'chantiers en cours', 'parcours projet', 'controle', 'projects', 'active workshops', 'workshops'],
    paths: { contractor: '/v2/contractor-projects', architect: '/v2/architect-projects', provider: '/v2/provider-projects', retailer: '/orders', wholesale: '/orders', admin: '/v2/admin-workshops' }
  },
  {
    keywords: ['حاسبه', 'كالكول', 'حساب التكلفه', 'مسطره', 'قياس', 'دوفي', 'عروض اسعار', 'calculateur', 'calculator', 'regle', 'mesures', 'devis'],
    paths: { contractor: '/v2/contractor-calculator', architect: '/v2/architect-ruler', provider: '/v2/provider-calculator', retailer: '/devis', wholesale: '/contracts', admin: '/v2/admin-cost-items' }
  },
  {
    keywords: ['نقطه البيع', 'كيس', 'مبيعات مباشره', 'الكايس', 'لاكيص', 'point de vente', 'pos', 'ventes directes'],
    paths: { contractor: '/v2/contractor-caisses', architect: '/v2/architect-caisses', provider: '/v2/provider-clients', retailer: '/pos', wholesale: '/pos-b2b', admin: '/v2/admin-billing' }
  },
  {
    keywords: ['كاميرا', 'توثيق الورش', 'صور الورش', 'محاضر', 'معرض اعمالي', 'بورتفوليو', 'camera', 'rapports', 'portfolio', 'my portfolio'],
    paths: { contractor: '/v2/contractor-camera', architect: '/v2/architect-reports', provider: '/v2/provider-portfolio', retailer: '/products', wholesale: '/stock', admin: '/v2/admin-workshops' }
  },
  {
    keywords: ['ارشيف', 'الارشيف', 'الوثائق', 'المخططات', 'بلانات', 'archives', 'plans'],
    paths: { contractor: '/v2/contractor-projects', architect: '/v2/architect-archive', provider: '/v2/provider-portfolio', retailer: '/invoices', wholesale: '/contracts', admin: '/v2/admin-audit' }
  },
  {
    keywords: ['رادار', 'مناقصات', 'صفقات', 'اوراش حيه', 'radar', 'appels d offres', 'tenders', 'live jobs'],
    paths: { contractor: '/v2/contractor-radar', architect: '/v2/architect-radar', provider: '/v2/provider-radar', retailer: '/marketplace', wholesale: '/tender-radar', admin: '/v2/admin-services' }
  },
  {
    keywords: ['رسائل', 'مراسله', 'شات', 'صندوق الرسائل', 'علبه الرسائل', 'messages', 'boite de reception', 'inbox'],
    paths: { contractor: '/v2/contractor-messages', architect: '/v2/architect-messages', provider: '/v2/provider-messages', retailer: '/messages', wholesale: '/messages', admin: '/v2/messages' }
  },
  {
    keywords: ['لوجستيك', 'بورصه النقل', 'نقل', 'شحن', 'الاسطول', 'فريت', 'bourse de fret', 'freight', 'logistique', 'fleet', 'expeditions'],
    paths: { contractor: '/v2/contractor-freight', architect: '/v2/architect-marketplace', provider: '/v2/provider-materials', retailer: '/fiches-expedition', wholesale: '/logistics-bourse', admin: '/v2/admin-services' }
  },
  {
    keywords: ['طلبيات', 'تتبع الطلبيات', 'طلبات المتجر', 'طلبات التزويد', 'commandes', 'live orders', 'orders', 'suivi'],
    paths: { contractor: '/v2/contractor-live-orders', architect: '/v2/architect-projects', provider: '/v2/provider-projects', retailer: '/orders', wholesale: '/orders', admin: '/v2/admin-services' }
  },
  {
    keywords: ['موارد بشريه', 'العمال', 'الموظفين', 'الفريق', 'المستخدمين', 'ressources humaines', 'human resources', 'hr', 'rh', 'team', 'equipe', 'utilisateurs'],
    paths: { contractor: '/v2/contractor-hr', architect: '/v2/architect-hr', provider: '/v2/provider-expenses', retailer: '/hr', wholesale: '/hr', admin: '/v2/admin-crm' }
  },
  {
    keywords: ['فواتير', 'فاتوره', 'فاكتوره', 'فوثره', 'factures', 'invoices', 'billing'],
    paths: { contractor: '/v2/contractor-b2b-invoices', architect: '/v2/architect-invoices', provider: '/v2/provider-clients', retailer: '/invoices', wholesale: '/invoices', admin: '/v2/admin-billing' }
  },
  {
    keywords: ['صناديق', 'حسابات', 'البنك', 'الخزينه', 'المحفظه', 'caisses', 'comptes', 'accounts', 'wallet', 'banques'],
    paths: { contractor: '/v2/contractor-caisses', architect: '/v2/architect-caisses', provider: '/v2/provider-clients', retailer: '/caisses', wholesale: '/caisses', admin: '/v2/admin-billing' }
  },
  {
    keywords: ['مصاريف', 'الاعباء', 'اجور الخدامه', 'الخدامه', 'النفقات', 'depenses', 'frais', 'charges', 'journaliers', 'expenses'],
    paths: { contractor: '/v2/contractor-expenses', architect: '/v2/architect-expenses', provider: '/v2/provider-expenses', retailer: '/expenses', wholesale: '/expenses', admin: '/v2/admin-billing' }
  },
  {
    keywords: ['جبائي', 'الضرائب', 'النظام الجبائي', 'ضريبه', 'tva', 'fiscal', 'fiscalite', 'tax', 'taxes'],
    paths: { contractor: '/v2/contractor-fiscal', architect: '/v2/architect-fiscal', provider: '/v2/provider-expenses', retailer: '/fiscal', wholesale: '/fiscal', admin: '/v2/admin-billing' }
  },
  {
    keywords: ['محاسبه', 'المحاسبه العامه', 'الميزانيه', 'الحساب العام', 'comptabilite', 'accounting', 'bilan', 'cpc'],
    paths: { contractor: '/v2/contractor-accounting', architect: '/v2/architect-accounting', provider: '/v2/provider-expenses', retailer: '/accounting', wholesale: '/accounting', admin: '/v2/admin-analytics' }
  },
  {
    keywords: ['تدقيق', 'التدقيق الذكي', 'اوديت', 'المستشار الذكي', 'audit', 'conseiller', 'advisor'],
    paths: { contractor: '/v2/contractor-audit', architect: '/v2/architect-audit', provider: '/v2/provider-dashboard', retailer: '/', wholesale: '/audit', admin: '/v2/admin-audit' }
  },
  {
    keywords: ['زبناء', 'الزبناء', 'العملاء', 'التسبيقات', 'الكريدي', 'الديون', 'clients', 'avances', 'dettes'],
    paths: { contractor: '/v2/contractor-projects', architect: '/v2/architect-projects', provider: '/v2/provider-clients', retailer: '/clients', wholesale: '/clients', admin: '/v2/admin-crm' }
  },
  {
    keywords: ['مخزون', 'الستوك', 'السلع', 'المنتجات', 'انتاج', 'المعمل', 'stock', 'produits', 'products', 'inventory', 'production'],
    paths: { contractor: '/v2/contractor-marketplace', architect: '/v2/architect-marketplace', provider: '/v2/provider-materials', retailer: '/products', wholesale: '/stock', admin: '/v2/admin-cost-items' }
  },
  {
    keywords: ['مشتريات', 'الموردين', 'التوريد', 'achats', 'fournisseurs', 'purchases', 'suppliers'],
    paths: { contractor: '/v2/contractor-marketplace', architect: '/v2/architect-marketplace', provider: '/v2/provider-materials', retailer: '/purchases', wholesale: '/raw-purchases', admin: '/v2/admin-cost-items' }
  },
  {
    keywords: ['شركاء النجاح', 'العمولات', 'ارباح الشركاء', 'بارتنير', 'partenaires', 'affiliates', 'gains'],
    paths: { contractor: '/v2/contractor-affiliates', architect: '/v2/architect-affiliates', provider: '/v2/provider-affiliates', retailer: '/affiliates', wholesale: '/affiliates', admin: '/v2/affiliates' }
  },
  {
    keywords: ['اراء الزبناء', 'التقييمات', 'السمعه', 'avis', 'recommandations', 'reviews'],
    paths: { contractor: '/v2/contractor-settings', architect: '/v2/architect-settings', provider: '/v2/provider-reviews', retailer: '/settings', wholesale: '/settings', admin: '/v2/admin-crm' }
  },
  {
    keywords: ['اعدادات', 'الاعدادات', 'ملفي', 'البروفايل', 'الحساب', 'الباقه', 'الاشتراك', 'parametres', 'profil', 'settings', 'profile', 'subscription'],
    paths: { contractor: '/v2/contractor-settings', architect: '/v2/architect-settings', provider: '/v2/provider-settings', retailer: '/settings', wholesale: '/settings', admin: '/v2/admin-global-settings' }
  },
  {
    keywords: ['تحليلات', 'احصائيات', 'اناليتيك', 'analytiques', 'analytics'],
    paths: { contractor: '/v2/contractor-accounting', architect: '/v2/architect-accounting', provider: '/v2/provider-dashboard', retailer: '/', wholesale: '/analytics', admin: '/v2/admin-analytics' }
  }
];

const PAGES_WITH_DEDICATED_VOICE = [
  '/v2/provider-settings',
  '/v2/provider-projects',
  '/v2/provider-clients',
  '/v2/provider-expenses',
  '/v2/provider-reviews',
  '/marketplace',
  '/v2/marketplace',
  '/v2/contractor-marketplace',
  '/v2/architect-marketplace',
  '/v2/provider-marketplace',
  '/v2/provider-materials',
  '/v2/retailer-marketplace'
];

export default function GlobalVoiceCopilot() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeInputEl, setActiveInputEl] = useState(null);
  const [activeInputLabel, setActiveInputLabel] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const recognitionRef = useRef(null);
  const cloudAudioRef = useRef(null);

  // إخفاء الزر في صفحات تسجيل الدخول وصفحات الهبوط التسويقية فقط
  const HIDDEN_EXACT_PATHS = [
    '/empire', '/pro', '/contractor', '/devis-gratuit', '/client-portal',
    '/v2/empire', '/v2/pro', '/v2/contractor',
    '/v2/auth', '/v2/provider-auth', '/v2/architect-register', '/v2/supplier-register',
    '/login', '/register', '/auth'
  ];
  const isHiddenRoute = HIDDEN_EXACT_PATHS.includes(location.pathname);

  const hasBuiltInVoiceUI = PAGES_WITH_DEDICATED_VOICE.some((p) => location.pathname.includes(p));

  // تحديد الفضاء الحالي بدقة عبر جميع الحسابات الخمسة
  const currentSpace = (() => {
    const p = location.pathname;
    if (p.includes('/admin-')) return 'admin';
    if (p.includes('/architect')) return 'architect';
    if (p.includes('/provider-')) return 'provider';
    if (!p.startsWith('/v2')) {
      const preview = sessionStorage.getItem('souqbtp_preview_mode');
      if (preview === 'wholesale') return 'wholesale';
      if (preview === 'retail') return 'retailer';
      if (document.querySelector('.wholesale-dark-scope, .wholesale-light-scope') && p.includes('b2b')) return 'wholesale';
      // نفحص إن كان عنوان الهيدر يشير إلى المورد الكبير B2B
      const h1Text = document.body?.innerText || '';
      if (h1Text.includes('B2B EMPIRE') || h1Text.includes('Wholesale B2B') || h1Text.includes('بوابة المورد الكبير')) {
        return 'wholesale';
      }
      return 'retailer';
    }
    return 'contractor';
  })();

  // 🎯 تتبع الخانة فقط عندما ينقر المستخدم بداخلها فعلياً، وإلغاؤها عندما يخرج منها
  useEffect(() => {
    const handleFocusIn = (e) => {
      const el = e.target;
      if (!el) return;
      const isTextInput =
        el.tagName === 'TEXTAREA' ||
        (el.tagName === 'INPUT' &&
          !['checkbox', 'radio', 'file', 'submit', 'button', 'range', 'date', 'hidden'].includes(el.type));

      if (isTextInput && !el.readOnly && !el.disabled) {
        setActiveInputEl(el);
        const placeholder = el.getAttribute('placeholder') || el.getAttribute('name') || '';
        setActiveInputLabel(placeholder.slice(0, 24));
      }
    };

    const handleClickOutside = (e) => {
      const el = e.target;
      if (!el) return;
      if (el.closest('#sasbtp-global-voice-copilot')) return; // تجاهل الضغط على زر الميكروفون نفسه
      const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
      if (!isInput) {
        setActiveInputEl(null);
        setActiveInputLabel('');
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setActiveInputEl(null);
    setActiveInputLabel('');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
      cloudAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, [location.pathname, language]);

  const showQuickToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // =========================================================================
  // 🧭 دالة البحث الذكي عن القسم المطلوب (من القاموس + مسح روابط السيدبار الحية)
  // =========================================================================
  const findTargetNavigationPath = (rawSpeech) => {
    const normSpeech = normalizeText(rawSpeech);
    if (!normSpeech) return null;

    // إزالة كلمات الأمر مثل "ديني لـ" أو "افتح" أو "سير لـ" لاستخراج اسم القسم الصافي
    const strippedSpeech = normSpeech
      .replace(/^(ديني ل|ديني|سير ل|سير|افتح ليا|افتح|حل ليا|حل|انتقل الي|انتقل ل|بغيت نمشي ل|نمشي ل|وريني|شوف ليا|aller a|aller au|ouvrir|go to|open)\s+/i, '')
      .replace(/^ال/, '') // إزالة ال التعريف من البداية للمقارنة المرنة
      .trim();

    // 1. البحث المباشر في روابط القائمة الجانبية (Sidebar DOM Links) الموجودة فعلياً في الصفحة!
    const sidebarLinks = Array.from(document.querySelectorAll('aside a[href]'));
    for (const linkEl of sidebarLinks) {
      const linkText = normalizeText(linkEl.textContent || '');
      const linkTextNoAl = linkText.replace(/(^|\s)ال/g, '$1').trim();
      if (
        linkText &&
        (linkText.includes(strippedSpeech) ||
          strippedSpeech.includes(linkText) ||
          (strippedSpeech.length >= 3 && linkTextNoAl.includes(strippedSpeech)))
      ) {
        const href = linkEl.getAttribute('href');
        if (href && href.startsWith('/')) {
          return { path: href, label: linkEl.textContent.trim() };
        }
      }
    }

    // 2. البحث في القاموس الشامل لجميع الحسابات الخمسة
    for (const navItem of VOICE_NAVIGATION_MAP) {
      const matched = navItem.keywords.some((kw) => {
        const normKw = normalizeText(kw);
        const normKwNoAl = normKw.replace(/(^|\s)ال/g, '$1').trim();
        return (
          normSpeech.includes(normKw) ||
          strippedSpeech.includes(normKwNoAl) ||
          (strippedSpeech.length >= 3 && normKwNoAl.includes(strippedSpeech))
        );
      });

      if (matched) {
        const targetPath = navItem.paths[currentSpace] || navItem.paths.contractor;
        return { path: targetPath, label: rawSpeech };
      }
    }

    return null;
  };

  // =========================================================================
  // 🔊 1. شرح صوتي ذكي بصوت نسائي صافٍ للصفحة الحالية
  // =========================================================================
  const togglePageAudioGuide = () => {
    if (isSpeaking) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (cloudAudioRef.current) {
        cloudAudioRef.current.onended = null;
        cloudAudioRef.current.onerror = null;
        cloudAudioRef.current.pause();
        cloudAudioRef.current.src = '';
        cloudAudioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const arSegments = [
      'مرحباً بك في المساعد الصوتي الذكي لمنصة ساس بي تي بي',
      'انطق اسم أي قسم في القائمة الجانبية مثل الفواتير أو الحاسبة أو المصاريف للانتقال إليه فوراً',
      'أو اضغط داخل أي خانة كتابة لملئها بصوتك بالدارجة المغربية'
    ];
    const frSegments = [
      'Bienvenue dans l\'assistant vocal intelligent SasBTP.',
      'Dites le nom d\'une rubrique comme Factures, Calculateur ou Dépenses pour y accéder, ou cliquez dans un champ pour dicter.'
    ];
    const enText =
      'Welcome to the SasBTP Smart Voice Copilot. Say any menu section name like Invoices, Calculator, or Expenses to navigate, or click inside any input field to dictate.';

    if (language === 'en' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices() || [];
      const femaleEnVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('en') &&
            (v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Ava'))
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
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
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

    const segments = language === 'ar' ? arSegments : frSegments;
    const targetLang = language === 'ar' ? 'ar' : 'fr';

    const player = new Audio();
    player.preload = 'auto';
    cloudAudioRef.current = player;
    setIsSpeaking(true);

    let currentIdx = 0;
    let isStopped = false;

    const origPause = player.pause.bind(player);
    player.pause = () => {
      isStopped = true;
      origPause();
    };

    const playSegment = () => {
      if (isStopped || currentIdx >= segments.length) {
        setIsSpeaking(false);
        cloudAudioRef.current = null;
        return;
      }

      const textChunk = segments[currentIdx];
      currentIdx += 1;
      const encoded = encodeURIComponent(textChunk);

      const endpoints = [
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${targetLang}&q=${encoded}`,
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encoded}`
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
        const p = player.play();
        if (p !== undefined) {
          p.catch(() => {
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
  // 🎙️ 2. الميكروفون الذكي (أولوية قصوى للتنقل بين الأقسام دون تلويث الخانات)
  // =========================================================================
  const toggleCopilotMic = (forceNavigationOnly = false) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'ar' ? 'يرجى استخدام متصفح Chrome أو Safari لتشغيل الميكروفون.' : 'Veuillez utiliser Chrome ou Safari pour le micro.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }

    setTimeout(() => {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
          let fullText = '';
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript;
          }
          const clean = fullText.trim();
          if (!clean) return;

          const isFinal = event.results[event.results.length - 1].isFinal;
          const normalizedDigits = convertDarijaToDigits(clean);

          // 🧭 الأولوية رقم 1 دائماً: فحص هل ما نطقه المستخدم هو اسم قسم أو أمر انتقال؟
          // إذا كان اسم قسم، ننتقل إليه فوراً ولا نكتبه أبداً داخل أي خانة!
          const navMatch = findTargetNavigationPath(clean);
          const hasExplicitNavVerb = /(ديني|سير|افتح|حل|انتقل|الذهاب|بغيت نمشي|aller|ouvrir|go to|open)/i.test(clean);

          if (navMatch && (forceNavigationOnly || hasExplicitNavVerb || clean.split(/\s+/).length <= 4)) {
            if (isFinal) {
              // إذا كنا قد كتبنا شيئاً مؤقتاً في الخانة أثناء الـ interim، نمسحه قبل الانتقال
              showQuickToast(`🧭 ${clean} ✓`);
              setIsListening(false);
              try { recognition.stop(); } catch (e) {}
              navigate(navMatch.path);
            } else {
              showQuickToast(`🧭 ${clean}...`);
            }
            return;
          }

          // ✍️ الأولوية رقم 2: إذا لم يكن أمر تنقل، وكان المستخدم قد نقر بنفسه داخل خانة إدخال نشطة
          if (!forceNavigationOnly && activeInputEl && document.body.contains(activeInputEl)) {
            const inputType = (activeInputEl.type || 'text').toLowerCase();
            if (inputType === 'number' || inputType === 'tel') {
              const digitsOnly = normalizedDigits.replace(/[^\d.]/g, '');
              if (digitsOnly) {
                injectValueIntoReactInput(activeInputEl, digitsOnly);
                showQuickToast(`✍️ ${digitsOnly}`);
              }
            } else {
              injectValueIntoReactInput(activeInputEl, normalizedDigits.trim());
              showQuickToast(`✍️ "${clean}"`);
            }
            return;
          }

          // 🗣️ إذا لم يكن في خانة ولم يطابق قسماً بعد
          showQuickToast(`🗣️ "${clean}"`);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        setIsListening(false);
      }
    }, 100);
  };

  if (isHiddenRoute) return null;

  // 🛡️ في الصفحات التي تمتلك ميكروفوناتها الخاصة (مثل الماركت بليس وبروفايل الحرفي):
  // الضغط على زر "تنقل صوتي" يشغل الميكروفون فوراً من أول ضغطة للتنقل بين الأقسام!
  if (hasBuiltInVoiceUI && !isExpanded) {
    return (
      <div
        id="sasbtp-global-voice-copilot"
        className={`fixed bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-[99999] flex flex-col items-start gap-2`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {toastMsg && (
          <div className="bg-slate-950 text-emerald-400 border border-emerald-500/50 px-3.5 py-2 rounded-2xl text-xs font-black shadow-2xl animate-fade-in">
            {toastMsg}
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-950 border border-amber-500/40 rounded-full p-1 shadow-xl backdrop-blur-md opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105">
          <button
            type="button"
            onClick={() => toggleCopilotMic(true)}
            title={language === 'ar' ? 'اضغط وانطق اسم أي قسم للانتقال إليه فوراً' : 'Cliquez et dites le nom d\'une page'}
            className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-lg'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950'
            }`}
          >
            {isListening ? <MicOff size={13} /> : <Compass size={14} />}
            <span>
              {isListening
                ? (language === 'ar' ? 'قل اسم القسم...' : 'Dites la page...')
                : (language === 'ar' ? 'تنقل صوتي' : language === 'fr' ? 'Nav Vocale' : 'Voice Nav')}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="sasbtp-global-voice-copilot"
      className={`fixed bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-[99999] flex flex-col items-start gap-2`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {toastMsg && (
        <div className="bg-slate-950 text-emerald-300 border border-emerald-500/50 px-4 py-2.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 🚀 كبسولة متكيفة ومحصنة ضد تغير الألوان في جميع الحسابات الخمسة */}
      <div
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.92)', borderColor: 'rgba(245, 158, 11, 0.45)' }}
        className="backdrop-blur-xl border-2 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] flex items-center gap-1.5 transition-all duration-300 opacity-65 hover:opacity-100 hover:scale-[1.03]"
      >
        <button
          type="button"
          onClick={togglePageAudioGuide}
          title={language === 'ar' ? 'استمع لشرح هذه الصفحة' : 'Écouter le guide'}
          style={{ backgroundColor: isSpeaking ? '#f59e0b' : '#1e293b', color: isSpeaking ? '#0f172a' : '#fbbf24' }}
          className={`p-2 rounded-xl font-black text-xs flex items-center gap-1 transition-all cursor-pointer ${
            isSpeaking ? 'animate-pulse shadow-md' : 'hover:opacity-90 border border-slate-700'
          }`}
        >
          <Volume2 size={15} />
        </button>

        <button
          type="button"
          onClick={() => toggleCopilotMic(false)}
          style={{
            background: isListening ? '#dc2626' : 'linear-gradient(to right, #f97316, #f59e0b)',
            color: isListening ? '#ffffff' : '#0f172a'
          }}
          className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            isListening ? 'animate-pulse shadow-red-500/40' : ''
          }`}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          <div className="text-start leading-tight">
            <span className="block text-[10px] md:text-[11px] font-black">
              {isListening
                ? (language === 'ar' ? 'تكلم الآن...' : language === 'fr' ? 'Parlez...' : 'Speak...')
                : activeInputEl
                ? (language === 'ar' ? 'إملاء في الخانة' : language === 'fr' ? 'Dicter ici' : 'Dictate here')
                : (language === 'ar' ? 'مساعد وتنقل صوتي' : language === 'fr' ? 'Assistant Vocal IA' : 'Voice Copilot')}
            </span>
            {activeInputLabel && !isListening && (
              <span className="block text-[8px] font-bold opacity-85 truncate max-w-[110px]">
                🎯 {activeInputLabel}
              </span>
            )}
          </div>
        </button>

        {activeInputEl && !isListening && (
          <button
            type="button"
            onClick={() => { setActiveInputEl(null); setActiveInputLabel(''); }}
            title={language === 'ar' ? 'إلغاء ربط الخانة والتبديل لوضع التنقل' : 'Mode navigation'}
            className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}