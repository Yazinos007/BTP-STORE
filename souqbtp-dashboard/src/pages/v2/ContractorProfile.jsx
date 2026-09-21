import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import useSupplierStore from '../../store/useSupplierStore';
import { 
  ShieldCheck, UploadCloud, FileText, CheckCircle2, AlertTriangle, 
  Lock, Award, Building2, CreditCard, Loader2, Star, Save, Camera, 
  MessageCircle, UserPlus, Check, X, Edit2, Trash2, Mail, User, Minus
} from 'lucide-react';

const translations = {
  ar: {
    title: 'الملف الشخصي والإعدادات', subtitle: 'أدر حسابك، وثق هويتك، وتحكم في صلاحيات فريق العمل.',
    verifiedBadge: 'مؤسسة معتمدة (SouqBTP Verified)', badgeDesc: 'المؤسسات المعتمدة تحظى بثقة مطلقة وتحصل على الأولوية في الصفقات والمناقصات.',
    kycTitle: 'الوثائق القانونية (KYC)', kycDesc: 'يرجى رفع المستندات التالية لتوثيق حسابك.',
    uploadRC: 'السجل التجاري (RC)', uploadICE: 'التعريف الضريبي (ICE)', uploadCIN: 'بطاقة المسير (CIN)',
    btnUpload: 'اختر ملف', statusUnverified: 'حساب غير موثق', statusPending: 'قيد المراجعة', statusVerified: 'موثق ومعتمد',
    submitVerification: 'إرسال للمراجعة', saving: 'جاري الحفظ...',
    subscriptionTitle: 'الباقة الحالية', activePlan: 'الباقة النشطة', upgradeBtn: 'ترقية للباقة الذهبية',
    storeInfo: 'بيانات المقاولة', companyName: 'اسم المقاولة / الشركة', phone: 'رقم الهاتف', address: 'العنوان',
    saveInfo: 'حفظ التعديلات', successVerify: '✅ تم إرسال ملفاتك بنجاح!', successSave: '✅ تم الحفظ بنجاح!',
    errorSave: 'حدث خطأ أثناء الحفظ.', connectTelegram: 'ربط الحساب بالتلغرام (VIP)',
    teamTitle: 'لوحة تحكم الصلاحيات', addUserBtn: 'إضافة موظف', userCol: 'المستخدم', actionsCol: 'إجراءات',
    colCommercial: 'التجارة والمبيعات', colOps: 'العمليات والمخزون', colFinance: 'المالية والمحاسبة', colHR: 'الموارد البشرية',
    permAchats: 'المشتريات والموردون', permStock: 'المخزون المركزي', permProd: 'الإنتاج (المعمل)', 
    permMarket: 'الماركت بليس', permVentes: 'المبيعات', permFactures: 'الفواتير',
    permRH: 'الموارد البشرية', permCaisses: 'الصناديق والبنك', permCharges: 'إدارة المصاريف', 
    permFiscal: 'النظام الجبائي', permCompta: 'المحاسبة والبيان',
    modalTitle: 'إضافة موظف جديد', name: 'الاسم الكامل', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    permissions: 'صلاحيات الوصول الدقيقة', saveUser: 'حفظ المستخدم', cancel: 'إلغاء', boss: 'المالك (Boss)',
    fullAccess: 'وصول كامل', partialAccess: 'وصول جزئي', noAccess: 'بدون صلاحيات', deleteConfirm: 'حذف هذا المستخدم؟'
  },
  fr: {
    title: 'Profil & Paramètres', subtitle: 'Gérez votre compte, certifiez votre entreprise et contrôlez les accès.',
    verifiedBadge: 'Entreprise Certifiée (SouqBTP Verified)', badgeDesc: 'Les entreprises certifiées inspirent une confiance absolue.',
    kycTitle: 'Documents Légaux (KYC)', kycDesc: 'Veuillez télécharger ces documents pour vérification.',
    uploadRC: 'Registre de Commerce', uploadICE: 'Certificat ICE', uploadCIN: 'CIN du Gérant',
    btnUpload: 'Choisir fichier', statusUnverified: 'Non Vérifié', statusPending: 'En Cours', statusVerified: 'Vérifié',
    submitVerification: 'Soumettre', saving: 'Enregistrement...',
    subscriptionTitle: 'Abonnement', activePlan: 'Plan Actif', upgradeBtn: 'Passer à l\'Enterprise',
    storeInfo: 'Informations de l\'Entreprise', companyName: 'Nom de l\'entreprise', phone: 'Téléphone', address: 'Adresse',
    saveInfo: 'Enregistrer', successVerify: '✅ Documents envoyés !', successSave: '✅ Informations enregistrées !',
    errorSave: 'Erreur de sauvegarde.', connectTelegram: 'Lier avec Telegram (VIP)',
    teamTitle: 'Panneau des Permissions', addUserBtn: 'Ajouter Employé', userCol: 'Utilisateur', actionsCol: 'Actions',
    colCommercial: 'Commercial & Ventes', colOps: 'Opérations & Stock', colFinance: 'Finances & Compta', colHR: 'RH',
    permAchats: 'Achats & Fournisseurs', permStock: 'Stock Central', permProd: 'Production', 
    permMarket: 'Marketplace', permVentes: 'Ventes', permFactures: 'Facturation',
    permRH: 'Ressources Humaines', permCaisses: 'Caisses & Banques', permCharges: 'Gestion des Charges', 
    permFiscal: 'Système Fiscal', permCompta: 'Comptabilité & Bilan',
    modalTitle: 'Nouvel Employé', name: 'Nom complet', email: 'Email', password: 'Mot de passe',
    permissions: 'Permissions détaillées', saveUser: 'Enregistrer', cancel: 'Annuler', boss: 'Propriétaire',
    fullAccess: 'Accès complet', partialAccess: 'Accès partiel', noAccess: 'Aucun accès', deleteConfirm: 'Supprimer cet utilisateur ?'
  },
  en: {
    title: 'Profile & Settings', subtitle: 'Manage your account, certify your business, and control team access.',
    verifiedBadge: 'Certified Company (SouqBTP)', badgeDesc: 'Certified companies get priority in deals and tenders.',
    kycTitle: 'Legal Documents (KYC)', kycDesc: 'Please upload these documents to verify your account.',
    uploadRC: 'Commercial Register', uploadICE: 'Tax ID (ICE)', uploadCIN: 'Manager ID (CIN)',
    btnUpload: 'Choose file', statusUnverified: 'Unverified', statusPending: 'Pending', statusVerified: 'Verified',
    submitVerification: 'Submit', saving: 'Saving...',
    subscriptionTitle: 'Subscription', activePlan: 'Active Plan', upgradeBtn: 'Upgrade to Enterprise',
    storeInfo: 'Company Info', companyName: 'Company Name', phone: 'Phone', address: 'Address',
    saveInfo: 'Save', successVerify: '✅ Documents sent!', successSave: '✅ Saved successfully!',
    errorSave: 'Error saving.', connectTelegram: 'Connect Telegram (VIP)',
    teamTitle: 'Permissions Panel', addUserBtn: 'Add Employee', userCol: 'User', actionsCol: 'Actions',
    colCommercial: 'Sales', colOps: 'Operations', colFinance: 'Finance', colHR: 'HR',
    permAchats: 'Purchases', permStock: 'Stock', permProd: 'Production', 
    permMarket: 'Marketplace', permVentes: 'Sales', permFactures: 'Invoicing',
    permRH: 'Human Resources', permCaisses: 'Banks', permCharges: 'Expenses', 
    permFiscal: 'Tax System', permCompta: 'Accounting',
    modalTitle: 'New Employee', name: 'Full Name', email: 'Email', password: 'Password',
    permissions: 'Access Permissions', saveUser: 'Save User', cancel: 'Cancel', boss: 'Owner',
    fullAccess: 'Full access', partialAccess: 'Partial access', noAccess: 'No access', deleteConfirm: 'Delete user?'
  }
};

