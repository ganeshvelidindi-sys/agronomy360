'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CROPS } from '@/lib/data';
import { Search, Filter, MapPin, Star, CheckCircle2, Leaf, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Fruits', 'Spices', 'Fibre'];
const STATES = ['All States', 'Telangana', 'Andhra Pradesh', 'Maharashtra', 'Punjab', 'Karnataka'];
const QUALITY = ['All Grades', 'A+', 'A', 'B+', 'B'];

export default function MarketplacePage() {
  const { lang } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [state, setState] = useState('All States');
  const [quality, setQuality] = useState('All Grades');
  const [sort, setSort] = useState('newest');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = CROPS.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'All' && c.category !== category) return false;
    if (state !== 'All States' && c.state !== state) return false;
    if (quality !== 'All Grades' && c.qualityGrade !== quality) return false;
    if (organicOnly && !c.organic) return false;
    if (verifiedOnly && !c.verified) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1a5c2a] text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black mb-2">{t(lang, 'marketplace')}</h1>
          <p className="text-green-200">{t(lang, 'noMiddleman')} — Browse directly from verified farmers</p>
          {/* Search bar */}
          <div className="relative mt-6 max-w-2xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t(lang, 'search')}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
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
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${category === cat ? 'bg-[#1a5c2a] text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1a5c2a]'}`}
            >
              {cat}
            </button>
          ))}
          <button onClick={() => setShowFilters(!showFilters)} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:border-[#1a5c2a] transition-all">
            <SlidersHorizontal size={15} /> {t(lang, 'filter')}
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="card p-5 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t(lang, 'state')}</label>
                <select value={state} onChange={e => setState(e.target.value)} className="input-field text-sm py-2">
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t(lang, 'quality')}</label>
                <select value={quality} onChange={e => setQuality(e.target.value)} className="input-field text-sm py-2">
                  {QUALITY.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sort By</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="input-field text-sm py-2">
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
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

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-sm font-medium">{sorted.length} crops found</p>
          <Link href="/list-crop" className="btn-gold text-sm py-2 px-4">+ {t(lang, 'listCrop')}</Link>
        </div>

        {/* Crop Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold">No crops found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sorted.map((crop) => (
              <Link href={`/marketplace/${crop.id}`} key={crop.id} className="card group overflow-hidden hover:-translate-y-1 transition-all duration-200">
                <div className="relative h-48 overflow-hidden">
                  <img src={crop.images[0]} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {crop.organic && <span className="absolute top-3 left-3 badge-organic text-xs">🌿 Organic</span>}
                  {crop.verified && <span className="absolute top-3 right-3 badge-verified text-xs">✓ Verified</span>}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <span className="bg-white/90 text-[#1a5c2a] text-xs font-bold px-2 py-1 rounded-lg">{crop.qualityGrade} Grade</span>
                    <span className="bg-[#f5a623] text-white text-xs font-bold px-2 py-1 rounded-lg">{crop.category}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{crop.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <MapPin size={11} /> {crop.location}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-gray-700">{crop.rating}</span>
                    <span className="text-xs text-gray-400">({crop.reviews})</span>
                    <span className="ml-auto text-xs text-gray-400">{crop.quantity.toLocaleString()} {crop.unit}s</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-black text-[#1a5c2a]">₹{crop.price.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm">/{crop.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#1a5c2a] text-xs font-bold">Farmer: {crop.farmer.split(' ')[0]}</span>
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
