'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CROPS } from '@/lib/data';
import { 
  ShoppingBag, Shield, Truck, Clock, CheckCircle2, 
  MapPin, MessageCircle, Phone, ArrowUpRight, Search, FileText
} from 'lucide-react';

const BUYER_ORDERS = [
  {
    id: 'ORD-7829',
    crop: 'Basmati Rice',
    quantity: '1,500 kg',
    totalPrice: 63000,
    farmer: 'Rajesh Kumar',
    location: 'Karimnagar, Telangana',
    date: '2026-08-20',
    status: 'In Transit',
    statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
    escrowStatus: 'Held Safely in Escrow (Release on Delivery)',
    estimatedDelivery: '2026-08-24',
    trackingStep: 2, // 1: Confirmed, 2: Dispatched, 3: Delivered
  },
  {
    id: 'ORD-6512',
    crop: 'Turmeric (Organic)',
    quantity: '400 kg',
    totalPrice: 48000,
    farmer: 'Lakshmi Devi',
    location: 'Nizamabad, Telangana',
    date: '2026-08-14',
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-800 border-green-200',
    escrowStatus: 'Payment Released to Farmer',
    estimatedDelivery: '2026-08-17',
    trackingStep: 3,
  },
  {
    id: 'ORD-5401',
    crop: 'Red Nasik Onions',
    quantity: '5,000 kg',
    totalPrice: 110000,
    farmer: 'Dinesh Sharma',
    location: 'Lasalgaon, Maharashtra',
    date: '2026-08-05',
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-800 border-green-200',
    escrowStatus: 'Payment Released to Farmer',
    estimatedDelivery: '2026-08-08',
    trackingStep: 3,
  }
];

export default function BuyerDashboard() {
  const { lang, user } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              🏪 Verified Buyer Account
            </div>
            <h1 className="text-3xl font-black text-gray-900">
              Welcome back, {user?.name || 'Bulk Procurement Manager'}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Direct crop sourcing with 0% mediator commission & Escrow protection.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="btn-primary flex items-center gap-2 text-sm py-3 px-5">
              <ShoppingBag size={18} /> Browse Direct Marketplace
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Procured', value: '₹2,21,000', sub: '3 Shipments', icon: '🌾', color: 'bg-green-50 text-green-700' },
            { label: 'Active Escrow', value: '₹63,000', sub: '1 In-Transit Order', icon: '🔒', color: 'bg-blue-50 text-blue-700' },
            { label: 'Saved vs Mandi Brokers', value: '~₹38,500', sub: 'Direct Farmer Sourcing', icon: '💰', color: 'bg-amber-50 text-amber-700' },
            { label: 'Connected Farmers', value: '14', sub: 'Across 4 States', icon: '👨‍🌾', color: 'bg-purple-50 text-purple-700' },
          ].map((stat, i) => (
            <div key={i} className="card p-5">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-700 mt-0.5">{stat.label}</div>
              <div className={`text-xs font-semibold mt-2 px-2 py-0.5 rounded-md inline-block ${stat.color}`}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Active Orders & Shipments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Truck size={20} className="text-[#1a5c2a]" /> Active & Recent Direct Orders
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Live tracking with direct farmer verification & escrow release status</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                  {BUYER_ORDERS.length} Orders
                </span>
              </div>

              <div className="space-y-4">
                {BUYER_ORDERS.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-2xl p-5 hover:border-[#1a5c2a] transition-all bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-gray-500">{order.id}</span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${order.statusColor}`}>
                            {order.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mt-1">{order.crop}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#1a5c2a]">₹{order.totalPrice.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{order.quantity}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <span>👨‍🌾 Farmer:</span>
                        <strong className="text-gray-900">{order.farmer}</strong>
                        <span>({order.location})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#1a5c2a] font-semibold">
                        <Shield size={14} /> {order.escrowStatus}
                      </div>
                    </div>

                    {/* Stepper for In Transit */}
                    <div className="py-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span className={order.trackingStep >= 1 ? 'font-bold text-[#1a5c2a]' : ''}>1. Order Confirmed</span>
                        <span className={order.trackingStep >= 2 ? 'font-bold text-[#1a5c2a]' : ''}>2. Dispatched from Farm</span>
                        <span className={order.trackingStep >= 3 ? 'font-bold text-[#1a5c2a]' : ''}>3. Received & Verified</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#1a5c2a] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(order.trackingStep / 3) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Ordered on {order.date} · Est. Arrival: {order.estimatedDelivery}
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                          <MessageCircle size={14} /> Chat Farmer
                        </button>
                        {order.status === 'In Transit' && (
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1a5c2a] text-white text-xs font-bold hover:bg-[#15803d]">
                            <CheckCircle2 size={14} /> Confirm Delivery & Release Funds
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Recommended direct crops + Farmer connections */}
          <div className="space-y-6">
            {/* Quick Sourcing Suggestions */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                🌾 Recommended Direct Listings
              </h3>
              <div className="space-y-3">
                {CROPS.slice(0, 3).map((crop) => (
                  <Link href={`/marketplace/${crop.id}`} key={crop.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-green-50 transition-colors group">
                    <img src={crop.images[0]} alt={crop.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-[#1a5c2a]">{crop.name}</h4>
                      <p className="text-xs text-gray-500">{crop.location}</p>
                      <div className="text-xs font-bold text-[#1a5c2a] mt-0.5">
                        ₹{crop.price}/{crop.unit} · {crop.quantity} {crop.unit}s left
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/marketplace" className="btn-secondary w-full text-center text-xs py-2.5 mt-4 block">
                View All Market Produce →
              </Link>
            </div>

            {/* Escrow Guarantee Banner */}
            <div className="card p-6 bg-gradient-to-br from-emerald-50 to-green-100 border border-green-200">
              <div className="flex items-start gap-3">
                <Shield size={24} className="text-[#1a5c2a] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-[#1a5c2a] text-sm">Agronomy 360 Escrow Protection</h4>
                  <p className="text-xs text-green-800 mt-1 leading-relaxed">
                    Your advance payment stays safe in an RBI-compliant escrow account. The farmer receives funds only once you inspect and accept the delivered crop quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
