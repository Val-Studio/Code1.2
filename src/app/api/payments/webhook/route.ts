import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
          include: { appointment: true },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              stripeChargeId: paymentIntent.latest_charge as string,
            },
          });

          // Update appointment status
          await prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'CONFIRMED' },
          });

          // Notify psychologist
          await prisma.notification.create({
            data: {
              userId: payment.appointment.psychologistId,
              type: 'PAYMENT_RECEIVED',
              title: 'Получена оплата',
              message: `Клиент оплатил консультацию`,
              link: `/dashboard/psychologist/appointments/${payment.appointmentId}`,
            },
          });

          // Notify client
          await prisma.notification.create({
            data: {
              userId: payment.appointment.clientId,
              type: 'APPOINTMENT_CONFIRMED',
              title: 'Запись подтверждена',
              message: 'Оплата прошла успешно. Ваша запись подтверждена.',
              link: `/dashboard/client/appointments/${payment.appointmentId}`,
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'FAILED' },
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        const payment = await prisma.payment.findFirst({
          where: { stripeChargeId: charge.id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: charge.amount_refunded === charge.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
              refundedAt: new Date(),
              refundAmount: charge.amount_refunded,
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
