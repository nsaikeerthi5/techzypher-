import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSessionToken, getSessionCookieOptions } from '@/lib/auth';
import { DIFFICULTY_REWARDS } from '@/lib/rpg-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password, heroName, heroClass, avatar } = body;

    if (!email || !username || !password || !heroName) {
      return NextResponse.json(
        { error: 'Email, username, password, and hero name are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email or username already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user, character, starter quests, and activity log in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: cleanEmail,
          username: cleanUsername,
          passwordHash,
          character: {
            create: {
              heroName: heroName.trim(),
              heroClass: heroClass || 'Wanderer',
              avatar: avatar || 'warrior',
              level: 1,
              currentXp: 0,
              gold: 100,
              strength: 12,
              intellect: 12,
              vitality: 12,
              agility: 12,
              charisma: 12,
            },
          },
        },
        include: {
          character: true,
        },
      });

      // Give starter items
      const starterSword = await tx.item.findFirst({
        where: { name: 'Iron Broadsword' },
      });
      if (starterSword && newUser.character) {
        await tx.inventoryItem.create({
          data: {
            characterId: newUser.character.id,
            itemId: starterSword.id,
            quantity: 1,
            isEquipped: true,
          },
        });
      }

      // Create starter introductory quests
      const starterQuests = [
        {
          title: 'Hydrate the Hero (500ml Water)',
          description: 'Drink a tall glass of fresh water to bolster your vitality.',
          category: 'DAILY',
          attribute: 'VITALITY',
          difficulty: 'TRIVIAL',
          ...DIFFICULTY_REWARDS.TRIVIAL,
        },
        {
          title: 'Deep Study or Coding Session',
          description: 'Dedicate 30 focused minutes without tab switching or social media.',
          category: 'DAILY',
          attribute: 'INTELLECT',
          difficulty: 'MEDIUM',
          ...DIFFICULTY_REWARDS.MEDIUM,
        },
        {
          title: 'Physical Workout / Strength Training',
          description: 'Pushups, gym routine, or active mobility work.',
          category: 'HABIT',
          attribute: 'STRENGTH',
          difficulty: 'MEDIUM',
          ...DIFFICULTY_REWARDS.MEDIUM,
        },
        {
          title: 'Clear & Organize Workspace',
          description: 'A clean desk invites swift thoughts and agile execution.',
          category: 'TODO',
          attribute: 'AGILITY',
          difficulty: 'EASY',
          ...DIFFICULTY_REWARDS.EASY,
        },
        {
          title: 'Send a Kind Message or Network',
          description: 'Foster genuine bonds with an ally, mentor, or team member.',
          category: 'TODO',
          attribute: 'CHARISMA',
          difficulty: 'EASY',
          ...DIFFICULTY_REWARDS.EASY,
        },
      ];

      for (const q of starterQuests) {
        await tx.quest.create({
          data: {
            userId: newUser.id,
            title: q.title,
            description: q.description,
            category: q.category,
            attribute: q.attribute,
            difficulty: q.difficulty,
            xpReward: q.xp,
            goldReward: q.gold,
          },
        });
      }

      // Initial activity log
      await tx.activityLog.create({
        data: {
          userId: newUser.id,
          action: 'HERO_AWAKENED',
          details: `${heroName} has embarked on the heroic journey in Aethelgard!`,
          xpEarned: 0,
          goldEarned: 100,
        },
      });

      return newUser;
    });

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
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: (err as Error)?.message || 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}
