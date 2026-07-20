import { useState, useEffect } from 'react';
import useBCStore from '../store/useBCStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { FileText, Plus, Trash2, Printer, CheckCircle, Clock, XCircle, X } from 'lucide-react';

const translations = {
  ar: {
    title: 'أوامر الشراء (BC)', subtitle: 'إنشاء وطباعة أوامر الشراء للموردين والعملاء.',
    newBC: 'إنشاء أمر شراء جديد', clientName: 'المورد / العميل',
    tvaRate: 'نسبة TVA (%)', addLine: 'إضافة سطر', designation: 'البيان',
    qty: 'الكمية', price: 'سعر الوحدة', totalHT: 'الإجمالي (HT)',
    totalTVA: 'قيمة الضريبة (TVA)', totalTTC: 'الإجمالي (TTC)',
    save: 'حفظ أمر الشراء', saving: 'جاري الحفظ...', history: 'سجل أوامر الشراء', date: 'التاريخ',
    status: 'الحالة', actions: 'إجراءات', empty: 'لا توجد أوامر شراء مسجلة.',
    pending: 'قيد الانتظار', validated: 'مُعتمد', cancelled: 'ملغى', print: 'طباعة',
    clientPlaceholder: 'اسم المورد أو العميل...', productPlaceholder: 'مثال: إسمنت، حديد...',
    errorMsg: 'خطأ: ', loading: 'جاري التحميل...',
    validate: 'اعتماد (Valider)', cancel: 'إلغاء',
    printAddress: 'عنوان الشركة', printInvoiceType: "أمر شراء (BC)",
    printDate: 'التاريخ:', printDestinataire: 'الموجه إليه (المرسل إليه):',
    printDesignation: 'البيان', printQty: 'الكمية', printUP: 'سعر الوحدة', printTotalHT: 'الإجمالي (HT)',
    printTotalTTC: 'الإجمالي (TTC)',
    printSignBuyer: 'توقيع المشتري', printSignSupplier: 'توقيع المورد'
  },
  fr: {
    title: 'Bons de Commande', subtitle: 'Créez et imprimez vos bons de commande (BC).',
    newBC: 'Créer un Nouveau BC', clientName: 'Fournisseur / Client',
    tvaRate: 'Taux TVA (%)', addLine: 'Ajouter une ligne', designation: 'Désignation',
    qty: 'Quantité', price: 'Prix Unitaire', totalHT: 'Total HT',
    totalTVA: 'TVA', totalTTC: 'Total TTC',
    save: 'Enregistrer le BC', saving: 'Enregistrement...', history: 'Historique des BC', date: 'Date',
    status: 'Statut', actions: 'Actions', empty: 'Aucun BC enregistré.',
    pending: 'En attente', validated: 'Validé', cancelled: 'Annulé', print: 'Imprimer',
    clientPlaceholder: 'Nom du Fournisseur / Client...', productPlaceholder: 'Ex: Ciment Portland...',
    errorMsg: 'Erreur: ', loading: 'Chargement...',
    validate: 'Valider', cancel: 'Annuler',
    printAddress: 'Adresse de l\'entreprise', printInvoiceType: "BON DE COMMANDE",
    printDate: 'Date:', printDestinataire: 'Destinataire :',
    printDesignation: 'Désignation', printQty: 'Qté', printUP: 'Prix U. HT', printTotalHT: 'Total HT',
    printTotalTTC: 'Total TTC',
    printSignBuyer: 'Signature de l\'Acheteur', printSignSupplier: 'Signature du Fournisseur'
  },
  en: {
    title: 'Purchase Orders (BC)', subtitle: 'Create and print your purchase orders.',
    newBC: 'Create New PO', clientName: 'Supplier / Client',
    tvaRate: 'VAT Rate (%)', addLine: 'Add Item', designation: 'Description',
    qty: 'Quantity', price: 'Unit Price', totalHT: 'Total (HT)',
    totalTVA: 'VAT', totalTTC: 'Total (TTC)',
    save: 'Save Purchase Order', saving: 'Saving...', history: 'PO History', date: 'Date',
    status: 'Status', actions: 'Actions', empty: 'No purchase orders registered.',
    pending: 'Pending', validated: 'Validated', cancelled: 'Cancelled', print: 'Print',
    clientPlaceholder: 'Supplier / Client Name...', productPlaceholder: 'Ex: Portland Cement...',
    errorMsg: 'Error: ', loading: 'Loading...',
    validate: 'Validate', cancel: 'Cancel',
    printAddress: 'Company Address', printInvoiceType: "PURCHASE ORDER",
    printDate: 'Date:', printDestinataire: 'To:',
    printDesignation: 'Description', printQty: 'Qty', printUP: 'Unit Price', printTotalHT: 'Total HT',
    printTotalTTC: 'Total TTC',
    printSignBuyer: 'Buyer Signature', printSignSupplier: 'Supplier Signature'
  }
};

