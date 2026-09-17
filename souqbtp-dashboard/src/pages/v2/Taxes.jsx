import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import useFiscalStore from '../../store/useFiscalStore';
import useSettingsStore from '../../store/useSettingsStore';
import useSupplierStore from '../../store/useSupplierStore';
import { 
  Landmark, FileCheck, Plus, TrendingUp, TrendingDown, 
  Edit, Trash2, X, Search, Clock, CheckCircle, Loader2 
} from 'lucide-react';

export default function Taxes() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';

  const { declarations, isLoading, fetchDeclarations, addDeclaration, updateDeclaration, deleteDeclaration } = useFiscalStore();
  const { supplier } = useSupplierStore();

  const translations = {
    ar: {
      title: 'النظام الجبائي (Fiscalité)', subtitle: 'إدارة وتتبع تصاريح الضريبة على القيمة المضافة (TVA).',
      tvaCollected: 'TVA المحصلة (المبيعات)', tvaDeductible: 'TVA القابلة للخصم (المشتريات)', tvaDue: 'TVA واجبة الأداء',
      addDec: 'تسجيل تصريح جديد', editDec: 'تعديل التصريح', period: 'الفترة (شهر/ربع سنة)', 
      save: 'حفظ التصريح', saving: 'جاري التسجيل...', cancel: 'إلغاء', actions: 'إجراءات', confirmDelete: 'حذف هذا التصريح نهائياً؟',
      history: 'سجل التصاريح الجبائية', empty: 'لا توجد تصاريح مسجلة.', currency: 'درهم', loading: 'جاري التحميل...',
      status: 'الحالة', statusPending: 'قيد الانتظار', statusPaid: 'تم الأداء', searchPlaceholder: 'ابحث بالفترة...',
      module: 'وحدة المحاسبة', tvaColShort: 'TVA المحصلة', tvaDedShort: 'TVA قابلة للخصم', netPay: 'الصافي للأداء',
      editMode: 'وضع التعديل', placeholderPeriod: 'مثال: T1 - 2026'
    },
    fr: {
      title: 'Système Fiscal', subtitle: 'Gestion et suivi des déclarations de TVA.',
      tvaCollected: 'TVA Collectée (Ventes)', tvaDeductible: 'TVA Récupérable (Achats)', tvaDue: 'TVA Due (À payer)',
      addDec: 'Nouvelle Déclaration', editDec: 'Modifier la Déclaration', period: 'Période (Mois/Trimestre)', 
      save: 'Enregistrer', saving: 'Enregistrement...', cancel: 'Annuler', actions: 'Actions', confirmDelete: 'Supprimer cette déclaration ?',
      history: 'Historique des Déclarations', empty: 'Aucune déclaration enregistrée.', currency: 'MAD', loading: 'Chargement...',
      status: 'Statut', statusPending: 'En attente', statusPaid: 'Payé', searchPlaceholder: 'Rechercher par période...',
      module: 'Module Comptable', tvaColShort: 'TVA Collectée', tvaDedShort: 'TVA Récup.', netPay: 'Net à Payer',
      editMode: 'Mode Édition', placeholderPeriod: 'Ex: T1 - 2026'
    },
    en: {
      title: 'Fiscal System', subtitle: 'Manage and track VAT declarations.',
      tvaCollected: 'VAT Collected (Sales)', tvaDeductible: 'VAT Deductible (Purchases)', tvaDue: 'VAT Due (To Pay)',
      addDec: 'New Declaration', editDec: 'Edit Declaration', period: 'Period (Month/Quarter)', 
      save: 'Save', saving: 'Saving...', cancel: 'Cancel', actions: 'Actions', confirmDelete: 'Delete this declaration?',
      history: 'Declarations History', empty: 'No declarations recorded.', currency: 'MAD', loading: 'Loading...',
      status: 'Status', statusPending: 'Pending', statusPaid: 'Paid', searchPlaceholder: 'Search by period...',
      module: 'Accounting Module', tvaColShort: 'VAT Collected', tvaDedShort: 'VAT Deduct.', netPay: 'Net to Pay',
      editMode: 'Edit Mode', placeholderPeriod: 'Ex: Q1 - 2026'
    }
  };
  const t = translations[language] || translations.ar;

  const [formData, setFormData] = useState({ period: '', tva_collected: '', tva_deductible: '', status: 'pending' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 🚀 جلب البيانات أو إضافة بيانات افتراضية للمعاينة
  const [demoDeclarations, setDemoDeclarations] = useState([]);

  useEffect(() => { 
    fetchDeclarations();
    // Fallback UI data
    setTimeout(() => {
      setDemoDeclarations([
        { id: 1, period: 'T1 - 2026', tva_collected: 45000, tva_deductible: 12000, tva_due: 33000, status: 'paid' },
        { id: 2, period: 'T2 - 2026', tva_collected: 32000, tva_deductible: 15000, tva_due: 17000, status: 'pending' },
      ]);
    }, 500);
  }, [fetchDeclarations]);

  const tva_due_calculated = (Number(formData.tva_collected) || 0) - (Number(formData.tva_deductible) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = { 
      period: formData.period, 
      tva_collected: parseFloat(formData.tva_collected),
      tva_deductible: parseFloat(formData.tva_deductible),
      tva_due: tva_due_calculated,
      status: formData.status
    };

    if (editingId) {
      if(addDeclaration) await updateDeclaration(editingId, payload);
      setDemoDeclarations(demoDeclarations.map(d => d.id === editingId ? { ...d, ...payload } : d));
    } else {
      if(addDeclaration) await addDeclaration(payload);
      setDemoDeclarations([{ id: Date.now(), ...payload }, ...demoDeclarations]);
    }

    setFormData({ period: '', tva_collected: '', tva_deductible: '', status: 'pending' });
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleEdit = (dec) => {
    setFormData({ period: dec.period, tva_collected: dec.tva_collected, tva_deductible: dec.tva_deductible, status: dec.status });
    setEditingId(dec.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      if(deleteDeclaration) await deleteDeclaration(id);
      setDemoDeclarations(demoDeclarations.filter(d => d.id !== id));
    }
  };

  const cancelEdit = () => {
    setFormData({ period: '', tva_collected: '', tva_deductible: '', status: 'pending' });
    setEditingId(null);
  };

  const safeDeclarations = declarations?.length > 0 ? declarations : demoDeclarations;
  const defaultPeriods = ["T1 - 2026", "T2 - 2026", "T3 - 2026", "T4 - 2026", "Janvier 2026", "Février 2026"];
  const periodSuggestions = [...new Set([...defaultPeriods, ...safeDeclarations.map(d => d?.period).filter(Boolean)])];

  const filteredDeclarations = safeDeclarations.filter(dec => dec.period?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalTvaCollected = safeDeclarations.reduce((sum, d) => sum + Number(d.tva_collected), 0);
  const totalTvaDeductible = safeDeclarations.reduce((sum, d) => sum + Number(d.tva_deductible), 0);
  const totalTvaDue = safeDeclarations.filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.tva_due), 0);

  // 🎨 الألوان والتنسيقات المتوافقة مع V2
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
  const tableHeadBg = isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600';
  const tableRowHover = isDarkMode ? 'hover:bg-slate-800/40 divide-slate-800/50' : 'hover:bg-slate-50 divide-slate-100';

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-3xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div>
          <p className="text-sm font-bold text-white/80 mb-1">{title}</p>
          <h4 className="text-3xl font-black tracking-tight font-mono" dir="ltr">
            {value} <span className="text-sm font-bold text-white/70 uppercase tracking-widest">{t.currency}</span>
          </h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${bgMain} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
            <Landmark className="text-blue-500" size={36} /> {t.title}
          </h2>
          <p className={`${textMuted} font-bold mt-2`}>{t.subtitle}</p>
        </div>
        <span className="relative z-10 bg-amber-500/10 text-amber-500 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-amber-500/20 shadow-sm">
          {t.module}
        </span>
      </div>

      {/* 🚀 الإحصائيات الجبائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.tvaCollected} value={totalTvaCollected.toLocaleString()} icon={TrendingUp} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" />
        <StatCard title={t.tvaDeductible} value={totalTvaDeductible.toLocaleString()} icon={TrendingDown} bgGradient="bg-gradient-to-br from-orange-500 to-red-500" />
        <StatCard title={t.tvaDue + ` (${t.statusPending})`} value={totalTvaDue.toLocaleString()} icon={Landmark} bgGradient="bg-gradient-to-br from-blue-600 to-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* 📝 Form Section */}
        <div className={`${bgMain} border-2 rounded-[2rem] p-6 md:p-8 shadow-xl h-fit relative`}>
          {editingId && <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} text-xs font-black text-blue-500 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full animate-pulse`}>{t.editMode}</div>}
          
          <h3 className={`text-xl font-black mb-6 flex items-center gap-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-4 ${textMain}`}>
            {editingId ? <Edit size={24} className="text-blue-500" /> : <Plus size={24} className="text-blue-500" />} 
            {editingId ? t.editDec : t.addDec}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className={`block text-xs font-bold ${textMuted}`}>{t.period}</label>
              <input type="text" list="periods-list" required value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} 
                className={`w-full px-4 py-3.5 border-2 rounded-xl outline-none transition-all font-bold text-sm ${bgInput} focus:border-blue-500`} 
                placeholder={t.placeholderPeriod} autoComplete="off" 
              />
              <datalist id="periods-list">{periodSuggestions.map((p, i) => <option key={i} value={p} />)}</datalist>
            </div>
            
            <div className="space-y-2">
              <label className={`block text-xs font-bold ${textMuted}`}>{t.tvaCollected}</label>
              <input type="number" required min="0" step="0.01" value={formData.tva_collected} onChange={(e) => setFormData({...formData, tva_collected: e.target.value})} 
                className={`w-full px-4 py-3.5 border-2 rounded-xl outline-none transition-all font-black text-lg ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 focus:border-emerald-500' : 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-500'}`} 
              />
            </div>
            
            <div className="space-y-2">
              <label className={`block text-xs font-bold ${textMuted}`}>{t.tvaDeductible}</label>
              <input type="number" required min="0" step="0.01" value={formData.tva_deductible} onChange={(e) => setFormData({...formData, tva_deductible: e.target.value})} 
                className={`w-full px-4 py-3.5 border-2 rounded-xl outline-none transition-all font-black text-lg ${isDarkMode ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 focus:border-orange-500' : 'bg-orange-50 border-orange-200 text-orange-700 focus:border-orange-500'}`} 
              />
            </div>
            
            <div className={`p-6 rounded-2xl border-2 flex justify-between items-center ${isDarkMode ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
              <span className={`text-sm font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>{t.tvaDue} :</span>
              <span className={`text-2xl font-black font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`} dir="ltr">{tva_due_calculated.toFixed(2)} <span className="text-sm">{t.currency}</span></span>
            </div>

            <div className="space-y-2">
              <label className={`block text-xs font-bold ${textMuted}`}>{t.status}</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} 
                className={`w-full px-4 py-3.5 border-2 rounded-xl outline-none transition-all font-bold text-sm appearance-none ${bgInput} focus:border-blue-500`}
              >
                <option value="pending">{t.statusPending}</option>
                <option value="paid">{t.statusPaid}</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50 mt-6">
              {editingId && (
                <button type="button" onClick={cancelEdit} className={`w-1/3 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                  <X size={18}/> {t.cancel}
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className={`${editingId ? 'w-2/3' : 'w-full'} py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-black transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 disabled:opacity-50`}>
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (editingId ? t.editDec : t.save)}
              </button>
            </div>
          </form>
        </div>

        {/* 🗃️ History Section */}
        <div className="lg:col-span-2">
          <div className={`${bgMain} border-2 rounded-[2rem] shadow-xl overflow-hidden h-full flex flex-col`}>
            
            <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <FileCheck size={24} className="text-blue-500" />
                <h3 className={`font-black text-xl ${textMain}`}>{t.history}</h3>
              </div>
              <div className="relative w-full sm:w-72">
                <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-slate-500`} />
                <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                  className={`w-full py-3.5 rounded-xl border-2 outline-none focus:border-blue-500 transition-all font-bold text-sm ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} ${bgInput}`} 
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              {isLoading && safeDeclarations.length === 0 ? ( 
                <div className="flex items-center justify-center h-64"><Loader2 size={40} className="animate-spin text-blue-500" /></div> 
              ) : filteredDeclarations.length === 0 ? ( 
                <div className={`flex items-center justify-center h-64 font-bold text-lg ${textMuted}`}>{t.empty}</div> 
              ) : (
                <table className="w-full text-start text-sm">
                  <thead className={`border-b ${tableHeadBg} text-xs uppercase font-black`}>
                    <tr>
                      <th className="px-6 py-5 tracking-widest text-start">{t.period}</th>
                      <th className={`px-6 py-5 tracking-widest ${isRtl ? 'text-start' : 'text-end'}`}>{t.tvaColShort}</th>
                      <th className={`px-6 py-5 tracking-widest ${isRtl ? 'text-start' : 'text-end'}`}>{t.tvaDedShort}</th>
                      <th className={`px-6 py-5 tracking-widest ${isRtl ? 'text-start' : 'text-end'}`}>{t.netPay}</th>
                      <th className="px-6 py-5 tracking-widest text-center">{t.status}</th>
                      <th className="px-6 py-5 tracking-widest text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableRowHover}`}>
                    {filteredDeclarations.map((dec) => (
                      <tr key={dec.id} className={`transition-colors group ${editingId === dec.id ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}>
                        <td className={`px-6 py-5 font-black ${textMain}`}>{dec.period}</td>
                        <td className={`px-6 py-5 text-emerald-500 font-bold font-mono ${isRtl ? 'text-start' : 'text-end'}`} dir="ltr">{Number(dec.tva_collected).toLocaleString()}</td>
                        <td className={`px-6 py-5 text-orange-500 font-bold font-mono ${isRtl ? 'text-start' : 'text-end'}`} dir="ltr">{Number(dec.tva_deductible).toLocaleString()}</td>
                        <td className={`px-6 py-5 text-blue-500 font-black font-mono text-lg ${isRtl ? 'text-start' : 'text-end'}`} dir="ltr">{Number(dec.tva_due).toLocaleString()}</td>
                        <td className="px-6 py-5 text-center">
                          {dec.status === 'paid' 
                            ? <span className="inline-flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"><CheckCircle size={14}/> {t.statusPaid}</span>
                            : <span className="inline-flex items-center justify-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"><Clock size={14}/> {t.statusPending}</span>
                          }
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(dec)} className={`p-3 rounded-xl transition-all shadow-sm hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-slate-100 text-blue-600 hover:bg-blue-500 hover:text-white'}`} title={t.editDec}><Edit size={16}/></button>
                            <button onClick={() => handleDelete(dec.id)} className={`p-3 rounded-xl transition-all shadow-sm hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-red-400 hover:bg-red-600 hover:text-white' : 'bg-slate-100 text-red-600 hover:bg-red-500 hover:text-white'}`} title={t.actions}><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}