'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, LogOut, Flame, Coins, Shield, User as UserIcon } from 'lucide-react';
import { sound } from '@/lib/audio';

interface NavbarProps {
  username: string;
  heroName: string;
  level: number;
  gold: number;
  streak: number;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  username,
  heroName,
  level,
  gold,
  streak,
  onLogout,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sound.getIsMuted());
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playClick();
    }
  };

  const navItems = [
    { id: 'quests', label: 'Quest Board', icon: '⚔️' },
    { id: 'character', label: 'Hero Stats', icon: '🛡️' },
    { id: 'shop', label: 'Bazaar & Armory', icon: '💰' },
    { id: 'boss', label: 'Boss Raid', icon: '🐉' },
    { id: 'history', label: 'Chronicles', icon: '📜' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rpg-border/60 bg-rpg-darker/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('quests')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 text-white font-bold text-xl ring-1 ring-amber-400/40">
            ⚔️
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-amber-400 uppercase">
              Aethelgard
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block font-mono tracking-tight">
              Life RPG Progression
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Desktop */}
        <nav className="hidden md:flex items-center space-x-1 rounded-xl bg-rpg-darkest/70 p-1 border border-rpg-border/60" aria-label="Main Navigation">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Stats & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Streak Badge */}
          <div
            className="flex items-center space-x-1.5 rounded-lg border border-orange-500/30 bg-orange-950/20 px-2.5 py-1 text-xs font-semibold text-orange-400"
            title={`${streak} consecutive days of productivity! Multiplier bonus active!`}
          >
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            <span>{streak}d Streak</span>
          </div>

          {/* Gold Coin Purse */}
          <div
            className="flex items-center space-x-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 px-2.5 py-1 text-xs font-semibold text-amber-300"
            title={`${gold} Gold Pieces available to spend in Bazaar`}
          >
            <Coins className="h-4 w-4 text-amber-400" />
            <span>{gold.toLocaleString()} GP</span>
          </div>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            title={isMuted ? 'Sound Muted (Click to enable)' : 'Sound Enabled (Click to mute)'}
            className={`rounded-lg p-2 text-xs font-medium border transition-colors ${
              isMuted
                ? 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'border-amber-500/40 bg-amber-950/30 text-amber-400 hover:bg-amber-950/50'
            }`}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Depart from Aethelgard (Logout)"
            aria-label="Logout"
            className="flex items-center space-x-1 rounded-lg border border-red-900/40 bg-red-950/20 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-rpg-border/40 gap-1 bg-rpg-darkest/60">
        {navItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex shrink-0 items-center space-x-1.5 rounded-lg px-3 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
