import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Database, RefreshCcw, Loader2, AlertCircle, ShieldAlert
} from 'lucide-react';

export default function AdminAudit() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();

    // 📡 رادار التحديث الحي (Real-time Black Box)
    const channel = supabase
      .channel('audit-logs-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev].slice(0, 100)); // الاحتفاظ بآخر 100 عملية
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (sbError) throw sbError;
      setLogs(data || []);
    } catch (err) {
      console.error(err);
      setError('فشل الاتصال بخوادم السحابة لجلب سجل العمليات.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'توقيت غير معروف';
    const date = new Date(isoString);
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    
    return {
      date: `${yyyy}/${mm}/${dd}`,
      time: `${hh}:${min}:${sec}`
    };
  };

  const getActionStyle = (actionType) => {
    switch (actionType) {
      case 'ADD_ITEM':
      case 'ENABLE_ITEM':
      case 'VERIFY_PROVIDER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPDATE_PRICE':
      case 'UPDATE_SETTINGS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DISABLE_ITEM':
      case 'DELETE_USER':
      case 'DELETE_ARCHITECT':
      case 'DELETE_WORKSHOP':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case 'ADD_ITEM': return 'إضافة 🟢';
      case 'ENABLE_ITEM': return 'تفعيل 🟢';
      case 'VERIFY_PROVIDER': return 'توثيق 🟢';
      case 'UPDATE_PRICE': return 'تعديل سعر 🔵';
      case 'UPDATE_SETTINGS': return 'إعدادات 🔵';
      case 'DISABLE_ITEM': return 'تعطيل 🔴';
      case 'DELETE_USER': return 'حذف مستخدم 🔴';
      case 'DELETE_ARCHITECT': return 'حذف مهندس 🔴';
      case 'DELETE_WORKSHOP': return 'مسح ورشة 🔴';
      default: return 'عملية نظام 🟣';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-100">
            <Database size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1 tracking-tight">سجل العمليات (الصندوق الأسود)</h1>
            <p className="text-slate-500 font-medium">رادار تتبعي متقدم يجمع نشاطات الإدارة في خط زمني واحد غير قابل للتعديل.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Black Box Panel */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in">
        
        <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-100 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>
            آخر 100 عملية تم رصدها في المنصة
          </h3>
          <button onClick={fetchLogs} disabled={isLoading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20">
            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /> تحديث السجل
          </button>
        </div>

        <div className="overflow-x-auto max-h-[700px] custom-scrollbar">
          <table className="w-full text-sm text-right">
            <thead className="bg-[#1e293b] border-b-2 border-[#0f172a] text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-black">التوقيت</th>
                <th className="p-4 font-black">المسؤول (الأدمن)</th>
                <th className="p-4 font-black text-center">نوع العملية</th>
                <th className="p-4 font-black">التفاصيل (Details)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="p-16 text-center text-blue-400 font-bold"><Loader2 className="mx-auto mb-3 animate-spin" size={28}/> جاري فك تشفير البيانات وجمع السجلات...</td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-2">
                    <ShieldAlert size={32} className="opacity-50" />
                    لا توجد عمليات مسجلة في المنصة بعد.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const { date, time } = formatDate(log.created_at);
                  return (
                    <tr key={log.id} className="border-b border-[#1e293b] hover:bg-[#1e293b]/50 transition-colors">
                      <td className="p-4 text-left whitespace-nowrap" dir="ltr">
                        <span className="text-slate-500 text-xs">{date}</span>{' '}
                        <b className="text-cyan-400 font-mono tracking-wider ml-1">{time}</b>
                      </td>
                      <td className="p-4 font-black text-slate-200">{log.user_name}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1.5 rounded-lg border text-xs font-black whitespace-nowrap ${getActionStyle(log.action_type)}`}>
                          {getActionLabel(log.action_type)}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-400 leading-relaxed max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}