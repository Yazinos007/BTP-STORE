import { supabase } from './supabase';

// 1️⃣ تُستدعى تلقائياً بعد إنشاء حساب جديد (تسجل الإحالة كمعلقة بـ 0 درهم)
export async function bindReferralOnSignup(newUserId) {
  try {
    const refCode = localStorage.getItem('sasbtp_referral_code');
    if (!refCode || !newUserId) return;

    // البحث عن صاحب كود الإحالة
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, user_id, pending_balance_mad')
      .eq('referral_code', refCode)
      .maybeSingle();

    // منع الإحالة الذاتية (لا يمكن للشخص دعوة نفسه)
    if (!affiliate || affiliate.user_id === newUserId) return;

    // تسجيل الإحالة في جدول referrals بحالة 'pending' (بانتظار الدفع الفعلي)
    await supabase.from('referrals').insert([{
      affiliate_id: affiliate.id,
      referred_user_id: newUserId,
      status: 'pending', // لا تُصرف العمولة إلا بعد تحولها إلى 'paid'
      commission_mad: 0
    }]);

    // مسح الكود بعد ربطه بنجاح
    localStorage.removeItem('sasbtp_referral_code');
  } catch (err) {
    console.error('Error binding referral:', err);
  }
}