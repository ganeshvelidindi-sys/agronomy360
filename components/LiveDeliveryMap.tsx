'use client';
import { useState, useEffect, useRef } from 'react';
import {
  MapPin, Navigation, Truck, Phone, MessageSquare,
  ShieldCheck, CheckCircle2, Clock, Compass, AlertCircle,
  ExternalLink, Sparkles, RefreshCw
} from 'lucide-react';

interface LiveDeliveryMapProps {
  orderId?: string;
  cropName?: string;
  farmerName?: string;
  farmerLocation?: string;
  initialBuyerLocation?: string;
}

export default function LiveDeliveryMap({
  orderId = 'AGR360-849201',
  cropName = 'Basmati Rice (Grade A+)',
  farmerName = 'V Ganesh (Verified Farmer)',
  farmerLocation = 'Karimnagar, Telangana',
  initialBuyerLocation = 'Hanamkonda, Warangal, Telangana',
}: LiveDeliveryMapProps) {
  // GPS state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [buyerAddress, setBuyerAddress] = useState(initialBuyerLocation);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Live Vehicle Animation state (0% to 100% along route)
  const [truckProgress, setTruckProgress] = useState(38); // Starts 38% along the route
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [distanceKm, setDistanceKm] = useState(4.6);
  const [currentSpeed, setCurrentSpeed] = useState(36); // km/h

  // Tracking steps
  const [currentStep, setCurrentStep] = useState(2); // 0: Packed, 1: QC Verified, 2: In Transit, 3: Arrived

  // Auto-detect real device location on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // Simulate smooth truck movement on map
  useEffect(() => {
    const interval = setInterval(() => {
      setTruckProgress((prev) => {
        if (prev >= 95) {
          setCurrentStep(3); // Arrived at gate
          setEtaMinutes(1);
          setDistanceKm(0.2);
          return 95;
        }
        const next = prev + 1.2;
        // Adjust ETA and distance dynamically
        const remainingFraction = (100 - next) / 100;
        setDistanceKm(Number((remainingFraction * 7.5).toFixed(1)));
        setEtaMinutes(Math.max(1, Math.round(remainingFraction * 24)));
        setCurrentSpeed(Math.floor(32 + Math.random() * 12));
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Fetch Real GPS from browser
  const fetchCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setAccuracy(Math.round(acc));

        // Real Reverse Geocoding with OpenStreetMap Nominatim API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.suburb || addr.neighbourhood || '';
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || '';
            const postcode = addr.postcode ? ` - ${addr.postcode}` : '';
            const fullStr = [road, city, state].filter(Boolean).join(', ') + postcode;
            if (fullStr.length > 5) {
              setBuyerAddress(fullStr);
            }
          }
        } catch {
          // Fallback to coordinates
          setBuyerAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsLoading(false);
        setGpsError('GPS permission denied. Using estimated delivery hub coordinates.');
        // Set default realistic Telangana coordinates
        setGpsCoords({ lat: 17.9689, lng: 79.5941 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Calculate truck position along curved SVG path (0% to 100%)
  // SVG viewBox: 0 0 600 240
  // Start: (60, 180), Control1: (180, 50), Control2: (400, 220), End: (540, 60)
  const calculateBezierPoint = (t: number) => {
    const p0 = { x: 70, y: 170 };
    const p1 = { x: 200, y: 50 };
    const p2 = { x: 380, y: 210 };
    const p3 = { x: 530, y: 70 };

    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
    const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
    return { x, y };
  };

  const truckPos = calculateBezierPoint(truckProgress / 100);

  return (
    <div className="w-full bg-white/90 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-5 sm:p-7 shadow-2xl shadow-gray-200/60 font-sans">
      
      {/* ── TOP HEADER: ZOMATO PIN-TO-PIN STATUS ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Live Pin-to-Pin Tracking
            </span>
            <span className="text-xs text-gray-400 font-mono">#{orderId}</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
            Arriving in {etaMinutes} Minutes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {distanceKm} km away • Speed: {currentSpeed} km/h • Agri-Express Cold Chain
          </p>
        </div>

        {/* GPS Location Refresh */}
        <button
          onClick={fetchCurrentLocation}
          disabled={gpsLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all active:scale-95 shadow-sm ml-auto"
        >
          <Navigation size={14} className={gpsLoading ? 'animate-spin' : 'text-emerald-600'} />
          <span>{gpsLoading ? 'Detecting GPS...' : 'My Real GPS Pin'}</span>
        </button>
      </div>

      {/* ── INTERACTIVE LIVE MAP VIEWPORT ─────────────────────── */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-900 rounded-3xl overflow-hidden shadow-inner border border-slate-800 mb-6 select-none">
        {/* Subtle Map Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Street Roads Simulation (SVG vectors) */}
        <svg
          viewBox="0 0 600 240"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* Background Secondary Roads */}
          <path
            d="M 20 60 Q 150 140 300 80 T 580 180"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M 120 220 Q 300 120 480 200"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="5"
            fill="none"
          />

          {/* Active Navigation Route Line (Glow effect) */}
          <path
            d="M 70 170 C 200 50, 380 210, 530 70"
            stroke="rgba(16, 185, 129, 0.25)"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M 70 170 C 200 50, 380 210, 530 70"
            stroke="#10b981"
            strokeWidth="4"
            strokeDasharray="6 6"
            className="animate-pulse"
            fill="none"
          />

          {/* Completed Route Highlight */}
          <path
            d={`M 70 170 C ${200 * (truckProgress / 100)} ${50 * (truckProgress / 100)}, ${truckPos.x} ${truckPos.y}, ${truckPos.x} ${truckPos.y}`}
            stroke="#34d399"
            strokeWidth="5"
            fill="none"
          />
        </svg>

        {/* 1. ORIGIN PIN: FARM (Karimnagar) */}
        <div className="absolute left-[8%] sm:left-[11%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 border-2 border-white text-white flex items-center justify-center text-lg shadow-xl shadow-emerald-500/50">
            🌾
          </div>
          <div className="mt-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
            Farm: {farmerLocation.split(',')[0]}
          </div>
        </div>

        {/* 2. MID WAYPOINT: AGRI COLD STORAGE HUB */}
        <div className="absolute left-[45%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-8 h-8 rounded-xl bg-blue-600/90 border border-white text-white flex items-center justify-center text-sm shadow-md">
            🏬
          </div>
          <div className="mt-1 bg-black/60 px-2 py-0.5 rounded-lg text-[9px] font-medium text-blue-200 whitespace-nowrap">
            Agri-Hub (Quality Passed)
          </div>
        </div>

        {/* 3. LIVE MOVING DELIVERY TRUCK (Zomato-style live marker) */}
        <div
          className="absolute z-20 flex flex-col items-center transition-all duration-700 ease-out -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(truckPos.x / 600) * 100}%`,
            top: `${(truckPos.y / 240) * 100}%`,
          }}
        >
          {/* Animated pulsing radar wave around truck */}
          <div className="absolute -inset-3 bg-emerald-400/30 rounded-full animate-ping pointer-events-none" />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 border-2 border-white shadow-2xl flex items-center justify-center text-2xl text-white transform hover:scale-110 transition-transform">
            🚚
          </div>
          <div className="mt-1.5 bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{currentSpeed} km/h</span>
          </div>
        </div>

        {/* 4. DESTINATION PIN: BUYER'S EXACT GPS PIN */}
        <div className="absolute right-[8%] sm:right-[11%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          {/* Pulsing beacon waves */}
          <div className="absolute -inset-4 bg-sky-400/30 rounded-full animate-ping" />
          <div className="relative w-11 h-11 rounded-2xl bg-sky-500 border-2 border-white text-white flex items-center justify-center text-xl shadow-xl shadow-sky-500/50">
            📍
          </div>
          <div className="mt-1.5 bg-sky-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-sky-400/40 text-[10px] font-bold text-sky-200 whitespace-nowrap shadow-md">
            Your Doorstep Pin
          </div>
        </div>

        {/* Live GPS Accuracy Tag */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl text-[10px] font-medium text-emerald-400 flex items-center gap-1.5">
          <Compass size={12} className="animate-spin text-emerald-400" />
          <span>Real GPS Connected • Accuracy: ±{accuracy || 4}m</span>
        </div>
      </div>

      {/* ── PIN-TO-PIN ADDRESS DETAILS CARD ─────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Origin / Farm Address */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
            🌾
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Dispatched From Farm
            </span>
            <p className="text-xs font-black text-gray-900 mt-0.5">{farmerName}</p>
            <p className="text-xs text-gray-600 mt-0.5">{farmerLocation}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
              <CheckCircle2 size={10} /> Certified Quality Packed
            </span>
          </div>
        </div>

        {/* Destination / Buyer Real GPS Address */}
        <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-100 flex items-start gap-3">
          <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
            📍
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600">
              Destination (Your Pin-to-Pin Address)
            </span>
            <p className="text-xs font-black text-gray-900 mt-0.5">Buyer Delivery Gate</p>
            <p className="text-xs text-gray-700 mt-0.5 font-medium leading-relaxed">
              {buyerAddress}
            </p>
            {gpsCoords && (
              <p className="text-[10px] text-gray-400 font-mono mt-1">
                GPS: {gpsCoords.lat.toFixed(5)}°N, {gpsCoords.lng.toFixed(5)}°E
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── DRIVER DETAILS & DIRECT CALL (Like Zomato) ───────── */}
      <div className="bg-gradient-to-r from-gray-50 to-emerald-50/40 rounded-2xl p-4 border border-gray-200/80 flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
            👨‍✈️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-gray-900">Srinivas Rao</h4>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Verified Agri Driver
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Vehicle: <strong>TS 09 UB 4821</strong> (Refrigerated Agri-Van)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <a
            href="tel:+919848012345"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Phone size={13} />
            <span>Call Driver</span>
          </a>
          <a
            href="https://wa.me/919848012345?text=Hello%20driver,%20where%20is%20my%20crop%20order?"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <MessageSquare size={13} className="text-emerald-600" />
            <span>Chat</span>
          </a>
        </div>
      </div>

      {/* ── 4-STEP LIVE TIMELINE TRACKER ─────────────────────── */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">
          Live Order Status Updates
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { step: 0, title: 'Harvested & Packed', time: '08:30 AM', icon: '🌾' },
            { step: 1, title: 'Quality Verified', time: '10:15 AM', icon: '🔬' },
            { step: 2, title: 'Out for Delivery', time: 'On the Way 🚚', icon: '🚚' },
            { step: 3, title: 'Arrived at Gate', time: 'Pending OTP', icon: '📦' },
          ].map((s) => (
            <div
              key={s.step}
              className={`rounded-2xl p-3 border text-center transition-all ${
                currentStep >= s.step
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-sm'
                  : 'bg-gray-50/50 border-gray-200 text-gray-400'
              }`}
            >
              <span className="text-xl block mb-1">{s.icon}</span>
              <p className="text-xs font-black leading-tight">{s.title}</p>
              <p className="text-[10px] font-semibold mt-0.5 text-gray-500">{s.time}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
