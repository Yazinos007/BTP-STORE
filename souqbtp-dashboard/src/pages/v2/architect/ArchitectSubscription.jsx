import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../supabaseClient'; // Adjust import path as needed
import { useArchitectStore } from '../stores/useArchitectStore'; // Adjust import path
import { useSettingsStore } from '../stores/useSettingsStore';   // Adjust import path

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

  // Global Store Integrations
  const { currentArchitect, updateArchitect, fetchArchitect } = useArchitectStore();
  const { language = 'ar' } = useSettingsStore();
  const t = translations[language] || translations.ar;

  // State Management
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNotification, setStatusNotification] = useState({ type: '', message: '' });

  // Accordion State for FAQs
  const [openFaq, setOpenFaq] = useState(null);

  // AI Chat Widget States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: isRtl ? 'مرحباً! كيف يمكنني مساعدتك في اختيار الخطة المناسبة اليوم؟' : 'Hello! How can I assist you in choosing the right plan today?' }
  ]);

  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);
  const currentPlanId = currentArchitect?.subscription_plan || 'basic';

  useEffect(() => {
    if (chatBottomRef.current && isChatOpen) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Open Checkout Modal
  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  // Process Upgrade / Supabase Update
  const processInstantUpgrade = async () => {
    if (!selectedPlan || !currentArchitect?.id) return;
    setIsProcessing(true);
    try {

      // Direct Supabase call or store method
      const { error } = await supabase
        .from('architects')
        .update({
          subscription_plan: selectedPlan.id,
          billing_cycle: billingCycle,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentArchitect.id);
      if (error) throw error;

      // Local State Refresh
      if (fetchArchitect) {
        await fetchArchitect(currentArchitect.id);
      } else if (updateArchitect) {
        updateArchitect({ subscription_plan: selectedPlan.id, billing_cycle: billingCycle });
      }

      // Success FX (Confetti)
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {

        // Fallback if confetti library fails
      }
      setStatusNotification({ type: 'success', message: t.successMsg });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Upgrade Error:', err);
      setStatusNotification({ type: 'error', message: t.errorMsg });
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Chat Handling
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setTimeout(() => {
      let botResponse = isRtl 
        ? "بناءً على طلبك، نوصي بخطة Pro للحصول على أفضل توازن بين السعر والميزات المعمارية." 
        : "Based on your query, we recommend the Pro plan for optimal architectural features.";

      if (userText.toLowerCase().includes('whitelabel') || userText.includes('هوية')) {
        botResponse = isRtl
          ? "خدمة Whitelabel تتيح لك تخصيص المنصة برابطك الخاص وإزالة جميع حقوق المنصة."
          : "The Whitelabel option allows full domain customization and complete platform white-labeling.";
      }
      setChatMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    }, 800);
  };

  return (
    <div className={`min-h-screen bg-[#0B1120] text-slate-100 p-4 md:p-8 font-sans ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Top Banner / Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 mb-4">
          {t.pageTitle}
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          {t.pageSubtitle}
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-cyan-400' : 'text-slate-400'}`}>
            {t.monthly}
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-8 bg-slate-800 rounded-full p-1 border border-slate-700 relative transition-colors duration-300 focus:outline-none"
          >
            <div className={`w-6 h-6 bg-cyan-500 rounded-full transition-transform duration-300 transform ${billingCycle === 'annual' ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
          </button>

          <span className={`text-sm font-medium flex items-center gap-2 ${billingCycle === 'annual' ? 'text-cyan-400' : 'text-slate-400'}`}>
            {t.annual}
            <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30">
              {t.saveBadge}
            </span>
          </span>
        </div>
      </div>

      {/* Dynamic Alert Banner */}
      {statusNotification.message && (
        <div className={`max-w-7xl mx-auto mb-8 p-4 rounded-xl border flex items-center justify-between ${statusNotification.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'}`}>
          <span>{statusNotification.message}</span>

          <button onClick={() => setStatusNotification({ type: '', message: '' })} className="text-sm underline">
            {t.close}
          </button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;

          return (
            <div
              key={plan.id}
              className={`relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border ${plan.borderClass} ${plan.glowClass} p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge[language] || plan.badge.en}
                </div>

              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name[language] || plan.name.en}</h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-extrabold text-white">${price}</span>
                  <span className="text-slate-400 text-sm">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <hr className="border-slate-800 my-4" />
                <ul className="space-y-3 mb-6">
                  {(plan.features[language] || plan.features.en).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={isCurrent}
                onClick={() => handleOpenCheckout(plan)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20'
                }`}
              >
                {isCurrent ? t.activePlan : t.upgradeNow}
              </button>
            </div>
          );
        })}
      </div>

      {/* Whitelabel Solution Section */}
      <div className="max-w-7xl mx-auto mb-16 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Enterprise Add-on
          </span>

          <h2 className="text-2xl font-bold text-white">{t.whitelabelTitle}</h2>
          <p className="text-slate-400 text-sm max-w-xl">{t.whitelabelDesc}</p>
        </div>

        <button
          onClick={() => handleOpenCheckout({ id: 'whitelabel', name: { ar: 'خدمة الهوية المستقلة', fr: 'Marque Blanche', en: 'Whitelabel Addon' }, priceMonthly: 299, priceAnnual: 2990 })}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 shrink-0"
        >
          {t.whitelabelBtn}
        </button>
      </div>

      {/* Detailed Feature Comparison Table */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{t.comparisonTitle}</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300 text-xs uppercase">
                <th className="p-4">{t.feature}</th>
                <th className="p-4 text-center">{t.basicTier}</th>
                <th className="p-4 text-center">{t.proTier}</th>
                <th className="p-4 text-center">{t.vipTier}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              <tr>
                <td className="p-4 font-medium text-white">عدد المشاريع</td>
                <td className="p-4 text-center text-slate-400">5 مشاريع</td>
                <td className="p-4 text-center text-cyan-400 font-semibold">غير محدود</td>
                <td className="p-4 text-center text-amber-400 font-semibold">غير محدود</td>
              </tr>

              <tr>
                <td className="p-4 font-medium text-white">دقة التصدير (PDF/Render)</td>
                <td className="p-4 text-center text-slate-400">1080p</td>
                <td className="p-4 text-center text-cyan-400 font-semibold">4K Ultra HD</td>
                <td className="p-4 text-center text-amber-400 font-semibold">8K Raw Render</td>
              </tr>

              <tr>
                <td className="p-4 font-medium text-white">خوادم الذكاء الاصطناعي</td>
                <td className="p-4 text-center text-slate-400">مشتركة</td>
                <td className="p-4 text-center text-slate-300">فائقة السرعة</td>
                <td className="p-4 text-center text-amber-400 font-semibold">خوادم خاصة مخصصة</td>
              </tr>

              <tr>
                <td className="p-4 font-medium text-white">دعم الهوية المستقلة</td>
                <td className="p-4 text-center text-rose-500">✕</td>
                <td className="p-4 text-center text-rose-500">✕</td>
                <td className="p-4 text-center text-emerald-400">✓ متاح</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{t.faqTitle}</h2>
        <div className="space-y-4">
          {[
            {
              q: isRtl ? 'هل يمكنني إلغاء الاشتراكات في أي وقت؟' : 'Can I cancel my subscription anytime?',
              a: isRtl ? 'نعم، يمكنك إلغاء أو تغيير خطة اشتراكك في أي وقت مباشرة من لوحة التحكم.' : 'Yes, you can cancel or switch your subscription tier at any time from your settings.'
            },
            {
              q: isRtl ? 'ما هي وسائل الدفع المدعومة؟' : 'What payment options are supported?',
              a: isRtl ? 'ندعم البطاقات البنكية Visa, MasterCard, بالإضافة إلى Apple Pay و Stripe.' : 'We support major credit cards, Apple Pay, and secure Stripe checkouts.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">

              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-right flex justify-between items-center text-white font-medium hover:bg-slate-800/50 transition"
              >
                <span>{faq.q}</span>
                <span className="text-cyan-400">{openFaq === idx ? '-' : '+'}</span>
              </button>

              {openFaq === idx && (
                <div className="p-4 bg-slate-950/40 text-slate-400 text-sm border-t border-slate-800">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">{t.checkoutTitle}</h3>
            <p className="text-slate-400 text-sm mb-4">
              الخطة المختارة: <span className="text-cyan-400 font-semibold">{selectedPlan.name[language] || selectedPlan.name.en}</span>
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-6">
              <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>المبلغ الإجمالي</span>
                <span className="font-bold text-white">
                  ${billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceAnnual}
                </span>
              </div>

              <div className="text-xs text-slate-500">{t.payWithCard}</div>

            </div>

            <div className="flex gap-3">

              <button
                onClick={processInstantUpgrade}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center"
              >
                {isProcessing ? t.processing : t.confirmPayment}
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Floating Widget */}
      <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-40`}>
        {!isChatOpen ? (

          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-4 rounded-full shadow-lg shadow-cyan-500/30 flex items-center justify-center transition-transform hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

        ) : (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-80 sm:w-96 shadow-2xl flex flex-col h-[400px] overflow-hidden">

            {/* Header */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {t.chatHeader}
              </h4>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.chatPlaceholder}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition">
                {t.chatSend}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}