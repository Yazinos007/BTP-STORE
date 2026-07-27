import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  ShieldCheck, UserPlus, Check, X, Edit2, Trash2, 
  Loader2, Mail, Lock, User, Minus
} from 'lucide-react';

const translations = {
  ar: {
    title: 'الإعدادات والصلاحيات', subtitle: 'إدارة حسابات الموظفين وصلاحيات الوصول للنظام.',
    addUserBtn: 'إضافة مستخدم', userCol: 'المستخدم', actionsCol: 'إجراءات',
    colCommercial: 'التجارة والمبيعات', colOps: 'العمليات والمخزون', colFinance: 'المالية والمحاسبة', colHR: 'الموارد البشرية',
    permAchats: 'المشتريات والموردون', permStock: 'المخزون المركزي', permProd: 'الإنتاج (المعمل)', 
    permMarket: 'إدارة الماركت بليس', permVentes: 'إدارة المبيعات', permFactures: 'الفواتير',
    permRH: 'الموارد البشرية', permCaisses: 'الصناديق والبنك', permCharges: 'إدارة المصاريف', 
    permFiscal: 'النظام الجبائي', permCompta: 'المحاسبة والبيان',
    modalTitle: 'إضافة موظف جديد', name: 'الاسم الكامل', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    permissions: 'صلاحيات الوصول الدقيقة', save: 'حفظ المستخدم', cancel: 'إلغاء', boss: 'المالك (Boss)',
    saving: 'جاري الحفظ...', success: '✅ تم حفظ المستخدم بنجاح!', deleteConfirm: 'هل أنت متأكد من حذف هذا المستخدم؟',
    fullAccess: 'وصول كامل للمجموعة', partialAccess: 'وصول جزئي للمجموعة', noAccess: 'بدون صلاحيات'
  },
  fr: {
    title: 'Paramètres & Permissions', subtitle: 'Gérez les comptes des employés et les accès au système.',
    addUserBtn: 'Ajouter Utilisateur', userCol: 'Utilisateur', actionsCol: 'Actions',
    colCommercial: 'Commercial & Ventes', colOps: 'Opérations & Stock', colFinance: 'Finances & Compta', colHR: 'Ressources Humaines',
    permAchats: 'Achats & Fournisseurs', permStock: 'Stock Central', permProd: 'Production', 
    permMarket: 'Gestion Marketplace', permVentes: 'Gestion des Ventes', permFactures: 'Facturation',
    permRH: 'Ressources Humaines', permCaisses: 'Caisses & Banques', permCharges: 'Gestion des Charges', 
    permFiscal: 'Système Fiscal', permCompta: 'Comptabilité & Bilan',
    modalTitle: 'Ajouter un employé', name: 'Nom complet', email: 'Email', password: 'Mot de passe',
    permissions: 'Permissions d\'accès détaillées', save: 'Enregistrer', cancel: 'Annuler', boss: 'Propriétaire (Boss)',
    saving: 'Enregistrement...', success: '✅ Utilisateur enregistré avec succès !', deleteConfirm: 'Voulez-vous vraiment supprimer cet utilisateur ?',
    fullAccess: 'Accès complet au groupe', partialAccess: 'Accès partiel au groupe', noAccess: 'Aucun accès'
  },
  en: {
    title: 'Settings & Permissions', subtitle: 'Manage employee accounts and system access permissions.',
    addUserBtn: 'Add User', userCol: 'User', actionsCol: 'Actions',
    colCommercial: 'Sales & Commercial', colOps: 'Operations & Stock', colFinance: 'Finance & Accounting', colHR: 'Human Resources',
    permAchats: 'Purchases & Suppliers', permStock: 'Central Stock', permProd: 'Production', 
    permMarket: 'Marketplace Management', permVentes: 'Sales Management', permFactures: 'Invoicing',
    permRH: 'Human Resources', permCaisses: 'Banks & Registers', permCharges: 'Expenses Management', 
    permFiscal: 'Tax System (VAT)', permCompta: 'Accounting & CPC',
    modalTitle: 'Add New Employee', name: 'Full Name', email: 'Email', password: 'Password',
    permissions: 'Detailed Access Permissions', save: 'Save User', cancel: 'Cancel', boss: 'Owner (Boss)',
    saving: 'Saving...', success: '✅ User saved successfully!', deleteConfirm: 'Are you sure you want to delete this user?',
    fullAccess: 'Full access to group', partialAccess: 'Partial access to group', noAccess: 'No access'
  }
};
// المجموعات المنطقية لتسهيل عرض الجدول
const permissionClusters = {
  commercial: ['permMarket', 'permVentes', 'permFactures'],
  operations: ['permAchats', 'permStock', 'permProd'],
  finance: ['permCaisses', 'permCharges', 'permFiscal', 'permCompta'],
  hr: ['permRH']
};

