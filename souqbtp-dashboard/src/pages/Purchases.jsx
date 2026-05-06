import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, CheckCircle, Truck, ShoppingBag, Loader2, CreditCard, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useProductStore from '../store/useProductStore';
import useExternalSupplierStore from '../store/useExternalSupplierStore';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore'; // 🌟 جلبنا العقل المركزي

const translations = {
  ar: {
    title: 'مشتريات المخزون', subtitle: 'إدخال السلع الجديدة وتحديث ديون الموردين.',
    selectSupplier: 'اختر المورد', searchProd: 'ابحث عن منتج لشرائه...',
    cart: 'قائمة المشتريات', empty: 'القائمة فارغة', total: 'إجمالي الشراء',
    payCash: 'دفع نقداً', payCredit: 'شراء بالآجل (كريدي)',
    unit: 'الوحدة', qty: 'الكمية', price: 'ثمن الشراء',
    success: '✅ تم تحديث المخزون بنجاح!', error: 'حدث خطأ أثناء العملية'
  },
  fr: {
    title: 'Achats & Stock In', subtitle: 'Entrée de marchandises et dettes fournisseurs.',
    selectSupplier: 'Choisir le Fournisseur', searchProd: 'Rechercher un produit...',
    cart: 'Liste d\'Achat', empty: 'Liste vide', total: 'Total Achat',
    payCash: 'Payer Cash', payCredit: 'Achat à Crédit',
    unit: 'Unité', qty: 'Qté', price: 'Prix d\'achat',
    success: '✅ Stock mis à jour avec succès !', error: 'Erreur lors de l\'opération'
  }
};

export default function Purchases() {
  const { products, fetchProducts, updateProduct } = useProductStore();
  const { suppliers, fetchSuppliers, updateSupplier } = useExternalSupplierStore();
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore(); // 🌟 استخراج بيانات المستخدم الحالي
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
      return [...prev, { ...product, quantity: 1, purchase_price: product.price }]; 
    });
  };

  const updateCartItem = (id, field, value) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const total = cart.reduce((sum, item) => sum + (Number(item.purchase_price) * Number(item.quantity)), 0);

  const handleCompletePurchase = async (method) => {
    // 1. فحص الشروط
    if (!selectedSupplierId) return alert("المرجو اختيار المورد أولاً!");
    if (cart.length === 0) return alert("قائمة المشتريات فارغة!");
    if (!supplier) return alert("لم يتم التعرف على بيانات حسابك!");
    
    setIsProcessing(true);

    try {
      const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      const extSupplier = suppliers.find(s => s.id === selectedSupplierId);

      // 2. تحديث المخزون (تأكد أن updateProduct تعمل)
      for (const item of cart) {
        const newQty = Number(item.stock_quantity) + Number(item.quantity);
        await updateProduct(item.id, { stock_quantity: newQty });
      }

      // 3. زيادة ديون المورد (إذا كان كريدي)
      if (method === 'credit') {
        const newDebt = Number(extSupplier?.total_debt || 0) + total;
        await updateSupplier(selectedSupplierId, { total_debt: newDebt });
      }

      // 4. تسجيل الفاتورة في جدول purchases
      const { error: pError } = await supabase.from('purchases').insert([{
        supplier_id: targetId,
        external_supplier_id: selectedSupplierId,
        total_amount: total,
        items: cart,
        payment_method: method
      }]);

      if (pError) throw new Error("فشل تسجيل الفاتورة: " + pError.message);

      // 5. تسجيل المصروف في جدول expenses (إذا كان كاش)
      if (method === 'cash') {
        const { error: eError } = await supabase.from('expenses').insert([{
          supplier_id: targetId,
          title: `شراء سلع: ${extSupplier?.name || 'مورد'}`,
          amount: total,
          category: 'Achat de Marchandises',
          date_expense: new Date().toISOString()
        }]);
        if (eError) console.error("فشل تسجيل المصروف:", eError.message);
      }

      // 6. النجاح النهائي
      setCart([]);
      setSelectedSupplierId('');
      alert(t.success);
      
    } catch (err) {
      console.error("خطأ تقني:", err);
      alert("عذراً، حدث خطأ: " + err.message);
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
        
        {/* اليسار: اختيار السلع */}
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
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* قائمة المنتجات المتاحة */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <button key={p.id} onClick={() => addToCart(p)} className="p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-start group">
                  <p className="font-bold text-gray-800 group-hover:text-blue-700">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Stock: {p.stock_quantity} {p.unit}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* اليمين: السلة والملخص */}
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
                  <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm">{item.name}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-white/30 hover:text-red-400"><X size={16}/></button>
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