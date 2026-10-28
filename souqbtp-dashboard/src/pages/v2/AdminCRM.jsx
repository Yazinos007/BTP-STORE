import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Users, Building2, HardHat, RefreshCcw, Trash2, CheckCircle2, 
  MessageCircle, Loader2, AlertCircle, LayoutDashboard, BadgeCheck, Store
} from 'lucide-react';

export default function AdminCRM() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [activeTab, setActiveTab] = useState('clients');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  // Data States
  const [clients, setClients] = useState([]);
  const [architects, setArchitects] = useState([]);
  const [providers, setProviders] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // 🌟 فئة التجار والموردين الجديدة

  // Stats
  const [clientStats, setClientStats] = useState({ total: 0, registered: 0, external: 0 });

  useEffect(() => {
    if (activeTab === 'clients') loadClients();
    if (activeTab === 'architects') loadArchitects();
    if (activeTab === 'providers') loadProviders();
    if (activeTab === 'suppliers') loadSuppliers(); // 🌟 تحميل التجار
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

  // ================= 1. محرك جلب بيانات المقاولين والعملاء =================
  const loadClients = async () => {
    setIsLoading(true);
    try {
      const { data: convData, error } = await supabase
        .from('conversations')
        .select('client_id, client_name, client_phone, project_name');
        
      if (error) throw error;

      const validClientIds = [];
      if (convData) {
        convData.forEach(c => {
          if (c.client_id && c.client_id !== '0' && c.client_id !== 'null' && !validClientIds.includes(c.client_id)) {
            validClientIds.push(c.client_id);
          }
        });
      }

      const profilesMap = {};
      if (validClientIds.length > 0) {
        const { data: profilesData } = await supabase.from('profiles').select('id, phone, full_name').in('id', validClientIds);
        if (profilesData) profilesData.forEach(p => profilesMap[p.id] = p);
      }

      const clientsMap = new Map();
      let registeredCount = 0; 
      let externalCount = 0;

      if (convData) {
        convData.forEach(c => {
          const isRegistered = c.client_id && c.client_id.trim() !== '' && c.client_id !== '0' && c.client_id !== 'null';
          const uniqueKey = isRegistered ? c.client_id : (c.client_phone ? c.client_phone : null);
          if (!uniqueKey) return; 

          let actualPhone = c.client_phone || 'غير متوفر';
          let actualName = c.client_name || 'عميل غير محدد';

          if (isRegistered && profilesMap[c.client_id]) {
            if (profilesMap[c.client_id].phone) actualPhone = profilesMap[c.client_id].phone;
            if (profilesMap[c.client_id].full_name) actualName = profilesMap[c.client_id].full_name;
          }

          if (!clientsMap.has(uniqueKey)) {
            clientsMap.set(uniqueKey, { id: c.client_id, name: actualName, phone: actualPhone, isRegistered: isRegistered, projectsCount: 0, projectsList: [] });
          }

          const clientObj = clientsMap.get(uniqueKey);
          if (c.project_name && c.project_name.trim() !== '') {
            clientObj.projectsCount++;
            if(!clientObj.projectsList.includes(c.project_name)) clientObj.projectsList.push(c.project_name);
          }
        });
      }

      const allClients = Array.from(clientsMap.values());
      allClients.forEach(c => { if (c.isRegistered) registeredCount++; else externalCount++; });

      setClientStats({ total: allClients.length, registered: registeredCount, external: externalCount });
      setClients(allClients);

    } catch (err) {
      showAlert('error', 'خطأ في جلب بيانات العملاء');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= 2. محرك جلب بيانات المهندسين =================
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

  // ================= 3. محرك جلب الحرفيين وتوثيقهم =================
  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('providers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      showAlert('error', 'خطأ في جلب بيانات الحرفيين');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= 4. 🌟 محرك جلب التجار والموردين (جديد) =================
  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      showAlert('error', 'خطأ في جلب بيانات الموردين');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= أدوات الرقابة (الحذف والتوثيق) =================
  const verifyProvider = async (id, name) => {
    if(!window.confirm(`هل أنت متأكد من توثيق حساب الحرفي (${name}) وتفعيله للظهور في المنصة؟`)) return;
    try {
      const { error } = await supabase.from('providers').update({ is_verified: true, status: 'active' }).eq('id', id);
      if (error) throw error;
      
      logToBlackBox('VERIFY_PROVIDER', `قام بتوثيق وتفعيل حساب الحرفي: ${name}`);
      showAlert('success', "تم توثيق الحساب وتفعيله بنجاح!");
      loadProviders();
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const deleteRecord = async (table, id, name, reloadFunc) => {
    if(!window.confirm(`⚠️ تحذير: هل أنت متأكد من الحذف النهائي لـ (${name}) من قاعدة البيانات؟`)) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      
      let roleName = 'مستخدم';
      if(table === 'architects') roleName = 'مهندس';
      if(table === 'providers') roleName = 'حرفي';
      if(table === 'suppliers') roleName = 'تاجر/مورد';
      
      logToBlackBox('DELETE_USER', `قام بحذف حساب ${roleName}: ${name}`);
      
      showAlert('success', "تم الحذف بنجاح!");
      reloadFunc();
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const getWhatsAppLink = (phone) => {
    if (!phone) return '#';
    let waPhone = phone.replace(/\D/g, '');
    if (waPhone.startsWith('0')) waPhone = '212' + waPhone.substring(1);
    return `https://wa.me/${waPhone}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1 tracking-tight">مركز البيانات الشامل (CRM)</h1>
            <p className="text-slate-500 font-medium">إدارة ومراقبة قاعدة المقاولين، المهندسين، الحرفيين، والتجار</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
        <button onClick={() => setActiveTab('clients')} className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all ${activeTab === 'clients' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Users size={18} /> المقاولون وأصحاب المشاريع
        </button>
        <button onClick={() => setActiveTab('architects')} className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all ${activeTab === 'architects' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Building2 size={18} /> المهندسون المعماريون
        </button>
        <button onClick={() => setActiveTab('providers')} className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all ${activeTab === 'providers' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <HardHat size={18} /> الحرفيون (البريكول)
        </button>
        {/* 🌟 زر تبويب التجار والموردين */}
        <button onClick={() => setActiveTab('suppliers')} className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all ${activeTab === 'suppliers' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Store size={18} /> التجار والموردون
        </button>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-xl font-bold flex items-center justify-center gap-3 border text-sm animate-fade-in ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* ================= 1. CLIENTS TAB ================= */}
      {activeTab === 'clients' && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Users size={28}/></div>
              <div><h4 className="text-slate-500 font-bold text-sm mb-1">المقاولون المتفاعلون</h4><span className="text-2xl font-black text-slate-800">{clientStats.total}</span></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><CheckCircle2 size={28}/></div>
              <div><h4 className="text-slate-500 font-bold text-sm mb-1">مقاولون مسجلون</h4><span className="text-2xl font-black text-slate-800">{clientStats.registered}</span></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><AlertCircle size={28}/></div>
              <div><h4 className="text-slate-500 font-bold text-sm mb-1">عملاء خارجيين (Leads)</h4><span className="text-2xl font-black text-slate-800">{clientStats.external}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <span className="text-slate-600 font-bold text-sm">📍 قائمة بجميع المقاولين والعملاء (المسجلين والخارجيين) المرتبطين بمشاريع.</span>
              <button onClick={loadClients} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-sm transition-colors flex items-center gap-2 shadow-sm">
                <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /> تحديث البيانات
              </button>
            </div>
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                  <tr>
                    <th className="p-4 font-black">العميل (الاسم)</th>
                    <th className="p-4 font-black">رقم الهاتف (الواتساب)</th>
                    <th className="p-4 font-black text-center">نوع الحساب</th>
                    <th className="p-4 font-black text-center">إجمالي الأوراش</th>
                    <th className="p-4 font-black text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><Loader2 className="mx-auto mb-2 animate-spin text-blue-500" size={24}/> جاري مسح الرادارات...</td></tr> : 
                    clients.length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold">لا يوجد مقاولون حالياً.</td></tr> :
                    clients.map((c, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-purple-700">👤 {c.name}</td>
                        <td className="p-4 font-mono font-bold text-slate-600" dir="ltr">{c.phone}</td>
                        <td className="p-4 text-center">
                          {c.isRegistered ? <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black">🟢 مسجل بالمنصة</span> : <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-black">⚪ خارجي</span>}
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg font-black text-xs">🏗️ {c.projectsCount} ورشة</span>
                        </td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          {c.phone !== 'غير متوفر' && c.phone.length >= 9 && (
                            <a href={getWhatsAppLink(c.phone)} target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="مراسلة عبر واتساب"><MessageCircle size={18} /></a>
                          )}
                          <button onClick={() => window.alert('يتم حذف العملاء عن طريق حذف ورشهم في قسم المهندسين.')} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. ARCHITECTS TAB ================= */}
      {activeTab === 'architects' && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <span className="text-slate-600 font-bold text-sm">📍 قائمة المهندسين المعماريين ومكاتب الدراسات المسجلة في المنصة.</span>
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
                  <th className="p-4 font-black">الهاتف</th>
                  <th className="p-4 font-black">البريد الإلكتروني</th>
                  <th className="p-4 font-black text-center">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><Loader2 className="mx-auto mb-2 animate-spin text-blue-500" size={24}/> جاري جلب المهندسين...</td></tr> : 
                  architects.length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold">لا يوجد مهندسون مسجلون.</td></tr> :
                  architects.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-black text-blue-600">🏢 {a.agency_name || <span className="text-slate-400">غير محدد</span>}</td>
                      <td className="p-4 font-bold text-slate-700">{a.full_name || <span className="text-slate-400">غير محدد</span>}</td>
                      <td className="p-4 font-mono font-bold text-slate-500" dir="ltr">{a.phone || '-'}</td>
                      <td className="p-4 font-mono font-bold text-slate-500" dir="ltr">{a.email || '-'}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => deleteRecord('architects', a.id, a.agency_name || a.full_name, loadArchitects)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 mx-auto">
                          <Trash2 size={14} /> حذف وإيقاف
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

      {/* ================= 3. PROVIDERS TAB ================= */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <span className="text-slate-600 font-bold text-sm">📍 قائمة الحرفيين (البريكول). يمكنك توثيق حساباتهم المعلقة من هنا.</span>
            <button onClick={loadProviders} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-sm transition-colors flex items-center gap-2 shadow-sm">
              <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /> تحديث البيانات
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                <tr>
                  <th className="p-4 font-black">اسم الحرفي</th>
                  <th className="p-4 font-black">التخصص</th>
                  <th className="p-4 font-black">الهاتف</th>
                  <th className="p-4 font-black text-center">حالة التوثيق</th>
                  <th className="p-4 font-black text-center">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><Loader2 className="mx-auto mb-2 animate-spin text-blue-500" size={24}/> جاري جلب الحرفيين...</td></tr> : 
                  providers.length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold">لا يوجد حرفيون مسجلون.</td></tr> :
                  providers.map((p) => {
                    const isVerified = (p.is_verified === true || p.is_verified === 'true') && p.status !== 'pending';
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-black text-slate-800">{p.full_name || 'مجهول'}</td>
                        <td className="p-4 font-bold text-slate-500">{p.service_type || 'غير محدد'}</td>
                        <td className="p-4 font-mono font-bold text-slate-500" dir="ltr">{p.phone || '-'}</td>
                        <td className="p-4 text-center">
                          {isVerified 
                            ? <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1"><BadgeCheck size={14}/> موثق ونشط</span>
                            : <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1"><AlertCircle size={14}/> بانتظار التوثيق</span>
                          }
                        </td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          {!isVerified && (
                            <button onClick={() => verifyProvider(p.id, p.full_name)} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-500/20" title="الموافقة على الحساب وتفعيله">
                              <CheckCircle2 size={14} /> توثيق وتفعيل
                            </button>
                          )}
                          <button onClick={() => deleteRecord('providers', p.id, p.full_name, loadProviders)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1">
                            <Trash2 size={14} /> حذف
                          </button>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 4. SUPPLIERS TAB (الجديد) ================= */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <span className="text-slate-600 font-bold text-sm">📍 قائمة الموردين وتجار التجزئة المسجلين بالمنصة.</span>
            <button onClick={loadSuppliers} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-sm transition-colors flex items-center gap-2 shadow-sm">
              <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /> تحديث البيانات
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                <tr>
                  <th className="p-4 font-black">اسم الشركة / المحل</th>
                  <th className="p-4 font-black">نوع التاجر</th>
                  <th className="p-4 font-black">الهاتف</th>
                  <th className="p-4 font-black">البريد الإلكتروني</th>
                  <th className="p-4 font-black text-center">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold"><Loader2 className="mx-auto mb-2 animate-spin text-blue-500" size={24}/> جاري جلب بيانات التجار والموردين...</td></tr> : 
                  suppliers.length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold">لا يوجد تجار أو موردون مسجلون.</td></tr> :
                  suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-black text-slate-800">{s.store_name || s.full_name || 'مجهول'}</td>
                      <td className="p-4">
                        {s.supplier_type === 'wholesale' 
                          ? <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1">🏭 مورد جملة (B2B)</span>
                          : <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1">🏪 تاجر تجزئة (POS)</span>
                        }
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-500" dir="ltr">{s.phone || '-'}</td>
                      <td className="p-4 font-mono font-bold text-slate-500" dir="ltr">{s.email || '-'}</td>
                      <td className="p-4 text-center flex items-center justify-center gap-2">
                        <button onClick={() => deleteRecord('suppliers', s.id, s.store_name || s.full_name, loadSuppliers)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1">
                          <Trash2 size={14} /> حذف
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