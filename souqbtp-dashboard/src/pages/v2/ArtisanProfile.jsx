import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, MessageSquare, PhoneCall, Edit, Save, Plus, Trash2, Loader2 } from 'lucide-react';

export default function ArtisanProfile() {
  const { id } = useParams(); // ID الحرفي من الرابط
  const navigate = useNavigate();
  
  const [artisan, setArtisan] = useState({});
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // حالة (State) للخدمة الجديدة التي يريد الحرفي إضافتها
  const [newService, setNewService] = useState({ service_name: '', description: '', starting_price: '' });

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    
    // 1. معرفة من هو المستخدم الحالي الذي يتصفح
    const { data: { user } } = await supabase.auth.getUser();
    // UUID احتياطي في حال لم تكن مسجل الدخول (لأغراض التجربة)
    const loggedInUserId = user ? user.id : '9e85d1a0-918f-4c26-a78a-42ad05186b51'; 
    setCurrentUserId(loggedInUserId);

    // إذا لم يكن هناك ID في الرابط، اعرض بروفايل المستخدم الحالي
    const profileId = id || loggedInUserId; 

    // 2. جلب البيانات
    const { data: artisanData } = await supabase.from('suppliers').select('*').eq('id', profileId).single();
    if (artisanData) setArtisan(artisanData);

    const { data: servicesData } = await supabase.from('provider_services').select('*').eq('provider_id', profileId);
    if (servicesData) setServices(servicesData);

    setIsLoading(false);
  };

  // 🚀 دالة حفظ التعديلات في قاعدة البيانات
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

  // 🚀 دالة إضافة خدمة جديدة
  const handleAddService = async () => {
    if (!newService.service_name || !newService.starting_price) return alert("يرجى إدخال اسم الخدمة والسعر");
    
    const { data, error } = await supabase.from('provider_services').insert({
      provider_id: artisan.id,
      service_name: newService.service_name,
      description: newService.description,
      starting_price: newService.starting_price
    }).select().single();

    if (data) {
      setServices([...services, data]);
      setNewService({ service_name: '', description: '', starting_price: '' }); // تفريغ الخانات
    }
  };

  // 🚀 دالة حذف خدمة
  const handleDeleteService = async (serviceId) => {
    if (window.confirm("هل تريد حذف هذه الخدمة؟")) {
      await supabase.from('provider_services').delete().eq('id', serviceId);
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  // 🚀 دالة طلب عرض سعر (تنقل المقاول للشات)
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  // التحقق مما إذا كان الزائر هو نفسه صاحب البروفايل ليتمكن من التعديل
  const isOwner = currentUserId === artisan.id;

  return (
    <div className="max-w-5xl mx-auto p-4 animate-fade-in" dir="rtl">
      
      {/* 🚀 رأس الصفحة (Header) */}
      <div className="bg-slate-900 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center text-white mb-6 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <img src={artisan.logo_url || 'https://ui-avatars.com/api/?name='+artisan.store_name+'&background=0D8ABC&color=fff'} alt="logo" className="w-24 h-24 rounded-full bg-white object-cover border-4 border-slate-700" />
          <div>
            {isEditing ? (
               <input type="text" value={artisan.store_name || ''} onChange={e => setArtisan({...artisan, store_name: e.target.value})} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 mb-2 text-xl font-black text-white w-full" placeholder="اسم الشركة أو الحرفي" />
            ) : (
              <h1 className="text-3xl font-black flex items-center gap-2">
                {artisan.store_name || 'اسم الحرفي'}
                {artisan.tier === 'pro' && <ShieldCheck className="text-emerald-500" size={24} title="موثق" />}
              </h1>
            )}
            
            {isEditing ? (
               <input type="text" value={artisan.category || ''} onChange={e => setArtisan({...artisan, category: e.target.value})} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 mb-1 text-sm text-emerald-400 w-full" placeholder="فئة العمل (مثال: كهربائي)" />
            ) : (
              <p className="text-emerald-400 font-bold">{artisan.category || 'فئة غير محددة'}</p>
            )}

            <div className="flex gap-4 mt-2 text-sm text-slate-400 font-bold">
              {isEditing ? (
                 <input type="text" value={artisan.address || ''} onChange={e => setArtisan({...artisan, address: e.target.value})} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 w-full" placeholder="العنوان أو المدينة" />
              ) : (
                 <span>📍 {artisan.address || 'لم يتم تحديد العنوان'}</span>
              )}
              {!isEditing && <span>⭐ {artisan.rating || '5.0'} ({artisan.reviews_count || 12} تقييم)</span>}
            </div>
          </div>
        </div>
        
        {/* زر تعديل البروفايل (يظهر لصاحب الحساب فقط) */}
        {isOwner && (
          <div className="mt-4 md:mt-0 relative z-10">
            {isEditing ? (
              <button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} حفظ التغييرات
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold py-2 px-6 rounded-xl flex items-center gap-2">
                <Edit size={18} /> تعديل البروفايل
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 🚀 العمود الأيمن: حول الحرفي والخدمات */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-3xl p-6 shadow-sm">
            <h2 className="font-black text-xl mb-3">حول الحرفي (À propos)</h2>
            {isEditing ? (
              <textarea value={artisan.about_text || ''} onChange={e => setArtisan({...artisan, about_text: e.target.value})} className="w-full bg-slate-50 border rounded-xl p-3 h-32 outline-none focus:border-emerald-500" placeholder="اكتب نبذة عن خبرتك وعملك..."></textarea>
            ) : (
              <p className="text-slate-600 leading-relaxed font-medium">{artisan.about_text || 'لا يتوفر وصف حالياً.'}</p>
            )}
          </div>

          <div className="bg-white border rounded-3xl p-6 shadow-sm">
            <h2 className="font-black text-xl mb-4">الخدمات والأسعار</h2>
            
            {/* واجهة إدخال خدمة جديدة (تظهر في وضع التعديل فقط) */}
            {isEditing && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Plus size={16}/> إضافة خدمة جديدة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input type="text" placeholder="اسم الخدمة (مثال: تركيب كهرباء)" value={newService.service_name} onChange={e => setNewService({...newService, service_name: e.target.value})} className="border rounded-lg p-2 text-sm outline-none focus:border-emerald-500" />
                  <input type="number" placeholder="السعر المبدئي (MAD)" value={newService.starting_price} onChange={e => setNewService({...newService, starting_price: e.target.value})} className="border rounded-lg p-2 text-sm outline-none focus:border-emerald-500" dir="rtl" />
                </div>
                <input type="text" placeholder="وصف قصير للخدمة..." value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="border rounded-lg p-2 text-sm w-full mb-3 outline-none focus:border-emerald-500" />
                <button onClick={handleAddService} className="w-full bg-slate-800 text-white rounded-lg py-2 text-sm font-bold hover:bg-slate-700">إضافة للقائمة</button>
              </div>
            )}

            {/* قائمة الخدمات */}
            {services.length > 0 ? (
              <div className="space-y-3">
                {services.map(service => (
                  <div key={service.id} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 flex justify-between items-center group hover:border-emerald-200 transition-colors">
                    <div>
                      <h4 className="font-black text-lg text-slate-800">{service.service_name}</h4>
                      <p className="text-sm text-slate-500 mb-2 font-medium">{service.description}</p>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">ابتداءً من {service.starting_price} MAD</span>
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <button onClick={() => handleDeleteService(service.id)} className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={18}/></button>
                      ) : (
                        <button onClick={() => handleRequestQuote(service)} className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all hover:scale-105 shadow-md shadow-emerald-500/20">طلب عرض</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-6 font-bold bg-slate-50 rounded-xl">لا توجد خدمات مضافة حتى الآن.</p>
            )}
          </div>
        </div>

        {/* 🚀 العمود الأيسر: الإجراءات ومعلومات الثقة */}
        <div className="space-y-4">
          {!isEditing && !isOwner && (
            <>
              <button onClick={() => handleRequestQuote()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition-transform hover:scale-[1.02] shadow-xl shadow-blue-500/20">
                <MessageSquare size={20} /> طلب عرض سعر عام
              </button>
              <button className="w-full bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-colors">
                <PhoneCall size={20} /> تواصل هاتفي
              </button>
            </>
          )}

          <div className="bg-white border rounded-3xl p-6 mt-6 shadow-sm">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" /> جواز الثقة
            </h3>
            <ul className="space-y-3 text-sm font-bold text-slate-600">
              <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span> الهوية موثقة</li>
              <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span> السجل التجاري موثق</li>
              <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span> الهاتف موثق</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}