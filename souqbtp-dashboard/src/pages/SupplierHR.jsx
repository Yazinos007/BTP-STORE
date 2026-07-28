import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  Briefcase, UserPlus, DollarSign, Users, CheckCircle, XCircle, Clock, 
  FileText, Printer, X, Trash2, Search, UserCheck, User, Wallet, 
  GraduationCap, FolderOpen, AlertCircle, ChevronRight, Loader2,
  CalendarDays, Award, BookOpen, AlertTriangle, Plus, Activity
} from 'lucide-react';

const translations = {
  ar: {
    title: 'الموارد البشرية', subtitle: 'إدارة الموظفين والمسار المهني والرواتب.',
    addBtn: 'تعيين موظف', totalEmp: 'إجمالي الموظفين', activeEmp: 'الموظفون النشطون',
    payroll: 'كتلة الأجور الشهرية', profileTitle: 'الملف الشامل للموظف', newEmp: 'موظف جديد',
    tabInfo: 'المعلومات الأساسية', tabPaie: 'الرواتب والقسائم', tabCareer: 'المسار والإجازات', tabDocs: 'محفظة الوثائق',
    name: 'الاسم الكامل', position: 'المنصب / المهمة', salary: 'الراتب الأساسي', cin: 'رقم البطاقة (CIN)', phone: 'رقم الهاتف',
    primes: 'المنح / التسبيقات', retenues: 'اقتطاعات (CNSS/AMO)',
    save: 'حفظ البيانات', cancel: 'إلغاء', date: 'تاريخ التعيين', status: 'الحالة', actions: 'إجراءات',
    loading: 'جاري التحميل...', empty: 'لا يوجد موظفون مسجلون حالياً.', currency: 'درهم',
    statusActive: 'نشط', statusLeave: 'في إجازة', statusTerminated: 'منهي العقد',
    payslip: 'توليد قسيمة الراتب', printBtn: 'طباعة القسيمة', closeBtn: 'إغلاق', month: 'الشهر',
    confirmDelete: 'هل أنت متأكد من حذف هذا الموظف نهائياً؟', searchPlaceholder: 'ابحث بالاسم، CIN، أو المنصب...',
    designation: 'البيان', amount: 'المبلغ', netToPay: 'صافي الأجر للاستلام',
    employerSign: 'توقيع المشغل', employeeSign: 'توقيع الموظف', docInternal: 'مستند داخلي - الأجور',
    profileTooltip: 'فتح ملف الموظف', deleteTooltip: 'حذف الموظف',
    comingSoon: 'هذه الميزة قيد التطوير وستتوفر قريباً!', module: 'إدارة الـ HR',
    leavesTitle: 'إدارة الإجازات', leaveBalance: 'الرصيد:', days: 'أيام',
    addLeave: 'إضافة إجازة', leaveType: 'نوع الإجازة', leaveStart: 'تاريخ البدء', leaveEnd: 'تاريخ الانتهاء',
    timelineTitle: 'المسار المهني (Timeline)', addEvent: 'إضافة حدث',
    eventPromo: 'ترقية', eventTrain: 'دورة تدريبية', eventWarn: 'إنذار', eventTitle: 'عنوان الحدث'
  },
  fr: {
    title: 'Ressources Humaines', subtitle: 'Gestion des employés, carrières et paie.',
    addBtn: 'Nouvel Employé', totalEmp: 'Total Employés', activeEmp: 'Employés Actifs',
    payroll: 'Masse Salariale', profileTitle: 'Profil Employé 360°', newEmp: 'Nouvel Employé',
    tabInfo: 'Infos de Base', tabPaie: 'Paie & Fiches', tabCareer: 'Carrière & Congés', tabDocs: 'Documents (GED)',
    name: 'Nom Complet', position: 'Poste / Fonction', salary: 'Salaire de Base', cin: 'CIN', phone: 'Téléphone',
    primes: 'Primes / Avances', retenues: 'Retenues (CNSS/AMO)',
    save: 'Enregistrer', cancel: 'Annuler', date: 'Date d\'embauche', status: 'Statut', actions: 'Actions',
    loading: 'Chargement...', empty: 'Aucun employé enregistré.', currency: 'MAD',
    statusActive: 'Actif', statusLeave: 'En congé', statusTerminated: 'Résilié',
    payslip: 'Générer Fiche de Paie', printBtn: 'Imprimer', closeBtn: 'Fermer', month: 'Mois',
    confirmDelete: 'Voulez-vous vraiment supprimer cet employé ?', searchPlaceholder: 'Rechercher par nom, CIN, ou poste...',
    designation: 'Désignation', amount: 'Montant', netToPay: 'Net à Payer',
    employerSign: 'Signature de l\'Employeur', employeeSign: 'Signature de l\'Employé', docInternal: 'Document Interne - Paie',
    profileTooltip: 'Ouvrir le Profil', deleteTooltip: 'Supprimer',
    comingSoon: 'Cette fonctionnalité est en cours de développement !', module: 'Module HR',
    leavesTitle: 'Gestion des Congés', leaveBalance: 'Solde :', days: 'Jours',
    addLeave: 'Nouveau Congé', leaveType: 'Type de congé', leaveStart: 'Date de début', leaveEnd: 'Date de fin',
    timelineTitle: 'Parcours Professionnel', addEvent: 'Ajouter Événement',
    eventPromo: 'Promotion', eventTrain: 'Formation', eventWarn: 'Avertissement', eventTitle: 'Titre de l\'événement'
  },
  en: {
    title: 'Human Resources', subtitle: 'Manage employees, careers, and payroll.',
    addBtn: 'New Employee', totalEmp: 'Total Employees', activeEmp: 'Active Employees',
    payroll: 'Monthly Payroll', profileTitle: 'Employee 360° Profile', newEmp: 'New Employee',
    tabInfo: 'Basic Info', tabPaie: 'Payroll & Slips', tabCareer: 'Career & Leaves', tabDocs: 'Documents (GED)',
    name: 'Full Name', position: 'Position / Role', salary: 'Base Salary', cin: 'ID Number (CIN)', phone: 'Phone Number',
    primes: 'Bonuses / Advances', retenues: 'Deductions (Tax/Insurance)',
    save: 'Save Details', cancel: 'Cancel', date: 'Hire Date', status: 'Status', actions: 'Actions',
    loading: 'Loading...', empty: 'No employees registered yet.', currency: 'MAD',
    statusActive: 'Active', statusLeave: 'On Leave', statusTerminated: 'Terminated',
    payslip: 'Generate Payslip', printBtn: 'Print', closeBtn: 'Close', month: 'Month',
    confirmDelete: 'Are you sure you want to permanently delete this employee?', searchPlaceholder: 'Search by name, CIN, or position...',
    designation: 'Description', amount: 'Amount', netToPay: 'Net Pay',
    employerSign: 'Employer Signature', employeeSign: 'Employee Signature', docInternal: 'Internal Document - Payroll',
    profileTooltip: 'Open Profile', deleteTooltip: 'Delete',
    comingSoon: 'This feature is under development and will be available soon!', module: 'HR Module',
    leavesTitle: 'Leave Management', leaveBalance: 'Balance:', days: 'Days',
    addLeave: 'Add Leave', leaveType: 'Leave Type', leaveStart: 'Start Date', leaveEnd: 'End Date',
    timelineTitle: 'Career Timeline', addEvent: 'Add Event',
    eventPromo: 'Promotion', eventTrain: 'Training', eventWarn: 'Warning', eventTitle: 'Event Title'
  }
};

