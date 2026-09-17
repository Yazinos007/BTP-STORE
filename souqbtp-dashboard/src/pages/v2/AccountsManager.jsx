import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Wallet, Landmark, Banknote, ArrowUpRight, ArrowDownRight, 
  ArrowRightLeft, Plus, History, Building2, CreditCard, X, CheckCircle2,
  Trash2, PlusCircle
} from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore';

export default function AccountsManager() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';

  const [activeModal, setActiveModal] = useState(null); // 'income', 'expense', 'transfer', 'addAccount'

  const translations = {
    ar: {
      title: 'الصناديق والحسابات', subtitle: 'إدارة التدفقات النقدية، الحسابات البنكية، وخزينة الشركة بذكاء.',
      totalBalance: 'الرصيد الإجمالي المتاح', income: 'المداخيل (الشهر)', expense: 'المصاريف (الشهر)',
      mainSafe: 'الخزينة الرئيسية (Caisse)', bankAcc: 'الحساب البنكي الأساسي', secondaryAcc: 'حساب بنكي فرعي',
      addIncome: 'تسجيل مدخول', addExpense: 'تسجيل مصروف', transfer: 'تحويل بين الحسابات',
      recentTrans: 'سجل المعاملات الأخير', viewAll: 'عرض الكل',
      date: 'التاريخ', desc: 'البيان', amount: 'المبلغ', account: 'الحساب',
      newOp: 'عملية جديدة', type: 'النوع', save: 'تأكيد العملية', close: 'إلغاء',
      addAccount: 'إضافة حساب جديد', deleteConfirm: 'هل أنت متأكد من الحذف؟', actions: 'إجراءات',
      accName: 'اسم الحساب أو البنك', initBalance: 'الرصيد الافتتاحي'
    },
    fr: {
      title: 'Caisses & Comptes', subtitle: 'Gérez vos flux de trésorerie, comptes bancaires et la caisse intelligemment.',
      totalBalance: 'Solde Total Disponible', income: 'Revenus (Mois)', expense: 'Dépenses (Mois)',
      mainSafe: 'Caisse Principale', bankAcc: 'Compte Bancaire Principal', secondaryAcc: 'Compte Secondaire',
      addIncome: 'Encaissement', addExpense: 'Décaissement', transfer: 'Virement interne',
      recentTrans: 'Transactions Récentes', viewAll: 'Voir tout',
      date: 'Date', desc: 'Désignation', amount: 'Montant', account: 'Compte',
      newOp: 'Nouvelle Opération', type: 'Type', save: 'Confirmer', close: 'Annuler',
      addAccount: 'Ajouter un compte', deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ?', actions: 'Actions',
      accName: 'Nom du compte/Banque', initBalance: 'Solde initial'
    },
    en: {
      title: 'Funds & Accounts', subtitle: 'Manage your cash flow, bank accounts, and company safe smartly.',
      totalBalance: 'Total Available Balance', income: 'Income (Month)', expense: 'Expenses (Month)',
      mainSafe: 'Main Safe', bankAcc: 'Main Bank Account', secondaryAcc: 'Secondary Account',
      addIncome: 'Add Income', addExpense: 'Add Expense', transfer: 'Internal Transfer',
      recentTrans: 'Recent Transactions', viewAll: 'View All',
      date: 'Date', desc: 'Description', amount: 'Amount', account: 'Account',
      newOp: 'New Operation', type: 'Type', save: 'Confirm', close: 'Cancel',
      addAccount: 'Add New Account', deleteConfirm: 'Are you sure you want to delete?', actions: 'Actions',
      accName: 'Account/Bank Name', initBalance: 'Initial Balance'
    }
  };
  const t = translations[language] || translations.ar;

  // 🚀 تحويل البيانات إلى State لتصبح ديناميكية وتقبل الإضافة والحذف
  const [accounts, setAccounts] = useState([
    { id: 1, name: t.mainSafe, type: 'cash', balance: 45000, icon: Banknote, color: 'emerald' },
    { id: 2, name: 'Attijariwafa Bank', type: 'bank', balance: 320500, icon: Landmark, color: 'blue' },
    { id: 3, name: 'BMCE Bank', type: 'bank', balance: 85200, icon: CreditCard, color: 'purple' },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', amount: 120000, desc: 'دفعة مشروع بني ملال', date: '2026-09-17', account: 'Attijariwafa Bank' },
    { id: 2, type: 'expense', amount: 45000, desc: 'شراء مواد بناء (حديد)', date: '2026-09-15', account: 'BMCE Bank' },
    { id: 3, type: 'transfer', amount: 10000, desc: 'تغذية الخزينة الرئيسية', date: '2026-09-14', account: 'Attijariwafa ➔ الخزينة' },
    { id: 4, type: 'expense', amount: 3500, desc: 'مصاريف وقود وشحن', date: '2026-09-12', account: t.mainSafe },
  ]);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // 🎨 تنسيقات الألوان المتوافقة مع الوضعين
  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  // 🚀 دوال الحذف
  const handleDeleteAccount = (id) => {
    if (window.confirm(t.deleteConfirm)) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm(t.deleteConfirm)) {
      setTransactions(transactions.filter(trx => trx.id !== id));
    }
  };

  // 🚀 نافذة العمليات الموحدة
  const ActionModal = () => {
    if (!activeModal) return null;
    
    const isIncome = activeModal === 'income';
    const isTransfer = activeModal === 'transfer';
    const isAddAccount = activeModal === 'addAccount';
    const modalColor = isIncome ? 'emerald' : isTransfer ? 'blue' : isAddAccount ? 'purple' : 'red';
    
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden`}>
          <div className={`p-6 border-b ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex justify-between items-center`}>
            <h3 className={`text-lg font-black ${textMain} flex items-center gap-2`}>
              {isAddAccount ? <PlusCircle className={`text-${modalColor}-500`} /> : isIncome ? <ArrowDownRight className={`text-${modalColor}-500`} /> : isTransfer ? <ArrowRightLeft className={`text-${modalColor}-500`} /> : <ArrowUpRight className={`text-${modalColor}-500`} />}
              {isAddAccount ? t.addAccount : isIncome ? t.addIncome : isTransfer ? t.transfer : t.addExpense}
            </h3>
            <button onClick={() => setActiveModal(null)} className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'} transition-colors`}><X size={20}/></button>
          </div>
          
          <div className="p-6 space-y-4">
            {isAddAccount ? (
              // فورمة إضافة حساب جديد
              <>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.accName}</label>
                  <input type="text" placeholder="..." className={`w-full p-3 rounded-xl border outline-none font-bold transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.initBalance} (MAD)</label>
                  <input type="number" placeholder="0.00" className={`w-full p-4 rounded-xl border-2 outline-none font-black text-xl font-mono text-center transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.type}</label>
                  <select className={`w-full p-3 rounded-xl border outline-none font-bold transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'}`}>
                    <option value="bank">Banque (بنك)</option>
                    <option value="cash">Espèce (صندوق)</option>
                  </select>
                </div>
              </>
            ) : (
              // فورمة إضافة معاملة (دخل/صرف/تحويل)
              <>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.amount} (MAD)</label>
                  <input type="number" placeholder="0.00" className={`w-full p-4 rounded-xl border-2 outline-none font-black text-xl font-mono text-center transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.desc}</label>
                  <input type="text" placeholder="..." className={`w-full p-3 rounded-xl border outline-none font-bold transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`} />
                </div>
                {isTransfer ? (
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>من حساب</label>
                      <select className={`w-full p-3 rounded-xl border outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                        {accounts.map(a => <option key={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <ArrowRightLeft className="text-slate-500 mt-4" size={20}/>
                    <div className="flex-1">
                      <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>إلى حساب</label>
                      <select className={`w-full p-3 rounded-xl border outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                        {accounts.map(a => <option key={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.account}</label>
                    <select className={`w-full p-3 rounded-xl border outline-none font-bold transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}

            <button onClick={() => {
              // هنا سيتم إضافة المنطق لإضافة الحساب أو المعاملة (للواجهة فقط نغلق المودال)
              setActiveModal(null);
            }} className={`w-full mt-4 py-4 rounded-xl font-black text-white shadow-lg transition-all hover:-translate-y-1 bg-${modalColor}-600 hover:bg-${modalColor}-500 shadow-${modalColor}-500/30 flex justify-center items-center gap-2`}>
              <CheckCircle2 size={20} /> {t.save}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-8 animate-fade-in max-w-7xl mx-auto pb-24`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
            <Building2 className="text-blue-500" size={36} /> {t.title}
          </h2>
          <p className={`${textMuted} mt-3 font-bold`}>{t.subtitle}</p>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
          <Wallet className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform" size={140} />
          <p className="text-blue-200 font-black uppercase tracking-widest text-xs mb-2 relative z-10">{t.totalBalance}</p>
          <h3 className="text-4xl font-black font-mono relative z-10" dir="ltr">{totalBalance.toLocaleString()} <span className="text-xl">MAD</span></h3>
        </div>

        <div className={`${bgCard} border-2 p-6 rounded-[2rem] shadow-sm flex items-center gap-6`}>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <ArrowDownRight className="text-emerald-500" size={32}/>
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest ${textMuted} mb-1`}>{t.income}</p>
            <p className={`text-2xl font-black text-emerald-500 font-mono`} dir="ltr">+120,000 <span className="text-sm">MAD</span></p>
          </div>
        </div>

        <div className={`${bgCard} border-2 p-6 rounded-[2rem] shadow-sm flex items-center gap-6`}>
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <ArrowUpRight className="text-red-500" size={32}/>
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest ${textMuted} mb-1`}>{t.expense}</p>
            <p className={`text-2xl font-black text-red-500 font-mono`} dir="ltr">-48,500 <span className="text-sm">MAD</span></p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button onClick={() => setActiveModal('income')} className="flex-1 min-w-[150px] bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-6 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-1 flex justify-center items-center gap-2">
          <Plus size={20}/> {t.addIncome}
        </button>
        <button onClick={() => setActiveModal('expense')} className="flex-1 min-w-[150px] bg-red-600 hover:bg-red-500 text-white py-4 px-6 rounded-2xl font-black transition-all shadow-lg shadow-red-500/20 hover:-translate-y-1 flex justify-center items-center gap-2">
          <ArrowUpRight size={20}/> {t.addExpense}
        </button>
        <button onClick={() => setActiveModal('transfer')} className={`flex-1 min-w-[150px] ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'} border py-4 px-6 rounded-2xl font-black transition-all hover:-translate-y-1 flex justify-center items-center gap-2`}>
          <ArrowRightLeft size={20}/> {t.transfer}
        </button>
      </div>

      {/* 🚀 Accounts List Header */}
      <div className="flex justify-between items-end mt-10 mb-4">
        <h3 className={`text-xl font-black ${textMain}`}>{t.title}</h3>
        <button onClick={() => setActiveModal('addAccount')} className="text-purple-500 hover:text-purple-400 font-bold flex items-center gap-2 transition-colors">
          <PlusCircle size={18} /> {t.addAccount}
        </button>
      </div>

      {/* 🚀 Accounts Grid with Delete Button */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const Icon = acc.icon || Landmark;
          return (
            <div key={acc.id} className={`${bgCard} border-2 p-6 rounded-[2rem] shadow-sm hover:border-${acc.color}-500/50 transition-all group relative`}>
              
              {/* زر الحذف المخفي الذي يظهر عند Hover */}
              <button 
                onClick={() => handleDeleteAccount(acc.id)}
                className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all`}
                title="حذف الحساب"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex justify-between items-start mb-6 pr-8">
                <div className={`p-3 rounded-xl bg-${acc.color}-500/10 text-${acc.color}-500 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                  {acc.type === 'cash' ? 'Espece' : 'Banque'}
                </span>
              </div>
              <h4 className={`text-lg font-black ${textMain} mb-1 truncate`}>{acc.name}</h4>
              <p className={`text-3xl font-black text-${acc.color}-500 font-mono`} dir="ltr">{acc.balance.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className={`${bgCard} border-2 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col mt-10`}>
        <div className={`p-6 md:p-8 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
          <h3 className={`text-xl font-black ${textMain} flex items-center gap-3`}><History className="text-blue-500"/> {t.recentTrans}</h3>
          <button className={`text-sm font-bold text-blue-500 hover:text-blue-400 underline`}>{t.viewAll}</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className={`${isDarkMode ? 'bg-slate-950 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-500 border-b border-slate-200'}`}>
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-start">{t.type}</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-start">{t.desc}</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-start">{t.account}</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-start">{t.date}</th>
                <th className={`px-6 py-4 font-black uppercase tracking-widest text-xs ${isRtl ? 'text-start' : 'text-end'}`}>{t.amount}</th>
                {/* 🚀 عمود الإجراءات */}
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
              {transactions.map(trx => (
                <tr key={trx.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : trx.type === 'expense' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {trx.type === 'income' ? <ArrowDownRight size={18}/> : trx.type === 'expense' ? <ArrowUpRight size={18}/> : <ArrowRightLeft size={18}/>}
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-bold ${textMain}`}>{trx.desc}</td>
                  <td className={`px-6 py-4 font-bold ${textMuted}`}>{trx.account}</td>
                  <td className={`px-6 py-4 text-xs font-bold ${textMuted}`}>{trx.date}</td>
                  <td className={`px-6 py-4 font-black font-mono ${isRtl ? 'text-start' : 'text-end'} ${trx.type === 'income' ? 'text-emerald-500' : trx.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`} dir="ltr">
                    {trx.type === 'expense' ? '-' : '+'}{trx.amount.toLocaleString()} MAD
                  </td>
                  {/* 🚀 زر حذف المعاملة */}
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDeleteTransaction(trx.id)}
                      className={`p-2 rounded-lg opacity-50 group-hover:opacity-100 transition-all ${isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'}`}
                      title="حذف المعاملة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className={`p-8 text-center font-bold ${textMuted}`}>لا توجد معاملات حالياً.</div>
          )}
        </div>
      </div>

      <ActionModal />
    </div>
  );
}