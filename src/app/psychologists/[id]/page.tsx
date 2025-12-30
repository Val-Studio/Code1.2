import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, Avatar, Badge, Button } from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Star,
  Clock,
  Calendar,
  MessageSquare,
  GraduationCap,
  Award,
  Languages,
  CheckCircle,
} from 'lucide-react';
import { BookingCalendar } from '@/components/booking/booking-calendar';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPsychologist(id: string) {
  const psychologist = await prisma.user.findUnique({
    where: { id, role: 'PSYCHOLOGIST' },
    include: {
      profile: true,
      psychologistSchedules: true,
      psychologistReviews: {
        where: { isApproved: true, isPublic: true },
        include: {
          client: { include: { profile: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  return psychologist;
}

export default async function PsychologistPage({ params }: PageProps) {
  const { id } = await params;
  const [psychologist, session] = await Promise.all([getPsychologist(id), auth()]);

  if (!psychologist || !psychologist.profile) {
    notFound();
  }

  const profile = psychologist.profile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <Avatar
              src={profile.avatar}
              firstName={profile.firstName}
              lastName={profile.lastName}
              size="xl"
              className="h-32 w-32"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Верифицирован
                  </span>
                )}
              </div>

              {profile.rating && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(profile.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({profile.reviewsCount} отзывов)</span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-gray-600">
                {profile.experience && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Опыт {profile.experience} лет
                  </span>
                )}
                {profile.languages && profile.languages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Languages className="h-4 w-4" />
                    {profile.languages.join(', ')}
                  </span>
                )}
              </div>

              {profile.specializations && profile.specializations.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.specializations.map((spec) => (
                    <Badge key={spec}>{spec}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Стоимость консультации</p>
              <p className="text-3xl font-bold text-primary-600">
                {profile.price ? formatPrice(profile.price) : 'По договорённости'}
              </p>
              <p className="text-sm text-gray-500">за 60 минут</p>
              {session ? (
                <Link href={`/dashboard/messages/${psychologist.id}`}>
                  <Button className="mt-4" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Написать
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="mt-4" variant="outline">
                    Войти для связи
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>О специалисте</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-600">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {profile.education && (profile.education as any[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Образование
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(profile.education as any[]).map((edu, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                        <div>
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-sm text-gray-500">
                            {edu.institution}, {edu.year}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Certificates */}
            {profile.certificates && (profile.certificates as any[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Сертификаты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(profile.certificates as any[]).map((cert, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-gray-500">
                            {cert.issuer}, {cert.year}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Отзывы ({profile.reviewsCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {psychologist.psychologistReviews.length === 0 ? (
                  <p className="text-gray-500 py-4 text-center">Пока нет отзывов</p>
                ) : (
                  <div className="space-y-4">
                    {psychologist.psychologistReviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar
                              firstName={review.client.profile?.firstName || ''}
                              lastName={review.client.profile?.lastName || ''}
                              size="sm"
                            />
                            <span className="font-medium">
                              {review.client.profile?.firstName}{' '}
                              {review.client.profile?.lastName?.charAt(0)}.
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="mt-2 text-gray-600">{review.comment}</p>}
                        <p className="mt-2 text-sm text-gray-400">{formatDate(review.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Записаться на приём
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session ? (
                  <BookingCalendar
                    psychologistId={psychologist.id}
                    schedule={psychologist.psychologistSchedules}
                    price={profile.price || 0}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Войдите, чтобы записаться</p>
                    <Link href="/login">
                      <Button>Войти</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
