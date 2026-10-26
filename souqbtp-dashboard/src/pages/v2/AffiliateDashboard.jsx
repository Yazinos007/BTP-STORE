import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Trophy, Users, Link as LinkIcon, Copy, CheckCircle2, TrendingUp, 
  Gift, Award, Target, Wallet, Share2, Loader2 
} from 'lucide-react';

export default function AffiliateDashboard() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // نظام الرتب والمكافآت (Gamification)
  const tiers = {
    bronze: { 
      name: 'شريك برونزي', 
      color: 'from-orange-400 to-amber-600', 
      icon: Target, 
      commission: '20%',
      nextTierName: 'الرتبة الفضية',
      nextTierTarget: 5,
      nextCommission: '25%'
    },
    silver: { 
      name: 'شريك فضي', 
      color: 'from-slate-300 to-slate-500', 
      icon: Award, 
      commission: '25%',
      nextTierName: 'الرتبة الذهبية',
      nextTierTarget: 20,
      nextCommission: '30%'
    },
    gold: { 
      name: 'شريك ذهبي', 
      color: 'from-yellow-400 to-yellow-600', 
      icon: Trophy, 
      commission: '30%',
      nextTierName: 'رتبة شريك مؤسس 🏆',
      nextTierTarget: 50,
      nextCommission: '40%'
    },
    founder: { 
      name: 'شريك مؤسس 🏆', 
      color: 'from-cyan-400 to-indigo-600', 
      icon: Gift, 
      commission: '40% + خصم دائم',
      nextTierName: 'القمة',
      nextTierTarget: 50,
      nextCommission: '40%'
    }
  };

  useEffect(() => {
    fetchOrCreateAffiliateProfile();
  }, []);

  const fetchOrCreateAffiliateProfile = async () => {
    try {
      setLoading(true);
      
      // 1. التحقق من جلسة المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // بيانات افتراضية للعرض في حال عدم تسجيل الدخول أثناء التطوير
        setProfile({
          referral_code: 'SAS-BTP-2026',
          total_earnings_mad: 0,
          pending_balance_mad: 0,
          total_referrals: 0,
          rank_tier: 'bronze'
        });
        return;
      }

      // 2. جلب بيانات الشريك من جدول affiliates
      const { data: existingAffiliate, error: fetchError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingAffiliate) {
        setProfile(existingAffiliate);
        return;
      }

      // 3. إذا لم يكن لديه سجل بعد، نقوم بإنشاء كود إحالة فريد له تلقائياً
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

      if (insertError) {
        console.warn('Fallback to local profile state:', insertError.message);
        setProfile(newAffiliateData);
      } else {
        setProfile(createdAffiliate);
      }

    } catch (err) {
      console.error('Error loading affiliate dashboard:', err);
      setProfile({
        referral_code: 'SAS-BTP-2026',
        total_earnings_mad: 0,
        pending_balance_mad: 0,
        total_referrals: 0,
        rank_tier: 'bronze'
      });
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = `https://sasbtp.com/register?ref=${profile?.referral_code || 'SAS-BTP'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `انضم إلى منصة SasBTP لحساب تكاليف البناء وإدارة المشاريع في المغرب عبر رابط الدعوة الخاص بي:`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SasBTP - برنامج شركاء النجاح',
          text: shareText,
          url: referralUrl,
        });
      } catch (err) {
        console.log('Share canceled:', err);
      }
    } else {
      // مشاركة مباشرة عبر واتساب إذا كان المتصفح لا يدعم Web Share API
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${referralUrl}`)}`, '_blank');
    }
  };

  if (loading || !profile) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
        <span className="text-sm font-bold animate-pulse">جاري تحميل لوحة الشركاء...</span>
      </div>
    );
  }

  const currentTier = tiers[profile.rank_tier] || tiers.bronze;
  const TierIcon = currentTier.icon;

  // حساب نسبة التقدم نحو الرتبة التالية بشكل آمن
  const totalReferrals = Number(profile.total_referrals || 0);
  const totalEarnings = Number(profile.total_earnings_mad || 0);
  const pendingBalance = Number(profile.pending_balance_mad || 0);
  
  const remainingReferrals = Math.max(0, currentTier.nextTierTarget - totalReferrals);
  const progressPercentage = Math.min(100, Math.round((totalReferrals / currentTier.nextTierTarget) * 100));
  const strokeDashoffset = 163 - (163 * progressPercentage) / 100;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة وبطاقة الرتبة */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${currentTier.color} rounded-full blur-[100px] opacity-20 pointer-events-none`}></div>
        
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-black mb-4">
            <Trophy size={14} className="text-yellow-500" /> برنامج شركاء النجاح
          </span>
          <h2 className="text-3xl font-black text-white mb-2">اربح معنا وكن جزءاً من الثورة!</h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            شارك رابطك الخاص مع المهندسين، المقاولين، والحرفيين. احصل على عمولة نقدية مباشرة أو رصيد مجاني لاشتراكك مع كل شخص ينضم للمنصة عبرك.
          </p>
        </div>

        <div className={`shrink-0 bg-gradient-to-br ${currentTier.color} p-1 rounded-3xl shadow-lg`}>
          <div className="bg-slate-900 rounded-[22px] px-8 py-6 flex flex-col items-center justify-center text-center w-full md:w-56 h-full">
            <TierIcon size={40} className="text-white mb-3 drop-shadow-md" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">الرتبة الحالية</span>
            <span className="text-lg font-black text-white">{currentTier.name}</span>
            <span className="text-xs font-black bg-white/10 text-white px-3 py-1 rounded-lg mt-3">عمولة: {currentTier.commission}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* رابط الإحالة الخاص */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <LinkIcon className="text-cyan-400" size={20} /> رابط الدعوة الخاص بك
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-4 flex items-center justify-between overflow-x-auto">
              <span className="text-slate-300 text-sm font-medium select-all font-mono whitespace-nowrap">
                https://sasbtp.com/register?ref=<span className="text-cyan-400 font-black">{profile.referral_code}</span>
              </span>
            </div>
            <button 
              onClick={handleCopy}
              className={`w-full sm:w-auto px-6 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shrink-0 ${
                copied ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
              }`}
            >
              {copied ? <><CheckCircle2 size={18} /> تم النسخ!</> : <><Copy size={18} /> نسخ الرابط</>}
            </button>
            <button 
              onClick={handleShare}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Share2 size={18} /> مشاركة
            </button>
          </div>
        </div>

        {/* ملخص الأرباح */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-400">إجمالي الأرباح</span>
            <Wallet className="text-emerald-400" size={20} />
          </div>
          <div className="text-4xl font-black text-white mb-2">
            {totalEarnings.toLocaleString()} <span className="text-lg text-emerald-400">MAD</span>
          </div>
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            الرصيد المعلق: {pendingBalance.toLocaleString()} MAD
          </p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">عدد الإحالات الناجحة</span>
            <Users className="text-indigo-400" size={18} />
          </div>
          <span className="text-2xl font-black text-white">{totalReferrals}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">نسبة العمولة الحالية</span>
            <TrendingUp className="text-cyan-400" size={18} />
          </div>
          <span className="text-2xl font-black text-white">{currentTier.commission}</span>
        </div>
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <h4 className="font-black text-white text-sm mb-1">
              {profile.rank_tier === 'founder' ? 'لقد وصلت إلى أعلى رتبة في المنصة! 👑' : `كيف ترتقي إلى ${currentTier.nextTierName}؟`}
            </h4>
            <p className="text-xs text-slate-400">
              {profile.rank_tier === 'founder' 
                ? 'أنت تتمتع بأعلى نسبة عمولة (40%) مع مزايا الشريك المؤسس الدائمة.' 
                : `ادعُ ${remainingReferrals} أشخاص إضافيين لتفعيل عمولة ${currentTier.nextCommission}.`}
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