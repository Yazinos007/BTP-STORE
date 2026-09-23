import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ShoppingCart, Hammer, Truck, Briefcase, 
  Trash2, ChevronRight, Clock, FileText, CheckCircle2, AlertCircle,
  Plus, Minus, MessageSquare
} from 'lucide-react';

export default function ProjectCart({ 
  isDarkMode, 
  language, 
  onClose, 
  cart = [], 
  onRemove, 
  onUpdateQuantity,
  onCheckout,
  onNegotiate 
}) {
  const isRtl = language === 'ar';

  const t = {
    ar: {
      title: "سلة المشروع", activeProject: "المشروع النشط:", projectName: "فيلا بن علي", completion: "الميزانية المستهلكة",
      types: { product: "مواد بناء", service: "خدمات وحرفيين", rental: "معدات وآليات", expert: "خبراء ومهندسين" },
      status: { pendingQuote: "في انتظار عرض السعر", available: "متاح للحجز", inStock: "متوفر" },
      actions: { checkout: "تأكيد الطلبات", requestQuotes: "طلب عروض الأسعار", remove: "إزالة", negotiate: "تفاوض على الأسعار" },
      summary: { totalEst: "المجموع التقديري:", suppliers: "موردين", pending: "عروض معلقة" },
      unit: { day: "أيام", qty: "كمية" },
      wholesaleAlert: "سعر الجملة مفعل!"
    },
    fr: {
      title: "Panier du Projet", activeProject: "Projet Actif :", projectName: "Villa Benali", completion: "Budget Consommé",
      types: { product: "Matériaux", service: "Services & Artisans", rental: "Équipements", expert: "Experts" },
      status: { pendingQuote: "En attente de devis", available: "Disponible", inStock: "En stock" },
      actions: { checkout: "Valider les commandes", requestQuotes: "Demander les devis", remove: "Retirer", negotiate: "Négocier les tarifs" },
      summary: { totalEst: "Total estimé :", suppliers: "fournisseurs", pending: "devis en attente" },
      unit: { day: "jours", qty: "Qté" },
      wholesaleAlert: "Prix de gros activé !"
    },
    en: {
      title: "Project Cart", activeProject: "Active Project:", projectName: "Villa Benali", completion: "Budget Used",
      types: { product: "Materials", service: "Services & Experts", rental: "Machinery", expert: "Experts" },
      status: { pendingQuote: "Pending Quote", available: "Available", inStock: "In stock" },
      actions: { checkout: "Confirm Orders", requestQuotes: "Request Quotes", remove: "Remove", negotiate: "Negotiate Prices" },
      summary: { totalEst: "Estimated Total:", suppliers: "suppliers", pending: "pending quotes" },
      unit: { day: "days", qty: "Qty" },
      wholesaleAlert: "Wholesale price active!"
    }
  }[language] || {};

  const bgMain = isDarkMode ? 'bg-slate-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const borderStyle = isDarkMode ? 'border-slate-700' : 'border-slate-200';

  // معالجة البيانات لتشمل أسعار الجملة والتجزئة
  const formattedCart = cart.map(item => {
    const p = item.product;
    return {
      id: p.id,
      type: p.type || 'product',
      name: p.name,
      supplier: p.supplier || 'Vendeur',
      qty: parseInt(item.qty) || 1,
      price_retail: p.price_retail || p.price || 0,
      price_wholesale: p.price_wholesale || p.price || 0,
      min_wholesale_qty: p.min_wholesale_qty || 999999, // إذا لم يوجد، نضع رقم كبير
      currency: p.currency || 'MAD',
      unit: p.unit || 'Unité',
      image: p.image_url || p.image || 'https://via.placeholder.com/150',
      duration: p.duration || 1,
      transport: p.transport || 0,
      dates: p.dates || ''
    };
  });

  // حساب المجموع التقديري مع أخذ سعر الجملة بعين الاعتبار
  const estimatedTotal = formattedCart.reduce((sum, item) => {
    if (item.type === 'product') {
      const activePrice = item.qty >= item.min_wholesale_qty ? item.price_wholesale : item.price_retail;
      return sum + (activePrice * item.qty);
    }
    if (item.type === 'rental') {
      return sum + (item.price_retail * item.duration) + (item.transport || 0);
    }
    return sum;
  }, 0);

  const suppliersCount = new Set(formattedCart.map(i => i.supplier)).size;
  const pendingQuotes = formattedCart.filter(i => i.type === 'service' || i.type === 'expert').length;
  
  // منطق الميزانية (مثال: ميزانية المشروع 100,000 درهم)
  const projectBudget = 100000; 
  const completionPercentage = Math.min(Math.round((estimatedTotal / projectBudget) * 100), 100);

  return createPortal(
    <div 
      className={`fixed inset-0 z-[999999] flex ${isRtl ? 'justify-start' : 'justify-end'} bg-black/60 backdrop-blur-sm transition-opacity`}
      onClick={onClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div 
        className={`w-full max-w-lg h-full ${bgMain} shadow-2xl flex flex-col animate-slide-in-${isRtl ? 'left' : 'right'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className={`p-6 border-b ${borderStyle} bg-slate-900 text-white relative`}>
          <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-2 bg-slate-800 hover:bg-red-500 rounded-full transition-colors`}>
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.activeProject}</p>
              <h2 className="text-xl font-black">{t.projectName}</h2>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">{t.completion} ({projectBudget.toLocaleString()} MAD)</span>
              <span className={completionPercentage > 90 ? "text-red-400" : "text-emerald-400"}>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 transition-all duration-500">
              <div 
                className={`${completionPercentage > 90 ? 'bg-red-500' : 'bg-emerald-400'} h-1.5 rounded-full transition-all duration-1000 ease-in-out`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* --- Body: Real Cart Items --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {formattedCart.length === 0 ? (
             <div className="text-center text-slate-400 mt-10 font-bold">Le projet est vide.</div>
          ) : (
            formattedCart.map((item) => {
              const isWholesale = item.type === 'product' && item.qty >= item.min_wholesale_qty;
              const activePrice = isWholesale ? item.price_wholesale : item.price_retail;

              return (
                <div key={item.id} className={`rounded-2xl border ${isWholesale ? 'border-emerald-500/50' : borderStyle} ${bgCard} overflow-hidden shadow-sm transition-colors`}>
                  
                  <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b ${isWholesale ? 'border-emerald-500/20 bg-emerald-500/10' : borderStyle}
                    ${item.type === 'product' && !isWholesale ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 
                      item.type === 'rental' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                      item.type === 'service' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {item.type === 'product' && <Hammer size={14} />}
                      {item.type === 'rental' && <Truck size={14} />}
                      {(item.type === 'service' || item.type === 'expert') && <Clock size={14} />}
                      <span className={isWholesale ? 'text-emerald-600 dark:text-emerald-400' : ''}>{t.types[item.type]}</span>
                    </div>
                    {isWholesale && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 size={14}/> {t.wholesaleAlert}</span>}
                  </div>

                  <div className="p-4 flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-sm leading-tight ${textTitle}`}>{item.name}</h4>
                        <button onClick={() => onRemove(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 -mt-1"><Trash2 size={16} /></button>
                      </div>
                      <p className={`text-xs ${textMuted} mb-3`}>{item.supplier}</p>
                      
                      {/* --- التحكم في كمية المواد --- */}
                      {item.type === 'product' && (
                        <div className="flex items-end justify-between mt-2">
                          
                          {/* Input Quantity Stepper */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                            <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.qty - 1))} className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"><Minus size={14}/></button>
                            <input 
                              type="text" 
                              inputMode="numeric"
                              value={item.qty} 
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                onUpdateQuantity(item.id, val === '' ? '' : parseInt(val));
                              }}
                              onBlur={() => { if (!item.qty || item.qty < 1) onUpdateQuantity(item.id, 1); }}
                              className={`font-black text-sm w-12 text-center outline-none bg-transparent ${textTitle}`} 
                            />
                            <button onClick={() => onUpdateQuantity(item.id, item.qty + 1)} className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"><Plus size={14}/></button>
                            <span className={`text-[10px] font-bold ${textMuted} ml-1`}>{item.unit}</span>
                          </div>

                          {/* التسعير مع منطق الجملة */}
                          <div className="text-right">
                            {isWholesale && (
                              <p className="text-[11px] text-slate-400 line-through mb-0.5">{(item.price_retail * item.qty).toLocaleString()} {item.currency}</p>
                            )}
                            <p className={`font-black text-lg leading-none ${isWholesale ? 'text-emerald-500' : textTitle}`}>
                              {(activePrice * item.qty).toLocaleString()} <span className="text-xs">{item.currency}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* --- الكراء والمعدات --- */}
                      {item.type === 'rental' && (
                        <div className="flex items-end justify-between">
                          <div className={`text-xs font-bold px-2 py-1 rounded-lg border ${borderStyle}`}>
                            {item.duration} {t.unit.day} <span className={textMuted}>({item.dates})</span>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-lg ${textTitle}`}>{(item.price_retail * item.duration) + item.transport} <span className="text-xs">MAD</span></p>
                            <p className={`text-[10px] ${textMuted}`}>Inc. transport</p>
                          </div>
                        </div>
                      )}

                      {/* --- الخدمات والخبراء --- */}
                      {(item.type === 'service' || item.type === 'expert') && (
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
                          <AlertCircle size={14} /> {t.status.pendingQuote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- Footer & Actions --- */}
        <div className={`p-6 border-t ${borderStyle} ${bgCard} shadow-[0_-10px_20px_rgba(0,0,0,0.05)]`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`font-bold ${textMuted}`}>{t.summary.totalEst}</span>
            <span className={`text-3xl font-black ${textTitle}`}>{estimatedTotal.toLocaleString()} MAD</span>
          </div>
          
          <div className="flex gap-4 mb-6 text-xs font-bold">
            <span className="flex items-center gap-1 text-slate-500"><CheckCircle2 size={14} className="text-emerald-500"/> {suppliersCount} {t.summary.suppliers}</span>
            <span className="flex items-center gap-1 text-slate-500"><FileText size={14} className="text-amber-500"/> {pendingQuotes} {t.summary.pending}</span>
          </div>

          <div className="space-y-3">
            {/* زر التفاوض الجديد */}
            <button 
              onClick={onNegotiate}
              className={`w-full py-3.5 rounded-xl font-bold border-2 flex items-center justify-center gap-2 transition-colors shadow-sm ${isDarkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-50'}`}
            >
              <MessageSquare size={18} /> {t.actions.negotiate}
            </button>
            
            {/* زر التأكيد أو طلب العروض */}
            <button 
              onClick={onCheckout}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
               {pendingQuotes > 0 ? t.actions.requestQuotes : t.actions.checkout} <ChevronRight size={20} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}