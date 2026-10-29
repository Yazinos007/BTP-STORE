import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  Clock, Gift, Crown, BellRing, ArrowLeft, ArrowRight, X, Sparkles 
} from 'lucide-react';

export default function SystemNotificationBanner() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    let channel = null;

    const initNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      // 1. جلب الإشعارات غير المقروءة الخاصة بهذا المستخدم
      fetchUnreadNotifications(user.id);

      // 2. الاستماع اللحظي (Real-time) لأي إشعار أو هدية يرسلها الأدمن فوراً
      channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'system_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new && !payload.new.is_read) {
              setNotifications((prev) => [payload.new, ...prev]);
            }
          }
        )
        .subscribe();
    };

    initNotifications();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadNotifications = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleDismiss = async (id) => {
    // إخفاء فوري من الواجهة
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await supabase
        .from('system_notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch (_) {}
  };

  const handleActionClick = async (notif) => {
    await handleDismiss(notif.id);
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  if (notifications.length === 0) return null;

  // نعرض أحدث إشعار في أعلى الشاشة
  const activeNotif = notifications[0];

  // تخصيص الألوان والأيقونات حسب نوع الرسالة (تحذير انتهاء تجربة / هدية تمديد / تفعيل باقة)
  const getBannerTheme = (type) => {
    switch (type) {
      case 'gift_extension':
        return {
          wrapper: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-emerald-400/30 text-white',
          badge: 'bg-white/20 text-white',
          btn: 'bg-white text-emerald-800 hover:bg-emerald-50',
          icon: Gift,
          btnText: isRtl ? 'شكراً للإدارة 🎁' : 'Merci ! 🎁'
        };
      case 'billing_approved':
        return {
          wrapper: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 border-blue-400/30 text-white',
          badge: 'bg-amber-400 text-slate-950',
          btn: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
          icon: Crown,
          btnText: isRtl ? 'استكشاف المزايا 👑' : 'Explorer 👑'
        };
      case 'trial_warning':
      default:
        return {
          wrapper: 'bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 border-orange-400/30 text-white',
          badge: 'bg-black/25 text-amber-200',
          btn: 'bg-slate-950 text-amber-400 hover:bg-slate-900 border border-amber-400/40',
          icon: Clock,
          btnText: isRtl ? 'ترقية الباقة الآن ⚡' : 'Mettre à niveau ⚡'
        };
    }
  };

  const theme = getBannerTheme(activeNotif.notification_type);
  const IconComponent = theme.icon;

  return (
    <div className={`w-full border-b px-4 py-3 shadow-lg transition-all duration-300 z-40 ${theme.wrapper}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* الأيقونة ونص الرسالة */}
        <div className="flex items-center gap-3 text-center sm:text-start">
          <div className={`p-2 rounded-xl shrink-0 hidden sm:flex items-center justify-center ${theme.badge}`}>
            <IconComponent size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-black text-sm md:text-base tracking-tight">
                {activeNotif.title}
              </span>
              {notifications.length > 1 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/30 text-white">
                  +{notifications.length - 1}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm font-bold text-white/90 leading-relaxed mt-0.5">
              {activeNotif.message}
            </p>
          </div>
        </div>

        {/* أزرار التفاعل (الترقية أو الإغلاق) */}
        <div className="flex items-center gap-2 shrink-0">
          {activeNotif.notification_type === 'trial_warning' && activeNotif.action_url ? (
            <button
              onClick={() => handleActionClick(activeNotif)}
              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer ${theme.btn}`}
            >
              <Sparkles size={14} />
              <span>{theme.btnText}</span>
              <ArrowIcon size={14} />
            </button>
          ) : (
            <button
              onClick={() => handleDismiss(activeNotif.id)}
              className={`px-4 py-2 rounded-xl font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer ${theme.btn}`}
            >
              {theme.btnText}
            </button>
          )}

          <button
            onClick={() => handleDismiss(activeNotif.id)}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/90 transition-colors cursor-pointer"
            title={isRtl ? 'إخفاء التنبيه' : 'Fermer'}
          >
            <X size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}