'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, Button, PageLoader } from '@/components/ui';
import { DAYS_OF_WEEK } from '@/types';
import { Clock, Save, Plus, Trash2 } from 'lucide-react';

interface ScheduleSlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function SchedulePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const response = await fetch('/api/schedule');
        const data = await response.json();

        if (response.ok) {
          setSchedule(data.data || []);
        }
      } catch (error) {
        toast.error('Ошибка загрузки расписания');
      } finally {
        setIsLoading(false);
      }
    }

    loadSchedule();
  }, []);

  const handleToggleDay = (dayOfWeek: number) => {
    const existing = schedule.find((s) => s.dayOfWeek === dayOfWeek);

    if (existing) {
      setSchedule(
        schedule.map((s) =>
          s.dayOfWeek === dayOfWeek ? { ...s, isAvailable: !s.isAvailable } : s
        )
      );
    } else {
      setSchedule([
        ...schedule,
        {
          dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
        },
      ]);
    }
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(
      schedule.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      });

      if (!response.ok) {
        throw new Error('Failed to save schedule');
      }

      toast.success('Расписание сохранено');
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
        <p className="text-gray-600">Настройте своё рабочее время</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Рабочие часы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const slot = schedule.find((s) => s.dayOfWeek === day.value);
            const isActive = slot?.isAvailable ?? false;

            return (
              <div
                key={day.value}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  isActive ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggleDay(day.value)}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600"
                    />
                    <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {day.label}
                    </span>
                  </label>
                </div>

                {isActive && (
                  <div className="flex items-center gap-2">
                    <select
                      value={slot?.startTime || '09:00'}
                      onChange={(e) => handleTimeChange(day.value, 'startTime', e.target.value)}
                      className="rounded-lg border px-3 py-2"
                    >
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={`${h.toString().padStart(2, '0')}:00`}>
                          {`${h.toString().padStart(2, '0')}:00`}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500">до</span>
                    <select
                      value={slot?.endTime || '18:00'}
                      onChange={(e) => handleTimeChange(day.value, 'endTime', e.target.value)}
                      className="rounded-lg border px-3 py-2"
                    >
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={`${h.toString().padStart(2, '0')}:00`}>
                          {`${h.toString().padStart(2, '0')}:00`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          Сохранить расписание
        </Button>
      </div>
    </div>
  );
}
