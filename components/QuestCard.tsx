'use client';

import React, { useState } from 'react';
import { Check, Edit2, Trash2, Calendar, Flame, Sparkles, Coins } from 'lucide-react';
import { ClientQuest, AttributeType, DifficultyType } from '@/lib/types';
import { sound } from '@/lib/audio';
import { fireQuestConfetti } from '@/lib/confetti';

interface QuestCardProps {
  quest: ClientQuest;
  onToggleComplete: (id: string, originPos?: { x: number; y: number }) => Promise<void>;
  onEdit: (quest: ClientQuest) => void;
  onDelete: (id: string) => void;
}

export default function QuestCard({
  quest,
  onToggleComplete,
  onEdit,
  onDelete,
}: QuestCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [floatingRewards, setFloatingRewards] = useState<{ xp: number; gold: number } | null>(null);

  const handleCheckboxClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isUpdating) return;

    // Calculate viewport origin for confetti
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 2) / window.innerHeight;

    if (!quest.isCompleted) {
      sound.playQuestComplete();
      fireQuestConfetti(originX, originY);
      setFloatingRewards({ xp: quest.xpReward, gold: quest.goldReward });
      setTimeout(() => setFloatingRewards(null), 1200);
    } else {
      sound.playClick();
    }

    setIsUpdating(true);
    try {
      await onToggleComplete(quest.id, { x: originX, y: originY });
    } finally {
      setIsUpdating(false);
    }
  };

  // Attribute visual styling
  const attributeConfig: Record<AttributeType, { icon: string; label: string; bg: string; text: string; border: string }> = {
    STRENGTH: { icon: '⚔️', label: 'Strength', bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-800/50' },
    INTELLECT: { icon: '🔮', label: 'Intellect', bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-800/50' },
    VITALITY: { icon: '🌿', label: 'Vitality', bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/50' },
    AGILITY: { icon: '⚡', label: 'Agility', bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-800/50' },
    CHARISMA: { icon: '🎭', label: 'Charisma', bg: 'bg-pink-950/40', text: 'text-pink-400', border: 'border-pink-800/50' },
  };

  // Difficulty badge styling
  const difficultyConfig: Record<DifficultyType, { label: string; badge: string }> = {
    TRIVIAL: { label: 'Trivial', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
    EASY: { label: 'Easy', badge: 'bg-emerald-950/50 text-emerald-300 border-emerald-700/50' },
    MEDIUM: { label: 'Medium', badge: 'bg-blue-950/50 text-blue-300 border-blue-700/50' },
    HARD: { label: 'Hard', badge: 'bg-purple-950/50 text-purple-300 border-purple-700/50' },
    LEGENDARY: { label: 'Legendary', badge: 'bg-amber-950/60 text-amber-300 border-amber-500/60 shadow-sm shadow-amber-500/30' },
  };

  const attr = attributeConfig[quest.attribute] || attributeConfig.INTELLECT;
  const diff = difficultyConfig[quest.difficulty] || difficultyConfig.MEDIUM;

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        quest.isCompleted
          ? 'border-slate-800 bg-slate-950/40 opacity-70 hover:opacity-90'
          : 'border-rpg-border/70 bg-gradient-to-r from-rpg-surface/70 to-rpg-darker/80 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Tactile Checkbox */}
        <div className="relative pt-0.5">
          <button
            onClick={handleCheckboxClick}
            disabled={isUpdating}
            aria-label={quest.isCompleted ? `Mark "${quest.title}" incomplete` : `Complete quest: "${quest.title}"`}
            className={`relative flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all duration-200 active:scale-90 ${
              quest.isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-rpg-darkest shadow-md shadow-emerald-500/30'
                : 'border-amber-500/50 bg-rpg-darkest/80 hover:border-amber-400 hover:bg-amber-500/10'
            }`}
          >
            {quest.isCompleted && <Check className="h-4 w-4 stroke-[3]" />}
          </button>

          {/* Floating celebratory reward numbers on completion */}
          {floatingRewards && (
            <div className="pointer-events-none absolute -top-8 left-0 flex flex-col items-center animate-float-reward whitespace-nowrap z-30">
              <span className="font-bold text-amber-300 text-xs shadow-black drop-shadow">
                +{floatingRewards.xp} XP
              </span>
              <span className="font-bold text-amber-400 text-[10px] shadow-black drop-shadow">
                +{floatingRewards.gold} GP
              </span>
            </div>
          )}
        </div>

        {/* Quest Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {/* Category */}
            <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
              {quest.category === 'HABIT' && '🔄 Habit'}
              {quest.category === 'DAILY' && '📜 Daily'}
              {quest.category === 'TODO' && '🎯 Quest'}
              {quest.category === 'BOSS_RAID' && '🐉 Boss Raid'}
            </span>

            {/* Attribute */}
            <span
              className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-medium border ${attr.bg} ${attr.text} ${attr.border}`}
            >
              <span>{attr.icon}</span>
              <span>{attr.label}</span>
            </span>

            {/* Difficulty */}
            <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${diff.badge}`}>
              {diff.label}
            </span>

            {/* Habit/Daily Streak if applicable */}
            {quest.streakCount > 0 && (
              <span className="inline-flex items-center space-x-1 rounded bg-orange-950/40 border border-orange-800/40 px-1.5 py-0.5 text-[10px] font-medium text-orange-400">
                <Flame className="h-3 w-3 text-orange-400" />
                <span>{quest.streakCount} streak</span>
              </span>
            )}
          </div>

          <h3
            className={`text-base font-semibold leading-snug transition-colors ${
              quest.isCompleted
                ? 'line-through text-slate-500'
                : 'text-slate-100 group-hover:text-amber-300'
            }`}
          >
            {quest.title}
          </h3>

          {quest.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {quest.description}
            </p>
          )}

          {/* Bottom Row: Rewards & Due Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-rpg-border/40">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 rounded bg-amber-950/30 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>+{quest.xpReward} XP</span>
              </span>
              <span className="inline-flex items-center space-x-1 rounded bg-amber-950/30 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                <Coins className="h-3 w-3 text-amber-400" />
                <span>+{quest.goldReward} GP</span>
              </span>
            </div>

            {quest.dueDate && (
              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(quest.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              sound.playClick();
              onEdit(quest);
            }}
            title="Edit Quest"
            aria-label="Edit Quest"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onDelete(quest.id);
            }}
            title="Delete Quest"
            aria-label="Delete Quest"
            className="rounded p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
