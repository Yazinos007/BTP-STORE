import { useState } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { Store, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Globe, Factory, Phone, User } from 'lucide-react';

const translations = {
  ar: {
    welcomeLogin: 'مرحباً بك مجدداً', 
    welcomeRegister: 'إنشاء حساب جديد',
    subtitle: 'بوابة الدخول لمنظومة SouqBTP الذكية.',
    retailer: 'تاجر (محل)', 
    wholesaler: 'مورد (شركة)',
    storeName: 'اسم الشركة / المحل',
    phone: 'رقم الهاتف (اختياري)',
    email: 'البريد الإلكتروني', emailPH: 'name@company.com',
    password: 'كلمة المرور', passwordPH: '••••••••',
    loginBtn: 'تسجيل الدخول', 
    registerBtn: 'إنشاء الحساب',
    loggingIn: 'جاري المعالجة...',
    noAccount: 'ليس لديك حساب؟', registerLink: 'سجل الآن',
    hasAccount: 'لديك حساب بالفعل؟', loginLink: 'تسجيل الدخول',
    errorMsg: 'تأكد من صحة البيانات المدخلة.',
    regSuccess: '✅ تم إنشاء الحساب بنجاح! جاري الدخول...',
    rights: 'جميع الحقوق محفوظة © SouqBTP 2026'
  },
  fr: {
    welcomeLogin: 'Bienvenue', 
    welcomeRegister: 'Créer un compte',
    subtitle: 'Portail d\'accès à l\'écosystème SouqBTP.',
    retailer: 'Détaillant', 
    wholesaler: 'Grossiste',
    storeName: 'Nom de l\'entreprise / Magasin',
    phone: 'Numéro de téléphone (Optionnel)',
    email: 'Adresse Email', emailPH: 'nom@entreprise.com',
    password: 'Mot de passe', passwordPH: '••••••••',
    loginBtn: 'Se connecter', 
    registerBtn: 'Créer le compte',
    loggingIn: 'Traitement en cours...',
    noAccount: 'Vous n\'avez pas de compte ?', registerLink: 'Inscrivez-vous',
    hasAccount: 'Vous avez déjà un compte ?', loginLink: 'Connectez-vous',
    errorMsg: 'Veuillez vérifier vos informations.',
    regSuccess: '✅ Compte créé avec succès ! Connexion...',
    rights: 'Tous droits réservés © SouqBTP 2026'
  },
  en: {
    welcomeLogin: 'Welcome Back', 
    welcomeRegister: 'Create New Account',
    subtitle: 'Access portal to the smart SouqBTP ecosystem.',
    retailer: 'Retailer (Store)', 
    wholesaler: 'Wholesaler (Company)',
    storeName: 'Company / Store Name',
    phone: 'Phone Number (Optional)',
    email: 'Email Address', emailPH: 'name@company.com',
    password: 'Password', passwordPH: '••••••••',
    loginBtn: 'Login', 
    registerBtn: 'Create Account',
    loggingIn: 'Processing...',
    noAccount: "Don't have an account?", registerLink: 'Register Now',
    hasAccount: 'Already have an account?', loginLink: 'Login',
    errorMsg: 'Please check the entered data.',
    regSuccess: '✅ Account created successfully! Logging in...',
    rights: 'All rights reserved © SouqBTP 2026'
  }
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('retailer'); 
  
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { language, toggleLanguage } = useSettingsStore();
  const t = translations[language] || translations['fr'];

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        
      } else {
        // 1. التسجيل الأساسي (فقط إيميل وباسورد لكي يعمل التريجر في هدوء ويجهز المحفظة)
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email: email, 
          password: password 
        });
        
        if (signUpError) throw signUpError;

        if (data?.user) {
          // 🚀 2. الضربة القاضية: استدعاء الدالة العليا وإرسال *كل* التفاصيل لتحديث الهيكل الفارغ
          const { error: rpcError } = await supabase.rpc('complete_user_profile', {
            p_user_id: data.user.id,
            p_store_name: storeName,
            p_phone: phone || null,
            p_role: role,
            p_tier: role === 'wholesaler' ? 'enterprise' : 'starter',
            p_supplier_type: role === 'wholesaler' ? 'wholesale' : 'retail'
          });

          if (rpcError) {
             console.error("فشل تحديث البيانات عبر RPC:", rpcError);
          }

          alert(t.regSuccess);
        }
      }
    } catch (err) {
      console.error(err);
      setError(t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isWholesaler = role === 'wholesaler';
  const themeGradients = isWholesaler 
    ? "from-slate-900 via-gray-800 to-black" 
    : "from-[#1e1b4b] via-[#2d2252] to-[#4338ca]";
  const btnGradient = isWholesaler
    ? "from-slate-800 to-black hover:from-black hover:to-slate-900 ring-slate-800"
    : "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ring-blue-500";

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${themeGradients} relative overflow-hidden transition-colors duration-700`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${isWholesaler ? 'bg-gray-600' : 'bg-blue-500'} rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob transition-colors`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 ${isWholesaler ? 'bg-slate-500' : 'bg-purple-500'} rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000 transition-colors`}></div>

      <button onClick={toggleLanguage} className="absolute top-6 right-6 lg:right-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all text-sm font-bold shadow-lg z-20">
        <Globe size={16} /> {language === 'fr' ? 'العربية' : language === 'ar' ? 'English' : 'Français'}
      </button>

      <div className="w-full max-w-md px-6 z-10 py-10">
        
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-6 ring-4 ring-white/5">
            {isWholesaler ? <Factory size={40} className="text-white" /> : <Store size={40} className="text-white" />}
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isLogin ? t.welcomeLogin : t.welcomeRegister}
          </h1>
          <p className="text-gray-300 font-medium">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-8">
            
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole('retailer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${!isWholesaler ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Store size={16} /> {t.retailer}
              </button>
              <button
                type="button"
                onClick={() => setRole('wholesaler')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${isWholesaler ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Factory size={16} /> {t.wholesaler}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              
              {!isLogin && (
                <>
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700">{t.storeName}</label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors ${language === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                        <User size={18} />
                      </div>
                      <input type="text" required value={storeName} onChange={(e) => setStoreName(e.target.value)} className={`block w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
                    </div>
                  </div>
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700">{t.phone}</label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors ${language === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                        <Phone size={18} />
                      </div>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={`block w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">{t.email}</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors ${language === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                    <Mail size={18} />
                  </div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`block w-full py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} placeholder={t.emailPH} dir="ltr" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">{t.password}</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors ${language === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'}`}>
                    <Lock size={18} />
                  </div>
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className={`block w-full py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium ${language === 'ar' ? 'pr-11 pl-12' : 'pl-11 pr-12'}`} placeholder={t.passwordPH} dir="ltr" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600 transition-colors outline-none ${language === 'ar' ? 'left-0 pl-4' : 'right-0 pr-4'}`}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black text-white bg-gradient-to-r ${btnGradient} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 mt-2`}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> {t.loggingIn}</> : <>{isLogin ? t.loginBtn : t.registerBtn} <ArrowRight size={18} className={language === 'ar' ? 'rotate-180' : ''} /></>}
              </button>
            </form>

            <div className="mt-6 text-center text-sm font-bold text-gray-600">
              {isLogin ? (
                <p>{t.noAccount} <button onClick={() => setIsLogin(false)} className={`hover:underline ${isWholesaler ? 'text-slate-800' : 'text-blue-600'}`}>{t.registerLink}</button></p>
              ) : (
                <p>{t.hasAccount} <button onClick={() => setIsLogin(true)} className={`hover:underline ${isWholesaler ? 'text-slate-800' : 'text-blue-600'}`}>{t.loginLink}</button></p>
              )}
            </div>

          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400">{t.rights}</p>
          </div>
        </div>
      </div>
    </div>
  );
}