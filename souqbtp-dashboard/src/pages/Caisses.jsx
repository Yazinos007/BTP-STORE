import { useState, useEffect } from 'react';
import useCaisseStore from '../store/useCaisseStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Wallet, Plus, Trash2, Edit, ArrowUpCircle, ArrowDownCircle, Search, X, Loader2 } from 'lucide-react';

const translations = {
  ar: {
    title: 'إدارة الصناديق (Caisses)', subtitle: 'تتبع حركة الأموال، المداخيل والمصاريف.',
    addBtn: 'إضافة عملية', search: 'ابحث عن عملية...',
    balance: 'الرصيد الحالي', income: 'إجمالي المداخيل', expense: 'إجمالي المصاريف',
    designation: 'البيان (التفاصيل)', amount: 'المبلغ', type: 'النوع', date: 'التاريخ', actions: 'إجراءات',
    typeIncome: 'مدخول (+)', typeExpense: 'مصروف (-)',
    empty: 'لا توجد عمليات مالية مسجلة.', loading: 'جاري التحميل...',
    save: 'حفظ العملية', cancel: 'إلغاء', newTransaction: 'عملية مالية جديدة', editTransaction: 'تعديل العملية',
    currency: 'درهم', confirmDelete: 'هل أنت متأكد من حذف هذه العملية؟',
    errorMsg: 'حدث خطأ أثناء الحفظ', placeholderDesignation: 'مثال: مبيعات نقدية، شراء...',
    delete: 'حذف',
    statBalance: 'الرصيد الحالي', statIncome: 'إجمالي المداخيل', statExpense: 'إجمالي المصاريف',
    suggestions: ["مبيعات نقدية", "دفعة من عميل", "سلفة موظف", "راتب", "فاتورة كهرباء", "فاتورة إنترنت", "مصاريف نقل", "شراء مستلزمات", "إيداع بنكي", "سحب بنكي"]
  },
  fr: {
    title: 'Gestion des Caisses', subtitle: 'Suivez les flux de trésorerie, entrées et sorties.',
    addBtn: 'Nouvelle Opération', search: 'Rechercher...',
    balance: 'Solde Actuel', income: 'Total Entrées', expense: 'Total Sorties',
    designation: 'Désignation', amount: 'Montant', type: 'Type', date: 'Date', actions: 'Actions',
    typeIncome: 'Entrée (+)', typeExpense: 'Sortie (-)',
    empty: 'Aucune opération enregistrée.', loading: 'Chargement...',
    save: 'Enregistrer', cancel: 'Annuler', newTransaction: 'Nouvelle Opération', editTransaction: 'Modifier l\'Opération',
    currency: 'MAD', confirmDelete: 'Voulez-vous vraiment supprimer cette opération ?',
    errorMsg: 'Une erreur s\'est produite lors de l\'enregistrement', placeholderDesignation: 'Ex: Vente comptoir, Achat...',
    delete: 'Supprimer',
    statBalance: 'SOLDE ACTUEL', statIncome: 'TOTAL ENTRÉES', statExpense: 'TOTAL SORTIES',
    suggestions: ["Vente Espèce", "Paiement Client", "Avance Employé", "Salaire", "Facture Électricité", "Facture Internet", "Frais de Transport", "Achat Fournitures", "Versement Bancaire", "Retrait Bancaire"]
  },
  en: {
    title: 'Cash Management (Caisses)', subtitle: 'Track cash flow, income, and expenses.',
    addBtn: 'New Transaction', search: 'Search transaction...',
    balance: 'Current Balance', income: 'Total Income', expense: 'Total Expenses',
    designation: 'Description', amount: 'Amount', type: 'Type', date: 'Date', actions: 'Actions',
    typeIncome: 'Income (+)', typeExpense: 'Expense (-)',
    empty: 'No transactions recorded.', loading: 'Loading...',
    save: 'Save Transaction', cancel: 'Cancel', newTransaction: 'New Transaction', editTransaction: 'Edit Transaction',
    currency: 'MAD', confirmDelete: 'Are you sure you want to delete this transaction?',
    errorMsg: 'An error occurred while saving', placeholderDesignation: 'Ex: Cash sale, Purchase...',
    delete: 'Delete',
    statBalance: 'CURRENT BALANCE', statIncome: 'TOTAL INCOME', statExpense: 'TOTAL EXPENSES',
    suggestions: ["Cash Sale", "Client Payment", "Employee Advance", "Salary", "Electricity Bill", "Internet Bill", "Transport Fees", "Office Supplies", "Bank Deposit", "Bank Withdrawal"]
  }
};

