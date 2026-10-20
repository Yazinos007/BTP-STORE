import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { Users, MessageCircle, ImageIcon, BellRing, Camera, Send, Loader2, CheckCircle2 } from 'lucide-react';

const translations = {
  ar: {
    welcome: "مرحباً بك يا معلم",
    subtitle: "إليك ملخص سريع لنشاطك على منصة SouqBTP",
    clients: "عملاؤك",
    clientsDesc: "إجمالي الأشخاص الذين تواصلوا معك.",
    messages: "الرسائل",
    messagesDesc: "إجمالي الرسائل المتبادلة.",
    portfolio: "معرض الأعمال",
    portfolioDesc: "عدد المشاريع المضافة في معرضك.",
    leads: "الطلبات الجديدة",
    leadsDesc: "المحادثات المفتوحة حالياً.",
    reportTitle: "📸 إرسال تقرير مصور من الورشة",
    selectClientLabel: "👤 اختر العميل (صاحب المشروع):",
    selectClientPlaceholder: "-- اختر العميل --",
    descLabel: "📝 وصف التحديث (ماذا أنجزت؟):",
    descPlaceholder: "مثال: تم الانتهاء من الزليج في الطابق الأول...",
    uploadBtn: "📷 التقاط / اختيار صورة من الورشة",
    submitBtn: "🚀 رفع الصورة وإرسال التقرير للعميل",
    sending: "جاري الإرسال...",
    successMsg: "✅ تم إرسال التقرير للعميل بنجاح!",
    errorMsg: "❌ حدث خطأ، يرجى المحاولة لاحقاً.",
    validationErr: "⚠️ الرجاء اختيار العميل وإضافة صورة للتقرير!"
  },
  fr: {
    welcome: "Bienvenue Maître",
    subtitle: "Voici un résumé rapide de votre activité sur SouqBTP",
    clients: "Vos Clients",
    clientsDesc: "Total des personnes vous ayant contacté.",
    messages: "Messages",
    messagesDesc: "Total des messages échangés.",
    portfolio: "Vos Réalisations",
    portfolioDesc: "Nombre de projets ajoutés.",
    leads: "Nouvelles Demandes",
    leadsDesc: "Conversations actuellement ouvertes.",
    reportTitle: "📸 Envoyer un rapport photo du chantier",
    selectClientLabel: "👤 Sélectionnez le client :",
    selectClientPlaceholder: "-- Choisir un client --",
    descLabel: "📝 Description (Qu'avez-vous accompli ?) :",
    descPlaceholder: "Ex: Le carrelage du 1er étage est terminé...",
    uploadBtn: "📷 Prendre / Choisir une photo",
    submitBtn: "🚀 Envoyer le rapport au client",
    sending: "Envoi en cours...",
    successMsg: "✅ Rapport envoyé avec succès !",
    errorMsg: "❌ Une erreur s'est produite.",
    validationErr: "⚠️ Veuillez choisir un client et ajouter une photo !"
  },
  en: {
    welcome: "Welcome Master",
    subtitle: "Here is a quick summary of your activity on SouqBTP",
    clients: "Your Clients",
    clientsDesc: "Total people who contacted you.",
    messages: "Messages",
    messagesDesc: "Total messages exchanged.",
    portfolio: "Portfolio",
    portfolioDesc: "Number of projects added.",
    leads: "New Requests",
    leadsDesc: "Currently open conversations.",
    reportTitle: "📸 Send a photo report from the site",
    selectClientLabel: "👤 Select Client:",
    selectClientPlaceholder: "-- Select Client --",
    descLabel: "📝 Update description (What did you achieve?):",
    descPlaceholder: "E.g., Finished tiling on the first floor...",
    uploadBtn: "📷 Take / Choose a photo",
    submitBtn: "🚀 Send Report to Client",
    sending: "Sending...",
    successMsg: "✅ Report sent successfully!",
    errorMsg: "❌ An error occurred.",
    validationErr: "⚠️ Please select a client and add a photo!"
  }
};

