import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { Search, ShoppingCart, Star, MapPin, Package, Zap, Droplets, PenTool, ArrowRight, Loader2, Store } from 'lucide-react';

// التصنيفات الأساسية
const categories = [
  { id: 'all', name: 'الكل', nameFr: 'Tous', icon: <Package size={20} /> },
  { id: 'gros-oeuvre', name: 'مواد البناء الأساسية', nameFr: 'Gros Œuvre', icon: <Package size={20} /> },
  { id: 'electricite', name: 'الكهرباء', nameFr: 'Électricité', icon: <Zap size={20} /> },
  { id: 'plomberie', name: 'السباكة', nameFr: 'Plomberie', icon: <Droplets size={20} /> },
  { id: 'outillage', name: 'المعدات والأدوات', nameFr: 'Outillage', icon: <PenTool size={20} /> },
];

export default function Marketplace() {
  const { language } = useSettingsStore();
  const isArabic = language === 'ar';
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // حالات البيانات
  const [vendorId, setVendorId] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // 1. قراءة معرف المورد من الرابط (URL)
    const queryParams = new URLSearchParams(window.location.search);
    const vId = queryParams.get('vendor');
    
    if (vId) {
      setVendorId(vId);
      fetchVendorStore(vId);
    } else {
      setError(isArabic ? 'لم يتم تحديد المتجر بشكل صحيح.' : 'Boutique non spécifiée.');
      setLoading(false);
    }
  }, []);

  const fetchVendorStore = async (vId) => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب معلومات المورد الحقيقية من جدول suppliers
      const { data: vendorData, error: vendorError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', vId)
        .single();
        
      if (vendorError) throw vendorError;
      setVendorInfo(vendorData);

      // جلب منتجات هذا المورد الحقيقية من جدول products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', vId);

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (err) {
      console.error("Error fetching store data:", err);
      setError(isArabic ? 'تعذر جلب بيانات المتجر أو المورد.' : 'Erreur lors du chargement de la boutique.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    // التحقق من توفر كمية في المخزون قبل الإضافة للسلة
    if (product.stock_quantity <= 0) {
      alert(isArabic ? 'عذراً، هذا المنتج غير متوفر في المخزون حالياً!' : 'Ce produit est en rupture de stock!');
      return;
    }
    setCart([...cart, product]);
    alert(isArabic ? `تمت إضافة ${product.name} للسلة!` : `${product.name} ajouté au panier!`);
  };

  // تصفية المنتجات حسب البحث والتصنيف المختار
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error && !vendorInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Store size={64} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">{error}</h2>
        <a href="https://souqbtp.ma/app/marketplace.php" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
          {isArabic ? 'العودة للسوق الأب' : 'Retour au marché'}
        </a>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 font-sans ${isArabic ? 'dir-rtl' : 'dir-ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* الهيدر الخاص بمتجر المورد الديناميكي */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2d2252] to-[#4338ca] pt-8 pb-16 px-6 lg:px-12 relative overflow-hidden shadow-lg">
        
        {/* شريط الأزرار العلوية للعودة والسلة */}
        <div className="max-w-7xl mx-auto mb-6 relative z-20 flex justify-between items-center">
          <a href="https://souqbtp.ma/app/marketplace.php" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-bold">
             <ArrowRight size={16} className={isArabic ? '' : 'rotate-180'} />
             {isArabic ? 'العودة لسوق المهنيين' : 'Retour au marché'}
          </a>

          <div className="relative bg-white/10 p-3 rounded-full text-white cursor-pointer hover:bg-white/20 transition-all">
             <ShoppingCart size={24} />
             {cart.length > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                 {cart.length}
               </span>
             )}
          </div>
        </div>

        {/* عرض بيانات المورد المستخرجة من جدول suppliers */}
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl font-black text-blue-600 mb-4 border-4 border-white/20 overflow-hidden">
             {vendorInfo?.store_name ? vendorInfo.store_name.charAt(0).toUpperCase() : 'M'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
            {vendorInfo?.store_name || 'متجر مواد البناء'}
          </h1>
          <div className="flex items-center gap-4 text-blue-100 font-medium bg-black/20 px-6 py-2 rounded-full">
            <span className="flex items-center gap-1"><MapPin size={16} /> {vendorInfo?.city || 'المغرب'}</span>
            <span>•</span>
            <span className="font-bold">
              {vendorInfo?.supplier_type === 'wholesale' ? (isArabic ? 'مورد جملة (B2B)' : 'Grossiste B2B') : (isArabic ? 'تاجر تجزئة' : 'Détaillant')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-8 relative z-20 pb-20">
        
        {/* شريط البحث والتصنيفات */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center border border-gray-100">
          
          <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full lg:w-auto pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {cat.icon}
                {isArabic ? cat.name : cat.nameFr}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <input 
              type="text" 
              placeholder={isArabic ? "ابحث في منتجات المتجر..." : "Chercher un produit..."}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
        </div>

        {/* شبكة المنتجات الحقيقية المستخرجة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
              
              <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100 border border-gray-50 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={40} className="text-slate-300" />
                )}
                
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-yellow-600 shadow-sm flex items-center gap-1">
                  <Star size={12} className="fill-yellow-500" /> 4.5
                </div>

                {/* قناع حماية في حال نفاد المخزون */}
                {product.stock_quantity <= 0 && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                      {isArabic ? 'نفذ من المخزون' : 'Rupture'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                
                <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-2xl font-black text-blue-600 leading-none">
                      {product.price} <span className="text-sm font-bold text-gray-500">MAD</span>
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">
                      {isArabic ? `المخزون: ${product.stock_quantity}` : `Stock: ${product.stock_quantity}`}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity <= 0}
                    className={`p-3 rounded-xl transition-colors shadow-md ${
                      product.stock_quantity <= 0 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-slate-900 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Package size={54} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold text-lg">
              {isArabic ? 'لا توجد سلع متوفرة حالياً في هذا القسم.' : 'Aucun produit disponible dans cette catégorie.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}