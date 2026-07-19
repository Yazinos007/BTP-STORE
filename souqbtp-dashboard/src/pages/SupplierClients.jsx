import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useSettingsStore from '../store/useSettingsStore';
import useSupplierStore from '../store/useSupplierStore';
import { 
  Users, UserCheck, UserX, UserMinus, Search, MessageSquare, 
  TrendingUp, Calendar, DollarSign, Loader2, MessageCircle, Eye 
} from 'lucide-react';

const translations = {
  ar: {
    title: 'إدارة علاقات العملاء (B2B CRM)',
    subtitle: 'تتبع نشاط التجار، صنفهم ذكياً، وتواصل معهم لإعادة تنشيط المبيعات.',
    totalClients: 'إجمالي العملاء',
    vipClients: 'العملاء النشطون (VIP)',
    dormantClients: 'العملاء النائمون',
    leadsClients: 'مترددون (طلبات معلقة)',
    searchPlaceholder: 'ابحث باسم المتجر، أو رقم الهاتف...',
    clientName: 'المتجر / العميل',
    segment: 'التصنيف',
    totalSpent: 'إجمالي المعاملات',
    lastActive: 'آخر نشاط',
    actions: 'التواصل السريع',
    empty: 'لا يوجد عملاء في هذا التصنيف حالياً.',
    currency: 'درهم',
    pulseTitle: 'نبض العميل والمستندات الأخيرة',
    close: 'إغلاق',
    segments: { all: 'الكل', vip: 'VIP نشط', dormant: 'نائم (+60 يوم)', lead: 'متردد (عرض سعر)' }
  },
  fr: {
    title: 'Gestion Clientèle (B2B CRM)',
    subtitle: 'Suivez l\'activité des commerçants, segmentez-les et relancez-les efficacement.',
    totalClients: 'Total Clients',
    vipClients: 'Clients VIP (Actifs)',
    dormantClients: 'Clients Dormants',
    leadsClients: 'Prospects (Devis)',
    searchPlaceholder: 'Rechercher par boutique, téléphone...',
    clientName: 'Boutique / Client',
    segment: 'Segmentation',
    totalSpent: 'Volume d\'affaires',
    lastActive: 'Dernière Activité',
    actions: 'Relance Rapide',
    empty: 'Aucun client dans cette catégorie.',
    currency: 'MAD',
    pulseTitle: 'Profil & Pulsation du Client',
    close: 'Fermer',
    segments: { all: 'Tous', vip: 'VIP Actif', dormant: 'Dormant (+60j)', lead: 'Prospect (Devis)' }
  }
};

