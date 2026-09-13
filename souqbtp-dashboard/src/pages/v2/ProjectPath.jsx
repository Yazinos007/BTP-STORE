import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Circle, Users, MessageCircle, Briefcase, 
  Map, LayoutDashboard, ChevronRight, X, Search 
} from 'lucide-react';

export default function ProjectPath() {
  const { isDarkMode, language = 'ar' } = useOutletContext();
  const isRtl = language === 'ar';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [selectedStage, setSelectedStage] = useState(1);
  const [services, setServices] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [team, setTeam] = useState([]);
  
  const [providers, setProviders] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignType, setAssignType] = useState('private');
  const [assignForm, setAssignForm] = useState({ name: '', phone: '', providerId: '' });

  // 🌍 قاموس الترجمة الشامل
  const t = {
    ar: {
      title: "رحلة بناء مشروعك",
      subtitle: "اختر المرحلة، عين فريقك، وتابع الإنجاز لحظة بلحظة.",
      progressTitle: "متابعة التقدم الإجمالي",
      assignBtn: "تعيين فريق لهذه المرحلة",
      stages: [
        { id: 1, name: "التخطيط", icon: "🏛️" },
        { id: 2, name: "التنفيذ", icon: "👷" },
        { id: 3, name: "التشطيب", icon: "🎨" },
        { id: 4, name: "التحفيظ", icon: "📜" }
      ],
      stagePrefix: "مرحلة",
      loadingData: "⏳ جاري جلب الخدمات والمقاولين...",
      noServices: "لا توجد خدمات مضافة لهذه المرحلة حالياً.",
      showProviders: "👷 عرض المزودين",
      providersFor: "مزودو خدمة:",
      searching: "⏳ جاري البحث...",
      bookBtn: "💬 تواصل للحجز",
      noProviders: "لا يوجد مزودين متاحين حالياً.",
      assignModalTitle: "تعيين مسؤول للمرحلة",
      assignTypeLabel: "نوع التعيين",
      typePrivate: "فريق خاص (إدخال يدوي)",
      typeMarket: "الماركت بليس (سوق BTP)",
      artisanName: "اسم الحرفي",
      artisanPhone: "رقم الهاتف",
      save: "حفظ",
      cancel: "إلغاء",
      loginRequired: "⚠️ يرجى تسجيل الدخول أولاً لحفظ تقدمك",
      bookConfirm: "هل تريد فتح محادثة وحجز موعد مبدئي بخصوص",
      errorLoad: "حدث خطأ أثناء تحميل البيانات.",
      successAssign: "✅ تم تعيين الفريق بنجاح!"
    },
    fr: {
      title: "Parcours de Construction",
      subtitle: "Choisissez l'étape, assignez votre équipe et suivez l'avancement.",
      progressTitle: "Suivi Global",
      assignBtn: "Assigner une équipe",
      stages: [
        { id: 1, name: "Planification", icon: "🏛️" },
        { id: 2, name: "Exécution", icon: "👷" },
        { id: 3, name: "Finition", icon: "🎨" },
        { id: 4, name: "Enregistrement", icon: "📜" }
      ],
      stagePrefix: "Étape :",
      loadingData: "⏳ Chargement des services...",
      noServices: "Aucun service pour cette étape.",
      showProviders: "👷 Voir les prestataires",
      providersFor: "Prestataires pour :",
      searching: "⏳ Recherche...",
      bookBtn: "💬 Contacter",
      noProviders: "Aucun prestataire disponible.",
      assignModalTitle: "Assigner un responsable",
      assignTypeLabel: "Type d'assignation",
      typePrivate: "Équipe privée (Manuel)",
      typeMarket: "Marketplace SouqBTP",
      artisanName: "Nom de l'artisan",
      artisanPhone: "Numéro de téléphone",
      save: "Enregistrer",
      cancel: "Annuler",
      loginRequired: "⚠️ Veuillez vous connecter pour sauvegarder",
      bookConfirm: "Voulez-vous ouvrir une discussion pour",
      errorLoad: "Erreur lors du chargement des données.",
      successAssign: "✅ Équipe assignée avec succès !"
    },
    en: {
      title: "Project Build Path",
      subtitle: "Choose the stage, assign your team, and track progress.",
      progressTitle: "Overall Progress Tracking",
      assignBtn: "Assign Team to Stage",
      stages: [
        { id: 1, name: "Planning", icon: "🏛️" },
        { id: 2, name: "Execution", icon: "👷" },
        { id: 3, name: "Finishing", icon: "🎨" },
        { id: 4, name: "Registration", icon: "📜" }
      ],
      stagePrefix: "Stage:",
      loadingData: "⏳ Loading services and contractors...",
      noServices: "No services added for this stage yet.",
      showProviders: "👷 Show Providers",
      providersFor: "Providers for:",
      searching: "⏳ Searching...",
      bookBtn: "💬 Contact to Book",
      noProviders: "No providers available currently.",
      assignModalTitle: "Assign Stage Manager",
      assignTypeLabel: "Assignment Type",
      typePrivate: "Private Team (Manual)",
      typeMarket: "SouqBTP Marketplace",
      artisanName: "Artisan Name",
      artisanPhone: "Phone Number",
      save: "Save",
      cancel: "Cancel",
      loginRequired: "⚠️ Please login first to save progress",
      bookConfirm: "Do you want to open a chat and book for",
      errorLoad: "Error loading data.",
      successAssign: "✅ Team assigned successfully!"
    }
  }[language];

  // 💎 كلاسات التصميم المتجاوبة مع الإضاءة
  const cardBg = isDarkMode ? 'bg-slate-800/90 border-slate-700 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-800 shadow-md';
  const inputBg = isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800';

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    if (user) {
      loadStageData(selectedStage);
    }
  }, [selectedStage, user]);

  const initData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser(user);
    // إخفاء التحميل حتى لو لم يكن هناك مستخدم لإظهار التصميم
    setLoading(false); 
  };

  const loadStageData = async (stageId) => {
    setLoading(true);
    setProviders([]);
    setSelectedService(null);
    try {
      const [servicesRes, checklistsRes, progressRes, teamRes, totalTasksRes] = await Promise.all([
        supabase.from('services').select('*').eq('stage_id', stageId),
        supabase.from('checklists').select('*').order('sort_order'),
        user ? supabase.from('user_progress').select('task_id').eq('user_id', user.id) : { data: [] },
        user ? supabase.from('milestone_assignments').select('*').eq('user_id', user.id).eq('stage_id', stageId) : { data: [] },
        supabase.from('checklists').select('id', { count: 'exact', head: true })
      ]);

      if (servicesRes.data) setServices(servicesRes.data);
      if (checklistsRes.data) setChecklists(checklistsRes.data);
      if (progressRes.data) {
        const completedIds = progressRes.data.map(p => p.task_id);
        setUserProgress(completedIds);
        
        // حساب التقدم الإجمالي
        const total = totalTasksRes.count || 28;
        const pct = total > 0 ? Math.round((completedIds.length / total) * 100) : 0;
        setOverallProgress(pct);
      }
      if (teamRes.data) setTeam(teamRes.data);

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const toggleTask = async (taskId) => {
    if (!user) {
      alert(t.loginRequired);
      return;
    }

    const isDone = userProgress.includes(taskId);
    let newProgress = [...userProgress];

    if (isDone) {
      newProgress = newProgress.filter(id => id !== taskId);
      await supabase.from('user_progress').delete().eq('user_id', user.id).eq('task_id', taskId);
    } else {
      newProgress.push(taskId);
      await supabase.from('user_progress').insert({ user_id: user.id, task_id: taskId });
    }

    setUserProgress(newProgress);
    
    // تحديث النسبة فورياً في الواجهة
    const total = checklists.length > 0 ? checklists.length : 28; // fallback
    setOverallProgress(Math.round((newProgress.length / total) * 100));
  };

  const handleShowProviders = async (serviceId, serviceName) => {
    setSelectedService({ id: serviceId, name: serviceName });
    setProviders([]);
    
    const { data } = await supabase
      .from('provider_services')
      .select('providers(id, full_name, phone)')
      .eq('service_id', serviceId);
      
    if (data) {
      setProviders(data.filter(i => i.providers).map(i => i.providers));
    }
  };

  const handleBookProvider = async (providerId, providerName) => {
    if (!user) {
      alert(t.loginRequired);
      return;
    }
    if (!confirm(`${t.bookConfirm} "${providerName}" (${selectedService?.name})?`)) return;

    try {
      // البحث عن محادثة قائمة
      const { data: existingChat } = await supabase.from('conversations')
        .select('id').eq('client_id', user.id).eq('provider_id', providerId).maybeSingle();
      
      let chatId = existingChat?.id;

      if (!chatId) {
        const { data: userData } = await supabase.auth.getUser();
        const { data: newChat } = await supabase.from('conversations').insert([{
          client_id: user.id, 
          client_name: userData.user?.user_metadata?.full_name || 'Client',
          provider_id: providerId, 
          last_message: `Inquiry: ${selectedService.name}`
        }]).select().single();
        
        chatId = newChat.id;
        await supabase.from('messages').insert([{ 
          conversation_id: chatId, 
          sender_type: 'client', 
          content: `السلام عليكم، أود حجز موعد بخصوص ${selectedService.name}` 
        }]);
      }

      // إضافة موعد مبدئي
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('appointments').insert([{
          user_id: user.id, provider_id: providerId, service_id: selectedService.id,
          appointment_date: today, status: 'pending', notes: `طلب من صفحة المراحل: ${selectedService.name}`
      }]);

      // التوجيه للمحادثة
      const token = chatId.toString().split('').map(c => c.charCodeAt(0).toString(16)).join('');
      navigate(`/v2/chat/${token}`);

    } catch (err) { console.error(err); }
  };

  const handleAssignSubmit = async () => {
    if (!user) return alert(t.loginRequired);
    if (!assignForm.name) return;

    try {
      await supabase.from('milestone_assignments').insert([{
        user_id: user.id,
        stage_id: selectedStage,
        worker_name: assignForm.name,
        worker_phone: assignForm.phone || ''
      }]);
      setIsAssignModalOpen(false);
      setAssignForm({ name: '', phone: '', providerId: '' });
      alert(t.successAssign);
      loadStageData(selectedStage);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="animate-fade-in pb-24 max-w-7xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 الترويسة الرئيسية */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-3xl p-6 md:p-10 mb-8 text-center md:text-start flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-3">🏗️ {t.title}</h1>
          <p className="text-blue-100 font-bold text-lg">{t.subtitle}</p>
        </div>
      </div>

      {/* 📊 بطاقة متابعة التقدم */}
      <div className={`p-6 md:p-8 rounded-3xl border-2 mb-8 ${cardBg}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h3 className="text-xl font-black flex items-center gap-2">📊 {t.progressTitle}</h3>
          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-1 w-full md:w-auto justify-center"
          >
            <Users size={18} /> {t.assignBtn}
          </button>
        </div>
        
        {/* شريط التقدم الرائع */}
        <div className={`w-full h-8 rounded-full overflow-hidden shadow-inner p-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xs transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(overallProgress, 5)}%` }}
          >
            {overallProgress}%
          </div>
        </div>

        {/* عرض الفريق المعين */}
        {team.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {team.map(member => (
              <div key={member.id} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 border-blue-500 ${isDarkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">👷</div>
                <div>
                  <h4 className="font-bold text-sm">{member.worker_name}</h4>
                  <p className="text-xs opacity-70">{member.worker_phone || 'SouqBTP'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧭 أزرار اختيار المراحل (Tabs) */}
      <div className="flex flex-wrap gap-3 mb-8">
        {t.stages.map(stage => {
          const isActive = selectedStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`flex-1 min-w-[140px] p-4 rounded-2xl border-2 font-black text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                isActive 
                  ? 'bg-orange-500 border-orange-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)] transform -translate-y-1' 
                  : `border-transparent hover:border-blue-300 ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`
              }`}
            >
              <span>{stage.icon}</span> {stage.name}
            </button>
          )
        })}
      </div>

      {/* 📋 منطقة الخدمات (البطاقات) */}
      <div className="mb-10">
        <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
          {t.stagePrefix} {t.stages.find(s => s.id === selectedStage)?.name}
        </h2>
        
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-bold">{t.loadingData}</div>
        ) : services.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl border-2 border-dashed font-bold ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
            {t.noServices}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
              const serviceTasks = checklists.filter(c => c.service_id === service.id);
              
              return (
                <div key={service.id} className={`rounded-3xl border-2 p-6 transition-all hover:shadow-xl ${cardBg} hover:-translate-y-1`}>
                  <h3 className={`text-xl font-black mb-5 pb-3 border-b ${isDarkMode ? 'border-slate-700 text-blue-300' : 'border-slate-100 text-blue-900'}`}>
                    {service.name}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    {serviceTasks.map(task => {
                      const isDone = userProgress.includes(task.id);
                      return (
                        <div 
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                            isDone 
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' 
                              : `${isDarkMode ? 'bg-slate-900/50 border-slate-700/50 text-slate-300 hover:border-blue-500/50' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200'}`
                          }`}
                        >
                          <div className={`mt-0.5 shrink-0 ${isDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
                            {isDone ? <CheckCircle2 size={20} className="fill-emerald-100 dark:fill-emerald-900" /> : <Circle size={20} />}
                          </div>
                          <span className="font-bold text-sm leading-snug">{task.task_description}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <button 
                    onClick={() => handleShowProviders(service.id, service.name)}
                    className={`w-full py-3 rounded-xl font-black border-2 transition-all flex items-center justify-center gap-2 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-blue-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <Search size={18} /> {t.showProviders}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 👷 نافذة مزودي الخدمة (تظهر في الأسفل عند الضغط) */}
      {selectedService && (
        <div className={`p-6 md:p-8 rounded-3xl border-2 animate-slide-up ${cardBg}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black">{t.providersFor} <span className="text-blue-500">{selectedService.name}</span></h3>
            <button onClick={() => setSelectedService(null)} className="p-2 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 font-bold">{t.noProviders}</div>
            ) : (
              providers.map(provider => (
                <div key={provider.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-200 hover:border-emerald-400'}`}>
                  <div>
                    <h4 className="font-black flex items-center gap-2">👷 {provider.full_name}</h4>
                  </div>
                  <button 
                    onClick={() => handleBookProvider(provider.id, provider.full_name)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-black shadow-md shadow-emerald-500/30 transition-all hover:scale-105"
                  >
                    {t.bookBtn}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 👤 نافذة تعيين مسؤول للمرحلة (Modal) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)}>
          <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl animate-fade-in border-2 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-blue-600"><Briefcase /> {t.assignModalTitle}</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">{t.assignTypeLabel}</label>
                <select 
                  value={assignType} 
                  onChange={e => setAssignType(e.target.value)} 
                  className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${inputBg}`}
                >
                  <option value="private">{t.typePrivate}</option>
                  <option value="marketplace">{t.typeMarket}</option>
                </select>
              </div>

              {assignType === 'private' && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2 opacity-80">{t.artisanName}</label>
                    <input 
                      type="text" 
                      value={assignForm.name} 
                      onChange={e => setAssignForm({...assignForm, name: e.target.value})} 
                      className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${inputBg}`} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 opacity-80">{t.artisanPhone}</label>
                    <input 
                      type="tel" 
                      value={assignForm.phone} 
                      onChange={e => setAssignForm({...assignForm, phone: e.target.value})} 
                      className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${inputBg}`} 
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={handleAssignSubmit} className="flex-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                {t.save}
              </button>
              <button onClick={() => setIsAssignModalOpen(false)} className={`flex-1 w-full font-black py-4 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}