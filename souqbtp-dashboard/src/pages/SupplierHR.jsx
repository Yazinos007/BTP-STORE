import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  Briefcase, UserPlus, DollarSign, Users, CheckCircle, XCircle, Clock, 
  FileText, Printer, X, Trash2, Search, UserCheck, User, Wallet, 
  GraduationCap, FolderOpen, AlertCircle, ChevronRight, Loader2,
  CalendarDays, Award, BookOpen, AlertTriangle, Plus, Activity, PhoneCall
} from 'lucide-react';

const translations = {
  ar: {
    title: 'الموارد البشرية', subtitle: 'إدارة الموظفين والمسار المهني والرواتب.',
    addBtn: 'تعيين موظف', totalEmp: 'إجمالي الموظفين', activeEmp: 'الموظفون النشطون',
    payroll: 'كتلة الأجور الشهرية', profileTitle: 'الملف الشامل للموظف', newEmp: 'موظف جديد',
    tabInfo: 'المعلومات الأساسية', tabPaie: 'الرواتب والقسائم', tabCareer: 'المسار والإجازات', tabDocs: 'محفظة الوثائق',
    name: 'الاسم الكامل', position: 'المنصب / المهمة', salary: 'الراتب الأساسي', cin: 'رقم البطاقة (CIN)', phone: 'رقم الهاتف',
    primes: 'المنح / التسبيقات', retenues: 'اقتطاعات (CNSS/AMO)',
    save: 'حفظ البيانات', cancel: 'إلغاء', status: 'الحالة', actions: 'إجراءات',
    loading: 'جاري التحميل...', empty: 'لا يوجد موظفون مسجلون حالياً.', currency: 'درهم',
    statusActive: 'نشط', statusLeave: 'في إجازة', statusTerminated: 'منهي العقد',
    payslip: 'توليد قسيمة الراتب', printBtn: 'طباعة القسيمة', closeBtn: 'إغلاق', month: 'الشهر',
    confirmDelete: 'هل أنت متأكد من حذف هذا الموظف نهائياً؟', searchPlaceholder: 'ابحث بالاسم، CIN، أو المنصب...',
    designation: 'البيان', amount: 'المبلغ', netToPay: 'صافي الأجر للاستلام',
    employerSign: 'توقيع المشغل', employeeSign: 'توقيع الموظف', docInternal: 'مستند داخلي - الأجور',
    profileTooltip: 'فتح ملف الموظف', deleteTooltip: 'حذف الموظف', module: 'إدارة الـ HR',
    leavesTitle: 'إدارة الإجازات', leaveBalance: 'الرصيد:', days: 'أيام',
    addLeave: 'إضافة إجازة', leaveType: 'نوع الإجازة', leaveStart: 'تاريخ البدء', leaveEnd: 'تاريخ الانتهاء',
    timelineTitle: 'المسار المهني (Timeline)', addEvent: 'إضافة حدث',
    eventPromo: 'ترقية', eventTrain: 'دورة تدريبية', eventWarn: 'إنذار', eventTitle: 'عنوان الحدث',
    contractType: 'نوع العقد', hireDate: 'تاريخ التعيين', cnss: 'رقم الضمان (CNSS)', 
    emergency: 'هاتف الطوارئ', familyStatus: 'الحالة العائلية', infoPro: 'بيانات مهنية', infoPerso: 'بيانات شخصية',
    single: 'أعزب / عزباء', married: 'متزوج(ة)', divorced: 'مطلق(ة)', widowed: 'أرمل(ة)'
  },
  fr: {
    title: 'Ressources Humaines', subtitle: 'Gestion des employés, carrières et paie.',
    addBtn: 'Nouvel Employé', totalEmp: 'Total Employés', activeEmp: 'Employés Actifs',
    payroll: 'Masse Salariale', profileTitle: 'Profil Employé 360°', newEmp: 'Nouvel Employé',
    tabInfo: 'Infos de Base', tabPaie: 'Paie & Fiches', tabCareer: 'Carrière & Congés', tabDocs: 'Documents (GED)',
    name: 'Nom Complet', position: 'Poste / Fonction', salary: 'Salaire de Base', cin: 'CIN', phone: 'Téléphone',
    primes: 'Primes / Avances', retenues: 'Retenues (CNSS/AMO)',
    save: 'Enregistrer', cancel: 'Annuler', status: 'Statut', actions: 'Actions',
    loading: 'Chargement...', empty: 'Aucun employé enregistré.', currency: 'MAD',
    statusActive: 'Actif', statusLeave: 'En congé', statusTerminated: 'Résilié',
    payslip: 'Générer Fiche de Paie', printBtn: 'Imprimer', closeBtn: 'Fermer', month: 'Mois',
    confirmDelete: 'Voulez-vous vraiment supprimer cet employé ?', searchPlaceholder: 'Rechercher par nom, CIN, ou poste...',
    designation: 'Désignation', amount: 'Montant', netToPay: 'Net à Payer',
    employerSign: 'Signature de l\'Employeur', employeeSign: 'Signature de l\'Employé', docInternal: 'Document Interne - Paie',
    profileTooltip: 'Ouvrir le Profil', deleteTooltip: 'Supprimer', module: 'Module HR',
    leavesTitle: 'Gestion des Congés', leaveBalance: 'Solde :', days: 'Jours',
    addLeave: 'Nouveau Congé', leaveType: 'Type de congé', leaveStart: 'Date de début', leaveEnd: 'Date de fin',
    timelineTitle: 'Parcours Professionnel', addEvent: 'Ajouter Événement',
    eventPromo: 'Promotion', eventTrain: 'Formation', eventWarn: 'Avertissement', eventTitle: 'Titre de l\'événement',
    contractType: 'Type de Contrat', hireDate: 'Date d\'embauche', cnss: 'N° CNSS', 
    emergency: 'Contact d\'Urgence', familyStatus: 'Situation Familiale', infoPro: 'Infos Pro.', infoPerso: 'Infos Perso.',
    single: 'Célibataire', married: 'Marié(e)', divorced: 'Divorcé(e)', widowed: 'Veuf/Veuve'
  },
  en: {
    title: 'Human Resources', subtitle: 'Manage employees, careers, and payroll.',
    addBtn: 'New Employee', totalEmp: 'Total Employees', activeEmp: 'Active Employees',
    payroll: 'Monthly Payroll', profileTitle: 'Employee 360° Profile', newEmp: 'New Employee',
    tabInfo: 'Basic Info', tabPaie: 'Payroll & Slips', tabCareer: 'Career & Leaves', tabDocs: 'Documents (GED)',
    name: 'Full Name', position: 'Position / Role', salary: 'Base Salary', cin: 'ID Number (CIN)', phone: 'Phone Number',
    primes: 'Bonuses / Advances', retenues: 'Deductions (Tax/Insurance)',
    save: 'Save Details', cancel: 'Cancel', status: 'Status', actions: 'Actions',
    loading: 'Loading...', empty: 'No employees registered yet.', currency: 'MAD',
    statusActive: 'Active', statusLeave: 'On Leave', statusTerminated: 'Terminated',
    payslip: 'Generate Payslip', printBtn: 'Print', closeBtn: 'Close', month: 'Month',
    confirmDelete: 'Are you sure you want to permanently delete this employee?', searchPlaceholder: 'Search by name, CIN, or position...',
    designation: 'Description', amount: 'Amount', netToPay: 'Net Pay',
    employerSign: 'Employer Signature', employeeSign: 'Employee Signature', docInternal: 'Internal Document - Payroll',
    profileTooltip: 'Open Profile', deleteTooltip: 'Delete', module: 'HR Module',
    leavesTitle: 'Leave Management', leaveBalance: 'Balance:', days: 'Days',
    addLeave: 'Add Leave', leaveType: 'Leave Type', leaveStart: 'Start Date', leaveEnd: 'End Date',
    timelineTitle: 'Career Timeline', addEvent: 'Add Event',
    eventPromo: 'Promotion', eventTrain: 'Training', eventWarn: 'Warning', eventTitle: 'Event Title',
    contractType: 'Contract Type', hireDate: 'Hire Date', cnss: 'CNSS Number', 
    emergency: 'Emergency Contact', familyStatus: 'Family Status', infoPro: 'Pro Info', infoPerso: 'Personal Info',
    single: 'Single', married: 'Married', divorced: 'Divorced', widowed: 'Widowed'
  }
};

