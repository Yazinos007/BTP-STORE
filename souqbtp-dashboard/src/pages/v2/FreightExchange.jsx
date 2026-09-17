import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { 
  Truck, Search, MapPin, Calendar, Weight, ArrowRightLeft, 
  CheckCircle2, Plus, Filter, Zap, ShieldCheck, TrendingUp, 
  ArrowUpRight, X, Loader2, Navigation, MessageSquare, 
  Send, Award, Sparkles, Volume2, PhoneCall, FileText, Check,
  Leaf, QrCode, Unlock, PackagePlus
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
  const [activeTrackingDeal, setActiveTrackingDeal] = useState(null); // الصفقة الجاري تتبعها
  const [dealStage, setDealStage] = useState('negotiating'); // 'negotiating' | 'on_route' | 'arrived' | 'delivered'
  const [proposedPrice, setProposedPrice] = useState(3200);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [truckProgress, setTruckProgress] = useState(20); // نسبة تقدم الشاحنة على الخريطة
  const [showCelebration, setShowCelebration] = useState(false);

  // 🚀 ابتكارات المستقبل (OTP والحمولة التكميلية)
  const [showTopUpAlert, setShowTopUpAlert] = useState(true);
  const [acceptedTopUp, setAcceptedTopUp] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // حالات النوافذ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvasRef = useRef(null);

  const translations = {
    ar: {
      title: 'بورصة الشحن التعاونية', subtitle: 'السوق المباشر لرحلات العودة الفارغة. وفر حتى 40% من تكاليف النقل.',
      aiOptimizer: 'المُحسّن اللوجستي "العودة المشحونة"', aiOptDesc: 'قلل تكاليف شاحناتك الفارغة بدمج مسارات العودة مع موردين ومقاولين آخرين.',
      addReturn: 'إضافة رحلة عودة فارغة', matchFound: 'تم العثور على تطابق 1',
      detectedReturn: 'رحلة عودة فارغة مرصودة', estSavings: 'الاقتصاد المالي المتوقع',
      partner: 'الشريك', date: 'التاريخ', available: 'متاح',
      confirmMatch: 'بدء التفاوض والمطابقة', from: 'مدينة الانطلاق...', to: 'مدينة الوصول...', allTrucks: 'جميع الشاحنات',
      requestMatch: 'طلب وتفاوض مباشر 💬', capacity: 'الحمولة المتاحة', saving: 'جاري المعالجة...',
      formTitle: 'تسجيل رحلة عودة فارغة', fromCity: 'من مدينة (الانطلاق)', toCity: 'إلى مدينة (الوصول)',
      tripDate: 'تاريخ الرحلة', truckType: 'نوع الشاحنة', capacityInput: 'السعة المتاحة (بالطن)',
      submitTrip: 'نشر الرحلة على الرادار', truck1: 'رموك (Remorque)', truck2: 'شاحنة 14 طن', truck3: 'شاحنة 19 طن',
      // ترجمات غرفة التفاوض والـ GPS
      dealRoom: 'غرفة عمليات الشحنة والمطابقة المباشرة',
      eta: 'موعد الوصول المتوقع (ETA)', optimalRoute: 'المسار المختصر الموصى به',
      speed: 'السرعة الحالية', distance: 'المسافة المتبقية',
      negotiationTitle: 'نافذة التفاوض السريع والتسعير',
      acceptDeal: '🤝 قبول العرض وتوقيع الوثيقة',
      driverName: 'السائق الشريك', onTheWay: 'الشاحنة في المسار نحو الورشة',
      confirmDelivery: 'المصافحة الرقمية (Proof of Delivery)',
      missionSuccessTitle: 'تمت المهمة بنجاح باهر! 🏆',
      missionSuccessDesc: 'وصلت الشحنة بأمان، وتم توفير الوقود وحماية البيئة بنجاح.',
      carbonSaved: 'الكربون الذي تم تفاديه', fuelSaved: 'الوقود الموفر',
      downloadWaybill: 'تحميل بوليصة الشحن الرسمية (PDF)',
      topUpAlertTitle: '💡 اقتراح ذكي: حمولة تكميلية (LTL)', topUpAlertDesc: 'متبقي 10 طن مساحة فارغة! هناك ورشة سيراميك في طريقك. هل تريد ضمها؟',
      acceptTopUp: 'ضم الحمولة (+1200 د.م)', topUpAdded: '✅ تم ضم الحمولة التكميلية!',
      otpTitle: 'أدخل كود الأمان (OTP)', otpDesc: 'اطلب الكود من السائق لتأكيد الاستلام وفك الحجز المالي.',
      verifyOtp: 'تحقق وفك الحجز 🔓', greenBadge: 'شارة الورشة الخضراء 🌿'
    },
    fr: {
      title: 'Bourse de Fret Collaborative', subtitle: 'Le marché en direct des retours à vide. Économisez jusqu\'à 40% sur le transport.',
      aiOptimizer: 'Optimiseur Logistique "Retour Chargé"', aiOptDesc: 'Réduisez les frais de vos camions vides en fusionnant les trajets de retour avec d\'autres partenaires.',
      addReturn: 'Ajouter un retour à vide', matchFound: '1 Matching Trouvé',
      detectedReturn: 'RETOUR À VIDE DÉTECTÉ', estSavings: 'ÉCONOMIE FINANCIÈRE ESTIMÉE',
      partner: 'Partenaire', date: 'Date', available: 'Disponible',
      confirmMatch: 'Négocier et Matcher', from: 'Ville de départ...', to: 'Ville d\'arrivée...', allTrucks: 'Tous les camions',
      requestMatch: 'Demander & Négocier 💬', capacity: 'Capacité dispo.', saving: 'Traitement...',
      formTitle: 'Enregistrer un trajet à vide', fromCity: 'De (Ville de départ)', toCity: 'Vers (Ville d\'arrivée)',
      tripDate: 'Date du trajet', truckType: 'Type de camion', capacityInput: 'Capacité disponible (Tonnes)',
      submitTrip: 'Publier sur la Bourse', truck1: 'Semi-remorque', truck2: 'Camion 14T', truck3: 'Camion 19T',
      dealRoom: 'Salle d\'Opérations & Suivi GPS en Direct',
      eta: 'Heure d\'Arrivée Estimée (ETA)', optimalRoute: 'Itinéraire Optimal Conseillé',
      speed: 'Vitesse Actuelle', distance: 'Distance Restante',
      negotiationTitle: 'Négociation Rapide du Prix',
      acceptDeal: '🤝 Accepter & Générer le Bon',
      driverName: 'Chauffeur Partenaire', onTheWay: 'Camion en route vers le chantier',
      confirmDelivery: 'Poignée de main numérique (POD)',
      missionSuccessTitle: 'Mission Accomplie avec Succès ! 🏆',
      missionSuccessDesc: 'La cargaison est bien arrivée. Économies et écologie au rendez-vous.',
      carbonSaved: 'CO₂ Évité', fuelSaved: 'Carburant Économisé',
      downloadWaybill: 'Télécharger la Lettre de Voiture (PDF)',
      topUpAlertTitle: '💡 Suggestion IA : Chargement Partiel (LTL)', topUpAlertDesc: 'Reste 10T d\'espace ! Ajouter un lot de céramique sur la route ?',
      acceptTopUp: 'Ajouter (+1200 MAD)', topUpAdded: '✅ Lot ajouté avec succès !',
      otpTitle: 'Code de Sécurité (OTP)', otpDesc: 'Demandez le code au chauffeur pour valider la livraison.',
      verifyOtp: 'Vérifier et Débloquer 🔓', greenBadge: 'Badge Chantier Vert 🌿'
    },
    en: {
      title: 'Collaborative Freight Exchange', subtitle: 'Live marketplace for empty return trips. Save up to 40% on transport.',
      aiOptimizer: 'Logistics Optimizer "Loaded Return"', aiOptDesc: 'Cut empty truck costs by merging return routes with peer contractors.',
      addReturn: 'Add Empty Return', matchFound: '1 Match Found',
      detectedReturn: 'EMPTY RETURN DETECTED', estSavings: 'ESTIMATED FINANCIAL SAVINGS',
      partner: 'Partner', date: 'Date', available: 'Available',
      confirmMatch: 'Negotiate & Match', from: 'Departure city...', to: 'Arrival city...', allTrucks: 'All Trucks',
      requestMatch: 'Request & Negotiate 💬', capacity: 'Avail. Capacity', saving: 'Processing...',
      formTitle: 'Register an Empty Return', fromCity: 'From (Departure City)', toCity: 'To (Arrival City)',
      tripDate: 'Trip Date', truckType: 'Truck Type', capacityInput: 'Available Capacity (Tons)',
      submitTrip: 'Publish on Exchange', truck1: 'Semi-trailer', truck2: '14T Truck', truck3: '19T Truck',
      dealRoom: 'Freight Deal & Live GPS Operations Room',
      eta: 'Estimated Time of Arrival (ETA)', optimalRoute: 'Recommended Optimal Route',
      speed: 'Current Speed', distance: 'Remaining Distance',
      negotiationTitle: 'Instant Price Negotiation',
      acceptDeal: '🤝 Accept Deal & Sign Waybill',
      driverName: 'Partner Driver', onTheWay: 'Truck en route to construction site',
      confirmDelivery: 'Digital Handshake (POD)',
      missionSuccessTitle: 'Mission Accomplished! 🏆',
      missionSuccessDesc: 'Cargo delivered safely. Fuel saved and carbon footprint reduced.',
      carbonSaved: 'CO₂ Avoided', fuelSaved: 'Fuel Saved',
      downloadWaybill: 'Download Official Waybill (PDF)',
      topUpAlertTitle: '💡 AI Suggestion: Smart Top-Up (LTL)', topUpAlertDesc: '10T space left! Add ceramic tiles on the route?',
      acceptTopUp: 'Add Load (+1200 MAD)', topUpAdded: '✅ Top-up load added!',
      otpTitle: 'Security Code (OTP)', otpDesc: 'Ask the driver for the code to confirm delivery.',
      verifyOtp: 'Verify & Release Funds 🔓', greenBadge: 'Green Site Badge 🌿'
    }
  };
  const t = translations[language] || translations.ar;

  const [formData, setFormData] = useState({
    departureCity: '', arrivalCity: '', tripDate: '', truckType: t.truck1, capacity: ''
  });

  // محاكات حركة الشاحنة عند قبول الصفقة
  useEffect(() => {
    let interval;
    if (dealStage === 'on_route') {
      interval = setInterval(() => {
        setTruckProgress(prev => {
          if (prev >= 98) {
            clearInterval(interval);
            setDealStage('arrived'); // الشاحنة وصلت وتم تغيير الحالة
            return 100;
          }
          return prev + 15; // زيادة السرعة للمحاكاة
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [dealStage]);

  // 🎵 تشغيل نغمة النصر والاحتفال (Web Audio API Synthesizer)
  const playVictorySound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (نغمات بهجة فوز)
      notes.forEach((freq, idx) => {
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
    } catch (e) {
      console.warn("Audio context not supported", e);
    }
  };

  // 🎆 محرك الألعاب النارية الاحتفالي (Fireworks Canvas Engine)
  const launchFireworks = () => {
    setShowCelebration(true);
    playVictorySound();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ffffff'];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 100,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 22,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.005
      });
    }

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.alpha -= p.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (p.alpha <= 0) particles.splice(idx, 1);
      });

      if (particles.length > 0) {
        animationFrame = requestAnimationFrame(render);
      }
    };
    render();
  };

  // بيانات الشاحنات المتاحة
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

  // بدء المفاوضات على رحلة معينة
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
      { id: 1, sender: 'driver', text: `مرحباً بك يا باشمهندس! أنا متواجد في ${deal.from} ومستعد للتحميل في طريقي نحو ${deal.to}. سأقوم بتخفيض التسعيرة لأن الشاحنة فارغة.` },
      { id: 2, sender: 'system', text: `⚡ اقترح الذكاء الاصطناعي سعراً عادلاً: ${deal.savings + 500} درهم (توفير 40%).` }
    ]);
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: inputMsg }]);
    setInputMsg('');
  };

  const handleConfirmDeal = () => {
    setDealStage('on_route');
    setShowTopUpAlert(false); // إخفاء مقترح الحمولة التكميلية عند بدء الرحلة
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'system', text: '✅ تم توقيع بوليصة الشحن الرقمية وتأكيد حجز الشاحنة! انطلقت الرحلة الآن وهي تحت المراقبة بالـ GPS.' }
    ]);
  };

  // التحقق من كود الـ OTP وفك الحساب المالي
  const handleVerifyOTP = () => {
    if (otpCode.length === 4) {
      setDealStage('delivered');
      setShowOtpInput(false);
      launchFireworks();
    } else {
      alert(isRtl ? "الرجاء إدخال كود من 4 أرقام." : "Please enter a 4-digit code.");
    }
  };

  // 🎨 الألوان
  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgInput = isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400';

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

        {/* عرض فرصة تطابق ممتازة */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 relative`}>
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-2`}>{t.detectedReturn}</p>
              <div className={`text-xl font-black ${textMain} flex items-center gap-3`}>
                Tanger <ArrowRightLeft className="text-emerald-500" size={20}/> Casablanca
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-start md:text-end">
              <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-1`}>{t.estSavings}</p>
              <p className="text-2xl font-black text-emerald-500 font-mono" dir="ltr">3,500 MAD</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenDealRoom({ id: 99, type: 'SEMI-REMORQUE', savings: 3500, from: 'Tanger', to: 'Casablanca', date: 'اليوم', capacity: '30 T', partner: 'سائق معتمد: عبد الرحيم' })}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            {t.confirmMatch} <ArrowUpRight size={18} className={isRtl ? 'rotate-90' : ''}/>
          </button>
        </div>
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
            <option>{t.allTrucks}</option>
            <option>SEMI-REMORQUE</option>
            <option>CAMION 19T</option>
            <option>FOURGON</option>
          </select>
        </div>
      </div>

      {/* 🚀 Live Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map(offer => (
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

            <div className={`flex items-center justify-between ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 mb-6`}>
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
              
              {/* زر طلب التفاوض الذي يفتح غرفة العمليات */}
              <button 
                onClick={() => handleOpenDealRoom(offer)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2"
              >
                {t.requestMatch}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 🚀 غرفة العمليات والتفاوض اللوجستي الذكي مع تتبع الـ GPS والألعاب النارية 🚀 */}
      {/* ========================================================================= */}
      {activeTrackingDeal && createPortal(
        <div className="fixed inset-0 z-[2147483647] bg-[#020617]/95 backdrop-blur-xl flex justify-center items-center p-3 md:p-6 animate-fade-in font-cairo" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Navigation size={22} className="animate-pulse"/>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white">{t.dealRoom}</h3>
                  <p className="text-xs text-slate-400 font-bold">{activeTrackingDeal.from} ➔ {activeTrackingDeal.to} ({activeTrackingDeal.capacity})</p>
                </div>
              </div>
              <button onClick={() => setActiveTrackingDeal(null)} className="p-2 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content: GPS Radar & Deal/Chat */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* قسم الـ GPS والخريطة ومسار الشاحنة (7 أعمدة) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 📦 ابتكار المستقبل: اقتراح الحمولة التكميلية (Smart Top-Up) */}
                {showTopUpAlert && dealStage === 'negotiating' && (
                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-down">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><PackagePlus size={24}/></div>
                      <div>
                        <h4 className="text-amber-400 font-black text-sm">{t.topUpAlertTitle}</h4>
                        <p className="text-slate-300 text-xs font-bold mt-1">{t.topUpAlertDesc}</p>
                      </div>
                    </div>
                    {!acceptedTopUp ? (
                      <button onClick={() => { setAcceptedTopUp(true); setProposedPrice(prev => prev + 1200); }} className="whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-4 rounded-xl shadow-lg shadow-amber-500/30 transition-all text-xs">
                        {t.acceptTopUp}
                      </button>
                    ) : (
                      <div className="whitespace-nowrap text-emerald-400 font-black text-xs flex items-center gap-1"><CheckCircle2 size={16}/> {t.topUpAdded}</div>
                    )}
                  </div>
                )}

                {/* Simulated Live GPS Map View */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-inner">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Satellite Feed
                      </span>
                      <h4 className="text-lg font-black text-white mt-2">{t.optimalRoute}: A1 Expressway</h4>
                    </div>
                    <div className="text-end">
                      <p className="text-[10px] text-slate-400 font-black uppercase">{t.eta}</p>
                      <p className="text-xl font-black text-amber-400 font-mono">14:45 <span className="text-xs">(~2h 15m)</span></p>
                    </div>
                  </div>

                  {/* الخط البصري لمسار الشاحنة التفاعلي */}
                  <div className="relative py-8 px-4 my-4 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${truckProgress}%` }}
                      ></div>
                    </div>

                    {/* أيقونة الشاحنة المتحركة */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 -ml-4"
                      style={{ [isRtl ? 'right' : 'left']: `${truckProgress}%` }}
                    >
                      <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-[0_0_20px_#10b981] animate-bounce">
                        <Truck size={20} />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs font-black text-slate-400 mt-4">
                      <span>📍 {activeTrackingDeal.from} (نقطة التحميل)</span>
                      <span>🏁 {activeTrackingDeal.to} (موقع الورشة)</span>
                    </div>
                  </div>

                  {/* تفاصيل الملاحة الحية */}
                  <div className="grid grid-cols-3 gap-3 text-center pt-2">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-bold">{t.speed}</p>
                      <p className="text-base font-black text-white font-mono">{dealStage === 'arrived' ? '0' : '82'} km/h</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-bold">{t.distance}</p>
                      <p className="text-base font-black text-white font-mono">{dealStage === 'arrived' ? '0' : '68'} km</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-bold">الحالة</p>
                      <p className="text-base font-black text-emerald-400">
                        {dealStage === 'arrived' ? 'وصلت 🏁' : dealStage === 'on_route' ? 'في المسار 🟢' : 'بانتظار التأكيد 🟡'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🤝 ابتكار المستقبل: المصافحة الرقمية (QR/OTP) عند وصول الشاحنة */}
                {dealStage === 'arrived' && !showOtpInput && (
                  <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border-2 border-emerald-500/50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-up">
                    <div>
                      <h4 className="text-lg font-black text-white flex items-center gap-2">
                        <Sparkles className="text-amber-400 animate-spin"/> {t.driverName}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold mt-1">{t.otpDesc}</p>
                    </div>
                    <button onClick={() => setShowOtpInput(true)} className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 text-sm">
                      <QrCode size={20} /> {t.confirmDelivery}
                    </button>
                  </div>
                )}

                {/* واجهة إدخال الكود السري (OTP) */}
                {showOtpInput && (
                  <div className="bg-slate-900 border-2 border-blue-500/50 p-6 rounded-2xl flex flex-col items-center gap-4 animate-slide-up text-center">
                    <Unlock size={32} className="text-blue-400 mb-2"/>
                    <h4 className="text-lg font-black text-white">{t.otpTitle}</h4>
                    <p className="text-xs text-slate-400 font-bold mb-2">{t.otpDesc}</p>
                    
                    <input 
                      type="text" 
                      maxLength="4"
                      placeholder="****"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-48 bg-slate-950 border-2 border-slate-700 text-center text-3xl font-mono text-white tracking-[1em] p-4 rounded-2xl outline-none focus:border-blue-500"
                    />
                    
                    <button 
                      onClick={handleVerifyOTP}
                      className="w-48 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 mt-2"
                    >
                      {t.verifyOtp}
                    </button>
                  </div>
                )}

              </div>

              {/* قسم التفاوض والدردشة وتوقيع البوليصة (5 أعمدة) */}
              <div className="lg:col-span-5 flex flex-col h-[520px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                
                {/* رأس الدردشة */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-white">{t.negotiationTitle}</h4>
                    <p className="text-[11px] text-slate-400 font-bold">{activeTrackingDeal.partner}</p>
                  </div>
                  <div className="text-end">
                    <span className="text-xs text-emerald-400 font-black font-mono">{proposedPrice} MAD</span>
                  </div>
                </div>

                {/* رسائل الدردشة */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                      {msg.sender === 'system' ? (
                        <div className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl text-center max-w-[90%]">
                          {msg.text}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-2xl max-w-[80%] text-xs font-bold ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                          {msg.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* إدخال الرسائل والمساومة */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-3">
                  {dealStage === 'negotiating' && (
                    <button 
                      onClick={handleConfirmDeal}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 text-sm"
                    >
                      {t.acceptDeal}
                    </button>
                  )}

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="اكتب رسالة أو اقترح سعراً..." 
                      value={inputMsg} 
                      onChange={e => setInputMsg(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                    <button onClick={handleSendMessage} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl">
                      <Send size={16} />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 🎆 شاشة الألعاب النارية والاحتفال بالنصر (Fireworks & Mission Accomplished) 🎆 */}
      {/* ========================================================================= */}
      <canvas 
        ref={canvasRef} 
        className={`fixed inset-0 z-[2147483648] pointer-events-none transition-opacity duration-700 ${showCelebration ? 'opacity-100' : 'opacity-0'}`}
      ></canvas>

      {showCelebration && createPortal(
        <div className="fixed inset-0 z-[2147483649] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-cairo" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_80px_rgba(16,185,129,0.5)] relative overflow-hidden animate-slide-up">
            
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
              <Award size={52} className="text-slate-950" />
            </div>

            <h3 className="text-3xl font-black text-white mb-2">{t.missionSuccessTitle}</h3>
            <p className="text-slate-400 font-bold text-sm mb-6">{t.missionSuccessDesc}</p>

            {/* 🌿 شارة الورشة الخضراء */}
            <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-center justify-center gap-3">
              <Leaf className="text-emerald-400" size={24}/>
              <span className="text-emerald-400 font-black">{t.greenBadge} تم منحها!</span>
            </div>

            {/* إحصائيات التوفير والأثر البيئي الأخضر */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-[11px] text-slate-500 font-black uppercase mb-1">{t.fuelSaved}</p>
                <p className="text-2xl font-black text-emerald-400 font-mono">~140 Litres</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-[11px] text-slate-500 font-black uppercase mb-1">{t.carbonSaved}</p>
                <p className="text-2xl font-black text-teal-400 font-mono">-380 kg CO₂</p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  alert("📄 تم تحميل بوليصة الشحن الرسمية والمصادقة عليها!");
                  setShowCelebration(false);
                  setActiveTrackingDeal(null);
                }} 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <FileText size={20} /> {t.downloadWaybill}
              </button>
              <button 
                onClick={() => {
                  setShowCelebration(false);
                  setActiveTrackingDeal(null);
                }} 
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl transition-colors"
              >
                إغلاق غرفة العمليات
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}