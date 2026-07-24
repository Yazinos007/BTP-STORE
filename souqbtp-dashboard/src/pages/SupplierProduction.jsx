import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Factory, Plus, Trash2, Loader2, CheckCircle, AlertTriangle, TrendingUp, Cpu, Layers, DollarSign, ArrowRight } from 'lucide-react';

const translations = {
  ar: {
    title: 'المعمل الرقمي وخطوط الإنتاج',
    subtitle: 'تصميم الوصفات (BOM)، تصنيع المنتجات، ومحاكاة الأرباح الحية.',
    tabs: { recipes: '🧬 وصفات التصنيع (BOM)', production: '🚀 خط الإنتاج الفوري', history: '🕒 سجل المعمل' },
    newRecipe: 'إنشاء وصفة جديدة',
    recipeName: 'اسم الوصفة (مثال: خلطة أسمنت 50 كغ)',
    finishedProduct: 'المنتج النهائي المستهدف',
    selectProduct: '-- اختر المنتج النهائي --',
    components: 'مكونات الوصفة (المواد الخام، التغليف، الاستهلاكية)',
    addMaterial: 'إضافة مكون للوصفة',
    materialPlaceholder: '-- اختر المادة من المخزون --',
    qtyRequired: 'الكمية المطلوبة',
    unit: 'الوحدة',
    estCost: 'التكلفة التقديرية للوحدة:',
    saveRecipe: 'حفظ الوصفة في المعمل',
    noRecipes: 'لا توجد وصفات مسجلة بعد. أنشئ أول وصفة تصنيع!',
    produceTitle: 'تشغيل خط الإنتاج الآلي',
    selectRecipe: 'اختر الوصفة المراد تصنيعها',
    prodQty: 'الكمية المراد إنتاجها (العدد)',
    simulator: '🧠 محاكي الأرباح والجدوى الاقتصادية',
    marketPrice: 'سعر البيع المتوقع في السوق (للوحدة):',
    unitCostLabel: 'تكلفة الإنتاج الفعلية للوحدة:',
    marginLabel: 'هامش الربح المتوقع:',
    netProfitLabel: 'صافي الربح المتوقع للدفعة:',
    startProduction: '🚀 بدء عملية التصنيع الفوري',
    stockWarning: '⚠️ تحذير: بعض المكونات غير متوفرة بالكمية الكافية في المخزون!',
    successProd: '✅ تم التصنيع بنجاح! تم خصم المواد وإضافة المنتجات النهائية للمخزون.',
    historyHeaders: { date: 'التاريخ', recipe: 'الوصفة', qty: 'الكمية المنتجة', unitCost: 'تكلفة الوحدة', total: 'التكلفة الإجمالية' },
    currency: 'MAD'
  },
  fr: {
    title: 'Usine Numérique & Production',
    subtitle: 'Conception de recettes (BOM), fabrication et simulateur de profit.',
    tabs: { recipes: '🧬 Recettes (BOM)', production: '🚀 Ligne de Production', history: '🕒 Historique' },
    newRecipe: 'Créer une Nouvelle Recette',
    recipeName: 'Nom de la recette (Ex: Lot Ciment 50kg)',
    finishedProduct: 'Produit Fini Cible',
    selectProduct: '-- Choisir le produit fini --',
    components: 'Composants (Matières 1ères, Emballages, Consommables)',
    addMaterial: 'Ajouter un composant',
    materialPlaceholder: '-- Choisir l\'article du stock --',
    qtyRequired: 'Quantité requise',
    unit: 'Unité',
    estCost: 'Coût unitaire estimé:',
    saveRecipe: 'Enregistrer la Recette',
    noRecipes: 'Aucune recette enregistrée.',
    produceTitle: 'Lancer la Ligne de Production',
    selectRecipe: 'Sélectionner la recette à fabriquer',
    prodQty: 'Quantité à produire',
    simulator: '🧠 Simulateur de Profit & Viabilité',
    marketPrice: 'Prix de vente estimé sur le marché (par unité):',
    unitCostLabel: 'Coût de production réel par unité:',
    marginLabel: 'Marge Bénéficiaire Estimée:',
    netProfitLabel: 'Bénéfice Net Estimé pour le lot:',
    startProduction: '🚀 Lancer la Fabrication',
    stockWarning: '⚠️ Attention: Composants insuffisants en stock !',
    successProd: '✅ Production réussie ! Stocks mis à jour.',
    historyHeaders: { date: 'Date', recipe: 'Recette', qty: 'Quantité', unitCost: 'Coût Unitaire', total: 'Coût Total' },
    currency: 'MAD'
  },
  en: {
    title: 'Digital Factory & Production',
    subtitle: 'Recipe design (BOM), manufacturing, and live profit simulator.',
    tabs: { recipes: '🧬 Recipes (BOM)', production: '🚀 Production Line', history: '🕒 History' },
    newRecipe: 'Create New Recipe',
    recipeName: 'Recipe Name (Ex: Cement Batch 50kg)',
    finishedProduct: 'Target Finished Good',
    selectProduct: '-- Select Finished Good --',
    components: 'Recipe Components (Raw Materials, Packaging, Consumables)',
    addMaterial: 'Add Component',
    materialPlaceholder: '-- Select Material from Stock --',
    qtyRequired: 'Required Quantity',
    unit: 'Unit',
    estCost: 'Estimated Unit Cost:',
    saveRecipe: 'Save Recipe',
    noRecipes: 'No recipes registered yet.',
    produceTitle: 'Run Automated Production Line',
    selectRecipe: 'Select Recipe to Manufacture',
    prodQty: 'Quantity to Produce',
    simulator: '🧠 Profit & Viability Simulator',
    marketPrice: 'Expected Market Selling Price (per unit):',
    unitCostLabel: 'Actual Production Cost per unit:',
    marginLabel: 'Estimated Profit Margin:',
    netProfitLabel: 'Estimated Net Profit for Batch:',
    startProduction: '🚀 Start Manufacturing',
    stockWarning: '⚠️ Warning: Insufficient stock for some components!',
    successProd: '✅ Production successful! Inventory updated.',
    historyHeaders: { date: 'Date', recipe: 'Recipe', qty: 'Quantity', unitCost: 'Unit Cost', total: 'Total Cost' },
    currency: 'MAD'
  }
};

