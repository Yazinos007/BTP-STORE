import React from 'react';

const EmpireLanding = () => {
  return (
    <div className="enterprise-landing-page" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", backgroundColor: '#0F172A', color: '#F8FAFC', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* يمكنك نقل هذه الأنماط إلى ملف CSS منفصل لتحسين ترتيب الكود */}
      <style>{`
        .enterprise-landing-page {
          --primary-blue: #1A5276; 
          --accent-green: #7DCEA0; 
          --accent-orange: #F39C12; 
          --dark-bg: #0F172A;      
          --text-light: #F8FAFC;
          --text-muted: #94A3B8;
          line-height: 1.6;
        }
        .hero-section {
          position: relative;
          padding: 80px 20px 60px;
          text-align: center;
          background: radial-gradient(circle at top, #1e293b 0%, var(--dark-bg) 70%);
          overflow: hidden;
        }
        .hero-section::before {
          content: ''; position: absolute; top: -20%; left: 50%; transform: translateX(-50%); width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(26, 82, 118, 0.4) 0%, rgba(15, 23, 42, 0) 70%); z-index: 0; pointer-events: none;
        }
        .hero-section::after {
          content: ''; position: absolute; bottom: -10%; right: -10%; width: 40vw; height: 40vw; background: radial-gradient(circle, rgba(243, 156, 18, 0.15) 0%, rgba(15, 23, 42, 0) 70%); z-index: 0; pointer-events: none;
        }
        .hero-content { relative; z-index: 1; max-width: 800px; margin: 0 auto; }
        .hook-text { color: var(--accent-orange); font-size: 1.2rem; font-weight: 800; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .main-title { font-size: 3.5rem; font-weight: 900; margin-bottom: 25px; line-height: 1.2; background: linear-gradient(to right, #fff, var(--text-muted)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .main-title span { color: var(--accent-green); -webkit-text-fill-color: var(--accent-green); display: inline-block; position: relative; }
        .main-title span::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 100%; height: 4px; background: var(--accent-orange); border-radius: 2px; transform: skewX(-15deg); }
        .sub-title { font-size: 1.4rem; color: var(--text-muted); margin-bottom: 40px; font-weight: 500; }
        
        .enterprise-card-wrapper { position: relative; max-width: 600px; margin: 0 auto 50px auto; z-index: 2; }
        .glow-effect { position: absolute; inset: -4px; background: linear-gradient(45deg, var(--primary-blue), var(--accent-green), var(--accent-orange), var(--primary-blue)); border-radius: 24px; filter: blur(15px); opacity: 0.7; animation: glowPulse 4s ease-in-out infinite; z-index: -1; }
        @keyframes glowPulse { 0% { filter: blur(15px); opacity: 0.7; } 50% { filter: blur(25px); opacity: 1; } 100% { filter: blur(15px); opacity: 0.7; } }
        .enterprise-card { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px 30px; text-align: center; position: relative; box-shadow: inset 0 0 20px rgba(26, 82, 118, 0.5); transition: transform 0.3s ease; }
        .enterprise-card:hover { transform: translateY(-5px); }
        .badge { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg, #F1C40F, var(--accent-orange)); color: #000; padding: 8px 24px; border-radius: 30px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4); white-space: nowrap; display: flex; align-items: center; gap: 8px; }
        .card-icon { font-size: 3rem; margin-bottom: 15px; }
        .card-title { font-size: 2.2rem; font-weight: 900; color: #fff; margin-bottom: 5px; }
        .card-subtitle { color: var(--accent-green); font-weight: 700; font-size: 1.1rem; margin-bottom: 25px; }
        .features-list { list-style: none; text-align: right; margin-bottom: 30px; padding: 0;}
        .features-list li { margin-bottom: 15px; font-size: 1.1rem; display: flex; align-items: flex-start; gap: 10px; }
        .features-list li::before { content: '✓'; color: var(--accent-green); font-weight: bold; font-size: 1.2rem; }
        
        .gifts-section { padding: 60px 20px; background-color: rgba(26, 82, 118, 0.1); border-top: 1px solid rgba(26, 82, 118, 0.3); border-bottom: 1px solid rgba(26, 82, 118, 0.3); position: relative; }
        .section-title { text-align: center; font-size: 2.5rem; font-weight: 800; margin-bottom: 50px; color: var(--accent-orange); }
        .gifts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto; }
        .gift-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(125, 206, 160, 0.2); border-radius: 15px; padding: 30px; text-align: right; position: relative; overflow: hidden; transition: all 0.3s ease; }
        .gift-box:hover { background: rgba(255,255,255,0.05); border-color: var(--accent-green); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .gift-icon { font-size: 2.5rem; margin-bottom: 15px; color: var(--accent-green); }
        .gift-title { font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 10px; }
        .gift-desc { color: var(--text-muted); font-size: 1rem; }
        
        .cta-container { display: flex; flex-direction: column; align-items: center; gap: 25px; padding: 60px 20px; background: linear-gradient(to bottom, transparent, rgba(26, 82, 118, 0.2)); }
        .btn-whatsapp { display: inline-flex; align-items: center; justify-content: center; gap: 12px; background: linear-gradient(90deg, #25D366, #128C7E); color: #fff; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-size: 1.4rem; font-weight: 800; box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4); transition: all 0.3s ease; position: relative; overflow: hidden; }
        .btn-whatsapp::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transform: skewX(-20deg); animation: shine 3s infinite; }
        @keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
        .btn-whatsapp:hover { transform: scale(1.05); box-shadow: 0 15px 35px rgba(37, 211, 102, 0.6); }
        .btn-whatsapp svg { width: 28px; height: 28px; }
        .urgency-box { margin-top: 25px; padding: 15px; background: rgba(243, 156, 18, 0.1); border: 1px dashed var(--accent-orange); border-radius: 10px; display: inline-block; max-width: 600px; }
        .urgency-text { font-size: 1.1rem; color: var(--accent-orange); font-weight: 700; margin:0;}
        
        @media (max-width: 768px) {
          .main-title { font-size: 2.5rem; }
          .sub-title { font-size: 1.2rem; }
          .enterprise-card { padding: 30px 20px; }
          .card-title { font-size: 1.8rem; }
          .section-title { font-size: 2rem; }
          .btn-whatsapp { padding: 15px 30px; font-size: 1.2rem; width: 100%; }
        }
      `}</style>

      <header className="hero-section">
        <div className="hero-content">
          <p className="hook-text">راك بنيتي إمبراطورية فالسوق تبارك الله، ولكن واش ما عييتيش من التبرزيط اليومي ديال كترة الوراق والتسيير لي كياكل ليك صحتك ووقتك؟</p>
          <h1 className="main-title">أنا كنقلّب على خدمة وبغيت <span>نخدم معاك!</span></h1>
          <p className="sub-title">شحال تعطيني إلا قلت ليك بلي غادي نتكلف ليك بتسيير شركتك وتجارتك من الألف للياء؟ إيييييه، سمعتي مزيان وأنا ما خطأتش!</p>

          <div className="enterprise-card-wrapper">
            <div className="glow-effect"></div>
            <div className="enterprise-card">
              <div className="badge">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                SouqBTP Enterprise 👑
              </div>
              <div className="card-icon">🚀</div>
              <h2 className="card-title">الموظف الخارق</h2>
              <p className="card-subtitle">الباقة الملكية - وصول شامل لجميع الخدمات 24/7</p>
              
              <ul className="features-list">
                <li><strong>حارس الديبو:</strong> يضبط السلعة الداخلة والخارجة بالحبة.</li>
                <li><strong>المحاسب الصارم:</strong> يحسب الربح الصافي والـ CPC بدون أخطاء.</li>
                <li><strong>محصّل الديون:</strong> رسائل واتساب ذكية لتذكير الزبائن بالخلاص.</li>
                <li><strong>موجّه الشاحنات:</strong> تتبع الطلبيات باش ما يرجع حتى كاميو خاوي.</li>
                <li><strong>صيّاد الصفقات:</strong> رادار مناقصات يجيب ليك الطلبيات الكبيرة قبل المنافسين.</li>
                <li><strong>التوليد الآلي:</strong> توليد جميع وثائق البيع والشراء تلقائيا عند تنفيذ العمليات.</li>
                <li><strong>إدارة الـ HR:</strong> تسيير كل ما يتعلق بالموارد البشرية.</li>
                <li><strong>واجهة دائمة:</strong> عرض كل المنتجات في الماركت بليس للأبد.</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <section className="gifts-section">
        <h2 className="section-title">شحال باغي فـ الصالير؟</h2>
        <div style={{textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px', color: '#fff', fontSize: '1.2rem', fontWeight: '500'}}>
            ما غنطلب منك لا 10,000 درهم فالشهر، لا CNSS، لا كونجي... وفوق هادشي كامل، نهار نتفقو غنجيب ليك <strong>هدايا مجانية</strong> من عندي:
        </div>
        
        <div className="gifts-grid">
            <div className="gift-box">
                <div className="gift-icon">🛠️</div>
                <h3 className="gift-title">خدمة التسليم فـ اليد</h3>
                <p className="gift-desc">غندخل ليك أول 100 منتج ديالك بالتصاور والأثمنة حتى تلقى السيستم ديالك واجد 100%.</p>
            </div>
            
            <div className="gift-box">
                <div className="gift-icon">📢</div>
                <h3 className="gift-title">3 شهور تسويق بالمجان</h3>
                <p className="gift-desc">غندير ليك إعلانات ممولة للمنتجات والمتجر ديالك باش يجيوك طلبيات جداد وزبائن أكثر.</p>
            </div>

            <div className="gift-box" style={{borderColor: 'var(--accent-orange)'}}>
                <div className="gift-icon" style={{color: 'var(--accent-orange)'}}>🛡️</div>
                <h3 className="gift-title" style={{color: 'var(--accent-orange)'}}>درع الهيبة والوجاهة</h3>
                <p className="gift-desc">غادي يوصلك للمكتب ديالك درع أكريليك ذهبي محفور باسم شركتك (مورد معتمد SouqBTP) لزيادة الثقة + مفكرة جلدية فاخرة + 10 بطاقات عمل (NFC) ذكية لمندوبي مبيعاتك.</p>
            </div>
        </div>
      </section>

      <div style={{background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--primary-blue)', borderLeft: '4px solid var(--accent-orange)', borderRadius: '15px', padding: '25px', maxWidth: '800px', margin: '0 auto 40px', textAlign: 'right', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'}}>
        <h4 style={{color: 'var(--accent-orange)', fontSize: '1.3rem', marginBottom: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span>⚠️</span> توضيح هام (وبشرى سارة للمشغولين جداً):
        </h4>
        <p style={{color: 'var(--text-light)', fontSize: '1.1rem', lineHeight: '1.8', margin: '0'}}>
            "الموظف الخارق" لي هضرنا عليه الفوق هو <strong>النظام الرقمي الذكي</strong> ديال SouqBTP لي غيولي الدراع ليمن ديالك ويسهل خدمتك لدرجة غتسير كلشي غير من تليفونك. 
            <br/><br/>
            ولكن، إلا كنتي مشغول لدرجة معندكش الوقت نهائياً، وبغيتي <strong>فريق بشري محترف</strong> من عندنا يتكلف ليك بإدخال الفواتير اليومية والتسيير الكامل 100% عن بعد... هادي <strong>خدمة VIP إضافية (تسيير شامل)</strong> متوفرة عندنا بتكلفة مخصصة. سولنا عليها فـ الواتساب!
        </p>
      </div>

      <section className="cta-container">
        <a href="https://wa.me/212700715399?text=مرحباً،%20أنا%20مهتم%20بمشروع%20الإمبراطورية%20وباقة%20Enterprise%20السنوية" className="btn-whatsapp" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            إلا بغيتي التفاصيل، كليكي هنا!
        </a>
        <div className="urgency-box">
            <p className="urgency-text">⏳ هاد العرض والهدايا الحصرية متاحة فقط مع <strong>الاشتراك السنوي</strong>، ومحدودة لـ 3 موردين فقط في كل مدينة.</p>
        </div>
      </section>

    </div>
  );
};

export default EmpireLanding;