import Link from 'next/link';
import { Button } from '@/components/ui';
import { Brain, Video, Shield, Star, Calendar, MessageCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-700">
            <Brain className="h-8 w-8" />
            PsyConnect
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/psychologists" className="text-gray-600 hover:text-gray-900">
              Психологи
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              О нас
            </Link>
            <Link href="/login">
              <Button variant="outline">Войти</Button>
            </Link>
            <Link href="/register">
              <Button>Регистрация</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          Профессиональная психологическая
          <br />
          <span className="text-primary-600">помощь онлайн</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          Найдите своего психолога и начните путь к благополучию. Конфиденциальные видео-консультации с
          сертифицированными специалистами.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/psychologists">
            <Button size="lg">Найти психолога</Button>
          </Link>
          <Link href="/register?role=psychologist">
            <Button size="lg" variant="outline">
              Я психолог
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Почему выбирают нас</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Video className="h-8 w-8 text-primary-600" />}
            title="Видео-консультации"
            description="Общайтесь с психологом лицом к лицу из любой точки мира через защищённую видеосвязь"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-primary-600" />}
            title="Конфиденциальность"
            description="Все данные надёжно защищены. Мы гарантируем полную анонимность ваших консультаций"
          />
          <FeatureCard
            icon={<Star className="h-8 w-8 text-primary-600" />}
            title="Проверенные специалисты"
            description="Только сертифицированные психологи с подтверждённым образованием и опытом работы"
          />
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-primary-600" />}
            title="Удобное расписание"
            description="Выбирайте удобное время для консультаций. Доступны записи на вечер и выходные"
          />
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8 text-primary-600" />}
            title="Чат с психологом"
            description="Между сессиями вы можете переписываться с вашим психологом в защищённом чате"
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-primary-600" />}
            title="Разные специализации"
            description="Тревожность, депрессия, отношения, карьера — найдите специалиста под вашу задачу"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Как это работает</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <StepCard step={1} title="Выберите психолога" description="Изучите профили, специализации и отзывы" />
            <StepCard step={2} title="Запишитесь на приём" description="Выберите удобное время в расписании" />
            <StepCard step={3} title="Оплатите консультацию" description="Безопасная оплата картой" />
            <StepCard step={4} title="Начните сессию" description="Подключитесь к видео-звонку в назначенное время" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-6 text-3xl font-bold text-gray-900">Готовы начать?</h2>
        <p className="mx-auto mb-8 max-w-xl text-gray-600">
          Первый шаг — самый важный. Зарегистрируйтесь и найдите психолога, который поможет вам.
        </p>
        <Link href="/register">
          <Button size="lg">Создать аккаунт</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
                <Brain className="h-6 w-6" />
                PsyConnect
              </Link>
              <p className="mt-4 text-sm text-gray-600">Профессиональная психологическая помощь онлайн</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Клиентам</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/psychologists" className="hover:text-primary-600">
                    Найти психолога
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-primary-600">
                    Как это работает
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary-600">
                    Цены
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Психологам</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/for-psychologists" className="hover:text-primary-600">
                    Присоединиться
                  </Link>
                </li>
                <li>
                  <Link href="/requirements" className="hover:text-primary-600">
                    Требования
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Поддержка</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/help" className="hover:text-primary-600">
                    Помощь
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary-600">
                    Политика конфиденциальности
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary-600">
                    Условия использования
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} PsyConnect. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
        {step}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
