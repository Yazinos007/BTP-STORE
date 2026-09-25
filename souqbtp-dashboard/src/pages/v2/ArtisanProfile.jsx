import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, MessageSquare, PhoneCall } from 'lucide-react'; // افترض وجود هذه الأيقونات

export default function ArtisanProfile() {
  const { id } = useParams(); // الحصول على ID الحرفي من مسار الرابط
  const navigate = useNavigate();
  
  const [artisan, setArtisan] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      
      // 1. جلب بيانات الحرفي من جدول suppliers
      const { data: artisanData, error: artisanError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (artisanData) {
        setArtisan(artisanData);
      }

      // 2. جلب خدمات الحرفي من جدول provider_services (تأكد من اسم الجدول)
      const { data: servicesData, error: servicesError } = await supabase
        .from('provider_services')
        .select('*')
        .eq('provider_id', id); // افترض أن العمود يسمى provider_id

      if (servicesData) {
        setServices(servicesData);
      }

      setIsLoading(false);
    };

    if (id) fetchProfileData();
  }, [id]);

  // 🚀 دالة توجيه طلب عرض السعر إلى صفحة الدردشة
  const handleRequestQuote = (service = null) => {
    let requestPayload;

    if (service) {
      // إذا تم طلب خدمة معينة
      requestPayload = {
        items: [{
          product: {
            name: service.service_name,
            supplier: artisan.store_name, // اسم الحرفي
            price: service.starting_price,
            currency: 'MAD'
          },
          qty: 1
        }],
        isServiceRequest: true,
        artisanId: artisan.id
      };
    } else {
      // إذا تم الضغط على الزر العام (Demander un devis) أعلى الصفحة
       requestPayload = {
        items: [{
          product: {
            name: "طلب عرض سعر عام",
            supplier: artisan.store_name,
            price: 0,
            currency: 'MAD'
          },
          qty: 1
        }],
        isServiceRequest: true,
        artisanId: artisan.id
      };
    }

    // التوجيه إلى صفحة الدردشة مع تمرير بيانات الطلب كـ cartOrder
    navigate('/messages', { state: { cartOrder: requestPayload } });
  };

  if (isLoading) return <div className="p-10 text-center">جاري تحميل الملف الشخصي...</div>;
  if (!artisan) return <div className="p-10 text-center text-red-500">لم يتم العثور على بيانات الحرفي.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 animate-fade-in">
      {/* --- قسم رأس الصفحة (Header) --- */}
      <div className="bg-slate-900 rounded-3xl p-8 flex items-center gap-6 text-white mb-6">
        <img 
          src={artisan.logo_url || '/default-avatar.png'} 
          alt={artisan.store_name} 
          className="w-24 h-24 rounded-full bg-white object-cover border-4 border-slate-700" 
        />
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            {artisan.store_name}
            {/* استخدام حقل tier لجواز الثقة */}
            {artisan.tier === 'pro' && <ShieldCheck className="text-emerald-500" size={24} />}
          </h1>
          <p className="text-emerald-400 font-bold">{artisan.category || 'فئة غير محددة'}</p>
          <div className="flex gap-4 mt-2 text-sm text-slate-400">
            <span>📍 {artisan.address || 'العنوان غير محدد'}</span>
            <span>⭐ {artisan.rating || '0.0'} ({artisan.reviews_count || 0} تقييم)</span>
          </div>
        </div>
      </div>

      {/* --- قسم المحتوى --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* العمود الأيسر: الإجراءات ومعلومات الثقة */}
        <div className="space-y-4">
          <button 
            onClick={() => handleRequestQuote()}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"
          >
            <MessageSquare size={18} /> طلب عرض سعر
          </button>
          
          <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl flex justify-center items-center gap-2">
            <PhoneCall size={18} /> تواصل
          </button>

          {/* جواز الثقة (Passeport de Confiance) */}
          <div className="bg-white border rounded-2xl p-6 mt-6">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" /> جواز الثقة
            </h3>
            <ul className="space-y-3 text-sm font-bold text-slate-600">
              <li className="flex gap-2">✅ الهوية موثقة</li>
              <li className="flex gap-2">✅ السجل التجاري موثق</li>
              <li className="flex gap-2">✅ الهاتف موثق</li>
            </ul>
          </div>
        </div>

        {/* العمود الأيمن: الخدمات والمعلومات (À propos) */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-black text-xl mb-3">حول الحرفي (À propos)</h2>
            <p className="text-slate-600 leading-relaxed">
              {artisan.about_text || 'لا يتوفر وصف حالياً.'}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-black text-xl mb-4">الخدمات والأسعار</h2>
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map(service => (
                  <div key={service.id} className="border rounded-xl p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-black text-lg text-slate-800">{service.service_name}</h4>
                      <p className="text-sm text-slate-500 mb-2">{service.description}</p>
                      <span className="text-xs font-bold text-slate-400">ابتداءً من {service.starting_price} MAD</span>
                    </div>
                    <button 
                      onClick={() => handleRequestQuote(service)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600"
                    >
                      طلب عرض
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">لا توجد خدمات مضافة حتى الآن.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}