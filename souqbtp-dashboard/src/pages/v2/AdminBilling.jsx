import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import {
  CreditCard, Crown, Clock, BellRing, CheckCircle2, XCircle, Eye,
  Gift, RefreshCcw, Search, Send, MessageCircle, AlertTriangle,
  TrendingUp, Users, FileCheck2, Sparkles, X, ExternalLink, ShieldAlert, Loader2
} from 'lucide-react';

export default function AdminBilling() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'subscribers' | 'trials' | 'automation'
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [alertMsg, setAlertMsg] = useState({ show: false, type: 'success', text: '' });

  // Data States
  const [requests, setRequests] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [giftModalUser, setGiftModalUser] = useState(null);
  const [customDays, setCustomDays] = useState(7);

  // Automation States
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState(() => {
    return localStorage.getItem('sasbtp_auto_trial_notify') !== 'false';
  });
  const [warningThresholdDays, setWarningThresholdDays] = useState(3);
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState(
    'مرحباً {name} 👋، نود تذكيرك بأنه تبقى {days} أيام فقط على انتهاء فترتك التجريبية في منصة SasBTP. رقِّ باقتك الآن للحفاظ على جميع بياناتك واستمرار عمل أقسامك بدون انقطاع 🚀!'
  );

  useEffect(() => {
    loadAllBillingData();
  }, []);

  // تشغيل الفحص التلقائي عند فتح اللوحة إذا كان الخيار مفعلاً
  useEffect(() => {
    if (autoNotifyEnabled && allAccounts.length > 0) {
      triggerAutoReminderForExpiring(true);
    }
  }, [allAccounts.length, autoNotifyEnabled]);

  const showToast = (type, text) => {
    setAlertMsg({ show: true, type, text });
    setTimeout(() => setAlertMsg({ show: false, type: 'success', text: '' }), 5000);
  };

  const logToBlackBox = async (actionType, details) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminName = user?.user_metadata?.full_name || 'مدير النظام';
      await supabase.from('audit_logs').insert([{
        user_name: adminName,
        user_role: 'admin',
        action_type: actionType,
        details
      }]);
    } catch (_) {}
  };

  const loadAllBillingData = async () => {
    setIsLoading(true);
    try {
      // 1. جلب طلبات الاشتراك والوصولات المرفوعة
      const { data: reqData } = await supabase
        .from('subscription_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setRequests(reqData || []);

      // 2. جلب جميع الفئات الخمس لتوحيد مراقبة الباقات والفترات التجريبية
      const unified = [];

      // أ) المهندسون (Architects)
      const { data: archs } = await supabase.from('architects').select('*');
      (archs || []).forEach(a => {
        unified.push({
          recordId: a.id,
          userId: a.user_id || a.id,
          table: 'architects',
          name: a.agency_name || a.full_name || 'مكتب هندسي',
          phone: a.phone || '',
          email: a.email || '',
          role: 'architect',
          roleLabel: 'مهندس معماري 📐',
          plan: (a.subscription_plan || 'basic').toLowerCase(),
          isPaid: ['pro', 'vip', 'elite'].includes((a.subscription_plan || '').toLowerCase()),
          trialEndsAt: a.trial_ends_at || getFallbackTrialDate(a.created_at),
          lastNoticeAt: a.last_trial_notice_at,
          upgradeUrl: '/v2/architect-subscription'
        });
      });

      // ب) الحرفيون (Providers)
      const { data: provs } = await supabase.from('providers').select('*');
      (provs || []).forEach(p => {
        unified.push({
          recordId: p.id,
          userId: p.user_id || p.id,
          table: 'providers',
          name: p.full_name || 'حرفي',
          phone: p.phone || '',
          email: p.email || '',
          role: 'provider',
          roleLabel: 'حرفي (Maâlem) 👷‍♂️',
          plan: (p.subscription_plan || 'free').toLowerCase(),
          isPaid: ['pro', 'maalem pro'].includes((p.subscription_plan || '').toLowerCase()),
          trialEndsAt: p.trial_ends_at || getFallbackTrialDate(p.created_at),
          lastNoticeAt: p.last_trial_notice_at,
          upgradeUrl: '/v2/provider-subscription'
        });
      });

      // ج) الموردون والتجار (Suppliers: Wholesale & Retail)
      const { data: sups } = await supabase.from('suppliers').select('*');
      (sups || []).forEach(s => {
        const isWholesale = s.supplier_type === 'wholesale';
        unified.push({
          recordId: s.id,
          userId: s.user_id || s.id,
          table: 'suppliers',
          name: s.store_name || s.full_name || (isWholesale ? 'مورد جملة' : 'تاجر تجزئة'),
          phone: s.phone || '',
          email: s.email || '',
          role: isWholesale ? 'wholesale_supplier' : 'retail_supplier',
          roleLabel: isWholesale ? 'مورد جملة (B2B) 🏭' : 'تاجر تجزئة (POS) 🏪',
          plan: (s.subscription_plan || 'starter').toLowerCase(),
          isPaid: ['pro', 'premium', 'enterprise'].includes((s.subscription_plan || '').toLowerCase()),
          trialEndsAt: s.trial_ends_at || getFallbackTrialDate(s.created_at),
          lastNoticeAt: s.last_trial_notice_at,
          upgradeUrl: '/v2/subscription'
        });
      });

      // د) المقاولون وأصحاب المشاريع (Profiles)
      const { data: profs } = await supabase.from('profiles').select('*');
      (profs || []).forEach(c => {
        // تجنب التكرار إذا كان المسجل موجوداً في الجداول السابقة
        const alreadyExists = unified.some(u => String(u.userId) === String(c.id));
        if (!alreadyExists) {
          unified.push({
            recordId: c.id,
            userId: c.id,
            table: 'profiles',
            name: c.company_name || c.full_name || 'مقاول عام',
            phone: c.phone || '',
            email: c.email || '',
            role: 'contractor',
            roleLabel: 'مقاول عام 🏗️',
            plan: (c.subscription_plan || 'starter').toLowerCase(),
            isPaid: ['pro', 'enterprise', 'vip'].includes((c.subscription_plan || '').toLowerCase()),
            trialEndsAt: c.trial_ends_at || getFallbackTrialDate(c.created_at),
            lastNoticeAt: c.last_trial_notice_at,
            upgradeUrl: '/v2/subscription'
          });
        }
      });

      setAllAccounts(unified);
    } catch (error) {
      console.error('Error loading billing data:', error);
      showToast('error', 'حدث خطأ أثناء تحميل بيانات الاشتراكات');
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackTrialDate = (createdAt) => {
    const base = createdAt ? new Date(createdAt) : new Date();
    return new Date(base.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
  };

  const getRemainingDays = (isoDate) => {
    if (!isoDate) return 0;
    const diff = new Date(isoDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // ================= 1. الموافقة على وصل الدفع وتفعيل الباقة =================
  const handleApproveRequest = async (req) => {
    if (!window.confirm(`هل تؤكد استلام مبلغ (${req.amount} MAD) وتفعيل باقة (${req.plan_name}) لحساب (${req.user_name})؟`)) return;

    try {
      // 1. تحديث حالة الطلب في subscription_requests
      await supabase
        .from('subscription_requests')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', req.id);

      // 2. ترقية باقة المستخدم في جدوله الخاص
      const durationDays = req.billing_cycle === 'annual' || req.billing_cycle === 'yearly' ? 365 : 30;
      const subEndsAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      if (req.user_role === 'architect') {
        await supabase.from('architects').update({
          subscription_plan: req.plan_code,
          subscription_ends_at: subEndsAt
        }).eq('user_id', req.user_id);
      } else if (req.user_role === 'provider') {
        await supabase.from('providers').update({
          subscription_plan: req.plan_code,
          subscription_ends_at: subEndsAt,
          is_verified: true
        }).eq('user_id', req.user_id);
      } else if (req.user_role === 'wholesale_supplier' || req.user_role === 'retail_supplier') {
        await supabase.from('suppliers').update({
          subscription_plan: req.plan_code,
          subscription_ends_at: subEndsAt
        }).eq('id', req.user_id);
      } else {
        await supabase.from('profiles').update({
          subscription_plan: req.plan_code,
          subscription_ends_at: subEndsAt
        }).eq('id', req.user_id);
      }

      // 3. إرسال إشعار تهنئة للمستخدم
      await supabase.from('system_notifications').insert([{
        user_id: req.user_id,
        user_role: req.user_role,
        recipient_name: req.user_name,
        title: '🎉 تم تفعيل باقتك الاحترافية بنجاح!',
        message: `تم التحقق من وصل الدفع وتفعيل باقة (${req.plan_name}) في حسابك. استمتع بكافة الصلاحيات الآن!`,
        notification_type: 'billing_approved'
      }]);

      await logToBlackBox('APPROVE_SUBSCRIPTION', `تفعيل باقة (${req.plan_name}) للمستخدم (${req.user_name}) بقيمة ${req.amount} MAD`);
      showToast('success', `تم تفعيل باقة ${req.plan_name} لحساب ${req.user_name} بنجاح!`);
      loadAllBillingData();
    } catch (err) {
      showToast('error', 'فشل التفعيل: ' + err.message);
    }
  };

  const handleRejectRequest = async (req) => {
    if (!window.confirm(`هل أنت متأكد من رفض طلب الترقية الخاص بـ (${req.user_name})؟`)) return;
    try {
      await supabase
        .from('subscription_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', req.id);

      await logToBlackBox('REJECT_SUBSCRIPTION', `رفض طلب اشتراك (${req.plan_name}) للمستخدم (${req.user_name})`);
      showToast('success', 'تم رفض الطلب وتحديث السجل.');
      loadAllBillingData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // ================= 2. صلاحية (God Mode) لتمديد الفترة التجريبية أو تغيير الباقة =================
  const handleExtendTrial = async (account, daysToAdd) => {
    try {
      const currentEnd = account.trialEndsAt && new Date(account.trialEndsAt) > new Date()
        ? new Date(account.trialEndsAt)
        : new Date();

      const newEndDate = new Date(currentEnd.getTime() + Number(daysToAdd) * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from(account.table)
        .update({ trial_ends_at: newEndDate })
        .eq('id', account.recordId);

      if (error) throw error;

      // إرسال إشعار هدية للمستخدم
      await supabase.from('system_notifications').insert([{
        user_id: account.userId,
        user_role: account.role,
        recipient_name: account.name,
        title: `🎁 هدية من الإدارة: تمديد فترتك التجريبية (+${daysToAdd} أيام)!`,
        message: `قامت إدارة منصة SasBTP بمنحك ${daysToAdd} أيام إضافية مجانية في فترتك التجريبية لدعم مشاريعك.`,
        notification_type: 'gift_extension'
      }]);

      await logToBlackBox('GOD_MODE_TRIAL_EXTEND', `قام بتمديد الفترة التجريبية لـ (${account.name} - ${account.roleLabel}) بمقدار +${daysToAdd} يوماً`);
      showToast('success', `🎁 تم تمديد الفترة التجريبية لـ (${account.name}) بمقدار ${daysToAdd} يوماً!`);
      setGiftModalUser(null);
      loadAllBillingData();
    } catch (err) {
      showToast('error', 'خطأ أثناء التمديد: ' + err.message);
    }
  };

  const handleManualPlanChange = async (account, newPlanCode) => {
    if (!window.confirm(`تغيير باقة (${account.name}) يدوياً عبر God Mode إلى (${newPlanCode.toUpperCase()})؟`)) return;
    try {
      const { error } = await supabase
        .from(account.table)
        .update({ subscription_plan: newPlanCode })
        .eq('id', account.recordId);

      if (error) throw error;
      await logToBlackBox('GOD_MODE_PLAN_CHANGE', `تغيير باقة (${account.name}) يدوياً إلى (${newPlanCode.toUpperCase()})`);
      showToast('success', `تم تحديث باقة ${account.name} إلى ${newPlanCode.toUpperCase()}`);
      loadAllBillingData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // ================= 3. محرك التنبيه التلقائي لقرب انتهاء الفترة التجريبية =================
  const triggerAutoReminderForExpiring = async (silent = false) => {
    const expiringUsers = allAccounts.filter(acc => {
      if (acc.isPaid) return false;
      const days = getRemainingDays(acc.trialEndsAt);
      const alreadyNotifiedToday = acc.lastNoticeAt && (Date.now() - new Date(acc.lastNoticeAt).getTime()) < 24 * 60 * 60 * 1000;
      return days >= 0 && days <= warningThresholdDays && !alreadyNotifiedToday;
    });

    if (expiringUsers.length === 0) {
      if (!silent) showToast('success', '✅ جميع الحسابات المستحقة للتنبيه تم إشعارها بالفعل اليوم.');
      return;
    }

    if (!silent) setIsSendingBatch(true);

    try {
      const notificationsPayload = expiringUsers.map(u => {
        const remaining = Math.max(0, getRemainingDays(u.trialEndsAt));
        const personalizedMsg = messageTemplate
          .replace('{name}', u.name)
          .replace('{days}', remaining);

        return {
          user_id: u.userId,
          user_role: u.role,
          recipient_name: u.name,
          title: `⏳ تنبيه هام: بقي ${remaining} أيام على انتهاء فترتك التجريبية`,
          message: personalizedMsg,
          action_url: u.upgradeUrl,
          notification_type: 'trial_warning'
        };
      });

      await supabase.from('system_notifications').insert(notificationsPayload);

      // تحديث وقت آخر تنبيه لكل حساب لمنع الإزعاج المتكرر في نفس اليوم
      const nowIso = new Date().toISOString();
      for (const u of expiringUsers) {
        await supabase.from(u.table).update({ last_trial_notice_at: nowIso }).eq('id', u.recordId);
      }

      await logToBlackBox('AUTO_TRIAL_REMINDER', `إرسال تنبيه تلقائي بقرب انتهاء الفترة التجريبية إلى (${expiringUsers.length}) حسابات`);

      if (!silent) {
        showToast('success', `🚀 تم إرسال رسائل التذكير التلقائية إلى (${expiringUsers.length}) حسابات بنجاح!`);
        loadAllBillingData();
      }
    } catch (err) {
      if (!silent) showToast('error', 'حدث خطأ أثناء إرسال الإشعارات: ' + err.message);
    } finally {
      if (!silent) setIsSendingBatch(false);
    }
  };

  const sendSingleReminder = async (account) => {
    const remaining = Math.max(0, getRemainingDays(account.trialEndsAt));
    const personalizedMsg = messageTemplate
      .replace('{name}', account.name)
      .replace('{days}', remaining);

    try {
      await supabase.from('system_notifications').insert([{
        user_id: account.userId,
        user_role: account.role,
        recipient_name: account.name,
        title: `⏳ تنبيه: بقي ${remaining} أيام على انتهاء فترتك التجريبية`,
        message: personalizedMsg,
        action_url: account.upgradeUrl,
        notification_type: 'trial_warning'
      }]);

      await supabase.from(account.table).update({ last_trial_notice_at: new Date().toISOString() }).eq('id', account.recordId);
      showToast('success', `تم إرسال تنبيه داخلي فوري لحساب (${account.name})`);
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const openWhatsAppTrialReminder = (account) => {
    const remaining = Math.max(0, getRemainingDays(account.trialEndsAt));
    const text = messageTemplate
      .replace('{name}', account.name)
      .replace('{days}', remaining);

    let cleanPhone = (account.phone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '212' + cleanPhone.substring(1);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // ================= الحسابات المالية والإحصائيات =================
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const totalCollectedRevenue = approvedRequests.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const currentMonthRevenue = approvedRequests
    .filter(r => {
      const d = new Date(r.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const paidSubscribers = allAccounts.filter(a => a.isPaid);
  const expiringTrials = allAccounts.filter(a => !a.isPaid && getRemainingDays(a.trialEndsAt) <= warningThresholdDays && getRemainingDays(a.trialEndsAt) >= 0);

  const filteredAccounts = allAccounts.filter(a => {
    const matchesRole = roleFilter === 'all' || a.role === roleFilter;
    const matchesSearch = !searchQuery.trim() ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery) ||
      a.plan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <CreditCard size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
              لوحة تتبع الاشتراكات والفواتير (Billing & Trials)
            </h1>
            <p className="text-slate-500 font-bold text-sm">
              مراقبة الإيرادات الشهرية، تفعيل الوصولات، والتحكم الشامل (God Mode) بالفترات التجريبية للفئات الخمس
            </p>
          </div>
        </div>
        <button
          onClick={loadAllBillingData}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-md cursor-pointer"
        >
          <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          <span>تحديث المركز المالي</span>
        </button>
      </div>

      {/* Alert Toast */}
      {alertMsg.show && (
        <div className={`p-4 rounded-2xl font-black text-sm flex items-center gap-3 border shadow-sm animate-fade-in ${
          alertMsg.type === 'error'
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          <CheckCircle2 size={20} />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100">إيرادات هذا الشهر</span>
            <TrendingUp size={24} className="text-emerald-200" />
          </div>
          <div className="text-3xl font-black font-mono" dir="ltr">
            {currentMonthRevenue.toLocaleString()} <span className="text-sm">MAD</span>
          </div>
          <p className="text-xs font-bold text-emerald-100 mt-2">
            إجمالي المحصل الكلي: {totalCollectedRevenue.toLocaleString()} MAD
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-100">وصولات بانتظار التفعيل</span>
            <FileCheck2 size={24} className="text-amber-100" />
          </div>
          <div className="text-3xl font-black">{pendingRequests.length}</div>
          <p className="text-xs font-bold text-amber-100 mt-2">
            طلبات ترقية مرفقة بوصل الدفع
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-100">المشتركون المدفوعون (Pro/VIP)</span>
            <Crown size={24} className="text-amber-300" />
          </div>
          <div className="text-3xl font-black">{paidSubscribers.length}</div>
          <p className="text-xs font-bold text-blue-100 mt-2">
            من أصل {allAccounts.length} حساب في المنصة
          </p>
        </div>

        <div className="bg-gradient-to-br from-rose-600 to-red-500 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-rose-100">تنتهي تجربتهم قريباً (≤ {warningThresholdDays} أيام)</span>
            <Clock size={24} className="text-rose-200 animate-pulse" />
          </div>
          <div className="text-3xl font-black">{expiringTrials.length}</div>
          <p className="text-xs font-bold text-rose-100 mt-2">
            جاهزون لإرسال تذكير الترقية التلقائي
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileCheck2 size={18} />
          <span>طلبات الترقية والوصولات ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'subscribers'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Crown size={18} className="text-amber-400" />
          <span>المشتركون في الباقات المدفوعة ({paidSubscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trials')}
          className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'trials'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Gift size={18} className="text-emerald-400" />
          <span>رادار الفترات التجريبية & God Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'automation'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BellRing size={18} className="text-rose-400" />
          <span>برمجة الرسائل التلقائية قبل الإغلاق</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: طلبات الترقية ومراجعة الوصولات (Subscription Requests)
      ========================================================= */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <h3 className="font-black text-slate-800 text-base">
              📄 سجل الحوالات البنكية وطلبات تفعيل الباقات
            </h3>
            <span className="text-xs font-bold text-slate-500">
              إجمالي الطلبات: {requests.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-4 font-black">التاريخ</th>
                  <th className="p-4 font-black">المستخدم / الجهة</th>
                  <th className="p-4 font-black">الفئة</th>
                  <th className="p-4 font-black">الباقة المطلوبة</th>
                  <th className="p-4 font-black">المبلغ</th>
                  <th className="p-4 font-black text-center">طريقة الدفع</th>
                  <th className="p-4 font-black text-center">وصل الدفع</th>
                  <th className="p-4 font-black text-center">الحالة / الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-slate-400 font-bold">
                      <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={26} />
                      جاري جلب طلبات الاشتراك...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-slate-400 font-bold">
                      لا توجد طلبات اشتراك مرفوعة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="p-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString('ar-MA')}
                      </td>
                      <td className="p-4 font-black text-slate-800">{req.user_name || 'مستخدم'}</td>
                      <td className="p-4 text-xs font-bold text-slate-600">{req.user_role}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                          {req.plan_name} ({req.billing_cycle === 'annual' || req.billing_cycle === 'yearly' ? 'سنوي' : 'شهري'})
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black text-emerald-600" dir="ltr">
                        {Number(req.amount || 0).toLocaleString()} MAD
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {req.payment_method === 'bank' ? '🏦 تحويل بنكي' : '💵 Cash Plus'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {req.receipt_url ? (
                          <button
                            onClick={() => setReceiptPreview(req.receipt_url)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={14} /> عرض الوصل
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">بدون مرفق</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApproveRequest(req)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 size={14} /> تفعيل
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle size={14} /> رفض
                            </button>
                          </div>
                        ) : req.status === 'approved' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                            ✅ مفعل
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black">
                            ❌ مرفوض
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: المشتركون في الباقات المدفوعة (Pro / VIP / Enterprise)
      ========================================================= */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60">
            <div>
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Crown size={20} className="text-amber-500" />
                قائمة المشتركين الفعليين في الباقات المدفوعة (Pro / VIP / Enterprise)
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                تشمل المقاولين، المهندسين، الحرفيين، موردي الجملة، وتجار التجزئة
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-4 font-black">الاسم / الشركة</th>
                  <th className="p-4 font-black">الفئة المهنية</th>
                  <th className="p-4 font-black">الهاتف</th>
                  <th className="p-4 font-black text-center">الباقة المفعلة</th>
                  <th className="p-4 font-black text-center">تحكم سريع (God Mode)</th>
                </tr>
              </thead>
              <tbody>
                {paidSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 font-bold">
                      لا يوجد مشتركون في الباقات المدفوعة حالياً. يمكنك ترقية أي مستخدم من تبويب "رادار الفترات التجريبية".
                    </td>
                  </tr>
                ) : (
                  paidSubscribers.map((sub, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="p-4 font-black text-slate-800">{sub.name}</td>
                      <td className="p-4 font-bold text-slate-600 text-xs">{sub.roleLabel}</td>
                      <td className="p-4 font-mono font-bold text-slate-600" dir="ltr">{sub.phone || '-'}</td>
                      <td className="p-4 text-center">
                        <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase shadow-sm">
                          👑 {sub.plan}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleManualPlanChange(sub, 'basic')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          إعادة للباقة العادية
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: رادار الفترات التجريبية + صلاحية (God Mode) للتمديد
      ========================================================= */}
      {activeTab === 'trials' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute right-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، الهاتف، أو الباقة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'contractor', label: 'المقاولون 🏗️' },
                { id: 'architect', label: 'المهندسون 📐' },
                { id: 'provider', label: 'الحرفيون 👷‍♂️' },
                { id: 'wholesale_supplier', label: 'موردو الجملة 🏭' },
                { id: 'retail_supplier', label: 'تجار التجزئة 🏪' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setRoleFilter(f.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    roleFilter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-4 font-black">المستخدم / المؤسسة</th>
                    <th className="p-4 font-black">الفئة</th>
                    <th className="p-4 font-black text-center">الباقة الحالية</th>
                    <th className="p-4 font-black text-center">تاريخ انتهاء التجربة (Trial)</th>
                    <th className="p-4 font-black text-center">الأيام المتبقية</th>
                    <th className="p-4 font-black text-center">⚡ أوامر God Mode (هدية / تذكير / ترقية)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((acc, idx) => {
                    const daysLeft = getRemainingDays(acc.trialEndsAt);
                    return (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="p-4">
                          <div className="font-black text-slate-800">{acc.name}</div>
                          <div className="text-xs font-mono text-slate-400" dir="ltr">{acc.phone || acc.email}</div>
                        </td>
                        <td className="p-4 text-xs font-bold text-slate-600">{acc.roleLabel}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            acc.isPaid
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {acc.plan}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono text-xs font-bold text-slate-600">
                          {new Date(acc.trialEndsAt).toLocaleDateString('ar-MA')}
                        </td>
                        <td className="p-4 text-center">
                          {acc.isPaid ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                              👑 حساب مدفوع نشط
                            </span>
                          ) : daysLeft > 3 ? (
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                              🟢 متبقي {daysLeft} يوم
                            </span>
                          ) : daysLeft >= 0 ? (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black animate-pulse">
                              ⚠️ بقي {daysLeft} أيام فقط
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black">
                              🔴 منتهية منذ {Math.abs(daysLeft)} يوم
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <button
                              onClick={() => setGiftModalUser(acc)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer"
                              title="تمديد الفترة التجريبية كهدية"
                            >
                              <Gift size={14} /> تمديد التجربة
                            </button>

                            {!acc.isPaid && (
                              <button
                                onClick={() => handleManualPlanChange(acc, 'pro')}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer"
                                title="ترقية فورية مجانية إلى PRO"
                              >
                                <Sparkles size={14} /> ترقية لـ PRO
                              </button>
                            )}

                            <button
                              onClick={() => sendSingleReminder(acc)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                              title="إرسال تنبيه داخلي فوري للحساب"
                            >
                              <BellRing size={15} />
                            </button>

                            <button
                              onClick={() => openWhatsAppTrialReminder(acc)}
                              className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg cursor-pointer"
                              title="إرسال رسالة تذكير عبر واتساب"
                            >
                              <MessageCircle size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: برمجة الرسائل التلقائية لمن قاربت فترتهم على الانتهاء
      ========================================================= */}
      {activeTab === 'automation' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <BellRing className="text-rose-500" size={24} />
                محرك التنبيهات التلقائية قبل إغلاق الأقسام التجريبية
              </h3>
              <p className="text-sm font-bold text-slate-500 mt-1">
                يقوم النظام بفحص الحسابات التي قاربت فترتها التجريبية على الانتهاء وإرسال تنبيه ترقية تلقائي إلى حساباتهم.
              </p>
            </div>

            <label className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoNotifyEnabled}
                onChange={(e) => {
                  setAutoNotifyEnabled(e.target.checked);
                  localStorage.setItem('sasbtp_auto_trial_notify', String(e.target.checked));
                }}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
              <span className="text-sm font-black text-slate-800">
                تفعيل الإرسال التلقائي الذكي
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-black text-slate-600">
                عتبة الإنذار المبكر (عدد الأيام قبل الإغلاق)
              </label>
              <select
                value={warningThresholdDays}
                onChange={(e) => setWarningThresholdDays(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white font-black text-slate-800 text-sm"
              >
                <option value={1}>قبل يوم واحد (24 ساعة)</option>
                <option value={3}>قبل 3 أيام من الانتهاء</option>
                <option value={5}>قبل 5 أيام من الانتهاء</option>
                <option value={7}>قبل 7 أيام من الانتهاء</option>
              </select>
              <p className="text-xs font-bold text-slate-400">
                يوجد حالياً ({expiringTrials.length}) حساب ضمن هذه الفترة.
              </p>
            </div>

            <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-black text-slate-600">
                نص الرسالة التلقائية (يدعم المتغيرات الذكية: <code className="text-blue-600">{'{name}'}</code> و <code className="text-blue-600">{'{days}'}</code>)
              </label>
              <textarea
                rows={3}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white">
            <div className="space-y-1">
              <h4 className="font-black text-base flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                بث حملة التذكير الفورية لجميع الحسابات الموشكة على الانتهاء
              </h4>
              <p className="text-xs text-slate-300 font-bold">
                سيتم إرسال إشعار داخلي مباشر مع رابط الترقية لكل مستخدم تبقى له {warningThresholdDays} أيام أو أقل.
              </p>
            </div>
            <button
              onClick={() => triggerAutoReminderForExpiring(false)}
              disabled={isSendingBatch}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer"
            >
              {isSendingBatch ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span>إرسال التنبيه التلقائي الآن ({expiringTrials.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: نافذة معاينة وصل الدفع (Receipt Preview Modal)
      ========================================================= */}
      {receiptPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-base">🧾 معاينة وصل الدفع المرفق</h3>
              <div className="flex items-center gap-2">
                <a
                  href={receiptPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-black flex items-center gap-1"
                >
                  <ExternalLink size={14} /> فتح في نافذة مستقلة
                </a>
                <button
                  onClick={() => setReceiptPreview(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 bg-slate-900 flex items-center justify-center max-h-[75vh] overflow-auto">
              {receiptPreview.toLowerCase().endsWith('.pdf') ? (
                <iframe src={receiptPreview} title="Receipt PDF" className="w-full h-[60vh] rounded-xl bg-white" />
              ) : (
                <img src={receiptPreview} alt="Payment Receipt" className="max-h-[65vh] rounded-xl object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: نافذة (God Mode) لتمديد الفترة التجريبية يدوياً
      ========================================================= */}
      {giftModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Gift className="text-emerald-500" size={22} />
                تمديد الفترة التجريبية (God Mode)
              </h3>
              <button onClick={() => setGiftModalUser(null)} className="p-1.5 bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-400">الحساب المستهدف:</div>
              <div className="text-base font-black text-slate-800">{giftModalUser.name}</div>
              <div className="text-xs font-bold text-blue-600">{giftModalUser.roleLabel}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-600">اختر مدة التمديد السريع (هدية / دعم فني):</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[7, 15, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => handleExtendTrial(giftModalUser, days)}
                    className="py-3 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-xl font-black text-sm transition-all cursor-pointer"
                  >
                    +{days} أيام 🎁
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-black text-slate-600">أو أدخل عدد أيام مخصص:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-black text-center"
                />
                <button
                  onClick={() => handleExtendTrial(giftModalUser, customDays)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm shrink-0 cursor-pointer"
                >
                  تطبيق التمديد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}