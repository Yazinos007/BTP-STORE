import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  ShoppingBag, Clock, PackageCheck, Truck, CheckCircle, 
  XCircle, MapPin, Phone, User, Eye, FileText, Loader2, MessageCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const translations = {
  ar: {
    title: 'طلبات المتجر (Marketplace)',
    subtitle: 'إدارة طلبات العملاء القادمة من الماركت بليس، وتوجيهها للتوصيل.',
    statusAll: 'كل الطلبات', statusPending: 'في الانتظار', statusProcessing: 'جاري التجهيز', statusShipped: 'في الطريق (مع الأسطول)', statusDelivered: 'تم التسليم',
    orderNum: 'طلب #', date: 'التاريخ', client: 'العميل', total: 'الإجمالي', status: 'الحالة', actions: 'إجراءات',
    viewDetails: 'التفاصيل',
    detailsTitle: 'تفاصيل الطلب',
    contactClient: 'مراسلة واتساب',
    shippingAddress: 'عنوان التوصيل',
    items: 'المنتجات المطلوبة',
    paymentMethod: 'طريقة الدفع',
    cod: 'الدفع عند الاستلام', split: 'دفع مجزأ (30% مسبقاً)', bank: 'تحويل بنكي',
    actionAccept: 'قبول وتجهيز الطلب',
    actionShip: 'إرسال لأسطول التوصيل 🚚',
    actionDeliver: 'تأكيد التسليم وتوليد الفاتورة',
    actionCancel: 'إلغاء الطلب',
    empty: 'لا توجد طلبات في هذه الفئة حالياً.',
    successUpdate: '✅ تم تحديث حالة الطلب بنجاح!',
    currency: 'درهم'
  },
  fr: {
    title: 'Commandes Marketplace',
    subtitle: 'Gérez les commandes clients du Marketplace et expédiez-les.',
    statusAll: 'Toutes', statusPending: 'En attente', statusProcessing: 'En préparation', statusShipped: 'Expédiée (Flotte)', statusDelivered: 'Livrée',
    orderNum: 'Cmd #', date: 'Date', client: 'Client', total: 'Total', status: 'Statut', actions: 'Actions',
    viewDetails: 'Détails',
    detailsTitle: 'Détails de la commande',
    contactClient: 'WhatsApp',
    shippingAddress: 'Adresse de livraison',
    items: 'Articles commandés',
    paymentMethod: 'Méthode de paiement',
    cod: 'Paiement à la livraison', split: 'Paiement fractionné', bank: 'Virement bancaire',
    actionAccept: 'Accepter & Préparer',
    actionShip: 'Envoyer à la Flotte 🚚',
    actionDeliver: 'Confirmer Livraison & Facturer',
    actionCancel: 'Annuler',
    empty: 'Aucune commande dans cette catégorie.',
    successUpdate: '✅ Statut mis à jour avec succès !',
    currency: 'MAD'
  },
  en: {
    title: 'Marketplace Orders',
    subtitle: 'Manage customer orders from the Marketplace and dispatch them.',
    statusAll: 'All', statusPending: 'Pending', statusProcessing: 'Processing', statusShipped: 'Shipped (Fleet)', statusDelivered: 'Delivered',
    orderNum: 'Order #', date: 'Date', client: 'Client', total: 'Total', status: 'Status', actions: 'Actions',
    viewDetails: 'Details',
    detailsTitle: 'Order Details',
    contactClient: 'WhatsApp',
    shippingAddress: 'Shipping Address',
    items: 'Ordered Items',
    paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery', split: 'Split Payment', bank: 'Bank Transfer',
    actionAccept: 'Accept & Prepare',
    actionShip: 'Dispatch to Fleet 🚚',
    actionDeliver: 'Confirm Delivery & Invoice',
    actionCancel: 'Cancel Order',
    empty: 'No orders in this category currently.',
    successUpdate: '✅ Order status updated successfully!',
    currency: 'MAD'
  }
};

