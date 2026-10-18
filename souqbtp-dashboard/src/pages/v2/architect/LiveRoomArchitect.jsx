import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
Camera, FlipHorizontal, Pencil, Eraser, RotateCcw, Sliders, Sparkles, X, Layers, Check, Volume2, VolumeX, AlertCircle, Loader2, Maximize2
} from 'lucide-react';
import useArchitectStore from '../../../store/useArchitectStore';

// Multilingual Translations Object
const translations = {
en: {
title: 'Live Room Architect',
liveFeed: 'Live Video Feed',
captureSnapshot: 'Capture Snapshot',
switchCamera: 'Switch Camera',
drawTool: 'Draw Mask',
eraseTool: 'Eraser',
clearCanvas: 'Clear Draw',
opacityControl: 'Ghost Opacity',
promptPlaceholder: 'Describe your architectural or interior changes (e.g., modern Scandinavian living room with oak paneling)...',
renderAi: 'Generate AI Render',
rendering: 'Rendering Space...',
subscriptionRequired: 'PRO or Enterprise plan required for Live Architect Mode.',
upgradePlan: 'Upgrade Plan',
closeSession: 'Exit Studio',
cameraError: 'Unable to access camera feed. Please check permissions.',
renderError: 'Render failed. Please try again.',
ghostOverlay: 'Ghost Reference',
brushSize: 'Size',
},
fr: {
title: "Architecte d'Intérieur en Direct",
liveFeed: 'Flux Vidéo en Direct',
captureSnapshot: 'Prendre une Capture',
switchCamera: 'Changer de Caméra',
drawTool: 'Dessiner le Masque',
eraseTool: 'Gomme',
clearCanvas: 'Effacer tout',
opacityControl: 'Opacité du Fantôme',
promptPlaceholder: 'Décrivez vos modifications architecturales (ex: salon scandinave moderne avec panneaux en chêne)...',
renderAi: 'Générer le Rendu IA',
rendering: 'Rendu en cours...',
subscriptionRequired: 'Plan PRO ou Enterprise requis pour le mode Architecte en Direct.',
upgradePlan: 'Changer de Plan',
closeSession: 'Quitter le Studio',
cameraError: "Impossible d'accéder à la caméra. Vérifiez les autorisations.",
renderError: 'Échec du rendu. Veuillez réessayer.',
ghostOverlay: 'Référence Fantôme',
brushSize: 'Taille',
},
ar: {
title: 'المعماري المباشر للمساحات',
liveFeed: 'البث المباشر للكاميرا',
captureSnapshot: 'التقاط صورة',
switchCamera: 'تبديل الكاميرا',
drawTool: 'رسم القناع',
eraseTool: 'ممحاة',
clearCanvas: 'مسح الرسم',
opacityControl: 'شفافية الشبح',
promptPlaceholder: 'صف التغييرات المعمارية أو الداخلية (مثال: غرفة معيشة إسكندنافية حديثة مع أผواح خشب البلوط)...',
renderAi: 'توليد التصميم بالذكاء الاصطناعي',
rendering: 'جاري التوليد...',
subscriptionRequired: 'اشتراط باقة PRO أو Enterprise لاستخدام الوضع المباشر.',
upgradePlan: 'ترقية الاشتراك',
closeSession: 'إغلاق الاستوديو',
cameraError: 'تعذر الوصول إلى الكاميرا. يرجى التحقق من الأذونات.',
renderError: 'فشل التوليد. يرجى المحاولة مرة أخرى.',
ghostOverlay: 'الصورة المرجعية',
brushSize: 'الحجم',
}
};

