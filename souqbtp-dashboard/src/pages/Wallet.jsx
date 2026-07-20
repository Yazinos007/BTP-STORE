import { useState, useEffect } from 'react';
import useSupplierStore from '../store/useSupplierStore';
import useWalletStore from '../store/useWalletStore';
import useSettingsStore from '../store/useSettingsStore';
import { Wallet as WalletIcon, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const translations = {
  ar: {
    title: 'المحفظة المالية',
    balanceTitle: 'الرصيد المتاح للسحب',
    currency: 'درهم',
    requestTitle: 'طلب سحب أرباح',
    amountLabel: 'المبلغ المطلوب (درهم)',
    amountPlaceholder: 'الحد الأدنى 100 درهم',
    submitBtn: 'تأكيد السحب',
    submittingBtn: 'جاري الإرسال...',
    historyTitle: 'سجل عمليات السحب',
    loading: 'جاري التحميل...',
    emptyHistory: 'لا توجد عمليات سحب سابقة.',
    opNumber: 'رقم العملية',
    amount: 'المبلغ',
    date: 'التاريخ',
    status: 'الحالة',
    successMsg: 'تم إرسال طلب السحب بنجاح!',
    errorBalance: 'الرصيد المطلوب أكبر من رصيدك المتاح!',
    errorGeneral: 'حدث خطأ: ',
    statuses: {
      pending: 'قيد المراجعة',
      approved: 'تم التحويل',
      rejected: 'مرفوض'
    }
  },
  fr: {
    title: 'Portefeuille Financier',
    balanceTitle: 'Solde disponible',
    currency: 'MAD',
    requestTitle: 'Demande de Retrait',
    amountLabel: 'Montant demandé (MAD)',
    amountPlaceholder: 'Minimum 100 MAD',
    submitBtn: 'Confirmer le Retrait',
    submittingBtn: 'Envoi en cours...',
    historyTitle: 'Historique des retraits',
    loading: 'Chargement...',
    emptyHistory: 'Aucun historique de retrait.',
    opNumber: 'N° Opération',
    amount: 'Montant',
    date: 'Date',
    status: 'Statut',
    successMsg: 'Demande de retrait envoyée avec succès !',
    errorBalance: 'Le montant demandé est supérieur à votre solde disponible !',
    errorGeneral: 'Erreur : ',
    statuses: {
      pending: 'En attente',
      approved: 'Transféré',
      rejected: 'Rejeté'
    }
  },
  en: {
    title: 'Financial Wallet',
    balanceTitle: 'Available Balance for Withdrawal',
    currency: 'MAD',
    requestTitle: 'Withdrawal Request',
    amountLabel: 'Requested Amount (MAD)',
    amountPlaceholder: 'Minimum 100 MAD',
    submitBtn: 'Confirm Withdrawal',
    submittingBtn: 'Sending...',
    historyTitle: 'Withdrawal History',
    loading: 'Loading...',
    emptyHistory: 'No previous withdrawals.',
    opNumber: 'Operation No.',
    amount: 'Amount',
    date: 'Date',
    status: 'Status',
    successMsg: 'Withdrawal request sent successfully!',
    errorBalance: 'Requested amount is greater than your available balance!',
    errorGeneral: 'Error: ',
    statuses: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    }
  }
};

const statusConfig = {
  pending: { color: 'text-orange-600 bg-orange-100', icon: Clock },
  approved: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
  rejected: { color: 'text-red-600 bg-red-100', icon: XCircle },
};

export default function Wallet() {
  const { supplier } = useSupplierStore();
  const { withdrawals, isLoading, fetchWithdrawals, requestWithdrawal } = useWalletStore();
  const { language } = useSettingsStore();
  
  // 🛡️ الترياق السحري للترجمة
  const t = translations[language] || translations['fr'];
  
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > (supplier?.wallet_balance || 0)) {
      setMessage(t.errorBalance);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const result = await requestWithdrawal(withdrawAmount);
    
    if (result.success) {
      setMessage(t.successMsg);
      setAmount('');
      setTimeout(() => setMessage(''), 4000);
    } else {
      setMessage(t.errorGeneral + result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* بطاقة الرصيد الحالي */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md flex flex-col justify-between h-48">
          <div className="flex items-center gap-3 opacity-80">
            <WalletIcon size={24} />
            <h3 className="font-medium text-lg">{t.balanceTitle}</h3>
          </div>
          <div>
            <h2 className="text-4xl font-bold" dir="ltr">
              {supplier?.wallet_balance?.toLocaleString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA') || '0.00'} <span className="text-xl font-normal opacity-80 uppercase">{t.currency}</span>
            </h2>
          </div>
        </div>

        {/* نموذج طلب سحب */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <ArrowDownLeft size={20} className="text-blue-600" />
            {t.requestTitle}
          </h3>
          
          {message && (
            <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${message.includes(t.successMsg.split(' ')[0]) || message.includes('بنجاح') || message.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleWithdraw} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.amountLabel}</label>
              <input
                type="number"
                min="100"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 font-bold"
                placeholder={t.amountPlaceholder}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="w-full sm:w-auto bg-gray-900 text-white px-8 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 h-10 font-bold shadow-md cursor-pointer"
            >
              {isSubmitting ? t.submittingBtn : t.submitBtn}
            </button>
          </form>
        </div>
      </div>

      {/* سجل العمليات */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">{t.historyTitle}</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 font-medium">{t.loading}</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium">
            <p>{t.emptyHistory}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.opNumber}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.amount}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.date}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-start">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {withdrawals.map((req) => {
                  const StatusIcon = statusConfig[req.status].icon;
                  return (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono" dir="ltr">{req.id.split('-')[0]}</td>
                      <td className="px-6 py-4 font-bold text-gray-800" dir="ltr">
                        {req.amount.toLocaleString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA')} <span className="text-xs font-normal text-gray-500 uppercase">{t.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(req.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[req.status].color}`}>
                          <StatusIcon size={14} />
                          {t.statuses[req.status]}
                        </span>
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
  );
}