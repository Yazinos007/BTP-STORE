import React, { useState } from 'react';
import { Mic, X, Zap, CheckCircle2, Edit3, Activity, Check, Camera } from 'lucide-react';

export default function SmartVoiceService({ isDarkMode = false, language = 'fr', isOwner = true, onPublish, onManualClick }) {
  if (!isOwner) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('idle'); 
  const [mockResult, setMockResult] = useState(null);
  const [isEditingPrice, setIsEditingPrice] = useState(false); 
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const translations = {
    ar: { btn: "أضف خدمة بصوتك (AI)", title: "ماذا تقدم لعملائك؟", desc: "تحدث بالدارجة، وسيقوم الذكاء الاصطناعي بكتابة وتصنيف وتسعير خدمتك تلقائياً.", start: "بدء التسجيل الآن", listening: "جاري الاستماع...", processing: "الذكاء الاصطناعي يحلل...", success: "تمت صياغة الخدمة بنجاح", priceNote: "سعر مقترح مبدئي", retry: "إعادة التسجيل", publish: "نشر في متجري", aiTag: "مُولد بالذكاء الاصطناعي" },
    fr: { btn: "Ajouter un service (IA)", title: "Que proposez-vous ?", desc: "Parlez en Darija, l'IA rédigera, classera et tarifera votre service automatiquement.", start: "Commencer l'enregistrement", listening: "Écoute en cours...", processing: "L'IA analyse...", success: "Service formulé avec succès", priceNote: "Prix initial suggéré", retry: "Réessayer", publish: "Publier le service", aiTag: "Généré par l'IA" },
    en: { btn: "Add service (AI)", title: "What do you offer?", desc: "Speak in Darija, AI will write, categorize and price your service automatically.", start: "Start Recording", listening: "Listening...", processing: "AI is analyzing...", success: "Service formulated successfully", priceNote: "Suggested initial price", retry: "Retry", publish: "Publish to my store", aiTag: "AI Generated" }
  };
  const t = translations[language] || translations.fr;
  const isRtl = language === 'ar';

  // 1. فتح الميكروفون وبدء التسجيل الحقيقي
  const startRealListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        setStep('processing');
        const finalBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(finalBlob);
        // إغلاق الميكروفون من المتصفح نهائياً
        stream.getTracks().forEach(track => track.stop());
        // 🚀 هنا سنقوم لاحقاً باستدعاء دالة إرسال finalBlob إلى الذكاء الاصطناعي
        await simulateAIResponseForNow(finalBlob); 
      };
      recorder.start();
      setMediaRecorder(recorder);
      setStep('listening');
    } catch (error) {
      console.error("خطأ في الميكروفون:", error);
      alert(language === 'ar' ? "الرجاء السماح باستخدام الميكروفون للتسجيل." : "Veuillez autoriser l'accès au microphone.");
    }
  };
  // 2. إيقاف التسجيل يدوياً
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };
  // 3. دالة مؤقتة لتشغيل المعاينة حتى نربط الـ API في الخطوة القادمة
  const simulateAIResponseForNow = async (blob) => {
    // محاكاة إرسال الصوت للذكاء الاصطناعي (سنستبدلها بالربط الحقيقي قريباً)
    setTimeout(() => {
      setMockResult({
        title: { ar: "تركيب وصيانة اللوحات الكهربائية", fr: "Installation et maintenance de tableaux", en: "Electrical panel maintenance" },
        category: { ar: "الكهرباء", fr: "Électricité", en: "Electrical" },
        description: { ar: "تم تسجيل صوتك بنجاح! هذا مجرد اختبار مؤقت.", fr: "Voix enregistrée avec succès !", en: "Voice recorded successfully!" },
        price: 500,
      });
      setStep('preview');
    }, 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => { setStep('idle'); setMockResult(null); setIsEditingPrice(false); }, 300);
    setImageFile(null); setImagePreview(null);
  };

  return (
    <>
      {/* تم دمج الزر الصوتي مع زر الإدخال اليدوي هنا */}
      <div className="flex gap-2 mb-6 w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <button onClick={() => setIsOpen(true)} className="flex-[3] relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/30 flex justify-center items-center gap-3 transition-all transform hover:-translate-y-1">
          <div className="absolute inset-0 w-full h-full bg-white/20 blur-xl group-hover:bg-white/30 transition-colors"></div>
          <div className="relative z-10 flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full animate-pulse"><Mic size={24} className="text-white" /></div>
            <span className="hidden sm:inline">{t.btn}</span>
            <span className="sm:hidden">{language === 'ar' ? 'صوت' : 'Voix'}</span>
            <Zap size={18} className="text-amber-400 fill-current mx-1" />
          </div>
        </button>

        {/* زر الإدخال اليدوي الكلاسيكي */}
        <button onClick={() => onManualClick && onManualClick()} className={`flex-[1] p-4 rounded-2xl font-black text-sm border-2 flex flex-col items-center justify-center gap-1 transition-all hover:-translate-y-1 ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Edit3 size={20} className="mb-1" />
          {language === 'ar' ? 'يدوي' : 'Manuel'}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-md flex justify-center items-end sm:items-center p-4 sm:p-0" onClick={handleClose}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-white'} w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative border animate-slide-up overflow-hidden`} onClick={e => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"></div>
            <button onClick={handleClose} className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 z-20 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'} rounded-full transition-colors`}><X size={20} /></button>
            
            <div className="p-6 pt-10 min-h-[400px] flex flex-col items-center justify-center relative">
              
              {step === 'idle' && (
                <div className="text-center w-full">
                  <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 cursor-pointer hover:scale-105 transition-transform" onClick={startRealListening}><Mic size={40} /></div>
                  <h3 className={`text-2xl font-black mb-2 ${textTitle}`}>{t.title}</h3>
                  <p className={`text-sm mb-8 ${textMuted}`}>{t.desc}</p>
                  <button onClick={startRealListening} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors">{t.start}</button>
                </div>
              )}

              {step === 'listening' && (
                <div className="text-center w-full">
                  <div 
                    onClick={stopRecording}
                    className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
                      {/* سيظهر أيقونة التوقف (مربع) عند تمرير الماوس */}
                      <Mic size={32} className="group-hover:hidden" />
                      <div className="hidden group-hover:block w-8 h-8 bg-white rounded-sm"></div>
                    </div>
                  </div>
                  <h3 className={`text-xl font-black mb-2 text-red-500`}>{t.listening}</h3>
                  <p className={`text-sm font-bold ${textMuted} animate-pulse`}>
                    {language === 'ar' ? '(اضغط على الدائرة الحمراء للإيقاف)' : '(Appuyez pour arrêter)'}
                  </p>
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center w-full">
                  <div className="w-24 h-24 mx-auto relative mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600"><Zap size={32} className="animate-pulse fill-current" /></div>
                  </div>
                  <h3 className={`text-xl font-black mb-2 ${textTitle}`}>{t.processing}</h3>
                </div>
              )}

              {step === 'preview' && mockResult && (
                <div className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center justify-center gap-2 text-emerald-500 mb-4 bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg font-bold text-sm border border-emerald-200"><CheckCircle2 size={18} /> {t.success}</div>
                  
                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} shadow-sm relative mb-6`}>
                    
                    {/* قسم إضافة صورة للخدمة */}
                    <div className="mb-4">
                      <label className={`block w-full h-24 border-2 border-dashed ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'} rounded-xl text-center cursor-pointer transition-colors relative overflow-hidden flex flex-col items-center justify-center`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                        ) : (
                          <Camera size={24} className={`mb-1 ${textMuted}`} />
                        )}
                        <span className={`relative z-10 font-bold text-xs ${imagePreview ? 'text-white drop-shadow-md bg-black/30 px-2 rounded' : textTitle}`}>
                          {language === 'ar' ? 'أضف صورة للعمل (اختياري)' : 'Ajouter une photo (Optionnel)'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files[0];
                          if(file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }} />
                      </label>
                    </div>

                    {/* عرض تفاصيل الخدمة بذكاء حسب لغة الواجهة */}
                    <p className="text-[10px] font-bold text-indigo-500 mb-1 mt-2">
                      {mockResult.category[language] || mockResult.category['fr']}
                    </p>
                    <h4 className={`text-lg font-black mb-2 leading-tight ${textTitle}`}>
                      {mockResult.title[language] || mockResult.title['fr']}
                    </h4>
                    <p className={`text-sm leading-relaxed mb-4 ${textMuted}`}>
                      {mockResult.description[language] || mockResult.description['fr']}
                    </p>
                    
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className={`text-[10px] font-bold ${textMuted}`}>{t.priceNote}</p>
                        
                        {isEditingPrice ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input type="number" autoFocus value={mockResult.price} onChange={e => setMockResult({...mockResult, price: e.target.value})} className="w-24 p-1 text-lg font-black text-emerald-600 bg-white dark:bg-slate-800 border-2 border-emerald-400 rounded-lg outline-none text-center" dir="ltr" />
                            <button onClick={() => setIsEditingPrice(false)} className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600"><Check size={16} /></button>
                          </div>
                        ) : (
                          <p className="text-xl font-black text-emerald-600 mt-1" dir="ltr">{mockResult.price} MAD</p>
                        )}
                      </div>

                      {!isEditingPrice && (
                        <button onClick={() => setIsEditingPrice(true)} className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600'} shadow-sm hover:text-indigo-600`}><Edit3 size={16} /></button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={() => setStep('idle')} className={`flex-1 py-3.5 rounded-xl font-bold text-sm border-2 ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>{t.retry}</button>
                    <button onClick={() => { onPublish && onPublish({ ...mockResult, image: imageFile }); handleClose(); }} className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg"><Check size={18} /> {t.publish}</button>
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