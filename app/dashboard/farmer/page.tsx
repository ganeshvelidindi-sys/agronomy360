'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoiceControl from '@/components/VoiceControl';
import Link from 'next/link';
import { CropDB, OrderDB, DBCrop, DBOrder } from '@/lib/db';
import {
  TrendingUp, Plus, MapPin, Trash2, Eye, RefreshCw,
  ShoppingBag, CheckCircle2, ShieldCheck, ArrowRight,
  Sparkles, Calendar, Layers, Leaf, DollarSign,
  AlertCircle, ChevronRight, Award, ExternalLink
} from 'lucide-react';

export default function FarmerDashboard() {
  const { lang, user, setUser, addNotification } = useApp();
  const [myListings, setMyListings] = useState<DBCrop[]>([]);
  const [myOrders, setMyOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Smart Scroll hide/show for banner
  const [showBanner, setShowBanner] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let timeoutId: any = null;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 70 && currentScrollY > lastScrollY) {
        // Scrolling down: hide banner smoothly
        setShowBanner(false);
      } else {
        // Scrolling up: show banner
        setShowBanner(true);
      }
      setLastScrollY(currentScrollY);

      // When user stops scrolling, bring back banner
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowBanner(true);
      }, 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  const firstName = user?.name?.split(' ')[0] || (lang === 'te' ? 'రైతు మిత్రమా' : 'Farmer');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (lang === 'te' ? 'శుభోదయం' : 'Good Morning') : hour < 17 ? (lang === 'te' ? 'శుభ మధ్యాహ్నం' : 'Good Afternoon') : (lang === 'te' ? 'శుభ సాయంత్రం' : 'Good Evening');

  useEffect(() => {
    if (!user) return;
    setMyListings(CropDB.getByFarmer(user.id));
    setMyOrders(OrderDB.getByFarmer(user.id));
    setLoading(false);
  }, [user]);

  const handleDelete = (cropId: string) => {
    if (!user) return;
    if (!confirm(lang === 'te' ? 'ఈ పంటను ఖచ్చితంగా డిలీట్ చేయాలా?' : 'Are you sure you want to delete this listing?')) return;
    CropDB.delete(cropId, user.id);
    setMyListings(CropDB.getByFarmer(user.id));
    addNotification({
      title: 'Listing Removed',
      message: 'Crop listing deleted successfully',
      type: 'scheme',
    });
  };

  const handleRefreshScreen = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agr360-refresh-screen'));
      if (user) {
        setMyListings(CropDB.getByFarmer(user.id));
        setMyOrders(OrderDB.getByFarmer(user.id));
      }
    }
  };

  const handleSwitchToBuyer = () => {
    if (user) {
      setUser({ ...user, role: 'buyer' });
    }
    window.location.href = '/dashboard/buyer';
  };

  const totalEarnings = myOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const releasedEarnings = myOrders.filter(o => o.escrowStatus === 'released').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = myOrders.filter(o => o.escrowStatus === 'held');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4">
          <div className="bg-white/85 backdrop-blur-2xl border border-white/80 shadow-2xl rounded-3xl p-8 max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-200">
              🧑‍🌾
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">
              {lang === 'te' ? 'రైతు లాగిన్ అవసరం' : 'Farmer Login Required'}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              {lang === 'te' ? 'మీ రైతు డాష్‌బోర్డ్ తెరవడానికి దయచేసి లాగిన్ అవ్వండి.' : 'Please sign in to access your farmer dashboard and manage crop listings.'}
            </p>
            <Link
              href="/auth/login"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>{lang === 'te' ? 'లాగిన్ అవ్వండి (Login)' : 'Sign In as Farmer'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col relative overflow-hidden select-none">
      <Navbar />
      <VoiceControl role="farmer" />

      {/* Soft Apple-style pastel glowing blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/50 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-teal-200/40 rounded-full blur-[110px]" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-green-100/60 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full relative z-10">

        {/* ── TOP ROLE IDENTIFIER & SWITCHER ──────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-3 sm:px-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-500 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
              🧑‍🌾
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-emerald-900 tracking-tight">
                  {lang === 'te' ? 'రైతు డాష్‌బోర్డ్' : 'FARMER DASHBOARD'}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                  {lang === 'te' ? 'ధృవీకరించబడిన రైతు' : 'Verified Seller'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                {lang === 'te' ? 'పంటల విక్రయం, మార్కెట్ ధరలు & రైతు సేవలు' : 'Direct crop listings, fair Mandi prices & instant payouts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* 3-Second Refresh Trigger */}
            <button
              onClick={handleRefreshScreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all active:scale-95 border border-gray-200"
              title="Refresh Screen with 3-sec Logo Splash"
            >
              <RefreshCw size={13} className="text-emerald-600" />
              <span>{lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}</span>
            </button>

            {/* Switch to Buyer Mode */}
            <button
              onClick={handleSwitchToBuyer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all active:scale-95"
            >
              <span>🛒</span>
              <span>{lang === 'te' ? 'కొనుగోలుదారు మోడ్' : 'Switch to Buyer Mode'}</span>
            </button>
          </div>
        </div>

        {/* ── AUTO-HIDE ON SCROLL WELCOME BANNER ──────────────── */}
        <div
          className={`transition-all duration-300 transform mb-6 ${
            showBanner ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-6 opacity-0 pointer-events-none h-0 overflow-hidden mb-0'
          }`}
        >
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Soft decorative background circles */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                🧑‍🌾
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {greeting}, {firstName}!
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-emerald-100 text-xs mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {user.location || 'India'}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                    <CheckCircle2 size={11} /> Active Farmer Profile
                  </span>
                  <span className="text-emerald-200 font-semibold">
                    {lang === 'te' ? 'కమీషన్ లేదు • మధ్యవర్తులు లేరు' : '0% Commission • 100% Direct'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
              <Link
                href="/list-crop"
                className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-gray-900 font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-amber-400/30 active:scale-95"
              >
                <Plus size={18} />
                <span>{lang === 'te' ? 'పంట అమ్మండి (List Crop)' : 'Sell New Crop'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── LIVE EARNINGS & STATS (Apple Squircle Glass Cards) ─ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
          {[
            {
              title: lang === 'te' ? 'మొత్తం అమ్మకాలు' : 'Total Earnings',
              value: `₹${totalEarnings.toLocaleString()}`,
              sub: `${myOrders.length} ${lang === 'te' ? 'ఆర్డర్లు' : 'Orders received'}`,
              icon: '💰',
              bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80',
            },
            {
              title: lang === 'te' ? 'ఖాతాలో జమ అయినవి' : 'Settled in Bank',
              value: `₹${releasedEarnings.toLocaleString()}`,
              sub: lang === 'te' ? 'సురక్షిత ఎస్క్రో విడుదల' : 'Escrow Released',
              icon: '🏦',
              bg: 'bg-blue-500/10 text-blue-700 border-blue-200/80',
            },
            {
              title: lang === 'te' ? 'అమ్మకానికి ఉన్న పంటలు' : 'Active Listings',
              value: myListings.length.toString(),
              sub: lang === 'te' ? 'మార్కెట్లో లైవ్' : 'Live on Marketplace',
              icon: '🌾',
              bg: 'bg-amber-500/10 text-amber-700 border-amber-200/80',
            },
            {
              title: lang === 'te' ? 'పెండింగ్ ఆర్డర్లు' : 'Pending Orders',
              value: pendingOrders.length.toString(),
              sub: lang === 'te' ? 'ఎస్క్రో రక్షణలో ఉన్నవి' : 'In-Transit Escrow',
              icon: '📦',
              bg: 'bg-purple-500/10 text-purple-700 border-purple-200/80',
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-2xl border border-white/70 shadow-lg shadow-gray-200/40 rounded-3xl p-4 sm:p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">{stat.title}</span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg border ${stat.bg}`}>
                  {stat.icon}
                </span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </span>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FARMER CONTROL CENTER (CATEGORIZED ACTION CARDS) ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>🚜</span>
                <span>{lang === 'te' ? 'రైతు సేవా కేంద్రం (Farmer Control Center)' : 'Farmer Control Center'}</span>
              </h2>
              <p className="text-xs text-gray-500">
                {lang === 'te' ? 'పంట అమ్మకాలు, ధరలు & వ్యవసాయ సేవలు ఒక్క క్లిక్‌తో' : 'Manage crop sales, market prices & smart farming tools'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              {lang === 'te' ? 'రైతు అధికారాలు' : 'Farmer Controls'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-3.5">
            {[
              {
                href: '/list-crop',
                icon: '🌾',
                title: lang === 'te' ? 'పంట అమ్మండి' : 'Sell Crop',
                sub: lang === 'te' ? 'కొత్త పంట లిస్ట్' : 'List New Crop',
                color: 'from-emerald-500 to-green-500',
                border: 'border-emerald-200',
                bg: 'bg-emerald-50 hover:bg-emerald-100/70',
              },
              {
                href: '/videocall',
                icon: '📹',
                title: lang === 'te' ? 'వీడియో కాల్' : 'Live Video Call',
                sub: lang === 'te' ? 'పంట తనిఖీ & కాల్' : 'Live Inspection',
                color: 'from-blue-500 to-indigo-500',
                border: 'border-blue-200',
                bg: 'bg-blue-50 hover:bg-blue-100/70',
              },
              {
                href: '/market-prices',
                icon: '📈',
                title: lang === 'te' ? 'మండి ధరలు' : 'Mandi Prices',
                sub: lang === 'te' ? 'లైవ్ మార్కెట్ రేట్లు' : 'Live Daily Rates',
                color: 'from-amber-500 to-yellow-500',
                border: 'border-amber-200',
                bg: 'bg-amber-50 hover:bg-amber-100/70',
              },
              {
                href: '/disease-detection',
                icon: '🔬',
                title: lang === 'te' ? 'రోగ నిర్ధారణ' : 'AI Crop Doctor',
                sub: lang === 'te' ? 'ఫోటోతో నివారణ' : 'Disease Detection',
                color: 'from-rose-500 to-red-500',
                border: 'border-rose-200',
                bg: 'bg-rose-50 hover:bg-rose-100/70',
              },
              {
                href: '/advisor',
                icon: '🌱',
                title: lang === 'te' ? 'పంట సలహా' : 'Crop Advisor',
                sub: lang === 'te' ? 'సీజన్ సిఫార్సులు' : 'Season Guide',
                color: 'from-teal-500 to-emerald-500',
                border: 'border-teal-200',
                bg: 'bg-teal-50 hover:bg-teal-100/70',
              },
              {
                href: '/loans',
                icon: '💳',
                title: lang === 'te' ? 'కిసాన్ రుణాలు' : 'Kisan Loans',
                sub: lang === 'te' ? 'తక్కువ వడ్డీ రుణాలు' : 'Agri Finance',
                color: 'from-blue-500 to-cyan-500',
                border: 'border-blue-200',
                bg: 'bg-blue-50 hover:bg-blue-100/70',
              },
              {
                href: '/schemes',
                icon: '📜',
                title: lang === 'te' ? 'ప్రభుత్వ పథకాలు' : 'Govt Schemes',
                sub: lang === 'te' ? 'సబ్సిడీలు & నిధులు' : 'PM-Kisan & More',
                color: 'from-purple-500 to-indigo-500',
                border: 'border-purple-200',
                bg: 'bg-purple-50 hover:bg-purple-100/70',
              },
            ].map((tool, idx) => (
              <Link
                key={idx}
                href={tool.href}
                className={`${tool.bg} border ${tool.border} rounded-3xl p-4 flex flex-col items-center text-center justify-between transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 group`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <div>
                  <span className="text-xs font-black text-gray-900 block leading-tight">
                    {tool.title}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                    {tool.sub}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── MY CROP LISTINGS (FARMER'S ACTIVE CROPS) ─────────── */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/70 shadow-xl shadow-gray-200/40 rounded-3xl p-5 sm:p-7 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>🌾</span>
                <span>{lang === 'te' ? 'నా పంటల జాబితా (My Crop Listings)' : 'My Active Crop Listings'}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'te' ? 'మార్కెట్‌లో కొనుగోలుదారులు చూస్తున్న మీ పంటలు' : 'Crops currently visible to verified buyers across India'}
              </p>
            </div>
            <Link
              href="/list-crop"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>{lang === 'te' ? 'కొత్త పంట' : 'Add Crop'}</span>
            </Link>
          </div>

          {myListings.length === 0 ? (
            <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-4xl block mb-2">🌾</span>
              <p className="text-sm font-bold text-gray-700">
                {lang === 'te' ? 'మీరు ఇంకా ఏ పంటను లిస్ట్ చేయలేదు' : 'No crops listed yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto mb-4">
                {lang === 'te' ? 'మీ పంట వివరాలు నమోదు చేసి నేరుగా కొనుగోలుదారులకు అమ్మండి.' : 'List your produce now to receive direct orders with zero commission.'}
              </p>
              <Link
                href="/list-crop"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
              >
                <Plus size={14} /> {lang === 'te' ? 'ఇప్పుడే పంట లిస్ట్ చేయండి' : 'List a Crop Now'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {crop.category || 'Crop'}
                      </span>
                      <button
                        onClick={() => handleDelete(crop.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <h4 className="text-base font-black text-gray-900">{crop.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={12} /> {crop.location || 'Farm Location'}
                    </p>

                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-lg font-black text-emerald-700">₹{crop.price}</span>
                      <span className="text-xs text-gray-400">/{crop.unit || 'kg'}</span>
                      <span className="text-xs text-gray-500 ml-auto font-bold">
                        {crop.quantity} {crop.unit} {lang === 'te' ? 'అందుబాటులో ఉంది' : 'Available'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {new Date(crop.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/marketplace`}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye size={13} /> {lang === 'te' ? 'మార్కెట్లో చూడండి' : 'View in Market'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RECEIVED BUYER ORDERS & ESCROW STATUS ───────────── */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/70 shadow-xl shadow-gray-200/40 rounded-3xl p-5 sm:p-7 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>📦</span>
                <span>{lang === 'te' ? 'వచ్చిన ఆర్డర్లు & ఎస్క్రో పేమెంట్లు' : 'Received Orders & Escrow Payouts'}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'te' ? 'కొనుగోలుదారుల నుండి వచ్చిన ఆర్డర్లు మరియు సురక్షిత చెల్లింపుల వివరాలు' : 'Orders placed by buyers with 100% escrow bank guarantee'}
              </p>
            </div>
            <span className="text-xs font-bold text-gray-400">
              {myOrders.length} {lang === 'te' ? 'మొత్తం ఆర్డర్లు' : 'Total Orders'}
            </span>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-10 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-3xl block mb-2">📬</span>
              <p className="text-sm font-bold text-gray-700">
                {lang === 'te' ? 'ఇంకా ఆర్డర్లు రాలేదు' : 'No buyer orders yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                {lang === 'te' ? 'కొనుగోలుదారులు మీ పంటను ఆర్డర్ చేయగానే ఇక్కడ కనిపిస్తాయి.' : 'When buyers order your crops, escrow details and payments will appear here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-black">
                      🌾
                    </span>
                    <div>
                      <p className="text-sm font-black text-gray-900">{order.cropName}</p>
                      <p className="text-xs text-gray-500">
                        {order.buyerName} • {order.quantity} {order.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          order.escrowStatus === 'released'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.escrowStatus === 'released' ? 'Settled in Bank' : 'Escrow Protected'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}