import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../store/useSettingsStore';
import { Mic, MicOff, Volume2, Compass, X, CheckCircle2 } from 'lucide-react';

const convertDarijaToDigits = (rawText) => {
  if (!rawText) return '';
  let str = rawText.toLowerCase();
  const eastern = '٠١٢٣٤٥٦٧٨٩';
  str = str.replace(/[٠-٩]/g, (d) => eastern.indexOf(d));

  const compounds = [
    [/عشرين\s*ألف|عشرين\s*الف/g, '20000'],
    [/خمسطاش\s*ألف|خمسة\s*عشر\s*ألف/g, '15000'],
    [/عشرة\s*آلاف|عشر\s*آلاف/g, '10000'],
    [/خمسة\s*آلاف|خمس\s*آلاف/g, '5000'],
    [/أربعة\s*آلاف|ربعة\s*آلاف/g, '4000'],
    [/ثلاثة\s*آلاف|تلاتة\s*آلاف/g, '3000'],
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

const VOICE_NAVIGATION_MAP = [
  { keywords: ['سوق', 'ماركت', 'سلعة', 'مواد', 'marché', 'marketplace', 'market'], paths: { contractor: '/v2/contractor-marketplace', architect: '/v2/architect-marketplace', provider: '/v2/provider-materials', retailer: '/v2/retailer-marketplace' } },
  { keywords: ['لوحة القيادة', 'الرئيسية', 'داشبورد', 'tableau de bord', 'dashboard', 'accueil'], paths: { contractor: '/v2/contractor-dashboard', architect: '/v2/architect-dashboard', provider: '/v2/provider-dashboard', retailer: '/v2/retailer-dashboard' } },
  { keywords: ['حاسبة', 'كالكول', 'تكلفة', 'دوفي', 'calculateur', 'calculator', 'devis'], paths: { contractor: '/v2/contractor-calculator', architect: '/v2/architect-ruler', provider: '/v2/provider-calculator', retailer: '/v2/retailer-pos' } },
  { keywords: ['كاميرا', 'توثيق', 'صور الورش', 'محاضر', 'caméra', 'camera', 'rapports'], paths: { contractor: '/v2/contractor-camera', architect: '/v2/architect-reports', provider: '/v2/provider-portfolio', retailer: '/v2/retailer-inventory' } },
  { keywords: ['رسائل', 'مراسلة', 'شات', 'علبة', 'messages', 'boîte', 'inbox'], paths: { contractor: '/v2/contractor-messages', architect: '/v2/architect-messages', provider: '/v2/provider-messages', retailer: '/v2/retailer-messages' } },
  { keywords: ['فواتير', 'فاكتورة', 'فاتورة', 'factures', 'invoices'], paths: { contractor: '/v2/contractor-b2b-invoices', architect: '/v2/architect-invoices', provider: '/v2/provider-clients', retailer: '/v2/retailer-pos' } },
  { keywords: ['مصاريف', 'خدامة', 'أعباء', 'صائر', 'dépenses', 'frais', 'expenses'], paths: { contractor: '/v2/contractor-expenses', architect: '/v2/architect-expenses', provider: '/v2/provider-expenses', retailer: '/v2/retailer-dashboard' } },
  { keywords: ['مورد', 'متاجر', 'retailer', 'supplier'], paths: { retailer: '/v2/retailer-dashboard' } }
];

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

  const hasBuiltInVoiceUI = PAGES_WITH_DEDICATED_VOICE.some((p) => location.pathname.includes(p));

  const currentSpace = (() => {
    const p = location.pathname;
    if (p.includes('/architect')) return 'architect';
    if (p.includes('/provider-')) return 'provider';
    if (p.includes('/retailer') || p.includes('/pos')) return 'retailer';
    return 'contractor';
  })();

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

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

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
      'اضغط داخل أي خانة في هذه الصفحة ثم اضغط على الميكروفون لملئها بصوتك بالدارجة المغربية أو العربية',
      'أو قل اسم أي قسم مثل السوق أو الفواتير للانتقال إليه فوراً'
    ];
    const frSegments = [
      'Bienvenue dans l\'assistant vocal intelligent SasBTP.',
      'Cliquez dans n\'importe quel champ de cette page puis appuyez sur le micro pour le remplir par la voix en Darija ou en Français.'
    ];
    const enText = 'Welcome to the SasBTP Smart Voice Copilot. Click inside any input field on this page and tap the microphone to fill it by voice.';

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

          if (isFinal) {
            for (const navItem of VOICE_NAVIGATION_MAP) {
              if (navItem.keywords.some((k) => lower.includes(k))) {
                const targetPath = navItem.paths[currentSpace] || navItem.paths.contractor;
                showQuickToast(`🧭 ${clean}`);
                navigate(targetPath);
                return;
              }
            }

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

  if (hasBuiltInVoiceUI && !isExpanded) {
    return (
      <div className={`fixed bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-30 flex items-center gap-2`}>
        {toastMsg && (
          <div className="bg-slate-900/95 text-emerald-400 border border-emerald-500/40 px-3.5 py-2 rounded-2xl text-xs font-black shadow-xl animate-fade-in">
            {toastMsg}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          title={language === 'ar' ? 'فتح المساعد الصوتي العائم' : 'Assistant Vocal Rapide'}
          className="bg-slate-900/70 hover:bg-slate-900 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 backdrop-blur-md opacity-60 hover:opacity-100"
        >
          <Compass size={14} className="text-amber-400" />
          <span className="hidden sm:inline">
            {language === 'ar' ? 'تنقل صوتي' : language === 'fr' ? 'Nav Vocale' : 'Voice Nav'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-40 flex flex-col items-start gap-2`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {toastMsg && (
        <div className="bg-slate-900/95 text-emerald-300 border border-emerald-500/40 px-4 py-2.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 🚀 كبسولة متكيفة: باهتة ومقلصة أولاً، وتكبر بوضوح عند تمرير الماوس فوقها */}
      <div className="bg-slate-900/70 hover:bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center gap-1.5 transition-all duration-300 opacity-60 hover:opacity-100 hover:scale-[1.02]">
        
        <button
          type="button"
          onClick={togglePageAudioGuide}
          title={language === 'ar' ? 'استمع لشرح هذه الصفحة' : 'Écouter le guide'}
          className={`p-2 rounded-xl font-black text-xs flex items-center gap-1 transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-amber-500 text-slate-950 animate-pulse shadow-md'
              : 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700/50'
          }`}
        >
          <Volume2 size={15} />
        </button>

        <button
          type="button"
          onClick={toggleCopilotMic}
          className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-red-500/40'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950'
          }`}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          <div className="text-start leading-tight">
            <span className="block text-[10px] md:text-[11px] font-black">
              {isListening
                ? (language === 'ar' ? 'جاري الاستماع...' : 'Écoute...')
                : activeInputEl
                ? (language === 'ar' ? 'انطق لملء الحقل' : 'Dicter')
                : (language === 'ar' ? 'مساعد صوتي' : 'Assistant IA')}
            </span>
            {activeInputLabel && !isListening && (
              <span className="block text-[8px] font-bold opacity-85 truncate max-w-[110px]">
                🎯 {activeInputLabel}
              </span>
            )}
          </div>
        </button>

        {(hasBuiltInVoiceUI || isExpanded) && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}