import { useState, useEffect, useRef } from 'react';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore';
import { Building2, Phone, MapPin, Save, Globe, Store, Camera, Loader2, Shield, Check, X, Trash2, UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';

const translations = {
  ar: {
    title: 'الإعدادات والصلاحيات', subtitle: 'إدارة معلومات الشركة، وتخصيص صلاحيات فريق العمل.',
    permsPanelTitle: 'لوحة التحكم بالصلاحيات',
    tabProfile: 'ملف الشركة', tabUsers: 'المستخدمين والصلاحيات', tabPrefs: 'تفضيلات النظام',
    storeName: 'اسم الشركة', phone: 'الهاتف', address: 'العنوان', ice: 'رقم ICE',
    save: 'حفظ التعديلات', saving: 'جاري الحفظ...', changeLogo: 'تغيير الشعار',
    language: 'لغة النظام', langDesc: 'تغيير لغة الواجهة.',
    addUser: 'إضافة مستخدم', name: 'الاسم الكامل', email: 'البريد الإلكتروني',
    perms: { sales: 'المبيعات والطلبات', products: 'المخزون والمنتجات', purchases: 'المشتريات والموردين', invoices: 'إدارة الفواتير', accounting: 'المحاسبة والصناديق', hr: 'الموارد البشرية' },
    statusActive: 'نشط', statusInactive: 'موقوف'
  },
  fr: {
    title: 'Paramètres et Accès', subtitle: 'Gérez les infos de l\'entreprise et les permissions de l\'équipe.',
    permsPanelTitle: 'Gestion des Permissions',
    tabProfile: 'Profil Entreprise', tabUsers: 'Utilisateurs & Accès', tabPrefs: 'Préférences',
    storeName: 'Nom de l\'Entreprise', phone: 'Téléphone', address: 'Adresse', ice: 'ICE',
    save: 'Enregistrer', saving: 'Enregistrement...', changeLogo: 'Changer le logo',
    language: 'Langue du Système', langDesc: 'Changer la langue de l\'interface.',
    addUser: 'Nouvel Utilisateur', name: 'Nom Complet', email: 'Email',
    perms: { sales: 'Ventes & Commandes', products: 'Stock & Produits', purchases: 'Achats & Fournisseurs', invoices: 'Facturation', accounting: 'Comptabilité & Caisses', hr: 'Ressources Humaines' },
    statusActive: 'Actif', statusInactive: 'Suspendu'
  }
};

const permColors = {
  sales: { text: 'text-blue-600', bg: 'bg-blue-100', activeBg: 'bg-blue-500', activeText: 'text-white' },
  products: { text: 'text-emerald-600', bg: 'bg-emerald-100', activeBg: 'bg-emerald-500', activeText: 'text-white' },
  purchases: { text: 'text-purple-600', bg: 'bg-purple-100', activeBg: 'bg-purple-500', activeText: 'text-white' },
  invoices: { text: 'text-orange-600', bg: 'bg-orange-100', activeBg: 'bg-orange-500', activeText: 'text-white' },
  accounting: { text: 'text-slate-600', bg: 'bg-slate-100', activeBg: 'bg-slate-500', activeText: 'text-white' },
  hr: { text: 'text-rose-600', bg: 'bg-rose-100', activeBg: 'bg-rose-500', activeText: 'text-white' }
};

export default function Settings() {
  const { supplier, updateProfile, uploadLogo, isLoading, teamMembers, fetchTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useSupplierStore();
  const { language, toggleLanguage } = useSettingsStore();
  const t = translations[language] || translations['fr'];

  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ store_name: '', phone: '', address: '', ice: '' });
  const [isSaving, setIsSaving] = useState(false);
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ full_name: '', email: '', permissions: { sales: true, products: false, purchases: false, invoices: false, accounting: false, hr: false } });

  useEffect(() => {
    if (supplier) {
      setFormData({ 
        store_name: supplier.store_name || '', 
        phone: supplier.phone || '', 
        address: supplier.address || '', 
        ice: supplier.ice || '' 
      });
    }
    fetchTeamMembers();
  }, [supplier, fetchTeamMembers]);

  const handleLogoChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadLogo(e.target.files[0]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      alert(language === 'fr' ? '✅ Enregistré avec succès !' : '✅ تم حفظ البيانات بنجاح!');
    } catch (err) {
      console.error(err);
      alert(language === 'fr' ? 'Erreur lors de la sauvegarde.' : 'حدث خطأ أثناء الحفظ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    await addTeamMember(userForm);
    setShowUserForm(false);
    setUserForm({ full_name: '', email: '', permissions: { sales: true, products: false, purchases: false, invoices: false, accounting: false, hr: false } });
  };

  const toggleUserPermission = async (user, permKey) => {
    const currentPerms = user.permissions || {};
    const updatedPerms = { ...currentPerms, [permKey]: !currentPerms[permKey] };
    await updateTeamMember(user.id, { permissions: updatedPerms });
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateTeamMember(user.id, { status: newStatus });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h2>
        <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'bg-white text-blue-600 border-t border-x border-gray-200 border-b-transparent' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><Building2 size={16}/> {t.tabProfile}</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-blue-600 border-t border-x border-gray-200 border-b-transparent' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><Shield size={16}/> {t.tabUsers}</button>
        <button onClick={() => setActiveTab('prefs')} className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors flex items-center gap-2 ${activeTab === 'prefs' ? 'bg-white text-blue-600 border-t border-x border-gray-200 border-b-transparent' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><Globe size={16}/> {t.tabPrefs}</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-2xl rounded-tr-2xl shadow-sm p-6">
        {activeTab === 'profile' && (
          <div className="max-w-2xl animate-fade-in">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-gray-100 shadow-inner bg-gray-50 flex items-center justify-center overflow-hidden">
                  {isLoading ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" /> : supplier?.logo_url ? <img src={supplier.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-12 h-12 text-gray-300" />}
                </div>
                <button onClick={() => fileInputRef.current.click()} disabled={isLoading} className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors group-hover:scale-110"><Camera size={16} /></button>
                <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.storeName}</label><input type="text" required value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 outline-none bg-gray-50 font-bold" /></div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 outline-none bg-gray-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.ice}</label><input type="text" value={formData.ice} onChange={e => setFormData({...formData, ice: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 outline-none bg-gray-50 font-mono" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.address}</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 outline-none bg-gray-50" /></div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 font-bold disabled:opacity-70">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {isSaving ? t.saving : t.save}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ... باقي الأكواد أسفل هذا القسم بدون تغيير (users و prefs) ... */}
        {activeTab === 'users' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Shield className="text-blue-600"/> {t.permsPanelTitle}</h3>
              <button onClick={() => setShowUserForm(!showUserForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"><UserPlus size={16}/> {t.addUser}</button>
            </div>

            {showUserForm && (
              <form onSubmit={handleUserSubmit} className="bg-blue-50 border border-blue-100 p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.name}</label><input type="text" required value={userForm.full_name} onChange={e => setUserForm({...userForm, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.email}</label><input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none" /></div>
                <div className="md:col-span-2 flex justify-end"><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">{t.save}</button></div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-gray-600 font-bold">{language === 'fr' ? 'Utilisateur' : 'المستخدم'}</th>
                    {Object.keys(permColors).map(key => (
                      <th key={key} className={`px-4 py-3 font-black text-center ${permColors[key].text}`}>{t.perms[key]}</th>
                    ))}
                    <th className="px-4 py-3 text-gray-600 font-bold text-center">{language === 'fr' ? 'Statut' : 'حالة الحساب'}</th>
                    <th className="px-4 py-3 text-gray-600 font-bold text-center">{language === 'fr' ? 'Supprimer' : 'إزالة'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-blue-50/30">
                    <td className="px-4 py-4"><p className="font-bold text-blue-800">{supplier?.store_name || 'Admin'}</p><p className="text-xs text-gray-500">{supplier?.email}</p></td>
                    {Object.keys(permColors).map(key => (
                      <td key={key} className="px-4 py-4 text-center">
                        <div className={`mx-auto w-7 h-7 rounded-full flex items-center justify-center ${permColors[key].activeBg} ${permColors[key].activeText}`}><Check size={14} strokeWidth={3}/></div>
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center"><span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-bold uppercase">Propriétaire</span></td>
                    <td className="px-4 py-4 text-center">-</td>
                  </tr>
                  
                  {teamMembers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4"><p className="font-bold text-gray-800">{user.full_name}</p><p className="text-xs text-gray-500">{user.email}</p></td>
                      {Object.keys(permColors).map(perm => (
                        <td key={perm} className="px-4 py-4 text-center">
                          <button onClick={() => toggleUserPermission(user, perm)} className={`p-2 rounded-lg transition-all ${user.permissions?.[perm] ? `${permColors[perm].activeBg} ${permColors[perm].activeText} shadow-md` : `bg-gray-100 text-gray-400 hover:${permColors[perm].bg} hover:${permColors[perm].text}`}`}>
                            {user.permissions?.[perm] ? <Check size={16} strokeWidth={3}/> : <X size={16}/>}
                          </button>
                        </td>
                      ))}
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => toggleUserStatus(user)} className="flex items-center justify-center mx-auto">
                          {user.status === 'active' ? <ToggleRight size={28} className="text-emerald-500"/> : <ToggleLeft size={28} className="text-gray-400"/>}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center"><button onClick={() => { if(window.confirm('Supprimer cet utilisateur ?')) deleteTeamMember(user.id); }} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'prefs' && (
          <div className="max-w-md animate-fade-in space-y-4">
            <h3 className="font-bold text-gray-800 mb-4">{t.language}</h3>
            <p className="text-sm text-gray-500 mb-4">{t.langDesc}</p>
            <button onClick={toggleLanguage} className="w-full flex justify-between items-center bg-gray-50 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 p-4 rounded-xl transition-all">
              <span className="font-bold text-gray-700">{language === 'fr' ? 'Français' : 'العربية'}</span>
              <span className="text-xs bg-white border border-gray-200 px-3 py-1 rounded shadow-sm text-gray-600 font-bold uppercase">{language}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}