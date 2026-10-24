import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// جلب مفاتيح الـ API (تم استبدال UltraMsg بمفاتيح Meta الرسمية)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const META_WA_TOKEN = Deno.env.get('META_WA_TOKEN');
const META_PHONE_ID = Deno.env.get('META_PHONE_ID');

serve(async (req) => {
  try {
    const payload = await req.json();
    const lead = payload.record;

    if (!lead || !lead.phone) {
      return new Response("No lead data found", { status: 400 });
    }

    const formatCurrency = (num: number) => num.toLocaleString('en-US') + ' درهم';

    // ✉️ 1. إرسال الإيميل (عبر Resend)
    if (lead.email && RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'SasBTP <contact@sasbtp.com>', // تأكد من تغيير هذا لإيميلك المعتمد في Resend
          to: [lead.email],
          subject: 'تقرير تكلفة مشروعك جاهز 📊 - SasBTP',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
              <h2 style="color: #06b6d4;">مرحباً بك في SasBTP، ${lead.full_name}! 👋</h2>
              <p>بناءً على مواصفاتك (مساحة ${lead.area_m2} م²، و ${lead.floors} طوابق):</p>
              <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0; color: #475569;">التكلفة التقديرية الإجمالية:</h3>
                <h1 style="color: #4f46e5; margin: 10px 0;">${formatCurrency(lead.estimated_cost_mad)}</h1>
              </div>
              <p>هذا تقدير أولي. سيقوم مستشارونا بالتواصل معك قريباً لتقديم استشارة مجانية وربطك بأفضل المقاولين.</p>
              <br/>
              <p>مع خالص التحيات،<br/><strong>فريق SasBTP</strong></p>
            </div>
          `
        })
      });
    }

    // 💬 2. إرسال رسالة الواتساب (عبر Meta WhatsApp Cloud API)
    // تنظيف الرقم وإضافة كود المغرب
    let phone = lead.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '212' + phone.substring(1); 
    }

    const waMessage = `مرحباً ${lead.full_name} 👋\n\nشكراً لطلبك عبر منصة *SasBTP* 🏗️\n\nالتكلفة التقديرية لمشروعك بناءً على المعطيات التي أدخلتها هي:\n💰 *${formatCurrency(lead.estimated_cost_mad)}*\n\nهذا مجرد تقدير أولي. هل أنت جاهز للخطوة التالية لنربطك بأفضل المقاولين والمهندسين لتقديم عروض أسعار حقيقية ومفصلة؟ 🤝`;

    if (META_WA_TOKEN && META_PHONE_ID) {
      // استخدام رابط الجراف API الرسمي من فيسبوك (الإصدار v17.0 أو أحدث)
      const metaApiUrl = `https://graph.facebook.com/v17.0/${META_PHONE_ID}/messages`;
      
      const response = await fetch(metaApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${META_WA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phone,
          type: "text", // رسالة نصية حرة
          text: {
            preview_url: false,
            body: waMessage
          }
        })
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Meta API Error:", result);
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Notifications sent via Meta!" }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
});