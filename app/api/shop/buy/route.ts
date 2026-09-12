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
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.id },
      include: {
        inventory: true,
      },
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found.' }, { status: 404 });
    }

    if (character.gold < item.cost) {
      return NextResponse.json(
        { error: `Insufficient Gold! You need ${item.cost} GP, but only have ${character.gold} GP.` },
        { status: 400 }
      );
    }

    // Process purchase in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct gold
      const updatedCharacter = await tx.character.update({
        where: { id: character.id },
        data: {
          gold: character.gold - item.cost,
        },
      });

      // Add to inventory or increase quantity
      const existingInv = await tx.inventoryItem.findFirst({
        where: {
          characterId: character.id,
          itemId: item.id,
        },
      });

      let inventoryItem;
      if (existingInv) {
        inventoryItem = await tx.inventoryItem.update({
          where: { id: existingInv.id },
          data: { quantity: existingInv.quantity + 1 },
          include: { item: true },
        });
      } else {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            characterId: character.id,
            itemId: item.id,
            quantity: 1,
            isEquipped: false,
          },
          include: { item: true },
        });
      }

      // Activity log
      await tx.activityLog.create({
        data: {
          userId: session.id,
          action: 'ITEM_BOUGHT',
          details: `Acquired "${item.name}" from the merchant for ${item.cost} GP.`,
          xpEarned: 0,
          goldEarned: -item.cost,
        },
      });

      return { updatedCharacter, inventoryItem };
    });

    return NextResponse.json({
      success: true,
      message: `Purchased ${item.name}!`,
      character: result.updatedCharacter,
      inventoryItem: result.inventoryItem,
    });
  } catch (err: unknown) {
    console.error('Purchase error:', err);
    return NextResponse.json({ error: 'Failed to complete purchase' }, { status: 500 });
  }
}
