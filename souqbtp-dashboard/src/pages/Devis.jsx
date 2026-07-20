import { useState, useEffect } from 'react';
import useQuoteStore from '../store/useQuoteStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { FileText, Plus, Trash2, Printer, CheckCircle, Clock, XCircle, X } from 'lucide-react';

const translations = {
  ar: {
    title: 'عروض الأسعار (Devis)', subtitle: 'إنشاء وطباعة عروض الأسعار للعملاء المحتملين.',
    newQuote: 'إنشاء عرض سعر جديد', clientName: 'اسم العميل / الشركة المحتملة',
    tvaRate: 'نسبة TVA (%)', addLine: 'إضافة سطر', designation: 'البيان',
    qty: 'الكمية', price: 'سعر الوحدة', totalHT: 'الإجمالي (HT)',
    totalTVA: 'قيمة الضريبة (TVA)', totalTTC: 'الإجمالي (TTC)',
    save: 'حفظ العرض', saving: 'جاري الحفظ...', history: 'سجل العروض', date: 'التاريخ',
    status: 'الحالة', actions: 'إجراءات', empty: 'لا توجد عروض مسجلة.',
    pending: 'قيد الانتظار', accepted: 'مقبول', rejected: 'مرفوض', print: 'طباعة',
    errorMsg: 'خطأ: ', loading: 'جاري التحميل...',
    accept: 'قبول', reject: 'رفض',
    printAddress: 'عنوان الشركة', printInvoiceType: "عرض سعر (DEVIS)",
    printDate: 'التاريخ:', printClient: 'عرض سعر لـ:',
    printDesignation: 'البيان', printQty: 'الكمية', printUP: 'سعر الوحدة', printTotalHT: 'الإجمالي (HT)',
    printTotalTTC: 'الإجمالي (TTC)',
    printFooter: 'صلاحية هذا العرض 30 يوماً.', printSign: 'التوقيع والختم'
  },
  fr: {
    title: 'Devis', subtitle: 'Créez et imprimez des devis pour vos prospects.',
    newQuote: 'Créer un Nouveau Devis', clientName: 'Nom du Prospect / Entreprise',
    tvaRate: 'Taux TVA (%)', addLine: 'Ajouter une ligne', designation: 'Désignation',
    qty: 'Quantité', price: 'Prix Unitaire', totalHT: 'Total HT',
    totalTVA: 'TVA', totalTTC: 'Total TTC',
    save: 'Enregistrer le Devis', saving: 'Enregistrement...', history: 'Historique des devis', date: 'Date',
    status: 'Statut', actions: 'Actions', empty: 'Aucun devis enregistré.',
    pending: 'En attente', accepted: 'Accepté', rejected: 'Refusé', print: 'Imprimer',
    errorMsg: 'Erreur: ', loading: 'Chargement...',
    accept: 'Accepter', reject: 'Refuser',
    printAddress: 'Adresse de l\'entreprise', printInvoiceType: "DEVIS",
    printDate: 'Date:', printClient: 'Devis pour :',
    printDesignation: 'Désignation', printQty: 'Qté', printUP: 'Prix U. HT', printTotalHT: 'Total HT',
    printTotalTTC: 'Total TTC',
    printFooter: 'Ce devis est valable pour une durée de 30 jours.', printSign: 'Signature et Cachet'
  },
  en: {
    title: 'Quotes (Devis)', subtitle: 'Create and print quotes for potential clients.',
    newQuote: 'Create New Quote', clientName: 'Client Name / Company',
    tvaRate: 'VAT Rate (%)', addLine: 'Add Item', designation: 'Description',
    qty: 'Quantity', price: 'Unit Price', totalHT: 'Total (HT)',
    totalTVA: 'VAT', totalTTC: 'Total (TTC)',
    save: 'Save Quote', saving: 'Saving...', history: 'Quotes History', date: 'Date',
    status: 'Status', actions: 'Actions', empty: 'No quotes registered.',
    pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', print: 'Print',
    errorMsg: 'Error: ', loading: 'Loading...',
    accept: 'Accept', reject: 'Reject',
    printAddress: 'Company Address', printInvoiceType: "QUOTE",
    printDate: 'Date:', printClient: 'Quote for:',
    printDesignation: 'Description', printQty: 'Qty', printUP: 'Unit Price', printTotalHT: 'Total HT',
    printTotalTTC: 'Total TTC',
    printFooter: 'This quote is valid for 30 days.', printSign: 'Signature and Stamp'
  }
};

