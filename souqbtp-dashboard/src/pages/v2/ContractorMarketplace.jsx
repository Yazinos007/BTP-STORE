import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ShoppingCart, Search, Filter, Package, 
  Zap, Droplet, PaintRoller, Hammer, 
  ArrowRight, Star, Plus, CheckCircle2, TrendingUp, Briefcase,
  Store, Coins, Globe, Bitcoin, Tag, Minus, MessageCircle, X, Trash2
} from 'lucide-react';

// 🚀 دوال العملات العالمية
const getCurrencySymbol = (curr) => {
  const symbols = { MAD: 'MAD', USD: '$', EUR: '€', SAR: 'SAR', AED: 'AED', KWD: 'KWD', CNY: '¥', INR: '₹', CHF: 'CHF', RUB: '₽', USDT: '₮', BTC: '₿', ETH: '⟠', SOL: '◎', ICX: '🌐', OM: '🏢', BST: '🧱', ALGO: '⚙️', BRICS: '🤝' };
  return symbols[curr] || curr;
};

const getCurrencyIcon = (curr) => {
  if(['BTC', 'ETH', 'SOL', 'ICX', 'OM', 'BST', 'ALGO'].includes(curr)) return <Bitcoin size={16} className="text-amber-500"/>;
  if(['USDT', 'USDC'].includes(curr)) return <Coins size={16} className="text-emerald-500"/>;
  if(curr === 'BRICS') return <Globe size={16} className="text-blue-500"/>;
  if(curr === 'USD') return <span className="font-black text-xs">🇺🇸</span>;
  if(curr === 'EUR') return <span className="font-black text-xs">🇪🇺</span>;
  if(curr === 'SAR') return <span className="font-black text-xs">🇸🇦</span>;
  if(curr === 'AED') return <span className="font-black text-xs">🇦🇪</span>;
  if(curr === 'KWD') return <span className="font-black text-xs">🇰🇼</span>;
  if(curr === 'CNY') return <span className="font-black text-xs">🇨🇳</span>;
  if(curr === 'INR') return <span className="font-black text-xs">🇮🇳</span>;
  if(curr === 'CHF') return <span className="font-black text-xs">🇨🇭</span>;
  if(curr === 'RUB') return <span className="font-black text-xs">🇷🇺</span>;
  return <span className="font-black text-xs">🇲🇦</span>;
};

