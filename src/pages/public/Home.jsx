import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import fixWebmDuration from 'fix-webm-duration';
import {
  Calendar, Clock, MapPin, Landmark, GraduationCap,
  User, Award, Trophy, Camera, Users,
  ExternalLink, Download, CalendarPlus,
  Share2, X, ArrowLeft, Film, ImageIcon, CheckCircle2, Loader2, ChevronsRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────────── */
function useParticles(canvasRef, invMode) {
  const pts = useRef([]);
  const af  = useRef(null);
  const inv = useRef(invMode);
  useEffect(() => { inv.current = invMode; }, [invMode]);

  const spawn = useCallback((n, burst) => {
    const pc = canvasRef.current;
    if (!pc) return;
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      pts.current.push({
        x: Math.random() * pc.width,
        y: burst ? Math.random() * pc.height : pc.height + 10,
        vx: (Math.random() - .5) * (inv.current ? .3 : .7),
        vy: -(Math.random() * (inv.current ? .5 : 1.4)) - .2,
        r: Math.random() * (inv.current ? 1.3 : 2.2) + .3,
        alpha: inv.current ? Math.random() * .3 + .08 : Math.random() * .65 + .2,
        life: 1,
        decay: Math.random() * (inv.current ? .003 : .005) + .0015,
        t,
      });
    }
  }, [canvasRef]);

  useEffect(() => {
    const pc  = canvasRef.current;
    if (!pc) return;
    const ctx = pc.getContext('2d');
    const rz = () => { pc.width = window.innerWidth; pc.height = window.innerHeight; };
    rz();
    window.addEventListener('resize', rz);
    const draw = () => {
      ctx.clearRect(0, 0, pc.width, pc.height);
      pts.current = pts.current.filter(p => p.life > 0);
      pts.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = inv.current
          ? (p.t < .7 ? `rgba(201,168,76,${p.life * p.alpha * .45})` : `rgba(255,255,255,${p.life * p.alpha * .15})`)
          : (p.t < .55 ? `rgba(201,168,76,${p.life * p.alpha})` : `rgba(100,160,255,${p.life * p.alpha * .5})`);
        ctx.fill();
      });
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', rz); if (af.current) cancelAnimationFrame(af.current); };
  }, [canvasRef]);

  return spawn;
}

