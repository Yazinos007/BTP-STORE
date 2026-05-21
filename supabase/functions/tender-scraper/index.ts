import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

serve(async (req) => {
  // هذا الرابط هو رابط النتائج المباشر (بعد الضغط على زر البحث)
  const url = 'https://www.marchespublics.gov.ma/pm/?page=entreprise.EntrepriseAdvancedSearch&cccpage=1';
  
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // سنبحث عن الجدول الذي يحتوي على الصفقات
  // في أغلب المواقع الحكومية يكون داخل جدول أو قائمة
  const tenders: string[] = [];
  $('tr').each((i, el) => {
    const text = $(el).text().trim();
    if (text.includes("Ciment") || text.includes("Construction") || text.includes("Appel")) {
      tenders.push(text);
    }
  });

  return new Response(JSON.stringify({ found: tenders.length, sample: tenders.slice(0, 2) }));
});