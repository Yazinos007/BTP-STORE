import { useState, useEffect } from 'react';
import useSupplierStore from '../store/useSupplierStore';
import useWalletStore from '../store/useWalletStore';
import { Wallet as WalletIcon, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusConfig = {
  pending: { label: 'قيد المراجعة', color: 'text-orange-600 bg-orange-100', icon: Clock },
  approved: { label: 'تم التحويل', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  rejected: { label: 'مرفوض', color: 'text-red-600 bg-red-100', icon: XCircle },
};

export default function Wallet() {
  const { supplier } = useSupplierStore();
  const { withdrawals, isLoading, fetchWithdrawals, requestWithdrawal } = useWalletStore();
  
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > supplier.wallet_balance) {
      setMessage('الرصيد المطلوب أكبر من رصيدك المتاح!');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const result = await requestWithdrawal(withdrawAmount);
    
    if (result.success) {
      setMessage('تم إرسال طلب السحب بنجاح!');
      setAmount('');
      setTimeout(() => setMessage(''), 4000);
    } else {
      setMessage('حدث خطأ: ' + result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">المحفظة المالية</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* بطاقة الرصيد الحالي */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md flex flex-col justify-between h-48">
          <div className="flex items-center gap-3 opacity-80">
            <WalletIcon size={24} />
            <h3 className="font-medium text-lg">الرصيد المتاح للسحب</h3>
          </div>
          <div>
            <h2 className="text-4xl font-bold">
              {supplier?.wallet_balance?.toLocaleString('ar-MA') || '0.00'} <span className="text-xl font-normal opacity-80">درهم</span>
            </h2>
          </div>
        </div>

        {/* نموذج طلب سحب */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <ArrowDownLeft size={20} className="text-blue-600" />
            طلب سحب أرباح
          </h3>
          
          {message && (
            <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${message.includes('بنجاح') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleWithdraw} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المطلوب (درهم)</label>
              <input
                type="number"
                min="100"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="الحد الأدنى 100 درهم"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="bg-gray-900 text-white px-8 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 h-10"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'تأكيد السحب'}
            </button>
          </form>
        </div>
      </div>

      {/* سجل العمليات */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">سجل عمليات السحب</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>لا توجد عمليات سحب سابقة.</p>
          </div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">رقم العملية</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">المبلغ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">التاريخ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withdrawals.map((req) => {
                const StatusIcon = statusConfig[req.status].icon;
                return (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{req.id.split('-')[0]}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{req.amount.toLocaleString('ar-MA')} درهم</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(req.created_at).toLocaleDateString('ar-MA')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[req.status].color}`}>
                        <StatusIcon size={14} />
                        {statusConfig[req.status].label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}