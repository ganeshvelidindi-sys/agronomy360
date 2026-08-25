'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CHATBOT_RESPONSES } from '@/lib/data';
import { Send, Bot, Mic, Volume2, Phone, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  { en: 'What to plant this season?', te: 'ఈ సీజన్‌లో ఏం వేయాలి?' },
  { en: 'Rice farming tips', te: 'వరి సాగు చిట్కాలు' },
  { en: 'How to get Kisan Credit Card?', te: 'కిసాన్ కార్డ్ ఎలా పొందాలి?' },
  { en: 'Fertilizer dosage for wheat', te: 'గోధుమకు ఎరువు' },
  { en: 'Current mandi prices', te: 'ఈ రోజు మండి ధరలు' },
  { en: 'Disease treatment for cotton', te: 'పత్తి వ్యాధి చికిత్స' },
];

function getResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const [key, resp] of Object.entries(CHATBOT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return resp;
  }
  if (lower.includes('season') || lower.includes('plant') || lower.includes('సీజన్') || lower.includes('వేయాలి')) {
    return CHATBOT_RESPONSES['rice'];
  }
  return CHATBOT_RESPONSES['default'];
}

export default function ChatbotPage() {
  const { lang } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: CHATBOT_RESPONSES['default'], time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const query = text || input.trim();
    if (!query) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
    const response = getResponse(query);
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: response, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in your browser. Try Chrome.');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'kn' ? 'kn-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col">
        {/* Header */}
        <div className="card p-4 mb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1a5c2a] rounded-2xl flex items-center justify-center">
            <Bot size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="font-black text-gray-900 text-lg">{t(lang, 'chatbot')}</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Online — Multilingual · Voice Input · 24/7</span>
            </div>
          </div>
          <button className="btn-secondary text-sm py-2 flex items-center gap-1.5">
            <Phone size={15} /> Expert Help
          </button>
        </div>

        {/* Quick questions */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">Quick Questions</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q.en}
                onClick={() => send(q.en)}
                className="flex-shrink-0 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:border-[#1a5c2a] hover:text-[#1a5c2a] transition-all whitespace-nowrap"
              >
                {lang === 'te' ? q.te : q.en}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 card p-4 overflow-y-auto space-y-4 mb-4" style={{ minHeight: '400px', maxHeight: '500px' }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 bg-[#1a5c2a] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1a5c2a] text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{msg.time}</span>
                  {msg.role === 'bot' && (
                    <button onClick={() => speak(msg.text)} className="text-gray-400 hover:text-[#1a5c2a]">
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-[#f5a623] rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-white">U</div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1a5c2a] rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="card p-3 flex items-center gap-2">
          <button
            onClick={startListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              listening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-[#1a5c2a]'
            }`}
            title="Voice Input"
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={t(lang, 'askChatbot') + '... (any language)'}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c2a]"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-[#1a5c2a] rounded-xl flex items-center justify-center text-white hover:bg-[#15803d] transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          AI responses are advisory. For expert advice, consult your local Krishi Vigyan Kendra.
        </p>
      </div>

      <Footer />
    </div>
  );
}
