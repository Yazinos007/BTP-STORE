import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { 
  Search, Building2, Calendar, ArrowUpRight, Filter, Loader2, Sparkles, Gavel, 
  Hash, BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2, Clock, Zap,
  FileDown, Target, Truck, Calculator, X, FileText, PieChart
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function TenderRadar() {
  // 🚀 جلب وضع الشاشة (Dark/Light) من السياق العام للمنصة
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  
  const { language } = useSettingsStore();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [aiResults, setAiResults] = useState({});
  
  const [selectedTender, setSelectedTender] = useState(null);
  const [profitMargin, setProfitMargin] = useState(15);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const itemsPerPage = 6;
  const isRtl = language === 'ar';

  // 🚀 قاموس الترجمة المكتمل لكل زوايا النافذة
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
      tenderWarRoom: 'غرفة تحليل المناقصة (War Room)', projectSummary: 'ملخص المشروع والمواد',
      winProb: 'احتمالية الفوز المبدئية', logisticRisk: 'التحليل اللوجستي والنقل',
      material: 'المادة/الخدمة', qty: 'الكمية التقديرية', cost: 'التكلفة (MAD)',
      totalCost: 'التكلفة الإجمالية التقديرية', transportCost: 'رسوم النقل واللوجستيك',
      profitMarginCard: 'محاكي هامش الربح', finalBid: 'سعر العرض الموصى به (Bid Price)',
      downloadRFQ: 'استخراج طلب عروض للمورد (ملف)', recommendations: 'توصيات الذكاء الاصطناعي',
      close: 'إغلاق التحليل', targetMargin: 'النسبة المستهدفة', potentialComps: 'المنافسون المحتملون',
      companies: 'شركات', aiLocRec: 'توصية IA: يفضل التعاقد مع ناقل محلي لتقليل التكلفة بنسبة 12%.',
      mat1: 'إسمنت بورتلاند', mat2: 'حديد تسليح', mat3: 'خرسانة جاهزة', mat4: 'زليج وسيراميك',
      ton: 'طن', m3: 'م³', m2: 'م²', rfqSuccess: 'تم استخراج ملف طلب العروض (RFQ) بنجاح! 📄'
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
      profitMarginCard: 'Simulateur de Marge', finalBid: 'Prix de l\'Offre Recommandé (Bid)',
      downloadRFQ: 'Générer Demande de Devis (Fichier)', recommendations: 'Recommandations IA',
      close: 'Fermer', targetMargin: 'Marge Cible', potentialComps: 'Concurrents Potentiels',
      companies: 'entreprises', aiLocRec: 'Recommandation IA: Privilégiez un transporteur local pour réduire les coûts de 12%.',
      mat1: 'Ciment Portland', mat2: 'Acier d\'armature', mat3: 'Béton prêt à l\'emploi', mat4: 'Carrelage & Céramique',
      ton: 'T', m3: 'm³', m2: 'm²', rfqSuccess: 'Le fichier RFQ a été généré et téléchargé avec succès ! 📄'
    },
    en: {
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
      profitMarginCard: 'Profit Margin Simulator', finalBid: 'Recommended Bid Price',
      downloadRFQ: 'Generate Supplier RFQ (File)', recommendations: 'AI Recommendations',
      close: 'Close', targetMargin: 'Target Margin', potentialComps: 'Potential Competitors',
      companies: 'companies', aiLocRec: 'AI Rec: Use a local freight forwarder to reduce costs by 12%.',
      mat1: 'Portland Cement', mat2: 'Rebar Steel', mat3: 'Ready-mix Concrete', mat4: 'Tiles & Ceramics',
      ton: 'T', m3: 'm³', m2: 'sqm', rfqSuccess: 'RFQ document successfully generated and downloaded! 📄'
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

  // ==========================================
  // 🚀 النافذة المنبثقة (Tender War Room Modal)
  // ==========================================
  const TenderModal = () => {
    if (!selectedTender) return null;
    
    const title = language === 'fr' ? (selectedTender.objet || selectedTender.title_fr) : 
                  language === 'en' ? (selectedTender.title_en || selectedTender.objet || selectedTender.title_fr) : 
                  (selectedTender.title_ar !== 'صفقة جديدة' ? selectedTender.title_ar : (selectedTender.objet || ''));

    // 🤖 محاكاة ذكية متسقة تعتمد على ID الصفقة لكي تظل البيانات ثابتة لنفس الصفقة
    const hashSeed = selectedTender.id ? String(selectedTender.id).charCodeAt(0) + String(selectedTender.id).length : 5;
    const probability = 60 + (hashSeed % 35);
    const competitors = 2 + (hashSeed % 7);
    const baseCost = 100000 + (hashSeed * 25000);
    const transportCost = 5000 + (hashSeed * 1000);

    const materials = [
      { name: t.mat1, qty: (10 * (hashSeed%5 + 1)) + ' ' + t.ton, cost: baseCost * 0.2 },
      { name: t.mat2, qty: (5 * (hashSeed%3 + 1)) + ' ' + t.ton, cost: baseCost * 0.4 },
      { name: t.mat3, qty: (50 * (hashSeed%4 + 1)) + ' ' + t.m3, cost: baseCost * 0.3 },
      { name: t.mat4, qty: (100 * (hashSeed%6 + 1)) + ' ' + t.m2, cost: baseCost * 0.1 }
    ];

    const totalMaterialsCost = materials.reduce((acc, curr) => acc + curr.cost, 0);
    const finalBidPrice = (totalMaterialsCost + transportCost) * (1 + (profitMargin / 100));

    // 🚀 استخراج فعلي لملف الـ RFQ (يتم تنزيله في جهاز المستخدم)
    const handleGeneratePDF = () => {
      setIsGeneratingPDF(true);
      setTimeout(() => {
        setIsGeneratingPDF(false);
        const rfqContent = `
          <!DOCTYPE html>
          <html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${language}">
          <head>
            <meta charset="UTF-8">
            <title>Request for Quotation (RFQ)</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { color: #2563eb; margin: 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: ${isRtl ? 'right' : 'left'}; }
              th { background-color: #f1f5f9; color: #334155; }
              .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📋 Request for Quotation (RFQ)</h1>
              <p><strong>Ref:</strong> ${selectedTender.reference || 'N/A'}</p>
              <p><strong>Project:</strong> ${title}</p>
            </div>
            <h3>Required Materials / المـــواد المطلوبــة</h3>
            <table>
              <thead><tr><th>${t.material}</th><th>${t.qty}</th></tr></thead>
              <tbody>
                ${materials.map(m => `<tr><td>${m.name}</td><td>${m.qty}</td></tr>`).join('')}
              </tbody>
            </table>
            <div class="footer">Generated by SouqBTP War Room AI Server</div>
          </body>
          </html>
        `;
        const blob = new Blob([rfqContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RFQ_${selectedTender.reference || 'SouqBTP_Tender'}.html`;
        a.click();
        URL.revokeObjectURL(url);
        alert(t.rfqSuccess);
      }, 1500);
    };

    // 🎨 متغيرات الألوان المتناسقة مع الوضع المظلم / الفاتح
    const bgOverlay = isDarkMode ? 'bg-[#020617]/90' : 'bg-slate-900/60';
    const bgModal = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300';
    const bgHeader = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200';
    const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-600';
    const bgCard = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
    const tableHeader = isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600';
    const tableRowHover = isDarkMode ? 'hover:bg-slate-800/30 border-slate-800/50 text-slate-200' : 'hover:bg-slate-50 border-slate-200 text-slate-700';

    const modalContent = (
      <div className={`fixed inset-0 z-[999999] ${bgOverlay} backdrop-blur-sm flex justify-center items-center p-4 md:p-8 animate-fade-in`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={`${bgModal} border w-full max-w-6xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative`}>
          
          {/* Header */}
          <div className={`${bgHeader} p-6 border-b flex justify-between items-center sticky top-0 z-10`}>
            <div>
              <h2 className={`text-xl md:text-2xl font-black ${textMain} flex items-center gap-3`}>
                <BrainCircuit className="text-purple-500" /> {t.tenderWarRoom}
              </h2>
              <p className={`${textMuted} text-sm mt-1 font-bold truncate max-w-xl`}>{title}</p>
            </div>
            <button onClick={() => setSelectedTender(null)} className={`p-2 ${isDarkMode ? 'bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white' : 'bg-slate-200 hover:bg-red-500 text-slate-600 hover:text-white'} rounded-xl transition-colors`}>
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar ${isDarkMode ? '' : 'bg-slate-50'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* العمود الأيمن */}
              <div className="lg:col-span-2 space-y-8">
                
                <div className={`${bgCard} border rounded-2xl p-6`}>
                  <h3 className={`text-lg font-black ${textMain} mb-4 flex items-center gap-2`}><FileText className="text-blue-500"/> {t.projectSummary}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left" dir={isRtl ? 'rtl' : 'ltr'}>
                      <thead className={`text-xs uppercase ${tableHeader} border-b`}>
                        <tr>
                          <th className="px-4 py-3">{t.material}</th>
                          <th className="px-4 py-3 text-center">{t.qty}</th>
                          <th className="px-4 py-3 text-end">{t.cost}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((m, i) => (
                          <tr key={i} className={`border-b ${tableRowHover} font-bold`}>
                            <td className="px-4 py-3">{m.name}</td>
                            <td className="px-4 py-3 text-center text-amber-500 font-mono">{m.qty}</td>
                            <td className="px-4 py-3 text-end text-emerald-500 font-mono" dir="ltr">{m.cost.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={`mt-4 flex justify-between items-center p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    <span className={`font-black ${textMuted}`}>{t.totalCost}</span>
                    <span className="font-black text-xl text-emerald-500" dir="ltr">{totalMaterialsCost.toLocaleString()} MAD</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <Calculator className="absolute -right-4 -bottom-4 text-blue-500/10" size={120} />
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6 relative z-10 flex items-center gap-2`}><PieChart className="text-blue-500"/> {t.profitMarginCard}</h3>
                  
                  <div className="relative z-10 space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{t.targetMargin}: <span className="text-blue-500">{profitMargin}%</span></span>
                        <span className="text-emerald-500">+( {(totalMaterialsCost * (profitMargin/100)).toLocaleString()} MAD )</span>
                      </div>
                      <input type="range" min="5" max="40" value={profitMargin} onChange={(e) => setProfitMargin(e.target.value)} className={`w-full accent-blue-500 h-2 rounded-lg appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'}`} />
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-blue-500/20 pt-4">
                      <div>
                        <p className={`text-[10px] ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} font-black uppercase tracking-widest mb-1`}>{t.finalBid}</p>
                        <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono`} dir="ltr">{finalBidPrice.toLocaleString()} <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>MAD</span></p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
                        {t.submitInstant}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* العمود الأيسر */}
              <div className="space-y-6">
                
                <div className={`${bgCard} border rounded-2xl p-6`}>
                  <h3 className={`text-sm font-black ${textMuted} uppercase tracking-widest mb-4 flex items-center gap-2`}><Target className="text-amber-500" size={16}/> {t.winProb}</h3>
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-32 h-32 rounded-full border-8 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-center relative`}>
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="60" cy="60" r="56" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * probability) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                      </svg>
                      <span className={`text-3xl font-black ${textMain}`}>{probability}%</span>
                    </div>
                  </div>
                  <p className={`text-center text-xs ${textMuted} font-bold mt-2`}>{t.potentialComps}: <span className="text-amber-500">{competitors} {t.companies}</span></p>
                </div>

                <div className={`${bgCard} border rounded-2xl p-6`}>
                  <h3 className={`text-sm font-black ${textMuted} uppercase tracking-widest mb-4 flex items-center gap-2`}><Truck className="text-emerald-500" size={16}/> {t.logisticRisk}</h3>
                  <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-xl p-4 border`}>
                    <p className={`text-sm font-bold ${textMain} mb-2`}>{t.transportCost}: <span className="text-emerald-500 font-mono" dir="ltr">{transportCost.toLocaleString()} MAD</span></p>
                    <div className={`h-1.5 w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden mb-3`}>
                      <div className="h-full bg-emerald-500 w-1/4"></div>
                    </div>
                    <p className={`text-xs ${textMuted} leading-relaxed`}>📍 <span className="text-sky-500 font-bold">IA:</span> {t.aiLocRec}</p>
                  </div>
                </div>

                <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className={`w-full ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'} border font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50`}>
                  {isGeneratingPDF ? <Loader2 size={20} className="animate-spin text-sky-500" /> : <FileDown size={20} className="text-sky-500 group-hover:-translate-y-1 transition-transform" />}
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
    <div className={`space-y-8 animate-fade-in ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} max-w-7xl mx-auto pb-24`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-4`}>
            <Gavel className="text-blue-500" size={36} /> {t.title}
          </h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-3 flex items-center gap-2 font-bold`}>
            <Sparkles size={18} className="text-amber-500" /> {t.subtitle}
          </p>
        </div>
      </div>

      {/* 🤖 Strategic Advisor Banner */}
      <div className={`${isDarkMode ? 'bg-slate-900/80' : 'bg-white'} backdrop-blur-xl border border-purple-500/30 p-6 md:p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(168,85,247,0.15)] relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-purple-500/5 to-transparent pointer-events-none"></div>
        <div className={`flex items-center gap-3 mb-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-4`}>
          <div className="p-3 bg-purple-500/20 text-purple-500 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <BrainCircuit size={28} className="animate-pulse" />
          </div>
          <div>
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.aiAdvisor}</h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-bold`}>{t.aiDesc}</p>
          </div>
        </div>
        <div className={`${isDarkMode ? 'bg-[#0b1121] border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-6 relative`}>
          <div className="flex justify-between items-start mb-4">
            <h4 className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-2`}><TrendingUp className="text-red-500" size={18}/> {t.hedgingTitle}</h4>
            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 text-xs font-black rounded-lg flex items-center gap-1"><AlertTriangle size={14}/> {t.highRisk}</span>
          </div>
          <p className="text-sm font-bold text-slate-500 flex items-start gap-2 mb-6 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
            <span className="text-red-500 mt-0.5">🚨</span> {t.aiAlert}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.estSavings}</p>
              <p className="text-2xl font-black text-emerald-500 font-mono" dir="ltr">~85,000 MAD</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.actionAdvice}</p>
              <p className="text-sm font-black text-blue-500">{t.coverStockBtn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Search Bar */}
      <div className="relative group">
        <Search className={`absolute ${isRtl ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors`} size={24} />
        <input type="text" placeholder={t.searchPlace} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'} backdrop-blur-md border-2 py-5 ${isRtl ? 'pr-16 pl-6' : 'pl-16 pr-6'} rounded-[2rem] outline-none focus:border-blue-500 transition-all shadow-xl font-bold text-lg`} />
      </div>

      {/* 🚀 Tenders Grid */}
      {loading ? (
        <div className={`flex flex-col justify-center items-center h-64 gap-4 ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-[3rem] border border-dashed`}>
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t.scanning}</p>
        </div>
      ) : filteredTenders.length > 0 ? (
        <div className="flex flex-col space-y-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-start">
            {currentTenders.map(tender => {
              const aiData = aiResults[tender.id];
              const isAnalyzing = analyzingId === tender.id;

              return (
                <div key={tender.id} className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-2 p-6 md:p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all duration-300 group relative shadow-xl flex flex-col`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 bg-blue-600/10 text-blue-500 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-600/20">
                      {t.tenderType}
                    </span>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-200'} border px-3 py-1 rounded-lg font-mono`}>
                      {tender.reference && tender.reference !== 'N/A' ? tender.reference : 'No Ref'}
                    </span>
                  </div>

                  <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6 leading-snug h-16 line-clamp-2`} title={tender.objet || tender.title_ar}>
                    {language === 'fr' ? (tender.objet || tender.title_fr) : language === 'en' ? (tender.title_en || tender.objet || tender.title_fr) : (tender.title_ar !== 'صفقة جديدة' ? tender.title_ar : (tender.objet || 'بدون عنوان'))}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className={`flex items-center gap-3 text-sm ${isDarkMode ? 'text-slate-300 bg-slate-950 border-slate-800' : 'text-slate-700 bg-slate-50 border-slate-200'} font-bold p-3 rounded-xl border`}>
                      <Building2 size={16} className="text-slate-500" />
                      <span className="truncate">{(language === 'fr' ? tender.agency_fr : tender.agency_ar) || t.unknownAgency}</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${isDarkMode ? 'text-slate-300 bg-slate-950 border-slate-800' : 'text-slate-700 bg-slate-50 border-slate-200'} font-bold p-3 rounded-xl border`}>
                      <Calendar size={16} className="text-slate-500" />
                      <span>{tender.deadline ? new Date(tender.deadline).toLocaleDateString() : '---'}</span>
                    </div>
                  </div>

                  {/* 🤖 AI Analysis Panel */}
                  <div className="mt-auto">
                    {aiData ? (
                      <div className={`bg-purple-900/10 border ${isDarkMode ? 'border-purple-500/30' : 'border-purple-300'} rounded-2xl p-5 mb-4 animate-fade-in relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Live Tender IA</div>
                        <div className="flex justify-between items-center mb-4 mt-2">
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.estBudget}</p>
                            <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono`} dir="ltr">{aiData.budget} <span className="text-xs text-purple-500">MAD</span></p>
                          </div>
                          <div className="text-end">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.timeRem}</p>
                            <p className="text-sm font-black text-amber-500 flex items-center gap-1 justify-end"><Clock size={14}/> {aiData.daysLeft}j {aiData.hoursLeft}h</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-500">{t.stockMatch}: {aiData.match}%</span>
                          <div className={`flex-1 h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden ml-2`}><div className="h-full bg-emerald-500 rounded-full" style={{width: `${aiData.match}%`}}></div></div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => handleAiAnalysis(tender.id)} disabled={isAnalyzing} className={`w-full mb-4 py-3 ${isDarkMode ? 'bg-slate-950 border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-purple-400' : 'bg-slate-50 border-slate-300 hover:border-purple-400 text-slate-700 hover:text-purple-600'} border font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50`}>
                        {isAnalyzing ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <BrainCircuit size={18} className="text-purple-500" />}
                        {isAnalyzing ? t.analyzing : t.analyzeBtn}
                      </button>
                    )}

                    <button onClick={() => setSelectedTender(tender)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
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
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-6 py-3.5 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'} rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold`}>{t.prev}</button>
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar max-w-[200px] md:max-w-none px-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' : (isDarkMode ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-6 py-3.5 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'} rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold`}>{t.next}</button>
            </div>
          )}
        </div>
      ) : (
        <div className={`text-center py-20 ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-[3rem] border border-dashed`}><p className="text-slate-500 font-bold text-lg">{t.noData}</p></div>
      )}

      {/* النافذة المنبثقة التحليلية */}
      <TenderModal />
    </div>
  );
}