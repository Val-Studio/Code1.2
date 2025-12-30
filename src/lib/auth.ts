import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';
import type { Role } from '@/types';

declare module 'next-auth' {
  interface User {
    role: Role;
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      firstName?: string;
      lastName?: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
    firstName?: string;
    lastName?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);

        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { profile: true },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.firstName = token.firstName as string | undefined;
      session.user.lastName = token.lastName as string | undefined;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // После входа перенаправляем в соответствующий дашборд
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
});

// Helper to get current user in server components/actions
export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  return user;
}

// Helper to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

// Helper to require specific role
export async function requireRole(role: Role | Role[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}
