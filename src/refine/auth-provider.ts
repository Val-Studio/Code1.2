import type { AuthProvider } from '@refinedev/core';
import { signIn, signOut, getSession } from 'next-auth/react';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return {
          success: false,
          error: {
            name: 'LoginError',
            message: 'Неверный email или пароль',
          },
        };
      }

      return {
        success: true,
        redirectTo: '/dashboard',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: 'Произошла ошибка при входе',
        },
      };
    }
  },

  logout: async () => {
    await signOut({ redirect: false });
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    const session = await getSession();

    if (session) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: '/login',
    };
  },

  getPermissions: async () => {
    const session = await getSession();
    return session?.user?.role ?? null;
  },

  getIdentity: async () => {
    const session = await getSession();

    if (session?.user) {
      return {
        id: session.user.id,
        name: `${session.user.firstName ?? ''} ${session.user.lastName ?? ''}`.trim() || session.user.email,
        email: session.user.email,
        role: session.user.role,
      };
    }

    return null;
  },

  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return {
        logout: true,
        redirectTo: '/login',
      };
    }

    return { error };
  },

  register: async ({ email, password, firstName, lastName, role }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            name: 'RegisterError',
            message: data.error || 'Ошибка регистрации',
          },
        };
      }

      return {
        success: true,
        redirectTo: '/login',
        successNotification: {
          message: 'Регистрация успешна!',
          description: 'Теперь вы можете войти в систему',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'RegisterError',
          message: 'Произошла ошибка при регистрации',
        },
      };
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            name: 'ForgotPasswordError',
            message: 'Не удалось отправить письмо',
          },
        };
      }

      return {
        success: true,
        successNotification: {
          message: 'Письмо отправлено',
          description: 'Проверьте вашу почту',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'ForgotPasswordError',
          message: 'Произошла ошибка',
        },
      };
    }
  },
};
