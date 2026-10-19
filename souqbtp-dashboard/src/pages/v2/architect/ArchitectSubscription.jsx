import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../../../lib/supabase';
import useArchitectStore from '../../../store/useArchitectStore';
import useSettingsStore from '../../../store/useSettingsStore';

// Translations dictionary for UI localization
const translations = {
  ar: {
    pageTitle: "خطط الاشتراكات والترقية",
    pageSubtitle: "اختر الخطة المناسبة لتطوير أعمالك المعمارية وتمكين أدوات الذكاء الاصطناعي",
    monthly: "شهري",
    annual: "سنوي",
    saveBadge: "وفّر 20%",
    currentPlan: "خطتك الحالية",
    upgradeNow: "ترقية الآن",
    activePlan: "نشط حالياً",
    checkoutTitle: "تأكيد الاشتراك والترقية",
    payWithCard: "الدفع بواسطة البطاقة البنكية",
    processing: "جاري المعالجة...",
    confirmPayment: "تأكيد وتفعيل الاشتراك",
    close: "إغلاق",
    whitelabelTitle: "خدمة الهوية المستقلة (Whitelabel)",
    whitelabelDesc: "قم بإزالة جميع شعارات المنصة واستخدم نطاقك الخاص وحساباتك المستقلة بالكامل.",
    whitelabelBtn: "إضافة الخدمة الحصرية",
    faqTitle: "الأسئلة الشائعة",
    comparisonTitle: "مقارنة الميزات التفصيلية",
    feature: "الميزة",
    basicTier: "الأساسية (Basic)",
    proTier: "المحترفة (Pro)",
    vipTier: "كبار العجلاء (VIP)",
    chatHeader: "المساعد الذكي للاشتراكات",
    chatPlaceholder: "اكتب استفسارك هنا...",
    chatSend: "إرسال",
    successMsg: "تم ترقية اشتراكك بنجاح! استمتع بكافة الميزات الجديدة.",
    errorMsg: "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقاً."
  },

  fr: {
    pageTitle: "Plans d'abonnement & Mises à niveau",
    pageSubtitle: "Choisissez le plan idéal pour développer votre cabinet d'architecture",
    monthly: "Mensuel",
    annual: "Annuel",
    saveBadge: "Économisez 20%",
    currentPlan: "Plan Actuel",
    upgradeNow: "Mettre à niveau",
    activePlan: "Actuellement Actif",
    checkoutTitle: "Confirmer l'Abonnement",
    payWithCard: "Payer par Carte Baucaiic",
    processing: "Traitement en cours...",
    confirmPayment: "Confirmer et Activer",
    close: "Fermer",
    whitelabelTitle: "Option Marque Blanche (Whitelabel)",
    whitelabelDesc: "Supprimez toute marque de la plateforme, utilisez votre propre domaine.",
    whitelabelBtn: "Ajouter l'option Marque Blanche",
    faqTitle: "Foire Aux Questions",
    comparisonTitle: "Comparaison Détaillée des Fonctionnalités",
    feature: "Fonctionnalité",
    basicTier: "De Base (Basic)",
    proTier: "Professionnel (Pro)",
    vipTier: "VIP / Entreprise",
    chatHeader: "Assistant IA Abonnements",
    chatPlaceholder: "Posez votre question...",
    chatSend: "Envoyer",
    successMsg: "Abonnement mis à niveau avec succès!",
    errorMsg: "Une erreur est survenue lors du traitement."
  },

  en: {
    pageTitle: "Subscription Plans & Upgrades",
    pageSubtitle: "Select the ideal tier to empower your architectural practice with AI tools",
    monthly: "Monthly",
    annual: "Annual",
    saveBadge: "Save 20%",
    currentPlan: "Current Plan",
    upgradeNow: "Upgrade Now",
    activePlan: "Currently Active",
    checkoutTitle: "Confirm Subscription",
    payWithCard: "Pay via Credit Card",
    processing: "Processing...",
    confirmPayment: "Confirm & Activate",
    close: "Close",
    whitelabelTitle: "Whitelabel Solution",
    whitelabelDesc: "Remove platform branding and use your custom domain with dedicated servers.",
    whitelabelBtn: "Add Whitelabel Add-on",
    faqTitle: "Frequently Asked Questions",
    comparisonTitle: "Detailed Feature Comparison",
    feature: "Feature",
    basicTier: "Basic",
    proTier: "Pro",
    vipTier: "VIP",
    chatHeader: "Subscription AI Assistant",
    chatPlaceholder: "Type your query here...",
    chatSend: "Send",
    successMsg: "Subscription upgraded successfully! Enjoy your new features.",
    errorMsg: "An error occurred while processing your request."
  }
};

