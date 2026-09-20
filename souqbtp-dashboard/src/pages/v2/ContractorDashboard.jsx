import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useOutletContext } from 'react-router-dom';
import useSupplierStore from '../../store/useSupplierStore';
import { 
  Calculator, Star, MessageCircle, Briefcase, Camera, Wallet, 
  FolderOpen, LifeBuoy, CheckCircle2, AlertCircle, Upload, 
  Trash2, FileText, FileImage, FileSignature, Receipt, ChevronRight, ChevronLeft
} from 'lucide-react';

export default function ContractorDashboard() {
  const { isDarkMode, language = 'ar' } = useOutletContext(); 
  const isRtl = language === 'ar';

  // 🚀 استدعاء المخزن المركزي لتوحيد البيانات مع البروفايل
  const { supplier, updateProfile } = useSupplierStore();

  const [loading, setLoading] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  const [user, setUser] = useState(null);
  
  // 🚀 حالة الأرقام الحقيقية (الهدف)
  const [stats, setStats] = useState({ progress: 0, completed: 0, remaining: 0, total: 0 });
  const [stageProgress, setStageProgress] = useState([]); 

  // 🚀 حالة الأرقام المتحركة (التي تبدأ من الصفر وتتصاعد للواجهة)
  const [displayStats, setDisplayStats] = useState({ progress: 0, completed: 0, remaining: 0 });
  const [displayStages, setDisplayStages] = useState([
    { id: 1, percent: 0, completed: 0, total: 0, color: '#3b82f6', icon: '📝' },
    { id: 2, percent: 0, completed: 0, total: 0, color: '#f97316', icon: '🏗️' },
    { id: 3, percent: 0, completed: 0, total: 0, color: '#a855f7', icon: '🎨' },
    { id: 4, percent: 0, completed: 0, total: 0, color: '#22c55e', icon: '📜' }
  ]);

  const [profile, setProfile] = useState({ store_name: '', phone: '', address: '' });

  useEffect(() => {
    if (supplier) {
      setProfile({
        store_name: supplier.store_name || '',
        phone: supplier.phone || '',
        address: supplier.address || '' // 🚀 استبدال المدينة والورش بالعنوان
      });
    }
  }, [supplier]);

  const [conversations, setConversations] = useState([]);
  const [onlineProviders, setOnlineProviders] = useState([]);
  const [team, setTeam] = useState([]);
  const [reports, setReports] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docCategory, setDocCategory] = useState('رخصة بناء');
  const [budget, setBudget] = useState({ total: 0, spent: 0, isCalculated: false });
  const [appointments, setAppointments] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const translations = {
    ar: {
      pageTitle: "إدارة الأوراش والميدان",
      calcBtn: "الحاسبة الذكية لتكاليف الورش",
      rateBtn: "تقييم الحرفيين",
      projectPathBtn: "مسار الورش",
      inboxTitle: "صندوق الرسائل",
      onlineStatus: "متصل - يوجد",
      available: "متاحين",
      noChats: "📭 لا توجد محادثات حتى الآن.",
      voiceMsg: "🎤 رسالة صوتية",
      chatStarted: "بدأت المحادثة",
      enterChat: "دخول للمحادثة",
      camTitle: "كاميرا الورشة وتقارير الميدان",
      camSub: "أحدث اللقطات من ميدان الورش",
      liveBtn: "طلب بث مباشر من الورشة",
      noReports: "لا توجد لقطات حديثة من الورشة.",
      interactiveShot: "لقطة ميدانية تفاعلية من الورش",
      souqTeam: "فريق SouqBTP",
      budgetTitle: "💰 ميزانية الورش الإجمالية",
      pdfBtn: "تحميل PDF",
      waBtn: "مشاركة واتساب",
      editBudgetBtn: "تعديل الميزانية",
      noBudget: "لم تقم بحساب الميزانية بعد. ابدأ الآن لمعرفة تكلفة مشروعك.",
      budgetCalculated: "التكلفة التقديرية للمشروع:",
      progTitle: "تقدم المشروع",
      tasksDone: "المهام المنجزة",
      tasksLeft: "المهام المتبقية",
      compData: "بيانات المقاولة",
      compName: "اسم الشركة",
      phone: "رقم الهاتف",
      city: "المدينة",
      currentSite: "الورش الحالي",
      saveBtn: "💾 حفظ التغييرات",
      statsTitle: "إحصائيات تفصيلية",
      progByStage: "التقدم حسب المرحلة:",
      stageNames: { 1: "التخطيط", 2: "التنفيذ", 3: "التشطيب", 4: "التحفيظ" },
      taskUnit: "مهمة",
      teamTitle: "فريق عمل الورش",
      noTeam: "لم تقم بتعيين أي فريق عمل حتى الآن.",
      master: "معلم",
      vaultTitle: "خزانة مستندات الورش",
      uploadBtn: "رفع مستند",
      uploading: "جاري الرفع...",
      emptyVault: "الخزانة فارغة.",
      radarTitle: "رادار الميزانية",
      spent: "الفعلي:",
      estimated: "المقدر:",
      currency: "درهم",
      radarGood: "الميزانية في حالة جيدة",
      radarWarning: "انتبه، اقتربت من السقف!",
      radarDanger: "تحذير: تجاوزت الميزانية!",
      sosBtn: "استغاثة تقنية",
      sosTitle: "طلب تدخل خبير تقني",
      issueTitle: "عنوان المشكلة",
      sosUrgent: "🔴 عاجل جداً (توقف العمل)",
      sosNormal: "🟢 استشارة فنية",
      sosDetails: "التفاصيل...",
      sosSend: "إرسال النداء",
      cancel: "إلغاء",
      loading: "جاري تجهيز مكتبك الميداني...",
      days: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
    },
    fr: {
      pageTitle: "Gestion des Chantiers",
      calcBtn: "Calculateur Intelligent",
      rateBtn: "Évaluation Artisans",
      projectPathBtn: "Parcours du Projet",
      inboxTitle: "Boîte de Réception",
      onlineStatus: "En ligne -",
      available: "disponibles",
      noChats: "📭 Aucune conversation.",
      voiceMsg: "🎤 Message vocal",
      chatStarted: "Conversation démarrée",
      enterChat: "Accéder",
      camTitle: "Caméra & Rapports",
      camSub: "Dernières captures du chantier",
      liveBtn: "Demander le Direct",
      noReports: "Aucune capture récente.",
      interactiveShot: "Capture de terrain interactive",
      souqTeam: "Équipe SouqBTP",
      budgetTitle: "💰 Budget Global",
      pdfBtn: "Télécharger PDF",
      waBtn: "Partager WhatsApp",
      editBudgetBtn: "Modifier le Budget",
      noBudget: "Budget non calculé. Commencez l'estimation de votre projet.",
      budgetCalculated: "Coût estimé du projet :",
      progTitle: "Progression du Projet",
      tasksDone: "Tâches Terminées",
      tasksLeft: "Tâches Restantes",
      compData: "Données de l'Entreprise",
      compName: "Nom de l'entreprise",
      phone: "Téléphone",
      city: "Ville",
      currentSite: "Chantier actuel",
      saveBtn: "💾 Enregistrer",
      statsTitle: "Statistiques Détaillées",
      progByStage: "Progression par étape :",
      stageNames: { 1: "Planification", 2: "Exécution", 3: "Finition", 4: "Enregistrement" },
      taskUnit: "tâche(s)",
      teamTitle: "Équipe du Chantier",
      noTeam: "Aucune équipe assignée.",
      master: "Artisan",
      vaultTitle: "Armoire à Documents",
      uploadBtn: "Téléverser",
      uploading: "En cours...",
      emptyVault: "L'armoire est vide.",
      radarTitle: "Radar du Budget",
      spent: "Dépensé :",
      estimated: "Estimé :",
      currency: "MAD",
      radarGood: "Budget sous contrôle",
      radarWarning: "Attention, plafond proche !",
      radarDanger: "Alerte : Dépassement de budget !",
      sosBtn: "Alerte Technique",
      sosTitle: "Demande d'Intervention",
      issueTitle: "Titre du problème",
      sosUrgent: "🔴 Très urgent (Arrêt)",
      sosNormal: "🟢 Consultation technique",
      sosDetails: "Détails...",
      sosSend: "Envoyer l'alerte",
      cancel: "Annuler",
      loading: "Préparation de votre bureau...",
      days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    },
    en: {
      pageTitle: "Site Management",
      calcBtn: "Smart Cost Calculator",
      rateBtn: "Artisan Ratings",
      projectPathBtn: "Project Path",
      inboxTitle: "Inbox",
      onlineStatus: "Online -",
      available: "available",
      noChats: "📭 No conversations yet.",
      voiceMsg: "🎤 Voice message",
      chatStarted: "Conversation started",
      enterChat: "Enter Chat",
      camTitle: "Site Camera & Reports",
      camSub: "Latest shots from the field",
      liveBtn: "Request Live Broadcast",
      noReports: "No recent shots.",
      interactiveShot: "Interactive field shot",
      souqTeam: "SouqBTP Team",
      budgetTitle: "💰 Total Site Budget",
      pdfBtn: "Download PDF",
      waBtn: "Share via WhatsApp",
      editBudgetBtn: "Edit Budget",
      noBudget: "Budget not calculated. Start your project estimation now.",
      budgetCalculated: "Estimated Project Cost:",
      progTitle: "Project Progress",
      tasksDone: "Completed Tasks",
      tasksLeft: "Remaining Tasks",
      compData: "Company Data",
      compName: "Company Name",
      phone: "Phone Number",
      city: "City",
      currentSite: "Current Site",
      saveBtn: "💾 Save Changes",
      statsTitle: "Detailed Statistics",
      progByStage: "Progress by Stage:",
      stageNames: { 1: "Planning", 2: "Execution", 3: "Finishing", 4: "Registration" },
      taskUnit: "task(s)",
      teamTitle: "Site Team",
      noTeam: "No team assigned yet.",
      master: "Master",
      vaultTitle: "Documents Vault",
      uploadBtn: "Upload Doc",
      uploading: "Uploading...",
      emptyVault: "Vault is empty.",
      radarTitle: "Budget Radar",
      spent: "Spent:",
      estimated: "Estimated:",
      currency: "MAD",
      radarGood: "Budget is healthy",
      radarWarning: "Warning: Approaching limit!",
      radarDanger: "Danger: Budget exceeded!",
      sosBtn: "Technical SOS",
      sosTitle: "Technical Support Request",
      issueTitle: "Issue Title",
      sosUrgent: "🔴 Very Urgent (Stopped)",
      sosNormal: "🟢 Consultation",
      sosDetails: "Details...",
      sosSend: "Send Alert",
      cancel: "Cancel",
      loading: "Preparing your office...",
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  };

  const t = translations[language] || translations.ar;

  const categoryOptions = {
    ar: ['رخصة بناء', 'تصميم هندسي', 'فاتورة / توصيل', 'عقد عمل', 'أخرى'],
    fr: ['Permis de construire', 'Conception architecturale', 'Facture / Livraison', 'Contrat de travail', 'Autre'],
    en: ['Building permit', 'Architectural design', 'Invoice / Delivery', 'Work contract', 'Other']
  };

  const cardClass = `relative z-10 rounded-3xl p-6 transition-all duration-500 transform hover:-translate-y-2 border-2 ${
    isDarkMode 
      ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/50 text-slate-200 shadow-xl hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] hover:border-blue-500' 
      : 'bg-white/90 backdrop-blur-xl border-white text-slate-800 shadow-lg hover:shadow-[0_0_35px_rgba(59,130,246,0.4)] hover:border-blue-400'
  }`;

  // 🚀 1. الأنيميشن الذكي: لا يعمل إلا بعد وصول البيانات الحقيقية
  useEffect(() => {
    if (!startAnimation) return;

    const duration = 1500; 
    const intervalTime = 30; 
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progressRatio = Math.min(currentStep / steps, 1);

      setDisplayStats({
        progress: Math.round(stats.progress * progressRatio),
        completed: Math.round(stats.completed * progressRatio),
        remaining: Math.round(stats.remaining * progressRatio),
      });

      if (stageProgress.length > 0) {
        setDisplayStages(stageProgress.map(stage => ({
          ...stage,
          percent: Math.round(stage.percent * progressRatio),
          completed: Math.round(stage.completed * progressRatio)
        })));
      }
      
      if (currentStep >= steps) clearInterval(timer);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [startAnimation, stats, stageProgress]);

  // 🚀 2. تأثير الحضور اللحظي (مفصول تماماً لمنع أي أخطاء عند الرجوع للصفحة)
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('global_radar_room');
    
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const onlineIds = [];
      for (const key in state) {
        if (state[key][0]?.type === 'provider') onlineIds.push(state[key][0].id.toString());
      }
      setOnlineProviders(onlineIds);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ type: 'client', id: user.id });
    });

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // 🚀 3. جلب البيانات المحمي من الأخطاء
  useEffect(() => {
    let isMounted = true;
    const initializeDashboard = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      await fetchDashboardData(session?.user || null, isMounted);
    };

    initializeDashboard();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) fetchDashboardData(session?.user || null, isMounted);
    });

    return () => { 
      isMounted = false;
      if(authListener) authListener.subscription.unsubscribe(); 
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); 

  const fetchDashboardData = async (currentUser, isMounted) => {
    try {
      const defaultTotals = { 1: 9, 2: 11, 3: 4, 4: 4 };
      
      let syncedStages = [
        { id: 1, icon: '📝', color: '#3b82f6', percent: 0, completed: 0, total: 9 },
        { id: 2, icon: '🏗️', color: '#f97316', percent: 0, completed: 0, total: 11 },
        { id: 3, icon: '🎨', color: '#a855f7', percent: 0, completed: 0, total: 4 },
        { id: 4, icon: '📜', color: '#22c55e', percent: 0, completed: 0, total: 4 }
      ];
      
      let syncedStats = { progress: 0, completed: 0, remaining: 0, total: 28 };
      let currentBudget = { total: 0, spent: 0, isCalculated: false };

      if (currentUser) {
        if (isMounted) setUser(currentUser);

        const [servicesRes, checklistsRes, progressRes, profileRes] = await Promise.all([
          supabase.from('services').select('id, stage_id'),
          supabase.from('checklists').select('id, service_id'),
          supabase.from('user_progress').select('task_id').eq('user_id', currentUser.id),
          supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle() // 🚀 استخدام maybeSingle لتجنب الأعطال
        ]);

        if (profileRes.data && isMounted) setProfile(profileRes.data);

        const services = servicesRes.data || [];
        const checklists = checklistsRes.data || [];
        const userProgress = progressRes.data?.map(p => p.task_id) || [];

        syncedStages = [1, 2, 3, 4].map(stageId => {
          const stageServices = services.filter(s => s.stage_id === stageId).map(s => s.id);
          const stageTasks = checklists.filter(t => stageServices.includes(t.service_id));
          const stageTotal = stageTasks.length > 0 ? stageTasks.length : defaultTotals[stageId];
          
          const stageTaskIds = stageTasks.map(t => t.id);
          const stageCompleted = userProgress.filter(id => stageTaskIds.includes(id)).length;
          
          return {
            id: stageId,
            icon: syncedStages.find(s=>s.id === stageId).icon,
            color: syncedStages.find(s=>s.id === stageId).color,
            completed: stageCompleted,
            total: stageTotal,
            percent: stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0
          };
        });

        const totalOverallTasks = syncedStages.reduce((acc, stage) => acc + stage.total, 0) || 28;
        const totalCompletedTasks = syncedStages.reduce((acc, stage) => acc + stage.completed, 0);
        
        syncedStats = {
          progress: totalOverallTasks > 0 ? Math.round((totalCompletedTasks / totalOverallTasks) * 100) : 0,
          completed: totalCompletedTasks,
          remaining: Math.max(0, totalOverallTasks - totalCompletedTasks),
          total: totalOverallTasks
        };

        const { data: estimate } = await supabase.from('user_estimates').select('total_cost, total_budget').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        const { data: expenses } = await supabase.from('project_expenses').select('amount').eq('user_id', currentUser.id);
        
        const estBudget = estimate ? parseFloat(estimate.total_cost || estimate.total_budget || 0) : 0;
        const totalSpent = expenses ? expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) : 0;
        
        currentBudget = { total: estBudget, spent: totalSpent, isCalculated: estBudget > 0 };

        const { data: convos } = await supabase.from('conversations').select('id, provider_id, architect_id').eq('client_id', currentUser.id);
        if (convos && isMounted) {
          const convosWithDetails = await Promise.all(convos.map(async (c) => {
            let name = 'غير معروف', icon = '👤', partnerId = null;
            if (c.architect_id) {
              const { data: arch } = await supabase.from('architects').select('full_name, agency_name').eq('id', c.architect_id).maybeSingle();
              name = arch ? `${arch.full_name} (${arch.agency_name || 'مهندس'})` : 'مهندس';
              partnerId = c.architect_id; icon = '📐';
            } else if (c.provider_id) {
              const { data: prov } = await supabase.from('providers').select('full_name').eq('id', c.provider_id).maybeSingle();
              name = prov ? prov.full_name : t.master;
              partnerId = c.provider_id; icon = '👷';
            }
            const { data: msgs } = await supabase.from('messages').select('content, created_at, sender_type').eq('conversation_id', c.id).is('deleted_by_client', false).order('created_at', { ascending: false }).limit(1);
            const { count: unread } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('conversation_id', c.id).eq('sender_type', 'provider').is('is_read', false);
            return { ...c, partnerName: name, partnerId, icon, lastMsg: msgs?.[0], unread: unread || 0 };
          }));
          setConversations(convosWithDetails);
        }

        const { data: teamData } = await supabase.from('milestone_assignments').select('*').eq('user_id', currentUser.id).order('stage_id', { ascending: true });
        if (teamData && isMounted) setTeam(teamData);

        const { data: reportsData } = await supabase.from('site_reports').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(10);
        if (reportsData && isMounted) setReports(reportsData);

        const { data: docsData } = await supabase.from('project_documents').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
        if (docsData && isMounted) setDocuments(docsData);

        const { data: appsData } = await supabase.from('appointments').select('*, services(name), providers(full_name)').eq('user_id', currentUser.id);
        if (appsData && isMounted) setAppointments(appsData);
        
      } else {
        // حالة الزائر
        syncedStages = [
          { id: 1, icon: '📝', color: '#3b82f6', percent: 100, completed: 9, total: 9 },
          { id: 2, icon: '🏗️', color: '#f97316', percent: 64, completed: 7, total: 11 },
          { id: 3, icon: '🎨', color: '#a855f7', percent: 0, completed: 0, total: 4 },
          { id: 4, icon: '📜', color: '#22c55e', percent: 0, completed: 0, total: 4 }
        ];
        syncedStats = { progress: 57, completed: 16, remaining: 12, total: 28 };
        currentBudget = { total: 320500, spent: 145000, isCalculated: true }; 
      }

      if (isMounted) {
        setStageProgress(syncedStages);
        setStats(syncedStats);
        setBudget(currentBudget);
      }

    } catch (error) {
      console.error("Critical error in fetchDashboardData:", error);
    } finally {
      // 🚀 إطلاق الأنيميشن في النهاية بأمان
      if (isMounted) {
        setLoading(false);
        setTimeout(() => setStartAnimation(true), 50); 
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if(!supplier) return;
    setSaveStatus('loading');
    try {
      if (updateProfile) {
        // 🚀 إرسال الحقول الصحيحة المطابقة لقاعدة البيانات
        await updateProfile({
          store_name: profile.store_name,
          phone: profile.phone,
          address: profile.address 
        });
      }
      setSaveStatus('success');
      alert(t.saveBtn + ' ✅');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) { 
      setSaveStatus('error'); 
      setTimeout(() => setSaveStatus(null), 3000); 
    }
  };

  const handleDocumentUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    setUploadingDoc(true);
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Math.random().toString(36).substring(2, 10)}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, file);
      if (uploadError) continue;
      
      const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('project_documents').insert([{ 
        user_id: user.id, file_name: file.name, file_url: urlData.publicUrl, category: docCategory 
      }]);
      if (!dbError) successCount++;
    }
    
    if (successCount > 0) {
      const { data } = await supabase.from('project_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setDocuments(data || []);
    }
    setUploadingDoc(false);
  };

  const deleteDocument = async (id) => {
    if (!confirm('⚠️ هل أنت متأكد أنك تريد حذف هذا المستند نهائياً؟')) return;
    await supabase.from('project_documents').delete().eq('id', id);
    setDocuments(documents.filter(d => d.id !== id));
  };

  const deleteSiteReport = async (id) => {
    if (!confirm('⚠️ هل أنت متأكد أنك تريد حذف هذه اللقطة الميدانية نهائياً؟')) return;
    await supabase.from('site_reports').delete().eq('id', id);
    setReports(reports.filter(r => r.id !== id));
  };

  const changeMonth = (offset) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarDate(newDate);
  };

  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="min-h-[60px]"></div>);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayApps = appointments.filter(a => a.appointment_date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      days.push(
        <div key={i} className={`min-h-[60px] p-1 md:p-2 border rounded-xl transition-all ${
          isToday ? 'bg-orange-500/20 border-orange-400 text-orange-400 shadow-inner' : isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <span className="text-sm font-bold">{i}</span>
          <div className="mt-1 space-y-1">
            {dayApps.map(app => (
              <div key={app.id} className={`text-[10px] p-1 rounded-md truncate ${app.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`} title={app.notes}>
                👷 {app.providers?.full_name || t.master}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  if (loading) return (
    <div className={`flex flex-col items-center justify-center h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#e0f2e9]'} gap-4 transition-colors duration-700`}>
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className={`font-bold text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{t.loading}</p>
    </div>
  );

  const budgetPercent = budget.total > 0 ? Math.min((budget.spent / budget.total) * 100, 100) : 0;
  let radarColor = "from-emerald-400 to-emerald-600";
  let radarStatus = t.radarGood;
  let radarStatusColor = "text-emerald-500";

  if (budgetPercent >= 95) {
    radarColor = "from-red-500 to-red-700 animate-pulse";
    radarStatus = t.radarDanger;
    radarStatusColor = "text-red-500 font-black animate-pulse";
  } else if (budgetPercent >= 75) {
    radarColor = "from-amber-400 to-orange-500";
    radarStatus = t.radarWarning;
    radarStatusColor = "text-orange-500";
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-700 relative overflow-hidden ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#eef8f2]'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      <div className={`absolute inset-0 z-0 opacity-20 pointer-events-none ${isDarkMode ? 'bg-[radial-gradient(#475569_1px,transparent_1px)]' : 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)]'}`} style={{ backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-8 animate-fade-in pb-24">
        
        <div className="mb-4">
          <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white drop-shadow-md' : 'text-[#0f3b25] drop-shadow-sm'}`}>{t.pageTitle}</h1>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Link to="/v2/cost-calculator" className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-lg border-2 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/90 border-white text-slate-800 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md'}`}>
            <Calculator className="text-blue-500" size={24} /> {t.calcBtn}
          </Link>
          <Link to="/v2/project-path" className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-lg border-2 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/90 border-white text-slate-800 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md'}`}>
            <FolderOpen className="text-orange-500" size={24} /> {t.projectPathBtn}
          </Link>
        </div>

        {/* 🚀 البطاقات الثلاث الإحصائية في القمة مع العداد المتصاعد */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-[0_10px_30px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center transform transition-transform duration-300 hover:-translate-y-3 border border-white/10">
            <span className="text-sm font-bold opacity-90 mb-2">{t.progTitle}</span>
            <span className="text-6xl font-black drop-shadow-md">{displayStats.progress}%</span>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-8 text-white shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex flex-col items-center justify-center transform transition-transform duration-300 hover:-translate-y-3 border border-white/10">
            <span className="text-sm font-bold opacity-90 mb-2">{t.tasksDone}</span>
            <span className="text-6xl font-black drop-shadow-md">{displayStats.completed}</span>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl p-8 text-white shadow-[0_10px_30px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center transform transition-transform duration-300 hover:-translate-y-3 border border-white/10">
            <span className="text-sm font-bold opacity-90 mb-2">{t.tasksLeft}</span>
            <span className="text-6xl font-black drop-shadow-md">{displayStats.remaining}</span>
          </div>
        </div>

        {/* 🚀 منطقة الإحصائيات التفصيلية (الدوائر الأربع النابضة) تحتها مباشرة */}
        <div className={`${cardClass} mb-6`}>
          <h2 className="text-xl font-black mb-2 flex items-center gap-2">📊 {t.statsTitle}</h2>
          <p className={`font-bold mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t.progByStage}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayStages.map(stage => (
              <div key={stage.id} className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center justify-center group ${isDarkMode ? 'bg-slate-900/50 border-slate-700 shadow-inner' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="font-bold mb-4 text-lg flex items-center gap-2 justify-center">
                  {t.stageNames[stage.id]} {stage.icon}
                </div>
                
                <div 
                  className="relative w-32 h-32 rounded-full flex items-center justify-center mb-4 shadow-inner group-hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow duration-500" 
                  style={{ background: `conic-gradient(${stage.color} ${stage.percent}%, ${isDarkMode ? '#1e293b' : '#f1f5f9'} ${stage.percent}%)` }}
                >
                  <div className={`absolute rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`} style={{ width: '82%', height: '82%' }}>
                    <span className="text-2xl font-black animate-pulse" style={{ color: stage.color }}>{stage.percent}%</span>
                  </div>
                </div>
                
                <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {stage.completed} / {stage.total} {t.taskUnit}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={cardClass}>
            <h2 className="text-xl font-black flex items-center gap-2 mb-6 pb-4 border-b border-slate-200/20"><Briefcase className="text-blue-500" /> {t.compData}</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <input type="text" placeholder={t.compName} value={profile.store_name || ''} onChange={e => setProfile({...profile, store_name: e.target.value})} className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
              
              <input type="tel" placeholder={t.phone} value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
              
              {/* 🚀 حقل العنوان الموحد بدلاً من المدينة والورش */}
              <input type="text" placeholder={language === 'ar' ? 'العنوان' : language === 'fr' ? 'Adresse' : 'Address'} value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
              
              <button type="submit" disabled={saveStatus === 'loading'} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1">
                {saveStatus === 'loading' ? '⏳...' : t.saveBtn}
              </button>
            </form>
          </div>

          <div className={`${cardClass} border-t-4 border-t-blue-500 overflow-hidden`}>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200/20">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2"><Camera className="text-blue-500" /> {t.camTitle}</h2>
                <p className={`text-sm mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.camSub}</p>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all hover:scale-105">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span> {t.liveBtn}
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar snap-x">
              {reports.length === 0 ? (
                <div className={`w-full text-center py-10 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-900/50' : 'border-slate-300 text-slate-500 bg-white/50'}`}>{t.noReports}</div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className={`min-w-[260px] rounded-xl overflow-hidden snap-start relative group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200 shadow-md'}`}>
                    <button onClick={(e) => { e.stopPropagation(); deleteSiteReport(r.id); }} className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10 backdrop-blur-sm`}>
                      <Trash2 size={16}/>
                    </button>
                    <div className="relative h-40 bg-black" onClick={() => window.open(r.image_url, '_blank')}>
                      <img src={r.image_url} alt="report" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                      <span className={`absolute bottom-2 ${isRtl ? 'right-2' : 'left-2'} text-white text-[11px] font-bold`}>
                        🕒 {new Date(r.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="p-4" onClick={() => window.open(r.image_url, '_blank')}>
                      <p className={`text-sm font-bold truncate mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} title={r.description}>{r.description || t.interactiveShot}</p>
                      <p className="text-[11px] text-amber-500 font-bold flex items-center gap-1">👷 {r.provider_name || t.souqTeam}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={`${cardClass} border-t-4 border-t-blue-500`}>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <h2 className="text-xl font-black flex items-center gap-2"><MessageCircle className="text-blue-500" /> {t.inboxTitle}</h2>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> {t.onlineStatus} ({onlineProviders.length}) {t.available}
            </span>
          </div>
          <div className="overflow-x-auto">
            {conversations.length === 0 ? (
              <div className={`text-center py-10 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-900/50' : 'border-slate-300 text-slate-500 bg-white/50'}`}>{t.noChats}</div>
            ) : (
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} border-collapse`}>
                <tbody>
                  {conversations.map(c => {
                    const isOnline = onlineProviders.includes(c.partnerId?.toString());
                    const msgText = c.lastMsg?.content?.startsWith('AUDIO_MSG') ? t.voiceMsg : (c.lastMsg?.content || t.chatStarted);
                    const token = Array.from(c.id.toString()).map(ch => ch.charCodeAt(0).toString(16)).join('');
                    return (
                      <tr key={c.id} className={`border-b transition-colors ${isDarkMode ? 'border-slate-700/50 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'} ${c.unread > 0 ? (isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50/70') : ''}`}>
                        <td className="p-4 font-bold flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`}></span>
                          {c.icon} {c.partnerName}
                          {c.unread > 0 && <span className={`bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-lg ${isRtl ? 'mr-2' : 'ml-2'}`}>{c.unread}</span>}
                        </td>
                        <td className={`p-4 text-sm max-w-[200px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{msgText}</td>
                        <td className={`p-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                          <Link to={`/v2/chat/${token}`} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/30">{t.enterChat}</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
            <h2 className="text-xl font-black flex items-center gap-2">{t.budgetTitle}</h2>
            <div className="flex gap-2 flex-wrap">
              <button className="bg-[#e74c3c] hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all hover:-translate-y-1">
                <FileText size={18} /> {t.pdfBtn}
              </button>
              <button className="bg-[#25D366] hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-1">
                📲 {t.waBtn}
              </button>
              <Link to="/v2/cost-calculator" className={`px-5 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-1 ${isDarkMode ? 'border border-slate-600 hover:bg-slate-700 text-slate-200' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'}`}>
                {t.editBudgetBtn}
              </Link>
            </div>
          </div>
          
          {!budget.isCalculated ? (
             <div className={`text-center py-8 rounded-xl mt-4 border border-dashed flex flex-col items-center justify-center gap-4 ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-300 bg-blue-50/50'}`}>
               <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t.noBudget}</p>
               <Link to="/v2/cost-calculator" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-black shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-1">
                 {t.calcBtn}
               </Link>
             </div>
          ) : (
            <div className={`text-center py-6 rounded-xl mt-4 border-2 ${isDarkMode ? 'bg-slate-900/50 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'}`}>
              <p className="font-bold text-slate-500 mb-1">{t.budgetCalculated}</p>
              <div className="font-black text-3xl text-emerald-600 drop-shadow-sm">{budget.total.toLocaleString()} {t.currency}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/20">
              <h2 className="text-xl font-black flex items-center gap-2"><Wallet className="text-blue-500" /> {t.radarTitle}</h2>
              {budget.isCalculated && (
                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${radarStatusColor} ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                  {radarStatus}
                </span>
              )}
            </div>
            
            {!budget.isCalculated ? (
               <div className={`text-center py-8 rounded-xl border border-dashed flex flex-col items-center justify-center gap-3 ${isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-900/50' : 'border-slate-300 text-slate-500 bg-slate-50/50'}`}>
                 <p className="font-bold">{t.noBudget}</p>
                 <Link to="/v2/cost-calculator" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md">
                   {t.calcBtn}
                 </Link>
               </div>
            ) : (
              <div className={`p-6 rounded-2xl border-2 mb-6 ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between font-bold mb-4 text-lg">
                  <span>{t.spent} <span className="text-orange-500 drop-shadow-sm">{budget.spent.toLocaleString()}</span> {t.currency}</span>
                  <span>{t.estimated} <span className="text-blue-500 drop-shadow-sm">{budget.total.toLocaleString()}</span> {t.currency}</span>
                </div>
                <div className={`w-full h-6 rounded-full overflow-hidden shadow-inner p-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${radarColor} flex items-center justify-end pr-2 transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.max(budgetPercent, 5)}%` }}
                  >
                    {budgetPercent > 10 && <span className="text-[10px] text-white font-black">{Math.round(budgetPercent)}%</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/20">
              <button onClick={() => changeMonth(-1)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 bg-slate-800' : 'hover:bg-slate-200 bg-slate-100'}`}>
                <ChevronRight size={20} className={isRtl ? '' : 'rotate-180'}/>
              </button>
              <h3 className="text-xl font-black">{calendarDate.toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => changeMonth(1)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 bg-slate-800' : 'hover:bg-slate-200 bg-slate-100'}`}>
                <ChevronLeft size={20} className={isRtl ? '' : 'rotate-180'}/>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {t.days.map(d => <div key={d} className={`text-sm font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-xl font-black mb-6 pb-4 border-b border-slate-200/20">👷 {t.teamTitle}</h2>
          {team.length === 0 ? (
             <p className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.noTeam}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map(worker => (
                <div key={worker.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-slate-900/80 border-slate-700 shadow-md' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div>
                    <h4 className="font-bold text-lg">{worker.worker_name}</h4>
                    <p className={`text-sm mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>📞 {worker.worker_phone || 'SouqBTP'}</p>
                  </div>
                  <span className="bg-indigo-500/10 text-indigo-500 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-500/20">{t.master}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cardClass}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200/20">
            <h2 className="text-xl font-black flex items-center gap-2"><FolderOpen className="text-blue-500" /> {t.vaultTitle}</h2>
            <div className="flex gap-2">
              <select 
                value={docCategory} 
                onChange={e => setDocCategory(e.target.value)} 
                className={`p-2.5 border rounded-xl text-sm font-bold outline-none cursor-pointer transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                {categoryOptions[language]?.map((cat, idx) => <option key={idx}>{cat}</option>)}
              </select>
              <label className={`bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 transition-all ${uploadingDoc ? 'opacity-50' : 'hover:-translate-y-1 hover:bg-blue-700'}`}>
                <Upload size={18} /> {uploadingDoc ? t.uploading : t.uploadBtn}
                <input type="file" className="hidden" multiple onChange={handleDocumentUpload} disabled={uploadingDoc} />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {documents.length === 0 ? <p className="col-span-full text-center text-slate-400 py-4">{t.emptyVault}</p> :
              documents.map(doc => {
                let Icon = FileText;
                if(doc.category === categoryOptions[language]?.[1]) Icon = FileImage; 
                if(doc.category === categoryOptions[language]?.[0]) Icon = FileSignature; 
                if(doc.category.includes('فاتورة') || doc.category.includes('Facture') || doc.category.includes('Invoice')) Icon = Receipt;

                return (
                  <div key={doc.id} className={`p-5 rounded-2xl text-center border-2 relative group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isDarkMode ? 'bg-slate-900/90 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-100 hover:border-blue-400'}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }} 
                      className={`absolute -top-3 ${isRtl ? '-left-3' : '-right-3'} bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_5px_15px_rgba(239,68,68,0.5)] hover:scale-110`}
                    >
                      <Trash2 size={16}/>
                    </button>
                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="block">
                      <Icon size={40} className="mx-auto text-blue-400 mb-4 drop-shadow-sm" />
                      <p className={`text-sm font-bold truncate mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={doc.file_name}>{doc.file_name}</p>
                      <span className={`text-[10px] px-3 py-1.5 rounded-lg font-bold inline-block ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>{doc.category}</span>
                    </a>
                  </div>
                )
              })
            }
          </div>
        </div>

      </div>

      <button 
        onClick={() => setIsSosOpen(true)} 
        className={`group fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} flex items-center bg-red-500/40 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-700 text-white rounded-full transition-all duration-500 overflow-hidden z-50 backdrop-blur-sm hover:backdrop-blur-none border border-red-400/30 hover:border-red-400/80 w-14 h-14 hover:w-56 shadow-lg hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]`}
      >
        <div className="w-14 h-14 shrink-0 flex items-center justify-center">
          <LifeBuoy className="group-hover:animate-spin-slow" size={24} />
        </div>
        <span className={`whitespace-nowrap font-black text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isRtl ? 'mr-1' : 'ml-1'}`}>{t.sosBtn}</span>
      </button>

      {isSosOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setIsSosOpen(false)}>
          <div className={`rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in border-2 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-red-500 border-b-2 border-red-500/20 pb-4 mb-6 flex items-center gap-2"><AlertCircle size={28}/> {t.sosTitle}</h2>
            <div className="space-y-5">
              <input type="text" placeholder={t.issueTitle} className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
              <select className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                <option>{t.sosUrgent}</option>
                <option>{t.sosNormal}</option>
              </select>
              <textarea rows="4" placeholder={t.sosDetails} className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}></textarea>
            </div>
            <div className="flex gap-4 mt-8">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(239,68,68,0.4)] transition-all hover:-translate-y-1">🚀 {t.sosSend}</button>
              <button onClick={() => setIsSosOpen(false)} className={`px-8 font-black py-4 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}