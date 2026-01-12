'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLibraryOperational } from '@/hooks/use-library-operational';

interface OperationalContextType {
  isOperational: boolean;
  isLoading: boolean;
  reason?: string;
  openingTime?: string;
  closingTime?: string;
  nextOpenTime?: string;
  canPerformTransaction: () => boolean;
}

const OperationalContext = createContext<OperationalContextType | undefined>(undefined);

export function OperationalProvider({ children }: { children: ReactNode }) {
  const status = useLibraryOperational();

  const canPerformTransaction = () => {
    return status.isOperational && !status.isLoading;
  };

  return (
    <OperationalContext.Provider value={{ ...status, canPerformTransaction }}>
      {children}
    </OperationalContext.Provider>
  );
}

export function useOperationalStatus() {
  const context = useContext(OperationalContext);
  if (context === undefined) {
    throw new Error('useOperationalStatus must be used within OperationalProvider');
  }
  return context;
}
