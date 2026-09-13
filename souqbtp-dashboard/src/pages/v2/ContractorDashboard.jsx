import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Calculator, Star, MessageCircle, AlertCircle, 
  CheckCircle2, Clock, Briefcase, Camera, Wallet
} from 'lucide-react';

export default function ContractorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ progress: 0, completed: 0, remaining: 28 });
  const [profile, setProfile] = useState({ full_name: '', phone: '', city: '', project_name: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // جلب بيانات الملف الشخصي
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
      }

      // يمكنك لاحقاً إضافة استعلامات جلب الإحصائيات (Tasks) هنا
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-blue-600 font-bold">جاري تحميل مساحة العمل...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      
      {/* 1. الإجراءات السريعة */}
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
          <Calculator className="text-blue-500" size={20} />
          الحاسبة الذكية لتكاليف الورش
        </button>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
          <Star className="text-yellow-500" size={20} />
          تقييم الحرفيين
        </button>
      </div>

      {/* 2. البطاقات الإحصائية (بألوان Tailwind الحديثة) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center">
          <span className="text-sm font-bold opacity-90 mb-2">تقدم المشروع</span>
          <span className="text-4xl font-black">{stats.progress}%</span>
          <span className="text-xs opacity-75 mt-2">من إجمالي المهام</span>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center">
          <span className="text-sm font-bold opacity-90 mb-2">المهام المنجزة</span>
          <span className="text-4xl font-black">{stats.completed}</span>
          <span className="text-xs opacity-75 mt-2">مهمة مكتملة</span>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center">
          <span className="text-sm font-bold opacity-90 mb-2">المهام المتبقية</span>
          <span className="text-4xl font-black">{stats.remaining}</span>
          <span className="text-xs opacity-75 mt-2">مهمة قيد الانتظار</span>
        </div>
      </div>

      {/* 3. صندوق الرسائل وبيانات المقاولة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* بيانات الشركة */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Briefcase className="text-blue-600" /> بيانات المقاولة / الشركة
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">اسم المقاول / الشركة</label>
              <input type="text" value={profile.full_name || ''} readOnly className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">المدينة</label>
              <input type="text" value={profile.city || ''} readOnly className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">الورش الحالي</label>
              <input type="text" value={profile.project_name || ''} readOnly className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
            </div>
          </div>
        </div>

        {/* مساحة فارغة مجهزة للأقسام القادمة (الميزانية، الفريق) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400">
          <Wallet size={48} className="mb-4 opacity-50" />
          <p className="font-bold">رادار الميزانية سيُبرمج هنا قريباً...</p>
        </div>
      </div>

    </div>
  );
}