'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CropDB, DBCrop } from '@/lib/db';
import { Search, MapPin, Star, SlidersHorizontal, X, Plus, Leaf, CheckCircle2, RefreshCw } from 'lucide-react';

const CATEGORIES = ['All', 'Rice', 'Wheat', 'Cotton', 'Tomato', 'Onion', 'Turmeric', 'Chillies', 'Mango', 'Soybean', 'Groundnut', 'Maize', 'Other'];
const ALL_STATES = ['All States', 'Andhra Pradesh', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'];
const QUALITY_GRADES = ['All Grades', 'A+', 'A', 'B+', 'B', 'C'];

const CROP_EMOJIS: Record<string, string> = {
  Rice: '🌾', Wheat: '🌿', Cotton: '🌱', Tomato: '🍅', Onion: '🧅',
  Turmeric: '🟡', Chillies: '🌶️', Mango: '🥭', Soybean: '🫘',
  Groundnut: '🥜', Maize: '🌽', Jowar: '🌾', Bajra: '🌾', Sugarcane: '🎋', Other: '🌾',
};

export default function MarketplacePage() {
  const { lang, user } = useApp();
  const [crops, setCrops] = useState<DBCrop[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [state, setState] = useState('All States');
  const [quality, setQuality] = useState('All Grades');
  const [sort, setSort] = useState('newest');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const all = CropDB.getAll();
    setCrops(all);
    setLoading(false);
  }, []);

  // Filter + sort
  const filtered = crops.filter(c => {
    const q = search.toLowerCase();
    if (search && !c.name.toLowerCase().includes(q) && !c.location.toLowerCase().includes(q) && !c.farmerName.toLowerCase().includes(q)) return false;
    if (category !== 'All' && c.category !== category) return false;
    if (state !== 'All States' && c.state !== state) return false;
    if (quality !== 'All Grades' && c.qualityGrade !== quality) return false;
    if (organicOnly && !c.organic) return false;
    if (verifiedOnly && !c.farmerVerified) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  const refresh = () => {
    setLoading(true);
    setTimeout(() => { setCrops(CropDB.getAll()); setLoading(false); }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1a5c2a] text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black mb-1">{t(lang, 'marketplace')} 🌾</h1>
          <p className="text-green-200 text-sm">{t(lang, 'noMiddleman')} — నేరుగా రైతుల నుండి కొనండి</p>
          <div className="relative mt-5 max-w-2xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="పంట పేరు, location వెతకండి..."
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white text-gray-900 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${category === cat ? 'bg-[#1a5c2a] text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1a5c2a]'}`}
            >
              {cat !== 'All' ? CROP_EMOJIS[cat] + ' ' : ''}{cat}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${showFilters ? 'bg-[#1a5c2a] text-white border-[#1a5c2a]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a5c2a]'}`}
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="card p-5 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">State</label>
                <select value={state} onChange={e => setState(e.target.value)} className="input-field text-sm py-2">
                  {ALL_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Quality Grade</label>
                <select value={quality} onChange={e => setQuality(e.target.value)} className="input-field text-sm py-2">
                  {QUALITY_GRADES.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Sort By</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="input-field text-sm py-2">
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                </select>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={organicOnly} onChange={e => setOrganicOnly(e.target.checked)} className="w-4 h-4 accent-[#1a5c2a]" />
                  <span className="text-sm font-medium text-gray-700">🌿 Organic Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="w-4 h-4 accent-[#1a5c2a]" />
                  <span className="text-sm font-medium text-gray-700">✓ Verified Only</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Results bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <p className="text-gray-600 text-sm font-medium">
              {loading ? 'Loading...' : `${sorted.length} crop${sorted.length !== 1 ? 's' : ''} found`}
            </p>
            <button onClick={refresh} className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-[#1a5c2a] hover:border-[#1a5c2a] transition-all" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
          {user?.role === 'farmer' && (
            <Link href="/list-crop" className="btn-gold text-sm py-2 px-4 flex items-center gap-1.5">
              <Plus size={15} /> {t(lang, 'listCrop')}
            </Link>
          )}
        </div>

        {/* Crop Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={32} className="animate-spin mr-3" />
            <span className="text-lg">Loading marketplace...</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌾</div>
            <p className="text-xl font-black text-gray-700 mb-2">
              {crops.length === 0 ? 'Marketplace ఖాళీగా ఉంది' : 'మీ search కు crops దొరకలేదు'}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {crops.length === 0
                ? 'ఇంకా ఏ farmer crop list చేయలేదు. మీరు మొదటి farmer అవ్వండి!'
                : 'Different filters try చేయండి'
              }
            </p>
            {user?.role === 'farmer' && (
              <Link href="/list-crop" className="btn-primary inline-flex items-center gap-2">
                <Plus size={18} /> మీ పంట List చేయండి
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sorted.map(crop => (
              <Link
                href={`/marketplace/${crop.id}`}
                key={crop.id}
                className="card group overflow-hidden hover:-translate-y-1 transition-all duration-200 hover:shadow-lg"
              >
                {/* Crop Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-100 to-green-50">
                  {crop.imageUrl ? (
                    <img src={crop.imageUrl} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">
                      {CROP_EMOJIS[crop.category] || '🌾'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {crop.organic && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Leaf size={10} /> Organic
                    </span>
                  )}
                  {crop.farmerVerified && (
                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verified
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-white/90 text-[#1a5c2a] text-xs font-bold px-2 py-1 rounded-lg">Grade {crop.qualityGrade}</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <h3 className="font-black text-gray-900 text-lg leading-tight">{crop.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <MapPin size={11} /> {crop.location}, {crop.state}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    by <span className="font-semibold text-gray-600">{crop.farmerName}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-black text-[#1a5c2a]">₹{crop.price.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs">/{crop.unit}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{crop.quantity.toLocaleString()} {crop.unit}</div>
                      <div className="text-xs text-gray-400">{new Date(crop.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
