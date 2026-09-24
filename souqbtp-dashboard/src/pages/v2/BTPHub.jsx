import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import SupplierProfile from '../../components/v2/SupplierProfile';
import ProjectCart from '../../components/v2/ProjectCart';
import { 
  Search, Mic, Camera, FileText, MapPin, CheckCircle, Clock, Star, 
  ShieldCheck, ShoppingCart, Filter, Package, Zap, Droplet, PaintRoller, 
  Hammer, ArrowRight, Plus, CheckCircle2, TrendingUp, Briefcase,
  Store, Coins, Globe, Bitcoin, Minus, MessageCircle, X, Trash2, Building2
} from 'lucide-react';

const getCurrencySymbol = (curr) => {
  const symbols = { MAD: 'MAD', USD: '$', EUR: '€', SAR: 'SAR', AED: 'AED', KWD: 'KWD', CNY: '¥', INR: '₹', CHF: 'CHF', USDT: '₮', BTC: '₿', ETH: '⟠', SOL: '◎', ICX: '🌐', OM: '🏢', BST: '🧱', ALGO: '⚙️', BRICS: '🤝' };
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
  return <span className="font-black text-xs">🇲🇦</span>;
};

export default function BTPHub() {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || false;
  const language = context.language || 'fr';
  const isRtl = language === 'ar';

  const [activeMode, setActiveMode] = useState('materiaux');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  const translations = {
    ar: {
      searchPlaceholder: "ماذا تحتاج لمشروعك؟ ابحث عن الأسمنت، الحديد، مقاول...",
      categoriesTitle: "التصنيفات",
      all: "الكل", cement: "مواد البناء والأسمنت", steel: "الحديد والتسليح", wood: "الخشب والنجارة",
      plumbing: "السباكة والأنابيب", electrical: "الكهرباء والإنارة", paint: "الصباغة والعزل",
      addToCart: "أضف للمشروع", retail: "تقسيط:", wholesale: "جملة:",
      supplier: "المورد:", cartEmpty: "مشروعك فارغ", itemsInCart: "عناصر",
      checkout: "إتمام الطلب", emptySearch: "لم نجد ما يطابق بحثك.",
      popular: "الأكثر طلباً", addedSuccess: "تمت الإضافة!", openStore: "فتح متجري",
      multiCartDesc: "سلة مشروع متعددة الموردين", cartTitle: "سلة المشروع",
      qty: "الكمية:", total: "المجموع:", orderFrom: "طلب وعروض أسعار",
      wholesaleActivated: "🎉 تم تفعيل سعر الجملة",
      modes: { 
        materiaux: "المواد", services: "الخدمات", experts: "الخبراء", machines: "المعدات",
        maintenance: "صيانة", transport: "نقل", documents: "وثائق", companies: "شركات"
      },
      services: {
        interventions: "التدخلات", completed: "مكتملة",
        response: "الاستجابة", responseTime: "< 15 دقيقة",
        basePrice: "السعر الأساسي", startingFrom: "ابتداءً من",
        viewProfile: "عرض الملف", requestQuote: "طلب عرض سعر",
        specialty: "كهرباء المباني"
      },
      experts: {
        experience: "12 سنة من الخبرة",
        skill1: "تصميم ورخص", skill2: "تتبع الورش",
        book: "أخذ موعد", badge: "مهندس معماري"
      },
      machines: {
        available: "متاح:", details: "مع مشغل • نقل (18كم)",
        day: "يوم", week: "أسبوع", book: "حجز"
      },
      transport: { capacity: "الحمولة:", route: "المسار المتاح:", book: "طلب شاحنة", price: "درهم / كم" },
      maintenance: { type: "نوع الصيانة:", response: "الاستجابة:", book: "طلب فريق صيانة" },
      documents: { time: "مدة الإنجاز:", type: "الخدمة:", request: "طلب الوثيقة" },
      companies: { projects: "مشروع منجز", verify: "شركة معتمدة", contact: "التواصل مع الشركة" },
      rfq: {
        title: "لم أجد ما أبحث عنه",
        desc: "صف احتياجك بدقة وتلقى عروضاً من موردينا المعتمدين.",
        btn: "صف احتياجك"
      }
    },
    fr: {
      searchPlaceholder: "Que recherchez-vous pour votre chantier ?", 
      categoriesTitle: "Catégories",
      all: "Tout", cement: "Gros œuvre & Ciment", steel: "Acier & Armature", wood: "Bois & Menuiserie",
      plumbing: "Plomberie & Tuyauterie", electrical: "Électricité & Éclairage", paint: "Peinture & Isolation",
      addToCart: "Ajouter au projet", retail: "Détail :", wholesale: "Gros :",
      supplier: "Fournisseur :", cartEmpty: "Projet vide", itemsInCart: "éléments",
      checkout: "Voir le Projet", emptySearch: "Aucun résultat trouvé.",
      popular: "Populaire", addedSuccess: "Ajouté !", openStore: "Mon Magasin",
      multiCartDesc: "Panier de projet multi-fournisseurs", cartTitle: "Panier du Projet",
      qty: "Qté :", total: "Total :", orderFrom: "Demander devis & Commander",
      wholesaleActivated: "🎉 Prix de gros activé",
      modes: { 
        materiaux: "Matériaux", services: "Services", experts: "Experts", machines: "Machines",
        maintenance: "Maintenance", transport: "Transport", documents: "Documents", companies: "Entreprises"
      },
      services: {
        interventions: "Interventions", completed: "complétées",
        response: "Réponse", responseTime: "< 15 mins",
        basePrice: "Tarif de base", startingFrom: "À partir de",
        viewProfile: "Voir profil", requestQuote: "Demander devis",
        specialty: "Électricité bâtiment"
      },
      experts: {
        experience: "12 ans d'expérience",
        skill1: "Conception & Permis", skill2: "Suivi de chantier",
        book: "Prendre rendez-vous", badge: "Architecte DPLG"
      },
      machines: {
        available: "Dispo:", details: "Avec opérateur • Transport (18km)",
        day: "Jour", week: "Semaine", book: "Réserver"
      },
      transport: { capacity: "Capacité :", route: "Trajet :", book: "Commander Camion", price: "MAD / km" },
      maintenance: { type: "Type :", response: "Intervention :", book: "Demander Équipe" },
      documents: { time: "Délai :", type: "Service :", request: "Demander Document" },
      companies: { projects: "Projets livrés", verify: "Entreprise Vérifiée", contact: "Contacter l'Entreprise" },
      rfq: {
        title: "Je ne trouve pas ce que je cherche",
        desc: "Décrivez votre besoin exact et recevez des offres de nos fournisseurs vérifiés.",
        btn: "Décrivez votre besoin"
      }
    },
    en: {
      searchPlaceholder: "What do you need for your project? Search cement, steel...",
      categoriesTitle: "Categories",
      all: "All", cement: "Masonry & Cement", steel: "Steel & Rebar", wood: "Wood & Carpentry",
      plumbing: "Plumbing & Piping", electrical: "Electrical & Lighting", paint: "Paint & Insulation",
      addToCart: "Add to Project", retail: "Retail:", wholesale: "Wholesale:",
      supplier: "Supplier:", cartEmpty: "Project is empty", itemsInCart: "items",
      checkout: "View Project", emptySearch: "No results found.",
      popular: "Popular", addedSuccess: "Added!", openStore: "My Store",
      multiCartDesc: "Multi-supplier project cart", cartTitle: "Project Cart",
      qty: "Qty:", total: "Total:", orderFrom: "Request Quote & Order",
      wholesaleActivated: "🎉 Wholesale price activated",
      modes: { 
        materiaux: "Materials", services: "Services", experts: "Experts", machines: "Machines",
        maintenance: "Maintenance", transport: "Transport", documents: "Documents", companies: "Companies"
      },
      services: {
        interventions: "Jobs", completed: "completed",
        response: "Response time", responseTime: "< 15 mins",
        basePrice: "Base rate", startingFrom: "Starting from",
        viewProfile: "View Profile", requestQuote: "Request Quote",
        specialty: "Building Electricity"
      },
      experts: {
        experience: "12 years of experience",
        skill1: "Design & Permits", skill2: "Site Supervision",
        book: "Book Appointment", badge: "Certified Architect"
      },
      machines: {
        available: "Available:", details: "With operator • Transport (18km)",
        day: "Day", week: "Week", book: "Book"
      },
      transport: { capacity: "Capacity:", route: "Route:", book: "Request Truck", price: "MAD / km" },
      maintenance: { type: "Type:", response: "Response:", book: "Request Team" },
      documents: { time: "Timeframe:", type: "Service:", request: "Request Document" },
      companies: { projects: "Completed Projects", verify: "Verified Company", contact: "Contact Company" },
      rfq: {
        title: "I can't find what I'm looking for",
        desc: "Describe your exact need and receive offers from our verified suppliers.",
        btn: "Describe your need"
      }
    }
  };

  const t = translations[language] || translations.fr;
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100';

  const modes = [
    { id: 'materiaux', icon: '🧱', label: t.modes.materiaux },
    { id: 'services', icon: '👷', label: t.modes.services },
    { id: 'machines', icon: '🚜', label: t.modes.machines },
    { id: 'experts', icon: '📐', label: t.modes.experts },
    { id: 'maintenance', icon: '🔧', label: t.modes.maintenance },
    { id: 'transport', icon: '🚚', label: t.modes.transport },
    { id: 'documents', icon: '📄', label: t.modes.documents },
    { id: 'companies', icon: '🏢', label: t.modes.companies }
  ];

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
            { id: 2, name: "Fer à béton (Ø 12mm)", category: "Steel", price_retail: 9.5, price_wholesale: 8.8, min_wholesale_qty: 500, unit: "Kg", currency: "MAD", supplier: "Sonasid", rating: 4.9, isPopular: true, image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop" }
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

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: (parseInt(item.qty) || 0) + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const updateQuantity = (productId, newQty) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  return (
    <div className="animate-fade-in pb-32 max-w-7xl mx-auto w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top Header & Smart Search */}
      <div className={`${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-100'} backdrop-blur-md p-6 rounded-3xl border shadow-sm mb-8 mt-4`}>
        <div className="max-w-4xl mx-auto flex items-center bg-gray-100 dark:bg-slate-800 rounded-full p-2 border border-transparent focus-within:border-emerald-500 transition-colors shadow-inner">
          <Search className={`w-6 h-6 text-gray-400 ${isRtl ? 'mr-3 ml-2' : 'ml-3 mr-2'}`} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400 font-medium"
          />
          <div className={`flex gap-2 ${isRtl ? 'ml-2' : 'mr-2'}`}>
            <button className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-full transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-full transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Master Marketplace Switcher */}
      <div className="flex gap-4 mb-8 overflow-x-auto custom-scrollbar pb-2 snap-x">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`snap-start shrink-0 flex items-center px-6 py-4 rounded-2xl text-lg font-bold transition-all border-2 ${
              activeMode === mode.id 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 transform -translate-y-1' 
                : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-white text-slate-600'} hover:border-emerald-400 hover:shadow-md`
            }`}
          >
            <span className={`text-2xl ${isRtl ? 'ml-3' : 'mr-3'}`}>{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>

      {/* 1. MATÉRIAUX MODE */}
      {activeMode === 'materiaux' && (
        <div className="animate-fade-in">
          {/* Categories */}
          <div className="mb-6 flex overflow-x-auto custom-scrollbar pb-4 gap-3 snap-x">
            {categories.map(cat => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500' 
                      : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'} hover:border-slate-400`
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'} /> {cat.label}
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div></div>
          ) : filteredProducts.length === 0 ? (
            <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="font-black text-xl mb-2">{t.emptySearch}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden ${bgCard} shadow-sm hover:shadow-lg`}>
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={product.image_url || product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    {product.isPopular && <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1`}><TrendingUp size={12}/> {t.popular}</span>}
                    <span className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} text-white font-bold text-sm drop-shadow-md bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm`}>{product.unit}</span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className={`font-black text-lg leading-tight mb-2 ${textTitle}`}>{product.name}</h3>
                    <div className="flex items-center gap-1 mb-4">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className={`text-xs font-bold ${textMuted}`}>{product.rating || '4.5'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <p className={`text-[10px] font-bold ${textMuted}`}>{t.retail}</p>
                        <p className="font-black text-blue-500" dir="ltr">{product.price_retail} {getCurrencySymbol(product.currency || 'MAD')}</p>
                      </div>
                      <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                        <p className="text-[10px] font-bold text-emerald-600">{t.wholesale} <span className="opacity-70">(+{product.min_wholesale_qty})</span></p>
                        <p className="font-black text-emerald-600" dir="ltr">{product.price_wholesale} {getCurrencySymbol(product.currency || 'MAD')}</p>
                      </div>
                    </div>
                    <div className={`mt-auto pt-4 border-t border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <p className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${textMuted}`}>
                        <Briefcase size={14} className="text-emerald-500"/> {t.supplier} <span className={textTitle}>{product.supplier || 'Vendeur Indépendant'}</span>
                      </p>
                      <button onClick={() => handleAddToCart(product)} className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${addedItem === product.id ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}>
                        {addedItem === product.id ? <><CheckCircle2 size={16}/> {t.addedSuccess}</> : <><Plus size={16}/> {t.addToCart}</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. SERVICES MODE */}
      {activeMode === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className={`rounded-2xl border p-5 ${bgCard} shadow-sm hover:shadow-lg transition-shadow`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=150" alt="Avatar" className="w-full h-full object-cover"/>
              </div>
              <div>
                <h3 className={`font-bold text-lg flex items-center gap-1 ${textTitle}`}>
                  Ahmed Électricité <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </h3>
                <p className="text-sm text-emerald-600 font-bold">{t.services.specialty}</p>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className={`flex justify-between text-sm ${textMuted}`}><span >{t.services.interventions}</span><span className={`font-semibold ${textTitle}`}>127 {t.services.completed}</span></div>
              <div className={`flex justify-between text-sm ${textMuted}`}><span >{t.services.response}</span><span className="font-semibold text-emerald-600">{t.services.responseTime}</span></div>
              <div className={`flex justify-between text-sm ${textMuted}`}><span >{t.services.basePrice}</span><span className={`font-semibold ${textTitle}`}>{t.services.startingFrom} 250 MAD</span></div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedSupplier(true)} 
                className={`flex-1 border py-2 rounded-xl text-sm font-bold transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}
              >
                {t.services.viewProfile}
              </button>
              <button 
                onClick={() => handleAddToCart({ id: 's1', name: 'Installation Électrique', supplier: 'Ahmed Électricité', type: 'service', image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=150' })}
                className="flex-1 bg-emerald-500 text-white py-2 rounded-xl hover:bg-emerald-600 transition-colors text-sm font-bold"
              >
                {t.services.requestQuote}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPERTS MODE */}
      {activeMode === 'experts' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
           <div className="bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 p-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-bl-full group-hover:scale-110 transition-transform"></div>
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-4">{t.experts.badge}</span>
            <h3 className="font-black text-xl mb-1">Cabinet Yassine Archi</h3>
            <p className="text-slate-400 text-sm mb-4">{t.experts.experience}</p>
            <div className="space-y-3 mb-6">
              <p className="text-sm flex items-center text-slate-300"><CheckCircle className={`w-4 h-4 text-emerald-400 ${isRtl ? 'ml-2' : 'mr-2'}`} /> {t.experts.skill1}</p>
              <p className="text-sm flex items-center text-slate-300"><CheckCircle className={`w-4 h-4 text-emerald-400 ${isRtl ? 'ml-2' : 'mr-2'}`} /> {t.experts.skill2}</p>
            </div>
            <button 
              onClick={() => handleAddToCart({ id: 'e1', name: 'Consultation Architecte', supplier: 'Cabinet Yassine Archi', type: 'expert', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150' })}
              className="w-full bg-emerald-500 text-white py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-bold shadow-lg shadow-emerald-500/20"
            >
              {t.experts.book}
            </button>
          </div>
         </div>
      )}

      {/* 4. MACHINES MODE */}
      {activeMode === 'machines' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className={`rounded-2xl border overflow-hidden ${bgCard} shadow-sm hover:shadow-lg transition-all`}>
            <div className="h-48 bg-slate-200 relative">
              <img src="https://images.unsplash.com/photo-1579762699924-a74087cb8916?w=500" alt="Excavatrice" className="w-full h-full object-cover"/>
              <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg`}>
                <Clock className="w-3 h-3 mr-1" /> {t.machines.available} 25 Sept
              </span>
            </div>
            <div className="p-5">
              <h3 className={`font-black text-lg mb-1 ${textTitle}`}>CAT 320 Excavatrice</h3>
              <p className={`text-sm mb-4 ${textMuted}`}>{t.machines.details}</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className={`p-2 rounded-xl text-center border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-xs ${textMuted}`}>{t.machines.day}</p>
                  <p className={`font-bold ${textTitle}`}>1,800 MAD</p>
                </div>
                <div className={`p-2 rounded-xl text-center border ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className="text-xs text-emerald-600">{t.machines.week}</p>
                  <p className="font-bold text-emerald-600">9,500 MAD</p>
                </div>
              </div>
              <button 
                onClick={() => handleAddToCart({ id: 'm1', name: 'CAT 320 Excavatrice', supplier: 'Atlas Engins', type: 'rental', price: 1800, duration: 3, dates: '25-27 Sept', transport: 500, image_url: 'https://images.unsplash.com/photo-1579762699924-a74087cb8916?w=150' })}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-bold"
              >
                {t.machines.book}
              </button>
            </div>
          </div>
         </div>
      )}

      {/* 5. MAINTENANCE MODE */}
      {activeMode === 'maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className={`rounded-2xl border p-5 ${bgCard} shadow-sm hover:shadow-lg transition-shadow`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150" alt="Maintenance" className="w-full h-full object-cover"/>
              </div>
              <div>
                <h3 className={`font-bold text-lg ${textTitle}`}>Equipe Atlas Réparation</h3>
                <p className="text-sm text-emerald-600 font-bold">Mécanique Engins Lourds</p>
              </div>
            </div>
            <div className="space-y-2 mb-6 text-sm">
              <div className={`flex justify-between ${textMuted}`}><span>{t.maintenance.type}</span><span className={`font-semibold ${textTitle}`}>Sur chantier</span></div>
              <div className={`flex justify-between ${textMuted}`}><span>{t.maintenance.response}</span><span className="font-semibold text-emerald-600">Sous 2h</span></div>
            </div>
            <button 
              onClick={() => handleAddToCart({ id: 'maint1', name: 'Mécanique Engins Lourds', supplier: 'Equipe Atlas Réparation', type: 'service', image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150' })}
              className="w-full bg-emerald-500 text-white py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-bold shadow-sm"
            >
              {t.maintenance.book}
            </button>
          </div>
        </div>
      )}

      {/* 6. TRANSPORT MODE */}
      {activeMode === 'transport' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className={`rounded-2xl border overflow-hidden ${bgCard} shadow-sm hover:shadow-lg transition-shadow`}>
            <div className="h-40 bg-slate-200 relative">
              <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500" alt="Camion" className="w-full h-full object-cover"/>
            </div>
            <div className="p-5">
              <h3 className={`font-black text-lg mb-2 ${textTitle}`}>Semi-remorque Plateau</h3>
              <div className="space-y-2 mb-4 text-sm">
                <div className={`flex justify-between ${textMuted}`}><span>{t.transport.capacity}</span><span className={`font-semibold ${textTitle}`}>24 Tonnes</span></div>
                <div className={`flex justify-between ${textMuted}`}><span>{t.transport.route}</span><span className={`font-semibold ${textTitle}`}>National</span></div>
              </div>
              <div className={`p-3 rounded-xl text-center border mb-4 ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className="font-black text-emerald-600">12 {t.transport.price}</p>
              </div>
              <button 
                onClick={() => handleAddToCart({ id: 'trans1', name: 'Semi-remorque Plateau', supplier: 'Transporteurs Express', type: 'rental', price: 1200, duration: 1, transport: 0, image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500' })}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-bold"
              >
                {t.transport.book}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DOCUMENTS MODE */}
      {activeMode === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className={`rounded-2xl border p-5 ${bgCard} shadow-sm hover:shadow-lg transition-shadow`}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className={`font-bold text-lg mb-1 ${textTitle}`}>Permis de Construire</h3>
            <p className={`text-sm mb-4 line-clamp-2 ${textMuted}`}>Assistance complète pour l'obtention du permis de construire auprès des autorités locales.</p>
            <div className="space-y-2 mb-6 text-sm">
              <div className={`flex justify-between ${textMuted}`}><span>{t.documents.time}</span><span className={`font-semibold ${textTitle}`}>15-30 Jours</span></div>
              <div className={`flex justify-between ${textMuted}`}><span>{t.documents.type}</span><span className="font-semibold text-blue-500">Administratif</span></div>
            </div>
            <button 
              onClick={() => handleAddToCart({ id: 'doc1', name: 'Permis de Construire', supplier: 'Cabinet Administratif', type: 'service', image_url: 'https://via.placeholder.com/150/3b82f6/ffffff?text=Document' })}
              className="w-full border-2 border-blue-500 text-blue-500 py-2 rounded-xl hover:bg-blue-50 transition-colors font-bold"
            >
              {t.documents.request}
            </button>
          </div>
        </div>
      )}

      {/* 8. COMPANIES MODE */}
      {activeMode === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg border border-slate-700 p-6 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner">
                <Building2 size={32} className="text-slate-800" />
              </div>
              <div>
                <h3 className="font-black text-xl mb-1 flex items-center gap-2">
                  BTP Maroc SA <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </h3>
                <p className="text-emerald-400 text-xs font-bold">{t.companies.verify}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                <p className="text-2xl font-black text-white">45+</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.companies.projects}</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                <p className="text-2xl font-black text-white">ISO</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">9001:2015</p>
              </div>
            </div>
            <button 
              onClick={() => handleAddToCart({ id: 'comp1', name: 'Partenariat Global', supplier: 'BTP Maroc SA', type: 'service', image_url: 'https://via.placeholder.com/150/1e293b/ffffff?text=Company' })}
              className="w-full bg-white text-slate-900 py-3 rounded-xl hover:bg-gray-100 transition-colors font-black relative z-10 shadow-lg"
            >
              {t.companies.contact}
            </button>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
          </div>
        </div>
      )}

      {/* RFQ CTA Section */}
      <div className="mt-12 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-emerald-400 mb-2">{t.rfq.title}</h2>
          <p className="text-slate-600 dark:text-slate-300">{t.rfq.desc}</p>
        </div>
        
        <button 
          onClick={() => alert("نافذة الطلبات المخصصة قيد التطوير... ستتوفر قريباً!")} 
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 flex items-center gap-2 whitespace-nowrap"
        >
        <FileText className="w-5 h-5" />
          {t.rfq.btn}
        </button>
      </div>

      {/* Floating Project Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-40 animate-slide-up`}>
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsCartOpen(true)}>
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
                <ShoppingCart size={24} className="text-white" />
              </div>
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-lg">
                {cart.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0)}
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-slate-300">{cart.length} {t.itemsInCart}</p>
              <p className="font-black text-sm text-emerald-400">{t.multiCartDesc}</p>
            </div>
            <button className={`ml-4 px-5 py-2.5 bg-white text-slate-900 hover:bg-emerald-50 rounded-xl font-black text-sm transition-colors flex items-center gap-2`}>
              {t.checkout} <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      )}

      {/* 🚀 استدعاء سلة المشروع الذكية الجديدة */}
      {isCartOpen && (
        <ProjectCart 
          isDarkMode={isDarkMode} 
          language={language} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          onRemove={removeFromCart} 
          onUpdateQuantity={updateQuantity}
          
          // 🚀 الكود الجديد لزر التفاوض
          onNegotiate={() => {
            setIsCartOpen(false); // إغلاق السلة أولاً
            
            // 1. حساب المجموع الكلي للسلة بدقة (بما فيها سعر الجملة)
            const totalAmount = cart.reduce((sum, item) => {
              const p = item.product;
              const activePrice = item.qty >= (p.min_wholesale_qty || 999999) ? (p.price_wholesale || p.price) : (p.price_retail || p.price);
              return sum + (activePrice * item.qty);
            }, 0);

            // 2. تجهيز هيكل الطلبية لإرساله للشات
            const orderPayload = {
              items: cart,
              total: totalAmount
            };

            // 3. جلب اسم المورد (نأخذ مورد أول منتج كمثال)
            const supplier = cart[0]?.product?.supplier || "المورد";

            navigate('./ChatRoom', {
              state: {
                cartOrder: orderPayload,
                supplierName: supplier
              }
            });
          }}
          
          onCheckout={() => {
            alert("Validation des commandes déclenchée !");
            setIsCartOpen(false);
          }}
        />
      )}

      {/* 🚀 استدعاء نافذة ملف المورد المنبثقة */}
      {selectedSupplier && (
        <SupplierProfile 
          isDarkMode={isDarkMode} 
          language={language} 
          onClose={() => setSelectedSupplier(null)} 
        />
      )}

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        @keyframes slide-in { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; }
      `}</style>
    </div>
  );
}