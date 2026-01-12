'use client';

import { Zap } from 'lucide-react';

export function QuickRequestHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-pink-600">
        <Zap className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quick Borrowing Request</h1>
        <p className="text-muted-foreground">
          Fast borrowing for registered members or walk-in guests
        </p>
      </div>
    </div>
  );
}
