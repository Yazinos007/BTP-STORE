import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { Truck, MapPin, CheckCircle, Clock, Navigation, User, Hash, Loader2, ShieldCheck } from 'lucide-react';

export default function Fleet() {
  const [deliveries, setDeliveries] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useSettingsStore();

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      // 🌟 جلب الطلبات الموقعة (signed)، في الطريق (shipped)، أو المكتملة (delivered)
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .in('status', ['signed', 'shipped', 'delivered', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setDeliveries(data);
        const merchantIds = [...new Set(data.map(req => req.merchant_id))];
        merchantIds.forEach(id => fetchMerchantData(id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMerchantData = async (id) => {
    if (!id || merchants[id]) return;
    const { data } = await supabase.from('suppliers').select('store_name, phone').eq('id', id).single();
    if (data) setMerchants(prev => ({ ...prev, [id]: data }));
  };

  useEffect(() => {
    fetchDeliveries();
    const channel = supabase.channel('fleet-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'supply_requests' }, () => {
        fetchDeliveries();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDispatch = async (id) => {
    const driverName = window.prompt(language === 'fr' ? "Nom du chauffeur :" : "اسم السائق (المُوصِّل):");
    if (!driverName) return;
    const driverPhone = window.prompt(language === 'fr' ? "Téléphone du chauffeur :" : "رقم هاتف السائق:");
    if (!driverPhone) return;
    const vehiclePlate = window.prompt(language === 'fr' ? "Matricule du véhicule :" : "رقم لوحة الشاحنة (Matricule):");
    if (!vehiclePlate) return;

    try {
      const { error } = await supabase
        .from('supply_requests')
        // 🌟 إضافة الهاتف هنا
        .update({ status: 'shipped', driver_name: driverName, vehicle_plate: vehiclePlate, driver_phone: driverPhone })
        .eq('id', id);
      if (error) throw error;
      fetchDeliveries();
    } catch (err) { alert("Erreur: " + err.message); }
  };

  const handleMarkDelivered = async (id) => {
    if (!window.confirm(language === 'fr' ? "Confirmer la livraison ?" : "هل تؤكد أن البضاعة تم تسليمها بنجاح؟")) return;
    try {
      const { error } = await supabase.from('supply_requests').update({ status: 'delivered' }).eq('id', id);
      if (error) throw error;
      fetchDeliveries();
    } catch (err) { alert("Erreur: " + err.message); }
  };

  const openGoogleMaps = (location) => {
    if (!location || !location.lat) return alert("GPS non disponible");
    window.open(`https://www.google.com/maps?q=$${location.lat},${location.lng}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Truck className="text-emerald-500" size={32} />
            {language === 'fr' ? 'Flotte & Livraisons' : 'أسطول التوصيل'}
          </h2>
          <p className="text-slate-400 mt-1 font-medium">
            {language === 'fr' ? 'Gérez vos expéditions et suivez les camions.' : 'إدارة الشاحنات وتتبع مسار التوصيل للمحلات.'}
          </p>
        </div>
      </div>

      {isLoading ? (
         <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-emerald-500" /></div>
      ) : deliveries.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-16 text-center">
          <ShieldCheck size={48} className="text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">{language === 'fr' ? 'Aucune expédition' : 'لا توجد شحنات حالياً'}</h3>
          <p className="text-slate-400">{language === 'fr' ? 'Les contrats signés apparaîtront ici pour expédition.' : 'العقود الموقعة ستظهر هنا لتعيين الشاحنات لها.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {deliveries.map(req => {
            const merchantInfo = merchants[req.merchant_id] || { store_name: '...', phone: '' };
            const isSigned = req.status === 'signed';
            const isShipped = req.status === 'shipped';
            const isDelivered = req.status === 'delivered';

            return (
              <div key={req.id} className={`bg-slate-800/80 backdrop-blur-xl border ${isShipped ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-slate-700'} rounded-2xl overflow-hidden transition-all`}>
                
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><ShieldCheck size={20} /></div>
                    <div>
                      <h4 className="text-white font-bold text-lg">PO #{req.id.split('-')[0].toUpperCase()}</h4>
                      <p className="text-xs text-emerald-400 font-bold">✍️ {req.digital_signature}</p>
                    </div>
                  </div>
                  
                  {isSigned && <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-black">{language === 'fr' ? 'Prêt à expédier' : 'جاهز للشحن'}</span>}
                  {isShipped && <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-black animate-pulse">{language === 'fr' ? 'En Route 🚚' : 'في الطريق 🚚'}</span>}
                  {isDelivered && <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-black animate-pulse">{language === 'fr' ? 'Attente Client ⏳' : 'بانتظار تأكيد التاجر ⏳'}</span>}
                  {req.status === 'completed' && <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-black">{language === 'fr' ? 'Clôturé ✅' : 'مكتمل ✅'}</span>}
                </div>

                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500">{language === 'fr' ? 'Destination' : 'الوجهة (التاجر)'}</p>
                      <h3 className="text-xl font-black text-white">{merchantInfo.store_name}</h3>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold text-slate-500">{language === 'fr' ? 'Montant' : 'القيمة'}</p>
                      <h3 className="text-xl font-black text-white">{Number(req.total_amount).toLocaleString()} DH</h3>
                    </div>
                  </div>

                  {/* معلومات السائق تظهر إذا تم الشحن */}
                  {(isShipped || isDelivered) && (
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-6 flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-blue-400 font-bold mb-1 flex items-center gap-1"><User size={14}/> {language === 'fr' ? 'Chauffeur' : 'السائق'}</p>
                        <p className="text-white font-medium">{req.driver_name}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-blue-400 font-bold mb-1 flex items-center gap-1"><Hash size={14}/> {language === 'fr' ? 'Matricule' : 'اللوحة'}</p>
                        <p className="text-white font-medium">{req.vehicle_plate}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => openGoogleMaps(req.location_data)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                      <Navigation size={18}/> GPS
                    </button>
                    
                    {isSigned && (
                      <button onClick={() => handleDispatch(req.id)} className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex justify-center items-center gap-2 shadow-lg shadow-emerald-600/20">
                        <Truck size={18}/> {language === 'fr' ? 'Expédier la commande' : 'إرسال الشاحنة'}
                      </button>
                    )}
                    
                    {isShipped && (
                      <button onClick={() => handleMarkDelivered(req.id)} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20">
                        <CheckCircle size={18}/> {language === 'fr' ? 'Marquer comme Livré' : 'تأكيد وصول البضاعة'}
                      </button>
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