export default function SupplierHR() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [editingId, setEditingId] = useState(null);
  const [showPayslip, setShowPayslip] = useState(false);

  // 🗂️ Simulated States for UI (Frontend Demo)
  const [trainings, setTrainings] = useState(['Habilitation Électrique (B1V)', "Conduite d'engins (CACES R482)"]);
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [newTraining, setNewTraining] = useState('');
  
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Contrat_Travail_CDI.pdf', date: '12 Janvier 2026', icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 2, name: 'Copie_CIN.jpg', date: '12 Janvier 2026', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const [leavesHistory, setLeavesHistory] = useState([
    { type: 'Congé Annuel', start: '2026-06-10', end: '2026-06-24', days: 14 }
  ]);
  const [careerEvents, setCareerEvents] = useState([
    { type: 'promotion', title: 'Promotion au poste de Manager', date: '2025-11-01' },
    { type: 'training', title: 'Formation Sécurité Routière', date: '2025-04-15' }
  ]);
  
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const [formData, setFormData] = useState({ 
    full_name: '', position: '', salary: '', cin: '', phone: '', primes: '0', retenues: '0', status: 'Actif',
    contractType: 'CDI', hireDate: '', cnss: '', emergency: '', familyStatus: 'Célibataire'
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { if (supplier?.id) fetchEmployees(); }, [supplier]);

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
        retenues: emp.retenues || '0', status: emp.status || 'Actif',
        contractType: 'CDI', hireDate: emp.created_at?.split('T')[0] || '', cnss: '123456789', emergency: '0600000000', familyStatus: 'Marié(e)'
      });
      setEditingId(emp.id);
    } else {
      setFormData({ 
        full_name: '', position: '', salary: '', cin: '', phone: '', primes: '0', retenues: '0', status: 'Actif',
        contractType: 'CDI', hireDate: new Date().toISOString().split('T')[0], cnss: '', emergency: '', familyStatus: 'Célibataire'
      });
      setEditingId(null);
    }
    setActiveTab('info');
    setShowProfileModal(true);
    setShowAddLeave(false);
    setShowAddEvent(false);
  };

  const closeProfile = () => { setShowProfileModal(false); setEditingId(null); };

  const handleDeleteClick = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      await supabase.from('employees').delete().eq('id', id);
      fetchEmployees();
    }
  };

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
    setTimeout(() => {
      const isImage = file.type.includes('image');
      const newDoc = {
        id: Date.now(), name: file.name,
        date: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        icon: isImage ? User : FileText, color: isImage ? 'text-blue-400' : 'text-red-400', bg: isImage ? 'bg-blue-500/10' : 'bg-red-500/10'
      };
      setDocuments([newDoc, ...documents]);
      setIsUploading(false);
    }, 1500);
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'Actif' || emp.status === 'active').length;
  const totalPayroll = employees.filter(emp => emp.status === 'Actif' || emp.status === 'active').reduce((sum, emp) => sum + Number(emp.base_salary || 0), 0);

  const statusConfig = {
    active: { label: t.statusActive, color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
    Actif: { label: t.statusActive, color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
    on_leave: { label: t.statusLeave, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: Clock },
    terminated: { label: t.statusTerminated, color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle }
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
    <div className="space-y-6 animate-fade-in text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-white">
           <Users className="text-blue-500" size={32} />
           {t.title}
          </h2>
          <p className="mt-1 font-medium text-slate-400">
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 md:p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-black text-lg text-white">{t.activeEmp}</h3>
          <div className="relative w-full md:w-80">
            <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-4' : 'left-4'} text-slate-500`} />
            <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className={`w-full py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-slate-900 border border-slate-700 text-white placeholder-slate-500`} 
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {isLoading ? <div className="p-12 text-center flex justify-center"><Loader2 size={40} className="animate-spin text-blue-500"/></div> : filteredEmployees.length === 0 ? <div className="p-16 text-center font-bold text-slate-500"><Users size={48} className="mx-auto mb-4 opacity-20"/> {t.empty}</div> : (
            <table className="w-full text-start border-collapse">
              <thead className="border-b border-slate-800 bg-slate-950/80">
                <tr>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-start text-slate-400">{t.name}</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-start text-slate-400">{t.position}</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-start text-slate-400">{t.salary}</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-start text-slate-400">{t.status}</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-center text-slate-400">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredEmployees.map(emp => {
                  const empStatus = statusConfig[emp.status] ? emp.status : 'Actif';
                  const StatusIcon = statusConfig[empStatus].icon;
                  return (
                    <tr key={emp.id} className="transition-colors group hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg uppercase shrink-0 shadow-inner bg-slate-800 border border-slate-700 text-slate-300">
                            {emp.full_name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-base text-white">{emp.full_name}</p>
                            <p className="text-xs mt-0.5 font-medium text-slate-500">{emp.cin ? `CIN: ${emp.cin}` : ''} {emp.phone ? `| Tél: ${emp.phone}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-300">{emp.role}</td>
                      <td className="px-6 py-4 font-black font-mono text-blue-400 text-base" dir="ltr">
                        {Number(emp.base_salary).toLocaleString()} <span className="text-[10px] font-bold uppercase text-slate-500">{t.currency}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border ${statusConfig[empStatus].color}`}>
                          <StatusIcon size={14} />{statusConfig[empStatus].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openProfile(emp)} className="px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-colors bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white" title={t.profileTooltip}>
                          <User size={16} /> {t.profileTooltip}
                        </button>
                        <button onClick={() => handleDeleteClick(emp.id)} className="p-2 rounded-xl transition-colors bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white" title={t.deleteTooltip}>
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
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="border rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[95vh] bg-slate-900 border-slate-700">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center shrink-0 border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400"><User size={24}/></div>
                <div>
                  <h3 className="text-xl font-black text-white">{editingId ? formData.full_name : t.newEmp}</h3>
                  <p className="text-sm font-bold text-slate-500">{editingId ? formData.position : t.profileTitle}</p>
                </div>
              </div>
              <button onClick={closeProfile} className="transition-colors cursor-pointer text-slate-500 hover:text-white"><X size={28} /></button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto custom-scrollbar border-b shrink-0 px-6 pt-4 gap-2 border-slate-800 bg-slate-950/30">
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
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-t-xl'
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
                <form id="emp-form" onSubmit={handleSaveEmployee} className="space-y-8">
                  
                  {/* Section: Informations Professionnelles */}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-400">
                      <Briefcase size={16} /> {t.infoPro}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.name}</label>
                        <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all bg-slate-950 border border-slate-800 text-white focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.position}</label>
                        <input type="text" list="roles-list" required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all bg-slate-950 border border-slate-800 text-white focus:border-blue-500" autoComplete="off" />
                        <datalist id="roles-list">{roleSuggestions.map((role, i) => <option key={i} value={role} />)}</datalist>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.contractType}</label>
                        <select value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all appearance-none bg-slate-950 border border-slate-800 text-white focus:border-blue-500">
                          <option value="CDI">CDI</option>
                          <option value="CDD">CDD</option>
                          <option value="ANAPEC">ANAPEC</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.hireDate}</label>
                        <input type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all bg-slate-950 border border-slate-800 text-white focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.salary} ({t.currency})</label>
                        <input type="number" required min="0" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none font-black text-lg transition-all bg-blue-500/10 border border-blue-500/30 text-blue-400 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-800"></div>

                  {/* Section: Informations Personnelles */}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-pink-400">
                      <User size={16} /> {t.infoPerso}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.cin}</label>
                        <input type="text" value={formData.cin} onChange={e => setFormData({...formData, cin: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all bg-slate-950 border border-slate-800 text-white focus:border-pink-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.cnss}</label>
                        <input type="text" value={formData.cnss} onChange={e => setFormData({...formData, cnss: e.target.value})} placeholder="Ex: 123456789" className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all bg-slate-950 border border-slate-800 text-white focus:border-pink-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.familyStatus}</label>
                        <select value={formData.familyStatus} onChange={e => setFormData({...formData, familyStatus: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all appearance-none bg-slate-950 border border-slate-800 text-white focus:border-pink-500">
                          <option value="Célibataire">{t.single}</option>
                          <option value="Marié(e)">{t.married}</option>
                          <option value="Divorcé(e)">{t.divorced}</option>
                          <option value="Veuf/Veuve">{t.widowed}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-400">{t.phone}</label>
                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all bg-slate-950 border border-slate-800 text-white focus:border-pink-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold mb-2 text-red-400 flex items-center gap-1">
                          <PhoneCall size={12}/> {t.emergency}
                        </label>
                        <input type="text" value={formData.emergency} onChange={e => setFormData({...formData, emergency: e.target.value})} placeholder="Contact..." className="w-full px-4 py-3 rounded-xl outline-none font-bold transition-all bg-red-500/5 border border-red-500/20 text-white focus:border-red-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold mb-2 text-slate-400">{t.status}</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full md:w-1/3 px-4 py-3 rounded-xl outline-none font-bold transition-all appearance-none bg-slate-900 border border-slate-700 text-white focus:border-blue-500">
                      <option value="Actif">{t.statusActive}</option>
                      <option value="on_leave">{t.statusLeave}</option>
                      <option value="terminated">{t.statusTerminated}</option>
                    </select>
                  </div>
                </form>
              )}

              {/* TAB 2: Paie (Payroll) */}
              {activeTab === 'paie' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border bg-emerald-500/5 border-emerald-500/20">
                      <label className="block text-sm font-black mb-3 text-emerald-400">{t.primes}</label>
                      <input type="number" min="0" value={formData.primes} onChange={e => setFormData({...formData, primes: e.target.value})} className="w-full px-4 py-3.5 rounded-xl outline-none font-black text-lg transition-all bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 focus:border-emerald-500" />
                      <p className="text-xs mt-2 font-bold text-emerald-500/70">Bonus, Primes, etc.</p>
                    </div>
                    <div className="p-6 rounded-2xl border bg-red-500/5 border-red-500/20">
                      <label className="block text-sm font-black mb-3 text-red-400">{t.retenues}</label>
                      <input type="number" min="0" value={formData.retenues} onChange={e => setFormData({...formData, retenues: e.target.value})} className="w-full px-4 py-3.5 rounded-xl outline-none font-black text-lg transition-all bg-red-500/10 border border-red-500/30 text-red-400 focus:border-red-500" />
                      <p className="text-xs mt-2 font-bold text-red-500/70">CNSS, AMO, IR, etc.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border bg-slate-950 border-slate-800">
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest text-slate-500">{t.netToPay}</p>
                      <h4 className="text-3xl font-black mt-1 font-mono text-white" dir="ltr">
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
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-lg flex items-center gap-2 text-white">
                        <CalendarDays size={20} className="text-orange-500"/> {t.leavesTitle}
                      </h4>
                      <span className="px-4 py-1.5 rounded-lg font-black text-sm border bg-orange-500/10 text-orange-400 border-orange-500/20">
                        {t.leaveBalance} 18 {t.days}
                      </span>
                    </div>

                    <div className="border rounded-2xl p-4 space-y-4 bg-slate-950 border-slate-800">
                      {leavesHistory.map((leave, idx) => (
                        <div key={idx} className="p-4 rounded-xl border flex justify-between items-center bg-slate-900 border-slate-700">
                          <div>
                            <p className="font-bold text-white">{leave.type}</p>
                            <p className="text-xs mt-1 text-slate-400">{leave.start} ➔ {leave.end}</p>
                          </div>
                          <span className="font-black font-mono text-orange-500">{leave.days} J</span>
                        </div>
                      ))}
                      
                      {showAddLeave ? (
                        <div className="p-4 rounded-xl border mt-4 bg-slate-900 border-orange-500/30">
                          <div className="space-y-3">
                            <input type="text" placeholder={t.leaveType} className="w-full px-3 py-2 rounded-lg text-sm outline-none border bg-slate-800 border-slate-700 text-white" />
                            <div className="flex gap-2">
                              <input type="date" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none border bg-slate-800 border-slate-700 text-white" />
                              <input type="date" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none border bg-slate-800 border-slate-700 text-white" />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button onClick={() => setShowAddLeave(false)} className="flex-1 py-2 text-sm font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-700">{t.cancel}</button>
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

                  <div className="space-y-6">
                    <h4 className="font-black text-lg flex items-center gap-2 text-white">
                      <Activity size={20} className="text-purple-500"/> {t.timelineTitle}
                    </h4>
                    
                    <div className="border rounded-2xl p-6 bg-slate-950 border-slate-800">
                      <div className="relative border-l-2 border-slate-700/50 pl-6 space-y-6 ml-3">
                        
                        {careerEvents.map((ev, idx) => {
                          const isPromo = ev.type === 'promotion';
                          const isTrain = ev.type === 'training';
                          const Icon = isPromo ? Award : isTrain ? BookOpen : AlertTriangle;
                          const color = isPromo ? 'text-emerald-400 bg-emerald-500/20' : isTrain ? 'text-blue-400 bg-blue-500/20' : 'text-red-400 bg-red-500/20';
                          
                          return (
                            <div key={idx} className="relative">
                              <div className={`absolute -left-[35px] w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center ${color}`}>
                                <Icon size={12} className="text-current" />
                              </div>
                              <div className="p-4 rounded-xl border bg-slate-900 border-slate-700">
                                <p className="font-bold text-sm text-white">{ev.title}</p>
                                <p className="text-xs mt-1 text-slate-400">{ev.date}</p>
                              </div>
                            </div>
                          );
                        })}

                        {showAddEvent ? (
                          <div className="p-4 rounded-xl border mt-4 bg-slate-900 border-purple-500/30">
                            <div className="space-y-3">
                              <select className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none border bg-slate-800 border-slate-700 text-white">
                                <option value="promotion">{t.eventPromo}</option>
                                <option value="training">{t.eventTrain}</option>
                                <option value="warning">{t.eventWarn}</option>
                              </select>
                              <input type="text" placeholder={t.eventTitle} className="w-full px-3 py-2 rounded-lg text-sm outline-none border bg-slate-800 border-slate-700 text-white" />
                              <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowAddEvent(false)} className="flex-1 py-2 text-sm font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-700">{t.cancel}</button>
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

              {/* TAB 4: Documents (GED) */}
              {activeTab === 'docs' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                  
                  {/* Left Column */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border bg-slate-950 border-slate-800">
                      <h4 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-400">
                        <Clock size={16} /> Historique & Ancienneté
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold mb-1 text-slate-500">Date d'embauche</p>
                          <p className="font-black text-white">
                            {formData.hireDate ? new Date(formData.hireDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') : '---'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold mb-1 text-slate-500">Ancienneté</p>
                          <p className="font-black text-blue-400">
                            {formData.hireDate ? (() => {
                              const hireDate = new Date(formData.hireDate);
                              const diffTime = Math.abs(new Date() - hireDate);
                              const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
                              return diffYears > 0 ? `${diffYears} an(s)` : 'Moins d\'un an';
                            })() : '---'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border bg-blue-900/10 border-blue-500/20">
                      <h4 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-blue-400">
                        <BookOpen size={16} /> Formations BTP
                      </h4>
                      <ul className="space-y-3">
                        {trainings.map((training, idx) => (
                          <li key={idx} className="flex items-start justify-between gap-2 group">
                            <div className="flex items-start gap-2">
                              <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                              <span className="text-sm font-medium text-slate-300">{training}</span>
                            </div>
                            <button onClick={() => setTrainings(trainings.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={14}/>
                            </button>
                          </li>
                        ))}
                      </ul>
                      
                      {showAddTraining ? (
                        <div className="mt-4 flex gap-2">
                          <input type="text" value={newTraining} onChange={(e) => setNewTraining(e.target.value)} placeholder="Nom de formation..." autoFocus className="flex-1 px-3 py-1.5 text-sm rounded-lg outline-none border bg-slate-900 border-slate-700 text-white" />
                          <button onClick={handleAddTraining} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">OK</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowAddTraining(true)} className="mt-4 w-full py-2 text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors">
                          + Ajouter une formation
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Document Area */}
                  <div className="lg:col-span-2">
                    <div className="border rounded-2xl p-6 h-full bg-slate-950 border-slate-800">
                      <h4 className="font-black text-lg flex items-center gap-2 mb-6 text-white">
                        <FolderOpen size={20} className="text-pink-500"/> Fichiers & Documents Légaux
                      </h4>
                      
                      <label className="block border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-all cursor-pointer relative overflow-hidden border-slate-700 hover:border-pink-500/50 hover:bg-pink-500/5">
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.png,.jpg,.jpeg" />
                        
                        {isUploading ? (
                          <div className="flex flex-col items-center justify-center">
                            <Loader2 size={32} className="text-pink-500 animate-spin mb-3" />
                            <p className="font-bold text-slate-300">Téléchargement en cours...</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-slate-900 text-slate-400">
                              <Plus size={24} />
                            </div>
                            <p className="font-bold text-slate-300">Cliquez ou Glissez vos fichiers ici</p>
                            <p className="text-xs mt-1 text-slate-500">PDF, PNG, JPG (Max 5MB)</p>
                          </>
                        )}
                      </label>

                      <div className="space-y-3">
                        {documents.length === 0 ? (
                          <p className="text-center text-sm py-4 text-slate-500">Aucun document n'a été ajouté.</p>
                        ) : (
                          documents.map(doc => {
                            const DocIcon = doc.icon;
                            return (
                              <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:border-pink-500/30 bg-slate-900 border-slate-700">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${doc.bg} ${doc.color}`}><DocIcon size={18} /></div>
                                  <div>
                                    <p className="font-bold text-sm text-white">{doc.name}</p>
                                    <p className="text-xs text-slate-500">Ajouté le {doc.date}</p>
                                  </div>
                                </div>
                                <button onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t shrink-0 flex gap-3 border-slate-800 bg-slate-950/50">
              <button onClick={closeProfile} className="flex-1 py-3.5 rounded-xl font-black transition-colors bg-slate-800 text-white hover:bg-slate-700">
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
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">{t.cnss}</p><p className="text-base font-bold text-gray-800">{formData.cnss || '---'}</p></div>
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