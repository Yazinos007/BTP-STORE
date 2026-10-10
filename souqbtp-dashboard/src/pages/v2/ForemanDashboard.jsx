import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useProjectStore from '../../store/useProjectStore';
import { 
  HardHat, Camera, UserPlus, Clock, CheckCircle2, 
  AlertCircle, Phone, X, UploadCloud, Loader2, ArrowRight, MessageCircle, 
  Truck, AlertTriangle, PackageSearch, ClipboardCheck 
} from 'lucide-react';

export default function ForemanDashboard() {
  const { isDarkMode, language = 'ar' } = useOutletContext() || {}; 
  const isRtl = language === 'ar';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const { activeProject, projects, setActiveProject, fetchProjects } = useProjectStore();
  
  // قائمة محلية احتياطية للمشاريع لضمان ظهورها حتى لو تأخر الـ store
  const [localProjects, setLocalProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالات النوافذ المنبثقة
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  
  // نماذج الإدخال
  const [assignForm, setAssignForm] = useState({ name: '', phone: '', role: '', wage: '' });
  const [reportForm, setReportForm] = useState({ file: null, preview: null, description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // متغيرات النوافذ المنبثقة الميدانية
  const [showPointage, setShowPointage] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

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
      loadingProjects: "جاري جلب الأوراش..."
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
      loadingProjects: "Chargement des chantiers..."
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
      loadingProjects: "Loading projects..."
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
      console.log("🔍 جاري جلب فريق الورش ذو المعرف:", currentProjectId);

      // 1. جلب التعيينات الخاصة بهذا المشروع
      const { data: teamData, error: teamErr } = await supabase
        .from('milestone_assignments')
        .select('*')
        .eq('project_id', currentProjectId);

      if (teamErr) {
        console.error("❌ خطأ Supabase في جلب الفريق:", teamErr);
      } else {
        console.log("✅ الفريق المجلوب من milestone_assignments:", teamData);
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

  // قائمة المشاريع المعتمدة (إما من الـ store أو من الجلب المباشر)
  const displayedProjects = (projects && projects.length > 0) ? projects : localProjects;

  return (
    <div className={`min-h-screen pt-28 pb-28 px-4 sm:px-6 relative z-10 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 شريط العودة للمقاول الموضع بوضوح أسفل شريط العنوان العام */}
      <div className="max-w-md mx-auto mb-6 p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center font-black text-sm shadow-xl border border-slate-800">
        <span className="flex items-center gap-2"><HardHat className="text-amber-500" size={20}/> {t.bossMode}</span>
        <Link to="/v2/dashboard" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-xs">
          {t.backToDash} <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''}/>
        </Link>
      </div>

      <div className="max-w-md mx-auto">
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
            {/* 🚀 لوحة الإجراءات الميدانية السريعة */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          
          {/* 1. التقاط صور الورش */}
          <button className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10 flex items-center justify-center mb-1">
              <Camera size={24} />
            </div>
            <span className={`text-xs font-black ${textTitle}`}>{language === 'ar' ? 'تقرير مصور' : 'Capture Terrain'}</span>
          </button>

          {/* 2. استلام السلع (Bons de Livraison) - تم إضافة onClick */}
          <button 
            onClick={() => setShowDelivery(true)}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 flex items-center justify-center mb-1">
              <Truck size={24} />
            </div>
            <span className={`text-xs font-black ${textTitle}`}>{language === 'ar' ? 'استلام سلع' : 'Bon Livraison'}</span>
          </button>

          {/* 3. طلب مواد عاجلة - تم إضافة onClick */}
          <button 
            onClick={() => setShowMaterial(true)}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 dark:bg-purple-500/10 flex items-center justify-center mb-1">
              <PackageSearch size={24} />
            </div>
            <span className={`text-xs font-black ${textTitle}`}>{language === 'ar' ? 'طلب مواد' : 'Demande Matériel'}</span>
          </button>

          {/* 4. طلب حرفي جديد */}
          <button className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-500/10 flex items-center justify-center mb-1">
              <UserPlus size={24} />
            </div>
            <span className={`text-xs font-black ${textTitle}`}>{language === 'ar' ? 'طلب حرفي' : 'Demander Artisan'}</span>
          </button>
          
          {/* 5. تسجيل الحضور (Pointage) - تم إضافة onClick */}
          <button 
            onClick={() => setShowPointage(true)}
            className={`col-span-2 p-4 rounded-2xl border-2 border-dashed flex flex-row items-center justify-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center">
              <ClipboardCheck size={20} />
            </div>
            <span className={`text-sm font-black ${textTitle}`}>{language === 'ar' ? 'تسجيل حضور العمال (Pointage)' : 'Pointage des Ouvriers'}</span>
          </button>

          {/* 6. إنذار الطوارئ - تم إضافة onClick */}
          <button 
            onClick={() => setShowAlert(true)}
            className="col-span-2 p-4 rounded-2xl border-2 border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900/50 transition-all flex flex-row items-center justify-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <span className="text-sm font-black text-red-600 dark:text-red-400">{language === 'ar' ? 'إبلاغ عن طوارئ / توقف' : 'Alerte Urgence / Arrêt'}</span>
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
                                <h4 className={`font-black text-sm ${textTitle}`}>
                                  {worker.worker_name || worker.name}
                                </h4>
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

    {/* ================= MODALS النوافذ المنبثقة ================= */}
      {/* 1. نافذة تسجيل الحضور (Pointage) */}
      {showPointage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                <ClipboardCheck className="text-blue-500" /> {language === 'ar' ? 'تسجيل حضور العمال' : 'Pointage'}
              </h3>
              <button onClick={() => setShowPointage(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
              {team.filter(w => !w.is_manager && w.status !== 'pending').map(worker => (
                <label key={worker.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors hover:border-blue-300 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                  <span className={`font-bold text-sm ${textTitle}`}>{worker.worker_name}</span>
                  <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded" defaultChecked />
                </label>
              ))}
            </div>
            
            <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/30">
              {language === 'ar' ? 'تأكيد الحضور' : 'Valider Présence'}
            </button>
          </div>
        </div>
      )}

      {/* 2. نافذة استلام السلع (Bon de Livraison) */}
      {showDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                <Truck className="text-emerald-500" /> {language === 'ar' ? 'إضافة وصل استلام' : 'Nouveau Bon'}
              </h3>
              <button onClick={() => setShowDelivery(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <div className="space-y-4 mb-6">
              <input type="text" placeholder={language === 'ar' ? 'اسم المورد (مثال: شركة الإسمنت)' : 'Nom du Fournisseur'} className={`w-full p-3.5 rounded-xl border-2 outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-500'}`} />
              <input type="text" placeholder={language === 'ar' ? 'نوع السلعة (مثال: 50 كيس إسمنت)' : 'Type de matériel'} className={`w-full p-3.5 rounded-xl border-2 outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-500'}`} />
              
              <button className={`w-full p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'}`}>
                <Camera size={28} />
                <span className="text-sm font-bold">{language === 'ar' ? 'التقاط صورة للوصل' : 'Prendre photo du bon'}</span>
              </button>
            </div>
            
            <button className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/30">
              {language === 'ar' ? 'إرسال للمقاول' : 'Envoyer au Bureau'}
            </button>
          </div>
        </div>
      )}

      {/* 3. نافذة طلب مواد (Demande Matériel) */}
      {showMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                <PackageSearch className="text-purple-500" /> {language === 'ar' ? 'طلب مواد عاجلة' : 'Demande Matériel'}
              </h3>
              <button onClick={() => setShowMaterial(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            <textarea rows="4" placeholder={language === 'ar' ? 'ما هي المواد التي تنقصك الآن؟' : 'De quoi avez-vous besoin ?'} className={`w-full p-4 rounded-xl border-2 outline-none font-bold resize-none mb-6 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 focus:border-purple-500'}`}></textarea>
            <button className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-500/30">
              {language === 'ar' ? 'إرسال الطلب' : 'Envoyer Demande'}
            </button>
          </div>
        </div>
      )}

      {/* 4. نافذة إنذار الطوارئ (Alerte) */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border-2 border-red-500/30 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-red-600 dark:text-red-500">
                <AlertTriangle className="animate-pulse" /> {language === 'ar' ? 'إنذار طوارئ / توقف' : 'Alerte Urgence'}
              </h3>
              <button onClick={() => setShowAlert(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            <textarea rows="3" placeholder={language === 'ar' ? 'صف المشكلة (مثال: عطل في الخلاطة، إصابة عامل، توقف بسبب المطر...)' : 'Décrivez le problème...'} className={`w-full p-4 rounded-xl border-2 outline-none font-bold resize-none mb-4 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-red-500' : 'bg-red-50 border-red-100 focus:border-red-500'}`}></textarea>
            
            <button className={`w-full p-4 mb-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-red-500 hover:border-red-500 transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'}`}>
                <Camera size={24} />
                <span className="text-xs font-bold">{language === 'ar' ? 'صورة للتوثيق (اختياري)' : 'Photo (Optionnel)'}</span>
            </button>

            <button className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
              <AlertTriangle size={18} /> {language === 'ar' ? 'إرسال تنبيه عاجل للمقاول' : 'Envoyer Alerte'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}