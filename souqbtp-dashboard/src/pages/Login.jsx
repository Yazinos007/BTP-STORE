import { useState } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { Store, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Globe } from 'lucide-react';

const translations = {
  ar: {
    welcome: 'مرحباً بك مجدداً', subtitle: 'نظام إدارة SouqBTP للموردين وفريق العمل.',
    email: 'البريد الإلكتروني', emailPH: 'name@company.com',
    password: 'كلمة المرور', passwordPH: '••••••••',
    loginBtn: 'تسجيل الدخول', loggingIn: 'جاري التحقق...',
    errorMsg: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    rights: 'جميع الحقوق محفوظة © SouqBTP 2026'
  },
  fr: {
    welcome: 'Bienvenue', subtitle: 'Portail de gestion SouqBTP (Fournisseurs & Équipe).',
    email: 'Adresse Email', emailPH: 'nom@entreprise.com',
    password: 'Mot de passe', passwordPH: '••••••••',
    loginBtn: 'Se connecter', loggingIn: 'Connexion en cours...',
    errorMsg: 'Email ou mot de passe incorrect.',
    rights: 'Tous droits réservés © SouqBTP 2026'
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { language, toggleLanguage } = useSettingsStore();
  const t = translations[language];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(t.errorMsg);
      setLoading(false);
    }
    // إذا نجح الدخول، فإن App.jsx سيكتشف التغيير تلقائياً وينقلك للوحة القيادة
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] via-[#2d2252] to-[#4338ca] relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🎨 أشكال هندسية تزيينية في الخلفية */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>

      {/* 🌍 زر تغيير اللغة */}
      <button onClick={toggleLanguage} className="absolute top-6 right-6 lg:right-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all text-sm font-bold shadow-lg">
        <Globe size={16} /> {language === 'fr' ? 'العربية' : 'Français'}
      </button>

      <div className="w-full max-w-md px-6 z-10">
        
        {/* 🏢 الشعار والنصوص */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-6 ring-4 ring-white/5">
            <Store size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{t.welcome}</h1>
          <p className="text-blue-200 font-medium">{t.subtitle}</p>
        </div>

        {/* 📋 بطاقة تسجيل الدخول */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">{t.email}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium" 
                    placeholder={t.emailPH}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">{t.password}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium" 
                    placeholder={t.passwordPH}
                    dir="ltr"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> {t.loggingIn}</>
                ) : (
                  <>{t.loginBtn} <ArrowRight size={18} className={language === 'ar' ? 'rotate-180' : ''} /></>
                )}
              </button>
            </form>
          </div>
          
          {/* شريط سفلي جمالي */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400">{t.rights}</p>
          </div>
        </div>
      </div>
    </div>
  );
}