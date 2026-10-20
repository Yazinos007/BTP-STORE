import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useArchitectStore from '../../../store/useArchitectStore';
import useSettingsStore from '../../../store/useSettingsStore';

const translations = {
  ar: {
    archRadarTitle: '🛰️ رادار الصفقات الهندسية والاستشارات',
    archRadarBadge: 'زبناء يبحثون عن تصاميم ورخص',
    provRadarTitle: '🛰️ رادار الصفقات الحية',
    provRadarBadge: 'زبناء يبحثون عن حرفيين ومقاولين الآن',
    scanningRadar: '🔍 جاري مسح المنطقة بحثاً عن فرص...',
    noLeads: 'لا توجد صفقات جديدة حالياً. ابقَ متصلاً!',
    inboxTitle: '💬 صندوق الرسائل وغرف العمليات',
    onlineDirect: 'متصل (مباشر)',
    clientsOnline: 'عملاء بالمنصة',
    colClient: 'اسم العميل / الورشة',
    colPhone: 'رقم الهاتف',
    colLastMsg: 'آخر رسالة',
    colSender: 'المرسل الأخير',
    colTime: 'التوقيت',
    colActions: 'الإجراءات',
    syncingMsgs: '⏳ جاري مزامنة الرسائل...',
    noConversations: '📭 لا توجد محادثات نشطة حالياً.',
    you: 'أنت',
    client: 'العميل 👤',
    architectBadge: 'المهندس 📐',
    providerBadge: 'المقاول 👷',
    voiceMsg: '🎤 رسالة صوتية',
    attachedImg: '[صورة مرفقة 🖼️]',
    ledgerBtn: '📒 الدفتر',
    chatBtn: '💬 المحادثة',
    deleteTitle: 'حذف المحادثة',
    // Ledger Modal
    ledgerTitle: '📒 الدفتر المالي لـ:',
    totalIncome: 'المقبوضات (تسبيق / أتعاب)',
    totalExpense: 'المصاريف (سلع / رسوم)',
    addIncomeBtn: '➕ استلام دفعة مالية',
    addExpenseBtn: '➖ تسجيل مصروف سلع',
    amountLabel: 'المبلغ (درهم)',
    descLabel: 'تفاصيل العملية',
    descPlace: 'مثال: تسبيق التصميم، أو شراء 10 أكياس إسمنت...',
    saveTransBtn: '✔️ حفظ العملية وإرسال إيصال للشات',
    ledgerHistoryTitle: '🕒 سجل العمليات المالية:',
    colDate: 'التاريخ',
    colDetails: 'التفاصيل',
    colType: 'النوع',
    colAmount: 'المبلغ',
    emptyLedger: 'الدفتر جديد ونظيف. لم يتم تسجيل أي عمليات مالية بعد.',
    incomeBadge: 'دفعة ➕',
    expenseBadge: 'مصروف ➖',
    // Chat Room
    onlineNow: 'متصل الآن 🟢',
    offlineNow: 'غير متصل ⚪',
    fieldCallBtn: '📞 اتصال ميداني',
    groupInviteBtn: '👥 الغرفة المشتركة',
    clearChatBtn: '🗑️ إفراغ',
    backBtn: '⬅️ رجوع',
    typingNow: 'يكتب الآن... ✍️',
    fileSelected: 'تم اختيار ملف ✅',
    recordingNow: '🔴 جاري التسجيل...',
    inputPlaceholder: 'اكتب ردك هنا...',
    sendBtn: 'إرسال',
    chatCleared: 'تم إفراغ الدردشة... 🧹',
    msgDeleted: '🚫 تم حذف هذه الرسالة',
    delForMe: '🗑️ حذف من عندي',
    delForAll: '🚫 حذف للجميع',
    incomingCall: '📲 مكالمة فيديو ميدانية واردة...',
    answerCall: '📹 رد وفتح الغرفة',
    endedCall: '📞 مكالمة ميدانية (منتهية)',
    downloadAttachment: '📎 تحميل المرفق',
    today: 'اليوم',
    yesterday: 'أمس'
  },
  fr: {
    archRadarTitle: '🛰️ Radar des Projets & Consultations Architecturales',
    archRadarBadge: 'Clients cherchant plans & autorisations',
    provRadarTitle: '🛰️ Radar des Marchés en Direct',
    provRadarBadge: 'Clients cherchant des entrepreneurs',
    scanningRadar: '🔍 Analyse de la région en cours...',
    noLeads: 'Aucune opportunité pour le moment. Restez connecté !',
    inboxTitle: '💬 Boîte de Réception & Salles Projet',
    onlineDirect: 'Connecté (Direct)',
    clientsOnline: 'clients en ligne',
    colClient: 'Nom du Client / Chantier',
    colPhone: 'Téléphone',
    colLastMsg: 'Dernier Message',
    colSender: 'Dernier Expéditeur',
    colTime: 'Heure',
    colActions: 'Actions',
    syncingMsgs: '⏳ Synchronisation des messages...',
    noConversations: '📭 Aucune conversation active.',
    you: 'Vous',
    client: 'Client 👤',
    architectBadge: 'Architecte 📐',
    providerBadge: 'Entrepreneur 👷',
    voiceMsg: '🎤 Message vocal',
    attachedImg: '[Image jointe 🖼️]',
    ledgerBtn: '📒 Carnet',
    chatBtn: '💬 Discuter',
    deleteTitle: 'Supprimer',
    ledgerTitle: '📒 Carnet Financier de :',
    totalIncome: 'Encaissements (Avances)',
    totalExpense: 'Dépenses (Matériaux)',
    addIncomeBtn: '➕ Encaisser une avance',
    addExpenseBtn: '➖ Noter une dépense',
    amountLabel: 'Montant (MAD)',
    descLabel: 'Détails de l\'opération',
    descPlace: 'Ex: Avance étude, ou achat de 10 sacs de ciment...',
    saveTransBtn: '✔️ Enregistrer & Envoyer reçu au chat',
    ledgerHistoryTitle: '🕒 Historique des opérations :',
    colDate: 'Date',
    colDetails: 'Détails',
    colType: 'Type',
    colAmount: 'Montant',
    emptyLedger: 'Le carnet est vierge. Aucune opération enregistrée.',
    incomeBadge: 'Avance ➕',
    expenseBadge: 'Dépense ➖',
    onlineNow: 'En ligne 🟢',
    offlineNow: 'Hors ligne ⚪',
    fieldCallBtn: '📞 Appel Terrain (AR)',
    groupInviteBtn: '👥 Salle Groupe',
    clearChatBtn: '🗑️ Vider',
    backBtn: '⬅️ Retour',
    typingNow: 'Écrit en ce moment... ✍️',
    fileSelected: 'Fichier sélectionné ✅',
    recordingNow: '🔴 Enregistrement...',
    inputPlaceholder: 'Écrivez votre réponse ici...',
    sendBtn: 'Envoyer',
    chatCleared: 'Discussion vidée... 🧹',
    msgDeleted: '🚫 Ce message a été supprimé',
    delForMe: '🗑️ Supprimer pour moi',
    delForAll: '🚫 Supprimer pour tous',
    incomingCall: '📲 Appel vidéo terrain entrant...',
    answerCall: '📹 Répondre',
    endedCall: '📞 Appel terrain (Terminé)',
    downloadAttachment: '📎 Télécharger la pièce jointe',
    today: 'Aujourd\'hui',
    yesterday: 'Hier'
  },
  en: {
    archRadarTitle: '🛰️ Architectural Leads & Consultations Radar',
    archRadarBadge: 'Clients seeking designs & permits',
    provRadarTitle: '🛰️ Live Project Leads Radar',
    provRadarBadge: 'Clients looking for contractors now',
    scanningRadar: '🔍 Scanning area for opportunities...',
    noLeads: 'No new leads right now. Stay tuned!',
    inboxTitle: '💬 Messages & Project War Rooms',
    onlineDirect: 'Connected (Live)',
    clientsOnline: 'clients online',
    colClient: 'Client / Project Name',
    colPhone: 'Phone Number',
    colLastMsg: 'Last Message',
    colSender: 'Last Sender',
    colTime: 'Time',
    colActions: 'Actions',
    syncingMsgs: '⏳ Syncing messages...',
    noConversations: '📭 No active conversations.',
    you: 'You',
    client: 'Client 👤',
    architectBadge: 'Architect 📐',
    providerBadge: 'Contractor 👷',
    voiceMsg: '🎤 Voice message',
    attachedImg: '[Attached Image 🖼️]',
    ledgerBtn: '📒 Ledger',
    chatBtn: '💬 Chat',
    deleteTitle: 'Delete Conversation',
    ledgerTitle: '📒 Financial Ledger for:',
    totalIncome: 'Received (Advances/Fees)',
    totalExpense: 'Expenses (Materials)',
    addIncomeBtn: '➕ Record Payment',
    addExpenseBtn: '➖ Record Expense',
    amountLabel: 'Amount (MAD)',
    descLabel: 'Transaction Details',
    descPlace: 'E.g., Design advance, or 10 cement bags...',
    saveTransBtn: '✔️ Save & Send Receipt to Chat',
    ledgerHistoryTitle: '🕒 Transaction History:',
    colDate: 'Date',
    colDetails: 'Details',
    colType: 'Type',
    colAmount: 'Amount',
    emptyLedger: 'Ledger is clean. No financial transactions yet.',
    incomeBadge: 'Income ➕',
    expenseBadge: 'Expense ➖',
    onlineNow: 'Online Now 🟢',
    offlineNow: 'Offline ⚪',
    fieldCallBtn: '📞 Field Call (AR)',
    groupInviteBtn: '👥 Group Room',
    clearChatBtn: '🗑️ Clear',
    backBtn: '⬅️ Back',
    typingNow: 'Typing now... ✍️',
    fileSelected: 'File selected ✅',
    recordingNow: '🔴 Recording...',
    inputPlaceholder: 'Type your reply here...',
    sendBtn: 'Send',
    chatCleared: 'Chat cleared... 🧹',
    msgDeleted: '🚫 This message was deleted',
    delForMe: '🗑️ Delete for me',
    delForAll: '🚫 Delete for everyone',
    incomingCall: '📲 Incoming Field Video Call...',
    answerCall: '📹 Answer Call',
    endedCall: '📞 Field Call (Ended)',
    downloadAttachment: '📎 Download Attachment',
    today: 'Today',
    yesterday: 'Yesterday'
  }
};

