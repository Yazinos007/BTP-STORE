import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { Timer, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

export default function RetailTrialBanner() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const navigate = useNavigate();
  
  // المدة 14 يوماً للتاجر
  const [daysLeft, setDaysLeft] = useState(14);
  const [isExpired, setIsExpired] = useState(false);

  const tier = supplier?.tier || 'premium';
  const isBasic = tier === 'starter' || tier === 'basic';

  useEffect(() => {
    if (isBasic) return;

    // مفتاح تخزين مختلف حتى لا يتداخل مع المورد
    const trialStartDate = localStorage.getItem('trial_start_date_retail');
    if (!trialStartDate) {
      localStorage.setItem('trial_start_date_retail', new Date().toISOString());
    } else {
      const start = new Date(trialStartDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const remaining = 14 - diffDays;
      
      if (remaining <= 0) {
        setDaysLeft(0);
        setIsExpired(true);
      } else {
        setDaysLeft(remaining);
      }
    }
  }, [isBasic]);

  if (isBasic) return null;

  const getPlanName = () => {
    if (tier === 'enterprise' || tier === 'pro') return 'Pro Retailer';
    return 'Premium Shop';
  };

  const planName = getPlanName();

  const t = {
    ar: { 
      expMsg: `انتهت الفترة التجريبية لباقة ${planName}! يرجى دفع الاشتراك للاستمرار.`, 
      upBtn: 'اشترك الآن', 
      activeMsg: `الفترة التجريبية المجانية: متبقي ${daysLeft} أيام على انتهاء باقة ${planName}`, 
      subBtn: 'اشترك لتثبيت الباقة' 
    },
    fr: { 
      expMsg: `La période d'essai ${planName} a expiré ! Veuillez vous abonner.`, 
      upBtn: 'S\'abonner maintenant', 
      activeMsg: `Période d'essai : Il vous reste ${daysLeft} jours sur le plan ${planName}`, 
      subBtn: 'Abonnez-vous pour conserver l\'accès' 
    },
    en: { 
      expMsg: `${planName} trial period has expired! Please subscribe to continue.`, 
      upBtn: 'Subscribe Now', 
      activeMsg: `Free Trial: ${daysLeft} days left on your ${planName} plan`, 
      subBtn: 'Subscribe to keep access' 
    }
  }[language];

  if (isExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 shadow-lg flex flex-col sm:flex-row items-center justify-center gap-3 relative z-50 animate-pulse" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <AlertTriangle size={20} className="shrink-0" />
        <span className="font-bold text-sm text-center">{t.expMsg}</span>
        <button onClick={() => navigate('/subscription')} className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-black text-xs hover:bg-red-50 transition-colors flex items-center gap-1 shadow-sm cursor-pointer">
          {t.upBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2.5 shadow-md flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 relative z-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 font-black text-sm">
        <Timer size={18} className="animate-pulse" />
        <span>{t.activeMsg}</span>
      </div>
      <button onClick={() => navigate('/subscription')} className="bg-white text-blue-600 hover:bg-slate-100 px-4 py-1 rounded-md font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer">
        <Zap size={14} className="fill-current" />
        {t.subBtn}
        <ArrowRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
      </button>
    </div>
  );
}