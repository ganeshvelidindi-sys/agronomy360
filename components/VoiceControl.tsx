'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VoiceCommand {
  keywords: string[];
  action: () => void;
  label: string;
  icon: string;
}

interface Props {
  role?: 'farmer' | 'buyer';
  onCommand?: (cmd: string) => void;
}

export default function VoiceControl({ role, onCommand }: Props) {
  const router = useRouter();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [supported, setSupported] = useState(false);
  const recogRef = useRef<any>(null);
  const feedbackTimer = useRef<any>(null);

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(''), 3500);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const teluguVoice = voices.find(v => v.lang.startsWith('te'));
      if (teluguVoice) utter.voice = teluguVoice;
      utter.lang = 'te-IN';
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    } catch {}
  }, []);

  const baseCommands: VoiceCommand[] = [
    { keywords: ['home', 'ఇల్లు', 'హోమ్'], action: () => router.push('/'), label: 'Home', icon: '🏠' },
    { keywords: ['market', 'marketplace', 'మార్కెట్'], action: () => router.push('/marketplace'), label: 'Marketplace', icon: '🏪' },
    { keywords: ['price', 'prices', 'ధర', 'ధరలు', 'mandi', 'మండి'], action: () => router.push('/market-prices'), label: 'Mandi Prices', icon: '📈' },
    { keywords: ['chatbot', 'chat', 'help', 'సహాయం', 'ai', 'assistant'], action: () => router.push('/chatbot'), label: 'AI Assistant', icon: '🤖' },
    { keywords: ['schemes', 'scheme', 'పథకాలు', 'government', 'govt', 'yojana'], action: () => router.push('/schemes'), label: 'Govt Schemes', icon: '📋' },
    { keywords: ['login', 'sign in', 'లాగిన్'], action: () => router.push('/auth/login'), label: 'Login', icon: '🔐' },
  ];

  const farmerCommands: VoiceCommand[] = [
    { keywords: ['add crop', 'list crop', 'పంట', 'పంట జోడించు', 'sell', 'sell crop', 'పంట అమ్ము'], action: () => router.push('/list-crop'), label: 'పంట List చేయండి', icon: '🌾' },
    { keywords: ['dashboard', 'my account', 'నా account', 'farmer dashboard', 'నా dashboard'], action: () => router.push('/dashboard/farmer'), label: 'నా Dashboard', icon: '📊' },
    { keywords: ['disease', 'disease detection', 'వ్యాధి', 'plant disease', 'రోగం'], action: () => router.push('/disease-detection'), label: 'Disease Detection', icon: '🔬' },
    { keywords: ['advisor', 'crop advisor', 'advice', 'సలహా', 'suggest'], action: () => router.push('/advisor'), label: 'Crop Advisor', icon: '🌱' },
    { keywords: ['loan', 'loans', 'finance', 'రుణం', 'money', 'bank'], action: () => router.push('/loans'), label: 'Loans & Finance', icon: '💳' },
    { keywords: ['forum', 'community', 'రైతులు', 'talk', 'forum'], action: () => router.push('/forum'), label: 'Farmer Forum', icon: '💬' },
  ];

  const buyerCommands: VoiceCommand[] = [
    { keywords: ['dashboard', 'my account', 'buyer dashboard', 'నా dashboard'], action: () => router.push('/dashboard/buyer'), label: 'నా Dashboard', icon: '📊' },
    { keywords: ['orders', 'my orders', 'నా orders', 'track', 'tracking'], action: () => router.push('/dashboard/buyer'), label: 'My Orders', icon: '📦' },
    { keywords: ['search', 'find crop', 'కొనుగోలు', 'buy', 'purchase', 'కొను'], action: () => router.push('/marketplace'), label: 'Buy Crops', icon: '🛒' },
  ];

  const commands = [
    ...baseCommands,
    ...(role === 'farmer' ? farmerCommands : []),
    ...(role === 'buyer' ? buyerCommands : []),
    ...(role === undefined ? [...farmerCommands, ...buyerCommands] : []),
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSupported(true);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!supported) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recogRef.current = recognition;
    recognition.lang = 'te-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      setListening(true);
      setTranscript('');
      showFeedback('🎙️ వినుతున్నాను... మాట్లాడండి');
    };

    recognition.onresult = (event: any) => {
      const results = event.results[event.resultIndex];
      const allTranscripts = Array.from(results).map((r: any) => r.transcript.toLowerCase().trim());
      const text = allTranscripts[0];
      setTranscript(text);

      if (results.isFinal) {
        let matched = false;
        // Try all transcript alternatives
        for (const alt of allTranscripts) {
          if (matched) break;
          for (const cmd of commands) {
            if (cmd.keywords.some(k => alt.includes(k.toLowerCase()))) {
              showFeedback(`✅ "${cmd.label}" ${cmd.icon} తెరుస్తున్నాను...`);
              speak(`${cmd.label} తెరుస్తున్నాను`);
              setTimeout(() => cmd.action(), 900);
              matched = true;
              onCommand?.(alt);
              break;
            }
          }
        }
        if (!matched) {
          showFeedback(`❓ అర్థం కాలేదు: "${text}". మళ్లీ చెప్పండి.`);
        }
        setListening(false);
      }
    };

    recognition.onerror = (e: any) => {
      setListening(false);
      if (e.error !== 'no-speech') {
        showFeedback('❌ Voice error. మళ్లీ try చేయండి.');
      }
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  }, [supported, commands, showFeedback, speak, onCommand]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  if (!supported) return null;

  return (
    <>
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl max-w-[90vw] text-center pointer-events-none">
          {feedback}
        </div>
      )}

      {/* Live Transcript Bubble */}
      {listening && transcript && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-[9998] bg-green-900 text-green-100 px-4 py-2 rounded-xl text-xs shadow-xl max-w-xs text-center pointer-events-none">
          🎤 "{transcript}"
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="fixed inset-0 z-[9997] bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-900 text-lg">🎙️ Voice Commands</h3>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={22} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">ఈ పదాలు చెప్పండి (Telugu or English):</p>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {commands.map(cmd => (
                <button
                  key={cmd.label}
                  onClick={() => { setShowHelp(false); cmd.action(); }}
                  className="bg-gray-50 hover:bg-green-50 rounded-xl p-3 text-center transition-colors"
                >
                  <div className="text-2xl mb-1">{cmd.icon}</div>
                  <div className="text-xs font-bold text-gray-800">{cmd.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">"{cmd.keywords[0]}"</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowHelp(false); startListening(); }}
              className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <Mic size={18} /> మాట్లాడండి (Start Voice)
            </button>
          </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="fixed bottom-6 right-4 z-[9990] flex flex-col items-center gap-2">
        <button
          onClick={() => setShowHelp(true)}
          className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all"
          title="Commands చూడండి"
        >
          <Volume2 size={16} />
        </button>
        <button
          onClick={listening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 ${
            listening
              ? 'bg-red-500 scale-110 ring-4 ring-red-300 ring-opacity-60'
              : 'bg-gradient-to-br from-green-500 to-green-800 hover:scale-105'
          }`}
          title={listening ? 'Stop చేయండి' : 'Voice తో మాట్లాడండి'}
        >
          {listening
            ? <MicOff size={26} className="text-white" />
            : <Mic size={26} className="text-white" />
          }
        </button>
        <span className="text-xs font-bold text-white bg-gray-800 px-2 py-0.5 rounded-full shadow">
          {listening ? 'వినుతున్నాను...' : '🎙️ Voice'}
        </span>
      </div>
    </>
  );
}
