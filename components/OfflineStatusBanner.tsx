'use client';
import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';

export default function OfflineStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      if (navigator.onLine) {
        setIsOffline(false);
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 3000);
      } else {
        // Quick visual pulse feedback
        const el = document.getElementById('offline-modal-card');
        if (el) {
          el.classList.add('scale-95');
          setTimeout(() => el.classList.remove('scale-95'), 150);
        }
      }
    }
  };

  // Reconnected Toast
  if (justReconnected && !isOffline) {
    return (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99998] w-[90%] max-w-md animate-fade-in-up">
        <div className="bg-emerald-600 text-white rounded-full px-5 py-3 shadow-2xl flex items-center justify-between gap-3 border border-emerald-400/50">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🧑‍🌾</span>
            <div>
              <p className="text-xs font-black">Connection Restored! (Back Online)</p>
              <p className="text-[11px] text-emerald-100">Welcome back to Agronomy 360 🌾</p>
            </div>
          </div>
          <Wifi size={18} className="text-emerald-200 animate-pulse flex-shrink-0" />
        </div>
      </div>
    );
  }

  // Offline Full Friendly Overlay with Farmer Representation
  if (isOffline) {
    return (
      <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div
          id="offline-modal-card"
          className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 border-amber-200 transition-all duration-200"
        >
          {/* Farmer Offline Representation */}
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-100 to-emerald-100 flex items-center justify-center text-5xl shadow-md border-2 border-amber-300">
              🧑‍🌾
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center border-2 border-white shadow-md">
              <WifiOff size={16} />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3 border border-amber-200">
            <AlertTriangle size={14} className="text-amber-600" />
            <span>No Internet Connection</span>
          </div>

          <h3 className="text-xl font-black text-gray-900 mb-2">
            No Internet Connection Detected
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
            Please check your Mobile Data or Wi-Fi network. Agronomy 360 will automatically reconnect as soon as your internet is back.
          </p>

          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-[11px] text-gray-500 mb-5 text-left flex items-start gap-2">
            <span className="text-base">💡</span>
            <span>
              <strong>Tip:</strong> Ensure Airplane mode is off, or check if your phone has Wi-Fi or mobile data turned on.
            </span>
          </div>

          <button
            onClick={handleRetry}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw size={16} />
            <span>Check Connection Again (Retry)</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
