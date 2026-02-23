'use client';

import { type ReactNode } from 'react';
import { VariantProvider } from '../../context/VariantContext';
import { AppStateProvider } from '../../context/AppStateContext';
import Navbar from './Navbar';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <VariantProvider>
      <AppStateProvider>
        <Navbar />
        <main className="pt-14">{children}</main>
      </AppStateProvider>
    </VariantProvider>
  );
}
