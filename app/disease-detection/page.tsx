'use client';
import { useState, useRef } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DISEASES } from '@/lib/data';
import { Upload, Camera, Loader2, AlertTriangle, CheckCircle2, Leaf, FlaskConical, X } from 'lucide-react';

export default function DiseaseDetectionPage() {
  const { lang } = useApp();
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof DISEASES[0] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const detect = async () => {
    if (!preview) return;
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2500));
    // Simulate detection — randomly pick a disease
    setResult(DISEASES[Math.floor(Math.random() * DISEASES.length)]);
    setAnalyzing(false);
  };

  const reset = () => { setPreview(null); setResult(null); };

  const severityColor = (s: string) => s === 'High' ? 'text-red-600 bg-red-50 border-red-200' : s === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-green-600 bg-green-50 border-green-200';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-br from-red-600 to-red-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3">🔬</div>
          <h1 className="text-3xl font-black mb-2">{t(lang, 'disease')}</h1>
          <p className="text-red-100 text-lg">Upload a photo of your crop. AI detects disease, severity, and treatment instantly.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!result ? (
          <div className="card p-8">
            <h2 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
              <Camera size={22} className="text-red-600" /> {t(lang, 'uploadImage')}
            </h2>

            {/* Drop zone */}
            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-3 border-dashed border-gray-300 hover:border-[#1a5c2a] rounded-3xl p-12 text-center cursor-pointer transition-colors hover:bg-green-50 group"
              >
                <div className="w-20 h-20 bg-gray-100 group-hover:bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload size={36} className="text-gray-400 group-hover:text-[#1a5c2a] transition-colors" />
                </div>
                <p className="text-lg font-semibold text-gray-700 group-hover:text-[#1a5c2a] transition-colors">Drag & drop or click to upload</p>
                <p className="text-sm text-gray-400 mt-2">Supports JPG, PNG, WEBP, MP4 (video)</p>
                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
                  <span>📷 Leaf photo</span>
                  <span>🌿 Stem photo</span>
                  <span>🌾 Whole plant</span>
                </div>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={preview} alt="Uploaded crop" className="w-full max-h-80 object-contain bg-gray-100" />
                  <button onClick={reset} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50">
                    <X size={18} className="text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={detect}
                  disabled={analyzing}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <><Loader2 size={22} className="animate-spin" /> {t(lang, 'analyzing')}</>
                  ) : (
                    <><Camera size={22} /> {t(lang, 'detectDisease')}</>
                  )}
                </button>

                {analyzing && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-[#1a5c2a] font-semibold text-sm">🤖 AI is scanning for diseases, pests, and deficiencies...</p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-[#1a5c2a] h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[
                { icon: '📸', title: 'Clear Photo', desc: 'Take in good light, close-up on the affected leaf or area' },
                { icon: '🎯', title: 'Show Symptoms', desc: 'Include yellowing, spots, wilting, or unusual growths' },
                { icon: '📏', title: 'Multiple Angles', desc: 'Front and back of leaf for better detection accuracy' },
              ].map(tip => (
                <div key={tip.title} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{tip.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm">{tip.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{tip.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Result header */}
            <div className={`card p-6 border-2 ${severityColor(result.severity)}`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 ${severityColor(result.severity)}`}>
                  {result.severity === 'High' ? '🚨' : result.severity === 'Medium' ? '⚠️' : '✅'}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">{t(lang, 'diseaseFound')}</div>
                  <h2 className="text-2xl font-black text-gray-900">{result.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${severityColor(result.severity)}`}>
                      {t(lang, 'severity')}: {result.severity}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-50 border border-blue-200 text-blue-700">
                      {t(lang, 'confidence')}: {result.confidence}%
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-600">
                      Crop: {result.crop}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Symptoms Detected</div>
                <p className="text-gray-800 text-sm">{result.symptoms}</p>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="card overflow-hidden">
                <img src={preview} alt="Analyzed crop" className="w-full max-h-48 object-contain bg-gray-50" />
              </div>
            )}

            {/* Treatment */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf size={20} className="text-green-600" />
                  <h3 className="font-bold text-gray-900">🌿 Organic Treatment</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{result.organicTreatment}</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FlaskConical size={20} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">🧪 Chemical Treatment</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{result.chemicalTreatment}</p>
              </div>
            </div>

            <div className="card p-5 bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-900 mb-1">Dosage & Application</div>
                  <p className="text-amber-800 text-sm">{result.dosage}</p>
                  <p className="text-amber-700 text-xs mt-2 italic">{result.prevention}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary flex-1 py-3">📷 Upload Another</button>
              <button className="btn-primary flex-1 py-3">💬 Ask AI about Treatment</button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
