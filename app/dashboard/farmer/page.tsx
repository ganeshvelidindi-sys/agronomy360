'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CROPS, MANDI_PRICES } from '@/lib/data';
import { TrendingUp, Package, Star, Plus, BarChart3, Bell, MapPin } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const MOCK_EARNINGS = [12000, 18000, 15000, 22000, 28000, 24000, 35000, 42000];

export default function FarmerDashboard() {
  const { lang } = useApp();
  const myListings = CROPS.slice(0, 3);
  const maxEarning = Math.max(...MOCK_EARNINGS);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Good morning, Rajesh! 👋</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-1"><MapPin size={14} /> Karimnagar, Telangana · <span className="text-green-600 font-semibold">✓ Verified Farmer</span></p>
          </div>
          <Link href="/list-crop" className="btn-gold flex items-center gap-2">
            <Plus size={18} /> {t(lang, 'addNewCrop')}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: '₹1,96,000', icon: '💰', trend: '+18%', color: 'bg-green-50 text-green-700' },
            { label: 'Active Listings', value: '3', icon: '🌾', trend: 'crops listed', color: 'bg-blue-50 text-blue-700' },
            { label: 'Orders Received', value: '12', icon: '📦', trend: '+4 this month', color: 'bg-amber-50 text-amber-700' },
            { label: 'Avg. Rating', value: '4.8 ⭐', icon: '🏆', trend: '23 reviews', color: 'bg-purple-50 text-purple-700' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
              <div className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block ${s.color}`}>{s.trend}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Earnings chart */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 text-xl flex items-center gap-2"><BarChart3 size={20} className="text-[#1a5c2a]" /> Monthly Earnings (2026)</h2>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">₹1.96L total</span>
            </div>
            <div className="flex items-end gap-3 h-40">
              {MOCK_EARNINGS.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{(val/1000).toFixed(0)}k</span>
                  <div className="w-full rounded-t-lg transition-all hover:opacity-80 relative group"
                    style={{ height: `${(val / maxEarning) * 100}%`, background: i === 7 ? '#f5a623' : '#1a5c2a' }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap">
                      ₹{val.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Bell size={16} className="text-amber-500" /> Notifications</h3>
              <div className="space-y-3">
                {[
                  { msg: 'New buyer inquiry for Basmati Rice', time: '2 hrs ago', type: 'message' },
                  { msg: 'Payment received: ₹42,000 for Turmeric', time: '1 day ago', type: 'payment' },
                  { msg: 'Disease outbreak alert: Rice blast in your region', time: '2 days ago', type: 'alert' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'payment' ? 'bg-green-500' : n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-gray-700">{n.msg}</p>
                      <p className="text-gray-400 text-xs">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Today's Prices</h3>
              <div className="space-y-2">
                {MANDI_PRICES.slice(0, 4).map(p => (
                  <div key={p.crop} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{p.crop}</span>
                    <div className="text-right">
                      <span className="font-bold text-[#1a5c2a]">₹{p.price.toLocaleString()}</span>
                      <span className={`ml-2 text-xs ${p.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {p.trend === 'up' ? '↑' : '↓'}{Math.abs(p.change)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-xl flex items-center gap-2"><Package size={20} className="text-[#1a5c2a]" /> {t(lang, 'myListings')}</h2>
            <Link href="/list-crop" className="text-[#1a5c2a] text-sm font-semibold hover:underline">+ Add new</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myListings.map(crop => (
              <div key={crop.id} className="card overflow-hidden">
                <div className="h-36 overflow-hidden">
                  <img src={crop.images[0]} alt={crop.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{crop.name}</h3>
                    <span className="text-[#1a5c2a] font-black">₹{crop.price}/{crop.unit}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{crop.quantity.toLocaleString()} {crop.unit}s available</div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Star size={12} className="text-amber-400 fill-amber-400" /> {crop.rating} ({crop.reviews})
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-blue-100">Edit</button>
                      <Link href={`/marketplace/${crop.id}`} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg font-semibold hover:bg-green-100">View</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
