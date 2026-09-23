import React, { useState } from 'react';
import { 
  ShieldCheck, MapPin, Star, Clock, CheckCircle2, 
  Image as ImageIcon, MessageSquare, Briefcase, 
  Award, Phone, FileText, ChevronRight, X, ThumbsUp
} from 'lucide-react';

export default function SupplierProfile({ isDarkMode, language, onClose }) {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('services');

  // قاموس الترجمات الخاص بملف المورد
  const t = {
    ar: {
      trustPassport: "جواز الثقة",
      level: "مستوى التحقق:",
      businessVerified: "شركة معتمدة",
      verifiedId: "هوية موثقة",
      verifiedBiz: "سجل تجاري موثق",
      verifiedPhone: "رقم هاتف موثق",
      verifiedAddress: "عنوان موثق",
      verifiedPortfolio: "أعمال سابقة موثقة",
      stats: {
        completed: "مشروع منجز",
        responseRate: "معدل الاستجابة",
        responseTime: "وقت الرد",
        memberSince: "عضو منذ"
      },
      tabs: {
        services: "الخدمات والأسعار",
        portfolio: "معرض الأعمال",
        reviews: "التقييمات"
      },
      actions: {
        quote: "طلب عرض سعر",
        contact: "مراسلة",
        close: "إغلاق"
      },
      about: "نبذة عن الشركة",
      portfolioEmpty: "لا توجد صور حالياً.",
      reviewsTitle: "آراء المقاولين"
    },
    fr: {
      trustPassport: "Passeport de Confiance",
      level: "Niveau :",
      businessVerified: "Entreprise Vérifiée",
      verifiedId: "Identité vérifiée",
      verifiedBiz: "RC vérifié",
      verifiedPhone: "Téléphone vérifié",
      verifiedAddress: "Adresse vérifiée",
      verifiedPortfolio: "Réalisations vérifiées",
      stats: {
        completed: "Chantiers",
        responseRate: "Taux de réponse",
        responseTime: "Temps de réponse",
        memberSince: "Membre depuis"
      },
      tabs: {
        services: "Services & Tarifs",
        portfolio: "Réalisations",
        reviews: "Avis clients"
      },
      actions: {
        quote: "Demander un devis",
        contact: "Contacter",
        close: "Fermer"
      },
      about: "À propos",
      portfolioEmpty: "Aucune photo pour le moment.",
      reviewsTitle: "Avis des entrepreneurs"
    },
    en: {
      trustPassport: "Trust Passport",
      level: "Level:",
      businessVerified: "Verified Business",
      verifiedId: "Verified ID",
      verifiedBiz: "Verified Business Reg.",
      verifiedPhone: "Verified Phone",
      verifiedAddress: "Verified Address",
      verifiedPortfolio: "Verified Portfolio",
      stats: {
        completed: "Completed Jobs",
        responseRate: "Response Rate",
        responseTime: "Response Time",
        memberSince: "Member Since"
      },
      tabs: {
        services: "Services & Pricing",
        portfolio: "Portfolio",
        reviews: "Reviews"
      },
      actions: {
        quote: "Request Quote",
        contact: "Contact",
        close: "Close"
      },
      about: "About",
      portfolioEmpty: "No photos available yet.",
      reviewsTitle: "Contractor Reviews"
    }
  }[language] || {};

  // ألوان وتنسيقات ديناميكية حسب الوضع الليلي
  const bgMain = isDarkMode ? 'bg-slate-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  // بيانات وهمية للمورد (يتم جلبها لاحقاً من قاعدة البيانات)
  const supplierData = {
    name: "Ahmed Électricité",
    category: "Électricité bâtiment",
    location: "Béni Mellal, Maroc",
    rating: 4.8,
    reviewsCount: 84,
    completedJobs: 127,
    responseRate: "98%",
    responseTime: "< 15 mins",
    memberSince: "2023",
    about: "Nous sommes spécialisés dans l'installation électrique résidentielle et industrielle. Avec plus de 10 ans d'expérience, nous garantissons un travail aux normes de sécurité en vigueur.",
    avatar: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400",
    cover: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200",
    trustLevel: "business", // 'basic', 'pro', 'business'
    portfolio: [
      "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400",
      "https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?w=400",
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400"
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm overflow-y-auto custom-scrollbar p-0 md:p-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`relative w-full max-w-5xl my-auto rounded-none md:rounded-3xl shadow-2xl overflow-hidden ${bgMain} flex flex-col`}>
        
        {/* زر الإغلاق */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors">
          <X size={20} />
        </button>

        {/* --- Header (Cover + Avatar + Basic Info) --- */}
        <div className="relative h-64 md:h-80 w-full bg-slate-800">
          <img src={supplierData.cover} alt="Cover" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex items-end gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1 shrink-0 shadow-xl z-10 relative">
              <img src={supplierData.avatar} alt={supplierData.name} className="w-full h-full rounded-xl object-cover" />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                <ShieldCheck size={20} />
              </div>
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-white">{supplierData.name}</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Award size={14} /> {t.businessVerified}
                </span>
              </div>
              <p className="text-emerald-400 font-bold text-sm md:text-base mb-2">{supplierData.category}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1"><MapPin size={16} /> {supplierData.location}</span>
                <span className="flex items-center gap-1 text-amber-400"><Star size={16} className="fill-current" /> {supplierData.rating} ({supplierData.reviewsCount} avis)</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Layout --- */}
        <div className="flex flex-col lg:flex-row p-6 md:p-8 gap-8">
          
          {/* Left Sidebar (Trust Passport & Stats) */}
          <div className="w-full lg:w-1/3 space-y-6">
            
            {/* Quick Actions (Mobile mainly, but good on desktop too) */}
            <div className="flex flex-col gap-3">
              <button className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <FileText size={18} /> {t.actions.quote}
              </button>
              <button className={`w-full py-3.5 rounded-xl font-bold transition-colors border-2 flex items-center justify-center gap-2 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-800'}`}>
                <MessageSquare size={18} /> {t.actions.contact}
              </button>
            </div>

            {/* TRUST PASSPORT */}
            <div className={`p-6 rounded-2xl border ${bgCard} shadow-sm`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className={`font-black text-lg ${textTitle}`}>{t.trustPassport}</h3>
                  <p className={`text-xs ${textMuted}`}>{t.level} <span className="text-emerald-500 font-bold">{t.businessVerified}</span></p>
                </div>
              </div>
              
              <ul className="space-y-4 text-sm">
                <li className={`flex items-center gap-3 ${textTitle}`}><CheckCircle2 size={18} className="text-emerald-500" /> {t.verifiedId}</li>
                <li className={`flex items-center gap-3 ${textTitle}`}><CheckCircle2 size={18} className="text-emerald-500" /> {t.verifiedBiz}</li>
                <li className={`flex items-center gap-3 ${textTitle}`}><CheckCircle2 size={18} className="text-emerald-500" /> {t.verifiedPhone}</li>
                <li className={`flex items-center gap-3 ${textTitle}`}><CheckCircle2 size={18} className="text-emerald-500" /> {t.verifiedAddress}</li>
                <li className={`flex items-center gap-3 ${textTitle}`}><CheckCircle2 size={18} className="text-emerald-500" /> {t.verifiedPortfolio}</li>
              </ul>
            </div>

            {/* STATS */}
            <div className={`p-6 rounded-2xl border ${bgCard} shadow-sm grid grid-cols-2 gap-4`}>
              <div>
                <p className={`text-xs ${textMuted} mb-1`}>{t.stats.completed}</p>
                <p className={`font-black text-xl ${textTitle}`}>{supplierData.completedJobs}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted} mb-1`}>{t.stats.responseRate}</p>
                <p className={`font-black text-xl text-emerald-500`}>{supplierData.responseRate}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted} mb-1`}>{t.stats.responseTime}</p>
                <p className={`font-black text-xl ${textTitle}`}>{supplierData.responseTime}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted} mb-1`}>{t.stats.memberSince}</p>
                <p className={`font-black text-xl ${textTitle}`}>{supplierData.memberSince}</p>
              </div>
            </div>

          </div>

          {/* Right Content Area (Tabs: Services, Portfolio, Reviews) */}
          <div className="flex-1 flex flex-col">
            
            {/* Tabs Navigation */}
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
                    activeTab === tab.id 
                      ? 'border-emerald-500 text-emerald-500' 
                      : `border-transparent ${textMuted} hover:${textTitle}`
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              
              {/* SERVICES TAB */}
              {activeTab === 'services' && (
                <div className="animate-fade-in space-y-6">
                  {/* About Section */}
                  <div>
                    <h3 className={`font-black text-lg mb-2 ${textTitle}`}>{t.about}</h3>
                    <p className={`text-sm leading-relaxed ${textMuted}`}>{supplierData.about}</p>
                  </div>
                  
                  {/* Sample Service Item (Reusing the visual language) */}
                  <div className={`p-5 rounded-2xl border ${bgCard} hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center justify-between gap-4`}>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-1 ${textTitle}`}>Installation Électrique Résidentielle</h4>
                      <p className={`text-sm ${textMuted} mb-2`}>Câblage complet, tableaux électriques, mise aux normes.</p>
                      <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">À partir de 250 MAD / m²</span>
                    </div>
                    <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                      {t.actions.quote}
                    </button>
                  </div>
                </div>
              )}

              {/* PORTFOLIO TAB */}
              {activeTab === 'portfolio' && (
                <div className="animate-fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {supplierData.portfolio.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-200 group cursor-pointer relative">
                        <img src={img} alt={`Portfolio ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="animate-fade-in space-y-4">
                  <div className={`p-4 rounded-xl border ${bgCard} flex items-start gap-4`}>
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className={`font-bold text-sm ${textTitle}`}>Entreprise Bâtir Plus</h5>
                        <span className="text-xs text-slate-400">Il y a 2 semaines</span>
                      </div>
                      <div className="flex text-amber-400 mb-2">
                        <Star size={12} className="fill-current"/><Star size={12} className="fill-current"/><Star size={12} className="fill-current"/><Star size={12} className="fill-current"/><Star size={12} className="fill-current"/>
                      </div>
                      <p className={`text-sm ${textMuted}`}>Excellente prestation. L'équipe d'Ahmed est très professionnelle et respecte les délais. Le travail est propre et conforme aux plans.</p>
                      <button className="mt-3 flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-500 transition-colors">
                        <ThumbsUp size={14} /> Utile (3)
                      </button>
                    </div>
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