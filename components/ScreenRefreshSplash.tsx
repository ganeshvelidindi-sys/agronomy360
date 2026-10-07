'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ScreenRefreshSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 3 second loader: update progress every 30ms up to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 28);

    // After 3000ms (3 seconds), start fade out
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
      }, 500);
    }, 3000);

    // Allow manual refresh triggers via custom event
    const handleManualRefresh = () => {
      setVisible(true);
      setFading(false);
      setProgress(0);
      const manualInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(manualInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 28);
      setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 500);
      }, 3000);
    };

    window.addEventListener('agr360-refresh-screen', handleManualRefresh);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener('agr360-refresh-screen', handleManualRefresh);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-2xl transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Soft Apple-style pastel glowing blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-200/50 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-200/40 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Glowing Logo Card */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-3xl blur-xl opacity-50 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-white p-2.5 shadow-2xl border-2 border-emerald-100 flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="AGRONOMY 360"
              width={88}
              height={88}
              className="object-cover rounded-2xl"
              priority
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-2">
          <span className="text-2xl font-black tracking-tight text-gray-900">AGRONOMY</span>
          <span className="text-amber-500 font-black text-2xl ml-1 tracking-wider">360</span>
        </div>

        <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">
          Direct Farm to Buyer Marketplace
        </p>
        <p className="text-xs text-gray-500 font-medium mb-6">
          Zero Middlemen • Fair Pricing • Real-Time Escrow
        </p>

        {/* 3-Second Progress Bar */}
        <div className="w-56 h-2 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200 shadow-inner mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-amber-400 rounded-full transition-all duration-75 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Animated Loading Text */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Loading Agronomy 360 Ecosystem...</span>
        </div>
      </div>
    </div>
  );
}
