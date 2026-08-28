import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { Truck, MapPin, Calendar, ArrowRightLeft, Search, Filter, TrendingDown, CheckCircle2, Loader2, PackageOpen } from 'lucide-react';

const translations = {
  ar: {
    title: 'بورصة اللوجستيك التشاركي',
    subtitle: 'سوق الشاحنات الفارغة المباشر. وفر حتى 40% من تكاليف النقل عبر دمج الشحنات.',
    searchDeparture: 'مدينة الانطلاق...',
    searchArrival: 'مدينة الوصول...',
    allTrucks: 'جميع الشاحنات',
    truck1: 'رموك (Remorque)',
    truck2: 'شاحنة 14 طن',
    truck3: 'شاحنة 19 طن',
    partner: 'الشريك',
    capacity: 'السعة المتاحة',
    date: 'تاريخ الرحلة',
    estSavings: 'توفير مالي تقديري',
    matchButton: 'طلب دمج الشحنة',
    noResults: 'لا توجد شاحنات فارغة تطابق بحثك حالياً.',
    liveUpdates: 'مزامنة حية',
    currency: 'درهم'
  },
  fr: {
    title: 'Bourse de Fret Collaborative',
    subtitle: 'Le marché en direct des retours à vide. Économisez jusqu\'à 40% sur le transport.',
    searchDeparture: 'Ville de départ...',
    searchArrival: 'Ville d\'arrivée...',
    allTrucks: 'Tous les camions',
    truck1: 'Semi-remorque',
    truck2: 'Camion 14T',
    truck3: 'Camion 19T',
    partner: 'Partenaire',
    capacity: 'Capacité dispo.',
    date: 'Date du trajet',
    estSavings: 'Économie estimée',
    matchButton: 'Demander le Matching',
    noResults: 'Aucun camion vide ne correspond à votre recherche.',
    liveUpdates: 'Sync Live',
    currency: 'MAD'
  },
  en: {
    title: 'Collaborative Freight Exchange',
    subtitle: 'Live market for empty returns. Save up to 40% on transport by merging shipments.',
    searchDeparture: 'Departure city...',
    searchArrival: 'Arrival city...',
    allTrucks: 'All Trucks',
    truck1: 'Semi-trailer',
    truck2: '14T Truck',
    truck3: '19T Truck',
    partner: 'Partner',
    capacity: 'Available Cap.',
    date: 'Trip Date',
    estSavings: 'Estimated Savings',
    matchButton: 'Request Match',
    noResults: 'No empty trucks match your search criteria right now.',
    liveUpdates: 'Live Sync',
    currency: 'MAD'
  }
};

