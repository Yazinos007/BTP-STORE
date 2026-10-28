import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Building2, Map, Users, LayoutDashboard, Siren, HardHat, 
  Settings, Briefcase, Database, ShieldCheck, X, CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [stats, setStats] = useState({
    architects: 0,
    workshops: 0,
    clients: 0,
    portals: 0,
    providers: 0,
  });
  
  const [sosRequests, setSosRequests] = useState([]);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [activeSosCount, setActiveSosCount] = useState(0);

  useEffect(() => {
    fetchDashboardStats();
    fetchSosRequests();

    // 📡 رادار الطوارئ الحي (Real-time SOS Radar)
    const channel = supabase
      .channel('admin-sos-radar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_requests' }, () => {
        fetchSosRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // 1. المهندسون
      const { count: archCount } = await supabase.from('architects').select('*', { count: 'exact', head: true });
      
      // 2. الورش النشطة
      const { count: workCount } = await supabase.from('conversations')
        .select('*', { count: 'exact', head: true })
        .not('project_name', 'is', null)
        .neq('project_name', '');
      
      // 3. البوابات الذكية
      const { count: portalsCount } = await supabase.from('client_portals').select('*', { count: 'exact', head: true });
      
      // 4. الحرفيون
      const { count: provCount } = await supabase.from('providers').select('*', { count: 'exact', head: true });
      
      // 5. العملاء (حساب أرقام الهواتف الفريدة من المحادثات كبديل لجدول users)
      const { data: clientsData } = await supabase.from('conversations').select('client_phone').not('client_phone', 'is', null);
      const uniqueClients = new Set((clientsData || []).map(c => c.client_phone));

      setStats({
        architects: archCount || 0,
        workshops: workCount || 0,
        portals: portalsCount || 0,
        providers: provCount || 0,
        clients: uniqueClients.size || 0
      });
    } catch (err) {
      console.error("خطأ في جلب الإحصائيات:", err);
    }
  };

  const fetchSosRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('sos_requests')
        .select('*')
        .order('status', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setSosRequests(data);
        setActiveSosCount(data.filter(req => req.status === 'pending').length);
      }
    } catch (err) {
      console.error("SOS Radar Error:", err);
    }
  };

  const resolveSOS = async (id) => {
    if (!window.confirm('هل تم حل هذه المشكلة بالفعل؟')) return;
    try {
      await supabase.from('sos_requests').update({ status: 'resolved' }).eq('id', id);
      fetchSosRequests();
    } catch (err) {
      alert("خطأ: " + err.message);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('ar-MA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-amber-400 shadow-lg">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1 tracking-tight flex items-center gap-2">
              غرفة القيادة المركزية
            </h1>
            <span className="inline-block bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-md mt-1">
              مدير النظام (Admin)
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden">
          <Building2 size={32} className="text-slate-400 mb-3" />
          <h4 className="text-sm font-bold text-slate-300 mb-1">المهندسون المعماريون</h4>
          <span className="text-4xl font-black">{stats.architects}</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 rounded-2xl text-white shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden">
          <Map size={32} className="text-emerald-200 mb-3" />
          <h4 className="text-sm font-bold text-emerald-100 mb-1">الورش والمشاريع النشطة</h4>
          <span className="text-4xl font-black">{stats.workshops}</span>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-500 p-6 rounded-2xl text-white shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden">
          <Users size={32} className="text-purple-200 mb-3" />
          <h4 className="text-sm font-bold text-purple-100 mb-1">إجمالي العملاء (CRM)</h4>
          <span className="text-4xl font-black">{stats.clients}</span>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-6 rounded-2xl text-white shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden">
          <LayoutDashboard size={32} className="text-orange-200 mb-3" />
          <h4 className="text-sm font-bold text-orange-100 mb-1">البوابات الذكية (Portals)</h4>
          <span className="text-4xl font-black">{stats.portals}</span>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 rounded-2xl text-white shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden">
          <HardHat size={32} className="text-blue-200 mb-3" />
          <h4 className="text-sm font-bold text-blue-100 mb-1">إجمالي الحرفيين</h4>
          <span className="text-4xl font-black">{stats.providers}</span>
        </div>

        {/* 🚨 SOS Radar Button */}
        <button 
          onClick={() => setIsSosModalOpen(true)}
          className={`p-6 rounded-2xl text-white shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden text-right flex flex-col items-start ${activeSosCount > 0 ? 'bg-gradient-to-br from-red-600 to-rose-500' : 'bg-gradient-to-br from-rose-400 to-rose-300'}`}
        >
          {activeSosCount > 0 && <div className="absolute inset-0 bg-red-500 animate-ping opacity-20"></div>}
          <Siren size={32} className={`mb-3 ${activeSosCount > 0 ? 'text-white animate-pulse' : 'text-rose-100'}`} />
          <h4 className="text-sm font-bold text-white/90 mb-1">نداءات طوارئ (SOS)</h4>
          <span className="text-4xl font-black">{activeSosCount}</span>
        </button>
      </div>

      {/* Shortcuts */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Zap size={24} className="text-amber-500 fill-current" /> لوحة التحكم السريع (Shortcuts)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Link to="/v2/admin-workshops" className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-slate-50 hover:bg-white group">
            <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600">إدارة المهندسين والورش</span>
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-500 group-hover:bg-blue-50 transition-colors"><Map size={24}/></div>
          </Link>

          <Link to="/v2/admin-crm" className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-slate-50 hover:bg-white group">
            <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600">مركز العملاء وتوثيق الحرفيين (CRM)</span>
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-500 group-hover:bg-blue-50 transition-colors"><Users size={24}/></div>
          </Link>

          <Link to="/v2/admin-services" className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-slate-50 hover:bg-white group">
            <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600">إدارة الخدمات والمهام (Checklists)</span>
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-500 group-hover:bg-blue-50 transition-colors"><Briefcase size={24}/></div>
          </Link>
          
          <Link to="/v2/admin-global-settings" className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all bg-slate-50 hover:bg-white group">
            <span className="font-bold text-slate-700 text-lg group-hover:text-emerald-600">الإعدادات المالية وتصاريح الإدارة</span>
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-50 transition-colors"><Settings size={24}/></div>
          </Link>

          <Link to="/v2/admin-audit" className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-800 hover:border-slate-900 shadow-lg shadow-slate-900/20 transition-all bg-slate-900 text-white group md:col-span-2">
            <span className="font-black text-lg">الصندوق الأسود (Audit Logs)</span>
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-white transition-colors"><Database size={24}/></div>
          </Link>

        </div>
      </div>

      {/* ================= SOS Modal ================= */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl border-t-8 border-t-red-500 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-red-600 flex items-center gap-3">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
                رادار نداءات الطوارئ (SOS)
              </h3>
              <div className="flex gap-2">
                <button onClick={fetchSosRequests} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors shadow-sm">🔄 تحديث</button>
                <button onClick={() => setIsSosModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-colors"><X size={20}/></button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                  <tr>
                    <th className="p-4 font-black">الوقت</th>
                    <th className="p-4 font-black">الهوية</th>
                    <th className="p-4 font-black text-center">الخطورة</th>
                    <th className="p-4 font-black">المشكلة</th>
                    <th className="p-4 font-black text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {sosRequests.length === 0 ? (
                    <tr><td colSpan="5" className="p-16 text-center text-emerald-600 font-bold bg-emerald-50 rounded-xl">🛡️ الأجواء آمنة تماماً! لا توجد نداءات طوارئ حالياً.</td></tr>
                  ) : (
                    sosRequests.map(req => (
                      <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500 text-xs font-bold">{formatDate(req.created_at)}</td>
                        <td className="p-4 text-blue-600 font-mono font-bold" dir="ltr">{req.user_id?.substring(0,6)}..</td>
                        <td className="p-4 text-center">
                          {req.urgency?.includes('عاجل') 
                            ? <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap">عاجلة جداً 🔥</span>
                            : <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap">عادية</span>
                          }
                        </td>
                        <td className="p-4 font-bold text-slate-800">{req.subject}</td>
                        <td className="p-4 text-center">
                          {req.status === 'pending' ? (
                            <button onClick={() => resolveSOS(req.id)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs transition-colors shadow-md shadow-emerald-500/20 whitespace-nowrap flex items-center justify-center gap-1 mx-auto">
                              <CheckCircle2 size={14} /> إغلاق
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs font-black flex items-center justify-center gap-1">
                              <CheckCircle2 size={14} /> تم الحل
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}