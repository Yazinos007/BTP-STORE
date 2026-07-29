import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  Package, Search, Plus, Edit2, Trash2, Loader2, AlertCircle, Layers, 
  UploadCloud, Image as ImageIcon, RotateCcw, ShieldAlert, 
  AlertTriangle, ShoppingCart, Factory 
} from 'lucide-react';

const translations = {
  ar: {
    title: 'إدارة المخزون المركزي', subtitle: 'إدارة الكتالوج، المواد الخام، وكميات الجملة.',
    stockValue: 'القيمة الإجمالية للمخزون', searchPlaceholder: 'ابحث عن منتج أو مادة...',
    newProduct: 'إضافة عنصر جديد', image: 'صورة', prodCat: 'المنتج والتصنيف',
    quantity: 'الكمية (المخزون)', wholesalePrice: 'سعر الجملة/التكلفة', value: 'القيمة',
    actions: 'إجراءات', noProducts: 'لم يتم العثور على عناصر في هذا القسم',
    editProduct: 'تعديل العنصر', changeImage: 'تغيير الصورة',
    clickUpload: 'انقر هنا لرفع صورة', productName: 'اسم المنتج / المادة',
    placeholderName: 'مثال: إسمنت، حديد 10 ملم، أكياس تغليف...',
    category: 'التصنيف', qtyInit: 'كمية المخزون', unit: 'الوحدة',
    cancel: 'إلغاء', save: 'حفظ العنصر', stockAlerts: 'تنبيهات المخزون الذكية',
    optimalStock: 'جميع المواد بمستوى مخزون ممتاز.', outOfStock: 'نفدت الكمية',
    left: 'متبقي:', deleteConfirm: 'هل أنت متأكد من حذف هذا العنصر؟',
    errorSave: 'خطأ أثناء الحفظ', errorUpload: 'خطأ أثناء رفع الصورة', loading: 'جاري التحميل...',
    currency: 'MAD', imgFormat: 'PNG, JPG (Max 5MB)',
    deleteTooltip: 'حذف', editTooltip: 'تعديل',
    itemTypeLabel: 'نوع العنصر (الـ DNA)',
    cleanMenu: '🧹 تنظيف القسم',
    zeroStock: 'تصفير كميات هذا القسم (0)',
    deleteEmpty: 'حذف العناصر نافدة الكمية (0)',
    confirmZero: 'هل أنت متأكد من تصفير كميات جميع عناصر هذا القسم؟',
    confirmDeleteEmpty: 'هل أنت متأكد من حذف جميع العناصر نافدة الكمية؟ (سيتم تجاهل العناصر المرتبطة بفواتير قديمة)',
    cats: { 'gros-oeuvre': 'مواد البناء الأساسية', 'electricite': 'الكهرباء', 'plomberie': 'السباكة', 'outillage': 'المعدات والأدوات' },
    units: { 'Unité': 'قطعة (Unité)', 'Kg': 'كيلوغرام (Kg)', 'Quintal': 'قنطار (q)', 'Tonne': 'طن (T)', 'Sac': 'كيس (Sac)', 'm2': 'متر مربع (m²)', 'm3': 'متر مكعب (m³)', 'ml': 'متر طولي (ml)', 'Palette': 'باليت (Palette)' },
    types: { 'finished_good': '🏆 منتج نهائي', 'raw_material': '🧱 مادة خام', 'packaging': '📦 تعبئة وتغليف', 'consumable': '⚙️ مادة استهلاكية' },
    // Smart Alerts Translations
    runRateAlert: 'تنبيه نفاد وشيك', daysLeft: 'أيام متبقية',
    rawMaterialAlert: 'نقص المادة الخام', productionRisk: 'خطر توقف الإنتاج',
    actionOrder: 'إرسال طلب شراء', actionProduce: 'أمر إنتاج (OF)',
    cementDesc: 'سرعة مبيعات عالية. نفاذ المخزون متوقع يوم الجمعة.',
    sandDesc: 'نقص في المادة الخام لإنتاج "طوب خرساني 20x20".',
    realStockAlerts: 'تنبيهات المخزون الفعلي (أقل من 1000 وحدة)'
  },
  fr: {
    title: 'Gestion du Stock Central', subtitle: 'Gérez votre catalogue, matières 1ères et quantités.',
    stockValue: 'Valeur du Stock', searchPlaceholder: 'Rechercher un article...',
    newProduct: 'Nouvel Article', image: 'Image', prodCat: 'Article & Catégorie',
    quantity: 'Quantité (Stock)', wholesalePrice: 'Prix Gros/Coût', value: 'Valeur',
    actions: 'Actions', noProducts: 'Aucun article trouvé dans cette section',
    editProduct: 'Modifier l\'article', changeImage: 'Changer l\'image',
    clickUpload: 'Cliquez pour télécharger une image', productName: 'Nom de l\'article',
    placeholderName: 'Ex: Ciment Portland, Fer à béton, Emballage...',
    category: 'Catégorie', qtyInit: 'Quantité Initiale', unit: 'Unité',
    cancel: 'Annuler', save: 'Enregistrer', stockAlerts: 'Alertes de Stock Intelligentes',
    optimalStock: 'Tout le stock est à un niveau optimal.', outOfStock: 'RUPTURE',
    left: 'Reste:', deleteConfirm: 'Supprimer cet article ?',
    errorSave: 'Erreur lors de l\'enregistrement', errorUpload: 'Erreur lors du téléchargement', loading: 'Chargement...',
    currency: 'MAD', imgFormat: 'PNG, JPG (Max 5MB)',
    deleteTooltip: 'Supprimer', editTooltip: 'Modifier',
    itemTypeLabel: 'Type d\'article (DNA)',
    cleanMenu: '🧹 Nettoyer la section',
    zeroStock: 'Mettre les stocks à zéro (0)',
    deleteEmpty: 'Supprimer les articles en rupture',
    confirmZero: 'Êtes-vous sûr de vouloir remettre à zéro tout le stock de cette section ?',
    confirmDeleteEmpty: 'Supprimer les articles en rupture ? (Les articles liés à des factures seront ignorés)',
    cats: { 'gros-oeuvre': 'Gros Œuvre', 'electricite': 'Électricité', 'plomberie': 'Plomberie', 'outillage': 'Outillage' },
    units: { 'Unité': 'Unité (Pièce)', 'Kg': 'Kilogramme (Kg)', 'Quintal': 'Quintal (q)', 'Tonne': 'Tonne (T)', 'Sac': 'Sac', 'm2': 'Mètre Carré (m²)', 'm3': 'Mètre Cube (m³)', 'ml': 'Mètre Linéaire (ml)', 'Palette': 'Palette' },
    types: { 'finished_good': '🏆 Produit Fini', 'raw_material': '🧱 Matière 1ère', 'packaging': '📦 Emballage', 'consumable': '⚙️ Consommable' },
    // Smart Alerts Translations
    runRateAlert: 'Rupture Imminente', daysLeft: 'Jours restants',
    rawMaterialAlert: 'Manque Matière 1ère', productionRisk: 'Risque d\'arrêt de production',
    actionOrder: 'Commander l\'usine', actionProduce: 'Ordre de Fab. (OF)',
    cementDesc: 'Vitesse de vente élevée. Stock estimé à zéro ce Vendredi.',
    sandDesc: 'Manque de matière 1ère pour produire "Bloc Béton 20x20".',
    realStockAlerts: 'Alertes Stock Réel (Moins de 1000 unités)'
  },
  en: {
    title: 'Central Stock Management', subtitle: 'Manage your catalog, raw materials, and quantities.',
    stockValue: 'Total Stock Value', searchPlaceholder: 'Search for an item...',
    newProduct: 'New Item', image: 'Image', prodCat: 'Item & Category',
    quantity: 'Quantity (Stock)', wholesalePrice: 'Wholesale Price/Cost', value: 'Value',
    actions: 'Actions', noProducts: 'No items found in this section',
    editProduct: 'Edit Item', changeImage: 'Change Image',
    clickUpload: 'Click to upload an image', productName: 'Item Name',
    placeholderName: 'Ex: Portland Cement, Rebar, Packaging...',
    category: 'Category', qtyInit: 'Initial Quantity', unit: 'Unit',
    cancel: 'Cancel', save: 'Save Item', stockAlerts: 'Smart Stock Alerts',
    optimalStock: 'All stock is at optimal levels.', outOfStock: 'OUT OF STOCK',
    left: 'Left:', deleteConfirm: 'Are you sure you want to delete this item?',
    errorSave: 'Error saving', errorUpload: 'Error uploading image', loading: 'Loading...',
    currency: 'MAD', imgFormat: 'PNG, JPG (Max 5MB)',
    deleteTooltip: 'Delete', editTooltip: 'Edit',
    itemTypeLabel: 'Item Type (DNA)',
    cleanMenu: '🧹 Clean Section',
    zeroStock: 'Reset stock to zero (0)',
    deleteEmpty: 'Delete out-of-stock items',
    confirmZero: 'Are you sure you want to reset all stock quantities in this section to zero?',
    confirmDeleteEmpty: 'Delete out-of-stock items? (Items linked to invoices will be ignored)',
    cats: { 'gros-oeuvre': 'Heavy Construction', 'electricite': 'Electricity', 'plomberie': 'Plumbing', 'outillage': 'Tools & Equipment' },
    units: { 'Unité': 'Unit (Piece)', 'Kg': 'Kilogram (Kg)', 'Quintal': 'Quintal (q)', 'Tonne': 'Tonne (T)', 'Sac': 'Bag', 'm2': 'Square Meter (m²)', 'm3': 'Cubic Meter (m³)', 'ml': 'Linear Meter (ml)', 'Palette': 'Palette' },
    types: { 'finished_good': '🏆 Finished Good', 'raw_material': '🧱 Raw Material', 'packaging': '📦 Packaging', 'consumable': '⚙️ Consumable' },
    // Smart Alerts Translations
    runRateAlert: 'Imminent Stockout', daysLeft: 'Days left',
    rawMaterialAlert: 'Raw Material Shortage', productionRisk: 'Production halt risk',
    actionOrder: 'Send Purchase Order', actionProduce: 'Production Order (PO)',
    cementDesc: 'High sales velocity. Stock estimated zero by Friday.',
    sandDesc: 'Raw material shortage to produce "Concrete Block 20x20".',
    realStockAlerts: 'Real Stock Alerts (Under 1000 units)'
  }
};

