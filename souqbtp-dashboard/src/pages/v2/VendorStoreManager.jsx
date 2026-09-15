import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  PackagePlus, Trash2, Edit, ShoppingBag, 
  Plus, X, Loader2, Store, Image as ImageIcon, CheckCircle2, 
  Coins, Globe, Bitcoin
} from 'lucide-react';

// 🚀 دالة ذكية لاستخراج رمز العملة
const getCurrencySymbol = (curr) => {
  const symbols = { 
    MAD: 'MAD', USD: '$', EUR: '€', SAR: 'SAR', AED: 'AED', KWD: 'KWD', 
    CNY: '¥', INR: '₹', CHF: 'CHF', USDT: '₮', BTC: '₿', 
    ETH: '⟠', SOL: '◎', ICX: '🌐', OM: '🏢', BST: '🧱', ALGO: '⚙️', BRICS: '🤝' 
  };
  return symbols[curr] || curr;
};

// 🚀 دالة ذكية لاستخراج أيقونة وعلم العملة
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

export default function VendorStoreManager() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || false;
  const language = context.language || 'ar';
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  
  const [editingProductId, setEditingProductId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', category: 'Cement', price_retail: '', price_wholesale: '', 
    min_wholesale_qty: '10', unit: 'Unité', description: '', image_url: '', currency: 'MAD'
  });

  const translations = {
    ar: {
      title: "إدارة متجري (BTP)", subtitle: "أضف سلعك، حدد أسعار الجملة والتقسيط، وابدأ البيع.",
      addProduct: "إضافة منتج جديد", editProduct: "تعديل المنتج", myProducts: "منتجاتي الحالية",
      name: "اسم المنتج", category: "التصنيف", 
      retailPrice: "ثمن التقسيط (للوحدة)", wholesalePrice: "ثمن الجملة (للوحدة)",
      minWholesale: "الكمية الأدنى للجملة", unit: "وحدة القياس", currencySelector: "العملة (التسعير المالي)",
      desc: "وصف المنتج", image: "صورة المنتج",
      save: "نشر المنتج", update: "تحديث المنتج", cancel: "إلغاء", actions: "إجراءات", empty: "لم تقم بإضافة أي منتج بعد.",
      uploading: "جاري الرفع...", dragDrop: "اضغط لرفع صورة المنتج",
      success: "تمت العملية بنجاح!", backToMarket: "العودة للسوق العام 🛒",
      categories: { Cement: "مواد البناء والأسمنت", Steel: "الحديد والتسليح", Wood: "الخشب والنجارة", Plumbing: "السباكة والأنابيب", Electrical: "الكهرباء والإنارة", Paint: "الصباغة والعزل" }
    },
    fr: {
      title: "Mon Magasin BTP", subtitle: "Ajoutez vos produits, définissez vos prix (détail/gros) et vendez.",
      addProduct: "Nouveau Produit", editProduct: "Modifier Produit", myProducts: "Mes Produits",
      name: "Nom du produit", category: "Catégorie", 
      retailPrice: "Prix Détail (Unité)", wholesalePrice: "Prix Gros (Unité)",
      minWholesale: "Quantité Min. (Gros)", unit: "Unité de mesure", currencySelector: "Devise (Tarification)",
      desc: "Description", image: "Image du Produit",
      save: "Publier", update: "Mettre à jour", cancel: "Annuler", actions: "Actions", empty: "Aucun produit ajouté pour le moment.",
      uploading: "Téléchargement...", dragDrop: "Cliquez pour uploader une image",
      success: "Opération réussie !", backToMarket: "Retour au Marché 🛒",
      categories: { Cement: "Gros œuvre & Ciment", Steel: "Acier & Armature", Wood: "Bois & Menuiserie", Plumbing: "Plomberie & Tuyauterie", Electrical: "Électricité & Éclairage", Paint: "Peinture & Isolation" }
    },
    en: {
      title: "My BTP Store", subtitle: "Add products, set retail/wholesale prices, and start selling.",
      addProduct: "Add New Product", editProduct: "Edit Product", myProducts: "My Products",
      name: "Product Name", category: "Category", 
      retailPrice: "Retail Price (Unit)", wholesalePrice: "Wholesale Price (Unit)",
      minWholesale: "Min Qty for Wholesale", unit: "Unit of measurement", currencySelector: "Currency (Pricing)",
      desc: "Description", image: "Product Image",
      save: "Publish Product", update: "Update Product", cancel: "Cancel", actions: "Actions", empty: "No products added yet.",
      uploading: "Uploading...", dragDrop: "Click to upload product image",
      success: "Operation successful!", backToMarket: "Back to Market 🛒",
      categories: { Cement: "Masonry & Cement", Steel: "Steel & Rebar", Wood: "Wood & Carpentry", Plumbing: "Plumbing & Piping", Electrical: "Electrical & Lighting", Paint: "Paint & Insulation" }
    }
  };

  const t = translations[language] || translations.ar;

  const btpUnits = [
    { group: "التعبئة والوحدات", items: ["Unité (قطعة)", "Boîte (علبة)", "Paquet (رزمة)", "Palette (باليت)"] },
    { group: "الوزن", items: ["Kg (كيلوغرام)", "Tonne (طن)", "Sac 25kg (كيس 25كغ)", "Sac 50kg (كيس 50كغ)"] },
    { group: "الطول", items: ["Mètre Linéaire (متر طولي)", "Barre 6m (قضيب 6م)", "Barre 12m (قضيب 12م)", "Rouleau 50m (لفة 50م)", "Rouleau 100m (لفة 100م)"] },
    { group: "المساحة والحجم", items: ["Mètre Carré m² (متر مربع)", "Mètre Cube m³ (متر مكعب)", "Litre (لتر)", "Pot 5L (وعاء 5ل)", "Pot 20L (وعاء 20ل)"] },
    { group: "النقل والخدمات", items: ["Camion (شاحنة)", "Voyage (رحلة)", "Forfait (تسعيرة شاملة)"] }
  ];

  const currenciesList = [
    { type: "العملات الورقية (Fiat) المهيمنة", items: [
      { code: "MAD", label: "MAD - الدرهم المغربي 🇲🇦" },
      { code: "USD", label: "USD - الدولار الأمريكي 💵" },
      { code: "EUR", label: "EUR - اليورو الأوروبي 💶" },
      { code: "CHF", label: "CHF - الفرنك السويسري 🇨🇭" },
    ]},
    { type: "عملات الخليج واقتصاديات صاعدة", items: [
      { code: "SAR", label: "SAR - الريال السعودي 🇸🇦" },
      { code: "AED", label: "AED - الدرهم الإماراتي 🇦🇪" },
      { code: "KWD", label: "KWD - الدينار الكويتي 🇰🇼" },
      { code: "CNY", label: "CNY - اليوان الصيني 🇨🇳" },
      { code: "INR", label: "INR - الروبية الهندية 🇮🇳" },
      { code: "BRICS", label: "BRICS - عملة البريكس 🤝" },
    ]},
    { type: "العملات المشفرة والأصول المرقمنة (RWA/BTP)", items: [
      { code: "USDT", label: "USDT / USDC - عملات مستقرة ₮" },
      { code: "BTC", label: "BTC - بيتكوين ₿" },
      { code: "ETH", label: "ETH - إيثريوم ⟠" },
      { code: "SOL", label: "SOL - سولانا ◎" },
      { code: "ICX", label: "ICX (ICON) - بروتوكول BTP 🌐" },
      { code: "OM", label: "OM (MANTRA) - أصول RWA 🏢" },
      { code: "BST", label: "BST (Blocksquare) - توكين عقاري 🧱" },
      { code: "ALGO", label: "ALGO (Algorand) - عقود ذكية ⚙️" },
    ]}
  ];

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const modalBg = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';
  const inputBg = isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  useEffect(() => {
    let isMounted = true;
    const initStore = async () => {
      setLoading(true);
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (isMounted && currentUser) {
          setUser(currentUser);
          await fetchProducts(currentUser.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initStore();
    return () => { isMounted = false; };
  }, []);

  const fetchProducts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('*')
        .eq('supplier_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([
          { id: 1, name: "Ciment Portland CPJ 45", category: "Cement", price_retail: 75, price_wholesale: 70, min_wholesale_qty: 100, unit: "Sac 50kg (كيس 50كغ)", currency: "MAD", description: "Ciment haute qualité pour les fondations.", image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500&auto=format&fit=crop" },
          { id: 2, name: "Bitumen Premium (Export)", category: "Paint", price_retail: 350, price_wholesale: 300, min_wholesale_qty: 50, unit: "Tonne (طن)", currency: "USDT", description: "High-grade Bitumen for export.", image_url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=500&auto=format&fit=crop" }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      setFormData({ ...formData, image_url: URL.createObjectURL(file) });
      setIsUploading(false);
    }, 1500);
  };

  const handleAddNew = () => {
    setFormData({ name: '', category: 'Cement', price_retail: '', price_wholesale: '', min_wholesale_qty: '10', unit: 'Unité (قطعة)', description: '', image_url: '', currency: 'MAD' });
    setEditingProductId(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price_retail: product.price_retail.toString(),
      price_wholesale: product.price_wholesale.toString(),
      min_wholesale_qty: product.min_wholesale_qty.toString(),
      unit: product.unit,
      description: product.description || '',
      image_url: product.image_url || '',
      currency: product.currency || 'MAD'
    });
    setEditingProductId(product.id);
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaveStatus('loading');
    const productPayload = {
      ...formData,
      supplier_id: user.id,
      price_retail: parseFloat(formData.price_retail),
      price_wholesale: parseFloat(formData.price_wholesale),
      min_wholesale_qty: parseInt(formData.min_wholesale_qty)
    };

    try {
      setTimeout(() => {
        if (editingProductId) {
          setProducts(products.map(p => p.id === editingProductId ? { ...productPayload, id: editingProductId } : p));
        } else {
          setProducts([{ ...productPayload, id: Date.now() }, ...products]);
        }
        
        setSaveStatus('success');
        setTimeout(() => {
          setSaveStatus(null);
          setShowModal(false);
          setEditingProductId(null);
        }, 1500);
      }, 800);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id) => {
    if(window.confirm("Delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="animate-fade-in pb-24 max-w-7xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl p-6 md:p-10 mb-8 text-center md:text-start flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-indigo-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 w-full md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center justify-center md:justify-start gap-3">
            <Store className="text-blue-400" size={32} /> {t.title}
          </h1>
          <p className="text-indigo-100 font-bold text-lg">{t.subtitle}</p>
          
          <div className="flex justify-center md:justify-start mt-6">
            <Link to="/v2/marketplace" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold backdrop-blur-md transition-all border border-white/20">
              {t.backToMarket}
            </Link>
          </div>
        </div>
        <button 
          onClick={handleAddNew}
          className="relative z-10 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3.5 rounded-xl flex items-center gap-2 font-black shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all"
        >
          <PackagePlus size={20} /> {t.addProduct}
        </button>
      </div>

      {/* Products List */}
      <div className="mb-6 flex items-center gap-2">
        <ShoppingBag className="text-indigo-500" size={24}/>
        <h2 className={`text-2xl font-black ${textTitle}`}>{t.myProducts}</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20"><Loader2 size={40} className="animate-spin text-indigo-500"/></div>
      ) : products.length === 0 ? (
        <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
          <Store size={48} className="mx-auto mb-4 opacity-20" />
          <h3 className="font-black text-xl mb-2">{t.empty}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className={`group rounded-3xl border-2 overflow-hidden shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl ${cardBg}`}>
              <div className="h-48 relative bg-slate-100 dark:bg-slate-800">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={40} opacity={0.5}/></div>
                )}
                <span className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-slate-900/80 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full border border-slate-700`}>
                  {t.categories[product.category] || product.category}
                </span>
                <span className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black px-2.5 py-1 rounded-full border border-white flex items-center gap-1 shadow-lg`}>
                  {getCurrencyIcon(product.currency)} {product.currency}
                </span>
              </div>
              
              <div className="p-5">
                <h3 className={`font-black text-lg mb-1 truncate ${textTitle}`}>{product.name}</h3>
                <p className={`text-xs font-bold mb-4 ${textMuted}`}>{product.unit}</p>
                
                <div className="space-y-3 mb-5">
                  <div className={`flex justify-between items-center p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`text-xs font-bold ${textMuted}`}>{t.retailPrice}</span>
                    {/* 🚀 رمز العملة يتغير ديناميكياً هنا */}
                    <span className="font-black text-blue-500" dir="ltr">{product.price_retail} {getCurrencySymbol(product.currency)}</span>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-xl border ${isDarkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                    <span className={`text-xs font-bold text-indigo-500 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {t.wholesalePrice} <br/><span className="text-[10px] opacity-70">(Min: {product.min_wholesale_qty})</span>
                    </span>
                    {/* 🚀 وهنا أيضاً يتغير ديناميكياً */}
                    <span className="font-black text-indigo-600" dir="ltr">{product.price_wholesale} {getCurrencySymbol(product.currency)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(product)} 
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                  >
                    <Edit size={16} className="mx-auto" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition-colors">
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className={`w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[95vh] ${modalBg}`} onClick={e => e.stopPropagation()}>
            
            <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <h3 className={`text-xl font-black flex items-center gap-2 ${textTitle}`}>
                {editingProductId ? <Edit className="text-blue-500" /> : <PackagePlus className="text-blue-500" />} 
                {editingProductId ? t.editProduct : t.addProduct}
              </h3>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <form id="product-form" onSubmit={handleSaveProduct} className="space-y-8">
                
                {/* Image Upload */}
                <div>
                  <label className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDarkMode ? 'border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    {isUploading ? (
                      <div className="flex flex-col items-center"><Loader2 className="animate-spin text-blue-500 mb-2" size={32}/> <span className={`font-bold ${textMuted}`}>{t.uploading}</span></div>
                    ) : formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="h-40 object-contain mx-auto rounded-lg shadow-md" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><ImageIcon size={28}/></div>
                        <p className={`font-bold ${textTitle}`}>{t.dragDrop}</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-5">
                    <div>
                      <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.name}</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-bold border focus:border-blue-500 transition-colors ${inputBg}`} />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.category}</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-bold border focus:border-blue-500 appearance-none ${inputBg}`}>
                        {Object.entries(t.categories).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.unit}</label>
                      <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-bold border focus:border-blue-500 appearance-none ${inputBg}`}>
                        {btpUnits.map((group, idx) => (
                          <optgroup key={idx} label={group.group} className="bg-slate-200 dark:bg-slate-800 text-slate-500 font-black">
                            {group.items.map((item, i) => (
                              <option key={i} value={item} className="bg-white dark:bg-slate-950 font-bold text-slate-800 dark:text-white">{item}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="space-y-5 p-5 rounded-2xl border bg-indigo-500/5 border-indigo-500/20">
                    
                    {/* Currency Selector */}
                    <div className="pb-4 mb-2 border-b border-indigo-500/20">
                      <label className="block text-xs font-black mb-2 text-indigo-500 flex items-center gap-2"><Globe size={14}/> {t.currencySelector}</label>
                      <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-black text-lg border focus:border-indigo-500 appearance-none ${isDarkMode ? 'bg-slate-900 border-indigo-500/30 text-white' : 'bg-white border-indigo-200 text-indigo-900'}`}>
                        {currenciesList.map((group, idx) => (
                          <optgroup key={idx} label={group.type} className="bg-slate-200 dark:bg-slate-800 text-slate-500 font-black text-sm">
                            {group.items.map((item, i) => (
                              <option key={i} value={item.code} className="bg-white dark:bg-slate-950 font-bold text-slate-800 dark:text-white text-base">{item.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* 🚀 الحقول الرقمية بالاتجاه العالمي (LTR) وبأيقونة ديناميكية */}
                    <div className="grid grid-cols-2 gap-4">
                      <div dir="ltr">
                        <label className={`block text-xs font-bold mb-2 text-indigo-500 ${isRtl ? 'text-right' : 'text-left'}`}>{t.retailPrice}</label>
                        <div className="relative">
                          <input type="number" required min="0" step="0.01" value={formData.price_retail} onChange={e => setFormData({...formData, price_retail: e.target.value})} className={`w-full pl-14 pr-4 py-3 rounded-xl outline-none font-black text-lg border focus:border-indigo-500 text-left ${isDarkMode ? 'bg-slate-900 border-indigo-500/30 text-white' : 'bg-white border-indigo-200 text-slate-800'}`} />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-black text-sm">{getCurrencySymbol(formData.currency)}</span>
                        </div>
                      </div>
                      <div dir="ltr">
                        <label className={`block text-xs font-bold mb-2 text-emerald-500 ${isRtl ? 'text-right' : 'text-left'}`}>{t.wholesalePrice}</label>
                        <div className="relative">
                          <input type="number" required min="0" step="0.01" value={formData.price_wholesale} onChange={e => setFormData({...formData, price_wholesale: e.target.value})} className={`w-full pl-14 pr-4 py-3 rounded-xl outline-none font-black text-lg border focus:border-emerald-500 text-left ${isDarkMode ? 'bg-slate-900 border-emerald-500/30 text-white' : 'bg-white border-emerald-200 text-slate-800'}`} />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-sm">{getCurrencySymbol(formData.currency)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-emerald-500">{t.minWholesale}</label>
                      <input type="number" required min="1" value={formData.min_wholesale_qty} onChange={e => setFormData({...formData, min_wholesale_qty: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none font-black text-lg border focus:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-emerald-500/30 text-white' : 'bg-white border-emerald-200 text-slate-800'}`} />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold mb-2 ${textMuted}`}>{t.desc}</label>
                    <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none font-bold border focus:border-blue-500 resize-none ${inputBg}`}></textarea>
                  </div>
                </div>
              </form>
            </div>

            <div className={`p-6 border-t flex justify-end gap-3 shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'}`}>
              <button onClick={() => setShowModal(false)} className={`px-6 py-3 rounded-xl font-black transition-colors ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                {t.cancel}
              </button>
              <button type="submit" form="product-form" disabled={saveStatus === 'loading'} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2">
                {saveStatus === 'loading' ? <Loader2 size={18} className="animate-spin"/> : saveStatus === 'success' ? <CheckCircle2 size={18}/> : <Plus size={18}/>}
                {saveStatus === 'success' ? t.success : (editingProductId ? t.update : t.save)}
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}