import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

serve(async (req) => {
  const response = await fetch('https://www.marchespublics.gov.ma/pm/?page=entreprise.EntrepriseAdvancedSearch', {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // استخراج جميع الـ Classes الفريدة في الصفحة
  const classes = new Set<string>();
  $('*').each((i, el) => {
    const className = $(el).attr('class');
    if (className) {
      className.split(' ').forEach(c => classes.add(c));
    }
  });

  return new Response(JSON.stringify({ classes: Array.from(classes).slice(0, 50) }));
});