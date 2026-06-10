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
      setError(isArabic ? 'لم يتم تحديد المتجر.' : 'Boutique non spécifiée.');
      setLoading(false);
    }
  }, []);

  const fetchVendorStore = async (vId) => {
    try {
      setLoading(true);
      
      // جلب معلومات المورد من جدول suppliers
      const { data: vendorData, error: vendorError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', vId)
        .single();
        
      if (vendorError) throw vendorError;
      setVendorInfo(vendorData);

      // جلب منتجات هذا المورد من جدول products (سنقوم بإنشاء هذا الجدول لاحقاً)
      // وضعنا بيانات وهمية مؤقتاً لكي لا ينهار التطبيق قبل إنشاء الجدول
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', vId);

      // إذا لم يكن الجدول موجوداً بعد، نستخدم بيانات افتراضية للعرض
      if (productsError) {
        setProducts([
          { id: 1, name: 'إسمنت بورتلاند 45 (كيس 50 كجم)', price: 75, category: 'gros-oeuvre', rating: 4.8, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400' },
          { id: 2, name: 'حديد تسليح 12 ملم (طن)', price: 8500, category: 'gros-oeuvre', rating: 4.9, image: 'https://images.unsplash.com/photo-1504307651254-35680f356f58?auto=format&fit=crop&q=80&w=400' },
          { id: 3, name: 'مثقاب كهربائي بوش احترافي', price: 1200, category: 'outillage', rating: 4.5, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400' },
        ]);
      } else {
        setProducts(productsData || []);
      }

    } catch (err) {
      console.error("Error fetching store:", err);
      // استخدام بيانات افتراضية للتجربة أثناء البرمجة
      setVendorInfo({ store_name: 'متجر العينة', city: 'الدار البيضاء', supplier_type: 'wholesale' });
      setProducts([
         { id: 1, name: 'إسمنت بورتلاند 45 (كيس 50 كجم)', price: 75, category: 'gros-oeuvre', rating: 4.8, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(isArabic ? `تمت إضافة ${product.name} للسلة!` : `${product.name} ajouté au panier!`);
  };

  // تصفية المنتجات حسب البحث والتصنيف
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
        <h2 className="text-2xl font-bold text-gray-700">{error}</h2>
        <a href="https://souqbtp.ma/app/marketplace.php" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
          {isArabic ? 'العودة للسوق' : 'Retour au marché'}
        </a>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 font-sans ${isArabic ? 'dir-rtl' : 'dir-ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* 🌟 الهيدر الخاص بمتجر المورد */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2d2252] to-[#4338ca] pt-8 pb-16 px-6 lg:px-12 relative overflow-hidden shadow-lg">
        
        {/* زر العودة للمنصة الأم */}
        <div className="max-w-7xl mx-auto mb-6 relative z-20 flex justify-between items-center">
          <a href="https://souqbtp.ma/app/marketplace.php" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-bold">
             <ArrowRight size={16} className={isArabic ? '' : 'rotate-180'} />
             {isArabic ? 'العودة لسوق المهنيين' : 'Retour au marché'}
          </a>

          {/* أيقونة السلة المؤقتة */}
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
          <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl font-black text-blue-600 mb-4 border-4 border-white/20">
             {vendorInfo?.store_name?.charAt(0) || 'م'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
            {vendorInfo?.store_name || 'متجر مواد البناء'}
          </h1>
          <div className="flex items-center gap-4 text-blue-100 font-medium bg-black/20 px-6 py-2 rounded-full">
            <span className="flex items-center gap-1"><MapPin size={16} /> {vendorInfo?.city || 'المغرب'}</span>
            <span>•</span>
            <span>{vendorInfo?.supplier_type === 'wholesale' ? (isArabic ? 'مورد جملة' : 'Grossiste') : (isArabic ? 'تاجر تجزئة' : 'Détaillant')}</span>
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

        {/* شبكة المنتجات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-yellow-600 shadow-sm flex items-center gap-1">
                  <Star size={12} className="fill-yellow-500" /> {product.rating || '4.5'}
                </div>
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
                  </div>
                  
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-slate-900 hover:bg-blue-600 text-white p-3 rounded-xl transition-colors shadow-md"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold text-lg">
              {isArabic ? 'لا توجد منتجات مطابقة لبحثك في هذا المتجر.' : 'Aucun produit trouvé dans cette boutique.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}