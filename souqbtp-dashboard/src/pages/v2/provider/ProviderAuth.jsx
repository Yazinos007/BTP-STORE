import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { HardHat, Mail, Lock, User, Phone, MapPin, Briefcase, FileText, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProviderAuth() {
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [isLogin, setIsLogin] = useState(false); // false = Register, true = Login
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', text: '' });

  // حالات الفورم
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: '',
    serviceId: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlert = (type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: '', text: '' }), 6000);
  };

  // 1. معالجة التسجيل (بدون PHP نهائياً - 100% Serverless)
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      // أ. التحقق من أن رقم الهاتف غير مستخدم (اختياري لزيادة الأمان)
      const { data: existingPhone } = await supabase.from('providers').select('id').eq('phone', formData.phone).maybeSingle();
      if (existingPhone) throw new Error(isRtl ? 'رقم الهاتف هذا مسجل مسبقاً.' : 'Ce numéro de téléphone est déjà enregistré.');

      // ب. التسجيل في نظام المصادقة
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName, role: 'provider' }
        }
      });

      if (authError) throw authError;
      if (authData.user && authData.user.identities.length === 0) {
        throw new Error(isRtl ? 'البريد الإلكتروني مستخدم مسبقاً.' : 'Cet email est déjà utilisé.');
      }

      // ج. إنشاء ملف الحرفي في جدول providers
      const { data: newProvider, error: dbError } = await supabase
        .from('providers')
        .insert([{
          user_id: authData.user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          account_type: 'marketplace'
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // د. ربط الحرفي بالخدمة المتخصصة
      if (formData.serviceId) {
        await supabase.from('provider_services').insert([{
          provider_id: newProvider.id,
          service_id: parseInt(formData.serviceId)
        }]);
      }

      showAlert('success', isRtl ? 'تم إنشاء الحساب بنجاح! جاري تحويلك...' : 'Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/v2/contractor-dashboard'), 2000);

    } catch (err) {
      showAlert('error', err.message || (isRtl ? 'حدث خطأ غير متوقع.' : 'Une erreur est survenue.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. معالجة تسجيل الدخول (بالإيميل والباسورد لمواكبة النظام الجديد)
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw new Error(isRtl ? 'البيانات غير صحيحة.' : 'Identifiants incorrects.');

      // التحقق من أن المستخدم حرفي/مقاول
      const role = data.user?.user_metadata?.role;
      if (role !== 'provider') {
         await supabase.auth.signOut();
         throw new Error(isRtl ? 'هذا الحساب ليس مسجلاً كحرفي.' : 'Ce compte n\'est pas un compte artisan.');
      }

      showAlert('success', isRtl ? 'تم تسجيل الدخول بنجاح! جاري تحويلك...' : 'Connexion réussie ! Redirection...');
      setTimeout(() => navigate('/v2/contractor-dashboard'), 1500);

    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f3f4f6', backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.1)] overflow-hidden border border-slate-100">
        
        {/* الترويسة والتبويبات */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 transform rotate-3">
              <HardHat className="w-8 h-8 text-white -rotate-3" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2 tracking-wide">SouqBTP PRO</h1>
            <p className="text-slate-400 text-sm font-medium">{isRtl ? 'بوابة الحرفيين والمقاولين' : 'Portail des Artisans et Entrepreneurs'}</p>
          </div>
        </div>

        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setIsLogin(false); setAlert({ show: false, type: '', text: '' }); }}
            className={`flex-1 py-4 text-sm font-black transition-colors ${!isLogin ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {isRtl ? 'إنشاء حساب جديد' : 'Créer un compte'}
          </button>
          <button 
            onClick={() => { setIsLogin(true); setAlert({ show: false, type: '', text: '' }); }}
            className={`flex-1 py-4 text-sm font-black transition-colors ${isLogin ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {isRtl ? 'تسجيل الدخول' : 'Se connecter'}
          </button>
        </div>

        <div className="p-8">
          {alert.show && (
            <div className={`p-4 rounded-xl mb-6 font-bold flex items-start gap-3 border text-sm ${alert.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <span>{alert.text}</span>
            </div>
          )}

          {isLogin ? (
            /* =================== فورم تسجيل الدخول =================== */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
                <div className="relative">
                  <Mail className={`w-5 h-5 absolute top-3.5 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium ${isRtl ? 'pr-12' : 'pl-12'}`} dir="ltr" placeholder="artisan@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'كلمة المرور' : 'Mot de passe'}</label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute top-3.5 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className={`w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium ${isRtl ? 'pr-12' : 'pl-12'}`} dir="ltr" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-base shadow-[0_5px_15px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {isRtl ? 'تسجيل الدخول' : 'Connexion'}
              </button>
            </form>
          ) : (
            /* =================== فورم إنشاء حساب =================== */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'البريد الإلكتروني *' : 'Email *'}</label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute top-3.5 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm ${isRtl ? 'pr-9' : 'pl-9'}`} dir="ltr" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'كلمة المرور *' : 'Mot de passe *'}</label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute top-3.5 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm ${isRtl ? 'pr-9' : 'pl-9'}`} dir="ltr" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'الاسم الكامل *' : 'Nom Complet *'}</label>
                  <div className="relative">
                    <User className={`w-4 h-4 absolute top-3.5 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm ${isRtl ? 'pr-9' : 'pl-9'}`} />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'رقم الهاتف *' : 'Téléphone *'}</label>
                  <div className="relative">
                    <Phone className={`w-4 h-4 absolute top-3.5 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input type="tel" name="phone" required placeholder="06..." value={formData.phone} onChange={handleChange} className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm ${isRtl ? 'pr-9' : 'pl-9'}`} dir="ltr" />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'المدينة' : 'Ville'}</label>
                  <div className="relative">
                    <MapPin className={`w-4 h-4 absolute top-3.5 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm ${isRtl ? 'pr-9' : 'pl-9'}`} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'التخصص الرئيسي *' : 'Spécialité *'}</label>
                  <div className="relative">
                    <Briefcase className={`w-4 h-4 absolute top-3.5 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <select name="serviceId" required value={formData.serviceId} onChange={handleChange} className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm font-bold ${isRtl ? 'pr-9' : 'pl-9'}`}>
                      <option value="" disabled>{isRtl ? '-- اختر تخصصك الدقيق --' : '-- Choisissez votre spécialité --'}</option>
                      <option value="37">{isRtl ? 'أعمال البناء (Gros Œuvres)' : 'Gros Œuvres'}</option>
                      <option value="38">{isRtl ? 'الكهرباء (تريسيان)' : 'Électricité'}</option>
                      <option value="39">{isRtl ? 'السباكة (بلومبي)' : 'Plomberie'}</option>
                      <option value="40">{isRtl ? 'العزل (Étanchéité)' : 'Étanchéité'}</option>
                      <option value="53">{isRtl ? 'الجبس والسيراميك (الزليج)' : 'Carrelage & Plâtre'}</option>
                      <option value="54">{isRtl ? 'الدهان والتجصيص (الصباغة)' : 'Peinture'}</option>
                      <option value="43">{isRtl ? 'نجارة وألمونيوم' : 'Menuiserie & Aluminium'}</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{isRtl ? 'ملاحظات إضافية' : 'Notes supplémentaires'}</label>
                  <div className="relative">
                    <FileText className={`w-4 h-4 absolute top-3.5 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <textarea name="notes" rows="2" value={formData.notes} onChange={handleChange} placeholder={isRtl ? "تعريف قصير بخبرتك..." : "Courte description..."} className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm resize-none ${isRtl ? 'pr-9' : 'pl-9'}`}></textarea>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 mt-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-base shadow-[0_5px_15px_rgba(234,88,12,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <HardHat className="w-5 h-5" />}
                {isRtl ? 'إنشاء الحساب والانطلاق' : 'Créer mon compte'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}