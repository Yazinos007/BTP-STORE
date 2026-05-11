import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import { FileSignature, Search, Download, CheckCircle, FileText, Loader2, Calendar } from 'lucide-react';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [merchants, setMerchants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { language } = useSettingsStore();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      // 🌟 جلب الطلبات التي تم توقيعها فقط (بمختلف حالاتها اللاحقة)
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .not('digital_signature', 'is', null) // شرط: يجب أن يحتوي على توقيع
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setContracts(data);
        const merchantIds = [...new Set(data.map(req => req.merchant_id))];
        merchantIds.forEach(id => fetchMerchantData(id));
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMerchantData = async (id) => {
    if (!id || merchants[id]) return;
    const { data } = await supabase.from('suppliers').select('store_name').eq('id', id).single();
    if (data) setMerchants(prev => ({ ...prev, [id]: data }));
  };

  const handleDownloadPDF = (id) => {
    // 🌟 ميزة قادمة: تحويل العقد إلى PDF
    alert(language === 'fr' ? "Génération du PDF en cours de développement..." : "جاري تطوير ميزة تحميل العقد كملف PDF...");
  };

  const filteredContracts = contracts.filter(c => {
    const merchantName = merchants[c.merchant_id]?.store_name?.toLowerCase() || '';
    const poNumber = c.id.toLowerCase();
    const search = searchTerm.toLowerCase();
    return merchantName.includes(search) || poNumber.includes(search);
  });

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FileSignature className="text-purple-500" size={32} />
            {language === 'fr' ? 'Contrats & Signatures' : 'العقود والتوقيعات'}
          </h2>
          <p className="text-slate-400 mt-1 font-medium">
            {language === 'fr' ? 'Archive légale de tous les bons de commande signés.' : 'الأرشيف القانوني لجميع طلبات التزويد الموقعة رقمياً.'}
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={language === 'fr' ? 'Rechercher un contrat...' : 'ابحث عن عقد أو تاجر...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500 transition-all font-medium"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-purple-500" /></div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-16 text-center">
          <FileText size={48} className="text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">{language === 'fr' ? 'Aucun contrat trouvé' : 'لا توجد عقود'}</h3>
          <p className="text-slate-400">{language === 'fr' ? 'Les contrats signés apparaîtront ici.' : 'العقود التي يتم توقيعها ستظهر في هذا الأرشيف.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map(contract => {
            const merchantInfo = merchants[contract.merchant_id] || { store_name: '...' };
            
            return (
              <div key={contract.id} className="bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all shadow-lg group">
                <div className="p-5 border-b border-slate-700 bg-slate-800/80 flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-black text-lg">PO #{contract.id.split('-')[0].toUpperCase()}</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                      <Calendar size={12}/> {new Date(contract.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-purple-500/10 text-purple-400 p-2 rounded-lg">
                    <FileSignature size={20} />
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{language === 'fr' ? 'Client' : 'العميل'}</p>
                    <p className="text-white font-bold text-lg">{merchantInfo.store_name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{language === 'fr' ? 'Montant du Contrat' : 'قيمة العقد'}</p>
                    <p className="text-emerald-400 font-black text-xl">{Number(contract.total_amount).toLocaleString()} DH</p>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                    <p className="text-xs font-bold text-slate-500 mb-1">{language === 'fr' ? 'Signature Numérique' : 'التوقيع الرقمي'}</p>
                    <p className="text-emerald-300 font-black flex items-center gap-2">
                      <CheckCircle size={16}/> {contract.digital_signature}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => handleDownloadPDF(contract.id)}
                  className="w-full p-4 bg-slate-700/30 hover:bg-purple-600 text-slate-300 hover:text-white font-bold flex justify-center items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Download size={18}/> {language === 'fr' ? 'Télécharger PDF' : 'تحميل كملف PDF'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}