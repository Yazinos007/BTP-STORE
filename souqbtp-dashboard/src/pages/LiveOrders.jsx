import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { Package, MapPin, CheckCircle, Clock, Phone, AlertCircle, Loader2, Navigation, XCircle } from 'lucide-react';

export default function LiveOrders() {
  const [requests, setRequests] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  const { language } = useSettingsStore();

  useEffect(() => {
    fetchRequests();
    
    // 🌟 تفعيل الرادار اللحظي (Real-time) لاستقبال الطلبات الجديدة فوراً
    const channel = supabase
      .channel('supply-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'supply_requests' }, (payload) => {
        setRequests((current) => [payload.new, ...current]);
        fetchMerchantData(payload.new.merchant_id);
        // تشغيل صوت تنبيه خفيف عند وصول طلب جديد
        const audio = new Audio('/notification.mp3'); // يمكنك إضافة ملف صوتي لاحقاً
        audio.play().catch(e => console.log("الصوت محظور من المتصفح"));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setRequests(data);
        // جلب بيانات التجار أصحاب الطلبات
        const merchantIds = [...new Set(data.map(req => req.merchant_id))];
        merchantIds.forEach(id => fetchMerchantData(id));
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMerchantData = async (id) => {
    if (!id || merchants[id]) return;
    const { data } = await supabase.from('suppliers').select('store_name, phone').eq('id', id).single();
    if (data) {
      setMerchants(prev => ({ ...prev, [id]: data }));
    }
  };

  const handleAcceptOrder = async (id) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('supply_requests')
        .update({ status: 'confirmed' })
        .eq('id', id);
        
      if (error) throw error;
      
      // تحديث الواجهة محلياً
      setRequests(requests.map(req => req.id === id ? { ...req, status: 'confirmed' } : req));
      
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectOrder = async (id) => {
    const confirmMsg = language === 'fr' ? 'Refuser et supprimer cette commande ?' : 'هل أنت متأكد من رفض وحذف هذا الطلب؟';
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const { error } = await supabase.from('supply_requests').delete().eq('id', id);
      if (error) throw error;
      setRequests(requests.filter(req => req.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + err.message);
    }
  };

  const openGoogleMaps = (location) => {
    if (!location || !location.lat || !location.lng) {
      return alert(language === 'fr' ? "Position GPS non disponible" : "موقع الـ GPS غير متوفر لهذا الطلب");
    }
    
    // 🌟 الرابط الرسمي المباشر (سيأخذك للمغرب فوراً!)
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Package className="text-blue-500" size={32} />
            {language === 'fr' ? 'Commandes en Temps Réel' : 'الطلبات اللحظية المباشرة'}
          </h2>
          <p className="text-slate-400 mt-1 font-medium">
            {language === 'fr' ? 'Gérez les demandes de réapprovisionnement des détaillants.' : 'شاشة الرادار لاستقبال ومعالجة طلبات التجار.'}
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>
          <span className="text-sm font-bold text-blue-400">{requests.length} {language === 'fr' ? 'Commandes' : 'طلبات'}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-blue-500" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-16 text-center">
          <AlertCircle size={48} className="text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">{language === 'fr' ? 'Aucune commande' : 'لا توجد طلبات حالياً'}</h3>
          <p className="text-slate-400">{language === 'fr' ? 'Les nouvelles commandes apparaîtront ici.' : 'طلبات التزويد الجديدة ستظهر هنا فور وصولها.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {requests.map((req) => {
            const isPending = req.status === 'pending';
            const merchantInfo = merchants[req.merchant_id] || { store_name: 'Chargement...', phone: '' };
            
            return (
              <div key={req.id} className={`bg-slate-800/80 backdrop-blur-xl border ${isPending ? 'border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-slate-700'} rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-600`}>
                
                {/* رأس البطاقة */}
                <div className={`p-4 border-b ${isPending ? 'border-orange-500/20 bg-orange-500/5' : 'border-slate-700 bg-slate-800/50'} flex justify-between items-center`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPending ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {isPending ? <Clock size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">PO #{req.id.split('-')[0].toUpperCase()}</h4>
                      <p className="text-xs text-slate-400 font-medium">{new Date(req.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isPending ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {isPending ? (language === 'fr' ? 'En Attente' : 'قيد الانتظار') : (language === 'fr' ? 'Confirmé' : 'تم التأكيد')}
                  </div>
                </div>

                {/* محتوى البطاقة (تفاصيل التاجر والطلب) */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1">{language === 'fr' ? 'Client (Détaillant)' : 'العميل (التاجر)'}</p>
                      <h3 className="text-xl font-black text-white">{merchantInfo.store_name}</h3>
                      {merchantInfo.phone && <p className="text-slate-400 flex items-center gap-2 mt-1 text-sm"><Phone size={14}/> {merchantInfo.phone}</p>}
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold text-slate-500 mb-1">{language === 'fr' ? 'Montant Total' : 'القيمة الإجمالية'}</p>
                      <h3 className="text-2xl font-black text-emerald-400">{Number(req.total_amount).toLocaleString()} <span className="text-sm">DH</span></h3>
                    </div>
                  </div>

                  {/* قائمة السلع */}
                  <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">{language === 'fr' ? 'Articles Demandés' : 'السلع المطلوبة'}</p>
                    <ul className="space-y-2">
                      {req.items && req.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-slate-300 font-medium">{item.name}</span>
                          <span className="text-white font-bold bg-slate-800 px-2 py-1 rounded-md">{item.quantity} {language === 'fr' ? 'Unités' : 'وحدة'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* الأزرار (المصافحة والخريطة والرفض) */}
                  <div className="flex gap-3 mt-4">
                    {/* زر الخريطة */}
                    <button 
                      onClick={() => openGoogleMaps(req.location_data)}
                      disabled={!req.location_data}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all"
                    >
                      <Navigation size={18}/> {language === 'fr' ? 'GPS' : 'الموقع'}
                    </button>
                    
                    {/* أزرار القبول والرفض */}
                    {isPending && (
                      <>
                        <button 
                          onClick={() => handleRejectOrder(req.id)}
                          className="px-4 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 rounded-xl font-bold flex justify-center items-center transition-all"
                          title="رفض الطلب"
                        >
                          <XCircle size={20}/>
                        </button>
                        
                        <button 
                          onClick={() => handleAcceptOrder(req.id)}
                          disabled={processingId === req.id}
                          className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                        >
                          {processingId === req.id ? <Loader2 size={18} className="animate-spin"/> : <><CheckCircle size={18}/> {language === 'fr' ? 'Accepter' : 'قبول الطلب'}</>}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}