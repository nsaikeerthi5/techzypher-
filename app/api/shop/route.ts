import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all standard shop items + custom items created by this user
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { isCustom: false },
          { userId: session.id },
        ],
      },
      orderBy: [
        { category: 'asc' },
        { cost: 'asc' },
      ],
    });

    return NextResponse.json({ items });
  } catch (err: unknown) {
    console.error('Shop fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch shop items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, cost, icon = 'gift' } = body;

    if (!name || !name.trim() || !cost || cost <= 0) {
      return NextResponse.json(
        { error: 'Reward name and valid gold cost are required.' },
        { status: 400 }
      );
    }

    const customReward = await prisma.item.create({
      data: {
        name: name.trim(),
        description: description?.trim() || 'Custom real-world reward to redeem with earned Gold.',
        category: 'REAL_WORLD',
        cost: parseInt(cost, 10),
        icon: icon || 'gift',
        isCustom: true,
        userId: session.id,
      },
    });

    return NextResponse.json({ success: true, item: customReward }, { status: 201 });
  } catch (err: unknown) {
    console.error('Custom reward create error:', err);
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 });
  }
}
