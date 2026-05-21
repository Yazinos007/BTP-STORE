import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const response = await fetch('https://www.marchespublics.gov.ma/pm/?page=entreprise.EntrepriseAdvancedSearch', {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
      }
    });
    
    const html = await response.text();
    
    // سنعيد أول 500 حرف من HTML مباشرة في الـ Response
    return new Response(JSON.stringify({ 
      success: true, 
      preview: html.substring(0, 500) 
    }), { 
      headers: { "Content-Type": "application/json" } 
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }));
  }
});