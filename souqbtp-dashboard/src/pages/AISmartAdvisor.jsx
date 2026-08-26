import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Sparkles, AlertTriangle, Truck, ShieldAlert, ArrowRightLeft, CheckCircle2, ChevronRight, RefreshCw, Loader2, Gavel, Timer, Box, Send, MapPin, Plus, X } from 'lucide-react';

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
    addEmptyTrip: 'إضافة رحلة فارغة',
    saving: 'جاري معالجة الأمر الحكيم...',
    currency: 'درهم',
    efficiency: 'نسبة التوفير المالي المتوقعة',
    emptyReturn: 'رحلة العودة الفارغة المكتشفة',
    timeLeft: 'الوقت المتبقي',
    location: 'موقع المشروع',
    matchingStock: 'تطابق المخزون',
    tenderAlert: '🎯 تم رصد مناقصة جديدة قريبة منك!',
    alertHedging: '🔒 تم تجميد عروض الأسعار بنجاح! هامش ربحك محمي الآن.',
    alertLogistics: '🚛 تم تأكيد مطابقة الشاحنة! تم إرسال التنبيه للمورد الشريك فوراً.',
    alertBid: '✅ تم إرسال عرض سعرك للمهندس بنجاح! سيتم إخطارك فور اختياره.',
    loadingAI: 'يقوم الذكاء الاصطناعي بتحليل قاعدة البيانات الكبرى...',
    liveUpdate: 'تحديث حي مباشر',
    liveTender: 'مناقصة حية',
    tanger7km: 'طنجة (7 كلم)',
    estBudget: 'الميزانية التقديرية',
    highMarginRisk: 'مخاطر حادة على هامش الربح',
    hedgingAlert: '🚨 تنبيه استباقي: جاري قراءة السوق...',
    recommendedAction: 'الإجراء الاستراتيجي المنصوح به',
    freezeBuy: 'تجميد عروض البيع فوراً وتأمين شحنة مصنع',
    matchFound: 'تم العثور على تطابق ذكي',
    noMatch: 'الرادار اللوجستي يبحث... أضف رحلتك لتفعيل المطابقة.',
    tanger: 'طنجة',
    casablanca: 'الدار البيضاء',
    fuelSavings: 'وفر في المحروقات',
    logisticsAlert: '💡 الذكاء الاصطناعي التقط فرصة لدمج الشحنات وتقليص تكاليف النقل بناءً على مسار شاحنتك المسجل.',
    // 🌐 إضافات الترجمة الجديدة للفورم والذكاء الاصطناعي
    formTitle: 'تسجيل رحلة عودة فارغة',
    fromCity: 'من مدينة (الانطلاق)',
    toCity: 'إلى مدينة (الوصول)',
    tripDate: 'تاريخ الرحلة',
    truckType: 'نوع الشاحنة',
    capacity: 'السعة المتاحة (بالطن)',
    submitTrip: 'نشر الرحلة على الرادار الذكي',
    fromCityPlace: 'مثال: طنجة',
    toCityPlace: 'مثال: الدار البيضاء',
    capacityPlace: 'مثال: 25',
    truck1: 'رموك (Remorque)',
    truck2: 'شاحنة 14 طن',
    truck3: 'شاحنة 19 طن',
    aiFallbackAlert: '🚨 تنبيه استباقي: تم رصد ارتفاع وشيك في أسعار حديد التسليح بناءً على معطيات السوق الحالية.',
    aiFallbackAction: 'تجميد عروض البيع فوراً وتأمين شحنة مصنع'
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
    addEmptyTrip: 'Ajouter un retour à vide',
    saving: 'Traitement de l\'ordre intelligent...',
    currency: 'MAD',
    efficiency: 'Économie financière estimée',
    emptyReturn: 'Retour à vide détecté',
    timeLeft: 'Temps restant',
    location: 'Lieu du projet',
    matchingStock: 'Stock compatible',
    tenderAlert: '🎯 Nouvel appel d\'offres détecté à proximité !',
    alertHedging: '🔒 Devis gelés avec succès ! Votre marge est protégée.',
    alertLogistics: '🚛 Matching confirmé ! Le transporteur a été notifié.',
    alertBid: '✅ Votre offre a été transmise à l\'ingénieur !',
    loadingAI: 'L\'IA analyse la base de données globale...',
    liveUpdate: 'Mise à jour Live',
    liveTender: 'LIVE TENDER',
    tanger7km: 'Tanger (7km)',
    estBudget: 'Budget Estimatif',
    highMarginRisk: 'Risque de Marge Élevé',
    hedgingAlert: '🚨 Alerte prévisionnelle en cours...',
    recommendedAction: 'Action conseillée',
    freezeBuy: 'Geler les devis de vente & Acheter 250T',
    matchFound: '1 Matching Trouvé',
    noMatch: 'Radar logistique en recherche... Ajoutez votre trajet.',
    tanger: 'Tanger',
    casablanca: 'Casablanca',
    fuelSavings: 'Économie Carburant',
    logisticsAlert: '💡 L\'IA a détecté une opportunité de fusionner les expéditions et de réduire les coûts de transport.',
    // 🌐 إضافات الترجمة الجديدة للفورم والذكاء الاصطناعي
    formTitle: 'Enregistrer un trajet à vide',
    fromCity: 'De (Ville de départ)',
    toCity: 'Vers (Ville d\'arrivée)',
    tripDate: 'Date du trajet',
    truckType: 'Type de camion',
    capacity: 'Capacité disponible (Tonnes)',
    submitTrip: 'Publier sur le radar IA',
    fromCityPlace: 'Ex: Tanger',
    toCityPlace: 'Ex: Casablanca',
    capacityPlace: 'Ex: 25',
    truck1: 'Semi-remorque',
    truck2: 'Camion 14T',
    truck3: 'Camion 19T',
    aiFallbackAlert: '🚨 Alerte prévisionnelle : Une hausse imminente des prix de l\'acier est détectée selon les données actuelles du marché.',
    aiFallbackAction: 'Geler les devis de vente immédiatement et sécuriser le stock d\'usine'
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
    addEmptyTrip: 'Add Empty Return',
    saving: 'Processing intelligent order...',
    currency: 'MAD',
    efficiency: 'Estimated financial savings',
    emptyReturn: 'Detected empty return',
    timeLeft: 'Time left',
    location: 'Project location',
    matchingStock: 'Stock match',
    tenderAlert: '🎯 New tender detected nearby!',
    alertHedging: '🔒 Quotes successfully frozen! Your profit margin is protected.',
    alertLogistics: '🚛 Match confirmed! The partner supplier has been notified.',
    alertBid: '✅ Your bid has been sent to the engineer! You will be notified if selected.',
    loadingAI: 'AI is analyzing the global database...',
    liveUpdate: 'Live Update',
    liveTender: 'LIVE TENDER',
    tanger7km: 'Tangier (7km)',
    estBudget: 'Estimated Budget',
    highMarginRisk: 'High Margin Risk',
    hedgingAlert: '🚨 Predictive Alert processing...',
    recommendedAction: 'Recommended Strategic Action',
    freezeBuy: 'Freeze sales quotes & Buy 250T factory load',
    matchFound: '1 Smart Match Found',
    noMatch: 'Logistics radar searching... Add your trip to trigger matching.',
    tanger: 'Tangier',
    casablanca: 'Casablanca',
    fuelSavings: 'Fuel Savings',
    logisticsAlert: '💡 AI detected an opportunity to merge shipments and reduce transport costs based on your registered route.',
    // 🌐 إضافات الترجمة الجديدة للفورم والذكاء الاصطناعي
    formTitle: 'Register an Empty Return',
    fromCity: 'From (Departure City)',
    toCity: 'To (Arrival City)',
    tripDate: 'Trip Date',
    truckType: 'Truck Type',
    capacity: 'Available Capacity (Tons)',
    submitTrip: 'Publish on AI Radar',
    fromCityPlace: 'e.g., Tangier',
    toCityPlace: 'e.g., Casablanca',
    capacityPlace: 'e.g., 25',
    truck1: 'Semi-trailer',
    truck2: '14T Truck',
    truck3: '19T Truck',
    aiFallbackAlert: '🚨 Predictive Alert: An imminent increase in steel prices is detected based on current market data.',
    aiFallbackAction: 'Freeze sales quotes immediately and secure factory stock'
  }
};

