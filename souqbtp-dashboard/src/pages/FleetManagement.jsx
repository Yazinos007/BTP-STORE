import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Truck, MapPin, User, Phone, CheckCircle, Clock, PackageCheck, FileText, Loader2, Navigation, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const translations = {
  ar: {
    title: 'أسطول التوصيل والشحن',
    subtitle: 'إدارة الشاحنات، تعيين السائقين، وتتبع مسار الطلبات حتى التسليم.',
    tabs: { all: 'الكل', processing: 'جاهز للشحن', shipped: 'في الطريق 🚚', delivered: 'تم التسليم ✅' },
    orderRef: 'رقم الطلب', client: 'العميل والعنوان', status: 'الحالة', driver: 'بيانات السائق', actions: 'إجراءات',
    assignDriverBtn: 'تعيين سائق وشحن',
    markDeliveredBtn: 'تأكيد التسليم',
    modalTitle: 'بيانات الشحن والسائق',
    driverName: 'اسم السائق', driverPhone: 'رقم هاتف السائق', vehiclePlate: 'رقم لوحة الشاحنة (الماتريكول)',
    cancel: 'إلغاء', confirmShipment: 'تأكيد وإطلاق الشاحنة',
    empty: 'لا توجد شحنات في هذه الفئة.',
    notAssigned: 'لم يتم التعيين بعد',
    successShipped: '🚚 تم تعيين السائق وانطلقت الشاحنة بنجاح!',
    successDelivered: '✅ تم تسليم الشحنة بنجاح!'
  },
  fr: {
    title: 'Flotte & Livraisons',
    subtitle: 'Gérez les camions, assignez les chauffeurs et suivez les expéditions.',
    tabs: { all: 'Tout', processing: 'Prêt à expédier', shipped: 'En route 🚚', delivered: 'Livré ✅' },
    orderRef: 'N° Commande', client: 'Client & Adresse', status: 'Statut', driver: 'Chauffeur', actions: 'Actions',
    assignDriverBtn: 'Assigner Chauffeur',
    markDeliveredBtn: 'Confirmer Livraison',
    modalTitle: 'Détails d\'expédition',
    driverName: 'Nom du chauffeur', driverPhone: 'Téléphone', vehiclePlate: 'Matricule du véhicule',
    cancel: 'Annuler', confirmShipment: 'Confirmer l\'expédition',
    empty: 'Aucune expédition dans cette catégorie.',
    notAssigned: 'Non assigné',
    successShipped: '🚚 Chauffeur assigné et camion en route !',
    successDelivered: '✅ Expédition livrée avec succès !'
  },
  en: {
    title: 'Fleet & Deliveries',
    subtitle: 'Manage trucks, assign drivers, and track shipments to delivery.',
    tabs: { all: 'All', processing: 'Ready to Ship', shipped: 'On the Way 🚚', delivered: 'Delivered ✅' },
    orderRef: 'Order Ref', client: 'Client & Address', status: 'Status', driver: 'Driver Details', actions: 'Actions',
    assignDriverBtn: 'Assign Driver',
    markDeliveredBtn: 'Confirm Delivery',
    modalTitle: 'Shipping & Driver Details',
    driverName: 'Driver Name', driverPhone: 'Driver Phone', vehiclePlate: 'Vehicle Plate',
    cancel: 'Cancel', confirmShipment: 'Confirm & Dispatch',
    empty: 'No shipments in this category.',
    notAssigned: 'Not assigned yet',
    successShipped: '🚚 Driver assigned and truck dispatched successfully!',
    successDelivered: '✅ Shipment delivered successfully!'
  }
};

