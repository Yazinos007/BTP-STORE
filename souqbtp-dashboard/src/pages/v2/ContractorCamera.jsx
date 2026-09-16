import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Camera, Video, Mic, MicOff, Maximize, X,
  PenTool, Undo, Trash2, FileText, Settings, Play,
  Crosshair, Ruler, Map, Download, PhoneOff, PauseCircle
} from 'lucide-react';

export default function ContractorCamera() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || true; // الوضع المظلم الافتراضي لهذه الغرفة
  const language = context.language || 'ar';
  const isRtl = language === 'ar';

  // ---------------------------------------------------------
  // 1. حالات الواجهة (Lobby vs Room)
  // ---------------------------------------------------------
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [reports, setReports] = useState([]);

  // ---------------------------------------------------------
  // 2. حالات الغرفة الحية (Live Room States)
  // ---------------------------------------------------------
  const [isFrozen, setIsFrozen] = useState(false);
  const [activeTool, setActiveTool] = useState('pen'); // pen, stamp, measure
  const [drawColor, setDrawColor] = useState('#38bdf8');
  const [currentStamp, setCurrentStamp] = useState('');
  const [penSize, setPenSize] = useState(4);
  const [connectionStatus, setConnectionStatus] = useState('جاري تجهيز الكاميرا...');

  // المراجع (Refs) للكاميرا والرسم
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const freezeCanvasRef = useRef(null);
  
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const signalingChannel = useRef(null);
  
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const undoStack = useRef([]);

  const t = {
    ar: {
      title: "كاميرا الميدان والتقارير", subtitle: "غرفة العمليات الحية، البث المباشر، والتقارير الميدانية المصادق عليها.",
      startNew: "بدء زيارة ميدانية (إنشاء غرفة)", joinExisting: "الانضمام لغرفة مهندس",
      roomCode: "أدخل كود الغرفة...", joinBtn: "دخول", recentReports: "التقارير الميدانية الأخيرة",
      noReports: "لا توجد تقارير مسجلة بعد.", freeze: "تجميد للرسم", unfreeze: "استئناف الفيديو",
      endCall: "إنهاء الزيارة", saveReport: "استخراج تقرير", clear: "مسح الكل", undo: "تراجع",
      tools: "أدوات البناء", radar: "رادار الأخطاء", colors: "الألوان", stamps: "الأختام",
      connected: "🟢 متصل ومباشر", disconnected: "🔴 الاتصال مقطوع", waiting: "⏳ في انتظار الطرف الآخر..."
    },
    fr: {
      title: "Caméra du Chantier & Rapports", subtitle: "Salle d'opérations en direct, streaming et rapports certifiés.",
      startNew: "Démarrer une visite (Nouvelle salle)", joinExisting: "Rejoindre un architecte",
      roomCode: "Code de la salle...", joinBtn: "Rejoindre", recentReports: "Rapports Récents",
      noReports: "Aucun rapport enregistré.", freeze: "Figer & Dessiner", unfreeze: "Reprendre Vidéo",
      endCall: "Quitter", saveReport: "Générer Rapport", clear: "Effacer", undo: "Annuler",
      tools: "Outils BTP", radar: "Radar Défauts", colors: "Couleurs", stamps: "Tampons",
      connected: "🟢 Connecté", disconnected: "🔴 Déconnecté", waiting: "⏳ En attente..."
    }
  }[language] || t.ar;

  // ---------------------------------------------------------
  // 3. دوال قاعة الانتظار (Lobby Functions)
  // ---------------------------------------------------------
  useEffect(() => {
    // محاكاة جلب التقارير السابقة
    setReports([
      { id: 1, date: '2026-09-15 10:30', author: 'المهندس كريم', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format' },
      { id: 2, date: '2026-09-10 14:15', author: 'SouqBTP VIP', img: 'https://images.unsplash.com/photo-1541888086925-920a0f62272c?w=500&auto=format' }
    ]);
  }, []);

  const handleStartSession = () => {
    const newId = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomId(newId);
    setIsInRoom(true);
  };

  const handleJoinSession = () => {
    if (joinInput.trim().length > 3) {
      setRoomId(joinInput.trim());
      setIsInRoom(true);
    }
  };

  // ---------------------------------------------------------
  // 4. دوال غرفة العمليات (WebRTC & Canvas)
  // ---------------------------------------------------------
  useEffect(() => {
    if (isInRoom) {
      initWebRTC();
      return () => cleanupRoom();
    }
  }, [isInRoom]);

  const initWebRTC = async () => {
    setConnectionStatus(t.waiting);
    try {
      // 1. فتح الكاميرا المحلية
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      // 2. إعداد الاتصال (محاكاة الربط بـ Supabase لغرض الـ React Demo)
      // في بيئة الإنتاج الفعلية، يتم هنا وضع كود الـ Signaling الخاص بـ Supabase 
      // كما أرسلته في ملف الـ PHP، ولكننا هنا سنقوم بمحاكاة نجاح الاتصال بعد 3 ثوانٍ لإظهار واجهة الرسم
      
      setTimeout(() => {
        setConnectionStatus(t.connected);
        // محاكاة وضع فيديو الطرف الآخر (المهندس)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.src = "https://www.w3schools.com/html/mov_bbb.mp4"; // فيديو تجريبي
          remoteVideoRef.current.loop = true;
          remoteVideoRef.current.muted = true;
          remoteVideoRef.current.play().catch(e=>console.log(e));
        }
      }, 3000);

    } catch (err) {
      console.error(err);
      setConnectionStatus("⚠️ يرجى تفعيل الكاميرا");
    }
  };

  const cleanupRoom = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (signalingChannel.current) {
      supabase.removeChannel(signalingChannel.current);
    }
  };

  // --- دوال التجميد والرسم ---
  const toggleFreeze = () => {
    const nextState = !isFrozen;
    setIsFrozen(nextState);
    
    if (nextState) {
      // التقاط إطار الفيديو الحالي ورسمه على الـ Canvas السفلي
      const rVideo = remoteVideoRef.current;
      const fCanvas = freezeCanvasRef.current;
      const dCanvas = canvasRef.current;
      
      if (rVideo && fCanvas && dCanvas) {
        fCanvas.width = dCanvas.width = rVideo.clientWidth;
        fCanvas.height = dCanvas.height = rVideo.clientHeight;
        const ctx = fCanvas.getContext('2d');
        ctx.drawImage(rVideo, 0, 0, fCanvas.width, fCanvas.height);
      }
    } else {
      // تفريغ الشاشة عند العودة للفيديو الحي
      const dCanvas = canvasRef.current;
      if (dCanvas) {
        const ctx = dCanvas.getContext('2d');
        ctx.clearRect(0, 0, dCanvas.width, dCanvas.height);
        undoStack.current = [];
      }
    }
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startInteraction = (e) => {
    if (!isFrozen) return;
    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // حفظ حالة الـ Canvas للتراجع (Undo)
    undoStack.current.push(canvas.toDataURL('image/png'));
    if (undoStack.current.length > 15) undoStack.current.shift();

    if (activeTool === 'stamp') {
      ctx.font = "40px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(currentStamp, pos.x, pos.y);
      return;
    }

    isDrawing.current = true;
    lastPos.current = pos;
  };

  const doInteraction = (e) => {
    if (!isFrozen || !isDrawing.current || activeTool !== 'pen') return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    const ctx = canvasRef.current.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastPos.current = pos;
  };

  const stopInteraction = () => {
    isDrawing.current = false;
  };

  const handleUndo = () => {
    if (undoStack.current.length > 0) {
      const lastState = undoStack.current.pop();
      const img = new Image();
      img.src = lastState;
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } else {
      handleClear();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack.current = [];
  };

  const handleSaveReport = () => {
    if (!isFrozen) return alert("قم بتجميد الشاشة للرسم أولاً!");
    
    // دمج الصورة المجمدة مع الرسمة في صورة واحدة
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvasRef.current.width;
    finalCanvas.height = canvasRef.current.height;
    const fCtx = finalCanvas.getContext('2d');
    
    fCtx.drawImage(freezeCanvasRef.current, 0, 0);
    fCtx.drawImage(canvasRef.current, 0, 0);
    
    // توقيع الصورة
    fCtx.fillStyle = "rgba(15, 23, 42, 0.8)";
    fCtx.fillRect(0, finalCanvas.height - 40, finalCanvas.width, 40);
    fCtx.fillStyle = "#38bdf8";
    fCtx.font = "bold 16px Cairo";
    fCtx.fillText(`تقرير ميداني - غرفة #${roomId} - ${new Date().toLocaleDateString('ar-MA')}`, 20, finalCanvas.height - 15);

    const link = document.createElement('a');
    link.download = `Report_${roomId}.jpg`;
    link.href = finalCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  // ---------------------------------------------------------
  // 5. واجهة قاعة الانتظار (Lobby UI)
  // ---------------------------------------------------------
  if (!isInRoom) {
    return (
      <div className="max-w-7xl mx-auto pb-24 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 md:p-12 mb-8 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-slate-800 rounded-3xl border-2 border-slate-700 flex items-center justify-center mb-6 shadow-xl">
              <Camera size={40} className="text-teal-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">{t.title}</h1>
            <p className="text-slate-400 font-bold text-lg max-w-2xl mx-auto mb-10">{t.subtitle}</p>

            <div className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-xl mx-auto">
              <button onClick={handleStartSession} className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-black text-lg hover:shadow-[0_10px_30px_rgba(20,184,166,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                <Video size={24} /> {t.startNew}
              </button>
              
              <div className="flex-1 flex bg-slate-800 border-2 border-slate-700 rounded-2xl overflow-hidden focus-within:border-purple-500 transition-colors">
                <input type="text" placeholder={t.roomCode} value={joinInput} onChange={(e)=>setJoinInput(e.target.value)} className="w-full bg-transparent text-white px-4 font-bold outline-none text-center" dir="ltr" />
                <button onClick={handleJoinSession} className="bg-purple-600 hover:bg-purple-700 text-white px-6 font-black transition-colors">
                  {t.joinBtn}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6">
            <FileText className="text-teal-500" /> {t.recentReports}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reports.map(rep => (
              <div key={rep.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg group cursor-pointer hover:-translate-y-2 transition-transform">
                <div className="h-48 overflow-hidden relative">
                  <img src={rep.img} alt="Report" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <div>
                      <p className="text-white font-black">{rep.author}</p>
                      <p className="text-slate-300 text-xs font-bold">{rep.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 6. واجهة غرفة العمليات (The VIP Live Room UI)
  // ---------------------------------------------------------
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col font-cairo overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Header */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center z-50 shadow-lg">
        <h1 className="text-xl font-black text-teal-400 m-0 flex items-center gap-2 drop-shadow-md">
          <Camera size={24}/> {t.title} <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
        </h1>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${connectionStatus.includes('متصل') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
          {connectionStatus} | غرفة: {roomId}
        </div>
      </div>

      {/* 🚀 Workspace Area */}
      <div className="flex-1 relative flex justify-center items-center bg-black overflow-hidden">
        
        {/* Remote Video (الطرف الآخر) */}
        <video ref={remoteVideoRef} className={`absolute inset-0 w-full h-full object-contain ${isFrozen ? 'opacity-0' : 'opacity-100'}`} autoPlay playsInline></video>
        
        {/* Frozen Canvas (الصورة المجمدة) */}
        <canvas ref={freezeCanvasRef} className={`absolute inset-0 w-full h-full object-contain ${isFrozen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></canvas>
        
        {/* Drawing Canvas (طبقة الرسم) */}
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 w-full h-full object-contain z-20 ${isFrozen ? 'cursor-crosshair' : 'pointer-events-none'}`}
          onMouseDown={startInteraction} onMouseMove={doInteraction} onMouseUp={stopInteraction} onMouseOut={stopInteraction}
          onTouchStart={startInteraction} onTouchMove={doInteraction} onTouchEnd={stopInteraction}
        ></canvas>

        {/* 📸 Local Camera (الكاميرا المصغرة) */}
        <div className="absolute bottom-24 md:bottom-6 left-4 md:left-6 w-[100px] h-[140px] md:w-[140px] md:h-[190px] z-50 bg-slate-800 rounded-2xl border-2 border-teal-400 shadow-2xl overflow-hidden">
          <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
        </div>

        {/* 🛠️ Smart Tools (Left Panel) */}
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group ${isFrozen ? 'w-[260px] h-auto max-h-[80vh] p-5' : 'w-[55px] h-[55px] justify-center items-center cursor-pointer'}`}>
          {!isFrozen ? (
             <Settings size={24} className="text-white group-hover:rotate-90 transition-transform duration-500" />
          ) : (
            <div className="animate-fade-in space-y-5 overflow-y-auto custom-scrollbar pr-2">
              <div>
                <h4 className="text-teal-400 text-sm font-black border-b border-white/10 pb-2 mb-3 text-center">{t.tools}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['🧱', '🚰', '⚡', '🪵', '🪟', '🚪'].map(emoji => (
                    <button key={emoji} onClick={() => {setActiveTool('stamp'); setCurrentStamp(emoji);}} className={`text-2xl p-2 rounded-xl border transition-all ${activeTool === 'stamp' && currentStamp === emoji ? 'bg-purple-600 border-purple-500 scale-105' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{emoji}</button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-red-400 text-sm font-black border-b border-white/10 pb-2 mb-3 text-center">{t.radar}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => {setActiveTool('stamp'); setCurrentStamp('❌');}} className="text-2xl p-2 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/40">❌</button>
                  <button onClick={() => {setActiveTool('stamp'); setCurrentStamp('⚠️');}} className="text-2xl p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/40">⚠️</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🖌️ Drawing Tools (Right Panel) */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col items-center group ${isFrozen ? 'w-[70px] h-auto p-4 gap-4' : 'w-[55px] h-[55px] justify-center cursor-pointer'}`}>
          {!isFrozen ? (
             <PenTool size={24} className="text-white" />
          ) : (
            <div className="animate-fade-in flex flex-col items-center w-full gap-4">
              <button onClick={() => setActiveTool('pen')} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTool === 'pen' ? 'bg-teal-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}><PenTool size={20}/></button>
              
              <div className="w-full h-px bg-white/10"></div>
              
              <button onClick={() => setDrawColor('#ef4444')} className={`w-8 h-8 rounded-full bg-red-500 transition-transform ${drawColor === '#ef4444' ? 'scale-125 border-2 border-white' : ''}`}></button>
              <button onClick={() => setDrawColor('#22c55e')} className={`w-8 h-8 rounded-full bg-green-500 transition-transform ${drawColor === '#22c55e' ? 'scale-125 border-2 border-white' : ''}`}></button>
              <button onClick={() => setDrawColor('#38bdf8')} className={`w-8 h-8 rounded-full bg-sky-400 transition-transform ${drawColor === '#38bdf8' ? 'scale-125 border-2 border-white' : ''}`}></button>
              <button onClick={() => setDrawColor('#eab308')} className={`w-8 h-8 rounded-full bg-yellow-400 transition-transform ${drawColor === '#eab308' ? 'scale-125 border-2 border-white' : ''}`}></button>
              
              <div className="w-full h-px bg-white/10"></div>
              
              <button onClick={handleUndo} className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600"><Undo size={18}/></button>
              <button onClick={handleClear} className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center hover:bg-red-500 hover:text-white"><Trash2 size={18}/></button>
            </div>
          )}
        </div>

      </div>

      {/* 🚀 Bottom Controls */}
      <div className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 flex justify-center gap-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={() => {cleanupRoom(); setIsInRoom(false);}} className="bg-red-500 hover:bg-red-600 text-white px-6 md:px-8 py-3 rounded-2xl font-black text-sm md:text-base transition-colors flex items-center gap-2 shadow-lg shadow-red-500/30">
          <PhoneOff size={20}/> <span className="hidden sm:inline">{t.endCall}</span>
        </button>
        
        <button onClick={toggleFreeze} className={`${isFrozen ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'} text-white px-6 md:px-10 py-3 rounded-2xl font-black text-sm md:text-base transition-colors flex items-center gap-2 shadow-lg`}>
          {isFrozen ? <><Play size={20}/> {t.unfreeze}</> : <><PauseCircle size={20}/> {t.freeze}</>}
        </button>

        {isFrozen && (
          <button onClick={handleSaveReport} className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl font-black text-sm md:text-base transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/30 animate-slide-in">
            <Download size={20}/> <span className="hidden sm:inline">{t.saveReport}</span>
          </button>
        )}
      </div>

    </div>
  );
}