'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from './session-provider';
import { RefineProvider } from './refine-provider';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <RefineProvider>
        {children}
        <Toaster position="top-right" richColors />
      </RefineProvider>
    </SessionProvider>
  );
}
