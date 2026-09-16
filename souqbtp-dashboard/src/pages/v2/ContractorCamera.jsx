import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Camera, Video, X, PenTool, Undo, Trash2, FileText, Play,
  PauseCircle, PhoneOff, Lightbulb, RefreshCcw, Loader2, Archive
} from 'lucide-react';

export default function ContractorCamera() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || true; 
  const language = context.language || 'ar';
  const isRtl = language === 'ar';

  const [isInRoom, setIsInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [reports, setReports] = useState([]);

  // --- Live Room States ---
  const [isFrozen, setIsFrozen] = useState(false);
  const [activeTool, setActiveTool] = useState('pen'); 
  const [drawColor, setDrawColor] = useState('#38bdf8');
  const [currentStamp, setCurrentStamp] = useState('');
  const [penSize, setPenSize] = useState(4);
  const [isSmartMode, setIsSmartMode] = useState(false);
  
  const [connectionStatus, setConnectionStatus] = useState('جاري تجهيز الكاميرا...');
  const [useFrontCamera, setUseFrontCamera] = useState(false);

  // --- Measurement & BOQ States ---
  const [measureMode, setMeasureMode] = useState(null); 
  const [calibrationFactor, setCalibrationFactor] = useState(null);
  const [boqResult, setBoqResult] = useState(null);
  const [quoteText, setQuoteText] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const freezeCanvasRef = useRef(null);
  
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const signalingChannel = useRef(null);
  
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const snapshot = useRef(null);
  const undoStack = useRef([]);
  const measureStart = useRef(null);

  const translations = {
    ar: {
      title: "كاميرا الميدان والتقارير", subtitle: "غرفة العمليات الحية، البث المباشر، والتقارير الميدانية المصادق عليها.",
      startNew: "بدء زيارة ميدانية (إنشاء غرفة)", joinExisting: "الانضمام لغرفة مهندس",
      roomCode: "أدخل كود الغرفة...", joinBtn: "دخول", recentReports: "التقارير الميدانية الأخيرة",
      noReports: "لا توجد تقارير مسجلة بعد.", freeze: "تجميد للرسم", unfreeze: "استئناف الفيديو",
      endCall: "إنهاء الزيارة", saveReport: "استخراج تقرير", clear: "مسح الكل", undo: "تراجع",
      tools: "أدوات البناء", radar: "رادار الأخطاء", 
      connected: "متصل ومباشر", waiting: "جاري الاتصال بالطرف الآخر...",
      archiveBtn: "أرشفة", deleteBtn: "حذف نهائي", confirmDelete: "هل أنت متأكد من الحذف النهائي للتقرير؟"
    },
    fr: {
      title: "Caméra du Chantier & Rapports", subtitle: "Salle d'opérations en direct, streaming et rapports certifiés.",
      startNew: "Démarrer une visite (Nouvelle salle)", joinExisting: "Rejoindre un architecte",
      roomCode: "Code de visite...", joinBtn: "Rejoindre", recentReports: "Rapports Récents",
      noReports: "Aucun rapport enregistré.", freeze: "Figer & Dessiner", unfreeze: "Reprendre Vidéo",
      endCall: "Quitter", saveReport: "Générer Rapport", clear: "Effacer", undo: "Annuler",
      tools: "Outils BTP", radar: "Radar Défauts", 
      connected: "Connecté et En Direct", waiting: "Connexion en cours...",
      archiveBtn: "Archiver", deleteBtn: "Supprimer", confirmDelete: "Confirmer la suppression définitive ?"
    },
    en: {
      title: "Site Camera & Reports", subtitle: "Live operations room, streaming, and certified field reports.",
      startNew: "Start Field Visit (New Room)", joinExisting: "Join Architect Room",
      roomCode: "Enter room code...", joinBtn: "Join", recentReports: "Recent Field Reports",
      noReports: "No reports recorded yet.", freeze: "Freeze to Draw", unfreeze: "Resume Video",
      endCall: "End Visit", saveReport: "Generate Report", clear: "Clear All", undo: "Undo",
      tools: "Construction Tools", radar: "Defect Radar", 
      connected: "Connected Live", waiting: "Connecting to peer...",
      archiveBtn: "Archive", deleteBtn: "Delete", confirmDelete: "Are you sure you want to permanently delete this report?"
    }
  };
  const t = translations[language] || translations.ar;

  useEffect(() => {
    setReports([
      { id: 1, date: '2026-09-15 10:30', author: 'المهندس كريم', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format' },
      { id: 2, date: '2026-09-10 14:15', author: 'SouqBTP VIP', img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=500&auto=format' }
    ]);
  }, []);

  // 🚀 دوال الأرشفة والحذف للتقارير
  const handleArchiveReport = (id) => {
    // في الإنتاج: يتم إرسال أمر الأرشفة لقاعدة البيانات Supabase
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteReport = (id) => {
    if(window.confirm(t.confirmDelete)) {
      // في الإنتاج: يتم مسح التقرير من القاعدة
      setReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleStartSession = () => { setRoomId(Math.floor(100000 + Math.random() * 900000).toString()); setIsInRoom(true); };
  const handleJoinSession = () => { if (joinInput.trim().length > 3) { setRoomId(joinInput.trim()); setIsInRoom(true); } };

  useEffect(() => {
    if (isInRoom) { initWebRTC(); return () => cleanupRoom(); }
  }, [isInRoom]);

  const initWebRTC = async () => {
    setConnectionStatus(t.waiting);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) { localVideoRef.current.srcObject = stream; localVideoRef.current.muted = true; }
      
      setTimeout(() => {
        setConnectionStatus(t.connected);
      }, 3000);
      
    } catch (err) { setConnectionStatus("⚠️ يرجى تفعيل الكاميرا"); }
  };

  const toggleCamera = async () => {
    const nextMode = !useFrontCamera;
    setUseFrontCamera(nextMode);
    try {
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: nextMode ? 'user' : 'environment' }, 
            audio: true 
        });
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch(e) { console.error("Error switching camera:", e); }
  };

  const toggleTorch = async () => {
    try {
        const track = localStream.current?.getVideoTracks()[0];
        if (track) {
            const capabilities = track.getCapabilities();
            if (capabilities.torch) {
                const isTorchOn = track.getSettings().torch || false;
                await track.applyConstraints({ advanced: [{ torch: !isTorchOn }] });
            } else {
                alert("جهازك لا يدعم تشغيل الفلاش 💡");
            }
        }
    } catch(e) { console.error("Error toggling torch:", e); }
  };

  const cleanupRoom = () => {
    if (localStream.current) localStream.current.getTracks().forEach(track => track.stop());
    if (peerConnection.current) peerConnection.current.close();
  };

  const toggleFreeze = () => {
    const nextState = !isFrozen;
    setIsFrozen(nextState);
    if (nextState) {
      const rVideo = remoteVideoRef.current; const fCanvas = freezeCanvasRef.current; const dCanvas = canvasRef.current;
      if (rVideo && fCanvas && dCanvas) {
        fCanvas.width = dCanvas.width = rVideo.clientWidth || window.innerWidth; 
        fCanvas.height = dCanvas.height = rVideo.clientHeight || window.innerHeight;
        const ctx = fCanvas.getContext('2d'); 
        ctx.drawImage(rVideo, 0, 0, fCanvas.width, fCanvas.height);
      }
    } else {
      const dCanvas = canvasRef.current;
      if (dCanvas) { dCanvas.getContext('2d').clearRect(0, 0, dCanvas.width, dCanvas.height); undoStack.current = []; }
      setBoqResult(null); setMeasureMode(null); measureStart.current = null;
    }
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startInteraction = (e) => {
    if (!isFrozen) return;
    const pos = getCanvasPos(e);
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');

    undoStack.current.push(canvas.toDataURL('image/png'));
    if (undoStack.current.length > 20) undoStack.current.shift();

    if (activeTool === 'stamp') {
      ctx.font = currentStamp.startsWith('🏷️') ? "bold 20px Cairo" : "40px Arial";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (currentStamp.startsWith('🏷️')) {
        const textWidth = ctx.measureText(currentStamp).width;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)"; ctx.fillRect(pos.x - (textWidth/2) - 15, pos.y - 20, textWidth + 30, 40);
        ctx.fillStyle = drawColor; ctx.fillText(currentStamp, pos.x, pos.y);
      } else {
        ctx.fillText(currentStamp, pos.x, pos.y);
      }
      return;
    }

    if (activeTool === 'measure') {
      if (!measureStart.current) {
        measureStart.current = pos;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 4, 0, Math.PI*2); ctx.fillStyle = "#38bdf8"; ctx.fill();
      } else {
        const distPx = Math.sqrt(Math.pow(pos.x - measureStart.current.x, 2) + Math.pow(pos.y - measureStart.current.y, 2));
        if (measureMode === 'calibrate') {
          setCalibrationFactor(distPx / 10);
          alert("✅ تمت المعايرة بنجاح (10سم)");
          setMeasureMode(null); setActiveTool('pen');
        } else if (measureMode === 'measure' || measureMode === 'area') {
          if (!calibrationFactor) { alert("🚨 يجب المعايرة أولاً (الخطوة 1)"); measureStart.current = null; return; }
          const realDistCm = (distPx / calibrationFactor).toFixed(1);
          const realDistM = (realDistCm / 100).toFixed(2);
          
          if (measureMode === 'area') {
            const area = (realDistM * 3).toFixed(2); 
            setBoqResult({
              area: area, bricks: Math.round(area * 60), cement: (area * 0.55).toFixed(1),
              sand: (area * 0.07).toFixed(2), steel: (area * 2.5).toFixed(1)
            });
            setMeasureMode(null); setActiveTool('pen');
          }

          ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.moveTo(measureStart.current.x, measureStart.current.y); ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
          ctx.font = "bold 18px Cairo"; ctx.fillStyle = "white"; ctx.shadowColor = "black"; ctx.shadowBlur = 4;
          ctx.fillText(realDistCm < 100 ? `${realDistCm} cm` : `${realDistM} m`, (measureStart.current.x + pos.x)/2, (measureStart.current.y + pos.y)/2 - 10);
          ctx.shadowBlur = 0;
        }
        measureStart.current = null;
      }
      return;
    }

    isDrawing.current = true;
    startPos.current = pos;
    lastPos.current = pos;
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const doInteraction = (e) => {
    if (!isFrozen || !isDrawing.current || activeTool !== 'pen') return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    const ctx = canvasRef.current.getContext('2d');

    if (isSmartMode) {
      ctx.putImageData(snapshot.current, 0, 0);
      ctx.beginPath(); ctx.moveTo(startPos.current.x, startPos.current.y); ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = drawColor; ctx.lineWidth = penSize; ctx.lineCap = 'round'; ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = drawColor; ctx.lineWidth = penSize; ctx.lineCap = 'round'; ctx.stroke();
      lastPos.current = pos;
    }
  };

  const stopInteraction = () => { isDrawing.current = false; };

  const handleUndo = () => {
    if (undoStack.current.length > 0) {
      const lastState = undoStack.current.pop(); const img = new Image(); img.src = lastState;
      img.onload = () => { const ctx = canvasRef.current.getContext('2d'); ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); ctx.drawImage(img, 0, 0); };
    } else { handleClear(); }
  };

  const handleClear = () => { canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); undoStack.current = []; setBoqResult(null); measureStart.current = null; };

  const handleSaveReport = () => {
    if (!isFrozen) return;
    const finalCanvas = document.createElement('canvas'); finalCanvas.width = canvasRef.current.width; finalCanvas.height = canvasRef.current.height;
    const fCtx = finalCanvas.getContext('2d');
    fCtx.drawImage(freezeCanvasRef.current, 0, 0); fCtx.drawImage(canvasRef.current, 0, 0);
    fCtx.fillStyle = "rgba(15, 23, 42, 0.8)"; fCtx.fillRect(0, finalCanvas.height - 40, finalCanvas.width, 40);
    fCtx.fillStyle = "#38bdf8"; fCtx.font = "bold 16px Cairo"; fCtx.fillText(`تقرير ميداني - ${new Date().toLocaleDateString('ar-MA')}`, 20, finalCanvas.height - 15);
    const link = document.createElement('a'); link.download = `Report_${roomId}.jpg`; link.href = finalCanvas.toDataURL('image/jpeg', 0.9); link.click();
  };

  const activateMeasure = (mode) => { setActiveTool('measure'); setMeasureMode(mode); measureStart.current = null; };

  // --- Lobby ---
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
              <button onClick={handleStartSession} className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-black text-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                <Video size={24} /> {t.startNew}
              </button>
              
              <div className="flex-1 flex bg-slate-800/80 border-2 border-slate-700 rounded-2xl focus-within:border-purple-500 transition-colors p-1.5">
                <input type="text" placeholder={t.roomCode} value={joinInput} onChange={(e)=>setJoinInput(e.target.value)} className="w-full bg-transparent text-white px-3 font-bold outline-none text-center" dir="ltr" />
                <button onClick={handleJoinSession} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-black transition-colors h-full flex items-center justify-center">
                  {t.joinBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6"><FileText className="text-teal-500" /> {t.recentReports}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reports.map(rep => (
              <div key={rep.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg group relative cursor-pointer">
                <div className="h-48 overflow-hidden relative">
                  <img src={rep.img} alt="Report" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <div><p className="text-white font-black">{rep.author}</p><p className="text-slate-300 text-xs font-bold">{rep.date}</p></div>
                  </div>
                </div>
                
                {/* 🚀 أزرار الأرشفة والحذف التي تظهر عند تمرير الماوس */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={(e) => { e.stopPropagation(); handleArchiveReport(rep.id); }} className="p-2 bg-slate-900/80 hover:bg-amber-500 text-white rounded-xl backdrop-blur-md transition-colors border border-white/10" title={t.archiveBtn}>
                    <Archive size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteReport(rep.id); }} className="p-2 bg-slate-900/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-colors border border-white/10" title={t.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <p className="col-span-full text-center text-slate-500 py-10 font-bold">{t.noReports}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Live Room (Immersive UI) ---
  return (
    /* 🚀 كسر كل إطارات المنصة هنا باستخدام fixed و z-[99999] و w-screen h-screen */
    <div className="fixed inset-0 w-screen h-screen z-[99999] bg-[#020617] flex flex-col font-cairo overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🚀 Floating Status Pill */}
      <div className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} z-50 px-5 py-2.5 rounded-full text-sm font-black border flex items-center gap-2 backdrop-blur-md transition-all duration-500 shadow-xl ${
        connectionStatus === t.connected 
          ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/50' 
          : 'bg-slate-900/80 text-slate-300 border-slate-700'
      }`}>
         {connectionStatus === t.connected ? (
           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
         ) : (
           <Loader2 size={16} className="animate-spin text-slate-400" />
         )}
         {connectionStatus} <span className="opacity-50 mx-1">|</span> {roomId}
      </div>

      <div className="flex-1 relative flex justify-center items-center bg-black overflow-hidden h-full w-full">
        
        {/* Remote Video */}
        <video ref={remoteVideoRef} className={`absolute inset-0 w-full h-full object-cover md:object-contain transition-opacity duration-300 ${isFrozen ? 'opacity-0' : 'opacity-100'}`} autoPlay playsInline></video>
        <canvas ref={freezeCanvasRef} className={`absolute inset-0 w-full h-full object-cover md:object-contain transition-opacity duration-300 ${isFrozen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></canvas>
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 w-full h-full object-cover md:object-contain z-20 ${isFrozen ? 'cursor-crosshair' : 'pointer-events-none'}`}
          onMouseDown={startInteraction} onMouseMove={doInteraction} onMouseUp={stopInteraction} onMouseOut={stopInteraction}
          onTouchStart={startInteraction} onTouchMove={doInteraction} onTouchEnd={stopInteraction}
        ></canvas>

        {/* 📸 Local Camera with Integrated Buttons */}
        <div className={`absolute bottom-24 md:bottom-8 left-4 md:left-6 w-[100px] h-[140px] md:w-[130px] md:h-[180px] z-50 bg-slate-900 rounded-2xl border-2 border-teal-500 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ${isFrozen ? 'opacity-40 hover:opacity-100 scale-90 origin-bottom-left' : 'opacity-100'}`}>
          <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
          
          <button onClick={toggleTorch} className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center border border-white/20 hover:bg-amber-500 hover:border-amber-400 transition-colors" title="الفلاش">
            <Lightbulb size={14} />
          </button>
          <button onClick={toggleCamera} className="absolute bottom-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center border border-white/20 hover:bg-sky-500 hover:border-sky-400 transition-colors" title="قلب الكاميرا">
            <RefreshCcw size={14} />
          </button>
        </div>

        {/* 🛠️ Smart Tools (Left Panel) */}
        {isFrozen && (
          <div className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[30px] shadow-2xl transition-all duration-400 overflow-hidden flex flex-col items-center group w-[55px] h-[55px] hover:w-[280px] hover:h-auto hover:max-h-[85vh] hover:items-start hover:p-4 hover:rounded-2xl cursor-pointer">
            <div className="w-full h-full flex items-center justify-center group-hover:hidden text-2xl transition-opacity">🛠️</div>
            
            <div className="hidden group-hover:flex flex-col w-full h-full animate-fade-in overflow-y-auto custom-scrollbar pr-2 space-y-4">
              <div>
                <h4 className="text-teal-400 text-[11px] font-black border-b border-slate-700 pb-1 mb-2 text-center uppercase tracking-widest">{t.tools}</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {['🧱', '🚰', '⚡', '🪵', '🪟', '🚪'].map(emoji => (
                    <button key={emoji} onClick={() => {setActiveTool('stamp'); setCurrentStamp(emoji);}} className={`text-xl p-2 rounded-xl border transition-all ${activeTool === 'stamp' && currentStamp === emoji ? 'bg-purple-600 border-purple-500 scale-105' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}>{emoji}</button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-red-400 text-[11px] font-black border-b border-slate-700 pb-1 mb-2 text-center uppercase tracking-widest">🚨 {t.radar}</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => {setActiveTool('stamp'); setCurrentStamp('🔍');}} className="text-xl p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/40">🔍</button>
                  <button onClick={() => {setActiveTool('stamp'); setCurrentStamp('⚠️');}} className="text-xl p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/40">⚠️</button>
                  <button onClick={() => {setActiveTool('stamp'); setCurrentStamp('❌');}} className="text-xl p-2 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/40">❌</button>
                </div>
              </div>

              <div>
                <h4 className="text-sky-400 text-[11px] font-black border-b border-slate-700 pb-1 mb-2 text-center uppercase tracking-widest">📐 القياس الهندسي</h4>
                <div className="flex flex-col gap-2">
                  <button onClick={() => activateMeasure('calibrate')} className="w-full py-2 bg-purple-600/80 text-white rounded-xl text-xs font-bold hover:bg-purple-600 transition-colors">🎯 1. ضبط المعايرة (10سم)</button>
                  <button onClick={() => activateMeasure('measure')} className="w-full py-2 bg-sky-500/80 text-white rounded-xl text-xs font-bold hover:bg-sky-500 transition-colors">📏 2. قياس طول خط</button>
                  <button onClick={() => activateMeasure('area')} className="w-full py-2 bg-amber-500/80 text-slate-900 rounded-xl text-xs font-black hover:bg-amber-500 transition-colors">🧮 3. حساب المساحة والكميات</button>
                </div>
              </div>

              <div>
                <h4 className="text-emerald-400 text-[11px] font-black border-b border-slate-700 pb-1 mb-2 text-center uppercase tracking-widest">💰 تسعير سريع</h4>
                <input type="text" placeholder="مثال: إسمنت 50 د.م" value={quoteText} onChange={(e) => setQuoteText(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500 text-center mb-2" />
                <button onClick={() => {setActiveTool('stamp'); setCurrentStamp(`🏷️ ${quoteText || 'بدون سعر'}`);}} className="w-full py-2 bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">🏷️ وضع التسعيرة</button>
              </div>
            </div>
          </div>
        )}

        {/* 🖌️ Drawing Tools (Right Panel) */}
        {isFrozen && (
          <div className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[30px] shadow-2xl transition-all duration-400 overflow-hidden flex flex-col items-center group w-[55px] h-[55px] hover:w-[70px] hover:h-auto hover:max-h-[85vh] hover:py-4 hover:rounded-2xl cursor-pointer">
            <div className="w-full h-full flex items-center justify-center group-hover:hidden text-white"><PenTool size={22} /></div>
            
            <div className="hidden group-hover:flex flex-col items-center w-full gap-3 animate-fade-in">
              <button onClick={() => setActiveTool('pen')} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTool === 'pen' ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><PenTool size={20}/></button>
              
              <div className="w-full h-px bg-slate-700 my-1"></div>
              
              <button onClick={() => setDrawColor('#ef4444')} className={`w-10 h-10 rounded-2xl bg-red-500 transition-transform ${drawColor === '#ef4444' ? 'scale-110 border-2 border-white shadow-[0_0_15px_#ef4444]' : ''}`}></button>
              <button onClick={() => setDrawColor('#22c55e')} className={`w-10 h-10 rounded-2xl bg-green-500 transition-transform ${drawColor === '#22c55e' ? 'scale-110 border-2 border-white shadow-[0_0_15px_#22c55e]' : ''}`}></button>
              <button onClick={() => setDrawColor('#38bdf8')} className={`w-10 h-10 rounded-2xl bg-sky-400 transition-transform ${drawColor === '#38bdf8' ? 'scale-110 border-2 border-white shadow-[0_0_15px_#38bdf8]' : ''}`}></button>
              <button onClick={() => setDrawColor('#eab308')} className={`w-10 h-10 rounded-2xl bg-yellow-400 transition-transform ${drawColor === '#eab308' ? 'scale-110 border-2 border-white shadow-[0_0_15px_#eab308]' : ''}`}></button>
              
              <div className="w-full h-px bg-slate-700 my-1"></div>
              
              <div className="w-full flex flex-col items-center px-1">
                <span className="text-[9px] text-slate-400 mb-1 font-bold">السُمك</span>
                <input type="range" min="2" max="15" value={penSize} onChange={(e) => setPenSize(e.target.value)} className="w-full accent-blue-500 h-1" />
              </div>

              <button onClick={() => setIsSmartMode(!isSmartMode)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all mt-2 ${isSmartMode ? 'bg-blue-600 text-white border-2 border-sky-300 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`} title="الرسم المستقيم الهندسي">📐</button>

              <div className="w-full h-px bg-slate-700 my-1"></div>
              
              <button onClick={handleUndo} className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600" title={t.undo}><Undo size={18}/></button>
              <button onClick={handleClear} className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center hover:bg-red-500" title={t.clear}><Trash2 size={18}/></button>
              <button onClick={handleSaveReport} className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 shadow-lg shadow-sky-500/40 mt-2" title={t.saveReport}><FileText size={18}/></button>
            </div>
          </div>
        )}

        {/* 🧮 BOQ Estimate Popup */}
        {boqResult && isFrozen && (
          <div className="absolute top-20 md:top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-slide-down w-[90%] md:w-auto">
            <h3 className="text-amber-500 font-black text-center mb-4 text-lg">🧮 الكميات التقديرية ({boqResult.area} m²)</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-slate-300">🧱 <b className="text-sky-400 text-lg">{boqResult.bricks}</b> آجور</div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-slate-300">🌑 <b className="text-sky-400 text-lg">{boqResult.cement}</b> إسمنت</div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-slate-300">⏳ <b className="text-sky-400 text-lg">{boqResult.sand}</b> رمل</div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-slate-300">🏗️ <b className="text-sky-400 text-lg">{boqResult.steel}</b> حديد</div>
            </div>
            <button onClick={() => setBoqResult(null)} className="w-full mt-5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-2.5 rounded-xl transition-colors">إغلاق</button>
          </div>
        )}

      </div>

      {/* 🚀 Floating Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-3 md:gap-4 z-50 w-[90%] md:w-auto">
        <button onClick={toggleFreeze} className={`${isFrozen ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'} flex-1 md:flex-none text-white px-6 md:px-10 py-3.5 md:py-4 rounded-2xl md:rounded-full font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-2xl hover:scale-105`}>
          {isFrozen ? <><Play size={18}/> {t.unfreeze}</> : <><PauseCircle size={18}/> {t.freeze}</>}
        </button>

        <button onClick={() => {cleanupRoom(); setIsInRoom(false);}} className="bg-slate-900/90 backdrop-blur-md border border-red-500/50 hover:bg-red-600 text-red-500 hover:text-white px-5 md:px-8 py-3.5 md:py-4 flex-1 md:flex-none rounded-2xl md:rounded-full font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-2xl">
          <PhoneOff size={18}/> <span className="hidden sm:inline">{t.endCall}</span>
        </button>
      </div>

    </div>
  );
}