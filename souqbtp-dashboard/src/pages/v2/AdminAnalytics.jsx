import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useSettingsStore from '../../store/useSettingsStore';
import { 
  BarChart3, TrendingUp, Users, Wrench, Wallet, RefreshCcw, 
  Loader2, AlertCircle, LayoutDashboard 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function AdminAnalytics() {
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States
  const [stats, setStats] = useState({ estimates: 0, providers: 0, services: 0, totalBudget: 0 });
  const [chartData, setChartData] = useState({ line: [], pie: [] });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. جلب الإحصائيات العامة
      const [estRes, provRes, servRes] = await Promise.all([
        supabase.from('user_estimates').select('*', { count: 'exact', head: true }),
        supabase.from('providers').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true })
      ]);

      // 2. جلب الميزانيات والمشاريع
      const { data: estimatesData, error: estError } = await supabase
        .from('user_estimates')
        .select('created_at, project_name, total_budget, total_cost')
        .limit(200);
      
      if (estError) throw estError;

      let totalMoney = 0;
      const projectCounts = {};

      (estimatesData || []).forEach(est => {
        // حساب ذكي: إذا كان cost فارغاً يأخذ budget، وإذا كانا فارغين يأخذ صفر
        const money = parseFloat(est.total_cost || est.total_budget || 0);
        totalMoney += money;
        
        const pName = est.project_name || 'غير محدد';
        projectCounts[pName] = (projectCounts[pName] || 0) + 1;
      });

      setStats({
        estimates: estRes.count || 0,
        providers: provRes.count || 0,
        services: servRes.count || 0,
        totalBudget: totalMoney
      });

      // 3. تحضير بيانات المبيان الدائري (Pie Chart)
      const pieFormatted = Object.keys(projectCounts).map(key => ({
        name: key,
        value: projectCounts[key]
      }));

      // 4. بيانات مبدئية لنمو الطلبات (آخر 7 أيام) - يمكن لاحقاً ربطها بالتواريخ الحقيقية من created_at
      const lineFormatted = [
        { name: 'الاثنين', orders: 0 },
        { name: 'الثلاثاء', orders: 2 },
        { name: 'الأربعاء', orders: 1 },
        { name: 'الخميس', orders: 3 },
        { name: 'الجمعة', orders: 5 },
        { name: 'السبت', orders: 2 },
        { name: 'الأحد', orders: 4 },
      ];

      setChartData({ line: lineFormatted, pie: pieFormatted.length > 0 ? pieFormatted : [{ name: 'لا توجد بيانات', value: 1 }] });

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1 tracking-tight">التقارير والتحليلات المتقدمة</h1>
            <p className="text-slate-500 font-medium">رادار المنصة: راقب النمو، أداء الحاسبة، واتجاهات السوق في الوقت الفعلي.</p>
          </div>
        </div>
        <button onClick={fetchAnalyticsData} disabled={isLoading} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-black text-sm transition-colors flex items-center gap-2 shadow-sm">
          <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /> تحديث البيانات
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-3">
          <AlertCircle size={20} />
          <span>خطأ في نظام التحليلات: {error}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        
        <div className="bg-white p-6 rounded-2xl border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-slate-500 font-bold text-sm mb-2 flex items-center gap-2"><TrendingUp size={16}/> إجمالي طلبات الحاسبة</h4>
          <h2 className="text-3xl font-black text-slate-800">
            {isLoading ? <Loader2 size={24} className="animate-spin text-slate-400" /> : stats.estimates}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-slate-500 font-bold text-sm mb-2 flex items-center gap-2"><Users size={16}/> الحرفيين المسجلين</h4>
          <h2 className="text-3xl font-black text-slate-800">
            {isLoading ? <Loader2 size={24} className="animate-spin text-slate-400" /> : stats.providers}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-slate-500 font-bold text-sm mb-2 flex items-center gap-2"><Wrench size={16}/> الخدمات المتاحة</h4>
          <h2 className="text-3xl font-black text-slate-800">
            {isLoading ? <Loader2 size={24} className="animate-spin text-slate-400" /> : stats.services}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-slate-500 font-bold text-sm mb-2 flex items-center gap-2"><Wallet size={16}/> إجمالي الميزانيات المقدرة</h4>
          <h2 className="text-2xl font-black text-slate-800 font-mono" dir="ltr">
            {isLoading ? <Loader2 size={24} className="animate-spin text-slate-400" /> : `${stats.totalBudget.toLocaleString('ar-MA')} MAD`}
          </h2>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ minHeight: '400px' }}>
        
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 mb-4">نمو طلبات الحاسبة (آخر 7 أيام)</h3>
          <div className="flex-1 w-full min-h-[300px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="animate-spin" size={32}/></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.line} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Line type="monotone" dataKey="orders" name="عدد الطلبات" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 mb-4">المشاريع الأكثر طلباً</h3>
          <div className="flex-1 w-full min-h-[300px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="animate-spin" size={32}/></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pie}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.pie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}