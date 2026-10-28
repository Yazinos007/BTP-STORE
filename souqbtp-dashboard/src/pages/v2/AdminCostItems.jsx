import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Calculator, Plus, Edit2, Power, PowerOff, X, 
  Search, ShieldCheck, Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function AdminCostItems() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    stage_id: '1',
    min_price: '',
    max_price: '',
    unit: '',
    sort_order: '1',
    is_active: true
  });

  const COST_STAGES = {
    1: { name: "التخطيط", icon: "📋", color: "bg-blue-100 text-blue-700" },
    2: { name: "التنفيذ", icon: "🏗️", color: "bg-orange-100 text-orange-700" },
    3: { name: "التشطيب", icon: "🎨", color: "bg-purple-100 text-purple-700" },
    4: { name: "التحفيظ", icon: "📜", color: "bg-emerald-100 text-emerald-700" }
  };

  useEffect(() => {
    fetchCostItems();
    
    // 📡 رادار التحديث الحي (Real-time Magic)
    const channel = supabase
      .channel('cost_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cost_items' }, () => {
        fetchCostItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCostItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cost_items')
        .select('*')
        .order('stage_id')
        .order('sort_order');
        
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching cost items:', err);
      showAlert('error', 'فشل الاتصال بقاعدة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  // 🕵️‍♂️ دالة تسجيل عمليات الصندوق الأسود المدمجة
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
    } catch (err) {
      console.error("BlackBox Error:", err);
    }
  };

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 4000);
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        stage_id: item.stage_id.toString(),
        min_price: item.min_price,
        max_price: item.max_price,
        unit: item.unit,
        sort_order: item.sort_order || '1',
        is_active: item.is_active
      });
    } else {
      setFormData({
        id: null, name: '', stage_id: '1', min_price: '', max_price: '', unit: '', sort_order: '1', is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      name: formData.name.trim(),
      stage_id: parseInt(formData.stage_id),
      min_price: parseFloat(formData.min_price) || 0,
      max_price: parseFloat(formData.max_price) || 0,
      unit: formData.unit.trim(),
      sort_order: parseInt(formData.sort_order) || 1,
      is_active: formData.is_active
    };

    try {
      if (formData.id) {
        await supabase.from('cost_items').update(payload).eq('id', formData.id);
        logToBlackBox('UPDATE_PRICE', `قام بتعديل أسعار مادة (${payload.name})`);
        showAlert('success', 'تم تحديث العنصر بنجاح');
      } else {
        await supabase.from('cost_items').insert([payload]);
        logToBlackBox('ADD_ITEM', `أضاف مادة جديدة للحاسبة باسم (${payload.name})`);
        showAlert('success', 'تم إضافة العنصر بنجاح');
      }
      setIsModalOpen(false);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus, name) => {
    const newState = !currentStatus;
    if (!window.confirm(newState ? 'هل تريد تفعيل هذا العنصر؟' : 'هل تريد تعطيل هذا العنصر وإخفاءه من الحاسبة؟')) return;
    
    try {
      await supabase.from('cost_items').update({ is_active: newState }).eq('id', id);
      logToBlackBox(newState ? 'ENABLE_ITEM' : 'DISABLE_ITEM', `قام بـ ${newState ? 'تفعيل' : 'تعطيل'} مادة التكلفة (${name})`);
      showAlert('success', 'تم تغيير حالة العنصر');
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400">
            <Calculator size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-1">إدارة عناصر التكاليف</h1>
            <p className="text-slate-400 font-medium">التحكم المركزي في مواد وأسعار الحاسبة الذكية</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="relative z-10 w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
          <Plus size={20} /> إضافة عنصر جديد
        </button>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-xl font-bold flex items-center gap-3 border text-sm animate-fade-in ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600"/> قاعدة بيانات المواد
          </h3>
          <div className="relative w-full md:w-72">
            <Search className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} size={18} />
            <input 
              type="text" 
              placeholder="البحث عن مادة..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 outline-none focus:border-blue-500 text-sm font-bold ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-black w-16 text-center">#</th>
                <th className="p-4 font-black">المادة / العنصر</th>
                <th className="p-4 font-black">المرحلة</th>
                <th className="p-4 font-black">السعر (أدنى - أعلى)</th>
                <th className="p-4 font-black">الوحدة</th>
                <th className="p-4 font-black text-center">الترتيب</th>
                <th className="p-4 font-black text-center">الحالة</th>
                <th className="p-4 font-black text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="p-12 text-center text-slate-400 font-bold"><Loader2 className="mx-auto mb-2 animate-spin text-blue-500" size={24}/> جاري جلب البيانات...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan="8" className="p-12 text-center text-slate-400 font-bold">لا توجد مواد مطابقة للبحث.</td></tr>
              ) : (
                filteredItems.map((item, index) => {
                  const stage = COST_STAGES[item.stage_id] || { name: "غير محدد", icon: "", color: "bg-slate-100 text-slate-500" };
                  return (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="p-4 font-black text-slate-800">{item.name}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black inline-flex items-center gap-1 whitespace-nowrap ${stage.color}`}>
                          {stage.icon} {stage.name}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-600" dir="ltr">
                        {item.min_price} - {item.max_price}
                      </td>
                      <td className="p-4 font-bold text-slate-600">{item.unit}</td>
                      <td className="p-4 text-center font-bold text-slate-500">{item.sort_order || '-'}</td>
                      <td className="p-4 text-center">
                        {item.is_active 
                          ? <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md text-xs font-black">مفعل ✅</span>
                          : <span className="text-slate-400 bg-slate-100 px-2 py-1 rounded-md text-xs font-black">معطل ❌</span>
                        }
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openModal(item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="تعديل"><Edit2 size={16} /></button>
                          <button onClick={() => toggleStatus(item.id, item.is_active, item.name)} className={`p-2 rounded-lg transition-colors ${item.is_active ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`} title={item.is_active ? 'تعطيل' : 'تفعيل'}>
                            {item.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🛠️ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Calculator className="text-blue-600" size={24}/> 
                {formData.id ? 'تعديل عنصر تكلفة' : 'إضافة مادة جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl bg-white text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">اسم المادة / العنصر *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm font-bold" placeholder="مثال: حديد التسليح" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">مرحلة البناء *</label>
                <select required value={formData.stage_id} onChange={e => setFormData({...formData, stage_id: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm font-bold">
                  {Object.entries(COST_STAGES).map(([id, stage]) => (
                    <option key={id} value={id}>{stage.icon} {stage.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">السعر الأدنى *</label>
                  <input type="number" step="0.01" min="0" required value={formData.min_price} onChange={e => setFormData({...formData, min_price: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm font-mono font-bold" dir="ltr" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">السعر الأعلى *</label>
                  <input type="number" step="0.01" min="0" required value={formData.max_price} onChange={e => setFormData({...formData, max_price: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm font-mono font-bold" dir="ltr" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الوحدة *</label>
                  <input type="text" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm font-bold" placeholder="مثال: طن، م²" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ترتيب العرض</label>
                  <input type="number" min="1" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm font-bold" placeholder="1" />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                  <span className="font-bold text-slate-700 text-sm">مفعّل (يظهر في الحاسبة للجميع)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl transition-all">إلغاء</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}