// Subscription Plans Definition
const PLANS = [
  {
    id: 'basic',
    name: { ar: 'الأساسية', fr: 'Basic', en: 'Basic' },
    priceMonthly: 29,
    priceAnnual: 290,
    borderClass: 'border-slate-700 hover:border-slate-500',
    glowClass: 'shadow-slate-900/50',
    badge: null,
    features: {
      ar: ['حتى 5 مشاريع نشطة', 'تصدير PDF قياسي', 'دعم عبر البريد الإلكتروني', 'وصول محدود لنماذج الذكاء الاصطناعي'],
      fr: ['Jusqu\'à 5 projets actifs', 'Exportation PDF standard', 'Support par e-mail', 'Accès IA limité'],
      en: ['Up to 5 active projects', 'Standard PDF Export', 'Email Support', 'Limited AI Model Access']
    }
  },

  {
    id: 'pro',
    name: { ar: 'المحترفة', fr: 'Professionnel', en: 'Pro' },
    priceMonthly: 79,
    priceAnnual: 790,
    borderClass: 'border-cyan-500 hover:border-cyan-400',
    glowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    badge: { ar: 'الأكثر شعبية', fr: 'Populaire', en: 'Most Popular' },
    features: {
      ar: ['مشاريع غير محدودة', 'تصدير مخططات 4K عالية الدقة', 'أولوية معالجة الذكاء الاصطناعي', 'دعم مباشر 24/7', 'ربط نطاق خاص'],
      fr: ['Projets illimités', 'Exports BD/4K haute résolution', 'Traitement IA prioritaire', 'Support direct 24/7', 'Domaine personnalisé'],
      en: ['Unlimited Projects', '4K High-Res Blueprint Exports', 'Priority AI Processing', '24/7 Direct Support', 'Custom Domain Integration']
    }
  },

  {
    id: 'vip',
    name: { ar: 'كبار العملاء VIP', fr: 'VIP / Entreprise', en: 'VIP Tier' },
    priceMonthly: 199,
    priceAnnual: 1990,
    borderClass: 'border-amber-500 hover:border-amber-400',
    glowClass: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    badge: { ar: 'VIP حصرية', fr: 'VIP Exclusif', en: 'Exclusive VIP' },
    features: {
      ar: ['كل ميزات Pro', 'خوادم معالجة خاصة', 'مدير حساب شخصي', 'إزالة الشعار (Whitelabel)', 'تخصيص نماذج AI خاصة'],
      fr: ['Toutes les fonctionnalités Pro', 'Serveurs dédiés', 'Gestionnaire de compte dédié', 'Option Marque Blanche requise', 'Modèles IA personnalisés'],
      en: ['All Pro Features', 'Dedicated Render Servers', 'Dedicated Account Manager', 'Whitelabel Ready', 'Custom Fine-tuned AI Models']
    }
  }
];