export default function SupplierTeam() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];

  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultPermissions = {
    permAchats: false, permStock: false, permProd: false,
    permMarket: false, permVentes: false, permFactures: false,
    permRH: false, permCaisses: false, permCharges: false,
    permFiscal: false, permCompta: false
  };

  const [formData, setFormData] = useState({
    id: null, full_name: '', email: '', password: '', permissions: defaultPermissions
  });

  useEffect(() => {
    if (supplier?.id) fetchTeam();
  }, [supplier]);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('employees').select('*').eq('supplier_id', supplier.id);
      if (error) throw error;
      setTeam(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (key) => {
    setFormData(prev => ({
      ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (formData.id) {
        const { error } = await supabase.from('employees').update({
          full_name: formData.full_name, permissions: formData.permissions
        }).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employees').insert({
          supplier_id: supplier.id, full_name: formData.full_name, email: formData.email,
          role: 'employé', status: 'Actif', permissions: formData.permissions
        });
        if (error) throw error;
      }
      alert(t.success);
      setIsModalOpen(false);
      fetchTeam();
    } catch (err) {
      alert('Erreur: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await supabase.from('employees').delete().eq('id', id);
      fetchTeam();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setFormData({
        id: user.id, full_name: user.full_name, email: user.email, password: '',
        permissions: { ...defaultPermissions, ...(user.permissions || {}) }
      });
    } else {
      setFormData({ id: null, full_name: '', email: '', password: '', permissions: defaultPermissions });
    }
    setIsModalOpen(true);
  };

  // مكون ذكي لعرض حالة المجموعة (كاملة، جزئية، فارغة)
  const ClusterStatus = ({ permissions, clusterKeys, isBoss }) => {
    if (isBoss) return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mx-auto shadow-md"><Check size={14} className="text-white" /></div>;
    
    const activeCount = clusterKeys.filter(key => permissions?.[key]).length;
    
    if (activeCount === clusterKeys.length) return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mx-auto shadow-md"><Check size={14} className="text-white" /></div>;
    if (activeCount > 0) return <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center mx-auto shadow-md"><Minus size={14} className="text-white" /></div>;
    return <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto"><X size={14} className="text-slate-600" /></div>;
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 mb-2">{t.title}</h2>
        <p className="text-slate-400 font-medium">{t.subtitle}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><ShieldCheck size={24} /></div>
            <h3 className="text-xl font-bold text-white">Permissions Control Panel</h3>
          </div>
          <button onClick={() => openModal()} className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm cursor-pointer">
            <UserPlus size={18} /> {t.addUserBtn}
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-slate-800 text-sm">
                <th className="pb-4 font-black text-slate-400 text-start">{t.userCol}</th>
                <th className="pb-4 font-bold text-blue-400 text-center">{t.colCommercial}</th>
                <th className="pb-4 font-bold text-emerald-400 text-center">{t.colOps}</th>
                <th className="pb-4 font-bold text-orange-400 text-center">{t.colFinance}</th>
                <th className="pb-4 font-bold text-pink-400 text-center">{t.colHR}</th>
                <th className="pb-4 font-black text-slate-500 text-center">{t.actionsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-black">{supplier?.store_name?.charAt(0) || 'B'}</div>
                    <div>
                      <p className="font-bold text-white text-sm">{supplier?.store_name}</p>
                      <p className="text-xs text-amber-500 font-bold mt-0.5">{t.boss}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-center"><ClusterStatus isBoss={true} /></td>
                <td className="py-4 text-center"><ClusterStatus isBoss={true} /></td>
                <td className="py-4 text-center"><ClusterStatus isBoss={true} /></td>
                <td className="py-4 text-center"><ClusterStatus isBoss={true} /></td>
                <td className="py-4 text-center">
                   <div className="w-6 h-6 mx-auto bg-slate-800 rounded-full flex items-center justify-center"><Lock size={12} className="text-slate-500"/></div>
                </td>
              </tr>

              {isLoading ? (
                <tr><td colSpan="6" className="py-8 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto"/></td></tr>
              ) : (
                team.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">{user.full_name?.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-white text-sm">{user.full_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center"><ClusterStatus permissions={user.permissions} clusterKeys={permissionClusters.commercial} /></td>
                    <td className="py-4 text-center"><ClusterStatus permissions={user.permissions} clusterKeys={permissionClusters.operations} /></td>
                    <td className="py-4 text-center"><ClusterStatus permissions={user.permissions} clusterKeys={permissionClusters.finance} /></td>
                    <td className="py-4 text-center"><ClusterStatus permissions={user.permissions} clusterKeys={permissionClusters.hr} /></td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(user)} className="p-2 bg-slate-800 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition-colors cursor-pointer"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-6 flex flex-wrap justify-center gap-6 md:gap-10 text-xs text-slate-500 font-medium bg-slate-900/50 py-3 rounded-xl border border-slate-800">
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                <Check size={12} className="text-white" />
              </div> 
              {t.fullAccess}
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                <Minus size={12} className="text-white" />
              </div> 
              {t.partialAccess}
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <X size={12} className="text-slate-600" />
              </div> 
              {t.noAccess}
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 shrink-0">
              <h3 className="text-xl font-black text-white">{t.modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                  <input required type="text" placeholder={t.name} value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className={`w-full bg-slate-950 border border-slate-800 py-3.5 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl text-white outline-none focus:border-blue-500 font-medium`} />
                </div>
                
                <div className="relative">
                  <Mail className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                  <input required type="email" placeholder={t.email} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={!!formData.id} className={`w-full bg-slate-950 border border-slate-800 py-3.5 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl text-white outline-none focus:border-blue-500 font-medium disabled:opacity-50`} />
                </div>

                {!formData.id && (
                  <div className="relative md:col-span-2">
                    <Lock className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                    <input required type="password" placeholder={t.password} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full bg-slate-950 border border-slate-800 py-3.5 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl text-white outline-none focus:border-blue-500 font-medium`} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-4">{t.permissions}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.keys(defaultPermissions).map((key) => {
                    const color = key.includes('Market') || key.includes('Ventes') || key.includes('Factures') ? 'blue' 
                                : key.includes('Achats') || key.includes('Stock') || key.includes('Prod') ? 'emerald'
                                : key.includes('RH') ? 'pink' : 'orange';

                    return (
                      <label key={key} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.permissions[key] ? `bg-${color}-500/10 border-${color}-500/50` : 'bg-slate-950 border-slate-800 hover:bg-slate-800'}`}>
                        <input type="checkbox" checked={formData.permissions[key]} onChange={() => handleTogglePermission(key)} className="hidden" />
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.permissions[key] ? `bg-${color}-500 border-${color}-500` : 'border-slate-600'}`}>
                          {formData.permissions[key] && <Check size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm font-bold ${formData.permissions[key] ? 'text-white' : 'text-slate-400'}`}>{t[key]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer">
                  {t.cancel}
                </button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer">
                  {isSaving ? <Loader2 size={18} className="animate-spin"/> : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}