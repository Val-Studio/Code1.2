import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { Card, CardContent, Avatar, Badge, Button, Input, PageLoader } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Star, MapPin, Languages, Clock, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { SPECIALIZATIONS } from '@/types';

export const metadata = {
  title: 'Найти психолога',
};

interface SearchParams {
  specialization?: string;
  priceMin?: string;
  priceMax?: string;
  rating?: string;
  page?: string;
}

async function getPsychologists(params: SearchParams) {
  const page = parseInt(params.page || '1');
  const pageSize = 12;

  const where: any = {
    role: 'PSYCHOLOGIST',
    profile: {
      verified: true,
      isActive: true,
    },
  };

  if (params.specialization) {
    where.profile.specializations = { has: params.specialization };
  }

  if (params.priceMin || params.priceMax) {
    where.profile.price = {};
    if (params.priceMin) where.profile.price.gte = parseInt(params.priceMin) * 100;
    if (params.priceMax) where.profile.price.lte = parseInt(params.priceMax) * 100;
  }

  if (params.rating) {
    where.profile.rating = { gte: parseFloat(params.rating) };
  }

  const [psychologists, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { profile: true },
      orderBy: [{ profile: { isOnline: 'desc' } }, { profile: { rating: 'desc' } }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { psychologists, total, page, pageSize };
}

export default async function PsychologistsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { psychologists, total, page, pageSize } = await getPsychologists(params);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Найти психолога</h1>
        <p className="text-gray-600">Найдено {total} специалистов</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Специализация</label>
              <select
                name="specialization"
                defaultValue={params.specialization}
                className="h-10 w-full rounded-lg border px-3"
              >
                <option value="">Все</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Цена от</label>
              <Input
                type="number"
                name="priceMin"
                placeholder="от 1000"
                defaultValue={params.priceMin}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Цена до</label>
              <Input
                type="number"
                name="priceMax"
                placeholder="до 10000"
                defaultValue={params.priceMax}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Рейтинг от</label>
              <select
                name="rating"
                defaultValue={params.rating}
                className="h-10 w-full rounded-lg border px-3"
              >
                <option value="">Любой</option>
                <option value="4.5">4.5+</option>
                <option value="4">4+</option>
                <option value="3">3+</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Применить
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {psychologists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">По вашему запросу не найдено психологов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {psychologists.map((psy) => (
            <PsychologistCard key={psy.id} psychologist={psy} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={{
                pathname: '/dashboard/client/psychologists',
                query: { ...params, page: i + 1 },
              }}
            >
              <Button variant={page === i + 1 ? 'primary' : 'outline'} size="sm">
                {i + 1}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PsychologistCard({ psychologist }: { psychologist: any }) {
  const profile = psychologist.profile;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="relative p-6">
          {profile?.isOnline && (
            <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Онлайн
            </span>
          )}
          <div className="flex items-start gap-4">
            <Avatar
              src={profile?.avatar}
              firstName={profile?.firstName || ''}
              lastName={profile?.lastName || ''}
              size="xl"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </h3>
              {profile?.rating && (
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({profile.reviewsCount} отзывов)</span>
                </div>
              )}
              {profile?.experience && (
                <p className="mt-1 text-sm text-gray-500">Опыт: {profile.experience} лет</p>
              )}
            </div>
          </div>

          {profile?.bio && (
            <p className="mt-4 line-clamp-2 text-sm text-gray-600">{profile.bio}</p>
          )}

          {profile?.specializations && profile.specializations.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.specializations.slice(0, 3).map((spec: string) => (
                <Badge key={spec} variant="secondary">
                  {spec}
                </Badge>
              ))}
              {profile.specializations.length > 3 && (
                <Badge variant="outline">+{profile.specializations.length - 3}</Badge>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">Консультация</p>
              <p className="text-lg font-bold text-primary-600">
                {profile?.price ? formatPrice(profile.price) : 'По договорённости'}
              </p>
            </div>
            <Link href={`/psychologists/${psychologist.id}`}>
              <Button>Подробнее</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