export default function UnifiedMessages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();
  const { architectProfile: profile, fetchArchitectData } = useArchitectStore();

  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  // هوية المستخدم الحالية (architect أو provider)
  const [identity, setIdentity] = useState({
    role: 'architect',
    trackId: '',
    userUuid: ''
  });

  // حالات صندوق الرسائل والرادار (messages.php)
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [onlineClientIds, setOnlineClientIds] = useState([]);

  // حالة الدفتر المالي (Ledger Modal)
  const [ledgerModal, setLedgerModal] = useState({ open: false, clientId: null, clientName: '', conversationId: null });
  const [ledgerItems, setLedgerItems] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [transForm, setTransForm] = useState({ show: false, type: 'income', amount: '', desc: '', saving: false });

  // حالات غرفة المحادثة الفورية (conversation.php)
  const activeCid = searchParams.get('cid');
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isClientTyping, setIsClientTyping] = useState(false);
  const [isClientOnlineInRoom, setIsClientOnlineInRoom] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [scrollBtnState, setScrollBtnState] = useState({ visible: false, dir: 'down' });

  // حالات التسجيل الصوتي ومشغل الصوت (WhatsApp Voice Engine)
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioStates, setAudioStates] = useState({}); // { [msgId]: { playing, progress, timeStr, speed, muted } }

  // حالة ضم عضو للدردشة الجماعية (المهندس + المقاول + العميل)
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [partnerPhoneOrId, setPartnerPhoneOrId] = useState('');

  // المراجع (Refs)
  const chatWindowRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollHideTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);
  const audioElementsRef = useRef({});

  // 1. تحديد الهوية بشكل آمن بدون خلط أنواع البيانات (UUID vs Integer)
  useEffect(() => {
    const resolveIdentity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isArchitect = Boolean(
        profile?.id ||
        user.user_metadata?.role === 'architect' ||
        window.location.pathname.includes('architect')
      );

      if (isArchitect) {
        setIdentity({
          role: 'architect',
          trackId: profile?.id || user.id, // معرف المهندس (UUID)
          userUuid: user.id
        });
      } else {
        const { data: provRow } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        setIdentity({
          role: 'provider',
          trackId: provRow?.id, // معرف المقاول (رقمي)
          userUuid: user.id
        });
      }
    };
    resolveIdentity();
  }, [profile]);

  // 2. تشغيل الرادار العالمي للحضور المباشر (global_radar_room)
  useEffect(() => {
    if (!identity.trackId) return;

    const globalChannel = supabase.channel('global_radar_room', {
      config: { presence: { key: 'provider_' + identity.trackId } }
    });

    globalChannel
      .on('presence', { event: 'sync' }, () => {
        const state = globalChannel.presenceState();
        const onlineIds = [];
        for (const key in state) {
          if (state[key][0]?.type === 'client' && state[key][0]?.id) {
            onlineIds.push(String(state[key][0].id));
          }
        }
        setOnlineClientIds(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await globalChannel.track({ type: 'provider', id: identity.trackId });
        }
      });

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [identity.trackId]);

  // 3. تشغيل رادار الصفقات الحية (project_leads)
  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const { data } = await supabase
        .from('project_leads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);
      if (data) setLeads(data);
    } catch (err) {
      console.error('Radar error:', err);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const leadsChannel = supabase
      .channel('live_leads_v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_leads' }, () => {
        try {
          new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play().catch(() => {});
        } catch (e) {}
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
    };
  }, [fetchLeads]);

  // 4. جلب وتحديث قائمة المحادثات (صندوق الرسائل) بطريقة آمنة
  const fetchConversationsList = useCallback(async () => {
    if (!identity.userUuid) return;
    
    try {
      let query = supabase.from('conversations').select('*').order('created_at', { ascending: false });

      if (identity.role === 'architect') {
        // المهندس: نبحث عن الـ UUID الخاص بالحساب أو البروفايل
        const id1 = identity.userUuid;
        const id2 = identity.trackId || id1;
        query = query.or(`architect_id.eq.${id1},architect_id.eq.${id2}`);
      } else {
        // المقاول: إذا لم يكتمل حسابه (ليس لديه ID)، نوقف البحث
        if (!identity.trackId) {
          setConversations([]);
          setLoadingList(false);
          return;
        }
        query = query.eq('provider_id', identity.trackId);
      }

      const { data: convs, error } = await query;

      if (error || !convs) {
        console.error("Fetch error:", error);
        setConversations([]);
        setLoadingList(false);
        return;
      }

      // جلب آخر رسالة ورقم هاتف العميل وعدد الرسائل غير المقروءة لكل محادثة
      const enriched = await Promise.all(
        convs.map(async (c) => {
          const { data: lastMsgData } = await supabase
            .from('messages')
            .select('content, sender_type, created_at')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', c.id)
            .eq('sender_type', 'client')
            .eq('is_read', false);

          let phone = c.client_phone;
          if (!phone && c.client_id) {
            const { data: profData } = await supabase
              .from('profiles')
              .select('phone')
              .eq('id', c.client_id)
              .maybeSingle();
            if (profData?.phone) phone = profData.phone;
          }

          return {
            ...c,
            client_phone: phone || '---',
            message_text: lastMsgData?.content || c.last_message || '...',
            sender_type: lastMsgData?.sender_type || 'client',
            last_time: lastMsgData?.created_at || c.created_at,
            unread_count: unreadCount || 0
          };
        })
      );

      enriched.sort((a, b) => new Date(b.last_time || 0) - new Date(a.last_time || 0));
      setConversations(enriched);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingList(false);
    }
  }, [identity.trackId, identity.userUuid, identity.role]);

  useEffect(() => {
    fetchConversationsList();
    const interval = setInterval(fetchConversationsList, 5000);
    return () => clearInterval(interval);
  }, [fetchConversationsList]);

  // 5. فتح محادثة من الرادار مباشرة
  const handleOpenLeadDetails = async (clientId, clientName) => {
    if (!clientId) return alert('⚠️ لا يمكن التواصل مع هذا العميل لعدم وجود حساب مسجل له.');
    if (!window.confirm(`هل تريد فتح محادثة مباشرة مع ${clientName} لتقديم عرضك؟`)) return;

    try {
      const colName = identity.role === 'architect' ? 'architect_id' : 'provider_id';
      const { data: existingChat } = await supabase
        .from('conversations')
        .select('id')
        .eq(colName, identity.trackId)
        .eq('client_id', clientId)
        .maybeSingle();

      let chatId = existingChat?.id;
      if (!chatId) {
        const insertPayload = {
          [colName]: identity.trackId,
          client_id: clientId,
          client_name: clientName,
          last_message: 'مرحباً، رأيت مشروعك على الرادار.'
        };
        const { data: newChat, error } = await supabase
          .from('conversations')
          .insert([insertPayload])
          .select()
          .single();
        if (error) throw error;
        chatId = newChat.id;

        await supabase.from('messages').insert([
          {
            conversation_id: chatId,
            sender_type: identity.role,
            content: 'مرحباً، لقد رأيت طلبك في الرادار الخاص بالمنصة، وأنا مهتم جداً بمرافقتك في مشروعك. هل يمكننا مناقشة التفاصيل؟',
            is_read: false
          }
        ]);
      }
      setSearchParams({ cid: chatId });
    } catch (e) {
      alert('حدث خطأ أثناء محاولة الاتصال بالعميل.');
    }
  };

  // 6. محرك الدفتر المالي الرقمي (project_ledgers)
  const openLedger = async (clientId, clientName, conversationId) => {
    setLedgerModal({ open: true, clientId, clientName, conversationId });
    setTransForm({ show: false, type: 'income', amount: '', desc: '', saving: false });
    await loadLedgerData(clientId);
  };

  const loadLedgerData = async (clientId) => {
    if (!clientId) return;
    setLoadingLedger(true);
    const { data } = await supabase
      .from('project_ledgers')
      .select('*')
      .eq('provider_id', identity.trackId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    setLedgerItems(data || []);
    setLoadingLedger(false);
  };

  const saveTransaction = async () => {
    const amountNum = parseFloat(transForm.amount);
    if (!amountNum || amountNum <= 0 || !transForm.desc.trim()) {
      return alert('⚠️ الرجاء إدخال المبلغ وتفاصيل العملية بشكل صحيح!');
    }
    setTransForm((prev) => ({ ...prev, saving: true }));
    try {
      const { error } = await supabase.from('project_ledgers').insert([
        {
          provider_id: identity.trackId,
          client_id: ledgerModal.clientId,
          transaction_type: transForm.type,
          amount: amountNum,
          description: transForm.desc.trim()
        }
      ]);
      if (error) throw error;

      if (ledgerModal.conversationId) {
        const icon = transForm.type === 'income' ? '🟢' : '🔴';
        const title = transForm.type === 'income' ? 'إيصال استلام دفعة مالية (تسبيق / أتعاب)' : 'إيصال تسجيل مصروفات (سلع / رسوم)';
        const chatMsg = `🧾 *إشعار مالي آلي من الدفتر الرقمي*\n${icon} *${title}*\n\n💰 المبلغ: ${amountNum} درهم\n📝 التفاصيل: ${transForm.desc.trim()}\n\n(هذه الرسالة تم إنشاؤها تلقائياً لضمان الشفافية والمصداقية).`;
        await supabase.from('messages').insert([
          {
            conversation_id: ledgerModal.conversationId,
            sender_type: identity.role,
            content: chatMsg,
            is_read: false
          }
        ]);
      }

      setTransForm({ show: false, type: 'income', amount: '', desc: '', saving: false });
      await loadLedgerData(ledgerModal.clientId);
      alert('✅ تم تسجيل العملية في الدفتر وإرسال إيصال للعميل في الدردشة!');
    } catch (e) {
      alert('❌ حدث خطأ أثناء الحفظ.');
      setTransForm((prev) => ({ ...prev, saving: false }));
    }
  };

  const deleteConversation = async (convId) => {
    if (!window.confirm('⚠️ هل أنت متأكد أنك تريد حذف هذه المحادثة نهائياً؟')) return;
    const { error } = await supabase.from('conversations').delete().eq('id', convId);
    if (error) {
      alert('❌ لا يمكن الحذف لوجود سجلات مرتبطة.');
      return;
    }
    fetchConversationsList();
  };

  // =========================================================
  // 💬 7. محرك غرفة الدردشة الحية (conversation.php Engine)
  // =========================================================
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTo({
          top: chatWindowRef.current.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }, 80);
  };

  const markMessagesAsRead = useCallback(async (cid) => {
    if (!cid) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', cid)
      .eq('sender_type', 'client')
      .eq('is_read', false);
  }, []);

  const fetchChatMessages = useCallback(async (cid) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', cid)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data.filter((m) => !m.deleted_by_provider));
      scrollToBottom();
    }
  }, []);

  useEffect(() => {
    if (!activeCid) {
      setActiveConv(null);
      return;
    }

    const initRoom = async () => {
      setLoadingChat(true);
      const { data: convData } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', activeCid)
        .maybeSingle();

      if (convData) setActiveConv(convData);

      await fetchChatMessages(activeCid);
      await markMessagesAsRead(activeCid);
      setLoadingChat(false);
    };

    initRoom();

    if (chatChannelRef.current) {
      supabase.removeChannel(chatChannelRef.current);
    }

    const roomChannel = supabase.channel('chat_room_' + activeCid, {
      config: { broadcast: { self: false }, presence: { key: 'provider' } }
    });

    roomChannel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeCid}` },
        async (payload) => {
          await fetchChatMessages(activeCid);
          if (payload.eventType === 'INSERT' && payload.new?.sender_type === 'client') {
            markMessagesAsRead(activeCid);
          }
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload?.sender === 'client') {
          setIsClientTyping(Boolean(payload.isTyping));
          if (payload.isTyping) scrollToBottom();
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        let online = false;
        for (const id in state) {
          state[id].forEach((p) => {
            if (p.user === 'client') online = true;
          });
        }
        setIsClientOnlineInRoom(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await roomChannel.track({ user: 'provider' });
        }
      });

    chatChannelRef.current = roomChannel;

    return () => {
      if (chatChannelRef.current) {
        supabase.removeChannel(chatChannelRef.current);
      }
    };
  }, [activeCid, fetchChatMessages, markMessagesAsRead]);

  // إرسال رسالة نصية أو ملف مرفق
  const handleSendMessage = async () => {
    if (!msgInput.trim() && !selectedFile) return;

    const textToSend = msgInput.trim();
    const fileToUpload = selectedFile;
    setMsgInput('');
    setSelectedFile(null);

    if (chatChannelRef.current) {
      chatChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender: 'provider', isTyping: false }
      });
    }

    try {
      let uploadedFileUrl = null;
      if (fileToUpload) {
        const ext = fileToUpload.name.split('.').pop().toLowerCase();
        const fileName = `chat_${activeCid}_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('project-files')
          .upload(fileName, fileToUpload);
        if (!upErr) {
          const { data: pubUrl } = supabase.storage.from('project-files').getPublicUrl(fileName);
          uploadedFileUrl = pubUrl.publicUrl;
        }
      }

      await supabase.from('messages').insert([
        {
          conversation_id: parseInt(activeCid),
          sender_type: identity.role,
          content: textToSend,
          file_path: uploadedFileUrl,
          is_read: false
        }
      ]);

      await supabase
        .from('conversations')
        .update({ last_message: uploadedFileUrl ? '📎 ملف مرسل' : textToSend })
        .eq('id', activeCid);
    } catch (e) {
      alert('فشل إرسال الرسالة');
    }
  };

  const handleTypingInput = (val) => {
    setMsgInput(val);
    if (chatChannelRef.current) {
      chatChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender: 'provider', isTyping: true }
      });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        chatChannelRef.current?.send({
          type: 'broadcast',
          event: 'typing',
          payload: { sender: 'provider', isTyping: false }
        });
      }, 2000);
    }
  };

  // 📞 بدء الاتصال الميداني المباشر (WhatsApp Style Call -> Live Room AR)
  const startFieldVideoCall = async () => {
    if (!activeCid) return;
    await supabase.from('messages').insert([
      {
        conversation_id: parseInt(activeCid),
        sender_type: identity.role,
        content: '📞 VIDEO_CALL_REQUEST',
        is_read: false
      }
    ]);

    if (identity.role === 'architect') {
      window.open(`/v2/architect/live-room/${activeCid}`, '_blank');
    } else {
      window.open(`/v2/live-room/${activeCid}?type=provider`, '_blank');
    }
  };

  // حذف رسالة أو إفراغ الدردشة
  const handleDeleteMessage = async (msgId, deleteType) => {
    setOpenMenuId(null);
    const confirmMsg =
      deleteType === 'for_everyone'
        ? 'هل أنت متأكد من الحذف للجميع؟ لا يمكن التراجع.'
        : 'هل تريد حذف هذه الرسالة من شاشتك؟';
    if (!window.confirm(confirmMsg)) return;

    if (deleteType === 'for_me') {
      await supabase.from('messages').update({ deleted_by_provider: true }).eq('id', msgId);
    } else {
      await supabase.from('messages').update({ deleted_for_everyone: true }).eq('id', msgId);
    }
    fetchChatMessages(activeCid);
  };

  const handleClearChat = async () => {
    if (!window.confirm('هل أنت متأكد من إفراغ المحادثة بالكامل؟')) return;
    await supabase
      .from('messages')
      .update({ deleted_by_provider: true })
      .eq('conversation_id', activeCid);
    setMessages([]);
  };

  // 🎤 التسجيل الصوتي الفوري ورفعه إلى chat-audio
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        clearInterval(recordIntervalRef.current);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        let options = {};
        if (MediaRecorder.isTypeSupported('audio/webm')) options = { mimeType: 'audio/webm' };
        else if (MediaRecorder.isTypeSupported('audio/mp4')) options = { mimeType: 'audio/mp4' };

        const recorder = new MediaRecorder(stream, options);
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((tr) => tr.stop());
          const rawMime = recorder.mimeType || 'audio/webm';
          const cleanMime = rawMime.split(';')[0];
          const audioBlob = new Blob(audioChunksRef.current, { type: cleanMime });
          if (audioBlob.size === 0) return;

          const ext = cleanMime.includes('mp4') ? 'm4a' : 'webm';
          const fileName = `audio_prov_${Date.now()}.${ext}`;
          const { error } = await supabase.storage
            .from('chat-audio')
            .upload(fileName, audioBlob, { contentType: cleanMime });

          if (!error) {
            const { data: pubData } = supabase.storage.from('chat-audio').getPublicUrl(fileName);
            await supabase.from('messages').insert([
              {
                conversation_id: parseInt(activeCid),
                sender_type: identity.role,
                content: 'AUDIO_MSG:' + pubData.publicUrl,
                is_read: false
              }
            ]);
          }
        };

        recorder.start(500);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordSeconds(0);
        recordIntervalRef.current = setInterval(() => {
          setRecordSeconds((s) => s + 1);
        }, 1000);
      } catch (err) {
        alert('⚠️ يرجى السماح باستخدام الميكروفون.');
      }
    }
  };

  // 🔊 دوال مشغل الصوت الاحترافي + التشغيل المتتالي الذكي
  const playBeepSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const playTone = (freq, time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        osc.start(time);
        osc.stop(time + 0.15);
      };
      playTone(500, now);
      playTone(750, now + 0.15);
    } catch (e) {}
  };

  const toggleAudioPlay = (msgId) => {
    const audioEl = audioElementsRef.current[msgId];
    if (!audioEl) return;

    // إيقاف أي مقطع صوتي آخر يعمل
    Object.keys(audioElementsRef.current).forEach((id) => {
      if (String(id) !== String(msgId) && audioElementsRef.current[id] && !audioElementsRef.current[id].paused) {
        audioElementsRef.current[id].pause();
        setAudioStates((prev) => ({
          ...prev,
          [id]: { ...(prev[id] || {}), playing: false }
        }));
      }
    });

    if (audioEl.paused) {
      audioEl.play();
      setAudioStates((prev) => ({
        ...prev,
        [msgId]: { ...(prev[msgId] || { speed: 1, muted: false }), playing: true }
      }));
    } else {
      audioEl.pause();
      setAudioStates((prev) => ({
        ...prev,
        [msgId]: { ...(prev[msgId] || {}), playing: false }
      }));
    }
  };

  const handleAudioTimeUpdate = (msgId) => {
    const audioEl = audioElementsRef.current[msgId];
    if (!audioEl || !audioEl.duration || audioEl.duration === Infinity) return;
    const progress = (audioEl.currentTime / audioEl.duration) * 100;
    const mins = Math.floor(audioEl.currentTime / 60);
    const secs = Math.floor(audioEl.currentTime % 60).toString().padStart(2, '0');
    setAudioStates((prev) => ({
      ...prev,
      [msgId]: { ...(prev[msgId] || {}), progress, timeStr: `${mins}:${secs}` }
    }));
  };

  const handleAudioLoadedMetadata = (msgId) => {
    const audioEl = audioElementsRef.current[msgId];
    if (!audioEl) return;
    if (audioEl.duration === Infinity || isNaN(audioEl.duration)) {
      audioEl.currentTime = 1e101;
      const fixDur = () => {
        audioEl.currentTime = 0;
        audioEl.removeEventListener('timeupdate', fixDur);
      };
      audioEl.addEventListener('timeupdate', fixDur);
    } else {
      const mins = Math.floor(audioEl.duration / 60);
      const secs = Math.floor(audioEl.duration % 60).toString().padStart(2, '0');
      setAudioStates((prev) => ({
        ...prev,
        [msgId]: { ...(prev[msgId] || {}), timeStr: `${mins}:${secs}` }
      }));
    }
  };

  const handleAudioEnded = (msgId, indexInList) => {
    setAudioStates((prev) => ({
      ...prev,
      [msgId]: { ...(prev[msgId] || {}), playing: false, progress: 0 }
    }));
    playBeepSound();

    // 🚀 التشغيل التلقائي للمقطع الصوتي التالي إذا كانت الرسالة التالية صوتية!
    setTimeout(() => {
      const nextMsg = messages[indexInList + 1];
      if (nextMsg && nextMsg.content?.startsWith('AUDIO_MSG:')) {
        toggleAudioPlay(nextMsg.id);
      }
    }, 600);
  };

  const changeAudioSpeed = (msgId) => {
    const audioEl = audioElementsRef.current[msgId];
    if (!audioEl) return;
    const nextRate = audioEl.playbackRate === 1 ? 1.5 : audioEl.playbackRate === 1.5 ? 2 : 1;
    audioEl.playbackRate = nextRate;
    setAudioStates((prev) => ({
      ...prev,
      [msgId]: { ...(prev[msgId] || {}), speed: nextRate }
    }));
  };

  const toggleAudioMute = (msgId) => {
    const audioEl = audioElementsRef.current[msgId];
    if (!audioEl) return;
    audioEl.muted = !audioEl.muted;
    setAudioStates((prev) => ({
      ...prev,
      [msgId]: { ...(prev[msgId] || {}), muted: audioEl.muted }
    }));
  };

  // 👥 تفعيل الغرفة الجماعية (ضم المقاول/الحرفي مع المهندس والعميل)
  const handleLinkPartnerToRoom = async () => {
    if (!partnerPhoneOrId.trim() || !activeConv) return;
    try {
      const targetCol = identity.role === 'architect' ? 'provider_id' : 'architect_id';
      const { error } = await supabase
        .from('conversations')
        .update({ [targetCol]: partnerPhoneOrId.trim() })
        .eq('id', activeConv.id);
      if (error) throw error;

      await supabase.from('messages').insert([
        {
          conversation_id: activeConv.id,
          sender_type: identity.role,
          content: `👥 تم تفعيل وضع "غرفة العمليات المشتركة" وضم الشريك الميداني رقم (${partnerPhoneOrId.trim()}) إلى هذه الورشة!`,
          is_read: false
        }
      ]);
      setShowGroupModal(false);
      setPartnerPhoneOrId('');
      alert('✅ تم ضم الشريك إلى غرفة عمليات الورشة بنجاح!');
    } catch (e) {
      alert('⚠️ تأكد من صحة معرف الشريك.');
    }
  };

  // حساب مجاميع الدفتر المالي
  const totalIncome = ledgerItems
    .filter((i) => i.transaction_type === 'income')
    .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalExpense = ledgerItems
    .filter((i) => i.transaction_type === 'expense')
    .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  const formatSmartDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return t.today;
    if (date.toDateString() === yesterday.toDateString()) return t.yesterday;
    return date.toLocaleDateString(isRtl ? 'ar-MA' : 'fr-MA', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: "'Cairo', sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.7; } }
        .pulse-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite; }
        .unread-badge { background: #ef4444; color: white; border-radius: 50%; min-width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; margin: 0 8px; font-weight: bold; box-shadow: 0 0 6px rgba(239,68,68,0.5); }
        .custom-voice-player { display: flex; align-items: center; gap: 10px; background: #f1f5f9; padding: 8px 15px; border-radius: 30px; min-width: 260px; max-width: 340px; direction: ltr; border: 1px solid #e2e8f0; }
        .cvp-play { background: #10b981; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; flex-shrink: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .cvp-wave { flex: 1; height: 26px; position: relative; display: flex; align-items: center; }
        .cvp-visualizer { width: 100%; height: 18px; background: repeating-linear-gradient(90deg, #cbd5e1 0px, #cbd5e1 3px, transparent 3px, transparent 5px); border-radius: 2px; position: absolute; overflow: hidden; }
        .cvp-progress { height: 100%; background: repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 3px, transparent 3px, transparent 5px); transition: width 0.1s linear; }
        .cvp-slider { position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; margin: 0; }
      `}</style>

      {/* ======================================================= */}
      {/* 1. عرض صندوق الرسائل والرادار (عند عدم فتح محادثة معينة) */}
      {/* ======================================================= */}
      {!activeCid ? (
        <>
          {/* رادار الصفقات والاستشارات */}
          <div style={{ background: '#fffbeb', borderTop: `4px solid ${identity.role === 'architect' ? '#6d28d9' : '#f59e0b'}`, borderRadius: '15px', padding: '20px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: identity.role === 'architect' ? '#6d28d9' : '#d97706', fontWeight: 900, margin: 0 }}>
                {identity.role === 'architect' ? t.archRadarTitle : t.provRadarTitle}
              </h3>
              <span style={{ background: identity.role === 'architect' ? 'rgba(109, 40, 217, 0.1)' : '#fef3c7', color: identity.role === 'architect' ? '#6d28d9' : '#d97706', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot" style={{ background: identity.role === 'architect' ? '#6d28d9' : '#d97706' }}></span>
                {identity.role === 'architect' ? t.archRadarBadge : t.provRadarBadge}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {loadingLeads ? (
                <p style={{ textAlign: 'center', color: '#92400e', width: '100%', gridColumn: '1 / -1', margin: 0 }}>
                  {t.scanningRadar}
                </p>
              ) : leads.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 'bold', width: '100%', gridColumn: '1 / -1', margin: 0 }}>
                  {t.noLeads}
                </p>
              ) : (
                leads.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => handleOpenLeadDetails(l.client_id, l.client_name)}
                    style={{ background: 'white', border: '1px solid #fde68a', padding: '15px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>📍 {l.city}</strong>
                      <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.9rem', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                        {l.budget_estimate} د.م
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold', marginBottom: '5px' }}>👷 {l.service_type}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{(l.project_description || '').substring(0, 35)}...</span>
                      <span>⏱️ {new Date(l.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ترويسة صندوق الرسائل */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
            <h1 style={{ color: '#1e40af', fontSize: '1.8rem', margin: 0, fontWeight: 900 }}>{t.inboxTitle}</h1>
            <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" style={{ background: '#22c55e' }}></span>
              {t.onlineDirect} - {onlineClientIds.length} {t.clientsOnline}
            </span>
          </div>

          {/* جدول المحادثات المطابق لـ messages.php */}
          <div style={{ background: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '18px', fontWeight: 700 }}>{t.colClient}</th>
                  <th style={{ padding: '18px', fontWeight: 700 }}>{t.colPhone}</th>
                  <th style={{ padding: '18px', fontWeight: 700 }}>{t.colLastMsg}</th>
                  <th style={{ padding: '18px', fontWeight: 700 }}>{t.colSender}</th>
                  <th style={{ padding: '18px', fontWeight: 700 }}>{t.colTime}</th>
                  <th style={{ padding: '18px', fontWeight: 700 }}>{t.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {loadingList ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#64748b', fontWeight: 'bold' }}>{t.syncingMsgs}</td>
                  </tr>
                ) : conversations.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '1.1rem', fontWeight: 'bold' }}>{t.noConversations}</td>
                  </tr>
                ) : (
                  conversations.map((row) => {
                    const isOnline = onlineClientIds.includes(String(row.client_id));
                    const isMe = row.sender_type === 'provider' || row.sender_type === 'architect';
                    const rawMsg = row.message_text || '...';
                    const displayMsg = rawMsg.startsWith('AUDIO_MSG:')
                      ? t.voiceMsg
                      : rawMsg.replace(/https?:\/\/[^\s]+/g, t.attachedImg);

                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: row.unread_count > 0 ? '#eff6ff' : 'transparent', transition: '0.2s' }}>
                        <td style={{ padding: '18px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>{isOnline ? '🟢' : '⚪'}</span>
                          <span>👤 {row.client_name || 'عميل'} {row.project_name ? `(${row.project_name})` : ''}</span>
                          {row.unread_count > 0 && <span className="unread-badge">{row.unread_count}</span>}
                        </td>
                        <td style={{ padding: '18px', color: '#475569' }} dir="ltr">{row.client_phone || '---'}</td>
                        <td style={{ padding: '18px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: row.unread_count > 0 ? 'bold' : 'normal', color: row.unread_count > 0 ? '#0f172a' : '#64748b' }}>
                          {displayMsg}
                        </td>
                        <td style={{ padding: '18px' }}>
                          {isMe ? (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{t.you}</span>
                          ) : (
                            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{t.client}</span>
                          )}
                        </td>
                        <td style={{ padding: '18px', color: '#94a3b8', fontSize: '0.85rem' }}>
                          {row.last_time ? new Date(row.last_time).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }) : '---'}
                        </td>
                        <td style={{ padding: '18px', display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openLedger(row.client_id, row.client_name || 'عميل', row.id)}
                            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            {t.ledgerBtn}
                          </button>
                          <button
                            onClick={() => setSearchParams({ cid: row.id })}
                            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            {t.chatBtn}
                          </button>
                          <button
                            onClick={() => deleteConversation(row.id)}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                            title={t.deleteTitle}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ======================================================= */
        /* 2. عرض غرفة المحادثة والاتصال الميداني (conversation.php) */
        /* ======================================================= */
        <div
          id="prov-chat-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 130px)',
            minHeight: '500px',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            position: 'relative',
            background: '#efeae2'
          }}
        >
          {/* الشريط العلوي الأخضر المطابق لـ conversation.php */}
          <div
            style={{
              background: '#075e54',
              color: 'white',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.3 }}>
              <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                {t.client}: {activeConv?.client_name || `#${activeCid}`} {activeConv?.project_name ? `— 🏗️ ${activeConv.project_name}` : ''}
              </span>
              <span style={{ fontSize: '0.78rem', color: isClientOnlineInRoom || onlineClientIds.includes(String(activeConv?.client_id)) ? '#4ade80' : '#cbd5e1' }}>
                {isClientOnlineInRoom || onlineClientIds.includes(String(activeConv?.client_id)) ? t.onlineNow : t.offlineNow}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={startFieldVideoCall}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(239,68,68,0.3)' }}
              >
                {t.fieldCallBtn}
              </button>
              <button
                onClick={() => openLedger(activeConv?.client_id, activeConv?.client_name || 'عميل', activeCid)}
                style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                {t.ledgerBtn}
              </button>
              <button
                onClick={() => setShowGroupModal(true)}
                style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                {t.groupInviteBtn}
              </button>
              <button
                onClick={handleClearChat}
                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                {t.clearChatBtn}
              </button>
              <button
                onClick={() => setSearchParams({})}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                {t.backBtn}
              </button>
            </div>
          </div>

          {/* نافذة الرسائل مع خلفية واتساب الرسمية */}
          <div
            ref={chatWindowRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
              setScrollBtnState({ visible: true, dir: dist > 200 ? 'down' : 'up' });
              clearTimeout(scrollHideTimeoutRef.current);
              scrollHideTimeoutRef.current = setTimeout(() => {
                setScrollBtnState((p) => ({ ...p, visible: false }));
              }, 2000);
            }}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
              backgroundRepeat: 'repeat'
            }}
          >
            {loadingChat ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontWeight: 'bold' }}>{t.syncingMsgs}</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontWeight: 'bold' }}>{t.chatCleared}</div>
            ) : (
              messages.map((msg, idx) => {
                const prevMsg = messages[idx - 1];
                const showDateDivider =
                  !prevMsg || new Date(prevMsg.created_at).toDateString() !== new Date(msg.created_at).toDateString();

                const isMyRole = msg.sender_type === identity.role || (identity.role === 'architect' && msg.sender_type === 'architect') || (identity.role === 'provider' && msg.sender_type === 'provider');
                const isClientSender = msg.sender_type === 'client';
                const align = isMyRole ? 'flex-end' : 'flex-start';
                const bgColor = isMyRole ? '#dcf8c6' : isClientSender ? '#ffffff' : '#ede9fe';

                const senderBadge = isClientSender
                  ? t.client
                  : msg.sender_type === 'architect'
                  ? t.architectBadge
                  : t.providerBadge;

                const timeStr = msg.created_at
                  ? new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit', hour12: false })
                  : '';

                const isRead = msg.is_read === true || msg.is_read === 1 || msg.is_read === 't';
                const auState = audioStates[msg.id] || { playing: false, progress: 0, timeStr: '0:00', speed: 1, muted: false };

                return (
                  <React.Fragment key={msg.id}>
                    {showDateDivider && (
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                        <span style={{ background: '#e2e8f0', color: '#475569', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {formatSmartDate(msg.created_at)}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: align, width: '100%', alignItems: 'center', gap: '6px' }}>
                      {/* قائمة النقاط الثلاث للحذف */}
                      <div style={{ position: 'relative', order: isMyRole ? 1 : 2 }}>
                        <span
                          onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                          style={{ fontSize: '18px', padding: '2px 8px', color: '#475569', fontWeight: 900, background: 'rgba(255,255,255,0.85)', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                        >
                          ⋮
                        </span>
                        {openMenuId === msg.id && (
                          <div style={{ position: 'absolute', top: '100%', [isMyRole ? 'right' : 'left']: 0, background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50, minWidth: '130px', overflow: 'hidden' }}>
                            <div onClick={() => handleDeleteMessage(msg.id, 'for_me')} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                              {t.delForMe}
                            </div>
                            {isMyRole && !msg.deleted_for_everyone && (
                              <div onClick={() => handleDeleteMessage(msg.id, 'for_everyone')} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626', fontWeight: 'bold' }}>
                                {t.delForAll}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* فقاعة الرسالة */}
                      <div style={{ order: isMyRole ? 2 : 1, background: bgColor, padding: '10px 15px', borderRadius: '12px', maxWidth: '72%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {!isMyRole && (
                          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: isClientSender ? '#075e54' : '#6d28d9', marginBottom: '4px' }}>
                            {senderBadge}
                          </div>
                        )}

                        {msg.deleted_for_everyone ? (
                          <div style={{ fontStyle: 'italic', color: '#888' }}>{t.msgDeleted}</div>
                        ) : msg.content?.startsWith('AUDIO_MSG:') ? (
                          /* مشغل الصوت الاحترافي */
                          <div className="custom-voice-player">
                            <audio
                              ref={(el) => (audioElementsRef.current[msg.id] = el)}
                              src={msg.content.replace('AUDIO_MSG:', '').trim()}
                              preload="metadata"
                              onTimeUpdate={() => handleAudioTimeUpdate(msg.id)}
                              onLoadedMetadata={() => handleAudioLoadedMetadata(msg.id)}
                              onEnded={() => handleAudioEnded(msg.id, idx)}
                              style={{ display: 'none' }}
                            />
                            <button className="cvp-play" onClick={() => toggleAudioPlay(msg.id)}>
                              {auState.playing ? '⏸️' : '▶️'}
                            </button>
                            <div className="cvp-wave">
                              <div className="cvp-visualizer">
                                <div className="cvp-progress" style={{ width: `${auState.progress || 0}%` }}></div>
                              </div>
                              <input
                                type="range"
                                className="cvp-slider"
                                value={auState.progress || 0}
                                min="0"
                                max="100"
                                onChange={(e) => {
                                  const audioEl = audioElementsRef.current[msg.id];
                                  if (audioEl && audioEl.duration) {
                                    audioEl.currentTime = (e.target.value / 100) * audioEl.duration;
                                  }
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', minWidth: '32px' }}>
                                {auState.timeStr || '0:00'}
                              </span>
                              {auState.playing && (
                                <button onClick={() => changeAudioSpeed(msg.id)} style={{ background: '#e2e8f0', border: 'none', borderRadius: '8px', padding: '2px 6px', fontSize: '0.72rem', fontWeight: 900, cursor: 'pointer' }}>
                                  {auState.speed || 1}x
                                </button>
                              )}
                              <button onClick={() => toggleAudioMute(msg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                                {auState.muted ? '🔇' : '🔊'}
                              </button>
                            </div>
                          </div>
                        ) : msg.content === '📞 VIDEO_CALL_REQUEST' ? (
                          <div style={{ background: '#dcfce7', border: '2px solid #22c55e', padding: '12px', borderRadius: '10px', textAlign: 'center', minWidth: '210px' }}>
                            <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 'bold', marginBottom: '8px' }}>{t.incomingCall}</div>
                            <button
                              onClick={() => window.open(`/v2/architect/live-room/${activeCid}`, '_blank')}
                              style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                            >
                              {t.answerCall}
                            </button>
                          </div>
                        ) : msg.content === '📞 VIDEO_CALL_ENDED' ? (
                          <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>{t.endedCall}</div>
                        ) : (
                          <div style={{ color: '#1e293b', fontSize: '0.95rem', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                            {msg.content}
                          </div>
                        )}

                        {/* عرض المرفقات والصور */}
                        {msg.file_path && !msg.deleted_for_everyone && (
                          <div style={{ marginTop: '8px' }}>
                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file_path) ? (
                              <img
                                src={msg.file_path}
                                alt="attachment"
                                style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                onClick={() => window.open(msg.file_path, '_blank')}
                              />
                            ) : (
                              <a
                                href={msg.file_path}
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', display: 'inline-block', fontWeight: 'bold' }}
                              >
                                {t.downloadAttachment}
                              </a>
                            )}
                          </div>
                        )}

                        <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'left', marginTop: '5px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                          <span>{timeStr}</span>
                          {isMyRole && (
                            <span style={{ color: isRead ? '#3b82f6' : '#94a3b8', fontWeight: 'bold', fontSize: '0.8rem' }}>
                              {isRead ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* مؤشر الكتابة وحالة الملف المرفق */}
          {isClientTyping && (
            <div style={{ padding: '5px 15px', fontSize: '0.85rem', color: '#075e54', fontWeight: 'bold', background: '#e0f2fe', borderRadius: '15px', alignSelf: 'flex-start', margin: '6px 15px' }}>
              {t.typingNow}
            </div>
          )}
          {selectedFile && (
            <div style={{ fontSize: '0.75rem', color: '#075e54', padding: '6px 18px', background: '#e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t.fileSelected} ({selectedFile.name})</span>
              <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
            </div>
          )}

          {/* الشريط السفلي للإرسال والتسجيل الصوتي */}
          <div style={{ background: '#f0f0f0', padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid #ddd' }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ background: 'none', border: 'none', color: '#075e54', fontSize: '1.5rem', cursor: 'pointer', padding: '0 5px' }}
            >
              📎
            </button>
            <button
              type="button"
              onClick={toggleRecording}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 5px' }}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>

            {isRecording && (
              <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>{t.recordingNow}</span>
                <span style={{ background: '#fee2e2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                  {String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:{String(recordSeconds % 60).padStart(2, '0')}
                </span>
              </span>
            )}

            <input
              type="text"
              value={msgInput}
              onChange={(e) => handleTypingInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t.inputPlaceholder}
              style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #ccc', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              style={{ background: '#075e54', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {t.sendBtn}
            </button>
          </div>

          {/* زر القفز السريع للأعلى/الأسفل */}
          {scrollBtnState.visible && (
            <button
              onClick={() => {
                if (!chatWindowRef.current) return;
                chatWindowRef.current.scrollTo({
                  top: scrollBtnState.dir === 'down' ? chatWindowRef.current.scrollHeight : 0,
                  behavior: 'smooth'
                });
              }}
              style={{ position: 'fixed', bottom: '95px', right: '25px', width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #38bdf8)', color: 'white', border: 'none', fontSize: '1.2rem', cursor: 'pointer', zIndex: 9999, boxShadow: '0 5px 15px rgba(30,58,138,0.4)' }}
            >
              {scrollBtnState.dir === 'down' ? '⬇️' : '⬆️'}
            </button>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* 📒 نافذة الدفتر المالي الرقمي (Ledger Modal) */}
      {/* ======================================================= */}
      {ledgerModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '95%', maxWidth: '600px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{t.ledgerTitle} <span style={{ color: '#fde047' }}>{ledgerModal.clientName}</span></h3>
              <button onClick={() => setLedgerModal({ open: false, clientId: null, clientName: '', conversationId: null })} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '35px', height: '35px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ padding: '25px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px', borderRadius: '15px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 'bold' }}>{t.totalIncome}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>{totalIncome.toLocaleString()} د.م</div>
                </div>
                <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', padding: '15px', borderRadius: '15px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 'bold' }}>{t.totalExpense}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#b91c1c' }}>{totalExpense.toLocaleString()} د.م</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setTransForm({ show: true, type: 'income', amount: '', desc: '', saving: false })} style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.addIncomeBtn}
                </button>
                <button onClick={() => setTransForm({ show: true, type: 'expense', amount: '', desc: '', saving: false })} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.addExpenseBtn}
                </button>
              </div>

              {transForm.show && (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '2px dashed #cbd5e1', marginBottom: '20px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>{t.amountLabel} *</label>
                    <input type="number" value={transForm.amount} onChange={(e) => setTransForm({ ...transForm, amount: e.target.value })} placeholder="500" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>{t.descLabel} *</label>
                    <input type="text" value={transForm.desc} onChange={(e) => setTransForm({ ...transForm, desc: e.target.value })} placeholder={t.descPlace} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }} />
                  </div>
                  <button
                    disabled={transForm.saving}
                    onClick={saveTransaction}
                    style={{ width: '100%', padding: '12px', background: transForm.type === 'income' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {transForm.saving ? '...' : t.saveTransBtn}
                  </button>
                </div>
              )}

              <h4 style={{ color: '#1e293b', marginBottom: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>{t.ledgerHistoryTitle}</h4>
              <div style={{ maxHeight: '220px', overflowY: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>{t.colDate}</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>{t.colDetails}</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>{t.colType}</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>{t.colAmount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLedger ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>⏳ ...</td></tr>
                    ) : ledgerItems.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '25px', color: '#94a3b8', fontWeight: 'bold' }}>{t.emptyLedger}</td></tr>
                    ) : (
                      ledgerItems.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px', color: '#64748b', fontSize: '0.8rem' }}>
                            {new Date(item.created_at).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })}
                          </td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#334155' }}>{item.description}</td>
                          <td style={{ padding: '10px' }}>
                            {item.transaction_type === 'income' ? (
                              <span style={{ color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>{t.incomeBadge}</span>
                            ) : (
                              <span style={{ color: '#991b1b', background: '#fee2e2', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>{t.expenseBadge}</span>
                            )}
                          </td>
                          <td style={{ padding: '10px', fontWeight: 900, color: item.transaction_type === 'income' ? '#15803d' : '#b91c1c' }} dir="ltr">
                            {item.amount} د.م
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 👥 نافذة تفعيل غرفة العمليات الجماعية (المهندس + المقاول + العميل) */}
      {/* ======================================================= */}
      {showGroupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '440px', borderRadius: '18px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#4c1d95' }}>👥 غرفة عمليات الورشة المشتركة</h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
              يمكنك ربط {identity.role === 'architect' ? 'المقاول / الحرفي المنفذ' : 'المهندس المعماري المشرف'} بهذه المحادثة لتصبح غرفة عمليات ثلاثية تجمع (العميل + المهندس + المقاول) في آن واحد!
            </p>
            <input
              type="text"
              value={partnerPhoneOrId}
              onChange={(e) => setPartnerPhoneOrId(e.target.value)}
              placeholder={identity.role === 'architect' ? 'أدخل المعرف الرقمي للمقاول (Provider ID)...' : 'أدخل معرف المهندس (Architect ID)...'}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '15px', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleLinkPartnerToRoom} style={{ flex: 2, background: '#6d28d9', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>
                ✅ تفعيل الغرفة الثلاثية
              </button>
              <button onClick={() => setShowGroupModal(false)} style={{ flex: 1, background: '#e2e8f0', color: '#334155', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}