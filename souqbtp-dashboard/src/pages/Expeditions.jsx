import { useState, useEffect } from 'react';
import useExpeditionStore from '../store/useExpeditionStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { FileText, Plus, Trash2, Printer, CheckCircle, Clock, XCircle, X, Truck } from 'lucide-react';

const translations = {
  ar: {
    title: 'بطاقات الشحن (Fiches d\'Expédition)', subtitle: 'إدارة أوراق الشحن والإرساليات الخاصة بالسائقين.',
    newSlip: 'إنشاء بطاقة شحن جديدة', clientName: 'العميل / وجهة الشحن',
    addLine: 'إضافة منتج', designation: 'البيان (المنتج)',
    qty: 'الكمية المشحونة',
    save: 'حفظ بطاقة الشحن', saving: 'جاري الحفظ...', history: 'سجل الشحنات', date: 'التاريخ',
    status: 'الحالة', actions: 'إجراءات', empty: 'لا توجد بطاقات شحن مسجلة.',
    pending: 'قيد التجهيز', shipped: 'في الطريق', delivered: 'تم التسليم', cancelled: 'ملغى', print: 'طباعة',
    clientPlaceholder: 'اسم العميل...', productPlaceholder: 'مثال: إسمنت، حديد...',
    errorMsg: 'خطأ: ', loading: 'جاري التحميل...',
    markShipped: 'تعيين كـ "في الطريق"', markDelivered: 'تعيين كـ "تم التسليم"',
    printAddress: 'عنوان الشركة', printType: "بطاقة شحن (EXP)",
    printDate: 'التاريخ:', printDest: 'الوجهة / العميل :',
    printDesignation: 'بيان المواد', printQty: 'الكمية',
    printSign1: 'مسؤول المخزن', printSign2: 'الناقل / السائق', printSign3: 'العميل (الاستلام)',
    printSignSub1: 'الاسم والتوقيع', printSignSub2: 'الاسم، اللوحة والتوقيع', printSignSub3: 'الختم والتوقيع'
  },
  fr: {
    title: 'Fiches d\'Expédition', subtitle: 'Gérez et imprimez les fiches pour les transporteurs.',
    newSlip: 'Créer une Nouvelle Fiche', clientName: 'Client / Destination',
    addLine: 'Ajouter un article', designation: 'Désignation',
    qty: 'Quantité expédiée',
    save: 'Enregistrer la Fiche', saving: 'Enregistrement...', history: 'Historique des Expéditions', date: 'Date',
    status: 'Statut', actions: 'Actions', empty: 'Aucune fiche enregistrée.',
    pending: 'En préparation', shipped: 'En transit', delivered: 'Livré', cancelled: 'Annulé', print: 'Imprimer',
    clientPlaceholder: 'Nom du Client...', productPlaceholder: 'Ex: Ciment Portland...',
    errorMsg: 'Erreur: ', loading: 'Chargement...',
    markShipped: 'Marquer en Transit', markDelivered: 'Marquer Livré',
    printAddress: 'Adresse de l\'entreprise', printType: "FICHE D'EXPÉDITION",
    printDate: 'Date:', printDest: 'Destination / Client :',
    printDesignation: 'Désignation des Articles', printQty: 'Quantité',
    printSign1: 'Responsable Magasin', printSign2: 'Transporteur / Chauffeur', printSign3: 'Client (Réception)',
    printSignSub1: 'Nom & Signature', printSignSub2: 'Nom, Matricule & Signature', printSignSub3: 'Cachet & Signature'
  },
  en: {
    title: 'Shipping Slips', subtitle: 'Manage shipping and dispatch slips for drivers.',
    newSlip: 'Create New Shipping Slip', clientName: 'Client / Destination',
    addLine: 'Add Item', designation: 'Description',
    qty: 'Shipped Quantity',
    save: 'Save Shipping Slip', saving: 'Saving...', history: 'Shipping History', date: 'Date',
    status: 'Status', actions: 'Actions', empty: 'No shipping slips registered.',
    pending: 'In preparation', shipped: 'In transit', delivered: 'Delivered', cancelled: 'Cancelled', print: 'Print',
    clientPlaceholder: 'Client Name...', productPlaceholder: 'Ex: Portland Cement...',
    errorMsg: 'Error: ', loading: 'Loading...',
    markShipped: 'Mark as In Transit', markDelivered: 'Mark as Delivered',
    printAddress: 'Company Address', printType: "SHIPPING SLIP",
    printDate: 'Date:', printDest: 'Destination / Client:',
    printDesignation: 'Item Description', printQty: 'Quantity',
    printSign1: 'Warehouse Manager', printSign2: 'Carrier / Driver', printSign3: 'Client (Reception)',
    printSignSub1: 'Name & Signature', printSignSub2: 'Name, Plate & Signature', printSignSub3: 'Stamp & Signature'
  }
};

