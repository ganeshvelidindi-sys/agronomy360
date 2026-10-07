'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useApp } from '@/lib/context';
import { UserDB } from '@/lib/db';
import Link from 'next/link';
import {
  Eye, EyeOff, RefreshCw, CheckCircle2, Mail,
  ArrowRight, AlertCircle, Volume2, VolumeX, ChevronLeft,
  Globe, Lock, Check
} from 'lucide-react';
import { Language, LANGUAGES } from '@/lib/translations';

type Role = 'farmer' | 'buyer';
type LoginMode = 'otp' | 'password';
type Step = 'role' | 'main' | 'otp';

interface VoiceContent {
  welcome: string;
  farmerSelected: string;
  buyerSelected: string;
  otpMode: string;
  passwordMode: string;
  otpSent: string;
  google: string;
  success: string;
  error: string;
}

const VOICE_DICTIONARY: Record<string, VoiceContent> = {
  en: {
    welcome: 'Welcome to Agronomy 360. If you are a farmer, tap the green Farmer button. To buy fresh crops, tap the Buyer button.',
    farmerSelected: 'You selected Farmer. Enter your email to receive an OTP.',
    buyerSelected: 'You selected Buyer. Enter your email to receive an OTP.',
    otpMode: 'Email OTP login. Please enter your email address.',
    passwordMode: 'Password login. Enter your email and password.',
    otpSent: 'A 6 digit OTP has been sent to your Gmail. Please enter the code.',
    google: 'Connecting with Google account.',
    success: 'Login successful! Redirecting to your dashboard.',
    error: 'An error occurred. Please check your details and try again.',
  },
  te: {
    welcome: 'నమస్కారం! అగ్రానమీ 360 కి స్వాగతం. మీరు రైతు అయితే పచ్చ రైతు బటన్ నొక్కండి. పంట కొనడానికి అయితే బయ్యర్ బటన్ నొక్కండి.',
    farmerSelected: 'మీరు రైతుని ఎంచుకున్నారు. మీ ఈమెయిల్ నమోదు చేసి OTP పొందండి.',
    buyerSelected: 'మీరు కొనుగోలుదారుని ఎంచుకున్నారు. మీ ఈమెయిల్ నమోదు చేసి OTP పొందండి.',
    otpMode: 'OTP లాగిన్ కోసం మీ Gmail చిరునామా నమోదు చేయండి.',
    passwordMode: 'పాస్‌వర్డ్ లాగిన్ కోసం ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.',
    otpSent: 'ఆరు అంకెల OTP మీ Gmail కు పంపబడింది. దయచేసి కోడ్ నమోదు చేయండి.',
    google: 'Google తో లాగిన్ అవుతున్నారు.',
    success: 'లాగిన్ విజయవంతమైంది! మీ డాష్‌బోర్డ్‌కు వెళ్తున్నారు.',
    error: 'వివరాలు సరిచూసుకుని మళ్ళీ ప్రయత్నించండి.',
  },
  hi: {
    welcome: 'एग्रोनॉमी 360 में स्वागत है। किसान बटन दबाएं या बायर बटन चुनें।',
    farmerSelected: 'आपने किसान चुना। OTP के लिए अपना ईमेल डालें।',
    buyerSelected: 'आपने खरीदार चुना। OTP के लिए अपना ईमेल डालें।',
    otpMode: 'OTP के लिए अपना ईमेल पता दर्ज करें।',
    passwordMode: 'पासवर्ड लॉगिन के लिए ईमेल और पासवर्ड दर्ज करें।',
    otpSent: 'OTP आपके Gmail पर भेज दिया गया है।',
    google: 'Google से लॉगिन हो रहा है।',
    success: 'लॉगिन सफल रहा!',
    error: 'कृपया सही जानकारी दर्ज करें।',
  },
};

