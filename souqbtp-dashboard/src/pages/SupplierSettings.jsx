import { useState } from 'react';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  ShieldCheck, UploadCloud, FileText, CheckCircle2, 
  AlertTriangle, Lock, Award, Building2, CreditCard, Loader2, Star 
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
    saving: 'جاري الإرسال...',
    subscriptionTitle: 'الباقة الحالية',
    upgradeBtn: 'ترقية للباقة الذهبية (Enterprise)',
    storeInfo: 'بيانات الشركة الأساسية',
    saveInfo: 'حفظ التعديلات'
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
    saving: 'Envoi en cours...',
    subscriptionTitle: 'Abonnement Actuel',
    upgradeBtn: 'Passer au plan Enterprise',
    storeInfo: 'Informations de l\'Entreprise',
    saveInfo: 'Enregistrer les infos'
  }
};

export default function SupplierSettings() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language];

  // حالات الصفحة
  const [verificationStatus, setVerificationStatus] = useState('unverified'); // 'unverified', 'pending', 'verified'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState({ rc: null, ice: null, cin: null });

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [type]: file.name }));
  };

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setVerificationStatus('pending');
      alert(language === 'fr' ? '✅ Documents envoyés avec succès pour examen !' : '✅ تم إرسال ملفاتك بنجاح! فريق الإدارة سيقوم بمراجعتها قريباً.');
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 👑 الهيدر */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={32} />
            {t.title}
          </h2>
          <p className="text-slate-400 mt-2 font-medium">{t.subtitle}</p>
        </div>
        
        {/* شارة التوثيق العلوية */}
        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border ${
          verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
          verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
          'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {verificationStatus === 'verified' && <CheckCircle2 size={16} />}
          {verificationStatus === 'pending' && <Loader2 size={16} className="animate-spin" />}
          {verificationStatus === 'unverified' && <AlertTriangle size={16} />}
          
          {verificationStatus === 'verified' ? t.statusVerified : 
           verificationStatus === 'pending' ? t.statusPending : 
           t.statusUnverified}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🌟 العمود الأيمن: التوثيق (KYC) و الباقة */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* كرت التوثيق الذهبي */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.1)]">
            <div className="absolute -right-10 -top-10 text-amber-500/10 pointer-events-none">
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
                
                {/* رفع السجل التجاري */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-center group hover:border-amber-500/50 transition-colors">
                  <FileText size={30} className="mx-auto mb-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <p className="text-sm font-bold text-white mb-3">{t.uploadRC}</p>
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-block w-full">
                    {files.rc ? <span className="text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 size={14}/> {files.rc.slice(0,10)}...</span> : t.btnUpload}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'rc')} disabled={verificationStatus !== 'unverified'} />
                  </label>
                </div>

                {/* رفع ICE */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-center group hover:border-amber-500/50 transition-colors">
                  <Building2 size={30} className="mx-auto mb-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <p className="text-sm font-bold text-white mb-3">{t.uploadICE}</p>
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-block w-full">
                    {files.ice ? <span className="text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 size={14}/> {files.ice.slice(0,10)}...</span> : t.btnUpload}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'ice')} disabled={verificationStatus !== 'unverified'} />
                  </label>
                </div>

                {/* رفع CIN */}
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
                <button 
                  type="submit" 
                  disabled={!files.rc || !files.ice || !files.cin || isSubmitting}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-amber-500 flex justify-center items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><UploadCloud size={20} /> {t.submitVerification}</>}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* 🏢 العمود الأيسر: بيانات الشركة والباقة */}
        <div className="space-y-8">
          
          {/* كرت الباقة */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star size={20} className="text-blue-500" /> {t.subscriptionTitle}
            </h4>
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-4">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Plan Actif</p>
              <h5 className="text-2xl font-black text-white">Starter B2B</h5>
            </div>
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 flex justify-center items-center gap-2">
              <Lock size={16} /> {t.upgradeBtn}
            </button>
          </div>

          {/* بيانات الشركة */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-blue-500" /> {t.storeInfo}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nom de l'entreprise</label>
                <input type="text" defaultValue={supplier?.store_name} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Téléphone</label>
                <input type="text" defaultValue={supplier?.phone} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Adresse</label>
                <input type="text" defaultValue={supplier?.address} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 font-medium" />
              </div>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2">
                {t.saveInfo}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}