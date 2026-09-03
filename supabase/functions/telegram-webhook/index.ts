import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = '8851772110:AAEl8LrqU_QwcuyYX4koXwPpDFxRWzZs3C4';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
// نستخدم مفتاح Service Role لتجاوز صلاحيات RLS والسماح للبوت بتحديث القاعدة
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; 

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const payload = await req.json();

    // التأكد من أن الحدث هو رسالة نصية من مستخدم
    if (payload.message && payload.message.text) {
      const text = payload.message.text;
      const chatId = payload.message.chat.id;

      // التقاط أمر الربط العميق (Deep Link)
      if (text.startsWith('/start ')) {
        const supplierId = text.split(' ')[1]; // استخراج كود المورد من الرابط

        // ⚠️ ملاحظة: تأكد من اسم جدول الموردين لديك (هنا افترضنا أنه admin_users)
        const { error } = await supabase
          .from('suppliers') 
          .update({ telegram_chat_id: chatId.toString() })
          .eq('id', supplierId);

        let replyText = "✅ *تم ربط حسابك في SouqBTP بنجاح!*\nستتوصل الآن بفرص اللوجستيك (الرجوع عامر) التي تنطلق من مدينتك مباشرة هنا، وبشكل حصري (VIP). 🚛✨";
        
        if (error) {
            replyText = `❌ حدث خطأ أثناء ربط الحساب. التفاصيل التقنية: ${error.message}`;
        }

        // إرسال رد التأكيد للمورد
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: replyText, parse_mode: 'Markdown' })
        });
      }
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Error", { status: 500 });
  }
})