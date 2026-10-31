import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import {
  HardHat, Plus, Trash2, CheckCircle2, Clock, Users, Wallet,
  Receipt, Star, MessageCircle, Loader2, MapPin, Phone
} from 'lucide-react';

// دالة موحدة لجلب وحفظ بيانات الحرفي الميدانية في سحابة Supabase
async function loadArtisanCloudData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, store: { projects: [], clients: [], expenses: [], reviews: [] } };

  const metaStore = user.user_metadata?.artisan_workspace || {};
  return {
    user,
    store: {
      projects: Array.isArray(metaStore.projects) ? metaStore.projects : [],
      clients: Array.isArray(metaStore.clients) ? metaStore.clients : [],
      expenses: Array.isArray(metaStore.expenses) ? metaStore.expenses : [],
      reviews: Array.isArray(metaStore.reviews) ? metaStore.reviews : []
    }
  };
}

async function saveArtisanCloudData(newStore) {
  await supabase.auth.updateUser({
    data: { artisan_workspace: newStore }
  });
}

// =========================================================================
// 1. قسم أوراشي الجارية (Chantiers en Cours) - مربوط بـ Supabase
// =========================================================================
export function ProviderProjectsPage() {
  const { isDarkMode = true } = useOutletContext() || {};
  const { language = 'fr' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState({ projects: [], clients: [], expenses: [], reviews: [] });
  const [form, setForm] = useState({ title: '', client: '', city: '', budget: '', progress: 20 });

  useEffect(() => {
    loadArtisanCloudData().then(({ store: s }) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const newProj = {
      id: Date.now().toString(),
      title: form.title.trim(),
      client: form.client.trim() || '-',
      city: form.city.trim() || '-',
      budget: Number(form.budget) || 0,
      progress: Number(form.progress) || 0,
      status: Number(form.progress) >= 100 ? 'completed' : 'active',
      created_at: new Date().toLocaleDateString('fr-FR')
    };
    const updated = { ...store, projects: [newProj, ...store.projects] };
    setStore(updated);
    await saveArtisanCloudData(updated);
    setForm({ title: '', client: '', city: '', budget: '', progress: 20 });
    setSaving(false);
  };

  const handleUpdateProgress = async (id, newProg) => {
    const updatedProjects = store.projects.map(p =>
      p.id === id ? { ...p, progress: newProg, status: newProg >= 100 ? 'completed' : 'active' } : p
    );
    const updated = { ...store, projects: updatedProjects };
    setStore(updated);
    await saveArtisanCloudData(updated);
  };

  const handleDelete = async (id) => {
    const updated = { ...store, projects: store.projects.filter(p => p.id !== id) };
    setStore(updated);
    await saveArtisanCloudData(updated);
  };

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

  const activeCount = store.projects.filter(p => p.status !== 'completed').length;
  const completedCount = store.projects.filter(p => p.status === 'completed').length;
  const totalValue = store.projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <HardHat className="text-orange-500" size={28} />
            {isRtl ? 'أوراشي الجارية (مرتبط بالسحابة)' : 'Mes Chantiers en Cours'}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {isRtl ? 'تتبع تقدم أوراشك الحقيقية وميزانياتها لحظة بلحظة.' : 'Suivez l\'avancement réel de vos chantiers sauvegardés sur le cloud.'}
          </p>
        </div>
      </div>

      {/* KPIs الحقيقية من Supabase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'الأوراش النشطة' : 'Chantiers Actifs'}</span>
          <p className="text-3xl font-black text-orange-500 mt-1">{activeCount}</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'الأوراش المكتملة' : 'Chantiers Terminés'}</span>
          <p className="text-3xl font-black text-emerald-500 mt-1">{completedCount}</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'القيمة الإجمالية للأوراش' : 'Valeur Totale des Chantiers'}</span>
          <p className="text-3xl font-black text-blue-500 mt-1" dir="ltr">{totalValue.toLocaleString()} MAD</p>
        </div>
      </div>

      {/* استمارة إضافة ورش جديد */}
      <form onSubmit={handleAddProject} className={`${cardBg} border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end`}>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'اسم الورش / الخدمة' : 'Nom du chantier'}</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={isRtl ? 'مثال: صباغة فيلا...' : 'Ex: Peinture Villa...'} className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" required />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'اسم الزبون' : 'Client'}</label>
          <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder={isRtl ? 'اسم صاحب المشروع' : 'Nom du client'} className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'المدينة / الحي' : 'Ville / Quartier'}</label>
          <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder={isRtl ? 'الدار البيضاء...' : 'Casablanca...'} className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'المبلغ المتفق عليه (MAD)' : 'Montant convenu (MAD)'}</label>
          <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" />
        </div>
        <button type="submit" disabled={saving} className="py-2.5 px-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Plus size={18} /> {saving ? '...' : (isRtl ? 'إضافة الورش' : 'Ajouter')}
        </button>
      </form>

      {/* قائمة الأوراش */}
      <div className="space-y-3">
        {store.projects.length === 0 ? (
          <div className={`${cardBg} border rounded-3xl p-12 text-center text-slate-400 font-bold`}>
            {isRtl ? 'لا توجد أوراش مسجلة حالياً (0). أضف أول ورش لك من الأعلى!' : 'Aucun chantier enregistré (0). Ajoutez votre premier chantier ci-dessus !'}
          </div>
        ) : (
          store.projects.map(p => (
            <div key={p.id} className={`${cardBg} border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg">{p.title}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${p.progress >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {p.progress}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold flex items-center gap-3">
                  <span>👤 {p.client}</span>
                  <span>📍 {p.city}</span>
                  <span>📅 {p.created_at}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={p.progress}
                  onChange={e => handleUpdateProgress(p.id, Number(e.target.value))}
                  className="w-32 accent-orange-500 cursor-pointer"
                />
                <span className="font-black text-emerald-400 font-mono" dir="ltr">{Number(p.budget).toLocaleString()} MAD</span>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 2. قسم الزبناء والتسبيقات (Clients & Avances) - يبدأ من 0 ومربوط بـ Supabase
// =========================================================================
export function ProviderClientsPage() {
  const { isDarkMode = true } = useOutletContext() || {};
  const { language = 'fr' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState({ projects: [], clients: [], expenses: [], reviews: [] });
  const [form, setForm] = useState({ name: '', phone: '', total: '', avance: '' });

  useEffect(() => {
    loadArtisanCloudData().then(({ store: s }) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const total = Number(form.total) || 0;
    const avance = Number(form.avance) || 0;
    const newClient = {
      id: Date.now().toString(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      total,
      avance,
      reste: Math.max(0, total - avance),
      date: new Date().toLocaleDateString('fr-FR')
    };
    const updated = { ...store, clients: [newClient, ...store.clients] };
    setStore(updated);
    await saveArtisanCloudData(updated);
    setForm({ name: '', phone: '', total: '', avance: '' });
  };

  const handleDelete = async (id) => {
    const updated = { ...store, clients: store.clients.filter(c => c.id !== id) };
    setStore(updated);
    await saveArtisanCloudData(updated);
  };

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  const totalAgreed = store.clients.reduce((s, c) => s + (Number(c.total) || 0), 0);
  const totalAvances = store.clients.reduce((s, c) => s + (Number(c.avance) || 0), 0);
  const totalReste = store.clients.reduce((s, c) => s + (Number(c.reste) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl`}>
        <h1 className="text-2xl font-black flex items-center gap-3">
          <Users className="text-blue-500" size={28} />
          {isRtl ? 'دفتر الزبناء والتسبيقات (Clients & Avances)' : 'Carnet Clients & Avances'}
        </h1>
        <p className="text-xs text-slate-400 font-bold mt-1">
          {isRtl ? 'سجّل تسبيقات الزبناء والباقي في ذمتهم مع تذكير مباشر عبر واتساب.' : 'Gérez les avances reçues et le reste à payer de vos clients en temps réel.'}
        </p>
      </div>

      {/* إحصائيات حقيقية تبدأ من 0 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'إجمالي المتفق عليه' : 'Total Convenu'}</span>
          <p className="text-3xl font-black text-blue-400 mt-1" dir="ltr">{totalAgreed.toLocaleString()} MAD</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'مجموع التسبيقات المقبوضة' : 'Avances Encaissées'}</span>
          <p className="text-3xl font-black text-emerald-400 mt-1" dir="ltr">{totalAvances.toLocaleString()} MAD</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'الباقي لدى الزبناء (الكريدي)' : 'Reste à Encaisser (Crédit)'}</span>
          <p className="text-3xl font-black text-amber-400 mt-1" dir="ltr">{totalReste.toLocaleString()} MAD</p>
        </div>
      </div>

      {/* نموذج إضافة زبون وتسبيق */}
      <form onSubmit={handleAddClient} className={`${cardBg} border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end`}>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'اسم الزبون' : 'Nom du client'}</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={isRtl ? 'الاسم الكامل' : 'Nom complet'} className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" required />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'رقم الهاتف (واتساب)' : 'Téléphone'}</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="06..." className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'المبلغ الإجمالي (MAD)' : 'Total (MAD)'}</label>
          <input type="number" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" required />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'التسبيق المقبوض (Avance)' : 'Avance reçue (MAD)'}</label>
          <input type="number" value={form.avance} onChange={e => setForm({ ...form, avance: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" />
        </div>
        <button type="submit" className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Plus size={18} /> {isRtl ? 'حفظ الزبون' : 'Enregistrer'}
        </button>
      </form>

      {/* جدول الزبناء */}
      <div className="space-y-3">
        {store.clients.length === 0 ? (
          <div className={`${cardBg} border rounded-3xl p-12 text-center text-slate-400 font-bold`}>
            {isRtl ? 'لا يوجد زبناء مسجلون بعد (0 MAD).' : 'Aucun client enregistré pour le moment (0 MAD).'}
          </div>
        ) : (
          store.clients.map(c => (
            <div key={c.id} className={`${cardBg} border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
              <div>
                <h4 className="font-black text-base">{c.name}</h4>
                <p className="text-xs text-slate-400 font-bold">{c.phone || '-'} • {c.date}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs font-bold text-slate-400">Total: <strong className="text-white">{c.total.toLocaleString()} MAD</strong></span>
                <span className="text-xs font-bold text-emerald-400">Avance: <strong>{c.avance.toLocaleString()} MAD</strong></span>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400">
                  {isRtl ? 'الباقي:' : 'Reste:'} {c.reste.toLocaleString()} MAD
                </span>
                {c.phone && c.reste > 0 && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/^0/, '212')}?text=${encodeURIComponent(`السلام عليكم ${c.name}، تذكير ودي بخصوص المبلغ المتبقي (${c.reste} درهم). شكراً لكم.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
                <button onClick={() => handleDelete(c.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 3. قسم أجور الخدامة والمصاريف (Journaliers & Frais) - يبدأ من 0 ومربوط بـ Supabase
// =========================================================================
export function ProviderExpensesPage() {
  const { isDarkMode = true } = useOutletContext() || {};
  const { language = 'fr' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState({ projects: [], clients: [], expenses: [], reviews: [] });
  const [form, setForm] = useState({ label: '', category: 'journalier', amount: '' });

  useEffect(() => {
    loadArtisanCloudData().then(({ store: s }) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.amount) return;
    const newExp = {
      id: Date.now().toString(),
      label: form.label.trim(),
      category: form.category,
      amount: Number(form.amount) || 0,
      date: new Date().toLocaleDateString('fr-FR')
    };
    const updated = { ...store, expenses: [newExp, ...store.expenses] };
    setStore(updated);
    await saveArtisanCloudData(updated);
    setForm({ label: '', category: 'journalier', amount: '' });
  };

  const handleDelete = async (id) => {
    const updated = { ...store, expenses: store.expenses.filter(x => x.id !== id) };
    setStore(updated);
    await saveArtisanCloudData(updated);
  };

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  const totalEncaisse = store.clients.reduce((s, c) => s + (Number(c.avance) || 0), 0);
  const totalExpenses = store.expenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const netProfit = totalEncaisse - totalExpenses;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl`}>
        <h1 className="text-2xl font-black flex items-center gap-3">
          <Receipt className="text-emerald-500" size={28} />
          {isRtl ? 'أجور الخدامة والمصاريف اليومية' : 'Journaliers & Frais de Chantier'}
        </h1>
        <p className="text-xs text-slate-400 font-bold mt-1">
          {isRtl ? 'احسب يوميات العمال ومصاريف التنقل والسلعة لمعرفة ربحك الصافي الحقيقي.' : 'Suivez les salaires journaliers et vos frais pour connaître votre bénéfice net réel.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'المقبوضات الفعلية (التسبيقات)' : 'Total Encaissé'}</span>
          <p className="text-3xl font-black text-emerald-400 mt-1" dir="ltr">{totalEncaisse.toLocaleString()} MAD</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'مجموع المصاريف وأجور الخدامة' : 'Total Charges & Journaliers'}</span>
          <p className="text-3xl font-black text-red-400 mt-1" dir="ltr">{totalExpenses.toLocaleString()} MAD</p>
        </div>
        <div className={`${cardBg} border rounded-2xl p-5`}>
          <span className="text-xs font-black text-slate-400 uppercase">{isRtl ? 'الربح الصافي الحقيقي' : 'Bénéfice Net Réel'}</span>
          <p className={`text-3xl font-black mt-1 ${netProfit >= 0 ? 'text-blue-400' : 'text-red-500'}`} dir="ltr">
            {netProfit.toLocaleString()} MAD
          </p>
        </div>
      </div>

      <form onSubmit={handleAddExpense} className={`${cardBg} border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end`}>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'بيان المصروف / اسم العامل' : 'Désignation / Ouvrier'}</label>
          <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder={isRtl ? 'مثال: يومية المعلم رضوان' : 'Ex: Journée ouvrier Redouane'} className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" required />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'النوع' : 'Catégorie'}</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white">
            <option value="journalier">{isRtl ? 'أجرة عامل يومي (خدام)' : 'Ouvrier Journalier'}</option>
            <option value="transport">{isRtl ? 'تنقل وكازوال' : 'Transport & Gasoil'}</option>
            <option value="outillage">{isRtl ? 'شراء أدوات وسلعة' : 'Outillage & Matériaux'}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">{isRtl ? 'المبلغ (MAD)' : 'Montant (MAD)'}</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm font-bold text-white" required />
        </div>
        <button type="submit" className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Plus size={18} /> {isRtl ? 'تسجيل المصروف' : 'Ajouter'}
        </button>
      </form>

      <div className="space-y-3">
        {store.expenses.length === 0 ? (
          <div className={`${cardBg} border rounded-3xl p-12 text-center text-slate-400 font-bold`}>
            {isRtl ? 'لا توجد مصاريف مسجلة بعد (0 MAD).' : 'Aucune dépense enregistrée (0 MAD).'}
          </div>
        ) : (
          store.expenses.map(x => (
            <div key={x.id} className={`${cardBg} border rounded-2xl p-4 flex items-center justify-between`}>
              <div>
                <p className="font-black text-sm">{x.label}</p>
                <span className="text-xs text-slate-400 font-bold">{x.category} • {x.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-red-400 font-mono" dir="ltr">-{x.amount.toLocaleString()} MAD</span>
                <button onClick={() => handleDelete(x.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 4. قسم آراء الزبناء والتوصيات (Avis & Recommandations)
// =========================================================================
export function ProviderReviewsPage() {
  const { isDarkMode = true } = useOutletContext() || {};
  const { language = 'fr' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState({ projects: [], clients: [], expenses: [], reviews: [] });

  useEffect(() => {
    loadArtisanCloudData().then(({ store: s }) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl flex items-center justify-between`}>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Star className="text-amber-400 fill-amber-400" size={28} />
            {isRtl ? 'تقييمات الزبناء وسمعة الورشة' : 'Avis & Recommandations Clients'}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {isRtl ? 'التقييمات الموثقة ترفع ترتيبك في رادار المقاولين والمهندسين.' : 'Les avis vérifiés augmentent votre visibilité auprès des entrepreneurs et architectes.'}
          </p>
        </div>
        <div className="text-center px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-2xl font-black text-amber-400">{store.reviews.length}</span>
          <p className="text-[10px] font-black text-slate-400 uppercase">{isRtl ? 'تقييم موثق' : 'Avis vérifiés'}</p>
        </div>
      </div>

      {store.reviews.length === 0 && (
        <div className={`${cardBg} border rounded-3xl p-12 text-center space-y-3`}>
          <Star size={40} className="mx-auto text-amber-400 opacity-50" />
          <p className="font-black text-base">{isRtl ? 'لا توجد تقييمات مسجلة بعد (0)' : 'Aucun avis client pour le moment (0)'}</p>
          <p className="text-xs text-slate-400 font-bold max-w-md mx-auto">
            {isRtl ? 'بمجرد إنهاء أوراشك مع المقاولين والمهندسين على المنصة، ستظهر تقييماتهم وتوصياتهم هنا تلقائياً.' : 'Dès que vous terminez un chantier sur la plateforme, les évaluations de vos clients apparaîtront ici automatiquement.'}
          </p>
        </div>
      )}
    </div>
  );
}