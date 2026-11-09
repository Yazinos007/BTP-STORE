import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../store/useSettingsStore';
import { Mic, MicOff, Volume2, Sparkles, Compass, X, CheckCircle2 } from 'lucide-react';

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

// ⚡ دالة حقن القيم برمجياً داخل حقول React (لتعمل مع جميع صفحات المنصة تلقائياً)
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

// 🧭 خريطة الأوامر الصوتية للتنقل الذكي بين أقسام الفضاءات الخمسة
const VOICE_NAVIGATION_MAP = [
  { keywords: ['سوق', 'ماركت', 'سلعة', 'مواد', 'marché', 'marketplace', 'market'], paths: { contractor: '/v2/contractor-marketplace', architect: '/v2/architect-marketplace', provider: '/v2/provider-materials', retailer: '/v2/retailer-marketplace' } },
  { keywords: ['لوحة القيادة', 'الرئيسية', 'داشبورد', 'tableau de bord', 'dashboard', 'accueil'], paths: { contractor: '/v2/contractor-dashboard', architect: '/v2/architect-dashboard', provider: '/v2/provider-dashboard', retailer: '/v2/retailer-dashboard' } },
  { keywords: ['حاسبة', 'كالكول', 'تكلفة', 'دوفي', 'calculateur', 'calculator', 'devis'], paths: { contractor: '/v2/contractor-calculator', architect: '/v2/architect-ruler', provider: '/v2/provider-calculator', retailer: '/v2/retailer-pos' } },
  { keywords: ['كاميرا', 'توثيق', 'صور الورش', 'محاضر', 'caméra', 'camera', 'rapports'], paths: { contractor: '/v2/contractor-camera', architect: '/v2/architect-reports', provider: '/v2/provider-portfolio', retailer: '/v2/retailer-inventory' } },
  { keywords: ['رسائل', 'مراسلة', 'شات', 'علبة', 'messages', 'boîte', 'inbox'], paths: { contractor: '/v2/contractor-messages', architect: '/v2/architect-messages', provider: '/v2/provider-messages', retailer: '/v2/retailer-messages' } },
  { keywords: ['فواتير', 'فاكتورة', 'فاتورة', 'factures', 'invoices'], paths: { contractor: '/v2/contractor-b2b-invoices', architect: '/v2/architect-invoices', provider: '/v2/provider-clients', retailer: '/v2/retailer-pos' } },
  { keywords: ['مصاريف', 'خدامة', 'أعباء', 'صائر', 'dépenses', 'frais', 'expenses'], paths: { contractor: '/v2/contractor-expenses', architect: '/v2/architect-expenses', provider: '/v2/provider-expenses', retailer: '/v2/retailer-dashboard' } },
  { keywords: ['موارد بشرية', 'عمال', 'موظفين', 'ressources humaines', 'rh', 'hr'], paths: { contractor: '/v2/contractor-hr', architect: '/v2/architect-hr', provider: '/v2/provider-expenses', retailer: '/v2/retailer-dashboard' } },
  { keywords: ['صندوق', 'حسابات', 'بنك', 'كيس', 'caisses', 'comptes', 'pos'], paths: { contractor: '/v2/contractor-caisses', architect: '/v2/architect-caisses', provider: '/v2/provider-clients', retailer: '/v2/retailer-pos' } },
  { keywords: ['مناقصات', 'رادار', 'صفقات', 'radar', 'appels d\'offres', 'tenders'], paths: { contractor: '/v2/contractor-radar', architect: '/v2/architect-radar', provider: '/v2/provider-radar', retailer: '/v2/retailer-marketplace' } },
  { keywords: ['إعدادات', 'بروفايل', 'ملفي', 'حسابي', 'profil', 'paramètres', 'settings'], paths: { contractor: '/v2/contractor-settings', architect: '/v2/architect-settings', provider: '/v2/provider-settings', retailer: '/v2/retailer-dashboard' } }
];

