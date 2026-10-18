import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ArchitectRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'مهندس معماري (Architect)',
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
      // 1. إنشاء الحساب في نظام التوثيق (Auth)
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
        throw new Error('هذا البريد مسجل مسبقاً في النظام.');
      }

      // 2. إدراج بيانات المهندس في جدول architects
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

      // 3. التوجيه المباشر للداشبورد
      alert('🎉 أهلاً بك في نخبة SouqBTP! تم تجهيز حسابك الهندسي.');
      navigate('/v2/architect-dashboard');
      
    } catch (error) {
      console.error('Registration Error:', error.message);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 font-[Cairo]" dir="rtl" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)' }}>
      <div className="bg-white max-w-[600px] w-full p-10 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-t-[8px] border-purple-700">
        <div className="text-center mb-8">
          <h1 className="text-[#4c1d95] text-4xl font-black mb-2">📐 SouqBTP Elite</h1>
          <p className="text-slate-500 font-semibold">بوابة التسجيل الخاصة بالمهندسين ومكاتب الدراسات</p>
        </div>
        <div className="bg-purple-100/50 border border-dashed border-purple-400 p-4 rounded-xl text-center mb-6">
          <span className="text-purple-700 font-bold text-sm">⭐ انضم لنخبة المهندسين، أشرف على مشاريعك عن بعد، وأصدر تقاريرك الهندسية بضغطة زر.</span>
        </div>
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold text-center">
            ❌ {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block mb-2 font-bold text-slate-700 text-sm">الاسم الكامل للمهندس</label>
            <input type="text" id="name" required placeholder="مثال: م. أحمد الإدريسي" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white" />
          </div>
          <div>
            <label className="block mb-2 font-bold text-slate-700 text-sm">التخصص الهندسي</label>
            <select id="specialty" required value={formData.specialty} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white">
              <option value="مهندس معماري (Architect)">مهندس معماري (Architect)</option>
              <option value="مهندس مدني (Civil Engineer)">مهندس مدني (Civil Engineer)</option>
              <option value="مهندس طبوغرافي (Topographer)">مهندس طبوغرافي (Topographer)</option>
              <option value="مصمم داخلي (Interior Designer)">مصمم داخلي (Interior Designer)</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-bold text-slate-700 text-sm">رقم القيد في الهيئة (اختياري)</label>
            <input type="text" id="license" placeholder="مثال: رقم بطاقة الهيئة" value={formData.license} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-2 font-bold text-slate-700 text-sm">اسم مكتب الدراسات / الوكالة</label>
            <input type="text" id="agency" placeholder="مثال: الإدريسي ديزاين للعمارة" value={formData.agency} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white" />
          </div>
          <div>
            <label className="block mb-2 font-bold text-slate-700 text-sm">رقم الهاتف المهني</label>
            <input type="tel" id="phone" required placeholder="06XXXXXXXX" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white text-right" dir="ltr" />
          </div>
          <div>
            <label className="block mb-2 font-bold text-slate-700 text-sm">البريد الإلكتروني</label>
            <input type="email" id="email" required placeholder="contact@agency.com" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white text-right" dir="ltr" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-2 font-bold text-slate-700 text-sm">كلمة المرور</label>
            <input type="password" id="password" required minLength="6" placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:border-purple-500 focus:bg-white text-left" dir="ltr" />
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-bold text-lg transition-all disabled:bg-slate-300 disabled:cursor-not-allowed hover:-translate-y-1" style={{ background: loading ? '#cbd5e1' : 'linear-gradient(to right, #4c1d95, #8b5cf6)', boxShadow: loading ? 'none' : '0 10px 20px rgba(109, 40, 217, 0.3)' }}>
              {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> جاري تجهيز مكتبك الافتراضي...</> : '🚀 إنشاء حسابي الهندسي'}
            </button>
          </div>
          <div className="md:col-span-2 text-center mt-4">
            <Link to="/v2/auth" className="text-slate-500 font-bold text-sm hover:text-purple-700 transition-colors">🔙 العودة لصفحة الدخول الرئيسية</Link>
          </div>
        </form>
      </div>
    </div>
  );
}