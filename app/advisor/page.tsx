'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CROP_CALENDAR } from '@/lib/data';
import { Calendar, Leaf, Droplets, TrendingUp, MapPin, Sun, AlertCircle } from 'lucide-react';

const SEASONS = ['Kharif (Jun-Oct)', 'Rabi (Oct-Mar)', 'Zaid (Mar-Jun)'];
const SOIL_TYPES = ['Black Cotton Soil', 'Red Loamy Soil', 'Sandy Loam', 'Clay Loam', 'Alluvial Soil', 'Laterite Soil'];
const STATES = ['Telangana', 'Andhra Pradesh', 'Maharashtra', 'Punjab', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat'];
const WATER = ['High (Canal/Borewell)', 'Medium (Seasonal)', 'Low (Rainfed)'];

export default function AdvisorPage() {
  const { lang } = useApp();
  const [form, setForm] = useState({ season: '', soil: '', state: '', water: '' });
  const [results, setResults] = useState<typeof CROP_CALENDAR>([]);
  const [analyzed, setAnalyzed] = useState(false);

  const analyze = () => {
    const filtered = CROP_CALENDAR.filter(c => {
      if (form.season && !c.season.toLowerCase().includes(form.season.split(' ')[0].toLowerCase())) return false;
      if (form.soil && !c.soilType.toLowerCase().includes(form.soil.split(' ')[0].toLowerCase())) return false;
      if (form.state && !c.regions.includes(form.state)) return false;
      return true;
    });
    setResults(filtered.length > 0 ? filtered : CROP_CALENDAR.slice(0, 3));
    setAnalyzed(true);
  };

  const getMonth = (name: string) => {
    const months: Record<string, number> = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
    return months[name] || 1;
  };

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a5c2a] to-[#2d8a4e] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-3xl font-black mb-2">{t(lang, 'advisor')}</h1>
          <p className="text-green-200 text-lg">AI-powered crop recommendations based on your land, season, and region</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Input Form */}
        <div className="card p-6 mb-8">
          <h2 className="font-bold text-gray-900 text-xl mb-5 flex items-center gap-2">
            <MapPin size={20} className="text-[#1a5c2a]" /> Tell us about your farm
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'currentSeason')}</label>
              <select value={form.season} onChange={e => setForm({...form, season: e.target.value})} className="input-field">
                <option value="">Select Season</option>
                {SEASONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'state')}</label>
              <select value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="input-field">
                <option value="">Select State</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'soilType')}</label>
              <select value={form.soil} onChange={e => setForm({...form, soil: e.target.value})} className="input-field">
                <option value="">Select Soil Type</option>
                {SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'waterAvail')}</label>
              <select value={form.water} onChange={e => setForm({...form, water: e.target.value})} className="input-field">
                <option value="">Select Water Source</option>
                {WATER.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <button onClick={analyze} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
            <Leaf size={20} /> {t(lang, 'recommendedCrops')} — Analyze Now
          </button>
        </div>

        {/* Results */}
        {analyzed && (
          <div>
            <h2 className="section-title">{t(lang, 'recommendedCrops')}</h2>
            <p className="text-gray-500 mb-6">Based on your inputs, here are the best crops to grow:</p>

            <div className="space-y-6">
              {results.map((crop, idx) => {
                const inSowingWindow = currentMonth >= getMonth(crop.sowingStart) && currentMonth <= getMonth(crop.sowingEnd);
                const inHarvestWindow = currentMonth >= getMonth(crop.harvestStart) && currentMonth <= getMonth(crop.harvestEnd);

                return (
                  <div key={crop.crop} className="card overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1a5c2a] to-[#2d8a4e] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{crop.icon}</span>
                        <div>
                          <div className="text-white font-bold text-xl">#{idx + 1} {crop.crop}</div>
                          <div className="text-green-200 text-sm">{crop.season} Season</div>
                        </div>
                      </div>
                      {inSowingWindow && (
                        <div className="bg-[#f5a623] text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                          🌱 SOW NOW!
                        </div>
                      )}
                    </div>

                    <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Sowing Window */}
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-green-700 font-semibold text-sm mb-1">
                          <Calendar size={14} /> {t(lang, 'sowingWindow')}
                        </div>
                        <div className="text-lg font-black text-[#1a5c2a]">{crop.sowingStart}</div>
                        <div className="text-xs text-green-600">to {crop.sowingEnd}</div>
                      </div>

                      {/* Harvest Window */}
                      <div className="bg-amber-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-sm mb-1">
                          <Sun size={14} /> {t(lang, 'harvestWindow')}
                        </div>
                        <div className="text-lg font-black text-amber-700">{crop.harvestStart}</div>
                        <div className="text-xs text-amber-600">to {crop.harvestEnd}</div>
                      </div>

                      {/* Water */}
                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-sm mb-1">
                          <Droplets size={14} /> Water Needed
                        </div>
                        <div className="text-lg font-black text-blue-700">{crop.water}</div>
                        <div className="text-xs text-blue-600">{crop.soilType}</div>
                      </div>

                      {/* Profitability */}
                      <div className="bg-purple-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-sm mb-1">
                          <TrendingUp size={14} /> Profitability
                        </div>
                        <div className="text-lg font-black text-purple-700">{crop.profitability}</div>
                        <div className="text-xs text-purple-600">Demand: {crop.demand}</div>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <div className="text-xs text-gray-500 mb-2 font-semibold">BEST SUITED FOR STATES:</div>
                      <div className="flex flex-wrap gap-2">
                        {crop.regions.map(r => (
                          <span key={r} className={`text-xs px-2.5 py-1 rounded-full font-medium ${form.state === r ? 'bg-[#1a5c2a] text-white' : 'bg-gray-100 text-gray-600'}`}>{r}</span>
                        ))}
                      </div>

                      {inSowingWindow && (
                        <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
                          <AlertCircle size={16} className="text-green-600" />
                          <strong>Alert:</strong> This is the perfect time to sow {crop.crop.split(' ')[0]} in your region!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Crop Calendar Table */}
        {!analyzed && (
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-xl mb-4">Full Crop Calendar 2026-27</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1a5c2a] text-white">
                    <th className="px-4 py-3 text-left rounded-tl-xl">Crop</th>
                    <th className="px-4 py-3 text-left">Season</th>
                    <th className="px-4 py-3 text-left">Sow</th>
                    <th className="px-4 py-3 text-left">Harvest</th>
                    <th className="px-4 py-3 text-left">Profitability</th>
                    <th className="px-4 py-3 text-left rounded-tr-xl">Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {CROP_CALENDAR.map((row, i) => (
                    <tr key={row.crop} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-semibold text-gray-900">{row.icon} {row.crop}</td>
                      <td className="px-4 py-3 text-gray-600">{row.season}</td>
                      <td className="px-4 py-3 text-green-700 font-medium">{row.sowingStart}–{row.sowingEnd}</td>
                      <td className="px-4 py-3 text-amber-700 font-medium">{row.harvestStart}–{row.harvestEnd}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          row.profitability === 'Very High' ? 'bg-green-100 text-green-700' :
                          row.profitability === 'High' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{row.profitability}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          row.demand === 'Very High' ? 'bg-red-100 text-red-700' :
                          row.demand === 'High' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{row.demand}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
