import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import useSupplierStore from '../../store/useSupplierStore';
import { 
  FileText, Search, Download, Loader2, Trash2, Plus, 
  X, FilePlus, Calculator, Save 
} from 'lucide-react'; 
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
      title: 'الفواتير الكبرى B2B', subtitle: 'الأرشيف الرسمي لإنشاء وإدارة المبيعات.',
      searchPlaceholder: 'رقم الفاتورة أو التاجر...', filterAll: 'الكل', filterFacture: 'الفواتير', filterDelivery: 'وصولات التسليم',
      ref: 'المرجع', client: 'العميل / التاجر', date: 'التاريخ', type: 'النوع', amount: 'المبلغ', actions: 'إجراءات',
      empty: 'لا توجد وثائق مطابقة.', loading: 'جاري التحميل...', currency: 'درهم', defaultB2B: 'تاجر B2B',
      confirmDelete: 'هل أنت متأكد من حذف هذه الوثيقة؟', successDelete: '✅ تم الحذف بنجاح', errorDelete: 'خطأ في الحذف',
      pdfBilledTo: 'موجه إلى :', pdfDesignation: 'البيان', pdfQty: 'الكمية', pdfPrice: 'السعر', pdfTotalNet: 'الإجمالي الصافي للدفع',
      pdfCertified: 'وثيقة معتمدة من SouqBTP Cloud ERP',
      // ترجمات إنشاء المستند الجديد
      createDoc: 'إنشاء مستند جديد', docType: 'نوع المستند', clientName: 'اسم العميل / الشركة',
      tva: 'نسبة الضريبة (TVA)', addItem: 'إضافة سطر جديد', totalHT: 'الإجمالي (HT):',
      totalTTC: 'الإجمالي (TTC):', saveDoc: 'حفظ وإصدار المستند', docTypes: {
        'Facture': 'فاتورة (Facture)', 'Devis': 'عرض سعر (Devis)', 'Bon de Livraison': 'سند تسليم (BL)', 'Bon de Commande': 'سند طلب (BC)'
      }
    },
    fr: {
      title: 'Facturation B2B', subtitle: 'Archive officielle pour créer et gérer les ventes.',
      searchPlaceholder: 'N° Facture ou Client...', filterAll: 'Tous', filterFacture: 'Factures', filterDelivery: 'Bons de Livraison',
      ref: 'Référence', client: 'Client / Prospect', date: 'Date', type: 'Type', amount: 'Montant', actions: 'Actions',
      empty: 'Aucun document trouvé.', loading: 'Chargement...', currency: 'MAD', defaultB2B: 'Client B2B (Auto)',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce document ?', successDelete: '✅ Document supprimé', errorDelete: 'Erreur de suppression',
      pdfBilledTo: 'Facturé / Adressé à :', pdfDesignation: 'Désignation', pdfQty: 'Qté', pdfPrice: 'Prix', pdfTotalNet: 'Total Net à Payer',
      pdfCertified: 'Document certifié par SouqBTP Cloud ERP',
      createDoc: 'Créer un Nouveau Document', docType: 'Type de document', clientName: 'Nom du Prospect / Client',
      tva: 'Taux TVA (%)', addItem: 'Ajouter une ligne', totalHT: 'Total HT :',
      totalTTC: 'Total TTC :', saveDoc: 'Enregistrer le Document', docTypes: {
        'Facture': 'Facture', 'Devis': 'Devis', 'Bon de Livraison': 'Bon de Livraison (BL)', 'Bon de Commande': 'Bon de Commande (BC)'
      }
    },
    en: {
      title: 'B2B Invoicing', subtitle: 'Official archive to create and manage sales.',
      searchPlaceholder: 'Invoice No. or Client...', filterAll: 'All', filterFacture: 'Invoices', filterDelivery: 'Delivery Notes',
      ref: 'Reference', client: 'Client / Prospect', date: 'Date', type: 'Type', amount: 'Amount', actions: 'Actions',
      empty: 'No documents found.', loading: 'Loading...', currency: 'MAD', defaultB2B: 'B2B Client (Auto)',
      confirmDelete: 'Are you sure you want to delete this document?', successDelete: '✅ Document deleted', errorDelete: 'Deletion error',
      pdfBilledTo: 'Billed / Addressed to:', pdfDesignation: 'Description', pdfQty: 'Qty', pdfPrice: 'Price', pdfTotalNet: 'Total Net to Pay',
      pdfCertified: 'Document certified by SouqBTP Cloud ERP',
      createDoc: 'Create New Document', docType: 'Document Type', clientName: 'Client / Company Name',
      tva: 'VAT Rate (%)', addItem: 'Add Line Item', totalHT: 'Total HT:',
      totalTTC: 'Total TTC:', saveDoc: 'Save Document', docTypes: {
        'Facture': 'Invoice', 'Devis': 'Quote (Devis)', 'Bon de Livraison': 'Delivery Note (BL)', 'Bon de Commande': 'Purchase Order (BC)'
      }
    }
  };
  const t = translations[language] || translations.ar;
  
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // 🚀 حالات نافذة إنشاء مستند جديد
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    type: 'Facture',
    clientName: '',
    tva: 20,
    items: [{ designation: '', quantity: 1, price: 0 }]
  });

  useEffect(() => {
    fetchInvoices();
  }, [supplier]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    // 🚀 جلب البيانات الوهمية كالعادة إذا لم تكن قاعدة البيانات مربوطة
    setTimeout(() => {
      setInvoices([
        { id: 1, ref_number: 'FAC-2026-001', type: 'Facture', client_name: 'شركة الأندلس للبناء', total_amount: 45000, created_at: new Date().toISOString(), items: [{name: 'إسمنت بورتلاند', quantity: 50, price: 900}] },
        { id: 2, ref_number: 'BL-2026-089', type: 'Bon de Livraison', client_name: 'مقاولات الشرق', total_amount: 12500, created_at: new Date().toISOString(), items: [{name: 'حديد تسليح', quantity: 2, price: 6250}] }
      ]);
      setIsLoading(false);
    }, 800);
  };

  // 🚀 دوال التحكم في أسطر الفاتورة الديناميكية
  const handleAddItem = () => {
    setDocForm({ ...docForm, items: [...docForm.items, { designation: '', quantity: 1, price: 0 }] });
  };

  const handleRemoveItem = (index) => {
    const newItems = docForm.items.filter((_, i) => i !== index);
    setDocForm({ ...docForm, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...docForm.items];
    newItems[index][field] = value;
    setDocForm({ ...docForm, items: newItems });
  };

  // الحساب اللحظي للإجمالي
  const totalHT = docForm.items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0)), 0);
  const tvaAmount = totalHT * (docForm.tva / 100);
  const totalTTC = totalHT + tvaAmount;

  // 🚀 حفظ المستند الجديد
  const handleSaveDocument = (e) => {
    e.preventDefault();
    if (!docForm.clientName || docForm.items.length === 0) return;

    // توليد مرجع فريد حسب النوع
    const prefix = docForm.type === 'Facture' ? 'FAC' : docForm.type === 'Devis' ? 'DEV' : docForm.type === 'Bon de Livraison' ? 'BL' : 'BC';
    const newDoc = {
      id: Date.now(),
      ref_number: `${prefix}-2026-${Math.floor(Math.random() * 1000)}`,
      type: docForm.type,
      client_name: docForm.clientName,
      total_amount: totalTTC,
      created_at: new Date().toISOString(),
      items: docForm.items.map(item => ({ name: item.designation, quantity: item.quantity, price: item.price }))
    };

    setInvoices([newDoc, ...invoices]);
    setIsCreateModalOpen(false);
    setDocForm({ type: 'Facture', clientName: '', tva: 20, items: [{ designation: '', quantity: 1, price: 0 }] });
  };

  // 📄 استخراج الـ PDF
  const handleDownloadPDF = async (invoice) => {
    const isRTL = language === 'ar';
    const alignStart = isRTL ? 'right' : 'left';
    const alignEnd = isRTL ? 'left' : 'right';
    const date = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(invoice.created_at));
    
    const printElement = document.createElement('div');
    printElement.style.padding = '40px'; printElement.style.width = '800px'; printElement.style.backgroundColor = 'white'; printElement.style.color = 'black'; printElement.style.fontFamily = 'Arial, sans-serif'; printElement.style.position = 'absolute'; printElement.style.left = '-9999px'; printElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    printElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px;">
        <div><h1 style="font-size: 32px; color: #1e293b; margin: 0; text-transform: uppercase;">${invoice.type}</h1><p style="margin: 5px 0; color: #64748b;">Réf: ${invoice.ref_number}</p></div>
        <div style="text-align: ${alignEnd};"><h2 style="margin: 0; color: #1e293b;">${supplier?.store_name || 'ENTREPRISE BTP'}</h2><p style="margin: 5px 0; color: #64748b;">Date: ${date}</p></div>
      </div>
      <div style="margin-bottom: 40px; padding: 20px; background: #f8fafc; border-radius: 10px; text-align: ${alignStart};">
        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">${t.pdfBilledTo}</p>
        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1e293b;">${invoice.client_name}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead><tr style="background: #1e293b; color: white;"><th style="padding: 15px; text-align: ${alignStart};">${t.pdfDesignation}</th><th style="padding: 15px; text-align: center;">${t.pdfQty}</th><th style="padding: 15px; text-align: ${alignEnd};">${t.pdfPrice} (${t.currency})</th></tr></thead>
        <tbody>
          ${(invoice.items || []).map(item => `
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 15px; font-weight: bold; text-align: ${alignStart};">${item.name}</td><td style="padding: 15px; text-align: center;">${item.quantity}</td><td style="padding: 15px; text-align: ${alignEnd};" dir="ltr">${Number(item.price).toLocaleString()}</td></tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align: ${alignEnd}; border-top: 2px solid #1e293b; padding-top: 20px;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">${t.pdfTotalNet}</p>
        <p style="font-size: 36px; font-weight: 900; color: #059669; margin: 5px 0;" dir="ltr">${Number(invoice.total_amount).toLocaleString()} ${t.currency}</p>
      </div>
      <div style="margin-top: 100px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px;"><p style="font-size: 10px; color: #94a3b8;">${t.pdfCertified}</p></div>
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
    } catch(err) { console.error(err); } finally { document.body.removeChild(printElement); }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = (inv.ref_number || '').toLowerCase().includes(searchTerm.toLowerCase()) || (inv.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
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

        {/* 🚀 Filters & Create Button */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
            <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full md:w-64 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 ${bgInput} border-2 rounded-xl outline-none focus:border-emerald-500 transition-all font-bold text-sm`} />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${bgInput} border-2 rounded-xl px-5 py-3.5 outline-none focus:border-emerald-500 text-sm font-black cursor-pointer transition-all`}>
            <option value="All">{t.filterAll}</option><option value="Facture">{t.filterFacture}</option><option value="Devis">Devis</option><option value="Bon de Livraison">{t.filterDelivery}</option>
          </select>
          
          {/* زر إنشاء المستند الجديد */}
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
            <Plus size={18} /> <span className="hidden md:inline">{t.createDoc}</span>
          </button>
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
                    <td className={`p-6 font-black ${textMain}`}>{inv.client_name}</td>
                    <td className={`p-6 ${textMuted} text-sm font-bold`}>{new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(inv.created_at))}</td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${inv.type === 'Facture' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : inv.type === 'Devis' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className={`p-6 ${isRtl ? 'text-start' : 'text-end'} font-black text-xl ${textMain} font-mono`} dir="ltr">
                      {Number(inv.total_amount).toLocaleString()} <span className={`text-xs ${textMuted} font-black uppercase`}>{t.currency}</span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button onClick={() => handleDownloadPDF(inv)} className={`p-3 ${isDarkMode ? 'bg-slate-800 hover:bg-emerald-600 text-slate-300' : 'bg-slate-100 hover:bg-emerald-500 text-slate-600'} hover:text-white rounded-xl transition-all shadow-sm group-hover:scale-105`} title="تحميل PDF"><Download size={18} /></button>
                        <button onClick={() => handleDeleteInvoice(inv.id)} className={`p-3 ${isDarkMode ? 'bg-slate-800 hover:bg-red-600 text-slate-300' : 'bg-slate-100 hover:bg-red-500 text-slate-600'} hover:text-white rounded-xl transition-all shadow-sm group-hover:scale-105`} title="حذف"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 نافذة إنشاء المستندات (Modal Créer Devis/Facture/BL) 🚀 */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col`}>
            
            <div className={`p-6 border-b ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex justify-between items-center`}>
              <h3 className={`text-xl font-black ${textMain} flex items-center gap-3`}><FilePlus className="text-emerald-500" /> {t.createDoc}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="docForm" onSubmit={handleSaveDocument} className="space-y-6">
                
                {/* 1. الإعدادات الأساسية للوثيقة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${textMuted}`}>{t.docType}</label>
                    <select value={docForm.type} onChange={(e) => setDocForm({...docForm, type: e.target.value})} className={`w-full p-4 rounded-xl border outline-none font-bold text-sm ${bgInput}`}>
                      {Object.keys(t.docTypes).map(key => <option key={key} value={key}>{t.docTypes[key]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className={`text-xs font-bold ${textMuted}`}>{t.clientName}</label>
                    <input required type="text" placeholder="..." value={docForm.clientName} onChange={(e) => setDocForm({...docForm, clientName: e.target.value})} className={`w-full p-4 rounded-xl border outline-none font-bold text-sm focus:border-emerald-500 ${bgInput}`} />
                  </div>
                </div>

                {/* 2. جدول الأسطر (السلع/الخدمات) */}
                <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 md:p-6`}>
                  {/* عناوين الجدول (تظهر فقط في الشاشات الكبيرة) */}
                  <div className={`hidden md:grid grid-cols-12 gap-4 mb-3 px-2 text-[11px] font-black uppercase tracking-widest ${textMuted}`}>
                    <div className="col-span-6">{t.pdfDesignation}</div>
                    <div className="col-span-2 text-center">{t.pdfQty}</div>
                    <div className="col-span-3 text-center">{t.pdfPrice} ({t.currency})</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {docForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-center animate-slide-down">
                      <div className="md:col-span-6">
                        <input required type="text" placeholder="Ex: Ciment Portland..." value={item.designation} onChange={(e) => handleItemChange(index, 'designation', e.target.value)} className={`w-full p-3.5 rounded-xl border outline-none font-bold text-sm focus:border-emerald-500 ${bgInput}`} />
                      </div>
                      <div className="md:col-span-2">
                        <input required type="number" min="1" placeholder="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className={`w-full p-3.5 rounded-xl border outline-none font-bold text-sm text-center focus:border-emerald-500 ${bgInput}`} />
                      </div>
                      <div className="md:col-span-3">
                        <input required type="number" min="0" placeholder="0.00" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className={`w-full p-3.5 rounded-xl border outline-none font-mono font-bold text-sm text-center focus:border-emerald-500 ${bgInput}`} />
                      </div>
                      <div className="md:col-span-1 text-center">
                        <button type="button" onClick={() => handleRemoveItem(index)} disabled={docForm.items.length === 1} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl disabled:opacity-30 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={handleAddItem} className="mt-2 text-blue-500 hover:text-blue-400 font-black text-sm flex items-center gap-2 transition-colors">
                    <Plus size={16} /> {t.addItem}
                  </button>
                </div>

                {/* 3. الملخص المالي والضريبة */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4">
                  <div className="w-full md:w-48 space-y-2">
                    <label className={`text-xs font-bold ${textMuted}`}>{t.tva}</label>
                    <select value={docForm.tva} onChange={(e) => setDocForm({...docForm, tva: Number(e.target.value)})} className={`w-full p-4 rounded-xl border outline-none font-bold text-sm ${bgInput}`}>
                      <option value="20">20%</option>
                      <option value="14">14%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  
                  <div className={`w-full md:w-72 p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`flex justify-between items-center mb-3 text-sm font-bold ${textMuted}`}>
                      <span>{t.totalHT}</span>
                      <span className="font-mono" dir="ltr">{totalHT.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between items-center mb-4 text-sm font-bold ${textMuted}`}>
                      <span>TVA ({docForm.tva}%) :</span>
                      <span className="font-mono" dir="ltr">{tvaAmount.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between items-center pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                      <span className={`font-black ${textMain}`}>{t.totalTTC}</span>
                      <span className="text-xl font-black text-emerald-500 font-mono" dir="ltr">{totalTTC.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex justify-end`}>
              <button form="docForm" type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                <Save size={20} /> {t.saveDoc}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}