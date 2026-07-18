import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useProductStore from '../store/useProductStore';
import useSettingsStore from '../store/useSettingsStore';
import { Package, Plus, Trash2, Search, Edit, AlertTriangle, Wallet, X, Box, Loader2, Scale, PackageMinus, CheckCircle, UploadCloud } from 'lucide-react';

const translations = {
  ar: {
    title: 'إدارة المنتجات', subtitle: 'أضف، عدل، وراقب مخزون منتجاتك.',
    addBtn: 'إضافة منتج', search: 'ابحث عن منتج...',
    name: 'المنتج (Désignation)', price: 'السعر', stock: 'المخزون', unit: 'الوحدة', actions: 'إجراءات',
    empty: 'لا توجد منتجات مسجلة.', loading: 'جاري التحميل...',
    save: 'حفظ المنتج', cancel: 'إلغاء', newProduct: 'إضافة منتج جديد', editProduct: 'تعديل المنتج',
    currency: 'درهم', confirmDelete: 'هل أنت متأكد من حذف هذا المنتج نهائياً؟',
    totalProducts: 'إجمالي المنتجات', stockValue: 'قيمة المخزون', lowStock: 'مخزون منخفض', outOfStock: 'نفد من المخزون',
    declareLoss: 'تسجيل إتلاف / ضياع', lossQty: 'الكمية التالفة', lossReason: 'السبب (كسر، انتهاء صلاحية...)',
    confirmLoss: 'تأكيد الإتلاف',
    units: {
      'Unité': 'قطعة (Unité)', 'Kg': 'كيلوغرام (Kg)', 'Quintal': 'قنطار (Quintal)', 'Tonne': 'طن (Tonne)',
      'Sac': 'كيس (Sac)', 'm2': 'متر مربع (m²)', 'm3': 'متر مكعب (m³)', 'ml': 'متر طولي (ml)'
    }
  },
  fr: {
    title: 'Gestion des Produits', subtitle: 'Ajoutez, modifiez et suivez votre stock.',
    addBtn: 'Nouveau Produit', search: 'Rechercher...',
    name: 'Désignation', price: 'Prix', stock: 'Stock', unit: 'Unité', actions: 'Actions',
    empty: 'Aucun produit enregistré.', loading: 'Chargement...',
    save: 'Enregistrer', cancel: 'Annuler', newProduct: 'Nouveau Produit', editProduct: 'Modifier Produit',
    currency: 'MAD', confirmDelete: 'Voulez-vous vraiment supprimer ce produit ?',
    totalProducts: 'Total Produits', stockValue: 'Valeur du Stock', lowStock: 'Stock Faible', outOfStock: 'Rupture de Stock',
    declareLoss: 'Signaler une Perte (Casse)', lossQty: 'Quantité perdue', lossReason: 'Motif (Casse, Vol, Périmé...)',
    confirmLoss: 'Valider la perte',
    units: {
      'Unité': 'Unité (Pièce)', 'Kg': 'Kilogramme (Kg)', 'Quintal': 'Quintal (q)', 'Tonne': 'Tonne (T)',
      'Sac': 'Sac', 'm2': 'Mètre Carré (m²)', 'm3': 'Mètre Cube (m³)', 'ml': 'Mètre Linéaire (ml)'
    }
  },
  en: {
    title: 'Products Management', subtitle: 'Add, edit, and track your stock.',
    addBtn: 'New Product', search: 'Search...',
    name: 'Product Name', price: 'Price', stock: 'Stock', unit: 'Unit', actions: 'Actions',
    empty: 'No products registered.', loading: 'Loading...',
    save: 'Save Product', cancel: 'Cancel', newProduct: 'New Product', editProduct: 'Edit Product',
    currency: 'MAD', confirmDelete: 'Are you sure you want to delete this product?',
    totalProducts: 'Total Products', stockValue: 'Stock Value', lowStock: 'Low Stock', outOfStock: 'Out of Stock',
    declareLoss: 'Declare a Loss', lossQty: 'Lost Quantity', lossReason: 'Reason (Broken, Expired...)',
    confirmLoss: 'Confirm Loss',
    units: {
      'Unité': 'Unit (Piece)', 'Kg': 'Kilogram (Kg)', 'Quintal': 'Quintal', 'Tonne': 'Tonne',
      'Sac': 'Bag', 'm2': 'Square Meter (m²)', 'm3': 'Cubic Meter (m³)', 'ml': 'Linear Meter (ml)',
      'Palette': 'Palette'
    }
  }
};

