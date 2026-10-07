'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { UserDB } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, RefreshCw, CheckCircle2, Eye, EyeOff,
  ChevronLeft, Globe, Check, ShieldCheck, UserCheck, Sparkles
} from 'lucide-react';
import { LANGUAGES, Language } from '@/lib/translations';

const STATES = [
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu',
  'Maharashtra', 'Gujarat', 'Haryana', 'Punjab', 'Madhya Pradesh',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Other'
];

const SOIL_TYPES = [
  'Black Soil (నల్లరేగడి నేల)',
  'Red Soil (ఎర్ర నేల)',
  'Alluvial Soil (ఒండ్రు నేల)',
  'Sandy Loam (ఇసుక నేల)',
  'Clay Soil (బంకమట్టి నేల)',
  'Laterite Soil'
];

export default function SignupPage() {
  const { lang, setLang, setUser, addNotification } = useApp();
  const router = useRouter();

  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: 'Telangana',
    district: '',
    landSize: '',
    soilType: 'Black Soil (నల్లరేగడి నేల)',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const isFarmer = role === 'farmer';

  const update = (field: string, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setError('');
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = form.phone.replace(/\D/g, '');
    if (!form.name.trim()) {
      setError(lang === 'te' ? 'దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.' : 'Please enter your full name.');
      return;
    }
    if (cleaned.length !== 10) {
      setError(lang === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (form.password.length < 6) {
      setError(lang === 'te' ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.' : 'Password must be at least 6 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(lang === 'te' ? 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.' : 'Passwords do not match.');
      return;
    }
    const existing = UserDB.findByPhone(cleaned);
    if (existing) {
      setError(lang === 'te' ? 'ఈ ఫోన్ నంబర్‌తో ఖాతా ఇప్పటికే ఉంది. దయచేసి లాగిన్ అవ్వండి.' : 'An account already exists with this phone number. Please sign in.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.state) {
      setError(lang === 'te' ? 'దయచేసి రాష్ట్రాన్ని ఎంచుకోండి.' : 'Please select your state.');
      return;
    }
    if (!form.district.trim()) {
      setError(lang === 'te' ? 'దయచేసి మీ జిల్లా నమోదు చేయండి.' : 'Please enter your district.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const cleaned = form.phone.replace(/\D/g, '');
      const newUser = UserDB.register({
        name: form.name.trim(),
        phone: cleaned,
        password: form.password,
        role,
        state: form.state,
        district: form.district.trim(),
        location: `${form.district.trim()}, ${form.state}`,
        landSize: form.landSize,
        soilType: form.soilType,
        ...(form.email.trim() ? { email: form.email.trim().toLowerCase() } : {}),
      } as any);

      setUser({
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        email: newUser.email,
        location: newUser.location,
        verified: true,
      });

      addNotification({
        title: lang === 'te' ? 'రిజిస్ట్రేషన్ విజయవంతం!' : 'Registration Successful!',
        message: lang === 'te' ? `స్వాగతం, ${newUser.name}!` : `Welcome to Agronomy 360, ${newUser.name}!`,
        type: 'order',
      });

      window.location.href = role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer';
    } catch (err: any) {
      setError(err.message || (lang === 'te' ? 'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.' : 'Registration failed. Please try again.'));
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isFarmer ? 'from-emerald-50 via-white to-green-50' : 'from-blue-50 via-white to-indigo-50'} flex flex-col relative overflow-hidden select-none font-sans`}>
      {/* Ambient Pastel Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -left-32 w-96 h-96 ${isFarmer ? 'bg-emerald-200/50' : 'bg-blue-200/50'} rounded-full blur-[120px]`} />
        <div className={`absolute bottom-0 -right-24 w-80 h-80 ${isFarmer ? 'bg-teal-200/40' : 'bg-indigo-200/40'} rounded-full blur-[100px]`} />
      </div>

      {/* ── HEADER WITH LOGO & LANGUAGE SELECTOR ─────────────── */}
      <header className="relative z-50 px-4 pt-5 pb-3 w-full max-w-lg mx-auto">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/80 shadow-md shadow-gray-200/50 rounded-2xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-xl shadow-md">
              🌾
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-gray-900">AGRONOMY</span>
              <span className="text-amber-500 font-black text-xs ml-1">360</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-sm"
              >
                <Globe size={13} className={isFarmer ? 'text-emerald-600' : 'text-blue-600'} />
                <span>{LANGUAGES.find(l => l.code === lang)?.nativeName || 'English'}</span>
              </button>

              {langMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl py-2 shadow-2xl z-50 animate-fade-in-up">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLang(l.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold hover:bg-emerald-50 transition-colors ${
                          lang === l.code ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600">
                            {l.badge}
                          </span>
                          <span className="text-xs font-bold">{l.nativeName}</span>
                        </div>
                        {lang === l.code && <Check size={14} className="text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link
              href="/auth/login"
              className="text-xs font-bold text-gray-500 hover:text-gray-800 px-2 py-1"
            >
              {lang === 'te' ? 'లాగిన్' : 'Sign In'}
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN SIGNUP CARD ─────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 relative z-10">
        <div className="w-full max-w-md bg-white/85 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-gray-200/50 rounded-3xl p-6 sm:p-8">

          {/* Heading */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${isFarmer ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
              <Sparkles size={13} />
              <span>{lang === 'te' ? 'ఉచిత రిజిస్ట్రేషన్' : 'Free Registration'}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {lang === 'te' ? 'కొత్త ఖాతా తెరవండి' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'te' ? 'వేలాది రైతులు మరియు కొనుగోలుదారులతో కనెక్ట్ అవ్వండి' : 'Join thousands of verified farmers & buyers across India'}
            </p>
          </div>

          {/* Role Segmented Switcher */}
          <div className="flex p-1 rounded-2xl bg-gray-100 border border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => { setRole('farmer'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
                role === 'farmer'
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>🧑‍🌾</span>
              <span>{lang === 'te' ? 'రైతు (Farmer)' : 'I am a Farmer'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('buyer'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                role === 'buyer'
                  ? 'bg-blue-500 text-white shadow-blue-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>🏪</span>
              <span>{lang === 'te' ? 'కొనుగోలుదారు (Buyer)' : 'I am a Buyer'}</span>
            </button>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`w-8 h-2 rounded-full transition-all ${step === 1 ? (isFarmer ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-gray-200'}`} />
            <span className={`w-8 h-2 rounded-full transition-all ${step === 2 ? (isFarmer ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-gray-200'}`} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          {/* ── STEP 1: PERSONAL & LOGIN DETAILS ─────────────── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'పూర్తి పేరు' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder={lang === 'te' ? 'మీ పూర్తి పేరు' : 'e.g. Ramesh Kumar'}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number (10 Digits)'} *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-2xl border-2 border-r-0 border-gray-200 bg-gray-100 text-xs font-black text-gray-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-3.5 rounded-r-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'ఈమెయిల్ (ఐచ్ఛికం)' : 'Email Address (Optional)'}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'పాస్‌వర్డ్' : 'Password (min. 6 chars)'} *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'పాస్‌వర్డ్ నిర్ధారించండి' : 'Confirm Password'} *
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-2xl ${
                  isFarmer
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25'
                } text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all mt-6`}
              >
                <span>{lang === 'te' ? 'తదుపరి వివరాలు (Next)' : 'Continue to Location'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ── STEP 2: LOCATION & FARM DETAILS ──────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 mb-2 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>{lang === 'te' ? 'వెనక్కి' : 'Back to Step 1'}</span>
              </button>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'రాష్ట్రం' : 'State'} *
                </label>
                <select
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                  required
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'జిల్లా / ఊరు' : 'District / City'} *
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                  placeholder={lang === 'te' ? 'ఉదా: వరంగల్' : 'e.g. Warangal'}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                  required
                />
              </div>

              {/* Farmer specific fields */}
              {isFarmer && (
                <>
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                      {lang === 'te' ? 'పొలం విస్తీర్ణం (ఎకరాలు)' : 'Land Size (in acres)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.landSize}
                      onChange={(e) => update('landSize', e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                      {lang === 'te' ? 'నేల రకం' : 'Soil Type'}
                    </label>
                    <select
                      value={form.soilType}
                      onChange={(e) => update('soilType', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-white focus:outline-none text-sm font-semibold text-gray-900 transition-all"
                    >
                      {SOIL_TYPES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl ${
                  isFarmer
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25'
                } text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all mt-6 disabled:opacity-50`}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{lang === 'te' ? 'ఖాతా సృష్టిస్తోంది...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{lang === 'te' ? 'రిజిస్ట్రేషన్ పూర్తి చేయండి' : 'Complete Registration'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <p className="text-center mt-6 text-xs text-gray-400">
            {lang === 'te' ? 'ఇప్పటికే ఖాతా ఉందా?' : 'Already have an account?'}{' '}
            <Link
              href="/auth/login"
              className={`font-black hover:underline ${isFarmer ? 'text-emerald-700' : 'text-blue-700'}`}
            >
              {lang === 'te' ? 'లాగిన్ అవ్వండి' : 'Sign In'}
            </Link>
          </p>

        </div>
      </main>
    </div>
  );
}
