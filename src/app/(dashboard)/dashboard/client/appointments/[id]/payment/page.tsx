'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, Button, PageLoader } from '@/components/ui';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { CreditCard, Shield, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: PageProps) {
  const { id: appointmentId } = use(params);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Get appointment details
        const appResponse = await fetch(`/api/appointments/${appointmentId}`);
        const appData = await appResponse.json();

        if (!appResponse.ok) {
          throw new Error(appData.error);
        }

        setAppointment(appData.data);

        // Create payment intent
        const payResponse = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId }),
        });

        const payData = await payResponse.json();

        if (!payResponse.ok) {
          throw new Error(payData.error);
        }

        setClientSecret(payData.clientSecret);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [appointmentId]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!clientSecret || !appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Не удалось загрузить страницу оплаты</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Оплата консультации</h1>
        <p className="text-gray-600">Завершите бронирование</p>
      </div>

      {/* Order summary */}
      <Card>
        <CardHeader>
          <CardTitle>Детали заказа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Психолог</span>
            <span className="font-medium">
              {appointment.psychologist.profile?.firstName} {appointment.psychologist.profile?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Дата и время</span>
            <span className="font-medium">{formatDateTime(appointment.datetime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Длительность</span>
            <span className="font-medium">{appointment.duration} мин</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg">
            <span className="font-medium">Итого</span>
            <span className="font-bold text-primary-600">{formatPrice(appointment.price)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Оплата
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <PaymentForm appointmentId={appointmentId} />
          </Elements>
        </CardContent>
      </Card>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          Безопасная оплата
        </span>
        <span className="flex items-center gap-1">
          <Lock className="h-4 w-4" />
          Шифрование SSL
        </span>
      </div>
    </div>
  );
}

function PaymentForm({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/client/appointments/${appointmentId}/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Ошибка оплаты');
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('Оплата прошла успешно!');
        router.push(`/dashboard/client/appointments/${appointmentId}/success`);
      }
    } catch (error) {
      toast.error('Произошла ошибка при оплате');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" className="w-full" isLoading={isProcessing} disabled={!stripe}>
        Оплатить
      </Button>
    </form>
  );
}
