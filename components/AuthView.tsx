'use client';

import React, { useState } from 'react';
import { Shield, Sparkles, Sword, User, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { sound } from '@/lib/audio';

interface AuthViewProps {
  onSuccess: (userData: any) => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [heroName, setHeroName] = useState('');
  const [heroClass, setHeroClass] = useState('Paladin');
  const [avatar, setAvatar] = useState('paladin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const heroClasses = [
    { id: 'paladin', name: 'Paladin', icon: '🛡️', role: 'Guardian of Discipline' },
    { id: 'mage', name: 'Mage', icon: '🔮', role: 'Architect of Intellect' },
    { id: 'rogue', name: 'Rogue', icon: '🗡️', role: 'Master of Swift Agility' },
    { id: 'warrior', name: 'Berserker', icon: '⚔️', role: 'Titan of Raw Strength' },
    { id: 'ranger', name: 'Ranger', icon: '🏹', role: 'Seeker of Vitality & Focus' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email || username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to login');
        sound.playClick();
        onSuccess(data.user);
      } else {
        // Register
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            username,
            password,
            heroName: heroName || username,
            heroClass,
            avatar,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register');
        sound.playLevelUp();
        onSuccess(data.user);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    sound.playClick();
    setEmail('hero@aethelgard.rpg');
    setUsername('AethelgardHero');
    setPassword('password123');
    setHeroName('Sir Galahad');
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-rpg-darker via-rpg-darkest to-black p-6 sm:p-8 shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Brand & Crest */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-3xl shadow-xl shadow-amber-500/20 border border-amber-400/40 animate-pulse-slow">
              ⚔️
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-wider text-amber-400 uppercase">
              Aethelgard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isLogin ? 'Welcome back, noble champion. Resume your saga.' : 'Forge a new legend. Inscribe your name in the annals.'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="mt-6 flex rounded-xl bg-rpg-darkest p-1 border border-rpg-border">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                isLogin
                  ? 'bg-amber-500 text-rpg-darkest shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to Guild
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                !isLogin
                  ? 'bg-amber-500 text-rpg-darkest shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Awaken New Hero
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            {!isLogin && (
              <>
                {/* Hero Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Hero Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g., Kaelen Sunstrider"
                      value={heroName}
                      onChange={(e) => setHeroName(e.target.value)}
                      className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 pl-9 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                    <Sword className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                {/* Hero Class Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Choose Your Heroic Archetype
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {heroClasses.map((cls) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setHeroClass(cls.name);
                          setAvatar(cls.id);
                        }}
                        className={`flex flex-col items-center rounded-xl p-2 text-center border transition-all ${
                          heroClass === cls.name
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-850'
                        }`}
                      >
                        <span className="text-xl">{cls.icon}</span>
                        <span className="text-xs mt-0.5">{cls.name}</span>
                        <span className="text-[9px] text-slate-500 line-clamp-1">{cls.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email / Username */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {isLogin ? 'Email or Hero Username' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type={isLogin ? 'text' : 'email'}
                  required
                  placeholder={isLogin ? 'hero@aethelgard.rpg or hero' : 'hero@aethelgard.rpg'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 pl-9 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Unique Guild Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="hero123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 pl-9 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Secret Rune (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 pl-9 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 px-4 text-xs font-black text-rpg-darkest uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Attuning...' : isLogin ? 'Enter Aethelgard' : 'Inscribe Legend'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Button for Judges & Evaluators */}
          <div className="mt-5 pt-4 border-t border-rpg-border/60 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Autofill Demo Credentials</span>
            </button>
            <p className="text-[10px] text-slate-500 mt-1.5">
              If new demo user, click "Awaken New Hero" & autofill to register instantly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