export default function SupplierProduction() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];

  const [activeTab, setActiveTab] = useState('recipes');
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // حالات نموذج إنشاء الوصفة
  const [recipeName, setRecipeName] = useState('');
  const [finishedProductId, setFinishedProductId] = useState('');
  const [recipeItems, setRecipeItems] = useState([{ material_id: '', quantity_required: '' }]);
  const [notes, setNotes] = useState('');

  // حالات خط الإنتاج ومحاكي الأرباح
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [productionQty, setProductionQty] = useState(1);
  const [marketPrice, setMarketPrice] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (supplier?.id) {
      fetchData();
    }
  }, [supplier]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. جلب المخزون كامل
      const { data: prodData } = await supabase.from('products').select('*').eq('supplier_id', supplier.id);
      if (prodData) setProducts(prodData);

      // 2. جلب الوصفات مع مكوناتها
      const { data: recData } = await supabase.from('product_recipes').select('*, recipe_items(*), products!product_recipes_finished_product_id_fkey(name, price)').eq('supplier_id', supplier.id);
      if (recData) setRecipes(recData);

      // 3. جلب سجل الإنتاج
      const { data: histData } = await supabase.from('production_orders').select('*, product_recipes(recipe_name)').eq('supplier_id', supplier.id).order('created_at', { ascending: false });
      if (histData) setHistory(histData);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // إضافة سطر مكون جديد للوصفة
  const addItemRow = () => {
    setRecipeItems([...recipeItems, { material_id: '', quantity_required: '' }]);
  };

  const removeItemRow = (index) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  // حساب التكلفة التقديرية للوصفة بناءً على أسعار المخزون الحالية
  const calculateEstimatedRecipeCost = () => {
    let total = 0;
    recipeItems.forEach(item => {
      const mat = products.find(p => p.id === item.material_id);
      if (mat && item.quantity_required) {
        total += (mat.price || 0) * Number(item.quantity_required);
      }
    });
    return total;
  };

  // حفظ الوصفة في قاعدة البيانات
  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    if (!recipeName || !finishedProductId || recipeItems.length === 0) return;

    setIsProcessing(true);
    try {
      const estCost = calculateEstimatedRecipeCost();
      // أ) حفظ رأس الوصفة
      const { data: recData, error: recError } = await supabase.from('product_recipes').insert([{
        supplier_id: supplier.id,
        finished_product_id: finishedProductId,
        recipe_name: recipeName,
        estimated_cost: estCost,
        notes: notes
      }]).select().single();

      if (recError) throw recError;

      // ب) حفظ مكونات الوصفة
      const itemsToInsert = recipeItems.map(item => ({
        recipe_id: recData.id,
        material_id: item.material_id,
        quantity_required: Number(item.quantity_required)
      }));

      const { error: itemsError } = await supabase.from('recipe_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      alert("✅ تم حفظ الوصفة في المعمل بنجاح!");
      setRecipeName('');
      setFinishedProductId('');
      setRecipeItems([{ material_id: '', quantity_required: '' }]);
      setNotes('');
      fetchData();
      setActiveTab('recipes');
    } catch (err) {
      alert("خطأ أثناء حفظ الوصفة: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // الوصفة المختارة حالياً في خط الإنتاج
  const activeRecipe = recipes.find(r => r.id === selectedRecipeId);

  // التحقق هل المخزون يكفي للإنتاج؟
  const checkStockSufficiency = () => {
    if (!activeRecipe) return true;
    for (const item of activeRecipe.recipe_items) {
      const mat = products.find(p => p.id === item.material_id);
      const needed = item.quantity_required * productionQty;
      if (!mat || mat.stock_quantity < needed) return false;
    }
    return true;
  };

  // حساب تكلفة الإنتاج للوحدة
  const calculateUnitCost = () => {
    if (!activeRecipe) return 0;
    let total = 0;
    activeRecipe.recipe_items.forEach(item => {
      const mat = products.find(p => p.id === item.material_id);
      total += (mat?.price || 0) * item.quantity_required;
    });
    return total;
  };

  const unitCost = calculateUnitCost();
  const totalBatchCost = unitCost * productionQty;
  const estimatedRevenue = marketPrice * productionQty;
  const netProfit = estimatedRevenue - totalBatchCost;
  const profitMargin = estimatedRevenue > 0 ? (netProfit / estimatedRevenue) * 100 : 0;

  // تنفيذ أمر التصنيع الفوري
  const handleExecuteProduction = async () => {
    if (!activeRecipe) return;
    if (!checkStockSufficiency()) {
      alert(t.stockWarning);
      return;
    }

    setIsProcessing(true);
    try {
      // 1. خصم المكونات من المخزون
      for (const item of activeRecipe.recipe_items) {
        const mat = products.find(p => p.id === item.material_id);
        const newQty = mat.stock_quantity - (item.quantity_required * productionQty);
        await supabase.from('products').update({ stock_quantity: newQty }).eq('id', mat.id);
      }

      // 2. إضافة المنتجات النهائية للمخزون
      const finishedProd = products.find(p => p.id === activeRecipe.finished_product_id);
      if (finishedProd) {
        const newFinishedQty = finishedProd.stock_quantity + Number(productionQty);
        await supabase.from('products').update({ stock_quantity: newFinishedQty }).eq('id', finishedProd.id);
      } else {
        // إذا لم يكن موجوداً كمواد جاهزة، نضيفه
        // (افتراضياً المنتج موجود لأنه تم اختياره عند إنشاء الوصفة)
      }

      // 3. تسجيل أمر الإنتاج في الجدول
      await supabase.from('production_orders').insert([{
        supplier_id: supplier.id,
        recipe_id: activeRecipe.id,
        quantity_produced: Number(productionQty),
        unit_cost_at_production: unitCost,
        total_cost: totalBatchCost,
        status: 'completed'
      }]);

      alert(t.successProd);
      fetchData();
      setProductionQty(1);
    } catch (err) {
      alert("خطأ أثناء التصنيع: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const finishedGoods = products.filter(p => (p.item_type || 'finished_good') === 'finished_good');
  const rawMaterials = products.filter(p => (p.item_type || 'finished_good') !== 'finished_good');

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Factory className="text-amber-500" size={32} /> {t.title}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">{t.subtitle}</p>
      </div>

      {/* التبويبات العلوية */}
      <div className="flex gap-3 border-b border-slate-700 pb-4">
        <button onClick={() => setActiveTab('recipes')} className={`px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'recipes' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          {t.tabs.recipes}
        </button>
        <button onClick={() => setActiveTab('production')} className={`px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'production' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          {t.tabs.production}
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          {t.tabs.history}
        </button>
      </div>

      {/* 🧬 تبويب 1: وصفات التصنيع وإدارتها */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نموذج إنشاء وصفة */}
          <div className="lg:col-span-1 bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-amber-400"><Plus size={20}/> {t.newRecipe}</h3>
            
            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">{t.recipeName}</label>
                <input required type="text" value={recipeName} onChange={e => setRecipeName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 font-medium" placeholder="Ex: خلطة الطلاء الفاخر" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">{t.finishedProduct}</label>
                <select required value={finishedProductId} onChange={e => setFinishedProductId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 font-medium">
                  <option value="">{t.selectProduct}</option>
                  {finishedGoods.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} {p.unit})</option>)}
                </select>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <label className="block text-sm font-bold text-slate-300 mb-2">{t.components}</label>
                {recipeItems.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <select required value={item.material_id} onChange={e => {
                      const newItems = [...recipeItems];
                      newItems[index].material_id = e.target.value;
                      setRecipeItems(newItems);
                    }} className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none">
                      <option value="">{t.materialPlaceholder}</option>
                      {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name} (متوفر: {m.stock_quantity} {m.unit})</option>)}
                    </select>

                    <input required type="number" step="0.01" placeholder="الكمية" value={item.quantity_required} onChange={e => {
                      const newItems = [...recipeItems];
                      newItems[index].quantity_required = e.target.value;
                      setRecipeItems(newItems);
                    }} className="w-20 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none" />

                    {recipeItems.length > 1 && (
                      <button type="button" onClick={() => removeItemRow(index)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItemRow} className="mt-2 text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">+ {t.addMaterial}</button>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">{t.estCost}</span>
                <span className="text-lg font-black text-amber-400" dir="ltr">{calculateEstimatedRecipeCost().toLocaleString()} {t.currency}</span>
              </div>

              <button type="submit" disabled={isProcessing} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition-all shadow-lg shadow-amber-600/30 flex justify-center items-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" size={18}/> : t.saveRecipe}
              </button>
            </form>
          </div>

          {/* قائمة الوصفات المحفوظة */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Cpu className="text-blue-400"/> الوصفات المسجلة في المعمل ({recipes.length})</h3>
            {recipes.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 p-12 text-center rounded-2xl text-slate-400 font-bold">{t.noRecipes}</div>
            ) : (
              recipes.map(rec => (
                <div key={rec.id} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-md hover:border-amber-500/50 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-black text-white">{rec.recipe_name}</h4>
                      <p className="text-xs text-amber-400 font-bold mt-1">المنتج المستهدف: {rec.products?.name || 'غير محدد'}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-sm font-black" dir="ltr">
                      تكلفة الوحدة: {rec.estimated_cost?.toLocaleString()} {t.currency}
                    </span>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300">
                    <p className="font-bold text-slate-400 mb-1">المكونات المطلوبة للوحدة الواحدة:</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.recipe_items?.map((it, idx) => {
                        const matObj = products.find(p => p.id === it.material_id);
                        return (
                          <span key={idx} className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                            {matObj?.name || 'مادة'} : <strong className="text-amber-300">{it.quantity_required} {matObj?.unit}</strong>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 🚀 تبويب 2: خط الإنتاج ومحاكي الأرباح */}
      {activeTab === 'production' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="text-xl font-black text-blue-400 flex items-center gap-2"><Factory size={22}/> {t.produceTitle}</h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">{t.selectRecipe}</label>
              <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-bold">
                <option value="">-- اختر وصفة للتصنيع --</option>
                {recipes.map(r => <option key={r.id} value={r.id}>{r.recipe_name} (تكلفة الوحدة: {r.estimated_cost} د.م)</option>)}
              </select>
            </div>

            {activeRecipe && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">{t.prodQty}</label>
                  <input type="number" min="1" value={productionQty} onChange={e => setProductionQty(Math.max(1, Number(e.target.value)))} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-black text-xl" />
                </div>

                {/* التحقق من توفر المخزون */}
                {!checkStockSufficiency() && (
                  <div className="bg-red-900/20 border border-red-500/40 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold">
                    <AlertTriangle size={24} className="shrink-0"/>
                    <span>{t.stockWarning}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* محاكي الأرباح الفضائي */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2 mb-4"><TrendingUp size={22}/> {t.simulator}</h3>
              
              {activeRecipe ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">{t.marketPrice}</label>
                    <input type="number" step="0.01" value={marketPrice} onChange={e => setMarketPrice(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-black text-lg outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                      <p className="text-xs font-bold text-slate-400">{t.unitCostLabel}</p>
                      <p className="text-lg font-black text-white mt-1" dir="ltr">{unitCost.toLocaleString()} {t.currency}</p>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                      <p className="text-xs font-bold text-slate-400">{t.marginLabel}</p>
                      <p className={`text-lg font-black mt-1 ${profitMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`} dir="ltr">{profitMargin.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-sm font-bold text-emerald-300">{t.netProfitLabel}</span>
                    <span className="text-2xl font-black text-emerald-400" dir="ltr">{netProfit.toLocaleString()} {t.currency}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 font-bold text-center py-10">اختر وصفة من القائمة لعرض محاكي الأرباح.</p>
              )}
            </div>

            {activeRecipe && (
              <button 
                onClick={handleExecuteProduction} 
                disabled={isProcessing || !checkStockSufficiency()} 
                className="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex justify-center items-center gap-2 disabled:opacity-50 text-lg"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={22}/> : <><CheckCircle size={22}/> {t.startProduction}</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🕒 تبويب 3: سجل العمليات */}
      {activeTab === 'history' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase text-xs">
                <th className="p-4 font-black">{t.historyHeaders.date}</th>
                <th className="p-4 font-black">{t.historyHeaders.recipe}</th>
                <th className="p-4 font-black text-center">{t.historyHeaders.qty}</th>
                <th className="p-4 font-black text-end">{t.historyHeaders.unitCost}</th>
                <th className="p-4 font-black text-end">{t.historyHeaders.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {history.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-bold">لا توجد عمليات تصنيع مسجلة بعد.</td></tr>
              ) : (
                history.map(h => (
                  <tr key={h.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 text-slate-400">{new Date(h.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-white">{h.product_recipes?.recipe_name || '---'}</td>
                    <td className="p-4 text-center font-black text-amber-400">{h.quantity_produced}</td>
                    <td className="p-4 text-end font-mono text-slate-300" dir="ltr">{h.unit_cost_at_production?.toLocaleString()} {t.currency}</td>
                    <td className="p-4 text-end font-black text-emerald-400 font-mono" dir="ltr">{h.total_cost?.toLocaleString()} {t.currency}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}