const permissionClusters = {
  operations: ['permAchats', 'permStock', 'permProd'],
  commercial: ['permMarket', 'permVentes', 'permFactures'],
  hr: ['permRH'],
  finance: ['permCaisses', 'permCharges', 'permFiscal', 'permCompta']
};

export default function ContractorProfile() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';
  const { supplier, updateProfile, uploadLogo, isLoading } = useSupplierStore();
  
  const t = translations[language] || translations.ar;
  const navigate = useNavigate();

  // 🚀 حالة المستخدم
  const [userObj, setUserObj] = useState(null);

  // --- KYC & Store State ---
  const [verificationStatus, setVerificationStatus] = useState('unverified'); 
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [files, setFiles] = useState({ rc: null, ice: null, cin: null });
  const [storeData, setStoreData] = useState({ store_name: '', phone: '', address: '' });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // --- Team State ---
  const [team, setTeam] = useState([]);
  const [isTeamLoading, setIsTeamLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  const defaultPermissions = {
    permAchats: false, permStock: false, permProd: false,
    permMarket: false, permVentes: false, permFactures: false,
    permRH: false, permCaisses: false, permCharges: false,
    permFiscal: false, permCompta: false
  };

  const [formData, setFormData] = useState({
    id: null, full_name: '', email: '', password: '', permissions: defaultPermissions
  });

  // 🚀 المعالج السحري: جلب البيانات مباشرة دون انتظار المتاهات
  useEffect(() => {
    let isMounted = true;
    const initializeProfile = async () => {
      setIsTeamLoading(true); // تبدأ عجلة التحميل
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          setUserObj(user);
          
          // 1. جلب بيانات المقاولة مباشرة من قاعدة البيانات
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          
          if (profileData) {
            setStoreData({
              store_name: profileData.store_name || '',
              phone: profileData.phone || '',
              address: profileData.address || ''
            });
          } else if (supplier) {
            setStoreData({
              store_name: supplier.store_name || '',
              phone: supplier.phone || '',
              address: supplier.address || ''
            });
          }
          
          // 2. جلب الموظفين والصلاحيات
          const targetId = profileData?.id || user.id;
          const { data: teamData } = await supabase.from('employees').select('*').eq('supplier_id', targetId);
          if (teamData) setTeam(teamData);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        if (isMounted) setIsTeamLoading(false); // 🚀 الإغلاق القاطع لعجلة التحميل مهما حصل!
      }
    };

    initializeProfile();
    return () => { isMounted = false; };
  }, []);

  const refreshTeam = async (uid) => {
    if (!uid) return;
    const { data } = await supabase.from('employees').select('*').eq('supplier_id', uid);
    if (data) setTeam(data);
  };

  // --- Handlers: KYC & Store ---
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [type]: file.name }));
  };

  const handleLogoChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadLogo(e.target.files[0]);
  };

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    setIsSubmittingKYC(true);
    setTimeout(() => {
      setIsSubmittingKYC(false);
      setVerificationStatus('pending');
      alert(t.successVerify);
    }, 2000);
  };

  const handleSaveStoreInfo = async () => {
    if (!userObj) return;
    setIsSavingInfo(true);
    try {
      if (updateProfile) {
        await updateProfile(storeData);
      } else {
        await supabase.from('profiles').update(storeData).eq('id', userObj.id);
      }
      alert(t.successSave);
    } catch (err) { alert(t.errorSave); } 
    finally { setIsSavingInfo(false); }
  };

  // --- Handlers: Team ---
  const handleTogglePermission = (key) => {
    setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] } }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userObj) return;
    setIsSavingUser(true);
    try {
      if (formData.id) {
        await supabase.from('employees').update({ full_name: formData.full_name, email: formData.email, permissions: formData.permissions }).eq('id', formData.id);
      } else {
        await supabase.from('employees').insert({ supplier_id: userObj.id, full_name: formData.full_name, email: formData.email, role: 'employé', status: 'Actif', permissions: formData.permissions });
      }
      alert(t.successSave);
      setIsModalOpen(false);
      refreshTeam(userObj.id);
    } catch (err) { alert('Error: ' + err.message); } 
    finally { setIsSavingUser(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await supabase.from('employees').delete().eq('id', id);
      if (userObj) refreshTeam(userObj.id);
    } catch (err) { console.error(err); }
  };

  const openModal = (user = null) => {
    if (user) {
      setFormData({ id: user.id, full_name: user.full_name || '', email: user.email || '', password: '', permissions: { ...defaultPermissions, ...(user.permissions || {}) } });
    } else {
      setFormData({ id: null, full_name: '', email: '', password: '', permissions: defaultPermissions });
    }
    setIsModalOpen(true);
  };

  // --- Helpers ---
  const ClusterStatus = ({ permissions, clusterKeys, isBoss }) => {
    if (isBoss) return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mx-auto shadow-md"><Check size={14} className="text-white" /></div>;
    const activeCount = clusterKeys.filter(key => permissions?.[key]).length;
    if (activeCount === clusterKeys.length) return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mx-auto shadow-md"><Check size={14} className="text-white" /></div>;
    if (activeCount > 0) return <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center mx-auto shadow-md"><Minus size={14} className="text-white" /></div>;
    return <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}><X size={14} className={isDarkMode ? 'text-slate-600' : 'text-slate-400'} /></div>;
  };

  // 🎨 V2 UI Styles
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-6`}>
        <div>
          <h2 className={`text-3xl font-black ${textMain} tracking-tight flex items-center gap-3`}>
            <ShieldCheck className="text-blue-500" size={32} />
            {t.title}
          </h2>
          <p className={`${textMuted} mt-2 font-medium`}>{t.subtitle}</p>
        </div>
        
        <div className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-sm border shadow-sm ${
          verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
          verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
          (isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-300')
        }`}>
          {verificationStatus === 'verified' && <CheckCircle2 size={18} />}
          {verificationStatus === 'pending' && <Loader2 size={18} className="animate-spin" />}
          {verificationStatus === 'unverified' && <AlertTriangle size={18} />}
          {verificationStatus === 'verified' ? t.statusVerified : verificationStatus === 'pending' ? t.statusPending : t.statusUnverified}
        </div>
      </div>

      {/* 🚀 Section 1: KYC & Store Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KYC Trust Center */}
        <div className="lg:col-span-2 space-y-8">
          <div className={`bg-gradient-to-br ${isDarkMode ? 'from-slate-900 to-slate-950 border-amber-500/30' : 'from-amber-50 to-white border-amber-200'} border-2 rounded-[2rem] p-8 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)]`}>
            <div className={`absolute ${isRtl ? '-left-10' : '-right-10'} -top-10 text-amber-500/10 pointer-events-none`}><Award size={250} /></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-500/30"><ShieldCheck size={28} /></div>
              <div>
                <h3 className="text-2xl font-black text-amber-500 flex items-center gap-2">
                  {t.verifiedBadge} <Star size={18} className="fill-amber-500 text-amber-500" />
                </h3>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} font-medium mt-1`}>{t.badgeDesc}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitVerification} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'rc', label: t.uploadRC, icon: FileText },
                  { id: 'ice', label: t.uploadICE, icon: Building2 },
                  { id: 'cin', label: t.uploadCIN, icon: CreditCard }
                ].map(doc => (
                  <div key={doc.id} className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-amber-400'} border-2 rounded-2xl p-5 text-center group transition-colors shadow-sm`}>
                    <doc.icon size={30} className="mx-auto mb-3 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    <p className={`text-sm font-bold ${textMain} mb-3`}>{doc.label}</p>
                    <label className={`cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} px-4 py-2.5 rounded-xl text-xs font-bold transition-colors inline-block w-full`}>
                      {files[doc.id] ? <span className="text-emerald-500 flex items-center justify-center gap-1"><CheckCircle2 size={14}/> {files[doc.id].slice(0,10)}...</span> : t.btnUpload}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, doc.id)} disabled={verificationStatus !== 'unverified'} />
                    </label>
                  </div>
                ))}
              </div>

              {verificationStatus === 'unverified' && (
                <button type="submit" disabled={!files.rc || !files.ice || !files.cin || isSubmittingKYC} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-2xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-amber-500/20">
                  {isSubmittingKYC ? <Loader2 size={20} className="animate-spin" /> : <><UploadCloud size={20} /> {t.submitVerification}</>}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Subscription & Store Info */}
        <div className="space-y-6">
          <div className={`${bgMain} border-2 rounded-[2rem] p-6 shadow-xl`}>
            <h4 className={`text-lg font-black ${textMain} mb-4 flex items-center gap-2`}><Star size={20} className="text-blue-500" /> {t.subscriptionTitle}</h4>
            <div className={`p-4 ${isDarkMode ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border-2 rounded-2xl mb-4`}>
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">{t.activePlan}</p>
              <h5 className={`text-2xl font-black ${textMain}`}>Starter B2B</h5>
            </div>
            <button onClick={() => navigate('/v2/subscription')} className={`w-full py-3.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'} font-black rounded-xl transition-all border-2 flex justify-center items-center gap-2`}>
              <Lock size={18} /> {t.upgradeBtn}
            </button>
          </div>

          <div className={`${bgMain} border-2 rounded-[2rem] p-6 shadow-xl`}>
            <h4 className={`text-lg font-black ${textMain} mb-6 flex items-center gap-2`}><Building2 size={20} className="text-blue-500" /> {t.storeInfo}</h4>
            
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className={`w-24 h-24 rounded-full border-4 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'} overflow-hidden flex items-center justify-center shadow-lg`}>
                  {isLoading ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin" /> : supplier?.logo_url ? <img src={supplier.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <span className={`text-3xl font-black ${textMuted}`}>{storeData.store_name?.charAt(0) || 'C'}</span>}
                </div>
                <label className={`absolute bottom-0 ${isRtl ? 'left-0' : 'right-0'} bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full cursor-pointer transition-colors shadow-lg border-2 ${isDarkMode ? 'border-slate-900' : 'border-white'}`}>
                  <Camera size={16} />
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold ${textMuted} mb-1`}>{t.companyName}</label>
                <input type="text" value={storeData.store_name} onChange={e => setStoreData({...storeData, store_name: e.target.value})} className={`w-full ${bgInput} px-4 py-3 rounded-xl border-2 outline-none focus:border-blue-500 font-bold`} />
              </div>
              <div>
                <label className={`block text-xs font-bold ${textMuted} mb-1`}>{t.phone}</label>
                <input type="text" value={storeData.phone} onChange={e => setStoreData({...storeData, phone: e.target.value})} className={`w-full ${bgInput} px-4 py-3 rounded-xl border-2 outline-none focus:border-blue-500 font-bold`} />
              </div>
              <div>
                <label className={`block text-xs font-bold ${textMuted} mb-1`}>{t.address}</label>
                <input type="text" value={storeData.address} onChange={e => setStoreData({...storeData, address: e.target.value})} className={`w-full ${bgInput} px-4 py-3 rounded-xl border-2 outline-none focus:border-blue-500 font-bold`} />
              </div>
              <button onClick={handleSaveStoreInfo} disabled={isSavingInfo} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2 flex justify-center items-center gap-2">
                {isSavingInfo ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t.saveInfo}
              </button>

              <div className={`pt-4 mt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <a href={`https://t.me/SouqBTP_Bot?start=${userObj?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black rounded-xl transition-all shadow-lg shadow-[#2AABEE]/30">
                  <MessageCircle size={20} className="fill-current" /> <span>{t.connectTelegram}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Section 2: Team Permissions Panel */}
      <div className={`${bgMain} border-2 rounded-[2rem] p-6 md:p-8 shadow-xl`}>
        <div className={`flex justify-between items-center mb-6 pb-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl"><ShieldCheck size={28} /></div>
            <h3 className={`text-xl font-black ${textMain}`}>{t.teamTitle}</h3>
          </div>
          <button onClick={() => openModal()} className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <UserPlus size={18} /> <span className="hidden md:inline">{t.addUserBtn}</span>
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} text-sm`}>
                <th className={`pb-4 font-black ${textMuted} text-start`}>{t.userCol}</th>
                <th className="pb-4 font-black text-emerald-500 text-center">{t.colOps}</th>
                <th className="pb-4 font-black text-blue-500 text-center">{t.colCommercial}</th>
                <th className="pb-4 font-black text-pink-500 text-center">{t.colHR}</th>
                <th className="pb-4 font-black text-orange-500 text-center">{t.colFinance}</th>
                <th className={`pb-4 font-black ${textMuted} text-center`}>{t.actionsCol}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
              <tr className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-black text-lg">{storeData.store_name?.charAt(0) || 'C'}</div>
                    <div>
                      <p className={`font-black ${textMain}`}>{storeData.store_name || t.boss}</p>
                      <p className="text-xs text-amber-500 font-black mt-0.5 tracking-widest uppercase">{t.boss}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 text-center"><ClusterStatus isBoss={true} /></td>
                <td className="py-5 text-center"><ClusterStatus isBoss={true} /></td>
                <td className="py-5 text-center"><ClusterStatus isBoss={true} /></td>
                <td className="py-5 text-center"><ClusterStatus isBoss={true} /></td>
                <td className="py-5 text-center">
                   <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400'}`}><Lock size={14}/></div>
                </td>
              </tr>

              {isTeamLoading ? (
                <tr><td colSpan="6" className="py-8 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto"/></td></tr>
              ) : (
                team.map(user => (
                  <tr key={user.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-lg ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>{user.full_name?.charAt(0)}</div>
                        <div>
                          <p className={`font-black ${textMain}`}>{user.full_name}</p>
                          <p className={`text-xs font-bold mt-0.5 ${textMuted}`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-center"><ClusterStatus permissions={user.permissions} clusterKeys={permissionClusters.operations} /></td>
                    <td className="py-5 text-center"><ClusterStatus permissions={user.permissions} clusterKeys={permissionClusters.commercial} /></td>
                    <td className="py-5 text-center"><ClusterStatus permissions={user.permissions} clusterKeys={permissionClusters.hr} /></td> 
                    <td className="py-5 text-center"><ClusterStatus permissions={user.permissions} clusterKeys={permissionClusters.finance} /></td>
                    <td className="py-5 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(user)} className={`p-2.5 rounded-xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-slate-100 text-blue-600 hover:bg-blue-500 hover:text-white'}`}><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteUser(user.id)} className={`p-2.5 rounded-xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 text-red-400 hover:bg-red-600 hover:text-white' : 'bg-slate-100 text-red-600 hover:bg-red-500 hover:text-white'}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <div className={`mt-6 flex flex-wrap justify-center gap-6 md:gap-10 text-xs font-bold py-4 rounded-xl border-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-md"><Check size={12} className="text-white" /></div> {t.fullAccess}</span>
            <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-md"><Minus size={12} className="text-white" /></div> {t.partialAccess}</span>
            <span className="flex items-center gap-2"><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'}`}><X size={12} className={textMuted} /></div> {t.noAccess}</span>
          </div>
        </div>
      </div>

      {/* 🚀 Modal Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-start animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={`${bgMain} border-2 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
            <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`text-xl font-black ${textMain}`}>{t.modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <User className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 ${textMuted}`} size={18} />
                  <input required type="text" placeholder={t.name} value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className={`w-full py-4 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl border-2 outline-none focus:border-blue-500 font-bold ${bgInput}`} />
                </div>
                <div className="relative">
                  <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 ${textMuted}`} size={18} />
                  <input required type="email" placeholder={t.email} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full py-4 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl border-2 outline-none focus:border-blue-500 font-bold ${bgInput}`} />
                </div>
                {!formData.id && (
                  <div className="relative md:col-span-2">
                    <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 ${textMuted}`} size={18} />
                    <input required type="password" placeholder={t.password} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full py-4 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl border-2 outline-none focus:border-blue-500 font-bold ${bgInput}`} />
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-black mb-4 ${textMuted}`}>{t.permissions}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(defaultPermissions).map((key) => {
                    const isChecked = formData.permissions[key];
                    let theme = { bg: 'bg-orange-500/10', border: 'border-orange-500/30', check: 'bg-orange-500 border-orange-500', text: 'text-orange-500' };
                    if (key.includes('Market') || key.includes('Ventes') || key.includes('Factures')) theme = { bg: 'bg-blue-500/10', border: 'border-blue-500/30', check: 'bg-blue-500 border-blue-500', text: 'text-blue-500' };
                    else if (key.includes('Achats') || key.includes('Stock') || key.includes('Prod')) theme = { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', check: 'bg-emerald-500 border-emerald-500', text: 'text-emerald-500' };
                    else if (key.includes('RH')) theme = { bg: 'bg-pink-500/10', border: 'border-pink-500/30', check: 'bg-pink-500 border-pink-500', text: 'text-pink-500' };

                    return (
                      <label key={key} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? `${theme.bg}${theme.border}` : (isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300')}`}>
                        <input type="checkbox" checked={isChecked} onChange={() => handleTogglePermission(key)} className="hidden" />
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isChecked ? theme.check : (isDarkMode ? 'border-slate-600' : 'border-slate-400')}`}>
                          {isChecked && <Check size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm font-bold ${isChecked ? theme.text : textMuted}`}>{t[key]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className={`flex gap-3 pt-6 border-t shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-4 font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
                  {t.cancel}
                </button>
                <button type="submit" disabled={isSavingUser} className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  {isSavingUser ? <Loader2 size={20} className="animate-spin"/> : t.saveUser}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}