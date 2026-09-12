'use client';

import React from 'react';
import { Scroll, CheckCircle2, Trophy, ShoppingBag, Swords, Flame, Sparkles } from 'lucide-react';
import { ClientActivityLog } from '@/lib/types';

interface ActivityLogViewProps {
  logs: ClientActivityLog[];
}

export default function ActivityLogView({ logs }: ActivityLogViewProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'QUEST_COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'LEVEL_UP':
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case 'ITEM_BOUGHT':
        return <ShoppingBag className="h-4 w-4 text-blue-400" />;
      case 'ITEM_EQUIPPED':
        return <Swords className="h-4 w-4 text-purple-400" />;
      case 'HERO_AWAKENED':
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      default:
        return <Scroll className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-rpg-border bg-rpg-darker p-5 sm:p-6 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📜</span>
          <h2 className="text-xl font-bold text-amber-400">Chronicles of Valor</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Historical activity records and progression deeds permanently archived in the database.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
          <Scroll className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm">The chronicles are silent. Complete your first quest to inscribe your legacy!</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-rpg-border/70 bg-rpg-darker/80 overflow-hidden divide-y divide-slate-800/80">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-4 hover:bg-slate-800/20 transition-colors gap-3"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-700">
                  {getActionIcon(log.action)}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">
                    {log.details}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* XP and Gold indicators */}
              <div className="flex items-center space-x-2 shrink-0 text-right">
                {log.xpEarned > 0 && (
                  <span className="rounded bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                    +{log.xpEarned} XP
                  </span>
                )}
                {log.goldEarned !== 0 && (
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                      log.goldEarned > 0
                        ? 'bg-amber-950/40 border border-amber-500/30 text-amber-400'
                        : 'bg-red-950/40 border border-red-800/30 text-red-300'
                    }`}
                  >
                    {log.goldEarned > 0 ? `+${log.goldEarned} GP` : `${log.goldEarned} GP`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
