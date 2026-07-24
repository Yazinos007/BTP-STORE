import { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, ShoppingBag, Loader2, CreditCard, X, TrendingUp, BrainCircuit, Truck, Trash2, Edit2, PhoneCall, Package, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useProductStore from '../store/useProductStore';
import useExternalSupplierStore from '../store/useExternalSupplierStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import SignatureCanvas from 'react-signature-canvas';

const translations = {
  ar: {
    title: 'إدارة المشتريات والتوريد', subtitle: 'إدخال مواد التصنيع، التغليف، والاستهلاكيات وتحديث ديون الموردين.',
    selectSupplier: 'اختر المورد', searchProd: 'ابحث عن مادة أو منتج...',
    cart: 'قائمة المشتريات (السلة)', costLabel: 'التكلفة:', stockLabel: 'المخزن:', saleLabel: 'البيع:',
    empty: 'القائمة فارغة', total: 'إجمالي الشراء',
    payCash: 'دفع نقداً', payCredit: 'شراء بالآجل (كريدي)', unit: 'الوحدة', qty: 'الكمية', price: 'ثمن الشراء',
    msgSelectSupplier: 'المرجو اختيار المورد أولاً!', msgEmptyCart: 'قائمة المشتريات فارغة!',
    msgAccountError: 'لم يتم التعرف على بيانات حسابك!', msgError: 'عذراً، حدث خطأ:',
    msgSuccess: '✅ تم تحديث مخزون المواد، تسجيل الفاتورة والمصروف بنجاح!', invoiceDesc: 'فاتورة مشتريات رقم:',
    categoryName: 'achats',
    drawSign: 'المرجو رسم توقيعك أولاً.', signSuccess: '✅ تم توقيع العقد بنجاح!',
    cancelConfirm: 'هل أنت متأكد من إلغاء هذا الطلب؟', cancelSuccess: '✅ تم إلغاء الطلب بنجاح.',
    editConfirm: 'هل تريد استرجاع الطلب للسلة لتعديله؟', fallbackSupplier: 'المورد',
    poSent: '✅ تم إرسال الطلب إلى', receiveSuccess: '✅ تم الاستلام بنجاح وتوليد الفاتورة ووصل التسليم!',
    receiveError: '⚠️ تم الاستلام لكن ببعض الأخطاء:\n',
    b2bTitle: 'سجل طلبات التزويد (B2B)', noB2b: 'لم تقم بإرسال أي طلبات تزويد بعد.',
    statusPending: 'بانتظار المورد', statusSignReq: 'يتطلب توقيعك', statusSigned: 'تم التوقيع بنجاح',
    statusShipped: 'الشاحنة في الطريق 🚚', statusDelivered: 'تم التسليم ✅',
    reqItems: 'مواد مطلوبة :', deliveryDetails: 'تفاصيل التوصيل', signContractBtn: 'توقيع العقد (مصافحة)',
    digitallySigned: 'موقع رقمياً:', confirmReceiptBtn: 'تأكيد الاستلام (إدخال للمخزن)',
    completedMsg: '🎉 تم التسليم، وجرد المخزون، وتوليد الفاتورة بنجاح!', legalSign: 'التوقيع القانوني',
    signDesc: 'المرجو رسم توقيعك بوضوح داخل الإطار بالأسفل.', clear: 'مسح', cancel: 'إلغاء', confirmSign: 'تأكيد وحفظ التوقيع',
    sendPO: 'إرسال طلب تزويد (Purchase Order)',
    types: { 'all': 'الكل', 'raw_material': '🧱 مواد خام', 'packaging': '📦 تعبئة وتغليف', 'consumable': '⚙️ استهلاكية' }
  },
  fr: {
    title: 'Achats & Approvisionnement', subtitle: 'Entrée des matières, emballages, et dettes fournisseurs.',
    selectSupplier: 'Choisir le Fournisseur', searchProd: 'Rechercher un article...',
    cart: 'Liste d\'Achat (Panier)', costLabel: 'Coût:', stockLabel: 'Stock:', saleLabel: 'Vente:',
    empty: 'Liste vide', total: 'Total Achat',
    payCash: 'Payer Cash', payCredit: 'Achat à Crédit', unit: 'Unité', qty: 'Qté', price: 'Prix d\'achat',
    msgSelectSupplier: 'Veuillez choisir un fournisseur !', msgEmptyCart: 'La liste d\'achat est vide !',
    msgAccountError: 'Erreur d\'identification du compte !', msgError: 'Désolé, une erreur est survenue :',
    msgSuccess: '✅ Stock, Facture et Charge enregistrés avec succès !', invoiceDesc: 'Facture d\'achat N° :',
    categoryName: 'achats',
    drawSign: 'Veuillez dessiner votre signature.', signSuccess: '✅ Contrat signé avec succès !',
    cancelConfirm: 'Annuler cette commande ?', cancelSuccess: '✅ Commande annulée.',
    editConfirm: 'Modifier cette commande ?', fallbackSupplier: 'fournisseur',
    poSent: '✅ Commande envoyée à', receiveSuccess: '✅ Réception validée et intégrée !',
    receiveError: '⚠️ Réception validée avec quelques erreurs :\n',
    b2bTitle: 'Suivi des Commandes B2B', noB2b: 'Vous n\'avez envoyé aucune commande B2B.',
    statusPending: 'En attente', statusSignReq: 'Signature Requise', statusSigned: 'Signé & Confirmé',
    statusShipped: 'En Route 🚚', statusDelivered: 'Livré ✅',
    reqItems: 'Articles demandés :', deliveryDetails: 'Détails de Livraison', signContractBtn: 'Signer le Contrat',
    digitallySigned: 'Signé numériquement :', confirmReceiptBtn: 'Confirmer la Réception (Stock)',
    completedMsg: '🎉 Livré, Facturé & Intégré au Stock !', legalSign: 'Signature Légale',
    signDesc: 'Veuillez dessiner votre signature dans le cadre ci-dessous.', clear: 'Effacer', cancel: 'Annuler', confirmSign: 'Confirmer & Signer',
    sendPO: 'Envoyer Bon de Commande (B2B)',
    types: { 'all': 'Tout', 'raw_material': '🧱 Matière 1ère', 'packaging': '📦 Emballage', 'consumable': '⚙️ Consommable' }
  },
  en: {
    title: 'Purchases & Procurement', subtitle: 'Enter raw materials, packaging, and update supplier debts.',
    selectSupplier: 'Select Supplier', searchProd: 'Search for an item...',
    cart: 'Purchase List (Cart)', costLabel: 'Cost:', stockLabel: 'Stock:', saleLabel: 'Sale:',
    empty: 'List is empty', total: 'Total Purchase',
    payCash: 'Pay Cash', payCredit: 'Buy on Credit', unit: 'Unit', qty: 'Qty', price: 'Purchase Price',
    msgSelectSupplier: 'Please select a supplier first!', msgEmptyCart: 'Purchase list is empty!',
    msgAccountError: 'Account identification error!', msgError: 'Sorry, an error occurred:',
    msgSuccess: '✅ Stock, Invoice and Expense successfully recorded!', invoiceDesc: 'Purchase Invoice No:',
    categoryName: 'achats',
    drawSign: 'Please draw your signature.', signSuccess: '✅ Contract signed successfully!',
    cancelConfirm: 'Cancel this order?', cancelSuccess: '✅ Order cancelled.',
    editConfirm: 'Modify this order?', fallbackSupplier: 'supplier',
    poSent: '✅ Order sent to', receiveSuccess: '✅ Receipt validated and integrated!',
    receiveError: '⚠️ Receipt validated with some errors:\n',
    b2bTitle: 'B2B Orders Tracking', noB2b: 'You have not sent any B2B orders yet.',
    statusPending: 'Pending', statusSignReq: 'Signature Required', statusSigned: 'Signed & Confirmed',
    statusShipped: 'On the Way 🚚', statusDelivered: 'Delivered ✅',
    reqItems: 'Requested items:', deliveryDetails: 'Delivery Details', signContractBtn: 'Sign Contract',
    digitallySigned: 'Digitally signed:', confirmReceiptBtn: 'Confirm Receipt (Add to Stock)',
    completedMsg: '🎉 Delivered, Invoiced & Integrated into Stock!', legalSign: 'Legal Signature',
    signDesc: 'Please draw your signature in the frame below.', clear: 'Clear', cancel: 'Cancel', confirmSign: 'Confirm & Sign',
    sendPO: 'Send Purchase Order (B2B)',
    types: { 'all': 'All', 'raw_material': '🧱 Raw Material', 'packaging': '📦 Packaging', 'consumable': '⚙️ Consumable' }
  }
};

const ITEM_TYPES_FILTER = ['all', 'raw_material', 'packaging', 'consumable'];

export default function RawMaterialPurchases() {
  const { products, fetchProducts, updateProduct } = useProductStore();
  const { suppliers, fetchSuppliers, updateSupplier } = useExternalSupplierStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  const t = translations[language] || translations['fr'];

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 🎯 فلتر نوع المنتج
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [contractToSign, setContractToSign] = useState(null);
  const sigCanvas = useRef({});

  const openSignModal = (id) => {
    setContractToSign(id);
    setIsSignModalOpen(true);
  };

  const closeSignModal = () => {
    setIsSignModalOpen(false);
    setContractToSign(null);
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  const handleSaveSignature = async () => {
    try {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        return alert(t.drawSign);
      }

      setIsProcessing(true);
      const signatureImageBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');

      const { error } = await supabase
        .from('supply_requests')
        .update({ status: 'signed', digital_signature: signatureImageBase64 })
        .eq('id', contractToSign);

      if (error) throw error;
      
      alert(t.signSuccess);
      fetchB2BRequests();
      closeSignModal();
    } catch (err) {
      console.error("Signature Error:", err);
      alert(t.msgError + " " + (err.message || "فشل في حفظ التوقيع"));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => { fetchProducts(); fetchSuppliers(); }, [fetchProducts, fetchSuppliers]);

  // 🎯 جلب المنتجات وإخفاء "المنتجات النهائية" (لأنها لا تشترى كمواد)
  const purchaseableProducts = products.filter(p => (p.item_type || 'finished_good') !== 'finished_good');

  const filteredProducts = purchaseableProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || (p.item_type || 'finished_good') === filterType;
    return matchesSearch && matchesType;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, purchase_price: product.cost_price || 0 }]; 
    });
  };

  const updateCartItem = (id, field, value) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const total = cart.reduce((sum, item) => sum + (Number(item.purchase_price) * Number(item.quantity)), 0);

  const [b2bRequests, setB2bRequests] = useState([]);
  
  const fetchB2BRequests = async () => {
    const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
    const { data } = await supabase
      .from('supply_requests')
      .select('*')
      .eq('merchant_id', targetId)
      .order('created_at', { ascending: false });
    
    if (data) setB2bRequests(data);
  };

  useEffect(() => {
    fetchB2BRequests();
    const channel = supabase.channel('b2b-tracking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supply_requests' }, () => {
        fetchB2BRequests();
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [supplier]);

  const handleDeleteB2B = async (id) => {
    if (!window.confirm(t.cancelConfirm)) return;

    try {
      const { error } = await supabase.from('supply_requests').delete().eq('id', id);
      if (error) throw error;
      fetchB2BRequests();
      alert(t.cancelSuccess);
    } catch (err) { 
      console.error(err);
      alert(t.msgError + " " + err.message);
    }
  };

  const handleEditB2B = async (req) => {
    if (!window.confirm(t.editConfirm)) return;
    
    setCart(req.items);
    await supabase.from('supply_requests').delete().eq('id', req.id);
    fetchB2BRequests();
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleSendPO = async () => {
    if (!selectedSupplierId) return alert(t.msgSelectSupplier);
    if (cart.length === 0) return alert(t.msgEmptyCart);

    setIsProcessing(true);
    try {
      const merchantId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      const { data: chosenSup } = await supabase.from('external_suppliers').select('name').eq('id', selectedSupplierId).single();
      const supplierName = chosenSup?.name || t.fallbackSupplier;

      const { error: poError } = await supabase.from('supply_requests').insert({
        merchant_id: merchantId,
        supplier_id: selectedSupplierId,
        items: cart,
        total_amount: total,
        status: 'pending'
      });

      if (poError) throw poError;

      setCart([]);
      alert(`${t.poSent} ${supplierName}`);
      fetchB2BRequests();
    } catch (err) {
      alert(t.msgError + " " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceiveOrder = async (req) => {
    setIsProcessing(true);
    try {
      await supabase.from('supply_requests').update({ status: 'completed' }).eq('id', req.id);

      const { data: allProds } = await supabase.from('products').select('id, name, stock_quantity, supplier_id');
      
      for (const item of req.items) {
        const cleanName = item.name.replace(/\s+/g, '').toLowerCase();
        const mProd = allProds?.find(p => p.supplier_id === req.merchant_id && p.name.replace(/\s+/g, '').toLowerCase() === cleanName);
        if (mProd) await supabase.from('products').update({ stock_quantity: Number(mProd.stock_quantity || 0) + Number(item.quantity) }).eq('id', mProd.id);
      }

      const refNumber = Date.now().toString().slice(-4);
      let financialErrors = [];

      const { error: err2 } = await supabase.from('purchase_invoices').insert({ 
         supplier_id: req.merchant_id, 
         external_supplier_id: req.supplier_id, 
         invoice_number: `ACH-MAT-${refNumber}`, 
         total_amount: req.total_amount, 
         items: req.items,
         payment_method: 'credit' 
      });
      if (err2) financialErrors.push("Facture Achat: " + err2.message);

      try {
        const { data: extSup } = await supabase.from('external_suppliers').select('total_debt').eq('id', req.supplier_id).single();
        if (extSup) {
          await supabase.from('external_suppliers').update({ 
            total_debt: Number(extSup.total_debt || 0) + Number(req.total_amount) 
          }).eq('id', req.supplier_id);
        }
      } catch(e) { console.error("Debt Error", e); }

      const { error: err3 } = await supabase.from('expenses').insert({ 
         supplier_id: req.merchant_id, 
         title: `Achat Matières Premières B2B`, 
         amount: req.total_amount, 
         category: t.categoryName, 
         date: new Date().toISOString() 
      });
      if (err3) financialErrors.push("Dépenses: " + err3.message);

      if (financialErrors.length > 0) {
          alert(`${t.receiveError}${financialErrors.join('\n')}`);
      } else {
          alert(t.receiveSuccess);
      }

      fetchB2BRequests();
      fetchProducts();
    } catch (err) {
      alert(t.msgError + "\n" + err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCompletePurchase = async (method) => {
    if (!selectedSupplierId || cart.length === 0) return alert(t.msgSelectSupplier);
    setIsProcessing(true);

    try {
      const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      const extSupplier = suppliers.find(s => s.id === selectedSupplierId);
      const invNumber = `ACH-MAT-${Date.now().toString().slice(-6)}`;

      for (const item of cart) {
        await updateProduct(item.id, { 
          stock_quantity: Number(item.stock_quantity) + Number(item.quantity),
          cost_price: Number(item.purchase_price) 
        });
      }

      const { error: invError } = await supabase.from('purchase_invoices').insert([{
        supplier_id: targetId,
        external_supplier_id: selectedSupplierId,
        invoice_number: invNumber,
        total_amount: total,
        items: cart,
        payment_method: method
      }]);
      if (invError) throw invError;

      if (method === 'cash') {
        const { error: eError } = await supabase.from('expenses').insert([{
          supplier_id: targetId,
          title: `${t.invoiceDesc} ${invNumber}`, 
          amount: total,
          category: t.categoryName
        }]);
        if (eError) console.error("خطأ في المصروف:", eError.message);
      }

      if (method === 'credit') {
        const newDebt = Number(extSupplier?.total_debt || 0) + total;
        await updateSupplier(selectedSupplierId, { total_debt: newDebt });
      }

      setCart([]);
      setSelectedSupplierId('');
      alert(`${t.msgSuccess} \n${t.invoiceDesc} ${invNumber}`);
    } catch (err) {
      console.error(err);
      alert(t.msgError + " " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Layers className="text-blue-500" size={32}/> {t.title}
          </h2>
          <p className="text-slate-300 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
            
            {/* 🎯 قسم اختيار المورد والبحث */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-400 mb-2">{t.selectSupplier}</label>
                <select 
                  value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none focus:border-blue-500 font-bold"
                >
                  <option value="">-- {t.selectSupplier} --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-400 mb-2">{t.searchProd}</label>
                <div className="relative">
                  <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                  <input 
                    type="text" placeholder={t.searchProd} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none focus:border-blue-500 font-bold`}
                  />
                </div>
              </div>
            </div>

            {/* 🎯 شريط فلترة الـ DNA (مدمج كأزرار أنيقة) */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {ITEM_TYPES_FILTER.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    filterType === type 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {t.types[type]}
                </button>
              ))}
            </div>

            {/* 🎯 قائمة المنتجات المتاحة للشراء */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addToCart(p)} 
                  className={`p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-slate-700 transition-all group relative overflow-hidden ${language === 'ar' ? 'text-right' : 'text-left'}`}
                >
                  <p className="font-bold text-slate-200 group-hover:text-blue-400 truncate">{p.name}</p>
                  
                  {/* عرض الـ DNA الخاص بالمادة */}
                  <div className="mt-1">
                    <span className="text-[9px] font-black opacity-70">{t.types[p.item_type || 'raw_material']}</span>
                  </div>

                  <div className="flex flex-col mt-2 gap-1 border-t border-slate-700/50 pt-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 uppercase font-bold">{t.costLabel}</span>
                      <span className="text-emerald-400 font-black" dir="ltr">{p.cost_price || 0} DH</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center bg-slate-950 px-2 py-1 rounded">
                    <span className="text-[10px] text-slate-400">{t.stockLabel}</span>
                    <span className="text-xs font-black text-white">{p.stock_quantity} {p.unit}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🎯 سلة المشتريات (السيدبار الجانبي) */}
        <div className="lg:col-span-1">
          <div className="bg-[#1e293b] border border-slate-700 text-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-fit sticky top-6">
            <div className="p-6 bg-slate-900/80 border-b border-slate-700 flex items-center gap-3">
              <ShoppingBag className="text-blue-400" />
              <h3 className="font-black text-xl">{t.cart}</h3>
            </div>

            <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-slate-500 italic font-bold">{t.empty}</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 mb-3 hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-2">
                        <p className="font-bold text-sm text-slate-200">{item.name}</p>
                        <p className="text-[9px] text-blue-400 mt-0.5">{t.types[item.item_type || 'raw_material']}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 bg-slate-800 p-1.5 rounded-lg">
                        <X size={14}/>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">{t.qty}</label>
                        <input 
                          type="number" min="1" value={item.quantity} onChange={(e) => updateCartItem(item.id, 'quantity', e.target.value)}
                          className="w-full bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 outline-none"
                        />
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">{t.price}</label>
                        <input 
                          type="number" step="0.01" value={item.purchase_price} onChange={(e) => updateCartItem(item.id, 'purchase_price', e.target.value)}
                          className="w-full bg-transparent border-none text-emerald-400 text-sm font-bold p-0 focus:ring-0 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-900/90 border-t border-slate-700 space-y-4">
              <div className="flex justify-between items-end bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">{t.total}</span>
                <div className="text-right flex items-baseline gap-1" dir="ltr">
                  <span className="text-3xl font-black text-blue-400">{total.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">MAD</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <button 
                  disabled={isProcessing || cart.length === 0} onClick={() => handleCompletePurchase('cash')}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg disabled:opacity-50 text-sm"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle size={16}/> {t.payCash}</>}
                </button>
                
                <button 
                   disabled={isProcessing || cart.length === 0} onClick={() => handleCompletePurchase('credit')}
                   className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg disabled:opacity-50 text-sm"
                >
                  <CreditCard size={16}/> {t.payCredit}
                </button>

                <button 
                   disabled={isProcessing || cart.length === 0} 
                   onClick={handleSendPO}
                   className="w-full md:col-span-2 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 text-white text-sm"
                >
                  <Truck size={18}/> {t.sendPO}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 قسم تتبع طلبات B2B المتبقية بالأسفل */}
      <div className="mt-8 bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-xl">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <Truck className="text-blue-400" />
          {t.b2bTitle}
        </h3>
        
        {b2bRequests.length === 0 ? (
          <div className="text-center text-slate-500 py-10 font-medium bg-slate-900/50 rounded-2xl border border-slate-700">
            {t.noB2b}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {b2bRequests.map(req => (
              <div key={req.id} className="border border-slate-700 rounded-2xl p-5 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-900 transition-all shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500">PO #{req.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-lg font-black text-white" dir="ltr">{Number(req.total_amount).toLocaleString()} DH</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {req.status === 'pending' && <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-black border border-orange-500/20">{t.statusPending}</span>}
                    {req.status === 'confirmed' && <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-black animate-pulse border border-blue-500/20">{t.statusSignReq}</span>}
                    {req.status === 'signed' && <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-black border border-emerald-500/20">{t.statusSigned}</span>}
                    {req.status === 'shipped' && <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-black animate-pulse border border-indigo-500/20">{t.statusShipped}</span>}
                    {req.status === 'delivered' && <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-black border border-slate-600">{t.statusDelivered}</span>}

                    {req.status === 'pending' && (
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleEditB2B(req)} className="text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500 p-2 rounded-lg transition-all"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteB2B(req.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-lg transition-all"><Trash2 size={16}/></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-400 mb-2">
                    {req.items?.length} {t.reqItems}
                  </p>
                  <div className="bg-slate-950 rounded-xl p-3 space-y-2 border border-slate-800 max-h-32 overflow-y-auto custom-scrollbar">
                    {req.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-1 last:border-0 last:pb-0">
                        <div>
                          <span className="font-bold text-slate-300">{item.name}</span>
                          <span className="block text-[9px] text-blue-400 mt-0.5">{t.types[item.item_type || 'raw_material']}</span>
                        </div>
                        <span className="text-emerald-400 font-black px-2 py-1 bg-emerald-500/10 rounded-md text-xs">
                          {item.quantity} {t.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {(req.status === 'shipped' || req.status === 'delivered') && (
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{t.deliveryDetails}</span>
                      <span className="text-xs font-black text-slate-300 bg-slate-800 px-2 py-1 rounded shadow-sm">{req.vehicle_plate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">🚚 {req.driver_name}</span>
                      {req.driver_phone && (
                        <a href={`tel:${req.driver_phone}`} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold text-sm bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all border border-blue-500/20">
                          <PhoneCall size={14}/> {req.driver_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {req.status === 'confirmed' && (
                  <button 
                    onClick={() => openSignModal(req.id)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                  >
                    <CheckCircle size={18} /> {t.signContractBtn}
                  </button>
                )}
                
                {req.status !== 'pending' && req.status !== 'confirmed' && req.digital_signature && req.digital_signature.startsWith('data:image') && (
                <div className="w-full p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-slate-500 mb-2">{t.digitallySigned}</p>
                  <img src={req.digital_signature} alt="Signature" className="h-10 object-contain invert opacity-70" />
                </div>
                )}

                {(req.status === 'shipped' || req.status === 'delivered') && (
                  <button 
                    onClick={() => handleReceiveOrder(req)} 
                    disabled={isProcessing} 
                    className="w-full py-3.5 mt-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 animate-pulse border border-emerald-500"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <><Package size={18} /> {t.confirmReceiptBtn}</>}
                  </button>
                )}

                {req.status === 'completed' && (
                  <div className="w-full py-3 mt-3 bg-emerald-500/10 text-emerald-400 rounded-xl font-black flex justify-center items-center gap-2 border border-emerald-500/20 text-sm">
                     🎉 {t.completedMsg}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isSignModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-fade-in text-center">
            <h3 className="text-2xl font-black text-white mb-2">
              {t.legalSign}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {t.signDesc}
            </p>
            
            <div className="border border-slate-600 rounded-2xl bg-white mb-6 overflow-hidden shadow-inner" dir="ltr">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ width: 350, height: 180, className: 'sigCanvas w-full cursor-crosshair' }}
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => sigCanvas.current.clear()} 
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-xl transition-all"
              >
                {t.clear}
              </button>
              <button 
                onClick={closeSignModal} 
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all"
              >
                {t.cancel}
              </button>
            </div>
            
            <button 
              onClick={handleSaveSignature}
              disabled={isProcessing}
              className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 text-lg"
            >
               {isProcessing ? <Loader2 className="animate-spin" size={20}/> : t.confirmSign}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}