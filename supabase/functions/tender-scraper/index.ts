import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // سنحاول الدخول لصفحة البحث مباشرة ولكن مع إضافات تعريفية
  const response = await fetch('https://www.marchespublics.gov.ma/pm/', {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Referer": "https://www.marchespublics.gov.ma/"
    }
  });
  
  const html = await response.text();
  
  // هل يحتوي المحتوى على كلمة "Marché"؟
  const containsMarche = html.toLowerCase().includes('marché');

  return new Response(JSON.stringify({ 
    success: true, 
    found_keyword: containsMarche,
    html_length: html.length
  }), { 
    headers: { "Content-Type": "application/json" } 
  });
});