import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Package, Search, Plus, Edit2, Trash2, Loader2, AlertCircle, Layers, UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function SupplierStock() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // حالات النافذة المنبثقة (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // نموذج البيانات المطور (أضفنا الصورة والتصنيف)
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'gros-oeuvre',
    price: '', 
    stock_quantity: '',
    image_url: '' 
  });

  const categories = [
    { id: 'gros-oeuvre', name: language === 'fr' ? 'Gros Œuvre' : 'مواد البناء الأساسية' },
    { id: 'electricite', name: language === 'fr' ? 'Électricité' : 'الكهرباء' },
    { id: 'plomberie', name: language === 'fr' ? 'Plomberie' : 'السباكة' },
    { id: 'outillage', name: language === 'fr' ? 'Outillage' : 'المعدات والأدوات' },
  ];

  useEffect(() => {
    if (supplier?.id) fetchProducts();
  }, [supplier]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplier.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // رفع الصورة لـ Supabase
  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product_images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(language === 'fr' ? "Erreur lors du téléchargement de l'image" : "خطأ أثناء رفع الصورة");
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
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'gros-oeuvre', price: '', stock_quantity: '', image_url: '' });
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
        image_url: formData.image_url,
        supplier_id: supplier.id
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
      alert(language === 'fr' ? "Erreur lors de l'enregistrement" : "خطأ أثناء الحفظ");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'fr' ? 'Supprimer ce produit ?' : 'هل أنت متأكد من حذف هذا المنتج؟')) return;
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
      {/* رأس الصفحة والإحصائيات */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Layers className="text-blue-500" size={32} />
            {language === 'fr' ? 'Gestion du Stock Central' : 'إدارة المخزون المركزي'}
          </h2>
          <p className="text-slate-400 mt-1 font-medium">
            {language === 'fr' ? 'Gérez votre catalogue B2B et vos quantités en gros.' : 'إدارة الكتالوج وكميات الجملة الضخمة الخاصة بك.'}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="bg-emerald-500/10 p-3 rounded-xl"><Package className="text-emerald-400" size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'fr' ? 'Valeur du Stock' : 'القيمة الإجمالية للمخزون'}</p>
            <p className="text-2xl font-black text-white">{totalStockValue.toLocaleString()} <span className="text-sm text-emerald-400">MAD</span></p>
          </div>
        </div>
      </div>

      {/* شريط البحث وزر الإضافة */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={language === 'fr' ? 'Rechercher un produit...' : 'ابحث عن منتج...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20}/> {language === 'fr' ? 'Nouveau Produit' : 'إضافة منتج جديد'}
        </button>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-5 font-black w-16 text-center">{language === 'fr' ? 'Image' : 'صورة'}</th>
                <th className="p-5 font-black">{language === 'fr' ? 'Produit & Catégorie' : 'المنتج والتصنيف'}</th>
                <th className="p-5 font-black text-center">{language === 'fr' ? 'Quantité (Stock)' : 'الكمية (المخزون)'}</th>
                <th className="p-5 font-black text-right">{language === 'fr' ? 'Prix Gros (B2B)' : 'سعر الجملة'}</th>
                <th className="p-5 font-black text-right">{language === 'fr' ? 'Valeur' : 'القيمة'}</th>
                <th className="p-5 font-black text-center">{language === 'fr' ? 'Actions' : 'إجراءات'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr><td colSpan="6" className="p-10 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto"/></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-slate-500 font-medium"><AlertCircle size={30} className="mx-auto mb-2 opacity-50"/> {language === 'fr' ? 'Aucun produit trouvé' : 'لم يتم العثور على منتجات'}</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-5 text-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-slate-600 mx-auto" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto text-slate-600 border border-slate-700">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-white text-lg">{product.name}</p>
                      <p className="text-xs text-blue-400 font-bold mt-1">
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </p>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-md font-black text-sm ${product.stock_quantity <= 100 ? 'bg-red-500/10 text-red-400' : 'bg-slate-900 text-emerald-400'}`}>
                        {product.stock_quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-5 text-right font-bold text-blue-400">
                      {product.price.toLocaleString()} DH
                    </td>
                    <td className="p-5 text-right font-black text-slate-300">
                      {(product.price * product.stock_quantity).toLocaleString()} DH
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(product)} className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all" title="Modifier">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 نافذة إضافة/تعديل منتج المدمجة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-slide-up my-8">
            <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-700 pb-4">
              {editingProduct ? (language === 'fr' ? 'Modifier Produit' : 'تعديل المنتج') : (language === 'fr' ? 'Nouveau Produit' : 'إضافة منتج جديد')}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-5">
              
              {/* رفع الصورة المدمج */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-2xl bg-slate-900/50 hover:bg-slate-900 transition-colors relative group">
                {formData.image_url ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold">{language === 'fr' ? 'Changer l\'image' : 'تغيير الصورة'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={48} className="mx-auto text-blue-500 mb-3" />
                    <p className="text-sm font-bold text-slate-300">{language === 'fr' ? 'Cliquez pour télécharger une image' : 'انقر هنا لرفع صورة المنتج'}</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG (Max 5MB)</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center rounded-xl backdrop-blur-sm">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-2">{language === 'fr' ? 'Nom du produit' : 'اسم المنتج'}</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-medium" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-2">{language === 'fr' ? 'Catégorie' : 'التصنيف'}</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-medium appearance-none">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">{language === 'fr' ? 'Prix Gros (MAD)' : 'سعر الجملة'}</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-bold" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">{language === 'fr' ? 'Quantité Initiale' : 'كمية المخزون'}</label>
                  <input required type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-bold" />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                  {language === 'fr' ? 'Annuler' : 'إلغاء'}
                </button>
                <button type="submit" disabled={isProcessing || uploading} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : (language === 'fr' ? 'Enregistrer' : 'حفظ المنتج ونشره')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 قسم تنبيهات مخزون المورد (كودك الأصلي المميز) */}
      <div className="bg-slate-800 border border-red-900/30 p-6 rounded-3xl shadow-lg relative overflow-hidden mt-6">
        <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <span className="text-red-500">⚠️</span> {language === 'fr' ? 'Alertes de Stock' : 'تنبيهات نقص المخزون'}
        </h3>
  
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {products?.filter(p => p.stock_quantity < 1000).length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">✅ {language === 'fr' ? 'Tout le stock est à un niveau optimal.' : 'جميع المواد بمستوى مخزون ممتاز.'}</p>
          ) : (
            products?.filter(p => p.stock_quantity < 1000).map((product, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-red-900/10 rounded-xl border border-red-900/20">
                <span className="font-bold text-slate-200">{product.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black bg-red-900/40 text-red-400 px-2 py-1 rounded-md">
                    {product.stock_quantity === 0 ? (language === 'fr' ? 'RUPTURE' : 'نفذت الكمية') : `${language === 'fr' ? 'Reste:' : 'متبقي'} ${product.stock_quantity}`}
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