import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import useSettingsStore from '../../../store/useSettingsStore';

const SAMPLE_AI_RENDER_RESULT = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const translations = {
  ar: {
    archHeader: '📐 المكتب الهندسي',
    provHeader: '📹 الزيارة الميدانية التفاعلية',
    connecting: '⏳ جاري الاتصال بالطرف الآخر...',
    connected: '🟢 متصل ومباشر',
    disconnected: '🔴 الاتصال مقطوع',
    endSession: '☎️ إنهاء الجلسة',
    endVisit: '☎️ إنهاء الزيارة',
    freezeAudit: '❄️ تجميد الشاشة للتدقيق',
    freezeDraw: '❄️ تجميد الشاشة للرسم',
    resumeVideo: '▶️ استئناف الفيديو',
    startRecord: '⏺️ بدء تسجيل الجلسة',
    stopRecord: '⏹️ إيقاف التسجيل (جاري التسجيل 🔴)',
    recordLocked: '⏺️ تسجيل الجلسة 🔒',
    exportPdf: '📄 استخراج تقرير PDF',
    exportPdfLocked: '📄 استخراج تقرير PDF 🔒',
    docFieldFile: '📁 توثيق ملف ميداني',
    sendReportClient: '📸 إرسال التقرير للعميل',
    vaultTitle: '📂 خزانة ملفات العميل',
    aiModalTitle: '✨ نتيجة الواقع المستقبلي',
    closeModal: 'إغلاق النافذة',
    boqTitle: '🧮 حساب الكميات التقديري',
    closeBoq: 'إغلاق الحساب'
  },
  fr: {
    archHeader: '📐 Bureau d\'Architecture',
    provHeader: '📹 Visite Terrain Interactive',
    connecting: '⏳ Connexion au correspondant...',
    connected: '🟢 Connecté en direct',
    disconnected: '🔴 Connexion perdue',
    endSession: '☎️ Quitter la session',
    endVisit: '☎️ Terminer la visite',
    freezeAudit: '❄️ Figer l\'écran (Audit)',
    freezeDraw: '❄️ Figer pour dessiner',
    resumeVideo: '▶️ Reprendre la vidéo',
    startRecord: '⏺️ Enregistrer la session',
    stopRecord: '⏹️ Arrêter l\'enregistrement 🔴',
    recordLocked: '⏺️ Enregistrement 🔒',
    exportPdf: '📄 Exporter Rapport PDF',
    exportPdfLocked: '📄 Rapport PDF 🔒',
    docFieldFile: '📁 Joindre fichier terrain',
    sendReportClient: '📸 Envoyer rapport au client',
    vaultTitle: '📂 Coffre-fort Plans Client',
    aiModalTitle: '✨ Rendu IA Futuriste',
    closeModal: 'Fermer la fenêtre',
    boqTitle: '🧮 Estimation Quantités (BOQ)',
    closeBoq: 'Fermer le calcul'
  },
  en: {
    archHeader: '📐 Engineering Office',
    provHeader: '📹 Interactive Field Visit',
    connecting: '⏳ Connecting to peer...',
    connected: '🟢 Connected Live',
    disconnected: '🔴 Disconnected',
    endSession: '☎️ End Session',
    endVisit: '☎️ End Visit',
    freezeAudit: '❄️ Freeze Screen to Inspect',
    freezeDraw: '❄️ Freeze Screen to Draw',
    resumeVideo: '▶️ Resume Video',
    startRecord: '⏺️ Start Recording',
    stopRecord: '⏹️ Stop Recording 🔴',
    recordLocked: '⏺️ Record Session 🔒',
    exportPdf: '📄 Export PDF Report',
    exportPdfLocked: '📄 Export PDF 🔒',
    docFieldFile: '📁 Upload Field File',
    sendReportClient: '📸 Send Report to Client',
    vaultTitle: '📂 Client Blueprint Vault',
    aiModalTitle: '✨ AI Future Render Result',
    closeModal: 'Close Window',
    boqTitle: '🧮 Estimated BOQ Quantities',
    closeBoq: 'Close Panel'
  }
};