export default function FleetManagement() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];
  const isArabic = language === 'ar';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('processing');
  
  // حالات نافذة تعيين السائق
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [driverData, setDriverData] = useState({ name: '', phone: '', plate: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchFleetOrders = async () => {
    setLoading(true);
    try {
      // نجلب الطلبات التي تم تجهيزها (processing) أو شحنها أو تسليمها فقط
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*')
        .eq('supplier_id', supplier.id)
        .in('order_status', ['processing', 'shipped', 'delivered'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplier?.id) fetchFleetOrders();
  }, [supplier]);

  const handleOpenAssignModal = (order) => {
    setSelectedOrder(order);
    setDriverData({ name: '', phone: '', plate: '' });
    setIsModalOpen(true);
  };

  const handleDispatchTruck = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('marketplace_orders')
        .update({
          order_status: 'shipped',
          driver_name: driverData.name,
          driver_phone: driverData.phone,
          vehicle_plate: driverData.plate
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      alert(t.successShipped);
      setIsModalOpen(false);
      fetchFleetOrders();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (!window.confirm('هل أنت متأكد من تسليم الشحنة؟')) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('marketplace_orders')
        .update({ order_status: 'delivered' })
        .eq('id', orderId);

      if (error) throw error;

      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
      alert(t.successDelivered);
      fetchFleetOrders();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.order_status === activeTab);

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* الهيدر */}
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Truck className="text-blue-500" size={32} /> {t.title}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">{t.subtitle}</p>
      </div>

      {/* التبويبات */}
      <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
        {['processing', 'shipped', 'delivered', 'all'].map(status => {
          const isActive = activeTab === status;
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`whitespace-nowrap px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                isActive 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {t.tabs[status]}
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-700 text-slate-400'}`}>
                {status === 'all' ? orders.length : orders.filter(o => o.order_status === status).length}
              </span>
            </button>
          )
        })}
      </div>

      {/* قائمة الشحنات (بطاقات ذكية) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 size={40} className="animate-spin text-blue-500"/></div>
        ) : filteredOrders.length === 0 ? (
          <div className="col-span-full bg-slate-800/50 border border-slate-700 p-12 text-center rounded-2xl text-slate-500 font-bold">
            <Navigation size={48} className="mx-auto mb-4 opacity-20"/>
            {t.empty}
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col hover:border-blue-500/50 transition-all group relative overflow-hidden">
              
              {/* شريط الأنميشن للشاحنة إذا كانت في الطريق */}
              {order.order_status === 'shipped' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-900/30 overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/3 animate-[drive_2s_linear_infinite] rounded-full"></div>
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase flex items-center gap-1"><FileText size={12}/> {order.ref_number}</p>
                  <p className="text-lg font-black text-white mt-1">{order.client_name}</p>
                </div>
                {order.order_status === 'processing' && <span className="bg-orange-500/10 text-orange-400 p-2 rounded-xl"><PackageCheck size={20}/></span>}
                {order.order_status === 'shipped' && <span className="bg-blue-500/10 text-blue-400 p-2 rounded-xl animate-pulse"><Truck size={20}/></span>}
                {order.order_status === 'delivered' && <span className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl"><CheckCircle size={20}/></span>}
              </div>

              <div className="bg-slate-900/50 rounded-2xl p-4 mb-4 border border-slate-700/50 flex-1">
                <p className="text-sm font-bold text-slate-300 flex items-start gap-2 mb-3">
                  <MapPin size={16} className="text-emerald-400 mt-0.5 shrink-0"/> 
                  {order.shipping_address}
                </p>
                
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2">{t.driver}</p>
                  {order.driver_name ? (
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-white flex items-center gap-2"><User size={14} className="text-blue-400"/> {order.driver_name}</p>
                      <p className="text-sm font-bold text-slate-300 flex items-center gap-2"><Phone size={14} className="text-emerald-400"/> {order.driver_phone}</p>
                      <span className="inline-block mt-1 bg-slate-800 border border-slate-600 px-2 py-1 rounded text-xs font-black text-slate-300 tracking-widest">{order.vehicle_plate}</span>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-orange-400 italic">{t.notAssigned}</p>
                  )}
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="mt-auto">
                {order.order_status === 'processing' && (
                  <button 
                    onClick={() => handleOpenAssignModal(order)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2"
                  >
                    <Truck size={18}/> {t.assignDriverBtn}
                  </button>
                )}
                {order.order_status === 'shipped' && (
                  <button 
                    onClick={() => handleMarkDelivered(order.id)}
                    disabled={isProcessing}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>} {t.markDeliveredBtn}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* نافذة تعيين السائق */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-slide-up relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 bg-slate-900 p-2 rounded-full"><X size={20}/></button>
            
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <Truck className="text-blue-500"/> {t.modalTitle}
            </h3>

            <form onSubmit={handleDispatchTruck} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">{t.driverName}</label>
                <input required type="text" value={driverData.name} onChange={e=>setDriverData({...driverData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">{t.driverPhone}</label>
                <input required type="tel" value={driverData.phone} onChange={e=>setDriverData({...driverData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-medium" dir="ltr"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">{t.vehiclePlate}</label>
                <input required type="text" placeholder="مثال: 12345 | أ | 1" value={driverData.plate} onChange={e=>setDriverData({...driverData, plate: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-black tracking-widest text-center" />
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-700 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                  {t.cancel}
                </button>
                <button type="submit" disabled={isProcessing} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30">
                  {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <Navigation size={18}/>} {t.confirmShipment}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* كود الأنميشن البسيط للسيارة */}
      <style>{`
        @keyframes drive {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}