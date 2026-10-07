'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/context';
import { t, LANGUAGES } from '@/lib/translations';
import {
  Menu, X, ShoppingCart, User, Globe, Bell,
  Store, Bot, Leaf, CreditCard, Camera,
  TrendingUp, Users, FileText, ChevronDown,
  ShoppingBag, Tractor, LogOut, LayoutDashboard,
  MessageSquare, Tag, AlertCircle, CheckCheck, Video
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const NAV_LINKS = [
  { key: 'marketplace', href: '/marketplace', icon: Store },
  { key: 'videocall', href: '/videocall', icon: Video },
  { key: 'advisor', href: '/advisor', icon: Leaf },
  { key: 'chatbot', href: '/chatbot', icon: Bot },
  { key: 'disease', href: '/disease-detection', icon: Camera },
  { key: 'loans', href: '/loans', icon: CreditCard },
  { key: 'prices', href: '/market-prices', icon: TrendingUp },
  { key: 'forum', href: '/forum', icon: Users },
  { key: 'schemes', href: '/schemes', icon: FileText },
];

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  order: <ShoppingBag size={16} className="text-green-600" />,
  price: <TrendingUp size={16} className="text-amber-500" />,
  scheme: <FileText size={16} className="text-blue-500" />,
  message: <MessageSquare size={16} className="text-purple-500" />,
};

export default function Navbar() {
  const { lang, setLang, user, setUser, notifications, markAllRead, unreadCount, cartCount } = useApp();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setUser(null);
    setUserMenuOpen(false);
    try {
      await signOut({ redirect: false });
    } catch {}
    window.location.href = '/';
  };

  const dashboardHref = user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/farmer';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-sm transition-all">
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

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
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
              <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 hidden group-hover:block z-50">
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
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); setUserMenuOpen(false); }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#1a5c2a] hover:text-[#1a5c2a] transition-all"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === lang)?.nativeName}</span>
                <ChevronDown size={12} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/80 py-2 z-50 animate-fade-in-up">
                    {LANGUAGES.map(({ code, nativeName, name, badge }) => (
                      <button
                        key={code}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLang(code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-emerald-50 transition-colors ${lang === code ? 'text-emerald-700 font-black bg-emerald-50' : 'text-gray-700'}`}
                      >
                        <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600">
                          {badge}
                        </span>
                        <span className="font-bold">{nativeName}</span>
                        <span className="text-gray-400 text-[10px] ml-auto">{name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setLangOpen(false);
                  setUserMenuOpen(false);
                }}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-[#1a5c2a] font-bold hover:underline flex items-center gap-1"
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            n.type === 'order' ? 'bg-green-100' :
                            n.type === 'price' ? 'bg-amber-100' :
                            n.type === 'scheme' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {NOTIF_ICONS[n.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                    <Link href="/schemes" onClick={() => setNotifOpen(false)} className="text-xs text-[#1a5c2a] font-bold hover:underline">
                      View all alerts →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart (buyer mode or general) */}
            <Link href="/marketplace" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors hidden sm:flex">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#f5a623] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); setLangOpen(false); }}
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                    user.role === 'farmer'
                      ? 'bg-[#1a5c2a] text-white hover:bg-[#15803d]'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <span className="text-base">{user.role === 'farmer' ? '🧑‍🌾' : '🛒'}</span>
                  <span className="hidden sm:inline font-black uppercase text-xs tracking-wider">
                    {user.role === 'farmer' ? (lang === 'te' ? 'రైతు' : 'Farmer') : (lang === 'te' ? 'బయ్యర్' : 'Buyer')}
                  </span>
                  <span className="hidden md:inline max-w-20 truncate font-medium text-xs opacity-90">({user.name.split(' ')[0]})</span>
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-black text-gray-900">{user.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          user.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'farmer' ? '🧑‍🌾 Farmer Account' : '🛒 Buyer Account'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{user.location}</p>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                    >
                      <LayoutDashboard size={16} /> My Dashboard
                    </Link>

                    {/* Role Switcher Option in dropdown */}
                    {user.role === 'farmer' ? (
                      <button
                        onClick={() => {
                          setUser({ ...user, role: 'buyer' });
                          setUserMenuOpen(false);
                          window.location.href = '/dashboard/buyer';
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors text-left"
                      >
                        <span>🛒</span>
                        <span>{lang === 'te' ? 'కొనుగోలుదారుగా మారండి' : 'Switch to Buyer Mode'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUser({ ...user, role: 'farmer' });
                          setUserMenuOpen(false);
                          window.location.href = '/dashboard/farmer';
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors text-left"
                      >
                        <span>🧑‍🌾</span>
                        <span>{lang === 'te' ? 'రైతుగా మారండి' : 'Switch to Farmer Mode'}</span>
                      </button>
                    )}

                    {user.role === 'farmer' && (
                      <Link
                        href="/list-crop"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        <Tractor size={16} /> List a Crop
                      </Link>
                    )}
                    {user.role === 'buyer' && (
                      <Link
                        href="/marketplace"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Tag size={16} /> Browse Market
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/auth/login" className="text-sm font-semibold text-gray-700 hover:text-[#1a5c2a] px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {t(lang, 'login')}
                </Link>
                <Link href="/auth/signup" className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4">
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

          {user ? (
            <div className="mt-4 flex gap-3">
              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="flex-1 btn-primary text-center text-sm py-2.5 flex items-center justify-center gap-1.5"
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 border border-red-200 text-red-600 rounded-xl text-sm py-2.5 font-bold hover:bg-red-50 flex items-center justify-center gap-1.5"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
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
