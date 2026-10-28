import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { bindReferralOnSignup } from '../../../lib/referralHandler';
import useSettingsStore from '../../../store/useSettingsStore';
import { Mail, Lock, User, Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const translations = {
  ar: {
    roleClientTitle: "مقاول / صاحب مشروع (شركة, مقاولة)",
    roleProviderTitle: "معلم / حرفي",
    roleArchitectTitle: "مهندس معماري",
    roleSupplierTitle: "مورد مواد بناء",
    msgProvider: "بصفتك معلماً، نحتاج لبعض التفاصيل الإضافية لإنشاء ملفك المهني وعرضك للعملاء.",
    btnProvider: "👷‍♂️ الانتقال لصفحة تسجيل المعلمين",
    msgArchitect: "بصفتك مهندساً، يتطلب حسابك إدخال 'رقم الهيئة' و'مكتب الدراسات' لتفعيل ميزات الرقابة الهندسية.",
    btnArchitect: "📐 الانتقال لصفحة تسجيل المهندسين",
    msgSupplier: "بصفتك مورداً لمواد البناء، يتطلب حسابك إدخال 'اسم المحل/الشركة' ليتم عرض منتجاتك للمقاولين.",
    btnSupplier: "🧱 الانتقال لصفحة تسجيل الموردين",
    portalSubtitle: "سجل دخولك لمراسلة المعلمين ومتابعة مشاريعك",
    tabRegister: "إنشاء حساب",
    tabLogin: "تسجيل الدخول",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    loginBtn: "دخول",
    forgotPassword: "نسيت كلمة المرور؟",
    iAmHereAs: "أنا هنا بصفتي:",
    fullNameLabel: "الاسم الكامل",
    phoneLabel: "رقم الهاتف (للتواصل مع الحرفيين)",
    phonePlaceholder: "مثال: 0612345678",
    registerBtn: "إنشاء حسابي الآن",
    errInvalidLogin: "البيانات غير صحيحة.",
    successLogin: "✅ تم تسجيل الدخول بنجاح! جاري التوجيه...",
    errEmailExists: "هذا البريد الإلكتروني مسجل مسبقاً.",
    successRegister: "✅ تم إنشاء الحساب بنجاح! مرحباً بك.",
    errUnexpected: "حدث خطأ أثناء التسجيل."
  },
  fr: {
    roleClientTitle: "Entrepreneur / Maître d'ouvrage",
    roleProviderTitle: "Artisan / Maître",
    roleArchitectTitle: "Architecte",
    roleSupplierTitle: "Fournisseur Matériaux",
    msgProvider: "En tant qu'artisan, nous avons besoin de détails pour créer votre profil professionnel.",
    btnProvider: "👷‍♂️ Aller à l'inscription Artisan",
    msgArchitect: "En tant qu'architecte, votre numéro d'ordre est requis pour activer les fonctionnalités.",
    btnArchitect: "📐 Aller à l'inscription Architecte",
    msgSupplier: "En tant que fournisseur, le nom de votre entreprise est requis pour afficher vos produits.",
    btnSupplier: "🧱 Aller à l'inscription Fournisseur",
    portalSubtitle: "Connectez-vous pour contacter les artisans et suivre vos projets",
    tabRegister: "Créer un compte",
    tabLogin: "Se connecter",
    emailLabel: "Email",
    passwordLabel: "Mot de passe",
    loginBtn: "Connexion",
    forgotPassword: "Mot de passe oublié ?",
    iAmHereAs: "Je suis ici en tant que :",
    fullNameLabel: "Nom Complet",
    phoneLabel: "Téléphone (pour contacter les artisans)",
    phonePlaceholder: "Ex : 0612345678",
    registerBtn: "Créer mon compte maintenant",
    errInvalidLogin: "Email ou mot de passe incorrect.",
    successLogin: "✅ Connexion réussie ! Redirection...",
    errEmailExists: "Cet email est déjà enregistré.",
    successRegister: "✅ Compte créé avec succès ! Bienvenue.",
    errUnexpected: "Une erreur est survenue lors de l'inscription."
  },
  en: {
    roleClientTitle: "Contractor / Project Owner",
    roleProviderTitle: "Artisan / Craftsman",
    roleArchitectTitle: "Architect",
    roleSupplierTitle: "Materials Supplier",
    msgProvider: "As an artisan, we need additional details to create your professional profile.",
    btnProvider: "👷‍♂️ Go to Artisan Registration",
    msgArchitect: "As an architect, your registration number is required to activate engineering features.",
    btnArchitect: "📐 Go to Architect Registration",
    msgSupplier: "As a supplier, your company name is required to showcase your products.",
    btnSupplier: "🧱 Go to Supplier Registration",
    portalSubtitle: "Login to contact artisans and track your projects",
    tabRegister: "Create Account",
    tabLogin: "Login",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginBtn: "Login",
    forgotPassword: "Forgot Password?",
    iAmHereAs: "I am here as:",
    fullNameLabel: "Full Name",
    phoneLabel: "Phone Number (to contact artisans)",
    phonePlaceholder: "E.g., 0612345678",
    registerBtn: "Create My Account Now",
    errInvalidLogin: "Invalid credentials.",
    successLogin: "✅ Login successful! Redirecting...",
    errEmailExists: "This email is already registered.",
    successRegister: "✅ Account created successfully! Welcome.",
    errUnexpected: "An error occurred during registration."
  }
};

export default function AuthGateway() {
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [activeTab, setActiveTab] = useState(() => 
  window.location.search.includes('ref=') ? 'register' : 'login'
);
  const [selectedRole, setSelectedRole] = useState('client'); // 'client' | 'provider' | 'architect' | 'supplier'
  
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 6000);
  };

  // ==========================================
  // 1. معالجة تسجيل الدخول (موحد للجميع)
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw new Error(t.errInvalidLogin);

      const user = data?.user;
      const metaRole = user?.user_metadata?.role || user?.user_metadata?.account_type;
      const metaSupplierType = user?.user_metadata?.supplier_type;

      // فحص ما إذا كان الحساب لمورد أو تاجر في قاعدة البيانات
      const { data: supData } = await supabase
        .from('suppliers')
        .select('supplier_type')
        .eq('user_id', user.id)
        .maybeSingle();

      showAlert('success', t.successLogin);

      setTimeout(() => {
        if (metaRole === 'admin') {
          navigate('/v2/admin-dashboard');
        } else if (supData || metaRole === 'supplier') {
          const type = supData?.supplier_type || metaSupplierType || 'retail';
          window.location.href = type === 'wholesale' ? '/?preview=wholesale' : '/?preview=retail';
        } else if (metaRole === 'architect') {
          navigate('/v2/architect-dashboard');
        } else if (metaRole === 'provider') {
          navigate('/v2/provider-dashboard');
        } else {
          navigate('/v2/contractor-dashboard');
        }
      }, 1000);

    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2. معالجة التسجيل المباشر (خاص بالمقاول/العميل فقط)
  // ==========================================
  const handleClientRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            full_name: formData.fullName, 
            phone: formData.phone,
            role: 'contractor' 
          }
        }
      });

      if (error) throw error;
      if (data.user && data.user.identities.length === 0) {
        throw new Error(t.errEmailExists);
      }

      // 🔥 هذا هو سطر ربط الإحالة الذي تمت إضافته 🔥
      if (data?.user?.id) {
        await bindReferralOnSignup(data.user.id);
      }

      showAlert('success', t.successRegister);
      setTimeout(() => navigate('/v2/contractor-dashboard'), 2000);

    } catch (err) {
      showAlert('error', err.message || t.errUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  // إعدادات ألوان ونصوص بطاقات الرتب
  const roleConfigs = {
    client: { 
      id: 'client', title: t.roleClientTitle, 
      color: 'blue', border: 'border-blue-200', bg: 'bg-blue-50/50', activeBorder: 'border-blue-500', activeBg: 'bg-blue-50', textColor: 'text-blue-900', ring: 'ring-blue-500'
    },
    provider: { 
      id: 'provider', title: t.roleProviderTitle, 
      color: 'orange', border: 'border-orange-200', bg: 'bg-orange-50/50', activeBorder: 'border-orange-500', activeBg: 'bg-orange-50', textColor: 'text-orange-700', ring: 'ring-orange-500',
      msg: t.msgProvider, btnText: t.btnProvider, btnColor: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30', route: '/v2/provider-auth'
    },
    architect: { 
      id: 'architect', title: t.roleArchitectTitle, 
      color: 'purple', border: 'border-purple-200', bg: 'bg-purple-50/50', activeBorder: 'border-purple-500', activeBg: 'bg-purple-50', textColor: 'text-purple-700', ring: 'ring-purple-500',
      msg: t.msgArchitect, btnText: t.btnArchitect, btnColor: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30', route: '/v2/architect-register'
    },
    supplier: { 
      id: 'supplier', title: t.roleSupplierTitle, 
      color: 'emerald', border: 'border-emerald-200', bg: 'bg-emerald-50/50', activeBorder: 'border-emerald-500', activeBg: 'bg-emerald-50', textColor: 'text-emerald-700', ring: 'ring-emerald-500',
      msg: t.msgSupplier, btnText: t.btnSupplier, btnColor: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30', route: '/v2/supplier-register'
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-800 z-0"></div>
      
      <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden border border-white/20 relative z-10 my-8">
        
        <div className="p-8 pb-4 text-center">
          <h1 className="text-3xl font-black text-blue-900 mb-2 flex items-center justify-center gap-2">
            SasBTP <span className="text-2xl">🏗️</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">{t.portalSubtitle}</p>
        </div>

        <div className="px-8 pb-6 flex gap-4">
          <button 
            onClick={() => { setActiveTab('register'); setAlert({ show: false, type: '', text: '' }); }}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${activeTab === 'register' ? 'bg-blue-900 text-white border-blue-900 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {t.tabRegister}
          </button>
          <button 
            onClick={() => { setActiveTab('login'); setAlert({ show: false, type: '', text: '' }); }}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${activeTab === 'login' ? 'bg-blue-900 text-white border-blue-900 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {t.tabLogin}
          </button>
        </div>

        {alert.show && (
          <div className="px-8 pb-4">
            <div className={`p-4 rounded-xl font-bold flex items-start gap-3 border text-sm ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <span>{alert.text}</span>
            </div>
          </div>
        )}

        {activeTab === 'login' && (
          <div className="p-8 pt-0 animate-fade-in">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.emailLabel}</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium" 
                  dir="ltr" placeholder="example@email.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.passwordLabel}</label>
                <input 
                  type="password" name="password" required value={formData.password} onChange={handleChange} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium tracking-widest" 
                  dir="ltr" placeholder="••••••••" 
                />
              </div>
              
              <button 
                type="submit" disabled={isLoading} 
                className="w-full py-4 mt-4 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-black text-base shadow-[0_5px_15px_rgba(30,58,138,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                {t.loginBtn}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <button className="text-amber-600 hover:text-amber-700 font-bold text-sm hover:underline">
                {t.forgotPassword}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="p-8 pt-0 animate-fade-in">
            
            <div className="bg-slate-50 border border-blue-200 border-dashed rounded-xl p-5 mb-8">
              <label className="block text-blue-900 font-black text-center mb-4">{t.iAmHereAs}</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(roleConfigs).map(role => (
                  <label 
                    key={role.id}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 text-center ${selectedRole === role.id ? `${role.activeBorder} ${role.activeBg} shadow-sm ring-1${role.ring}` : `${role.border}${role.bg} hover:bg-white`}`}
                  >
                    <input 
                      type="radio" name="role_type" value={role.id} 
                      checked={selectedRole === role.id} 
                      onChange={() => { setSelectedRole(role.id); setAlert({ show: false, type: '', text: '' }); }}
                      className="mb-2"
                    />
                    <span className={`font-bold text-[0.8rem] leading-tight ${selectedRole === role.id ? role.textColor : 'text-slate-600'}`}>
                      {role.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="transition-all duration-300">
              {selectedRole === 'client' ? (
                <form onSubmit={handleClientRegister} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.fullNameLabel}</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.phoneLabel}</label>
                    <input type="tel" name="phone" required placeholder={t.phonePlaceholder} value={formData.phone} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.emailLabel}</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.passwordLabel}</label>
                    <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm" dir="ltr" />
                  </div>
                  
                  <button type="submit" disabled={isLoading} className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-base shadow-[0_5px_15px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '📝 '}
                    {t.registerBtn}
                  </button>
                </form>
              ) : (
                <div className="text-center animate-fade-in py-4">
                  <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6 px-4">
                    {roleConfigs[selectedRole].msg}
                  </p>
                  <button 
                    onClick={() => navigate(roleConfigs[selectedRole].route)}
                    className={`w-full py-4 text-white rounded-xl font-black text-sm transition-transform hover:-translate-y-1 flex justify-center items-center shadow-lg ${roleConfigs[selectedRole].btnColor}`}
                  >
                    {roleConfigs[selectedRole].btnText}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}