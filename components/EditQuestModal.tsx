'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { ClientQuest, AttributeType, DifficultyType, QuestCategory } from '@/lib/types';
import { DIFFICULTY_REWARDS } from '@/lib/rpg-engine';
import { sound } from '@/lib/audio';

interface EditQuestModalProps {
  quest: ClientQuest | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: {
    title: string;
    description?: string;
    category: QuestCategory;
    attribute: AttributeType;
    difficulty: DifficultyType;
    dueDate?: string;
  }) => Promise<void>;
}

export default function EditQuestModal({
  quest,
  isOpen,
  onClose,
  onSubmit,
}: EditQuestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('DAILY');
  const [attribute, setAttribute] = useState<AttributeType>('INTELLECT');
  const [difficulty, setDifficulty] = useState<DifficultyType>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description || '');
      setCategory(quest.category);
      setAttribute(quest.attribute);
      setDifficulty(quest.difficulty);
      setDueDate(quest.dueDate ? quest.dueDate.split('T')[0] : '');
    }
  }, [quest]);

  if (!isOpen || !quest) return null;

  const currentRewards = DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.MEDIUM;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(quest.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        attribute,
        difficulty,
        dueDate: dueDate || undefined,
      });
      sound.playClick();
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to update quest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const attributes: { type: AttributeType; label: string; icon: string }[] = [
    { type: 'STRENGTH', label: 'Strength', icon: '⚔️' },
    { type: 'INTELLECT', label: 'Intellect', icon: '🔮' },
    { type: 'VITALITY', label: 'Vitality', icon: '🌿' },
    { type: 'AGILITY', label: 'Agility', icon: '⚡' },
    { type: 'CHARISMA', label: 'Charisma', icon: '🎭' },
  ];

  const difficulties: DifficultyType[] = ['TRIVIAL', 'EASY', 'MEDIUM', 'HARD', 'LEGENDARY'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-rpg-border bg-rpg-darker p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-rpg-border/60 pb-4">
          <h2 className="text-lg font-bold text-amber-400">Modify Quest Scrolls</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-950/40 border border-red-800/60 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Attribute
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {attributes.map((a) => (
                <button
                  key={a.type}
                  type="button"
                  onClick={() => setAttribute(a.type)}
                  className={`rounded-lg py-2 px-1 text-center text-xs font-medium border ${
                    attribute === a.type
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <div>{a.icon}</div>
                  <div className="text-[10px] mt-0.5">{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {difficulties.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`rounded-lg py-2 px-1 text-center text-xs font-medium border ${
                    difficulty === d
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-300 flex justify-between">
            <span>Updated Yield:</span>
            <span className="font-bold">+{currentRewards.xp} XP • +{currentRewards.gold} GP • +{currentRewards.attributeBonus} {attribute}</span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-rpg-border/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-rpg-darkest hover:bg-amber-400 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Update Quest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
