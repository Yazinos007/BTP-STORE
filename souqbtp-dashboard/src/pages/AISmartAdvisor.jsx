import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Sparkles, AlertTriangle, Truck, ShieldAlert, ArrowRightLeft, CheckCircle2, ChevronRight, RefreshCw, Loader2, Gavel, Timer, Box, Send, MapPin, Plus, X, Calendar } from 'lucide-react';

const translations = {
  ar: {
    title: 'المستشار الاستراتيجي (IA)',
    subtitle: 'محرك الذكاء الاصطناعي لتحليل الأسواق العالمية وتحسين اللوجستيك في الوقت الفعلي.',
    tenderRadar: 'رادار المناقصات الذكي (فرص حية)',
    tenderAlert: '🎯 تم رصد مناقصة جديدة قريبة منك!',
    hedgingTitle: 'رادار التنبؤ وتقلبات الأسعار الاستباقي',
    hedgingDesc: 'تحليل وتوقع أسعار المواد الخام بناءً على البورصة العالمية وحركة الشحن في البحر الأبيض المتوسط.',
    logisticsTitle: 'نظام "الرجوع عامر" للوجستيك التشاركي',
    logisticsDesc: 'تقليل مصاريف شاحناتك الفارغة عبر دمج رحلات العودة مع موردين آخرين في شبكة SouqBTP.',
    actionFreeze: 'تجميد عروض الأسعار الحالية',
    actionStockUp: 'شراء مخزون تحوطي الآن',
    actionShare: 'تأكيد مشاركة الشاحنة ومطابقة الرحلة',
    addEmptyTrip: 'إضافة رحلة فارغة جديدة',
    saving: 'جاري معالجة الأمر الحكيم...',
    currency: 'درهم',
    efficiency: 'نسبة التوفير المالي المتوقعة',
    emptyReturn: 'رحلة العودة الفارغة المكتشفة',
    matchFound: 'تم العثور على تطابق ذكي',
    noMatch: 'رادار اللوجستيك يبحث عن رحلات... أضف رحلتك الآن.',
    fuelSavings: 'وفر في المحروقات',
    // نصوص الفورم (Modal)
    formTitle: 'تسجيل رحلة عودة فارغة',
    fromCity: 'من مدينة (الانطلاق)',
    toCity: 'إلى مدينة (الوصول)',
    tripDate: 'تاريخ الرحلة',
    truckType: 'نوع الشاحنة',
    capacity: 'السعة المتاحة (بالطن)',
    submitTrip: 'نشر الرحلة على الرادار الذكي',
    cancel: 'إلغاء',
    alertLogistics: '🚛 تم تأكيد مطابقة الشاحنة! تم إرسال التنبيه للمورد الشريك فوراً.',
    loadingAI: 'يقوم الذكاء الاصطناعي بتحليل قاعدة البيانات الكبرى...',
    liveUpdate: 'تحديث حي مباشر'
  },
  fr: {
    title: 'Conseiller Stratégique (IA)',
    subtitle: 'Moteur IA pour l\'analyse des marchés mondiaux et l\'optimisation logistique en temps réel.',
    tenderRadar: 'Radar d\'Appels d\'Offres (Live)',
    tenderAlert: '🎯 Nouvel appel d\'offres détecté à proximité !',
    hedgingTitle: 'Radar de Prédiction des Prix',
    hedgingDesc: 'Analyse et prévision des prix des matières premières selon la bourse mondiale.',
    logisticsTitle: 'Optimiseur Logistique "Retour Chargé"',
    logisticsDesc: 'Réduisez les frais de vos camions vides en fusionnant les trajets de retour.',
    actionFreeze: 'Geler les devis actuels',
    actionStockUp: 'Acheter un stock de couverture',
    actionShare: 'Confirmer le partage et le matching',
    addEmptyTrip: 'Ajouter un retour à vide',
    saving: 'Traitement de l\'ordre intelligent...',
    currency: 'MAD',
    efficiency: 'Économie financière estimée',
    emptyReturn: 'Retour à vide détecté',
    matchFound: '1 Matching Trouvé',
    noMatch: 'Recherche de correspondances... Ajoutez votre trajet.',
    fuelSavings: 'Économie Carburant',
    // Modal
    formTitle: 'Enregistrer un trajet à vide',
    fromCity: 'De (Ville de départ)',
    toCity: 'Vers (Ville d\'arrivée)',
    tripDate: 'Date du trajet',
    truckType: 'Type de camion',
    capacity: 'Capacité disponible (Tonnes)',
    submitTrip: 'Publier sur le radar IA',
    cancel: 'Annuler',
    alertLogistics: '🚛 Matching confirmé ! Le transporteur a été notifié.',
    loadingAI: 'L\'IA analyse la base de données globale...',
    liveUpdate: 'Mise à jour Live'
  },
  en: {
    title: 'AI Strategic Advisor',
    subtitle: 'AI engine for global market analysis and real-time logistics optimization.',
    tenderRadar: 'Smart Tender Radar (Live)',
    tenderAlert: '🎯 New tender detected nearby!',
    hedgingTitle: 'Proactive Price Prediction',
    hedgingDesc: 'Analyze and predict raw material prices based on global markets.',
    logisticsTitle: 'Shared Logistics "Loaded Return"',
    logisticsDesc: 'Reduce empty truck expenses by merging return trips with other suppliers.',
    actionFreeze: 'Freeze current quotes',
    actionStockUp: 'Buy hedging stock now',
    actionShare: 'Confirm truck sharing & match',
    addEmptyTrip: 'Add Empty Return Trip',
    saving: 'Processing intelligent order...',
    currency: 'MAD',
    efficiency: 'Estimated financial savings',
    emptyReturn: 'Detected empty return',
    matchFound: '1 Smart Match Found',
    noMatch: 'Logistics radar searching for trips... Add yours now.',
    fuelSavings: 'Fuel Savings',
    // Modal
    formTitle: 'Register an Empty Return',
    fromCity: 'From (Departure City)',
    toCity: 'To (Arrival City)',
    tripDate: 'Trip Date',
    truckType: 'Truck Type',
    capacity: 'Available Capacity (Tons)',
    submitTrip: 'Publish on AI Radar',
    cancel: 'Cancel',
    alertLogistics: '🚛 Match confirmed! The partner supplier has been notified.',
    loadingAI: 'AI is analyzing the global database...',
    liveUpdate: 'Live Update'
  }
};

