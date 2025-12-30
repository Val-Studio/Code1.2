import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createAppointmentSchema } from '@/lib/validations';
import { generateRoomId } from '@/lib/utils';

// GET /api/appointments - List user's appointments
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {};

    // Filter based on user role
    if (session.user.role === 'PSYCHOLOGIST') {
      where.psychologistId = session.user.id;
    } else if (session.user.role === 'CLIENT') {
      where.clientId = session.user.id;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          psychologist: { include: { profile: true } },
          client: { include: { profile: true } },
          payment: true,
        },
        orderBy: { datetime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({
      data: appointments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can book appointments' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createAppointmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { psychologistId, datetime, duration, type } = validated.data;

    // Check if psychologist exists and is verified
    const psychologist = await prisma.user.findUnique({
      where: { id: psychologistId, role: 'PSYCHOLOGIST' },
      include: { profile: true },
    });

    if (!psychologist || !psychologist.profile?.verified) {
      return NextResponse.json({ error: 'Psychologist not found or not verified' }, { status: 404 });
    }

    // Check if slot is available
    const appointmentDate = new Date(datetime);
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        psychologistId,
        datetime: appointmentDate,
        status: { notIn: ['CANCELLED'] },
      },
    });

    if (existingAppointment) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 400 });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        psychologistId,
        clientId: session.user.id,
        datetime: appointmentDate,
        duration,
        type,
        price: psychologist.profile.price || 0,
        roomId: type === 'VIDEO' || type === 'AUDIO' ? generateRoomId() : null,
      },
      include: {
        psychologist: { include: { profile: true } },
        client: { include: { profile: true } },
      },
    });

    // Create notification for psychologist
    await prisma.notification.create({
      data: {
        userId: psychologistId,
        type: 'APPOINTMENT_CREATED',
        title: 'Новая запись',
        message: `${session.user.firstName} ${session.user.lastName} записался на ${appointmentDate.toLocaleDateString('ru-RU')}`,
        link: `/dashboard/psychologist/appointments/${appointment.id}`,
        data: { appointmentId: appointment.id },
      },
    });

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
