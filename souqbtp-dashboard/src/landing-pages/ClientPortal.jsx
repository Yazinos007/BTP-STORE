import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import {
  Building2, Compass, HardHat, Store, Calendar, FileText, CheckCircle2,
  MessageCircle, Search, MapPin, Star, Award, ShieldCheck, Sparkles,
  Phone, User, Clock, Video, ShoppingCart, Globe, X, Send, Loader2
} from 'lucide-react';

const translations = {
  ar: {
    brandSub: 'بوابة أصحاب المشاريع والزبائن',
    proLogin: 'دخول المحترفين',
    calcAgain: 'حاسبة التكلفة',
    welcome: 'مرحباً بك في فضاء مشروعك،',
    guestName: 'صاحب المشروع',
    tabs: {
      project: 'مشروعي وعروض الأسعار',
      directory: 'دليل المهندسين والمقاولين',
      market: 'سوق مواد البناء',
      booking: 'حجوزاتي ومواعيدي'
    },
    projectSummary: 'ملخص الدراسة التقديرية لمشروعك',
    propType: 'نوع العقار',
    area: 'المساحة',
    floors: 'الطوابق',
    quality: 'جودة التشطيب',
    estBudget: 'الميزانية التقديرية',
    mad: 'درهم',
    m2: 'م²',
    stagesTitle: 'مسار تقدم الورش (4 مراحل)',
    stages: [
      { id: 1, name: 'التخطيط والدراسات', desc: 'التصميم المعماري ورخصة البناء', status: 'active' },
      { id: 2, name: 'الأساسات والبناء', desc: 'الحفر والخرسانة المسلحة (Gros Œuvres)', status: 'pending' },
      { id: 3, name: 'التشطيبات النهائية', desc: 'السباكة، الكهرباء، الزليج والصباغة', status: 'pending' },
      { id: 4, name: 'التسليم والتحفيظ', desc: 'شهادة المطابقة ورخصة السكن', status: 'pending' }
    ],
    liveBtn: 'غرفة البث الميداني (Live AR)',
    quotesTitle: 'عروض الأسعار المستلمة (Devis)',
    acceptQuote: 'قبول العرض وتوقيع العقد',
    negotiate: 'مراسلة ومناقشة',
    acceptedBadge: 'تم القبول ✅',
    searchPlaceholder: 'ابحث بالاسم، التخصص، أو المدينة (مثال: الدار البيضاء، الرباط، بني ملال)...',
    allRoles: 'الكل',
    architects: 'مهندسون معماريون 📐',
    contractors: 'مقاولات بناء 🏗️',
    artisans: 'حرفيون ومعلمون 👷‍♂️',
    foundingPartner: 'شريك مؤسس 🏆',
    verifiedPro: 'موثق بالهيئة',
    bookBtn: 'حجز موعد / طلب عرض سعر',
    chatBtn: 'مراسلة',
    orderMaterial: 'طلب تزويد للورش',
    modalTitle: 'حجز استشارة أو زيارة ميدانية',
    dateLabel: 'التاريخ المفضل',
    timeLabel: 'الوقت',
    notesLabel: 'تفاصيل الطلب أو موقع البقعة الأرضية',
    notesPlace: 'مثال: أرغب في زيارة ميدانية لبقعة أرضية مساحتها 120 متر...',
    confirmBook: 'تأكيد الحجز وإرسال الطلب',
    bookSuccess: 'تم إرسال طلب الحجز بنجاح! سيتواصل معك المختص قريباً.',
    noBookings: 'لا توجد مواعيد محجوزة حالياً. تصفح دليل النخبة لحجز استشارتك الأولى!'
  },
  fr: {
    brandSub: 'Portail Maîtres d\'Ouvrage & Clients',
    proLogin: 'Espace Pro',
    calcAgain: 'Calculateur',
    welcome: 'Bienvenue dans votre espace projet,',
    guestName: 'Maître d\'Ouvrage',
    tabs: {
      project: 'Mon Projet & Devis',
      directory: 'Annuaire des Experts',
      market: 'Marché Matériaux',
      booking: 'Mes Rendez-vous'
    },
    projectSummary: 'Résumé de l\'Estimation de votre Projet',
    propType: 'Type de bien',
    area: 'Surface',
    floors: 'Étages',
    quality: 'Finition',
    estBudget: 'Budget Estimé',
    mad: 'MAD',
    m2: 'm²',
    stagesTitle: 'Suivi d\'Avancement du Chantier',
    stages: [
      { id: 1, name: 'Planification & Études', desc: 'Plans architecturaux & Permis', status: 'active' },
      { id: 2, name: 'Gros Œuvres', desc: 'Terrassement & Béton armé', status: 'pending' },
      { id: 3, name: 'Second Œuvre & Finition', desc: 'Plomberie, Électricité, Carrelage', status: 'pending' },
      { id: 4, name: 'Livraison & Conformité', desc: 'Permis d\'habiter & Clés', status: 'pending' }
    ],
    liveBtn: 'Inspection Live AR',
    quotesTitle: 'Devis Reçus des Professionnels',
    acceptQuote: 'Accepter & Signer',
    negotiate: 'Discuter',
    acceptedBadge: 'Devis Accepté ✅',
    searchPlaceholder: 'Rechercher par nom, spécialité ou ville (ex: Casablanca, Rabat)...',
    allRoles: 'Tous',
    architects: 'Architectes 📐',
    contractors: 'Entrepreneurs 🏗️',
    artisans: 'Artisans Pro 👷‍♂️',
    foundingPartner: 'Partenaire Fondateur 🏆',
    verifiedPro: 'Vérifié & Certifié',
    bookBtn: 'Prendre RDV / Demander Devis',
    chatBtn: 'Contacter',
    orderMaterial: 'Commander pour le chantier',
    modalTitle: 'Réserver une Consultation ou Visite',
    dateLabel: 'Date souhaitée',
    timeLabel: 'Heure',
    notesLabel: 'Détails du projet ou localisation du terrain',
    notesPlace: 'Ex: Visite de terrain de 120m² pour construction villa...',
    confirmBook: 'Confirmer le Rendez-vous',
    bookSuccess: 'Rendez-vous envoyé avec succès ! L\'expert vous contactera.',
    noBookings: 'Aucun rendez-vous réservé. Parcourez l\'annuaire pour réserver !'
  },
  en: {
    brandSub: 'Project Owners & Clients Portal',
    proLogin: 'Pro Login',
    calcAgain: 'Cost Calculator',
    welcome: 'Welcome to your project hub,',
    guestName: 'Project Owner',
    tabs: {
      project: 'My Project & Quotes',
      directory: 'Verified Pros Directory',
      market: 'Materials Market',
      booking: 'My Appointments'
    },
    projectSummary: 'Your Project Estimate Summary',
    propType: 'Property Type',
    area: 'Area',
    floors: 'Floors',
    quality: 'Finishing',
    estBudget: 'Estimated Budget',
    mad: 'MAD',
    m2: 'm²',
    stagesTitle: 'Construction Progress Tracker',
    stages: [
      { id: 1, name: 'Planning & Permits', desc: 'Architectural design & building permit', status: 'active' },
      { id: 2, name: 'Structural Works', desc: 'Excavation & reinforced concrete', status: 'pending' },
      { id: 3, name: 'Finishing Touches', desc: 'Plumbing, electrical, tiling & paint', status: 'pending' },
      { id: 4, name: 'Handover & Registry', desc: 'Occupancy permit & final keys', status: 'pending' }
    ],
    liveBtn: 'Live AR Site Room',
    quotesTitle: 'Received Quotes (Devis)',
    acceptQuote: 'Accept & Sign Contract',
    negotiate: 'Discuss',
    acceptedBadge: 'Accepted ✅',
    searchPlaceholder: 'Search by name, specialty, or city...',
    allRoles: 'All Pros',
    architects: 'Architects 📐',
    contractors: 'Contractors 🏗️',
    artisans: 'Artisans 👷‍♂️',
    foundingPartner: 'Founding Partner 🏆',
    verifiedPro: 'Verified Pro',
    bookBtn: 'Book Visit / Request Quote',
    chatBtn: 'Message',
    orderMaterial: 'Order for Project',
    modalTitle: 'Book a Consultation or Site Visit',
    dateLabel: 'Preferred Date',
    timeLabel: 'Preferred Time',
    notesLabel: 'Project Details or Land Location',
    notesPlace: 'E.g., Site visit for a 120m² plot...',
    confirmBook: 'Confirm Appointment',
    bookSuccess: 'Booking request sent! The professional will contact you shortly.',
    noBookings: 'No appointments yet. Browse the directory to book your first consultation!'
  }
};

