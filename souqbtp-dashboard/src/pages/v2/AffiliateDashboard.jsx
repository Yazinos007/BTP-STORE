import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Trophy, Users, Link as LinkIcon, Copy, CheckCircle2, TrendingUp, 
  Gift, Award, Target, Wallet, Share2, Loader2 
} from 'lucide-react';

const translations = {
  ar: {
    loading: 'جاري تحميل لوحة الشركاء...',
    badge: 'برنامج شركاء النجاح',
    title: 'اربح معنا وكن جزءاً من الثورة!',
    subtitle: 'شارك رابطك الخاص مع المهندسين، المقاولين، والحرفيين. احصل على عمولة نقدية مباشرة مع كل شخص ينضم ويفعل اشتراكه عبرك.',
    currentRank: 'الرتبة الحالية',
    commissionLabel: 'عمولة:',
    yourLink: 'رابط الدعوة الخاص بك',
    copyBtn: 'نسخ الرابط',
    copiedBtn: 'تم النسخ!',
    shareBtn: 'مشاركة',
    totalEarnings: 'إجمالي الأرباح',
    pendingBalance: 'الرصيد المعلق:',
    successfulReferrals: 'عدد الإحالات المسجلة',
    currentCommissionRate: 'نسبة العمولة الحالية',
    topRankReached: 'لقد وصلت إلى أعلى رتبة في المنصة! 👑',
    topRankDesc: 'أنت تتمتع بأعلى نسبة عمولة (40%) مع مزايا الشريك المؤسس الدائمة.',
    howToUpgrade: (nextTier) => `كيف ترتقي إلى ${nextTier}؟`,
    upgradeDesc: (count, comm) => `ادعُ ${count} مشتركين إضافيين لتفعيل عمولة ${comm}.`,
    shareTitle: 'SasBTP - برنامج شركاء النجاح',
    shareText: 'انضم إلى منصة SasBTP لإدارة مشاريع البناء والأوراش عبر رابط الدعوة الخاص بي:',
    tiers: {
      bronze: { name: 'شريك برونزي', nextName: 'الرتبة الفضية', commission: '20%' },
      silver: { name: 'شريك فضي', nextName: 'الرتبة الذهبية', commission: '25%' },
      gold: { name: 'شريك ذهبي', nextName: 'رتبة شريك مؤسس 🏆', commission: '30%' },
      founder: { name: 'شريك مؤسس 🏆', nextName: 'القمة', commission: '40% + خصم دائم' }
    }
  },
  fr: {
    loading: 'Chargement du tableau partenaires...',
    badge: 'Programme Partenaires',
    title: 'Gagnez avec nous et rejoignez la révolution !',
    subtitle: 'Partagez votre lien unique avec les architectes, entrepreneurs, artisans et fournisseurs. Recevez une commission directe sur chaque abonnement payé via votre lien.',
    currentRank: 'Rang Actuel',
    commissionLabel: 'Commission :',
    yourLink: 'Votre lien de parrainage unique',
    copyBtn: 'Copier le lien',
    copiedBtn: 'Copié !',
    shareBtn: 'Partager',
    totalEarnings: 'Gains Totaux',
    pendingBalance: 'Solde en attente :',
    successfulReferrals: 'Parrainages inscrits',
    currentCommissionRate: 'Taux de commission actuel',
    topRankReached: 'Vous avez atteint le rang suprême ! 👑',
    topRankDesc: 'Vous bénéficiez de la commission maximale (40%) et des avantages Fondateur à vie.',
    howToUpgrade: (nextTier) => `Comment passer au ${nextTier} ?`,
    upgradeDesc: (count, comm) => `Invitez encore ${count} abonnés actifs pour débloquer ${comm} de commission.`,
    shareTitle: 'SasBTP - Programme Partenaires',
    shareText: 'Rejoignez la plateforme SasBTP pour gérer vos chantiers et projets BTP via mon lien d\'invitation :',
    tiers: {
      bronze: { name: 'Partenaire Bronze', nextName: 'Rang Argent', commission: '20%' },
      silver: { name: 'Partenaire Argent', nextName: 'Rang Or', commission: '25%' },
      gold: { name: 'Partenaire Or', nextName: 'Partenaire Fondateur 🏆', commission: '30%' },
      founder: { name: 'Partenaire Fondateur 🏆', nextName: 'Sommet', commission: '40% + Remise à vie' }
    }
  },
  en: {
    loading: 'Loading partner dashboard...',
    badge: 'Affiliate Partner Program',
    title: 'Earn with us & join the BTP revolution!',
    subtitle: 'Share your unique link with architects, contractors, artisans, and suppliers. Earn direct cash commission for every paid subscription through your link.',
    currentRank: 'Current Rank',
    commissionLabel: 'Commission:',
    yourLink: 'Your Unique Referral Link',
    copyBtn: 'Copy Link',
    copiedBtn: 'Copied!',
    shareBtn: 'Share',
    totalEarnings: 'Total Earnings',
    pendingBalance: 'Pending Balance:',
    successfulReferrals: 'Registered Referrals',
    currentCommissionRate: 'Current Commission Rate',
    topRankReached: 'You reached the highest rank! 👑',
    topRankDesc: 'You enjoy the maximum 40% commission rate with lifetime Founder benefits.',
    howToUpgrade: (nextTier) => `How to reach ${nextTier}?`,
    upgradeDesc: (count, comm) => `Invite ${count} more paid subscribers to unlock ${comm} commission.`,
    shareTitle: 'SasBTP - Affiliate Program',
    shareText: 'Join the SasBTP construction management platform using my invitation link:',
    tiers: {
      bronze: { name: 'Bronze Partner', nextName: 'Silver Rank', commission: '20%' },
      silver: { name: 'Silver Partner', nextName: 'Gold Rank', commission: '25%' },
      gold: { name: 'Gold Partner', nextName: 'Founder Partner 🏆', commission: '30%' },
      founder: { name: 'Founder Partner 🏆', nextName: 'Peak', commission: '40% + Lifetime Discount' }
    }
  }
};

