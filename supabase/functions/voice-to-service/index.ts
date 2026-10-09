import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      throw new Error('لم يتم استلام أي ملف صوتي')
    }

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiApiKey) throw new Error('مفتاح OpenAI غير موجود في الإعدادات')

    const whisperFormData = new FormData()
    // 🚀 الإصلاح 1: إجبار إضافة اسم الملف وامتداده لكي يقبله OpenAI
    whisperFormData.append('file', audioFile, 'recording.webm')
    whisperFormData.append('model', 'whisper-1')
    whisperFormData.append('prompt', 'كلام حرفي مغربي بالدارجة يتحدث عن خدمات البناء، الكهرباء، أو السباكة.')

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openAiApiKey}` },
      body: whisperFormData,
    })
    
    const whisperData = await whisperResponse.json()

    // 🚀 الإصلاح 2: قراءة الخطأ الحقيقي من OpenAI إذا حدث
    if (whisperData.error) {
      console.error("OpenAI API Error:", whisperData.error)
      throw new Error(`مشكلة من OpenAI: ${whisperData.error.message}`)
    }

    const transcribedText = whisperData.text
    if (!transcribedText) throw new Error('الملف الصوتي فارغ أو لم يُسمع فيه أي كلام')

    const systemPrompt = `
      أنت مساعد ذكي متخصص في قطاع البناء (BTP) في المغرب. 
      استخرج من النص التالي معلومات خدمة مقاول أو حرفي أو مورد.
      يجب أن تعيد النتيجة حصرياً ككائن JSON نظيف بهذه الصيغة تماماً:
      {
        "title": { "ar": "عنوان للخدمة", "fr": "...", "en": "..." },
        "category": "اختر صنفاً من هذه القائمة الحصرية: [Cement, Steel, Masonry, Tiling, Plumbing, Electrical, Paint, Wood, Welding, Plaster, Aluminum, HVAC, Elevators, Security, Waterproofing, Cleaning, Gardens, SOS, Architect, Topographer, Studies, Control, Interior, Earthworks, Concrete, Industrial, Demolition, Sanitation, HeavyMachinery, Tools, GoodsTransport, DebrisRemoval, Permits, Insurance, VerifiedSuppliers, MajorContractors]. إذا كانت المهنة أو السلعة غير موجودة في هذه القائمة تماماً (مثل: مورد آجور، جبس مغربي تقليدي)، اختر الكلمة 'Other'.",
        "custom_tag": "إذا اخترت 'Other' في التصنيف، اكتب هنا اسم المهنة أو السلعة الدقيق جداً بالفرنسية أو العربية (مثال: Briques Rouges، Zellige Beldi)، وإلا اتركه فارغاً.",
        "description": { "ar": "وصف احترافي", "fr": "...", "en": "..." },
        "price": السعر كرقم (إن ذكره، وإلا 0)
      }
      النص: "${transcribedText}"
    `;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: "json_object" }
      }),
    })

    const gptData = await gptResponse.json()
    
    if (gptData.error) {
       console.error("GPT Error:", gptData.error)
       throw new Error(`خطأ في تحليل النص: ${gptData.error.message}`)
    }

    const jsonString = gptData.choices[0].message.content
    const finalResult = JSON.parse(jsonString)

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in Edge Function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})