'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveDeliveryMap from '@/components/LiveDeliveryMap';
import { useApp } from '@/lib/context';
import { OrderDB, DBOrder } from '@/lib/db';
import Link from 'next/link';
import {
  ArrowLeft, ShieldCheck, CheckCircle2, Package,
  ExternalLink, Phone, MessageSquare, AlertTriangle, Sparkles
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'AGR360-849201';
  const cropParam = searchParams.get('crop') || 'Basmati Rice (Grade A+)';
  const amountParam = searchParams.get('amount') || '42000';

  const { user, addNotification } = useApp();
  const [order, setOrder] = useState<DBOrder | null>(null);
  const [delivered, setDelivered] = useState(false);

  useEffect(() => {
    const all = OrderDB.getAll();
    const found = all.find(o => o.id === orderId || o.txnId.includes(orderId));
    if (found) {
      setOrder(found);
      if (found.deliveryStatus === 'delivered') setDelivered(true);
    }
  }, [orderId]);

  const handleConfirmDelivery = () => {
    if (order) {
      OrderDB.confirmDelivery(order.id);
    }
    setDelivered(true);
    addNotification({
      title: 'Delivery Confirmed! ✅',
      message: 'Escrow payment has been securely released to the farmer bank account.',
      type: 'order',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/buyer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
            <ShieldCheck size={14} /> 100% Escrow Protected
          </span>
        </div>

        {/* ── ZOMATO PIN-TO-PIN LIVE MAP COMPONENT ──────────── */}
        <LiveDeliveryMap
          orderId={order?.txnId || orderId}
          cropName={order?.cropName || cropParam}
          farmerName={order?.farmerName || 'V Ganesh (Verified Farmer)'}
          farmerLocation="Karimnagar, Telangana"
        />

        {/* ── ESCROW RELEASE & QUALITY INSPECTION CARD ──────── */}
        <div className="mt-8 bg-white/85 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-gray-200/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Escrow Security Vault
              </span>
              <h3 className="text-xl font-black text-gray-900 tracking-tight mt-1.5">
                Safe Physical Inspection Guarantee
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-lg leading-relaxed">
                Your payment is safely locked in the Agronomy 360 Escrow Vault. Only release funds after the truck arrives, you inspect the crop quality, and confirm moisture/grade.
              </p>
            </div>

            <div className="text-left md:text-right flex-shrink-0">
              <span className="text-xs text-gray-400 block font-semibold">Total Escrow Vault Lock</span>
              <span className="text-2xl font-black text-emerald-700 block">
                ₹{Number(order?.totalAmount || amountParam).toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-500 font-bold block mt-0.5">
                0% Mediator Commission
              </span>
            </div>
          </div>

          {/* Delivery Confirmation Action */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <span>
                Funds will only be credited to the farmer after you tap <strong>"Confirm Delivery"</strong>.
              </span>
            </div>

            {delivered ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300">
                <CheckCircle2 size={16} />
                <span>Delivery Completed & Escrow Released ✅</span>
              </div>
            ) : (
              <button
                onClick={handleConfirmDelivery}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>Inspect Crop & Release Escrow Funds</span>
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs font-bold text-gray-500">
        Loading live tracking...
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