export default function AffiliateDashboard() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const tierMeta = {
    bronze: { color: 'from-orange-400 to-amber-600', icon: Target, nextTierTarget: 5, nextCommission: '25%' },
    silver: { color: 'from-slate-300 to-slate-500', icon: Award, nextTierTarget: 20, nextCommission: '30%' },
    gold: { color: 'from-yellow-400 to-yellow-600', icon: Trophy, nextTierTarget: 50, nextCommission: '40%' },
    founder: { color: 'from-cyan-400 to-indigo-600', icon: Gift, nextTierTarget: 50, nextCommission: '40%' }
  };

  useEffect(() => {
    fetchOrCreateAffiliateProfile();
  }, []);

  const fetchOrCreateAffiliateProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProfile({
          referral_code: 'SAS-BTP26',
          total_earnings_mad: 0,
          pending_balance_mad: 0,
          total_referrals: 0,
          rank_tier: 'bronze'
        });
        return;
      }

      const { data: existingAffiliate } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingAffiliate) {
        setProfile(existingAffiliate);
        return;
      }

      const generatedCode = `SAS-${user.id.substring(0, 6).toUpperCase()}`;
      const newAffiliateData = {
        user_id: user.id,
        referral_code: generatedCode,
        total_earnings_mad: 0,
        pending_balance_mad: 0,
        total_referrals: 0,
        rank_tier: 'bronze'
      };

      const { data: createdAffiliate, error: insertError } = await supabase
        .from('affiliates')
        .insert([newAffiliateData])
        .select()
        .single();

      setProfile(insertError ? newAffiliateData : createdAffiliate);
    } catch (err) {
      console.error('Error loading affiliate dashboard:', err);
      setProfile({
        referral_code: 'SAS-BTP26',
        total_earnings_mad: 0,
        pending_balance_mad: 0,
        total_referrals: 0,
        rank_tier: 'bronze'
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔗 توليد رابط الإحالة الصحيح تلقائياً على نفس نطاق الموقع الحي
  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.souqbtp.ma';
  const referralUrl = `${baseOrigin}/v2/auth?ref=${profile?.referral_code || 'SAS-BTP'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareTitle,
          text: t.shareText,
          url: referralUrl,
        });
      } catch (err) {
        console.log('Share canceled:', err);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${t.shareText}\n${referralUrl}`)}`, '_blank');
    }
  };

  if (loading || !profile) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
        <span className="text-sm font-bold animate-pulse">{t.loading}</span>
      </div>
    );
  }

  const tierKey = tierMeta[profile.rank_tier] ? profile.rank_tier : 'bronze';
  const currentMeta = tierMeta[tierKey];
  const currentText = t.tiers[tierKey];
  const TierIcon = currentMeta.icon;

  const totalReferrals = Number(profile.total_referrals || 0);
  const totalEarnings = Number(profile.total_earnings_mad || 0);
  const pendingBalance = Number(profile.pending_balance_mad || 0);
  
  const remainingReferrals = Math.max(0, currentMeta.nextTierTarget - totalReferrals);
  const progressPercentage = Math.min(100, Math.round((totalReferrals / currentMeta.nextTierTarget) * 100));
  const strokeDashoffset = 163 - (163 * progressPercentage) / 100;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 py-2" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة وبطاقة الرتبة */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${currentMeta.color} rounded-full blur-[100px] opacity-20 pointer-events-none`}></div>
        
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-black mb-4">
            <Trophy size={14} className="text-yellow-500" /> {t.badge}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{t.title}</h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className={`shrink-0 bg-gradient-to-br ${currentMeta.color} p-1 rounded-3xl shadow-lg`}>
          <div className="bg-slate-900 rounded-[22px] px-8 py-6 flex flex-col items-center justify-center text-center w-full md:w-56 h-full">
            <TierIcon size={40} className="text-white mb-3 drop-shadow-md" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{t.currentRank}</span>
            <span className="text-lg font-black text-white">{currentText.name}</span>
            <span className="text-xs font-black bg-white/10 text-white px-3 py-1 rounded-lg mt-3">
              {t.commissionLabel} {currentText.commission}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* رابط الإحالة الخاص - خلفية داكنة صلبة لوضوح تام في الوضع النهاري والليلي */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <LinkIcon className="text-cyan-400" size={20} /> {t.yourLink}
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-4 flex items-center justify-between overflow-x-auto" dir="ltr">
              <span className="text-slate-300 text-sm font-medium select-all font-mono whitespace-nowrap">
                {baseOrigin}/v2/auth?ref=<span className="text-cyan-400 font-black">{profile.referral_code}</span>
              </span>
            </div>
            <button 
              onClick={handleCopy}
              className={`w-full sm:w-auto px-6 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                copied ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
              }`}
            >
              {copied ? <><CheckCircle2 size={18} /> {t.copiedBtn}</> : <><Copy size={18} /> {t.copyBtn}</>}
            </button>
            <button 
              onClick={handleShare}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Share2 size={18} /> {t.shareBtn}
            </button>
          </div>
        </div>

        {/* ملخص الأرباح */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 flex flex-col justify-center shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-300">{t.totalEarnings}</span>
            <Wallet className="text-emerald-400" size={20} />
          </div>
          <div className="text-4xl font-black text-white mb-2">
            {totalEarnings.toLocaleString()} <span className="text-lg text-emerald-400">MAD</span>
          </div>
          <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {t.pendingBalance} {pendingBalance.toLocaleString()} MAD
          </p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-300">{t.successfulReferrals}</span>
            <Users className="text-indigo-400" size={18} />
          </div>
          <span className="text-2xl font-black text-white">{totalReferrals}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-300">{t.currentCommissionRate}</span>
            <TrendingUp className="text-cyan-400" size={18} />
          </div>
          <span className="text-2xl font-black text-white">{currentText.commission}</span>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-lg">
          <div>
            <h4 className="font-black text-white text-sm mb-1">
              {tierKey === 'founder' ? t.topRankReached : t.howToUpgrade(currentText.nextName)}
            </h4>
            <p className="text-xs text-slate-300">
              {tierKey === 'founder' 
                ? t.topRankDesc 
                : t.upgradeDesc(remainingReferrals, currentMeta.nextCommission)}
            </p>
          </div>
          <div className="w-16 h-16 shrink-0 rounded-full flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-800" />
              <circle 
                cx="32" 
                cy="32" 
                r="26" 
                stroke="currentColor" 
                strokeWidth="5" 
                fill="transparent" 
                strokeDasharray="163" 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round"
                className="text-yellow-500 transition-all duration-700" 
              />
            </svg>
            <span className="text-xs font-black text-white">{progressPercentage}%</span>
          </div>
        </div>
      </div>

    </div>
  );
}