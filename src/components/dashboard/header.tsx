'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Avatar, Button } from '@/components/ui';
import { Bell, Menu, LogOut, Settings, User } from 'lucide-react';
import type { Role } from '@prisma/client';

interface HeaderProps {
  user: {
    id: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const firstName = user.firstName || 'Пользователь';
  const lastName = user.lastName || '';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Mobile menu button */}
      <button className="lg:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
        <Menu className="h-6 w-6" />
      </button>

      {/* Search (hidden on mobile) */}
      <div className="hidden flex-1 lg:block">
        {/* Optional: Add search functionality here */}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link href="/dashboard/notifications" className="relative rounded-lg p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100"
          >
            <Avatar firstName={firstName} lastName={lastName} size="sm" />
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium text-gray-900">
                {firstName} {lastName}
              </p>
              <p className="text-xs text-gray-500">
                {user.role === 'PSYCHOLOGIST' ? 'Психолог' : user.role === 'ADMIN' ? 'Администратор' : 'Клиент'}
              </p>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-white py-1 shadow-lg">
              <div className="border-b px-4 py-3 lg:hidden">
                <p className="font-medium">
                  {firstName} {lastName}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Link
                href="/dashboard/settings/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <User className="h-4 w-4" />
                Профиль
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="h-4 w-4" />
                Настройки
              </Link>
              <hr className="my-1" />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
