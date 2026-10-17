import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../../store/useSettingsStore';
import useArchitectStore from '../../../store/useArchitectStore';
import { supabase } from '../../../lib/supabase';
import { Archive, Trash2, FileText, ArrowRight, Loader2, Calendar } from 'lucide-react';

const translations = {
  ar: {
    pageTitle: 'أرشيف المحاضر المنجزة',
    pageDesc: 'سجل مشفر يضم جميع محاضر الرقابة الميدانية التي تم رفعها لعملائك.',
    loading: 'جاري فك التشفير وجلب السجلات...',
    emptyTitle: 'الأرشيف فارغ حالياً',
    emptyDesc: 'لم تقم برفع أي محاضر PDF إلى بوابات العملاء بعد.',
    client: 'العميل:',
    viewReport: 'استعراض المحضر (PDF)',
    deleteConfirm: '⚠️ تأكيد الحذف:\nهل أنت متأكد أنك تريد مسح هذا المحضر؟\nسيتم إخفاؤه من الأرشيف ومن بوابة العميل.',
    deleteSuccess: '✅ تمت عملية التطهير بنجاح! تم مسح المحضر.',
    deleteError: '❌ فشلت عملية الحذف. السبب: ',
    backBtn: 'العودة للمشاريع'
  },
  fr: {
    pageTitle: 'Archives des PVs',
    pageDesc: 'Registre crypté contenant tous les rapports d\'inspection envoyés à vos clients.',
    loading: 'Décryptage et récupération des données...',
    emptyTitle: 'Les archives sont vides',
    emptyDesc: 'Vous n\'avez pas encore téléchargé de PV PDF sur les portails clients.',
    client: 'Client :',
    viewReport: 'Voir le PV (PDF)',
    deleteConfirm: '⚠️ Confirmation :\nVoulez-vous vraiment supprimer ce PV ?\nIl sera masqué des archives et du portail client.',
    deleteSuccess: '✅ PV supprimé avec succès !',
    deleteError: '❌ Échec de la suppression : ',
    backBtn: 'Retour aux projets'
  },
  en: {
    pageTitle: 'Completed Reports Archive',
    pageDesc: 'Encrypted log of all field inspection reports uploaded to your clients.',
    loading: 'Decrypting and fetching records...',
    emptyTitle: 'Archive is empty',
    emptyDesc: 'You haven\'t uploaded any PDF reports to client portals yet.',
    client: 'Client:',
    viewReport: 'View Report (PDF)',
    deleteConfirm: '⚠️ Confirm Deletion:\nAre you sure you want to delete this report?\nIt will be hidden from the archive and the client portal.',
    deleteSuccess: '✅ Report deleted successfully!',
    deleteError: '❌ Deletion failed: ',
    backBtn: 'Back to Projects'
  }
};

export default function ArchitectArchive() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true;
  const { language } = useSettingsStore();
  const lang = language || 'ar';
  const isRtl = lang === 'ar';
  const t = translations[lang] || translations.ar;
  const navigate = useNavigate();

  const { architectProfile: profile } = useArchitectStore();
  const [archives, setArchives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadArchiveData = async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      // 1. جلب البوابات التي تحتوي على محاضر
      const { data: portals, error: portalError } = await supabase
        .from('client_portals')
        .select('project_id, report_url, created_at')
        .eq('architect_id', profile.id)
        .not('report_url', 'is', null)
        .order('created_at', { ascending: false });

      if (portalError) throw portalError;

      if (!portals || portals.length === 0) {
        setArchives([]);
        setIsLoading(false);
        return;
      }

      // 2. جلب أسماء المشاريع
      const projectIds = portals.map(p => p.project_id);
      const { data: projects, error: projError } = await supabase
        .from('conversations')
        .select('id, project_name, client_name')
        .in('id', projectIds);

      const projectsDict = {};
      if (!projError && projects) {
        projects.forEach(proj => {
          projectsDict[proj.id] = proj;
        });
      }

      // 3. دمج البيانات
      const formattedArchives = portals.map(item => {
        const projData = projectsDict[item.project_id] || {};
        return {
          ...item,
          projectName: projData.project_name || `ملف ورشة رقم #${item.project_id}`,
          clientName: projData.client_name || 'غير محدد'
        };
      });

      setArchives(formattedArchives);
    } catch (err) {
      console.error("خطأ في جلب الأرشيف:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchiveData();
  }, [profile]);

  const handleDelete = async (projectId) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      const { error } = await supabase
        .from('client_portals')
        .update({ report_url: null })
        .eq('project_id', projectId);

      if (error) throw error;
      alert(t.deleteSuccess);
      loadArchiveData(); 
    } catch (err) {
      console.error(err);
      alert(t.deleteError + err.message);
    }
  };

  // Styles
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/20 pb-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${textMain}`}>
            <Archive className="w-7 h-7 text-indigo-500" />
            {t.pageTitle}
          </h1>
          <p className={`text-sm mt-1 ${textMuted}`}>{t.pageDesc}</p>
        </div>
        <button 
          onClick={() => navigate('/v2/architect-projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
           {isRtl ? <ArrowRight size={16} /> : <ArrowRight size={16} className="rotate-180" />}
           {t.backBtn}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
          <p className={`font-bold ${textMuted}`}>{t.loading}</p>
        </div>
      ) : archives.length === 0 ? (
        <div className={`text-center py-20 border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'}`}>
          <div className="text-6xl mb-4 opacity-50">📭</div>
          <h3 className={`text-2xl font-black mb-2 ${textMain}`}>{t.emptyTitle}</h3>
          <p className={textMuted}>{t.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.map((item) => (
            <div key={item.project_id} className={`rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 ${bgMain}`}>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    <Calendar size={14} />
                    {new Date(item.created_at).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-100 text-rose-600 p-1.5 rounded-lg"><FileText size={16} /></span>
                    <button onClick={() => handleDelete(item.project_id)} className="bg-rose-50 text-rose-500 border border-rose-200 p-1.5 rounded-lg hover:bg-rose-500 hover:text-white transition-colors" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className={`text-lg font-black mb-2 truncate ${textMain}`} title={item.projectName}>
                  {item.projectName}
                </h3>
                <p className={`text-sm mb-6 ${textMuted}`}>
                  {t.client} <strong className={textMain}>{item.clientName}</strong>
                </p>
              </div>
              
              <a 
                href={item.report_url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-slate-900 hover:bg-rose-600 text-white py-3 rounded-xl text-center font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
              >
                ⬇️ {t.viewReport}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}