export default function Expeditions() {
  const { shippingSlips, isLoading, fetchShippingSlips, createShippingSlip, updateStatus } = useExpeditionStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  // 🛡️ الترياق السحري موجود لحماية اللوحة
  const t = translations[language] || translations['fr'];

  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState([{ id: Date.now(), designation: '', qty: 1 }]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchShippingSlips(); }, [fetchShippingSlips]);

  const isFormValid = clientName.trim() !== '' && items.every(item => item.designation.trim() !== '');
  
  const safeInvoices = Array.isArray(shippingSlips) ? shippingSlips : [];
  const clientSuggestions = [...new Set(
    safeInvoices.map(inv => inv?.client_name).filter(Boolean)
  )];
  const productSuggestions = [...new Set(
    safeInvoices.flatMap(inv => 
      Array.isArray(inv?.items) ? inv.items.map(item => item?.designation) : []
    ).filter(Boolean)
  )];

  const handleAddItem = () => setItems([...items, { id: Date.now(), designation: '', qty: 1 }]);
  const handleRemoveItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
  const handleItemChange = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSaveSlip = async () => {
    if (!isFormValid) return;
    setIsSaving(true);
    const result = await createShippingSlip({
      client_name: clientName,
      items: items.map(({ designation, qty }) => ({ designation, qty }))
    });

    if (result.success) {
      setClientName('');
      setItems([{ id: Date.now(), designation: '', qty: 1 }]);
    } else {
      alert(t.errorMsg + result.error);
    }
    setIsSaving(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'shipped': return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><Truck size={14}/> {t.shipped}</span>;
      case 'delivered': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><CheckCircle size={14}/> {t.delivered}</span>;
      case 'cancelled': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><XCircle size={14}/> {t.cancelled}</span>;
      default: return <span className="flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-1 rounded-full text-xs font-bold w-fit"><Clock size={14}/> {t.pending}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* القسم الأول: نموذج إضافة بطاقة شحن */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4"><Truck size={20} className="text-orange-600"/> {t.newSlip}</h3>
          
          <div className="mb-6">
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

          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-12 gap-2 text-sm font-bold text-gray-500 mb-2 px-2">
              <div className="col-span-8">{t.designation}</div><div className="col-span-3 text-center">{t.qty}</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-8">
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
                <div className="col-span-3">
                  <input 
                    type="number" 
                    min="1" 
                    value={item.qty} 
                    onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500 text-center text-sm" 
                  />
                </div>
                <div className="col-span-1 text-center">
                  <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleAddItem} className="text-orange-600 font-bold text-sm flex items-center gap-1 hover:text-orange-800 mt-2">
              <Plus size={16}/> {t.addLine}
            </button>
            <datalist id="products-list">
              {productSuggestions.map((prod, i) => <option key={i} value={prod} />)}
            </datalist>
          </div>

          <div className={`mt-8 flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
            <button onClick={handleSaveSlip} disabled={!isFormValid || isSaving} className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </div>

        {/* القسم الثاني: السجل (Historique) */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-800">{t.history}</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isLoading ? (
              <div className="text-center text-gray-400 py-10">{t.loading}</div>
            ) : shippingSlips.length === 0 ? (
              <div className="text-center text-gray-400 py-10">{t.empty}</div>
            ) : shippingSlips.map(slip => (
              <div key={slip.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm truncate w-32">{slip.client_name}</h4>
                  <span className="text-xs text-gray-400">
                    {new Date(slip.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  {getStatusBadge(slip.status)}
                  <button onClick={() => setSelectedSlip(slip)} className="text-xs text-gray-500 hover:text-gray-800 underline mt-1 flex items-center gap-1 justify-end">
                    <Printer size={12}/> {t.print}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* القسم الثالث: نافذة الطباعة المنبثقة (Modal) */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center overflow-y-auto py-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white w-[800px] shadow-2xl p-10 relative print-area rounded-xl">
            <div className="absolute top-4 right-4 flex gap-2 no-print" dir="ltr">
              <button onClick={() => setSelectedSlip(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors">
                <X size={20} />
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-colors">
                <Printer size={18} /> {t.print}
              </button>
              
              {selectedSlip.status === 'pending' && (
                <button onClick={() => { updateStatus(selectedSlip.id, 'shipped'); setSelectedSlip({...selectedSlip, status: 'shipped'}); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">
                  <Truck size={18} /> {t.markShipped}
                </button>
              )}
              {selectedSlip.status === 'shipped' && (
                <button onClick={() => { updateStatus(selectedSlip.id, 'delivered'); setSelectedSlip({...selectedSlip, status: 'delivered'}); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
                  <CheckCircle size={18} /> {t.markDelivered}
                </button>
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
                  <h2 className="text-3xl font-light text-orange-600 uppercase tracking-widest mb-2">{t.printType}</h2>
                  <p className="text-gray-600 font-bold">N° EXP-{selectedSlip.id.slice(0,6).toUpperCase()}</p>
                  <p className="text-gray-500 text-sm">
                    {t.printDate} {new Date(selectedSlip.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')}
                  </p>
                </div>
              </div>

              <div className={`mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200 w-1/2 ${language === 'ar' ? 'mr-auto text-end' : 'ml-auto text-start'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.printDest}</p>
                <p className="text-xl font-bold text-gray-900">{selectedSlip.client_name}</p>
              </div>

              <table className="w-full text-start mb-8 border-collapse" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="bg-orange-600 text-white">
                    <th className={`p-3 font-bold ${language === 'ar' ? 'text-start rounded-tr-lg' : 'text-start rounded-tl-lg'}`}>{t.printDesignation}</th>
                    <th className={`p-3 font-bold text-center w-32 ${language === 'ar' ? 'rounded-tl-lg' : 'rounded-tr-lg'}`}>{t.printQty}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSlip.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className={`p-4 text-gray-800 font-medium ${language === 'ar' ? 'text-start' : 'text-start'}`}>{item.designation}</td>
                      <td className="p-4 text-center text-gray-800 font-bold text-lg bg-orange-50/50">{item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-20 flex justify-between text-sm text-gray-500 border-t border-gray-200 pt-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="text-center w-48">
                  <p className="font-bold text-gray-700 mb-8">{t.printSign1}</p>
                  <p className="border-t border-gray-300 pt-2">{t.printSignSub1}</p>
                </div>
                <div className="text-center w-48">
                  <p className="font-bold text-gray-700 mb-8">{t.printSign2}</p>
                  <p className="border-t border-gray-300 pt-2">{t.printSignSub2}</p>
                </div>
                <div className="text-center w-48">
                  <p className="font-bold text-gray-700 mb-8">{t.printSign3}</p>
                  <p className="border-t border-gray-300 pt-2">{t.printSignSub3}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}