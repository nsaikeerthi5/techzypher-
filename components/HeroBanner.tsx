'use client';

import React from 'react';
import { Shield, Sparkles, Sword, Award, Zap, Heart, Brain, Flame, Coffee } from 'lucide-react';
import { CharacterWithInventory } from '@/lib/types';
import { getXpRequiredForLevel } from '@/lib/rpg-engine';

interface HeroBannerProps {
  character: any;
  onOpenStats?: () => void;
}

export default function HeroBanner({ character, onOpenStats }: HeroBannerProps) {
  if (!character) return null;

  const level = character.level || 1;
  const currentXp = character.currentXp || 0;
  const xpNeeded = character.xpToNextLevel || getXpRequiredForLevel(level);
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXp / xpNeeded) * 100)));

  // Streaks multiplier
  const streak = character.currentStreak || 0;
  const streakMultiplierPercent = Math.min(50, streak * 5);

  // Avatar Icons map
  const avatarMap: Record<string, string> = {
    warrior: '⚔️',
    mage: '🔮',
    rogue: '🗡️',
    paladin: '🛡️',
    ranger: '🏹',
  };

  const avatarEmoji = avatarMap[character.avatar] || '⚔️';

  const equipped = character.equippedItems || {};

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rpg-border/80 bg-gradient-to-br from-rpg-darker via-rpg-surface/80 to-rpg-darker p-5 sm:p-6 shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Section: Avatar & Identity */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-900/40 border-2 border-amber-500/60 shadow-lg shadow-amber-500/10 text-3xl sm:text-4xl">
              {avatarEmoji}
            </div>
            {/* Level Badge overlaid */}
            <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-rpg-darkest font-black text-xs ring-2 ring-rpg-darker shadow-md" title={`Hero Level ${level}`}>
              L{level}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-wide text-slate-100">
                {character.heroName}
              </h2>
              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                {character.heroClass || 'Wanderer'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Rank {level} Adventurer • {streak > 0 ? (
                <span className="text-orange-400 font-medium">🔥 {streak} Day Streak (+{streakMultiplierPercent}% XP/Gold)</span>
              ) : (
                <span>Complete a quest today to begin your streak!</span>
              )}
            </p>

            {/* Equipped gear pills */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-slate-500">Gear:</span>
              <span className="inline-flex items-center space-x-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700">
                <span>⚔️</span>
                <span>{equipped.weapon ? equipped.weapon.name : 'Unarmed'}</span>
              </span>
              <span className="inline-flex items-center space-x-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700">
                <span>🛡️</span>
                <span>{equipped.armor ? equipped.armor.name : 'Tattered Tunic'}</span>
              </span>
              {equipped.relic && (
                <span className="inline-flex items-center space-x-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-amber-300 border border-amber-500/40">
                  <span>✨</span>
                  <span>{equipped.relic.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Non-Linear XP Bar & Core Attributes */}
        <div className="flex-1 lg:max-w-xl flex flex-col space-y-3">
          {/* Level Progress Gauge */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-amber-400 flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
                <span>Experience Progression (Level {level} → {level + 1})</span>
              </span>
              <span className="text-slate-300 font-mono">
                {currentXp.toLocaleString()} / {xpNeeded.toLocaleString()} XP ({xpPercent}%)
              </span>
            </div>
            
            {/* The XP Gauge with Glowing Animation */}
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-900 border border-amber-500/30 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-700 ease-out shadow-lg shadow-amber-500/50"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Next rank requires {xpNeeded.toLocaleString()} XP total</span>
              <span>Non-linear progression engine active</span>
            </div>
          </div>

          {/* Quick Attribute Badges */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
            <div
              className="flex flex-col items-center justify-center rounded-xl bg-red-950/30 border border-red-900/40 p-1.5 sm:p-2 cursor-pointer hover:bg-red-900/30 transition-colors"
              title="Strength: Boosted by workouts and physical tasks"
              onClick={onOpenStats}
            >
              <span className="text-xs text-red-400 font-bold flex items-center gap-1">⚔️ STR</span>
              <span className="text-sm sm:text-base font-black text-red-300">
                {character.totalStrength || character.strength || 10}
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center rounded-xl bg-purple-950/30 border border-purple-900/40 p-1.5 sm:p-2 cursor-pointer hover:bg-purple-900/30 transition-colors"
              title="Intellect: Boosted by coding, reading, and study"
              onClick={onOpenStats}
            >
              <span className="text-xs text-purple-400 font-bold flex items-center gap-1">🔮 INT</span>
              <span className="text-sm sm:text-base font-black text-purple-300">
                {character.totalIntellect || character.intellect || 10}
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center rounded-xl bg-emerald-950/30 border border-emerald-900/40 p-1.5 sm:p-2 cursor-pointer hover:bg-emerald-900/30 transition-colors"
              title="Vitality: Boosted by sleep, nutrition, and hydration"
              onClick={onOpenStats}
            >
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">🌿 VIT</span>
              <span className="text-sm sm:text-base font-black text-emerald-300">
                {character.totalVitality || character.vitality || 10}
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center rounded-xl bg-cyan-950/30 border border-cyan-900/40 p-1.5 sm:p-2 cursor-pointer hover:bg-cyan-900/30 transition-colors"
              title="Agility: Boosted by chores, errands, and quick tasks"
              onClick={onOpenStats}
            >
              <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">⚡ AGI</span>
              <span className="text-sm sm:text-base font-black text-cyan-300">
                {character.totalAgility || character.agility || 10}
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center rounded-xl bg-pink-950/30 border border-pink-900/40 p-1.5 sm:p-2 cursor-pointer hover:bg-pink-900/30 transition-colors"
              title="Charisma: Boosted by social interactions, networking, and speaking"
              onClick={onOpenStats}
            >
              <span className="text-xs text-pink-400 font-bold flex items-center gap-1">🎭 CHA</span>
              <span className="text-sm sm:text-base font-black text-pink-300">
                {character.totalCharisma || character.charisma || 10}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