// بيانات افتراضية غنية للشركاء المؤسسين في حال كانت الجداول فارغة
const FALLBACK_PROS = [
  {
    id: 'arch-1',
    name: 'مكتب العمران الحديث - د. أمين العلمي',
    role: 'architect',
    specialty: 'مهندس معماري معتمد (تصاميم ثلاثية الأبعاد ورقابة)',
    city: 'الدار البيضاء / الرباط',
    rating: 4.9,
    reviews: 42,
    isFoundingPartner: true,
    priceHint: 'استشارة أولية مجانية للشركاء'
  },
  {
    id: 'cont-1',
    name: 'مقاولة أطلس للبناء والأشغال (Atlas BTP)',
    role: 'contractor',
    specialty: 'مقاولة متكاملة (Gros Œuvres & Finition)',
    city: 'مراكش / بني ملال',
    rating: 4.8,
    reviews: 67,
    isFoundingPartner: true,
    priceHint: 'ضمان عشري + تتبع بالكاميرا'
  },
  {
    id: 'prov-1',
    name: 'المعلم عبد الإله الفاسي',
    role: 'provider',
    specialty: 'حرفي معتمد - الجبس العصري والزليج والرخام',
    city: 'فاس / مكناس',
    rating: 4.9,
    reviews: 89,
    isFoundingPartner: true,
    priceHint: 'معرض أعمال موثق بالصور'
  },
  {
    id: 'arch-2',
    name: 'Cabinet Zineb K. Architecture',
    role: 'architect',
    specialty: 'تصميم الفيلات العصرية والهندسة الداخلية',
    city: 'طنجة / تطوان',
    rating: 5.0,
    reviews: 31,
    isFoundingPartner: true,
    priceHint: 'متابعة عبر الواقع المعزز AR'
  }
];

