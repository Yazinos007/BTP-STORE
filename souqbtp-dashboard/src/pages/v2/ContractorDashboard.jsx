import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  Calculator, Star, MessageCircle, Briefcase, Camera, Wallet, 
  FolderOpen, LifeBuoy, CheckCircle2, AlertCircle, Upload, 
  Trash2, FileText, FileImage, FileSignature, Receipt, ChevronRight, ChevronLeft
} from 'lucide-react';

export default function ContractorDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 1. الملف الشخصي
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      // 2. إحصائيات المهام
      const { count: totalTasks } = await supabase.from('checklists').select('*', { count: 'exact', head: true });
      const { count: completedTasks } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const total = totalTasks || 28;
      const completed = completedTasks || 0;
      setStats({ progress: total > 0 ? Math.round((completed / total) * 100) : 0, completed, remaining: total - completed });

      // 3. المحادثات
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

      // 4. الرادار العالمي (Global Radar)
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

      // 5. الفريق
      const { data: teamData } = await supabase.from('milestone_assignments').select('*').eq('user_id', user.id).order('stage_id', { ascending: true });
      if (teamData) setTeam(teamData);

      // 6. الميزانية والمصاريف
      const { data: estimate } = await supabase.from('user_estimates').select('total_cost, total_budget').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      const { data: expenses } = await supabase.from('project_expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const estBudget = estimate ? parseFloat(estimate.total_cost || estimate.total_budget || 250000) : 250000;
      const totalSpent = expenses ? expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) : 0;
      setBudget({ total: estBudget, spent: totalSpent, expenses: expenses || [] });

      // 7. التقارير والمستندات والمواعيد
      const { data: reportsData } = await supabase.from('site_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
      if (reportsData) setReports(reportsData);

      const { data: docsData } = await supabase.from('project_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (docsData) setDocuments(docsData);

      const { data: appsData } = await supabase.from('appointments').select('*, services(name), providers(full_name)').eq('user_id', user.id);
      if (appsData) setAppointments(appsData);

      // 8. تقدم المراحل (محاكاة سريعة بناءً على الكود القديم)
      const stagesMock = [
        { id: 1, name: 'التخطيط', icon: '📝', color: '#3b82f6', percent: 100, completed: 5, total: 5 },
        { id: 2, name: 'التنفيذ', icon: '🏗️', color: '#f97316', percent: stats.progress, completed: stats.completed, total: 15 },
        { id: 3, name: 'التشطيب', icon: '🎨', color: '#a855f7', percent: 0, completed: 0, total: 6 },
        { id: 4, name: 'التحفيظ', icon: '📜', color: '#22c55e', percent: 0, completed: 0, total: 2 }
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

  // دوال التقويم
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
        <div key={i} className={`min-h-[60px] p-1 md:p-2 border border-slate-100 rounded-xl ${isToday ? 'bg-orange-50 border-orange-200' : 'bg-slate-50'}`}>
          <span className={`text-sm font-bold ${isToday ? 'text-orange-600' : 'text-slate-600'}`}>{i}</span>
          <div className="mt-1 space-y-1">
            {dayApps.map(app => (
              <div key={app.id} className={`text-[10px] p-1 rounded-md truncate ${app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`} title={app.notes}>
                👷 {app.providers?.full_name || 'حرفي'}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  if (loading) return <div className="flex items-center justify-center h-full text-blue-600 font-bold">جاري تحميل مساحة العمل...</div>;

  const budgetPercent = Math.min((budget.spent / budget.total) * 100, 100);

  return (
    <div className="space-y-6 animate-fade-in pb-24" dir="rtl">
      
      {/* الأزرار السريعة (تم إصلاح الروابط لتوجيهها لـ v2) */}
      <div className="flex flex-wrap gap-4">
        <Link to="/v2/cost-calculator" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
          <Calculator className="text-blue-500" size={20} /> الحاسبة الذكية لتكاليف الورش
        </Link>
        <Link to="/v2/reviews" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
          <Star className="text-yellow-500" size={20} /> تقييم الحرفيين
        </Link>
      </div>

      {/* صندوق الرسائل */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-t-blue-600">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><MessageCircle /> صندوق الرسائل</h2>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> متصل - يوجد ({onlineProviders.length}) مهنيين متاحين
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed">📭 لا توجد محادثات حتى الآن.</div>
          ) : (
            <table className="w-full text-right border-collapse">
              <tbody>
                {conversations.map(c => {
                  const isOnline = onlineProviders.includes(c.partnerId?.toString());
                  const msgText = c.lastMsg?.content?.startsWith('AUDIO_MSG') ? '🎤 رسالة صوتية' : (c.lastMsg?.content || 'بدأت المحادثة');
                  const token = Array.from(c.id.toString()).map(ch => ch.charCodeAt(0).toString(16)).join('');
                  return (
                    <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${c.unread > 0 ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></span>
                        {c.icon} {c.partnerName}
                        {c.unread > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{c.unread}</span>}
                      </td>
                      <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate">{msgText}</td>
                      <td className="p-4 text-left">
                        {/* رابط لمسار الشات الجديد */}
                        <Link to={`/v2/chat/${token}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">دخول</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center">
          <span className="text-sm font-bold opacity-90 mb-2">تقدم المشروع</span>
          <span className="text-5xl font-black">{stats.progress}%</span>
          <span className="text-xs opacity-75 mt-2">من إجمالي المهام</span>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center">
          <span className="text-sm font-bold opacity-90 mb-2">المهام المنجزة</span>
          <span className="text-5xl font-black">{stats.completed}</span>
          <span className="text-xs opacity-75 mt-2">مهمة مكتملة</span>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center">
          <span className="text-sm font-bold opacity-90 mb-2">المهام المتبقية</span>
          <span className="text-5xl font-black">{stats.remaining}</span>
          <span className="text-xs opacity-75 mt-2">مهمة قيد الانتظار</span>
        </div>
      </div>

      {/* بيانات المقاولة والتقدم */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6"><Briefcase className="text-blue-600" /> بيانات المقاولة</h2>
          {saveStatus === 'success' && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 font-bold text-sm"><CheckCircle2 size={18}/> تم حفظ التغييرات بنجاح!</div>}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <input type="text" placeholder="اسم الشركة" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100" />
            <input type="tel" placeholder="رقم الهاتف" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="المدينة" value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100" />
              <input type="text" placeholder="الورش الحالي" value={profile.project_name || ''} onChange={e => setProfile({...profile, project_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100" />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">💾 حفظ التغييرات</button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">📊 التقدم حسب المرحلة</h2>
          <div className="grid grid-cols-2 gap-4">
            {stageProgress.map(stage => (
              <div key={stage.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <div className="text-xl mb-2">{stage.icon}</div>
                <div className="font-bold text-slate-700">{stage.name}</div>
                <div className="text-2xl font-black mt-2" style={{ color: stage.color }}>{stage.percent}%</div>
                <div className="text-xs text-slate-500 mt-1">{stage.completed} / {stage.total} مهمة</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* فريق العمل */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">👷 فريق عمل الورش</h2>
        {team.length === 0 ? (
           <p className="text-center text-slate-500">لم تقم بتعيين أي فريق عمل حتى الآن.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800">{t.worker_name}</h4>
                  <p className="text-xs text-slate-500 mt-1">📞 {t.worker_phone || 'SouqBTP'}</p>
                </div>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">معلم</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* كاميرا الورشة */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-t-blue-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><Camera /> كاميرا الورشة وتقارير الميدان</h2>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-red-500/30">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span> طلب بث مباشر
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {reports.length === 0 ? (
            <div className="w-full text-center py-8 bg-slate-50 rounded-xl border border-dashed text-slate-500">لا توجد لقطات حديثة من الورشة.</div>
          ) : (
            reports.map(r => (
              <div key={r.id} className="min-w-[200px] border rounded-xl overflow-hidden shadow-sm relative group cursor-pointer">
                <img src={r.image_url} alt="report" className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                <div className="p-3 bg-white">
                  <p className="text-sm font-bold truncate">{r.description || 'تحديث من الميدان'}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* الميزانية والتقويم */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الميزانية */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><Wallet /> رادار الميزانية</h2>
            <button className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">+ مصروف</button>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-6">
            <div className="flex justify-between font-bold mb-3">
              <span>الفعلي: <span className="text-orange-600">{budget.spent.toLocaleString()}</span> درهم</span>
              <span>المقدر: <span className="text-emerald-500">{budget.total.toLocaleString()}</span> درهم</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-orange-400" style={{ width: `${budgetPercent}%` }}></div>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {budget.expenses.length === 0 ? <p className="text-center text-sm text-slate-400">لا توجد مصاريف مسجلة</p> :
              budget.expenses.map(exp => (
                <div key={exp.id} className="flex justify-between bg-white p-3 rounded-lg border border-slate-100">
                  <span className="font-bold text-sm">{exp.expense_name}</span>
                  <span className="text-orange-600 font-bold">{exp.amount} د.م</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* التقويم والمواعيد */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-200 rounded"><ChevronRight size={20}/></button>
            <h3 className="font-bold text-blue-800">{calendarDate.toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-200 rounded"><ChevronLeft size={20}/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'].map(d => <div key={d} className="text-xs font-bold text-slate-500">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* خزانة المستندات */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><FolderOpen /> خزانة المستندات</h2>
          <div className="flex gap-2">
            <select value={docCategory} onChange={e => setDocCategory(e.target.value)} className="p-2 border rounded-lg text-sm bg-white outline-none">
              <option>رخصة بناء</option><option>تصميم هندسي</option><option>فاتورة</option><option>أخرى</option>
            </select>
            <label className={`bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${uploadingDoc ? 'opacity-50' : 'hover:bg-blue-700'}`}>
              <Upload size={16} /> {uploadingDoc ? 'جاري الرفع...' : 'رفع'}
              <input type="file" className="hidden" multiple onChange={handleDocumentUpload} disabled={uploadingDoc} />
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {documents.length === 0 ? <p className="col-span-full text-center text-slate-400 py-4">الخزانة فارغة.</p> :
            documents.map(doc => {
              let Icon = FileText;
              if(doc.category === 'تصميم هندسي') Icon = FileImage;
              if(doc.category === 'رخصة بناء') Icon = FileSignature;
              if(doc.category === 'فاتورة') Icon = Receipt;

              return (
                <div key={doc.id} className="bg-white p-4 rounded-xl text-center border border-slate-200 relative group cursor-pointer hover:shadow-md">
                  <button onClick={() => deleteDocument(doc.id)} className="absolute -top-2 -left-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="block">
                    <Icon size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700 truncate" title={doc.file_name}>{doc.file_name}</p>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 mt-1 inline-block">{doc.category}</span>
                  </a>
                </div>
              )
            })
          }
        </div>
      </div>

      {/* زر الاستغاثة العائم ونافذته المنبثقة */}
      <button onClick={() => setIsSosOpen(true)} className="fixed bottom-8 left-8 bg-gradient-to-br from-red-500 to-red-700 text-white px-5 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_10px_25px_rgba(239,68,68,0.4)] hover:scale-105 transition-transform z-40">
        <LifeBuoy /> استغاثة تقنية
      </button>

      {isSosOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsSosOpen(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-100 pb-3 mb-4">🚨 طلب تدخل خبير تقني</h2>
            <p className="text-sm text-slate-500 mb-6">اطلب استشارة خبير منصة SouqBTP فوراً.</p>
            <div className="space-y-4">
              <input type="text" placeholder="عنوان المشكلة" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"><option>عاجل جداً (توقف العمل)</option><option>استشارة فنية</option></select>
              <textarea rows="3" placeholder="التفاصيل..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl">إرسال النداء</button>
              <button onClick={() => setIsSosOpen(false)} className="px-6 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}