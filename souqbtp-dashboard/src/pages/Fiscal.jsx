import { useState, useEffect } from 'react';
import useFiscalStore from '../store/useFiscalStore';
import useSettingsStore from '../store/useSettingsStore';
import { Landmark, FileCheck, Plus, TrendingUp, TrendingDown, Edit, Trash2, X, Search, Clock, CheckCircle } from 'lucide-react';

const translations = {
  ar: {
    title: 'النظام الجبائي (Fiscalité)', subtitle: 'إدارة وتتبع تصاريح الضريبة على القيمة المضافة (TVA).',
    tvaCollected: 'TVA المحصلة (المبيعات)', tvaDeductible: 'TVA القابلة للخصم (المشتريات)', tvaDue: 'TVA واجبة الأداء',
    addDec: 'تسجيل تصريح جديد', editDec: 'تعديل التصريح', period: 'الفترة (شهر/ربع سنة)', 
    save: 'حفظ التصريح', saving: 'جاري التسجيل...', cancel: 'إلغاء', actions: 'إجراءات', confirmDelete: 'حذف هذا التصريح نهائياً؟',
    history: 'سجل التصاريح الجبائية', empty: 'لا توجد تصاريح مسجلة.', currency: 'درهم',
    status: 'الحالة', statusPending: 'قيد الانتظار', statusPaid: 'تم الأداء', searchPlaceholder: 'ابحث بالفترة...'
  },
  fr: {
    title: 'Système Fiscal', subtitle: 'Gestion et suivi des déclarations de TVA.',
    tvaCollected: 'TVA Collectée (Ventes)', tvaDeductible: 'TVA Récupérable (Achats)', tvaDue: 'TVA Due (À payer)',
    addDec: 'Nouvelle Déclaration', editDec: 'Modifier la Déclaration', period: 'Période (Mois/Trimestre)', 
    save: 'Enregistrer', saving: 'Enregistrement...', cancel: 'Annuler', actions: 'Actions', confirmDelete: 'Supprimer cette déclaration ?',
    history: 'Historique des Déclarations', empty: 'Aucune déclaration enregistrée.', currency: 'MAD',
    status: 'Statut', statusPending: 'En attente', statusPaid: 'Payé', searchPlaceholder: 'Rechercher par période...'
  }
};

