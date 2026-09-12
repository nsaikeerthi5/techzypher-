const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.count();
  const items = await prisma.item.count();
  const bosses = await prisma.worldBoss.count();
  console.log(`DB TEST: ${users} users, ${items} items, ${bosses} bosses.`);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
