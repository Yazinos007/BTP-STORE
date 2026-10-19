import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../../store/useSettingsStore';
import useArchitectStore from '../../../store/useArchitectStore';
import { supabase } from '../../../lib/supabase';
import { 
  FolderOpen, Plus, Archive, X, UploadCloud, Copy, FileText, 
  Trash2, Radar, ShieldCheck, Video, Settings, Save, AlertTriangle
} from 'lucide-react';

const translations = {
  ar: {
    pageTitle: 'الرقابة والمصادقات',
    pageDesc: 'أدر ملفات الورش، طابق المخططات الشفافة، وأصدر محاضر الرقابة الرسمية.',
    newWorkshopBtn: 'فتح ملف ورشة جديد',
    archiveBtn: 'أرشيف المحاضر المنجزة',
    radarTitle: 'رادار الاستشارات (عملاء بانتظار ورشة)',
    startWorkshop: 'تأسيس ورشة ومتابعة',
    loading: 'جاري تحميل البيانات...',
    noProjects: 'لا توجد ملفات رقابة نشطة',
    noProjectsDesc: 'ابدأ باستقبال طلبات العملاء من الرادار، أو افتح ملف ورشة لزبونك الحالي.',
    active: 'أشغال جارية',
    pending: 'قيد المراجعة',
    liveRoom: 'الغرفة',
    externalClient: 'عميل خارجي',
    copyLink: 'نسخ الرابط',
    uploadFiles: 'رفع الملفات',
    report: 'محضر',
    // Modal
    modalNewTitle: 'تأسيس ملف ورشة جديد',
    projectName: 'اسم المشروع / الورشة:',
    clientName: 'اسم العميل (الخارجي أو المسجل):',
    clientPhone: 'رقم هاتف العميل (واتساب):',
    saveStart: 'حفظ وبدء الرقابة',
    cancel: 'إلغاء',
    // Upload Modal
    modalUploadTitle: 'إدارة ملفات بوابة العميل',
    panoImage: 'صورة الرندر (360 درجة) - JPG/PNG:',
    planPdf: 'مخطط الطابق (2D) - PDF:',
    reportPdf: 'محضر الرقابة - PDF:',
    uploadAndSync: 'رفع الملفات وتحديث البوابة',
    // Report Modal
    modalReportTitle: 'صياغة محضر رقابة قانوني',
    stage: 'مرحلة الأشغال الحالية:',
    status: 'حالة الورشة:',
    notes: 'ملاحظات وتوجيهات المهندس:',
    signature: 'التوقيع الرقمي للمهندس / المقاول:',
    legalClause: 'تفعيل الدرع القانوني: إضافة بند يخلي مسؤولية مكتب الدراسات عن أي تعديلات يقوم بها المقاول.',
    generatePdf: 'ختم وإصدار المحضر الرسمي',
    clearSig: 'مسح',
  },
  fr: {
    pageTitle: 'Supervision & Validations',
    pageDesc: 'Gérez les chantiers, superposez les plans et générez les PVs.',
    newWorkshopBtn: 'Nouveau Chantier',
    archiveBtn: 'Archives des PVs',
    radarTitle: 'Radar (Clients en attente)',
    startWorkshop: 'Créer Chantier',
    loading: 'Chargement...',
    noProjects: 'Aucun chantier actif',
    noProjectsDesc: 'Commencez par accepter un client du radar.',
    active: 'En cours',
    pending: 'En révision',
    liveRoom: 'Salle Live',
    externalClient: 'Client Externe',
    copyLink: 'Copier le lien',
    uploadFiles: 'Uploader Fichiers',
    report: 'Générer PV',
    modalNewTitle: 'Nouveau Chantier',
    projectName: 'Nom du Projet:',
    clientName: 'Nom du Client:',
    clientPhone: 'Téléphone (WhatsApp):',
    saveStart: 'Enregistrer et Démarrer',
    cancel: 'Annuler',
    modalUploadTitle: 'Fichiers Portail Client',
    panoImage: 'Image Render (360) - JPG/PNG:',
    planPdf: 'Plan 2D - PDF:',
    reportPdf: 'PV Supervision - PDF:',
    uploadAndSync: 'Uploader et Synchroniser',
    modalReportTitle: 'Générer PV Légal',
    stage: 'Étape actuelle:',
    status: 'Statut du chantier:',
    notes: 'Remarques:',
    signature: 'Signature Numérique:',
    legalClause: 'Clause légale (Dégagement de responsabilité).',
    generatePdf: 'Générer PV',
    clearSig: 'Effacer',
  },
  en: {
    pageTitle: 'Supervision & Validations',
    pageDesc: 'Manage projects, overlay transparent plans, and issue official inspection reports.',
    newWorkshopBtn: 'New Project',
    archiveBtn: 'Completed Reports',
    radarTitle: 'Consultation Radar (Pending Clients)',
    startWorkshop: 'Create & Track',
    loading: 'Loading data...',
    noProjects: 'No active supervision files',
    noProjectsDesc: 'Start by accepting client requests from the radar, or open a new project for a current client.',
    active: 'In Progress',
    pending: 'Under Review',
    liveRoom: 'Live Room',
    externalClient: 'External Client',
    copyLink: 'Copy Link',
    uploadFiles: 'Upload Files',
    report: 'Report',
    // Modal
    modalNewTitle: 'Create New Project',
    projectName: 'Project / Workshop Name:',
    clientName: 'Client Name (External or Registered):',
    clientPhone: 'Client Phone (WhatsApp):',
    saveStart: 'Save & Start Supervision',
    cancel: 'Cancel',
    // Upload Modal
    modalUploadTitle: 'Manage Client Portal Files',
    panoImage: 'Render Image (360) - JPG/PNG:',
    planPdf: 'Floor Plan (2D) - PDF:',
    reportPdf: 'Supervision Report - PDF:',
    uploadAndSync: 'Upload Files & Sync Portal',
    // Report Modal
    modalReportTitle: 'Draft Legal Supervision Report',
    stage: 'Current Work Stage:',
    status: 'Project Status:',
    notes: 'Architect Notes & Guidelines:',
    signature: 'Digital Signature (Architect / Contractor):',
    legalClause: 'Activate Legal Shield: Add a clause disclaiming the design office\'s responsibility for any modifications made by the contractor.',
    generatePdf: 'Seal & Issue Official Report',
    clearSig: 'Clear',
  }
};