export default function Fiscal() {
  const { declarations, isLoading, fetchDeclarations, addDeclaration, updateDeclaration, deleteDeclaration } = useFiscalStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [formData, setFormData] = useState({ period: '', tva_collected: '', tva_deductible: '', status: 'pending' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchDeclarations(); }, [fetchDeclarations]);

  // الحساب التلقائي لـ TVA
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

  // 🧠 الإكمال التلقائي للفترات (اقتراحات جاهزة + سابقة)
  const defaultPeriods = ["T1 - 2026", "T2 - 2026", "T3 - 2026", "T4 - 2026", "Janvier 2026", "Février 2026"];
  const periodSuggestions = [...new Set([...defaultPeriods, ...safeDeclarations.map(d => d?.period).filter(Boolean)])];

  // 🔍 فلترة البحث
  const filteredDeclarations = safeDeclarations.filter(dec => dec.period?.toLowerCase().includes(searchTerm.toLowerCase()));

  // حساب الإجماليات للبطاقات
  const totalTvaCollected = safeDeclarations.reduce((sum, d) => sum + Number(d.tva_collected), 0);
  const totalTvaDeductible = safeDeclarations.reduce((sum, d) => sum + Number(d.tva_deductible), 0);
  const totalTvaDue = safeDeclarations.filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.tva_due), 0);

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <h4 className="text-2xl font-black tracking-tight">{value} <span className="text-sm font-normal text-white/70">{t.currency}</span></h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h2>
          <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
        </div>
        <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-amber-200">
          Module Comptable
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.tvaCollected} value={totalTvaCollected.toLocaleString()} icon={TrendingUp} bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-400" />
        <StatCard title={t.tvaDeductible} value={totalTvaDeductible.toLocaleString()} icon={TrendingDown} bgGradient="bg-gradient-to-br from-orange-500 to-red-500" />
        <StatCard title={t.tvaDue + " (Non Payé)"} value={totalTvaDue.toLocaleString()} icon={Landmark} bgGradient={totalTvaDue > 0 ? "bg-gradient-to-br from-blue-800 via-blue-600 to-indigo-500" : "bg-gradient-to-br from-gray-600 to-gray-400"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit relative">
          {editingId && <div className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md animate-pulse">Mode Édition</div>}
          <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2 border-b pb-3">
            {editingId ? <Edit size={18} className="text-blue-600" /> : <Plus size={18} className="text-blue-600" />} 
            {editingId ? t.editDec : t.addDec}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.period}</label>
              <input type="text" list="periods-list" required value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-gray-50 transition-all" placeholder="Ex: T1 - 2026" autoComplete="off" />
              <datalist id="periods-list">{periodSuggestions.map((p, i) => <option key={i} value={p} />)}</datalist>
            </div>
            
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.tvaCollected}</label><input type="number" required min="0" step="0.01" value={formData.tva_collected} onChange={(e) => setFormData({...formData, tva_collected: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none bg-emerald-50 text-emerald-700 font-bold transition-all" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.tvaDeductible}</label><input type="number" required min="0" step="0.01" value={formData.tva_deductible} onChange={(e) => setFormData({...formData, tva_deductible: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none bg-orange-50 text-orange-700 font-bold transition-all" /></div>
            
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
              <span className="text-sm font-bold text-blue-800">{t.tvaDue} :</span>
              <span className="text-xl font-black text-blue-700 font-mono">{tva_due_calculated.toFixed(2)} {t.currency}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.status}</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 outline-none bg-white font-medium">
                <option value="pending">{t.statusPending}</option>
                <option value="paid">{t.statusPaid}</option>
              </select>
            </div>

            <div className="flex gap-2 mt-4">
              {editingId && <button type="button" onClick={cancelEdit} className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-bold transition-all flex items-center justify-center gap-1"><X size={16}/> {t.cancel}</button>}
              <button type="submit" disabled={isSubmitting} className={`${editingId ? 'w-2/3' : 'w-full'} bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold transition-all disabled:bg-gray-400 shadow-md hover:shadow-lg`}>
                {isSubmitting ? t.saving : (editingId ? t.editDec : t.save)}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2"><FileCheck size={18} className="text-gray-500" /><h3 className="font-bold text-gray-800">{t.history}</h3></div>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute top-2.5 left-3 text-gray-400" />
                <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm bg-white" />
              </div>
            </div>
            
            {isLoading ? ( <div className="p-8 text-center text-gray-500">{t.loading}</div> ) : filteredDeclarations.length === 0 ? ( <div className="p-12 text-center text-gray-400">{t.empty}</div> ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead className="border-b border-gray-100 bg-white">
                    <tr>
                      <th className="px-6 py-4 text-gray-500 font-bold">{t.period}</th>
                      <th className="px-6 py-4 text-gray-500 font-bold text-end">TVA Collectée</th>
                      <th className="px-6 py-4 text-gray-500 font-bold text-end">TVA Récup.</th>
                      <th className="px-6 py-4 text-gray-500 font-bold text-end">Net à Payer</th>
                      <th className="px-6 py-4 text-gray-500 font-bold text-center">{t.status}</th>
                      <th className="px-6 py-4 text-gray-500 font-bold text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredDeclarations.map((dec) => (
                      <tr key={dec.id} className={`hover:bg-blue-50/30 transition-colors ${editingId === dec.id ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 text-gray-800 font-bold">{dec.period}</td>
                        <td className="px-6 py-4 text-emerald-600 font-medium font-mono text-end">{Number(dec.tva_collected).toLocaleString()}</td>
                        <td className="px-6 py-4 text-orange-500 font-medium font-mono text-end">{Number(dec.tva_deductible).toLocaleString()}</td>
                        <td className="px-6 py-4 text-blue-700 font-black font-mono text-end">{Number(dec.tva_due).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          {dec.status === 'paid' 
                            ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1"><CheckCircle size={12}/> {t.statusPaid}</span>
                            : <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1"><Clock size={12}/> {t.statusPending}</span>
                          }
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <button onClick={() => handleEdit(dec)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(dec.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}