import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { Camera, MapPin, Calendar, Trash2, Image as ImageIcon, Plus, UploadCloud, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const translations = {
  ar: {
    pageTitle: "إدارة معرض المشاريع (Portfolio)",
    addTitle: "إضافة مشروع جديد",
    imgLabel: "صورة المشروع (إلزامي) *",
    chooseFile: "اختيار صورة",
    titleLabel: "عنوان المشروع (اختياري)",
    titlePlace: "مثال: تشطيب فيلا سكنية",
    cityLabel: "المدينة",
    cityPlace: "مثال: الدار البيضاء",
    yearLabel: "السنة",
    uploadBtn: "رفع المشروع",
    uploading: "جاري الرفع...",
    galleryTitle: "مشاريعي الحالية",
    projectCount: "مشروع",
    noProjects: "لا توجد مشاريع مضافة حتى الآن. ابدأ برفع أول مشروع لك!",
    noTitle: "بدون عنوان",
    noCity: "غير محدد",
    confirmDelete: "هل أنت متأكد من حذف هذا المشروع نهائياً؟",
    successAdd: "تم إضافة المشروع لمعرض أعمالك بنجاح!",
    successDel: "تم حذف المشروع بنجاح.",
    errorMsg: "حدث خطأ أثناء العملية. يرجى المحاولة.",
    errorFile: "يرجى اختيار صورة أولاً!"
  },
  fr: {
    pageTitle: "Gestion du Portfolio",
    addTitle: "Ajouter un nouveau projet",
    imgLabel: "Image du projet (Obligatoire) *",
    chooseFile: "Choisir une image",
    titleLabel: "Titre du projet (Optionnel)",
    titlePlace: "Ex: Finition villa de luxe",
    cityLabel: "Ville",
    cityPlace: "Ex: Casablanca",
    yearLabel: "Année",
    uploadBtn: "Publier le projet",
    uploading: "Publication...",
    galleryTitle: "Mes projets actuels",
    projectCount: "projet(s)",
    noProjects: "Aucun projet ajouté pour le moment. Commencez par en ajouter un !",
    noTitle: "Sans titre",
    noCity: "Non spécifié",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer définitivement ce projet ?",
    successAdd: "Projet ajouté avec succès à votre portfolio !",
    successDel: "Projet supprimé avec succès.",
    errorMsg: "Une erreur s'est produite. Veuillez réessayer.",
    errorFile: "Veuillez d'abord sélectionner une image !"
  },
  en: {
    pageTitle: "Portfolio Management",
    addTitle: "Add New Project",
    imgLabel: "Project Image (Required) *",
    chooseFile: "Choose Image",
    titleLabel: "Project Title (Optional)",
    titlePlace: "E.g.: Luxury villa finishing",
    cityLabel: "City",
    cityPlace: "E.g.: Casablanca",
    yearLabel: "Year",
    uploadBtn: "Upload Project",
    uploading: "Uploading...",
    galleryTitle: "My Current Projects",
    projectCount: "project(s)",
    noProjects: "No projects added yet. Start by uploading your first project!",
    noTitle: "Untitled",
    noCity: "Unspecified",
    confirmDelete: "Are you sure you want to permanently delete this project?",
    successAdd: "Project successfully added to your portfolio!",
    successDel: "Project deleted successfully.",
    errorMsg: "An error occurred. Please try again.",
    errorFile: "Please select an image first!"
  }
};

export default function ProviderPortfolio() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [providerId, setProviderId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // حالات النموذج
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ title: '', city: '', year: new Date().getFullYear() });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ show: false, type: '', text: '' });
  
  const fileInputRef = useRef(null);

  // 1. تحديد الهوية وجلب المشاريع
  useEffect(() => {
    const fetchPortfolio = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: provRow } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!provRow) {
        setIsLoading(false);
        return;
      }

      setProviderId(provRow.id);
      loadProjects(provRow.id);
    };

    fetchPortfolio();
  }, []);

  const loadProjects = async (pId) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('provider_portfolio')
      .select('*')
      .eq('provider_id', pId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showAlert = (type, text) => {
    setAlertMsg({ show: true, type, text });
    setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 5000);
  };

  // 2. إضافة مشروع جديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!providerId) return;
    if (!file) {
      showAlert('error', t.errorFile);
      return;
    }

    setIsSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `port_${providerId}_${Date.now()}.${fileExt}`;

      // رفع الصورة لمجلد project-files
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: pubData } = supabase.storage.from('project-files').getPublicUrl(fileName);
      const imageUrl = pubData.publicUrl;

      // إدراج البيانات في الجدول
      const { error: dbError } = await supabase
        .from('provider_portfolio')
        .insert([{
          provider_id: providerId,
          image_path: imageUrl,
          title: formData.title.trim(),
          city: formData.city.trim(),
          year: formData.year
        }]);

      if (dbError) throw dbError;

      showAlert('success', t.successAdd);
      
      // تفريغ النموذج وتحديث القائمة
      setFile(null);
      setPreview(null);
      setFormData({ title: '', city: '', year: new Date().getFullYear() });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      loadProjects(providerId);

    } catch (err) {
      showAlert('error', t.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. حذف مشروع
  const handleDelete = async (id, imagePath) => {
    if (!window.confirm(t.confirmDelete)) return;

    try {
      // حذف من قاعدة البيانات
      const { error: dbError } = await supabase
        .from('provider_portfolio')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // محاولة حذف الصورة من الستوراج (استخراج اسم الملف من الرابط)
      if (imagePath) {
        const fileNameMatch = imagePath.match(/\/project-files\/(.+)$/);
        if (fileNameMatch && fileNameMatch[1]) {
          await supabase.storage.from('project-files').remove([fileNameMatch[1]]);
        }
      }

      setProjects(prev => prev.filter(p => p.id !== id));
      showAlert('success', t.successDel);
    } catch (err) {
      showAlert('error', t.errorMsg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      <h1 className="text-2xl md:text-3xl font-black text-blue-900 mb-6 flex items-center gap-3">
        <Camera className="w-8 h-8 text-blue-600" />
        {t.pageTitle}
      </h1>

      {alertMsg.show && (
        <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-3 border ${alertMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {alertMsg.text}
        </div>
      )}

      {/* تخطيط الشبكة (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* العمود الأيمن: نموذج إضافة مشروع (Sticky) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6 order-1 lg:order-2">
          <h3 className="text-lg font-black text-orange-600 mb-5 border-b-2 border-orange-100 pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5" /> {t.addTitle}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* الصورة */}
            <div>
              <label className="block font-bold text-slate-600 text-sm mb-2">{t.imgLabel}</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/png, image/jpeg, image/webp" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              {!preview ? (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center gap-2 text-slate-500 font-bold text-sm"
                >
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                  {t.chooseFile}
                </button>
              ) : (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute top-2 right-2 bg-white/90 text-rose-600 p-1.5 rounded-full shadow-md font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>

            {/* العنوان */}
            <div>
              <label className="block font-bold text-slate-600 text-sm mb-2">{t.titleLabel}</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder={t.titlePlace} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* المدينة والسنة */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-bold text-slate-600 text-sm mb-2">{t.cityLabel}</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder={t.cityPlace} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="w-1/3">
                <label className="block font-bold text-slate-600 text-sm mb-2">{t.yearLabel}</label>
                <input 
                  type="number" 
                  name="year" 
                  value={formData.year} 
                  onChange={handleInputChange} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors text-center"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold text-base shadow-md transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              {isSubmitting ? t.uploading : t.uploadBtn}
            </button>
          </form>
        </div>

        {/* ========================================================= */}
        {/* العمود الأيسر: معرض المشاريع الحالية */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 order-2 lg:order-1">
          <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-800 m-0 flex items-center gap-2">
              🖼️ {t.galleryTitle}
            </h3>
            <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-100">
              {projects.length} {t.projectCount}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-slate-400 font-bold"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-4 opacity-50">📭</div>
              <p className="font-bold">{t.noProjects}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden relative bg-slate-50 group hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="h-44 bg-slate-200 overflow-hidden">
                    <img src={item.image_path} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-2 truncate">
                      {item.title || t.noTitle}
                    </h4>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5" /> {item.city || t.noCity}</span>
                      <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3.5 h-3.5" /> {item.year || '-'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDelete(item.id, item.image_path)}
                    className="absolute top-2 left-2 bg-rose-500/90 hover:bg-rose-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    title={t.confirmDelete.split('?')[0]}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}