import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

serve(async (req) => {
  const response = await fetch('https://www.marchespublics.gov.ma/pm/?page=entreprise.EntrepriseAdvancedSearch', {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // استخراج النص من داخل div الذي يحمل class="content"
  const contentText = $('.content').text().trim();
  
  // سنعيد الجزء الأول لنرى هل يحتوي على تفاصيل صفقات
  return new Response(JSON.stringify({ 
    success: true, 
    data: contentText.substring(0, 500) 
  }), { 
    headers: { "Content-Type": "application/json" } 
  });
});