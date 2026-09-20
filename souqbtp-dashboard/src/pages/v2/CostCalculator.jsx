import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useOutletContext } from 'react-router-dom';
import useProjectStore from '../../store/useProjectStore';
import { Calculator, LayoutDashboard, Map, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CostCalculator() {
  const { isDarkMode, language = 'ar' } = useOutletContext();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // 🚀 استدعاء الورش النشط
  const { activeProject } = useProjectStore();
  
  const [selectedStage, setSelectedStage] = useState(1);
  const [costItems, setCostItems] = useState([]);
  const [estimate, setEstimate] = useState([]); 
  const [inputs, setInputs] = useState({}); 
  
  const [globalTva, setGlobalTva] = useState(20);
  const [currency, setCurrency] = useState('MAD');
  const [saveStatus, setSaveStatus] = useState(null);

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
      currency: "درهم",
      noProject: "⚠️ يرجى إنشاء ورش أولاً في لوحة القيادة لحفظ التقديرات!"
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
      currency: "MAD",
      noProject: "⚠️ Veuillez créer un chantier d'abord pour enregistrer les estimations !"
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
      currency: "MAD",
      noProject: "⚠️ Please create a project first to save estimates!"
    }
  }[language];

  const dbTranslations = {
    // Stage 1
    "تصميم معماري": { fr: "Conception Architecturale", en: "Architectural Design" },
    "التصميم المعماري (البلان)": { fr: "Conception Architecturale (Plan)", en: "Architectural Design (Plan)" },
    "هندسة ودراسات": { fr: "Ingénierie et Études", en: "Engineering & Studies" },
    "خدمات استشارية": { fr: "Services de Conseil", en: "Consulting Services" },
    "التصاميم الهندسية": { fr: "Conceptions Techniques", en: "Technical Designs" },
    "التحقق من التصاميم الهندسية": { fr: "Vérification des Conceptions", en: "Design Verification" },
    "التوقيع على النسخة النهائية من التصميم": { fr: "Signature Version Finale", en: "Final Design Signature" },
    "دراسات تقنية": { fr: "Études Techniques", en: "Technical Studies" },
    "حساب تكاليف هيكلية": { fr: "Calcul des Coûts Structurels", en: "Structural Cost Calculation" },
    "تكاليف الوكالة الحضرية والوقاية المدنية": { fr: "Frais d'Agence Urbaine & Protection Civile", en: "Urban Agency & Civil Protection Fees" },
    "وثائق الملكية": { fr: "Documents de Propriété", en: "Property Documents" },
    "تكلفة المشروع": { fr: "Coût du Projet", en: "Project Cost" },
    "عقود المهندسين": { fr: "Contrats d'Ingénieurs", en: "Engineers Contracts" },
    "الرفع الطبوغرافي": { fr: "Relevé Topographique", en: "Topographic Survey" },
    "دراسة التربة (Laboratoire)": { fr: "Étude de Sol (Laboratoire)", en: "Soil Study (Laboratory)" },
    
    // Stage 2
    "أعمال البناء": { fr: "Gros Œuvres / Maçonnerie", en: "Construction / Masonry" },
    "كهرباء": { fr: "Électricité", en: "Electricity" },
    "سباكة (بلومبي)": { fr: "Plomberie", en: "Plumbing" },
    "عزل": { fr: "Isolation & Étanchéité", en: "Insulation" },
    "اعمال حجرية": { fr: "Travaux de pierre", en: "Stone works" },
    "أساسات": { fr: "Fondations", en: "Foundations" },
    "طوب": { fr: "Briques", en: "Bricks" },
    "هيكل خرساني": { fr: "Structure en béton", en: "Concrete structure" },
    "تركيبات كهربائية": { fr: "Installations électriques", en: "Electrical installations" },
    "لوحات توزيع": { fr: "Tableaux de distribution", en: "Distribution boards" },
    "أسلاك وإنارة": { fr: "Câblage et éclairage", en: "Wiring and lighting" },
    "صرف صحي": { fr: "Assainissement", en: "Sanitation" },
    "تمديدات مياه": { fr: "Conduites d'eau", en: "Water pipes" },
    "تركيب حمامات": { fr: "Installation de salles de bain", en: "Bathroom installation" },
    "عزل حراري، مائي، صوتي للأسقف والجدران": { fr: "Isolation (Thermique, Hydrique, Phonique)", en: "Insulation (Thermal, Water, Sound)" },
    "حفر الأساسات (Terrassement)": { fr: "Terrassement", en: "Excavation (Terrassement)" },
    "صب الخرسانة المسلحة (سلعة ويد)": { fr: "Béton armé (Fourniture et Pose)", en: "Reinforced Concrete (Material & Labor)" },
    "صب الخرسانة المسلحة (يد عاملة)": { fr: "Béton armé (Main d'œuvre)", en: "Reinforced Concrete (Labor only)" },
    "بناء الجدران والتقسيم (البريك)": { fr: "Maçonnerie et Cloisons (Briques)", en: "Wall Construction & Partitioning" },
    "أعمال السباكة (البلومبير)": { fr: "Travaux de Plomberie", en: "Plumbing Works" },
    "أعمال الكهرباء": { fr: "Travaux d'Électricité", en: "Electrical Works" },
    "التكييف والتهوية": { fr: "Climatisation et Ventilation", en: "HVAC / Ventilation" },
    "دراسات الخرسانة والحديد": { fr: "Études de Béton et Acier", en: "Concrete & Steel Studies" },
    "استخراج رخصة البناء": { fr: "Obtention du Permis de Construire", en: "Building Permit" },
    
    // Stage 3
    "صيانة + تجديد": { fr: "Entretien et Rénovation", en: "Maintenance & Renovation" },
    "جبص + سيراميك (زليج)": { fr: "Plâtre & Céramique", en: "Plaster & Ceramic" },
    "دهان وتجصيص (صباغة)": { fr: "Peinture et Enduit", en: "Painting & Plastering" },
    "...أبواب، نوافذ، مطابخ، خزائن ملابس، أريكة": { fr: "Portes, fenêtres, cuisines, placards...", en: "Doors, windows, kitchens, closets..." },
    "...صيانة دورية، إصلاحات سريعة، تجديد وتحسين": { fr: "Entretien, réparations, amélioration...", en: "Maintenance, repairs, improvement..." },
    "تركيب أرضيات، جدران، سيراميك، رخام، زليج، جبص الجدران والأسقف": { fr: "Revêtement sol/mur, marbre, plâtre...", en: "Flooring, marble, ceramic, plaster..." },
    "دهان داخلي وخارجي (الصباغة)، تجصيص، طلاء مقاوم للرطوبة": { fr: "Peinture int/ext, enduit, anti-humidité", en: "Int/ext painting, anti-humidity coating" },
    "أعمال العزل (Étanchéité)": { fr: "Travaux d'Étanchéité", en: "Waterproofing Works" },
    "المرطوب (Enduit)": { fr: "Enduit (Mortier)", en: "Plastering (Enduit)" },
    "أعمال الجبس والأسقف": { fr: "Travaux de Plâtre et Plafonds", en: "Plaster & Ceiling Works" },
    "تركيب الزليج والسيراميك": { fr: "Pose de Céramique et Carrelage", en: "Ceramic & Tiling Installation" },
    "الصباغة والواجهات الخارجية": { fr: "Peinture et Façades Extérieures", en: "Painting & Exterior Facades" },
    "النجارة الخشبية": { fr: "Menuiserie Bois", en: "Wood Carpentry" },
    "التشطيب النهائي (سباكة وكهرباء)": { fr: "Finitions Finales (Plomberie & Électricité)", en: "Final Touches (Plumbing & Electrical)" },
    "Jour": { fr: "Menuiserie Aluminium / PVC", en: "Aluminum / PVC Carpentry" },

    // Stage 4
    "شهادة السكنى": { fr: "Permis d'Habiter", en: "Occupancy Permit" },
    "عداد الكهرباء": { fr: "Compteur Électrique", en: "Electricity Meter" },
    "ضريبة السكن": { fr: "Taxe d'Habitation", en: "Housing Tax" },
    "التسجيل العقاري": { fr: "Conservation Foncière", en: "Land Registration" },
    "استخراج شهادة السكنى": { fr: "Obtention du permis d'habiter", en: "Obtaining occupancy permit" },
    "تسجيل الوثائق": { fr: "Enregistrement des documents", en: "Document registration" },
    "التسجيل الجبائي": { fr: "Enregistrement fiscal", en: "Tax registration" },
    "تحفيظ العقار": { fr: "Immatriculation foncière", en: "Property registration" },
    "تحيين التصميم الطبوغرافي": { fr: "Mise à jour du Plan Topographique", en: "Topographic Plan Update" },
    "الربط بشبكة الماء والكهرباء": { fr: "Raccordement Eau et Électricité", en: "Water & Electricity Connection" },
    "مصاريف الموثق والتحفيظ": { fr: "Frais de Notaire et Conservation", en: "Notary & Land Registry Fees" },
    "Licence": { fr: "Licence / Permis", en: "License / Permit" },
    
    // Units
    "رخصة": { fr: "Licence", en: "License" },
    "إجمالي": { fr: "Global", en: "Total" },
    "طابق": { fr: "Étage", en: "Floor" },
    "باب": { fr: "Porte", en: "Door" },
    "عداد": { fr: "Compteur", en: "Meter" },
    "متر": { fr: "Mètre", en: "Meter" },
    "متر مربع": { fr: "Mètre Carré", en: "Square Meter" },
    "يوم": { fr: "Jour", en: "Day" }
  };

  const translateDB = (text) => {
    if (!text) return text;
    if (language === 'ar') return text;
    const clean = text.trim();
    if (dbTranslations[clean] && dbTranslations[clean][language]) {
      return dbTranslations[clean][language];
    }
    for (const [arKey, trans] of Object.entries(dbTranslations)) {
      if (clean.includes(arKey)) return trans[language];
    }
    return text;
  };

  const cardBg = isDarkMode ? 'bg-slate-800/90 border-slate-700 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-800 shadow-md';
  const inputBg = isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800';

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) setUser(currentUser);

      try {
        const { data: settings } = await supabase.from('platform_settings').select('*').limit(1).maybeSingle();
        if (settings) {
          if(settings.currency) setCurrency(settings.currency);
          if(settings.tva) setGlobalTva(settings.tva);
        }
      } catch (e) { console.log('Using default settings'); }

      await loadCostItems(selectedStage, currentUser);
    };

    fetchInitialData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadCostItems(selectedStage, session.user);
      } else {
        setUser(null);
        loadCostItems(selectedStage, null);
      }
    });

    return () => { if(authListener) authListener.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStage, language, activeProject]); // 🚀 تمت إضافة activeProject لمراقبة تغيير الورش

  const loadCostItems = async (stageId, passedUser = user) => {
    setLoading(true);
    try {
      // تفريغ الفاتورة إذا لم يكن هناك ورش نشط
      if (!activeProject) {
        setCostItems([]);
        setEstimate([]);
        setInputs({});
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from('cost_items').select('*').eq('is_active', true).eq('stage_id', stageId).order('sort_order', { ascending: true });

      // 🚀 جلب الميزانية المحفوظة مسبقاً لهذا الورش
      let savedEstimates = [];
      if (passedUser && activeProject) {
        const { data: estData } = await supabase
          .from('user_estimates')
          .select('details')
          .eq('user_id', passedUser.id)
          .eq('project_id', activeProject.id)
          .maybeSingle();
          
        if (estData && estData.details) {
          savedEstimates = estData.details;
          setEstimate(savedEstimates);
        } else {
          setEstimate([]);
        }
      }

      if (!error && data && data.length > 0) {
        setCostItems(data);
        const newInputs = {};
        data.forEach(item => {
          const existing = savedEstimates.find(e => e.itemId === item.id);
          newInputs[item.id] = { qty: existing ? existing.quantity : '', price: existing ? existing.unitPrice : '' };
        });
        setInputs(newInputs);
      } else {
        setCostItems([]);
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleInputChange = (itemId, field, value) => {
    setInputs(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
  };

  const handleAddItem = (item) => {
    if (!activeProject) {
      alert(t.noProject);
      return;
    }
    
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
    if (!user) return alert("Please login");
    if (!activeProject) return alert(t.noProject);
    
    setSaveStatus({ type: 'loading', msg: t.saving });
    try {
      const { data: existingEstimate, error: fetchError } = await supabase
        .from('user_estimates')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', activeProject.id)
        .maybeSingle();

      if (fetchError) {
        console.error("🔍 خطأ أثناء البحث عن الفاتورة:", fetchError);
      }

      let dbError;

      if (existingEstimate) {
        const { error } = await supabase
          .from('user_estimates')
          .update({
            total_cost: grandTotal,
            total_budget: grandTotal,
            details: estimate
          })
          .eq('id', existingEstimate.id);
        dbError = error;
      } else {
        const { error } = await supabase
          .from('user_estimates')
          .insert({
            user_id: user.id,
            project_id: activeProject.id,
            total_cost: grandTotal,
            total_budget: grandTotal,
            details: estimate,
            created_at: new Date().toISOString()
          });
        dbError = error;
      }
      
      if (dbError) throw dbError;
      
      setSaveStatus({ type: 'success', msg: t.saveSuccess });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      // 🚀 هذا السطر سيفضح لنا سبب المشكلة الحقيقي في الكونسول
      console.error("❌ الخطأ التفصيلي من قاعدة البيانات:", error);
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
          {activeProject && (
            <div className="mt-4 inline-block bg-white/10 px-4 py-1.5 rounded-full border border-white/20 text-white font-bold text-sm backdrop-blur-sm">
              {isRtl ? 'الورش الحالي:' : 'Chantier actuel :'} <span className="text-amber-300">{activeProject.name}</span>
            </div>
          )}
        </div>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-2xl mb-6 font-bold flex items-center gap-3 animate-fade-in ${
          saveStatus.type === 'error' ? 'bg-red-100 text-red-700' : saveStatus.type === 'loading' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {saveStatus.type === 'error' ? <AlertCircle /> : <CheckCircle2 />} {saveStatus.msg}
        </div>
      )}

      {/* 🚀 إخفاء محتوى الحاسبة إذا لم يكن هناك ورش */}
      {!activeProject ? (
        <div className={`text-center py-16 rounded-3xl border-2 border-dashed font-bold ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
          {t.noProject}
        </div>
      ) : (
        <>
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
                        <h4 className={`font-black text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>{translateDB(item.name)}</h4>
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
        </>
      )}
    </div>
  );
}