/* ─────────────────────────────────────────────
   COUNTDOWN HOOK
───────────────────────────────────────────── */
function useCountdown(targetDate) {
  const [t, setT] = useState({ d: '00', h: '00', m: '00', s: '00' });
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setT({ d: '00', h: '00', m: '00', s: '00' }); return; }
      setT({
        d: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

/* ─────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────── */
function useScrollReveal(active) {
  useEffect(() => {
    if (!active) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('sr-on'); io.unobserve(e.target); } });
    }, { threshold: .1 });
    document.querySelectorAll('.sr, .sr-stg, .sr-tl').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [active]);
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Home() {
  const { name } = useParams();
  const location = useLocation();
  const routeKey = location.pathname.split('/')[1]; // e.g. 'iit-tech', 'isb'
  const faculty  = routeKey.startsWith('iit-') ? 'iit' : 'isb';
  const personName = name
    ? decodeURIComponent(name).replace(/[-_+]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '';
  const videoSrc = faculty === 'iit' ? '/media/iit_video.mp4' : '/media/isb_video.mp4';

  const POSTER_MAP = {
    'iit-genie-info': '/media/iit-genie-info.jpeg',
    'isb':            '/media/isb.jpeg',
  };
  const posterSrc = POSTER_MAP[routeKey] || '/media/C%C3%A9r%C3%A9monie-de-Remise-des-Dipl%C3%B4mes-06-11-2026_05_02_PM.png';

  const HERO_IMG_MAP = {
    'iit-genie-info': '/media/iit-genie-info.jpeg',
    'isb':            '/media/isb.jpeg',
  };
  const heroImg = HERO_IMG_MAP[routeKey] || '/media/section1.webp';

  const canvasRef  = useRef(null);
  const videoRef   = useRef(null);
  const timerRef   = useRef(null);

  const [phase,      setPhase]      = useState('opening');
  const [ctaHide,    setCtaHide]    = useState(false);
  const [invVisible, setInvVisible] = useState(false);
  const [rsvpDone,   setRsvpDone]   = useState(false);
  const [calPopOpen, setCalPopOpen] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  /* ─── share feature ─── */
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePlat, setSharePlat] = useState(null);  // 'facebook' | 'instagram'
  const [shareFmt,  setShareFmt]  = useState(null);  // 'reel' | 'story'
  const [shareStep, setShareStep] = useState('platform'); // platform | format | generating | done
  const [shareProg, setShareProg] = useState(0);
  const [tipVis,    setTipVis]    = useState(false);

  const spawn = useParticles(canvasRef, false);
  useScrollReveal(invVisible);

  /* Static data — no backend */
  const hero      = { subheading: 'Celebrating Achievement, Dedication & Success' };
  const EVENT_MAP = {
    'iit-tech':       { date: '22 Juillet 2026', time: '21h00',  location: 'Salle des Fêtes LAYELI' },
    'iit-genie-info': { date: '23 Juillet 2026', time: '15h30',  location: 'Salle des Fêtes LAYELI' },
    'iit-li-arch':    { date: '23 Juillet 2026', time: '21h00',  location: 'Salle des Fêtes LAYELI' },
    'isb':            { date: '22 Juillet 2026', time: '15h30',  location: 'Salle des Fêtes LAYELI' },
  };
  const eventInfo = EVENT_MAP[routeKey] || { date: '22 Juillet 2026', time: '21h00', location: 'Salle des Fêtes LAYELI' };
  const welcome   = { heading: 'Dear Graduates,', body: 'Today marks the beginning of a new chapter filled with opportunities, challenges, and endless possibilities. Your hard work, perseverance, and dedication have brought you to this moment.' };
  const rsvpSec   = { heading: 'RSVP' };
  const quoteSec  = { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' };
  const footerSec = { text: "Thank you for being part of this important milestone. Let's celebrate success, together." };

  const COUNTDOWN_MAP = {
    'iit-tech':       '2026-07-22T21:00:00',
    'iit-genie-info': '2026-07-23T15:30:00',
    'iit-li-arch':    '2026-07-23T21:00:00',
    'isb':            '2026-07-22T15:30:00',
  };
  const cd = useCountdown(COUNTDOWN_MAP[routeKey] || '2026-07-22T21:00:00');

  /* Opening click — play video with audio */
  const handleOpeningClick = () => {
    if (phase !== 'opening') return;
    setPhase('playing');
    setCtaHide(true);
    spawn(80, true);
    const v = videoRef.current;
    if (!v) { showInvitation(); return; }
    v.currentTime = 0;
    v.muted = false;
    v.volume = 1;
    v.play().catch(() => {
      /* Browser blocked audio — play muted and show unmute button */
      v.muted = true;
      setVideoMuted(true);
      v.play().catch(() => showInvitation());
    });
  };

  /* Unmute button handler */
  const handleUnmute = e => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    setVideoMuted(false);
  };

  /* After video ends */
  const showInvitation = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    spawn(200, true);
    setPhase('invitation');
    setInvVisible(true);
    document.body.style.overflowY = 'auto';
    timerRef.current = setInterval(() => spawn(4, false), 90);
    setTimeout(() => {
      document.querySelectorAll('.hero-rv').forEach((el, i) => {
        setTimeout(() => el.classList.add('sr-on'), i * 80);
      });
    }, 700);
  }, [spawn]);

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  /* Calendar handlers */
  const openGcal = () => {
    window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Graduation+Ceremony+2026&dates=20260615T090000Z/20260615T120000Z&details=Class+of+2026+%E2%80%93+North+American+Private+University+Sfax&location=North+American+Private+University+Sfax%2C+Tunisia', '_blank');
    setCalPopOpen(false);
  };
  const downloadIcs = () => {
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Graduation 2026//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','DTSTART:20260615T090000Z','DTEND:20260615T120000Z','SUMMARY:Graduation Ceremony 2026','DESCRIPTION:Class of 2026 – North American Private University Sfax','LOCATION:North American Private University Sfax\\, Tunisia','URL:https://maps.app.goo.gl/byVQRVk7rJo8NN8L8','END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'graduation-ceremony-2026.ics';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
    setCalPopOpen(false);
  };

  /* RSVP — local only */
  const [form, setForm] = useState({ name: '', email: '', guests: '1', message: '' });
  const [rsvpPending, setRsvpPending] = useState(false);
  const submitRsvp = e => {
    e.preventDefault();
    setRsvpPending(true);
    setTimeout(() => { setRsvpPending(false); setRsvpDone(true); }, 800);
  };

  /* ─── tooltip pulse ─── */
  useEffect(() => {
    if (!invVisible) return;
    const show = () => { setTipVis(true); setTimeout(() => setTipVis(false), 3200); };
    const t0 = setTimeout(show, 2500);
    const iv = setInterval(show, 9000);
    return () => { clearTimeout(t0); clearInterval(iv); };
  }, [invVisible]);

  /* ─── share handlers ─── */
  const openShare  = () => { setShareStep('platform'); setSharePlat(null); setShareFmt(null); setShareProg(0); setShareOpen(true); };
  const closeShare = () => setShareOpen(false);
  const selectPlatform = p => { setSharePlat(p); setShareStep('format'); };
  const selectFormat = async fmt => {
    setShareFmt(fmt); setShareStep('generating'); setShareProg(0);
    try {
      await generateReel();
    } catch (err) {
      console.error('Share generation failed:', err);
      setShareStep('format');
    }
  };

  /* ─── Story: high-quality canvas PNG ─── */
  const generateStory = () => new Promise(resolve => {
    const W = 1080, H = 1920;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const cx = cv.getContext('2d');

    const bg = cx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#06101a'); bg.addColorStop(.5, '#0d1a2e'); bg.addColorStop(1, '#06101a');
    cx.fillStyle = bg; cx.fillRect(0, 0, W, H);
    setShareProg(18);

    cx.strokeStyle = 'rgba(201,168,76,.38)'; cx.lineWidth = 4;
    cx.strokeRect(40, 40, W-80, H-80);
    [[40,40,1,1],[W-40,40,-1,1],[40,H-40,1,-1],[W-40,H-40,-1,-1]].forEach(([bx,by,sx,sy]) => {
      cx.strokeStyle = '#c9a84c'; cx.lineWidth = 4;
      cx.beginPath(); cx.moveTo(bx, by+sy*36); cx.lineTo(bx, by); cx.lineTo(bx+sx*36, by); cx.stroke();
    });
    cx.fillStyle = '#c9a84c';
    cx.fillRect(W/2-80, 195, 160, 2.5);
    cx.fillRect(W/2-80, H-245, 160, 2.5);
    setShareProg(38);

    cx.textAlign = 'center';
    cx.font = 'bold 38px sans-serif'; cx.fillStyle = '#c9a84c';
    cx.fillText('CLASS OF 2026', W/2, 258);
    cx.font = 'bold 120px serif'; cx.fillStyle = '#fff';
    cx.fillText('Graduation', W/2, H/2-220);
    cx.fillText('Ceremony',   W/2, H/2-75);
    cx.font = 'bold 152px serif'; cx.fillStyle = '#c9a84c';
    cx.fillText('2026', W/2, H/2+115);
    setShareProg(62);

    cx.font = '44px serif'; cx.fillStyle = 'rgba(255,255,255,.84)';
    [eventInfo.date||'22 Juillet 2026', eventInfo.time||'21h00',
     eventInfo.location||'Salle des Fêtes LAYELI',
    ].forEach((ln,i) => cx.fillText(ln, W/2, H/2+265+i*72));

    for (let i = 0; i < 3; i++) {
      cx.beginPath(); cx.arc(W/2+(i-1)*40, H-118, 7, 0, Math.PI*2);
      cx.fillStyle = 'rgba(201,168,76,.68)'; cx.fill();
    }
    setShareProg(90);

    cv.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'graduation-story-2026.png';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setShareProg(100); setShareStep('done'); resolve();
    }, 'image/png');
  });

  /* ─── Reel: pre-capture sections → record video → draw sections (no canvas freeze) ─── */
  const generateReel = async () => {
    const cv = document.createElement('canvas');
    cv.width = 1080; cv.height = 1920;
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;

    if (typeof cv.captureStream !== 'function' || !window.MediaRecorder) {
      console.info('Video not supported on this browser — saving Story image instead.');
      await generateStory(); return;
    }

    const mimeType = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm',
    ].find(m => { try { return MediaRecorder.isTypeSupported(m); } catch { return false; } }) || 'video/webm';
    const fileExt = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';

    // ── SYNCHRONOUS — user gesture still active, no await yet ──
    const vid = document.createElement('video');
    vid.src = videoSrc;
    vid.playsInline = true;
    vid.preload = 'auto';
    vid.volume = 1;
    // Must be in the DOM: Chrome skips audio decoding for detached elements
    vid.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    document.body.appendChild(vid);
    vid.load();

    // Route audio through Web Audio: captured for the recording stream but SILENT through speakers.
    // createMediaElementSource intercepts the element's audio output entirely.
    // Connecting only to MediaStreamDestinationNode (not audioCtx.destination) means
    // audio is decoded and available to the recorder but never reaches the speakers.
    let _recAudioTracks = [];
    let _audioCtx = null;
    const _vidCapStream = (typeof vid.captureStream === 'function') ? vid.captureStream() : null;
    try {
      const ACtx = window.AudioContext || window.webkitAudioContext;
      if (ACtx) {
        _audioCtx = new ACtx();
        const _src  = _audioCtx.createMediaElementSource(vid);
        const _dest = _audioCtx.createMediaStreamDestination();
        _src.connect(_dest); // audio goes to recorder only — speakers hear nothing
        _recAudioTracks = _dest.stream.getAudioTracks();
      }
    } catch (e) { console.warn('Web Audio silent route failed, falling back:', e); }

    // Start playback within the user gesture — audio autoplay is guaranteed here
    vid.play().catch(() => {});

    /* ── STEP 1: prepare slide captures ── */
    const captures = [];

    // Slide 0: promotional poster PNG shown right after the campus video
    setShareProg(5);
    await new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { captures.push(img); resolve(); };
      img.onerror = () => resolve();
      img.src = posterSrc;
    });
    setShareProg(15);

    setShareProg(30);

    /* ── STEP 2: wait for video ready (loaded during html2canvas) ── */
    await Promise.race([
      new Promise(r => {
        if (vid.readyState >= 3) { r(); return; }
        vid.addEventListener('canplay', r, { once: true });
        vid.addEventListener('error', r, { once: true });
      }),
      new Promise(r => setTimeout(r, 10000)),
    ]);
    vid.currentTime = 0;
    await new Promise(r => {
      if (!vid.seeking) { r(); return; }
      vid.addEventListener('seeked', r, { once: true });
    });
    // Restart after seek (some browsers pause on seek) and wait for audio to flow
    vid.play().catch(() => {});
    // Ensure AudioContext is running after the await chain (may have been auto-suspended)
    if (_audioCtx && _audioCtx.state !== 'running') {
      try { await _audioCtx.resume(); } catch { }
    }
    await new Promise(r => setTimeout(r, 200));
    setShareProg(38);

    /* ── STEP 3: build recording stream ── */
    const canvasStream = cv.captureStream(30);
    // Fallback: if Web Audio setup failed use captureStream tracks (audio plays through speakers)
    if (_recAudioTracks.length === 0 && _vidCapStream) {
      _recAudioTracks = _vidCapStream.getAudioTracks();
    }
    const recStream = _recAudioTracks.length > 0
      ? new MediaStream([...canvasStream.getVideoTracks(), ..._recAudioTracks])
      : canvasStream;

    /* ── STEP 4: initial frame + start recorder ── */
    cx.fillStyle = '#06101a';
    cx.fillRect(0, 0, W, H);

    const rec = new MediaRecorder(recStream, { mimeType, videoBitsPerSecond: 8_000_000 });
    const chunks = [];
    rec.ondataavailable = e => e.data.size > 0 && chunks.push(e.data);
    let recStartMs = 0;
    const recDone = new Promise(res => {
      rec.onstop = async () => {
        let blob = new Blob(chunks, { type: mimeType });
        if (mimeType.includes('webm')) {
          try { blob = await fixWebmDuration(blob, Date.now() - recStartMs, { logger: false }); } catch { }
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `graduation-reel-2026.${fileExt}`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        res();
      };
    });
    rec.start(100);
    recStartMs = Date.now();

    /* ── STEP 5: campus video — draw frames until ended or MAX_VID seconds ──
       vid.play() was called above in gesture context with volume=0.001.
       After seeking to 0 it continues playing. Do NOT mute (kills audio decoder). */
    const MAX_VID = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration + 2 : 60;
    await new Promise(res => {
      let done = false;
      const finish = () => { if (done) return; done = true; vid.pause(); if (vid.parentNode) vid.parentNode.removeChild(vid); if (_audioCtx) _audioCtx.close().catch(() => {}); res(); };
      vid.addEventListener('ended', finish, { once: true });
      const t0 = Date.now();
      // If play() failed earlier (edge case), retry without muting to preserve audio
      if (vid.paused) vid.play().catch(() => setTimeout(finish, 200));
      const frame = () => {
        if (done) return;
        const elapsed = (Date.now() - t0) / 1000;
        if (elapsed >= MAX_VID) { finish(); return; }
        cx.fillStyle = '#06101a';
        cx.fillRect(0, 0, W, H);
        if (vid.videoWidth > 0) {
          try {
            const vr = vid.videoWidth / vid.videoHeight, cr = W / H;
            let sx = 0, sy = 0, sw = vid.videoWidth, sh = vid.videoHeight;
            if (vr > cr) { sw = sh * cr; sx = (vid.videoWidth - sw) / 2; }
            else         { sh = sw / cr; sy = (vid.videoHeight - sh) / 2; }
            cx.drawImage(vid, sx, sy, sw, sh, 0, 0, W, H);
          } catch { }
        }
        setShareProg(38 + (elapsed / MAX_VID) * 25);
        requestAnimationFrame(frame);
      };
      frame();
    });
    setShareProg(63);

    /* ── STEP 6: poster PNG slide ── */
    const SLIDE_MS = 4000;
    for (let i = 0; i < captures.length; i++) {
      const cap = captures[i];
      await new Promise(res => {
        let done = false;
        const ar = cap.width / cap.height;
        let scale, xOff, yOff, maxPan, needsBg;
        if (ar < 1.5) {
          scale  = Math.max(W / cap.width, H / cap.height);
          xOff   = (W - cap.width  * scale) / 2;
          yOff   = Math.max(0, (H - cap.height * scale) / 2);
          maxPan = Math.max(0, cap.height * scale - H);
          needsBg = false;
        } else {
          scale  = W / cap.width;
          xOff   = 0;
          yOff   = Math.max(0, (H - cap.height * scale) / 2);
          maxPan = 0;
          needsBg = true;
        }
        const sw = cap.width * scale, sh = cap.height * scale;
        const bgScale = Math.max(W / cap.width, H / cap.height);
        const bgW = cap.width * bgScale, bgH = cap.height * bgScale;
        const bgX = (W - bgW) / 2, bgY = (H - bgH) / 2;
        const t0 = Date.now();
        const fallback = setTimeout(() => { done = true; res(); }, SLIDE_MS + 1000);
        const draw = () => {
          if (done) return;
          const elapsed = Date.now() - t0;
          if (elapsed >= SLIDE_MS) { done = true; clearTimeout(fallback); res(); return; }
          const t = elapsed / SLIDE_MS;
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          const alpha = Math.min(elapsed / 400, 1);
          cx.fillStyle = '#06101a'; cx.fillRect(0, 0, W, H);
          cx.globalAlpha = alpha;
          if (needsBg) {
            try { cx.filter = 'blur(22px) brightness(0.35)'; cx.drawImage(cap, bgX, bgY, bgW, bgH); cx.filter = 'none'; }
            catch { cx.filter = 'none'; }
          }
          try { cx.drawImage(cap, xOff, yOff - maxPan * ease, sw, sh); } catch { }
          cx.globalAlpha = 1;
          setShareProg(63 + (elapsed / SLIDE_MS) * 18);
          setTimeout(draw, 33);
        };
        draw();
      });
    }

    /* ── STEP 7: countdown slide drawn directly on canvas ──
       Canvas 2D renders glow rings, shadows, and Playfair Display text natively —
       identical to the website without html2canvas rendering artifacts. */
    await new Promise(res => {
      let done = false;
      const t0 = Date.now();
      const fallback = setTimeout(() => { done = true; res(); }, SLIDE_MS + 1000);
      const GOLD = '#c9a84c', GOLDL = '#e8c76e';
      const units = [
        { val: String(cd.d || '00'), lbl: 'DAYS' },
        { val: String(cd.h || '00'), lbl: 'HOURS' },
        { val: String(cd.m || '00'), lbl: 'MINUTES' },
        { val: String(cd.s || '00'), lbl: 'SECONDS' },
      ];
      const ringR  = 150;   // main ring radius  → 300px diameter circles
      const cxMid  = W / 2; // 540
      const cy0    = 400;   // first circle center Y
      const cyStep = 375;   // center-to-center (300 diameter + 75 gap)

      const paintCountdown = alpha => {
        cx.fillStyle = '#06101a'; cx.fillRect(0, 0, W, H);
        cx.globalAlpha = alpha;

        // Section header
        cx.save();
        cx.textAlign = 'center';
        cx.font = '700 30px "Inter",sans-serif';
        cx.fillStyle = GOLD;
        cx.fillText('COUNTDOWN', cxMid, 128);
        cx.font = 'italic 38px "Cormorant Garamond",serif';
        cx.fillStyle = 'rgba(255,255,255,0.62)';
        cx.fillText('The big day is coming!', cxMid, 188);
        cx.restore();

        units.forEach((unit, idx) => {
          const cy = cy0 + idx * cyStep;

          // Inner radial glow fill
          const grad = cx.createRadialGradient(cxMid, cy - ringR * 0.08, 0, cxMid, cy, ringR * 1.15);
          grad.addColorStop(0, 'rgba(201,168,76,0.08)');
          grad.addColorStop(1, 'transparent');
          cx.fillStyle = grad;
          cx.beginPath(); cx.arc(cxMid, cy, ringR * 1.15, 0, Math.PI * 2); cx.fill();

          // Outermost faint ring (SVG r=92)
          cx.beginPath(); cx.arc(cxMid, cy, ringR * 92 / 79, 0, Math.PI * 2);
          cx.strokeStyle = 'rgba(201,168,76,0.14)'; cx.lineWidth = 1; cx.stroke();

          // Second faint ring (SVG r=86)
          cx.beginPath(); cx.arc(cxMid, cy, ringR * 86 / 79, 0, Math.PI * 2);
          cx.strokeStyle = 'rgba(201,168,76,0.28)'; cx.lineWidth = 2; cx.stroke();

          // Main ring — 4 passes with increasing shadowBlur replicate the SVG drop-shadow stack
          cx.save();
          [[4, 1, 4.4], [14, 0.8, 3.0], [36, 0.45, 2.0], [80, 0.2, 1.0]].forEach(([blur, opac, lw]) => {
            cx.shadowColor = `rgba(201,168,76,${opac})`;
            cx.shadowBlur  = blur;
            cx.beginPath(); cx.arc(cxMid, cy, ringR, 0, Math.PI * 2);
            cx.strokeStyle = GOLDL; cx.lineWidth = lw; cx.stroke();
          });
          cx.restore();

          // Inner faint ring (SVG r=72)
          cx.beginPath(); cx.arc(cxMid, cy, ringR * 72 / 79, 0, Math.PI * 2);
          cx.strokeStyle = 'rgba(201,168,76,0.22)'; cx.lineWidth = 1.6; cx.stroke();

          // Number
          cx.save();
          cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
          cx.font = '700 118px "Playfair Display",Playfair Display,serif';
          cx.fillStyle = GOLDL;
          cx.shadowColor = 'rgba(201,168,76,0.65)'; cx.shadowBlur = 30;
          cx.fillText(unit.val, cxMid, cy + 38);
          cx.restore();

          // Label
          cx.save();
          cx.textAlign = 'center'; cx.textBaseline = 'top';
          cx.font = '700 20px "Inter",sans-serif';
          cx.fillStyle = GOLD;
          cx.fillText(unit.lbl, cxMid, cy + 48);
          cx.restore();
        });

        cx.globalAlpha = 1;
      };

      const drawFrame = () => {
        if (done) return;
        const elapsed = Date.now() - t0;
        if (elapsed >= SLIDE_MS) { done = true; clearTimeout(fallback); res(); return; }
        paintCountdown(Math.min(elapsed / 400, 1));
        setShareProg(81 + (elapsed / SLIDE_MS) * 19);
        setTimeout(drawFrame, 33);
      };
      drawFrame();
    });

    rec.stop();
    await recDone;
    setShareProg(100); setShareStep('done');
  };

  /* ───────────────── RENDER ───────────────── */
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --gold:#c9a84c; --goldl:#e8c76e; --goldd:#9e7a2e; --dark:#06101a; }
        html, body { width:100%; overflow-x:hidden; background:var(--dark); font-family:'Inter',sans-serif; }
        #pcanvas { position:fixed; inset:0; z-index:9999; pointer-events:none; }

        /* OPENING */
        #opening { position:fixed; inset:0; z-index:1000; background:#000; cursor:pointer; overflow:hidden; transition:opacity .7s ease; }
        #opening.fade { opacity:0; pointer-events:none; }
        #bg-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; }
        .unmute-btn { position:absolute; bottom:2rem; right:1.5rem; z-index:4; display:flex; align-items:center; gap:.5rem; padding:.55rem 1.1rem; background:rgba(6,14,26,.72); backdrop-filter:blur(10px); border:1px solid rgba(201,168,76,.45); border-radius:20px; color:var(--goldl); font-size:.72rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; animation:fadeUp .5s ease both; }
        .unmute-btn:hover { background:rgba(201,168,76,.18); }
        .skip-btn { position:absolute; bottom:2rem; left:1.5rem; z-index:4; display:flex; align-items:center; gap:.45rem; padding:.52rem 1.1rem; background:rgba(6,14,26,.72); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.22); border-radius:20px; color:rgba(255,255,255,.72); font-size:.68rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; animation:fadeUp .6s ease .8s both; transition:background .2s,border-color .2s,color .2s; }
        .skip-btn:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.45); color:#fff; }
        .skip-btn svg { width:15px; height:15px; stroke:currentColor; fill:none; stroke-width:2; }
        .open-overlay { position:absolute; inset:0; background:linear-gradient(to bottom,rgba(6,16,26,.30) 0%,rgba(6,16,26,.15) 44%,rgba(6,16,26,.42) 100%); }
        .open-overlay::after { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:100%; height:60%; background:radial-gradient(ellipse at center,rgba(6,16,26,.32) 0%,transparent 68%); pointer-events:none; }
        .cta-wrap { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem; padding:2.5rem 2rem; transition:opacity .9s ease,transform .9s ease; }
        .cta-wrap.hide { opacity:0; transform:scale(1.08); pointer-events:none; }
        .cta-eyebrow { font-size:.62rem; font-weight:700; letter-spacing:.42em; text-transform:uppercase; color:var(--gold); text-shadow:0 0 14px rgba(201,168,76,.7); animation:fadeUp .7s ease .2s both; }
        .cta-title { font-family:'Playfair Display',serif; font-size:clamp(2.5rem,8vw,3.8rem); color:#fff; text-align:center; line-height:1.15; text-shadow:0 2px 12px rgba(0,0,0,.9),0 0 40px rgba(201,168,76,.35); animation:floatGlow 3.5s ease-in-out infinite,fadeUp .7s ease .1s both; }
        .cta-btn { border:1.5px solid rgba(201,168,76,.6); background:rgba(6,16,26,.55); backdrop-filter:blur(14px); color:var(--goldl); font-family:'Cormorant Garamond',serif; font-size:1.05rem; letter-spacing:.24em; text-transform:uppercase; padding:.9rem 2.8rem; border-radius:2px; cursor:pointer; animation:pulseBorder 2.8s ease-in-out infinite,fadeUp .7s ease .4s both; }

        /* INVITATION */
        #inv { display:none; }
        #inv.on { display:flex; flex-direction:column; gap:.75rem; padding:0 0 .75rem; }
        .card { border-radius:18px; border:1px solid rgba(201,168,76,.22); overflow:hidden; margin:0 .7rem; position:relative; }

        /* SHARED */
        .lbl { font-size:.52rem; font-weight:700; letter-spacing:.44em; text-transform:uppercase; color:var(--gold); display:flex; align-items:center; gap:.55rem; justify-content:center; margin-bottom:.6rem; }
        .lbl::before,.lbl::after { content:''; flex:1; max-width:44px; height:1px; }
        .lbl::before { background:linear-gradient(90deg,transparent,var(--gold)); }
        .lbl::after  { background:linear-gradient(270deg,transparent,var(--gold)); }
        .ttl { font-family:'Playfair Display',serif; font-size:clamp(1.55rem,6.5vw,2.3rem); color:#fff; text-align:center; line-height:1.2; margin-bottom:.45rem; }
        .gbar { width:38px; height:2.5px; background:linear-gradient(90deg,var(--goldd),var(--gold)); margin:0 auto 1.6rem; border-radius:2px; }

        /* HERO */
        .hero { display:block; position:relative; overflow:hidden; background:#06101a; }
        .hero.hero-img-only { min-height:unset; }
        .hero-poster { display:block; width:calc(100% - 1.4rem); height:auto; max-width:100%; object-fit:contain; margin:2rem .7rem .7rem; border-radius:14px; }
        .hero-frame { position:absolute; top:1rem; bottom:1rem; left:1rem; right:1rem; border:1px solid rgba(201,168,76,.18); border-radius:3px; pointer-events:none; z-index:2; }
        .hero-frame::before,.hero-frame::after { content:''; position:absolute; width:16px; height:16px; border-color:var(--gold); border-style:solid; }
        .hero-frame::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
        .hero-frame::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }
        .hero-nav { position:absolute; top:1.8rem; left:1.8rem; right:1.8rem; display:flex; align-items:center; justify-content:space-between; z-index:3; }
        .hnav-logo-wrap { display:flex; align-items:center; background:rgba(255,255,255,.08); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.18); border-radius:8px; padding:.3rem .75rem; }
        .hnav-logo { height:34px; width:auto; filter:brightness(0) invert(1); opacity:.88; }
        .hnav-menu { color:rgba(255,255,255,.5); font-size:1.1rem; }
        .hero-content { position:relative; z-index:3; width:100%; padding:5rem 1.5rem 0; display:flex; flex-direction:column; align-items:center; }
        .hero-badge { font-size:.46rem; font-weight:700; letter-spacing:.3em; text-transform:uppercase; color:var(--gold); border:1px solid rgba(201,168,76,.38); background:rgba(6,16,26,.45); backdrop-filter:blur(6px); padding:.32rem 1rem; border-radius:2px; margin-bottom:1.1rem; }
        .hero-hline { width:120px; height:1px; background:linear-gradient(90deg,transparent,var(--gold),transparent); margin:.4rem 0; }
        .hero-hbar  { width:34px; height:2px; background:var(--gold); border-radius:2px; margin:.35rem 0; }
        .hero-title { font-family:'Playfair Display',serif; font-size:clamp(2.3rem,10vw,4.2rem); font-weight:700; color:#fff; line-height:1.02; letter-spacing:.04em; margin:.5rem 0 .15rem; text-shadow:0 2px 20px rgba(0,0,0,.7); }
        .hero-title .yr { display:block; color:var(--gold); text-shadow:0 0 28px rgba(201,168,76,.65); }
        .hero-sub { font-family:'Cormorant Garamond',serif; font-size:clamp(.95rem,4vw,1.18rem); font-style:italic; color:rgba(255,255,255,.78); letter-spacing:.05em; max-width:270px; line-height:1.6; margin:.8rem auto 0; text-shadow:0 1px 10px rgba(0,0,0,.6); }
        .hero-bottom { position:absolute; bottom:2.2rem; left:50%; transform:translateX(-50%); z-index:3; display:flex; flex-direction:column; align-items:center; gap:.35rem; }
        .hbot-line { width:1px; height:1.8rem; background:linear-gradient(to bottom,var(--gold),transparent); }
        .hbot-text { font-family:'Cormorant Garamond',serif; font-size:.88rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(255,255,255,.52); }
        .hbot-icon { font-size:1.1rem; color:rgba(255,255,255,.38); animation:bounce 2s ease-in-out infinite; }

        /* EVENT INFO */
        .info-sec { background:linear-gradient(rgba(6,16,26,.68),rgba(6,16,26,.66)),url('/media/section4.webp') center bottom/cover no-repeat; padding:2.2rem 1.4rem 2.5rem; }
        .info-hd { margin-bottom:1.4rem; }
        .info-hd-lbl { font-size:.62rem; font-weight:700; letter-spacing:.46em; text-transform:uppercase; color:var(--gold); text-align:center; margin-bottom:.55rem; }
        .info-hd-sep { display:flex; align-items:center; justify-content:center; gap:.5rem; }
        .info-hd-line { flex:0 0 36px; height:1px; background:rgba(201,168,76,.35); }
        .info-hd-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); opacity:.72; }
        .info-list { display:flex; flex-direction:column; gap:.5rem; }
        .ic { background:rgba(6,16,26,.52); backdrop-filter:blur(8px); border:1px solid rgba(201,168,76,.2); border-radius:10px; padding:.75rem 1rem; display:flex; align-items:center; gap:.8rem; transition:border-color .3s,transform .3s; }
        .ic:hover { border-color:rgba(201,168,76,.48); transform:translateX(4px); }
        .ic-action { cursor:pointer; }
        .ic-ico { width:36px; height:36px; flex-shrink:0; border-radius:8px; background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.28); display:flex; align-items:center; justify-content:center; }
        .ic-ico svg { width:18px; height:18px; stroke:var(--gold); stroke-width:1.6; fill:none; filter:drop-shadow(0 0 6px rgba(201,168,76,.5)); }
        .ic-lbl { font-size:.42rem; font-weight:700; letter-spacing:.3em; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:.14rem; }
        .ic-val { font-family:'Playfair Display',serif; font-size:.95rem; color:#fff; font-weight:600; line-height:1.3; }
        .ic-sub { font-family:'Cormorant Garamond',serif; font-size:.84rem; color:rgba(255,255,255,.58); font-style:italic; }
        .ic-hint { margin-left:auto; flex-shrink:0; opacity:.55; }
        .ic-hint svg { width:16px; height:16px; stroke:var(--gold); stroke-width:1.6; fill:none; }
        .ic-sep { height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,.18),transparent); margin:0 .5rem; }
        .cal-pop { background:rgba(6,14,26,.95); backdrop-filter:blur(12px); border:1px solid rgba(201,168,76,.28); border-radius:10px; padding:.6rem; display:flex; flex-direction:column; gap:.4rem; margin-top:.35rem; }
        .cal-btn { background:rgba(201,168,76,.08); border:1px solid rgba(201,168,76,.22); border-radius:7px; padding:.6rem .9rem; color:rgba(255,255,255,.82); font-size:.72rem; letter-spacing:.08em; cursor:pointer; display:flex; align-items:center; gap:.5rem; transition:background .2s,border-color .2s; }
        .cal-btn:hover { background:rgba(201,168,76,.18); border-color:rgba(201,168,76,.5); }
        .cal-btn svg { width:14px; height:14px; stroke:var(--gold); stroke-width:1.8; fill:none; }

        /* WELCOME */
        .welcome-sec { background:linear-gradient(to bottom,rgba(6,16,26,.72) 0%,rgba(6,16,26,.58) 45%,rgba(6,16,26,.78) 100%),url('/media/section3.webp') center 30%/cover no-repeat; padding:2.5rem 1.4rem; }
        .w-head { text-align:center; margin-bottom:1.2rem; }
        .w-head-icon-row { display:flex; align-items:center; justify-content:center; gap:.6rem; margin-bottom:.5rem; }
        .w-sprig { width:34px; height:34px; stroke:var(--gold); stroke-width:1.35; fill:none; stroke-linecap:round; stroke-linejoin:round; opacity:.72; }
        .w-sprig-r { transform:scaleX(-1); }
        .w-cap svg { width:52px; height:52px; stroke:var(--gold); fill:rgba(201,168,76,.1); stroke-width:1.25; filter:drop-shadow(0 0 14px rgba(201,168,76,.65)) drop-shadow(0 0 4px rgba(201,168,76,.4)); }
        .w-head-lbl { font-size:.6rem; font-weight:700; letter-spacing:.42em; text-transform:uppercase; color:var(--gold); line-height:1.75; text-align:center; }
        .w-head-dot-inner { display:block; width:5px; height:5px; border-radius:50%; background:var(--gold); opacity:.7; margin:0 auto; margin-top:.4rem; }
        .w-dear { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,6vw,2rem); color:#fff; text-align:center; margin-bottom:.9rem; }
        .w-body { font-family:'Cormorant Garamond',serif; font-size:1.06rem; line-height:1.84; color:rgba(255,255,255,.72); text-align:center; margin-bottom:1.2rem; }
        .w-quote { font-family:'Cormorant Garamond',serif; font-size:clamp(1.02rem,4vw,1.18rem); color:var(--gold); text-align:center; line-height:1.72; }
        .w-scroll { margin-top:1.4rem; display:flex; justify-content:center; }
        .w-scroll svg { width:90px; height:26px; stroke:var(--gold); stroke-width:1.2; fill:none; stroke-linecap:round; stroke-linejoin:round; opacity:.55; }

        /* COUNTDOWN */
        .cd-sec { background:linear-gradient(rgba(6,14,26,.82),rgba(5,12,22,.84)),url('/media/section2.webp') center/cover no-repeat; padding:2.8rem 1rem 3.2rem; }
        .cd-hd { text-align:center; margin-bottom:1.8rem; }
        .cd-hd-lbl { font-size:.62rem; font-weight:700; letter-spacing:.46em; text-transform:uppercase; color:var(--gold); margin-bottom:.5rem; }
        .cd-hd-sub { font-family:'Cormorant Garamond',serif; font-size:1rem; color:rgba(255,255,255,.65); font-style:italic; }
        .cd-stack { display:flex; flex-direction:column; align-items:center; gap:.35rem; }
        .cd-unit { display:flex; flex-direction:column; align-items:center; }
        .cd-ring { width:min(192px,86vw); height:min(192px,86vw); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; gap:.2rem; background:radial-gradient(circle at 50% 46%,rgba(201,168,76,.07) 0%,transparent 62%); }
        .cd-ring-svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; filter:drop-shadow(0 0 4px rgba(201,168,76,1)) drop-shadow(0 0 14px rgba(201,168,76,.8)) drop-shadow(0 0 36px rgba(201,168,76,.45)) drop-shadow(0 0 80px rgba(201,168,76,.2)); }
        .cd-num { font-family:'Playfair Display',serif; font-size:4.2rem; font-weight:700; color:var(--goldl); line-height:1; text-shadow:0 0 30px rgba(201,168,76,.65); position:relative; z-index:1; }
        .cd-lbl { font-size:.48rem; font-weight:700; letter-spacing:.38em; text-transform:uppercase; color:var(--gold); opacity:.88; position:relative; z-index:1; }

        /* TIMELINE */
        .tl-sec { background:linear-gradient(rgba(6,14,26,.76),rgba(5,12,22,.78)),url('/media/section2.webp') center/cover no-repeat; padding:2.8rem 1.4rem 3rem; }
        .tl-hd { text-align:center; margin-bottom:2rem; }
        .tl-hd-lbl { font-size:.62rem; font-weight:700; letter-spacing:.46em; text-transform:uppercase; color:var(--gold); margin-bottom:.65rem; }
        .tl-hd-sep { display:flex; align-items:center; justify-content:center; gap:.45rem; }
        .tl-hd-sep-line { flex:0 0 38px; height:1px; background:rgba(201,168,76,.38); }
        .tl-hd-sep-diamond { width:5px; height:5px; background:var(--gold); transform:rotate(45deg); opacity:.75; }
        .tl { position:relative; }
        .tl::before { content:''; position:absolute; left:22px; top:22px; bottom:22px; width:1px; background:linear-gradient(to bottom,rgba(201,168,76,.55) 0%,rgba(201,168,76,.32) 80%,rgba(201,168,76,.06) 100%); }
        .tl-item { position:relative; padding-bottom:1.8rem; display:flex; align-items:flex-start; gap:1rem; opacity:0; transform:translateX(-14px); transition:opacity .6s ease,transform .6s ease; }
        .tl-item:last-child { padding-bottom:0; }
        .tl-item.sr-on { opacity:1; transform:translateX(0); }
        .tl-dot { flex-shrink:0; width:44px; height:44px; border-radius:50%; background:#06101a; border:1px solid rgba(201,168,76,.52); display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(201,168,76,.38),0 0 26px rgba(201,168,76,.18),inset 0 0 10px rgba(201,168,76,.1); position:relative; z-index:1; }
        .tl-dot svg { width:20px; height:20px; stroke:var(--gold); stroke-width:1.5; fill:none; }
        .tl-info { padding-top:.35rem; }
        .tl-time { font-size:.5rem; font-weight:700; letter-spacing:.18em; color:var(--gold); margin-bottom:.18rem; text-transform:uppercase; }
        .tl-name { font-family:'Playfair Display',serif; font-size:.92rem; color:#fff; font-weight:600; line-height:1.3; }

        /* GALLERY (kept hidden) */
        .gal-sec { background:linear-gradient(rgba(6,16,26,.78),rgba(6,16,26,.76)),url('/uploads/images/section3.webp') center/cover no-repeat; padding:2.5rem 1.4rem 2.8rem; }
        .gal-grid { display:grid; grid-template-columns:1fr 1fr; gap:.55rem; margin-top:1.4rem; }
        .gi { border-radius:8px; overflow:hidden; aspect-ratio:4/3; border:1px solid rgba(201,168,76,.2); position:relative; cursor:pointer; transition:transform .4s,border-color .3s; }
        .gi img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s; }
        .gi:hover { transform:scale(1.03); border-color:rgba(201,168,76,.55); }
        .gi:hover img { transform:scale(1.07); }
        .gi-ov { position:absolute; inset:0; background:linear-gradient(to top,rgba(6,16,26,.55) 0%,transparent 55%); }
        .gal-more { text-align:center; margin-top:1rem; }
        .gal-btn { border:1px solid rgba(201,168,76,.42); background:rgba(6,16,26,.5); backdrop-filter:blur(6px); color:rgba(255,255,255,.68); font-size:.58rem; font-weight:600; letter-spacing:.26em; text-transform:uppercase; padding:.58rem 1.8rem; border-radius:4px; cursor:pointer; transition:all .3s; }
        .gal-btn:hover { background:rgba(201,168,76,.14); border-color:var(--gold); color:#fff; }

        /* RSVP */
        .rsvp-sec { background:linear-gradient(rgba(6,16,26,.78),rgba(6,16,26,.75)),url('/media/section2.webp') center/cover no-repeat; padding:2.5rem 1.4rem; }
        .rsvp-sub { font-family:'Cormorant Garamond',serif; font-size:.98rem; color:rgba(255,255,255,.55); text-align:center; margin-bottom:1.6rem; font-style:italic; }
        .rsvp-form { display:flex; flex-direction:column; gap:.85rem; }
        .fw { position:relative; }
        .fi-ico { position:absolute; left:.95rem; top:50%; transform:translateY(-50%); font-size:.88rem; color:rgba(201,168,76,.5); pointer-events:none; }
        .fi,.fs { background:rgba(6,16,26,.58); backdrop-filter:blur(8px); border:1px solid rgba(201,168,76,.22); border-radius:8px; padding:.88rem .95rem .88rem 2.65rem; color:#fff; font-family:'Cormorant Garamond',serif; font-size:1rem; outline:none; width:100%; transition:border-color .3s,box-shadow .3s; -webkit-appearance:none; appearance:none; }
        .fi::placeholder { color:rgba(255,255,255,.28); }
        .fi:focus,.fs:focus { border-color:rgba(201,168,76,.58); box-shadow:0 0 0 3px rgba(201,168,76,.09); }
        .fs { color:rgba(255,255,255,.62); }
        .fs option { background:#0d1a2e; color:#fff; }
        .fs-arr { position:absolute; right:.95rem; top:50%; transform:translateY(-50%); color:rgba(201,168,76,.48); pointer-events:none; font-size:.58rem; }
        .sub-btn { background:linear-gradient(135deg,#c9a84c 0%,#9e7a2e 100%); border:none; color:#06101a; font-size:.66rem; font-weight:700; letter-spacing:.26em; text-transform:uppercase; padding:1.08rem; border-radius:8px; cursor:pointer; transition:transform .3s,box-shadow .3s,filter .3s; box-shadow:0 6px 22px rgba(201,168,76,.32); }
        .sub-btn:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(201,168,76,.45); filter:brightness(1.08); }
        .rsvp-note { font-family:'Cormorant Garamond',serif; font-size:.88rem; color:rgba(255,255,255,.42); text-align:center; margin-top:1rem; font-style:italic; line-height:1.6; }
        .sbox { text-align:center; padding:2.5rem 1rem; background:rgba(6,16,26,.7); backdrop-filter:blur(10px); border:1px solid rgba(201,168,76,.28); border-radius:12px; }
        .s-ico { font-size:2.8rem; margin-bottom:.7rem; }
        .s-ttl { font-family:'Playfair Display',serif; font-size:1.5rem; color:#fff; margin-bottom:.55rem; }
        .s-sub { font-family:'Cormorant Garamond',serif; font-size:1.05rem; color:rgba(255,255,255,.6); }

        /* QUOTE */
        .quote-sec { background:linear-gradient(to bottom,rgba(6,16,26,.74) 0%,rgba(6,16,26,.58) 40%,rgba(6,16,26,.80) 100%),url('/media/section7.webp') center/cover no-repeat; padding:2.8rem 1.4rem 3rem; text-align:center; }
        .q-mark { font-family:'Playfair Display',serif; font-size:4.5rem; color:var(--gold); opacity:.68; line-height:.82; display:block; margin-bottom:.3rem; }
        .q-text { font-family:'Playfair Display',serif; font-size:clamp(1.1rem,5vw,1.5rem); font-style:italic; color:#fff; line-height:1.72; max-width:340px; margin:0 auto .7rem; text-shadow:0 2px 14px rgba(0,0,0,.5); }
        .q-author { font-size:.58rem; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); }
        .laurel { margin-top:2rem; color:var(--gold); opacity:.58; font-size:1.4rem; letter-spacing:.28em; }

        /* FOOTER */
        .footer { background:linear-gradient(rgba(6,16,26,.88),rgba(6,16,26,.88)),url('/media/section7.webp') center bottom/cover no-repeat; border-top:1px solid rgba(201,168,76,.1); padding:2.5rem 1.5rem 2rem; text-align:center; margin:0; border-radius:0; }
        .ft-line { width:55px; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,.38),transparent); margin:0 auto 1.3rem; }
        .ft-txt { font-family:'Cormorant Garamond',serif; font-size:.95rem; font-style:italic; color:rgba(255,255,255,.38); line-height:1.8; max-width:310px; margin:0 auto 1.4rem; }
        .ft-socs { display:flex; align-items:center; justify-content:center; gap:.95rem; }
        .ft-s { width:34px; height:34px; border:1px solid rgba(201,168,76,.22); border-radius:50%; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.38); font-size:.75rem; font-weight:700; text-decoration:none; transition:all .3s; cursor:pointer; }
        .ft-s:hover { border-color:var(--gold); color:var(--gold); background:rgba(201,168,76,.1); }
        .ft-line2 { width:55px; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,.18),transparent); margin:1.3rem auto 0; }

        /* SCROLL REVEAL */
        .sr { opacity:0; transform:translateY(20px); transition:opacity .7s ease,transform .7s ease; }
        .sr.sr-on { opacity:1; transform:translateY(0); }
        .sr-stg > * { opacity:0; transform:translateY(12px); transition:opacity .5s ease,transform .5s ease; }
        .sr-stg.sr-on > *:nth-child(1) { opacity:1;transform:none;transition-delay:0s; }
        .sr-stg.sr-on > *:nth-child(2) { opacity:1;transform:none;transition-delay:.08s; }
        .sr-stg.sr-on > *:nth-child(3) { opacity:1;transform:none;transition-delay:.16s; }
        .sr-stg.sr-on > *:nth-child(4) { opacity:1;transform:none;transition-delay:.24s; }
        .sr-stg.sr-on > *:nth-child(5) { opacity:1;transform:none;transition-delay:.32s; }
        .sr-stg.sr-on > *:nth-child(6) { opacity:1;transform:none;transition-delay:.4s; }
        .hero-rv { opacity:0; transform:translateY(16px); transition:opacity .7s ease,transform .7s ease; }
        .hero-rv.sr-on { opacity:1; transform:translateY(0); }

        /* SHARE FAB */
        .share-fab-wrap { position:fixed; bottom:1.8rem; right:1.5rem; z-index:10000; display:flex; flex-direction:column; align-items:flex-end; gap:.55rem; pointer-events:none; }
        .share-tip { background:rgba(6,12,22,.96); backdrop-filter:blur(16px); border:1px solid rgba(201,168,76,.45); border-radius:22px; padding:.44rem 1rem; color:var(--goldl); font-size:.58rem; font-weight:700; letter-spacing:.18em; text-transform:uppercase; white-space:nowrap; opacity:0; transform:translateX(12px) scale(.95); transition:opacity .35s ease,transform .35s ease; pointer-events:none; box-shadow:0 4px 16px rgba(0,0,0,.4); }
        .share-tip::after { content:''; position:absolute; right:-6px; top:50%; transform:translateY(-50%); width:0; height:0; border:5px solid transparent; border-left-color:rgba(201,168,76,.45); }
        .share-tip.show { opacity:1; transform:translateX(0) scale(1); }
        .share-fab { width:54px; height:54px; border-radius:50%; background:linear-gradient(145deg,#d4b255 0%,#c9a84c 40%,#9e7a2e 100%); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(201,168,76,.5),0 0 0 0 rgba(201,168,76,.2); transition:transform .2s,box-shadow .2s; pointer-events:auto; animation:fabPulse 3s ease-in-out infinite; }
        .share-fab:hover { transform:scale(1.1) rotate(-5deg); box-shadow:0 6px 28px rgba(201,168,76,.65); }
        .share-fab:active { transform:scale(.96); }
        .share-fab svg { width:22px; height:22px; stroke:#06101a; stroke-width:2.2; fill:none; filter:drop-shadow(0 1px 2px rgba(0,0,0,.2)); }
        @keyframes fabPulse { 0%,100%{box-shadow:0 4px 18px rgba(201,168,76,.5),0 0 0 0 rgba(201,168,76,.2);} 50%{box-shadow:0 6px 24px rgba(201,168,76,.6),0 0 0 10px rgba(201,168,76,0);} }

        /* SHARE MODAL */
        .shr-overlay { position:fixed; inset:0; z-index:10001; background:rgba(2,6,14,.8); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; padding:1.2rem; animation:shrFadeIn .25s ease both; }
        @keyframes shrFadeIn { from{opacity:0} to{opacity:1} }
        .shr-box { background:linear-gradient(170deg,rgba(12,22,38,.99) 0%,rgba(7,14,26,.99) 100%); border:1px solid rgba(201,168,76,.24); border-radius:22px; padding:1.8rem 1.6rem 1.7rem; width:100%; max-width:400px; position:relative; box-shadow:0 32px 80px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.04); animation:shrSlideUp .3s cubic-bezier(.22,.9,.32,1) both; }
        @keyframes shrSlideUp { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:none} }
        .shr-close { position:absolute; top:.9rem; right:.9rem; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; padding:0; color:rgba(255,255,255,.4); }
        .shr-close:hover { background:rgba(255,255,255,.1); color:#fff; border-color:rgba(255,255,255,.18); }
        .shr-close svg { width:14px; height:14px; stroke:currentColor; stroke-width:2; fill:none; }
        .shr-badge { display:inline-flex; align-items:center; gap:.4rem; background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.28); border-radius:20px; padding:.28rem .75rem; margin:0 auto 1rem; }
        .shr-badge svg { width:12px; height:12px; stroke:#c9a84c; stroke-width:2; fill:none; }
        .shr-badge-txt { font-size:.5rem; font-weight:700; letter-spacing:.28em; color:#c9a84c; text-transform:uppercase; }
        .shr-head { text-align:center; margin-bottom:1.4rem; }
        .shr-title { font-family:'Playfair Display',serif; font-size:1.32rem; color:#fff; margin-bottom:.3rem; }
        .shr-sub { font-family:'Cormorant Garamond',serif; font-size:.9rem; color:rgba(255,255,255,.48); font-style:italic; }
        .shr-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,.18),transparent); margin:.4rem 0 1.3rem; }

        /* Platform buttons */
        .plat-grid { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; }
        .plat-card { background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.07); border-radius:16px; padding:1.25rem .8rem 1rem; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:.6rem; transition:all .22s cubic-bezier(.22,.9,.32,1); position:relative; overflow:hidden; }
        .plat-card::before { content:''; position:absolute; inset:0; opacity:0; transition:opacity .22s; }
        .plat-card.fb::before { background:linear-gradient(135deg,rgba(24,119,242,.12),rgba(13,95,191,.08)); }
        .plat-card.ig::before { background:linear-gradient(135deg,rgba(240,148,51,.1),rgba(188,24,136,.1)); }
        .plat-card:hover { transform:translateY(-3px) scale(1.02); border-color:rgba(201,168,76,.35); }
        .plat-card:hover::before { opacity:1; }
        .plat-card:active { transform:scale(.97); }
        .plat-logo { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; position:relative; z-index:1; }
        .plat-card.fb .plat-logo { background:linear-gradient(145deg,#2d95fa,#1565c0); box-shadow:0 4px 16px rgba(24,119,242,.4); }
        .plat-card.ig .plat-logo { background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5); box-shadow:0 4px 16px rgba(214,41,118,.38); }
        .plat-logo svg { width:24px; height:24px; fill:#fff; }
        .plat-card-name { font-size:.68rem; font-weight:700; letter-spacing:.12em; color:rgba(255,255,255,.78); text-transform:uppercase; position:relative; z-index:1; }

        /* Format buttons */
        .fmt-grid { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; }
        .fmt-card { background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.07); border-radius:16px; padding:1.4rem .8rem 1.1rem; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:.55rem; transition:all .22s cubic-bezier(.22,.9,.32,1); }
        .fmt-card:hover { transform:translateY(-3px); border-color:rgba(201,168,76,.4); background:rgba(201,168,76,.06); }
        .fmt-card:active { transform:scale(.97); }
        .fmt-ico-wrap { width:52px; height:52px; border-radius:14px; background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.24); display:flex; align-items:center; justify-content:center; }
        .fmt-ico-wrap svg { width:24px; height:24px; stroke:#c9a84c; stroke-width:1.8; fill:none; }
        .fmt-card-name { font-family:'Playfair Display',serif; font-size:.98rem; color:#fff; }
        .fmt-card-desc { font-family:'Cormorant Garamond',serif; font-size:.76rem; color:rgba(255,255,255,.4); font-style:italic; text-align:center; line-height:1.45; }

        /* Back button */
        .shr-back { background:none; border:none; color:rgba(201,168,76,.65); font-size:.62rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; cursor:pointer; display:flex; align-items:center; gap:.4rem; padding:0; margin-bottom:1.1rem; transition:color .2s; }
        .shr-back:hover { color:var(--gold); }
        .shr-back svg { width:14px; height:14px; stroke:currentColor; stroke-width:2; fill:none; }

        /* Progress */
        .prog-area { padding:.3rem 0; }
        .prog-status { font-family:'Cormorant Garamond',serif; font-size:1rem; color:rgba(255,255,255,.65); margin-bottom:1.1rem; font-style:italic; text-align:center; display:flex; align-items:center; justify-content:center; gap:.5rem; }
        .prog-spin { animation:spin .9s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .prog-spin svg { width:16px; height:16px; stroke:var(--gold); stroke-width:2; fill:none; }
        .prog-track { height:6px; background:rgba(255,255,255,.06); border-radius:10px; overflow:hidden; margin-bottom:.7rem; position:relative; }
        .prog-fill { height:100%; background:linear-gradient(90deg,#9e7a2e,#c9a84c,#e8c76e); border-radius:10px; transition:width .4s cubic-bezier(.22,.9,.32,1); position:relative; }
        .prog-fill::after { content:''; position:absolute; right:0; top:0; bottom:0; width:24px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.3)); border-radius:10px; animation:shimmer 1.2s ease-in-out infinite; }
        @keyframes shimmer { 0%,100%{opacity:0} 50%{opacity:1} }
        .prog-pct { font-size:.64rem; font-weight:700; letter-spacing:.2em; color:var(--gold); text-align:center; }

        /* Done state */
        .done-check { display:flex; justify-content:center; margin-bottom:.8rem; }
        .done-check svg { width:52px; height:52px; stroke:#c9a84c; stroke-width:1.5; fill:none; filter:drop-shadow(0 0 12px rgba(201,168,76,.5)); }
        .done-ttl { font-family:'Playfair Display',serif; font-size:1.3rem; color:#fff; text-align:center; margin-bottom:.45rem; }
        .done-sub { font-family:'Cormorant Garamond',serif; font-size:.92rem; color:rgba(255,255,255,.52); text-align:center; font-style:italic; margin-bottom:1.5rem; line-height:1.65; }
        .done-btn { background:linear-gradient(135deg,#c9a84c,#9e7a2e); border:none; color:#06101a; font-size:.62rem; font-weight:700; letter-spacing:.22em; text-transform:uppercase; padding:.92rem; border-radius:10px; cursor:pointer; width:100%; transition:filter .2s,transform .15s; box-shadow:0 4px 16px rgba(201,168,76,.3); }
        .done-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .done-btn:active { transform:translateY(0); }

        @keyframes floatGlow { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
        @keyframes pulseBorder { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0);} 50%{box-shadow:0 0 0 8px rgba(201,168,76,.08);} }
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:.38;} 50%{transform:translateY(5px);opacity:.65;} }
      `}</style>

      {/* Particle canvas */}
      <canvas id="pcanvas" ref={canvasRef} />

      {/* ══════ OPENING ══════ */}
      <div
        id="opening"
        className={phase === 'invitation' ? 'fade' : ''}
        onClick={handleOpeningClick}
        onTransitionEnd={() => { if (phase === 'invitation') { const el = document.getElementById('opening'); if (el) el.style.display = 'none'; } }}
      >
        <video id="bg-video" ref={videoRef} src={videoSrc} playsInline preload="auto" onEnded={showInvitation} />
        <div className="open-overlay" />
        {phase === 'playing' && (
          <button className="skip-btn" onClick={e => { e.stopPropagation(); const v = videoRef.current; if (v) { v.pause(); v.muted = true; } showInvitation(); }}>
            <ChevronsRight />Skip
          </button>
        )}
        {videoMuted && phase === 'playing' && (
          <button className="unmute-btn" onClick={handleUnmute}>
            🔇 Tap to unmute
          </button>
        )}
        <div className={`cta-wrap${ctaHide ? ' hide' : ''}`}>
          <div className="cta-eyebrow">Class of 2026</div>
          <div className="cta-title">Welcome Graduate</div>
          {personName && (
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.6rem,7vw,2.4rem)',color:'var(--goldl)',letterSpacing:'.08em',textShadow:'0 0 22px rgba(201,168,76,.65)',animation:'fadeUp .7s ease .35s both',marginTop:'.5rem',fontStyle:'italic'}}>
              {personName}
            </div>
          )}
          <button className="cta-btn">Open the Invitation</button>
        </div>
      </div>

      {/* ══════ INVITATION ══════ */}
      <div id="inv" className={invVisible ? 'on' : ''}>

        {/* HERO */}
        <div className="hero hero-img-only">
          <img className="hero-poster" src={heroImg} alt="Graduation Ceremony 2026" />
        </div>

        {/* COUNTDOWN */}
        <div className="card">
          <section className="cd-sec">
            <div className="cd-hd sr">
              <div className="cd-hd-lbl">Countdown</div>
              <div className="cd-hd-sub">The big day is coming!</div>
            </div>
            <div className="cd-stack sr-stg">
              {[['d','Days'],['h','Hours'],['m','Minutes'],['s','Seconds']].map(([k,l]) => (
                <div key={k} className="cd-unit">
                  <div className="cd-ring">
                    <svg className="cd-ring-svg" viewBox="0 0 192 192">
                      <circle cx="96" cy="96" r="92" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.14"/>
                      <circle cx="96" cy="96" r="86" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.28"/>
                      <circle cx="96" cy="96" r="79" fill="none" stroke="#e8c76e" strokeWidth="2.2" opacity="0.88"/>
                      <circle cx="96" cy="96" r="72" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.22"/>
                    </svg>
                    <span className="cd-num">{cd[k]}</span>
                    <span className="cd-lbl">{l}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* WELCOME */}
        <div className="card">
          <section className="welcome-sec">
            <div className="w-head sr">
              <div className="w-head-icon-row">
                <svg className="w-sprig" viewBox="0 0 36 36">
                  <path d="M32 30 Q24 22 16 18 Q10 14 4 16"/>
                  <path d="M20 20 Q17 12 21 5"/>
                  <path d="M20 20 Q13 17 8 10"/>
                  <path d="M25 17 Q24 9 28 4"/>
                </svg>
                <span className="w-cap"><GraduationCap /></span>
                <svg className="w-sprig w-sprig-r" viewBox="0 0 36 36">
                  <path d="M32 30 Q24 22 16 18 Q10 14 4 16"/>
                  <path d="M20 20 Q17 12 21 5"/>
                  <path d="M20 20 Q13 17 8 10"/>
                  <path d="M25 17 Q24 9 28 4"/>
                </svg>
              </div>
              <div className="w-head-lbl">WELCOME<br />MESSAGE</div>
              <span className="w-head-dot-inner" />
            </div>
            <div className="w-dear sr">{welcome.heading || 'Dear Graduates,'}</div>
            <p className="w-body sr">
              {welcome.body || 'Today marks the beginning of a new chapter filled with opportunities, challenges, and endless possibilities. Your hard work, perseverance, and dedication have brought you to this moment.'}
            </p>
            <p className="w-quote sr">
              We celebrate you and your incredible journey.<br />The future is yours!
            </p>
            <div className="w-scroll sr">
              <svg viewBox="0 0 90 26">
                <path d="M2 13 Q8 5 16 10 Q22 15 28 10 Q32 6 35 13"/>
                <path d="M40 13 Q45 6 45 13 Q45 20 40 13"/>
                <path d="M50 13 Q45 6 45 13 Q45 20 50 13"/>
                <path d="M88 13 Q82 5 74 10 Q68 15 62 10 Q58 6 55 13"/>
              </svg>
            </div>
          </section>
        </div>

        {/* EVENT INFO */}
        <div className="card">
          <section className="info-sec">
            <div className="info-hd sr">
              <div className="info-hd-lbl">Event Information</div>
              <div className="info-hd-sep">
                <span className="info-hd-line" />
                <span className="info-hd-dot" />
                <span className="info-hd-line" />
              </div>
            </div>
            <div className="info-list sr-stg">
              <div className="ic ic-action" onClick={() => setCalPopOpen(p => !p)}>
                <div className="ic-ico"><Calendar /></div>
                <div>
                  <span className="ic-lbl">Date</span>
                  <div className="ic-val">{eventInfo.date || 'June 15, 2026'}</div>
                </div>
                <div className="ic-hint"><CalendarPlus /></div>
              </div>
              {calPopOpen && (
                <div className="cal-pop">
                  <button className="cal-btn" onClick={openGcal}><ExternalLink /> Google Calendar</button>
                  <button className="cal-btn" onClick={downloadIcs}><Download /> Download .ics (Apple / Outlook)</button>
                </div>
              )}
              <div className="ic-sep" />
              <div className="ic">
                <div className="ic-ico"><Clock /></div>
                <div>
                  <span className="ic-lbl">Time</span>
                  <div className="ic-val">{eventInfo.time || '10:00 AM'}</div>
                </div>
              </div>
              <div className="ic-sep" />
              <div className="ic ic-action" onClick={() => window.open('https://maps.app.goo.gl/byVQRVk7rJo8NN8L8', '_blank')}>
                <div className="ic-ico"><MapPin /></div>
                <div>
                  <span className="ic-lbl">Venue</span>
                  <div className="ic-val">{eventInfo.location || 'Salle des Fêtes LAYELI'}</div>
                </div>
                <div className="ic-hint"><ExternalLink /></div>
              </div>
              <div className="ic-sep" />
              <div className="ic">
                <div className="ic-ico"><Landmark /></div>
                <div>
                  <span className="ic-lbl">Faculty</span>
                  <div className="ic-val">North American Private University</div>
                  <div className="ic-sub">Sfax, Tunisia</div>
                </div>
              </div>
              <div className="ic-sep" />
              <div className="ic">
                <div className="ic-ico"><GraduationCap /></div>
                <div>
                  <span className="ic-lbl">Promotion</span>
                  <div className="ic-val">Class of 2026</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* TIMELINE */}
        <div className="card">
          <section className="tl-sec">
            <div className="tl-hd sr">
              <div className="tl-hd-lbl">Program Timeline</div>
              <div className="tl-hd-sep">
                <span className="tl-hd-sep-line" />
                <span className="tl-hd-sep-diamond" />
                <span className="tl-hd-sep-line" />
              </div>
            </div>
            <div className="tl">
              {[
                { id:1, Icon:User,          time:'09:00 AM', title:'Guest Arrival & Registration' },
                { id:2, Icon:Award,         time:'10:00 AM', title:'Opening Ceremony' },
                { id:3, Icon:Trophy,        time:'10:30 AM', title:'Award Presentation' },
                { id:4, Icon:GraduationCap, time:'11:30 AM', title:'Graduation Walk' },
                { id:5, Icon:Camera,        time:'12:00 PM', title:'Group Photo Session' },
                { id:6, Icon:Users,         time:'12:30 PM', title:'Closing Ceremony' },
              ].map(item => (
                <div key={item.id} className="tl-item sr-tl">
                  <div className="tl-dot"><item.Icon /></div>
                  <div className="tl-info">
                    <div className="tl-time">{item.time}</div>
                    <div className="tl-name">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RSVP */}
        {/* <div className="card">
          <section className="rsvp-sec">
            <div className="lbl sr">Attendance</div>
            <div className="ttl sr">{rsvpSec.heading || 'RSVP'}</div>
            <div className="gbar sr" />
            <p className="rsvp-sub sr">Kindly confirm your attendance</p>
            {!rsvpDone ? (
              <form className="rsvp-form sr" onSubmit={submitRsvp}>
                <div className="fw">
                  <span className="fi-ico">👤</span>
                  <input className="fi" type="text" placeholder="Full Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="fw">
                  <span className="fi-ico">✉</span>
                  <input className="fi" type="email" placeholder="Email Address" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="fw">
                  <span className="fi-ico">👥</span>
                  <select className="fs" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}>
                    <option value="1">1 – Just me</option>
                    <option value="2">2 – +1 guest</option>
                    <option value="3">3 – +2 guests</option>
                    <option value="4">4 – +3 guests</option>
                  </select>
                  <span className="fs-arr">▼</span>
                </div>
                <button type="submit" className="sub-btn" disabled={rsvpPending}>
                  {rsvpPending ? 'Sending...' : 'Confirm Attendance'}
                </button>
              </form>
            ) : (
              <div className="sbox">
                <div className="s-ico">🎓</div>
                <div className="s-ttl">Confirmed!</div>
                <div className="s-sub">We look forward to celebrating with you on {eventInfo.date || 'June 15, 2026'}.</div>
              </div>
            )}
            <p className="rsvp-note sr">We look forward to celebrating<br />this special day with you!</p>
          </section>
        </div> */}

        {/* QUOTE */}
        <div className="card">
          <section className="quote-sec">
            <div className="lbl sr">Inspiration</div>
            <div className="ttl sr">Inspirational Quote</div>
            <div className="gbar sr" />
            <span className="q-mark sr">"</span>
            <p className="q-text sr">{quoteSec.text || 'The future belongs to those who believe in the beauty of their dreams.'}</p>
            <p className="q-author sr">{quoteSec.author || 'Eleanor Roosevelt'}</p>
            <div className="laurel sr">✦ ✦ ✦</div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="ft-line" />
          <p className="ft-txt">
            {footerSec.text || "Thank you for being part of this important milestone. Let's celebrate success, together."}
          </p>
          <div className="ft-socs">
            <span className="ft-s">f</span>
            <span className="ft-s">in</span>
            <span className="ft-s">t</span>
            <span className="ft-s">▶</span>
          </div>
          <div className="ft-line2" />
        </footer>

      </div>

      {/* ══════ SHARE FAB — outside #inv so position:fixed is always relative to viewport ══════ */}
      {invVisible && (
        <div className="share-fab-wrap">
          <div className={`share-tip${tipVis ? ' show' : ''}`}>Post as a Reel or Story</div>
          <button className="share-fab" onClick={openShare} aria-label="Share event">
            <Share2 />
          </button>
        </div>
      )}

      {/* ══════ SHARE MODAL ══════ */}
      {shareOpen && (
        <div className="shr-overlay" onClick={e => e.target === e.currentTarget && closeShare()}>
          <div className="shr-box">

            {/* close */}
            <button className="shr-close" onClick={closeShare} aria-label="Close">
              <X />
            </button>

            {/* ── Step 1: Platform ── */}
            {shareStep === 'platform' && (
              <>
                <div style={{display:'flex',justifyContent:'center',marginBottom:'.9rem'}}>
                  <div className="shr-badge">
                    <Share2 style={{width:12,height:12,stroke:'#c9a84c',strokeWidth:2,fill:'none'}}/>
                    <span className="shr-badge-txt">Share Event</span>
                  </div>
                </div>
                <div className="shr-head">
                  <div className="shr-title">Choose Platform</div>
                  <div className="shr-sub">Where would you like to share?</div>
                </div>
                <div className="shr-divider" />
                <div className="plat-grid">
                  <button className="plat-card fb" onClick={() => selectPlatform('facebook')}>
                    <div className="plat-logo">
                      {/* Facebook SVG icon */}
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 4.99 3.157 9.27 7.625 10.917v-7.724H5.692v-3.193h1.933V9.61c0-1.908 1.128-2.965 2.877-2.965.834 0 1.706.149 1.706.149v1.875h-.961c-.947 0-1.244.588-1.244 1.19v1.432h2.118l-.338 3.193H10.003v7.724C14.443 21.343 17.6 17.063 17.6 12.073H24z"/>
                      </svg>
                    </div>
                    <span className="plat-card-name">Facebook</span>
                  </button>
                  <button className="plat-card ig" onClick={() => selectPlatform('instagram')}>
                    <div className="plat-logo">
                      {/* Instagram SVG icon */}
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </div>
                    <span className="plat-card-name">Instagram</span>
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2: Format ── */}
            {shareStep === 'format' && (
              <>
                <button className="shr-back" onClick={() => setShareStep('platform')}>
                  <ArrowLeft /><span>Back</span>
                </button>
                <div className="shr-head">
                  <div className="shr-title">Choose Format</div>
                  <div className="shr-sub">
                    Sharing to&nbsp;
                    <strong style={{color:'#c9a84c',fontStyle:'normal'}}>
                      {sharePlat === 'facebook' ? 'Facebook' : 'Instagram'}
                    </strong>
                  </div>
                </div>
                <div className="shr-divider" />
                <div className="fmt-grid">
                  <button className="fmt-card" onClick={() => selectFormat('reel')}>
                    <div className="fmt-ico-wrap"><Film /></div>
                    <span className="fmt-card-name">Reel</span>
                    <span className="fmt-card-desc">Full video — campus intro + all sections</span>
                  </button>
                  <button className="fmt-card" onClick={() => selectFormat('story')}>
                    <div className="fmt-ico-wrap"><ImageIcon /></div>
                    <span className="fmt-card-name">Story</span>
                    <span className="fmt-card-desc">Event info card, ready to post</span>
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3: Generating ── */}
            {shareStep === 'generating' && (
              <>
                <div className="shr-head" style={{marginBottom:'.8rem'}}>
                  <div className="shr-title">
                    {shareFmt === 'reel' ? 'Generating Reel…' : 'Creating Story…'}
                  </div>
                  <div className="shr-sub">Please wait while we prepare your content</div>
                </div>
                <div className="shr-divider" />
                <div className="prog-area">
                  <div className="prog-status">
                    <span className="prog-spin"><Loader2 /></span>
                    <span>
                      {shareProg < 10 ? 'Loading video…' :
                       shareProg < 32 ? 'Rendering opening sequence…' :
                       shareProg < 55 ? 'Capturing page sections…' :
                       shareProg < 80 ? 'Composing video frames…' :
                       shareProg < 95 ? 'Finalising export…' : 'Almost done…'}
                    </span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{width:`${shareProg}%`}} />
                  </div>
                  <div className="prog-pct">{Math.round(shareProg)}%</div>
                </div>
              </>
            )}

            {/* ── Step 4: Done ── */}
            {shareStep === 'done' && (
              <>
                <div className="done-check"><CheckCircle2 /></div>
                <div className="done-ttl">
                  {shareFmt === 'reel' ? 'Reel Ready!' : 'Story Ready!'}
                </div>
                <div className="done-sub">
                  Your {shareFmt} has been saved to your device.{' '}
                  Open {sharePlat === 'facebook' ? 'Facebook' : 'Instagram'} to publish it.
                </div>
                <button className="done-btn" onClick={closeShare}>Done</button>
              </>
            )}

          </div>
        </div>
      )}

    </>
  );
}
