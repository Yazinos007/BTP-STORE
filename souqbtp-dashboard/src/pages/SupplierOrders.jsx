import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { PackageSearch, CheckCircle, XCircle, Clock, Truck, FileSignature, Loader2, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  const { language } = useSettingsStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // جلب الطلبات النشطة فقط (التي لم تكتمل بعد)
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .in('status', ['pending', 'confirmed', 'signed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setOrders(data);
        // جلب أسماء التجار
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

  // 🌟 دالة الموافقة على الطلب (تغيير الحالة إلى confirmed)
  const handleApprove = async (id) => {
    if (!window.confirm(language === 'fr' ? 'Accepter cette commande ?' : 'هل أنت متأكد من قبول هذه الطلبية؟')) return;
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

  // دالة الرفض
  const handleReject = async (id) => {
    if (!window.confirm(language === 'fr' ? 'Rejeter cette commande ?' : 'هل تريد رفض وإلغاء هذه الطلبية؟')) return;
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

  // تقسيم الطلبات حسب الحالة
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const signedOrders = orders.filter(o => o.status === 'signed');

  const OrderCard = ({ req, type }) => {
    const merchant = merchants[req.merchant_id] || { store_name: '...', phone: '...' };
    const date = new Date(req.created_at).toLocaleString();

    return (
      <div className="bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-2xl p-5 transition-all shadow-lg">
        <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
          <div>
            <h4 className="text-white font-black text-lg">PO #{req.id.split('-')[0].toUpperCase()}</h4>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1"><Calendar size={12}/> {date}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-black text-xl">{Number(req.total_amount).toLocaleString()} DH</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{req.items.length} {language === 'fr' ? 'Articles' : 'منتجات'}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{language === 'fr' ? 'Client (Détaillant)' : 'العميل (التاجر)'}</p>
          <p className="text-white font-bold">{merchant.store_name}</p>
          <p className="text-slate-400 text-sm">{merchant.phone}</p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
          {req.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm mb-1.5 last:mb-0">
              <span className="text-slate-300 font-medium">{item.name}</span>
              <span className="text-blue-400 font-bold">{item.quantity} U</span>
            </div>
          ))}
        </div>

        {/* الأزرار حسب الحالة */}
        {type === 'pending' && (
          <div className="flex gap-2">
            <button 
              onClick={() => handleReject(req.id)}
              disabled={processingId === req.id}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all flex items-center justify-center"
            >
              <XCircle size={20}/>
            </button>
            <button 
              onClick={() => handleApprove(req.id)}
              disabled={processingId === req.id}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              {processingId === req.id ? <Loader2 className="animate-spin" size={18}/> : <><CheckCircle size={18}/> {language === 'fr' ? 'Accepter la commande' : 'قبول الطلبية'}</>}
            </button>
          </div>
        )}

        {type === 'confirmed' && (
          <div className="w-full py-2.5 bg-orange-500/10 text-orange-400 rounded-xl font-bold flex justify-center items-center gap-2 border border-orange-500/20 text-sm">
            <Clock size={16}/> {language === 'fr' ? 'En attente de signature client' : 'بانتظار توقيع التاجر'}
          </div>
        )}

        {type === 'signed' && (
          <div className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold flex justify-center items-center gap-2 border border-emerald-500/20 text-sm">
            <FileSignature size={16}/> {language === 'fr' ? 'Contrat Signé - Prêt à expédier' : 'موقع - جاهز للشحن'}
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
          {language === 'fr' ? 'Commandes Reçues (B2B)' : 'الطلبيات الواردة (B2B)'}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">
          {language === 'fr' ? 'Gérez les demandes d\'approvisionnement de vos détaillants.' : 'إدارة طلبات التزويد الواردة من تجار التجزئة.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* العمود 1: طلبات جديدة */}
          <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              {language === 'fr' ? 'Nouvelles Commandes' : 'طلبيات جديدة'}
              <span className="ml-auto bg-slate-700 text-xs px-2 py-1 rounded-full">{pendingOrders.length}</span>
            </h3>
            <div className="space-y-4">
              {pendingOrders.map(req => <OrderCard key={req.id} req={req} type="pending" />)}
              {pendingOrders.length === 0 && <p className="text-slate-500 text-sm text-center py-4">{language === 'fr' ? 'Aucune nouvelle commande' : 'لا توجد طلبات جديدة'}</p>}
            </div>
          </div>

          {/* العمود 2: بانتظار التوقيع */}
          <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              {language === 'fr' ? 'Attente Signature' : 'بانتظار التوقيع'}
              <span className="ml-auto bg-slate-700 text-xs px-2 py-1 rounded-full">{confirmedOrders.length}</span>
            </h3>
            <div className="space-y-4">
              {confirmedOrders.map(req => <OrderCard key={req.id} req={req} type="confirmed" />)}
              {confirmedOrders.length === 0 && <p className="text-slate-500 text-sm text-center py-4">{language === 'fr' ? 'Aucune commande en attente' : 'لا توجد طلبات قيد الانتظار'}</p>}
            </div>
          </div>

          {/* العمود 3: جاهز للشحن */}
          <div className="bg-slate-800/30 rounded-3xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              {language === 'fr' ? 'Prêt à l\'Expédition' : 'جاهز للشحن'}
              <span className="ml-auto bg-slate-700 text-xs px-2 py-1 rounded-full">{signedOrders.length}</span>
            </h3>
            <div className="space-y-4">
              {signedOrders.map(req => <OrderCard key={req.id} req={req} type="signed" />)}
              {signedOrders.length === 0 && <p className="text-slate-500 text-sm text-center py-4">{language === 'fr' ? 'Aucun contrat signé' : 'لا توجد عقود جاهزة'}</p>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}