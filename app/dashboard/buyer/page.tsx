'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoiceControl from '@/components/VoiceControl';
import Link from 'next/link';
import { OrderDB, DBOrder } from '@/lib/db';
import {
  Shield, Truck, CheckCircle2, MessageCircle, TrendingUp,
  RefreshCw, ShoppingBag, ArrowRight, MapPin, Eye,
  CreditCard, Package, Sparkles, Store, ChevronRight, FileText
} from 'lucide-react';

export default function BuyerDashboard() {
  const { lang, user, setUser, addNotification } = useApp();
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

  const firstName = user?.name?.split(' ')[0] || (lang === 'te' ? 'కొనుగోలుదారు' : 'Buyer');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (lang === 'te' ? 'శుభోదయం' : 'Good Morning') : hour < 17 ? (lang === 'te' ? 'శుభ మధ్యాహ్నం' : 'Good Afternoon') : (lang === 'te' ? 'శుభ సాయంత్రం' : 'Good Evening');

  useEffect(() => {
    if (!user) return;
    setMyOrders(OrderDB.getByBuyer(user.id));
    setLoading(false);
  }, [user]);

  const handleRefreshScreen = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agr360-refresh-screen'));
      if (user) {
        setMyOrders(OrderDB.getByBuyer(user.id));
      }
    }
  };

  const handleSwitchToFarmer = () => {
    if (user) {
      setUser({ ...user, role: 'farmer' });
    }
    window.location.href = '/dashboard/farmer';
  };

  const handleConfirmDelivery = (orderId: string) => {
    OrderDB.confirmDelivery(orderId);
    if (user) {
      setMyOrders(OrderDB.getByBuyer(user.id));
    }
    addNotification({
      title: 'Delivery Confirmed',
      message: 'Payment has been securely released to the farmer!',
      type: 'order',
    });
  };

  const totalSpent = myOrders.reduce((s, o) => s + o.totalAmount, 0);
  const activeOrders = myOrders.filter(o => o.escrowStatus === 'held');
  const deliveredOrders = myOrders.filter(o => o.escrowStatus === 'released');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4">
          <div className="bg-white/85 backdrop-blur-2xl border border-white/80 shadow-2xl rounded-3xl p-8 max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-200">
              🛒
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">
              {lang === 'te' ? 'కొనుగోలుదారు లాగిన్ అవసరం' : 'Buyer Login Required'}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              {lang === 'te' ? 'మీ కొనుగోలుదారు డాష్‌బోర్డ్ తెరవడానికి దయచేసి లాగిన్ అవ్వండి.' : 'Please sign in to access your buyer dashboard, track orders, and source fresh farm produce.'}
            </p>
            <Link
              href="/auth/login"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>{lang === 'te' ? 'లాగిన్ అవ్వండి (Login)' : 'Sign In as Buyer'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col relative overflow-hidden select-none">
      <Navbar />
      <VoiceControl role="buyer" />

      {/* Soft Apple-style pastel glowing blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-200/50 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-24 w-80 h-80 bg-indigo-200/40 rounded-full blur-[110px]" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-sky-100/60 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full relative z-10">

        {/* ── TOP ROLE IDENTIFIER & SWITCHER ──────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-3 sm:px-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
              🛒
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-blue-900 tracking-tight">
                  {lang === 'te' ? 'కొనుగోలుదారు డాష్‌బోర్డ్' : 'BUYER DASHBOARD'}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                  {lang === 'te' ? 'ధృవీకరించబడిన కొనుగోలుదారు' : 'Verified Buyer'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                {lang === 'te' ? 'రైతుల నుండి నేరుగా కొనుగోళ్లు & ఎస్క్రో రక్షణ' : 'Direct farm sourcing, zero middlemen & escrow protected payments'}
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
              <RefreshCw size={13} className="text-blue-600" />
              <span>{lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}</span>
            </button>

            {/* Switch to Farmer Mode */}
            <button
              onClick={handleSwitchToFarmer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all active:scale-95"
            >
              <span>🧑‍🌾</span>
              <span>{lang === 'te' ? 'రైతు మోడ్' : 'Switch to Farmer Mode'}</span>
            </button>
          </div>
        </div>

        {/* ── AUTO-HIDE ON SCROLL WELCOME BANNER ──────────────── */}
        <div
          className={`transition-all duration-300 transform mb-6 ${
            showBanner ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-6 opacity-0 pointer-events-none h-0 overflow-hidden mb-0'
          }`}
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Soft decorative background circles */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                🏪
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {greeting}, {firstName}!
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-blue-100 text-xs mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {user.location || 'India'}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                    <Shield size={11} /> 100% Escrow Protected
                  </span>
                  <span className="text-blue-200 font-semibold">
                    {lang === 'te' ? 'రైతు నుంచి నేరుగా మీ ఇంటికి' : 'Direct From Farm Gate'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
              <Link
                href="/marketplace"
                className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-gray-900 font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-amber-400/30 active:scale-95"
              >
                <Store size={18} />
                <span>{lang === 'te' ? 'పంటలు కొనండి (Marketplace)' : 'Browse & Buy Crops'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── LIVE BUYER STATS (Apple Squircle Glass Cards) ────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
          {[
            {
              title: lang === 'te' ? 'మొత్తం ఖర్చు' : 'Total Spent',
              value: `₹${totalSpent.toLocaleString()}`,
              sub: `${myOrders.length} ${lang === 'te' ? 'ఆర్డర్లు పూర్తి' : 'Total Orders'}`,
              icon: '💳',
              bg: 'bg-blue-500/10 text-blue-700 border-blue-200/80',
            },
            {
              title: lang === 'te' ? 'ఎస్క్రోలో భద్రంగా ఉన్నవి' : 'Active Escrow Held',
              value: `₹${activeOrders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}`,
              sub: `${activeOrders.length} ${lang === 'te' ? 'డెలివరీలో ఉన్నవి' : 'In-Transit Orders'}`,
              icon: '🔒',
              bg: 'bg-amber-500/10 text-amber-700 border-amber-200/80',
            },
            {
              title: lang === 'te' ? 'డెలివరీ అయినవి' : 'Delivered Orders',
              value: deliveredOrders.length.toString(),
              sub: lang === 'te' ? 'విజయవంతంగా పూర్తయినవి' : 'Delivered & Released',
              icon: '🚚',
              bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80',
            },
            {
              title: lang === 'te' ? 'రైతులు & వర్తకులు' : 'Direct Farmers',
              value: new Set(myOrders.map(o => o.farmerId)).size.toString(),
              sub: lang === 'te' ? 'కనెక్ట్ అయిన రైతులు' : 'Sourced Farmers',
              icon: '🌾',
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

        {/* ── BUYER CONTROL CENTER (CATEGORIZED ACTION CARDS) ─── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>🛒</span>
                <span>{lang === 'te' ? 'కొనుగోలుదారు నియంత్రణ కేంద్రం (Buyer Controls)' : 'Buyer Control Center'}</span>
              </h2>
              <p className="text-xs text-gray-500">
                {lang === 'te' ? 'పంట కొనుగోళ్లు, ఎస్క్రో పేమెంట్లు & మార్కెట్ ధరలు' : 'Source produce, track shipments & manage protected escrow payments'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
              {lang === 'te' ? 'కొనుగోలుదారు అధికారాలు' : 'Buyer Controls'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
            {[
              {
                href: '/marketplace',
                icon: '🏪',
                title: lang === 'te' ? 'పంటలు కొనండి' : 'Buy Crops',
                sub: lang === 'te' ? 'లైవ్ మార్కెట్‌ప్లేస్' : 'Live Marketplace',
                border: 'border-blue-200',
                bg: 'bg-blue-50 hover:bg-blue-100/70',
              },
              {
                href: '/track-order',
                icon: '📍',
                title: lang === 'te' ? 'లైవ్ ట్రాకింగ్' : 'Track Delivery',
                sub: lang === 'te' ? 'జొమాటో పిన్ టు పిన్' : 'Zomato Pin-to-Pin',
                border: 'border-emerald-200',
                bg: 'bg-emerald-50 hover:bg-emerald-100/70',
              },
              {
                href: '/payments',
                icon: '💳',
                title: lang === 'te' ? 'ఎస్క్రో పేమెంట్' : 'Escrow Vault',
                sub: lang === 'te' ? 'రైతుకు చెల్లింపు' : 'Direct Payments',
                border: 'border-indigo-200',
                bg: 'bg-indigo-50 hover:bg-indigo-100/70',
              },
              {
                href: '/videocall',
                icon: '📹',
                title: lang === 'te' ? 'వీడియో కాల్' : 'Live Video Call',
                sub: lang === 'te' ? 'రైతుతో మాట్లాడండి' : 'Inspect Crops Live',
                border: 'border-cyan-200',
                bg: 'bg-cyan-50 hover:bg-cyan-100/70',
              },
              {
                href: '/market-prices',
                icon: '📈',
                title: lang === 'te' ? 'మండి ధరలు' : 'Mandi Trends',
                sub: lang === 'te' ? 'మార్కెట్ రేట్లు' : 'Price Intelligence',
                border: 'border-amber-200',
                bg: 'bg-amber-50 hover:bg-amber-100/70',
              },
              {
                href: '/forum',
                icon: '💬',
                title: lang === 'te' ? 'రైతులతో మాట్లాడండి' : 'Chat Farmers',
                sub: lang === 'te' ? 'కమ్యూనిటీ ఫోరం' : 'Direct Negotiation',
                border: 'border-emerald-200',
                bg: 'bg-emerald-50 hover:bg-emerald-100/70',
              },
              {
                href: '/schemes',
                icon: '📜',
                title: lang === 'te' ? 'ప్రభుత్వ పథకాలు' : 'Govt Schemes',
                sub: lang === 'te' ? 'సబ్సిడీలు' : 'Agri Policies',
                border: 'border-purple-200',
                bg: 'bg-purple-50 hover:bg-purple-100/70',
              },
              {
                href: '/chatbot',
                icon: '🤖',
                title: lang === 'te' ? 'AI అసిస్టెంట్' : 'AI Assistant',
                sub: lang === 'te' ? 'మార్కెట్ సహాయం' : 'Instant Help',
                border: 'border-indigo-200',
                bg: 'bg-indigo-50 hover:bg-indigo-100/70',
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

        {/* ── MY ORDERS & ESCROW STATUS (BUYER'S ORDERS) ───────── */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/70 shadow-xl shadow-gray-200/40 rounded-3xl p-5 sm:p-7 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>📦</span>
                <span>{lang === 'te' ? 'నా ఆర్డర్లు & డెలివరీ స్థితి' : 'My Orders & Escrow Delivery Status'}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'te' ? 'మీరు ఆర్డర్ చేసిన పంటలు మరియు డెలివరీ నిర్ధారణ' : 'Track crop shipments and release funds only after physical inspection'}
              </p>
            </div>
            <Link
              href="/marketplace"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <Store size={14} />
              <span>{lang === 'te' ? 'ఇంకా కొనండి' : 'Order More'}</span>
            </Link>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-4xl block mb-2">🛒</span>
              <p className="text-sm font-bold text-gray-700">
                {lang === 'te' ? 'మీరు ఇంకా ఏ పంటను ఆర్డర్ చేయలేదు' : 'No crop orders placed yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto mb-4">
                {lang === 'te' ? 'మార్కెట్‌ప్లేస్‌లో తాజా పంటలను చూసి నేరుగా ఆర్డర్ చేయండి.' : 'Browse thousands of farm-fresh listings and place your first direct order with escrow safety.'}
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700"
              >
                <Store size={14} /> {lang === 'te' ? 'మార్కెట్ చూడండి' : 'Browse Marketplace Now'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl flex-shrink-0">
                      🌾
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-gray-900">{order.cropName}</h4>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            order.deliveryStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.deliveryStatus === 'delivered' ? 'Delivered' : 'In Transit'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {lang === 'te' ? 'రైతు:' : 'Farmer:'} <strong className="text-gray-800">{order.farmerName}</strong> • {order.farmerPhone}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.quantity} {order.unit} @ ₹{order.pricePerUnit}/{order.unit} • Txn: {order.txnId}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right mr-1">
                      <span className="text-base font-black text-blue-900 block">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-semibold">
                        {order.escrowStatus === 'released' ? 'Escrow Released ✅' : 'Escrow Protected 🔒'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track-order?orderId=${order.txnId}&crop=${encodeURIComponent(order.cropName)}&amount=${order.totalAmount}&farmer=${encodeURIComponent(order.farmerName)}`}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <MapPin size={13} />
                        <span>{lang === 'te' ? 'లైవ్ ట్రాకింగ్' : 'Track Order'}</span>
                      </Link>

                      {order.deliveryStatus !== 'delivered' ? (
                        <button
                          onClick={() => handleConfirmDelivery(order.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <CheckCircle2 size={13} />
                          <span>{lang === 'te' ? 'డెలివరీ అందింది' : 'Release Funds'}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 size={13} /> {lang === 'te' ? 'పూర్తయింది' : 'Completed'}
                        </span>
                      )}
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