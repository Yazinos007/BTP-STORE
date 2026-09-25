import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { 
  Search, Send, Paperclip, Mic, Phone, Video, 
  MoreVertical, CheckCheck, X, ShoppingCart, 
  Image as ImageIcon, Briefcase, FileText, Play, Trash2, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase'; 

export default function ChatRoom() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || false;
  const language = context.language || 'ar';
  const isRtl = language === 'ar';
  
  const location = useLocation();
  const { cartOrder } = location.state || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const [activeCall, setActiveCall] = useState(null); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);

  // تحديد حساب المستخدم الحالي
  const CURRENT_USER_TYPE = 'retailer';

  // قواميس الترجمة
  const t = {
    ar: {
      title: "صندوق الرسائل", searchPlaceholder: "ابحث في المحادثات...",
      typeMessage: "اكتب رسالة...", online: "متصل الآن", offline: "آخر ظهور منذ ساعتين",
      orderCardTitle: "طلب مبدئي من السلة", total: "المجموع المبدئي:",
      accept: "قبول واعتماد", reject: "رفض وتفاوض", negotiate: "قيد التفاوض...",
      recording: "جاري التسجيل...", cancel: "إلغاء", send: "إرسال",
      calling: "جاري الاتصال...", endCall: "إنهاء المكالمة",
      clearChat: "إفراغ المحادثة", deleteMsg: "حذف", typing: "يكتب الآن...",
      supplierReplyOrder: "لقد جهزنا لك عرض السعر النهائي:",
      systemAccept: "🎉 تم اعتماد العرض بنجاح! تم تحويل الطلبية للتحضير.",
      negotiateMsg: "أريد التفاوض حول هذا العرض.. هل يمكننا تخفيض السعر الإجمالي أو إزالة تكلفة النقل؟",
      genericReply: "شكراً لتواصلك! سيتم مراجعة رسالتك قريباً.",
      cartOrderTitle: "طلبية من السلة",
      newNegotiation: "طلب تفاوض جديد",
      selectChatPrompt: "اختر محادثة للبدء",
      quoteTitle: "عرض سعر رسمي (Devis)",
      productsTitle: "المنتجات:",
      transportTitle: "تكلفة النقل:",
      totalTitle: "الإجمالي:",
      quoteAccepted: "تم اعتماد العرض",
      quoteRejected: "تم الرفض للتفاوض",
      audioMessage: "رسالة صوتية",
      imageMessage: "صورة مرفقة",
      documentMessage: "مستند مرفق",
      confirmClearChat: "هل أنت متأكد من إفراغ محادثة هذا المورد فقط؟",
      confirmDeleteMsg: "هل أنت متأكد أنك تريد حذف هذه الرسالة؟"
    },
    fr: {
      title: "Boîte de Réception", searchPlaceholder: "Rechercher...",
      typeMessage: "Écrivez un message...", online: "En ligne", offline: "Vu il y a 2 heures",
      orderCardTitle: "Demande depuis le panier", total: "Total Initial :",
      accept: "Accepter le Devis", reject: "Refuser et Négocier", negotiate: "En négociation...",
      recording: "Enregistrement...", cancel: "Annuler", send: "Envoyer",
      calling: "Appel en cours...", endCall: "Raccrocher",
      clearChat: "Vider le chat", deleteMsg: "Supprimer", typing: "Entraîne d'écrire...",
      supplierReplyOrder: "Nous avons préparé votre devis final :",
      systemAccept: "🎉 Devis validé avec succès ! La commande est en préparation.",
      negotiateMsg: "Je souhaite négocier cette offre. Pouvons-nous réduire le prix total ou annuler les frais de livraison ?",
      genericReply: "Merci pour votre message ! Nous allons l'examiner.",
      cartOrderTitle: "Commande du panier",
      newNegotiation: "Nouvelle demande de négociation",
      selectChatPrompt: "Sélectionnez un chat pour commencer",
      quoteTitle: "Devis Officiel",
      productsTitle: "Produits :",
      transportTitle: "Transport :",
      totalTitle: "Total :",
      quoteAccepted: "Devis accepté",
      quoteRejected: "Rejeté pour négociation",
      audioMessage: "Message vocal",
      imageMessage: "Image jointe",
      documentMessage: "Document joint",
      confirmClearChat: "Êtes-vous sûr de vouloir vider le chat de ce fournisseur uniquement ?",
      confirmDeleteMsg: "Êtes-vous sûr de vouloir supprimer ce message ?"
    },
    en: {
       title: "Inbox", searchPlaceholder: "Search chats...",
      typeMessage: "Type a message...", online: "Online", offline: "Last seen 2 hours ago",
      orderCardTitle: "Initial Cart Request", total: "Initial Total:",
      accept: "Accept Quote", reject: "Reject & Negotiate", negotiate: "In Negotiation...",
      recording: "Recording...", cancel: "Cancel", send: "Send",
      calling: "Calling...", endCall: "End Call",
      clearChat: "Clear Chat", deleteMsg: "Delete", typing: "Typing...",
      supplierReplyOrder: "We have prepared your final quote:",
      systemAccept: "🎉 Quote successfully accepted! The order is now in preparation.",
      negotiateMsg: "I would like to negotiate this offer. Can we reduce the total price or remove the shipping cost?",
      genericReply: "Thank you for reaching out! Your message will be reviewed.",
      cartOrderTitle: "Cart Order",
      newNegotiation: "New negotiation request",
      selectChatPrompt: "Select a chat to start",
      quoteTitle: "Official Quote",
      productsTitle: "Products:",
      transportTitle: "Transport:",
      totalTitle: "Total:",
      quoteAccepted: "Quote accepted",
      quoteRejected: "Rejected for negotiation",
      audioMessage: "Voice message",
      imageMessage: "Attached image",
      documentMessage: "Attached document",
      confirmClearChat: "Are you sure you want to clear this supplier's chat only?",
      confirmDeleteMsg: "Are you sure you want to delete this message?"
    }
  }[language] || t.ar;

  // فلترة المحادثات بناءً على كلمة البحث (البحث في اسم المحادثة)
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTodayDate = () => {
    return new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', { day: 'numeric', month: 'long' });
  };

  // دالة الترجمة الفورية للمفاتيح
  const renderTranslatedText = (text) => {
    if (text === 'KEY_SUPPLIER_REPLY_ORDER') return t.supplierReplyOrder;
    if (text === 'KEY_SYSTEM_ACCEPT') return t.systemAccept;
    if (text === 'KEY_GENERIC_REPLY') return t.genericReply;
    if (text === 'KEY_CART_ORDER_TITLE') return t.cartOrderTitle;
    if (text === 'KEY_NEW_NEGOTIATION') return t.newNegotiation;
    if (text === 'KEY_AUDIO_MSG') return t.audioMessage;
    if (text === 'KEY_IMAGE_MSG') return t.imageMessage;
    if (text === 'KEY_DOC_MSG') return t.documentMessage;
    return text; 
  };

  // 1. جلب المحادثات
  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (data) {
        const formattedChats = data.map(conv => ({
          id: conv.id,
          name: conv.client_name || `محادثة #${conv.id}`,
          avatar: (conv.client_name || "C").slice(0, 2).toUpperCase(),
          type: "supplier",
          unread: 0,
          status: "online",
          lastMessage: renderTranslatedText(conv.last_message || "لا توجد رسائل")
        }));
        setChats(formattedChats);
        
        if (formattedChats.length > 0 && !activeChat && (!cartOrder || cartOrder?.items?.length === 0)) {
          setActiveChat(formattedChats[0].id);
        }
      }
    };
    fetchConversations();
  }, [cartOrder, activeChat]); // إضافة activeChat لضمان عدم ضياع التحديد

  // 2. جلب الرسائل والتحديث اللحظي المستقر
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeChat)
        .order('created_at', { ascending: true });

      if (data) {
        const formattedMessages = data.map(dbMsg => {
          let parsedData = { type: 'text', text: dbMsg.content };
          try {
            if (dbMsg.content && dbMsg.content.startsWith('{')) {
              parsedData = JSON.parse(dbMsg.content);
            }
          } catch (e) { console.error("Error parsing message", e); }

          return {
            id: dbMsg.id,
            chatId: dbMsg.conversation_id,
            senderId: dbMsg.sender_type,
            isMe: dbMsg.sender_type === CURRENT_USER_TYPE || dbMsg.sender_type === 'architect',
            time: new Date(dbMsg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: new Date(dbMsg.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', { day: 'numeric', month: 'long' }),
            ...parsedData
          };
        });
        setMessages(formattedMessages);
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel(`messages_for_chat_${activeChat}`)
      .on('postgres_changes', { 
        event: '*', // الاستماع لكل شيء (إضافة، مسح، تعديل)
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${activeChat}`
      }, (payload) => {
         fetchMessages(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeChat, language]);

  // 3. دالة إرسال الرسائل (مع دعم المفاتيح)
  const insertMessageToDB = async (chatId, type, contentObj, sender = CURRENT_USER_TYPE) => {
    let finalContent = contentObj.text || contentObj.fileName || "File";
    let lastMessageSummary = finalContent;

    if (type !== 'text') {
      finalContent = JSON.stringify({ type, ...contentObj });
      if(type === 'audio') lastMessageSummary = 'KEY_AUDIO_MSG';
      if(type === 'image') lastMessageSummary = 'KEY_IMAGE_MSG';
      if(type === 'document') lastMessageSummary = 'KEY_DOC_MSG';
      if(type === 'order_card') lastMessageSummary = 'KEY_CART_ORDER_TITLE';
      if(type === 'quote_card') lastMessageSummary = 'KEY_SUPPLIER_REPLY_ORDER';
    }

    const { error } = await supabase.from('messages').insert({
      conversation_id: chatId,
      sender_type: sender,
      content: finalContent,
      is_read: false
    });

    if (!error) {
      await supabase.from('conversations').update({ 
        last_message: lastMessageSummary,
        updated_at: new Date()
      }).eq('id', chatId);
      
      // التحديث اللحظي للمحادثات
      setChats(prev => prev.map(c => c.id === chatId ? {...c, lastMessage: renderTranslatedText(lastMessageSummary)} : c));
    } else {
      console.error("Error sending message:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    const textToSend = newMessage;
    setNewMessage(''); 
    
    await insertMessageToDB(activeChat, 'text', { text: textToSend });
    
    setIsTyping(true);
    setTimeout(() => {
      insertMessageToDB(activeChat, 'text', { text: 'KEY_GENERIC_REPLY' }, 'provider');
      setIsTyping(false);
    }, 2500);
  };

  // 4. معالجة طلبات السلة بأمان (لمنع التكرار عند تغيير اللغة)
  const hasProcessedCart = useRef(false);

  useEffect(() => {
    if (cartOrder && cartOrder.items && cartOrder.items.length > 0 && !hasProcessedCart.current) {
      const processCartToDB = async () => {
        hasProcessedCart.current = true; 

        const supplierGroups = {};
        cartOrder.items.forEach(item => {
          const sup = item.product?.supplier || "المورد العام";
          if (!supplierGroups[sup]) supplierGroups[sup] = { items: [], total: 0 };
          supplierGroups[sup].items.push(item);
          const p = item.product;
          const activePrice = item.qty >= (p.min_wholesale_qty || 999999) ? (p.price_wholesale || p.price) : (p.price_retail || p.price);
          supplierGroups[sup].total += activePrice * item.qty;
        });

        for (const [supName, groupData] of Object.entries(supplierGroups)) {
          const { data: existingConvs } = await supabase
            .from('conversations')
            .select('id')
            .eq('client_name', supName)
            .limit(1);

          let targetConvId;

          if (existingConvs && existingConvs.length > 0) {
            targetConvId = existingConvs[0].id;
          } else {
            const { data: newConv } = await supabase.from('conversations').insert({
              client_name: supName,
              status: 'active',
              project_name: 'KEY_CART_ORDER_TITLE', 
              last_message: 'KEY_NEW_NEGOTIATION'
            }).select().single();
            if (newConv) targetConvId = newConv.id;
          }

          if (targetConvId) {
            setActiveChat(targetConvId); 
            await insertMessageToDB(targetConvId, 'order_card', { orderData: groupData }, CURRENT_USER_TYPE);

            setIsTyping(true);
            setTimeout(async () => {
              await insertMessageToDB(targetConvId, 'text', { text: 'KEY_SUPPLIER_REPLY_ORDER' }, 'provider');
              
              const quotePayload = {
                quoteStatus: 'pending',
                quoteData: {
                  subtotal: groupData.total,
                  transport: 450,
                  total: groupData.total + 450,
                  currency: groupData.items[0]?.product?.currency || 'MAD'
                }
              };
              await insertMessageToDB(targetConvId, 'quote_card', quotePayload, 'provider');
              setIsTyping(false);
            }, 3000);
          }
        }
        window.history.replaceState({}, document.title); 
      };
      
      processCartToDB();
    }
  }, [cartOrder]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleAcceptQuote = async (msgId, originalData) => {
    const updatedContent = JSON.stringify({ ...originalData, quoteStatus: 'accepted' });
    await supabase.from('messages').update({ content: updatedContent }).eq('id', msgId);
    
    setTimeout(() => {
      insertMessageToDB(activeChat, 'system', { text: 'KEY_SYSTEM_ACCEPT' }, 'system');
    }, 500);
  };

  const handleRejectQuote = async (msgId, originalData) => {
    const updatedContent = JSON.stringify({ ...originalData, quoteStatus: 'rejected' });
    await supabase.from('messages').update({ content: updatedContent }).eq('id', msgId);
    setNewMessage(t.negotiateMsg);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 🚀 تفعيل زر المكالمات
  const handleCall = (type) => {
    setActiveCall(type);
  };

  // 🚀 تفعيل التسجيل الصوتي
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("يرجى إعطاء صلاحية استخدام الميكروفون للمتصفح 🎙️");
      console.error(err);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); 
    }
    clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const sendAudioMessage = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType }); 
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          await insertMessageToDB(activeChat, 'audio', {
            audioUrl: base64Audio,
            duration: formatTime(recordingTime),
          });
          audioChunksRef.current = [];
        };
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(timerIntervalRef.current);
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  // 🚀 تفعيل رفع الصور
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      await insertMessageToDB(activeChat, 'image', { fileUrl: reader.result });
    };
  };

  // 🚀 تفعيل رفع المستندات
  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    insertMessageToDB(activeChat, 'document', { fileName: file.name, fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB" });
  };

  // 🚀 تفعيل الحذف الفوري للرسالة مع رسالة تأكيد
  const handleDeleteMessage = async (id) => { 
     // أضفنا رسالة التأكيد هنا
     if (window.confirm(t.confirmDeleteMsg)) {
       const { error } = await supabase.from('messages').delete().eq('id', id);
       if (!error) {
         // تحديث الواجهة فوراً دون انتظار WebSocket
         setMessages(prev => prev.filter(msg => msg.id !== id));
       }
     }
  };
  
  // 🚀 تفعيل التفريغ الفوري لمحادثة كاملة مع رسالة مترجمة
  const handleClearChat = async () => {
    // استخدمنا الترجمة هنا
    if (window.confirm(t.confirmClearChat)) {
      const { error } = await supabase.from('messages').delete().eq('conversation_id', activeChat);
      if (!error) {
        setMessages([]); // تحديث الواجهة فوراً
        setShowDropdown(false);
      }
    }
  };

  const activeChatData = chats.find(c => c.id === activeChat) || null;

  const mainWrapperBg = isDarkMode ? 'bg-slate-950' : 'bg-emerald-50'; 
  const panelBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const glassInputBg = isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-800';

  return (
    <div className={`h-[82vh] rounded-3xl animate-fade-in overflow-hidden shadow-2xl ${mainWrapperBg} p-2 md:p-0`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex h-full rounded-3xl border ${panelBg} overflow-hidden`}>
        
        {/* Inbox Sidebar */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r relative z-20 ${isRtl ? 'border-l border-r-0' : 'border-r'} ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className={`p-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h2 className={`text-xl md:text-2xl font-black mb-4 flex items-center gap-2 ${textTitle}`}>
              <Briefcase className="text-teal-600 dark:text-teal-500" /> {t.title}
            </h2>
            <div className="relative">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-500`} />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                // 🚀 ربط الحقل بـ State البحث
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2.5 rounded-xl text-sm font-bold outline-none transition-all ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} ${glassInputBg} focus:border-teal-600 border placeholder-slate-500`} 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* 🚀 استخدام المصفوفة المفلترة بدلاً من chats */}
            {filteredChats.map(chat => (
              <div key={chat.id} onClick={() => setActiveChat(chat.id)} className={`p-4 border-b cursor-pointer transition-colors flex items-center gap-3 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/80' : 'border-slate-100 hover:bg-slate-50'} ${activeChat === chat.id ? (isDarkMode ? 'bg-slate-800 border-l-4 border-l-teal-500' : 'bg-emerald-50/50 border-l-4 border-l-teal-600 shadow-sm') : 'border-l-4 border-l-transparent'}`}>
                {/* ... باقي كود عرض المحادثة (الصورة، الاسم، الرسالة الأخيرة) كما هو ... */}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${activeChat === chat.id ? 'bg-teal-500 text-white shadow-md' : isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {chat.avatar}
                  </div>
                  {chat.status === 'online' && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-black text-sm truncate ${textTitle}`}>{chat.name}</h3>
                  </div>
                  <p className={`text-xs truncate ${chat.unread > 0 ? (isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-black') : textMuted}`}>{chat.lastMessage}</p>
                </div>
              </div>
            ))}
            
            {/* 🚀 رسالة اختيارية في حال لم يتم العثور على نتائج */}
            {filteredChats.length === 0 && (
                <div className="p-4 text-center text-sm font-bold text-slate-500">
                    لا توجد نتائج للبحث
                </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`hidden md:flex flex-1 flex-col relative z-0 ${isDarkMode ? 'bg-[#0b141a]' : 'bg-[#efeae2]'}`}>
          
          {/* 🚀 الخلفية السحرية: نعتمد صورتك الأصلية فقط (لا روابط خارجية بعد الآن) */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '400px',
              // الشفافية 100% للوضع الفاتح ليكون واضحاً، و 80% للوضع الداكن
              opacity: isDarkMode ? 0.8 : 1, 
              // نعكس ألوان الصورة في الوضع الداكن لتصبح الخطوط بيضاء
              filter: isDarkMode ? 'invert(1)' : 'none'
            }}
          ></div>
          
          {activeChatData ? (
          <>
          {/* Header */}
          <div className={`p-4 border-b flex justify-between items-center relative z-20 ${isDarkMode ? 'bg-[#202c33] border-slate-700/50' : 'bg-[#f0f2f5] border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white bg-gradient-to-br from-teal-400 to-teal-600 shadow-md`}>
                {activeChatData.avatar}
              </div>
              <div>
                <h3 className={`font-black ${textTitle}`}>{activeChatData.name}</h3>
                <p className={`text-xs font-bold flex items-center gap-1 ${activeChatData.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' : textMuted}`}>
                  {activeChatData.status === 'online' ? t.online : t.offline}
                  {isTyping && <span className="text-teal-500 ml-2 animate-pulse text-[10px]">{t.typing}</span>}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <button onClick={() => handleCall('voice')} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'}`}><Phone size={18}/></button>
              <button onClick={() => handleCall('video')} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'}`}><Video size={18}/></button>
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'}`}>
                  <MoreVertical size={18}/>
                </button>
                {showDropdown && (
                  <div className={`absolute top-full ${isRtl ? 'left-0' : 'right-0'} mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden z-50 animate-fade-in ${isDarkMode ? 'bg-[#202c33] border-slate-700' : 'bg-white border-slate-200'}`}>
                    <button onClick={handleClearChat} className="w-full px-4 py-3 flex items-center gap-3 text-red-500 hover:bg-red-500/10 font-bold text-sm transition-colors">
                      <Trash2 size={16}/> {t.clearChat}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar relative z-10" onClick={() => setShowDropdown(false)}>
            {messages.map((msg, index) => {
              const showDate = index === 0 || msg.date !== messages[index - 1].date;
              
              if (msg.type === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-4 w-full animate-fade-in">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-xl text-center shadow-sm max-w-[85%] flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-500"/>
                      {renderTranslatedText(msg.text)}
                    </div>
                  </div>
                );
              }

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4 animate-fade-in">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-lg shadow-sm ${isDarkMode ? 'bg-[#182229] text-slate-400 border border-slate-700/50' : 'bg-white text-slate-500 border border-slate-100'}`}>
                        {msg.date || "اليوم"}
                      </span>
                    </div>
                  )}

                  <div className={`group relative flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-slide-up items-center gap-3`}>
                    {msg.isMe && (
                      <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all">
                        <Trash2 size={16}/>
                      </button>
                    )}
                    <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      
                      {(!msg.type || msg.type === 'text') && (
                        <div className={`px-3 py-2 shadow-sm ${msg.isMe ? (isDarkMode ? 'bg-[#005c4b] text-white' : 'bg-[#dcf8c6] text-slate-900') : (isDarkMode ? 'bg-[#202c33] text-white' : 'bg-white text-slate-900')} rounded-2xl ${msg.isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          <p className="text-sm font-medium leading-relaxed" style={{ wordBreak: 'break-word' }}>{renderTranslatedText(msg.text)}</p>
                          <div className={`flex items-center gap-1 mt-1 justify-end ${msg.isMe ? (isDarkMode ? 'text-teal-200/70' : 'text-teal-700/60') : textMuted}`}>
                            <span className="text-[10px] font-bold">{msg.time}</span>
                            {msg.isMe && <CheckCheck size={14} className={isDarkMode ? 'text-[#53bdeb]' : 'text-[#34b7f1]'} />}
                          </div>
                        </div>
                      )}

                      {msg.type === 'image' && (
                        <div className={`p-1 shadow-sm ${msg.isMe ? (isDarkMode ? 'bg-[#005c4b]' : 'bg-[#dcf8c6]') : (isDarkMode ? 'bg-[#202c33]' : 'bg-white')} rounded-2xl ${msg.isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          <img src={msg.fileUrl} alt="attachment" className="max-w-[250px] rounded-xl object-cover" />
                           <div className="flex items-center gap-1 mt-1 px-1 justify-end">
                            <span className="text-[10px] font-bold text-slate-500">{msg.time}</span>
                            {msg.isMe && <CheckCheck size={14} className={isDarkMode ? 'text-[#53bdeb]' : 'text-[#34b7f1]'} />}
                          </div>
                        </div>
                      )}

                      {msg.type === 'document' && (
                        <div className={`p-3 shadow-sm flex items-center gap-3 ${msg.isMe ? (isDarkMode ? 'bg-[#005c4b] text-white' : 'bg-[#dcf8c6] text-slate-900') : (isDarkMode ? 'bg-[#202c33] text-white' : 'bg-white text-slate-900')} rounded-2xl ${msg.isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          <div className="p-2 bg-black/5 dark:bg-white/10 rounded-xl"><FileText size={24}/></div>
                          <div>
                            <p className="text-sm font-black">{msg.fileName}</p>
                            <p className="text-xs opacity-80">{msg.fileSize}</p>
                          </div>
                        </div>
                      )}

                      {msg.type === 'audio' && (
                        <div className={`p-1.5 shadow-sm flex items-center gap-2 ${msg.isMe ? (isDarkMode ? 'bg-[#005c4b] text-white' : 'bg-[#dcf8c6] text-slate-900') : (isDarkMode ? 'bg-[#202c33] text-white' : 'bg-white text-slate-900')} rounded-2xl ${msg.isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          <audio controls src={msg.audioUrl} className="h-10 w-[240px] outline-none rounded-full" />
                        </div>
                      )}

                      {msg.type === 'order_card' && (
                        <div className={`p-1 shadow-sm border ${msg.isMe ? (isDarkMode ? 'bg-[#005c4b]/30 border-[#005c4b]/50' : 'bg-teal-50 border-teal-200') : (isDarkMode ? 'bg-[#202c33] border-slate-700/50' : 'bg-white border-slate-200')} rounded-2xl ${msg.isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/60' : 'bg-white/60'}`}>
                            <div className={`flex items-center gap-2 mb-3 pb-3 border-b border-dashed ${isDarkMode ? 'border-slate-700/50' : 'border-slate-300'}`}>
                              <ShoppingCart className="text-teal-600 dark:text-teal-500" size={20}/>
                              <h4 className={`font-black text-sm ${textTitle}`}>{t.orderCardTitle}</h4>
                            </div>
                            <ul className="space-y-2 mb-4">
                              {msg.orderData?.items?.map((item, idx) => (
                                <li key={idx} className={`text-xs font-bold flex justify-between ${textMuted}`}>
                                  <span>{item.qty}x {item.product.name}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                              <span className="text-xs font-black text-teal-700 dark:text-teal-500">{t.total}</span>
                              <span className="font-black text-teal-700 dark:text-teal-500 text-lg" dir="ltr">{msg.orderData?.total?.toLocaleString()} MAD</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.type === 'quote_card' && (
                        <div className={`p-1 shadow-sm border-2 ${isDarkMode ? 'bg-[#202c33] border-emerald-500/30' : 'bg-white border-emerald-500/30'} rounded-2xl ${msg.isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} w-[280px]`}>
                          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/60' : 'bg-emerald-50/50'}`}>
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-dashed border-emerald-500/40">
                              <FileText className="text-emerald-500" size={20}/>
                              <h4 className={`font-black text-sm ${textTitle}`}>{t.quoteTitle}</h4>
                            </div>
                            <div className="space-y-2 mb-4 text-xs font-bold">
                              <div className={`flex justify-between ${textMuted}`}><span>{t.productsTitle}</span> <span dir="ltr">{msg.quoteData?.subtotal?.toLocaleString()} MAD</span></div>
                              <div className="flex justify-between text-amber-500"><span>{t.transportTitle}</span> <span dir="ltr">+{msg.quoteData?.transport?.toLocaleString()} MAD</span></div>
                              <div className="flex justify-between border-t border-emerald-500/20 pt-3 mt-2 text-lg font-black text-emerald-500">
                                <span>{t.totalTitle}</span> <span dir="ltr">{msg.quoteData?.total?.toLocaleString()} MAD</span>
                              </div>
                            </div>
                            
                            {msg.quoteStatus === 'pending' ? (
                              <div className="flex gap-2 mt-4">
                                <button onClick={() => handleAcceptQuote(msg.id, {type: msg.type, quoteData: msg.quoteData})} className="flex-1 bg-emerald-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20">✅ {t.accept}</button>
                                <button onClick={() => handleRejectQuote(msg.id, {type: msg.type, quoteData: msg.quoteData})} className="flex-1 bg-red-500/10 text-red-500 py-2 rounded-lg font-bold text-xs hover:bg-red-500/20 transition-colors">❌ {t.reject}</button>
                              </div>
                            ) : msg.quoteStatus === 'accepted' ? (
                              <div className="text-center py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg text-xs mt-2 flex items-center justify-center gap-1">
                                <CheckCheck size={14}/> {t.quoteAccepted}
                              </div>
                            ) : (
                              <div className="text-center py-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-lg text-xs mt-2 flex items-center justify-center gap-1">
                                <X size={14}/> {t.quoteRejected}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1 justify-end">
                            <span className="text-[10px] font-bold text-slate-500">{msg.time}</span>
                          </div>
                        </div>
                      )}

                    </div>
                    {!msg.isMe && (
                      <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className={`p-3 shadow-sm flex items-center gap-2 ${isDarkMode ? 'bg-[#202c33] text-slate-300' : 'bg-white text-slate-500'} rounded-2xl rounded-tl-sm`}>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-3 relative z-20 ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" ref={docInputRef} onChange={handleDocUpload} className="hidden" />
            {isRecording ? (
              <div className={`flex items-center gap-4 p-2 rounded-full animate-pulse ${isDarkMode ? 'bg-red-900/40 border border-red-500/50' : 'bg-white border border-red-200 shadow-sm'}`}>
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md ml-2"><Mic className="text-white animate-bounce mt-1" size={20} /></div>
                <span className={`font-black text-sm flex-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{t.recording}</span>
                <span className={`font-mono font-black text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{formatTime(recordingTime)}</span>
                <button type="button" onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><X size={24}/></button>
                <button type="button" onClick={sendAudioMessage} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-transform hover:scale-110">
                  <Send size={18} className={isRtl ? 'rotate-180 -ml-1' : 'ml-1'}/>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex gap-1 mb-1">
                  <button type="button" onClick={() => docInputRef.current.click()} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}><Paperclip size={22}/></button>
                  <button type="button" onClick={() => imageInputRef.current.click()} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}><ImageIcon size={22}/></button>
                </div>
                <div className={`flex-1 relative rounded-2xl overflow-hidden transition-colors ${isDarkMode ? 'bg-[#2a3942]' : 'bg-white shadow-sm'}`}>
                  <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder={t.typeMessage} className="w-full max-h-32 p-3 bg-transparent outline-none font-medium resize-none text-sm leading-relaxed custom-scrollbar dark:text-white" rows="1" />
                </div>
                <div className="mb-1">
                  {newMessage.trim() ? (
                    <button type="submit" className={`p-3 text-white rounded-full transition-transform shadow-md ${newMessage.trim() ? 'bg-teal-500 hover:bg-teal-600 hover:scale-105' : 'bg-teal-500/50 cursor-not-allowed'}`} disabled={!newMessage.trim()}>
                      <Send size={20} className={isRtl ? 'rotate-180 -ml-1' : 'ml-1'}/>
                    </button>
                  ) : (
                    <button type="button" onClick={startRecording} className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-transform hover:scale-105 shadow-md"><Mic size={20} /></button>
                  )}
                </div>
              </form>
            )}
          </div>
          </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-slate-400 z-10">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Briefcase size={40}/></div>
              <h2 className="text-xl font-black">{t.selectChatPrompt}</h2>
            </div>
          )}
        </div>
      </div>
      {activeCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-fade-in">
          <div className="text-center">
            <div className="relative mb-8 mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-teal-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-teal-500 rounded-full animate-ping opacity-40 animation-delay-300"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-teal-500/50">{activeChatData?.avatar}</div>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">{activeChatData?.name}</h2>
            <p className="text-teal-400 font-bold mb-12 animate-pulse">{t.calling} ({activeCall === 'video' ? 'فيديو' : 'صوت'})</p>
            <div className="flex justify-center gap-6">
              <button className="p-5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700"><Mic size={28}/></button>
              {activeCall === 'video' && <button className="p-5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700"><Video size={28}/></button>}
              <button onClick={() => setActiveCall(null)} className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all hover:scale-110 shadow-lg shadow-red-500/30"><Phone size={28} className="rotate-[135deg]"/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}