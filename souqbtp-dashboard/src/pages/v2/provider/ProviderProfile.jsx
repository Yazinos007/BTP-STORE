import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { 
  User, Eye, Save, Star, MapPin, Phone, CheckCircle2, AlertCircle, 
  Info, Briefcase, FileText, Clock, X, ShieldCheck, HardHat, Image 
} from 'lucide-react';

const translations = {
  ar: {
    pageTitle: "ملفي الشخصي وإعدادات العرض",
    previewBtn: "معاينة ملفي العام",
    basicInfoTitle: "معلومات الحساب الأساسية",
    fullName: "الاسم الكامل",
    city: "المدينة",
    phone: "رقم الهاتف",
    rating: "التقييم العام",
    ratingNote: "(مرتبط بآراء العملاء)",
    readonlyNote: "* لتعديل هذه البيانات، يرجى التواصل مع إدارة الموقع.",
    publicSettingsTitle: "إعدادات الملف العام (للزوار)",
    bioLabel: "1. نبذة عنك وعن خدماتك",
    bioPlace: "تحدث عن نفسك، متى بدأت، وما الذي يميز عملك...",
    expLabel: "2. الخبرة والمجالات الدقيقة",
    expPlace: "مثال: خبرة 10 سنوات، متخصص في الفيلات الفاخرة...",
    termsLabel: "3. الشروط وطريقة العمل",
    termsPlace: "مثال: الدفع على 3 مراحل، المعاينة مجانية داخل المدينة...",
    quickLabel: "4. معلومات سريعة",
    quickPlace: "مثال: متاح من 8 لـ 6 مساءً، أقبل الدفع كاش أو تحويل...",
    saveBtn: "حفظ وتحديث ملفي العام",
    savingBtn: "جاري الحفظ...",
    successMsg: "تم الحفظ بنجاح! تم تحديث بياناتك وستظهر الآن في ملفك العام للزوار.",
    errorMsg: "حدث خطأ أثناء حفظ البيانات.",
    // نصوص نافذة معاينة الملف العام
    previewModalBadge: "معاينة حية لملفك كما يراه الزبناء",
    verifiedArtisan: "حرفي معتمد في منصة SasBTP",
    emptySection: "لم تتم إضافة معلومات في هذا القسم بعد.",
    viewPortfolioBtn: "عرض معرض أعمالي (Portfolio)",
    closePreviewBtn: "إغلاق المعاينة"
  },
  fr: {
    pageTitle: "Mon Profil et Paramètres d'Affichage",
    previewBtn: "Aperçu du profil public",
    basicInfoTitle: "Informations de Base du Compte",
    fullName: "Nom Complet",
    city: "Ville",
    phone: "Numéro de Téléphone",
    rating: "Évaluation Globale",
    ratingNote: "(Liée aux avis clients)",
    readonlyNote: "* Pour modifier ces données, veuillez contacter l'administration.",
    publicSettingsTitle: "Paramètres du Profil Public",
    bioLabel: "1. À propos de vous et de vos services",
    bioPlace: "Parlez de vous, quand avez-vous commencé, qu'est-ce qui vous distingue...",
    expLabel: "2. Expérience et Spécialités",
    expPlace: "Ex : 10 ans d'expérience, spécialiste des villas de luxe...",
    termsLabel: "3. Conditions et Méthode de travail",
    termsPlace: "Ex : Paiement en 3 tranches, devis gratuit en ville...",
    quickLabel: "4. Informations Rapides",
    quickPlace: "Ex : Disponible de 8h à 18h, accepte espèces ou virement...",
    saveBtn: "Enregistrer et mettre à jour",
    savingBtn: "Enregistrement...",
    successMsg: "Enregistré avec succès ! Vos données sont maintenant visibles par les visiteurs.",
    errorMsg: "Une erreur est survenue lors de l'enregistrement.",
    // نصوص نافذة معاينة الملف العام
    previewModalBadge: "Aperçu en direct de votre profil public",
    verifiedArtisan: "Artisan Vérifié SasBTP",
    emptySection: "Aucune information renseignée pour le moment.",
    viewPortfolioBtn: "Voir Mon Portfolio",
    closePreviewBtn: "Fermer l'aperçu"
  },
  en: {
    pageTitle: "My Profile and Display Settings",
    previewBtn: "Preview Public Profile",
    basicInfoTitle: "Basic Account Information",
    fullName: "Full Name",
    city: "City",
    phone: "Phone Number",
    rating: "Overall Rating",
    ratingNote: "(Linked to customer reviews)",
    readonlyNote: "* To modify this data, please contact site administration.",
    publicSettingsTitle: "Public Profile Settings",
    bioLabel: "1. About you and your services",
    bioPlace: "Talk about yourself, when you started, what makes you unique...",
    expLabel: "2. Experience and Specialties",
    expPlace: "E.g., 10 years experience, specializing in luxury villas...",
    termsLabel: "3. Terms and Work Method",
    termsPlace: "E.g., Payment in 3 stages, free inspection within the city...",
    quickLabel: "4. Quick Info",
    quickPlace: "E.g., Available 8 AM - 6 PM, accept cash or transfer...",
    saveBtn: "Save and Update Public Profile",
    savingBtn: "Saving...",
    successMsg: "Saved successfully! Your data is updated and visible on your public profile.",
    errorMsg: "An error occurred while saving.",
    // نصوص نافذة معاينة الملف العام
    previewModalBadge: "Live Preview of Your Public Profile",
    verifiedArtisan: "Verified SasBTP Artisan",
    emptySection: "No information provided in this section yet.",
    viewPortfolioBtn: "View My Portfolio",
    closePreviewBtn: "Close Preview"
  }
};

