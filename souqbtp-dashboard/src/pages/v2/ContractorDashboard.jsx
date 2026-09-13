import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  Calculator, Star, MessageCircle, Briefcase, Camera, Wallet, 
  FolderOpen, LifeBuoy, CheckCircle2, AlertCircle, Upload, 
  Trash2, FileText, FileImage, FileSignature, Receipt, ChevronRight, ChevronLeft, Sun, Moon
} from 'lucide-react';

export default function ContractorDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // تم التبديل للوضع الفاتح كافتراضي لرؤية الخلفية المريحة
  
  // States للبيانات
  const [profile, setProfile] = useState({ full_name: '', phone: '', city: '', project_name: '' });
  const [stats, setStats] = useState({ progress: 0, completed: 0, remaining: 0 });
  const [conversations, setConversations] = useState([]);
  const [onlineProviders, setOnlineProviders] = useState([]);
  const [stageProgress, setStageProgress] = useState([]);
  const [team, setTeam] = useState([]);
  const [reports, setReports] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docCategory, setDocCategory] = useState('رخصة بناء');
  const [budget, setBudget] = useState({ total: 250000, spent: 0, expenses: [] });
  const [appointments, setAppointments] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // 💎 كلاس موحد للبطاقات مع تأثير 3D وإضاءة مشعة عند التمرير (Glow Effect)
  const cardClass = `rounded-3xl p-6 transition-all duration-500 transform hover:-translate-y-2 border-2 ${
    isDarkMode 
      ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/50 text-slate-200 shadow-xl hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] hover:border-blue-500' 
      : 'bg-white/95 backdrop-blur-xl border-white text-slate-800 shadow-lg hover:shadow-[0_0_35px_rgba(59,130,246,0.4)] hover:border-blue-400'
  }`;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      const { count: totalTasks } = await supabase.from('checklists').select('*', { count: 'exact', head: true });
      const { count: completedTasks } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const total = totalTasks || 28;
      const completed = completedTasks || 0;
      setStats({ progress: total > 0 ? Math.round((completed / total) * 100) : 0, completed, remaining: total - completed });

      const { data: convos } = await supabase.from('conversations').select('id, provider_id, architect_id').eq('client_id', user.id);
      if (convos) {
        const convosWithDetails = await Promise.all(convos.map(async (c) => {
          let name = 'غير معروف', icon = '👤', partnerId = null;
          if (c.architect_id) {
            const { data: arch } = await supabase.from('architects').select('full_name, agency_name').eq('id', c.architect_id).single();
            name = arch ? `${arch.full_name} (${arch.agency_name || 'مهندس'})` : 'مهندس';
            partnerId = c.architect_id; icon = '📐';
          } else if (c.provider_id) {
            const { data: prov } = await supabase.from('providers').select('full_name').eq('id', c.provider_id).single();
            name = prov ? prov.full_name : 'معلم';
            partnerId = c.provider_id; icon = '👷';
          }
          const { data: msgs } = await supabase.from('messages').select('content, created_at, sender_type').eq('conversation_id', c.id).is('deleted_by_client', false).order('created_at', { ascending: false }).limit(1);
          const { count: unread } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('conversation_id', c.id).eq('sender_type', 'provider').is('is_read', false);
          return { ...c, partnerName: name, partnerId, icon, lastMsg: msgs?.[0], unread: unread || 0 };
        }));
        setConversations(convosWithDetails);
      }

      const globalChannel = supabase.channel('global_radar_room', { config: { presence: { key: 'client_' + user.id } } });
      globalChannel.on('presence', { event: 'sync' }, () => {
        const state = globalChannel.presenceState();
        const onlineIds = [];
        for (const key in state) {
          if (state[key][0]?.type === 'provider') onlineIds.push(state[key][0].id.toString());
        }
        setOnlineProviders(onlineIds);
      }).subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await globalChannel.track({ type: 'client', id: user.id });
      });

      const { data: teamData } = await supabase.from('milestone_assignments').select('*').eq('user_id', user.id).order('stage_id', { ascending: true });
      if (teamData) setTeam(teamData);

      const { data: estimate } = await supabase.from('user_estimates').select('total_cost, total_budget').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      const { data: expenses } = await supabase.from('project_expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const estBudget = estimate ? parseFloat(estimate.total_cost || estimate.total_budget || 250000) : 250000;
      const totalSpent = expenses ? expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) : 0;
      setBudget({ total: estBudget, spent: totalSpent, expenses: expenses || [] });

      const { data: reportsData } = await supabase.from('site_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
      if (reportsData) setReports(reportsData);

      const { data: docsData } = await supabase.from('project_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (docsData) setDocuments(docsData);

      const { data: appsData } = await supabase.from('appointments').select('*, services(name), providers(full_name)').eq('user_id', user.id);
      if (appsData) setAppointments(appsData);

      // محاكاة الأرقام لتطابق جمالية الصورة رقم 3
      const stagesMock = [
        { id: 1, name: 'التخطيط', icon: '📝', color: '#3b82f6', percent: 56, completed: 5, total: 9 },
        { id: 2, name: 'التنفيذ', icon: '🏗️', color: '#f97316', percent: 64, completed: 7, total: 11 },
        { id: 3, name: 'التشطيب', icon: '🎨', color: '#a855f7', percent: 50, completed: 2, total: 4 },
        { id: 4, name: 'التحفيظ', icon: '📜', color: '#22c55e', percent: 25, completed: 1, total: 4 }
      ];
      setStageProgress(stagesMock);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaveStatus('loading');
    try {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) { setSaveStatus('error'); setTimeout(() => setSaveStatus(null), 3000); }
  };

  const handleDocumentUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
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

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const changeMonth = (offset) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarDate(newDate);
  };

  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="min-h-[60px]"></div>);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayApps = appointments.filter(a => a.appointment_date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={i} className={`min-h-[60px] p-1 md:p-2 border rounded-xl transition-all ${
          isToday 
            ? 'bg-orange-500/20 border-orange-400 text-orange-400 shadow-inner' 
            : isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <span className="text-sm font-bold">{i}</span>
          <div className="mt-1 space-y-1">
            {dayApps.map(app => (
              <div key={app.id} className={`text-[10px] p-1 rounded-md truncate ${app.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`} title={app.notes}>
                👷 {app.providers?.full_name || 'حرفي'}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  if (loading) return (
    <div className={`flex flex-col items-center justify-center h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#98d8b8]'} gap-4 transition-colors duration-700`}>
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-white text-xl">جاري تجهيز مكتبك الميداني...</p>
    </div>
  );

  const budgetPercent = Math.min((budget.spent / budget.total) * 100, 100);

  return (
    // 🎨 تم تفعيل الخلفية الخضراء المريحة (sage green) للوضع الفاتح والخلفية العميقة للوضع الداكن
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-700 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#a3e6cd]'}`} dir="rtl">
      
      {/* 🚀 شريط الإضاءة العلوي (Switch) */}
      <div className="flex justify-between items-center mb-8 bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-sm">
        <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0f3b25]'}`}>مكتب المقاول</h1>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all shadow-lg hover:scale-105 ${
            isDarkMode ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-[#0f3b25] text-white border border-[#0f3b25]'
          }`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="hidden sm:inline">{isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}</span>
        </button>
      </div>

      <div className="space-y-8 animate-fade-in pb-24">
        
        {/* الأزرار السريعة */}
        <div className="flex flex-wrap gap-4">
          <Link to="/v2/cost-calculator" className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-lg border-2 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/90 border-white text-slate-800 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md'}`}>
            <Calculator className="text-blue-500" size={24} /> الحاسبة الذكية لتكاليف الورش
          </Link>
          <Link to="/v2/reviews" className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-lg border-2 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/90 border-white text-slate-800 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md'}`}>
            <Star className="text-yellow-500" size={24} /> تقييم الحرفيين
          </Link>
        </div>

        {/* صندوق الرسائل */}
        <div className={`${cardClass} border-t-4 border-t-blue-500`}>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <h2 className="text-xl font-black flex items-center gap-2"><MessageCircle className="text-blue-500" /> صندوق الرسائل</h2>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> متصل - يوجد ({onlineProviders.length}) متاحين
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {conversations.length === 0 ? (
              <div className={`text-center py-10 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-900/50' : 'border-slate-300 text-slate-500 bg-white/50'}`}>📭 لا توجد محادثات حتى الآن.</div>
            ) : (
              <table className="w-full text-right border-collapse">
                <tbody>
                  {conversations.map(c => {
                    const isOnline = onlineProviders.includes(c.partnerId?.toString());
                    const msgText = c.lastMsg?.content?.startsWith('AUDIO_MSG') ? '🎤 رسالة صوتية' : (c.lastMsg?.content || 'بدأت المحادثة');
                    const token = Array.from(c.id.toString()).map(ch => ch.charCodeAt(0).toString(16)).join('');
                    return (
                      <tr key={c.id} className={`border-b transition-colors ${isDarkMode ? 'border-slate-700/50 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'} ${c.unread > 0 ? (isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50/70') : ''}`}>
                        <td className="p-4 font-bold flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`}></span>
                          {c.icon} {c.partnerName}
                          {c.unread > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-lg">{c.unread}</span>}
                        </td>
                        <td className={`p-4 text-sm max-w-[200px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{msgText}</td>
                        <td className="p-4 text-left">
                          <Link to={`/v2/chat/${token}`} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/30">دخول للمحادثة</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 🚀 كاميرا الورشة (تطابق الصورة 1 تماماً) */}
        <div className={`${cardClass} border-t-4 border-t-blue-500`}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200/20">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2"><Camera className="text-blue-500" /> كاميرا الورشة وتقارير الميدان</h2>
              <p className={`text-sm mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>أحدث اللقطات من ميدان الورش</p>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all hover:scale-105">
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span> طلب بث مباشر من الورشة
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 custom-scrollbar snap-x">
            {reports.length === 0 ? (
              <div className={`w-full text-center py-10 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-900/50' : 'border-slate-300 text-slate-500 bg-white/50'}`}>لا توجد لقطات حديثة من الورشة.</div>
            ) : (
              reports.map(r => (
                <div key={r.id} className={`min-w-[240px] rounded-xl overflow-hidden border-2 snap-start relative group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  {/* زر الحذف الأحمر */}
                  <button onClick={(e) => { e.stopPropagation(); deleteSiteReport(r.id); }} className="absolute top-2 left-2 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10 backdrop-blur-sm">
                    <Trash2 size={16}/>
                  </button>
                  
                  {/* الصورة والتاريخ */}
                  <div className="relative h-36" onClick={() => window.open(r.image_url, '_blank')}>
                    <img src={r.image_url} alt="report" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <span className="absolute bottom-2 right-2 text-white text-xs font-bold flex items-center gap-1">
                      🕒 {new Date(r.created_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  {/* التفاصيل */}
                  <div className="p-3" onClick={() => window.open(r.image_url, '_blank')}>
                    <p className={`text-sm font-bold truncate mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={r.description}>{r.description || 'لقطة ميدانية تفاعلية من الورش'}</p>
                    <p className="text-xs text-slate-500 font-bold">👷 {r.provider_name || 'فريق SouqBTP'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* قسم الميزانية الإجمالية */}
        <div className={cardClass}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
            <h2 className="text-xl font-black flex items-center gap-2">💰 ميزانية الورش الإجمالية</h2>
            <div className="flex gap-2 flex-wrap">
              <button className="bg-[#e74c3c] hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all hover:-translate-y-1">
                <FileText size={18} /> تحميل PDF
              </button>
              <button className="bg-[#25D366] hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-1">
                📲 مشاركة واتساب
              </button>
              <Link to="/v2/cost-calculator" className={`px-5 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-1 ${isDarkMode ? 'border border-slate-600 hover:bg-slate-700 text-slate-200' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'}`}>
                تعديل الميزانية
              </Link>
            </div>
          </div>
          {budget.total === 250000 && budget.spent === 0 ? (
            <div className={`text-center py-8 rounded-xl mt-4 border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400 bg-slate-900/50' : 'border-slate-300 text-slate-500 bg-white/50'}`}>
              لم تقم بحساب الميزانية بعد.
            </div>
          ) : (
            <div className="text-center font-bold text-xl text-blue-500 mt-4">تم حساب الميزانية (تفاصيل بالأسفل)</div>
          )}
        </div>

        {/* البطاقات الإحصائية المتوهجة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-[0_10px_30px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center transform transition-transform duration-300 hover:-translate-y-3 cursor-default border border-white/10">
            <span className="text-sm font-bold opacity-90 mb-2">تقدم المشروع</span>
            <span className="text-6xl font-black drop-shadow-md">{stats.progress}%</span>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-8 text-white shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex flex-col items-center justify-center transform transition-transform duration-300 hover:-translate-y-3 cursor-default border border-white/10">
            <span className="text-sm font-bold opacity-90 mb-2">المهام المنجزة</span>
            <span className="text-6xl font-black drop-shadow-md">{stats.completed}</span>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl p-8 text-white shadow-[0_10px_30px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center transform transition-transform duration-300 hover:-translate-y-3 cursor-default border border-white/10">
            <span className="text-sm font-bold opacity-90 mb-2">المهام المتبقية</span>
            <span className="text-6xl font-black drop-shadow-md">{stats.remaining}</span>
          </div>
        </div>

        {/* بيانات المقاولة والتقدم حسب المرحلة */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* بيانات المقاولة */}
          <div className={cardClass}>
            <h2 className="text-xl font-black flex items-center gap-2 mb-6 pb-4 border-b border-slate-200/20"><Briefcase className="text-blue-500" /> بيانات المقاولة</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <input type="text" placeholder="اسم الشركة" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
              <input type="tel" placeholder="رقم الهاتف" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="المدينة" value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                <input type="text" placeholder="الورش الحالي" value={profile.project_name || ''} onChange={e => setProfile({...profile, project_name: e.target.value})} className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1">💾 حفظ التغييرات</button>
            </form>
          </div>

          {/* 🚀 إحصائيات تفصيلية (الدوائر المطابقة للصورة 3) */}
          <div className={cardClass}>
            <h2 className="text-xl font-black mb-2 flex items-center gap-2">📊 إحصائيات تفصيلية</h2>
            <p className={`font-bold mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>التقدم حسب المرحلة:</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
              {stageProgress.map(stage => (
                <div key={stage.id} className={`p-6 rounded-2xl border text-center transition-all hover:scale-105 flex flex-col items-center justify-center ${isDarkMode ? 'bg-slate-900/50 border-slate-700 shadow-inner' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="font-bold mb-4 text-lg flex items-center gap-2">
                    {stage.name} {stage.icon}
                  </div>
                  {/* رسم الدائرة الإحصائية */}
                  <div 
                    className="relative w-28 h-28 rounded-full flex items-center justify-center mb-4 shadow-inner"
                    style={{ background: `conic-gradient(${stage.color} ${stage.percent}%, ${isDarkMode ? '#1e293b' : '#f1f5f9'} ${stage.percent}%)` }}
                  >
                    <div className={`absolute rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`} style={{ width: '82%', height: '82%' }}>
                      <span className="text-2xl font-black" style={{ color: stage.color }}>{stage.percent}%</span>
                    </div>
                  </div>
                  <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {stage.completed} / {stage.total} مهمة
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* فريق العمل */}
        <div className={cardClass}>
          <h2 className="text-xl font-black mb-6 pb-4 border-b border-slate-200/20">👷 فريق عمل الورش</h2>
          {team.length === 0 ? (
             <p className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>لم تقم بتعيين أي فريق عمل حتى الآن.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map(t => (
                <div key={t.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-slate-900/80 border-slate-700 shadow-md' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div>
                    <h4 className="font-bold text-lg">{t.worker_name}</h4>
                    <p className={`text-sm mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>📞 {t.worker_phone || 'SouqBTP'}</p>
                  </div>
                  <span className="bg-indigo-500/10 text-indigo-500 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-500/20">معلم</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* خزانة المستندات */}
        <div className={cardClass}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200/20">
            <h2 className="text-xl font-black flex items-center gap-2"><FolderOpen className="text-blue-500" /> خزانة مستندات الورش</h2>
            <div className="flex gap-2">
              <select 
                value={docCategory} 
                onChange={e => setDocCategory(e.target.value)} 
                className={`p-2.5 border rounded-xl text-sm font-bold outline-none cursor-pointer transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <option>رخصة بناء</option>
                <option>تصميم هندسي</option>
                <option>فاتورة / توصيل</option>
                <option>عقد عمل</option>
                <option>أخرى</option>
              </select>
              <label className={`bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 transition-all ${uploadingDoc ? 'opacity-50' : 'hover:-translate-y-1 hover:bg-blue-700'}`}>
                <Upload size={18} /> {uploadingDoc ? 'جاري الرفع...' : 'رفع مستند'}
                <input type="file" className="hidden" multiple onChange={handleDocumentUpload} disabled={uploadingDoc} />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {documents.length === 0 ? <p className="col-span-full text-center text-slate-400 py-4">الخزانة فارغة.</p> :
              documents.map(doc => {
                let Icon = FileText;
                if(doc.category === 'تصميم هندسي') Icon = FileImage;
                if(doc.category === 'رخصة بناء') Icon = FileSignature;
                if(doc.category.includes('فاتورة')) Icon = Receipt;

                return (
                  <div key={doc.id} className={`p-5 rounded-2xl text-center border-2 relative group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isDarkMode ? 'bg-slate-900/90 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-100 hover:border-blue-400'}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }} 
                      className="absolute -top-3 -left-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_5px_15px_rgba(239,68,68,0.5)] hover:scale-110"
                      title="حذف المستند"
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

        {/* الميزانية والتقويم */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/20">
              <h2 className="text-xl font-black flex items-center gap-2"><Wallet className="text-blue-500" /> رادار الميزانية</h2>
            </div>
            <div className={`p-6 rounded-2xl border-2 mb-6 ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex justify-between font-bold mb-4 text-lg">
                <span>الفعلي: <span className="text-orange-500 drop-shadow-sm">{budget.spent.toLocaleString()}</span> درهم</span>
                <span>المقدر: <span className="text-emerald-500 drop-shadow-sm">{budget.total.toLocaleString()}</span> درهم</span>
              </div>
              <div className={`w-full h-5 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="h-full bg-gradient-to-r from-emerald-400 to-orange-400" style={{ width: `${budgetPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/20">
              <button onClick={() => changeMonth(-1)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 bg-slate-800' : 'hover:bg-slate-200 bg-slate-100'}`}><ChevronRight size={20}/></button>
              <h3 className="text-xl font-black">{calendarDate.toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => changeMonth(1)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 bg-slate-800' : 'hover:bg-slate-200 bg-slate-100'}`}><ChevronLeft size={20}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'].map(d => <div key={d} className={`text-sm font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

      </div>

      {/* زر الاستغاثة العائم */}
      <button onClick={() => setIsSosOpen(true)} className="fixed bottom-8 left-8 bg-gradient-to-br from-red-500 to-red-700 text-white px-6 py-4 rounded-full font-black text-lg flex items-center gap-3 shadow-[0_10px_35px_rgba(239,68,68,0.6)] hover:scale-110 transition-transform z-40 border-2 border-red-400/50">
        <LifeBuoy className="animate-pulse" size={24} /> استغاثة تقنية
      </button>

      {/* نافذة الاستغاثة */}
      {isSosOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setIsSosOpen(false)}>
          <div className={`rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in border-2 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-red-500 border-b-2 border-red-500/20 pb-4 mb-6 flex items-center gap-2"><AlertCircle size={28}/> طلب تدخل خبير تقني</h2>
            <div className="space-y-5">
              <input type="text" placeholder="عنوان المشكلة" className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
              <select className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}><option>🔴 عاجل جداً (توقف العمل)</option><option>🟢 استشارة فنية</option></select>
              <textarea rows="4" placeholder="التفاصيل..." className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}></textarea>
            </div>
            <div className="flex gap-4 mt-8">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(239,68,68,0.4)] transition-all hover:-translate-y-1">🚀 إرسال النداء</button>
              <button onClick={() => setIsSosOpen(false)} className={`px-8 font-black py-4 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}