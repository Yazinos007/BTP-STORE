import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Calculator, Home, Building, Building2, Sparkles, ArrowRight, 
  CheckCircle2, Mail, Phone, User, Download, Lock, Loader2 
} from 'lucide-react';

export default function CostCalculatorLanding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Calculator, 2: Lead Capture, 3: Success
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  // 1. بيانات المشروع المبسطة جداً للزبون العادي
  const [calcData, setCalcData] = useState({
    type: 'villa', // 'villa', 'building', 'house'
    area: 100,
    floors: 2,
    quality: 'medium' // 'economic', 'medium', 'premium'
  });

  // 2. بيانات الزبون (Lead)
  const [leadData, setLeadData] = useState({ fullName: '', phone: '', email: '' });

  // 🧠 خوارزمية حساب التكلفة التقريبية السريعة (بالدرهم المغربي)
  useEffect(() => {
    let basePricePerM2 = 1200; // تكلفة الأساسيات (Gros Oeuvre)
    
    // إضافة تكلفة التشطيبات (Finition)
    if (calcData.quality === 'economic') basePricePerM2 += 1000;
    if (calcData.quality === 'medium') basePricePerM2 += 2500;
    if (calcData.quality === 'premium') basePricePerM2 += 5000;

    // معامل نوع العقار
    let multiplier = 1;
    if (calcData.type === 'villa') multiplier = 1.2;
    if (calcData.type === 'building') multiplier = 0.9;

    const totalArea = calcData.area * calcData.floors;
    const totalCost = totalArea * basePricePerM2 * multiplier;
    
    setEstimatedTotal(totalCost);
  }, [calcData]);

  // إرسال البيانات لقاعدة البيانات (Supabase)
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.from('marketing_leads').insert([{
        full_name: leadData.fullName,
        phone: leadData.phone,
        email: leadData.email,
        project_type: calcData.type,
        area_m2: calcData.area,
        floors: calcData.floors,
        finishing_quality: calcData.quality,
        estimated_cost_mad: estimatedTotal
      }]);

      if (error) {
        // إذا لم يكن الجدول موجوداً بعد، نتجاوز الخطأ للمعاينة فقط (سننشئ الجدول لاحقاً)
        console.warn('تنبيه: جدول marketing_leads غير موجود بعد، جاري المتابعة للمعاينة.');
      }
      
      setStep(3); // الانتقال لشاشة النجاح
    } catch (err) {
      console.error('Error saving lead:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500/30 relative overflow-x-hidden" dir="rtl">
      
      {/* 🌌 خلفية فيروسية جذابة تشد الانتباه */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* شريط التنقل العلوي البسيط */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            S
          </div>
          <span className="text-xl font-black text-white tracking-wide">SasBTP</span>
        </div>
        <button onClick={() => navigate('/v2/auth')} className="px-5 py-2 rounded-full font-bold text-sm bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10">
          دخول المحترفين
        </button>
      </nav>

      {/* المحتوى الرئيسي */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-4 pb-20">
        
        {/* العناوين الجذابة (The Hook) */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6 shadow-sm">
            <Sparkles size={16} /> مدعوم بالذكاء الاصطناعي 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            احسب تكلفة بناء <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">مشروعك في المغرب</span> في 30 ثانية!
          </h1>
          <p className="text-base text-slate-400 font-medium max-w-2xl mx-auto">
            لا داعي للتخمين! حدد مواصفات أرضك وسنعطيك التكلفة التقريبية بالدرهم، مع إمكانية ربطك بأفضل المهندسين والمقاولين المعتمدين في مدينتك.
          </p>
        </div>

        {/* كارت الحاسبة / استمارة العملاء */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-[32px] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Calculator className="text-cyan-400" /> حدد مواصفات مشروعك:
              </h2>

              <div className="space-y-8">
                {/* 1. نوع العقار */}
                <div>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {[
                      { id: 'house', label: 'منزل بقعة', icon: Home },
                      { id: 'villa', label: 'فيلا مستقلة', icon: Building2 },
                      { id: 'building', label: 'عمارة سكنية', icon: Building },
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setCalcData({...calcData, type: type.id})}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${calcData.type === type.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'}`}
                      >
                        <type.icon size={28} />
                        <span className="font-bold text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 2. المساحة */}
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-sm font-bold text-slate-400">مساحة البقعة الأرضية:</label>
                      <span className="text-2xl font-black text-white">{calcData.area} م²</span>
                    </div>
                    <input 
                      type="range" min="50" max="1000" step="10" 
                      value={calcData.area} 
                      onChange={(e) => setCalcData({...calcData, area: Number(e.target.value)})}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                    />
                  </div>

                  {/* 3. عدد الطوابق */}
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-sm font-bold text-slate-400">عدد الطوابق (بما فيها السفلي):</label>
                      <span className="text-2xl font-black text-white">{calcData.floors}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="1" 
                      value={calcData.floors} 
                      onChange={(e) => setCalcData({...calcData, floors: Number(e.target.value)})}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                    />
                  </div>
                </div>

                {/* 4. جودة التشطيب */}
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-4">جودة التشطيبات (Finition):</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'economic', label: 'اقتصادي (Moyen)', desc: 'مواد أساسية وعملية' },
                      { id: 'medium', label: 'عصري (Moderne)', desc: 'زليج وصباغة عصرية' },
                      { id: 'premium', label: 'فاخر (Premium)', desc: 'رخام ومواد مستوردة عالية الجودة' },
                    ].map(q => (
                      <button
                        key={q.id}
                        onClick={() => setCalcData({...calcData, quality: q.id})}
                        className={`flex flex-col text-right p-4 rounded-2xl border-2 transition-all ${calcData.quality === q.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        <span className="font-bold mb-1">{q.label}</span>
                        <span className="text-[11px] opacity-70">{q.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* الفخ البصري (The Bait) 🪤 */}
                <div className="mt-8 p-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 relative group">
                  <div className="bg-slate-900 rounded-xl p-8 text-center relative overflow-hidden">
                    <p className="text-sm font-bold text-slate-300 mb-3">التكلفة الإجمالية التقريبية لمشروعك هي:</p>
                    
                    {/* الرقم المضبب لقتل الفضول */}
                    <div className="filter blur-md select-none pointer-events-none opacity-80">
                      <span className="text-5xl font-black text-white">{estimatedTotal.toLocaleString()}</span>
                      <span className="text-xl font-bold text-slate-400 ml-2">درهم</span>
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      className="mt-6 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-black text-lg transition-transform hover:-translate-y-1 shadow-[0_10px_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-3 mx-auto relative z-10"
                    >
                      <Download size={22} /> كشف الرقم وتحميل التقرير مجاناً
                    </button>
                    <p className="text-[11px] text-slate-500 mt-3 flex items-center justify-center gap-1">
                      <Lock size={12} /> التقرير مجاني 100% وبدون أي التزام أو دفع.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in max-w-md mx-auto py-4">
              <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
                <ArrowRight size={16} /> تعديل المواصفات
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                  <FileText size={32} />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">تقريرك جاهز تقريباً! 📊</h2>
                <p className="text-sm text-slate-400">أين نرسل لك كشف الحساب التفصيلي مع قائمة بأفضل المقاولين المتاحين في مدينتك؟</p>
              </div>

              <form onSubmit={handleSubmitLead} className="space-y-4">
                <div>
                  <div className="relative">
                    <User className="absolute right-4 top-3.5 text-slate-500 w-5 h-5" />
                    <input type="text" required placeholder="الاسم الكامل" value={leadData.fullName} onChange={e => setLeadData({...leadData, fullName: e.target.value})} className="w-full pl-4 pr-12 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors font-medium" />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Phone className="absolute right-4 top-3.5 text-slate-500 w-5 h-5" />
                    <input type="tel" required placeholder="رقم الهاتف (للتواصل عبر واتساب)" value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} className="w-full pl-4 pr-12 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors font-medium" dir="ltr" />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Mail className="absolute right-4 top-3.5 text-slate-500 w-5 h-5" />
                    <input type="email" placeholder="البريد الإلكتروني (اختياري)" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full pl-4 pr-12 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors font-medium" dir="ltr" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-4 mt-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-black text-base transition-transform hover:-translate-y-1 shadow-[0_10px_20px_rgba(34,211,238,0.2)] flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'عرض التكلفة وإرسال التقرير'}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in text-center py-10 max-w-md mx-auto">
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">تهانينا! 🎉</h2>
              <p className="text-slate-300 mb-8 text-lg font-medium">
                التكلفة التقديرية لمشروعك هي: 
                <br/>
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mt-3 block">
                  {estimatedTotal.toLocaleString()} <span className="text-2xl text-slate-400">درهم</span>
                </span>
              </p>
              
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-8 text-sm text-slate-300 leading-relaxed text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500"></div>
                سيقوم أحد مستشاري <b>SasBTP</b> بالتواصل معك قريباً عبر واتساب لتقديم استشارة مجانية، وترشيح أفضل المكاتب الهندسية والمقاولين الموثوقين لتنفيذ مشروعك بأمان.
              </div>
              
              {/* 🚀 الزر الذي سيأخذهم إلى واجهة العميل (B2C) التي سنصنعها تالياً */}
              <button onClick={() => navigate('/client-portal')} className="w-full py-4 bg-white hover:bg-gray-100 text-slate-900 rounded-xl font-black text-base transition-transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2">
                <User size={20} /> الدخول إلى لوحة تتبع مشروعي
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}