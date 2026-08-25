'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CROPS } from '@/lib/data';
import { Camera, Upload, MapPin, Star, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';

const CROP_TYPES = ['Rice', 'Wheat', 'Cotton', 'Tomato', 'Onion', 'Turmeric', 'Chillies', 'Mango', 'Soybean', 'Groundnut', 'Other'];
const QUALITY_GRADES = ['A+', 'A', 'B+', 'B', 'C'];

export default function ListCropPage() {
  const { lang } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    cropName: '', customName: '', price: '', unit: 'kg', quantity: '', quality: 'A', harvestDate: '',
    location: '', district: '', state: '', description: '', organic: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="card p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Crop Listed! 🎉</h2>
            <p className="text-gray-600 mb-6">Your crop is now live on the marketplace. Buyers will contact you directly.</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left text-sm">
              <div className="font-semibold text-green-800 mb-2">✅ What happens next:</div>
              <ul className="space-y-1 text-green-700">
                <li>• Buyers browse your listing</li>
                <li>• They contact you via chat/call</li>
                <li>• Negotiate directly — no middleman</li>
                <li>• Get paid directly to your bank</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Link href="/marketplace" className="btn-secondary flex-1 py-3 text-sm">View Marketplace</Link>
              <Link href="/dashboard/farmer" className="btn-primary flex-1 py-3 text-sm">My Dashboard</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/marketplace" className="flex items-center gap-2 text-[#1a5c2a] font-semibold mb-6 hover:underline">
          <ArrowLeft size={18} /> Back
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">{t(lang, 'listCrop')}</h1>
          <p className="text-gray-500 mt-1">List your crop directly. Buyers contact you. Zero commission.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full transition-all ${step >= s ? 'bg-[#1a5c2a]' : 'bg-gray-200'}`} />
              <div className={`text-xs text-center mt-1 font-medium ${step >= s ? 'text-[#1a5c2a]' : 'text-gray-400'}`}>
                {s === 1 ? 'Crop Info' : s === 2 ? 'Location & Details' : 'Photos & Review'}
              </div>
            </div>
          ))}
        </div>

        <div className="card p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 text-xl">Basic Crop Information</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'cropName')} *</label>
                <select value={form.cropName} onChange={e => setForm({...form, cropName: e.target.value})} className="input-field" required>
                  <option value="">Select crop type</option>
                  {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {form.cropName === 'Other' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Custom Crop Name *</label>
                  <input type="text" value={form.customName} onChange={e => setForm({...form, customName: e.target.value})} className="input-field" placeholder="e.g. Dragon Fruit" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'price')} *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field pl-8" placeholder="42" required min="1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit *</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="input-field">
                    <option value="kg">Per Kg</option>
                    <option value="quintal">Per Quintal</option>
                    <option value="ton">Per Ton</option>
                    <option value="dozen">Per Dozen</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'quantity')} *</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input-field" placeholder="500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'quality')} *</label>
                  <select value={form.quality} onChange={e => setForm({...form, quality: e.target.value})} className="input-field">
                    {QUALITY_GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'harvestDate')}</label>
                <input type="date" value={form.harvestDate} onChange={e => setForm({...form, harvestDate: e.target.value})} className="input-field" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.organic} onChange={e => setForm({...form, organic: e.target.checked})} className="w-5 h-5 accent-[#1a5c2a]" />
                <span className="font-medium text-gray-700">🌿 This is organically grown (no synthetic pesticides/fertilizers)</span>
              </label>
              <button onClick={() => setStep(2)} disabled={!form.cropName || !form.price || !form.quantity} className="btn-primary w-full py-4 disabled:opacity-50">
                Next — Location Details →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 text-xl">Location & Description</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'state')} *</label>
                <input type="text" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="input-field" placeholder="e.g. Telangana" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'district')} *</label>
                <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="input-field" placeholder="e.g. Karimnagar" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'description')}</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field min-h-24 resize-none" placeholder="Describe variety, growing method, grade details..." rows={4} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">{t(lang, 'back')}</button>
                <button onClick={() => setStep(3)} disabled={!form.state || !form.district} className="btn-primary flex-1 py-3 disabled:opacity-50">Next — Photos →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-bold text-gray-900 text-xl">Photos & Final Review</h2>
              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t(lang, 'uploadPhoto')}</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-[#1a5c2a] hover:bg-green-50 transition-all"
                  onClick={() => document.getElementById('cropPhoto')?.click()}
                >
                  {image ? (
                    <img src={image} alt="crop" className="max-h-40 mx-auto rounded-xl object-contain" />
                  ) : (
                    <>
                      <Camera size={36} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload crop photo (JPG, PNG, WEBP)</p>
                    </>
                  )}
                  <input id="cropPhoto" type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { const r = new FileReader(); r.onload = ev => setImage(ev.target?.result as string); r.readAsDataURL(f); }
                  }} />
                </div>
              </div>

              {/* Review Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="font-bold text-gray-900 mb-3">Review Your Listing:</div>
                {[
                  ['Crop', form.cropName === 'Other' ? form.customName : form.cropName],
                  ['Price', `₹${form.price}/${form.unit}`],
                  ['Quantity', `${form.quantity} ${form.unit}s`],
                  ['Quality', `Grade ${form.quality}`],
                  ['Location', `${form.district}, ${form.state}`],
                  ['Organic', form.organic ? 'Yes ✅' : 'No'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}:</span>
                    <span className="font-semibold text-gray-900">{v || 'Not provided'}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">{t(lang, 'back')}</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {loading ? '⏳ Publishing...' : '🚀 Publish Listing'}
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
