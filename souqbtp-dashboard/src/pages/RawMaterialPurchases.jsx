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
    title: 'مشتريات المواد الأولية', subtitle: 'إدخال مواد التصنيع/التغليف وتحديث ديون الموردين.',
    selectSupplier: 'اختر المورد', searchProd: 'ابحث عن مادة أولية...',
    cart: 'قائمة المشتريات', costLabel: 'التكلفة:', stockLabel: 'المخزن:', saleLabel: 'البيع:',
    empty: 'القائمة فارغة', total: 'إجمالي الشراء',
    payCash: 'دفع نقداً', payCredit: 'شراء بالآجل (كريدي)',
    unit: 'الوحدة', qty: 'الكمية', price: 'ثمن الشراء',
    msgSelectSupplier: 'المرجو اختيار المورد أولاً!',
    msgEmptyCart: 'قائمة المشتريات فارغة!',
    msgAccountError: 'لم يتم التعرف على بيانات حسابك!',
    msgError: 'عذراً، حدث خطأ أثناء العملية:',
    profitMargin: 'هامش الربح:', expectedProfit: 'الربح المتوقع:',
    msgSuccess: '✅ تم تحديث مخزون المواد، تسجيل الفاتورة والمصروف بنجاح!',
    invoiceDesc: 'فاتورة مواد أولية رقم:',
    categoryName: 'achats' 
  },
  fr: {
    title: 'Achats Matières Premières', subtitle: 'Entrée des matières et dettes fournisseurs.',
    selectSupplier: 'Choisir le Fournisseur', searchProd: 'Rechercher une matière...',
    cart: 'Liste d\'Achat', costLabel: 'Coût:', stockLabel: 'Stock:', saleLabel: 'Vente:',
    empty: 'Liste vide', total: 'Total Achat',
    payCash: 'Payer Cash', payCredit: 'Achat à Crédit',
    unit: 'Unité', qty: 'Qté', price: 'Prix d\'achat',
    msgSelectSupplier: 'Veuillez choisir un fournisseur !',
    msgEmptyCart: 'La liste d\'achat est vide !',
    msgAccountError: 'Erreur d\'identification du compte !',
    msgError: 'Désolé, une erreur est survenue :',
    profitMargin: 'Marge:', expectedProfit: 'Profit Prévu:',
    msgSuccess: '✅ Stock de matières, Facture et Charge enregistrés avec succès !',
    invoiceDesc: 'Facture matière N° :',
    categoryName: 'achats'
  }
};

