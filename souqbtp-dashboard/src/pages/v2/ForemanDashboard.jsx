import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useProjectStore from '../../store/useProjectStore';
import { 
  HardHat, Camera, UserPlus, Clock, CheckCircle2, 
  AlertCircle, Phone, X, UploadCloud, Loader2, ArrowRight
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
    if (!activeProject?.id) return;
    setLoading(true);
    try {
      // 🚀 جلب كافة عمال هذا الورش
      const { data: teamData, error: teamErr } = await supabase
        .from('milestone_assignments')
        .select('*')
        .eq('project_id', activeProject.id)
        .order('created_at', { ascending: false });

      if (!teamErr && teamData) {
        setTeam(teamData);
      }

      // جلب التقارير المصورة
      const { data: reportsData } = await supabase
        .from('site_reports')
        .select('*')
        .eq('project_id', activeProject.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reportsData) setReports(reportsData);
    } catch (e) {
      console.error("Error fetching field data:", e);
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
                value={activeProject?.id || ''} 
                onChange={(e) => setActiveProject(e.target.value)}
                className="w-full p-4 rounded-xl font-black bg-white text-slate-900 border-4 border-amber-300 shadow-xl outline-none cursor-pointer text-sm transition-all focus:border-amber-500 appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23F59E0B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: isRtl ? 'left 1rem top 50%' : 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="" disabled className="text-slate-400 font-normal">{t.selectProject}</option>
                {projects && projects.length > 0 ? (
                  projects.map(p => (
                    <option key={p.id} value={p.id} className="font-bold py-2">
                      🏗️ {p.name} {p.status === 'completed' ? '(أرشيف)' : ''}
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
            {/* الأزرار الميدانية السريعة */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setIsCameraModalOpen(true)} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-slate-900 border-blue-500/30 hover:border-blue-500' : 'bg-white border-slate-200 shadow-sm hover:border-blue-400'}`}>
                <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Camera size={28}/></div>
                <span className={`font-black text-sm text-center ${textTitle}`}>{t.cameraBtn}</span>
              </button>

              <button onClick={() => setIsAssignModalOpen(true)} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-slate-900 border-amber-500/30 hover:border-amber-500' : 'bg-white border-slate-200 shadow-sm hover:border-amber-400'}`}>
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center"><UserPlus size={28}/></div>
                <span className={`font-black text-sm text-center ${textTitle}`}>{t.addWorkerBtn}</span>
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

        {/* قسم فريق العمل الحالي */}
        <div>
          <h3 className={`text-sm font-black mb-3 flex items-center gap-2 ${textMuted}`}>
            <HardHat size={16}/> {t.myTeam}
          </h3>
  
        {/* 🚀 السماح بظهور العمال سواء كانت حالتهم approved أو فارغة null من البيانات السابقة */}
        {team.filter(w => w.status !== 'pending').length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <p className="font-bold text-slate-500 text-sm">{t.noWorkers}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {team.filter(w => w.status !== 'pending').map(worker => (
              <div key={worker.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20}/>
                  </div>
                  <div>
                    <h4 className={`font-black text-sm ${textTitle}`}>{worker.worker_name}</h4>
                    <p className={`text-xs font-bold ${textMuted} flex items-center gap-1 mt-0.5`}>
                      <Phone size={10}/> {worker.worker_phone || '---'}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                  {worker.role || 'Artisan'}
                </span>
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}