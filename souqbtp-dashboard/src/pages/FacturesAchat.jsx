import { useState, useEffect } from 'react';
import usePurchaseInvoiceStore from '../store/usePurchaseInvoiceStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { FileText, Plus, Trash2, Printer, CheckCircle, Clock, XCircle, X, ShoppingBag } from 'lucide-react';

const translations = {
  ar: {
    title: 'فواتير الشراء', subtitle: 'سجل وأدر الفواتير الواردة من مورديك.',
    newInvoice: 'تسجيل فاتورة شراء', vendorName: 'اسم المورد (Fournisseur)',
    tvaRate: 'نسبة TVA (%)', addLine: 'إضافة سطر', designation: 'البيان',
    qty: 'الكمية', price: 'سعر الشراء', totalHT: 'الإجمالي (HT)',
    totalTVA: 'قيمة الضريبة (TVA)', totalTTC: 'الإجمالي (TTC)',
    save: 'حفظ الفاتورة', saving: 'جاري الحفظ...', history: 'سجل فواتير الشراء', date: 'التاريخ',
    status: 'الحالة', actions: 'إجراءات', empty: 'لا توجد فواتير مسجلة.',
    paid: 'مدفوعة', unpaid: 'غير مدفوعة', cancelled: 'ملغاة', print: 'طباعة (سجل داخلي)'
  },
  fr: {
    title: 'Factures d\'Achat', subtitle: 'Enregistrez et gérez les factures de vos fournisseurs.',
    newInvoice: 'Enregistrer une Facture d\'Achat', vendorName: 'Nom du Fournisseur',
    tvaRate: 'Taux TVA (%)', addLine: 'Ajouter une ligne', designation: 'Désignation',
    qty: 'Quantité', price: 'Prix d\'Achat', totalHT: 'Total HT',
    totalTVA: 'TVA', totalTTC: 'Total TTC',
    save: 'Enregistrer la Facture', saving: 'Enregistrement...', history: 'Historique des Achats', date: 'Date',
    status: 'Statut', actions: 'Actions', empty: 'Aucune facture enregistrée.',
    paid: 'Payée', unpaid: 'Non Payée', cancelled: 'Annulée', print: 'Imprimer (Copie)'
  }
};

export default function FacturesAchat() {
  const { purchaseInvoices, isLoading, fetchPurchaseInvoices, createPurchaseInvoice, updateStatus } = usePurchaseInvoiceStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];

  const [vendorName, setVendorName] = useState('');
  const [tvaRate, setTvaRate] = useState(20);
  const [items, setItems] = useState([{ id: Date.now(), designation: '', qty: 1, price: 0 }]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchPurchaseInvoices(); }, [fetchPurchaseInvoices]);

  const totalHT = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const tvaAmount = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + tvaAmount;

  const isFormValid = vendorName.trim() !== '' && items.every(item => item.designation.trim() !== '');
  // 🛡️ درع واقي لتفادي انهيار الصفحة إذا كانت البيانات فارغة أو غير صحيحة
  const safeInvoices = Array.isArray(purchaseInvoices) ? purchaseInvoices : [];
  const clientSuggestions = [...new Set(
    safeInvoices.map(inv => inv?.vendor_name).filter(Boolean)
  )];
  const productSuggestions = [...new Set(
    safeInvoices.flatMap(inv => 
      Array.isArray(inv?.items) ? inv.items.map(item => item?.designation) : []
    ).filter(Boolean)
  )];

  const handleAddItem = () => setItems([...items, { id: Date.now(), designation: '', qty: 1, price: 0 }]);
  const handleRemoveItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
  const handleItemChange = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSaveInvoice = async () => {
    if (!isFormValid) return;
    setIsSaving(true);
    const result = await createPurchaseInvoice({
      vendor_name: vendorName,
      tva_rate: tvaRate,
      total_ht: totalHT,
      tva_amount: tvaAmount,
      total_ttc: totalTTC,
      items: items.map(({ designation, qty, price }) => ({ designation, qty, price }))
    });

    if (result.success) {
      setVendorName('');
      setItems([{ id: Date.now(), designation: '', qty: 1, price: 0 }]);
    } else {
      alert("Erreur: " + result.error);
    }
    setIsSaving(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><CheckCircle size={14}/> {t.paid}</span>;
      case 'cancelled': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><XCircle size={14}/> {t.cancelled}</span>;
      default: return <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><Clock size={14}/> {t.unpaid}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4"><ShoppingBag size={20} className="text-emerald-600"/> {t.newInvoice}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
  <label className="block text-sm font-bold text-gray-700 mb-1">{t.clientName}</label>
  <input 
  type="text" 
  list="clients-list" 
  value={vendorName} /* ✅ التصحيح */
  onChange={(e) => setVendorName(e.target.value)} /* ✅ التصحيح */
  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" 
  placeholder="Nom du Fournisseur..." 
  autoComplete="off"
/>
  <datalist id="clients-list">
    {clientSuggestions.map((name, i) => <option key={i} value={name} />)}
  </datalist>
</div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.tvaRate}</label>
              <select value={tvaRate} onChange={(e) => setTvaRate(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 bg-white">
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
        placeholder="Ex: Ciment Portland..." 
        autoComplete="off"
      />
    </div>
                <div className="col-span-2"><input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-center text-sm" /></div>
                <div className="col-span-3"><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-center text-sm" /></div>
                <div className="col-span-1 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button></div>
              </div>
            ))}
            <button onClick={handleAddItem} className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-800 mt-2"><Plus size={16}/> {t.addLine}</button>
            <datalist id="products-list">
  {productSuggestions.map((prod, i) => <option key={i} value={prod} />)}
