import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { Store, Factory, Mail, Lock, Phone, Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { bindReferralOnSignup } from '../../../lib/referralHandler'; // 👈 استيراد نظام الإحالة

const translations = {
  ar: {
    portalSubtitle: "بوابة الدخول لمنظومة SasBTP الذكية.",
    tabRegister: "إنشاء حساب جديد",
    tabLogin: "تسجيل الدخول",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    companyLabel: "اسم الشركة / المحل *",
    phoneLabel: "رقم الهاتف (اختياري)",
    registerBtn: "إنشاء حسابي الآن",
    retailBtn: "تاجر (محل)",
    wholesaleBtn: "مورد (شركة)",
    
    errEmailExists: "هذا البريد الإلكتروني مسجل مسبقاً.",
    errUnexpected: "حدث خطأ غير متوقع.",
    errInvalidLogin: "البيانات غير صحيحة.",
    errNotSupplier: "هذا الحساب ليس مسجلاً كمورد.",
    successRegister: "✅ تم إنشاء الحساب بنجاح! جاري تحويلك...",
    successLogin: "✅ تم تسجيل الدخول بنجاح! جاري تحويلك..."
  },
  fr: {
    portalSubtitle: "Portail d'accès au système intelligent SasBTP.",
    tabRegister: "Créer un nouveau compte",
    tabLogin: "Se connecter",
    emailLabel: "Email",
    passwordLabel: "Mot de passe",
    loginBtn: "Connexion",
    companyLabel: "Nom de l'Entreprise / Boutique *",
    phoneLabel: "Téléphone (Optionnel)",
    registerBtn: "Créer le compte",
    retailBtn: "Détaillant (Boutique)",
    wholesaleBtn: "Fournisseur (Entreprise)",
    
    errEmailExists: "Cet email est déjà enregistré.",
    errUnexpected: "Une erreur est survenue.",
    errInvalidLogin: "Identifiants incorrects.",
    errNotSupplier: "Ce compte n'est pas un compte fournisseur.",
    successRegister: "✅ Compte créé avec succès ! Redirection...",
    successLogin: "✅ Connexion réussie ! Redirection..."
  },
  en: {
    portalSubtitle: "Access portal to the intelligent SasBTP system.",
    tabRegister: "Create New Account",
    tabLogin: "Login",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    loginBtn: "Login",
    companyLabel: "Company / Store Name *",
    phoneLabel: "Phone Number (Optional)",
    registerBtn: "Create Account Now",
    retailBtn: "Retailer (Store)",
    wholesaleBtn: "Wholesaler (Company)",
    
    errEmailExists: "This email is already registered.",
    errUnexpected: "An unexpected error occurred.",
    errInvalidLogin: "Invalid credentials.",
    errNotSupplier: "This account is not registered as a supplier.",
    successRegister: "✅ Account created successfully! Redirecting...",
    successLogin: "✅ Login successful! Redirecting..."
  }
};

export default function SupplierAuth() {
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.fr;

  const [isLogin, setIsLogin] = useState(false);
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
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            full_name: formData.company, 
            company_name: formData.company,
            phone: formData.phone,
            supplier_type: supplierType,
            role: 'supplier' // أو 'admin' إذا كنت تفضل ذلك للموردين
          }
        }
      });

      if (authError) throw authError;
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        throw new Error(t.errEmailExists);
      }

      // إدراج بيانات المورد في جدول suppliers
      const { error: dbError } = await supabase.from('suppliers').insert([{
        user_id: authData.user.id,
        store_name: formData.company,
        email: formData.email,
        phone: formData.phone,
        supplier_type: supplierType
      }]);

      if (dbError) throw dbError;

      // 🔥 استدعاء دالة الإحالة هنا بعد نجاح التسجيل وحفظ البيانات 🔥
      if (authData?.user?.id) {
        await bindReferralOnSignup(authData.user.id);
      }

      showAlert('success', t.successRegister);
      setTimeout(() => {
        // توجيه بناءً على نوع المورد
        if (supplierType === 'wholesale') {
            window.location.href = '/?preview=wholesale'; // أو المسار الصحيح للمورد الكبير
        } else {
            window.location.href = '/?preview=retail'; // مسار تاجر التجزئة
        }
      }, 1500);

    } catch (err) {
      showAlert('error', err.message || t.errUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      const role = data.user?.user_metadata?.role || data.user?.user_metadata?.account_type;
      const metaType = data.user?.user_metadata?.supplier_type;

      // تحقق إضافي من جدول الموردين إذا لزم الأمر
      const { data: supplierData } = await supabase.from('suppliers').select('supplier_type').eq('user_id', data.user.id).maybeSingle();

      if (role !== 'supplier' && role !== 'admin' && !supplierData) {
         await supabase.auth.signOut();
         throw new Error(t.errNotSupplier);
      }

      showAlert('success', t.successLogin);
      setTimeout(() => {
          const type = supplierData?.supplier_type || metaType;
          if (type === 'wholesale') {
              window.location.href = '/?preview=wholesale';
          } else {
              window.location.href = '/?preview=retail';
          }
      }, 1500);

    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // تغيير الخلفية بناءً على نوع المورد (مثلما كان في PHP)
  const isWholesaler = supplierType === 'wholesale';
  const bgColor = isWholesaler ? 'from-slate-900 via-gray-800 to-black' : 'from-[#1e1b4b] via-[#2d2252] to-[#4338ca]';
  const blob1Color = isWholesaler ? 'bg-gray-600' : 'bg-blue-500';
  const blob2Color = isWholesaler ? 'bg-slate-500' : 'bg-purple-500';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${bgColor} relative overflow-hidden transition-colors duration-700 font-sans`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* خلفيات متحركة */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${blob1Color} rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse transition-colors duration-700`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 ${blob2Color} rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse transition-colors duration-700`} style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md px-6 z-10 py-10 animate-fade-in">
        
        {/* الترويسة */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-6 ring-4 ring-white/5 transition-all duration-500">
            {isWholesaler ? <Factory className="text-white w-10 h-10" /> : <Store className="text-white w-10 h-10" />}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
            {isLogin ? t.tabLogin : t.tabRegister}
          </h1>
          <p className="text-gray-300 font-medium">{t.portalSubtitle}</p>
        </div>

        {/* صندوق الفورم */}
        <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden transition-all duration-500">
          <div className="p-6 md:p-8">
            
            {/* مبدل نوع المورد (يظهر فقط في التسجيل) */}
            {!isLogin && (
              <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
                <button 
                  type="button" 
                  onClick={() => { setSupplierType('retail'); setAlert({ show: false, type: '', text: '' }); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${!isWholesaler ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Store size={16} /> {t.retailBtn}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setSupplierType('wholesale'); setAlert({ show: false, type: '', text: '' }); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${isWholesaler ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Factory size={16} /> {t.wholesaleBtn}
                </button>
              </div>
            )}

            {/* رسائل الخطأ/النجاح */}
            {alert.show && (
              <div className={`p-4 rounded-xl mb-6 font-bold flex items-start gap-3 border text-sm ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <span>{alert.text}</span>
              </div>
            )}

            {/* الفورم المشترك */}
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.companyLabel}</label>
                    <div className="relative">
                      <Building2 className={`w-5 h-5 absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                      <input type="text" name="company" required value={formData.company} onChange={handleChange} className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.phoneLabel}</label>
                    <div className="relative">
                      <Phone className={`w-5 h-5 absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className={`w-5 h-5 absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" placeholder="name@company.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm tracking-widest ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" placeholder="••••••••" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className={`w-full mt-2 py-4 px-4 rounded-xl text-sm font-black text-white transition-all transform hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none ${isWholesaler && !isLogin ? 'bg-gradient-to-r from-slate-800 to-black hover:from-black hover:to-slate-900 shadow-lg shadow-slate-900/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30'}`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? t.loginBtn : t.registerBtn)}
              </button>
            </form>

            <div className="mt-6 text-center text-sm font-bold text-gray-600">
              {isLogin ? (
                <p>ليس لديك حساب؟ <button onClick={() => setIsLogin(false)} className={`transition-colors hover:underline ${isWholesaler ? 'text-slate-800' : 'text-blue-600'}`}>{t.tabRegister}</button></p>
              ) : (
                <p>لديك حساب بالفعل؟ <button onClick={() => setIsLogin(true)} className={`transition-colors hover:underline ${isWholesaler ? 'text-slate-800' : 'text-blue-600'}`}>{t.tabLogin}</button></p>
              )}
            </div>

          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400">جميع الحقوق محفوظة © SasBTP 2026</p>
          </div>
        </div>

      </div>
    </div>
  );
}