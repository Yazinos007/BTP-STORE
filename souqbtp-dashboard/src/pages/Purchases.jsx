import { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, ShoppingBag, Loader2, CreditCard, X, TrendingUp, BrainCircuit, Truck, Trash2, Edit2, PhoneCall, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useProductStore from '../store/useProductStore';
import useExternalSupplierStore from '../store/useExternalSupplierStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import confetti from 'canvas-confetti';
import SignatureCanvas from 'react-signature-canvas';

const translations = {
  ar: {
    title: 'مشتريات المخزون', subtitle: 'إدخال السلع الجديدة وتحديث ديون الموردين.',
    selectSupplier: 'اختر المورد', searchProd: 'ابحث عن منتج لشرائه...',
    cart: 'قائمة المشتريات', costLabel: 'التكلفة:', stockLabel: 'المخزن:', saleLabel: 'البيع:',
    empty: 'القائمة فارغة', total: 'إجمالي الشراء',
    payCash: 'دفع نقداً', payCredit: 'شراء بالآجل (كريدي)', unit: 'الوحدة', qty: 'الكمية', price: 'ثمن الشراء',
    msgSelectSupplier: 'المرجو اختيار المورد أولاً!', msgEmptyCart: 'قائمة المشتريات فارغة!',
    msgAccountError: 'لم يتم التعرف على بيانات حسابك!', msgError: 'عذراً، حدث خطأ:',
    profitMargin: 'هامش الربح:', expectedProfit: 'الربح المتوقع:',
    msgSuccess: '✅ تم التحديث بنجاح!', invoiceDesc: 'فاتورة شراء رقم:',
    drawSign: 'المرجو رسم توقيعك أولاً.', signSuccess: '✅ تم توقيع العقد بنجاح!',
    signPrompt: 'لتوقيع هذا العقد والموافقة عليه، اكتب اسمك الكامل هنا:',
    cancelConfirm: 'هل أنت متأكد من إلغاء هذا الطلب؟', cancelSuccess: '✅ تم إلغاء الطلب بنجاح.',
    editConfirm: 'هل تريد استرجاع الطلب للسلة لتعديله؟', fallbackSupplier: 'المورد',
    poSent: '✅ تم إرسال الطلب إلى', receiveSuccess: '✅ تم الاستلام بنجاح وتوليد الفاتورة ووصل التسليم!',
    b2bTitle: 'سجل طلبات التزويد (B2B)', noB2b: 'لم تقم بإرسال أي طلبات تزويد بعد.',
    statusPending: 'بانتظار المورد', statusSignReq: 'يتطلب توقيعك', statusSigned: 'تم التوقيع بنجاح',
    statusShipped: 'الشاحنة في الطريق 🚚', statusDelivered: 'تم التسليم ✅',
    reqItems: 'منتجات مطلوبة :', deliveryDetails: 'تفاصيل التوصيل', signContractBtn: 'توقيع العقد (مصافحة)',
    digitallySigned: 'موقع رقمياً:', confirmReceiptBtn: 'تأكيد استلام البضاعة (إدخال للمخزن)',
    completedMsg: '🎉 تم التسليم، وجرد المخزون، وتوليد الفاتورة بنجاح!', legalSign: 'التوقيع القانوني',
    signDesc: 'المرجو رسم توقيعك بوضوح داخل الإطار بالأسفل.', clear: 'مسح', cancel: 'إلغاء', confirmSign: 'تأكيد وحفظ التوقيع',
    sendPO: 'إرسال طلب تزويد (Purchase Order)'
  },
  fr: {
    title: 'Achats & Stock In', subtitle: 'Entrée de marchandises et dettes fournisseurs.',
    selectSupplier: 'Choisir le Fournisseur', searchProd: 'Rechercher un produit...',
    cart: 'Liste d\'Achat', costLabel: 'Coût:', stockLabel: 'Stock:', saleLabel: 'Vente:',
    empty: 'Liste vide', total: 'Total Achat',
    payCash: 'Payer Cash', payCredit: 'Achat à Crédit', unit: 'Unité', qty: 'Qté', price: 'Prix d\'achat',
    msgSelectSupplier: 'Veuillez choisir un fournisseur !', msgEmptyCart: 'La liste d\'achat est vide !',
    msgAccountError: 'Erreur d\'identification du compte !', msgError: 'Désolé, une erreur est survenue :',
    profitMargin: 'Marge:', expectedProfit: 'Profit Prévu:',
    msgSuccess: '✅ Enregistré avec succès !', invoiceDesc: 'Facture d\'achat N° :',
    drawSign: 'Veuillez dessiner votre signature.', signSuccess: '✅ Contrat signé avec succès !',
    signPrompt: 'Pour signer ce bon de commande, tapez votre nom complet :',
    cancelConfirm: 'Annuler cette commande ?', cancelSuccess: '✅ Commande annulée.',
    editConfirm: 'Modifier cette commande ?', fallbackSupplier: 'fournisseur',
    poSent: '✅ Commande envoyée à', receiveSuccess: '✅ Réception validée (Factures et BL générés) !',
    b2bTitle: 'Suivi des Commandes B2B', noB2b: 'Vous n\'avez envoyé aucune commande B2B.',
    statusPending: 'En attente', statusSignReq: 'Signature Requise', statusSigned: 'Signé & Confirmé',
    statusShipped: 'En Route 🚚', statusDelivered: 'Livré ✅',
    reqItems: 'Articles demandés :', deliveryDetails: 'Détails de Livraison', signContractBtn: 'Signer le Contrat',
    digitallySigned: 'Signé numériquement :', confirmReceiptBtn: 'Confirmer la Réception',
    completedMsg: '🎉 Livré, Facturé & Intégré au Stock !', legalSign: 'Signature Légale',
    signDesc: 'Veuillez dessiner votre signature dans le cadre ci-dessous.', clear: 'Effacer', cancel: 'Annuler', confirmSign: 'Confirmer & Signer',
    sendPO: 'Envoyer Bon de Commande (B2B)'
  },
  en: {
    title: 'Purchases & Stock In', subtitle: 'Enter new goods and update supplier debts.',
    selectSupplier: 'Select Supplier', searchProd: 'Search product...',
    cart: 'Purchase List', costLabel: 'Cost:', stockLabel: 'Stock:', saleLabel: 'Sale:',
    empty: 'List is empty', total: 'Total Purchase',
    payCash: 'Pay Cash', payCredit: 'Buy on Credit', unit: 'Unit', qty: 'Qty', price: 'Purchase Price',
    msgSelectSupplier: 'Please select a supplier first!', msgEmptyCart: 'Purchase list is empty!',
    msgAccountError: 'Account identification error!', msgError: 'Sorry, an error occurred:',
    profitMargin: 'Margin:', expectedProfit: 'Expected Profit:',
    msgSuccess: '✅ Successfully recorded!', invoiceDesc: 'Purchase Invoice No:',
    drawSign: 'Please draw your signature.', signSuccess: '✅ Contract signed successfully!',
    signPrompt: 'To sign this order, type your full name here:',
    cancelConfirm: 'Cancel this order?', cancelSuccess: '✅ Order cancelled.',
    editConfirm: 'Modify this order?', fallbackSupplier: 'supplier',
    poSent: '✅ Order sent to', receiveSuccess: '✅ Receipt validated (Invoices and BL generated)!',
    b2bTitle: 'B2B Orders Tracking', noB2b: 'You have not sent any B2B orders yet.',
    statusPending: 'Pending', statusSignReq: 'Signature Required', statusSigned: 'Signed & Confirmed',
    statusShipped: 'On the Way 🚚', statusDelivered: 'Delivered ✅',
    reqItems: 'Requested items:', deliveryDetails: 'Delivery Details', signContractBtn: 'Sign Contract',
    digitallySigned: 'Digitally signed:', confirmReceiptBtn: 'Confirm Receipt (Add to Stock)',
    completedMsg: '🎉 Delivered, Invoiced & Integrated into Stock!', legalSign: 'Legal Signature',
    signDesc: 'Please draw your signature in the frame below.', clear: 'Clear', cancel: 'Cancel', confirmSign: 'Confirm & Sign',
    sendPO: 'Send Purchase Order (B2B)'
  }
};

export default function Purchases() {
  const { products, fetchProducts, updateProduct } = useProductStore();
  const { suppliers, fetchSuppliers, updateSupplier } = useExternalSupplierStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🌟 حالات التوقيع اليدوي
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [contractToSign, setContractToSign] = useState(null);
  const sigCanvas = useRef({});

  // فتح نافذة التوقيع
  const openSignModal = (id) => {
    setContractToSign(id);
    setIsSignModalOpen(true);
  };

  // إغلاق وتنظيف النافذة
  const closeSignModal = () => {
    setIsSignModalOpen(false);
    setContractToSign(null);
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  // 🌟 دالة حفظ التوقيع كصورة
  const handleSaveSignature = async () => {
    try {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        return alert(t.drawSign);
      }

      setIsProcessing(true);

      const signatureImageBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');

      const { error } = await supabase
        .from('supply_requests')
        .update({ 
          status: 'signed', 
          digital_signature: signatureImageBase64 
        })
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

  // 🌟 حالات تتبع طلبات B2B
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

  const handleSignContract = async (id) => {
    const signatureName = window.prompt(t.signPrompt);
    
    if (!signatureName) return;

    try {
      const { error } = await supabase
        .from('supply_requests')
        .update({ 
          status: 'signed', 
          digital_signature: signatureName 
        })
        .eq('id', id);

      if (error) throw error;
      alert(t.signSuccess);
      fetchB2BRequests();
    } catch (err) {
      console.error(err);
      alert(t.msgError + " " + err.message);
    }
  };

  const handleDeleteB2B = async (id) => {
    if (!window.confirm(t.cancelConfirm)) return;

    try {
      const { error } = await supabase.from('supply_requests').delete().eq('id', id);
      
      if (error) {
        console.error("فشل الحذف:", error.message);
        alert(t.msgError + " " + error.message);
        return;
      }

      fetchB2BRequests();
      alert(t.cancelSuccess);
      
    } catch (err) { 
      console.error(err);
      alert(t.msgError);
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
      const { data: chosenSup } = await supabase.from('suppliers').select('store_name').eq('id', selectedSupplierId).single();
      const supplierName = chosenSup?.store_name || t.fallbackSupplier;

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
      
      if (typeof fetchB2BRequests === 'function') fetchB2BRequests();
    } catch (err) {
      alert(t.msgError + " " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceiveOrder = async (req) => {
    setIsProcessing(true);
    try {
      // 1. إنهاء الطلب
      await supabase.from('supply_requests').update({ status: 'completed' }).eq('id', req.id);

      // 2. تحديث المخازن 
      const { data: allProds } = await supabase.from('products').select('id, name, stock_quantity, supplier_id');
      
      for (const item of req.items) {
        const cleanName = item.name.replace(/\s+/g, '').toLowerCase();
        
        const mProd = allProds?.find(p => p.supplier_id === req.merchant_id && p.name.replace(/\s+/g, '').toLowerCase() === cleanName);
        if (mProd) await supabase.from('products').update({ stock_quantity: Number(mProd.stock_quantity || 0) + Number(item.quantity) }).eq('id', mProd.id);

        const bProd = allProds?.find(p => p.supplier_id !== req.merchant_id && p.name.replace(/\s+/g, '').toLowerCase() === cleanName);
        if (bProd) await supabase.from('products').update({ stock_quantity: Math.max(0, Number(bProd.stock_quantity || 0) - Number(item.quantity)) }).eq('id', bProd.id);
      }

      // 3. 🚨 القسم المالي: تسجيل الفواتير والمصاريف
      const refNumber = Date.now().toString().slice(-4);
      let financialErrors = [];

      // أ- فاتورة البيع و وصل التسليم للمورد (الـ Boss)
      if (req.supplier_id) {
          const { error: err1 } = await supabase.from('documents').insert({ 
             owner_id: req.supplier_id, 
             client_id: null, 
             type: 'Facture', 
             ref_number: `FAC-B2B-${refNumber}`, 
             total_amount: req.total_amount, 
             items: req.items 
          });
          if (err1) financialErrors.push("Facture Boss: " + err1.message);

          const { error: errBL } = await supabase.from('documents').insert({ 
             owner_id: req.supplier_id, 
             client_id: null, 
             type: 'Bon de Livraison', 
             ref_number: `BL-B2B-${refNumber}`, 
             total_amount: req.total_amount, 
             items: req.items 
          });
          if (errBL) financialErrors.push("BL Boss: " + errBL.message);
      }

      // 🎯 ب- فاتورة الشراء للتاجر
      const { error: err2 } = await supabase.from('purchase_invoices').insert({ 
         supplier_id: req.merchant_id, 
         external_supplier_id: req.supplier_id,
         invoice_number: `ACH-B2B-${refNumber}`, 
         total_amount: req.total_amount, 
         items: req.items,
         payment_method: 'credit' 
      });
      if (err2) financialErrors.push("Facture Achat: " + err2.message);

      // 🎯 ج- تحديث ديون المورد 
      try {
        const { data: extSup } = await supabase.from('external_suppliers').select('total_debt').eq('id', req.supplier_id).single();
        if (extSup) {
          await supabase.from('external_suppliers').update({ 
            total_debt: Number(extSup.total_debt || 0) + Number(req.total_amount) 
          }).eq('id', req.supplier_id);
        }
      } catch(e) { console.error("Debt Error", e); }

      // د- المصروف المحاسبي
      const { error: err3 } = await supabase.from('expenses').insert({ 
         supplier_id: req.merchant_id, 
         title: `Achat Stock B2B`, 
         amount: req.total_amount, 
         category: 'achats', 
         date: new Date().toISOString() 
      });
      if (err3) financialErrors.push("Dépenses: " + err3.message);

      // 4. تقييم العملية
      if (financialErrors.length > 0) {
          alert(`⚠️ تم الاستلام وتحديث المخزون بنجاح، لكن قاعدة البيانات رفضت تسجيل بعض الوثائق:\n\n${financialErrors.join('\n')}`);
      } else {
          alert(t.receiveSuccess);
      }

      // 5. التحديث الناعم
      if (typeof fetchB2BRequests === 'function') fetchB2BRequests();
      
      try {
         const useProductStore = await import('../store/useProductStore');
         if (useProductStore && useProductStore.default) {
             useProductStore.default.getState().fetchProducts();
         }
      } catch(e) { console.log("Silent refresh skipped"); }

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
      
      const invNumber = `ACH-${Date.now().toString().slice(-6)}`;

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
          category: 'achats'
        }]);
        
        if (eError) {
          console.error("خطأ في المصروف:", eError.message);
        }
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
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h2>
          <p className="text-gray-500 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.selectSupplier}</label>
                <select 
                  value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                >
                  <option value="">-- {t.selectSupplier} --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.searchProd}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" placeholder={t.searchProd} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addToCart(p)} 
                  className="p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-start group relative overflow-hidden"
                >
                  <p className="font-bold text-gray-800 group-hover:text-blue-700">{p.name}</p>
                  
                  <div className="flex flex-col mt-2 gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400 uppercase font-bold">{t.costLabel}</span>
                      <span className="text-blue-600 font-black">{p.cost_price || 0} DH</span>
                    </div>
                    
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400 uppercase font-bold">{t.saleLabel}</span>
                      <span className="text-emerald-600 font-black">{p.price} DH</span>
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-gray-400 mt-2 bg-gray-100 w-fit px-1.5 py-0.5 rounded">
                    {t.stockLabel} {p.stock_quantity} {t.unit}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#1e293b] text-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-fit sticky top-6">
            <div className="p-6 bg-white/5 border-b border-white/10 flex items-center gap-3">
              <ShoppingBag className="text-blue-400" />
              <h3 className="font-black text-xl">{t.cart}</h3>
            </div>

            <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-white/20 italic">{t.empty}</div>
              ) : (
                cart.map(item => (
        <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-3">
        <div className="flex justify-between items-start mb-2">
        <div>
        <p className="font-bold text-sm text-white">{item.name}</p>
        <p className="text-[10px] text-emerald-400 font-bold mt-1">
          {t.expectedProfit} {((item.price - item.purchase_price) * item.quantity).toLocaleString()} DH
          <span className="text-gray-500 ml-2">({item.price - item.purchase_price} DH/قطعة)</span>
        </p>
        </div>
      <button onClick={() => removeFromCart(item.id)} className="text-white/30 hover:text-red-400">
        <X size={16}/>
          </button>
        </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-black">{t.qty}</label>
                        <input 
                          type="number" value={item.quantity} onChange={(e) => updateCartItem(item.id, 'quantity', e.target.value)}
                          className="w-full bg-black/20 border-none rounded-lg text-sm font-bold p-2 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-black">{t.price}</label>
                        <input 
                          type="number" value={item.purchase_price} onChange={(e) => updateCartItem(item.id, 'purchase_price', e.target.value)}
                          className="w-full bg-black/20 border-none rounded-lg text-sm font-bold p-2 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-black/30 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-white/50 font-bold">{t.total}</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-blue-400">{total.toLocaleString()}</span>
                  <span className="ml-1 text-xs font-bold text-white/30 uppercase">MAD</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button 
                  disabled={isProcessing || cart.length === 0} onClick={() => handleCompletePurchase('cash')}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black flex justify-center items-center gap-2 transition-all shadow-lg"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20}/> {t.payCash}</>}
                </button>
                
                <button 
                   disabled={isProcessing || cart.length === 0} onClick={() => handleCompletePurchase('credit')}
                   className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-black flex justify-center items-center gap-2 transition-all shadow-lg"
                >
                  <CreditCard size={20}/> {t.payCredit}
                </button>

                <button 
                   disabled={isProcessing || cart.length === 0} 
                   onClick={handleSendPO}
                   className="w-full md:col-span-2 py-4 bg-gradient-to-r from-slate-800 to-black hover:from-black hover:to-slate-900 rounded-2xl font-black flex justify-center items-center gap-2 transition-all shadow-lg text-white mt-2"
                >
                  <Truck size={20}/> {t.sendPO}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <Truck className="text-blue-600" />
          {t.b2bTitle}
        </h3>
        
        {b2bRequests.length === 0 ? (
          <div className="text-center text-gray-400 py-10 font-medium">
            {t.noB2b}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {b2bRequests.map(req => (
              <div key={req.id} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400">PO #{req.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-lg font-black text-gray-800">{Number(req.total_amount).toLocaleString()} {t.currency || 'DH'}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {req.status === 'pending' && <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black">{t.statusPending}</span>}
                    {req.status === 'confirmed' && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black animate-pulse">{t.statusSignReq}</span>}
                    {req.status === 'signed' && <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-black">{t.statusSigned}</span>}
                    {req.status === 'shipped' && <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black animate-pulse">{t.statusShipped}</span>}
                    {req.status === 'delivered' && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-black">{t.statusDelivered}</span>}

                    {req.status === 'pending' && (
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleEditB2B(req)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-all"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteB2B(req.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-all"><Trash2 size={16}/></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 mb-2">
                    {req.items?.length} {t.reqItems}
                  </p>
                  <div className="bg-gray-100/50 rounded-lg p-3 space-y-1.5 border border-gray-100">
                    {req.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-700">{item.name}</span>
                        <span className="text-gray-500 font-medium px-2 py-0.5 bg-white rounded-md border shadow-sm">
                          {item.quantity} {t.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {(req.status === 'shipped' || req.status === 'delivered') && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{t.deliveryDetails}</span>
                      <span className="text-xs font-black text-gray-500 bg-white px-2 py-1 rounded shadow-sm">{req.vehicle_plate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800">🚚 {req.driver_name}</span>
                      {req.driver_phone && (
                        <a href={`tel:${req.driver_phone}`} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-100/50 px-3 py-1.5 rounded-lg transition-all">
                          <PhoneCall size={14}/> {req.driver_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {req.status === 'shipped' && (
                  <div className="mb-4">
                    <style>{`
                      @keyframes drive { 0% { transform: translateX(-10%); } 100% { transform: translateX(110%); } }
                      @keyframes bounce-truck { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
                    `}</style>
                    <div className="relative w-full h-8 overflow-hidden bg-gray-100 rounded-full border-b-2 border-gray-300 shadow-inner">
                      <div className="absolute top-0.5 animate-[drive_3s_linear_infinite]" style={{ width: '100%' }}>
                        <div className="animate-[bounce-truck_0.5s_ease-in-out_infinite] flex items-center w-fit">
                          <span className="text-lg opacity-70">💨</span>
                          <Truck className="text-blue-600 drop-shadow-md" size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {req.status === 'confirmed' && (
                  <button 
                    onClick={() => openSignModal(req.id)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
                  >
                    <CheckCircle size={18} /> {t.signContractBtn}
                  </button>
                )}
                
                {req.status !== 'pending' && req.status !== 'confirmed' && req.digital_signature && req.digital_signature.startsWith('data:image') && (
                <div className="w-full p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center">
                <p className="text-xs font-bold text-emerald-600 mb-1">{t.digitallySigned}</p>
                <img src={req.digital_signature} alt="Signature" className="h-12 object-contain" />
                </div>
                )}

                {(req.status === 'shipped' || req.status === 'delivered') && (
                  <button 
                    onClick={() => handleReceiveOrder(req)} 
                    disabled={isProcessing} 
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 animate-pulse"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <><Package size={18} /> {t.confirmReceiptBtn}</>}
                  </button>
                )}

                {req.status === 'completed' && (
                  <div className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black flex justify-center items-center gap-2 border border-emerald-200 text-sm">
                     🎉 {t.completedMsg}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isSignModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-fade-in text-center">
            <h3 className="text-xl font-black text-gray-800 mb-2">
              {t.legalSign}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t.signDesc}
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 mb-4 overflow-hidden" dir="ltr">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ width: 350, height: 150, className: 'sigCanvas w-full cursor-crosshair' }}
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => sigCanvas.current.clear()} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                {t.clear}
              </button>
              <button 
                onClick={closeSignModal} 
                className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition-all"
              >
                {t.cancel}
              </button>
            </div>
            
            <button 
              onClick={handleSaveSignature}
              disabled={isProcessing}
              className="w-full mt-3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2"
            >
               {isProcessing ? <Loader2 className="animate-spin" size={20}/> : t.confirmSign}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}