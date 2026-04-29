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
    pending: 'قيد الانتظار', accepted: 'مقبول', rejected: 'مرفوض', print: 'طباعة'
  },
  fr: {
    title: 'Devis', subtitle: 'Créez et imprimez des devis pour vos prospects.',
    newQuote: 'Créer un Nouveau Devis', clientName: 'Nom du Prospect / Entreprise',
    tvaRate: 'Taux TVA (%)', addLine: 'Ajouter une ligne', designation: 'Désignation',
    qty: 'Quantité', price: 'Prix Unitaire', totalHT: 'Total HT',
    totalTVA: 'TVA', totalTTC: 'Total TTC',
    save: 'Enregistrer le Devis', saving: 'Enregistrement...', history: 'Historique des devis', date: 'Date',
    status: 'Statut', actions: 'Actions', empty: 'Aucun devis enregistré.',
    pending: 'En attente', accepted: 'Accepté', rejected: 'Refusé', print: 'Imprimer'
  }
};

export default function Devis() {
  const { quotes, isLoading, fetchQuotes, createQuote, updateStatus } = useQuoteStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language];

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
  const clientSuggestions = [...new Set(
    safeInvoices.map(inv => inv?.client_name).filter(Boolean) 
  )];
  const productSuggestions = [...new Set(
    safeInvoices.flatMap(inv => 
      Array.isArray(inv?.items) ? inv.items.map(item => item?.designation) : []
    ).filter(Boolean)
  )];

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
      alert("Erreur: " + result.error);
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
    <div className="max-w-6xl mx-auto space-y-6">
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
  <input 
    type="text" 
    list="clients-list" 
    value={clientName} 
    onChange={(e) => setClientName(e.target.value)} 
    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
    placeholder="Nom du Client..." 
    autoComplete="off"
  />
  <datalist id="clients-list">
    {clientSuggestions.map((name, i) => <option key={i} value={name} />)}
  </datalist>
</div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.tvaRate}</label>
              <select value={tvaRate} onChange={(e) => setTvaRate(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white">
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
                <div className="col-span-2"><input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 text-center text-sm" /></div>
                <div className="col-span-3"><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 text-center text-sm" /></div>
                <div className="col-span-1 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button></div>
              </div>
            ))}
            <button onClick={handleAddItem} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-800 mt-2"><Plus size={16}/> {t.addLine}</button>
            <datalist id="products-list">
  {productSuggestions.map((prod, i) => <option key={i} value={prod} />)}
</datalist>
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col items-end space-y-2">
            <div className="w-64 flex justify-between text-gray-600 font-medium"><span>{t.totalHT} :</span> <span>{totalHT.toFixed(2)}</span></div>
            <div className="w-64 flex justify-between text-gray-600 font-medium"><span>{t.totalTVA} :</span> <span>{tvaAmount.toFixed(2)}</span></div>
            <div className="w-64 flex justify-between text-xl font-black text-gray-900 border-t border-gray-800 pt-2 mt-2"><span>{t.totalTTC} :</span> <span>{totalTTC.toFixed(2)}</span></div>
          </div>

          <div className="mt-8 flex justify-end">
            <button onClick={handleSaveQuote} disabled={!isFormValid || isSaving} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-800">{t.history}</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isLoading ? <div className="text-center text-gray-400 py-10">{t.loading}</div> : quotes.length === 0 ? <div className="text-center text-gray-400 py-10">{t.empty}</div> : quotes.map(quote => (
              <div key={quote.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm truncate w-32">{quote.client_name}</h4>
                  <span className="text-xs text-gray-400">{new Date(quote.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  {getStatusBadge(quote.status)}
                  <div className="text-end">
                    <p className="font-black text-indigo-600 text-sm">{Number(quote.total_ttc).toLocaleString()}</p>
                    <button onClick={() => setSelectedQuote(quote)} className="text-xs text-gray-500 hover:text-gray-800 underline mt-1 flex items-center gap-1 justify-end"><Printer size={12}/> {t.print}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedQuote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center overflow-y-auto py-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white w-[800px] shadow-2xl p-10 relative print-area rounded-xl">
            <div className="absolute top-4 right-4 flex gap-2 no-print" dir="ltr">
              <button onClick={() => setSelectedQuote(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"><X size={20} /></button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"><Printer size={18} /> {t.print}</button>
              {selectedQuote.status === 'pending' && (
                <>
                  <button onClick={() => { updateStatus(selectedQuote.id, 'accepted'); setSelectedQuote({...selectedQuote, status: 'accepted'}); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"><CheckCircle size={18} /> Accepter</button>
                  <button onClick={() => { updateStatus(selectedQuote.id, 'rejected'); setSelectedQuote({...selectedQuote, status: 'rejected'}); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"><XCircle size={18} /> Refuser</button>
                </>
              )}
            </div>
            
            <div className="p-8 font-sans">
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase">{supplier?.store_name || 'ENTREPRISE'}</h1>
                  <p className="text-sm text-gray-500">ICE: 123456789012345</p>
                  <p className="text-sm text-gray-500">Adresse de l'entreprise</p>
                </div>
                <div className="text-end">
                  <h2 className="text-3xl font-light text-indigo-800 uppercase tracking-widest mb-2">DEVIS</h2>
                  <p className="text-gray-600 font-bold">N° DEV-{selectedQuote.id.slice(0,6).toUpperCase()}</p>
                  <p className="text-gray-500 text-sm">Date: {new Date(selectedQuote.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200 w-1/2 ml-auto text-start" dir="ltr">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Devis pour :</p>
                <p className="text-xl font-bold text-gray-900">{selectedQuote.client_name}</p>
              </div>

              <table className="w-full text-start mb-8 border-collapse" dir="ltr">
                <thead>
                  <tr className="bg-indigo-800 text-white"><th className="p-3 font-bold text-start">Désignation</th><th className="p-3 font-bold text-center">Qté</th><th className="p-3 font-bold text-end">Prix U. HT</th><th className="p-3 font-bold text-end">Total HT</th></tr>
                </thead>
                <tbody>
                  {selectedQuote.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-3 text-gray-800">{item.designation}</td><td className="p-3 text-center text-gray-600">{item.qty}</td><td className="p-3 text-end text-gray-600 font-mono">{Number(item.price).toFixed(2)}</td><td className="p-3 text-end text-gray-800 font-bold font-mono">{(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end" dir="ltr">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-gray-600"><span>Total HT</span><span className="font-mono">{Number(selectedQuote.total_ht).toFixed(2)} MAD</span></div>
                  <div className="flex justify-between text-gray-600"><span>TVA ({selectedQuote.tva_rate}%)</span><span className="font-mono">{Number(selectedQuote.tva_amount).toFixed(2)} MAD</span></div>
                  <div className="flex justify-between text-xl font-black text-indigo-900 border-t-2 border-indigo-800 pt-2 mt-2"><span>Total TTC</span><span className="font-mono">{Number(selectedQuote.total_ttc).toFixed(2)} MAD</span></div>
                </div>
              </div>
              
              <div className="mt-20 text-center text-sm text-gray-400">
                <p>Ce devis est valable pour une durée de 30 jours.</p>
                <p>Signature et Cachet</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}