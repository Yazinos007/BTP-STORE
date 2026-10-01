import React, { useState } from 'react';
import { Mic, X, Zap, CheckCircle2, Edit3, Camera, Check, MapPin } from 'lucide-react';

export default function SmartVoicePortfolio({ isDarkMode = false, language = 'fr', isOwner = true, onPublish, onManualClick }) {
  if (!isOwner) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('idle'); 
  const [mockResult, setMockResult] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const translations = {
    ar: { btn: "أضف إنجازاً بصوتك", title: "احكِ لنا عن مشروعك الأخير", desc: "تحدث عن المشروع، مكانه، وماذا أنجزت فيه.", start: "بدء التسجيل", listening: "نستمع إليك...", processing: "جاري صياغة الإنجاز...", success: "تم تجهيز الإنجاز", publish: "نشر في معرض أعمالي" },
    fr: { btn: "Ajouter une réalisation (IA)", title: "Parlez-nous de votre projet", desc: "Décrivez le projet, le lieu, et ce que vous avez accompli.", start: "Commencer", listening: "Écoute...", processing: "Analyse en cours...", success: "Réalisation prête", publish: "Publier" }
  };
  const t = translations[language] || translations.fr;
  const isRtl = language === 'ar';

  const startListening = () => {
    setStep('listening');
    setTimeout(() => {
      setStep('processing');
      setTimeout(() => {
        setMockResult({
          title: { ar: "تجهيز كهرباء فيلا سكنية", fr: "Installation électrique d'une villa" },
          location: { ar: "مراكش، النخيل", fr: "Marrakech, Palmeraie" },
          description: { ar: "تجهيز كامل للشبكة الكهربائية لفيلا من 3 طوابق مع إضاءة ذكية.", fr: "Installation complète du réseau électrique pour une villa de 3 étages avec éclairage intelligent." }
        });
        setStep('preview');
      }, 2500);
    }, 3000);
  };

  const handleClose = () => {
    setIsOpen(false); setStep('idle'); setMockResult(null); setImageFile(null); setImagePreview(null);
  };

  return (
    <>
      <div className="flex gap-2 mb-6 w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <button onClick={() => setIsOpen(true)} className="flex-[3] relative overflow-hidden group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-2xl font-black text-lg shadow-xl flex justify-center items-center gap-3 transition-all">
          <div className="bg-white/20 p-2 rounded-full animate-pulse"><Mic size={24} className="text-white" /></div>
          {t.btn} <Zap size={18} className="text-amber-300 fill-current mx-1" />
        </button>
        <button onClick={() => onManualClick && onManualClick()} className={`flex-[1] p-4 rounded-2xl font-black text-sm border-2 flex flex-col items-center justify-center transition-all ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
          <Edit3 size={20} /> {language === 'ar' ? 'يدوي' : 'Manuel'}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-md flex justify-center items-center p-4" onClick={handleClose}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-white'} w-full max-w-md rounded-3xl shadow-2xl relative border overflow-hidden`} onClick={e => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
            <button onClick={handleClose} className="absolute top-4 left-4 p-2 z-20 bg-slate-200 text-slate-600 rounded-full"><X size={20} /></button>
            <div className="p-6 pt-10 min-h-[400px] flex flex-col items-center justify-center">
              
              {step === 'idle' && (
                <div className="text-center w-full">
                  <div className="w-24 h-24 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 cursor-pointer" onClick={startListening}><Mic size={40} /></div>
                  <h3 className={`text-2xl font-black mb-2 ${textTitle}`}>{t.title}</h3>
                  <p className={`text-sm mb-8 ${textMuted}`}>{t.desc}</p>
                  <button onClick={startListening} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg">{t.start}</button>
                </div>
              )}

              {/* ... (نفس شاشات الاستماع والتحليل السابقة مع تغيير اللون للأخضر Emerald) ... */}
              {step === 'listening' && (
                <div className="text-center w-full"><div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><Mic size={32} /></div><h3 className="text-xl font-black text-red-500">{t.listening}</h3></div>
              )}
              {step === 'processing' && (
                <div className="text-center w-full"><div className="w-24 h-24 mx-auto relative mb-6 text-emerald-500 flex items-center justify-center"><Zap size={40} className="animate-spin" /></div><h3 className={`text-xl font-black ${textTitle}`}>{t.processing}</h3></div>
              )}

              {step === 'preview' && mockResult && (
                <div className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="mb-4">
                    <label className="block w-full h-32 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-xl text-center cursor-pointer relative overflow-hidden flex flex-col items-center justify-center">
                      {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" /> : <><Camera size={28} className="mb-2 text-emerald-500" /><span className="font-bold text-sm text-emerald-700">أضف صورة للإنجاز (مطلوب)</span></>}
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if(f){ setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
                    </label>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800' : 'bg-white'} mb-4`}>
                    <p className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-1"><MapPin size={12}/> {mockResult.location[language] || mockResult.location['fr']}</p>
                    <h4 className={`text-lg font-black mb-2 ${textTitle}`}>{mockResult.title[language] || mockResult.title['fr']}</h4>
                    <p className={`text-sm ${textMuted}`}>{mockResult.description[language] || mockResult.description['fr']}</p>
                  </div>

                  <button disabled={!imageFile} onClick={() => { onPublish({ ...mockResult, image: imageFile }); handleClose(); }} className="w-full bg-emerald-600 disabled:bg-slate-400 text-white py-3.5 rounded-xl font-black flex justify-center gap-2"><Check size={18} /> {t.publish}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}