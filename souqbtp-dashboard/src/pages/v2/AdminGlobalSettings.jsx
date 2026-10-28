import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Settings, DollarSign, Percent, ShieldCheck, Users, 
  Trash2, Plus, Loader2, AlertCircle, CheckCircle2, UserCog, Mail
} from 'lucide-react';

export default function AdminGlobalSettings() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [isLoadingFinance, setIsLoadingFinance] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  // Finance Settings State
  const [financeId, setFinanceId] = useState(null);
  const [currency, setCurrency] = useState('MAD');
  const [tva, setTva] = useState(20);

  // Admins State
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    permissions: {
      crm: true,
      providers: false,
      reports: false,
      pricing: false
    }
  });

  useEffect(() => {
    loadFinancialSettings();
    loadAdmins();
  }, []);

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
  };

  // ================= 1. الإعدادات المالية =================
  const loadFinancialSettings = async () => {
    try {
      const { data, error } = await supabase.from('platform_settings').select('*').limit(1).maybeSingle();
      if (data) {
        setFinanceId(data.id);
        if (data.currency) setCurrency(data.currency);
        if (data.tva) setTva(data.tva);
      }
    } catch (err) {
      console.warn("جدول platform_settings غير موجود أو به خطأ.");
    }
  };

  const saveFinancialSettings = async (e) => {
    e.preventDefault();
    setIsLoadingFinance(true);
    try {
      if (financeId) {
        await supabase.from('platform_settings').update({ currency, tva }).eq('id', financeId);
      } else {
        const { data } = await supabase.from('platform_settings').insert([{ currency, tva }]).select();
        if (data && data[0]) setFinanceId(data[0].id);
      }
      showAlert('success', 'تم حفظ الإعدادات المالية بنجاح!');
    } catch (err) {
      showAlert('error', 'تأكد من إنشاء جدول platform_settings في قاعدة البيانات.');
    } finally {
      setIsLoadingFinance(false);
    }
  };

  // ================= 2. إدارة المديرين =================
  const loadAdmins = async () => {
    setIsLoadingAdmins(true);
    try {
      const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        setAdmins(data);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      setAdmins([]);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const saveAdmin = async () => {
    if (!adminForm.name.trim() || !adminForm.email.trim()) {
      showAlert('error', 'الرجاء كتابة اسم المدير وبريده الإلكتروني.');
      return;
    }
    
    setIsSavingAdmin(true);
    try {
      const { error } = await supabase.from('admin_users').insert([{
        name: adminForm.name.trim(),
        email: adminForm.email.trim(),
        permissions: adminForm.permissions
      }]);

      if (error) throw error;
      
      showAlert('success', 'تم إضافة المدير الجديد بنجاح!');
      setIsModalOpen(false);
      setAdminForm({ name: '', email: '', permissions: { crm: true, providers: false, reports: false, pricing: false } });
      loadAdmins();
    } catch (err) {
      showAlert('error', 'يرجى التأكد من وجود جدول admin_users في قاعدة البيانات.');
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const deleteAdmin = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من سحب صلاحيات المدير (${name}) وحذفه نهائياً؟`)) return;
    try {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) throw error;
      showAlert('success', 'تم حذف المدير وسحب صلاحياته بنجاح.');
      loadAdmins();
    } catch (err) {
      showAlert('error', 'حدث خطأ أثناء الحذف.');
    }
  };

  const togglePermission = (key) => {
    setAdminForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1 tracking-tight">الإعدادات العامة والمالية</h1>
            <p className="text-slate-500 font-medium">غرفة المحركات: تحكم في العملات، الضرائب، وصلاحيات فريق الإدارة بدقة متناهية.</p>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-xl font-bold flex items-center justify-center gap-3 border text-sm animate-fade-in ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ================= Financial Settings ================= */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <DollarSign className="text-emerald-500" /> الإعدادات المالية والعملات
            </h3>
          </div>
          
          <form onSubmit={saveFinancialSettings} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">العملة الافتراضية للمنصة</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-800">
                <option value="MAD">درهم مغربي (MAD)</option>
                <option value="EUR">يورو (EUR) 💶</option>
                <option value="USD">دولار أمريكي (USD) 💵</option>
                <option value="USDT">تيثر كريبتو (USDT) 🪙</option>
                <option value="BTC">بيتكوين (BTC) ₿</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">نسبة الضريبة (TVA) %</label>
              <div className="relative">
                <Percent className={`absolute top-3.5 ${isRtl ? 'left-4' : 'right-4'} text-slate-400`} size={18} />
                <input 
                  type="number" min="0" max="100" 
                  value={tva} onChange={(e) => setTva(e.target.value)} 
                  className={`w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-800 font-mono ${isRtl ? 'pl-11 pr-4 text-right' : 'pr-11 pl-4 text-left'}`}
                />
              </div>
            </div>
            
            <button type="submit" disabled={isLoadingFinance} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
              {isLoadingFinance ? <Loader2 className="animate-spin" size={20} /> : '💾 حفظ التغييرات المالية'}
            </button>
          </form>
        </div>

        {/* ================= Admins Management ================= */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" /> إدارة المديرين (Admins)
            </h3>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-1 shadow-md shadow-emerald-500/20">
              <Plus size={16} /> إضافة مدير
            </button>
          </div>
          
          <div className="p-6">
            {isLoadingAdmins ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Loader2 className="animate-spin mb-2 text-blue-500" size={24} />
                <p className="font-bold">جاري جلب فريق الإدارة...</p>
              </div>
            ) : admins.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 block text-base mb-1">أنت (المدير العام) 👑</strong>
                  <small className="text-slate-500 font-mono">admin@souqbtp.ma</small>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">صلاحيات مطلقة</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {admins.map((admin, index) => {
                  const isSuperAdmin = index === 0;
                  const p = admin.permissions || {};
                  const hasAll = p.crm && p.providers && p.reports && p.pricing;
                  
                  let tags = [];
                  if (p.crm) tags.push('CRM');
                  if (p.providers) tags.push('حرفيين');
                  if (p.pricing) tags.push('تسعير');
                  if (p.reports) tags.push('تقارير');
                  
                  return (
                    <div key={admin.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${isSuperAdmin ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                      <div>
                        <strong className="text-slate-800 block text-base mb-1">{admin.name} {isSuperAdmin && '👑'}</strong>
                        <small className="text-slate-500 font-mono font-bold text-[11px]">{admin.email}</small>
                      </div>
                      <div className="flex items-center gap-3">
                        {isSuperAdmin || hasAll ? (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap">صلاحيات مطلقة</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black text-center leading-relaxed">
                            {tags.length > 0 ? tags.join(' + ') : 'بدون صلاحيات'}
                          </span>
                        )}
                        {!isSuperAdmin && (
                          <button onClick={() => deleteAdmin(admin.id, admin.name)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors shrink-0" title="حذف المدير">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ================= Add Admin Modal ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <UserCog className="text-blue-600" /> إضافة مدير جديد وتحديد الصلاحيات
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <UserCog className={`absolute top-3.5 ${isRtl ? 'right-4' : 'left-4'} text-slate-400`} size={18} />
                  <input type="text" placeholder="اسم المدير (مثال: أحمد)" value={adminForm.name} onChange={(e) => setAdminForm({...adminForm, name: e.target.value})} className={`w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-sm ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
                </div>
                <div className="relative">
                  <Mail className={`absolute top-3.5 ${isRtl ? 'right-4' : 'left-4'} text-slate-400`} size={18} />
                  <input type="email" placeholder="البريد الإلكتروني" value={adminForm.email} onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} className={`w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-sm ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-1">
                <h4 className="font-black text-slate-700 mb-4 border-b border-slate-200 pb-2">تفعيل / تعطيل الصلاحيات:</h4>
                
                <label className="flex items-center justify-between p-3 hover:bg-white rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <div>
                    <strong className="text-slate-800 block text-sm">👥 إدارة العملاء (CRM)</strong>
                    <span className="text-slate-500 text-xs font-bold">رؤية طلبات الحاسبة والتواصل مع الزبائن</span>
                  </div>
                  <div className={`relative inline-block w-11 h-6 rounded-full transition-colors ${adminForm.permissions.crm ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${adminForm.permissions.crm ? (isRtl ? '-translate-x-6' : 'translate-x-6') : (isRtl ? 'translate-x-1' : 'translate-x-1')}`} style={{ [isRtl ? 'right' : 'left']: '4px' }}></span>
                  </div>
                  <input type="checkbox" className="hidden" checked={adminForm.permissions.crm} onChange={() => togglePermission('crm')} />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-white rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <div>
                    <strong className="text-slate-800 block text-sm">👷‍♂️ إدارة الحرفيين والمقاولين</strong>
                    <span className="text-slate-500 text-xs font-bold">قبول ورفض الحرفيين الجدد</span>
                  </div>
                  <div className={`relative inline-block w-11 h-6 rounded-full transition-colors ${adminForm.permissions.providers ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${adminForm.permissions.providers ? (isRtl ? '-translate-x-6' : 'translate-x-6') : (isRtl ? 'translate-x-1' : 'translate-x-1')}`} style={{ [isRtl ? 'right' : 'left']: '4px' }}></span>
                  </div>
                  <input type="checkbox" className="hidden" checked={adminForm.permissions.providers} onChange={() => togglePermission('providers')} />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-white rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <div>
                    <strong className="text-slate-800 block text-sm">📈 التقارير والتحليلات</strong>
                    <span className="text-slate-500 text-xs font-bold">رؤية المداخيل وإحصائيات السوق</span>
                  </div>
                  <div className={`relative inline-block w-11 h-6 rounded-full transition-colors ${adminForm.permissions.reports ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${adminForm.permissions.reports ? (isRtl ? '-translate-x-6' : 'translate-x-6') : (isRtl ? 'translate-x-1' : 'translate-x-1')}`} style={{ [isRtl ? 'right' : 'left']: '4px' }}></span>
                  </div>
                  <input type="checkbox" className="hidden" checked={adminForm.permissions.reports} onChange={() => togglePermission('reports')} />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-white rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <div>
                    <strong className="text-slate-800 block text-sm">🧮 التعديل على أسعار الحاسبة</strong>
                    <span className="text-slate-500 text-xs font-bold">تغيير أسعار المواد وعناصر التكلفة</span>
                  </div>
                  <div className={`relative inline-block w-11 h-6 rounded-full transition-colors ${adminForm.permissions.pricing ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${adminForm.permissions.pricing ? (isRtl ? '-translate-x-6' : 'translate-x-6') : (isRtl ? 'translate-x-1' : 'translate-x-1')}`} style={{ [isRtl ? 'right' : 'left']: '4px' }}></span>
                  </div>
                  <input type="checkbox" className="hidden" checked={adminForm.permissions.pricing} onChange={() => togglePermission('pricing')} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl transition-colors">إلغاء</button>
                <button onClick={saveAdmin} disabled={isSavingAdmin} className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 flex justify-center items-center gap-2">
                  {isSavingAdmin ? <Loader2 size={18} className="animate-spin" /> : '✔️ حفظ المدير والصلاحيات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}