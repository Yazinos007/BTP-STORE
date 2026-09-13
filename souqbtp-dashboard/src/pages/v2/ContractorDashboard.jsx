import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Calculator, Star, MessageCircle, Briefcase, Camera, Wallet, 
  CalendarDays, FolderOpen, LifeBuoy, X, CheckCircle2, AlertCircle, Upload
} from 'lucide-react';

export default function ContractorDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // States للبيانات
  const [profile, setProfile] = useState({ full_name: '', phone: '', city: '', project_name: '' });
  const [stats, setStats] = useState({ progress: 0, completed: 0, remaining: 0 });
  const [messages, setMessages] = useState([]);
  const [team, setTeam] = useState([]);
  const [reports, setReports] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [budget, setBudget] = useState({ total: 0, spent: 0 });
  
  // UI States
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 1. جلب الملف الشخصي
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      // 2. جلب إحصائيات المهام
      const { count: totalTasks } = await supabase.from('checklists').select('*', { count: 'exact', head: true });
      const { count: completedTasks } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      
      const total = totalTasks || 28;
      const completed = completedTasks || 0;
      setStats({
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        remaining: total - completed
      });

      // (ملاحظة: يمكنك لاحقاً إضافة دوال جلب الرسائل والمستندات هنا بنفس الطريقة)
      
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
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-blue-600 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold">جاري تجهيز بيانات الورش...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24" dir="rtl">
      
      {/* الأزرار السريعة */}
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5">
          <Calculator className="text-blue-500" size={20} /> الحاسبة الذكية لتكاليف الورش
        </button>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5">
          <Star className="text-yellow-500" size={20} /> تقييم الحرفيين
        </button>
      </div>

      {/* صندوق الرسائل السريع */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-t-blue-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <MessageCircle /> صندوق الرسائل (محادثاتي مع المهنيين)
          </h2>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> جاري الاتصال بالرادار...
          </span>
        </div>
        <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500">
          {messages.length === 0 ? '📭 لا توجد محادثات حتى الآن.' : '...'}
        </div>
      </div>

      {/* البطاقات الإحصائية الملونة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center transform transition-transform hover:scale-105">
          <span className="text-sm font-bold opacity-90 mb-2">تقدم المشروع</span>
          <span className="text-5xl font-black">{stats.progress}%</span>
          <span className="text-xs opacity-75 mt-2">من إجمالي المهام</span>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center transform transition-transform hover:scale-105">
          <span className="text-sm font-bold opacity-90 mb-2">المهام المنجزة</span>
          <span className="text-5xl font-black">{stats.completed}</span>
          <span className="text-xs opacity-75 mt-2">مهمة مكتملة</span>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center transform transition-transform hover:scale-105">
          <span className="text-sm font-bold opacity-90 mb-2">المهام المتبقية</span>
          <span className="text-5xl font-black">{stats.remaining}</span>
          <span className="text-xs opacity-75 mt-2">مهمة قيد الانتظار</span>
        </div>
      </div>

      {/* بيانات المقاولة والتقدم */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* نموذج الملف الشخصي */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Briefcase className="text-blue-600" /> بيانات المقاولة / الشركة
          </h2>
          
          {saveStatus === 'success' && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 font-bold text-sm"><CheckCircle2 size={18}/> تم حفظ التغييرات بنجاح!</div>}
          {saveStatus === 'error' && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 font-bold text-sm"><AlertCircle size={18}/> حدث خطأ أثناء الحفظ.</div>}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">اسم المقاول / الشركة</label>
              <input type="text" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} required className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">رقم الهاتف</label>
              <input type="tel" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">المدينة</label>
                <input type="text" value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">الورش الحالي</label>
                <input type="text" value={profile.project_name || ''} onChange={e => setProfile({...profile, project_name: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
            </div>
            <button type="submit" disabled={saveStatus === 'loading'} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors mt-2">
              {saveStatus === 'loading' ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
            </button>
          </form>
        </div>

        {/* مساحة التقدم حسب المرحلة */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">📊 إحصائيات تفصيلية</h2>
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
             <p className="font-bold">التقدم حسب المرحلة سيظهر هنا</p>
          </div>
        </div>
      </div>

      {/* كاميرا الورشة */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-t-blue-500">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><Camera /> كاميرا الورشة وتقارير الميدان</h2>
            <p className="text-sm text-slate-500 mt-1">أحدث اللقطات من الميدان</p>
          </div>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all hover:scale-105">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span> طلب بث مباشر
          </button>
        </div>
        <div className="h-40 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500">
          {reports.length === 0 ? '⏳ لا توجد لقطات حديثة. سيقوم الحرفيون برفع الصور هنا.' : '...'}
        </div>
      </div>

      {/* الميزانية والخزانة (جنباً إلى جنب في الشاشات الكبيرة) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الميزانية */}
        <div className="bg-[#e6eef5] rounded-2xl p-6 shadow-sm border border-[#cdd7e0]">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-4"><Wallet /> رادار الميزانية</h2>
          <div className="bg-white p-5 rounded-xl border border-slate-200 mb-4">
            <div className="flex justify-between font-bold mb-3">
              <span>المصروف: <span className="text-orange-600">{budget.spent}</span> درهم</span>
              <span>الميزانية: <span className="text-emerald-500">{budget.total}</span> درهم</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-orange-400 w-0"></div>
            </div>
          </div>
        </div>

        {/* خزانة المستندات */}
        <div className="bg-[#e6eef5] rounded-2xl p-6 shadow-sm border border-[#cdd7e0]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><FolderOpen /> خزانة المستندات</h2>
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
              <Upload size={16} /> رفع
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl text-center border border-slate-200 hover:shadow-md cursor-pointer transition-shadow">
              <span className="text-3xl block mb-2">📜</span>
              <span className="text-xs font-bold text-slate-700">رخصة بناء.pdf</span>
            </div>
            <div className="bg-white p-4 rounded-xl text-center border border-slate-200 hover:shadow-md cursor-pointer transition-shadow">
              <span className="text-3xl block mb-2">📐</span>
              <span className="text-xs font-bold text-slate-700">تصميم.jpg</span>
            </div>
          </div>
        </div>
      </div>

      {/* زر الاستغاثة العائم */}
      <button 
        onClick={() => setIsSosOpen(true)}
        className="fixed bottom-8 left-8 bg-gradient-to-br from-red-500 to-red-700 text-white px-5 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_10px_25px_rgba(239,68,68,0.4)] hover:scale-105 transition-transform z-40"
      >
        <LifeBuoy /> استغاثة تقنية
      </button>

      {/* نافذة الاستغاثة (Modal) */}
      {isSosOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsSosOpen(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-100 pb-3 mb-4">🚨 طلب تدخل خبير تقني</h2>
            <p className="text-sm text-slate-500 mb-6">هل تواجه مشكلة في الورشة؟ اطلب استشارة خبير منصة SouqBTP فوراً.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">عنوان المشكلة</label>
                <input type="text" placeholder="مثال: شقوق في الحائط..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">مستوى الخطورة</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400">
                  <option>🔴 عاجل جداً (توقف العمل)</option>
                  <option>🟠 متوسط (اختلاف مع الحرفي)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">وصف التفاصيل</label>
                <textarea rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400"></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">🚀 إرسال النداء</button>
              <button onClick={() => setIsSosOpen(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}