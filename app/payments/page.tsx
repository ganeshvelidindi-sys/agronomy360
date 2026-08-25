'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  CreditCard, ShieldCheck, CheckCircle2, QrCode, 
  ArrowRight, Smartphone, Building, RefreshCw, Lock, AlertCircle 
} from 'lucide-react';

export default function PaymentsPage() {
  const { lang, user } = useApp();
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [amount, setAmount] = useState('42000');
  const [cropName, setCropName] = useState('Basmati Rice (1,000 kg)');
  const [farmerName, setFarmerName] = useState('Rajesh Kumar');
  const [farmerUpi, setFarmerUpi] = useState('rajesh.kumar@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setTxnId('AGR360-' + Math.floor(100000 + Math.random() * 900000));
      setPaymentSuccess(true);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-[#1a5c2a] text-xs font-bold mb-3">
            <Lock size={14} /> 100% Secure Direct Escrow Settlement
          </div>
          <h1 className="text-3xl font-black text-gray-900">Direct Farmer Payment & Escrow</h1>
          <p className="text-gray-500 mt-1 max-w-xl mx-auto">
            Zero mediator commission. Your payment is held safely in escrow and transferred directly to the farmer's verified bank account upon delivery.
          </p>
        </div>

        {paymentSuccess ? (
          <div className="card p-8 sm:p-12 text-center max-w-xl mx-auto bg-white">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1a5c2a]">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Confirmed in Escrow!</h2>
            <p className="text-gray-600 mb-6 text-sm">
              ₹{Number(amount).toLocaleString()} has been safely locked in the Agronomy 360 Escrow Vault for order of <strong className="text-gray-900">{cropName}</strong> from <strong className="text-gray-900">{farmerName}</strong>.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs text-gray-700 space-y-2 mb-6 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold text-gray-900">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiary Farmer:</span>
                <span className="font-semibold text-gray-900">{farmerName} ({farmerUpi})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mediator / Platform Fee:</span>
                <span className="font-bold text-green-700">₹0 (100% Free Direct Trade)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-500">Release Condition:</span>
                <span className="font-semibold text-gray-900">Buyer verification upon crop unloading</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/buyer" className="btn-primary flex-1 text-center py-3 text-sm">
                View in Buyer Dashboard
              </Link>
              <button 
                onClick={() => setPaymentSuccess(false)}
                className="btn-secondary flex-1 py-3 text-sm"
              >
                Make Another Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-8">
            {/* Payment Details Form */}
            <div className="md:col-span-3 card p-6 sm:p-8 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-[#1a5c2a]" /> Choose Payment Method
              </h2>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                  { id: 'card', label: 'Debit / Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Building },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id as any)}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                      method === id
                        ? 'border-[#1a5c2a] bg-green-50 text-[#1a5c2a]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Crop & Farmer Details
                  </label>
                  <input
                    type="text"
                    value={`${cropName} • Farmer: ${farmerName}`}
                    disabled
                    className="input-field bg-gray-50 text-gray-600 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Payable Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-field pl-8 font-black text-lg text-gray-900"
                      required
                    />
                  </div>
                </div>

                {method === 'upi' && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Farmer UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={farmerUpi}
                      onChange={(e) => setFarmerUpi(e.target.value)}
                      className="input-field text-sm"
                      placeholder="e.g. mobile@upi"
                      required
                    />
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                      <QrCode size={36} className="text-amber-700 flex-shrink-0" />
                      <p className="text-xs text-amber-800 leading-snug">
                        Or scan the farmer's direct QR code at the farm during direct pickup.
                      </p>
                    </div>
                  </div>
                )}

                {method === 'card' && (
                  <div className="space-y-3 pt-2">
                    <input type="text" placeholder="Card Number (16 digits)" className="input-field text-sm" required />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM / YY" className="input-field text-sm" required />
                      <input type="password" placeholder="CVV" maxLength={4} className="input-field text-sm" required />
                    </div>
                  </div>
                )}

                {method === 'netbanking' && (
                  <div className="space-y-3 pt-2">
                    <select className="input-field text-sm">
                      <option>State Bank of India (SBI)</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Punjab National Bank (PNB)</option>
                      <option>Bank of Baroda</option>
                      <option>Canara Bank</option>
                      <option>NABARD Assisted Apex Rural Banks</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 mt-4"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Securing Transaction in Escrow...
                    </>
                  ) : (
                    <>
                      Pay ₹{Number(amount).toLocaleString()} Safely to Escrow <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Escrow & Trust Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="card p-6 bg-gradient-to-br from-[#1a5c2a] to-[#2d8a4e] text-white">
                <ShieldCheck size={36} className="text-[#f5a623] mb-3" />
                <h3 className="font-bold text-lg leading-tight mb-2">
                  100% Middleman-Free Escrow Protection
                </h3>
                <p className="text-xs text-green-100 leading-relaxed mb-4">
                  Agronomy 360 acts as a neutral technology bridge. No middleman cuts.
                </p>
                <div className="space-y-2 text-xs text-green-50 border-t border-white/20 pt-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#f5a623]" /> Money held safely until dispatch & inspection
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#f5a623]" /> 1-Click fund release to farmer's UPI/Aadhaar
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#f5a623]" /> Dispute resolution supported with photo evidence
                  </div>
                </div>
              </div>

              <div className="card p-5 bg-white border border-gray-200 text-xs text-gray-600 space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <AlertCircle size={16} className="text-blue-600" /> Transparent Pricing Summary
                </div>
                <div className="flex justify-between">
                  <span>Crop Subtotal:</span>
                  <span className="font-bold text-gray-900">₹{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Brokerage Commission:</span>
                  <span className="font-bold">₹0.00 (Free)</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Platform Fee:</span>
                  <span className="font-bold">₹0.00 (Free)</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900 text-sm">
                  <span>Total Payable:</span>
                  <span className="text-[#1a5c2a]">₹{Number(amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
