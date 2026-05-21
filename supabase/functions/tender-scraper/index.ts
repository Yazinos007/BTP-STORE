import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

serve(async (req) => {
  // ندخل من الباب الرئيسي
  const response = await fetch('https://www.marchespublics.gov.ma/pm/', {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // سنبحث عن أي رابط يحتوي على كلمة "search" أو "recherche"
  const links: string[] = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (href.toLowerCase().includes('search') || href.toLowerCase().includes('recherche')) {
      links.push(href);
    }
  });

  return new Response(JSON.stringify({ 
    success: true, 
    found_links: links.slice(0, 10) 
  }), { 
    headers: { "Content-Type": "application/json" } 
  });
});