import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Trash2, Plus, Minus, CreditCard, Truck, Landmark, Bot, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const cartTranslations = {
  ar: {
    cartTitle: 'سلة المشتريات (B2B)', empty: 'السلة فارغة.', items: 'عناصر',
    summary: 'ملخص الطلب', subtotal: 'المجموع الفرعي:', discount: 'خصم (AI):',
    total: 'الإجمالي النهائي:', checkout: 'إتمام الطلب',
    aiNegotiate: '🤖 تفاوض مع الذكاء الاصطناعي',
    aiTyping: 'جاري تحليل كمية طلبك...',
    aiSuccess: 'رائع! نظراً لحجم طلبك، منحتك خصم 5%.',
    step2Title: 'بيانات التوصيل والدفع',
    fullName: 'الاسم الكامل / الشركة', phone: 'رقم الهاتف', address: 'عنوان التوصيل (ورشة / مستودع)',
    paymentMethod: 'طريقة الدفع',
    payCod: 'الدفع عند الاستلام (COD)', payBank: 'تحويل بنكي', paySplit: 'دفع مجزأ (30% الآن، 70% عند الاستلام)',
    confirmOrder: 'تأكيد وإرسال الطلب',
    successTitle: '🎉 تم استلام طلبك بنجاح!',
    successMsg: 'تم تحويل طلبك مباشرة إلى مستودع المورد. ستتوصل بإشعار تتبع الشاحنة قريباً.',
    close: 'إغلاق السلة'
  },
  fr: {
    cartTitle: 'Panier d\'Achat (B2B)', empty: 'Votre panier est vide.', items: 'articles',
    summary: 'Résumé de la commande', subtotal: 'Sous-total :', discount: 'Remise (IA) :',
    total: 'Total Final :', checkout: 'Passer la commande',
    aiNegotiate: '🤖 Négocier avec l\'IA',
    aiTyping: 'Analyse de votre commande...',
    aiSuccess: 'Super ! Vu le volume, je vous accorde 5% de remise.',
    step2Title: 'Livraison & Paiement',
    fullName: 'Nom Complet / Société', phone: 'Téléphone', address: 'Adresse de livraison (Chantier / Dépôt)',
    paymentMethod: 'Méthode de paiement',
    payCod: 'Paiement à la livraison (COD)', payBank: 'Virement Bancaire', paySplit: 'Paiement fractionné (30% avance, 70% livraison)',
    confirmOrder: 'Confirmer la commande',
    successTitle: '🎉 Commande reçue avec succès !',
    successMsg: 'Votre commande a été envoyée au dépôt. Vous recevrez le suivi de livraison bientôt.',
    close: 'Fermer le panier'
  }
};

