import React, { useState } from 'react';
import { X, Star, FileText, ShoppingCart, Play, CheckCircle, Info, MessageSquare, Sparkles, AlertTriangle, Minus, Plus } from 'lucide-react';

const modalTranslations = {
  ar: {
    close: 'إغلاق',
    addToCart: 'إضافة للسلة',
    total: 'الإجمالي:',
    stock: 'في المخزون:',
    outOfStock: 'نفد من المخزون',
    description: 'تفاصيل المنتج',
    specifications: 'المواصفات التقنية',
    reviews: 'تقييمات العملاء',
    video: 'فيديو توضيحي',
    techSheet: 'تحميل بطاقة تقنية (PDF)',
    tierPricing: 'تسعير الجملة',
    buy: 'اشتري',
    to: 'إلى',
    units: 'وحدة',
    aiSummary: 'تلخيص الذكاء الاصطناعي للآراء',
    aiText: 'يُجمع معظم المقاولين على جودة هذا المنتج ومطابقته للمعايير. 95% ينصحون به للمشاريع الكبرى.',
    noReviews: 'لا توجد تقييمات حتى الآن. كن أول من يقيم هذا المنتج!',
    noVideo: 'لا يوجد فيديو توضيحي متاح لهذا المنتج حالياً.'
  },
  fr: {
    close: 'Fermer',
    addToCart: 'Ajouter au panier',
    total: 'Total :',
    stock: 'En stock :',
    outOfStock: 'Rupture de stock',
    description: 'Détails du Produit',
    specifications: 'Spécifications',
    reviews: 'Avis Clients',
    video: 'Vidéo',
    techSheet: 'Fiche Technique (PDF)',
    tierPricing: 'Prix de Gros',
    buy: 'Achetez',
    to: 'à',
    units: 'unités',
    aiSummary: 'Résumé IA des avis',
    aiText: 'La majorité des entrepreneurs s\'accordent sur la haute qualité de ce produit. 95% le recommandent pour les grands projets.',
    noReviews: 'Aucun avis pour le moment. Soyez le premier à évaluer !',
    noVideo: 'Aucune vidéo disponible pour ce produit.'
  },
  en: {
    close: 'Close',
    addToCart: 'Add to Cart',
    total: 'Total:',
    stock: 'In stock:',
    outOfStock: 'Out of stock',
    description: 'Product Details',
    specifications: 'Specifications',
    reviews: 'Customer Reviews',
    video: 'Video',
    techSheet: 'Download Tech Sheet (PDF)',
    tierPricing: 'Wholesale Pricing',
    buy: 'Buy',
    to: 'to',
    units: 'units',
    aiSummary: 'AI Review Summary',
    aiText: 'Most contractors agree on the high quality of this product. 95% recommend it for major projects.',
    noReviews: 'No reviews yet. Be the first to review!',
    noVideo: 'No video available for this product currently.'
  }
};

