import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createPaymentIntent, calculatePayoutAmount } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        payment: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check authorization
    if (appointment.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already paid
    if (appointment.payment?.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    // Create or update payment intent
    const paymentIntent = await createPaymentIntent(appointment.price, 'rub', {
      appointmentId: appointment.id,
      clientId: session.user.id,
      psychologistId: appointment.psychologistId,
    });

    // Create or update payment record
    if (appointment.payment) {
      await prisma.payment.update({
        where: { id: appointment.payment.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          status: 'PROCESSING',
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          appointmentId: appointment.id,
          amount: appointment.price,
          payoutAmount: calculatePayoutAmount(appointment.price),
          stripePaymentIntentId: paymentIntent.id,
          status: 'PROCESSING',
        },
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: appointment.price,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