export default function LogisticsBourse() {
  const { language } = useSettingsStore();
  const t = translations[language] || translations['fr'];

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // حالات الفلاتر
  const [filterDeparture, setFilterDeparture] = useState('');
  const [filterArrival, setFilterArrival] = useState('');
  const [filterTruck, setFilterTruck] = useState('');
  const [matchingTripId, setMatchingTripId] = useState(null);

  useEffect(() => {
    fetchTrips();

    // الاستماع المباشر للإضافات الجديدة في جدول اللوجستيك
    const subscription = supabase
      .channel('bourse-logistics')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logistics_trips' }, (payload) => {
        setTrips((currentTrips) => [payload.new, ...currentTrips]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'logistics_trips' }, (payload) => {
        // تحديث حالة الشاحنة إذا تم حجزها
        setTrips((currentTrips) => currentTrips.map(trip => trip.id === payload.new.id ? payload.new : trip));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchTrips() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_trips')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  }

  // فلترة ذكية في الواجهة الأمامية
  const filteredTrips = trips.filter(trip => {
    const matchDep = trip.departure_city?.toLowerCase().includes(filterDeparture.toLowerCase());
    const matchArr = trip.arrival_city?.toLowerCase().includes(filterArrival.toLowerCase());
    const matchTruck = filterTruck ? trip.truck_type === filterTruck : true;
    return matchDep && matchArr && matchTruck;
  });

  // خوارزمية تقدير التوفير (كل طن يوفر تقريباً 150 درهم من تكلفة النقل المخصصة)
  const calculateSavings = (capacity) => {
    const savings = (capacity || 20) * 150; 
    return savings.toLocaleString();
  };

  const handleMatchRequest = (tripId) => {
    setMatchingTripId(tripId);
    // محاكاة إرسال الطلب (يمكن ربطها لاحقاً بواتساب أو تحديث قاعدة البيانات)
    setTimeout(() => {
      setMatchingTripId(null);
      alert(language === 'ar' ? 'تم إرسال طلب المطابقة للشريك بنجاح!' : 'Demande de matching envoyée avec succès !');
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-fade-in text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white flex items-center gap-4">
            <Truck className="text-emerald-500" size={36} />
            {t.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg">{t.subtitle}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          {t.liveUpdates}
        </div>
      </div>

      {/* شريط الفلترة المتطور */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl">
        <div className="relative group">
          <MapPin className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors`} size={20} />
          <input 
            type="text" 
            placeholder={t.searchDeparture}
            value={filterDeparture}
            onChange={(e) => setFilterDeparture(e.target.value)}
            className={`w-full bg-slate-950 border border-slate-800 p-3 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-medium`}
          />
        </div>
        
        <div className="relative group">
          <MapPin className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors`} size={20} />
          <input 
            type="text" 
            placeholder={t.searchArrival}
            value={filterArrival}
            onChange={(e) => setFilterArrival(e.target.value)}
            className={`w-full bg-slate-950 border border-slate-800 p-3 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-medium`}
          />
        </div>

        <div className="relative group">
          <Filter className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors`} size={20} />
          <select 
            value={filterTruck}
            onChange={(e) => setFilterTruck(e.target.value)}
            className={`w-full bg-slate-950 border border-slate-800 p-3 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-medium appearance-none`}
          >
            <option value="">{t.allTrucks}</option>
            <option value={t.truck1}>{t.truck1}</option>
            <option value={t.truck2}>{t.truck2}</option>
            <option value={t.truck3}>{t.truck3}</option>
          </select>
        </div>
      </div>

      {/* شبكة الشاحنات الفارغة */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between shadow-lg hover:shadow-emerald-900/20">
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-wider border border-emerald-500/20">
                    {trip.truck_type}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.estSavings}</p>
                    <p className="text-xl font-black text-emerald-400 flex items-center gap-1">
                      <TrendingDown size={18} /> {calculateSavings(trip.available_capacity)} {t.currency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                  <div className="text-center w-2/5">
                    <p className="text-sm font-black text-white truncate" title={trip.departure_city}>{trip.departure_city}</p>
                  </div>
                  <div className="w-1/5 flex justify-center text-slate-500">
                    <ArrowRightLeft size={20} className={language === 'ar' ? 'rotate-180' : ''} />
                  </div>
                  <div className="text-center w-2/5">
                    <p className="text-sm font-black text-white truncate" title={trip.arrival_city}>{trip.arrival_city}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12}/> {t.date}</p>
                    <p className="font-bold text-slate-200">{new Date(trip.trip_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><PackageOpen size={12}/> {t.capacity}</p>
                    <p className="font-bold text-slate-200">{trip.available_capacity} {language === 'ar' ? 'طن' : 'T'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                  <span className="text-xs text-slate-500">{t.partner}:</span>
                  <span className="text-sm font-bold text-slate-300">{trip.supplier_name}</span>
                </div>
              </div>

              <button 
                onClick={() => handleMatchRequest(trip.id)}
                disabled={matchingTripId === trip.id}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex justify-center items-center gap-2 group/btn"
              >
                {matchingTripId === trip.id ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> {t.matchButton}</>}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
          <Truck className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400 font-bold text-lg">{t.noResults}</p>
        </div>
      )}
    </div>
  );
}