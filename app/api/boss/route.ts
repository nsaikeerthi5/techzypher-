import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let boss = await prisma.worldBoss.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!boss) {
      boss = await prisma.worldBoss.create({
        data: {
          name: 'The Procrastination Behemoth',
          title: 'Devourer of Stolen Hours & Ruined Deadlines',
          maxHp: 2500,
          currentHp: 2500,
          level: 5,
          avatar: 'dragon',
          description: 'A terrifying shadowy titan formed from forgotten goals and delayed ambitions.',
          isActive: true,
        },
      });
    }

    return NextResponse.json({ boss });
  } catch (err: unknown) {
    console.error('Boss fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch boss' }, { status: 500 });
  }
}
