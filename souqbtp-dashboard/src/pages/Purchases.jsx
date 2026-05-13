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
    payCash: 'دفع نقداً', payCredit: 'شراء بالآجل (كريدي)',
    unit: 'الوحدة', qty: 'الكمية', price: 'ثمن الشراء',
    msgSelectSupplier: 'المرجو اختيار المورد أولاً!',
    msgEmptyCart: 'قائمة المشتريات فارغة!',
    msgAccountError: 'لم يتم التعرف على بيانات حسابك!',
    msgError: 'عذراً، حدث خطأ أثناء العملية:',
    profitMargin: 'هامش الربح:', expectedProfit: 'الربح المتوقع:',
    msgSuccess: '✅ تم تحديث المخزون، تسجيل الفاتورة والمصروف بنجاح!',
    invoiceDesc: 'فاتورة شراء رقم:',
    categoryName: 'Achat de marchandises' 
  },
  fr: {
    title: 'Achats & Stock In', subtitle: 'Entrée de marchandises et dettes fournisseurs.',
    selectSupplier: 'Choisir le Fournisseur', searchProd: 'Rechercher un produit...',
    cart: 'Liste d\'Achat', costLabel: 'Coût:', stockLabel: 'Stock:', saleLabel: 'Vente:',
    empty: 'Liste vide', total: 'Total Achat',
    payCash: 'Payer Cash', payCredit: 'Achat à Crédit',
    unit: 'Unité', qty: 'Qté', price: 'Prix d\'achat',
    msgSelectSupplier: 'Veuillez choisir un fournisseur !',
    msgEmptyCart: 'La liste d\'achat est vide !',
    msgAccountError: 'Erreur d\'identification du compte !',
    msgError: 'Désolé, une erreur est survenue :',
    profitMargin: 'Marge:', expectedProfit: 'Profit Prévu:',
    msgSuccess: '✅ Stock, Facture et Charge enregistrés avec succès !',
    // 🌟 الإضافات الجديدة للترجمة
    invoiceDesc: 'Facture d\'achat N° :',
    categoryName: 'Achat de marchandises'
  }
};

