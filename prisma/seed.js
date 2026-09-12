const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial RPG game catalog and world boss...');

  // 1. Initial World Boss
  const existingBoss = await prisma.worldBoss.findFirst({ where: { isActive: true } });
  if (!existingBoss) {
    await prisma.worldBoss.create({
      data: {
        name: 'The Procrastination Behemoth',
        title: 'Devourer of Stolen Hours & Ruined Deadlines',
        maxHp: 2500,
        currentHp: 2500,
        level: 5,
        avatar: 'dragon',
        description: 'A terrifying shadowy titan formed from forgotten goals and delayed ambitions. Deal damage to it by completing quests!',
        isActive: true,
      },
    });
    console.log('Created World Boss: The Procrastination Behemoth');
  }

  // 2. Base Shop Items (Weapons, Armor, Relics, Consumables)
  const baseItems = [
    // Weapons
    {
      name: 'Iron Broadsword',
      description: 'A sturdy iron blade forged in dragonfire. Strengthens physical grit.',
      category: 'WEAPON',
      cost: 50,
      icon: 'sword',
      statAttribute: 'STRENGTH',
      statBonus: 5,
      isCustom: false,
    },
    {
      name: 'Tome of Arcane Logic',
      description: 'Ancient manuscript vibrating with algorithmic wisdom.',
      category: 'WEAPON',
      cost: 80,
      icon: 'book',
      statAttribute: 'INTELLECT',
      statBonus: 8,
      isCustom: false,
    },
    {
      name: 'Swift Shadow Dagger',
      description: 'Lightweight blade that helps you execute tasks at blinding speed.',
      category: 'WEAPON',
      cost: 65,
      icon: 'zap',
      statAttribute: 'AGILITY',
      statBonus: 6,
      isCustom: false,
    },
    // Armor
    {
      name: 'Plate Armor of Fortitude',
      description: 'Heavy armor providing unwavering endurance for demanding days.',
      category: 'ARMOR',
      cost: 120,
      icon: 'shield',
      statAttribute: 'VITALITY',
      statBonus: 10,
      isCustom: false,
    },
    {
      name: 'Mage Cloak of Focus',
      description: 'Woven from celestial threads, shielding the mind from mental fatigue.',
      category: 'ARMOR',
      cost: 100,
      icon: 'feather',
      statAttribute: 'INTELLECT',
      statBonus: 9,
      isCustom: false,
    },
    {
      name: 'Diplomat Cloak of Radiance',
      description: 'Embroidered silk that inspires confidence in any council.',
      category: 'ARMOR',
      cost: 95,
      icon: 'sparkles',
      statAttribute: 'CHARISMA',
      statBonus: 8,
      isCustom: false,
    },
    // Relics
    {
      name: 'Amulet of the Unbroken Flame',
      description: 'Burns brighter with every consecutive day of discipline.',
      category: 'RELIC',
      cost: 150,
      icon: 'flame',
      statAttribute: 'VITALITY',
      statBonus: 12,
      isCustom: false,
    },
    {
      name: 'Chronos Pocket Hourglass',
      description: 'Manipulates perception, turning hectic minutes into productive hours.',
      category: 'RELIC',
      cost: 180,
      icon: 'clock',
      statAttribute: 'AGILITY',
      statBonus: 15,
      isCustom: false,
    },
    // Consumables
    {
      name: 'Elixir of Deep Slumber',
      description: 'Restores maximum vitality and resets daily cognitive fatigue.',
      category: 'CONSUMABLE',
      cost: 30,
      icon: 'coffee',
      statAttribute: 'VITALITY',
      statBonus: 3,
      isCustom: false,
    },
    {
      name: 'Streak Guardian Shield',
      description: 'Protects your streak from resetting if you miss a single day.',
      category: 'CONSUMABLE',
      cost: 75,
      icon: 'shield',
      statAttribute: 'VITALITY',
      statBonus: 0,
      isCustom: false,
    },
    // Real World Custom Templates
    {
      name: '1-Hour Video Game Session',
      description: 'Guilt-free indulgence after conquering hard quests.',
      category: 'REAL_WORLD',
      cost: 80,
      icon: 'gamepad',
      statAttribute: null,
      statBonus: 0,
      isCustom: false,
    },
    {
      name: 'Gourmet Coffee & Pastry',
      description: 'Reward your hero body with premium roasted fuel.',
      category: 'REAL_WORLD',
      cost: 45,
      icon: 'coffee',
      statAttribute: null,
      statBonus: 0,
      isCustom: false,
    }
  ];

  for (const item of baseItems) {
    const exists = await prisma.item.findFirst({ where: { name: item.name, isCustom: false } });
    if (!exists) {
      await prisma.item.create({ data: item });
    }
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
