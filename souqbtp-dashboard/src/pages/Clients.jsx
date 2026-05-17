import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // 🎯 أضفنا سوبابيس لجلب آخر نشاط للعملاء
import useClientStore from '../store/useClientStore';
import useSettingsStore from '../store/useSettingsStore';
import { Users, UserPlus, Phone, MapPin, CreditCard, Edit, Trash2, Search, X, Building2, AlertCircle, Banknote, Loader2, CheckCircle, MessageCircle, Calendar, UserCheck, UserX } from 'lucide-react';

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
    lastActive: 'آخر عملية:'
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
    lastActive: 'Dernière act.:'
  }
};

export default function Clients() {
  const { clients, isLoading, fetchClients, addClient, updateClient, deleteClient } = useClientStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  // حالات الصفحة
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 🎯 فلتر الـ CRM الجديد
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '', ice: '', total_debt: '0' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالات الـ CRM الذكي (آخر نشاط وتصنيف)
  const [clientStats, setClientStats] = useState({});

  // حالات نافذة تسديد الديون 💸 (لم نلمسها)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentClient, setPaymentClient] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => { 
    fetchClients(); 
  }, [fetchClients]);

  // 🎯 جلب مستندات التاجر لحساب آخر نشاط لكل عميل وتصنيفه ذكياً
  useEffect(() => {
    const fetchClientStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id || clients.length === 0) return;

      const { data: docs } = await supabase
        .from('documents')
        .select('client_id, created_at')
        .eq('owner_id', session.user.id);

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
            segment = daysSince > 60 ? 'dormant' : 'vip'; // إذا مر شهران فهو نائم، غير ذلك VIP
          }
          stats[c.id] = { segment, lastActive };
        });
        setClientStats(stats);
      }
    };
    fetchClientStats();
  }, [clients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      full_name: formData.full_name, phone: formData.phone, address: formData.address,
      ice: formData.ice, total_debt: parseFloat(formData.total_debt || 0)
    };

    let result;
    if (editingId) result = await updateClient(editingId, payload);
    else result = await addClient(payload);

    if (result && result.success) {
      setFormData({ full_name: '', phone: '', address: '', ice: '', total_debt: '0' });
      setEditingId(null);
      setShowAddForm(false);
      fetchClients();
    } else {
      alert("Erreur d'enregistrement.");
    }
    setIsSubmitting(false);
  };

  const handleEdit = (client) => {
    setFormData({
      full_name: client.full_name, phone: client.phone || '', address: client.address || '',
      ice: client.ice || '', total_debt: client.total_debt || '0'
    });
    setEditingId(client.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      await deleteClient(id);
      fetchClients();
    }
  };

  const cancelEdit = () => {
    setFormData({ full_name: '', phone: '', address: '', ice: '', total_debt: '0' });
    setEditingId(null);
    setShowAddForm(false);
  };

  // 💸 دالة تسديد الدين 
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const paidAmount = parseFloat(paymentAmount);
    if (isNaN(paidAmount) || paidAmount <= 0) return;

    if (paidAmount > paymentClient.total_debt) {
      alert("المبلغ المدخل أكبر من الدين الفعلي للعميل!");
      return;
    }

    setIsSubmitting(true);
    try {
      const newDebt = paymentClient.total_debt - paidAmount;
      await updateClient(paymentClient.id, { total_debt: newDebt });
      setShowPaymentModal(false);
      setPaymentAmount('');
      fetchClients();
    } catch (error) {
      alert("حدث خطأ أثناء تسجيل الدفعة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 دالة رسائل الواتساب الذكية بناءً على الديون والتصنيف
  const getWhatsAppLink = (client) => {
    const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
    let message = '';

    if (Number(client.total_debt) > 0) {
      // رسالة المطالبة بالدين
      message = language === 'fr' 
        ? `Bonjour ${client.full_name}, rappel amical concernant un solde impayé de ${client.total_debt} MAD. Merci de régulariser votre situation à votre convenance.` 
        : `مرحباً ${client.full_name}، تذكير ودي بوجود مبلغ مستحق بقيمة ${client.total_debt} درهم. يرجى تسويته في أقرب فرصة. شكراً لتعاملكم.`;
    } else if (clientStats[client.id]?.segment === 'vip') {
      // رسالة العميل النشط
      message = language === 'fr'
        ? `Bonjour ${client.full_name}, notre fidèle client ! De nouveaux articles sont disponibles en magasin, au plaisir de vous voir.`
        : `مرحباً ${client.full_name}، زبوننا الوفي! يسعدنا إخبارك بوصول سلع وعروض جديدة لتحديث مخزونك.`;
    } else {
      // رسالة التنشيط للنائمين
      message = language === 'fr'
        ? `Bonjour ${client.full_name}, cela fait longtemps ! Venez découvrir nos nouvelles offres spéciales.`
        : `مرحباً ${client.full_name}، اشتقنا لزيارتكم! نتشرف بقدومكم لاكتشاف العروض الجديدة.`;
    }

    return `https://wa.me/${cleanPhone || '212'}/?text=${encodeURIComponent(message)}`;
  };

  const safeClients = Array.isArray(clients) ? clients : [];

  // 🔍 الفلترة والبحث الـ CRM
  const filteredClients = safeClients.filter(client => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = client.full_name?.toLowerCase().includes(term) || client.phone?.includes(term) || client.ice?.toLowerCase().includes(term);
    
    let matchesFilter = true;
    if (activeFilter === 'vip') matchesFilter = clientStats[client.id]?.segment === 'vip';
    if (activeFilter === 'dormant') matchesFilter = clientStats[client.id]?.segment === 'dormant';
    if (activeFilter === 'debtor') matchesFilter = Number(client.total_debt) > 0;

    return matchesSearch && matchesFilter;
  });

  // 📈 الإحصائيات
  const totalClientsCount = safeClients.length;
  const totalMarketDebt = safeClients.reduce((sum, c) => sum + Number(c.total_debt || 0), 0);
  const clientsWithDebtCount = safeClients.filter(c => Number(c.total_debt) > 0).length;
  const vipCount = safeClients.filter(c => clientStats[c.id]?.segment === 'vip').length;

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <h4 className="text-3xl font-black tracking-tight">{value}</h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 👑 الهيدر */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h2>
          <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
        </div>
        <button onClick={() => { cancelEdit(); setShowAddForm(true); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 font-bold">
          <UserPlus size={20} /> {t.addClient}
        </button>
      </div>

      {/* 🚀 البطاقات الإحصائية (4 بطاقات للـ CRM الشامل) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t.totalClients} value={totalClientsCount} icon={Users} bgGradient="bg-gradient-to-br from-blue-600 to-blue-400" />
        <StatCard title={t.vipClients} value={vipCount} icon={UserCheck} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" />
        <StatCard title={t.clientsWithDebt} value={clientsWithDebtCount} icon={AlertCircle} bgGradient="bg-gradient-to-br from-orange-500 to-amber-400" />
        <StatCard title={t.totalDebt} value={`${totalMarketDebt.toLocaleString()} ${t.currency}`} icon={CreditCard} bgGradient="bg-gradient-to-br from-red-600 to-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* 🪟 نموذج الإضافة والتعديل */}
        {showAddForm && (
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit relative animate-fade-in">
            {editingId && <div className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md animate-pulse">Mode Édition</div>}
            <h3 className="text-lg font-black mb-6 text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
              {editingId ? <Edit size={20} className="text-blue-600" /> : <UserPlus size={20} className="text-blue-600" />} 
              {editingId ? t.editClient : t.addClient}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.name}</label>
                <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-gray-50/50 transition-all font-medium" placeholder="Ex: BTP Construct SARL" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.phone}</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-gray-50/50 transition-all font-medium" placeholder="06..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.ice}</label>
                  <input type="text" value={formData.ice} onChange={(e) => setFormData({...formData, ice: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-gray-50/50 transition-all font-medium text-sm" placeholder="15 chiffres" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.address}</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-gray-50/50 transition-all font-medium" placeholder="Quartier, Ville..." />
              </div>
              
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 mt-2">
                <label className="block text-sm font-black text-red-800 mb-1">{t.debt} ({t.currency})</label>
                <input type="number" min="0" step="0.01" value={formData.total_debt} onChange={(e) => setFormData({...formData, total_debt: e.target.value})} className="w-full px-4 py-3 border border-red-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none bg-white text-red-700 font-black transition-all" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={cancelEdit} className="w-1/3 bg-gray-100 text-gray-700 py-3.5 rounded-xl hover:bg-gray-200 font-bold transition-all flex items-center justify-center gap-1"><X size={16}/> {t.cancel}</button>
                <button type="submit" disabled={isSubmitting} className="w-2/3 bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingId ? t.editClient : t.save)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 📋 جدول العملاء والبحث الذكي */}
        <div className={`${showAddForm ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4 transition-all duration-300`}>
          
          {/* 🔍 أزرار الفلترة للـ CRM */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} />
              <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all`} />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {Object.entries(t.segments).map(([key, value]) => (
                <button 
                  key={key} onClick={() => setActiveFilter(key)}
                  className={`px-4 py-2 text-xs font-black rounded-xl uppercase whitespace-nowrap transition-all border ${activeFilter === key ? 'bg-slate-800 border-slate-700 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full">
            {isLoading ? ( 
              <div className="py-12 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto" /></div> 
            ) : filteredClients.length === 0 ? ( 
              <div className="p-12 text-center text-gray-400 font-medium"><Users size={40} className="mx-auto mb-3 opacity-20"/> {t.empty}</div> 
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-gray-500 font-black text-start uppercase tracking-wider text-[11px]">{t.name}</th>
                      <th className="px-6 py-4 text-gray-500 font-black text-start uppercase tracking-wider text-[11px]">Contact & ICE</th>
                      <th className="px-6 py-4 text-gray-500 font-black text-end uppercase tracking-wider text-[11px]">{t.debt}</th>
                      <th className="px-6 py-4 text-gray-500 font-black text-start uppercase tracking-wider text-[11px]">{t.status}</th>
                      <th className="px-6 py-4 text-gray-500 font-black text-center uppercase tracking-wider text-[11px]">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredClients.map((client) => {
                      const stat = clientStats[client.id];
                      return (
                        <tr key={client.id} className={`hover:bg-blue-50/30 transition-colors group ${editingId === client.id ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-inner">
                                {client.full_name.slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{client.full_name}</p>
                                {client.address && <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={10}/> {client.address}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 space-y-1.5">
                            {client.phone ? <p className="text-gray-600 text-xs font-bold flex items-center gap-1.5"><Phone size={12} className="text-gray-400"/> <span dir="ltr">{client.phone}</span></p> : <span className="text-gray-300">-</span>}
                            {client.ice && <p className="text-gray-500 font-medium text-[11px] flex items-center gap-1.5"><Building2 size={12} className="text-gray-400"/> ICE: {client.ice}</p>}
                          </td>
                          <td className="px-6 py-4 text-end">
                            {Number(client.total_debt) > 0 ? (
                              <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-black font-mono text-xs border border-red-100 inline-block">
                                {Number(client.total_debt).toLocaleString()} <span className="text-[9px] font-bold text-red-400 uppercase">{t.currency}</span>
                              </span>
                            ) : (
                              <span className="text-emerald-500 font-bold text-xs inline-flex items-center gap-1"><CheckCircle size={14}/> Réglé</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              {stat?.segment === 'vip' ? (
                                <span className="w-fit bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100 text-[10px] font-black uppercase flex items-center gap-1"><UserCheck size={12}/> VIP</span>
                              ) : stat?.segment === 'dormant' ? (
                                <span className="w-fit bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100 text-[10px] font-black uppercase flex items-center gap-1"><UserX size={12}/> Dormant</span>
                              ) : (
                                <span className="w-fit bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200 text-[10px] font-black uppercase">Nouveau</span>
                              )}
                              {stat?.lastActive && (
                                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Calendar size={10}/> {t.lastActive} {stat.lastActive.toLocaleDateString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {/* 💬 زر المراسلة الذكية */}
                              <a 
                                href={getWhatsAppLink(client)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1 border ${Number(client.total_debt) > 0 ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`} 
                                title="Relance WhatsApp"
                              >
                                <MessageCircle size={16}/>
                              </a>
                              {/* 💸 زر تسديد الدين القديم */}
                              {Number(client.total_debt) > 0 && (
                                <button onClick={() => { setPaymentClient(client); setShowPaymentModal(true); }} className="p-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition-colors shadow-md" title="Règlement de Créance">
                                  <Banknote size={16}/>
                                </button>
                              )}
                              <button onClick={() => handleEdit(client)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={16}/></button>
                              <button onClick={() => handleDelete(client.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
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

      {/* 💸 النافذة المنبثقة لتسديد الديون (Modal) */}
      {showPaymentModal && paymentClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-800">
              <h3 className="font-black text-white text-lg flex items-center gap-2"><Banknote size={20}/> {t.payDebtTitle}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white p-1 rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-500">العميل</p>
                <p className="font-black text-gray-800 text-lg">{paymentClient.full_name}</p>
                <div className="mt-2 inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 text-sm font-bold">
                  الدين الحالي: <span dir="ltr">{Number(paymentClient.total_debt).toLocaleString()} MAD</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.payAmount}</label>
                <div className="relative">
                  <input required type="number" min="1" max={paymentClient.total_debt} step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full pr-12 pl-4 py-3 border border-blue-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-blue-600 transition-all text-xl" autoFocus />
                  <span className="absolute top-1/2 -translate-y-1/2 right-4 font-bold text-blue-400 text-sm">MAD</span>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting || !paymentAmount} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18}/> {t.confirmPayment}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}