// الصفحات التي تمتلك شريطاً صوتياً خاصاً بها مسبقاً (يتحول فيها المساعد العائم لوضع مصغر لمنع أي تضارب)
const PAGES_WITH_DEDICATED_VOICE = [
  '/v2/provider-settings',
  '/v2/provider-projects',
  '/v2/provider-clients',
  '/v2/provider-expenses',
  '/v2/provider-reviews',
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

  // معرفة هل الصفحة الحالية تمتلك أزرار صوت مدمجة بها مسبقاً
  const hasBuiltInVoiceUI = PAGES_WITH_DEDICATED_VOICE.some((p) => location.pathname.includes(p));

  // تحديد الفضاء الحالي
  const currentSpace = (() => {
    const p = location.pathname;
    if (p.includes('/architect')) return 'architect';
    if (p.includes('/provider-')) return 'provider';
    if (p.includes('/retailer') || p.includes('/pos')) return 'retailer';
    return 'contractor';
  })();

  // 🎯 تتبع آخر حقل إدخال (<input> أو <textarea>) نقر عليه المستخدم في أي صفحة
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
        setActiveInputLabel(placeholder.slice(0, 28));
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  // تنظيف الحقل النشط وإيقاف الصوت عند الانتقال من صفحة لأخرى
  useEffect(() => {
    setActiveInputEl(null);
    setActiveInputLabel('');
    setToastMsg('');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
      cloudAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, [location.pathname, language]);

  const showQuickToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 5000);
  };

  // =========================================================================
  // 🔊 1. شرح صوتي ذكي بصوت نسائي صافٍ لأي صفحة يقف فيها المستخدم حالياً
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

    // توليد نص الشرح الصوتي حسب الصفحة الحالية
    const path = location.pathname;
    let arSegments = [
      'مرحباً بك في المساعد الصوتي الذكي لمنصة ساس بي تي بي',
      'اضغط داخل أي خانة في هذه الصفحة ثم اضغط على الميكروفون لملئها بصوتك بالدارجة المغربية أو العربية',
      'أو قل اسم أي قسم مثل السوق أو الفواتير أو المصاريف للانتقال إليه فوراً'
    ];
    let frSegments = [
      'Bienvenue dans l\'assistant vocal intelligent SasBTP.',
      'Cliquez dans n\'importe quel champ de cette page puis appuyez sur le micro pour le remplir par la voix en Darija ou en Français.'
    ];
    let enText =
      'Welcome to the SasBTP Smart Voice Copilot. Click inside any input field on this page and tap the microphone to fill it by voice, or say a section name to navigate.';

    if (path.includes('calculator') || path.includes('ruler')) {
      arSegments = [
        'أنت الآن في صفحة الحاسبة الهندسية الذكية',
        'اضغط على خانة المساحة أو الكمية وانطق الرقم بالدارجة المغربية لحساب التكلفة والسلعة فوراً'
      ];
      frSegments = [
        'Vous êtes dans le calculateur intelligent.',
        'Cliquez sur un champ de surface ou de quantité et dictez vos mesures.'
      ];
    } else if (path.includes('expenses') || path.includes('caisses') || path.includes('invoices')) {
      arSegments = [
        'أنت الآن في قسم المالية والفواتير والمصاريف',
        'اضغط على أي خانة، وتحدث بالدارجة لإدخال اسم المورد أو البيان أو المبلغ بالدرهم تلقائياً'
      ];
      frSegments = [
        'Vous êtes dans la gestion financière et facturation.',
        'Cliquez sur n\'importe quel champ et dictez la désignation ou le montant en dirhams.'
      ];
    }

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
  // 🎙️ 2. الميكروفون العائم (يكتب في الحقل المحدد أو ينفذ أوامر التنقل الصوتي)
  // =========================================================================
  const toggleCopilotMic = () => {
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
        recognition.lang = 'ar-MA';
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
          const normalized = convertDarijaToDigits(clean);
          const lower = normalized.toLowerCase();

          // أ) التحقق أولاً إن كان المستخدم نطق أمر تنقل صريح (مثلاً: "ديني للسوق", "حل الفواتير")
          if (isFinal && /(ديني|سير|افتح|حل|انتقل|الذهاب|aller|ouvrir|go to)/i.test(lower)) {
            for (const navItem of VOICE_NAVIGATION_MAP) {
              if (navItem.keywords.some((k) => lower.includes(k))) {
                const targetPath = navItem.paths[currentSpace] || navItem.paths.contractor;
                showQuickToast(`🧭 ${clean}`);
                navigate(targetPath);
                return;
              }
            }
          }

          // ب) إذا كان هناك حقل إدخال نشط في الصفحة، نحقن الكلام أو الأرقام فيه مباشرة!
          if (activeInputEl && document.body.contains(activeInputEl)) {
            const inputType = (activeInputEl.type || 'text').toLowerCase();
            if (inputType === 'number' || inputType === 'tel') {
              const digitsOnly = normalized.replace(/[^\d.]/g, '');
              if (digitsOnly) {
                injectValueIntoReactInput(activeInputEl, digitsOnly);
                showQuickToast(`✍️ ${digitsOnly}`);
              }
            } else {
              injectValueIntoReactInput(activeInputEl, normalized.trim());
              showQuickToast(`✍️ "${clean}"`);
            }
            return;
          }

          // ج) إذا لم يكن هناك حقل نشط، نفحص هل نطق اسم قسم للانتقال إليه مباشرة
          if (isFinal) {
            for (const navItem of VOICE_NAVIGATION_MAP) {
              if (navItem.keywords.some((k) => lower.includes(k))) {
                const targetPath = navItem.paths[currentSpace] || navItem.paths.contractor;
                showQuickToast(`🧭 ${clean}`);
                navigate(targetPath);
                return;
              }
            }

            // د) إن لم يكن هناك حقل نشط، نبحث عن أول حقل نصي فارغ في الصفحة ونملؤه!
            const firstAvailableInput = document.querySelector(
              'main input[type="text"]:not([disabled]):not([readonly]), main input:not([type]):not([disabled]):not([readonly]), main textarea:not([disabled]):not([readonly])'
            );
            if (firstAvailableInput) {
              firstAvailableInput.focus();
              setActiveInputEl(firstAvailableInput);
              injectValueIntoReactInput(firstAvailableInput, normalized.trim());
              showQuickToast(`✍️ "${clean}"`);
            } else {
              showQuickToast(`🗣️ "${clean}"`);
            }
          }
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

  // 🛡️ في الصفحات التي زودناها مسبقاً بشريط صوتي كامل (ProviderProfile, BTPHub, ProviderSmartHub)
  // نعرض فقط زر تنقل صوتي مصغر وغير متداخل على الإطلاق
  if (hasBuiltInVoiceUI && !isExpanded) {
    return (
      <div className={`fixed bottom-5 ${isRtl ? 'right-5' : 'left-5'} z-30 flex items-center gap-2`}>
        {toastMsg && (
          <div className="bg-slate-900/95 text-emerald-400 border border-emerald-500/40 px-3.5 py-2 rounded-2xl text-xs font-black shadow-xl animate-fade-in">
            {toastMsg}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          title={language === 'ar' ? 'فتح المساعد الصوتي العائم للتنقل السريع' : 'Assistant Vocal Rapide'}
          className="bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 px-3.5 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 backdrop-blur-md"
        >
          <Compass size={15} className="text-amber-400" />
          <span className="hidden sm:inline">
            {language === 'ar' ? 'تنقل صوتي' : language === 'fr' ? 'Nav Vocale' : 'Voice Nav'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-5 ${isRtl ? 'right-5' : 'left-5'} z-40 flex flex-col items-start gap-2`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* إشعار التغذية الراجعة الفورية لما كتبه أو نفذه المساعد */}
      {toastMsg && (
        <div className="bg-slate-900/95 text-emerald-300 border border-emerald-500/40 px-4 py-2.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* كبسولة المساعد الصوتي الذكي لباقي صفحات المنصة الـ 35+ */}
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500/40 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center gap-2">
        
        {/* زر الشرح الصوتي النسائي للصفحة الحالية */}
        <button
          type="button"
          onClick={togglePageAudioGuide}
          title={language === 'ar' ? 'استمع لشرح هذه الصفحة' : 'Écouter le guide de cette page'}
          className={`p-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-amber-500 text-slate-950 animate-pulse shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
          }`}
        >
          <Volume2 size={17} />
        </button>

        {/* زر الميكروفون الذكي (يكتب في أي خانة مفتوحة أو يتنقل بين الصفحات) */}
        <button
          type="button"
          onClick={toggleCopilotMic}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-red-500/40'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950'
          }`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          <div className="text-start leading-tight">
            <span className="block text-[11px] font-black">
              {isListening
                ? (language === 'ar' ? 'جاري الاستماع... تكلم الآن' : language === 'fr' ? 'Écoute en cours...' : 'Listening...')
                : activeInputEl
                ? (language === 'ar' ? 'انطق لملء هذا الحقل' : language === 'fr' ? 'Dicter dans ce champ' : 'Speak into field')
                : (language === 'ar' ? 'مساعد صوتي (دارجة/إدخال)' : language === 'fr' ? 'Assistant Vocal IA' : 'Smart Voice AI')}
            </span>
            {activeInputLabel && !isListening && (
              <span className="block text-[9px] font-bold opacity-80 truncate max-w-[140px]">
                🎯 {activeInputLabel}
              </span>
            )}
          </div>
        </button>

        {hasBuiltInVoiceUI && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}