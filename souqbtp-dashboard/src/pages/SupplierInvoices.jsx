import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { FileText, Search, Download, Loader2 } from 'lucide-react'; // تم التأكد من الأيقونات هنا
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
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', supplier.id)
        .in('type', ['Facture', 'Bon de Livraison'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);

      const clientIds = [...new Set(data?.map(d => d.client_id))].filter(id => id);
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
    const merchantName = merchants[invoice.client_id]?.store_name || 'Client B2B';
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
      <div style="margin-bottom: 40px; padding: 20px; background: #f8fafc; border-radius: 10px;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Facturé à :</p>
        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1e293b;">${merchantName}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr style="background: #1e293b; color: white;">
            <th style="padding: 15px; text-align: left; border-radius: 8px 0 0 8px;">Désignation</th>
            <th style="padding: 15px; text-align: center;">Qté</th>
            <th style="padding: 15px; text-align: right; border-radius: 0 8px 8px 0;">Prix (DH)</th>
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
        <p style="font-size: 14px; color: #64748b; margin: 0;">Total Net à Payer</p>
        <p style="font-size: 36px; font-weight: 900; color: #059669; margin: 5px 0;">${Number(invoice.total_amount).toLocaleString()} DH</p>
      </div>
      <div style="margin-top: 100px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
        <p style="font-size: 10px; color: #94a3b8;">Document certifié par SouqBTP Cloud ERP</p>
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

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.ref_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          merchants[inv.client_id]?.store_name?.toLowerCase().includes(searchTerm.toLowerCase());
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
          <p className="text-slate-400 mt-1 font-medium italic">
            {language === 'fr' ? 'Archive officielle des ventes certifiées.' : 'الأرشيف الرسمي لمبيعات الجملة الموثقة.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder={language === 'fr' ? 'N° Facture ou Client...' : 'رقم الفاتورة أو التاجر...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 transition-all w-64 text-sm"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-sm font-bold"
          >
            <option value="All">{language === 'fr' ? 'Tous' : 'الكل'}</option>
            <option value="Facture">{language === 'fr' ? 'Factures' : 'الفواتير'}</option>
            <option value="Bon de Livraison">{language === 'fr' ? 'Bons de Livraison' : 'وصولات التسليم'}</option>
          </select>
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
                <th className="p-5 tracking-widest text-center">{language === 'fr' ? 'Action' : 'تحميل'}</th>
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
                    <td className="p-5 font-bold text-white">{merchants[inv.client_id]?.store_name || '...'}</td>
                    <td className="p-5 text-slate-400 text-sm font-medium">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${inv.type === 'Facture' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="p-5 text-right font-black text-xl text-white">
                      {Number(inv.total_amount).toLocaleString()} <span className="text-xs text-slate-500 font-bold">DH</span>
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => handleDownloadPDF(inv)}
                        className="p-2.5 bg-slate-700 hover:bg-emerald-600 rounded-xl transition-all group-hover:scale-110 shadow-lg"
                      >
                        <Download size={18} className="text-slate-300 group-hover:text-white" />
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