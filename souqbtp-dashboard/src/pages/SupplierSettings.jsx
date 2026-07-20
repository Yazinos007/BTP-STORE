import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  ShieldCheck, UploadCloud, FileText, CheckCircle2, 
  AlertTriangle, Lock, Award, Building2, CreditCard, Loader2, Star, Save, Camera
} from 'lucide-react';

const translations = {
  ar: {
    title: 'مركز الثقة والإعدادات',
    subtitle: 'أدر حسابك، وثق هويتك التجارية، واحصل على شارة SouqBTP لزيادة مبيعاتك.',
    verifiedBadge: 'مورد معتمد (SouqBTP Verified)',
    badgeDesc: 'الموردون المعتمدون يحصلون على 300% طلبات ومناقصات أكثر. الشارة تبني ثقة مطلقة مع التجار.',
    kycTitle: 'الوثائق القانونية (KYC)',
    kycDesc: 'يرجى رفع المستندات التالية لتوثيق حسابك وفتحه للتجار.',
    uploadRC: 'نسخة من السجل التجاري (RC)',
    uploadICE: 'شهادة التعريف الضريبي (ICE)',
    uploadCIN: 'البطاقة الوطنية للمسير (CIN)',
    btnUpload: 'اختر ملف (PDF/JPG)',
    statusUnverified: 'حساب غير موثق',
    statusPending: 'قيد المراجعة الإدارية',
    statusVerified: 'موثق ومعتمد',
    submitVerification: 'إرسال الملفات للمراجعة',
    saving: 'جاري الحفظ...',
    subscriptionTitle: 'الباقة الحالية',
    activePlan: 'الباقة النشطة',
    upgradeBtn: 'ترقية للباقة الذهبية (Enterprise)',
    storeInfo: 'بيانات الشركة الأساسية',
    companyName: 'اسم الشركة',
    phone: 'رقم الهاتف',
    address: 'العنوان',
    saveInfo: 'حفظ التعديلات',
    successVerify: '✅ تم إرسال ملفاتك بنجاح! فريق الإدارة سيقوم بمراجعتها قريباً.',
    successSave: '✅ تم تحديث بيانات الشركة بنجاح!',
    errorSave: 'حدث خطأ أثناء الحفظ.'
  },
  fr: {
    title: 'Centre de Confiance & Paramètres',
    subtitle: 'Gérez votre compte, certifiez votre entreprise et obtenez le badge SouqBTP.',
    verifiedBadge: 'Fournisseur Certifié (SouqBTP Verified)',
    badgeDesc: 'Les fournisseurs certifiés reçoivent 300% de commandes en plus. Le badge crée une confiance absolue.',
    kycTitle: 'Documents Légaux (KYC)',
    kycDesc: 'Veuillez télécharger ces documents pour vérifier votre compte.',
    uploadRC: 'Registre de Commerce (RC)',
    uploadICE: 'Certificat ICE',
    uploadCIN: 'CIN du Gérant',
    btnUpload: 'Choisir un fichier',
    statusUnverified: 'Compte Non Vérifié',
    statusPending: 'En Cours d\'Examen',
    statusVerified: 'Vérifié & Certifié',
    submitVerification: 'Soumettre pour vérification',
    saving: 'Enregistrement...',
    subscriptionTitle: 'Abonnement Actuel',
    activePlan: 'Plan Actif',
    upgradeBtn: 'Passer au plan Enterprise',
    storeInfo: 'Informations de l\'Entreprise',
    companyName: 'Nom de l\'entreprise',
    phone: 'Téléphone',
    address: 'Adresse',
    saveInfo: 'Enregistrer les infos',
    successVerify: '✅ Documents envoyés avec succès pour examen !',
    successSave: '✅ Informations enregistrées !',
    errorSave: 'Erreur lors de la sauvegarde.'
  },
  en: {
    title: 'Trust Center & Settings',
    subtitle: 'Manage your account, certify your business, and get the SouqBTP badge.',
    verifiedBadge: 'Certified Supplier (SouqBTP Verified)',
    badgeDesc: 'Certified suppliers receive 300% more orders. The badge creates absolute trust.',
    kycTitle: 'Legal Documents (KYC)',
    kycDesc: 'Please upload these documents to verify your account.',
    uploadRC: 'Commercial Register (RC)',
    uploadICE: 'Tax ID Certificate (ICE)',
    uploadCIN: 'Manager\'s ID (CIN)',
    btnUpload: 'Choose a file',
    statusUnverified: 'Unverified Account',
    statusPending: 'Under Review',
    statusVerified: 'Verified & Certified',
    submitVerification: 'Submit for verification',
    saving: 'Saving...',
    subscriptionTitle: 'Current Subscription',
    activePlan: 'Active Plan',
    upgradeBtn: 'Upgrade to Enterprise',
    storeInfo: 'Company Information',
    companyName: 'Company Name',
    phone: 'Phone',
    address: 'Address',
    saveInfo: 'Save Information',
    successVerify: '✅ Documents successfully sent for review!',
    successSave: '✅ Information successfully saved!',
    errorSave: 'Error while saving.'
  }
};

