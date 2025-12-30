'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button, Badge } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock, CreditCard } from 'lucide-react';
import type { Schedule } from '@prisma/client';

interface BookingCalendarProps {
  psychologistId: string;
  schedule: Schedule[];
  price: number;
}

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export function BookingCalendar({ psychologistId, schedule, price }: BookingCalendarProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const today = startOfDay(new Date());
  const startOfWeek = addDays(today, weekOffset * 7);
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek, i));

  const getScheduleForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    return schedule.find((s) => s.dayOfWeek === dayOfWeek && s.isAvailable);
  };

  const getAvailableSlots = (date: Date) => {
    const daySchedule = getScheduleForDay(date);
    if (!daySchedule) return [];

    return TIME_SLOTS.filter((time) => {
      const [hour] = time.split(':').map(Number);
      const [startHour] = daySchedule.startTime.split(':').map(Number);
      const [endHour] = daySchedule.endTime.split(':').map(Number);
      return hour >= startHour && hour < endHour;
    });
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsLoading(true);

    try {
      const datetime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      datetime.setHours(hours, minutes, 0, 0);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psychologistId,
          datetime: datetime.toISOString(),
          duration: 60,
          type: 'VIDEO',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при записи');
      }

      toast.success('Запись создана! Ожидайте подтверждения.');
      router.push(`/dashboard/client/appointments/${result.data.id}/payment`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при записи');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-medium">
          {format(days[0], 'd MMM', { locale: ru })} - {format(days[6], 'd MMM', { locale: ru })}
        </span>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          disabled={weekOffset >= 4}
          className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const hasSlots = getScheduleForDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isPast = day < today;

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                setSelectedDate(day);
                setSelectedTime(null);
              }}
              disabled={!hasSlots || isPast}
              className={`rounded-lg p-2 text-center transition-colors ${
                isSelected
                  ? 'bg-primary-600 text-white'
                  : hasSlots && !isPast
                  ? 'hover:bg-primary-50'
                  : 'text-gray-300'
              }`}
            >
              <div className="text-xs">{format(day, 'EEE', { locale: ru })}</div>
              <div className="text-lg font-medium">{format(day, 'd')}</div>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Доступное время на {format(selectedDate, 'd MMMM', { locale: ru })}:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {getAvailableSlots(selectedDate).map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg border p-2 text-sm transition-colors ${
                  selectedTime === time
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Booking summary */}
      {selectedDate && selectedTime && (
        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              {format(selectedDate, 'd MMMM', { locale: ru })}, {selectedTime}
            </span>
            <Badge>60 мин</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600">
              <CreditCard className="h-4 w-4" />
              К оплате
            </span>
            <span className="text-lg font-bold text-primary-600">{formatPrice(price)}</span>
          </div>
          <Button onClick={handleBooking} isLoading={isLoading} className="w-full">
            Записаться
          </Button>
        </div>
      )}
    </div>
  );
}
