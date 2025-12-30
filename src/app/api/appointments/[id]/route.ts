import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateAppointmentSchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/appointments/:id
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        psychologist: { include: { profile: true } },
        client: { include: { profile: true } },
        payment: true,
        review: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check authorization
    if (
      appointment.clientId !== session.user.id &&
      appointment.psychologistId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ data: appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/appointments/:id
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateAppointmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check authorization
    const isPsychologist = appointment.psychologistId === session.user.id;
    const isClient = appointment.clientId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isPsychologist && !isClient && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status, notes, privateNotes, cancelReason } = validated.data;

    // Handle status changes
    const updateData: any = {};

    if (status === 'CONFIRMED' && isPsychologist) {
      updateData.status = 'CONFIRMED';
      // Notify client
      await prisma.notification.create({
        data: {
          userId: appointment.clientId,
          type: 'APPOINTMENT_CONFIRMED',
          title: 'Запись подтверждена',
          message: 'Ваша запись подтверждена психологом',
          link: `/dashboard/client/appointments/${id}`,
        },
      });
    }

    if (status === 'CANCELLED') {
      updateData.status = 'CANCELLED';
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = session.user.id;
      updateData.cancelReason = cancelReason;

      // Notify other party
      const notifyUserId = isPsychologist ? appointment.clientId : appointment.psychologistId;
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: 'APPOINTMENT_CANCELLED',
          title: 'Запись отменена',
          message: `Запись была отменена${cancelReason ? `: ${cancelReason}` : ''}`,
          link: `/dashboard/${isPsychologist ? 'client' : 'psychologist'}/appointments/${id}`,
        },
      });
    }

    if (status === 'COMPLETED' && isPsychologist) {
      updateData.status = 'COMPLETED';
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (privateNotes !== undefined && isPsychologist) {
      updateData.privateNotes = privateNotes;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        psychologist: { include: { profile: true } },
        client: { include: { profile: true } },
        payment: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedAppointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/appointments/:id
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
