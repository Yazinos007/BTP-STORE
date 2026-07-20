import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { FileSignature, Search, Download, CheckCircle, FileText, Loader2, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const translations = {
  ar: {
    title: 'العقود والتوقيعات',
    subtitle: 'الأرشيف القانوني لجميع طلبات التزويد الموقعة رقمياً.',
    searchPlaceholder: 'ابحث عن عقد أو تاجر...',
    noContracts: 'لا توجد عقود',
    noContractsDesc: 'العقود التي يتم توقيعها ستظهر في هذا الأرشيف.',
    client: 'العميل',
    contractAmount: 'قيمة العقد',
    digitalSignature: 'التوقيع الرقمي',
    downloadPdf: 'تحميل كملف PDF',
    errorPdf: 'حدث خطأ أثناء تحميل الملف',
    unknownClient: 'عميل غير معروف',
    pdfTitle: 'عقد توريد B2B',
    pdfPoNumber: 'رقم الطلب (PO):',
    pdfDate: 'تاريخ الإنشاء:',
    pdfStatus: 'الحالة:',
    pdfApprovedSigned: 'مُعتمد وموقع',
    pdfSupplier: 'المورد (الجملة):',
    pdfRetailer: 'العميل (التجزئة):',
    pdfArticle: 'المادة',
    pdfQty: 'الكمية',
    pdfUnitPrice: 'سعر الوحدة',
    pdfTotal: 'المبلغ الإجمالي:',
    pdfSupplierSign: 'المورد (الجملة)',
    pdfApproved: 'مُعتمد',
    pdfCertified: 'مُعتمد رقمياً',
    pdfClientSign: 'العميل (التجزئة)',
    pdfSignedOn: 'وُقّع في',
    pdfSecureDoc: '|| ||| | || |||| | ||| | || |||| مستند B2B آمن || ||| | || ||||',
    pdfTransId: 'رقم المعاملة:',
    pdfFilename: 'عقد_B2B_',
    currency: 'درهم'
  },
  fr: {
    title: 'Contrats & Signatures',
    subtitle: 'Archive légale de tous les bons de commande signés.',
    searchPlaceholder: 'Rechercher un contrat...',
    noContracts: 'Aucun contrat trouvé',
    noContractsDesc: 'Les contrats signés apparaîtront ici.',
    client: 'Client',
    contractAmount: 'Montant du Contrat',
    digitalSignature: 'Signature Numérique',
    downloadPdf: 'Télécharger PDF',
    errorPdf: 'Erreur lors de la génération du PDF',
    unknownClient: 'Client Inconnu',
    pdfTitle: 'CONTRAT DE FOURNITURE B2B',
    pdfPoNumber: 'N° de Commande (PO) :',
    pdfDate: 'Date de création :',
    pdfStatus: 'Statut :',
    pdfApprovedSigned: 'Approuvé & Signé',
    pdfSupplier: 'Fournisseur (Grossiste) :',
    pdfRetailer: 'Client (Détaillant) :',
    pdfArticle: 'Article',
    pdfQty: 'Quantité',
    pdfUnitPrice: 'Prix Unitaire',
    pdfTotal: 'MONTANT TOTAL :',
    pdfSupplierSign: 'Le Fournisseur (Grossiste)',
    pdfApproved: 'APPROUVÉ',
    pdfCertified: 'Certifié numériquement',
    pdfClientSign: 'Le Client (Détaillant)',
    pdfSignedOn: 'Signé le',
    pdfSecureDoc: '|| ||| | || |||| | ||| | || |||| B2B SECURE DOCUMENT || ||| | || ||||',
    pdfTransId: 'ID de Transaction :',
    pdfFilename: 'Contrat_B2B_',
    currency: 'MAD'
  },
  en: {
    title: 'Contracts & Signatures',
    subtitle: 'Legal archive of all signed purchase orders.',
    searchPlaceholder: 'Search for a contract...',
    noContracts: 'No contracts found',
    noContractsDesc: 'Signed contracts will appear in this archive.',
    client: 'Client',
    contractAmount: 'Contract Amount',
    digitalSignature: 'Digital Signature',
    downloadPdf: 'Download PDF',
    errorPdf: 'Error generating PDF',
    unknownClient: 'Unknown Client',
    pdfTitle: 'B2B SUPPLY CONTRACT',
    pdfPoNumber: 'PO Number:',
    pdfDate: 'Creation Date:',
    pdfStatus: 'Status:',
    pdfApprovedSigned: 'Approved & Signed',
    pdfSupplier: 'Supplier (Wholesaler):',
    pdfRetailer: 'Client (Retailer):',
    pdfArticle: 'Item',
    pdfQty: 'Quantity',
    pdfUnitPrice: 'Unit Price',
    pdfTotal: 'TOTAL AMOUNT:',
    pdfSupplierSign: 'The Supplier (Wholesaler)',
    pdfApproved: 'APPROVED',
    pdfCertified: 'Digitally Certified',
    pdfClientSign: 'The Client (Retailer)',
    pdfSignedOn: 'Signed on',
    pdfSecureDoc: '|| ||| | || |||| | ||| | || |||| B2B SECURE DOCUMENT || ||| | || ||||',
    pdfTransId: 'Transaction ID:',
    pdfFilename: 'B2B_Contract_',
    currency: 'MAD'
  }
};

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { language } = useSettingsStore();
  // 🛡️ الترياق السحري
  const t = translations[language] || translations['fr'];

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .not('digital_signature', 'is', null) 
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setContracts(data);
        const merchantIds = [...new Set(data.map(req => req.merchant_id))];
        merchantIds.forEach(id => fetchMerchantData(id));
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMerchantData = async (id) => {
    if (!id || merchants[id]) return;
    const { data } = await supabase.from('suppliers').select('store_name').eq('id', id).single();
    if (data) setMerchants(prev => ({ ...prev, [id]: data }));
  };
  
  const handleDownloadPDF = async (contract) => {
    setIsLoading(true);
    try {
      const merchantName = merchants[contract.merchant_id]?.store_name || t.unknownClient;
      const poNumber = contract.id.split('-')[0].toUpperCase();
      const date = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA').format(new Date(contract.created_at));
      const direction = language === 'ar' ? 'rtl' : 'ltr';
      const alignStart = language === 'ar' ? 'right' : 'left';
      const alignEnd = language === 'ar' ? 'left' : 'right';

      const printElement = document.createElement('div');
      printElement.style.position = 'absolute';
      printElement.style.left = '-9999px';
      printElement.style.top = '0';
      printElement.style.width = '800px';
      printElement.style.padding = '40px';
      printElement.style.backgroundColor = 'white';
      printElement.style.color = 'black';
      printElement.style.fontFamily = 'Arial, sans-serif';
      
      printElement.innerHTML = `
        <div dir="${direction}" style="width: 100%; height: 100%;">
          <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
            <h1 style="color: #3b82f6; font-size: 28px; margin: 0;">${t.pdfTitle}</h1>
            <h2 style="color: #64748b; font-size: 20px; margin: 0;">SOUQ BTP</h2>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px;">
            <div style="text-align: ${alignStart};">
              <p style="margin: 5px 0;"><strong>${t.pdfPoNumber}</strong> #${poNumber}</p>
              <p style="margin: 5px 0;"><strong>${t.pdfDate}</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>${t.pdfStatus}</strong> ${t.pdfApprovedSigned}</p>
            </div>
            <div style="text-align: ${alignEnd};">
              <p style="margin: 5px 0;"><strong>${t.pdfSupplier}</strong> BOSS / SOUQ BTP</p>
              <p style="margin: 5px 0;"><strong>${t.pdfRetailer}</strong> ${merchantName}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: ${alignStart};">${t.pdfArticle}</th>
                <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">${t.pdfQty}</th>
                <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: ${alignEnd};">${t.pdfUnitPrice}</th>
              </tr>
            </thead>
            <tbody>
              ${contract.items.map(item => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: ${alignStart};">${item.name}</td>
                  <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: ${alignEnd};" dir="ltr">${item.purchase_price} ${t.currency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="text-align: ${alignEnd}; margin-bottom: 50px;">
            <h2 style="font-size: 24px; color: #0f172a; margin: 0;">${t.pdfTotal} <span style="color: #10b981;" dir="ltr">${Number(contract.total_amount).toLocaleString()} ${t.currency}</span></h2>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 60px; padding-top: 30px; border-top: 2px dashed #cbd5e1;">
            
            <div style="text-align: center; position: relative; width: 45%;">
              <p style="font-weight: 900; margin-bottom: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px;">${t.pdfSupplierSign}</p>
              
              <div style="position: absolute; top: 35px; left: 50%; transform: translateX(-50%) rotate(-10deg); border: 4px solid #ef4444; color: #ef4444; padding: 8px 20px; border-radius: 8px; font-weight: 900; font-size: 22px; letter-spacing: 3px; opacity: 0.6; text-transform: uppercase; z-index: 1;">
                ${t.pdfApproved}
              </div>
              
              <p style="font-size: 38px; color: #1e3a8a; font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; margin-top: 30px; position: relative; z-index: 2;">
                SOUQ BTP
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 5px; font-style: italic;">${t.pdfCertified}</p>
            </div>

            <div style="text-align: center; width: 45%;">
              <p style="font-weight: 900; margin-bottom: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px;">${t.pdfClientSign}</p>
              
              ${contract.digital_signature && contract.digital_signature.startsWith('data:image') 
                ? `<img src="${contract.digital_signature}" style="height: 60px; object-fit: contain; margin-top: 25px;" />` 
                : `<p style="font-size: 38px; color: #047857; font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; margin-top: 45px;">${contract.digital_signature}</p>`
              }

              <p style="font-size: 11px; color: #94a3b8; margin-top: 5px; font-style: italic;">${t.pdfSignedOn} ${date}</p>
            </div>
          </div>

          <div style="margin-top: 60px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px;">
             <p style="font-size: 14px; color: #cbd5e1; font-family: monospace; letter-spacing: 2px;">${t.pdfSecureDoc}</p>
             <p style="font-size: 10px; color: #94a3b8; margin-top: 5px;">${t.pdfTransId} ${contract.id}</p>
          </div>
        </div>
      `;

      document.body.appendChild(printElement);

      const canvas = await html2canvas(printElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${t.pdfFilename}${poNumber}.pdf`);

      document.body.removeChild(printElement);
      
    } catch (error) {
      console.error("PDF Error:", error);
      alert(t.errorPdf);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const merchantName = merchants[c.merchant_id]?.store_name?.toLowerCase() || '';
    const poNumber = c.id.toLowerCase();
    const search = searchTerm.toLowerCase();
    return merchantName.includes(search) || poNumber.includes(search);
  });

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FileSignature className="text-purple-500" size={32} />
            {t.title}
          </h2>
          <p className="text-slate-400 mt-1 font-medium">
            {t.subtitle}
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500 transition-all font-medium`}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-purple-500" /></div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-16 text-center">
          <FileText size={48} className="text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">{t.noContracts}</h3>
          <p className="text-slate-400">{t.noContractsDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map(contract => {
            const merchantInfo = merchants[contract.merchant_id] || { store_name: '...' };
            
            return (
              <div key={contract.id} className="bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all shadow-lg group">
                <div className="p-5 border-b border-slate-700 bg-slate-800/80 flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-black text-lg">PO #{contract.id.split('-')[0].toUpperCase()}</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                      <Calendar size={12}/> {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA').format(new Date(contract.created_at))}
                    </p>
                  </div>
                  <div className="bg-purple-500/10 text-purple-400 p-2 rounded-lg">
                    <FileSignature size={20} />
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t.client}</p>
                    <p className="text-white font-bold text-lg">{merchantInfo.store_name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t.contractAmount}</p>
                    <p className="text-emerald-400 font-black text-xl" dir="ltr">{Number(contract.total_amount).toLocaleString()} {t.currency}</p>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-xs font-bold text-slate-500 mb-1">{t.digitalSignature}</p>
                    <div className="text-emerald-300 font-black flex items-center gap-2 mt-1">
                      <CheckCircle size={16}/> 
                      {contract.digital_signature?.startsWith('data:image') ? (
                        <img src={contract.digital_signature} alt="Signature" className="h-8 object-contain bg-white/10 rounded px-2 py-1" />
                      ) : (
                        <span>{contract.digital_signature}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDownloadPDF(contract)}
                  className="w-full p-4 bg-slate-700/30 hover:bg-purple-600 text-slate-300 hover:text-white font-bold flex justify-center items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Download size={18}/> {t.downloadPdf}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}