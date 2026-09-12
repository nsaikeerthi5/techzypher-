import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DIFFICULTY_REWARDS } from '@/lib/rpg-engine';
import { DifficultyType, AttributeType, QuestCategory } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const attribute = searchParams.get('attribute');
    const search = searchParams.get('search');

    const where: any = { userId: session.id };
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (attribute && attribute !== 'ALL') {
      where.attribute = attribute;
    }
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    const quests = await prisma.quest.findMany({
      where,
      orderBy: [
        { isCompleted: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ quests });
  } catch (err: unknown) {
    console.error('Quests fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category = 'DAILY', attribute = 'INTELLECT', difficulty = 'MEDIUM', dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Quest title cannot be empty.' }, { status: 400 });
    }

    const validDiff = (difficulty.toUpperCase() in DIFFICULTY_REWARDS)
      ? (difficulty.toUpperCase() as DifficultyType)
      : 'MEDIUM';

    const validAttr = ['STRENGTH', 'INTELLECT', 'VITALITY', 'AGILITY', 'CHARISMA'].includes(attribute.toUpperCase())
      ? (attribute.toUpperCase() as AttributeType)
      : 'INTELLECT';

    const validCat = ['HABIT', 'DAILY', 'TODO', 'BOSS_RAID'].includes(category.toUpperCase())
      ? (category.toUpperCase() as QuestCategory)
      : 'DAILY';

    // Anti-cheat: compute rewards from server-defined dictionary
    const rewards = DIFFICULTY_REWARDS[validDiff];

    const quest = await prisma.quest.create({
      data: {
        userId: session.id,
        title: title.trim(),
        description: description?.trim() || null,
        category: validCat,
        attribute: validAttr,
        difficulty: validDiff,
        xpReward: rewards.xp,
        goldReward: rewards.gold,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ success: true, quest }, { status: 201 });
  } catch (err: unknown) {
    console.error('Quest create error:', err);
    return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 });
  }
}
