import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import useSupplierStore from '../../store/useSupplierStore';
import { FileText, Search, Download, Loader2, Trash2 } from 'lucide-react'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function B2bInvoices() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const { supplier } = useSupplierStore();

  const translations = {
    ar: {
      title: 'الفواتير الكبرى B2B', subtitle: 'الأرشيف الرسمي لمبيعات الجملة الموثقة.',
      searchPlaceholder: 'رقم الفاتورة أو التاجر...', filterAll: 'الكل', filterFacture: 'الفواتير', filterDelivery: 'وصولات التسليم',
      ref: 'المرجع', client: 'التاجر/العميل', date: 'التاريخ', type: 'النوع', amount: 'المبلغ', actions: 'إجراءات',
      empty: 'لا توجد وثائق مطابقة.', loading: 'جاري التحميل...', currency: 'درهم', defaultB2B: 'تاجر B2B',
      confirmDelete: 'هل أنت متأكد من حذف هذه الفاتورة؟', successDelete: '✅ تم الحذف بنجاح', errorDelete: 'خطأ في الحذف',
      pdfBilledTo: 'فاتورة إلى :', pdfDesignation: 'البيان', pdfQty: 'الكمية', pdfPrice: 'السعر', pdfTotalNet: 'الإجمالي الصافي للدفع',
      pdfCertified: 'وثيقة معتمدة من SouqBTP Cloud ERP'
    },
    fr: {
      title: 'Facturation B2B', subtitle: 'Archive officielle des ventes certifiées.',
      searchPlaceholder: 'N° Facture ou Client...', filterAll: 'Tous', filterFacture: 'Factures', filterDelivery: 'Bons de Livraison',
      ref: 'Référence', client: 'Client', date: 'Date', type: 'Type', amount: 'Montant', actions: 'Actions',
      empty: 'Aucun document trouvé.', loading: 'Chargement...', currency: 'MAD', defaultB2B: 'Client B2B (Auto)',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette facture ?', successDelete: '✅ Document supprimé', errorDelete: 'Erreur de suppression',
      pdfBilledTo: 'Facturé à :', pdfDesignation: 'Désignation', pdfQty: 'Qté', pdfPrice: 'Prix', pdfTotalNet: 'Total Net à Payer',
      pdfCertified: 'Document certifié par SouqBTP Cloud ERP'
    },
    en: {
      title: 'B2B Invoicing', subtitle: 'Official archive of certified wholesale sales.',
      searchPlaceholder: 'Invoice No. or Client...', filterAll: 'All', filterFacture: 'Invoices', filterDelivery: 'Delivery Notes',
      ref: 'Reference', client: 'Client', date: 'Date', type: 'Type', amount: 'Amount', actions: 'Actions',
      empty: 'No documents found.', loading: 'Loading...', currency: 'MAD', defaultB2B: 'B2B Client (Auto)',
      confirmDelete: 'Are you sure you want to delete this invoice?', successDelete: '✅ Document deleted successfully', errorDelete: 'Deletion error',
      pdfBilledTo: 'Billed to:', pdfDesignation: 'Description', pdfQty: 'Qty', pdfPrice: 'Price', pdfTotalNet: 'Total Net to Pay',
      pdfCertified: 'Document certified by SouqBTP Cloud ERP'
    }
  };
  const t = translations[language] || translations.ar;
  
  const [invoices, setInvoices] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [b2bNames, setB2bNames] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    // 🛡️ السماح بجلب البيانات سواء كان المورد موجوداً أو لتجربة الواجهة
    fetchInvoices();
  }, [supplier]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier?.role === 'employé' ? supplier?.supplier_id : supplier?.id;

      // محاكاة جلب البيانات في حال عدم توفر معرف المورد (لأغراض العرض والتطوير)
      if (!targetId) {
        setInvoices([
          { id: 1, ref_number: 'INV-2026-001', type: 'Facture', client_id: 'c1', total_amount: 45000, created_at: '2026-09-17T10:30:00Z', items: [{name: 'إسمنت بورتلاند', quantity: 50, price: 900}] },
          { id: 2, ref_number: 'BL-2026-089', type: 'Bon de Livraison', client_id: 'c2', total_amount: 12500, created_at: '2026-09-15T14:20:00Z', items: [{name: 'حديد تسليح', quantity: 2, price: 6250}] }
        ]);
        setMerchants({ 'c1': { store_name: 'شركة الأندلس للبناء' }, 'c2': { store_name: 'مقاولات الشرق' } });
        setIsLoading(false);
        return;
      }

      const { data: myProducts } = await supabase.from('products').select('name').eq('supplier_id', targetId);
      const myProductNames = new Set(myProducts?.map(p => (p.name || '').replace(/\s+/g, '').toLowerCase()) || []);

      const { data: allDocs, error } = await supabase
        .from('documents')
        .select('*') 
        .in('type', ['Facture', 'Bon de Livraison'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const myInvoices = (allDocs || []).filter(doc => 
        (doc.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase())) || doc.owner_id === targetId
      );

      setInvoices(myInvoices);

      const clientIds = [...new Set(myInvoices.map(d => d.client_id))].filter(Boolean);
      clientIds.forEach(id => fetchMerchantData(id));

      const b2bDocs = myInvoices.filter(d => !d.client_id && (d.ref_number || '').includes('-B2B-'));
      
      if (b2bDocs.length > 0) {
          const { data: pInvs } = await supabase.from('purchase_invoices').select('invoice_number, supplier_id');
          const { data: allMerchants } = await supabase.from('suppliers').select('id, store_name');
          
          const merchantDict = {};
          allMerchants?.forEach(m => merchantDict[m.id] = m.store_name);

          const newB2BNames = {};
          pInvs?.forEach(pinv => {
              const suffix = (pinv.invoice_number || '').split('-B2B-')[1];
              if (suffix) {
                  const matchedDocs = b2bDocs.filter(d => (d.ref_number || '').endsWith(`-B2B-${suffix}`));
                  matchedDocs.forEach(d => {
                      if (merchantDict[pinv.supplier_id]) {
                          newB2BNames[d.id] = merchantDict[pinv.supplier_id];
                      }
                  });
              }
          });
          setB2bNames(newB2BNames);
      }

    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMerchantData = async (id) => {
    if (merchants[id]) return;
    const { data: clientData } = await supabase.from('clients').select('full_name').eq('id', id).single();
    if (clientData) {
       setMerchants(prev => ({ ...prev, [id]: { store_name: clientData.full_name } }));
       return;
    }
    const { data: supData } = await supabase.from('suppliers').select('store_name').eq('id', id).single();
    if (supData) {
       setMerchants(prev => ({ ...prev, [id]: supData }));
    }
  };

  const getClientName = (inv) => {
    if (merchants[inv.client_id]?.store_name) return merchants[inv.client_id].store_name;
    if (b2bNames[inv.id]) return b2bNames[inv.id];
    return t.defaultB2B;
  };

  const handleDownloadPDF = async (invoice) => {
    const merchantName = getClientName(invoice);
    const isRTL = language === 'ar';
    const alignStart = isRTL ? 'right' : 'left';
    const alignEnd = isRTL ? 'left' : 'right';
    
    const date = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(new Date(invoice.created_at));
    
    const printElement = document.createElement('div');
    printElement.style.padding = '40px';
    printElement.style.width = '800px';
    printElement.style.backgroundColor = 'white';
    printElement.style.color = 'black';
    printElement.style.fontFamily = 'Arial, sans-serif';
    printElement.style.position = 'absolute';
    printElement.style.left = '-9999px';
    printElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    printElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="font-size: 32px; color: #1e293b; margin: 0; text-transform: uppercase;">${invoice.type}</h1>
          <p style="margin: 5px 0; color: #64748b;">Réf: ${invoice.ref_number}</p>
        </div>
        <div style="text-align: ${alignEnd};">
          <h2 style="margin: 0; color: #1e293b;">${supplier?.store_name || 'SOUQ BTP'}</h2>
          <p style="margin: 5px 0; color: #64748b;">Date: ${date}</p>
        </div>
      </div>
      <div style="margin-bottom: 40px; padding: 20px; background: #f8fafc; border-radius: 10px; text-align: ${alignStart};">
        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">${t.pdfBilledTo}</p>
        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1e293b;">${merchantName}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr style="background: #1e293b; color: white;">
            <th style="padding: 15px; text-align: ${alignStart};">${t.pdfDesignation}</th>
            <th style="padding: 15px; text-align: center;">${t.pdfQty}</th>
            <th style="padding: 15px; text-align: ${alignEnd};">${t.pdfPrice} (${t.currency})</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map(item => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 15px; font-weight: bold; text-align: ${alignStart};">${item.name}</td>
              <td style="padding: 15px; text-align: center;">${item.quantity}</td>
              <td style="padding: 15px; text-align: ${alignEnd};" dir="ltr">${Number(item.price).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align: ${alignEnd}; border-top: 2px solid #1e293b; padding-top: 20px;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">${t.pdfTotalNet}</p>
        <p style="font-size: 36px; font-weight: 900; color: #059669; margin: 5px 0;" dir="ltr">${Number(invoice.total_amount).toLocaleString()} ${t.currency}</p>
      </div>
      <div style="margin-top: 100px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
        <p style="font-size: 10px; color: #94a3b8;">${t.pdfCertified}</p>
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
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await supabase.from('documents').delete().eq('id', id);
      setInvoices(invoices.filter(inv => inv.id !== id));
      alert(t.successDelete);
    } catch (err) {
      alert(t.errorDelete);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const merchantName = getClientName(inv);
    const matchesSearch = (inv.ref_number || '').toLowerCase().includes(searchTerm.toLowerCase()) || merchantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  // 🎨 الألوان والتنسيقات المتوافقة
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
  const tableHeadBg = isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600';
  const tableRowHover = isDarkMode ? 'hover:bg-slate-800/40 divide-slate-800/50' : 'hover:bg-slate-50 divide-slate-100';

  return (
    <div className={`space-y-8 animate-fade-in max-w-7xl mx-auto pb-24`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${bgMain} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
            <FileText className="text-emerald-500" size={36} /> {t.title}
          </h2>
          <p className={`${textMuted} font-bold mt-2`}>{t.subtitle}</p>
        </div>

        {/* 🚀 Filters & Search */}
        <div className="flex flex-wrap gap-3 relative z-10 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full md:w-72 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 ${bgInput} border-2 rounded-xl outline-none focus:border-emerald-500 transition-all font-bold text-sm`}
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`${bgInput} border-2 rounded-xl px-5 py-3.5 outline-none focus:border-emerald-500 text-sm font-black cursor-pointer transition-all`}
          >
            <option value="All">{t.filterAll}</option>
            <option value="Facture">{t.filterFacture}</option>
            <option value="Bon de Livraison">{t.filterDelivery}</option>
          </select>
        </div>
      </div>

      {/* 🚀 Invoices Table */}
      <div className={`${bgMain} border-2 rounded-[2rem] overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start">
            <thead>
              <tr className={`border-b ${tableHeadBg} text-xs uppercase font-black`}>
                <th className="p-6 tracking-widest text-start">{t.ref}</th>
                <th className="p-6 tracking-widest text-start">{t.client}</th>
                <th className="p-6 tracking-widest text-start">{t.date}</th>
                <th className="p-6 tracking-widest text-start">{t.type}</th>
                <th className={`p-6 tracking-widest ${isRtl ? 'text-start' : 'text-end'}`}>{t.amount}</th>
                <th className="p-6 tracking-widest text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tableRowHover}`}>
              {isLoading ? (
                <tr><td colSpan="6" className="p-16 text-center"><Loader2 size={36} className="animate-spin text-emerald-500 mx-auto"/></td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" className={`p-16 text-center ${textMuted} font-black text-lg`}>{t.empty}</td></tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className="p-6 font-black text-emerald-500" dir="ltr">#{inv.ref_number}</td>
                    
                    <td className={`p-6 font-black ${textMain}`}>
                      {getClientName(inv)}
                    </td>
                    
                    <td className={`p-6 ${textMuted} text-sm font-bold`}>
                      {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA', { 
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      }).format(new Date(inv.created_at))}
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${inv.type === 'Facture' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className={`p-6 ${isRtl ? 'text-start' : 'text-end'} font-black text-xl ${textMain} font-mono`} dir="ltr">
                      {Number(inv.total_amount).toLocaleString()} <span className={`text-xs ${textMuted} font-black uppercase`}>{t.currency}</span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button onClick={() => handleDownloadPDF(inv)} className={`p-3 ${isDarkMode ? 'bg-slate-800 hover:bg-emerald-600 text-slate-300' : 'bg-slate-100 hover:bg-emerald-500 text-slate-600'} hover:text-white rounded-xl transition-all shadow-sm group-hover:scale-105`} title="تحميل PDF">
                          <Download size={18} />
                        </button>
                        <button onClick={() => handleDeleteInvoice(inv.id)} className={`p-3 ${isDarkMode ? 'bg-slate-800 hover:bg-red-600 text-slate-300' : 'bg-slate-100 hover:bg-red-500 text-slate-600'} hover:text-white rounded-xl transition-all shadow-sm group-hover:scale-105`} title="حذف">
                          <Trash2 size={18} />
                        </button>
                      </div>
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