export default function AISmartAdvisor() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['ar'];

  const [isLoading, setIsLoading] = useState(true);
  
  // 🚚 حالات (States) اللوجستيك
  const [matchedTrip, setMatchedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    departureCity: '',
    arrivalCity: '',
    tripDate: '',
    truckType: 'رموك (Remorque)',
    capacity: ''
  });

  useEffect(() => {
    // محاكاة تحميل الذكاء الاصطناعي ثم جلب بيانات اللوجستيك الحقيقية
    setTimeout(() => {
      setIsLoading(false);
      fetchMatchedTrip();
    }, 1500);
  }, []);

  // 1. دالة جلب الرحلات المتطابقة من Supabase
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

  // 2. دالة إرسال رحلة جديدة إلى قاعدة البيانات
  async function submitEmptyTrip(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('logistics_trips').insert([
        {
          supplier_name: supplier?.name || 'مورد SouqBTP',
          departure_city: formData.departureCity,
          arrival_city: formData.arrivalCity,
          trip_date: formData.tripDate,
          truck_type: formData.truckType,
          available_capacity: parseFloat(formData.capacity),
          status: 'pending'
        }
      ]);

      if (error) throw error;
      
      setIsModalOpen(false);
      alert(language === 'ar' ? '✅ تم نشر الرحلة بنجاح على رادار SouqBTP!' : '✅ Trajet publié avec succès !');
      setFormData({ departureCity: '', arrivalCity: '', tripDate: '', truckType: 'رموك (Remorque)', capacity: '' });
      fetchMatchedTrip(); // تحديث الرادار فوراً
      
    } catch (err) {
      alert("حدث خطأ أثناء الإضافة.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

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
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-800 pb-6 gap-4">
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

      {/* 🚀 قسم اللوجستيك التشاركي (الرجوع عامر) */}
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
          <div className="flex gap-3">
            {/* زر إضافة الرحلة */}
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
          <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-6 mb-6 space-y-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.emptyReturn}</p>
                <div className="flex items-center gap-3 mt-2 font-black text-white text-xl">
                  <span className="text-emerald-400">{matchedTrip.departure_city}</span> 
                  <ArrowRightLeft size={20} className="text-slate-500 animate-pulse" /> 
                  <span className="text-emerald-400">{matchedTrip.arrival_city}</span>
                </div>
              </div>
              <div className="text-end">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.efficiency}</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">~ 3,500 {t.currency} <span className="text-xs text-slate-400 font-normal">({t.fuelSavings})</span></p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/60 text-sm font-medium text-slate-300">
              <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">الشريك:</span> {matchedTrip.supplier_name}</div>
              <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">التاريخ:</span> {matchedTrip.trip_date}</div>
              <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">متاح:</span> {matchedTrip.available_capacity} طن - {matchedTrip.truck_type}</div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-2xl p-8 mb-6 text-center">
            <p className="text-slate-400 font-bold">{t.noMatch}</p>
          </div>
        )}

        <button 
          onClick={() => alert(t.alertLogistics)} 
          disabled={!matchedTrip} 
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:bg-slate-800 flex items-center gap-2"
        >
          {t.actionShare}
          <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* 🛑 نافذة منبثقة (Modal) لإضافة الرحلة */}
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
                  <input required type="text" value={formData.departureCity} onChange={(e) => setFormData({...formData, departureCity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" placeholder={language === 'en' ? "e.g., Tangier" : "مثال: طنجة"} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">{t.toCity}</label>
                  <input required type="text" value={formData.arrivalCity} onChange={(e) => setFormData({...formData, arrivalCity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" placeholder={language === 'en' ? "e.g., Casablanca" : "مثال: الدار البيضاء"} />
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
                    <option>رموك (Remorque)</option>
                    <option>شاحنة 14 طن</option>
                    <option>شاحنة 19 طن</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">{t.capacity}</label>
                  <input required type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" placeholder="مثال: 25" />
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