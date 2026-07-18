import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Package, Search, Plus, Edit2, Trash2, Loader2, AlertCircle, Layers, UploadCloud, Image as ImageIcon } from 'lucide-react';

const translations = {
  ar: {
    title: 'إدارة المخزون المركزي', subtitle: 'إدارة الكتالوج وكميات الجملة الضخمة الخاصة بك.',
    stockValue: 'القيمة الإجمالية للمخزون', searchPlaceholder: 'ابحث عن منتج...',
    newProduct: 'إضافة منتج جديد', image: 'صورة', prodCat: 'المنتج والتصنيف',
    quantity: 'الكمية (المخزون)', wholesalePrice: 'سعر الجملة', value: 'القيمة',
    actions: 'إجراءات', noProducts: 'لم يتم العثور على منتجات',
    editProduct: 'تعديل المنتج', changeImage: 'تغيير الصورة',
    clickUpload: 'انقر هنا لرفع صورة المنتج', productName: 'اسم المنتج',
    placeholderName: 'مثال: إسمنت، حديد 10 ملم...',
    category: 'التصنيف', qtyInit: 'كمية المخزون', unit: 'الوحدة',
    cancel: 'إلغاء', save: 'حفظ المنتج ونشره', stockAlerts: 'تنبيهات نقص المخزون',
    optimalStock: 'جميع المواد بمستوى مخزون ممتاز.', outOfStock: 'نفذت الكمية',
    left: 'متبقي:', deleteConfirm: 'هل أنت متأكد من حذف هذا المنتج؟',
    errorSave: 'خطأ أثناء الحفظ', errorUpload: 'خطأ أثناء رفع الصورة', loading: 'جاري التحميل...',
    currency: 'MAD', imgFormat: 'PNG, JPG (Max 5MB)',
    cats: { 'gros-oeuvre': 'مواد البناء الأساسية', 'electricite': 'الكهرباء', 'plomberie': 'السباكة', 'outillage': 'المعدات والأدوات' },
    units: { 'Unité': 'قطعة (Unité)', 'Kg': 'كيلوغرام (Kg)', 'Quintal': 'قنطار (q)', 'Tonne': 'طن (T)', 'Sac': 'كيس (Sac)', 'm2': 'متر مربع (m²)', 'm3': 'متر مكعب (m³)', 'ml': 'متر طولي (ml)', 'Palette': 'باليت (Palette)' }
  },
  fr: {
    title: 'Gestion du Stock Central', subtitle: 'Gérez votre catalogue B2B et vos quantités en gros.',
    stockValue: 'Valeur du Stock', searchPlaceholder: 'Rechercher un produit...',
    newProduct: 'Nouveau Produit', image: 'Image', prodCat: 'Produit & Catégorie',
    quantity: 'Quantité (Stock)', wholesalePrice: 'Prix Gros (B2B)', value: 'Valeur',
    actions: 'Actions', noProducts: 'Aucun produit trouvé',
    editProduct: 'Modifier Produit', changeImage: 'Changer l\'image',
    clickUpload: 'Cliquez pour télécharger une image', productName: 'Nom du produit',
    placeholderName: 'Ex: Ciment Portland 45, Fer à béton...',
    category: 'Catégorie', qtyInit: 'Quantité Initiale', unit: 'Unité',
    cancel: 'Annuler', save: 'Enregistrer', stockAlerts: 'Alertes de Stock',
    optimalStock: 'Tout le stock est à un niveau optimal.', outOfStock: 'RUPTURE',
    left: 'Reste:', deleteConfirm: 'Supprimer ce produit ?',
    errorSave: 'Erreur lors de l\'enregistrement', errorUpload: 'Erreur lors du téléchargement de l\'image', loading: 'Chargement...',
    currency: 'MAD', imgFormat: 'PNG, JPG (Max 5MB)',
    cats: { 'gros-oeuvre': 'Gros Œuvre', 'electricite': 'Électricité', 'plomberie': 'Plomberie', 'outillage': 'Outillage' },
    units: { 'Unité': 'Unité (Pièce)', 'Kg': 'Kilogramme (Kg)', 'Quintal': 'Quintal (q)', 'Tonne': 'Tonne (T)', 'Sac': 'Sac', 'm2': 'Mètre Carré (m²)', 'm3': 'Mètre Cube (m³)', 'ml': 'Mètre Linéaire (ml)', 'Palette': 'Palette' }
  },
  en: {
    title: 'Central Stock Management', subtitle: 'Manage your B2B catalog and wholesale quantities.',
    stockValue: 'Total Stock Value', searchPlaceholder: 'Search for a product...',
    newProduct: 'New Product', image: 'Image', prodCat: 'Product & Category',
    quantity: 'Quantity (Stock)', wholesalePrice: 'Wholesale Price (B2B)', value: 'Value',
    actions: 'Actions', noProducts: 'No products found',
    editProduct: 'Edit Product', changeImage: 'Change Image',
    clickUpload: 'Click to upload an image', productName: 'Product Name',
    placeholderName: 'Ex: Portland Cement, Rebar...',
    category: 'Category', qtyInit: 'Initial Quantity', unit: 'Unit',
    cancel: 'Cancel', save: 'Save Product', stockAlerts: 'Stock Alerts',
    optimalStock: 'All stock is at optimal levels.', outOfStock: 'OUT OF STOCK',
    left: 'Left:', deleteConfirm: 'Are you sure you want to delete this product?',
    errorSave: 'Error saving', errorUpload: 'Error uploading image', loading: 'Loading...',
    currency: 'MAD', imgFormat: 'PNG, JPG (Max 5MB)',
    cats: { 'gros-oeuvre': 'Heavy Construction', 'electricite': 'Electricity', 'plomberie': 'Plumbing', 'outillage': 'Tools & Equipment' },
    units: { 'Unité': 'Unit (Piece)', 'Kg': 'Kilogram (Kg)', 'Quintal': 'Quintal (q)', 'Tonne': 'Tonne (T)', 'Sac': 'Bag', 'm2': 'Square Meter (m²)', 'm3': 'Cubic Meter (m³)', 'ml': 'Linear Meter (ml)', 'Palette': 'Palette' }
  }
};

