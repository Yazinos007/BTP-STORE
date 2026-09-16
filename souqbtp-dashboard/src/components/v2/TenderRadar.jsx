import { useState, useEffect } from 'react';
import { Search, Building2, Calendar, ArrowUpRight, Filter, Loader2, Sparkles, Gavel, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';

const translations = {
  ar: {
    title: 'رادار المناقصات الحية',
    subtitle: 'فرص حقيقية من بوابات الصفقات العمومية، مصنفة بذكاء.',
    searchPlace: 'ابحث عن صفقات (إسمنت، حديد، بناء)...',
    deadline: 'آخر أجل',
    location: 'المدينة',
    agency: 'صاحب المشروع',
    viewDetails: 'تفاصيل الصفقة',
    noData: 'لا توجد مناقصات مطابقة حالياً.',
    tenderType: 'صفقة عمومية',
    unknownAgency: 'جهة عمومية',
    reference: 'المرجع'
  },
  fr: {
    title: 'Radar d\'Appels d\'Offres',
    subtitle: 'Opportunités réelles des portails publics, classées par IA.',
    searchPlace: 'Rechercher (Ciment, Fer, Construction)...',
    deadline: 'Date limite',
    location: 'Ville',
    agency: 'Maître d\'ouvrage',
    viewDetails: 'Détails du marché',
    noData: 'Aucun appel d\'offres trouvé.',
    tenderType: 'Appel d\'offre',
    unknownAgency: 'Entité Publique',
    reference: 'Référence'
  },
  en: {
    title: 'Live Tenders Radar',
    subtitle: 'Real opportunities from public procurement portals, intelligently classified.',
    searchPlace: 'Search tenders (Cement, Steel, Construction)...',
    deadline: 'Deadline',
    location: 'City',
    agency: 'Project Owner',
    viewDetails: 'Market Details',
    noData: 'No matching tenders available right now.',
    tenderType: 'Public Tender',
    unknownAgency: 'Public Entity',
    reference: 'Reference'
  }
};

export default function TenderRadar() {
  const { language } = useSettingsStore();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const t = translations[language] || translations['fr'];

  useEffect(() => {
    fetchTenders();

    const subscription = supabase
      .channel('tenders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tenders' }, (payload) => {
        setTenders((currentTenders) => [payload.new, ...currentTenders]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchTenders() {
    try {
      setLoading(true);
      // ⚠️ أزلنا فلتر (status=active) لكي نعرض جميع الصفقات التي يجلبها الروبوت
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenders(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  // الفلترة حسب البحث بذكاء للغات الثلاث
  const filteredTenders = tenders.filter(tender => {
    const title = language === 'fr' ? (tender.objet || tender.title_fr) : 
                  language === 'en' ? (tender.title_en || tender.objet || tender.title_fr) : 
                  (tender.title_ar !== 'صفقة جديدة' ? tender.title_ar : (tender.objet || ''));
                  
    return (title || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTenders = filteredTenders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-10 animate-fade-in text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white flex items-center gap-4">
            <Gavel className="text-blue-500" size={36} />
            {t.title}
          </h2>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert("سيتم إضافة نافذة الفلاتر قريباً!")} 
            className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="relative group">
        <Search className={`absolute ${language === 'ar' ? 'right-5' : 'left-5'} top-5 text-slate-500 group-focus-within:text-blue-500 transition-colors`} size={24} />
        <input 
          type="text" 
          placeholder={t.searchPlace}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full bg-slate-900/50 border border-slate-800 p-5 ${language === 'ar' ? 'pr-14 pl-5' : 'pl-14 pr-5'} rounded-3xl text-white outline-none focus:border-blue-500 focus:bg-slate-900 transition-all shadow-2xl font-medium`}
        />
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Scanning Live Radar...</p>
        </div>
      ) : filteredTenders.length > 0 ? (
        <div className="flex flex-col space-y-10">
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-start">
            {currentTenders.map(tender => (
              <div key={tender.id} className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/40 transition-all group relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Gavel size={120} />
                </div>
            
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest border border-blue-600/20">
                    {t.tenderType}
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-white mb-6 leading-snug h-16 line-clamp-2" title={tender.objet || tender.title_ar}>
                  {language === 'fr' ? (tender.objet || tender.title_fr) : 
                   language === 'en' ? (tender.title_en || tender.objet || tender.title_fr) : 
                   (tender.title_ar !== 'صفقة جديدة' ? tender.title_ar : (tender.objet || 'بدون عنوان'))}
                </h3>

                {/* ⚠️ تم ملء الأعمدة الفارغة بمعلومات الموعد النهائي والمرجع */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="p-2 bg-slate-800 rounded-lg"><Building2 size={16} /></div>
                    <span className="truncate" title={(language === 'fr' ? tender.agency_fr : tender.agency_ar) || t.unknownAgency}>
                      {(language === 'fr' ? tender.agency_fr : tender.agency_ar) || t.unknownAgency}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="p-2 bg-slate-800 rounded-lg"><Calendar size={16} /></div>
                    <span className="truncate">
                      {tender.deadline ? new Date(tender.deadline).toLocaleDateString() : '---'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-400 md:col-span-2">
                    <div className="p-2 bg-slate-800 rounded-lg"><Hash size={16} /></div>
                    <span className="truncate font-mono">
                      {tender.reference && tender.reference !== 'N/A' ? tender.reference : 'No Ref'}
                    </span>
                  </div>
                </div>

                <a 
                  href={tender.url || tender.link || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-slate-800 hover:bg-blue-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 group/btn"
                >
                  {t.viewDetails}
                  <ArrowUpRight size={18} className={`group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform ${language === 'ar' ? 'rotate-90 group-hover/btn:rotate-0' : ''}`} />
                </a>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
              >
                {language === 'ar' ? 'السابق' : 'Précédent'}
              </button>
              
              <div className="flex items-center gap-2 overflow-x-auto max-w-[200px] md:max-w-none">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
              >
                {language === 'ar' ? 'التالي' : 'Suivant'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
          <p className="text-slate-500 font-bold">{t.noData}</p>
        </div>
      )}
    </div>
  );
}