export default function LiveRoomArchitect() {
const [searchParams] = useSearchParams();
const navigate = useNavigate();

// URL Params & Store Integration
const conversationId = searchParams.get('cid');

const lang = searchParams.get('lang') || 'en'
;
const isRtl = lang === 'ar';

const { architectProfile: profile } = useArchitectStore();

// Subscription Gate Check
const currentPlan = profile?.subscription_plan?.toLowerCase() || 'free';
const hasAccess = ['pro', 'enterprise', 'studio'].includes(currentPlan);

// Element Refs
const videoRef = useRef(null);
const canvasRef = useRef(null);
const containerRef = useRef(null);

// State Management
const [stream, setStream] = useState(null);
const [facingMode, setFacingMode] = useState('environment');
const [isDrawing, setIsDrawing] = useState(false);
const [activeTool, setActiveTool] = useState('draw'); // 'draw' | 'erase'
const [brushSize, setBrushSize] = useState(24);
const [ghostOpacity, setGhostOpacity] = useState(0.5);
const [capturedImage, setCapturedImage] = useState(null);
const [renderedImage, setRenderedImage] = useState(null);
const [promptText, setPromptText] = useState('');
const [isProcessing, setIsProcessing] = useState(false);
const [errorMessage, setErrorMessage] = useState('');

// 1. WebRTC Camera Initialization
const initCamera = useCallback(async () => {
try {
if (stream) {
stream.getTracks().forEach(track => track.stop());
}
const newStream = await navigator.mediaDevices.getUserMedia({
video: {
facingMode: facingMode,
width: { ideal: 1920 },
height: { ideal: 1080 }
},
audio: false
});
setStream(newStream);
if (videoRef.current) {
videoRef.current.srcObject = newStream;
}
setErrorMessage('');
} catch (err) {
console.error('Camera Access Error:', err);
setErrorMessage(t.cameraError);
}
}, [facingMode, t.cameraError]);

useEffect(() => {
if (hasAccess) {
initCamera();
}
return () => {
if (stream) {
stream.getTracks().forEach(track => track.stop());
}
};
}, [facingMode, hasAccess]);

// Handle Resize for Canvas Matching
useEffect(() => {
const handleResize = () => {
if (canvasRef.current && containerRef.current) {
canvasRef.current.width = containerRef.current.clientWidth;
canvasRef.current.height = containerRef.current.clientHeight;
}
};
handleResize();
window.addEventListener('resize', handleResize);
return () => window.removeEventListener('resize', handleResize);
}, []);

// --- WebRTC Signaling Logic ---
useEffect(() => {
  if (mode === 'simulator' || !conversationId) return;

  const signalingChannel = supabase.channel(`live_room_${conversationId}`);
  const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  // ربط الكاميرا المحلية بالاتصال
  if (stream) {
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  } else {
    peerConnection.addTransceiver('video', { direction: 'recvonly' });
  }

  // استقبال فيديو العميل
  peerConnection.ontrack = e => {
    if (videoRef.current && videoRef.current.srcObject !== e.streams[0]) {
      videoRef.current.srcObject = e.streams[0];
    }
  };

  // إعداد قنوات الاتصال
  signalingChannel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
    if (payload.sender !== 'architect') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      signalingChannel.send({ type: 'broadcast', event: 'answer', payload: { answer, sender: 'architect' } });
    }
  });

  signalingChannel.subscribe();

  return () => {
    peerConnection.close();
    supabase.removeChannel(signalingChannel);
  };
}, [conversationId, mode, stream]);

// 2. Interactive Canvas Drawing Handlers
const startDrawing = (e) => {
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext('2d');
const rect = canvas.getBoundingClientRect();
const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;ctx.beginPath();

ctx.moveTo(x, y);

setIsDrawing(true);

};

