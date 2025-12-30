import type { Metadata } from 'next';
import { Providers } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PsyConnect - Онлайн консультации психологов',
    template: '%s | PsyConnect',
  },
  description:
    'Профессиональные психологические консультации онлайн. Найдите своего психолога и начните путь к благополучию.',
  keywords: ['психолог', 'консультация', 'онлайн терапия', 'психотерапия', 'ментальное здоровье'],
  authors: [{ name: 'PsyConnect' }],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'PsyConnect',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