export default function SupplierStock() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  // 🎯 استدعاء الترجمة بأمان تام
  const t = translations[language] || translations['fr'];
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', category: 'gros-oeuvre', price: '', stock_quantity: '', unit: 'Unité', image_url: '' 
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
        name: product.name, category: product.category || 'gros-oeuvre',
        price: product.price, stock_quantity: product.stock_quantity, unit: product.unit || 'Unité', image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'gros-oeuvre', price: '', stock_quantity: '', unit: 'Unité', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const productData = {
        name: formData.name, category: formData.category, price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity), unit: formData.unit, image_url: formData.image_url, supplier_id: supplier.id
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
      alert("Erreur: " + err.message);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
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
            <p className="text-2xl font-black text-white">{totalStockValue.toLocaleString()} <span className="text-sm text-emerald-400">{t.currency}</span></p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full sm:w-96">
          <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
          <input 
            type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-medium`}
          />
        </div>
        <button onClick={() => handleOpenModal()} className="w-full sm:w-auto py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={20}/> {t.newProduct}
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-5 font-black w-16 text-center">{t.image}</th>
                <th className="p-5 font-black">{t.prodCat}</th>
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
                <tr><td colSpan="6" className="p-10 text-center text-slate-500 font-medium"><AlertCircle size={30} className="mx-auto mb-2 opacity-50"/> {t.noProducts}</td></tr>
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
                    <td className="p-5">
                      <p className="font-bold text-white text-lg">{product.name}</p>
                      <p className="text-xs text-blue-400 font-bold mt-1">{categories.find(c => c.id === product.category)?.name || product.category}</p>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-md font-black text-sm inline-flex items-center gap-1 ${product.stock_quantity <= 100 ? 'bg-red-500/10 text-red-400' : 'bg-slate-900 text-emerald-400'}`}>
                        {product.stock_quantity.toLocaleString()} <span className="text-[10px] opacity-70 uppercase">{product.unit || 'Unité'}</span>
                      </span>
                    </td>
                    <td className="p-5 text-end font-bold text-blue-400" dir="ltr">
                      {product.price.toLocaleString()} {t.currency}
                    </td>
                    <td className="p-5 text-end font-black text-slate-300" dir="ltr">
                      {(product.price * product.stock_quantity).toLocaleString()} {t.currency}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(product)} className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all" title={t.editProduct}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all" title="Supprimer"><Trash2 size={16} /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-3xl shadow-2xl animate-slide-up my-8">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-700 pb-4">
              {editingProduct ? t.editProduct : t.newProduct}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-5">
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

      <div className="bg-slate-800 border border-red-900/30 p-6 rounded-3xl shadow-lg relative overflow-hidden mt-6">
        <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <span className="text-red-500">⚠️</span> {t.stockAlerts}
        </h3>
  
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {products?.filter(p => p.stock_quantity < 1000).length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">✅ {t.optimalStock}</p>
          ) : (
            products?.filter(p => p.stock_quantity < 1000).map((product, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-red-900/10 rounded-xl border border-red-900/20">
                <span className="font-bold text-slate-200">{product.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black bg-red-900/40 text-red-400 px-2 py-1 rounded-md">
                    {product.stock_quantity === 0 ? t.outOfStock : `${t.left} ${product.stock_quantity}`}
                  </span>
                </div>
              </div>
            )) 
          )}
        </div>
      </div>
    </div>
  );
}