export default function Devis() {
  const { quotes, isLoading, fetchQuotes, createQuote, updateStatus } = useQuoteStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  // 🛡️ الترياق السحري
  const t = translations[language] || translations['fr'];

  const [clientName, setClientName] = useState('');
  const [tvaRate, setTvaRate] = useState(20);
  const [items, setItems] = useState([{ id: Date.now(), designation: '', qty: 1, price: 0 }]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const totalHT = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const tvaAmount = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + tvaAmount;

  const isFormValid = clientName.trim() !== '' && items.every(item => item.designation.trim() !== '');
  const safeInvoices = Array.isArray(quotes) ? quotes : [];
  const clientSuggestions = [...new Set(safeInvoices.map(inv => inv?.client_name).filter(Boolean))];
  const productSuggestions = [...new Set(safeInvoices.flatMap(inv => Array.isArray(inv?.items) ? inv.items.map(item => item?.designation) : []).filter(Boolean))];

  const handleAddItem = () => setItems([...items, { id: Date.now(), designation: '', qty: 1, price: 0 }]);
  const handleRemoveItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
  const handleItemChange = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSaveQuote = async () => {
    if (!isFormValid) return;
    setIsSaving(true);
    const result = await createQuote({
      client_name: clientName, tva_rate: tvaRate, total_ht: totalHT,
      tva_amount: tvaAmount, total_ttc: totalTTC,
      items: items.map(({ designation, qty, price }) => ({ designation, qty, price }))
    });

    if (result.success) {
      setClientName('');
      setItems([{ id: Date.now(), designation: '', qty: 1, price: 0 }]);
    } else {
      alert(t.errorMsg + result.error);
    }
    setIsSaving(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold w-fit"><CheckCircle size={14}/> {t.accepted}</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold w-fit"><XCircle size={14}/> {t.rejected}</span>;
      default: return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold w-fit"><Clock size={14}/> {t.pending}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4"><FileText size={20} className="text-indigo-600"/> {t.newQuote}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.clientName}</label>
              <input type="text" list="clients-list" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" placeholder={t.clientName} autoComplete="off" />
              <datalist id="clients-list">{clientSuggestions.map((name, i) => <option key={i} value={name} />)}</datalist>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.tvaRate}</label>
              <select value={tvaRate} onChange={(e) => setTvaRate(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white">
                <option value={20}>20%</option><option value={14}>14%</option><option value={10}>10%</option><option value={0}>0%</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-12 gap-2 text-sm font-bold text-gray-500 mb-2 px-2">
              <div className="col-span-6">{t.designation}</div><div className="col-span-2 text-center">{t.qty}</div><div className="col-span-3 text-center">{t.price}</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6"><input type="text" list="products-list" value={item.designation} onChange={(e) => handleItemChange(item.id, 'designation', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm" placeholder="Ex: Ciment..." autoComplete="off" /></div>
                <div className="col-span-2"><input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-sm" /></div>
                <div className="col-span-3"><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-sm" /></div>
                <div className="col-span-1 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button></div>
              </div>
            ))}
            <button onClick={handleAddItem} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-800 mt-2"><Plus size={16}/> {t.addLine}</button>
            <datalist id="products-list">{productSuggestions.map((prod, i) => <option key={i} value={prod} />)}</datalist>
          </div>

          <div className={`border-t pt-4 flex flex-col ${language === 'ar' ? 'items-start' : 'items-end'} space-y-2`}>
            <div className="w-64 flex justify-between text-gray-600 font-medium"><span>{t.totalHT} :</span> <span>{totalHT.toFixed(2)}</span></div>
            <div className="w-64 flex justify-between text-gray-600 font-medium"><span>{t.totalTVA} :</span> <span>{tvaAmount.toFixed(2)}</span></div>
            <div className="w-64 flex justify-between text-xl font-black text-gray-900 border-t pt-2 mt-2"><span>{t.totalTTC} :</span> <span>{totalTTC.toFixed(2)}</span></div>
          </div>

          <div className="mt-8 flex justify-end">
            <button onClick={handleSaveQuote} disabled={!isFormValid || isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg">{isSaving ? t.saving : t.save}</button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-800">{t.history}</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? <div className="text-center py-10">{t.loading}</div> : quotes.length === 0 ? <div className="text-center py-10">{t.empty}</div> : quotes.map(quote => (
              <div key={quote.id} className="border p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between mb-2"><h4 className="font-bold text-sm">{quote.client_name}</h4><span className="text-xs text-gray-400">{new Date(quote.created_at).toLocaleDateString()}</span></div>
                <div className="flex justify-between items-end">{getStatusBadge(quote.status)}<button onClick={() => setSelectedQuote(quote)} className="text-xs underline"><Printer size={12}/> {t.print}</button></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedQuote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center overflow-y-auto py-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white w-[800px] p-10 relative rounded-xl">
            <div className="absolute top-4 right-4 flex gap-2 no-print" dir="ltr">
              <button onClick={() => setSelectedQuote(null)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold"><Printer size={18} /> {t.print}</button>
              {selectedQuote.status === 'pending' && (
                <>
                  <button onClick={() => { updateStatus(selectedQuote.id, 'accepted'); setSelectedQuote({...selectedQuote, status: 'accepted'}); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">{t.accept}</button>
                  <button onClick={() => { updateStatus(selectedQuote.id, 'rejected'); setSelectedQuote({...selectedQuote, status: 'rejected'}); }} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">{t.reject}</button>
                </>
              )}
            </div>
            
            <div className="p-8 font-sans">
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
                <div><h1 className="text-4xl font-black uppercase">{supplier?.store_name || 'ENTREPRISE'}</h1><p className="text-sm">{t.printAddress}</p></div>
                <div className={`text-${language === 'ar' ? 'start' : 'end'}`}><h2 className="text-3xl font-light text-indigo-800 uppercase tracking-widest">{t.printInvoiceType}</h2><p className="font-bold">N° DEV-{selectedQuote.id.slice(0,6).toUpperCase()}</p><p className="text-sm">{t.printDate} {new Date(selectedQuote.created_at).toLocaleDateString()}</p></div>
              </div>

              <div className={`mb-10 p-6 rounded-lg border w-1/2 ${language === 'ar' ? 'mr-auto text-end' : 'ml-auto text-start'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}><p className="text-xs uppercase">{t.printClient}</p><p className="text-xl font-bold">{selectedQuote.client_name}</p></div>

              <table className="w-full text-start mb-8 border-collapse" dir="ltr">
                <thead><tr className="bg-indigo-800 text-white"><th className="p-3 text-start">{t.printDesignation}</th><th className="p-3 text-center">{t.printQty}</th><th className="p-3 text-end">{t.printUP}</th><th className="p-3 text-end">{t.printTotalHT}</th></tr></thead>
                <tbody>{selectedQuote.items.map((item, idx) => (<tr key={idx} className="border-b"><td className="p-3">{item.designation}</td><td className="p-3 text-center">{item.qty}</td><td className="p-3 text-end">{Number(item.price).toFixed(2)}</td><td className="p-3 text-end">{(item.qty * item.price).toFixed(2)}</td></tr>))}</tbody>
              </table>

              <div className={`flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`} dir="ltr"><div className="w-72 space-y-2"><div className="flex justify-between"><span>Total HT</span><span>{Number(selectedQuote.total_ht).toFixed(2)}</span></div><div className="flex justify-between"><span>TVA ({selectedQuote.tva_rate}%)</span><span>{Number(selectedQuote.tva_amount).toFixed(2)}</span></div><div className="flex justify-between text-xl font-black border-t-2 pt-2 mt-2"><span>Total TTC</span><span>{Number(selectedQuote.total_ttc).toFixed(2)}</span></div></div></div>
              
              <div className="mt-20 text-center text-sm text-gray-400"><p>{t.printFooter}</p><p>{t.printSign}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}