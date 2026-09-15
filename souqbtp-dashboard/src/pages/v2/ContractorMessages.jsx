import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { 
  Search, Send, Paperclip, Mic, Phone, Video, 
  MoreVertical, CheckCheck, X, ShoppingCart, 
  Image as ImageIcon, Briefcase, FileText, Play
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
  
  // 🚀 حالة المكالمات (صوت أو فيديو)
  const [activeCall, setActiveCall] = useState(null); // 'voice', 'video', or null

  // 🚀 مراجع (Refs) لرفع الملفات
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const translations = {
    ar: {
      title: "صندوق الرسائل", searchPlaceholder: "ابحث في المحادثات...",
      typeMessage: "اكتب رسالة...", online: "متصل الآن", offline: "آخر ظهور منذ ساعتين",
      orderCardTitle: "طلب عرض سعر (Bon de Commande)", total: "المجموع التقديري:",
      accept: "قبول العرض", reject: "رفض العرض", negotiate: "قيد التفاوض...",
      recording: "جاري تسجيل الصوت...", cancel: "إلغاء", send: "إرسال",
      calling: "جاري الاتصال...", endCall: "إنهاء المكالمة"
    },
    fr: {
      title: "Boîte de Réception", searchPlaceholder: "Rechercher...",
      typeMessage: "Écrivez un message...", online: "En ligne", offline: "Vu il y a 2 heures",
      orderCardTitle: "Demande de Devis (Bon de Commande)", total: "Total Estimé :",
      accept: "Accepter", reject: "Refuser", negotiate: "En négociation...",
      recording: "Enregistrement...", cancel: "Annuler", send: "Envoyer",
      calling: "Appel en cours...", endCall: "Raccrocher"
    },
    en: {
      title: "Inbox", searchPlaceholder: "Search conversations...",
      typeMessage: "Type a message...", online: "Online", offline: "Last seen 2 hours ago",
      orderCardTitle: "Request for Quote (Purchase Order)", total: "Estimated Total:",
      accept: "Accept", reject: "Reject", negotiate: "Negotiating...",
      recording: "Recording...", cancel: "Cancel", send: "Send",
      calling: "Calling...", endCall: "End Call"
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
      if (!existingChat) {
        const newId = Date.now();
        setChats(prev => [{ id: newId, name: supplierName, avatar: supplierName.slice(0,2).toUpperCase(), type: "supplier", unread: 0, status: "online", lastMessage: "طلب تسعيرة جديد" }, ...prev]);
        setActiveChat(newId);
      } else {
        setActiveChat(existingChat.id);
      }

      const orderMessage = {
        id: Date.now(), senderId: 'me', isMe: true, type: 'order_card',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), orderData: cartOrder
      };
      setMessages(prev => [...prev, orderMessage]);
      window.history.replaceState({}, document.title);
    }
  }, [cartOrder, supplierName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🚀 إرسال نص عادي
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(), senderId: 'me', text: newMessage, type: 'text',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  // 🚀 إرسال صورة
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const msg = {
      id: Date.now(), senderId: 'me', isMe: true, type: 'image',
      fileUrl: URL.createObjectURL(file), // محاكاة الرابط قبل الرفع لـ Supabase
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages([...messages, msg]);
  };

  // 🚀 إرسال ملف/مستند
  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const msg = {
      id: Date.now(), senderId: 'me', isMe: true, type: 'document',
      fileName: file.name, fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages([...messages, msg]);
  };

  // 🚀 إرسال رسالة صوتية
  const handleSendAudio = () => {
    setIsRecording(false);
    const msg = {
      id: Date.now(), senderId: 'me', isMe: true, type: 'audio', duration: '00:08',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages([...messages, msg]);
  };

  const activeChatData = chats.find(c => c.id === activeChat) || chats[0];

  // 🚀 الألوان السحرية والخلفية المذهلة (True Glassmorphism)
  const mainWrapperBg = isDarkMode 
    ? 'bg-slate-950' 
    : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-teal-100 bg-[length:300%_300%] animate-gradient-slow';
  
  // الإطارات أصبحت شديدة الشفافية لتظهر الخلفية من ورائها!
  const panelBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white/40 backdrop-blur-2xl border-white/60';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className={`h-[82vh] rounded-3xl animate-fade-in ${mainWrapperBg}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex h-full rounded-3xl border-2 overflow-hidden shadow-2xl ${panelBg}`}>
        
        {/* 📋 Inbox Sidebar */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r ${isRtl ? 'border-l border-r-0' : 'border-r'} ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-white/40 bg-white/30 backdrop-blur-md'}`}>
          <div className={`p-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-white/50'}`}>
            <h2 className={`text-2xl font-black mb-4 flex items-center gap-2 ${textTitle}`}>
              <Briefcase className="text-teal-500" /> {t.title}
            </h2>
            <div className="relative">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
              <input type="text" placeholder={t.searchPlaceholder} className={`w-full py-2.5 rounded-xl text-sm font-bold outline-none transition-all ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' : 'bg-white/50 backdrop-blur-sm border-white/50 text-slate-800 focus:border-teal-500 border shadow-inner placeholder-slate-500'}`} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chats.map(chat => (
              <div key={chat.id} onClick={() => setActiveChat(chat.id)} className={`p-4 border-b cursor-pointer transition-colors flex items-center gap-3 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-white/30 hover:bg-white/50'} ${activeChat === chat.id ? (isDarkMode ? 'bg-slate-800 border-l-4 border-l-teal-500' : 'bg-white/60 border-l-4 border-l-teal-500 shadow-sm') : 'border-l-4 border-l-transparent'}`}>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${activeChat === chat.id ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-white/80 text-slate-600 shadow-sm'}`}>
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

        {/* 💬 Chat Window */}
        <div className="hidden md:flex flex-1 flex-col relative bg-transparent">
          {/* لمسة الزخرفة الخفيفة */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          {/* Chat Header */}
          <div className={`p-4 border-b flex justify-between items-center bg-white/20 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-10 ${isDarkMode ? 'border-slate-800' : 'border-white/40'}`}>
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
            
            {/* 🚀 أزرار المكالمات مفعلة الآن */}
            <div className="flex gap-2">
              <button onClick={() => setActiveCall('voice')} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white/60 text-slate-700 hover:bg-white shadow-sm border border-white/50'}`}><Phone size={18}/></button>
              <button onClick={() => setActiveCall('video')} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white/60 text-slate-700 hover:bg-white shadow-sm border border-white/50'}`}><Video size={18}/></button>
              <button className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white/60 text-slate-700 hover:bg-white shadow-sm border border-white/50'}`}><MoreVertical size={18}/></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* رسالة نصية */}
                  {(!msg.type || msg.type === 'text') && (
                    <div className={`p-4 rounded-3xl shadow-sm ${msg.isMe ? 'bg-teal-500 text-white rounded-tr-sm' : isDarkMode ? 'bg-slate-800 text-white border border-slate-700 rounded-tl-sm' : 'bg-white/70 backdrop-blur-md text-slate-800 border border-white/60 rounded-tl-sm'}`}>
                      <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                    </div>
                  )}

                  {/* 🚀 رسالة صورة */}
                  {msg.type === 'image' && (
                    <div className={`p-1.5 rounded-2xl shadow-md ${msg.isMe ? 'bg-teal-500 rounded-tr-sm' : 'bg-white/70 backdrop-blur-md rounded-tl-sm'}`}>
                      <img src={msg.fileUrl} alt="attachment" className="max-w-[250px] rounded-xl object-cover" />
                    </div>
                  )}

                  {/* 🚀 رسالة مستند */}
                  {msg.type === 'document' && (
                    <div className={`p-4 rounded-3xl shadow-sm flex items-center gap-3 ${msg.isMe ? 'bg-teal-500 text-white rounded-tr-sm' : 'bg-white/70 backdrop-blur-md text-slate-800 rounded-tl-sm'}`}>
                      <div className="p-3 bg-white/20 rounded-xl"><FileText size={24}/></div>
                      <div>
                        <p className="text-sm font-black">{msg.fileName}</p>
                        <p className="text-xs opacity-80">{msg.fileSize}</p>
                      </div>
                    </div>
                  )}

                  {/* 🚀 رسالة صوتية */}
                  {msg.type === 'audio' && (
                    <div className={`p-3 rounded-full shadow-sm flex items-center gap-3 w-64 ${msg.isMe ? 'bg-teal-500 text-white rounded-tr-sm' : 'bg-white/70 backdrop-blur-md text-slate-800 rounded-tl-sm'}`}>
                      <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"><Play size={16} className="ml-1" fill="currentColor"/></button>
                      <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-white rounded-full"></div>
                      </div>
                      <span className="text-xs font-black mr-2">{msg.duration}</span>
                    </div>
                  )}

                  {/* بطاقة الطلبية */}
                  {msg.type === 'order_card' && (
                    <div className={`p-1 rounded-3xl shadow-lg border-2 ${msg.isMe ? 'bg-teal-500/10 border-teal-500/30' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/60 border-white/50 backdrop-blur-md'}`}>
                      <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white/80'}`}>
                        <div className={`flex items-center gap-2 mb-3 pb-3 border-b border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
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

          {/* 🚀 Input Area (تم ربط الأزرار بالمدخلات المخفية) */}
          <div className={`p-4 bg-white/40 dark:bg-slate-900/80 backdrop-blur-xl border-t relative z-10 ${isDarkMode ? 'border-slate-800' : 'border-white/50'}`}>
            
            {/* مدخلات مخفية لرفع الملفات */}
            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" ref={docInputRef} onChange={handleDocUpload} className="hidden" />

            {isRecording ? (
              <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl animate-pulse">
                <Mic className="text-red-500 animate-bounce" size={24} />
                <span className="font-black text-red-500 text-sm flex-1">{t.recording}</span>
                <span className="font-mono font-bold text-red-500">00:08</span>
                <button onClick={() => setIsRecording(false)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full transition-colors"><X size={20}/></button>
                <button onClick={handleSendAudio} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg shadow-red-500/30 transition-transform hover:scale-110"><Send size={18} className={isRtl ? 'rotate-180 -ml-1' : 'ml-1'}/></button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex gap-1">
                  <button type="button" onClick={() => docInputRef.current.click()} className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-teal-400' : 'text-slate-600 hover:bg-white/80 hover:text-teal-600 shadow-sm border border-transparent hover:border-white'}`}><Paperclip size={20}/></button>
                  <button type="button" onClick={() => imageInputRef.current.click()} className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-teal-400' : 'text-slate-600 hover:bg-white/80 hover:text-teal-600 shadow-sm border border-transparent hover:border-white'}`}><ImageIcon size={20}/></button>
                </div>
                
                <div className={`flex-1 relative border rounded-3xl overflow-hidden transition-colors focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white/60 border-white/60 shadow-inner backdrop-blur-md'}`}>
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

      {/* 🚀 نافذة المكالمة السينمائية (Call UI Overlay) */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-fade-in">
          <div className="text-center">
            <div className="relative mb-8 mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-teal-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-teal-500 rounded-full animate-ping opacity-40 animation-delay-300"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-teal-500/50">
                {activeChatData?.avatar}
              </div>
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
      
      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow { animation: gradient-xy 15s ease infinite; }
      `}</style>
    </div>
  );
}