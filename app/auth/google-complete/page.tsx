'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useApp } from '@/lib/context';
import { UserDB } from '@/lib/db';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import Image from 'next/image';

type Role = 'farmer' | 'buyer';

export default function GoogleCompletePage() {
  const { data: session, status } = useSession();
  const { setUser } = useApp();
  const [role, setRole] = useState<Role>('farmer');
  const [loading, setLoading] = useState(false);
  const [autoChecking, setAutoChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      window.location.href = '/auth/login';
      return;
    }

    // Check if this Google user already exists in our DB
    const gUser = session.user as any;
    const gPhone = 'g_' + (gUser.id || gUser.email?.replace(/[^a-z0-9]/gi, '').slice(0, 10));
    const existing = UserDB.getAll().find(
      u => (u as any).googleId === gUser.id || (u as any).email === gUser.email
    );

    if (existing) {
      // Already registered — update context and go to dashboard
      setUser({
        id: existing.id,
        name: gUser.name || existing.name,
        role: existing.role,
        phone: existing.phone,
        location: existing.location,
        verified: true,
      });
      window.location.href = existing.role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer';
    } else {
      setAutoChecking(false);
    }
  }, [session, status]);

  const handleComplete = async () => {
    if (!session?.user) return;
    setLoading(true);

    const gUser = session.user as any;
    const gPhone = 'g_' + (gUser.id || Date.now().toString(36)).slice(0, 12);

    try {
      const newUser = UserDB.register({
        name: gUser.name || 'Google User',
        phone: gPhone,
        password: 'google_oauth_' + (gUser.id || gPhone),
        role,
        state: 'India',
        district: 'India',
        location: 'India',
        ...(({ googleId: gUser.id, email: gUser.email || '' }) as any),
      } as any);

      setUser({
        id: newUser.id,
        name: gUser.name || newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        location: newUser.location,
        verified: true,
      });
      window.location.href = role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer';
    } catch {
      // Already exists — find and login
      const found = UserDB.getAll().find(u => (u as any).email === gUser.email);
      if (found) {
        setUser({ id: found.id, name: gUser.name || found.name, role: found.role, phone: found.phone, location: found.location, verified: true });
        window.location.href = found.role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer';
      }
    }
    setLoading(false);
  };

  if (status === 'loading' || autoChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-[#1a5c2a] mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">Signing you in...</p>
        </div>
      </div>
    );
  }

  const gUser = session?.user as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Google user info */}
          <div className="text-center mb-6">
            {gUser?.image && (
              <img src={gUser.image} alt={gUser.name} className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-[#1a5c2a]" />
            )}
            <h2 className="text-xl font-black text-gray-900">Welcome, {gUser?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-gray-500 text-sm mt-1">{gUser?.email}</p>
            <p className="text-gray-600 text-sm mt-2">మీరు ఎవరు? Select చేయండి:</p>
          </div>

          {/* Role picker */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['farmer', 'buyer'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                  role === r
                    ? r === 'farmer' ? 'border-[#1a5c2a] bg-green-50 text-[#1a5c2a]' : 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <span className="text-4xl">{r === 'farmer' ? '🌾' : '🏪'}</span>
                <div>
                  <div className="font-black text-sm">{r === 'farmer' ? 'Farmer' : 'Buyer'}</div>
                  <div className="text-xs opacity-60">{r === 'farmer' ? 'రైతు' : 'కొనుగోలుదారు'}</div>
                </div>
                {role === r && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>

          <button
            onClick={handleComplete}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 ${
              role === 'farmer' ? 'bg-[#1a5c2a] hover:bg-[#15803d]' : 'bg-blue-600 hover:bg-blue-700'
            } ${loading ? 'opacity-70' : ''}`}
          >
            {loading
              ? <><RefreshCw size={18} className="animate-spin" /> Setting up...</>
              : <><CheckCircle2 size={18} /> Continue as {role === 'farmer' ? 'Farmer 🌾' : 'Buyer 🏪'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