export default function ProviderDashboard() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [providerId, setProviderId] = useState(null);
  const [providerName, setProviderName] = useState('');
  
  // إحصائيات
  const [stats, setStats] = useState({ clients: 0, messages: 0, portfolio: 0, leads: 0 });
  const [activeClients, setActiveClients] = useState([]);

  // نموذج التقرير
  const [selectedClientCid, setSelectedClientCid] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ show: false, type: '', text: '' });
  const fileInputRef = useRef(null);

  // 1. جلب الهوية والإحصائيات
  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // جلب بيانات الحرفي
      const { data: provData } = await supabase
        .from('providers')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const pid = provData?.id || user.id;
      setProviderId(pid);
      setProviderName(provData?.full_name || 'ياسين ياسين'); // Fallback from screenshot

      // جلب المحادثات (العملاء)
      const { data: convs } = await supabase
        .from('conversations')
        .select('id, client_name')
        .eq('provider_id', pid);

      if (convs) {
        setActiveClients(convs);
        setStats(prev => ({ ...prev, clients: convs.length, leads: convs.length }));
        
        // جلب إجمالي الرسائل
        let totalMsgs = 0;
        for (const c of convs) {
          const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('conversation_id', c.id);
          totalMsgs += (count || 0);
        }
        setStats(prev => ({ ...prev, messages: totalMsgs }));
      }

      // جلب عدد أعمال المعرض (Portfolio)
      const { count: portCount } = await supabase
        .from('provider_portfolio')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', pid);
        
      setStats(prev => ({ ...prev, portfolio: portCount || 0 }));
    };

    fetchDashboardData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // إرسال التقرير (يُرفع كصورة في الشات)
  const submitReport = async (e) => {
    e.preventDefault();
    if (!selectedClientCid || !selectedImage) {
      setAlertMsg({ show: true, type: 'error', text: t.validationErr });
      return;
    }

    setIsSubmitting(true);
    setAlertMsg({ show: false, type: '', text: '' });

    try {
      // 1. رفع الصورة
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `report_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('project-files').getPublicUrl(fileName);
      const imageUrl = publicUrlData.publicUrl;

      // 2. صياغة الرسالة
      const finalMessage = `📸 **تقرير مصور من الورشة**\n\n${reportDesc}\n\n${imageUrl}`;

      // 3. إدراجها في الشات
      await supabase.from('messages').insert([
        {
          conversation_id: parseInt(selectedClientCid),
          sender_type: 'provider',
          content: finalMessage,
          is_read: false
        }
      ]);

      // تحديث آخر رسالة في المحادثة
      await supabase.from('conversations').update({ last_message: '📸 تقرير مصور جديد' }).eq('id', selectedClientCid);

      // تصفير الفورم
      setReportDesc('');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedClientCid('');
      setAlertMsg({ show: true, type: 'success', text: t.successMsg });

    } catch (err) {
      setAlertMsg({ show: true, type: 'error', text: t.errorMsg });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setAlertMsg({ show: false, type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🌟 الترحيب */}
      <div className="text-center md:text-right mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
          {t.welcome} <span className="text-blue-600">{providerName}</span> 👷
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">{t.subtitle}</p>
      </div>

      {/* 📊 البطاقات الإحصائية (مطابقة للصورة تماماً) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border-b-4 border-blue-500 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-slate-700">{t.clients}</h3>
            <Users className="text-blue-500 w-6 h-6" />
          </div>
          <div className="text-4xl font-black text-slate-800 text-center mb-2">{stats.clients}</div>
          <p className="text-xs text-slate-400 text-center">{t.clientsDesc}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-b-4 border-emerald-500 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-slate-700">{t.messages}</h3>
            <MessageCircle className="text-emerald-500 w-6 h-6" />
          </div>
          <div className="text-4xl font-black text-slate-800 text-center mb-2">{stats.messages}</div>
          <p className="text-xs text-slate-400 text-center">{t.messagesDesc}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-b-4 border-amber-500 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-slate-700">{t.portfolio}</h3>
            <ImageIcon className="text-amber-500 w-6 h-6" />
          </div>
          <div className="text-4xl font-black text-slate-800 text-center mb-2">{stats.portfolio}</div>
          <p className="text-xs text-slate-400 text-center">{t.portfolioDesc}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-b-4 border-rose-500 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-slate-700">{t.leads}</h3>
            <BellRing className="text-rose-500 w-6 h-6" />
          </div>
          <div className="text-4xl font-black text-slate-800 text-center mb-2">{stats.leads}</div>
          <p className="text-xs text-slate-400 text-center">{t.leadsDesc}</p>
        </div>

      </div>

      {/* 📸 إرسال تقرير مصور من الورشة (مطابق للصورة تماماً) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mt-10">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-8 flex items-center gap-2 border-b border-slate-100 pb-4">
          {t.reportTitle}
        </h2>

        {alertMsg.show && (
          <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-2 ${alertMsg.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
            {alertMsg.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {alertMsg.text}
          </div>
        )}

        <form onSubmit={submitReport} className="space-y-6">
          
          {/* اختيار العميل */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t.selectClientLabel}</label>
            <select 
              value={selectedClientCid}
              onChange={(e) => setSelectedClientCid(e.target.value)}
              className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all font-medium text-slate-700"
            >
              <option value="">{t.selectClientPlaceholder}</option>
              {activeClients.map(client => (
                <option key={client.id} value={client.id}>{client.client_name}</option>
              ))}
            </select>
          </div>

          {/* وصف التحديث */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t.descLabel}</label>
            <textarea 
              rows="3"
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder={t.descPlaceholder}
              className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-medium resize-none"
            ></textarea>
          </div>

          {/* التقاط / رفع الصورة */}
          <div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageChange}
            />
            
            {!imagePreview ? (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 md:py-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:border-amber-400 transition-colors flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-amber-600 font-bold"
              >
                <Camera className="w-8 h-8" />
                <span>{t.uploadBtn}</span>
              </button>
            ) : (
              <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                <img src={imagePreview} alt="Report Preview" className="w-full h-auto object-cover" />
                <button 
                  type="button"
                  onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                  className="absolute top-3 right-3 bg-white/90 text-rose-600 p-2 rounded-full shadow-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✖
                </button>
              </div>
            )}
          </div>

          {/* زر الإرسال البرتقالي */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-black text-lg shadow-[0_5px_15px_rgba(245,158,11,0.3)] transition-transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            {isSubmitting ? t.sending : t.submitBtn}
          </button>

        </form>
      </div>

    </div>
  );
}