export default function ProductModal({ product, onClose, onAddToCart, language, currency }) {
  const t = modalTranslations[language] || modalTranslations['fr'];
  const isArabic = language === 'ar';
  
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  
  // دمج الصورة الرئيسية مع مصفوفة الصور إن وجدت (لإنشاء المعرض)
  const gallery = product.gallery_images && product.gallery_images.length > 0 
    ? [product.image_url, ...product.gallery_images].filter(Boolean)
    : [product.image_url].filter(Boolean);
    
  const [selectedImage, setSelectedImage] = useState(gallery[0] || null);

  // حساب السعر بناءً على الكمية (Tier Pricing Logic)
  const currentPrice = React.useMemo(() => {
    if (!product.tier_pricing || product.tier_pricing.length === 0) return product.price;
    
    // افتراض شكل البيانات: [{ min_qty: 10, price: 95 }, { min_qty: 50, price: 80 }]
    let applicablePrice = product.price;
    const sortedTiers = [...product.tier_pricing].sort((a, b) => b.min_qty - a.min_qty);
    
    for (const tier of sortedTiers) {
      if (quantity >= tier.min_qty) {
        applicablePrice = tier.price;
        break;
      }
    }
    return applicablePrice;
  }, [quantity, product.price, product.tier_pricing]);

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity, purchase_price: currentPrice });
    onClose();
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* خلفية ضبابية */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      {/* حاوية النافذة المنبثقة */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* زر الإغلاق */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-red-500 hover:text-white rounded-full transition-all text-slate-700 backdrop-blur-sm">
          <X size={24} />
        </button>

        <div className="flex flex-col lg:flex-row overflow-y-auto custom-scrollbar">
          
          {/* 📸 القسم الأيمن (أو الأيسر حسب اللغة): معرض الصور */}
          <div className="w-full lg:w-2/5 p-6 bg-slate-50 border-r border-slate-100 flex flex-col">
            <div className="aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4 flex items-center justify-center shadow-inner relative">
              {product.stock_quantity <= 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                   <span className="bg-red-500 text-white font-black px-4 py-2 rounded-full rotate-12 text-lg shadow-xl border-2 border-white">{t.outOfStock}</span>
                </div>
              )}
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <div className="text-slate-300"><FileText size={64}/></div>
              )}
            </div>
            
            {/* صور مصغرة */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {gallery.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 shrink-0 rounded-xl border-2 overflow-hidden bg-white transition-all ${selectedImage === img ? 'border-blue-600 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* زر البطاقة التقنية للمقاولين (B2B Feature) */}
            <button className="mt-auto w-full py-3 border-2 border-blue-100 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              <FileText size={18} /> {t.techSheet}
            </button>
          </div>

          {/* 📝 القسم الأيسر: التفاصيل والشراء */}
          <div className="w-full lg:w-3/5 p-6 md:p-8 flex flex-col">
            
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100 text-xs font-bold">
                <Star size={14} className="fill-yellow-500" /> 4.8 (124)
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-black text-blue-600 font-mono" dir="ltr">
                {currentPrice.toLocaleString()} <span className="text-lg text-slate-400">{currency}</span>
              </span>
              {currentPrice < product.price && (
                <span className="text-lg text-slate-400 line-through font-bold mb-1" dir="ltr">{product.price.toLocaleString()}</span>
              )}
            </div>

            {/* 🔥 نظام تسعير الجملة (Tier Pricing) */}
            {product.tier_pricing && product.tier_pricing.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                <h4 className="text-xs font-black text-emerald-800 uppercase mb-2 flex items-center gap-1"><Sparkles size={14}/> {t.tierPricing}</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 shadow-sm">
                    1 {t.to} {product.tier_pricing[0].min_qty - 1} {t.units} = {product.price} {currency}
                  </div>
                  {product.tier_pricing.map((tier, idx) => (
                    <div key={idx} className="bg-emerald-600 border border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm shadow-emerald-500/20">
                      +{tier.min_qty} {t.units} = {tier.price} {currency}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* أدوات السلة (الكمية + الزر) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4 mb-8">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-full sm:w-auto justify-between">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><Minus size={18}/></button>
                <input type="number" min="1" max={product.stock_quantity} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-16 text-center font-black text-lg text-slate-800 outline-none bg-transparent" />
                <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><Plus size={18}/></button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="flex-1 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
              >
                <ShoppingCart size={20} />
                {t.addToCart} - {(currentPrice * quantity).toLocaleString()} {currency}
              </button>
            </div>

            {/* التبويبات السفلية */}
            <div className="mt-auto flex border-b border-slate-200 mb-4">
              <button onClick={() => setActiveTab('description')} className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'description' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{t.description}</button>
              <button onClick={() => setActiveTab('reviews')} className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{t.reviews}</button>
              <button onClick={() => setActiveTab('video')} className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'video' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{t.video}</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar text-sm text-slate-600 min-h-[150px]">
              {activeTab === 'description' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="leading-relaxed">{product.long_description || product.name}</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-lg w-fit">
                    <CheckCircle size={16}/> {t.stock} {product.stock_quantity} {product.unit || t.units}
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="animate-fade-in space-y-4">
                  {/* تلخيص الذكاء الاصطناعي السحري */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-xl">
                    <h5 className="font-black text-indigo-800 mb-2 flex items-center gap-1.5"><Sparkles size={16} className="text-purple-500"/> {t.aiSummary}</h5>
                    <p className="text-indigo-900/80 italic font-medium">{t.aiText}</p>
                  </div>
                  <div className="text-center py-6 text-slate-400 font-medium">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50"/>
                    {t.noReviews}
                  </div>
                </div>
              )}

              {activeTab === 'video' && (
                <div className="animate-fade-in h-full flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
                  {product.video_url ? (
                    <p>سيتم تضمين الفيديو هنا (iframe)</p> // مكان رابط يوتيوب الفعلي
                  ) : (
                    <div className="text-center text-slate-400 font-medium">
                      <Play size={40} className="mx-auto mb-2 opacity-50"/>
                      {t.noVideo}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}