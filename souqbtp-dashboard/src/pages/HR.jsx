import { useState, useEffect } from 'react';
import useHRStore from '../store/useHRStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Briefcase, UserPlus, DollarSign, Users, CheckCircle, XCircle, Clock, FileText, Printer, X, Edit, Trash2, Search, UserCheck } from 'lucide-react';

const translations = {
  ar: {
    title: 'الموارد البشرية', subtitle: 'إدارة الموظفين والرواتب الخاصة بالشركة.',
    addBtn: 'تعيين موظف', totalEmp: 'إجمالي الموظفين', activeEmp: 'الموظفون النشطون',
    payroll: 'كتلة الأجور الشهرية', newEmp: 'بيانات الموظف الجديد', editEmp: 'تعديل بيانات الموظف', name: 'الاسم الكامل',
    position: 'المنصب / المهمة', salary: 'الراتب الأساسي', cin: 'رقم البطاقة (CIN)', phone: 'رقم الهاتف',
    primes: 'المنح / التسبيقات', retenues: 'اقتطاعات (CNSS/AMO)',
    save: 'حفظ', cancel: 'إلغاء', date: 'تاريخ التعيين', status: 'الحالة', actions: 'إجراءات',
    loading: 'جاري التحميل...', empty: 'لا يوجد موظفون مسجلون حالياً.', currency: 'درهم',
    statusActive: 'نشط', statusLeave: 'في إجازة', statusTerminated: 'منهي العقد',
    payslip: 'قسيمة الراتب', printBtn: 'طباعة القسيمة', closeBtn: 'إغلاق', month: 'الشهر',
    confirmDelete: 'هل أنت متأكد من حذف هذا الموظف نهائياً؟', searchPlaceholder: 'ابحث بالاسم، CIN، أو المنصب...'
  },
  fr: {
    title: 'Ressources Humaines', subtitle: 'Gestion des employés et de la paie de l\'entreprise.',
    addBtn: 'Nouvel Employé', totalEmp: 'Total Employés', activeEmp: 'Employés Actifs',
    payroll: 'Masse Salariale', newEmp: 'Détails du Nouvel Employé', editEmp: 'Modifier l\'Employé', name: 'Nom Complet',
    position: 'Poste / Fonction', salary: 'Salaire de Base', cin: 'CIN', phone: 'Téléphone',
    primes: 'Primes / Avances', retenues: 'Retenues (CNSS/AMO)',
    save: 'Enregistrer', cancel: 'Annuler', date: 'Date d\'embauche', status: 'Statut', actions: 'Actions',
    loading: 'Chargement...', empty: 'Aucun employé enregistré.', currency: 'MAD',
    statusActive: 'Actif', statusLeave: 'En congé', statusTerminated: 'Résilié',
    payslip: 'Fiche de Paie', printBtn: 'Imprimer', closeBtn: 'Fermer', month: 'Mois',
    confirmDelete: 'Voulez-vous vraiment supprimer cet employé ?', searchPlaceholder: 'Rechercher par nom, CIN, ou poste...'
  }
};

