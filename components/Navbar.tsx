'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/context';
import { t, LANGUAGES } from '@/lib/translations';
import {
  Menu, X, ShoppingCart, User, Globe, Bell,
  Home, Store, Bot, Leaf, CreditCard, Camera,
  TrendingUp, Users, FileText, BarChart3, ChevronDown
} from 'lucide-react';

const NAV_LINKS = [
  { key: 'marketplace', href: '/marketplace', icon: Store },
  { key: 'advisor', href: '/advisor', icon: Leaf },
  { key: 'chatbot', href: '/chatbot', icon: Bot },
  { key: 'disease', href: '/disease-detection', icon: Camera },
  { key: 'loans', href: '/loans', icon: CreditCard },
  { key: 'prices', href: '/market-prices', icon: TrendingUp },
  { key: 'forum', href: '/forum', icon: Users },
  { key: 'schemes', href: '/schemes', icon: FileText },
];

export default function Navbar() {
  const { lang, setLang, user, cartCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#1a5c2a]">
              <Image src="/logo.jpg" alt="AGRONOMY 360" width={40} height={40} className="object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-[#1a5c2a] font-black text-lg leading-none">AGRONOMY</div>
              <div className="text-[#f5a623] font-black text-sm leading-none tracking-widest">360</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.slice(0, 5).map(({ key, href, icon: Icon }) => (
              <Link
                key={key}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#1a5c2a] hover:bg-green-50 transition-all"
              >
                <Icon size={15} />
                {t(lang, key)}
              </Link>
            ))}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#1a5c2a] hover:bg-green-50 transition-all">
                More <ChevronDown size={14} />
              </button>
              <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 hidden group-hover:block">
                {NAV_LINKS.slice(5).map(({ key, href, icon: Icon }) => (
                  <Link key={key} href={href} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-[#1a5c2a]">
                    <Icon size={14} />
                    {t(lang, key)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#1a5c2a] hover:text-[#1a5c2a] transition-all"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === lang)?.nativeName}</span>
                <ChevronDown size={12} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {LANGUAGES.map(({ code, nativeName, name, flag }) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-green-50 transition-colors ${lang === code ? 'text-[#1a5c2a] font-semibold bg-green-50' : 'text-gray-700'}`}
                    >
                      <span>{flag}</span>
                      <span>{nativeName}</span>
                      <span className="text-gray-400 text-xs ml-auto">{name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Cart */}
            <Link href="/marketplace" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f5a623] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <Link href="/dashboard/farmer" className="flex items-center gap-2 bg-[#1a5c2a] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#15803d] transition-colors">
                <User size={16} />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm font-semibold text-gray-700 hover:text-[#1a5c2a] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {t(lang, 'login')}
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                  {t(lang, 'signup')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pb-4 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pt-4">
            {NAV_LINKS.map(({ key, href, icon: Icon }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl bg-gray-50 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#1a5c2a] transition-all"
              >
                <Icon size={18} className="text-[#1a5c2a]" />
                {t(lang, key)}
              </Link>
            ))}
          </div>
          {!user && (
            <div className="flex gap-3 mt-4">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-secondary text-center text-sm py-2.5">
                {t(lang, 'login')}
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-center text-sm py-2.5">
                {t(lang, 'signup')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
