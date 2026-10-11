import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useProjectStore from '../../store/useProjectStore';
import { 
  HardHat, Camera, UserPlus, Clock, CheckCircle2, 
  AlertCircle, Phone, X, UploadCloud, Loader2, ArrowRight, MessageCircle, 
  Truck, AlertTriangle, PackageSearch, ClipboardCheck, Sun, Moon
} from 'lucide-react';

export default function ForemanDashboard() {
  
  const outletContext = useOutletContext();

  // 🚀 حالات اللغة والوضع الداكن المستقلة
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') return document.documentElement.classList.contains('dark');
    return localStorage.getItem('theme') === 'dark';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });

  // دالة تبديل الوضع الداكن
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // دالة تبديل اللغة
  const toggleLanguage = () => {
    const nextLang = language === 'ar' ? 'fr' : language === 'fr' ? 'en' : 'ar';
    setLanguage(nextLang);
    localStorage.setItem('language', nextLang);
  };

  const isRtl = language === 'ar';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  
  // تحديث فوري إذا تغيرت الإعدادات
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
      setLanguage(localStorage.getItem('language') || 'ar');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { activeProject, projects, setActiveProject, fetchProjects } = useProjectStore();
  
  const [localProjects, setLocalProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالات النوافذ المنبثقة
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [showPointage, setShowPointage] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // 🚀 حالات (States) مدخلات النوافذ الجديدة
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignForm, setAssignForm] = useState({ name: '', phone: '', role: '', wage: '' });
  const [reportForm, setReportForm] = useState({ file: null, preview: null, description: '' });
  
  const [attendanceState, setAttendanceState] = useState({});
  const [deliveryForm, setDeliveryForm] = useState({ supplier: '', material: '', file: null, preview: null });
  const [materialDesc, setMaterialDesc] = useState('');
  const [alertForm, setAlertForm] = useState({ description: '', file: null, preview: null });

  // حفظ حالة الغياب لكل حرفي (بناءً على الـ ID) لعرضها في الواجهة
  const [absentWorkers, setAbsentWorkers] = useState({});

  // 🚀 قاموس الترجمة المحدث يشمل النوافذ الجديدة
  const translations = {
    ar: {
      welcome: "مكتب الميدان", foreman: "رئيس الورش", noProject: "لا يوجد ورش محدد",
      selectProject: "اختر الورش الحالي من هنا...", cameraBtn: "لقطة ميدانية", addWorkerBtn: "طلب إضافة حرفي",
      myTeam: "فريق الورش الحالي", pendingReq: "طلبات قيد انتظار موافقة الإدارة",
      approved: "معتمد", pending: "في الانتظار", noWorkers: "لا يوجد عمال حالياً",
      addWorkerTitle: "طلب تعيين حرفي جديد", workerName: "اسم الحرفي", phone: "رقم الهاتف",
      role: "الصفة (صباغ، بناء...)", wage: "الأجر اليومي المقترح (درهم)", sendReq: "إرسال الطلب للإدارة",
      cancel: "إلغاء", photoTitle: "رفع تقرير ميداني مصور", desc: "وصف الصورة أو ملاحظات",
      takePhoto: "التقاط صورة / رفع", sendReport: "إرسال التقرير للباترون",
      bossMode: "أنت في وضع المعاينة (الميدان)", backToDash: "العودة للوحة القيادة",
      loadingProjects: "جاري جلب الأوراش...",
      // 🚀 الأزرار الستة الجديدة
      captureTerrain: "تقرير مصور",
      bonLivraison: "استلام سلع",
      demandeMateriel: "طلب مواد",
      demanderArtisan: "طلب حرفي",
      pointageOuvriers: "تسجيل حضور العمال (Pointage)",
      alerteUrgenceBtn: "إبلاغ عن طوارئ / توقف",
      // ترجمات النوافذ 
      pointageTitle: "تسجيل حضور العمال", validerPresence: "تأكيد الحضور",
      newBon: "إضافة وصل استلام", supplierName: "اسم المورد (مثال: شركة الإسمنت)", materialType: "نوع السلعة (مثال: 50 كيس)", sendToBureau: "إرسال للمقاول",
      matRequest: "طلب مواد عاجلة", whatDoYouNeed: "ما هي المواد التي تنقصك الآن؟",
      alertTitle: "إنذار طوارئ / توقف", alertDesc: "صف المشكلة (عطل، إصابة، توقف...)", sendAlert: "إرسال تنبيه عاجل", optionalPhoto: "صورة للتوثيق (اختياري)"
    },
    fr: {
      welcome: "Bureau de Terrain", foreman: "Chef de Chantier", noProject: "Aucun chantier",
      selectProject: "Sélectionnez le chantier ici...", cameraBtn: "Capture Terrain", addWorkerBtn: "Demander Artisan",
      myTeam: "Équipe Actuelle", pendingReq: "Demandes en attente d'approbation",
      approved: "Approuvé", pending: "En attente", noWorkers: "Aucun artisan",
      addWorkerTitle: "Demande d'ajout artisan", workerName: "Nom", phone: "Téléphone",
      role: "Spécialité", wage: "Salaire suggéré (MAD/Jour)", sendReq: "Envoyer à la direction",
      cancel: "Annuler", photoTitle: "Nouveau rapport photo", desc: "Description / Notes",
      takePhoto: "Prendre / Choisir Photo", sendReport: "Envoyer au Patron",
      bossMode: "Mode Aperçu (Terrain)", backToDash: "Retour au Tableau",
      loadingProjects: "Chargement des chantiers...",
      captureTerrain: "Capture Terrain", bonLivraison: "Bon Livraison", demandeMateriel: "Demande Matériel",
      demanderArtisan: "Demander Artisan", pointageOuvriers: "Pointage des Ouvriers", alerteUrgenceBtn: "Alerte Urgence / Arrêt",
      pointageTitle: "Pointage des Ouvriers", validerPresence: "Valider Présence",
      newBon: "Nouveau Bon de Livraison", supplierName: "Nom du Fournisseur", materialType: "Type de matériel", sendToBureau: "Envoyer au Bureau",
      matRequest: "Demande Matériel", whatDoYouNeed: "De quoi avez-vous besoin ?",
      alertTitle: "Alerte Urgence / Arrêt", alertDesc: "Décrivez le problème...", sendAlert: "Envoyer Alerte", optionalPhoto: "Photo (Optionnel)"
    },
    en: {
      welcome: "Field Office", foreman: "Site Foreman", noProject: "No Project Selected",
      selectProject: "Select project here...", cameraBtn: "Site Snapshot", addWorkerBtn: "Request Artisan",
      myTeam: "Current Site Team", pendingReq: "Pending Management Approval",
      approved: "Approved", pending: "Pending", noWorkers: "No artisans assigned",
      addWorkerTitle: "Request New Artisan", workerName: "Name", phone: "Phone",
      role: "Trade / Specialty", wage: "Proposed Daily Wage (MAD)", sendReq: "Submit to Management",
      cancel: "Cancel", photoTitle: "Upload Site Photo Report", desc: "Description / Notes",
      takePhoto: "Take / Upload Photo", sendReport: "Send to Contractor",
      bossMode: "Preview Mode (Field)", backToDash: "Back to Dashboard",
      loadingProjects: "Loading projects...",
      captureTerrain: "Site Snapshot", bonLivraison: "Delivery Receipt", demandeMateriel: "Material Request",
      demanderArtisan: "Request Artisan", pointageOuvriers: "Workers Attendance", alerteUrgenceBtn: "Emergency / Halt Alert",
      pointageTitle: "Workers Attendance", validerPresence: "Confirm Attendance",
      newBon: "New Delivery Receipt", supplierName: "Supplier Name (e.g., Cement Co.)", materialType: "Material Type (e.g., 50 bags)", sendToBureau: "Send to Office",
      matRequest: "Urgent Material Request", whatDoYouNeed: "What materials do you need right now?",
      alertTitle: "Emergency / Halt Alert", alertDesc: "Describe the problem (breakdown, injury, halt...)", sendAlert: "Send Urgent Alert", optionalPhoto: "Photo Evidence (Optional)"
    }
  };
  const t = translations[language] || translations.fr;

  // 🚀 1. جلب المستخدم وحماية مصفوفة المشاريع
  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && isMounted) {
        setUser(session.user);
        // لا نطلب جلب المشاريع إلا إذا كانت المصفوفة فارغة فعلياً
        if (!projects || projects.length === 0) {
          await fetchProjects();
        } else {
          setLoading(false); // إذا كانت المشاريع موجودة مسبقاً، نلغي التحميل فوراً
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };
    initialize();
    return () => { isMounted = false; };
  }, [projects.length]); // نراقب طول المصفوفة

  // 🚀 2. جلب بيانات الميدان عند اختيار ورش
  useEffect(() => {
    if (activeProject) {
      fetchFieldData();
    } else {
      setLoading(false);
    }
  }, [activeProject]);

  const fetchFieldData = async () => {
    const currentProjectId = activeProject?.id || activeProject;
    if (!currentProjectId) {
      console.warn("⚠️ لا يوجد معرف ورش محدد لجلب الفريق!");
      return;
    }

    setLoading(true);
    try {
      // 1. جلب الفريق
      const { data: teamData, error: teamErr } = await supabase
        .from('milestone_assignments')
        .select('*')
        .eq('project_id', currentProjectId);

      if (teamErr) {
        console.error("❌ خطأ Supabase في جلب الفريق:", teamErr);
      } else {
        setTeam(teamData || []);
      }

      // 2. جلب التقارير
      const { data: reportsData } = await supabase
        .from('site_reports')
        .select('*')
        .eq('project_id', currentProjectId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reportsData) setReports(reportsData);

      // 🚀 3. جلب سجلات الحضور لليوم الحالي (الجديد)
      const today = new Date().toISOString().split('T')[0]; // صيغة YYYY-MM-DD
      const { data: attendanceData, error: attendanceErr } = await supabase
        .from('field_attendance')
        .select('worker_id, is_present')
        .eq('project_id', currentProjectId)
        .eq('date', today);

      if (!attendanceErr && attendanceData) {
        const fetchedAbsentState = {};
        // تهيئة الـ attendanceState لتعكس حالة قاعدة البيانات
        const fetchedAttendanceState = {}; 
        
        attendanceData.forEach(record => {
          if (!record.is_present) {
            fetchedAbsentState[record.worker_id] = true;
            fetchedAttendanceState[record.worker_id] = false; // تحديث حالة الـ checkbox
          } else {
            fetchedAttendanceState[record.worker_id] = true;
          }
        });
        setAbsentWorkers(fetchedAbsentState);
        
        // تحديث حالة الخانات (checkboxes) بناءً على ما جُلب من الداتا بيز
        setAttendanceState(prevState => ({...prevState, ...fetchedAttendanceState}));
      }

    } catch (err) {
      console.error("خطأ غير متوقع:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWorker = async (e) => {
    e.preventDefault();
    if (!activeProject || !user) return;
    setIsSubmitting(true);

    const insertPayload = {
       user_id: user.id,
       project_id: activeProject.id, 
       assignment_type: 'manual', 
       worker_name: assignForm.name,
       worker_phone: assignForm.phone,
       role: assignForm.role,
       stage_id: 2,
       is_manager: false,
       daily_wage: assignForm.wage ? parseFloat(assignForm.wage) : null,
       status: 'pending'
    };
    
    const { data, error } = await supabase.from('milestone_assignments').insert([insertPayload]).select(); 
    
    if (!error && data) {
      setTeam(prev => [data[0], ...prev]);
      setIsAssignModalOpen(false);
      setAssignForm({ name: '', phone: '', role: '', wage: '' });
      alert(language === 'ar' ? 'تم إرسال الطلب للمقاول بنجاح!' : 'Demande envoyée avec succès !');
    }
    setIsSubmitting(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReportForm({ ...reportForm, file, preview: URL.createObjectURL(file) });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.file || !activeProject || !user) return;
    setIsSubmitting(true);

    const fileName = `field_${Date.now()}_${reportForm.file.name.replace(/\s+/g, '_')}`;
    const filePath = `${activeProject.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, reportForm.file);
    
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(filePath);
      const { data } = await supabase.from('site_reports').insert([{ 
        project_id: activeProject.id, 
        image_url: urlData.publicUrl, 
        description: reportForm.description,
        provider_name: user?.user_metadata?.full_name || 'Chef de Chantier'
      }]).select();

      if (data) setReports(prev => [data[0], ...prev]);
      setIsCameraModalOpen(false);
      setReportForm({ file: null, preview: null, description: '' });
      alert('📸 تم رفع التقرير الميداني بنجاح!');
    }
    setIsSubmitting(false);
  };

  // 🚀 دوال إرسال بيانات النوافذ الميدانية
  
  // 1. إرسال الحضور
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    setIsSubmitting(true);

    // بناء سجلات الحضور
    const attendanceRecords = team.filter(w => !w.is_manager && w.status !== 'pending').map(worker => ({
      project_id: activeProject.id,
      worker_id: worker.id,
      worker_name: worker.worker_name || worker.name,
      is_present: attendanceState[worker.id] !== false // الافتراضي حاضر ما لم يُلغَ تحديده
    }));

    const { error } = await supabase.from('field_attendance').insert(attendanceRecords);
    setIsSubmitting(false);
    if (!error) {
      // تحديث الواجهة لتظهر حالة الغياب
      const newAbsentState = {};
      attendanceRecords.forEach(record => {
        if (!record.is_present) {
           newAbsentState[record.worker_id] = true;
        }
      });
      setAbsentWorkers(newAbsentState); // حفظ الغائبين

      alert(language === 'ar' ? 'تم تسجيل الحضور بنجاح' : 'Pointage enregistré avec succès');
      setShowPointage(false);
    }
  };

  // 2. إرسال وصل استلام
  const handleSubmitDelivery = async (e) => {
    e.preventDefault();
    if (!activeProject || !deliveryForm.supplier) return;
    setIsSubmitting(true);
    
    let imageUrl = null;
    if (deliveryForm.file) {
      const filePath = `${activeProject.id}/delivery_${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, deliveryForm.file);
      if (!uploadError) {
        imageUrl = supabase.storage.from('project-files').getPublicUrl(filePath).data.publicUrl;
      }
    }

    const { error } = await supabase.from('delivery_receipts').insert([{
      project_id: activeProject.id,
      supplier_name: deliveryForm.supplier,
      material_type: deliveryForm.material,
      image_url: imageUrl
    }]);

    setIsSubmitting(false);
    if (!error) {
      setShowDelivery(false);
      setDeliveryForm({ supplier: '', material: '', file: null, preview: null });
      alert(language === 'ar' ? 'تم إرسال الوصل' : 'Bon envoyé');
    }
  };

  // 3. إرسال طلب مواد
  const handleSubmitMaterial = async (e) => {
    e.preventDefault();
    if (!activeProject || !materialDesc) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('field_alerts').insert([{
      project_id: activeProject.id,
      alert_type: 'demande_materiel',
      priority: 'medium',
      description: materialDesc
    }]);

    setIsSubmitting(false);
    if (!error) {
      setShowMaterial(false);
      setMaterialDesc('');
      alert(language === 'ar' ? 'تم إرسال الطلب' : 'Demande envoyée');
    }
  };

  // 4. إرسال إنذار الطوارئ
  const handleSubmitAlert = async (e) => {
    e.preventDefault();
    if (!activeProject || !alertForm.description) return;
    setIsSubmitting(true);

    let imageUrl = null;
    if (alertForm.file) {
      const filePath = `${activeProject.id}/alert_${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, alertForm.file);
      if (!uploadError) {
        imageUrl = supabase.storage.from('project-files').getPublicUrl(filePath).data.publicUrl;
      }
    }

    const { error } = await supabase.from('field_alerts').insert([{
      project_id: activeProject.id,
      alert_type: 'urgence',
      priority: 'critical',
      description: alertForm.description,
      image_url: imageUrl
    }]);

    setIsSubmitting(false);
    if (!error) {
      setShowAlert(false);
      setAlertForm({ description: '', file: null, preview: null });
      alert(language === 'ar' ? 'تم إرسال التنبيه للإدارة' : 'Alerte envoyée à la direction');
    }
  };

  // قائمة المشاريع المعتمدة (إما من الـ store أو من الجلب المباشر)
  const displayedProjects = (projects && projects.length > 0) ? projects : localProjects;

  return (
    
      <div className={`min-h-screen pt-24 pb-28 px-4 sm:px-6 relative z-10 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#f0f4f8] text-slate-900'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* تم التغيير إلى bg-white/80 لتأثير زجاجي نظيف */}
      <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm backdrop-blur-md border-b ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/80 border-slate-200'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* زر الرجوع للوحة القيادة (أسود في الفاتح، أبيض في الداكن) */}
      <Link to="/v2/dashboard" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
        <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''}/>
          {t.backToDash}
        </Link>

        {/* أزرار اللغة والوضع الداكن */}
      <div className="flex items-center gap-2" dir="ltr">
        <button onClick={toggleLanguage} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
          {language.toUpperCase()}
        </button>
        <button onClick={toggleTheme} className={`p-2 rounded-xl border transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>

      <div className="max-w-3xl mx-auto w-full">
        {/* رأس الصفحة: تصميم ميداني صارم ومحمي */}
        <div className={`p-6 rounded-[2rem] mb-6 border-2 shadow-lg relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-amber-500/30' : 'bg-amber-500 border-amber-600'}`}>
          <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none"><HardHat size={150} className={isDarkMode ? 'text-amber-500' : 'text-white'} /></div>
          
          <div className="relative z-10">
            <p className={`text-xs font-black mb-1 ${isDarkMode ? 'text-amber-500' : 'text-amber-100'}`}>{t.welcome}</p>
            <h1 className="text-2xl font-black mb-6 text-white drop-shadow-md">
              {activeProject ? activeProject.name : t.noProject}
            </h1>
            
            {/* 🚀 القائمة المنسدلة: تصميم صلب بخلفية بيضاء صريحة لمنع التداخل */}
            <div className="mt-2">
              <select 
                value={activeProject?.id || activeProject || ''} 
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const found = projects.find(p => String(p.id) === String(selectedId));
                  setActiveProject(found || selectedId);
                }}
                className="w-full p-4 rounded-xl font-black bg-white text-slate-900 border-4 border-amber-300 shadow-xl outline-none cursor-pointer text-sm"
              >
                <option value="" disabled>{t.selectProject}</option>
                {projects && projects.length > 0 ? (
                  projects.map(p => (
                    <option key={p.id} value={p.id}>
                      🏗️ {p.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>{t.loadingProjects}</option>
                )}
              </select>
            </div>

          </div>
        </div>

        {/* جسم الصفحة بعد اختيار الورش */}
        {activeProject && (
          <div className="space-y-6 animate-fade-in">
            
            {/* 🚀 لوحة الإجراءات الميدانية السريعة (تطابق تصميم الفيديو) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          
          {/* 1. التقاط صور الورش */}
          <button 
            onClick={() => setIsCameraModalOpen(true)}
            className={`group p-5 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800 hover:bg-blue-600' : 'bg-white hover:bg-blue-600'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-blue-500/20 text-blue-400 group-hover:bg-white/20 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-white/20 group-hover:text-white'
            }`}>
              <Camera size={28} />
            </div>
            <span className={`text-sm font-black text-center transition-colors duration-300 group-hover:text-white ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>{t.captureTerrain}</span>
          </button>

          {/* 2. استلام السلع */}
          <button 
            onClick={() => setShowDelivery(true)}
            className={`group p-5 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800 hover:bg-emerald-500' : 'bg-white hover:bg-emerald-500'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-white/20 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-white/20 group-hover:text-white'
            }`}>
              <Truck size={28} />
            </div>
            <span className={`text-sm font-black text-center transition-colors duration-300 group-hover:text-white ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>{t.bonLivraison}</span>
          </button>

          {/* 3. طلب مواد عاجلة */}
          <button 
            onClick={() => setShowMaterial(true)}
            className={`group p-5 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800 hover:bg-purple-600' : 'bg-white hover:bg-purple-600'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-purple-500/20 text-purple-400 group-hover:bg-white/20 group-hover:text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-white/20 group-hover:text-white'
            }`}>
              <PackageSearch size={28} />
            </div>
            <span className={`text-sm font-black text-center transition-colors duration-300 group-hover:text-white ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>{t.demandeMateriel}</span>
          </button>

          {/* 4. طلب حرفي جديد */}
          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className={`group p-5 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800 hover:bg-amber-500' : 'bg-white hover:bg-amber-500'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-amber-500/20 text-amber-400 group-hover:bg-white/20 group-hover:text-white' : 'bg-amber-50 text-amber-600 group-hover:bg-white/20 group-hover:text-white'
            }`}>
              <UserPlus size={28} />
            </div>
            <span className={`text-sm font-black text-center transition-colors duration-300 group-hover:text-white ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>{t.demanderArtisan}</span>
          </button>
          
          {/* 5. تسجيل الحضور (Pointage) */}
          <button 
            onClick={() => setShowPointage(true)}
            className={`col-span-2 md:col-span-4 p-5 rounded-[2rem] border-2 border-dashed flex flex-row items-center justify-center gap-4 transition-all duration-300 shadow-sm group hover:border-transparent hover:-translate-y-1 hover:shadow-xl ${
              isDarkMode ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700' : 'border-slate-300 bg-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-slate-700 text-slate-300 group-hover:bg-white/20 group-hover:text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white/20 group-hover:text-white'
            }`}>
              <ClipboardCheck size={24} />
            </div>
            <span className={`text-base font-black transition-colors duration-300 group-hover:text-white ${
              isDarkMode ? 'text-slate-300' : 'text-slate-800'
            }`}>{t.pointageOuvriers}</span>
          </button>

          {/* 6. إنذار الطوارئ */}
          <button 
            onClick={() => setShowAlert(true)}
            className={`col-span-2 md:col-span-4 p-5 rounded-[2rem] flex flex-row items-center justify-center gap-4 transition-all duration-300 shadow-sm group hover:-translate-y-1 hover:shadow-xl ${
              isDarkMode ? 'bg-red-500/10 hover:bg-red-600' : 'bg-red-50 hover:bg-red-500'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-red-500 text-white group-hover:bg-white/20' : 'bg-red-400 text-white group-hover:bg-white/20 group-hover:text-white'
            }`}>
              <AlertTriangle size={24} className="animate-pulse" />
            </div>
            <span className={`text-base font-black transition-colors duration-300 group-hover:text-white ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>{t.alerteUrgenceBtn}</span>
          </button>
        </div>

            {/* الطلبات المعلقة */}
            {team.filter(w => w.status === 'pending').length > 0 && (
              <div>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2 text-amber-500"><Clock size={16}/> {t.pendingReq}</h3>
                <div className="space-y-2">
                  {team.filter(w => w.status === 'pending').map(worker => (
                    <div key={worker.id} className={`p-4 rounded-2xl border-2 border-amber-500/30 flex justify-between items-center ${isDarkMode ? 'bg-slate-900/80' : 'bg-amber-50/70'}`}>
                      <div>
                        <h4 className={`font-bold text-sm ${textTitle}`}>{worker.worker_name}</h4>
                        <p className={`text-xs mt-0.5 ${textMuted}`}>{worker.role}</p>
                      </div>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-600 rounded-full text-[10px] font-black">
                        ⏳ {t.pending}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 🚀 قسم فريق العمل مقسم حسب المراحل والألوان وبدون رئيس الفريق */}
            <div className="space-y-6 mt-6">
              <h3 className={`text-sm font-black flex items-center gap-2 ${textMuted}`}>
                <HardHat size={16} /> {t.myTeam} ({team.filter(w => !w.is_manager && w.status !== 'pending').length})
              </h3>

              {(() => {
                const approvedWorkers = team.filter(w => !w.is_manager && w.status !== 'pending');

                if (approvedWorkers.length === 0) {
                  return (
                    <div className={`p-8 text-center rounded-3xl border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <p className="font-bold text-slate-500 text-sm">{t.noWorkers}</p>
                    </div>
                  );
                }

                const stages = [
                  {
                    id: 2,
                    name: language === 'ar' ? 'التنفيذ' : language === 'en' ? 'Execution' : 'Exécution',
                    icon: '🏗️',
                    headerText: 'text-orange-600 dark:text-orange-400',
                    badgeBg: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
                    iconColor: 'text-orange-500'
                  },
                  {
                    id: 3,
                    name: language === 'ar' ? 'التشطيب' : language === 'en' ? 'Finishing' : 'Finition',
                    icon: '🎨',
                    headerText: 'text-purple-600 dark:text-purple-400',
                    badgeBg: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
                    iconColor: 'text-purple-500'
                  },
                  {
                    id: 4,
                    name: language === 'ar' ? 'التسجيل والشهادات' : language === 'en' ? 'Handover & Permit' : 'Enregistrement',
                    icon: '📜',
                    headerText: 'text-emerald-600 dark:text-emerald-400',
                    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
                    iconColor: 'text-emerald-500'
                  }
                ];

                return stages.map(stage => {
                  const stageWorkers = approvedWorkers.filter(w => (Number(w.stage_id) || 2) === stage.id);
                  if (stageWorkers.length === 0) return null;

                  return (
                    <div key={stage.id} className="space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b-2" style={{ borderColor: 'rgba(148, 163, 184, 0.2)' }}>
                        <span className="text-base">{stage.icon}</span>
                        <span className={`text-xs font-black uppercase tracking-wider ${stage.headerText}`}>
                          {stage.name}
                        </span>
                        <span className="text-[10px] font-bold opacity-40">({stageWorkers.length})</span>
                      </div>

                      <div className="space-y-2.5">
                        {stageWorkers.map(worker => (
                          <div
                            key={worker.id}
                            className={`p-4 rounded-2xl border-2 flex items-center justify-between shadow-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} hover:border-slate-300`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={20} className={stage.iconColor} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-black text-sm ${absentWorkers[worker.id] ? 'text-red-500 line-through' : textTitle}`}>
                                    {worker.worker_name || worker.name}
                                  </h4>
                                    {absentWorkers[worker.id] && (
                                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
                                    {language === 'ar' ? 'غائب اليوم' : 'Absent'}
                                  </span>
                                )}
                              </div>
                                <div className="flex items-center gap-2 mt-1.5" dir="ltr">
                                  {worker.worker_phone ? (
                                    <>
                                      {/* زر الاتصال الهاتفي المباشر */}
                                      <a
                                        href={`tel:${worker.worker_phone.replace(/\s+/g, '')}`}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
                                        title="Appel direct"
                                      >
                                        <Phone size={11} className="text-emerald-500" />
                                        <span>{worker.worker_phone}</span>
                                      </a>

                                      {/* زر واتساب السريع */}
                                      <a
                                        href={`https://wa.me/${worker.worker_phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors"
                                        title="WhatsApp"
                                      >
                                        <MessageCircle size={13} />
                                      </a>
                                    </>
                                  ) : (
                                    <span className="text-[11px] font-bold text-slate-400">---</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${stage.badgeBg}`}>
                              {worker.role || 'Artisan'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>

      {/* نافذة طلب حرفي */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className={`w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 animate-slide-up ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`font-black text-lg ${textTitle}`}>{t.addWorkerTitle}</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><X size={20}/></button>
            </div>
            <form onSubmit={handleRequestWorker} className="space-y-4">
              <input required type="text" placeholder={t.workerName} value={assignForm.name} onChange={e=>setAssignForm({...assignForm, name: e.target.value})} className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode?'bg-slate-950 border-slate-800 text-white':'bg-slate-50 border-slate-200'}`} />
              <input required type="tel" placeholder={t.phone} value={assignForm.phone} onChange={e=>setAssignForm({...assignForm, phone: e.target.value})} className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode?'bg-slate-950 border-slate-800 text-white':'bg-slate-50 border-slate-200'}`} />
              <input required type="text" placeholder={t.role} value={assignForm.role} onChange={e=>setAssignForm({...assignForm, role: e.target.value})} className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode?'bg-slate-950 border-slate-800 text-white':'bg-slate-50 border-slate-200'}`} />
              <input type="number" placeholder={t.wage} value={assignForm.wage} onChange={e=>setAssignForm({...assignForm, wage: e.target.value})} className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-amber-600 border-amber-500/30 focus:border-amber-500 ${isDarkMode?'bg-amber-500/5':'bg-amber-50'}`} />
              
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 text-xs font-bold flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                <p>{language === 'ar' ? 'سيتم إرسال هذا الطلب للإدارة، ولن يبدأ الحرفي العمل حتى يوافق المقاول على الأجر.' : 'Cette demande sera envoyée à la direction pour validation du salaire.'}</p>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black rounded-xl mt-4 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : t.sendReq}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة الكاميرا */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[2rem] p-6 animate-fade-in ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`font-black text-lg ${textTitle}`}>{t.photoTitle}</h3>
              <button onClick={() => setIsCameraModalOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <label className={`block w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${isDarkMode ? 'border-slate-700 bg-slate-800 hover:border-blue-500' : 'border-slate-300 bg-slate-50 hover:border-blue-500'}`}>
                {reportForm.preview ? (
                  <img src={reportForm.preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={40} className="text-slate-400 mb-2"/>
                    <span className="font-bold text-slate-500 text-sm">{t.takePhoto}</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              </label>

              <textarea placeholder={t.desc} rows="3" value={reportForm.description} onChange={e=>setReportForm({...reportForm, description: e.target.value})} className={`w-full p-4 rounded-xl border-2 outline-none font-bold resize-none ${isDarkMode?'bg-slate-950 border-slate-800 text-white':'bg-slate-50 border-slate-200'}`}></textarea>

              <button type="submit" disabled={isSubmitting || !reportForm.file} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><UploadCloud size={20}/> {t.sendReport}</>}
              </button>
            </form>
          </div>
        </div>
      )}

    {/* ================= MODALS النوافذ المنبثقة المربوطة ================= */}

      {/* 1. نافذة تسجيل الحضور (Pointage) */}
      {showPointage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                <ClipboardCheck className="text-blue-500" /> {t.pointageTitle}
              </h3>
              <button onClick={() => setShowPointage(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmitAttendance}>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
                {team.filter(w => !w.is_manager && w.status !== 'pending').map(worker => (
                  <label key={worker.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors hover:border-blue-300 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                    <span className={`font-bold text-sm ${textTitle}`}>{worker.worker_name}</span>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-blue-600 rounded" 
                      checked={attendanceState[worker.id] !== false}
                      onChange={(e) => setAttendanceState(prev => ({...prev, [worker.id]: e.target.checked}))}
                    />
                  </label>
                ))}
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : t.validerPresence}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. نافذة استلام السلع (Bon de Livraison) */}
      {showDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                <Truck className="text-emerald-500" /> {t.newBon}
              </h3>
              <button onClick={() => setShowDelivery(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmitDelivery} className="space-y-4 mb-6">
              <input required type="text" placeholder={t.supplierName} value={deliveryForm.supplier} onChange={e=>setDeliveryForm({...deliveryForm, supplier: e.target.value})} className={`w-full p-3.5 rounded-xl border-2 outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-500'}`} />
              <input required type="text" placeholder={t.materialType} value={deliveryForm.material} onChange={e=>setDeliveryForm({...deliveryForm, material: e.target.value})} className={`w-full p-3.5 rounded-xl border-2 outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-500'}`} />
              
              <label className={`w-full p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800/50 hover:border-emerald-500' : 'border-slate-300 bg-slate-50 hover:border-emerald-500'} ${deliveryForm.preview ? 'border-emerald-500' : ''}`}>
                {deliveryForm.preview ? (
                  <img src={deliveryForm.preview} alt="preview" className="h-20 object-contain rounded-lg" />
                ) : (
                  <>
                    <Camera size={28} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-400">{t.takePhoto}</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) setDeliveryForm({...deliveryForm, file, preview: URL.createObjectURL(file)});
                }}/>
              </label>

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl flex justify-center items-center gap-2">
                 {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : t.sendToBureau}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. نافذة طلب مواد (Demande Matériel) */}
      {showMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                <PackageSearch className="text-purple-500" /> {t.matRequest}
              </h3>
              <button onClick={() => setShowMaterial(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmitMaterial}>
              <textarea required rows="4" placeholder={t.whatDoYouNeed} value={materialDesc} onChange={e=>setMaterialDesc(e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-bold resize-none mb-6 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 focus:border-purple-500'}`}></textarea>
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : t.sendReq}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. نافذة إنذار الطوارئ (Alerte) */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border-2 border-red-500/30 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-red-600 dark:text-red-500">
                <AlertTriangle className="animate-pulse" /> {t.alertTitle}
              </h3>
              <button onClick={() => setShowAlert(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmitAlert}>
              <textarea required rows="3" placeholder={t.alertDesc} value={alertForm.description} onChange={e=>setAlertForm({...alertForm, description: e.target.value})} className={`w-full p-4 rounded-xl border-2 outline-none font-bold resize-none mb-4 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-red-500' : 'bg-red-50 border-red-100 focus:border-red-500'}`}></textarea>
              
              <label className={`w-full p-4 mb-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800/50 hover:border-red-500' : 'border-slate-300 bg-slate-50 hover:border-red-500'} ${alertForm.preview ? 'border-red-500' : ''}`}>
                 {alertForm.preview ? (
                  <img src={alertForm.preview} alt="preview" className="h-20 object-contain rounded-lg" />
                ) : (
                  <>
                    <Camera size={24} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400">{t.optionalPhoto}</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) setAlertForm({...alertForm, file, preview: URL.createObjectURL(file)});
                }}/>
              </label>

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><AlertTriangle size={18} /> {t.sendAlert}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}