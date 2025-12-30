'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'psychologist' ? 'PSYCHOLOGIST' : 'CLIENT';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Ошибка регистрации');
        return;
      }

      toast.success('Регистрация успешна! Теперь вы можете войти.');
      router.push('/login');
    } catch (error) {
      toast.error('Произошла ошибка. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт для доступа к платформе</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Я регистрируюсь как</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'CLIENT')}
                className={cn(
                  'rounded-lg border-2 p-4 text-center transition-colors',
                  selectedRole === 'CLIENT'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="block font-medium">Клиент</span>
                <span className="text-sm text-muted-foreground">Ищу психолога</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'PSYCHOLOGIST')}
                className={cn(
                  'rounded-lg border-2 p-4 text-center transition-colors',
                  selectedRole === 'PSYCHOLOGIST'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="block font-medium">Психолог</span>
                <span className="text-sm text-muted-foreground">Предлагаю услуги</span>
              </button>
            </div>
            <input type="hidden" {...register('role')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Имя" placeholder="Иван" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Фамилия" placeholder="Иванов" error={errors.lastName?.message} {...register('lastName')} />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="example@mail.ru"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input label="Телефон" type="tel" placeholder="+7 (999) 123-45-67" {...register('phone')} />

          <Input
            label="Пароль"
            type="password"
            placeholder="Минимум 6 символов"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Подтвердите пароль"
            type="password"
            placeholder="Повторите пароль"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <p className="text-xs text-muted-foreground">
            Регистрируясь, вы соглашаетесь с{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              условиями использования
            </Link>{' '}
            и{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              политикой конфиденциальности
            </Link>
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Создать аккаунт
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-primary-600 hover:underline">
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
