import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import useSupplierStore from '../../store/useSupplierStore';
import useExpenseStore from '../../store/useExpenseStore'; 
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
    recentFirst: 'الأحدث أولاً', highestFirst: 'الأعلى مبلغاً', editMode: 'وضع التعديل',
    receiptLoaded: 'تم رفع الوصل بنجاح', clickToUpload: 'اضغط لرفع الوصل', viewDoc: 'عرض الوثيقة',
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
    recentFirst: 'Plus récent', highestFirst: 'Montant le plus élevé', editMode: 'Mode Édition',
    receiptLoaded: 'Reçu chargé', clickToUpload: 'Cliquez pour charger', viewDoc: 'Voir document',
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
  },
  en: {
    title: 'Expenses & Net Result', subtitle: 'Accurately track your business expenses and get detailed analytics.',
    revenue: 'Total Sales (Collected)', expenses: 'Total Expenses', netProfit: 'Net Profit',
    addExpense: 'Record New Expense', editExpense: 'Edit Expense', desc: 'Description / Reason', amount: 'Amount',
    category: 'Category', paymentMethod: 'Payment Method', save: 'Add Expense', saving: 'Saving...',
    cancel: 'Cancel', actions: 'Actions', confirmDelete: 'Are you sure you want to delete this expense?',
    history: 'Expense History', date: 'Date', empty: 'No expenses recorded.', currency: 'MAD',
    recentFirst: 'Newest First', highestFirst: 'Highest Amount', editMode: 'Edit Mode',
    receiptLoaded: 'Receipt uploaded', clickToUpload: 'Click to upload receipt', viewDoc: 'View Document',
    categories: { 
      achats: 'Goods/Materials Purchase', carburant: 'Fuel & Tolls',
      transport: 'Transport & Logistics', loyer: 'Rent & Facilities', 
      utilities: 'Water & Electricity', telecom: 'Phone & Internet',
      fournitures: 'Office Supplies', maintenance: 'Maintenance & Repair', 
      salaries: 'Salaries & Bonuses', taxes: 'Taxes & Social Security',
      assurance: 'Insurance', banque: 'Bank Fees',
      honoraires: 'Professional Fees (Accountant/Lawyer)', marketing: 'Marketing & Advertising',
      other: 'Other' 
    },
    methods: { cash: 'Cash', cheque: 'Cheque', transfer: 'Bank Transfer', card: 'Credit Card' },
    analytics: 'Financial Expense Analysis', searchPlaceholder: 'Search by description or category...'
  }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#EAB308', '#D946EF'];

