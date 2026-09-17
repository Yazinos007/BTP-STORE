import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Truck, Search, MapPin, Calendar, Weight, ArrowRightLeft, 
  Sparkles, CheckCircle2, Plus, Filter, Zap, ShieldCheck,
  TrendingUp, ArrowUpRight
} from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore';

export default function FreightExchange() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';

  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const translations = {
    ar: {
      title: 'بورصة الشحن التعاونية', subtitle: 'السوق المباشر لرحلات العودة الفارغة. وفر حتى 40% من تكاليف النقل.',
      aiOptimizer: 'المُحسّن اللوجستي "العودة المشحونة"', aiOptDesc: 'قلل تكاليف شاحناتك الفارغة بدمج مسارات العودة مع موردين ومقاولين آخرين.',
      addReturn: 'إضافة رحلة عودة فارغة', matchFound: 'تم العثور على تطابق 1',
      detectedReturn: 'رحلة عودة فارغة مرصودة', estSavings: 'الاقتصاد المالي المتوقع',
      partner: 'الشريك', date: 'التاريخ', available: 'متاح',
      confirmMatch: 'تأكيد المشاركة والتطابق', aiInsight: 'اكتشف الذكاء الاصطناعي فرصة لدمج الشحنات وتقليل تكاليف النقل.',
      from: 'مدينة الانطلاق...', to: 'مدينة الوصول...', allTrucks: 'جميع الشاحنات',
      requestMatch: 'طلب التطابق (Matching)', capacity: 'الحمولة المتاحة'
    },
    fr: {
      title: 'Bourse de Fret Collaborative', subtitle: 'Le marché en direct des retours à vide. Économisez jusqu\'à 40% sur le transport.',
      aiOptimizer: 'Optimiseur Logistique "Retour Chargé"', aiOptDesc: 'Réduisez les frais de vos camions vides en fusionnant les trajets de retour avec d\'autres fournisseurs.',
      addReturn: 'Ajouter un retour à vide', matchFound: '1 Matching Trouvé',
      detectedReturn: 'RETOUR À VIDE DÉTECTÉ', estSavings: 'ÉCONOMIE FINANCIÈRE ESTIMÉE',
      partner: 'Partenaire', date: 'Date', available: 'Disponible',
      confirmMatch: 'Confirmer le partage et le matching', aiInsight: 'L\'IA a détecté une opportunité de fusionner les expéditions et de réduire les coûts de transport.',
      from: 'Ville de départ...', to: 'Ville d\'arrivée...', allTrucks: 'Tous les camions',
      requestMatch: 'Demander le Matching', capacity: 'Capacité dispo.'
    },
    en: {
      title: 'Collaborative Freight Exchange', subtitle: 'Live market for empty returns. Save up to 40% on transport costs.',
      aiOptimizer: 'Logistics Optimizer "Loaded Return"', aiOptDesc: 'Reduce empty truck costs by merging return routes with other suppliers.',
      addReturn: 'Add Empty Return', matchFound: '1 Match Found',
      detectedReturn: 'EMPTY RETURN DETECTED', estSavings: 'ESTIMATED FINANCIAL SAVINGS',
      partner: 'Partner', date: 'Date', available: 'Available',
      confirmMatch: 'Confirm Sharing & Matching', aiInsight: 'AI detected an opportunity to merge shipments and reduce transport costs.',
      from: 'Departure city...', to: 'Arrival city...', allTrucks: 'All Trucks',
      requestMatch: 'Request Matching', capacity: 'Avail. Capacity'
    }
  };
  const t = translations[language] || translations.ar;

  // 🚀 بيانات الشاحنات المتاحة (محاكاة من صورتك)
  const freightOffers = [
    { id: 1, type: 'SEMI-REMORQUE', savings: 4500, from: 'Tanger', to: 'Casablanca', date: '29/08/2026', capacity: '30 T', partner: 'مورد SouqBTP' },
    { id: 2, type: 'CAMION 19T', savings: 2700, from: 'Casablanca', to: 'Beni Mellal', date: '28/08/2026', capacity: '18 T', partner: 'مورد SouqBTP' },
    { id: 3, type: 'SEMI-REMORQUE', savings: 3750, from: 'Marrakech', to: 'Agadir', date: '28/08/2026', capacity: '25 T', partner: 'مورد SouqBTP' },
    { id: 4, type: 'FOURGON', savings: 1200, from: 'Rabat', to: 'Tanger', date: '30/08/2026', capacity: '3.5 T', partner: 'BTP Express' },
    { id: 5, type: 'CAMION 19T', savings: 3100, from: 'Agadir', to: 'Laayoune', date: '01/09/2026', capacity: '15 T', partner: 'Sud Logistique' },
    { id: 6, type: 'SEMI-REMORQUE', savings: 5200, from: 'Oujda', to: 'Fès', date: '02/09/2026', capacity: '28 T', partner: 'مورد SouqBTP' },
  ];

  const filteredOffers = freightOffers.filter(offer => {
    return offer.from.toLowerCase().includes(searchFrom.toLowerCase()) && 
           offer.to.toLowerCase().includes(searchTo.toLowerCase());
  });

  // 🎨 تنسيقات الألوان المتوافقة مع الوضعين
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgInput = isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400';

  return (
    <div className={`space-y-8 animate-fade-in max-w-7xl mx-auto pb-24`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${bgMain} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
              <Truck className="text-emerald-500" size={36} /> {t.title}
            </h2>
            <span className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sync Live
            </span>
          </div>
          <p className={`${textMuted} font-bold`}>{t.subtitle}</p>
        </div>
      </div>

      {/* 🤖 AI Logistics Optimizer (Merged from AI Advisor) */}
      <div className={`border-2 ${isDarkMode ? 'bg-[#0b1121] border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} rounded-[2rem] p-6 md:p-8 shadow-[0_10px_40px_rgba(16,185,129,0.15)] relative overflow-hidden group`}>
        
        {/* Header of AI Optimizer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Truck size={28} />
            </div>
            <div>
              <h3 className={`text-xl font-black ${textMain}`}>{t.aiOptimizer}</h3>
              <p className={`text-xs ${textMuted} font-bold mt-1`}>{t.aiOptDesc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className={`flex-1 md:flex-none flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-800'} px-5 py-3 rounded-xl border border-slate-700 font-bold transition-all`}>
              <Plus size={18}/> {t.addReturn}
            </button>
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-xl flex items-center gap-2 font-black text-sm">
              <CheckCircle2 size={18}/> {t.matchFound}
            </div>
          </div>
        </div>

        {/* The Detected Match Card */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 relative`}>
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-2`}>{t.detectedReturn}</p>
              <div className={`text-lg md:text-xl font-black ${textMain} flex items-center gap-3`}>
                Tanger <ArrowRightLeft className="text-emerald-500" size={20}/> Casablanca
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-start md:text-end">
              <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-1`}>{t.estSavings}</p>
              <p className="text-2xl font-black text-emerald-500 font-mono" dir="ltr">3,500 <span className="text-sm">MAD</span></p>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
              <p className={`text-[10px] ${textMuted} mb-1`}>{t.partner}:</p>
              <p className={`font-bold ${textMain} flex items-center gap-1`}><ShieldCheck size={14} className="text-blue-500"/> مورد SouqBTP</p>
            </div>
            <div>
              <p className={`text-[10px] ${textMuted} mb-1`}>{t.date}:</p>
              <p className={`font-bold ${textMain}`}>2026-08-29</p>
            </div>
            <div>
              <p className={`text-[10px] ${textMuted} mb-1`}>{t.available}:</p>
              <p className={`font-bold ${textMain}`}>30 طن - Semi-remorque</p>
            </div>
          </div>

          <p className={`text-xs font-bold ${textMuted} flex items-center gap-2 mb-6 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10`}>
            <Zap size={16} className="text-emerald-500" /> {t.aiInsight}
          </p>

          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2">
            {t.confirmMatch} <ArrowUpRight size={18} className={isRtl ? 'rotate-90' : ''}/>
          </button>
        </div>
      </div>

      {/* 🚀 Search and Filters */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${bgMain} p-4 rounded-2xl border-2 shadow-sm`}>
        <div className="relative">
          <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={20}/>
          <input type="text" placeholder={t.from} value={searchFrom} onChange={e => setSearchFrom(e.target.value)} className={`w-full ${bgInput} py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl outline-none font-bold transition-all`} />
        </div>
        <div className="relative">
          <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={20}/>
          <input type="text" placeholder={t.to} value={searchTo} onChange={e => setSearchTo(e.target.value)} className={`w-full ${bgInput} py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl outline-none font-bold transition-all`} />
        </div>
        <div className="relative">
          <Filter className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={20}/>
          <select className={`w-full ${bgInput} py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl outline-none font-bold transition-all appearance-none cursor-pointer`}>
            <option>{t.allTrucks}</option>
            <option>SEMI-REMORQUE</option>
            <option>CAMION 19T</option>
            <option>FOURGON</option>
          </select>
        </div>
      </div>

      {/* 🚀 Live Market Grid (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map(offer => (
          <div key={offer.id} className={`${bgMain} border-2 p-6 rounded-[2rem] hover:border-emerald-500/50 transition-all duration-300 group shadow-lg flex flex-col`}>
            
            {/* Header: Truck Type & Savings */}
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest`}>
                {offer.type}
              </span>
              <div className="text-end">
                <p className={`text-[9px] ${textMuted} font-black uppercase tracking-widest mb-0.5`}>{t.estSavings}</p>
                <p className="text-emerald-500 font-black font-mono text-sm flex items-center justify-end gap-1" dir="ltr">
                  <TrendingUp size={14}/> {offer.savings} MAD
                </p>
              </div>
            </div>

            {/* Route */}
            <div className={`flex items-center justify-between ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 mb-6`}>
              <div className="text-center w-2/5">
                <p className={`font-black ${textMain} truncate`}>{offer.from}</p>
              </div>
              <div className="flex-1 flex justify-center text-slate-600 px-2">
                <ArrowRightLeft size={16} />
              </div>
              <div className="text-center w-2/5">
                <p className={`font-black ${textMain} truncate`}>{offer.to}</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className={`text-[10px] ${textMuted} font-black mb-1 flex items-center gap-1`}><Calendar size={12}/> {t.date}</p>
                <p className={`text-sm font-bold ${textMain}`}>{offer.date}</p>
              </div>
              <div>
                <p className={`text-[10px] ${textMuted} font-black mb-1 flex items-center gap-1`}><Weight size={12}/> {t.capacity}</p>
                <p className={`text-sm font-bold ${textMain}`}>{offer.capacity}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-slate-800 flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs">
                <span className={textMuted}>{t.partner}:</span>
                <span className={`font-bold ${textMain} flex items-center gap-1`}><ShieldCheck size={14} className="text-blue-500"/> {offer.partner}</span>
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2">
                <CheckCircle2 size={18}/> {t.requestMatch}
              </button>
            </div>

          </div>
        ))}
        {filteredOffers.length === 0 && (
          <div className={`col-span-full text-center py-16 ${textMuted} font-bold text-lg`}>
            لا توجد شاحنات مطابقة للبحث في الوقت الحالي.
          </div>
        )}
      </div>
    </div>
  );
}