export default function RawMaterialPurchases() {
  const { products, fetchProducts, updateProduct } = useProductStore();
  const { suppliers, fetchSuppliers, updateSupplier } = useExternalSupplierStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language];

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🌟 حالات التوقيع اليدوي
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
        return alert(language === 'fr' ? 'Veuillez dessiner votre signature.' : 'المرجو رسم توقيعك أولاً.');
      }

      setIsProcessing(true);
      const signatureImageBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');

      const { error } = await supabase
        .from('supply_requests')
        .update({ status: 'signed', digital_signature: signatureImageBase64 })
        .eq('id', contractToSign);

      if (error) throw error;
      
      alert(language === 'fr' ? "✅ Contrat signé avec succès !" : "✅ تم توقيع العقد بنجاح!");
      fetchB2BRequests();
      closeSignModal();
    } catch (err) {
      console.error("Signature Error:", err);
      alert("Erreur / خطأ: " + (err.message || "فشل في حفظ التوقيع"));
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

  const handleDeleteB2B = async (id) => {
    const confirmMsg = language === 'fr' ? 'Annuler cette commande ?' : 'هل أنت متأكد من إلغاء هذا الطلب؟';
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase.from('supply_requests').delete().eq('id', id);
      if (error) throw error;
      fetchB2BRequests();
      alert(language === 'fr' ? "✅ Commande annulée." : "✅ تم إلغاء الطلب بنجاح.");
    } catch (err) { 
      console.error(err);
      alert("خطأ في الحذف: " + err.message);
    }
  };

  const handleEditB2B = async (req) => {
    const confirmMsg = language === 'fr' ? 'Modifier cette commande ?' : 'هل تريد استرجاع الطلب للسلة لتعديله؟';
    if (!window.confirm(confirmMsg)) return;
    
    setCart(req.items);
    await supabase.from('supply_requests').delete().eq('id', req.id);
    fetchB2BRequests();
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleSendPO = async () => {
    if (!selectedSupplierId) return alert(language === 'fr' ? "Veuillez sélectionner un fournisseur" : "الرجاء اختيار المورد من القائمة أولاً");
    if (cart.length === 0) return alert(language === 'fr' ? "Panier vide" : "السلة فارغة");

    setIsProcessing(true);
    try {
      const merchantId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      const { data: chosenSup } = await supabase.from('external_suppliers').select('name').eq('id', selectedSupplierId).single();
      const fallbackName = language === 'fr' ? "fournisseur" : "المورد";
      const supplierName = chosenSup?.name || fallbackName;

      const { error: poError } = await supabase.from('supply_requests').insert({
        merchant_id: merchantId,
        supplier_id: selectedSupplierId,
        items: cart,
        total_amount: total,
        status: 'pending'
      });

      if (poError) throw poError;

      setCart([]);
      alert(language === 'fr' ? `✅ Commande envoyée à ${supplierName}` : `✅ تم إرسال الطلب إلى ${supplierName}`);
      fetchB2BRequests();
    } catch (err) {
      alert("Erreur: " + err.message);
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
          alert(`⚠️ تم الاستلام لكن ببعض الأخطاء:\n${financialErrors.join('\n')}`);
      } else {
          alert(language === 'fr' ? "✅ Réception validée !" : "✅ تم الاستلام بنجاح!");
      }

      fetchB2BRequests();
      fetchProducts();
    } catch (err) {
      alert("Erreur Critique:\n" + err.message);
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
                  <Truck size={20}/> {language === 'fr' ? 'Envoyer Bon de Commande (B2B)' : 'إرسال طلب تزويد (Purchase Order)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <Truck className="text-blue-600" />
          {language === 'fr' ? 'Suivi des Commandes B2B' : 'سجل طلبات التزويد (B2B)'}
        </h3>
        
        {b2bRequests.length === 0 ? (
          <div className="text-center text-gray-400 py-10 font-medium">
            {language === 'fr' ? "Vous n'avez envoyé aucune commande B2B." : "لم تقم بإرسال أي طلبات تزويد بعد."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {b2bRequests.map(req => (
              <div key={req.id} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400">PO #{req.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-lg font-black text-gray-800">{Number(req.total_amount).toLocaleString()} DH</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {req.status === 'pending' && <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black">{language === 'fr' ? 'En attente' : 'بانتظار المورد'}</span>}
                    {req.status === 'confirmed' && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black animate-pulse">{language === 'fr' ? 'Signature Requise' : 'يتطلب توقيعك'}</span>}
                    {req.status === 'signed' && <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-black">{language === 'fr' ? 'Signé & Confirmé' : 'تم التوقيع بنجاح'}</span>}
                    {req.status === 'shipped' && <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black animate-pulse">{language === 'fr' ? 'En Route 🚚' : 'الشاحنة في الطريق 🚚'}</span>}
                    {req.status === 'delivered' && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-black">{language === 'fr' ? 'Livré ✅' : 'تم التسليم ✅'}</span>}

                    {req.status === 'pending' && (
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleEditB2B(req)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-all" title="تعديل"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteB2B(req.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-all" title="إلغاء الطلب"><Trash2 size={16}/></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 mb-2">
                    {req.items?.length} {language === 'fr' ? 'Articles demandés :' : 'مواد مطلوبة :'}
                  </p>
                  <div className="bg-gray-100/50 rounded-lg p-3 space-y-1.5 border border-gray-100">
                    {req.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-700">{item.name}</span>
                        <span className="text-gray-500 font-medium px-2 py-0.5 bg-white rounded-md border shadow-sm">
                          {item.quantity} {language === 'fr' ? 'Unités' : 'وحدة'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {(req.status === 'shipped' || req.status === 'delivered') && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{language === 'fr' ? 'Détails de Livraison' : 'تفاصيل التوصيل'}</span>
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
                    <CheckCircle size={18} /> {language === 'fr' ? 'Signer le Contrat' : 'توقيع العقد (مصافحة)'}
                  </button>
                )}
                
                {req.status !== 'pending' && req.status !== 'confirmed' && req.digital_signature && req.digital_signature.startsWith('data:image') && (
                <div className="w-full p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-emerald-600 mb-1">{language === 'fr' ? 'Signé numériquement :' : 'موقع رقمياً:'}</p>
                  <img src={req.digital_signature} alt="Signature" className="h-12 object-contain" />
                </div>
                )}

                {(req.status === 'shipped' || req.status === 'delivered') && (
                  <button 
                    onClick={() => handleReceiveOrder(req)} 
                    disabled={isProcessing} 
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 animate-pulse"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <><Package size={18} /> {language === 'fr' ? 'Confirmer la Réception' : 'تأكيد استلام المواد (إدخال للمخزن)'}</>}
                  </button>
                )}

                {req.status === 'completed' && (
                  <div className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black flex justify-center items-center gap-2 border border-emerald-200 text-sm">
                     🎉 {language === 'fr' ? `Livré, Facturé & Intégré au Stock !` : `تم التسليم، وجرد المخزون، وتوليد الفاتورة بنجاح!`}
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
              {language === 'fr' ? 'Signature Légale' : 'التوقيع القانوني'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {language === 'fr' ? 'Veuillez dessiner votre signature dans le cadre ci-dessous.' : 'المرجو رسم توقيعك بوضوح داخل الإطار بالأسفل.'}
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
                {language === 'fr' ? 'Effacer' : 'مسح'}
              </button>
              <button 
                onClick={closeSignModal} 
                className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition-all"
              >
                {language === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>
            </div>
            
            <button 
              onClick={handleSaveSignature}
              disabled={isProcessing}
              className="w-full mt-3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2"
            >
               {isProcessing ? <Loader2 className="animate-spin" size={20}/> : (language === 'fr' ? 'Confirmer & Signer' : 'تأكيد وحفظ التوقيع')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}