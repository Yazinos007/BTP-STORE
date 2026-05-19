import { useState, useEffect } from 'react';
import { Search, MapPin, Building, Calendar, ArrowRight, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase'; // تأكد من المسار الصحيح للـ supabase client
import useSettingsStore from '../store/useSettingsStore';

export default function TenderRadar() {
  const { language } = useSettingsStore();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenders();
  }, []);

  async function fetchTenders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('status', 'active') // جلب المناقصات المفتوحة فقط
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenders(data || []);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white">رادار المناقصات الحية 📡</h2>
          <p className="text-slate-400">بيانات حقيقية، فرص حقيقية.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenders.map(tender => (
            <div key={tender.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all">
              <h3 className="text-xl font-bold text-white mb-4">{tender.title}</h3>
              <div className="space-y-2 text-sm text-slate-400 mb-6">
                <div className="flex items-center gap-2"><Building size={16} /> {tender.agency}</div>
                <div className="flex items-center gap-2"><MapPin size={16} /> {tender.location}</div>
                <div className="flex items-center gap-2"><Calendar size={16} /> الموعد: {tender.deadline}</div>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                <span className="text-blue-400 font-black">{Number(tender.value).toLocaleString()} درهم</span>
                <button className="flex items-center gap-1 text-white font-bold hover:text-blue-400">
                  تفاصيل <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}