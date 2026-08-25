'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const { lang, setUser } = useApp();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate auth
    await new Promise(r => setTimeout(r, 1200));
    if (form.phone && form.password.length >= 4) {
      setUser({
        id: 'u001',
        name: 'Rajesh Kumar',
        role: 'farmer',
        phone: form.phone,
        location: 'Karimnagar, Telangana',
        verified: true,
      });
      window.location.href = '/dashboard/farmer';
    } else {
      setError('Invalid credentials. Use any phone + 4+ char password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1a5c2a] mb-4 shadow-lg">
              <Image src="/logo.jpg" alt="AGRONOMY 360" width={80} height={80} className="object-cover" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">{t(lang, 'welcome')}</h1>
            <p className="text-gray-500 mt-1">{t(lang, 'login')} to your account</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'phone')}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'password')}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input-field pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="animate-spin">⏳</span> {t(lang, 'loading')}</>
                ) : (
                  <>{t(lang, 'login')} <ArrowRight size={20} /></>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500">Don't have an account?{' '}
                <Link href="/auth/signup" className="text-[#1a5c2a] font-bold hover:underline">{t(lang, 'signup')}</Link>
              </p>
              <Link href="#" className="text-gray-400 hover:text-gray-600 mt-2 block">Forgot Password?</Link>
            </div>

            {/* OTP Login */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="w-full btn-secondary py-3 text-sm flex items-center justify-center gap-2">
                📱 Login with OTP (SMS)
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
            <span><CheckCircle2 size={14} className="inline text-green-500 mr-1" />Secure Login</span>
            <span><CheckCircle2 size={14} className="inline text-green-500 mr-1" />Aadhaar Verified</span>
            <span><CheckCircle2 size={14} className="inline text-green-500 mr-1" />SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
