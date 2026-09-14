import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ShoppingCart, Search, Filter, Package, 
  Zap, Droplet, PaintRoller, Hammer, 
  ArrowRight, Star, Plus, CheckCircle2, TrendingUp 
} from 'lucide-react';

export default function ContractorMarketplace() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || false;
  const language = context.language || 'ar';
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [addedItem, setAddedItem] = useState(null);

  // 🚀 القاموس الشامل للغات
  const translations = {
    ar: {
      title: "سوق BTP للمواد الأولية",
      subtitle: "اكتشف واطلب أفضل مواد البناء من موردين معتمدين بأسعار تنافسية.",
      searchPlaceholder: "ابحث عن الأسمنت، الحديد، الخشب...",
      categoriesTitle: "التصنيفات",
      all: "الكل",
      cement: "مواد البناء والأسمنت",
      steel: "الحديد والتسليح",
      wood: "الخشب والنجارة",
      plumbing: "السباكة والأنابيب",
      electrical: "الكهرباء والإنارة",
      paint: "الصباغة والعزل",
      addToCart: "أضف للسلة",
      contactSupplier: "تواصل للحجز",
      price: "درهم",
      unit: "للوحدة",
      supplier: "المورد:",
      cartEmpty: "سلتك فارغة",
      itemsInCart: "عناصر في السلة",
      checkout: "إتمام الطلب",
      emptySearch: "لم نجد أي مواد تطابق بحثك.",
      popular: "الأكثر طلباً",
      addedSuccess: "تمت الإضافة بنجاح!"
    },
    fr: {
      title: "Marché BTP des Matières Premières",
      subtitle: "Découvrez et commandez les meilleurs matériaux de construction.",
      searchPlaceholder: "Rechercher ciment, acier, bois...",
      categoriesTitle: "Catégories",
      all: "Tout",
      cement: "Gros œuvre & Ciment",
      steel: "Acier & Armature",
      wood: "Bois & Menuiserie",
      plumbing: "Plomberie & Tuyauterie",
      electrical: "Électricité & Éclairage",
      paint: "Peinture & Isolation",
      addToCart: "Ajouter",
      contactSupplier: "Contacter",
      price: "MAD",
      unit: "/unité",
      supplier: "Fournisseur :",
      cartEmpty: "Panier vide",
      itemsInCart: "articles",
      checkout: "Commander",
      emptySearch: "Aucun produit trouvé.",
      popular: "Populaire",
      addedSuccess: "Ajouté avec succès !"
    },
    en: {
      title: "BTP Raw Materials Market",
      subtitle: "Discover and order the best construction materials from certified suppliers.",
      searchPlaceholder: "Search cement, steel, wood...",
      categoriesTitle: "Categories",
      all: "All",
      cement: "Masonry & Cement",
      steel: "Steel & Rebar",
      wood: "Wood & Carpentry",
      plumbing: "Plumbing & Piping",
      electrical: "Electrical & Lighting",
      paint: "Paint & Insulation",
      addToCart: "Add to Cart",
      contactSupplier: "Contact",
      price: "MAD",
      unit: "/unit",
      supplier: "Supplier:",
      cartEmpty: "Cart is empty",
      itemsInCart: "items in cart",
      checkout: "Checkout",
      emptySearch: "No products found matching your search.",
      popular: "Popular",
      addedSuccess: "Added successfully!"
    }
  };

  const t = translations[language] || translations.ar;

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  // 🚀 تصنيفات السوق
  const categories = [
    { id: 'All', label: t.all, icon: Filter },
    { id: 'Cement', label: t.cement, icon: Package },
    { id: 'Steel', label: t.steel, icon: Hammer },
    { id: 'Wood', label: t.wood, icon: TrendingUp },
    { id: 'Plumbing', label: t.plumbing, icon: Droplet },
    { id: 'Electrical', label: t.electrical, icon: Zap },
    { id: 'Paint', label: t.paint, icon: PaintRoller },
  ];

  // 🚀 بيانات وهمية مبهرة للمواد الأولية
  const mockProducts = [
    { id: 1, name: "Ciment Portland CPJ 45", category: "Cement", price: 75, unit: "Sac 50kg", supplier: "LafargeHolcim", rating: 4.8, isPopular: true, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500&auto=format&fit=crop" },
    { id: 2, name: "Fer à béton (Ø 12mm)", category: "Steel", price: 9.5, unit: "Kg", supplier: "Sonasid", rating: 4.9, isPopular: true, image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop" },
    { id: 3, name: "Briques Rouges (12 Trous)", category: "Cement", price: 2.2, unit: "Unité", supplier: "Briqueterie Nationale", rating: 4.5, isPopular: false, image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500&auto=format&fit=crop" },
    { id: 4, name: "Bois Rouge (Madrier)", category: "Wood", price: 350, unit: "Mètre Cube", supplier: "Bois Maroc", rating: 4.6, isPopular: false, image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500&auto=format&fit=crop" },
    { id: 5, name: "Tube PVC Évacuation (Ø 110)", category: "Plumbing", price: 85, unit: "Barre 6m", supplier: "Plastima", rating: 4.7, isPopular: true, image: "https://images.unsplash.com/photo-1616422321453-62b21008d506?q=80&w=500&auto=format&fit=crop" },
    { id: 6, name: "Câble Électrique (3x2.5mm)", category: "Electrical", price: 320, unit: "Rouleau 100m", supplier: "Nexans", rating: 4.9, isPopular: true, image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=500&auto=format&fit=crop" },
    { id: 7, name: "Peinture Vinyle Blanche", category: "Paint", price: 250, unit: "Pot 30kg", supplier: "Colorado", rating: 4.4, isPopular: false, image: "https://images.unsplash.com/photo-1562259929-b4e1fd3a4b92?q=80&w=500&auto=format&fit=crop" },
    { id: 8, name: "Sable de Construction", category: "Cement", price: 150, unit: "Mètre Cube", supplier: "Carrière Pro", rating: 4.5, isPopular: false, image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=500&auto=format&fit=crop" },
  ];

  useEffect(() => {
    // محاكاة جلب البيانات
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = mockProducts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  return (
    <div className="animate-fade-in pb-32 max-w-7xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-600 rounded-3xl p-6 md:p-10 mb-8 text-center md:text-start flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-teal-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 w-full md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center justify-center md:justify-start gap-3">
            🛒 {t.title}
          </h1>
          <p className="text-teal-50 font-bold text-lg leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        
        {/* Search Bar in Header */}
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
              
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {product.isPopular && (
                  <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                    <TrendingUp size={12}/> {t.popular}
                  </span>
                )}
                
                <span className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} text-white font-black text-lg drop-shadow-md`}>
                  {product.price} {t.price} <span className="text-xs font-medium text-white/80">{t.unit}</span>
                </span>
              </div>

              {/* Details Section */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-black text-lg leading-tight ${textTitle}`}>{product.name}</h3>
                </div>
                
                <div className="flex items-center gap-1 mb-4">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className={`text-xs font-bold ${textMuted}`}>{product.rating}</span>
                </div>

                <div className={`mt-auto pt-4 border-t border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <p className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${textMuted}`}>
                    <Briefcase size={14} className="text-teal-500"/> {t.supplier} <span className={textTitle}>{product.supplier}</span>
                  </p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
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

            </div>
          ))}
        </div>
      )}

      {/* 🚀 Floating Cart */}
      {cart.length > 0 && (
        <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 animate-slide-up`}>
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white">
            <div className="relative">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-inner">
                <ShoppingCart size={24} className="text-white" />
              </div>
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-lg">
                {cart.length}
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-slate-300">{cart.length} {t.itemsInCart}</p>
              <p className="font-black text-lg">{cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()} {t.price}</p>
            </div>
            <button className={`ml-4 px-5 py-2.5 bg-white text-slate-900 hover:bg-teal-50 rounded-xl font-black text-sm transition-colors flex items-center gap-2`}>
              {t.checkout} <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}