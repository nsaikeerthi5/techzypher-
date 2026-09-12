import { DifficultyType, AttributeType } from './types';

export const DIFFICULTY_REWARDS: Record<
  DifficultyType,
  { xp: number; gold: number; bossDamage: number; attributeBonus: number }
> = {
  TRIVIAL: { xp: 10, gold: 5, bossDamage: 15, attributeBonus: 1 },
  EASY: { xp: 25, gold: 15, bossDamage: 35, attributeBonus: 2 },
  MEDIUM: { xp: 50, gold: 30, bossDamage: 75, attributeBonus: 3 },
  HARD: { xp: 100, gold: 60, bossDamage: 160, attributeBonus: 5 },
  LEGENDARY: { xp: 250, gold: 150, bossDamage: 400, attributeBonus: 10 },
};

/**
 * Non-linear XP leveling curve:
 * XP required to advance from Level L to L + 1 = Math.floor(100 * (L ^ 1.5))
 */
export function getXpRequiredForLevel(level: number): number {
  if (level < 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculates new level and leftover XP given current stats and XP gain.
 * Supports multi-level gains if massive XP is granted.
 */
export function processXpGain(
  currentLevel: number,
  currentXp: number,
  xpGained: number
): {
  newLevel: number;
  newXp: number;
  levelsGained: number;
  leveledUp: boolean;
} {
  let level = currentLevel;
  let xp = currentXp + xpGained;
  let levelsGained = 0;

  while (true) {
    const required = getXpRequiredForLevel(level);
    if (xp >= required) {
      xp -= required;
      level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  return {
    newLevel: level,
    newXp: xp,
    levelsGained,
    leveledUp: levelsGained > 0,
  };
}

/**
 * Calculates streak updates based on calendar day.
 */
export function processStreak(
  lastActiveDateStr: string | null,
  currentStreak: number,
  longestStreak: number
): {
  newStreak: number;
  newLongestStreak: number;
  todayStr: string;
  isNewDay: boolean;
  multiplier: number;
} {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (!lastActiveDateStr) {
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      todayStr,
      isNewDay: true,
      multiplier: 1.05,
    };
  }

  if (lastActiveDateStr === todayStr) {
    // Already logged active today
    const streak = Math.max(1, currentStreak);
    return {
      newStreak: streak,
      newLongestStreak: Math.max(longestStreak, streak),
      todayStr,
      isNewDay: false,
      multiplier: 1 + Math.min(0.5, streak * 0.05),
    };
  }

  const lastDate = new Date(lastActiveDateStr);
  const currentDate = new Date(todayStr);
  const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = 1;
  if (diffDays === 1) {
    // Consecutive day
    newStreak = currentStreak + 1;
  } else {
    // Broken streak
    newStreak = 1;
  }

  const newLongestStreak = Math.max(longestStreak, newStreak);
  const multiplier = 1 + Math.min(0.5, newStreak * 0.05);

  return {
    newStreak,
    newLongestStreak,
    todayStr,
    isNewDay: true,
    multiplier,
  };
}
