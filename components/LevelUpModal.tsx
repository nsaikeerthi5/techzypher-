'use client';

import React, { useEffect } from 'react';
import { Sparkles, Trophy, Award, ArrowRight, Coins } from 'lucide-react';
import { sound } from '@/lib/audio';
import { fireLevelUpConfetti } from '@/lib/confetti';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  heroName: string;
  onClose: () => void;
}

export default function LevelUpModal({
  isOpen,
  newLevel,
  heroName,
  onClose,
}: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      sound.playLevelUp();
      fireLevelUpConfetti();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-rpg-darker via-rpg-darkest to-amber-950/30 p-8 text-center shadow-2xl box-glow-gold">
        {/* Radiance background effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Trophy Icon with animated glow */}
          <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/40 text-4xl animate-bounce-once">
            <Trophy className="h-12 w-12 text-rpg-darkest stroke-[2.5]" />
            <div className="absolute -inset-1 rounded-full border-2 border-amber-300/40 animate-ping opacity-75" />
          </div>

          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black tracking-widest text-amber-300 uppercase border border-amber-500/40">
            <Sparkles className="h-3 w-3" />
            <span>Heroic Ascent</span>
            <Sparkles className="h-3 w-3" />
          </span>

          <h2 className="mt-3 text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 uppercase">
            Level Up!
          </h2>

          <p className="mt-1 text-base text-slate-300">
            <span className="font-bold text-amber-300">{heroName}</span> has reached{' '}
            <span className="font-extrabold text-amber-400 text-xl underline decoration-amber-500/50">
              Rank {newLevel}
            </span>
            !
          </p>

          {/* Level Rewards Card */}
          <div className="mt-6 w-full rounded-2xl border border-amber-500/30 bg-rpg-darkest/80 p-4 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>Level Up Gold Bounty:</span>
              </span>
              <span className="font-bold text-amber-300">+50 GP</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Award className="h-4 w-4 text-emerald-400" />
                <span>Max Stamina & Health:</span>
              </span>
              <span className="font-bold text-emerald-300">Full Restoration</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Non-Linear Progression:</span>
              </span>
              <span className="font-mono text-slate-300">New XP Tier Unlocked</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400 italic">
            "Your persistence carves destiny into the annals of Aethelgard."
          </p>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="mt-6 flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 px-6 font-black text-rpg-darkest text-sm shadow-xl shadow-amber-500/30 hover:from-amber-400 hover:to-amber-500 transition-all transform active:scale-95"
          >
            <span>Claim Glory & Return</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