const draw = (e) => {
  if (!isDrawing || !canvasRef.current) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (activeTool === 'erase') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'; 
    // دعم أدوات الرسم المختلفة
    if (activeTool === 'rect') {
      ctx.strokeRect(x - 50, y - 50, 100, 100);
    } else if (activeTool === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
};

const stopDrawing = () => {
setIsDrawing(false);
};

const clearCanvas = () => {
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// 3. Snapshot Capture
const captureFrame = () => {
if (!videoRef.current) return;
const video = videoRef.current;
const tempCanvas = document.createElement('canvas');
tempCanvas.width = video.videoWidth || 1280;
tempCanvas.height = video.videoHeight || 720;
const ctx = tempCanvas.getContext('2d');
ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
const dataUrl = tempCanvas.toDataURL('image/png');
setCapturedImage(dataUrl);
};

// 4. AI Render Generation Handler
const handleRender = async () => {
if (!promptText.trim()) return;setIsProcessing(true);

setErrorMessage('');
try {

  // Capture base video frame
  captureFrame();

  // Export Mask Canvas
  const maskDataUrl = canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;

  // Extract raw snapshot from current frame or last captured state
  const video = videoRef.current;
  const snapCanvas = document.createElement('canvas');
  snapCanvas.width = video.videoWidth || 1280;
  snapCanvas.height = video.videoHeight || 720;
  const ctx = snapCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
  const baseImageData = snapCanvas.toDataURL('image/png');
  const payload = {
    conversation_id: conversationId,
    image: baseImageData,
    mask: maskDataUrl,
    prompt: promptText
  };

  const result = await generateLiveRender(payload);
  if (result && result.imageUrl) {
    setRenderedImage(result.imageUrl);
  } else if (result && typeof result === 'string') {
    setRenderedImage(result);
  } else {
    throw new Error('Invalid response structure');
  }
} catch (err) {
  console.error('Render Processing Error:', err);
  setErrorMessage(t.renderError);
} finally {
  setIsProcessing(false);
}
};

// Toggle Camera Front/Back
const toggleCamera = () => {
setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
};

// Access Denied Screen
if (!hasAccess) {
return (
<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6" dir={isRtl ? 'rtl' : 'ltr'}>
  <h1 className="text-2xl font-semibold">{t.subscriptionRequired}</h1>
  <p className="mt-3 max-w-md text-center text-slate-300">
    Access to live WebRTC spatial overlay and real-time AI canvas transformation requires an upgraded plan.
  </p>
  <div className="mt-6 flex flex-wrap justify-center gap-3">
    <button
      onClick={() => window.close()}
      className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-medium transition"
    >
      {t.closeSession}
    </button>
    <button
      onClick={() => navigate('/settings/billing')}
      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/20"
    >
      {t.upgradePlan}
    </button>
  </div>
</div>

);
}

return (
<div
className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col font-sans select-none"
dir={isRtl ? 'rtl' : 'ltr'}
>
{/* Top Floating Control Bar */}

<header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
  <div className="flex flex-col">
    <h1 className="text-lg font-semibold text-white">{t.title}</h1>
    {conversationId && (
      <span className="text-xs text-slate-400">ID: {conversationId.slice(0, 8)}</span>
    )}
  </div>

    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <button
        onClick={toggleCamera}
        className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 transition backdrop-blur-md"
        title={t.switchCamera}
      >
        <FlipHorizontal className="w-5 h-5" />
      </button>

      <button
        onClick={() => window.close()}
        className="p-2.5 rounded-full bg-slate-900/80 hover:bg-red-950/80 text-slate-300 hover:text-red-400 border border-slate-700/60 hover:border-red-900/80 transition backdrop-blur-md"
        title={t.closeSession}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </header>

  {/* Main Viewport Workspace */}
  <main ref={containerRef} className="relative flex-1 w-full h-full bg-black overflow-hidden">

    {/* Live Video Feed */}
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="absolute inset-0 w-full h-full object-cover"
    />

    {/* AI Rendered Overlay (Ghost Layer) */}
    {renderedImage && (
      <img
        src={renderedImage}
        alt="AI Render Overlay"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150 pointer-events-none"
        style={{ opacity: ghostOpacity }}
      />
    )}

    {/* Interactive Drawing Canvas Overlay */}
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
    />

    {/* Error Notification Toast */}
    {errorMessage && (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-red-900/90 border border-red-500 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm backdrop-blur-md">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMessage}</span>
      </div>
    )}
  </main>

  {/* Toolbar Sidebar / Floating Control Bar */}
  <div className="absolute top-20 left-4 z-20 flex flex-col gap-2 bg-slate-900/85 border border-slate-800 p-2 rounded-2xl backdrop-blur-md shadow-2xl">
    <button
      onClick={() => setActiveTool('draw')}
      className={`p-3 rounded-xl transition flex items-center justify-center ${
        activeTool === 'draw' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
      title={t.drawTool}
    >
      <Pencil className="w-5 h-5" />
    </button>

    <button
      onClick={() => setActiveTool('erase')}
      className={`p-3 rounded-xl transition flex items-center justify-center ${
        activeTool === 'erase' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
      title={t.eraseTool}
    >
      <Eraser className="w-5 h-5" />
    </button>

    <button
      onClick={clearCanvas}
      className="p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition flex items-center justify-center"
      title={t.clearCanvas}
    >
      <RotateCcw className="w-5 h-5" />
    </button>

    <hr className="border-slate-800 my-1" />

    {/* Brush Size Adjustment */}
    <div className="p-2 flex flex-col items-center gap-2">
      <span className="text-[10px] text-slate-400 font-medium">{t.brushSize}</span>
      <input
        type="range"
        min="4"
        max="64"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        className="w-16 accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
      />
    </div>
  </div>

  {/* Bottom Floating Prompt & Execution Bar */}
  <footer className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-xs">
    <div className="max-w-4xl mx-auto flex flex-col gap-3">

      {/* Render Controls & Ghost Slider (If Overlay Exists) */}
      {renderedImage && (
        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl backdrop-blur-md">
          <Layers className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium shrink-0">{t.opacityControl}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={ghostOpacity}
            onChange={(e) => setGhostOpacity(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
          />
          <span className="text-xs font-mono text-slate-400 w-8 text-right">
            {Math.round(ghostOpacity * 100)}%
          </span>
        </div>
      )}

      {/* Prompt Entry & Render Button */}
      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-2xl backdrop-blur-md">
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder={t.promptPlaceholder}
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleRender()}
        />
        <button
          onClick={handleRender}
          disabled={isProcessing || !promptText.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-600/30 shrink-0"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.rendering}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{t.renderAi}</span>
            </>
          )}
        </button>
      </div>
    </div>
  </footer>
</div>
);
}