import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';
import { VideoOff, MicOff, Camera, Maximize, Flashlight, MousePointer2, Undo2, Trash2, FileText, Send, Loader2 } from 'lucide-react';

// إعدادات خوادم STUN لضمان الاتصال المباشر (WebRTC)
const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function LiveRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('cid');
  
  const { language = 'ar' } = useSettingsStore();
  const isRtl = language === 'ar';

  // 🛡️ الهوية المشفرة والأدوار
  const [identity, setIdentity] = useState({ role: 'client', trackId: '', userUuid: '' });
  const [roomState, setRoomState] = useState({ status: '⏳ جاري الاتصال...', color: '#f59e0b', isOffering: false });
  
  // 📸 حالات الكاميرا والغرفة
  const [isFrozen, setIsFrozen] = useState(false);
  const [useFrontCam, setUseFrontCam] = useState(false); // العميل يستخدم الخلفية غالباً
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isUiHidden, setIsUiHidden] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  // 🖌️ حالات الرسم والأدوات
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [penSize, setPenSize] = useState(4);
  const [activeMode, setActiveMode] = useState('pen'); // pen, stamp, laser
  const [currentStamp, setCurrentStamp] = useState('');
  const [quoteText, setQuoteText] = useState('');

  // 📡 المراجع الأساسية للاتصال (Refs) لعدم إعادة التصيير
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const peerConnRef = useRef(null);
  const localStreamRef = useRef(null);
  const channelRef = useRef(null);
  
  // متغيرات الرسم الذاكرية
  const drawingState = useRef({ isDrawing: false, lastX: 0, lastY: 0 });
  const undoStack = useRef([]);
  const laserTimeout = useRef(null);
  const laserRef = useRef(null);

  // ==========================================
  // 1. تحديد الهوية بشكل قطعي وآمن
  // ==========================================
  useEffect(() => {
    const resolveIdentity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/auth');

      // البحث كمهندس أولاً
      const { data: archRow } = await supabase.from('architects').select('id').eq('user_id', user.id).maybeSingle();
      if (archRow || window.location.pathname.includes('architect')) {
        setIdentity({ role: 'architect', trackId: String(archRow?.id || user.id), userUuid: user.id });
        return;
      }

      // البحث كمقاول/حرفي
      const { data: provRow } = await supabase.from('providers').select('id').eq('user_id', user.id).maybeSingle();
      if (provRow) {
        setIdentity({ role: 'provider', trackId: String(provRow.id), userUuid: user.id });
        return;
      }

      // إذا لم يكن أياً منهما فهو عميل
      setIdentity({ role: 'client', trackId: user.id, userUuid: user.id });
    };
    resolveIdentity();
  }, [navigate]);

  // ==========================================
  // 2. محرك WebRTC للاتصال المباشر
  // ==========================================
  useEffect(() => {
    if (!roomId || !identity.trackId) return;

    const initWebRTC = async () => {
      try {
        // 1. جلب الكاميرا (الخلفية افتراضياً للعميل، والأمامية للمهندس)
        const facing = identity.role === 'client' ? 'environment' : 'user';
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: { echoCancellation: true, noiseSuppression: true } 
        });
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }

        // 2. إنشاء اتصال الند للند (PeerConnection)
        peerConnRef.current = new RTCPeerConnection(rtcConfig);
        stream.getTracks().forEach(track => peerConnRef.current.addTrack(track, stream));

        peerConnRef.current.ontrack = (event) => {
          if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setRoomState({ status: '🟢 متصل ومباشر', color: '#10b981', isOffering: roomState.isOffering });
          }
        };

        peerConnRef.current.onconnectionstatechange = () => {
          if (peerConnRef.current.connectionState === 'disconnected' || peerConnRef.current.connectionState === 'failed') {
            setRoomState({ status: '🔴 الاتصال مقطوع', color: '#ef4444', isOffering: false });
          }
        };

        // 3. إعداد قناة Supabase للإشارات (Signaling)
        channelRef.current = supabase.channel(`live_room_${roomId}`, {
          config: { broadcast: { self: false }, presence: { key: identity.role } }
        });

        peerConnRef.current.onicecandidate = (e) => {
          if (e.candidate) channelRef.current.send({ type: 'broadcast', event: 'ice', payload: { candidate: e.candidate, sender: identity.role } });
        };

        channelRef.current
          .on('broadcast', { event: 'ice' }, async ({ payload }) => {
            if (payload.sender !== identity.role && payload.candidate && peerConnRef.current) {
              try { await peerConnRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (err) {}
            }
          })
          .on('broadcast', { event: 'offer' }, async ({ payload }) => {
            if (payload.sender !== identity.role && peerConnRef.current) {
              await peerConnRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
              const answer = await peerConnRef.current.createAnswer();
              await peerConnRef.current.setLocalDescription(answer);
              channelRef.current.send({ type: 'broadcast', event: 'answer', payload: { answer, sender: identity.role } });
            }
          })
          .on('broadcast', { event: 'answer' }, async ({ payload }) => {
            if (payload.sender !== identity.role && peerConnRef.current) {
              await peerConnRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
            }
          })
          .on('broadcast', { event: 'ping' }, async ({ payload }) => {
            // المصافحة وبدء الاتصال من طرف المحترف
            if (payload.sender === 'client' && identity.role !== 'client' && !roomState.isOffering) {
              setRoomState(p => ({ ...p, isOffering: true }));
              const offer = await peerConnRef.current.createOffer();
              await peerConnRef.current.setLocalDescription(offer);
              channelRef.current.send({ type: 'broadcast', event: 'offer', payload: { offer: peerConnRef.current.localDescription, sender: identity.role } });
            }
          })
          // استقبال أحداث الرسم والتجميد
          .on('broadcast', { event: 'freeze' }, ({ payload }) => executeFreeze(payload.state))
          .on('broadcast', { event: 'draw' }, ({ payload }) => executeDraw(payload))
          .on('broadcast', { event: 'stamp' }, ({ payload }) => executeStamp(payload))
          .on('broadcast', { event: 'clear' }, () => executeClear())
          .on('broadcast', { event: 'sync_canvas' }, ({ payload }) => executeSync(payload.image_data))
          .on('broadcast', { event: 'laser' }, ({ payload }) => showLaser(payload))
          .on('broadcast', { event: 'zoom' }, ({ payload }) => applyZoom(payload.level))
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channelRef.current.track({ role: identity.role });
              // إرسال Ping لتعريف الطرف الآخر بوجودنا
              channelRef.current.send({ type: 'broadcast', event: 'ping', payload: { sender: identity.role } });
            }
          });

      } catch (err) {
        setRoomState({ status: '❌ يرجى السماح بالكاميرا', color: '#ef4444', isOffering: false });
      }
    };

    initWebRTC();

    return () => {
      if (peerConnRef.current) peerConnRef.current.close();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [roomId, identity.trackId, identity.role]);

  // ==========================================
  // 3. أدوات التحكم بالكاميرا والموبايل
  // ==========================================
  const toggleCamera = async () => {
    if (!localStreamRef.current || !peerConnRef.current) return;
    const newFacingMode = useFrontCam ? 'environment' : 'user';
    try {
      localStreamRef.current.getVideoTracks().forEach(t => t.stop());
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: newFacingMode } } });
      const newTrack = newStream.getVideoTracks()[0];
      
      localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
      localStreamRef.current.addTrack(newTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      
      const sender = peerConnRef.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(newTrack);
      setUseFrontCam(!useFrontCam);
    } catch (e) {
      alert("تعذر تبديل الكاميرا");
    }
  };

  const toggleTorch = async () => {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getVideoTracks()[0];
    const hasTorch = track.getCapabilities && track.getCapabilities().torch;
    if (hasTorch) {
      try {
        await track.applyConstraints({ advanced: [{ torch: !isTorchOn }] });
        setIsTorchOn(!isTorchOn);
      } catch (e) {}
    } else {
      alert("الكشاف غير مدعوم في هذا الجهاز");
    }
  };

  const handleZoom = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoomLevel(newZoom);
    applyZoom(newZoom);
    channelRef.current?.send({ type: 'broadcast', event: 'zoom', payload: { level: newZoom } });
  };

  const applyZoom = (level) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.style.transform = `scale(${level})`;
      remoteVideoRef.current.style.transformOrigin = 'center center';
    }
    if (canvasRef.current) {
      canvasRef.current.style.transform = `scale(${level})`;
      canvasRef.current.style.transformOrigin = 'center center';
    }
  };

  // ==========================================
  // 4. محرك الرسم التفاعلي
  // ==========================================
  const executeFreeze = (state) => {
    setIsFrozen(state);
    if (!canvasRef.current || !remoteVideoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (state) {
      canvas.width = remoteVideoRef.current.clientWidth || window.innerWidth;
      canvas.height = remoteVideoRef.current.clientHeight || window.innerHeight;
      ctx.drawImage(remoteVideoRef.current, 0, 0, canvas.width, canvas.height);
      remoteVideoRef.current.style.display = 'none';
      canvas.style.display = 'block';
    } else {
      remoteVideoRef.current.style.display = 'block';
      canvas.style.display = 'none';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      undoStack.current = [];
    }
  };

  const toggleFreeze = () => {
    const newState = !isFrozen;
    executeFreeze(newState);
    channelRef.current?.send({ type: 'broadcast', event: 'freeze', payload: { state: newState } });
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = e.clientX, clientY = e.clientY;
    if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startInteraction = (e) => {
    if (!isFrozen) return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    
    // حفظ النسخة للتراجع
    undoStack.current.push(canvas.toDataURL('image/jpeg', 0.6));
    if (undoStack.current.length > 20) undoStack.current.shift();

    if (activeMode === 'stamp') {
      const stampData = { text: currentStamp, x: pos.x / canvas.width, y: pos.y / canvas.height, color: drawColor };
      executeStamp(stampData);
      channelRef.current?.send({ type: 'broadcast', event: 'stamp', payload: stampData });
      channelRef.current?.send({ type: 'broadcast', event: 'sync_canvas', payload: { image_data: canvas.toDataURL('image/jpeg', 0.6) } });
      return;
    }
    
    drawingState.current = { isDrawing: true, lastX: pos.x, lastY: pos.y };
  };

  const moveInteraction = (e) => {
    if (!isFrozen) {
      if (identity.role !== 'client') {
        const pos = getPos(e);
        channelRef.current?.send({ type: 'broadcast', event: 'laser', payload: { x: pos.x / canvasRef.current.width, y: pos.y / canvasRef.current.height } });
      }
      return;
    }

    if (!drawingState.current.isDrawing || activeMode !== 'pen') return;
    e.preventDefault();
    const pos = getPos(e);
    const canvas = canvasRef.current;
    
    const drawData = {
      x0: drawingState.current.lastX / canvas.width, y0: drawingState.current.lastY / canvas.height,
      x1: pos.x / canvas.width, y1: pos.y / canvas.height,
      color: drawColor, size: penSize
    };
    
    executeDraw(drawData);
    channelRef.current?.send({ type: 'broadcast', event: 'draw', payload: drawData });
    drawingState.current.lastX = pos.x; drawingState.current.lastY = pos.y;
  };

  const stopInteraction = () => {
    if (!drawingState.current.isDrawing || activeMode !== 'pen') return;
    drawingState.current.isDrawing = false;
    channelRef.current?.send({ type: 'broadcast', event: 'sync_canvas', payload: { image_data: canvasRef.current.toDataURL('image/jpeg', 0.6) } });
  };

  const executeDraw = (data) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(data.x0 * canvas.width, data.y0 * canvas.height);
    ctx.lineTo(data.x1 * canvas.width, data.y1 * canvas.height);
    ctx.strokeStyle = data.color; ctx.lineWidth = data.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(); ctx.closePath();
  };

  const executeStamp = (data) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (data.text.length > 2) { // نص تسعيرة أو تقرير
      ctx.font = "bold 20px Cairo, Arial"; const w = ctx.measureText(data.text).width;
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)"; ctx.fillRect((data.x * canvas.width) - (w/2) - 15, (data.y * canvas.height) - 20, w + 30, 40);
      ctx.fillStyle = data.color; ctx.fillText(data.text, (data.x * canvas.width), (data.y * canvas.height));
    } else { // إيموجي
      ctx.font = "45px Arial"; ctx.fillText(data.text, (data.x * canvas.width), (data.y * canvas.height));
    }
    ctx.restore();
  };

  const executeClear = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isFrozen && remoteVideoRef.current) {
      ctx.drawImage(remoteVideoRef.current, 0, 0, canvas.width, canvas.height);
    }
    undoStack.current = [];
  };

  const executeSync = (base64Img) => {
    if (!canvasRef.current || !base64Img) return;
    const img = new Image(); img.src = base64Img;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.style.display = 'block';
    };
  };

  const showLaser = (pos) => {
    if (!laserRef.current || !canvasRef.current) return;
    laserRef.current.style.display = 'block';
    laserRef.current.style.left = (pos.x * canvasRef.current.clientWidth) + 'px';
    laserRef.current.style.top = (pos.y * canvasRef.current.clientHeight) + 'px';
    clearTimeout(laserTimeout.current);
    laserTimeout.current = setTimeout(() => { laserRef.current.style.display = 'none'; }, 1000);
  };

  // ==========================================
  // 5. استخراج التقارير الميدانية (Report Generation)
  // ==========================================
  const generateReport = async () => {
    if (!isFrozen || !canvasRef.current) return alert("قم بتجميد الشاشة أولاً لاستخراج التقرير!");
    setIsUploading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const w = canvas.width; const dateNow = new Date().toLocaleString('ar-MA');
      
      // الترويسة المائية
      ctx.save(); 
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)"; ctx.fillRect(0, 0, w, 70); 
      ctx.font = "bold 40px Cairo, Arial"; ctx.textAlign = "right"; ctx.fillStyle = "#38bdf8"; 
      ctx.shadowColor = "rgba(0, 0, 0, 0.9)"; ctx.shadowBlur = 10;
      ctx.fillText("SouqBTP - تقرير ميداني 📸", w - 25, 50); 
      ctx.shadowBlur = 0; ctx.font = "bold 20px Cairo, Arial"; ctx.textAlign = "left"; ctx.fillStyle = "#cbd5e1"; 
      ctx.fillText(dateNow, 25, 45); 
      ctx.restore();

      canvas.toBlob(async (blob) => {
        try {
          const fileName = `live_report_${roomId}_${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage.from('project-files').upload(fileName, blob, { contentType: 'image/jpeg' });
          if (uploadError) throw uploadError;
          
          const { data: pubData } = supabase.storage.from('project-files').getPublicUrl(fileName);
          
          // إرسال الصورة للشات
          await supabase.from('messages').insert([{ 
            conversation_id: parseInt(roomId), sender_type: identity.role, 
            content: `📸 تقرير ميداني:\n${pubData.publicUrl}`, is_read: false 
          }]);
          
          // تحديث آخر رسالة
          await supabase.from('conversations').update({ last_message: '📸 تقرير مصور جديد' }).eq('id', parseInt(roomId));

          alert("✅ تم التقاط وحفظ التقرير الميداني بنجاح وإرساله في الدردشة!");
        } catch (err) {
          alert("❌ حدث خطأ أثناء الحفظ!");
        } finally {
          setIsUploading(false);
        }
      }, 'image/jpeg', 0.9);
      
    } catch (e) {
      setIsUploading(false);
    }
  };

  const endCall = () => {
    if (peerConnRef.current) peerConnRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    // إرسال إشعار إنهاء
    supabase.from('messages').insert([{ conversation_id: parseInt(roomId), sender_type: identity.role, content: '📞 VIDEO_CALL_ENDED', is_read: false }]);
    window.close(); // أو العودة للرسائل
  };

  // ==========================================
  // 🎨 بناء الواجهات الذكية (Polymorphic UI)
  // ==========================================
  const renderArchitectTools = () => (
    <>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/90 border border-slate-700 rounded-3xl w-14 hover:w-60 overflow-hidden shadow-2xl transition-all duration-300 z-50 group flex flex-col items-center hover:items-start hover:p-4 hover:h-auto h-14">
        <span className="text-2xl mt-3 group-hover:hidden">📐</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full mt-2 hidden group-hover:flex flex-col gap-3">
          <h4 className="text-blue-400 font-bold text-center text-sm border-b border-slate-700 pb-2">أدوات البناء والهندسة</h4>
          <div className="grid grid-cols-4 gap-2">
            {['🧱','🚰','⚡','🪵','🪟','🚪','🔨','💡'].map(e => (
              <button key={e} onClick={() => {setActiveMode('stamp'); setCurrentStamp(e);}} className={`bg-slate-800 p-2 rounded-xl hover:bg-blue-600 transition-colors ${currentStamp===e ? 'bg-blue-600' : ''}`}>{e}</button>
            ))}
          </div>
          <h4 className="text-rose-400 font-bold text-center text-sm border-b border-slate-700 pb-2 mt-2">رادار الأخطاء</h4>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => {setActiveMode('stamp'); setCurrentStamp('❌ خطأ تنفيذي');}} className="bg-slate-800 p-2 rounded-xl hover:bg-rose-600 text-xs">❌</button>
            <button onClick={() => {setActiveMode('stamp'); setCurrentStamp('⚠️ خطر سلامة');}} className="bg-slate-800 p-2 rounded-xl hover:bg-amber-500 text-xs">⚠️</button>
            <button onClick={() => {setActiveMode('stamp'); setCurrentStamp('🔍 يحتاج فحص');}} className="bg-slate-800 p-2 rounded-xl hover:bg-blue-500 text-xs">🔍</button>
          </div>
          <h4 className="text-emerald-400 font-bold text-center text-sm border-b border-slate-700 pb-2 mt-2">تسعير هندسي</h4>
          <input type="text" value={quoteText} onChange={(e)=>setQuoteText(e.target.value)} placeholder="مثال: إسمنت 50 د.م" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white" />
          <button onClick={() => {if(quoteText) { setActiveMode('stamp'); setCurrentStamp("🏷️ " + quoteText); }}} className="bg-emerald-600 text-white rounded-lg p-2 text-xs font-bold hover:bg-emerald-500">🏷️ وضع التسعيرة</button>
        </div>
      </div>
    </>
  );

  const renderProviderTools = () => (
    <>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/90 border border-slate-700 rounded-3xl w-14 hover:w-56 overflow-hidden shadow-2xl transition-all duration-300 z-50 group flex flex-col items-center hover:items-start hover:p-4 hover:h-auto h-14">
        <span className="text-2xl mt-3 group-hover:hidden">🛠️</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full mt-2 hidden group-hover:flex flex-col gap-3">
          <h4 className="text-amber-500 font-bold text-center text-sm border-b border-slate-700 pb-2">علامات ميدانية</h4>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => {setActiveMode('stamp'); setCurrentStamp('✅ تم الإنجاز');}} className="bg-slate-800 p-2 rounded-xl hover:bg-emerald-600 text-xs">✅</button>
            <button onClick={() => {setActiveMode('stamp'); setCurrentStamp('⚠️ يحتاج مواد');}} className="bg-slate-800 p-2 rounded-xl hover:bg-amber-600 text-xs">⚠️</button>
            <button onClick={() => {setActiveMode('stamp'); setCurrentStamp('🛠️ قيد العمل');}} className="bg-slate-800 p-2 rounded-xl hover:bg-blue-600 text-xs">🛠️</button>
          </div>
          <h4 className="text-emerald-400 font-bold text-center text-sm border-b border-slate-700 pb-2 mt-2">تسعير سريع للعميل</h4>
          <input type="text" value={quoteText} onChange={(e)=>setQuoteText(e.target.value)} placeholder="التكلفة (مثال: 500 درهم)" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-white" />
          <button onClick={() => {if(quoteText) { setActiveMode('stamp'); setCurrentStamp("💰 " + quoteText); }}} className="bg-emerald-600 text-white rounded-lg p-2 text-xs font-bold hover:bg-emerald-500">💰 إضافة السعر للشاشة</button>
        </div>
      </div>
    </>
  );

  const renderSharedDrawingTools = () => (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/90 border border-slate-700 rounded-3xl w-14 hover:w-16 overflow-hidden shadow-2xl transition-all duration-300 z-50 group flex flex-col items-center hover:p-3 hover:h-auto h-14">
      <span className="text-2xl mt-3 group-hover:hidden">🖌️</span>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full mt-2 hidden group-hover:flex flex-col gap-4 items-center">
        <button onClick={() => {setActiveMode('pen'); setDrawColor('#ef4444');}} className={`w-8 h-8 rounded-full bg-rose-500 border-2 ${drawColor === '#ef4444' && activeMode === 'pen' ? 'border-white' : 'border-transparent'}`}></button>
        <button onClick={() => {setActiveMode('pen'); setDrawColor('#22c55e');}} className={`w-8 h-8 rounded-full bg-emerald-500 border-2 ${drawColor === '#22c55e' && activeMode === 'pen' ? 'border-white' : 'border-transparent'}`}></button>
        <button onClick={() => {setActiveMode('pen'); setDrawColor('#eab308');}} className={`w-8 h-8 rounded-full bg-amber-500 border-2 ${drawColor === '#eab308' && activeMode === 'pen' ? 'border-white' : 'border-transparent'}`}></button>
        
        <div className="w-full border-t border-slate-600 my-1"></div>
        <input type="range" min="2" max="15" value={penSize} onChange={(e)=>setPenSize(e.target.value)} className="w-10 accent-blue-500" />
        <div className="w-full border-t border-slate-600 my-1"></div>
        
        <button onClick={() => {
          if(undoStack.current.length > 0) {
            let last = undoStack.current.pop();
            executeSync(last);
            channelRef.current?.send({ type: 'broadcast', event: 'sync_canvas', payload: { image_data: last } });
          } else { executeClear(); channelRef.current?.send({ type: 'broadcast', event: 'clear' }); }
        }} className="text-slate-300 hover:text-white" title="تراجع"><Undo2 className="w-6 h-6"/></button>
        
        <button onClick={() => {executeClear(); channelRef.current?.send({ type: 'broadcast', event: 'clear' });}} className="text-slate-300 hover:text-rose-500" title="مسح الكل"><Trash2 className="w-6 h-6"/></button>
        
        <button onClick={generateReport} disabled={isUploading} className="text-slate-300 hover:text-emerald-500 mt-2" title="استخراج وإرسال التقرير">
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6"/>}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`h-screen w-screen bg-black overflow-hidden flex flex-col font-sans ${isUiHidden ? 'ui-hidden' : ''}`} dir={isRtl ? 'rtl' : 'ltr'} onClick={(e) => { if(window.innerWidth <= 900 && !e.target.closest('.no-hide')) setIsUiHidden(!isUiHidden); }}>
      
      {/* 🔴 الهيدر */}
      <header className="absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center transition-transform duration-300 no-hide" style={{ transform: isUiHidden ? 'translateY(-100%)' : 'translateY(0)' }}>
        <h1 className="text-white font-black text-lg md:text-xl flex items-center gap-3">
          <Camera className="w-6 h-6 text-blue-400" />
          الزيارة الميدانية <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-md animate-pulse">LIVE</span>
        </h1>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${roomState.color === '#10b981' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : roomState.color === '#ef4444' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-amber-500/20 border-amber-500/50 text-amber-400'}`}>
          {roomState.status}
        </div>
      </header>

      {/* 🌌 مساحة العمل والكاميرات */}
      <main className="flex-1 relative w-full h-full bg-slate-900 flex justify-center items-center">
        <div ref={laserRef} className="absolute w-5 h-5 bg-rose-500/60 border-2 border-white rounded-full pointer-events-none hidden z-[100] shadow-[0_0_15px_#ef4444]"></div>
        
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover transition-transform duration-200" style={{ display: isFrozen ? 'none' : 'block' }}></video>
        
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full z-20 cursor-crosshair touch-none transition-transform duration-200" 
          style={{ display: isFrozen ? 'block' : 'none' }}
          onPointerDown={startInteraction}
          onPointerMove={moveInteraction}
          onPointerUp={stopInteraction}
          onPointerLeave={stopInteraction}
        ></canvas>

        {/* 📱 الكاميرا المحلية والأزرار */}
        <div className="absolute bottom-[100px] md:bottom-6 left-4 md:left-6 w-24 md:w-36 h-36 md:h-48 rounded-xl md:rounded-2xl border-2 border-blue-500 shadow-2xl bg-slate-800 overflow-hidden z-40 no-hide">
          <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover"></video>
          {identity.role === 'client' && (
            <>
              <button onClick={toggleTorch} className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex justify-center items-center backdrop-blur-md border border-white/20"><Flashlight className="w-4 h-4" /></button>
              <button onClick={toggleCamera} className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex justify-center items-center backdrop-blur-md border border-white/20"><Camera className="w-4 h-4" /></button>
            </>
          )}
        </div>

        {/* 🛠️ أدوات التحكم بالزوم */}
        <div className="absolute bottom-[100px] md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full no-hide">
          <input type="range" min="1" max="5" step="0.1" value={zoomLevel} onChange={handleZoom} className="w-24 md:w-32 accent-blue-500" />
        </div>

        {/* 🚀 تركيب الواجهات الذكية حسب الدور (Polymorphism) */}
        {identity.role !== 'client' && (
          <div className="no-hide">
            {identity.role === 'architect' ? renderArchitectTools() : renderProviderTools()}
            {renderSharedDrawingTools()}
          </div>
        )}
      </main>

      {/* 🛑 الشريط السفلي للتحكم */}
      <footer className="absolute bottom-0 left-0 w-full z-50 bg-slate-900/95 border-t border-slate-800 p-4 flex justify-center md:justify-between items-center gap-4 flex-wrap transition-transform duration-300 no-hide" style={{ transform: isUiHidden ? 'translateY(100%)' : 'translateY(0)' }}>
        <button onClick={endCall} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 md:py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg">
          <Phone className="w-4 h-4 rotate-135" /> إنهاء الزيارة
        </button>
        
        {identity.role !== 'client' && (
          <button onClick={toggleFreeze} className={`flex-1 md:flex-none font-bold py-3 md:py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg transition-colors ${isFrozen ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            {isFrozen ? <Maximize className="w-4 h-4" /> : <MousePointer2 className="w-4 h-4" />}
            {isFrozen ? 'استئناف الفيديو' : 'تجميد الشاشة للرسم'}
          </button>
        )}
      </footer>

    </div>
  );
}