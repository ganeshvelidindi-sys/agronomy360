'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import { Phone, Mail, MapPin, Share2, MessageSquare, PlayCircle, Camera } from 'lucide-react';

export default function Footer() {
  const { lang } = useApp();

  return (
    <footer className="bg-[#1a5c2a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/30">
                <Image src="/logo.jpg" alt="AGRONOMY 360" width={48} height={48} className="object-cover" />
              </div>
              <div>
                <div className="font-black text-xl leading-none">AGRONOMY</div>
                <div className="text-[#f5a623] font-black text-sm tracking-widest">360</div>
              </div>
            </div>
            <p className="text-green-200 text-sm leading-relaxed mb-4">
              India's most trusted direct farmer-to-buyer agricultural marketplace. Zero commission, fair prices, instant payments.
            </p>
            <div className="flex items-center gap-3">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">🔒 Secure Payments</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">✅ Verified Farmers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#f5a623]">Quick Links</h3>
            <ul className="space-y-2 text-sm text-green-200">
              {[
                { label: t(lang, 'marketplace'), href: '/marketplace' },
                { label: t(lang, 'chatbot'), href: '/chatbot' },
                { label: t(lang, 'advisor'), href: '/advisor' },
                { label: t(lang, 'disease'), href: '/disease-detection' },
                { label: t(lang, 'loans'), href: '/loans' },
                { label: t(lang, 'prices'), href: '/market-prices' },
                { label: t(lang, 'forum'), href: '/forum' },
                { label: t(lang, 'schemes'), href: '/schemes' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white hover:underline transition-colors">
                    → {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Farmers / Buyers */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#f5a623]">For Farmers</h3>
            <ul className="space-y-2 text-sm text-green-200">
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">→ Register as Farmer</Link></li>
              <li><Link href="/list-crop" className="hover:text-white transition-colors">→ List Your Crop</Link></li>
              <li><Link href="/loans" className="hover:text-white transition-colors">→ Get a Crop Loan</Link></li>
              <li><Link href="/schemes" className="hover:text-white transition-colors">→ Government Schemes</Link></li>
              <li><Link href="/disease-detection" className="hover:text-white transition-colors">→ Disease Detection</Link></li>
              <li><Link href="/advisor" className="hover:text-white transition-colors">→ Crop Advice</Link></li>
            </ul>
            <h3 className="font-bold text-lg mt-6 mb-4 text-[#f5a623]">For Buyers</h3>
            <ul className="space-y-2 text-sm text-green-200">
              <li><Link href="/marketplace" className="hover:text-white transition-colors">→ Browse Crops</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">→ Register as Buyer</Link></li>
              <li><Link href="/market-prices" className="hover:text-white transition-colors">→ Price Tracker</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#f5a623]">Contact Us</h3>
            <div className="space-y-3 text-sm text-green-200">
              <div className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-[#f5a623]" />
                <span>Kisan Helpline: 1800-180-1551</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-[#f5a623]" />
                <span>support@agronomy360.in</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="flex-shrink-0 text-[#f5a623] mt-0.5" />
                <span>Ministry of Agriculture Campus, New Delhi - 110001</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-green-300 mb-3 font-semibold">Follow Us</p>
              <div className="flex items-center gap-3">
                {[Share2, MessageSquare, PlayCircle, Camera].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <a href="#" className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                📱 App Store
              </a>
              <a href="#" className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                🤖 Play Store
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-green-300">
          <p>© 2026 AGRONOMY 360. All rights reserved. Made with ❤️ for Indian Farmers.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
            <Link href="#" className="hover:text-white">Grievance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
