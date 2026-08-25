'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from './translations';

interface User {
  id: string;
  name: string;
  role: 'farmer' | 'buyer';
  phone: string;
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
}

const AppContext = createContext<AppContextType>({
  lang: 'en',
  setLang: () => {},
  user: null,
  setUser: () => {},
  cartCount: 0,
  setCartCount: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  return (
    <AppContext.Provider value={{ lang, setLang, user, setUser, cartCount, setCartCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
