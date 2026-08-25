'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LOAN_SCHEMES } from '@/lib/data';
import { CreditCard, Calculator, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function LoansPage() {
  const { lang } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [emi, setEmi] = useState({ amount: 100000, rate: 7, tenure: 36 });
  const [eligibility, setEligibility] = useState({ land: '', crop: '', state: '' });
  const [eligible, setEligible] = useState<boolean | null>(null);

  const calcEmi = () => {
    const r = emi.rate / 100 / 12;
    const n = emi.tenure;
    const p = emi.amount;
    if (r === 0) return p / n;
    return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  };

  const checkEligibility = () => {
    setEligible(parseFloat(eligibility.land) >= 0.5 && eligibility.crop !== '' && eligibility.state !== '');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-3">💳</div>
          <h1 className="text-3xl font-black mb-2">{t(lang, 'loans')}</h1>
          <p className="text-indigo-200 text-lg">Government loan schemes, crop insurance, and financial assistance for Indian farmers</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Loan Schemes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard size={22} className="text-indigo-600" /> {t(lang, 'loanSchemes')}
            </h2>

            {LOAN_SCHEMES.map(scheme => (
              <div key={scheme.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="text-3xl flex-shrink-0">{scheme.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{scheme.name}</h3>
                    <p className="text-sm text-gray-500">{scheme.provider}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                        Rate: {scheme.interestRate}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                        Max: ₹{scheme.maxAmount}
                      </span>
                    </div>
                  </div>
                  {expanded === scheme.id ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
                </button>

                {expanded === scheme.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed">{scheme.description}</p>

                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase mb-2">Eligibility</div>
                      <p className="text-sm text-gray-700">{scheme.eligibility}</p>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase mb-2">
                        <FileText size={13} className="inline mr-1" /> Required Documents
                      </div>
                      <ul className="space-y-1.5">
                        {scheme.documents.map(doc => (
                          <li key={doc} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> {doc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a href={scheme.link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 btn-primary text-sm py-3 px-5">
                      {t(lang, 'applyNow')} <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* EMI Calculator */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Calculator size={20} className="text-[#1a5c2a]" /> {t(lang, 'emiCalc')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t(lang, 'loanAmount')}</label>
                  <input
                    type="number"
                    value={emi.amount}
                    onChange={e => setEmi({ ...emi, amount: +e.target.value })}
                    className="input-field text-sm py-2"
                    placeholder="100000"
                  />
                  <input type="range" min={10000} max={1000000} step={10000} value={emi.amount}
                    onChange={e => setEmi({ ...emi, amount: +e.target.value })}
                    className="w-full mt-2 accent-[#1a5c2a]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t(lang, 'interest')}</label>
                  <input type="number" value={emi.rate} onChange={e => setEmi({ ...emi, rate: +e.target.value })} className="input-field text-sm py-2" step={0.5} min={1} max={20} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t(lang, 'tenure')}</label>
                  <select value={emi.tenure} onChange={e => setEmi({ ...emi, tenure: +e.target.value })} className="input-field text-sm py-2">
                    {[6, 12, 18, 24, 36, 48, 60, 84, 120].map(m => <option key={m} value={m}>{m} months ({m/12 < 1 ? m + ' mo' : (m/12).toFixed(1) + ' yr'})</option>)}
                  </select>
                </div>
                <div className="bg-[#1a5c2a] text-white rounded-xl p-4 text-center">
                  <div className="text-xs text-green-200 mb-1">{t(lang, 'monthlyEmi')}</div>
                  <div className="text-3xl font-black">₹{calcEmi().toLocaleString()}</div>
                  <div className="text-xs text-green-200 mt-1">per month for {emi.tenure} months</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between"><span>Principal:</span><strong>₹{emi.amount.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span>Total Interest:</span><strong>₹{(calcEmi() * emi.tenure - emi.amount).toLocaleString()}</strong></div>
                  <div className="flex justify-between border-t pt-1"><span>Total Amount:</span><strong>₹{(calcEmi() * emi.tenure).toLocaleString()}</strong></div>
                </div>
              </div>
            </div>

            {/* Eligibility Checker */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">{t(lang, 'eligibilityCheck')}</h3>
              <div className="space-y-3">
                <input type="number" value={eligibility.land} onChange={e => setEligibility({...eligibility, land: e.target.value})} placeholder={t(lang, 'landSize')} className="input-field text-sm py-2" />
                <input type="text" value={eligibility.crop} onChange={e => setEligibility({...eligibility, crop: e.target.value})} placeholder="Main crop (e.g. Rice)" className="input-field text-sm py-2" />
                <input type="text" value={eligibility.state} onChange={e => setEligibility({...eligibility, state: e.target.value})} placeholder={t(lang, 'state')} className="input-field text-sm py-2" />
                <button onClick={checkEligibility} className="btn-primary w-full py-3 text-sm">{t(lang, 'eligibilityCheck')}</button>
                {eligible !== null && (
                  <div className={`rounded-xl p-4 flex items-center gap-3 ${eligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <CheckCircle2 size={20} className={eligible ? 'text-green-600' : 'text-red-600'} />
                    <div>
                      <div className={`font-bold text-sm ${eligible ? 'text-green-800' : 'text-red-800'}`}>
                        {eligible ? '✅ You are eligible!' : '❌ May not qualify'}
                      </div>
                      <div className={`text-xs ${eligible ? 'text-green-600' : 'text-red-600'}`}>
                        {eligible ? 'Apply for KCC or crop loan at your nearest bank.' : 'Land size < 0.5 acres or missing information.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
