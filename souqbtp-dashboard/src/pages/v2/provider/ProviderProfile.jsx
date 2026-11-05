import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { 
  User, Eye, Save, Star, MapPin, Phone, CheckCircle2, AlertCircle, 
  Info, Briefcase, FileText, Clock, X, ShieldCheck, HardHat, Image,
  MessageCircle, Award, Check, Sparkles, Calendar
} from 'lucide-react';

const MOROCCAN_CITIES = [
  "الدار البيضاء - Casablanca",
  "الرباط - Rabat",
  "مراكش - Marrakech",
  "طنجة - Tanger",
  "فاس - Fès",
  "أكادير - Agadir",
  "مكناس - Meknès",
  "وجدة - Oujda",
  "القنيطرة - Kénitra",
  "تطوان - Tétouan",
  "بني ملال - Béni Mellal",
  "قصبة تادلة - Kasbah Tadla",
  "خنيفرة - Khénifra",
  "خريبكة - Khouribga",
  "المحمدية - Mohammedia",
  "الجديدة - El Jadida",
  "آسفي - Safi",
  "الناظور - Nador",
  "العيون - Laâyoune",
  "ورزازات - Ouarzazate"
];

const translations = {
  ar: {
    pageTitle: "ملفي الشخصي وإعدادات العرض",
    previewBtn: "معاينة صفحة الزبون (Vitrine)",
    basicInfoTitle: "معلومات الحساب الأساسية (قابلة للتعديل)",
    fullName: "الاسم الكامل أو اسم الورشة",
    fullNamePlace: "أدخل اسمك الكامل أو اسم ورشتك...",
    city: "المدينة",
    cityPlace: "اختر أو اكتب اسم مدينتك...",
    phone: "رقم الهاتف / واتساب",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "التقييم العام",
    ratingNote: "(يُحتسب تلقائياً من آراء الزبناء)",
    readonlyNote: "* يمكنك تعديل اسمك، مدينتك، ورقم هاتفك في أي وقت ثم الضغط على زر الحفظ.",
    publicSettingsTitle: "تفاصيل العرض للزبناء",
    bioLabel: "1. نبذة عنك وعن خدماتك",
    bioPlace: "تحدث عن نفسك، متى بدأت، وما الذي يميز عملك...",
    expLabel: "2. الخبرة والمجالات الدقيقة",
    expPlace: "مثال: خبرة 10 سنوات، متخصص في الفيلات الفاخرة...",
    termsLabel: "3. الشروط وطريقة العمل",
    termsPlace: "مثال: الدفع على 3 مراحل، المعاينة مجانية داخل المدينة...",
    quickLabel: "4. أوقات العمل ومعلومات سريعة",
    quickPlace: "مثال: متاح من 8 لـ 6 مساءً، أقبل الدفع كاش أو تحويل...",
    saveBtn: "حفظ جميع التعديلات وتحديث ملفي",
    savingBtn: "جاري الحفظ...",
    successMsg: "تم الحفظ بنجاح! تم تحديث بياناتك الأساسية وملفك العام للزوار.",
    errorMsg: "حدث خطأ أثناء حفظ البيانات.",
    // نصوص واجهة الزبون (Vitrine)
    previewModalBadge: "صفحتك التسويقية كما يراها الزبناء في المنصة",
    verifiedArtisan: "حرفي موثق SasBTP",
    unspecifiedCity: "المغرب (مدينة غير محددة)",
    tabOverview: "بطاقة الحرفي والخدمات",
    tabPortfolio: "معرض الأعمال",
    tabReviews: "آراء الزبناء",
    aboutSectionTitle: "نبذة تعريفية عن الحرفي",
    expSectionTitle: "الخبرة والتخصصات الميدانية",
    termsSectionTitle: "شروط العمل والضمانات",
    quickSectionTitle: "التوافر ومعلومات التواصل",
    emptySection: "لم يقم الحرفي بإضافة تفاصيل في هذا القسم بعد.",
    emptyPortfolio: "لا توجد صور أعمال مضافة في المعرض حالياً.",
    emptyReviews: "لا توجد تقييمات من الزبناء حتى الآن.",
    callBtn: "اتصال مباشر",
    whatsappBtn: "مراسلة واتساب",
    managePortfolioBtn: "إدارة معرض أعمالي",
    closePreviewBtn: "إغلاق المعاينة"
  },
  fr: {
    pageTitle: "Mon Profil et Paramètres d'Affichage",
    previewBtn: "Aperçu Vitrine Client",
    basicInfoTitle: "Informations de Base (Modifiables)",
    fullName: "Nom Complet / Nom d'Atelier",
    fullNamePlace: "Entrez votre nom complet ou nom d'atelier...",
    city: "Ville d'activité",
    cityPlace: "Sélectionnez ou tapez votre ville...",
    phone: "Numéro de Téléphone / WhatsApp",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "Évaluation Globale",
    ratingNote: "(Calculée automatiquement selon les avis)",
    readonlyNote: "* Vous pouvez modifier votre nom, votre ville et votre téléphone à tout moment puis enregistrer.",
    publicSettingsTitle: "Détails de Présentation Publique",
    bioLabel: "1. À propos de vous et de vos services",
    bioPlace: "Parlez de vous, quand avez-vous commencé, qu'est-ce qui vous distingue...",
    expLabel: "2. Expérience et Spécialités",
    expPlace: "Ex : 10 ans d'expérience, spécialiste des villas de luxe...",
    termsLabel: "3. Conditions et Méthode de travail",
    termsPlace: "Ex : Paiement en 3 tranches, devis gratuit en ville...",
    quickLabel: "4. Horaires et Informations Rapides",
    quickPlace: "Ex : Disponible de 8h à 18h, accepte espèces ou virement...",
    saveBtn: "Enregistrer toutes les modifications",
    savingBtn: "Enregistrement...",
    successMsg: "Enregistré avec succès ! Vos informations de base et votre vitrine publique ont été mises à jour.",
    errorMsg: "Une erreur est survenue lors de l'enregistrement.",
    // نصوص واجهة الزبون (Vitrine)
    previewModalBadge: "Votre Vitrine Publique telle que vue par les clients",
    verifiedArtisan: "Artisan Vérifié SasBTP",
    unspecifiedCity: "Maroc (Ville non spécifiée)",
    tabOverview: "Présentation & Compétences",
    tabPortfolio: "Portfolio & Réalisations",
    tabReviews: "Avis Clients",
    aboutSectionTitle: "Présentation de l'Artisan",
    expSectionTitle: "Expérience & Domaines d'Expertise",
    termsSectionTitle: "Conditions d'Intervention & Garanties",
    quickSectionTitle: "Disponibilité & Infos Pratiques",
    emptySection: "Aucune information renseignée dans cette rubrique pour le moment.",
    emptyPortfolio: "Aucune photo de réalisation dans le portfolio pour le moment.",
    emptyReviews: "Aucun avis client enregistré pour le moment.",
    callBtn: "Appeler",
    whatsappBtn: "WhatsApp",
    managePortfolioBtn: "Gérer Mon Portfolio",
    closePreviewBtn: "Fermer la vitrine"
  },
  en: {
    pageTitle: "My Profile and Display Settings",
    previewBtn: "Client Showcase Preview",
    basicInfoTitle: "Basic Account Info (Editable)",
    fullName: "Full Name / Workshop Name",
    fullNamePlace: "Enter your full name or workshop name...",
    city: "City",
    cityPlace: "Select or type your city...",
    phone: "Phone / WhatsApp Number",
    phonePlace: "06XXXXXXXX / 07XXXXXXXX",
    rating: "Overall Rating",
    ratingNote: "(Automatically linked to client reviews)",
    readonlyNote: "* You can update your name, city, and phone number anytime and click save.",
    publicSettingsTitle: "Public Showcase Details",
    bioLabel: "1. About you and your services",
    bioPlace: "Talk about yourself, when you started, what makes you unique...",
    expLabel: "2. Experience and Specialties",
    expPlace: "E.g., 10 years experience, specializing in luxury villas...",
    termsLabel: "3. Terms and Work Method",
    termsPlace: "E.g., Payment in 3 stages, free inspection within the city...",
    quickLabel: "4. Working Hours & Quick Info",
    quickPlace: "E.g., Available 8 AM - 6 PM, accept cash or transfer...",
    saveBtn: "Save All Changes",
    savingBtn: "Saving...",
    successMsg: "Saved successfully! Your basic info and public profile are now updated.",
    errorMsg: "An error occurred while saving.",
    // نصوص واجهة الزبون (Vitrine)
    previewModalBadge: "Your Public Showcase as seen by clients",
    verifiedArtisan: "Verified SasBTP Artisan",
    unspecifiedCity: "Morocco (City not specified)",
    tabOverview: "Overview & Skills",
    tabPortfolio: "Portfolio",
    tabReviews: "Client Reviews",
    aboutSectionTitle: "About the Artisan",
    expSectionTitle: "Experience & Core Specialties",
    termsSectionTitle: "Work Terms & Guarantees",
    quickSectionTitle: "Availability & Quick Facts",
    emptySection: "No details added to this section yet.",
    emptyPortfolio: "No portfolio projects uploaded yet.",
    emptyReviews: "No client reviews yet.",
    callBtn: "Call Now",
    whatsappBtn: "WhatsApp",
    managePortfolioBtn: "Manage My Portfolio",
    closePreviewBtn: "Close Preview"
  }
};

