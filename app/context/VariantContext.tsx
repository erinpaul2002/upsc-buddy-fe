'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface VariantState {
  variant: number;
  setVariant: (v: number) => void;
}

const VariantContext = createContext<VariantState | null>(null);

export function useVariant() {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error('useVariant must be used within VariantProvider');
  return ctx;
}

export function VariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState(1);
  return (
    <VariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </VariantContext.Provider>
  );
}
