import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { inventoryItemId } = body;

    if (!inventoryItemId) {
      return NextResponse.json({ error: 'Inventory item ID is required.' }, { status: 400 });
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.id },
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found.' }, { status: 404 });
    }

    const targetItem = await prisma.inventoryItem.findFirst({
      where: {
        id: inventoryItemId,
        characterId: character.id,
      },
      include: { item: true },
    });

    if (!targetItem) {
      return NextResponse.json({ error: 'Item not found in your inventory.' }, { status: 404 });
    }

    const willEquip = !targetItem.isEquipped;

    await prisma.$transaction(async (tx) => {
      // If equipping equipment, un-equip other items of the same category
      if (willEquip && ['WEAPON', 'ARMOR', 'RELIC'].includes(targetItem.item.category)) {
        const sameCategoryItems = await tx.inventoryItem.findMany({
          where: {
            characterId: character.id,
            isEquipped: true,
            item: {
              category: targetItem.item.category,
            },
          },
        });

        for (const item of sameCategoryItems) {
          await tx.inventoryItem.update({
            where: { id: item.id },
            data: { isEquipped: false },
          });
        }
      }

      // Toggle state
      await tx.inventoryItem.update({
        where: { id: targetItem.id },
        data: { isEquipped: willEquip },
      });

      // Activity log
      await tx.activityLog.create({
        data: {
          userId: session.id,
          action: 'ITEM_EQUIPPED',
          details: willEquip
            ? `Equipped ${targetItem.item.name} (+${targetItem.item.statBonus} ${targetItem.item.statAttribute || 'stat'})`
            : `Unequipped ${targetItem.item.name}`,
          xpEarned: 0,
          goldEarned: 0,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: willEquip ? `Equipped ${targetItem.item.name}` : `Unequipped ${targetItem.item.name}`,
      isEquipped: willEquip,
    });
  } catch (err: unknown) {
    console.error('Equip error:', err);
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}
