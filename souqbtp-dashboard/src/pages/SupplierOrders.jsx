import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { PackageSearch, CheckCircle, XCircle, Clock, Truck, FileSignature, Loader2, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

const translations = {
  ar: {
    title: 'الطلبيات الواردة (B2B)',
    subtitle: 'إدارة طلبات التزويد الواردة من تجار التجزئة.',
    pendingColumn: 'طلبيات جديدة',
    confirmedColumn: 'بانتظار التوقيع',
    signedColumn: 'جاهز للشحن',
    articles: 'منتجات',
    client: 'العميل (التاجر)',
    acceptBtn: 'قبول الطلبية',
    rejectBtn: 'رفض وإلغاء هذه الطلبية',
    waitingSignature: 'بانتظار توقيع التاجر',
    readyToShip: 'موقع - جاهز للشحن',
    confirmAccept: 'هل أنت متأكد من قبول هذه الطلبية؟',
    confirmReject: 'هل تريد رفض وإلغاء هذه الطلبية؟',
    noPending: 'لا توجد طلبات جديدة',
    noConfirmed: 'لا توجد طلبات قيد الانتظار',
    noSigned: 'لا توجد عقود جاهزة',
    currency: 'DH',
    loading: 'جاري التحميل...'
  },
  fr: {
    title: 'Commandes Reçues (B2B)',
    subtitle: 'Gérez les demandes d\'approvisionnement de vos détaillants.',
    pendingColumn: 'Nouvelles Commandes',
    confirmedColumn: 'Attente Signature',
    signedColumn: 'Prêt à l\'Expédition',
    articles: 'Articles',
    client: 'Client (Détaillant)',
    acceptBtn: 'Accepter la commande',
    rejectBtn: 'Rejeter la commande',
    waitingSignature: 'En attente de signature client',
    readyToShip: 'Contrat Signé - Prêt à expédier',
    confirmAccept: 'Accepter cette commande ?',
    confirmReject: 'Rejeter cette commande ?',
    noPending: 'Aucune nouvelle commande',
    noConfirmed: 'Aucune commande en attente',
    noSigned: 'Aucun contrat signé',
    currency: 'DH',
    loading: 'Chargement...'
  },
  en: {
    title: 'Received Orders (B2B)',
    subtitle: 'Manage supply requests from your retailers.',
    pendingColumn: 'New Orders',
    confirmedColumn: 'Awaiting Signature',
    signedColumn: 'Ready to Ship',
    articles: 'Items',
    client: 'Client (Retailer)',
    acceptBtn: 'Accept Order',
    rejectBtn: 'Reject Order',
    waitingSignature: 'Awaiting client signature',
    readyToShip: 'Signed - Ready to Ship',
    confirmAccept: 'Accept this order?',
    confirmReject: 'Reject and cancel this order?',
    noPending: 'No new orders',
    noConfirmed: 'No pending orders',
    noSigned: 'No ready contracts',
    currency: 'DH',
    loading: 'Loading...'
  }
};

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  const { language } = useSettingsStore();
  
  // 🛡️ الترياق السحري للترجمة
  const t = translations[language] || translations['fr'];

  useEffect(() => {
    fetchOrders();

    const ordersSubscription = supabase
      .channel('live-b2b-orders')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'supply_requests' }, 
        (payload) => {
          console.log('تحديث لحظي جديد!', payload);
          fetchOrders(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .in('status', ['pending', 'confirmed', 'signed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setOrders(data);
        const merchantIds = [...new Set(data.map(req => req.merchant_id))];
        merchantIds.forEach(id => fetchMerchantData(id));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMerchantData = async (id) => {
    if (!id || merchants[id]) return;
    const { data } = await supabase.from('suppliers').select('store_name, phone').eq('id', id).single();
    if (data) setMerchants(prev => ({ ...prev, [id]: data }));
  };

  const handleApprove = async (id) => {
    if (!window.confirm(t.confirmAccept)) return;
    setProcessingId(id);
    try {
      await supabase.from('supply_requests').update({ status: 'confirmed' }).eq('id', id);
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert('Erreur: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm(t.confirmReject)) return;
    setProcessingId(id);
    try {
      await supabase.from('supply_requests').update({ status: 'rejected' }).eq('id', id);
      fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const signedOrders = orders.filter(o => o.status === 'signed');

  const OrderCard = ({ req, type }) => {
    const merchant = merchants[req.merchant_id] || { store_name: '...', phone: '...' };
    const date = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA', {
      dateStyle: 'short', timeStyle: 'short'
    }).format(new Date(req.created_at));

    return (
      <div className="bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-2xl p-5 transition-all shadow-lg text-start">
        <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
          <div>
            <h4 className="text-white font-black text-lg" dir="ltr">PO #{req.id.split('-')[0].toUpperCase()}</h4>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1"><Calendar size={12}/> {date}</p>
          </div>
          <div className="text-end">
            <p className="text-emerald-400 font-black text-xl" dir="ltr">{Number(req.total_amount).toLocaleString()} {t.currency}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{req.items.length} {t.articles}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t.client}</p>
          <p className="text-white font-bold">{merchant.store_name}</p>
          <p className="text-slate-400 text-sm" dir="ltr">{merchant.phone}</p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
          {req.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm mb-1.5 last:mb-0">
              <span className="text-slate-300 font-medium">{item.name}</span>
              <span className="text-blue-400 font-bold" dir="ltr">{item.quantity} U</span>
            </div>
          ))}
        </div>

        {type === 'pending' && (
          <div className="flex gap-2">
            <button 
              onClick={() => handleReject(req.id)}
              disabled={processingId === req.id}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all flex items-center justify-center"
              title={t.rejectBtn}
            >
              <XCircle size={20}/>
            </button>
            <button 
              onClick={() => handleApprove(req.id)}
              disabled={processingId === req.id}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm"
            >
              {processingId === req.id ? <Loader2 className="animate-spin" size={18}/> : <><CheckCircle size={18}/> {t.acceptBtn}</>}
            </button>
          </div>
        )}

        {type === 'confirmed' && (
          <div className="w-full py-2.5 bg-orange-500/10 text-orange-400 rounded-xl font-bold flex justify-center items-center gap-2 border border-orange-500/20 text-sm">
            <Clock size={16}/> {t.waitingSignature}
          </div>
        )}

        {type === 'signed' && (
          <div className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold flex justify-center items-center gap-2 border border-emerald-500/20 text-sm">
            <FileSignature size={16}/> {t.readyToShip}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <PackageSearch className="text-blue-500" size={32} />
          {t.title}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">
          {t.subtitle}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              {t.pendingColumn}
              <span className="ml-auto bg-slate-700 text-xs px-2 py-1 rounded-full">{pendingOrders.length}</span>
            </h3>
            <div className="space-y-4">
              {pendingOrders.map(req => <OrderCard key={req.id} req={req} type="pending" />)}
              {pendingOrders.length === 0 && <p className="text-slate-500 text-sm text-center py-4">{t.noPending}</p>}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              {t.confirmedColumn}
              <span className="ml-auto bg-slate-700 text-xs px-2 py-1 rounded-full">{confirmedOrders.length}</span>
            </h3>
            <div className="space-y-4">
              {confirmedOrders.map(req => <OrderCard key={req.id} req={req} type="confirmed" />)}
              {confirmedOrders.length === 0 && <p className="text-slate-500 text-sm text-center py-4">{t.noConfirmed}</p>}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              {t.signedColumn}
              <span className="ml-auto bg-slate-700 text-xs px-2 py-1 rounded-full">{signedOrders.length}</span>
            </h3>
            <div className="space-y-4">
              {signedOrders.map(req => <OrderCard key={req.id} req={req} type="signed" />)}
              {signedOrders.length === 0 && <p className="text-slate-500 text-sm text-center py-4">{t.noSigned}</p>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}