export default function SupplierSettings() {
  const { language } = useSettingsStore();
  const { supplier, updateProfile, uploadLogo, isLoading } = useSupplierStore();
  
  // 🛡️ الترياق السحري للترجمة
  const t = translations[language] || translations['fr'];
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState('unverified'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState({ rc: null, ice: null, cin: null });
  
  const [storeData, setStoreData] = useState({ store_name: '', phone: '', address: '' });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  useEffect(() => {
    if (supplier) {
      setStoreData({
        store_name: supplier.store_name || '',
        phone: supplier.phone || '',
        address: supplier.address || ''
      });
    }
  }, [supplier]);

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
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setVerificationStatus('pending');
      alert(t.successVerify);
    }, 2000);
  };

  const handleSaveStoreInfo = async () => {
    setIsSavingInfo(true);
    try {
      if (updateProfile) {
        await updateProfile(storeData);
        alert(t.successSave);
      }
    } catch (err) {
      console.error(err);
      alert(t.errorSave);
    } finally {
      setIsSavingInfo(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={32} />
            {t.title}
          </h2>
          <p className="text-slate-400 mt-2 font-medium">{t.subtitle}</p>
        </div>
        
        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border ${
          verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
          verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
          'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {verificationStatus === 'verified' && <CheckCircle2 size={16} />}
          {verificationStatus === 'pending' && <Loader2 size={16} className="animate-spin" />}
          {verificationStatus === 'unverified' && <AlertTriangle size={16} />}
          {verificationStatus === 'verified' ? t.statusVerified : verificationStatus === 'pending' ? t.statusPending : t.statusUnverified}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.1)]">
            <div className={`absolute ${language === 'ar' ? '-left-10' : '-right-10'} -top-10 text-amber-500/10 pointer-events-none`}>
              <Award size={250} />
            </div>
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                  {t.verifiedBadge} <Star size={18} className="fill-amber-400 text-amber-400" />
                </h3>
                <p className="text-slate-300 font-medium mt-1">{t.badgeDesc}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitVerification} className="mt-8 space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-center group hover:border-amber-500/50 transition-colors">
                  <FileText size={30} className="mx-auto mb-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <p className="text-sm font-bold text-white mb-3">{t.uploadRC}</p>
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-block w-full">
                    {files.rc ? <span className="text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 size={14}/> {files.rc.slice(0,10)}...</span> : t.btnUpload}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'rc')} disabled={verificationStatus !== 'unverified'} />
                  </label>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-center group hover:border-amber-500/50 transition-colors">
                  <Building2 size={30} className="mx-auto mb-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <p className="text-sm font-bold text-white mb-3">{t.uploadICE}</p>
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-block w-full">
                    {files.ice ? <span className="text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 size={14}/> {files.ice.slice(0,10)}...</span> : t.btnUpload}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'ice')} disabled={verificationStatus !== 'unverified'} />
                  </label>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-center group hover:border-amber-500/50 transition-colors">
                  <CreditCard size={30} className="mx-auto mb-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <p className="text-sm font-bold text-white mb-3">{t.uploadCIN}</p>
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-block w-full">
                    {files.cin ? <span className="text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 size={14}/> {files.cin.slice(0,10)}...</span> : t.btnUpload}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'cin')} disabled={verificationStatus !== 'unverified'} />
                  </label>
                </div>
              </div>

              {verificationStatus === 'unverified' && (
                <button type="submit" disabled={!files.rc || !files.ice || !files.cin || isSubmitting} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-amber-500 flex justify-center items-center gap-2 shadow-lg shadow-amber-500/20">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><UploadCloud size={20} /> {t.submitVerification}</>}
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star size={20} className="text-blue-500" /> {t.subscriptionTitle}
            </h4>
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-4">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">{t.activePlan}</p>
              <h5 className="text-2xl font-black text-white">Starter B2B</h5>
            </div>
            
            <button 
              type="button"
              onClick={() => navigate('/subscription')} 
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 flex justify-center items-center gap-2 relative z-20 cursor-pointer"
            >
              <Lock size={16} /> {t.upgradeBtn}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-blue-500" /> {t.storeInfo}
            </h4>
            <div className="space-y-4">
              
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-900 flex items-center justify-center shadow-xl">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : supplier?.logo_url ? (
                      <img src={supplier.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-slate-500">{supplier?.store_name?.charAt(0) || 'S'}</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full cursor-pointer transition-colors shadow-lg border-2 border-slate-800">
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.companyName}</label>
                <input type="text" value={storeData.store_name} onChange={e => setStoreData({...storeData, store_name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.phone}</label>
                <input type="text" value={storeData.phone} onChange={e => setStoreData({...storeData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.address}</label>
                <input type="text" value={storeData.address} onChange={e => setStoreData({...storeData, address: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 font-medium" />
              </div>
              
              <button onClick={handleSaveStoreInfo} disabled={isSavingInfo} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2 flex justify-center items-center gap-2 disabled:opacity-70">
                {isSavingInfo ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {isSavingInfo ? t.saving : t.saveInfo}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}