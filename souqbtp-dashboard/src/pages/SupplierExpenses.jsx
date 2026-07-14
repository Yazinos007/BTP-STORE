import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import useExpenseStore from '../store/useExpenseStore'; 
import { Receipt, Plus, TrendingDown, DollarSign, PieChart as PieChartIcon, CreditCard, Tag, Edit, Trash2, X, Search, Loader2, UploadCloud, CheckCircle, Paperclip } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const translations = {
  ar: {
    title: 'إدارة المصاريف والنتيجة', subtitle: 'تتبع نفقات شركتك بدقة واحصل على تحليلات مفصلة.',
    revenue: 'إجمالي المبيعات (المحصلة)', expenses: 'إجمالي المصاريف', netProfit: 'النتيجة الصافية',
    addExpense: 'تسجيل مصروف جديد', editExpense: 'تعديل المصروف', desc: 'البيان / الوصف', amount: 'المبلغ',
    category: 'التصنيف', paymentMethod: 'طريقة الدفع', save: 'إضافة المصروف', saving: 'جاري التسجيل...',
    cancel: 'إلغاء', actions: 'إجراءات', confirmDelete: 'هل أنت متأكد من حذف هذا المصروف؟',
    history: 'سجل المصاريف', date: 'التاريخ', empty: 'لا توجد مصاريف مسجلة.', currency: 'درهم',
    recentFirst: 'الأحدث أولاً', highestFirst: 'الأعلى مبلغاً',
    categories: { 
      achats: 'شراء السلع/المواد', carburant: 'المحروقات والطريق السيار',
      transport: 'النقل واللوجستيك', loyer: 'الكراء / الإيجار', 
      utilities: 'الماء والكهرباء', telecom: 'الهاتف والإنترنت',
      fournitures: 'أدوات مكتبية', maintenance: 'الصيانة والإصلاح', 
      salaries: 'الرواتب والمكافآت', taxes: 'الضمان الاجتماعي والضرائب',
      assurance: 'التأمين', banque: 'الاقتطاعات البنكية',
      honoraires: 'أتعاب المحاسب/المحامي', marketing: 'الإشهار والتسويق',
      other: 'أخرى' 
    },
    methods: { cash: 'نقداً (Espèces)', cheque: 'شيك (Chèque)', transfer: 'تحويل (Virement)', card: 'بطاقة (Carte)' },
    analytics: 'التحليل المالي للمصاريف', searchPlaceholder: 'ابحث بالوصف أو التصنيف...'
  },
  fr: {
    title: 'Gestion des Charges et Résultat', subtitle: 'Suivez les dépenses de votre entreprise avec précision.',
    revenue: 'Total Ventes (Encaissées)', expenses: 'Total des Charges', netProfit: 'Résultat Net',
    addExpense: 'Enregistrer une charge', editExpense: 'Modifier la charge', desc: 'Description / Motif', amount: 'Montant',
    category: 'Catégorie', paymentMethod: 'Mode de Paiement', save: 'Ajouter la charge', saving: 'Enregistrement...',
    cancel: 'Annuler', actions: 'Actions', confirmDelete: 'Voulez-vous vraiment supprimer cette charge ?',
    history: 'Historique des charges', date: 'Date', empty: 'Aucune charge enregistrée.', currency: 'MAD',
    recentFirst: 'Plus récent', highestFirst: 'Montant le plus élevé',
    categories: { 
      achats: 'Achat de marchandises', carburant: 'Carburant & Péage',
      transport: 'Transport & Logistique', loyer: 'Loyer & Charges locatives', 
      utilities: 'Eau & Électricité', telecom: 'Téléphone & Internet',
      fournitures: 'Fournitures de bureau', maintenance: 'Entretien & Réparation', 
      salaries: 'Salaires & Primes', taxes: 'CNSS & Impôts',
      assurance: 'Assurances', banque: 'Frais bancaires',
      honoraires: 'Honoraires (Comptable/Avocat)', marketing: 'Marketing & Publicité',
      other: 'Autre' 
    },
    methods: { cash: 'Espèces', cheque: 'Chèque', transfer: 'Virement', card: 'Carte Bancaire' },
    analytics: 'Analyse des Charges', searchPlaceholder: 'Rechercher par description, catégorie...'
  }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#EAB308', '#D946EF'];

export default function SupplierExpenses() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const { expenses, fetchExpenses, addExpense, updateExpense, deleteExpense } = useExpenseStore();
  const t = translations[language];
  
  const [revenue, setRevenue] = useState(0);
  const [isLoadingUI, setIsLoadingUI] = useState(true);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'achats', payment_method: 'cash', receipt_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🎯 تعديل: جعل الترتيب التنازلي بالمبالغ هو الافتراضي فور فتح الصفحة
  const [sortBy, setSortBy] = useState('amount'); 

  useEffect(() => {
    if (supplier?.id) {
      loadData();
    }
  }, [supplier]);

  const loadData = async () => {
    setIsLoadingUI(true);
    await fetchExpenses();
    
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;
      const { data: myProducts } = await supabase.from('products').select('name').eq('supplier_id', targetId);
      const myProductNames = new Set(myProducts?.map(p => (p.name || '').replace(/\s+/g, '').toLowerCase()) || []);
      const { data: allInvoices } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
      const myInvoices = (allInvoices || []).filter(inv => (inv.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase())));
      setRevenue(myInvoices.reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0));
    } catch (error) {
      console.error("Error fetching revenue:", error);
    } finally {
      setIsLoadingUI(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, receipt_url: urlData.publicUrl }));
      
    } catch (err) {
      console.error('Error uploading:', err.message);
      alert(language === 'fr' ? `Erreur de téléchargement: ${err.message}` : `فشل رفع الملف: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const rawAmount = parseFloat(String(formData.amount || 0).replace(/[^0-9.]/g, ''));
      const finalAmount = Math.abs(rawAmount); 

      const payload = { 
        title: formData.title, 
        amount: finalAmount, 
        category: formData.category, 
        payment_method: formData.payment_method, 
        receipt_url: formData.receipt_url || null
      };

      if (editingId) {
        await updateExpense(editingId, payload);
      } else {
        await addExpense(payload);
      }

      setFormData({ title: '', amount: '', category: 'achats', payment_method: 'cash', receipt_url: '' });
      setEditingId(null);
      alert("تم الحفظ بنجاح");
    } catch (error) {
      console.error("خطأ الحفظ التفصيلي:", error);
      alert("خطأ أثناء الحفظ: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (exp) => {
    setFormData({ 
      title: exp.title, amount: Math.abs(Number(exp.amount)), 
      category: exp.category, payment_method: exp.payment_method, receipt_url: exp.receipt_url || ''
    });
    setEditingId(exp.id);
  };

  const handleDelete = async (id) => { if (window.confirm(t.confirmDelete)) await deleteExpense(id); };
  const cancelEdit = () => { setFormData({ title: '', amount: '', category: 'achats', payment_method: 'cash', receipt_url: '' }); setEditingId(null); };

  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const titleSuggestions = [...new Set(safeExpenses.map(exp => exp?.title).filter(Boolean))];
  const totalExpenses = safeExpenses.reduce((sum, exp) => sum + Math.abs(Number(exp.amount || 0)), 0);
  const netProfit = revenue - totalExpenses;

  const expensesByCategoryKey = safeExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Math.abs(Number(exp.amount || 0));
    return acc;
  }, {});
  
  const sortedCategoryKeys = Object.keys(expensesByCategoryKey).sort((a, b) => expensesByCategoryKey[b] - expensesByCategoryKey[a]);
  const categoryColorMap = sortedCategoryKeys.reduce((map, key, index) => { map[key] = COLORS[index % COLORS.length]; return map; }, {});
  const chartData = sortedCategoryKeys.map(key => ({ name: t.categories[key] || t.categories.other, value: expensesByCategoryKey[key], fill: categoryColorMap[key] }));

  // 🎯 الدالة المدرعة المدمجة للفلترة والترتيب التنازلي التلقائي
  const sortedAndFilteredExpenses = useMemo(() => {
    let list = [...safeExpenses];

    // الفلترة
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(exp => {
        const catLabel = t.categories[exp.category] || '';
        return (
          (exp.title || '').toLowerCase().includes(term) || 
          catLabel.toLowerCase().includes(term) || 
          String(exp.amount || '').includes(term)
        );
      });
    }

    // الترتيب
    return list.sort((a, b) => {
      if (sortBy === 'amount') {
        const cleanA = String(a.amount || 0).replace(/[^0-9.]/g, '');
        const cleanB = String(b.amount || 0).replace(/[^0-9.]/g, '');
        const valA = Math.abs(Number(cleanA) || 0);
        const valB = Math.abs(Number(cleanB) || 0);
        return valB - valA;
      } else {
        const dateA = new Date(a.created_at || a.date || Date.now()).getTime();
        const dateB = new Date(b.created_at || b.date || Date.now()).getTime();
        return dateB - dateA;
      }
    });
  }, [safeExpenses, searchTerm, sortBy, t.categories]);

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <h4 className="text-2xl font-black tracking-tight">{value} <span className="text-sm font-normal text-white/70">{t.currency}</span></h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h2>
        <p className="text-gray-500 mt-1 font-medium">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.revenue} value={revenue.toLocaleString()} icon={DollarSign} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" />
        <StatCard title={t.expenses} value={totalExpenses.toLocaleString()} icon={TrendingDown} bgGradient="bg-gradient-to-br from-orange-500 to-red-500" />
        <StatCard title={t.netProfit} value={netProfit.toLocaleString()} icon={PieChartIcon} bgGradient={netProfit >= 0 ? "bg-gradient-to-br from-indigo-600 to-blue-500" : "bg-gradient-to-br from-red-700 to-rose-600"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit relative">
          {editingId && <div className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md animate-pulse">Mode Édition</div>}
          <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
            {editingId ? <Edit size={18} className="text-blue-600" /> : <Plus size={18} className="text-blue-600" />} {editingId ? t.editExpense : t.addExpense}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t.desc}</label>
              <input type="text" list="titles-list" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-gray-50 font-medium transition-all" placeholder="Ex: Achat fournitures..." autoComplete="off" />
              <datalist id="titles-list">{titleSuggestions.map((title, i) => <option key={i} value={title} />)}</datalist>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t.amount}</label>
              <div className="relative">
                <input type="number" required min="1" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className={`w-full ${language === 'ar' ? 'pr-4 pl-12' : 'pl-4 pr-12'} py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-gray-50 font-black text-red-600 transition-all`} />
                <span className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-4' : 'right-4'} text-xs font-bold text-gray-400`}>{t.currency}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><Tag size={16} className="text-gray-400"/> {t.category}</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white font-medium text-gray-700 transition-all shadow-sm">
                {Object.entries(t.categories).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><CreditCard size={16} className="text-gray-400"/> {t.paymentMethod}</label>
              <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white font-medium text-gray-700 transition-all shadow-sm">
                {Object.entries(t.methods).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Paperclip size={16} className="text-gray-400"/> 
                {language === 'fr' ? 'Justificatif / Reçu (Optionnel)' : 'الوثيقة الثبوتية / الوصل (اختياري)'}
              </label>
              <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed rounded-xl cursor-pointer transition-all ${formData.receipt_url ? 'border-green-400 bg-green-50 text-green-600' : 'border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                {isUploading ? (
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                ) : formData.receipt_url ? (
                  <><CheckCircle size={18} className="text-green-500" /> <span className="text-sm font-bold">{language === 'fr' ? 'Reçu chargé' : 'تم رفع الوصل بنجاح'}</span></>
                ) : (
                  <><UploadCloud size={18} /> <span className="text-sm font-medium">{language === 'fr' ? 'Cliquez pour charger' : 'اضغط لرفع الوصل'}</span></>
                )}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept="image/png, image/jpeg, image/jpg, application/pdf" />
              </label>
            </div>

            <div className="flex gap-2 pt-2 mt-4 border-t border-gray-100">
              {editingId && ( <button type="button" onClick={cancelEdit} className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-bold transition-all flex items-center justify-center gap-1"><X size={16}/> {t.cancel}</button> )}
              <button type="submit" disabled={isSubmitting || isUploading} className={`${editingId ? 'w-2/3' : 'w-full'} bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30`}>{isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : (editingId ? t.editExpense : t.save)}</button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {chartData.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">{t.analytics}</h3>
              <div className="w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ${t.currency}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                    <Legend verticalAlign="middle" align={language === 'ar' ? 'left' : 'right'} layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#4B5563' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full">
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2"> 
                <Receipt size={20} className="text-gray-400" /> 
                <h3 className="font-black text-gray-800">{t.history}</h3> 
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-bold bg-white text-gray-700 transition-all cursor-pointer"
                >
                  <option value="amount">{t.highestFirst}</option>
                  <option value="date">{t.recentFirst}</option>
                </select>
                <div className="relative w-full sm:w-72">
                  <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} />
                  <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium bg-white transition-all`} />
                </div>
              </div>
            </div>
            
            {isLoadingUI ? ( <div className="p-12 text-center text-gray-500"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto" /></div> ) : sortedAndFilteredExpenses.length === 0 ? ( <div className="p-12 text-center text-gray-400"><Receipt size={40} className="mx-auto mb-3 opacity-20" />{t.empty}</div> ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead className="border-b border-gray-100 bg-white">
                    <tr>
                      <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.desc}</th>
                      <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.category}</th>
                      <th className="px-6 py-4 text-gray-400 font-black text-start uppercase tracking-wider text-xs">{t.date}</th>
                      <th className="px-6 py-4 text-gray-400 font-black text-end uppercase tracking-wider text-xs">{t.amount}</th>
                      <th className="px-6 py-4 text-gray-400 font-black text-center uppercase tracking-wider text-xs">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedAndFilteredExpenses.map((exp) => {
                      const currentCategoryColor = categoryColorMap[exp.category] || COLORS[COLORS.length - 1];
                      return (
                        <tr key={exp.id} className={`hover:bg-blue-50/30 transition-colors group ${editingId === exp.id ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4 text-gray-800 font-bold">
                            <div className="flex items-center gap-2">
                              {exp.title}
                              {exp.receipt_url && (
                                <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 inline-flex items-center" title="عرض الوثيقة"><Paperclip size={14} /></a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 border" style={{ backgroundColor: `${currentCategoryColor}10`, borderColor: `${currentCategoryColor}40`, color: currentCategoryColor }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentCategoryColor }}></span>
                              {t.categories[exp.category] || t.categories.other}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                            {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'ar-MA').format(new Date(exp.created_at || exp.date || new Date()))}
                          </td>
                          <td className="px-6 py-4 text-red-600 font-black font-mono text-end text-base" dir="ltr">
                            -{Math.abs(Number(exp.amount)).toLocaleString()} <span className="text-[10px] font-bold opacity-70 uppercase">{t.currency}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(exp)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title={t.editExpense}><Edit size={16}/></button>
                              <button onClick={() => handleDelete(exp.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}