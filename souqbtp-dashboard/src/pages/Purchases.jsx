import { useState, useEffect } from 'react';
import { Search, CheckCircle, ShoppingBag, Loader2, CreditCard, X, TrendingUp, BrainCircuit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useProductStore from '../store/useProductStore';
import useExternalSupplierStore from '../store/useExternalSupplierStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';

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

      // ب- 🌟 تفعيل فاتورة الشراء (تسجيل في الجدول الجديد)
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
          category: 'achats', // 🌟 السر هنا: استخدام الكلمة المختصرة فقط
          date_expense: new Date().toISOString()
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
      alert(`${t.msgSuccess} \n ${t.invoiceDesc} ${invNumber}`);
      
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

              <div className="grid grid-cols-1 gap-2">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}