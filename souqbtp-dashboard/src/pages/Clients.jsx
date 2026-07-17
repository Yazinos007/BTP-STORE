import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useClientStore from '../store/useClientStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Users, UserPlus, Phone, MapPin, CreditCard, Edit, Trash2, Search, X, Building2, AlertCircle, Banknote, Loader2, CheckCircle, MessageCircle, Calendar, UserCheck, UserX, ClipboardList, FileText } from 'lucide-react';

const translations = {
  ar: {
    title: 'إدارة العملاء والديون (CRM)', subtitle: 'تتبع بيانات زبائنك، صنفهم ذكياً، وحصل ديونك عبر المراسلة المباشرة.',
    addClient: 'إضافة عميل جديد', editClient: 'تعديل بيانات العميل',
    totalClients: 'إجمالي العملاء', totalDebt: 'إجمالي الديون بالسوق', clientsWithDebt: 'عملاء مدينون',
    vipClients: 'عملاء أوفياء (VIP)',
    name: 'الاسم الكامل / اسم الشركة', phone: 'رقم الهاتف', address: 'العنوان',
    ice: 'رقم المعرف (ICE)', debt: 'الديون المتراكمة', status: 'التصنيف والنشاط',
    save: 'حفظ العميل', saving: 'جاري الحفظ...', cancel: 'إلغاء', actions: 'إجراءات',
    confirmDelete: 'هل أنت متأكد من حذف هذا العميل؟',
    empty: 'لا يوجد عملاء في هذا التصنيف حالياً.', currency: 'درهم', searchPlaceholder: 'ابحث بالاسم، الهاتف، أو ICE...',
    payDebtTitle: 'تسديد دفعة من الدين', payAmount: 'المبلغ المسدد', confirmPayment: 'تأكيد التسديد',
    segments: { all: 'الكل', vip: 'VIP (نشط)', debtor: 'عليه دين', dormant: 'نائم (+60 يوم)' },
    lastActive: 'آخر عملية:', historyTitle: 'سجل المعاملات والفواتير', historyEmpty: 'لا توجد معاملات مسجلة لهذا العميل.'
  },
  fr: {
    title: 'Gestion des Clients & Dettes (CRM)', subtitle: 'Suivez vos clients, segmentez-les et relancez vos impayés intelligemment.',
    addClient: 'Nouveau Client', editClient: 'Modifier le client',
    totalClients: 'Total Clients', totalDebt: 'Total des Créances', clientsWithDebt: 'Clients Débiteurs',
    vipClients: 'Clients Fidèles (VIP)',
    name: 'Nom Complet / Raison Sociale', phone: 'Téléphone', address: 'Adresse',
    ice: 'ICE', debt: 'Dette cumulée', status: 'Statut & Activité',
    save: 'Enregistrer', saving: 'Enregistrement...', cancel: 'Annuler', actions: 'Actions',
    confirmDelete: 'Voulez-vous vraiment supprimer ce client ?',
    empty: 'Aucun client dans cette catégorie.', currency: 'MAD', searchPlaceholder: 'Rechercher par nom, tél ou ICE...',
    payDebtTitle: 'Règlement de Créance', payAmount: 'Montant réglé', confirmPayment: 'Valider le paiement',
    segments: { all: 'Tous', vip: 'VIP Actif', debtor: 'Débiteurs', dormant: 'Dormants (+60j)' },
    lastActive: 'Dernière act.:', historyTitle: 'Historique des Transactions', historyEmpty: 'Aucune transaction enregistrée.'
  }
};

