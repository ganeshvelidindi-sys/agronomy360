'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { Language } from './translations';
import { UserDB } from './db';


export interface User {
  id: string;
  name: string;
  role: 'farmer' | 'buyer';
  phone?: string;
  email?: string;
  location: string;
  verified: boolean;
}

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  cartCount: number;
  setCartCount: (n: number) => void;
  notifications: Notification[];
  markAllRead: () => void;
  unreadCount: number;
  addNotification: (n: { title: string; message: string; type?: 'order' | 'price' | 'scheme' | 'message' }) => void;
  toastNotification: Notification | null;
  dismissToast: () => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'price' | 'scheme' | 'message';
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'New Buyer Inquiry',
    message: 'Suresh Mehta is interested in your Basmati Rice listing.',
    time: '5 min ago',
    read: false,
    type: 'message',
  },
  {
    id: 'n2',
    title: 'Mandi Price Alert',
    message: 'Turmeric price rose by ₹15/kg in Nizamabad today.',
    time: '1 hour ago',
    read: false,
    type: 'price',
  },
  {
    id: 'n3',
    title: 'Scheme Deadline',
    message: 'PM-KISAN next instalment release: Apply before Sep 30.',
    time: '2 hours ago',
    read: false,
    type: 'scheme',
  },
  {
    id: 'n4',
    title: 'Order Confirmed',
    message: 'Your escrow payment of ₹42,000 has been secured successfully.',
    time: 'Yesterday',
    read: true,
    type: 'order',
  },
];

const AppContext = createContext<AppContextType>({
  lang: 'en',
  setLang: () => {},
  user: null,
  setUser: () => {},
  cartCount: 0,
  setCartCount: () => {},
  notifications: [],
  markAllRead: () => {},
  unreadCount: 0,
  addNotification: () => {},
  toastNotification: null,
  dismissToast: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [user, setUserState] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load user and language from localStorage on mount, purging dummy test data
  useEffect(() => {
    try {
      UserDB.purgeFakeAndUnwantedData();
      const savedUser = localStorage.getItem('agronomy360_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const isFake = (parsed.name && (parsed.name.toLowerCase().includes('test') || parsed.name.toLowerCase().includes('dummy') || parsed.name.toLowerCase().includes('fake'))) ||
          parsed.phone === '1234567890' || parsed.phone === '0000000000';
        if (isFake && parsed.email?.toLowerCase() !== 'ganeshvelidindi@gmail.com' && parsed.phone !== '9177923765') {
          localStorage.removeItem('agronomy360_user');
          setUserState(null);
        } else {
          setUserState(parsed);
        }
      }
      const savedLang = localStorage.getItem('agronomy360_lang') as Language;
      if (['en', 'te', 'hi', 'ta', 'kn', 'mr'].includes(savedLang)) {
        setLangState(savedLang);
      } else {
        setLangState('en');
        localStorage.setItem('agronomy360_lang', 'en');
      }
    } catch {}
    setHydrated(true);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem('agronomy360_lang', l);
    } catch {}
  };

  // Persist user to localStorage
  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('agronomy360_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('agronomy360_user');
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (n: { title: string; message: string; type?: 'order' | 'price' | 'scheme' | 'message' }) => {
    const newNotif: Notification = {
      id: 'n_' + Date.now().toString(36),
      title: n.title,
      message: n.message,
      time: 'Just now',
      read: false,
      type: n.type || 'message',
    };
    setNotifications(prev => [newNotif, ...prev]);
    setToastNotification(newNotif);
    setTimeout(() => {
      setToastNotification(current => (current?.id === newNotif.id ? null : current));
    }, 4500);
  };

  const dismissToast = () => {
    setToastNotification(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!hydrated) return null;

  return (
    <SessionProvider>
      <AppContext.Provider value={{
        lang, setLang, user, setUser, cartCount, setCartCount,
        notifications, markAllRead, unreadCount,
        addNotification, toastNotification, dismissToast
      }}>
        <NextAuthSync />
        {/* Global iOS-style Light Toast Notification */}
        {toastNotification && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md animate-fade-in-up">
            <div className="bg-white/90 backdrop-blur-2xl text-gray-900 rounded-full px-5 py-3 shadow-2xl shadow-gray-300/40 flex items-center justify-between gap-3 border border-white/80">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center text-lg flex-shrink-0">
                  {toastNotification.type === 'order' ? '🌾' : toastNotification.type === 'price' ? '📈' : toastNotification.type === 'message' ? '📬' : '🔔'}
                </span>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-black text-gray-900 truncate">{toastNotification.title}</div>
                  <div className="text-[11px] text-gray-500 truncate">{toastNotification.message}</div>
                </div>
              </div>
              <button
                onClick={dismissToast}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center text-xs flex-shrink-0 transition-colors font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {children}
      </AppContext.Provider>
    </SessionProvider>
  );
}

function NextAuthSync() {
  const { data: session, status } = useSession();
  const { user, setUser } = useApp();

  useEffect(() => {
    if (status === 'authenticated' && session?.user && !user) {
      const gUser = session.user as any;
      const gEmail = gUser.email || '';
      const gName = gUser.name || 'Google User';
      const gId = gUser.id || ('g_' + (gEmail ? gEmail.replace(/[^a-z0-9]/gi, '').slice(0, 10) : Date.now().toString(36)));

      let preferredRole: 'farmer' | 'buyer' = 'farmer';
      try {
        const storedRole = sessionStorage.getItem('agr360_role');
        if (storedRole === 'farmer' || storedRole === 'buyer') {
          preferredRole = storedRole;
        } else if (typeof window !== 'undefined' && window.location.pathname.includes('/buyer')) {
          preferredRole = 'buyer';
        }
      } catch {}

      let found: any = null;
      try {
        const allUsers = UserDB.getAll();
        found = allUsers.find(
          (u: any) => u.email === gEmail || u.googleId === gId || (u.id && u.id === gId)
        );
      } catch {}

      if (!found) {
        try {
          found = UserDB.register({
            name: gName,
            phone: 'g_' + (gId.length > 10 ? gId.slice(-10) : gId),
            password: 'google_oauth_' + gId,
            role: preferredRole,
            state: 'India',
            district: 'India',
            location: 'India',
            ...({ googleId: gId, email: gEmail } as any),
          } as any);
        } catch {
          try {
            found = UserDB.getAll().find((u: any) => u.email === gEmail) || null;
          } catch {}
        }
      }

      const activeUser: User = {
        id: found?.id || gId,
        name: gName,
        role: found?.role || preferredRole,
        phone: found?.phone || '',
        location: found?.location || 'India',
        verified: true,
      };

      setUser(activeUser);
    }
  }, [session, status, user, setUser]);

  return null;
}

export function useApp() {
  return useContext(AppContext);
}

