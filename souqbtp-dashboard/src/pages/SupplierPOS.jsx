import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, User, 
  CreditCard, Banknote, CheckCircle2, Loader2, PackageSearch, Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';

const translations = {
  ar: {
    title: 'المبيعات المباشرة (POS B2B)',
    subtitle: 'إصدار فواتير سريعة وبيع مباشر للتجار والمقاولين.',
    searchProd: 'ابحث عن منتج نهائي في المخزون...',
    searchClient: 'اختر العميل (التاجر)...',
    newClient: '+ عميل جديد',
    cart: 'سلة الفاتورة',
    emptyCart: 'السلة فارغة، ابدأ بإضافة المنتجات.',
    qty: 'الكمية',
    price: 'السعر',
    total: 'الإجمالي',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقداً (Cash)',
    credit: 'آجل (Crédit)',
    bank: 'تحويل بنكي',
    confirmSale: 'تأكيد البيع وإصدار الفاتورة',
    processing: 'جاري الإصدار...',
    success: '✅ تم إصدار الفاتورة، خصم المخزون، وتسجيل التكلفة بنجاح!',
    error: 'حدث خطأ أثناء إتمام العملية.',
    stockError: 'الكمية المطلوبة غير متوفرة في المخزون!',
    currency: 'درهم',
    finishedGoodsBadge: '🏆 منتج نهائي'
  },
  fr: {
    title: 'Ventes Directes (POS B2B)',
    subtitle: 'Édition rapide de factures et ventes directes aux détaillants.',
    searchProd: 'Chercher un produit fini dans le stock...',
    searchClient: 'Sélectionner le client...',
    newClient: '+ Nouveau Client',
    cart: 'Panier de Facturation',
    emptyCart: 'Le panier est vide, ajoutez des produits.',
    qty: 'Qté',
    price: 'Prix',
    total: 'Total',
    paymentMethod: 'Méthode de Paiement',
    cash: 'Espèces (Cash)',
    credit: 'À Crédit',
    bank: 'Virement Bancaire',
    confirmSale: 'Confirmer la Vente & Facturer',
    processing: 'Traitement en cours...',
    success: '✅ Facture éditée, stock déduit et coût enregistré avec succès !',
    error: 'Une erreur est survenue lors de la transaction.',
    stockError: 'Quantité insuffisante dans le stock !',
    currency: 'MAD',
    finishedGoodsBadge: '🏆 Produit Fini'
  },
  en: {
    title: 'Direct Sales (POS B2B)',
    subtitle: 'Quick invoicing and direct sales to retailers and contractors.',
    searchProd: 'Search finished product in stock...',
    searchClient: 'Select client...',
    newClient: '+ New Client',
    cart: 'Invoice Cart',
    emptyCart: 'Cart is empty, add products to begin.',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    credit: 'Credit',
    bank: 'Bank Transfer',
    confirmSale: 'Confirm Sale & Issue Invoice',
    processing: 'Processing...',
    success: '✅ Invoice issued, stock deducted, and cost recorded successfully!',
    error: 'An error occurred during the transaction.',
    stockError: 'Insufficient quantity in stock!',
    currency: 'MAD',
    finishedGoodsBadge: '🏆 Finished Good'
  }
};

