import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, createSessionToken, getSessionCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier },
        ],
      },
      include: {
        character: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. No hero found by that name or email.' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials. Incorrect password.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    const cookieOpts = getSessionCookieOptions();
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        character: user.character,
      },
    });

    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (err: unknown) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: (err as Error)?.message || 'An error occurred during login.' },
      { status: 500 }
    );
  }
}