export default function HR() {
  const { employees, isLoading, fetchEmployees, addEmployee, updateEmployee, deleteEmployee } = useHRStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language];

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', position: '', salary: '', cin: '', phone: '', primes: '0', retenues: '0', status: 'Actif' });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    const empData = {
      full_name: formData.full_name, 
      role: formData.position, 
      base_salary: parseFloat(formData.salary),
      cin: formData.cin,
      phone: formData.phone,
      primes_avances: parseFloat(formData.primes || 0),
      retenues: parseFloat(formData.retenues || 0),
      status: formData.status
    };

    let result;
    if (editingId) result = await updateEmployee(editingId, empData);
    else result = await addEmployee(empData);
    
    if (result && result.success) {
      setFormData({ full_name: '', position: '', salary: '', cin: '', phone: '', primes: '0', retenues: '0', status: 'Actif' });
      setEditingId(null);
      setShowAddForm(false);
    } else {
      alert("Erreur d'enregistrement: " + (result?.error?.message || result?.error || "Erreur inconnue"));
    }
  };

  const handleEditClick = (emp) => {
    setFormData({
      full_name: emp.full_name, position: emp.role, salary: emp.base_salary,
      cin: emp.cin || '', phone: emp.phone || '', primes: emp.primes_avances || '0', retenues: emp.retenues || '0',
      status: emp.status || 'Actif'
    });
    setEditingId(emp.id);
    setShowAddForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm(t.confirmDelete)) await deleteEmployee(id);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ full_name: '', position: '', salary: '', cin: '', phone: '', primes: '0', retenues: '0', status: 'Actif' });
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'Actif' || emp.status === 'active').length;
  const totalPayroll = employees.filter(emp => emp.status === 'Actif' || emp.status === 'active').reduce((sum, emp) => sum + Number(emp.base_salary || 0), 0);

  const statusConfig = {
    active: { label: t.statusActive, color: 'bg-green-100 text-green-700', icon: CheckCircle },
    Actif: { label: t.statusActive, color: 'bg-green-100 text-green-700', icon: CheckCircle },
    on_leave: { label: t.statusLeave, color: 'bg-orange-100 text-orange-700', icon: Clock },
    terminated: { label: t.statusTerminated, color: 'bg-red-100 text-red-700', icon: XCircle }
  };

  const currentMonth = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-MA', { month: 'long', year: 'numeric' });

  const defaultRoles = ["Directeur", "Manager", "Comptable", "Vendeur", "Chauffeur", "Magasinier", "Ouvrier", "Technicien", "Secrétaire"];
  const roleSuggestions = [...new Set([...defaultRoles, ...employees.map(emp => emp.role).filter(Boolean)])];

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    return (
      emp.full_name?.toLowerCase().includes(term) ||
      emp.role?.toLowerCase().includes(term) ||
      emp.cin?.toLowerCase().includes(term) ||
      emp.phone?.includes(term)
    );
  });

  const StatCard = ({ title, value, icon: Icon, bgGradient, valueSuffix = '' }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <h4 className="text-3xl font-black tracking-tight">{value} <span className="text-sm font-normal text-white/70">{valueSuffix}</span></h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h2>
          <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
        </div>
        <button onClick={() => { handleCancel(); setShowAddForm(true); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-bold shadow-lg hover:shadow-blue-500/30">
          <UserPlus size={20} /> {t.addBtn}
        </button>
      </div>

      {/* البطاقات الملونة الديناميكية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.totalEmp} value={totalEmployees} icon={Users} bgGradient="bg-gradient-to-br from-blue-600 to-blue-400" />
        <StatCard title={t.activeEmp} value={activeEmployees} icon={UserCheck} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" />
        <StatCard title={t.payroll} value={totalPayroll.toLocaleString()} valueSuffix={t.currency} icon={DollarSign} bgGradient="bg-gradient-to-br from-purple-600 to-pink-500" />
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl w-full max-w-4xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 pb-2 border-b">
              <h3 className="font-black text-gray-800 text-xl">{editingId ? t.editEmp : t.newEmp}</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">{t.name}</label><input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-gray-50 transition-all" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">{t.cin}</label><input type="text" value={formData.cin} onChange={e => setFormData({...formData, cin: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-gray-50 transition-all" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">{t.phone}</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-gray-50 transition-all" /></div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.position}</label>
                <input type="text" list="roles-list" required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-gray-50 transition-all" autoComplete="off" />
                <datalist id="roles-list">{roleSuggestions.map((role, i) => <option key={i} value={role} />)}</datalist>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.salary} ({t.currency})</label>
                <input type="number" required min="0" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-3 border border-blue-200 rounded-xl outline-none focus:border-blue-500 bg-blue-50 font-black text-blue-700 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.status}</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white font-bold text-gray-700 transition-all shadow-sm">
                  <option value="Actif">{t.statusActive}</option>
                  <option value="on_leave">{t.statusLeave}</option>
                  <option value="terminated">{t.statusTerminated}</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:col-span-1">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">{t.primes}</label><input type="number" min="0" value={formData.primes} onChange={e => setFormData({...formData, primes: e.target.value})} className="w-full px-4 py-3 border border-green-200 rounded-xl outline-none focus:border-green-500 bg-green-50 font-bold text-green-700 transition-all" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">{t.retenues}</label><input type="number" min="0" value={formData.retenues} onChange={e => setFormData({...formData, retenues: e.target.value})} className="w-full px-4 py-3 border border-red-200 rounded-xl outline-none focus:border-red-500 bg-red-50 font-bold text-red-700 transition-all" /></div>
              </div>

              <div className="md:col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={handleCancel} className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-colors">{t.cancel}</button>
                <button type="submit" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-colors shadow-lg shadow-blue-500/30">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} />
            <input 
              type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium bg-white transition-all`} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? <div className="p-8 text-center text-gray-500">{t.loading}</div> : filteredEmployees.length === 0 ? <div className="p-12 text-center text-gray-400 font-medium"><Users size={40} className="mx-auto mb-3 opacity-20"/> {t.empty}</div> : (
            <table className="w-full text-start border-collapse">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-start">{t.name}</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-start">{t.position}</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-start">{t.salary}</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-start">{t.status}</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.map(emp => {
                  const empStatus = statusConfig[emp.status] ? emp.status : 'Actif';
                  const StatusIcon = statusConfig[empStatus].icon;
                  return (
                    <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-inner">
                            {emp.full_name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-base">{emp.full_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">{emp.cin ? `CIN: ${emp.cin}` : ''} {emp.phone ? `| Tél: ${emp.phone}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{emp.role}</td>
                      <td className="px-6 py-4 font-black font-mono text-blue-600 text-base" dir="ltr">
                        {Number(emp.base_salary).toLocaleString()} <span className="text-[10px] font-bold text-gray-400 uppercase">{t.currency}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border ${statusConfig[empStatus].color.replace('bg-', 'bg-').replace('text-', 'text-').replace('100', '50')} border-${statusConfig[empStatus].color.split(' ')[0].replace('bg-', '')}`}>
                          <StatusIcon size={14} />{statusConfig[empStatus].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(emp)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title={t.editEmp}><Edit size={18} /></button>
                        <button onClick={() => handleDeleteClick(emp.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer"><Trash2 size={18} /></button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button onClick={() => setSelectedEmployee(emp)} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                          <FileText size={16} /> {t.payslip}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center overflow-y-auto py-10 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white w-[700px] shadow-2xl p-10 relative print-area rounded-2xl animate-slide-up">
            <div className="absolute top-4 right-4 flex gap-2 no-print" dir="ltr">
              <button onClick={() => setSelectedEmployee(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors" title={t.closeBtn}><X size={20} /></button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg"><Printer size={18} /> {t.printBtn}</button>
            </div>
            
            <div className="border-2 border-gray-800 p-8 mt-4 rounded-xl">
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-1 uppercase">{supplier?.store_name || 'ENTREPRISE'}</h1>
                  <p className="text-sm text-gray-500 font-mono">Document Interne - Paie</p>
                </div>
                <div className="text-end">
                  <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">{t.payslip}</h2>
                  <p className="text-gray-600 mt-2 font-mono bg-gray-100 px-3 py-1 rounded-lg inline-block">{t.month}: <strong>{currentMonth}</strong></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.name}</p><p className="text-lg font-black text-gray-900">{selectedEmployee.full_name}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.position}</p><p className="text-lg font-black text-gray-900">{selectedEmployee.role}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.cin}</p><p className="text-base font-bold text-gray-800">{selectedEmployee.cin || '---'}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.date}</p><p className="text-base font-bold text-gray-800">{new Date(selectedEmployee.created_at).toLocaleDateString()}</p></div>
              </div>

              <table className="w-full text-start mb-8 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100"><th className="border border-gray-300 p-3 font-bold text-gray-700">Désignation</th><th className="border border-gray-300 p-3 font-bold text-gray-700 text-center">Montant</th></tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 p-3 font-bold text-gray-800">Salaire de Base</td><td className="border border-gray-300 p-3 text-center font-mono font-bold" dir="ltr">{Number(selectedEmployee.base_salary).toLocaleString()} MAD</td></tr>
                  <tr><td className="border border-gray-300 p-3 text-gray-600 font-medium">Primes / Avances</td><td className="border border-gray-300 p-3 text-center font-mono text-green-600 font-bold" dir="ltr">+{Number(selectedEmployee.primes_avances || 0).toLocaleString()} MAD</td></tr>
                  <tr><td className="border border-gray-300 p-3 text-gray-600 font-medium">Retenues (CNSS, AMO)</td><td className="border border-gray-300 p-3 text-center font-mono text-red-600 font-bold" dir="ltr">-{Number(selectedEmployee.retenues || 0).toLocaleString()} MAD</td></tr>
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-80 bg-gray-50 border-2 border-gray-800 p-5 rounded-xl text-center shadow-inner">
                  <span className="block text-sm text-gray-500 uppercase tracking-widest mb-2 font-bold">Net à Payer</span>
                  <span className="text-3xl font-black text-gray-900 font-mono" dir="ltr">
                    {(Number(selectedEmployee.base_salary) + Number(selectedEmployee.primes_avances || 0) - Number(selectedEmployee.retenues || 0)).toLocaleString()} <span className="text-sm">MAD</span>
                  </span>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t-2 border-dashed border-gray-200 flex justify-between text-sm font-bold text-gray-500">
                <p>Signature de l'Employeur</p><p>Signature de l'Employé</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}