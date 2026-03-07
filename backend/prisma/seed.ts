import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@habittracker.dev' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@habittracker.dev',
      passwordHash: 'demo-hash',
      habits: {
        create: [
          {
            title: 'Beber 2L de agua',
            frequencyType: 'DAILY',
          },
          {
            title: 'Treinar 3x por semana',
            frequencyType: 'WEEKLY',
            weeklyTarget: 3,
          },
        ],
      },
    },
  });

  console.log(`Seed concluido para usuario: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