export default function ContractorMarketplace() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || false;
  const language = context.language || 'ar';
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  
  // 🚀 حالة السلة أصبحت معقدة لتحمل الكميات
  const [cart, setCart] = useState([]); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  // 🚀 القاموس المحدث بجميع كلمات السلة الجديدة
  const translations = {
    ar: {
      title: "سوق BTP للمواد الأولية", subtitle: "اكتشف واطلب أفضل مواد البناء من موردين معتمدين بأسعار تنافسية.",
      searchPlaceholder: "ابحث عن الأسمنت، الحديد، الخشب...", categoriesTitle: "التصنيفات",
      all: "الكل", cement: "مواد البناء والأسمنت", steel: "الحديد والتسليح", wood: "الخشب والنجارة",
      plumbing: "السباكة والأنابيب", electrical: "الكهرباء والإنارة", paint: "الصباغة والعزل",
      addToCart: "أضف للسلة", retail: "تقسيط:", wholesale: "جملة:",
      supplier: "المورد:", cartEmpty: "سلتك فارغة", itemsInCart: "عناصر في السلة",
      checkout: "إتمام الطلب", emptySearch: "لم نجد أي مواد تطابق بحثك.",
      popular: "الأكثر طلباً", addedSuccess: "تمت الإضافة بنجاح!", openStore: "فتح متجري (لوحة البائع) 📦",
      multiCartDesc: "سلة متعددة الموردين والعملات", cartTitle: "سلة المشتريات المجزأة",
      qty: "الكمية:", total: "المجموع:", orderFrom: "التفاوض والطلب من",
      wholesaleActivated: "🎉 مبروك! تم تفعيل سعر الجملة",
      categories: { Cement: "مواد البناء والأسمنت", Steel: "الحديد والتسليح", Wood: "الخشب والنجارة", Plumbing: "السباكة والأنابيب", Electrical: "الكهرباء والإنارة", Paint: "الصباغة والعزل" }
    },
    fr: {
      title: "Marché BTP des Matières Premières", subtitle: "Découvrez et commandez les meilleurs matériaux de construction.",
      searchPlaceholder: "Rechercher ciment, acier, bois...", categoriesTitle: "Catégories",
      all: "Tout", cement: "Gros œuvre & Ciment", steel: "Acier & Armature", wood: "Bois & Menuiserie",
      plumbing: "Plomberie & Tuyauterie", electrical: "Électricité & Éclairage", paint: "Peinture & Isolation",
      addToCart: "Ajouter", retail: "Détail :", wholesale: "Gros :",
      supplier: "Fournisseur :", cartEmpty: "Panier vide", itemsInCart: "articles",
      checkout: "Voir le Panier", emptySearch: "Aucun produit trouvé.",
      popular: "Populaire", addedSuccess: "Ajouté avec succès !", openStore: "Mon Magasin (Vendeur) 📦",
      multiCartDesc: "Panier multi-fournisseurs et devises", cartTitle: "Panier d'achats groupé",
      qty: "Qté :", total: "Total :", orderFrom: "Négocier & Commander chez",
      wholesaleActivated: "🎉 Félicitations ! Prix de gros activé",
      categories: { Cement: "Gros œuvre & Ciment", Steel: "Acier & Armature", Wood: "Bois & Menuiserie", Plumbing: "Plomberie & Tuyauterie", Electrical: "Électricité & Éclairage", Paint: "Peinture & Isolation" }
    },
    en: {
      title: "BTP Raw Materials Market", subtitle: "Discover and order the best construction materials from certified suppliers.",
      searchPlaceholder: "Search cement, steel, wood...", categoriesTitle: "Categories",
      all: "All", cement: "Masonry & Cement", steel: "Steel & Rebar", wood: "Wood & Carpentry",
      plumbing: "Plumbing & Piping", electrical: "Electrical & Lighting", paint: "Paint & Insulation",
      addToCart: "Add to Cart", retail: "Retail:", wholesale: "Wholesale:",
      supplier: "Supplier:", cartEmpty: "Cart is empty", itemsInCart: "items in cart",
      checkout: "View Cart", emptySearch: "No products found matching your search.",
      popular: "Popular", addedSuccess: "Added successfully!", openStore: "My Store (Vendor) 📦",
      multiCartDesc: "Multi-supplier & multi-currency cart", cartTitle: "Split Shopping Cart",
      qty: "Qty:", total: "Total:", orderFrom: "Negotiate & Order from",
      wholesaleActivated: "🎉 Congrats! Wholesale price activated",
      categories: { Cement: "Masonry & Cement", Steel: "Steel & Rebar", Wood: "Wood & Carpentry", Plumbing: "Plumbing & Piping", Electrical: "Electrical & Lighting", Paint: "Paint & Insulation" }
    }
  };

  const t = translations[language] || translations.ar;
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const categories = [
    { id: 'All', label: t.all, icon: Filter },
    { id: 'Cement', label: t.cement, icon: Package },
    { id: 'Steel', label: t.steel, icon: Hammer },
    { id: 'Wood', label: t.wood, icon: TrendingUp },
    { id: 'Plumbing', label: t.plumbing, icon: Droplet },
    { id: 'Electrical', label: t.electrical, icon: Zap },
    { id: 'Paint', label: t.paint, icon: PaintRoller },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadMarketplace = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('marketplace_products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          if (isMounted) setProducts(data);
        } else {
          if (isMounted) setProducts([
            { id: 1, name: "Ciment Portland CPJ 45", category: "Cement", price_retail: 75, price_wholesale: 70, min_wholesale_qty: 100, unit: "Sac 50kg", currency: "MAD", supplier: "LafargeHolcim", rating: 4.8, isPopular: true, image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500&auto=format&fit=crop" },
            { id: 2, name: "Fer à béton (Ø 12mm)", category: "Steel", price_retail: 9.5, price_wholesale: 8.8, min_wholesale_qty: 500, unit: "Kg", currency: "MAD", supplier: "Sonasid", rating: 4.9, isPopular: true, image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop" },
            { id: 3, name: "Bitumen Premium (Export)", category: "Paint", price_retail: 350, price_wholesale: 300, min_wholesale_qty: 50, unit: "Tonne", currency: "USDT", supplier: "Global BTP", rating: 4.7, isPopular: true, image_url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=500&auto=format&fit=crop" },
            { id: 4, name: "Câble Électrique (3x2.5mm)", category: "Electrical", price_retail: 320, price_wholesale: 290, min_wholesale_qty: 20, unit: "Rouleau 100m", currency: "AED", supplier: "Nexans", rating: 4.9, isPopular: false, image_url: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=500&auto=format&fit=crop" }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadMarketplace();
    return () => { isMounted = false; };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.supplier && p.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  // 🚀 إضافة للسلة مع دعم الكميات
  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // 🚀 تجميع السلة حسب المورد
  const groupedCart = cart.reduce((groups, item) => {
    const supplier = item.product.supplier || 'Vendeur Indépendant';
    if (!groups[supplier]) groups[supplier] = [];
    groups[supplier].push(item);
    return groups;
  }, {});

  return (
    <div className="animate-fade-in pb-32 max-w-7xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-600 rounded-3xl p-6 md:p-10 mb-8 text-center md:text-start flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-teal-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 w-full md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center justify-center md:justify-start gap-3">
            🛒 {t.title}
          </h1>
          <p className="text-teal-50 font-bold text-lg leading-relaxed mb-6">
            {t.subtitle}
          </p>
          <div className="flex justify-center md:justify-start">
            <Link to="/v2/store-manager" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-black shadow-lg backdrop-blur-md transition-all border border-white/30 hover:-translate-y-1">
               <Store size={18}/> {t.openStore}
            </Link>
          </div>
        </div>
        
        <div className="relative z-10 w-full md:w-1/3">
          <div className="relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-slate-400`} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className={`w-full py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-white/20 transition-all font-bold shadow-lg ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-teal-100`} 
            />
          </div>
        </div>
      </div>

      {/* 🚀 Categories Filter */}
      <div className="mb-8">
        <div className="flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`snap-start shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-300 border-2 ${
                  isActive 
                    ? 'bg-teal-500 border-teal-500 text-white shadow-[0_10px_20px_rgba(20,184,166,0.3)] transform -translate-y-1' 
                    : `${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-teal-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400'} shadow-sm hover:-translate-y-0.5`
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-teal-500'} /> {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🚀 Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <h3 className="font-black text-xl mb-2">{t.emptySearch}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className={`group relative rounded-3xl border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500 hover:shadow-[0_10px_30px_rgba(20,184,166,0.2)]' : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-[0_10px_30px_rgba(20,184,166,0.15)] shadow-sm'}`}>
              
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={product.image_url || product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {product.isPopular && (
                  <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                    <TrendingUp size={12}/> {t.popular}
                  </span>
                )}
                
                <span className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black px-2.5 py-1 rounded-full border border-white flex items-center gap-1 shadow-lg`}>
                  {getCurrencyIcon(product.currency || 'MAD')} {product.currency || 'MAD'}
                </span>
                
                <span className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} text-white font-bold text-sm drop-shadow-md bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm`}>
                  {product.unit}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className={`font-black text-lg leading-tight mb-2 ${textTitle}`}>{product.name}</h3>
                
                <div className="flex items-center gap-1 mb-4">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className={`text-xs font-bold ${textMuted}`}>{product.rating || '4.5'}</span>
                  <span className={`text-[10px] mx-2 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 ${textMuted}`}>
                    {t.categories?.[product.category] || product.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-[10px] font-bold ${textMuted}`}>{t.retail}</p>
                    <p className="font-black text-blue-500" dir="ltr">{product.price_retail} {getCurrencySymbol(product.currency || 'MAD')}</p>
                  </div>
                  <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                    <p className="text-[10px] font-bold text-indigo-500">{t.wholesale} <span className="opacity-70">(+{product.min_wholesale_qty})</span></p>
                    <p className="font-black text-indigo-600" dir="ltr">{product.price_wholesale} {getCurrencySymbol(product.currency || 'MAD')}</p>
                  </div>
                </div>

                <div className={`mt-auto pt-4 border-t border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <p className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${textMuted}`}>
                    <Briefcase size={14} className="text-teal-500"/> {t.supplier} <span className={textTitle}>{product.supplier || 'Vendeur Indépendant'}</span>
                  </p>
                  
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      addedItem === product.id 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30 hover:-translate-y-0.5'
                    }`}
                  >
                    {addedItem === product.id ? <><CheckCircle2 size={16}/> {t.addedSuccess}</> : <><Plus size={16}/> {t.addToCart}</>}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 🚀 Floating Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-40 animate-slide-up`}>
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsCartOpen(true)}>
            <div className="relative">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-inner">
                <ShoppingCart size={24} className="text-white" />
              </div>
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-lg">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-slate-300">{cart.length} {t.itemsInCart}</p>
              <p className="font-black text-sm text-teal-400">{t.multiCartDesc}</p>
            </div>
            <button className={`ml-4 px-5 py-2.5 bg-white text-slate-900 hover:bg-teal-50 rounded-xl font-black text-sm transition-colors flex items-center gap-2`}>
              {t.checkout} <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      )}

      {/* 🚀 The Smart Split Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
          <div 
            className={`h-full w-full max-w-lg shadow-2xl overflow-y-auto flex flex-col animate-slide-in ${isDarkMode ? 'bg-slate-900 border-l border-slate-800' : 'bg-slate-50 border-l border-slate-200'}`} 
            onClick={e => e.stopPropagation()}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Cart Header */}
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 z-10 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md`}>
              <h2 className={`text-xl font-black flex items-center gap-2 ${textTitle}`}>
                <ShoppingCart className="text-teal-500"/> {t.cartTitle}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><X size={20}/></button>
            </div>

            {/* Cart Body - Split by Supplier */}
            <div className="p-6 space-y-8 flex-1">
              {Object.entries(groupedCart).map(([supplierName, items]) => (
                <div key={supplierName} className={`rounded-3xl border-2 overflow-hidden shadow-lg ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                  {/* Supplier Header */}
                  <div className={`p-4 border-b flex items-center gap-3 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-500 flex items-center justify-center"><Store size={20}/></div>
                    <div>
                      <p className={`text-xs font-bold ${textMuted}`}>{t.supplier}</p>
                      <h3 className={`font-black ${textTitle}`}>{supplierName}</h3>
                    </div>
                  </div>

                  {/* Supplier Items */}
                  <div className="p-4 space-y-4">
                    {items.map(item => {
                      const isWholesale = item.qty >= item.product.min_wholesale_qty;
                      const activePrice = isWholesale ? item.product.price_wholesale : item.product.price_retail;
                      const itemTotal = activePrice * item.qty;
                      const symbol = getCurrencySymbol(item.product.currency || 'MAD');

                      return (
                        <div key={item.product.id} className={`p-3 rounded-2xl border transition-colors ${isWholesale ? 'border-emerald-500/50 bg-emerald-500/5' : isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                          <div className="flex gap-4">
                            <img src={item.product.image_url || item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover" />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className={`font-bold text-sm leading-tight ${textTitle}`}>{item.product.name}</h4>
                                <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                              <p className={`text-xs mt-1 ${textMuted}`}>{item.product.unit}</p>
                              
                              {/* 🚀 التسعير الديناميكي */}
                              <div className="mt-2 flex items-end justify-between">
                                <div>
                                  {isWholesale ? (
                                    <div className="animate-fade-in">
                                      <span className="text-[10px] text-slate-400 line-through mr-2" dir="ltr">{item.product.price_retail} {symbol}</span>
                                      <span className="font-black text-emerald-500" dir="ltr">{activePrice} {symbol}</span>
                                    </div>
                                  ) : (
                                    <span className="font-black text-blue-500" dir="ltr">{activePrice} {symbol}</span>
                                  )}
                                </div>
                                
                                {/* أزرار الكمية */}
                                <div className={`flex items-center gap-3 px-2 py-1 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                                  <button onClick={() => updateQuantity(item.product.id, item.qty - 1)} className="text-slate-400 hover:text-blue-500"><Minus size={14}/></button>
                                  <span className={`font-black text-sm w-6 text-center ${textTitle}`}>{item.qty}</span>
                                  <button onClick={() => updateQuantity(item.product.id, item.qty + 1)} className="text-slate-400 hover:text-blue-500"><Plus size={14}/></button>
                                </div>
                              </div>

                              {isWholesale && (
                                <p className="text-[10px] font-bold text-emerald-500 mt-2 bg-emerald-500/10 inline-block px-2 py-1 rounded">
                                  {t.wholesaleActivated}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* 🚀 زر التفاوض للمورد */}
                  <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <p className={`text-xs font-bold ${textMuted}`}>{t.total}</p>
                      {/* احتساب المجموع بناءً على العملة الخاصة بهذا المورد */}
                      <p className="font-black text-lg text-emerald-500" dir="ltr">
                        {items.reduce((sum, item) => sum + ((item.qty >= item.product.min_wholesale_qty ? item.product.price_wholesale : item.product.price_retail) * item.qty), 0).toLocaleString()} {getCurrencySymbol(items[0].product.currency || 'MAD')}
                      </p>
                    </div>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-black/10">
                      <MessageCircle size={16}/> {t.orderFrom}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        @keyframes slide-in { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}