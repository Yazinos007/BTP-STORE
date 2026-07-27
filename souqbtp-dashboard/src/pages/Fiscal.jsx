import { useState, useEffect } from 'react';
import useFiscalStore from '../store/useFiscalStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Landmark, FileCheck, Plus, TrendingUp, TrendingDown, Edit, Trash2, X, Search, Clock, CheckCircle } from 'lucide-react';

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

export default function Fiscal({ isWholesaler }) {
  const { declarations, isLoading, fetchDeclarations, addDeclaration, updateDeclaration, deleteDeclaration } = useFiscalStore();
  const { language } = useSettingsStore();
  const t = translations[language] || translations['fr'];

  const [formData, setFormData] = useState({ period: '', tva_collected: '', tva_deductible: '', status: 'pending' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchDeclarations(); }, [fetchDeclarations]);

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

    if (editingId) await updateDeclaration(editingId, payload);
    else await addDeclaration(payload);

    setFormData({ period: '', tva_collected: '', tva_deductible: '', status: 'pending' });
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleEdit = (dec) => {
    setFormData({ period: dec.period, tva_collected: dec.tva_collected, tva_deductible: dec.tva_deductible, status: dec.status });
    setEditingId(dec.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) await deleteDeclaration(id);
  };

  const cancelEdit = () => {
    setFormData({ period: '', tva_collected: '', tva_deductible: '', status: 'pending' });
    setEditingId(null);
  };

  const safeDeclarations = Array.isArray(declarations) ? declarations : [];
  const defaultPeriods = ["T1 - 2026", "T2 - 2026", "T3 - 2026", "T4 - 2026", "Janvier 2026", "Février 2026"];
  const periodSuggestions = [...new Set([...defaultPeriods, ...safeDeclarations.map(d => d?.period).filter(Boolean)])];

  const filteredDeclarations = safeDeclarations.filter(dec => dec.period?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalTvaCollected = safeDeclarations.reduce((sum, d) => sum + Number(d.tva_collected), 0);
  const totalTvaDeductible = safeDeclarations.reduce((sum, d) => sum + Number(d.tva_deductible), 0);
  const totalTvaDue = safeDeclarations.filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.tva_due), 0);

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-3xl shadow-xl text-white ${bgGradient} transition-transform hover:-translate-y-1 duration-300`}>
      <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none"><Icon size={120} /></div>
      <div className="relative z-10 flex items-center gap-4 mb-2">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <p className="text-sm font-black uppercase tracking-wider text-white/90">{title}</p>
      </div>
      <div className="relative z-10 mt-4" dir="ltr">
        <h4 className="text-4xl font-black tracking-tight">{value} <span className="text-sm font-bold text-white/70 uppercase ml-1">{t.currency}</span></h4>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isWholesaler ? 'text-white' : 'text-gray-800'}`}>
           <Landmark className={isWholesaler ? 'text-blue-500' : 'text-blue-600'} size={32} />
           {t.title}
          </h2>
          <p className={`mt-1 font-medium ${isWholesaler ? 'text-slate-400' : 'text-gray-500'}`}>
           {t.subtitle}
          </p>
        </div>
        <span className="bg-amber-500/10 text-amber-500 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-500/20 shadow-sm">
          {t.module}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.tvaCollected} value={totalTvaCollected.toLocaleString()} icon={TrendingUp} bgGradient="bg-emerald-500" />
        <StatCard title={t.tvaDeductible} value={totalTvaDeductible.toLocaleString()} icon={TrendingDown} bgGradient="bg-orange-500" />
        <StatCard title={t.tvaDue + ` (${t.statusPending})`} value={totalTvaDue.toLocaleString()} icon={Landmark} bgGradient="bg-slate-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* 📝 Form Section */}
        <div className={`${isWholesaler ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border rounded-3xl p-6 shadow-xl h-fit relative transition-colors`}>
          {editingId && <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-xs font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg animate-pulse`}>{t.editMode}</div>}
          
          <h3 className={`text-xl font-black mb-6 flex items-center gap-2 pb-4 border-b ${isWholesaler ? 'text-white border-slate-700' : 'text-gray-800 border-gray-100'}`}>
            {editingId ? <Edit size={20} className="text-blue-500" /> : <Plus size={20} className="text-blue-500" />} 
            {editingId ? t.editDec : t.addDec}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isWholesaler ? 'text-slate-300' : 'text-gray-700'}`}>{t.period}</label>
              <input type="text" list="periods-list" required value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} 
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-medium ${isWholesaler ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500 placeholder-slate-600' : 'bg-gray-50 border-gray-300 text-gray-800 focus:border-blue-500 placeholder-gray-400'}`} 
                placeholder={t.placeholderPeriod} autoComplete="off" 
              />
              <datalist id="periods-list">{periodSuggestions.map((p, i) => <option key={i} value={p} />)}</datalist>
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${isWholesaler ? 'text-slate-300' : 'text-gray-700'}`}>{t.tvaCollected}</label>
              <input type="number" required min="0" step="0.01" value={formData.tva_collected} onChange={(e) => setFormData({...formData, tva_collected: e.target.value})} 
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-black text-lg ${isWholesaler ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 focus:border-emerald-500' : 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-500'}`} 
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${isWholesaler ? 'text-slate-300' : 'text-gray-700'}`}>{t.tvaDeductible}</label>
              <input type="number" required min="0" step="0.01" value={formData.tva_deductible} onChange={(e) => setFormData({...formData, tva_deductible: e.target.value})} 
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-black text-lg ${isWholesaler ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 focus:border-orange-500' : 'bg-orange-50 border-orange-200 text-orange-700 focus:border-orange-500'}`} 
              />
            </div>
            
            <div className={`p-5 rounded-2xl border flex justify-between items-center ${isWholesaler ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
              <span className={`text-sm font-black ${isWholesaler ? 'text-blue-400' : 'text-blue-800'}`}>{t.tvaDue} :</span>
              <span className={`text-2xl font-black font-mono ${isWholesaler ? 'text-blue-300' : 'text-blue-700'}`} dir="ltr">{tva_due_calculated.toFixed(2)} <span className="text-sm">{t.currency}</span></span>
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ${isWholesaler ? 'text-slate-300' : 'text-gray-700'}`}>{t.status}</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} 
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-bold appearance-none ${isWholesaler ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'}`}
              >
                <option value="pending">{t.statusPending}</option>
                <option value="paid">{t.statusPaid}</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              {editingId && (
                <button type="button" onClick={cancelEdit} className={`flex-1 py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${isWholesaler ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <X size={18}/> {t.cancel}
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className={`flex-[2] py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-black transition-all shadow-lg shadow-blue-500/20 flex justify-center items-center disabled:opacity-50`}>
                {isSubmitting ? t.saving : (editingId ? t.editDec : t.save)}
              </button>
            </div>
          </form>
        </div>

        {/* 🗃️ History Section */}
        <div className="lg:col-span-2">
          <div className={`${isWholesaler ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border rounded-3xl shadow-xl overflow-hidden h-full flex flex-col`}>
            <div className={`p-5 md:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isWholesaler ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <FileCheck size={20} className={isWholesaler ? 'text-slate-400' : 'text-gray-500'} />
                <h3 className={`font-black text-lg ${isWholesaler ? 'text-white' : 'text-gray-800'}`}>{t.history}</h3>
              </div>
              <div className="relative w-full sm:w-72">
                <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-4' : 'left-4'} ${isWholesaler ? 'text-slate-500' : 'text-gray-400'}`} />
                <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                  className={`w-full py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} ${isWholesaler ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`} 
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              {isLoading ? ( 
                <div className="flex items-center justify-center h-64"><Loader2 size={40} className="animate-spin text-blue-500" /></div> 
              ) : filteredDeclarations.length === 0 ? ( 
                <div className={`flex items-center justify-center h-64 font-bold ${isWholesaler ? 'text-slate-500' : 'text-gray-400'}`}>{t.empty}</div> 
              ) : (
                <table className="w-full text-start text-sm">
                  <thead className={`border-b ${isWholesaler ? 'border-slate-700 bg-slate-900/80 text-slate-400' : 'border-gray-100 bg-white text-gray-500'}`}>
                    <tr>
                      <th className="px-6 py-5 font-black uppercase tracking-wider text-start">{t.period}</th>
                      <th className="px-6 py-5 font-black uppercase tracking-wider text-end">{t.tvaColShort}</th>
                      <th className="px-6 py-5 font-black uppercase tracking-wider text-end">{t.tvaDedShort}</th>
                      <th className="px-6 py-5 font-black uppercase tracking-wider text-end">{t.netPay}</th>
                      <th className="px-6 py-5 font-black uppercase tracking-wider text-center">{t.status}</th>
                      <th className="px-6 py-5 font-black uppercase tracking-wider text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isWholesaler ? 'divide-slate-700/50' : 'divide-gray-50'}`}>
                    {filteredDeclarations.map((dec) => (
                      <tr key={dec.id} className={`transition-colors group ${isWholesaler ? 'hover:bg-slate-700/30' : 'hover:bg-blue-50/30'} ${editingId === dec.id ? (isWholesaler ? 'bg-slate-700/50' : 'bg-blue-50') : ''}`}>
                        <td className={`px-6 py-5 font-bold ${isWholesaler ? 'text-white' : 'text-gray-800'}`}>{dec.period}</td>
                        <td className="px-6 py-5 text-emerald-500 font-bold font-mono text-end" dir="ltr">{Number(dec.tva_collected).toLocaleString()}</td>
                        <td className="px-6 py-5 text-orange-500 font-bold font-mono text-end" dir="ltr">{Number(dec.tva_deductible).toLocaleString()}</td>
                        <td className="px-6 py-5 text-blue-500 font-black font-mono text-end" dir="ltr">{Number(dec.tva_due).toLocaleString()}</td>
                        <td className="px-6 py-5 text-center">
                          {dec.status === 'paid' 
                            ? <span className="inline-flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-black"><CheckCircle size={14}/> {t.statusPaid}</span>
                            : <span className="inline-flex items-center justify-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-black"><Clock size={14}/> {t.statusPending}</span>
                          }
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(dec)} className={`p-2 rounded-xl transition-all shadow-sm ${isWholesaler ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}><Edit size={16}/></button>
                            <button onClick={() => handleDelete(dec.id)} className={`p-2 rounded-xl transition-all shadow-sm ${isWholesaler ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'}`}><Trash2 size={16}/></button>
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