export default function ProviderProfile() {
  const { language = 'ar' } = useSettingsStore();
  const navigate = useNavigate();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [userId, setUserId] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [basicInfo, setBasicInfo] = useState({ full_name: '', city: '', phone: '', rating: 0 });
  const [formData, setFormData] = useState({ bio_text: '', experience_text: '', terms_text: '', quick_info: '' });
  
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [activePreviewTab, setActivePreviewTab] = useState('overview');

  const [isSaving, setIsSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ show: false, type: '', text: '' });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // جلب البيانات من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchProviderData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProviderId(data.id);
        const cleanCity = (!data.city || data.city === 'غير محددة') ? '' : data.city;
        setBasicInfo({
          full_name: data.full_name || user.user_metadata?.full_name || '',
          city: cleanCity,
          phone: data.phone || user.user_metadata?.phone || '',
          rating: data.rating || 0
        });
        setFormData({
          bio_text: data.bio_text || '',
          experience_text: data.experience_text || '',
          terms_text: data.terms_text || '',
          quick_info: data.quick_info || ''
        });
      } else {
        setBasicInfo({
          full_name: user.user_metadata?.full_name || user.user_metadata?.company_name || '',
          city: user.user_metadata?.city || '',
          phone: user.user_metadata?.phone || '',
          rating: 0
        });
      }

      // جلب معرض الأعمال والتقييمات لعرضها في نافذة Vitrine الحقيقية
      try {
        const [portRes, revRes] = await Promise.all([
          supabase.from('provider_portfolio').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
          supabase.from('provider_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6)
        ]);
        if (portRes.data) setPortfolioItems(portRes.data);
        if (revRes.data) setReviewsList(revRes.data);
      } catch (e) {
        // الجداول الفرعية اختيارية
      }
    };

    fetchProviderData();
  }, []);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setAlertMsg({ show: false, type: '', text: '' });

    const payload = {
      full_name: basicInfo.full_name.trim(),
      city: basicInfo.city.trim() || 'غير محددة',
      phone: basicInfo.phone.trim(),
      bio_text: formData.bio_text.trim(),
      experience_text: formData.experience_text.trim(),
      terms_text: formData.terms_text.trim(),
      quick_info: formData.quick_info.trim(),
      updated_at: new Date().toISOString()
    };

    try {
      if (providerId) {
        const { error } = await supabase
          .from('providers')
          .update(payload)
          .eq('id', providerId);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from('providers')
          .insert([{ ...payload, user_id: userId, account_type: 'marketplace' }])
          .select('id')
          .single();
        if (error) throw error;
        if (inserted?.id) setProviderId(inserted.id);
      }

      // مزامنة الاسم والهاتف والمدينة في بيانات حساب المستخدم أيضاً
      await supabase.auth.updateUser({
        data: {
          full_name: payload.full_name,
          phone: payload.phone,
          city: payload.city
        }
      }).catch(() => {});

      setAlertMsg({ show: true, type: 'success', text: t.successMsg });
    } catch (err) {
      console.error('Save provider profile error:', err);
      setAlertMsg({ show: true, type: 'error', text: t.errorMsg });
    } finally {
      setIsSaving(false);
      setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 5000);
    }
  };

  const displayCity = basicInfo.city && basicInfo.city !== 'غير محددة' ? basicInfo.city : t.unspecifiedCity;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🌟 الترويسة العلوية */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
          <User className="text-blue-600 w-7 h-7" />
          {t.pageTitle}
        </h1>
        <button 
          type="button"
          onClick={() => {
            setActivePreviewTab('overview');
            setShowPreviewModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          {t.previewBtn}
        </button>
      </div>

      {/* ⚠️ تنبيهات الحفظ */}
      {alertMsg.show && (
        <div className={`p-5 rounded-xl mb-6 flex items-start gap-3 border ${alertMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />}
          <div>
            <strong className="block text-base mb-1">{alertMsg.type === 'success' ? '✅ ' + t.successMsg.split('!')[0] + '!' : '❌ خطأ'}</strong>
            <span className="text-sm opacity-90">{alertMsg.type === 'success' ? t.successMsg.split('!')[1] : alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* 📦 نموذج موحد يحفظ البطاقتين معاً */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* 📌 البطاقة الأولى: إعدادات الملف العام (قابلة للتعديل) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 order-2 lg:order-1 space-y-6">
          <h3 className="text-xl font-black text-blue-900 mb-2 border-b-2 border-indigo-100 pb-3 flex items-center gap-2">
            ✍️ {t.publicSettingsTitle}
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-500" /> {t.bioLabel}
            </label>
            <textarea 
              name="bio_text"
              rows="4" 
              value={formData.bio_text}
              onChange={handleChange}
              placeholder={t.bioPlace}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-y text-sm font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-500" /> {t.expLabel}
            </label>
            <textarea 
              name="experience_text"
              rows="3" 
              value={formData.experience_text}
              onChange={handleChange}
              placeholder={t.expPlace}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-y text-sm font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" /> {t.termsLabel}
            </label>
            <textarea 
              name="terms_text"
              rows="3" 
              value={formData.terms_text}
              onChange={handleChange}
              placeholder={t.termsPlace}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-y text-sm font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> {t.quickLabel}
            </label>
            <textarea 
              name="quick_info"
              rows="3" 
              value={formData.quick_info}
              onChange={handleChange}
              placeholder={t.quickPlace}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-y text-sm font-medium text-slate-700"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-lg shadow-[0_4px_15px_rgba(234,88,12,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            <Save className="w-5 h-5" />
            {isSaving ? t.savingBtn : t.saveBtn}
          </button>
        </div>

        {/* ========================================================= */}
        {/* 🔓 البطاقة الثانية: معلومات الحساب الأساسية (أصبحت قابلة للتعديل!) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 order-1 lg:order-2">
          <h3 className="text-lg font-black text-blue-900 mb-6 border-b-2 border-slate-100 pb-3 flex items-center gap-2">
            📌 {t.basicInfoTitle}
          </h3>
          
          <div className="space-y-5">
            {/* تعديل الاسم الكامل */}
            <div>
              <label className="block font-bold text-slate-700 text-sm mb-1.5">{t.fullName}</label>
              <div className="relative flex items-center">
                <User className={`w-4 h-4 text-blue-600 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none`} />
                <input
                  type="text"
                  name="full_name"
                  value={basicInfo.full_name}
                  onChange={handleBasicChange}
                  placeholder={t.fullNamePlace}
                  className={`w-full py-3.5 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all`}
                />
              </div>
            </div>

            {/* تعديل أو اختيار المدينة */}
            <div>
              <label className="block font-bold text-slate-700 text-sm mb-1.5">{t.city}</label>
              <div className="relative flex items-center">
                <MapPin className={`w-4 h-4 text-orange-500 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none`} />
                <input
                  type="text"
                  name="city"
                  list="moroccan-cities-list"
                  value={basicInfo.city}
                  onChange={handleBasicChange}
                  placeholder={t.cityPlace}
                  className={`w-full py-3.5 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all`}
                />
                <datalist id="moroccan-cities-list">
                  {MOROCCAN_CITIES.map((c, idx) => (
                    <option key={idx} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* تعديل رقم الهاتف */}
            <div>
              <label className="block font-bold text-slate-700 text-sm mb-1.5">{t.phone}</label>
              <div className="relative flex items-center" dir="ltr">
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  value={basicInfo.phone}
                  onChange={handleBasicChange}
                  placeholder={t.phonePlace}
                  className="w-full py-3.5 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-right focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* التقييم العام (للقراءة فقط لأنه مرتبط بآراء الزبناء) */}
            <div>
              <label className="block font-bold text-slate-500 text-sm mb-1.5">{t.rating}</label>
              <div className="w-full p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                <Star className="w-6 h-6 text-orange-500 fill-current" />
                <span className="text-xl font-black text-orange-600">{Number(basicInfo.rating).toFixed(1)}</span>
                <span className="text-xs text-orange-800 font-bold">{t.ratingNote}</span>
              </div>
            </div>

            {/* زر حفظ سريع في بطاقة المعلومات الأساسية أيضاً */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-md transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isSaving ? t.savingBtn : t.saveBtn}
            </button>
          </div>

          <p className="text-xs text-slate-500 font-semibold mt-4 text-center leading-relaxed">
            {t.readonlyNote}
          </p>
        </div>

      </form>

      {/* ========================================================= */}
      {/* 🌟 واجهة الزبون الحقيقية (Vitrine Client Publique) */}
      {/* ========================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl my-auto animate-fade-in text-white">
            
            {/* 1. غلاف بطاقة الحرفي الاحترافية (Hero Vitrine) */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 border-b border-slate-800 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-2 mb-6">
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.previewModalBadge}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-4xl flex items-center justify-center shadow-xl border-2 border-white/20 shrink-0">
                    {basicInfo.full_name ? basicInfo.full_name.charAt(0).toUpperCase() : <HardHat className="w-12 h-12" />}
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        {basicInfo.full_name || 'SasBTP Artisan'}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <ShieldCheck className="w-4 h-4" />
                        {t.verifiedArtisan}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm font-bold text-slate-300">
                      <span className="inline-flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
                        <MapPin className="w-4 h-4 text-orange-400" /> {displayCity}
                      </span>
                      {basicInfo.phone && (
                        <span className="inline-flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700" dir="ltr">
                          <Phone className="w-4 h-4 text-emerald-400" /> {basicInfo.phone}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/30">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {Number(basicInfo.rating).toFixed(1)} / 5.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* أزرار تفاعل الزبون */}
                {basicInfo.phone && (
                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href={`tel:${basicInfo.phone}`}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      {t.callBtn}
                    </a>
                    <a
                      href={`https://wa.me/${basicInfo.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t.whatsappBtn}
                    </a>
                  </div>
                )}
              </div>

              {/* 2. شريط تبويبات صفحة الزبون */}
              <div className="relative z-10 flex items-center gap-2 mt-7 pt-4 border-t border-slate-800/80 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('overview')}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activePreviewTab === 'overview'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {t.tabOverview}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('portfolio')}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activePreviewTab === 'portfolio'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  {t.tabPortfolio} ({portfolioItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('reviews')}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activePreviewTab === 'reviews'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  {t.tabReviews} ({reviewsList.length})
                </button>
              </div>
            </div>

            {/* 3. محتوى التبويب المختار */}
            <div className="p-6 md:p-8 max-h-[55vh] overflow-y-auto bg-slate-900 space-y-5">
              {activePreviewTab === 'overview' && (
                <>
                  {/* بطاقة النبذة والخبرة بتصميم واجهة الزبون */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
                      <h4 className="font-black text-amber-400 text-sm mb-2.5 flex items-center gap-2">
                        <User className="w-4 h-4" /> {t.aboutSectionTitle}
                      </h4>
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {formData.bio_text ? formData.bio_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
                      <h4 className="font-black text-blue-400 text-sm mb-2.5 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> {t.expSectionTitle}
                      </h4>
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {formData.experience_text ? formData.experience_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
                      <h4 className="font-black text-emerald-400 text-sm mb-2.5 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> {t.termsSectionTitle}
                      </h4>
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {formData.terms_text ? formData.terms_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                      </p>
                    </div>

                    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
                      <h4 className="font-black text-purple-400 text-sm mb-2.5 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {t.quickSectionTitle}
                      </h4>
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {formData.quick_info ? formData.quick_info : <span className="text-slate-400 italic">{t.emptySection}</span>}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activePreviewTab === 'portfolio' && (
                <div>
                  {portfolioItems.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                      <Image className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-300 font-bold text-sm">{t.emptyPortfolio}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {portfolioItems.map((item) => (
                        <div key={item.id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 group">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.title || 'Project'} className="w-full h-40 object-cover" />
                          )}
                          <div className="p-3.5">
                            <h5 className="font-black text-white text-sm truncate">{item.title || 'مشروع منجز'}</h5>
                            {item.description && (
                              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activePreviewTab === 'reviews' && (
                <div>
                  {reviewsList.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                      <Star className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-300 font-bold text-sm">{t.emptyReviews}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviewsList.map((rev) => (
                        <div key={rev.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-white text-sm">{rev.client_name || 'زبون المنصة'}</span>
                            <span className="flex items-center gap-1 text-amber-400 font-black text-xs">
                              <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating || 5}/5
                            </span>
                          </div>
                          <p className="text-slate-200 text-xs leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. شريط الأزرار السفلي */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  navigate('/v2/provider-portfolio');
                }}
                className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Image className="w-4 h-4" />
                {t.managePortfolioBtn}
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-black text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                {t.closePreviewBtn}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}