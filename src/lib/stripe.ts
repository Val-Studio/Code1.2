import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export const PLATFORM_FEE_PERCENT = 15; // 15% platform fee

export async function createPaymentIntent(
  amount: number,
  currency: string = 'rub',
  metadata: Record<string, string> = {}
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
}

export async function createRefund(
  chargeId: string,
  amount?: number,
  reason?: string
) {
  const refund = await stripe.refunds.create({
    charge: chargeId,
    amount,
    reason: reason as Stripe.RefundCreateParams.Reason,
  });

  return refund;
}

export function calculatePayoutAmount(price: number): number {
  return Math.round(price * (1 - PLATFORM_FEE_PERCENT / 100));
}
