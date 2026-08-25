'use client';
import { use, useState, useEffect, useRef } from 'react';
import { CROPS } from '@/lib/data';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  MapPin, Star, Calendar, Package, Shield, MessageCircle, Phone, 
  ArrowLeft, CheckCircle2, Truck, X, Video, VideoOff, Mic, MicOff, 
  Send, Smartphone, QrCode, CreditCard, Building, Lock, RefreshCw, 
  Volume2, UserCheck, Check, ArrowRight, Sparkles, AlertCircle,
  ExternalLink, Copy, SwitchCamera, MessageSquare, Share2
} from 'lucide-react';

interface ChatMsg {
  id: string;
  sender: 'buyer' | 'farmer';
  text: string;
  time: string;
}

export default function CropDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang, user } = useApp();
  const crop = CROPS.find(c => c.id === id) || CROPS[0];

  // Modals state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBargainModal, setShowBargainModal] = useState(false);
  const [showCallOptionModal, setShowCallOptionModal] = useState(false);

  // Buy / UPI state
  const [orderQuantity, setOrderQuantity] = useState(crop.quantity > 500 ? 500 : crop.quantity);
  const [paymentMethod, setPaymentMethod] = useState<'upi_app' | 'upi_qr' | 'card' | 'netbanking'>('upi_app');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paySuccessData, setPaySuccessData] = useState<{ txnId: string; amount: number } | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedRoomLink, setCopiedRoomLink] = useState(false);

  // In-app Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: '1',
      sender: 'farmer',
      text: `నమస్కారం / Hello! I am ${crop.farmer}. I am ready to dispatch ${crop.name} (Grade ${crop.qualityGrade}) from ${crop.location}. How many ${crop.unit}s do you need?`,
      time: '10:30 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isFarmerTyping, setIsFarmerTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Real Camera & Microphone Video Call state
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasRealCamera, setHasRealCamera] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Bargain state
  const [offeredPrice, setOfferedPrice] = useState(Math.round(crop.price * 0.9));
  const [bargainQuantity, setBargainQuantity] = useState(500);
  const [bargainStatus, setBargainStatus] = useState<'idle' | 'submitted' | 'accepted'>('idle');

  const totalAmount = orderQuantity * crop.price;
  const cleanPhone = (crop.phone || '+919848012345').replace(/[^0-9]/g, '');
  const upiId = crop.upiId || 'farmer@oksbi';

  // Live Jitsi / WebRTC shareable meeting room URL
  const videoRoomUrl = `https://meet.jit.si/agronomy360-${crop.id}-${crop.farmerId}`;

  // WhatsApp Deep Link URL
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${crop.farmer}, I found your listing for ${crop.name} (Grade ${crop.qualityGrade}, ₹${crop.price}/${crop.unit}) on Agronomy 360. I would like to buy ${orderQuantity} ${crop.unit}s. Please let me know your availability.`
  )}`;

  // Mobile UPI Intent URL (Official Indian NPCI UPI Specification)
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(crop.farmer)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Agronomy360 Escrow - ${crop.name}`)}`;
  
  // Specific UPI App URLs
  const getAppUpiUrl = (app: string) => {
    switch (app) {
      case 'phonepe':
        return `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(crop.farmer)}&am=${totalAmount}&cu=INR`;
      case 'gpay':
        return `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(crop.farmer)}&am=${totalAmount}&cu=INR`;
      case 'paytm':
        return `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(crop.farmer)}&am=${totalAmount}&cu=INR`;
      default:
        return upiIntentUrl;
    }
  };

  // Real Camera Access Hook when Video Call modal opens
  useEffect(() => {
    let timer: any;
    if (showVideoModal) {
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
  }, [showVideoModal, facingMode]);

  const startCamera = async (facing: 'user' | 'environment') => {
    stopCamera();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: true
        });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setHasRealCamera(true);
        setCameraError(null);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasRealCamera(false);
      setCameraError('Camera / Mic permission denied or not available. Displaying simulated farm video feed.');
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
        track.enabled = isMuted; // toggle
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff; // toggle
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (showChatModal) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChatModal, isFarmerTyping]);

  // Send buyer chat message
  const sendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInput.trim();
    if (!text) return;

    const newMsg: ChatMsg = {
      id: Date.now().toString(),
      sender: 'buyer',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsFarmerTyping(true);

    // Simulate farmer reply
    setTimeout(() => {
      let reply = `నమస్కారం! Yes, we have ready stock of ${crop.name} available at ${crop.location}. We can load for delivery immediately.`;
      if (text.toLowerCase().includes('price') || text.toLowerCase().includes('rate') || text.toLowerCase().includes('ధర') || text.toLowerCase().includes('bargain')) {
        reply = `Since we sell direct with 0% middleman cuts, ₹${crop.price}/${crop.unit} is our best rate. For 1,000+ ${crop.unit}s order, I can give ₹${Math.round(crop.price * 0.95)}/${crop.unit}!`;
      } else if (text.toLowerCase().includes('video') || text.toLowerCase().includes('call') || text.toLowerCase().includes('చూపించు')) {
        reply = `Sure! You can click "Real Video Call" button or reach me on WhatsApp: ${crop.phone}`;
      } else if (text.toLowerCase().includes('transport') || text.toLowerCase().includes('delivery') || text.toLowerCase().includes('లారీ')) {
        reply = `Yes, local transport is available for direct dispatch to your destination.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'farmer',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsFarmerTyping(false);
    }, 1200);
  };

  // Handle Payment Submission
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      setPaySuccessData({
        txnId: 'UPI-AGR-' + Math.floor(100000000 + Math.random() * 900000000),
        amount: totalAmount
      });
    }, 1500);
  };

  const copyToClipboard = (text: string, type: 'upi' | 'phone' | 'room') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') { setCopiedUpi(true); setTimeout(() => setCopiedUpi(false), 2000); }
    if (type === 'phone') { setCopiedPhone(true); setTimeout(() => setCopiedPhone(false), 2000); }
    if (type === 'room') { setCopiedRoomLink(true); setTimeout(() => setCopiedRoomLink(false), 2000); }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between pb-20 sm:pb-0">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* Back navigation */}
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-[#1a5c2a] font-bold mb-4 sm:mb-6 hover:underline text-sm sm:text-base">
          <ArrowLeft size={18} /> {t(lang, 'back')} to Marketplace
        </Link>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Image + Farmer Card */}
          <div>
            <div className="rounded-3xl overflow-hidden h-72 sm:h-80 lg:h-96 relative shadow-lg bg-black">
              <img src={crop.images[0]} alt={crop.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                {crop.organic && <span className="badge-organic">🌿 Organic</span>}
                {crop.verified && <span className="badge-verified">✓ Verified Farmer</span>}
              </div>
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl font-black text-[#1a5c2a] text-sm shadow">
                Grade {crop.qualityGrade}
              </div>

              {/* Live Video Action Pill */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md rounded-2xl p-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                  <span className="truncate">Direct Farm Ready · {crop.quantity.toLocaleString()} {crop.unit}s</span>
                </div>
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="bg-[#1a5c2a] hover:bg-[#15803d] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow flex-shrink-0"
                >
                  <Video size={14} /> Live Camera Call
                </button>
              </div>
            </div>

            {/* Farmer Profile Card with Real Direct Communication Options */}
            <div className="card mt-4 p-5 border border-green-100 bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 border-2 border-[#1a5c2a] rounded-2xl flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                  👨‍🌾
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{crop.farmer}</h3>
                    <span className="bg-green-100 text-[#1a5c2a] text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
                      Direct Seller
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                    <MapPin size={13} className="text-[#1a5c2a] flex-shrink-0" />
                    <span className="truncate">{crop.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-xs">
                      <Star size={13} className="text-amber-400 fill-amber-400 mr-1" />
                      <span className="font-bold text-gray-800">{crop.rating}</span>
                    </div>
                    <span className="text-gray-400 text-xs">({crop.reviews} reviews)</span>
                  </div>
                </div>
                {crop.verified && (
                  <div className="text-center bg-green-50 p-2.5 rounded-2xl border border-green-200 flex-shrink-0">
                    <CheckCircle2 size={20} className="text-[#1a5c2a] mx-auto" />
                    <div className="text-[10px] text-[#1a5c2a] font-bold mt-0.5">Verified</div>
                  </div>
                )}
              </div>

              {/* Direct Real Communication Action Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-gray-100">
                {/* 1. Real Phone Dialer Link */}
                <a
                  href={`tel:${crop.phone || '+919848012345'}`}
                  className="flex flex-col items-center justify-center gap-1 bg-green-50 hover:bg-green-100 text-[#1a5c2a] p-3 rounded-2xl border border-green-200 transition-all font-bold text-xs active:scale-95"
                >
                  <Phone size={18} className="text-green-700" />
                  <span>Call Mobile</span>
                </a>

                {/* 2. Real WhatsApp Link */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 p-3 rounded-2xl border border-emerald-200 transition-all font-bold text-xs active:scale-95"
                >
                  <MessageSquare size={18} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                {/* 3. Real Web Video Call */}
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex flex-col items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-800 p-3 rounded-2xl border border-blue-200 transition-all font-bold text-xs active:scale-95"
                >
                  <Video size={18} className="text-blue-600" />
                  <span>Video Call</span>
                </button>

                {/* 4. In-App Direct Chat */}
                <button
                  onClick={() => setShowChatModal(true)}
                  className="flex flex-col items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-800 p-3 rounded-2xl border border-purple-200 transition-all font-bold text-xs active:scale-95"
                >
                  <MessageCircle size={18} className="text-purple-600" />
                  <span>In-App Chat</span>
                </button>
              </div>

              {/* Direct Phone Number Display */}
              <div className="mt-3 bg-gray-50 rounded-xl p-2.5 flex items-center justify-between text-xs text-gray-700 border border-gray-100">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-500" />
                  Farmer Direct Mobile: <strong>{crop.phone || '+91 98480 12345'}</strong>
                </span>
                <button
                  onClick={() => copyToClipboard(crop.phone || '+919848012345', 'phone')}
                  className="text-xs text-[#1a5c2a] hover:underline font-bold flex items-center gap-1"
                >
                  {copiedPhone ? <Check size={12} /> : <Copy size={12} />}
                  {copiedPhone ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Crop Details & Direct Buy Actions */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} /> {crop.category} · Direct Farm Gate Price
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">{crop.name}</h1>
            <p className="text-gray-600 mb-5 text-xs sm:text-sm leading-relaxed">{crop.description}</p>

            {/* Direct Price Banner */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-5 sm:p-6 mb-5 shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-5xl font-black text-[#1a5c2a]">₹{crop.price.toLocaleString()}</span>
                <span className="text-gray-500 font-bold text-lg sm:text-xl">/{crop.unit}</span>
                <span className="ml-auto text-[11px] sm:text-xs bg-[#1a5c2a] text-white font-bold px-3 py-1 rounded-full">
                  0% Mediator Cuts
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200/60 flex items-center justify-between text-xs text-green-900">
                <span>💡 Mandi Broker Rate: <del className="text-gray-500 font-medium">₹{Math.round(crop.price * 1.25)}/{crop.unit}</del></span>
                <span className="font-bold text-[#1a5c2a]">You Save ~20% Direct</span>
              </div>
            </div>

            {/* Key Crop Specifications Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
              {[
                { icon: Package, label: t(lang, 'quantity'), value: `${crop.quantity.toLocaleString()} ${crop.unit}s Ready` },
                { icon: Calendar, label: t(lang, 'harvestDate'), value: new Date(crop.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { icon: Shield, label: t(lang, 'quality'), value: `Grade ${crop.qualityGrade} Premium` },
                { icon: MapPin, label: t(lang, 'location'), value: `${crop.location}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 bg-white border border-gray-100">
                  <Icon size={18} className="text-[#1a5c2a] flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] text-gray-500 font-semibold truncate">{label}</div>
                    <div className="font-bold text-gray-900 text-xs sm:text-xs mt-0.5 truncate">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 mb-5">
              {/* Buy Now / Pay Button */}
              <button
                onClick={() => setShowBuyModal(true)}
                className="w-full bg-[#1a5c2a] hover:bg-[#15803d] text-white font-black py-4 px-6 rounded-2xl text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Smartphone size={22} className="text-[#f5a623]" />
                {t(lang, 'buyNow')} — Direct UPI / Escrow Pay
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowBargainModal(true)}
                  className="btn-secondary py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  🏷️ Bargain / Quote
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-center"
                >
                  <MessageSquare size={16} /> WhatsApp Deal
                </a>
              </div>
            </div>

            {/* Escrow Trust Guarantee */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
              <Shield size={22} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-blue-900 text-xs sm:text-sm">Agronomy 360 Escrow Protection</div>
                <div className="text-blue-700 text-xs mt-1 leading-relaxed">
                  {t(lang, 'escrowInfo')}. Farmer receives payment directly into their bank account once you inspect and accept quality.
                </div>
              </div>
            </div>

            {/* Transport Note */}
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <Truck size={16} className="text-[#1a5c2a] flex-shrink-0" />
              <span>Verified farm-gate logistics & truck booking available upon deal confirmation.</span>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM BAR (Tappable for Quick Direct Call / WhatsApp / Buy) */}
      {/* ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 flex items-center gap-2 shadow-2xl">
        <a
          href={`tel:${crop.phone || '+919848012345'}`}
          className="w-12 h-12 bg-green-50 border border-green-300 text-[#1a5c2a] rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95"
          title="Direct Phone Call"
        >
          <Phone size={20} />
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95"
          title="WhatsApp Chat"
        >
          <MessageSquare size={20} />
        </a>
        <button
          onClick={() => setShowBuyModal(true)}
          className="flex-1 bg-[#1a5c2a] text-white py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <Smartphone size={18} className="text-[#f5a623]" /> Buy (₹{crop.price}/{crop.unit})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DIRECT UPI & ESCROW PAYMENT MODAL (Mobile Intent + QR + Card) */}
      {/* ========================================================================= */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-fade-in-up">
            <button
              onClick={() => { setShowBuyModal(false); setPaySuccessData(null); }}
              className="absolute top-4 sm:top-5 right-4 sm:top-5 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {paySuccessData ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1a5c2a]">
                  <CheckCircle2 size={44} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Payment Secured in Escrow!</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  ₹{paySuccessData.amount.toLocaleString()} has been safely locked for <strong className="text-gray-900">{orderQuantity} {crop.unit}s</strong> of {crop.name}.
                </p>

                <div className="bg-gray-50 rounded-2xl p-4 my-6 text-left text-xs space-y-2 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-mono font-bold text-gray-900">{paySuccessData.txnId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Direct Farmer Payee:</span>
                    <span className="font-bold text-gray-900">{crop.farmer} ({upiId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Middleman Fee:</span>
                    <span className="font-bold text-green-700">₹0 (Zero Commission)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-bold text-[#1a5c2a]">Protected in Escrow (Release on Delivery)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard/buyer"
                    className="btn-primary flex-1 py-3.5 text-center text-sm font-bold"
                  >
                    Track in Buyer Dashboard
                  </Link>
                  <button
                    onClick={() => { setShowBuyModal(false); setPaySuccessData(null); }}
                    className="btn-secondary flex-1 py-3.5 text-sm font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900">Direct Farm Purchase</h3>
                    <p className="text-xs text-gray-500">Seller: {crop.farmer} · {crop.location}</p>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  {/* Quantity selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Select Quantity ({crop.unit}s)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={10}
                        max={crop.quantity}
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                        className="input-field font-black text-lg text-gray-900 flex-1"
                        required
                      />
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500">Total Amount</div>
                        <div className="text-xl font-black text-[#1a5c2a]">
                          ₹{totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Choose Direct Payment Option
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'upi_app', label: 'UPI Apps', icon: Smartphone },
                        { id: 'upi_qr', label: 'Farmer QR', icon: QrCode },
                        { id: 'card', label: 'Card / Net', icon: CreditCard },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id as any)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                            paymentMethod === id
                              ? 'border-[#1a5c2a] bg-green-50 text-[#1a5c2a]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={18} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Method: UPI Apps */}
                  {paymentMethod === 'upi_app' && (
                    <div className="space-y-3 pt-2">
                      {/* Direct Mobile UPI Intent Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'gpay', label: 'Google Pay', color: 'border-blue-300 hover:bg-blue-50 text-blue-700' },
                          { id: 'phonepe', label: 'PhonePe', color: 'border-purple-300 hover:bg-purple-50 text-purple-700' },
                          { id: 'paytm', label: 'Paytm', color: 'border-sky-300 hover:bg-sky-50 text-sky-700' },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => {
                              setSelectedUpiApp(app.id as any);
                              // On mobile, trigger direct UPI URL intent
                              if (typeof window !== 'undefined') {
                                window.location.href = getAppUpiUrl(app.id);
                              }
                            }}
                            className={`p-2.5 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                              selectedUpiApp === app.id
                                ? 'border-[#1a5c2a] bg-green-50 text-[#1a5c2a] ring-2 ring-green-200'
                                : app.color
                            }`}
                          >
                            <span>📱 {app.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Direct Universal UPI Intent trigger */}
                      <a
                        href={upiIntentUrl}
                        className="w-full bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors block text-center"
                      >
                        <Smartphone size={14} /> Open Default Mobile UPI App (GPay/PhonePe/Paytm)
                      </a>

                      {/* Copy UPI ID */}
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-gray-500">Farmer UPI VPA:</div>
                          <div className="font-mono font-bold text-gray-800">{upiId}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(upiId, 'upi')}
                          className="bg-white border border-gray-300 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                        >
                          {copiedUpi ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                          {copiedUpi ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Method: Farmer QR */}
                  {paymentMethod === 'upi_qr' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                      <div className="w-40 h-40 bg-white p-2 border border-gray-300 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                        {/* Dynamic Live QR code generator for standard UPI */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiIntentUrl)}`}
                          alt="Farmer UPI QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-xs font-bold text-gray-800 mt-3">
                        Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Amount: ₹{totalAmount.toLocaleString()} · Payee: {crop.farmer}
                      </p>
                    </div>
                  )}

                  {/* Method: Card */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-2 pt-1">
                      <input type="text" placeholder="Card Number (16 digits)" className="input-field text-xs" defaultValue="4532 •••• •••• 8912" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="MM/YY" className="input-field text-xs" defaultValue="08/29" />
                        <input type="password" placeholder="CVV" className="input-field text-xs" defaultValue="•••" maxLength={4} />
                      </div>
                    </div>
                  )}

                  {/* Escrow Guarantee Note */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2 text-xs text-green-900">
                    <Lock size={15} className="text-[#1a5c2a] flex-shrink-0 mt-0.5" />
                    <span>
                      Funds will be held in <strong>Agronomy 360 Escrow Vault</strong> and transferred directly to {crop.farmer}'s bank account after delivery verification.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPay}
                    className="btn-primary w-full py-4 text-sm sm:text-base font-black flex items-center justify-center gap-2 mt-2"
                  >
                    {isProcessingPay ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Authorizing Direct Escrow...
                      </>
                    ) : (
                      <>
                        Confirm ₹{totalAmount.toLocaleString()} in Escrow <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REAL DEVICE CAMERA & MICROPHONE VIDEO CALL MODAL */}
      {/* ========================================================================= */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gray-900 rounded-3xl max-w-2xl w-full h-[580px] sm:h-[600px] flex flex-col shadow-2xl relative overflow-hidden text-white animate-fade-in-up">
            {/* Top Call Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold tracking-wide">
                  LIVE INSPECTION · {formatTime(callDuration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={flipCamera}
                  className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                  title="Flip Front/Back Camera"
                >
                  <SwitchCamera size={14} /> Flip Cam
                </button>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main Video Stream Area */}
            <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
              {/* Farmer Camera Stream */}
              <img
                src={crop.images[0]}
                alt="Farmer crop camera"
                className="w-full h-full object-cover opacity-90 scale-105 filter saturate-110"
              />

              {/* Farmer Info Overlay */}
              <div className="absolute bottom-20 left-4 bg-black/65 backdrop-blur-md p-3 rounded-2xl border border-white/15 max-w-xs">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">👨‍🌾</div>
                  <div>
                    <h4 className="font-bold text-xs">{crop.farmer}</h4>
                    <p className="text-[10px] text-green-300">Live Field: {crop.location} · {crop.name}</p>
                  </div>
                </div>
              </div>

              {/* User Real Device Camera PIP (Picture-in-Picture) */}
              <div className="absolute top-16 right-4 w-32 h-44 sm:w-36 sm:h-48 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl flex items-center justify-center">
                {isVideoOff ? (
                  <div className="text-center p-2">
                    <VideoOff size={20} className="mx-auto text-gray-400 mb-1" />
                    <span className="text-[10px] text-gray-400">Camera Off</span>
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                )}
                <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white">
                  You ({facingMode === 'user' ? 'Front' : 'Back'})
                </div>
              </div>

              {/* Shareable P2P Link Banner */}
              <div className="absolute top-16 left-4 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center gap-2 text-[10px]">
                <span>Room Link:</span>
                <button
                  onClick={() => copyToClipboard(videoRoomUrl, 'room')}
                  className="bg-[#1a5c2a] px-2 py-0.5 rounded font-bold hover:bg-[#15803d] flex items-center gap-1"
                >
                  {copiedRoomLink ? <Check size={10} /> : <Share2 size={10} />}
                  {copiedRoomLink ? 'Copied Room!' : 'Share Call'}
                </button>
                <a
                  href={videoRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 underline flex items-center gap-0.5"
                >
                  Open Full Screen <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Bottom Call Controls */}
            <div className="h-20 bg-zinc-900/95 border-t border-white/10 px-4 sm:px-6 flex items-center justify-between">
              {/* Quick Deal button during call */}
              <button
                onClick={() => { setShowVideoModal(false); setShowBuyModal(true); }}
                className="bg-[#1a5c2a] hover:bg-[#15803d] text-white px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 size={16} className="text-[#f5a623]" /> Lock Deal in Escrow
              </button>

              {/* Call Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={toggleMute}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOff ? 'bg-red-500 text-white' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
                </button>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg ml-1"
                  title="End Call"
                >
                  <Phone size={20} className="rotate-[135deg]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. IN-APP CHAT MODAL (With WhatsApp Direct Switch) */}
      {/* ========================================================================= */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full h-[580px] flex flex-col shadow-2xl relative overflow-hidden animate-fade-in-up">
            {/* Chat header */}
            <div className="bg-[#1a5c2a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  👨‍🌾
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                    {crop.farmer}
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-green-200 mt-0.5">
                    Direct Farmer · {crop.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white"
                  title="Switch to WhatsApp"
                >
                  <MessageSquare size={16} />
                </a>
                <button
                  onClick={() => { setShowChatModal(false); setShowVideoModal(true); }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                  title="Switch to Video Call"
                >
                  <Video size={16} />
                </button>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick action chips */}
            <div className="bg-gray-100 p-2.5 flex gap-2 overflow-x-auto border-b border-gray-200 scrollbar-hide">
              {[
                "Can you dispatch tomorrow?",
                "Can we negotiate on price?",
                "Can you share video of harvest?",
                "What is the transportation cost?"
              ].map((quick, i) => (
                <button
                  key={i}
                  onClick={() => sendChatMessage(quick)}
                  className="flex-shrink-0 bg-white border border-gray-300 text-gray-700 hover:border-[#1a5c2a] hover:text-[#1a5c2a] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'buyer'
                        ? 'bg-[#1a5c2a] text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1 text-right ${
                        msg.sender === 'buyer' ? 'text-green-200' : 'text-gray-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isFarmerTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 text-xs text-gray-500 flex items-center gap-1.5 shadow-sm">
                    <span>{crop.farmer} is typing</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type message in Telugu or English..."
                className="flex-1 input-field text-xs sm:text-sm py-2.5"
              />
              <button
                onClick={() => sendChatMessage()}
                disabled={!chatInput.trim()}
                className="w-10 h-10 bg-[#1a5c2a] disabled:opacity-50 text-white rounded-xl flex items-center justify-center hover:bg-[#15803d] transition-colors flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BARGAIN / PRICE QUOTE MODAL */}
      {/* ========================================================================= */}
      {showBargainModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in-up">
            <button
              onClick={() => { setShowBargainModal(false); setBargainStatus('idle'); }}
              className="absolute top-5 right-5 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600"
            >
              <X size={20} />
            </button>

            {bargainStatus === 'accepted' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-[#1a5c2a]">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Farmer Accepted Offer! 🎉</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {crop.farmer} agreed to your proposed rate of <strong>₹{offeredPrice}/{crop.unit}</strong> for {bargainQuantity} {crop.unit}s!
                </p>
                <button
                  onClick={() => { setShowBargainModal(false); setOrderQuantity(bargainQuantity); setShowBuyModal(true); }}
                  className="btn-primary w-full py-3.5 text-sm font-bold mt-6"
                >
                  Proceed to Pay ₹{(offeredPrice * bargainQuantity).toLocaleString()} in Escrow
                </button>
              </div>
            ) : bargainStatus === 'submitted' ? (
              <div className="text-center py-6">
                <RefreshCw size={36} className="animate-spin text-[#1a5c2a] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">Sending Quote to {crop.farmer}...</h3>
                <p className="text-xs text-gray-500 mt-1">Direct instant notification sent to farmer app.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-1">Make a Direct Offer</h3>
                <p className="text-xs text-gray-500 mb-5">
                  Negotiate directly with {crop.farmer}. Original Price: ₹{crop.price}/{crop.unit}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Offered Price (₹/{crop.unit})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        value={offeredPrice}
                        onChange={(e) => setOfferedPrice(Number(e.target.value))}
                        className="input-field pl-8 font-black text-lg text-gray-900"
                        min={1}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Quantity ({crop.unit}s)
                    </label>
                    <input
                      type="number"
                      value={bargainQuantity}
                      onChange={(e) => setBargainQuantity(Number(e.target.value))}
                      className="input-field font-bold text-base text-gray-900"
                      min={10}
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    💡 <strong>Tip:</strong> Farmers readily accept 5-10% discount for orders above 500 {crop.unit}s with instant escrow payment.
                  </div>

                  <button
                    onClick={() => {
                      setBargainStatus('submitted');
                      setTimeout(() => setBargainStatus('accepted'), 1500);
                    }}
                    className="btn-primary w-full py-3.5 text-sm font-black"
                  >
                    Submit Offer (Total: ₹{(offeredPrice * bargainQuantity).toLocaleString()})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
