import { useState, useEffect } from 'react';
import useDocumentStore from '../store/useDocumentStore';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore';
import useExternalSupplierStore from '../store/useExternalSupplierStore'; // 🌟 جلب الموردين لمعرفة أسماءهم
import { FileText, Search, Printer, Trash2, HardHat, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase'; // 🌟 جلب Supabase للاتصال بجدول المشتريات

const translations = {
  ar: {
    title: 'إدارة المستندات والفواتير', subtitle: 'أرشيف كامل لكل عروض الأسعار، الفواتير، وسندات التسليم.',
    search: 'ابحث برقم المستند أو اسم العميل/المورد...', all: 'الكل',
    docNo: 'رقم المستند', client: 'العميل / المورد', type: 'النوع', date: 'التاريخ', total: 'المجموع', actions: 'إجراءات',
    empty: 'لا توجد مستندات مسجلة بهذا القسم.', loading: 'جاري التحميل...',
    currency: 'درهم', confirmDelete: 'هل أنت متأكد من حذف هذا المستند؟'
  },
  fr: {
    title: 'Gestion des Documents', subtitle: 'Archive complète des Devis, Factures, BL et BC.',
    search: 'Rechercher par N°, Client/Fournisseur...', all: 'Tous',
    docNo: 'N° Document', client: 'Client / Fournisseur', type: 'Type', date: 'Date', total: 'Total', actions: 'Actions',
    empty: 'Aucun document trouvé.', loading: 'Chargement...',
    currency: 'MAD', confirmDelete: 'Voulez-vous vraiment supprimer ce document ?'
  }
};

export default function Invoices() {
  const { documents, isLoading, fetchDocuments, deleteDocument } = useDocumentStore();
  const { suppliers, fetchSuppliers } = useExternalSupplierStore(); // 🌟 لترجمة ID المورد إلى اسمه
  const { supplier } = useSupplierStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // 🌟 حالة جديدة لتخزين فواتير الشراء
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [isPurchasesLoading, setIsPurchasesLoading] = useState(false);

  useEffect(() => { 
    fetchDocuments(); 
    fetchSuppliers();
    fetchPurchaseInvoices();
  }, []);

  // 🌟 دالة جلب فواتير الشراء من الجدول الجديد
  const fetchPurchaseInvoices = async () => {
    setIsPurchasesLoading(true);
    try {
      const { data, error } = await supabase.from('purchase_invoices').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setPurchaseInvoices(data);
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
    } finally {
      setIsPurchasesLoading(false);
    }
  };

  // 🌟 دالة الحذف المحدثة (تحذف من الجدول الصحيح حسب نوع الفاتورة)
  const handleDelete = async (doc) => {
    if (window.confirm(t.confirmDelete)) {
      if (doc.isPurchase) {
        await supabase.from('purchase_invoices').delete().eq('id', doc.id);
        fetchPurchaseInvoices(); // تحديث القائمة
      } else {
        await deleteDocument(doc.id);
      }
    }
  };

  // 🖨️ دالة إعادة الطباعة (محدثة لتدعم الموردين)
  const handleReprint = (doc) => {
    const storeName = supplier?.store_name || 'ENTREPRISE SOUQBTP';
    const date = new Date(doc.created_at).toLocaleDateString('fr-FR');
    const clientName = doc.clients?.full_name || 'Inconnu';
    const items = doc.items || [];
    const partyLabel = doc.isPurchase ? 'Fournisseur' : 'Client'; // تغيير الكلمة حسب النوع
    
    const docHtml = `
      <html>
        <head>
          <title>${doc.type} - ${doc.ref_number}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
            .company h1 { color: #1e3a8a; margin: 0 0 10px 0; text-transform: uppercase; font-size: 28px; }
            .doc-info h2 { margin: 0 0 10px 0; color: #333; text-transform: uppercase; font-size: 24px; letter-spacing: 2px; }
            .client-box { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #1e3a8a; color: white; padding: 12px; text-align: left; font-size: 14px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .total-box { float: right; width: 300px; border: 2px solid #1e3a8a; border-radius: 8px; padding: 15px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .total-final { display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #1e3a8a; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px; }
            .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">
              <h1>${storeName}</h1>
              <p>Négoce de Matériaux de Construction<br/>Tél: ${supplier?.phone || '---'}</p>
            </div>
            <div class="doc-info" style="text-align: right;">
              <h2>${doc.type}</h2>
              <p><strong>N°:</strong> ${doc.ref_number}<br/><strong>Date:</strong> ${date}</p>
            </div>
          </div>
          <div class="client-box">
            <p style="margin:0 0 5px 0; font-size: 18px;"><strong>${partyLabel}:</strong> ${clientName}</p>
            ${doc.chantier ? `<p style="margin:5px 0 0 0; color: #d97706; font-weight: bold;">Chantier: ${doc.chantier}</p>` : ''}
          </div>
          <table>
            <thead><tr><th>Désignation</th><th style="text-align:center">Qté</th><th style="text-align:center">Unité</th><th style="text-align:right">P.U (MAD)</th><th style="text-align:right">Montant (MAD)</th></tr></thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td style="text-align:center">${item.quantity}</td>
                  <td style="text-align:center">${item.unit || 'U'}</td>
                  <td style="text-align:right">${item.purchase_price || item.price}</td>
                  <td style="text-align:right; font-weight:bold;">${(item.quantity * (item.purchase_price || item.price)).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-box">
            <div class="total-row"><span>Total HT:</span><span>${(doc.total_amount * 0.8).toLocaleString()}</span></div>
            <div class="total-row"><span>TVA (20%):</span><span>${(doc.total_amount * 0.2).toLocaleString()}</span></div>
            <div class="total-final"><span>Total TTC:</span><span>${Number(doc.total_amount).toLocaleString()} MAD</span></div>
          </div>
          <div style="clear:both;"></div>
          <div class="footer"><p>Document généré par SouqBTP ERP. Copie d'archive.</p></div>
        </body>
      </html>
    `;
    const iframe = document.createElement('iframe'); iframe.style.display = 'none'; document.body.appendChild(iframe); iframe.contentDocument.write(docHtml); iframe.contentDocument.close(); setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => document.body.removeChild(iframe), 1000); }, 500);
  };

  const safeDocuments = Array.isArray(documents) ? documents : [];

  // 🌟 تحويل فواتير الشراء لتشبه شكل فواتير البيع لكي يسهل عرضها في نفس الجدول
  const formattedPurchases = purchaseInvoices.map(inv => {
    const supplierName = suppliers.find(s => s.id === inv.external_supplier_id)?.name || 'Fournisseur';
    return {
      id: inv.id,
      ref_number: inv.invoice_number,
      type: 'Facture Achat',
      created_at: inv.created_at,
      total_amount: inv.total_amount,
      items: inv.items,
      isPurchase: true,
      clients: { full_name: supplierName }
    };
  });

  // 🌟 دمج جميع المستندات وترتيبها من الأحدث للأقدم
  const allCombinedDocs = [...safeDocuments, ...formattedPurchases].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filteredDocs = allCombinedDocs.filter(doc => {
    const matchesSearch = doc.ref_number?.toLowerCase().includes(searchTerm.toLowerCase()) || doc.clients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' ? true : doc.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getDocStyle = (type) => {
    switch (type) {
      case 'Devis': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Facture': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Facture Achat': return 'bg-teal-50 text-teal-700 border-teal-200 shadow-sm'; // 🌟 لون مميز لفواتير الشراء
      case 'Bon de Livraison': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Bon de Commande': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h2>
          <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
        </div>
      </div>

      {/* 📑 أزرار التبويب (Tabs) الذكية المحدثة */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {['All', 'Facture', 'Facture Achat', 'Devis', 'Bon de Livraison', 'Bon de Commande'].map(tab => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border-2 ${activeTab === tab ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' : 'bg-white text-gray-500 border-transparent hover:border-gray-200'}`}
          >
            {tab === 'All' ? t.all : tab}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
              {tab === 'All' ? allCombinedDocs.length : allCombinedDocs.filter(d => d.type === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} />
            <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all`} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.docNo}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.client}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.type}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.date}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-end uppercase tracking-wider text-xs">{t.total}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading || isPurchasesLoading ? (
                <tr><td colSpan="6" className="text-center py-12"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto" /></td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-gray-400 font-medium"><FileText size={40} className="mx-auto mb-3 opacity-20" />{t.empty}</td></tr>
              ) : filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-800 font-mono">{doc.ref_number}</td>
                  <td className="px-6 py-4">
                    <p className={`font-bold ${doc.isPurchase ? 'text-teal-700' : 'text-gray-800'}`}>
                      {doc.clients?.full_name || '---'}
                    </p>
                    {doc.chantier && <p className="text-xs font-bold text-orange-600 mt-1 flex items-center gap-1"><HardHat size={12}/> {doc.chantier}</p>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black border ${getDocStyle(doc.type)}`}>{doc.type}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                    {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'ar-MA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(doc.created_at))}
                  </td>
                  <td className="px-6 py-4 text-end font-black font-mono text-gray-800 text-base" dir="ltr">
                    {Number(doc.total_amount).toLocaleString()} <span className="text-[10px] font-bold text-gray-400 uppercase">{t.currency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleReprint(doc)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 bg-blue-50" title="Imprimer">
                        <Printer size={16} /> <span className="text-xs font-bold hidden xl:block">Imprimer</span>
                      </button>
                      <button onClick={() => handleDelete(doc)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer"><Trash2 size={16}/></button>
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