import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Briefcase, HardHat, CheckSquare, Link as LinkIcon, BarChart3, 
  Plus, Trash2, Loader2, AlertCircle, CheckCircle2, LayoutDashboard 
} from 'lucide-react';

export default function AdminProjects() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [activeTab, setActiveTab] = useState('services');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  // Data States
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({ services: 0, providers: 0, checklists: 0, links: 0, stages: {} });

  // Forms States
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', stage_id: '1', icon: '' });
  const [providerForm, setProviderForm] = useState({ name: '', city: '', phone: '', rating: '' });
  const [checklistForm, setChecklistForm] = useState({ service_id: '', task: '', order: '' });
  const [linkForm, setLinkForm] = useState({ provider_id: '', selected_services: [] });
  const [checklistFilter, setChecklistFilter] = useState('');

  const stageNames = { 1: 'التخطيط', 2: 'التنفيذ', 3: 'التشطيب', 4: 'التحفيظ' };
  const stageColors = { 1: 'bg-blue-100 text-blue-700', 2: 'bg-orange-100 text-orange-700', 3: 'bg-purple-100 text-purple-700', 4: 'bg-emerald-100 text-emerald-700' };

  useEffect(() => {
    fetchAllData();

    // 📡 رادار التحديث الحي الشامل (Real-time Magic)
    const channel = supabase
      .channel('projects-comprehensive-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        fetchServices(); fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'providers' }, () => {
        fetchProviders(); fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklists' }, () => {
        fetchChecklists(); fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'provider_services' }, () => {
        fetchLinks(); fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchServices(),
      fetchProviders(),
      fetchChecklists(),
      fetchLinks(),
      fetchStats()
    ]);
    setIsLoading(false);
  };

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
  };

  // ================= FETCHERS =================
  const fetchServices = async () => {
    const { data, error } = await supabase.from('services').select('*').order('stage_id', { ascending: true });
    if (!error) setServices(data || []);
  };

  const fetchProviders = async () => {
    const { data, error } = await supabase.from('providers').select('*').order('full_name', { ascending: true });
    if (!error) setProviders(data || []);
  };

  const fetchChecklists = async () => {
    let query = supabase.from('checklists').select('*, services(name)').order('sort_order', { ascending: true });
    if (checklistFilter) query = query.eq('service_id', checklistFilter);
    const { data, error } = await query;
    if (!error) setChecklists(data || []);
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase.from('provider_services').select('id, providers(full_name), services(name)');
    if (!error) setLinks(data || []);
  };

  const fetchStats = async () => {
    const [sCount, pCount, cCount, lCount, stageData] = await Promise.all([
      supabase.from('services').select('*', { count: 'exact', head: true }),
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase.from('checklists').select('*', { count: 'exact', head: true }),
      supabase.from('provider_services').select('*', { count: 'exact', head: true }),
      supabase.from('services').select('stage_id')
    ]);

    const sCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    stageData.data?.forEach(s => { if (sCounts[s.stage_id] !== undefined) sCounts[s.stage_id]++; });

    setStats({
      services: sCount.count || 0,
      providers: pCount.count || 0,
      checklists: cCount.count || 0,
      links: lCount.count || 0,
      stages: sCounts
    });
  };

  useEffect(() => { fetchChecklists(); }, [checklistFilter]);

  // ================= HANDLERS =================
  const handleAddService = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('services').insert([{ 
      name: serviceForm.name, description: serviceForm.description, stage_id: parseInt(serviceForm.stage_id), icon: serviceForm.icon 
    }]);
    if (error) showAlert('error', error.message);
    else {
      showAlert('success', 'تم إضافة الخدمة بنجاح');
      setServiceForm({ name: '', description: '', stage_id: '1', icon: '' });
      // Fetch handled by Realtime
    }
  };

  const handleAddProvider = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('providers').insert([{ 
      full_name: providerForm.name, city: providerForm.city, phone: providerForm.phone, rating: parseFloat(providerForm.rating) || null 
    }]);
    if (error) showAlert('error', error.message);
    else {
      showAlert('success', 'تم إضافة الحرفي بنجاح');
      setProviderForm({ name: '', city: '', phone: '', rating: '' });
    }
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('checklists').insert([{ 
      service_id: parseInt(checklistForm.service_id), task_description: checklistForm.task, sort_order: parseInt(checklistForm.order) || null 
    }]);
    if (error) showAlert('error', error.message);
    else {
      showAlert('success', 'تم إضافة المهمة بنجاح');
      setChecklistForm({ service_id: '', task: '', order: '' });
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (linkForm.selected_services.length === 0) {
      showAlert('error', 'يرجى اختيار خدمة واحدة على الأقل');
      return;
    }
    const linksToInsert = linkForm.selected_services.map(sid => ({
      provider_id: parseInt(linkForm.provider_id),
      service_id: parseInt(sid)
    }));
    
    const { error } = await supabase.from('provider_services').insert(linksToInsert);
    if (error) showAlert('error', error.message);
    else {
      showAlert('success', 'تم ربط الحرفي بالخدمات بنجاح');
      setLinkForm({ provider_id: '', selected_services: [] });
    }
  };

  const handleDelete = async (table, id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) showAlert('error', error.message);
    else {
      showAlert('success', 'تم الحذف بنجاح');
    }
  };

  // ================= UI HELPERS =================
  const tabs = [
    { id: 'services', label: 'الخدمات', icon: Briefcase },
    { id: 'providers', label: 'الحرفيين', icon: HardHat },
    { id: 'checklists', label: 'قوائم التحقق', icon: CheckSquare },
    { id: 'link', label: 'ربط حرفي بخدمة', icon: LinkIcon },
    { id: 'stats', label: 'الإحصائيات', icon: BarChart3 }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-8 text-center text-white shadow-xl">
        <LayoutDashboard size={48} className="mx-auto mb-4 opacity-90" />
        <h1 className="text-3xl font-black mb-2">إدارة الأوراش والمشاريع</h1>
        <p className="text-blue-100 font-medium">إدارة الخدمات الأساسية، الحرفيين، قوائم التحقق، وربط المهام</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-xl font-bold flex items-center justify-center gap-3 border text-sm animate-fade-in ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.text}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
        
        {/* ================= SERVICES TAB ================= */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Plus size={20} className="text-blue-600"/> إضافة خدمة جديدة</h3>
              <form onSubmit={handleAddService} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم الخدمة *</label>
                  <input type="text" required value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="مثال: سباكة" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الوصف</label>
                  <textarea value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none resize-none h-24" placeholder="وصف تفصيلي..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">المرحلة *</label>
                    <select value={serviceForm.stage_id} onChange={e => setServiceForm({...serviceForm, stage_id: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold">
                      {Object.entries(stageNames).map(([id, name]) => (
                        <option key={id} value={id}>{id} - {name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">الأيقونة (Emoji)</label>
                    <input type="text" maxLength="2" value={serviceForm.icon} onChange={e => setServiceForm({...serviceForm, icon: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="🚰" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all shadow-md mt-2">➕ إضافة الخدمة</button>
              </form>
            </div>
            
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Briefcase size={20} className="text-blue-600"/> الخدمات الحالية</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-4 font-black">الخدمة</th>
                      <th className="p-4 font-black">المرحلة</th>
                      <th className="p-4 font-black text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{s.icon || '🔹'} {s.name}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-md text-xs font-black whitespace-nowrap ${stageColors[s.stage_id]}`}>{stageNames[s.stage_id]}</span></td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDelete('services', s.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-400">لا توجد خدمات مضافة.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= PROVIDERS TAB ================= */}
        {activeTab === 'providers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
             <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Plus size={20} className="text-blue-600"/> إضافة حرفي جديد</h3>
              <form onSubmit={handleAddProvider} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل *</label>
                  <input type="text" required value={providerForm.name} onChange={e => setProviderForm({...providerForm, name: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="مثال: أحمد بنعلي" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">المدينة *</label>
                  <input type="text" required value={providerForm.city} onChange={e => setProviderForm({...providerForm, city: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="مثال: الدار البيضاء" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف *</label>
                    <input type="tel" required dir="ltr" value={providerForm.phone} onChange={e => setProviderForm({...providerForm, phone: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-right" placeholder="0612345678" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">التقييم (من 5)</label>
                    <input type="number" min="0" max="5" step="0.1" value={providerForm.rating} onChange={e => setProviderForm({...providerForm, rating: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="4.5" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all shadow-md mt-2">➕ إضافة حرفي</button>
              </form>
            </div>
            
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><HardHat size={20} className="text-blue-600"/> الحرفيين الحاليين</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-4 font-black">الاسم</th>
                      <th className="p-4 font-black">المدينة / الهاتف</th>
                      <th className="p-4 font-black text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map(p => (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{p.full_name}<br/><span className="text-xs text-amber-500">⭐ {p.rating || 'غير محدد'}</span></td>
                        <td className="p-4 text-slate-500 text-xs font-bold font-mono" dir="ltr">📍 {p.city || '-'} <br/> {p.phone}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDelete('providers', p.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {providers.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-400">لا يوجد حرفيين مسجلين هنا.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= CHECKLISTS TAB ================= */}
        {activeTab === 'checklists' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Plus size={20} className="text-blue-600"/> إضافة مهمة جديدة</h3>
              <form onSubmit={handleAddChecklist} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اختر الخدمة *</label>
                  <select required value={checklistForm.service_id} onChange={e => setChecklistForm({...checklistForm, service_id: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold">
                    <option value="">-- اختر خدمة --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.icon || '🔹'} {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">وصف المهمة *</label>
                  <textarea required value={checklistForm.task} onChange={e => setChecklistForm({...checklistForm, task: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none resize-none h-24" placeholder="مثال: التأكد من مخططات السباكة"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ترتيب المهمة</label>
                  <input type="number" min="1" value={checklistForm.order} onChange={e => setChecklistForm({...checklistForm, order: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="1" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all shadow-md mt-2">➕ إضافة مهمة</button>
              </form>
            </div>
            
            <div>
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><CheckSquare size={20} className="text-blue-600"/> المهام الحالية</h3>
                <select value={checklistFilter} onChange={e => setChecklistFilter(e.target.value)} className="w-full sm:w-auto p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold focus:border-blue-500 outline-none">
                  <option value="">-- كل الخدمات --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.icon || '🔹'} {s.name}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-4 font-black">المهمة</th>
                      <th className="p-4 font-black text-center">الترتيب</th>
                      <th className="p-4 font-black text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklists.map(c => (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-700">{c.task_description}</p>
                          <span className="text-[10px] text-blue-500 font-black">{c.services?.name || 'غير محدد'}</span>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-500">{c.sort_order || '-'}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDelete('checklists', c.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {checklists.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-400">لا توجد مهام مطابقة.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= LINKS TAB ================= */}
        {activeTab === 'link' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><LinkIcon size={20} className="text-blue-600"/> ربط حرفي بالخدمات</h3>
              <form onSubmit={handleAddLink} className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اختر الحرفي *</label>
                  <select required value={linkForm.provider_id} onChange={e => setLinkForm({...linkForm, provider_id: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold">
                    <option value="">-- اختر حرفي --</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">اختر الخدمات * (يمكن اختيار أكثر من خدمة)</label>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                    {services.length === 0 && <p className="text-center text-slate-400 font-bold py-4">لا توجد خدمات متاحة</p>}
                    {services.map(s => (
                      <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                        <input 
                          type="checkbox" 
                          value={s.id}
                          checked={linkForm.selected_services.includes(s.id.toString())}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLinkForm(prev => ({
                              ...prev, 
                              selected_services: e.target.checked ? [...prev.selected_services, val] : prev.selected_services.filter(id => id !== val)
                            }));
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                        />
                        <span className="font-bold text-slate-700 text-sm">{s.icon || '🔹'} {s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-all shadow-md">🔗 ربط الحرفي بالخدمات</button>
              </form>
            </div>
            
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><LinkIcon size={20} className="text-blue-600"/> الروابط الحالية</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-4 font-black">الحرفي</th>
                      <th className="p-4 font-black">الخدمة المرتبطة</th>
                      <th className="p-4 font-black text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map(l => (
                      <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{l.providers?.full_name || '-'}</td>
                        <td className="p-4 text-blue-600 font-bold">{l.services?.name || '-'}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDelete('provider_services', l.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {links.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-400">لا يوجد ربط حالياً.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= STATS TAB ================= */}
        {activeTab === 'stats' && (
          <div className="animate-fade-in space-y-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6"><BarChart3 size={20} className="text-blue-600"/> الإحصائيات العامة</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center shadow-sm">
                <div className="text-blue-500 mb-2 flex justify-center"><Briefcase size={28}/></div>
                <div className="text-3xl font-black text-blue-900 mb-1">{stats.services}</div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-widest">إجمالي الخدمات</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 text-center shadow-sm">
                <div className="text-orange-500 mb-2 flex justify-center"><HardHat size={28}/></div>
                <div className="text-3xl font-black text-orange-900 mb-1">{stats.providers}</div>
                <div className="text-xs font-bold text-orange-700 uppercase tracking-widest">إجمالي الحرفيين</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center shadow-sm">
                <div className="text-purple-500 mb-2 flex justify-center"><CheckSquare size={28}/></div>
                <div className="text-3xl font-black text-purple-900 mb-1">{stats.checklists}</div>
                <div className="text-xs font-bold text-purple-700 uppercase tracking-widest">إجمالي المهام</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 text-center shadow-sm">
                <div className="text-emerald-500 mb-2 flex justify-center"><LinkIcon size={28}/></div>
                <div className="text-3xl font-black text-emerald-900 mb-1">{stats.links}</div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">الروابط النشطة</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mt-8">
              <h4 className="font-black text-slate-700 mb-4">تفاصيل المراحل</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(id => (
                  <div key={id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black ${stageColors[id]}`}>{stageNames[id]}</span>
                    <span className="font-black text-xl text-blue-700">{stats.stages[id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}