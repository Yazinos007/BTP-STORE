import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Sparkles, AlertTriangle, TrendingUp, Truck, ShieldAlert, ArrowRightLeft, CheckCircle2, ChevronRight, RefreshCw, Loader2, Gavel, Timer, Box, Send, MapPin } from 'lucide-react';

const translations = {
  ar: {
    title: 'المستشار الاستراتيجي (IA)',
    subtitle: 'محرك الذكاء الاصطناعي لتحليل الأسواق العالمية وتحسين اللوجستيك في الوقت الفعلي.',
    tenderRadar: 'رادار المناقصات الذكي (فرص حية)',
    tenderDesc: 'اقتناص طلبات كميات ضخمة من المقاولين والمهندسين في منطقتك الجغرافية تلقائياً.',
    hedgingTitle: 'رادار التنبؤ وتقلبات الأسعار الاستباقي',
    hedgingDesc: 'تحليل وتوقع أسعار المواد الخام بناءً على البورصة العالمية وحركة الشحن في البحر الأبيض المتوسط.',
    logisticsTitle: 'نظام "الرجوع عامر" للوجستيك التشاركي',
    logisticsDesc: 'تقليل مصاريف شاحناتك الفارغة عبر دمج رحلات العودة مع موردين آخرين في شبكة SouqBTP.',
    actionFreeze: 'تجميد عروض الأسعار الحالية',
    actionStockUp: 'شراء مخزون تحوطي الآن',
    actionShare: 'تأكيد مشاركة الشاحنة ومطابقة الرحلة',
    actionBid: 'تقديم عرض سعر فوري',
    saving: 'جاري معالجة الأمر الحكيم...',
    currency: 'درهم',
    efficiency: 'نسبة التوفير المالي المتوقعة',
    route: 'خط سير الرحلة المستهدف',
    emptyReturn: 'رحلة العودة الفارغة المكتشفة',
    timeLeft: 'الوقت المتبقي',
    location: 'موقع المشروع',
    matchingStock: 'تطابق المخزون',
    tenderAlert: '🎯 تم رصد مناقصة جديدة قريبة منك!',
    // 🎯 الإضافات الجديدة التي كانت مبعثرة في الكود
    alertHedging: '🔒 تم تجميد عروض الأسعار بنجاح! هامش ربحك محمي الآن.',
    alertLogistics: '🚛 تم تأكيد مطابقة الشاحنة! تم إرسال التنبيه للمورد الشريك فوراً.',
    alertBid: '✅ تم إرسال عرض سعرك للمهندس بنجاح! سيتم إخطارك فور اختياره.',
    loadingAI: 'يقوم الذكاء الاصطناعي بتحليل قاعدة البيانات الكبرى...',
    liveUpdate: 'تحديث حي مباشر',
    liveTender: 'مناقصة حية',
    tanger7km: 'طنجة (7 كلم)',
    estBudget: 'الميزانية التقديرية',
    highMarginRisk: 'مخاطر حادة على هامش الربح',
    hedgingAlert: '🚨 تنبيه استباقي: تم رصد ارتفاع وشيك بنسبة +5.4% في أسعار حديد التسليح (حديد 12 و 10) نتيجة لارتفاع تكاليف الشحن البحري في المتوسط. المصانع الوطنية ستحدث أسعار الخروج من المصنع خلال الـ 48 ساعة القادمة.',
    recommendedAction: 'الإجراء الاستراتيجي المنصوح به',
    freezeBuy: 'تجميد عروض البيع فوراً وتأمين شحنة مصنع',
    matchFound: 'تم العثور على تطابق ذكي',
    tanger: 'طنجة',
    casablanca: 'الدار البيضاء',
    fuelSavings: 'وفر في المحروقات',
    logisticsAlert: '💡 شاحنتك الكبيرة (الرموك) ستفرغ شحنة أسمنت في طنجة يوم الثلاثاء القادم ومبرمجة للعودة فارغة. التقط الذكاء الاصطناعي أن مورد آجر آخر في طنجة بحاجة لنقل شحنة إلى مستودع في المحمدية (على بعد 15 كلم من مقرك) في نفس اليوم ونفس التوقيت.'
  },
  fr: {
    title: 'Conseiller Stratégique (IA)',
    subtitle: 'Moteur IA pour l\'analyse des marchés mondiaux et l\'optimisation logistique en temps réel.',
    tenderRadar: 'Radar d\'Appels d\'Offres (Live)',
    tenderDesc: 'Capturez automatiquement les demandes de gros volumes des entrepreneurs de votre région.',
    hedgingTitle: 'Radar de Prédiction des Prix & Hedging',
    hedgingDesc: 'Analyse et prévision des prix des matières premières selon la bourse mondiale et le fret méditerranéen.',
    logisticsTitle: 'Optimiseur Logistique "Retour Chargé"',
    logisticsDesc: 'Réduisez les frais de vos camions vides en fusionnant les trajets de retour avec d\'autres fournisseurs.',
    actionFreeze: 'Geler les devis actuels',
    actionStockUp: 'Acheter un stock de couverture',
    actionShare: 'Confirmer le partage et le matching',
    actionBid: 'Soumettre une offre instantanée',
    saving: 'Traitement de l\'ordre intelligent...',
    currency: 'MAD',
    efficiency: 'Économie financière estimée',
    route: 'Itinéraire cible',
    emptyReturn: 'Retour à vide détecté',
    timeLeft: 'Temps restant',
    location: 'Lieu du projet',
    matchingStock: 'Stock compatible',
    tenderAlert: '🎯 Nouvel appel d\'offres détecté à proximité !',
    // 🎯 Textes français extraits du code
    alertHedging: '🔒 Devis gelés avec succès ! Votre marge est protégée.',
    alertLogistics: '🚛 Matching confirmé ! Le transporteur a été notifié.',
    alertBid: '✅ Votre offre a été transmise à l\'ingénieur !',
    loadingAI: 'L\'IA analyse la base de données globale...',
    liveUpdate: 'Mise à jour Live',
    liveTender: 'LIVE TENDER',
    tanger7km: 'Tanger (7km)',
    estBudget: 'Budget Estimatif',
    highMarginRisk: 'Risque de Marge Élevé',
    hedgingAlert: '🚨 Alerte prévisionnelle : Une hausse imminente de +5.4% est détectée sur l\'Acier Rond à Béton suite à l\'augmentation du fret maritime en Méditerranée. Les usines nationales comptent ajuster leurs prix d\'usine d\'ici 48 heures.',
    recommendedAction: 'Action conseillée',
    freezeBuy: 'Geler les devis de vente & Acheter 250T',
    matchFound: '1 Matching Trouvé',
    tanger: 'Tanger',
    casablanca: 'Casablanca',
    fuelSavings: 'Économie Carburant',
    logisticsAlert: '💡 Votre camion semi-remorque va livrer du ciment à Tanger mardi prochain et prévoit de retourner à vide. L\'IA a détecté qu\'un autre fournisseur de briques à Tanger doit envoyer une cargaison vers un dépôt à Mohammedia (à 15km de votre base) le même jour.'
  },
  en: {
    title: 'AI Strategic Advisor',
    subtitle: 'AI engine for global market analysis and real-time logistics optimization.',
    tenderRadar: 'Smart Tender Radar (Live)',
    tenderDesc: 'Automatically capture large volume requests from contractors and engineers in your area.',
    hedgingTitle: 'Proactive Price Prediction & Hedging Radar',
    hedgingDesc: 'Analyze and predict raw material prices based on global markets and Mediterranean shipping routes.',
    logisticsTitle: 'Shared Logistics "Loaded Return" Optimizer',
    logisticsDesc: 'Reduce empty truck expenses by merging return trips with other suppliers in the SouqBTP network.',
    actionFreeze: 'Freeze current quotes',
    actionStockUp: 'Buy hedging stock now',
    actionShare: 'Confirm truck sharing & match',
    actionBid: 'Submit instant bid',
    saving: 'Processing intelligent order...',
    currency: 'MAD',
    efficiency: 'Estimated financial savings',
    route: 'Target route',
    emptyReturn: 'Detected empty return',
    timeLeft: 'Time left',
    location: 'Project location',
    matchingStock: 'Stock match',
    tenderAlert: '🎯 New tender detected nearby!',
    // 🎯 English additions
    alertHedging: '🔒 Quotes successfully frozen! Your profit margin is protected.',
    alertLogistics: '🚛 Match confirmed! The partner supplier has been notified.',
    alertBid: '✅ Your bid has been sent to the engineer! You will be notified if selected.',
    loadingAI: 'AI is analyzing the global database...',
    liveUpdate: 'Live Update',
    liveTender: 'LIVE TENDER',
    tanger7km: 'Tangier (7km)',
    estBudget: 'Estimated Budget',
    highMarginRisk: 'High Margin Risk',
    hedgingAlert: '🚨 Predictive Alert: An imminent +5.4% increase in Rebar prices is detected due to rising Mediterranean sea freight costs. National factories plan to adjust their ex-works prices within 48 hours.',
    recommendedAction: 'Recommended Strategic Action',
    freezeBuy: 'Freeze sales quotes & Buy 250T factory load',
    matchFound: '1 Smart Match Found',
    tanger: 'Tangier',
    casablanca: 'Casablanca',
    fuelSavings: 'Fuel Savings',
    logisticsAlert: '💡 Your semi-trailer is delivering cement to Tangier next Tuesday and is scheduled to return empty. The AI detected another brick supplier in Tangier needing to send a shipment to a depot in Mohammedia (15km from your base) on the same day.'
  }
};

