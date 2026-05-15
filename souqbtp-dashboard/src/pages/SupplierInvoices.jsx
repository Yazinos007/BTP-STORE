import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { FileText, Search, Loader2 } from 'lucide-react'; 

export default function SupplierInvoices() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (supplier?.id) fetchInvoices();
  }, [supplier]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      // 1. جلب هويات البضاعة
      const { data: myProducts } = await supabase.from('products').select('id').eq('supplier_id', targetId);
      const myProductIds = new Set(myProducts?.map(p => p.id) || []);

      // 2. جلب كل الفواتير واستخراج التي تحتوي بضاعتنا فقط
      const { data: allInvoices, error } = await supabase.from('documents').select('*').eq('type', 'Facture').order('created_at', { ascending: false });
      if (error) throw error;

      const myInvoices = (allInvoices || []).filter(inv => (inv.items || []).some(item => myProductIds.has(item.id)));
      
      setInvoices(myInvoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.ref_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <FileText className="text-emerald-500" size={32} />
          {language === 'fr' ? 'Facturation B2B' : 'الفواتير الكبرى B2B'}
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={language === 'fr' ? 'Recherche...' : 'بحث...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-black border-b border-slate-700">
            <tr>
              <th className="p-5">{language === 'fr' ? 'Référence' : 'المرجع'}</th>
              <th className="p-5">{language === 'fr' ? 'Client' : 'العميل'}</th>
              <th className="p-5">{language === 'fr' ? 'Date' : 'التاريخ'}</th>
              <th className="p-5 text-right">{language === 'fr' ? 'Montant' : 'المبلغ'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr><td colSpan="4" className="p-10 text-center"><Loader2 size={30} className="animate-spin text-emerald-500 mx-auto"/></td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-slate-500">Aucune facture</td></tr>
            ) : (
              filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-700/30">
                  <td className="p-5 font-black text-emerald-400">#{inv.ref_number}</td>
                  <td className="p-5 font-bold text-white">{language === 'fr' ? 'Client B2B' : 'تاجر B2B'}</td>
                  <td className="p-5 text-slate-400 text-sm">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="p-5 text-right font-black text-xl text-white">{Number(inv.total_amount).toLocaleString()} DH</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}