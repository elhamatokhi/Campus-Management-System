import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const devPassword = 'DevPassword123!';

async function main() {
  const passwordHash = await bcrypt.hash(devPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@campus.test' },
    update: {},
    create: {
      name: 'Admin Taylor',
      email: 'admin@campus.test',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@campus.test' },
    update: {},
    create: {
      name: 'Alex Morgan',
      email: 'student@campus.test',
      passwordHash,
      role: UserRole.STUDENT,
    },
  });

  const events = [
    {
      id: 'ai-research-showcase',
      title: 'AI Research Showcase',
      description: 'Student and faculty teams presenting practical AI research projects.',
      category: 'Academic',
      location: 'Innovation Hall, Room 204',
      startDate: new Date('2026-09-12T16:00:00.000Z'),
      endDate: new Date('2026-09-12T18:30:00.000Z'),
      capacity: 120,
      imageUrl: 'https://example.com/images/ai-research-showcase.jpg',
    },
    {
      id: 'graduate-career-fair',
      title: 'Graduate Career Fair',
      description: 'Meet employers offering internships, graduate roles, and cloud technology placements.',
      category: 'Career',
      location: 'Main Atrium',
      startDate: new Date('2026-09-18T10:00:00.000Z'),
      endDate: new Date('2026-09-18T15:00:00.000Z'),
      capacity: 300,
      imageUrl: 'https://example.com/images/graduate-career-fair.jpg',
    },
    {
      id: 'cloud-engineering-lab',
      title: 'Cloud Engineering Lab',
      description: 'A practical session introducing Docker, Kubernetes, and Azure deployment concepts.',
      category: 'Academic',
      location: 'Computing Lab B',
      startDate: new Date('2026-10-14T15:30:00.000Z'),
      endDate: new Date('2026-10-14T17:30:00.000Z'),
      capacity: 60,
      imageUrl: 'https://example.com/images/cloud-engineering-lab.jpg',
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: event,
      create: event,
    });
  }

  await prisma.booking.upsert({
    where: {
      userId_eventId: {
        userId: student.id,
        eventId: events[0].id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      eventId: events[0].id,
    },
  });

  console.log('Seeded development data.');
  console.log(`Development users: admin@campus.test and student@campus.test`);
  console.log(`Development-only password for both users: ${devPassword}`);
  console.log(`Admin id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