</datalist>
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col items-end space-y-2">
            <div className="w-64 flex justify-between text-gray-600 font-medium"><span>{t.totalHT} :</span> <span>{totalHT.toFixed(2)}</span></div>
            <div className="w-64 flex justify-between text-gray-600 font-medium"><span>{t.totalTVA} :</span> <span>{tvaAmount.toFixed(2)}</span></div>
            <div className="w-64 flex justify-between text-xl font-black text-emerald-700 border-t border-gray-800 pt-2 mt-2"><span>{t.totalTTC} :</span> <span>{totalTTC.toFixed(2)}</span></div>
          </div>

          <div className="mt-8 flex justify-end">
            <button onClick={handleSaveInvoice} disabled={!isFormValid || isSaving} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-800">{t.history}</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isLoading ? <div className="text-center text-gray-400 py-10">{t.loading}</div> : purchaseInvoices.length === 0 ? <div className="text-center text-gray-400 py-10">{t.empty}</div> : purchaseInvoices.map(inv => (
              <div key={inv.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm truncate w-32">{inv.vendor_name}</h4>
                  <span className="text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  {getStatusBadge(inv.status)}
                  <div className="text-end">
                    <p className="font-black text-emerald-600 text-sm">{Number(inv.total_ttc).toLocaleString()}</p>
                    <button onClick={() => setSelectedInvoice(inv)} className="text-xs text-gray-500 hover:text-gray-800 underline mt-1 flex items-center gap-1 justify-end"><Printer size={12}/> {t.print}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center overflow-y-auto py-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white w-[800px] shadow-2xl p-10 relative print-area rounded-xl">
            <div className="absolute top-4 right-4 flex gap-2 no-print" dir="ltr">
              <button onClick={() => setSelectedInvoice(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"><X size={20} /></button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors"><Printer size={18} /> {t.print}</button>
              {selectedInvoice.status === 'unpaid' && (
                <button onClick={() => { updateStatus(selectedInvoice.id, 'paid'); setSelectedInvoice({...selectedInvoice, status: 'paid'}); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"><CheckCircle size={18} /> Marquer Payée</button>
              )}
            </div>
            
            <div className="p-8 font-sans">
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase">{supplier?.store_name || 'NOTRE ENTREPRISE'}</h1>
                  <p className="text-sm text-gray-500">Document d'enregistrement interne</p>
                </div>
                <div className="text-end">
                  <h2 className="text-3xl font-light text-emerald-800 uppercase tracking-widest mb-2">FACTURE D'ACHAT</h2>
                  <p className="text-gray-600 font-bold">Réf Interne: ACH-{selectedInvoice.id.slice(0,6).toUpperCase()}</p>
                  <p className="text-gray-500 text-sm">Enregistré le: {new Date(selectedInvoice.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200 w-1/2 ml-auto text-start" dir="ltr">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fournisseur :</p>
                <p className="text-xl font-bold text-gray-900">{selectedInvoice.vendor_name}</p>
              </div>

              <table className="w-full text-start mb-8 border-collapse" dir="ltr">
                <thead>
                  <tr className="bg-emerald-800 text-white"><th className="p-3 font-bold text-start">Désignation</th><th className="p-3 font-bold text-center">Qté</th><th className="p-3 font-bold text-end">Prix U. HT</th><th className="p-3 font-bold text-end">Total HT</th></tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-3 text-gray-800">{item.designation}</td>
                      <td className="p-3 text-center text-gray-600">{item.qty}</td>
                      <td className="p-3 text-end text-gray-600 font-mono">{Number(item.price).toFixed(2)}</td>
                      <td className="p-3 text-end text-gray-800 font-bold font-mono">{(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end" dir="ltr">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-gray-600"><span>Total HT</span><span className="font-mono">{Number(selectedInvoice.total_ht).toFixed(2)} MAD</span></div>
                  <div className="flex justify-between text-gray-600"><span>TVA ({selectedInvoice.tva_rate}%)</span><span className="font-mono">{Number(selectedInvoice.tva_amount).toFixed(2)} MAD</span></div>
                  <div className="flex justify-between text-xl font-black text-emerald-900 border-t-2 border-emerald-800 pt-2 mt-2"><span>Total TTC</span><span className="font-mono">{Number(selectedInvoice.total_ttc).toFixed(2)} MAD</span></div>
                </div>
              </div>
              
              <div className="mt-20 text-center text-sm text-gray-400 border-t border-gray-200 pt-4">
                <p>Copie interne générée par le système pour le suivi comptable.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}