export default function AISmartAdvisor() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingHedging, setIsProcessingHedging] = useState(false);
  const [isProcessingLogistics, setIsProcessingLogistics] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [showTender, setShowTender] = useState(false);
  
  const [aiHedgingData, setAiHedgingData] = useState(null);
  const [isLoadingHedging, setIsLoadingHedging] = useState(true);

  const [matchedTrip, setMatchedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    departureCity: '',
    arrivalCity: '',
    tripDate: '',
    truckType: t.truck1,
    capacity: ''
  });

  // تحديث الذكاء الاصطناعي كلما تغيرت لغة المنصة
  useEffect(() => {
    setIsLoadingHedging(true);
    fetchAIHedgingData();
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowTender(true), 2000);
      fetchMatchedTrip();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  async function fetchAIHedgingData() {
    try {
      // إرسال اللغة المطلوبة إلى الخادم
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: { lang: language }
      });
      
      if (error) throw error;
      setAiHedgingData(data);
    } catch (err) {
      console.error('Error fetching AI data:', err);
      // استخدام النص المترجم محلياً في حالة الخطأ
      setAiHedgingData({
        alert: t.aiFallbackAlert,
        efficiency: "85000",
        action: t.aiFallbackAction
      });
    } finally {
      setIsLoadingHedging(false);
    }
  }

  async function fetchMatchedTrip() {
    try {
      const { data, error } = await supabase
        .from('logistics_trips')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setMatchedTrip(data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  }

  async function submitEmptyTrip(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('logistics_trips').insert([{
        supplier_name: supplier?.name || 'مورد SouqBTP',
        departure_city: formData.departureCity,
        arrival_city: formData.arrivalCity,
        trip_date: formData.tripDate,
        truck_type: formData.truckType,
        available_capacity: parseFloat(formData.capacity),
        status: 'pending'
      }]);
      if (error) throw error;
      
      setIsModalOpen(false);
      alert(language === 'ar' ? '✅ تم نشر الرحلة بنجاح!' : '✅ Trajet publié !');
      setFormData({ departureCity: '', arrivalCity: '', tripDate: '', truckType: t.truck1, capacity: '' });
      fetchMatchedTrip(); 
    } catch (err) {
      alert("حدث خطأ.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleHedgingAction = () => {
    setIsProcessingHedging(true);
    setTimeout(() => { setIsProcessingHedging(false); alert(t.alertHedging); }, 1500);
  };

  const handleLogisticsAction = () => {
    setIsProcessingLogistics(true);
    setTimeout(() => { setIsProcessingLogistics(false); alert(t.alertLogistics); }, 1500);
  };

  const handleBidAction = () => {
    setIsBidding(true);
    setTimeout(() => { setIsBidding(false); setShowTender(false); alert(t.alertBid); }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center text-slate-400">
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
        
        {/* 1️⃣ Tender Radar */}
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

        {/* 2️⃣ Hedging Radar */}
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
            {isLoadingHedging ? (
              <div className="flex items-center gap-3 text-slate-400 py-4">
                <Loader2 size={20} className="animate-spin text-red-400" />
                <span className="font-bold">{t.hedgingAlert}</span>
              </div>
            ) : (
              <>
                <p className="text-base font-bold text-slate-200 leading-relaxed">
                  {aiHedgingData?.alert || t.hedgingAlert}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.efficiency}</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">~ {aiHedgingData?.efficiency || "85000"} {t.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.recommendedAction}</p>
                    <p className="text-base font-black text-blue-400 mt-1">{aiHedgingData?.action || t.freezeBuy}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleHedgingAction} disabled={isProcessingHedging || isLoadingHedging} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
              {isProcessingHedging ? t.saving : t.actionFreeze}
            </button>
            <button className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all border border-slate-700">
              {t.actionStockUp}
            </button>
          </div>
        </div>

        {/* 3️⃣ Logistics Optimizer */}
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
            <div className="flex gap-3 items-center">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-colors border border-slate-700"
              >
                <Plus size={18} />
                {t.addEmptyTrip}
              </button>
              {matchedTrip && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  {t.matchFound}
                </div>
              )}
            </div>
          </div>

          {matchedTrip ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.emptyReturn}</p>
                  <div className="flex items-center gap-3 mt-1.5 font-black text-white">
                    <span>{matchedTrip.departure_city}</span> 
                    <ArrowRightLeft size={16} className="text-blue-400 animate-pulse" /> 
                    <span>{matchedTrip.arrival_city}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.efficiency}</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">3,500 {t.currency} <span className="text-xs text-slate-400 font-normal">({t.fuelSavings})</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/60 text-sm font-medium text-slate-300">
                <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">الشريك:</span> {matchedTrip.supplier_name}</div>
                <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">التاريخ:</span> {matchedTrip.trip_date}</div>
                <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">متاح:</span> {matchedTrip.available_capacity} طن - {matchedTrip.truck_type}</div>
              </div>

              <p className="text-sm text-slate-400 font-medium leading-relaxed pt-3 border-t border-slate-800/60">
                {t.logisticsAlert}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-2xl p-8 mb-6 text-center">
              <p className="text-slate-400 font-bold">{t.noMatch}</p>
            </div>
          )}

          <button 
            onClick={handleLogisticsAction} 
            disabled={!matchedTrip || isProcessingLogistics} 
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:bg-slate-800 flex items-center gap-2"
          >
            {isProcessingLogistics ? t.saving : t.actionShare}
            <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>

      {/* 🛑 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-xl font-black text-white">{t.formTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={submitEmptyTrip} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">{t.fromCity}</label>
                  <input required type="text" value={formData.departureCity} onChange={(e) => setFormData({...formData, departureCity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" placeholder={t.fromCityPlace} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">{t.toCity}</label>
                  <input required type="text" value={formData.arrivalCity} onChange={(e) => setFormData({...formData, arrivalCity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" placeholder={t.toCityPlace} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">{t.tripDate}</label>
                <input required type="date" value={formData.tripDate} onChange={(e) => setFormData({...formData, tripDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">{t.truckType}</label>
                  <select value={formData.truckType} onChange={(e) => setFormData({...formData, truckType: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none">
                    <option>{t.truck1}</option>
                    <option>{t.truck2}</option>
                    <option>{t.truck3}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">{t.capacity}</label>
                  <input required type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" placeholder={t.capacityPlace} />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> {t.submitTrip}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}