export default function LiveRoom() {
  const { cid } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language = 'ar' } = useSettingsStore();

  const isRtl = language === 'ar';
  const t = translations[language] || translations.ar;

  const roomId = cid || searchParams.get('cid') || '0';
  const urlRoleHint = searchParams.get('type');

  const [roleInfo, setRoleInfo] = useState({
    loading: true,
    role: 'client', // 'architect' | 'provider' | 'client'
    plan: 'basic',
    uid: '',
    trackId: ''
  });

  const initializedRef = useRef(false);

  // 1. الكشف الدقيق عن هوية الداخل للغرفة وباقته مباشرة من Supabase
  useEffect(() => {
    const resolveRoomIdentity = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const isArchitectPath = window.location.pathname.includes('architect') || urlRoleHint === 'architect';
        const isProviderHint = urlRoleHint === 'provider';

        if (user) {
          if (isArchitectPath) {
            const { data: archData } = await supabase
              .from('architects')
              .select('id, subscription_plan, user_id')
              .eq('user_id', user.id)
              .maybeSingle();

            if (archData) {
              setRoleInfo({
                loading: false,
                role: 'architect',
                plan: archData.subscription_plan?.toLowerCase() || 'basic',
                uid: user.id,
                trackId: String(archData.id)
              });
              return;
            }
          }

          if (isProviderHint) {
            const { data: provData } = await supabase
              .from('providers')
              .select('id, user_id')
              .eq('user_id', user.id)
              .maybeSingle();

            if (provData) {
              setRoleInfo({
                loading: false,
                role: 'provider',
                plan: 'pro',
                uid: user.id,
                trackId: String(provData.id)
              });
              return;
            }
          }

          const { data: archCheck } = await supabase
            .from('architects')
            .select('id, subscription_plan, user_id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (archCheck) {
            setRoleInfo({
              loading: false,
              role: 'architect',
              plan: archCheck.subscription_plan?.toLowerCase() || 'basic',
              uid: user.id,
              trackId: String(archCheck.id)
            });
            return;
          }

          const { data: provCheck } = await supabase
            .from('providers')
            .select('id, user_id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (provCheck) {
            setRoleInfo({
              loading: false,
              role: 'provider',
              plan: 'pro',
              uid: user.id,
              trackId: String(provCheck.id)
            });
            return;
          }

          setRoleInfo({
            loading: false,
            role: 'client',
            plan: 'basic',
            uid: user.id,
            trackId: user.id
          });
        } else {
          setRoleInfo({
            loading: false,
            role: isArchitectPath ? 'architect' : isProviderHint ? 'provider' : 'client',
            plan: 'basic',
            uid: '',
            trackId: ''
          });
        }
      } catch (err) {
        console.error('Identity check error:', err);
        setRoleInfo(prev => ({ ...prev, loading: false }));
      }
    };

    resolveRoomIdentity();
  }, [urlRoleHint]);

  const myRole = roleInfo.role;
  const roomPlan = roleInfo.plan;
  const architectUserId = roleInfo.uid;

  useEffect(() => {
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    window.__ARCHITECT_PLAN__ = roomPlan;
    window.__ARCHITECT_UID__ = architectUserId;
    window.__ROOM_ROLE__ = myRole;
  }, [roomPlan, architectUserId, myRole]);

  // 2. تشغيل المحرك الشامل للغرفة بعد تحديد الهوية
  useEffect(() => {
    if (roleInfo.loading || initializedRef.current) return;
    initializedRef.current = true;

    const signalingChannel = supabase.channel(`live_room_${roomId}`);

    let localStream = null;
    let peerConnection = null;
    let isFrozen = false;
    let isDrawing = false;
    let useFrontCamera = myRole !== 'client';
    let isRecording = false;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isOffering = false;

    let currentMode = 'pen';
    let drawColor = myRole === 'architect' ? '#38bdf8' : '#ef4444';
    let currentPenSize = 4;
    let isSmartMode = false;
    let currentStamp = '';
    let startX = 0, startY = 0, lastX = 0, lastY = 0, snapshot = null;
    let undoStack = [];
    let currentZoom = 1;

    let measureMode = null;
    let calibrationFactor = null;
    let measureStartPoint = null;

    let ghostX = 0, ghostY = 0, ghostRotation = 0, isGhostDragging = false;
    let projectLayers = [];
    let currentLayerIndex = -1;
    window.uploadedBlueprint = null;

    let isRulerDragging = false;
    let rulerOffset = { x: 0, y: 0 };

    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const freezeCanvas = document.getElementById('freezeCanvas');
    const fCtx = freezeCanvas.getContext('2d');
    const remoteVideo = document.getElementById('remoteVideo');
    const ghostContainer = document.getElementById('ghostContainer');
    const ghostImg = document.getElementById('ghostImage');
    const ruler = document.getElementById('slidingRuler');

    window.showToast = function (m, type = 'info') {
      const c = document.getElementById('toast-container');
      if (c) {
        const toastEl = document.createElement('div');
        toastEl.className = `toast ${type}`;
        let icon = '💡';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';
        toastEl.innerHTML = `<span style="font-size:1.2rem;">${icon}</span> <span>${m}</span>`;
        c.appendChild(toastEl);
        setTimeout(() => {
          toastEl.classList.add('fade-out');
          setTimeout(() => toastEl.remove(), 400);
        }, 3200);
      }
    };

    async function init() {
      try {
        const unlockMedia = () => {
          if (remoteVideo && remoteVideo.paused) remoteVideo.play().catch(() => {});
          document.removeEventListener('click', unlockMedia);
          document.removeEventListener('touchstart', unlockMedia);
        };
        document.addEventListener('click', unlockMedia, { once: true });
        document.addEventListener('touchstart', unlockMedia, { once: true });

        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: useFrontCamera ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: { echoCancellation: true, noiseSuppression: true }
          });
          const localVid = document.getElementById('localVideo');
          if (localVid) {
            localVid.muted = true;
            localVid.srcObject = localStream;
            localVid.play().catch(() => {});
          }
        } catch (camError) {
          try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const localVid = document.getElementById('localVideo');
            if (localVid) {
              localVid.muted = true;
              localVid.srcObject = localStream;
              localVid.play().catch(() => {});
            }
          } catch (e2) {
            window.showToast('⚠️ لم نتمكن من تشغيل كاميرتك، لكنك ستستقبل البث.', 'warning');
            localStream = null;
          }
        }

        peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        if (localStream) {
          localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        } else {
          peerConnection.addTransceiver('video', { direction: 'recvonly' });
          peerConnection.addTransceiver('audio', { direction: 'recvonly' });
        }

        peerConnection.ontrack = e => {
          if (remoteVideo && remoteVideo.srcObject !== e.streams[0]) {
            remoteVideo.srcObject = e.streams[0];
            remoteVideo.play().catch(() => {
              window.showToast('🔊 المس الشاشة لتفعيل الصوت', 'warning');
            });
          }
          const statusBtn = document.getElementById('connection-status');
          if (statusBtn) {
            statusBtn.innerHTML = t.connected;
            statusBtn.style.background = 'rgba(16, 185, 129, 0.2)';
            statusBtn.style.color = '#10b981';
          }
        };

        peerConnection.onconnectionstatechange = () => {
          const statusBtn = document.getElementById('connection-status');
          if (
            statusBtn &&
            (peerConnection.connectionState === 'disconnected' ||
              peerConnection.connectionState === 'failed')
          ) {
            statusBtn.innerHTML = t.disconnected;
            statusBtn.style.background = 'rgba(239, 68, 68, 0.2)';
            statusBtn.style.color = '#ef4444';
            isOffering = false;
          }
        };

        peerConnection.onicecandidate = e => {
          if (e.candidate) {
            signalingChannel.send({
              type: 'broadcast',
              event: 'ice',
              payload: { candidate: e.candidate, sender: myRole }
            });
          }
        };

        signalingChannel.on('broadcast', { event: 'ice' }, async ({ payload }) => {
          if (payload.candidate && payload.sender !== myRole) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
          }
        });

        const sendOfferSafe = async () => {
          if (isOffering) return;
          isOffering = true;
          try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            signalingChannel.send({
              type: 'broadcast',
              event: 'offer',
              payload: { offer: peerConnection.localDescription, sender: myRole }
            });
          } catch (err) {
            isOffering = false;
          }
        };

        signalingChannel.on('broadcast', { event: 'architect_joined' }, () => {
          if (myRole !== 'architect') sendOfferSafe();
        });

        signalingChannel.on('broadcast', { event: 'room_ping' }, ({ payload }) => {
          if (payload && payload.sender !== myRole) sendOfferSafe();
        });

        signalingChannel.on('broadcast', { event: 'client_joined' }, () => {
          if (myRole === 'architect') signalingChannel.send({ type: 'broadcast', event: 'architect_joined' });
          else sendOfferSafe();
        });

        signalingChannel.on('broadcast', { event: 'client_ping' }, () => {
          if (myRole === 'architect') signalingChannel.send({ type: 'broadcast', event: 'architect_joined' });
          else sendOfferSafe();
        });

        signalingChannel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
          if (payload.sender !== myRole) {
            try {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
              const answer = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answer);
              signalingChannel.send({
                type: 'broadcast',
                event: 'answer',
                payload: { answer, sender: myRole }
              });
            } catch (e) {
              console.error('Offer error', e);
            }
          }
        });

        signalingChannel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (payload.sender !== myRole) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer)).catch(() => {});
          }
        });

        signalingChannel.on('broadcast', { event: 'freeze_action' }, ({ payload }) => {
          window.applyFreezeState(payload.state, false);
        });

        signalingChannel.on('broadcast', { event: 'draw_action' }, ({ payload }) => {
          executeRemoteDraw(payload);
        });

        signalingChannel.on('broadcast', { event: 'stamp_action' }, ({ payload }) => {
          executeStamp(payload);
        });

        signalingChannel.on('broadcast', { event: 'clear_action' }, () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          undoStack = [];
        });

        signalingChannel.on('broadcast', { event: 'sync_canvas' }, ({ payload }) => {
          if (payload?.image_data) {
            const img = new Image();
            img.src = payload.image_data;
            img.onload = () => {
              canvas.width = remoteVideo.clientWidth || window.innerWidth;
              canvas.height = remoteVideo.clientHeight || window.innerHeight;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              canvas.style.display = 'block';
            };
          }
        });

        signalingChannel.on('broadcast', { event: 'external_file_action' }, ({ payload }) => {
          if (payload?.image_src) {
            const img = new Image();
            img.src = payload.image_src;
            img.onload = () => {
              if (!isFrozen) window.applyFreezeState(true, false);
              window.uploadedBlueprint = img;
            };
          }
        });

        signalingChannel.on('broadcast', { event: 'zoom_change' }, ({ payload }) => {
          if (payload?.level) {
            const z = payload.level;
            remoteVideo.style.transform = `scale(${z})`;
            freezeCanvas.style.transform = `scale(${z})`;
            canvas.style.transform = `scale(${z})`;
            remoteVideo.style.transformOrigin = 'center center';
            freezeCanvas.style.transformOrigin = 'center center';
            canvas.style.transformOrigin = 'center center';
          }
        });

        signalingChannel.on('broadcast', { event: 'laser_move' }, ({ payload }) => {
          const laser = document.getElementById('laserPointer');
          if (laser && payload) {
            laser.style.display = 'block';
            const w = canvas.clientWidth || window.innerWidth;
            const h = canvas.clientHeight || window.innerHeight;
            laser.style.left = payload.x * w + 'px';
            laser.style.top = payload.y * h + 'px';
            clearTimeout(window.laserTimeout);
            window.laserTimeout = setTimeout(() => {
              laser.style.display = 'none';
            }, 1000);
          }
        });

        signalingChannel.subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            if (myRole === 'architect') {
              signalingChannel.send({ type: 'broadcast', event: 'architect_joined' });
            } else {
              signalingChannel.send({ type: 'broadcast', event: 'client_ping' });
              signalingChannel.send({ type: 'broadcast', event: 'room_ping', payload: { sender: myRole } });
            }
          }
        });
      } catch (fatalError) {
        console.error('Critical WebRTC Error:', fatalError);
      }
    }

    window.toggleCamera = async function () {
      useFrontCamera = !useFrontCamera;
      const targetFacingMode = useFrontCamera ? 'user' : 'environment';
      try {
        if (localStream) {
          localStream.getVideoTracks().forEach(track => {
            track.stop();
            localStream.removeTrack(track);
          });
        } else {
          localStream = new MediaStream();
        }
        let newStream;
        try {
          newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: targetFacingMode } }, audio: false });
        } catch (e) {
          newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: targetFacingMode } }, audio: false });
        }
        const newVideoTrack = newStream.getVideoTracks()[0];
        localStream.addTrack(newVideoTrack);
        const videoEl = document.getElementById('localVideo');
        if (videoEl) {
          videoEl.srcObject = localStream;
          videoEl.play().catch(() => {});
        }
        if (peerConnection) {
          const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(newVideoTrack);
          else peerConnection.addTrack(newVideoTrack, localStream);
        }
      } catch (error) {
        window.showToast('❌ لا يمكن تبديل الكاميرا في هذا الجهاز', 'error');
        useFrontCamera = !useFrontCamera;
      }
    };

    window.toggleTorch = async function () {
      if (!localStream) return window.showToast('⚠️ الكاميرا غير مفعلة', 'warning');
      const track = localStream.getVideoTracks()[0];
      try {
        const capabilities = track.getCapabilities();
        if (!capabilities.torch) return window.showToast('⚠️ جهازك لا يدعم تشغيل الفلاش', 'warning');
        const isTorchOn = track.getSettings().torch || false;
        await track.applyConstraints({ advanced: [{ torch: !isTorchOn }] });
        window.showToast(!isTorchOn ? '💡 تم تشغيل الفلاش' : 'تم إطفاء الفلاش', 'success');
      } catch (e) {
        window.showToast('❌ خطأ أثناء تشغيل الفلاش', 'error');
      }
    };

    window.changeZoom = function (newZoom) {
      if (typeof newZoom !== 'number') return;
      currentZoom = Math.min(Math.max(1, newZoom), 5);
      const slider = document.getElementById('zoomSlider');
      if (slider) slider.value = currentZoom;
      remoteVideo.style.transform = `scale(${currentZoom})`;
      freezeCanvas.style.transform = `scale(${currentZoom})`;
      canvas.style.transform = `scale(${currentZoom})`;
      remoteVideo.style.transformOrigin = 'center center';
      freezeCanvas.style.transformOrigin = 'center center';
      canvas.style.transformOrigin = 'center center';
      signalingChannel.send({ type: 'broadcast', event: 'zoom_change', payload: { level: currentZoom } });
    };

    window.toggleRuler = function () {
      if (!ruler) return;
      ruler.style.display = ruler.style.display === 'block' ? 'none' : 'block';
    };

    window.startRulerDrag = function (e) {
      if (!ruler) return;
      isRulerDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      rulerOffset.x = clientX - ruler.offsetLeft;
      rulerOffset.y = clientY - ruler.offsetTop;
    };

    document.addEventListener('mousemove', e => {
      if (!isRulerDragging || !ruler) return;
      ruler.style.left = e.clientX - rulerOffset.x + 'px';
      ruler.style.top = e.clientY - rulerOffset.y + 'px';
    });
    document.addEventListener('touchmove', e => {
      if (!isRulerDragging || !ruler) return;
      ruler.style.left = e.touches[0].clientX - rulerOffset.x + 'px';
      ruler.style.top = e.touches[0].clientY - rulerOffset.y + 'px';
    }, { passive: false });
    document.addEventListener('mouseup', () => { isRulerDragging = false; });
    document.addEventListener('touchend', () => { isRulerDragging = false; });

    window.setMeasureMode = (mode, btn) => {
      if (!isFrozen) {
        window.showToast('⚠️ يجب تجميد الشاشة للقياس!', 'error');
        return;
      }
      measureMode = mode;
      currentMode = 'measure';
      document.querySelectorAll('.btn-vip, .quote-btn').forEach(b => (b.style.borderColor = 'rgba(255,255,255,0.1)'));
      if (btn) btn.style.borderColor = '#38bdf8';
      const status = document.getElementById('measureStatus') || document.getElementById('measureResult');
      if (status) {
        status.style.display = 'block';
        status.innerText =
          mode === 'calibrate'
            ? '🎯 ارسم خطاً فوق عنصر طوله 10سم للمعايرة'
            : mode === 'area'
            ? '🤖 ارسم خطاً لحساب المساحة والكميات'
            : '📏 ارسم خطاً لقياس أي مسافة';
      }
    };

    function calculateBOQ(meters) {
      const panel = document.getElementById('boq-panel');
      const resultDiv = document.getElementById('boq-result');
      const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
      const activeRole = window.__ROOM_ROLE__;

      const height = 3;
      const area = (meters * height).toFixed(2);
      const bricks = Math.round(area * 60);
      const cement = (area * 0.55).toFixed(1);
      const sand = (area * 0.07).toFixed(2);
      const gravel = (area * 0.03).toFixed(2);
      const steel = (area * 2.5).toFixed(1);
      const tiles = (area * 1.05).toFixed(1);
      const putty = (area * 1.2).toFixed(1);
      const paint = (area / 7).toFixed(1);
      const water = (area * 15).toFixed(0);

      const provMeasureRes = document.getElementById('measureResult');
      if (provMeasureRes) {
        provMeasureRes.innerHTML = `📐 المساحة: ${area} m² | 🧱 ${bricks} آجور | 🌑 ${cement} إسمنت`;
      }

      if (!panel || !resultDiv) return;
      panel.style.display = 'block';

      if (currentPlan === 'vip' || activeRole === 'provider') {
        resultDiv.innerHTML = `
          <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:10px; margin-bottom:15px; border-right:4px solid var(--vip-purple);">
            <span style="color:#94a3b8; font-size:0.8rem;">إجمالي مساحة العمل:</span><br>
            <b style="color:white; font-size:1.4rem;">${area} m²</b>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div class="boq-item-v2">🧱 <b>${bricks}</b> حبة آجور</div>
            <div class="boq-item-v2">🌑 <b>${cement}</b> كيس إسمنت</div>
            <div class="boq-item-v2">⏳ <b>${sand}</b> م³ رمل</div>
            <div class="boq-item-v2">🪨 <b>${gravel}</b> م³ حصى</div>
            <div class="boq-item-v2">🏗️ <b>${steel}</b> كجم حديد</div>
            <div class="boq-item-v2" style="border-color:#10b981;">💎 <b>${tiles}</b> م² زليج</div>
            <div class="boq-item-v2" style="border-color:#10b981;">☁️ <b>${putty}</b> كجم لاندوي</div>
            <div class="boq-item-v2" style="border-color:#10b981;">🎨 <b>${paint}</b> لتر صباغة</div>
            <div class="boq-item-v2" style="border-color:#38bdf8;">💧 <b>${water}</b> لتر ماء</div>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div style="text-align:center; padding:15px; background:rgba(0,0,0,0.3); border-radius:12px; border:1px dashed #fbbf24;">
            <span style="display:block; color:#fbbf24; font-weight:bold; font-size:0.85rem;">🔒 كشف الكميات التفصيلي (Elite Only)</span>
          </div>
        `;
      }
    }

    function handleMeasureLogic(pos) {
      if (!measureStartPoint) {
        measureStartPoint = pos;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      } else {
        const distPx = Math.sqrt(Math.pow(pos.x - measureStartPoint.x, 2) + Math.pow(pos.y - measureStartPoint.y, 2));
        if (measureMode === 'calibrate') {
          calibrationFactor = distPx / 10;
          window.showToast('✅ تمت المعايرة بنجاح (10سم)', 'success');
          const status = document.getElementById('measureStatus') || document.getElementById('measureResult');
          if (status) status.innerText = '✅ المقياس مضبوط الآن';
        } else if (measureMode === 'measure' || measureMode === 'area') {
          if (!calibrationFactor) {
            window.showToast('🚨 يجب المعايرة أولاً (10سم)!', 'error');
          } else {
            const realDistCm = (distPx / calibrationFactor).toFixed(1);
            const realDistM = (realDistCm / 100).toFixed(2);
            const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
            if (currentPlan === 'vip' || measureMode === 'area' || myRole === 'provider') {
              calculateBOQ(parseFloat(realDistM));
            }
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(measureStartPoint.x, measureStartPoint.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.setLineDash([]);

            const label = realDistCm < 100 ? `${realDistCm} cm` : `${realDistM} m`;
            ctx.font = 'bold 18px Cairo';
            ctx.fillStyle = 'white';
            ctx.fillText(label, (measureStartPoint.x + pos.x) / 2, (measureStartPoint.y + pos.y) / 2 - 10);
            undoStack.push(canvas.toDataURL('image/png'));
            window.syncCanvas();
          }
        }
        measureStartPoint = null;
      }
    }

    function clearActiveButtons() {
      document.querySelectorAll('.emoji-btn, .quote-btn, .pen-btn, .tool-btn').forEach(b => b.classList.remove('active'));
    }

    window.setDrawMode = (mode, btn) => {
      currentMode = mode;
      clearActiveButtons();
      if (btn) btn.classList.add('active');
    };

    window.setPen = function (btn) {
      currentMode = 'pen';
      clearActiveButtons();
      if (btn) btn.classList.add('active');
    };

    window.setStamp = function (emoji, btn) {
      currentMode = 'stamp';
      currentStamp = emoji;
      clearActiveButtons();
      if (btn) btn.classList.add('active');
    };

    window.setStampText = function (btn) {
      const val = document.getElementById('quoteText')?.value.trim();
      if (!val) return window.showToast('اكتب السعر أولاً!', 'warning');
      currentMode = 'stamp';
      currentStamp = '🏷️ ' + val;
      clearActiveButtons();
      if (btn) btn.classList.add('active');
    };

    window.updatePenSize = function (size) { currentPenSize = parseInt(size); };

    window.toggleSmartMode = function () {
      isSmartMode = !isSmartMode;
      const btn = document.getElementById('smartModeBtn');
      if (isSmartMode) {
        if (btn) { btn.style.background = '#22c55e'; btn.style.borderColor = '#16a34a'; }
        window.showToast('الرسم المستقيم الهندسي مفعل 📐', 'success');
      } else {
        if (btn) { btn.style.background = '#1e3a8a'; btn.style.borderColor = '#38bdf8'; }
        window.showToast('الرسم الحر مفعل ✏️', 'info');
      }
    };

    window.toggleGrid = () => { canvas.classList.toggle('grid-active'); };

    window.changeColor = (color, targetEl) => {
      drawColor = color;
      document.querySelectorAll('.color-dot').forEach(d => (d.style.border = 'none'));
      if (targetEl) targetEl.style.border = '2px solid white';
    };

    function executeRemoteDraw(data) {
      ctx.beginPath();
      ctx.moveTo(data.x0 * canvas.width, data.y0 * canvas.height);
      ctx.lineTo(data.x1 * canvas.width, data.y1 * canvas.height);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size || 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.closePath();
    }

    function executeStamp(data) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (data.text.length > 2) {
        ctx.font = 'bold 20px Cairo, Arial';
        const textWidth = ctx.measureText(data.text).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(data.x * canvas.width - textWidth / 2 - 15, data.y * canvas.height - 20, textWidth + 30, 40);
        ctx.fillStyle = data.color;
        ctx.fillText(data.text, data.x * canvas.width, data.y * canvas.height);
      } else {
        ctx.font = '45px Arial';
        ctx.fillText(data.text, data.x * canvas.width, data.y * canvas.height);
      }
      ctx.restore();
    }

    function drawArrow(c, x1, y1, x2, y2) {
      const head = 15;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
      c.moveTo(x2, y2);
      c.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
      c.stroke();
    }

    const getPos = e => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    canvas.onmousedown = canvas.ontouchstart = e => {
      if (!isFrozen) return;
      const pos = getPos(e);
      if (currentMode === 'measure') { handleMeasureLogic(pos); return; }
      if (currentMode === 'stamp') {
        undoStack.push(canvas.toDataURL('image/png'));
        const stampData = { text: currentStamp, x: pos.x / canvas.width, y: pos.y / canvas.height, color: drawColor };
        executeStamp(stampData);
        signalingChannel.send({ type: 'broadcast', event: 'stamp_action', payload: stampData });
        window.syncCanvas();
        return;
      }
      if (currentMode === 'text') {
        const text = prompt('أدخل النص الهندسي هنا:');
        if (text) {
          undoStack.push(canvas.toDataURL('image/png'));
          ctx.font = 'bold 22px Cairo';
          ctx.fillStyle = drawColor;
          ctx.fillText(text, pos.x, pos.y);
          window.syncCanvas();
        }
        isDrawing = false;
        return;
      }
      startX = lastX = pos.x;
      startY = lastY = pos.y;
      isDrawing = true;
      undoStack.push(canvas.toDataURL('image/png'));
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    canvas.onmousemove = canvas.ontouchmove = e => {
      const pos = getPos(e);
      if (!isFrozen) {
        signalingChannel.send({
          type: 'broadcast',
          event: 'laser_move',
          payload: { x: pos.x / (canvas.width || window.innerWidth), y: pos.y / (canvas.height || window.innerHeight) }
        });
        return;
      }
      if (!isDrawing || currentMode === 'text' || currentMode === 'stamp') return;
      e.preventDefault();
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = currentPenSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentMode === 'pen') {
        if (isSmartMode) {
          ctx.putImageData(snapshot, 0, 0);
          let targetX = pos.x, targetY = pos.y;
          if (Math.abs(pos.x - startX) > Math.abs(pos.y - startY)) targetY = startY;
          else targetX = startX;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          signalingChannel.send({
            type: 'broadcast',
            event: 'draw_action',
            payload: { x0: lastX / canvas.width, y0: lastY / canvas.height, x1: pos.x / canvas.width, y1: pos.y / canvas.height, color: drawColor, size: currentPenSize }
          });
          lastX = pos.x;
          lastY = pos.y;
          snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        if (currentMode === 'rect') ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
        else if (currentMode === 'circle') { ctx.arc(startX, startY, Math.hypot(pos.x - startX, pos.y - startY), 0, Math.PI * 2); ctx.stroke(); }
        else if (currentMode === 'arrow') drawArrow(ctx, startX, startY, pos.x, pos.y);
      }
    };

    const stopDrawing = () => {
      if (isDrawing) { isDrawing = false; window.syncCanvas(); }
    };
    canvas.onmouseup = canvas.ontouchend = stopDrawing;

    window.applyFreezeState = (state, broadcast = true) => {
      isFrozen = state;
      const btn = document.getElementById('freezeBtn');
      if (broadcast) signalingChannel.send({ type: 'broadcast', event: 'freeze_action', payload: { state: isFrozen } });
      if (isFrozen) {
        const w = remoteVideo.clientWidth || window.innerWidth;
        const h = remoteVideo.clientHeight || window.innerHeight;
        freezeCanvas.width = canvas.width = w;
        freezeCanvas.height = canvas.height = h;
        fCtx.drawImage(remoteVideo, 0, 0, freezeCanvas.width, freezeCanvas.height);
        remoteVideo.style.display = 'none';
        freezeCanvas.style.display = 'block';
        canvas.style.display = 'block';
        if (btn) { btn.innerHTML = t.resumeVideo; btn.style.background = 'rgba(16, 185, 129, 0.85)'; }
        window.syncCanvas();
      } else {
        remoteVideo.style.display = 'block';
        freezeCanvas.style.display = 'none';
        canvas.style.display = 'none';
        if (btn) {
          btn.innerHTML = myRole === 'architect' ? t.freezeAudit : t.freezeDraw;
          btn.style.background = 'rgba(139, 92, 246, 0.85)';
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fCtx.clearRect(0, 0, freezeCanvas.width, freezeCanvas.height);
        undoStack = [];
        if (broadcast) signalingChannel.send({ type: 'broadcast', event: 'clear_action' });
      }
    };

    window.toggleFreezeState = () => { window.applyFreezeState(!isFrozen, true); };

    window.generateComposite = function (scale = 1, rotate = 0) {
      const tCanvas = document.createElement('canvas');
      tCanvas.width = canvas.width || window.innerWidth;
      tCanvas.height = canvas.height || window.innerHeight;
      const tCtx = tCanvas.getContext('2d');
      if (isFrozen) tCtx.drawImage(freezeCanvas, 0, 0, tCanvas.width, tCanvas.height);
      else tCtx.drawImage(remoteVideo, 0, 0, tCanvas.width, tCanvas.height);
      if (ghostContainer && ghostContainer.style.display === 'block' && ghostImg.src) {
        tCtx.save();
        tCtx.globalAlpha = parseInt(document.getElementById('ghostOpacity')?.value) / 100 || 0.5;
        tCtx.translate(tCanvas.width / 2 + ghostX, tCanvas.height / 2 + ghostY);
        tCtx.rotate((rotate * Math.PI) / 180);
        tCtx.scale(scale, scale);
        tCtx.drawImage(ghostImg, -ghostImg.width / 2, -ghostImg.height / 2, ghostImg.width, ghostImg.height);
        tCtx.restore();
      }
      tCtx.drawImage(canvas, 0, 0);
      return tCanvas;
    };

    window.syncCanvas = () => {
      if (!isFrozen && (!ghostContainer || ghostContainer.style.display !== 'block') && undoStack.length === 0) return;
      const scale = parseFloat(document.getElementById('ghostScale')?.value || 1);
      const tCanvas = window.generateComposite(scale, ghostRotation);
      const format = isFrozen ? 'image/jpeg' : 'image/png';
      const quality = isFrozen ? 0.6 : undefined;
      signalingChannel.send({ type: 'broadcast', event: 'sync_canvas', payload: { image_data: tCanvas.toDataURL(format, quality) } });
    };

    window.clearFullCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (window.uploadedBlueprint) {
        const img = window.uploadedBlueprint;
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        ctx.drawImage(img, (canvas.width - img.width * ratio) / 2, (canvas.height - img.height * ratio) / 2, img.width * ratio, img.height * ratio);
      }
      undoStack = [];
      signalingChannel.send({ type: 'broadcast', event: 'clear_action' });
      window.syncCanvas();
    };

    window.undoAction = () => {
      if (undoStack.length > 0) {
        let i = new Image();
        i.src = undoStack.pop();
        i.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(i, 0, 0); window.syncCanvas(); };
      } else window.clearFullCanvas();
    };

    window.loadExternalFile = function (event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          if (!isFrozen) window.applyFreezeState(true, true);
          window.uploadedBlueprint = img;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
          ctx.drawImage(img, (canvas.width - img.width * ratio) / 2, (canvas.height - img.height * ratio) / 2, img.width * ratio, img.height * ratio);
          window.syncCanvas();
          window.showToast('تم رفع الملف الميداني بنجاح 📁', 'success');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    window.updateGhostTransform = () => {
      const scale = document.getElementById('ghostScale')?.value || 1;
      if (ghostImg) ghostImg.style.transform = `translate(calc(-50% + ${ghostX}px), calc(-50% + ${ghostY}px)) rotate(${ghostRotation}deg) scale(${scale})`;
    };
    window.updateGhostOpacity = val => {
      if (ghostImg) ghostImg.style.opacity = val / 100;
      if (document.getElementById('opValue')) document.getElementById('opValue').innerText = val + '%';
      window.syncCanvas();
    };
    window.updateGhostScale = val => {
      if (document.getElementById('scaleValue')) document.getElementById('scaleValue').innerText = val + 'x';
      window.updateGhostTransform();
      window.syncCanvas();
    };
    window.updateGhostRotation = val => {
      ghostRotation = parseInt(val);
      if (document.getElementById('rotValue')) document.getElementById('rotValue').innerText = ghostRotation + '°';
      window.updateGhostTransform();
      window.syncCanvas();
    };
    window.hideGhost = () => {
      if (ghostContainer) ghostContainer.style.display = 'none';
      currentLayerIndex = -1;
      window.renderLayersUI();
      window.syncCanvas();
    };

    window.addLayer = (name, base64data) => {
      const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
      if (currentPlan === 'basic' && projectLayers.length >= 1) {
        window.showToast('🔒 الباقة الأساسية تسمح بمخطط واحد فقط!', 'error');
        return;
      }
      projectLayers.push({ name, src: base64data });
      currentLayerIndex = projectLayers.length - 1;
      window.activateLayer(currentLayerIndex);
    };

    window.loadGhost = e => {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => { window.addLayer(file.name, ev.target.result); };
      r.readAsDataURL(file);
      e.target.value = '';
    };

    window.activateLayer = index => {
      currentLayerIndex = index;
      const layer = projectLayers[index];
      if (!layer || !ghostImg || !ghostContainer) return;
      ghostImg.src = layer.src;
      ghostContainer.style.display = 'block';
      window.updateGhostTransform();
      window.renderLayersUI();
      ghostImg.onload = () => { setTimeout(window.syncCanvas, 200); };
    };

    window.renderLayersUI = () => {
      const panel = document.getElementById('layersPanel');
      const list = document.getElementById('layersList');
      if (!panel || !list) return;
      if (projectLayers.length > 0) {
        panel.style.display = 'block';
        list.innerHTML = projectLayers.map((l, i) => `
          <div style="display:flex; gap:5px; align-items:center;">
            <button class="btn-vip" style="flex:1; margin-bottom:0; padding:6px; font-size:0.75rem; justify-content: space-between;" onclick="window.activateLayer(${i})">
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;">${l.name}</span><span>${i === currentLayerIndex ? '👁️' : '📁'}</span>
            </button>
            <button onclick="window.removeLayer(${i}, event)" style="background:rgba(239, 68, 68, 0.8); border:none; color:white; border-radius:8px; width:32px; height:32px; cursor:pointer;">✖</button>
          </div>
        `).join('');
      } else panel.style.display = 'none';
    };

    window.removeLayer = (index, event) => {
      event.stopPropagation();
      projectLayers.splice(index, 1);
      if (currentLayerIndex === index) window.hideGhost();
      else { if (currentLayerIndex > index) currentLayerIndex--; window.renderLayersUI(); }
    };

    if (ghostImg) {
      const startGhostDrag = e => {
        isGhostDragging = true;
        ghostImg.dataset.startX = (e.touches ? e.touches[0].clientX : e.clientX) - ghostX;
        ghostImg.dataset.startY = (e.touches ? e.touches[0].clientY : e.clientY) - ghostY;
        e.preventDefault();
      };
      const doGhostDrag = e => {
        if (!isGhostDragging) return;
        ghostX = (e.touches ? e.touches[0].clientX : e.clientX) - parseFloat(ghostImg.dataset.startX);
        ghostY = (e.touches ? e.touches[0].clientY : e.clientY) - parseFloat(ghostImg.dataset.startY);
        window.updateGhostTransform();
      };
      const stopGhostDrag = () => { if (isGhostDragging) { isGhostDragging = false; window.syncCanvas(); } };
      ghostImg.addEventListener('mousedown', startGhostDrag);
      document.addEventListener('mousemove', doGhostDrag);
      document.addEventListener('mouseup', stopGhostDrag);
      ghostImg.addEventListener('touchstart', startGhostDrag, { passive: false });
      document.addEventListener('touchmove', doGhostDrag, { passive: false });
      document.addEventListener('touchend', stopGhostDrag);
    }

    window.currentVaultDocs = [];
    window.importDocSafe = async index => {
      const doc = window.currentVaultDocs[index];
      if (!doc) return;
      document.getElementById('vaultExplorer').style.display = 'none';
      window.addLayer(doc.file_name || `مخطط ${index + 1}`, doc.file_url);
    };

    window.toggleVault = async () => {
      const v = document.getElementById('vaultExplorer');
      const listContainer = document.getElementById('vaultList');
      if (!v || !listContainer) return;
      v.style.display = v.style.display === 'block' ? 'none' : 'block';
      if (v.style.display === 'block') {
        try {
          const { data: conv } = await supabase.from('conversations').select('client_id').eq('id', roomId).single();
          const { data: docs } = await supabase.from('project_documents').select('*').eq('user_id', conv.client_id).order('created_at', { ascending: false });
          if (docs && docs.length > 0) {
            window.currentVaultDocs = docs;
            listContainer.innerHTML = docs.map((d, index) => `<div class="vault-item" onclick="window.importDocSafe(${index})"><span>📐 ${d.file_name}</span><span>⬇️</span></div>`).join('');
          } else listContainer.innerHTML = '<div style="text-align:center; color:#94a3b8;">لا توجد مخططات مرفوعة.</div>';
        } catch (err) {
          listContainer.innerHTML = '<div style="text-align:center; color:#94a3b8;">لا توجد مخططات مرفوعة.</div>';
        }
      }
    };

    window.generateProviderReport = async function () {
      if (!isFrozen) return window.showToast('قم بتجميد الشاشة أولاً لاستخراج التقرير!', 'warning');
      window.showToast('⏳ جاري تجهيز التقرير الميداني...', 'info');
      const tCanvas = window.generateComposite(1, 0);
      tCanvas.toBlob(async blob => {
        try {
          const fileName = `live_report_${roomId}_${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage.from('project-files').upload(fileName, blob, { contentType: 'image/jpeg' });
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('project-files').getPublicUrl(fileName);
          const imageUrl = publicUrlData.publicUrl;
          await supabase.from('messages').insert([{ conversation_id: parseInt(roomId), sender_type: myRole, content: `📸 تقرير ميداني:\n${imageUrl}`, is_read: false }]);
          const { data: convData } = await supabase.from('conversations').select('client_id').eq('id', roomId).maybeSingle();
          if (convData?.client_id) {
            await supabase.from('site_reports').insert([{ user_id: convData.client_id, provider_name: 'فريق SasBTP', image_url: imageUrl, description: 'لقطة ميدانية تفاعلية من الغرفة الحية' }]);
          }
          window.showToast('✅ تم إرسال التقرير للشات وللداشبورد بنجاح!', 'success');
        } catch (err) { window.showToast('❌ حدث خطأ أثناء رفع التقرير!', 'error'); }
      }, 'image/jpeg', 0.9);
    };

    window.generatePDFReport = async () => {
      if (!isFrozen) return window.showToast('⚠️ يجب تجميد الشاشة لالتقاط التقرير!', 'error');
      const notes = prompt('ملاحظات هندسية (اختياري):', 'تمت المطابقة بنجاح ولم تُسجل مخالفات.');
      if (notes === null) return;
      const scale = parseFloat(document.getElementById('ghostScale')?.value || 1);
      const tCanvas = window.generateComposite(scale, ghostRotation);
      const imgData = tCanvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `SasBTP_Architect_Report_${roomId}.jpg`;
      link.href = imgData;
      link.click();
      window.showToast('✅ تم استخراج التقرير بنجاح!', 'success');
    };

    window.sealAndAuthenticate = async () => {
      if (!isFrozen) return window.showToast('يجب تجميد الشاشة للتدقيق قبل الختم القانوني!', 'error');
      window.generateProviderReport();
    };

    window.saveLocalCopy = () => {
      const scale = parseFloat(document.getElementById('ghostScale')?.value || 1);
      const tCanvas = window.generateComposite(scale, ghostRotation);
      const link = document.createElement('a');
      link.download = `SasBTP_Capture_${Date.now()}.jpg`;
      link.href = tCanvas.toDataURL('image/jpeg', 0.9);
      link.click();
      window.showToast('تم حفظ النسخة بنجاح 💾', 'success');
    };

    window.toggleRecording = async () => {
      const btn = document.getElementById('recordBtn');
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'browser' }, audio: true });
          mediaRecorder = new MediaRecorder(stream);
          recordedChunks = [];
          mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SasBTP_Session_${roomId}.webm`;
            a.click();
            isRecording = false;
            if (btn) btn.innerHTML = t.startRecord;
            stream.getTracks().forEach(track => track.stop());
          };
          mediaRecorder.start();
          isRecording = true;
          if (btn) btn.innerHTML = t.stopRecord;
        } catch (err) { window.showToast('❌ تم إلغاء التسجيل', 'warning'); }
      } else if (mediaRecorder) mediaRecorder.stop();
    };

    window.generateAiRender = async () => {
      const imgEl = document.getElementById('aiResultImage');
      const modalEl = document.getElementById('aiResultModal');
      if (imgEl && modalEl) {
        imgEl.src = SAMPLE_AI_RENDER_RESULT;
        modalEl.style.display = 'flex';
      }
    };

    window.closeAiModal = () => {
      const m = document.getElementById('aiResultModal');
      if (m) m.style.display = 'none';
    };

    window.endCall = () => {
      if (peerConnection) peerConnection.close();
      if (localStream) localStream.getTracks().forEach(tr => tr.stop());
      if (window.opener) window.close();
      else navigate(myRole === 'architect' ? '/v2/architect-dashboard' : '/v2/provider-dashboard');
    };

    init();

    return () => {
      if (peerConnection) peerConnection.close();
      if (localStream) localStream.getTracks().forEach(tr => tr.stop());
      supabase.removeChannel(signalingChannel);
    };
  }, [roleInfo.loading, myRole, roomId, navigate, t]);

  const goUpgrade = () => navigate('/v2/architect-subscription');

  return (
    <div className="live-room-root" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        :root { --vip-purple: #8b5cf6; --neon-blue: #38bdf8; --glass-bg: rgba(15, 23, 42, 0.85); --glass-border: rgba(255, 255, 255, 0.1); --danger: #ef4444; --success: #10b981; }
        .live-room-root { font-family: 'Cairo', sans-serif; background: #020617; color: white; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; position: fixed; inset: 0; z-index: 9999; }
        .header { background: rgba(15, 23, 42, 0.95); padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); z-index: 1000; }
        .header h1 { margin: 0; font-size: 1.3rem; color: var(--neon-blue); display: flex; align-items: center; gap: 10px; font-weight: 800; }
        .header-status { font-size: 0.85rem; background: rgba(255,255,255,0.05); padding: 6px 15px; border-radius: 20px; border: 1px solid var(--glass-border); color: #cbd5e1; }
        .main-workspace { flex: 1; display: flex; position: relative; justify-content: center; align-items: center; background: #000; overflow: hidden; }
        #remoteVideo { width: 100%; height: 100%; object-fit: contain; transition: transform 0.2s ease; }
        #freezeCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; display: none; }
        #ghostContainer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 15; overflow: hidden; display: none; pointer-events: none; }
        #ghostImage { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.5; cursor: move; pointer-events: auto; width: 85vw; max-height: 85vh; object-fit: contain; border: 2px dashed var(--vip-purple); }
        #drawingCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 20; display: none; cursor: crosshair; background: transparent; }
        .grid-active { background-image: linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px) !important; background-size: 40px 40px !important; }
        .local-cam-wrapper { position: absolute !important; bottom: 20px !important; left: 20px !important; width: 140px !important; height: 190px !important; z-index: 999 !important; border-radius: 12px !important; border: 2px solid var(--neon-blue) !important; background: #000 !important; overflow: hidden !important; }
        #localVideo { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; z-index: 1 !important; }
        .cam-icon-btn { position: absolute !important; background: rgba(0,0,0,0.5) !important; color: white !important; border: 1px solid rgba(255,255,255,0.3) !important; border-radius: 50% !important; width: 32px !important; height: 32px !important; font-size: 14px !important; display: flex !important; justify-content: center !important; align-items: center !important; cursor: pointer !important; z-index: 1000 !important; }
        .smart-tools { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 30px; width: 55px; height: 55px; overflow: hidden; z-index: 900; backdrop-filter: blur(12px); transition: all 0.4s ease; display: flex; flex-direction: column; gap: 10px; }
        .smart-tools::before { content: '${myRole === 'architect' ? '📐' : '🛠️'}'; position: absolute; top: 0; left: 0; width: 55px; height: 55px; display: flex; justify-content: center; align-items: center; font-size: 1.6rem; cursor: pointer; z-index: 10; }
        .smart-tools:hover, .smart-tools:focus-within { width: 250px; height: auto; max-height: 92%; border-radius: 16px; padding: 20px 15px 40px 15px; overflow-y: auto; z-index: 9999; }
        .smart-tools:hover::before, .smart-tools:focus-within::before { opacity: 0; pointer-events: none; }
        .smart-tools > * { opacity: 0; pointer-events: none; flex-shrink: 0; }
        .smart-tools:hover > *, .smart-tools:focus-within > * { opacity: 1; pointer-events: auto; }
        .smart-tools h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #c4b5fd; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
        .btn-vip { padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; font-family: 'Cairo'; font-size: 0.85rem; width: 100%; margin-bottom: 8px; color: white; display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); }
        .emoji-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
        .emoji-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 1.4rem; cursor: pointer; padding: 8px 5px; color: white; }
        .quote-input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.5); color: white; font-family: 'Cairo'; font-size: 0.85rem; box-sizing: border-box; text-align: center; margin-bottom: 8px; }
        .quote-btn { background: rgba(255,255,255,0.1); color: white; font-weight: bold; border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; width: 100%; font-family: 'Cairo'; margin-bottom: 5px; }
        .pen-btn { background: var(--neon-blue); color: #000; font-weight: bold; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; width: 100%; margin-top: 8px; font-family: 'Cairo'; }
        .slider-container { background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; margin-bottom: 8px; text-align: center; }
        .slider-container span { font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 5px; }
        .slider-container input { width: 100%; accent-color: var(--vip-purple); cursor: pointer; }
        .drawing-tools { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 30px; width: 55px; height: 55px; overflow: hidden; z-index: 900; backdrop-filter: blur(12px); transition: all 0.4s ease; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .drawing-tools::before { content: '🖌️'; position: absolute; top: 0; right: 0; width: 55px; height: 55px; display: flex; justify-content: center; align-items: center; font-size: 1.6rem; cursor: pointer; z-index: 10; }
        .drawing-tools:hover, .drawing-tools:focus-within { width: 70px; height: auto; max-height: 92%; border-radius: 16px; padding: 20px 10px 40px 10px; overflow-y: auto; z-index: 9999; }
        .drawing-tools:hover::before, .drawing-tools:focus-within::before { opacity: 0; pointer-events: none; }
        .drawing-tools > * { opacity: 0; pointer-events: none; flex-shrink: 0; }
        .drawing-tools:hover > *, .drawing-tools:focus-within > * { opacity: 1; pointer-events: auto; }
        .tool-btn { width: 45px; height: 45px; border-radius: 12px; cursor: pointer; font-size: 1.3rem; display: flex; justify-content: center; align-items: center; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }
        .controls { background: rgba(15, 23, 42, 0.95); padding: 15px 25px; display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; border-top: 1px solid var(--glass-border); z-index: 800; }
        .btn-control { padding: 12px 25px; border-radius: 12px; font-family: 'Cairo', sans-serif; font-weight: bold; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; color: white; border: 1px solid rgba(255,255,255,0.1); }
        .zoom-controls { position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); z-index: 500; display: flex; gap: 12px; background: var(--glass-bg); padding: 8px 18px; border-radius: 30px; border: 1px solid var(--glass-border); align-items: center; }
        .zoom-controls .btn-zoom { background: rgba(255,255,255,0.1); color: white; width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; }
        #zoomSlider { accent-color: var(--vip-purple); width: 110px; cursor: pointer; }
        .laser-pointer { position: absolute; width: 20px; height: 20px; background: rgba(239, 68, 68, 0.6); border: 2px solid #fff; border-radius: 50%; pointer-events: none; z-index: 100; display: none; }
        #slidingRuler { position: absolute; top: 100px; left: 50px; width: 300px; height: 60px; background: rgba(6, 182, 212, 0.2); border: 2px solid #06b6d4; border-radius: 5px; display: none; cursor: move; z-index: 40; touch-action: none; }
        .ruler-ticks { width: 100%; height: 100%; background-image: linear-gradient(90deg, #06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px); background-size: 50px 20px, 10px 10px; background-repeat: repeat-x; background-position: 0 bottom; position: relative; }
        .ruler-label { position: absolute; top: 5px; left: 5px; font-size: 10px; color: #38bdf8; font-weight: bold; }
        #vaultExplorer { position: absolute; top: 15%; left: 50%; transform: translateX(-50%); width: 90%; max-width: 500px; height: 60vh; z-index: 2000; display: none; padding: 25px; overflow-y: auto; background: var(--glass-bg); border: 1px solid var(--vip-purple); border-radius: 16px; }
        .vault-item { background: rgba(255,255,255,0.05); padding: 12px 15px; border-radius: 10px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .boq-item-v2 { background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; border-right: 3px solid var(--vip-purple); font-size: 0.8rem; }
        #toast-container { position: fixed; top: 80px; left: 20px; z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { min-width: 250px; background: var(--glass-bg); color: #fff; padding: 15px 20px; border-radius: 12px; font-family: 'Cairo'; font-size: 0.9rem; font-weight: bold; display: flex; align-items: center; gap: 12px; border-right: 5px solid var(--vip-purple); }
        .slider-label-vip { font-weight: bold; direction: ltr; display: inline-block; color: var(--neon-blue); padding: 2px 8px; border-radius: 8px; }
      `}</style>

      <div id="toast-container"></div>

      <div id="boq-panel" style={{ display: 'none', position: 'fixed', left: '280px', top: '50%', transform: 'translateY(-50%)', width: '280px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--vip-purple)', borderRadius: '16px', padding: '20px', zIndex: 10000 }}>
        <h3 style={{ color: 'var(--vip-purple)', fontSize: '1rem', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>{t.boqTitle}</h3>
        <div id="boq-result" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}></div>
        <button className="btn-vip" style={{ background: 'var(--vip-purple)', marginTop: '15px' }} onClick={() => { document.getElementById('boq-panel').style.display = 'none'; }}>{t.closeBoq}</button>
      </div>

      <div id="vaultExplorer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, color: 'var(--vip-purple)' }}>{t.vaultTitle}</h3>
          <button onClick={() => window.toggleVault()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>✖</button>
        </div>
        <div id="vaultList" style={{ color: '#94a3b8', textAlign: 'center' }}>⏳ ...</div>
      </div>

      <div id="aiResultModal" style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 3000, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'var(--glass-bg)', padding: '25px', borderRadius: '16px', border: '2px solid var(--vip-purple)', textAlign: 'center', maxWidth: '85%', maxHeight: '85vh', overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 10px 0', color: 'var(--vip-purple)', fontWeight: 'bold' }}>{t.aiModalTitle}</h2>
          <img id="aiResultImage" src="" alt="AI Result" style={{ width: '100%', maxHeight: '60vh', borderRadius: '8px', marginBottom: '20px' }} />
          <button className="btn-control" style={{ background: 'var(--danger)', width: '100%', justifyContent: 'center' }} onClick={() => window.closeAiModal()}>{t.closeModal}</button>
        </div>
      </div>

      <div className="header">
        <h1>
          {myRole === 'architect' ? t.archHeader : t.provHeader}{' '}
          <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '5px' }}>
            {myRole === 'architect' ? 'LIVE VIP' : 'LIVE'}
          </span>
        </h1>
        <div className="header-status" id="connection-status">{t.connecting}</div>
      </div>

      <div className="main-workspace" id="workspace">
        <div id="laserPointer" className="laser-pointer"></div>
        <video id="remoteVideo" autoPlay playsInline></video>
        <canvas id="freezeCanvas"></canvas>

        <div id="ghostContainer">
          <img id="ghostImage" src="" alt="" />
        </div>

        <div id="slidingRuler" onMouseDown={e => window.startRulerDrag(e)} onTouchStart={e => window.startRulerDrag(e)}>
          <div className="ruler-ticks"></div>
          <span className="ruler-label">SOUQ BTP - SCALE 1:1</span>
        </div>

        <canvas id="drawingCanvas"></canvas>

        <div className="local-cam-wrapper">
          <video id="localVideo" autoPlay playsInline muted></video>
          <button className="cam-icon-btn" style={{ top: '5px', right: '5px' }} onClick={() => window.toggleTorch()} title="الكشاف">💡</button>
          <button className="cam-icon-btn" style={{ bottom: '5px', right: '5px' }} onClick={() => window.toggleCamera()} title="تبديل الكاميرا">🔄</button>
        </div>

        {myRole === 'architect' && (
          <>
            <div className="drawing-tools">
              <button className="tool-btn active" onClick={e => window.setDrawMode('pen', e.currentTarget)} title="رسم حر">✏️</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <div className="color-dot" style={{ background: '#ef4444', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', border: '2px solid white' }} onClick={e => window.changeColor('#ef4444', e.currentTarget)}></div>
                <div className="color-dot" style={{ background: '#22c55e', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }} onClick={e => window.changeColor('#22c55e', e.currentTarget)}></div>
                <div className="color-dot" style={{ background: '#38bdf8', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }} onClick={e => window.changeColor('#38bdf8', e.currentTarget)}></div>
              </div>
              <button className="tool-btn" onClick={e => window.setDrawMode('rect', e.currentTarget)} title="رسم مساحة/غرفة">⬜</button>
              <button className="tool-btn" onClick={e => window.setDrawMode('circle', e.currentTarget)} title="رسم دائرة/عمود">⭕</button>
              <button className="tool-btn" onClick={e => window.setDrawMode('arrow', e.currentTarget)} title="توجيه">↗️</button>
              <button className="tool-btn" onClick={e => window.setDrawMode('text', e.currentTarget)} title="كتابة نص هندسي">🔤</button>
              <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', width: '80%', margin: '5px 0' }} />
              <button className="tool-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => window.undoAction()} title="تراجع">↩️</button>
              <button className="tool-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => window.clearFullCanvas()} title="مسح الكل">🗑️</button>
            </div>

            <div className="smart-tools">
              <div style={{ textAlign: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {roomPlan === 'vip' ? (
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #f59e0b' }}>👑 باقة النخبة (VIP)</span>
                ) : roomPlan === 'pro' ? (
                  <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #8b5cf6' }}>🔥 باقة المحترفين</span>
                ) : (
                  <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.3)' }}>🌱 الباقة الأساسية</span>
                )}
              </div>

              <h4 style={{ color: '#38bdf8' }}>📏 المسطرة الذكية</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                {roomPlan === 'pro' || roomPlan === 'vip' ? (
                  <>
                    <button className="btn-vip" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', margin: 0, padding: '12px 5px', color: '#38bdf8' }} onClick={e => window.setMeasureMode('calibrate', e.currentTarget)}>🎯 معايرة</button>
                    <button className="btn-vip" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', margin: 0, padding: '12px 5px', color: '#38bdf8' }} onClick={e => window.setMeasureMode('measure', e.currentTarget)}>📏 قياس</button>
                  </>
                ) : (
                  <>
                    <button className="btn-vip" style={{ background: '#1e293b', margin: 0, padding: '10px 5px', color: '#94a3b8' }} onClick={goUpgrade}>🎯 معايرة 🔒</button>
                    <button className="btn-vip" style={{ background: '#1e293b', margin: 0, padding: '10px 5px', color: '#94a3b8' }} onClick={goUpgrade}>📏 قياس 🔒</button>
                  </>
                )}
              </div>

              <div id="measureStatus" style={{ fontSize: '0.75rem', color: '#38bdf8', textAlign: 'center', marginBottom: '10px', display: 'none' }}></div>

              <h4>الواقع المعزز (AR)</h4>
              <button className="btn-vip" style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--vip-purple)' }} onClick={() => window.toggleVault()}>📂 خزانة المخططات</button>
              <button className="btn-vip" style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid var(--neon-blue)' }} onClick={() => document.getElementById('ghostUpload').click()}>🗺️ رفع مخطط خارجي</button>
              <input type="file" id="ghostUpload" accept="image/*" style={{ display: 'none' }} onChange={e => window.loadGhost(e)} />

              <button className="btn-vip" onClick={() => window.toggleGrid()}>📏 تفعيل/إخفاء الشبكة</button>

              <div className="slider-container">
                <span>شفافية المخطط <b id="opValue" className="slider-label-vip">50%</b></span>
                <input type="range" id="ghostOpacity" min="0" max="100" defaultValue="50" onChange={e => window.updateGhostOpacity(e.target.value)} />
              </div>
              <div className="slider-container">
                <span>تكبير المخطط <b id="scaleValue" className="slider-label-vip">1.0x</b></span>
                <input type="range" id="ghostScale" min="0.1" max="3" step="0.05" defaultValue="1" onChange={e => window.updateGhostScale(e.target.value)} />
              </div>
              <div className="slider-container">
                <span>دوران المخطط 🔄 <b id="rotValue" className="slider-label-vip">0°</b></span>
                <input type="range" id="ghostRotation" min="-180" max="180" defaultValue="0" onChange={e => window.updateGhostRotation(e.target.value)} />
              </div>

              <button className="btn-vip" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }} onClick={() => window.hideGhost()}>❌ إخفاء المخطط</button>

              <div id="layersPanel" style={{ display: 'none', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', marginTop: '10px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#38bdf8', textAlign: 'center', fontSize: '0.8rem' }}>📑 الطبقات المحملة</h5>
                <div id="layersList" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}></div>
              </div>

              <h4 style={{ margin: '10px 0 5px', color: 'var(--vip-purple)' }}>✨ Meta-Builder AI</h4>
              {roomPlan === 'vip' || roomPlan === 'pro' ? (
                <button className="btn-vip" style={{ background: 'var(--vip-purple)', color: 'white', padding: '14px' }} onClick={() => window.generateAiRender()}>✨ توليد الواقع المستقبلي</button>
              ) : (
                <button className="btn-vip" style={{ background: '#0f172a', color: '#fbbf24', borderColor: '#fbbf24' }} onClick={goUpgrade}>✨ توليد الواقع المستقبلي 🔒</button>
              )}

              <button className="btn-vip" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }} onClick={() => window.saveLocalCopy()}>💾 حفظ نسخة محلية</button>

              {roomPlan === 'pro' || roomPlan === 'vip' ? (
                <button id="btn-seal" className="btn-vip" style={{ background: 'rgba(139, 92, 246, 0.2)', borderColor: 'var(--vip-purple)' }} onClick={() => window.sealAndAuthenticate()}>🏛️ ختم ومصادقة (GPS)</button>
              ) : (
                <button id="btn-seal" className="btn-vip" style={{ background: '#1e293b', color: '#64748b' }} onClick={goUpgrade}>🏛️ ختم ومصادقة (GPS) 🔒</button>
              )}
            </div>
          </>
        )}

        {myRole === 'provider' && (
          <>
            <div className="smart-tools" id="smartTools">
              <h4>🛠️ أدوات البناء</h4>
              <div className="emoji-grid">
                {['🧱', '🚰', '⚡', '🪵', '🪟', '🚪', '🔨', '💡', '⚠️'].map(em => (
                  <button key={em} className="emoji-btn" onClick={e => window.setStamp(em, e.currentTarget)}>{em}</button>
                ))}
              </div>

              <h4>🚨 رادار الأخطاء</h4>
              <div className="emoji-grid">
                <button className="emoji-btn" onClick={e => window.setStamp('❌ خطأ تنفيذي', e.currentTarget)}>❌</button>
                <button className="emoji-btn" onClick={e => window.setStamp('⚠️ خطر سلامة', e.currentTarget)}>⚠️</button>
                <button className="emoji-btn" onClick={e => window.setStamp('🔍 يحتاج فحص', e.currentTarget)}>🔍</button>
              </div>

              <button className="quote-btn" style={{ background: '#10b981', color: 'white' }} onClick={() => window.toggleRuler()}>📏 إظهار المسطرة الحرة</button>

              <h4>📏 القياس الهندسي والكميات</h4>
              <button className="quote-btn" style={{ background: '#8b5cf6', color: 'white' }} onClick={e => window.setMeasureMode('calibrate', e.currentTarget)}>🎯 1. ضبط المعايرة (10سم)</button>
              <button className="quote-btn" style={{ background: '#06b6d4', color: 'white' }} onClick={e => window.setMeasureMode('measure', e.currentTarget)}>📏 2. قياس طول خط</button>
              <button className="quote-btn" style={{ background: '#f59e0b', color: '#000' }} onClick={e => window.setMeasureMode('area', e.currentTarget)}>🤖 3. حساب المساحة والكميات</button>
              <div id="measureResult" style={{ fontSize: '0.8rem', color: '#38bdf8', textAlign: 'center', fontWeight: 'bold' }}></div>

              <h4>💰 تسعير سريع</h4>
              <input type="text" id="quoteText" className="quote-input" placeholder="مثال: إسمنت 50 د.م" />
              <button className="quote-btn" onClick={e => window.setStampText(e.currentTarget)}>🏷️ وضع التسعيرة</button>
              <button className="pen-btn" onClick={e => window.setPen(e.currentTarget)} id="defaultPenBtn">✏️ العودة للرسم الحر</button>
            </div>

            <div className="drawing-tools" id="drawingTools">
              <button className="tool-btn" style={{ background: '#ef4444' }} onClick={e => window.changeColor('#ef4444', e.currentTarget)}></button>
              <button className="tool-btn" style={{ background: '#22c55e' }} onClick={e => window.changeColor('#22c55e', e.currentTarget)}></button>
              <button className="tool-btn" style={{ background: '#eab308' }} onClick={e => window.changeColor('#eab308', e.currentTarget)}></button>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '5px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block' }}>سُمك</span>
                <input type="range" id="penSizeSlider" min="2" max="15" defaultValue="4" onChange={e => window.updatePenSize(e.target.value)} style={{ width: '100%' }} />
              </div>
              <button className="tool-btn" id="smartModeBtn" style={{ background: '#1e3a8a', color: 'white' }} onClick={() => window.toggleSmartMode()}>📐</button>
              <button className="tool-btn" style={{ background: '#64748b', color: 'white' }} onClick={() => window.undoAction()}>↩️</button>
              <button className="tool-btn" style={{ background: '#475569', color: 'white' }} onClick={() => window.clearFullCanvas()}>🗑️</button>
              <button className="tool-btn" style={{ background: '#2563eb', color: 'white' }} onClick={() => window.generateProviderReport()}>📄</button>
            </div>

            <div className="zoom-controls">
              <button className="btn-zoom" onClick={() => window.changeZoom(parseFloat(document.getElementById('zoomSlider')?.value || 1) - 0.5)}>➖</button>
              <input type="range" id="zoomSlider" min="1" max="5" step="0.1" defaultValue="1" onChange={e => window.changeZoom(parseFloat(e.target.value))} />
              <button className="btn-zoom" onClick={() => window.changeZoom(parseFloat(document.getElementById('zoomSlider')?.value || 1) + 0.5)}>➕</button>
            </div>
          </>
        )}
      </div>

      <div className="controls">
        <button className="btn-control" style={{ background: 'rgba(239, 68, 68, 0.85)' }} onClick={() => window.endCall()}>
          {myRole === 'architect' ? t.endSession : t.endVisit}
        </button>

        {myRole === 'architect' && (
          <>
            {roomPlan === 'vip' ? (
              <button className="btn-control" id="recordBtn" style={{ background: 'rgba(220, 38, 38, 0.9)' }} onClick={() => window.toggleRecording()}>{t.startRecord}</button>
            ) : (
              <button className="btn-control" style={{ background: '#1e293b', color: '#64748b' }} onClick={goUpgrade}>{t.recordLocked}</button>
            )}

            {roomPlan === 'pro' || roomPlan === 'vip' ? (
              <button className="btn-control" style={{ background: 'rgba(56, 189, 248, 0.8)' }} onClick={() => window.generatePDFReport()}>{t.exportPdf}</button>
            ) : (
              <button className="btn-control" style={{ background: '#1e293b', color: '#64748b' }} onClick={goUpgrade}>{t.exportPdfLocked}</button>
            )}
          </>
        )}

        {myRole === 'provider' && (
          <>
            <input type="file" id="fieldVaultInput" style={{ display: 'none' }} accept="image/*" onChange={e => window.loadExternalFile(e)} />
            <button className="btn-control" style={{ background: '#0ea5e9' }} onClick={() => document.getElementById('fieldVaultInput')?.click()}>{t.docFieldFile}</button>
            <button className="btn-control" style={{ background: '#2563eb' }} onClick={() => window.generateProviderReport()}>{t.sendReportClient}</button>
          </>
        )}

        {myRole !== 'client' && (
          <button className="btn-control" style={{ background: 'rgba(139, 92, 246, 0.85)' }} id="freezeBtn" onClick={() => window.toggleFreezeState()}>
            {myRole === 'architect' ? t.freezeAudit : t.freezeDraw}
          </button>
        )}
      </div>
    </div>
  );
}