export default function Caisses({ isWholesaler }) {
  const { transactions, isLoading, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useCaisseStore();
  const { language } = useSettingsStore();
  // 🛡️ الترياق السحري
  const t = translations[language] || translations['fr'];

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ designation: '', amount: '', type: 'income', date_transaction: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // حساب الإحصائيات
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const totalIncome = safeTransactions.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + Number(tr.amount), 0);
  const totalExpense = safeTransactions.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + Number(tr.amount), 0);
  const balance = totalIncome - totalExpense;
  
  const historicalDesignations = safeTransactions.map(tr => tr.designation);
  const defaultSuggestions = t.suggestions;
  const allSuggestions = [...new Set([...defaultSuggestions, ...historicalDesignations])];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ designation: '', amount: '', type: 'income', date_transaction: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const handleOpenEdit = (transaction) => {
    setEditingId(transaction.id);
    setFormData({ designation: transaction.designation, amount: transaction.amount, type: transaction.type, date_transaction: transaction.date_transaction });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      await deleteTransaction(id);
      fetchTransactions();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateTransaction(editingId, { ...formData, amount: parseFloat(formData.amount) });
      } else {
        await addTransaction({ ...formData, amount: parseFloat(formData.amount) });
      }
      setShowModal(false);
      fetchTransactions();
    } catch (error) {
      alert(t.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = safeTransactions.filter(tr => tr.designation.toLowerCase().includes(searchTerm.toLowerCase()));

  // 🎨 مكون البطاقة الملونة (نفس التصميم الموحد)
  const StatCard = ({ title, value, icon: Icon, bgGradient, valueSuffix = '' }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1 tracking-wider uppercase">{title}</p>
          <h4 className="text-3xl font-black tracking-tight">{value} <span className="text-sm font-bold text-white/70">{valueSuffix}</span></h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 👑 الهيدر */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="mb-6">
          <h2 className={`text-3xl font-black tracking-tight ${isWholesaler ? 'text-white' : 'text-gray-800'}`}>
           {t.title}
          </h2>
          <p className={`mt-1 font-medium ${isWholesaler ? 'text-slate-300' : 'text-gray-500'}`}>
           {t.subtitle}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-bold shadow-lg hover:shadow-blue-500/30">
          <Plus size={20} /> {t.addBtn}
        </button>
      </div>

      {/* 🚀 بطاقات الإحصائيات المالية الملونة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.statBalance} value={balance.toLocaleString()} valueSuffix={t.currency} icon={Wallet} bgGradient={balance >= 0 ? "bg-gradient-to-br from-blue-700 to-blue-500" : "bg-gradient-to-br from-red-600 to-rose-500"} />
        <StatCard title={t.statIncome} value={totalIncome.toLocaleString()} valueSuffix={t.currency} icon={ArrowUpCircle} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" />
        <StatCard title={t.statExpense} value={totalExpense.toLocaleString()} valueSuffix={t.currency} icon={ArrowDownCircle} bgGradient="bg-gradient-to-br from-red-600 to-rose-500" />
      </div>

      {/* 🪟 نافذة إضافة / تعديل */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-800 text-xl">{editingId ? t.editTransaction : t.newTransaction}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.designation}</label>
                <input 
                  required type="text" list="suggestions" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all" 
                  placeholder={t.placeholderDesignation} autoComplete="off"
                />
                <datalist id="suggestions">
                  {allSuggestions.map((suggestion, index) => (<option key={index} value={suggestion} />))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.amount}</label>
                  <div className="relative">
                    <input required type="number" min="0" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className={`w-full ${language === 'ar' ? 'pr-4 pl-12' : 'pl-4 pr-12'} py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black ${formData.type === 'income' ? 'text-emerald-600' : 'text-red-600'} transition-all`} />
                    <span className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-4' : 'right-4'} text-[10px] font-bold text-gray-400 uppercase`}>MAD</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.date}</label>
                  <input required type="date" value={formData.date_transaction} onChange={e => setFormData({...formData, date_transaction: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold text-gray-700 transition-all bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.type}</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={e => setFormData({...formData, type: e.target.value})} className="hidden" />
                    <ArrowUpCircle size={18} /> {t.typeIncome}
                  </label>
                  <label className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={e => setFormData({...formData, type: e.target.value})} className="hidden" />
                    <ArrowDownCircle size={18} /> {t.typeExpense}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors">{t.cancel}</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📋 جدول العمليات المالية */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} />
            <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all`} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.date}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.designation}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.type}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-end uppercase tracking-wider text-xs">{t.amount}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-12"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto" /></td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400 font-medium"><Wallet size={40} className="mx-auto mb-3 opacity-20" />{t.empty}</td></tr>
              ) : filteredTransactions.map(tr => (
                <tr key={tr.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                    {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA').format(new Date(tr.date_transaction))}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">{tr.designation}</td>
                  <td className="px-6 py-4 text-center">
                    {tr.type === 'income' 
                      ? <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-black"><ArrowUpCircle size={14}/> {t.typeIncome}</span>
                      : <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-black"><ArrowDownCircle size={14}/> {t.typeExpense}</span>
                    }
                  </td>
                  <td className={`px-6 py-4 text-end font-black font-mono text-base ${tr.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`} dir="ltr">
                    {tr.type === 'income' ? '+' : '-'}{Number(tr.amount).toLocaleString()} <span className="text-[10px] font-bold opacity-70 uppercase">{t.currency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(tr)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title={t.editTransaction}><Edit size={18}/></button>
                      <button onClick={() => handleDelete(tr.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title={t.delete}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}