import React, { useState } from 'react';
import { Check, Star, Zap, Building, ArrowRight, Shield, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupplierSubscription() {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const handleSubscribe = (tier) => {
    // هنا سنضع لاحقاً كود ربط بوابة الدفع أو تفعيل الفترة المجانية في Supabase
    console.log(`تم اختيار الباقة: ${tier}`);
    navigate('/dashboard'); // توجيه مؤقت للوحة التحكم بعد الاختيار
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-20 px-4 font-sans selection:bg-blue-500/30" dir="rtl">
      
      {/* رأس الصفحة */}
      <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-sm mb-6">
          <Rocket size={16} /> عرض الانطلاق الخاص
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          حوّل مخزنك إلى <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">متجر رقمي</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
          انضم إلى أكبر شبكة للمهندسين والمقاولين. اعرض مواد البناء الخاصة بك، تتبع مبيعاتك، وضاعف أرباحك مع SouqBTP.
        </p>
      </div>

      {/* زر التبديل بين الشهري والسنوي */}
      <div className="flex justify-center mb-16">
        <div className="bg-[#1e293b] p-1.5 rounded-2xl flex items-center gap-1 border border-white/5 shadow-xl">
          <button 
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${!isAnnual ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            اشتراك شهري
          </button>
          <button 
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            اشتراك سنوي <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">خصم 20%</span>
          </button>
        </div>
      </div>

      {/* بطاقات الباقات */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        
        {/* الباقة الأساسية */}
        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 transition-transform hover:-translate-y-2 duration-300">
          <h3 className="text-xl font-bold text-gray-300 mb-2 flex items-center gap-2"><Building size={20} /> الأساسية</h3>
          <p className="text-gray-500 text-sm mb-6">مثالية للموردين الصغار والمبتدئين.</p>
          <div className="mb-6">
            <span className="text-4xl font-black">{isAnnual ? '299' : '399'}</span>
            <span className="text-gray-500 font-medium"> درهم/شهر</span>
          </div>
          <button onClick={() => handleSubscribe('basic')} className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-colors mb-8">
            ابدأ تجربتك المجانية
          </button>
          <ul className="space-y-4">
            {['إضافة حتى 100 منتج', 'ظهور في نتائج البحث', 'لوحة تحكم بسيطة', 'دعم فني عبر البريد'].map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300 text-sm"><Check size={18} className="text-emerald-400" /> {feat}</li>
            ))}
          </ul>
        </div>

        {/* الباقة الاحترافية (الموصى بها) */}
        <div className="bg-gradient-to-b from-blue-600 to-blue-900 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-blue-900/50 border border-blue-400/30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-400 to-rose-400 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Star size={14} fill="currentColor" /> الأكثر طلباً
          </div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Zap size={20} /> الاحترافية</h3>
          <p className="text-blue-200 text-sm mb-6">للموردين الباحثين عن النمو السريع.</p>
          <div className="mb-6">
            <span className="text-5xl font-black">{isAnnual ? '599' : '799'}</span>
            <span className="text-blue-300 font-medium"> درهم/شهر</span>
          </div>
          <button onClick={() => handleSubscribe('pro')} className="w-full py-3.5 rounded-xl bg-white text-blue-900 hover:bg-gray-50 font-black transition-transform active:scale-95 mb-8 shadow-xl flex items-center justify-center gap-2">
            ابدأ 30 يوماً مجاناً <ArrowRight size={18} className="rotate-180" />
          </button>
          <ul className="space-y-4">
            {['منتجات غير محدودة', 'ظهور مميز (VIP) في البحث', 'مساعد الذكاء الاصطناعي', 'إدارة الديون والفواتير', 'دعم فني عبر الهاتف المباشر'].map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-white text-sm font-medium">
                <div className="bg-blue-400/20 p-1 rounded-full"><Check size={14} className="text-white" /></div> {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* باقة الشركات */}
        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 transition-transform hover:-translate-y-2 duration-300">
          <h3 className="text-xl font-bold text-gray-300 mb-2 flex items-center gap-2"><Shield size={20} /> الشركات الكبرى</h3>
          <p className="text-gray-500 text-sm mb-6">للموزعين الكبار وأصحاب الفروع المتعددة.</p>
          <div className="mb-6">
            <span className="text-4xl font-black">{isAnnual ? '1499' : '1999'}</span>
            <span className="text-gray-500 font-medium"> درهم/شهر</span>
          </div>
          <button onClick={() => handleSubscribe('enterprise')} className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-colors mb-8">
            تواصل مع المبيعات
          </button>
          <ul className="space-y-4">
            {['كل ميزات الباقة الاحترافية', 'إدارة الفروع والمخازن المتعددة', 'نظام الموارد البشرية (HR)', 'مدير حسابات شخصي (Account Manager)', 'وسام "مورد معتمد"'].map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300 text-sm"><Check size={18} className="text-purple-400" /> {feat}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}