import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.activityLog.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    return NextResponse.json({ logs });
  } catch (err: unknown) {
    console.error('Activity logs fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
