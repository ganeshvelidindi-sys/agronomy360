'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CROPS, MANDI_PRICES, GOVT_SCHEMES } from '@/lib/data';
import {
  ArrowRight, Shield, Zap, TrendingUp, Leaf, Bot,
  Camera, CreditCard, Star, MapPin, CheckCircle2,
  Wheat, Users, BarChart3, Globe2, ChevronRight,
  Phone, BadgeCheck, ArrowUpRight, ArrowDownRight, Bell
} from 'lucide-react';

const STATS = [
  { label: 'farmersJoined', value: '2.4L+', icon: '👨‍🌾', color: 'text-green-700', bg: 'bg-green-50' },
  { label: 'buyersConnected', value: '85K+', icon: '🏪', color: 'text-blue-700', bg: 'bg-blue-50' },
  { label: 'cropsTraded', value: '18L+', icon: '🌾', color: 'text-amber-700', bg: 'bg-amber-50' },
  { label: 'statesCovered', value: '28', icon: '🗺️', color: 'text-purple-700', bg: 'bg-purple-50' },
];

const FEATURES = [
  {
    icon: Shield,
    titleKey: 'noMiddleman',
    desc: 'No commission. No middlemen. Every rupee goes directly to the farmer.',
    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
  },
  {
    icon: Zap,
    titleKey: 'directPayment',
    desc: 'UPI, cards, net banking — funds settle directly to farmer\'s bank account.',
    color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
  },
  {
    icon: Bot,
    titleKey: 'chatbot',
    desc: 'Multilingual AI assistant for crop advice, disease Q&A, and scheme info.',
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
  },
  {
    icon: Camera,
    titleKey: 'disease',
    desc: 'Upload a photo. Detect crop disease instantly with AI confidence score.',
    color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100',
  },
  {
    icon: Leaf,
    titleKey: 'advisor',
    desc: 'Season + soil + region-based crop planting recommendations.',
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
  },
  {
    icon: CreditCard,
    titleKey: 'loans',
    desc: 'Kisan Credit Card, crop loans, PMFBY insurance — eligibility & apply.',
    color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register', desc: 'Sign up as a Farmer or Buyer in your preferred language. Verify with Aadhaar.', icon: '📝' },
  { step: '02', title: 'List or Browse', desc: 'Farmers list crops with photos & price. Buyers search by crop, region, quality.', icon: '🔍' },
  { step: '03', title: 'Connect Directly', desc: 'Chat or video call directly between farmer and buyer. No broker involved.', icon: '💬' },
  { step: '04', title: 'Pay & Receive', desc: 'Secure payment via UPI/cards. Money lands directly in farmer\'s account.', icon: '💰' },
];

export default function HomePage() {
  const { lang } = useApp();
  const featuredCrops = CROPS.slice(0, 4);
  const topPrices = MANDI_PRICES.slice(0, 5);
  const urgentSchemes = GOVT_SCHEMES.filter(s => s.urgent);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a5c2a] via-[#2d8a4e] to-[#1a5c2a] text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <BadgeCheck size={16} className="text-[#f5a623]" />
                Trusted by 2.4 Lakh+ Indian Farmers
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                {t(lang, 'tagline')}
              </h1>
              <p className="text-lg sm:text-xl text-green-100 leading-relaxed mb-8 max-w-xl">
                {t(lang, 'heroDesc')}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#e09b1f] text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-lg hover:shadow-xl active:scale-95">
                  {t(lang, 'getStarted')}
                  <ArrowRight size={20} />
                </Link>
                <Link href="/marketplace" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all">
                  {t(lang, 'browseMarket')}
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-green-200">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#f5a623]" /> Zero Commission</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#f5a623]" /> Instant UPI Payment</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#f5a623]" /> Verified Farmers</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#f5a623]" /> AI-Powered Insights</div>
              </div>
            </div>

            {/* Hero image / stats card */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Big logo/illustration card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center">
                <Image src="/logo.jpg" alt="AGRONOMY 360" width={200} height={200} className="mx-auto rounded-2xl shadow-2xl mb-4" />
                <div className="text-3xl font-black">AGRONOMY 360</div>
                <div className="text-[#f5a623] text-lg font-semibold mt-1">India's Direct Farm Marketplace</div>
              </div>

              {/* Live price ticker */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-green-200">
                  <TrendingUp size={16} className="text-[#f5a623]" />
                  Live Mandi Prices Today
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {topPrices.map((p) => (
                    <div key={p.crop} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium">{p.crop}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">₹{p.price}</div>
                        <div className={`text-xs flex items-center gap-0.5 ${p.trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
                          {p.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {Math.abs(p.change)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1200 40 900 60 720 60C540 60 240 40 0 0L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon, color, bg }) => (
            <div key={label} className={`card p-5 flex items-center gap-4`}>
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                {icon}
              </div>
              <div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-sm text-gray-500 font-medium">{t(lang, label)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Govt Scheme Alert Banner */}
      {urgentSchemes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Bell size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 text-sm">🔔 Urgent: {urgentSchemes[0].title}</p>
              {urgentSchemes.length > 1 && (
                <p className="text-amber-700 text-xs mt-0.5">+ {urgentSchemes.length - 1} more urgent notifications</p>
              )}
            </div>
            <Link href="/schemes" className="text-amber-700 text-sm font-semibold hover:text-amber-900 flex items-center gap-1 flex-shrink-0">
              View all <ChevronRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* Featured Crops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">{t(lang, 'featuredCrops')}</h2>
            <p className="section-subtitle">Fresh produce directly from verified farmers</p>
          </div>
          <Link href="/marketplace" className="btn-secondary text-sm flex items-center gap-2">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCrops.map((crop) => (
            <Link href={`/marketplace/${crop.id}`} key={crop.id} className="card group overflow-hidden hover:-translate-y-1 transition-all duration-200">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={crop.images[0]}
                  alt={crop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {crop.organic && (
                  <span className="absolute top-3 left-3 badge-organic">🌿 Organic</span>
                )}
                {crop.verified && (
                  <span className="absolute top-3 right-3 badge-verified">✓ Verified</span>
                )}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-bold text-[#1a5c2a]">
                  {crop.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg">{crop.name}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin size={12} className="text-[#1a5c2a]" />
                  {crop.location}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-gray-700">{crop.rating}</span>
                  <span className="text-xs text-gray-400">({crop.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-black text-[#1a5c2a]">₹{crop.price}</span>
                    <span className="text-gray-400 text-sm">/{crop.unit}</span>
                  </div>
                  <span className="bg-[#1a5c2a] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    {t(lang, 'buyNow')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why AGRONOMY 360 — Features Grid */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">{t(lang, 'whyUs')}</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Every feature is built to empower farmers and give buyers transparency — with zero middlemen.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, titleKey, desc, color, bg, border }) => (
              <div key={titleKey} className={`card p-6 border ${border} hover:-translate-y-1 transition-all duration-200`}>
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={24} className={color} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{t(lang, titleKey)}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="section-title">{t(lang, 'howItWorks')}</h2>
          <p className="section-subtitle">Four simple steps from farm to payment</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc, icon }, i) => (
            <div key={step} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-dashed border-t-2 border-dashed border-gray-200 z-0 -translate-x-1/2" />
              )}
              <div className="card p-6 text-center relative z-10">
                <div className="w-16 h-16 bg-[#f5a623] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                  {icon}
                </div>
                <div className="text-xs font-black text-gray-300 mb-1">STEP {step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Mandi Prices Strip */}
      <section className="bg-[#1a5c2a] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp size={20} className="text-[#f5a623]" />
            <h2 className="text-white font-bold text-lg">{t(lang, 'mandiPrice')} — Live Today</h2>
            <Link href="/market-prices" className="text-green-300 text-sm hover:text-white ml-auto flex items-center gap-1">
              Full report <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {MANDI_PRICES.slice(0, 5).map((item) => (
              <div key={item.crop} className="bg-white/10 rounded-xl p-3 text-white">
                <div className="font-bold text-lg">{item.crop}</div>
                <div className="text-2xl font-black text-[#f5a623]">₹{item.price.toLocaleString()}</div>
                <div className="text-xs text-green-300">{item.unit} · {item.market}</div>
                <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${item.trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
                  {item.trend === 'up' ? '↑' : '↓'} ₹{Math.abs(item.change)} today
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farmer / Buyer CTA Split */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#1a5c2a] to-[#2d8a4e] rounded-3xl p-8 text-white">
            <div className="text-5xl mb-4">👨‍🌾</div>
            <h3 className="text-2xl font-black mb-2">{t(lang, 'forFarmers')}</h3>
            <p className="text-green-100 mb-6 leading-relaxed">
              List your produce. Connect directly with bulk buyers. Get paid instantly. No middleman takes your profit.
            </p>
            <ul className="space-y-2 text-green-100 text-sm mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f5a623]" /> Free crop listing</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f5a623]" /> Direct UPI payment to your account</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f5a623]" /> AI crop & disease assistance</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f5a623]" /> Government scheme guidance</li>
            </ul>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-[#f5a623] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#e09b1f] transition-colors">
              Register as Farmer <ArrowRight size={18} />
            </Link>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-2xl font-black mb-2">{t(lang, 'forBuyers')}</h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Source fresh produce directly from verified farmers. Guaranteed quality. Competitive pricing. Secure escrow payments.
            </p>
            <ul className="space-y-2 text-blue-100 text-sm mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f5a623]" /> Filter by crop, region, quality</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f5a623]" /> Video call with farmers before buying</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f5a623]" /> Escrow payment protection</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f5a623]" /> Bid/auction on premium lots</li>
            </ul>
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-[#f5a623] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#e09b1f] transition-colors">
              Browse Marketplace <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">Farmer Success Stories</h2>
            <p className="section-subtitle">Real farmers, real results</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rajesh Kumar', loc: 'Karimnagar, Telangana', crop: 'Basmati Rice',
                text: '"Earlier I would sell to local traders at ₹30/kg. Now I get ₹42/kg directly from buyers in Mumbai. That\'s ₹60,000 extra per season!"',
                rating: 5, avatar: '👨‍🌾', earnings: '+40% Income',
              },
              {
                name: 'Lakshmi Devi', loc: 'Nizamabad, Telangana', crop: 'Turmeric',
                text: '"The AI chatbot told me to switch to organic farming. Now I sell certified turmeric at premium prices to export buyers. Life changed!"',
                rating: 5, avatar: '👩‍🌾', earnings: '+80% Income',
              },
              {
                name: 'Dinesh Sharma', loc: 'Nashik, Maharashtra', crop: 'Onions',
                text: '"Disease detection caught early blight in my onion field. Treated it in time. Saved my entire crop worth ₹2.5 lakhs!"',
                rating: 5, avatar: '🧑‍🌾', earnings: 'Crop Saved',
              },
            ].map(({ name, loc, crop, text, rating, avatar, earnings }) => (
              <div key={name} className="card p-6 hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-3xl">{avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-500">{loc}</div>
                    <div className="text-xs text-[#1a5c2a] font-semibold">{crop}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-[#f5a623] font-black text-sm">{earnings}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1a5c2a] to-[#2d8a4e] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-5xl mb-4">🌾</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Join 2.4 Lakh Farmers Today</h2>
          <p className="text-green-100 text-lg mb-8">
            No commission. No middlemen. Fair prices guaranteed. Start listing your crops in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 bg-[#f5a623] text-white font-bold py-4 px-10 rounded-2xl text-lg hover:bg-[#e09b1f] transition-all shadow-lg">
              {t(lang, 'getStarted')} — It's Free <ArrowRight size={20} />
            </Link>
            <Link href="/chatbot" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold py-4 px-8 rounded-2xl text-lg hover:bg-white/20 transition-all">
              <Bot size={20} /> Ask AI Assistant
            </Link>
          </div>
          <p className="text-green-300 text-sm mt-6">
            Available in: English · తెలుగు · हिंदी · தமிழ் · ಕನ್ನಡ · मराठी
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
