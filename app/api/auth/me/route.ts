import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getXpRequiredForLevel } from '@/lib/rpg-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        character: {
          include: {
            inventory: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.character) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const xpToNextLevel = getXpRequiredForLevel(user.character.level);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        character: {
          ...user.character,
          xpToNextLevel,
        },
      },
    });
  } catch (err: unknown) {
    console.error('Auth check error:', err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
