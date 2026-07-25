import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { Search, ShoppingCart, Star, MapPin, Package, Zap, Droplets, PenTool, ArrowRight, Loader2, Store } from 'lucide-react';

const translations = {
  ar: {
    storeNotSpecified: 'لم يتم تحديد المتجر بشكل صحيح.',
    fetchError: 'تعذر جلب بيانات المتجر أو المورد.',
    outOfStockAlert: 'عذراً، هذا المنتج غير متوفر في المخزون حالياً!',
    addedToCart: 'تمت إضافة {product} للسلة!',
    backToMarket: 'العودة لسوق المهنيين',
    defaultStore: 'متجر مواد البناء',
    defaultCity: 'المغرب',
    wholesaler: 'مورد جملة (B2B)',
    retailer: 'تاجر تجزئة',
    searchPlaceholder: 'ابحث في منتجات المتجر...',
    outOfStock: 'نفذ من المخزون',
    stock: 'المخزون:',
    noProducts: 'لا توجد سلع متوفرة حالياً في هذا القسم.',
    currency: 'درهم',
    categories: {
      all: 'الكل',
      grosOeuvre: 'مواد البناء الأساسية',
      electricite: 'الكهرباء',
      plomberie: 'السباكة',
      outillage: 'المعدات والأدوات'
    }
  },
  fr: {
    storeNotSpecified: 'Boutique non spécifiée.',
    fetchError: 'Erreur lors du chargement de la boutique.',
    outOfStockAlert: 'Ce produit est en rupture de stock !',
    addedToCart: '{product} ajouté au panier !',
    backToMarket: 'Retour au marché',
    defaultStore: 'Magasin de Matériaux',
    defaultCity: 'Maroc',
    wholesaler: 'Grossiste B2B',
    retailer: 'Détaillant',
    searchPlaceholder: 'Chercher un produit...',
    outOfStock: 'Rupture',
    stock: 'Stock:',
    noProducts: 'Aucun produit disponible dans cette catégorie.',
    currency: 'MAD',
    categories: {
      all: 'Tous',
      grosOeuvre: 'Gros Œuvre',
      electricite: 'Électricité',
      plomberie: 'Plomberie',
      outillage: 'Outillage'
    }
  },
  en: {
    storeNotSpecified: 'Store not specified correctly.',
    fetchError: 'Error loading store data.',
    outOfStockAlert: 'Sorry, this product is currently out of stock!',
    addedToCart: '{product} added to cart!',
    backToMarket: 'Back to Marketplace',
    defaultStore: 'Building Materials Store',
    defaultCity: 'Morocco',
    wholesaler: 'Wholesaler (B2B)',
    retailer: 'Retailer',
    searchPlaceholder: 'Search for products...',
    outOfStock: 'Out of Stock',
    stock: 'Stock:',
    noProducts: 'No products currently available in this category.',
    currency: 'MAD',
    categories: {
      all: 'All',
      grosOeuvre: 'Heavy Construction',
      electricite: 'Electricity',
      plomberie: 'Plumbing',
      outillage: 'Tools & Hardware'
    }
  }
};

export default function Marketplace() {
  const { language } = useSettingsStore();
  const t = translations[language] || translations['fr'];
  const isArabic = language === 'ar';
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [vendorId, setVendorId] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  const categories = [
    { id: 'all', name: t.categories.all, icon: <Package size={20} /> },
    { id: 'gros-oeuvre', name: t.categories.grosOeuvre, icon: <Package size={20} /> },
    { id: 'electricite', name: t.categories.electricite, icon: <Zap size={20} /> },
    { id: 'plomberie', name: t.categories.plomberie, icon: <Droplets size={20} /> },
    { id: 'outillage', name: t.categories.outillage, icon: <PenTool size={20} /> },
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const vId = queryParams.get('vendor');
    
    if (vId) {
      setVendorId(vId);
      fetchVendorStore(vId);
    } else {
      setError(t.storeNotSpecified);
      setLoading(false);
    }
  }, [language]);

  const fetchVendorStore = async (vId) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: vendorData, error: vendorError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', vId)
        .single();
        
      if (vendorError) throw vendorError;
      setVendorInfo(vendorData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', vId);

      if (productsError) throw productsError;
      
      // 🎯 السحر هنا: فلترة مخزون المورد لكي نعرض في واجهة المتجر "المنتجات النهائية" فقط
      const finishedGoodsOnly = (productsData || []).filter(p => (p.item_type || 'finished_good') === 'finished_good');
      setProducts(finishedGoodsOnly);

    } catch (err) {
      console.error("Error fetching store data:", err);
      setError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      alert(t.outOfStockAlert);
      return;
    }
    setCart([...cart, product]);
    alert(t.addedToCart.replace('{product}', product.name));
  };

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
        <Store size={64} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">{error}</h2>
        <a href="https://souqbtp.ma/app/marketplace.php" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl font-bold">
          {t.backToMarket}
        </a>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 font-sans`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2d2252] to-[#4338ca] pt-8 pb-16 px-6 lg:px-12 relative overflow-hidden shadow-lg">
        
        <div className="max-w-7xl mx-auto mb-6 relative z-20 flex justify-between items-center">
          <a href="https://souqbtp.ma/app/marketplace.php" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-bold">
             <ArrowRight size={16} className={isArabic ? '' : 'rotate-180'} />
             {t.backToMarket}
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

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl font-black text-blue-600 mb-4 border-4 border-white/20 overflow-hidden uppercase">
             {vendorInfo?.store_name ? vendorInfo.store_name.charAt(0) : 'M'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
            {vendorInfo?.store_name || t.defaultStore}
          </h1>
          <div className="flex items-center gap-4 text-blue-100 font-medium bg-black/20 px-6 py-2 rounded-full">
            <span className="flex items-center gap-1"><MapPin size={16} /> {vendorInfo?.city || t.defaultCity}</span>
            <span>•</span>
            <span className="font-bold">
              {vendorInfo?.supplier_type === 'wholesale' ? t.wholesaler : t.retailer}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-8 relative z-20 pb-20">
        
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
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className={`w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            {/* 🎯 تم إصلاح onChange هنا لتعمل مع searchQuery بدلاً من setSearchTerm */}
            <Search className={`absolute top-3 text-gray-400 ${isArabic ? 'right-3' : 'left-3'}`} size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative group">
              
              <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100 border border-gray-50 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <Package size={40} className="text-slate-300 transition-transform duration-500 group-hover:scale-110" />
                )}
                
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-yellow-600 shadow-sm flex items-center gap-1">
                  <Star size={12} className="fill-yellow-500" /> 4.5
                </div>

                {product.stock_quantity <= 0 && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-red-400">
                      {t.outOfStock}
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
                    <p className="text-2xl font-black text-blue-600 leading-none font-mono" dir="ltr">
                      {Number(product.price).toLocaleString()} <span className="text-sm font-bold text-gray-500 uppercase">{t.currency}</span>
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">
                      {t.stock} {product.stock_quantity}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity <= 0}
                    className={`p-3 rounded-xl transition-all ${
                      product.stock_quantity <= 0 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-slate-900 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30'
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
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Package size={54} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold text-lg">
              {t.noProducts}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}