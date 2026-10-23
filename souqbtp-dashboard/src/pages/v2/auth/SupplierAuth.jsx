import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { Building2, Store, Factory, Phone, Mail, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const translations = {
  ar: {
    pageTitle: "إنشاء حساب جديد",
    pageSubtitle: "بوابة الدخول لمنظومة SasBTP الذكية.",
    retailBtn: "تاجر (محل)",
    wholesaleBtn: "مورد (شركة)",
    companyLabel: "اسم الشركة / المحل",
    phoneLabel: "رقم الهاتف (اختياري)",
    emailLabel: "البريد الإلكتروني",
    emailPlace: "name@company.com",
    passwordLabel: "كلمة المرور",
    passwordPlace: "••••••••",
    registerBtn: "إنشاء الحساب",
    haveAccount: "لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
    rights: "جميع الحقوق محفوظة © SasBTP 2026",
    errEmailExists: "هذا البريد الإلكتروني مسجل مسبقاً.",
    errUnexpected: "تأكد من صحة البيانات أو أن الحساب غير موجود مسبقاً.",
    successRegister: "✅ تم إنشاء الحساب بنجاح! جاري تحويلك..."
  },
  fr: {
    pageTitle: "Créer un nouveau compte",
    pageSubtitle: "Portail d'accès au système intelligent SasBTP.",
    retailBtn: "Détaillant (Boutique)",
    wholesaleBtn: "Fournisseur (Entreprise)",
    companyLabel: "Nom de l'Entreprise / Boutique",
    phoneLabel: "Téléphone (Optionnel)",
    emailLabel: "Email",
    emailPlace: "nom@entreprise.com",
    passwordLabel: "Mot de passe",
    passwordPlace: "••••••••",
    registerBtn: "Créer le compte",
    haveAccount: "Vous avez déjà un compte ?",
    loginLink: "Se connecter",
    rights: "Tous droits réservés © SasBTP 2026",
    errEmailExists: "Cet email est déjà enregistré.",
    errUnexpected: "Vérifiez vos données ou le compte existe déjà.",
    successRegister: "✅ Compte créé avec succès ! Redirection..."
  },
  en: {
    pageTitle: "Create New Account",
    pageSubtitle: "Access portal to the smart SasBTP system.",
    retailBtn: "Retailer (Shop)",
    wholesaleBtn: "Supplier (Company)",
    companyLabel: "Company / Shop Name",
    phoneLabel: "Phone Number (Optional)",
    emailLabel: "Email Address",
    emailPlace: "name@company.com",
    passwordLabel: "Password",
    passwordPlace: "••••••••",
    registerBtn: "Create Account",
    haveAccount: "Already have an account?",
    loginLink: "Login",
    rights: "All Rights Reserved © SasBTP 2026",
    errEmailExists: "This email is already registered.",
    errUnexpected: "Check your details or the account already exists.",
    successRegister: "✅ Account created successfully! Redirecting..."
  }
};

export default function SupplierAuth() {
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [supplierType, setSupplierType] = useState('retail'); // 'retail' | 'wholesale'
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    email: '',
    password: ''
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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.companyName,
            company_name: formData.companyName,
            supplier_type: supplierType,
            phone: formData.phone,
            role: 'admin' // رتبة المورد في النظام
          }
        }
      });

      if (error) throw error;
      if (data.user && data.user.identities.length === 0) {
        throw new Error(t.errEmailExists);
      }

      showAlert('success', t.successRegister);
      
      // التوجيه للوحة التحكم (الموجه الذكي سيعرف أنه مورد بفضل role: 'admin' أو type)
      setTimeout(() => navigate('/v2/store-manager'), 1500); 

    } catch (err) {
      showAlert('error', err.message || t.errUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  // إعدادات التصميم الديناميكي حسب نوع المورد
  const isWholesaler = supplierType === 'wholesale';
  const bgClass = isWholesaler 
    ? "from-slate-900 via-gray-800 to-black" 
    : "from-[#1e1b4b] via-[#2d2252] to-[#4338ca]";
  
  const blob1Class = isWholesaler ? "bg-gray-600" : "bg-blue-500";
  const blob2Class = isWholesaler ? "bg-slate-500" : "bg-purple-500";
  const btnGradient = isWholesaler ? "from-slate-800 to-black hover:from-black hover:to-slate-900" : "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700";

  return (
    <>
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>

      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${bgClass} relative overflow-hidden transition-colors duration-700 font-sans`} dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* الفقاعات المضيئة المتحركة */}
        <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob transition-colors duration-700 ${blob1Class}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000 transition-colors duration-700 ${blob2Class}`}></div>

        <div className="w-full max-w-md px-6 z-10 py-10">
          
          {/* الترويسة */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-6 ring-4 ring-white/5">
              {isWholesaler ? <Factory className="text-white w-10 h-10" /> : <Store className="text-white w-10 h-10" />}
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{t.pageTitle}</h1>
            <p className="text-gray-300 font-medium">{t.pageSubtitle}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8">
              
              {/* أزرار اختيار نوع المورد */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button 
                  type="button" 
                  onClick={() => setSupplierType('retail')} 
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${!isWholesaler ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Store className="w-4 h-4" /> {t.retailBtn}
                </button>
                <button 
                  type="button" 
                  onClick={() => setSupplierType('wholesale')} 
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${isWholesaler ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Factory className="w-4 h-4" /> {t.wholesaleBtn}
                </button>
              </div>

              {alert.show && (
                <div className={`p-4 rounded-xl mb-6 font-bold flex items-start gap-3 border text-sm ${alert.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                  <span>{alert.text}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block text-sm font-bold text-gray-700">{t.companyLabel}</label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className={`block w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
                  </div>
                </div>

                <div className="space-y-1.5 animate-fade-in">
                  <label className="block text-sm font-bold text-gray-700">{t.phoneLabel}</label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`block w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">{t.emailLabel}</label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`block w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} placeholder={t.emailPlace} dir="ltr" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">{t.passwordLabel}</label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className={`block w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium tracking-widest ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} placeholder={t.passwordPlace} dir="ltr" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={`w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black text-white bg-gradient-to-r ${btnGradient} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 mt-2 transition-colors duration-500 disabled:opacity-70 disabled:transform-none`}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {t.registerBtn}
                </button>
              </form>

              <div className="mt-6 text-center text-sm font-bold text-gray-600">
                <p>{t.haveAccount} <Link to="/v2/auth" className={`${isWholesaler ? 'text-slate-800' : 'text-blue-600'} hover:underline transition-colors duration-500`}>{t.loginLink}</Link></p>
              </div>

            </div>
            
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
              <p className="text-xs font-bold text-gray-400">{t.rights}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}