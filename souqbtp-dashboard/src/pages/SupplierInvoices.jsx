import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { FileText, Search, Download, Loader2, Trash2 } from 'lucide-react'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SupplierInvoices() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  const [invoices, setInvoices] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (supplier?.id) fetchInvoices();
  }, [supplier]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      // 🎯 الشرط الذكي الصحيح
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      const { data, error } = await supabase
        .from('documents')
        .select('*') 
        .eq('owner_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);

      const clientIds = [...new Set((data || []).map(d => d.client_id))].filter(id => id);
      clientIds.forEach(id => fetchMerchantData(id));
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMerchantData = async (id) => {
    if (merchants[id]) return;
    const { data } = await supabase.from('suppliers').select('store_name').eq('id', id).single();
    if (data) setMerchants(prev => ({ ...prev, [id]: data }));
  };

  const handleDownloadPDF = async (invoice) => {
    const merchantName = merchants[invoice.client_id]?.store_name || (language === 'fr' ? 'Client B2B (Auto)' : 'تاجر B2B');
    const date = new Date(invoice.created_at).toLocaleDateString();
    
    const printElement = document.createElement('div');
    printElement.style.padding = '40px';
    printElement.style.width = '800px';
    printElement.style.backgroundColor = 'white';
    printElement.style.color = 'black';
    printElement.style.fontFamily = 'Arial, sans-serif';
    printElement.style.position = 'absolute';
    printElement.style.left = '-9999px';

    printElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="font-size: 32px; color: #1e293b; margin: 0; text-transform: uppercase;">${invoice.type}</h1>
          <p style="margin: 5px 0; color: #64748b;">Réf: ${invoice.ref_number}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #1e293b;">${supplier?.store_name || 'SOUQ BTP'}</h2>
          <p style="margin: 5px 0; color: #64748b;">Date: ${date}</p>
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr style="background: #1e293b; color: white;">
            <th style="padding: 15px; text-align: left;">Désignation</th>
            <th style="padding: 15px; text-align: center;">Qté</th>
            <th style="padding: 15px; text-align: right;">Prix (DH)</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map(item => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 15px; font-weight: bold;">${item.name}</td>
              <td style="padding: 15px; text-align: center;">${item.quantity}</td>
              <td style="padding: 15px; text-align: right;">${Number(item.price).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align: right; border-top: 2px solid #1e293b; padding-top: 20px;">
        <p style="font-size: 36px; font-weight: 900; color: #059669; margin: 5px 0;">${Number(invoice.total_amount).toLocaleString()} DH</p>
      </div>
    `;

    document.body.appendChild(printElement);
    try {
      const canvas = await html2canvas(printElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.type}_${invoice.ref_number}.pdf`);
    } catch(err) {
      console.error("PDF Error:", err);
    } finally {
      document.body.removeChild(printElement);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm(language === 'fr' ? "Êtes-vous sûr ?" : "هل أنت متأكد؟")) return;
    try {
      await supabase.from('documents').delete().eq('id', id);
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (err) {
      alert("Erreur de suppression");
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const merchantName = merchants[inv.client_id]?.store_name || 'Client B2B';
    // 🎯 حماية ضد الخطأ: إضافة fallback للرقم
    const matchesSearch = (inv.ref_number || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          merchantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <FileText className="text-emerald-500" size={32} />
            {language === 'fr' ? 'Facturation B2B' : 'الفواتير الكبرى B2B'}
          </h2>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase font-black">
                <th className="p-5 tracking-widest">{language === 'fr' ? 'Référence' : 'المرجع'}</th>
                <th className="p-5 tracking-widest">{language === 'fr' ? 'Client' : 'التاجر'}</th>
                <th className="p-5 tracking-widest">{language === 'fr' ? 'Date' : 'التاريخ'}</th>
                <th className="p-5 tracking-widest">{language === 'fr' ? 'Type' : 'النوع'}</th>
                <th className="p-5 tracking-widest text-right">{language === 'fr' ? 'Montant' : 'المبلغ'}</th>
                <th className="p-5 tracking-widest text-center">{language === 'fr' ? 'Actions' : 'إجراءات'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr><td colSpan="6" className="p-10 text-center"><Loader2 size={30} className="animate-spin text-emerald-500 mx-auto"/></td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-slate-500">{language === 'fr' ? 'Aucune facture trouvée' : 'لا توجد فواتير'}</td></tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-5 font-black text-emerald-400">#{inv.ref_number}</td>
                    <td className="p-5 font-bold text-white">
                      {merchants[inv.client_id]?.store_name || (language === 'fr' ? 'Client B2B (Auto)' : 'تاجر B2B')}
                    </td>
                    <td className="p-5 text-slate-400 text-sm font-medium">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="p-5 text-right font-black text-xl text-white">
                      {Number(inv.total_amount).toLocaleString()} <span className="text-xs text-slate-500 font-bold">DH</span>
                    </td>
                    <td className="p-5 flex justify-center items-center gap-2">
                      <button onClick={() => handleDownloadPDF(inv)} className="p-2.5 bg-slate-700 hover:bg-emerald-600 rounded-xl transition-all">
                        <Download size={18} className="text-slate-300" />
                      </button>
                      <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2.5 bg-slate-700 hover:bg-red-600 rounded-xl transition-all">
                        <Trash2 size={18} className="text-slate-300" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}