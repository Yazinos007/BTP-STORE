const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emioaqamotrycdonsswv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaW9hcWFtb3RyeWNkb25zc3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTg1MzAsImV4cCI6MjA4MDkzNDUzMH0.ARIB-gbtSz_Bk4l3tj_34GkzRWL-0grI2XDPGfkYU5g';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
const browser = await chromium.launch({ 
  headless: true, // مهم جداً
  args: [
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ] 
});
  const page = await browser.newPage();
  
  await page.goto('https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&searchAnnCons');
  await page.getByRole('button', { name: /OK/i }).click();
  await page.waitForTimeout(5000); 

  const tenders = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr'));
    console.log("عدد الصفوف التي تم العثور عليها:", rows.length);
    return rows.map(row => {
      const text = row.innerText.trim();
      if (text.includes("Objet :")) {
        // تحويل التاريخ هنا مباشرة داخل المتصفح
        const rawDate = text.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];
        let formattedDate = '1900-01-01'; // قيمة افتراضية
        if (rawDate) {
          const [d, m, y] = rawDate.split('/');
          formattedDate = `${y}-${m}-${d}`;
        }

        return {
          reference: text.match(/\d{2,}\/\d{4,}\/[A-Z0-9\/]+/)?.[0] || 'N/A',
          objet: text.split("Objet :")[1]?.split("Acheteur public")[0]?.trim(),
          deadline: formattedDate,
          title_ar: "صفقة جديدة",
          title_fr: text.split("Objet :")[1]?.split("Acheteur public")[0]?.trim().substring(0, 100) || "N/A"
        };
      }
      return null;
    }).filter(item => item !== null);
  });

  console.log("عدد الصفقات التي تم استخراجها من الموقع:", tenders.length);
  const { data, error } = await supabase.from('tenders').insert(tenders);

  if (error) {
    console.error("خطأ Supabase:", error);
    process.exit(1); // الخروج بكود خطأ
  } else {
    // هذه هي الرسالة التي سيلتقطها نظام التنبيه
    console.log(`SUCCESS_COUNT:${tenders.length}`);
  }
  
  await browser.close();
})();