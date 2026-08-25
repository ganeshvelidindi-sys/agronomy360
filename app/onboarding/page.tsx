'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t, LANGUAGES } from '@/lib/translations';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Volume2 } from 'lucide-react';

export default function OnboardingPage() {
  const { lang, setLang } = useApp();
  const [selected, setSelected] = useState(lang);
  const [role, setRole] = useState<'farmer' | 'buyer' | null>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5c2a] via-[#2d8a4e] to-[#1a5c2a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl mb-4">
            <Image src="/logo.jpg" alt="AGRONOMY 360" width={96} height={96} className="object-cover" />
          </div>
          <h1 className="text-3xl font-black text-white">AGRONOMY 360</h1>
          <p className="text-green-200 text-sm mt-1">India's Direct Farm Marketplace</p>
        </div>

        {/* Language Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t(selected, 'selectLanguage')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t(selected, 'chooseLang')}</p>
            <button
              onClick={() => speak(t(selected, 'chooseLang'))}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#1a5c2a] hover:underline"
            >
              <Volume2 size={14} /> Listen
            </button>
          </div>

          {/* Language Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {LANGUAGES.map(({ code, nativeName, name, flag }) => (
              <button
                key={code}
                onClick={() => { setSelected(code); setLang(code); }}
                className={`p-4 rounded-2xl border-2 transition-all text-center font-semibold ${
                  selected === code
                    ? 'border-[#1a5c2a] bg-green-50 text-[#1a5c2a] shadow-md scale-105'
                    : 'border-gray-200 text-gray-700 hover:border-[#1a5c2a] hover:bg-green-50'
                }`}
              >
                <div className="text-3xl mb-1">{flag}</div>
                <div className="text-base">{nativeName}</div>
                <div className="text-xs text-gray-400">{name}</div>
              </button>
            ))}
          </div>

          {/* Role Selection */}
          {!role ? (
            <>
              <p className="text-center text-sm text-gray-600 mb-3 font-medium">Who are you?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole('farmer')}
                  className="p-4 rounded-2xl border-2 border-[#1a5c2a] hover:bg-green-50 transition-all text-center"
                >
                  <div className="text-4xl mb-2">👨‍🌾</div>
                  <div className="font-bold text-[#1a5c2a]">{t(selected, 'iamFarmer')}</div>
                </button>
                <button
                  onClick={() => setRole('buyer')}
                  className="p-4 rounded-2xl border-2 border-blue-600 hover:bg-blue-50 transition-all text-center"
                >
                  <div className="text-4xl mb-2">🏪</div>
                  <div className="font-bold text-blue-700">{t(selected, 'iamBuyer')}</div>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You selected: <strong>{role === 'farmer' ? '👨‍🌾 Farmer' : '🏪 Buyer'}</strong>
                <button onClick={() => setRole(null)} className="ml-2 text-xs text-gray-400 underline">Change</button>
              </p>
              <Link
                href="/auth/signup"
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
              >
                {t(selected, 'continue')} <ArrowRight size={20} />
              </Link>
              <Link href="/" className="block text-center text-sm text-gray-400 mt-3 hover:text-gray-600">
                Go to Homepage
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-green-300 text-xs mt-4">
          🔒 Secure · ✅ Verified Farmers · 🌿 Zero Commission
        </p>
      </div>
    </div>
  );
}
