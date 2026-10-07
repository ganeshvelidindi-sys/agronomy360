'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context';
import {
  Video, VideoOff, Mic, MicOff, Phone, SwitchCamera,
  Share2, Check, ExternalLink, ShieldCheck, Users,
  Sparkles, Camera, RefreshCw, Copy, Smartphone, ArrowRight
} from 'lucide-react';

export default function VideoCallPage() {
  const { lang, user, addNotification } = useApp();
  const [roomCode, setRoomCode] = useState('farm-inspection-360');
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Local media stream states
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto generate room code if none set
  useEffect(() => {
    if (user?.id) {
      setRoomCode(`farm-call-${user.id.slice(-6)}`);
    }
  }, [user]);

  // Duration timer
  useEffect(() => {
    let timer: any;
    if (inCall) {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      startCamera(facingMode);
    } else {
      stopCamera();
      setCallDuration(0);
    }

    return () => {
      clearInterval(timer);
      stopCamera();
    };
  }, [inCall, facingMode]);

  const startCamera = async (facing: 'user' | 'environment') => {
    stopCamera();
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: true,
        });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setCameraError(null);
      }
    } catch (err: any) {
      console.warn('Camera permission warning:', err);
      setCameraError('Camera or microphone permission not granted. Please allow camera access in browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const jitsiRoomUrl = `https://meet.jit.si/agronomy360-${roomCode}`;

  const copyCallLink = () => {
    if (typeof navigator !== 'undefined') {
      const shareUrl = `${window.location.origin}/videocall?room=${roomCode}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      addNotification({
        title: 'Call Link Copied!',
        message: 'Share this link with another phone to join the call',
        type: 'message',
      });
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col relative overflow-hidden select-none font-sans">
      <Navbar />

      {/* Ambient Liquid Glass Glowing Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 -left-20 w-96 h-96 bg-emerald-200/50 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-blue-200/50 rounded-full blur-[140px]" />
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full relative z-10 flex flex-col items-center justify-center">

        {/* ── TOP HEADER (iOS Liquid Glass Pill) ─────────────── */}
        <div className="text-center mb-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold mb-3 shadow-sm">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Real-Time HD Crop Inspection & Video Calls</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Live Video Call
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Inspect farm harvests live, talk directly with farmers & buyers with zero delay.
          </p>
        </div>

        {/* ── CALL INTERFACE / CONTROL ROOM ───────────────────── */}
        {!inCall ? (
          <div className="w-full max-w-md bg-white/80 backdrop-blur-3xl border border-white/80 shadow-2xl shadow-gray-200/60 rounded-[2.5rem] p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                📹
              </div>
              <h2 className="text-xl font-black text-gray-900">
                Start or Join a Video Room
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Both phones enter the same Room ID to connect live
              </p>
            </div>

            {/* Room ID Input */}
            <div className="mb-5">
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                Room Name / ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. farm-call-123"
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <span>💡</span> Enter this same Room ID on your second phone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Start In-App Camera Stream */}
              <button
                onClick={() => setInCall(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Video size={18} />
                <span>Launch Camera & Local Preview</span>
              </button>

              {/* Join Live Multi-Phone Room (Jitsi Meet) */}
              <a
                href={jitsiRoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Users size={18} />
                <span>Join Multi-Phone P2P Room (Full Screen)</span>
                <ExternalLink size={14} />
              </a>

              {/* Copy Share Link */}
              <button
                onClick={copyCallLink}
                className="w-full py-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                {copiedLink ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Room Link for Other Phone'}</span>
              </button>
            </div>

            {/* Testing Guide Tip */}
            <div className="mt-6 pt-5 border-t border-gray-100 bg-gray-50/60 rounded-2xl p-3.5 text-[11px] text-gray-600 space-y-1">
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <Smartphone size={14} className="text-emerald-600" />
                How to test between two phones:
              </p>
              <p>1. Open this page on <strong>Phone 1</strong> and enter a room name.</p>
              <p>2. Open this page on <strong>Phone 2</strong> with the same room name.</p>
              <p>3. Tap <strong>"Join Multi-Phone P2P Room"</strong> on both phones to talk and see live video simultaneously!</p>
            </div>
          </div>
        ) : (
          /* ── ACTIVE CALL DISPLAY (iOS Liquid Glass Video Interface) ── */
          <div className="w-full max-w-2xl bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white/60">
            
            {/* Top Call Info Overlay */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
              <div className="bg-black/60 backdrop-blur-xl border border-white/20 text-white px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>LIVE • {formatDuration(callDuration)}</span>
                <span className="text-gray-400 font-normal">| {roomCode}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCameraFacing}
                  className="bg-black/60 backdrop-blur-xl border border-white/20 text-white p-2.5 rounded-full hover:bg-black/80 transition-all active:scale-95"
                  title="Switch Front/Back Camera"
                >
                  <SwitchCamera size={16} />
                </button>
                <a
                  href={jitsiRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg transition-all"
                  title="Connect with another phone"
                >
                  <span>Connect 2nd Phone</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video sm:aspect-[4/3] bg-zinc-900 flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center text-gray-400 p-6">
                  <VideoOff size={48} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-sm font-bold">Camera is turned off</p>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 text-center text-white">
                  <div className="max-w-xs">
                    <p className="text-xs font-bold text-amber-400 mb-1">Camera Notice</p>
                    <p className="text-xs text-gray-300 mb-3">{cameraError}</p>
                    <a
                      href={jitsiRoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
                    >
                      <span>Join via Browser Room</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Call Controls (Apple Style Floating Pill Bar) */}
            <div className="bg-zinc-950/90 backdrop-blur-2xl px-6 py-4 flex items-center justify-center gap-4 border-t border-white/10">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Video Toggle Button */}
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                  isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>

              {/* End Call Button */}
              <button
                onClick={() => setInCall(false)}
                className="w-14 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all"
                title="End Call"
              >
                <Phone size={20} className="rotate-[135deg]" />
              </button>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
