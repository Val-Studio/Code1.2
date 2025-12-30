import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role, phone } = validated.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // If psychologist, create default schedule
    if (role === 'PSYCHOLOGIST') {
      const defaultSchedule = [1, 2, 3, 4, 5].map((day) => ({
        psychologistId: user.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      }));

      await prisma.schedule.createMany({
        data: defaultSchedule,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Регистрация успешна',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
