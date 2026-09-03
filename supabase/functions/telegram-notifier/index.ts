import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = '8851772110:AAEl8LrqU_QwcuyYX4koXwPpDFxRWzZs3C4';
const CHANNEL_USERNAME = '@souqbtp_logistics'; // قناتك العامة
const ADMIN_CHAT_ID = '5508156915'; // معرفك الشخصي

// استدعاء متغيرات البيئة للاتصال بقاعدة البيانات من داخل الدالة
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; 
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const payload = await req.json();
    
    if (payload.type === 'INSERT' && payload.table === 'logistics_trips') {
      const trip = payload.record;
      const savings = (trip.available_capacity || 20) * 150;
      
      // 1. الرسالة التشويقية (FOMO) للقناة العامة
      const channelMessage = `
🚛 *فرصة لوجستيك جديدة (الرجوع عامر)* 🚛

توجد شاحنة *${trip.truck_type}* ستعود فارغة من *${trip.departure_city}* إلى *${trip.arrival_city}* يوم ${trip.trip_date}.

💰 *وفر حوالي ${savings.toLocaleString()} درهم من تكلفة النقل!*

لمعرفة اسم المورد وحجز الشاحنة قبل غيرك:
🔗 [اضغط هنا للدخول لمنصة SouqBTP](https://souqbtp.ma)
      `;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHANNEL_USERNAME, text: channelMessage, parse_mode: 'Markdown', disable_web_page_preview: true })
      });

      // 2. رسالة الإدارة (Admin)
      const adminMessage = `تم نشر رحلة تشويقية في القناة!\nالمورد الحقيقي: ${trip.supplier_name}`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: adminMessage })
      });

      // 3. المساعد الشخصي (VIP Radar) - الاستهداف حسب المدينة
      // جلب جميع الموردين الذين يملكون telegram_chat_id
      const { data: vipSuppliers, error } = await supabase
        .from('suppliers')
        .select('telegram_chat_id, store_name, address')
        .not('telegram_chat_id', 'is', null);

      if (!error && vipSuppliers) {
        for (const supplier of vipSuppliers) {
          // التحقق مما إذا كان عنوان المورد يحتوي على مدينة انطلاق الشاحنة
          const isLocal = supplier.address && supplier.address.toLowerCase().includes(trip.departure_city.toLowerCase());
          
          if (isLocal) {
            const vipMessage = `
🌟 *إشعار VIP حصري لك يا ${supplier.store_name}* 🌟

توجد شاحنة *${trip.truck_type}* فارغة متواجدة الآن بالقرب منك في (*${trip.departure_city}*) وستتجه إلى *${trip.arrival_city}* يوم ${trip.trip_date}.

💼 المورد صاحب الشاحنة: *${trip.supplier_name}*
💰 يمكنك توفير حوالي *${savings.toLocaleString()} درهم* إذا قمت بدمج شحنتك معه!

سارع بالدخول للمنصة وحجز مساحتك قبل الآخرين:
🔗 [الدخول لبورصة اللوجستيك](https://souqbtp.ma/logistics-bourse)
            `;

            // إرسال الرسالة الخاصة للمورد
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: supplier.telegram_chat_id, text: vipMessage, parse_mode: 'Markdown', disable_web_page_preview: true })
            });
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ message: "تم الاستلام" }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})