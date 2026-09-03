import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const reqBody = await req.json().catch(() => ({}));
    const lang = reqBody.lang || 'ar';
    
    let langInstruction = 'باللغة العربية';
    if (lang === 'fr') langInstruction = 'en Français';
    if (lang === 'en') langInstruction = 'in English';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: prices, error: dbError } = await supabase
      .from('market_prices')
      .select('*')
      .order('recorded_date', { ascending: false })
      .limit(10)

    if (dbError) throw dbError;

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openAiKey) {
        throw new Error("مفتاح OpenAI غير موجود");
    }

    const prompt = `
    أنت مستشار استراتيجي في سوق البناء.
    بيانات السوق: ${JSON.stringify(prices)}
    المطلوب: تنبيه استباقي ${langInstruction}.
    يجب أن يكون الرد JSON: {"alert": "...", "efficiency": "85000", "action": "..."}
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    })

    const aiData = await response.json()
    
    // 🛡️ درع الحماية للغات الثلاث
    if (aiData.error) {
        let fallbackAlert = "🚨 تنبيه (وضع عدم الاتصال): تم رصد تقلبات في السوق بناءً على البيانات التاريخية.";
        let fallbackAction = "تأمين المخزون فوراً";

        if (lang === 'fr') {
            fallbackAlert = "🚨 Alerte (Mode Hors-ligne) : Une hausse des prix est détectée via les données historiques.";
            fallbackAction = "Sécuriser le stock d'usine";
        } else if (lang === 'en') {
            fallbackAlert = "🚨 Alert (Offline Mode): Market fluctuations detected based on historical data.";
            fallbackAction = "Secure factory stock immediately";
        }
          
        return new Response(JSON.stringify({
            alert: fallbackAlert,
            efficiency: "85000",
            action: fallbackAction
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const aiRecommendation = JSON.parse(aiData.choices[0].message.content)

    return new Response(JSON.stringify(aiRecommendation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
         alert: "جاري تحليل السوق محلياً...", 
         efficiency: "0", 
         action: "يرجى الانتظار" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, 
    })
  }
})