export default function AISmartAdvisor() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  // 🛡️ الترياق السحري موجود ويعمل بكفاءة
  const t = translations[language] || translations['fr'];

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingHedging, setIsProcessingHedging] = useState(false);
  const [isProcessingLogistics, setIsProcessingLogistics] = useState(false);
  
  const [isBidding, setIsBidding] = useState(false);
  const [showTender, setShowTender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowTender(true), 2000);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleHedgingAction = () => {
    setIsProcessingHedging(true);
    setTimeout(() => {
      setIsProcessingHedging(false);
      alert(t.alertHedging);
    }, 1500);
  };

  const handleLogisticsAction = () => {
    setIsProcessingLogistics(true);
    setTimeout(() => {
      setIsProcessingLogistics(false);
      alert(t.alertLogistics);
    }, 1500);
  };

  const handleBidAction = () => {
    setIsBidding(true);
    setTimeout(() => {
      setIsBidding(false);
      setShowTender(false);
      alert(t.alertBid);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400">
        <Loader2 size={40} className="animate-spin text-blue-500 mb-3" />
        <p className="font-bold animate-pulse">{t.loadingAI}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-start border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Sparkles className="text-blue-400 animate-pulse" size={32} />
            {t.title}
          </h2>
          <p className="text-slate-400 mt-2 font-medium">{t.subtitle}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-blue-400 font-bold text-sm">
          <RefreshCw size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
          {t.liveUpdate}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {showTender && (
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 border-2 border-indigo-500/50 p-8 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.2)] animate-slide-up">
            <div className="absolute top-0 right-0 p-4 bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-bl-2xl">
              {t.liveTender}
            </div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Gavel size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{t.tenderRadar}</h3>
                    <p className="text-indigo-300 font-bold">{t.tenderAlert}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Box size={18} className="text-slate-500" />
                      <span className="text-sm font-bold text-slate-300">50T Acier 12 | 1200 Sacs Ciment G55</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-bold">{t.matchingStock}: 100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-red-400" />
                      <span className="text-sm font-bold text-slate-300">{t.location}: {t.tanger7km}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <Timer size={18} />
                    <span className="text-sm font-black">{t.timeLeft}: 03:42:15</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-72 space-y-3">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <p className="text-xs text-slate-500 uppercase font-black mb-1">{t.estBudget}</p>
                  <p className="text-3xl font-black text-white">485,000 <span className="text-sm font-bold text-slate-400">{t.currency}</span></p>
                </div>
                <button 
                  onClick={handleBidAction} 
                  disabled={isBidding}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isBidding ? <Loader2 size={20} className="animate-spin" /> : <><Send size={20} className="group-hover:translate-x-1 transition-transform" /> {t.actionBid}</>}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{t.hedgingTitle}</h3>
                <p className="text-sm text-slate-400 mt-1 font-medium leading-relaxed">{t.hedgingDesc}</p>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2">
              <AlertTriangle size={18} />
              {t.highMarginRisk}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 space-y-4">
            <p className="text-base font-bold text-slate-200 leading-relaxed">
              {t.hedgingAlert}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.efficiency}</p>
                <p className="text-xl font-black text-emerald-400 mt-1">~ 85,000 {t.currency}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.recommendedAction}</p>
                <p className="text-base font-black text-blue-400 mt-1">{t.freezeBuy}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleHedgingAction} disabled={isProcessingHedging} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
              {isProcessingHedging ? t.saving : t.actionFreeze}
            </button>
            <button className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all border border-slate-700">
              {t.actionStockUp}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Truck size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{t.logisticsTitle}</h3>
                <p className="text-sm text-slate-400 mt-1 font-medium leading-relaxed">{t.logisticsDesc}</p>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2">
              <CheckCircle2 size={18} />
              {t.matchFound}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.emptyReturn}</p>
                <div className="flex items-center gap-3 mt-1.5 font-black text-white">
                  <span>{t.tanger}</span> 
                  <ArrowRightLeft size={16} className="text-blue-400 animate-pulse" /> 
                  <span>{t.casablanca}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.efficiency}</p>
                <p className="text-xl font-black text-emerald-400 mt-1">3,500 {t.currency} <span className="text-xs text-slate-400 font-normal">({t.fuelSavings})</span></p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 font-medium leading-relaxed pt-3 border-t border-slate-800/60">
              {t.logisticsAlert}
            </p>
          </div>

          <button onClick={handleLogisticsAction} disabled={isProcessingLogistics} className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2">
            {isProcessingLogistics ? t.saving : t.actionShare}
            <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
          </button>
        </div>

      </div>
    </div>
  );
}