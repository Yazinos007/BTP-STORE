import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';
import useSettingsStore from '../../../store/useSettingsStore';

const translations = {
  ar: {
    subtitle: 'بوابة التسجيل الخاصة بالمهندسين ومكاتب الدراسات',
    badge: '⭐ انضم لنخبة المهندسين، أشرف على مشاريعك عن بعد، وأصدر تقاريرك الهندسية بضغطة زر.',
    nameLabel: 'الاسم الكامل للمهندس',
    namePlace: 'مثال: م. أحمد الإدريسي',
    specLabel: 'التخصص الهندسي',
    spec1: 'مهندس معماري (Architect)',
    spec2: 'مهندس مدني (Civil Engineer)',
    spec3: 'مهندس طبوغرافي (Topographer)',
    spec4: 'مصمم داخلي (Interior Designer)',
    licLabel: 'رقم القيد في الهيئة (اختياري)',
    licPlace: 'مثال: رقم بطاقة الهيئة',
    agencyLabel: 'اسم مكتب الدراسات / الوكالة',
    agencyPlace: 'مثال: الإدريسي ديزاين للعمارة',
    phoneLabel: 'رقم الهاتف المهني',
    emailLabel: 'البريد الإلكتروني',
    passLabel: 'كلمة المرور',
    btnSubmit: '🚀 إنشاء حسابي الهندسي',
    btnLoading: 'جاري تجهيز مكتبك الافتراضي...',
    backLink: '🔙 العودة لصفحة الدخول الرئيسية',
    errorExist: 'هذا البريد مسجل مسبقاً في النظام.',
    successMsg: '🎉 أهلاً بك في نخبة SouqBTP! تم تجهيز حسابك الهندسي.'
  },
  fr: {
    subtitle: 'Portail d\'inscription pour les architectes et bureaux d\'études',
    badge: '⭐ Rejoignez l\'élite, supervisez à distance et générez vos rapports en un clic.',
    nameLabel: 'Nom complet de l\'architecte',
    namePlace: 'Ex: Arch. Ahmed Idrissi',
    specLabel: 'Spécialité',
    spec1: 'Architecte',
    spec2: 'Ingénieur Civil',
    spec3: 'Topographe',
    spec4: 'Décorateur d\'intérieur',
    licLabel: 'Numéro d\'ordre (Optionnel)',
    licPlace: 'Ex: Numéro de carte',
    agencyLabel: 'Nom du bureau / Agence',
    agencyPlace: 'Ex: Idrissi Design',
    phoneLabel: 'Téléphone professionnel',
    emailLabel: 'Email',
    passLabel: 'Mot de passe',
    btnSubmit: '🚀 Créer mon compte',
    btnLoading: 'Préparation de votre bureau virtuel...',
    backLink: '🔙 Retour à la page de connexion',
    errorExist: 'Cet email est déjà enregistré.',
    successMsg: '🎉 Bienvenue dans l\'élite SouqBTP !'
  },
  en: {
    subtitle: 'Registration portal for Architects & Engineering Firms',
    badge: '⭐ Join the elite, supervise remotely, and generate reports with one click.',
    nameLabel: 'Full Name',
    namePlace: 'E.g., Arch. Ahmed Idrissi',
    specLabel: 'Specialty',
    spec1: 'Architect',
    spec2: 'Civil Engineer',
    spec3: 'Topographer',
    spec4: 'Interior Designer',
    licLabel: 'License Number (Optional)',
    licPlace: 'E.g., Board ID',
    agencyLabel: 'Agency / Studio Name',
    agencyPlace: 'E.g., Idrissi Design',
    phoneLabel: 'Professional Phone',
    emailLabel: 'Email Address',
    passLabel: 'Password',
    btnSubmit: '🚀 Create My Account',
    btnLoading: 'Setting up your virtual office...',
    backLink: '🔙 Back to Login',
    errorExist: 'This email is already registered.',
    successMsg: '🎉 Welcome to SouqBTP Elite!'
  }
};