export default function SupplierClients() {
  const { language } = useSettingsStore();
  const { supplier } = useSupplierStore();
  const t = translations[language] || translations['fr'];

  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (supplier?.id) fetchCRMData();
  }, [supplier]);

  const fetchCRMData = async () => {
    setIsLoading(true);
    try {
      const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

      // 1. جلب أسماء المنتجات لتتبع الفواتير
      const { data: myProducts } = await supabase.from('products').select('name').eq('supplier_id', targetId);
      const myProductNames = new Set(myProducts?.map(p => (p.name || '').replace(/\s+/g, '').toLowerCase()) || []);

      // 2. جلب كل وثائق النظام وكل التجار
      const { data: allDocs } = await supabase.from('documents').select('*');
      const { data: allMerchants } = await supabase.from('suppliers').select('id, store_name, phone');

      // الفلترة لاستخراج فواتير هذا المورد وعروض الأسعار
      const myDocs = (allDocs || []).filter(doc => 
        (doc.items || []).some(item => myProductNames.has((item.name || '').replace(/\s+/g, '').toLowerCase()))
      );

      // 3. بناء هيكل الـ CRM لكل تاجر تعامل معنا
      const crmList = (allMerchants || []).map(merchant => {
        const merchantDocs = myDocs.filter(d => d.client_id === merchant.id || d.owner_id === merchant.id);
        const invoices = merchantDocs.filter(d => d.type === 'Facture');
        const quotes = merchantDocs.filter(d => d.type === 'Devis' || d.type === 'Facture Proforma');

        const totalSpent = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
        
        let lastActiveDate = null;
        if (merchantDocs.length > 0) {
          const dates = merchantDocs.map(d => new Date(d.created_at).getTime());
          lastActiveDate = new Date(Math.max(...dates));
        }

        // تحديد التصنيف تلقائياً كـ CRM ذكي
        let segment = 'lead'; // افتراضي: متردد طلب عرض سعر فقط ولم يشترِ بعد
        if (totalSpent > 0) {
          segment = 'vip'; // اشترى ولديه فواتير
          if (lastActiveDate) {
            const daysSinceActive = (new Date().getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceActive > 60) segment = 'dormant'; // لم يشترِ منذ شهرين
          }
        }

        return {
          ...merchant,
          totalSpent,
          lastActive: lastActiveDate,
          segment,
          docsCount: merchantDocs.length
        };
      }).filter(c => c.docsCount > 0 || c.totalSpent > 0); // نظهر فقط من تفاعل مع بضاعتنا

      setClients(crmList);
    } catch (error) {
      console.error('Error fetching CRM data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // دالة توليد رسائل الواتساب الذكية الديناميكية وطرد التردد
  const getWhatsAppLink = (client) => {
    const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
    let message = '';

    if (client.segment === 'vip') {
      message = language === 'fr' 
        ? `Bonjour ${client.store_name}, merci لثقتكم المستمرة. عروضنا الجديدة لشهر مايو جاهزة لكم خصيصاً بشحن تفضيلي.` 
        : `مرحباً ${client.store_name}، نشكركم على ثقتكم المستمرة في سلعنا. قمنا بتخصيص عرض تفضيلي لطلبيتكم القادمة مع شحن سريع.`;
    } else if (client.segment === 'dormant') {
      message = language === 'fr'
        ? `Bonjour ${client.store_name}, غبتم عنا مؤخراً! Nous دار تواصل للاطمئنان عليكم وتقديم خصم 5% على أول طلبية استرداد.`
        : `مرحباً ${client.store_name}، لاحظنا غيابكم عن المركز مؤخراً ونأمل أن تكونوا بخير! قمنا بتوفير قسيمة خصم بقيمة 5% لتحديث مخزونكم هذا الأسبوع.`;
    } else {
      message = language === 'fr'
        ? `Bonjour ${client.store_name}, بخصوص طلب السعر الأخير، هل لديكم أي استفسار لتأكيد الطلبية وتجهيز الشاحنة؟`
        : `مرحباً ${client.store_name}، بخصوص عرض السعر الأخير الذي طلبتموه، السلع متوفرة في المخزن المركزي وجاهزة للشحن فور تأكيدكم.`;
    }

    return `https://wa.me/${cleanPhone || '212'}/?text=${encodeURIComponent(message)}`;
  };

  // الحسابات الإجمالية للبطاقات
  const totalCount = clients.length;
  const vipCount = clients.filter(c => c.segment === 'vip').length;
  const dormantCount = clients.filter(c => c.segment === 'dormant').length;
  const leadCount = clients.filter(c => c.segment === 'lead').length;

  const filteredClients = clients.filter(c => {
    const matchesSearch = (c.store_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.phone || '').includes(searchTerm);
    const matchesFilter = activeFilter === 'all' || c.segment === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Users className="text-blue-500" size={32} />
          {t.title}
        </h2>
        <p className="text-slate-400 mt-1 font-medium">{t.subtitle}</p>
      </div>

      {/* 📊 بطاقات مؤشرات الأداء للعملاء */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div onClick={() => setActiveFilter('all')} className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeFilter === 'all' ? 'bg-blue-600 border-blue-500 shadow-xl' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-300">{t.totalClients}</span>
            <Users size={20} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-black">{totalCount}</h3>
        </div>
        <div onClick={() => setActiveFilter('vip')} className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeFilter === 'vip' ? 'bg-emerald-600 border-emerald-500 shadow-xl' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-300">{t.vipClients}</span>
            <UserCheck size={20} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black">{vipCount}</h3>
        </div>
        <div onClick={() => setActiveFilter('dormant')} className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeFilter === 'dormant' ? 'bg-orange-600 border-orange-500 shadow-xl' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-300">{t.dormantClients}</span>
            <UserX size={20} className="text-orange-400" />
          </div>
          <h3 className="text-2xl font-black">{dormantCount}</h3>
        </div>
        <div onClick={() => setActiveFilter('lead')} className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeFilter === 'lead' ? 'bg-purple-600 border-purple-500 shadow-xl' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-300">{t.leadsClients}</span>
            <UserMinus size={20} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-black">{leadCount}</h3>
        </div>
      </div>

      {/* 🔍 شريط البحث والفلترة */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 w-full text-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {Object.entries(t.segments).map(([key, value]) => (
            <button 
              key={key} 
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider whitespace-nowrap transition-all border ${activeFilter === key ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 جدول علاقات العملاء */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase font-black">
                <th className="p-5">{t.clientName}</th>
                <th className="p-5">{t.segment}</th>
                <th className="p-5 text-right">{t.totalSpent}</th>
                <th className="p-5">{t.lastActive}</th>
                <th className="p-5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-12 text-center"><Loader2 size={30} className="animate-spin text-blue-500 mx-auto" /></td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-500 font-bold">{t.empty}</td></tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-blue-400 border border-slate-700">
                          {client.store_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base">{client.store_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{client.phone || '---'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${
                        client.segment === 'vip' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        client.segment === 'dormant' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {t.segments[client.segment]}
                      </span>
                    </td>
                    <td className="p-5 text-right font-black text-lg text-white">
                      {client.totalSpent.toLocaleString()} <span className="text-xs text-slate-500 font-bold">{t.currency}</span>
                    </td>
                    <td className="p-5 text-slate-400 text-sm font-medium">
                      {client.lastActive ? (
                        <span className="flex items-center gap-1.5"><Calendar size={14}/>{client.lastActive.toLocaleDateString()}</span>
                      ) : '---'}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2">
                        <a 
                          href={getWhatsAppLink(client)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl transition-all shadow-lg border border-emerald-500/20 flex items-center gap-1.5 text-xs font-bold"
                        >
                          <MessageCircle size={16} />
                          {language === 'fr' ? 'Relancer' : 'مراسلة ذكية'}
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}