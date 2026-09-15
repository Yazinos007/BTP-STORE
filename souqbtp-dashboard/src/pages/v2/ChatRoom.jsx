import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { 
  Search, Send, Paperclip, Mic, Phone, Video, 
  MoreVertical, CheckCheck, X, ShoppingCart, 
  Image as ImageIcon, Briefcase, FileText, Play, Trash2, StopCircle
} from 'lucide-react';

export default function ChatRoom() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || false;
  const language = context.language || 'ar';
  const isRtl = language === 'ar';
  
  const location = useLocation();
  const { cartOrder, supplierName } = location.state || {};

  const [activeChat, setActiveChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  
  // 🚀 حالة المكالمات والقوائم
  const [activeCall, setActiveCall] = useState(null); 
  const [showDropdown, setShowDropdown] = useState(false);

  // 🎙️ حالات ومراجع التسجيل الصوتي الحقيقي
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  // مراجع رفع الملفات
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const t = {
    ar: {
      title: "صندوق الرسائل 🟢", searchPlaceholder: "ابحث في المحادثات...",
      typeMessage: "اكتب رسالة...", online: "متصل الآن", offline: "آخر ظهور منذ ساعتين",
      orderCardTitle: "طلب عرض سعر (Bon de Commande)", total: "المجموع التقديري:",
      accept: "قبول العرض", reject: "رفض العرض", negotiate: "قيد التفاوض...",
      recording: "جاري التسجيل...", cancel: "إلغاء", send: "إرسال",
      calling: "جاري الاتصال...", endCall: "إنهاء المكالمة",
      clearChat: "إفراغ المحادثة", deleteMsg: "حذف"
    }
  }[language] || t.ar;

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

  // -------------------------------------------------------------
  // 🎙️ البرمجة الحقيقية للميكروفون والصوت (Web Audio API)
  // -------------------------------------------------------------
  
  // دالة تحويل الثواني إلى صيغة 00:00
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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

      // تشغيل العداد الحقيقي
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // إطفاء الميكروفون
    }
    clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const sendAudioMessage = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob); // إنشاء رابط حقيقي للصوت
        
        const msg = {
          id: Date.now(), senderId: 'me', isMe: true, type: 'audio',
          audioUrl: audioUrl, // الرابط الحقيقي
          duration: formatTime(recordingTime),
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        setMessages(prev => [...prev, msg]);
        audioChunksRef.current = [];
      };
      
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(timerIntervalRef.current);
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  // دالة لتشغيل الصوت عند الضغط على Play
  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  // -------------------------------------------------------------

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const msg = { id: Date.now(), senderId: 'me', text: newMessage, type: 'text', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const handleDeleteMessage = (id) => { setMessages(messages.filter(msg => msg.id !== id)); };
  
  const handleClearChat = () => {
    if (window.confirm("هل أنت متأكد من إفراغ المحادثة؟")) {
      setMessages([]); setShowDropdown(false);
    }
  };

  const activeChatData = chats.find(c => c.id === activeChat) || chats[0];

  // 🎨 فرض الألوان القوية الزجاجية لقتل البياض الممل
  const mainWrapperBg = isDarkMode 
    ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900' 
    : 'bg-gradient-to-br from-cyan-300 via-fuchsia-300 to-emerald-300'; // ألوان مشبعة جداً
  
  // خلفيات نصف شفافة لتمرير الألوان المتدرجة
  const panelBg = isDarkMode ? 'bg-slate-900/50 backdrop-blur-2xl border-slate-700/50' : 'bg-white/30 backdrop-blur-xl border-white/50';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const glassInputBg = isDarkMode ? 'bg-slate-900/50 border-slate-700/50 text-white' : 'bg-white/40 border-white/50 text-slate-800 shadow-inner';

  return (
    <div className={`h-[82vh] rounded-3xl animate-fade-in overflow-hidden shadow-2xl ${mainWrapperBg} bg-[length:300%_300%] animate-gradient-slow p-2 md:p-0`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex h-full rounded-3xl border-2 ${panelBg}`}>
        
        {/* Inbox Sidebar */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r ${isRtl ? 'border-l border-r-0' : 'border-r'} ${isDarkMode ? 'border-slate-700/50 bg-slate-900/40' : 'border-white/50 bg-white/20'}`}>
          <div className={`p-5 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-white/40'}`}>
            <h2 className={`text-xl md:text-2xl font-black mb-4 flex items-center gap-2 ${textTitle}`}>
              <Briefcase className="text-teal-600 dark:text-teal-500" /> {t.title}
            </h2>
            <div className="relative">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-500`} />
              <input type="text" placeholder={t.searchPlaceholder} className={`w-full py-2.5 rounded-xl text-sm font-bold outline-none transition-all ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} ${glassInputBg} focus:border-teal-600 border placeholder-slate-500`} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chats.map(chat => (
              <div key={chat.id} onClick={() => setActiveChat(chat.id)} className={`p-4 border-b cursor-pointer transition-colors flex items-center gap-3 ${isDarkMode ? 'border-slate-700/30 hover:bg-slate-800/50' : 'border-white/30 hover:bg-white/40'} ${activeChat === chat.id ? (isDarkMode ? 'bg-slate-800/70 border-l-4 border-l-teal-500' : 'bg-white/50 border-l-4 border-l-teal-600 shadow-sm') : 'border-l-4 border-l-transparent'}`}>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${activeChat === chat.id ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-white/60 text-slate-700 shadow-sm border border-white/50'}`}>
                    {chat.avatar}
                  </div>
                  {chat.status === 'online' && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-black text-sm truncate ${textTitle}`}>{chat.name}</h3>
                    <span className={`text-[10px] font-bold ${textMuted}`}>10:30 AM</span>
                  </div>
                  <p className={`text-xs truncate ${chat.unread > 0 ? (isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-black') : textMuted}`}>{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && <span className="w-5 h-5 bg-pink-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">{chat.unread}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex flex-1 flex-col relative bg-transparent">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className={`p-4 border-b flex justify-between items-center bg-white/20 dark:bg-slate-900/40 backdrop-blur-md sticky top-0 z-20 ${isDarkMode ? 'border-slate-700/50' : 'border-white/40'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20`}>
                {activeChatData?.avatar}
              </div>
              <div>
                <h3 className={`font-black ${textTitle}`}>{activeChatData?.name}</h3>
                <p className={`text-xs font-bold flex items-center gap-1 ${activeChatData?.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' : textMuted}`}>
                  {activeChatData?.status === 'online' ? t.online : t.offline}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <button onClick={() => setActiveCall('voice')} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700' : 'bg-white/60 text-slate-700 hover:bg-white shadow-sm border border-white/50'}`}><Phone size={18}/></button>
              <button onClick={() => setActiveCall('video')} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700' : 'bg-white/60 text-slate-700 hover:bg-white shadow-sm border border-white/50'}`}><Video size={18}/></button>
              
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700' : 'bg-white/60 text-slate-700 hover:bg-white shadow-sm border border-white/50'}`}>
                  <MoreVertical size={18}/>
                </button>
                {showDropdown && (
                  <div className={`absolute top-full ${isRtl ? 'left-0' : 'right-0'} mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden z-50 animate-fade-in ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/80 backdrop-blur-md'}`}>
                    <button onClick={handleClearChat} className="w-full px-4 py-3 flex items-center gap-3 text-red-500 hover:bg-red-500/10 font-bold text-sm transition-colors">
                      <Trash2 size={16}/> {t.clearChat}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10" onClick={() => setShowDropdown(false)}>
            {messages.map((msg) => (
              <div key={msg.id} className={`group relative flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-slide-up items-center gap-3`}>
                
                {msg.isMe && (
                  <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all">
                    <Trash2 size={16}/>
                  </button>
                )}

                <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  
                  {(!msg.type || msg.type === 'text') && (
                    <div className={`p-4 rounded-3xl shadow-sm ${msg.isMe ? 'bg-teal-500 text-white rounded-tr-sm shadow-teal-500/20' : isDarkMode ? 'bg-slate-800/80 backdrop-blur-md text-white border border-slate-700/50 rounded-tl-sm' : 'bg-white/80 backdrop-blur-md text-slate-800 border border-white/60 rounded-tl-sm'}`}>
                      <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                    </div>
                  )}

                  {/* 🎙️ الرسالة الصوتية الحقيقية (بزر Play مبرمج) */}
                  {msg.type === 'audio' && (
                    <div className={`p-3 rounded-full shadow-sm flex items-center gap-3 w-64 ${msg.isMe ? 'bg-teal-500 text-white rounded-tr-sm' : isDarkMode ? 'bg-slate-800/80 text-white rounded-tl-sm' : 'bg-white/80 backdrop-blur-md text-slate-800 rounded-tl-sm'}`}>
                      <button onClick={() => playAudio(msg.audioUrl)} className="w-10 h-10 rounded-full bg-white/30 dark:bg-slate-700 flex items-center justify-center hover:bg-white/50 transition-colors shadow-sm">
                        <Play size={16} className="ml-1" fill="currentColor"/>
                      </button>
                      <div className="flex-1 h-2 bg-white/40 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-white dark:bg-teal-400 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-xs font-black mr-2">{msg.duration}</span>
                    </div>
                  )}

                  {msg.type === 'order_card' && (
                    <div className={`p-1 rounded-3xl shadow-lg border-2 ${msg.isMe ? 'bg-teal-500/20 border-teal-500/40' : isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/70 border-white/50 backdrop-blur-md'}`}>
                      <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/90'}`}>
                        <div className={`flex items-center gap-2 mb-3 pb-3 border-b border-dashed ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                          <ShoppingCart className="text-teal-600 dark:text-teal-500" size={20}/>
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
                          <span className="text-xs font-black text-teal-700 dark:text-teal-500">{t.total}</span>
                          <span className="font-black text-teal-700 dark:text-teal-500 text-lg" dir="ltr">{msg.orderData.total.toLocaleString()} {msg.orderData.items[0]?.product?.currency || 'MAD'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1 px-2">
                    <span className={`text-[10px] font-bold ${textMuted}`}>{msg.time}</span>
                    {msg.isMe && <CheckCheck size={14} className="text-teal-600 dark:text-teal-500" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-4 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl border-t relative z-10 ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'}`}>
            
            {/* واجهة التسجيل الصوتي الحقيقية */}
            {isRecording ? (
              <div className={`flex items-center gap-4 p-3 rounded-3xl animate-pulse ${isDarkMode ? 'bg-red-900/40 border border-red-500/50' : 'bg-red-100/80 backdrop-blur-md border border-red-300 shadow-sm'}`}>
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center animate-bounce shadow-lg shadow-red-500/40">
                   <Mic className="text-white" size={20} />
                </div>
                <span className={`font-black text-sm flex-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{t.recording}</span>
                <span className={`font-mono font-black text-lg ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{formatTime(recordingTime)}</span>
                
                <button type="button" onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full transition-colors"><X size={24}/></button>
                <button type="button" onClick={sendAudioMessage} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg shadow-red-500/30 transition-transform hover:scale-110">
                  <Send size={18} className={isRtl ? 'rotate-180 -ml-1' : 'ml-1'}/>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex gap-1">
                  <button type="button" className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-800/80' : 'text-slate-700 hover:bg-white/80 shadow-sm'}`}><Paperclip size={20}/></button>
                </div>
                
                <div className={`flex-1 relative border rounded-3xl overflow-hidden transition-colors focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/30 ${glassInputBg}`}>
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
                  <button type="button" onClick={startRecording} className="p-4 bg-indigo-500 text-white rounded-3xl hover:bg-indigo-600 transition-transform hover:scale-105 shadow-lg shadow-indigo-500/30">
                    <Mic size={20} />
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes gradient-xy { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-slow { animation: gradient-xy 12s ease infinite; }
      `}</style>
    </div>
  );
}