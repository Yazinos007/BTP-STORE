import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useProjectStore from '../../store/useProjectStore';
import { 
  HardHat, Camera, UserPlus, Clock, CheckCircle2, 
  AlertCircle, Phone, X, UploadCloud, Loader2, ArrowRight
} from 'lucide-react';

export default function ForemanDashboard() {
  const { isDarkMode, language = 'ar' } = useOutletContext(); 
  const isRtl = language === 'ar';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const { activeProject, projects, setActiveProject, fetchProjects } = useProjectStore();
  
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  
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
      bossMode: "أنت في وضع المعاينة (الميدان)", backToDash: "العودة للوحة القيادة"
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
      bossMode: "Mode Aperçu (Terrain)", backToDash: "Retour au Tableau"
    }
  };

  const t = translations[language] || translations.fr; // استخدام الفرنسية كافتراضي إذا لم تكن العربية محددة

  useEffect(() => {
    fetchProjects();
    const initUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    initUser();
  }, []);

  useEffect(() => {
    if (activeProject) {
      fetchFieldData();
    } else {
      setLoading(false);
    }
  }, [activeProject]);

  const fetchFieldData = async () => {
    setLoading(true);
    const { data: teamData } = await supabase.from('milestone_assignments')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('created_at', { ascending: false });
    if (teamData) setTeam(teamData);

    const { data: reportsData } = await supabase.from('site_reports')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (reportsData) setReports(reportsData);
    setLoading(false);
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

    const fileName = `field_${Date.now()}_${reportForm.file.name}`;
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

  if (loading) return <div className="fixed inset-0 z-[9999] bg-white flex justify-center items-center"><Loader2 className="animate-spin text-amber-500" size={40}/></div>;

  return (
    /* 🚀 السحر هنا: جعلنا الصفحة fixed وتغطي الشاشة بالكامل فوق السيدبار */
    <div className={`fixed inset-0 z-[5000] overflow-y-auto p-4 md:p-8 pb-24 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 شريط العودة للمقاول (يظهر فقط كطوق نجاة للرجوع للسيدبار) */}
      <div className="max-w-md mx-auto mb-4 p-3 bg-slate-900 text-white rounded-2xl flex justify-between items-center font-black text-xs shadow-lg border border-slate-700">
        <span className="flex items-center gap-2"><HardHat className="text-amber-500" size={16}/> {t.bossMode}</span>
        <Link to="/v2/dashboard" className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1">
          {t.backToDash} <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''}/>
        </Link>
      </div>

      <div className="max-w-md mx-auto">
        {/* رأس الصفحة: تصميم ميداني صارم */}
        <div className={`p-6 rounded-[2rem] mb-6 border-2 shadow-lg relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-amber-500/30' : 'bg-amber-500 border-amber-600'}`}>
          <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none"><HardHat size={150} /></div>
          <div className="relative z-10">
            <p className={`text-xs font-black mb-1 ${isDarkMode ? 'text-amber-500' : 'text-amber-900/70'}`}>{t.welcome}</p>
            <h1 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-white'}`}>
              {activeProject ? activeProject.name : t.noProject}
            </h1>
            
            {/* 🚀 تحسين القائمة المنسدلة لتكون واضحة وجذابة */}
            <div className="relative">
              <select 
                value={activeProject?.id || ''} 
                onChange={(e) => setActiveProject(e.target.value)}
                className={`w-full p-4 rounded-xl font-black outline-none appearance-none border-2 transition-all cursor-pointer ${!activeProject ? 'bg-white text-amber-600 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse' : (isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white/20 text-white border-white/40')}`}
              >
                <option value="" disabled>{t.selectProject}</option>
                {projects.map(p => <option key={p.id} value={p.id} className="text-slate-900 bg-white">{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {activeProject && (
          <div className="animate-slide-up">
            {/* 🚀 الأزرار الميدانية السريعة (Action Buttons) */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setIsCameraModalOpen(true)} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-slate-900 border-blue-500/30 hover:border-blue-500' : 'bg-white border-slate-200 shadow-md'}`}>
                <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Camera size={28}/></div>
                <span className={`font-black text-sm text-center ${textTitle}`}>{t.cameraBtn}</span>
              </button>

              <button onClick={() => setIsAssignModalOpen(true)} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-slate-900 border-amber-500/30 hover:border-amber-500' : 'bg-white border-slate-200 shadow-md'}`}>
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center"><UserPlus size={28}/></div>
                <span className={`font-black text-sm text-center ${textTitle}`}>{t.addWorkerBtn}</span>
              </button>
            </div>

            {/* 🚀 قسم الطلبات المعلقة */}
            {team.filter(w => w.status === 'pending').length > 0 && (
              <div className="mb-8">
                <h3 className={`text-sm font-black mb-4 flex items-center gap-2 text-amber-500`}><Clock size={16}/> {t.pendingReq}</h3>
                <div className="space-y-3">
                  {team.filter(w => w.status === 'pending').map(worker => (
                    <div key={worker.id} className={`p-4 rounded-2xl border-2 border-amber-500/30 flex justify-between items-center ${isDarkMode ? 'bg-slate-900/80' : 'bg-amber-50'}`}>
                      <div>
                        <h4 className={`font-bold text-sm ${textTitle}`}>{worker.worker_name}</h4>
                        <p className={`text-xs mt-1 ${textMuted}`}>{worker.role}</p>
                      </div>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-600 rounded-full text-[10px] font-black animate-pulse">
                        ⏳ {t.pending}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🚀 فريق العمل المعتمد في الميدان */}
            <div>
              <h3 className={`text-sm font-black mb-4 flex items-center gap-2 ${textMuted}`}><HardHat size={16}/> {t.myTeam}</h3>
              {team.filter(w => w.status !== 'pending').length === 0 ? (
                <div className={`p-8 text-center rounded-3xl border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <p className="font-bold text-slate-500">{t.noWorkers}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {team.filter(w => w.status !== 'pending').map(worker => (
                    <div key={worker.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={20}/></div>
                        <div>
                          <h4 className={`font-black text-sm ${textTitle}`}>{worker.worker_name}</h4>
                          <p className={`text-xs font-bold ${textMuted} flex items-center gap-1 mt-0.5`}><Phone size={10}/> {worker.worker_phone}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {worker.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 🚀 النوافذ المنبثقة (Modals) مخصصة للموبايل */}
      {/* ============================================================== */}
      
      {/* نافذة طلب حرفي */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[6000] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
              
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 text-xs font-bold flex items-start gap-2 mt-2">
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
        <div className="fixed inset-0 bg-black/90 z-[6000] flex items-center justify-center p-4">
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