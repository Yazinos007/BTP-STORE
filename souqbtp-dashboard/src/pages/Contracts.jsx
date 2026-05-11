import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { FileSignature, Search, Download, CheckCircle, FileText, Loader2, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { language } = useSettingsStore();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      // 🌟 جلب الطلبات التي تم توقيعها فقط (بمختلف حالاتها اللاحقة)
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .not('digital_signature', 'is', null) // شرط: يجب أن يحتوي على توقيع
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
  
  // 🌟 دالة توليد وتحميل العقد كملف PDF
  const handleDownloadPDF = async (contract) => {
    setIsLoading(true);
    try {
      const merchantName = merchants[contract.merchant_id]?.store_name || 'Client Inconnu';
      const poNumber = contract.id.split('-')[0].toUpperCase();
      const date = new Date(contract.created_at).toLocaleDateString();

      // إنشاء عنصر HTML مخفي يمثل شكل الورقة A4
      const printElement = document.createElement('div');
      printElement.style.position = 'absolute';
      printElement.style.left = '-9999px';
      printElement.style.top = '0';
      printElement.style.width = '800px';
      printElement.style.padding = '40px';
      printElement.style.backgroundColor = 'white';
      printElement.style.color = 'black';
      printElement.style.fontFamily = 'Arial, sans-serif';
      
      // 🌟 هنا كان الخطأ! يجب أن نضع الكود داخل `printElement.innerHTML`
      printElement.innerHTML = `
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
          <h1 style="color: #3b82f6; font-size: 28px; margin: 0;">CONTRAT DE FOURNITURE B2B</h1>
          <h2 style="color: #64748b; font-size: 20px; margin: 0;">SOUQ BTP</h2>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px;">
          <div>
            <p style="margin: 5px 0;"><strong>N° de Commande (PO) :</strong> #${poNumber}</p>
            <p style="margin: 5px 0;"><strong>Date de création :</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Statut :</strong> Approuvé & Signé</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 5px 0;"><strong>Fournisseur (Grossiste) :</strong> BOSS / SOUQ BTP</p>
            <p style="margin: 5px 0;"><strong>Client (Détaillant) :</strong> ${merchantName}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: left;">Article</th>
              <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">Quantité</th>
              <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: right;">Prix Unitaire</th>
            </tr>
          </thead>
          <tbody>
            ${contract.items.map(item => `
              <tr>
                <td style="padding: 12px; border: 1px solid #cbd5e1;">${item.name}</td>
                <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: right;">${item.purchase_price} DH</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 50px;">
          <h2 style="font-size: 24px; color: #0f172a; margin: 0;">MONTANT TOTAL : <span style="color: #10b981;">${Number(contract.total_amount).toLocaleString()} DH</span></h2>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 60px; padding-top: 30px; border-top: 2px dashed #cbd5e1;">
          
          <div style="text-align: center; position: relative; width: 45%;">
            <p style="font-weight: 900; margin-bottom: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px;">Le Fournisseur (Grossiste)</p>
            
            <div style="position: absolute; top: 35px; left: 50%; transform: translateX(-50%) rotate(-10deg); border: 4px solid #ef4444; color: #ef4444; padding: 8px 20px; border-radius: 8px; font-weight: 900; font-size: 22px; letter-spacing: 3px; opacity: 0.6; text-transform: uppercase; z-index: 1;">
              APPROUVÉ
            </div>
            
            <p style="font-size: 38px; color: #1e3a8a; font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; margin-top: 30px; position: relative; z-index: 2;">
              SOUQ BTP
            </p>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 5px; font-style: italic;">Certifié numériquement</p>
          </div>

          <div style="text-align: center; width: 45%;">
            <p style="font-weight: 900; margin-bottom: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px;">Le Client (Détaillant)</p>
            
            <p style="font-size: 38px; color: #047857; font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; margin-top: 45px;">
              ${contract.digital_signature}
            </p>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 5px; font-style: italic;">Signé le ${date}</p>
          </div>
        </div>

        <div style="margin-top: 60px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px;">
           <p style="font-size: 14px; color: #cbd5e1; font-family: monospace; letter-spacing: 2px;">|| ||| | || |||| | ||| | || |||| B2B SECURE DOCUMENT || ||| | || ||||</p>
           <p style="font-size: 10px; color: #94a3b8; margin-top: 5px;">ID de Transaction : ${contract.id}</p>
        </div>
      `;

      document.body.appendChild(printElement);

      // تحويل الـ HTML إلى صورة ثم إلى PDF
      const canvas = await html2canvas(printElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Contrat_B2B_${poNumber}.pdf`);

      // تنظيف الواجهة
      document.body.removeChild(printElement);
      
    } catch (error) {
      console.error("PDF Error:", error);
      alert(language === 'fr' ? "Erreur lors de la génération du PDF" : "حدث خطأ أثناء تحميل الملف");
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
            {language === 'fr' ? 'Contrats & Signatures' : 'العقود والتوقيعات'}
          </h2>
          <p className="text-slate-400 mt-1 font-medium">
            {language === 'fr' ? 'Archive légale de tous les bons de commande signés.' : 'الأرشيف القانوني لجميع طلبات التزويد الموقعة رقمياً.'}
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={language === 'fr' ? 'Rechercher un contrat...' : 'ابحث عن عقد أو تاجر...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500 transition-all font-medium"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-purple-500" /></div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-16 text-center">
          <FileText size={48} className="text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">{language === 'fr' ? 'Aucun contrat trouvé' : 'لا توجد عقود'}</h3>
          <p className="text-slate-400">{language === 'fr' ? 'Les contrats signés apparaîtront ici.' : 'العقود التي يتم توقيعها ستظهر في هذا الأرشيف.'}</p>
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
                      <Calendar size={12}/> {new Date(contract.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-purple-500/10 text-purple-400 p-2 rounded-lg">
                    <FileSignature size={20} />
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{language === 'fr' ? 'Client' : 'العميل'}</p>
                    <p className="text-white font-bold text-lg">{merchantInfo.store_name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{language === 'fr' ? 'Montant du Contrat' : 'قيمة العقد'}</p>
                    <p className="text-emerald-400 font-black text-xl">{Number(contract.total_amount).toLocaleString()} DH</p>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-xs font-bold text-slate-500 mb-1">{language === 'fr' ? 'Signature Numérique' : 'التوقيع الرقمي'}</p>
                    <p className="text-emerald-300 font-black flex items-center gap-2">
                      <CheckCircle size={16}/> {contract.digital_signature}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => handleDownloadPDF(contract)}
                  className="w-full p-4 bg-slate-700/30 hover:bg-purple-600 text-slate-300 hover:text-white font-bold flex justify-center items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Download size={18}/> {language === 'fr' ? 'Télécharger PDF' : 'تحميل كملف PDF'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}