export default function Products() {
  const location = useLocation(); 
  const isWholesaler = location.pathname.includes('/stock');
  const { products, isLoading, fetchProducts, addProduct, deleteProduct, updateProduct } = useProductStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  // حالات نافذة الإضافة والتعديل
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock_quantity: '', unit: 'Unité', category: 'Gros Œuvre', image: '' });
  
  // 📦 حالات نافذة الإتلاف (Casse/Perte)
  const [showLossModal, setShowLossModal] = useState(false);
  const [lossData, setLossData] = useState({ id: null, name: '', qty: '', reason: '', current_stock: 0, unit: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const safeProducts = Array.isArray(products) ? products : [];
  const totalValue = safeProducts.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock_quantity)), 0);
  const lowStockCount = safeProducts.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const outOfStockCount = safeProducts.filter(p => p.stock_quantity === 0).length;

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', stock_quantity: '', unit: 'Unité' });
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    setFormData({ 
      name: product.name, price: product.price, stock_quantity: product.stock_quantity, unit: product.unit || 'Unité' 
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        name: formData.name, price: parseFloat(formData.price), stock_quantity: parseInt(formData.stock_quantity), unit: formData.unit
      };
      if (editingId) await updateProduct(editingId, payload);
      else await addProduct(payload);
      setShowForm(false);
      fetchProducts();
    } catch (error) { alert("حدث خطأ أثناء الحفظ"); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) { await deleteProduct(id); fetchProducts(); }
  };

  // 📦 دالة تأكيد الإتلاف وخصم المخزون
  const handleLossSubmit = async (e) => {
    e.preventDefault();
    const lostQty = parseInt(lossData.qty);
    
    if (isNaN(lostQty) || lostQty <= 0) return;
    if (lostQty > lossData.current_stock) {
      alert(language === 'ar' ? "الكمية التالفة أكبر من المخزون المتوفر!" : "La quantité perdue est supérieure au stock disponible!");
      return;
    }

    setIsSubmitting(true);
    try {
      const newQty = lossData.current_stock - lostQty;
      await updateProduct(lossData.id, { stock_quantity: newQty });
      
      // هنا يمكننا مستقبلاً إضافة كود لحفظ "السبب" في جدول خاص بالتقارير (Reports)
      
      setShowLossModal(false);
      fetchProducts();
    } catch (error) {
      alert("Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = safeProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const StatCard = ({ title, value, icon: Icon, bgGradient, valueSuffix = '' }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1 tracking-wider uppercase">{title}</p>
          <h4 className="text-2xl font-black tracking-tight">{value} <span className="text-sm font-normal text-white/70">{valueSuffix}</span></h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="mb-6">
          <h2 className={`text-3xl font-black tracking-tight flex items-center gap-2 ${isWholesaler ? 'text-white' : 'text-gray-800'}`}>
           {t.title} 
          </h2>
          <p className={`mt-1 font-medium ${isWholesaler ? 'text-slate-300' : 'text-gray-500'}`}>
           {t.subtitle}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-bold shadow-lg hover:shadow-blue-500/30">
          <Plus size={20} /> {t.addBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title={t.totalProducts} value={safeProducts.length} icon={Box} bgGradient="bg-gradient-to-br from-blue-600 to-blue-400" />
        <StatCard title={t.stockValue} value={totalValue.toLocaleString()} icon={Wallet} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" valueSuffix={t.currency} />
        <StatCard title={t.lowStock} value={lowStockCount} icon={AlertTriangle} bgGradient="bg-gradient-to-br from-orange-500 to-yellow-500" />
        <StatCard title={t.outOfStock} value={outOfStockCount} icon={X} bgGradient="bg-gradient-to-br from-red-600 to-rose-500" />
      </div>

      {/* 🪟 نافذة إضافة/تعديل منتج */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-800 text-xl">{editingId ? t.editProduct : t.newProduct}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
  {/* ☁️ حقل رفع الصورة */}
  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors relative group">
    <input 
      type="file" 
      accept="image/*"
      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => setFormData({...formData, image: e.target.result});
          reader.readAsDataURL(e.target.files[0]);
        }
      }}
    />
    {formData.image ? (
      <img src={formData.image} alt="Preview" className="h-24 object-contain rounded-lg shadow-sm" />
    ) : (
      <>
        <UploadCloud size={32} className="mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
        <p className="text-sm font-bold text-gray-700">{language === 'fr' ? 'Cliquez pour télécharger une image' : 'اضغط لرفع صورة المنتج'}</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
      </>
    )}
  </div>

  {/* 📝 اسم المنتج */}
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{t.name}</label>
    <input 
      required type="text" 
      placeholder={language === 'fr' ? 'Ex: Ciment Portland 45, Fer à béton...' : 'مثال: إسمنت مسلح، حديد البناء...'} 
      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all" 
    />
  </div>

  {/* 🗂️ التصنيف (جديد) */}
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{language === 'fr' ? 'Catégorie' : 'التصنيف'}</label>
    <select 
      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} 
      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold text-gray-700 transition-all bg-gray-50"
    >
      <option value="Gros Œuvre">Gros Œuvre (أشغال كبرى)</option>
      <option value="Finition">Finition (تشطيبات)</option>
      <option value="Plomberie">Plomberie (سباكة)</option>
      <option value="Électricité">Électricité (كهرباء)</option>
      <option value="Outillage">Outillage (معدات)</option>
    </select>
  </div>

  {/* 💰 السعر والمخزون والوحدة */}
  <div className="grid grid-cols-3 gap-3">
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{t.price}</label>
      <div className="relative">
        <input 
          required type="number" min="0" step="0.01" 
          placeholder="Ex: 65.50" 
          value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} 
          className={`w-full ${language === 'ar' ? 'pr-3 pl-10' : 'pl-3 pr-10'} py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-blue-600 transition-all`} 
        />
        <span className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-2' : 'right-2'} text-[10px] font-bold text-gray-400 uppercase`}>MAD</span>
      </div>
    </div>
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{t.stock}</label>
      <input 
        required type="number" min="0" 
        placeholder="Ex: 150" 
        value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} 
        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-gray-700 transition-all" 
      />
    </div>
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><Scale size={14}/> {t.unit}</label>
      <select 
        value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} 
        className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold text-gray-700 transition-all bg-gray-50"
      >
        {Object.entries(t.units).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
      </select>
    </div>
  </div>

  {/* أزرار الحفظ والإلغاء */}
  <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100">
    <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors">{t.cancel}</button>
    <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30">
      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : t.save}
    </button>
  </div>