export default function ArchitectRegister() {
  const navigate = useNavigate();
  const { language } = useSettingsStore();
  const lang = language || 'ar';
  const isRtl = lang === 'ar';
  const t = translations[lang] || translations.ar;

  const [formData, setFormData] = useState({
    name: '',
    specialty: 'Architect',
    license: '',
    agency: '',
    phone: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            role: 'architect'
          }
        }
      });

      if (authError) throw authError;
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        throw new Error(t.errorExist);
      }

      const { error: dbError } = await supabase.from('architects').insert([{
        user_id: authData.user.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        license_number: formData.license,
        specialty: formData.specialty,
        agency_name: formData.agency,
        subscription_plan: 'basic',
        is_verified: false
      }]);

      if (dbError) throw dbError;

      alert(t.successMsg);
      navigate('/v2/architect-projects'); // توجيه مباشر لصفحة المشاريع
      
    } catch (error) {
      console.error('Registration Error:', error.message);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 font-[Cairo]" dir={isRtl ? 'rtl' : 'ltr'} style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)' }}>
      <div className="bg-white max-w-[600px] w-full p-10 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-t-[8px] border-purple-700">
        <div className="text-center mb-8">
          <h1 className="text-[#4c1d95] text-4xl font-black mb-2">📐 SouqBTP Elite</h1>
          <p className="text-slate-500 font-semibold">{t.subtitle}</p>
        </div>
        <div className="bg-purple-100/50 border border-dashed border-purple-400 p-4 rounded-xl text-center mb-6">
          <span className="text-purple-700 font-bold text-sm">{t.badge}</span>
        </div>
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold text-center">
            ❌ {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block mb-2 font-bold text-slate-700 text-sm">{t.nameLabel}</label>
            <input type="text" id="name" required placeholder={t.namePlace} value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white" />
          </div>
          <div>
            <label className="block mb-2 font-bold text-slate-700 text-sm">{t.specLabel}</label>
            <select id="specialty" required value={formData.specialty} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white">
              <option value="Architect">{t.spec1}</option>
              <option value="Civil Engineer">{t.spec2}</option>
              <option value="Topographer">{t.spec3}</option>
              <option value="Interior Designer">{t.spec4}</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-bold text-slate-700 text-sm">{t.licLabel}</label>
            <input type="text" id="license" placeholder={t.licPlace} value={formData.license} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-2 font-bold text-slate-700 text-sm">{t.agencyLabel}</label>
            <input type="text" id="agency" placeholder={t.agencyPlace} value={formData.agency} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white" />
          </div>
          <div>
            <label className="block mb-2 font-bold text-slate-700 text-sm">{t.phoneLabel}</label>
            <input type="tel" id="phone" required placeholder="06XXXXXXXX" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white text-right" dir="ltr" />
          </div>
          <div>
            <label className="block mb-2 font-bold text-slate-700 text-sm">{t.emailLabel}</label>
            <input type="email" id="email" required placeholder="contact@agency.com" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white text-right" dir="ltr" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-2 font-bold text-slate-700 text-sm">{t.passLabel}</label>
            <input type="password" id="password" required minLength="6" placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white text-left" dir="ltr" />
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-bold text-lg transition-all disabled:bg-slate-300 disabled:cursor-not-allowed hover:-translate-y-1" style={{ background: loading ? '#cbd5e1' : 'linear-gradient(to right, #4c1d95, #8b5cf6)', boxShadow: loading ? 'none' : '0 10px 20px rgba(109, 40, 217, 0.3)' }}>
              {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> {t.btnLoading}</> : t.btnSubmit}
            </button>
          </div>
          <div className="md:col-span-2 text-center mt-4">
            <Link to="/v2/auth" className="text-slate-500 font-bold text-sm hover:text-purple-700 transition-colors">{t.backLink}</Link>
          </div>
        </form>
      </div>
    </div>
  );
}