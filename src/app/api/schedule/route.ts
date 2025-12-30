import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/schedule
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PSYCHOLOGIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const schedule = await prisma.schedule.findMany({
      where: { psychologistId: session.user.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ data: schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/schedule
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PSYCHOLOGIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { schedule } = await request.json();

    if (!Array.isArray(schedule)) {
      return NextResponse.json({ error: 'Invalid schedule data' }, { status: 400 });
    }

    // Delete existing schedule
    await prisma.schedule.deleteMany({
      where: { psychologistId: session.user.id },
    });

    // Create new schedule
    if (schedule.length > 0) {
      await prisma.schedule.createMany({
        data: schedule.map((slot: any) => ({
          psychologistId: session.user.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        })),
      });
    }

    const updatedSchedule = await prisma.schedule.findMany({
      where: { psychologistId: session.user.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ success: true, data: updatedSchedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
