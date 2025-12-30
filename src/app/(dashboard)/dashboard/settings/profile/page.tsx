'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Avatar, PageLoader } from '@/components/ui';
import { profileSchema, psychologistProfileSchema, type ProfileInput, type PsychologistProfileInput } from '@/lib/validations';
import { SPECIALIZATIONS, LANGUAGES } from '@/types';
import { Camera, Plus, Trash2 } from 'lucide-react';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const isPsychologist = session?.user?.role === 'PSYCHOLOGIST';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput | PsychologistProfileInput>({
    resolver: zodResolver(isPsychologist ? psychologistProfileSchema : profileSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/users/me');
        const data = await response.json();

        if (response.ok && data.data?.profile) {
          setProfile(data.data.profile);
          reset(data.data.profile);
        }
      } catch (error) {
        toast.error('Ошибка загрузки профиля');
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      loadProfile();
    }
  }, [session, reset]);

  const onSubmit = async (data: ProfileInput | PsychologistProfileInput) => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Профиль обновлён');
      router.refresh();
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <PageLoader />;
  }

  const selectedSpecializations = (watch('specializations') as string[]) || [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Редактирование профиля</h1>
        <p className="text-gray-600">Обновите ваши личные данные</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar
                  src={profile?.avatar}
                  firstName={profile?.firstName || ''}
                  lastName={profile?.lastName || ''}
                  size="xl"
                  className="h-24 w-24"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white hover:bg-primary-700"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="font-medium">Фото профиля</p>
                <p className="text-sm text-gray-500">JPG, PNG до 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Имя"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Фамилия"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
            <Input
              label="Телефон"
              type="tel"
              {...register('phone')}
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Часовой пояс</label>
              <select
                className="h-10 w-full rounded-lg border px-3"
                {...register('timezone')}
              >
                <option value="Europe/Moscow">Москва (UTC+3)</option>
                <option value="Europe/Kaliningrad">Калининград (UTC+2)</option>
                <option value="Europe/Samara">Самара (UTC+4)</option>
                <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
                <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Psychologist-specific fields */}
        {isPsychologist && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Профессиональная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  label="О себе"
                  placeholder="Расскажите о вашем подходе к терапии..."
                  rows={4}
                  error={(errors as any).bio?.message}
                  {...register('bio')}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium">Специализации</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => {
                          const current = selectedSpecializations;
                          if (current.includes(spec)) {
                            setValue('specializations', current.filter((s) => s !== spec) as any);
                          } else {
                            setValue('specializations', [...current, spec] as any);
                          }
                        }}
                        className={`rounded-full px-3 py-1 text-sm transition-colors ${
                          selectedSpecializations.includes(spec)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                  {(errors as any).specializations && (
                    <p className="mt-1 text-sm text-destructive">
                      {(errors as any).specializations.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Опыт работы (лет)"
                    type="number"
                    min={0}
                    max={50}
                    {...register('experience', { valueAsNumber: true })}
                  />
                  <Input
                    label="Цена за сессию (60 мин), ₽"
                    type="number"
                    min={1000}
                    step={100}
                    error={(errors as any).price?.message}
                    {...register('price', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Языки</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <label key={lang.code} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={lang.code}
                          {...register('languages')}
                          className="rounded border-gray-300"
                        />
                        {lang.name}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Сохранить
          </Button>
        </div>
      </form>
    </div>
  );
}
