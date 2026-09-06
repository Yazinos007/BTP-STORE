import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Store, CheckCircle2, Zap, ArrowRight, Minus, Loader2, Shield } from 'lucide-react';
// 👇 استدعاء مكون الدفع (تأكد من صحة المسار حسب بنية مجلداتك)
import PaymentModal from '../components/PaymentModal'; 

const translations = {
  ar: {
    title: 'طور متجرك إلى المستوى التالي',
    subtitle: 'انتقل من الإدارة التقليدية إلى الإدارة الرقمية الذكية. اختر الباقة التي تضاعف مبيعاتك وتضمن أموالك.',
    monthly: 'دفع شهري',
    annual: 'دفع سنوي',
    save20: 'وفر 20%',
    currency: 'درهم',
    mo: '/ شهر',
    yr: '/ سنة',
    currentPlan: 'باقتك الحالية',
    upgradeBtn: 'اشترك الآن',
    contactSales: 'تواصل معنا',
    successMsg: 'تم إرسال طلب الترقية بنجاح! سنقوم بمراجعة الوصل وتفعيل الباقة قريباً.', // تم التعديل
    errorActivation: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.',
    errorConnection: 'خطأ في الاتصال بالخادم.',
    plans: {
      basic: {
        name: 'البداية (Basic)',
        desc: 'مثالية للمحلات الصغيرة لإدارة المبيعات اليومية ببساطة.',
        features: [
          'نقطة بيع سريعة (POS)',
          'إدارة المخزون الأساسية',
          'تسجيل حتى 50 عميل',
          'طباعة الفواتير والوصولات',
        ],
        missing: ['إدارة الديون (الكريدي)', 'الـ CRM الذكي (واتساب)', 'تعدد الصناديق (Caisses)']
      },
      premium: {
        name: 'التاجر الذكي (Premium)',
        badge: 'الأكثر اختياراً',
        desc: 'الحل المتكامل لإدارة الديون، العملاء، ومضاعفة الأرباح.',
        features: [
          'كل ميزات باقة البداية',
          'إدارة الديون وتتبع الكريدي بدقة',
          'نظام الـ CRM (فرز العملاء)',
          'مراسلة العملاء عبر الواتساب للتحصيل',
          'إدارة المصاريف اليومية',
          'عملاء ومنتجات غير محدودة'
        ],
        missing: ['التقارير الضريبية المتقدمة', 'إدارة الموارد البشرية (HR)']
      },
      pro: {
        name: 'المتجر الشامل (Pro)',
        badge: 'للمتاجر الكبرى',
        desc: 'نظام إدارة موارد كامل (ERP) للمتاجر ذات الحركة الكثيفة.',
        features: [
          'كل ميزات باقة التاجر الذكي',
          'التقارير الضريبية والمحاسبة (Accounting)',
          'إدارة الموارد البشرية وسلفيات العمال',
          'إدارة صناديق متعددة (Multi-Caisses)',
          'تصدير التقارير للمحاسب (Fiduciaire)',
          'دعم فني أولوية 24/7'
        ],
        missing: []
      }
    }
  },
  fr: {
    title: 'Passez au Niveau Supérieur',
    subtitle: 'Passez de la gestion traditionnelle à l\'ère numérique. Choisissez le plan qui sécurise votre argent.',
    monthly: 'Mensuel',
    annual: 'Annuel',
    save20: 'Économisez 20%',
    currency: 'MAD',
    mo: '/ mois',
    yr: '/ an',
    currentPlan: 'Votre plan actuel',
    upgradeBtn: 'S\'abonner',
    contactSales: 'Nous contacter',
    successMsg: 'Votre demande a été envoyée avec succès ! Nous allons vérifier le reçu et activer votre plan sous peu.', // تم التعديل
    errorActivation: 'Erreur lors de l\'envoi. Veuillez réessayer plus tard.',
    errorConnection: 'Erreur de connexion au serveur.',
    plans: {
      basic: {
        name: 'Basic POS',
        desc: 'Idéal pour les petits commerces pour gérer les ventes quotidiennes.',
        features: [
          'Point de Vente rapide (POS)',
          'Gestion basique du stock',
          'Jusqu\'à 50 clients',
          'Impression des tickets/factures',
        ],
        missing: ['Gestion des Crédits', 'CRM Intelligent (WhatsApp)', 'Multi-Caisses']
      },
      premium: {
        name: 'Premium Shop',
        badge: 'Le plus choisi',
        desc: 'La solution complète pour gérer les crédits, les clients et les profits.',
        features: [
          'Toutes les options Basic',
          'Gestion précise des crédits clients',
          'Système CRM (Segmentation)',
          'Relance WhatsApp automatisée',
          'Gestion des dépenses',
          'Clients et produits illimités'
        ],
        missing: ['Rapports Fiscaux', 'Ressources Humaines (HR)']
      },
      pro: {
        name: 'Pro Retailer',
        badge: 'Grands Commerces',
        desc: 'Un système ERP complet pour les magasins à fort trafic.',
        features: [
          'Toutes les options Premium',
          'Comptabilité et Fiscalité',
          'Gestion RH et avances employés',
          'Gestion Multi-Caisses',
          'Export direct pour le Comptable',
          'Support prioritaire 24/7'
        ],
        missing: []
      }
    }
  },
  en: {
    title: 'Take Your Store to the Next Level',
    subtitle: 'Move from traditional to smart digital management. Choose the plan that multiplies your sales and secures your money.',
    monthly: 'Monthly',
    annual: 'Annually',
    save20: 'Save 20%',
    currency: 'MAD',
    mo: '/ month',
    yr: '/ year',
    currentPlan: 'Your current plan',
    upgradeBtn: 'Subscribe Now',
    contactSales: 'Contact Us',
    successMsg: 'Request sent successfully! We will verify the receipt and activate your plan shortly.', // تم التعديل
    errorActivation: 'Error during submission. Please try again later.',
    errorConnection: 'Connection error to the server.',
    plans: {
      basic: {
        name: 'Basic POS',
        desc: 'Ideal for small shops to manage daily sales simply.',
        features: [
          'Fast Point of Sale (POS)',
          'Basic inventory management',
          'Register up to 50 clients',
          'Print invoices and receipts',
        ],
        missing: ['Credit management', 'Smart CRM (WhatsApp)', 'Multi-Caisses']
      },
      premium: {
        name: 'Premium Shop',
        badge: 'Most Popular',
        desc: 'The complete solution to manage credits, clients, and multiply profits.',
        features: [
          'All Basic features',
          'Precise credit tracking',
          'CRM System (Segmentation)',
          'Automated WhatsApp reminders',
          'Daily expenses management',
          'Unlimited clients and products'
        ],
        missing: ['Advanced tax reports', 'Human Resources (HR)']
      },
      pro: {
        name: 'Pro Retailer',
        badge: 'For Large Stores',
        desc: 'A complete ERP system for high-traffic stores.',
        features: [
          'All Premium features',
          'Accounting and Taxation',
          'HR management and employee advances',
          'Multi-Caisses management',
          'Direct export for Accountant',
          'Priority 24/7 support'
        ],
        missing: []
      }
    }
  }
};

