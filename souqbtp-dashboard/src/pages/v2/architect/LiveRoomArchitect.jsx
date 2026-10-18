import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useArchitectStore from '../../../store/useArchitectStore';
import { supabase } from '../../../lib/supabase';

const SAMPLE_AI_RENDER_RESULT = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

export default function LiveRoomArchitect() {
  const { cid } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // قراءة رقم الغرفة سواء من الرابط المباشر (/live-room/0) أو من (?cid=0)
  const roomId = cid || searchParams.get('cid') || '0';

  const { architectProfile: profile, fetchArchitectData } = useArchitectStore();

  // جلب وتحديث بيانات المهندس إجبارياً عند فتح الغرفة (لضمان قراءة أحدث باقة)
  useEffect(() => {
    const forceLoadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchArchitectData(user.id);
      }
    };
    forceLoadProfile();
  }, [fetchArchitectData]); // أزلنا profile من هنا لمنع التكرار اللانهائي

  const roomPlan = profile?.subscription_plan?.toLowerCase() || 'basic';
  const architectUserId = profile?.user_id || '';

  const initializedRef = useRef(false);

  // تحميل مكتبة html2pdf تلقائياً إذا لم تكن موجودة في index.html
  useEffect(() => {
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // تشغيل المحرك الكامل للغرفة الميدانية (WebRTC + Canvas + AR + BOQ)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const signalingChannel = supabase.channel(`live_room_${roomId}`);

    let localStream = null;
    let peerConnection = null;
    let isFrozen = false;
    let isDrawing = false;
    let useFrontCamera = true;
    let isRecording = false;
    let mediaRecorder = null;
    let recordedChunks = [];

    let currentMode = 'pen';
    let drawColor = '#38bdf8';
    let startX, startY, snapshot;
    let undoStack = [];
    let measureMode = null;
    let calibrationFactor = null;
    let measureStartPoint = null;

    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const freezeCanvas = document.getElementById('freezeCanvas');
    const fCtx = freezeCanvas.getContext('2d');
    const remoteVideo = document.getElementById('remoteVideo');
    const ghostContainer = document.getElementById('ghostContainer');
    const ghostImg = document.getElementById('ghostImage');

    let ghostX = 0, ghostY = 0, ghostRotation = 0, isGhostDragging = false;
    let projectLayers = [];
    let currentLayerIndex = -1;

    window.showToast = function (m, type = 'info') {
      const c = document.getElementById('toast-container');
      if (c) {
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerText = m;
        c.appendChild(t);
        setTimeout(() => {
          t.classList.add('fade-out');
          setTimeout(() => t.remove(), 400);
        }, 3000);
      }
    };

    // 1. محرك الاتصال المدرع (WebRTC Safe Init)
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
            video: { facingMode: 'user' },
            audio: true
          });
          const localVid = document.getElementById('localVideo');
          if (localVid) {
            localVid.muted = true;
            localVid.srcObject = localStream;
            localVid.play().catch(() => {});
          }
        } catch (camError) {
          console.warn('Failed camera:', camError);
          window.showToast('⚠️ لم نتمكن من تشغيل كاميرتك، لكنك ستستقبل البث.', 'warning');
          localStream = null;
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
            statusBtn.innerHTML = '🟢 العميل متصل ومباشر';
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
            statusBtn.innerHTML = '🔴 الاتصال مقطوع';
            statusBtn.style.background = 'rgba(239, 68, 68, 0.2)';
            statusBtn.style.color = '#ef4444';
          }
        };

        peerConnection.onicecandidate = e => {
          if (e.candidate) {
            signalingChannel.send({
              type: 'broadcast',
              event: 'ice',
              payload: { candidate: e.candidate, sender: 'architect' }
            });
          }
        };

        signalingChannel.on('broadcast', { event: 'ice' }, async ({ payload }) => {
          if (payload.candidate && payload.sender !== 'architect') {
            await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
          }
        });

        signalingChannel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
          if (payload.sender !== 'architect') {
            try {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
              const answer = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answer);
              signalingChannel.send({
                type: 'broadcast',
                event: 'answer',
                payload: { answer, sender: 'architect' }
              });
            } catch (e) {
              console.error('Offer error', e);
            }
          }
        });

        signalingChannel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (payload.sender !== 'architect') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer)).catch(() => {});
          }
        });

        signalingChannel.on('broadcast', { event: 'zoom_change' }, payload => {
          if (payload.payload && payload.payload.level) {
            const z = payload.payload.level;
            remoteVideo.style.transform = `scale(${z})`;
            freezeCanvas.style.transform = `scale(${z})`;
            canvas.style.transform = `scale(${z})`;
            remoteVideo.style.transformOrigin = 'center center';
            freezeCanvas.style.transformOrigin = 'center center';
            canvas.style.transformOrigin = 'center center';
          }
        });

        signalingChannel.on('broadcast', { event: 'client_joined' }, () => {
          signalingChannel.send({ type: 'broadcast', event: 'architect_joined' });
        });

        signalingChannel.on('broadcast', { event: 'client_ping' }, () => {
          signalingChannel.send({ type: 'broadcast', event: 'architect_joined' });
        });

        signalingChannel.subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            signalingChannel.send({ type: 'broadcast', event: 'architect_joined' });
          }
        });
      } catch (fatalError) {
        console.error('Critical WebRTC Error:', fatalError);
        window.showToast('❌ خطأ حرج في نظام الاتصال', 'error');
      }
    }

    // 2. تبديل الكاميرا والفلاش
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
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: targetFacingMode } },
            audio: false
          });
        } catch (e) {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: targetFacingMode } },
            audio: false
          });
        }

        const newVideoTrack = newStream.getVideoTracks()[0];
        localStream.addTrack(newVideoTrack);
        const videoEl = document.getElementById('localVideo');
        videoEl.srcObject = localStream;
        videoEl.play().catch(() => {});

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

    // 3. نظام المعايرة والقياس وحساب الكميات (BOQ)
    window.setMeasureMode = (mode, btn) => {
      if (!isFrozen) {
        window.showToast('⚠️ يجب تجميد الشاشة للقياس!', 'error');
        return;
      }
      measureMode = mode;
      currentMode = 'measure';
      document.querySelectorAll('.btn-vip').forEach(b => (b.style.borderColor = 'rgba(255,255,255,0.1)'));
      if (btn) btn.style.borderColor = '#38bdf8';
      const status = document.getElementById('measureStatus');
      if (status) {
        status.style.display = 'block';
        status.innerText =
          mode === 'calibrate'
            ? '🎯 ارسم خطاً فوق عنصر طوله 10سم للمعايرة'
            : '📏 ارسم خطاً لقياس أي مسافة';
      }
    };

    function calculateBOQ(meters) {
      const panel = document.getElementById('boq-panel');
      const resultDiv = document.getElementById('boq-result');
      const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';

      if (!panel || !resultDiv) return;
      panel.style.display = 'block';

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

      if (currentPlan === 'vip') {
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
          <p style="font-size:0.6rem; color:#94a3b8; margin-top:10px; text-align:center;">⚠️ تقدير مهني يحتاج لمطابقة مخطط الخرسانة.</p>
        `;
      } else {
        resultDiv.innerHTML = `
          <div style="text-align:center; padding:15px; background:rgba(0,0,0,0.3); border-radius:12px; border:1px dashed #fbbf24;">
            <div style="filter: blur(6px); opacity:0.3; pointer-events: none;">
              <div style="font-size:1.2rem; font-weight:bold;">${area} m²</div>
              🧱 950 | 🌑 18 | 🏗️ 120 | 💎 45
            </div>
            <div style="position:relative; z-index:10; margin-top:-30px;">
              <span style="display:block; color:#fbbf24; font-weight:bold; font-size:0.85rem;">🔒 كشف الكميات التفصيلي (Elite Only)</span>
              <p style="font-size:0.7rem; color:#cbd5e1; margin:8px 0;">افتح تقارير السلع بلمسة واحدة!</p>
            </div>
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
        const distPx = Math.sqrt(
          Math.pow(pos.x - measureStartPoint.x, 2) + Math.pow(pos.y - measureStartPoint.y, 2)
        );
        if (measureMode === 'calibrate') {
          calibrationFactor = distPx / 10;
          window.showToast('✅ تمت المعايرة بنجاح (10سم)', 'success');
          const status = document.getElementById('measureStatus');
          if (status) status.innerText = '✅ المقياس مضبوط الآن';
        } else if (measureMode === 'measure') {
          if (!calibrationFactor) {
            window.showToast('🚨 يجب المعايرة أولاً!', 'error');
          } else {
            const realDistCm = (distPx / calibrationFactor).toFixed(1);
            const realDistM = (realDistCm / 100).toFixed(2);
            const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
            if (currentPlan === 'vip') calculateBOQ(parseFloat(realDistM));

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
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillText(
              label,
              (measureStartPoint.x + pos.x) / 2,
              (measureStartPoint.y + pos.y) / 2 - 10
            );
            ctx.shadowBlur = 0;
            window.syncCanvas();
          }
        }
        measureStartPoint = null;
      }
    }

    // 4. دوال الرسم الهندسي
    window.setDrawMode = (mode, btn) => {
      currentMode = mode;
      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };

    window.toggleGrid = () => {
      canvas.classList.toggle('grid-active');
      if (canvas.classList.contains('grid-active')) window.showToast('تم تفعيل الشبكة 📐', 'success');
      else window.showToast('تم إخفاء الشبكة', 'info');
    };

    window.changeColor = (color, targetEl) => {
      drawColor = color;
      document.querySelectorAll('.color-dot').forEach(d => (d.style.border = 'none'));
      if (targetEl) targetEl.style.border = '2px solid white';
    };

    const getPos = e => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

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

    canvas.onmousedown = canvas.ontouchstart = e => {
      if (!isFrozen) return;
      const pos = getPos(e);
      if (currentMode === 'measure') {
        handleMeasureLogic(pos);
        return;
      }
      if (currentMode === 'text') {
        const text = prompt('أدخل النص الهندسي هنا:');
        if (text) {
          snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
          ctx.font = 'bold 22px Cairo';
          ctx.fillStyle = drawColor;
          ctx.fillText(text, pos.x, pos.y);
          undoStack.push(canvas.toDataURL('image/png'));
          window.syncCanvas();
        }
        isDrawing = false;
        return;
      }
      startX = pos.x;
      startY = pos.y;
      isDrawing = true;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      undoStack.push(canvas.toDataURL('image/png'));
    };

    canvas.onmousemove = canvas.ontouchmove = e => {
      const pos = getPos(e);
      if (!isFrozen) {
        signalingChannel.send({
          type: 'broadcast',
          event: 'laser_move',
          payload: { x: pos.x / canvas.width, y: pos.y / canvas.height }
        });
        return;
      }
      if (!isDrawing || currentMode === 'text') return;
      e.preventDefault();
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (currentMode === 'pen') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        startX = pos.x;
        startY = pos.y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } else if (currentMode === 'rect') {
        ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
      } else if (currentMode === 'circle') {
        ctx.arc(startX, startY, Math.hypot(pos.x - startX, pos.y - startY), 0, Math.PI * 2);
        ctx.stroke();
      } else if (currentMode === 'arrow') {
        drawArrow(ctx, startX, startY, pos.x, pos.y);
      }
    };

    const stopDrawing = () => {
      if (isDrawing) {
        isDrawing = false;
        window.syncCanvas();
      }
    };
    canvas.onmouseup = canvas.ontouchend = stopDrawing;

    // 5. تجميد الشاشة والمزامنة
    window.toggleFreezeState = () => {
      isFrozen = !isFrozen;
      const btn = document.getElementById('freezeBtn');
      signalingChannel.send({ type: 'broadcast', event: 'freeze_action', payload: { state: isFrozen } });
      if (isFrozen) {
        const w = remoteVideo.clientWidth || window.innerWidth;
        const h = remoteVideo.clientHeight || window.innerHeight;
        freezeCanvas.width = canvas.width = w;
        freezeCanvas.height = canvas.height = h;
        fCtx.drawImage(remoteVideo, 0, 0, freezeCanvas.width, freezeCanvas.height);
        remoteVideo.style.display = 'none';
        freezeCanvas.style.display = 'block';
        canvas.style.display = 'block';
        if (btn) {
          btn.innerHTML = '▶️ استئناف الفيديو';
          btn.style.background = 'rgba(16, 185, 129, 0.8)';
        }
        window.syncCanvas();
      } else {
        remoteVideo.style.display = 'block';
        freezeCanvas.style.display = 'none';
        canvas.style.display = 'none';
        if (btn) {
          btn.innerHTML = '❄️ تجميد الشاشة للتدقيق';
          btn.style.background = 'rgba(139, 92, 246, 0.8)';
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fCtx.clearRect(0, 0, freezeCanvas.width, freezeCanvas.height);
        undoStack = [];
        signalingChannel.send({ type: 'broadcast', event: 'clear_action' });
      }
    };

    window.generateComposite = function (scale, rotate) {
      const tCanvas = document.createElement('canvas');
      tCanvas.width = canvas.width || window.innerWidth;
      tCanvas.height = canvas.height || window.innerHeight;
      const tCtx = tCanvas.getContext('2d');
      if (isFrozen) tCtx.drawImage(freezeCanvas, 0, 0);
      else tCtx.drawImage(remoteVideo, 0, 0, tCanvas.width, tCanvas.height);
      if (ghostContainer.style.display === 'block' && ghostImg.src) {
        tCtx.save();
        tCtx.globalAlpha = parseInt(document.getElementById('ghostOpacity')?.value) / 100 || 0.5;
        tCtx.translate(tCanvas.width / 2 + ghostX, tCanvas.height / 2 + ghostY);
        tCtx.rotate((ghostRotation * Math.PI) / 180);
        tCtx.scale(scale, scale);
        tCtx.drawImage(ghostImg, -ghostImg.width / 2, -ghostImg.height / 2, ghostImg.width, ghostImg.height);
        tCtx.restore();
      }
      tCtx.drawImage(canvas, 0, 0);
      return tCanvas;
    };

    window.syncCanvas = () => {
      if (!isFrozen && ghostContainer.style.display !== 'block' && undoStack.length === 0) return;
      const tCanvas = document.createElement('canvas');
      tCanvas.width = canvas.width || remoteVideo.clientWidth || window.innerWidth;
      tCanvas.height = canvas.height || remoteVideo.clientHeight || window.innerHeight;
      const tCtx = tCanvas.getContext('2d');
      if (isFrozen) tCtx.drawImage(freezeCanvas, 0, 0, tCanvas.width, tCanvas.height);
      if (ghostContainer.style.display === 'block' && ghostImg.src) {
        tCtx.save();
        tCtx.globalAlpha = parseInt(document.getElementById('ghostOpacity')?.value) / 100 || 0.5;
        tCtx.translate(tCanvas.width / 2 + ghostX, tCanvas.height / 2 + ghostY);
        tCtx.rotate((ghostRotation * Math.PI) / 180);
        const scale = parseFloat(document.getElementById('ghostScale')?.value || 1);
        tCtx.scale(scale, scale);
        tCtx.drawImage(ghostImg, -ghostImg.width / 2, -ghostImg.height / 2, ghostImg.width, ghostImg.height);
        tCtx.restore();
      }
      tCtx.drawImage(canvas, 0, 0);
      const format = isFrozen ? 'image/jpeg' : 'image/png';
      const quality = isFrozen ? 0.6 : undefined;
      signalingChannel.send({
        type: 'broadcast',
        event: 'sync_canvas',
        payload: { image_data: tCanvas.toDataURL(format, quality) }
      });
    };

    window.clearFullCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      undoStack = [];
      window.syncCanvas();
    };

    window.undoAction = () => {
      if (undoStack.length > 0) {
        let i = new Image();
        i.src = undoStack.pop();
        i.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(i, 0, 0);
          window.syncCanvas();
        };
      } else {
        window.clearFullCanvas();
      }
    };

    // 6. إدارة المخططات الشفافة (AR Ghost & Layers)
    window.updateGhostTransform = () => {
      const scale = document.getElementById('ghostScale')?.value || 1;
      ghostImg.style.transform = `translate(calc(-50% + ${ghostX}px), calc(-50% + ${ghostY}px)) rotate(${ghostRotation}deg) scale(${scale})`;
    };
    window.updateGhostOpacity = val => {
      ghostImg.style.opacity = val / 100;
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
      ghostContainer.style.display = 'none';
      currentLayerIndex = -1;
      window.renderLayersUI();
      window.syncCanvas();
    };

    window.addLayer = (name, base64data) => {
      const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
      if (currentPlan === 'basic' && projectLayers.length >= 1) {
        window.showToast('🔒 الباقة الأساسية تسمح بمخطط واحد فقط!', 'error');
        const vault = document.getElementById('vaultExplorer');
        if (vault) vault.style.display = 'none';
        return;
      }
      let finalName = name;
      let exists = projectLayers.findIndex(l => l.name === finalName);
      if (exists !== -1) finalName = finalName + ' (' + Math.floor(Math.random() * 100) + ')';
      projectLayers.push({ name: finalName, src: base64data });
      currentLayerIndex = projectLayers.length - 1;
      window.activateLayer(currentLayerIndex);
    };

    window.loadGhost = e => {
      const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
      if (currentPlan === 'basic' && projectLayers.length >= 1) {
        window.showToast('🔒 لقد استنفدت الحد المسموح (مخطط واحد)! يرجى الترقية.', 'error');
        e.target.value = '';
        return;
      }
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => {
        window.addLayer(file.name, ev.target.result);
        window.showToast('تم التحميل بنجاح 📐', 'success');
      };
      r.readAsDataURL(file);
      e.target.value = '';
    };

    window.activateLayer = index => {
      currentLayerIndex = index;
      const layer = projectLayers[index];
      ghostImg.src = layer.src;
      ghostContainer.style.display = 'block';
      window.updateGhostTransform();
      window.renderLayersUI();
      ghostImg.onload = () => {
        setTimeout(window.syncCanvas, 200);
      };
    };

    window.renderLayersUI = () => {
      const panel = document.getElementById('layersPanel');
      const list = document.getElementById('layersList');
      if (!panel || !list) return;
      if (projectLayers.length > 0) {
        panel.style.display = 'block';
        list.innerHTML = projectLayers
          .map(
            (l, i) => `
          <div style="display:flex; gap:5px; align-items:center;">
            <button class="btn-vip" style="flex:1; margin-bottom:0; padding:6px; font-size:0.75rem; justify-content: space-between; border-color: ${
              i === currentLayerIndex ? '#38bdf8' : 'rgba(255,255,255,0.1)'
            }; background: ${
              i === currentLayerIndex ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)'
            };" onclick="window.activateLayer(${i})">
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;" title="${l.name}">${
              l.name
            }</span><span>${i === currentLayerIndex ? '👁️' : '📁'}</span>
            </button>
            <button onclick="window.removeLayer(${i}, event)" style="background:rgba(239, 68, 68, 0.8); border:none; color:white; border-radius:8px; width:32px; height:32px; cursor:pointer;" title="حذف">✖</button>
          </div>
        `
          )
          .join('');
      } else {
        panel.style.display = 'none';
      }
    };

    window.removeLayer = (index, event) => {
      event.stopPropagation();
      if (!window.confirm('⚠️ تأكيد الإزالة؟')) return;
      projectLayers.splice(index, 1);
      if (currentLayerIndex === index) window.hideGhost();
      else {
        if (currentLayerIndex > index) currentLayerIndex--;
        window.renderLayersUI();
      }
    };

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
    const stopGhostDrag = () => {
      if (isGhostDragging) {
        isGhostDragging = false;
        window.syncCanvas();
      }
    };

    ghostImg.addEventListener('mousedown', startGhostDrag);
    document.addEventListener('mousemove', doGhostDrag);
    document.addEventListener('mouseup', stopGhostDrag);
    ghostImg.addEventListener('touchstart', startGhostDrag, { passive: false });
    document.addEventListener('touchmove', doGhostDrag, { passive: false });
    document.addEventListener('touchend', stopGhostDrag);

    // 7. خزانة ملفات العميل (Vault)
    window.currentVaultDocs = [];
    window.importDocSafe = async index => {
      const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
      if (currentPlan === 'basic' && projectLayers.length >= 1) {
        window.showToast('🔒 الباقة الأساسية تسمح بمخطط واحد فقط للورشة!', 'error');
        document.getElementById('vaultExplorer').style.display = 'none';
        return;
      }
      const doc = window.currentVaultDocs[index];
      if (!doc) return;
      const url = doc.file_url;
      const safeName = doc.file_name || `مخطط رقم ${index + 1}`;
      document.getElementById('vaultExplorer').style.display = 'none';
      window.showToast('⏳ جاري تحميل وإضافة المخطط للطبقات...', 'info');
      try {
        const response = await fetch(url, { cache: 'no-store' });
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          window.addLayer(safeName, reader.result);
          window.showToast('✅ تم الاستيراد بنجاح!', 'success');
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        window.addLayer(safeName, url);
      }
    };

    window.toggleVault = async () => {
      const v = document.getElementById('vaultExplorer');
      const listContainer = document.getElementById('vaultList');
      v.style.display = v.style.display === 'block' ? 'none' : 'block';
      if (v.style.display === 'block') {
        if (roomId == 0 || roomId === '0') {
          listContainer.innerHTML = `<div style="text-align:center; padding:30px;"><div style="font-size:3.5rem; margin-bottom:10px;">👻</div><h3 style="color:#f59e0b;">أنت في وضع المحاكي</h3><p style="color:#94a3b8;">لتجربة أدوات الرسم، ارفع مخططاً خارجياً.</p></div>`;
          return;
        }
        listContainer.innerHTML = '<div style="text-align:center; color:#38bdf8;">⏳ جاري الفحص...</div>';
        try {
          const { data: conv } = await supabase
            .from('conversations')
            .select('client_id')
            .eq('id', roomId)
            .single();
          const { data: docs } = await supabase
            .from('project_documents')
            .select('*')
            .eq('user_id', conv.client_id)
            .in('category', ['تصميم هندسي', 'رخصة بناء'])
            .order('created_at', { ascending: false });
          if (docs && docs.length > 0) {
            window.currentVaultDocs = docs;
            listContainer.innerHTML = docs
              .map(
                (d, index) =>
                  `<div class="vault-item" onclick="window.importDocSafe(${index})"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:1.5rem;">📐</span><div style="text-align:right;"><div style="font-weight:bold;">${d.file_name}</div><div style="font-size:0.7rem; color:#64748b;">${d.category}</div></div></div><span style="color:#38bdf8;">⬇️</span></div>`
              )
              .join('');
          } else {
            listContainer.innerHTML = '<div style="text-align:center; color:#94a3b8;">لا توجد مخططات مرفوعة.</div>';
          }
        } catch (err) {
          listContainer.innerHTML = '<div style="text-align:center; color:#ef4444;">⚠️ لم نتمكن من الوصول للملفات.</div>';
        }
      }
    };

    // 8. تقارير PDF والختم بـ GPS والحفظ والتسجيل والـ AI
    function buildAndDownloadPDF(gps, imgData, notes, headerLogoHTML, subTitle, borderColor) {
      const dateStr = new Date().toLocaleString('ar-MA');
      let attachedLayersHTML = '';
      if (projectLayers.length > 0) {
        attachedLayersHTML =
          `<div style="page-break-before: always; margin-top: 40px; padding-top: 20px; border-top: 3px solid #38bdf8;"><h3 style="color: #0f172a; font-size: 20px;">📑 المخططات المرفقة (${projectLayers.length}):</h3>` +
          projectLayers
            .map(
              layer =>
                `<div style="margin-bottom: 40px; text-align: center; page-break-inside: avoid;"><h4 style="color: #64748b; background: #f1f5f9; padding: 10px;">📄 ${layer.name}</h4><div style="border: 2px solid #cbd5e1; padding: 5px;"><img src="${layer.src}" style="width: 100%; max-height: 800px; object-fit: contain;"></div></div>`
            )
            .join('') +
          `</div>`;
      }

      const reportHTML = `<div id="pdf-content" style="padding: 40px; font-family: 'Cairo', sans-serif; direction: rtl; background: white; color: #0f172a;">
        <div style="border-bottom: 3px solid ${borderColor}; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>${headerLogoHTML}<p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">${subTitle}</p></div>
          <div style="text-align: left;"><h2 style="margin: 0; font-size: 22px;">تقرير زيارة ميدانية</h2><p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">رقم الجلسة: #${roomId}</p></div>
        </div>
        <div style="margin-bottom: 20px; background: #f8fafc; padding: 15px; border: 1px solid #e2e8f0;">
          <table style="width: 100%; font-size: 15px;"><tr><td style="padding: 8px;"><b>📅 تاريخ الزيارة:</b> ${dateStr}</td><td style="padding: 8px;"><b>📍 الإحداثيات:</b> <span dir="ltr">${gps}</span></td></tr>
          <tr><td style="padding: 8px;"><b>👷 المهندس:</b> معتمد من المنصة</td><td style="padding: 8px;"><b>✅ حالة المطابقة:</b> تقنية الواقع المعزز</td></tr></table>
        </div>
        <div style="margin-bottom: 20px;"><h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">📸 اللقطة الميدانية والمطابقة:</h3><img src="${imgData}" style="width: 100%; max-height: 450px; object-fit: contain; background: #000; border: 2px solid #cbd5e1; padding: 5px;"></div>
        <div style="margin-bottom: 40px;"><h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">📝 ملاحظات المهندس:</h3><p style="font-size: 15px; line-height: 1.6; background: #f1f5f9; padding: 15px; border: 1px solid #e2e8f0;">${
          notes || 'لا توجد ملاحظات إضافية.'
        }</p></div>
        <div style="margin-top: 50px; display: flex; justify-content: space-around; align-items: flex-end;"><div style="text-align: center;"><div style="margin-bottom: 10px; color: ${borderColor}; font-size: 30px;">🏛️</div><div style="border-top: 2px dashed #94a3b8; padding-top: 8px; font-weight: bold;">مصادقة منصة SouqBTP</div></div><div style="text-align: center;"><div style="height: 40px;"></div><div style="border-top: 2px dashed #94a3b8; padding-top: 8px; font-weight: bold;">توقيع المهندس / الختم</div></div></div>
        ${attachedLayersHTML}
      </div>`;

      const container = document.createElement('div');
      container.innerHTML = reportHTML;
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      const opt = {
        margin: 0,
        filename: `SouqBTP_Architect_Report_${roomId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      if (window.html2pdf) {
        window
          .html2pdf()
          .set(opt)
          .from(container.querySelector('#pdf-content'))
          .save()
          .then(() => {
            document.body.removeChild(container);
            window.showToast('✅ تم تحميل تقرير PDF بنجاح!', 'success');
          })
          .catch(() => {
            document.body.removeChild(container);
            window.showToast('❌ خطأ أثناء توليد التقرير', 'error');
          });
      }
    }

    window.generatePDFReport = async () => {
      if (!isFrozen) {
        window.showToast('⚠️ يجب تجميد الشاشة لالتقاط التقرير!', 'error');
        return;
      }
      const notes = prompt('ملاحظات هندسية (اختياري):', 'تمت المطابقة بنجاح ولم تُسجل مخالفات.');
      if (notes === null) return;

      window.showToast('⏳ جاري تجهيز التقرير الاحترافي...', 'info');
      const scale = parseFloat(document.getElementById('ghostScale')?.value || 1);
      const tCanvas = window.generateComposite(scale, ghostRotation);
      const imgData = tCanvas.toDataURL('image/jpeg', 0.9);

      const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
      const archUid = window.__ARCHITECT_UID__ || '';

      let headerLogoHTML = `<h1 style="color: #8b5cf6; margin: 0; font-size: 26px; font-weight: 900;">SouqBTP</h1>`;
      let subTitle = 'المنصة الأولى للبناء والتعمير الذكي';
      let borderColor = '#8b5cf6';

      if (currentPlan === 'vip' && archUid) {
        const { data: archData } = await supabase
          .from('architects')
          .select('agency_name, agency_logo_url')
          .eq('user_id', archUid)
          .maybeSingle();
        if (archData) {
          borderColor = '#1e293b';
          subTitle = 'تقرير هندسي معتمد ومصادق عليه';
          if (archData.agency_logo_url)
            headerLogoHTML = `<img src="${archData.agency_logo_url}" style="height: 65px; object-fit: contain; margin-bottom: 5px;">`;
          else
            headerLogoHTML = `<h1 style="color: #1e293b; margin: 0; font-size: 26px; font-weight: 900;">${
              archData.agency_name || 'المكتب الهندسي'
            }</h1>`;
        }
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          const gps = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
          buildAndDownloadPDF(gps, imgData, notes, headerLogoHTML, subTitle, borderColor);
        },
        () => {
          buildAndDownloadPDF('غير متوفر (تم رفض GPS)', imgData, notes, headerLogoHTML, subTitle, borderColor);
        }
      );
    };

    window.sealAndAuthenticate = async () => {
      if (!isFrozen) {
        window.showToast('يجب تجميد الشاشة للتدقيق قبل الختم القانوني!', 'error');
        return;
      }
      window.showToast('جاري استخراج الإحداثيات (GPS)... 📡', 'info');

      function executeSeal(gpsData) {
        const timestamp = new Date().toLocaleString('ar-MA');
        const scale = parseFloat(document.getElementById('ghostScale')?.value || 1);
        const tCanvas = window.generateComposite(scale, ghostRotation);
        const tCtx = tCanvas.getContext('2d');

        tCtx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        tCtx.fillRect(0, tCanvas.height - 80, tCanvas.width, 80);
        tCtx.fillStyle = '#38bdf8';
        tCtx.font = 'bold 16px Cairo';
        tCtx.textAlign = 'right';
        tCtx.fillText(`📍 الإحداثيات: ${gpsData}`, tCanvas.width - 20, tCanvas.height - 50);
        tCtx.fillText(`📅 التوقيت: ${timestamp}`, tCanvas.width - 20, tCanvas.height - 25);
        tCtx.textAlign = 'left';
        tCtx.fillText(`رقم الجلسة: ${roomId} 🏗️`, 20, tCanvas.height - 50);

        tCtx.strokeStyle = '#8b5cf6';
        tCtx.lineWidth = 3;
        tCtx.strokeRect(tCanvas.width / 2 - 100, tCanvas.height - 70, 200, 60);
        tCtx.fillStyle = '#8b5cf6';
        tCtx.font = 'bold 20px Cairo';
        tCtx.textAlign = 'center';
        tCtx.fillText('مُصادق رسمياً 🏛️', tCanvas.width / 2, tCanvas.height - 32);

        window.showToast('جاري توثيق الختم وإرساله... ⏳', 'info');

        tCanvas.toBlob(
          async blob => {
            try {
              const fileName = `LEGAL_SEAL_${roomId}_${new Date().getTime()}.jpg`;
              const { error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(fileName, blob, { contentType: 'image/jpeg' });

              if (uploadError) throw uploadError;

              const { data: publicUrlData } = supabase.storage.from('project-files').getPublicUrl(fileName);
              const imageUrl = publicUrlData.publicUrl;

              if (roomId !== '0' && roomId !== 0) {
                await supabase.from('messages').insert([
                  {
                    conversation_id: parseInt(roomId),
                    sender_type: 'architect',
                    content: `📸 تقرير هندسي مصادق عليه:\n${imageUrl}`,
                    is_read: false
                  }
                ]);
              }
              window.showToast('تم الختم والمصادقة بنجاح! 📜✅', 'success');
            } catch (err) {
              console.error('Error saving seal:', err);
              window.showToast('❌ حدث خطأ أثناء إرسال التقرير!', 'error');
            }
          },
          'image/jpeg',
          0.9
        );
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          const gps = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
          executeSeal(gps);
        },
        () => {
          window.showToast('تعذر الوصول للـ GPS، سيتم الختم بدون إحداثيات', 'warning');
          executeSeal('غير متوفر (GPS مغلق)');
        }
      );
    };

    window.saveLocalCopy = () => {
      if (!isFrozen && ghostContainer.style.display !== 'block') {
        window.showToast('قم بتجميد الشاشة أو رفع مخطط قبل الحفظ!', 'warning');
        return;
      }
      const scale = parseFloat(document.getElementById('ghostScale')?.value || 1);
      const tCanvas = window.generateComposite(scale, ghostRotation);
      const link = document.createElement('a');
      link.download = `SouqBTP_Architect_${new Date().getTime()}.jpg`;
      link.href = tCanvas.toDataURL('image/jpeg', 0.9);
      link.click();
      window.showToast('تم حفظ النسخة بنجاح 💾', 'success');
    };

    window.toggleRecording = async () => {
      const btn = document.getElementById('recordBtn');
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: 'browser' },
            audio: true
          });
          let options = { mimeType: 'video/webm' };
          let extension = 'webm';
          if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4' };
            extension = 'mp4';
          }
          mediaRecorder = new MediaRecorder(stream, options);
          recordedChunks = [];
          mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
          };
          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: options.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `SouqBTP_Session_Record_${roomId}_${new Date().getTime()}.${extension}`;
            a.click();
            window.URL.revokeObjectURL(url);
            isRecording = false;
            if (btn) {
              btn.innerHTML = '⏺️ بدء تسجيل الجلسة';
              btn.style.background = 'rgba(220, 38, 38, 0.9)';
            }
            window.showToast('✅ تم حفظ تسجيل الجلسة!', 'success');
            stream.getTracks().forEach(track => track.stop());
          };
          mediaRecorder.start();
          isRecording = true;
          if (btn) {
            btn.innerHTML = '⏹️ إيقاف التسجيل (جاري التسجيل 🔴)';
            btn.style.background = '#b91c1c';
          }
          window.showToast('🔴 بدأ التسجيل..', 'info');
        } catch (err) {
          window.showToast('❌ تم إلغاء التسجيل أو لم يتم منح الصلاحية.', 'warning');
        }
      } else if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };

    window.generateAiRender = async () => {
      const currentPlan = window.__ARCHITECT_PLAN__ || 'basic';
      const archUid = window.__ARCHITECT_UID__ || '';

      const { data: prof } = await supabase
        .from('architects')
        .select('ai_render_count')
        .eq('user_id', archUid)
        .maybeSingle();
      const currentUsage = prof?.ai_render_count || 0;

      if (currentPlan === 'pro' && currentUsage >= 5) {
        window.showToast('🚨 لقد استنفدت رصيدك (5 محاولات) في باقة Pro!', 'error');
        return;
      }

      window.showToast(`جاري المعالجة (محاولة رقم ${currentUsage + 1}/5)... 🧠`, 'info');

      setTimeout(async () => {
        if (archUid) {
          await supabase
            .from('architects')
            .update({ ai_render_count: currentUsage + 1 })
            .eq('user_id', archUid);
        }
        const imgEl = document.getElementById('aiResultImage');
        const modalEl = document.getElementById('aiResultModal');
        if (imgEl && modalEl) {
          imgEl.src = SAMPLE_AI_RENDER_RESULT;
          modalEl.style.display = 'flex';
        }
        window.showToast('تم توليد الواقع المستقبلي بنجاح! ✨', 'success');
      }, 4000);
    };

    window.closeAiModal = () => {
      const m = document.getElementById('aiResultModal');
      if (m) m.style.display = 'none';
    };

    window.endCall = () => {
      if (peerConnection) peerConnection.close();
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      if (window.opener) window.close();
      else navigate('/v2/architect-dashboard');
    };

    init();

    return () => {
      if (peerConnection) peerConnection.close();
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      supabase.removeChannel(signalingChannel);
    };
  }, [roomId, navigate]);

  // مزامنة باقة المهندس مع الدوال العالمية
  useEffect(() => {
    window.__ARCHITECT_PLAN__ = roomPlan;
    window.__ARCHITECT_UID__ = architectUserId;
  }, [roomPlan, architectUserId]);

  const goUpgrade = () => navigate('/v2/architect/subscription');

  return (
    <div className="live-room-root" dir="rtl">
      <style>{`
        :root { --vip-purple: #8b5cf6; --neon-blue: #38bdf8; --glass-bg: rgba(15, 23, 42, 0.85); --glass-border: rgba(255, 255, 255, 0.1); --danger: #ef4444; --success: #10b981; }
        .live-room-root { font-family: 'Cairo', sans-serif; background: #020617; color: white; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; position: fixed; inset: 0; z-index: 9999; }
        .header { background: rgba(15, 23, 42, 0.95); padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
        .header h1 { margin: 0; font-size: 1.3rem; color: var(--neon-blue); display: flex; align-items: center; gap: 10px; text-shadow: 0 0 10px rgba(56, 189, 248, 0.3); font-weight: 800; }
        .header-status { font-size: 0.85rem; background: rgba(255,255,255,0.05); padding: 6px 15px; border-radius: 20px; border: 1px solid var(--glass-border); color: #cbd5e1; }
        .main-workspace { flex: 1; display: flex; position: relative; justify-content: center; align-items: center; background: #000; overflow: hidden; }
        #remoteVideo { width: 100%; height: 100%; object-fit: contain; transition: transform 0.2s ease; }
        #freezeCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; display: none; }
        #ghostContainer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 15; overflow: hidden; display: none; pointer-events: none; }
        #ghostImage { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.5; cursor: move; pointer-events: auto; width: 85vw; max-height: 85vh; object-fit: contain; border: 2px dashed var(--vip-purple); box-shadow: 0 0 30px rgba(139, 92, 246, 0.3); }
        #drawingCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 20; display: none; cursor: crosshair; background: transparent; transition: background 0.3s; }
        .grid-active { background-image: linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px) !important; background-size: 40px 40px !important; }
        .local-cam-wrapper { position: absolute !important; bottom: 20px !important; left: 20px !important; width: 140px !important; height: 190px !important; z-index: 999 !important; border-radius: 12px !important; border: 2px solid var(--neon-blue) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important; background: #000 !important; overflow: hidden !important; }
        #localVideo { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; z-index: 1 !important; }
        .cam-icon-btn { position: absolute !important; background: rgba(0,0,0,0.5) !important; color: white !important; border: 1px solid rgba(255,255,255,0.3) !important; border-radius: 50% !important; width: 32px !important; height: 32px !important; font-size: 14px !important; display: flex !important; justify-content: center !important; align-items: center !important; cursor: pointer !important; z-index: 1000 !important; backdrop-filter: blur(2px) !important; transition: 0.2s !important; }
        .cam-icon-btn:hover { background: rgba(56, 189, 248, 0.8) !important; transform: scale(1.1) !important; }
        .smart-tools { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 30px; width: 55px; height: 55px; overflow: hidden; z-index: 900; box-shadow: 0 10px 30px rgba(0,0,0,0.6); backdrop-filter: blur(12px); transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); display: flex; flex-direction: column; gap: 10px; }
        .smart-tools::before { content: '📐'; position: absolute; top: 0; left: 0; width: 55px; height: 55px; display: flex; justify-content: center; align-items: center; font-size: 1.6rem; cursor: pointer; transition: 0.3s; z-index: 10; }
        .smart-tools:hover, .smart-tools:focus-within { width: 250px; height: auto; max-height: 92%; box-sizing: border-box; border-radius: 16px; padding: 20px 15px 40px 15px; overflow-y: auto; justify-content: flex-start; z-index: 9999; }
        .smart-tools:hover::before, .smart-tools:focus-within::before { opacity: 0; pointer-events: none; }
        .smart-tools > * { opacity: 0; transition: opacity 0.3s ease 0.1s; pointer-events: none; flex-shrink: 0; }
        .smart-tools:hover > *, .smart-tools:focus-within > * { opacity: 1; pointer-events: auto; }
        .smart-tools h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #c4b5fd; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
        .btn-vip { padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.3s; font-family: 'Cairo'; font-size: 0.85rem; width: 100%; margin-bottom: 8px; color: white; display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); }
        .btn-vip:hover { background: var(--vip-purple); border-color: var(--vip-purple); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4); }
        .slider-container { background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; margin-bottom: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
        .slider-container span { font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 5px; }
        .slider-container input { width: 100%; accent-color: var(--vip-purple); cursor: pointer; }
        .drawing-tools { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 30px; width: 55px; height: 55px; overflow: hidden; z-index: 900; box-shadow: 0 10px 30px rgba(0,0,0,0.6); backdrop-filter: blur(12px); transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .drawing-tools::before { content: '🖌️'; position: absolute; top: 0; right: 0; width: 55px; height: 55px; display: flex; justify-content: center; align-items: center; font-size: 1.6rem; cursor: pointer; transition: 0.3s; z-index: 10; }
        .drawing-tools:hover, .drawing-tools:focus-within { width: 70px; height: auto; max-height: 92%; box-sizing: border-box; border-radius: 16px; padding: 20px 10px 40px 10px; overflow-y: auto; justify-content: flex-start; z-index: 9999; }
        .drawing-tools:hover::before, .drawing-tools:focus-within::before { opacity: 0; pointer-events: none; }
        .drawing-tools > * { opacity: 0; transition: opacity 0.3s ease 0.1s; pointer-events: none; flex-shrink: 0; }
        .drawing-tools:hover > *, .drawing-tools:focus-within > * { opacity: 1; pointer-events: auto; }
        .tool-btn { width: 45px; height: 45px; border-radius: 12px; cursor: pointer; font-size: 1.3rem; display: flex; justify-content: center; align-items: center; transition: 0.3s; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }
        .tool-btn:hover, .tool-btn.active { transform: scale(1.1); background: var(--neon-blue); box-shadow: 0 0 15px var(--neon-blue); border-color: var(--neon-blue); }
        .controls { background: rgba(15, 23, 42, 0.95); padding: 15px 25px; display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; border-top: 1px solid var(--glass-border); z-index: 800; box-shadow: 0 -4px 20px rgba(0,0,0,0.5); }
        .btn-control { padding: 12px 25px; border-radius: 12px; font-family: 'Cairo', sans-serif; font-weight: bold; font-size: 0.95rem; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; color: white; border: 1px solid rgba(255,255,255,0.1); }
        .btn-control:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        #vaultExplorer { position: absolute; top: 15%; left: 50%; transform: translateX(-50%); width: 90%; max-width: 500px; height: 60vh; z-index: 2000; display: none; padding: 25px; overflow-y: auto; background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--vip-purple); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.7); }
        .vault-item { background: rgba(255,255,255,0.05); padding: 12px 15px; border-radius: 10px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; border: 1px solid rgba(255,255,255,0.05); }
        .vault-item:hover { background: rgba(139, 92, 246, 0.2); border-color: var(--vip-purple); transform: translateX(-5px); }
        #toast-container { position: fixed; top: 80px; left: 20px; z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { min-width: 250px; background: var(--glass-bg); color: #fff; padding: 15px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-family: 'Cairo'; font-size: 0.9rem; font-weight: bold; display: flex; align-items: center; gap: 12px; border-right: 5px solid var(--vip-purple); }
        .toast.success { border-right-color: var(--success); }
        .toast.error { border-right-color: var(--danger); }
        .slider-label-vip { font-weight: bold; direction: ltr; display: inline-block; color: var(--neon-blue); background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
      `}</style>

      <div id="toast-container"></div>

      {/* خزانة ملفات العميل */}
      <div id="vaultExplorer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, color: 'var(--vip-purple)' }}>📂 خزانة ملفات العميل</h3>
          <button onClick={() => window.toggleVault()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>✖</button>
        </div>
        <div id="vaultList" style={{ color: '#94a3b8', textAlign: 'center' }}>⏳ جاري جلب المخططات المرخصة...</div>
      </div>

      {/* نافذة نتيجة الذكاء الاصطناعي */}
      <div id="aiResultModal" style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 3000, justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }}>
        <div style={{ background: 'var(--glass-bg)', padding: '25px', borderRadius: '16px', border: '2px solid var(--vip-purple)', textAlign: 'center', maxWidth: '85%', maxHeight: '85vh', overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 10px 0', color: 'var(--vip-purple)', fontWeight: 'bold' }}>✨ نتيجة الواقع المستقبلي</h2>
          <img id="aiResultImage" src="" alt="AI Result" style={{ width: '100%', maxHeight: '60vh', borderRadius: '8px', marginBottom: '20px' }} />
          <button className="btn-control" style={{ background: 'var(--danger)', width: '100%', justifyContent: 'center' }} onClick={() => window.closeAiModal()}>إغلاق النافذة</button>
        </div>
      </div>

      {/* الشريط العلوي المطابق للصورة */}
      <div className="header">
        <h1>
          📐 المكتب الهندسي{' '}
          <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '5px' }}>
            LIVE VIP
          </span>
        </h1>
        <div className="header-status" id="connection-status">
          ⏳ جاري الاتصال بالعميل...
        </div>
      </div>

      {/* مساحة العمل الرئيسية */}
      <div className="main-workspace" id="workspace">
        <video id="remoteVideo" autoPlay playsInline></video>
        <canvas id="freezeCanvas"></canvas>

        <div id="ghostContainer">
          <img id="ghostImage" src="" alt="" />
        </div>
        <canvas id="drawingCanvas"></canvas>

        {/* الكاميرا المصغرة أسفل اليسار */}
        <div className="local-cam-wrapper">
          <video id="localVideo" autoPlay playsInline muted></video>
          <button className="cam-icon-btn" style={{ top: '5px', right: '5px' }} onClick={() => window.toggleTorch()} title="الكشاف">💡</button>
          <button className="cam-icon-btn" style={{ bottom: '5px', right: '5px' }} onClick={() => window.toggleCamera()} title="تبديل الكاميرا">🔄</button>
        </div>

        {/* فقاعة أدوات الرسم اليمنى 🖌️ */}
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

        {/* فقاعة الأدوات الهندسية اليسرى 📐 */}
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

          <div id="boq-panel" style={{ display: 'none', position: 'fixed', left: '280px', top: '50%', transform: 'translateY(-50%)', width: '280px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--vip-purple)', borderRadius: '16px', padding: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zIndex: 10000 }}>
            <h3 style={{ color: 'var(--vip-purple)', fontSize: '1rem', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>🧮 حساب الكميات التقديري</h3>
            <div id="boq-result" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}></div>
            <button className="btn-vip" style={{ background: 'var(--vip-purple)', marginTop: '15px' }} onClick={() => { document.getElementById('boq-panel').style.display = 'none'; }}>إغلاق الحساب</button>
          </div>

          <h4 style={{ color: '#38bdf8', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', paddingBottom: '8px', marginBottom: '12px' }}>📏 المسطرة الذكية</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            {roomPlan === 'pro' || roomPlan === 'vip' ? (
              <>
                <button className="btn-vip" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', margin: 0, padding: '12px 5px', color: '#38bdf8' }} onClick={e => window.setMeasureMode('calibrate', e.currentTarget)}>🎯 معايرة</button>
                <button className="btn-vip" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', margin: 0, padding: '12px 5px', color: '#38bdf8' }} onClick={e => window.setMeasureMode('measure', e.currentTarget)}>📏 قياس</button>
              </>
            ) : (
              <>
                <button className="btn-vip" style={{ background: '#1e293b', border: '1px solid #334155', margin: 0, padding: '10px 5px', color: '#94a3b8', cursor: 'not-allowed' }} onClick={goUpgrade}>🎯 معايرة 🔒</button>
                <button className="btn-vip" style={{ background: '#1e293b', border: '1px solid #334155', margin: 0, padding: '10px 5px', color: '#94a3b8', cursor: 'not-allowed' }} onClick={goUpgrade}>📏 قياس 🔒</button>
              </>
            )}
          </div>

          <div id="measureStatus" style={{ fontSize: '0.75rem', color: '#38bdf8', textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '5px', display: 'none' }}></div>

          <h4>الواقع المعزز (AR)</h4>
          <button className="btn-vip" style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--vip-purple)' }} onClick={() => window.toggleVault()}>📂 خزانة المخططات</button>
          <button className="btn-vip" style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid var(--neon-blue)' }} onClick={() => document.getElementById('ghostUpload').click()}>🗺️ رفع مخطط خارجي</button>
          <input type="file" id="ghostUpload" accept="image/*" style={{ display: 'none' }} onChange={e => window.loadGhost(e)} />

          <button className="btn-vip" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => window.toggleGrid()}>📏 تفعيل/إخفاء الشبكة</button>

          <div className="slider-container" style={{ marginTop: '10px' }}>
            <span>شفافية المخطط (Opacity) <b id="opValue" className="slider-label-vip">50%</b></span>
            <input type="range" id="ghostOpacity" min="0" max="100" step="1" defaultValue="50" onChange={e => window.updateGhostOpacity(e.target.value)} />
          </div>
          <div className="slider-container">
            <span>تكبير المخطط (Scale) <b id="scaleValue" className="slider-label-vip">1.0x</b></span>
            <input type="range" id="ghostScale" min="0.1" max="3" step="0.05" defaultValue="1" onChange={e => window.updateGhostScale(e.target.value)} />
          </div>
          <div className="slider-container">
            <span>دوران المخطط 🔄 <b id="rotValue" className="slider-label-vip">0°</b></span>
            <input type="range" id="ghostRotation" min="-180" max="180" step="1" defaultValue="0" onChange={e => window.updateGhostRotation(e.target.value)} />
          </div>

          <button className="btn-vip" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444' }} onClick={() => window.hideGhost()}>❌ إخفاء المخطط</button>

          <div id="layersPanel" style={{ display: 'none', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', marginTop: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#38bdf8', textAlign: 'center', fontSize: '0.8rem' }}>📑 الطبقات المحملة</h5>
            <div id="layersList" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}></div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', margin: '10px 0' }} />

          <h4 style={{ margin: '5px 0', color: 'var(--vip-purple)' }}>✨ Meta-Builder AI</h4>
          <select id="aiRoomType" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontFamily: 'Cairo', fontSize: '0.85rem', marginBottom: '8px' }}>
            <option value="صالون مغربي عصري فاخر">🛋️ صالون مغربي</option>
            <option value="مطبخ حديث بتصميم مفتوح">🍳 مطبخ حديث</option>
            <option value="غرفة نوم رئيسية فخمة">🛏️ غرفة نوم رئيسية</option>
            <option value="حمام فندقي فاخر رخام">🛁 حمام فندقي</option>
            <option value="واجهة منزل خارجية عصرية">🏡 واجهة خارجية</option>
          </select>
          <input type="text" id="aiPrompt" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontFamily: 'Cairo', fontSize: '0.8rem', marginBottom: '8px', boxSizing: 'border-box' }} placeholder="إضافات (مثال: رخام أسود، إضاءة دافئة...)" />

          {roomPlan === 'vip' || roomPlan === 'pro' ? (
            <button className="btn-vip" style={{ background: 'var(--vip-purple)', color: 'white', borderColor: 'var(--vip-purple)', fontSize: '1rem', padding: '15px' }} onClick={() => window.generateAiRender()}>✨ توليد الواقع المستقبلي</button>
          ) : (
            <button className="btn-vip" style={{ background: '#0f172a', color: '#fbbf24', borderColor: '#fbbf24', fontSize: '1rem', padding: '15px', cursor: 'not-allowed' }} onClick={goUpgrade}>✨ توليد الواقع المستقبلي 🔒</button>
          )}

          <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', margin: '10px 0' }} />

          <button className="btn-vip" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', color: 'var(--success)' }} onClick={() => window.saveLocalCopy()}>💾 حفظ نسخة محلية</button>

          {roomPlan === 'pro' || roomPlan === 'vip' ? (
            <button id="btn-seal" className="btn-vip" style={{ background: 'rgba(139, 92, 246, 0.2)', borderColor: 'var(--vip-purple)' }} onClick={() => window.sealAndAuthenticate()}>🏛️ ختم ومصادقة (GPS)</button>
          ) : (
            <button id="btn-seal" className="btn-vip" style={{ background: '#1e293b', color: '#64748b', borderColor: '#334155', cursor: 'not-allowed' }} onClick={goUpgrade}>🏛️ ختم ومصادقة (GPS) 🔒</button>
          )}
        </div>
      </div>

      {/* شريط التحكم السفلي المطابق للصورة */}
      <div className="controls">
        <button className="btn-control" style={{ background: 'rgba(239, 68, 68, 0.8)' }} onClick={() => window.endCall()}>☎️ إنهاء الجلسة</button>

        {roomPlan === 'vip' ? (
          <button className="btn-control" id="recordBtn" style={{ background: 'rgba(220, 38, 38, 0.9)', borderColor: '#ef4444' }} onClick={() => window.toggleRecording()}>⏺️ بدء تسجيل الجلسة</button>
        ) : (
          <button className="btn-control" style={{ background: '#1e293b', color: '#64748b', borderColor: '#334155', cursor: 'not-allowed' }} onClick={goUpgrade}>⏺️ تسجيل الجلسة 🔒</button>
        )}

        {roomPlan === 'pro' || roomPlan === 'vip' ? (
          <button className="btn-control" style={{ background: 'rgba(56, 189, 248, 0.8)', borderColor: '#38bdf8' }} onClick={() => window.generatePDFReport()}>📄 استخراج تقرير PDF</button>
        ) : (
          <button className="btn-control" style={{ background: '#1e293b', color: '#64748b', borderColor: '#334155', cursor: 'not-allowed' }} onClick={goUpgrade}>📄 استخراج تقرير PDF 🔒</button>
        )}

        <button className="btn-control" style={{ background: 'rgba(139, 92, 246, 0.8)' }} id="freezeBtn" onClick={() => window.toggleFreezeState()}>❄️ تجميد الشاشة للتدقيق</button>
      </div>
    </div>
  );
}