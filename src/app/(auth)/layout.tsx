import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white">
          <Brain className="h-8 w-8" />
          PsyConnect
        </Link>
        <div className="text-white">
          <h1 className="mb-4 text-4xl font-bold">Начните свой путь к благополучию</h1>
          <p className="text-lg text-primary-100">
            Тысячи людей уже нашли своего психолога на нашей платформе. Присоединяйтесь!
          </p>
        </div>
        <div className="text-sm text-primary-200">© {new Date().getFullYear()} PsyConnect</div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full flex-col justify-center px-4 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-700">
              <Brain className="h-8 w-8" />
              PsyConnect
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