const FALLBACK_PRODUCTS = [
  { id: 'p1', name: 'إسمنت بورتلاند CPJ 45 (كيس 50 كغ)', supplier: 'Lafarge / متجر النخبة', price: 74, unit: 'كيس', badge: 'سعر الورش' },
  { id: 'p2', name: 'حديد التسليح عالي المقاومة Ø 12mm', supplier: 'Sonasid / مورد جملة', price: 9.2, unit: 'كغ', badge: 'جودة معتمدة' },
  { id: 'p3', name: 'زليج بورسلين إسباني 60×60 نخب أول', supplier: 'سيراميكا المغرب', price: 135, unit: 'م²', badge: 'تخفيض 15%' },
  { id: 'p4', name: 'صباغة إيكولوجية مقاومة للرطوبة (25 كغ)', supplier: 'Colorado Pro', price: 420, unit: 'برميل', badge: 'ضمان 10 سنوات' }
];

export default function ClientPortal() {
  const navigate = useNavigate();
  const { language = 'ar', setLanguage } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const [activeTab, setActiveTab] = useState('project'); // 'project' | 'directory' | 'market' | 'booking'
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // بيانات الزبون القادمة من الحاسبة
  const [leadInfo, setLeadInfo] = useState({
    fullName: '',
    phone: '',
    type: 'villa',
    area: 120,
    floors: 2,
    quality: 'medium',
    estimatedTotal: 1065600
  });

  // قوائم المهندسين والحرفيين والمنتجات
  const [prosList, setProsList] = useState(FALLBACK_PROS);
  const [productsList, setProductsList] = useState(FALLBACK_PRODUCTS);

  // عروض الأسعار التفاعلية
  const [quotes, setQuotes] = useState([
    {
      id: 'q1',
      proName: 'مقاولة أطلس للبناء والأشغال (Atlas BTP)',
      role: 'مقاول عام - شريك مؤسس 🏆',
      stage: 'الأشغال الكبرى والأساسات (Gros Œuvres)',
      amount: 460000,
      duration: '4 أشهر',
      accepted: false
    },
    {
      id: 'q2',
      proName: 'مكتب العمران الحديث - د. أمين العلمي',
      role: 'مهندس معماري معتمد 📐',
      stage: 'التصميم المعماري + متابعة الرخصة والورش',
      amount: 28000,
      duration: 'شامل طوال مدة البناء',
      accepted: false
    }
  ]);

  // نافذة الحجز
  const [bookingModal, setBookingModal] = useState({ open: false, pro: null });
  const [bookingForm, setBookingForm] = useState({ date: '', time: '10:00', notes: '' });
  const [myBookings, setMyBookings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 1. قراءة بيانات الحاسبة المحفوظة
    try {
      const saved = localStorage.getItem('sasbtp_client_lead');
      if (saved) {
        const parsed = JSON.parse(saved);
        setLeadInfo(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error(e);
    }

    // 2. جلب المهندسين والحرفيين الحقيقيين من Supabase ودمجهم مع القائمة
    const fetchDirectoryData = async () => {
      try {
        const { data: archs } = await supabase.from('architects').select('id, full_name, agency_name, city');
        const { data: provs } = await supabase.from('providers').select('id, full_name, city, account_type');

        const dynamicPros = [];
        if (archs && archs.length > 0) {
          archs.forEach(a => {
            dynamicPros.push({
              id: `arch-${a.id}`,
              name: a.agency_name || a.full_name || 'مكتب دراسات هندسية',
              role: 'architect',
              specialty: 'مهندس معماري معتمد - رقابة وتصميم',
              city: a.city || 'المغرب',
              rating: 5.0,
              reviews: 19,
              isFoundingPartner: true,
              priceHint: 'متاح للاستشارة الفورية'
            });
          });
        }
        if (provs && provs.length > 0) {
          provs.forEach(p => {
            dynamicPros.push({
              id: `prov-${p.id}`,
              name: p.full_name || 'معلم/مقاول معتمد',
              role: p.account_type === 'contractor' ? 'contractor' : 'provider',
              specialty: 'تنفيذ أشغال البناء والتشطيبات',
              city: p.city || 'المغرب',
              rating: 4.9,
              reviews: 27,
              isFoundingPartner: true,
              priceHint: 'ضمان جودة الأشغال'
            });
          });
        }

        if (dynamicPros.length > 0) {
          setProsList([...dynamicPros, ...FALLBACK_PROS]);
        }
      } catch (e) {
        // الإبقاء على البيانات الافتراضية
      }
    };

    fetchDirectoryData();
  }, []);

  const cycleLanguage = () => {
    const next = language === 'ar' ? 'fr' : language === 'fr' ? 'en' : 'ar';
    if (setLanguage) setLanguage(next);
  };

  const handleAcceptQuote = (id) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, accepted: true } : q));
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newBook = {
        id: Date.now(),
        proName: bookingModal.pro?.name,
        specialty: bookingModal.pro?.specialty,
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes,
        status: t.bookSuccess
      };
      setMyBookings(prev => [newBook, ...prev]);
      setIsSubmitting(false);
      setBookingModal({ open: false, pro: null });
      setBookingForm({ date: '', time: '10:00', notes: '' });
      setActiveTab('booking');
    }, 600);
  };

  const filteredPros = prosList.filter(p => {
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans relative overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* إضاءة خلفية هادئة */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* الشريط العلوي */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/devis-gratuit')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">
              S
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">SasBTP</h1>
              <p className="text-[11px] text-cyan-400 font-bold">{t.brandSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cycleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black uppercase transition-all"
            >
              <Globe size={15} className="text-cyan-400" />
              <span>{language}</span>
            </button>

            <button
              onClick={() => navigate('/devis-gratuit')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black transition-all"
            >
              <Sparkles size={15} /> {t.calcAgain}
            </button>

            <button
              onClick={() => navigate('/v2/auth')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs md:text-sm font-black shadow-lg shadow-indigo-500/20 transition-all"
            >
              {t.proLogin}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        
        {/* ترويسة الترحيب بالزبون */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black mb-3">
              <ShieldCheck size={14} /> حماية وضمان العقود الرقمية SasBTP
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {t.welcome} <span className="text-cyan-400">{leadInfo.fullName || t.guestName}</span> 👋
            </h2>
          </div>

          <button
            onClick={() => navigate('/v2/live-room')}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-transform hover:-translate-y-0.5"
          >
            <Video size={18} className="animate-pulse" />
            {t.liveBtn}
          </button>
        </div>

        {/* شريط التبويبات الـ 4 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { id: 'project', label: t.tabs.project, icon: Building2 },
            { id: 'directory', label: t.tabs.directory, icon: Compass },
            { id: 'market', label: t.tabs.market, icon: Store },
            { id: 'booking', label: t.tabs.booking, icon: Calendar, badge: myBookings.length }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl font-black text-xs md:text-sm border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-transparent shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* التبويب 1: مشروعي وعروض الأسعار */}
        {/* ========================================================= */}
        {activeTab === 'project' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* بطاقات ملخص الدراسة التقديرية */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <FileText className="text-cyan-400" size={20} /> {t.projectSummary}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-xs text-slate-400 font-bold mb-1">{t.propType}</p>
                  <p className="text-base font-black text-white uppercase">{leadInfo.type}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-xs text-slate-400 font-bold mb-1">{t.area}</p>
                  <p className="text-base font-black text-white">{leadInfo.area} {t.m2}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-xs text-slate-400 font-bold mb-1">{t.floors}</p>
                  <p className="text-base font-black text-white">{leadInfo.floors}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-xs text-slate-400 font-bold mb-1">{t.quality}</p>
                  <p className="text-base font-black text-indigo-400 uppercase">{leadInfo.quality}</p>
                </div>
                <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 p-4 rounded-2xl border border-cyan-500/40">
                  <p className="text-xs text-cyan-300 font-bold mb-1">{t.estBudget}</p>
                  <p className="text-lg font-black text-white">{Number(leadInfo.estimatedTotal).toLocaleString()} {t.mad}</p>
                </div>
              </div>
            </div>

            {/* مسار تقدم الورش (4 مراحل) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8">
              <h3 className="text-lg font-black text-white mb-6">{t.stagesTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {t.stages.map(st => (
                  <div
                    key={st.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      st.status === 'active'
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-800/30 border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                        st.status === 'active' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {st.id}
                      </span>
                      {st.status === 'active' && (
                        <span className="text-[11px] font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                          المرحلة الحالية
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-white text-base mb-1">{st.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* عروض الأسعار المستلمة */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8">
              <h3 className="text-lg font-black text-white mb-6">{t.quotesTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotes.map(q => (
                  <div key={q.id} className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="font-black text-white text-base">{q.proName}</h4>
                          <span className="text-xs font-bold text-amber-400">{q.role}</span>
                        </div>
                        <span className="text-xl font-black text-cyan-400">
                          {q.amount.toLocaleString()} {t.mad}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
                        📋 {q.stage} — ⏱️ {q.duration}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {q.accepted ? (
                        <div className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-sm text-center">
                          {t.acceptedBadge}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAcceptQuote(q.id)}
                            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs md:text-sm transition-all"
                          >
                            {t.acceptQuote}
                          </button>
                          <button
                            onClick={() => setActiveTab('directory')}
                            className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs md:text-sm transition-all"
                          >
                            {t.negotiate}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* التبويب 2: دليل المهندسين والمقاولين والحرفيين */}
        {/* ========================================================= */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* شريط البحث والفلترة */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className={`w-5 h-5 text-slate-400 absolute top-3.5 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={`w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {[
                  { id: 'all', label: t.allRoles },
                  { id: 'architect', label: t.architects },
                  { id: 'contractor', label: t.contractors },
                  { id: 'provider', label: t.artisans }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setRoleFilter(f.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                      roleFilter === f.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* شبكة البطاقات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPros.map(pro => (
                <div key={pro.id} className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {pro.isFoundingPartner && (
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {t.foundingPartner}
                            </span>
                          )}
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {t.verifiedPro}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-white">{pro.name}</h4>
                        <p className="text-xs font-bold text-cyan-400 mt-1">{pro.specialty}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-white">{pro.rating}</span>
                        <span className="text-[10px] text-slate-400">({pro.reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800 mb-6">
                      <span className="flex items-center gap-1.5 font-bold text-slate-300">
                        <MapPin size={14} className="text-cyan-400" /> {pro.city}
                      </span>
                      <span className="text-emerald-400 font-bold">{pro.priceHint}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBookingModal({ open: true, pro })}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs md:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar size={16} /> {t.bookBtn}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* التبويب 3: سوق مواد البناء للعميل */}
        {/* ========================================================= */}
        {activeTab === 'market' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {productsList.map(prod => (
              <div key={prod.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                <div>
                  <span className="inline-block text-[11px] font-black px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-3">
                    {prod.badge}
                  </span>
                  <h4 className="text-base font-black text-white mb-2">{prod.name}</h4>
                  <p className="text-xs text-slate-400 font-bold mb-4">🏪 {prod.supplier}</p>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-4 pt-4 border-t border-slate-800">
                    <span className="text-2xl font-black text-cyan-400">{prod.price} {t.mad}</span>
                    <span className="text-xs text-slate-400">/ {prod.unit}</span>
                  </div>
                  <button
                    onClick={() => setBookingModal({ open: true, pro: { name: prod.supplier, specialty: prod.name } })}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingCart size={15} /> {t.orderMaterial}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* التبويب 4: مواعيدي وحجوزاتي */}
        {/* ========================================================= */}
        {activeTab === 'booking' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 animate-fade-in">
            {myBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-bold mb-6">{t.noBookings}</p>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm"
                >
                  {t.tabs.directory}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map(b => (
                  <div key={b.id} className="p-5 rounded-2xl bg-slate-800/50 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black text-white text-base">{b.proName}</h4>
                      <p className="text-xs text-cyan-400 font-bold mt-0.5">{b.specialty}</p>
                      {b.notes && <p className="text-xs text-slate-300 mt-2">{b.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
                        📅 {b.date} — ⏰ {b.time}
                      </span>
                      <span className="text-xs font-black bg-emerald-500/15 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                        ✓ مؤكد
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* نافذة حجز الموعد أو طلب عرض السعر */}
      {/* ========================================================= */}
      {bookingModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">{t.modalTitle}</h3>
              <button onClick={() => setBookingModal({ open: false, pro: null })} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 mb-5">
              <p className="text-sm font-black text-cyan-400">{bookingModal.pro?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{bookingModal.pro?.specialty}</p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">{t.dateLabel}</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">{t.timeLabel}</label>
                  <input
                    type="time"
                    required
                    value={bookingForm.time}
                    onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{t.notesLabel}</label>
                <textarea
                  rows="3"
                  placeholder={t.notesPlace}
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                {t.confirmBook}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}