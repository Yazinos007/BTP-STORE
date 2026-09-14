import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useOutletContext } from 'react-router-dom';
import { Calculator, LayoutDashboard, Map, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CostCalculator() {
  const { isDarkMode, language = 'ar' } = useOutletContext();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [selectedStage, setSelectedStage] = useState(1);
  const [costItems, setCostItems] = useState([]);
  const [estimate, setEstimate] = useState([]); // سلة التقديرات
  const [inputs, setInputs] = useState({}); // حالة الحقول { itemId: { qty, price } }
  
  const [globalTva, setGlobalTva] = useState(20);
  const [currency, setCurrency] = useState('MAD');
  const [saveStatus, setSaveStatus] = useState(null);

  // 🌍 قاموس الترجمة الشامل للنصوص الثابتة في الواجهة
  const t = {
    ar: {
      title: "حاسبة التكاليف",
      subtitle: "احسب تكلفة مشروعك بدقة واحترافية",
      backDash: "لوحة التحكم",
      backPath: "مسار الورش",
      stages: [
        { id: 1, name: "التخطيط", desc: "التصميم والدراسات", icon: "📋" },
        { id: 2, name: "التنفيذ", desc: "البناء والتشييد", icon: "🏗️" },
        { id: 3, name: "التشطيب", desc: "التشطيبات النهائية", icon: "🎨" },
        { id: 4, name: "التحفيظ", desc: "الإجراءات القانونية", icon: "📜" }
      ],
      stagePrefix: "مرحلة",
      stageSub: "أضف الكميات المطلوبة لكل عنصر",
      qty: "الكمية",
      unitPrice: "السعر للوحدة",
      total: "الإجمالي",
      addBtn: "➕ إضافة",
      updateBtn: "🔄 تحديث",
      loadingItems: "جاري تحميل عناصر التكلفة...",
      noItems: "لا توجد عناصر تكلفة لهذه المرحلة بعد.",
      summaryTitle: "📊 ملخص التكلفة التقديرية",
      ht: "المجموع الصافي (HT)",
      tvaLabel: "الضريبة (TVA",
      ttc: "المجموع الشامل (TTC)",
      estDetails: "تفاصيل التقدير",
      noEst: "لم تتم إضافة أي عناصر بعد",
      saveBtn: "💾 حفظ التقدير",
      errInput: "⚠️ الرجاء إدخال الكمية والسعر بشكل صحيح",
      successAdd: "✅ تمت العملية بنجاح!",
      saving: "جاري الحفظ...",
      saveSuccess: "✅ تم حفظ التقدير بنجاح!",
      currency: "درهم"
    },
    fr: {
      title: "Calculateur de Coûts",
      subtitle: "Estimez le coût de votre projet avec précision",
      backDash: "Tableau de bord",
      backPath: "Parcours",
      stages: [
        { id: 1, name: "Planification", desc: "Conception et études", icon: "📋" },
        { id: 2, name: "Exécution", desc: "Construction", icon: "🏗️" },
        { id: 3, name: "Finition", desc: "Finitions finales", icon: "🎨" },
        { id: 4, name: "Enregistrement", desc: "Procédures légales", icon: "📜" }
      ],
      stagePrefix: "Étape :",
      stageSub: "Ajoutez les quantités pour chaque élément",
      qty: "Quantité",
      unitPrice: "Prix Unitaire",
      total: "Total",
      addBtn: "➕ Ajouter",
      updateBtn: "🔄 Mettre à jour",
      loadingItems: "Chargement...",
      noItems: "Aucun élément de coût pour cette étape.",
      summaryTitle: "📊 Résumé de l'Estimation",
      ht: "Total Net (HT)",
      tvaLabel: "Taxe (TVA",
      ttc: "Total Global (TTC)",
      estDetails: "Détails de l'estimation",
      noEst: "Aucun élément ajouté",
      saveBtn: "💾 Enregistrer",
      errInput: "⚠️ Veuillez entrer une quantité et un prix valides",
      successAdd: "✅ Opération réussie !",
      saving: "Enregistrement...",
      saveSuccess: "✅ Estimation enregistrée avec succès !",
      currency: "MAD"
    },
    en: {
      title: "Cost Calculator",
      subtitle: "Calculate your project cost accurately",
      backDash: "Dashboard",
      backPath: "Project Path",
      stages: [
        { id: 1, name: "Planning", desc: "Design & Studies", icon: "📋" },
        { id: 2, name: "Execution", desc: "Construction", icon: "🏗️" },
        { id: 3, name: "Finishing", desc: "Final Touches", icon: "🎨" },
        { id: 4, name: "Registration", desc: "Legal Procedures", icon: "📜" }
      ],
      stagePrefix: "Stage:",
      stageSub: "Add required quantities for each item",
      qty: "Quantity",
      unitPrice: "Unit Price",
      total: "Total",
      addBtn: "➕ Add",
      updateBtn: "🔄 Update",
      loadingItems: "Loading...",
      noItems: "No cost items for this stage yet.",
      summaryTitle: "📊 Estimate Summary",
      ht: "Net Total (HT)",
      tvaLabel: "Tax (VAT",
      ttc: "Grand Total (TTC)",
      estDetails: "Estimate Details",
      noEst: "No items added yet",
      saveBtn: "💾 Save Estimate",
      errInput: "⚠️ Please enter valid quantity and price",
      successAdd: "✅ Operation successful!",
      saving: "Saving...",
      saveSuccess: "✅ Estimate saved successfully!",
      currency: "MAD"
    }
  }[language];

  // 🚀 القاموس الاعتراضي لترجمة البيانات القادمة من قاعدة البيانات
  const dbTranslations = {
    "التصميم المعماري (البلان)": { fr: "Conception Architecturale (Plan)", en: "Architectural Design (Plan)" },
    "الرفع الطبوغرافي": { fr: "Relevé Topographique", en: "Topographic Survey" },
    "دراسة التربة (Laboratoire)": { fr: "Étude de Sol (Laboratoire)", en: "Soil Study (Laboratory)" },
    "رخصة": { fr: "Licence", en: "License" },
    "متر": { fr: "Mètre", en: "Meter" },
    "متر مربع": { fr: "Mètre Carré", en: "Square Meter" },
    "يوم": { fr: "Jour", en: "Day" }
  };

  const translateDB = (text) => {
    if (!text) return text;
    if (language === 'ar') return text;
    return dbTranslations[text.trim()]?.[language] || text;
  };

  // 💎 كلاسات التصميم المتجاوبة مع الإضاءة
  const cardBg = isDarkMode ? 'bg-slate-800/90 border-slate-700 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-800 shadow-md';
  const inputBg = isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800';

  useEffect(() => {
    initCalculator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCostItems(selectedStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStage]);

  const initCalculator = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser(user);

    try {
      const { data: settings } = await supabase.from('platform_settings').select('*').limit(1).maybeSingle();
      if (settings) {
        if(settings.currency) setCurrency(settings.currency);
        if(settings.tva) setGlobalTva(settings.tva);
      }
    } catch (e) { console.log('Using default financial settings'); }
  };

  const loadCostItems = async (stageId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cost_items')
        .select('*')
        .eq('is_active', true)
        .eq('stage_id', stageId)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setCostItems(data);
        const newInputs = { ...inputs };
        data.forEach(item => {
          if (!newInputs[item.id]) {
            const existing = estimate.find(e => e.itemId === item.id);
            newInputs[item.id] = {
              qty: existing ? existing.quantity : '',
              price: existing ? existing.unitPrice : ''
            };
          }
        });
        setInputs(newInputs);
      } else {
        // Mock data ثابت باللغة العربية ليتم ترجمته ديناميكياً
        const mockData = [
          { id: stageId * 10 + 1, name: 'التصميم المعماري (البلان)', min_price: 8000, max_price: 25000, unit: 'رخصة' },
          { id: stageId * 10 + 2, name: 'الرفع الطبوغرافي', min_price: 1500, max_price: 3500, unit: 'رخصة' },
          { id: stageId * 10 + 3, name: 'دراسة التربة (Laboratoire)', min_price: 2000, max_price: 4000, unit: 'رخصة' }
        ];
        setCostItems(mockData);
        const newInputs = { ...inputs };
        mockData.forEach(item => {
          if (!newInputs[item.id]) newInputs[item.id] = { qty: '', price: '' };
        });
        setInputs(newInputs);
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleInputChange = (itemId, field, value) => {
    setInputs(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const handleAddItem = (item) => {
    const qty = parseFloat(inputs[item.id]?.qty);
    const price = parseFloat(inputs[item.id]?.price);

    if (!qty || qty <= 0 || !price || price <= 0) {
      setSaveStatus({ type: 'error', msg: t.errInput });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    const subtotal = qty * price;
    const existingIndex = estimate.findIndex(e => e.itemId === item.id);
    const newEstimate = [...estimate];

    if (existingIndex >= 0) {
      newEstimate[existingIndex] = { itemId: item.id, name: item.name, quantity: qty, unit: item.unit, unitPrice: price, subtotal };
    } else {
      newEstimate.push({ itemId: item.id, name: item.name, quantity: qty, unit: item.unit, unitPrice: price, subtotal });
    }

    setEstimate(newEstimate);
    setSaveStatus({ type: 'success', msg: t.successAdd });
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleSaveEstimate = async () => {
    if (estimate.length === 0) return;
    setSaveStatus({ type: 'loading', msg: t.saving });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus({ type: 'success', msg: t.saveSuccess });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', msg: "Error saving estimate" });
    }
  };

  const subTotal = estimate.reduce((sum, item) => sum + item.subtotal, 0);
  const tvaAmount = subTotal * (globalTva / 100);
  const grandTotal = subTotal + tvaAmount;

  return (
    <div className="animate-fade-in pb-24 max-w-6xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg shadow-blue-900/20">
        <div className={`flex gap-3 w-full md:w-auto ${isRtl ? 'md:order-2' : ''}`}>
          <Link to="/v2/contractor-dashboard" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all backdrop-blur-sm">
            <LayoutDashboard size={18} /> {t.backDash}
          </Link>
          <Link to="/v2/project-path" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all backdrop-blur-sm">
            <Map size={18} /> {t.backPath}
          </Link>
        </div>
        <div className={`text-center md:text-${isRtl ? 'right' : 'left'} w-full md:w-auto ${isRtl ? 'md:order-1' : ''}`}>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-2">💰 {t.title}</h1>
          <p className="text-blue-100 font-bold">{t.subtitle}</p>
        </div>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-2xl mb-6 font-bold flex items-center gap-3 animate-fade-in ${
          saveStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {saveStatus.type === 'error' ? <AlertCircle /> : <CheckCircle2 />} {saveStatus.msg}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {t.stages.map(stage => {
          const isActive = selectedStage === stage.id;
          return (
            <div 
              key={stage.id} 
              onClick={() => setSelectedStage(stage.id)}
              className={`p-6 rounded-2xl border-4 cursor-pointer transition-all duration-300 text-center flex flex-col items-center justify-center gap-3 ${
                isActive 
                  ? 'border-orange-400 bg-orange-50/50 shadow-lg transform scale-105 z-10' 
                  : `border-transparent hover:border-blue-200 hover:-translate-y-1 shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`
              }`}
            >
              <span className="text-4xl drop-shadow-sm">{stage.icon}</span>
              <div>
                <h3 className={`font-black text-lg ${isActive ? 'text-blue-800' : (isDarkMode ? 'text-white' : 'text-slate-700')}`}>{stage.name}</h3>
                <p className={`text-xs font-bold ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>{stage.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className={`p-6 md:p-8 rounded-3xl border mb-8 shadow-sm ${cardBg}`}>
        <h2 className="text-2xl font-black text-blue-600 mb-2">{t.stagePrefix} {t.stages.find(s => s.id === selectedStage)?.name}</h2>
        <p className={`font-bold mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.stageSub}</p>

        {loading ? (
          <div className="text-center py-12 font-bold text-slate-400">{t.loadingItems}</div>
        ) : costItems.length === 0 ? (
          <div className="text-center py-12 font-bold text-slate-400">{t.noItems}</div>
        ) : (
          <div className="space-y-4">
            {costItems.map(item => {
              const savedItem = estimate.find(e => e.itemId === item.id);
              const isAdded = !!savedItem;
              const currentQty = inputs[item.id]?.qty || '';
              const currentPrice = inputs[item.id]?.price || '';
              const rowTotal = (parseFloat(currentQty) || 0) * (parseFloat(currentPrice) || 0);

              return (
                <div key={item.id} className={`p-5 rounded-2xl border-2 transition-colors ${isAdded ? 'border-emerald-200 bg-emerald-50/30' : (isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50')}`}>
                  <div className="flex justify-between items-start mb-4">
                    {/* 🚀 ترجمة اسم العنصر باستخدام القاموس الاعتراضي */}
                    <h4 className={`font-black text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>{translateDB(item.name)}</h4>
                    
                    {/* 🚀 ترجمة وحدة القياس */}
                    <span className="font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg text-sm border border-emerald-500/20">
                      {item.min_price} - {item.max_price} {t.currency}/{translateDB(item.unit)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-bold mb-2 opacity-80">{t.qty}</label>
                      <input 
                        type="number" 
                        min="0" 
                        value={currentQty} 
                        onChange={(e) => handleInputChange(item.id, 'qty', e.target.value)}
                        className={`w-full p-3 rounded-xl border outline-none focus:border-blue-500 font-bold ${inputBg}`} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 opacity-80">{t.unitPrice}</label>
                      <input 
                        type="number" 
                        value={currentPrice} 
                        onChange={(e) => handleInputChange(item.id, 'price', e.target.value)}
                        placeholder={`${item.min_price} - ${item.max_price}`}
                        className={`w-full p-3 rounded-xl border outline-none focus:border-blue-500 font-bold ${inputBg}`} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 opacity-80">{t.total}</label>
                      <div className={`w-full p-3 rounded-xl border font-black ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200/50 border-slate-200'}`}>
                        {rowTotal > 0 ? rowTotal.toLocaleString() : '0'} {t.currency}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddItem(item)}
                      className={`w-full p-3 rounded-xl font-black text-white transition-all hover:-translate-y-1 shadow-md ${
                        isAdded ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                      }`}
                    >
                      {isAdded ? t.updateBtn : t.addBtn}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl p-6 md:p-10 shadow-2xl shadow-purple-900/30 text-white">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">📊 {t.summaryTitle}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div className="text-sm font-bold opacity-80 mb-2">{t.ht}</div>
            <div className="text-3xl font-black">{subTotal.toLocaleString()} {t.currency}</div>
          </div>
          <div className="bg-orange-500/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-orange-400/30">
            <div className="text-sm font-bold opacity-80 mb-2">{t.tvaLabel} {globalTva}%)</div>
            <div className="text-3xl font-black text-orange-300">{tvaAmount.toLocaleString()} {t.currency}</div>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-emerald-400/30">
            <div className="text-sm font-bold opacity-80 mb-2">{t.ttc}</div>
            <div className="text-3xl font-black text-emerald-300">{grandTotal.toLocaleString()} {t.currency}</div>
          </div>
        </div>

        <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-inner">
          <h3 className="font-black text-blue-800 mb-4 text-lg">{t.estDetails}</h3>
          
          {estimate.length === 0 ? (
            <div className="text-center py-8 font-bold text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">{t.noEst}</div>
          ) : (
            <div className="space-y-3">
              {estimate.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    {/* 🚀 ترجمة اسم العنصر ووحدة القياس داخل الفاتورة */}
                    <div className="font-black text-slate-700">{translateDB(item.name)}</div>
                    <div className="text-sm font-bold text-slate-400 mt-1">{item.quantity} {translateDB(item.unit)} × {item.unitPrice.toLocaleString()} {t.currency}</div>
                  </div>
                  <div className="font-black text-emerald-600 text-lg">{item.subtotal.toLocaleString()} {t.currency}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleSaveEstimate}
          disabled={estimate.length === 0 || saveStatus?.type === 'loading'}
          className={`w-full mt-6 py-4 rounded-xl font-black text-lg transition-all shadow-xl ${
            estimate.length === 0 
              ? 'bg-white/20 text-white/50 cursor-not-allowed' 
              : 'bg-blue-900 hover:bg-blue-950 text-white hover:-translate-y-1 shadow-black/20'
          }`}
        >
          {saveStatus?.type === 'loading' ? t.saving : t.saveBtn}
        </button>
      </div>

    </div>
  );
}