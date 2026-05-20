import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // 1. تحميل الصفحة (استخدام proxy لضمان عدم الحظر)
  const response = await fetch('https://www.marchespublics.gov.ma/pm/?page=entreprise.EntrepriseAdvancedSearch');
  const html = await response.text();
  const $ = cheerio.load(html);

  // 2. استخراج العناوين (هنا نجمع البيانات الخام)
  const tenders = [];
  $('.result-item').slice(0, 3).each((i, el) => {
    tenders.push({
      rawText: $(el).text().trim()
    });
  });

  // 3. معالجة البيانات عبر AI
  for (const tender of tenders) {
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `حلل النص التالي واستخرج البيانات في JSON: ${tender.rawText}` }],
        response_format: { type: "json_object" }
      }),
    });

    const aiData = await aiResponse.json();
    const structured = JSON.parse(aiData.choices[0].message.content);

    // 4. الحفظ في Supabase
    await supabase.from("tenders").insert(structured);
  }

  return new Response(JSON.stringify({ status: "Done" }), { headers: { "Content-Type": "application/json" } });
});