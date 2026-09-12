'use client';

import React from 'react';
import { Shield, Brain, Heart, Zap, Sparkles, Award } from 'lucide-react';

interface AttributesRadarProps {
  character: any;
}

export default function AttributesRadar({ character }: AttributesRadarProps) {
  if (!character) return null;

  const stats = [
    {
      key: 'strength',
      total: character.totalStrength || character.strength || 10,
      base: character.strength || 10,
      bonus: character.bonusStrength || 0,
      name: 'Strength (STR)',
      icon: '⚔️',
      color: 'red',
      bgColor: 'bg-red-500',
      border: 'border-red-900/50',
      bgCard: 'bg-red-950/20',
      textColor: 'text-red-400',
      realWorldDesc: 'Gym workouts, strength training, calisthenics, physical endurance, and active movement.',
    },
    {
      key: 'intellect',
      total: character.totalIntellect || character.intellect || 10,
      base: character.intellect || 10,
      bonus: character.bonusIntellect || 0,
      name: 'Intellect (INT)',
      icon: '🔮',
      color: 'purple',
      bgColor: 'bg-purple-500',
      border: 'border-purple-900/50',
      bgCard: 'bg-purple-950/20',
      textColor: 'text-purple-400',
      realWorldDesc: 'Software engineering, reading books, studying research, solving complex algorithms, and deep focus.',
    },
    {
      key: 'vitality',
      total: character.totalVitality || character.vitality || 10,
      base: character.vitality || 10,
      bonus: character.bonusVitality || 0,
      name: 'Vitality (VIT)',
      icon: '🌿',
      color: 'emerald',
      bgColor: 'bg-emerald-500',
      border: 'border-emerald-900/50',
      bgCard: 'bg-emerald-950/20',
      textColor: 'text-emerald-400',
      realWorldDesc: '8 hours of sleep, drinking 2L+ water, balanced meals, meditation, and physical recovery.',
    },
    {
      key: 'agility',
      total: character.totalAgility || character.agility || 10,
      base: character.agility || 10,
      bonus: character.bonusAgility || 0,
      name: 'Agility (AGI)',
      icon: '⚡',
      color: 'cyan',
      bgColor: 'bg-cyan-500',
      border: 'border-cyan-900/50',
      bgCard: 'bg-cyan-950/20',
      textColor: 'text-cyan-400',
      realWorldDesc: 'Quick errands, clearing your room desk, inbox zero, organization, and rapid execution speed.',
    },
    {
      key: 'charisma',
      total: character.totalCharisma || character.charisma || 10,
      base: character.charisma || 10,
      bonus: character.bonusCharisma || 0,
      name: 'Charisma (CHA)',
      icon: '🎭',
      color: 'pink',
      bgColor: 'bg-pink-500',
      border: 'border-pink-900/50',
      bgCard: 'bg-pink-950/20',
      textColor: 'text-pink-400',
      realWorldDesc: 'Public speaking, networking, reaching out to mentors, pair programming, and compassionate leadership.',
    },
  ];

  const getRankTitle = (val: number) => {
    if (val >= 50) return 'Grandmaster';
    if (val >= 35) return 'Master';
    if (val >= 25) return 'Veteran';
    if (val >= 15) return 'Adept';
    return 'Apprentice';
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-2xl border border-rpg-border bg-rpg-darker p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🛡️</span>
              <h2 className="text-xl font-bold text-amber-400">Hero Attributes & Mastery</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Every real-world quest you complete directly channels growth into your character’s attributes. Equip weapons and relics to amplify these stats even further.
            </p>
          </div>

          <div className="flex items-center space-x-3 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-2.5">
            <Award className="h-6 w-6 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Stat Power</div>
              <div className="text-base font-black text-amber-300">
                {stats.reduce((acc, s) => acc + s.total, 0)} Points
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attribute Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const rank = getRankTitle(stat.total);
          const percent = Math.min(100, Math.round((stat.total / 60) * 100));

          return (
            <div
              key={stat.key}
              className={`rounded-2xl border ${stat.border} ${stat.bgCard} p-5 flex flex-col justify-between transition-all hover:scale-[1.01] shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <h3 className={`font-bold text-sm sm:text-base ${stat.textColor}`}>{stat.name}</h3>
                      <span className="text-[11px] text-slate-400">{rank} Tier</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-slate-100">{stat.total}</span>
                    {stat.bonus > 0 && (
                      <span className="text-xs text-amber-400 block font-medium">
                        (+{stat.bonus} gear)
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Mastery Progress</span>
                    <span>{stat.total} / 60 Cap</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${stat.bgColor} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Empowered by:</span>
                <p className="text-[11px] leading-relaxed">{stat.realWorldDesc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