export default function Purchases() {
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

  // 🌟 دالة حفظ التوقيع كصورة (محدثة لتجاوز خطأ التجميع)
  const handleSaveSignature = async () => {
    try {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        return alert(language === 'fr' ? 'Veuillez dessiner votre signature.' : 'المرجو رسم توقيعك أولاً.');
      }

      setIsProcessing(true);

      // 🌟 التعديل هنا: استخدمنا getCanvas() بدلاً من getTrimmedCanvas() لتجنب خطأ q.default
      const signatureImageBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');

      const { error } = await supabase
        .from('supply_requests')
        .update({ 
          status: 'signed', 
          digital_signature: signatureImageBase64 
        })
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
  
  // 🌟 دالة جلب طلبات التاجر
  const fetchB2BRequests = async () => {
    const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
    const { data } = await supabase
      .from('supply_requests')
      .select('*')
      .eq('merchant_id', targetId)
      .order('created_at', { ascending: false });
    
    if (data) setB2bRequests(data);
  };

  // 🌟 جلب الطلبات وتشغيل التحديث اللحظي
  useEffect(() => {
    fetchB2BRequests();
    
    // رادار يستمع لتغييرات المورد (مثلاً عندما يوافق المورد، تتغير الحالة فوراً عند التاجر)
    const channel = supabase.channel('b2b-tracking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supply_requests' }, () => {
        fetchB2BRequests();
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [supplier]);

  // 🌟 دالة المصافحة الرقمية (التوقيع)
  const handleSignContract = async (id) => {
    const signatureName = window.prompt(
      language === 'fr' 
      ? "Pour signer ce bon de commande, tapez votre nom complet :" 
      : "لتوقيع هذا العقد والموافقة عليه، اكتب اسمك الكامل هنا:"
    );
    
    if (!signatureName) return; // إذا ألغى العملية

    try {
      const { error } = await supabase
        .from('supply_requests')
        .update({ 
          status: 'signed', 
          digital_signature: signatureName 
        })
        .eq('id', id);

      if (error) throw error;
      alert(language === 'fr' ? "✅ Contrat signé avec succès !" : "✅ تم توقيع العقد بنجاح!");
      fetchB2BRequests();
    } catch (err) {
      console.error(err);
      alert("Erreur: " + err.message);
    }
  };

  const handleDeleteB2B = async (id) => {
    const confirmMsg = language === 'fr' ? 'Annuler cette commande ?' : 'هل أنت متأكد من إلغاء هذا الطلب؟';
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase.from('supply_requests').delete().eq('id', id);
      
      if (error) {
        console.error("فشل الحذف:", error.message);
        alert("خطأ في الحذف: " + error.message);
        return;
      }

      // تحديث القائمة فوراً بعد النجاح
      fetchB2BRequests();
      alert(language === 'fr' ? "✅ Commande annulée." : "✅ تم إلغاء الطلب بنجاح.");
      
    } catch (err) { 
      console.error(err);
      alert("حدث خطأ غير متوقع.");
    }
  };

  // 🌟 دالة تعديل الطلب للتاجر (استرجاع للسلة)
  const handleEditB2B = async (req) => {
    const confirmMsg = language === 'fr' ? 'Modifier cette commande ?' : 'هل تريد استرجاع الطلب للسلة لتعديله؟';
    if (!window.confirm(confirmMsg)) return;
    
    setCart(req.items); // إرجاع السلع للسلة
    await supabase.from('supply_requests').delete().eq('id', req.id); // مسح الطلب القديم
    fetchB2BRequests();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // الصعود لأعلى الصفحة
  };

  const handleReceiveOrder = async (req) => {
    setIsProcessing(true);
    try {
      // 1. تحديث الحالة
      await supabase.from('supply_requests').update({ status: 'completed' }).eq('id', req.id);

      // 2. تحديث مخزون التاجر (الزيادة)
      for (const item of req.items) {
        const { data: p } = await supabase.from('products').select('stock_quantity').eq('id', item.id).single();
        await supabase.from('products').update({ 
          stock_quantity: Number(p?.stock_quantity || 0) + Number(item.quantity) 
        }).eq('id', item.id);
      }

      // 3. 🌟 تفعيل المحاسبة: إرسال فاتورة بيع للمورد الكبير
      if (req.supplier_id) {
        await supabase.from('documents').insert([{
          owner_id: req.supplier_id, // تذهب للمورد
          client_id: req.merchant_id, // التاجر هو الزبون
          type: 'Facture',
          ref_number: `FAC-B2B-${Date.now().toString().slice(-5)}`,
          total_amount: req.total_amount,
          items: req.items
        }]);
      }

      alert("✅ تم الاستلام وتحديث ميزانية المورد!");
      fetchB2BRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

const handleSendPO = async () => {
    if (cart.length === 0) return alert(language === 'fr' ? "Panier vide" : "السلة فارغة");

    setIsProcessing(true);
    try {
      // 1. تحديد المورد الكبير (الرابط الأساسي)
      const { data: boss } = await supabase
        .from('suppliers')
        .select('id')
        .eq('role', 'wholesaler')
        .single();

      if (!boss) throw new Error(language === 'fr' ? "Grossiste introuvable" : "لم يتم العثور على المورد الكبير");

      // 2. فحص المخزون الفعلي للمورد الكبير بالاسم
      const itemNames = cart.map(item => item.name);
      const { data: stock } = await supabase
        .from('products')
        .select('name, stock_quantity')
        .eq('supplier_id', boss.id)
        .in('name', itemNames);

      // 🚨 التحقق الصارم: إذا لم يجد المنتجات عند المورد أو الكمية ناقصة
      let errors = [];
      cart.forEach(cartItem => {
        const productInStock = stock?.find(p => p.name.trim().toLowerCase() === cartItem.name.trim().toLowerCase());
        if (!productInStock) {
          errors.push(`❌ ${cartItem.name}: غير متوفر عند المورد`);
        } else if (productInStock.stock_quantity < cartItem.quantity) {
          errors.push(`⚠️ ${cartItem.name}: المخزن لا يكفي (المتوفر: ${productInStock.stock_quantity})`);
        }
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
        setIsProcessing(false);
        return;
      }

      // 3. إرسال الطلب مع ربطه بالـ Boss
      const merchantId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      const { error: poError } = await supabase.from('supply_requests').insert([{
        merchant_id: merchantId,
        supplier_id: boss.id, // الربط الإجباري هنا
        items: cart,
        total_amount: total,
        status: 'pending'
      }]);

      if (poError) throw poError;
      setCart([]);
      alert(language === 'fr' ? "Commande envoyée !" : "تم إرسال الطلب!");
      fetchB2BRequests();
    } catch (err) {
      alert(err.message);
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
      
      // توليد رقم فاتورة شراء فريد
      const invNumber = `ACH-${Date.now().toString().slice(-6)}`;

      // أ- تحديث المخزون وثمن التكلفة
      for (const item of cart) {
        await updateProduct(item.id, { 
          stock_quantity: Number(item.stock_quantity) + Number(item.quantity),
          cost_price: Number(item.purchase_price) 
        });
      }

      // ب- تسجيل فاتورة الشراء
      const { error: invError } = await supabase.from('purchase_invoices').insert([{
        supplier_id: targetId,
        external_supplier_id: selectedSupplierId,
        invoice_number: invNumber,
        total_amount: total,
        items: cart,
        payment_method: method
      }]);
      if (invError) throw invError;

      // ج- تسجيل المصروف تلقائياً (فقط في الكاش)
      if (method === 'cash') {
        const { error: eError } = await supabase.from('expenses').insert([{
          supplier_id: targetId,
          title: `${t.invoiceDesc} ${invNumber}`, 
          amount: total,
          category: 'achats'
          // 🌟 قمنا بحذف سطر التاريخ تماماً، قاعدة البيانات ستسجله بنفسها تلقائياً!
        }]);
        
        if (eError) {
          console.error("خطأ في المصروف:", eError.message);
        }
      }

      // د- إذا كان كريدي، تحديث ديون المورد
      if (method === 'credit') {
        const newDebt = Number(extSupplier?.total_debt || 0) + total;
        await updateSupplier(selectedSupplierId, { total_debt: newDebt });
      }

      setCart([]);
      setSelectedSupplierId('');
      
      // 🌟 (3) التنبيه النهائي مربوط بقاموس الترجمة
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
        {/* 💰 حساب هامش الربح التلقائي */}
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
                {/* زر الكاش القديم */}
                <button 
                  disabled={isProcessing || cart.length === 0} onClick={() => handleCompletePurchase('cash')}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black flex justify-center items-center gap-2 transition-all shadow-lg"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20}/> {t.payCash}</>}
                </button>
                
                {/* زر الكريدي القديم */}
                <button 
                   disabled={isProcessing || cart.length === 0} onClick={() => handleCompletePurchase('credit')}
                   className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-black flex justify-center items-center gap-2 transition-all shadow-lg"
                >
                  <CreditCard size={20}/> {t.payCredit}
                </button>

                {/* 🌟 الزر الجديد: طلب تزويد من المورد الكبير (PO) */}
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
      {/* 🌟 رادار تتبع الطلبات (B2B Tracking) */}
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
                    {/* شارة الحالة اللحظية */}
                    {req.status === 'pending' && <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black">{language === 'fr' ? 'En attente' : 'بانتظار المورد'}</span>}
                    {req.status === 'confirmed' && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black animate-pulse">{language === 'fr' ? 'Signature Requise' : 'يتطلب توقيعك'}</span>}
                    {req.status === 'signed' && <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-black">{language === 'fr' ? 'Signé & Confirmé' : 'تم التوقيع بنجاح'}</span>}
                    {req.status === 'shipped' && <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black animate-pulse">{language === 'fr' ? 'En Route 🚚' : 'الشاحنة في الطريق 🚚'}</span>}
                    {req.status === 'delivered' && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-black">{language === 'fr' ? 'Livré ✅' : 'تم التسليم ✅'}</span>}

                    {/* 🌟 أزرار التعديل والحذف (تظهر فقط إذا كان الطلب قيد الانتظار) */}
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
                    {req.items?.length} {language === 'fr' ? 'Articles demandés :' : 'منتجات مطلوبة :'}
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

                {/* 🌟 بيانات السائق والشاحنة تظهر للتاجر هنا */}
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

                {/* 🌟 أنيميشن الشاحنة المتحركة مع بخار البنزين */}
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

                {/* الأزرار النهائية (المصافحة، الاستلام، والتأكيد) */}
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

                {/* زر الاستلام يظهر للتاجر سواء كانت الشاحنة في الطريق أو أخبره المورد أنها وصلت */}
                {(req.status === 'shipped' || req.status === 'delivered') && (
                  <button 
                    onClick={() => handleReceiveOrder(req)} 
                    disabled={isProcessing} 
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 animate-pulse"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <><Package size={18} /> {language === 'fr' ? 'Confirmer la Réception' : 'تأكيد استلام البضاعة (إدخال للمخزن)'}</>}
                  </button>
                )}

                {/* رسالة النجاح النهائية تظهر عندما تصبح الحالة completed */}
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

      {/* 🌟🌟🌟 هنا يوضع كود النافذة المنبثقة (خارج البطاقات وقبل نهاية الصفحة) 🌟🌟🌟 */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-fade-in text-center">
            <h3 className="text-xl font-black text-gray-800 mb-2">
              {language === 'fr' ? 'Signature Légale' : 'التوقيع القانوني'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {language === 'fr' ? 'Veuillez dessiner votre signature dans le cadre ci-dessous.' : 'المرجو رسم توقيعك بوضوح داخل الإطار بالأسفل.'}
            </p>
            
            {/* مساحة الرسم */}
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