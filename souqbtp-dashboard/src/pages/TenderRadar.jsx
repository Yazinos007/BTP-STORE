import { useState, useEffect } from 'react';
import { Search, MapPin, Building2, Calendar, ArrowUpRight, Filter, Loader2, Sparkles, Gavel } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';

export default function TenderRadar() {
  const { language } = useSettingsStore();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const t = {
    ar: {
      title: 'رادار المناقصات الحية',
      subtitle: 'فرص حقيقية من بوابات الصفقات العمومية، مصنفة بذكاء.',
      searchPlace: 'ابحث عن صفقات (إسمنت، حديد، بناء)...',
      deadline: 'الموعد النهائي',
      location: 'المدينة',
      agency: 'صاحب المشروع',
      viewDetails: 'تفاصيل الصفقة',
      noData: 'لا توجد مناقصات مطابقة حالياً.'
    },
    fr: {
      title: 'Radar d\'Appels d\'Offres',
      subtitle: 'Opportunités réelles des portails publics, classées par IA.',
      searchPlace: 'Rechercher (Ciment, Fer, Construction)...',
      deadline: 'Date limite',
      location: 'Ville',
      agency: 'Maître d\'ouvrage',
      viewDetails: 'Détails du marché',
      noData: 'Aucun appel d\'offres trouvé.'
    }
  }[language];

  useEffect(() => {
    console.log("الرادار بدأ العمل!");
    fetchTenders();
  }, []);

  async function fetchTenders() {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .eq('status', 'active');

    // أضف هذه الأسطر:
    console.log("Data from Supabase:", data);
    console.log("Error from Supabase:", error);

    if (error) throw error;
    setTenders(data || []);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
}

  const filteredTenders = tenders.filter(tender => {
    const title = language === 'fr' ? tender.title_fr : tender.title_ar;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-10 animate-fade-in text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* 🚀 هيدر استراتيجي */}
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
          <button className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* 🔍 محرك البحث الذكي */}
      <div className="relative group">
        <Search className="absolute right-5 top-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={24} />
        <input 
          type="text" 
          placeholder={t.searchPlace}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full bg-slate-900/50 border border-slate-800 p-5 ${language === 'ar' ? 'pr-14' : 'pl-14'} rounded-3xl text-white outline-none focus:border-blue-500 focus:bg-slate-900 transition-all shadow-2xl`}
        />
      </div>

      {/* 📡 قائمة المناقصات الحية */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Scanning Live Radar...</p>
        </div>
      ) : filteredTenders.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredTenders.map(tender => (
            <div key={tender.id} className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/40 transition-all group relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Gavel size={120} />
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest border border-blue-600/20">
                Appel d'offre
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-6 leading-snug h-16 line-clamp-2">
                {language === 'fr' ? tender.title_fr : tender.title_ar}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="p-2 bg-slate-800 rounded-lg"><Building2 size={16} /></div>
                  <span className="truncate">{language === 'fr' ? tender.agency_fr : tender.agency_ar}</span>
                </div>
              </div>

              <button className="w-full py-4 bg-slate-800 hover:bg-blue-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 group/btn">
                {t.viewDetails}
                <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
          <p className="text-slate-500 font-bold">{t.noData}</p>
        </div>
      )}
    </div>
  );
}