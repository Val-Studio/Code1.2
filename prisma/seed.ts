import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@psyconnect.ru' },
    update: {},
    create: {
      email: 'admin@psyconnect.ru',
      password: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Администратор',
          lastName: 'Системы',
        },
      },
    },
  });
  console.log('Admin created:', admin.email);

  // Create test psychologists
  const psychologists = [
    {
      email: 'anna@psyconnect.ru',
      firstName: 'Анна',
      lastName: 'Петрова',
      bio: 'Клинический психолог с 10-летним опытом работы. Специализируюсь на когнитивно-поведенческой терапии. Помогаю справиться с тревогой, депрессией и проблемами в отношениях.',
      specializations: ['Тревожность', 'Депрессия', 'Отношения'],
      experience: 10,
      price: 350000, // 3500 руб
      rating: 4.9,
      reviewsCount: 127,
    },
    {
      email: 'dmitry@psyconnect.ru',
      firstName: 'Дмитрий',
      lastName: 'Иванов',
      bio: 'Психотерапевт, гештальт-терапевт. Работаю с темами личностного роста, самооценки, профессионального выгорания. Создаю безопасное пространство для самопознания.',
      specializations: ['Личностный рост', 'Самооценка', 'Стресс и выгорание'],
      experience: 7,
      price: 400000, // 4000 руб
      rating: 4.8,
      reviewsCount: 89,
    },
    {
      email: 'maria@psyconnect.ru',
      firstName: 'Мария',
      lastName: 'Сидорова',
      bio: 'Детский и семейный психолог. Помогаю семьям находить общий язык, работаю с детскими страхами и поведенческими проблемами.',
      specializations: ['Детская психология', 'Семейная терапия', 'Отношения'],
      experience: 12,
      price: 450000, // 4500 руб
      rating: 4.95,
      reviewsCount: 203,
    },
  ];

  for (const psy of psychologists) {
    const password = await bcrypt.hash('password123', 12);
    const user = await prisma.user.upsert({
      where: { email: psy.email },
      update: {},
      create: {
        email: psy.email,
        password,
        role: 'PSYCHOLOGIST',
        profile: {
          create: {
            firstName: psy.firstName,
            lastName: psy.lastName,
            bio: psy.bio,
            specializations: psy.specializations,
            experience: psy.experience,
            price: psy.price,
            rating: psy.rating,
            reviewsCount: psy.reviewsCount,
            verified: true,
            isActive: true,
            languages: ['ru'],
          },
        },
      },
    });

    // Create schedule for psychologist
    const schedule = [1, 2, 3, 4, 5].map((day) => ({
      psychologistId: user.id,
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '18:00',
      isAvailable: true,
    }));

    await prisma.schedule.createMany({
      data: schedule,
      skipDuplicates: true,
    });

    console.log('Psychologist created:', user.email);
  }

  // Create test client
  const clientPassword = await bcrypt.hash('password123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@psyconnect.ru' },
    update: {},
    create: {
      email: 'client@psyconnect.ru',
      password: clientPassword,
      role: 'CLIENT',
      profile: {
        create: {
          firstName: 'Иван',
          lastName: 'Тестов',
        },
      },
    },
  });
  console.log('Client created:', client.email);

  console.log('Seeding completed!');
  console.log('');
  console.log('Test accounts:');
  console.log('Admin: admin@psyconnect.ru / admin123');
  console.log('Psychologist: anna@psyconnect.ru / password123');
  console.log('Client: client@psyconnect.ru / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