export default function ArchitectProjects() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true;
  const { language } = useSettingsStore();
  const isRtl = language === 'ar' || !language;
  const t = translations[language] || translations.ar;
  const navigate = useNavigate();

  const { architectProfile: profile, fetchArchitectData } = useArchitectStore();
  const isVip = profile?.subscription_plan?.toLowerCase() === 'vip';

  // --- States ---
  const [projects, setProjects] = useState([]);
  const [radarClients, setRadarClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals visibility
  const [showNewModal, setShowNewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Forms Data
  const [wsForm, setWsForm] = useState({ id: '', name: '', client: '', phone: '' });
  const [uploadForm, setUploadForm] = useState({ projectId: null, pano: null, plan: null, report: null });
  const [reportForm, setReportForm] = useState({ projectId: null, stage: 'الأساسات والحفر', status: 'مطابقة للمواصفات', notes: '', legal: true });

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // --- Fetch Data ---
  const loadData = async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('architect_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const activeProjects = data.filter(p => p.project_name && p.project_name.trim() !== '');
      
      const seenClients = new Set();
      const radar = [];
      data.forEach(c => {
        const isConsultation = (!c.project_name || c.project_name.trim() === '');
        if (isConsultation && c.client_id && !activeProjects.some(p => p.client_id === c.client_id) && !seenClients.has(c.client_id)) {
          seenClients.add(c.client_id);
          radar.push({ id: c.client_id, name: c.client_name || 'عميل منصة' });
        }
      });

      setProjects(activeProjects);
      setRadarClients(radar);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      // 1. التأكد من وجود بيانات المهندس أولاً
      if (!profile?.id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetchArchitectData(user.id);
        }
      }
      // 2. جلب المشاريع بعد التأكد
      fetchProjects();
    };
    
    initPage();
  }, [profile, fetchArchitectData, fetchProjects]);

  // --- Handlers ---
  const handleAutoFill = async (clientName, clientId) => {
    setWsForm({ id: clientId, name: '⏳ جاري استحضار اسم المشروع...', client: clientName, phone: '' });
    setShowNewModal(true);
    try {
      const { data } = await supabase.from('profiles').select('project_name, project_title').eq('id', clientId).maybeSingle();
      const projName = data?.project_name || data?.project_title || '';
      setWsForm(prev => ({ ...prev, name: projName }));
    } catch (err) {
      setWsForm(prev => ({ ...prev, name: '' }));
    }
  };

  const handleSaveWorkshop = async () => {
    if (!wsForm.name || !wsForm.client) return alert('الرجاء إدخال اسم الورشة والعميل!');
    if (!wsForm.id && !wsForm.phone) return alert('يرجى إدخال رقم هاتف العميل (الواتساب) للربط التلقائي!');

    try {
      let existingConv = null;
      if (wsForm.id) {
        const { data } = await supabase.from('conversations').select('id').eq('architect_id', profile.id).eq('client_id', wsForm.id).limit(1).maybeSingle();
        existingConv = data;
      } else {
        const { data } = await supabase.from('conversations').select('id').eq('architect_id', profile.id).eq('client_phone', wsForm.phone).is('client_id', null).limit(1).maybeSingle();
        existingConv = data;
      }

      const payload = {
        project_name: wsForm.name,
        client_name: wsForm.client,
        client_phone: wsForm.phone,
        status: 'active'
      };

      if (existingConv) {
        await supabase.from('conversations').update(payload).eq('id', existingConv.id);
      } else {
        await supabase.from('conversations').insert([{
          ...payload,
          architect_id: profile.id,
          client_id: wsForm.id || null
        }]);
      }

      setShowNewModal(false);
      setWsForm({ id: '', name: '', client: '', phone: '' });
      loadData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد أنك تريد حذف ملف هذه الورشة بالكامل؟')) return;
    try {
      await supabase.from('conversations').delete().eq('id', id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPortal = async (projectId) => {
    try {
      const { data: existing } = await supabase.from('client_portals').select('access_token').eq('project_id', projectId).limit(1).maybeSingle();
      let finalToken = existing?.access_token;
      
      if (!finalToken) {
        finalToken = 'VIP-' + projectId + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        await supabase.from('client_portals').insert([{ project_id: projectId, architect_id: profile.id, access_token: finalToken }]);
      }

      const portalLink = `${window.location.origin}/client-portal?token=${finalToken}`;
      await navigator.clipboard.writeText(portalLink);
      alert(`تم نسخ الرابط السري بنجاح:\n${portalLink}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadFiles = async () => {
    if (!uploadForm.pano && !uploadForm.plan && !uploadForm.report) return alert('لم تقم باختيار أي ملف للرفع!');
    // Simplified logic for UI representation. In full production, loop over files, upload to 'portal_assets' bucket, get URL, and update 'client_portals' table.
    alert('تم الرفع بنجاح! (محاكاة)');
    setShowUploadModal(false);
  };

  // --- Canvas Signature Logic ---
  const startDrawing = (e) => {
    isDrawing.current = true;
    draw(e);
  };
  const stopDrawing = () => {
    isDrawing.current = false;
    canvasRef.current?.getContext('2d').beginPath();
  };
  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const generatePDF = () => {
    // Requires html2pdf.js to be included in index.html, or we mock it.
    alert('جاري توليد الـ PDF... تأكد من تضمين مكتبة html2pdf.js في المشروع ليعمل الحفظ الفعلي.');
    setShowReportModal(false);
  };

  // --- Styles ---
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-indigo-600" />
          {t.pageTitle}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t.pageDesc}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 items-center">
        <button onClick={() => setShowNewModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-1">
          <Plus size={18} /> {t.newWorkshopBtn}
        </button>
        <button
           onClick={() => navigate('/v2/architect-archive')}
           className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-transform hover:-translate-y-1"
        >
           <Archive size={18} /> {t.archiveBtn}
        </button>
      </div>

      {/* Radar Section */}
      {radarClients.length > 0 && (
        <div className={`p-6 rounded-2xl border-2 border-dashed border-emerald-500/50 ${isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-50'}`}>
          <h4 className="text-emerald-600 font-black text-lg mb-4 flex items-center gap-2">
            <Radar size={20} className="animate-pulse" /> {t.radarTitle}
          </h4>
          <div className="flex flex-wrap gap-4">
            {radarClients.map(client => (
              <div key={client.id} className={`p-4 rounded-xl border w-60 shadow-sm transition-transform hover:-translate-y-1 ${bgMain}`}>
                <div className={`font-bold mb-3 ${textMain}`}>👤 {client.name}</div>
                <button onClick={() => handleAutoFill(client.name, client.id)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                  <Plus size={16} /> {t.startWorkshop}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-purple-500 font-bold animate-pulse text-xl">⏳ {t.loading}</div>
      ) : projects.length === 0 ? (
        <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'}`}>
          <FolderOpen size={64} className="mx-auto text-purple-400 mb-4 opacity-50" />
          <h3 className={`text-2xl font-black mb-2 ${textMain}`}>{t.noProjects}</h3>
          <p className={textMuted}>{t.noProjectsDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {projects.map(proj => (
            <div key={proj.id} className={`rounded-2xl border overflow-hidden shadow-md hover:shadow-xl transition-shadow ${bgMain}`}>
              <div className={`px-5 py-4 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${proj.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  {proj.status === 'active' ? t.active : t.pending}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${textMuted}`}>{new Date(proj.created_at).toLocaleDateString()}</span>
                  <button onClick={() => handleDelete(proj.id)} className="text-rose-500 hover:scale-125 transition-transform"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className={`text-lg font-black mb-1 truncate ${textMain}`}>{proj.project_name}</h3>
                <p className={`text-sm mb-4 truncate ${textMuted}`}>العميل: {proj.client_name || proj.client_id}</p>
                
                <div className="flex flex-wrap gap-2">
                  {proj.client_id ? (
                    <button onClick={() => navigate(`/v2/architect/live-room/${proj.id}`)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Video size={14} /> {t.liveRoom}
                    </button>
                  ) : (
                    <button className="bg-slate-200 text-slate-500 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-not-allowed">
                      <AlertTriangle size={14} /> {t.externalClient}
                    </button>
                  )}
                  
                  <button onClick={() => { setReportForm(p => ({ ...p, projectId: proj.id })); setShowReportModal(true); }} className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 border ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                    <FileText size={14} /> {t.report}
                  </button>

                  {isVip && (
                    <>
                      <button onClick={() => handleCopyPortal(proj.id)} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-900 shadow-sm">
                        <Copy size={14} /> {t.copyLink}
                      </button>
                      <button onClick={() => { setUploadForm(p => ({ ...p, projectId: proj.id })); setShowUploadModal(true); }} className="bg-amber-500 text-slate-900 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-600 shadow-sm">
                        <Settings size={14} /> {t.uploadFiles}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Modals --- */}
      
      {/* 1. New Workshop Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-3 border-slate-200/20">
              <h3 className={`text-xl font-black ${textMain}`}>{t.modalNewTitle}</h3>
              <button onClick={() => setShowNewModal(false)} className="text-rose-500 hover:scale-110"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${textMuted}`}>{t.projectName}</label>
                <input type="text" value={wsForm.name} onChange={e => setWsForm({...wsForm, name: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${textMuted}`}>{t.clientName}</label>
                <input type="text" value={wsForm.client} onChange={e => setWsForm({...wsForm, client: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-emerald-500">{t.clientPhone}</label>
                <input type="tel" value={wsForm.phone} onChange={e => setWsForm({...wsForm, phone: e.target.value})} className={`w-full p-3 rounded-xl border-2 border-dashed outline-none ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/50 text-white' : 'bg-emerald-50 border-emerald-500'}`} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSaveWorkshop} className="flex-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl shadow-lg">{t.saveStart}</button>
                <button onClick={() => setShowNewModal(false)} className={`flex-1 w-full font-black py-3 rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{t.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Upload Portal Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-800 border-slate-600'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-3 border-slate-700">
              <h3 className="text-xl font-black text-amber-400">{t.modalUploadTitle}</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-rose-500 hover:scale-110"><X size={24} /></button>
            </div>
            <div className="space-y-4 text-white">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-slate-300">{t.panoImage}</label>
                <input type="file" accept="image/*" onChange={e => setUploadForm({...uploadForm, pano: e.target.files[0]})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-slate-300">{t.planPdf}</label>
                <input type="file" accept=".pdf" onChange={e => setUploadForm({...uploadForm, plan: e.target.files[0]})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-slate-300">{t.reportPdf}</label>
                <input type="file" accept=".pdf" onChange={e => setUploadForm({...uploadForm, report: e.target.files[0]})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-sm mb-4" />
              </div>
              <button onClick={handleUploadFiles} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-black py-3 rounded-xl shadow-lg flex justify-center items-center gap-2">
                <UploadCloud size={20} /> {t.uploadAndSync}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Report Generator Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 border-t-4 border-t-rose-600 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200/20">
              <h3 className={`text-xl font-black flex items-center gap-2 ${textMain}`}><ShieldCheck className="text-rose-600"/> {t.modalReportTitle}</h3>
              <button onClick={() => setShowReportModal(false)} className="text-rose-500 hover:scale-110"><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.stage}</label>
                <select value={reportForm.stage} onChange={e => setReportForm({...reportForm, stage: e.target.value})} className={`w-full p-2.5 rounded-lg border outline-none text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}>
                  <option>الأساسات والحفر</option>
                  <option>صب الخرسانة والأعمدة</option>
                  <option>بناء الجدران والتقسيم</option>
                  <option>التشطيبات والتجهيز</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.status}</label>
                <select value={reportForm.status} onChange={e => setReportForm({...reportForm, status: e.target.value})} className={`w-full p-2.5 rounded-lg border outline-none text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}>
                  <option>مطابقة للمواصفات</option>
                  <option>مخالفات بسيطة</option>
                  <option>توقيف الأشغال</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.notes}</label>
              <textarea rows="3" value={reportForm.notes} onChange={e => setReportForm({...reportForm, notes: e.target.value})} className={`w-full p-3 rounded-lg border outline-none text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}></textarea>
            </div>

            <div className="mb-4">
              <label className={`block text-xs font-bold mb-1 ${textMuted}`}>{t.signature}</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-white h-32 overflow-hidden">
                <canvas 
                  ref={canvasRef} 
                  width={500} 
                  height={150} 
                  className="w-full h-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
                  onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                ></canvas>
                <button onClick={clearSignature} className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded shadow">{t.clearSig}</button>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg mb-6">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={reportForm.legal} onChange={e => setReportForm({...reportForm, legal: e.target.checked})} className="mt-1" />
                <span className="text-xs text-rose-900 font-bold leading-relaxed">{t.legalClause}</span>
              </label>
            </div>

            <button onClick={generatePDF} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl shadow-lg flex justify-center items-center gap-2">
              <FileText size={20} /> {t.generatePdf}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}