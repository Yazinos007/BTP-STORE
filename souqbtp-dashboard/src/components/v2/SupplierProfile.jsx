import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import SmartVoiceService from './SmartVoiceService';
import { 
  ShieldCheck, MapPin, Star, CheckCircle2, 
  Image as ImageIcon, MessageSquare, Briefcase, 
  Award, FileText, X, Edit, Save, Plus, Trash2, Loader2, Camera, UploadCloud, ThumbsUp, Lock, Navigation, Zap
} from 'lucide-react';

export default function SupplierProfile({ artisanId, isDarkMode = false, language = 'ar', onClose }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const isRtl = language === 'ar';
  
  // --- الحالات الأساسية للبروفايل ---
  const [activeTab, setActiveTab] = useState('services');
  const [artisan, setArtisan] = useState({});
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newService, setNewService] = useState({ 
  service_name: '', 
  description: '', 
  starting_price: '',
  flash_discount_price: '',
  flash_expires_at: ''
});

  const [isAddingService, setIsAddingService] = useState(false);
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false); 

  // --- حالات التقييمات ---
  const [reviewsList, setReviewsList] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewVotesMap, setReviewVotesMap] = useState({});
  const [userVotedReviews, setUserVotedReviews] = useState(new Set());

  // --- قاموس الترجمة الشامل ---
  const t = {
    ar: {
      trustPassport: "جواز الثقة", 
      level: "مستوى التحقق:", 
      levels: {
        basic: "أساسي",
        pro: "محترف",
        business: "شركة معتمدة"
      },
      verifiedId: "هوية موثقة", 
      verifiedBiz: "سجل تجاري موثق", 
      verifiedPhone: "رقم هاتف موثق",
      verifiedAddress: "عنوان موثق", 
      verifiedPortfolio: "أعمال سابقة موثقة",
      positiveReviews: "تقييمات إيجابية",
      completedProjects: "مشاريع منجزة",
      completionRate: "معدل إتمام الطلبات",
      stats: { completed: "مشروع منجز", responseRate: "معدل الاستجابة", responseTime: "وقت الرد" },
      tabs: { services: "الخدمات والأسعار", portfolio: "معرض الأعمال", reviews: "التقييمات" },
      actions: { quote: "طلب عرض سعر", contact: "مراسلة", close: "إغلاق", edit: "تعديل البروفايل", save: "حفظ التغييرات" },
      about: "نبذة عن الشركة", portfolioEmpty: "لا توجد صور في معرض الأعمال حالياً.", reviewsTitle: "التقييمات",
      addService: "إضافة خدمة جديدة", serviceNamePlaceholder: "اسم الخدمة (مثال: تركيب كهرباء)",
      pricePlaceholder: "السعر المبدئي (MAD)", descPlaceholder: "وصف قصير للخدمة...",
      saveServiceBtn: "حفظ الخدمة", cancel: "إلغاء", emptyServices: "لا توجد خدمات مضافة حتى الآن.",
      startingFrom: "ابتداءً من", toReviews: "الانتقال لصفحة التقييمات",
      placeholders: {
        name: "✍️ أدخل اسم الشركة أو الحرفي هنا...",
        category: "✍️ حدد تخصصك (مثال: كهربائي، صباغ)...",
        address: "✍️ أدخل المدينة أو العنوان السطحي...",
        aboutDesc: "اكتب نبذة عن الشركة هنا...",
        responseTimeEx: "مثال: < 30 mins"
      },
      addPhoto: "إضافة صورة للمعرض",
      noDesc: "لا يتوفر وصف حالياً.",
      unspecified: "فئة غير محددة",
      noAddress: "العنوان غير محدد",
      artisanName: "اسم الحرفي",
      emptyReviews: "فارغة حالياً.",
      notDetermined: "غير محدد",
      deleteConfirmService: "هل أنت متأكد من حذف هذه الخدمة؟",
      deleteConfirmPhoto: "حذف هذه الصورة من معرض الأعمال؟",
      generalQuote: "طلب عرض سعر عام",
      reviewForm: {
        title: "📝 إضافة تقييم وتجربة",
        alreadyReviewed: "✅ لقد قمت بتقييم هذا الحرفي مسبقاً. شكراً لمساهمتك!",
        howDoYouRate: "كيف تقيّم الخدمة؟",
        commentPlaceholder: "شاركنا تفاصيل تجربتك مع هذا الحرفي...",
        submitBtn: "نشر التقييم",
        loginRequired: "يجب تسجيل الدخول لإضافة تقييم",
        selfReview: "لا يمكنك تقييم نفسك!",
        submitError: "حدث خطأ أثناء حفظ التقييم",
        submitSuccess: "شكراً لك! تم نشر تقييمك بنجاح.",
        submitWarning: "تم تسجيل تقييمك. نظراً لتقييمك المنخفض، تم إرسال تنبيه للإدارة لمراجعة الجودة."
      },
      helpful: "مفيد",
      gpsBtn: "تحديد موقع المستودع (GPS)", 
      gpsSuccess: "تم التقاط الإحداثيات بنجاح!", 
      gpsError: "يرجى تفعيل الـ GPS في المتصفح أو الهاتف.",
      flashDealTitle: "إعداد عرض استعجالي (اختياري)",
      flashPricePlaceholder: "سعر العرض (MAD)",
      flashDatePlaceholder: "تاريخ انتهاء العرض"
    },
    fr: {
      trustPassport: "Passeport de Confiance", 
      level: "Niveau :", 
      levels: {
        basic: "Basique",
        pro: "Professionnel",
        business: "Entreprise Vérifiée"
      },
      verifiedId: "Identité vérifiée", 
      verifiedBiz: "RC vérifié", 
      verifiedPhone: "Téléphone vérifié",
      verifiedAddress: "Adresse vérifiée", 
      verifiedPortfolio: "Réalisations vérifiées",
      positiveReviews: "Avis positifs",
      completedProjects: "Projets terminés",
      completionRate: "Taux de réussite",
      stats: { completed: "Chantiers", responseRate: "Taux de réponse", responseTime: "Temps de réponse" },
      tabs: { services: "Services & Tarifs", portfolio: "Réalisations", reviews: "Avis clients" },
      actions: { quote: "Demander un devis", contact: "Contacter", close: "Fermer", edit: "Modifier profil", save: "Enregistrer" },
      about: "À propos", portfolioEmpty: "Aucune photo pour le moment.", reviewsTitle: "Avis des clients",
      addService: "Ajouter un nouveau service", serviceNamePlaceholder: "Nom du service (ex: Installation)",
      pricePlaceholder: "Prix de départ (MAD)", descPlaceholder: "Brève description...",
      saveServiceBtn: "Enregistrer", cancel: "Annuler", emptyServices: "Aucun service ajouté pour le moment.",
      startingFrom: "À partir de", toReviews: "Aller aux avis",
      placeholders: {
        name: "✍️ Entrez le nom de l'entreprise...",
        category: "✍️ Spécialité (ex: Électricien)...",
        address: "✍️ Entrez l'adresse ou la ville...",
        aboutDesc: "Écrivez une description de l'entreprise ici...",
        responseTimeEx: "ex: < 30 mins"
      },
      addPhoto: "Ajouter une photo",
      noDesc: "Aucune description disponible.",
      unspecified: "Catégorie non définie",
      noAddress: "Adresse non spécifiée",
      artisanName: "Nom de l'artisan",
      emptyReviews: "Aucun avis pour le moment.",
      notDetermined: "Non défini",
      deleteConfirmService: "Êtes-vous sûr de vouloir supprimer ce service ?",
      deleteConfirmPhoto: "Supprimer cette photo du portfolio ?",
      generalQuote: "Demande de devis général",
      reviewForm: {
        title: "📝 Laisser un avis",
        alreadyReviewed: "✅ Vous avez déjà évalué cet artisan. Merci pour votre avis !",
        howDoYouRate: "Notez la prestation :",
        commentPlaceholder: "Partagez votre expérience avec cet artisan...",
        submitBtn: "Publier l'avis",
        loginRequired: "Veuillez vous connecter pour laisser un avis",
        selfReview: "Vous ne pouvez pas vous évaluer vous-même !",
        submitError: "Une erreur s'est produite lors de l'enregistrement de l'avis",
        submitSuccess: "Merci ! Votre avis a été publié avec succès.",
        submitWarning: "Avis enregistré. Un signalement a été transmis à l'administration."
      },
      helpful: "Utile",
      gpsBtn: "Détecter la position (GPS)", 
      gpsSuccess: "Coordonnées enregistrées avec succès !", 
      gpsError: "Veuillez activer le GPS de votre appareil.",
      flashDealTitle: "Configurer une offre éclair (Optionnel)",
      flashPricePlaceholder: "Prix de l'offre (MAD)",
      flashDatePlaceholder: "Date de fin de l'offre"
    },
    en: {
      trustPassport: "Trust Passport", 
      level: "Level:", 
      levels: {
        basic: "Basic",
        pro: "Professional",
        business: "Verified Business"
      },
      verifiedId: "Verified ID", 
      verifiedBiz: "Verified Business Reg.", 
      verifiedPhone: "Verified Phone",
      verifiedAddress: "Verified Address", 
      verifiedPortfolio: "Verified Portfolio",
      positiveReviews: "Positive Reviews",
      completedProjects: "Completed Projects",
      completionRate: "Completion Rate",
      stats: { completed: "Completed Jobs", responseRate: "Response Rate", responseTime: "Response Time" },
      tabs: { services: "Services & Pricing", portfolio: "Portfolio", reviews: "Reviews" },
      actions: { quote: "Request Quote", contact: "Contact", close: "Close", edit: "Edit Profile", save: "Save Changes" },
      about: "About Us", portfolioEmpty: "No photos in portfolio yet.", reviewsTitle: "Customer Reviews",
      addService: "Add New Service", serviceNamePlaceholder: "Service name (e.g., Wiring)",
      pricePlaceholder: "Starting price (MAD)", descPlaceholder: "Short description...",
      saveServiceBtn: "Save Service", cancel: "Cancel", emptyServices: "No services added yet.",
      startingFrom: "Starting from", toReviews: "Go to Reviews",
      placeholders: {
        name: "✍️ Enter company or artisan name...",
        category: "✍️ Specialty (e.g., Electrician)...",
        address: "✍️ Enter city or address...",
        aboutDesc: "Write a description of the company here...",
        responseTimeEx: "e.g., < 30 mins"
      },
      addPhoto: "Add Photo",
      noDesc: "No description available yet.",
      unspecified: "Unspecified Category",
      noAddress: "Address not specified",
      artisanName: "Artisan Name",
      emptyReviews: "Empty right now.",
      notDetermined: "Not determined",
      deleteConfirmService: "Are you sure you want to delete this service?",
      deleteConfirmPhoto: "Delete this photo from portfolio?",
      generalQuote: "General Quote Request",
      reviewForm: {
        title: "📝 Leave a Review",
        alreadyReviewed: "✅ You have already reviewed this artisan. Thank you!",
        howDoYouRate: "Rate the service:",
        commentPlaceholder: "Share details about your experience...",
        submitBtn: "Submit Review",
        loginRequired: "You must log in to submit a review",
        selfReview: "You cannot review yourself!",
        submitError: "An error occurred while saving the review",
        submitSuccess: "Thank you! Your review was successfully published.",
        submitWarning: "Review recorded. Due to low rating, an alert was sent to admin."
      },
      helpful: "Helpful",
      gpsBtn: "Detect Location (GPS)", 
      gpsSuccess: "Coordinates saved successfully!", 
      gpsError: "Please enable GPS on your device.",
      lashPricePlaceholder: "Flash Price (MAD)",
      flashDatePlaceholder: "Deal Expiry Date"
    }
  }[language] || t.ar;

  // دالة الحفظ الفعلي للخدمة المولدة بالصوت
  const handlePublishAIService = async (data) => {
    try {
      const { error } = await supabase
        .from('provider_services')
        .insert({
          provider_id: artisanId, // تأكد أن متغير الـ ID الخاص بالمورد متوفر هنا
          service_name: data.title,
          description: data.description,
          starting_price: Number(data.price),
          // يمكنك تخصيص الـ category_id هنا إذا كان الجدول يتطلب رقماً بدلاً من نص
        });

      if (!error) {
        alert(language === 'ar' ? 'تمت إضافة الخدمة بنجاح إلى متجرك!' : 'Service ajouté à votre boutique avec succès !');
        // إذا كانت لديك دالة لجلب الخدمات، استدعها هنا لتحديث الواجهة فوراً
        // fetchProviderServices(); 
      } else {
        console.error("Error saving AI service:", error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- دالة جلب التقييمات ---
  const fetchReviews = async (providerId, userId) => {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviewsList(reviews || []);

      if (userId && reviews) {
        const userReview = reviews.find(r => r.user_id === userId);
        setHasReviewed(!!userReview);

        const reviewIds = reviews.map(r => r.id);
        if (reviewIds.length > 0) {
          const { data: votes } = await supabase
            .from('review_votes')
            .select('*')
            .in('review_id', reviewIds);

          if (votes) {
            const counts = {};
            const userVotes = new Set();
            votes.forEach(v => {
              counts[v.review_id] = (counts[v.review_id] || 0) + 1;
              if (v.user_id === userId) userVotes.add(v.review_id);
            });
            setReviewVotesMap(counts);
            setUserVotedReviews(userVotes);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // --- التأثير الأساسي لجلب البيانات ---
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const loggedInUserId = user ? user.id : '9e85d1a0-918f-4c26-a78a-42ad05186b51'; 
      setCurrentUserId(loggedInUserId);

      const profileId = artisanId || id || loggedInUserId; 

      const { data: artisanData } = await supabase.from('suppliers').select('*').eq('id', profileId).single();
      if (artisanData) setArtisan(artisanData);

      const { data: servicesData } = await supabase.from('provider_services').select('*').eq('provider_id', profileId);
      if (servicesData) setServices(servicesData);

      const { data: portfolioData } = await supabase.from('provider_portfolio').select('*').eq('provider_id', profileId);
      if (portfolioData) setPortfolio(portfolioData);

      // جلب التقييمات
      fetchReviews(profileId, loggedInUserId);

      setIsLoading(false);
    };
    fetchProfileData();
  }, [id, artisanId]); 

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setArtisan(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          alert(t.gpsSuccess);
        },
        (error) => {
          alert(t.gpsError);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert(t.gpsError);
    }
  };

  // --- دوال البروفايل الأساسية ---
  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('suppliers').update({
      store_name: artisan.store_name,
      category: artisan.category,
      address: artisan.address,
      about_text: artisan.about_text,
      latitude: artisan.latitude,  
      longitude: artisan.longitude 
    }).eq('id', artisan.id);

    if (!error) setIsEditing(false);
    setIsSaving(false);
  };

  const handleAddService = async () => {
  if (!newService.service_name || !newService.starting_price) return;
  
  const { data } = await supabase.from('provider_services').insert({
    provider_id: artisan.id, 
    service_name: newService.service_name, 
    description: newService.description, 
    starting_price: newService.starting_price,
    flash_discount_price: newService.flash_discount_price ? Number(newService.flash_discount_price) : null,
    flash_expires_at: newService.flash_expires_at || null
  }).select().single();

  if (data) {
    setServices([...services, data]);
    setNewService({ 
      service_name: '', 
      description: '', 
      starting_price: '', 
      flash_discount_price: '', 
      flash_expires_at: '' 
    }); 
    setIsAddingService(false); 
  }
};

  const handleDeleteService = async (serviceId) => {
    if (window.confirm(t.deleteConfirmService)) {
      await supabase.from('provider_services').delete().eq('id', serviceId);
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleRequestQuote = (service = null) => {
    const requestPayload = {
      items: [{
        product: {
          name: service ? service.service_name : t.generalQuote,
          supplier: artisan.store_name || t.artisanName,
          price: service ? service.starting_price : 0,
          currency: 'MAD'
        },
        qty: 1
      }],
      isServiceRequest: true,
      artisanId: artisan.id
    };
    navigate('/v2/messages', { state: { cartOrder: requestPayload } });
  };

  const handleUploadImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'logo') setIsUploadingLogo(true);
    else if (type === 'cover') setIsUploadingCover(true);
    else setIsUploadingPortfolio(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${artisan.id}/${type}/${fileName}`;

      let { error: uploadError } = await supabase.storage.from('supplier-images').upload(filePath, file);

      if (!uploadError) {
        const { data } = supabase.storage.from('supplier-images').getPublicUrl(filePath);
        if (data && data.publicUrl) {
           if (type === 'portfolio') {
             const { data: newPortfolioItem } = await supabase.from('provider_portfolio').insert({
               provider_id: artisan.id, image_url: data.publicUrl
             }).select().single();
             if (newPortfolioItem) setPortfolio([...portfolio, newPortfolioItem]);
           } else {
             const updateField = type === 'logo' ? { logo_url: data.publicUrl } : { cover_url: data.publicUrl };
             await supabase.from('suppliers').update(updateField).eq('id', artisan.id);
             setArtisan(prev => ({ ...prev, ...updateField }));
           }
        }
      }
    } catch (err) { console.error(err); } 
    finally {
      setIsUploadingLogo(false); setIsUploadingCover(false); setIsUploadingPortfolio(false);
    }
  };

  const handleDeletePortfolioImage = async (imageId) => {
    if (window.confirm(t.deleteConfirmPhoto)) {
      await supabase.from('provider_portfolio').delete().eq('id', imageId);
      setPortfolio(portfolio.filter(p => p.id !== imageId));
    }
  };

  // --- دوال التقييمات ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (selectedRating === 0) return;

    setIsSubmittingReview(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert(t.reviewForm.loginRequired);
      setIsSubmittingReview(false);
      return;
    }

    if (user.id === artisan.id) {
      alert(t.reviewForm.selfReview);
      setIsSubmittingReview(false);
      return;
    }

    try {
      const { data: newRev, error } = await supabase.from('reviews').insert({
        provider_id: artisan.id,
        user_id: user.id,
        rating: selectedRating,
        comment: reviewComment.trim() || null
      }).select().single();

      if (error) {
        if (error.code === '23505') {
          alert(t.reviewForm.alreadyReviewed);
        } else {
          throw error;
        }
        setIsSubmittingReview(false);
        return;
      }

      if (selectedRating <= 2) {
        await supabase.from('admin_alerts').insert({
          review_id: newRev ? newRev.id : null,
          provider_id: artisan.id,
          user_id: user.id,
          issue_type: 'تقييم منخفض جداً',
          details: `تقييم بـ ${selectedRating} نجوم. التعليق: ${reviewComment || 'بدون تعليق'}`,
          status: 'pending'
        });
      }

      const updatedReviews = [newRev, ...reviewsList];
      const avgRating = (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1);
      
      await supabase.from('suppliers').update({
        rating: parseFloat(avgRating),
        reviews_count: updatedReviews.length
      }).eq('id', artisan.id);

      setArtisan(prev => ({ ...prev, rating: avgRating, reviews_count: updatedReviews.length }));
      setReviewComment('');
      setSelectedRating(0);
      setHasReviewed(true);
      fetchReviews(artisan.id, user.id);

      alert(selectedRating <= 2 ? t.reviewForm.submitWarning : t.reviewForm.submitSuccess);

    } catch (err) {
      console.error("Error submitting review:", err);
      alert(t.reviewForm.submitError + ": " + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert(t.reviewForm.loginRequired);
      return;
    }

    const hasVoted = userVotedReviews.has(reviewId);

    try {
      if (hasVoted) {
        await supabase.from('review_votes').delete().eq('review_id', reviewId).eq('user_id', user.id);
        setUserVotedReviews(prev => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
        setReviewVotesMap(prev => ({ ...prev, [reviewId]: Math.max(0, (prev[reviewId] || 1) - 1) }));
      } else {
        await supabase.from('review_votes').insert({ review_id: reviewId, user_id: user.id, is_helpful: true });
        setUserVotedReviews(prev => new Set(prev).add(reviewId));
        setReviewVotesMap(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
      }
    } catch (err) {
      console.error("Error toggling vote:", err);
    }
  };

  const isOwner = currentUserId === artisan.id;
  const bgMain = isDarkMode ? 'bg-slate-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const defaultCover = artisan.cover_url || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200";
  const defaultAvatar = artisan.logo_url || (artisan.store_name ? `https://ui-avatars.com/api/?name=${artisan.store_name}&background=10b981&color=fff` : "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400");

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-emerald-500" size={50} /></div>;

  // --- منطق جواز الثقة (Trust Passport Logic) ---
  
  // تحديد المستوى
  let currentLevelLabel = t.levels.basic;
  let levelColor = "text-slate-500";
  
  if (artisan.tier === 'pro') {
    currentLevelLabel = t.levels.pro;
    levelColor = "text-blue-500";
  } else if (artisan.tier === 'business') {
    currentLevelLabel = t.levels.business;
    levelColor = "text-emerald-500";
  }

  // التحقق من المعايير
  // نفترض أن قاعدة البيانات تخزن هذه القيم، وإلا نضع قيماً افتراضية منطقية للتحقق
  const isIdVerified = artisan.is_id_verified || false; 
  const isBizVerified = artisan.is_biz_verified || false;
  const isPhoneVerified = artisan.phone ? true : false; // مجرد مثال، يُفضل حقل صريح
  const isAddressVerified = artisan.address || artisan.latitude ? true : false;
  const isPortfolioVerified = portfolio.length > 0;
  
  // معايير جديدة مبنية على الأداء
  const hasPositiveReviews = artisan.rating >= 4.0 && artisan.reviews_count > 0;
  const hasCompletedProjects = (artisan.completed_projects || 0) > 0;
  // لنفترض أن معدل الإتمام مخزن في قاعدة البيانات، وإلا نحسبه أو نستخدم قيمة افتراضية
  const completionRate = artisan.completion_rate || 0; 
  const hasGoodCompletionRate = completionRate >= 90;

  // مكون فرعي لعنصر في قائمة التحقق
  const VerificationItem = ({ label, isVerified }) => (
    <li className={`flex items-center gap-3 ${isVerified ? textTitle : textMuted}`}>
      {isVerified ? (
        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
      ) : (
        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xs"><Lock size={12}/></span>
      )}
      <span className={isVerified ? 'font-bold' : 'line-through opacity-70'}>{label}</span>
    </li>
  );


  return (
    <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 md:p-10" onClick={onClose}>
      <div 
        className={`w-full max-w-6xl mx-auto shadow-2xl overflow-hidden ${bgMain} flex flex-col rounded-3xl animate-fade-in relative`} 
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={e => e.stopPropagation()} 
      >
        <div className="relative h-64 md:h-80 w-full bg-slate-800 group">
          <img src={defaultCover} alt="Cover" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          {isOwner && isEditing && (
              <label className="absolute top-6 left-6 z-50 bg-black/50 text-white p-3 rounded-full cursor-pointer hover:bg-black/70 transition" title="تغيير الغلاف">
                  {isUploadingCover ? <Loader2 className="animate-spin" size={20}/> : <Camera size={20} />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'cover')} />
              </label>
          )}

          {isOwner && (
            <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} z-50`}>
              {isEditing ? (
                <button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} {t.actions.save}
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="bg-slate-900/80 backdrop-blur border-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg">
                  <Edit size={18} /> {t.actions.edit}
                </button>
              )}
            </div>
          )}

          {onClose && (
            <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110`}>
              <X size={24} />
            </button>
          )}
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex items-end gap-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1 shrink-0 shadow-xl z-10 group/avatar">
              <img src={defaultAvatar} alt={artisan.store_name} className="w-full h-full rounded-xl object-cover" />
              
              {isOwner && isEditing && (
                   <label className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity" title="تغيير الشعار">
                       {isUploadingLogo ? <Loader2 className="animate-spin text-white" size={24}/> : <Camera className="text-white" size={24} />}
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'logo')} />
                   </label>
              )}

              {(artisan.tier === 'pro' || artisan.tier === 'business') && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                  <ShieldCheck size={20} />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                {isEditing ? (
                  <input type="text" placeholder={t.placeholders.name} value={artisan.store_name || ''} onChange={e => setArtisan({...artisan, store_name: e.target.value})} className="bg-slate-900/80 border border-slate-500 rounded px-3 py-1 text-2xl font-black text-white outline-none focus:border-emerald-500 placeholder-slate-400 w-full md:w-96" />
                ) : (
                  <h1 className="text-2xl md:text-3xl font-black text-white">{artisan.store_name || t.artisanName}</h1>
                )}
                
                {!isEditing && (
                  <span className={`bg-${levelColor.split('-')[1]}-500/20 ${levelColor} border border-${levelColor.split('-')[1]}-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1`}>
                    <Award size={14} /> {currentLevelLabel}
                  </span>
                )}
              </div>
              
              {isEditing ? (
                <input type="text" placeholder={t.placeholders.category} value={artisan.category || ''} onChange={e => setArtisan({...artisan, category: e.target.value})} className="bg-slate-900/80 border border-slate-500 rounded px-3 py-1 mb-2 text-sm text-emerald-400 outline-none focus:border-emerald-500 block w-full md:w-80 placeholder-slate-400" />
              ) : (
                <p className="text-emerald-400 font-bold text-sm md:text-base mb-2">{artisan.category || t.unspecified}</p>
              )}
                <div className="flex flex-wrap items-start gap-4 text-sm text-slate-300 mt-2">
                {isEditing ? (
                  <div className="flex flex-col gap-2 w-full md:w-80">
                    <input type="text" placeholder={t.placeholders.address} value={artisan.address || ''} onChange={e => setArtisan({...artisan, address: e.target.value})} className="bg-slate-900/80 border border-slate-500 rounded px-3 py-1 text-white outline-none focus:border-emerald-500 placeholder-slate-400" />
                    
                    {/* زر تحديد الموقع الجديد (GPS) */}
                    <button type="button" onClick={handleGetLocation} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 rounded px-3 py-2 text-xs font-bold transition-colors shadow-sm">
                       <Navigation size={14} /> {t.gpsBtn}
                    </button>
                    
                    {/* رسالة نجاح التقاط الإحداثيات */}
                    {artisan.latitude && artisan.longitude && (
                       <span className="text-emerald-400 text-[10px] font-bold">✓ تم تسجيل الإحداثيات ({artisan.latitude.toFixed(4)}, {artisan.longitude.toFixed(4)})</span>
                    )}
                  </div>
                ) : (
                  <span className="flex items-center gap-1"><MapPin size={16} /> {artisan.address || t.noAddress}</span>
                )}
                {!isEditing && <span className="flex items-center gap-1 text-amber-400"><Star size={16} className="fill-current" /> {artisan.rating || '0.0'} ({artisan.reviews_count || 0})</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row p-6 md:p-8 gap-8 bg-[#E6F4EA] dark:bg-slate-950">
          
          <div className="w-full lg:w-1/3 space-y-6">
            
            {!isOwner && !isEditing && (
              <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm">
                <button onClick={() => handleRequestQuote(null)} className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-lg">
                  <FileText size={20} /> {t.actions.quote}
                </button>
                <button onClick={() => navigate('/v2/messages')} className={`w-full py-3.5 rounded-xl font-bold transition-colors border-2 flex items-center justify-center gap-2 text-lg ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-800'}`}>
                  <MessageSquare size={20} /> {t.actions.contact}
                </button>
              </div>
            )}

            {/* --- جواز الثقة الديناميكي --- */}
            <div className={`p-6 rounded-2xl border ${bgCard} shadow-sm`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full bg-${levelColor.split('-')[1]}-500/10 flex items-center justify-center ${levelColor}`}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className={`font-black text-lg ${textTitle}`}>{t.trustPassport}</h3>
                  <p className={`text-xs ${textMuted}`}>{t.level} <span className={`${levelColor} font-bold`}>{currentLevelLabel}</span></p>
                </div>
              </div>
              
              <ul className="space-y-4 text-sm">
                {/* البنود الأساسية */}
                <VerificationItem label={t.verifiedId} isVerified={isIdVerified} />
                <VerificationItem label={t.verifiedBiz} isVerified={isBizVerified} />
                <VerificationItem label={t.verifiedPhone} isVerified={isPhoneVerified} />
                <VerificationItem label={t.verifiedAddress} isVerified={isAddressVerified} />
                <VerificationItem label={t.verifiedPortfolio} isVerified={isPortfolioVerified} />
                
                {/* البنود المبنية على الأداء (الجديدة) */}
                <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
                <VerificationItem label={t.positiveReviews} isVerified={hasPositiveReviews} />
                <VerificationItem label={t.completedProjects} isVerified={hasCompletedProjects} />
                <VerificationItem label={t.completionRate} isVerified={hasGoodCompletionRate} />
              </ul>
            </div>

            <div className={`p-6 rounded-2xl border ${bgCard} shadow-sm grid grid-cols-2 gap-4`}>
              <div>
                <p className={`text-xs ${textMuted} mb-1 font-bold`}>{t.stats.completed}</p>
                <p className={`font-black text-xl ${textTitle}`}>{artisan.completed_projects || 0}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted} mb-1 font-bold`}>{t.stats.responseRate}</p>
                <p className={`font-black text-xl text-emerald-500`} dir="ltr">{artisan.response_rate || '100'}%</p>
              </div>
              <div className="col-span-2">
                <p className={`text-xs ${textMuted} mb-1 font-bold`}>{t.stats.responseTime}</p>
                <p className={`font-black text-xl ${textTitle}`} dir="ltr">{artisan.response_time || t.notDetermined}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
            
            <div className={`flex overflow-x-auto custom-scrollbar gap-2 mb-6 p-1 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
              {[
                { id: 'services', label: t.tabs.services, icon: Briefcase },
                { id: 'portfolio', label: t.tabs.portfolio, icon: ImageIcon },
                { id: 'reviews', label: t.tabs.reviews, icon: Star }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id ? 'border-emerald-500 text-emerald-500' : `border-transparent ${textMuted} hover:${textTitle}`
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

           <div className="flex-1">
              
  {activeTab === 'services' && (
    <div className="animate-fade-in space-y-6">
      
      {/* 1. قسم النبذة التعريفي (À propos) */}
      <div>
        <h3 className={`font-black text-lg mb-2 ${textTitle}`}>{t.about}</h3>
        {isEditing ? (
          <textarea value={artisan.about_text || ''} onChange={e => setArtisan({...artisan, about_text: e.target.value})} className={`w-full ${bgCard} border rounded-xl p-3 h-32 outline-none focus:border-emerald-500 text-sm font-medium`} placeholder={t.placeholders.aboutDesc} />
        ) : (
          <p className={`text-sm leading-relaxed ${textMuted} font-medium`}>{artisan.about_text || t.noDesc}</p>
        )}
      </div>
      
      {/* 🌟 قمنا بحذف شرط isEditing من هنا لكي يظهر الزر دائماً 🌟 */}
      <SmartVoiceService 
        isDarkMode={isDarkMode} 
        language={language}
        isOwner={true} 
        onPublish={handlePublishAIService}
        onManualClick={() => {
          setIsEditing(true);        
          setIsAddingService(true); 
        }} 
      />

      {/* 3. الاستمارة اليدوية الكلاسيكية (تظهر فقط عند الضغط على زر "يدوي") */}
      {isEditing && isAddingService && (
        <div className={`p-5 rounded-2xl border-2 border-emerald-500/50 mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-emerald-50/50'}`}>
          <h4 className={`font-bold text-sm mb-4 flex items-center gap-2 ${textTitle}`}><Plus size={16}/> {t.addService}</h4>
          
          {/* الحقول الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder={t.serviceNamePlaceholder} value={newService.service_name} onChange={e => setNewService({...newService, service_name: e.target.value})} className={`border rounded-xl p-3 text-sm outline-none focus:border-emerald-500 font-bold ${bgCard} ${textTitle}`} />
            <input type="number" placeholder={t.pricePlaceholder} value={newService.starting_price} onChange={e => setNewService({...newService, starting_price: e.target.value})} className={`border rounded-xl p-3 text-sm outline-none focus:border-emerald-500 font-bold ${bgCard} ${textTitle}`} dir="ltr" />
          </div>
          <input type="text" placeholder={t.descPlaceholder} value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className={`border rounded-xl p-3 text-sm w-full mb-4 outline-none focus:border-emerald-500 font-bold ${bgCard} ${textTitle}`} />

          {/* قسم إعداد الـ Flash Deal */}
          <div className="mb-4 p-4 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl">
            <h5 className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-1">
              <Zap size={14} /> {t.flashDealTitle}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="number" placeholder={t.flashPricePlaceholder} value={newService.flash_discount_price} onChange={e => setNewService({...newService, flash_discount_price: e.target.value})} className={`border rounded-xl p-2 text-sm outline-none focus:border-red-500 font-bold ${bgCard} ${textTitle}`} dir="ltr" />
              <input type="datetime-local" value={newService.flash_expires_at} onChange={e => setNewService({...newService, flash_expires_at: e.target.value})} className={`border rounded-xl p-2 text-sm outline-none focus:border-red-500 font-bold ${bgCard} ${textTitle} text-slate-500`} />
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="flex gap-3">
            <button type="button" onClick={handleAddService} className="flex-1 bg-emerald-500 text-white rounded-xl py-3 text-sm font-bold hover:bg-emerald-600">{t.saveServiceBtn}</button>
            <button type="button" onClick={() => setIsAddingService(false)} className={`flex-1 rounded-xl py-3 text-sm font-bold ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{t.cancel}</button>
          </div>
        </div>
      )}

      {/* 4. عرض الخدمات المضافة */}
      {services.length > 0 ? (
        <div className="space-y-4">
          {services.map(service => (
            <div key={service.id} className={`p-5 rounded-2xl border ${bgCard} hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center justify-between gap-4 group`}>
              <div className="flex-1">
                <h4 className={`font-bold text-lg mb-1 ${textTitle}`}>{service.service_name}</h4>
                <p className={`text-sm ${textMuted} mb-3 font-medium`}>{service.description}</p>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>{t.startingFrom} {service.starting_price} MAD</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {isEditing ? (
                  <button type="button" onClick={() => handleDeleteService(service.id)} className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-xl transition-colors"><Trash2 size={18}/></button>
                ) : (
                  <button type="button" onClick={() => handleRequestQuote(service)} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md shadow-emerald-500/20">
                    {t.actions.quote}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-sm ${textMuted} p-6 text-center border rounded-xl border-dashed font-bold`}>{t.emptyServices}</p>
      )}
    </div>
  )}

              {activeTab === 'portfolio' && (
                <div className="animate-fade-in space-y-6">
                  {isEditing && (
                    <label className="w-full border-2 border-dashed border-emerald-500/50 bg-emerald-50/30 dark:bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-emerald-50/80 transition-colors">
                       {isUploadingPortfolio ? <Loader2 className="animate-spin text-emerald-500" size={32}/> : <UploadCloud className="text-emerald-500" size={32}/>}
                       <span className="font-bold text-emerald-600">{t.addPhoto}</span>
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'portfolio')} disabled={isUploadingPortfolio} />
                    </label>
                  )}

                  {portfolio.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {portfolio.map(img => (
                        <div key={img.id} className="aspect-square rounded-2xl overflow-hidden bg-slate-200 group relative border shadow-sm">
                          <img src={img.image_url} alt="Portfolio" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          {isEditing && (
                            <button onClick={() => handleDeletePortfolioImage(img.id)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-10">
                      <ImageIcon size={48} className={`mx-auto mb-4 opacity-20 ${textMuted}`} />
                      <p className={`${textMuted} font-bold`}>{t.portfolioEmpty}</p>
                    </div>
                  )}
                </div>
              )}

            {/* REVIEWS TAB - نظام التقييمات الذكي */}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in space-y-6">
                
                {/* 1. نموذج إضافة تقييم */}
                {!isOwner && (
                  <div className={`p-6 rounded-2xl border ${bgCard} shadow-sm`}>
                    <h3 className={`font-black text-lg mb-3 ${textTitle}`}>
                      {t.reviewForm.title}
                    </h3>

                    {hasReviewed ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm font-bold">
                        {t.reviewForm.alreadyReviewed}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <p className={`text-sm font-bold mb-2 ${textMuted}`}>
                            {t.reviewForm.howDoYouRate}
                          </p>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setSelectedRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 transition-transform hover:scale-125 focus:outline-none"
                              >
                                <Star
                                  size={28}
                                  className={`${
                                    (hoverRating || selectedRating) >= star
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-300 dark:text-slate-600'
                                  } transition-colors`}
                                />
                              </button>
                            ))}
                            {selectedRating > 0 && (
                              <span className="text-sm font-bold text-amber-500 mr-2">
                                ({selectedRating} / 5)
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder={t.reviewForm.commentPlaceholder}
                            className={`w-full p-3 rounded-xl border text-sm outline-none focus:border-emerald-500 ${
                              isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                            }`}
                            rows={3}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingReview || selectedRating === 0}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
                        >
                          {isSubmittingReview ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            `✅ ${t.reviewForm.submitBtn}`
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 2. قائمة التقييمات السابقة */}
                <div className="space-y-4">
                  <h3 className={`font-black text-lg ${textTitle}`}>
                    {t.reviewsTitle} ({reviewsList.length})
                  </h3>

                  {reviewsList.length > 0 ? (
                    reviewsList.map((review) => {
                      const reviewerName = review.profiles?.full_name || (language === 'ar' ? 'مستخدم SouqBTP' : 'Utilisateur SouqBTP');
                      const reviewDate = new Date(review.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR');
                      const helpfulVotes = reviewVotesMap[review.id] || 0;
                      const hasVoted = userVotedReviews.has(review.id);

                      return (
                        <div key={review.id} className={`p-5 rounded-2xl border ${bgCard} shadow-sm space-y-3`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-bold text-sm ${textTitle}`}>{reviewerName}</h4>
                              <div className="flex items-center gap-1 mt-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">{reviewDate}</span>
                          </div>

                          {review.comment ? (
                            <p className={`text-sm leading-relaxed ${textMuted} bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800`}>
                              "{review.comment}"
                            </p>
                          ) : (
                            <p className="text-xs italic text-slate-400">
                              {language === 'ar' ? 'تقييم بالنجوم فقط بدون تعليق' : 'Évaluation sans commentaire'}
                            </p>
                          )}

                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => handleToggleHelpful(review.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                hasVoted
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : 'bg-transparent text-slate-500 hover:text-emerald-500 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <ThumbsUp size={13} />
                              {t.helpful} {helpfulVotes > 0 && `(${helpfulVotes})`}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10">
                      <Star size={48} className="mx-auto mb-3 opacity-20 text-slate-400" />
                      <p className={`${textMuted} font-bold`}>
                        {language === 'ar' 
                          ? 'لا توجد تقييمات لهذا الحرفي حتى الآن. كن أول من يقيّمه!' 
                          : language === 'fr'
                          ? 'Aucun avis pour le moment. Soyez le premier à donner votre avis !'
                          : 'No reviews yet. Be the first to leave a review!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}