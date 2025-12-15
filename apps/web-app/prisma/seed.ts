import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create user
  const hashedPassword = await bcrypt.hash('dev', 10);
  const user = await prisma.user.upsert({
    where: { username: 'dev' },
    update: {},
    create: {
      username: 'dev',
      passwordHash: hashedPassword,
    },
  });

  // Create client
  const client = await prisma.client.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Example Client',
      email: 'client@example.com',
      nip: '1234567890',
    },
  });

  console.log({ user, client });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
