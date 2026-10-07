'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { CropDB } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Upload, MapPin, Calendar, ArrowLeft, CheckCircle2, ArrowRight, RefreshCw, Lock } from 'lucide-react';

const CROP_TYPES = ['Rice', 'Wheat', 'Cotton', 'Tomato', 'Onion', 'Turmeric', 'Chillies', 'Mango', 'Soybean', 'Groundnut', 'Maize', 'Jowar', 'Bajra', 'Sugarcane', 'Other'];
const QUALITY_GRADES = ['A+', 'A', 'B+', 'B', 'C'];
const UNITS = ['kg', 'quintal', 'tonne'];
const STATES = ['Andhra Pradesh', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'];

export default function ListCropPage() {
  const { user } = useApp();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    cropName: '', customName: '',
    price: '', unit: 'kg',
    quantity: '', quality: 'A',
    harvestDate: '', state: '',
    location: '', description: '',
    organic: false,
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listedId, setListedId] = useState<string | null>(null);

  const update = (field: string, val: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setError('');
  };

  // Handle image upload → convert to base64
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Image 2MB కంటే తక్కువ ఉండాలి.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="text-center card p-10 max-w-sm">
            <Lock size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-black text-gray-800 mb-2">Login అవ్వాలి</h2>
            <p className="text-gray-500 text-sm mb-6">Crop list చేయడానికి Farmer గా login అవ్వండి.</p>
            <Link href="/auth/login" className="btn-primary">Login / Register</Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="text-center card p-10 max-w-sm">
            <h2 className="text-xl font-black text-gray-800 mb-2">Farmers Only</h2>
            <p className="text-gray-500 text-sm mb-6">Crop listing only farmers చేయగలరు.</p>
            <Link href="/marketplace" className="btn-primary">Browse Marketplace</Link>
          </div>
        </div>
      </div>
    );
  }

  const validateStep1 = () => {
    const name = form.cropName === 'Other' ? form.customName : form.cropName;
    if (!name) { setError('Crop name select/enter చేయండి.'); return false; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) { setError('Valid price enter చేయండి.'); return false; }
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) { setError('Valid quantity enter చేయండి.'); return false; }
    if (!form.harvestDate) { setError('Harvest date select చేయండి.'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.state) { setError('State select చేయండి.'); return false; }
    if (!form.location.trim()) { setError('Location/Village name enter చేయండి.'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const finalName = form.cropName === 'Other' ? form.customName : form.cropName;
    const crop = CropDB.add({
      farmerId: user.id,
      farmerName: user.name,
      farmerPhone: user.phone || '',
      farmerLocation: user.location,
      farmerRating: 4.5,
      farmerVerified: user.verified,
      name: finalName,
      category: form.cropName === 'Other' ? 'Other' : form.cropName,
      price: Number(form.price),
      unit: form.unit,
      quantity: Number(form.quantity),
      qualityGrade: form.quality,
      harvestDate: form.harvestDate,
      description: form.description,
      organic: form.organic,
      state: form.state,
      location: form.location,
      imageUrl,
    });

    setListedId(crop.id);
    setLoading(false);
  };

  // Success screen
  if (listedId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="card p-10 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Crop Listed! 🎉</h2>
            <p className="text-gray-600 mb-5 text-sm">మీ పంట ఇప్పుడు marketplace లో live గా ఉంది. Buyers directly మీకు contact చేస్తారు.</p>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left text-sm text-green-800 space-y-1.5">
              <p className="font-bold mb-2">✅ తర్వాత ఏం జరుగుతుంది:</p>
              <p>• Buyers మీ listing browse చేస్తారు</p>
              <p>• Chat / Call ద్వారా contact చేస్తారు</p>
              <p>• Directly negotiate చేయవచ్చు — మధ్యవర్తి లేడు</p>
              <p>• Payment మీ bank account కి నేరుగా</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/marketplace/${listedId}`} className="flex-1 btn-primary text-center text-sm py-3">View My Listing</Link>
              <Link href="/dashboard/farmer" className="flex-1 btn-secondary text-center text-sm py-3">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/farmer" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">🌾 పంట జాబితా చేయండి</h1>
            <p className="text-sm text-gray-500">మీ పంటను నేరుగా buyers కి sell చేయండి</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Crop Details', 'Location', 'Review'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-[#1a5c2a] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === i + 1 ? 'text-[#1a5c2a]' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className={`h-0.5 flex-1 rounded ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold mb-4">⚠️ {error}</div>}

          {/* STEP 1: Crop Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">పంట వివరాలు</h2>

              {/* Crop photo */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">పంట ఫోటో <span className="text-gray-400 font-normal normal-case">— Optional</span></label>
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="Crop" className="w-full h-48 object-cover rounded-2xl" />
                    <button onClick={() => setImageUrl(null)} className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1 text-xs font-bold shadow">✕ Remove</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#1a5c2a] hover:bg-green-50 transition-all">
                    <Upload size={32} className="text-gray-300" />
                    <span className="text-sm text-gray-500 text-center">మీ పంట ఫోటో upload చేయండి<br /><span className="text-xs text-gray-400">JPG/PNG · 2MB max</span></span>
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  </label>
                )}
              </div>

              {/* Crop type */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">పంట పేరు *</label>
                <select value={form.cropName} onChange={e => update('cropName', e.target.value)} className="input-field">
                  <option value="">-- పంట select చేయండి --</option>
                  {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {form.cropName === 'Other' && (
                  <input type="text" value={form.customName} onChange={e => update('customName', e.target.value)} placeholder="పంట పేరు enter చేయండి" className="input-field mt-2" />
                )}
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="e.g. 45" className="input-field" min="1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Per Unit *</label>
                  <select value={form.unit} onChange={e => update('unit', e.target.value)} className="input-field">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Quantity & Quality */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Quantity *</label>
                  <input type="number" value={form.quantity} onChange={e => update('quantity', e.target.value)} placeholder={`Amount in ${form.unit}`} className="input-field" min="1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Quality Grade</label>
                  <select value={form.quality} onChange={e => update('quality', e.target.value)} className="input-field">
                    {QUALITY_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Harvest Date *</label>
                <input type="date" value={form.harvestDate} onChange={e => update('harvestDate', e.target.value)} className="input-field" />
              </div>

              {/* Organic */}
              <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-200 cursor-pointer hover:border-green-400 transition-colors">
                <input type="checkbox" checked={form.organic} onChange={e => update('organic', e.target.checked)} className="w-5 h-5 accent-green-600" />
                <div>
                  <span className="font-bold text-gray-800 text-sm">🌱 Organic Product</span>
                  <p className="text-xs text-gray-500">ఎటువంటి pesticides లేదా chemicals లేకుండా పెంచారు</p>
                </div>
              </label>

              <button onClick={() => { if (validateStep1()) setStep(2); }} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                తదుపరి <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">📍 Location వివరాలు</h2>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">State *</label>
                <select value={form.state} onChange={e => update('state', e.target.value)} className="input-field">
                  <option value="">-- State select చేయండి --</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Village / Town / District *</label>
                <input type="text" value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Karimnagar, Telangana" className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description <span className="text-gray-400 font-normal normal-case">— Optional</span></label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="మీ పంట గురించి buyers కి చెప్పండి — quality, growing conditions, etc." rows={3} className="input-field resize-none" />
              </div>

              {/* Summary card */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm">
                <p className="font-bold text-green-800 mb-2">📋 Summary:</p>
                <div className="space-y-1 text-green-700">
                  <p>🌾 {form.cropName === 'Other' ? form.customName : form.cropName} — Grade {form.quality} {form.organic ? '🌱 Organic' : ''}</p>
                  <p>💰 ₹{form.price}/{form.unit} · {form.quantity} {form.unit}</p>
                  <p>📅 Harvest: {form.harvestDate || '—'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 flex items-center justify-center gap-2">
                  {loading ? <><RefreshCw size={18} className="animate-spin" /> Listing...</> : <><CheckCircle2 size={18} /> List Crop 🌾</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
