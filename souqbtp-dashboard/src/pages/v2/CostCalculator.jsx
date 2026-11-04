import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useOutletContext, useLocation } from 'react-router-dom';
import useProjectStore from '../../store/useProjectStore';
import { Calculator, LayoutDashboard, Map, CheckCircle2, AlertCircle, HardHat, Edit3, FolderKanban } from 'lucide-react';

// ⚡ ذاكرة تخزين فورية على مستوى الجلسة لمنع إعادة التحميل عند الخروج والدخول المتكرر
const CALCULATOR_CACHE = {
  user: null,
  settingsLoaded: false,
  currency: 'MAD',
  globalTva: 20,
  stagesData: {},
  customProjectsByRole: {}
};

// فاحص صيغة UUID لحماية قاعدة البيانات من خطأ 400 Bad Request
const isValidUUID = (val) =>
  typeof val === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

export default function CostCalculator() {
  const { isDarkMode, language = 'ar' } = useOutletContext();
  const location = useLocation();
  const isRtl = language === 'ar';

  // 🔥 تحديد الفضاء الحالي بدقة منذ اللحظة الأولى
  const currentRole = sessionStorage.getItem('sasbtp_v2_role');
  const isProviderSpace = location.pathname.includes('/provider') || currentRole === 'provider';
  const isArchitectSpace = location.pathname.includes('/architect') || currentRole === 'architect';
  const isIndependentSpace = isProviderSpace || isArchitectSpace;
  const roleKey = isArchitectSpace ? 'architect' : isProviderSpace ? 'provider' : 'contractor';

  const getInitialIndependentProject = () => {
    const defaultName = isArchitectSpace
      ? (language === 'ar' ? 'مشروع هندسي جديد' : 'Nouveau Projet Architectural')
      : (language === 'ar' ? 'تسعيرة زبون (Devis Pro)' : 'Devis Client Pro');

    let savedCustomName = null;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`sasbtp_${roleKey}_devis_name_`)) {
          savedCustomName = localStorage.getItem(k);
          break;
        }
      }
    } catch (e) {}

    return {
      id: `${roleKey}-default-devis`,
      name: savedCustomName || defaultName
    };
  };

  // 🚀 استدعاء الورش النشط (للمقاول فقط)
  const { activeProject } = useProjectStore();

  // 🛠️ حالة خاصة بأوراش وتسعيرات الحرفي والمهندس
  const [customProjects, setCustomProjects] = useState(() => {
    return CALCULATOR_CACHE.customProjectsByRole[roleKey] || [getInitialIndependentProject()];
  });

  const [selectedCustomProject, setSelectedCustomProject] = useState(() => {
    const cachedList = CALCULATOR_CACHE.customProjectsByRole[roleKey];
    return cachedList && cachedList.length > 0 ? cachedList[0] : getInitialIndependentProject();
  });

  const [customDevisName, setCustomDevisName] = useState('');
  const [isEditingDevisName, setIsEditingDevisName] = useState(false);

  // الورش الفعلي المعتمد حسب الفضاء الحالي
  const effectiveProject = isIndependentSpace ? selectedCustomProject : activeProject;

  const [selectedStage, setSelectedStage] = useState(1);

  const [costItems, setCostItems] = useState(() => CALCULATOR_CACHE.stagesData[1] || []);
  const [loading, setLoading] = useState(() => !CALCULATOR_CACHE.stagesData[1]);
  const [user, setUser] = useState(() => CALCULATOR_CACHE.user);

  const [estimate, setEstimate] = useState([]);
  const [inputs, setInputs] = useState({});

  const [globalTva, setGlobalTva] = useState(() => CALCULATOR_CACHE.globalTva);
  const [currency, setCurrency] = useState(() => CALCULATOR_CACHE.currency);
  const [saveStatus, setSaveStatus] = useState(null);

  const t = {
    ar: {
      title: isArchitectSpace ? "مسطرة القياس الذكية" : (isProviderSpace ? "حاسبة السلعة & Devis" : "حاسبة التكاليف"),
      subtitle: isArchitectSpace ? "حساب التكلفة التقديرية للمشروع والدراسات الهندسية" : (isProviderSpace ? "احسب كميات السلعة وتكلفة اليد العاملة لزبنائك بدقة" : "احسب تكلفة مشروعك بدقة واحترافية"),
      backDash: "لوحة التحكم",
      backPath: isArchitectSpace ? "إدارة المشاريع" : (isProviderSpace ? "أوراشي الجارية" : "مسار الورش"),
      devisLabel: isArchitectSpace ? "المشروع الهندسي:" : (isProviderSpace ? "التسعيرة / الورش:" : "الورش الحالي:"),
      editDevisPlaceholder: isArchitectSpace ? "اسم المشروع أو الزبون..." : "اسم الزبون أو الورش...",
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
      title: isArchitectSpace ? "Règle & Mesures" : (isProviderSpace ? "Calculateur Matériaux & Devis" : "Calculateur de Coûts"),
      subtitle: isArchitectSpace ? "Estimation des coûts et études du projet" : (isProviderSpace ? "Calculez vos matériaux et devis clients avec précision" : "Estimez le coût de votre projet avec précision"),
      backDash: "Tableau de bord",
      backPath: isArchitectSpace ? "Contrôle & Projets" : (isProviderSpace ? "Chantiers en Cours" : "Parcours"),
      devisLabel: isArchitectSpace ? "Projet Architectural :" : (isProviderSpace ? "Devis / Chantier :" : "Chantier actuel :"),
      editDevisPlaceholder: "Nom du client ou projet...",
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
      title: isArchitectSpace ? "Smart Ruler & Calculator" : (isProviderSpace ? "Material & Devis Calculator" : "Cost Calculator"),
      subtitle: isArchitectSpace ? "Project cost estimation and architectural studies" : (isProviderSpace ? "Calculate materials and client quotes accurately" : "Calculate your project cost accurately"),
      backDash: "Dashboard",
      backPath: isArchitectSpace ? "Projects & Approvals" : (isProviderSpace ? "Active Workshops" : "Project Path"),
      devisLabel: isArchitectSpace ? "Architectural Project:" : (isProviderSpace ? "Quote / Workshop:" : "Current Project:"),
      editDevisPlaceholder: "Client or project name...",
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
    "البلان": { fr: "Conception Architecturale (Plan)", en: "Architectural Design (Plan)" },
    "هندسة ودراسات": { fr: "Ingénierie et Études", en: "Engineering & Studies" },
    "خدمات استشارية": { fr: "Services de Conseil", en: "Consulting Services" },
    "التصاميم الهندسية": { fr: "Conceptions Techniques", en: "Technical Designs" },
    "التحقق من التصاميم": { fr: "Vérification des Conceptions", en: "Design Verification" },
    "التوقيع على النسخة": { fr: "Signature Version Finale", en: "Final Design Signature" },
    "دراسات تقنية": { fr: "Études Techniques", en: "Technical Studies" },
    "تكاليف هيكلية": { fr: "Calcul des Coûts Structurels", en: "Structural Cost Calculation" },
    "الوكالة الحضرية": { fr: "Frais d'Agence Urbaine & Protection Civile", en: "Urban Agency & Civil Protection Fees" },
    "وثائق الملكية": { fr: "Documents de Propriété", en: "Property Documents" },
    "تكلفة المشروع": { fr: "Coût du Projet", en: "Project Cost" },
    "عقود المهندسين": { fr: "Contrats d'Ingénieurs", en: "Engineers Contracts" },
    "طبوغرافي": { fr: "Relevé Topographique", en: "Topographic Survey" },
    "تربة": { fr: "Étude de Sol (Laboratoire)", en: "Soil Study (Laboratory)" },
    "دراسات الخرسانة": { fr: "Études de Béton et Acier", en: "Concrete & Steel Studies" },
    "رخصة البناء": { fr: "Obtention du Permis de Construire", en: "Building Permit" },
    
    // Stage 2
    "أعمال البناء": { fr: "Gros Œuvres / Maçonnerie", en: "Construction / Masonry" },
    "كهرباء": { fr: "Électricité", en: "Electricity" },
    "سباكة": { fr: "Plomberie", en: "Plumbing" },
    "أعمال حجرية": { fr: "Travaux de pierre", en: "Stone works" },
    "أساسات": { fr: "Fondations", en: "Foundations" },
    "طوب": { fr: "Briques", en: "Bricks" },
    "هيكل خرساني": { fr: "Structure en béton", en: "Concrete structure" },
    "تركيبات كهربائية": { fr: "Installations électriques", en: "Electrical installations" },
    "لوحات توزيع": { fr: "Tableaux de distribution", en: "Distribution boards" },
    "أسلاك وإنارة": { fr: "Câblage et éclairage", en: "Wiring and lighting" },
    "صرف صحي": { fr: "Assainissement", en: "Sanitation" },
    "تمديدات مياه": { fr: "Conduites d'eau", en: "Water pipes" },
    "تركيب حمامات": { fr: "Installation de salles de bain", en: "Bathroom installation" },
    "حفر الأساسات": { fr: "Terrassement", en: "Excavation (Terrassement)" },
    "صب الخرسانة المسلحة (سلعة ويد)": { fr: "Béton armé (Fourniture et Pose)", en: "Reinforced Concrete (Material & Labor)" },
    "بناء الجدران": { fr: "Maçonnerie et Cloisons (Briques)", en: "Wall Construction & Partitioning" },
    "التكييف والتهوية": { fr: "Climatisation et Ventilation", en: "HVAC / Ventilation" },
    
    // Stage 3
    "صيانة": { fr: "Entretien et Rénovation", en: "Maintenance & Renovation" },
    "عزل": { fr: "Isolation & Étanchéité", en: "Insulation" },
    "جبص": { fr: "Plâtre & Céramique", en: "Plaster & Ceramic" },
    "دهان": { fr: "Peinture et Enduit", en: "Painting & Plastering" },
    "أعمال الجبس والأسقف": { fr: "Travaux de Plâtre et Plafonds", en: "Plaster & Ceiling Works" },
    "أبواب": { fr: "Portes, fenêtres, cuisines, placards...", en: "Doors, windows, kitchens, closets..." },
    "أرضيات": { fr: "Revêtement sol/mur, marbre, plâtre...", en: "Flooring, marble, ceramic, plaster..." },
    "المرطوب": { fr: "Enduit (Mortier)", en: "Plastering (Enduit)" },
    "زليج": { fr: "Pose de Céramique et Carrelage", en: "Ceramic & Tiling Installation" },
    "صباغة": { fr: "Peinture et Façades Extérieures", en: "Painting & Exterior Facades" },
    "نجارة": { fr: "Menuiserie Bois", en: "Wood Carpentry" },
    "التشطيب النهائي": { fr: "Finitions Finales (Plomberie & Électricité)", en: "Final Touches (Plumbing & Electrical)" },
    "الألمنيوم والزجاج": { fr: "Menuiserie Aluminium et Vitrage", en: "Aluminum and Glass" },
    
    // Stage 4
    "شهادة السكنى": { fr: "Permis d'Habiter", en: "Occupancy Permit" },
    "عداد الكهرباء": { fr: "Compteur Électrique", en: "Electricity Meter" },
    "ضريبة السكن": { fr: "Taxe d'Habitation", en: "Housing Tax" },
    "التسجيل العقاري": { fr: "Conservation Foncière", en: "Land Registration" },
    "تسجيل الوثائق": { fr: "Enregistrement des documents", en: "Document registration" },
    "التسجيل الجبائي": { fr: "Enregistrement fiscal", en: "Tax registration" },
    "تحفيظ العقار": { fr: "Immatriculation foncière", en: "Property registration" },
    "تحيين التصميم": { fr: "Mise à jour du Plan Topographique", en: "Topographic Plan Update" },
    "الربط بشبكة الماء والكهرباء": { fr: "Raccordement Eau et Électricité", en: "Water & Electricity Connection" },
    "مصاريف الموثق": { fr: "Frais de Notaire et Conservation", en: "Notary & Land Registry Fees" },
    "رخصة السكن وشهادة المطابقة": { fr: "Permis d'Habiter et Conformité", en: "Occupancy Permit & Conformity" },

    // الوحدات (Units)
    "رخصة": { fr: "Licence", en: "License" },
    "إجمالي": { fr: "Global", en: "Total" },
    "طابق": { fr: "Étage", en: "Floor" },
    "باب": { fr: "Porte", en: "Door" },
    "عداد": { fr: "Compteur", en: "Meter" },
    "متر مربع": { fr: "Mètre Carré", en: "Square Meter" },
    "متر": { fr: "Mètre", en: "Meter" },
    "يوم": { fr: "Jour", en: "Day" }
  };

  const translateDB = (text) => {
    if (!text || typeof text !== 'string') return text; 
    if (language === 'ar') return text;
    const clean = text.trim();
    if (dbTranslations[clean] && dbTranslations[clean][language]) {
      return dbTranslations[clean][language];
    }
    const sortedKeys = Object.keys(dbTranslations).sort((a, b) => b.length - a.length);
    for (const arKey of sortedKeys) {
      if (clean.includes(arKey)) return dbTranslations[arKey][language];
    }
    return text;
  };

  const cardBg = isDarkMode ? 'bg-slate-800/90 border-slate-700 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-800 shadow-md';
  const inputBg = isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800';

  useEffect(() => {
    if (!isIndependentSpace) return;
    const updatedDefault = getInitialIndependentProject();
    setSelectedCustomProject(prev => {
      if (prev.id === `${roleKey}-default-devis` && prev.name !== updatedDefault.name) {
        return { ...prev, name: updatedDefault.name };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, roleKey, isIndependentSpace]);

  // 🚀 جلب البيانات بدون أي ارتعاش أو أخطاء 400 / 404
  useEffect(() => {
    let isMounted = true;

    const syncCalculatorData = async () => {
      if (!effectiveProject) {
        setCostItems([]);
        setEstimate([]);
        setInputs({});
        setLoading(false);
        return;
      }

      const cachedStageItems = CALCULATOR_CACHE.stagesData[selectedStage];
      if (cachedStageItems) {
        setCostItems(cachedStageItems);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        let currentUser = CALCULATOR_CACHE.user;
        if (!currentUser) {
          const { data: { user: fetchedUser } } = await supabase.auth.getUser();
          currentUser = fetchedUser;
          CALCULATOR_CACHE.user = fetchedUser;
        }
        if (isMounted && currentUser && (!user || user.id !== currentUser.id)) {
          setUser(currentUser);
        }

        if (!CALCULATOR_CACHE.settingsLoaded) {
          CALCULATOR_CACHE.settingsLoaded = true;
          try {
            const { data: settings } = await supabase.from('platform_settings').select('*').limit(1).maybeSingle();
            if (settings) {
              if (settings.currency) {
                CALCULATOR_CACHE.currency = settings.currency;
                if (isMounted) setCurrency(settings.currency);
              }
              if (settings.tva) {
                CALCULATOR_CACHE.globalTva = settings.tva;
                if (isMounted) setGlobalTva(settings.tva);
              }
            }
          } catch (e) {}
        }

        // جلب التقديرات المحفوظة مع فحص UUID لمنع خطأ 400 Bad Request
        let savedEstimates = [];
        if (currentUser && effectiveProject) {
          if (isIndependentSpace || !isValidUUID(String(effectiveProject.id))) {
            const storageKey = `sasbtp_${roleKey}_est_${currentUser.id}_${effectiveProject.id}`;
            const localSaved = localStorage.getItem(storageKey);
            if (localSaved) {
              try {
                savedEstimates = JSON.parse(localSaved);
              } catch (e) {
                savedEstimates = [];
              }
            }
          } else {
            const { data: estData } = await supabase
              .from('user_estimates')
              .select('details')
              .eq('user_id', currentUser.id)
              .eq('project_id', effectiveProject.id)
              .maybeSingle();

            if (estData && estData.details) {
              savedEstimates = estData.details;
            }
          }
        }

        if (isMounted) {
          setEstimate(savedEstimates);
        }

        let stageItems = cachedStageItems;
        if (!stageItems) {
          const { data, error } = await supabase
            .from('cost_items')
            .select('*')
            .eq('is_active', true)
            .eq('stage_id', selectedStage)
            .order('sort_order', { ascending: true });

          if (!error && data) {
            stageItems = data;
            CALCULATOR_CACHE.stagesData[selectedStage] = data;
          } else {
            stageItems = [];
          }
        }

        if (isMounted) {
          setCostItems(stageItems);
          const newInputs = {};
          stageItems.forEach(item => {
            const existing = savedEstimates.find(e => e.itemId === item.id);
            newInputs[item.id] = {
              qty: existing ? existing.quantity : '',
              price: existing ? existing.unitPrice : ''
            };
          });
          setInputs(newInputs);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };

    syncCalculatorData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStage, effectiveProject?.id, isIndependentSpace, roleKey]);

  const handleInputChange = (itemId, field, value) => {
    setInputs(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
  };

  const handleAddItem = (item) => {
    if (!effectiveProject) {
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
    if (!effectiveProject) return alert(t.noProject);
    
    setSaveStatus({ type: 'loading', msg: t.saving });
    try {
      if (isIndependentSpace || !isValidUUID(String(effectiveProject.id))) {
        const storageKey = `sasbtp_${roleKey}_est_${user.id}_${effectiveProject.id}`;
        localStorage.setItem(storageKey, JSON.stringify(estimate));
        setSaveStatus({ type: 'success', msg: t.saveSuccess });
        setTimeout(() => setSaveStatus(null), 3000);
        return;
      }

      const { data: existingEstimate, error: fetchError } = await supabase
        .from('user_estimates')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', effectiveProject.id)
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
            project_id: effectiveProject.id,
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
      console.error("❌ الخطأ التفصيلي من قاعدة البيانات:", error);
      setSaveStatus({ type: 'error', msg: "Error saving estimate" });
    }
  };

  const handleSaveCustomDevisName = () => {
    if (!customDevisName.trim()) {
      setIsEditingDevisName(false);
      return;
    }
    const updatedName = customDevisName.trim();
    const uid = user?.id || 'default';
    localStorage.setItem(`sasbtp_${roleKey}_devis_name_${uid}`, updatedName);

    const updatedProj = { ...selectedCustomProject, name: updatedName };
    setSelectedCustomProject(updatedProj);
    setCustomProjects(prev => {
      const next = prev.map(p => (p.id === updatedProj.id ? updatedProj : p));
      CALCULATOR_CACHE.customProjectsByRole[roleKey] = next;
      return next;
    });
    setIsEditingDevisName(false);
  };

  const subTotal = estimate.reduce((sum, item) => sum + item.subtotal, 0);
  const tvaAmount = subTotal * (globalTva / 100);
  const grandTotal = subTotal + tvaAmount;

  // مسارات وعناصر الأزرار العليا النظيفة لتفادي أخطاء JSX Parsing
  const dashboardRoute = isArchitectSpace ? '/v2/architect-dashboard' 
                       : isProviderSpace ? '/v2/provider-dashboard' 
                       : '/v2/contractor-dashboard';
                       
  const secondaryRoute = isArchitectSpace ? '/v2/architect-projects' 
                       : isProviderSpace ? '/v2/provider-projects' 
                       : '/v2/project-path';

  const SecondaryIcon = isArchitectSpace ? FolderKanban : isProviderSpace ? HardHat : Map;
  const headerAlignClass = isRtl ? 'text-center md:text-right md:order-1' : 'text-center md:text-left';
  const headerBtnOrderClass = isRtl ? 'md:order-2' : '';

  return (
    <div className="calc-stable-scope pb-24 max-w-6xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 🛡️ درع تثبيت الحاسبة لمنع ارتعاش وقفز الحاويات المتداخلة عند تحريك الماوس */}
      <style>{`
        .calc-stable-scope .calc-static-box,
        .calc-stable-scope .calc-static-box:hover,
        .calc-stable-scope .calc-static-box:active {
          transform: none !important;
          will-change: auto !important;
        }
        .calc-stable-scope .calc-item-row,
        .calc-stable-scope .calc-item-row:hover,
        .calc-stable-scope .calc-item-row:active {
          transform: none !important;
          will-change: auto !important;
        }
        .calc-stable-scope .calc-stage-card {
          transform: translateY(0) scale(1) !important;
          transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease !important;
          will-change: auto !important;
        }
        .calc-stable-scope .calc-stage-card:hover {
          transform: translateY(-2px) scale(1) !important;
        }
        .calc-stable-scope .calc-stage-card.calc-stage-active,
        .calc-stable-scope .calc-stage-card.calc-stage-active:hover {
          transform: translateY(-2px) scale(1) !important;
          border-color: #fb923c !important;
          box-shadow: 0 12px 24px -6px rgba(249, 115, 22, 0.25) !important;
        }
      `}</style>

      <div className="calc-static-box bg-gradient-to-r from-blue-800 to-blue-600 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg shadow-blue-900/20">
        <div className={`flex gap-3 w-full md:w-auto ${headerBtnOrderClass}`}>
          <Link to={dashboardRoute} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all backdrop-blur-sm">
            <LayoutDashboard size={18} /> {t.backDash}
          </Link>
          <Link to={secondaryRoute} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all backdrop-blur-sm">
            <SecondaryIcon size={18} /> {t.backPath}
          </Link>
        </div>
        <div className={`${headerAlignClass} w-full md:w-auto`}>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-2">💰 {t.title}</h1>
          <p className="text-blue-100 font-bold">{t.subtitle}</p>
          
          {effectiveProject && (
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 text-white font-bold text-sm backdrop-blur-sm">
              <span>{t.devisLabel}</span>
              {isIndependentSpace ? (
                isEditingDevisName ? (
                  <div className="inline-flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customDevisName}
                      onChange={(e) => setCustomDevisName(e.target.value)}
                      placeholder={t.editDevisPlaceholder}
                      className="bg-slate-900/80 text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-400/50 text-xs font-bold outline-none"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCustomDevisName(); }}
                    />
                    <button
                      onClick={handleSaveCustomDevisName}
                      className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-xs font-black cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2">
                    {customProjects.length > 1 ? (
                      <select
                        value={selectedCustomProject.id}
                        onChange={(e) => {
                          const found = customProjects.find(p => p.id === e.target.value);
                          if (found) setSelectedCustomProject(found);
                        }}
                        className="bg-transparent text-amber-300 font-black outline-none cursor-pointer"
                      >
                        {customProjects.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                            {p.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-amber-300">{effectiveProject.name}</span>
                    )}
                    <button
                      onClick={() => {
                        setCustomDevisName(effectiveProject.name);
                        setIsEditingDevisName(true);
                      }}
                      title="تعديل الاسم"
                      className="text-white/80 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                )
              ) : (
                <span className="text-amber-300">{effectiveProject.name}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-2xl mb-6 font-bold flex items-center gap-3 ${
          saveStatus.type === 'error' ? 'bg-red-100 text-red-700' : saveStatus.type === 'loading' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {saveStatus.type === 'error' ? <AlertCircle /> : <CheckCircle2 />} {saveStatus.msg}
        </div>
      )}

      {!effectiveProject ? (
        <div className={`calc-static-box text-center py-16 rounded-3xl border-2 border-dashed font-bold ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
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
                  className={`calc-stage-card p-6 rounded-2xl border-4 cursor-pointer text-center flex flex-col items-center justify-center gap-3 ${
                    isActive 
                      ? 'calc-stage-active border-orange-400 bg-orange-50/50 shadow-lg z-10' 
                      : `border-transparent hover:border-blue-200 shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`
                  }`}
                >
                  <span className="text-4xl drop-shadow-sm">{stage.icon}</span>
                  <div>
                    <h3 className={`font-black text-lg ${isActive ? 'text-blue-800' : (isDarkMode ? 'text-white' : 'text-slate-700')}`}>{stage.name}</h3>
                    <p className={`text-xs font-bold ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`calc-static-box p-6 md:p-8 rounded-3xl border mb-8 shadow-sm min-h-[420px] ${cardBg}`}>
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
                    <div key={item.id} className={`calc-item-row p-5 rounded-2xl border-2 transition-colors ${isAdded ? 'border-emerald-200 bg-emerald-50/30' : (isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50')}`}>
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
                          className={`w-full p-3 rounded-xl font-black text-white transition-colors shadow-md cursor-pointer ${
                            isAdded ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                          }`}
                        >
                          {isAdded ? t.updateBtn : t.addBtn}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="calc-static-box bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl p-6 md:p-10 shadow-2xl shadow-purple-900/30 text-white">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">📊 {t.summaryTitle}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="calc-static-box bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="text-sm font-bold opacity-80 mb-2">{t.ht}</div>
                <div className="text-3xl font-black">{subTotal.toLocaleString()} {t.currency}</div>
              </div>
              <div className="calc-static-box bg-orange-500/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-orange-400/30">
                <div className="text-sm font-bold opacity-80 mb-2">{t.tvaLabel} {globalTva}%)</div>
                <div className="text-3xl font-black text-orange-300">{tvaAmount.toLocaleString()} {t.currency}</div>
              </div>
              <div className="calc-static-box bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-emerald-400/30">
                <div className="text-sm font-bold opacity-80 mb-2">{t.ttc}</div>
                <div className="text-3xl font-black text-emerald-300">{grandTotal.toLocaleString()} {t.currency}</div>
              </div>
            </div>

            <div className="calc-static-box bg-white text-slate-800 rounded-2xl p-6 shadow-inner">
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
              className={`w-full mt-6 py-4 rounded-xl font-black text-lg transition-colors shadow-xl ${
                estimate.length === 0 
                  ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                  : 'bg-blue-900 hover:bg-blue-950 text-white shadow-black/20 cursor-pointer'
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