export default function BC() {
  const { purchaseOrders, isLoading, fetchBCs, createBC, updateStatus } = useBCStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  // 🛡️ الترياق السحري موجود لحماية اللوحة
  const t = translations[language] || translations['fr'];

  const [clientName, setClientName] = useState('');
  const [tvaRate, setTvaRate] = useState(20);
  const [items, setItems] = useState([{ id: Date.now(), designation: '', qty: 1, price: 0 }]);
  const [selectedBC, setSelectedBC] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchBCs(); }, [fetchBCs]);

  const totalHT = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const tvaAmount = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + tvaAmount;

  const isFormValid = clientName.trim() !== '' && items.every(item => item.designation.trim() !== '');
  const clientSuggestions = [...new Set(purchaseOrders.map(inv => inv.client_name))];
  const productSuggestions = [...new Set(purchaseOrders.flatMap(inv => inv.items.map(item => item.designation)))];

  const handleAddItem = () => setItems([...items, { id: Date.now(), designation: '', qty: 1, price: 0 }]);
  const handleRemoveItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
  const handleItemChange = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSaveBC = async () => {
    if (!isFormValid) return;
    setIsSaving(true);
    const result = await createBC({
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
      case 'validated': return <span className="flex items-center gap-1 text-teal-700 bg-teal-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><CheckCircle size={14}/> {t.validated}</span>;
      case 'cancelled': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><XCircle size={14}/> {t.cancelled}</span>;
      default: return <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><Clock size={14}/> {t.pending}</span>;
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
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4"><FileText size={20} className="text-teal-600"/> {t.newBC}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.clientName}</label>
              <input 
                type="text" 
                list="clients-list" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                placeholder={t.clientPlaceholder}
                autoComplete="off"
              />
              <datalist id="clients-list">
                {clientSuggestions.map((name, i) => <option key={i} value={name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.tvaRate}</label>
              <select value={tvaRate} onChange={(e) => setTvaRate(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-teal-500 bg-white">
                <option value={20}>20%</option>
                <option value={14}>14%</option>
                <option value={10}>10%</option>
                <option value={0}>0%</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-12 gap-2 text-sm font-bold text-gray-500 mb-2 px-2">
              <div className="col-span-6">{t.designation}</div><div className="col-span-2 text-center">{t.qty}</div><div className="col-span-3 text-center">{t.price}</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <input 
                    type="text" 
                    list="products-list" 
                    value={item.designation} 
                    onChange={(e) => handleItemChange(item.id, 'designation', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm" 
                    placeholder={t.productPlaceholder}
                    autoComplete="off"
                  />
                </div>
                <div className="col-span-2"><input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-teal-500 text-center text-sm" /></div>
                <div className="col-span-3"><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-teal-500 text-center text-sm" /></div>
                <div className="col-span-1 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button></div>
              </div>
            ))}
            <button onClick={handleAddItem} className="text-teal-600 font-bold text-sm flex items-center gap-1 hover:text-teal-800 mt-2"><Plus size={16}/> {t.addLine}</button>
            <datalist id="products-list">
              {productSuggestions.map((prod, i) => <option key={i} value={prod} />)}
            </datalist>
          </div>

          <div className={`border-t border-gray-100 pt-4 flex flex-col ${language === 'ar' ? 'items-start' : 'items-end'} space-y-2`}>
            <div className="w-64 flex justify-between text-gray-600 font-medium"><span>{t.totalHT} :</span> <span>{totalHT.toFixed(2)}</span></div>
            <div className="w-64 flex justify-between text-gray-600 font-medium"><span>{t.totalTVA} :</span> <span>{tvaAmount.toFixed(2)}</span></div>
            <div className="w-64 flex justify-between text-xl font-black text-gray-900 border-t border-gray-800 pt-2 mt-2"><span>{t.totalTTC} :</span> <span>{totalTTC.toFixed(2)}</span></div>
          </div>

          <div className={`mt-8 flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
            <button onClick={handleSaveBC} disabled={!isFormValid || isSaving} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-800">{t.history}</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isLoading ? <div className="text-center text-gray-400 py-10">{t.loading}</div> : purchaseOrders.length === 0 ? <div className="text-center text-gray-400 py-10">{t.empty}</div> : purchaseOrders.map(bc => (
              <div key={bc.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm truncate w-32">{bc.client_name}</h4>
                  <span className="text-xs text-gray-400">{new Date(bc.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')}</span>
                </div>
                <div className="flex justify-between items-end">
                  {getStatusBadge(bc.status)}
                  <div className="text-end">
                    <p className="font-black text-teal-600 text-sm" dir="ltr">{Number(bc.total_ttc).toLocaleString()}</p>
                    <button onClick={() => setSelectedBC(bc)} className="text-xs text-gray-500 hover:text-gray-800 underline mt-1 flex items-center gap-1 justify-end"><Printer size={12}/> {t.print}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedBC && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center overflow-y-auto py-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white w-[800px] shadow-2xl p-10 relative print-area rounded-xl">
            <div className="absolute top-4 right-4 flex gap-2 no-print" dir="ltr">
              <button onClick={() => setSelectedBC(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"><X size={20} /></button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors"><Printer size={18} /> {t.print}</button>
              {selectedBC.status === 'pending' && (
                <>
                  <button onClick={() => { updateStatus(selectedBC.id, 'validated'); setSelectedBC({...selectedBC, status: 'validated'}); }} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors"><CheckCircle size={18} /> {t.validate}</button>
                  <button onClick={() => { updateStatus(selectedBC.id, 'cancelled'); setSelectedBC({...selectedBC, status: 'cancelled'}); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"><XCircle size={18} /> {t.cancel}</button>
                </>
              )}
            </div>
            
            <div className="p-8 font-sans">
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase">{supplier?.store_name || 'ENTREPRISE'}</h1>
                  <p className="text-sm text-gray-500">ICE: 123456789012345</p>
                  <p className="text-sm text-gray-500">{t.printAddress}</p>
                </div>
                <div className={`text-${language === 'ar' ? 'start' : 'end'}`}>
                  <h2 className="text-3xl font-light text-teal-800 uppercase tracking-widest mb-2">{t.printInvoiceType}</h2>
                  <p className="text-gray-600 font-bold">N° BC-{selectedBC.id.slice(0,6).toUpperCase()}</p>
                  <p className="text-gray-500 text-sm">{t.printDate} {new Date(selectedBC.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')}</p>
                </div>
              </div>

              <div className={`mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200 w-1/2 ${language === 'ar' ? 'mr-auto text-end' : 'ml-auto text-start'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.printDestinataire}</p>
                <p className="text-xl font-bold text-gray-900">{selectedBC.client_name}</p>
              </div>

              <table className="w-full text-start mb-8 border-collapse" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="bg-teal-800 text-white">
                    <th className="p-3 font-bold text-start">{t.printDesignation}</th>
                    <th className="p-3 font-bold text-center">{t.printQty}</th>
                    <th className="p-3 font-bold text-end">{t.printUP}</th>
                    <th className="p-3 font-bold text-end">{t.printTotalHT}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBC.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-3 text-gray-800 text-start">{item.designation}</td>
                      <td className="p-3 text-center text-gray-600">{item.qty}</td>
                      <td className="p-3 text-end text-gray-600 font-mono" dir="ltr">{Number(item.price).toFixed(2)}</td>
                      <td className="p-3 text-end text-gray-800 font-bold font-mono" dir="ltr">{(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={`flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-gray-600"><span>{t.printTotalHT}</span><span className="font-mono" dir="ltr">{Number(selectedBC.total_ht).toFixed(2)} MAD</span></div>
                  <div className="flex justify-between text-gray-600"><span>TVA ({selectedBC.tva_rate}%)</span><span className="font-mono" dir="ltr">{Number(selectedBC.tva_amount).toFixed(2)} MAD</span></div>
                  <div className="flex justify-between text-xl font-black text-teal-900 border-t-2 border-teal-800 pt-2 mt-2"><span>{t.printTotalTTC}</span><span className="font-mono" dir="ltr">{Number(selectedBC.total_ttc).toFixed(2)} MAD</span></div>
                </div>
              </div>
              
              <div className="mt-20 flex justify-between text-sm text-gray-500 border-t border-gray-200 pt-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <p>{t.printSignBuyer}</p>
                <p>{t.printSignSupplier}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}