import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createLiveKitToken } from '@/lib/livekit';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, appointmentId } = await request.json();

    if (!roomId || !appointmentId) {
      return NextResponse.json({ error: 'Missing roomId or appointmentId' }, { status: 400 });
    }

    // Verify the user is part of this appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        psychologist: { include: { profile: true } },
        client: { include: { profile: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const isPsychologist = appointment.psychologistId === session.user.id;
    const isClient = appointment.clientId === session.user.id;

    if (!isPsychologist && !isClient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check appointment status
    if (appointment.status !== 'CONFIRMED' && appointment.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Appointment is not active' }, { status: 400 });
    }

    // Get participant name
    const participantName = isPsychologist
      ? `${appointment.psychologist.profile?.firstName} ${appointment.psychologist.profile?.lastName}`
      : `${appointment.client.profile?.firstName} ${appointment.client.profile?.lastName}`;

    const { token, url } = await createLiveKitToken(roomId, participantName, session.user.id);

    // Update appointment status if starting
    if (appointment.status === 'CONFIRMED') {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json({
      token,
      url,
      roomId,
      appointmentId,
    });
  } catch (error) {
    console.error('Video token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
