'use client';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GOVT_SCHEMES } from '@/lib/data';
import { Bell, ExternalLink, AlertCircle } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  Finance: '💰', Insurance: '🛡️', Services: '🏛️', Technology: '🚁', Organic: '🌿', Training: '📚',
};

export default function SchemesPage() {
  const { lang } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="text-3xl font-black mb-2">{t(lang, 'govtSchemes')}</h1>
          <p className="text-orange-100">Latest government schemes, subsidies, and notifications for farmers</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {GOVT_SCHEMES.map((scheme, i) => (
          <div key={i} className={`card p-5 flex items-start gap-4 ${scheme.urgent ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-200'}`}>
            <div className="text-3xl flex-shrink-0">{CATEGORY_ICONS[scheme.category] || '📋'}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900">{scheme.title}</h3>
                {scheme.urgent && (
                  <span className="flex-shrink-0 flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    <AlertCircle size={12} /> Urgent
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>{scheme.date}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{scheme.category}</span>
              </div>
            </div>
            <button className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 flex-shrink-0">
              Details <ExternalLink size={12} />
            </button>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