export default function SupplierPOS() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];

  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supplier?.id) {
      fetchData();
    }
  }, [supplier]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;
      
      // جلب المخزون بالكامل
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', targetId)
        .gt('stock_quantity', 0);
        
      // 🎯 السحر هنا: فلترة المنتجات لكي نأخذ فقط "المنتجات النهائية"
      // نستخدم (p.item_type || 'finished_good') لضمان أن المنتجات القديمة جداً تعتبر نهائية أيضاً لتفادي اختفائها
      const finishedGoodsOnly = (prods || []).filter(p => (p.item_type || 'finished_good') === 'finished_good');

      // جلب العملاء من CRM
      const { data: clts } = await supabase
        .from('clients')
        .select('*')
        .eq('supplier_id', targetId);

      setProducts(finishedGoodsOnly);
      setClients(clts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert(t.stockError);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.stock_quantity) {
          alert(t.stockError);
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !selectedClient) return;
    setIsSubmitting(true);
    
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // 🌟 1. حساب تكلفة البضاعة المباعة (COGS) لإضافتها في المصاريف
      const totalCost = cart.reduce((sum, item) => {
        const cost = item.cost_price ? item.cost_price : (item.price * 0.75); 
        return sum + (cost * item.quantity);
      }, 0);

      const refNumber = `INV-B2B-${Math.floor(Math.random() * 1000000)}`;

      // 🌟 2. إنشاء الفاتورة في المستندات
      const { error: docError } = await supabase.from('documents').insert({
        owner_id: targetId,
        type: 'Facture',
        ref_number: refNumber,
        client_id: selectedClient,
        total_amount: totalAmount,
        status: paymentMethod === 'credit' ? 'Impayée' : 'Payée',
        items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price }))
      });
      if (docError) throw docError;

      // 🌟 3. تسجيل تكلفة البضاعة في قسم "المصاريف"
      const { error: expError } = await supabase.from('expenses').insert({
        supplier_id: targetId,
        title: `تكلفة بضاعة مباعة (COGS) - ${refNumber}`,
        amount: totalCost,
        category: 'achats', 
        date: new Date().toISOString()
      });
      if (expError) throw expError;

      // 🌟 4. خصم الكميات من المخزون المركزي
      for (const item of cart) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.id,
          p_quantity: item.quantity
        });
      }

      // 🌟 5. تحديث ديون العميل إذا كان الدفع آجلاً
      if (paymentMethod === 'credit') {
        const client = clients.find(c => c.id === selectedClient);
        if (client) {
          await supabase.from('clients').update({
            total_debt: Number(client.total_debt || 0) + totalAmount
          }).eq('id', selectedClient);
        }
      }

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      alert(t.success);
      
      setCart([]);
      setSelectedClient('');
      fetchData(); 

    } catch (error) {
      console.error(error);
      alert(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 📦 القسم الأيمن/الأيسر: كتالوج المنتجات النهائية فقط */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[calc(100vh-120px)]">
        <div className="mb-6">
          <h2 className="text-2xl font-black flex items-center gap-3 text-white mb-2">
            <PackageSearch className="text-blue-500" size={28} />
            {t.title}
          </h2>
          <p className="text-slate-400 text-sm font-medium">{t.subtitle}</p>
        </div>

        <div className="relative mb-6">
          <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={20} />
          <input 
            type="text" 
            placeholder={t.searchProd}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-950 border border-slate-800 py-3.5 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl text-white outline-none focus:border-blue-500 transition-all font-medium`}
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-full"><Loader2 size={40} className="animate-spin text-blue-500" /></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} onClick={() => addToCart(product)} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 p-4 rounded-2xl cursor-pointer transition-all group relative shadow-lg text-start overflow-hidden">
                  
                  {/* 🎯 شارة المنتج النهائي للمسة احترافية */}
                  <div className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'} bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-md z-10 shadow-sm border border-amber-400/50`}>
                    {t.finishedGoodsBadge}
                  </div>

                  <div className="w-full h-24 bg-slate-900 rounded-xl mb-3 overflow-hidden border border-slate-700 flex items-center justify-center">
                    {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <PackageSearch size={32} className="text-slate-600" />}
                  </div>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{product.name}</h4>
                  <div className="flex justify-between items-end mt-2">
                    <p className="font-black text-blue-400" dir="ltr">{product.price} <span className="text-[10px] text-slate-500">{t.currency}</span></p>
                    <span className="text-[10px] bg-slate-900 px-2 py-1 rounded-md text-slate-400 font-bold border border-slate-700">{product.stock_quantity} {product.unit || 'U'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🛒 القسم الجانبي: سلة الفاتورة والدفع */}
      <div className="w-full md:w-[400px] bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[calc(100vh-120px)]">
        
        {/* اختيار العميل */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.searchClient}</label>
          <div className="flex gap-2">
            <select 
              value={selectedClient} 
              onChange={(e) => setSelectedClient(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold appearance-none cursor-pointer"
            >
              <option value="">{t.searchClient}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
        </div>

        {/* عناصر السلة */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-6 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50 text-center">
              <ShoppingCart size={48} className="mb-4 text-slate-600" />
              <p className="text-sm font-medium">{t.emptyCart}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex justify-between items-center shadow-md">
                <div className="flex-1">
                  <h5 className="font-bold text-white text-sm line-clamp-1">{item.name}</h5>
                  <p className="text-blue-400 font-black text-xs mt-1" dir="ltr">{item.price * item.quantity} {t.currency}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 rounded-xl border border-slate-700 p-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Minus size={16}/></button>
                  <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Plus size={16}/></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="ml-3 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* الدفع والتأكيد */}
        <div className="pt-6 border-t border-slate-800 mt-auto">
          <div className="flex justify-between items-center mb-6 bg-blue-600/10 p-4 rounded-2xl border border-blue-600/20">
            <span className="text-slate-300 font-black uppercase tracking-wider">{t.total}</span>
            <span className="text-3xl font-black text-white" dir="ltr">{cartTotal.toLocaleString()} <span className="text-sm text-blue-400">{t.currency}</span></span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <button onClick={() => setPaymentMethod('cash')} className={`py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all border ${paymentMethod === 'cash' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
              <Banknote size={18} /> {t.cash}
            </button>
            <button onClick={() => setPaymentMethod('credit')} className={`py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all border ${paymentMethod === 'credit' ? 'bg-orange-600/20 text-orange-400 border-orange-500/50' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
              <User size={18} /> {t.credit}
            </button>
            <button onClick={() => setPaymentMethod('bank')} className={`py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all border ${paymentMethod === 'bank' ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
              <CreditCard size={18} /> {t.bank}
            </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || !selectedClient || isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 text-lg"
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <><CheckCircle2 size={24} /> {t.confirmSale}</>}
          </button>
        </div>

      </div>
    </div>
  );
}