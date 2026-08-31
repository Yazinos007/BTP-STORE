import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../store/useSettingsStore';
import { Timer, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

export default function TrialBanner() {
  const { language } = useSettingsStore();
  const navigate = useNavigate();
  const [daysLeft, setDaysLeft] = useState(7);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const trialStartDate = localStorage.getItem('trial_start_date');
    if (!trialStartDate) {
      localStorage.setItem('trial_start_date', new Date().toISOString());
    } else {
      const start = new Date(trialStartDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const remaining = 7 - diffDays;
      
      if (remaining <= 0) {
        setDaysLeft(0);
        setIsExpired(true);
      } else {
        setDaysLeft(remaining);
      }
    }
  }, []);

  const t = {
    ar: { 
      expMsg: 'انتهت الفترة التجريبية لباقة Pro ERP! لقد تم إيقاف بعض الصلاحيات.', upBtn: 'قم بالترقية الآن', 
      activeMsg: `الفترة التجريبية المجانية: متبقي ${daysLeft} أيام على انتهاء باقة Pro ERP`, subBtn: 'اشترك لتثبيت الباقة' 
    },
    fr: { 
      expMsg: 'La période d\'essai Pro ERP a expiré ! Certains accès sont suspendus.', upBtn: 'Mettre à niveau maintenant', 
      activeMsg: `Période d'essai : Il vous reste ${daysLeft} jours sur le plan Pro ERP`, subBtn: 'Abonnez-vous pour conserver l\'accès' 
    },
    en: { 
      expMsg: 'Pro ERP trial period has expired! Some features are suspended.', upBtn: 'Upgrade Now', 
      activeMsg: `Free Trial: ${daysLeft} days left on your Pro ERP plan`, subBtn: 'Subscribe to keep access' 
    }
  }[language] || { 
    expMsg: 'La période d\'essai Pro ERP a expiré ! Certains accès sont suspendus.', upBtn: 'Mettre à niveau maintenant', 
    activeMsg: `Période d'essai : Il vous reste ${daysLeft} jours sur le plan Pro ERP`, subBtn: 'Abonnez-vous pour conserver l\'accès' 
  };

  if (isExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 shadow-lg flex flex-col sm:flex-row items-center justify-center gap-3 relative z-50 animate-pulse" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <AlertTriangle size={20} className="shrink-0" />
        <span className="font-bold text-sm text-center">{t.expMsg}</span>
        <button onClick={() => navigate('/subscription')} className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-black text-xs hover:bg-red-50 transition-colors flex items-center gap-1 shadow-sm">
          {t.upBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-2.5 shadow-md flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 relative z-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 font-black text-sm">
        <Timer size={18} className="animate-pulse" />
        <span>{t.activeMsg}</span>
      </div>
      <button onClick={() => navigate('/subscription')} className="bg-black/90 text-amber-400 hover:text-amber-300 px-4 py-1 rounded-md font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm">
        <Zap size={14} className="fill-current" />
        {t.subBtn}
        <ArrowRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
      </button>
    </div>
  );
}