export default function Clients() {
  const { supplier } = useSupplierStore();
  const isWholesaler = supplier?.supplier_type === 'wholesale';
  const { clients, isLoading, fetchClients, addClient, updateClient, deleteClient } = useClientStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '', ice: '', total_debt: '0' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientStats, setClientStats] = useState({});

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentClient, setPaymentClient] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [clientHistory, setClientHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    const fetchClientStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id || clients.length === 0) return;

      const { data: docs } = await supabase.from('documents').select('client_id, created_at').eq('owner_id', session.user.id);
      if (docs) {
        const stats = {};
        clients.forEach(c => {
          const cDocs = docs.filter(d => d.client_id === c.id);
          let segment = 'nouveau';
          let lastActive = null;
          if (cDocs.length > 0) {
            const dates = cDocs.map(d => new Date(d.created_at).getTime());
            lastActive = new Date(Math.max(...dates));
            const daysSince = (new Date().getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
            segment = daysSince > 60 ? 'dormant' : 'vip'; 
          }
          stats[c.id] = { segment, lastActive };
        });
        setClientStats(stats);
      }
    };
    fetchClientStats();
  }, [clients]);

  const handleViewHistory = async (client) => {
    setPaymentClient(client);
    setShowHistoryModal(true);
    setIsHistoryLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.from('documents')
        .select('id, ref_number, type, total_amount, created_at')
        .eq('owner_id', session.user.id)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
      setClientHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { full_name: formData.full_name, phone: formData.phone, address: formData.address, ice: formData.ice, total_debt: parseFloat(formData.total_debt || 0) };
    let result = editingId ? await updateClient(editingId, payload) : await addClient(payload);
    if (result?.success) { setFormData({ full_name: '', phone: '', address: '', ice: '', total_debt: '0' }); setEditingId(null); setShowAddForm(false); fetchClients(); }
    setIsSubmitting(false);
  };

  const handleEdit = (client) => { setFormData({ full_name: client.full_name, phone: client.phone || '', address: client.address || '', ice: client.ice || '', total_debt: client.total_debt || '0' }); setEditingId(client.id); setShowAddForm(true); };
  const handleDelete = async (id) => { if (window.confirm(t.confirmDelete)) { await deleteClient(id); fetchClients(); } };
  const cancelEdit = () => { setFormData({ full_name: '', phone: '', address: '', ice: '', total_debt: '0' }); setEditingId(null); setShowAddForm(false); };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const paidAmount = parseFloat(paymentAmount);
    if (isNaN(paidAmount) || paidAmount <= 0 || paidAmount > paymentClient.total_debt) return;
    setIsSubmitting(true);
    try {
      await updateClient(paymentClient.id, { total_debt: paymentClient.total_debt - paidAmount });
      setShowPaymentModal(false); setPaymentAmount(''); fetchClients();
    } finally { setIsSubmitting(false); }
  };

  const getWhatsAppLink = (client) => {
    const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
    let message = Number(client.total_debt) > 0 
      ? (language === 'fr' ? `Bonjour ${client.full_name}, rappel amical concernant un solde impayé de ${client.total_debt} MAD.` : `مرحباً ${client.full_name}، تذكير بوجود مبلغ مستحق بقيمة ${client.total_debt} درهم.`)
      : (clientStats[client.id]?.segment === 'vip' 
        ? (language === 'fr' ? `Bonjour ${client.full_name}, de nouveaux articles sont disponibles !` : `مرحباً ${client.full_name}، زبوننا الوفي! لدينا عروض جديدة لك.`)
        : (language === 'fr' ? `Bonjour ${client.full_name}, venez découvrir nos nouvelles offres.` : `مرحباً ${client.full_name}، اشتقنا لزيارتكم!`));
    return `https://wa.me/${cleanPhone || '212'}/?text=${encodeURIComponent(message)}`;
  };

  const safeClients = Array.isArray(clients) ? clients : [];
  const filteredClients = safeClients.filter(client => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = client.full_name?.toLowerCase().includes(term) || client.phone?.includes(term) || client.ice?.toLowerCase().includes(term);
    let matchesFilter = activeFilter === 'all' || (activeFilter === 'vip' && clientStats[client.id]?.segment === 'vip') || (activeFilter === 'dormant' && clientStats[client.id]?.segment === 'dormant') || (activeFilter === 'debtor' && Number(client.total_debt) > 0);
    return matchesSearch && matchesFilter;
  });

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div><p className="text-sm font-medium text-white/80 mb-1">{title}</p><h4 className="text-3xl font-black tracking-tight">{value}</h4></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="mb-6">
          <h2 className={`text-3xl font-black tracking-tight ${isWholesaler ? 'text-white' : 'text-gray-800'}`}>
            {t.title}
          </h2>
          <p className={`mt-1 font-medium ${isWholesaler ? 'text-slate-300' : 'text-gray-500'}`}>
            {t.subtitle}
          </p>
        </div>
        <button onClick={() => { cancelEdit(); setShowAddForm(true); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg font-bold"><UserPlus size={20} /> {t.addClient}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t.totalClients} value={safeClients.length} icon={Users} bgGradient="bg-gradient-to-br from-blue-600 to-blue-400" />
        <StatCard title={t.vipClients} value={safeClients.filter(c => clientStats[c.id]?.segment === 'vip').length} icon={UserCheck} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" />
        <StatCard title={t.clientsWithDebt} value={safeClients.filter(c => Number(c.total_debt) > 0).length} icon={AlertCircle} bgGradient="bg-gradient-to-br from-orange-500 to-amber-400" />
        <StatCard title={t.totalDebt} value={`${safeClients.reduce((sum, c) => sum + Number(c.total_debt || 0), 0).toLocaleString()} ${t.currency}`} icon={CreditCard} bgGradient="bg-gradient-to-br from-red-600 to-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {showAddForm && (
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit relative">
            <h3 className="text-lg font-black mb-6 text-gray-800 flex items-center gap-2 border-b pb-4"><UserPlus size={20} className="text-blue-600" /> {editingId ? t.editClient : t.addClient}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.name}</label><input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.phone}</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.ice}</label><input type="text" value={formData.ice} onChange={(e) => setFormData({...formData, ice: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.address}</label><input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50" /></div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 mt-2"><label className="block text-sm font-black text-red-800 mb-1">{t.debt} ({t.currency})</label><input type="number" min="0" step="0.01" value={formData.total_debt} onChange={(e) => setFormData({...formData, total_debt: e.target.value})} className="w-full px-4 py-3 border border-red-200 rounded-xl outline-none bg-white text-red-700 font-black" /></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={cancelEdit} className="w-1/3 bg-gray-100 py-3.5 rounded-xl font-bold">{t.cancel}</button><button type="submit" disabled={isSubmitting} className="w-2/3 bg-blue-600 text-white py-3.5 rounded-xl font-bold">{isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : (editingId ? t.editClient : t.save)}</button></div>
            </form>
          </div>
        )}

        <div className={`${showAddForm ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80"><Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} /><input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-200 rounded-xl outline-none`} /></div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">{Object.entries(t.segments).map(([key, value]) => (<button key={key} onClick={() => setActiveFilter(key)} className={`px-4 py-2 text-xs font-black rounded-xl uppercase whitespace-nowrap border ${activeFilter === key ? 'bg-slate-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>{value}</button>))}</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full">
            {isLoading ? <div className="py-12 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto" /></div> : filteredClients.length === 0 ? <div className="p-12 text-center text-gray-400 font-medium">{t.empty}</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead className="border-b bg-gray-50/50">
                    <tr><th className="px-6 py-4 text-gray-500 font-black text-start">{t.name}</th><th className="px-6 py-4 text-gray-500 font-black text-start">Contact</th><th className="px-6 py-4 text-gray-500 font-black text-end">{t.debt}</th><th className="px-6 py-4 text-gray-500 font-black text-start">{t.status}</th><th className="px-6 py-4 text-gray-500 font-black text-center">{t.actions}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredClients.map((client) => {
                      const stat = clientStats[client.id];
                      return (
                        <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">{client.full_name.slice(0, 2)}</div><div><p className="font-bold text-gray-800">{client.full_name}</p></div></div></td>
                          <td className="px-6 py-4 space-y-1.5"><p className="text-gray-600 text-xs font-bold flex items-center gap-1"><Phone size={12}/> {client.phone}</p></td>
                          <td className="px-6 py-4 text-end">{Number(client.total_debt) > 0 ? <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-black border border-red-100 inline-block">{Number(client.total_debt).toLocaleString()} {t.currency}</span> : <span className="text-emerald-500 font-bold text-xs"><CheckCircle size={14} className="inline"/> Réglé</span>}</td>
                          <td className="px-6 py-4"><span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-black uppercase">{stat?.segment || 'Nouveau'}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <a href={getWhatsAppLink(client)} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-lg"><MessageCircle size={16}/></a>
                              <button onClick={() => handleViewHistory(client)} className="p-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg" title="سجل المعاملات"><ClipboardList size={16}/></button>
                              {Number(client.total_debt) > 0 && <button onClick={() => { setPaymentClient(client); setShowPaymentModal(true); }} className="p-2 bg-slate-800 text-white rounded-lg"><Banknote size={16}/></button>}
                              <button onClick={() => handleEdit(client)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={16}/></button>
                              
                              {/* 🎯 ها هو زر الحذف عاد لمكانه بقوة! */}
                              <button onClick={() => handleDelete(client.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer">
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showHistoryModal && paymentClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-800 shrink-0">
              <h3 className="font-black text-white text-lg flex items-center gap-2"><ClipboardList size={20}/> {t.historyTitle} - {paymentClient.full_name}</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white p-1 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              {isHistoryLoading ? (
                <div className="py-12 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto" /></div>
              ) : clientHistory.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-medium flex flex-col items-center gap-2">
                  <FileText size={40} className="opacity-20" />
                  {t.historyEmpty}
                </div>
              ) : (
                <div className="space-y-3">
                  {clientHistory.map(doc => (
                    <div key={doc.id} className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${doc.type === 'Facture' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{doc.ref_number}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">{doc.type}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="font-black text-gray-900 font-mono">{Number(doc.total_amount).toLocaleString()} <span className="text-xs text-gray-400">{t.currency}</span></p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">
                          {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'ar-MA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(doc.created_at))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && paymentClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-6 border-b flex justify-between items-center bg-slate-800">
              <h3 className="font-black text-white text-lg flex items-center gap-2"><Banknote size={20}/> {t.payDebtTitle}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white p-1 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">العميل</p>
                <p className="font-black text-gray-800 text-lg">{paymentClient.full_name}</p>
                <div className="mt-2 inline-block bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 text-sm font-bold">الدين الحالي: {Number(paymentClient.total_debt).toLocaleString()} MAD</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.payAmount}</label>
                <input required type="number" min="1" max={paymentClient.total_debt} step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full px-4 py-3 border border-blue-200 rounded-xl outline-none font-black text-blue-600 text-xl" autoFocus />
              </div>
              <button type="submit" disabled={isSubmitting || !paymentAmount} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18}/> {t.confirmPayment}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}