export default function SmartCart({ isOpen, onClose, cart, setCart, vendorInfo, language, currency }) {
  const t = cartTranslations[language] || cartTranslations['fr'];
  const isArabic = language === 'ar';
  
  const [step, setStep] = useState(1); // 1: Cart, 2: Checkout, 3: Success
  const [discount, setDiscount] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', paymentMethod: 'cod' });

  // حساب المجموع مع مراعاة خصم الذكاء الاصطناعي
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subtotal - discount;

  // 🤖 محرك التفاوض بالذكاء الاصطناعي
  const handleAiNegotiation = () => {
    setIsAiThinking(true);
    setAiMessage(t.aiTyping);
    
    setTimeout(() => {
      setIsAiThinking(false);
      if (subtotal >= 500) { // خصم فقط للطلبات الكبيرة نسبياً
        setDiscount(subtotal * 0.05); // 5% خصم
        setAiMessage(t.aiSuccess);
      } else {
        setAiMessage(isArabic ? 'حجم الطلب الحالي لا يسمح بخصم إضافي. أضف المزيد للسلة!' : 'Le volume actuel ne permet pas de remise.');
      }
    }, 2000);
  };

  const handleQuantityChange = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: Math.min(newQty, item.stock_quantity) } : item;
      }
      return item;
    }));
  };

  const handleRemove = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // 🚀 إرسال الطلب إلى الـ ERP
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) return;
    
    setIsSubmitting(true);
    try {
      const orderRef = `ORD-${Date.now().toString().slice(-6)}`;
      
      // 1. تسجيل الطلب في قاعدة البيانات
      const { data: orderData, error: orderError } = await supabase.from('marketplace_orders').insert({
        ref_number: orderRef,
        supplier_id: vendorInfo.id,
        client_name: formData.name,
        client_phone: formData.phone,
        total_amount: finalTotal,
        payment_method: formData.paymentMethod,
        shipping_address: formData.address,
        order_status: 'pending' // سيظهر للمورد في قسم الطلبات
      }).select().single();

      if (orderError) throw orderError;

      // 2. تسجيل تفاصيل المنتجات وخصم المخزون
      for (const item of cart) {
        // إدخال تفاصيل الطلب
        await supabase.from('marketplace_order_items').insert({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        });

        // خصم المخزون فوراً لضمان عدم بيعه لشخص آخر
        await supabase.rpc('decrement_stock', { p_product_id: item.id, p_quantity: item.quantity });
      }

      // 3. نجاح العملية
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
      setStep(3); // الانتقال لشاشة النجاح
      setCart([]); // تفريغ السلة

    } catch (err) {
      console.error(err);
      alert('Error submitting order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-sm" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* خلفية للإغلاق */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* واجهة السلة الجانبية (Drawer) */}
      <div className={`relative w-full md:w-[450px] bg-white h-full shadow-2xl flex flex-col animate-slide-up md:animate-fade-in`}>
        
        {/* الهيدر */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            {step === 3 ? <CheckCircle className="text-emerald-500"/> : <ShoppingCart />}
            {step === 1 ? t.cartTitle : step === 2 ? t.step2Title : t.successTitle}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-500">
            <X size={20}/>
          </button>
        </div>

        {/* 🛒 الخطوة 1: السلة والتفاوض */}
        {step === 1 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-bold">{t.empty}</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                    <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1 pr-2">{item.name}</h4>
                        <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <span className="font-black text-blue-600" dir="ltr">{item.price} {currency}</span>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-gray-100">
                          <button onClick={() => handleQuantityChange(item.id, -1)} className="p-1 hover:bg-white rounded text-gray-500 shadow-sm"><Minus size={14}/></button>
                          <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)} className="p-1 hover:bg-white rounded text-gray-500 shadow-sm"><Plus size={14}/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ملخص السلة والتفاوض */}
            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-gray-100 space-y-4">
                
                {/* 🤖 زر الذكاء الاصطناعي */}
                {!discount && subtotal > 0 && (
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                    <p className="text-xs font-bold text-indigo-800">{aiMessage}</p>
                    <button 
                      onClick={handleAiNegotiation} disabled={isAiThinking}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isAiThinking ? <Loader2 size={16} className="animate-spin"/> : <Bot size={18}/>}
                      {t.aiNegotiate}
                    </button>
                  </div>
                )}
                {discount > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
                    <Sparkles size={16} className="text-emerald-500 shrink-0"/> {aiMessage}
                  </div>
                )}

                <div className="space-y-2 text-sm font-bold text-slate-600">
                  <div className="flex justify-between"><span>{t.subtotal}</span> <span dir="ltr">{subtotal.toLocaleString()} {currency}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-600"><span>{t.discount}</span> <span dir="ltr">-{discount.toLocaleString()} {currency}</span></div>}
                  <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-gray-200">
                    <span>{t.total}</span> <span dir="ltr" className="text-blue-600">{finalTotal.toLocaleString()} {currency}</span>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all text-lg">
                  {t.checkout}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 📝 الخطوة 2: الدفع وبيانات التوصيل */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.fullName}</label>
                <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phone}</label>
                <input required type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.address}</label>
                <textarea required rows="2" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm resize-none"></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-black text-slate-800 uppercase mb-3">{t.paymentMethod}</label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="pay" value="cod" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData({...formData, paymentMethod: 'cod'})} className="hidden" />
                    <Truck size={20} className={formData.paymentMethod === 'cod' ? 'text-blue-600' : 'text-gray-400'}/>
                    <span className={`font-bold text-sm ${formData.paymentMethod === 'cod' ? 'text-blue-800' : 'text-gray-600'}`}>{t.payCod}</span>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'split' ? 'border-purple-600 bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="pay" value="split" checked={formData.paymentMethod === 'split'} onChange={() => setFormData({...formData, paymentMethod: 'split'})} className="hidden" />
                    <CreditCard size={20} className={formData.paymentMethod === 'split' ? 'text-purple-600' : 'text-gray-400'}/>
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${formData.paymentMethod === 'split' ? 'text-purple-800' : 'text-gray-600'}`}>{t.paySplit}</span>
                      {formData.paymentMethod === 'split' && <span className="text-[10px] font-bold text-purple-600 mt-1">سحب: {(finalTotal * 0.3).toLocaleString()} {currency} الآن</span>}
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'bank_transfer' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="pay" value="bank_transfer" checked={formData.paymentMethod === 'bank_transfer'} onChange={() => setFormData({...formData, paymentMethod: 'bank_transfer'})} className="hidden" />
                    <Landmark size={20} className={formData.paymentMethod === 'bank_transfer' ? 'text-emerald-600' : 'text-gray-400'}/>
                    <span className={`font-bold text-sm ${formData.paymentMethod === 'bank_transfer' ? 'text-emerald-800' : 'text-gray-600'}`}>{t.payBank}</span>
                  </label>
                </div>
              </div>

            </form>
            
            <div className="mt-8">
              <button type="submit" form="checkout-form" disabled={isSubmitting} className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-lg">
                {isSubmitting ? <Loader2 size={24} className="animate-spin"/> : t.confirmOrder} - {finalTotal.toLocaleString()} {currency}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full mt-3 py-3 text-gray-500 font-bold text-sm hover:text-gray-800">
                الرجوع للسلة
              </button>
            </div>
          </div>
        )}

        {/* 🎉 الخطوة 3: صفحة النجاح */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">{t.successTitle}</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">{t.successMsg}</p>
            <button onClick={onClose} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all">
              {t.close}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}