export default function LoginPage() {
  const { lang, setLang, setUser, addNotification } = useApp();

  const [role, setRole] = useState<Role>('farmer');
  const [step, setStep] = useState<Step>('role');
  const [loginMode, setLoginMode] = useState<LoginMode>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isRealEmail, setIsRealEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceOn, setVoiceOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speak = useCallback((textKey: keyof VoiceContent) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!voiceOn) return;
    window.speechSynthesis.cancel();
    const currentLangKey = (['te', 'hi', 'en'].includes(lang)) ? lang : 'en';
    const textToSpeak = VOICE_DICTIONARY[currentLangKey]?.[textKey] || VOICE_DICTIONARY.en[textKey];
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = currentLangKey === 'en' ? 0.95 : 0.88;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    if (currentLangKey === 'te') {
      const v = voices.find(v => v.lang.includes('te') || v.lang.includes('hi-IN') || v.lang.includes('en-IN'));
      if (v) utterance.voice = v;
    } else if (currentLangKey === 'hi') {
      const v = voices.find(v => v.lang.includes('hi'));
      if (v) utterance.voice = v;
    }
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [lang, voiceOn]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setOtpTimer(30);
    timerRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const goToDashboard = (r: Role) => {
    speak('success');
    addNotification({ title: 'Login Successful!', message: `Welcome back! Signed in as ${r}`, type: 'order' });
    setTimeout(() => { window.location.href = r === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer'; }, 600);
  };

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep('main');
    speak(r === 'farmer' ? 'farmerSelected' : 'buyerSelected');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    const found = UserDB.loginByEmail(cleanEmail, password) || UserDB.login(cleanEmail, password);
    if (!found) { setLoading(false); setError('Incorrect email or password. Please try again.'); speak('error'); return; }
    setUser({ id: found.id, name: found.name, role: found.role, email: found.email, phone: found.phone, location: found.location, verified: found.verified });
    goToDashboard(found.role);
  };

  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.'); speak('error'); return;
    }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: cleanEmail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setIsRealEmail(Boolean(data.realEmail));
      setLoading(false); setStep('otp'); startTimer(); speak('otpSent');
      addNotification({ title: 'OTP Sent!', message: `Code sent to ${cleanEmail}`, type: 'message' });
      setTimeout(() => otpRefs.current[0]?.focus(), 250);
    } catch (err: any) { setLoading(false); setError(err.message || 'Error sending OTP'); speak('error'); }
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setError(''); setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/send-otp', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: cleanEmail, otp: entered }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      let found = UserDB.findByEmail(cleanEmail);
      if (!found) {
        try { found = UserDB.register({ name: role === 'farmer' ? 'Farmer' : 'Buyer', email: cleanEmail, phone: '', password: 'otp_' + Date.now(), role, state: 'India', district: 'India', location: 'India' }); }
        catch { found = UserDB.findByEmail(cleanEmail); }
      }
      setUser({ id: found?.id || 'u_' + cleanEmail, name: found?.name || (role === 'farmer' ? 'Farmer' : 'Buyer'), role: found?.role || role, phone: found?.phone || '', email: cleanEmail, location: found?.location || 'India', verified: true });
      goToDashboard(found?.role || role);
    } catch (err: any) { setLoading(false); setError(err.message || 'OTP verification failed'); speak('error'); }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try { sessionStorage.setItem('agr360_role', role); } catch {}
    speak('google');
    await signIn('google', { callbackUrl: role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer', redirect: true });
  };

  const isFarmer = role === 'farmer';
  const accentColor = isFarmer ? 'emerald' : 'blue';

  // Theme palette per role
  const T = {
    gradient: isFarmer
      ? 'from-emerald-50 via-green-50 to-teal-50'
      : 'from-blue-50 via-indigo-50 to-sky-50',
    blob1: isFarmer ? 'bg-emerald-200/60' : 'bg-blue-200/60',
    blob2: isFarmer ? 'bg-teal-300/40' : 'bg-indigo-300/40',
    blob3: isFarmer ? 'bg-green-100/50' : 'bg-sky-100/50',
    card: 'bg-white/80 backdrop-blur-2xl border border-white/60 shadow-xl shadow-gray-200/60',
    headerCard: 'bg-white/70 backdrop-blur-xl border border-gray-200/60 shadow-md',
    pill: isFarmer ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50' : 'bg-blue-500/10 text-blue-700 border-blue-300/50',
    roleCardFarmer: 'bg-white hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 shadow-md hover:shadow-emerald-100',
    roleCardBuyer: 'bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-blue-100',
    iconFarmer: 'bg-gradient-to-tr from-emerald-500 to-green-400 shadow-emerald-200',
    iconBuyer: 'bg-gradient-to-tr from-blue-500 to-indigo-400 shadow-blue-200',
    segmentActive: isFarmer ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-blue-500 text-white shadow-blue-200',
    segmentInactive: 'text-gray-500 hover:text-gray-700',
    input: 'bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 text-gray-900 placeholder-gray-400',
    inputBuyer: 'bg-gray-50 border-2 border-gray-200 focus:border-blue-400 text-gray-900 placeholder-gray-400',
    btn: isFarmer
      ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-emerald-200/60'
      : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-200/60',
    voiceBtn: isFarmer ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    badge: isFarmer ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200',
    langActive: isFarmer ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-blue-700 bg-blue-50 font-bold',
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: ROLE SELECTION
  // ─────────────────────────────────────────────────────────────
  if (step === 'role') return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col relative overflow-hidden`}>
      {/* Soft blob backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/50 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-teal-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-green-100/60 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-4 pt-5 pb-3 w-full max-w-lg mx-auto">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/80 shadow-md shadow-gray-200/50 rounded-2xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-xl shadow-md">🌾</div>
            <div>
              <span className="text-base font-black tracking-tight text-gray-800">AGRONOMY</span>
              <span className="text-amber-500 font-black text-xs ml-1">360</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-sm"
              >
                <Globe size={13} className="text-emerald-600" />
                <span>{LANGUAGES.find(l => l.code === lang)?.nativeName || 'English'}</span>
              </button>
              {langMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-2xl py-2 shadow-2xl z-50 animate-fade-in-up">
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

            {/* Voice toggle */}
            <button onClick={() => { setVoiceOn(v => !v); if (voiceOn) window.speechSynthesis?.cancel(); }}
              className={`p-2 rounded-xl border text-sm transition-all ${voiceOn ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
              {voiceOn ? <Volume2 size={15} className={isSpeaking ? 'animate-pulse' : ''} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative z-10">
        <div className="w-full max-w-sm">
          {/* Hero text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4">
              <span>✨</span> Choose Your Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {lang === 'te' ? 'మీరు ఎవరిగా లాగిన్\nచేయాలనుకుంటున్నారు?' : 'How would you like\nto sign in today?'}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {lang === 'te' ? 'మీ పాత్రను ఎంచుకోండి' : 'Select your role to get started'}
            </p>
          </div>

          {/* Role cards */}
          <div className="space-y-3.5">
            {/* Farmer */}
            <button onClick={() => handleRoleSelect('farmer')}
              className="w-full group bg-white hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 rounded-3xl p-5 flex items-center gap-4 shadow-md hover:shadow-emerald-100/80 transition-all duration-200 active:scale-[0.98] text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform flex-shrink-0">
                🧑‍🌾
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg font-black text-gray-900">
                    {lang === 'te' ? 'నేను రైతును' : 'I am a Farmer'}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {lang === 'te' ? 'రైతు' : 'Seller'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {lang === 'te' ? 'పంటలు నేరుగా అమ్మండి, ఉత్తమ ధర పొందండి' : 'List crops, get fair prices, zero middlemen'}
                </p>
              </div>
              <ArrowRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>

            {/* Buyer */}
            <button onClick={() => handleRoleSelect('buyer')}
              className="w-full group bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-3xl p-5 flex items-center gap-4 shadow-md hover:shadow-blue-100/80 transition-all duration-200 active:scale-[0.98] text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-3xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform flex-shrink-0">
                🏪
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg font-black text-gray-900">
                    {lang === 'te' ? 'కొనుగోలుదారు' : 'I am a Buyer'}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    {lang === 'te' ? 'బయ్యర్' : 'Buyer'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {lang === 'te' ? 'నేరుగా రైతుల నుండి తాజా పంటలు కొనండి' : 'Buy fresh produce directly from verified farmers'}
                </p>
              </div>
              <ArrowRight size={18} className="text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>
          </div>

          {/* Voice replay */}
          <button onClick={() => speak('welcome')}
            className="w-full mt-5 py-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 transition-all">
            <Volume2 size={14} className={isSpeaking ? 'animate-pulse' : ''} />
            <span>{lang === 'te' ? 'సూచనలు వినండి' : 'Hear Voice Instructions'}</span>
          </button>

          <p className="text-center mt-5 text-xs text-gray-400">
            {lang === 'te' ? 'ఖాతా లేదా?' : "Don't have an account?"}{' '}
            <Link href="/auth/signup" className="text-emerald-600 font-bold hover:underline">
              {lang === 'te' ? 'Sign Up చేయండి' : 'Sign Up Free'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // STEP 3: OTP VERIFICATION
  // ─────────────────────────────────────────────────────────────
  if (step === 'otp') return (
    <div className={`min-h-screen bg-gradient-to-br ${isFarmer ? 'from-emerald-50 via-white to-green-50' : 'from-blue-50 via-white to-indigo-50'} flex flex-col relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -right-32 w-80 h-80 ${isFarmer ? 'bg-emerald-200/50' : 'bg-blue-200/50'} rounded-full blur-[100px]`} />
        <div className={`absolute -bottom-20 -left-20 w-72 h-72 ${isFarmer ? 'bg-teal-200/40' : 'bg-indigo-200/40'} rounded-full blur-[80px]`} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-sm bg-white/85 backdrop-blur-2xl border border-white/70 shadow-xl shadow-gray-200/50 rounded-3xl p-7">

          <button onClick={() => { setStep('main'); setOtp(['','','','','','']); setError(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 mb-6 transition-colors">
            <ChevronLeft size={16} /> {lang === 'te' ? 'వెనక్కి' : 'Back to Login'}
          </button>

          <div className="text-center mb-7">
            <div className={`w-14 h-14 rounded-2xl ${isFarmer ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm border ${isFarmer ? 'border-emerald-200' : 'border-blue-200'}`}>
              📬
            </div>
            <h2 className="text-xl font-black text-gray-900">
              {lang === 'te' ? 'OTP నమోదు చేయండి' : 'Enter OTP Code'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'te' ? 'Gmail కు పంపిన 6 అంకెల కోడ్' : '6-digit code sent to your email:'}
            </p>
            <p className={`text-xs font-bold mt-0.5 break-all ${isFarmer ? 'text-emerald-700' : 'text-blue-700'}`}>{email}</p>
            {isRealEmail && (
              <div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${isFarmer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                <CheckCircle2 size={12} />
                <span>{lang === 'te' ? 'Real OTP Gmail కు పంపబడింది!' : 'Real OTP delivered to Gmail!'}</span>
              </div>
            )}
          </div>

          {/* OTP boxes */}
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, idx) => (
              <input key={idx} ref={el => { otpRefs.current[idx] = el; }}
                type="tel" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleOtpChange(e.target.value, idx)}
                onKeyDown={e => handleOtpKeyDown(e, idx)}
                className={`w-11 h-14 text-center text-2xl font-black rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
                  digit
                    ? isFarmer ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100' : 'border-blue-400 bg-blue-50 text-blue-700 shadow-md shadow-blue-100'
                    : isFarmer ? 'border-gray-200 bg-gray-50 text-gray-800 focus:border-emerald-400 focus:bg-emerald-50/50' : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-blue-400 focus:bg-blue-50/50'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4">
              <AlertCircle size={14} className="flex-shrink-0" /><span>{error}</span>
            </div>
          )}

          <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 6}
            className={`w-full py-3.5 rounded-2xl ${T.btn} text-white font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}>
            {loading ? <><RefreshCw size={16} className="animate-spin" /> {lang === 'te' ? 'తనిఖీ చేస్తోంది...' : 'Verifying...'}</>
              : <><CheckCircle2 size={16} /> {lang === 'te' ? 'ధృవీకరించి లాగిన్ అవ్వండి' : 'Verify & Sign In'}</>}
          </button>

          <div className="text-center mt-4 text-xs text-gray-500">
            {otpTimer > 0
              ? <span>{lang === 'te' ? 'మళ్ళీ పంపడానికి:' : 'Resend in:'} <strong className={isFarmer ? 'text-emerald-600' : 'text-blue-600'}>{otpTimer}s</strong></span>
              : <button onClick={() => { setOtp(['','','','','','']); handleSendOtp(); }} className={`font-bold hover:underline ${isFarmer ? 'text-emerald-600' : 'text-blue-600'}`}>
                {lang === 'te' ? 'మళ్ళీ OTP పంపండి' : 'Resend OTP Code'}
              </button>}
          </div>

          <button onClick={() => speak('otpSent')}
            className={`w-full mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors ${isFarmer ? 'text-emerald-600 hover:text-emerald-700' : 'text-blue-600 hover:text-blue-700'}`}>
            <Volume2 size={13} /> {lang === 'te' ? 'వాయిస్ సూచనలు వినండి' : 'Hear Voice Guide'}
          </button>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // STEP 2: MAIN LOGIN FORM
  // ─────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gradient-to-br ${isFarmer ? 'from-emerald-50 via-white to-green-50' : 'from-blue-50 via-white to-indigo-50'} flex flex-col relative overflow-hidden`}>
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -right-32 w-96 h-96 ${isFarmer ? 'bg-emerald-200/50' : 'bg-blue-200/50'} rounded-full blur-[120px]`} />
        <div className={`absolute bottom-0 -left-24 w-80 h-80 ${isFarmer ? 'bg-teal-200/40' : 'bg-indigo-200/40'} rounded-full blur-[100px]`} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-100/30 rounded-full blur-[90px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-4 pt-5 pb-3 w-full max-w-lg mx-auto">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/80 shadow-md shadow-gray-200/50 rounded-2xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-xl shadow-md">🌾</div>
            <div>
              <span className="text-base font-black tracking-tight text-gray-800">AGRONOMY</span>
              <span className="text-amber-500 font-black text-xs ml-1">360</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
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
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-2xl py-2 shadow-2xl z-50 animate-fade-in-up">
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
                          lang === l.code ? (isFarmer ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-blue-700 bg-blue-50 font-bold') : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600">
                            {l.badge}
                          </span>
                          <span className="text-xs font-bold">{l.nativeName}</span>
                        </div>
                        {lang === l.code && <Check size={14} className={isFarmer ? 'text-emerald-600' : 'text-blue-600'} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={() => { setVoiceOn(v => !v); if (voiceOn) window.speechSynthesis?.cancel(); }}
              className={`p-2 rounded-xl border text-sm transition-all ${voiceOn ? (isFarmer ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-blue-50 border-blue-200 text-blue-600') : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
              {voiceOn ? <Volume2 size={15} className={isSpeaking ? 'animate-pulse' : ''} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 relative z-10">
        <div className="w-full max-w-sm bg-white/85 backdrop-blur-2xl border border-white/70 shadow-xl shadow-gray-200/50 rounded-3xl p-7">

          {/* Back + Badge */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setStep('role')} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
              <ChevronLeft size={15} /> {lang === 'te' ? 'రోల్ మార్చండి' : 'Change Role'}
            </button>
            <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${isFarmer ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
              {isFarmer ? '🧑‍🌾 Farmer' : '🏪 Buyer'} Login
            </span>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-black text-gray-900">
              {lang === 'te' ? 'లాగిన్ చేయండి' : 'Welcome Back!'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'te' ? 'మీ ఖాతాలోకి సురక్షితంగా ప్రవేశించండి' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Segmented switcher */}
          <div className="flex p-1 rounded-2xl bg-gray-100 border border-gray-200 mb-5">
            <button type="button" onClick={() => { setLoginMode('otp'); setError(''); speak('otpMode'); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm ${loginMode === 'otp' ? T.segmentActive : T.segmentInactive}`}>
              <Mail size={12} /> Email OTP
            </button>
            <button type="button" onClick={() => { setLoginMode('password'); setError(''); speak('passwordMode'); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${loginMode === 'password' ? T.segmentActive : T.segmentInactive}`}>
              <Lock size={12} /> Password
            </button>
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
            className="w-full py-3.5 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center gap-3 shadow-sm transition-all active:scale-95 disabled:opacity-50 mb-4">
            {googleLoading
              ? <RefreshCw size={17} className="animate-spin text-gray-400" />
              : <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.3z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.6 42.6 14.7 48 24 48z"/>
                  <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.7-2.9-.7-4.8s.3-3.3.7-4.8v-6.2H2.6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.9l8.2-6.1z"/>
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.4 30.5 0 24 0 14.7 0 6.6 5.4 2.6 13.1l8.2 6.2c1.9-5.6 7.1-9.8 13.2-9.8z"/>
                </svg>}
            <span>{lang === 'te' ? 'Google తో లాగిన్ అవ్వండి' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{lang === 'te' ? 'లేదా' : 'or'}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* OTP Form */}
          {loginMode === 'otp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'Gmail చిరునామా' : 'Your Email (Gmail)'}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="yourname@gmail.com"
                    className={`w-full pl-9 pr-4 py-3.5 rounded-2xl text-sm font-semibold transition-all focus:outline-none ${isFarmer ? 'bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-emerald-50/30' : 'bg-gray-50 border-2 border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'} text-gray-900 placeholder-gray-400`} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {lang === 'te' ? 'ఈ Gmail కి 6 అంకెల OTP వస్తుంది 📬' : 'A real OTP code will be sent to this Gmail 📬'}
                </p>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                  <AlertCircle size={14} className="flex-shrink-0" /><span>{error}</span>
                </div>
              )}
              <button type="button" onClick={handleSendOtp} disabled={loading || !email.includes('@')}
                className={`w-full py-3.5 rounded-2xl ${T.btn} text-white font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}>
                {loading ? <><RefreshCw size={16} className="animate-spin" /> {lang === 'te' ? 'OTP పంపుతున్నాము...' : 'Sending OTP...'}</>
                  : <>{lang === 'te' ? 'Gmail కు OTP పంపండి' : 'Send OTP to Gmail'} <ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          {/* Password Form */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'ఈమెయిల్' : 'Email'}
                </label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="yourname@gmail.com"
                  className={`w-full px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all focus:outline-none ${isFarmer ? 'bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-emerald-50/30' : 'bg-gray-50 border-2 border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'} text-gray-900 placeholder-gray-400`} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
                  {lang === 'te' ? 'పాస్‌వర్డ్' : 'Password'}
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3.5 pr-11 rounded-2xl text-sm font-semibold transition-all focus:outline-none ${isFarmer ? 'bg-gray-50 border-2 border-gray-200 focus:border-emerald-400 focus:bg-emerald-50/30' : 'bg-gray-50 border-2 border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'} text-gray-900 placeholder-gray-400`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                  <AlertCircle size={14} className="flex-shrink-0" /><span>{error}</span>
                </div>
              )}
              <button type="submit" disabled={loading}
                className={`w-full py-3.5 rounded-2xl ${T.btn} text-white font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}>
                {loading ? <><RefreshCw size={16} className="animate-spin" /> {lang === 'te' ? 'లాగిన్ అవుతోంది...' : 'Signing in...'}</>
                  : <>{lang === 'te' ? 'లాగిన్ అవ్వండి' : 'Sign In'} <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* Voice guide */}
          <button type="button" onClick={() => speak(loginMode === 'otp' ? 'otpMode' : 'passwordMode')}
            className={`w-full mt-4 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${isFarmer ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
            <Volume2 size={13} /> {lang === 'te' ? 'సూచనలు వినండి' : 'Hear Voice Guide'}
          </button>

          <p className="text-center mt-4 text-xs text-gray-400">
            {lang === 'te' ? 'ఖాతా లేదా?' : "Don't have an account?"}{' '}
            <Link href="/auth/signup" className={`font-bold hover:underline ${isFarmer ? 'text-emerald-600' : 'text-blue-600'}`}>
              {lang === 'te' ? 'Sign Up చేయండి' : 'Sign Up Free'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
