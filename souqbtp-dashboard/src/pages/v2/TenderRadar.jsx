import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Building2, Calendar, ArrowUpRight, Filter, Loader2, Sparkles, Gavel, 
  Hash, BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2, Clock, Zap,
  FileDown, Target, Truck, Calculator, X, ShieldAlert, FileText, PieChart
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function TenderRadar() {
  const { language } = useSettingsStore();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [aiResults, setAiResults] = useState({});
  
  // 🚀 حالة النافذة المنبثقة لتفاصيل الصفقة
  const [selectedTender, setSelectedTender] = useState(null);
  const [profitMargin, setProfitMargin] = useState(15); // هامش الربح الافتراضي
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const itemsPerPage = 6;
  const isRtl = language === 'ar';

  const translations = {
    ar: {
      title: 'رادار المناقصات (Live)', subtitle: 'فرص حقيقية من بوابات الصفقات العمومية، مصنفة بذكاء.',
      searchPlace: 'ابحث عن صفقات (إسمنت، حديد، بناء)...', tenderType: 'صفقة عمومية',
      unknownAgency: 'جهة عمومية', viewDetails: 'تحليل وتفاصيل الصفقة', noData: 'لا توجد مناقصات مطابقة حالياً.',
      prev: 'السابق', next: 'التالي', scanning: 'جاري فحص الرادار...', aiAdvisor: 'المستشار الاستراتيجي (IA)',
      aiDesc: 'محرك ذكاء اصطناعي لتحليل الصفقات وتوقع الأسعار اللحظية.', hedgingTitle: 'رادار توقع الأسعار والتحوط (Hedging)',
      highRisk: 'خطر هامش ربح مرتفع', aiAlert: 'تنبيه: تم رصد ارتفاع متوقع في أسعار الحديد بناءً على بيانات السوق.',
      estSavings: 'الاقتصاد المالي المتوقع', actionAdvice: 'الإجراء الموصى به',
      freezeBtn: 'تجميد الأسعار الحالية', coverStockBtn: 'شراء مخزون تغطية', analyzeBtn: 'فحص مبدئي (IA)',
      analyzing: 'جاري الفحص...', estBudget: 'الميزانية التقديرية', stockMatch: 'توافق المخزون',
      timeRem: 'الوقت المتبقي', submitInstant: 'تقديم عرض فوري ⚡',
      // ترجمات النافذة المنبثقة
      tenderWarRoom: 'غرفة تحليل المناقصة (War Room)', projectSummary: 'ملخص المشروع والمواد',
      winProb: 'احتمالية الفوز المبدئية', logisticRisk: 'التحليل اللوجستي والنقل',
      material: 'المادة/الخدمة', qty: 'الكمية التقديرية', cost: 'التكلفة (MAD)',
      totalCost: 'التكلفة الإجمالية التقديرية', transportCost: 'رسوم النقل واللوجستيك',
      profitMargin: 'محاكي هامش الربح', finalBid: 'سعر العرض الموصى به (Bid Price)',
      downloadRFQ: 'استخراج طلب عروض للمورد (PDF)', recommendations: 'توصيات الذكاء الاصطناعي',
      close: 'إغلاق التحليل'
    },
    fr: {
      title: 'Radar d\'Appels d\'Offres', subtitle: 'Opportunités réelles des portails publics, classées par IA.',
      searchPlace: 'Rechercher (Ciment, Fer, Construction)...', tenderType: 'Appel d\'offre',
      unknownAgency: 'Entité Publique', viewDetails: 'Analyser les détails', noData: 'Aucun appel d\'offres trouvé.',
      prev: 'Précédent', next: 'Suivant', scanning: 'Scan du radar en cours...', aiAdvisor: 'Conseiller Stratégique (IA)',
      aiDesc: 'Moteur IA pour l\'analyse des marchés en temps réel.', hedgingTitle: 'Prédiction des Prix & Hedging',
      highRisk: 'Risque de Marge Élevé', aiAlert: 'Alerte : Hausse des prix du fer détectée via les données du marché.',
      estSavings: 'ÉCONOMIE ESTIMÉE', actionAdvice: 'ACTION CONSEILLÉE',
      freezeBtn: 'Geler les devis', coverStockBtn: 'Stock de couverture', analyzeBtn: 'Scan Rapide (IA)',
      analyzing: 'Scan en cours...', estBudget: 'BUDGET ESTIMATIF', stockMatch: 'Stock compatible',
      timeRem: 'Temps restant', submitInstant: 'Soumettre offre ⚡',
      tenderWarRoom: 'Salle d\'Analyse du Marché (War Room)', projectSummary: 'Résumé du Projet & Matériaux',
      winProb: 'Probabilité de Gain', logisticRisk: 'Analyse Logistique & Transport',
      material: 'Matériau/Service', qty: 'Qté Estimée', cost: 'Coût (MAD)',
      totalCost: 'Coût Total Estimatif', transportCost: 'Frais de Transport',
      profitMargin: 'Simulateur de Marge BBA', finalBid: 'Prix de l\'Offre Recommandé (Bid)',
      downloadRFQ: 'Générer Demande de Devis (PDF)', recommendations: 'Recommandations IA',
      close: 'Fermer l\'analyse'
    },
    en: {
      // (نفس الهيكلة للغة الإنجليزية لتجنب أي أخطاء الشبح)
      title: 'Live Tenders Radar', subtitle: 'Real opportunities from public portals, AI classified.',
      searchPlace: 'Search tenders...', tenderType: 'Public Tender', unknownAgency: 'Public Entity',
      viewDetails: 'Analyze Details', noData: 'No tenders found.', prev: 'Prev', next: 'Next',
      scanning: 'Scanning Radar...', aiAdvisor: 'Strategic Advisor (AI)', aiDesc: 'AI engine for market analysis.',
      hedgingTitle: 'Price Prediction & Hedging', highRisk: 'High Margin Risk', aiAlert: 'Alert: Steel price hike detected.',
      estSavings: 'EST. SAVINGS', actionAdvice: 'RECOMMENDED ACTION', freezeBtn: 'Freeze Quotes', coverStockBtn: 'Cover Stock',
      analyzeBtn: 'Quick Scan (AI)', analyzing: 'Scanning...', estBudget: 'EST. BUDGET', stockMatch: 'Stock Match',
      timeRem: 'Time Remaining', submitInstant: 'Instant Offer ⚡',
      tenderWarRoom: 'Tender Analysis War Room', projectSummary: 'Project Summary & Materials',
      winProb: 'Win Probability', logisticRisk: 'Logistics & Transport Analysis',
      material: 'Material/Service', qty: 'Est. Qty', cost: 'Cost (MAD)',
      totalCost: 'Total Estimated Cost', transportCost: 'Transport Fees',
      profitMargin: 'Profit Margin Simulator', finalBid: 'Recommended Bid Price',
      downloadRFQ: 'Generate Supplier RFQ (PDF)', recommendations: 'AI Recommendations',
      close: 'Close Analysis'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    fetchTenders();
    const subscription = supabase.channel('tenders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tenders' }, (payload) => {
        setTenders((current) => [payload.new, ...current]);
      }).subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  async function fetchTenders() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTenders(data || []);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  }

  const filteredTenders = tenders.filter(tender => {
    const title = language === 'fr' ? (tender.objet || tender.title_fr) : 
                  language === 'en' ? (tender.title_en || tender.objet || tender.title_fr) : 
                  (tender.title_ar !== 'صفقة جديدة' ? tender.title_ar : (tender.objet || ''));
    return (title || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTenders = filteredTenders.slice(startIndex, startIndex + itemsPerPage);

  const handleAiAnalysis = (id) => {
    setAnalyzingId(id);
    setTimeout(() => {
      setAiResults(prev => ({
        ...prev,
        [id]: {
          budget: Math.floor(Math.random() * (900000 - 150000) + 150000).toLocaleString(),
          match: Math.floor(Math.random() * (100 - 75) + 75),
          daysLeft: Math.floor(Math.random() * 20 + 2), hoursLeft: Math.floor(Math.random() * 23)
        }
      }));
      setAnalyzingId(null);
    }, 2000);
  };

  // 🚀 دالة توليد PDF (مستقبلية)
  const handleGeneratePDF = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      setIsGeneratingPDF(false);
      alert("✅ تم استخراج ملف RFQ للمورد بنجاح! (محاكاة)");
    }, 2000);
  };

  // 🤖 بيانات محاكاة للنافذة المنبثقة
  const mockTenderDetails = {
    materials: [
      { name: 'إسمنت بورتلاند (CPJ 45)', qty: '120 طن', cost: 108000 },
      { name: 'حديد تسليح (أقطار مختلفة)', qty: '45 طن', cost: 382500 },
      { name: 'خرسانة جاهزة (B25)', qty: '250 م³', cost: 212500 },
      { name: 'زليج وسيراميك', qty: '600 م²', cost: 54000 }
    ],
    transportCost: 15000,
    probability: 78,
    competitors: 4
  };

  const totalMaterialsCost = mockTenderDetails.materials.reduce((acc, curr) => acc + curr.cost, 0);
  const finalBidPrice = (totalMaterialsCost + mockTenderDetails.transportCost) * (1 + (profitMargin / 100));

  // ==========================================
  // 🚀 واجهة نافذة تفاصيل الصفقة (Modal)
  // ==========================================
  const TenderModal = () => {
    if (!selectedTender) return null;
    const title = language === 'fr' ? (selectedTender.objet || selectedTender.title_fr) : (selectedTender.title_ar !== 'صفقة جديدة' ? selectedTender.title_ar : (selectedTender.objet || ''));

    const modalContent = (
      <div className="fixed inset-0 z-[999999] bg-[#020617]/90 backdrop-blur-md flex justify-center items-center p-4 md:p-8 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[95vh] rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                <BrainCircuit className="text-purple-500" /> {t.tenderWarRoom}
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-bold truncate max-w-xl">{title}</p>
            </div>
            <button onClick={() => setSelectedTender(null)} className="p-2 bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* العمود الأيمن: المواد والتكاليف */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* جدول المواد */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2"><FileText className="text-blue-500"/> {t.projectSummary}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left" dir={isRtl ? 'rtl' : 'ltr'}>
                      <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">{t.material}</th>
                          <th className="px-4 py-3 text-center">{t.qty}</th>
                          <th className="px-4 py-3 text-end">{t.cost}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTenderDetails.materials.map((m, i) => (
                          <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-bold text-slate-200">{m.name}</td>
                            <td className="px-4 py-3 text-center text-amber-400 font-mono">{m.qty}</td>
                            <td className="px-4 py-3 text-end text-emerald-400 font-mono" dir="ltr">{m.cost.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="font-black text-slate-400">{t.totalCost}</span>
                    <span className="font-black text-xl text-emerald-400" dir="ltr">{totalMaterialsCost.toLocaleString()} MAD</span>
                  </div>
                </div>

                {/* محاكي الأرباح */}
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <Calculator className="absolute -right-4 -bottom-4 text-blue-500/10" size={120} />
                  <h3 className="text-lg font-black text-white mb-6 relative z-10 flex items-center gap-2"><PieChart className="text-blue-400"/> {t.profitMargin}</h3>
                  
                  <div className="relative z-10 space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-slate-300">النسبة المستهدفة: <span className="text-blue-400">{profitMargin}%</span></span>
                        <span className="text-emerald-400">+( {(totalMaterialsCost * (profitMargin/100)).toLocaleString()} MAD )</span>
                      </div>
                      <input type="range" min="5" max="40" value={profitMargin} onChange={(e) => setProfitMargin(e.target.value)} className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-blue-500/20 pt-4">
                      <div>
                        <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest mb-1">{t.finalBid}</p>
                        <p className="text-3xl font-black text-white font-mono" dir="ltr">{finalBidPrice.toLocaleString()} <span className="text-sm text-blue-400">MAD</span></p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
                        {t.submitInstant}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* العمود الأيسر: ذكاء اصطناعي ومخاطر */}
              <div className="space-y-6">
                
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="text-amber-500" size={16}/> {t.winProb}</h3>
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="60" cy="60" r="56" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * mockTenderDetails.probability) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                      </svg>
                      <span className="text-3xl font-black text-white">{mockTenderDetails.probability}%</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500 font-bold mt-2">المنافسون المحتملون: <span className="text-amber-400">{mockTenderDetails.competitors} شركات</span></p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Truck className="text-emerald-500" size={16}/> {t.logisticRisk}</h3>
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                    <p className="text-sm font-bold text-slate-300 mb-2">{t.transportCost}: <span className="text-emerald-400 font-mono" dir="ltr">{mockTenderDetails.transportCost.toLocaleString()} MAD</span></p>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-emerald-500 w-1/4"></div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">📍 <span className="text-sky-400 font-bold">توصية IA:</span> الورشة تبعد 45كم عن المستودع الرئيسي. يفضل التعاقد مع ناقل محلي (Bourse de Fret) لتقليل التكلفة بنسبة 12%.</p>
                  </div>
                </div>

                <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
                  {isGeneratingPDF ? <Loader2 size={20} className="animate-spin text-sky-400" /> : <FileDown size={20} className="text-sky-400 group-hover:-translate-y-1 transition-transform" />}
                  {t.downloadRFQ}
                </button>

              </div>
            </div>
          </div>
          
        </div>
      </div>
    );
    return createPortal(modalContent, document.body);
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-300 max-w-7xl mx-auto pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 border-2 border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-4">
            <Gavel className="text-blue-500" size={36} /> {t.title}
          </h2>
          <p className="text-slate-400 mt-3 flex items-center gap-2 font-bold">
            <Sparkles size={18} className="text-amber-400" /> {t.subtitle}
          </p>
        </div>
      </div>

      {/* 🤖 Strategic Advisor Banner */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-6 md:p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(168,85,247,0.15)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-purple-500/5 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <BrainCircuit size={28} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{t.aiAdvisor}</h3>
            <p className="text-xs text-slate-400 font-bold">{t.aiDesc}</p>
          </div>
        </div>
        <div className="bg-[#0b1121] border border-slate-800 rounded-2xl p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-black text-slate-200 flex items-center gap-2"><TrendingUp className="text-red-500" size={18}/> {t.hedgingTitle}</h4>
            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 text-xs font-black rounded-lg flex items-center gap-1"><AlertTriangle size={14}/> {t.highRisk}</span>
          </div>
          <p className="text-sm font-bold text-slate-400 flex items-start gap-2 mb-6 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
            <span className="text-red-500 mt-0.5">🚨</span> {t.aiAlert}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.estSavings}</p>
              <p className="text-2xl font-black text-emerald-400 font-mono" dir="ltr">~85,000 MAD</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.actionAdvice}</p>
              <p className="text-sm font-black text-blue-400">{t.coverStockBtn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Search Bar */}
      <div className="relative group">
        <Search className={`absolute ${isRtl ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors`} size={24} />
        <input type="text" placeholder={t.searchPlace} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-800 py-5 ${isRtl ? 'pr-16 pl-6' : 'pl-16 pr-6'} rounded-[2rem] text-white outline-none focus:border-blue-500 transition-all shadow-2xl font-bold text-lg placeholder-slate-600`} />
      </div>

      {/* 🚀 Tenders Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">{t.scanning}</p>
        </div>
      ) : filteredTenders.length > 0 ? (
        <div className="flex flex-col space-y-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-start">
            {currentTenders.map(tender => {
              const aiData = aiResults[tender.id];
              const isAnalyzing = analyzingId === tender.id;

              return (
                <div key={tender.id} className="bg-slate-900 border-2 border-slate-800 p-6 md:p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all duration-300 group relative shadow-xl flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-600/20">
                      {t.tenderType}
                    </span>
                    <span className="text-xs font-bold text-slate-500 border border-slate-700 px-3 py-1 rounded-lg font-mono">
                      {tender.reference && tender.reference !== 'N/A' ? tender.reference : 'No Ref'}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-6 leading-snug h-16 line-clamp-2" title={tender.objet || tender.title_ar}>
                    {language === 'fr' ? (tender.objet || tender.title_fr) : language === 'en' ? (tender.title_en || tender.objet || tender.title_fr) : (tender.title_ar !== 'صفقة جديدة' ? tender.title_ar : (tender.objet || 'بدون عنوان'))}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-300 font-bold bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <Building2 size={16} className="text-slate-500" />
                      <span className="truncate">{(language === 'fr' ? tender.agency_fr : tender.agency_ar) || t.unknownAgency}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300 font-bold bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <Calendar size={16} className="text-slate-500" />
                      <span>{tender.deadline ? new Date(tender.deadline).toLocaleDateString() : '---'}</span>
                    </div>
                  </div>

                  {/* 🤖 AI Analysis Panel */}
                  <div className="mt-auto">
                    {aiData ? (
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-5 mb-4 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Live Tender IA</div>
                        <div className="flex justify-between items-center mb-4 mt-2">
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.estBudget}</p>
                            <p className="text-xl font-black text-white font-mono" dir="ltr">{aiData.budget} <span className="text-xs text-purple-400">MAD</span></p>
                          </div>
                          <div className="text-end">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.timeRem}</p>
                            <p className="text-sm font-black text-amber-400 flex items-center gap-1 justify-end"><Clock size={14}/> {aiData.daysLeft}j {aiData.hoursLeft}h</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-400">{t.stockMatch}: {aiData.match}%</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-2"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${aiData.match}%`}}></div></div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => handleAiAnalysis(tender.id)} disabled={isAnalyzing} className="w-full mb-4 py-3 bg-slate-950 border border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-purple-400 font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {isAnalyzing ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <BrainCircuit size={18} className="text-purple-500" />}
                        {isAnalyzing ? t.analyzing : t.analyzeBtn}
                      </button>
                    )}

                    {/* 🚀 السحر يبدأ هنا: تم تغيير الرابط لفتح النافذة المنبثقة الذكية */}
                    <button 
                      onClick={() => setSelectedTender(tender)} 
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                      {t.viewDetails} <ArrowUpRight size={18} className={isRtl ? 'rotate-90' : ''} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🚀 Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-6 py-3.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold">{t.prev}</button>
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar max-w-[200px] md:max-w-none px-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-6 py-3.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold">{t.next}</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800"><p className="text-slate-500 font-bold text-lg">{t.noData}</p></div>
      )}

      {/* استدعاء النافذة المنبثقة الذكية هنا */}
      <TenderModal />
    </div>
  );
}