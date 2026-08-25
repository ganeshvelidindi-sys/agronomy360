'use client';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MANDI_PRICES } from '@/lib/data';
import { TrendingUp, TrendingDown, RefreshCw, MapPin } from 'lucide-react';

export default function MarketPricesPage() {
  const { lang } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-br from-[#1a5c2a] to-[#2d8a4e] text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-1">{t(lang, 'mandiPrice')}</h1>
              <p className="text-green-200">Live wholesale prices from major mandis across India</p>
              <p className="text-green-300 text-xs mt-1">Last updated: {new Date().toLocaleString('en-IN')}</p>
            </div>
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors text-sm font-semibold">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Highlight cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MANDI_PRICES.slice(0, 4).map(p => (
            <div key={p.crop} className="card p-5">
              <div className="font-bold text-gray-900 text-lg">{p.crop}</div>
              <div className="text-3xl font-black text-[#1a5c2a] mt-1">₹{p.price.toLocaleString()}</div>
              <div className="text-xs text-gray-400">{p.unit} · {p.market}</div>
              <div className={`flex items-center gap-1 text-sm font-semibold mt-2 ${p.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {p.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {p.trend === 'up' ? '+' : '-'}₹{Math.abs(p.change)} today
              </div>
            </div>
          ))}
        </div>

        {/* Full table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg">All Crops — Today's Prices</h2>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">🔴 LIVE</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Crop</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Change</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Market</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MANDI_PRICES.map((item, i) => (
                  <tr key={item.crop} className={`hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900 text-lg">{item.crop}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-xl font-black text-[#1a5c2a]">₹{item.price.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm">{item.unit}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-bold text-base ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend === 'up' ? '+' : '-'}₹{Math.abs(item.change)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin size={12} /> {item.market}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`flex items-center gap-1.5 text-sm font-semibold ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        {item.trend === 'up' ? 'Rising' : 'Falling'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price transparency note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
          <strong>💡 Price Transparency:</strong> AGRONOMY 360 shows you the actual wholesale (mandi) prices. When you buy directly from farmers on our platform, you save the middleman markup (typically 20-35%) while farmers earn 20-40% more!
        </div>
      </div>

      <Footer />
    </div>
  );
}
