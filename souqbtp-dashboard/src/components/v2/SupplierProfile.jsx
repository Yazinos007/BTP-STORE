import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, MapPin, Star, Clock, CheckCircle2, 
  Image as ImageIcon, MessageSquare, Briefcase, 
  Award, Phone, FileText, X, ThumbsUp, Edit, Save, Plus, Trash2, Loader2
} from 'lucide-react';

export default function SupplierProfile({ isDarkMode = false, language = 'ar', onClose }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const isRtl = language === 'ar';
  
  const [activeTab, setActiveTab] = useState('services');
  const [artisan, setArtisan] = useState({});
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newService, setNewService] = useState({ service_name: '', description: '', starting_price: '' });

  // قاموس الترجمات الخاص بملف المورد
  const t = {
    ar: {
      trustPassport: "جواز الثقة", level: "مستوى التحقق:", businessVerified: "شركة معتمدة",
      verifiedId: "هوية موثقة", verifiedBiz: "سجل تجاري موثق", verifiedPhone: "رقم هاتف موثق",
      verifiedAddress: "عنوان موثق", verifiedPortfolio: "أعمال سابقة موثقة",
      stats: { completed: "مشروع منجز", responseRate: "معدل الاستجابة", responseTime: "وقت الرد", memberSince: "عضو منذ" },
      tabs: { services: "الخدمات والأسعار", portfolio: "معرض الأعمال", reviews: "التقييمات" },
      actions: { quote: "طلب عرض سعر", contact: "مراسلة", close: "إغلاق", edit: "تعديل البروفايل", save: "حفظ التغييرات" },
      about: "نبذة عن الشركة", portfolioEmpty: "لا توجد صور حالياً.", reviewsTitle: "آراء المقاولين"
    },
    fr: {
      trustPassport: "Passeport de Confiance", level: "Niveau :", businessVerified: "Entreprise Vérifiée",
      verifiedId: "Identité vérifiée", verifiedBiz: "RC vérifié", verifiedPhone: "Téléphone vérifié",
      verifiedAddress: "Adresse vérifiée", verifiedPortfolio: "Réalisations vérifiées",
      stats: { completed: "Chantiers", responseRate: "Taux de réponse", responseTime: "Temps de réponse", memberSince: "Membre depuis" },
      tabs: { services: "Services & Tarifs", portfolio: "Réalisations", reviews: "Avis clients" },
      actions: { quote: "Demander un devis", contact: "Contacter", close: "Fermer", edit: "Modifier profil", save: "Enregistrer" },
      about: "À propos", portfolioEmpty: "Aucune photo pour le moment.", reviewsTitle: "Avis des entrepreneurs"
    },
    en: {
      trustPassport: "Trust Passport", level: "Level:", businessVerified: "Verified Business",
      verifiedId: "Verified ID", verifiedBiz: "Verified Business Reg.", verifiedPhone: "Verified Phone",
      verifiedAddress: "Verified Address", verifiedPortfolio: "Verified Portfolio",
      stats: { completed: "Completed Jobs", responseRate: "Response Rate", responseTime: "Response Time", memberSince: "Member Since" },
      tabs: { services: "Services & Pricing", portfolio: "Portfolio", reviews: "Reviews" },
      actions: { quote: "Request Quote", contact: "Contact", close: "Close", edit: "Edit Profile", save: "Save Changes" },
      about: "About", portfolioEmpty: "No photos available yet.", reviewsTitle: "Contractor Reviews"
    }
  }[language] || {};

  // جلب البيانات الديناميكية
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const loggedInUserId = user ? user.id : '9e85d1a0-918f-4c26-a78a-42ad05186b51'; 
      setCurrentUserId(loggedInUserId);

      // إذا كان هناك ID في الرابط نستخدمه، وإلا نستخدم ID المستخدم الحالي
      const profileId = id || loggedInUserId; 

      const { data: artisanData } = await supabase.from('suppliers').select('*').eq('id', profileId).single();
      if (artisanData) setArtisan(artisanData);

      const { data: servicesData } = await supabase.from('provider_services').select('*').eq('provider_id', profileId);
      if (servicesData) setServices(servicesData);

      setIsLoading(false);
    };
    fetchProfileData();
  }, [id]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('suppliers').update({
      store_name: artisan.store_name,
      category: artisan.category,
      address: artisan.address,
      about_text: artisan.about_text
    }).eq('id', artisan.id);

    if (!error) setIsEditing(false);
    setIsSaving(false);
  };

  const handleAddService = async () => {
    if (!newService.service_name || !newService.starting_price) return alert("يرجى إدخال اسم الخدمة والسعر");
    const { data, error } = await supabase.from('provider_services').insert({
      provider_id: artisan.id, service_name: newService.service_name, description: newService.description, starting_price: newService.starting_price
    }).select().single();

    if (data) {
      setServices([...services, data]);
      setNewService({ service_name: '', description: '', starting_price: '' }); 
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm("هل تريد حذف هذه الخدمة؟")) {
      await supabase.from('provider_services').delete().eq('id', serviceId);
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleRequestQuote = (service = null) => {
    const requestPayload = {
      items: [{
        product: {
          name: service ? service.service_name : "طلب عرض سعر عام",
          supplier: artisan.store_name || "مورد",
          price: service ? service.starting_price : 0,
          currency: 'MAD'
        },
        qty: 1
      }],
      isServiceRequest: true,
      artisanId: artisan.id
    };
    navigate('/messages', { state: { cartOrder: requestPayload } });
  };

  const isOwner = currentUserId === artisan.id;
  const bgMain = isDarkMode ? 'bg-slate-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  // صور افتراضية في حال لم يقم الحرفي برفعها بعد
  const defaultCover = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200";
  const defaultAvatar = artisan.store_name ? `https://ui-avatars.com/api/?name=${artisan.store_name}&background=10b981&color=fff` : "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400";

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-emerald-500" size={50} /></div>;

  return (
    <div className={`w-full max-w-6xl mx-auto shadow-2xl overflow-hidden ${bgMain} flex flex-col my-10 rounded-3xl animate-fade-in`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* --- Header (Cover + Avatar + Basic Info) --- */}
      <div className="relative h-64 md:h-80 w-full bg-slate-800">
        <img src={defaultCover} alt="Cover" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        {/* زر التعديل لصاحب الحساب يظهر فوق الغلاف */}
        {isOwner && (
          <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} z-50`}>
            {isEditing ? (
              <button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} {t.actions.save}
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-slate-900/80 backdrop-blur border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg">
                <Edit size={18} /> {t.actions.edit}
              </button>
            )}
          </div>
        )}

        {/* زر الإغلاق إذا تم فتحه كـ Modal */}
        {onClose && !isOwner && (
          <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110`}>
            <X size={24} />
          </button>
        )}
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1 shrink-0 shadow-xl z-10 relative">
            <img src={artisan.logo_url || defaultAvatar} alt={artisan.store_name} className="w-full h-full rounded-xl object-cover" />
            {(artisan.tier === 'pro' || artisan.tier === 'business') && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                <ShieldCheck size={20} />
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              {isEditing ? (
                <input type="text" value={artisan.store_name || ''} onChange={e => setArtisan({...artisan, store_name: e.target.value})} className="bg-slate-900/80 border border-slate-600 rounded px-3 py-1 text-2xl font-black text-white outline-none focus:border-emerald-500" placeholder="اسم الشركة أو الحرفي" />
              ) : (
                <h1 className="text-2xl md:text-3xl font-black text-white">{artisan.store_name || 'اسم الحرفي'}</h1>
              )}
              
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Award size={14} /> {t.businessVerified}
              </span>
            </div>
            
            {isEditing ? (
              <input type="text" value={artisan.category || ''} onChange={e => setArtisan({...artisan, category: e.target.value})} className="bg-slate-900/80 border border-slate-600 rounded px-3 py-1 mb-2 text-sm text-emerald-400 outline-none focus:border-emerald-500 block w-64" placeholder="فئة العمل (مثال: كهربائي)" />
            ) : (
              <p className="text-emerald-400 font-bold text-sm md:text-base mb-2">{artisan.category || 'فئة غير محددة'}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              {isEditing ? (
                <input type="text" value={artisan.address || ''} onChange={e => setArtisan({...artisan, address: e.target.value})} className="bg-slate-900/80 border border-slate-600 rounded px-3 py-1 text-white outline-none focus:border-emerald-500" placeholder="العنوان أو المدينة" />
              ) : (
                <span className="flex items-center gap-1"><MapPin size={16} /> {artisan.address || 'العنوان غير محدد'}</span>
              )}
              {!isEditing && <span className="flex items-center gap-1 text-amber-400"><Star size={16} className="fill-current" /> {artisan.rating || '5.0'} ({artisan.reviews_count || 0} avis)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Layout --- */}
      <div className="flex flex-col lg:flex-row p-6 md:p-8 gap-8">
        
        {/* Left Sidebar (Trust Passport & Stats) */}
        <div className="w-full lg:w-1/3 space-y-6">
          
          {/* Quick Actions (يظهر للزبون فقط وليس لصاحب الحساب) */}
          {!isOwner && !isEditing && (
            <div className="flex flex-col gap-3">
              <button onClick={() => handleRequestQuote()} className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <FileText size={18} /> {t.actions.quote}
              </button>
              <button className={`w-full py-3.5 rounded-xl font-bold transition-colors border-2 flex items-center justify-center gap-2 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-800'}`}>
                <MessageSquare size={18} /> {t.actions.contact}
              </button>
            </div>
          )}

          {/* TRUST PASSPORT */}
          <div className={`p-6 rounded-2xl border ${bgCard} shadow-sm`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className={`font-black text-lg ${textTitle}`}>{t.trustPassport}</h3>
                <p className={`text-xs ${textMuted}`}>{t.level} <span className="text-emerald-500 font-bold">{t.businessVerified}</span></p>
              </div>
            </div>
            
            <ul className="space-y-4 text-sm">
              <li className={`flex items-center gap-3 ${textTitle}`}><CheckCircle2 size={18} className="text-emerald-500" /> {t.verifiedId}</li>
              <li className={`flex items-center gap-3 ${textTitle}`}><CheckCircle2 size={18} className="text-emerald-500" /> {t.verifiedBiz}</li>
              <li className={`flex items-center gap-3 ${textTitle}`}><CheckCircle2 size={18} className="text-emerald-500" /> {t.verifiedPhone}</li>
            </ul>
          </div>

          {/* STATS */}
          <div className={`p-6 rounded-2xl border ${bgCard} shadow-sm grid grid-cols-2 gap-4`}>
            <div>
              <p className={`text-xs ${textMuted} mb-1`}>{t.stats.completed}</p>
              <p className={`font-black text-xl ${textTitle}`}>{artisan.completed_projects || 12}</p>
            </div>
            <div>
              <p className={`text-xs ${textMuted} mb-1`}>{t.stats.responseRate}</p>
              <p className={`font-black text-xl text-emerald-500`}>{artisan.response_rate || '95'}%</p>
            </div>
            <div>
              <p className={`text-xs ${textMuted} mb-1`}>{t.stats.responseTime}</p>
              <p className={`font-black text-xl ${textTitle}`}>{artisan.response_time || '< 30 mins'}</p>
            </div>
          </div>
        </div>

        {/* Right Content Area (Tabs: Services, Portfolio, Reviews) */}
        <div className="flex-1 flex flex-col">
          
          {/* Tabs Navigation */}
          <div className={`flex overflow-x-auto custom-scrollbar gap-2 mb-6 p-1 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
            {[
              { id: 'services', label: t.tabs.services, icon: Briefcase },
              { id: 'portfolio', label: t.tabs.portfolio, icon: ImageIcon },
              { id: 'reviews', label: t.tabs.reviews, icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.id 
                    ? 'border-emerald-500 text-emerald-500' 
                    : `border-transparent ${textMuted} hover:${textTitle}`
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            
            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="animate-fade-in space-y-6">
                
                {/* About Section */}
                <div>
                  <h3 className={`font-black text-lg mb-2 ${textTitle}`}>{t.about}</h3>
                  {isEditing ? (
                    <textarea value={artisan.about_text || ''} onChange={e => setArtisan({...artisan, about_text: e.target.value})} className={`w-full ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} border rounded-xl p-3 h-32 outline-none focus:border-emerald-500`} placeholder="اكتب نبذة عن خبرتك وعملك..."></textarea>
                  ) : (
                    <p className={`text-sm leading-relaxed ${textMuted}`}>{artisan.about_text || 'لا يتوفر وصف حالياً.'}</p>
                  )}
                </div>
                
                {/* إضافة خدمة جديدة (في وضع التعديل) */}
                {isEditing && (
                  <div className={`p-5 rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'}`}>
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Plus size={16}/> إضافة خدمة جديدة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="اسم الخدمة" value={newService.service_name} onChange={e => setNewService({...newService, service_name: e.target.value})} className={`border rounded-lg p-2 text-sm outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} />
                      <input type="number" placeholder="السعر المبدئي (MAD)" value={newService.starting_price} onChange={e => setNewService({...newService, starting_price: e.target.value})} className={`border rounded-lg p-2 text-sm outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} dir="rtl" />
                    </div>
                    <input type="text" placeholder="وصف قصير..." value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className={`border rounded-lg p-2 text-sm w-full mb-3 outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`} />
                    <button onClick={handleAddService} className="w-full bg-emerald-500 text-white rounded-lg py-2 text-sm font-bold hover:bg-emerald-600">حفظ الخدمة</button>
                  </div>
                )}

                {/* قائمة الخدمات */}
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map(service => (
                      <div key={service.id} className={`p-5 rounded-2xl border ${bgCard} hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center justify-between gap-4 group`}>
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg mb-1 ${textTitle}`}>{service.service_name}</h4>
                          <p className={`text-sm ${textMuted} mb-2`}>{service.description}</p>
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>À partir de {service.starting_price} MAD</span>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          {isEditing ? (
                            <button onClick={() => handleDeleteService(service.id)} className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-xl transition-colors"><Trash2 size={18}/></button>
                          ) : !isOwner && (
                            <button onClick={() => handleRequestQuote(service)} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md shadow-emerald-500/20">
                              {t.actions.quote}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${textMuted} p-4 text-center border rounded-xl border-dashed`}>لا توجد خدمات مضافة حتى الآن.</p>
                )}
              </div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
              <div className="animate-fade-in text-center p-10">
                <ImageIcon size={48} className={`mx-auto mb-4 opacity-20 ${textMuted}`} />
                <p className={`${textMuted} font-bold`}>{t.portfolioEmpty}</p>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in text-center p-10">
                <Star size={48} className={`mx-auto mb-4 opacity-20 ${textMuted}`} />
                <p className={`${textMuted} font-bold`}>لا توجد تقييمات حتى الآن.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}