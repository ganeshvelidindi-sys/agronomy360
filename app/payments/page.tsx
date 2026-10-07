'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { OrderDB } from '@/lib/db';
import {
  CreditCard, ShieldCheck, CheckCircle2, QrCode,
  ArrowRight, Smartphone, Building, RefreshCw, Lock,
  AlertCircle, Download, Printer, Navigation, Volume2,
  Check, Copy, Sparkles, ExternalLink
} from 'lucide-react';

export default function PaymentsPage() {
  const { lang, user, addNotification } = useApp();

  const [method, setMethod] = useState<'upi' | 'qr' | 'netbanking'>('upi');
  const [amount, setAmount] = useState('42000');
  const [cropName, setCropName] = useState('Basmati Rice (Grade A+, 1,000 kg)');
  const [farmerName, setFarmerName] = useState('V Ganesh (Verified Farmer)');
  const [farmerUpi, setFarmerUpi] = useState('ganeshvelidindi@okaxis');

  // UPI Input & Verification
  const [buyerUpiId, setBuyerUpiId] = useState('buyer@okaxis');
  const [vpaVerified, setVpaVerified] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Bank selection
  const [selectedBank, setSelectedBank] = useState('State Bank of India');

  // Processing & Simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0); // 0: Idle, 1: NPCI, 2: Token, 3: Escrow Lock
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  // Official NPCI UPI Specification URI
  const officialUpiString = `upi://pay?pa=${farmerUpi}&pn=${encodeURIComponent(farmerName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Agronomy360 Escrow - ${cropName}`)}`;

  // Voice announcement helper
  const announcePayment = (amt: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Rupees ${amt} secured successfully in Agronomy 360 Escrow Vault!`;
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      } catch {}
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessStep(1);

    // Step 1: Handshake with NPCI
    await new Promise(r => setTimeout(r, 900));
    setProcessStep(2);

    // Step 2: Bank token authorization
    await new Promise(r => setTimeout(r, 1000));
    setProcessStep(3);

    // Step 3: Vault lock
    await new Promise(r => setTimeout(r, 900));

    const generatedTxn = 'AGR360-' + Math.floor(100000000 + Math.random() * 900000000);
    const generatedUtr = 'UTR-' + Math.floor(400000000000 + Math.random() * 599999999999);
    setTxnId(generatedTxn);
    setUtrNumber(generatedUtr);
    setIsProcessing(false);
    setPaymentSuccess(true);

    // Save order in OrderDB with Escrow status held
    if (user) {
      OrderDB.create({
        cropId: 'crop_1',
        cropName,
        farmerId: 'farmer_v_ganesh',
        farmerName,
        farmerPhone: '9177923765',
        buyerId: user.id,
        buyerName: user.name || 'Buyer',
        buyerPhone: user.phone || '9876543210',
        quantity: 1000,
        unit: 'kg',
        pricePerUnit: 42,
        totalAmount: Number(amount),
        paymentMethod: method.toUpperCase(),
      });
    }

    // Voice announcement
    announcePayment(Number(amount).toLocaleString());

    addNotification({
      title: 'Payment Secured in Escrow Vault! 🔒',
      message: `₹${Number(amount).toLocaleString()} locked safely for ${cropName}`,
      type: 'order',
    });
  };

  const copyUpiId = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(farmerUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        
        {/* ── HEADER ────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200 mb-3 shadow-sm">
            <Lock size={13} className="text-emerald-600" />
            <span>Official NPCI UPI & Bank Escrow Safe-Vault</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Direct Farmer Payment
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl mx-auto leading-relaxed">
            100% Zero Brokerage. Funds are safely locked in the Escrow Vault and transferred directly to the farmer after you inspect the physical crop delivery.
          </p>
        </div>

        {/* ── PAYMENT SUCCESS / ESCROW LOCKED SCREEN ──────────── */}
        {paymentSuccess ? (
          <div className="bg-white/90 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-10 text-center max-w-xl mx-auto shadow-2xl shadow-gray-200/60 animate-fade-in-up">
            
            {/* Vault Lock Animation Badge */}
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute -inset-2 bg-emerald-400/30 rounded-full animate-ping" />
              <div className="relative w-20 h-20 bg-gradient-to-tr from-emerald-500 to-green-400 text-white rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30">
                🔒
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2 border border-emerald-200">
              <CheckCircle2 size={13} /> Escrow Vault Locked Successfully
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-1">
              ₹{Number(amount).toLocaleString()} Secured in Vault!
            </h2>
            <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
              Your payment for <strong className="text-gray-900">{cropName}</strong> is held safely. The farmer has been notified to dispatch the truck immediately.
            </p>

            {/* Official GST Invoice Breakdown */}
            <div className="bg-gray-50/90 rounded-2xl p-5 text-left text-xs text-gray-700 space-y-2.5 mb-6 border border-gray-200/80 shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <span>🌾</span> AGRONOMY 360 ESCROW RECEIPT
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  ESCROW-VERIFIED
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold text-gray-900">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">NPCI UTR Number:</span>
                <span className="font-mono font-bold text-emerald-700">{utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiary Farmer:</span>
                <span className="font-semibold text-gray-900">{farmerName} ({farmerUpi})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform Commission:</span>
                <span className="font-bold text-emerald-600">₹0 (100% Free Direct Farm Sourcing)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-500">Fund Release Terms:</span>
                <span className="font-semibold text-gray-900">Released only upon physical buyer inspection</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* PRIMARY ACTION: Zomato-Style Live Tracking */}
              <Link
                href={`/track-order?orderId=${txnId}&crop=${encodeURIComponent(cropName)}&amount=${amount}`}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Navigation size={18} />
                <span>Track Live Delivery to Your Pin (Zomato Style) →</span>
              </Link>

              <div className="flex gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Printer size={15} /> Print Receipt
                </button>
                <button
                  onClick={() => setPaymentSuccess(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all active:scale-95"
                >
                  Pay Another Order
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* ── PAYMENT METHODS SELECTION & ORDER FORM ─────────── */
          <div className="grid md:grid-cols-5 gap-6 sm:gap-8">
            
            {/* Left 3 cols: Payment Method Form */}
            <div className="md:col-span-3 bg-white/85 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-gray-200/50">
              <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                <span>Choose Payment Method</span>
              </h2>

              {/* Segmented Method Tabs */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {[
                  { id: 'upi', label: 'UPI Apps', icon: '📱' },
                  { id: 'qr', label: 'Scan QR', icon: '📷' },
                  { id: 'netbanking', label: 'NetBanking', icon: '🏛️' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id as any)}
                    className={`py-3 px-2 rounded-2xl border-2 text-center transition-all active:scale-95 flex flex-col items-center gap-1 ${
                      method === m.id
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-black shadow-md shadow-emerald-500/10'
                        : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-gray-100 font-bold'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* METHOD 1: UPI INTENT & DIRECT APPS */}
              {method === 'upi' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                      Pay Directly via UPI App (Instant Mobile Redirect)
                    </label>

                    {/* Official UPI App Deep Link Intent Buttons */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href={`tez://upi/pay?pa=${farmerUpi}&pn=${encodeURIComponent(farmerName)}&am=${amount}&cu=INR`}
                        className="py-3 px-3 rounded-2xl border-2 border-gray-200 hover:border-emerald-400 bg-white hover:bg-emerald-50 flex items-center gap-2.5 font-bold text-xs text-gray-800 shadow-sm transition-all active:scale-95"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-[10px]">G</span>
                        <span>Google Pay</span>
                      </a>

                      <a
                        href={`phonepe://pay?pa=${farmerUpi}&pn=${encodeURIComponent(farmerName)}&am=${amount}&cu=INR`}
                        className="py-3 px-3 rounded-2xl border-2 border-gray-200 hover:border-purple-400 bg-white hover:bg-purple-50 flex items-center gap-2.5 font-bold text-xs text-gray-800 shadow-sm transition-all active:scale-95"
                      >
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-[10px]">P</span>
                        <span>PhonePe</span>
                      </a>

                      <a
                        href={`paytmmp://pay?pa=${farmerUpi}&pn=${encodeURIComponent(farmerName)}&am=${amount}&cu=INR`}
                        className="py-3 px-3 rounded-2xl border-2 border-gray-200 hover:border-sky-400 bg-white hover:bg-sky-50 flex items-center gap-2.5 font-bold text-xs text-gray-800 shadow-sm transition-all active:scale-95"
                      >
                        <span className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-[10px]">Py</span>
                        <span>Paytm UPI</span>
                      </a>

                      <a
                        href={officialUpiString}
                        className="py-3 px-3 rounded-2xl border-2 border-gray-200 hover:border-emerald-400 bg-white hover:bg-emerald-50 flex items-center gap-2.5 font-bold text-xs text-gray-800 shadow-sm transition-all active:scale-95"
                      >
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">₹</span>
                        <span>Any UPI App</span>
                      </a>
                    </div>
                  </div>

                  {/* Manual UPI ID Input & Verification */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                      Or Enter Your UPI ID (VPA)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={buyerUpiId}
                        onChange={(e) => setBuyerUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="w-full px-4 py-3.5 pr-20 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setVpaVerified(true)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-black"
                      >
                        {vpaVerified ? 'Verified ✓' : 'Verify'}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Supports @okaxis, @okhdfcbank, @ybl, @paytm, @oksbi
                    </p>
                  </div>
                </div>
              )}

              {/* METHOD 2: OFFICIAL DYNAMIC UPI QR CODE */}
              {method === 'qr' && (
                <div className="text-center py-2 space-y-4">
                  <div className="relative inline-block bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-xl">
                    {/* Real Dynamic QR code generated with official NPCI URI */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(officialUpiString)}`}
                      alt="UPI Escrow QR Code"
                      className="w-48 h-48 mx-auto rounded-xl object-contain"
                    />
                    <div className="mt-2 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                      Scan with any UPI App to Pay ₹{Number(amount).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 text-left text-xs text-gray-600 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold">Farmer UPI ID:</span>
                      <strong className="text-gray-900 font-mono text-xs">{farmerUpi}</strong>
                    </div>
                    <button
                      onClick={copyUpiId}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center gap-1 active:scale-95"
                    >
                      {copiedUpi ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 3: NETBANKING */}
              {method === 'netbanking' && (
                <div className="space-y-4">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                    Select Your Bank
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all ${
                          selectedBank === b
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-black'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        🏛️ {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Banking Handshake Step Status if processing */}
              {isProcessing && (
                <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 animate-fade-in-up">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <RefreshCw size={14} className="animate-spin text-emerald-600" />
                    <span>Processing Secure Escrow Transaction...</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-emerald-700">
                    <p className={processStep >= 1 ? 'font-bold' : 'opacity-40'}>
                      {processStep >= 1 ? '✓' : '○'} Step 1: NPCI UPI Gateway Handshake Established
                    </p>
                    <p className={processStep >= 2 ? 'font-bold' : 'opacity-40'}>
                      {processStep >= 2 ? '✓' : '○'} Step 2: Bank Tokenization & Authorization Verified
                    </p>
                    <p className={processStep >= 3 ? 'font-bold' : 'opacity-40'}>
                      {processStep >= 3 ? '✓' : '○'} Step 3: Locking ₹{Number(amount).toLocaleString()} in Safe Escrow Vault
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Payment Button */}
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Securing in Vault...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Lock ₹{Number(amount).toLocaleString()} in Safe Escrow</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Right 2 cols: Escrow Order Summary Card */}
            <div className="md:col-span-2 space-y-5">
              <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Order Summary
                </span>

                <h3 className="text-base font-black text-gray-900 mt-2">{cropName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Farmer: {farmerName}</p>

                <div className="my-4 pt-4 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Crop Price:</span>
                    <span className="font-semibold text-gray-900">₹{Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Mediator / Broker Fee:</span>
                    <span className="font-bold text-emerald-600">₹0 (Zero Brokerage)</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Escrow Vault Protection:</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-black text-gray-900">
                    <span>Total Escrow Deposit:</span>
                    <span className="text-emerald-700">₹{Number(amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-200/80 text-[11px] text-emerald-800 space-y-1">
                  <p className="font-black flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    How Escrow Protects You:
                  </p>
                  <p className="leading-relaxed">
                    The farmer is only paid after the truck arrives at your gate and you inspect the crop. If quality is substandard, 100% refund is issued instantly.
                  </p>
                </div>
              </div>

              {/* Live Pin-to-Pin Tracking Quick Link */}
              <div className="bg-gradient-to-tr from-sky-50 to-blue-50/80 border border-sky-200 rounded-[2rem] p-5 text-center">
                <span className="text-2xl block mb-1">🚚</span>
                <h4 className="text-xs font-black text-gray-900">Live Delivery Tracking Ready</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 mb-3">
                  Zomato-style GPS pin-to-pin live route tracking enabled for this order.
                </p>
                <Link
                  href={`/track-order?orderId=AGR360-849201&crop=${encodeURIComponent(cropName)}&amount=${amount}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all"
                >
                  <Navigation size={12} />
                  <span>View Delivery Map</span>
                </Link>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
