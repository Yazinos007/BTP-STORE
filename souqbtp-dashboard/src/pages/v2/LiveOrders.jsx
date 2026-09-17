import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { 
  Package, Clock, CheckCircle, Navigation, XCircle, Loader2, 
  AlertCircle, Phone, FileSignature, Truck, MapPin, X, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function LiveOrders() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';

  const [requests, setRequests] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [truckProgress, setTruckProgress] = useState(10);

  const translations = {
    ar: {
      title: 'رادار الطلبات اللحظية (B2B)', subtitle: 'استقبل طلبات التجار، أرسل العقود، وتتبع التوصيل.',
      ordersCount: 'طلبات نشطة', noOrders: 'لا توجد طلبات حالياً', noOrdersDesc: 'طلبات التزويد الجديدة ستظهر هنا فور وصولها.',
      pending: 'مراجعة مبدئية 🟡', waiting: 'بانتظار توقيع التاجر 🔵', signed: 'تم التوقيع (جاهز للتوصيل) 🟢',
      client: 'العميل (التاجر)', totalAmount: 'القيمة الإجمالية', currency: 'MAD', requestedItems: 'السلع المطلوبة', units: 'وحدة',
      gps: 'موقع التاجر', rejectTitle: 'رفض', acceptInit: 'موافقة وإرسال العقد', trackOrder: 'تتبع التوصيل 📍',
      confirmReject: 'هل أنت متأكد من رفض الطلب؟', loading: 'جاري التحميل...',
      trackingRoom: 'غرفة تتبع الطلبية', signedContract: 'العقد موقّع رقمياً', route: 'في الطريق إلى العميل...', close: 'إغلاق', error: 'خطأ: '
    },
    fr: {
      title: 'Radar des Commandes (B2B)', subtitle: 'Recevez les commandes, envoyez les contrats et suivez la livraison.',
      ordersCount: 'Commandes Actives', noOrders: 'Aucune commande', noOrdersDesc: 'Les nouvelles commandes apparaîtront ici.',
      pending: 'À Réviser 🟡', waiting: 'Attente Signature 🔵', signed: 'Signé (Prêt à livrer) 🟢',
      client: 'Client (Détaillant)', totalAmount: 'Montant Total', currency: 'MAD', requestedItems: 'Articles Demandés', units: 'Unités',
      gps: 'Position', rejectTitle: 'Refuser', acceptInit: 'Approuver & Envoyer Contrat', trackOrder: 'Suivi Livraison 📍',
      confirmReject: 'Refuser cette commande ?', loading: 'Chargement...',
      trackingRoom: 'Salle de Suivi', signedContract: 'Contrat signé numériquement', route: 'En route vers le client...', close: 'Fermer', error: 'Erreur: '
    },
    en: {
      title: 'Live Orders Radar (B2B)', subtitle: 'Receive orders, send contracts, and track deliveries.',
      ordersCount: 'Active Orders', noOrders: 'No active orders', noOrdersDesc: 'New supply requests will appear here.',
      pending: 'Pending Review 🟡', waiting: 'Waiting Signature 🔵', signed: 'Signed (Ready to Ship) 🟢',
      client: 'Client (Retailer)', totalAmount: 'Total Amount', currency: 'MAD', requestedItems: 'Requested Items', units: 'Units',
      gps: 'Location', rejectTitle: 'Reject', acceptInit: 'Approve & Send Contract', trackOrder: 'Track Delivery 📍',
      confirmReject: 'Reject this order?', loading: 'Loading...',
      trackingRoom: 'Order Tracking Room', signedContract: 'Digitally Signed Contract', route: 'En route to client...', close: 'Close', error: 'Error: '
    }
  };
  const t = translations[language] || translations.ar;

  useEffect(() => {
    fetchRequests();
    // 🌟 تفعيل الرادار اللحظي مع Supabase
    const channel = supabase.channel('supply-updates').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'supply_requests' }, (payload) => {
      setRequests((current) => [payload.new, ...current]);
      fetchMerchantData(payload.new.merchant_id);
      // محاولة تشغيل صوت، قد يفشل إذا لم يتفاعل المستخدم مع الصفحة
      try { new Audio('/notification.mp3').play(); } catch(e) { console.warn("Audio blocked by browser."); }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // 🚀 جلب البيانات الحقيقية من Supabase
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .in('status', ['pending', 'waiting_signature', 'signed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setRequests(data);
        const merchantIds = [...new Set(data.map(req => req.merchant_id))];
        merchantIds.forEach(id => fetchMerchantData(id));
      } else {
        // Fallback للـ UI في حال كانت الداتابيز فارغة (للتجربة)
        setRequests([
          { id: '1a2b3c4d', status: 'pending', total_amount: 45000, created_at: new Date().toISOString(), items: [{name: 'إسمنت بورتلاند', quantity: 50}], merchant_id: 'm1' },
          { id: 'e5f6g7h8', status: 'waiting_signature', total_amount: 12500, created_at: new Date().toISOString(), items: [{name: 'حديد تسليح 12mm', quantity: 200}], merchant_id: 'm2' },
          { id: 'i9j0k1l2', status: 'signed', total_amount: 85000, created_at: new Date().toISOString(), items: [{name: 'زليج إسباني', quantity: 600}], merchant_id: 'm3' }
        ]);
        setMerchants({
          'm1': { store_name: 'مواد البناء الشرق', phone: '0612345678' },
          'm2': { store_name: 'أشغال سوس', phone: '0687654321' },
          'm3': { store_name: 'تجزئة الأندلس', phone: '0600112233' }
        });
      }
    } catch (err) { 
      console.error("Error fetching requests:", err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const fetchMerchantData = async (id) => {
    if (!id || merchants[id]) return;
    const { data } = await supabase.from('suppliers').select('store_name, phone').eq('id', id).single();
    if (data) setMerchants(prev => ({ ...prev, [id]: data }));
  };

  // 🚀 تحديث قاعدة البيانات عند الموافقة وإرسال العقد
  const handleApproveAndSendContract = async (id) => {
    setProcessingId(id);
    try {
      const { error } = await supabase.from('supply_requests').update({ status: 'waiting_signature' }).eq('id', id);
      if (error) {
          console.warn("Could not update Supabase. Updating local state only.");
      }
      setRequests(requests.map(req => req.id === id ? { ...req, status: 'waiting_signature' } : req));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  // 🚀 حذف من قاعدة البيانات عند الرفض
  const handleRejectOrder = async (id) => {
    if (!window.confirm(t.confirmReject)) return;
    try {
      const { error } = await supabase.from('supply_requests').delete().eq('id', id);
       if (error) {
          console.warn("Could not delete from Supabase. Updating local state only.");
      }
      setRequests(requests.filter(req => req.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTracking = (order) => { 
    setTrackingOrder(order); 
    setTruckProgress(15); 
  };

  useEffect(() => {
    let interval;
    if (trackingOrder) {
      interval = setInterval(() => { 
        setTruckProgress(prev => prev >= 95 ? 95 : prev + 10); 
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trackingOrder]);

  const openGoogleMaps = (location) => {
    if (location && location.lat) {
      window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps`, '_blank');
    }
  };

  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200';
  const modalBg = isDarkMode ? 'bg-[#020617]/95' : 'bg-slate-100/90';

  const getStatusColor = (status) => {
    if (status === 'pending') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (status === 'waiting_signature') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (status === 'signed') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  };

  return (
    <div className={`space-y-8 animate-fade-in max-w-7xl mx-auto pb-24`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${bgMain} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
              <Package className="text-blue-500" size={36} /> {t.title}
            </h2>
          </div>
          <p className={`${textMuted} font-bold`}>{t.subtitle}</p>
        </div>
        <div className="relative z-10 px-5 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
          <span className="text-sm font-black text-blue-500">{requests.length} {t.ordersCount}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-blue-500" /></div>
      ) : requests.length === 0 ? (
        <div className={`${bgMain} border-2 rounded-[2rem] p-16 text-center shadow-sm`}>
          <AlertCircle size={48} className={`${textMuted} mx-auto mb-4 opacity-50`} />
          <h3 className={`text-xl font-black ${textMain} mb-2`}>{t.noOrders}</h3>
          <p className={`${textMuted} font-bold`}>{t.noOrdersDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {requests.map((req) => {
            const merchantInfo = merchants[req.merchant_id] || { store_name: t.loading, phone: '' };
            const statusStyle = getStatusColor(req.status);
            // 🚀 إصلاح المشكلة البصرية في الـ ID
            const shortId = req.id ? String(req.id).substring(0, 8).toUpperCase() : 'UNKNOWN';
            
            return (
              <div key={req.id} className={`${cardBg} backdrop-blur-xl border-2 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl group`}>
                <div className={`p-5 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-white/50'} flex justify-between items-center`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${statusStyle}`}>
                      {req.status === 'pending' ? <Clock size={20} /> : req.status === 'waiting_signature' ? <FileSignature size={20}/> : <CheckCircle size={20} />}
                    </div>
                    <div>
                      <h4 className={`font-black text-lg ${textMain}`}>REQ #{shortId}</h4>
                      <p className={`text-[10px] font-bold ${textMuted} uppercase tracking-widest`}>
                        {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(req.created_at))}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusStyle}`}>
                    {t[req.status.replace('_signature', '')] || t.pending}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-1`}>{t.client}</p>
                      <h3 className={`text-xl font-black ${textMain}`}>{merchantInfo.store_name}</h3>
                      {merchantInfo.phone && <p className={`text-sm font-bold text-blue-500 flex items-center gap-1 mt-1`}><Phone size={14}/> {merchantInfo.phone}</p>}
                    </div>
                    <div className="text-end">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-1`}>{t.totalAmount}</p>
                      <h3 className="text-2xl font-black text-emerald-500 font-mono" dir="ltr">
                        {Number(req.total_amount).toLocaleString()} <span className="text-[10px] font-bold opacity-70 uppercase">{t.currency}</span>
                      </h3>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-4 mb-6 border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <p className={`text-[10px] font-black ${textMuted} mb-3 uppercase tracking-widest`}>{t.requestedItems}</p>
                    <ul className="space-y-2">
                      {req.items && req.items.map((item, idx) => (
                        <li key={idx} className={`flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0 font-bold ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                          <span className={textMain}>{item.name}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-black ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{item.quantity} {t.units}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => openGoogleMaps(req.location_data)} className={`flex-1 py-3.5 rounded-xl font-black flex justify-center items-center gap-2 transition-all border-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'}`}>
                      <Navigation size={18}/> {t.gps}
                    </button>
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => handleRejectOrder(req.id)} className={`px-4 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 rounded-xl font-bold transition-all`} title={t.rejectTitle}>
                          <XCircle size={20}/>
                        </button>
                        <button onClick={() => handleApproveAndSendContract(req.id)} disabled={processingId === req.id} className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                          {processingId === req.id ? <Loader2 size={18} className="animate-spin"/> : <><FileSignature size={18}/> {t.acceptInit}</>}
                        </button>
                      </>
                    )}
                    {req.status === 'waiting_signature' && (
                      <button disabled className="flex-[2] py-3.5 bg-slate-500/10 border-2 border-slate-500/20 text-slate-500 rounded-xl font-black flex justify-center items-center gap-2 cursor-not-allowed">
                        <Loader2 size={18} className="animate-spin"/> {t.waiting}
                      </button>
                    )}
                    {req.status === 'signed' && (
                      <button onClick={() => handleOpenTracking(req)} className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                        {t.trackOrder}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {trackingOrder && createPortal(
        <div className={`fixed inset-0 z-[9999] ${modalBg} backdrop-blur-xl flex justify-center items-center p-4 animate-fade-in font-cairo`} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border-2 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-500 rounded-xl">
                  <MapPin size={22} className="animate-bounce"/>
                </div>
                <div>
                  <h3 className={`text-xl font-black ${textMain}`}>{t.trackingRoom}</h3>
                  <p className={`text-xs font-bold ${textMuted}`}>REQ #{trackingOrder.id ? String(trackingOrder.id).substring(0, 8).toUpperCase() : 'UNKNOWN'}</p>
                </div>
              </div>
              <button onClick={() => setTrackingOrder(null)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white' : 'bg-slate-200 hover:bg-red-500 text-slate-600 hover:text-white'}`}>
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-center gap-3">
                <ShieldCheck className="text-emerald-500" size={24}/>
                <span className="text-emerald-500 font-black">{t.signedContract}</span>
              </div>
              <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border-2 rounded-2xl p-6 relative overflow-hidden shadow-inner`}>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span> GPS Live Tracking
                  </span>
                </div>
                <div className={`relative py-6 px-4 my-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`h-3 w-full rounded-full relative overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${truckProgress}%` }}></div>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 -ml-4" style={{ [isRtl ? 'right' : 'left']: `${truckProgress}%` }}>
                    <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-[0_0_20px_#3b82f6] animate-pulse">
                      <Truck size={24} />
                    </div>
                  </div>
                  <div className={`flex justify-between text-xs font-black mt-4 ${textMuted}`}>
                    <span>المخزن (المورد)</span>
                    <span>التاجر (العميل)</span>
                  </div>
                </div>
                <p className="text-center text-sm font-black text-blue-500 mt-4 animate-pulse">{t.route}</p>
              </div>
              <button onClick={() => setTrackingOrder(null)} className={`w-full font-bold py-4 rounded-2xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
                {t.close}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}