export default function MarketplaceOrders() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];
  const isArabic = language === 'ar';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select(`
          *,
          marketplace_order_items (
            *,
            products ( name, unit, image_url )
          )
        `)
        .eq('supplier_id', supplier.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplier?.id) fetchOrders();
  }, [supplier]);

  // تحديث حالة الطلب
  const updateOrderStatus = async (orderId, newStatus) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('marketplace_orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // تأثيرات بصرية عند الشحن أو التسليم
      if (newStatus === 'shipped') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (newStatus === 'delivered') confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });

      alert(t.successUpdate);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-xs font-black flex items-center gap-1 w-fit"><Clock size={14}/> {t.statusPending}</span>,
      processing: <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-xs font-black flex items-center gap-1 w-fit"><PackageCheck size={14}/> {t.statusProcessing}</span>,
      shipped: <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-black flex items-center gap-1 w-fit animate-pulse"><Truck size={14}/> {t.statusShipped}</span>,
      delivered: <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-black flex items-center gap-1 w-fit"><CheckCircle size={14}/> {t.statusDelivered}</span>,
      cancelled: <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-black flex items-center gap-1 w-fit"><XCircle size={14}/> Cancelled</span>
    };
    return badges[status] || badges['pending'];
  };

  const filteredOrders = activeFilter === 'all' ? orders : orders.filter(o => o.order_status === activeFilter);

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <ShoppingBag className="text-blue-500" size={32} /> {t.title}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">{t.subtitle}</p>
      </div>

      {/* Filters (Fluid Tabs) */}
      <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
        {['all', 'pending', 'processing', 'shipped', 'delivered'].map(status => {
          const isActive = activeFilter === status;
          const label = status === 'all' ? t.statusAll : t[`status${status.charAt(0).toUpperCase() + status.slice(1)}`];
          const count = status === 'all' ? orders.length : orders.filter(o => o.order_status === status).length;
          
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                isActive 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {label}
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-700 text-slate-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Orders List */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase text-xs">
                <th className="p-5 font-black text-start">{t.orderNum}</th>
                <th className="p-5 font-black text-start">{t.client}</th>
                <th className="p-5 font-black text-end">{t.total}</th>
                <th className="p-5 font-black text-center">{t.status}</th>
                <th className="p-5 font-black text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto"/></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-bold">{t.empty}</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-white">{order.ref_number}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{new Date(order.created_at).toLocaleString()}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-slate-200 flex items-center gap-2"><User size={14}/> {order.client_name || 'Guest'}</div>
                      {order.client_phone && <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Phone size={12}/> {order.client_phone}</div>}
                    </td>
                    <td className="p-5 text-end font-black text-emerald-400 font-mono" dir="ltr">
                      {Number(order.total_amount).toLocaleString()} <span className="text-[10px] uppercase text-emerald-600">{t.currency}</span>
                    </td>
                    <td className="p-5 flex justify-center">
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 mx-auto shadow-md"
                      >
                        <Eye size={16}/> {t.viewDetails}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📝 Modal: Order Details & Actions */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-slide-up my-8">
            
            <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <FileText className="text-blue-500"/> {t.detailsTitle}
                </h3>
                <p className="text-slate-400 text-sm mt-1">{selectedOrder.ref_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-900 hover:bg-red-500 hover:text-white text-slate-400 rounded-full transition-all">
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Client Info */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{t.client} & {t.shippingAddress}</h4>
                <p className="font-bold text-white flex items-center gap-2"><User size={16} className="text-blue-400"/> {selectedOrder.client_name}</p>
                
                <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-300 flex items-start gap-2"><MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5"/> {selectedOrder.shipping_address}</p>
                </div>
                
                {selectedOrder.client_phone && (
                  <a 
                    href={`https://wa.me/${selectedOrder.client_phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" rel="noreferrer"
                    className="mt-3 w-full py-2.5 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-green-600/20"
                  >
                    <MessageCircle size={18}/> {t.contactClient}
                  </a>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{t.paymentMethod} & {t.status}</h4>
                  <div className="mb-4">
                    {getStatusBadge(selectedOrder.order_status)}
                  </div>
                  <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {t[selectedOrder.payment_method] || selectedOrder.payment_method}
                  </p>
                </div>
                
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl flex justify-between items-end">
                  <span className="text-sm font-black text-blue-400">{t.total}</span>
                  <span className="text-2xl font-black text-white" dir="ltr">{Number(selectedOrder.total_amount).toLocaleString()} <span className="text-xs text-blue-500">{t.currency}</span></span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{t.items}</h4>
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 space-y-3 max-h-48 overflow-y-auto custom-scrollbar mb-8">
              {selectedOrder.marketplace_order_items?.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-slate-600 p-1">
                      <img src={item.products?.image_url || '/placeholder.png'} alt="prod" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 text-sm">{item.products?.name}</p>
                      <p className="text-xs text-slate-500">{item.quantity} {item.products?.unit} x {item.unit_price} {t.currency}</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-400" dir="ltr">{Number(item.total_price).toLocaleString()} {t.currency}</span>
                </div>
              ))}
            </div>

            {/* 🚀 Actions (Smart B2B Workflow) */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
              
              {selectedOrder.order_status === 'pending' && (
                <button 
                  onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                  disabled={isProcessing}
                  className="flex-1 min-w-[200px] py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin"/> : <PackageCheck size={20}/>} {t.actionAccept}
                </button>
              )}

              {selectedOrder.order_status === 'processing' && (
                <button 
                  onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                  disabled={isProcessing}
                  className="flex-1 min-w-[200px] py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  {isProcessing ? <Loader2 className="animate-spin"/> : <Truck size={20}/>} {t.actionShip}
                </button>
              )}

              {selectedOrder.order_status === 'shipped' && (
                <button 
                  onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                  disabled={isProcessing}
                  className="flex-1 min-w-[200px] py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin"/> : <CheckCircle size={20}/>} {t.actionDeliver}
                </button>
              )}

              {(selectedOrder.order_status === 'pending' || selectedOrder.order_status === 'processing') && (
                <button 
                  onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                  disabled={isProcessing}
                  className="px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-all border border-red-500/20"
                >
                  {t.actionCancel}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}