export default function ArchitectSubscription() {
  const { architectProfile: profile, fetchArchitectData } = useArchitectStore();
  
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('basic');

  // Checkout Form State
  const [agencyName, setAgencyName] = useState('');
  const [agencyICE, setAgencyICE] = useState('');

  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'أهلاً بك يا مهندس! أنا مساعدك الذكي من منصة SouqBTP. كيف يمكنني مساعدتك اليوم لاختيار الباقة الأنسب لمكتبك؟' }
  ]);
  const messagesEndRef = useRef(null);

  // Animated Prices State
  const [priceBasic, setPriceBasic] = useState(139);
  const [pricePro, setPricePro] = useState(349);
  const [priceVip, setPriceVip] = useState(699);

  // استحضار خطة المستخدم الحالية
  useEffect(() => {
    if (profile?.subscription_plan) {
      setCurrentPlan(profile.subscription_plan.toLowerCase());
      setAgencyName(profile.agency_name || '');
    }
  }, [profile]);

  // التمرير التلقائي لرسائل الذكاء الاصطناعي
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // دالة تحريك الأرقام تماماً كما في الـ PHP
  const animateValue = (setter, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setter(Math.floor(progress * (end - start) + start));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  const handleToggleBilling = (checked) => {
    setIsAnnual(checked);
    const targets = checked ? { basic: 139, pro: 349, vip: 699 } : { basic: 199, pro: 499, vip: 999 };
    animateValue(setPriceBasic, priceBasic, targets.basic, 300);
    animateValue(setPricePro, pricePro, targets.pro, 300);
    animateValue(setPriceVip, priceVip, targets.vip, 300);
  };

  const openCheckout = (planCode, planName, basePrice) => {
    setSelectedPlan({
      code: planCode,
      name: planName,
      price: isAnnual ? basePrice * 12 : basePrice
    });
    setIsCheckoutOpen(true);
  };

  const processInstantUpgrade = () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsCheckoutOpen(false);

      // 1. الاحتفال البصري
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#fbbf24', '#38bdf8'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#fbbf24', '#38bdf8'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());

      // 2. تحديث الواجهة فوراً (Optimistic UI)
      setCurrentPlan(selectedPlan.code);

      // 3. التحديث الفعلي في Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const updates = { subscription_plan: selectedPlan.code };
          if (agencyName) updates.agency_name = agencyName;
          await supabase.from('architects').update(updates).eq('user_id', user.id);
          
          // تحديث مخزن Zustand
          if (fetchArchitectData) await fetchArchitectData(user.id);
        }
      } catch (error) {
        console.error("DB Update Error", error);
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  const sendAiQuestion = (qId, questionText) => {
    setMessages(prev => [...prev, { sender: 'user', text: questionText }]);
    setMessages(prev => [...prev, { sender: 'bot', text: 'يكتب... ✍️', isTyping: true }]);

    setTimeout(() => {
      let answer = '';
      if(qId === 1) answer = "نعم بكل تأكيد! ⚖️ تقارير الـ GPS في منصتنا تقوم بتشفير (خط العرض، خط الطول، وتاريخ الزيارة بالثانية) على صورة الورشة كعلامة مائية لا يمكن تزويرها، مما يعطي محاضرك قوة إثبات قاطعة أمام الجهات المانحة للرخص.";
      if(qId === 2) answer = "الأمر يحدث في لمح البصر ⚡! بمجرد إتمام الدفع أو إرسال وصل التحويل، يقوم نظام (God Mode) بفتح جميع الميزات المقفلة (المسطرة، التقارير، الـ AI) في نفس اللحظة دون الحاجة لانتظار الموافقة اليدوية.";
      if(qId === 3) answer = "راحتك هي أولويتنا 🤝. نعم، يمكنك إيقاف التجديد متى شئت بضغطة زر من إعدادات حسابك. لكن تذكر أن الدفع السنوي يوفر لك 30% من ميزانية المكتب ويمنحك شهرين مجاناً!";

      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, { sender: 'bot', text: answer }]);
    }, 1200);
  };

  return (
    <div className="blueprint-theme-wrapper" dir="rtl">
      <style>{`
        /* ========================================= */
        /* 🌌 الهوية البصرية الهندسية (Blueprint Theme) */
        /* ========================================= */
        .blueprint-theme-wrapper {
            --navy-bg: #0f172a;
            --navy-card: rgba(30, 41, 59, 0.7);
            --orange-glow: rgba(245, 158, 11, 0.15);
            --blue-glow: rgba(56, 189, 248, 0.15);
            --blueprint-line: rgba(56, 189, 248, 0.07);
            --gold: #fbbf24;
            --glass-border: rgba(255, 255, 255, 0.1);
            --success: #10b981;
            --danger: #ef4444;

            font-family: 'Cairo', sans-serif;
            background-color: var(--navy-bg);
            background-image: 
                radial-gradient(circle at 80% -20%, var(--orange-glow) 0%, transparent 50%),
                radial-gradient(circle at 20% 120%, var(--blue-glow) 0%, transparent 50%),
                linear-gradient(var(--blueprint-line) 1px, transparent 1px),
                linear-gradient(90deg, var(--blueprint-line) 1px, transparent 1px);
            background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
            color: #f8fafc;
            min-height: 100vh;
            padding-bottom: 50px;
        }

        .subscription-container { max-width: 1250px; margin: 0 auto; padding: 60px 20px; position: relative; z-index: 10; }

        .sub-header { text-align: center; margin-bottom: 40px; }
        .badge-new { display: inline-block; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid #38bdf8; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; margin-bottom: 15px; box-shadow: 0 0 15px rgba(56,189,248,0.2); }
        .sub-header h1 { font-size: 2.8rem; color: #ffffff; font-weight: 900; margin-bottom: 15px; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .sub-header p { color: #94a3b8; font-size: 1.15rem; max-width: 700px; margin: 0 auto; line-height: 1.6; }

        .social-proof { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 25px; font-size: 0.9rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 10px 20px; border-radius: 30px; width: fit-content; margin-left: auto; margin-right: auto; border: 1px solid var(--glass-border); backdrop-filter: blur(5px); }
        .pulse-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #10b981; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.8; } }

        .billing-toggle-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 60px; }
        .save-badge { background: linear-gradient(90deg, #f59e0b, #d97706); color: white; padding: 6px 20px; border-radius: 30px; font-weight: bold; font-size: 0.9rem; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); border: 1px solid #fbbf24; }
        .toggle-wrapper { display: flex; align-items: center; gap: 20px; background: rgba(15, 23, 42, 0.8); padding: 10px 25px; border-radius: 50px; border: 1px solid var(--glass-border); box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .toggle-label { font-weight: bold; color: #64748b; transition: 0.3s; cursor: pointer; }
        .toggle-label.active { color: #38bdf8; text-shadow: 0 0 10px rgba(56,189,248,0.5); }
        
        .switch { position: relative; display: inline-block; width: 60px; height: 30px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 30px; }
        .slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        .switch input:checked + .slider { background-color: #38bdf8; box-shadow: 0 0 10px #38bdf8; }
        .switch input:checked + .slider:before { transform: translateX(30px); }

        .pricing-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; margin-bottom: 80px; align-items: stretch; }
        .card { background: var(--navy-card); backdrop-filter: blur(15px); border-radius: 24px; padding: 40px 30px; border: 1px solid var(--glass-border); transition: all 0.4s ease; position: relative; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .card:hover { transform: translateY(-15px); border-color: rgba(255,255,255,0.3); }

        .tier-icon { font-size: 3rem; margin-bottom: 5px; line-height: 1; text-align: center; }
        .icon-basic { text-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
        .icon-pro { text-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
        .icon-vip { text-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }

        .card-header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid var(--glass-border); padding-bottom: 20px; }
        .card-header h3 { font-size: 1.5rem; color: #f8fafc; margin: 0 0 15px 0; }
        .price { display: flex; justify-content: center; align-items: baseline; gap: 5px; color: #fff; }
        .price .amount { font-size: 4rem; font-weight: 900; transition: 0.3s; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .price .currency, .price .period { font-size: 1.1rem; color: #94a3b8; font-weight: bold; }

        .features-list { list-style: none; padding: 0; margin: 0 0 30px 0; text-align: right; flex-grow: 1; }
        .features-list li { margin-bottom: 16px; color: #cbd5e1; font-size: 0.95rem; display: flex; align-items: center; gap: 12px; position: relative; }
        .features-list li b { color: #fff; }
        .features-list li.disabled { color: #475569; text-decoration: line-through; }
        
        .sub-btn { width: 100%; padding: 15px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; cursor: pointer; border: none; transition: 0.3s; font-family: 'Cairo'; text-align: center; }

        .has-tooltip { cursor: help; border-bottom: 1px dashed rgba(255,255,255,0.3); display: inline-flex !important; }
        .tooltip-box { visibility: hidden; opacity: 0; position: absolute; bottom: 120%; right: 0; background: #000; border: 1px solid #38bdf8; border-radius: 12px; padding: 10px; width: 220px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 100; transition: 0.3s; text-align: center; }
        .has-tooltip:hover .tooltip-box { visibility: visible; opacity: 1; transform: translateY(-5px); }
        .tooltip-box img { width: 100%; border-radius: 8px; margin-bottom: 8px; }
        .tooltip-box span { display: block; font-size: 0.8rem; color: #cbd5e1; }

        .basic-card { border-top: 4px solid #10b981; }
        .basic-btn { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
        .basic-btn:hover { background: rgba(255,255,255,0.2); }

        .pro-card { border: 2px solid #38bdf8; border-top: 4px solid #38bdf8; transform: scale(1.05); background: rgba(15, 23, 42, 0.8); box-shadow: 0 0 40px rgba(56, 189, 248, 0.15); z-index: 5; }
        .popular-ribbon { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: #000; padding: 5px 25px; border-radius: 50px; font-weight: 900; font-size: 0.9rem; box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4); }
        .pro-btn { background: #38bdf8; color: #0f172a; box-shadow: 0 10px 25px rgba(56, 189, 248, 0.3); }
        .pro-btn:hover { background: #0ea5e9; color: white; }

        .vip-card { border: 2px solid var(--gold); border-top: 4px solid var(--gold); background: linear-gradient(180deg, rgba(30,41,59,0.9), rgba(0,0,0,0.9)); box-shadow: 0 0 40px rgba(251, 191, 36, 0.1); }
        .vip-card .card-header h3 { color: var(--gold); }
        .vip-btn { background: transparent; color: var(--gold); border: 2px solid var(--gold); }
        .vip-btn:hover { background: var(--gold); color: #000; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3); }

        .whitelabel-section { display: flex; flex-wrap: wrap; gap: 30px; background: var(--navy-card); border: 1px solid var(--glass-border); padding: 40px; border-radius: 24px; margin-bottom: 60px; align-items: center; backdrop-filter: blur(10px); }
        .wl-text { flex: 1; min-width: 300px; }
        .wl-text h2 { color: var(--gold); font-size: 2rem; margin-top: 0; }
        .wl-text p { color: #cbd5e1; line-height: 1.8; font-size: 1.05rem; }
        .wl-image { flex: 1; min-width: 300px; text-align: center; position: relative; }
        .wl-image img { max-width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); transform: rotate(2deg); transition: 0.3s; }
        .wl-image img:hover { transform: rotate(0deg) scale(1.05); }

        .comparison-section { background: var(--navy-card); padding: 50px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid var(--glass-border); backdrop-filter: blur(15px); margin-bottom: 60px; }
        .comparison-section h2 { text-align: center; margin-bottom: 40px; font-weight: 900; color: #fff; font-size: 2rem; }
        .table-responsive { overflow-x: auto; }
        .comparison-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .comparison-table th, .comparison-table td { padding: 20px; text-align: center; border-bottom: 1px solid var(--glass-border); }
        .comparison-table th { background: rgba(0,0,0,0.4); color: #38bdf8; font-weight: bold; font-size: 1.1rem; }
        .comparison-table th:first-child { text-align: right; border-radius: 0 15px 0 0; color: #cbd5e1; }
        .comparison-table th:last-child { border-radius: 15px 0 0 0; color: var(--gold); }
        .comparison-table td:first-child { text-align: right; font-weight: bold; color: #f8fafc; }
        .check { color: var(--success); font-weight: bold; font-size: 1.2rem; }
        .cross { color: var(--danger); opacity: 0.5; font-weight: bold; font-size: 1.2rem; }

        .faq-section { margin-bottom: 60px; }
        .faq-section h2 { text-align: center; color: #fff; font-size: 2rem; margin-bottom: 40px; }
        .faq-item { background: var(--navy-card); border: 1px solid var(--glass-border); margin-bottom: 15px; border-radius: 15px; overflow: hidden; backdrop-filter: blur(10px); }
        .faq-item details { padding: 20px; }
        .faq-item summary { font-weight: bold; color: #38bdf8; font-size: 1.1rem; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; color: #64748b; font-size: 1.5rem; transition: 0.3s; }
        .faq-item details[open] summary::after { content: '-'; color: var(--gold); transform: rotate(180deg); }
        .faq-item p { margin: 15px 0 0 0; color: #cbd5e1; line-height: 1.7; font-size: 0.95rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: center; align-items: center; }
        .checkout-modal { background: #0f172a; width: 90%; max-width: 450px; border-radius: 24px; border: 1px solid #38bdf8; box-shadow: 0 20px 50px rgba(0,0,0,0.8); padding: 30px; position: relative; animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .checkout-modal h2 { color: #fff; margin-top: 0; text-align: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 15px; }
        .form-group { margin-bottom: 20px; text-align: right; }
        .form-group label { display: block; color: #94a3b8; font-size: 0.9rem; margin-bottom: 8px; font-weight: bold; }
        .form-group input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white; font-family: 'Cairo'; outline: none; box-sizing: border-box; text-align: right; }
        .form-group input:focus { border-color: #38bdf8; background: rgba(255,255,255,0.1); }
        
        .payment-methods { display: flex; gap: 10px; margin-bottom: 25px; }
        .pay-method { flex: 1; padding: 15px 10px; text-align: center; border-radius: 12px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s; font-weight: bold; color: #cbd5e1; }
        .pay-method.active { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; color: #38bdf8; }
        .pay-method.disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-confirm { width: 100%; padding: 15px; background: linear-gradient(90deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: bold; cursor: pointer; font-family: 'Cairo'; transition: 0.3s; box-shadow: 0 10px 20px rgba(16,185,129,0.3); }
        .btn-confirm:hover { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(16,185,129,0.5); }
        .btn-confirm:disabled { background: #64748b; cursor: not-allowed; transform: none; box-shadow: none; }
        .close-modal { position: absolute; top: 15px; right: 20px; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }

        .ai-widget-btn { position: fixed; bottom: 30px; left: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, #38bdf8, #8b5cf6); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.8rem; cursor: pointer; box-shadow: 0 10px 25px rgba(56,189,248,0.5); z-index: 1000; animation: floatBot 3s ease-in-out infinite; border: 2px solid rgba(255,255,255,0.2); }
        @keyframes floatBot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        
        .ai-chat-window { position: fixed; bottom: 100px; left: 30px; width: 320px; background: var(--navy-card); border: 1px solid #38bdf8; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); z-index: 1000; backdrop-filter: blur(15px); overflow: hidden; animation: slideUp 0.3s ease-out; }
        .ai-header { background: rgba(56, 189, 248, 0.1); padding: 15px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; }
        .ai-header h4 { margin: 0; color: #38bdf8; font-size: 1rem; display: flex; align-items: center; gap: 8px; }
        .ai-messages { padding: 15px; height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth; }
        .msg-bot { background: rgba(255,255,255,0.05); padding: 10px 15px; border-radius: 15px 15px 0 15px; color: #e2e8f0; font-size: 0.9rem; align-self: flex-start; max-width: 85%; border: 1px solid var(--glass-border); }
        .msg-user { background: rgba(56, 189, 248, 0.2); padding: 10px 15px; border-radius: 15px 15px 15px 0; color: #fff; font-size: 0.9rem; align-self: flex-end; max-width: 85%; border: 1px solid #38bdf8; }
        
        .ai-options { padding: 10px 15px 15px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--glass-border); }
        .ai-option-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: #38bdf8; padding: 8px; border-radius: 8px; font-family: 'Cairo'; cursor: pointer; transition: 0.2s; font-size: 0.85rem; text-align: right; }
        .ai-option-btn:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; }

        @media (max-width: 900px) {
            .pricing-cards { grid-template-columns: 1fr; }
            .pro-card { transform: none; }
            .sub-header h1 { font-size: 2rem; }
        }
      `}</style>

      <div className="subscription-container">
        <div className="sub-header">
          <div className="badge-new">الإصدار الهندسي v2.0 🚀</div>
          <h1>حوّل مكتبك الهندسي إلى قوة تكنولوجية 📐</h1>
          <p>استثمر في واجهتك المهنية. انضم إلى نخبة المعماريين في المغرب الذين يستخدمون الواقع المعزز لرفع قيمة مشاريعهم وتوفير وقتهم.</p>
          
          <div className="social-proof">
            <span><span className="pulse-dot"></span> أكثر من <b>200 مكتب دراسات</b> يثقون في منصتنا اليوم.</span>
          </div>
        </div>

        <div className="billing-toggle-container">
          <div className="save-badge">🎁 وفّر 30% مع خطة الدفع السنوي + شهرين مجانا</div>
          <div className="toggle-wrapper">
            <span className={`toggle-label ${!isAnnual ? 'active' : ''}`} onClick={() => handleToggleBilling(false)}>دفع شهري</span>
            <label className="switch">
              <input type="checkbox" checked={isAnnual} onChange={(e) => handleToggleBilling(e.target.checked)} />
              <span className="slider"></span>
            </label>
            <span className={`toggle-label ${isAnnual ? 'active' : ''}`} onClick={() => handleToggleBilling(true)}>دفع سنوي</span>
          </div>
        </div>

        <div className="pricing-cards">
          
          {/* Basic Card */}
          <div className="card basic-card">
            <div className="card-header">
              <div className="tier-icon icon-basic">🌱</div>
              <h3>الباقة الأساسية</h3>
              <div className="price">
                <span className="currency">د.م</span>
                <span className="amount">{priceBasic}</span>
                <span className="period">/ شهر</span>
              </div>
            </div>
            <ul className="features-list">
              <li>✔️ 3 ورشات عمل نشطة شهرياً</li>
              <li>✔️ الغرفة التفاعلية الميدانية (AR)</li>
              <li>✔️ رفع مخطط واحد لكل ورشة</li>
              <li className={currentPlan === 'basic' ? 'disabled' : ''}>
                {currentPlan === 'basic' ? '🔒 أدوات المسطرة والقياس' : '✔️ أدوات المسطرة والقياس'}
              </li>
              <li className={currentPlan === 'basic' ? 'disabled' : ''}>
                {currentPlan === 'basic' ? '🔒 تقارير PDF بختم GPS' : '✔️ تقارير PDF بختم GPS'}
              </li>
              <li className={currentPlan === 'basic' ? 'disabled' : ''}>
                {currentPlan === 'basic' ? '🔒 الذكاء الاصطناعي (AI Render)' : '✔️ الذكاء الاصطناعي (AI Render)'}
              </li>
            </ul>
            <button 
              className="sub-btn basic-btn" 
              onClick={() => openCheckout('basic', 'الباقة الأساسية 🌱', 139)}
              style={currentPlan === 'basic' ? { background: '#10b981', color: '#fff', border: 'none' } : {}}
            >
              {currentPlan === 'basic' ? '✅ الباقة مفعلة الآن' : 'اختر الباقة'}
            </button>
          </div>

          {/* Pro Card */}
          <div className="card pro-card">
            <div className="popular-ribbon">الأكثر طلباً 🔥</div>
            <div className="card-header">
              <div className="tier-icon icon-pro">🔥</div>
              <h3>باقة المحترفين (Pro)</h3>
              <div className="price">
                <span className="currency">د.م</span>
                <span className="amount">{pricePro}</span>
                <span className="period">/ شهر</span>
              </div>
            </div>
            <ul className="features-list">
              <li>✔️ ورشات عمل <b>غير محدودة</b></li>
              <li>✔️ ميزة الطبقات الشفافة (Layers)</li>
              <li>✔️ <b>تفعيل المسطرة والقياس الدقيق</b></li>
              <li>✔️ <b>تقارير PDF بختم GPS الرسمي</b></li>
              <li className="has-tooltip">🧠 <b>5 رندر ذكاء اصطناعي/شهر</b>
                <div className="tooltip-box">
                  <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="AI Preview" />
                  <span>أبهر عملاءك بصور واقعية لغرفهم من خلال رفع مخططاتهم!</span>
                </div>
              </li>
              <li>✔️ 5 جيجابايت تخزين سحابي</li>
              <li className={currentPlan === 'vip' ? '' : 'disabled'}>
                {currentPlan === 'vip' ? '✨ شعار مكتبك (Whitelabel)' : '🔒 شعار مكتبك (Whitelabel)'}
              </li>
            </ul>
            <button 
              className="sub-btn pro-btn" 
              onClick={() => openCheckout('pro', 'باقة المحترفين 🔥', 349)}
              style={currentPlan === 'pro' ? { background: '#10b981', color: '#fff', border: 'none', boxShadow: 'none' } : {}}
            >
              {currentPlan === 'pro' ? '✅ الباقة مفعلة الآن' : 'اشترك كـ محترف'}
            </button>
          </div>

          {/* VIP Card */}
          <div className="card vip-card">
            <div className="card-header">
              <div className="tier-icon icon-vip">👑</div>
              <h3>النخبة (Elite VIP)</h3>
              <div className="price">
                <span className="currency">د.م</span>
                <span className="amount">{priceVip}</span>
                <span className="period">/ شهر</span>
              </div>
            </div>
            <ul className="features-list">
              <li>✔️ كل مميزات باقة المحترفين</li>
              <li className="has-tooltip">✨ <b style={{color:'var(--gold)'}}>ذكاء اصطناعي (لا محدود)</b>
                <div className="tooltip-box" style={{borderColor:'var(--gold)'}}>
                  <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="VIP AI" style={{border:'1px solid var(--gold)'}} />
                  <span style={{color:'var(--gold)', fontWeight:'bold', display:'block', marginBottom:'5px'}}>بلا قيود!</span>
                  <span>أنشئ تصاميم لا نهائية من الاقتراحات الواقعية لعملائك.</span>
                </div>
              </li>
              <li>✨ <b>تسجيل الجلسات (فيديو MP4)</b></li>
              <li>✨ <b style={{color:'var(--gold)'}}>شعار مكتبك على التقارير (Whitelabel)</b></li>
              <li>✨ مدير حساب شخصي للدعم</li>
            </ul>
            <button 
              className="sub-btn vip-btn" 
              onClick={() => openCheckout('vip', 'النخبة (Elite VIP) 👑', 699)}
              style={currentPlan === 'vip' ? { background: '#10b981', color: '#fff', border: 'none' } : {}}
            >
              {currentPlan === 'vip' ? '✅ الباقة مفعلة الآن' : 'انضم للنخبة الآن'}
            </button>
          </div>

        </div>

        <div className="whitelabel-section">
          <div className="wl-text">
            <h2>وثّق عملك بعلامتك التجارية الخاصة 🏢</h2>
            <p>حصرياً في باقة <b>النخبة (Elite)</b>: لن يرى عميلك شعار منصة SouqBTP بعد الآن. ستصدر جميع التقارير الهندسية، محاضر الزيارات، وإثباتات الـ GPS حاملة لـ <b>شعار مكتبك الهندسي واسمك</b> كعلامة مائية (Whitelabel). اجعل تقاريرك تبدو مصممة بأنظمة مكتبك الداخلية وكلف بمشاريعك باحترافية مطلقة.</p>
          </div>
          <div className="wl-image">
            <div style={{background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'right', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transform: 'rotate(3deg)'}}>
              <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #1e293b', paddingBottom:'10px', marginBottom:'10px'}}>
                <div style={{width: '50px', height: '50px', background: '#cbd5e1', borderRadius: '5px', display: 'flex', alignItems:'center', justifyContent:'center', color:'#0f172a', fontWeight:'bold', fontSize:'0.7rem'}}>Your Logo</div>
                <div style={{textAlign:'left'}}>
                  <div style={{width:'100px', height:'10px', background:'#e2e8f0', marginBottom:'5px'}}></div>
                  <div style={{width:'60px', height:'10px', background:'#e2e8f0'}}></div>
                </div>
              </div>
              <div style={{width:'100%', height:'150px', background:'#f1f5f9', border:'1px dashed #cbd5e1', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>[صورة الورشة مع المطابقة]</div>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div style={{width:'40%', height:'10px', background:'#e2e8f0'}}></div>
                <div style={{fontWeight:'bold', color:'#1e293b', fontSize:'0.8rem'}}>ختم المهندس: ✔️</div>
              </div>
            </div>
          </div>
        </div>

        <div className="comparison-section">
          <h2>مقارنة الميزات بالتفصيل</h2>
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>الميزة الهندسية</th>
                  <th>الأساسية 🌱</th>
                  <th>المحترف (Pro) 🔥</th>
                  <th>النخبة (VIP) 👑</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>إدارة الورشات</td>
                  <td>3 شهرياً</td>
                  <td>غير محدود</td>
                  <td>غير محدود</td>
                </tr>
                <tr>
                  <td>الغرفة الميدانية (AR)</td>
                  <td><span className="check">✔</span></td>
                  <td><span className="check">✔</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>أداة المسطرة والقياس</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>تقارير PDF بختم (GPS)</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>الذكاء الاصطناعي (AI)</td>
                  <td><span className="cross">✖</span></td>
                  <td>محدود (5 مرات)</td>
                  <td><span className="check">✔ لا محدود</span></td>
                </tr>
                <tr>
                  <td>تسجيل الجلسة (فيديو MP4)</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
                <tr>
                  <td>العلامة التجارية الشخصية (Whitelabel)</td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="cross">✖</span></td>
                  <td><span className="check">✔</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="faq-section">
          <h2>الأسئلة الشائعة حول الاشتراكات</h2>
          <div className="faq-item">
            <details>
              <summary>هل يمكنني إلغاء الاشتراك أو تغيير الباقة لاحقاً؟</summary>
              <p>بالتأكيد! المنصة لا تلزمك بعقود احتكارية. يمكنك الترقية، التخفيض، أو إيقاف اشتراكك في أي وقت مباشرة من إعدادات حسابك. عند الإلغاء، ستستمر في الاستفادة من الميزات حتى نهاية دورتك المدفوعة.</p>
            </details>
          </div>
          <div className="faq-item">
            <details>
              <summary>كيف تعمل ميزة "المصادقة القانونية بختم GPS"؟</summary>
              <p>في باقات (Pro و Elite)، يقوم التطبيق بتسجيل إحداثيات الموقع الدقيقة (Latitude/Longitude) وتوقيت الزيارة، ويقوم بتشفيرها وطباعتها على التقرير الهندسي (PDF) المدمج مع اللقطة الحية، مما يمنح التقرير حجية وإثباتاً لزيارة الموقع.</p>
            </details>
          </div>
          <div className="faq-item">
            <details>
              <summary>ما هو الـ AI Render وكيف سيفيدني كمهندس؟</summary>
              <p>هي أداة مدمجة بالغرفة الحية. تخيل أن تصور صالوناً غير مكتمل بالآجور، وتقوم المنصة في ثوانٍ بتحويله لصورة واقعية (3D Render) تظهر للعميل كيف سيبدو بعد التبليط والصباغة والفرش، مما يسهل إقناع العميل بقراراتك الهندسية!</p>
            </details>
          </div>
        </div>

      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedPlan && (
        <div className="modal-overlay">
          <div className="checkout-modal">
            <button className="close-modal" onClick={() => setIsCheckoutOpen(false)}>✖</button>
            <h2>تأكيد الاشتراك</h2>
            
            <p style={{color:'#94a3b8', textAlign:'center', fontSize:'0.9rem', marginBottom:'25px'}}>
              المبلغ الإجمالي للاقتطاع: <b style={{color:'#38bdf8', fontSize:'1.2rem'}}>{selectedPlan.price}</b> د.م / <span>{isAnnual ? 'سنوياً' : 'شهرياً'}</span>
            </p>

            <div className="payment-methods">
              <div className="pay-method active">🏦 تحويل بنكي</div>
              <div className="pay-method disabled" title="سيتم تفعيل بوابة الدفع الإلكتروني قريباً">💳 البطاقة (Utajir) <br/><small>قريباً</small></div>
            </div>

            <div className="form-group">
              <label>اسم المكتب الهندسي / الشركة</label>
              <input type="text" placeholder="مثال: Bureau d'Architecture Al Omran" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>رقم التعريف الموحد ICE (للفوترة - اختياري)</label>
              <input type="text" placeholder="000000000000000" value={agencyICE} onChange={(e) => setAgencyICE(e.target.value)} />
            </div>

            <button className="btn-confirm" disabled={isProcessing} onClick={processInstantUpgrade}>
              {isProcessing ? '⏳ جاري التفعيل السحري...' : '✅ تأكيد ودفع الاشتراك'}
            </button>
            <p style={{textAlign:'center', fontSize:'0.8rem', color:'#64748b', marginTop:'15px'}}>🔒 بياناتك مشفرة ومحمية بالكامل.</p>
          </div>
        </div>
      )}

      {/* AI Assistant Widget */}
      <div className="ai-widget-btn" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>

      {isChatOpen && (
        <div className="ai-chat-window">
          <div className="ai-header">
            <h4>🤖 مدير الحسابات الذكي</h4>
            <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer'}}>✖</button>
          </div>
          <div className="ai-messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === 'bot' ? 'msg-bot' : 'msg-user'}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="ai-options" style={{opacity: messages.some(m => m.isTyping) ? 0.5 : 1, pointerEvents: messages.some(m => m.isTyping) ? 'none' : 'auto'}}>
            <button className="ai-option-btn" onClick={() => sendAiQuestion(1, 'هل تقارير الـ GPS معترف بها قانونياً؟')}>❓ هل تقارير الـ GPS معترف بها قانونياً؟</button>
            <button className="ai-option-btn" onClick={() => sendAiQuestion(2, 'كيف تتم الترقية وتفعيل الميزات؟')}>❓ كيف تتم الترقية وتفعيل الميزات؟</button>
            <button className="ai-option-btn" onClick={() => sendAiQuestion(3, 'هل يمكنني إلغاء الاشتراك لاحقاً؟')}>❓ هل أستطيع الإلغاء متى شئت؟</button>
          </div>
        </div>
      )}

    </div>
  );
}