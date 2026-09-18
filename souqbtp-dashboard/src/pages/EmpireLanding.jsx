import React from 'react';

const EmpireLanding = () => {
  return (
    <div className="empire-landing-page" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 🎨 Styles Definition */}
      <style>{`
        .empire-landing-page {
          --primary-steel: #1e3a8a;
          --accent-orange: #f97316;
          --accent-yellow: #f59e0b;
          --accent-green: #10b981;
          --dark-bg: #0f172a;
          --text-light: #f8fafc;
          --text-muted: #94a3b8;
          line-height: 1.6;
          background-image: linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1541888086925-0c13d4ccba80?auto=format&fit=crop&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
        }

        .hero-section {
          position: relative;
          padding: 80px 20px 60px;
          text-align: center;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 70vw;
          height: 70vw;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
          z-index: 0;
          pointer-events: none;
        }

        .hero-content { position: relative; z-index: 1; max-width: 850px; margin: 0 auto; }

        .shock-alert {
          display: inline-block; background: rgba(249, 115, 22, 0.15); border: 1px solid var(--accent-orange);
          color: var(--accent-orange); padding: 8px 20px; border-radius: 50px; font-weight: 800; font-size: 1rem;
          margin-bottom: 25px; animation: pulse-alert 2s infinite;
        }

        @keyframes pulse-alert {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }

        .hook-text { color: var(--text-light); font-size: 1.3rem; font-weight: 700; margin-bottom: 25px; text-shadow: 0 2px 10px rgba(0,0,0,0.8); line-height: 1.8; }
        .hook-text span { color: var(--accent-yellow); }

        .main-title { font-size: 3.5rem; font-weight: 900; margin-bottom: 25px; line-height: 1.2; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .main-title span { color: var(--accent-orange); display: inline-block; position: relative; }
        .main-title span::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 100%; height: 6px; background: var(--accent-yellow); border-radius: 3px; transform: skewX(-20deg); }

        .sub-title { font-size: 1.4rem; color: var(--text-muted); margin-bottom: 50px; font-weight: 500; }

        .enterprise-card-wrapper { position: relative; max-width: 650px; margin: 0 auto 50px auto; z-index: 2; }
        .glow-effect {
          position: absolute; inset: -4px;
          background: linear-gradient(45deg, var(--accent-orange), var(--primary-steel), var(--accent-yellow), var(--accent-orange));
          border-radius: 30px; filter: blur(20px); opacity: 0.75; animation: glowPulse 4s ease-in-out infinite; z-index: -1;
        }

        @keyframes glowPulse {
          0% { filter: blur(20px); opacity: 0.75; }
          50% { filter: blur(35px); opacity: 1; }
          100% { filter: blur(20px); opacity: 0.75; }
        }

        .enterprise-card { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(25px); border: 2px solid rgba(249, 115, 22, 0.3); border-radius: 25px; padding: 50px 30px 40px; text-align: center; position: relative; box-shadow: inset 0 0 30px rgba(249, 115, 22, 0.1); }
        
        .badge { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg, var(--accent-yellow), var(--accent-orange)); color: #000; padding: 10px 30px; border-radius: 50px; font-weight: 900; font-size: 1rem; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.5); white-space: nowrap; display: flex; align-items: center; gap: 10px; border: 4px solid var(--dark-bg); }
        .card-icon { font-size: 3.5rem; margin-bottom: 15px; text-shadow: 0 0 20px rgba(249, 115, 22, 0.5); }
        .card-title { font-size: 2.4rem; font-weight: 900; color: #fff; margin-bottom: 5px; }
        .card-subtitle { color: var(--accent-orange); font-weight: 800; font-size: 1.2rem; margin-bottom: 30px; }
        
        .features-list { list-style: none; text-align: right; margin-bottom: 30px; padding: 0;}
        .features-list li { margin-bottom: 18px; font-size: 1.15rem; display: flex; align-items: flex-start; gap: 12px; color: #e2e8f0; font-weight: 500; }
        .features-list li::before { content: '🏗️'; font-size: 1.2rem; }
        .features-list li strong { color: var(--accent-yellow); }

        .gifts-section { padding: 80px 20px; background: linear-gradient(to bottom, rgba(15,23,42,0.9), rgba(30,58,138,0.2)); border-top: 1px solid rgba(249, 115, 22, 0.3); border-bottom: 1px solid rgba(249, 115, 22, 0.3); position: relative; }
        .section-title { text-align: center; font-size: 2.8rem; font-weight: 900; margin-bottom: 30px; color: var(--accent-yellow); text-shadow: 0 5px 15px rgba(245, 158, 11, 0.3); }

        .gifts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1100px; margin: 0 auto; }
        .gift-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 35px 25px; text-align: right; position: relative; overflow: hidden; transition: all 0.4s ease; }
        .gift-box:hover { background: rgba(255,255,255,0.06); border-color: var(--accent-orange); box-shadow: 0 15px 40px rgba(249, 115, 22, 0.15); transform: translateY(-5px); }
        .gift-icon { font-size: 3rem; margin-bottom: 20px; display: inline-block; }
        .gift-title { font-size: 1.5rem; font-weight: 900; color: #fff; margin-bottom: 12px; }
        .gift-desc { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; }

        .vip-box { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--primary-steel); border-right: 5px solid var(--accent-green); border-radius: 20px; padding: 30px; max-width: 850px; margin: 0 auto 50px auto; text-align: right; box-shadow: 0 15px 35px rgba(0,0,0,0.4); backdrop-filter: blur(10px); }
        .vip-box h4 { color: var(--accent-green); font-size: 1.4rem; margin-bottom: 15px; font-weight: 900; display: flex; align-items: center; gap: 10px; }

        .cta-container { display: flex; flex-direction: column; align-items: center; gap: 25px; padding: 80px 20px 100px; position: relative; }
        .btn-whatsapp { display: inline-flex; align-items: center; justify-content: center; gap: 15px; background: linear-gradient(90deg, #25D366, #128C7E); color: #fff; text-decoration: none; padding: 20px 50px; border-radius: 50px; font-size: 1.5rem; font-weight: 900; box-shadow: 0 15px 35px rgba(37, 211, 102, 0.4); transition: all 0.3s ease; position: relative; overflow: hidden; }
        .btn-whatsapp::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transform: skewX(-20deg); animation: shine 3s infinite; }
        
        @keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
        .btn-whatsapp:hover { transform: scale(1.05) translateY(-5px); box-shadow: 0 20px 45px rgba(37, 211, 102, 0.6); }
        .btn-whatsapp svg { width: 32px; height: 32px; }
        
        .urgency-box { margin-top: 30px; padding: 20px; background: rgba(249, 115, 22, 0.1); border: 2px dashed var(--accent-orange); border-radius: 15px; display: inline-block; max-width: 750px; text-align: center; }
        .urgency-text { font-size: 1.2rem; color: var(--accent-yellow); font-weight: 800; line-height: 1.6; margin: 0; }

        @media (max-width: 768px) {
          .main-title { font-size: 2.2rem; }
          .sub-title { font-size: 1.1rem; }
          .enterprise-card { padding: 40px 20px 30px; }
          .card-title { font-size: 2rem; }
          .section-title { font-size: 2rem; }
          .btn-whatsapp { padding: 18px 30px; font-size: 1.2rem; width: 100%; }
        }
      `}</style>

      {/* 🚀 Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="shock-alert">⚠️ تحذير: كبريات الشركات العقارية تنقل أنشطتها إلى العالم الرقمي‫!‬ آش باقي تتساين؟‫!‬؟‫!‬</div>
          
          <p className="hook-text">
            المقاول التقليدي لي مزال خدام بالورقة والستيلو <span>غادي يخرج من السوق فهاد 3 سنين الجاية</span>. المنافسين ديالك ولاو كيشدو لي زابيل دوفغ (Appels d'offres) ويسيرو الأوراش بالتكنولوجيا وهما جالسين فبيرواتهم وتيشربو قهيوا!
          </p>
          
          <h1 className="main-title">أنا <span>الشاف شونطي الرقمي</span> ديالك، وبغيت نسهل عليك العناء ديال الخدمة!</h1>
          
          <p className="sub-title">تخيل معايا نظام ERP ذكي كيحسب، كيراقب الخدامة والسلعة، وكيجيب ليك الصفقات بلا ما تعصب راسك، بل كتر من هادشي تيعطيك تحليل تفصيلي للصفقة ويعطيك المصاريف والأرباح والسلع المطلوبة وعدد المنافسين المحتملين في هاد الصفقة وزيد وزيد، أو هادشي كامل بضغطة زر.</p>

          <div className="enterprise-card-wrapper">
            <div className="glow-effect"></div>
            <div className="enterprise-card">
              <div className="badge">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                SouqBTP V2 Enterprise 👑
              </div>
              <div className="card-icon">👷‍♂️⚙️</div>
              <h2 className="card-title">النظام الإمبراطوري</h2>
              <p className="card-subtitle">دراعك ليمن لي مكيغلطش ومكينعسش 24/7</p>
              
              <ul className="features-list">
                <li><strong>المُدقق المالي (Audit):</strong> كيحسب ليك TVA والربح الصافي (CPC) ريال بريال، وكيخرج ليك تقرير واجد للمحاسب بنقرة وحدة، وتيتنبأ ليك بمؤشر السيولة.</li>
                <li><strong>رادار المناقصات (Tenders):</strong> كيجيب ليك لي زابيل دوفغ المفتوحة فمدينتك قبل ما يوصلو ليها المنافسين.</li>
                <li><strong>مراقب السلعة:</strong> مكيخلي حتى ياجورة ولا خنشة السيما تضيع، تتبع دقيق للمشتريات من الموردين (B2B).</li>
                <li><strong>مدير الخدامة (HR):</strong> كيسير ليك الصاليرات، لي بوانتاج، الغياب، والسلفيات بكل سهولة.</li>
                <li><strong>كاميرا الميدان + المسار:</strong> عينك على الشانطي وتتبع نسبة الإنجاز اليومية مباشرة من تليفونك.</li>
                <li><strong>منسق الشاحنات:</strong> باش حتى كاميو ديالك ما يرجع خاوي (Bourse de Fret).</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* 🚀 Gifts Section */}
      <section className="gifts-section">
        <h2 className="section-title">أو باش تزيد التقة بيناتنا غادي نعطيوك 3 الهدايا مجانية غادي تعاونك بزاف في خدمتك!</h2>
        <div style={{textAlign: 'center', maxWidth: '900px', margin: '0 auto 50px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500', lineHeight: '1.8'}}>
          ملي غتشترك معانا فالباقة السنوية، غنعطيوك هاد الهدايا الحصرية باش تدخل للعالم الرقمي بقوة وهيبة، وتخلي المنافسين ديالك موراك:
        </div>
        
        <div className="gifts-grid">
          <div className="gift-box">
            <div className="gift-icon">💻</div>
            <h3 className="gift-title">إعداد النظام بالكامل</h3>
            <p className="gift-desc">غنهزّو عليك الدق! فريقنا غيدخل ليك معلومات الخدامة، لي فورنيسور، والسلعة ديالك باش تلقى السيستم واجد 100% للخدمة من نهارك اللول.</p>
          </div>
          
          <div className="gift-box">
            <div className="gift-icon">🤖</div>
            <h3 className="gift-title">مستشار جبائي (AI Agent)</h3>
            <p className="gift-desc">مساعد ذكي مدمج فالسيت، مدرب على قوانين الضرائب المغربية باش يجاوب على أسئلتك اليومية ويوجهك كيفاش تحمي مقاولتك من الغرامات.</p>
          </div>

          <div className="gift-box" style={{borderColor: 'var(--accent-yellow)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)'}}>
            <div className="gift-icon" style={{color: 'var(--accent-yellow)'}}>🏅</div>
            <h3 className="gift-title" style={{color: 'var(--accent-yellow)'}}>حقيبة الهيبة (VIP Kit)</h3>
            <p className="gift-desc">غيوصلك لــلبيرو ديالك درع أكريليك ذهبي (مقاول معتمد SouqBTP) + مفكرة جلدية فاخرة + 10 بطاقات NFC ذكية باش تبارطاجي معلومات شركتك مع الكليان غير بالسكان ديال QR!</p>
          </div>
        </div>
      </section>

      {/* 🚀 VIP Box */}
      <div style={{padding: '20px'}}>
        <div className="vip-box">
          <h4><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg> حل سحري للمقاولين المشغولين جداً!</h4>
          <p style={{color: 'var(--text-light)', fontSize: '1.15rem', lineHeight: '1.8', margin: '0'}}>
            هاد النظام صايبناه باش تسير بيه خدمتك من تليفونك، ولكن... <strong>إلا كان وقتك عامر وما مساليش نهائياً؟</strong><br/><br/>
            وفرنا ليك <strong>خدمة الـ VIP (تسيير شامل)</strong>. فريق محترف من عندنا غيتكلف بإدخال الفواتير ديالك، حساب الخدامة، ومتابعة المصاريف يومياً عن بعد. بحال إلا عندك جيش ديال الموظفين خبراء في الميدان ديالهم بـ 10% من ثمنهم الحقيقي! (سولنا عليها فالواتساب).
          </p>
        </div>
      </div>

      {/* 🚀 CTA Section */}
      <section className="cta-container">
        <a href="https://wa.me/212700715399?text=مرحباً،%20أنا%20مقاول%20ومهتم%20بمشروع%20الإمبراطورية%20وباقة%20Enterprise%20السنوية!" className="btn-whatsapp" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          مرحباً، أنا مقاول وبغيت نطور خدمتي للـ Enterprise!
        </a>
        <div className="urgency-box">
          <p className="urgency-text">⏳ تنبيه: الاشتراك في الباقة متاح للجميع، لكن <strong>الهدايا الذهبية وحقيبة الـ VIP Kit</strong> متوفرة فقط لأول 3 مقاولين يشتركون سنوياً في كل مدينة. ما تضيعش هديتك!</p>
        </div>
      </section>

    </div>
  );
};

export default EmpireLanding;