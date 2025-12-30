'use client';

import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';
import { type ReactNode } from 'react';
import { dataProvider } from '@/refine/data-provider';
import { authProvider } from '@/refine/auth-provider';
import { resources } from '@/refine/resources';

interface RefineProviderProps {
  children: ReactNode;
}

export function RefineProvider({ children }: RefineProviderProps) {
  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider}
      authProvider={authProvider}
      resources={resources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        reactQuery: {
          clientConfig: {
            defaultOptions: {
              queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                retry: 1,
              },
            },
          },
        },
      }}
    >
      {children}
    </Refine>
  );
}
