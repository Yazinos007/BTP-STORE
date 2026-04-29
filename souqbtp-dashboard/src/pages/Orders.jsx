import { useState, useEffect } from 'react';
import { Search, Trash2, Eye, CheckCircle, Package, Truck, PartyPopper, Loader2, AlertCircle, X, HardHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useOrderStore from '../store/useOrderStore';
import useSettingsStore from '../store/useSettingsStore';
import confetti from 'canvas-confetti';

const translations = {
  ar: {
    title: 'إدارة الطلبات (التتبع الآلي)', subtitle: 'تتبع مسار الشاحنة من التحضير حتى تسليم العميل.',
    all: 'الكل', pending: 'قيد التحضير', shipped: 'في الطريق', delivered: 'تم التسليم',
    search: 'ابحث برقم الطلب...', orderNo: 'الطلب والورش', date: 'التاريخ',
    total: 'المجموع', journey: 'مسار الطلبية', actions: 'إجراءات',
    sendToTruck: 'شحن الطلبية', markDelivered: 'تأكيد الاستلام', delete: 'حذف',
    deleteConfirm: 'هل أنت متأكد من حذف هذا الطلب نهائياً؟', currency: 'درهم', empty: 'لا توجد طلبات هنا.',
    orderDetails: 'تفاصيل الطلبية', close: 'إغلاق', price: 'السعر', qty: 'الكمية', chantier: 'الورش'
  },
  fr: {
    title: 'Gestion des Commandes', subtitle: 'Suivez le trajet du camion jusqu\'à la livraison.',
    all: 'Toutes', pending: 'Préparation', shipped: 'En Route', delivered: 'Livré',
    search: 'Rechercher N°...', orderNo: 'Commande & Chantier', date: 'Date',
    total: 'Total', journey: 'Trajet', actions: 'Actions',
    sendToTruck: 'Expédier', markDelivered: 'Valider Livraison', delete: 'Supprimer',
    deleteConfirm: 'Voulez-vous vraiment supprimer cette commande ?', currency: 'MAD', empty: 'Aucune commande trouvée.',
    orderDetails: 'Détails de la Commande', close: 'Fermer', price: 'Prix', qty: 'Qté', chantier: 'Chantier'
  }
};

export default function Orders() {
  const { orders, fetchOrders } = useOrderStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = (Array.isArray(orders) ? orders : [])
    .filter(order => filter === 'all' ? true : order.status === filter)
    .filter(order => order.id.substring(0, 8).toUpperCase().includes(searchQuery.toUpperCase()) || (order.chantier && order.chantier.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const updateOrderStatus = async (id, currentStatus) => {
    setProcessingId(id);
    let newStatus = currentStatus === 'pending' ? 'shipped' : 'delivered';
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      fetchOrders(); 
      if (newStatus === 'delivered') triggerConfetti();
    } catch (error) { alert('Erreur'); } finally { setProcessingId(null); }
  };

  const triggerConfetti = () => {
    const duration = 3000; const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#3b82f6', '#10b981', '#f59e0b'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#3b82f6', '#10b981', '#f59e0b'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const deleteOrder = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setProcessingId(id);
    try { await supabase.from('orders').delete().eq('id', id); fetchOrders(); } 
    catch (error) { alert('Erreur'); } finally { setProcessingId(null); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'ar-MA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  };

  const OrderJourney = ({ status }) => {
    const step = status === 'delivered' ? 3 : status === 'shipped' ? 2 : 1;
    return (
      <div className="flex items-center justify-center w-full max-w-[250px] mx-auto">
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-500' : 'text-gray-300'}`}><div className={`p-2 rounded-full ${step >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}><Package size={16} /></div></div>
        <div className={`flex-1 h-1 mx-1 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
        <div className={`flex flex-col items-center ${step >= 2 ? 'text-orange-500' : 'text-gray-300'} transition-all transform ${step === 2 ? 'scale-125 animate-pulse' : ''}`}><div className={`p-2 rounded-full ${step >= 2 ? 'bg-orange-100' : 'bg-gray-100'}`}><Truck size={16} /></div></div>
        <div className={`flex-1 h-1 mx-1 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-emerald-500' : 'text-gray-300'} transition-all transform ${step === 3 ? 'scale-125' : ''}`}><div className={`p-2 rounded-full ${step >= 3 ? 'bg-emerald-100' : 'bg-gray-100'}`}>{step === 3 ? <PartyPopper size={16} /> : <CheckCircle size={16} />}</div></div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3"><Truck className="text-blue-600" size={32} /> {t.title}</h2>
          <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-xl">
          {['all', 'pending', 'shipped', 'delivered'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t[f]}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input type="text" placeholder={t.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium`} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-gray-500 font-bold text-start">{t.orderNo}</th>
                <th className="px-6 py-4 text-gray-500 font-bold text-start">{t.date}</th>
                <th className="px-6 py-4 text-gray-500 font-bold text-start">{t.total}</th>
                <th className="px-6 py-4 text-gray-500 font-bold text-center w-64">{t.journey}</th>
                <th className="px-6 py-4 text-gray-500 font-bold text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400"><AlertCircle size={40} className="mx-auto mb-3 opacity-20" /><p className="font-medium">{t.empty}</p></td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-800 font-mono font-bold text-sm">#{order.id.substring(0, 8).toUpperCase()}</span>
                        {/* 🏗️ إظهار اسم الورش في الجدول إذا كان موجوداً */}
                        {order.chantier && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 w-fit">
                            <HardHat size={12}/> {order.chantier}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4"><div className="flex items-baseline gap-1" dir="ltr"><span className="font-black text-blue-600 text-base">{Number(order.total_amount).toLocaleString()}</span><span className="text-xs font-bold text-blue-400">{t.currency}</span></div></td>
                    <td className="px-6 py-4"><OrderJourney status={order.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {order.status !== 'delivered' && (
                          <button onClick={() => updateOrderStatus(order.id, order.status)} disabled={processingId === order.id} className={`p-2 rounded-lg transition-colors text-white font-bold text-xs flex items-center gap-1 ${order.status === 'pending' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                            {processingId === order.id ? <Loader2 size={14} className="animate-spin" /> : (order.status === 'pending' ? <Truck size={14} /> : <CheckCircle size={14} />)}
                            {order.status === 'pending' ? t.sendToTruck : t.markDelivered}
                          </button>
                        )}
                        <button onClick={() => setSelectedOrder(order)} className="p-2 bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors" title="Détails"><Eye size={18} /></button>
                        <button onClick={() => deleteOrder(order.id)} disabled={processingId === order.id} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 👁️ النافذة المنبثقة: تفاصيل الطلبية */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg animate-slide-up overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-800">{t.orderDetails}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">#{selectedOrder.id.substring(0, 8).toUpperCase()}</span>
                  {/* 🏗️ إظهار اسم الورش في الفاتورة التفصيلية */}
                  {selectedOrder.chantier && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">
                      <HardHat size={12}/> {selectedOrder.chantier}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-500"><Package size={20} /></div>
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{t.price}: {item.price} {t.currency}</p>
                    </div>
                  </div>
                  <div className="text-end"><p className="font-black text-lg text-gray-800" dir="ltr">x{item.quantity}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 shrink-0">
              <div className="flex justify-between items-end bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <span className="text-blue-800 font-bold">{t.total}</span>
                <span className="text-2xl font-black text-blue-600" dir="ltr">{Number(selectedOrder.total_amount).toLocaleString()} {t.currency}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}