export default function ProviderProfile() {
  const { language = 'ar' } = useSettingsStore();
  const navigate = useNavigate();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [providerId, setProviderId] = useState(null);
  const [basicInfo, setBasicInfo] = useState({ full_name: '', city: '', phone: '', rating: 0, specialty: '' });
  const [formData, setFormData] = useState({ bio_text: '', experience_text: '', terms_text: '', quick_info: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ show: false, type: '', text: '' });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // جلب البيانات من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchProviderData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProviderId(data.id);
        setBasicInfo({
          full_name: data.full_name || user.user_metadata?.full_name || 'SasBTP Artisan',
          city: data.city || 'غير محددة',
          phone: data.phone || '',
          rating: data.rating || 0,
          specialty: data.specialty || data.category || ''
        });
        setFormData({
          bio_text: data.bio_text || '',
          experience_text: data.experience_text || '',
          terms_text: data.terms_text || '',
          quick_info: data.quick_info || ''
        });
      }
    };

    fetchProviderData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!providerId) return;

    setIsSaving(true);
    setAlertMsg({ show: false, type: '', text: '' });

    try {
      const { error } = await supabase
        .from('providers')
        .update({
          bio_text: formData.bio_text.trim(),
          experience_text: formData.experience_text.trim(),
          terms_text: formData.terms_text.trim(),
          quick_info: formData.quick_info.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId);

      if (error) throw error;

      setAlertMsg({ show: true, type: 'success', text: t.successMsg });
    } catch (err) {
      setAlertMsg({ show: true, type: 'error', text: t.errorMsg });
    } finally {
      setIsSaving(false);
      setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 5000);
    }
  };

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
          onClick={() => setShowPreviewModal(true)}
          className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
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

      {/* 📦 الحاوية الرئيسية للبطاقتين (تخطيط الشبكة) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* 📌 البطاقة الأولى: إعدادات الملف العام (قابلة للتعديل) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 order-2 lg:order-1">
          <h3 className="text-xl font-black text-blue-900 mb-6 border-b-2 border-indigo-100 pb-3 flex items-center gap-2">
            ✍️ {t.publicSettingsTitle}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" /> {t.bioLabel}
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
                <Briefcase className="w-4 h-4 text-slate-400" /> {t.expLabel}
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
                <FileText className="w-4 h-4 text-slate-400" /> {t.termsLabel}
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
                <Clock className="w-4 h-4 text-slate-400" /> {t.quickLabel}
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
          </form>
        </div>

        {/* ========================================================= */}
        {/* 🔒 البطاقة الثانية: معلومات الحساب الأساسية (للقراءة فقط) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 order-1 lg:order-2">
          <h3 className="text-lg font-black text-slate-600 mb-6 border-b-2 border-slate-100 pb-3 flex items-center gap-2">
            📌 {t.basicInfoTitle}
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block font-bold text-slate-500 text-sm mb-1">{t.fullName}</label>
              <div className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                {basicInfo.full_name}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-500 text-sm mb-1">{t.city}</label>
              <div className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                {basicInfo.city}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-500 text-sm mb-1">{t.phone}</label>
              <div className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold flex items-center gap-3" dir="ltr">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="flex-1 text-right">{basicInfo.phone}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-500 text-sm mb-1">{t.rating}</label>
              <div className="w-full p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                <Star className="w-6 h-6 text-orange-500 fill-current" />
                <span className="text-xl font-black text-orange-600">{Number(basicInfo.rating).toFixed(1)}</span>
                <span className="text-xs text-orange-800 font-medium">{t.ratingNote}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-6 text-center leading-relaxed">
            {t.readonlyNote}
          </p>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 👁️ نافذة معاينة الملف العام للحرفي (تعمل داخل فضاء الحرفي مباشرة) */}
      {/* ========================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl my-8 animate-fade-in">
            
            {/* شريط علوي للمعاينة */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 px-6 py-5 text-white relative">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-black/25 px-3 py-1 rounded-full border border-white/20">
                  <Eye className="w-3.5 h-3.5" />
                  {t.previewModalBadge}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pt-2">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
                  <div className="w-20 h-20 rounded-2xl bg-white text-orange-600 font-black text-3xl flex items-center justify-center shadow-lg border-4 border-white/30 shrink-0">
                    {basicInfo.full_name ? basicInfo.full_name.charAt(0).toUpperCase() : <HardHat className="w-10 h-10" />}
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h2 className="text-2xl font-black text-white">{basicInfo.full_name || 'SasBTP Artisan'}</h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t.verifiedArtisan}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm font-bold text-orange-50">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {basicInfo.city}
                      </span>
                      {basicInfo.phone && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <Phone className="w-4 h-4" /> {basicInfo.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0">
                  <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
                  <span className="text-2xl font-black text-white">{Number(basicInfo.rating).toFixed(1)}</span>
                  <span className="text-xs text-orange-100 font-bold">/ 5.0</span>
                </div>
              </div>
            </div>

            {/* محتوى الملف العام */}
            <div className="p-6 md:p-8 space-y-5 max-h-[65vh] overflow-y-auto bg-slate-50/60">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-black text-blue-900 text-sm mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-orange-500" /> {t.bioLabel}
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {formData.bio_text ? formData.bio_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-black text-blue-900 text-sm mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-500" /> {t.expLabel}
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {formData.experience_text ? formData.experience_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-black text-blue-900 text-sm mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" /> {t.termsLabel}
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {formData.terms_text ? formData.terms_text : <span className="text-slate-400 italic">{t.emptySection}</span>}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-black text-blue-900 text-sm mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" /> {t.quickLabel}
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {formData.quick_info ? formData.quick_info : <span className="text-slate-400 italic">{t.emptySection}</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* أزرار التحكم السفلية */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  navigate('/v2/provider-portfolio');
                }}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Image className="w-4 h-4" />
                {t.viewPortfolioBtn}
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
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