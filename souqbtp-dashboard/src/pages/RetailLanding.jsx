import React from 'react';
import { 
  Smartphone, BookX, AlertTriangle, TrendingDown, 
  MessageCircle, Globe, Calculator, CheckCircle2, 
  ArrowLeft, Store, Zap, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RetailLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 text-slate-900" dir="rtl">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <Store className="text-white" size={24} />
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-800">SouqBTP <span className="text-blue-600">Retail</span></span>
        </div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="text-slate-600 font-bold hover:text-blue-600 transition-colors px-4 py-2"
        >
          تسجيل الدخول
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-8 animate-fade-in-down">
          <Zap size={16} className="fill-blue-700" />
          الحل رقم 1 لتجار العقاقير ومواد البناء
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.2]">
          لوّح كارني الكريدي المقطّع.. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            وسير حانوتك كامل من تليفونك!
          </span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
          منظومة ذكية كتحسب ليك أرباحك، كتضبط السلعة، وكتفكر الكليان فالكريدي بلا ما تحرج راسك. 
          <strong className="text-slate-900 bg-yellow-200 px-2 rounded ml-1">والجديد:</strong> دخل السلعة للسيستيم، وغتبان أوتوماتيكياً فالماركت بليس باش يشوفوها كليان جداد فمدينتك!
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.location.href = '/register'}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Smartphone size={24} />
            ابدأ الآن مجاناً
          </button>
          <button 
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-black text-lg rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            اكتشف المميزات
          </button>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16 text-slate-800">واش حتى نتا كتعاني من هاد المشاكل؟</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50/50 border border-red-100 p-8 rounded-3xl text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookX size={32} />
              </div>
              <h3 className="text-xl font-black mb-3">الكريديات كيتنساو</h3>
              <p className="text-slate-600 font-medium">الفلوس مفرقة عند الكليان، والكارني ديما مرون ومكتقدرش تبع شكون خلص وشكون مزال.</p>
            </div>
            
            <div className="bg-orange-50/50 border border-orange-100 p-8 rounded-3xl text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black mb-3">السلعة كتسلى على غفلة</h3>
              <p className="text-slate-600 font-medium">كيجيك الكليان على بياسة، كتلقاها تقادات ومجبتيش ليها الروتور فالوقت المناسب.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center">
              <div className="w-16 h-16 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingDown size={32} />
              </div>
              <h3 className="text-xl font-black mb-3">فين مشاو الأرباح؟</h3>
              <p className="text-slate-600 font-medium">كتبيع وتدير الروواج، وفي العشية ملي كتحسب الصندوق كتلقى الديكالاج ومكتعرفش راسك واش رابح ولا خاسر.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Solutions */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-16 text-slate-800">تهنى من الحسابات التقليدية، جابنا ليك الحل:</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex gap-6 items-start hover:shadow-md transition-shadow">
            <div className="w-14 h-14 shrink-0 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Globe size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black mb-2 text-slate-900">بيع فالحانوت وفالأنترنيت دقة وحدة</h3>
              <p className="text-slate-600 font-medium leading-relaxed">دخل السلعة ديالك للسيستيم مرة وحدة، وغتنشر أوتوماتيكياً فـ Marketplace ديالنا باش يشوفوها مقاولين وكليان جداد فمدينتك. ضاعف مبيعاتك بلا مجهود!</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex gap-6 items-start hover:shadow-md transition-shadow">
            <div className="w-14 h-14 shrink-0 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <MessageCircle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black mb-2 text-slate-900">إدارة الكريدي بالواتساب</h3>
              <p className="text-slate-600 font-medium leading-relaxed">قيد الكريدي بضغطة زر، والسيستيم غيصيفط رسالة أدبية للكليان في الواتساب كيفكرو بالخلاص (باش تبقى ديما بوجهك حمر).</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex gap-6 items-start hover:shadow-md transition-shadow">
            <div className="w-14 h-14 shrink-0 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Smartphone size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black mb-2 text-slate-900">كيس (POS) صاروخي من التليفون</h3>
              <p className="text-slate-600 font-medium leading-relaxed">دوز المبيعات ديالك في ثواني، طبع التوصيل، ونقص السلعة من الستوك أوتوماتيكياً. خدام فالتليفون، الطابليط، ولا البيسي.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex gap-6 items-start hover:shadow-md transition-shadow">
            <div className="w-14 h-14 shrink-0 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <Calculator size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black mb-2 text-slate-900">الخزينة والأرباح الصافية</h3>
              <p className="text-slate-600 font-medium leading-relaxed">تقرير يومي مفصل كيعطيك الربح الصافي ديالك، شحال دخل، شحال خرج، والمصاريف ديال الحانوت باش تعرف راسك فين غادي.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16">اختار الباقة لي تناسب حجم حانوتك</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col">
              <h3 className="text-2xl font-black mb-2">Basic POS</h3>
              <p className="text-slate-400 font-medium mb-6">بداية مثالية للحوانت الصغار</p>
              <div className="text-4xl font-black mb-8">0 <span className="text-xl text-slate-400">درهم/دائماً</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> نقطة بيع سريعة</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> إدارة المخزون الأساسية</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> حتى لـ 50 كليان</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold transition-colors">ابدا فابور</button>
            </div>

            {/* Premium (Highlighted) */}
            <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-3xl p-8 border border-blue-400 shadow-2xl shadow-blue-900/50 transform md:-translate-y-4 flex flex-col relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-slate-900 font-black text-xs px-4 py-1 rounded-full uppercase tracking-wider">الأكثر طلباً</div>
              <h3 className="text-2xl font-black mb-2 text-white">Premium Shop</h3>
              <p className="text-blue-200 font-medium mb-6">الحل الشامل لتهنى من الكريدي</p>
              <div className="text-4xl font-black mb-8 text-white">1430 <span className="text-xl text-blue-200">درهم/سنوياً</span></div>
              <ul className="space-y-4 mb-8 flex-1 font-medium">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-amber-400" size={20}/> كل مزايا المجاني</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-amber-400" size={20}/> النشر التلقائي فالماركت بليس</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-amber-400" size={20}/> تذكير أوتوماتيكي بالواتساب</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-amber-400" size={20}/> إدارة دقيقة للكريدي</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-amber-400" size={20}/> كليان وسلع بدون حدود</li>
              </ul>
              <button className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-lg transition-colors shadow-lg shadow-amber-400/20">اشترك الآن</button>
            </div>

            {/* Pro */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col">
              <h3 className="text-2xl font-black mb-2">Pro Retailer</h3>
              <p className="text-slate-400 font-medium mb-6">سيستيم ERP متكامل للكبار</p>
              <div className="text-4xl font-black mb-8">2870 <span className="text-xl text-slate-400">درهم/سنوياً</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> كل مزايا Premium</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> المحاسبة والضرائب</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> تسيير الموظفين والصناديق</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> تصدير مباشر للكونتابل</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold transition-colors">تواصل معنا</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-white py-12 text-center border-t border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 mb-4">واجد باش تطور حانوتك وتزيد فمبيعاتك؟</h2>
        <p className="text-slate-600 mb-6">جرب المنصة اليوم بالمجان، وبلا ما تدخل لا كارطة لا والو.</p>
        <button 
          onClick={() => window.location.href = '/register'}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <span>افتح حسابك دابا</span>
          <ArrowLeft size={20} />
        </button>
      </footer>
    </div>
  );
}