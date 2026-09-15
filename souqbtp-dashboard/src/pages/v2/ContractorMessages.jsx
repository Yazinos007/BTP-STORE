import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { 
  Search, Send, Paperclip, Mic, Phone, Video, 
  MoreVertical, CheckCheck, X, ShoppingCart, // 🚀 تم إضافة ShoppingCart لقتل الشبح الأبيض!
  Image as ImageIcon, Briefcase
} from 'lucide-react';

export default function ContractorMessages() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || false;
  const language = context.language || 'ar';
  const isRtl = language === 'ar';
  
  const location = useLocation();
  const { cartOrder, supplierName } = location.state || {};

  const [activeChat, setActiveChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const translations = {
    ar: {
      title: "صندوق الرسائل", searchPlaceholder: "ابحث في المحادثات...",
      typeMessage: "اكتب رسالة...", online: "متصل الآن", offline: "آخر ظهور منذ ساعتين",
      orderCardTitle: "طلب عرض سعر (Bon de Commande)", total: "المجموع التقديري:",
      accept: "قبول العرض", reject: "رفض العرض", negotiate: "قيد التفاوض...",
      recording: "جاري تسجيل الصوت...", cancel: "إلغاء", send: "إرسال"
    },
    fr: {
      title: "Boîte de Réception", searchPlaceholder: "Rechercher...",
      typeMessage: "Écrivez un message...", online: "En ligne", offline: "Vu il y a 2 heures",
      orderCardTitle: "Demande de Devis (Bon de Commande)", total: "Total Estimé :",
      accept: "Accepter le devis", reject: "Refuser", negotiate: "En négociation...",
      recording: "Enregistrement vocal...", cancel: "Annuler", send: "Envoyer"
    },
    en: {
      title: "Inbox", searchPlaceholder: "Search conversations...",
      typeMessage: "Type a message...", online: "Online", offline: "Last seen 2 hours ago",
      orderCardTitle: "Request for Quote (Purchase Order)", total: "Estimated Total:",
      accept: "Accept Quote", reject: "Reject", negotiate: "Negotiating...",
      recording: "Recording audio...", cancel: "Cancel", send: "Send"
    }
  };

  const t = translations[language] || translations.ar;

  const [chats, setChats] = useState([
    { id: 1, name: "LafargeHolcim (المورد)", avatar: "LH", type: "supplier", unread: 0, status: "online", lastMessage: "متى تريد التوصيل؟" },
    { id: 2, name: "Sonasid (المورد)", avatar: "SO", type: "supplier", unread: 2, status: "offline", lastMessage: "لقد أرسلت لك عرض السعر الجديد." },
    { id: 3, name: "المهندس كريم", avatar: "ك", type: "team", unread: 0, status: "online", lastMessage: "تم الانتهاء من صب الأساسات." },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, senderId: 1, text: "مرحباً بك في شركة لافارچ، كيف يمكننا خدمتك اليوم؟", time: "10:00 AM", isMe: false },
    { id: 2, senderId: 'me', text: "أهلاً، أحتاج إلى عرض سعر لكمية من الإسمنت.", time: "10:05 AM", isMe: true }
  ]);

  useEffect(() => {
    if (cartOrder && supplierName) {
      const existingChat = chats.find(c => c.name.includes(supplierName));
      let currentChatId = activeChat;
      
      if (!existingChat) {
        const newId = Date.now();
        setChats(prev => [{ id: newId, name: supplierName, avatar: supplierName.slice(0,2).toUpperCase(), type: "supplier", unread: 0, status: "online", lastMessage: "طلب تسعيرة جديد" }, ...prev]);
        currentChatId = newId;
        setActiveChat(newId);
      } else {
        currentChatId = existingChat.id;
        setActiveChat(existingChat.id);
      }

      const orderMessage = {
        id: Date.now() + 1,
        senderId: 'me',
        isMe: true,
        type: 'order_card',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        orderData: cartOrder
      };
      
      setMessages(prev => [...prev, orderMessage]);
      window.history.replaceState({}, document.title);
    }
  }, [cartOrder, supplierName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(), senderId: 'me', text: newMessage,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const bgPanel = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  
  // 🚀 السحر البصري: خلفية متدرجة متحركة للوضع الفاتح، والوضع المظلم كما هو!
  const bgChat = isDarkMode 
    ? 'bg-slate-950' 
    : 'bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-emerald-50/80 bg-[length:200%_200%] animate-gradient-slow';
    
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const activeChatData = chats.find(c => c.id === activeChat) || chats[0];

  return (
    <div className="max-w-7xl mx-auto h-[82vh] animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex h-full rounded-3xl border-2 overflow-hidden shadow-2xl ${bgPanel}`}>
        
        {/* Inbox Sidebar */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r ${isRtl ? 'border-l border-r-0' : 'border-r'} ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80 backdrop-blur-md'}`}>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className={`text-2xl font-black mb-4 flex items-center gap-2 ${textTitle}`}>
              <Briefcase className="text-teal-500" /> {t.title}
            </h2>
            <div className="relative">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
              <input type="text" placeholder={t.searchPlaceholder} className={`w-full py-2.5 rounded-xl text-sm font-bold outline-none transition-all ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 focus:border-teal-500 border shadow-inner'}`} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chats.map(chat => (
              <div key={chat.id} onClick={() => setActiveChat(chat.id)} className={`p-4 border-b cursor-pointer transition-colors flex items-center gap-3 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'} ${activeChat === chat.id ? (isDarkMode ? 'bg-slate-800 border-l-4 border-l-teal-500' : 'bg-white border-l-4 border-l-teal-500 shadow-sm') : 'border-l-4 border-l-transparent'}`}>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${activeChat === chat.id ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                    {chat.avatar}
                  </div>
                  {chat.status === 'online' && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-black text-sm truncate ${textTitle}`}>{chat.name}</h3>
                    <span className={`text-[10px] font-bold ${textMuted}`}>10:30 AM</span>
                  </div>
                  <p className={`text-xs truncate ${chat.unread > 0 ? (isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold') : textMuted}`}>{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && <span className="w-5 h-5 bg-pink-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">{chat.unread}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`hidden md:flex flex-1 flex-col relative ${bgChat}`}>
          {/* لمسة الزخرفة الخفيفة فوق التدرج اللوني */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          {/* Chat Header */}
          <div className={`p-4 border-b flex justify-between items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-10 ${isDarkMode ? 'border-slate-800' : 'border-slate-200/50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20`}>
                {activeChatData?.avatar}
              </div>
              <div>
                <h3 className={`font-black ${textTitle}`}>{activeChatData?.name}</h3>
                <p className={`text-xs font-bold flex items-center gap-1 ${activeChatData?.status === 'online' ? 'text-emerald-500' : textMuted}`}>
                  {activeChatData?.status === 'online' ? t.online : t.offline}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200/50'}`}><Phone size={18}/></button>
              <button className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200/50'}`}><Video size={18}/></button>
              <button className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200/50'}`}><MoreVertical size={18}/></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  
                  {!msg.type && (
                    <div className={`p-4 rounded-3xl shadow-md ${msg.isMe ? 'bg-teal-500 text-white rounded-tr-sm' : isDarkMode ? 'bg-slate-800 text-white border border-slate-700 rounded-tl-sm' : 'bg-white text-slate-800 border border-slate-100/50 rounded-tl-sm backdrop-blur-sm'}`}>
                      <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                    </div>
                  )}

                  {msg.type === 'order_card' && (
                    <div className={`p-1 rounded-3xl shadow-xl border-2 ${msg.isMe ? 'bg-teal-500/10 border-teal-500/30' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/50 backdrop-blur-md'}`}>
                      <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white/80'}`}>
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-dashed dark:border-slate-800 border-slate-200">
                          <ShoppingCart className="text-teal-500" size={20}/>
                          <h4 className={`font-black text-sm ${textTitle}`}>{t.orderCardTitle}</h4>
                        </div>
                        <ul className="space-y-2 mb-4">
                          {msg.orderData.items.map((item, idx) => (
                            <li key={idx} className={`text-xs font-bold flex justify-between ${textMuted}`}>
                              <span>{item.qty}x {item.product.name}</span>
                              <span dir="ltr">{(item.qty >= item.product.min_wholesale_qty ? item.product.price_wholesale : item.product.price_retail) * item.qty} {item.product.currency || 'MAD'}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                          <span className="text-xs font-black text-teal-600">{t.total}</span>
                          <span className="font-black text-teal-600 text-lg" dir="ltr">{msg.orderData.total.toLocaleString()} {msg.orderData.items[0]?.product?.currency || 'MAD'}</span>
                        </div>
                        {!msg.isMe && (
                          <div className="flex gap-2 mt-3 pt-3 border-t dark:border-slate-800 border-slate-200">
                            <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-black shadow-md">{t.accept}</button>
                            <button className="flex-1 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-black">{t.reject}</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1 px-2">
                    <span className={`text-[10px] font-bold ${textMuted}`}>{msg.time}</span>
                    {msg.isMe && <CheckCheck size={14} className="text-teal-500" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t relative z-10 ${isDarkMode ? 'border-slate-800' : 'border-slate-200/50'}`}>
            {isRecording ? (
              <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl animate-pulse">
                <Mic className="text-red-500 animate-bounce" size={24} />
                <span className="font-black text-red-500 text-sm flex-1">{t.recording}</span>
                <span className="font-mono font-bold text-red-500">00:08</span>
                <button onClick={() => setIsRecording(false)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full transition-colors"><X size={20}/></button>
                <button onClick={() => setIsRecording(false)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg shadow-red-500/30 transition-transform hover:scale-110"><Send size={18} className={isRtl ? 'rotate-180 -ml-1' : 'ml-1'}/></button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex gap-1">
                  <button type="button" className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-teal-400' : 'text-slate-500 hover:bg-white hover:text-teal-500 shadow-sm border border-transparent hover:border-slate-200'}`}><Paperclip size={20}/></button>
                  <button type="button" className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-teal-400' : 'text-slate-500 hover:bg-white hover:text-teal-500 shadow-sm border border-transparent hover:border-slate-200'}`}><ImageIcon size={20}/></button>
                </div>
                
                <div className={`flex-1 relative border rounded-3xl overflow-hidden transition-colors focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-inner'}`}>
                  <textarea 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder={t.typeMessage} 
                    className="w-full max-h-32 p-4 bg-transparent outline-none font-bold resize-none text-sm leading-relaxed custom-scrollbar dark:text-white"
                    rows="1"
                  />
                </div>
                
                {newMessage.trim() ? (
                  <button type="submit" className="p-4 bg-teal-500 text-white rounded-3xl hover:bg-teal-600 transition-transform hover:scale-105 shadow-lg shadow-teal-500/30">
                    <Send size={20} className={isRtl ? 'rotate-180 -ml-1' : 'ml-1'}/>
                  </button>
                ) : (
                  <button type="button" onClick={() => setIsRecording(true)} className="p-4 bg-indigo-500 text-white rounded-3xl hover:bg-indigo-600 transition-transform hover:scale-105 shadow-lg shadow-indigo-500/30">
                    <Mic size={20} />
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow { animation: gradient-xy 12s ease infinite; }
      `}</style>
    </div>
  );
}