export default function SupplierHR() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];
  
  const isDarkTheme = supplier?.supplier_type === 'wholesale' || supplier?.role === 'grossiste' || supplier?.role === 'employé';

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 360° Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [editingId, setEditingId] = useState(null);
  const [showPayslip, setShowPayslip] = useState(false);

  // Fake states for Career Tab UI (will reset on close)
  const [leavesHistory, setLeavesHistory] = useState([
    { type: 'Congé Annuel', start: '2026-06-10', end: '2026-06-24', days: 14 }
  ]);
  const [careerEvents, setCareerEvents] = useState([
    { type: 'promotion', title: 'Promotion au poste de Manager', date: '2025-11-01' },
    { type: 'training', title: 'Formation Sécurité Routière', date: '2025-04-15' }
  ]);
  
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const [formData, setFormData] = useState({ full_name: '', position: '', salary: '', cin: '', phone: '', primes: '0', retenues: '0', status: 'Actif' });
  const [searchTerm, setSearchTerm] = useState('');
  // 🗂️ States for GED & Trainings (Simulated for Frontend)
  const [trainings, setTrainings] = useState(['Habilitation Électrique (B1V)', "Conduite d'engins (CACES R482)"]);
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [newTraining, setNewTraining] = useState('');
  
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Contrat_Travail_CDI.pdf', date: '12 Janvier 2026', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
    { id: 2, name: 'Copie_CIN.jpg', date: '12 Janvier 2026', icon: User, color: 'text-blue-600', bg: 'bg-blue-100' }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  // 🗂️ Handlers
  const handleAddTraining = () => {
    if (newTraining.trim()) {
      setTrainings([...trainings, newTraining.trim()]);
      setNewTraining('');
      setShowAddTraining(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    // محاكاة وقت الرفع للسيرفر
    setTimeout(() => {
      const isImage = file.type.includes('image');
      const newDoc = {
        id: Date.now(),
        name: file.name,
        date: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        icon: isImage ? User : FileText,
        color: isImage ? 'text-blue-600' : 'text-red-600',
        bg: isImage ? 'bg-blue-100' : 'bg-red-100'
      };
      setDocuments([newDoc, ...documents]);
      setIsUploading(false);
    }, 1500);
  };

  useEffect(() => {
    if (supplier?.id) fetchEmployees();
  }, [supplier]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;
      const { data, error } = await supabase.from('employees').select('*').eq('supplier_id', targetId).order('created_at', { ascending: false });
      if (!error) setEmployees(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;
    const empData = {
      full_name: formData.full_name, role: formData.position, base_salary: parseFloat(formData.salary),
      cin: formData.cin, phone: formData.phone, primes_avances: parseFloat(formData.primes || 0),
      retenues: parseFloat(formData.retenues || 0), status: formData.status, supplier_id: targetId 
    };

    if (editingId) await supabase.from('employees').update(empData).eq('id', editingId);
    else await supabase.from('employees').insert(empData);
    
    closeProfile();
    fetchEmployees();
  };

  const openProfile = (emp = null) => {
    if (emp) {
      setFormData({
        full_name: emp.full_name, position: emp.role, salary: emp.base_salary,
        cin: emp.cin || '', phone: emp.phone || '', primes: emp.primes_avances || '0', 
        retenues: emp.retenues || '0', status: emp.status || 'Actif'
      });
      setEditingId(emp.id);
    } else {
      setFormData({ full_name: '', position: '', salary: '', cin: '', phone: '', primes: '0', retenues: '0', status: 'Actif' });
      setEditingId(null);
    }
    setActiveTab('info');
    setShowProfileModal(true);
    
    // Reset fake data for demo
    setShowAddLeave(false);
    setShowAddEvent(false);
  };

  const closeProfile = () => {
    setShowProfileModal(false);
    setEditingId(null);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      await supabase.from('employees').delete().eq('id', id);
      fetchEmployees();
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'Actif' || emp.status === 'active').length;
  const totalPayroll = employees.filter(emp => emp.status === 'Actif' || emp.status === 'active').reduce((sum, emp) => sum + Number(emp.base_salary || 0), 0);

  const statusConfig = {
    active: { label: t.statusActive, color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
    Actif: { label: t.statusActive, color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
    on_leave: { label: t.statusLeave, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: Clock },
    terminated: { label: t.statusTerminated, color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle }
  };

  const currentMonth = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-MA', { month: 'long', year: 'numeric' });
  const defaultRoles = ["Directeur", "Manager", "Comptable", "Vendeur", "Chauffeur", "Magasinier", "Ouvrier", "Technicien", "Secrétaire"];
  const roleSuggestions = [...new Set([...defaultRoles, ...employees.map(emp => emp.role).filter(Boolean)])];

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    return (emp.full_name?.toLowerCase().includes(term) || emp.role?.toLowerCase().includes(term) || emp.cin?.toLowerCase().includes(term) || emp.phone?.includes(term));
  });

  const StatCard = ({ title, value, icon: Icon, bgGradient, valueSuffix = '' }) => (
    <div className={`relative overflow-hidden p-6 rounded-3xl shadow-xl text-white ${bgGradient} transition-transform hover:-translate-y-1 duration-300`}>
      <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none"><Icon size={120} /></div>
      <div className="relative z-10 flex items-center gap-4 mb-2">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/10"><Icon size={24} className="text-white" /></div>
        <p className="text-sm font-black uppercase tracking-wider text-white/90">{title}</p>
      </div>
      <div className="relative z-10 mt-4" dir="ltr">
        <h4 className="text-4xl font-black tracking-tight">{value} <span className="text-sm font-bold text-white/70 uppercase ml-1">{valueSuffix}</span></h4>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
           <Users className={isDarkTheme ? 'text-blue-500' : 'text-blue-600'} size={32} />
           {t.title}
          </h2>
          <p className={`mt-1 font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
           {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-pink-500/10 text-pink-500 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-pink-500/20 shadow-sm hidden sm:block">
            {t.module}
          </span>
          <button onClick={() => openProfile()} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-500 transition-all font-black shadow-lg shadow-blue-500/20">
            <UserPlus size={18} /> {t.addBtn}
          </button>
        </div>
      </div>

      {/* 📊 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.totalEmp} value={totalEmployees} icon={Users} bgGradient="bg-blue-600" />
        <StatCard title={t.activeEmp} value={activeEmployees} icon={UserCheck} bgGradient="bg-emerald-500" />
        <StatCard title={t.payroll} value={totalPayroll.toLocaleString()} valueSuffix={t.currency} icon={DollarSign} bgGradient="bg-pink-600" />
      </div>

      {/* 👥 Employees List */}
      <div className={`${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border rounded-3xl shadow-xl overflow-hidden flex flex-col`}>
        <div className={`p-5 md:p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4 ${isDarkTheme ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
          <h3 className={`font-black text-lg ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{t.activeEmp}</h3>
          <div className="relative w-full md:w-80">
            <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-4' : 'left-4'} ${isDarkTheme ? 'text-slate-500' : 'text-gray-400'}`} />
            <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className={`w-full py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} ${isDarkTheme ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`} 
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {isLoading ? <div className="p-12 text-center flex justify-center"><Loader2 size={40} className="animate-spin text-blue-500"/></div> : filteredEmployees.length === 0 ? <div className={`p-16 text-center font-bold ${isDarkTheme ? 'text-slate-500' : 'text-gray-400'}`}><Users size={48} className="mx-auto mb-4 opacity-20"/> {t.empty}</div> : (
            <table className="w-full text-start border-collapse">
              <thead className={`border-b ${isDarkTheme ? 'border-slate-700 bg-slate-900/80' : 'border-gray-100 bg-white'}`}>
                <tr>
                  <th className={`px-6 py-5 text-xs font-black uppercase tracking-wider text-start ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`}>{t.name}</th>
                  <th className={`px-6 py-5 text-xs font-black uppercase tracking-wider text-start ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`}>{t.position}</th>
                  <th className={`px-6 py-5 text-xs font-black uppercase tracking-wider text-start ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`}>{t.salary}</th>
                  <th className={`px-6 py-5 text-xs font-black uppercase tracking-wider text-start ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`}>{t.status}</th>
                  <th className={`px-6 py-5 text-xs font-black uppercase tracking-wider text-center ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`}>{t.actions}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkTheme ? 'divide-slate-700/50' : 'divide-gray-50'}`}>
                {filteredEmployees.map(emp => {
                  const empStatus = statusConfig[emp.status] ? emp.status : 'Actif';
                  const StatusIcon = statusConfig[empStatus].icon;
                  return (
                    <tr key={emp.id} className={`transition-colors group ${isDarkTheme ? 'hover:bg-slate-700/30' : 'hover:bg-blue-50/30'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg uppercase shrink-0 shadow-inner ${isDarkTheme ? 'bg-slate-900 border border-slate-700 text-slate-300' : 'bg-blue-100 text-blue-700'}`}>
                            {emp.full_name.slice(0, 2)}
                          </div>
                          <div>
                            <p className={`font-bold text-base ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{emp.full_name}</p>
                            <p className={`text-xs mt-0.5 font-medium ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>{emp.cin ? `CIN: ${emp.cin}` : ''} {emp.phone ? `| Tél: ${emp.phone}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-bold ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'}`}>{emp.role}</td>
                      <td className="px-6 py-4 font-black font-mono text-blue-500 text-base" dir="ltr">
                        {Number(emp.base_salary).toLocaleString()} <span className={`text-[10px] font-bold uppercase ${isDarkTheme ? 'text-slate-500' : 'text-gray-400'}`}>{t.currency}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border ${statusConfig[empStatus].color}`}>
                          <StatusIcon size={14} />{statusConfig[empStatus].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openProfile(emp)} className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-colors ${isDarkTheme ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white' : 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100'}`} title={t.profileTooltip}>
                          <User size={16} /> {t.profileTooltip}
                        </button>
                        <button onClick={() => handleDeleteClick(emp.id)} className={`p-2 rounded-xl transition-colors ${isDarkTheme ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'text-red-500 hover:bg-red-100'}`} title={t.deleteTooltip}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 🗂️ Employee 360° Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className={`border rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh] ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
            
            {/* Modal Header */}
            <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isDarkTheme ? 'border-slate-800 bg-slate-950/50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isDarkTheme ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><User size={24}/></div>
                <div>
                  <h3 className={`text-xl font-black ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{editingId ? formData.full_name : t.newEmp}</h3>
                  <p className={`text-sm font-bold ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>{editingId ? formData.position : t.profileTitle}</p>
                </div>
              </div>
              <button onClick={closeProfile} className={`transition-colors cursor-pointer ${isDarkTheme ? 'text-slate-500 hover:text-white' : 'text-gray-400 hover:text-gray-800'}`}><X size={28} /></button>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex overflow-x-auto custom-scrollbar border-b shrink-0 px-6 pt-4 gap-2 ${isDarkTheme ? 'border-slate-800 bg-slate-950/30' : 'border-gray-200 bg-white'}`}>
              {[
                { id: 'info', icon: User, label: t.tabInfo },
                { id: 'paie', icon: Wallet, label: t.tabPaie, disabled: !editingId },
                { id: 'career', icon: GraduationCap, label: t.tabCareer, disabled: !editingId },
                { id: 'docs', icon: FolderOpen, label: t.tabDocs, disabled: !editingId }
              ].map(tab => (
                <button 
                  key={tab.id} disabled={tab.disabled} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 font-black text-sm border-b-2 transition-all whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed
                    ${activeTab === tab.id 
                      ? (isDarkTheme ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl' : 'border-blue-600 text-blue-700 bg-blue-50 rounded-t-xl')
                      : (isDarkTheme ? 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-xl')
                    }`}
                >
                  <tab.icon size={18}/> {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
              
              {/* TAB 1: Infos de Base */}
              {activeTab === 'info' && (
                <form id="emp-form" onSubmit={handleSaveEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-gray-700'}`}>{t.name}</label>
                    <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-bold transition-all ${isDarkTheme ? 'bg-slate-950 border border-slate-800 text-white focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-gray-700'}`}>{t.cin}</label>
                    <input type="text" value={formData.cin} onChange={e => setFormData({...formData, cin: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-bold transition-all ${isDarkTheme ? 'bg-slate-950 border border-slate-800 text-white focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-gray-700'}`}>{t.phone}</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-bold transition-all ${isDarkTheme ? 'bg-slate-950 border border-slate-800 text-white focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-gray-700'}`}>{t.position}</label>
                    <input type="text" list="roles-list" required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-bold transition-all ${isDarkTheme ? 'bg-slate-950 border border-slate-800 text-white focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500'}`} autoComplete="off" />
                    <datalist id="roles-list">{roleSuggestions.map((role, i) => <option key={i} value={role} />)}</datalist>
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-gray-700'}`}>{t.salary} ({t.currency})</label>
                    <input type="number" required min="0" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-black text-lg transition-all ${isDarkTheme ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 focus:border-blue-500' : 'bg-blue-50 border border-blue-200 text-blue-700 focus:border-blue-500'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-gray-700'}`}>{t.status}</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-bold transition-all appearance-none ${isDarkTheme ? 'bg-slate-950 border border-slate-800 text-white focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500'}`}>
                      <option value="Actif">{t.statusActive}</option>
                      <option value="on_leave">{t.statusLeave}</option>
                      <option value="terminated">{t.statusTerminated}</option>
                    </select>
                  </div>
                </form>
              )}

              {/* TAB 2: Paie (Payroll & Payslip Generator) */}
              {activeTab === 'paie' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-2xl border ${isDarkTheme ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                      <label className={`block text-sm font-black mb-3 ${isDarkTheme ? 'text-emerald-400' : 'text-emerald-700'}`}>{t.primes}</label>
                      <input type="number" min="0" value={formData.primes} onChange={e => setFormData({...formData, primes: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-black text-lg transition-all ${isDarkTheme ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 focus:border-emerald-500' : 'bg-white border border-emerald-200 text-emerald-700 focus:border-emerald-500'}`} />
                      <p className={`text-xs mt-2 font-bold ${isDarkTheme ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>Inclut les primes de rendement, l'ancienneté, etc.</p>
                    </div>
                    <div className={`p-6 rounded-2xl border ${isDarkTheme ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                      <label className={`block text-sm font-black mb-3 ${isDarkTheme ? 'text-red-400' : 'text-red-700'}`}>{t.retenues}</label>
                      <input type="number" min="0" value={formData.retenues} onChange={e => setFormData({...formData, retenues: e.target.value})} className={`w-full px-4 py-3.5 rounded-xl outline-none font-black text-lg transition-all ${isDarkTheme ? 'bg-red-500/10 border border-red-500/30 text-red-400 focus:border-red-500' : 'bg-white border border-red-200 text-red-700 focus:border-red-500'}`} />
                      <p className={`text-xs mt-2 font-bold ${isDarkTheme ? 'text-red-500/70' : 'text-red-600/70'}`}>Cotisations CNSS, AMO, IR, Avances...</p>
                    </div>
                  </div>
                  
                  <div className={`flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border ${isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <p className={`text-sm font-black uppercase tracking-widest ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>{t.netToPay}</p>
                      <h4 className={`text-3xl font-black mt-1 font-mono ${isDarkTheme ? 'text-white' : 'text-gray-900'}`} dir="ltr">
                        {(Number(formData.salary) + Number(formData.primes || 0) - Number(formData.retenues || 0)).toLocaleString()} <span className="text-sm text-blue-500">{t.currency}</span>
                      </h4>
                    </div>
                    <button onClick={() => setShowPayslip(true)} className="mt-4 sm:mt-0 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-black flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                      <FileText size={18}/> {t.payslip} <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''}/>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Carrière & Congés */}
              {activeTab === 'career' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                  
                  {/* Left Column: Leaves */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className={`font-black text-lg flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                        <CalendarDays size={20} className="text-orange-500"/> {t.leavesTitle}
                      </h4>
                      <span className={`px-4 py-1.5 rounded-lg font-black text-sm border ${isDarkTheme ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                        {t.leaveBalance} 18 {t.days}
                      </span>
                    </div>

                    <div className={`border rounded-2xl p-4 space-y-4 ${isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      {leavesHistory.map((leave, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex justify-between items-center ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
                          <div>
                            <p className={`font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{leave.type}</p>
                            <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>{leave.start} ➔ {leave.end}</p>
                          </div>
                          <span className="font-black font-mono text-orange-500">{leave.days} J</span>
                        </div>
                      ))}
                      
                      {showAddLeave ? (
                        <div className={`p-4 rounded-xl border mt-4 ${isDarkTheme ? 'bg-slate-900 border-orange-500/30' : 'bg-white border-orange-200'}`}>
                          <div className="space-y-3">
                            <input type="text" placeholder={t.leaveType} className={`w-full px-3 py-2 rounded-lg text-sm outline-none border ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                            <div className="flex gap-2">
                              <input type="date" className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none border ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                              <input type="date" className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none border ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button onClick={() => setShowAddLeave(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg ${isDarkTheme ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-200 text-gray-800'}`}>{t.cancel}</button>
                              <button className="flex-[2] py-2 bg-orange-500 text-white text-sm font-black rounded-lg shadow-lg hover:bg-orange-600">{t.save}</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowAddLeave(true)} className="w-full py-3 mt-2 border-2 border-dashed border-orange-500/50 text-orange-500 hover:bg-orange-500/10 font-black rounded-xl transition-colors flex items-center justify-center gap-2">
                          <Plus size={18}/> {t.addLeave}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Career Timeline */}
                  <div className="space-y-6">
                    <h4 className={`font-black text-lg flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                      <Activity size={20} className="text-purple-500"/> {t.timelineTitle}
                    </h4>
                    
                    <div className={`border rounded-2xl p-6 ${isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="relative border-l-2 border-slate-700/50 pl-6 space-y-6 ml-3">
                        
                        {careerEvents.map((ev, idx) => {
                          const isPromo = ev.type === 'promotion';
                          const isTrain = ev.type === 'training';
                          const Icon = isPromo ? Award : isTrain ? BookOpen : AlertTriangle;
                          const color = isPromo ? 'text-emerald-500 bg-emerald-500/20' : isTrain ? 'text-blue-500 bg-blue-500/20' : 'text-red-500 bg-red-500/20';
                          
                          return (
                            <div key={idx} className="relative">
                              <div className={`absolute -left-[35px] w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center ${color}`}>
                                <Icon size={12} className="text-current" />
                              </div>
                              <div className={`p-4 rounded-xl border ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                                <p className={`font-bold text-sm ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>{ev.title}</p>
                                <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>{ev.date}</p>
                              </div>
                            </div>
                          );
                        })}

                        {showAddEvent ? (
                          <div className={`p-4 rounded-xl border mt-4 ${isDarkTheme ? 'bg-slate-900 border-purple-500/30' : 'bg-white border-purple-200'}`}>
                            <div className="space-y-3">
                              <select className={`w-full px-3 py-2 rounded-lg text-sm font-bold outline-none border ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                                <option value="promotion">{t.eventPromo}</option>
                                <option value="training">{t.eventTrain}</option>
                                <option value="warning">{t.eventWarn}</option>
                              </select>
                              <input type="text" placeholder={t.eventTitle} className={`w-full px-3 py-2 rounded-lg text-sm outline-none border ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                              <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowAddEvent(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg ${isDarkTheme ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-200 text-gray-800'}`}>{t.cancel}</button>
                                <button className="flex-[2] py-2 bg-purple-500 text-white text-sm font-black rounded-lg shadow-lg hover:bg-purple-600">{t.save}</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setShowAddEvent(true)} className="w-full py-3 border-2 border-dashed border-purple-500/50 text-purple-500 hover:bg-purple-500/10 font-black rounded-xl transition-colors flex items-center justify-center gap-2 mt-4">
                            <Plus size={18}/> {t.addEvent}
                          </button>
                        )}
                        
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: Documents (GED) & Infos Avancées */}
              {activeTab === 'docs' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                  
                  {/* العمود الأيمن/الأيسر: المعلومات السريعة والتكوين */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* بطاقة الأقدمية */}
                    <div className={`p-6 rounded-2xl border ${isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className={`text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Clock size={16} /> Historique & Ancienneté
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className={`text-xs font-bold mb-1 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>Date d'embauche</p>
                          <p className={`font-black ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            {editingId ? new Date(employees.find(e => e.id === editingId)?.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') : '---'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs font-bold mb-1 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>Ancienneté</p>
                          <p className="font-black text-blue-500">
                            {editingId ? (() => {
                              const hireDate = new Date(employees.find(e => e.id === editingId)?.created_at);
                              const diffTime = Math.abs(new Date() - hireDate);
                              const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
                              return diffYears > 0 ? `${diffYears} an(s)` : 'Moins d\'un an';
                            })() : '---'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* بطاقة الشهادات والدورات الخاصة بقطاع BTP */}
                    <div className={`p-6 rounded-2xl border ${isDarkTheme ? 'bg-blue-900/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                      <h4 className={`text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-700'}`}>
                        <BookOpen size={16} /> Formations BTP
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Habilitation Électrique (B1V)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Conduite d'engins (CACES R482)</span>
                        </li>
                      </ul>
                      <button className="mt-4 w-full py-2 text-xs font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                        + Ajouter une formation
                      </button>
                    </div>

                  </div>

                  {/* العمود الأعرض: إدارة الوثائق */}
                  <div className="lg:col-span-2">
                    <div className={`border rounded-2xl p-6 h-full ${isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className={`font-black text-lg flex items-center gap-2 mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                        <FolderOpen size={20} className="text-pink-500"/> Fichiers & Documents Légaux
                      </h4>
                      
                      {/* منطقة الرفع */}
                      <div className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors cursor-pointer ${isDarkTheme ? 'border-slate-700 hover:border-pink-500/50 hover:bg-pink-500/5' : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'}`}>
                        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${isDarkTheme ? 'bg-slate-900 text-slate-400' : 'bg-white text-gray-400 shadow-sm'}`}>
                          <Plus size={24} />
                        </div>
                        <p className={`font-bold ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Glissez et déposez vos fichiers ici</p>
                        <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>PDF, PNG, JPG (Max 5MB)</p>
                      </div>

                      {/* قائمة الوثائق الافتراضية */}
                      <div className="space-y-3">
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><FileText size={18} /></div>
                            <div>
                              <p className={`font-bold text-sm ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Contrat_Travail_CDI.pdf</p>
                              <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>Ajouté le 12 Janvier 2026</p>
                            </div>
                          </div>
                          <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>

                        <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={18} /></div>
                            <div>
                              <p className={`font-bold text-sm ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Copie_CIN.jpg</p>
                              <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>Ajouté le 12 Janvier 2026</p>
                            </div>
                          </div>
                          <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t shrink-0 flex gap-3 ${isDarkTheme ? 'border-slate-800 bg-slate-950/50' : 'border-gray-100 bg-gray-50'}`}>
              <button onClick={closeProfile} className={`flex-1 py-3.5 rounded-xl font-black transition-colors ${isDarkTheme ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                {t.cancel}
              </button>
              {(activeTab === 'info' || activeTab === 'paie') && (
                <button type="submit" form="emp-form" className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                  {t.save}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🧾 Payslip Overlay */}
      {showPayslip && editingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex justify-center items-center overflow-y-auto py-10 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white text-gray-800 w-[700px] shadow-2xl p-10 relative print-area rounded-2xl animate-slide-up">
            <div className="absolute top-4 right-4 flex gap-2 no-print" dir="ltr">
              <button onClick={() => setShowPayslip(false)} className="p-2.5 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-xl transition-colors font-bold"><X size={20} /></button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-colors shadow-lg"><Printer size={18} /> {t.printBtn}</button>
            </div>
            
            <div className="border-2 border-gray-800 p-8 mt-4 rounded-xl">
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-1 uppercase">{supplier?.store_name || 'ENTREPRISE'}</h1>
                  <p className="text-sm text-gray-500 font-mono">{t.docInternal}</p>
                </div>
                <div className="text-end">
                  <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">{t.payslip}</h2>
                  <p className="text-gray-600 mt-2 font-mono bg-gray-100 px-3 py-1 rounded-lg inline-block">{t.month}: <strong>{currentMonth}</strong></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.name}</p><p className="text-lg font-black text-gray-900">{formData.full_name}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.position}</p><p className="text-lg font-black text-gray-900">{formData.position}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.cin}</p><p className="text-base font-bold text-gray-800">{formData.cin || '---'}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.status}</p><p className="text-base font-bold text-gray-800">{formData.status}</p></div>
              </div>

              <table className="w-full text-start mb-8 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 font-bold text-gray-700 text-start">{t.designation}</th>
                    <th className="border border-gray-300 p-3 font-bold text-gray-700 text-center">{t.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3 font-bold text-gray-800">{t.salary}</td>
                    <td className="border border-gray-300 p-3 text-center font-mono font-bold" dir="ltr">{Number(formData.salary).toLocaleString()} {t.currency}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 text-gray-600 font-medium">{t.primes}</td>
                    <td className="border border-gray-300 p-3 text-center font-mono text-green-600 font-bold" dir="ltr">+{Number(formData.primes || 0).toLocaleString()} {t.currency}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 text-gray-600 font-medium">{t.retenues}</td>
                    <td className="border border-gray-300 p-3 text-center font-mono text-red-600 font-bold" dir="ltr">-{Number(formData.retenues || 0).toLocaleString()} {t.currency}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-80 bg-gray-50 border-2 border-gray-800 p-5 rounded-xl text-center shadow-inner">
                  <span className="block text-sm text-gray-500 uppercase tracking-widest mb-2 font-bold">{t.netToPay}</span>
                  <span className="text-3xl font-black text-gray-900 font-mono" dir="ltr">
                    {(Number(formData.salary) + Number(formData.primes || 0) - Number(formData.retenues || 0)).toLocaleString()} <span className="text-sm">{t.currency}</span>
                  </span>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t-2 border-dashed border-gray-200 flex justify-between text-sm font-bold text-gray-500">
                <p>{t.employerSign}</p><p>{t.employeeSign}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}