const ITEM_TYPES = ['finished_good', 'raw_material', 'packaging', 'consumable'];

export default function SupplierStock() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  const t = translations[language] || translations['fr'];
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('finished_good');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCleanMenu, setShowCleanMenu] = useState(false);

  const [formData, setFormData] = useState({ 
    name: '', category: 'gros-oeuvre', price: '', stock_quantity: '', unit: 'Unité', image_url: '', item_type: 'finished_good'
  });

  const categories = [
    { id: 'gros-oeuvre', name: t.cats['gros-oeuvre'] },
    { id: 'electricite', name: t.cats['electricite'] },
    { id: 'plomberie', name: t.cats['plomberie'] },
    { id: 'outillage', name: t.cats['outillage'] },
  ];

  useEffect(() => {
    if (supplier?.id) fetchProducts();
  }, [supplier]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('supplier_id', supplier.id).order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProducts(data);
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product_images').upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product_images').getPublicUrl(fileName);
      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(t.errorUpload);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        category: product.category || 'gros-oeuvre',
        price: product.price, 
        stock_quantity: product.stock_quantity, 
        unit: product.unit || 'Unité', 
        image_url: product.image_url || '',
        item_type: product.item_type || 'finished_good'
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'gros-oeuvre', price: '', stock_quantity: '', unit: 'Unité', image_url: '', item_type: activeTab });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const productData = {
        name: formData.name, 
        category: formData.category, 
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity), 
        unit: formData.unit, 
        image_url: formData.image_url, 
        supplier_id: supplier.id,
        item_type: formData.item_type
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }

      fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(t.errorSave);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      alert("Erreur: (هذا المنتج مرتبط بفواتير أو عمليات تصنيع ولا يمكن حذفه)");
    }
  };

  const handleZeroStock = async () => {
    if (!window.confirm(t.confirmZero)) return;
    setIsProcessing(true);
    setShowCleanMenu(false);
    try {
      const { error } = await supabase.from('products').update({ stock_quantity: 0 }).eq('supplier_id', supplier.id).eq('item_type', activeTab);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
    setIsProcessing(false);
  };

  const handleDeleteEmptyProducts = async () => {
    if (!window.confirm(t.confirmDeleteEmpty)) return;
    setIsProcessing(true);
    setShowCleanMenu(false);
    try {
      const { error } = await supabase.from('products').delete().eq('supplier_id', supplier.id).eq('item_type', activeTab).eq('stock_quantity', 0);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      alert("بعض المنتجات مرتبطة بفواتير ولا يمكن حذفها نهائياً. تم تخطيها لحماية حساباتك.");
      fetchProducts();
    }
    setIsProcessing(false);
  };

  const filteredProducts = products.filter(p => 
    (p.item_type || 'finished_good') === activeTab && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalStockValue = filteredProducts.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);
  const lowStockProducts = filteredProducts?.filter(p => p.stock_quantity < 1000);

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Layers className="text-blue-500" size={32} /> {t.title}
          </h2>
          <p className="text-slate-400 mt-1 font-medium">{t.subtitle}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="bg-emerald-500/10 p-3 rounded-xl"><Package className="text-emerald-400" size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.stockValue}</p>
            <p className="text-2xl font-black text-white" dir="ltr">{totalStockValue.toLocaleString()} <span className="text-sm text-emerald-400 uppercase">{t.currency}</span></p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
        {ITEM_TYPES.map(type => {
          const count = products.filter(p => (p.item_type || 'finished_good') === type).length;
          const isActive = activeTab === type;
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`whitespace-nowrap px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                isActive 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {t.types[type]}
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-700 text-slate-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full sm:w-96">
          <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
          <input 
            type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-medium`}
          />
        </div>
        
        <div className="flex w-full sm:w-auto gap-3 relative">
          <div className="relative">
            <button 
              onClick={() => setShowCleanMenu(!showCleanMenu)}
              disabled={isProcessing}
              className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all border border-slate-600"
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : t.cleanMenu}
            </button>

            {showCleanMenu && (
              <div className={`absolute top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden ${language === 'ar' ? 'right-0' : 'left-0'}`}>
                <button onClick={handleZeroStock} className="w-full text-start px-4 py-3 hover:bg-slate-700 text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-700">
                  <RotateCcw size={16} /> {t.zeroStock}
                </button>
                <button onClick={handleDeleteEmptyProducts} className="w-full text-start px-4 py-3 hover:bg-red-500/10 text-sm font-bold text-red-400 flex items-center gap-2">
                  <ShieldAlert size={16} /> {t.deleteEmpty}
                </button>
              </div>
            )}
          </div>

          <button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
            <Plus size={20}/> {t.newProduct}
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-5 font-black w-16 text-center">{t.image}</th>
                <th className="p-5 font-black text-start">{t.prodCat}</th>
                <th className="p-5 font-black text-center">{t.quantity}</th>
                <th className="p-5 font-black text-end">{t.wholesalePrice}</th>
                <th className="p-5 font-black text-end">{t.value}</th>
                <th className="p-5 font-black text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr><td colSpan="6" className="p-10 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto"/></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-slate-500 font-bold"><AlertCircle size={30} className="mx-auto mb-2 opacity-50"/> {t.noProducts}</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-5 text-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-slate-600 mx-auto" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto text-slate-600 border border-slate-700"><ImageIcon size={20} /></div>
                      )}
                    </td>
                    <td className="p-5 text-start">
                      <p className="font-bold text-white text-lg">{product.name}</p>
                      <p className="text-xs text-blue-400 font-bold mt-1">{categories.find(c => c.id === product.category)?.name || product.category}</p>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-md font-black text-sm inline-flex items-center gap-1 ${product.stock_quantity <= 100 ? 'bg-red-500/10 text-red-400' : 'bg-slate-900 text-emerald-400'}`}>
                        {product.stock_quantity.toLocaleString()} <span className="text-[10px] opacity-70 uppercase">{product.unit || 'Unité'}</span>
                      </span>
                    </td>
                    <td className="p-5 text-end font-bold text-blue-400" dir="ltr">
                      {product.price.toLocaleString()} <span className="text-[10px] opacity-70 uppercase">{t.currency}</span>
                    </td>
                    <td className="p-5 text-end font-black text-slate-300" dir="ltr">
                      {(product.price * product.stock_quantity).toLocaleString()} <span className="text-[10px] opacity-70 uppercase">{t.currency}</span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(product)} className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all" title={t.editTooltip}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all" title={t.deleteTooltip}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-3xl shadow-2xl animate-slide-up my-8 text-start">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-700 pb-4">
              {editingProduct ? t.editProduct : t.newProduct}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 mb-6">
                <label className="block text-sm font-bold text-slate-400 mb-3">{t.itemTypeLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {ITEM_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, item_type: type})}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        formData.item_type === type 
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)] scale-105' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {t.types[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-2xl bg-slate-900/50 hover:bg-slate-900 transition-colors relative group">
                {formData.image_url ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold">{t.changeImage}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={48} className="mx-auto text-blue-500 mb-3" />
                    <p className="text-sm font-bold text-slate-300">{t.clickUpload}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.imgFormat}</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center rounded-xl backdrop-blur-sm">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-slate-400 mb-2">{t.productName}</label>
                  <input required type="text" placeholder={t.placeholderName} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-medium placeholder-slate-600" />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-slate-400 mb-2">{t.category}</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-medium appearance-none">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">{t.wholesalePrice}</label>
                  <input required type="number" step="0.01" placeholder="Ex: 50.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-bold placeholder-slate-600" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">{t.qtyInit}</label>
                  <input required type="number" placeholder="Ex: 1000" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-bold placeholder-slate-600" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">{t.unit}</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-bold appearance-none">
                    {Object.entries(t.units).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                  {t.cancel}
                </button>
                <button type="submit" disabled={isProcessing || uploading} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧠 Smart Stock Intelligence (Alerts & Predictions) */}
      <div className="mt-8">
        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
          <AlertTriangle className="text-orange-500" /> {t.stockAlerts}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Predictive Alert 1: Run Rate */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6 group transition-colors hover:bg-orange-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                <h4 className="font-bold text-orange-400">{t.runRateAlert}</h4>
              </div>
              <span className="text-sm font-black text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg">4 {t.daysLeft}</span>
            </div>
            <p className="text-white font-black text-lg mb-2">Ciment Portland CPJ 45</p>
            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">{t.cementDesc}</p>
            <button className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              <ShoppingCart size={18}/> {t.actionOrder}
            </button>
          </div>

          {/* Predictive Alert 2: Raw Material Dependency */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 group transition-colors hover:bg-red-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <h4 className="font-bold text-red-400">{t.rawMaterialAlert}</h4>
              </div>
              <span className="text-sm font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-lg">{t.productionRisk}</span>
            </div>
            <p className="text-white font-black text-lg mb-2">Sable de concassage</p>
            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">{t.sandDesc}</p>
            <button className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <Factory size={18}/> {t.actionProduce}
            </button>
          </div>

          {/* Real Stock Alerts (Low Stock Items from DB) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col max-h-[250px]">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle size={16} /> {t.realStockAlerts}
            </h4>
            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {lowStockProducts?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <CheckCircle size={32} className="text-emerald-500 mb-2" />
                  <p className="text-sm font-bold text-slate-300">{t.optimalStock}</p>
                </div>
              ) : (
                lowStockProducts?.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <span className="font-bold text-slate-200 truncate pr-2">{product.name}</span>
                    <span className="text-xs font-black bg-red-500/20 text-red-400 px-2 py-1 rounded-md shrink-0">
                      {product.stock_quantity === 0 ? t.outOfStock : `${t.left} ${product.stock_quantity}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}