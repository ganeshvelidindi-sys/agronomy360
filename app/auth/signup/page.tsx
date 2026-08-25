'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

const STATES = ['Andhra Pradesh', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'];

export default function SignupPage() {
  const { lang, setUser } = useApp();
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', password: '', state: '', district: '', landSize: '', soilType: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUser({ id: 'u_new', name: form.name, role, phone: form.phone, location: `${form.district}, ${form.state}`, verified: false });
    window.location.href = role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <Image src="/logo.jpg" alt="AGRONOMY 360" width={64} height={64} className="mx-auto rounded-2xl border-2 border-[#1a5c2a] mb-3" />
            <h1 className="text-2xl font-black text-gray-900">{t(lang, 'signup')}</h1>
            <p className="text-gray-500 text-sm mt-1">Join 2.4 Lakh+ farmers and buyers</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button onClick={() => setRole('farmer')} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${role === 'farmer' ? 'bg-[#1a5c2a] text-white shadow' : 'text-gray-600'}`}>
              👨‍🌾 {t(lang, 'farmer')}
            </button>
            <button onClick={() => setRole('buyer')} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${role === 'buyer' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}>
              🏪 {t(lang, 'buyer')}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-all ${step >= s ? 'bg-[#1a5c2a]' : 'bg-gray-200'}`} />
            ))}
          </div>

          <div className="card p-8">
            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-4">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Basic Information</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t(lang, 'name')}</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Rajesh Kumar" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t(lang, 'phone')}</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="9876543210" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t(lang, 'password')}</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field pr-12" placeholder="Min. 6 characters" minLength={6} required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                  {t(lang, 'next')} <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-bold text-gray-900 text-lg mb-4">{role === 'farmer' ? 'Farm Details' : 'Business Details'}</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t(lang, 'state')}</label>
                  <select value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="input-field" required>
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t(lang, 'district')}</label>
                  <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="input-field" placeholder="e.g. Karimnagar" required />
                </div>
                {role === 'farmer' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t(lang, 'landSize')}</label>
                      <input type="number" value={form.landSize} onChange={e => setForm({...form, landSize: e.target.value})} className="input-field" placeholder="e.g. 5" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t(lang, 'soilType')}</label>
                      <select value={form.soilType} onChange={e => setForm({...form, soilType: e.target.value})} className="input-field">
                        <option value="">Select Soil Type</option>
                        <option>Black Cotton Soil</option>
                        <option>Red Loamy Soil</option>
                        <option>Sandy Loam</option>
                        <option>Clay Loam</option>
                        <option>Alluvial Soil</option>
                        <option>Laterite Soil</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <input type="checkbox" required className="mt-1 w-4 h-4 accent-[#1a5c2a]" />
                  <span className="text-xs text-gray-600">I agree to the <Link href="#" className="text-[#1a5c2a] underline">Terms of Service</Link> and <Link href="#" className="text-[#1a5c2a] underline">Privacy Policy</Link>. I confirm my details are accurate.</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">{t(lang, 'back')}</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-2 flex-1 py-3 flex items-center justify-center gap-2">
                    {loading ? '⏳ Creating...' : <>{t(lang, 'continue')} <ArrowRight size={18} /></>}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#1a5c2a] font-bold hover:underline">{t(lang, 'login')}</Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
            <span><CheckCircle2 size={13} className="inline text-green-500 mr-1" />Aadhaar Verified</span>
            <span><CheckCircle2 size={13} className="inline text-green-500 mr-1" />Free Forever</span>
            <span><CheckCircle2 size={13} className="inline text-green-500 mr-1" />Zero Commission</span>
          </div>
        </div>
      </div>
    </div>
  );
}
