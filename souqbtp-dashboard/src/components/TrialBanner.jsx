import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';

export default function TrialBanner() {
  const { language = 'fr' } = useSettingsStore();
  const location = useLocation();
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkTrial = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (user.email === 'admin@souqbtp.ma' || user.user_metadata?.role === 'admin') {
          if (mounted) setIsPaid(true);
          return;
        }

        const [profRes, archRes, provRes, supRes] = await Promise.all([
          supabase.from('profiles').select('subscription_plan, trial_ends_at').eq('id', user.id).maybeSingle(),
          supabase.from('architects').select('subscription_plan, trial_ends_at').eq('user_id', user.id).limit(1),
          supabase.from('providers').select('subscription_plan, trial_ends_at').eq('user_id', user.id).limit(1),
          supabase.from('suppliers').select('supplier_type, subscription_plan, trial_ends_at').eq('user_id', user.id)
        ]);

        const wholesaleRecord = (supRes.data || []).find(s => s.supplier_type === 'wholesale');
        const plan = (wholesaleRecord?.subscription_plan || 'starter').toLowerCase();

        if (['pro', 'enterprise', 'vip'].includes(plan)) {
          if (mounted) setIsPaid(true);
          return;
        }

        const accountCreatedAt = user.created_at ? new Date(user.created_at) : new Date();
        const defaultTrialEnd = new Date(accountCreatedAt.getTime() + 14 * 24 * 60 * 60 * 1000);

        const candidateDates = [
          defaultTrialEnd,
          profRes.data?.trial_ends_at ? new Date(profRes.data.trial_ends_at) : null,
          archRes.data?.[0]?.trial_ends_at ? new Date(archRes.data[0].trial_ends_at) : null,
          provRes.data?.[0]?.trial_ends_at ? new Date(provRes.data[0].trial_ends_at) : null,
          ...(supRes.data || []).map(s => s.trial_ends_at ? new Date(s.trial_ends_at) : null)
        ].filter(Boolean);

        const effectiveTrialEnd = new Date(Math.max(...candidateDates.map(d => d.getTime())));
        const remaining = Math.max(0, Math.ceil((effectiveTrialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

        if (mounted) {
          setIsPaid(false);
          setTrialDaysLeft(remaining);
        }
      } catch (err) {
        console.error('TrialBanner error:', err);
      }
    };

    checkTrial();
    return () => { mounted = false; };
  }, [location.pathname]);

  if (isPaid || trialDaysLeft === null || location.pathname.includes('subscription')) {
    return null;
  }

  const t = {
    ar: {
      active: `فترة تجريبية: يتبقى لك ${trialDaysLeft} أيام على باقة Pro ERP`,
      expired: 'انتهت الفترة التجريبية! رقِّ حسابك الآن للاحتفاظ بكامل الصلاحيات.',
      btn: 'اشترك للاحتفاظ بالصلاحيات'
    },
    fr: {
      active: `Période d'essai : Il vous reste ${trialDaysLeft} jours sur le plan Pro ERP`,
      expired: "La période d'essai a expiré ! Mettez à niveau votre compte pour conserver vos accès.",
      btn: "Abonnez-vous pour conserver l'accès"
    },
    en: {
      active: `Trial period: You have ${trialDaysLeft} days left on the Pro ERP plan`,
      expired: 'Trial period expired! Upgrade now to keep full access.',
      btn: 'Subscribe to keep access'
    }
  }[language] || {};

  return (
    <div
      className={`w-full py-2 px-4 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-bold z-50 shrink-0 shadow-sm ${
        trialDaysLeft > 0
          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white'
          : 'bg-red-600 text-white'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2">
        <Clock size={16} className="animate-pulse shrink-0" />
        <span>{trialDaysLeft > 0 ? t.active : t.expired}</span>
      </div>
      <Link
        to="/subscription"
        className="bg-white text-indigo-900 hover:bg-amber-400 hover:text-slate-950 px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 shadow-sm"
      >
        <Zap size={13} className="fill-current" />
        <span>{t.btn}</span>
        <ArrowIcon size={13} />
      </Link>
    </div>
  );
}