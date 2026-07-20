import { useState, useEffect } from 'react';
import useExternalSupplierStore from '../store/useExternalSupplierStore';
import useSettingsStore from '../store/useSettingsStore';
import { Truck, UserPlus, Phone, Building2, CreditCard, Edit, Trash2, Search, X, Loader2, Banknote, CheckCircle } from 'lucide-react';

const translations = {
  ar: {
    title: 'إدارة الموردين (المواد والخدمات)', 
    subtitle: 'تتبع ديون مزودي المواد الأولية، قطع الغيار، ومواد التغليف.',
    addBtn: 'إضافة مورد جديد', 
    totalDebt: 'إجمالي ديون الموردين', 
    count: 'عدد الموردين',
    name: 'اسم المورد / الشركة', 
    contact: 'الاتصال و ICE',
    phone: 'الهاتف', 
    ice: 'ICE', 
    debt: 'الديون المستحقة له',
    save: 'حفظ المورد', 
    cancel: 'إلغاء', 
    actions: 'إجراءات', 
    empty: 'لا يوجد موردون مسجلون حتى الآن.',
    payDebtTitle: 'تسديد دفعة للمورد', 
    payAmount: 'المبلغ المسدد', 
    confirmPayment: 'تأكيد التسديد',
    currency: 'درهم',
    searchPlaceholder: 'ابحث عن مورد...',
    editSupplier: 'تعديل المورد',
    newSupplier: 'مورد جديد',
    supplierPlaceholder: 'مثال: شركة س (مواد خام)',
    initialDebt: 'الدين الأولي',
    supplierLabel: 'المورد',
    currentDebt: 'الدين الحالي :',
    errorPayment: 'حدث خطأ أثناء تسجيل الدفعة.',
    amountExceeds: 'المبلغ المدخل أكبر من الدين الفعلي للمورد!',
    confirmDelete: 'هل أنت متأكد من حذف هذا المورد؟',
    payTooltip: 'تسديد ديون المورد',
    editTooltip: 'تعديل',
    deleteTooltip: 'حذف'
  },
  fr: {
    title: 'Fournisseurs & Prestataires', 
    subtitle: 'Gérez vos fournisseurs (Matières premières, Emballages, Pièces...).',
    addBtn: 'Nouveau Fournisseur', 
    totalDebt: 'Total Dettes Fournisseurs', 
    count: 'Nombre de Fournisseurs',
    name: 'Nom Fournisseur / Société', 
    contact: 'Contact & ICE',
    phone: 'Téléphone', 
    ice: 'ICE', 
    debt: 'Dette à régler',
    save: 'Enregistrer', 
    cancel: 'Annuler', 
    actions: 'Actions', 
    empty: 'Aucun fournisseur enregistré.',
    payDebtTitle: 'Règlement Fournisseur', 
    payAmount: 'Montant réglé', 
    confirmPayment: 'Valider le paiement',
    currency: 'MAD',
    searchPlaceholder: 'Rechercher un fournisseur...',
    editSupplier: 'Modifier Fournisseur',
    newSupplier: 'Nouveau Fournisseur',
    supplierPlaceholder: 'Ex: Société X (Matières premières)',
    initialDebt: 'Dette Initiale',
    supplierLabel: 'Fournisseur',
    currentDebt: 'Dette Actuelle :',
    errorPayment: 'Erreur lors de l\'enregistrement du paiement.',
    amountExceeds: 'Le montant saisi est supérieur à la dette réelle !',
    confirmDelete: 'Confirmer la suppression ?',
    payTooltip: 'Régler la dette',
    editTooltip: 'Modifier',
    deleteTooltip: 'Supprimer'
  },
  en: {
    title: 'Suppliers & Providers', 
    subtitle: 'Manage your suppliers (Raw materials, Packaging, Parts...).',
    addBtn: 'New Supplier', 
    totalDebt: 'Total Supplier Debts', 
    count: 'Number of Suppliers',
    name: 'Supplier / Company Name', 
    contact: 'Contact & ICE',
    phone: 'Phone', 
    ice: 'ICE', 
    debt: 'Pending Debt',
    save: 'Save', 
    cancel: 'Cancel', 
    actions: 'Actions', 
    empty: 'No suppliers registered yet.',
    payDebtTitle: 'Supplier Payment', 
    payAmount: 'Amount Paid', 
    confirmPayment: 'Confirm Payment',
    currency: 'MAD',
    searchPlaceholder: 'Search for a supplier...',
    editSupplier: 'Edit Supplier',
    newSupplier: 'New Supplier',
    supplierPlaceholder: 'Ex: Company X (Raw Materials)',
    initialDebt: 'Initial Debt',
    supplierLabel: 'Supplier',
    currentDebt: 'Current Debt:',
    errorPayment: 'Error saving the payment.',
    amountExceeds: 'Entered amount is greater than the actual debt!',
    confirmDelete: 'Confirm deletion?',
    payTooltip: 'Settle debt',
    editTooltip: 'Edit',
    deleteTooltip: 'Delete'
  }
};

