import { useState, useEffect } from 'react';
import { 
  Search, Building2, Calendar, ArrowUpRight, Filter, Loader2, 
  Sparkles, Gavel, Hash, BrainCircuit, TrendingUp, AlertTriangle, 
  CheckCircle2, Clock, ShieldCheck, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function TenderRadar() {
  const { language } = useSettingsStore();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // 🤖 حالات الذكاء الاصطناعي
  const [analyzingId, setAnalyzingId] = useState(null);
  const [aiResults, setAiResults] = useState({});

  const itemsPerPage = 6;

  const translations = {
    ar: {
      title: 'رادار المناقصات (Live)',
      subtitle: 'فرص حقيقية من بوابات الصفقات العمومية، مصنفة بذكاء.',
      searchPlace: 'ابحث عن صفقات (إسمنت، حديد، بناء)...',
      tenderType: 'صفقة عمومية',
      unknownAgency: 'جهة عمومية',
      viewDetails: 'تفاصيل الصفقة',
      noData: 'لا توجد مناقصات مطابقة حالياً.',
      prev: 'السابق', next: 'التالي', scanning: 'جاري فحص الرادار...',
      aiAdvisor: 'المستشار الاستراتيجي (IA)',
      aiDesc: 'محرك ذكاء اصطناعي لتحليل الصفقات وتوقع الأسعار اللحظية.',
      hedgingTitle: 'رادار توقع الأسعار والتحوط (Hedging)',
      highRisk: 'خطر هامش ربح مرتفع',
      aiAlert: 'تنبيه (وضع عدم الاتصال): تم رصد ارتفاع متوقع في أسعار الحديد بناءً على بيانات السوق.',
      estSavings: 'الاقتصاد المالي المتوقع',
      actionAdvice: 'الإجراء الموصى به',
      freezeBtn: 'تجميد الأسعار الحالية', coverStockBtn: 'شراء مخزون تغطية',
      analyzeBtn: 'تحليل الصفقة (IA)', analyzing: 'جاري التحليل...',
      estBudget: 'الميزانية التقديرية', stockMatch: 'توافق المخزون',
      timeRem: 'الوقت المتبقي', submitInstant: 'تقديم عرض فوري ⚡'
    },
    fr: {
      title: 'Radar d\'Appels d\'Offres (Live)',
      subtitle: 'Opportunités réelles des portails publics, classées par IA.',
      searchPlace: 'Rechercher (Ciment, Fer, Construction)...',
      tenderType: 'Appel d\'offre',
      unknownAgency: 'Entité Publique',
      viewDetails: 'Détails du marché',
      noData: 'Aucun appel d\'offres trouvé.',
      prev: 'Précédent', next: 'Suivant', scanning: 'Scan du radar en cours...',
      aiAdvisor: 'Conseiller Stratégique (IA)',
      aiDesc: 'Moteur IA pour l\'analyse des marchés et l\'optimisation en temps réel.',
      hedgingTitle: 'Radar de Prédiction des Prix & Hedging',
      highRisk: 'Risque de Marge Élevé',
      aiAlert: 'Alerte (Mode Hors-ligne) : Une hausse des prix est détectée via les données de la bourse.',
      estSavings: 'ÉCONOMIE FINANCIÈRE ESTIMÉE',
      actionAdvice: 'ACTION CONSEILLÉE',
      freezeBtn: 'Geler les devis actuels', coverStockBtn: 'Acheter un stock de couverture',
      analyzeBtn: 'Analyser via IA', analyzing: 'Analyse en cours...',
      estBudget: 'BUDGET ESTIMATIF', stockMatch: 'Stock compatible',
      timeRem: 'Temps restant', submitInstant: 'Soumettre une offre instantanée ⚡'
    },
    en: {
      title: 'Live Tenders Radar',
      subtitle: 'Real opportunities from public procurement portals, intelligently classified.',
      searchPlace: 'Search tenders (Cement, Steel, Construction)...',
      tenderType: 'Public Tender',
      unknownAgency: 'Public Entity',
      viewDetails: 'Market Details',
      noData: 'No matching tenders available right now.',
      prev: 'Previous', next: 'Next', scanning: 'Scanning Live Radar...',
      aiAdvisor: 'Strategic Advisor (AI)',
      aiDesc: 'AI engine for market analysis and real-time optimization.',
      hedgingTitle: 'Price Prediction & Hedging Radar',
      highRisk: 'High Margin Risk',
      aiAlert: 'Alert (Offline Mode): A price hike detected via global market data.',
      estSavings: 'ESTIMATED FINANCIAL SAVINGS',
      actionAdvice: 'RECOMMENDED ACTION',
      freezeBtn: 'Freeze Current Quotes', coverStockBtn: 'Buy Cover Stock',
      analyzeBtn: 'Analyze with AI', analyzing: 'Analyzing...',
      estBudget: 'ESTIMATED BUDGET', stockMatch: 'Stock Match',
      timeRem: 'Time Remaining', submitInstant: 'Submit Instant Offer ⚡'
    }
  };

  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  useEffect(() => {
    fetchTenders();
    const subscription = supabase
      .channel('tenders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tenders' }, (payload) => {
        setTenders((currentTenders) => [payload.new, ...currentTenders]);
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  async function fetchTenders() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTenders(data || []);
    } catch (err) { console.error('Error:', err); } 
    finally { setLoading(false); }
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

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // 🤖 دالة محاكاة تحليل الذكاء الاصطناعي للصفقة
  const handleAiAnalysis = (id) => {
    setAnalyzingId(id);
    setTimeout(() => {
      setAiResults(prev => ({
        ...prev,
        [id]: {
          budget: Math.floor(Math.random() * (900000 - 150000) + 150000).toLocaleString(),
          match: Math.floor(Math.random() * (100 - 75) + 75),
          daysLeft: Math.floor(Math.random() * 20 + 2),
          hoursLeft: Math.floor(Math.random() * 23)
        }
      }));
      setAnalyzingId(null);
    }, 2500);
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

      {/* 🤖 Strategic Advisor Banner (Hedging Radar) */}
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

          <div className="flex flex-wrap gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-500/20">{t.freezeBtn}</button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-2.5 rounded-xl font-black text-sm transition-all">{t.coverStockBtn}</button>
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

                        <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-sm py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex justify-center items-center gap-2">
                          <Zap size={16}/> {t.submitInstant}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAiAnalysis(tender.id)}
                        disabled={isAnalyzing}
                        className="w-full mb-4 py-3 bg-slate-950 border border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-purple-400 font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <BrainCircuit size={18} className="text-purple-500" />}
                        {isAnalyzing ? t.analyzing : t.analyzeBtn}
                      </button>
                    )}

                    <a href={tender.url || tender.link || '#'} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-slate-800 hover:bg-blue-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2">
                      {t.viewDetails} <ArrowUpRight size={18} className={isRtl ? 'rotate-90' : ''} />
                    </a>
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
    </div>
  );
}