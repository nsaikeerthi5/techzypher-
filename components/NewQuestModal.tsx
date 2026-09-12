'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Coins, Zap, Shield, PlusCircle } from 'lucide-react';
import { AttributeType, DifficultyType, QuestCategory } from '@/lib/types';
import { DIFFICULTY_REWARDS } from '@/lib/rpg-engine';
import { sound } from '@/lib/audio';

interface NewQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    category: QuestCategory;
    attribute: AttributeType;
    difficulty: DifficultyType;
    dueDate?: string;
  }) => Promise<void>;
}

export default function NewQuestModal({ isOpen, onClose, onSubmit }: NewQuestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('DAILY');
  const [attribute, setAttribute] = useState<AttributeType>('INTELLECT');
  const [difficulty, setDifficulty] = useState<DifficultyType>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentRewards = DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.MEDIUM;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a quest title.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        attribute,
        difficulty,
        dueDate: dueDate || undefined,
      });
      sound.playClick();
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('DAILY');
      setAttribute('INTELLECT');
      setDifficulty('MEDIUM');
      setDueDate('');
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to create quest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const attributes: { type: AttributeType; label: string; icon: string; desc: string }[] = [
    { type: 'STRENGTH', label: 'Strength', icon: '⚔️', desc: 'Fitness, gym, sports, posture' },
    { type: 'INTELLECT', label: 'Intellect', icon: '🔮', desc: 'Coding, studying, reading, logic' },
    { type: 'VITALITY', label: 'Vitality', icon: '🌿', desc: 'Sleep, nutrition, hydration, health' },
    { type: 'AGILITY', label: 'Agility', icon: '⚡', desc: 'Errands, swift chores, organization' },
    { type: 'CHARISMA', label: 'Charisma', icon: '🎭', desc: 'Networking, outreach, social, speech' },
  ];

  const difficulties: { type: DifficultyType; label: string; sub: string }[] = [
    { type: 'TRIVIAL', label: 'Trivial', sub: 'Quick (<5m)' },
    { type: 'EASY', label: 'Easy', sub: 'Minor (~15m)' },
    { type: 'MEDIUM', label: 'Medium', sub: 'Standard (~30m)' },
    { type: 'HARD', label: 'Hard', sub: 'Challenging (1-2h)' },
    { type: 'LEGENDARY', label: 'Legendary', sub: 'Epic Project' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-rpg-border bg-rpg-darker p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rpg-border/60 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📜</span>
            <h2 id="modal-title" className="text-lg font-bold text-amber-400">
              Forge New Quest
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-950/40 border border-red-800/60 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Quest Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Code Next.js API endpoints, 45m Gym Workout..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Quest Lore / Details (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add specifics, subtasks, or personal motivation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Quest Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'DAILY' as QuestCategory, label: '📜 Daily Bounty' },
                { type: 'HABIT' as QuestCategory, label: '🔄 Habit' },
                { type: 'TODO' as QuestCategory, label: '🎯 Side Quest' },
              ].map((cat) => (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setCategory(cat.type);
                  }}
                  className={`rounded-lg py-2 px-3 text-xs font-medium border transition-colors ${
                    category === cat.type
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-sm'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Associated Attribute */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Character Attribute to Level Up
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {attributes.map((attr) => (
                <button
                  key={attr.type}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAttribute(attr.type);
                  }}
                  className={`flex flex-col items-start rounded-xl p-2.5 text-left border transition-all ${
                    attribute === attr.type
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/10'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold">
                    <span>{attr.icon}</span>
                    <span>{attr.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{attr.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {difficulties.map((diff) => (
                <button
                  key={diff.type}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setDifficulty(diff.type);
                  }}
                  className={`flex flex-col items-center justify-center rounded-lg py-2 px-1 text-center border transition-all ${
                    difficulty === diff.type
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs">{diff.label}</span>
                  <span className="text-[9px] text-slate-500">{diff.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Rewards Calculation Preview Card */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block mb-1.5">
              ⚖️ Calculated Server Rewards on Completion:
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">XP Gain</span>
                <span className="font-bold text-amber-300">+{currentRewards.xp} XP</span>
              </div>
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Gold Pieces</span>
                <span className="font-bold text-amber-400">+{currentRewards.gold} GP</span>
              </div>
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{attribute}</span>
                <span className="font-bold text-emerald-400">+{currentRewards.attributeBonus} Stat</span>
              </div>
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Boss Hit</span>
                <span className="font-bold text-red-400">-{currentRewards.bossDamage} HP</span>
              </div>
            </div>
          </div>

          {/* Optional Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-rpg-border/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-rpg-darkest hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isSubmitting ? 'Inscribing...' : 'Inscribe Quest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