export default function RawMaterialSuppliers() {
  const { suppliers, isLoading, fetchSuppliers, addSupplier, updateSupplier, deleteSupplier } = useExternalSupplierStore();
  const { language } = useSettingsStore();
  
  // 🛡️ الترياق السحري للترجمة
  const t = translations[language] || translations['fr'];

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', ice: '', address: '', total_debt: '0' });
  const [searchTerm, setSearchTerm] = useState('');

  // 💸 حالات نافذة تسديد الديون
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSupplier, setPaymentSupplier] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, total_debt: parseFloat(formData.total_debt) };
    if (editingId) await updateSupplier(editingId, data);
    else await addSupplier(data);
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', ice: '', address: '', total_debt: '0' });
  };

  // 💸 دالة تسديد الدين
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const paidAmount = parseFloat(paymentAmount);
    if (isNaN(paidAmount) || paidAmount <= 0) return;

    if (paidAmount > paymentSupplier.total_debt) {
      alert(t.amountExceeds);
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const newDebt = paymentSupplier.total_debt - paidAmount;
      await updateSupplier(paymentSupplier.id, { total_debt: newDebt });
      setShowPaymentModal(false);
      setPaymentAmount('');
      fetchSuppliers(); // تحديث البيانات
    } catch (error) {
      alert(t.errorPayment);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalDebt = suppliers.reduce((sum, s) => sum + Number(s.total_debt), 0);

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} /></div>
        <div><p className="text-sm font-medium text-white/80">{title}</p><h4 className="text-2xl font-black">{value}</h4></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div><h2 className="text-3xl font-black text-white">{t.title}</h2><p className="text-slate-300 mt-1">{t.subtitle}</p></div>
        <button onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', ice: '', address: '', total_debt: '0' }); setShowModal(true); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all"><UserPlus size={20} /> {t.addBtn}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title={t.count} value={suppliers.length} icon={Truck} bgGradient="bg-gradient-to-br from-indigo-600 to-blue-500" />
        <StatCard title={t.totalDebt} value={`${totalDebt.toLocaleString()} ${t.currency}`} icon={CreditCard} bgGradient="bg-gradient-to-br from-red-600 to-orange-500" />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
           <div className="relative w-full md:w-80">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} />
              <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm`} />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.name}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.contact}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-end uppercase tracking-wider text-xs">{t.debt}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (<tr><td colSpan="4" className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>) : 
               filtered.length === 0 ? (<tr><td colSpan="4" className="py-12 text-center text-gray-400"><Truck size={40} className="mx-auto mb-2 opacity-20" />{t.empty}</td></tr>) : 
               filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-800">{s.name}</td>
                  <td className="px-6 py-4 text-xs space-y-1 text-gray-500">
                    <div className="flex items-center gap-1"><Phone size={12}/> {s.phone || '-'}</div>
                    <div className="flex items-center gap-1"><Building2 size={12}/> ICE: {s.ice || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <span className={`px-3 py-1.5 rounded-lg font-black font-mono inline-block ${Number(s.total_debt) > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`} dir="ltr">
                      {Number(s.total_debt).toLocaleString()} {t.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {/* 💸 زر تسديد ديون المورد */}
                      {Number(s.total_debt) > 0 && (
                        <button onClick={() => { setPaymentSupplier(s); setShowPaymentModal(true); }} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title={t.payTooltip}>
                          <Banknote size={18}/>
                        </button>
                      )}
                      <button onClick={() => { setEditingId(s.id); setFormData(s); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title={t.editTooltip}><Edit size={18}/></button>
                      <button onClick={() => { if(window.confirm(t.confirmDelete)) deleteSupplier(s.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title={t.deleteTooltip}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📝 Modal Add/Edit Supplier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
             <div className="p-6 border-b flex justify-between items-center bg-gray-50">
               <h3 className="font-black text-gray-800 text-lg">{editingId ? t.editSupplier : t.newSupplier}</h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.name}</label>
                  <input required type="text" placeholder={t.supplierPlaceholder} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.phone}</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.ice}</label><input type="text" value={formData.ice} onChange={e => setFormData({...formData, ice: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.initialDebt} ({t.currency})</label>
                  <input type="number" step="0.01" value={formData.total_debt} onChange={e => setFormData({...formData, total_debt: e.target.value})} className="w-full px-4 py-2.5 border border-red-200 bg-red-50 rounded-xl outline-none font-bold text-red-600 focus:ring-2 focus:ring-red-500/20" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-4">{t.save}</button>
             </form>
          </div>
        </div>
      )}

      {/* 💸 Modal Paiement Fournisseur */}
      {showPaymentModal && paymentSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
              <h3 className="font-black text-emerald-800 text-lg flex items-center gap-2"><Banknote size={20}/> {t.payDebtTitle}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-emerald-600 hover:bg-emerald-200 p-1 rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-500">{t.supplierLabel}</p>
                <p className="font-black text-gray-800 text-lg">{paymentSupplier.name}</p>
                <div className="mt-2 inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 text-sm font-bold">
                  {t.currentDebt} <span dir="ltr">{Number(paymentSupplier.total_debt).toLocaleString()} {t.currency}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.payAmount}</label>
                <div className="relative">
                  <input required type="number" min="1" max={paymentSupplier.total_debt} step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-4 pl-12' : 'pl-4 pr-12'} py-3 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-black text-emerald-600 transition-all text-xl`} autoFocus />
                  <span className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-4' : 'right-4'} font-bold text-emerald-400 text-sm uppercase`}>{t.currency}</span>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmittingPayment || !paymentAmount} className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/30">
                  {isSubmittingPayment ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18}/> {t.confirmPayment}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}