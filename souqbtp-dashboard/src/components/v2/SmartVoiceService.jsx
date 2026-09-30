import React, { useState } from 'react';
import { Mic, X, Zap, CheckCircle2, Edit3, Activity, Check } from 'lucide-react';

export default function SmartVoiceService({ isDarkMode = false, onPublish }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('idle'); 
  const [mockResult, setMockResult] = useState(null);

  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const startListening = () => {
    setStep('listening');
    setTimeout(() => {
      setStep('processing');
      setTimeout(() => {
        setMockResult({
          title: "تركيب وصيانة اللوحات الكهربائية",
          category: "الكهرباء (تريسيان)",
          description: "تمديد الأسلاك، تركيب الطابلوات الكهربائية، وإصلاح الأعطال المنزلية باستخدام معدات مطابقة لمعايير السلامة.",
          price: 500,
          priceNote: "سعر مقترح مبدئي"
        });
        setStep('preview');
      }, 2500);
    }, 3000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => { setStep('idle'); setMockResult(null); }, 300);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/30 flex justify-center items-center gap-3 transition-all transform hover:-translate-y-1"
      >
        <div className="absolute inset-0 w-full h-full bg-white/20 blur-xl group-hover:bg-white/30 transition-colors"></div>
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-full animate-pulse"><Mic size={24} className="text-white" /></div>
          أضف خدمة بصوتك (AI)
          <Zap size={18} className="text-amber-400 fill-current ml-1" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-md flex justify-center items-end sm:items-center p-4 sm:p-0" onClick={handleClose}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-white'} w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative border animate-slide-up overflow-hidden`} onClick={e => e.stopPropagation()} dir="rtl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"></div>
            <button onClick={handleClose} className={`absolute top-4 left-4 p-2 z-20 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'} rounded-full transition-colors`}><X size={20} /></button>
            <div className="p-6 pt-10 min-h-[400px] flex flex-col items-center justify-center relative">
              
              {step === 'idle' && (
                <div className="text-center w-full">
                  <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 cursor-pointer hover:scale-105 transition-transform" onClick={startListening}><Mic size={40} /></div>
                  <h3 className={`text-2xl font-black mb-2 ${textTitle}`}>ماذا تقدم لعملائك؟</h3>
                  <p className={`text-sm mb-8 ${textMuted}`}>تحدث بالدارجة، وسيقوم الذكاء الاصطناعي بكتابة وتصنيف وتسعير خدمتك تلقائياً.</p>
                  <button onClick={startListening} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors">بدء التسجيل الآن</button>
                </div>
              )}

              {step === 'listening' && (
                <div className="text-center w-full">
                  <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center"><Mic size={32} /></div>
                  </div>
                  <h3 className={`text-xl font-black mb-2 text-red-500`}>جاري الاستماع...</h3>
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center w-full">
                  <div className="w-24 h-24 mx-auto relative mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600"><Zap size={32} className="animate-pulse fill-current" /></div>
                  </div>
                  <h3 className={`text-xl font-black mb-2 ${textTitle}`}>الذكاء الاصطناعي يحلل...</h3>
                </div>
              )}

              {step === 'preview' && mockResult && (
                <div className="w-full text-right">
                  <div className="flex items-center justify-center gap-2 text-emerald-500 mb-4 bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg font-bold text-sm border border-emerald-200"><CheckCircle2 size={18} /> تمت صياغة الخدمة بنجاح</div>
                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} shadow-sm relative mb-6`}>
                    <p className="text-[10px] font-bold text-indigo-500 mb-1 mt-2">{mockResult.category}</p>
                    <h4 className={`text-lg font-black mb-2 leading-tight ${textTitle}`}>{mockResult.title}</h4>
                    <p className={`text-sm leading-relaxed mb-4 ${textMuted}`}>{mockResult.description}</p>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className={`text-[10px] font-bold ${textMuted}`}>{mockResult.priceNote}</p>
                        <p className="text-xl font-black text-emerald-600">{mockResult.price} MAD</p>
                      </div>
                      <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm hover:text-indigo-600`}><Edit3 size={16} /></button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('idle')} className={`flex-1 py-3.5 rounded-xl font-bold text-sm border-2 ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>إعادة التسجيل</button>
                    <button onClick={() => { onPublish && onPublish(mockResult); handleClose(); }} className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2"><Check size={18} /> نشر في متجري</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slide-up { from { opacity: 0; transform: translateY(100px); } to { opacity: 1; transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}</style>
    </>
  );
}