export default function RetailerSubscription() {
  const { language } = useSettingsStore();
  const { updateProfile } = useSupplierStore();
  const t = translations[language] || translations['fr'];
  
  const [isAnnual, setIsAnnual] = useState(true);
  // 👇 متغيرات التحكم في النافذة المنبثقة
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const navigate = useNavigate();

  const prices = {
    basic: { monthly: 0, annual: 0 },
    premium: { monthly: 149, annual: 1430 }, 
    pro: { monthly: 299, annual: 2870 } 
  };

  // 👇 دالة فتح النافذة
  const handleUpgradeClick = (tierCode, planName, planPrice) => {
    setSelectedPlan({ tier: tierCode, name: planName, price: planPrice });
    setShowPaymentModal(true);
  };

  // 👇 دالة تنفيذ الطلب بعد رفع الوصل
  const handlePaymentSubmit = async (plan, method, file) => {
    try {
      // هنا مستقبلاً ستقوم برفع الصورة `file` إلى Supabase Storage 
      // وإدراج سطر في جدول `upgrade_requests`
      
      alert(t.successMsg);
      setShowPaymentModal(false);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert(t.errorConnection);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in text-gray-800 pb-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex justify-center items-center gap-3">
          <Store className="text-blue-600" size={40} />
          {t.title}
        </h2>
        <p className="text-lg text-gray-500 font-medium leading-relaxed">{t.subtitle}</p>

        <div className="flex items-center justify-center mt-8">
          <div className="bg-gray-100 border border-gray-200 p-1.5 rounded-2xl inline-flex items-center relative select-none">
            <button onClick={() => setIsAnnual(false)} className={`relative z-10 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${!isAnnual ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.monthly}
            </button>
            <button onClick={() => setIsAnnual(true)} className={`relative z-10 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${isAnnual ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.annual}
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${isAnnual ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-100 text-emerald-600'}`}>{t.save20}</span>
            </button>
            <div className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white border border-gray-200 rounded-xl transition-all duration-300 ease-out shadow-sm" style={{ [language === 'ar' ? 'right' : 'left']: isAnnual ? 'calc(50% + 3px)' : '6px' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
        {/* Basic Plan */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 relative">
          <h3 className="text-2xl font-black text-gray-900 mb-2">{t.plans.basic.name}</h3>
          <p className="text-sm text-gray-500 font-medium h-12 mb-6 leading-relaxed">{t.plans.basic.desc}</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-gray-900">0</span>
            <span className="text-gray-500 font-bold ml-2">{t.currency} {isAnnual ? t.yr : t.mo}</span>
          </div>
          <button disabled className="w-full py-3.5 bg-gray-100 text-gray-400 font-black rounded-xl cursor-not-allowed border border-gray-200 mb-8 text-sm">{t.currentPlan}</button>
          <div className="space-y-4">
            {t.plans.basic.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /><span className="text-sm font-medium text-gray-700">{feat}</span></div>
            ))}
            {t.plans.basic.missing.map((feat, i) => (
              <div key={`m-${i}`} className="flex items-start gap-3 opacity-40"><Minus size={18} className="text-gray-400 shrink-0 mt-0.5" /><span className="text-sm font-medium text-gray-400 line-through">{feat}</span></div>
            ))}
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-white border-2 border-blue-600 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-blue-900/10 transition-all duration-300">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">{t.plans.premium.badge}</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">{t.plans.premium.name}</h3>
          <p className="text-sm text-gray-500 font-medium h-12 mb-6 leading-relaxed">{t.plans.premium.desc}</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-blue-600">{isAnnual ? prices.premium.annual.toLocaleString() : prices.premium.monthly.toLocaleString()}</span>
            <span className="text-gray-500 font-bold ml-2">{t.currency} {isAnnual ? t.yr : t.mo}</span>
          </div>
          {/* 👇 تعديل زر الترقية لفتح النافذة */}
          <button 
            onClick={() => handleUpgradeClick('Premium', t.plans.premium.name, isAnnual ? prices.premium.annual : prices.premium.monthly)} 
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/30 mb-8 flex justify-center items-center gap-2 group text-sm"
          >
            <Zap size={18} className="fill-white" /> {t.upgradeBtn} <ArrowRight size={16} className={`group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
          </button>
          <div className="space-y-4">
            {t.plans.premium.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" /><span className="text-sm font-bold text-gray-800">{feat}</span></div>
            ))}
            {t.plans.premium.missing.map((feat, i) => (
              <div key={`m-${i}`} className="flex items-start gap-3 opacity-40"><Minus size={18} className="text-gray-400 shrink-0 mt-0.5" /><span className="text-sm font-medium text-gray-400 line-through">{feat}</span></div>
            ))}
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 relative hover:shadow-xl transition-all duration-300">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">{t.plans.pro.badge}</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">{t.plans.pro.name}</h3>
          <p className="text-sm text-gray-500 font-medium h-12 mb-6 leading-relaxed">{t.plans.pro.desc}</p>
          <div className="mb-8">
            <span className="text-5xl font-black text-gray-900">{isAnnual ? prices.pro.annual.toLocaleString() : prices.pro.monthly.toLocaleString()}</span>
            <span className="text-gray-500 font-bold ml-2">{t.currency} {isAnnual ? t.yr : t.mo}</span>
          </div>
          {/* 👇 تعديل زر الترقية لفتح النافذة */}
          <button 
            onClick={() => handleUpgradeClick('pro', t.plans.pro.name, isAnnual ? prices.pro.annual : prices.pro.monthly)} 
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-black rounded-xl transition-all shadow-lg mb-8 flex justify-center items-center gap-2 text-sm"
          >
            <Shield size={16} /> {t.upgradeBtn}
          </button>
          <div className="space-y-4">
            {t.plans.pro.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3"><CheckCircle2 size={18} className="text-gray-800 shrink-0 mt-0.5" /><span className="text-sm font-bold text-gray-800">{feat}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* 👇 استدعاء النافذة المنبثقة */}
      {showPaymentModal && (
        <PaymentModal 
          plan={selectedPlan}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
}