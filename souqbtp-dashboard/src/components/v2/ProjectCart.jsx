import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ShoppingCart, Hammer, Truck, Briefcase, 
  Trash2, ChevronRight, Clock, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function ProjectCart({ isDarkMode, language, onClose, cart = [], onRemove }) {
  const isRtl = language === 'ar';

  const t = {
    ar: {
      title: "سلة المشروع", activeProject: "المشروع النشط:", projectName: "فيلا بن علي", completion: "نسبة الإنجاز",
      types: { product: "مواد بناء", service: "خدمات وحرفيين", rental: "معدات وآليات", expert: "خبراء ومهندسين" },
      status: { pendingQuote: "في انتظار عرض السعر", available: "متاح للحجز", inStock: "متوفر" },
      actions: { checkout: "تأكيد الطلبات", requestQuotes: "طلب عروض الأسعار", remove: "إزالة" },
      summary: { totalEst: "المجموع التقديري:", suppliers: "موردين", pending: "عروض معلقة" },
      unit: { day: "أيام", qty: "كمية" }
    },
    fr: {
      title: "Panier du Projet", activeProject: "Projet Actif :", projectName: "Villa Benali", completion: "Complétion",
      types: { product: "Matériaux", service: "Services & Artisans", rental: "Équipements", expert: "Experts" },
      status: { pendingQuote: "En attente de devis", available: "Disponible", inStock: "En stock" },
      actions: { checkout: "Valider les commandes", requestQuotes: "Demander les devis", remove: "Retirer" },
      summary: { totalEst: "Total estimé :", suppliers: "fournisseurs", pending: "devis en attente" },
      unit: { day: "jours", qty: "Qté" }
    },
    en: {
      title: "Project Cart", activeProject: "Active Project:", projectName: "Villa Benali", completion: "Completion",
      types: { product: "Materials", service: "Services & Experts", rental: "Machinery", expert: "Experts" },
      status: { pendingQuote: "Pending Quote", available: "Available", inStock: "In stock" },
      actions: { checkout: "Confirm Orders", requestQuotes: "Request Quotes", remove: "Remove" },
      summary: { totalEst: "Estimated Total:", suppliers: "suppliers", pending: "pending quotes" },
      unit: { day: "days", qty: "Qty" }
    }
  }[language] || {};

  const bgMain = isDarkMode ? 'bg-slate-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const borderStyle = isDarkMode ? 'border-slate-700' : 'border-slate-200';

  const formattedCart = cart.map(item => {
    const p = item.product;
    return {
      id: p.id,
      type: p.type || 'product',
      name: p.name,
      supplier: p.supplier || 'Vendeur',
      qty: item.qty || 1,
      price: p.price_retail || p.price || 0,
      currency: p.currency || 'MAD',
      unit: p.unit || 'Unité',
      image: p.image_url || p.image || 'https://via.placeholder.com/150',
      duration: p.duration || 1,
      transport: p.transport || 0,
      dates: p.dates || ''
    };
  });

  const estimatedTotal = formattedCart.reduce((sum, item) => {
    if (item.type === 'product') return sum + (item.price * item.qty);
    if (item.type === 'rental') return sum + (item.price * item.duration) + (item.transport || 0);
    return sum;
  }, 0);

  const suppliersCount = new Set(formattedCart.map(i => i.supplier)).size;
  const pendingQuotes = formattedCart.filter(i => i.type === 'service' || i.type === 'expert').length;
  
  const completionPercentage = Math.min(10 + (formattedCart.length * 5), 100);

  return createPortal(
    <div 
      className={`fixed inset-0 z-[999999] flex ${isRtl ? 'justify-start' : 'justify-end'} bg-black/60 backdrop-blur-sm transition-opacity`}
      onClick={onClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div 
        className={`w-full max-w-md h-full ${bgMain} shadow-2xl flex flex-col animate-slide-in-${isRtl ? 'left' : 'right'}`}
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
              <span className="text-slate-300">{t.completion}</span>
              <span className="text-emerald-400">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 transition-all duration-500">
              <div 
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-1000 ease-in-out" 
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
            formattedCart.map((item) => (
              <div key={item.id} className={`rounded-2xl border ${borderStyle} ${bgCard} overflow-hidden shadow-sm`}>
                
                <div className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b ${borderStyle}
                  ${item.type === 'product' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 
                    item.type === 'rental' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                    'bg-purple-500/10 text-purple-600 dark:text-purple-400'}`}
                >
                  {item.type === 'product' && <Hammer size={14} />}
                  {item.type === 'rental' && <Truck size={14} />}
                  {(item.type === 'service' || item.type === 'expert') && <Clock size={14} />}
                  {t.types[item.type]}
                </div>

                <div className="p-4 flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-sm leading-tight ${textTitle}`}>{item.name}</h4>
                      <button onClick={() => onRemove(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 -mt-1"><Trash2 size={16} /></button>
                    </div>
                    <p className={`text-xs ${textMuted} mb-3`}>{item.supplier}</p>
                    
                    {item.type === 'product' && (
                      <div className="flex items-end justify-between">
                        <div className={`text-xs font-bold px-2 py-1 rounded-lg border ${borderStyle}`}>
                          {t.unit.qty}: <span className={textTitle}>{item.qty} {item.unit}</span>
                        </div>
                        <p className="font-black text-emerald-500">{item.price * item.qty} {item.currency}</p>
                      </div>
                    )}

                    {item.type === 'rental' && (
                      <div className="flex items-end justify-between">
                        <div className={`text-xs font-bold px-2 py-1 rounded-lg border ${borderStyle}`}>
                          {item.duration} {t.unit.day} <span className={textMuted}>({item.dates})</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-500">{(item.price * item.duration) + item.transport} MAD</p>
                          <p className={`text-[10px] ${textMuted}`}>Inc. transport</p>
                        </div>
                      </div>
                    )}

                    {(item.type === 'service' || item.type === 'expert') && (
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
                        <AlertCircle size={14} /> {t.status.pendingQuote}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- Footer --- */}
        <div className={`p-6 border-t ${borderStyle} ${bgCard} shadow-[0_-10px_20px_rgba(0,0,0,0.05)]`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`font-bold ${textMuted}`}>{t.summary.totalEst}</span>
            <span className={`text-2xl font-black ${textTitle}`}>{estimatedTotal.toLocaleString()} MAD</span>
          </div>
          
          <div className="flex gap-4 mb-6 text-xs font-bold">
            <span className="flex items-center gap-1 text-slate-500"><CheckCircle2 size={14} className="text-emerald-500"/> {suppliersCount} {t.summary.suppliers}</span>
            <span className="flex items-center gap-1 text-slate-500"><FileText size={14} className="text-amber-500"/> {pendingQuotes} {t.summary.pending}</span>
          </div>

          <div className="space-y-3">
            {pendingQuotes > 0 && (
              <button 
                onClick={() => alert("Soumission des devis aux fournisseurs... (API Pending)")}
                className={`w-full py-3 rounded-xl font-bold border-2 flex items-center justify-center gap-2 transition-colors ${isDarkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-50'}`}
              >
                <FileText size={18} /> {t.actions.requestQuotes}
              </button>
            )}
            <button 
              onClick={() => alert("Redirection vers la caisse/validation... (API Pending)")}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
               {t.actions.checkout} <ChevronRight size={18} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>,
    document.body
  );
}