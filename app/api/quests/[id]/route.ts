import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DIFFICULTY_REWARDS } from '@/lib/rpg-engine';
import { DifficultyType, AttributeType, QuestCategory } from '@/lib/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, description, category, attribute, difficulty, dueDate } = body;

    const existing = await prisma.quest.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Quest not found or unauthorized' }, { status: 404 });
    }

    const validDiff = difficulty && (difficulty.toUpperCase() in DIFFICULTY_REWARDS)
      ? (difficulty.toUpperCase() as DifficultyType)
      : (existing.difficulty as DifficultyType);

    const validAttr = attribute && ['STRENGTH', 'INTELLECT', 'VITALITY', 'AGILITY', 'CHARISMA'].includes(attribute.toUpperCase())
      ? (attribute.toUpperCase() as AttributeType)
      : (existing.attribute as AttributeType);

    const validCat = category && ['HABIT', 'DAILY', 'TODO', 'BOSS_RAID'].includes(category.toUpperCase())
      ? (category.toUpperCase() as QuestCategory)
      : (existing.category as QuestCategory);

    const rewards = DIFFICULTY_REWARDS[validDiff];

    const updated = await prisma.quest.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? description?.trim() || null : existing.description,
        category: validCat,
        attribute: validAttr,
        difficulty: validDiff,
        xpReward: rewards.xp,
        goldReward: rewards.gold,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
      },
    });

    return NextResponse.json({ success: true, quest: updated });
  } catch (err: unknown) {
    console.error('Quest update error:', err);
    return NextResponse.json({ error: 'Failed to update quest' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const existing = await prisma.quest.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Quest not found or unauthorized' }, { status: 404 });
    }

    await prisma.quest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Quest deleted successfully.' });
  } catch (err: unknown) {
    console.error('Quest delete error:', err);
    return NextResponse.json({ error: 'Failed to delete quest' }, { status: 500 });
  }
}