export default function ContractorExpenses() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const { supplier } = useSupplierStore();
  const { expenses, fetchExpenses, addExpense, updateExpense, deleteExpense } = useExpenseStore();
  
  const t = translations[language] || translations.ar;
  
  const [revenue, setRevenue] = useState(0);
  const [isLoadingUI, setIsLoadingUI] = useState(true);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'achats', payment_method: 'cash', receipt_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('amount'); 

  useEffect(() => {
    // 🛡️ Load data automatically
    loadData();
  }, [supplier]);

  const loadData = async () => {
    setIsLoadingUI(true);
    // 1. نجلب جميع المصاريف (حقيقية)
    await fetchExpenses();
    
    // 2. نجلب الإيرادات من فواتير B2B الحقيقية
    try {
      if(supplier?.id){
          const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;
          
          const { data: myProducts } = await supabase.from('products').select('name').eq('supplier_id', targetId);
          const myProductNames = new Set(myProducts?.map(p => (p.name || '').replace(/\s+/g, '').toLowerCase()) || []);
          
          const { data: allInvoices } = await supabase.from('documents').select('total_amount, items').eq('type', 'Facture');
          
          // نأخذ الفواتير التي تخص المورد فقط
          const myInvoices = (allInvoices || []).filter(inv => (inv.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase())));
          
          setRevenue(myInvoices.reduce((sum, doc) => sum + Number(doc.total_amount || 0), 0));
      } else {
           // بيانات وهمية للـ Demo في حال لم يتم تسجيل الدخول بمورد
           setRevenue(125000);
      }
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
      alert(language === 'fr' ? `Erreur de téléchargement: ${err.message}` : language === 'en' ? `Upload error: ${err.message}` : `فشل رفع الملف: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const finalAmount = Math.abs(parseFloat(String(formData.amount || 0).replace(/[^0-9.]/g, '')));

      const payload = { 
        title: formData.title, 
        amount: finalAmount, 
        category: formData.category, 
        payment_method: formData.payment_method
      };
      
      if (formData.receipt_url) {
        payload.receipt_url = formData.receipt_url;
      }

      if (editingId) {
        await updateExpense(editingId, payload);
      } else {
        await addExpense(payload);
      }

      setFormData({ title: '', amount: '', category: 'achats', payment_method: 'cash', receipt_url: '' });
      setEditingId(null);
      await fetchExpenses(); // Refresh
    } catch (error) {
      console.error("خطأ الحفظ:", error);
      alert("Erreur: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (exp) => {
    const safeAmount = String(exp.amount || 0).replace(/[^0-9.-]/g, '');  
    setFormData({ 
      title: exp.title, 
      amount: Math.abs(Number(safeAmount) || 0), 
      category: exp.category, 
      payment_method: exp.payment_method, 
      receipt_url: exp.receipt_url || ''
    });
    setEditingId(exp.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => { if (window.confirm(t.confirmDelete)) await deleteExpense(id); };
  
  const cancelEdit = () => { 
      setFormData({ title: '', amount: '', category: 'achats', payment_method: 'cash', receipt_url: '' }); 
      setEditingId(null); 
  };

  // بيانات المصاريف
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  
  // دمج بيانات الـ Demo إذا لم تكن هناك بيانات حقيقية
  const displayExpenses = safeExpenses.length > 0 ? safeExpenses : [
      {id: '1', title: 'شراء أسمنت بورتلاند', category: 'achats', amount: 15000, created_at: new Date().toISOString(), payment_method: 'transfer'},
      {id: '2', title: 'وقود الشاحنات', category: 'carburant', amount: 2500, created_at: new Date().toISOString(), payment_method: 'card'},
      {id: '3', title: 'أجور العمال', category: 'salaries', amount: 35000, created_at: new Date().toISOString(), payment_method: 'cash'},
  ];

  const titleSuggestions = [...new Set(displayExpenses.map(exp => exp?.title).filter(Boolean))];
  const totalExpenses = displayExpenses.reduce((sum, exp) => sum + Math.abs(Number(exp.amount || 0)), 0);
  const netProfit = revenue - totalExpenses;

  // الحسابات للمخطط الدائري
  const expensesByCategoryKey = displayExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Math.abs(Number(exp.amount || 0));
    return acc;
  }, {});
  
  const sortedCategoryKeys = Object.keys(expensesByCategoryKey).sort((a, b) => expensesByCategoryKey[b] - expensesByCategoryKey[a]);
  const categoryColorMap = sortedCategoryKeys.reduce((map, key, index) => { map[key] = COLORS[index % COLORS.length]; return map; }, {});
  const chartData = sortedCategoryKeys.map(key => ({ name: t.categories[key] || t.categories.other, value: expensesByCategoryKey[key], fill: categoryColorMap[key] }));

  // الفلترة والترتيب
  const sortedAndFilteredExpenses = useMemo(() => {
    let list = [...displayExpenses];

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
  }, [displayExpenses, searchTerm, sortBy, t.categories]);


  // 🎨 تنسيقات الواجهة 
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
  const modalBox = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const tableHeadBg = isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600';
  const tableRowHover = isDarkMode ? 'hover:bg-slate-800/40 divide-slate-800/50' : 'hover:bg-slate-50 divide-slate-100';

  const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-3xl shadow-lg text-white ${bgGradient} transition-transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
      <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none"><Icon size={100} /></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <div>
          <p className="text-sm font-bold text-white/80 mb-1">{title}</p>
          <h4 className="text-3xl font-black tracking-tight font-mono" dir="ltr">
            {value} <span className="text-sm font-bold text-white/70 uppercase tracking-widest">{t.currency}</span>
          </h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${bgMain} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
            <Receipt className="text-orange-500" size={36} /> {t.title}
          </h2>
          <p className={`${textMuted} font-bold mt-2`}>{t.subtitle}</p>
        </div>
      </div>

      {/* 🚀 الإحصائيات الذكية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.revenue} value={revenue.toLocaleString()} icon={DollarSign} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-400" />
        <StatCard title={t.expenses} value={totalExpenses.toLocaleString()} icon={TrendingDown} bgGradient="bg-gradient-to-br from-orange-500 to-red-500" />
        <StatCard title={t.netProfit} value={netProfit.toLocaleString()} icon={PieChartIcon} bgGradient={netProfit >= 0 ? "bg-gradient-to-br from-indigo-600 to-blue-500" : "bg-gradient-to-br from-red-700 to-rose-600"} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        
        {/* 🚀 نموذج إدخال المصاريف */}
        <div className={`${bgMain} border-2 rounded-[2rem] p-6 md:p-8 shadow-xl h-fit relative`}>
          {editingId && <div className="absolute top-4 right-4 text-xs font-black text-blue-500 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full animate-pulse">{t.editMode}</div>}
          
          <h3 className={`text-xl font-black mb-6 ${textMain} flex items-center gap-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-4`}>
            {editingId ? <Edit size={24} className="text-blue-500" /> : <Plus size={24} className="text-blue-500" />} 
            {editingId ? t.editExpense : t.addExpense}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className={`block text-xs font-bold ${textMuted}`}>{t.desc}</label>
              <input 
                type="text" list="titles-list" required 
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
                className={`w-full px-4 py-3.5 border-2 rounded-xl focus:border-blue-500 outline-none font-bold ${bgInput}`} 
                placeholder="Ex: Achat fournitures..." autoComplete="off" 
              />
              <datalist id="titles-list">{titleSuggestions.map((title, i) => <option key={i} value={title} />)}</datalist>
            </div>
            
            <div className="space-y-2">
              <label className={`block text-xs font-bold ${textMuted}`}>{t.amount}</label>
              <div className="relative">
                <input type="number" required min="1" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className={`w-full ${isRtl ? 'pr-4 pl-16' : 'pl-4 pr-16'} py-3.5 border-2 rounded-xl focus:border-blue-500 outline-none font-black text-orange-500 font-mono text-lg ${bgInput}`} />
                <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-xs font-black ${textMuted} uppercase`}>{t.currency}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className={`text-xs font-bold ${textMuted} flex items-center gap-2`}><Tag size={16}/> {t.category}</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={`w-full px-4 py-3.5 border-2 rounded-xl focus:border-blue-500 outline-none font-bold ${bgInput}`}>
                {Object.entries(t.categories).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className={`text-xs font-bold ${textMuted} flex items-center gap-2`}><CreditCard size={16}/> {t.paymentMethod}</label>
              <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className={`w-full px-4 py-3.5 border-2 rounded-xl focus:border-blue-500 outline-none font-bold ${bgInput}`}>
                {Object.entries(t.methods).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold ${textMuted} flex items-center gap-2`}>
                <Paperclip size={16}/> 
                {language === 'fr' ? 'Justificatif / Reçu (Optionnel)' : language === 'en' ? 'Receipt (Optional)' : 'الوصل / الفاتورة (اختياري)'}
              </label>
              <label className={`w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.receipt_url ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : `${isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-500 hover:bg-slate-800' : 'border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}`}>
                {isUploading ? (
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                ) : formData.receipt_url ? (
                  <><CheckCircle size={18} /> <span className="text-sm font-bold">{t.receiptLoaded}</span></>
                ) : (
                  <><UploadCloud size={18} /> <span className="text-sm font-bold">{t.clickToUpload}</span></>
                )}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept="image/png, image/jpeg, image/jpg, application/pdf" />
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50 mt-6">
              {editingId && ( 
                <button type="button" onClick={cancelEdit} className={`w-1/3 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                  <X size={18}/> {t.cancel}
                </button> 
              )}
              <button type="submit" disabled={isSubmitting || isUploading} className={`${editingId ? 'w-2/3' : 'w-full'} bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-500 font-black transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2`}>
                {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (editingId ? t.editExpense : t.save)}
              </button>
            </div>
          </form>
        </div>

        {/* 🚀 قسم التحليلات وسجل المصاريف */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* المخطط الدائري (يظهر فقط إذا كان هناك مصاريف) */}
          {chartData.length > 0 && (
            <div className={`${bgMain} border-2 rounded-[2rem] p-8 shadow-xl`}>
              <h3 className={`font-black text-xl mb-6 ${textMain}`}>{t.analytics}</h3>
              <div className="w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${Number(value).toLocaleString()} ${t.currency}`} 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #334155', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="middle" align={isRtl ? 'left' : 'right'} layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 'bold', color: isDarkMode ? '#cbd5e1' : '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* جدول سجل المصاريف */}
          <div className={`${bgMain} border-2 rounded-[2rem] shadow-xl overflow-hidden`}>
            <div className={`p-6 border-b ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
              <div className="flex items-center gap-3"> 
                <Receipt size={24} className="text-orange-500" /> 
                <h3 className={`font-black text-xl ${textMain}`}>{t.history}</h3> 
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <select 
                  value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full sm:w-auto px-5 py-3.5 border-2 rounded-xl outline-none focus:border-blue-500 text-sm font-bold transition-all cursor-pointer ${bgInput}`}
                >
                  <option value="amount">{t.highestFirst}</option>
                  <option value="date">{t.recentFirst}</option>
                </select>
                <div className="relative w-full sm:w-72">
                  <Search size={18} className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} />
                  <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-sm transition-all ${bgInput}`} />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className={`border-b ${tableHeadBg} text-xs uppercase font-black`}>
                    <th className="px-6 py-5 tracking-widest text-start">{t.desc}</th>
                    <th className="px-6 py-5 tracking-widest text-start">{t.category}</th>
                    <th className="px-6 py-5 tracking-widest text-start">{t.date}</th>
                    <th className={`px-6 py-5 tracking-widest ${isRtl ? 'text-start' : 'text-end'}`}>{t.amount}</th>
                    <th className="px-6 py-5 tracking-widest text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableRowHover}`}>
                  {isLoadingUI ? (<tr><td colSpan="5" className="p-16 text-center"><Loader2 size={36} className="animate-spin text-blue-500 mx-auto"/></td></tr>) 
                  : sortedAndFilteredExpenses.length === 0 ? (<tr><td colSpan="5" className={`p-16 text-center ${textMuted} font-black text-lg`}>{t.empty}</td></tr>) 
                  : (
                    sortedAndFilteredExpenses.map((exp) => {
                      const currentCategoryColor = categoryColorMap[exp.category] || COLORS[COLORS.length - 1];
                      return (
                        <tr key={exp.id} className={`transition-colors group ${editingId === exp.id ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}>
                          <td className={`px-6 py-5 font-bold ${textMain}`}>
                            <div className="flex items-center gap-2">
                              {exp.title}
                              {exp.receipt_url && (
                                <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 inline-flex items-center p-1 bg-blue-500/10 rounded-md" title={t.viewDoc}>
                                  <Paperclip size={14} />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border" style={{ backgroundColor: `${currentCategoryColor}15`, borderColor: `${currentCategoryColor}40`, color: currentCategoryColor }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentCategoryColor }}></span>
                              {t.categories[exp.category] || t.categories.other}
                            </span>
                          </td>
                          <td className={`px-6 py-5 ${textMuted} font-bold text-xs`}>
                            {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA').format(new Date(exp.created_at || exp.date || new Date()))}
                          </td>
                          <td className={`px-6 py-5 font-black font-mono text-xl text-orange-500 ${isRtl ? 'text-start' : 'text-end'}`} dir="ltr">
                            -{Math.abs(Number(exp.amount)).toLocaleString()} <span className={`text-[10px] font-bold ${textMuted} uppercase`}>{t.currency}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(exp)} className={`p-3 rounded-xl transition-all shadow-sm hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-slate-100 text-blue-600 hover:bg-blue-500 hover:text-white'}`} title={t.editExpense}><Edit size={16}/></button>
                              <button onClick={() => handleDelete(exp.id)} className={`p-3 rounded-xl transition-all shadow-sm hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-red-400 hover:bg-red-600 hover:text-white' : 'bg-slate-100 text-red-600 hover:bg-red-500 hover:text-white'}`} title={t.actions}><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}