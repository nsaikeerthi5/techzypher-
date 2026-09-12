import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getXpRequiredForLevel } from '@/lib/rpg-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.id },
      include: {
        inventory: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Calculate equipped bonuses
    let bonusStr = 0;
    let bonusInt = 0;
    let bonusVit = 0;
    let bonusAgi = 0;
    let bonusCha = 0;

    const equippedItems: Record<string, any> = {};

    for (const inv of character.inventory) {
      if (inv.isEquipped && inv.item) {
        if (inv.item.category === 'WEAPON') equippedItems.weapon = inv.item;
        if (inv.item.category === 'ARMOR') equippedItems.armor = inv.item;
        if (inv.item.category === 'RELIC') equippedItems.relic = inv.item;

        if (inv.item.statAttribute === 'STRENGTH') bonusStr += inv.item.statBonus;
        if (inv.item.statAttribute === 'INTELLECT') bonusInt += inv.item.statBonus;
        if (inv.item.statAttribute === 'VITALITY') bonusVit += inv.item.statBonus;
        if (inv.item.statAttribute === 'AGILITY') bonusAgi += inv.item.statBonus;
        if (inv.item.statAttribute === 'CHARISMA') bonusCha += inv.item.statBonus;
      }
    }

    const xpToNextLevel = getXpRequiredForLevel(character.level);

    return NextResponse.json({
      character: {
        ...character,
        totalStrength: character.strength + bonusStr,
        totalIntellect: character.intellect + bonusInt,
        totalVitality: character.vitality + bonusVit,
        totalAgility: character.agility + bonusAgi,
        totalCharisma: character.charisma + bonusCha,
        bonusStrength: bonusStr,
        bonusIntellect: bonusInt,
        bonusVitality: bonusVit,
        bonusAgility: bonusAgi,
        bonusCharisma: bonusCha,
        xpToNextLevel,
        equippedItems,
      },
    });
  } catch (err: unknown) {
    console.error('Character fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch character' }, { status: 500 });
  }
}
