import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { processXpGain, processStreak, DIFFICULTY_REWARDS, getXpRequiredForLevel } from '@/lib/rpg-engine';
import { DifficultyType, AttributeType } from '@/lib/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const quest = await prisma.quest.findFirst({
      where: { id, userId: session.id },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found or unauthorized' }, { status: 404 });
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.id },
    });

    if (!character) {
      return NextResponse.json({ error: 'Hero character not found.' }, { status: 404 });
    }

    // TOGGLE OFF: Uncompleting a quest
    if (quest.isCompleted) {
      const updatedQuest = await prisma.quest.update({
        where: { id },
        data: {
          isCompleted: false,
          completedAt: null,
        },
      });

      // Safely rollback XP and Gold to prevent repeat exploitation
      const diffRewards = DIFFICULTY_REWARDS[quest.difficulty as DifficultyType] || DIFFICULTY_REWARDS.MEDIUM;
      const deductXp = quest.xpReward || diffRewards.xp;
      const deductGold = quest.goldReward || diffRewards.gold;

      const newGold = Math.max(0, character.gold - deductGold);
      const newXp = Math.max(0, character.currentXp - deductXp);

      const updatedCharacter = await prisma.character.update({
        where: { id: character.id },
        data: {
          gold: newGold,
          currentXp: newXp,
        },
      });

      return NextResponse.json({
        success: true,
        quest: updatedQuest,
        character: {
          ...updatedCharacter,
          xpToNextLevel: getXpRequiredForLevel(updatedCharacter.level),
        },
        action: 'UNCOMPLETED',
      });
    }

    // TOGGLE ON: Completing a quest!
    const diffRewards = DIFFICULTY_REWARDS[quest.difficulty as DifficultyType] || DIFFICULTY_REWARDS.MEDIUM;

    // 1. Process Streak
    const streakResult = processStreak(
      character.lastActiveDate,
      character.currentStreak,
      character.longestStreak
    );

    // 2. Calculate Final Rewards with streak multiplier
    const finalXp = Math.round((quest.xpReward || diffRewards.xp) * streakResult.multiplier);
    const finalGold = Math.round((quest.goldReward || diffRewards.gold) * streakResult.multiplier);

    // 3. Process Non-Linear XP & Level Progression
    const levelProgression = processXpGain(character.level, character.currentXp, finalXp);

    // 4. Attribute stat bump
    const attrBonus = diffRewards.attributeBonus;
    const attrField = quest.attribute.toLowerCase() as 'strength' | 'intellect' | 'vitality' | 'agility' | 'charisma';
    const currentAttrVal = character[attrField] || 10;
    const newAttrVal = currentAttrVal + attrBonus;

    // 5. Boss Raid Damage
    const bossDamage = diffRewards.bossDamage;
    let activeBoss = await prisma.worldBoss.findFirst({ where: { isActive: true } });
    if (activeBoss) {
      const remainingHp = Math.max(0, activeBoss.currentHp - bossDamage);
      if (remainingHp === 0) {
        // Boss slain! Level up boss and respawn with more HP!
        await prisma.worldBoss.update({
          where: { id: activeBoss.id },
          data: {
            level: activeBoss.level + 1,
            maxHp: activeBoss.maxHp + 1000,
            currentHp: activeBoss.maxHp + 1000,
          },
        });
      } else {
        await prisma.worldBoss.update({
          where: { id: activeBoss.id },
          data: { currentHp: remainingHp },
        });
      }
    }

    // 6. Update Character in Database
    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: {
        level: levelProgression.newLevel,
        currentXp: levelProgression.newXp,
        gold: character.gold + finalGold,
        currentStreak: streakResult.newStreak,
        longestStreak: streakResult.newLongestStreak,
        lastActiveDate: streakResult.todayStr,
        [attrField]: newAttrVal,
      },
    });

    // 7. Update Quest
    const updatedQuest = await prisma.quest.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        streakCount: quest.streakCount + 1,
      },
    });

    // 8. Log Activity
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        action: 'QUEST_COMPLETED',
        details: `Completed quest: "${quest.title}" (+${finalXp} XP, +${finalGold} GP, +${attrBonus} ${quest.attribute})`,
        xpEarned: finalXp,
        goldEarned: finalGold,
      },
    });

    if (levelProgression.leveledUp) {
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          action: 'LEVEL_UP',
          details: `Ascended to Level ${levelProgression.newLevel}! Aethelgard celebrates your heroic progression!`,
          xpEarned: 0,
          goldEarned: 50 * levelProgression.levelsGained, // Bonus gold for leveling up!
        },
      });

      // Award bonus gold for level up
      await prisma.character.update({
        where: { id: character.id },
        data: {
          gold: updatedCharacter.gold + 50 * levelProgression.levelsGained,
        },
      });
    }

    return NextResponse.json({
      success: true,
      quest: updatedQuest,
      character: {
        ...updatedCharacter,
        gold: updatedCharacter.gold + (levelProgression.leveledUp ? 50 * levelProgression.levelsGained : 0),
        xpToNextLevel: getXpRequiredForLevel(levelProgression.newLevel),
      },
      rewards: {
        xpEarned: finalXp,
        goldEarned: finalGold,
        attribute: quest.attribute,
        attributeGained: attrBonus,
        streakBonus: Math.round((streakResult.multiplier - 1) * 100),
        bossDamage,
      },
      progression: {
        leveledUp: levelProgression.leveledUp,
        newLevel: levelProgression.newLevel,
        levelsGained: levelProgression.levelsGained,
      },
    });
  } catch (err: unknown) {
    console.error('Quest complete error:', err);
    return NextResponse.json({ error: 'Failed to complete quest' }, { status: 500 });
  }
}
