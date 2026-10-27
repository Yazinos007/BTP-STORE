import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { Store, Factory, Mail, Lock, Phone, Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { bindReferralOnSignup } from '../../../lib/referralHandler';

const translations = {
  ar: {
    portalSubtitle: "بوابة الدخول لمنظومة SasBTP الذكية.",
    tabRegister: "إنشاء حساب جديد",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    companyLabel: "اسم الشركة / المحل *",
    phoneLabel: "رقم الهاتف (اختياري)",
    registerBtn: "إنشاء الحساب والانطلاق",
    retailBtn: "تاجر (محل)",
    wholesaleBtn: "مورد (شركة)",
    haveAccount: "لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
    errEmailExists: "هذا البريد الإلكتروني مسجل مسبقاً.",
    errUnexpected: "حدث خطأ أثناء إنشاء الحساب.",
    successRegister: "✅ تم إنشاء الحساب بنجاح! جاري فتح لوحة القيادة..."
  },
  fr: {
    portalSubtitle: "Portail d'accès au système intelligent SasBTP.",
    tabRegister: "Créer un nouveau compte",
    emailLabel: "Email",
    passwordLabel: "Mot de passe",
    companyLabel: "Nom de l'Entreprise / Boutique *",
    phoneLabel: "Téléphone (Optionnel)",
    registerBtn: "Créer le compte",
    retailBtn: "Détaillant (Boutique)",
    wholesaleBtn: "Fournisseur (Entreprise)",
    haveAccount: "Vous avez déjà un compte ?",
    loginLink: "Se connecter",
    errEmailExists: "Cet email est déjà enregistré.",
    errUnexpected: "Une erreur est survenue lors de l'inscription.",
    successRegister: "✅ Compte créé avec succès ! Ouverture du tableau de bord..."
  },
  en: {
    portalSubtitle: "Access portal to the intelligent SasBTP system.",
    tabRegister: "Create New Account",
    emailLabel: "Email",
    passwordLabel: "Password",
    companyLabel: "Company / Store Name *",
    phoneLabel: "Phone (Optional)",
    registerBtn: "Create Account",
    retailBtn: "Retailer (Store)",
    wholesaleBtn: "Wholesaler (Company)",
    haveAccount: "Already have an account?",
    loginLink: "Login",
    errEmailExists: "This email is already registered.",
    errUnexpected: "An error occurred during registration.",
    successRegister: "✅ Account created successfully! Opening dashboard..."
  }
};

export default function SupplierAuth() {
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.fr;

  const [supplierType, setSupplierType] = useState('retail'); // 'retail' | 'wholesale'
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: '',
    phone: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 6000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: { 
            full_name: formData.company.trim(), 
            company_name: formData.company.trim(),
            phone: formData.phone.trim(),
            supplier_type: supplierType,
            role: 'supplier'
          }
        }
      });

      if (authError) throw authError;
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        throw new Error(t.errEmailExists);
      }

      // حفظ بيانات المورد/التاجر في جدول suppliers
      await supabase.from('suppliers').insert([{
        user_id: authData.user.id,
        store_name: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        supplier_type: supplierType
      }]);

      // ربط كود الإحالة إن وجد
      if (authData?.user?.id) {
        await bindReferralOnSignup(authData.user.id);
      }

      showAlert('success', t.successRegister);

      // 🚀 توجيه مباشر إلى واجهة التاجر أو المورد داخل React بدون أي استضافة قديمة
      sessionStorage.setItem('souqbtp_preview_mode', supplierType);
      setTimeout(() => {
        window.location.href = supplierType === 'wholesale' ? '/?preview=wholesale' : '/?preview=retail';
      }, 1200);

    } catch (err) {
      showAlert('error', err.message || t.errUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  const isWholesaler = supplierType === 'wholesale';
  const bgColor = isWholesaler ? 'from-slate-900 via-gray-800 to-black' : 'from-[#1e1b4b] via-[#2d2252] to-[#4338ca]';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${bgColor} relative overflow-hidden transition-colors duration-700 font-sans p-4`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md z-10 py-6 animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-6 ring-4 ring-white/5">
            {isWholesaler ? <Factory className="text-white w-10 h-10" /> : <Store className="text-white w-10 h-10" />}
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{t.tabRegister}</h1>
          <p className="text-gray-300 font-medium text-sm">{t.portalSubtitle}</p>
        </div>

        <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            
            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
              <button 
                type="button" 
                onClick={() => setSupplierType('retail')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${!isWholesaler ? 'bg-white text-blue-600 shadow-sm border border-blue-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Store size={16} /> {t.retailBtn}
              </button>
              <button 
                type="button" 
                onClick={() => setSupplierType('wholesale')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${isWholesaler ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Factory size={16} /> {t.wholesaleBtn}
              </button>
            </div>

            {alert.show && (
              <div className={`p-4 rounded-xl mb-6 font-bold flex items-start gap-3 border text-sm ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <span>{alert.text}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.companyLabel}</label>
                <div className="relative">
                  <Building2 className={`w-5 h-5 absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="text" name="company" required value={formData.company} onChange={handleChange} className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-medium text-sm ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.phoneLabel}</label>
                <div className="relative">
                  <Phone className={`w-5 h-5 absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-medium text-sm ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className={`w-5 h-5 absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-medium text-sm ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" placeholder="name@company.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 font-medium text-sm tracking-widest ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" placeholder="••••••••" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className={`w-full mt-2 py-4 px-4 rounded-xl text-sm font-black text-white transition-all flex justify-center items-center gap-2 cursor-pointer ${isWholesaler ? 'bg-gradient-to-r from-slate-800 to-black hover:from-black hover:to-slate-900 shadow-lg' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'}`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.registerBtn}
              </button>
            </form>

            {/* 🔗 توجيه لبوابة الدخول الموحدة في React بدلاً من auth.html القديم */}
            <div className="mt-6 text-center text-sm font-bold text-gray-600">
              <p>
                {t.haveAccount}{' '}
                <Link to="/v2/auth" className={`transition-colors hover:underline ${isWholesaler ? 'text-slate-800' : 'text-blue-600'}`}>
                  {t.loginLink}
                </Link>
              </p>
            </div>

          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400">Tous droits réservés © SasBTP 2026</p>
          </div>
        </div>

      </div>
    </div>
  );
}