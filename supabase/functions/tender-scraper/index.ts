import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

serve(async (req) => {
  const response = await fetch('https://www.marchespublics.gov.ma/pm/?page=entreprise.EntrepriseAdvancedSearch', {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await response.text();
  const $ = cheerio.load(html);

  // البحث عن أي عناصر تحتوي على نصوص تشبه عناوين المناقصات
  const sampleData: string[] = [];
  
  // هذه محاولة لالتقاط أي عناوين (غالباً ما تكون في h2 أو h3 أو روابط)
  $('h2, h3, a').each((i, el) => {
    const text = $(el).text().trim();
    if (text.length > 20 && text.length < 100) {
      sampleData.push(text);
    }
  });

  console.log("وجدنا هذه العناوين المحتملة في الصفحة:", JSON.stringify(sampleData.slice(0, 10)));

  return new Response(JSON.stringify({ status: "Done", count: sampleData.length }));
});