import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Building2, Map, LayoutDashboard, RefreshCcw, Trash2, 
  Eye, CheckCircle2, AlertCircle, Loader2, HardHat
} from 'lucide-react';

export default function AdminWorkshops() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [activeTab, setActiveTab] = useState('workshops');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  // Data States
  const [workshops, setWorkshops] = useState([]);
  const [architects, setArchitects] = useState([]);

  useEffect(() => {
    if (activeTab === 'workshops') loadWorkshops();
    if (activeTab === 'architects') loadArchitects();

    // 📡 رادار التحديث الحي (Real-time Magic)
    const channel = supabase
      .channel('admin-workshops-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        if (activeTab === 'workshops') loadWorkshops();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'architects' }, () => {
        if (activeTab === 'architects') loadArchitects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
  };

  // 🕵️‍♂️ دالة تسجيل الصندوق الأسود المدمجة
  const logToBlackBox = async (actionType, details) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminName = user?.user_metadata?.full_name || 'مدير النظام';
      await supabase.from('audit_logs').insert([{
        user_name: adminName,
        user_role: 'admin',
        action_type: actionType,
        details: details
      }]);
    } catch (err) {}
  };

  // ================= 1. محرك جلب بيانات المهندسين =================
  const loadArchitects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('architects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setArchitects(data || []);
    } catch (err) {
      showAlert('error', 'خطأ في جلب بيانات المهندسين');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= 2. محرك جلب الورش وبوابات العملاء (God Mode) =================
  const loadWorkshops = async () => {
    setIsLoading(true);
    try {
      // جلب المحادثات التي تحتوي على اسم مشروع (ورشات نشطة)
      const { data: convData, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .not('project_name', 'is', null)
        .neq('project_name', '')
        .order('created_at', { ascending: false });
      
      if (convErr) throw convErr;

      // جلب أسماء المهندسين
      const { data: archData } = await supabase.from('architects').select('id, full_name, agency_name');
      const archMap = {};
      if (archData) archData.forEach(a => archMap[a.id] = a.agency_name || a.full_name || 'مهندس');

      // جلب بوابات العملاء المرتبطة
      const { data: portalsData } = await supabase.from('client_portals').select('*');
      const portalMap = {};
      if (portalsData) portalsData.forEach(p => portalMap[p.project_id] = p);

      const formattedWorkshops = (convData || []).map(ws => {
        return {
          ...ws,
          architect_name: archMap[ws.architect_id] || 'مهندس محذوف',
          client_display: ws.client_name || ws.client_phone || 'عميل غير معروف',
          portal: portalMap[ws.id] || null
        };
      });

      setWorkshops(formattedWorkshops);
    } catch (err) {
      console.error(err);
      showAlert('error', 'خطأ في جلب بيانات الورش من السحابة');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= أدوات الحذف النهائي المدمرة =================
  const deleteArchitect = async (id, name) => {
    if(!window.confirm(`⚠️ تحذير شديد:\nهل أنت متأكد من رغبتك في حذف المهندس (${name})؟\nسيفقد المهندس هويته المهنية في المنصة نهائياً.`)) return;
    try {
      const { error } = await supabase.from('architects').delete().eq('id', id);
      if (error) throw error;
      
      logToBlackBox('DELETE_ARCHITECT', `قام بالحذف النهائي لحساب المهندس: ${name}`);
      showAlert('success', "تم مسح المهندس من قاعدة البيانات بنجاح!");
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const deleteWorkshop = async (id, projectName) => {
    if(!window.confirm(`⚠️ تحذير شديد:\nهل أنت متأكد من حذف ورشة (${projectName})؟\nسيتم مسحها من لوحة المهندس ومن بوابة العميل ولن يمكن استرجاعها!`)) return;
    try {
      // بفضل خاصية Cascade في Supabase، حذف الورشة (المحادثة) سيحذف البوابات والرسائل المرتبطة بها تلقائياً
      const { error } = await supabase.from('conversations').delete().eq('id', id);
      if (error) throw error;
      
      logToBlackBox('DELETE_WORKSHOP', `قام بتدمير ملف الورشة نهائياً: ${projectName}`);
      showAlert('success', "تم تدمير ملف الورشة بنجاح!");
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const getPortalUrl = (token) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.souqbtp.ma';
    return `${origin}/client-portal?token=${token}`; // توجيه لبوابة العميل الحديثة في React
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1 tracking-tight">الرقابة على المهندسين والورش</h1>
            <p className="text-slate-500 font-medium">مراقبة المشاريع، الدخول لبوابات العملاء (God Mode)، وإدارة مكاتب الدراسات</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
        <button onClick={() => setActiveTab('workshops')} className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all ${activeTab === 'workshops' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Map size={18} /> الورش المفتوحة والمراقبة
        </button>
        <button onClick={() => setActiveTab('architects')} className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all ${activeTab === 'architects' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Building2 size={18} /> قاعدة بيانات المهندسين
        </button>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-xl font-bold flex items-center justify-center gap-3 border text-sm animate-fade-in ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* ================= 1. WORKSHOPS TAB (God Mode) ================= */}
      {activeTab === 'workshops' && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <span className="text-slate-600 font-bold text-sm">📍 هنا يمكنك مراقبة جميع المشاريع العقارية، والدخول لبوابات العملاء كمسؤول للتأكد من سير العمل.</span>
            <button onClick={loadWorkshops} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-sm transition-colors flex items-center gap-2 shadow-sm">
              <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /> تحديث البيانات
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                <tr>
                  <th className="p-4 font-black">المشروع / الورشة</th>
                  <th className="p-4 font-black">المهندس المشرف</th>
                  <th className="p-4 font-black">العميل</th>
                  <th className="p-4 font-black text-center">الحالة</th>
                  <th className="p-4 font-black text-center">روابط المراقبة (God Mode)</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><Loader2 className="mx-auto mb-2 animate-spin text-indigo-500" size={24}/> جاري جلب بيانات الورش من السحابة...</td></tr> : 
                  workshops.length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold">لا توجد ورش نشطة حالياً.</td></tr> :
                  workshops.map((ws) => (
                    <tr key={ws.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-black text-slate-800 text-base">🏗️ {ws.project_name}</td>
                      <td className="p-4 font-bold text-indigo-600">{ws.architect_name}</td>
                      <td className="p-4 font-bold text-slate-700">👤 {ws.client_display}</td>
                      <td className="p-4 text-center">
                        {ws.status === 'active' 
                          ? <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1">أشغال جارية 🟢</span>
                          : <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1">متوقفة ⚪</span>
                        }
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {ws.portal?.access_token ? (
                            <>
                              <a href={getPortalUrl(ws.portal.access_token)} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/30" title="الدخول لبوابة العميل كمسؤول">
                                <Eye size={14} /> مراقبة البوابة
                              </a>
                              {ws.portal.report_url && (
                                <a href={ws.portal.report_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg font-bold text-xs transition-colors shadow-md shadow-amber-400/30" title="تحميل محضر المشروع">
                                  📑 محضر
                                </a>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">لا توجد بوابة</span>
                          )}
                          <button onClick={() => deleteWorkshop(ws.id, ws.project_name)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ml-2" title="حذف الورشة نهائياً">
                            <Trash2 size={14} /> مسح
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 2. ARCHITECTS TAB ================= */}
      {activeTab === 'architects' && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <span className="text-slate-600 font-bold text-sm">📍 قاعدة البيانات الرسمية للمهندسين المعماريين المسجلين في المنصة وهوياتهم المهنية.</span>
            <button onClick={loadArchitects} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-sm transition-colors flex items-center gap-2 shadow-sm">
              <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /> تحديث البيانات
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                <tr>
                  <th className="p-4 font-black">الوكالة / المكتب</th>
                  <th className="p-4 font-black">المهندس (الاسم)</th>
                  <th className="p-4 font-black">رقم القيد (Ordre)</th>
                  <th className="p-4 font-black">الهاتف</th>
                  <th className="p-4 font-black">البريد الإلكتروني</th>
                  <th className="p-4 font-black text-center">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-bold"><Loader2 className="mx-auto mb-2 animate-spin text-indigo-500" size={24}/> جاري جلب بيانات المهندسين...</td></tr> : 
                  architects.length === 0 ? <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-bold">لا يوجد مهندسون مسجلون حالياً.</td></tr> :
                  architects.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-black text-blue-600">🏢 {a.agency_name || <span className="text-slate-400">لم يحدد الهوية</span>}</td>
                      <td className="p-4 font-bold text-slate-700">{a.full_name || <span className="text-slate-400">غير معروف</span>}</td>
                      <td className="p-4 font-mono font-bold text-slate-500">{a.license_number || '-'}</td>
                      <td className="p-4 font-mono font-bold text-slate-500" dir="ltr">{a.phone || '-'}</td>
                      <td className="p-4 font-mono font-bold text-slate-500" dir="ltr">{a.email || '-'}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => deleteArchitect(a.id, a.agency_name || a.full_name)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 mx-auto">
                          <Trash2 size={14} /> حذف المهندس
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}