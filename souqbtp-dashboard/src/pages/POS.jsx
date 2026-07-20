import { useState, useEffect } from 'react';
import { Search, Trash2, Plus, Minus, CheckCircle, CreditCard, Printer, ShoppingCart, Loader2, X, HardHat, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useProductStore from '../store/useProductStore';
import useSupplierStore from '../store/useSupplierStore';
import useSettingsStore from '../store/useSettingsStore';
import useClientStore from '../store/useClientStore';
import confetti from 'canvas-confetti';

const translations = {
  ar: {
    title: 'نقطة البيع (POS)', search: 'ابحث عن منتج...', stock: 'المخزون:',
    outOfStock: 'نفد', cart: 'السلة', emptyCart: 'السلة فارغة', total: 'المجموع :', currency: 'درهم',
    cash: 'دفع نقداً', credit: 'بيع بالآجل', successCash: '✅ تم البيع! تم إرسال الطلبية وحفظ الفاتورة تلقائياً.',
    successCredit: '⏳ تم البيع بالآجل! تم إرسال الطلبية وحفظ BL تلقائياً.', error: 'حدث خطأ أثناء العملية.',
    noStock: 'عذراً، هذا المنتج غير متوفر في المخزون!', selectClient: 'اختر العميل (الزبون)', cancel: 'إلغاء', confirm: 'تأكيد',
    chantier: 'اسم الورش (اختياري)', genDoc: 'إصدار Devis/BC', docType: 'نوع المستند',
    successDoc: '✅ تم إصدار المستند بنجاح! السلة لازالت ممتلئة إذا أردت إتمام البيع.',
    optionalClient: '-- زبون عابر (اختياري) --',
    printA4: 'طباعة A4', details: 'تفاصيل', delete: 'حذف', emptyCartConfirm: 'إفراغ السلة؟',
    emptyCartBtn: 'إفراغ',
    docDevis: 'Devis (عرض سعر)', docBC: 'Bon de Commande (أمر شراء)',
    chantierPlaceholder: 'مثال: فيلا طريق إيموزار', amountTotal: 'الإجمالي:',
    thanks: 'شكراً لك!',
    printLabels: { designation: 'البيان', qty: 'الكمية', unit: 'الوحدة', pu: 'السعر', amount: 'المبلغ', totalHT: 'الإجمالي HT', tva: 'الضريبة (20%)', totalTTC: 'الإجمالي TTC' }
  },
  fr: {
    title: 'Point de Vente (POS)', search: 'Rechercher un produit...', stock: 'Stock:',
    outOfStock: 'Rupture', cart: 'Panier', emptyCart: 'Le panier est vide', total: 'Total :', currency: 'MAD',
    cash: 'Valider (Espèces)', credit: 'Vente à Crédit', successCash: '✅ Vente validée ! Facture générée automatiquement.',
    successCredit: '⏳ Vente à crédit enregistrée ! BL généré automatiquement.', error: 'Erreur lors de l\'opération.',
    noStock: 'Produit indisponible !', selectClient: 'Sélectionner le client', cancel: 'Annuler', confirm: 'Confirmer',
    chantier: 'Nom du Chantier (Optionnel)', genDoc: 'Générer Devis/BC', docType: 'Type de Document',
    successDoc: '✅ Document généré ! Le panier est conservé pour la vente.',
    optionalClient: '-- Client de passage (Optionnel) --',
    printA4: 'Imprimer A4', details: 'Détails', delete: 'Supprimer', emptyCartConfirm: 'Vider le panier ?',
    emptyCartBtn: 'Vider',
    docDevis: 'Devis', docBC: 'Bon de Commande',
    chantierPlaceholder: 'Ex: Villa Route Imouzzer', amountTotal: 'Total :',
    thanks: 'Merci !',
    printLabels: { designation: 'Désignation', qty: 'Qté', unit: 'Unité', pu: 'P.U', amount: 'Montant', totalHT: 'Total HT', tva: 'TVA (20%)', totalTTC: 'Total TTC' }
  },
  en: {
    title: 'Point of Sale (POS)', search: 'Search product...', stock: 'Stock:',
    outOfStock: 'Out', cart: 'Cart', emptyCart: 'Cart is empty', total: 'Total :', currency: 'MAD',
    cash: 'Pay (Cash)', credit: 'Credit Sale', successCash: '✅ Sale validated! Invoice generated automatically.',
    successCredit: '⏳ Credit sale recorded! Delivery note generated.', error: 'An error occurred.',
    noStock: 'Product unavailable!', selectClient: 'Select client', cancel: 'Cancel', confirm: 'Confirm',
    chantier: 'Project Name (Optional)', genDoc: 'Generate Quote/Order', docType: 'Document Type',
    successDoc: '✅ Document generated! Cart kept for sale.',
    optionalClient: '-- Walk-in Client (Optional) --',
    printA4: 'Print A4', details: 'Details', delete: 'Delete', emptyCartConfirm: 'Empty cart?',
    emptyCartBtn: 'Clear',
    docDevis: 'Quote (Devis)', docBC: 'Purchase Order (BC)',
    chantierPlaceholder: 'Ex: Villa Imouzzer Road', amountTotal: 'Total:',
    thanks: 'Thank you!',
    printLabels: { designation: 'Description', qty: 'Qty', unit: 'Unit', pu: 'Price', amount: 'Amount', totalHT: 'Total HT', tva: 'VAT (20%)', totalTTC: 'Total TTC' }
  }
};

export default function POS() {
  const { products, fetchProducts } = useProductStore();
  const { supplier } = useSupplierStore();
  const { language } = useSettingsStore();
  const { clients, fetchClients } = useClientStore();
  const t = translations[language] || translations['fr'];

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 🌟 النافذة الموحدة الجديدة للدفع
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState('Espèces'); 
  
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [chantier, setChantier] = useState('');
  const [docType, setDocType] = useState('Devis');

  useEffect(() => { fetchProducts(); fetchClients(); }, [fetchProducts, fetchClients]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) { alert(t.noStock); return; }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const currentQty = Number(existing.quantity) || 0;
        if (currentQty >= product.stock_quantity) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: currentQty + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === '') { setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: '' } : item)); return; }
    let parsedQty = parseInt(newQuantity, 10);
    if (isNaN(parsedQty)) return;
    if (parsedQty < 1) parsedQty = 1;
    const productInStock = products.find(p => p.id === id);
    const finalQty = parsedQty > productInStock.stock_quantity ? productInStock.stock_quantity : parsedQty;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: finalQty } : item));
  };

  const handleBlur = (id, currentQty) => { if (currentQty === '' || Number(currentQty) < 1) updateQuantity(id, 1); };
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const clearCart = () => { if(window.confirm(t.emptyCartConfirm)) setCart([]); };
  
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 0)), 0);

  // 🖨️ طباعة التذكرة الصغيرة (Ticket)
  const handlePrintTicket = () => {
    if (cart.length === 0) return;
    const storeName = supplier?.store_name || 'SouqBTP';
    const date = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
    const clientNameText = selectedClientId ? `<p style="margin:5px 0;">${t.selectClient.split(' ')[0]}: ${clients.find(c => c.id === selectedClientId)?.full_name}</p>` : '';
    
    const ticketHtml = `
      <html>
        <head>
          <title>Ticket</title>
          <style>
            @page { margin: 0; }
            body { font-family: monospace; font-size: 13px; padding: 15px; max-width: 320px; margin: 0 auto; direction: ${language === 'ar' ? 'rtl' : 'ltr'}; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .flex-between { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .total-section { border-top: 2px dashed #000; margin-top: 15px; padding-top: 10px; font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin:0;">${storeName}</h2>
            <p style="margin:5px 0;">${date}</p>
            ${clientNameText}
          </div>
          <div class="divider"></div>
          <div class="flex-between bold">
            <span>${t.printLabels.designation}</span>
            <span>${t.printLabels.amount}</span>
          </div>
          <div class="divider"></div>
          ${cart.map(item => `
            <div class="flex-between">
              <span>${item.quantity}x ${item.name}</span>
              <span class="bold" dir="ltr">${(item.quantity * item.price).toLocaleString()}</span>
            </div>
          `).join('')}
          <div class="total-section flex-between">
            <span>${t.total.replace(':', '')} :</span>
            <span dir="ltr">${total.toLocaleString()} ${t.currency}</span>
          </div>
          <div class="divider"></div>
          <div class="center">${t.thanks}</div>
        </body>
      </html>
    `;
    const iframe = document.createElement('iframe'); 
    iframe.style.display = 'none'; 
    document.body.appendChild(iframe); 
    iframe.contentDocument.write(ticketHtml); 
    iframe.contentDocument.close(); 
    setTimeout(() => { 
      iframe.contentWindow.focus(); 
      iframe.contentWindow.print(); 
      setTimeout(() => document.body.removeChild(iframe), 1000); 
    }, 300);
  };

  // 🖨️ طباعة مستند A4
  const printA4Document = (refNumber, clientName) => {
    const isRTL = language === 'ar';
    const alignStart = isRTL ? 'right' : 'left';
    const alignEnd = isRTL ? 'left' : 'right';
    const storeName = supplier?.store_name || 'ENTREPRISE SOUQBTP';
    const date = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA').format(new Date());
    const { printLabels } = t;

    const docHtml = `
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
        <head>
          <title>${docType} - ${refNumber}</title>
          <style>
            body{font-family:'Arial',sans-serif;padding:40px;color:#333; direction: ${isRTL ? 'rtl' : 'ltr'};}
            .header{display:flex;justify-content:space-between;border-bottom:3px solid #1e3a8a;padding-bottom:20px;margin-bottom:30px;}
            .company h1{color:#1e3a8a;margin:0 0 10px 0;text-transform:uppercase;font-size:28px;}
            .doc-info h2{margin:0 0 10px 0;color:#333;text-transform:uppercase;font-size:24px;letter-spacing:2px;}
            .client-box{background:#f9fafb;padding:20px;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:30px;}
            table{width:100%;border-collapse:collapse;margin-bottom:30px;}
            th{background:#1e3a8a;color:white;padding:12px;text-align:${alignStart};font-size:14px;text-transform:uppercase;}
            td{padding:12px;border-bottom:1px solid #e5e7eb;text-align:${alignStart};}
            .total-box{float:${alignEnd};width:300px;border:2px solid #1e3a8a;border-radius:8px;padding:15px;}
            .total-row{display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;}
            .total-final{display:flex;justify-content:space-between;font-size:20px;font-weight:bold;color:#1e3a8a;border-top:1px solid #e5e7eb;padding-top:10px;margin-top:10px;}
            .footer{margin-top:80px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:20px;}
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">
              <h1>${storeName}</h1>
            </div>
            <div class="doc-info" style="text-align:${alignEnd};">
              <h2>${docType}</h2>
              <p><strong>N°:</strong> ${refNumber}<br/><strong>Date:</strong> ${date}</p>
            </div>
          </div>
          <div class="client-box">
            <p style="margin:0 0 5px 0; font-size:18px;"><strong>Client:</strong> ${clientName}</p>
            ${chantier ? `<p style="margin:5px 0 0 0; color:#d97706; font-weight:bold;">${t.chantier.split(' ')[0]}: ${chantier}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>${printLabels.designation}</th>
                <th style="text-align:center">${printLabels.qty}</th>
                <th style="text-align:center">${printLabels.unit}</th>
                <th style="text-align:${alignEnd}">${printLabels.pu} (${t.currency})</th>
                <th style="text-align:${alignEnd}">${printLabels.amount} (${t.currency})</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td style="text-align:center">${item.quantity}</td>
                  <td style="text-align:center">${item.unit || 'U'}</td>
                  <td style="text-align:${alignEnd}" dir="ltr">${item.price}</td>
                  <td style="text-align:${alignEnd}; font-weight:bold;" dir="ltr">${(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-box">
            <div class="total-row"><span>${printLabels.totalHT}:</span><span dir="ltr">${(total * 0.8).toLocaleString()}</span></div>
            <div class="total-row"><span>${printLabels.tva}:</span><span dir="ltr">${(total * 0.2).toLocaleString()}</span></div>
            <div class="total-final"><span>${printLabels.totalTTC}:</span><span dir="ltr">${total.toLocaleString()} ${t.currency}</span></div>
          </div>
          <div style="clear:both;"></div>
          <div class="footer"><p>Document généré par SouqBTP ERP.</p></div>
        </body>
      </html>
    `;
    const iframe = document.createElement('iframe'); 
    iframe.style.display = 'none'; 
    document.body.appendChild(iframe); 
    iframe.contentDocument.write(docHtml); 
    iframe.contentDocument.close(); 
    setTimeout(() => { 
      iframe.contentWindow.focus(); 
      iframe.contentWindow.print(); 
      setTimeout(() => document.body.removeChild(iframe), 1000); 
    }, 500);
  };

  const generateDocument = async (e) => {
    e.preventDefault();
    if (!selectedClientId) return alert(t.selectClient);
    setIsProcessing(true);
    try {
      const prefix = docType === 'Devis' ? 'DEV' : 'BC';
      const refNumber = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const client = clients.find(c => c.id === selectedClientId);

      await supabase.from('documents').insert([{
        owner_id: supplier.id, client_id: selectedClientId, type: docType, ref_number: refNumber, chantier: chantier || null, total_amount: total, items: cart
      }]);

      printA4Document(refNumber, client.full_name);
      setShowDocModal(false);
      alert(t.successDoc);
    } catch (error) { 
      console.error(error);
      alert(t.error); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const processOrder = async (paymentMethod, clientId = null) => {
    if (cart.length === 0) return;
    const validCart = cart.map(item => ({...item, quantity: Number(item.quantity) || 1}));
    setIsProcessing(true);
    try {
      const { error: orderError } = await supabase.from('orders').insert([{
        supplier_id: supplier.id, client_id: clientId || null, chantier: chantier || null, total_amount: total, status: 'pending', payment_status: paymentMethod === 'Espèces' ? 'paid' : 'unpaid', payment_method: paymentMethod, items: validCart
      }]);
      if (orderError) throw new Error("Erreur Order: " + orderError.message);

      for (const item of validCart) {
        const newStock = item.stock_quantity - item.quantity;
        await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.id);
      }

      if (paymentMethod === 'Crédit' && clientId) {
        const client = clients.find(c => c.id === clientId);
        const newDebt = Number(client.total_debt || 0) + total;
        await supabase.from('clients').update({ total_debt: newDebt }).eq('id', clientId);
      }

      const autoDocType = paymentMethod === 'Espèces' ? 'Facture' : 'Bon de Livraison';
      const prefix = paymentMethod === 'Espèces' ? 'FAC' : 'BL';
      const refNumber = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const { error: docError } = await supabase.from('documents').insert([{
        owner_id: supplier.id, client_id: clientId || null, type: autoDocType, ref_number: refNumber, chantier: chantier || null, total_amount: total, items: validCart
      }]);
      if (docError) throw new Error("Erreur Document: " + docError.message);

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });

      setCart([]); setChantier(''); fetchProducts(); if (clientId) fetchClients();
      setShowCheckoutModal(false); setSelectedClientId('');
      alert(paymentMethod === 'Espèces' ? t.successCash : t.successCredit);
    } catch (error) { 
      console.error("Erreur POS Détaillée:", error);
      alert(t.error); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex items-start gap-6 animate-fade-in overflow-hidden relative" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 h-full overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h2 className="text-2xl font-black text-gray-800">{t.title}</h2>
          <div className="relative w-72">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input type="text" placeholder={t.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20`} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock_quantity <= 0;
              return (
                <button 
                  key={product.id} 
                  onClick={() => addToCart(product)} 
                  disabled={isOutOfStock} 
                  className={`text-start bg-white border rounded-2xl p-5 transition-all group relative overflow-hidden flex flex-col justify-between h-40
                    ${isOutOfStock ? 'border-red-200 opacity-60 cursor-not-allowed bg-red-50/20' : 'border-gray-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1'}`}
                >
                  {isOutOfStock && <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center z-10"><span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase">{t.outOfStock}</span></div>}
                  <h3 className="font-bold text-gray-800 mb-1 truncate group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  <div className="flex items-baseline gap-1 mt-auto mb-2" dir="ltr">
                    <span className={`text-2xl font-black ${isOutOfStock ? 'text-gray-400' : 'text-blue-600'}`}>{product.price}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.currency}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-500">{t.stock}</span>
                    <span className={`text-sm font-bold ${isOutOfStock ? 'text-red-500' : product.stock_quantity > 10 ? 'text-emerald-500' : 'text-orange-500'}`}>{product.stock_quantity}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-[360px] bg-[#2d2252] rounded-2xl shadow-xl flex flex-col text-white shrink-0 h-auto max-h-full">
        <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3"><ShoppingCart className="text-blue-400" /><h2 className="text-xl font-black">{t.cart}</h2></div>
          {cart.length > 0 && <button onClick={clearCart} className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 bg-red-400/10 rounded">{t.emptyCartBtn}</button>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" dir="ltr">
          {cart.length === 0 ? <div className="py-8 flex flex-col items-center text-white/30 space-y-4"><ShoppingCart size={40} className="opacity-20" /><p className="font-medium text-sm">{t.emptyCart}</p></div> : cart.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group relative">
              <div className="flex justify-between items-start">
                <div className="pr-6"><h4 className="font-bold text-white text-sm">{item.name}</h4><p className="text-xs font-medium text-blue-300 mt-0.5">{item.price} {t.currency}</p></div>
                <button onClick={() => removeFromCart(item.id)} className="absolute top-3 right-3 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
              <div className="flex items-center justify-between bg-black/20 rounded-lg p-1">
                <button onClick={() => updateQuantity(item.id, (Number(item.quantity) || 1) - 1)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Minus size={14} /></button>
                <input type="text" value={item.quantity} onChange={(e) => updateQuantity(item.id, e.target.value)} onBlur={() => handleBlur(item.id, item.quantity)} className="w-16 text-center bg-transparent border-none text-white font-bold focus:ring-0 outline-none" />
                <button onClick={() => updateQuantity(item.id, (Number(item.quantity) || 0) + 1)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Plus size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-black/20 border-t border-white/10 shrink-0">
          <div className="flex justify-between items-end mb-5"><span className="text-white/60 font-medium">{t.total}</span><div className="flex items-baseline gap-2" dir="ltr"><span className="text-3xl font-black text-white">{total.toLocaleString()}</span><span className="text-sm font-bold text-white/60 uppercase">{t.currency}</span></div></div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <button 
                disabled={cart.length === 0 || isProcessing} 
                onClick={() => { setCheckoutMethod('Espèces'); setShowCheckoutModal(true); }} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg text-sm"
              >
                <CheckCircle size={16} /> {t.cash}
              </button>
              <button 
                disabled={cart.length === 0 || isProcessing} 
                onClick={() => { setCheckoutMethod('Crédit'); setShowCheckoutModal(true); }} 
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg text-sm"
              >
                <CreditCard size={16} /> {t.credit}
              </button>
            </div>
            
            <div className="flex gap-2">
              <button disabled={cart.length === 0} onClick={handlePrintTicket} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all disabled:opacity-50" title="Ticket"><Printer size={18} /></button>
              <button disabled={cart.length === 0 || isProcessing} onClick={() => setShowDocModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg text-sm border border-blue-400/30">
                <FileText size={18} /> {t.genDoc}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className={`bg-white rounded-3xl shadow-2xl p-6 w-[450px] animate-slide-up border-t-8 ${checkoutMethod === 'Espèces' ? 'border-emerald-500' : 'border-orange-500'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                {checkoutMethod === 'Espèces' ? <><CheckCircle className="text-emerald-500"/> {t.cash}</> : <><CreditCard className="text-orange-500"/> {t.credit}</>}
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.selectClient}</label>
                <select 
                  value={selectedClientId} 
                  onChange={(e) => setSelectedClientId(e.target.value)} 
                  required={checkoutMethod === 'Crédit'} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
                >
                  <option value="" disabled={checkoutMethod === 'Crédit'}>{checkoutMethod === 'Espèces' ? t.optionalClient : `-- ${t.selectClient} --`}</option>
                  {clients.map(client => (<option key={client.id} value={client.id}>{client.full_name}</option>))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><HardHat size={16} className="text-gray-400"/> {t.chantier}</label>
                <input type="text" value={chantier} onChange={(e) => setChantier(e.target.value)} placeholder={t.chantierPlaceholder} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-500/20 font-medium" />
              </div>
              <div className={`p-4 rounded-xl border flex justify-between items-center ${checkoutMethod === 'Espèces' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                <span className={`font-medium text-sm ${checkoutMethod === 'Espèces' ? 'text-emerald-800' : 'text-orange-800'}`}>{t.amountTotal}</span>
                <span className={`font-black text-xl ${checkoutMethod === 'Espèces' ? 'text-emerald-600' : 'text-orange-600'}`} dir="ltr">{total.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button onClick={() => setShowCheckoutModal(false)} className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">{t.cancel}</button>
                <button 
                  onClick={() => processOrder(checkoutMethod, selectedClientId || null)} 
                  disabled={(checkoutMethod === 'Crédit' && !selectedClientId) || isProcessing} 
                  className={`flex-1 py-3.5 text-white font-bold rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg ${checkoutMethod === 'Espèces' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30'}`}
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : t.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-[450px] animate-slide-up border-t-8 border-blue-600">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2"><FileText className="text-blue-600"/> {t.genDoc}</h3>
              <button onClick={() => setShowDocModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={generateDocument} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.docType}</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-4 py-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-lg text-center shadow-inner cursor-pointer">
                  <option value="Devis">{t.docDevis}</option>
                  <option value="Bon de Commande">{t.docBC}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.selectClient}</label>
                <select required value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer">
                  <option value="" disabled>-- {t.selectClient} --</option>
                  {clients.map(client => (<option key={client.id} value={client.id}>{client.full_name}</option>))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><HardHat size={16} className="text-orange-500"/> {t.chantier}</label>
                <input type="text" value={chantier} onChange={(e) => setChantier(e.target.value)} placeholder={t.chantierPlaceholder} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 font-medium" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowDocModal(false)} className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">{t.cancel}</button>
                <button type="submit" disabled={isProcessing} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30">
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Printer size={18}/> {t.printA4}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}