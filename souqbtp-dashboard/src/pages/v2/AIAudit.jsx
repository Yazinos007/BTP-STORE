import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  ShieldCheck, AlertTriangle, TrendingUp, Download, FileSignature, 
  CheckCircle, Loader2, BrainCircuit, Activity, FileText, CreditCard 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 🚀 خوارزمية الرسوم المتحركة البطيئة جداً (الدرامية)
function useAnimatedNumber(endValue, duration = 7000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // تأثير التباطؤ الممتد (Cubic Ease-Out)
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(easeOutProgress * endValue));
      if (progress < 1) window.requestAnimationFrame(step);
      else setValue(endValue);
    };
    window.requestAnimationFrame(step);
  }, [endValue, duration]);
  return value;
}

export default function AIAudit() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode !== undefined ? context.isDarkMode : true; 
  const { language } = useSettingsStore();
  const isRtl = language === 'ar';

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => { 
    setTimeout(() => setIsLoading(false), 800); 
    // تأخير بسيط لإطلاق الأنيميشن للأشرطة بشكل درامي بعد التحميل
    setTimeout(() => setMounted(true), 1200);
  }, []);

  const translations = {
    ar: {
      title: 'التدقيق المالي الذكي (AI Audit)', subtitle: 'تحليل المخاطر، تتبع الأشطر، وتقارير ختامية معتمدة.',
      budget: 'الميزانية الإجمالية', spent: 'إجمالي المنصرف', balance: 'الرصيد المتبقي', health: 'مؤشر الأمان المالي',
      aiInsights: 'تحليلات المستشار الذكي', riskLow: 'مخاطر منخفضة', riskMedium: 'تنبيه سيولة',
      tranches: 'تتبع أشطر المشروع (Tranches)', tranche1: 'الشطر الأول (50%)', tranche2: 'الشطر الثاني (30%)', tranche3: 'الشطر الثالث (20%)',
      exportReport: 'استخراج التقرير الختامي (PDF)', cashFlow: 'توقع مسار السيولة (Hologram View)',
      tableTitle: 'سجل العمليات الدقيق', date: 'التاريخ', beneficiary: 'المستفيد', amount: 'المبلغ', mode: 'طريقة الدفع / المرجع',
      currency: 'درهم', generating: 'جاري استخراج التقرير...', generatedBy: 'تم التدقيق آلياً بواسطة SouqBTP AI',
      txSupervisors: 'تعويضات المشرفين', txTrainers: 'تعويضات المكونين', txSupplies: 'لوازم الورش / الجمعية', txAccounting: 'أتعاب محاسبية',
      aiMsg1: 'صرف الشطر الأول متوافق تماماً مع التوقعات والميزانية المخصصة.',
      aiMsg2: 'تحذير: معدل إنفاق الشطر الثاني أسرع بـ 12% من المخطط له.'
    },
    fr: {
      title: 'Audit Financier IA', subtitle: 'Analyse des risques, suivi des tranches et rapports certifiés.',
      budget: 'Budget Total Alloué', spent: 'Total Dépensé', balance: 'Solde Restant', health: 'Indice de Santé Financière',
      aiInsights: 'Conseiller IA - Insights', riskLow: 'Risque Faible', riskMedium: 'Alerte Liquidité',
      tranches: 'Suivi des Tranches du Projet', tranche1: '1ère Tranche (50%)', tranche2: '2ème Tranche (30%)', tranche3: '3ème Tranche (20%)',
      exportReport: 'Générer Rapport d\'Audit (PDF)', cashFlow: 'Prévision de Trésorerie (Hologram View)',
      tableTitle: 'Journal des Opérations', date: 'Date', beneficiary: 'Bénéficiaire', amount: 'Montant', mode: 'Mode / N° Pièce',
      currency: 'MAD', generating: 'Génération en cours...', generatedBy: 'Audité automatiquement par SouqBTP AI',
      txSupervisors: 'Indemnités de superviseurs', txTrainers: 'Indemnités de formateurs', txSupplies: 'Fournitures de chantier', txAccounting: 'Honoraires comptables',
      aiMsg1: 'Les dépenses de la 1ère tranche sont parfaitement alignées avec le budget.',
      aiMsg2: 'Alerte : Le rythme de dépense de la 2ème tranche est 12% plus rapide que prévu.'
    },
    en: {
      title: 'Smart AI Audit', subtitle: 'Risk analysis, milestone tracking, and certified reports.',
      budget: 'Total Allocated Budget', spent: 'Total Spent', balance: 'Remaining Balance', health: 'Financial Health Score',
      aiInsights: 'AI Advisor Insights', riskLow: 'Low Risk', riskMedium: 'Liquidity Alert',
      tranches: 'Project Milestones (Tranches)', tranche1: 'Milestone 1 (50%)', tranche2: 'Milestone 2 (30%)', tranche3: 'Milestone 3 (20%)',
      exportReport: 'Generate Audit Report (PDF)', cashFlow: 'Cash Flow Prediction (Hologram View)',
      tableTitle: 'Operations Log', date: 'Date', beneficiary: 'Beneficiary', amount: 'Amount', mode: 'Mode / Ref',
      currency: 'MAD', generating: 'Generating Report...', generatedBy: 'Automatically audited by SouqBTP AI',
      txSupervisors: 'Supervisors Compensation', txTrainers: 'Trainers Compensation', txSupplies: 'Site Supplies', txAccounting: 'Accounting Fees',
      aiMsg1: 'Milestone 1 spending is perfectly aligned with the allocated budget.',
      aiMsg2: 'Warning: Milestone 2 spending rate is 12% faster than planned.'
    }
  };
  
  const t = translations[language] || translations.ar;

  // 🚀 بيانات التدقيق 
  const totalBudget = 134400;
  const totalSpent = 84000 + 38800; // 122800
  const remainingBalance = totalBudget - totalSpent;

  // 🐌 الأنيميشن البطيء جداً لتأثير التشويق التقني! (7 ثواني)
  const animatedBudget = useAnimatedNumber(totalBudget, 7000);
  const animatedSpent = useAnimatedNumber(totalSpent, 7000);
  const animatedBalance = useAnimatedNumber(remainingBalance, 7000);
  const animatedHealth = useAnimatedNumber(92, 7000);

  const tranchesData = [
    { name: t.tranche1, allocated: 67200, spent: 67000, status: 'completed' },
    { name: t.tranche2, allocated: 40320, spent: 38800, status: 'warning' },
    { name: t.tranche3, allocated: 26880, spent: 0, status: 'pending' },
  ];

  const transactions = [
    { id: 1, date: '12/06/2026', beneficiary: t.txSupervisors, amount: 12000, mode: 'Chèque N° 2415026' },
    { id: 2, date: '15/06/2026', beneficiary: t.txTrainers, amount: 64800, mode: 'Virement B.Pop' },
    { id: 3, date: '28/06/2026', beneficiary: t.txSupplies, amount: 7200, mode: 'Chèque N° 2415033' },
    { id: 4, date: '08/07/2026', beneficiary: t.txAccounting, amount: 30000, mode: 'Virement BMCE' },
    { id: 5, date: '15/07/2026', beneficiary: 'DIFTRAV SARL', amount: 8800, mode: 'Chèque N° 2415047' },
  ];

  const chartData = [
    { name: 'M1', budget: 20000, spent: 18000 },
    { name: 'M2', budget: 45000, spent: 40000 },
    { name: 'M3', budget: 80000, spent: 85000 },
    { name: 'M4', budget: 110000, spent: 105000 },
    { name: 'M5', budget: 134400, spent: 122800 },
  ];

  // 🖨️ نظام استخراج التقرير
  const handleGenerateAuditReport = async () => {
    setIsExporting(true);
    const printElement = document.createElement('div');
    const alignStart = isRtl ? 'right' : 'left';
    const alignEnd = isRtl ? 'left' : 'right';
    
    printElement.innerHTML = `
      <div style="direction: ${isRtl ? 'rtl' : 'ltr'}; font-family: Arial, sans-serif; color: black; padding: 50px; background: white; width: 800px; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 28px; text-transform: uppercase; margin: 0; letter-spacing: 2px;">RAPPORT D'AUDIT FINANCIER</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">${t.generatedBy} - ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p><strong>Objet :</strong> Rapport de situation financière et justification des charges par tranches.</p>
          <p><strong>Montant Total Alloué :</strong> <span style="font-size: 18px; font-weight: bold;">${totalBudget.toLocaleString()} MAD</span></p>
        </div>

        <h3 style="background: #f1f5f9; padding: 10px; border-left: 4px solid #3b82f6;">I. ÉTAT DES TRANCHES</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #1e293b; color: white;">
              <th style="padding: 10px; text-align: ${alignStart}; border: 1px solid #cbd5e1;">Désignation</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #cbd5e1;">Alloué (MAD)</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #cbd5e1;">Dépensé (MAD)</th>
            </tr>
          </thead>
          <tbody>
            ${tranchesData.map(tr => `
              <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">${tr.name}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #cbd5e1;">${tr.allocated.toLocaleString()}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #cbd5e1;">${tr.spent.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="background: #f1f5f9; padding: 10px; border-left: 4px solid #3b82f6;">II. DÉTAILS DES OPÉRATIONS (EXTRAIT)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 50px;">
          <thead>
            <tr style="background: #1e293b; color: white;">
              <th style="padding: 10px; text-align: ${alignStart}; border: 1px solid #cbd5e1;">Date</th>
              <th style="padding: 10px; text-align: ${alignStart}; border: 1px solid #cbd5e1;">Bénéficiaire</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #cbd5e1;">Réf / Chèque</th>
              <th style="padding: 10px; text-align: ${alignEnd}; border: 1px solid #cbd5e1;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => `
              <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">${tx.date}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">${tx.beneficiary}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #cbd5e1;">${tx.mode}</td>
                <td style="padding: 10px; text-align: ${alignEnd}; border: 1px solid #cbd5e1; font-weight: bold;">${tx.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 50px; text-align: ${alignEnd};">
          <p style="font-weight: bold; font-size: 16px;">ATTESTATION DE CONFORMITÉ</p>
          <p style="font-size: 12px; color: #475569; max-width: 400px; margin-${alignEnd}: 0; margin-${alignStart}: auto;">
            Nous attestons par la présente que les pièces justificatives rendues ne présentent aucune irrégularité.
          </p>
          <div style="margin-top: 40px; display: inline-block; border-top: 1px dashed #000; padding-top: 10px; width: 250px; text-align: center;">
            Signature / Cachet (SOUQBTP AI)
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(printElement);
    printElement.style.position = 'absolute'; printElement.style.left = '-9999px';
    
    try {
      const canvas = await html2canvas(printElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rapport_Audit_Financier_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch(err) { console.error(err); } finally { document.body.removeChild(printElement); setIsExporting(false); }
  };

  const bgMain = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 size={60} className="animate-spin text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" /></div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${bgMain} border-2 p-8 rounded-[2rem] shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className={`text-3xl md:text-4xl font-black ${textMain} flex items-center gap-4`}>
            <ShieldCheck className="text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" size={36} /> {t.title}
          </h2>
          <p className={`${textMuted} font-bold mt-2`}>{t.subtitle}</p>
        </div>
        <button onClick={handleGenerateAuditReport} disabled={isExporting} className="relative z-10 py-3.5 px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-black flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] disabled:opacity-50">
          {isExporting ? <Loader2 size={20} className="animate-spin"/> : <FileSignature size={20}/>} {isExporting ? t.generating : t.exportReport}
        </button>
      </div>

      {/* 🚀 Futuristic KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Budget */}
        <div className={`p-6 rounded-[2rem] border-2 shadow-[0_0_15px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-slate-900/80 border-slate-700 hover:border-blue-500/50' : 'bg-slate-50 border-slate-200'} transition-all duration-500`}>
          <p className={`font-black text-sm mb-2 uppercase tracking-widest ${textMuted}`}>{t.budget}</p>
          <h3 className={`text-3xl font-black text-blue-500 font-mono drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]`} dir="ltr">{animatedBudget.toLocaleString()} <span className="text-xs">{t.currency}</span></h3>
        </div>
        {/* Spent */}
        <div className={`p-6 rounded-[2rem] border-2 shadow-[0_0_15px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-slate-900/80 border-slate-700 hover:border-orange-500/50' : 'bg-slate-50 border-slate-200'} transition-all duration-500`}>
          <p className={`font-black text-sm mb-2 uppercase tracking-widest ${textMuted}`}>{t.spent}</p>
          <h3 className={`text-3xl font-black text-orange-500 font-mono drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]`} dir="ltr">{animatedSpent.toLocaleString()} <span className="text-xs">{t.currency}</span></h3>
        </div>
        {/* Balance */}
        <div className={`p-6 rounded-[2rem] border-2 shadow-[0_0_15px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-slate-900/80 border-slate-700 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-200'} transition-all duration-500`}>
          <p className={`font-black text-sm mb-2 uppercase tracking-widest ${textMuted}`}>{t.balance}</p>
          <h3 className={`text-3xl font-black text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]`} dir="ltr">{animatedBalance.toLocaleString()} <span className="text-xs">{t.currency}</span></h3>
        </div>
        {/* Health Hologram */}
        <div className={`p-6 rounded-[2rem] relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)] ${isDarkMode ? 'bg-slate-950 border-2 border-cyan-500/30' : 'bg-cyan-50 border-2 border-cyan-200'}`}>
          <div className="absolute -right-2 -top-2 opacity-20 text-cyan-500 animate-pulse"><Activity size={100}/></div>
          <p className={`font-black text-sm mb-2 uppercase tracking-widest ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{t.health}</p>
          <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`} dir="ltr">{animatedHealth} <span className="text-xl">%</span></h3>
        </div>
      </div>

      {/* 🌌 Holographic Chart (Full Width & Sci-Fi) */}
      <div className={`${bgMain} border-2 rounded-[2rem] p-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden`}>
        {/* Cyberpunk grid background overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <h3 className={`text-xl font-black ${textMain} mb-8 flex items-center gap-3 relative z-10`}>
          <TrendingUp className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,1)]" size={28}/> {t.cashFlow}
        </h3>
        
        <div className="h-80 w-full relative z-10" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 10" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(6,182,212,0.3)', background: isDarkMode ? 'rgba(15,23,42,0.9)' : '#fff', color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold', boxShadow: '0 0 20px rgba(6,182,212,0.3)', backdropFilter: 'blur(10px)' }} 
              />
              <Area type="monotone" dataKey="budget" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorBudget)" animationDuration={6000} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="spent" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorSpent)" activeDot={{ r: 8, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0px 0px 10px #06b6d4)'} }} animationDuration={6000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* 🤖 المستشار المالي الذكي */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`${bgMain} border-2 rounded-[2rem] p-6 shadow-xl relative overflow-hidden h-full`}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>
            <h3 className={`text-lg font-black ${textMain} mb-6 flex items-center gap-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-4`}>
              <BrainCircuit className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" size={24}/> {t.aiInsights}
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border-l-4 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-emerald-50 border-emerald-500 text-emerald-700'} flex items-start gap-3 shadow-[0_0_10px_rgba(16,185,129,0.1)]`}>
                <CheckCircle size={20} className="mt-0.5 shrink-0"/>
                <p className="text-sm font-bold leading-relaxed">{t.aiMsg1}</p>
              </div>
              <div className={`p-4 rounded-xl border-l-4 ${isDarkMode ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-orange-50 border-orange-500 text-orange-700'} flex items-start gap-3 shadow-[0_0_10px_rgba(249,115,22,0.1)]`}>
                <AlertTriangle size={20} className="mt-0.5 shrink-0"/>
                <p className="text-sm font-bold leading-relaxed">{t.aiMsg2}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 تتبع الأشطر */}
        <div className="lg:col-span-2">
          <div className={`${bgMain} border-2 rounded-[2rem] p-8 shadow-xl h-full`}>
            <h3 className={`text-lg font-black ${textMain} mb-8 flex items-center gap-2`}><FileText className="text-cyan-500"/> {t.tranches}</h3>
            <div className="space-y-8">
              {tranchesData.map((tr, idx) => {
                const percentage = Math.round((tr.spent / tr.allocated) * 100) || 0;
                return (
                  <div key={idx} className="space-y-3 relative">
                    <div className="flex justify-between items-end">
                      <span className={`font-black text-sm ${textMain}`}>{tr.name}</span>
                      <span className={`text-xs font-bold ${textMuted} tracking-widest`} dir="ltr">{tr.spent.toLocaleString()} / {tr.allocated.toLocaleString()} {t.currency}</span>
                    </div>
                    {/* Futuristic Progress Bar */}
                    <div className={`w-full h-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} shadow-inner relative`}>
                      <div 
                        className={`h-full transition-all ease-out duration-[7000ms] ${
                          tr.status === 'completed' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 
                          tr.status === 'warning' ? 'bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 
                          'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                        }`} 
                        style={{ width: mounted ? `${percentage}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 🧾 سجل العمليات */}
      <div className={`${bgMain} border-2 rounded-[2rem] shadow-xl overflow-hidden`}>
        <div className={`p-6 border-b ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className={`font-black text-lg ${textMain} flex items-center gap-3`}><CreditCard className="text-cyan-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]"/> {t.tableTitle}</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start text-sm">
            <thead className={`border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'} text-xs uppercase font-black`}>
              <tr>
                <th className="px-6 py-5 tracking-widest text-start">{t.date}</th>
                <th className="px-6 py-5 tracking-widest text-start">{t.beneficiary}</th>
                <th className="px-6 py-5 tracking-widest text-center">{t.mode}</th>
                <th className={`px-6 py-5 tracking-widest ${isRtl ? 'text-start' : 'text-end'}`}>{t.amount}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
              {transactions.map((tx) => (
                <tr key={tx.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                  <td className={`px-6 py-5 font-bold ${textMuted} text-xs`}>{tx.date}</td>
                  <td className={`px-6 py-5 font-black ${textMain}`}>{tx.beneficiary}</td>
                  <td className={`px-6 py-5 font-bold ${textMuted} text-center text-xs`}>{tx.mode}</td>
                  <td className={`px-6 py-5 font-black text-lg ${textMain} font-mono ${isRtl ? 'text-start' : 'text-end'}`} dir="ltr">
                    {tx.amount.toLocaleString()} <span className="text-[10px] uppercase opacity-50 tracking-widest">{t.currency}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}