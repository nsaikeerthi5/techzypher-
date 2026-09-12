'use client';

import React from 'react';
import { Skull, Swords, Flame, Sparkles, ShieldAlert } from 'lucide-react';
import { ClientWorldBoss } from '@/lib/types';

interface WorldBossRaidProps {
  boss: ClientWorldBoss | null;
}

export default function WorldBossRaid({ boss }: WorldBossRaidProps) {
  if (!boss) return null;

  const hpPercent = Math.max(0, Math.min(100, Math.round((boss.currentHp / boss.maxHp) * 100)));

  return (
    <div className="space-y-6">
      {/* Boss Stage Card */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-red-900/60 bg-gradient-to-b from-rpg-darker via-red-950/20 to-rpg-darkest p-6 sm:p-8 shadow-2xl">
        {/* Ambient blood red glow */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Boss Avatar & Aura */}
          <div className="relative flex flex-col items-center">
            <div className="relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-3xl bg-gradient-to-b from-red-900/40 to-black/80 border-2 border-red-500/50 shadow-2xl shadow-red-900/40 text-6xl sm:text-7xl animate-pulse-glow">
              🐲
            </div>
            <div className="absolute -bottom-3 flex items-center space-x-1 rounded-full bg-red-600 px-3 py-0.5 text-xs font-black text-white shadow-md">
              <Skull className="h-3.5 w-3.5" />
              <span>Boss Level {boss.level}</span>
            </div>
          </div>

          {/* Boss Information & Dynamic HP Bar */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="rounded-md bg-red-950/80 border border-red-800/80 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                  World Raid Event
                </span>
                <span className="text-xs text-slate-400">Server-Persistent Raid Target</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-300 to-red-500 uppercase mt-1">
                {boss.name}
              </h2>
              <p className="text-xs sm:text-sm text-red-300/80 italic font-serif">
                "{boss.title}"
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-xl">
                {boss.description}
              </p>
            </div>

            {/* Boss Health Bar */}
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-red-400 flex items-center space-x-1">
                  <Flame className="h-3.5 w-3.5 text-red-500 animate-bounce" />
                  <span>Titan Health Pool</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP ({hpPercent}%)
                </span>
              </div>

              <div className="h-5 w-full rounded-full bg-slate-900 p-0.5 border border-red-900/60 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-orange-500 transition-all duration-700 ease-out shadow-lg shadow-red-500/50"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Mechanics Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rpg-border bg-rpg-darker p-5 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <Swords className="h-4 w-4" />
            <span>How to Slay the Boss</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Whenever you complete a quest on your Quest Board, your character executes an attack that deals direct server-side damage to the Behemoth.
          </p>
        </div>

        <div className="rounded-2xl border border-rpg-border bg-rpg-darker p-5 space-y-2">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
            <Flame className="h-4 w-4" />
            <span>Damage Tiers</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Trivial Quests: <span className="font-bold text-slate-200">15 Damage</span></li>
            <li>• Medium Quests: <span className="font-bold text-slate-200">75 Damage</span></li>
            <li>• Legendary Quests: <span className="font-bold text-red-400">400 Massive Damage</span></li>
          </ul>
        </div>

        <div className="rounded-2xl border border-rpg-border bg-rpg-darker p-5 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Victory & Respawn</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reducing HP to 0 slays the titan, awards massive guild achievement renown, and resurrects a higher-tier boss with even greater challenges!
          </p>
        </div>
      </div>
    </div>
  );
}