</form>
          </div>
        </div>
      )}

      {/* 📦 نافذة تسجيل إتلاف المخزون (Casse/Perte) */}
      {showLossModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50">
              <h3 className="font-black text-orange-800 text-lg flex items-center gap-2"><PackageMinus size={20}/> {t.declareLoss}</h3>
              <button onClick={() => setShowLossModal(false)} className="text-orange-600 hover:bg-orange-200 p-1 rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleLossSubmit} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-500">المنتج</p>
                <p className="font-black text-gray-800 text-lg">{lossData.name}</p>
                <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 text-sm font-bold">
                  المخزون الحالي: <span dir="ltr">{lossData.current_stock} {lossData.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.lossQty}</label>
                <div className="relative">
                  <input required type="number" min="1" max={lossData.current_stock} value={lossData.qty} onChange={(e) => setLossData({...lossData, qty: e.target.value})} className="w-full pr-12 pl-4 py-3 border border-orange-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-black text-orange-600 transition-all text-xl" autoFocus />
                  <span className="absolute top-1/2 -translate-y-1/2 right-4 font-bold text-orange-400 text-sm uppercase">{lossData.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.lossReason}</label>
                <input required type="text" value={lossData.reason} onChange={(e) => setLossData({...lossData, reason: e.target.value})} placeholder="Ex: Cassé, Périmé..." className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium transition-all bg-gray-50" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting || !lossData.qty} className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/30">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18}/> {t.confirmLoss}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* جدول المنتجات */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} />
            <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all`} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.name}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.stock}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.price}</th>
                <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-12"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto" /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-12 text-gray-400 font-medium"><Package size={40} className="mx-auto mb-3 opacity-20" />{t.empty}</td></tr>
              ) : filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-4">
                    <div className="bg-gray-100 p-2.5 rounded-xl text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors"><Box size={18}/></div> 
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-black inline-flex items-center gap-1 ${p.stock_quantity === 0 ? 'bg-red-50 text-red-600 border border-red-100' : p.stock_quantity <= 5 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-emerald-600'}`}>
                      {p.stock_quantity} <span className="text-[10px] uppercase font-bold opacity-70">{p.unit || 'Unité'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-black font-mono text-blue-600 text-base" dir="ltr">
                    {Number(p.price).toLocaleString()} <span className="text-xs font-bold text-gray-400">{t.currency} / {p.unit || 'Unité'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {/* 📦 الزر الجديد لتسجيل التالف */}
                      {p.stock_quantity > 0 && (
                        <button onClick={() => { setLossData({id: p.id, name: p.name, current_stock: p.stock_quantity, unit: p.unit || 'Unité', qty: '', reason: ''}); setShowLossModal(true); }} className="p-2 bg-orange-50 text-orange-500 hover:bg-orange-100 rounded-lg transition-colors" title={t.declareLoss}>
                          <PackageMinus size={18}/>
                        </button>
                      )}
                      <button onClick={() => handleOpenEdit(p)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title={t.editProduct}><Edit size={18}/></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}