import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { 
  Truck, Search, MapPin, Calendar, Weight, ArrowRightLeft, 
  CheckCircle2, Plus, Filter, Zap, ShieldCheck, TrendingUp, 
  ArrowUpRight, X, Loader2, Navigation, Send, Award, Sparkles, 
  FileText, Leaf, QrCode, Unlock, PackagePlus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';

export default function FreightExchange() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';

  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  // 🚀 حالات التفاوض والـ GPS والاحتفال
  const [activeTrackingDeal, setActiveTrackingDeal] = useState(null);
  const [dealStage, setDealStage] = useState('negotiating'); // 'negotiating', 'on_route', 'arrived', 'delivered'
  const [proposedPrice, setProposedPrice] = useState(3200);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [truckProgress, setTruckProgress] = useState(20);
  const [showCelebration, setShowCelebration] = useState(false);

  // 🚀 ابتكارات المستقبل
  const [showTopUpAlert, setShowTopUpAlert] = useState(true);
  const [acceptedTopUp, setAcceptedTopUp] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // 🚀 حالات النوافذ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedTrip, setMatchedTrip] = useState(null);

  const canvasRef = useRef(null);

  const translations = {
    ar: {
      title: 'بورصة الشحن التعاونية', subtitle: 'السوق المباشر لرحلات العودة الفارغة. وفر حتى 40% من تكاليف النقل.',
      aiOptimizer: 'المُحسّن اللوجستي "العودة المشحونة"', aiOptDesc: 'قلل تكاليف شاحناتك الفارغة بدمج مسارات العودة.',
      addReturn: 'إضافة رحلة عودة فارغة', matchFound: 'تم العثور على تطابق 1', detectedReturn: 'رحلة عودة فارغة مرصودة',
      estSavings: 'الاقتصاد المالي المتوقع', partner: 'الشريك', date: 'التاريخ', available: 'متاح',
      confirmMatch: 'بدء التفاوض والمطابقة', from: 'مدينة الانطلاق...', to: 'مدينة الوصول...', allTrucks: 'جميع الشاحنات',
      requestMatch: 'طلب وتفاوض مباشر 💬', capacity: 'الحمولة المتاحة', saving: 'جاري المعالجة...',
      formTitle: 'تسجيل رحلة عودة فارغة', submitTrip: 'نشر الرحلة على الرادار', truck1: 'رموك (Remorque)', truck2: 'شاحنة 14 طن', truck3: 'شاحنة 19 طن',
      dealRoom: 'غرفة عمليات الشحنة والمطابقة المباشرة', eta: 'موعد الوصول المتوقع (ETA)', optimalRoute: 'المسار الموصى به',
      speed: 'السرعة الحالية', distance: 'المسافة المتبقية', status: 'الحالة', negotiationTitle: 'نافذة التفاوض والتسعير',
      acceptDeal: '🤝 قبول العرض وتأكيد الرحلة', driverName: 'السائق الشريك', onTheWay: 'الشاحنة في المسار نحو الورشة',
      confirmDelivery: 'المصافحة الرقمية (Proof of Delivery)', missionSuccessTitle: 'تمت المهمة بنجاح باهر! 🏆',
      missionSuccessDesc: 'وصلت الشحنة بأمان. تم فك الحجز المالي للناقل بنجاح.', carbonSaved: 'الكربون الذي تم تفاديه', fuelSaved: 'الوقود الموفر', downloadWaybill: 'تحميل بوليصة الشحن (PDF)',
      topUpAlertTitle: '💡 اقتراح ذكي: حمولة تكميلية (LTL)', topUpAlertDesc: 'متبقي 10 طن مساحة فارغة! هناك ورشة سيراميك في طريقك. هل تريد ضمها؟',
      acceptTopUp: 'ضم الحمولة (+1200 د.م)', topUpAdded: '✅ تم ضم الحمولة التكميلية!', otpTitle: 'أدخل كود الأمان (OTP)', otpDesc: 'اطلب الكود من السائق لتأكيد الاستلام وفك الحجز المالي.',
      verifyOtp: 'تحقق وفك الحجز 🔓', greenBadge: 'شارة الورشة الخضراء 🌿', capacityInput: 'السعة المتاحة (بالطن)',
      emptyGrid: 'لا توجد شاحنات مطابقة للبحث حالياً.', statusPending: 'بانتظار التأكيد 🟡', statusRoute: 'في المسار 🟢', statusArrived: 'وصلت 🏁',
      chatPlaceholder: 'اكتب رسالة أو اقترح سعراً...', closeRoom: 'إغلاق غرفة العمليات', msgSystemRoute: '✅ تم توقيع بوليصة الشحن الرقمية وتأكيد حجز الشاحنة! انطلقت الرحلة الآن وهي تحت المراقبة بالـ GPS.',
      msgDriver: (f, t) => `مرحباً بك! أنا متواجد في ${f} ومستعد للتحميل في طريقي نحو ${t}. سأقوم بتخفيض التسعيرة لأن الشاحنة فارغة.`,
      msgAi: (price) => `⚡ اقترح الذكاء الاصطناعي سعراً عادلاً: ${price} MAD (توفير 40%).`
    },
    fr: {
      title: 'Bourse de Fret Collaborative', subtitle: 'Marché en direct des retours à vide. Économisez jusqu\'à 40%.',
      aiOptimizer: 'Optimiseur Logistique', aiOptDesc: 'Réduisez les frais de vos camions vides en fusionnant les trajets.', 
      addReturn: 'Ajouter un retour', matchFound: '1 Matching Trouvé', detectedReturn: 'RETOUR À VIDE DÉTECTÉ', 
      estSavings: 'ÉCONOMIE ESTIMÉE', partner: 'Partenaire', date: 'Date', available: 'Disponible', 
      confirmMatch: 'Négocier et Matcher', from: 'Ville de départ...', to: 'Ville d\'arrivée...', allTrucks: 'Tous les camions', 
      requestMatch: 'Demander & Négocier 💬', capacity: 'Capacité dispo.', saving: 'Traitement...', 
      formTitle: 'Enregistrer un trajet', submitTrip: 'Publier', truck1: 'Semi-remorque', truck2: 'Camion 14T', truck3: 'Camion 19T',
      dealRoom: 'Salle d\'Opérations & Suivi GPS', eta: 'Heure d\'Arrivée (ETA)', optimalRoute: 'Itinéraire Optimal',
      speed: 'Vitesse Actuelle', distance: 'Distance Restante', status: 'Statut', negotiationTitle: 'Négociation Rapide',
      acceptDeal: '🤝 Accepter et Confirmer', driverName: 'Chauffeur Partenaire', onTheWay: 'Camion en route',
      confirmDelivery: 'Poignée de main numérique (POD)', missionSuccessTitle: 'Mission Accomplie ! 🏆',
      missionSuccessDesc: 'Cargaison livrée. Paiement débloqué avec succès.', carbonSaved: 'CO₂ Évité', fuelSaved: 'Carburant Économisé', downloadWaybill: 'Télécharger la Lettre de Voiture',
      topUpAlertTitle: '💡 Suggestion IA : Chargement Partiel (LTL)', topUpAlertDesc: 'Reste 10T d\'espace ! Ajouter un lot de céramique sur la route ?',
      acceptTopUp: 'Ajouter (+1200 MAD)', topUpAdded: '✅ Lot ajouté avec succès !', otpTitle: 'Code de Sécurité (OTP)', otpDesc: 'Demandez le code au chauffeur pour valider la livraison.',
      verifyOtp: 'Vérifier et Débloquer 🔓', greenBadge: 'Badge Chantier Vert 🌿', capacityInput: 'Capacité disponible (Tonnes)',
      emptyGrid: 'Aucun camion ne correspond à votre recherche.', statusPending: 'En attente 🟡', statusRoute: 'En route 🟢', statusArrived: 'Arrivé 🏁',
      chatPlaceholder: 'Écrivez un message ou proposez un prix...', closeRoom: 'Fermer la salle', msgSystemRoute: '✅ Lettre de voiture signée et camion confirmé ! Le trajet a commencé sous surveillance GPS.',
      msgDriver: (f, t) => `Bonjour ! Je suis à ${f} et prêt à charger vers ${t}.`, msgAi: (price) => `⚡ L'IA suggère : ${price} MAD.`
    },
    en: {
      title: 'Freight Exchange', subtitle: 'Live market for empty returns. Save up to 40%.',
      aiOptimizer: 'Logistics Optimizer', aiOptDesc: 'Reduce empty truck costs by merging routes.', 
      addReturn: 'Add Empty Return', matchFound: '1 Match Found', detectedReturn: 'EMPTY RETURN DETECTED', 
      estSavings: 'ESTIMATED SAVINGS', partner: 'Partner', date: 'Date', available: 'Available', 
      confirmMatch: 'Negotiate & Match', from: 'Departure...', to: 'Arrival...', allTrucks: 'All Trucks', 
      requestMatch: 'Request & Negotiate 💬', capacity: 'Capacity', saving: 'Processing...', 
      formTitle: 'Register Trip', submitTrip: 'Publish', truck1: 'Semi-trailer', truck2: '14T Truck', truck3: '19T Truck',
      dealRoom: 'Live GPS Operations Room', eta: 'ETA', optimalRoute: 'Optimal Route',
      speed: 'Current Speed', distance: 'Remaining Distance', status: 'Status', negotiationTitle: 'Price Negotiation',
      acceptDeal: '🤝 Accept Deal', driverName: 'Partner Driver', onTheWay: 'Truck en route',
      confirmDelivery: 'Digital Handshake (POD)', missionSuccessTitle: 'Mission Accomplished! 🏆',
      missionSuccessDesc: 'Cargo delivered securely. Financial hold released.', carbonSaved: 'CO₂ Avoided', fuelSaved: 'Fuel Saved', downloadWaybill: 'Download Waybill (PDF)',
      topUpAlertTitle: '💡 AI Suggestion: Smart Top-Up (LTL)', topUpAlertDesc: '10T space left! Add ceramic tiles on the route?',
      acceptTopUp: 'Add Load (+1200 MAD)', topUpAdded: '✅ Top-up load added!', otpTitle: 'Security Code (OTP)', otpDesc: 'Ask the driver for the code to confirm delivery.',
      verifyOtp: 'Verify & Release Funds 🔓', greenBadge: 'Green Site Badge 🌿', capacityInput: 'Available Capacity (Tons)',
      emptyGrid: 'No trucks match your search criteria.', statusPending: 'Pending 🟡', statusRoute: 'On route 🟢', statusArrived: 'Arrived 🏁',
      chatPlaceholder: 'Type a message...', closeRoom: 'Close Room', msgSystemRoute: '✅ Waybill signed! Trip has started under GPS tracking.',
      msgDriver: (f, t) => `Hello! I am in ${f} heading to ${t}.`, msgAi: (price) => `⚡ AI fair price: ${price} MAD.`
    }
  };

  const t = translations[language] || translations.ar;

  const [formData, setFormData] = useState({ departureCity: '', arrivalCity: '', tripDate: '', truckType: t.truck1, capacity: '' });

  // 🚀 جلب البيانات الحقيقية من Supabase
  useEffect(() => { 
    async function fetchMatchedTrip() {
      try {
        const { data, error } = await supabase.from('logistics_trips').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (data) setMatchedTrip(data);
        else setMatchedTrip({ departure_city: 'Tanger', arrival_city: 'Casablanca', trip_date: '2026-08-29', available_capacity: 30, truck_type: 'Semi-remorque', supplier_name: 'مورد SouqBTP' });
      } catch (err) {
        setMatchedTrip({ departure_city: 'Tanger', arrival_city: 'Casablanca', trip_date: '2026-08-29', available_capacity: 30, truck_type: 'Semi-remorque', supplier_name: 'مورد SouqBTP' });
      }
    }
    fetchMatchedTrip();
  }, []);

  // 🚀 إرسال رحلة حقيقية للقاعدة
  async function submitEmptyTrip(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supabase.from('logistics_trips').insert([{
        supplier_name: 'المقاول', departure_city: formData.departureCity, arrival_city: formData.arrivalCity,
        trip_date: formData.tripDate, truck_type: formData.truckType, available_capacity: parseFloat(formData.capacity), status: 'pending'
      }]);
    } catch(e) { console.error(e); }
    setTimeout(() => {
      setIsSubmitting(false); 
      setIsModalOpen(false); 
      alert("✅ " + t.submitTrip);
      setFormData({ departureCity: '', arrivalCity: '', tripDate: '', truckType: t.truck1, capacity: '' });
    }, 1000);
  }

  // 🚀 محاكاة الـ GPS
  useEffect(() => {
    let interval;
    if (dealStage === 'on_route') {
      interval = setInterval(() => {
        setTruckProgress(prev => {
          if (prev >= 98) { 
            clearInterval(interval); 
            setDealStage('arrived'); 
            return 100; 
          }
          return prev + 15;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [dealStage]);

  // 🎵 الصوت والألعاب النارية
  const launchFireworks = () => {
    setShowCelebration(true);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator(); 
        const gain = audioCtx.createGain();
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 0.6);
        osc.connect(gain); 
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.12); 
        osc.stop(audioCtx.currentTime + idx * 0.12 + 0.6);
      });
    } catch (e) { console.warn("Audio Context not supported."); }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
    let particles = [];
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ffffff'];
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: canvas.width / 2, y: canvas.height / 2 + 100,
        vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.7) * 25,
        size: Math.random() * 4 + 2, color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1, decay: Math.random() * 0.015 + 0.005
      });
    }
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, idx) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.alpha -= p.decay;
        ctx.save(); ctx.globalAlpha = Math.max(p.alpha, 0); ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        if (p.alpha <= 0) particles.splice(idx, 1);
      });
      if (particles.length > 0) requestAnimationFrame(render);
    };
    render();
  };

  const freightOffers = [
    { id: 1, type: 'SEMI-REMORQUE', savings: 4500, from: 'Tanger', to: 'Casablanca', date: '29/08/2026', capacity: '30 T', partner: 'سائق معتمد: عبد الرحيم' },
    { id: 2, type: 'CAMION 19T', savings: 2700, from: 'Casablanca', to: 'Beni Mellal', date: '28/08/2026', capacity: '18 T', partner: 'سائق معتمد: مراد' },
    { id: 3, type: 'SEMI-REMORQUE', savings: 3750, from: 'Marrakech', to: 'Agadir', date: '28/08/2026', capacity: '25 T', partner: 'مؤسسة الشحن السريع' },
    { id: 4, type: 'FOURGON', savings: 1200, from: 'Rabat', to: 'Tanger', date: '30/08/2026', capacity: '3.5 T', partner: 'BTP Express' },
    { id: 5, type: 'CAMION 19T', savings: 3100, from: 'Agadir', to: 'Laayoune', date: '01/09/2026', capacity: '15 T', partner: 'Sud Logistique' },
    { id: 6, type: 'SEMI-REMORQUE', savings: 5200, from: 'Oujda', to: 'Fès', date: '02/09/2026', capacity: '28 T', partner: 'سائق معتمد: هشام' },
  ];

  const filteredOffers = freightOffers.filter(offer => 
    offer.from.toLowerCase().includes(searchFrom.toLowerCase()) && 
    offer.to.toLowerCase().includes(searchTo.toLowerCase())
  );

  const handleOpenDealRoom = (deal) => {
    setActiveTrackingDeal(deal); 
    setDealStage('negotiating'); 
    setTruckProgress(10); 
    setShowCelebration(false);
    setShowOtpInput(false); 
    setOtpCode(''); 
    setAcceptedTopUp(false); 
    setShowTopUpAlert(true);
    setProposedPrice(deal.savings + 500);
    setChatMessages([
      { id: 1, sender: 'driver', text: t.msgDriver(deal.from, deal.to) },
      { id: 2, sender: 'system', text: t.msgAi(deal.savings + 500) }
    ]);
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: inputMsg }]);
    setInputMsg('');
  };

  const handleConfirmDeal = () => {
    setDealStage('on_route'); 
    setShowTopUpAlert(false);
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: t.msgSystemRoute }]);
  };

  const handleVerifyOTP = () => {
    if (otpCode.length === 4) { 
      setDealStage('delivered'); 
      setShowOtpInput(false); 
      launchFireworks(); 
    } 
    else {
      alert(isRtl ? "الرجاء إدخال كود من 4 أرقام." : "Please enter a 4-digit code.");
    }
  };

  // 🎨 تنسيقات الواجهة الرئيسية المتوافقة مع الوضع الفاتح/الداكن
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgInput = isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400';
  const modalBackdrop = isDarkMode ? 'bg-[#020617]/95' : 'bg-slate-100/90';
  const modalContainer = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-2xl';
  const modalHeader = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const modalBox = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const modalInnerBox = isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className={`space-y-8 animate-fade-in max-w-7xl mx-auto pb-24`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${bgMain} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
              <Truck className="text-emerald-500" size={36} /> {t.title}
            </h2>
            <span className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> GPS Live Tracking
            </span>
          </div>
          <p className={`${textMuted} font-bold`}>{t.subtitle}</p>
        </div>
      </div>

      {/* 🤖 AI Logistics Optimizer Banner */}
      <div className={`border-2 ${isDarkMode ? 'bg-[#0b1121] border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} rounded-[2rem] p-6 md:p-8 shadow-[0_10px_40px_rgba(16,185,129,0.15)] relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Truck size={28} />
            </div>
            <div>
              <h3 className={`text-xl font-black ${textMain}`}>{t.aiOptimizer}</h3>
              <p className={`text-xs ${textMuted} font-bold mt-1`}>{t.aiOptDesc}</p>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className={`flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-800 shadow-sm'} px-5 py-3 rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-300'} font-bold transition-all`}>
            <Plus size={18}/> {t.addReturn}
          </button>
        </div>

        {/* عرض فرصة تطابق */}
        {matchedTrip && (
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 relative`}>
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-2`}>{t.detectedReturn}</p>
                <div className={`text-xl font-black ${textMain} flex items-center gap-3`}>
                  {matchedTrip.departure_city} <ArrowRightLeft className="text-emerald-500" size={20}/> {matchedTrip.arrival_city}
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-start md:text-end">
                <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-1`}>{t.estSavings}</p>
                <p className="text-2xl font-black text-emerald-500 font-mono" dir="ltr">3,500 MAD</p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenDealRoom({ id: 99, type: 'SEMI-REMORQUE', savings: 3500, from: matchedTrip.departure_city, to: matchedTrip.arrival_city, date: matchedTrip.trip_date, capacity: `${matchedTrip.available_capacity} T`, partner: matchedTrip.supplier_name })}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              {t.confirmMatch} <ArrowUpRight size={18} className={isRtl ? 'rotate-90' : ''}/>
            </button>
          </div>
        )}
      </div>

      {/* 🚀 Search and Filters */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${bgMain} p-4 rounded-2xl border-2 shadow-sm`}>
        <div className="relative">
          <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={20}/>
          <input type="text" placeholder={t.from} value={searchFrom} onChange={e => setSearchFrom(e.target.value)} className={`w-full ${bgInput} py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl outline-none font-bold transition-all`} />
        </div>
        <div className="relative">
          <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={20}/>
          <input type="text" placeholder={t.to} value={searchTo} onChange={e => setSearchTo(e.target.value)} className={`w-full ${bgInput} py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl outline-none font-bold transition-all`} />
        </div>
        <div className="relative">
          <Filter className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} size={20}/>
          <select className={`w-full ${bgInput} py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl outline-none font-bold appearance-none cursor-pointer`}>
            <option>{t.allTrucks}</option><option>SEMI-REMORQUE</option><option>CAMION 19T</option><option>FOURGON</option>
          </select>
        </div>
      </div>

      {/* 🚀 Live Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.length > 0 ? filteredOffers.map(offer => (
          <div key={offer.id} className={`${bgMain} border-2 p-6 rounded-[2rem] hover:border-emerald-500/50 transition-all duration-300 group shadow-lg flex flex-col`}>
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest`}>
                {offer.type}
              </span>
              <div className="text-end">
                <p className={`text-[9px] ${textMuted} font-black uppercase tracking-widest mb-0.5`}>{t.estSavings}</p>
                <p className="text-emerald-500 font-black font-mono text-sm flex items-center justify-end gap-1" dir="ltr">
                  <TrendingUp size={14}/> {offer.savings} MAD
                </p>
              </div>
            </div>

            <div className={`flex items-center justify-between ${modalBox} border rounded-2xl p-4 mb-6`}>
              <div className="text-center w-2/5"><p className={`font-black ${textMain} truncate`}>{offer.from}</p></div>
              <div className="flex-1 flex justify-center text-slate-600 px-2"><ArrowRightLeft size={16} /></div>
              <div className="text-center w-2/5"><p className={`font-black ${textMain} truncate`}>{offer.to}</p></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><p className={`text-[10px] ${textMuted} font-black mb-1 flex items-center gap-1`}><Calendar size={12}/> {t.date}</p><p className={`text-sm font-bold ${textMain}`}>{offer.date}</p></div>
              <div><p className={`text-[10px] ${textMuted} font-black mb-1 flex items-center gap-1`}><Weight size={12}/> {t.capacity}</p><p className={`text-sm font-bold ${textMain}`}>{offer.capacity}</p></div>
            </div>

            <div className={`mt-auto pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex flex-col gap-4`}>
              <div className="flex justify-between items-center text-xs">
                <span className={textMuted}>{t.partner}:</span>
                <span className={`font-bold ${textMain} flex items-center gap-1`}><ShieldCheck size={14} className="text-blue-500"/> {offer.partner}</span>
              </div>
              <button onClick={() => handleOpenDealRoom(offer)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2">
                {t.requestMatch}
              </button>
            </div>
          </div>
        )) : (
          <div className={`col-span-full text-center py-16 ${textMuted} font-bold text-lg`}>{t.emptyGrid}</div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🚀 غرفة العمليات والتفاوض اللوجستي الذكي مع تتبع الـ GPS والألعاب النارية 🚀 */}
      {/* ========================================================================= */}
      {activeTrackingDeal && createPortal(
        <div className={`fixed inset-0 z-[2147483647] ${modalBackdrop} backdrop-blur-md flex justify-center items-center p-3 md:p-6 animate-fade-in font-cairo`} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={`${modalContainer} border w-full max-w-6xl max-h-[95vh] rounded-3xl flex flex-col overflow-hidden relative`}>
            
            {/* Header */}
            <div className={`p-5 border-b flex justify-between items-center ${modalHeader}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-500 rounded-xl"><Navigation size={22} className="animate-pulse"/></div>
                <div>
                  <h3 className={`text-lg md:text-xl font-black ${textMain}`}>{t.dealRoom}</h3>
                  <p className={`text-xs ${textMuted} font-bold`}>{activeTrackingDeal.from} ➔ {activeTrackingDeal.to} ({activeTrackingDeal.capacity})</p>
                </div>
              </div>
              <button onClick={() => setActiveTrackingDeal(null)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white' : 'bg-slate-200 hover:bg-red-500 text-slate-600 hover:text-white'}`}><X size={20} /></button>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-6 ${isDarkMode ? '' : 'bg-slate-100/50'}`}>
              
              {/* قسم الـ GPS والخريطة ومسار الشاحنة */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* الحمولة التكميلية (Smart Top-Up) */}
                {showTopUpAlert && dealStage === 'negotiating' && (
                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-down">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl"><PackagePlus size={24}/></div>
                      <div><h4 className="text-amber-500 font-black text-sm">{t.topUpAlertTitle}</h4><p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.topUpAlertDesc}</p></div>
                    </div>
                    {!acceptedTopUp ? (
                      <button onClick={() => { setAcceptedTopUp(true); setProposedPrice(prev => prev + 1200); }} className="whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-white font-black py-2 px-4 rounded-xl shadow-lg shadow-amber-500/30 transition-all text-xs">{t.acceptTopUp}</button>
                    ) : (
                      <div className="whitespace-nowrap text-emerald-500 font-black text-xs flex items-center gap-1"><CheckCircle2 size={16}/> {t.topUpAdded}</div>
                    )}
                  </div>
                )}

                {/* Simulated Live GPS Map View */}
                <div className={`${modalBox} border rounded-2xl p-6 relative overflow-hidden shadow-inner`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Satellite Feed</span>
                      <h4 className={`text-lg font-black ${textMain} mt-2`}>{t.optimalRoute}: A1 Expressway</h4>
                    </div>
                    <div className="text-end"><p className={`text-[10px] ${textMuted} font-black uppercase`}>{t.eta}</p><p className="text-xl font-black text-amber-500 font-mono">14:45 <span className="text-xs">(~2h 15m)</span></p></div>
                  </div>

                  <div className={`relative py-8 px-4 my-4 rounded-xl border ${modalInnerBox}`}>
                    <div className={`h-2 w-full rounded-full relative overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${truckProgress}%` }}></div>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 -ml-4" style={{ [isRtl ? 'right' : 'left']: `${truckProgress}%` }}>
                      <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-[0_0_20px_#10b981] animate-bounce"><Truck size={20} /></div>
                    </div>
                    <div className={`flex justify-between text-xs font-black mt-4 ${textMuted}`}><span>📍 {activeTrackingDeal.from}</span><span>🏁 {activeTrackingDeal.to}</span></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center pt-2">
                    <div className={`p-3 rounded-xl border ${modalInnerBox}`}><p className={`text-[10px] font-bold ${textMuted}`}>{t.speed}</p><p className={`text-base font-black font-mono ${textMain}`}>{dealStage === 'arrived' ? '0' : '82'} km/h</p></div>
                    <div className={`p-3 rounded-xl border ${modalInnerBox}`}><p className={`text-[10px] font-bold ${textMuted}`}>{t.distance}</p><p className={`text-base font-black font-mono ${textMain}`}>{dealStage === 'arrived' ? '0' : '68'} km</p></div>
                    <div className={`p-3 rounded-xl border ${modalInnerBox}`}><p className={`text-[10px] font-bold ${textMuted}`}>{t.status}</p><p className="text-sm font-black text-emerald-500">{dealStage === 'arrived' ? t.statusArrived : dealStage === 'on_route' ? t.statusRoute : t.statusPending}</p></div>
                  </div>
                </div>

                {/* المصافحة الرقمية (QR/OTP) عند وصول الشاحنة */}
                {dealStage === 'arrived' && !showOtpInput && (
                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-up">
                    <div><h4 className={`text-lg font-black ${textMain} flex items-center gap-2`}><Sparkles className="text-amber-500 animate-spin"/> {t.driverName}</h4><p className={`text-xs font-bold mt-1 ${textMuted}`}>{t.otpDesc}</p></div>
                    <button onClick={() => setShowOtpInput(true)} className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 text-white font-black py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 text-sm"><QrCode size={20} /> {t.confirmDelivery}</button>
                  </div>
                )}

                {/* إدخال الكود السري (OTP) */}
                {showOtpInput && (
                  <div className={`border-2 border-blue-500/50 p-6 rounded-2xl flex flex-col items-center gap-4 animate-slide-up text-center ${modalBox}`}>
                    <Unlock size={32} className="text-blue-500 mb-2"/>
                    <h4 className={`text-lg font-black ${textMain}`}>{t.otpTitle}</h4><p className={`text-xs font-bold mb-2 ${textMuted}`}>{t.otpDesc}</p>
                    <input type="text" maxLength="4" placeholder="****" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} className={`w-48 text-center text-3xl font-mono tracking-[1em] p-4 rounded-2xl outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
                    <button onClick={handleVerifyOTP} className="w-48 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 mt-2">{t.verifyOtp}</button>
                  </div>
                )}

              </div>

              {/* قسم التفاوض والدردشة وتوقيع البوليصة */}
              <div className={`lg:col-span-5 flex flex-col h-[520px] border rounded-2xl overflow-hidden ${modalBox}`}>
                <div className={`p-4 border-b flex justify-between items-center ${modalInnerBox}`}>
                  <div><h4 className={`text-sm font-black ${textMain}`}>{t.negotiationTitle}</h4><p className={`text-[11px] font-bold ${textMuted}`}>{activeTrackingDeal.partner}</p></div>
                  <div className="text-end"><span className="text-xs text-emerald-500 font-black font-mono">{proposedPrice} MAD</span></div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                      {msg.sender === 'system' ? (
                        <div className={`border text-xs px-3 py-2 rounded-xl text-center max-w-[90%] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>{msg.text}</div>
                      ) : (
                        <div className={`p-3 rounded-2xl max-w-[80%] text-xs font-bold ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : (isDarkMode ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none' : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none')}`}>{msg.text}</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className={`p-3 border-t space-y-3 ${modalInnerBox}`}>
                  {dealStage === 'negotiating' && (
                    <button onClick={handleConfirmDeal} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 text-sm">{t.acceptDeal}</button>
                  )}
                  <div className="flex gap-2">
                    <input type="text" placeholder={t.chatPlaceholder} value={inputMsg} onChange={e => setInputMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
                    <button onClick={handleSendMessage} className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`}><Send size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 🎆 شاشة الألعاب النارية والاحتفال بالنصر (Fireworks & Mission Accomplished) 🎆 */}
      <canvas ref={canvasRef} className={`fixed inset-0 z-[2147483648] pointer-events-none transition-opacity duration-700 ${showCelebration ? 'opacity-100' : 'opacity-0'}`}></canvas>

      {showCelebration && createPortal(
        <div className="fixed inset-0 z-[2147483649] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-cairo" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={`border-2 border-emerald-500/80 rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_80px_rgba(16,185,129,0.5)] relative overflow-hidden animate-slide-up ${modalContainer}`}>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce"><Award size={52} className="text-white" /></div>
            <h3 className={`text-3xl font-black mb-2 ${textMain}`}>{t.missionSuccessTitle}</h3><p className={`font-bold text-sm mb-6 ${textMuted}`}>{t.missionSuccessDesc}</p>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-center justify-center gap-3"><Leaf className="text-emerald-500" size={24}/><span className="text-emerald-500 font-black">{t.greenBadge}</span></div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-2xl border ${modalBox}`}><p className={`text-[11px] font-black uppercase mb-1 ${textMuted}`}>{t.fuelSaved}</p><p className="text-2xl font-black text-emerald-500 font-mono">~140 Litres</p></div>
              <div className={`p-4 rounded-2xl border ${modalBox}`}><p className={`text-[11px] font-black uppercase mb-1 ${textMuted}`}>{t.carbonSaved}</p><p className="text-2xl font-black text-teal-500 font-mono">-380 kg CO₂</p></div>
            </div>
            <div className="space-y-3">
              <button onClick={() => { alert(isRtl ? "📄 تم تحميل بوليصة الشحن الرسمية والمصادقة عليها!" : "📄 Waybill downloaded and verified!"); setShowCelebration(false); setActiveTrackingDeal(null); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"><FileText size={20} /> {t.downloadWaybill}</button>
              <button onClick={() => { setShowCelebration(false); setActiveTrackingDeal(null); }} className={`w-full font-bold py-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>{t.closeRoom}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* تسجيل رحلة فارغة جديدة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
              <h3 className={`text-xl font-black ${textMain}`}>{t.formTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className={`${textMuted} ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`}><X size={24} /></button>
            </div>
            <form onSubmit={submitEmptyTrip} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className={`text-xs font-bold ${textMuted}`}>{t.fromCity}</label><input required type="text" value={formData.departureCity} onChange={(e) => setFormData({...formData, departureCity: e.target.value})} className={`w-full ${bgInput} border rounded-xl p-3 focus:border-emerald-500 outline-none`} placeholder="..." /></div>
                <div className="space-y-2"><label className={`text-xs font-bold ${textMuted}`}>{t.toCity}</label><input required type="text" value={formData.arrivalCity} onChange={(e) => setFormData({...formData, arrivalCity: e.target.value})} className={`w-full ${bgInput} border rounded-xl p-3 focus:border-emerald-500 outline-none`} placeholder="..." /></div>
              </div>
              <div className="space-y-2"><label className={`text-xs font-bold ${textMuted}`}>{t.tripDate}</label><input required type="date" value={formData.tripDate} onChange={(e) => setFormData({...formData, tripDate: e.target.value})} className={`w-full ${bgInput} border rounded-xl p-3 focus:border-emerald-500 outline-none`} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className={`text-xs font-bold ${textMuted}`}>{t.truckType}</label><select value={formData.truckType} onChange={(e) => setFormData({...formData, truckType: e.target.value})} className={`w-full ${bgInput} border rounded-xl p-3 focus:border-emerald-500 outline-none`}><option>{t.truck1}</option><option>{t.truck2}</option><option>{t.truck3}</option></select></div>
                <div className="space-y-2"><label className={`text-xs font-bold ${textMuted}`}>{t.capacityInput}</label><input required type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className={`w-full ${bgInput} border rounded-xl p-3 focus:border-emerald-500 outline-none`} placeholder="..." /></div>
              </div>
              <div className="pt-4 flex gap-3"><button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20">{isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> {t.submitTrip}</>}</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}