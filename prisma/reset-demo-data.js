import { PrismaClient, UserRole } from '@prisma/client';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadRootEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadRootEnv();

const prisma = new PrismaClient();

const demoUsers = [
  {
    email: 'admin@campus.test',
    name: 'Admin Taylor',
    role: UserRole.ADMIN,
  },
  {
    email: 'student@campus.test',
    name: 'Alex Morgan',
    role: UserRole.STUDENT,
  },
];

async function main() {
  const emails = demoUsers.map((user) => user.email);
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  });

  const existingUserIds = existingUsers.map((user) => user.id);

  const deletedBookings = existingUserIds.length > 0
    ? await prisma.booking.deleteMany({
      where: { userId: { in: existingUserIds } },
    })
    : { count: 0 };

  let restoredProfiles = 0;

  for (const demoUser of demoUsers) {
    const result = await prisma.user.updateMany({
      where: { email: demoUser.email },
      data: {
        name: demoUser.name,
        role: demoUser.role,
      },
    });

    restoredProfiles += result.count;
  }

  console.log('Demo data reset complete.');
  console.log(`Demo users found: ${existingUsers.length}`);
  console.log(`Demo user bookings deleted: ${deletedBookings.count}`);
  console.log(`Demo user profiles restored: ${restoredProfiles}`);
  console.log('Events, users, passwords, and schema were left unchanged.');
}

main()
  .catch((error) => {
    console.error('Demo data reset failed.', {
      name: error?.name,
      message: error?.message,
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
